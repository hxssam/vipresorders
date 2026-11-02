(()=>{'use strict';
const CFG=window.CONFIG||{adminHash:'',v:1,team:[]};
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
const KEY='vip-order-v2';
const tom=()=>{const d=new Date();d.setDate(d.getDate()+1);return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const blank=cook=>({cook:cook||null,date:tom(),note:'',items:{},editId:null});
let S={cooks:[],custom:[],groups:[],orders:[],hidden:[],teamV:0,draft:blank()};
try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&r.draft)S={...S,...r}}catch{}
if(!S.draft.date)S.draft.date=tom();
let cat='all',qs='',st;
const base=[];BASE.forEach(([id])=>CAT[id].split(';').forEach(e=>{const[n,u]=e.split('|');base.push({id:'b:'+id+':'+n,n,c:id,u})}));
const NM=new Map(base.map(p=>[p.n,p])),UF=u=>String(u||'').replace(/\.$/,'');
const fix=i=>{const p=NM.get(i.n);if(p&&String(i.id).startsWith('b:')){i.id=p.id;i.c=p.c}i.u=UF(i.u);return i};
S.draft.items=Object.fromEntries(Object.values(S.draft.items||{}).map(i=>{fix(i);return[i.id,i]}));
S.orders.forEach(o=>o.items.forEach(fix));S.custom.forEach(p=>{p.u=UF(p.u)});
if(S.teamV!==CFG.v){S.cooks=(CFG.team||[]).map(k=>({...k}));S.teamV=CFG.v}
const cats=()=>[...BASE.map(([id,n,e])=>({id,n,e})),...S.groups.map(g=>({id:g.id,n:g.n,e:'📦',g:1}))];
const prods=()=>[...base.filter(p=>!S.hidden.includes(p.id)),...S.custom].sort((a,b)=>a.n.localeCompare(b.n,'ru'));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({...S,orders:S.orders.slice(0,200)}));const s=$('#saved');s.textContent='● сохранено';s.className='on';clearTimeout(st);st=setTimeout(()=>s.className='',1200)}catch{toast('Память браузера заполнена')}};
// sound
let ac,cp;
const tone=(seq,type='square')=>{try{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();cp=ac.createDynamicsCompressor();const g=ac.createGain();g.gain.value=1.8;cp.connect(g);g.connect(ac.destination)}if(ac.state==='suspended')ac.resume();let t=ac.currentTime;for(const[f,d]of seq){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(cp);o.start(t);o.stop(t+d);t+=d*.9}}catch{}};
const snd={tap:()=>tone([[900,.07]]),add:()=>tone([[660,.09],[1000,.12]]),ok:()=>tone([[660,.13],[880,.13],[1320,.3]]),warn:()=>tone([[320,.18],[220,.32]],'sawtooth'),ask:()=>tone([[740,.14],[740,.14],[988,.2]],'triangle')};
const vib=n=>navigator.vibrate&&navigator.vibrate(n);
let tt;const toast=m=>{const e=$('#tg');e.textContent=m;e.className='tg on';clearTimeout(tt);tt=setTimeout(()=>e.className='tg',2400)};
// helpers
const dI=S=>Object.values(S.draft.items),cnt=()=>dI(S).length;
const fq=q=>{q=String(q).replace(',','.');const v=parseFloat(q);return isFinite(v)&&v>0?Math.round(v*100)/100:0};
const fmtQ=q=>String(q).replace('.',',');
const day=iso=>{const[y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d,12).toLocaleDateString('ru',{weekday:'short',day:'2-digit',month:'2-digit'})};
const tm=ts=>new Date(ts).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'});
// render
const stepper=(it)=>`<div class="st"><button data-a="dec" data-id="${esc(it.id)}">−</button><input inputmode="decimal" data-q="${esc(it.id)}" value="${fmtQ(it.qty)}" aria-label="Количество"><u>${esc(it.u)}</u><button data-a="inc" data-id="${esc(it.id)}">+</button></div>`;
const row=p=>{const it=S.draft.items[p.id];return `<div class="it${it?' on':''}" data-r="${esc(p.id)}"><div class="n">${esc(p.n)}</div>${it?stepper(it):`<button data-a="add" data-id="${esc(p.id)}" aria-label="Добавить">＋ ${esc(p.u)}</button>`}${ed()?`<button class="x" data-a="delp" data-id="${esc(p.id)}" aria-label="Удалить товар">✕</button>`:''}</div>`};
const rCooks=()=>{const c=S.draft.cook;$('#cooks').innerHTML=S.cooks.map(k=>`<button class="chip${c&&c.id===k.id?' on':''}" data-a="pick" data-id="${k.id}">${esc(k.n)}<small>${esc(k.r)}</small></button>`).join('')||'<span style="color:var(--mu)">Повара не добавлены — обратитесь к руководителю</span>'};
const rCats=()=>{const cs=cats(),n=s=>cs.find(c=>c.id===s);$('#cats').innerHTML=`<button class="chip${cat==='all'?' on':''}" data-a="cat" data-id="all">Все</button>`+cs.map(c=>`<button class="chip${cat===c.id?' on':''}" data-a="cat" data-id="${c.id}">${c.e} ${esc(c.n.split(' и ')[0].split(',')[0])}</button>`).join('')+`<button class="chip" data-a="newg">＋ Группа</button>`+(ed()&&n(cat)&&n(cat).g?`<button class="chip" style="color:var(--rd)" data-a="delg">🗑 Удалить группу</button>`:'')};
const rList=()=>{const q=qs.trim().toLowerCase(),cs=cats();let h='';const ps=prods().filter(p=>(cat==='all'||p.c===cat)&&(!q||p.n.toLowerCase().includes(q)));
for(const c of cs){const g=ps.filter(p=>p.c===c.id);if(g.length)h+=(cat==='all'||q?`<div class="gh">${c.e} ${esc(c.n)}</div>`:'')+g.map(row).join('')}
$('#list').innerHTML=h||`<div class="em">Ничего не найдено.<br>Нажмите «＋ Товар», чтобы добавить.</div>`};
const rBar=()=>{$('#cnt').textContent=cnt()?cnt()+' поз.':'пусто';$('#date').value=S.draft.date;$('#note').value=S.draft.note};
const rAll=()=>{rCooks();rCats();rList();rBar()};
const rRev=()=>{const it=dI(S),c=S.draft.cook;$('#rc').innerHTML=c?esc(c.n)+' — '+esc(c.r):'<span style="color:var(--rd)">не выбран</span>';
$('#rb').innerHTML=it.length?it.sort((a,b)=>a.n.localeCompare(b.n,'ru')).map(i=>`<div class="it on"><div class="n">${esc(i.n)}</div>${stepper(i)}<button class="x" data-a="rm" data-id="${esc(i.id)}">✕</button></div>`).join(''):'<div class="em">Список пуст</div>'};
// message
const msg=o=>{const L=[`🧾 Заказ на ${day(o.date)}`,`👨‍🍳 ${o.cook.n}, ${o.cook.r}`,`🕒 оформлен в ${tm(o.created)}`,''];
const cs=[...BASE,...S.groups.map(g=>[g.id,g.n,'📦'])];
const seen=new Set();for(const[id,n,e]of cs){const g=o.items.filter(i=>i.c===id);if(!g.length)continue;g.forEach(i=>seen.add(i.id));L.push(`${e} ${n}`,g.sort((a,b)=>a.n.localeCompare(b.n,'ru')).map(i=>`• ${i.n} — ${fmtQ(i.qty)} ${i.u}`).join('\n'),'')}
const r=o.items.filter(i=>!seen.has(i.id));if(r.length)L.push('📦 Другое',r.map(i=>`• ${i.n} — ${fmtQ(i.qty)} ${i.u}`).join('\n'),'');
if(o.note)L.push('💬 '+o.note,'');L.push(`Всего: ${o.items.length} поз.`);return L.join('\n')};
const snap=()=>{const d=S.draft,old=d.editId&&S.orders.find(o=>o.id===d.editId);return{id:d.editId||'o'+Date.now(),created:old?old.created:Date.now(),updated:Date.now(),date:d.date,cook:d.cook,note:d.note.trim(),items:dI(S).map(i=>({...i})),copied:old?old.copied:false}};
const valid=()=>{if(!cnt()){snd.warn();vib(80);toast('Добавьте хотя бы один товар');return 0}if(!S.draft.cook){snd.warn();vib(80);toast('Выберите повара');$('#dr').close();$('#cooks').classList.add('bad');setTimeout(()=>$('#cooks').classList.remove('bad'),1500);window.scrollTo({top:0,behavior:'smooth'});return 0}return 1};
const upsert=o=>{const i=S.orders.findIndex(x=>x.id===o.id);i<0?S.orders.unshift(o):S.orders[i]=o};
const ask=(t,h,y='Да',n='Нет, вернуться')=>new Promise(res=>{const d=$('#dc');$('#ct').textContent=t;$('#cb').innerHTML=h;$('#cy').textContent=y;$('#cn').textContent=n;snd.ask();vib(40);const f=v=>()=>{d.close();res(v)};$('#cy').onclick=f(true);$('#cn').onclick=f(false);d.oncancel=()=>res(false);d.showModal()});
const clip=async t=>{try{await navigator.clipboard.writeText(t);return 1}catch{try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.append(a);a.select();const ok=document.execCommand('copy');a.remove();return ok}catch{return 0}}};
const copyOrder=async()=>{if(!valid())return;const o=snap();const yes=await ask('Вы уверены?',`<p style="margin:0 0 10px;color:var(--mu)">Проверьте сообщение. Если что-то не так — вернитесь и исправьте.</p><pre class="msg">${esc(msg(o))}</pre>`,'Да, копировать','Нет, вернуться');if(!yes)return;
if(!await clip(msg(o))){snd.warn();toast('Не удалось скопировать. Разрешите доступ к буферу');return}
o.copied=true;upsert(o);S.draft=blank(S.draft.cook);save();$('#dr').close();rAll();snd.ok();vib([60,40,60]);toast('✓ Скопировано и сохранено в истории')};
const saveOrder=()=>{if(!valid())return;const o=snap();upsert(o);S.draft.editId=o.id;save();snd.ok();toast('✓ Сохранено в истории. Можно редактировать')};
// history
const rHist=()=>{const q=$('#hq').value.trim().toLowerCase();const l=S.orders.filter(o=>!q||(o.cook.n+' '+o.date+' '+day(o.date)+' '+o.items.map(i=>i.n).join(' ')).toLowerCase().includes(q));
$('#hl').innerHTML=l.length?l.map(o=>`<div class="hc"><b>${esc(day(o.date))} · ${esc(o.cook.n)}</b><small>${esc(o.cook.r)} · ${o.items.length} поз. · ${new Date(o.created).toLocaleDateString('ru')} ${tm(o.created)}${o.copied?' · ✓ скопирован':' · не скопирован'}</small><div style="font-size:13px;margin-top:4px">${esc(o.items.slice(0,5).map(i=>i.n).join(', '))}${o.items.length>5?'…':''}</div><div class="acts"><button data-a="open" data-id="${o.id}">Открыть и править</button><button data-a="hcopy" data-id="${o.id}">Копировать</button><button class="d" data-a="hdel" data-id="${o.id}">Удалить</button></div></div>`).join(''):'<div class="em">История пока пуста</div>'};
const rTeam=()=>{$('#tl').innerHTML=S.cooks.length?S.cooks.map(k=>`<div class="it"><div class="n">${esc(k.n)}<i>${esc(k.r)}</i></div><button class="x" data-a="delc" data-id="${k.id}">✕</button></div>`).join(''):'<div class="em">Добавьте поваров с должностями</div>'};
const open=id=>{rRev();rTeam();$(id).showModal()};
// actions
let admin=0,edit=0,pend=null,fails=0,lock=0;
const isAdmin=()=>admin>Date.now(),ed=()=>edit&&isAdmin();
const need=()=>{snd.warn();toast('Нужен вход в админ-панель');A.admin()};
const sha=async s=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('vip-restobar:'+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const rAdm=()=>{const b=$('#edb');b.textContent='Режим удаления товаров: '+(ed()?'ВКЛ':'выкл');b.className=ed()?'d':'';const u=$('#unh');u.textContent='Вернуть скрытые ('+S.hidden.length+')';u.disabled=!S.hidden.length};
const A={
async login(){if(Date.now()<lock){snd.warn();toast('Подождите минуту и повторите');return}if(!CFG.adminHash||!(window.crypto&&crypto.subtle)){snd.warn();toast('Пароль не настроен (config.js)');return}
if(await sha($('#ap').value)===CFG.adminHash){admin=Date.now()+6e5;fails=0;$('#da').close();snd.ok();rTeam();rAdm();$('#dt').showModal()}else{if(++fails>=5){lock=Date.now()+6e4;fails=0}snd.warn();vib(120);toast('Неверный пароль')}},
toggled(){edit=!edit;rAdm();rList();rCats();snd.tap()},
unhide(){S.hidden=[];save();rAdm();rList();snd.ok()},
async setpw(){const v=$('#npw').value;if(v.length<6){snd.warn();toast('Пароль — минимум 6 символов');return}pend=await sha(v);$('#npw').value='';snd.ok();toast('Пароль принят. Нажмите «Скопировать config.js»')},
async cfg(){const t='window.CONFIG = '+JSON.stringify({adminHash:pend||CFG.adminHash,v:(CFG.v||1)+1,team:S.cooks},null,2)+';\n';if(await clip(t)){snd.ok();toast('✓ Скопировано. Вставьте в файл config.js на GitHub')}else{snd.warn();toast('Не удалось скопировать')}},
logout(){admin=0;edit=0;$('#dt').close();rList();rCats();snd.tap()},
add(id){const p=prods().find(x=>x.id===id);if(!p)return;S.draft.items[id]={id,n:p.n,c:p.c,u:p.u,qty:1};save();snd.add();vib(20);rep(id)},
inc(id){const i=S.draft.items[id];if(i){i.qty=Math.round((i.qty+1)*100)/100;save();snd.tap();rep(id)}},
dec(id){const i=S.draft.items[id];if(!i)return;i.qty=Math.round((i.qty-1)*100)/100;if(i.qty<=0){delete S.draft.items[id];snd.warn()}else snd.tap();save();rep(id)},
rm(id){delete S.draft.items[id];save();snd.warn();rep(id)},
pick(id){S.draft.cook=S.cooks.find(k=>k.id===id);save();snd.add();rCooks()},
cat(id){cat=id;snd.tap();rCats();rList()},
review(){snd.tap();open('#dr')},close(){snd.tap();document.querySelectorAll('dialog[open]').forEach(d=>d.close())},
copy:copyOrder,save:saveOrder,
async clear(){if(!cnt())return;if(await ask('Очистить список?','<p>Все выбранные товары будут убраны из текущего заказа.</p>','Да, очистить','Нет, оставить')){S.draft=blank(S.draft.cook);save();rAll();rRev();snd.warn()}},
hist(){snd.tap();rHist();$('#dh').showModal()},admin(){snd.tap();$('#dh').close();if(isAdmin()){rTeam();rAdm();$('#dt').showModal()}else{$('#ap').value='';$('#da').showModal();$('#ap').focus()}},
addcook(){if(!isAdmin())return need();const n=$('#tn').value.trim(),r=$('#tr').value.trim();if(!n||!r){snd.warn();toast('Укажите имя и должность');return}S.cooks.push({id:'k'+Date.now(),n,r});$('#tn').value=$('#tr').value='';save();rTeam();rCooks();snd.ok();$('#tn').focus()},
async delc(id){if(!isAdmin())return need();const k=S.cooks.find(x=>x.id===id);if(!k||!await ask('Удалить сотрудника?',`<p>${esc(k.n)} — ${esc(k.r)}</p>`,'Да, удалить','Нет'))return;S.cooks=S.cooks.filter(x=>x.id!==id);if(S.draft.cook&&S.draft.cook.id===id)S.draft.cook=null;save();rTeam();rCooks()},
newp(){snd.tap();$('#pc').innerHTML=cats().map(c=>`<option value="${c.id}">${esc(c.n)}</option>`).join('');$('#pc').value=cat!=='all'&&cats().some(c=>c.id===cat)?cat:'sauces';$('#pu').innerHTML=UNITS.map(u=>`<option>${u}</option>`).join('');$('#pn').value='';$('#dp').showModal();$('#pn').focus()},
addprod(){const n=$('#pn').value.trim().replace(/\s+/g,' ');if(!n){snd.warn();toast('Введите название');return}const c=$('#pc').value,u=$('#pu').value;if(prods().some(p=>p.c===c&&p.n.toLowerCase()===n.toLowerCase())){snd.warn();toast('Такой товар уже есть в этой группе');return}
const p={id:'c:'+Date.now(),n:n[0].toUpperCase()+n.slice(1),c,u};S.custom.push(p);S.draft.items[p.id]={id:p.id,n:p.n,c,u,qty:1};save();$('#dp').close();cat=c;qs='';$('#q').value='';rAll();snd.ok();toast('✓ Добавлен в «'+cats().find(x=>x.id===c).n+'» и в заказ');setTimeout(()=>{const e=document.querySelector(`[data-r="${CSS.escape(p.id)}"]`);e&&e.scrollIntoView({block:'center',behavior:'smooth'})},50)},
async delp(id){if(!isAdmin())return need();const c=S.custom.find(x=>x.id===id),p=c||base.find(x=>x.id===id);if(!p||!await ask('Удалить товар?',`<p>${esc(p.n)} будет удалён из каталога.</p>`,'Да, удалить','Нет'))return;if(c)S.custom=S.custom.filter(x=>x.id!==id);else S.hidden.push(id);delete S.draft.items[id];save();rAll();snd.warn()},
newg(){snd.tap();$('#gn').value='';$('#dg').showModal();$('#gn').focus()},
addgrp(){const n=$('#gn').value.trim();if(!n){snd.warn();toast('Введите название группы');return}if(cats().some(c=>c.n.toLowerCase()===n.toLowerCase())){snd.warn();toast('Такая группа уже есть');return}const g={id:'g'+Date.now(),n};S.groups.push(g);cat=g.id;save();$('#dg').close();rAll();snd.ok()},
async delg(){if(!isAdmin())return need();const g=S.groups.find(x=>x.id===cat);if(!g)return;const k=S.custom.filter(p=>p.c===g.id).length;if(!await ask('Удалить группу?',`<p>«${esc(g.n)}»${k?` и товаров в ней: ${k}`:''} будут удалены.</p>`,'Да, удалить','Нет'))return;S.custom.filter(p=>p.c===g.id).forEach(p=>delete S.draft.items[p.id]);S.custom=S.custom.filter(p=>p.c!==g.id);S.groups=S.groups.filter(x=>x.id!==g.id);cat='all';save();rAll();snd.warn()},
async open(id){const o=S.orders.find(x=>x.id===id);if(!o)return;if(cnt()&&S.draft.editId!==id&&!await ask('Заменить текущий заказ?','<p>Несохранённый черновик будет заменён выбранным заказом из истории.</p>','Да, открыть','Нет, вернуться'))return;
S.draft={cook:o.cook,date:o.date,note:o.note||'',items:Object.fromEntries(o.items.map(i=>[i.id,{...i}])),editId:o.id};if(!S.cooks.some(k=>k.id===o.cook.id)&&o.cook.id)S.cooks.push(o.cook);save();$('#dh').close();rAll();snd.ok();toast('Заказ открыт. Правьте и копируйте снова')},
async hcopy(id){const o=S.orders.find(x=>x.id===id);if(o&&await clip(msg(o))){o.copied=true;save();rHist();snd.ok();toast('✓ Скопировано')}else{snd.warn();toast('Не удалось скопировать')}},
async hdel(id){if(!await ask('Удалить заказ?','<p>Заказ будет удалён из истории без возможности восстановления.</p>','Да, удалить','Нет'))return;S.orders=S.orders.filter(o=>o.id!==id);if(S.draft.editId===id)S.draft.editId=null;save();rHist();$('#dh').showModal();snd.warn()}
};
const rep=id=>{const p=prods().find(x=>x.id===id),r=document.querySelector(`[data-r="${CSS.escape(id)}"]`);if(p&&r)r.outerHTML=row(p);rBar();if($('#dr').open)rRev()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a])A[b.dataset.a](b.dataset.id);else if(e.target.tagName==='DIALOG'&&!e.target.id.startsWith('dc'))e.target.close()});
document.addEventListener('change',e=>{const id=e.target.dataset.q;if(!id)return;const i=S.draft.items[id],v=fq(e.target.value);if(!i)return;if(v){i.qty=v;snd.tap()}else{delete S.draft.items[id];snd.warn()}save();rep(id)});
let rf;$('#q').addEventListener('input',e=>{qs=e.target.value;cancelAnimationFrame(rf);rf=requestAnimationFrame(rList)});
$('#date').addEventListener('change',e=>{S.draft.date=e.target.value||tom();save()});
$('#note').addEventListener('input',e=>{S.draft.note=e.target.value;clearTimeout(st);st=setTimeout(save,300)});
$('#hq').addEventListener('input',rHist);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();$('#q').focus()}});
$('#ap').addEventListener('keydown',e=>{if(e.key==='Enter')A.login()});
rAll();
})();

if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

(()=>{const i=document.getElementById('inst');let dp;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;i.hidden=false});
const sa=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
if(!sa&&!window.Capacitor&&/iphone|ipad|ipod/i.test(navigator.userAgent))i.hidden=false;
i.onclick=async()=>{if(dp){dp.prompt();try{await dp.userChoice}catch{}dp=null;i.hidden=true}else alert('iPhone: нажмите «Поделиться» → «На экран Домой»')};
addEventListener('appinstalled',()=>{i.hidden=true})})();
