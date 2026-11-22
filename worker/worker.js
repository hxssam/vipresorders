// ВИАЙПИ РЕСТОБАР КУХНЯ — Worker 9.9.6 на Cloudflare (бесплатный тариф): настоящие push-уведомления + синхронизация предзаказов.
// Telegram больше не нужен. Cron раз в минуту + «толчок» /poke из приложения (мгновенная отправка).
// Секреты (в коде их нет):
//   BOT_PASSWORD  — пароль пользователя bot@vip.local в Firebase Auth      (Secret)  — как и раньше
//   PRE_PASSWORD  — пароль сайта предзаказов (необязательно)                (Secret)  — как и раньше
//   TZ_NAME, MORNING_HOUR, EVENING_HOUR — необязательно (Europe/Moscow, 8, 18)
// Ключи Web Push (VAPID) Worker создаёт сам при первом запуске и кладёт в Firebase: push/cfg/pub (публичный) и push/prv (приватный, читает только бот).
// Адреса: /setup — проверка (открыть один раз) · /poke — «толчок» из приложения · /presync — «толчок» от сайта предзаказов.

const FB_KEY='AIzaSyCxQD7xmm63Dv13eSsZSN7tYFAMj9l6Rsk',FB_PROJECT='viprestobarfakaz';   // публичные данные из config.js приложения
const SITE_URL='https://hxssam.github.io/vipresorders/';
const WDS=['вс','пн','вт','ср','чт','пт','сб'];
const H=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const addDays=(ds,n)=>{const d=new Date(ds+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const dayL=ds=>{const[y,m,d]=ds.split('-').map(Number);return`${WDS[new Date(Date.UTC(y,m-1,d,12)).getUTCDay()]}, ${String(d).padStart(2,'0')}.${String(m).padStart(2,'0')}`};
const okTm=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h.toString(36)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const DTF={};const dtfOf=tz=>DTF[tz]||(DTF[tz]=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}));
const TOK={k:'',v:'',t:0};
const PT={k:'',v:'',t:0},PTW={n:0};   // вход в сайт предзаказов — тоже переиспользуется между запусками   // вход бота в Firebase живёт ~50 минут и переиспользуется между запусками, пока жив isolate
const isWork=s=>s===true||s==='Р'||!!(s&&(s.work||s.r==='Р'||s.f||s.t));

// ---------- Web Push: шифрование RFC 8291 (aes128gcm) и подпись VAPID (RFC 8292) на встроенном WebCrypto ----------
const ENC=new TextEncoder();
const b64u=b=>{let s='';const a=new Uint8Array(b);for(let i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const unb64u=s=>{s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const r=atob(s),a=new Uint8Array(r.length);for(let i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a};
const cat=(...a)=>{const o=new Uint8Array(a.reduce((t,x)=>t+x.length,0));let p=0;for(const x of a){o.set(x,p);p+=x.length}return o};
async function hkdf(salt,ikm,info,len){const k=await crypto.subtle.importKey('raw',ikm,'HKDF',false,['deriveBits']);return new Uint8Array(await crypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt,info},k,len*8))}
// keys/salt передаются только в тесте (вектор из приложения A к RFC 8291); в работе ключ отправителя и соль случайные для каждого сообщения
async function wpEncrypt(p256dh,authSecret,payload,keys,salt){
 const ua=await crypto.subtle.importKey('raw',p256dh,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const as=keys||await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const asPub=new Uint8Array(await crypto.subtle.exportKey('raw',as.publicKey));
 const ecdh=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:ua},as.privateKey,256));
 const ikm=await hkdf(authSecret,ecdh,cat(ENC.encode('WebPush: info\0'),p256dh,asPub),32);
 salt=salt||crypto.getRandomValues(new Uint8Array(16));
 const cek=await hkdf(salt,ikm,ENC.encode('Content-Encoding: aes128gcm\0'),16),nonce=await hkdf(salt,ikm,ENC.encode('Content-Encoding: nonce\0'),12);
 const key=await crypto.subtle.importKey('raw',cek,'AES-GCM',false,['encrypt']);
 const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce},key,cat(payload,new Uint8Array([2]))));
 const hd=new Uint8Array(21);hd.set(salt,0);new DataView(hd.buffer).setUint32(16,4096);hd[20]=65;
 return cat(hd,asPub,ct)}
const VK={pub:'',key:null,t:0},JW={};
async function vapidJwt(aud,sub){const c=JW[VK.pub+'|'+aud];if(c&&c.e-Date.now()>36e5)return c.v;
 const exp=Math.floor(Date.now()/1000)+12*3600,h=b64u(ENC.encode('{"typ":"JWT","alg":"ES256"}')),p=b64u(ENC.encode(JSON.stringify({aud,exp,sub}))),
 sig=new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},VK.key,ENC.encode(h+'.'+p))),v=h+'.'+p+'.'+b64u(sig);JW[VK.pub+'|'+aud]={v,e:exp*1000};return v}
