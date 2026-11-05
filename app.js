(()=>{'use strict';
if(!window.HTMLDialogElement||typeof HTMLDialogElement.prototype.showModal!=='function'){document.querySelectorAll('dialog').forEach(d=>{d.showModal=()=>{d.setAttribute('open','');d.classList.add('modal-fallback');document.body.classList.add('modal-fallback-open')};d.close=()=>{d.removeAttribute('open');const e=document.createEvent('Event');e.initEvent('close',false,false);d.dispatchEvent(e);if(!document.querySelector('dialog.modal-fallback[open]'))document.body.classList.remove('modal-fallback-open')}});document.addEventListener('click',e=>{if(e.target===document.body&&document.body.classList.contains('modal-fallback-open')){const d=document.querySelector('dialog.modal-fallback[open]');if(d)d.close()}},true)}
const CFG=Object.assign({dbUrl:'',projectId:'',apiKey:'',adminEmail:'admin@vip.local'},window.CONFIG||{});
const DEMO=!(CFG.dbUrl||CFG.projectId)||!CFG.apiKey;let DB=String(CFG.dbUrl||'').replace(/\/+$/,'');
const $=s=>document.querySelector(s),dialogOpen=id=>$(id).hasAttribute('open'),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),cssEsc=s=>window.CSS&&CSS.escape?CSS.escape(String(s)):String(s).replace(/[^a-zA-Z0-9_-]/g,'\\$&');
const VER='5.6';
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
const dAdd=(n,b)=>{const d=b?new Date(b+'T12:00'):new Date();d.setDate(d.getDate()+n);return iso(d)};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const blank=cook=>({cook:cook||null,date:dAdd(1),note:'',items:{},editId:null});
const L=Object.assign({draft:blank(),me:null,lu:{},out:[]},LS.get('vip3-local',{}));
if(!L.draft||!L.draft.items)L.draft=blank();
const savedPrepDate=LS.get('vip3-prep-date','');
let DATA=LS.get('vip3-cache',{}),PC=null,cat='all',qs='',edit=0,pd=/^\d{4}-\d{2}-\d{2}$/.test(savedPrepDate)?savedPrepDate:dAdd(1),tab='order',qg='main',want='',sm=iso(new Date()).slice(0,7),sf=L.sf||(L.me?L.me.id:'all'),se=0,wd=dAdd(0),wcat='all',wq='',woDraft=null;const ssel=new Set();
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
const dirty=k=>{D[k]=1;if(k==='catalog')PC=null;if(!raf)raf=requestAnimationFrame(render)};
const DEV=LS.get('vip3-dev','')||(()=>{const v=uid();LS.set('vip3-dev',v);return v})();
const ST={open:{},seen:{},err:'',lastErr:''};
const setSt=()=>{const s=$('#saved');if(DEMO){s.textContent='● демо-режим';s.className='';return}
const n=L.out.length,o=Object.values(ST.open).some(Boolean);
s.textContent=!DB?'… подключение':n?'↻ отправка ('+n+')':ST.err?'⚠ ошибка':o?'● онлайн':'○ нет связи';s.className=(o&&!n&&!ST.err)?'on':''};
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
try{while(L.out.length){const o=L.out[0];try{await api(o.m,o.p,o.b)}catch(e){if([400,404].includes(e.status)){ST.err=ST.lastErr=`HTTP ${e.status} · ${o.m} ${o.p}`;L.out.shift();saveL();snd.warn();toast('Не сохранено (код '+e.status+'). Проверьте соединение и правила Firebase');setSt();continue}if([401,403].includes(e.status)){ST.err=ST.lastErr=`HTTP ${e.status} · ${o.m} ${o.p}`;snd.warn();toast('Нет прав. Проверьте правила Firebase или войдите как руководитель');setSt()}throw e}ST.err='';failures=0;retryAt=0;L.out.shift();saveL()}}catch{failures++;retryAt=Date.now()+Math.min(60000,1000*Math.pow(2,Math.min(failures-1,6)))}fl=0;setSt()}
function mut(m,p,v){put('/'+p,m==='DELETE'?null:v,m==='PATCH');dirty(p.split('/')[0]);if(DEMO){LS.set('vip3-cache',DATA);return}L.out.push({m,p,b:v});saveL();setSt();flush()}
const ES={};
function listen(key,prefix,q){if(DEMO||!DB||!window.EventSource)return;const route=prefix+'|'+(q||'');if(ES[key]&&ES[key].__route===route&&ES[key].readyState!==2)return;if(ES[key])ES[key].close();
const es=ES[key]=new EventSource(`${DB}/${prefix}.json${q?'?'+q:''}`);es.__route=route;ST.open[key]=false;
const on=(t,m)=>es.addEventListener(t,e=>{ST.seen[key]=Date.now();try{const d=JSON.parse(e.data);put('/'+prefix+d.path,d.data,m);dirty(prefix.split('/')[0])}catch{}});
on('put',0);on('patch',1);es.addEventListener('keep-alive',()=>{ST.seen[key]=Date.now()});
es.onopen=()=>{ST.open[key]=true;ST.seen[key]=Date.now();setSt();flush()};
es.onerror=()=>{ST.open[key]=false;setSt();if(es.readyState===2&&ES[key]===es)setTimeout(()=>{if(ES[key]===es)listen(key,prefix,q)},4000)}}
const streams=()=>{const keys=new Set(['team']);if(tab==='order'){keys.add('catalog');keys.add('writeoffs')}if(tab==='writeoff'){keys.add('catalog');keys.add('writeoffs')}if(tab==='prep'){keys.add('prep');keys.add('plan');keys.add('prepLibrary');keys.add('prepPins')}if(tab==='sched'){keys.add('sched');keys.add('prepPins')}if(dialogOpen('#dh'))keys.add('orders');Object.keys(ES).forEach(k=>{if(!keys.has(k)){ES[k].close();delete ES[k];ST.open[k]=false}});const routes={team:['team'],catalog:['catalog'],orders:['orders','orderBy=%22created%22&limitToLast=80'],prep:['prep/'+pd],plan:['plan'],prepLibrary:['prepLibrary'],prepPins:['prepPins'],writeoffs:['writeoffs/'+(tab==='writeoff'?wd:dAdd(0))],sched:['sched']};keys.forEach(k=>{const r=routes[k];if(r)listen(k,r[0],r[1])})};
// ---------- каталог ----------
const cat0=()=>DATA.catalog||{};
const prods=()=>PC||(PC=[...base.filter(p=>!(cat0().hidden||{})[ek(p.id)]).map(p=>{const e=(cat0().edits||{})[ek(p.id)];return e?{...p,n:e.n||p.n,u:e.u||p.u}:p}),...Object.entries(cat0().custom||{}).map(([k,v])=>({id:'c:'+k,k,n:v.n,c:v.c,u:v.u}))].sort((a,b)=>a.n.localeCompare(b.n,'ru')));
const cats=()=>[...BASE.map(([id,n,e])=>({id,n,e})),...Object.entries(cat0().groups||{}).map(([k,v])=>({id:k,n:v.n,e:'📦',g:1}))];
const team=()=>{const a=Object.entries(DATA.team||{}).map(([id,v])=>({id,n:String(v.n||''),r:String(v.r||''),color:String(v.color||'')}));if(!a.some(c=>c.n.trim().toLocaleLowerCase('ru')==='хоссам'))a.push({id:'chef-hossam',n:'Хоссам',r:'Шеф',virtual:true});return a.sort((x,y)=>{const xc=x.n.trim().toLocaleLowerCase('ru')==='хоссам',yc=y.n.trim().toLocaleLowerCase('ru')==='хоссам';return xc===yc?x.n.localeCompare(y.n,'ru'):xc?-1:1})};
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
const rCats=()=>{const cs=cats(),n=s=>cs.find(c=>c.id===s);$('#cats').innerHTML=`<button class="chip${cat==='all'?' on':''}" data-a="cat" data-id="all">Все</button>`+cs.map(c=>`<button class="chip${cat===c.id?' on':''}" data-a="cat" data-id="${c.id}">${c.e} ${esc(c.n.split(' и ')[0].split(',')[0])}</button>`).join('')+`<button class="chip" data-a="newg">＋ Группа</button>`+(ed()&&n(cat)&&n(cat).g?`<button class="chip" style="color:var(--rd)" data-a="delg">🗑 Удалить группу</button>`:'')};
const rList=()=>{const q=qs.trim().toLowerCase(),cs=cats();let h='';const ps=prods().filter(p=>(cat==='all'||p.c===cat)&&(!q||p.n.toLowerCase().includes(q)));
for(const c of cs){const g=ps.filter(p=>p.c===c.id);if(g.length)h+=(cat==='all'||q?`<div class="gh">${c.e} ${esc(c.n)}</div>`:'')+g.map(row).join('')}
$('#list').innerHTML=h||`<div class="em">Ничего не найдено.<br>Нажмите «＋ Товар», чтобы добавить.</div>`};
const rBar=()=>{$('#cnt').textContent=cnt()?cnt()+' поз.':'пусто';$('#date').value=L.draft.date;$('#note').value=L.draft.note};
const rRev=()=>{const it=dI(),c=L.draft.cook;$('#rc').innerHTML=c?esc(c.n)+' — '+esc(c.r):'<span style="color:var(--rd)">не выбран</span>';
$('#rb').innerHTML=it.length?it.sort((a,b)=>a.n.localeCompare(b.n,'ru')).map(i=>`<div class="it on"><div class="n">${esc(i.n)}</div>${stepper(i)}<button class="x" data-a="rm" data-id="${esc(i.id)}">✕</button></div>`).join(''):'<div class="em">Список пуст</div>'};
const rTeam=()=>{$('#tl').innerHTML=team().length?team().map(k=>`<div class="it"><div class="n">${esc(k.n)}<i>${esc(k.r)}</i></div>${k.virtual?'<small>Основной повар</small>':`<button class="x" data-a="delc" data-id="${esc(k.id)}">✕</button>`}</div>`).join(''):'<div class="em">Добавьте поваров с должностями</div>'};
const rAdm=()=>{const b=$('#edb');b.textContent='Режим правки товаров: '+(ed()?'ВКЛ':'выкл');b.className=ed()?'d':'';const h=Object.keys(cat0().hidden||{}).length,u=$('#unh');u.textContent='Вернуть скрытые ('+h+')';u.disabled=!h};
const nt=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const hashText=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return 'l'+h.toString(36)};
const libItems=()=>Object.entries(DATA.prepLibrary||{}).map(([id,v])=>({id,...v})).filter(v=>v&&v.t);
const rememberPrep=(t,w)=>{if(!t||!t.t||!w)return;const old=libItems().find(i=>nt(i.t)===nt(t.t)),id=old?old.id:hashText(nt(t.t));mut('PUT','prepLibrary/'+id,{t:t.t,q:t.q||'',g:t.g||'main',by:{id:w.id,n:w.n},usedAt:Date.now()})};
const rLibrary=()=>{const q=nt($('#libq').value),items=libItems().filter(i=>!q||nt(i.t).includes(q)).sort((a,b)=>(b.usedAt||0)-(a.usedAt||0));$('#libcount').textContent=`${items.length} сохранено`;$('#liblist').innerHTML=items.length?items.map(i=>`<article class="libitem"><div class="libname">${esc(i.t)}</div><div class="libmeta">${i.q?`${esc(i.q)} · `:''}${i.g&&i.g!=='main'?`${esc(gname(i.g))} · `:''}${i.by?`Готовил: ${esc(i.by.n)} · `:'Запись в архиве · '}${i.usedAt?new Date(i.usedAt).toLocaleDateString('ru',{day:'2-digit',month:'2-digit',year:'numeric'}):'Ранее'}</div><div class="lib-actions"><button class="p" data-a="libadd" data-id="${esc(i.id)}">＋ В день</button><button data-a="libedit" data-id="${esc(i.id)}">✎ Изменить</button><button class="d" data-a="libdelete" data-id="${esc(i.id)}">Удалить</button></div></article>`).join(''):'<div class="em">История пока пуста. Добавьте заготовку или отметьте её выполненной.</div>'};
const libraryDialog=item=>{const groups=pgroups();$('#lltitle').textContent=item?'Изменить заготовку в архиве':'Добавить заготовку в архив';$('#dl').dataset.id=item?item.id:'';$('#llt').value=item?item.t:'';$('#llq').value=item?item.q||'':'';$('#llg').innerHTML=groups.map(g=>`<option value="${esc(g.id)}"${(item?item.g||'main':qg)===g.id?' selected':''}>${esc(g.n)}</option>`).join('');$('#dl').showModal();$('#llt').focus()};
const dm=()=>(DATA.prep||{})[pd]||{},dayTasks=()=>Object.values(dm());
const pgroups=()=>[{id:'main',n:'Основные'},{id:'banq',n:'Банкет'},...Object.entries((DATA.plan||{}).groups||{}).map(([id,v])=>({id,n:v.n}))];
const gname=g=>(pgroups().find(x=>x.id===g)||{n:'Другое'}).n;
const WO_REASONS=[['spoiled_v2','Порча продукта'],['damaged_v2','Повреждение товара'],['expired','Истёк срок годности'],['storage','Нарушение условий хранения'],['other','Другая причина']];
const woReason=id=>id==='spoiled'?'Старый вариант: порча или повреждение':(WO_REASONS.find(x=>x[0]===id)||WO_REASONS[4])[1];
const ruCount=(n,one,two,five)=>{const a=n%100,b=n%10;return a>=11&&a<=14?five:b===1?one:b>=2&&b<=4?two:five};
const woRows=date=>Object.entries(((DATA.writeoffs||{})[date])||{}).map(([id,v])=>({id,...(v||{}),c:(v&&v.c)||(prods().find(p=>p.id===v?.pid)||{}).c||''})).filter(v=>v&&v.name);
const writeoffMessage=(date,rows=woRows(date))=>{const cs=cats(),seen=new Set(),out=[`🗑 Списание за ${day(date)}`,''];for(const c of cs){const g=rows.filter(v=>v.c===c.id);if(!g.length)continue;g.forEach(v=>seen.add(v.id));out.push(`${c.e} ${c.n}`,g.sort((a,b)=>a.name.localeCompare(b.name,'ru')).map(v=>`• ${v.name} — ${fmtQ(v.qty)} ${v.unit||''} — ${woReason(v.reason)}${v.note?` (${v.note})`:''}${v.by&&v.by.n?` · Списал: ${v.by.n}`:''}`).join('\n'),'')}const rest=rows.filter(v=>!seen.has(v.id));if(rest.length)out.push('📦 Другое',rest.sort((a,b)=>a.name.localeCompare(b.name,'ru')).map(v=>`• ${v.name} — ${fmtQ(v.qty)} ${v.unit||''} — ${woReason(v.reason)}${v.note?` (${v.note})`:''}${v.by&&v.by.n?` · Списал: ${v.by.n}`:''}`).join('\n'),'');out.push(`Всего: ${rows.length} поз.`);return out.join('\n')};
const planItems=()=>Object.entries((DATA.plan||{}).items||{}).map(([id,v])=>({id,...v})).filter(i=>i.t);
const rPrep=()=>{const ts=Object.entries((DATA.prep||{})[pd]||{}).map(([id,v])=>({id,...v})),remembered=new Set(libItems().map(i=>nt(i.t)));ts.filter(t=>t.done&&t.by&&!remembered.has(nt(t.t))).forEach(t=>{rememberPrep(t,t.by);remembered.add(nt(t.t))});
const dn=ts.filter(t=>t.done).sort((a,b)=>(b.at||0)-(a.at||0)),gi=g=>Math.max(0,pgroups().findIndex(x=>x.id===(g||'main'))),td=ts.filter(t=>!t.done).sort((a,b)=>gi(a.g)-gi(b.g)||(a.c||0)-(b.c||0)),k=team();
const sel=t=>`<select class="who" data-by="${t.id}"><option value="">Кто?</option>${k.map(c=>`<option value="${c.id}"${t.by&&t.by.id===c.id?' selected':''}>${esc(c.n)}</option>`).join('')}${t.by&&!k.some(c=>c.id===t.by.id)?`<option value="${esc(t.by.id)}" selected>${esc(t.by.n)}</option>`:''}</select>`;
const r=t=>`<div class="pr${t.done?' ok':''}"><button class="ck" data-a="ptog" data-id="${t.id}" aria-label="Отметить">${t.done?'✓':''}</button><div class="pn"><b>${esc(t.t)}</b>${t.g&&t.g!=='main'?`<em>${esc(gname(t.g))}</em>`:''}${t.q?`<i>${esc(t.q)}</i>`:''}${t.done&&t.by?`<small>✓ ${esc(t.by.n)} · ${tm(t.at)}</small>`:''}</div>${sel(t)}<button class="x" data-a="pdel" data-id="${t.id}" aria-label="Удалить">✕</button></div>`;
$('#plist').innerHTML=ts.length?(dn.length?`<div class="gh">Выполнено · ${dn.length}</div>`+dn.map(r).join(''):'')+(td.length?`<div class="gh">Осталось · ${td.length}</div>`+td.map(r).join(''):''):'<div class="em">На этот день заготовок нет.<br>Добавьте её в общий список ниже или выберите из истории.</div>';
$('#pfill').style.width=ts.length?Math.round(dn.length/ts.length*100)+'%':'0%';$('#pinfo').textContent=`${day(pd)} · выполнено ${dn.length} из ${ts.length}`;
$('#pdate').value=pd;$('#pd0').className='chip'+(pd===dAdd(0)?' on':'');$('#pd1').className='chip'+(pd===dAdd(1)?' on':'');const pinned=!!(DATA.prepPins||{})[pd],pinButton=$('#ppin'),dates=Object.keys(DATA.prepPins||{}).filter(dt=>/^\d{4}-\d{2}-\d{2}$/.test(dt)&&(DATA.prepPins||{})[dt]).sort();pinButton.textContent=pinned?'📌 День закреплён':'📌 Закрепить день';pinButton.classList.toggle('on',pinned);pinButton.setAttribute('aria-pressed',String(pinned));$('#ppinlabel').hidden=!dates.length;$('#ppins').innerHTML=dates.map(dt=>`<button class="chip pin-chip${dt===pd?' on':''}" data-a="ppick" data-id="${dt}" aria-current="${dt===pd?'date':'false'}">📌 ${esc(new Date(dt+'T12:00:00').toLocaleDateString('ru',{weekday:'short',day:'2-digit',month:'2-digit'}))}</button>`).join('')};
const rPlan=()=>{const gs=pgroups(),its=planItems(),m=dm();
$('#qcount').textContent=`${its.length} в списке · ${Object.keys(m).length} на день`;
$('#qgroups').innerHTML=gs.map(g=>`<button class="chip${qg===g.id?' on':''}" data-a="qgrp" data-id="${g.id}">${esc(g.n)}<small>${its.filter(i=>(i.g||'main')===g.id).length} в списке · ${Object.values(m).filter(t=>(t.g||'main')===g.id).length} на день</small></button>`).join('')+`<button class="chip" data-a="qnewg">＋ Группа</button>`+(!['main','banq'].includes(qg)?`<button class="chip" style="color:var(--rd)" data-a="qdelg">🗑 Удалить группу</button>`:'');
const li=its.filter(i=>(i.g||'main')===qg).sort((a,b)=>a.t.localeCompare(b.t,'ru'));
$('#qlist').innerHTML=li.length?li.map(i=>{const on=!!m[i.id];return `<div class="it${on?' on':''}"><button class="ck" data-a="qtog" data-id="${i.id}" aria-label="Добавить в день">${on?'✓':''}</button><div class="n">${esc(i.t)}${i.q?`<i>${esc(i.q)}</i>`:''}</div><button class="x" data-a="qdel" data-id="${i.id}" aria-label="Удалить из списка">✕</button></div>`}).join(''):'<div class="em">В этой группе пока пусто.<br>Добавьте заготовки выше.</div>';
$('#qcp').hidden=Object.keys(m).length>0};
const P2=n=>String(n).padStart(2,'0'),SC=()=>DATA.sched||{};
const rSched=()=>{const k=team(),S=SC(),ed2=se&&isAdmin(),color=id=>{const c=k.find(x=>x.id===id);return c&&PALETTE.includes(c.color)?c.color:hashColor(id)};if(sf!=='all'&&!k.some(c=>c.id===sf))sf='all';
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
const rWoProducts=()=>{const q=wq.trim().toLocaleLowerCase('ru'),ps=prods().filter(p=>(wcat==='all'||p.c===wcat)&&(!q||p.n.toLocaleLowerCase('ru').includes(q))),cs=cats();let h='';for(const c of cs){const rows=ps.filter(p=>p.c===c.id);if(rows.length)h+=(wcat==='all'||q?`<div class="gh">${c.e} ${esc(c.n)}</div>`:'')+rows.map(p=>`<div class="it"><div class="n">${esc(p.n)}<i>${esc(p.u)}</i></div><button class="p" data-a="woopen" data-id="${esc(p.id)}">＋ Списать</button></div>`).join('')}$('#wocatalogcount').textContent=`${ps.length} товаров`;$('#woproducts').innerHTML=h||'<div class="em">Товары не найдены. Добавьте их во вкладке «Заказ».</div>'};
const rWoLog=()=>{const rows=woRows(wd).sort((a,b)=>(b.updated||b.created||0)-(a.updated||a.created||0));$('#wocount').textContent=`${rows.length} ${ruCount(rows.length,'запись','записи','записей')}`;$('#wocopy').disabled=!rows.length;$('#woshare').disabled=!rows.length;$('#woshare').hidden=typeof navigator.share!=='function';$('#wolog').innerHTML=rows.length?rows.map(v=>`<article class="wo-entry"><div class="wo-entry-head"><b>${esc(v.name)}</b><strong>${esc(fmtQ(v.qty))} ${esc(v.unit||'')}</strong></div><div class="libmeta">${esc(woReason(v.reason))}${v.note?` · ${esc(v.note)}`:''}${v.by&&v.by.n?` · Списал: ${esc(v.by.n)}`:''}</div><div class="lib-actions"><button data-a="woedit" data-id="${esc(v.id)}">✎ Изменить</button><button class="d" data-a="wodel" data-id="${esc(v.id)}">Удалить</button></div></article>`).join(''):'<div class="em">За выбранный день списаний нет.</div>'};
const rWriteoff=()=>{$('#woDate').value=wd;rWoCats();rWoProducts();rWoLog()};
const woDialog=(p,entry)=>{const unit=entry&&entry.unit||p.u,units=UNITS.includes(unit)?UNITS:[...UNITS,unit],legacy=entry&&entry.reason==='spoiled';woDraft={product:p,id:entry?entry.id:'',created:entry?entry.created:0};$('#woTitle').textContent=entry?'Изменить списание':'Новое списание';$('#woProduct').textContent=p.n;$('#woUnit').innerHTML=units.map(u=>`<option${u===unit?' selected':''}>${esc(u)}</option>`).join('');$('#woQty').value=entry?entry.qty:'';$('#woReason').innerHTML=(legacy?'<option value="spoiled">Старый вариант: порча или повреждение</option>':'')+WO_REASONS.map(([id,label])=>`<option value="${esc(id)}">${esc(label)}</option>`).join('');$('#woReason').value=entry&&entry.reason?entry.reason:'spoiled_v2';$('#woNote').value=entry?entry.note||'':'';$('#woBy').innerHTML='<option value="">Не указан</option>'+team().map(k=>`<option value="${esc(k.id)}">${esc(k.n)}</option>`).join('');$('#woBy').value=entry&&entry.by?entry.by.id:L.me&&team().some(k=>k.id===L.me.id)?L.me.id:'';$('#woModal').showModal();$('#woQty').focus()};
const rDiag=()=>{const o=Object.keys(ES).map(k=>k+':'+(ST.open[k]?'✓':'✗')).join('  ');
$('#dinfo').textContent=[`Версия: ${VER}`,`Режим: ${DEMO?'ДЕМО (config.js не заполнен)':'облако'}`,`База: ${DB||'не найдена'}`,`Потоки: ${o||'—'}`,`В очереди на отправку: ${L.out.length}`,`Последняя ошибка: ${ST.lastErr||'нет'}`,`Телефон в сети: ${navigator.onLine?'да':'нет'}`,`Повара: ${team().length} · заказы: ${ords().length} · заготовок на день: ${Object.keys(dm()).length}`,`Устройство: ${DEV}`].join('\n');$('#dlog').textContent=''};
const rHist=()=>{const q=$('#hq').value.trim().toLowerCase();const l=ords().filter(o=>!q||(o.cook.n+' '+o.date+' '+day(o.date)+' '+o.items.map(i=>i.n).join(' ')).toLowerCase().includes(q));
$('#hl').innerHTML=l.length?l.map(o=>`<div class="hc"><b>${esc(day(o.date))} · ${esc(o.cook.n)}</b><small>${esc(o.cook.r)} · ${o.items.length} поз. · ${new Date(o.created).toLocaleDateString('ru')} ${tm(o.created)}${o.copied?' · ✓ скопирован':' · не скопирован'}</small><div style="font-size:13px;margin-top:4px">${esc(o.items.slice(0,5).map(i=>i.n).join(', '))}${o.items.length>5?'…':''}</div><div class="acts"><button data-a="open" data-id="${o.id}">Открыть и править</button><button data-a="hcopy" data-id="${o.id}">Копировать</button><button class="d" data-a="hdel" data-id="${o.id}">Удалить</button></div></div>`).join(''):'<div class="em">История пока пуста</div>'};
function render(){raf=0;const d={...D};for(const k in D)delete D[k];
if(d.team){if(isAdmin())ensureTeamColors();rCooks();rPCooks();rPrep();rSched();if(dialogOpen('#dt'))rTeam()}
if(d.sched||d.prepPins)rSched();
if(d.catalog){syncDraft();rCats();rList();rBar();if(tab==='writeoff'){rWoCats();rWoProducts()}if(dialogOpen('#dt'))rAdm()}
if(d.writeoffs&&tab==='writeoff')rWoLog();
if(d.orders&&dialogOpen('#dh'))rHist();
if(d.prep||d.plan||d.prepPins||d.prepLibrary)rPrep();
if(d.prep||d.plan)rPlan();
if(d.prepLibrary)rLibrary();
clearTimeout(ct);ct=setTimeout(()=>LS.set('vip3-cache',DATA),800)}
// ---------- заказ ----------
const msg=(o,includeTodayWriteoffs=false)=>{const L2=[`🧾 Заказ на ${day(o.date)}`,`👨‍🍳 ${o.cook.n}, ${o.cook.r}`,`🕒 оформлен в ${tm(o.created)}`,''];
const cs=[...BASE,...Object.entries(cat0().groups||{}).map(([k,v])=>[k,v.n,'📦'])],seen=new Set(),ln=i=>`• ${i.n} — ${fmtQ(i.qty)} ${i.u}`;
for(const[id,n,e]of cs){const g=o.items.filter(i=>i.c===id);if(!g.length)continue;g.forEach(i=>seen.add(i.id));L2.push(`${e} ${n}`,g.sort((a,b)=>a.n.localeCompare(b.n,'ru')).map(ln).join('\n'),'')}
const r=o.items.filter(i=>!seen.has(i.id));if(r.length)L2.push('📦 Другое',r.map(ln).join('\n'),'');
if(o.note)L2.push('💬 '+o.note,'');L2.push(`Всего: ${o.items.length} поз.`);if(includeTodayWriteoffs){const date=dAdd(0),rows=woRows(date);if(rows.length)L2.push('',writeoffMessage(date,rows))}return L2.join('\n')};
const snap=()=>{const d=L.draft,old=d.editId&&ords().find(o=>o.id===d.editId);return{id:d.editId||'o'+uid(),created:old?old.created:Date.now(),updated:Date.now(),date:d.date,cook:d.cook,note:d.note.trim(),items:dI().map(i=>({...i})),copied:old?!!old.copied:false}};
const valid=()=>{if(!cnt()){snd.warn();vib(80);toast('Добавьте хотя бы один товар');return 0}if(!L.draft.cook){snd.warn();vib(80);toast('Выберите повара');$('#dr').close();$('#cooks').classList.add('bad');setTimeout(()=>$('#cooks').classList.remove('bad'),1500);window.scrollTo({top:0,behavior:'smooth'});return 0}return 1};
const upsert=o=>mut('PUT','orders/'+o.id,o);
const ask=(t,h,y='Да',n='Нет, вернуться')=>new Promise(res=>{const d=$('#dc');$('#ct').textContent=t;$('#cb').innerHTML=h;$('#cy').textContent=y;$('#cn').textContent=n;snd.ask();vib(40);const f=v=>()=>{d.close();res(v)};$('#cy').onclick=f(true);$('#cn').onclick=f(false);d.oncancel=()=>res(false);d.showModal()});
const clip=async t=>{try{await navigator.clipboard.writeText(t);return 1}catch{try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.append(a);a.select();const ok=document.execCommand('copy');a.remove();return ok}catch{return 0}}};
const copyOrder=async()=>{if(!valid())return;const o=snap(),message=msg(o,o.date===dAdd(1));const yes=await ask('Вы уверены?',`<p style="margin:0 0 10px;color:var(--mu)">Проверьте сообщение. Если что-то не так — вернитесь и исправьте.</p><pre class="msg">${esc(message)}</pre>`,'Да, копировать','Нет, вернуться');if(!yes)return;
if(!await clip(message)){snd.warn();toast('Не удалось скопировать. Разрешите доступ к буферу');return}
o.copied=true;upsert(o);L.draft=blank(L.draft.cook);saveL();$('#dr').close();rAll();snd.ok();vib([60,40,60]);toast('✓ Скопировано и сохранено в истории')};
const saveOrder=()=>{if(!valid())return;const o=snap();upsert(o);L.draft.editId=o.id;saveL();snd.ok();toast('✓ Сохранено для всех. Можно редактировать')};
const open=id=>{rRev();$(id).showModal()};
const need=()=>{snd.warn();toast('Нужен вход в админ-панель');ACT.admin()};
const rep=id=>{const p=prods().find(x=>x.id===id),r=document.querySelector(`[data-r="${cssEsc(id)}"]`);if(p&&r)r.outerHTML=row(p);rBar();if(dialogOpen('#dr'))rRev()};
const ui=()=>{rCats();rList();rAdm();rSched();if(tab==='writeoff')rWriteoff()};
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
tab(id){if(id==='plan')id='prep';tab=id;snd.tap();$('#vOrder').hidden=id!=='order';$('#vPrep').hidden=id!=='prep';$('#vSched').hidden=id!=='sched';$('#vWriteoff').hidden=id!=='writeoff';$('#bar').hidden=id!=='order';document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.id===id));if(id==='prep'){rPrep();rPlan();rLibrary()}if(id==='sched')rSched();if(id==='writeoff')rWriteoff();streams()},
add(id){const p=prods().find(x=>x.id===id);if(!p)return;L.draft.items[id]={id,n:p.n,c:p.c,u:L.lu[id]||p.u,qty:1};saveL();snd.add();vib(20);rep(id)},
inc(id){const i=L.draft.items[id];if(i){i.qty=Math.round((i.qty+1)*100)/100;saveL();snd.tap();rep(id)}},
dec(id){const i=L.draft.items[id];if(!i)return;i.qty=Math.round((i.qty-1)*100)/100;if(i.qty<=0){delete L.draft.items[id];snd.warn()}else snd.tap();saveL();rep(id)},
rm(id){delete L.draft.items[id];saveL();snd.warn();rep(id)},
pick(id){const k=team().find(x=>x.id===id);L.draft.cook=k;L.me=k;saveL();snd.add();rCooks();rPCooks()},
me(id){L.me=team().find(x=>x.id===id);saveL();snd.add();rPCooks()},
cat(id){cat=id;snd.tap();rCats();rList()},
wocat(id){wcat=id;snd.tap();rWoCats();rWoProducts()},
woopen(id){const p=prods().find(x=>x.id===id);if(p)woDialog(p,null)},
woedit(id){const e=(((DATA.writeoffs||{})[wd])||{})[id];if(!e)return;const current=prods().find(x=>x.id===e.pid),p={...(current||{id:e.pid||id,n:e.name||'Товар из старого каталога',u:e.unit||''}),c:e.c||current&&current.c||'',n:e.name||current&&current.n||'Товар из старого каталога',u:e.unit||current&&current.u||''};woDialog(p,{...e,id})},
wosave(){if(!woDraft||!woDraft.product)return;const qty=fq($('#woQty').value),reason=$('#woReason').value,note=$('#woNote').value.trim(),unit=$('#woUnit').value;if(!qty){snd.warn();toast('Укажите количество больше нуля');$('#woQty').focus();return}if(!unit){snd.warn();toast('Выберите единицу измерения');$('#woUnit').focus();return}if(!WO_REASONS.some(x=>x[0]===reason)&&!(woDraft.id&&reason==='spoiled')){snd.warn();toast('Выберите причину списания');return}if(reason==='other'&&!note){snd.warn();toast('Опишите причину списания в комментарии');$('#woNote').focus();return}const p=woDraft.product,k=team().find(x=>x.id===$('#woBy').value),id=woDraft.id||uid(),now=Date.now();mut('PUT',`writeoffs/${wd}/${id}`,{pid:p.id,c:p.c||'',name:p.n,qty,unit,reason,note,by:k?{id:k.id,n:k.n}:null,created:woDraft.created||now,updated:now});$('#woModal').close();woDraft=null;snd.ok();toast('✓ Списание сохранено');rWoLog()},
async wocopy(){const rows=woRows(wd);if(!rows.length){snd.warn();toast('За этот день нет списаний для копирования');return}if(await clip(writeoffMessage(wd,rows))){snd.ok();toast('✓ Списание скопировано')}else{snd.warn();toast('Не удалось скопировать списание')}},
async woshare(){const rows=woRows(wd);if(!rows.length){snd.warn();toast('За этот день нет списаний для отправки');return}const text=writeoffMessage(wd,rows);if(typeof navigator.share!=='function')return ACT.wocopy();try{await navigator.share({title:`Списание за ${day(wd)}`,text});snd.ok();toast('✓ Списание отправлено')}catch(e){if(e&&e.name==='AbortError')return;if(await clip(text)){snd.ok();toast('Не удалось отправить — списание скопировано')}else{snd.warn();toast('Не удалось отправить или скопировать списание')}}},
async wodel(id){const e=(((DATA.writeoffs||{})[wd])||{})[id];if(!e||!await ask('Удалить запись о списании?',`<p>${esc(e.name)} — ${esc(fmtQ(e.qty))} ${esc(e.unit||'')}</p>`,'Да, удалить','Нет'))return;mut('DELETE',`writeoffs/${wd}/${id}`);snd.warn();toast('Запись удалена');rWoLog()},
review(){snd.tap();open('#dr')},close(){snd.tap();document.querySelectorAll('dialog[open]').forEach(d=>d.close())},
copy:copyOrder,save:saveOrder,
async clear(){if(!cnt())return;if(await ask('Очистить список?','<p>Все выбранные товары будут убраны из текущего заказа.</p>','Да, очистить','Нет, оставить')){L.draft=blank(L.draft.cook);saveL();rAll();rRev();snd.warn()}},
hist(){snd.tap();rHist();$('#dh').showModal();streams()},
addcook(){if(!isAdmin())return need();const n=$('#tn').value.trim(),r=$('#tr').value.trim();if(!n||!r){snd.warn();toast('Укажите имя и должность');return}if(team().some(k=>k.n.trim().toLocaleLowerCase('ru')===n.toLocaleLowerCase('ru'))){snd.warn();toast('Такой повар уже добавлен');return}const id=uid(),used=team().map(k=>PALETTE.includes(k.color)?k.color:hashColor(k.id)),color=PALETTE.find(c=>!used.includes(c))||hashColor(id);mut('PUT','team/'+id,{n,r,color});$('#tn').value=$('#tr').value='';snd.ok();$('#tn').focus();rTeam()},
async delc(id){if(!isAdmin())return need();const k=team().find(x=>x.id===id);if(!k||!await ask('Удалить сотрудника?',`<p>${esc(k.n)} — ${esc(k.r)}</p>`,'Да, удалить','Нет'))return;mut('DELETE','team/'+id);mut('DELETE','sched/'+id);if(L.draft.cook&&L.draft.cook.id===id)L.draft.cook=null;saveL();rTeam();rCooks()},
newp(){snd.tap();$('#pc').innerHTML=cats().map(c=>`<option value="${c.id}">${esc(c.n)}</option>`).join('');$('#pc').value=cat!=='all'&&cats().some(c=>c.id===cat)?cat:'sauces';$('#pu').innerHTML=UNITS.map(u=>`<option>${u}</option>`).join('');$('#pn').value='';$('#dp').showModal();$('#pn').focus()},
addprod(){const n=$('#pn').value.trim().replace(/\s+/g,' ');if(!n){snd.warn();toast('Введите название');return}const c=$('#pc').value,u=$('#pu').value;if(prods().some(p=>p.c===c&&p.n.toLowerCase()===n.toLowerCase())){snd.warn();toast('Такой товар уже есть в этой группе');return}
const k='p'+uid(),nm=n[0].toUpperCase()+n.slice(1);mut('PUT','catalog/custom/'+k,{n:nm,c,u});const id='c:'+k;L.draft.items[id]={id,n:nm,c,u,qty:1};saveL();$('#dp').close();cat=c;qs='';$('#q').value='';rAll();snd.ok();toast('✓ Добавлен для всех в «'+cats().find(x=>x.id===c).n+'»');setTimeout(()=>{const e=document.querySelector(`[data-r="${cssEsc(id)}"]`);e&&e.scrollIntoView({block:'center',behavior:'smooth'})},50)},
editp(id){if(!isAdmin())return need();const p=prods().find(x=>x.id===id);if(!p)return;$('#en').value=p.n;$('#eu').innerHTML=(UNITS.includes(p.u)?UNITS:[...UNITS,p.u]).map(u=>`<option${u===p.u?' selected':''}>${esc(u)}</option>`).join('');$('#de').dataset.id=id;snd.tap();$('#de').showModal()},
saveprod(){if(!isAdmin())return need();const id=$('#de').dataset.id,n=$('#en').value.trim().replace(/\s+/g,' '),u=$('#eu').value;if(!n){snd.warn();toast('Введите название');return}const p=prods().find(x=>x.id===id);if(!p)return;
mut('PATCH',p.k?'catalog/custom/'+p.k:'catalog/edits/'+ek(id),{n,u});L.lu[id]=u;saveL();$('#de').close();snd.ok();toast('✓ Сохранено для всех')},
async delp(id){if(!isAdmin())return need();const p=prods().find(x=>x.id===id);if(!p||!await ask('Удалить товар?',`<p>${esc(p.n)} будет удалён из каталога у всех.</p>`,'Да, удалить','Нет'))return;if(p.k)mut('DELETE','catalog/custom/'+p.k);else mut('PUT','catalog/hidden/'+ek(id),true);delete L.draft.items[id];saveL();rAll();snd.warn()},
newg(){snd.tap();$('#gn').value='';$('#dg').showModal();$('#gn').focus()},
addgrp(){const n=$('#gn').value.trim();if(!n){snd.warn();toast('Введите название группы');return}if(cats().some(c=>c.n.toLowerCase()===n.toLowerCase())){snd.warn();toast('Такая группа уже есть');return}const k='g'+uid();mut('PUT','catalog/groups/'+k,{n});cat=k;$('#dg').close();rAll();snd.ok()},
async delg(){if(!isAdmin())return need();const g=cats().find(x=>x.id===cat&&x.g);if(!g)return;const ps=prods().filter(p=>p.c===g.id);if(!await ask('Удалить группу?',`<p>«${esc(g.n)}»${ps.length?` и товаров в ней: ${ps.length}`:''} будут удалены у всех.</p>`,'Да, удалить','Нет'))return;ps.forEach(p=>{mut('DELETE','catalog/custom/'+p.k);delete L.draft.items[p.id]});mut('DELETE','catalog/groups/'+g.id);cat='all';saveL();rAll();snd.warn()},
async open(id){const o=ords().find(x=>x.id===id);if(!o)return;if(cnt()&&L.draft.editId!==id&&!await ask('Заменить текущий заказ?','<p>Несохранённый черновик будет заменён выбранным заказом из истории.</p>','Да, открыть','Нет, вернуться'))return;
L.draft={cook:o.cook,date:o.date,note:o.note||'',items:Object.fromEntries(o.items.map(i=>[i.id,{...i}])),editId:o.id};saveL();$('#dh').close();rAll();snd.ok();toast('Заказ открыт. Правьте и копируйте снова')},
async hcopy(id){const o=ords().find(x=>x.id===id);if(o&&await clip(msg(o,o.date===dAdd(1)))){mut('PATCH','orders/'+id,{copied:true});rHist();snd.ok();toast('✓ Скопировано')}else{snd.warn();toast('Не удалось скопировать')}},
async hdel(id){if(!isAdmin())return need();if(!await ask('Удалить заказ?','<p>Заказ будет удалён из истории у всех.</p>','Да, удалить','Нет'))return;mut('DELETE','orders/'+id);if(L.draft.editId===id)L.draft.editId=null;saveL();rHist();snd.warn()},
// заготовки
pday(n){pd=dAdd(+n);LS.set('vip3-prep-date',pd);streams();rPrep();rPlan();snd.tap()},
ptpin(){const pinned=!!(DATA.prepPins||{})[pd];mut(pinned?'DELETE':'PUT','prepPins/'+pd,pinned?undefined:true);snd.tap();toast(pinned?'День откреплён':'День подготовки закреплён');rPrep();rSched()},
ppick(dt){if(!(DATA.prepPins||{})[dt])return;pd=dt;LS.set('vip3-prep-date',pd);streams();rPrep();rPlan();snd.tap()},
ptog(id){const t=((DATA.prep||{})[pd]||{})[id];if(!t)return;const p=`prep/${pd}/${id}`;
if(t.done){mut('PATCH',p,{done:null,at:null});snd.tap();return}
const w=t.by||L.me;if(!w){snd.warn();vib(80);toast('Выберите повара справа или вверху «Я работаю»');const s=document.querySelector(`[data-by="${id}"]`);if(s){s.classList.add('bad');setTimeout(()=>s.classList.remove('bad'),1500)}return}
mut('PATCH',p,{done:true,by:{id:w.id,n:w.n},at:Date.now()});rememberPrep(t,w);snd.ok();vib(30)},
async pdel(id){const t=((DATA.prep||{})[pd]||{})[id];if(!t||!await ask('Удалить заготовку?',`<p>${esc(t.t)}</p>`,'Да, удалить','Нет'))return;mut('DELETE',`prep/${pd}/${id}`);snd.warn()},
async pcopy(){const prev=dAdd(-1,pd);let src=(DATA.prep||{})[prev];if(!src&&!DEMO){try{src=await(await api('GET','prep/'+prev)).json()}catch{toast('Нет сети');return}}
const es=Object.entries(src||{}).sort((a,b)=>(a[1].c||0)-(b[1].c||0));if(!es.length){snd.warn();toast('За вчера списка нет');return}
const m=dm();let n=0;es.forEach(([k,t],i)=>{if(m[k])return;mut('PUT',`prep/${pd}/${k}`,{t:t.t,q:t.q||'',g:t.g||'main',...(t.lid?{lid:t.lid}:{}),c:Date.now()+i});n++});snd.ok();toast('✓ Скопировано: '+n)},
// график работы
sfil(id){sf=id;L.sf=id;ssel.clear();saveL();snd.tap();rSched()},
smon(n){const[y,m]=sm.split('-').map(Number);sm=iso(new Date(y,m-1+(+n),1,12)).slice(0,7);snd.tap();rSched()},
sedit(){if(!isAdmin()){want='sedit';snd.tap();$('#ap').value='';$('#da').showModal();$('#ap').focus();return}se=!se;ssel.clear();snd.tap();rSched()},
sday(dt){if(!(se&&isAdmin()&&sf!=='all'))return;ssel.has(dt)?ssel.delete(dt):ssel.add(dt);snd.tap();rSched()},
sapply(){if(!isAdmin())return need();if(sf==='all'){snd.warn();toast('Сначала выберите повара');return}if(!ssel.size){snd.warn();toast('Выберите дни в календаре');return}
const n=ssel.size;ssel.forEach(dt=>mut('PUT',`sched/${sf}/${dt}`,{r:'Р',work:true}));ssel.clear();snd.ok();toast('✓ Рабочие дни отмечены: '+n);rSched()},
sclear(){if(!isAdmin())return need();if(sf==='all'||!ssel.size){snd.warn();toast('Выберите повара и дни');return}const n=ssel.size;ssel.forEach(dt=>mut('DELETE',`sched/${sf}/${dt}`));ssel.clear();snd.warn();toast('Смены убраны: '+n);rSched()},
// диагностика
diag(){snd.tap();rDiag();$('#dd').showModal()},
async dtest(){const out=[],log=s=>{out.push(s);$('#dlog').textContent=out.join('\n')};if(DEMO){log('Демо-режим: config.js не заполнен');return}
if(!DB){await detect();log('Поиск базы: '+(DB||'не найдена'));if(!DB)return}log('База: '+DB);
try{const r=await fetchFast(DB+'/.json?shallow=true',{},5000);log('Чтение: HTTP '+r.status)}catch(e){log('Чтение: нет связи')}
const u=`${DB}/prep/_ping/${DEV}.json`;try{const r=await fetchFast(u,{method:'PUT',body:JSON.stringify({t:Date.now()})},5000);log('Запись: HTTP '+r.status);const g=await fetchFast(u,{},5000);log('Проверка записи: HTTP '+g.status);await fetchFast(u,{method:'DELETE'},5000)}catch(e){log('Запись: нет связи')}
log('Потоки: '+Object.keys(ES).map(x=>x+(ST.open[x]?' ✓':' ✗')).join(', '));log('Если везде 200 и потоки ✓ — всё работает.')},
dre(){snd.tap();Object.keys(ES).forEach(k=>ES[k].close());if(!CFG.dbUrl){DB='';LS.set('vip3-db','')}setSt();detect().then(()=>{streams();flush();setSt();setTimeout(rDiag,2000)})},
async dclr(){if(!await ask('Сбросить кэш?','<p>Очистятся временные данные этого телефона и приложение перезагрузится. Данные в облаке не затрагиваются.</p>','Да, сбросить','Нет'))return;try{LS.set('vip3-cache',{});LS.set('vip3-db','');const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()))}catch{}location.reload()},
// общий план и список заготовок
qgrp(id){qg=id;snd.tap();rPlan()},
qnewg(){snd.tap();$('#qgn').value='';$('#dq').showModal();$('#qgn').focus()},
qaddg(){const n=$('#qgn').value.trim();if(!n){snd.warn();toast('Введите название группы');return}if(pgroups().some(g=>nt(g.n)===nt(n))){snd.warn();toast('Такая группа уже есть');return}const k='q'+uid();mut('PUT','plan/groups/'+k,{n});qg=k;$('#dq').close();snd.ok();rPlan()},
async qdelg(){const g=pgroups().find(x=>x.id===qg);if(!g||g.id==='main'||g.id==='banq')return;const its=planItems().filter(i=>(i.g||'main')===g.id);if(!await ask('Удалить группу?',`<p>«${esc(g.n)}»${its.length?` и заготовок в ней: ${its.length}`:''} будут удалены.</p>`,'Да, удалить','Нет'))return;its.forEach(i=>mut('DELETE','plan/items/'+i.id));mut('DELETE','plan/groups/'+g.id);qg='main';snd.warn();rPlan()},
qadd(){const t=$('#qt').value.trim().replace(/\s+/g,' '),q=$('#qq').value.trim();if(!t){snd.warn();toast('Напишите название заготовки');$('#qt').focus();return}if(planItems().some(i=>(i.g||'main')===qg&&nt(i.t)===nt(t))){snd.warn();toast('Такая заготовка уже есть в этой группе');return}mut('PUT','plan/items/'+uid(),{t,q,g:qg});$('#qt').value=$('#qq').value='';snd.ok();toast('Добавлено в общий список');$('#qt').focus()},
qone(){const t=$('#qt').value.trim().replace(/\s+/g,' '),q=$('#qq').value.trim();if(!t){snd.warn();toast('Напишите название заготовки');$('#qt').focus();return}mut('PUT',`prep/${pd}/${uid()}`,{t,q,g:qg,c:Date.now()});$('#qt').value=$('#qq').value='';snd.add();toast('✓ Добавлено в подготовку на этот день')},
async qtog(id){const i=planItems().find(x=>x.id===id);if(!i)return;const t=dm()[id];
if(t){if(t.done&&!await ask('Заготовка уже выполнена',`<p>${esc(t.t)} отмечена поваром. Убрать из дня?</p>`,'Да, убрать','Нет'))return;mut('DELETE',`prep/${pd}/${id}`);snd.tap();return}
mut('PUT',`prep/${pd}/${id}`,{t:i.t,q:i.q||'',g:i.g||'main',lid:id,c:Date.now()});snd.add()},
qall(){const m=dm();let n=0;planItems().filter(i=>(i.g||'main')===qg&&!m[i.id]).forEach((i,k)=>{mut('PUT',`prep/${pd}/${i.id}`,{t:i.t,q:i.q||'',g:i.g||'main',lid:i.id,c:Date.now()+k});n++});if(n){snd.ok();toast('✓ Добавлено в день: '+n)}},
qnone(){const m=dm();let n=0;planItems().filter(i=>(i.g||'main')===qg&&m[i.id]&&!m[i.id].done).forEach(i=>{mut('DELETE',`prep/${pd}/${i.id}`);n++});if(n){snd.tap();toast('Убрано из дня: '+n+' (выполненные остаются)')}},
async qdel(id){const i=planItems().find(x=>x.id===id);if(!i||!await ask('Удалить из списка?',`<p>${esc(i.t)}</p><p style="color:var(--mu)">Из уже созданных дней она не удаляется.</p>`,'Да, удалить','Нет'))return;mut('DELETE','plan/items/'+id);snd.warn()},
libnew(){libraryDialog(null)},
libedit(id){const i=libItems().find(x=>x.id===id);if(i)libraryDialog(i)},
libsave(){const raw=$('#llt').value.trim().replace(/\s+/g,' '),q=$('#llq').value.trim().replace(/\s+/g,' '),g=$('#llg').value||'main',oldId=$('#dl').dataset.id||'';if(!raw){snd.warn();toast('Введите название заготовки');$('#llt').focus();return}const duplicate=libItems().find(i=>i.id!==oldId&&nt(i.t)===nt(raw));if(duplicate){snd.warn();toast('Такая заготовка уже есть в истории');return}const old=oldId?libItems().find(i=>i.id===oldId):null,id=oldId||hashText(nt(raw));mut('PUT','prepLibrary/'+id,{t:raw,q,g,by:old&&old.by?old.by:null,usedAt:old&&old.usedAt||Date.now()});$('#dl').close();snd.ok();toast(old?'Изменения сохранены':'Заготовка добавлена в историю');rLibrary()},
async libdelete(id){const i=libItems().find(x=>x.id===id);if(!i||!await ask('Удалить заготовку из истории?',`<p>${esc(i.t)}</p><p style="color:var(--mu)">Записи в днях подготовки останутся без изменений.</p>`,'Да, удалить','Нет'))return;mut('DELETE','prepLibrary/'+id);snd.warn();toast('Удалено из истории')},
libadd(id){const i=libItems().find(x=>x.id===id);if(!i)return;if(Object.values(dm()).some(t=>nt(t.t)===nt(i.t))){snd.warn();toast('Эта заготовка уже есть на выбранный день');return}mut('PUT',`prep/${pd}/${uid()}`,{t:i.t,q:i.q||'',g:i.g||'main',lid:i.id,c:Date.now()});snd.add();toast('✓ Добавлено из истории')}
};
const rAll=()=>{rCooks();rPCooks();rCats();rList();rBar();rPrep();rPlan();rLibrary();rSched();if(tab==='writeoff')rWriteoff()};
$('#dh').addEventListener('close',streams);
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&ACT[b.dataset.a])ACT[b.dataset.a](b.dataset.id);else if(e.target.tagName==='DIALOG'&&!e.target.id.startsWith('dc'))e.target.close()});
document.addEventListener('change',e=>{const t=e.target,d=t.dataset;
if(d.q){const i=L.draft.items[d.q],v=fq(t.value);if(!i)return;if(v){i.qty=v;snd.tap()}else{delete L.draft.items[d.q];snd.warn()}saveL();rep(d.q)}
else if(d.un){const i=L.draft.items[d.un];if(i){i.u=t.value;L.lu[d.un]=t.value;saveL();snd.tap();rep(d.un)}}
else if(d.by){const k=team().find(x=>x.id===t.value);mut('PATCH',`prep/${pd}/${d.by}`,{by:k?{id:k.id,n:k.n}:null});snd.add()}});
let rf;$('#q').addEventListener('input',e=>{qs=e.target.value;cancelAnimationFrame(rf);rf=requestAnimationFrame(rList)});
let wrf;$('#woq').addEventListener('input',e=>{wq=e.target.value;cancelAnimationFrame(wrf);wrf=requestAnimationFrame(rWoProducts)});
$('#woDate').addEventListener('change',e=>{if(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)){wd=e.target.value;streams();rWriteoff()}});
$('#date').addEventListener('change',e=>{L.draft.date=e.target.value||dAdd(1);saveL()});
$('#note').addEventListener('input',e=>{L.draft.note=e.target.value;saveL()});
$('#hq').addEventListener('input',rHist);$('#libq').addEventListener('input',rLibrary);
const setPd=e=>{if(e.target.value){pd=e.target.value;LS.set('vip3-prep-date',pd);streams();rPrep();rPlan()}};$('#pdate').addEventListener('change',setPd);
$('#qt').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.qadd()});
$('#qq').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.qadd()});
$('#qgn').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.qaddg()});
$('#ap').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.login()});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();$('#q').focus()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){streams();flush();try{navigator.serviceWorker.getRegistration().then(r=>r&&r.update())}catch{}}});
addEventListener('online',()=>{retryAt=0;failures=0;streams();flush()});addEventListener('offline',()=>setSt());
setInterval(()=>{if(!DB&&!DEMO)detect().then(()=>{streams();setSt()});flush();if(!document.hidden&&Object.keys(ES).some(k=>ST.open[k]&&Date.now()-(ST.seen[k]||0)>90000))streams()},30000);
syncDraft();rAll();setSt();detect().then(()=>{streams();flush()});
if(AU.rt&&!DEMO)tok().then(()=>{ensureTeamColors();ui()}).catch(()=>{});
})();


if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){const had=!!navigator.serviceWorker.controller;addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!window.__rl){window.__rl=1;location.reload()}})}

(()=>{const i=document.getElementById('inst');let dp;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;i.hidden=false});
const sa=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
if(!sa&&!window.Capacitor&&/iphone|ipad|ipod/i.test(navigator.userAgent))i.hidden=false;
i.onclick=async()=>{if(dp){dp.prompt();try{await dp.userChoice}catch{}dp=null;i.hidden=true}else alert('iPhone: нажмите «Поделиться» → «На экран Домой»')};
addEventListener('appinstalled',()=>{i.hidden=true})})();
