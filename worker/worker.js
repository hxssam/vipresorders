// ВИАЙПИ РЕСТОБАР КУХНЯ — Telegram-бот на Cloudflare Workers (бесплатный тариф).
// Заменяет GitHub Actions: cron раз в минуту + мгновенный Webhook Telegram + «толчок» /poke из приложения.
// Без зависимостей. Секреты задаются в настройках Worker (в коде их нет):
//   TG_BOT_TOKEN   — токен от @BotFather                               (Secret)
//   BOT_PASSWORD   — пароль пользователя bot@vip.local в Firebase Auth (Secret)
//   CHIEF_USERNAME — Telegram-имя шефа без @                           (Text)
//   TZ_NAME, SHIFT_HOUR, MORNING_HOUR — необязательно (Europe/Moscow, 18, 8)
// Адреса:  /setup — настройка и проверка (открыть один раз) · /tg — Webhook Telegram · /poke — «толчок» из приложения.

const FB_KEY='AIzaSyCxQD7xmm63Dv13eSsZSN7tYFAMj9l6Rsk',FB_PROJECT='viprestobarfakaz';   // публичные данные из config.js приложения
const WDS=['вс','пн','вт','ср','чт','пт','сб'];
const H=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const addDays=(ds,n)=>{const d=new Date(ds+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const dayL=ds=>{const[y,m,d]=ds.split('-').map(Number);return`${WDS[new Date(Date.UTC(y,m-1,d,12)).getUTCDay()]}, ${String(d).padStart(2,'0')}.${String(m).padStart(2,'0')}`};
const okTm=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h.toString(36)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const DTF={};const dtfOf=tz=>DTF[tz]||(DTF[tz]=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}));
const TOK={k:'',v:'',t:0};
const PT={k:'',v:'',t:0},PTW={n:0};   // вход в сайт предзаказов — тоже переиспользуется между запусками   // вход бота в Firebase живёт ~50 минут и переиспользуется между запусками, пока жив isolate
const isWork=s=>s===true||s==='Р'||!!(s&&(s.work||s.r==='Р'||s.f||s.t));

// банкеты — упрощённая копия bqCalc из приложения
function banquets(m,ds){m=m&&typeof m==='object'?m:{};ds=ds&&typeof ds==='object'?ds:{};const gn=v=>{const g=Math.round(Number(v));return g>0&&g<=1e5?g:0},mk=(id,v)=>({id,title:String(v.title||''),guests:gn(v.guests),time:okTm(v.time)?v.time:'',place:String(v.place||''),note:String(v.note||'')}),
 out=[],seen=new Set(),dishes=Object.values(ds).filter(t=>t&&t.t&&t.g==='banq');
 if(['title','time','place','note'].some(k=>m[k])||dishes.some(t=>!t.bq)){out.push(mk('0',m));seen.add('0')}
 Object.entries(m.b&&typeof m.b==='object'?m.b:{}).forEach(([id,v])=>{if(v&&typeof v==='object'&&!seen.has(id)){out.push(mk(id,v));seen.add(id)}});
 dishes.forEach(t=>{const id=String(t.bq||'0');if(!seen.has(id)){seen.add(id);out.push(mk(id,{}))}});
 return out.sort((a,b)=>(a.time?a.time:'99:99')<(b.time?b.time:'99:99')?-1:1)}