const pad2=n=>String(n).padStart(2,'0');
const TXT={h:['✍️ Запишите часы смены','Не забудьте записать свои рабочие часы за сегодня.'],w:['🗑 Запишите списания','Проверьте и внесите списания за сегодня, пока не забыли.'],c:['🔒 Закройте кухню','Перед уходом: выключите технику и газ, уберите продукты, закройте кухню.']};

// банкеты — упрощённая копия bqCalc из приложения
function banquets(m,ds){m=m&&typeof m==='object'?m:{};ds=ds&&typeof ds==='object'?ds:{};const gn=v=>{const g=Math.round(Number(v));return g>0&&g<=1e5?g:0},mk=(id,v)=>({id,title:String(v.title||''),guests:gn(v.guests),time:okTm(v.time)?v.time:'',place:String(v.place||''),note:String(v.note||'')}),
 out=[],seen=new Set(),dishes=Object.values(ds).filter(t=>t&&t.t&&t.g==='banq');
 if(['title','time','place','note'].some(k=>m[k])||dishes.some(t=>!t.bq)){out.push(mk('0',m));seen.add('0')}
 Object.entries(m.b&&typeof m.b==='object'?m.b:{}).forEach(([id,v])=>{if(v&&typeof v==='object'&&!seen.has(id)){out.push(mk(id,v));seen.add(id)}});
 dishes.forEach(t=>{const id=String(t.bq||'0');if(!seen.has(id)){seen.add(id);out.push(mk(id,{}))}});
 return out.sort((a,b)=>(a.time?a.time:'99:99')<(b.time?b.time:'99:99')?-1:1)}

