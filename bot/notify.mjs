// ВИАЙПИ РЕСТОБАР КУХНЯ — Telegram-бот уведомлений.
// Запускается GitHub Actions (файл .github/workflows/notify.yml) каждые 5 минут.
// Без зависимостей: нужен только Node 20+. Секреты берутся из переменных окружения, в коде их нет.
//   TG_BOT_TOKEN   — токен от @BotFather            (секрет)
//   BOT_PASSWORD   — пароль пользователя bot@vip.local в Firebase Auth (секрет)
//   CHIEF_USERNAME — Telegram-имя шефа без @       (переменная)
//   TZ_NAME, SHIFT_HOUR, MORNING_HOUR — необязательно (Europe/Moscow, 18, 8)
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const env=process.env;
const TOKEN=env.TG_BOT_TOKEN||'',BOT_PW=env.BOT_PASSWORD||'',BOT_EMAIL=env.BOT_EMAIL||'bot@vip.local';
const CHIEF_U=String(env.CHIEF_USERNAME||'').replace(/^@+/,'').trim().toLowerCase();
const CHIEF_N=String(env.CHIEF_NAME||'хоссам').trim().toLowerCase();
const TZ=env.TZ_NAME||'Europe/Moscow',SHIFT_H=+(env.SHIFT_HOUR||18),MORN_H=+(env.MORNING_HOUR||8);
const TG_BASE=env.TG_BASE||'https://api.telegram.org',AUTH_URL=env.FB_AUTH_URL||'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';
const cfgPath=env.CONFIG_PATH||fileURLToPath(new URL('../config.js',import.meta.url));
const NOW=()=>env.FAKE_NOW?Number(env.FAKE_NOW):Date.now();   // FAKE_NOW — только для тестов
const WDS=['вс','пн','вт','ср','чт','пт','сб'];
const log=(...a)=>console.log(new Date().toISOString(),...a);

// ---------- конфиг приложения (публичный config.js из репозитория) ----------
function readConfig(){const w={};try{new vm.Script(readFileSync(cfgPath,'utf8')).runInNewContext({window:w})}catch(e){throw new Error('config.js не прочитан: '+e.message)}
 const c=w.CONFIG||{};if(!c.apiKey||!(c.projectId||c.dbUrl))throw new Error('В config.js нет apiKey/projectId');
 return{apiKey:c.apiKey,db:String(env.FB_DB||c.dbUrl||`https://${c.projectId}-default-rtdb.firebaseio.com`).replace(/\/+$/,'')}}

// ---------- Firebase REST ----------
let CFG,IDT='';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function login(){const r=await fetch(`${AUTH_URL}?key=${encodeURIComponent(CFG.apiKey)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:BOT_EMAIL,password:BOT_PW,returnSecureToken:true})});
 const j=await r.json().catch(()=>({}));if(!r.ok||!j.idToken)throw new Error('Вход бота в Firebase не удался: '+((j.error&&j.error.message)||r.status));IDT=j.idToken}
async function db(m,p,body,q){const qs=[q||'','auth='+IDT].filter(Boolean).join('&');const r=await fetch(`${CFG.db}/${p}.json?${qs}`,{method:m,headers:body!==undefined?{'Content-Type':'application/json'}:undefined,body:body!==undefined?JSON.stringify(body):undefined});
 if(!r.ok){const e=new Error(`Firebase ${m} ${p}: ${r.status}`);e.status=r.status;throw e}return r.status===204?null:await r.json()}
const get=(p,q)=>db('GET',p,undefined,q),put=(p,v)=>db('PUT',p,v),del=p=>db('DELETE',p);
const safe=async(p,d)=>{try{return(await get(p))??d}catch(e){log('read fail',p,e.message);return d}};

// ---------- Telegram ----------
async function tg(method,body){for(let i=0;i<2;i++){let r,j;try{r=await fetch(`${TG_BASE}/bot${TOKEN}/${method}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})});j=await r.json().catch(()=>({}))}catch(e){return{ok:false,description:String(e.message)}}
 if(r.status===429&&i===0){await sleep(Math.min(8,+((j.parameters||{}).retry_after||2))*1000);continue}return j}}
