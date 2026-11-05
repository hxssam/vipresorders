(()=>{'use strict';
const CFG=Object.assign({dbUrl:'',projectId:'',apiKey:'',adminEmail:'admin@vip.local'},window.CONFIG||{});
const DEMO=!(CFG.dbUrl||CFG.projectId)||!CFG.apiKey;let DB=String(CFG.dbUrl||'').replace(/\/+$/,'');
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const VER='5.0';
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
let DATA=LS.get('vip3-cache',{}),PC=null,cat='all',qs='',edit=0,pd=dAdd(1),tab='order',qg='main',want='',sm=iso(new Date()).slice(0,7),sf=L.sf||(L.me?L.me.id:'all'),se=0;const ssel=new Set();
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
async function tok(){if(!AU.rt)return'';if(AU.t&&Date.now()<AU.exp-6e4)return AU.t;
const r=await fetch('https://securetoken.googleapis.com/v1/token?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(AU.rt)});
const j=await r.json();if(!r.ok){if(r.status===400){AU={t:'',rt:'',exp:0,ok:false};LS.set('vip3-rt','')}throw new Error('auth')}
AU={t:j.id_token,rt:j.refresh_token,exp:Date.now()+j.expires_in*1000,ok:true};LS.set('vip3-rt',AU.rt);return AU.t}
async function detect(){if(DEMO||DB)return;const p=CFG.projectId;const list=[LS.get('vip3-db',''),`https://${p}-default-rtdb.europe-west1.firebasedatabase.app`,`https://${p}-default-rtdb.firebaseio.com`,`https://${p}-default-rtdb.asia-southeast1.firebasedatabase.app`].filter(Boolean);
for(const u of list){try{const r=await fetch(u+'/.json?shallow=true');if(r.ok||r.status===401||r.status===403){DB=u;LS.set('vip3-db',u);return}}catch{}}}
async function api(m,p,b){if(!DB)throw new Error('nodb');const t=await tok().catch(()=>'');const r=await fetch(`${DB}/${p}.json${t?'?auth='+t:''}`,{method:m,headers:b!==undefined?{'Content-Type':'application/json'}:undefined,body:b!==undefined?JSON.stringify(b):undefined});if(!r.ok){const e=new Error('http');e.status=r.status;throw e}return r}
let fl=0;
async function flush(){if(fl||DEMO||!L.out.length)return;fl=1;
try{while(L.out.length){const o=L.out[0];try{await api(o.m,o.p,o.b)}catch(e){if([400,401,403,404].includes(e.status)){ST.err=ST.lastErr=`HTTP ${e.status} · ${o.m} ${o.p}`;L.out.shift();saveL();snd.warn();toast(e.status===401||e.status===403?'Нет прав. Обновите правила Firebase или войдите как руководитель':'Не сохранено (код '+e.status+')');setSt();continue}throw e}ST.err='';L.out.shift();saveL()}}catch{}fl=0;setSt()}
function mut(m,p,v){put('/'+p,m==='DELETE'?null:v,m==='PATCH');dirty(p.split('/')[0]);if(DEMO){LS.set('vip3-cache',DATA);return}L.out.push({m,p,b:v});saveL();setSt();flush()}
const ES={};
function listen(key,prefix,q){if(DEMO||!DB||!window.EventSource)return;if(ES[key])ES[key].close();
const es=ES[key]=new EventSource(`${DB}/${prefix}.json${q?'?'+q:''}`);ST.open[key]=false;
const on=(t,m)=>es.addEventListener(t,e=>{ST.seen[key]=Date.now();try{const d=JSON.parse(e.data);put('/'+prefix+d.path,d.data,m);dirty(prefix.split('/')[0])}catch{}});
on('put',0);on('patch',1);es.addEventListener('keep-alive',()=>{ST.seen[key]=Date.now()});
es.onopen=()=>{ST.open[key]=true;ST.seen[key]=Date.now();setSt();flush()};
es.onerror=()=>{ST.open[key]=false;setSt();if(es.readyState===2&&ES[key]===es)setTimeout(()=>{if(ES[key]===es)listen(key,prefix,q)},4000)}}
const streams=()=>{listen('team','team');listen('catalog','catalog');listen('orders','orders','orderBy=%22created%22&limitToLast=80');listen('prep','prep/'+pd);listen('plan','plan');listen('sched','sched')};
// ---------- каталог ----------
const cat0=()=>DATA.catalog||{};
const prods=()=>PC||(PC=[...base.filter(p=>!(cat0().hidden||{})[ek(p.id)]).map(p=>{const e=(cat0().edits||{})[ek(p.id)];return e?{...p,n:e.n||p.n,u:e.u||p.u}:p}),...Object.entries(cat0().custom||{}).map(([k,v])=>({id:'c:'+k,k,n:v.n,c:v.c,u:v.u}))].sort((a,b)=>a.n.localeCompare(b.n,'ru')));
const cats=()=>[...BASE.map(([id,n,e])=>({id,n,e})),...Object.entries(cat0().groups||{}).map(([k,v])=>({id:k,n:v.n,e:'📦',g:1}))];
const team=()=>Object.entries(DATA.team||{}).map(([id,v])=>({id,n:v.n,r:v.r})).sort((a,b)=>a.n.localeCompare(b.n,'ru'));
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
const rTeam=()=>{$('#tl').innerHTML=team().length?team().map(k=>`<div class="it"><div class="n">${esc(k.n)}<i>${esc(k.r)}</i></div><button class="x" data-a="delc" data-id="${k.id}">✕</button></div>`).join(''):'<div class="em">Добавьте поваров с должностями</div>'};
const rAdm=()=>{const b=$('#edb');b.textContent='Режим правки товаров: '+(ed()?'ВКЛ':'выкл');b.className=ed()?'d':'';const h=Object.keys(cat0().hidden||{}).length,u=$('#unh');u.textContent='Вернуть скрытые ('+h+')';u.disabled=!h};
const nt=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const dm=()=>(DATA.prep||{})[pd]||{},dayTasks=()=>Object.values(dm());
const pgroups=()=>[{id:'main',n:'Основные'},{id:'banq',n:'Банкет'},...Object.entries((DATA.plan||{}).groups||{}).map(([id,v])=>({id,n:v.n}))];
const gname=g=>(pgroups().find(x=>x.id===g)||{n:'Другое'}).n;
const planItems=()=>Object.entries((DATA.plan||{}).items||{}).map(([id,v])=>({id,...v})).filter(i=>i.t);
const rPrep=()=>{const ts=Object.entries((DATA.prep||{})[pd]||{}).map(([id,v])=>({id,...v}));
const dn=ts.filter(t=>t.done).sort((a,b)=>(b.at||0)-(a.at||0)),gi=g=>Math.max(0,pgroups().findIndex(x=>x.id===(g||'main'))),td=ts.filter(t=>!t.done).sort((a,b)=>gi(a.g)-gi(b.g)||(a.c||0)-(b.c||0)),k=team();
const sel=t=>`<select class="who" data-by="${t.id}"><option value="">Кто?</option>${k.map(c=>`<option value="${c.id}"${t.by&&t.by.id===c.id?' selected':''}>${esc(c.n)}</option>`).join('')}${t.by&&!k.some(c=>c.id===t.by.id)?`<option value="${esc(t.by.id)}" selected>${esc(t.by.n)}</option>`:''}</select>`;
const r=t=>`<div class="pr${t.done?' ok':''}"><button class="ck" data-a="ptog" data-id="${t.id}" aria-label="Отметить">${t.done?'✓':''}</button><div class="pn"><b>${esc(t.t)}</b>${t.g&&t.g!=='main'?`<em>${esc(gname(t.g))}</em>`:''}${t.q?`<i>${esc(t.q)}</i>`:''}${t.done&&t.by?`<small>✓ ${esc(t.by.n)} · ${tm(t.at)}</small>`:''}</div>${sel(t)}<button class="x" data-a="pdel" data-id="${t.id}" aria-label="Удалить">✕</button></div>`;
$('#plist').innerHTML=ts.length?(dn.length?`<div class="gh">Выполнено · ${dn.length}</div>`+dn.map(r).join(''):'')+(td.length?`<div class="gh">Осталось · ${td.length}</div>`+td.map(r).join(''):''):'<div class="em">На этот день заготовок нет.<br>Добавьте первую выше.</div>';
$('#pfill').style.width=ts.length?Math.round(dn.length/ts.length*100)+'%':'0%';$('#pinfo').textContent=`${day(pd)} · выполнено ${dn.length} из ${ts.length}`;
$('#pdate').value=pd;$('#pd0').className='chip'+(pd===dAdd(0)?' on':'');$('#pd1').className='chip'+(pd===dAdd(1)?' on':'')};
const rPlan=()=>{const gs=pgroups(),its=planItems(),m=dm();
$('#qgroups').innerHTML=gs.map(g=>`<button class="chip${qg===g.id?' on':''}" data-a="qgrp" data-id="${g.id}">${esc(g.n)}<small>${its.filter(i=>(i.g||'main')===g.id).length} в списке · ${Object.values(m).filter(t=>(t.g||'main')===g.id).length} на день</small></button>`).join('')+`<button class="chip" data-a="qnewg">＋ Группа</button>`+(!['main','banq'].includes(qg)?`<button class="chip" style="color:var(--rd)" data-a="qdelg">🗑 Удалить группу</button>`:'');
const li=its.filter(i=>(i.g||'main')===qg).sort((a,b)=>a.t.localeCompare(b.t,'ru'));
$('#qlist').innerHTML=li.length?li.map(i=>{const on=!!m[i.id];return `<div class="it${on?' on':''}"><button class="ck" data-a="qtog" data-id="${i.id}" aria-label="Показать поварам">${on?'✓':''}</button><div class="n">${esc(i.t)}${i.q?`<i>${esc(i.q)}</i>`:''}</div><button class="x" data-a="qdel" data-id="${i.id}" aria-label="Удалить из списка">✕</button></div>`}).join(''):'<div class="em">В этой группе пока пусто.<br>Добавьте заготовки выше.</div>';
$('#qinfo').textContent=`${day(pd)} · показано поварам: ${Object.keys(m).length}`;$('#qdate').value=pd;$('#qd0').className='chip'+(pd===dAdd(0)?' on':'');$('#qd1').className='chip'+(pd===dAdd(1)?' on':'');$('#qcp').hidden=Object.keys(m).length>0};
const P2=n=>String(n).padStart(2,'0'),SC=()=>DATA.sched||{};
const rSched=()=>{const k=team(),S=SC(),ed2=se&&isAdmin();if(sf!=='all'&&!k.some(c=>c.id===sf))sf='all';
$('#sfilter').innerHTML=`<button class="chip${sf==='all'?' on':''}" data-a="sfil" data-id="all">Все</button>`+k.map(c=>`<button class="chip${sf===c.id?' on':''}" data-a="sfil" data-id="${c.id}">${esc(c.n)}<small>${esc(c.r)}</small></button>`).join('');
const[y,m]=sm.split('-').map(Number),off=(new Date(y,m-1,1,12).getDay()+6)%7,dim=new Date(y,m,0).getDate(),today=dAdd(0);
$('#smt').textContent=new Date(y,m-1,1,12).toLocaleDateString('ru',{month:'long',year:'numeric'});
let c='';for(let i=0;i<off;i++)c+='<i></i>';
for(let d=1;d<=dim;d++){const dt=`${y}-${P2(m)}-${P2(d)}`;let inner='',has=0;
if(sf==='all'){const n=k.filter(x=>S[x.id]&&S[x.id][dt]).length;has=n;inner=n?`<small>${n} чел.</small>`:''}
else{const s=(S[sf]||{})[dt];has=!!s;inner=s?`<small>${esc(s.f)}<br>${esc(s.t)}</small>`:''}
c+=`<button class="dc${has?' wk':''}${dt===today?' td':''}${ssel.has(dt)?' sl':''}" data-a="sday" data-id="${dt}"><b>${d}</b>${inner}</button>`}
$('#sgrid').innerHTML=c;
let l='',shown=0;const lim=sf==='all'?10:16;
for(let i=0;i<90&&shown<lim;i++){const dt=dAdd(i),t=dt===today?' · сегодня':'';
if(sf==='all'){const rows=k.filter(x=>S[x.id]&&S[x.id][dt]);if(rows.length){shown++;l+=`<div class="sh"><b>${esc(day(dt))}${t}</b>${rows.map(x=>`<div>${esc(x.n)} <span>${esc(S[x.id][dt].f)}–${esc(S[x.id][dt].t)}</span></div>`).join('')}</div>`}}
else{const s=(S[sf]||{})[dt];if(s){shown++;l+=`<div class="sh"><b>${esc(day(dt))}${t}</b><div><span>${esc(s.f)}–${esc(s.t)}</span></div></div>`}}}
$('#slist').innerHTML=l||'<div class="em">Ближайших смен нет.</div>';
$('#sedit').hidden=!ed2;$('#sbtn').textContent=ed2?'✓ Готово':'✎ Править график';
const cc=k.find(x=>x.id===sf);$('#sedinfo').textContent=sf==='all'?'Выберите повара выше, чтобы назначить ему смены':`${cc?cc.n:''}: выбрано дней — ${ssel.size}. Нажимайте на дни в календаре.`};
const rDiag=()=>{const o=Object.keys(ES).map(k=>k+':'+(ST.open[k]?'✓':'✗')).join('  ');
$('#dinfo').textContent=[`Версия: ${VER}`,`Режим: ${DEMO?'ДЕМО (config.js не заполнен)':'облако'}`,`База: ${DB||'не найдена'}`,`Потоки: ${o||'—'}`,`В очереди на отправку: ${L.out.length}`,`Последняя ошибка: ${ST.lastErr||'нет'}`,`Телефон в сети: ${navigator.onLine?'да':'нет'}`,`Повара: ${team().length} · заказы: ${ords().length} · заготовок на день: ${Object.keys(dm()).length}`,`Устройство: ${DEV}`].join('\n');$('#dlog').textContent=''};
const rHist=()=>{const q=$('#hq').value.trim().toLowerCase();const l=ords().filter(o=>!q||(o.cook.n+' '+o.date+' '+day(o.date)+' '+o.items.map(i=>i.n).join(' ')).toLowerCase().includes(q));
$('#hl').innerHTML=l.length?l.map(o=>`<div class="hc"><b>${esc(day(o.date))} · ${esc(o.cook.n)}</b><small>${esc(o.cook.r)} · ${o.items.length} поз. · ${new Date(o.created).toLocaleDateString('ru')} ${tm(o.created)}${o.copied?' · ✓ скопирован':' · не скопирован'}</small><div style="font-size:13px;margin-top:4px">${esc(o.items.slice(0,5).map(i=>i.n).join(', '))}${o.items.length>5?'…':''}</div><div class="acts"><button data-a="open" data-id="${o.id}">Открыть и править</button><button data-a="hcopy" data-id="${o.id}">Копировать</button><button class="d" data-a="hdel" data-id="${o.id}">Удалить</button></div></div>`).join(''):'<div class="em">История пока пуста</div>'};
function render(){raf=0;const d={...D};for(const k in D)delete D[k];
if(d.team){rCooks();rPCooks();rPrep();rSched();if($('#dt').open)rTeam()}
if(d.sched)rSched();
if(d.catalog){syncDraft();rCats();rList();rBar();if($('#dt').open)rAdm()}
if(d.orders&&$('#dh').open)rHist();
if(d.prep||d.plan){rPrep();rPlan()}
clearTimeout(ct);ct=setTimeout(()=>LS.set('vip3-cache',DATA),800)}
// ---------- заказ ----------
const msg=o=>{const L2=[`🧾 Заказ на ${day(o.date)}`,`👨‍🍳 ${o.cook.n}, ${o.cook.r}`,`🕒 оформлен в ${tm(o.created)}`,''];
const cs=[...BASE,...Object.entries(cat0().groups||{}).map(([k,v])=>[k,v.n,'📦'])],seen=new Set(),ln=i=>`• ${i.n} — ${fmtQ(i.qty)} ${i.u}`;
for(const[id,n,e]of cs){const g=o.items.filter(i=>i.c===id);if(!g.length)continue;g.forEach(i=>seen.add(i.id));L2.push(`${e} ${n}`,g.sort((a,b)=>a.n.localeCompare(b.n,'ru')).map(ln).join('\n'),'')}
const r=o.items.filter(i=>!seen.has(i.id));if(r.length)L2.push('📦 Другое',r.map(ln).join('\n'),'');
if(o.note)L2.push('💬 '+o.note,'');L2.push(`Всего: ${o.items.length} поз.`);return L2.join('\n')};
const snap=()=>{const d=L.draft,old=d.editId&&ords().find(o=>o.id===d.editId);return{id:d.editId||'o'+uid(),created:old?old.created:Date.now(),updated:Date.now(),date:d.date,cook:d.cook,note:d.note.trim(),items:dI().map(i=>({...i})),copied:old?!!old.copied:false}};
const valid=()=>{if(!cnt()){snd.warn();vib(80);toast('Добавьте хотя бы один товар');return 0}if(!L.draft.cook){snd.warn();vib(80);toast('Выберите повара');$('#dr').close();$('#cooks').classList.add('bad');setTimeout(()=>$('#cooks').classList.remove('bad'),1500);window.scrollTo({top:0,behavior:'smooth'});return 0}return 1};
const upsert=o=>mut('PUT','orders/'+o.id,o);
const ask=(t,h,y='Да',n='Нет, вернуться')=>new Promise(res=>{const d=$('#dc');$('#ct').textContent=t;$('#cb').innerHTML=h;$('#cy').textContent=y;$('#cn').textContent=n;snd.ask();vib(40);const f=v=>()=>{d.close();res(v)};$('#cy').onclick=f(true);$('#cn').onclick=f(false);d.oncancel=()=>res(false);d.showModal()});
const clip=async t=>{try{await navigator.clipboard.writeText(t);return 1}catch{try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.append(a);a.select();const ok=document.execCommand('copy');a.remove();return ok}catch{return 0}}};
const copyOrder=async()=>{if(!valid())return;const o=snap();const yes=await ask('Вы уверены?',`<p style="margin:0 0 10px;color:var(--mu)">Проверьте сообщение. Если что-то не так — вернитесь и исправьте.</p><pre class="msg">${esc(msg(o))}</pre>`,'Да, копировать','Нет, вернуться');if(!yes)return;
if(!await clip(msg(o))){snd.warn();toast('Не удалось скопировать. Разрешите доступ к буферу');return}
o.copied=true;upsert(o);L.draft=blank(L.draft.cook);saveL();$('#dr').close();rAll();snd.ok();vib([60,40,60]);toast('✓ Скопировано и сохранено в истории')};
const saveOrder=()=>{if(!valid())return;const o=snap();upsert(o);L.draft.editId=o.id;saveL();snd.ok();toast('✓ Сохранено для всех. Можно редактировать')};
const open=id=>{rRev();$(id).showModal()};
const need=()=>{snd.warn();toast('Нужен вход в админ-панель');ACT.admin()};
const rep=id=>{const p=prods().find(x=>x.id===id),r=document.querySelector(`[data-r="${CSS.escape(id)}"]`);if(p&&r)r.outerHTML=row(p);rBar();if($('#dr').open)rRev()};
const ui=()=>{rCats();rList();rAdm();$('#tabPlan').innerHTML=`<span>${isAdmin()?'🗂':'🔒'}</span>План`;rSched()};
const afterLogin=()=>{ui();if(want){const w=want;want='';if(w==='sedit'){ACT.tab('sched');se=1;rSched()}else ACT.tab(w)}else{rTeam();rAdm();$('#dt').showModal()}};
const authErr=m=>/TOO_MANY/.test(m)?'Google временно ограничил вход. Подождите и повторите':/CREDENTIAL_TOO_OLD/.test(m)?'Войдите заново и повторите':'Неверный пароль';
const ACT={
async login(){const pw=$('#ap').value;if(DEMO){AU.ok=true;$('#da').close();afterLogin();toast('Демо-режим: облако не настроено');return}
try{const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:CFG.adminEmail,password:pw,returnSecureToken:true})});const j=await r.json();
if(!r.ok){snd.warn();vib(120);toast(authErr(j.error&&j.error.message||''));return}
AU={t:j.idToken,rt:j.refreshToken,exp:Date.now()+j.expiresIn*1000,ok:true};LS.set('vip3-rt',AU.rt);$('#da').close();snd.ok();afterLogin()}catch{snd.warn();toast('Нет интернета')}},
async setpw(){const v=$('#npw').value;if(v.length<6){snd.warn();toast('Пароль — минимум 6 символов');return}if(DEMO){toast('В демо-режиме пароля нет');return}
try{const t=await tok();const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:update?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:t,password:v,returnSecureToken:true})});const j=await r.json();
if(!r.ok){snd.warn();toast(authErr(j.error&&j.error.message||''));return}
AU={t:j.idToken,rt:j.refreshToken,exp:Date.now()+j.expiresIn*1000,ok:true};LS.set('vip3-rt',AU.rt);$('#npw').value='';snd.ok();toast('✓ Пароль изменён')}catch{snd.warn();toast('Не удалось. Проверьте сеть')}},
logout(){AU={t:'',rt:'',exp:0,ok:false};LS.set('vip3-rt','');edit=0;$('#dt').close();ui();if(tab==='plan')ACT.tab('order');snd.tap()},
admin(){snd.tap();$('#dh').close();want='';if(isAdmin()){rTeam();rAdm();$('#dt').showModal()}else{$('#ap').value='';$('#da').showModal();$('#ap').focus()}},
toggled(){edit=!edit;ui();snd.tap()},
unhide(){if(!isAdmin())return need();mut('DELETE','catalog/hidden');snd.ok()},
tab(id){if(id==='plan'&&!isAdmin()){want='plan';snd.tap();$('#ap').value='';$('#da').showModal();$('#ap').focus();return}tab=id;snd.tap();$('#vOrder').hidden=id!=='order';$('#vPrep').hidden=id!=='prep';$('#vPlan').hidden=id!=='plan';$('#vSched').hidden=id!=='sched';$('#bar').hidden=id!=='order';document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.id===id));if(id==='prep')rPrep();if(id==='plan')rPlan();if(id==='sched')rSched()},
add(id){const p=prods().find(x=>x.id===id);if(!p)return;L.draft.items[id]={id,n:p.n,c:p.c,u:L.lu[id]||p.u,qty:1};saveL();snd.add();vib(20);rep(id)},
inc(id){const i=L.draft.items[id];if(i){i.qty=Math.round((i.qty+1)*100)/100;saveL();snd.tap();rep(id)}},
dec(id){const i=L.draft.items[id];if(!i)return;i.qty=Math.round((i.qty-1)*100)/100;if(i.qty<=0){delete L.draft.items[id];snd.warn()}else snd.tap();saveL();rep(id)},
rm(id){delete L.draft.items[id];saveL();snd.warn();rep(id)},
pick(id){const k=team().find(x=>x.id===id);L.draft.cook=k;L.me=k;saveL();snd.add();rCooks();rPCooks()},
me(id){L.me=team().find(x=>x.id===id);saveL();snd.add();rPCooks()},
cat(id){cat=id;snd.tap();rCats();rList()},
review(){snd.tap();open('#dr')},close(){snd.tap();document.querySelectorAll('dialog[open]').forEach(d=>d.close())},
copy:copyOrder,save:saveOrder,
async clear(){if(!cnt())return;if(await ask('Очистить список?','<p>Все выбранные товары будут убраны из текущего заказа.</p>','Да, очистить','Нет, оставить')){L.draft=blank(L.draft.cook);saveL();rAll();rRev();snd.warn()}},
hist(){snd.tap();rHist();$('#dh').showModal()},
addcook(){if(!isAdmin())return need();const n=$('#tn').value.trim(),r=$('#tr').value.trim();if(!n||!r){snd.warn();toast('Укажите имя и должность');return}mut('PUT','team/'+uid(),{n,r});$('#tn').value=$('#tr').value='';snd.ok();$('#tn').focus();rTeam()},
async delc(id){if(!isAdmin())return need();const k=team().find(x=>x.id===id);if(!k||!await ask('Удалить сотрудника?',`<p>${esc(k.n)} — ${esc(k.r)}</p>`,'Да, удалить','Нет'))return;mut('DELETE','team/'+id);mut('DELETE','sched/'+id);if(L.draft.cook&&L.draft.cook.id===id)L.draft.cook=null;saveL();rTeam();rCooks()},
newp(){snd.tap();$('#pc').innerHTML=cats().map(c=>`<option value="${c.id}">${esc(c.n)}</option>`).join('');$('#pc').value=cat!=='all'&&cats().some(c=>c.id===cat)?cat:'sauces';$('#pu').innerHTML=UNITS.map(u=>`<option>${u}</option>`).join('');$('#pn').value='';$('#dp').showModal();$('#pn').focus()},
addprod(){const n=$('#pn').value.trim().replace(/\s+/g,' ');if(!n){snd.warn();toast('Введите название');return}const c=$('#pc').value,u=$('#pu').value;if(prods().some(p=>p.c===c&&p.n.toLowerCase()===n.toLowerCase())){snd.warn();toast('Такой товар уже есть в этой группе');return}
const k='p'+uid(),nm=n[0].toUpperCase()+n.slice(1);mut('PUT','catalog/custom/'+k,{n:nm,c,u});const id='c:'+k;L.draft.items[id]={id,n:nm,c,u,qty:1};saveL();$('#dp').close();cat=c;qs='';$('#q').value='';rAll();snd.ok();toast('✓ Добавлен для всех в «'+cats().find(x=>x.id===c).n+'»');setTimeout(()=>{const e=document.querySelector(`[data-r="${CSS.escape(id)}"]`);e&&e.scrollIntoView({block:'center',behavior:'smooth'})},50)},
editp(id){if(!isAdmin())return need();const p=prods().find(x=>x.id===id);if(!p)return;$('#en').value=p.n;$('#eu').innerHTML=(UNITS.includes(p.u)?UNITS:[...UNITS,p.u]).map(u=>`<option${u===p.u?' selected':''}>${esc(u)}</option>`).join('');$('#de').dataset.id=id;snd.tap();$('#de').showModal()},
saveprod(){if(!isAdmin())return need();const id=$('#de').dataset.id,n=$('#en').value.trim().replace(/\s+/g,' '),u=$('#eu').value;if(!n){snd.warn();toast('Введите название');return}const p=prods().find(x=>x.id===id);if(!p)return;
mut('PATCH',p.k?'catalog/custom/'+p.k:'catalog/edits/'+ek(id),{n,u});L.lu[id]=u;saveL();$('#de').close();snd.ok();toast('✓ Сохранено для всех')},
async delp(id){if(!isAdmin())return need();const p=prods().find(x=>x.id===id);if(!p||!await ask('Удалить товар?',`<p>${esc(p.n)} будет удалён из каталога у всех.</p>`,'Да, удалить','Нет'))return;if(p.k)mut('DELETE','catalog/custom/'+p.k);else mut('PUT','catalog/hidden/'+ek(id),true);delete L.draft.items[id];saveL();rAll();snd.warn()},
newg(){snd.tap();$('#gn').value='';$('#dg').showModal();$('#gn').focus()},
addgrp(){const n=$('#gn').value.trim();if(!n){snd.warn();toast('Введите название группы');return}if(cats().some(c=>c.n.toLowerCase()===n.toLowerCase())){snd.warn();toast('Такая группа уже есть');return}const k='g'+uid();mut('PUT','catalog/groups/'+k,{n});cat=k;$('#dg').close();rAll();snd.ok()},
async delg(){if(!isAdmin())return need();const g=cats().find(x=>x.id===cat&&x.g);if(!g)return;const ps=prods().filter(p=>p.c===g.id);if(!await ask('Удалить группу?',`<p>«${esc(g.n)}»${ps.length?` и товаров в ней: ${ps.length}`:''} будут удалены у всех.</p>`,'Да, удалить','Нет'))return;ps.forEach(p=>{mut('DELETE','catalog/custom/'+p.k);delete L.draft.items[p.id]});mut('DELETE','catalog/groups/'+g.id);cat='all';saveL();rAll();snd.warn()},
async open(id){const o=ords().find(x=>x.id===id);if(!o)return;if(cnt()&&L.draft.editId!==id&&!await ask('Заменить текущий заказ?','<p>Несохранённый черновик будет заменён выбранным заказом из истории.</p>','Да, открыть','Нет, вернуться'))return;
L.draft={cook:o.cook,date:o.date,note:o.note||'',items:Object.fromEntries(o.items.map(i=>[i.id,{...i}])),editId:o.id};saveL();$('#dh').close();rAll();snd.ok();toast('Заказ открыт. Правьте и копируйте снова')},
async hcopy(id){const o=ords().find(x=>x.id===id);if(o&&await clip(msg(o))){mut('PATCH','orders/'+id,{copied:true});rHist();snd.ok();toast('✓ Скопировано')}else{snd.warn();toast('Не удалось скопировать')}},
async hdel(id){if(!isAdmin())return need();if(!await ask('Удалить заказ?','<p>Заказ будет удалён из истории у всех.</p>','Да, удалить','Нет'))return;mut('DELETE','orders/'+id);if(L.draft.editId===id)L.draft.editId=null;saveL();rHist();snd.warn()},
// заготовки
pday(n){pd=dAdd(+n);streams();rPrep();rPlan();snd.tap()},
ptog(id){const t=((DATA.prep||{})[pd]||{})[id];if(!t)return;const p=`prep/${pd}/${id}`;
if(t.done){mut('PATCH',p,{done:null,at:null});snd.tap();return}
const w=t.by||L.me;if(!w){snd.warn();vib(80);toast('Выберите повара справа или вверху «Я работаю»');const s=document.querySelector(`[data-by="${id}"]`);if(s){s.classList.add('bad');setTimeout(()=>s.classList.remove('bad'),1500)}return}
mut('PATCH',p,{done:true,by:{id:w.id,n:w.n},at:Date.now()});snd.ok();vib(30)},
async pdel(id){const t=((DATA.prep||{})[pd]||{})[id];if(!t||!await ask('Удалить заготовку?',`<p>${esc(t.t)}</p>`,'Да, удалить','Нет'))return;mut('DELETE',`prep/${pd}/${id}`);snd.warn()},
async pcopy(){const prev=dAdd(-1,pd);let src=(DATA.prep||{})[prev];if(!src&&!DEMO){try{src=await(await api('GET','prep/'+prev)).json()}catch{toast('Нет сети');return}}
const es=Object.entries(src||{}).sort((a,b)=>(a[1].c||0)-(b[1].c||0));if(!es.length){snd.warn();toast('За вчера списка нет');return}
const m=dm();let n=0;es.forEach(([k,t],i)=>{if(m[k])return;mut('PUT',`prep/${pd}/${k}`,{t:t.t,q:t.q||'',g:t.g||'main',...(t.lid?{lid:t.lid}:{}),c:Date.now()+i});n++});snd.ok();toast('✓ Скопировано: '+n)},
// график работы
sfil(id){sf=id;L.sf=id;ssel.clear();saveL();snd.tap();rSched()},
smon(n){const[y,m]=sm.split('-').map(Number);sm=iso(new Date(y,m-1+(+n),1,12)).slice(0,7);snd.tap();rSched()},
sedit(){if(!isAdmin()){want='sedit';snd.tap();$('#ap').value='';$('#da').showModal();$('#ap').focus();return}se=!se;ssel.clear();snd.tap();rSched()},
sday(dt){if(!(se&&isAdmin()&&sf!=='all'))return;ssel.has(dt)?ssel.delete(dt):ssel.add(dt);snd.tap();rSched()},
sapply(){if(!isAdmin())return need();const f=$('#sfrom').value,t=$('#sto').value;if(sf==='all'){snd.warn();toast('Сначала выберите повара');return}if(!ssel.size){snd.warn();toast('Выберите дни в календаре');return}if(!f||!t){snd.warn();toast('Укажите начало и конец смены');return}
L.sh={f,t};saveL();const n=ssel.size;ssel.forEach(dt=>mut('PUT',`sched/${sf}/${dt}`,{f,t}));ssel.clear();snd.ok();toast('✓ Смены назначены: '+n);rSched()},
sclear(){if(!isAdmin())return need();if(sf==='all'||!ssel.size){snd.warn();toast('Выберите повара и дни');return}const n=ssel.size;ssel.forEach(dt=>mut('DELETE',`sched/${sf}/${dt}`));ssel.clear();snd.warn();toast('Смены убраны: '+n);rSched()},
// диагностика
diag(){snd.tap();rDiag();$('#dd').showModal()},
async dtest(){const out=[],log=s=>{out.push(s);$('#dlog').textContent=out.join('\n')};if(DEMO){log('Демо-режим: config.js не заполнен');return}
if(!DB){await detect();log('Поиск базы: '+(DB||'не найдена'));if(!DB)return}log('База: '+DB);
try{const r=await fetch(DB+'/.json?shallow=true');log('Чтение: HTTP '+r.status)}catch(e){log('Чтение: нет связи')}
const u=`${DB}/prep/_ping/${DEV}.json`;try{const r=await fetch(u,{method:'PUT',body:JSON.stringify({t:Date.now()})});log('Запись: HTTP '+r.status);const g=await fetch(u);log('Проверка записи: HTTP '+g.status);await fetch(u,{method:'DELETE'})}catch(e){log('Запись: нет связи')}
log('Потоки: '+Object.keys(ES).map(x=>x+(ST.open[x]?' ✓':' ✗')).join(', '));log('Если везде 200 и потоки ✓ — всё работает.')},
dre(){snd.tap();Object.keys(ES).forEach(k=>ES[k].close());if(!CFG.dbUrl){DB='';LS.set('vip3-db','')}setSt();detect().then(()=>{streams();flush();setSt();setTimeout(rDiag,2000)})},
async dclr(){if(!await ask('Сбросить кэш?','<p>Очистятся временные данные этого телефона и приложение перезагрузится. Данные в облаке не затрагиваются.</p>','Да, сбросить','Нет'))return;try{LS.set('vip3-cache',{});LS.set('vip3-db','');const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()))}catch{}location.reload()},
// план заготовок (только руководитель)
qgrp(id){qg=id;snd.tap();rPlan()},
qnewg(){if(!isAdmin())return need();snd.tap();$('#qgn').value='';$('#dq').showModal();$('#qgn').focus()},
qaddg(){if(!isAdmin())return need();const n=$('#qgn').value.trim();if(!n){snd.warn();toast('Введите название группы');return}if(pgroups().some(g=>nt(g.n)===nt(n))){snd.warn();toast('Такая группа уже есть');return}const k='q'+uid();mut('PUT','plan/groups/'+k,{n});qg=k;$('#dq').close();snd.ok();rPlan()},
async qdelg(){if(!isAdmin())return need();const g=pgroups().find(x=>x.id===qg);if(!g||g.id==='main'||g.id==='banq')return;const its=planItems().filter(i=>(i.g||'main')===g.id);if(!await ask('Удалить группу?',`<p>«${esc(g.n)}»${its.length?` и заготовок в ней: ${its.length}`:''} будут удалены.</p>`,'Да, удалить','Нет'))return;its.forEach(i=>mut('DELETE','plan/items/'+i.id));mut('DELETE','plan/groups/'+g.id);qg='main';snd.warn();rPlan()},
qadd(){if(!isAdmin())return need();const t=$('#qt').value.trim().replace(/\s+/g,' '),q=$('#qq').value.trim();if(!t){snd.warn();toast('Напишите название заготовки');$('#qt').focus();return}if(planItems().some(i=>(i.g||'main')===qg&&nt(i.t)===nt(t))){snd.warn();toast('Такая заготовка уже есть в этой группе');return}mut('PUT','plan/items/'+uid(),{t,q,g:qg});$('#qt').value=$('#qq').value='';snd.ok();toast('Добавлено в список. Отметьте ✓, чтобы показать поварам');$('#qt').focus()},
qone(){if(!isAdmin())return need();const t=$('#qt').value.trim().replace(/\s+/g,' '),q=$('#qq').value.trim();if(!t){snd.warn();toast('Напишите название заготовки');$('#qt').focus();return}mut('PUT',`prep/${pd}/${uid()}`,{t,q,g:qg,c:Date.now()});$('#qt').value=$('#qq').value='';snd.add();toast('✓ Показано поварам только на этот день')},
async qtog(id){if(!isAdmin())return need();const i=planItems().find(x=>x.id===id);if(!i)return;const t=dm()[id];
if(t){if(t.done&&!await ask('Заготовка уже выполнена',`<p>${esc(t.t)} отмечена поваром. Убрать из дня?</p>`,'Да, убрать','Нет'))return;mut('DELETE',`prep/${pd}/${id}`);snd.tap();return}
mut('PUT',`prep/${pd}/${id}`,{t:i.t,q:i.q||'',g:i.g||'main',lid:id,c:Date.now()});snd.add()},
qall(){if(!isAdmin())return need();const m=dm();let n=0;planItems().filter(i=>(i.g||'main')===qg&&!m[i.id]).forEach((i,k)=>{mut('PUT',`prep/${pd}/${i.id}`,{t:i.t,q:i.q||'',g:i.g||'main',lid:i.id,c:Date.now()+k});n++});if(n){snd.ok();toast('✓ Показано поварам: '+n)}},
qnone(){if(!isAdmin())return need();const m=dm();let n=0;planItems().filter(i=>(i.g||'main')===qg&&m[i.id]&&!m[i.id].done).forEach(i=>{mut('DELETE',`prep/${pd}/${i.id}`);n++});if(n){snd.tap();toast('Убрано из дня: '+n+' (выполненные остаются)')}},
async qdel(id){if(!isAdmin())return need();const i=planItems().find(x=>x.id===id);if(!i||!await ask('Удалить из списка?',`<p>${esc(i.t)}</p><p style="color:var(--mu)">Из уже созданных дней она не удаляется.</p>`,'Да, удалить','Нет'))return;mut('DELETE','plan/items/'+id);snd.warn()}
};
const rAll=()=>{rCooks();rPCooks();rCats();rList();rBar();rPrep();rPlan();rSched()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&ACT[b.dataset.a])ACT[b.dataset.a](b.dataset.id);else if(e.target.tagName==='DIALOG'&&!e.target.id.startsWith('dc'))e.target.close()});
document.addEventListener('change',e=>{const t=e.target,d=t.dataset;
if(d.q){const i=L.draft.items[d.q],v=fq(t.value);if(!i)return;if(v){i.qty=v;snd.tap()}else{delete L.draft.items[d.q];snd.warn()}saveL();rep(d.q)}
else if(d.un){const i=L.draft.items[d.un];if(i){i.u=t.value;L.lu[d.un]=t.value;saveL();snd.tap();rep(d.un)}}
else if(d.by){const k=team().find(x=>x.id===t.value);mut('PATCH',`prep/${pd}/${d.by}`,{by:k?{id:k.id,n:k.n}:null});snd.add()}});
let rf;$('#q').addEventListener('input',e=>{qs=e.target.value;cancelAnimationFrame(rf);rf=requestAnimationFrame(rList)});
$('#date').addEventListener('change',e=>{L.draft.date=e.target.value||dAdd(1);saveL()});
$('#note').addEventListener('input',e=>{L.draft.note=e.target.value;saveL()});
$('#hq').addEventListener('input',rHist);
const setPd=e=>{if(e.target.value){pd=e.target.value;streams();rPrep();rPlan()}};$('#pdate').addEventListener('change',setPd);$('#qdate').addEventListener('change',setPd);
$('#qt').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.qadd()});
$('#qq').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.qadd()});
$('#qgn').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.qaddg()});
$('#sfrom').value=(L.sh||{}).f||'18:00';$('#sto').value=(L.sh||{}).t||'02:00';
$('#ap').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.login()});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();$('#q').focus()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){streams();flush();try{navigator.serviceWorker.getRegistration().then(r=>r&&r.update())}catch{}}});
addEventListener('online',()=>{streams();flush()});addEventListener('offline',()=>setSt());
setInterval(()=>{if(!DB&&!DEMO)detect().then(()=>{streams();setSt()});flush();if(!document.hidden&&Object.keys(ES).some(k=>ST.open[k]&&Date.now()-(ST.seen[k]||0)>90000))streams()},15000);
syncDraft();rAll();setSt();detect().then(()=>{streams();flush()});
if(AU.rt&&!DEMO)tok().then(()=>{ui()}).catch(()=>{});
})();


if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){const had=!!navigator.serviceWorker.controller;addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!window.__rl){window.__rl=1;location.reload()}})}

(()=>{const i=document.getElementById('inst');let dp;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;i.hidden=false});
const sa=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
if(!sa&&!window.Capacitor&&/iphone|ipad|ipod/i.test(navigator.userAgent))i.hidden=false;
i.onclick=async()=>{if(dp){dp.prompt();try{await dp.userChoice}catch{}dp=null;i.hidden=true}else alert('iPhone: нажмите «Поделиться» → «На экран Домой»')};
addEventListener('appinstalled',()=>{i.hidden=true})})();