// Всё состояние — внутри makeBot: каждый вызов Worker получает своё, параллельные запуски не мешают друг другу.
function makeBot(env){
 const BOT_PW=String(env.BOT_PASSWORD||''),BOT_EMAIL=String(env.BOT_EMAIL||'bot@vip.local');
 const CHIEF_N=String(env.CHIEF_NAME||'хоссам').trim().toLowerCase();
 const TZ=env.TZ_NAME||'Europe/Moscow',EVE_H=+(env.EVENING_HOUR||env.SHIFT_HOUR||18),MORN_H=+(env.MORNING_HOUR||8),VSUB=String(env.VAPID_SUBJECT||SITE_URL);
 const KEY=String(env.FB_API_KEY||FB_KEY),DBU=String(env.FB_DB||`https://${env.FB_PROJECT||FB_PROJECT}-default-rtdb.firebaseio.com`).replace(/\/+$/,'');
 const NOW=()=>env.FAKE_NOW?Number(env.FAKE_NOW):Date.now();   // FAKE_NOW — только для тестов
 const log=(...a)=>console.log(...a);
 // Бесплатный тариф Cloudflare: не больше 50 внешних запросов за один запуск. Считаем их и не берёмся за необязательное, когда запас на исходе.
 const REQ={n:0},LIMIT=44,bud=()=>{const e=new Error('исчерпан лимит запросов Cloudflare (50)');e.budget=1;return e},sub=(u,o)=>{if(REQ.n>=49)throw bud();REQ.n++;return fetch(u,o)},room=k=>REQ.n+k<=LIMIT;
 let IDT='',RL=0,TEAM=[],CHIEF_ID='chef-hossam',N={},CFG={},SUBS=null;const sentRef={};
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

 // ---------- даты ----------
 const parts=(ms=NOW())=>{const p={};for(const x of dtfOf(TZ).formatToParts(new Date(ms)))p[x.type]=x.value;return{date:`${p.year}-${p.month}-${p.day}`,hour:+p.hour,min:+p.minute}};

 // ---------- команда и смены ----------
 function buildTeam(raw){const a=Object.entries(raw||{}).filter(([,v])=>v&&typeof v==='object').map(([id,v])=>({id,n:String(v.n||''),r:String(v.r||''),u:String(v.u||'').replace(/^@+/,'')}));
  const c=a.find(x=>x.n.trim().toLowerCase()===CHIEF_N);if(c)CHIEF_ID=c.id;else a.push({id:CHIEF_ID,n:'Хоссам',r:'Шеф',u:''});return a}
 const cookBy=id=>TEAM.find(x=>x.id===id);
 async function shiftsOn(date){const hide=!!(await safe('shifts/_hide/'+date,null)),own=await safe('shifts/'+date,null);
  if(own&&typeof own==='object'&&Object.values(own).some(v=>v!==undefined&&v!==null))return{map:own,hide};
  if(!room(TEAM.length+3)){const e=bud();if(TEAM.length>30)e.team=1;throw e}   // не хватает запросов в этом проходе (или команда больше 30 человек) — неполный список не шлём
  const m={};
  const rows=await Promise.all(TEAM.map(async c=>[c,await safe(`sched/${c.id}/${date}`,null)]));
  rows.forEach(([c,v])=>{if(isWork(v))m[c.id]=''});return{map:m,hide}}

 // ---------- Web Push: подписки, очередь, отправка ----------
 async function vapid(){if(VK.key&&VK.t>Date.now())return VK;
  for(let i=0;i<2;i++){const[pub,prv]=await Promise.all([safe('push/cfg/pub',null),safe('push/prv',null)]);
   if(typeof pub==='string'&&pub.length>80&&prv&&typeof prv==='object'&&prv.d){VK.pub=pub;VK.key=await crypto.subtle.importKey('jwk',{kty:'EC',crv:'P-256',x:prv.x,y:prv.y,d:prv.d},{name:'ECDSA',namedCurve:'P-256'},false,['sign']);VK.t=Date.now()+36e5;return VK}
   // первый запуск: создаём пару ключей. Приватный пишем «только если его ещё нет» — два параллельных запуска не затрут друг друга.
   const kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']),j=await crypto.subtle.exportKey('jwk',kp.privateKey),pb=b64u(await crypto.subtle.exportKey('raw',kp.publicKey));
   const r=await raw('PUT','push/prv',{x:j.x,y:j.y,d:j.d},{'if-match':'null_etag'});if(r.status===412)continue;if(!r.ok)throw new Error('Не удалось сохранить ключ push: '+r.status);
   await put('push/cfg/pub',pb);VK.pub=pb;VK.key=kp.privateKey;VK.t=Date.now()+36e5;return VK}
  throw new Error('Не удалось получить ключи push')}
 async function getSubs(force){if(SUBS&&!force)return SUBS;if(!room(2))throw bud();const s=await safe('push/subs',{});SUBS=s&&typeof s==='object'?s:{};return SUBS}
 // кому: all (все, кроме отправителя) · adm (устройства шефа) · cooks (все повара) · me (устройства отправителя) · c:<повар> · s:<подписка>
 function targets(to,subs,uid){const out=new Map(),toks=String(to||'').split(',').map(x=>x.trim()).filter(Boolean);
  for(const[id,s]of Object.entries(subs||{})){if(!s||typeof s!=='object'||typeof s.ep!=='string'||!s.k||!s.k.p256dh||!s.k.auth)continue;
   for(const t of toks){if((t==='all'&&!(uid&&s.u===uid))||(t==='adm'&&s.r==='adm')||(t==='cooks'&&s.r!=='adm')||(t==='me'&&uid&&s.u===uid)||(s.c&&t==='c:'+s.c)||t==='s:'+id){out.set(id,s);break}}}
  return[...out.entries()]}
 async function pushOne(s,m){let u;try{u=new URL(s.ep)}catch{return 0}if(u.protocol!=='https:')return 0;
  const h={Authorization:`vapid t=${await vapidJwt(u.origin,VSUB)}, k=${VK.pub}`,TTL:String(Math.max(30,Math.min(86400,+m.ttl||7200))),Urgency:m.k==='tm'?'high':'normal'};let body;
  try{body=await wpEncrypt(unb64u(s.k.p256dh),unb64u(s.k.auth),ENC.encode(JSON.stringify({ti:String(m.ti||'').slice(0,90),b:String(m.b||'').slice(0,220),k:m.k||'',tag:m.tag||'',url:m.url||'',ts:NOW(),...(m.k==='tm'?{ri:1}:{})})));h['Content-Encoding']='aes128gcm';h['Content-Type']='application/octet-stream'}catch(e){body=undefined}   // не вышло зашифровать — шлём «стук» без текста: приложение само покажет общее уведомление
  const r=await sub(s.ep,{method:'POST',headers:h,body});return r.status}
 // m: {ti,b,to,k,u,tag,url,ttl}. Возвращает число доставленных. Мёртвые подписки (404/410) удаляются сами.
 async function deliver(m,id){await vapid();const subs=await getSubs(),tg=targets(m.to,subs,m.u).filter(([,s])=>!s.pk||s.pk===VK.pub);
  const stale=Object.entries(subs).filter(([,s])=>s&&s.pk&&s.pk!==VK.pub).length;let ok=0,gone=[],left=[];
  for(let i=0;i<tg.length;i+=6){const ch=tg.slice(i,i+6);if(!room(ch.length+3)){left.push(...ch.map(x=>x[0]));continue}
   const rs=await Promise.all(ch.map(async([sid,s])=>{try{return[sid,await pushOne(s,m)]}catch(e){if(e&&e.budget)return[sid,-1];log('push fail',e.message);return[sid,0]}}));
   for(const[sid,st]of rs){if(st>=200&&st<300)ok++;else if(st===404||st===410)gone.push(sid);else if(st===-1)left.push(sid);else log('push status',st,sid)}}
  for(const sid of gone){if(!room(3))break;await del('push/subs/'+sid).catch(()=>{});delete subs[sid]}
  if(left.length&&room(3)){const lid='w'+NOW().toString(36)+Math.random().toString(36).slice(2,5);await put('push/out/'+lid,{at:NOW()+30000,ti:m.ti,b:m.b||'',to:left.map(x=>'s:'+x).join(',').slice(0,1900),k:m.k||'',u:m.u||'',by:m.by||'',lg:1})}
  if(!m.lg&&room(2)){const lid=id||('w'+NOW().toString(36)+Math.random().toString(36).slice(2,5));await put('push/log/'+lid,{t:NOW(),ti:String(m.ti||'').slice(0,90),b:String(m.b||'').slice(0,220),to:String(m.to||'').slice(0,300),k:m.k||'',by:String(m.by||'').slice(0,40),u:m.u||'',n:ok,...(stale?{st:stale}:{})}).catch(()=>{})}
  return ok}
 // очередь push/out: записи, время которых наступило или наступит в ближайшие ~55 секунд; ждём точного времени внутри запуска (поэтому таймер срабатывает «секунда в секунду»)
 async function runOut(horizon){if(!room(8))return 0;const q=await get('push/out','orderBy="at"&endAt='+(NOW()+horizon)+'&limitToFirst=30').catch(e=>{if(e&&e.budget)throw e;if(e&&(e.status===401||e.status===403))return null;throw e});
  if(!q||typeof q!=='object')return 0;let n=0;
  for(const[id,m]of Object.entries(q).sort((a,b)=>(a[1]&&a[1].at||0)-(b[1]&&b[1].at||0))){if(!room(8))break;if(!m||typeof m!=='object'||!m.ti){await del('push/out/'+id).catch(()=>{});continue}
   const w=(+m.at||0)-NOW();if(w>0)await sleep(Math.min(w,58e3));
   const t=await take('push/out/'+id);if(!t||typeof t!=='object')continue;   // забрали только раз: второй проход уже ничего не найдёт — дублей нет
   n+=await deliver(t,id)}
  return n}
 async function cleanup(){const T=NOW();let k=0;for(const[key,v]of Object.entries(sentRef)){if(k>=5||!room(10))break;const t=typeof v==='number'?v:(v&&v.t)||0;if(/^(sh_|bq_|od_|dq_|rem_)/.test(key)&&t&&T-t>10*864e5){await del('notify/sent/'+key).catch(()=>{});delete sentRef[key];k++}}
  if(T-(sentRef.logP||0)>36e5&&room(12)){await mark('logP',T);const o=await get('push/log','orderBy="t"&endAt='+(T-3*864e5)+'&limitToFirst=25').catch(()=>null);if(o&&typeof o==='object')for(const id of Object.keys(o)){if(!room(4))break;await del('push/log/'+id).catch(()=>{})}
   const subs=await getSubs();for(const[id,s]of Object.entries(subs)){if(!room(4))break;if(!s||typeof s!=='object'||T-(+s.t||0)>75*864e5){await del('push/subs/'+id).catch(()=>{});delete subs[id]}}}}

 // ---------- события ----------
 async function mark(key,val){sentRef[key]=val;await put('notify/sent/'+key,val)}
 const EVON=k=>!(CFG.ev&&typeof CFG.ev==='object'&&CFG.ev[k]===0);
 // напоминания по расписанию (шеф включает и выбирает время в приложении): push/cfg/rem = {sh|h|w|c:{on:1,at:'HH:MM',tx?}}
 async function evRem(now){const R=CFG.rem;if(!R||typeof R!=='object')return;const mins=now.hour*60+now.min;
  for(const kind of['sh','h','w','c']){const c=R[kind];if(!c||c.on!==1||!okTm(c.at))continue;const d=mins-(+c.at.slice(0,2)*60+ +c.at.slice(3));if(d<0||d>45)continue;   // окно 45 минут: Worker был недоступен дольше — день пропускаем, а не будим среди ночи
   const key='rem_'+kind+'_'+now.date;if(sentRef[key])continue;if(!room(14))throw bud();
   if(kind==='sh'){const tom=addDays(now.date,1),s=await shiftsOn(tom),ids=Object.keys(s.map).filter(id=>cookBy(id));if(!ids.length)continue;
    if(!await claim(key,{t:NOW()}))continue;const byT=new Map();ids.forEach(id=>{const t=s.hide?'':String(s.map[id]||'');(byT.get(t)||byT.set(t,[]).get(t)).push('c:'+id)});
    for(const[t,to]of byT)await deliver({to:to.join(','),ti:'⏰ Завтра ваша смена',b:dayL(tom)+(t?' · '+t:' · время уточнит шеф'),k:'sh',by:'авто',ttl:4*3600});continue}
   if(!await claim(key,{t:NOW()}))continue;
   const on=Object.keys((await shiftsOn(now.date)).map);if(now.hour<6&&room(10))for(const id of Object.keys((await shiftsOn(addDays(now.date,-1))).map))if(!on.includes(id))on.push(id);
   const ids=on.filter(id=>cookBy(id));const tx=TXT[kind],body=typeof c.tx==='string'&&c.tx.trim()?c.tx.trim().slice(0,150):tx[1];
   await deliver({to:ids.length?ids.map(id=>'c:'+id).join(','):'cooks',ti:tx[0],b:body,k:kind,by:'авто',ttl:3*3600})}}
 async function evBanq(now){if(!EVON('bq'))return;const jobs=[];if(now.hour>=MORN_H)jobs.push([now.date,'today','Сегодня']);if(now.hour>=EVE_H)jobs.push([addDays(now.date,1),'tom','Завтра']);
  for(const[d,tag,lbl]of jobs){if(!room(8))return;const[pm,pr]=await Promise.all([safe('prepMeta/'+d,null),safe('prep/'+d,null)]);for(const b of banquets(pm,pr)){if(!room(8))return;const line=[b.title||'Банкет',b.time?'🕒 '+b.time:'',b.guests?'👥 '+b.guests+' гост.':'',b.place?'📍 '+b.place:''].filter(Boolean).join(' · ');
    const sig=hash(line+'|'+b.note),key=`bq_${d}_${b.id}_${tag}`,prev=sentRef[key];if(prev&&prev.h===sig)continue;if(prev&&NOW()-prev.t<36e5)continue;
    await mark(key,{t:NOW(),h:sig});await deliver({to:'all',ti:(prev?'🔄 Банкет изменился · ':'🎉 '+lbl+' банкет · ')+dayL(d),b:line+(b.note?' · 📝 '+b.note:''),k:'bq',by:'авто',ttl:6*3600})}}}
 // Новый заказ → шефу. Сначала «занимаем» отметку, потом шлём: если рядом запустился второй проход (cron и толчок), дубля не будет.
 async function evOrders(now){
  const q=await get('orders','orderBy="created"&limitToLast=5').catch(e=>{if(e&&e.budget)throw e;log('orders',e.message);return null});if(!q)return;
  const list=Object.values(q).filter(x=>x&&x.id&&x.copied===true&&x.cook).sort((a,b)=>a.created-b.created);
  for(const x of list){const key='od_'+x.id;if(sentRef[key])continue;if(!room(8))return;
   const old=NOW()-(x.updated||x.created||0)>45*6e4;if(old||!EVON('od')){await mark(key,{t:NOW(),s:1});continue}
   const items=(Array.isArray(x.items)?x.items:Object.values(x.items||{})).filter(i=>i&&i.n),urg=items.filter(i=>i.urg).length;
   if(!await claim(key,{t:NOW()}))continue;
   await deliver({to:'adm',ti:'🧾 Заказ на '+(x.date?dayL(x.date):'?'),b:String(x.cook.n||'?')+' · '+items.length+' поз.'+(urg?' · 🚨 срочных: '+urg:'')+(x.note?' · '+String(x.note).slice(0,80):''),k:'od',by:String(x.cook.n||''),ttl:6*3600})}}
 // правки наблюдателя ждут утверждения → шефу
 async function evProps(now){if(!EVON('ap')||!room(8))return;const T=NOW(),last=sentRef.ppT;if(last===undefined){await mark('ppT',T);return}
  const q=await get('proposals').catch(e=>{if(e&&e.budget)throw e;if(e&&(e.status===401||e.status===403))return null;throw e});if(!q||typeof q!=='object')return;
  const nw=Object.values(q).filter(x=>x&&typeof x==='object'&&!x.s&&Number(x.t)>last);if(!nw.length||T-(sentRef.ppA||0)<12e4)return;
  const by=[...new Set(nw.map(x=>String(x.by||'Наблюдатель')))].join(', '),gs=new Set(nw.map(x=>String(x.g||x.t))).size;
  await mark('ppT',Math.max(...nw.map(x=>Number(x.t))));await mark('ppA',T);
  await deliver({to:'adm',ti:'🔔 Правки ждут утверждения',b:by+': '+gs+' '+(gs===1?'действие':'действий')+'. Откройте Админ-панель.',k:'ap',by,ttl:12*3600})}
 // ошибки приложения и «пора сделать копию» → шефу
 async function evAlerts(now){if(!EVON('er')||!room(14))return;const T=NOW();
  const heavy=T-(sentRef.heavyP||0)>18e5;let errs=[];if(heavy){await mark('heavyP',T);const el=await safe('errlog',null);if(el&&typeof el==='object')for(const[dv,es]of Object.entries(el))if(es&&typeof es==='object')for(const e of Object.values(es))if(e&&e.t&&e.m)errs.push({...e,dv})}
  const lastE=sentRef.errT;if(lastE===undefined){await mark('errT',T)}else if(heavy){const nw=errs.filter(e=>e.t>lastE).sort((a,b)=>a.t-b.t);
   if(nw.length&&T-(sentRef.errA||0)>36e5){await mark('errT',T);await mark('errA',T);await deliver({to:'adm',ti:'⚠ Ошибки в приложении: '+nw.length,b:String(nw[nw.length-1].m).slice(0,160),k:'er',by:'авто',ttl:12*3600})}}
  const bk=now.hour>=MORN_H?Number(await safe('plan/cfg/bk',0))||0:0;if(now.hour>=MORN_H&&(!bk||T-bk>7*864e5)&&T-(sentRef.bkA||0)>864e5){await mark('bkA',T);await deliver({to:'adm',ti:'💾 Пора сделать копию',b:bk?'Копия не делалась '+Math.floor((T-bk)/864e5)+' дн. Админ → Данные и копия.':'Копия ещё не делалась. Админ → Данные и копия.',k:'er',by:'авто',ttl:24*3600})}}

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
 function preDishes(id,L){const out=new Map(),first=new Map();for(const x of L){const nm=String(x.name||x.title).replace(/\s+/g,' ').trim().slice(0,80);if(!nm)continue;
   const base=hash(nm.toLowerCase().replace(/ё/g,'е')),sv=preServe(x),f=first.has(base)?first.get(base):(first.set(base,sv),sv),key='pre_'+id+'_'+base+(sv===f?'':'_'+hash(sv||'-')),
   n=Number(String(x.qty!==undefined&&x.qty!==null?x.qty:(x.count!==undefined&&x.count!==null?x.count:'')).replace(',','.')),
   u=String(x.unit||x.u||'').trim().slice(0,8)||(/(сет|ваз|набор|пицц|торт|бутыл)/i.test(nm)?'шт':'порц'),nt=String(x.note||'').replace(/\s+/g,' ').trim().slice(0,60),o=out.get(key);
   if(o){o.n+=n>0?n:0;if(nt&&o.nt.indexOf(nt)<0)o.nt=(o.nt?o.nt+'; ':'')+nt;continue}out.set(key,{key,t:nm,n:n>0?n:0,u,sv,nt,raw:n>0?'':String(x.qty||'').slice(0,20)})}
  return[...out.values()].map(d=>({key:d.key,t:d.t,sv:d.sv,nt:d.nt.slice(0,120),q:d.n>0?(Math.round(d.n*100)/100)+' '+d.u:d.raw}))}
 function preNorm(id,o,doc){const st=String(pick(o,['status','state'])||'').toLowerCase();if(/^(cancel|reject|delet|отмен)/.test(st))return null;
  const dr=String(pick(o,['date','eventDate','day'])||''),date=/^\d{4}-\d{2}-\d{2}/.test(dr)?dr.slice(0,10):'';if(!date)return null;
  const lines=pick(o,['lines','items','dishes']),L=Array.isArray(lines)?lines.filter(x=>x&&typeof x==='object'&&(x.name||x.title)):[];
  const itemsTxt=L.map(x=>`• ${String(x.name||x.title).slice(0,60)}${x.qty?' × '+x.qty:''}${preServe(x)?' @'+preServe(x):''}${x.note?' ('+String(x.note).replace(/\s+/g,' ').trim().slice(0,60)+')':''}`).join('\n').slice(0,1500);
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
 async function evPre(now,cfg,force){if(!PRE_PW||cfg.pre===0)return;const T=NOW(),P=N.pre&&typeof N.pre==='object'?N.pre:{},pi=P.info&&typeof P.info==='object'?P.info:{};if(!force&&T-(Number(pi.t)||0)<45e3)return;
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
     if(c&&typeof c==='object'){if(c.t!==d.t)upd[d.key+'/t']=d.t;if((c.q||'')!==d.q)upd[d.key+'/q']=d.q;if((c.pn||'')!==d.nt)upd[d.key+'/pn']=d.nt||null;const wsv=d.sv||rec.time||'';if(wsv&&(c.svs||'')!==wsv){upd[d.key+'/sv']=wsv;upd[d.key+'/svs']=wsv}}
     else if(tk.indexOf(d.key)<0)upd[d.key]={t:d.t,q:d.q,g:'banq',bq:bid,k:'other',ks:'auto',c:o+i+1,src:'pre',pid:id,...(d.nt?{pn:d.nt}:{}),...((d.sv||rec.time)?{sv:d.sv||rec.time,svs:d.sv||rec.time}:{})}});
    for(const k of tk)if(!live.has(k)&&ex&&ex[k])upd[k]=null;
    if(Object.keys(upd).length){const okw=await wTasks(n.date,upd);tch.add(n.date);if(!okw){info.more=1;break}}
    map[id]={d:n.date,s:n.sig,o,tk:keep,tm:rec.time||''};changed=true;info.w++}
   if(full&&!info.more)for(const[id,m]of Object.entries(map)){if(cur.has(id))continue;if(m.d<from){if(m.d<addDays(now.date,-10)){delete map[id];changed=true}continue}if(!room(6)){info.more=1;break}await del(`prepMeta/${m.d}/b/pre_${id}`);touched.add(m.d);if(m.tk&&m.tk.length){await wTasks(m.d,Object.fromEntries(m.tk.map(k=>[k,null])));tch.add(m.d)}delete map[id];changed=true;info.d++}
   for(const d of touched){if(!room(3))break;await put('meta/prepMeta_'+d,T)}
   for(const d of tch){if(!room(3))break;await put('meta/prep_'+d,T)}
   if(changed&&room(3))await put('notify/pre/map',map)}
  catch(e){if(e&&e.budget){info.tw=PTW.n;try{await put('notify/pre/info',info)}catch(e2){}throw e}info.err=String(e&&e.message||e).slice(0,160);log('pre:',info.err)}
  info.tw=PTW.n;if(room(2))await put('notify/pre/info',info)}

 // ---------- проходы ----------
 // Каждую минуту: очередь push (в т.ч. таймеры, которые наступят в ближайшие ~55 с), напоминания, новые заказы, предзаказы. Раз в 5 минут ещё: банкеты, правки, оповещения шефу, чистка.
 async function cron(slow,fast){if(!BOT_PW)throw new Error('Нет секрета BOT_PASSWORD');await login();
  const[n,cf]=await Promise.all([get('notify'),safe('push/cfg',{})]);   // notify читаем строго: при сбое лучше пропустить проход, чем потерять отметки и продублировать сообщения
  N=n&&typeof n==='object'?n:{};CFG=cf&&typeof cf==='object'?cf:{};Object.assign(sentRef,N.sent||{});
  const now=parts(),info=N.info&&typeof N.info==='object'?N.info:{};
  let bigTeam=0;const stage=async f=>{try{await f()}catch(e){if(e&&e.budget){if(e.team)bigTeam=1;log('мало запросов в этом проходе — остальное сделаю в следующем');return}throw e}};
  const rem=CFG.rem&&typeof CFG.rem==='object'&&Object.values(CFG.rem).some(x=>x&&x.on===1);
  if(rem||slow)await loadTeam();
  let sent=0;await stage(async()=>{sent=await runOut(fast?0:55e3)});
  if(rem)await stage(()=>evRem(now));
  await stage(()=>evOrders(now));
  await stage(()=>evPre(now,N.cfg&&typeof N.cfg==='object'?N.cfg:{}));
  if(slow){await stage(()=>evBanq(now));await stage(()=>evProps(now));await stage(()=>evAlerts(now));await stage(()=>cleanup());
   if(room(3))await put('notify/info',{t:NOW(),v:3,...(info.w?{w:info.w}:{})});
   if(info.w&&/^https:\/\/[A-Za-z0-9.-]+$/.test(String(info.w))&&room(3))await put('access/w',String(info.w)).catch(()=>{})}
  if(bigTeam&&room(3))await put('notify/err',{t:NOW(),m:'В команде больше 30 человек: бесплатного лимита Cloudflare не хватает, чтобы прочитать смены'});else if(N.err&&room(3))await del('notify/err').catch(()=>{});
  log(`ok: slow=${slow} push=${sent} requests=${REQ.n}`)}
 const loadTeam=async()=>{TEAM=buildTeam(await safe('team',{}))};
 // мгновенная синхронизация предзаказов: вызывается сайтом предзаказов сразу после сохранения (/presync), не ждёт минутного cron
 async function preFast(){if(!PRE_PW)return;await login();const[p,c]=await Promise.all([safe('notify/pre',{}),safe('notify/cfg',{})]);N={pre:p&&typeof p==='object'?p:{}};await evPre(parts(),c&&typeof c==='object'?c:{},true)}
 async function fail(e){try{if(IDT)await put('notify/err',{t:NOW(),m:String(e&&e.message||e).slice(0,200)})}catch{}}

 // /setup: проверяет каждую часть; возвращает список [ок?, текст] для страницы
 async function setup(origin){const R=[],add=(ok,t)=>R.push([ok,t]);
  add(!!BOT_PW,BOT_PW?'BOT_PASSWORD موجود':'BOT_PASSWORD غير موجود: أضفه في Settings ← Variables and Secrets (نوع Secret)');
  if(!BOT_PW)return R;
  try{await login();add(true,'دخول Firebase نجح (bot@vip.local)')}catch(e){const m=String(e.message);add(false,'دخول Firebase فشل: '+m+(/INVALID_LOGIN|INVALID_PASSWORD|EMAIL_NOT_FOUND/.test(m)?' ← كلمة السر BOT_PASSWORD لا تطابق مستخدم bot@vip.local في Firebase':''));return R}
  try{await get('push/cfg');add(true,'قراءة Firebase تعمل (القواعد منشورة)')}catch(e){add(false,'قراءة/كتابة Firebase مرفوضة ('+e.status+'): انشر ملف firebase-rules.json (النسخة 9.9.6) في Realtime Database ← Rules');return R}
  try{const v=await vapid();add(true,'مفاتيح الإشعارات جاهزة: '+v.pub.slice(0,14)+'…')}catch(e){add(false,'تعذّر إنشاء مفاتيح الإشعارات: '+e.message);return R}
  try{const s=await getSubs(true),a=Object.values(s).filter(x=>x&&x.ep);add(a.length?true:null,a.length?'أجهزة مشتركة بالإشعارات: '+a.length+' (من '+new Set(a.map(x=>x.c||x.u)).size+' مستخدم)':'لا توجد أجهزة مشتركة بعد: افتح التطبيق على الهاتف واضغط «🔔 تفعيل الإشعارات»')}catch(e){add(null,'تعذّرت قراءة الأجهزة')}
  try{await put('notify/info',{t:NOW(),v:3,w:origin});await put('access/w',origin);add(true,'تم حفظ عنوان الـ Worker في Firebase (التطبيق سيرسل إشعاراً فورياً)')}catch(e){add(false,'تعذّرت الكتابة في notify/info أو access/w ('+e.status+')')}
  add(PRE_PW?true:null,PRE_PW?'ربط الطلبات المسبقة مفعّل':'ربط الطلبات المسبقة غير مفعّل (PRE_PASSWORD غير موجود — اختياري)');
  return R}

 return{cron,setup,fail,login,preFast,req:REQ,wpEncrypt,targets,deliver,vapid}}