// Всё состояние — внутри makeBot: каждый вызов Worker получает своё, параллельные запуски не мешают друг другу.
function makeBot(env){
 const TOKEN=String(env.TG_BOT_TOKEN||''),BOT_PW=String(env.BOT_PASSWORD||''),BOT_EMAIL=String(env.BOT_EMAIL||'bot@vip.local');
 const CHIEF_U=String(env.CHIEF_USERNAME||'').replace(/^@+/,'').trim().toLowerCase(),CHIEF_N=String(env.CHIEF_NAME||'хоссам').trim().toLowerCase();
 const TZ=env.TZ_NAME||'Europe/Moscow',SHIFT_H=+(env.SHIFT_HOUR||18),MORN_H=+(env.MORNING_HOUR||8);
 const KEY=String(env.FB_API_KEY||FB_KEY),DBU=String(env.FB_DB||`https://${env.FB_PROJECT||FB_PROJECT}-default-rtdb.firebaseio.com`).replace(/\/+$/,'');
 const NOW=()=>env.FAKE_NOW?Number(env.FAKE_NOW):Date.now();   // FAKE_NOW — только для тестов
 const log=(...a)=>console.log(...a);
 // Бесплатный тариф Cloudflare: не больше 50 внешних запросов за один запуск. Считаем их и не берёмся за необязательное, когда запас на исходе.
 const REQ={n:0},LIMIT=44,bud=()=>{const e=new Error('исчерпан лимит запросов Cloudflare (50)');e.budget=1;return e},sub=(u,o)=>{if(REQ.n>=49)throw bud();REQ.n++;return fetch(u,o)},room=k=>REQ.n+k<=LIMIT;
 let IDT='',RL=0,TEAM=[],CHIEF_ID='chef-hossam',CH={},PH={},GROUP=null,N={};const sentRef={};

 // ---------- Firebase REST ----------
 async function login(){const ck=BOT_EMAIL+'|'+hash(BOT_PW),T=Date.now();if(TOK.k===ck&&TOK.t>T){IDT=TOK.v;return}
  const r=await sub(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(KEY)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:BOT_EMAIL,password:BOT_PW,returnSecureToken:true})});
  const j=await r.json().catch(()=>({}));if(!r.ok||!j.idToken)throw new Error('Вход бота в Firebase не удался: '+((j.error&&j.error.message)||r.status));
  IDT=j.idToken;TOK.k=ck;TOK.v=IDT;TOK.t=T+Math.max(120,(+j.expiresIn||3600)-600)*1000}
 async function db(m,p,body,q){const qs=[q||'','auth='+IDT].filter(Boolean).join('&');const r=await sub(`${DBU}/${p}.json?${qs}`,{method:m,headers:body!==undefined?{'Content-Type':'application/json'}:undefined,body:body!==undefined?JSON.stringify(body):undefined});
  if(r.status===401&&!RL){RL=1;TOK.t=0;await login();return db(m,p,body,q)}
  if(!r.ok){const e=new Error(`Firebase ${m} ${p}: ${r.status}`);e.status=r.status;throw e}return r.status===204?null:await r.json()}
 const get=(p,q)=>db('GET',p,undefined,q),put=(p,v)=>db('PUT',p,v),del=p=>db('DELETE',p);
 const safe=async(p,d)=>{try{return(await get(p))??d}catch(e){if(e&&e.budget)throw e;log('read fail',p,e.message);return d}};
 async function raw(m,p,body,hd){const r=await sub(`${DBU}/${p}.json?auth=${IDT}`,{method:m,headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...hd},body:body!==undefined?JSON.stringify(body):undefined});
  if(r.status===401&&!RL){RL=1;TOK.t=0;await login();return raw(m,p,body,hd)}return r}
 // Атомарно «занять» отметку: Firebase пишет, только если её ещё нет (if-match: null_etag). 412 = её уже занял другой проход — дубля не будет.
 async function claim(key,val){const r=await raw('PUT','notify/sent/'+key,val,{'if-match':'null_etag'});if(r.status===412)return false;if(!r.ok)await put('notify/sent/'+key,val);sentRef[key]=val;return true}
 // Атомарно забрать запись очереди: читаем с ETag и удаляем, только если она не менялась и ещё на месте.
 async function take(p){const r=await raw('GET',p,undefined,{'X-Firebase-ETag':'true'});if(!r.ok)return undefined;const et=r.headers.get('etag'),v=await r.json();if(v===null)return null;
  const d=await raw('DELETE',p,undefined,et?{'if-match':et}:{});if(d.status===412)return null;if(!d.ok)throw new Error(`Firebase DELETE ${p}: ${d.status}`);return v}

 // ---------- Telegram ----------
 async function tg(method,body){for(let i=0;i<2;i++){let r,j;try{r=await sub(`https://api.telegram.org/bot${TOKEN}/${method}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})});j=await r.json().catch(()=>({}))}catch(e){return{ok:false,description:String(e.message)}}
  if(r.status===429&&i===0&&room(6)){await sleep(Math.min(4,+((j.parameters||{}).retry_after||2))*1000);continue}return j}}
 async function send(chat,text,extra){const r=await tg('sendMessage',{chat_id:chat,text:String(text).slice(0,3900),parse_mode:'HTML',disable_web_page_preview:true,...extra});
  if(!r.ok&&r.parameters&&r.parameters.migrate_to_chat_id&&GROUP&&String(GROUP.id)===String(chat)){GROUP.id=r.parameters.migrate_to_chat_id;await put('contacts/group',GROUP);return send(GROUP.id,text,extra)}
  if(!r.ok)log('send fail',chat,r.description);return!!r.ok}
 const hookSecret=async()=>(await sha('vip-hook|'+TOKEN)).slice(0,48);
 const setHook=async origin=>tg('setWebhook',{url:origin+'/tg',secret_token:await hookSecret(),allowed_updates:['message','my_chat_member','callback_query'],max_connections:10});

 // ---------- даты ----------
 const parts=(ms=NOW())=>{const p={};for(const x of dtfOf(TZ).formatToParts(new Date(ms)))p[x.type]=x.value;return{date:`${p.year}-${p.month}-${p.day}`,hour:+p.hour}};

 // ---------- команда ----------
 function buildTeam(raw){const a=Object.entries(raw||{}).filter(([,v])=>v&&typeof v==='object').map(([id,v])=>({id,n:String(v.n||''),r:String(v.r||''),u:String(v.u||'').replace(/^@+/,'')}));
  const c=a.find(x=>x.n.trim().toLowerCase()===CHIEF_N);if(c)CHIEF_ID=c.id;else a.push({id:CHIEF_ID,n:'Хоссам',r:'Шеф',u:''});return a}
 const cookBy=id=>TEAM.find(x=>x.id===id);
 const isChiefUser=u=>!!(CHIEF_U&&u&&String(u.username||'').toLowerCase()===CHIEF_U);
 const chatOf=id=>Object.entries(CH).filter(([,v])=>v&&v.k===id).map(([tid])=>tid);
 const chiefChat=()=>chatOf(CHIEF_ID)[0]||null;
 const dispName=u=>[u.first_name,u.last_name].filter(Boolean).join(' ')||u.username||String(u.id);
 const mention=id=>{const c=cookBy(id),t=chatOf(id)[0],u=t&&CH[t]&&CH[t].u;return c?(u?`${H(c.n)} (@${H(u)})`:H(c.n)):'?'};
 const loadTeam=async(ph)=>{const[team,chats,phones]=await Promise.all([safe('team',{}),safe('contacts/chats',{}),ph?safe('contacts/phones',{}):Promise.resolve({})]);TEAM=buildTeam(team);CH=chats||{};PH=phones||{}};

 // смена на дату — то же правило, что в приложении; читаем только нужные пути (экономим трафик Firebase)
 async function shiftsOn(date){const hide=!!(await safe('shifts/_hide/'+date,null)),own=await safe('shifts/'+date,null);
  if(own&&typeof own==='object'&&Object.values(own).some(v=>v!==undefined&&v!==null))return{map:own,hide};
  if(!room(TEAM.length+3)){const e=bud();if(TEAM.length>30)e.team=1;throw e}   // не хватает запросов в этом проходе (или команда больше 30 человек) — неполный список не шлём
  const last=await safe('shifts/_last',{}),m={};
  const rows=await Promise.all(TEAM.map(async c=>[c,await safe(`sched/${c.id}/${date}`,null)]));
  rows.forEach(([c,v])=>{if(isWork(v))m[c.id]=(last&&last[c.id])||''});return{map:m,hide}}

 // ---------- привязка Telegram ↔ повар ----------
 async function bind(from,cookId){const c=cookBy(cookId);if(!c)return{ok:false,why:'Такого повара нет в списке.'};
  if(c.id===CHIEF_ID&&!isChiefUser(from))return{ok:false,why:'Это имя шефа: подключиться может только он.'};
  const old=CH[String(from.id)];const rec={k:c.id,n:dispName(from),...(from.username?{u:from.username}:{}),t:NOW()};await put('contacts/chats/'+from.id,rec);CH[String(from.id)]=rec;
  if(!old||old.k!==c.id){const cc=chiefChat();if(cc&&String(cc)!==String(from.id))await send(cc,`✈️ <b>${H(c.n)}</b> подключил(а) Telegram${from.username?' (@'+H(from.username)+')':''}`)}
  return{ok:true,cook:c}}
 const contactKb={keyboard:[[{text:'📱 Отправить мой номер',request_contact:true}]],resize_keyboard:true,one_time_keyboard:true};
 async function afterBind(chat,c){const has=(PH[c.id]||'');await send(chat,`✅ Вы подключены как <b>${H(c.n)}</b>.\nТеперь здесь будут уведомления. Команды: /smena — моя смена завтра, /phone — номер телефона, /stop — отключить.\nМожно написать мне сообщение — оно сразу уйдёт шефу.`,has?undefined:{reply_markup:contactKb})}
 function pickKb(from){const list=TEAM.filter(c=>c.id!==CHIEF_ID||isChiefUser(from));const rows=[];for(let i=0;i<list.length;i+=2)rows.push(list.slice(i,i+2).map(c=>({text:c.n,callback_data:('b:'+c.id).slice(0,64)})));return{inline_keyboard:rows}}

 async function onPrivate(m){const from=m.from||{},chat=m.chat.id,txt=String(m.text||'').trim(),mine=CH[String(from.id)];
  if(m.contact){if(!mine){await send(chat,'Выберите своё имя:',{reply_markup:pickKb(from)});return}
   if(m.contact.user_id!==from.id){await send(chat,'Отправьте именно свой номер: кнопка «📱 Отправить мой номер».');return}
   const ph='+'+String(m.contact.phone_number||'').replace(/\D/g,'');if(ph.length<6){await send(chat,'Не удалось прочитать номер.');return}
   await put('contacts/phones/'+mine.k,ph.slice(0,24));PH[mine.k]=ph;await send(chat,'✅ Номер сохранён.',{reply_markup:{remove_keyboard:true}});return}
  const cmd=/^\/(\w+)(?:@\w+)?(?:\s+(.*))?$/.exec(txt);
  if(cmd){const c=cmd[1].toLowerCase(),arg=(cmd[2]||'').trim();
   if(c==='start'){const pm=/^c_([A-Za-z0-9_-]{1,60})$/.exec(arg);
    if(pm&&cookBy(pm[1])){const r=await bind(from,pm[1]);if(r.ok)await afterBind(chat,r.cook);else await send(chat,H(r.why));return}
    if(mine&&cookBy(mine.k)){await send(chat,`Вы уже подключены как <b>${H(cookBy(mine.k).n)}</b>. /stop — отключить.`);return}
    if(isChiefUser(from)){const r=await bind(from,CHIEF_ID);if(r.ok)await afterBind(chat,r.cook);return}
    const au=from.username&&TEAM.find(x=>x.u&&x.u.toLowerCase()===from.username.toLowerCase());
    if(au){const r=await bind(from,au.id);if(r.ok)await afterBind(chat,r.cook);return}
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
   if(!CHIEF_U){await send(m.chat.id,'В настройках Worker не задана переменная CHIEF_USERNAME (Telegram-имя шефа). См. CLOUDFLARE-AR.md.');return}
   if(!isChiefUser(from)){await send(m.chat.id,'Подключить группу может только шеф.');return}
   GROUP={id:m.chat.id,n:String(m.chat.title||'группа').slice(0,60),t:NOW()};await put('contacts/group',GROUP);await send(m.chat.id,'✅ Группа подключена: сюда будут приходить уведомления.')}}

 async function onMyChat(u){const c=u.chat||{},nw=u.new_chat_member||{},from=u.from||{};if(c.type==='private')return;
  const gone=['left','kicked'].includes(nw.status),here=['member','administrator'].includes(nw.status);
  if(gone&&GROUP&&String(GROUP.id)===String(c.id)){await del('contacts/group');GROUP=null;return}
  if(here){if(isChiefUser(from)){GROUP={id:c.id,n:String(c.title||'группа').slice(0,60),t:NOW()};await put('contacts/group',GROUP);await send(c.id,'✅ Группа подключена: сюда будут приходить уведомления.')}
   else await send(c.id,'Чтобы подключить эту группу, шеф должен написать здесь /group')}}

 async function onCallback(q){const from=q.from||{},d=String(q.data||''),pm=/^b:(.+)$/.exec(d);if(!pm)return;const r=await bind(from,pm[1]);
  await tg('answerCallbackQuery',{callback_query_id:q.id,text:r.ok?'Готово':String(r.why||'Ошибка').slice(0,150)});
  if(r.ok&&q.message){await tg('editMessageText',{chat_id:q.message.chat.id,message_id:q.message.message_id,text:'✅ Подключено: '+r.cook.n});await afterBind(q.message.chat.id,r.cook)}}

 // одно обновление Telegram (из Webhook): сначала загружаем команду, привязки, телефоны и группу
 async function update(u){await Promise.all([loadTeam(1),safe('contacts/group',null).then(g=>{GROUP=g&&g.id?g:null})]);
  if(u.message){const m=u.message;if(m.chat.type==='private')await onPrivate(m);else await onGroup(m)}else if(u.my_chat_member)await onMyChat(u.my_chat_member);else if(u.callback_query)await onCallback(u.callback_query)}

 // ---------- события ----------
 async function mark(key,val){sentRef[key]=val;await put('notify/sent/'+key,val)}
 async function toGroupOrDm(text,fallbackIds){if(!room(5))throw bud();if(GROUP&&GROUP.id)return send(GROUP.id,text);let ok=false;for(const id of fallbackIds||[]){for(const t of chatOf(id)){if(!room(5))throw bud();ok=(await send(t,text))||ok}}return ok}

 async function evShifts(now,cfg){if(cfg.sh===0||now.hour<SHIFT_H)return;const prevK='sh_'+addDays(now.date,1),pv=sentRef[prevK];if(pv&&NOW()-pv.t<36e5)return;
  const tom=addDays(now.date,1),s=await shiftsOn(tom),ids=Object.keys(s.map).filter(id=>cookBy(id));if(!ids.length)return;
  const lines=ids.sort((a,b)=>cookBy(a).n.localeCompare(cookBy(b).n,'ru')).map(id=>`• ${mention(id)}${s.map[id]&&!s.hide?' — <b>'+H(s.map[id])+'</b>':''}`),sig=hash(lines.join('|')),key='sh_'+tom,prev=sentRef[key];
  if(prev&&prev.h===sig)return;if(prev&&NOW()-prev.t<36e5)return;
  const head=prev?`🔄 Смена на завтра изменилась (${dayL(tom)}):`:`⏰ Завтра на смене (${dayL(tom)}):`;
  if(await toGroupOrDm(`${head}\n${lines.join('\n')}`,ids))await mark(key,{t:NOW(),h:sig})}

 async function evBanq(now,cfg){if(cfg.bq===0)return;const jobs=[];if(now.hour>=MORN_H)jobs.push([now.date,'today','Сегодня']);if(now.hour>=SHIFT_H)jobs.push([addDays(now.date,1),'tom','Завтра']);
  for(const[d,tag,lbl]of jobs){if(!room(8))return;const[pm,pr]=await Promise.all([safe('prepMeta/'+d,null),safe('prep/'+d,null)]);for(const b of banquets(pm,pr)){if(!room(6))return;const line=[b.title?'<b>'+H(b.title)+'</b>':'<b>Банкет</b>',b.time?'🕒 '+b.time:'',b.guests?'👥 '+b.guests+' гост.':'',b.place?'📍 '+H(b.place):''].filter(Boolean).join(' · ');
    const sig=hash(line+'|'+b.note),key=`bq_${d}_${b.id}_${tag}`,prev=sentRef[key];if(prev&&prev.h===sig)continue;if(prev&&NOW()-prev.t<36e5)continue;
    const txt=`${prev?'🔄 Банкет изменился':'🎉 '+lbl+' банкет'} (${dayL(d)})\n${line}${b.note?'\n📝 '+H(b.note):''}`;
    if(await toGroupOrDm(txt,TEAM.map(c=>c.id)))await mark(key,{t:NOW(),h:sig})}}}

 // Новый заказ: сначала «занимаем» отметку, потом шлём — если рядом запустился второй проход (cron и толчок), дубля почти не бывает.
 async function evOrders(now,cfg){
  const q=await get('orders','orderBy="created"&limitToLast=5').catch(e=>{log('orders',e.message);return null});if(!q)return;
  const list=Object.values(q).filter(x=>x&&x.id&&x.copied===true&&x.cook).sort((a,b)=>a.created-b.created);
  for(const x of list){const key='od_'+x.id;if(sentRef[key])continue;if(!room(6))return;
   const old=NOW()-(x.updated||x.created||0)>45*6e4;if(old||cfg.od===0){await mark(key,{t:NOW(),s:1});continue}
   const items=(Array.isArray(x.items)?x.items:Object.values(x.items||{})).filter(i=>i&&i.n),shown=items.slice(0,15).map(i=>`• ${H(i.n)} — ${H(String(i.qty).replace('.',','))} ${H(i.u||'')}${i.urg?' 🚨':''}`).join('\n');
   const txt=`🧾 <b>Заказ на ${H(x.date?dayL(x.date):'?')}</b> · ${H(x.cook.n||'?')}\n${items.length} поз.${x.note?' · 📝 '+H(String(x.note).slice(0,120)):''}\n${shown}${items.length>15?'\n… и ещё '+(items.length-15):''}`;
   if(!await claim(key,{t:NOW()})){sentRef[key]={t:NOW()};continue}   // другой проход уже занял этот заказ
   if(!await toGroupOrDm(txt,[])){delete sentRef[key];await del('notify/sent/'+key).catch(()=>{})}}}

 async function evAlerts(now,cfg){if(cfg.al===0||!room(14))return;const cc=chiefChat();if(!cc)return;const T=NOW();
  const heavy=T-(sentRef.heavyP||0)>18e5;let errs=[];if(heavy){await mark('heavyP',T);const el=await safe('errlog',null);if(el&&typeof el==='object')for(const[dv,es]of Object.entries(el))if(es&&typeof es==='object')for(const e of Object.values(es))if(e&&e.t&&e.m)errs.push({...e,dv})}
  const lastE=sentRef.errT;if(lastE===undefined){await mark('errT',T)}else if(heavy){const nw=errs.filter(e=>e.t>lastE).sort((a,b)=>a.t-b.t);
   if(nw.length&&T-(sentRef.errA||0)>36e5){const grp={};for(const e of nw){const k=String(e.m).slice(0,100)+'|'+(e.s||''),g=grp[k]||(grp[k]={e,n:0,v:new Set(),d:new Set()});g.n+=Number(e.n)||1;if(e.v)g.v.add(e.v);g.d.add(e.dv)}
    const gl=Object.values(grp).sort((x,y)=>y.n-x.n),rows=gl.slice(0,4).map(g=>`• ${H(String(g.e.m).slice(0,140))}${g.e.s?' · '+H(String(g.e.s).slice(0,40)):''} · ${[...g.v].map(x=>'v'+H(x)).join(', ')||'v?'} · ×${g.n} · ${g.d.size} тел.`);
    if(await send(cc,`⚠ <b>Ошибки в приложении:</b> ${nw.length} нов.\n${rows.join('\n')}${gl.length>4?'\n… и ещё видов: '+(gl.length-4):''}`)){await mark('errT',T);await mark('errA',T)}}}
  const bk=now.hour>=MORN_H?Number(await safe('plan/cfg/bk',0))||0:0;if(now.hour>=MORN_H&&(!bk||T-bk>7*864e5)&&T-(sentRef.bkA||0)>864e5){if(await send(cc,bk?`💾 Резервная копия не делалась ${Math.floor((T-bk)/864e5)} дн. Приложение → Админ → Данные и копия.`:'💾 Резервная копия ещё не делалась. Приложение → Админ → Данные и копия.'))await mark('bkA',T)}
  const dv=heavy?await safe('devices',null):null;if(dv&&typeof dv==='object')for(const[id,v]of Object.entries(dv)){if(!room(6))break;if(!v||!(v.q>0)||T-v.t<72e5||T-v.t>3*864e5)continue;const key='dq_'+id;if(sentRef[key]&&T-sentRef[key]<864e5)continue;
   const nm=v.c&&v.c.n?v.c.n:'Неизвестный телефон';if(await send(cc,`⚠ У <b>${H(nm)}</b> (${H(v.u||'?')}) ${v.q} неотправл. изменений. Пусть откроет приложение с интернетом.`))await mark(key,T)}}

 // ---------- 9.8.0: правки наблюдателя → личное сообщение шефу ----------
 async function evProps(now,cfg){if(cfg.al===0||!room(6))return;const cc=chiefChat();if(!cc)return;const T=NOW(),last=sentRef.ppT;
  if(last===undefined){await mark('ppT',T);return}
  const q=await get('proposals').catch(e=>{if(e&&e.budget)throw e;if(e&&(e.status===401||e.status===403))return null;throw e});if(!q||typeof q!=='object')return;
  const nw=Object.values(q).filter(x=>x&&typeof x==='object'&&!x.s&&Number(x.t)>last);if(!nw.length||T-(sentRef.ppA||0)<3e5)return;
  nw.sort((a,b)=>a.t-b.t);const by=[...new Set(nw.map(x=>String(x.by||'Наблюдатель')))].join(', '),gs=new Set(nw.map(x=>String(x.g||x.t))).size;
  const rows=nw.slice(0,4).map(x=>'• '+H(String(x.d||x.p).slice(0,120)));
  if(await send(cc,`🔔 <b>${H(by)}</b>: правок на утверждение — ${gs}\n${rows.join('\n')}${nw.length>4?'\n… и ещё '+(nw.length-4):''}\nОткройте приложение → ⚙ → «Наблюдатель и правки».`)){await mark('ppT',Math.max(...nw.map(x=>Number(x.t))));await mark('ppA',T)}}

 // ---------- 9.8.0: предзаказы гостей (отдельный сайт на Firestore) → банкеты кухни ----------
 // Только Worker читает предзаказы (вход под почтой персонала сайта предзаказов, пароль — секрет PRE_PASSWORD) и записывает банкет в prepMeta/<дата>/b/pre_<id>.
 // Телефон гостя и предоплата НЕ копируются: база кухни читается всеми, у кого есть адрес базы.
 const PRE_PW=String(env.PRE_PASSWORD||''),PRE_EMAIL=String(env.PRE_EMAIL||'staff@vip.com'),PRE_PROJECT=String(env.PRE_PROJECT||'vip-preorders'),PRE_KEY=String(env.PRE_API_KEY||'AIzaSyCMF5W6InKjR2ysOrQzf_L6IGPt_uf6W8o');
 const fsVal=v=>{if(!v||typeof v!=='object')return null;if('stringValue' in v)return v.stringValue;if('integerValue' in v)return Number(v.integerValue);if('doubleValue' in v)return Number(v.doubleValue);if('booleanValue' in v)return v.booleanValue;if('timestampValue' in v)return v.timestampValue;if('arrayValue' in v)return(v.arrayValue.values||[]).map(fsVal);if('mapValue' in v)return fsObj(v.mapValue.fields||{});return null};
 const fsObj=f=>{const o={};for(const[k,v]of Object.entries(f||{}))o[k]=fsVal(v);return o};
 const pick=(o,ks)=>{for(const k of ks){const v=o[k];if(v!==undefined&&v!==null&&v!=='')return v}return''};
 const preTime=v=>{const m=/^(\d{1,2})\s*[:.]\s*(\d{2})/.exec(String(v||'').trim());if(!m)return'';const t=m[1].padStart(2,'0')+':'+m[2];return okTm(t)?t:''};
 // «Подача» блюда на сайте предзаказов = время ЧЧ:ММ (поле serve; у старых заказов — course). Голые цифры (1, 2…) временем не считаются.
 const preServe=x=>{for(const v of[x.serve,x.course]){const m=/^\s*(\d{1,2})\s*:\s*(\d{2})\s*$/.exec(String(v==null?'':v));if(m){const t=m[1].padStart(2,'0')+':'+m[2];if(okTm(t))return t}}return''};
 // блюда предзаказа → заготовки банкета (одна позиция = одна задача; ключ стабилен по названию, чтобы отметки поваров не терялись)
 function preDishes(id,L){const out=new Map();for(const x of L){const nm=String(x.name||x.title).replace(/\s+/g,' ').trim().slice(0,80);if(!nm)continue;
   const key='pre_'+id+'_'+hash(nm.toLowerCase().replace(/ё/g,'е')),n=Number(String(x.qty!==undefined&&x.qty!==null?x.qty:(x.count!==undefined&&x.count!==null?x.count:'')).replace(',','.')),
   u=String(x.unit||x.u||'').trim().slice(0,8)||(/(сет|ваз|набор|пицц|торт|бутыл)/i.test(nm)?'шт':'порц'),o=out.get(key),sv=preServe(x);
   if(o){o.n+=n>0?n:0;if(sv&&(!o.sv||sv<o.sv))o.sv=sv;continue}out.set(key,{key,t:nm,n:n>0?n:0,u,sv,raw:n>0?'':String(x.qty||'').slice(0,20)})}
  return[...out.values()].map(d=>({key:d.key,t:d.t,sv:d.sv,q:d.n>0?(Math.round(d.n*100)/100)+' '+d.u:d.raw}))}
 function preNorm(id,o,doc){const st=String(pick(o,['status','state'])||'').toLowerCase();if(/^(cancel|reject|delet|отмен)/.test(st))return null;
  const dr=String(pick(o,['date','eventDate','day'])||''),date=/^\d{4}-\d{2}-\d{2}/.test(dr)?dr.slice(0,10):'';if(!date)return null;
  const lines=pick(o,['lines','items','dishes']),L=Array.isArray(lines)?lines.filter(x=>x&&typeof x==='object'&&(x.name||x.title)):[];
  const itemsTxt=L.map(x=>`• ${String(x.name||x.title).slice(0,60)}${x.qty?' × '+x.qty:''}${preServe(x)?' @'+preServe(x):''}${x.note?' ('+String(x.note).slice(0,40)+')':''}`).join('\n').slice(0,1500);
  const g=Math.round(Number(pick(o,['guests','pax','persons','people','count']))),rec={title:String(pick(o,['name','guest','client','title'])||'Предзаказ').replace(/\s+/g,' ').slice(0,80),src:'pre',pid:id};
  if(g>0&&g<=1e5)rec.guests=g;const tm=preTime(pick(o,['time','hour','at']));if(tm)rec.time=tm;
  const pl=String(pick(o,['table','place','hall','zone'])||'').slice(0,60);if(pl)rec.place=pl;const nt=String(pick(o,['note','notes','comment','wishes'])||'').slice(0,400);if(nt)rec.note=nt;if(itemsTxt)rec.pi=itemsTxt;
  const dishes=preDishes(id,L);
  return{date,rec,dishes,sig:hash(JSON.stringify([date,rec,dishes])),keys:'time='+JSON.stringify(pick(o,['time','hour','at']))+' → '+(rec.time||'—')+' | '+Object.keys(o).slice(0,20).join(',')}}
 // Правила базы разрешают писать только prep/<день>/<id> (не весь день сразу) — поэтому каждая задача пишется отдельным запросом. false = не хватило лимита запросов.
 async function wTasks(date,upd){for(const[k,v]of Object.entries(upd)){if(!room(3))return false;if(v===null)await del(`prep/${date}/${k}`);else await put(`prep/${date}/${k}`,v);PTW.n++}return true}
 async function preLogin(){const ck=PRE_EMAIL+'|'+hash(PRE_PW),T=Date.now();if(PT.k===ck&&PT.t>T)return PT.v;
  const r=await sub(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(PRE_KEY)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:PRE_EMAIL,password:PRE_PW,returnSecureToken:true})});
  const j=await r.json().catch(()=>({}));if(!r.ok||!j.idToken)throw new Error('Вход в предзаказы не удался: '+((j.error&&j.error.message)||r.status));PT.k=ck;PT.v=j.idToken;PT.t=T+Math.max(120,(+j.expiresIn||3600)-600)*1000;return PT.v}
 async function preQuery(from){const q=async()=>{const t=await preLogin();return sub(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(PRE_PROJECT)}/databases/(default)/documents:runQuery`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({structuredQuery:{from:[{collectionId:'orders'}],where:{fieldFilter:{field:{fieldPath:'date'},op:'GREATER_THAN_OR_EQUAL',value:{stringValue:from}}},limit:300}})})};
  let r=await q();if(r.status===401||r.status===403){PT.t=0;r=await q()}
  if(!r.ok){const j=await r.json().catch(()=>({}));const e=new Error('Firestore '+r.status+(j&&j.error&&j.error.message?': '+String(j.error.message).slice(0,100):''));e.status=r.status;throw e}
  const a=await r.json();return(Array.isArray(a)?a:[]).filter(x=>x&&x.document).map(x=>x.document)}
 async function evPre(now,cfg){if(!PRE_PW||cfg.pre===0)return;const T=NOW(),P=N.pre&&typeof N.pre==='object'?N.pre:{},pi=P.info&&typeof P.info==='object'?P.info:{};if(T-(Number(pi.t)||0)<45e3)return;
  if(!room(10))throw bud();PTW.n=0;const from=addDays(now.date,-1),info={t:T,n:0,w:0,d:0,tw:0,err:''};let map=P.map&&typeof P.map==='object'?{...P.map}:{},changed=false;const touched=new Set();
  try{const docs=await preQuery(from),cur=new Map();let keys='';
   for(const d of docs){const id=String(d.name||'').split('/').pop();if(!/^[A-Za-z0-9_-]{1,40}$/.test(id))continue;const n=preNorm(id,fsObj(d.fields||{}),d);if(n){cur.set(id,n);if(!keys)keys=n.keys}}
   info.n=cur.size;info.k=keys.slice(0,200);const full=docs.length<300;
   const tch=new Set();
   for(const[id,n]of cur){const m=map[id];if(m&&m.s===n.sig)continue;if(!room(9)){info.more=1;break}
    if(m&&m.d!==n.date){await del(`prepMeta/${m.d}/b/pre_${id}`);touched.add(m.d);if(m.tk&&m.tk.length){await wTasks(m.d,Object.fromEntries(m.tk.map(k=>[k,null])));tch.add(m.d)}}
    const o=(m&&m.o)||Date.parse(docs.find(x=>String(x.name).endsWith('/'+id)).createTime)||T,rec=n.rec,bid='pre_'+id,tk=m&&m.d===n.date&&Array.isArray(m.tk)?m.tk:[];
    await put(`prepMeta/${n.date}/b/${bid}`,{...rec,o});touched.add(n.date);
    const ex=await safe('prep/'+n.date,{}),upd={},keep=[],live=new Set();
    n.dishes.forEach((d,i)=>{live.add(d.key);keep.push(d.key);const c=ex&&typeof ex==='object'?ex[d.key]:null;
     if(c&&typeof c==='object'){if(c.t!==d.t)upd[d.key+'/t']=d.t;if((c.q||'')!==d.q)upd[d.key+'/q']=d.q;const wsv=d.sv||rec.time||'';if(wsv&&(c.svs||'')!==wsv){upd[d.key+'/sv']=wsv;upd[d.key+'/svs']=wsv}}
     else if(tk.indexOf(d.key)<0)upd[d.key]={t:d.t,q:d.q,g:'banq',bq:bid,k:'other',ks:'auto',c:o+i+1,src:'pre',pid:id,...((d.sv||rec.time)?{sv:d.sv||rec.time,svs:d.sv||rec.time}:{})}});
    for(const k of tk)if(!live.has(k)&&ex&&ex[k])upd[k]=null;
    if(Object.keys(upd).length){const okw=await wTasks(n.date,upd);tch.add(n.date);if(!okw){info.more=1;break}}
    map[id]={d:n.date,s:n.sig,o,tk:keep,tm:rec.time||''};changed=true;info.w++}
   if(full&&!info.more)for(const[id,m]of Object.entries(map)){if(cur.has(id))continue;if(m.d<from){if(m.d<addDays(now.date,-10)){delete map[id];changed=true}continue}if(!room(6)){info.more=1;break}await del(`prepMeta/${m.d}/b/pre_${id}`);touched.add(m.d);if(m.tk&&m.tk.length){await wTasks(m.d,Object.fromEntries(m.tk.map(k=>[k,null])));tch.add(m.d)}delete map[id];changed=true;info.d++}
   for(const d of touched){if(!room(3))break;await put('meta/prepMeta_'+d,T)}
   for(const d of tch){if(!room(3))break;await put('meta/prep_'+d,T)}
   if(changed&&room(3))await put('notify/pre/map',map)}
  catch(e){if(e&&e.budget){info.tw=PTW.n;try{await put('notify/pre/info',info)}catch(e2){}throw e}info.err=String(e&&e.message||e).slice(0,160);log('pre:',info.err)}
  info.tw=PTW.n;if(room(2))await put('notify/pre/info',info)}

 // очередь сообщений из приложения: сначала забираем запись (удаляем), потом отправляем
