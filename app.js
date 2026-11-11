(()=>{'use strict';
if(!window.HTMLDialogElement||typeof HTMLDialogElement.prototype.showModal!=='function'){document.querySelectorAll('dialog').forEach(d=>{d.showModal=()=>{d.setAttribute('open','');d.classList.add('modal-fallback');document.body.classList.add('modal-fallback-open')};d.close=()=>{d.removeAttribute('open');const e=document.createEvent('Event');e.initEvent('close',false,false);d.dispatchEvent(e);if(!document.querySelector('dialog.modal-fallback[open]'))document.body.classList.remove('modal-fallback-open')}});document.addEventListener('click',e=>{if(e.target===document.body&&document.body.classList.contains('modal-fallback-open')){const d=document.querySelector('dialog.modal-fallback[open]');if(d)d.close()}},true)}
const CFG=Object.assign({dbUrl:'',projectId:'',apiKey:'',adminEmail:'admin@vip.local'},window.CONFIG||{});
const DEMO=!(CFG.dbUrl||CFG.projectId)||!CFG.apiKey;let DB=String(CFG.dbUrl||'').replace(/\/+$/,'');
const $=s=>document.querySelector(s),dialogOpen=id=>$(id).hasAttribute('open'),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),cssEsc=s=>window.CSS&&CSS.escape?CSS.escape(String(s)):String(s).replace(/[^a-zA-Z0-9_-]/g,'\\$&');
const VER='8.3';
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const BASE=[['meat','Мясо и птица','🥩'],['deli','Колбасы и деликатесы','🥓'],['seafood','Рыба и морепродукты','🐟'],['cheese','Сыры','🧀'],['dairy','Молочные продукты и мороженое','🥛'],['vegetables','Овощи и грибы','🥬'],['herbs','Зелень и травы','🌿'],['fruit','Фрукты','🍎'],['bakery','Хлеб','🍞'],['fry','Фритюр и полуфабрикаты','🍟'],['pasta','Макароны, крупы и рис','🍝'],['flour','Мука, выпечка и сладкое','🧁'],['nuts','Орехи и семена','🥜'],['sauces','Соусы и заправки','🥫'],['spices','Специи и приправы','🧂'],['oils','Масла','🛢️'],['preserves','Консервация и соленья','🥒']];
const UNITS=['кг','г','л','мл','шт','уп','кор','пак','бан','бут','пуч'];
const CAT={
meat:'Грудка утиная|кг;Ростбиф|кг;Буженина|кг;Крылья куриные|кг;Бедро куриное|кг;Грудка куриная|кг;Корейка свиная на кости|кг',
deli:'Колбасы копчёные без названия|кг;Сало|кг;Колбаски пепперони|кг;Вяленые куриные ломтики «Пепперони»|уп;Вяленые куриные ломтики «Хамон»|уп;Вяленые куриные ломтики «Утка по-пекински»|уп;Ветчина|кг;Бекон|кг',
seafood:'Креветка северная|кг;Анчоусы|кг;Сельдь слабосолёная|кг;Минтай|кг;Мидии|кг;Лосось|кг;Кальмар|кг',
cheese:'Брынза|кг;Фетакса|кг;Сыр чеддер|кг;Сыр пармезан|кг;Сыр дор блю|кг;Сыр моцарелла|кг;Сыр косичка копчёный|кг;Сыр чечил|кг;Сыр творожный «Креметте»|кг',
dairy:'Масло сливочное|кг;Сливки|л;Мороженое шоколадное|уп;Мороженое ванильное|уп',
vegetables:'Шампиньоны|кг;Салат айсберг|шт;Лук репчатый|кг;Чеснок свежий|кг;Томаты черри|кг;Перец болгарский|кг;Огурцы свежие|кг;Томаты розовые|кг;Баклажаны|кг;Цукини|кг;Картофель свежий|кг;Шпинат|кг;Фасоль стручковая|кг;Спаржа|кг;Перец чили|кг',
herbs:'Розмарин|пуч;Мята|пуч;Тимьян|пуч;Укроп|пуч;Петрушка|пуч',
fruit:'Апельсины|кг;Яблоки|кг;Виноград|кг;Груши|кг;Ананас|шт;Киви|кг;Лайм|кг;Лимоны|кг',
bakery:'Хлебные палочки солёные|уп;Хлеб ржаной (чёрный)|шт;Хлеб пшеничный: багет|шт;Хлеб пшеничный: чиабатта|шт;Хлеб для сэндвичей HARRY’S|уп',
fry:'Луковые кольца|кг;Картофель фри|кг;Картофель по-деревенски|кг;Сырные шарики П/Ф|кг',
pasta:'Спагетти|уп;Ньокки картофельные|кг;Рис длиннозёрный в пакетиках|уп;Крупа манная|кг',
flour:'Мука пшеничная для пиццы|кг;Мука ржаная обдирная хлебопекарная|кг;Крахмал картофельный|кг;Дрожжи|уп;Разрыхлитель|уп;Какао-порошок|уп;Сахар|кг;Мёд|кг;Кокосовая стружка|кг;Топинг шоколадный|бут;Топинг карамельный|бут;Топинг клубничный|бут',
nuts:'Миндаль|кг;Фисташки|кг;Семена подсолнечника|кг;Семена кунжута|кг;Семена тыквы|кг',
sauces:'Соус сладкий чили|бут;Соус устричный|бут;Соус ореховый|бут;Соус рыбный|бут;Соус вустерский|бут;Соус бальзамический|бут;Соус бальзамический с трюфелем|бут;Соус барбекю|бут;Соус терияки|бут;Соус сырный|бут;Соус кетчуп|бут;Соус томатный для пиццы|бан;Соус гранатовый|бут;Паста Том Ям|бан;Горчица французская|бан;Горчица русская|бан;Хрен|бан;Уксус столовый 9%|бут',
spices:'Перец чёрный|уп;Чеснок сублимированный сухой|уп;Соль нитритная|уп;Соль экстра|уп;Корица|уп;Приправа универсальная|уп;Сухой бульон со вкусом бекона|уп;Сухой бульон со вкусом рыбы|уп;Сухой бульон со вкусом курицы|уп;Приправа карри|уп;Прованские травы|уп;Паприка|уп;Глутамат натрия|уп;Приправа «Красный чили»|уп',
oils:'Масло кунжутное|бут;Масло оливковое|бут;Масло подсолнечное|бут',
preserves:'Каперсы|бан;Перец халапеньо|бан;Оливки|бан;Маслины|бан;Корнишоны|бан;Томаты черри маринованные|бан;Капуста квашеная|кг'};

const iso=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const BDAY_H=6;
const dAdd=(n,b)=>{const d=b?new Date(b+'T12:00'):new Date(Date.now()-BDAY_H*36e5);d.setDate(d.getDate()+n);return iso(d)};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const blank=cook=>({cook:cook||null,date:dAdd(1),note:'',items:{},editId:null});
const L=Object.assign({draft:blank(),me:null,lu:{},out:[],mt:[]},LS.get('vip3-local',{}));
if(!L.mt)L.mt=[];
if(!L.draft||!L.draft.items)L.draft=blank();
const savedPrepDate=LS.get('vip3-prep-date','');
let DATA=LS.get('vip3-cache',{}),PC=null,PCC=null,cat='all',qs='',edit=0,pd=/^\d{4}-\d{2}-\d{2}$/.test(savedPrepDate)?savedPrepDate:dAdd(0),tab='order',qg='main',want='',sm=iso(new Date()).slice(0,7),sf=L.sf||(L.me?L.me.id:'all'),se=0,wd=dAdd(0),wcat='all',wq='',woDraft=null;const ssel=new Set();
const saveL=()=>LS.set('vip3-local',L);
const base=[];BASE.forEach(([id])=>CAT[id].split(';').forEach(e=>{const[n,u]=e.split('|');base.push({id:'b:'+id+':'+n,n,c:id,u})}));
const ek=s=>String(s).replace(/[.#$\[\]\/]/g,'_');
let ac,cp,mg;
const actx=()=>{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();cp=ac.createDynamicsCompressor();cp.threshold.value=-14;cp.knee.value=24;cp.ratio.value=5;cp.attack.value=.003;cp.release.value=.22;mg=ac.createGain();mg.gain.value=1.9;cp.connect(mg);mg.connect(ac.destination)}if(ac.state==='suspended')ac.resume();return ac};
const voice=(f,t0,d,o)=>{const g=ac.createGain(),parts=o.p||[[1,1]],S=parts.reduce((a,b)=>a+b[1],0);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(o.v,t0+(o.a||.006));g.gain.exponentialRampToValueAtTime(.0001,t0+d);g.connect(cp);
parts.forEach(([r,a])=>{const os=ac.createOscillator(),pg=ac.createGain();os.type=o.t||'sine';if(o.s){os.frequency.setValueAtTime(f*r*o.s,t0);os.frequency.exponentialRampToValueAtTime(f*r,t0+(o.sd||.05))}else os.frequency.setValueAtTime(f*r,t0);pg.gain.value=a/S;os.connect(pg);pg.connect(g);os.start(t0);os.stop(t0+d+.03)})};
const play=seq=>{try{actx();const t=ac.currentTime+.004;seq.forEach(([f,at,d,o])=>voice(f,t+at,d,o))}catch(e){}};
const BELL=[[1,1],[2,.42],[3.01,.2],[4.17,.09]];
const snd={tap:()=>play([[1750,0,.08,{v:.5,p:[[1,1],[2.1,.2]],a:.002}]]),add:()=>play([[932,0,.16,{v:.7,p:BELL,a:.004}],[1397,.075,.24,{v:.7,p:BELL,a:.004}]]),ok:()=>play([[784,0,.26,{v:.8,p:BELL}],[1175,.12,.3,{v:.8,p:BELL}],[1568,.26,.6,{v:.78,p:BELL}]]),warn:()=>play([[360,0,.17,{v:.85,t:'triangle',s:1.14,sd:.06,a:.008}],[262,.18,.3,{v:.85,t:'triangle',s:1.12,sd:.07,a:.008}]]),ask:()=>play([[740,0,.2,{v:.72,p:BELL}],[932,.15,.34,{v:.72,p:BELL}]])};
const vib=n=>navigator.vibrate&&navigator.vibrate(n);
let tt;const toast=m=>{const e=$('#tg');e.textContent=m;e.className='tg on';clearTimeout(tt);tt=setTimeout(()=>e.className='tg',2400)};

const fq=q=>{const v=parseFloat(String(q).replace(',','.'));return isFinite(v)&&v>0?Math.round(v*100)/100:0};
const fmtQ=q=>String(q).replace('.',',');
const day=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12).toLocaleDateString('ru',{weekday:'short',day:'2-digit',month:'2-digit'})};
const tm=ts=>new Date(ts).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'});
// ---------- облако ----------
function put(path,val,merge){const k=path.split('/').filter(Boolean);
if(!k.length){if(merge){DATA=DATA||{};for(const[a,b]of Object.entries(val||{}))b===null?delete DATA[a]:DATA[a]=b}else DATA=val||{};return}
let o=DATA;for(let i=0;i<k.length-1;i++){if(!o[k[i]]||typeof o[k[i]]!=='object')o[k[i]]={};o=o[k[i]]}
const l=k[k.length-1];
if(merge){const t=o[l]&&typeof o[l]==='object'?o[l]:(o[l]={});for(const[a,b]of Object.entries(val||{}))b===null?delete t[a]:t[a]=b}
else if(val===null||val===undefined)delete o[l];else o[l]=val}
const D={};let raf=0,ct;
const dirty=k=>{D[k]=1;if(k==='catalog')PC=null;if(k==='prepCats')PCC=null;if(!raf)raf=requestAnimationFrame(render)};
const DEV=LS.get('vip3-dev','')||(()=>{const v=uid();LS.set('vip3-dev',v);return v})();
const ST={open:{},seen:{},err:'',lastErr:'',poll:0};
const setSt=()=>{const s=$('#saved');if(DEMO){s.textContent='◌';s.title='Демо-режим';s.classList.remove('on','err','pend');return}
const n=L.out.length,o=Object.values(ST.open).some(Boolean)||Date.now()-(ST.poll||0)<8000;
s.textContent=!DB?'…':n?'↻'+n:ST.err?'⚠':o?'●':'○';s.title=!DB?'Подключение…':n?'Отправка: '+n:ST.err?'Ошибка — нажмите для диагностики':o?'Онлайн':'Нет связи';s.classList.toggle('on',!!(o&&!n&&!ST.err));s.classList.toggle('err',!!ST.err);s.classList.toggle('pend',!!n&&!ST.err)};
let AU={t:'',rt:LS.get('vip3-rt',''),exp:0,ok:false};
const isAdmin=()=>AU.ok,ed=()=>edit&&AU.ok;
const fetchFast=(url,options={},limit=12000)=>{if(typeof AbortController==='undefined')return fetch(url,options);const c=new AbortController(),timer=setTimeout(()=>c.abort(),limit);return fetch(url,{...options,signal:c.signal}).then(r=>{clearTimeout(timer);return r},e=>{clearTimeout(timer);throw e})};
async function tok(){if(!AU.rt)return'';if(AU.t&&Date.now()<AU.exp-6e4)return AU.t;
const r=await fetchFast('https://securetoken.googleapis.com/v1/token?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(AU.rt)});
const j=await r.json();if(!r.ok){if(r.status===400){AU={t:'',rt:'',exp:0,ok:false};LS.set('vip3-rt','')}throw new Error('auth')}
AU={t:j.id_token,rt:j.refresh_token,exp:Date.now()+j.expires_in*1000,ok:true};LS.set('vip3-rt',AU.rt);return AU.t}
async function detect(){if(DEMO||DB)return;const p=CFG.projectId;const list=[LS.get('vip3-db',''),`https://${p}-default-rtdb.europe-west1.firebasedatabase.app`,`https://${p}-default-rtdb.firebaseio.com`,`https://${p}-default-rtdb.asia-southeast1.firebasedatabase.app`].filter(Boolean);
for(const u of list){try{const r=await fetchFast(u+'/.json?shallow=true',{},2500);if(r.ok||r.status===401||r.status===403){DB=u;LS.set('vip3-db',u);return}}catch{}}}
async function api(m,p,b){if(!DB)throw new Error('nodb');const t=await tok();const r=await fetchFast(`${DB}/${p}.json${t?'?auth='+t:''}`,{method:m,headers:b!==undefined?{'Content-Type':'application/json'}:undefined,body:b!==undefined?JSON.stringify(b):undefined});if(!r.ok){const e=new Error('http');e.status=r.status;throw e}return r}
let fl=0,retryAt=0,failures=0;
async function flush(){if(fl||DEMO||!L.out.length||Date.now()<retryAt)return;fl=1;
try{do{while(L.out.length){const o=L.out[0];try{await api(o.m,o.p,o.b)}catch(e){if([400,404].includes(e.status)){ST.err=ST.lastErr=`HTTP ${e.status} · ${o.m} ${o.p}`;L.out.shift();saveL();snd.warn();toast('Не сохранено (код '+e.status+'). Проверьте соединение и правила Firebase');setSt();continue}if([401,403].includes(e.status)){ST.err=ST.lastErr=`HTTP ${e.status} · ${o.m} ${o.p}`;snd.warn();toast('Нет прав. Проверьте правила Firebase или войдите как руководитель');setSt()}throw e}ST.err='';failures=0;retryAt=0;L.out.shift();saveL()}await bumpMeta()}while(L.out.length)}catch{failures++;retryAt=Date.now()+Math.min(60000,1000*Math.pow(2,Math.min(failures-1,6)))}fl=0;setSt()}
function mut(m,p,v){put('/'+p,m==='DELETE'?null:v,m==='PATCH');dirty(p.split('/')[0]);if(DEMO){LS.set('vip3-cache',DATA);return}L.out.push({m,p,b:v});if(!metaBroken){const k=mkey(p);if(L.mt.indexOf(k)<0)L.mt.push(k)}saveL();setSt();flush()}
const ES={};
function listen(key,prefix,q){if(DEMO||!DB||!window.EventSource)return;const route=prefix+'|'+(q||'');if(ES[key]&&ES[key].__route===route&&ES[key].readyState!==2)return;if(ES[key])ES[key].close();
const es=ES[key]=new EventSource(`${DB}/${prefix}.json${q?'?'+q:''}`);es.__route=route;ST.open[key]=false;
es.__seen=0;const on=(t,m)=>es.addEventListener(t,e=>{es.__seen=ST.seen[key]=Date.now();try{const d=JSON.parse(e.data);put('/'+prefix+d.path,d.data,m);if(key==='meta')onMeta().catch(()=>{});else dirty(prefix.split('/')[0])}catch{}});
on('put',0);on('patch',1);es.addEventListener('keep-alive',()=>{es.__seen=ST.seen[key]=Date.now()});
es.onopen=()=>{ST.open[key]=true;es.__seen=ST.seen[key]=Date.now();setSt();flush()};
es.onerror=()=>{ST.open[key]=false;setSt();if(es.readyState===2&&ES[key]===es)setTimeout(()=>{if(ES[key]===es)listen(key,prefix,q)},4000)}}
// ---- «живая» связь: ОДИН поток по лёгкому узлу meta (мгновенно) + короткие запросы данных; если поток недоступен — быстрый опрос ----
const mkey=p=>{const a=String(p).split('/');return(a[0]==='prep'||a[0]==='writeoffs'||a[0]==='shifts'||a[0]==='prepMeta')&&a[1]?a[0]+'_'+a[1]:a[0]};
async function jget(p,q,auth){let t='';if(auth){t=await tok();if(!t)throw new Error('auth')}const qs=[q,t?'auth='+t:''].filter(Boolean).join('&');const r=await fetchFast(`${DB}/${p}.json${qs?'?'+qs:''}`,{},9000);if(!r.ok){const e=new Error('http');e.status=r.status;throw e}return r.json()}
const MV={};let metaBroken=0,pollBusy=0,tickN=0;
const pendingFor=mk=>L.out.some(o=>mkey(o.p)===mk);
const routeMap=()=>({team:['team'],catalog:['catalog'],orders:['orders','orderBy=%22created%22&limitToLast=80'],prep:['prep/'+pd],prepPrev:['prep/'+dAdd(-1,pd)],prepTom:['prep/'+dAdd(1)],prepToday:['prep/'+dAdd(0)],plan:['plan'],prepLibrary:['prepLibrary'],prepPins:['prepPins'],prepCats:['prepCats'],writeoffs:['writeoffs/'+(tab==='writeoff'?wd:dAdd(0))],sched:['sched'],shifts:['shifts/'+dAdd(1)],shiftsLast:['shifts/_last'],prepMeta:['prepMeta/'+pd],prepMetaTom:['prepMeta/'+dAdd(1)],prepMetaToday:['prepMeta/'+dAdd(0)],woPrev:['writeoffs/'+dAdd(-1)],payroll:['payroll','',true]});
const activeKeys=()=>{const keys=new Set(['team']);if(tab==='order'){keys.add('catalog');keys.add('shifts');keys.add('shiftsLast');keys.add('sched')}if(tab==='writeoff'){keys.add('catalog');keys.add('writeoffs');keys.add('woPrev')}if(tab==='prep'){keys.add('prep');keys.add('prepMeta');keys.add('prepPrev');keys.add('plan');keys.add('prepLibrary');keys.add('prepPins');keys.add('prepCats')}if(dialogOpen('#dcat'))keys.add('prepCats');if(tab==='sched'){keys.add('sched');keys.add('prepPins')}if(tab==='cab'){keys.add('sched');if(isAdmin())keys.add('payroll')}if(dialogOpen('#dr')||dialogOpen('#dh')){['shifts','shiftsLast','sched','prepTom','prepToday','prepMetaTom','prepMetaToday','writeoffs','woPrev','catalog'].forEach(k=>keys.add(k))}if(dialogOpen('#dh'))keys.add('orders');return keys};
const atPath=p=>{let o=DATA;for(const k of String(p).split('/')){if(o==null||typeof o!=='object')return null;o=o[k]}return o===undefined?null:o};
const sig=v=>JSON.stringify(v===undefined?null:v);
function onMeta(force){if(DEMO||!DB)return Promise.resolve();const routes=routeMap(),meta=DATA.meta||{},jobs=[];if(tab==='cab'&&isAdmin()&&MV.cabinet!==meta.cabinet){MV.cabinet=meta.cabinet;loadIn()}
activeKeys().forEach(k=>{const r=routes[k];if(!r)return;const mk=mkey(r[0]),want=r[0]+'|'+(r[1]||'')+'#'+(meta[mk]||0);if(!force&&MV[k]===want)return;if(pendingFor(mk))return;
jobs.push(jget(r[0],r[1],r[2]).then(d=>{if(pendingFor(mk))return;MV[k]=want;if(sig(atPath(r[0]))===sig(d))return;put('/'+r[0],d);dirty(r[0].split('/')[0])}).catch(e=>{if(r[2])return;throw e}))});
return Promise.all(jobs)}
async function pollMeta(force){if(pollBusy||DEMO||!DB||document.hidden)return;pollBusy=1;
try{const sse=ST.open.meta&&!metaBroken;if(!sse&&!metaBroken)DATA.meta=(await jget('meta'))||{};const noMeta=!Object.keys(DATA.meta||{}).length;await onMeta(force||metaBroken||noMeta);ST.poll=Date.now()}catch{}
pollBusy=0;setSt()}
const streams=()=>{Object.keys(ES).forEach(k=>{if(k!=='meta'){ES[k].close();delete ES[k];ST.open[k]=false}});listen('meta','meta');pollMeta(false)};
const restartStreams=()=>{Object.keys(ES).forEach(k=>{try{ES[k].close()}catch{}delete ES[k];ST.open[k]=false});streams()};
async function bumpMeta(){while(L.mt&&L.mt.length&&!metaBroken){const k=L.mt.shift();saveL();try{await api('PUT','meta/'+k,Date.now())}catch(e){if([400,401,403,404].includes(e.status)){metaBroken=1;L.mt.length=0;saveL();break}if(L.mt.indexOf(k)<0)L.mt.unshift(k);saveL();throw e}}}
// ---------- каталог ----------
const cat0=()=>DATA.catalog||{};
const prods=()=>PC||(PC=[...base.filter(p=>!(cat0().hidden||{})[ek(p.id)]).map(p=>{const e=(cat0().edits||{})[ek(p.id)];return e?{...p,n:e.n||p.n,u:e.u||p.u}:p}),...Object.entries(cat0().custom||{}).map(([k,v])=>({id:'c:'+k,k,n:v.n,c:v.c,u:v.u}))].sort((a,b)=>a.n.localeCompare(b.n,'ru')));
const cats=()=>[...BASE.map(([id,n,e])=>({id,n,e})),...Object.entries(cat0().groups||{}).map(([k,v])=>({id:k,n:v.n,e:v.e||'📦',g:1}))];
const team=()=>{const a=Object.entries(DATA.team||{}).map(([id,v])=>({id,n:String(v.n||''),r:String(v.r||''),color:String(v.color||''),u:String(v.u||'').replace(/^@+/,'')}));if(!a.some(c=>c.n.trim().toLocaleLowerCase('ru')==='хоссам'))a.push({id:'chef-hossam',n:'Хоссам',r:'Шеф',u:'',virtual:true});return a.sort((x,y)=>{const xc=x.n.trim().toLocaleLowerCase('ru')==='хоссам',yc=y.n.trim().toLocaleLowerCase('ru')==='хоссам';return xc===yc?x.n.localeCompare(y.n,'ru'):xc?-1:1})};
const PALETTE=['#b91c1c','#c2410c','#a16207','#4d7c0f','#15803d','#0f766e','#0369a1','#1d4ed8','#6d28d9','#a21caf','#be123c','#475569'];
const hashColor=id=>{let h=2166136261,s=String(id);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return PALETTE[h%PALETTE.length]};
const cookColor=id=>{const c=team().find(x=>x.id===id);return c&&PALETTE.includes(c.color)?c.color:hashColor(id)};
const ensureTeamColors=()=>{const used=[];team().forEach(k=>{if(k.virtual){used.push(hashColor(k.id));return}let c=PALETTE.includes(k.color)&&!used.includes(k.color)?k.color:'';if(!c)c=PALETTE.find(x=>!used.includes(x))||hashColor(k.id);used.push(c);if(k.color!==c)mut('PATCH','team/'+k.id,{color:c})})};
const isWork=s=>s===true||s==='Р'||!!(s&&(s.work||s.r==='Р'||s.f||s.t));
const workLabel=s=>s&&s.f&&s.t?`${s.f}–${s.t}`:(s&&s.r?s.r:'Р');
const norm=o=>({...o,items:Array.isArray(o.items)?o.items:Object.values(o.items||{}),note:o.note||''});
const ords=()=>Object.values(DATA.orders||{}).filter(o=>o&&o.id&&o.cook).map(norm).sort((a,b)=>b.created-a.created);
const dI=()=>Object.values(L.draft.items),cnt=()=>dI().length;
const syncDraft=()=>{const m=new Map(prods().map(p=>[p.id,p]));for(const it of dI()){const p=m.get(it.id);if(p)it.n=p.n}saveL()};
// ---------- интерфейс ----------
const unitSel=(id,u)=>{const us=UNITS.includes(u)?UNITS:[...UNITS,u];return `<select class="us" data-un="${esc(id)}" aria-label="Единица">${us.map(x=>`<option${x===u?' selected':''}>${esc(x)}</option>`).join('')}</select>`};
const stepper=it=>`<div class="st"><button data-a="dec" data-id="${esc(it.id)}">−</button><input inputmode="decimal" data-q="${esc(it.id)}" value="${fmtQ(it.qty)}" aria-label="Количество">${unitSel(it.id,it.u)}<button data-a="inc" data-id="${esc(it.id)}">+</button></div>`;
const row=p=>{const it=L.draft.items[p.id],i=esc(p.id);return `<div class="it${it?' on':''}" data-r="${i}"><div class="n">${esc(p.n)}</div>${it?stepper(it):`<button data-a="add" data-id="${i}" aria-label="Добавить">＋ ${esc(L.lu[p.id]||p.u)}</button>`}${ed()?`<button class="x" data-a="editp" data-id="${i}" aria-label="Изменить">✎</button><button class="x" data-a="delp" data-id="${i}" aria-label="Удалить товар">✕</button>`:''}</div>`};
const chipsFor=(act,sel)=>team().map(k=>`<button class="chip${sel&&sel.id===k.id?' on':''}" data-a="${act}" data-id="${k.id}">${esc(k.n)}<small>${esc(k.r)}</small></button>`).join('')||'<span style="color:var(--mu)">Повара не добавлены — обратитесь к руководителю</span>';
const rCooks=()=>{$('#cooks').innerHTML=chipsFor('pick',L.draft.cook)};
const rPCooks=()=>{$('#pcooks').innerHTML=chipsFor('me',L.me)};
const rCats=()=>{const cs=cats(),n=s=>cs.find(c=>c.id===s);$('#cats').innerHTML=`<button class="chip${cat==='all'?' on':''}" data-a="cat" data-id="all">Все</button>`+cs.map(c=>`<button class="chip${cat===c.id?' on':''}" data-a="cat" data-id="${c.id}">${c.e} ${esc(c.n.split(' и ')[0].split(',')[0])}</button>`).join('')+`<button class="chip" data-a="newg">＋ Группа</button>`+(ed()&&n(cat)&&n(cat).g?`<button class="chip" data-a="editg">✎ Группа</button><button class="chip" style="color:var(--rd)" data-a="delg">🗑 Удалить группу</button>`:'')};
const rList=()=>{const q=qs.trim().toLowerCase(),cs=cats();let h='';const ps=prods().filter(p=>(cat==='all'||p.c===cat)&&(!q||p.n.toLowerCase().includes(q)));
for(const c of cs){const g=ps.filter(p=>p.c===c.id);if(g.length)h+=(cat==='all'||q?`<div class="gh">${c.e} ${esc(c.n)}</div>`:'')+g.map(row).join('')}
$('#list').innerHTML=h||`<div class="em">Ничего не найдено.<br>Нажмите «＋ Товар», чтобы добавить.</div>`};
const sumDn=()=>{$('#dnsum').textContent='📅 Поставка '+day(L.draft.date)+(L.draft.note?' · 💬 '+L.draft.note.slice(0,22):'')};
const placeInd=()=>{const nav=document.querySelector('.tabs'),on=nav&&nav.querySelector('.tab.on'),ind=nav&&nav.querySelector('.tabind');if(!on||!ind)return;if(!on.offsetWidth)return;ind.style.width=on.offsetWidth+'px';ind.style.transform='translateX('+on.offsetLeft+'px)';nav.classList.add('ind')};
const rBar=()=>{$('#cnt').textContent=cnt()?cnt()+' поз.':'пусто';$('#date').value=L.draft.date;$('#note').value=L.draft.note;fitNote();sumDn()};
function fitNote(){const n=$('#note');if(!n||!n.scrollHeight)return;n.style.height='auto';n.style.height=Math.min(n.scrollHeight+2,260)+'px'}
const rRev=()=>{const it=dI(),c=L.draft.cook;$('#rc').innerHTML=c?esc(c.n)+' — '+esc(c.r):'<span style="color:var(--rd)">не выбран</span>';
$('#rb').innerHTML=it.length?it.sort((a,b)=>a.n.localeCompare(b.n,'ru')).map(i=>`<div class="it on"><div class="n">${esc(i.n)}</div>${stepper(i)}<button class="x" data-a="rm" data-id="${esc(i.id)}">✕</button></div>`).join(''):'<div class="em">Список пуст</div>'};
const rTeam=()=>{$('#tl').innerHTML=team().length?team().map(k=>`<div class="it"><div class="n">${esc(k.n)}<i>${esc(k.r)}${k.u?' · @'+esc(k.u):''}</i></div><button class="x" data-a="cuser" data-id="${esc(k.id)}" aria-label="Username" title="Username">@</button>${k.virtual?'':`<button class="x" data-a="delc" data-id="${esc(k.id)}">✕</button>`}</div>`).join(''):'<div class="em">Добавьте поваров с должностями</div>'};
const rAdm=()=>{const b=$('#edb');b.textContent='Режим правки товаров: '+(ed()?'ВКЛ':'выкл');b.className=ed()?'d':'';const h=Object.keys(cat0().hidden||{}).length,u=$('#unh');u.textContent='Вернуть скрытые ('+h+')';u.disabled=!h};
const nt=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();let qb=0,tk=null;
const PU=['порц','кг','г','л','мл','шт','уп','кор','пак','бан','бут','пуч'];
const PCATS0=[['cut','🔪','Нарезка'],['sauce','🥫','Соусы'],['hot','🍲','Горячее'],['cold','🥗','Холодное'],['meat','🥩','Мясо и рыба'],['side','🍚','Гарниры'],['dess','🍰','Десерты'],['bake','🥖','Выпечка и тесто'],['other','📦','Другое']];
let lf='all',CL=null,psec=LS.get('vip3-psec','main'),bqt=(v=>v==='prep'||v==='info'?v:'')(LS.get('vip3-bqt','')),svd=null,pc=null,acctData=null,ses=null,cabPick=null,idleT=0,hideT=0,inBusy=0;
const seenRows=new Set(),justDone=new Set();
const pcats=()=>PCC||(PCC=[...PCATS0.slice(0,-1),...Object.entries(DATA.prepCats||{}).filter(([k,v])=>v&&v.n).sort((a,b)=>(a[1].o||0)-(b[1].o||0)).map(([k,v])=>[k,v.e||'🏷️',v.n]),PCATS0[PCATS0.length-1]]);
const catById=k=>pcats().find(c=>c[0]===k);
const pk=i=>{const k=(i&&i.k)||'other';return catById(k)?k:'other'},pcIcon=k=>(catById(k)||PCATS0[PCATS0.length-1])[1];
const inSec=g=>psec==='banq'?g==='banq':g!=='banq';
const matchF=i=>inSec(i.g)&&(lf==='all'||(lf==='unk'?i.ks==='?':pk(i)===lf));
const curK=()=>(lf!=='all'&&lf!=='banq'&&lf!=='unk')?lf:'other';
const norm2=s=>String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const STOP=new Set(['для','на','из','по','под','над','при','без','или','что','как','все','его','ее','их','это']);
const toks=s=>norm2(s).split(' ').filter(w=>w.length>=3&&!STOP.has(w));
const DICT={
cut:[['нарез',2],['порез',2],['нашинк',2],['шинк',2],['почист',2],['очист',2],['чистк',2],['измельч',2],['кубик',2],['брусоч',2],['солом',1.5],['слайс',2],['кольц',1],['лук',1.5],['морков',1.5],['огур',1],['помидор',1],['томат',1],['болгар',1],['капуст',1],['зелен',1.5],['укроп',1.5],['петруш',1.5],['кинз',1.5],['базилик',1.5],['редис',1.5],['сельдер',1.5],['чеснок',1.5],['имбир',1.5],['кабач',1],['баклаж',1],['гриб',1],['шампин',1],['перец',1],['чили',1],['овощ',1],['картоф',1]],
sauce:[['соус',3],['заправк',3],['майонез',3],['кетчуп',3],['горчиц',3],['песто',3],['маринад',2.5],['дрессинг',3],['аджик',3],['ткемали',3],['наршараб',3],['бальзам',1.5],['глазур',2],['сироп',2],['терияки',3],['барбекю',2],['чимичурри',3],['сальс',3],['гуакамол',3],['хумус',2],['томатн',2]],
hot:[['суп',3],['бульон',3],['борщ',3],['солянк',3],['харчо',3],['щи',3],['рассольник',3],['уха',3],['том ям',3],['жарк',1.5],['жарить',1.5],['обжар',1.5],['запек',2],['запеч',2],['туш',2],['свар',1.5],['отвар',1.5],['рагу',3],['плов',3],['каш',2],['лазань',3],['ризотто',3],['жюльен',3],['гриль',1]],
cold:[['салат',3],['окрошк',3],['закуск',3],['холодец',3],['заливн',3],['карпаччо',3],['тартар',2],['брускет',3],['канапе',3],['сэндвич',2],['бутерброд',2],['цезар',3],['греческ',3],['оливье',3],['винегрет',3],['шуб',2],['паштет',3],['рулет',2],['ассорти',2],['тарталет',3],['ролл',1],['суши',2],['сашими',2]],
meat:[['мяс',3],['говяд',3],['говяж',3],['свинин',3],['баранин',3],['телятин',3],['кури',3],['куриц',3],['курин',3],['цыпл',3],['грудк',2.5],['бедр',2],['крыл',2],['филе',2],['фарш',3],['котлет',3],['колбас',2],['сосиск',2],['бекон',2],['ветчин',2],['стейк',3],['ребр',3],['шашлык',3],['утк',3],['индейк',3],['печень',3],['рыб',3],['лосос',3],['семг',3],['форел',3],['креветк',3],['кальмар',3],['мидии',3],['мидий',3],['осьминог',3],['краб',3],['треск',3],['судак',3],['дорад',3],['сибас',3],['тунец',3],['угор',3],['вакуум',1.5],['вакум',1.5],['замарин',1.5],['бургер',2],['люля',3],['кебаб',3],['тефтел',3]],
side:[['гарнир',3],['рис',2.5],['гречк',3],['макарон',3],['спагетти',3],['паст',2.5],['булгур',3],['кускус',3],['пюре',3],['картофел',1.5],['фри',2],['лапш',3],['нут',2],['чечевиц',3],['полент',3],['ньокк',3],['перловк',3],['пшен',1.5],['киноа',3]],
dess:[['десерт',3],['торт',3],['пирожн',3],['тирамису',3],['чизкейк',3],['мусс',3],['панакот',3],['мороженое',3],['сорбет',3],['крем',2],['бисквит',3],['эклер',3],['профитрол',3],['карамел',2],['шоколад',2],['варень',2],['джем',2],['конфитюр',2],['желе',3],['пудинг',3],['штрудел',3],['ягод',1.5],['клубник',1.5],['сладк',1.5],['печенье',3]],
bake:[['тест',3],['выпечк',3],['хлеб',3],['булк',3],['пицц',3],['лепеш',3],['лаваш',3],['багет',3],['пирог',3],['пирожк',3],['круассан',3],['блин',3],['олад',3],['вареник',3],['пельмен',3],['мант',3],['хинкал',3],['чебурек',3],['самс',3],['фокач',3],['чиабатт',3],['сухар',2],['гренк',2],['мук',2],['дрожж',2],['замес',2]]};
function classify(text){const n=norm2(text);if(!n)return{k:'other',ks:'?'};const lib=libItems();
const ex=lib.find(i=>norm2(i.t)===n&&i.ks==='user'&&i.k&&i.k!=='other'&&catById(i.k));if(ex)return{k:ex.k,ks:'auto'};
const sc={},add=(k,v)=>{sc[k]=(sc[k]||0)+v},ws=toks(text);
for(const k in DICT)for(const[st,w]of DICT[k]){if(st.indexOf(' ')>=0){if(n.indexOf(st)>=0)add(k,w)}else if(ws.some(x=>x.indexOf(st)===0))add(k,w)}
const votes={};lib.forEach(i=>{if(i.ks!=='user'||!i.k||i.k==='other'||!catById(i.k))return;toks(i.t).forEach(w=>{const v=votes[w]=votes[w]||{};v[i.k]=(v[i.k]||0)+1})});
ws.forEach(w=>{const v=votes[w];if(!v)return;const tot=Object.values(v).reduce((a,b)=>a+b,0);for(const k in v)add(k,2.5*v[k]/tot)});
const r=Object.entries(sc).sort((a,b)=>b[1]-a[1]);if(!r.length)return{k:'other',ks:'?'};const s1=r[0][1],s2=r[1]?r[1][1]:0;
return(s1>=2&&s1-s2>=0.75)?{k:r[0][0],ks:'auto'}:{k:'other',ks:'?'}}
let autoBusy=0;
const autoLib=()=>{if(autoBusy)return;autoBusy=1;libItems().filter(i=>!i.ks).slice(0,40).forEach(i=>{if(i.k&&i.k!=='other'){mut('PATCH','prepLibrary/'+i.id,{ks:'user'});return}const cl=classify(i.t);mut('PATCH','prepLibrary/'+i.id,{k:cl.k,ks:cl.ks})});autoBusy=0};
const rFil=()=>{if(lf!=='all'&&lf!=='unk'&&lf!=='banq'&&!catById(lf))lf='all';const unk=libItems().filter(i=>i.ks==='?').length,h=`<button class="chip${lf==='all'?' on':''}" data-a="lfil" data-id="all">Все</button>`+pcats().map(c=>`<button class="chip${lf===c[0]?' on':''}" data-a="lfil" data-id="${esc(c[0])}">${esc(c[1])} ${esc(c[2])}</button>`).join('')+(isAdmin()?'<button class="chip addcat" data-a="catmgr">＋ Категория</button>':'')+(unk?`<button class="chip${lf==='unk'?' on':''}" data-a="lfil" data-id="unk">❓ Без категории · ${unk}</button>`:'');['#qfil','#libfil'].forEach(s=>{const e=$(s);if(e)e.innerHTML=h})};
const CLOSE_ITEMS=['Всё в порядке на кухне','Все розетки отключены','Фритюр выключен кнопкой','Печь пекаря на кухне выключена кнопкой','Вилка плиты в холодном цеху вынута из розетки','Главные кнопки 4, 6, 7 и 9 выключены','Тестомес чистый','На кухне чисто','Мусорные пакеты вынесены с кухни'];
const closingCheck=()=>new Promise(res=>{const d=$('#dcl'),st=CLOSE_ITEMS.map(()=>0);const draw=()=>{const n=st.reduce((a,b)=>a+b,0);$('#clist').innerHTML=CLOSE_ITEMS.map((x,i)=>`<button class="cl${st[i]?' on':''}" data-a="clchk" data-id="${i}"><span class="ck">${st[i]?'✓':''}</span><span>${esc(x)}</span></button>`).join('');$('#cprog').textContent=`${n} из ${CLOSE_ITEMS.length}`;$('#cgo').disabled=n<CLOSE_ITEMS.length};CL={st,draw,res};draw();snd.ask();vib(40);d.onclose=()=>res(false);d.oncancel=()=>res(false);d.showModal()});
const guestsOf=d=>{const g=Number(((DATA.prepMeta||{})[d]||{}).guests);return g>0?g:0};
const bqEff=()=>bqt||(Object.values(dm()).some(t=>t&&t.g==='banq')?'prep':'info');
const okTm=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v),svKey=v=>{const m=+v.slice(0,2)*60+ +v.slice(3);return m<360?m+1440:m},svSort=(a,b)=>{const x=okTm(a.sv),y=okTm(b.sv);if(x&&y)return svKey(a.sv)-svKey(b.sv)||(a.c||0)-(b.c||0);if(x!==y)return x?-1:1;return(a.c||0)-(b.c||0)};
const bqMeta=d=>{const m=(DATA.prepMeta||{})[d]||{};return{title:String(m.title||''),guests:guestsOf(d),time:okTm(m.time)?m.time:'',place:String(m.place||''),note:String(m.note||'')}};
const bqWrite=()=>{const m=bqMeta(pd),w=(k,v,old)=>{const nv=v===0?'':String(v);if(nv===String(old||''))return;mut(nv===''?'DELETE':'PUT',`prepMeta/${pd}/${k}`,nv===''?undefined:v)};
w('title',$('#bqt').value.trim().replace(/\s+/g,' ').slice(0,80),m.title);
{const gn=Math.round(Number(String($('#bqg').value).replace(',','.')))||0;w('guests',gn>0&&gn<=100000?gn:0,m.guests||'')}
const tv=$('#bqs').value;w('time',okTm(tv)?tv:'',m.time);
w('place',$('#bqp').value.trim().replace(/\s+/g,' ').slice(0,60),m.place);
w('note',$('#bqn').value.trim().slice(0,400),m.note)};
const svChips=()=>{const bt=bqMeta(pd).time;let a;if(bt){const b=+bt.slice(0,2)*60+ +bt.slice(3);a=[0,30,60,90,120,150].map(x=>{const m=(b+x)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')})}else a=['18:00','19:00','20:00','21:00','22:00','23:00'];return a.map(v=>`<button class="chip" data-a="svset" data-id="${v}">${v}</button>`).join('')};
const qtyText=(t,d)=>{if(t&&t.pg){const g=guestsOf(d);return g?`${fmtQ(Math.round(t.pg*g*100)/100)} ${t.pu||''}`.trim():`👥 ${fmtQ(t.pg)} ${t.pu||''}/гость`}return t&&t.q||''};
const qpill=(t,d)=>{const x=qtyText(t,d);return x?`<i class="qpill">${esc(x)}</i>`:'<i class="qpill empty">＋ кол-во</i>'};
const libFind=(t,g)=>libItems().find(i=>nt(i.t)===nt(t)&&((i.g==='banq')===(g==='banq')));
const libId=(t,g)=>hashText(nt(t)+(g==='banq'?'|b':''));
const hashText=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return 'l'+h.toString(36)};
const libItems=()=>Object.entries(DATA.prepLibrary||{}).map(([id,v])=>({id,...v})).filter(v=>v&&v.t);
const rememberPrep=(t,w)=>{if(!t||!t.t||!w)return;const old=libFind(t.t,t.g),id=old?old.id:libId(t.t,t.g);mut('PUT','prepLibrary/'+id,{t:t.t,q:t.q||'',g:t.g||'main',k:t.k||'other',...(t.pg?{pg:t.pg,pu:t.pu}:{}),by:{id:w.id,n:w.n},usedAt:Date.now()})};
const rLibrary=()=>{const q=nt($('#libq').value),items=libItems().filter(i=>matchF(i)&&(!q||nt(i.t).includes(q))).sort((a,b)=>(b.usedAt||0)-(a.usedAt||0));$('#libcount').textContent=`${items.length} сохранено`;$('#liblist').innerHTML=items.length?items.map(i=>`<article class="libitem"><div class="libname">${pcIcon(pk(i))} ${esc(i.t)}</div><div class="libmeta">${i.pg?`👥 ${esc(fmtQ(i.pg))} ${esc(i.pu||'')}/гость · `:i.q?`${esc(i.q)} · `:''}${i.g&&i.g!=='main'?`${esc(gname(i.g))} · `:''}${i.by?`Готовил: ${esc(i.by.n)} · `:'Запись в архиве · '}${i.usedAt?new Date(i.usedAt).toLocaleDateString('ru',{day:'2-digit',month:'2-digit',year:'numeric'}):'Ранее'}</div><div class="lib-actions"><button class="p" data-a="libadd" data-id="${esc(i.id)}">＋ В день</button><button data-a="libedit" data-id="${esc(i.id)}">✎ Изменить</button><button class="d" data-a="libdelete" data-id="${esc(i.id)}">Удалить</button></div></article>`).join(''):'<div class="em">История пока пуста. Добавьте заготовку или отметьте её выполненной.</div>'};
const rCatMgr=()=>{const cs=Object.entries(DATA.prepCats||{}).filter(([k,v])=>v&&v.n).sort((a,b)=>(a[1].o||0)-(b[1].o||0));$('#catl').innerHTML=cs.length?cs.map(([k,v])=>`<div class="catrow"><input class="ce" data-ce="${esc(k)}" value="${esc(v.e||'')}" maxlength="4" aria-label="Значок"><input data-cn="${esc(k)}" value="${esc(v.n)}" maxlength="30" aria-label="Название"><button class="x" data-a="catdel" data-id="${esc(k)}" aria-label="Удалить">✕</button></div>`).join(''):'<div class="small">Своих категорий пока нет. Базовые: '+PCATS0.map(c=>c[1]+' '+c[2]).join(', ')+'.</div>'};
const catEdit=(t,d)=>{if(!isAdmin())return;const id=d.ce||d.cn;if(!(DATA.prepCats||{})[id])return;if(d.cn){const n=t.value.trim().replace(/\s+/g,' ').slice(0,30);if(!n){rCatMgr();return}mut('PATCH','prepCats/'+id,{n})}else{mut('PATCH','prepCats/'+id,{e:Array.from(t.value.trim()||'🏷️').slice(0,2).join('')})}snd.tap()};
const libraryDialog=item=>{const groups=pgroups();$('#lltitle').textContent=item?'Изменить заготовку в архиве':'Добавить заготовку в архив';$('#dl').dataset.id=item?item.id:'';$('#llt').value=item?item.t:'';$('#llq').value=item?item.q||'':'';$('#llg').innerHTML=groups.map(g=>`<option value="${esc(g.id)}"${(item?item.g||'main':qg)===g.id?' selected':''}>${esc(g.n)}</option>`).join('');$('#llc').innerHTML='<option value="">🤖 Определить автоматически</option>'+pcats().map(c=>`<option value="${esc(c[0])}"${item&&item.ks!=='?'&&pk(item)===c[0]?' selected':''}>${esc(c[1])} ${esc(c[2])}</option>`).join('');$('#dl').showModal();$('#llt').focus()};
const dm=()=>(DATA.prep||{})[pd]||{},dayTasks=()=>Object.values(dm());
const pgroups=()=>[{id:'main',n:'Основные'},{id:'banq',n:'Банкет'},...Object.entries((DATA.plan||{}).groups||{}).map(([id,v])=>({id,n:v.n}))];
const gname=g=>(pgroups().find(x=>x.id===g)||{n:'Другое'}).n;
const WO_REASONS=[['spoiled_v2','Порча продукта'],['damaged_v2','Повреждение товара'],['expired','Истёк срок годности'],['storage','Нарушение условий хранения'],['other','Другая причина']];
const woReason=id=>id==='spoiled'?'Старый вариант: порча или повреждение':(WO_REASONS.find(x=>x[0]===id)||WO_REASONS[4])[1];
const ruCount=(n,one,two,five)=>{const a=n%100,b=n%10;return a>=11&&a<=14?five:b===1?one:b>=2&&b<=4?two:five};
const woRows=date=>Object.entries(((DATA.writeoffs||{})[date])||{}).map(([id,v])=>({id,...(v||{}),c:(v&&v.c)||(prods().find(p=>p.id===v?.pid)||{}).c||''})).filter(v=>v&&v.name&&!v.carried);
const writeoffMessage=(date,rows=woRows(date))=>{const cs=cats(),seen=new Set(),out=[`🗑 Списание за ${day(date)}`,''];for(const c of cs){const g=rows.filter(v=>v.c===c.id);if(!g.length)continue;g.forEach(v=>seen.add(v.id));out.push(`${c.e} ${c.n}`,g.sort((a,b)=>a.name.localeCompare(b.name,'ru')).map(v=>`• ${v.name} — ${fmtQ(v.qty)} ${v.unit||''} — ${woReason(v.reason)}${v.note?` (${v.note})`:''}${v.by&&v.by.n?` · Списал: ${v.by.n}`:''}${v.carryFrom?` · перенос с ${day(v.carryFrom)}`:''}`).join('\n'),'')}const rest=rows.filter(v=>!seen.has(v.id));if(rest.length)out.push('📦 Другое',rest.sort((a,b)=>a.name.localeCompare(b.name,'ru')).map(v=>`• ${v.name} — ${fmtQ(v.qty)} ${v.unit||''} — ${woReason(v.reason)}${v.note?` (${v.note})`:''}${v.by&&v.by.n?` · Списал: ${v.by.n}`:''}${v.carryFrom?` · перенос с ${day(v.carryFrom)}`:''}`).join('\n'),'');out.push(`Всего: ${rows.length} поз.`);return out.join('\n')};
const planItems=()=>Object.entries((DATA.plan||{}).items||{}).map(([id,v])=>({id,...v})).filter(i=>i.t);
const carryPendingPrep=()=>{const today=dAdd(0);if(pd!==today)return;const prev=dAdd(-1,today),loaded=DEMO?true:!!(MV.prepPrev&&MV.prepPrev.indexOf('prep/'+prev+'|')===0);if(!loaded)return;const src=(DATA.prep||{})[prev]||{},dst=(DATA.prep||{})[today]||{},names=new Set(Object.values(dst).map(t=>nt(t&&t.t)));let n=0;Object.entries(src).forEach(([id,t],i)=>{if(!t||!t.t||t.done||dst[id]||names.has(nt(t.t)))return;mut('PUT',`prep/${today}/${id}`,{t:t.t,q:t.q||'',g:t.g||'main',k:t.k||'other',...(t.pg?{pg:t.pg,pu:t.pu}:{}),...(t.lid?{lid:t.lid}:{}),carryFrom:prev,c:Date.now()+i});names.add(nt(t.t));n++});if(n)toast(`Перенесено с ${day(prev)}: ${n}`)};
const rPrep=()=>{carryPendingPrep();const allT=Object.entries((DATA.prep||{})[pd]||{}).map(([id,v])=>({id,...v})),ts=allT.filter(t=>inSec(t.g)),rk=t=>nt(t.t)+'|'+(t.g==='banq'),remembered=new Set(libItems().map(rk));allT.filter(t=>t.done&&t.by&&!remembered.has(rk(t))).forEach(t=>{rememberPrep(t,t.by);remembered.add(rk(t))});
const dn=ts.filter(t=>t.done).sort((a,b)=>(b.at||0)-(a.at||0)),gi=g=>Math.max(0,pgroups().findIndex(x=>x.id===(g||'main'))),td=ts.filter(t=>!t.done).sort((a,b)=>psec==='banq'?svSort(a,b):gi(a.g)-gi(b.g)||(a.c||0)-(b.c||0)),k=team();
const sel=t=>`<select class="who" data-by="${t.id}"><option value="">Кто?</option>${k.map(c=>`<option value="${c.id}"${t.by&&t.by.id===c.id?' selected':''}>${esc(c.n)}</option>`).join('')}${t.by&&!k.some(c=>c.id===t.by.id)?`<option value="${esc(t.by.id)}" selected>${esc(t.by.n)}</option>`:''}</select>`;
const ckb=t=>`<button class="ck${justDone.has(t.id)?' pop':''}" data-a="ptog" data-id="${t.id}" aria-label="Отметить">${t.done?'✓':''}</button>`,ckCol=t=>t.g==='banq'?`<div class="ckc">${ckb(t)}<button class="sv${okTm(t.sv)?'':' empty'}" data-a="svopen" data-id="${t.id}" aria-label="Время подачи${okTm(t.sv)?': '+t.sv:''}">${okTm(t.sv)?t.sv:'🕐'}</button></div>`:ckb(t);
const r=t=>`<div class="pr${t.done?' ok':''}${seenRows.has(t.id)?'':' new'}">${ckCol(t)}<div class="pn" data-a="tkopen" data-id="${t.id}"><b>${esc(t.t)}</b><div class="pm">${qpill(t,pd)}${t.g&&t.g!=='main'?`<em>${esc(gname(t.g))}</em>`:''}${t.ks==='?'?'<span class="qk">❓ категория</span>':''}${t.carryFrom?`<span class="cf">↩ ${esc(day(t.carryFrom))}</span>`:''}${t.done&&t.by?`<span class="by">✓ ${esc(t.by.n)} · ${tm(t.at)}</span>`:''}</div></div>${sel(t)}<button class="x" data-a="pdel" data-id="${t.id}" aria-label="Удалить">✕</button></div>`;
$('#plist').innerHTML=ts.length?(dn.length?`<div class="gh">Выполнено · ${dn.length}</div>`+dn.map(r).join(''):'')+(td.length?`<div class="gh">Осталось · ${td.length}</div>`+td.map(r).join(''):''):(psec==='banq'?'<div class="em">Банкета на этот день нет.<br>Добавьте заготовки банкета ниже.</div>':'<div class="em">На этот день заготовок нет.<br>Добавьте ниже или выберите из истории.</div>');
ts.forEach(t=>seenRows.add(t.id));justDone.clear();
$('#pfill').style.width=ts.length?Math.round(dn.length/ts.length*100)+'%':'0%';$('#pinfo').textContent=`${day(pd)} · выполнено ${dn.length} из ${ts.length}`;
$('#pdate').value=pd;[['-1',dAdd(-1)],['today',dAdd(0)],['1',dAdd(1)]].forEach(([id,dt])=>{const b=document.querySelector(`#pseg [data-id="${id}"]`);if(b){b.classList.toggle('on',pd===dt);b.setAttribute('aria-pressed',String(pd===dt))}});
const pins=DATA.prepPins||{},pinned=!!pins[pd],pinButton=$('#ppin'),dates=Object.keys(pins).filter(dt=>/^\d{4}-\d{2}-\d{2}$/.test(dt)&&pins[dt]).sort();pinButton.classList.toggle('on',pinned);pinButton.setAttribute('aria-pressed',String(pinned));pinButton.textContent='📌';pinButton.title=pinned?'День закреплён':'Закрепить день';$('#ppinlabel').hidden=!dates.length;$('#ppins').innerHTML=dates.map(dt=>`<button class="chip pin-chip${dt===pd?' on':''}" data-a="ppick" data-id="${dt}">📌 ${esc(day(dt))}</button>`).join('');rBq();rYday()};
const rBq=()=>{document.querySelectorAll('#psecs button').forEach(b=>{b.classList.toggle('on',b.dataset.id===psec);b.setAttribute('aria-pressed',String(b.dataset.id===psec))});
const all=Object.values(dm()).filter(t=>t&&t.t),c=s=>{const a=all.filter(t=>s==='banq'?t.g==='banq':t.g!=='banq');return a.length?` ${a.filter(t=>t.done).length}/${a.length}`:''};$('#pcm').textContent=c('main');$('#pcb').textContent=c('banq');
const isB=psec==='banq',cur=bqEff(),info=isB&&cur==='info';$('#bqtabs').hidden=!isB;$('#bqinfo').hidden=!info;$('#bqh').hidden=!isB||info;['#plist','#padd','#ydbox','#libbox'].forEach(q=>{$(q).hidden=info});
if(!isB)return;
document.querySelectorAll('#bqtabs button').forEach(b=>{const on=b.dataset.id===cur;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});
const bq=all.filter(t=>t.g==='banq'),bn=bq.length,bd=bq.filter(t=>t.done).length,m=bqMeta(pd);$('#pcq').textContent=bn?` ${bd}/${bn}`:'';
if(info){const fv=(q,v)=>{const e=$(q);if(document.activeElement!==e)e.value=v};fv('#bqt',m.title);fv('#bqs',m.time);fv('#bqg',m.guests||'');fv('#bqp',m.place);fv('#bqn',m.note);$('#bqday').textContent=day(pd);const f=bq.filter(t=>okTm(t.sv)).sort(svSort)[0];$('#bqsum').innerHTML=bn?`Заготовок: <b>${bn}</b> · выполнено <b>${bd}</b>${f?` · первая подача <b>${f.sv}</b>`:''}`:'Заготовок пока нет. Откройте вкладку «Заготовки» и добавьте блюда.'}
else{const parts=[m.time&&`<span>🕐 ${esc(m.time)}</span>`,m.guests&&`<span>👥 ${m.guests}</span>`,m.place&&`<span>📍 ${esc(m.place)}</span>`].filter(Boolean).join('');
$('#bqh').innerHTML=(m.title||parts||m.note)?`<div class="bqs-h"><b>🎉 ${esc(m.title||'Банкет')}</b><button class="g" data-a="bqtab" data-id="info" aria-label="Изменить данные банкета">✎ Изменить</button></div>${parts?`<div class="bqs-m">${parts}</div>`:''}${m.note?`<div class="bqs-n">📝 ${esc(m.note)}</div>`:''}`:`<div class="bqs-h"><span class="small" style="margin:0">Данные банкета не заполнены</span><button class="g" data-a="bqtab" data-id="info">＋ Заполнить</button></div>`}};
const rYday=()=>{const prev=dAdd(-1,pd),ts=Object.values((DATA.prep||{})[prev]||{}).filter(t=>t&&t.t&&inSec(t.g)),dn=ts.filter(t=>t.done).sort((a,b)=>(a.at||0)-(b.at||0)),nd=ts.filter(t=>!t.done);
$('#ydcount').textContent=ts.length?`${day(prev)} · сделано ${dn.length} из ${ts.length}`:day(prev);
$('#ydlist').innerHTML=ts.length?(dn.length?`<div class="gh">Приготовлено · ${dn.length}</div>`+dn.map(t=>`<div class="ydr ok"><b>${esc(t.t)}</b>${t.q?`<i>${esc(t.q)}</i>`:''}<small>${t.by?esc(t.by.n):''}${t.at?' · '+tm(t.at):''}</small></div>`).join(''):'')+(nd.length?`<div class="gh">Не сделано · ${nd.length}</div>`+nd.map(t=>`<div class="ydr"><b>${esc(t.t)}</b>${t.q?`<i>${esc(t.q)}</i>`:''}</div>`).join(''):'')+`<div class="acts"><button class="p" data-a="pcopy">Скопировать на ${esc(day(pd))}</button></div>`:'<div class="em">За предыдущий день записей нет.</div>'};
const rPlan=()=>{const have=new Set(Object.values(dm()).filter(t=>t&&inSec(t.g)).map(t=>nt(t.t))),seen=new Set(),all=[...libItems().sort((a,b)=>(b.usedAt||0)-(a.usedAt||0)).map(i=>({key:'lib:'+i.id,t:i.t,g:i.g,k:i.k})),...planItems().map(i=>({key:'plan:'+i.id,t:i.t,g:i.g,k:i.k}))].filter(i=>{const n=nt(i.t);if(!n||seen.has(n))return false;seen.add(n);return!have.has(n)&&matchF(i)}).slice(0,12);
$('#qlist').innerHTML=all.length?all.map(i=>`<button class="chip qp" data-a="qpick" data-id="${esc(i.key)}">＋ ${esc(i.t)}${i.g==='banq'?' 🎉':''}</button>`).join(''):'<span class="small">В этой категории пока ничего нет.</span>';
rFil()};
const shiftsFor=date=>{const all=DATA.shifts||{},ex=all[date]||{};if(Object.keys(ex).some(k=>ex[k]!==undefined&&ex[k]!==null))return{map:ex,src:'own'};
const last=all._last||{},S=DATA.sched||{},sch=team().filter(c=>S[c.id]&&isWork(S[c.id][date]));
if(sch.length){const m={};sch.forEach(c=>{m[c.id]=last[c.id]||''});return{map:m,src:'sched'}}
return Object.keys(last).some(k=>last[k])?{map:last,src:'last'}:{map:{},src:'none'}};
const setShift=(id,val)=>{const tom=dAdd(1),cur=shiftsFor(tom),next=Object.assign({},cur.map);
if(cur.src!=='own')Object.keys(next).forEach(k=>{next[k]=next[k]||L.at||'14:00';mut('PUT',`shifts/${tom}/${k}`,next[k])});
if(val){next[id]=val;mut('PUT',`shifts/${tom}/${id}`,val)}else{delete next[id];mut('DELETE',`shifts/${tom}/${id}`)}
Object.keys(next).forEach(k=>{if(!next[k])delete next[k]});if(Object.keys(next).length)mut('PUT','shifts/_last',next);else mut('DELETE','shifts/_last')};
let rosBusy=0;
async function refreshRoster(){if(rosBusy||DEMO||!DB||document.hidden)return;rosBusy=1;try{const tom=dAdd(1),ps=['sched','shifts/'+tom,'shifts/_last'],res=await Promise.all(ps.map(p=>jget(p)));let ch=0;ps.forEach((p,i)=>{if(pendingFor(mkey(p)))return;if(sig(atPath(p))!==sig(res[i])){put('/'+p,res[i]);ch=1}});if(ch){rShifts();if(tab==='sched')rSched()}}catch(e){}rosBusy=0}
const rShifts=()=>{const tom=dAdd(1),S=shiftsFor(tom),sh=S.map,k=team(),adm=isAdmin(),on=k.filter(c=>sh[c.id]!==undefined),nm=c=>c.n.split(' ')[0]+(sh[c.id]?' '+sh[c.id]:''),tag=S.src==='sched'?' · по графику':S.src==='last'?' ↻':'';
$('#shtitle').textContent=on.length?`⏰ Завтра: ${on.map(nm).join(' · ')}${tag}`:'⏰ Завтра на смену: не назначено';
$('#shlist').innerHTML=adm?k.map(c=>{const h=sh[c.id]!==undefined;return `<div class="shr${h?' on':''}"><button class="ck" data-a="sfton" data-id="${esc(c.id)}" aria-label="Выйдет на смену">${h?'✓':''}</button><div class="n">${esc(c.n)}<i>${c.u?'@'+esc(c.u):esc(c.r)}</i></div><input type="time" data-sft="${esc(c.id)}" value="${esc(sh[c.id]||L.at||'14:00')}"${h?'':' disabled'}></div>`}).join(''):(k.length?k.map(c=>{const h=sh[c.id]!==undefined;return `<div class="shr${h?' on':' off'}"><span class="shdot">${h?'✓':'–'}</span><div class="n">${esc(c.n)}<i>${c.u?'@'+esc(c.u):esc(c.r)}</i></div><b>${h?(sh[c.id]?esc(sh[c.id]):'на смене'):(on.length?'выходной':'не назначено')}</b></div>`}).join(''):'<div class="small">Команда ещё не добавлена.</div>');
$('#shhint').textContent=adm?(S.src==='sched'?'Состав взят из графика (Р). Укажите время начала — оно сохранится.':S.src==='last'?'↻ Показан прошлый состав — измените при необходимости.':'Отметьте поваров и время начала — они попадут в сообщение с упоминанием (@username).'):(S.src==='sched'?'Состав по графику.':S.src==='last'?'↻ Состав как в прошлый раз.':'')};
const tomorrowBlock=()=>{const tom=dAdd(1),td=dAdd(0),ln=d=>t=>{const q=qtyText(t,d);return `• ${t.t}${q?' — '+q:''}${t.g==='banq'&&okTm(t.sv)?' · подача '+t.sv:''}`},isB=t=>t.g==='banq',srt=(a,b)=>(a.c||0)-(b.c||0),
pt=Object.values((DATA.prep||{})[tom]||{}).filter(t=>t&&t.t).sort(srt),left=Object.values((DATA.prep||{})[td]||{}).filter(t=>t&&t.t&&!t.done).sort(srt),
sh=shiftsFor(tom).map,cooks=team().filter(k=>sh[k.id]!==undefined),mt=(DATA.prepMeta||{})[tom]||{},out=[];
const main=pt.filter(t=>!isB(t)),bq=pt.filter(isB).sort(svSort),lm=left.filter(t=>!isB(t)),lb=left.filter(isB).sort(svSort),bm=bqMeta(tom);
if(main.length)out.push(`📋 Заготовки на завтра (${day(tom)})`,main.map(ln(tom)).join('\n'),'');
if(bq.length)out.push(`🎉 Банкет на завтра${bm.title?' — '+bm.title:''}${bm.time?' · '+bm.time:''}${bm.guests?' · '+bm.guests+' гостей':''}${bm.place?' · '+bm.place:''}`,...(bm.note?['📝 '+bm.note.replace(/\s*\n\s*/g,'; ')]:[]),bq.map(ln(tom)).join('\n'),'');
if(lm.length)out.push(`🔁 Осталось с сегодня (${day(td)})`,lm.map(ln(td)).join('\n'),'');
if(lb.length)out.push(`🔁 Осталось по банкету (${day(td)})`,lb.map(ln(td)).join('\n'),'');
if(cooks.length)out.push('⏰ Завтра на смену (начало)',cooks.map(k=>`${k.u?'@'+k.u:k.n}${sh[k.id]?' — '+sh[k.id]:''}`).join('\n'));
return out.join('\n').trim()};
const P2=n=>String(n).padStart(2,'0'),SC=()=>DATA.sched||{};
const rSched0=()=>{const k=team(),S=SC(),ed2=se&&isAdmin(),color=id=>{const c=k.find(x=>x.id===id);return c&&PALETTE.includes(c.color)?c.color:hashColor(id)};if(sf!=='all'&&!k.some(c=>c.id===sf))sf='all';
$('#sfilter').innerHTML=`<button class="chip${sf==='all'?' on':''}" data-a="sfil" data-id="all">Все</button>`+k.map(c=>`<button class="chip cook-chip${sf===c.id?' on':''}" style="--cook:${color(c.id)}" data-a="sfil" data-id="${c.id}"><i class="cook-dot"></i>${esc(c.n)}<small>${esc(c.r)}</small></button>`).join('');
const[y,m]=sm.split('-').map(Number),off=(new Date(y,m-1,1,12).getDay()+6)%7,dim=new Date(y,m,0).getDate(),today=dAdd(0),pins=DATA.prepPins||{},filterColor=sf==='all'?'':'--cook:'+color(sf);
$('#smt').textContent=new Date(y,m-1,1,12).toLocaleDateString('ru',{month:'long',year:'numeric'});
let c='';for(let i=0;i<off;i++)c+='<i></i>';
for(let d=1;d<=dim;d++){const dt=`${y}-${P2(m)}-${P2(d)}`;let inner='',has=0;
if(sf==='all'){const rows=k.filter(x=>isWork(S[x.id]&&S[x.id][dt]));has=rows.length;inner=has?`<small class="marks" aria-label="Работают: ${esc(rows.map(x=>x.n).join(', '))}">${rows.slice(0,3).map(x=>`<b style="--cook:${color(x.id)};color:${color(x.id)}">Р</b>`).join('')}${has>3?`<em>+${has-3}</em>`:''}</small>`:''}
else{const s=(S[sf]||{})[dt];has=isWork(s);inner=has?`<small>${esc(workLabel(s))}</small>`:''}
const pin=pins[dt]?'<small class="day-pin" aria-label="Закреплённый день подготовки">📌</small>':'';
c+=`<button class="dc${has?' wk':''}${ssel.has(dt)?' sl':''}"${filterColor?` style="${filterColor}"`:''} data-a="sday" data-id="${dt}"><b>${d}</b>${pin}${inner}</button>`}
$('#sgrid').innerHTML=c;
let l='',shown=0;const lim=sf==='all'?10:16;
for(let i=0;i<90&&shown<lim;i++){const dt=dAdd(i),t=dt===today?' · сегодня':'';
if(sf==='all'){const rows=k.filter(x=>isWork(S[x.id]&&S[x.id][dt]));if(rows.length){shown++;l+=`<div class="sh"><b>${esc(day(dt))}${t}</b>${rows.map(x=>`<div class="sh-person"><i class="cook-dot" style="--cook:${color(x.id)}"></i><b>${esc(x.n)}</b><span style="--cook:${color(x.id)}">${esc(workLabel(S[x.id][dt]))}</span></div>`).join('')}</div>`}}
else{const s=(S[sf]||{})[dt];if(isWork(s)){shown++;l+=`<div class="sh"><b>${esc(day(dt))}${t}</b><div class="sh-person"><i class="cook-dot" style="--cook:${color(sf)}"></i><b>${esc(k.find(x=>x.id===sf).n)}</b><span style="--cook:${color(sf)}">${esc(workLabel(s))}</span></div></div>`}}}
$('#slist').innerHTML=l||'<div class="em">Ближайших смен нет.</div>';
$('#sedit').hidden=!ed2;$('#sbtn').textContent=ed2?'✓ Готово':'✎ Править график';
const cc=k.find(x=>x.id===sf);$('#sedinfo').textContent=sf==='all'?'Выберите повара выше, чтобы отметить ему рабочие дни. В календаре появится цветная отметка Р.':`${cc?cc.n:''}: выбрано дней — ${ssel.size}. Нажимайте на дни в календаре.`};
const rWoCats=()=>{$('#wocats').innerHTML=`<button class="chip${wcat==='all'?' on':''}" data-a="wocat" data-id="all">Все</button>`+cats().map(c=>`<button class="chip${wcat===c.id?' on':''}" data-a="wocat" data-id="${esc(c.id)}">${c.e} ${esc(c.n.split(' и ')[0].split(',')[0])}</button>`).join('')};
const rWoProducts=()=>{const q=wq.trim().toLocaleLowerCase('ru'),ps=prods().filter(p=>(wcat==='all'||p.c===wcat)&&(!q||p.n.toLocaleLowerCase('ru').includes(q)));if(woDraft&&!ps.some(p=>p.id===woDraft.product.id)&&(wcat==='all'||woDraft.product.c===wcat)&&(!q||woDraft.product.n.toLocaleLowerCase('ru').includes(q)))ps.push(woDraft.product);
const cs=cats(),defU=p=>((LS.get('vip3-wo-units',{})||{})[p.id])||p.u||'шт',uopts=u=>UNITS.includes(u)?UNITS:[...UNITS,u],
head=p=>{const x=woDraft;if(!(x&&x.product.id===p.id))return `<button class="p" data-a="woopen" data-id="${esc(p.id)}" aria-label="Списать">＋ ${esc(defU(p))}</button>`;return `<div class="st"><button data-a="wodec" aria-label="Меньше">−</button><input id="woQty" data-wovalue="qty" inputmode="decimal" value="${esc(String(x.qty).replace('.',','))}" aria-label="Количество"><select class="us" data-wounit="${esc(p.id)}" aria-label="Единица">${uopts(x.unit).map(u=>`<option${u===x.unit?' selected':''}>${esc(u)}</option>`).join('')}</select><button data-a="woinc" aria-label="Больше">+</button></div>`},
editor=p=>{const x=woDraft,legacy=x.reason==='spoiled',by=x.byId||'';return `<div class="wo-inline"><div class="wo-inline-grid"><label><span>Причина</span><select data-woreason>${(legacy?[['spoiled','Старый вариант: порча или повреждение']]:[]).concat(WO_REASONS).map(([id,name])=>`<option value="${esc(id)}"${id===x.reason?' selected':''}>${esc(name)}</option>`).join('')}</select></label><label><span>Кто списал</span><select data-woby><option value="">Не указан</option>${team().map(k=>`<option value="${esc(k.id)}"${k.id===by?' selected':''}>${esc(k.n)}</option>`).join('')}</select></label><label class="wo-wide"><span>Комментарий</span><input data-wovalue="note" maxlength="120" value="${esc(x.note)}" placeholder="Необязательно"></label></div><div class="wo-inline-actions"><button class="p" data-a="wosave">Сохранить списание</button><button class="g" data-a="wocancel">Отмена</button></div></div>`};
let h='';for(const c of cs){const rows=ps.filter(p=>p.c===c.id);if(rows.length)h+=(wcat==='all'||q?`<div class="gh">${c.e} ${esc(c.n)}</div>`:'')+rows.map(p=>{const active=woDraft&&woDraft.product.id===p.id;return `<article class="wo-product${active?' editing':''}"><div class="wo-product-head"><div class="n">${esc(p.n)}</div>${head(p)}</div>${active?editor(p):''}</article>`}).join('')}
$('#wocatalogcount').textContent=`${ps.length} товаров`;$('#woproducts').innerHTML=h||'<div class="em">Товары не найдены. Добавьте их во вкладке «Заказ».</div>'};
const rWoLog=()=>{const rows=woRows(wd).sort((a,b)=>(a.done?1:0)-(b.done?1:0)||(b.updated||b.created||0)-(a.updated||a.created||0));$('#wocount').textContent=`${rows.length} ${ruCount(rows.length,'запись','записи','записей')}`;$('#wocopy').disabled=!rows.length;$('#woshare').disabled=!rows.length;$('#woshare').hidden=typeof navigator.share!=='function';
$('#wolog').innerHTML=rows.length?rows.map(v=>`<article class="wo-entry wo-row${v.done?' ok':''}"><button class="ck" data-a="wodone" data-id="${esc(v.id)}" aria-label="Оформлено">${v.done?'✓':''}</button><div class="wo-body"><div class="wo-entry-head"><b>${esc(v.name)}</b><strong>${esc(fmtQ(v.qty))} ${esc(v.unit||'')}</strong></div><div class="libmeta">${esc(woReason(v.reason))}${v.note?` · ${esc(v.note)}`:''}${v.by&&v.by.n?` · Списал: ${esc(v.by.n)}`:''}${v.carryFrom?` · перенос с ${esc(day(v.carryFrom))}`:''}</div><div class="lib-actions"><button data-a="woedit" data-id="${esc(v.id)}">✎ Изменить</button><button class="d" data-a="wodel" data-id="${esc(v.id)}">Удалить</button></div></div></article>`).join(''):'<div class="em">За выбранный день списаний нет.</div>'};
const rWriteoff=()=>{$('#woDate').value=wd;rWoCats();rWoProducts();rWoLog()};
// ================= личные кабинеты и зарплата =================
const PAYROLL=()=>DATA.payroll||{},CUR=()=>(PAYROLL()._cfg||{}).cur||'₽';
const fmtH=h=>String(Math.round((Number(h)||0)*100)/100).replace('.',','),mny=(n,c)=>(Math.round((Number(n)||0)*100)/100).toLocaleString('ru',{maximumFractionDigits:2})+' '+(c||'₽');
const MN=ym=>{const a=ym.split('-').map(Number),s=new Date(a[0],a[1]-1,1,12).toLocaleDateString('ru',{month:'long',year:'numeric'});return s.charAt(0).toUpperCase()+s.slice(1)};
const nextM=ym=>iso(new Date(Number(ym.slice(0,4)),Number(ym.slice(5,7)),1,12)).slice(0,7),prevM=ym=>iso(new Date(Number(ym.slice(0,4)),Number(ym.slice(5,7))-2,1,12)).slice(0,7);
const PT={adv:'Аванс',sal:'Зарплата',oth:'Прочее'};
const daysMap=id=>{const p=PAYROLL()[id]||{},S=(DATA.sched||{})[id]||{},out={};Object.keys(S).forEach(d=>{if(isWork(S[d])&&Number(p.dh)>0)out[d]=Number(p.dh)});Object.keys(p.hours||{}).forEach(d=>{const h=Number(p.hours[d])||0;if(h>0)out[d]=h;else delete out[d]});return out};
const DRE=/^\d{4}-\d{2}-\d{2}$/;
// объединяет данные руководителя (sn) с тем, что ввёл сам повар (u: in — часы, rt — ставки по датам, pm — полученные суммы)
const mergeSn=(sn,u)=>{u=u||{};const days=Object.assign({},sn.days||{}),ex=sn.ex||{};Object.entries(u.in||{}).forEach(([d,v])=>{if(ex[d]||!v)return;const h=Number(v.h);if(h>0)days[d]=h;else if(h===0)delete days[d]});
const rs=[];Object.entries(sn.rs||{}).forEach(([id,v])=>{if(v&&DRE.test(v.f||'')&&Number(v.r)>=0)rs.push({id,f:v.f,r:Number(v.r),t:v.t||0,u:'a'})});Object.entries(u.rt||{}).forEach(([id,v])=>{if(v&&DRE.test(v.f||'')&&Number(v.r)>=0)rs.push({id:'c_'+id,f:v.f,r:Number(v.r),t:v.t||0,u:'c'})});rs.sort((a,b)=>a.f<b.f?-1:a.f>b.f?1:a.t-b.t);
const pay=Object.assign({},sn.pay||{});Object.entries(u.pm||{}).forEach(([id,v])=>{if(v&&Number(v.a)>0&&DRE.test(v.d||''))pay['c_'+id]={d:v.d,a:Number(v.a),t:v.t||'oth',m:v.m||v.d.slice(0,7),n:v.n||'',u:'c'}});
return Object.assign({},sn,{days,rs,pay})};
const snapFor=(id,full)=>{const p=PAYROLL()[id]||{},k=team().find(x=>x.id===id)||{n:'?'},pay={},ex={},rs={},fn={};Object.entries(p.fines||{}).forEach(([i,v])=>{if(v&&Number(v.a)>0&&DRE.test(v.d||''))fn[i]={d:v.d,a:Number(v.a),n:v.n||''}});Object.entries(p.pay||{}).forEach(([i,v])=>{if(v)pay[i]={d:v.d,a:v.a,t:v.t,m:v.m,n:v.n||''}});Object.entries(p.rates||{}).forEach(([i,v])=>{if(v&&DRE.test(v.f||'')&&Number(v.r)>=0)rs[i]={f:v.f,r:Number(v.r),t:v.t||0}});Object.keys(p.hours||{}).forEach(d=>{if(p.hours[d]!==undefined&&p.hours[d]!==null)ex[d]=1});
const base={n:k.n,r:Number(p.rate)||0,c:CUR(),dh:Number(p.dh)||0,days:daysMap(id),ex,pay,rs,fn,up:Date.now()};return full?mergeSn(base,(DATA.acctU||{})[id]):base};
const pubT={};
const publishAcct=id=>{const p=PAYROLL()[id];if(!p||!p.key||!isAdmin())return;clearTimeout(pubT[id]);pubT[id]=setTimeout(()=>{const q=PAYROLL()[id];if(q&&q.key)mut('PATCH','acct/'+q.key,snapFor(id,false))},700)};
const publishAll=()=>team().forEach(k=>publishAcct(k.id));
const rateOn=(sn,d)=>{let r=Number(sn.r)||0;if(Array.isArray(sn.rs))for(const x of sn.rs){if(x.f<=d)r=x.r;else break}return r};
const r2=n=>Math.round((Number(n)||0)*100)/100;
const calcM=(sn,ym)=>{const list=Object.keys(sn.days||{}).filter(d=>d.slice(0,7)===ym).sort().map(d=>{const r=rateOn(sn,d),h=sn.days[d];return{d,h,r,s:r2(h*r)}}),hours=list.reduce((a,b)=>a+b.h,0),earned=r2(list.reduce((a,b)=>a+b.s,0)),pays=Object.entries(sn.pay||{}).map(([id,v])=>({id,...v})).filter(v=>v.m===ym).sort((a,b)=>String(a.d).localeCompare(String(b.d))),paid=r2(pays.reduce((a,b)=>a+(Number(b.a)||0),0)),
fines=Object.entries(sn.fn||{}).map(([id,v])=>({id,...v})).filter(v=>v&&Number(v.a)>0&&String(v.d||'').slice(0,7)===ym).sort((a,b)=>String(a.d).localeCompare(String(b.d))),fine=r2(fines.reduce((a,b)=>a+(Number(b.a)||0),0));return{list,hours,earned,pays,paid,fines,fine,left:r2(earned-fine-paid)}};
const allTot=sn=>{const ms=new Set(Object.keys(sn.days||{}).map(d=>d.slice(0,7)));Object.values(sn.pay||{}).forEach(v=>{if(v&&v.m)ms.add(v.m)});Object.values(sn.fn||{}).forEach(v=>{if(v&&v.d)ms.add(String(v.d).slice(0,7))});let e=0,p=0,f=0;ms.forEach(m=>{const c=calcM(sn,m);e+=c.earned;p+=c.paid;f+=c.fine});return{earned:r2(e),paid:r2(p),fine:r2(f),left:r2(e-f-p)}};
async function acctKey(id,pw){const enc=new TextEncoder(),km=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']),bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode('vip-acct:'+id),iterations:60000},km,256);return Array.from(new Uint8Array(bits)).map(b=>b.toString(16).padStart(2,'0')).join('')}
let mm=iso(new Date(Date.now()-BDAY_H*36e5)).slice(0,7);
let csec='sh';
const SECS=[['sh','Смены'],['py','Выплаты'],['fn','Штрафы'],['rt','Ставка']];
const fm=(n,cu)=>esc(mny(n,cu));
const addf=(k,title,body)=>`<details class="addf" data-k="${k}"><summary>${title}</summary><div class="af">${body}</div></details>`;
const heroH=(c,cu,sn)=>{const now=rateOn(sn,dAdd(0));return `<div class="hero"><div class="hl"><small>${c.left<0?'Переплата':'К получению'}</small><b class="big ${c.left>0?'warn':'good'}">${fm(Math.abs(c.left),cu)}</b></div><div class="hg"><div><small>Часов</small><b>${fmtH(c.hours)}</b></div><div><small>Начислено</small><b>${fm(c.earned,cu)}</b></div><div class="${c.fine>0?'neg':''}"><small>Штрафы</small><b>${c.fine>0?'−':''}${fm(c.fine,cu)}</b></div><div><small>Получено</small><b>${fm(c.paid,cu)}</b></div></div><div class="rn">Ставка сейчас: <b>${now?fm(now,cu)+' / час':'не указана'}</b></div></div>`};
const secBar=c=>`<div class="seg secs">${SECS.map(([k,l])=>`<button data-a="csec" data-id="${k}"${csec===k?' class="on"':''}>${l}${k==='fn'&&c.fines.length?`<b>${c.fines.length}</b>`:''}</button>`).join('')}</div>`;
const allH=(t,cu)=>`<div class="ac-all">За всё время: начислено <b>${fm(t.earned,cu)}</b>${t.fine>0?` · штрафы <b class="neg">−${fm(t.fine,cu)}</b>`:''} · получено <b>${fm(t.paid,cu)}</b> · осталось <b>${fm(t.left,cu)}</b></div>`;
const secSh=o=>{const {sn,c,cu,adm,pid}=o,ex=sn.ex||{};
const rows=c.list.length?c.list.map(x=>`<div class="ac-row"><span>${esc(day(x.d))}${adm?cinMark(pid,x.d):''}</span>${adm?`<input inputmode="decimal" data-ph="${x.d}" value="${fmtH(x.h)}" aria-label="Часы">`:ex[x.d]?`<span class="lk">🔒 ${fmtH(x.h)} ч</span>`:`<input inputmode="decimal" data-ch="${x.d}" value="${fmtH(x.h)}" aria-label="Часы"><span class="u">ч</span>`}<span class="rt">× ${fmtH(x.r)}</span><b>${fm(x.s,cu)}</b></div>`).join(''):`<div class="small em0">В этом месяце смен нет.${adm?' Отметьте дни буквой Р в графике или добавьте день ниже.':''}</div>`;
const form=adm?`<div class="row2"><input type="date" id="phd" value="${dAdd(0)}"><input id="phh" inputmode="decimal" placeholder="Часов" autocomplete="off"></div><div class="acts"><button class="p" data-a="phadd">Добавить</button></div>`:`<div class="row2"><input type="date" id="cabd" value="${dAdd(0)}"><input id="cabh" inputmode="decimal" placeholder="Часов" value="${sn.dh?fmtH(sn.dh):''}" autocomplete="off"></div><div class="acts"><button class="p" data-a="cabadd">Записать</button></div>`;
return rows+addf('sh',adm?'＋ Добавить день':'＋ Записать смену',form)+`<div class="secn">${adm?'Смены берутся из графика (Р × часов в смене); любой день можно поправить.':'Часы можно исправить в любой день (🔒 — исправил шеф). Все записи видит шеф.'}</div>`};
const secPy=o=>{const {c,cu,adm,ym}=o,st=(t,d,l)=>{const v=c.pays.filter(p=>p.t===t).reduce((a,b)=>a+(Number(b.a)||0),0);return `<div class="ac-st${v?' ok':''}"><b>${l}</b><span>${esc(day(d))}</span><strong>${v?'✓ '+fm(v,cu):'ожидается'}</strong></div>`};
const rows=c.pays.length?c.pays.map(p=>{const own=p.u==='c';return `<div class="ac-row"><span>${esc(day(p.d))}</span><span>${esc(PT[p.t]||'')}${p.n?' · '+esc(p.n):''}${adm?(own?' · 👤':''):(own?'':' · шеф')}</span><b>${fm(p.a,cu)}</b>${adm?`<button class="x" data-a="paydel" data-id="${esc(p.id)}" aria-label="Удалить">✕</button>`:own?`<button class="x" data-a="cabpdel" data-id="${esc(p.id.slice(2))}" aria-label="Удалить">✕</button>`:''}</div>`}).join(''):'<div class="small em0">Выплат в этом месяце нет.</div>';
const sel='<option value="adv">Аванс</option><option value="sal">Зарплата</option><option value="oth">Прочее</option>';
const form=adm?`<div class="row2"><input type="date" id="pyd" value="${dAdd(0)}"><input id="pya" inputmode="decimal" placeholder="Сумма" autocomplete="off"></div><div class="row2"><select id="pyt">${sel}</select><input id="pyn" placeholder="Комментарий" maxlength="60" autocomplete="off"></div><div class="acts"><button class="p" data-a="payadd">Записать выплату</button></div>`:`<div class="row2"><input type="date" id="cabpd" value="${dAdd(0)}"><input id="cabpa" inputmode="decimal" placeholder="Сумма" autocomplete="off"></div><div class="row2"><select id="cabpt">${sel}</select><input id="cabpn" placeholder="Комментарий" maxlength="60" autocomplete="off"></div><div class="acts"><button class="p" data-a="cabpay">Записать полученное</button></div>`;
return st('adv',ym+'-28','Аванс')+st('sal',nextM(ym)+'-15','Зарплата')+rows+addf('py',adm?'＋ Записать выплату':'＋ Записать полученное',form)+`<div class="secn">Аванс — 28 числа (идёт в месяц даты выплаты), зарплата — 15 числа следующего месяца (закрывает предыдущий). «Прочее» относится к месяцу, открытому сейчас.</div>`};
const secFn=o=>{const {c,cu,adm}=o;
const rows=c.fines.length?c.fines.map(v=>`<div class="ac-row"><span>${esc(day(v.d))}</span><span>${esc(v.n||'Штраф')}</span><b class="neg">−${fm(v.a,cu)}</b>${adm?`<button class="x" data-a="finedel" data-id="${esc(v.id)}" aria-label="Удалить">✕</button>`:''}</div>`).join('')+`<div class="ac-row"><span>Итого</span><span></span><b class="neg">−${fm(c.fine,cu)}</b></div>`:`<div class="small em0">${adm?'Штрафов в этом месяце нет.':'Штрафов в этом месяце нет 👍'}</div>`;
const form=`<div class="row2"><input type="date" id="fnd" value="${dAdd(0)}"><input id="fna" inputmode="decimal" placeholder="Сумма штрафа" autocomplete="off"></div><input id="fnn" placeholder="Причина (необязательно)" maxlength="60" autocomplete="off" style="margin-top:8px"><div class="acts"><button class="d" data-a="fineadd">Назначить штраф</button></div>`;
return rows+(adm?addf('fn','＋ Назначить штраф',form)+'<div class="secn">Штраф сразу появляется в кабинете повара и вычитается из его начислений за месяц даты штрафа.</div>':'<div class="secn">Штрафы назначает шеф. Сумма вычитается из начисленного за месяц штрафа.</div>')};
const secRt=o=>{const {sn,cu,adm,p}=o,now=rateOn(sn,dAdd(0)),rs=sn.rs||[];
let h=`<div class="ratenow"><small>Ставка сейчас</small><b>${now?fm(now,cu)+' / час':'не указана'}</b></div>`;
if(adm)h+=`<div class="row2"><label><div class="lbl">Ставка за час (исходная)</div><input inputmode="decimal" data-pset="rate" value="${esc((p||{}).rate||'')}" placeholder="0"></label><label><div class="lbl">Часов в смене</div><input inputmode="decimal" data-pset="dh" value="${esc((p||{}).dh||'')}" placeholder="0"></label></div><div class="row2"><label><div class="lbl">Валюта</div><input data-pset="cur" value="${esc(cu)}" maxlength="6"></label><div></div></div>`;
h+='<div class="gh">История ставок</div>'+(sn.r?`<div class="ac-row"><span>Исходная</span><span class="lk">шеф</span><b>${fm(sn.r,cu)} / ч</b></div>`:'')+(rs.length?rs.map(x=>`<div class="ac-row"><span>с ${esc(day(x.f))}</span><span class="lk">${x.u==='c'?(adm?'👤 повар':'записал(а) я'):'шеф'}</span><b>${fm(x.r,cu)} / ч</b>${adm?`<button class="x" data-a="ratedel" data-id="${esc(x.id)}" aria-label="Удалить">✕</button>`:x.u==='c'?`<button class="x" data-a="cabrdel" data-id="${esc(x.id.slice(2))}" aria-label="Удалить">✕</button>`:''}</div>`).join(''):(sn.r?'':'<div class="small em0">Ставка ещё не указана.</div>'));
const form=adm?`<div class="row2"><input type="date" id="rtd" value="${dAdd(0)}"><input id="rtr" inputmode="decimal" placeholder="${esc(cu)} / час" autocomplete="off"></div><div class="acts"><button class="p" data-a="rateadd">Добавить ставку</button></div>`:`<div class="row2"><input type="date" id="cabrf" value="${dAdd(0)}"><input id="cabrr" inputmode="decimal" placeholder="${esc(cu)} / час" autocomplete="off"></div><div class="acts"><button class="p" data-a="cabrate">Добавить ставку</button></div>`;
return h+addf('rt','＋ Новая ставка с даты',form)+'<div class="secn">Ставка действует с выбранной даты и позже. Например: «с 01.11 — 300», «с 16.11 — 350». Каждый день считается по ставке на этот день.</div>'};
const SECF={sh:secSh,py:secPy,fn:secFn,rt:secRt};
const acctHTML=(sn0,ym)=>{const sn=mergeSn(sn0,sn0),c=calcM(sn,ym),cu=sn.c||'₽',tot=allTot(sn);
return `<div class="mh"><button class="g" data-a="cabmon" data-id="-1" aria-label="Назад">‹</button><b>${esc(MN(ym))}</b><button class="g" data-a="cabmon" data-id="1" aria-label="Вперёд">›</button></div>${heroH(c,cu,sn)}${secBar(c)}<div class="sec">${SECF[csec]({sn,c,cu,adm:0,ym})}</div>${allH(tot,cu)}`};
// сохраняет открытую форму и набранный в ней текст при фоновых обновлениях
const keepForms=(box,fn)=>{let st=[];if(box&&typeof box.querySelectorAll==='function')st=[...box.querySelectorAll('details.addf')].map(d=>[d.dataset.k,d.open,[...d.querySelectorAll('input,select')].map(i=>[i.id,i.value])]);fn();st.forEach(([k,o,vs])=>{if(!o)return;const d=box.querySelector(`details.addf[data-k="${k}"]`);if(!d)return;d.open=true;vs.forEach(([id,v])=>{const i=id&&d.querySelector('#'+id);if(i)i.value=v})})};
const cabTouch=()=>{clearTimeout(idleT);if(ses)idleT=setTimeout(()=>cabLogout(true),180000)};
function cabLogout(auto){const was=!!(ses||cabPick);csec='sh';ses=null;acctData=null;cabPick=null;clearTimeout(idleT);clearTimeout(hideT);if(tab==='cab')rCab();if(auto&&was)toast('Кабинет закрыт — сессия завершена')}
const busyEdit=()=>{const a=document.activeElement,b=$('#cabBox');return!!(a&&b&&b.contains&&b.contains(a)&&/INPUT|SELECT|TEXTAREA/.test(a.tagName||''))};
const rCab=reset=>{const cu=$('#cabUser');if(!cu)return;const adm=isAdmin();cu.hidden=adm;$('#payadm').hidden=!adm;if(adm){rPayAdm(reset);return}
const k=team(),box=$('#cabBox');
if(ses&&acctData){const draw=()=>{box.innerHTML=`<div class="acc-bar"><b>👤 ${esc(acctData.n)}</b><button class="d" data-a="cabout">Закрыть</button></div>`+acctHTML(acctData,mm)};reset?draw():keepForms(box,draw);return}
if(cabPick){const c=k.find(x=>x.id===cabPick);if(!c){cabPick=null;rCab();return}box.innerHTML=`<div class="acc-bar"><b>${esc(c.n)}</b><button class="g" data-a="cabback">Назад</button></div><div class="small" style="margin:0 0 8px">Введите пароль, который выдал вам шеф.</div><input type="password" id="cabpw" placeholder="Пароль" autocomplete="new-password" autocapitalize="off" autocorrect="off" spellcheck="false"><div class="acts"><button class="p" data-a="cablogin">Войти</button></div>`;return}
box.innerHTML=`<div class="lbl">Выберите своё имя</div><div class="chips wrap">${k.map(c=>`<button class="chip cook-chip" style="--cook:${cookColor(c.id)}" data-a="cabpick" data-id="${esc(c.id)}"><i class="cook-dot"></i>${esc(c.n)}<small>${esc(c.r)}</small></button>`).join('')||'<span class="small">Повара не добавлены.</span>'}</div><div class="small" style="margin-top:10px">🔒 Кабинет защищён паролем. Каждый видит только свой счёт.</div>`};
const rGseg=()=>{const s=$('#gseg');if(!s)return;const on=tab==='sched'||tab==='cab';s.hidden=!on;if(!on)return;[['sched','#gsch'],['cab','#gcab']].forEach(([k,q])=>{const e=$(q);if(e)e.classList.toggle('on',k===tab)});const g=$('#gcab');if(g)g.textContent=isAdmin()?'💼 Зарплаты':'👤 Мой кабинет'};
const rMeBox=()=>{const b=$('#mebox');if(!b)return;const k=team().find(x=>x.id===sf);b.innerHTML=k?`<button class="p" data-a="cabgo">💼 Мой кабинет: ${esc(k.n)}</button>`:'<div class="small">Выберите своё имя выше, чтобы открыть личный кабинет (часы и зарплата).</div>'};
async function cabW(sub,id,val){if(!ses||!DB)return{ok:0,st:0};try{const u=`${DB}/acct/${ses.key}/${sub}/${id}.json`,r=await fetchFast(u,val===null?{method:'DELETE'}:{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(val)},9000);if(!r.ok)return{ok:0,st:r.status};fetchFast(`${DB}/meta/cabinet.json`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(Date.now())},6000).catch(()=>{});return{ok:1,st:200}}catch(e){return{ok:0,st:0}}}
async function cabSave(sub,id,val,msg){const r=await cabW(sub,id,val);if(!r.ok){snd.warn();vib(80);toast(r.st===401||r.st===403?'Нет прав записи — шефу нужно опубликовать новые правила Firebase':'Не сохранено — нет связи');rCab();return false}if(!acctData)return false;acctData[sub]=acctData[sub]||{};if(val===null)delete acctData[sub][id];else acctData[sub][id]=val;cabTouch();snd.ok();if(msg)toast(msg);rCab(true);return true}
const cabSet=(date,h)=>cabSave('in',date,h===null?null:{h,t:Date.now()});
const cabEdit=(t,d)=>{if(!ses)return;const v=String(t.value).trim().replace(',','.');if(v===''){cabSet(d.ch,null);return}const n=Number(v);if(!(n>=0)||n>24){snd.warn();toast('Часы: от 0 до 24');rCab();return}cabSet(d.ch,Math.round(n*100)/100)};
async function refreshAcct(){if(!ses||!DB)return;const k=ses.key;try{const d=await jget('acct/'+k);if(ses&&ses.key===k&&d&&d.n&&sig(d)!==sig(acctData)){acctData=d;if(!busyEdit())rCab()}}catch(e){}}
async function loadIn(){if(!isAdmin()||inBusy||!DB||DEMO)return;inBusy=1;try{const P=PAYROLL(),ids=Object.keys(P).filter(i=>i!=='_cfg'&&P[i]&&P[i].key);const res=await Promise.all(ids.map(i=>jget('acct/'+P[i].key).then(d=>[i,d||{}]).catch(()=>null))),m={};res.forEach(r=>{if(r)m[r[0]]={in:r[1].in||{},rt:r[1].rt||{},pm:r[1].pm||{}}});if(sig(m)!==sig(DATA.acctU||{})){DATA.acctU=m;dirty('acctU')}}catch(e){}inBusy=0}
const delUser=(id,sub,rid)=>{const key=(PAYROLL()[id]||{}).key;if(!key)return;mut('DELETE',`acct/${key}/${sub}/${rid}`);const u=(DATA.acctU||{})[id];if(u&&u[sub])delete u[sub][rid]};
const cinMark=(id,d)=>{const p=PAYROLL()[id]||{},h=p.hours&&p.hours[d];return((((DATA.acctU||{})[id]||{}).in||{})[d]&&(h===undefined||h===null))?' <em class="cin" title="Ввёл повар">👤</em>':''};
const rPayAdm=reset=>{const box=$('#payadm');if(!box)return;box.hidden=!isAdmin();if(!isAdmin())return;const k=team();if(pc&&!k.some(x=>x.id===pc))pc=null;if(!pc&&k.length)pc=(sf!=='all'&&k.some(x=>x.id===sf))?sf:k[0].id;
const cu=CUR(),P=PAYROLL();
const draw=()=>{$('#payov').innerHTML=`<div class="mh"><button class="g" data-a="smon" data-id="-1" aria-label="Назад">‹</button><b>${esc(MN(sm))}</b><button class="g" data-a="smon" data-id="1" aria-label="Вперёд">›</button></div><div class="ovh"><span>Повар</span><span>Часы</span><span>Начислено</span><span>Остаток</span></div>`+k.map(c=>{const m=calcM(snapFor(c.id,true),sm);return `<button class="ov${pc===c.id?' on':''}" data-a="paypick" data-id="${esc(c.id)}"><span class="ovn">${esc(c.n)}${m.fine>0?`<small class="fn">штраф −${esc(mny(m.fine,cu))}</small>`:''}</span><span>${fmtH(m.hours)}</span><span>${esc(mny(m.earned,cu))}</span><b class="${m.left>0?'warn':'good'}">${esc(mny(m.left,cu))}</b></button>`}).join('');
const ck=k.find(x=>x.id===pc);if(!ck){$('#payed').innerHTML='<div class="small">Добавьте поваров в админ-панели ⚙.</div>';return}
const p=P[pc]||{},sn=snapFor(pc,true),m=calcM(sn,sm),tot=allTot(sn);
$('#payed').innerHTML=`<div class="acc-bar" style="margin-top:12px"><b>${esc(ck.n)}</b><button class="g" data-a="paypw" data-id="${esc(pc)}">🔑 ${p.key?'Пароль':'Создать пароль'}</button></div><div class="cabst${p.key?' on':''}">${p.key?'✓ Кабинет включён — повар входит по имени и паролю и видит только свой счёт.':'Пароль не задан — кабинет повара выключен.'}</div>${heroH(m,cu,sn)}${secBar(m)}<div class="sec">${SECF[csec]({sn,c:m,cu,adm:1,ym:sm,pid:pc,p})}</div>${allH(tot,cu)}`};
if(reset)draw();else keepForms(box,draw)};
const rSched=()=>{rSched0();rMeBox()};
const payChange=(t,d)=>{if(!isAdmin()||!pc)return;const v=String(t.value).trim();
if(d.pset==='cur'){mut('PATCH','payroll/_cfg',{cur:v||'₽'});publishAll();snd.tap();return}
if(d.pset){const n=Number(v.replace(',','.'));if(v!==''&&!(n>=0))return;mut('PATCH','payroll/'+pc,{[d.pset]:v===''?null:n});publishAcct(pc);snd.tap();setTimeout(rPayAdm,0);return}
if(d.ph){const n=v===''?null:Number(v.replace(',','.'));if(n!==null&&!(n>=0))return;mut('PATCH','payroll/'+pc+'/hours',{[d.ph]:n});publishAcct(pc);snd.tap();setTimeout(rPayAdm,0)}};
const rDiag=()=>{const o=Object.keys(ES).map(k=>k+':'+(ST.open[k]?'✓':'✗')).join('  ');
$('#dinfo').textContent=[`Версия: ${VER}`,`Режим: ${DEMO?'ДЕМО (config.js не заполнен)':'облако'}`,`База: ${DB||'не найдена'}`,`Живая связь: ${ST.open.meta&&!metaBroken?'мгновенная (поток)':metaBroken?'быстрый опрос (обновите правила Firebase)':'быстрый опрос'}`,`В очереди на отправку: ${L.out.length}`,`Последняя ошибка: ${ST.lastErr||'нет'}`,`Телефон в сети: ${navigator.onLine?'да':'нет'}`,`Повара: ${team().length} · заказы: ${ords().length} · заготовок на день: ${Object.keys(dm()).length}`,`Устройство: ${DEV}`].join('\n');$('#dlog').textContent=''};
const rHist=()=>{const q=$('#hq').value.trim().toLowerCase();const l=ords().filter(o=>!q||(o.cook.n+' '+o.date+' '+day(o.date)+' '+o.items.map(i=>i.n).join(' ')).toLowerCase().includes(q));
$('#hl').innerHTML=l.length?l.map(o=>`<div class="hc"><b>${esc(day(o.date))} · ${esc(o.cook.n)}</b><small>${esc(o.cook.r)} · ${o.items.length} поз. · ${new Date(o.created).toLocaleDateString('ru')} ${tm(o.created)}${o.copied?' · ✓ скопирован':' · не скопирован'}</small><div style="font-size:13px;margin-top:4px">${esc(o.items.slice(0,5).map(i=>i.n).join(', '))}${o.items.length>5?'…':''}</div><div class="acts"><button data-a="open" data-id="${o.id}">Открыть и править</button><button data-a="hcopy" data-id="${o.id}">Копировать</button><button class="d" data-a="hdel" data-id="${o.id}">Удалить</button></div></div>`).join(''):'<div class="em">История пока пуста</div>'};
function render(){raf=0;const d={...D};for(const k in D)delete D[k];
if(d.team){if(isAdmin())ensureTeamColors();rCooks();rPCooks();rShifts();if(tab==='prep'){rPrep();rPlan()}if(tab==='sched')rSched();if(dialogOpen('#dt'))rTeam()}
if((d.sched||d.prepPins)&&tab==='sched')rSched();
if(d.shifts||d.sched||d.shiftsLast)rShifts();if(d.payroll&&tab==='cab'&&isAdmin())loadIn();if((d.payroll||d.acctU)&&tab==='cab')rPayAdm();if(d.team&&tab==='cab')rCab();
if(d.prepCats){rFil();if(tab==='prep'){rPrep();rPlan();rLibrary()}if(dialogOpen('#dcat'))rCatMgr()}
if(d.catalog){syncDraft();rCats();rList();rBar();if(tab==='writeoff'){rWoCats();rWoProducts()}if(dialogOpen('#dt'))rAdm()}
if(d.writeoffs){carryWriteoffs();if(tab==='writeoff')rWoLog()}
if(d.orders&&dialogOpen('#dh'))rHist();
if(tab==='prep'&&(d.prep||d.plan||d.prepPins||d.prepLibrary||d.prepMeta))rPrep();
if(tab==='prep'&&(d.prep||d.plan||d.prepLibrary))rPlan();
if(tab==='prep'&&d.prepLibrary){rLibrary();autoLib()}
clearTimeout(ct);ct=setTimeout(()=>LS.set('vip3-cache',DATA),4000)}
const tkRes=()=>{const g=Math.round(Number(String($('#tkgst').value).replace(',','.')))||0,k=fq($('#tkk').value)||0;$('#tkres').textContent=g&&k?`= ${fmtQ(Math.round(g*k*100)/100)} ${$('#tkgu').value}`:'Введите число гостей';};
const tkMode=m=>{tk.mode=m;$('#tkNum').hidden=m!=='n';$('#tkG').hidden=m!=='g';document.querySelectorAll('#tkm button').forEach(b=>b.classList.toggle('on',b.dataset.id===m));if(m==='g')tkRes()};
const libTouch=p=>{const old=libFind(p.t,p.g),id=old?old.id:libId(p.t,p.g);mut('PUT','prepLibrary/'+id,{t:p.t,q:p.q||'',g:p.g||'main',k:p.k||'other',ks:p.ks||'auto',...(p.pg?{pg:p.pg,pu:p.pu}:{}),by:old&&old.by?old.by:null,usedAt:Date.now()})};
const addFromLib=(i,id)=>{if(Object.values(dm()).some(t=>nt(t.t)===nt(i.t)&&((t.g==='banq')===(i.g==='banq')))){snd.warn();toast('Уже есть на этот день');return}const nid=uid(),linked=!!i.pg;
mut('PUT',`prep/${pd}/${nid}`,{t:i.t,g:i.g||'main',k:i.k||'other',...(i.ks?{ks:i.ks}:{}),...(linked?{pg:i.pg,pu:i.pu||'порц'}:{}),c:Date.now()});if(id)mut('PATCH','prepLibrary/'+id,{usedAt:Date.now()});snd.add();
if(!linked||!guestsOf(pd))setTimeout(()=>ACT.tkopen(nid,1),30);else toast('✓ Добавлено · '+qtyText({pg:i.pg,pu:i.pu||'порц'},pd))};
const carryWriteoffs=()=>{const today=dAdd(0),prev=dAdd(-1,today);if(!DEMO){const a=MV.woPrev,b=MV.writeoffs;if(!(a&&a.indexOf('writeoffs/'+prev+'|')===0&&b&&b.indexOf('writeoffs/'+today+'|')===0))return}
const src=((DATA.writeoffs||{})[prev])||{},dst=((DATA.writeoffs||{})[today])||{};let n=0;
Object.entries(src).forEach(([id,v])=>{if(!v||!v.name||v.done||v.carried||dst[id])return;mut('PUT',`writeoffs/${today}/${id}`,{...v,carryFrom:prev,updated:Date.now()});mut('PATCH',`writeoffs/${prev}/${id}`,{carried:today});n++});if(n)toast(`Перенесено в списание: ${n}`)};
// ---------- заказ ----------
const msg=(o,includeTodayWriteoffs=false)=>{const L2=[`🧾 Заказ на ${day(o.date)}`,`👨‍🍳 ${o.cook.n}, ${o.cook.r}`,`🕒 оформлен в ${tm(o.created)}`,''];
const cs=[...BASE,...Object.entries(cat0().groups||{}).map(([k,v])=>[k,v.n,'📦'])],seen=new Set(),ln=i=>`• ${i.n} — ${fmtQ(i.qty)} ${i.u}`;
for(const[id,n,e]of cs){const g=o.items.filter(i=>i.c===id);if(!g.length)continue;g.forEach(i=>seen.add(i.id));L2.push(`${e} ${n}`,g.sort((a,b)=>a.n.localeCompare(b.n,'ru')).map(ln).join('\n'),'')}
const r=o.items.filter(i=>!seen.has(i.id));if(r.length)L2.push('📦 Другое',r.map(ln).join('\n'),'');
if(o.note)L2.push('💬 '+o.note,'');L2.push(`Всего: ${o.items.length} поз.`);if(includeTodayWriteoffs){const date=dAdd(0),rows=woRows(date);if(rows.length)L2.push('',writeoffMessage(date,rows));const tb=tomorrowBlock();if(tb)L2.push('',tb)}if(o.closed)L2.push('','🔒 Кухня закрыта ✓ (проверил: '+o.cook.n+')');return L2.join('\n')};
const snap=()=>{const d=L.draft,old=d.editId&&ords().find(o=>o.id===d.editId);return{id:d.editId||'o'+uid(),created:old?old.created:Date.now(),updated:Date.now(),date:d.date,cook:d.cook,note:d.note.trim(),items:dI().map(i=>({...i})),copied:old?!!old.copied:false,...(old&&old.closed?{closed:true}:{})}};
const valid=()=>{if(!cnt()){snd.warn();vib(80);toast('Добавьте хотя бы один товар');return 0}if(!L.draft.cook){snd.warn();vib(80);toast('Выберите повара');$('#dr').close();$('#cooks').classList.add('bad');setTimeout(()=>$('#cooks').classList.remove('bad'),1500);window.scrollTo({top:0,behavior:'smooth'});return 0}return 1};
const upsert=o=>mut('PUT','orders/'+o.id,o);
const ask=(t,h,y='Да',n='Нет, вернуться')=>new Promise(res=>{const d=$('#dc');$('#ct').textContent=t;$('#cb').innerHTML=h;$('#cy').textContent=y;$('#cn').textContent=n;snd.ask();vib(40);const f=v=>()=>{d.close();res(v)};$('#cy').onclick=f(true);$('#cn').onclick=f(false);d.oncancel=()=>res(false);d.showModal()});
const clip=async t=>{try{await navigator.clipboard.writeText(t);return 1}catch{try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.append(a);a.select();const ok=document.execCommand('copy');a.remove();return ok}catch{return 0}}};
const copyOrder=async()=>{if(!valid())return;if(!await closingCheck())return;try{await onMeta(true)}catch{}const o=snap();o.closed=true;const message=msg(o,o.date===dAdd(1));const yes=await ask('Вы уверены?',`<p style="margin:0 0 10px;color:var(--mu)">Проверьте сообщение. Если что-то не так — вернитесь и исправьте.</p><pre class="msg">${esc(message)}</pre>`,'Да, копировать','Нет, вернуться');if(!yes)return;
if(!await clip(message)){snd.warn();toast('Не удалось скопировать. Разрешите доступ к буферу');return}
o.copied=true;upsert(o);L.draft=blank(L.draft.cook);saveL();$('#dr').close();rAll();snd.ok();vib([60,40,60]);toast(message.length>4000?`✓ Скопировано (${message.length} симв.). Telegram режет сообщения длиннее 4096 символов`:'✓ Скопировано и сохранено в истории')};
const saveOrder=()=>{if(!valid())return;const o=snap();upsert(o);L.draft.editId=o.id;saveL();snd.ok();toast('✓ Сохранено для всех. Можно редактировать')};
const open=id=>{rRev();$(id).showModal()};
const need=()=>{snd.warn();toast('Нужен вход в админ-панель');ACT.admin()};
const rep=id=>{const p=prods().find(x=>x.id===id),r=document.querySelector(`[data-r="${cssEsc(id)}"]`);if(p&&r)r.outerHTML=row(p);rBar();if(dialogOpen('#dr'))rRev()};
const ui=()=>{rFil();rCats();rList();rAdm();rShifts();rGseg();if(tab==='sched')rSched();if(tab==='writeoff')rWriteoff()};
const afterLogin=()=>{ensureTeamColors();ui();if(want){const w=want;want='';if(w==='sedit'){ACT.tab('sched');se=1;rSched()}else ACT.tab(w)}else{rTeam();rAdm();$('#dt').showModal()}};
const authErr=m=>/TOO_MANY/.test(m)?'Google временно ограничил вход. Подождите и повторите':/CREDENTIAL_TOO_OLD/.test(m)?'Войдите заново и повторите':'Неверный пароль';
const ACT={
async login(){const pw=$('#ap').value;if(DEMO){AU.ok=true;$('#da').close();afterLogin();toast('Демо-режим: облако не настроено');return}
try{const r=await fetchFast('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:CFG.adminEmail,password:pw,returnSecureToken:true})});const j=await r.json();
if(!r.ok){snd.warn();vib(120);toast(authErr(j.error&&j.error.message||''));return}
AU={t:j.idToken,rt:j.refreshToken,exp:Date.now()+j.expiresIn*1000,ok:true};LS.set('vip3-rt',AU.rt);$('#da').close();snd.ok();afterLogin()}catch{snd.warn();toast('Нет интернета')}},
async setpw(){const v=$('#npw').value;if(v.length<6){snd.warn();toast('Пароль — минимум 6 символов');return}if(DEMO){toast('В демо-режиме пароля нет');return}
try{const t=await tok();const r=await fetchFast('https://identitytoolkit.googleapis.com/v1/accounts:update?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:t,password:v,returnSecureToken:true})});const j=await r.json();
if(!r.ok){snd.warn();toast(authErr(j.error&&j.error.message||''));return}
AU={t:j.idToken,rt:j.refreshToken,exp:Date.now()+j.expiresIn*1000,ok:true};LS.set('vip3-rt',AU.rt);$('#npw').value='';snd.ok();toast('✓ Пароль изменён')}catch{snd.warn();toast('Не удалось. Проверьте сеть')}},
logout(){AU={t:'',rt:'',exp:0,ok:false};LS.set('vip3-rt','');edit=0;$('#dt').close();ui();snd.tap()},
admin(){snd.tap();$('#dh').close();want='';if(isAdmin()){rTeam();rAdm();$('#dt').showModal()}else{$('#ap').value='';$('#da').showModal();$('#ap').focus()}},
toggled(){edit=!edit;ui();snd.tap()},
unhide(){if(!isAdmin())return need();mut('DELETE','catalog/hidden');snd.ok()},
tab(id){if(id==='plan')id='prep';const was=tab;if((was==='cab'||was==='sched')&&id!=='cab'&&id!=='sched'&&(ses||cabPick))cabLogout(false);tab=id;snd.tap();
[['order','#vOrder'],['prep','#vPrep'],['sched','#vSched'],['cab','#vCab'],['writeoff','#vWriteoff']].forEach(([k,s])=>{const e=$(s);e.hidden=id!==k;if(id===k&&was!==k){e.classList.remove('vin');void e.offsetWidth;e.classList.add('vin')}});
$('#bar').hidden=id!=='order';const navId=id==='cab'?'sched':id;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.id===navId));rGseg();requestAnimationFrame(placeInd);
if(id==='order'){rShifts();refreshRoster()}if(id==='prep'){rPrep();rPlan();rLibrary()}if(id==='sched')rSched();if(id==='cab'){rCab();loadIn()}if(id==='writeoff')rWriteoff();streams()},
add(id){const p=prods().find(x=>x.id===id);if(!p)return;L.draft.items[id]={id,n:p.n,c:p.c,u:L.lu[id]||p.u,qty:1};saveL();snd.add();vib(20);rep(id)},
inc(id){const i=L.draft.items[id];if(i){i.qty=Math.round((i.qty+1)*100)/100;saveL();snd.tap();rep(id)}},
dec(id){const i=L.draft.items[id];if(!i)return;i.qty=Math.round((i.qty-1)*100)/100;if(i.qty<=0){delete L.draft.items[id];snd.warn()}else snd.tap();saveL();rep(id)},
rm(id){delete L.draft.items[id];saveL();snd.warn();rep(id)},
pick(id){const k=team().find(x=>x.id===id);L.draft.cook=k;L.me=k;saveL();snd.add();rCooks();rPCooks()},
me(id){L.me=team().find(x=>x.id===id);saveL();snd.add();rPCooks()},
cat(id){cat=id;snd.tap();rCats();rList()},
wocat(id){wcat=id;snd.tap();rWoCats();rWoProducts()},
woopen(id){const p=prods().find(x=>x.id===id);if(!p)return;if(woDraft&&woDraft.product.id===id){woDraft=null;rWoProducts();return}const units=LS.get('vip3-wo-units',{});woDraft={product:p,id:'',created:0,qty:'1',unit:units[id]||p.u||'шт',reason:LS.get('vip3-wo-reason','spoiled_v2'),note:'',byId:L.me&&team().some(k=>k.id===L.me.id)?L.me.id:''};rWoProducts();requestAnimationFrame(()=>$('#woQty')?.focus({preventScroll:true}))},
woedit(id){const e=(((DATA.writeoffs||{})[wd])||{})[id];if(!e)return;const current=prods().find(x=>x.id===e.pid),p={...(current||{id:e.pid||id,n:e.name||'Товар из старого каталога',u:e.unit||''}),c:e.c||current&&current.c||'',n:e.name||current&&current.n||'Товар из старого каталога',u:e.unit||current&&current.u||''};wcat=cats().some(c=>c.id===p.c)?p.c:'all';wq='';$('#woq').value='';woDraft={product:p,id,created:e.created||0,qty:String(e.qty||1),unit:e.unit||p.u||'шт',reason:e.reason||'spoiled_v2',note:e.note||'',byId:e.by&&e.by.id||''};rWoCats();rWoProducts();requestAnimationFrame(()=>{const row=document.querySelector('.wo-product.editing');row&&row.scrollIntoView({block:'center',behavior:'smooth'});$('#woQty')?.focus({preventScroll:true})})},
wocancel(){woDraft=null;rWoProducts();snd.tap()},
wosave(){if(!woDraft||!woDraft.product)return;const qty=fq($('#woQty').value),reason=$('[data-woreason]').value,note=$('[data-wovalue="note"]').value.trim(),unit=$('[data-wounit]').value,kid=$('[data-woby]').value;if(!qty){snd.warn();toast('Укажите количество больше нуля');$('#woQty').focus();return}if(!unit){snd.warn();toast('Выберите единицу измерения');$('[data-wounit]').focus();return}if(!WO_REASONS.some(x=>x[0]===reason)&&!(woDraft.id&&reason==='spoiled')){snd.warn();toast('Выберите причину списания');$('[data-woreason]').focus();return}if(reason==='other'&&!note){snd.warn();toast('Опишите причину списания в комментарии');$('[data-wovalue="note"]').focus();return}const p=woDraft.product,k=team().find(x=>x.id===kid),id=woDraft.id||uid(),now=Date.now(),units=LS.get('vip3-wo-units',{});units[p.id]=unit;LS.set('vip3-wo-units',units);LS.set('vip3-wo-reason',reason);mut('PUT',`writeoffs/${wd}/${id}`,{pid:p.id,c:p.c||'',name:p.n,qty,unit,reason,note,by:k?{id:k.id,n:k.n}:null,created:woDraft.created||now,updated:now});woDraft=null;snd.ok();toast('✓ Списание сохранено');rWoLog();rWoProducts()},
async wocopy(){const rows=woRows(wd);if(!rows.length){snd.warn();toast('За этот день нет списаний для копирования');return}if(await clip(writeoffMessage(wd,rows))){snd.ok();toast('✓ Списание скопировано')}else{snd.warn();toast('Не удалось скопировать списание')}},
async woshare(){const rows=woRows(wd);if(!rows.length){snd.warn();toast('За этот день нет списаний для отправки');return}const text=writeoffMessage(wd,rows);if(typeof navigator.share!=='function')return ACT.wocopy();try{await navigator.share({title:`Списание за ${day(wd)}`,text});snd.ok();toast('✓ Списание отправлено')}catch(e){if(e&&e.name==='AbortError')return;if(await clip(text)){snd.ok();toast('Не удалось отправить — списание скопировано')}else{snd.warn();toast('Не удалось отправить или скопировать списание')}}},
async wodel(id){const e=(((DATA.writeoffs||{})[wd])||{})[id];if(!e||!await ask('Удалить запись о списании?',`<p>${esc(e.name)} — ${esc(fmtQ(e.qty))} ${esc(e.unit||'')}</p>`,'Да, удалить','Нет'))return;mut('DELETE',`writeoffs/${wd}/${id}`);snd.warn();toast('Запись удалена');rWoLog()},
review(){snd.tap();open('#dr');streams()},close(){snd.tap();document.querySelectorAll('dialog[open]').forEach(d=>d.close())},
copy:copyOrder,save:saveOrder,
async clear(){if(!cnt())return;if(await ask('Очистить список?','<p>Все выбранные товары будут убраны из текущего заказа.</p>','Да, очистить','Нет, оставить')){L.draft=blank(L.draft.cook);saveL();rAll();rRev();snd.warn()}},
hist(){snd.tap();rHist();$('#dh').showModal();streams()},
addcook(){if(!isAdmin())return need();const n=$('#tn').value.trim(),r=$('#tr').value.trim(),u=$('#tu').value.trim().replace(/^@+/,'').replace(/\s+/g,'');if(!n||!r){snd.warn();toast('Укажите имя и должность');return}if(team().some(k=>k.n.trim().toLocaleLowerCase('ru')===n.toLocaleLowerCase('ru'))){snd.warn();toast('Такой повар уже добавлен');return}const id=uid(),used=team().map(k=>PALETTE.includes(k.color)?k.color:hashColor(k.id)),color=PALETTE.find(c=>!used.includes(c))||hashColor(id);mut('PUT','team/'+id,Object.assign({n,r,color},u?{u}:{}));$('#tn').value=$('#tr').value=$('#tu').value='';snd.ok();$('#tn').focus();rTeam()},
async delc(id){if(!isAdmin())return need();const k=team().find(x=>x.id===id);if(!k||!await ask('Удалить сотрудника?',`<p>${esc(k.n)} — ${esc(k.r)}</p>`,'Да, удалить','Нет'))return;mut('DELETE','team/'+id);mut('DELETE','sched/'+id);if(L.draft.cook&&L.draft.cook.id===id)L.draft.cook=null;saveL();rTeam();rCooks()},
newp(){snd.tap();$('#pc').innerHTML=cats().map(c=>`<option value="${c.id}">${esc(c.n)}</option>`).join('');$('#pc').value=cat!=='all'&&cats().some(c=>c.id===cat)?cat:'sauces';$('#pu').innerHTML=UNITS.map(u=>`<option>${u}</option>`).join('');$('#pn').value='';$('#dp').showModal();$('#pn').focus()},
addprod(){const n=$('#pn').value.trim().replace(/\s+/g,' ');if(!n){snd.warn();toast('Введите название');return}const c=$('#pc').value,u=$('#pu').value;if(prods().some(p=>p.c===c&&p.n.toLowerCase()===n.toLowerCase())){snd.warn();toast('Такой товар уже есть в этой группе');return}
const k='p'+uid(),nm=n[0].toUpperCase()+n.slice(1);mut('PUT','catalog/custom/'+k,{n:nm,c,u});const id='c:'+k;L.draft.items[id]={id,n:nm,c,u,qty:1};saveL();$('#dp').close();cat=c;qs='';$('#q').value='';rAll();snd.ok();toast('✓ Добавлен для всех в «'+cats().find(x=>x.id===c).n+'»');setTimeout(()=>{const e=document.querySelector(`[data-r="${cssEsc(id)}"]`);e&&e.scrollIntoView({block:'center',behavior:'smooth'})},50)},
editp(id){if(!isAdmin())return need();const p=prods().find(x=>x.id===id);if(!p)return;$('#en').value=p.n;$('#eu').innerHTML=(UNITS.includes(p.u)?UNITS:[...UNITS,p.u]).map(u=>`<option${u===p.u?' selected':''}>${esc(u)}</option>`).join('');$('#de').dataset.id=id;snd.tap();$('#de').showModal()},
saveprod(){if(!isAdmin())return need();const id=$('#de').dataset.id,n=$('#en').value.trim().replace(/\s+/g,' '),u=$('#eu').value;if(!n){snd.warn();toast('Введите название');return}const p=prods().find(x=>x.id===id);if(!p)return;
mut('PATCH',p.k?'catalog/custom/'+p.k:'catalog/edits/'+ek(id),{n,u});L.lu[id]=u;saveL();$('#de').close();snd.ok();toast('✓ Сохранено для всех')},
async delp(id){if(!isAdmin())return need();const p=prods().find(x=>x.id===id);if(!p||!await ask('Удалить товар?',`<p>${esc(p.n)} будет удалён из каталога у всех.</p>`,'Да, удалить','Нет'))return;if(p.k)mut('DELETE','catalog/custom/'+p.k);else mut('PUT','catalog/hidden/'+ek(id),true);delete L.draft.items[id];saveL();rAll();snd.warn()},
newg(){snd.tap();$('#dg').dataset.edit='';$('#dgh').textContent='Новая группа';$('#dgok').textContent='Создать';$('#gn').value='';$('#gne').value='';$('#dg').showModal();$('#gn').focus()},
editg(){if(!isAdmin())return need();const g=cats().find(x=>x.id===cat&&x.g);if(!g)return;snd.tap();$('#dg').dataset.edit=g.id;$('#dgh').textContent='Изменить группу';$('#dgok').textContent='Сохранить';$('#gn').value=g.n;$('#gne').value=g.e;$('#dg').showModal();$('#gn').focus()},
emog(e){snd.tap();$('#gne').value=e},
emoc(e){snd.tap();$('#catE').value=e},
addgrp(){const ed0=$('#dg').dataset.edit||'',n=$('#gn').value.trim().replace(/\s+/g,' ').slice(0,40),e=Array.from($('#gne').value.trim()||'📦').slice(0,2).join('');if(!n){snd.warn();toast('Введите название группы');return}if(cats().some(c=>c.id!==ed0&&c.n.toLowerCase()===n.toLowerCase())){snd.warn();toast('Такая группа уже есть');return}
if(ed0){if(!isAdmin())return need();mut('PATCH','catalog/groups/'+ed0,{n,e})}else{const k='g'+uid();mut('PUT','catalog/groups/'+k,{n,e});cat=k}$('#dg').close();rAll();snd.ok();toast('✓ '+(ed0?'Группа сохранена: ':'Группа добавлена: ')+e+' '+n)},
async delg(){if(!isAdmin())return need();const g=cats().find(x=>x.id===cat&&x.g);if(!g)return;const ps=prods().filter(p=>p.c===g.id);if(!await ask('Удалить группу?',`<p>«${esc(g.n)}»${ps.length?` и товаров в ней: ${ps.length}`:''} будут удалены у всех.</p>`,'Да, удалить','Нет'))return;ps.forEach(p=>{mut('DELETE','catalog/custom/'+p.k);delete L.draft.items[p.id]});mut('DELETE','catalog/groups/'+g.id);cat='all';saveL();rAll();snd.warn()},
async open(id){const o=ords().find(x=>x.id===id);if(!o)return;if(cnt()&&L.draft.editId!==id&&!await ask('Заменить текущий заказ?','<p>Несохранённый черновик будет заменён выбранным заказом из истории.</p>','Да, открыть','Нет, вернуться'))return;
L.draft={cook:o.cook,date:o.date,note:o.note||'',items:Object.fromEntries(o.items.map(i=>[i.id,{...i}])),editId:o.id};saveL();$('#dh').close();rAll();snd.ok();toast('Заказ открыт. Правьте и копируйте снова')},
async hcopy(id){const o=ords().find(x=>x.id===id);if(o&&await clip(msg(o,o.date===dAdd(1)))){mut('PATCH','orders/'+id,{copied:true});rHist();snd.ok();toast('✓ Скопировано')}else{snd.warn();toast('Не удалось скопировать')}},
async hdel(id){if(!isAdmin())return need();if(!await ask('Удалить заказ?','<p>Заказ будет удалён из истории у всех.</p>','Да, удалить','Нет'))return;mut('DELETE','orders/'+id);if(L.draft.editId===id)L.draft.editId=null;saveL();rHist();snd.warn()},
// заготовки
pday(value){pd=value==='today'?dAdd(0):/^\d{4}-\d{2}-\d{2}$/.test(String(value))?String(value):dAdd(+value);LS.set('vip3-prep-date',pd);streams();rPrep();rPlan();snd.tap()},
ptpin(){const pinned=!!(DATA.prepPins||{})[pd];mut(pinned?'DELETE':'PUT','prepPins/'+pd,pinned?undefined:true);snd.tap();toast(pinned?'День откреплён':'День подготовки закреплён');rPrep();rSched()},
ppick(dt){if(!(DATA.prepPins||{})[dt])return;pd=dt;LS.set('vip3-prep-date',pd);streams();rPrep();rPlan();snd.tap()},
ptog(id){const t=((DATA.prep||{})[pd]||{})[id];if(!t)return;const p=`prep/${pd}/${id}`;
if(t.done){mut('PATCH',p,{done:null,at:null});snd.tap();return}
const w=t.by||L.me;if(!w){snd.warn();vib(80);toast('Выберите повара справа или вверху «Я работаю»');const s=document.querySelector(`[data-by="${id}"]`);if(s){s.classList.add('bad');setTimeout(()=>s.classList.remove('bad'),1500)}return}
justDone.add(id);mut('PATCH',p,{done:true,by:{id:w.id,n:w.n},at:Date.now()});rememberPrep(t,w);snd.ok();vib(30)},
async pdel(id){const t=((DATA.prep||{})[pd]||{})[id];if(!t||!await ask('Удалить заготовку?',`<p>${esc(t.t)}</p>`,'Да, удалить','Нет'))return;mut('DELETE',`prep/${pd}/${id}`);snd.warn()},
async pcopy(){const prev=dAdd(-1,pd);let src=(DATA.prep||{})[prev];if(!src&&!DEMO){try{src=await(await api('GET','prep/'+prev)).json()}catch{toast('Нет сети');return}}
const es=Object.entries(src||{}).sort((a,b)=>(a[1].c||0)-(b[1].c||0)).filter(e=>inSec(e[1].g));if(!es.length){snd.warn();toast('За вчера списка нет');return}
const m=dm();let n=0;es.forEach(([k,t],i)=>{if(m[k])return;mut('PUT',`prep/${pd}/${k}`,{t:t.t,q:t.q||'',g:t.g||'main',k:t.k||'other',...(t.pg?{pg:t.pg,pu:t.pu}:{}),...(t.lid?{lid:t.lid}:{}),c:Date.now()+i});n++});snd.ok();toast('✓ Скопировано: '+n)},
// график работы
sfil(id){sf=id;L.sf=id;ssel.clear();saveL();snd.tap();rSched()},
smon(n){const[y,m]=sm.split('-').map(Number);sm=iso(new Date(y,m-1+(+n),1,12)).slice(0,7);snd.tap();rSched()},
sedit(){if(!isAdmin()){want='sedit';snd.tap();$('#ap').value='';$('#da').showModal();$('#ap').focus();return}se=!se;ssel.clear();snd.tap();rSched()},
sday(dt){if(!(se&&isAdmin()&&sf!=='all'))return;ssel.has(dt)?ssel.delete(dt):ssel.add(dt);snd.tap();rSched()},
sapply(){if(!isAdmin())return need();if(sf==='all'){snd.warn();toast('Сначала выберите повара');return}if(!ssel.size){snd.warn();toast('Выберите дни в календаре');return}
const n=ssel.size;ssel.forEach(dt=>mut('PUT',`sched/${sf}/${dt}`,{r:'Р',work:true}));publishAcct(sf);ssel.clear();snd.ok();toast('✓ Рабочие дни отмечены: '+n);rSched()},
sclear(){if(!isAdmin())return need();if(sf==='all'||!ssel.size){snd.warn();toast('Выберите повара и дни');return}const n=ssel.size;ssel.forEach(dt=>mut('DELETE',`sched/${sf}/${dt}`));publishAcct(sf);ssel.clear();snd.warn();toast('Смены убраны: '+n);rSched()},
// диагностика
diag(){snd.tap();rDiag();$('#dd').showModal()},
async dtest(){const out=[],log=s=>{out.push(s);$('#dlog').textContent=out.join('\n')};if(DEMO){log('Демо-режим: config.js не заполнен');return}
if(!DB){await detect();log('Поиск базы: '+(DB||'не найдена'));if(!DB)return}log('База: '+DB);
try{const r=await fetchFast(DB+'/.json?shallow=true',{},5000);log('Чтение: HTTP '+r.status)}catch(e){log('Чтение: нет связи')}
const u=`${DB}/prep/_ping/${DEV}.json`;try{const r=await fetchFast(u,{method:'PUT',body:JSON.stringify({t:Date.now()})},5000);log('Запись: HTTP '+r.status);const g=await fetchFast(u,{},5000);log('Проверка записи: HTTP '+g.status);await fetchFast(u,{method:'DELETE'},5000)}catch(e){log('Запись: нет связи')}
log('Живая связь: '+(ST.open.meta&&!metaBroken?'мгновенная ✓':metaBroken?'опрос (правила)':'опрос'));log('Если оба кода 200 — всё работает.')},
dre(){snd.tap();Object.keys(ES).forEach(k=>ES[k].close());for(const k in MV)delete MV[k];metaBroken=0;if(!CFG.dbUrl){DB='';LS.set('vip3-db','')}setSt();detect().then(()=>{streams();flush();setSt();setTimeout(rDiag,2000)})},
async dclr(){if(!await ask('Сбросить кэш?','<p>Очистятся временные данные этого телефона и приложение перезагрузится. Данные в облаке не затрагиваются.</p>','Да, сбросить','Нет'))return;try{LS.set('vip3-cache',{});LS.set('vip3-db','');const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()))}catch{}location.reload()},
// добавление заготовок (простой режим)

cuser(id){if(!isAdmin())return need();const k=team().find(x=>x.id===id);if(!k)return;$('#uu').value=k.u||'';$('#du').dataset.id=id;$('#utitle').textContent='Username: '+k.n;snd.tap();$('#du').showModal();$('#uu').focus()},
usave(){if(!isAdmin())return need();const id=$('#du').dataset.id,k=team().find(x=>x.id===id),u=$('#uu').value.trim().replace(/^@+/,'').replace(/\s+/g,'');if(!k)return;if(k.virtual)mut('PUT','team/'+id,{n:k.n,r:k.r,color:cookColor(id),u});else mut('PATCH','team/'+id,{u:u||null});$('#du').close();snd.ok();toast(u?'✓ @'+u+' сохранён':'Username убран');rTeam();rShifts()},
sfton(id){if(!isAdmin())return need();const tom=dAdd(1);if(shiftsFor(tom).map[id]!==undefined){setShift(id,'');snd.tap();return}const inp=document.querySelector(`[data-sft="${cssEsc(id)}"]`),v=inp&&inp.value||L.at||'14:00';L.at=v;saveL();setShift(id,v);snd.add()},
woinc(){if(!woDraft)return;const v=Math.round(((fq(woDraft.qty)||0)+1)*100)/100;woDraft.qty=String(v);$('#woQty').value=fmtQ(v);snd.tap()},
wodec(){if(!woDraft)return;const v=Math.round(((fq(woDraft.qty)||1)-1)*100)/100;if(v<=0){snd.warn();return}woDraft.qty=String(v);$('#woQty').value=fmtQ(v);snd.tap()},
qban(){qb=qb?0:1;snd.tap();rPlan()},
qpick(key){const p=String(key).split(':'),kind=p.shift(),id=p.join(':'),i=kind==='lib'?libItems().find(x=>x.id===id):planItems().find(x=>x.id===id);if(!i)return;addFromLib(i,kind==='lib'?id:'')},
tkopen(id,isNew){const t=dm()[id];if(!t)return;tk={id,mode:t.pg?'g':'n',kt:0};const lib=libItems().find(x=>nt(x.t)===nt(t.t));
$('#tkh').textContent=isNew?'Сколько приготовить?':'Заготовка';$('#tkn').value=t.t;$('#tkb').checked=t.g==='banq';$('#tksv').value=okTm(t.sv)?t.sv:'';$('#tksvb').hidden=t.g!=='banq';$('#tkc').innerHTML=pcats().map(c=>`<option value="${esc(c[0])}"${c[0]===pk(t)?' selected':''}>${esc(c[1])} ${esc(c[2])}</option>`).join('');
const m=String(t.q||'').match(/^\s*(\d+(?:[.,]\d+)?)\s*(.*)$/),u=PU.indexOf(((m&&m[2])||'').trim())>=0?m[2].trim():LS.get('vip3-tk-unit','порц');
$('#tku').innerHTML=PU.map(x=>`<option${x===u?' selected':''}>${x}</option>`).join('');$('#tkq').value=m?m[1]:'';
$('#tkgu').innerHTML=PU.map(x=>`<option${x===(t.pu||'порц')?' selected':''}>${x}</option>`).join('');$('#tkk').value=t.pg?fmtQ(t.pg):'1';$('#tkgst').value=guestsOf(pd)||'';
let h='';if(lib&&lib.pg)h=`<button class="chip qp" data-a="tkhint" data-id="g">👥 как раньше: ${esc(fmtQ(lib.pg))} ${esc(lib.pu||'')} на гостя</button>`;else if(lib&&lib.q)h=`<button class="chip qp" data-a="tkhint" data-id="n">как раньше: ${esc(lib.q)}</button>`;
if(guestsOf(pd)>0&&!t.pg)h+=`<button class="chip qp" data-a="tkguest">👥 Как число гостей (${guestsOf(pd)})</button>`;$('#tkhint').innerHTML=h;{const ks=t.ks||(lib&&lib.ks)||'';$('#tkcs').textContent=ks==='auto'?'✨ Определено автоматически — измените, если не так':ks==='?'?'❓ Не удалось определить — выберите категорию':''}tkMode(tk.mode);snd.tap();$('#dtk').showModal();setTimeout(()=>{(tk.mode==='n'?$('#tkq'):$('#tkgst')).focus()},60)},

cabgo(){cabPick=(sf!=='all'&&team().some(x=>x.id===sf))?sf:null;ACT.tab('cab')},
cabpick(id){cabPick=id;ses=null;acctData=null;csec='sh';snd.tap();rCab(true);setTimeout(()=>{const p=$('#cabpw');if(p)p.focus()},60)},
cabback(){cabPick=null;snd.tap();rCab()},
async cablogin(){const pw=($('#cabpw')||{}).value||'';if(!cabPick||!pw){snd.warn();return}if(DEMO){toast('Нужно подключить облако (config.js)');return}if(!(window.crypto&&crypto.subtle)){toast('Браузер не поддерживает защищённый вход');return}
try{const key=await acctKey(cabPick,pw),d=await jget('acct/'+key);if(!d||!d.n){snd.warn();vib(120);toast('Неверный пароль или кабинет ещё не настроен');return}ses={id:cabPick,key};acctData=d;csec='sh';cabTouch();snd.ok();rCab(true)}catch(e){snd.warn();toast('Нет связи')}},
cabout(){cabLogout(false);snd.tap();toast('Вы вышли из кабинета')},
cabmon(n){const a=mm.split('-').map(Number);mm=iso(new Date(a[0],a[1]-1+(+n),1,12)).slice(0,7);cabTouch();snd.tap();rCab(true)},
csec(id){if(!SECF[id])return;csec=id;snd.tap();cabTouch();rCab(true)},
catmgr(){if(!isAdmin())return need();rCatMgr();$('#dcat').showModal();snd.tap();streams()},
catadd(){if(!isAdmin())return need();const e=Array.from($('#catE').value.trim()||'🏷️').slice(0,2).join(''),n=$('#catN').value.trim().replace(/\s+/g,' ').slice(0,30);if(!n){snd.warn();toast('Введите название категории');$('#catN').focus();return}if(pcats().some(c=>nt(c[2])===nt(n))){snd.warn();toast('Такая категория уже есть');return}mut('PUT','prepCats/x'+uid(),{e,n,o:Date.now()});$('#catE').value=$('#catN').value='';snd.ok();toast('✓ Категория добавлена: '+e+' '+n);rCatMgr()},
async catdel(id){if(!isAdmin())return need();const v=(DATA.prepCats||{})[id];if(!v||!await ask('Удалить категорию?',`<p>${esc(v.e||'')} ${esc(v.n)}</p><p class="small">Заготовки с этой категорией останутся и перейдут в «Другое».</p>`,'Да, удалить','Нет'))return;mut('DELETE','prepCats/'+id);if(lf===id)lf='all';snd.warn();rCatMgr()},
cabrate(){if(!ses)return;const f=($('#cabrf')||{}).value,raw=String(($('#cabrr')||{}).value||'').trim().replace(',','.'),v=Number(raw);if(!DRE.test(f||'')||raw===''||!(v>=0)||v>100000){snd.warn();toast('Укажите дату и ставку за час');return}cabSave('rt',uid(),{f,r:Math.round(v*100)/100,t:Date.now()},'✓ Ставка записана')},
async cabrdel(id){if(!ses||!acctData)return;const v=(acctData.rt||{})[id];if(!v||!await ask('Удалить ставку?',`<p>с ${esc(day(v.f))} — ${esc(mny(v.r,acctData.c))} / час</p>`,'Да, удалить','Нет'))return;cabSave('rt',id,null)},
cabpay(){if(!ses)return;const d=($('#cabpd')||{}).value,raw=String(($('#cabpa')||{}).value||'').trim().replace(',','.'),a=Number(raw),t=($('#cabpt')||{}).value||'oth',n=String(($('#cabpn')||{}).value||'').trim().slice(0,60);if(!DRE.test(d||'')||raw===''||!(a>0)||a>10000000||!PT[t]){snd.warn();toast('Укажите дату и сумму');return}const m=t==='sal'?prevM(d.slice(0,7)):t==='oth'?mm:d.slice(0,7);cabSave('pm',uid(),{d,a:Math.round(a*100)/100,t,m,n,w:Date.now()},'✓ Записано: '+mny(a,acctData&&acctData.c))},
async cabpdel(id){if(!ses||!acctData)return;const v=(acctData.pm||{})[id];if(!v||!await ask('Удалить запись?',`<p>${esc(day(v.d))} · ${esc(mny(v.a,acctData.c))}</p>`,'Да, удалить','Нет'))return;cabSave('pm',id,null)},
cabadd(){if(!ses)return;const d=($('#cabd')||{}).value,raw=String(($('#cabh')||{}).value||'').trim().replace(',','.'),v=Number(raw);if(!d||raw===''||!(v>=0)||v>24){snd.warn();toast('Укажите дату и часы (0–24)');return}if(acctData&&acctData.ex&&acctData.ex[d]){snd.warn();toast('Этот день исправил шеф');return}cabSet(d,Math.round(v*100)/100)},
paypick(id){pc=id;snd.tap();rPayAdm(true)},
paypw(id){if(!isAdmin())return need();const k=team().find(x=>x.id===id);if(!k)return;$('#pwh').textContent='Пароль кабинета: '+k.n;$('#pwv').value='';$('#dpw').dataset.id=id;$('#pwdel').hidden=!(PAYROLL()[id]&&PAYROLL()[id].key);snd.tap();$('#dpw').showModal();setTimeout(()=>$('#pwv').focus(),60)},
async pwsave(){if(!isAdmin())return need();const id=$('#dpw').dataset.id,pw=$('#pwv').value.trim();if(pw.length<6){snd.warn();toast('Пароль — минимум 6 символов');return}if(!(window.crypto&&crypto.subtle)){toast('Браузер не поддерживает защищённый вход');return}
const key=await acctKey(id,pw),old=(PAYROLL()[id]||{}).key;if(old&&old!==key){let u=null;try{u=await jget('acct/'+old)}catch(e){}if(u)['in','rt','pm'].forEach(s=>{if(u[s])mut('PUT','acct/'+key+'/'+s,u[s])});mut('DELETE','acct/'+old)}mut('PATCH','payroll/'+id,{key});publishAcct(id);$('#dpw').close();snd.ok();toast('✓ Пароль установлен. Сообщите его повару');rPayAdm(true)},
async pwdel(){if(!isAdmin())return need();const id=$('#dpw').dataset.id,old=(PAYROLL()[id]||{}).key;if(old){let u=null;try{u=await jget('acct/'+old)}catch(e){toast('Нет связи — кабинет не отключён');return}u=u||{};
Object.entries(u.in||{}).forEach(([d,v])=>{if(v&&Number(v.h)>=0&&!(((PAYROLL()[id]||{}).hours||{})[d]!==undefined))mut('PATCH',`payroll/${id}/hours`,{[d]:Number(v.h)})});
Object.entries(u.rt||{}).forEach(([r,v])=>{if(v&&DRE.test(v.f||''))mut('PUT',`payroll/${id}/rates/${r}`,{f:v.f,r:Number(v.r)||0,t:v.t||0})});
Object.entries(u.pm||{}).forEach(([r,v])=>{if(v&&Number(v.a)>0)mut('PUT',`payroll/${id}/pay/${r}`,{d:v.d,a:Number(v.a),t:v.t||'oth',m:v.m||String(v.d).slice(0,7),n:(v.n||'')+' (записал повар)'})});
mut('DELETE','acct/'+old)}mut('PATCH','payroll/'+id,{key:null});$('#dpw').close();snd.warn();toast('Кабинет повара отключён. Всё, что он записал, сохранено у вас');if(DATA.acctU)delete DATA.acctU[id];rPayAdm(true)},
phadd(){if(!isAdmin()||!pc)return need();const d=$('#phd').value,h=Number(String($('#phh').value).replace(',','.'));if(!d||!(h>0)){snd.warn();toast('Укажите дату и часы');return}mut('PATCH','payroll/'+pc+'/hours',{[d]:h});publishAcct(pc);$('#phh').value='';snd.ok();rPayAdm(true)},
payadd(){if(!isAdmin()||!pc)return need();const d=$('#pyd').value,a=Number(String($('#pya').value).replace(',','.')),t=$('#pyt').value,n=$('#pyn').value.trim();if(!d||!(a>0)){snd.warn();toast('Укажите дату и сумму');return}
const m=t==='sal'?prevM(d.slice(0,7)):d.slice(0,7);mut('PUT',`payroll/${pc}/pay/${uid()}`,{d,a:Math.round(a*100)/100,t,m,n});publishAcct(pc);$('#pya').value=$('#pyn').value='';snd.ok();toast('✓ Выплата записана');rPayAdm(true)},
fineadd(){if(!isAdmin()||!pc)return need();const d=($('#fnd')||{}).value,raw=String(($('#fna')||{}).value||'').trim().replace(',','.'),a=Number(raw),n=String(($('#fnn')||{}).value||'').trim().replace(/\s+/g,' ').slice(0,60);if(!DRE.test(d||'')||raw===''||!(a>0)||a>10000000){snd.warn();toast('Укажите дату и сумму штрафа');return}mut('PUT',`payroll/${pc}/fines/${uid()}`,{d,a:Math.round(a*100)/100,n,t:Date.now()});publishAcct(pc);snd.warn();toast('✓ Штраф записан: −'+mny(a,CUR()));rPayAdm(true)},
async finedel(id){if(!isAdmin()||!pc)return need();const v=((PAYROLL()[pc]||{}).fines||{})[id];if(!v||!await ask('Удалить штраф?',`<p>${esc(day(v.d))} · −${esc(mny(v.a,CUR()))}${v.n?' · '+esc(v.n):''}</p><p class="small">Сумма вернётся в начисления повара.</p>`,'Да, удалить','Нет'))return;mut('DELETE',`payroll/${pc}/fines/${id}`);publishAcct(pc);snd.warn();rPayAdm(true)},
async paydel(id){if(!isAdmin()||!pc)return need();const v=snapFor(pc,true).pay[id];if(!v||!await ask('Удалить выплату?',`<p>${esc(day(v.d))} · ${esc(mny(v.a,CUR()))}${v.u==='c'?' (записал повар)':''}</p>`,'Да, удалить','Нет'))return;if(id.slice(0,2)==='c_')delUser(pc,'pm',id.slice(2));else{mut('DELETE',`payroll/${pc}/pay/${id}`);publishAcct(pc)}snd.warn();rPayAdm(true)},
rateadd(){if(!isAdmin()||!pc)return need();const f=$('#rtd').value,raw=String($('#rtr').value||'').trim().replace(',','.'),r=Number(raw);if(!DRE.test(f||'')||raw===''||!(r>=0)||r>100000){snd.warn();toast('Укажите дату и ставку');return}mut('PUT',`payroll/${pc}/rates/${uid()}`,{f,r:Math.round(r*100)/100,t:Date.now()});publishAcct(pc);$('#rtr').value='';snd.ok();toast('✓ Ставка записана');rPayAdm(true)},
async ratedel(id){if(!isAdmin()||!pc)return need();const x=(snapFor(pc,true).rs||[]).find(v=>v.id===id);if(!x||!await ask('Удалить ставку?',`<p>с ${esc(day(x.f))} — ${esc(mny(x.r,CUR()))} / час${x.u==='c'?' (записал повар)':''}</p>`,'Да, удалить','Нет'))return;if(id.slice(0,2)==='c_')delUser(pc,'rt',id.slice(2));else{mut('DELETE',`payroll/${pc}/rates/${id}`);publishAcct(pc)}snd.warn();rPayAdm(true)},
lfil(id){lf=id;snd.tap();rPlan();rLibrary()},
tkinc(){const v=Math.round(((fq($('#tkq').value)||0)+1)*100)/100;$('#tkq').value=fmtQ(v);snd.tap()},
tkdec(){const v=Math.round(((fq($('#tkq').value)||1)-1)*100)/100;if(v>0)$('#tkq').value=fmtQ(v);snd.tap()},
tkset(v){$('#tkq').value=v;if(tk&&tk.mode!=='n')tkMode('n');snd.tap()},
tkguest(){if(!tk)return;$('#tkk').value='1';$('#tkgst').value=guestsOf(pd)||'';$('#tkgu').value='порц';tkMode('g');snd.tap()},
clchk(i){if(!CL)return;CL.st[i]=CL.st[i]?0:1;CL.draw();CL.st[i]?snd.tap():snd.warn()},
clgo(){if(!CL)return;if(CL.st.some(x=>!x)){snd.warn();toast('Отметьте все пункты');return}const r=CL.res;CL=null;$('#dcl').onclose=null;$('#dcl').close();r(true)},
clno(){if(!CL)return;const r=CL.res;CL=null;$('#dcl').onclose=null;$('#dcl').close();r(false)},
tkmode(m){if(tk){tkMode(m);snd.tap()}},
tkhint(kind){if(!tk)return;const t=dm()[tk.id],lib=t&&libItems().find(x=>nt(x.t)===nt(t.t));if(!lib)return;if(kind==='g'){$('#tkk').value=fmtQ(lib.pg);$('#tkgu').value=lib.pu||'порц';tkMode('g')}else{const m=String(lib.q||'').match(/^\s*(\d+(?:[.,]\d+)?)\s*(.*)$/);if(m){$('#tkq').value=m[1];if(PU.indexOf(m[2].trim())>=0)$('#tku').value=m[2].trim()}tkMode('n')}snd.tap()},
tksave(){if(!tk)return;const id=tk.id;if(!dm()[id])return;const t=$('#tkn').value.trim().replace(/\s+/g,' ');if(!t){snd.warn();toast('Введите название');return}const g=$('#tkb').checked?'banq':'main',k=$('#tkc').value||'other',ks=tk.kt?'user':(dm()[id].ks||'auto');let patch;
if(tk.mode==='g'){const gs=Math.round(Number(String($('#tkgst').value).replace(',','.')))||0,k=fq($('#tkk').value);if(!k){snd.warn();toast('Сколько на одного гостя?');return}if(gs>0&&gs!==guestsOf(pd))mut('PUT',`prepMeta/${pd}/guests`,gs);patch={t,g,k:$('#tkc').value||'other',ks,q:null,pg:k,pu:$('#tkgu').value}}
else{const n=fq($('#tkq').value),u=$('#tku').value;LS.set('vip3-tk-unit',u);patch={t,g,k,ks,q:n?`${fmtQ(n)} ${u}`:'',pg:null,pu:null}}
{const sv=$('#tksv').value;patch.sv=g==='banq'&&okTm(sv)?sv:null}mut('PATCH',`prep/${pd}/${id}`,patch);libTouch(patch);$('#dtk').close();snd.ok()},
async tkdel(){const id=tk&&tk.id;if(!id)return;await ACT.pdel(id);if(!dm()[id])$('#dtk').close()},
gstedit(){$('#gsn').value=guestsOf(pd)||'';snd.tap();$('#dgs').showModal();setTimeout(()=>$('#gsn').focus(),60)},
gstsave(){const n=Math.round(Number(String($('#gsn').value).replace(',','.')))||0;if(n>0)mut('PUT',`prepMeta/${pd}/guests`,n);else mut('DELETE',`prepMeta/${pd}/guests`);$('#dgs').close();snd.ok();rPrep()},
wodone(id){const e=((DATA.writeoffs||{})[wd]||{})[id];if(!e)return;mut('PATCH',`writeoffs/${wd}/${id}`,e.done?{done:null,doneAt:null}:{done:true,doneAt:Date.now()});snd.ok()},
qgrp(id){qg=id;snd.tap();rPlan()},
qnewg(){snd.tap();$('#qgn').value='';$('#dq').showModal();$('#qgn').focus()},
qaddg(){const n=$('#qgn').value.trim();if(!n){snd.warn();toast('Введите название группы');return}if(pgroups().some(g=>nt(g.n)===nt(n))){snd.warn();toast('Такая группа уже есть');return}const k='q'+uid();mut('PUT','plan/groups/'+k,{n});qg=k;$('#dq').close();snd.ok();rPlan()},
async qdelg(){const g=pgroups().find(x=>x.id===qg);if(!g||g.id==='main'||g.id==='banq')return;const its=planItems().filter(i=>(i.g||'main')===g.id);if(!await ask('Удалить группу?',`<p>«${esc(g.n)}»${its.length?` и заготовок в ней: ${its.length}`:''} будут удалены.</p>`,'Да, удалить','Нет'))return;its.forEach(i=>mut('DELETE','plan/items/'+i.id));mut('DELETE','plan/groups/'+g.id);qg='main';snd.warn();rPlan()},
qadd(){const t=$('#qt').value.trim().replace(/\s+/g,' '),q=$('#qq').value.trim();if(!t){snd.warn();toast('Напишите, что приготовить');$('#qt').focus();return}
const g=psec==='banq'?'banq':'main';if(Object.values(dm()).some(x=>nt(x.t)===nt(t)&&((x.g==='banq')===(g==='banq')))){snd.warn();toast('Эта заготовка уже есть на этот день');return}
const old=libFind(t,g),cl=classify(t),ctx=curK();let k,ks;
if(old&&old.ks==='user'&&old.k&&old.k!=='other'){k=old.k;ks='user'}else if(cl.k!=='other'){k=cl.k;ks='auto'}else if(ctx!=='other'){k=ctx;ks='ctx'}else{k='other';ks='?'}
mut('PUT',`prep/${pd}/${uid()}`,{t,q,g,k,ks,c:Date.now()});mut('PUT','prepLibrary/'+(old?old.id:libId(t,g)),{t,q,g,k,ks,by:old&&old.by?old.by:null,usedAt:Date.now()});$('#qt').value=$('#qq').value='';snd.add();toast(ks==='?'?'✓ Добавлено · выберите категорию (❓)':'✓ Добавлено · '+pcIcon(k)+' '+(catById(k)||[0,0,''])[2]);$('#qt').focus()},
psec(id){psec=id==='banq'?'banq':'main';LS.set('vip3-psec',psec);lf='all';snd.tap();rPrep();rPlan();rLibrary()},
bqtab(id){bqt=id==='prep'?'prep':'info';LS.set('vip3-bqt',bqt);snd.tap();rBq()},
bqsave(){bqWrite();bqt='prep';LS.set('vip3-bqt',bqt);snd.ok();toast('✓ Банкет сохранён · теперь заготовки');rBq();try{$('#bqtabs').scrollIntoView({block:'start'})}catch{}},
svopen(id){const t=dm()[id];if(!t)return;svd={id};$('#svn').textContent=t.t;$('#svt').value=okTm(t.sv)?t.sv:'';$('#svq').innerHTML=svChips();snd.tap();$('#dsv').showModal()},
svset(v){if(okTm(v)){$('#svt').value=v;snd.tap()}},
svsave(){if(!svd)return;const id=svd.id;if(!dm()[id]){$('#dsv').close();return}const v=$('#svt').value;if(v&&!okTm(v)){snd.warn();toast('Введите время, например 19:30');return}mut('PATCH',`prep/${pd}/${id}`,{sv:v||null});$('#dsv').close();snd.ok();if(v)toast('🕐 Подача в '+v)},
svclr(){if(!svd)return;const id=svd.id;if(dm()[id])mut('PATCH',`prep/${pd}/${id}`,{sv:null});$('#dsv').close();snd.tap()},
qone(){const t=$('#qt').value.trim().replace(/\s+/g,' '),q=$('#qq').value.trim();if(!t){snd.warn();toast('Напишите название заготовки');$('#qt').focus();return}mut('PUT',`prep/${pd}/${uid()}`,{t,q,g:qg,c:Date.now()});$('#qt').value=$('#qq').value='';snd.add();toast('✓ Добавлено в подготовку на этот день')},
async qtog(id){const i=planItems().find(x=>x.id===id);if(!i)return;const t=dm()[id];
if(t){if(t.done&&!await ask('Заготовка уже выполнена',`<p>${esc(t.t)} отмечена поваром. Убрать из дня?</p>`,'Да, убрать','Нет'))return;mut('DELETE',`prep/${pd}/${id}`);snd.tap();return}
mut('PUT',`prep/${pd}/${id}`,{t:i.t,q:i.q||'',g:i.g||'main',lid:id,c:Date.now()});snd.add()},
qall(){const m=dm();let n=0;planItems().filter(i=>(i.g||'main')===qg&&!m[i.id]).forEach((i,k)=>{mut('PUT',`prep/${pd}/${i.id}`,{t:i.t,q:i.q||'',g:i.g||'main',lid:i.id,c:Date.now()+k});n++});if(n){snd.ok();toast('✓ Добавлено в день: '+n)}},
qnone(){const m=dm();let n=0;planItems().filter(i=>(i.g||'main')===qg&&m[i.id]&&!m[i.id].done).forEach(i=>{mut('DELETE',`prep/${pd}/${i.id}`);n++});if(n){snd.tap();toast('Убрано из дня: '+n+' (выполненные остаются)')}},
async qdel(id){const i=planItems().find(x=>x.id===id);if(!i||!await ask('Удалить из списка?',`<p>${esc(i.t)}</p><p style="color:var(--mu)">Из уже созданных дней она не удаляется.</p>`,'Да, удалить','Нет'))return;mut('DELETE','plan/items/'+id);snd.warn()},
libnew(){libraryDialog(null)},
libedit(id){const i=libItems().find(x=>x.id===id);if(i)libraryDialog(i)},
libsave(){const raw=$('#llt').value.trim().replace(/\s+/g,' '),q=$('#llq').value.trim().replace(/\s+/g,' '),g=$('#llg').value||'main',oldId=$('#dl').dataset.id||'';if(!raw){snd.warn();toast('Введите название заготовки');$('#llt').focus();return}const duplicate=libItems().find(i=>i.id!==oldId&&nt(i.t)===nt(raw));if(duplicate){snd.warn();toast('Такая заготовка уже есть в истории');return}const old=oldId?libItems().find(i=>i.id===oldId):null,id=oldId||libId(raw,g);const sel=($('#llc')||{}).value||'';let kk,kks;if(sel){kk=sel;kks=old&&old.k===sel&&old.ks?old.ks:'user'}else{const cl=classify(raw);kk=cl.k;kks=cl.ks}mut('PUT','prepLibrary/'+id,{t:raw,q,g,k:kk,ks:kks,...(old&&old.pg?{pg:old.pg,pu:old.pu}:{}),by:old&&old.by?old.by:null,usedAt:old&&old.usedAt||Date.now()});$('#dl').close();snd.ok();toast(old?'Изменения сохранены':'Заготовка добавлена в историю');rLibrary()},
async libdelete(id){const i=libItems().find(x=>x.id===id);if(!i||!await ask('Удалить заготовку из истории?',`<p>${esc(i.t)}</p><p style="color:var(--mu)">Записи в днях подготовки останутся без изменений.</p>`,'Да, удалить','Нет'))return;mut('DELETE','prepLibrary/'+id);snd.warn();toast('Удалено из истории')},
libadd(id){const i=libItems().find(x=>x.id===id);if(i)addFromLib(i,id)}
};
const rAll=()=>{rCooks();rPCooks();rCats();rList();rBar();rShifts();rPrep();rPlan();rLibrary();rSched();if(tab==='writeoff')rWriteoff()};
$('#dh').addEventListener('close',streams);
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&ACT[b.dataset.a])ACT[b.dataset.a](b.dataset.id);else if(e.target.tagName==='DIALOG'&&!e.target.id.startsWith('dc'))e.target.close()});
document.addEventListener('input',e=>{const key=e.target.dataset.wovalue;if(key&&woDraft)woDraft[key]=e.target.value;if(e.target.id==='tkgst'||e.target.id==='tkk')tkRes()});
document.addEventListener('change',e=>{const t=e.target,d=t.dataset;
if(d.ch){cabEdit(t,d);return}
if(d.ce||d.cn){catEdit(t,d);return}
if(d.pset||d.ph){payChange(t,d);return}
if(t.id==='tkc'){if(tk)tk.kt=1;return}
if(t.id==='tkgu'){tkRes();return}
if(d.wounit){const units=LS.get('vip3-wo-units',{});units[d.wounit]=t.value;LS.set('vip3-wo-units',units);if(woDraft)woDraft.unit=t.value}
else if(d.woreason){if(woDraft)woDraft.reason=t.value;LS.set('vip3-wo-reason',t.value)}
else if(d.woby){if(woDraft)woDraft.byId=t.value}
else if(d.wovalue){if(woDraft)woDraft[d.wovalue]=t.value}
else if(d.q){const i=L.draft.items[d.q],v=fq(t.value);if(!i)return;if(v){i.qty=v;snd.tap()}else{delete L.draft.items[d.q];snd.warn()}saveL();rep(d.q)}
else if(d.un){const i=L.draft.items[d.un];if(i){i.u=t.value;L.lu[d.un]=t.value;saveL();snd.tap();rep(d.un)}}
else if(d.sft){if(!isAdmin())return;if(t.value){L.at=t.value;saveL();setShift(d.sft,t.value);snd.tap()}}
else if(d.by){const k=team().find(x=>x.id===t.value);mut('PATCH',`prep/${pd}/${d.by}`,{by:k?{id:k.id,n:k.n}:null});snd.add()}});
let rf;$('#q').addEventListener('input',e=>{qs=e.target.value;cancelAnimationFrame(rf);rf=requestAnimationFrame(rList)});
let wrf;$('#woq').addEventListener('input',e=>{wq=e.target.value;cancelAnimationFrame(wrf);wrf=requestAnimationFrame(rWoProducts)});
$('#woDate').addEventListener('change',e=>{if(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)){wd=e.target.value;streams();rWriteoff()}});
$('#date').addEventListener('change',e=>{L.draft.date=e.target.value||dAdd(1);saveL();sumDn()});
$('#note').addEventListener('input',e=>{L.draft.note=e.target.value;saveL();sumDn();fitNote()});$('#dnbox').addEventListener('toggle',fitNote);
$('#hq').addEventListener('input',rHist);
$('#bqinfo').addEventListener('change',()=>{bqWrite();snd.tap()});
$('#bqinfo').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.tagName==='INPUT'){e.preventDefault();e.target.blur()}});
$('#tkb').addEventListener('change',e=>{$('#tksvb').hidden=!e.target.checked});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='cabpw')ACT.cablogin()});document.addEventListener('pointerdown',()=>{if(ses)cabTouch()});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(hideT);if(ses)hideT=setTimeout(()=>cabLogout(true),30000)}else clearTimeout(hideT)});
$('#pwv').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.pwsave()});
setInterval(()=>{if(document.hidden)return;if(tab==='cab'&&ses&&!busyEdit())refreshAcct();if(tab==='cab'&&isAdmin())loadIn()},8000);$('#libq').addEventListener('input',rLibrary);
const setPd=e=>{if(e.target.value){pd=e.target.value;LS.set('vip3-prep-date',pd);streams();rPrep();rPlan()}};$('#pdate').addEventListener('change',setPd);
$('#qt').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.qadd()});
$('#qq').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.qadd()});
$('#qgn').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.qaddg()});
$('#ap').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.login()});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();$('#q').focus()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){dayCheck();streams();flush();refreshRoster();try{navigator.serviceWorker.getRegistration().then(r=>r&&r.update())}catch{}}});
addEventListener('online',()=>{retryAt=0;failures=0;streams();flush();refreshRoster()});
let curDay=dAdd(0);function dayCheck(){const n=dAdd(0);if(n===curDay)return;const o=curDay;curDay=n;if(pd===o){pd=n;LS.set('vip3-prep-date',pd)}if(wd===o)wd=n;rAll();streams();refreshRoster()}
setInterval(dayCheck,30000);setInterval(()=>{if(tab==='order')refreshRoster()},60000);addEventListener('offline',()=>setSt());
setInterval(()=>{if(!DB&&!DEMO)detect().then(()=>{streams();setSt();refreshRoster()});flush();if(!document.hidden&&Object.keys(ES).some(k=>ST.open[k]&&Date.now()-(ST.seen[k]||0)>90000))restartStreams()},30000);
setInterval(()=>{if(document.hidden)return;tickN++;const sse=ST.open.meta&&!metaBroken,hasMeta=Object.keys(DATA.meta||{}).length>0;if(sse&&hasMeta&&tickN%12)return;pollMeta(sse?tickN%12===0:(metaBroken||!hasMeta||tickN%8===0))},2500);
const EMO=['🥩','🍗','🥓','🐟','🦐','🥚','🧀','🥛','🥬','🥕','🍅','🧅','🍄','🍎','🍋','🌶️','🧂','🫒','🍞','🥐','🍝','🍚','🥫','🍰','🍦','🍫','🥤','🍹','🍺','☕','🧴','🥡','🍢','🍔','🍕','🌯','🥗','🍲','🔥','📦'],emoH=a=>EMO.map(e=>`<button type="button" data-a="${a}" data-id="${e}" aria-label="${e}">${e}</button>`).join('');$('#gemo').innerHTML=emoH('emog');$('#cemo').innerHTML=emoH('emoc');
syncDraft();rAll();setSt();placeInd();addEventListener('load',placeInd);addEventListener('resize',placeInd);addEventListener('orientationchange',()=>setTimeout(placeInd,200));detect().then(()=>{streams();flush()});
if(AU.rt&&!DEMO)tok().then(()=>{ensureTeamColors();ui()}).catch(()=>{});
// ---------- установка на главный экран ----------
{const b=$('#instb');if(b){const UA=navigator.userAgent||'',iOS=/iphone|ipad|ipod/i.test(UA)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),AND=/android/i.test(UA),
safari=iOS&&/safari/i.test(UA)&&!/crios|fxios|edgios|opios|gsa\/|fban|fbav|instagram|line\/|telegram|yabrowser/i.test(UA),
inApp=/fban|fbav|instagram|line\/|telegram|vkclient|whatsapp|; wv\)/i.test(UA),
standalone=()=>{try{return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true}catch(e){return false}},
hid=()=>(Date.now()-(Number(LS.get('vip-inst-x',0))||0))<14*864e5;let dp=window.__dp||null;
const show=()=>{const ok=!standalone()&&!hid()&&(iOS||AND||!!dp);b.hidden=!ok;if(ok){$('#instgo').textContent=dp?'Установить':'Как?';$('#insub').textContent=dp?'Иконка на главном экране — открывается как приложение':'Покажем, как добавить на главный экран'}};
const SH='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',AD='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>';
const copyBtn='<div class="acts" style="margin-top:8px"><button class="p" data-i="copy">📋 Скопировать ссылку</button></div>';
const stepsHTML=()=>{if(iOS)return (safari?'':`<div class="inote">⚠️ Сейчас страница открыта не в Safari. На iPhone добавить на экран «Домой» надёжно можно только из <b>Safari</b>: скопируйте ссылку, откройте Safari и вставьте её в адресную строку.${copyBtn}</div>`)+`<ol class="ist"><li><span>Нажмите кнопку «Поделиться» ${SH} — внизу экрана (на iPad — вверху справа).</span></li><li><span>Прокрутите меню вниз и выберите <b>«На экран “Домой”»</b> ${AD}.</span></li><li><span>Нажмите <b>«Добавить»</b> в правом верхнем углу — иконка появится на главном экране.</span></li></ol>`;
if(AND)return (inApp?`<div class="inote">⚠️ Страница открыта внутри другого приложения. Откройте её в <b>Chrome</b>: скопируйте ссылку и вставьте в Chrome.${copyBtn}</div>`:'')+`<ol class="ist"><li><span>Нажмите меню браузера <b>⋮</b> (три точки) — вверху справа.</span></li><li><span>Выберите <b>«Установить приложение»</b> (или «Добавить на главный экран»).</span></li><li><span>Подтвердите — иконка появится на главном экране.</span></li></ol><div class="small">Если такого пункта нет, откройте страницу в Chrome.</div>`;
return `<ol class="ist"><li><span>В Chrome или Edge нажмите значок установки ${AD} в правой части адресной строки.</span></li><li><span>Или откройте меню <b>⋮</b> → «Установить приложение».</span></li></ol>`};
const openInst=()=>{$('#dih').textContent=iOS?'Добавить на экран «Домой»':'Установить приложение';$('#dib').innerHTML=stepsHTML();if(!$('#di').open)$('#di').showModal()};
const copyLink=async()=>{const u=location.href.split('#')[0];try{await navigator.clipboard.writeText(u);toast('✓ Ссылка скопирована')}catch(e){const t=document.createElement('textarea');t.value=u;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();try{document.execCommand('copy');toast('✓ Ссылка скопирована')}catch(_){toast(u)}t.remove()}};
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;window.__dp=e;show()});
addEventListener('appinstalled',()=>{dp=null;b.hidden=true;LS.set('vip-inst-x',Date.now()+3650*864e5);toast('✓ Приложение установлено')});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-i]');if(!t)return;const a=t.dataset.i;snd.tap();
if(a==='x'){LS.set('vip-inst-x',Date.now());b.hidden=true}
else if(a==='copy')copyLink();
else if(a==='go'){if(standalone()){toast('Приложение уже установлено ✓');return}if(dp){const d=dp;dp=null;window.__dp=null;try{d.prompt();Promise.resolve(d.userChoice).then(r=>{if(r&&r.outcome==='accepted')b.hidden=true;else show()}).catch(()=>show())}catch(err){openInst()}}else openInst()}});
show()}}

})();


if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){const had=!!navigator.serviceWorker.controller;addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!window.__rl){window.__rl=1;location.reload()}})}