// ---------- «толчок»: приложение сообщает, что только что отправлено уведомление или заказ ----------
let BUSY=null,AGAIN=false;
function kick(env){AGAIN=true;if(BUSY)return BUSY;
 BUSY=(async()=>{try{while(AGAIN){AGAIN=false;const b=makeBot(env);try{await b.cron(false,true)}catch(e){console.error('poke:',e.message);await b.fail(e)}}}finally{BUSY=null}})();return BUSY}

let PBUSY=null,PAGAIN=false;
function preKick(env){PAGAIN=true;if(PBUSY)return PBUSY;
 PBUSY=(async()=>{try{while(PAGAIN){PAGAIN=false;const b=makeBot(env);try{await b.preFast()}catch(e){console.error('presync:',e.message)}}}finally{PBUSY=null}})();return PBUSY}

const page=(R)=>`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ВИАЙПИ уведомления</title><body dir="rtl" style="font:18px/1.7 system-ui,sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#0b0d1a;color:#eee"><h2>إعداد إشعارات المطبخ</h2>${R.map(([ok,t])=>`<div style="margin:8px 0">${ok===true?'✅':ok===false?'❌':'⚠️'} ${H(t)}</div>`).join('')}<p style="color:#9ab">${R.some(r=>r[0]===false)?'أصلح السطر الأحمر ثم حدّث هذه الصفحة.':'كل شيء جاهز. افتح التطبيق على الهاتف ← «🔔 تفعيل الإشعارات».'}</p></body>`;

