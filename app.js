(()=>{'use strict';
const CFG=Object.assign({dbUrl:'',projectId:'',apiKey:'',adminEmail:'admin@vip.local'},window.CONFIG||{});
const DEMO=!(CFG.dbUrl||CFG.projectId)||!CFG.apiKey;let DB=String(CFG.dbUrl||'').replace(/\/+$/,'');
const VER='6.0';
const $=s=>document.querySelector(s),esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
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

const PAL=['#e11d48','#2563eb','#16a34a','#d97706','#7c3aed','#0891b2','#db2777','#65a30d','#ea580c','#4f46e5','#0d9488','#a21caf'];
const iso=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const dAdd=(n,b)=>{const d=b?new Date(b+'T12:00'):new Date();d.setDate(d.getDate()+n);return iso(d)};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const hs=s=>{let h=5381;for(const c of s)h=((h<<5)+h+c.codePointAt(0))>>>0;return 't'+h.toString(36)};
const nt=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const blank=cook=>({cook:cook||null,date:dAdd(1),note:'',items:{},editId:null});
const L=Object.assign({draft:blank(),me:null,lu:{},out:[],mt:[],pg:'main'},LS.get('vip3-local',{}));
if(!L.draft||!L.draft.items)L.draft=blank();if(!L.out)L.out=[];if(!L.mt)L.mt=[];if(!L.lu)L.lu={};
const DEV=LS.get('vip3-dev','')||(()=>{const v=uid();LS.set('vip3-dev',v);return v})();
let DATA=LS.get('vip3-cache',{}),PC=null,cat='all',qs='',edit=0,pd=dAdd(1),tab='order',want='',sm=iso(new Date()).slice(0,7),sf=L.sf||(L.me?L.me.id:'all'),se=0;
const saveL=()=>LS.set('vip3-local',L);
const base=[];BASE.forEach(([id])=>CAT[id].split(';').forEach(e=>{const[n,u]=e.split('|');base.push({id:'b:'+id+':'+n,n,c:id,u})}));
const ek=s=>String(s).replace(/[.#$\[\]\/]/g,'_');
let ac,cp;
const tone=(seq,type='square')=>{try{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();cp=ac.createDynamicsCompressor();const g=ac.createGain();g.gain.value=1.8;cp.connect(g);g.connect(ac.destination)}if(ac.state==='suspended')ac.resume();let t=ac.currentTime;for(const[f,d]of seq){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(cp);o.start(t);o.stop(t+d);t+=d*.9}}catch{}};
const snd={tap:()=>tone([[900,.07]]),add:()=>tone([[660,.09],[1000,.12]]),ok:()=>tone([[660,.13],[880,.13],[1320,.3]]),warn:()=>tone([[320,.18],[220,.32]],'sawtooth'),ask:()=>tone([[740,.14],[740,.14],[988,.2]],'triangle')};
const vib=n=>navigator.vibrate&&navigator.vibrate(n);
let tt;const toast=m=>{const e=$('#tg');e.textContent=m;e.className='tg on';clearTimeout(tt);tt=setTimeout(()=>e.className='tg',2400)};

const fq=q=>{const v=parseFloat(String(q).replace(',','.'));return isFinite(v)&&v>0?Math.round(v*100)/100:0};
const fmtQ=q=>String(q).replace('.',',');
const day=s=>{const a=s.split('-').map(Number);return new Date(a[0],a[1]-1,a[2],12).toLocaleDateString('ru',{weekday:'short',day:'2-digit',month:'2-digit'})};
const tm=ts=>new Date(ts).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'});
// ================= сеть =================
function tf(url,o,ms){return new Promise((res,rej)=>{let done=0;const ac=window.AbortController?new AbortController():null;
const t=setTimeout(()=>{if(!done){done=1;if(ac)ac.abort();rej(new Error('timeout'))}},ms||9000);
fetch(url,Object.assign({},o||{},ac?{signal:ac.signal}:{})).then(r=>{if(!done){done=1;clearTimeout(t);res(r)}},e=>{if(!done){done=1;clearTimeout(t);rej(e)}})})}
function put(path,val,merge){const k=path.split('/').filter(Boolean);
if(!k.length){DATA=val||{};return}
let o=DATA;for(let i=0;i<k.length-1;i++){if(!o[k[i]]||typeof o[k[i]]!=='object')o[k[i]]={};o=o[k[i]]}
const l=k[k.length-1];
if(merge){const t=o[l]&&typeof o[l]==='object'?o[l]:(o[l]={});Object.keys(val||{}).forEach(a=>{val[a]===null?delete t[a]:t[a]=val[a]})}
else if(val===null||val===undefined)delete o[l];else o[l]=val}
const D={};let raf=0,ct;
const dirty=k=>{D[k]=1;if(k==='catalog')PC=null;if(!raf)raf=requestAnimationFrame(render)};
const ST={err:'',lastErr:''},POLL={ok:null,t:0,err:'',n:0};
const setSt=()=>{const s=$('#saved');if(DEMO){s.textContent='● демо-режим';s.className='';return}
const n=L.out.length+L.mt.length;
s.textContent=!DB?'… подключение':n?'↻ отправка ('+n+')':ST.err?'⚠ ошибка':POLL.ok===null?'… подключение':POLL.ok?'● онлайн':'○ нет связи';
s.className=(POLL.ok&&!n&&!ST.err)?'on':''};
let AU={t:'',rt:LS.get('vip3-rt',''),exp:0,ok:false};
const isAdmin=()=>AU.ok,ed=()=>edit&&AU.ok;
async function tok(){if(!AU.rt)return'';if(AU.t&&Date.now()<AU.exp-6e4)return AU.t;
const r=await tf('https://securetoken.googleapis.com/v1/token?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(AU.rt)},9000);
const j=await r.json();if(!r.ok){if(r.status===400){AU={t:'',rt:'',exp:0,ok:false};LS.set('vip3-rt','')}throw new Error('auth')}
AU={t:j.id_token,rt:j.refresh_token,exp:Date.now()+j.expires_in*1000,ok:true};LS.set('vip3-rt',AU.rt);return AU.t}
async function detect(){if(DEMO||DB)return;const p=CFG.projectId;const list=[LS.get('vip3-db',''),`https://${p}-default-rtdb.firebaseio.com`,`https://${p}-default-rtdb.europe-west1.firebasedatabase.app`,`https://${p}-default-rtdb.asia-southeast1.firebasedatabase.app`].filter(Boolean);
for(const u of list){try{const r=await tf(u+'/.json?shallow=true',{},6000);if(r.ok||r.status===401||r.status===403){DB=u;LS.set('vip3-db',u);return}}catch(e){}}}
async function api(m,p,b){if(!DB)throw new Error('nodb');const t=await tok().catch(()=>'');const r=await tf(`${DB}/${p}.json${t?'?auth='+t:''}`,{method:m,headers:b!==undefined?{'Content-Type':'application/json'}:undefined,body:b!==undefined?JSON.stringify(b):undefined},10000);if(!r.ok){const e=new Error('http');e.status=r.status;throw e}return r}
async function jget(p,q){const r=await tf(`${DB}/${p}.json${q?'?'+q:''}`,{},9000);if(!r.ok){const e=new Error('http');e.status=r.status;throw e}return r.json()}
const DROP=[400,401,403,404];
function drop(e,what){ST.err=ST.lastErr=`HTTP ${e.status} · ${what}`;snd.warn();toast(e.status===401||e.status===403?'Нет прав. Обновите правила Firebase или войдите как руководитель':'Не сохранено (код '+e.status+')')}
let fl=0;
async function flush(){if(fl||DEMO||!DB)return;fl=1;
try{for(;;){
if(L.out.length){const o=L.out[0];try{await api(o.m,o.p,o.b);ST.err=''}catch(e){if(DROP.indexOf(e.status)>=0)drop(e,o.m+' '+o.p);else throw e}L.out.shift();saveL();setSt();continue}
if(L.mt.length){const s=L.mt[0];try{await api('PUT','meta/'+s,Date.now())}catch(e){if(DROP.indexOf(e.status)>=0)drop(e,'meta/'+s);else throw e}L.mt.shift();saveL();continue}
break}}catch(e){}
fl=0;setSt()}
function mut(m,p,v){put('/'+p,m==='DELETE'?null:v,m==='PATCH');const sec=p.split('/')[0];dirty(sec);if(DEMO){LS.set('vip3-cache',DATA);return}
L.out.push({m,p,b:v});if(L.mt.indexOf(sec)<0)L.mt.push(sec);saveL();setSt();flush()}
const pendSecs=()=>{const s=new Set();L.out.forEach(o=>s.add(o.p.split('/')[0]));L.mt.forEach(x=>s.add(x));return s};
// ---- опрос облака: лёгкий запрос meta каждые 3 с, данные — только если изменились ----
let MV={},LD='',tick=0,pb=0;
async function poll(force){if(pb||DEMO||!DB)return;pb=1;
try{const m=(await jget('meta'))||{},pend=pendSecs(),jobs=[];
const job=(s,path,q,fn)=>jobs.push(jget(path,q).then(d=>{if(pendSecs().has(s))return;if(fn&&!fn())return;put('/'+path,d);MV[s]=m[s]===undefined?0:m[s];dirty(s)}));
['team','catalog','sched','lib'].forEach(s=>{if(!pend.has(s)&&(force||MV[s]===undefined||m[s]!==MV[s]))job(s,s)});
if(!pend.has('orders')&&(MV.orders===undefined||m.orders!==MV.orders||tick%100===0))job('orders','orders','orderBy=%22created%22&limitToLast=80');
if(!pend.has('prep')&&(force||MV.prep===undefined||m.prep!==MV.prep||LD!==pd)){const dy=pd;job('prep','prep/'+dy,'',()=>{LD=dy;return dy===pd})}
await Promise.all(jobs);POLL.ok=true;POLL.err='';POLL.t=Date.now();POLL.n++}
catch(e){POLL.ok=false;POLL.err=e.status?('HTTP '+e.status):(e.message||'нет сети')}
pb=0;setSt();if(POLL.ok){ensureChef();if(!L.imp)libImport()}}
async function loop(){tick++;if(!document.hidden){if(navigator.onLine===false){POLL.ok=false;POLL.err='нет сети';setSt()}else await poll(tick%20===0)}
setTimeout(loop,document.hidden?8000:POLL.ok===false?6000:3000)}
// ---- справочник: однократный импорт всего, что готовили раньше ----
const libKey=(t,g)=>hs(nt(t)+'|'+(g||'main'));
async function libImport(){if(L.imp)return;L.imp=2;
try{const res=await Promise.all([jget('prep'),jget('plan').catch(()=>null)]),pr=res[0],pl=res[1];const have=(DATA.lib||{}).items||{},add={};
const take=(t,q,g,l)=>{if(typeof t!=='string'||!t.trim())return;g=g==='banq'?'banq':'main';const k=libKey(t,g);if(!have[k]&&!add[k])add[k]={t:t.trim(),q:q||'',g,l:l||''}};
Object.keys(pr||{}).forEach(d=>{if(d==='_ping')return;Object.values(pr[d]||{}).forEach(x=>{if(x)take(x.t,x.q,x.g,d[0]==='_'?'':d)})});
Object.values((pl&&pl.items)||{}).forEach(x=>{if(x)take(x.t,x.q,x.g)});
if(Object.keys(add).length)mut('PATCH','lib/items',add);L.imp=1;saveL()}catch(e){L.imp=0}}
// ================= данные =================
const cat0=()=>DATA.catalog||{};
const prods=()=>PC||(PC=[...base.filter(p=>!(cat0().hidden||{})[ek(p.id)]).map(p=>{const e=(cat0().edits||{})[ek(p.id)];return e?{...p,n:e.n||p.n,u:e.u||p.u}:p}),...Object.entries(cat0().custom||{}).map(([k,v])=>({id:'c:'+k,k,n:v.n,c:v.c,u:v.u}))].sort((a,b)=>a.n.localeCompare(b.n,'ru')));
const cats=()=>[...BASE.map(([id,n,e])=>({id,n,e})),...Object.entries(cat0().groups||{}).map(([k,v])=>({id:k,n:v.n,e:'📦',g:1}))];
const isChef=n=>nt(n)==='хоссам';
const team=()=>Object.entries(DATA.team||{}).filter(e=>e[1]&&e[1].n).map(([id,v])=>({id,n:v.n,r:v.r,c:v.c})).sort((a,b)=>(isChef(b.n)?1:0)-(isChef(a.n)?1:0)||a.n.localeCompare(b.n,'ru'));
const col=k=>k.c||PAL[parseInt(hs(String(k.id)).slice(1),36)%PAL.length];
let chefOk=0;
const ensureChef=()=>{if(chefOk||!isAdmin()||(!DEMO&&MV.team===undefined))return;chefOk=1;if(!team().some(k=>isChef(k.n)))mut('PUT','team/'+uid(),{n:'Хоссам',r:'Шеф-повар',c:PAL[0]})};
const norm=o=>({...o,items:Array.isArray(o.items)?o.items:Object.values(o.items||{}),note:o.note||''});
const ords=()=>Object.values(DATA.orders||{}).filter(o=>o&&o.id&&o.cook).map(norm).sort((a,b)=>b.created-a.created);
const dI=()=>Object.values(L.draft.items),cnt=()=>dI().length;
const syncDraft=()=>{const m=new Map(prods().map(p=>[p.id,p]));dI().forEach(it=>{const p=m.get(it.id);if(p)it.n=p.n});saveL()};
const dm=()=>(DATA.prep||{})[pd]||{},dayTasks=()=>Object.values(dm());
const pgroups=()=>[{id:'main',n:'Основные'},{id:'banq',n:'Банкет'}].concat(Object.entries((DATA.lib||{}).groups||{}).map(([id,v])=>({id,n:v.n})));
const gname=g=>(pgroups().find(x=>x.id===g)||{n:'Другое'}).n;
const libItems=()=>Object.entries((DATA.lib||{}).items||{}).map(([id,v])=>({id,...v})).filter(x=>x.t);
function libAdd(t,q,g){g=g||'main';const k=libKey(t,g),it=((DATA.lib||{}).items||{})[k];if(it){mut('PATCH','lib/items/'+k,{l:dAdd(0)});return}mut('PUT','lib/items/'+k,{t,q:q||'',g,l:dAdd(0)})}
// ================= интерфейс =================
const unitSel=(id,u)=>{const us=UNITS.indexOf(u)>=0?UNITS:UNITS.concat([u]);return `<select class="us" data-un="${esc(id)}" aria-label="Единица">${us.map(x=>`<option${x===u?' selected':''}>${esc(x)}</option>`).join('')}</select>`};
const stepper=it=>`<div class="st"><button data-a="dec" data-id="${esc(it.id)}">−</button><input inputmode="decimal" data-q="${esc(it.id)}" value="${fmtQ(it.qty)}" aria-label="Количество">${unitSel(it.id,it.u)}<button data-a="inc" data-id="${esc(it.id)}">+</button></div>`;
const row=p=>{const it=L.draft.items[p.id],i=esc(p.id);return `<div class="it${it?' on':''}" data-r="${i}"><div class="n">${esc(p.n)}</div>${it?stepper(it):`<button data-a="add" data-id="${i}" aria-label="Добавить">＋ ${esc(L.lu[p.id]||p.u)}</button>`}${ed()?`<button class="x" data-a="editp" data-id="${i}" aria-label="Изменить">✎</button><button class="x" data-a="delp" data-id="${i}" aria-label="Удалить товар">✕</button>`:''}</div>`};
const chipsFor=(act,sel)=>team().map(k=>`<button class="chip${sel&&sel.id===k.id?' on':''}" data-a="${act}" data-id="${k.id}"><i class="dt" style="background:${col(k)}"></i>${esc(k.n)}<small>${esc(k.r)}</small></button>`).join('')||'<span style="color:var(--mu)">Повара не добавлены — обратитесь к руководителю</span>';
const rCooks=()=>{$('#cooks').innerHTML=chipsFor('pick',L.draft.cook)};
const rPCooks=()=>{$('#pcooks').innerHTML=chipsFor('me',L.me)};
const rCats=()=>{const cs=cats(),n=s=>cs.find(c=>c.id===s);$('#cats').innerHTML=`<button class="chip${cat==='all'?' on':''}" data-a="cat" data-id="all">Все</button>`+cs.map(c=>`<button class="chip${cat===c.id?' on':''}" data-a="cat" data-id="${c.id}">${c.e} ${esc(c.n.split(' и ')[0].split(',')[0])}</button>`).join('')+`<button class="chip" data-a="newg">＋ Группа</button>`+(ed()&&n(cat)&&n(cat).g?`<button class="chip" style="color:var(--rd)" data-a="delg">🗑 Удалить группу</button>`:'')};
const rList=()=>{const q=qs.trim().toLowerCase(),cs=cats();let h='';const ps=prods().filter(p=>(cat==='all'||p.c===cat)&&(!q||p.n.toLowerCase().indexOf(q)>=0));
for(const c of cs){const g=ps.filter(p=>p.c===c.id);if(g.length)h+=(cat==='all'||q?`<div class="gh">${c.e} ${esc(c.n)}</div>`:'')+g.map(row).join('')}
$('#list').innerHTML=h||`<div class="em">Ничего не найдено.<br>Нажмите «＋ Товар», чтобы добавить.</div>`};
const rBar=()=>{$('#cnt').textContent=cnt()?cnt()+' поз.':'пусто';$('#date').value=L.draft.date;$('#note').value=L.draft.note};
const rRev=()=>{const it=dI(),c=L.draft.cook;$('#rc').innerHTML=c?esc(c.n)+' — '+esc(c.r):'<span style="color:var(--rd)">не выбран</span>';
$('#rb').innerHTML=it.length?it.sort((a,b)=>a.n.localeCompare(b.n,'ru')).map(i=>`<div class="it on"><div class="n">${esc(i.n)}</div>${stepper(i)}<button class="x" data-a="rm" data-id="${esc(i.id)}">✕</button></div>`).join(''):'<div class="em">Список пуст</div>'};
const rTeam=()=>{const k=team();$('#tl').innerHTML=k.length?k.map(c=>`<div class="it"><button class="dotb" data-a="ccol" data-id="${c.id}" style="background:${col(c)}" aria-label="Цвет"></button><div class="n">${esc(c.n)}<i>${esc(c.r)}</i></div><button class="x" data-a="delc" data-id="${c.id}">✕</button></div>`).join(''):'<div class="em">Добавьте поваров с должностями</div>'};
const rAdm=()=>{const b=$('#edb');b.textContent='Режим правки товаров: '+(ed()?'ВКЛ':'выкл');b.className=ed()?'d':'';const h=Object.keys(cat0().hidden||{}).length,u=$('#unh');u.textContent='Вернуть скрытые ('+h+')';u.disabled=!h};
const rPrep=()=>{const ts=Object.entries(dm()).map(([id,v])=>({id,...v}));
const dn=ts.filter(t=>t.done).sort((a,b)=>(b.at||0)-(a.at||0)),gi=g=>Math.max(0,pgroups().findIndex(x=>x.id===(g||'main'))),td=ts.filter(t=>!t.done).sort((a,b)=>gi(a.g)-gi(b.g)||(a.c||0)-(b.c||0)),k=team();
const sel=t=>`<select class="who" data-by="${t.id}"><option value="">Кто?</option>${k.map(c=>`<option value="${c.id}"${t.by&&t.by.id===c.id?' selected':''}>${esc(c.n)}</option>`).join('')}${t.by&&!k.some(c=>c.id===t.by.id)?`<option value="${esc(t.by.id)}" selected>${esc(t.by.n)}</option>`:''}</select>`;
const r=t=>`<div class="pr${t.done?' ok':''}"><button class="ck" data-a="ptog" data-id="${t.id}" aria-label="Отметить">${t.done?'✓':''}</button><div class="pn" data-a="pedit" data-id="${t.id}"><b>${esc(t.t)}</b>${t.g&&t.g!=='main'?`<em>${esc(gname(t.g))}</em>`:''}${t.q?`<i>${esc(t.q)}</i>`:''}${t.done&&t.by?`<small>✓ ${esc(t.by.n)} · ${tm(t.at)}</small>`:''}</div>${sel(t)}<button class="x" data-a="pdel" data-id="${t.id}" aria-label="Удалить">✕</button></div>`;
$('#plist').innerHTML=ts.length?(dn.length?`<div class="gh">Выполнено · ${dn.length}</div>`+dn.map(r).join(''):'')+(td.length?`<div class="gh">Осталось · ${td.length}</div>`+td.map(r).join(''):''):'<div class="em">На этот день заготовок нет.<br>Добавьте выше или выберите из справочника ниже.</div>';
$('#pfill').style.width=ts.length?Math.round(dn.length/ts.length*100)+'%':'0%';$('#pinfo').textContent=`${day(pd)} · выполнено ${dn.length} из ${ts.length}`;
$('#pdate').value=pd;$('#pd0').className='chip'+(pd===dAdd(0)?' on':'');$('#pd1').className='chip'+(pd===dAdd(1)?' on':'');$('#pcp').hidden=ts.length>0;
const gs=pgroups(),sg=L.pg||'main';$('#pg').innerHTML=gs.map(g=>`<option value="${g.id}"${g.id===sg?' selected':''}>${esc(g.n)}</option>`).join('');rLib()};
const rLib=()=>{const q=nt($('#lq').value),have=new Set(dayTasks().map(t=>nt(t.t)+'|'+(t.g||'main'))),all=libItems();
const li=all.filter(x=>!q||nt(x.t).indexOf(q)>=0).sort((a,b)=>(b.l||'').localeCompare(a.l||'')||a.t.localeCompare(b.t,'ru'));
$('#plsum').textContent='📚 Справочник заготовок · '+all.length;
$('#plib').innerHTML=li.length?li.slice(0,120).map(x=>{const h=have.has(nt(x.t)+'|'+(x.g||'main'));return `<div class="it${h?' on':''}"><div class="n">${esc(x.t)}${x.g&&x.g!=='main'?`<em>${esc(gname(x.g))}</em>`:''}${x.q?`<i>${esc(x.q)}</i>`:''}</div><button data-a="lpick" data-id="${x.id}"${h?' disabled':''} aria-label="Добавить на день">${h?'✓':'＋'}</button><button class="x" data-a="ldel" data-id="${x.id}" aria-label="Удалить из справочника">✕</button></div>`}).join(''):'<div class="em">Справочник пуст. Всё, что вы добавляете в заготовки, сохраняется сюда автоматически.</div>'};
const WD=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const rSched=()=>{const k=team(),S=DATA.sched||{},ed2=se&&isAdmin();if(sf!=='all'&&!k.some(c=>c.id===sf))sf='all';
$('#sfilter').innerHTML=`<button class="chip${sf==='all'?' on':''}" data-a="sfil" data-id="all">Все</button>`+k.map(c=>`<button class="chip${sf===c.id?' on':''}" data-a="sfil" data-id="${c.id}"><i class="dt" style="background:${col(c)}"></i>${esc(c.n)}</button>`).join('');
const a=sm.split('-').map(Number),y=a[0],m=a[1],dim=new Date(y,m,0).getDate(),today=dAdd(0);
$('#smt').textContent=new Date(y,m-1,1,12).toLocaleDateString('ru',{month:'long',year:'numeric'});
const rows=sf==='all'?k:k.filter(c=>c.id===sf),on=(c,dt)=>!!(S[c.id]&&S[c.id][dt]);
let h='<tr><th class="nm">Повар</th>';
for(let d=1;d<=dim;d++){const dt=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,w=(new Date(y,m-1,d,12).getDay()+6)%7;h+=`<th class="${w>4?'we':''}${dt===today?' td':''}">${d}<small>${WD[w]}</small></th>`}
h+='<th class="sm">Σ</th></tr>';
rows.forEach(c=>{const cl=col(c);let n=0;h+=`<tr><th class="nm"><i style="background:${cl}"></i>${esc(c.n)}</th>`;
for(let d=1;d<=dim;d++){const dt=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,w=(new Date(y,m-1,d,12).getDay()+6)%7,o=on(c,dt);if(o)n++;h+=`<td class="${w>4?'we':''}${dt===today?' td':''}${o?' on':''}"${o?` style="background:${cl}"`:''}${ed2?` data-a="scell" data-id="${c.id}|${dt}"`:''}>${o?'Р':''}</td>`}
h+=`<td class="sm">${n||''}</td></tr>`});
$('#rt').innerHTML=rows.length?h:'<tr><td class="em">Повара не добавлены</td></tr>';
const nb=c=>`<span class="nb" style="background:${col(c)}">${esc(c.n)}</span>`,who=dt=>k.filter(c=>on(c,dt)).map(nb).join('')||'<span class="small">никого</span>';
let l='';
if(sf==='all'){const t2=dAdd(1);l=`<div class="sh"><b>Сегодня · ${day(today)}</b><div>${who(today)}</div></div><div class="sh"><b>Завтра · ${day(t2)}</b><div>${who(t2)}</div></div>`}
else{const c=k.find(x=>x.id===sf);let n=0;for(let i=0;i<60&&n<14&&c;i++){const dt=dAdd(i);if(on(c,dt)){n++;l+=`<div class="sh"><b>${day(dt)}${i===0?' · сегодня':i===1?' · завтра':''}</b>${nb(c)} <span class="small">рабочий день</span></div>`}}if(!l)l='<div class="em">Ближайших рабочих дней нет.</div>';else l='<div class="lbl" style="margin:4px 2px 6px">Ближайшие рабочие дни</div>'+l}
$('#sinfo').innerHTML=l;$('#sbtn').textContent=ed2?'✓ Готово':'✎ Править график';$('#shint').hidden=!ed2};
const rDiag=()=>{$('#dinfo').textContent=[`Версия: ${VER}`,`Режим: ${DEMO?'ДЕМО (config.js не заполнен)':'облако'}`,`База: ${DB||'не найдена'}`,`Связь: ${POLL.ok===null?'проверка…':POLL.ok?'есть ('+Math.round((Date.now()-POLL.t)/1000)+' с назад)':'нет — '+POLL.err}`,`В очереди на отправку: ${L.out.length}`,`Последняя ошибка: ${ST.lastErr||'нет'}`,`Телефон в сети: ${navigator.onLine===false?'нет':'да'}`,`Повара: ${team().length} · заказы: ${ords().length} · заготовок на день: ${Object.keys(dm()).length} · справочник: ${libItems().length}`,`Устройство: ${DEV}`].join('\n');$('#dlog').textContent=''};
const rHist=()=>{const q=$('#hq').value.trim().toLowerCase();const l=ords().filter(o=>!q||(o.cook.n+' '+o.date+' '+day(o.date)+' '+o.items.map(i=>i.n).join(' ')).toLowerCase().indexOf(q)>=0);
$('#hl').innerHTML=l.length?l.map(o=>`<div class="hc"><b>${esc(day(o.date))} · ${esc(o.cook.n)}</b><small>${esc(o.cook.r)} · ${o.items.length} поз. · ${new Date(o.created).toLocaleDateString('ru')} ${tm(o.created)}${o.copied?' · ✓ скопирован':' · не скопирован'}</small><div style="font-size:13px;margin-top:4px">${esc(o.items.slice(0,5).map(i=>i.n).join(', '))}${o.items.length>5?'…':''}</div><div class="acts"><button data-a="open" data-id="${o.id}">Открыть и править</button><button data-a="hcopy" data-id="${o.id}">Копировать</button><button class="d" data-a="hdel" data-id="${o.id}">Удалить</button></div></div>`).join(''):'<div class="em">История пока пуста</div>'};
function render(){raf=0;const d=Object.assign({},D);for(const k in D)delete D[k];
if(d.team){rCooks();rPCooks();if(tab==='prep')rPrep();if(tab==='sched')rSched();if($('#dt').open)rTeam()}
if(d.catalog){syncDraft();rCats();rList();rBar();if($('#dt').open)rAdm()}
if(d.orders&&$('#dh').open)rHist();
if((d.prep||d.lib)&&tab==='prep')rPrep();
if(d.sched&&tab==='sched')rSched();
clearTimeout(ct);ct=setTimeout(()=>LS.set('vip3-cache',DATA),2500)}
// ================= заказ =================
const msg=o=>{const R=[`🧾 Заказ на ${day(o.date)}`,`👨‍🍳 ${o.cook.n}, ${o.cook.r}`,`🕒 оформлен в ${tm(o.created)}`,''];
const cs=[...BASE,...Object.entries(cat0().groups||{}).map(([k,v])=>[k,v.n,'📦'])],seen=new Set(),ln=i=>`• ${i.n} — ${fmtQ(i.qty)} ${i.u}`;
for(const[id,n,e]of cs){const g=o.items.filter(i=>i.c===id);if(!g.length)continue;g.forEach(i=>seen.add(i.id));R.push(`${e} ${n}`,g.sort((a,b)=>a.n.localeCompare(b.n,'ru')).map(ln).join('\n'),'')}
const r=o.items.filter(i=>!seen.has(i.id));if(r.length)R.push('📦 Другое',r.map(ln).join('\n'),'');
if(o.note)R.push('💬 '+o.note,'');R.push(`Всего: ${o.items.length} поз.`);return R.join('\n')};
const snap=()=>{const d=L.draft,old=d.editId&&ords().find(o=>o.id===d.editId);return{id:d.editId||'o'+uid(),created:old?old.created:Date.now(),updated:Date.now(),date:d.date,cook:d.cook,note:d.note.trim(),items:dI().map(i=>({...i})),copied:old?!!old.copied:false}};
const valid=()=>{if(!cnt()){snd.warn();vib(80);toast('Добавьте хотя бы один товар');return 0}if(!L.draft.cook){snd.warn();vib(80);toast('Выберите повара');$('#dr').close();$('#cooks').classList.add('bad');setTimeout(()=>$('#cooks').classList.remove('bad'),1500);window.scrollTo({top:0,behavior:'smooth'});return 0}return 1};
const upsert=o=>mut('PUT','orders/'+o.id,o);
const ask=(t,h,y,n)=>new Promise(res=>{const d=$('#dc');$('#ct').textContent=t;$('#cb').innerHTML=h;$('#cy').textContent=y||'Да';$('#cn').textContent=n||'Нет, вернуться';snd.ask();vib(40);const f=v=>()=>{d.close();res(v)};$('#cy').onclick=f(true);$('#cn').onclick=f(false);d.oncancel=()=>res(false);d.showModal()});
const clip=async t=>{try{await navigator.clipboard.writeText(t);return 1}catch(e){try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.append(a);a.select();const ok=document.execCommand('copy');a.remove();return ok}catch(e2){return 0}}};
const copyOrder=async()=>{if(!valid())return;const o=snap();const yes=await ask('Вы уверены?',`<p style="margin:0 0 10px;color:var(--mu)">Проверьте сообщение. Если что-то не так — вернитесь и исправьте.</p><pre class="msg">${esc(msg(o))}</pre>`,'Да, копировать','Нет, вернуться');if(!yes)return;
if(!await clip(msg(o))){snd.warn();toast('Не удалось скопировать. Разрешите доступ к буферу');return}
o.copied=true;upsert(o);L.draft=blank(L.draft.cook);saveL();$('#dr').close();rBar();rList();rCooks();snd.ok();vib([60,40,60]);toast('✓ Скопировано и сохранено в истории')};
const saveOrder=()=>{if(!valid())return;const o=snap();upsert(o);L.draft.editId=o.id;saveL();snd.ok();toast('✓ Сохранено для всех. Можно редактировать')};
const need=()=>{snd.warn();toast('Нужен вход руководителя');ACT.admin()};
const rep=id=>{const p=prods().find(x=>x.id===id),r=document.querySelector(`[data-r="${CSS.escape(id)}"]`);if(p&&r)r.outerHTML=row(p);rBar();if($('#dr').open)rRev()};
const ui=()=>{rCats();rList();rAdm();if(tab==='sched')rSched()};
const login=()=>{$('#ap').value='';$('#da').showModal();$('#ap').focus()};
const afterLogin=()=>{ui();ensureChef();if(want){const w=want;want='';if(w==='sedit'){ACT.tab('sched');se=1;rSched()}else ACT.tab(w)}else{rTeam();rAdm();$('#dt').showModal()}};
const authErr=m=>/TOO_MANY/.test(m)?'Google временно ограничил вход. Подождите и повторите':/CREDENTIAL_TOO_OLD/.test(m)?'Войдите заново и повторите':'Неверный пароль';
const openDlg=(id,focus)=>{$(id).showModal();if(focus)$(focus).focus()};
const ACT={
async login(){const pw=$('#ap').value;if(DEMO){AU.ok=true;$('#da').close();afterLogin();toast('Демо-режим: облако не настроено');return}
try{const r=await tf('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:CFG.adminEmail,password:pw,returnSecureToken:true})},12000);const j=await r.json();
if(!r.ok){snd.warn();vib(120);toast(authErr(j.error&&j.error.message||''));return}
AU={t:j.idToken,rt:j.refreshToken,exp:Date.now()+j.expiresIn*1000,ok:true};LS.set('vip3-rt',AU.rt);$('#da').close();snd.ok();afterLogin()}catch(e){snd.warn();toast('Нет интернета')}},
async setpw(){const v=$('#npw').value;if(v.length<6){snd.warn();toast('Пароль — минимум 6 символов');return}if(DEMO){toast('В демо-режиме пароля нет');return}
try{const t=await tok();const r=await tf('https://identitytoolkit.googleapis.com/v1/accounts:update?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:t,password:v,returnSecureToken:true})},12000);const j=await r.json();
if(!r.ok){snd.warn();toast(authErr(j.error&&j.error.message||''));return}
AU={t:j.idToken,rt:j.refreshToken,exp:Date.now()+j.expiresIn*1000,ok:true};LS.set('vip3-rt',AU.rt);$('#npw').value='';snd.ok();toast('✓ Пароль изменён')}catch(e){snd.warn();toast('Не удалось. Проверьте сеть')}},
logout(){AU={t:'',rt:'',exp:0,ok:false};LS.set('vip3-rt','');edit=0;se=0;$('#dt').close();ui();snd.tap()},
admin(){snd.tap();$('#dh').close();want='';if(isAdmin()){rTeam();rAdm();$('#dt').showModal()}else login()},
toggled(){edit=!edit;ui();snd.tap()},
unhide(){if(!isAdmin())return need();mut('DELETE','catalog/hidden');snd.ok()},
tab(id){tab=id;snd.tap();$('#vOrder').hidden=id!=='order';$('#vPrep').hidden=id!=='prep';$('#vSched').hidden=id!=='sched';$('#bar').hidden=id!=='order';document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.id===id));if(id==='prep'){poll();rPrep()}if(id==='sched'){poll();rSched()}},
add(id){const p=prods().find(x=>x.id===id);if(!p)return;L.draft.items[id]={id,n:p.n,c:p.c,u:L.lu[id]||p.u,qty:1};saveL();snd.add();vib(20);rep(id)},
inc(id){const i=L.draft.items[id];if(i){i.qty=Math.round((i.qty+1)*100)/100;saveL();snd.tap();rep(id)}},
dec(id){const i=L.draft.items[id];if(!i)return;i.qty=Math.round((i.qty-1)*100)/100;if(i.qty<=0){delete L.draft.items[id];snd.warn()}else snd.tap();saveL();rep(id)},
rm(id){delete L.draft.items[id];saveL();snd.warn();rep(id)},
pick(id){const k=team().find(x=>x.id===id);L.draft.cook=k;L.me=k;saveL();snd.add();rCooks();rPCooks()},
me(id){L.me=team().find(x=>x.id===id);saveL();snd.add();rPCooks()},
cat(id){cat=id;snd.tap();rCats();rList()},
review(){snd.tap();rRev();$('#dr').showModal()},close(){snd.tap();document.querySelectorAll('dialog[open]').forEach(d=>d.close())},
copy:copyOrder,save:saveOrder,
async clear(){if(!cnt())return;if(await ask('Очистить список?','<p>Все выбранные товары будут убраны из текущего заказа.</p>','Да, очистить','Нет, оставить')){L.draft=blank(L.draft.cook);saveL();rBar();rList();rRev();snd.warn()}},
hist(){snd.tap();rHist();$('#dh').showModal()},
addcook(){if(!isAdmin())return need();const n=$('#tn').value.trim(),r=$('#tr').value.trim();if(!n||!r){snd.warn();toast('Укажите имя и должность');return}const used=team().map(col),c=PAL.find(x=>used.indexOf(x)<0)||PAL[team().length%PAL.length];mut('PUT','team/'+uid(),{n,r,c});$('#tn').value=$('#tr').value='';snd.ok();$('#tn').focus();rTeam()},
ccol(id){if(!isAdmin())return need();const k=team().find(x=>x.id===id);if(!k)return;const i=PAL.indexOf(col(k));mut('PATCH','team/'+id,{c:PAL[(i+1)%PAL.length]});snd.tap()},
async delc(id){if(!isAdmin())return need();const k=team().find(x=>x.id===id);if(!k||!await ask('Удалить сотрудника?',`<p>${esc(k.n)} — ${esc(k.r)}</p>`,'Да, удалить','Нет'))return;mut('DELETE','team/'+id);mut('DELETE','sched/'+id);if(L.draft.cook&&L.draft.cook.id===id)L.draft.cook=null;saveL();rTeam();rCooks()},
newp(){snd.tap();$('#pc').innerHTML=cats().map(c=>`<option value="${c.id}">${esc(c.n)}</option>`).join('');$('#pc').value=cat!=='all'&&cats().some(c=>c.id===cat)?cat:'sauces';$('#pu').innerHTML=UNITS.map(u=>`<option>${u}</option>`).join('');$('#pn').value='';openDlg('#dp','#pn')},
addprod(){const n=$('#pn').value.trim().replace(/\s+/g,' ');if(!n){snd.warn();toast('Введите название');return}const c=$('#pc').value,u=$('#pu').value;if(prods().some(p=>p.c===c&&p.n.toLowerCase()===n.toLowerCase())){snd.warn();toast('Такой товар уже есть в этой группе');return}
const k='p'+uid(),nm=n[0].toUpperCase()+n.slice(1);mut('PUT','catalog/custom/'+k,{n:nm,c,u});const id='c:'+k;L.draft.items[id]={id,n:nm,c,u,qty:1};saveL();$('#dp').close();cat=c;qs='';$('#q').value='';rCats();rList();rBar();snd.ok();toast('✓ Добавлен для всех в «'+cats().find(x=>x.id===c).n+'»');setTimeout(()=>{const e=document.querySelector(`[data-r="${CSS.escape(id)}"]`);if(e)e.scrollIntoView({block:'center',behavior:'smooth'})},50)},
editp(id){if(!isAdmin())return need();const p=prods().find(x=>x.id===id);if(!p)return;$('#en').value=p.n;$('#eu').innerHTML=(UNITS.indexOf(p.u)>=0?UNITS:UNITS.concat([p.u])).map(u=>`<option${u===p.u?' selected':''}>${esc(u)}</option>`).join('');$('#de').dataset.id=id;snd.tap();$('#de').showModal()},
saveprod(){if(!isAdmin())return need();const id=$('#de').dataset.id,n=$('#en').value.trim().replace(/\s+/g,' '),u=$('#eu').value;if(!n){snd.warn();toast('Введите название');return}const p=prods().find(x=>x.id===id);if(!p)return;
mut('PATCH',p.k?'catalog/custom/'+p.k:'catalog/edits/'+ek(id),{n,u});L.lu[id]=u;saveL();$('#de').close();snd.ok();toast('✓ Сохранено для всех')},
async delp(id){if(!isAdmin())return need();const p=prods().find(x=>x.id===id);if(!p||!await ask('Удалить товар?',`<p>${esc(p.n)} будет удалён из каталога у всех.</p>`,'Да, удалить','Нет'))return;if(p.k)mut('DELETE','catalog/custom/'+p.k);else mut('PUT','catalog/hidden/'+ek(id),true);delete L.draft.items[id];saveL();rCats();rList();rBar();snd.warn()},
newg(){snd.tap();$('#gn').value='';openDlg('#dg','#gn')},
addgrp(){const n=$('#gn').value.trim();if(!n){snd.warn();toast('Введите название группы');return}if(cats().some(c=>c.n.toLowerCase()===n.toLowerCase())){snd.warn();toast('Такая группа уже есть');return}const k='g'+uid();mut('PUT','catalog/groups/'+k,{n});cat=k;$('#dg').close();rCats();rList();snd.ok()},
async delg(){if(!isAdmin())return need();const g=cats().find(x=>x.id===cat&&x.g);if(!g)return;const ps=prods().filter(p=>p.c===g.id);if(!await ask('Удалить группу?',`<p>«${esc(g.n)}»${ps.length?` и товаров в ней: ${ps.length}`:''} будут удалены у всех.</p>`,'Да, удалить','Нет'))return;ps.forEach(p=>{mut('DELETE','catalog/custom/'+p.k);delete L.draft.items[p.id]});mut('DELETE','catalog/groups/'+g.id);cat='all';saveL();rCats();rList();rBar();snd.warn()},
async open(id){const o=ords().find(x=>x.id===id);if(!o)return;if(cnt()&&L.draft.editId!==id&&!await ask('Заменить текущий заказ?','<p>Несохранённый черновик будет заменён выбранным заказом из истории.</p>','Да, открыть','Нет, вернуться'))return;
L.draft={cook:o.cook,date:o.date,note:o.note||'',items:Object.fromEntries(o.items.map(i=>[i.id,{...i}])),editId:o.id};saveL();$('#dh').close();rBar();rList();rCooks();snd.ok();toast('Заказ открыт. Правьте и копируйте снова')},
async hcopy(id){const o=ords().find(x=>x.id===id);if(o&&await clip(msg(o))){mut('PATCH','orders/'+id,{copied:true});rHist();snd.ok();toast('✓ Скопировано')}else{snd.warn();toast('Не удалось скопировать')}},
async hdel(id){if(!isAdmin())return need();if(!await ask('Удалить заказ?','<p>Заказ будет удалён из истории у всех.</p>','Да, удалить','Нет'))return;mut('DELETE','orders/'+id);if(L.draft.editId===id)L.draft.editId=null;saveL();rHist();snd.warn()},
// ---- заготовки (редактируют все) ----
pday(n){pd=dAdd(+n);rPrep();poll();snd.tap()},
padd(){const t=$('#pt').value.trim().replace(/\s+/g,' '),q=$('#pq').value.trim(),g=$('#pg').value||'main';if(!t){snd.warn();toast('Напишите, что приготовить');$('#pt').focus();return}
if(dayTasks().some(x=>nt(x.t)===nt(t)&&(x.g||'main')===g)){snd.warn();toast('Эта заготовка уже есть на этот день');return}
L.pg=g;saveL();mut('PUT',`prep/${pd}/${uid()}`,{t,q,g,c:Date.now()});libAdd(t,q,g);$('#pt').value=$('#pq').value='';snd.add();$('#pt').focus()},
pedit(id){const t=dm()[id];if(!t)return;$('#pet').value=t.t;$('#peq').value=t.q||'';$('#peg').innerHTML=pgroups().map(g=>`<option value="${g.id}"${g.id===(t.g||'main')?' selected':''}>${esc(g.n)}</option>`).join('');$('#dpe').dataset.id=id;snd.tap();$('#dpe').showModal()},
psave(){const id=$('#dpe').dataset.id,t=$('#pet').value.trim().replace(/\s+/g,' '),q=$('#peq').value.trim(),g=$('#peg').value;if(!t){snd.warn();toast('Введите название');return}if(!dm()[id])return;mut('PATCH',`prep/${pd}/${id}`,{t,q,g});libAdd(t,q,g);$('#dpe').close();snd.ok()},
lpick(id){const x=libItems().find(y=>y.id===id);if(!x)return;const g=x.g||'main';if(dayTasks().some(t=>nt(t.t)===nt(x.t)&&(t.g||'main')===g))return;mut('PUT',`prep/${pd}/${uid()}`,{t:x.t,q:x.q||'',g,c:Date.now()});mut('PATCH','lib/items/'+id,{l:dAdd(0)});snd.add()},
async ldel(id){const x=libItems().find(y=>y.id===id);if(!x||!await ask('Убрать из справочника?',`<p>${esc(x.t)}</p><p style="color:var(--mu)">Из уже созданных дней она не удаляется.</p>`,'Да, убрать','Нет'))return;mut('DELETE','lib/items/'+id);snd.warn()},
gnew(){snd.tap();$('#qgn').value='';openDlg('#dq','#qgn')},
gadd(){const n=$('#qgn').value.trim();if(!n){snd.warn();toast('Введите название группы');return}if(pgroups().some(g=>nt(g.n)===nt(n))){snd.warn();toast('Такая группа уже есть');return}const k='q'+uid();mut('PUT','lib/groups/'+k,{n});L.pg=k;saveL();$('#dq').close();rPrep();snd.ok()},
ptog(id){const t=dm()[id];if(!t)return;const p=`prep/${pd}/${id}`;
if(t.done){mut('PATCH',p,{done:null,at:null});snd.tap();return}
const w=t.by||L.me;if(!w){snd.warn();vib(80);toast('Выберите повара справа или вверху «Я работаю»');const s=document.querySelector(`[data-by="${id}"]`);if(s){s.classList.add('bad');setTimeout(()=>s.classList.remove('bad'),1500)}return}
mut('PATCH',p,{done:true,by:{id:w.id,n:w.n},at:Date.now()});snd.ok();vib(30)},
async pdel(id){const t=dm()[id];if(!t||!await ask('Удалить заготовку?',`<p>${esc(t.t)}</p>`,'Да, удалить','Нет'))return;mut('DELETE',`prep/${pd}/${id}`);snd.warn()},
async pcopy(){const prev=dAdd(-1,pd);let src=(DATA.prep||{})[prev];if(!src&&!DEMO){try{src=await jget('prep/'+prev)}catch(e){toast('Нет сети');return}}
const es=Object.entries(src||{}).sort((a,b)=>(a[1].c||0)-(b[1].c||0));if(!es.length){snd.warn();toast('За вчера списка нет');return}
const m=dm();let n=0;es.forEach(([k,t],i)=>{if(m[k])return;mut('PUT',`prep/${pd}/${k}`,{t:t.t,q:t.q||'',g:t.g||'main',c:Date.now()+i});n++});snd.ok();toast('✓ Скопировано: '+n)},
// ---- график (правит только руководитель) ----
sfil(id){sf=id;L.sf=id;saveL();snd.tap();rSched()},
smon(n){const a=sm.split('-').map(Number);sm=iso(new Date(a[0],a[1]-1+(+n),1,12)).slice(0,7);snd.tap();rSched()},
sedit(){if(!isAdmin()){want='sedit';snd.tap();login();return}se=!se;snd.tap();rSched()},
scell(id){if(!(se&&isAdmin()))return;const p=id.split('|'),c=p[0],dt=p[1],S=DATA.sched||{};if(S[c]&&S[c][dt]){mut('DELETE',`sched/${c}/${dt}`);snd.tap()}else{mut('PUT',`sched/${c}/${dt}`,1);snd.add()}rSched()},
// ---- диагностика ----
diag(){snd.tap();rDiag();$('#dd').showModal()},
async dtest(){const out=[],log=s=>{out.push(s);$('#dlog').textContent=out.join('\n')};if(DEMO){log('Демо-режим: config.js не заполнен');return}
if(!DB){await detect();log('Поиск базы: '+(DB||'не найдена'));if(!DB)return}log('База: '+DB);
try{const r=await tf(DB+'/meta.json',{},8000);log('Чтение: HTTP '+r.status)}catch(e){log('Чтение: нет связи ('+(e.message||'?')+')')}
const u=`${DB}/prep/_ping/${DEV}.json`;try{const r=await tf(u,{method:'PUT',body:JSON.stringify({t:Date.now()})},8000);log('Запись: HTTP '+r.status);const g=await tf(u,{},8000);log('Проверка записи: HTTP '+g.status);await tf(u,{method:'DELETE'},8000)}catch(e){log('Запись: нет связи ('+(e.message||'?')+')')}
log('Если оба кода 200 — всё работает.')},
dre(){snd.tap();if(!CFG.dbUrl){DB='';LS.set('vip3-db','')}MV={};LD='';POLL.ok=null;setSt();detect().then(()=>{poll(true);flush();setTimeout(rDiag,2500)})},
async dclr(){if(!await ask('Сбросить кэш?','<p>Очистятся временные данные этого телефона и приложение перезагрузится. Данные в облаке не затрагиваются.</p>','Да, сбросить','Нет'))return;try{LS.set('vip3-cache',{});LS.set('vip3-db','');const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()))}catch(e){}location.reload()}
};
const rAll=()=>{rCooks();rPCooks();rCats();rList();rBar()};
document.addEventListener('click',e=>{const b=e.target.closest?e.target.closest('[data-a]'):null;if(b&&ACT[b.dataset.a])ACT[b.dataset.a](b.dataset.id);else if(e.target.tagName==='DIALOG'&&e.target.id!=='dc')e.target.close();else if(e.target===document.body&&document.body.classList.contains('mo'))document.querySelectorAll('dialog[open]').forEach(d=>{if(d.id!=='dc')d.close()})});
document.addEventListener('change',e=>{const t=e.target,d=t.dataset;if(!d)return;
if(d.q){const i=L.draft.items[d.q],v=fq(t.value);if(!i)return;if(v){i.qty=v;snd.tap()}else{delete L.draft.items[d.q];snd.warn()}saveL();rep(d.q)}
else if(d.un){const i=L.draft.items[d.un];if(i){i.u=t.value;L.lu[d.un]=t.value;saveL();snd.tap();rep(d.un)}}
else if(d.by){const k=team().find(x=>x.id===t.value);mut('PATCH',`prep/${pd}/${d.by}`,{by:k?{id:k.id,n:k.n}:null});snd.add()}});
let rf;$('#q').addEventListener('input',e=>{qs=e.target.value;cancelAnimationFrame(rf);rf=requestAnimationFrame(rList)});
$('#date').addEventListener('change',e=>{L.draft.date=e.target.value||dAdd(1);saveL()});
$('#note').addEventListener('input',e=>{L.draft.note=e.target.value;saveL()});
$('#hq').addEventListener('input',rHist);
$('#lq').addEventListener('input',rLib);
$('#pg').addEventListener('change',e=>{L.pg=e.target.value;saveL()});
$('#pdate').addEventListener('change',e=>{if(e.target.value){pd=e.target.value;rPrep();poll()}});
[['#pt','padd'],['#pq','padd'],['#qgn','gadd'],['#ap','login']].forEach(x=>$(x[0]).addEventListener('keydown',e=>{if(e.key==='Enter')ACT[x[1]]()}));
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();$('#q').focus()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){poll(true);flush();try{navigator.serviceWorker.getRegistration().then(r=>r&&r.update())}catch(e){}}});
addEventListener('online',()=>{poll(true);flush()});addEventListener('offline',()=>{POLL.ok=false;POLL.err='нет сети';setSt()});
setInterval(flush,10000);
// диалоги для старых телефонов (iOS < 15.4 и т.п.)
document.querySelectorAll('dialog').forEach(d=>{if(typeof d.showModal==='function')return;d.classList.add('poly');d.showModal=function(){this.setAttribute('open','');document.body.classList.add('mo')};d.close=function(){this.removeAttribute('open');if(!document.querySelector('dialog[open]'))document.body.classList.remove('mo')};Object.defineProperty(d,'open',{get(){return this.hasAttribute('open')}})});
syncDraft();rAll();setSt();
if(!DEMO){detect().then(()=>{setSt();poll(true);flush()});loop()}
if(AU.rt&&!DEMO)tok().then(()=>{ui();ensureChef()}).catch(()=>{});
})();


if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){const had=!!navigator.serviceWorker.controller;addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!window.__rl){window.__rl=1;location.reload()}})}

(()=>{const i=document.getElementById('inst');let dp;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;i.hidden=false});
const sa=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
if(!sa&&!window.Capacitor&&/iphone|ipad|ipod/i.test(navigator.userAgent))i.hidden=false;
i.onclick=async()=>{if(dp){dp.prompt();try{await dp.userChoice}catch{}dp=null;i.hidden=true}else alert('iPhone: нажмите «Поделиться» → «На экран Домой»')};
addEventListener('appinstalled',()=>{i.hidden=true})})();