// очередь сообщений из приложения: каждую запись забираем атомарно (take), потом отправляем
 async function runOutbox(ob){for(const id of Object.keys(ob)){if(!room(8))break;
   const m=await take('notify/outbox/'+id);if(!m||typeof m!=='object'||!m.x)continue;
   const text=H(String(m.x).slice(0,900));let ok=false;
   if(m.to==='group'){ok=GROUP&&GROUP.id?await send(GROUP.id,'📣 '+text):false;if(!ok){const cc=chiefChat();if(cc)await send(cc,'⚠ Сообщение не ушло в группу (группа не подключена):\n'+text)}}
   else if(m.to==='chief'){const cc=chiefChat();ok=cc?await send(cc,text):false}
   else{for(const t of chatOf(String(m.to)))ok=(await send(t,'📣 '+text))||ok}}}

 // чистка: журнал отправленного старше 10 дней, переписка — не более 200 записей (понемногу, чтобы не упереться в лимит запросов)
 async function cleanup(){const T=NOW();let k=0;for(const[key,v]of Object.entries(sentRef)){if(k>=5||!room(10))break;const t=typeof v==='number'?v:(v&&v.t)||0;if(/^(sh_|bq_|od_|dq_)/.test(key)&&t&&T-t>10*864e5){await del('notify/sent/'+key).catch(()=>{});delete sentRef[key];k++}}
  if(T-(sentRef.inbP||0)>864e5&&room(30)){await mark('inbP',T);const inb=await safe('contacts/inbox',null);if(inb&&Object.keys(inb).length>200){const ks=Object.keys(inb).sort();for(const key of ks.slice(0,Math.min(ks.length-150,20))){if(!room(6))break;await del('contacts/inbox/'+key).catch(()=>{})}}}}

 // раз в 30 минут: Webhook на месте? (если кто-то сбросил его — ставим заново) и нет ли ошибок доставки
 async function webhookCheck(info){const T=NOW();if(T-(sentRef.whP||0)<18e5||!room(8))return'';await mark('whP',T);
  const r=await tg('getWebhookInfo');if(!r.ok)return'';const w=r.result||{};let msg='';
  if(info.w&&w.url!==info.w+'/tg'){const s=await setHook(info.w);msg=s.ok?'':'не удалось восстановить Webhook: '+(s.description||'')}
  if(!msg&&w.last_error_message&&w.last_error_date&&T-w.last_error_date*1000<15*6e4)msg='Webhook Telegram: '+w.last_error_message;
  return msg}

 // ---------- проходы ----------
 // Быстрый проход (после «толчка» и каждую минуту): очередь + новые заказы. Медленный (раз в 5 минут): ещё смены, банкеты, оповещения шефу.
 async function cron(slow){if(!TOKEN||!BOT_PW)throw new Error('Нет секретов TG_BOT_TOKEN / BOT_PASSWORD');await login();
  const[n,g]=await Promise.all([get('notify'),safe('contacts/group',null)]);   // notify читаем строго: при сбое лучше пропустить проход, чем потерять отметки и продублировать сообщения
  N=n&&typeof n==='object'?n:{};GROUP=g&&g.id?g:null;Object.assign(sentRef,N.sent||{});
  const cfg=N.cfg||{},now=parts(),info=N.info&&typeof N.info==='object'?N.info:{};
  let bot=info.bot;if(!bot){const me=await tg('getMe');if(!me.ok)throw new Error('Telegram getMe: '+(me.description||'нет ответа'));bot=me.result.username}
  const ob=N.outbox&&typeof N.outbox==='object'&&Object.keys(N.outbox).length;
  if(slow||ob)await loadTeam();
  let bigTeam=0;const stage=async f=>{try{await f()}catch(e){if(e&&e.budget){if(e.team)bigTeam=1;log('мало запросов в этом проходе — остальное сделаю в следующем');return}throw e}};
  if(ob)await stage(()=>runOutbox(N.outbox));
  await stage(()=>evOrders(now,cfg));
  await stage(()=>evPre(now,cfg));
  let whErr='';
  if(slow){await stage(()=>evShifts(now,cfg));await stage(()=>evBanq(now,cfg));await stage(()=>evAlerts(now,cfg));await stage(()=>evProps(now,cfg));await stage(()=>cleanup());whErr=await webhookCheck(info).catch(e=>{if(e&&e.budget)return'';throw e});
   if(room(3))await put('notify/info',{bot,t:NOW(),g:GROUP&&GROUP.id?1:0,v:2,...(info.w?{w:info.w}:{})})}
  if(bigTeam&&!whErr)whErr='В команде больше 30 человек: бесплатного лимита Cloudflare не хватает, чтобы прочитать смены';
  if(room(3)){if(whErr)await put('notify/err',{t:NOW(),m:String(whErr).slice(0,200)});else if(N.err)await del('notify/err').catch(()=>{})}
  log(`ok: slow=${slow} outbox=${ob||0} bot=@${bot} requests=${REQ.n}`)}

 async function fail(e){try{if(IDT)await put('notify/err',{t:NOW(),m:String(e&&e.message||e).slice(0,200)})}catch{}}

 // /setup: проверяет каждую часть и ставит Webhook; возвращает список [ок?, текст] для страницы
 async function setup(origin){const R=[],add=(ok,t)=>R.push([ok,t]);
  add(!!TOKEN,TOKEN?'TG_BOT_TOKEN موجود':'TG_BOT_TOKEN غير موجود: أضفه في Settings ← Variables and Secrets (نوع Secret)');
  add(!!BOT_PW,BOT_PW?'BOT_PASSWORD موجود':'BOT_PASSWORD غير موجود: أضفه في Settings ← Variables and Secrets (نوع Secret)');
  add(CHIEF_U?true:null,CHIEF_U?'CHIEF_USERNAME = @'+CHIEF_U:'CHIEF_USERNAME غير موجود: بدونه لن يعرفك البوت مديراً (أضفه كنص Text)');
  if(!TOKEN||!BOT_PW)return R;
  try{await login();add(true,'دخول Firebase نجح (bot@vip.local)')}catch(e){const m=String(e.message);add(false,'دخول Firebase فشل: '+m+(/INVALID_LOGIN|INVALID_PASSWORD|EMAIL_NOT_FOUND/.test(m)?' ← كلمة السر BOT_PASSWORD لا تطابق مستخدم bot@vip.local في Firebase':''));return R}
  let g=null;try{g=await get('contacts/group');add(true,'قراءة Firebase تعمل (القواعد منشورة)')}catch(e){add(false,'قراءة Firebase مرفوضة ('+e.status+'): انشر ملف firebase-rules.json في Realtime Database ← Rules');return R}
  const me=await tg('getMe');if(!me.ok){add(false,'توكن تيليجرام خاطئ: '+(me.description||''));return R}add(true,'البوت: @'+me.result.username);
  const s=await setHook(origin);if(!s.ok){add(false,'تعذّر ضبط Webhook: '+(s.description||''));return R}add(true,'تم ضبط Webhook: '+origin+'/tg');
  try{const cm=await tg('setMyCommands',{commands:[{command:'smena',description:'Моя смена завтра'},{command:'phone',description:'Отправить номер телефона'},{command:'help',description:'Кто я и что умею'},{command:'stop',description:'Отключить уведомления'}]});
   await tg('setMyShortDescription',{short_description:'Уведомления кухни: смены, заказы, связь с шефом'});await tg('setMyDescription',{description:'Уведомления кухни ВИАЙПИ РЕСТОБАР: ваша смена, новые заказы и связь с шефом. Нажмите кнопку внизу и выберите своё имя.'});
   add(cm.ok?true:null,cm.ok?'تم ضبط قائمة الأوامر ووصف البوت بدون كلمة start (زر البدء الأزرق نفسه تضعه تيليجرام ولا يمكن حذفه)':'تعذّر ضبط قائمة الأوامر: '+(cm.description||''))}catch(e){add(null,'تعذّر ضبط قائمة الأوامر')}
  try{await put('notify/info',{bot:me.result.username,t:NOW(),g:g&&g.id?1:0,v:2,w:origin});add(true,'تم حفظ عنوان الـ Worker في Firebase (التطبيق سيرسل إشعاراً فورياً)')}catch(e){add(false,'تعذّرت الكتابة في notify/info ('+e.status+')')}
  const wi=await tg('getWebhookInfo');if(wi.ok&&wi.result&&wi.result.last_error_message)add(null,'آخر خطأ تسليم من تيليجرام: '+wi.result.last_error_message);
  add(g&&g.id?true:null,g&&g.id?'المجموعة متصلة: '+(g.n||''):'المجموعة غير متصلة بعد: أضف البوت إلى المجموعة (أو اكتب /group فيها)');
  return R}

 return{cron,update,setup,fail,login,hookSecret,req:REQ}}