export default{
 async scheduled(ev,env,ctx){const slow=new Date(ev.scheduledTime||Date.now()).getUTCMinutes()%5===0;
  ctx.waitUntil((async()=>{const b=makeBot(env);try{await b.cron(slow,false)}catch(e){console.error('cron:',e.message);await b.fail(e);throw e}})())},
 async fetch(req,env,ctx){const u=new URL(req.url),p=u.pathname;
  const gate=()=>{const allow=env.SITE_ORIGIN||'https://hxssam.github.io',o=req.headers.get('origin'),cors={'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Max-Age':'86400'};
   if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});if(o&&o!==allow)return new Response(null,{status:403});return cors};
  if(p==='/poke'){const g=gate();if(g instanceof Response)return g;ctx.waitUntil(kick(env));return new Response(null,{status:204,headers:g})}
  if(p==='/presync'){const g=gate();if(g instanceof Response)return g;ctx.waitUntil(preKick(env));return new Response(null,{status:204,headers:g})}
  if(p==='/setup'){const b=makeBot(env);let R;try{R=await b.setup(u.origin)}catch(e){R=[[false,'خطأ غير متوقع: '+e.message]]}
   return new Response(page(R),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}})}
  return new Response('VIP push ok',{headers:{'content-type':'text/plain; charset=utf-8'}})}};