const H=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let GROUP=null;
async function send(chat,text,extra){const r=await tg('sendMessage',{chat_id:chat,text:String(text).slice(0,3900),parse_mode:'HTML',disable_web_page_preview:true,...extra});
 if(!r.ok&&r.parameters&&r.parameters.migrate_to_chat_id&&GROUP&&String(GROUP.id)===String(chat)){GROUP.id=r.parameters.migrate_to_chat_id;await put('contacts/group',GROUP);return send(GROUP.id,text,extra)}
 if(!r.ok)log('send fail',chat,r.description);return!!r.ok}

// ---------- даты ----------
const dtf=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'});
const parts=(ms=NOW())=>{const p={};for(const x of dtf.formatToParts(new Date(ms)))p[x.type]=x.value;return{date:`${p.year}-${p.month}-${p.day}`,hour:+p.hour}};
const addDays=(ds,n)=>{const d=new Date(ds+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const dayL=ds=>{const[y,m,d]=ds.split('-').map(Number);return`${WDS[new Date(Date.UTC(y,m-1,d,12)).getUTCDay()]}, ${String(d).padStart(2,'0')}.${String(m).padStart(2,'0')}`};
const okTm=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h.toString(36)};

// ---------- команда ----------
const isWork=s=>s===true||s==='Р'||!!(s&&(s.work||s.r==='Р'||s.f||s.t));
let TEAM=[],CHIEF_ID='chef-hossam',CH={},PH={};
function buildTeam(raw){const a=Object.entries(raw||{}).filter(([,v])=>v&&typeof v==='object').map(([id,v])=>({id,n:String(v.n||''),r:String(v.r||''),u:String(v.u||'').replace(/^@+/,'')}));
 const c=a.find(x=>x.n.trim().toLowerCase()===CHIEF_N);if(c)CHIEF_ID=c.id;else a.push({id:CHIEF_ID,n:'Хоссам',r:'Шеф',u:''});return a}
const cookBy=id=>TEAM.find(x=>x.id===id);
const isChiefUser=u=>!!(CHIEF_U&&u&&String(u.username||'').toLowerCase()===CHIEF_U);
const chatOf=id=>Object.entries(CH).filter(([,v])=>v&&v.k===id).map(([tid])=>tid);
const chiefChat=()=>chatOf(CHIEF_ID)[0]||null;
const dispName=u=>[u.first_name,u.last_name].filter(Boolean).join(' ')||u.username||String(u.id);
const mention=id=>{const c=cookBy(id),t=chatOf(id)[0],u=t&&CH[t]&&CH[t].u;return c?(u?`${H(c.n)} (@${H(u)})`:H(c.n)):'?'};

// смена на дату — то же правило, что в приложении: shifts/<дата> или график sched + время из shifts/_last.
// Читаем только нужные пути (не весь sched/shifts): бот запускается каждые 5 минут, экономим трафик Firebase.
async function shiftsOn(date){const hide=!!(await safe('shifts/_hide/'+date,null)),own=await safe('shifts/'+date,null);
 if(own&&typeof own==='object'&&Object.values(own).some(v=>v!==undefined&&v!==null))return{map:own,hide};
 const m={};
 const rows=await Promise.all(TEAM.map(async c=>[c,await safe(`sched/${c.id}/${date}`,null)]));
 rows.forEach(([c,v])=>{if(isWork(v))m[c.id]=''});return{map:m,hide}}

// банкеты — упрощённая копия bqCalc из приложения
function banquets(m,ds){m=m&&typeof m==='object'?m:{};ds=ds&&typeof ds==='object'?ds:{};const gn=v=>{const g=Math.round(Number(v));return g>0&&g<=1e5?g:0},mk=(id,v)=>({id,title:String(v.title||''),guests:gn(v.guests),time:okTm(v.time)?v.time:'',place:String(v.place||''),note:String(v.note||'')}),
 out=[],seen=new Set(),dishes=Object.values(ds).filter(t=>t&&t.t&&t.g==='banq');
 if(['title','time','place','note'].some(k=>m[k])||dishes.some(t=>!t.bq)){out.push(mk('0',m));seen.add('0')}
 Object.entries(m.b&&typeof m.b==='object'?m.b:{}).forEach(([id,v])=>{if(v&&typeof v==='object'&&!seen.has(id)){out.push(mk(id,v));seen.add(id)}});
 dishes.forEach(t=>{const id=String(t.bq||'0');if(!seen.has(id)){seen.add(id);out.push(mk(id,{}))}});
 return out.sort((a,b)=>(a.time?a.time:'99:99')<(b.time?b.time:'99:99')?-1:1)}

// ---------- привязка Telegram ↔ повар ----------
async function bind(from,cookId){const c=cookBy(cookId);if(!c)return{ok:false,why:'Такого повара нет в списке.'};
 if(c.id===CHIEF_ID&&!isChiefUser(from))return{ok:false,why:'Это имя шефа: подключиться может только он.'};
 const old=CH[String(from.id)];const rec={k:c.id,n:dispName(from),...(from.username?{u:from.username}:{}),t:NOW()};await put('contacts/chats/'+from.id,rec);CH[String(from.id)]=rec;
 if(!old||old.k!==c.id){const cc=chiefChat();if(cc&&String(cc)!==String(from.id))await send(cc,`✈️ <b>${H(c.n)}</b> подключил(а) Telegram${from.username?' (@'+H(from.username)+')':''}`)}
 return{ok:true,cook:c}}
const contactKb={keyboard:[[{text:'📱 Отправить мой номер',request_contact:true}]],resize_keyboard:true,one_time_keyboard:true};
async function afterBind(chat,c,from){const has=(PH[c.id]||'');await send(chat,`✅ Вы подключены как <b>${H(c.n)}</b>.\nТеперь здесь будут уведомления. Команды: /smena — моя смена завтра, /phone — номер телефона, /stop — отключить.\nМожно написать мне сообщение — оно сразу уйдёт шефу.`,has?undefined:{reply_markup:contactKb})}
function pickKb(from){const list=TEAM.filter(c=>c.id!==CHIEF_ID||isChiefUser(from));const rows=[];for(let i=0;i<list.length;i+=2)rows.push(list.slice(i,i+2).map(c=>({text:c.n,callback_data:('b:'+c.id).slice(0,64)})));return{inline_keyboard:rows}}

async function onPrivate(m,S){const from=m.from||{},chat=m.chat.id,txt=String(m.text||'').trim(),mine=CH[String(from.id)];
 if(m.contact){if(!mine){await send(chat,'Выберите своё имя:',{reply_markup:pickKb(from)});return}
  if(m.contact.user_id!==from.id){await send(chat,'Отправьте именно свой номер: кнопка «📱 Отправить мой номер».');return}
  const ph='+'+String(m.contact.phone_number||'').replace(/\D/g,'');if(ph.length<6){await send(chat,'Не удалось прочитать номер.');return}
  await put('contacts/phones/'+mine.k,ph.slice(0,24));PH[mine.k]=ph;await send(chat,'✅ Номер сохранён.',{reply_markup:{remove_keyboard:true}});return}
 const cmd=/^\/(\w+)(?:@\w+)?(?:\s+(.*))?$/.exec(txt);
 if(cmd){const c=cmd[1].toLowerCase(),arg=(cmd[2]||'').trim();
  if(c==='start'){const pm=/^c_([A-Za-z0-9_-]{1,60})$/.exec(arg);
   if(pm&&cookBy(pm[1])){const r=await bind(from,pm[1]);if(r.ok)await afterBind(chat,r.cook,from);else await send(chat,H(r.why));return}
   if(mine&&cookBy(mine.k)){await send(chat,`Вы уже подключены как <b>${H(cookBy(mine.k).n)}</b>. /stop — отключить.`);return}
   if(isChiefUser(from)){const r=await bind(from,CHIEF_ID);if(r.ok)await afterBind(chat,r.cook,from);return}
   const au=from.username&&TEAM.find(x=>x.u&&x.u.toLowerCase()===from.username.toLowerCase());
   if(au){const r=await bind(from,au.id);if(r.ok)await afterBind(chat,r.cook,from);return}
   await send(chat,'Здравствуйте! Выберите своё имя:',{reply_markup:pickKb(from)});return}
  if(c==='stop'){if(mine){await del('contacts/chats/'+from.id);delete CH[String(from.id)]}await send(chat,'Отключено. Чтобы подключиться снова, напишите мне любое сообщение.',{reply_markup:{remove_keyboard:true}});return}
  if(!mine){await send(chat,'Выберите своё имя:',{reply_markup:pickKb(from)});return}
  if(c==='phone'){await send(chat,'Нажмите кнопку, чтобы отправить номер шефу:',{reply_markup:contactKb});return}
  if(c==='smena'||c==='shift'){const tom=addDays(parts().date,1),s=await shiftsOn(tom),has=Object.prototype.hasOwnProperty.call(s.map,mine.k);
   await send(chat,has?`⏰ Завтра (${dayL(tom)}) вы на смене${s.map[mine.k]&&!s.hide?': <b>'+H(s.map[mine.k])+'</b>':''}.`:`Завтра (${dayL(tom)}) вас в графике нет.`);return}
  if(c==='me'||c==='help'){await send(chat,`Вы: <b>${H(cookBy(mine.k)?cookBy(mine.k).n:'?')}</b>${PH[mine.k]?'\nТелефон: '+H(PH[mine.k]):''}\n/smena — смена завтра\n/phone — номер телефона\n/stop — отключить`);return}
  return}
 if(!txt)return;
 if(!mine){await send(chat,'Здравствуйте! Выберите своё имя, тогда я смогу передать сообщение шефу:',{reply_markup:pickKb(from)});return}
 const t=NOW(),rec={k:mine.k,n:(cookBy(mine.k)||{}).n||mine.n,tid:String(from.id),x:txt.slice(0,500),t};await put(`contacts/inbox/${t}_${from.id}`,rec);
 const cc=chiefChat();if(cc&&String(cc)!==String(from.id))await send(cc,`✉️ <b>${H(rec.n)}</b>:\n${H(rec.x)}`);
 await send(chat,'✓ Передал шефу.')}

async function onGroup(m){const from=m.from||{},txt=String(m.text||'');if(/^\/group(@\w+)?(\s|$)/i.test(txt)){
  if(!CHIEF_U){await send(m.chat.id,'В настройках GitHub не задана переменная CHIEF_USERNAME (Telegram-имя шефа). См. BOT-AR.md.');return}
  if(!isChiefUser(from)){await send(m.chat.id,'Подключить группу может только шеф.');return}
  GROUP={id:m.chat.id,n:String(m.chat.title||'группа').slice(0,60),t:NOW()};await put('contacts/group',GROUP);await send(m.chat.id,'✅ Группа подключена: сюда будут приходить уведомления.')}}

async function onMyChat(u){const c=u.chat||{},nw=u.new_chat_member||{},from=u.from||{};if(c.type==='private')return;
 const gone=['left','kicked'].includes(nw.status),here=['member','administrator'].includes(nw.status);
 if(gone&&GROUP&&String(GROUP.id)===String(c.id)){await del('contacts/group');GROUP=null;return}
 if(here){if(isChiefUser(from)){GROUP={id:c.id,n:String(c.title||'группа').slice(0,60),t:NOW()};await put('contacts/group',GROUP);await send(c.id,'✅ Группа подключена: сюда будут приходить уведомления.')}
  else await send(c.id,'Чтобы подключить эту группу, шеф должен написать здесь /group')}}

async function onCallback(q){const from=q.from||{},d=String(q.data||''),pm=/^b:(.+)$/.exec(d);if(!pm)return;const r=await bind(from,pm[1]);
 await tg('answerCallbackQuery',{callback_query_id:q.id,text:r.ok?'Готово':String(r.why||'Ошибка').slice(0,150)});
 if(r.ok&&q.message){await tg('editMessageText',{chat_id:q.message.chat.id,message_id:q.message.message_id,text:'✅ Подключено: '+r.cook.n});await afterBind(q.message.chat.id,r.cook,from)}}

async function pollUpdates(S,C){let off=Number(C.offset)||0,n=0;for(let round=0;round<5;round++){
  const r=await tg('getUpdates',{offset:off||undefined,limit:100,timeout:0,allowed_updates:['message','my_chat_member','callback_query']});
  if(!r.ok){log('getUpdates',r.description);throw new Error('Telegram getUpdates: '+(r.description||'нет ответа'))}
  const us=r.result||[];if(!us.length)break;
  for(const u of us){off=u.update_id+1;n++;try{if(u.message){const m=u.message;if(m.chat.type==='private')await onPrivate(m,S);else await onGroup(m)}else if(u.my_chat_member)await onMyChat(u.my_chat_member);else if(u.callback_query)await onCallback(u.callback_query)}catch(e){log('update fail',u.update_id,e.message)}}
  await put('contacts/offset',off);if(us.length<100)break}
 return n}

// ---------- события ----------
const sentRef={};
async function mark(key,val){sentRef[key]=val;await put('notify/sent/'+key,val)}
async function toGroupOrDm(text,fallbackIds){if(GROUP&&GROUP.id)return send(GROUP.id,text);let ok=false;for(const id of fallbackIds||[]){for(const t of chatOf(id))ok=(await send(t,text))||ok}return ok}

async function evShifts(S,now,cfg){if(cfg.sh===0||now.hour<SHIFT_H)return;const prevK='sh_'+addDays(now.date,1),pv=sentRef[prevK];if(pv&&NOW()-pv.t<36e5)return;
 const tom=addDays(now.date,1),s=await shiftsOn(tom),ids=Object.keys(s.map).filter(id=>cookBy(id));if(!ids.length)return;
 const lines=ids.sort((a,b)=>cookBy(a).n.localeCompare(cookBy(b).n,'ru')).map(id=>`• ${mention(id)}${s.map[id]&&!s.hide?' — <b>'+H(s.map[id])+'</b>':''}`),sig=hash(lines.join('|')),key='sh_'+tom,prev=sentRef[key];
 if(prev&&prev.h===sig)return;if(prev&&NOW()-prev.t<36e5)return;
 const head=prev?`🔄 Смена на завтра изменилась (${dayL(tom)}):`:`⏰ Завтра на смене (${dayL(tom)}):`;
 if(await toGroupOrDm(`${head}\n${lines.join('\n')}`,ids))await mark(key,{t:NOW(),h:sig})}

async function evBanq(S,now,cfg){if(cfg.bq===0)return;const jobs=[];if(now.hour>=MORN_H)jobs.push([now.date,'today','Сегодня']);if(now.hour>=SHIFT_H)jobs.push([addDays(now.date,1),'tom','Завтра']);
 for(const[d,tag,lbl]of jobs){const[pm,pr]=await Promise.all([safe('prepMeta/'+d,null),safe('prep/'+d,null)]);for(const b of banquets(pm,pr)){const line=[b.title?'<b>'+H(b.title)+'</b>':'<b>Банкет</b>',b.time?'🕒 '+b.time:'',b.guests?'👥 '+b.guests+' гост.':'',b.place?'📍 '+H(b.place):''].filter(Boolean).join(' · ');
   const sig=hash(line+'|'+b.note),key=`bq_${d}_${b.id}_${tag}`,prev=sentRef[key];if(prev&&prev.h===sig)continue;if(prev&&NOW()-prev.t<36e5)continue;
   const txt=`${prev?'🔄 Банкет изменился':'🎉 '+lbl+' банкет'} (${dayL(d)})\n${line}${b.note?'\n📝 '+H(b.note):''}`;
   if(await toGroupOrDm(txt,TEAM.map(c=>c.id)))await mark(key,{t:NOW(),h:sig})}}}

async function evOrders(S,now,cfg){
 const q=await get('orders','orderBy="created"&limitToLast=10').catch(e=>{log('orders',e.message);return null});if(!q)return;
 const list=Object.values(q).filter(x=>x&&x.id&&x.copied===true&&x.cook).sort((a,b)=>a.created-b.created);
 for(const x of list){const key='od_'+x.id;if(sentRef[key])continue;
  const old=NOW()-(x.updated||x.created||0)>45*6e4;if(old||cfg.od===0){await mark(key,{t:NOW(),s:1});continue}
  const items=(Array.isArray(x.items)?x.items:Object.values(x.items||{})).filter(i=>i&&i.n),shown=items.slice(0,15).map(i=>`• ${H(i.n)} — ${H(String(i.qty).replace('.',','))} ${H(i.u||'')}${i.urg?' 🚨':''}`).join('\n');
  const txt=`🧾 <b>Заказ на ${H(x.date?dayL(x.date):'?')}</b> · ${H(x.cook.n||'?')}\n${items.length} поз.${x.note?' · 📝 '+H(String(x.note).slice(0,120)):''}\n${shown}${items.length>15?'\n… и ещё '+(items.length-15):''}`;
  if(await toGroupOrDm(txt,[]))await mark(key,{t:NOW()})}}

async function evAlerts(S,now,cfg){if(cfg.al===0)return;const cc=chiefChat();if(!cc)return;const T=NOW(),flags=[];
 // ошибки приложения
 const heavy=T-(sentRef.heavyP||0)>18e5;let errs=[];if(heavy){await mark('heavyP',T);const el=await safe('errlog',null);if(el&&typeof el==='object')for(const[dv,es]of Object.entries(el))if(es&&typeof es==='object')for(const e of Object.values(es))if(e&&e.t&&e.m)errs.push({...e,dv})}
 const lastE=sentRef.errT;if(lastE===undefined){await mark('errT',T)}else if(heavy){const nw=errs.filter(e=>e.t>lastE).sort((a,b)=>a.t-b.t);
  if(nw.length&&T-(sentRef.errA||0)>36e5){const grp={};for(const e of nw){const k=String(e.m).slice(0,100)+'|'+(e.s||''),g=grp[k]||(grp[k]={e,n:0,v:new Set(),d:new Set()});g.n+=Number(e.n)||1;if(e.v)g.v.add(e.v);g.d.add(e.dv)}
    const gl=Object.values(grp).sort((x,y)=>y.n-x.n),rows=gl.slice(0,4).map(g=>`• ${H(String(g.e.m).slice(0,140))}${g.e.s?' · '+H(String(g.e.s).slice(0,40)):''} · ${[...g.v].map(x=>'v'+H(x)).join(', ')||'v?'} · ×${g.n} · ${g.d.size} тел.`);
    if(await send(cc,`⚠ <b>Ошибки в приложении:</b> ${nw.length} нов.\n${rows.join('\n')}${gl.length>4?'\n… и ещё видов: '+(gl.length-4):''}`)){await mark('errT',T);await mark('errA',T)}}}
 // резервная копия
 const bk=now.hour>=MORN_H?Number(await safe('plan/cfg/bk',0))||0:0;if(now.hour>=MORN_H&&(!bk||T-bk>7*864e5)&&T-(sentRef.bkA||0)>864e5){if(await send(cc,bk?`💾 Резервная копия не делалась ${Math.floor((T-bk)/864e5)} дн. Приложение → Админ → Данные и копия.`:'💾 Резервная копия ещё не делалась. Приложение → Админ → Данные и копия.'))await mark('bkA',T)}
 // телефоны с неотправленными записями

 const dv=heavy?await safe('devices',null):null;if(dv&&typeof dv==='object')for(const[id,v]of Object.entries(dv)){if(!v||!(v.q>0)||T-v.t<72e5||T-v.t>3*864e5)continue;const key='dq_'+id;if(sentRef[key]&&T-sentRef[key]<864e5)continue;
  const nm=v.c&&v.c.n?v.c.n:'Неизвестный телефон';if(await send(cc,`⚠ У <b>${H(nm)}</b> (${H(v.u||'?')}) ${v.q} неотправл. изменений. Пусть откроет приложение с интернетом.`))await mark(key,T)}}

async function runOutbox(ob){if(!ob||typeof ob!=='object')return 0;let n=0;for(const[id,m]of Object.entries(ob)){if(!m||typeof m!=='object'||!m.x){await del('notify/outbox/'+id);continue}
  const text=H(String(m.x).slice(0,900));let ok=false;
  if(m.to==='group'){ok=GROUP&&GROUP.id?await send(GROUP.id,'📣 '+text):false;if(!ok){const cc=chiefChat();if(cc)await send(cc,'⚠ Сообщение не ушло в группу (группа не подключена):\n'+text)}}
  else if(m.to==='chief'){const cc=chiefChat();ok=cc?await send(cc,text):false}
  else{for(const t of chatOf(String(m.to)))ok=(await send(t,'📣 '+text))||ok}
  await del('notify/outbox/'+id);n++}return n}

// ---------- главный проход ----------
async function main(){if(!TOKEN||!BOT_PW)throw new Error('Нет секретов TG_BOT_TOKEN / BOT_PASSWORD');CFG=readConfig();await login();
 const me=await tg('getMe');if(!me.ok)throw new Error('Telegram getMe: '+(me.description||'нет ответа'));const botName=me.result.username;
 const[team,chats,phones,group,offset,N]=await Promise.all([safe('team',{}),safe('contacts/chats',{}),safe('contacts/phones',{}),safe('contacts/group',null),safe('contacts/offset',0),safe('notify',{})]);
 TEAM=buildTeam(team);CH=chats||{};PH=phones||{};GROUP=group&&group.id?group:null;Object.assign(sentRef,N.sent||{});
 const S={},C={offset},cfg=N.cfg||{},now=parts();
 const upd=await pollUpdates(S,C);
 const ob=await runOutbox(N.outbox);
 await evShifts(S,now,cfg);await evBanq(S,now,cfg);await evOrders(S,now,cfg);await evAlerts(S,now,cfg);
 // чистка: журнал отправленного старше 10 дней, переписка — не более 200 записей
 const T=NOW();for(const[k,v]of Object.entries(sentRef)){const t=typeof v==='number'?v:(v&&v.t)||0;if(/^(sh_|bq_|od_|dq_)/.test(k)&&t&&T-t>10*864e5)await del('notify/sent/'+k).catch(()=>{})}
 if(T-(sentRef.inbP||0)>864e5){await mark('inbP',T);const inb=await safe('contacts/inbox',null);if(inb&&Object.keys(inb).length>200){const ks=Object.keys(inb).sort();for(const k of ks.slice(0,ks.length-150))await del('contacts/inbox/'+k).catch(()=>{})}}
 await put('notify/info',{bot:botName,t:NOW(),g:GROUP&&GROUP.id?1:0,v:1});await del('notify/err').catch(()=>{});
 log(`ok: updates=${upd} outbox=${ob} bot=@${botName}`)}

main().catch(async e=>{console.error('ОШИБКА:',e.message);try{if(IDT)await put('notify/err',{t:NOW(),m:String(e.message).slice(0,200)})}catch{}process.exit(1)});