// ---------- «толчок»: приложение сообщает, что только что отправлен заказ или сообщение ----------
let BUSY=null,AGAIN=false;
function kick(env){AGAIN=true;if(BUSY)return BUSY;
 BUSY=(async()=>{try{while(AGAIN){AGAIN=false;const b=makeBot(env);try{await b.cron(false)}catch(e){console.error('poke:',e.message);await b.fail(e)}}}finally{BUSY=null}})();return BUSY}

const page=(R)=>`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ВИАЙПИ бот</title><body dir="rtl" style="font:18px/1.7 system-ui,sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#0b0d1a;color:#eee"><h2>إعداد بوت المطبخ</h2>${R.map(([ok,t])=>`<div style="margin:8px 0">${ok===true?'✅':ok===false?'❌':'⚠️'} ${H(t)}</div>`).join('')}<p style="color:#9ab">${R.some(r=>r[0]===false)?'أصلح السطر الأحمر ثم حدّث هذه الصفحة.':'كل شيء جاهز. أرسل /start للبوت في تيليجرام: يجب أن يرد خلال ثانيتين.'}</p></body>`;

export default{
 async scheduled(ev,env,ctx){const slow=new Date(ev.scheduledTime||Date.now()).getUTCMinutes()%5===0;
  ctx.waitUntil((async()=>{const b=makeBot(env);try{await b.cron(slow)}catch(e){console.error('cron:',e.message);await b.fail(e);throw e}})())},
 async fetch(req,env,ctx){const u=new URL(req.url),p=u.pathname;
  if(p==='/tg'){if(req.method!=='POST')return new Response('POST only',{status:405});
   const b=makeBot(env);if(!env.TG_BOT_TOKEN)return new Response('no token',{status:500});
   if(req.headers.get('x-telegram-bot-api-secret-token')!==await b.hookSecret())return new Response('forbidden',{status:403});
   let upd;try{upd=await req.json()}catch{return new Response('bad json',{status:400})}
   try{await b.login()}catch(e){console.error('tg login:',e.message);return new Response('login',{status:500})}
   try{await b.update(upd)}catch(e){console.error('update fail:',e.message);await b.fail(e)}   // отвечаем 200, чтобы Telegram не повторял «ядовитое» обновление
   return new Response('ok')}
  if(p==='/poke'){const allow=env.SITE_ORIGIN||'https://hxssam.github.io',o=req.headers.get('origin'),cors={'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Max-Age':'86400'};
   if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
   if(o&&o!==allow)return new Response(null,{status:403});
   ctx.waitUntil(kick(env));return new Response(null,{status:204,headers:cors})}
  if(p==='/setup'){const b=makeBot(env);let R;try{R=await b.setup(u.origin)}catch(e){R=[[false,'خطأ غير متوقع: '+e.message]]}
   return new Response(page(R),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}})}
  return new Response('VIP bot ok',{headers:{'content-type':'text/plain; charset=utf-8'}})}};
