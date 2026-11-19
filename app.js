(()=>{'use strict';
if(!window.HTMLDialogElement||typeof HTMLDialogElement.prototype.showModal!=='function'){document.querySelectorAll('dialog').forEach(d=>{d.showModal=()=>{d.setAttribute('open','');d.classList.add('modal-fallback');document.body.classList.add('modal-fallback-open')};d.close=()=>{d.removeAttribute('open');const e=document.createEvent('Event');e.initEvent('close',false,false);d.dispatchEvent(e);if(!document.querySelector('dialog.modal-fallback[open]'))document.body.classList.remove('modal-fallback-open')}});document.addEventListener('click',e=>{if(e.target===document.body&&document.body.classList.contains('modal-fallback-open')){const d=document.querySelector('dialog.modal-fallback[open]');if(d)d.close()}},true)}
const CFG=Object.assign({dbUrl:'',projectId:'',apiKey:'',adminEmail:'admin@vip.local'},window.CONFIG||{});
const DEMO=!(CFG.dbUrl||CFG.projectId)||!CFG.apiKey;let DB=String(CFG.dbUrl||'').replace(/\/+$/,'');
const $=s=>document.querySelector(s),on=(s,t,...a)=>{const e=document.querySelector(s);if(e)e.addEventListener(t,...a)},dialogOpen=id=>$(id).hasAttribute('open'),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),cssEsc=s=>window.CSS&&CSS.escape?CSS.escape(String(s)):String(s).replace(/[^a-zA-Z0-9_-]/g,'\\$&');
const VER='9.9.2';
if(!window.__vipHeal)window.__vipHeal=why=>{try{const n=Date.now(),l=+localStorage.getItem('vip3-heal')||0;if(why!=='manual'&&n-l<6e5)return;localStorage.setItem('vip3-heal',String(n))}catch{}
fetch('manifest.webmanifest?vh='+Date.now(),{cache:'no-store'}).then(r=>{if(!r.ok)throw 0;const P=[];try{if(navigator.serviceWorker)P.push(navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(x=>x.unregister()))))}catch{}try{if(window.caches)P.push(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))))}catch{}return Promise.all(P.map(p=>p.catch(()=>{})))}).then(()=>Promise.all(['./','app.js','styles.css','config.js'].map(f=>fetch(f,{cache:'reload'}).catch(()=>{})))).then(()=>location.reload(),()=>{if(why==='manual')location.reload()})};
try{const mv=document.querySelector('meta[name=vip-ver]'),cv=getComputedStyle(document.documentElement).getPropertyValue('--vip-ver').replace(/["'\s]/g,'');if((!mv||mv.content!==VER||cv!==VER)&&window.__vipHeal)window.__vipHeal('ver')}catch{}
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
// 9.7: адрес базы известен сразу (сохранённый или стандартный) — запуск не ждёт сеть; проверка идёт в фоне и только по ответу самой Firebase
const DBRX=/^https:\/\/[a-z0-9-]+\.(firebaseio\.com|firebasedatabase\.app)$/,dbCanon=()=>`https://${CFG.projectId}-default-rtdb.firebaseio.com`;
let DBV=0,lastDet=0,netErr=0;
if(!DEMO){if(DB)DBV=1;else{const s0=LS.get('vip3-db','');DB=DBRX.test(String(s0))?s0:dbCanon();const m=LS.get('vip3-dbv',null);DBV=m&&m.u===DB&&Date.now()-m.t<6048e5?1:0}try{const l=document.createElement('link');l.rel='preconnect';l.href=DB;l.crossOrigin='anonymous';document.head.appendChild(l)}catch{}}
const BASE=[['meat','Мясо и птица','🥩'],['deli','Колбасы и деликатесы','🥓'],['seafood','Рыба и морепродукты','🐟'],['cheese','Сыры','🧀'],['dairy','Молочные продукты и мороженое','🥛'],['vegetables','Овощи и грибы','🥬'],['herbs','Зелень и травы','🌿'],['fruit','Фрукты','🍎'],['bakery','Хлеб','🍞'],['fry','Фритюр и полуфабрикаты','🍟'],['pasta','Макароны, крупы и рис','🍝'],['flour','Мука, выпечка и сладкое','🧁'],['nuts','Орехи и семена','🥜'],['sauces','Соусы и заправки','🥫'],['spices','Специи и приправы','🧂'],['oils','Масла','🛢️'],['preserves','Консервация и соленья','🥒']];
// ---------- тема оформления: Авто / Светлая / Тёмная (для всех телефонов) ----------
const THEMES={auto:['📱','Авто'],light:['☀️','Светлая'],dark:['🌙','Тёмная']};let TH=LS.get('vip3-theme','auto');if(!THEMES[TH])TH='auto';
const sysDark=()=>{try{return matchMedia('(prefers-color-scheme: dark)').matches}catch{return false}},isDark=()=>TH==='dark'||(TH==='auto'&&sysDark());
const applyTheme=()=>{const r=document.documentElement;if(TH==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',TH);
const so=document.querySelector('.logo source');if(so){so.srcset='logo.png';so.media=TH==='auto'?'(prefers-color-scheme: dark)':TH==='dark'?'all':'not all'}
const ms=document.querySelectorAll('meta[name=theme-color]');if(ms.length>1){ms[0].media=TH==='auto'?'(prefers-color-scheme: light)':TH==='light'?'all':'not all';ms[1].media=TH==='auto'?'(prefers-color-scheme: dark)':TH==='dark'?'all':'not all'}
document.querySelectorAll('.thopt').forEach(b=>{const on=b.dataset.id===TH;b.classList.toggle('on',on);b.setAttribute('aria-checked',on?'true':'false')});
const bt=$('#thbtn');if(bt){bt.textContent=isDark()?'🌙':'☀️';bt.title='Тема: '+THEMES[TH][1]}};
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(TH==='auto')applyTheme()})}catch{}
applyTheme();
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
let BDAY_H=(v=>Number.isInteger(v)&&v>=0&&v<=8?v:6)(LS.get('vip3-ds',6));
const dAdd=(n,b)=>{const d=b?new Date(b+'T12:00'):new Date(Date.now()-BDAY_H*36e5);d.setDate(d.getDate()+n);return iso(d)};
const RXD=/^\d{4}-\d{2}-\d{2}$/,dDiff=(a,b)=>Math.round((Date.parse(a+'T12:00')-Date.parse(b+'T12:00'))/864e5);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const blank=cook=>({cook:cook||null,date:dAdd(1),man:false,note:'',items:{},editId:null});
// выбранный день подготовки хранится вместе с «сегодня» на момент выбора: в новый день приложение всегда открывается на сегодняшнем дне, а не на вчерашнем
const initPd=()=>{const t=dAdd(0),v=LS.get('vip3-prep-date','');if(typeof v==='string')return RXD.test(v)&&v>=t&&v<=dAdd(1)?v:t;return v&&RXD.test(v.d)&&v.t===t?v.d:t};
const L=Object.assign({draft:blank(),me:null,lu:{},out:[],mt:[],hold:[]},LS.get('vip3-local',{}));
if(!L.mt)L.mt=[];if(!Array.isArray(L.hold))L.hold=[];
if(!L.draft||!L.draft.items)L.draft=blank();
let DV=0,DATA=LS.get('vip3-cache',{}),PC=null,PCC=null,cat='all',qs='',edit=0,pd=initPd(),tab='order',qg='main',want='',sm=iso(new Date()).slice(0,7),sf=L.sf||(L.me?L.me.id:'all'),se=0,wd=dAdd(0),wcat='all',wq='',woDraft=null;const ssel=new Set();
let liveSoon=()=>{},CT={t:0,c:null,d:null,n:null,bad:'',busy:0},TGB=LS.get('vip3-tgbot',''),TGW=LS.get('vip3-tgw',''),tgPk=0,tgPoke=()=>{if(!TGW||!navigator.onLine||Date.now()-tgPk<1500)return;tgPk=Date.now();try{fetch(TGW+'/poke',{method:'POST',mode:'no-cors',keepalive:true,cache:'no-store'}).catch(()=>{})}catch(e){}};const saveL=()=>{LS.set('vip3-local',L);liveSoon()};
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
const COL=(()=>{try{return new Intl.Collator('ru')}catch(e){return{compare:(x,y)=>x<y?-1:x>y?1:0}}})();
const WDS=['вс','пн','вт','ср','чт','пт','сб'],DAYC=new Map();
const day=s=>{let r=DAYC.get(s);if(r!==undefined)return r;const[y,m,d]=String(s).split('-').map(Number);if(!(y>0&&m>0&&d>0))return String(s||'');r=WDS[new Date(y,m-1,d,12).getDay()]+', '+String(d).padStart(2,'0')+'.'+String(m).padStart(2,'0');if(DAYC.size>400)DAYC.clear();DAYC.set(s,r);return r};
const tm=ts=>{const d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
// ---------- русский выбор даты: системное поле даты показывает язык телефона (English), поэтому свой календарь ----------
const MONR=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],MONG=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],WDR=['пн','вт','ср','чт','пт','сб','вс'];
const wdIdx=(y,m,d)=>(new Date(y,m-1,d,12).getDay()+6)%7;
const fmtLong=s=>{if(!RXD.test(s||''))return'';const[y,m,d]=s.split('-').map(Number);return `${WDR[wdIdx(y,m,d)]}, ${d} ${MONG[m-1]} ${y}`};
const dpBtn=(id,v,title,empty)=>`<button type="button" class="dp" id="${id}" data-dp${title?` data-title="${esc(title)}"`:''}${empty?` data-empty="${esc(empty)}"`:''} value="${esc(v||'')}" aria-haspopup="dialog">${esc(fmtLong(v)||empty||'Выберите дату')}</button>`;
const setDp=(el,v)=>{if(!el)return;el.value=v||'';el.textContent=fmtLong(v)||(el.dataset&&el.dataset.empty)||'Выберите дату'};
let dpk=null;
const rDpk=()=>{const y=dpk.y,m=dpk.m,first=wdIdx(y,m,1),dim=new Date(y,m,0).getDate(),t0=dAdd(0),pm=m===1?[y-1,12]:[y,m-1],pdim=new Date(pm[0],pm[1],0).getDate(),z=n=>String(n).padStart(2,'0');let h='';
for(let i=0;i<42;i++){let yy=y,mo=m,dd=i-first+1,out=0;if(dd<1){yy=pm[0];mo=pm[1];dd=pdim+dd;out=1}else if(dd>dim){if(m===12){yy=y+1;mo=1}else mo=m+1;dd=dd-dim;out=1}
const s=`${yy}-${z(mo)}-${z(dd)}`;h+=`<button type="button" class="dpd${out?' out':''}${s===dpk.sel?' sel':''}${s===t0?' now':''}${i%7>4?' we':''}" data-a="dppick" data-id="${s}" aria-label="${esc(fmtLong(s))}"${s===dpk.sel?' aria-pressed="true"':''}>${dd}</button>`}
$('#dpt').textContent=MONR[m-1]+' '+y;$('#dpg').innerHTML=h};
const openDp=el=>{const v=RXD.test(el.value||'')?el.value:'',b=v||dAdd(0),a=b.split('-').map(Number);dpk={el,y:a[0],m:a[1],sel:v};$('#dph').textContent=el.dataset.title||'Выберите дату';rDpk();snd.tap();$('#dpk').showModal()};
// ---------- облако ----------
function put(path,val,merge){DV++;JF=null;const k=path.split('/').filter(Boolean);
if(!k.length){if(merge){DATA=DATA||{};for(const[a,b]of Object.entries(val||{}))b===null?delete DATA[a]:DATA[a]=b}else DATA=val||{};return}
let o=DATA;for(let i=0;i<k.length-1;i++){if(!o[k[i]]||typeof o[k[i]]!=='object')o[k[i]]={};o=o[k[i]]}
const l=k[k.length-1];
if(merge){const t=o[l]&&typeof o[l]==='object'?o[l]:(o[l]={});for(const[a,b]of Object.entries(val||{}))b===null?delete t[a]:t[a]=b}
else if(val===null||val===undefined)delete o[l];else o[l]=val}
const D={},LIVE={msg:null};let raf=0,ct;
const dirty=k=>{D[k]=1;if(k==='catalog')PC=null;if(k==='prepCats')PCC=null;if(!raf)raf=requestAnimationFrame(render)};
const DEV=LS.get('vip3-dev','')||(()=>{const v=uid();LS.set('vip3-dev',v);return v})();
// ---- 9.4: счётчик трафика (оценка по размеру ответов, до сжатия)
const txDay=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
let TX=(()=>{const v=LS.get('vip3-tx',null);return v&&typeof v==='object'&&v.d===txDay()?v:{d:txDay(),b:0,n:0}})(),txT=0;
const txAdd=n=>{try{if(TX.d!==txDay())TX={d:txDay(),b:0,n:0};TX.b+=n|0;TX.n++;if(!txT)txT=setTimeout(()=>{txT=0;LS.set('vip3-tx',TX)},15000)}catch{}};
const txFmt=()=>{const b=TX.d===txDay()?TX.b:0;return b>=1048576?(b/1048576).toFixed(1)+' МБ':Math.max(0,Math.round(b/1024))+' КБ'};
// ---- 9.4: журнал ошибок этого телефона → errlog/<DEV> (редко, не через meta)
const ERRK='vip3-errs';let ERRS=(()=>{const v=LS.get(ERRK,[]);return Array.isArray(v)?v.filter(x=>x&&x.t>Date.now()-12096e5).slice(-30):[]})(),errTm=0,errBroken=0,errLast=0;
const errClean=x=>String(x==null?'':x).replace(/([?&]auth=)[^&\s"')]+/gi,'$1…').replace(/\beyJ[\w-]{10,}\.[\w-]+\.[\w-]+/g,'jwt…').replace(/\s+/g,' ').slice(0,300);
const errAdd=(m,src)=>{m=errClean(m);if(!m||/ResizeObserver|^Script error\.?$|Failed to fetch|Load failed|NetworkError|AbortError|aborted|service worker registration/i.test(m))return;
let k='',w='cook';try{k=String(tab)}catch{}try{w=isAdmin()?'chief':'cook'}catch{}
const now=Date.now(),sg=m+'|'+(src||''),p=ERRS.find(x=>x.g===sg&&now-x.t<6e4);
if(p){p.n=(p.n||1)+1;p.t=now}else{ERRS.push({t:now,m,s:errClean(src).slice(0,120),v:VER,k,g:sg,n:1,w});if(ERRS.length>30)ERRS.shift()}
LS.set(ERRK,ERRS);errSoon()};
const errSend=async()=>{errTm=0;if(errBroken||DEMO||!DB||!ERRS.length)return;if(!navigator.onLine||Date.now()-errLast<3e5){errTm=setTimeout(errSend,6e4);return}
const o={};ERRS.forEach((x,i)=>{o[x.t.toString(36)+i]={t:x.t,m:x.m,s:x.s||'',v:x.v,k:x.k||'',n:x.n||1,w:x.w||''}});
try{await api('PUT','errlog/'+DEV,o);errLast=Date.now();LS.set('vip3-errsent',errLast)}catch(e){if(e&&[400,401,403,404].includes(e.status))errBroken=1;else errTm=setTimeout(errSend,12e4)}};
const errSoon=()=>{if(!errTm&&!errBroken)errTm=setTimeout(errSend,20000)};
addEventListener('error',e=>{try{errAdd(e.message||(e.error&&e.error.message),String(e.filename||'').split('/').pop()+':'+(e.lineno||0)+':'+(e.colno||0))}catch{}});
addEventListener('unhandledrejection',e=>{try{const r=e.reason;errAdd(r&&r.message?r.message:r,'promise')}catch{}});

const ST={open:{},seen:{},err:'',lastErr:'',poll:0,okAt:0,wk:Date.now()};
const okMark=()=>{ST.okAt=ST.poll=Date.now();netErr=0};
const setSt=()=>{const s=$('#saved');if(DEMO){s.textContent='◌';s.title='Демо-режим';s.classList.remove('on','err','pend');return}
const n=L.out.length,h=(L.hold||[]).length,o=Object.values(ST.open).some(Boolean)||Date.now()-(ST.okAt||0)<20000,wk=!o&&Date.now()-(ST.wk||0)<8000;
s.textContent=!DB?'…':n?'↻'+n:h?'🔒'+h:ST.err?'⚠':o?'●':wk?'…':'○';s.title=!DB?'Подключение…':n?'Отправка: '+n:h?'Ждут входа руководителя: '+h:ST.err?'Ошибка — нажмите для диагностики':o?'Онлайн':wk?'Подключение…':'Нет связи';s.classList.toggle('on',!!(o&&!n&&!h&&!ST.err));s.classList.toggle('err',!!ST.err||!!h);s.classList.toggle('pend',!!n&&!ST.err);rSync()};
let pendSince=0;const rSync=()=>{const b=document.getElementById('syncbar');if(!b)return;const n=L.out.length,h=(L.hold||[]).length;if(n){if(!pendSince)pendSince=Date.now()}else pendSince=0;
const showN=n>0&&Date.now()-pendSince>4000,show=showN||h>0;if(b.hidden===!show&&b.dataset.k===n+'|'+h)return;b.dataset.k=n+'|'+h;b.hidden=!show;if(!show){b.innerHTML='';return}
b.innerHTML=(showN?`<span>⏳ Не отправлено другим: <b>${n}</b></span>`:`<span>🔒 Ждут входа руководителя: <b>${h}</b></span>`)+`<button class="g" data-a="syncnow">Отправить сейчас</button>`};
let AU={t:'',rt:LS.get('vip3-rt',''),exp:0,ok:false};
// 9.8.0: роли. Шеф (admin@vip.local) — всё как раньше. Наблюдатель (viewer@vip.local) — смотрит; его правки уходят шефу на утверждение (proposals), сам он ничего не меняет
const VIEWER=String(CFG.viewerEmail||'viewer@vip.local').toLowerCase();
let ROLE=LS.get('vip3-role','')==='obs'?'obs':'adm';
const jwtEmail=t=>{try{const p=String(t).split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return String(JSON.parse(decodeURIComponent(escape(atob(p+'='.repeat((4-p.length%4)%4))))).email||'').toLowerCase()}catch{return''}};
const roleSet=t=>{const e=jwtEmail(t);ROLE=e&&e===VIEWER?'obs':'adm';LS.set('vip3-role',ROLE)};
const isObs=()=>AU.ok&&ROLE==='obs',isAdmin=()=>AU.ok&&ROLE!=='obs',ed=()=>edit&&isAdmin();
const OBS_DIV=/^(?:prep|prepMeta|prepLibrary|prepPins|writeoffs|plan|orders|receipts|catalog|prepCats)\//,OBS_FREE=/^plan\/seen\//;
const OBS={cfg:(c=>c&&typeof c==='object'?c:{})(LS.get('vip3-obscfg',{})),ls:(a=>Array.isArray(a)?a:[])(LS.get('vip3-myprop',[])),t:0,busy:0,last:0,vt:0,nt:0};
let gestT=0,gG=null;
['pointerdown','keydown','click','change','submit','touchend'].forEach(ev=>addEventListener(ev,e=>{if(e.isTrusted)gestT=Date.now()},true));
const credStore=(id,pw)=>{try{if(window.PasswordCredential&&navigator.credentials&&navigator.credentials.store)navigator.credentials.store(new PasswordCredential({id,password:pw,name:id})).catch(()=>{})}catch(e){}};
const persistAsk=()=>{try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})}catch(e){}};
const fetchFast=(url,options={},limit=12000)=>{if(typeof AbortController==='undefined')return fetch(url,options);const c=new AbortController(),timer=setTimeout(()=>c.abort(),limit);return fetch(url,{...options,signal:c.signal}).then(r=>{clearTimeout(timer);return r},e=>{clearTimeout(timer);throw e})};
async function tok(lim){if(!AU.rt)return'';if(AU.t&&Date.now()<AU.exp-6e4)return AU.t;
const r=await fetchFast('https://securetoken.googleapis.com/v1/token?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(AU.rt)},lim||12000);
const j=await r.json();if(!r.ok){if(r.status===400){AU={t:'',rt:'',exp:0,ok:false};LS.set('vip3-rt','')}throw new Error('auth')}
AU={t:j.id_token,rt:j.refresh_token,exp:Date.now()+j.expires_in*1000,ok:true};roleSet(AU.t);LS.set('vip3-rt',AU.rt);return AU.t}
const probe=async u=>{try{const r=await fetchFast(u+'/.json?shallow=true',{},8000),tx=await r.text();let j;try{j=JSON.parse(tx)}catch{return 0}if(r.status===200&&(j===null||typeof j==='object'))return 2;if((r.status===401||r.status===403)&&j&&typeof j.error==='string'&&/permission denied/i.test(j.error))return 1;return 0}catch{return 0}};
let detP=null;
// 9.7: проверяем сразу все адреса параллельно, берём первый настоящий ответ Firebase по порядку важности (стандартный адрес первым); страницы-заглушки Wi-Fi и чужие хосты не принимаются
function detect(force){if(DEMO||CFG.dbUrl||(DBV&&!force))return Promise.resolve(false);if(detP)return detP;lastDet=Date.now();const p=CFG.projectId,st=LS.get('vip3-db','');
const list=[...new Set([dbCanon(),DBRX.test(String(st))?st:'',`https://${p}-default-rtdb.europe-west1.firebasedatabase.app`,`https://${p}-default-rtdb.asia-southeast1.firebasedatabase.app`].filter(Boolean))],pr=list.map(probe);
detP=(async()=>{for(let i=0;i<list.length;i++){if(await pr[i]){okMark();if(DB!==list[i]){DB=list[i];for(const k in MV)delete MV[k];metaBroken=0;setTimeout(restartStreams,0)}LS.set('vip3-db',DB);LS.set('vip3-dbv',{u:DB,t:Date.now()});DBV=1;return true}}return false})().finally(()=>{detP=null;setSt()});return detP}
const isHtml=r=>{try{return/text\/html/i.test(r.headers.get('content-type')||'')}catch{return false}},dbBad=()=>{if(!DEMO&&!CFG.dbUrl&&Date.now()-lastDet>15000){DBV=0;detect(true)}},netBad=()=>{if(++netErr>=4&&navigator.onLine!==false)dbBad()};
// токен обновляется не дольше 5 с и не чаще раза в 30 с после неудачи; если не вышло — запись идёт без токена (открытые узлы всё равно примут), а узлы руководителя вернут 401 и подождут
let tokP=null,tokFail=0;const tokSoft=()=>{if(!AU.rt)return Promise.resolve('');if(AU.t&&Date.now()<AU.exp-6e4)return Promise.resolve(AU.t);if(Date.now()-tokFail<3e4)return Promise.resolve('');if(!tokP)tokP=tok(5000).catch(()=>{tokFail=Date.now();return ''}).finally(()=>{tokP=null});return tokP};
async function api(m,p,b){if(!DB)throw new Error('nodb');const t=await tokSoft();let r;try{r=await fetchFast(`${DB}/${p}.json${t?'?auth='+t:''}`,{method:m,headers:b!==undefined?{'Content-Type':'application/json'}:undefined,body:b!==undefined?JSON.stringify(b):undefined})}catch(er){netBad();throw er}if(!r.ok){if(r.status===404)dbBad();const e=new Error('http');e.status=r.status;throw e}if(isHtml(r)){dbBad();const e=new Error('http');e.status=0;throw e}okMark();return r}
let fl=0,retryAt=0,failures=0;
async function flush(){if(fl||DEMO||!L.out.length||Date.now()<retryAt)return;fl=1;let denied=0;
try{do{while(L.out.length){const o=L.out[0];try{await api(o.m,o.p,o.b)}catch(e){if([400,404,405,409,410,412,413,414,422].includes(e.status)){ST.err=ST.lastErr=`HTTP ${e.status} · ${o.m} ${o.p}`;L.out.shift();saveL();snd.warn();toast('Не сохранено (код '+e.status+'). Проверьте соединение и правила Firebase');setSt();continue}
if([401,403].includes(e.status)){L.out.shift();ST.lastErr=`HTTP ${e.status} · ${o.m} ${o.p}`;if(/^receipts\//.test(o.p)){ST.err=ST.lastErr;toast('Приёмка не сохранена: опубликуйте новые правила Firebase (файл firebase-rules.json)')}else{L.hold=L.hold||[];L.hold.push(o);if(L.hold.length>60)L.hold.shift();denied++}saveL();setSt();continue}throw e}ST.err='';failures=0;retryAt=0;if(o.p.indexOf('orders/')===0&&o.b&&o.b.copied===true)tgPoke();L.out.shift();saveL()}await bumpMeta()}while(L.out.length);
if(denied){snd.warn();toast('Часть изменений требует входа руководителя — они сохранены и отправятся после входа')}}catch{failures++;retryAt=Date.now()+Math.min(60000,1000*Math.pow(2,Math.min(failures-1,6)))}fl=0;setSt()}
function mut(m,p,v){if(isObs()&&OBS_DIV.test(p)&&!OBS_FREE.test(p))return propose(m,p,v);try{trashCap(m,p,v)}catch(e){}return mut0(m,p,v)}
function mut0(m,p,v){put('/'+p,m==='DELETE'?null:v,m==='PATCH');dirty(p.split('/')[0]);if(DEMO){LS.set('vip3-cache',DATA);return}L.out.push({m,p,b:v,at:Date.now()});if(!metaBroken&&p.indexOf('trash/')!==0){const k=mkey(p);if(L.mt.indexOf(k)<0)L.mt.push(k)}saveL();setSt();flush()}
const ES={};
function listen(key,prefix,q){if(DEMO||!DB||!window.EventSource)return;const route=prefix+'|'+(q||'');if(ES[key]&&ES[key].__route===route&&ES[key].readyState!==2)return;if(ES[key])ES[key].close();
const es=ES[key]=new EventSource(`${DB}/${prefix}.json${q?'?'+q:''}`);es.__route=route;ST.open[key]=false;
es.__seen=0;const on=(t,m)=>es.addEventListener(t,e=>{es.__seen=ST.seen[key]=Date.now();txAdd((e.data||'').length);try{const d=JSON.parse(e.data);put('/'+prefix+d.path,d.data,m);if(key==='meta')onMeta().catch(()=>{});else dirty(prefix.split('/')[0])}catch{}});
on('put',0);on('patch',1);es.addEventListener('keep-alive',()=>{es.__seen=ST.seen[key]=Date.now()});
es.onopen=()=>{ST.open[key]=true;es.__seen=ST.seen[key]=Date.now();setSt();flush()};
es.onerror=()=>{ST.open[key]=false;setSt();if(es.readyState===2&&ES[key]===es)setTimeout(()=>{if(ES[key]===es)listen(key,prefix,q)},4000)}}
// ---- «живая» связь: ОДИН поток по лёгкому узлу meta (мгновенно) + короткие запросы данных; если поток недоступен — быстрый опрос ----
const mkey=p=>{const a=String(p).split('/');return(a[0]==='prep'||a[0]==='writeoffs'||a[0]==='shifts'||a[0]==='prepMeta')&&a[1]?a[0]+'_'+a[1]:a[0]};
var JF;
// 9.9.2: одинаковые запросы, летящие одновременно (при старте их несколько), делят ОДИН сетевой запрос; каждый вызов получает свою копию данных
async function jget(p,q,auth){let t='';if(auth){t=await tok();if(!t)throw new Error('auth')}const qs=[q,t?'auth='+t:''].filter(Boolean).join('&'),url=`${DB}/${p}.json${qs?'?'+qs:''}`,F=JF||(JF=Object.create(null));let pr=F[url];
if(!pr){pr=(async()=>{let r;try{r=await fetchFast(url,{},9000)}catch(er){netBad();throw er}if(!r.ok){if(r.status===404)dbBad();const e=new Error('http');e.status=r.status;throw e}const tx=await r.text();txAdd(tx.length);return tx})();F[url]=pr;const done=()=>{if(F[url]===pr)delete F[url]};pr.then(done,done)}
const tx=await pr;let j;try{j=JSON.parse(tx)}catch{dbBad();const e=new Error('http');e.status=0;throw e}okMark();return j}
const MV={},RF={},INF={};let metaBroken=0,pollBusy=0,tickN=0;
const pendingFor=mk=>L.out.some(o=>mkey(o.p)===mk)||(L.hold||[]).some(o=>mkey(o.p)===mk&&o.at&&Date.now()-o.at<72e5);
const BQ_SPAN=150,bqRq=()=>'orderBy=%22%24key%22&startAt=%22'+dAdd(0)+'%22&endAt=%22'+dAdd(BQ_SPAN)+'%22';let bqRangeOk=0;
const rangeSig=meta=>{const t0=dAdd(0);return Object.keys(meta||{}).filter(k=>/^prep(Meta)?_\d{4}-\d{2}-\d{2}$/.test(k)&&k.slice(-10)>=t0).sort().map(k=>k+':'+meta[k]).join(',')};
const rangePend=()=>L.out.some(o=>/^(prep|prepMeta)\//.test(o.p));
const mergeRange=(node,d,from,to)=>{d=d&&typeof d==='object'&&!Array.isArray(d)?d:{};const cur=DATA[node]=DATA[node]&&typeof DATA[node]==='object'?DATA[node]:{};let ch=0;for(const k of Object.keys(cur))if(k>=from&&k<=to&&!(k in d)){delete cur[k];ch=1}for(const[k,v]of Object.entries(d)){if(k<from||k>to)continue;if(sig(cur[k])!==sig(v)){cur[k]=v;ch=1}}bqRangeOk=1;if(ch){DV++;dirty(node)}};
const routeMap=()=>({team:['team'],catalog:['catalog'],orders:['orders','orderBy=%22created%22&limitToLast=80'],prep:['prep/'+pd],prepPrev:['prep/'+dAdd(-1,pd)],prepTom:['prep/'+dAdd(1)],prepToday:['prep/'+dAdd(0)],plan:['plan'],prepLibrary:['prepLibrary'],prepPins:['prepPins'],prepCats:['prepCats'],writeoffs:['writeoffs/'+(tab==='writeoff'?wd:dAdd(0))],sched:['sched'],shifts:['shifts/'+dAdd(1)],shiftsLast:['shifts/_last'],shiftsHide:['shifts/_hide'],prepMeta:['prepMeta/'+pd],prepMetaTom:['prepMeta/'+dAdd(1)],prepMetaToday:['prepMeta/'+dAdd(0)],prepMetaT2:['prepMeta/'+dAdd(2)],prepMetaT3:['prepMeta/'+dAdd(3)],prepMetaUp:['prepMeta',bqRq(),'','range'],prepUp:['prep',bqRq(),'','range'],prepT2:['prep/'+dAdd(2)],prepT3:['prep/'+dAdd(3)],cfg:['plan/cfg'],seen:['plan/seen/'+dAdd(1)],woPrev:['writeoffs/'+dAdd(-1)],payroll:['payroll','',true],receipts:['receipts','orderBy=%22%24key%22&limitToLast=80']});
const activeKeys=()=>{const keys=new Set(['team','cfg','prepMetaToday','prepMetaTom','shiftsHide']);const bl=bqLook();if(bl>=2)keys.add('prepMetaT2');if(bl>=3)keys.add('prepMetaT3');if(tab==='prep'){keys.add('prepToday');keys.add('prepTom');if(bl>=2)keys.add('prepT2');if(bl>=3)keys.add('prepT3')}if(tab==='order'){keys.add('catalog');keys.add('shifts');keys.add('shiftsLast');keys.add('sched');keys.add('seen');keys.add('orders');keys.add('receipts')}if(tab==='writeoff'){keys.add('catalog');keys.add('writeoffs');keys.add('woPrev')}if(tab==='recv'){keys.add('catalog');keys.add('orders');keys.add('receipts')}if(tab==='prep'||dialogOpen('#dbt')){keys.add('prepMetaUp');keys.add('prepUp')}if(tab==='prep'){keys.add('prep');keys.add('prepMeta');keys.add('prepPrev');keys.add('plan');keys.add('prepLibrary');keys.add('prepPins');keys.add('prepCats')}if(dialogOpen('#dcat'))keys.add('prepCats');if(tab==='sched'){keys.add('sched');keys.add('prepPins')}if(tab==='cab'){keys.add('sched');if(isAdmin())keys.add('payroll')}if(dialogOpen('#dr')||dialogOpen('#dh')||SNDK){['shifts','shiftsLast','sched','seen','prepTom','prepToday','prepMetaTom','prepMetaToday','writeoffs','woPrev','catalog'].forEach(k=>keys.add(k))}if(dialogOpen('#dh'))keys.add('orders');return keys};
const atPath=p=>{let o=DATA;for(const k of String(p).split('/')){if(o==null||typeof o!=='object')return null;o=o[k]}return o===undefined?null:o};
const sig=v=>JSON.stringify(v===undefined?null:v);
const HEAVY={orders:1,receipts:1,sched:1,payroll:1},HV={},HEAVY_MS=12e4,metaOk=()=>!metaBroken&&Object.keys(DATA.meta||{}).length>0;
function onMeta(force,soft){if(DEMO||!DB)return Promise.resolve();try{liveCheck();presCheck()}catch(e){}const routes=routeMap(),meta=DATA.meta||{},jobs=[];if(tab==='cab'&&isAdmin()&&MV.cabinet!==meta.cabinet){MV.cabinet=meta.cabinet;loadIn()}
activeKeys().forEach(k=>{const r=routes[k];if(!r)return;const rg=r[3]==='range',mk=mkey(r[0]),want=r[0]+'|'+(r[1]||'')+'#'+(rg?rangeSig(meta):(meta[mk]||0)),pend=()=>rg?rangePend():pendingFor(mk);if(MV[k]===want&&(!force||(soft&&HEAVY[k]&&metaOk()&&Date.now()-(HV[k]||0)<HEAVY_MS)))return;if(pend())return;const inf=INF[k],rf=RF[k];if((inf&&Date.now()-inf<15000)||(rf&&Date.now()<rf.at))return;INF[k]=Date.now();
jobs.push(jget(r[0],r[1],r[2]).then(d=>{delete INF[k];delete RF[k];if(pend())return;MV[k]=want;HV[k]=Date.now();if(rg){mergeRange(r[0],d,dAdd(0),dAdd(BQ_SPAN));return}if(sig(atPath(r[0]))===sig(d))return;put('/'+r[0],d);dirty(r[0].split('/')[0])}).catch(e=>{delete INF[k];const n=(RF[k]?RF[k].n:0)+1;RF[k]={n,at:Date.now()+Math.min(20000,2500*Math.pow(2,n-1))};if(r[2])return;throw e}))});
return Promise.all(jobs)}
let MPT=0,MPF=0;const metaMax=m=>{let x=0;for(const v of Object.values(m||{}))if(typeof v==='number'&&v>x)x=v;return x};
async function pollMeta(force,soft){if(pollBusy||DEMO||!DB||document.hidden)return;pollBusy=1;
try{const sse=ST.open.meta&&!metaBroken;if(!sse&&!metaBroken){const nw=Date.now();if(!MPT||force||nw-MPF>3e4||!Object.keys(DATA.meta||{}).length){DATA.meta=(await jget('meta'))||{};MPF=nw;MPT=metaMax(DATA.meta)}else{const d=await jget('meta','orderBy=%22%24value%22&startAt='+Math.max(0,MPT-6e5));if(d&&typeof d==='object'){const m=DATA.meta||(DATA.meta={});for(const[k,v]of Object.entries(d)){if(v&&typeof v==='object')m[k]=v;else{m[k]=v;if(typeof v==='number'&&v>MPT)MPT=v}}}}}const noMeta=!Object.keys(DATA.meta||{}).length;onMeta(force||metaBroken||noMeta,soft).catch(()=>{})}catch{}
pollBusy=0;setSt()}
const streams=()=>{Object.keys(ES).forEach(k=>{if(k!=='meta'){ES[k].close();delete ES[k];ST.open[k]=false}});listen('meta','meta');pollMeta(false)};
const restartStreams=()=>{Object.keys(ES).forEach(k=>{try{ES[k].close()}catch{}delete ES[k];ST.open[k]=false});streams()};
async function bumpMeta(){while(L.mt&&L.mt.length&&!metaBroken){const k=L.mt.shift();saveL();try{await api('PUT','meta/'+k,Date.now())}catch(e){if([400,401,403,404].includes(e.status)){metaBroken=1;L.mt.length=0;saveL();break}if(L.mt.indexOf(k)<0)L.mt.unshift(k);saveL();throw e}}}
// ---------- каталог ----------
const cat0=()=>DATA.catalog||{};
const prods=()=>PC||(PC=[...base.filter(p=>!(cat0().hidden||{})[ek(p.id)]).map(p=>{const e=(cat0().edits||{})[ek(p.id)];return e?{...p,n:e.n||p.n,u:e.u||p.u}:p}),...Object.entries(cat0().custom||{}).map(([k,v])=>({id:'c:'+k,k,n:v.n,c:v.c,u:v.u}))].sort((a,b)=>COL.compare(a.n,b.n)));
const cats=()=>[...BASE.map(([id,n,e])=>({id,n,e})),...Object.entries(cat0().groups||{}).map(([k,v])=>({id:k,n:v.n,e:v.e||'📦',g:1}))];
const teamBuild=()=>{const isC=c=>c.n.trim().toLowerCase()==='хоссам',a=Object.entries(DATA.team||{}).map(([id,v])=>({id,n:String(v.n||''),r:String(v.r||''),color:String(v.color||''),u:String(v.u||'').replace(/^@+/,''),pw:v.pw?1:0}));if(!a.some(isC))a.push({id:'chef-hossam',n:'Хоссам',r:'Шеф',u:'',virtual:true});a.forEach(c=>{c.ch=isC(c)});return a.sort((x,y)=>x.ch===y.ch?COL.compare(x.n,y.n):x.ch?-1:1)};
let TM_S=null,TM_V=null;
const team=()=>{const s=JSON.stringify(DATA.team||null);if(s!==TM_S||!TM_V){TM_S=s;TM_V=teamBuild()}return TM_V.slice()};
const PALETTE=['#b91c1c','#c2410c','#a16207','#4d7c0f','#15803d','#0f766e','#0369a1','#1d4ed8','#6d28d9','#a21caf','#be123c','#475569'];
const hashColor=id=>{let h=2166136261,s=String(id);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return PALETTE[h%PALETTE.length]};
const cookColor=id=>{const c=team().find(x=>x.id===id);return c&&PALETTE.includes(c.color)?c.color:hashColor(id)};
const ensureTeamColors=()=>{if(isObs())return;const used=[];team().forEach(k=>{if(k.virtual){used.push(hashColor(k.id));return}let c=PALETTE.includes(k.color)&&!used.includes(k.color)?k.color:'';if(!c)c=PALETTE.find(x=>!used.includes(x))||hashColor(k.id);used.push(c);if(k.color!==c)mut('PATCH','team/'+k.id,{color:c})})};
const isWork=s=>s===true||s==='Р'||!!(s&&(s.work||s.r==='Р'||s.f||s.t));
const workLabel=s=>s&&s.f&&s.t?`${s.f}–${s.t}`:(s&&s.r?s.r:'Р');
const norm=o=>({...o,items:Array.isArray(o.items)?o.items:Object.values(o.items||{}),note:o.note||''});
const ords=()=>Object.values(DATA.orders||{}).filter(o=>o&&o.id&&o.cook).map(norm).sort((a,b)=>b.created-a.created);
const dI=()=>Object.values(L.draft.items),cnt=()=>dI().length;
const syncDraft=()=>{const m=new Map(prods().map(p=>[p.id,p]));for(const it of dI()){const p=m.get(it.id);if(p)it.n=p.n}saveL()};
// ---------- интерфейс ----------
const unitSel=(id,u)=>{const us=UNITS.includes(u)?UNITS:[...UNITS,u];return `<select class="us" data-un="${esc(id)}" aria-label="Единица">${us.map(x=>`<option${x===u?' selected':''}>${esc(x)}</option>`).join('')}</select>`};
const ugBtn=(id,on)=>`<button class="ug${on?' on':''}" data-a="urg" data-id="${esc(id)}" aria-pressed="${on?'true':'false'}" aria-label="${on?'Срочно. Снять отметку':'Отметить как срочно'}">🚨</button>`;
const stepper=it=>`<div class="st"><button data-a="dec" data-id="${esc(it.id)}">−</button><input inputmode="decimal" data-q="${esc(it.id)}" value="${fmtQ(it.qty)}" aria-label="Количество">${unitSel(it.id,it.u)}<button data-a="inc" data-id="${esc(it.id)}">+</button></div>`;
// ---------- «живой» черновик заказа: что сейчас набирают другие повара (узел meta/live/<устройство>, правила менять не нужно) ----------
const LIVE_TTL=45*6e4;let liveTm=0,liveAct=Date.now(),liveSig='',liveAt=0,LVO=[],LVMAP=new Map(),LVSIG='';
const liveSnap=()=>{const it=dI();if(!it.length)return null;const c=L.draft.cook||L.me,i={};it.forEach(x=>{i[ek(x.id)]={n:x.n,q:x.qty,u:x.u,...(x.urg?{g:1}:{})}});return{c:c?{id:c.id,n:c.n}:null,d:L.draft.date,e:L.draft.editId?1:0,i}};
const liveSend=async force=>{if(DEMO||!DB)return;const snap=liveSnap(),sg=snap?JSON.stringify(snap):'';if(sg===liveSig&&!force)return;
try{if(snap)await api('PUT','meta/live/'+DEV,{...snap,t:Date.now()});else await api('DELETE','meta/live/'+DEV);liveSig=sg;liveAt=Date.now();
const lv=((DATA.meta=DATA.meta||{}).live=DATA.meta.live||{});if(snap)lv[DEV]={...snap,t:liveAt};else delete lv[DEV]}catch(e){}};
liveSoon=()=>{if(DEMO||!DB)return;clearTimeout(liveTm);liveTm=setTimeout(liveSend,450)};
const liveBeat=()=>{if(document.hidden||Date.now()-liveAct>18e5)return;if(liveSnap()&&Date.now()-liveAt>24e4)liveSend(true);else liveSoon()};
const liveOthers=()=>{const lv=(DATA.meta||{}).live;if(!lv||typeof lv!=='object')return[];const now=Date.now(),me=(L.draft.cook||L.me||{}).id;
return Object.entries(lv).filter(([k,v])=>k!==DEV&&v&&!(me&&v.c&&v.c.id===me)&&typeof v==='object'&&v.i&&typeof v.i==='object'&&now-(Number(v.t)||0)<LIVE_TTL).map(([k,v])=>({k,t:Number(v.t)||0,c:v.c&&v.c.n?v.c:null,d:RXD.test(String(v.d||''))?v.d:'',items:Object.entries(v.i).filter(([,x])=>x&&typeof x==='object').map(([id,x])=>({id,n:String(x.n||''),q:Number(x.q)||0,u:String(x.u||''),g:!!x.g}))})).filter(x=>x.items.length).sort((a,b)=>b.t-a.t)};
const liveName=x=>x.c?x.c.n:'Кто-то',liveCol=x=>x.c?cookColor(x.c.id):'var(--mu)';
const livePills=id=>{const a=LVMAP.get(ek(id));if(!a)return'';return `<i class="lv" data-k="${a.map(z=>z.x.k+z.x.t).join(',')}">${a.map(z=>`<b style="--c:${liveCol(z.x)}">${esc(liveName(z.x))} · ${esc(fmtQ(z.i.q))} ${esc(z.i.u)}${z.i.g?' 🚨':''}</b>`).join('')}</i>`};
const liveAgo=t=>{const m=Math.round((Date.now()-t)/6e4);return m<1?'только что':m<60?m+' мин назад':Math.floor(m/60)+' ч назад'};
const rLive=()=>{if(tab!=='order'||scrollY<4)return rLive0();const ref=[...document.querySelectorAll('#list .it[data-r]')].find(r=>{const q=r.getBoundingClientRect();return q.bottom>60&&q.top<innerHeight}),t0=ref?ref.getBoundingClientRect().top:null;rLive0();if(ref&&ref.isConnected&&t0!==null){const d=ref.getBoundingClientRect().top-t0;if(Math.abs(d)>1)window.scrollTo({top:Math.max(0,scrollY+d),behavior:'instant'})}};
const rLive0=()=>{const box=$('#livebox');if(!box)return;const o=LVO;
if(!o.length){box.hidden=true;box.innerHTML='';box.dataset.k='';document.querySelectorAll('#list .it .n>i.lv').forEach(e=>e.remove());return}
if(tab==='order'){const k=LVSIG+'|'+Math.floor(Date.now()/6e4);if(box.dataset.k!==k){const was=box.open;box.dataset.k=k;box.hidden=false;
box.innerHTML=`<summary class="wrapt">👥 Сейчас набирают заказ: <b>${o.map(x=>esc(liveName(x))+' · '+x.items.length).join(' · ')}</b></summary><div class="lvl">`+o.map(x=>`<div class="lvw"><div class="lvh"><i class="lvd" style="--c:${liveCol(x)}"></i><b>${esc(liveName(x))}</b><small>${x.d?'поставка '+esc(day(x.d))+' · ':''}${esc(liveAgo(x.t))}</small><button class="lvx" data-a="lvdel" data-id="${esc(x.k)}" aria-label="Убрать запись">✕</button></div>`+[...x.items].sort((a,b)=>COL.compare(a.n,b.n)).map(i=>`<div class="lvi${i.g?' urg':''}"><span>${i.g?'🚨 ':''}${esc(i.n)}</span><b>${esc(fmtQ(i.q))} ${esc(i.u)}</b></div>`).join('')+`</div>`).join('')+`</div>`;box.open=was}}
document.querySelectorAll('#list .it[data-r]').forEach(r=>{const h=livePills(r.dataset.r),cur=r.querySelector('.n>i.lv');if(!h){if(cur)cur.remove();return}const m=/data-k="([^"]*)"/.exec(h);if(cur){if(cur.dataset.k!==(m?m[1]:''))cur.outerHTML=h}else{const n=r.querySelector('.n');if(n)n.insertAdjacentHTML('beforeend',h)}})};
// ---------- присутствие (9.5): кто сейчас в приложении; не раскрываем кабинет и админку ----------
const PRES_TTL=15e4,PNAME={order:'Заказ',prep:'Заготовки',sched:'График',writeoff:'Списание',recv:'Приёмка'};let presTm=0,presSig='',presAt=0,PRO=[],PRSIG='';
const presMe=()=>{const c=L.draft.cook||L.me;return c&&c.id?{id:String(c.id),n:String(c.n||'')}:null};
const presSnap=()=>({c:presMe(),p:PNAME[tab]||'',v:VER});
const presSend=async force=>{if(DEMO||!DB||!navigator.onLine)return;const s=presSnap(),sg=JSON.stringify(s);if(sg===presSig&&!force)return;try{await api('PUT','meta/pres/'+DEV,{...s,t:Date.now()});presSig=sg;presAt=Date.now()}catch(e){}};
const presSoon=()=>{if(DEMO||!DB)return;clearTimeout(presTm);presTm=setTimeout(presSend,600)};
const presClean=async()=>{const now=Date.now(),dl={};for(const[key,lim]of[['pres',36e5],['live',72e5]]){const o=(DATA.meta||{})[key];if(o&&typeof o==='object')Object.keys(o).forEach(k=>{const v=o[k];if(k!==DEV&&(!v||typeof v!=='object'||now-(Number(v.t)||0)>lim))dl[key+'/'+k]=null})}const ks=Object.keys(dl).slice(0,40);if(!ks.length)return;try{const p={};ks.forEach(k=>p[k]=null);await api('PATCH','meta',p);ks.forEach(k=>{const[a,b]=k.split('/');if(DATA.meta&&DATA.meta[a])delete DATA.meta[a][b]})}catch(e){}};
const presBeat=()=>{if(document.hidden||Date.now()-liveAct>6e5)return;if(Date.now()-presAt>5e4){presSend(true);presClean()}else presSoon()};
const presOthers=()=>{const pr=(DATA.meta||{}).pres;if(!pr||typeof pr!=='object')return[];const now=Date.now(),me=(L.draft.cook||L.me||{}).id,m=new Map(),names=Object.values(PNAME);
Object.entries(pr).forEach(([k,v])=>{if(k===DEV||!v||typeof v!=='object'||now-(Number(v.t)||0)>PRES_TTL)return;const c=v.c&&v.c.id&&v.c.n?{id:String(v.c.id),n:String(v.c.n)}:null;if(c&&c.id===me)return;const key=c?c.id:'?'+k,o=m.get(key),t=Number(v.t)||0;if(!o||t>o.t)m.set(key,{k,c,p:names.includes(v.p)?String(v.p):'',t})});
return[...m.values()].sort((a,b)=>b.t-a.t)};
const rPres=()=>{const b=$('#presb');if(!b)return;const o=PRO;if(!o.length){b.hidden=true;b.innerHTML='';b.dataset.k='';return}
if(b.dataset.k===PRSIG&&!b.hidden)return;b.dataset.k=PRSIG;const was=b.open,nm=x=>x.c?x.c.n:'Кто-то',col=x=>x.c?cookColor(x.c.id):'var(--mu)';b.hidden=false;
b.innerHTML=`<summary class="wrapt"><i class="prd" aria-hidden="true"></i>В сети: <b>${o.slice(0,3).map(x=>esc(nm(x))).join(' · ')}${o.length>3?' +'+(o.length-3):''}</b></summary><div class="prl">`+o.map(x=>`<div class="prw"><i class="lvd" style="--c:${col(x)}"></i><b>${esc(nm(x))}</b><small>${x.p?esc(x.p):'в приложении'}</small></div>`).join('')+`</div>`;b.open=was};
const presCheck=()=>{const o=presOthers(),sg=JSON.stringify(o.map(x=>[x.k,x.p,x.c&&x.c.n]));if(sg===PRSIG&&PRO.length===o.length)return;PRSIG=sg;PRO=o;rPres()};
{const act=()=>{const n=Date.now(),was=liveAct;if(n-was<1500)return;liveAct=n;if(n-was>18e5){try{liveSoon();presSoon()}catch(e){}}};['pointerdown','keydown','touchstart','scroll'].forEach(ev=>addEventListener(ev,act,{passive:true,capture:true}));addEventListener('visibilitychange',()=>{if(!document.hidden){liveAct=Math.max(liveAct,Date.now()-1);try{presSoon();liveSoon()}catch(e){}}})}
// реестр устройств: devices/<DEV> — читает только шеф (последний вход, версия, неотправленное)
const uaShort=()=>{const u=navigator.userAgent||'',os=/iPhone|iPad|iPod/.test(u)?'iOS':/Android/.test(u)?'Android':/Windows/.test(u)?'Windows':/Mac/.test(u)?'Mac':'?';let st='';try{st=(navigator.standalone||matchMedia('(display-mode: standalone)').matches)?'PWA':'браузер'}catch(e){}return(os+' · '+st+(/Telegram/i.test(u)?' · Telegram':'')).slice(0,40)};
const devSend=async()=>{if(DEMO||!DB||!navigator.onLine||document.hidden)return;const now=Date.now(),last=Number(LS.get('vip3-dv',0))||0;if(now-last<6e5)return;try{await api('PUT','devices/'+DEV,{t:now,v:VER,...(presMe()?{c:presMe()}:{}),q:L.out.length+((L.hold&&L.hold.length)||0),u:uaShort()});LS.set('vip3-dv',now)}catch(e){if(e&&[400,401,403,404].includes(e.status))LS.set('vip3-dv',now)}};

const liveCheck=()=>{const mine=((DATA.meta||{}).live||{})[DEV];if(mine&&!liveSnap()&&!liveSig&&DB&&!DEMO){liveSig='x';liveSend(true).then(()=>{liveSig=''})}
const o=liveOthers(),sg=JSON.stringify(o.map(x=>[x.k,x.t]));if(sg===LVSIG)return;LVSIG=sg;LVO=o;LVMAP=new Map();o.forEach(x=>x.items.forEach(i=>{const a=LVMAP.get(i.id)||[];a.push({x,i});LVMAP.set(i.id,a)}));if(tab==='order')rLive()};
const row=p=>{const it=L.draft.items[p.id],i=esc(p.id);return `<div class="it${it?' on':''}${it&&it.urg?' urg':''}" data-r="${i}"><div class="n">${esc(p.n)}${ugBtn(p.id,it&&it.urg)}${livePills(p.id)}</div>${it?stepper(it):`<button data-a="add" data-id="${i}" aria-label="Добавить">＋ ${esc(L.lu[p.id]||p.u)}</button>`}${ed()?`<button class="x" data-a="editp" data-id="${i}" aria-label="Изменить">✎</button><button class="x" data-a="delp" data-id="${i}" aria-label="Удалить товар">✕</button>`:''}</div>`};
const chipsFor=(act,sel)=>team().map(k=>`<button class="chip${sel&&sel.id===k.id?' on':''}" data-a="${act}" data-id="${k.id}">${esc(k.n)}<small>${esc(k.r)}</small></button>`).join('')||'<span style="color:var(--mu)">Повара не добавлены — обратитесь к руководителю</span>';
const rCooks=()=>{$('#cooks').innerHTML=chipsFor('pick',L.draft.cook)};
const rPCooks=()=>{$('#pcooks').innerHTML=chipsFor('me',L.me)};
const rCats=()=>{const cs=cats(),n=s=>cs.find(c=>c.id===s);$('#cats').innerHTML=`<button class="chip${cat==='all'?' on':''}" data-a="cat" data-id="all">Все</button>`+cs.map(c=>`<button class="chip${cat===c.id?' on':''}" data-a="cat" data-id="${c.id}">${c.e} ${esc(c.n.split(' и ')[0].split(',')[0])}</button>`).join('')+`<button class="chip" data-a="newg">＋ Группа</button>`+(ed()&&n(cat)&&n(cat).g?`<button class="chip" data-a="editg">✎ Группа</button><button class="chip" style="color:var(--rd)" data-a="delg">🗑 Удалить группу</button>`:'')};
const rList=()=>{const q=qs.trim().toLowerCase(),cs=cats();let h='';const ps=prods().filter(p=>(cat==='all'||p.c===cat)&&(!q||p.n.toLowerCase().includes(q)));
for(const c of cs){const g=ps.filter(p=>p.c===c.id);if(g.length)h+=(cat==='all'||q?`<div class="gh">${c.e} ${esc(c.n)}</div>`:'')+g.map(row).join('')}
$('#list').innerHTML=h||`<div class="em">Ничего не найдено.<br>Нажмите «＋ Товар», чтобы добавить.</div>`;rLive()};
const sumDn=()=>{$('#dnsum').textContent='📅 Поставка '+day(L.draft.date)+(L.draft.note?' · 💬 '+L.draft.note.slice(0,22):'')};
const placeInd=()=>{const nav=document.querySelector('.tabs'),on=nav&&nav.querySelector('.tab.on'),ind=nav&&nav.querySelector('.tabind');if(!on||!ind)return;if(!on.offsetWidth)return;ind.style.width=on.offsetWidth+'px';ind.style.transform='translateX('+on.offsetLeft+'px)';nav.classList.add('ind')};
const rBar=()=>{$('#cnt').textContent=cnt()?cnt()+' поз.':'пусто';setDp($('#date'),L.draft.date);$('#note').value=L.draft.note;fitNote();sumDn();try{rBack()}catch(e){console.error('rBack',e)}};
function fitNote(){const n=$('#note');if(!n||!n.scrollHeight)return;n.style.height='auto';n.style.height=Math.min(n.scrollHeight+2,260)+'px'}
const rRev=()=>{const it=dI(),c=L.draft.cook;$('#rc').innerHTML=c?esc(c.n)+' — '+esc(c.r):'<span style="color:var(--rd)">не выбран</span>';
$('#rb').innerHTML=it.length?it.sort((a,b)=>COL.compare(a.n,b.n)).map(i=>`<div class="it on${i.urg?' urg':''}"><div class="n">${esc(i.n)}${ugBtn(i.id,i.urg)}</div>${stepper(i)}<button class="x" data-a="rm" data-id="${esc(i.id)}">✕</button></div>`).join(''):'<div class="em">Список пуст</div>'};
const rTeam=()=>{try{pwMig()}catch(e){}{const e=$('#adsT');if(e)e.textContent=team().length?String(team().length):''}$('#tl').innerHTML=team().length?team().map(k=>`<div class="it"><div class="n">${esc(k.n)}<i>${esc(k.r)}${k.u?' · @'+esc(k.u):''}${k.pw?' · 🔒 пароль':''}</i></div>${k.virtual?'':`<button class="x" data-a="paypw" data-id="${esc(k.id)}" aria-label="Пароль" title="Пароль повара">🔑</button>`}<button class="x" data-a="cuser" data-id="${esc(k.id)}" aria-label="Username" title="Username">@</button>${k.virtual?'':`<button class="x" data-a="delc" data-id="${esc(k.id)}">✕</button>`}</div>`).join(''):'<div class="em">Добавьте поваров с должностями</div>'};
const rAdm=()=>{rDs();try{rBk()}catch(e){}{const e=$('#adsC');if(e){const h2=Object.keys(cat0().hidden||{}).length;e.textContent=ed()?'правка ВКЛ':(h2?'скрыто: '+h2:'')}}const b=$('#edb');b.textContent='Режим правки товаров: '+(ed()?'ВКЛ':'выкл');b.className=ed()?'d':'';const h=Object.keys(cat0().hidden||{}).length,u=$('#unh');u.textContent='Вернуть скрытые ('+h+')';u.disabled=!h};
const nt=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();let qb=0,tk=null;
const PU=['порц','кг','г','л','мл','шт','уп','кор','пак','бан','бут','пуч'];
const PCATS0=[['cut','🔪','Нарезка'],['sauce','🥫','Соусы'],['hot','🍲','Горячее'],['cold','🥗','Холодное'],['meat','🥩','Мясо и рыба'],['side','🍚','Гарниры'],['dess','🍰','Десерты'],['bake','🥖','Выпечка и тесто'],['other','📦','Другое']];
let lf='all',CL=null,psec=LS.get('vip3-psec','main'),bqt=(v=>v==='prep'||v==='info'?v:'')(LS.get('vip3-bqt','')),svd=null,pc=null,acctData=null,ses=null,cabPick=null,idleT=0,hideT=0,inBusy=0;
const seenRows=new Set(),justDone=new Set(),justSrv=new Set(),canServe=()=>isAdmin()||!!AU.rt,isSv=t=>!!(t&&t.sd),isPrepd=t=>!!(t&&(t.done||t.sd));
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
const CLOSE_ITEMS=['Кухня в порядке','Розетки выключены','Фритюр выкл.','Печь пекаря выкл.','Плита хол. цеха: вилка вынута','Кнопки 4, 6, 7, 9 выкл.','Тестомес чистый','Чисто на кухне','Мусор вынесен'];
const SELK=[['ord','🧾','Заказ'],['wo','🗑','Списания сегодня'],['prep','📋','Заготовки на завтра'],['bq','🎉','Банкет на завтра'],['left','🔁','Осталось с сегодня'],['shift','⏰','Смена на завтра'],['close','🔒','Закрытие кухни']];
const sdAvail=(o,hasOrd)=>{const P=tomorrowParts(),wn=woRows(dAdd(0)).length,c=(n,w)=>n?n+' '+rupl(n,w):'нет',pz=['позиция','позиции','позиций'];
return{ord:{n:hasOrd?o.items.length:0,s:hasOrd?c(o.items.length,pz):'корзина пуста'},wo:{n:wn,s:c(wn,pz)},prep:{n:P.np,s:c(P.np,['заготовка','заготовки','заготовок'])},
bq:{n:P.nb,s:P.nb?P.nb+' '+rupl(P.nb,['банкет','банкета','банкетов'])+(P.nd?' · '+P.nd+' '+rupl(P.nd,['блюдо','блюда','блюд']):''):'нет'},left:{n:P.nl,s:c(P.nl,pz)},shift:{n:P.ns,s:c(P.ns,['повар','повара','поваров'])},close:{n:1,s:CLOSE_ITEMS.length+' пунктов'}}};
const sdDefault=(o,hasOrd,av)=>{const all=!hasOrd||o.date===dAdd(1),on=k=>all&&av[k].n>0?1:0;return{ord:hasOrd?1:0,wo:on('wo'),prep:on('prep'),bq:on('bq'),left:on('left'),shift:on('shift'),close:hasOrd?1:0}};
const sendPanel=(o,hasOrd)=>new Promise(res=>{const d=$('#dcl'),av=sdAvail(o,hasOrd),sel=sdDefault(o,hasOrd,av),sv=LS.get('vip3-sel',null),st=CLOSE_ITEMS.map(()=>0);
if(sv&&sv.d===dAdd(0)&&sv.s&&typeof sv.s==='object')for(const[k]of SELK)if(k!=='ord'&&k in sv.s)sel[k]=sv.s[k]?1:0;
for(const[k]of SELK)if(k!=='close'&&!av[k].n)sel[k]=0;
const draw=()=>{const S=CL;if(!S)return;const n=S.st.reduce((a,b)=>a+b,0),sc=!!S.sel.close;
$('#sdl').innerHTML=SELK.map(([k,e,t])=>{const a=S.av[k],dis=!a.n,on=!dis&&!!S.sel[k];return `<button class="spr${on?' on':''}${dis?' dis':''}" data-a="sdt" data-id="${k}" aria-pressed="${on}"${dis?' disabled':''}><span class="ck">${on?'✓':''}</span><span class="spn"><b>${e} ${t}</b><small>${esc(a.s)}</small></span></button>`}).join('');
const ck=$('#sdck');if(ck&&document.activeElement!==ck){const k=team(),cur=S.o.cook&&S.o.cook.id||'';ck.innerHTML=(cur?'':'<option value="">Выберите…</option>')+k.map(c=>`<option value="${esc(c.id)}"${c.id===cur?' selected':''}>${esc(c.n)}${c.pw?' 🔒':''}</option>`).join('')}
$('#sdc').hidden=!sc;$('#clist').innerHTML=CLOSE_ITEMS.map((x,i)=>`<button class="cl${S.st[i]?' on':''}" data-a="clchk" data-id="${i}"><span class="ck">${S.st[i]?'✓':''}</span><span>${esc(x)}</span></button>`).join('');$('#cprog').textContent=`${n} из ${CLOSE_ITEMS.length}`;
const any=SELK.some(([k])=>S.sel[k]);$('#cgo').disabled=!any||(sc&&n<CLOSE_ITEMS.length)};
CL={st,draw,res,sel,av,o,hasOrd};draw();snd.ask();vib(40);d.onclose=()=>res(false);d.oncancel=()=>res(false);d.showModal()});
const composeMsg=(o,sel,orderIn)=>{const parts=[],td=dAdd(0);
if(orderIn)parts.push(msg({...o,closed:false},false));else parts.push(`📋 Сводка кухни · ${day(td)}`+(o.cook?`\n👨‍🍳 ${o.cook.n}${o.cook.r?', '+o.cook.r:''}`:'')+`\n🕒 ${tm(Date.now())}`);
if(sel.wo){const rows=woRows(td);if(rows.length)parts.push(writeoffMessage(td,rows))}
const tb=tomorrowBlock(sel);if(tb)parts.push(tb);
if(sel.close&&o.cook)parts.push('🔒 Кухня закрыта ✓ (проверил: '+o.cook.n+')');
return parts.join('\n\n')};
const composeExtra=(o,sel)=>{const p=[],td=dAdd(0);if(sel.wo){const rows=woRows(td);if(rows.length)p.push(writeoffMessage(td,rows))}const tb=tomorrowBlock(sel);if(tb)p.push(tb);return p.join('\n\n')};
const guestsOf=d=>{const g=Number(((DATA.prepMeta||{})[d]||{}).guests);return g>0?g:0};
const okTm=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v),svKey=v=>{const m=+v.slice(0,2)*60+ +v.slice(3);return m<360?m+1440:m},svSort=(a,b)=>{const x=okTm(a.sv),y=okTm(b.sv);if(x&&y)return svKey(a.sv)-svKey(b.sv)||(a.c||0)-(b.c||0);if(x!==y)return x?-1:1;return(a.c||0)-(b.c||0)};
const tmHl=d=>d[0]>='3'?1:(d.length>=2&&+d.slice(0,2)<=23?2:1);
const tmTyping=raw=>{const d=String(raw).replace(/\D/g,'').slice(0,4);if(d.length<2)return d;const hl=tmHl(d),r=d.slice(hl,hl+2);return d.slice(0,hl)+(r?':'+r:'')};
const normTm=v=>{v=String(v==null?'':v).trim();if(!v)return'';let h,m;const c=/^(\d{1,2})\s*[:.\-]\s*(\d{1,2})$/.exec(v);
if(c){h=c[1];m=c[2].length===1?c[2]+'0':c[2]}else{const d=v.replace(/\D/g,'').slice(0,4);if(!d)return'';const hl=tmHl(d),r=d.slice(hl,hl+2);h=d.slice(0,hl);m=r===''?'00':r.length===1?r+'0':r}
if(+h>23||+m>59)return'';const o=h.padStart(2,'0')+':'+m;return okTm(o)?o:''};
// ---------- банкеты: несколько в день ----------
// «0» — прежний единственный банкет (поля прямо в prepMeta/<день>). Новые лежат в prepMeta/<день>/b/<id>. Блюдо: g:'banq', bq:<id> (нет bq → «0»).
const rupl=(n,a)=>a[n%10===1&&n%100!==11?0:n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?1:2];
const bqOf=t=>String((t&&t.bq)||'0');
const bqCalc=(m,ds)=>{m=m&&typeof m==='object'?m:{};ds=ds&&typeof ds==='object'?ds:{};
const gn=v=>{const g=Math.round(Number(v));return g>0&&g<=100000?g:0},mk=(id,v,o)=>({id,title:String(v.title||''),guests:gn(v.guests),time:okTm(v.time)?v.time:'',place:String(v.place||''),note:String(v.note||''),src:v.src==='pre'?'pre':'',pi:String(v.pi||''),o:Number(o!==undefined?o:v.o)||0}),out=[],seen=new Set(),dishes=Object.values(ds).filter(t=>t&&t.t&&t.g==='banq');
if(['title','time','place','note'].some(k=>m[k])||dishes.some(t=>!t.bq)){out.push(mk('0',m,0));seen.add('0')}
Object.entries(m.b&&typeof m.b==='object'?m.b:{}).forEach(([id,v])=>{if(v&&typeof v==='object'&&!seen.has(id)){out.push(mk(id,v));seen.add(id)}});
dishes.forEach(t=>{const id=bqOf(t);if(!seen.has(id)){seen.add(id);out.push(mk(id,{},t.c||0))}});
[...out].sort((a,b)=>a.o-b.o||(a.id<b.id?-1:1)).forEach((b,i)=>{b.n=i+1});
return out.sort((a,b)=>{const x=!!a.time,y=!!b.time;if(x&&y){const d=svKey(a.time)-svKey(b.time);if(d)return d}else if(x!==y)return x?-1:1;return a.n-b.n})};
const bqList=d=>bqCalc((DATA.prepMeta||{})[d],(DATA.prep||{})[d]),bqFind=(d,id)=>bqList(d).find(b=>b.id===id)||null;
const bqName=(b,l)=>b.title||((l||[]).length>1?'Банкет '+b.n:'Банкет'),bqP=(d,id)=>id==='0'?`prepMeta/${d}`:`prepMeta/${d}/b/${id}`;
let bsel=String(LS.get('vip3-bsel','')||'');
const bqCur=l=>{if(bsel==='#')return{id:'#',all:true,tot:true};l=l||bqList(pd);if(!l.length)return null;if(bsel==='*'&&l.length>1)return{id:'*',all:true};return l.find(b=>b.id===bsel)||(l.length>1?{id:'*',all:true}:l[0])};
const bqEff=()=>{const c=bqCur();if(!c||c.all)return'prep';return bqt||(Object.values(dm()).some(t=>t&&t.g==='banq'&&bqOf(t)===c.id)?'prep':'info')};
const inBq=t=>{if(psec!=='banq')return true;const c=bqCur();return!c||c.all||bqOf(t)===c.id};
const bqSelect=id=>{bsel=String(id);LS.set('vip3-bsel',bsel)};
const bqTarget=()=>{const c=bqCur();if(c&&!c.all)return c.id;const l=bqList(pd);if(l.length)return l[0].id;const id='b'+uid();mut('PUT',`prepMeta/${pd}/b/${id}`,{o:Date.now()});bqSelect(id);return id};
const bqTag=g=>{if(g!=='banq')return{};const id=bqTarget();return id==='0'?{}:{bq:id}};
const bqPick=()=>{const l=bqList(pd);if(l.length>1){const v=$('#tkbq').value;if(l.some(b=>b.id===v))return v}return l.length?l[0].id:bqTarget()};
const guestsFor=(t,d)=>{if(t&&t.g==='banq'){const b=bqFind(d,bqOf(t));return b?b.guests:0}return guestsOf(d)};
const bqAsked=new Set();
// дата, которую повар написал в названии («Банкет 20/11»): ищем дд.мм или дд/мм (с годом или без), числа с единицами (2.5 кг) пропускаем
const bqGuess=t=>{const s=String(t||''),re=/(?:^|[^\d.,/])(\d{1,2})[./](\d{1,2})(?:[./](\d{4}|\d{2}))?(?![\d]|[./,]\d)(?!\s?(?:кг|мл|шт|порц|%|г|л)(?![а-яё]))/g,base=dAdd(0);let m;
while((m=re.exec(s))){const d=+m[1],mo=+m[2];let y=m[3]?+m[3]:+base.slice(0,4);if(m[3]&&m[3].length===2)y+=2000;if(mo<1||mo>12||d<1||d>31)continue;const ok=(yy)=>{const dt=new Date(Date.UTC(yy,mo-1,d));return dt.getUTCMonth()===mo-1&&dt.getUTCDate()===d};if(!ok(y))continue;let r=`${y}-${d2(mo)}-${d2(d)}`;if(!m[3]&&r<dAdd(-60,base)&&ok(y+1))r=`${y+1}-${d2(mo)}-${d2(d)}`;return r}return''};
// перенос банкета (данные + все его блюда) на другую дату
const bqMove=(id,from,to)=>{if(!RXD.test(String(to))||from===to)return null;const b=bqFind(from,id);if(!b)return null;
const src=(DATA.prep||{})[from]||{},dst=(DATA.prep||{})[to]||{},nid=id==='0'?'b'+uid():id,mv=Object.entries(src).filter(([,t])=>t&&t.t&&t.g==='banq'&&bqOf(t)===id),meta={o:b.o||Date.now()};
['title','guests','time','place','note'].forEach(k=>{if(b[k])meta[k]=b[k]});
mut('PUT',`prepMeta/${to}/b/${nid}`,meta);
const used=new Set(Object.keys(dst));mv.forEach(([tid,t])=>{let n2=tid;while(used.has(n2))n2=tid+'m'+Math.floor(Math.random()*1e4);used.add(n2);mut('PUT',`prep/${to}/${n2}`,{...t,bq:nid})});
mv.forEach(([tid])=>mut('DELETE',`prep/${from}/${tid}`));
if(id==='0')['title','time','place','note','guests'].forEach(k=>mut('DELETE',`prepMeta/${from}/${k}`));else mut('DELETE',`prepMeta/${from}/b/${id}`);
return nid};
const bqWrite=()=>{const m=bqCur();if(!m||m.all)return true;const pth=bqP(pd,m.id),w=(k,v,old)=>{const nv=v===0?'':String(v);if(nv===String(old||''))return;mut(nv===''?'DELETE':'PUT',`${pth}/${k}`,nv===''?undefined:v)};
w('title',$('#bqt').value.trim().replace(/\s+/g,' ').slice(0,80),m.title);
{const gn=Math.round(Number(String($('#bqg').value).replace(',','.')))||0;w('guests',gn>0&&gn<=100000?gn:0,m.guests||'')}
let good=true;{const raw=$('#bqs').value.trim(),tv=normTm(raw);if(raw&&!tv){good=false;$('#bqs').classList.add('bad')}else{$('#bqs').classList.remove('bad');w('time',tv,m.time);if(tv&&$('#bqs').value!==tv)$('#bqs').value=tv}}
w('place',$('#bqp').value.trim().replace(/\s+/g,' ').slice(0,60),m.place);
w('note',$('#bqn').value.trim().slice(0,400),m.note);return good};
const svChips=bt=>{let a;if(bt){const b=+bt.slice(0,2)*60+ +bt.slice(3);a=[0,30,60,90,120,150].map(x=>{const m=(b+x)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')})}else a=['18:00','19:00','20:00','21:00','22:00','23:00'];return a.map(v=>`<button class="chip" data-a="svset" data-id="${v}">${v}</button>`).join('')};
const qtyText=(t,d)=>{if(t&&t.pg){const g=guestsFor(t,d);return g?`${fmtQ(Math.round(t.pg*g*100)/100)} ${t.pu||''}`.trim():`👥 ${fmtQ(t.pg)} ${t.pu||''}/гость`}return t&&t.q||''};
const qpill=(t,d)=>{const x=qtyText(t,d);return x?`<i class="qpill">${esc(x)}</i>`:'<i class="qpill empty">＋ кол-во</i>'};
// ---------- итого блюд по выбранным банкетам (из разных дней; одинаковые блюда объединяются) ----------
let bsxx=new Set((a=>Array.isArray(a)?a.filter(x=>typeof x==='string'):[])(LS.get('vip3-bsxx',[])));
const bqUk=u=>{u=String(u||'').toLowerCase().replace(/[.\s]+/g,'');if(/^порц\w*$/.test(u))return'порц';if(/^шт\w*$/.test(u))return'шт';if(/^(кг|килограмм\w*|kg)$/.test(u))return'кг';if(/^(г|гр|грамм\w*|g)$/.test(u))return'г';if(/^(л|литр\w*|l)$/.test(u))return'л';if(/^(мл|ml)$/.test(u))return'мл';return u};
const bqNum=q=>{const m=String(q==null?'':q).trim().match(/^(\d+(?:[.,]\d+)?)\s*([A-Za-zА-Яа-яЁё.]{1,14})?$/);if(!m)return null;const v=parseFloat(m[1].replace(',','.'));return isFinite(v)&&v>0?{v,u:bqUk(m[2])}:null};
const bqAdd=(S,v,u)=>{if(u==='кг'){u='г';v*=1000}else if(u==='л'){u='мл';v*=1000}S[u]=(S[u]||0)+v};
const bqSumText=S=>Object.entries(S).sort((a,b)=>(a[0]===''?1:0)-(b[0]===''?1:0)).map(([u,v])=>{if(u==='г'&&v>=1000){v/=1000;u='кг'}else if(u==='мл'&&v>=1000){v/=1000;u='л'}return fmtQ(Math.round(v*1000)/1000)+(u?' '+u:'')}).join(' + ');
const bqKey=x=>x.d+'|'+x.b.id;
// все банкеты ближайших дней (как в «Подготовке к банкетам») + банкеты открытого дня, если он дальше
const bqPool=()=>{const out=upBqAll().map(x=>({d:x.d,i:x.i,b:x.b,l:x.l,its:x.its}));
if(pd>=dAdd(0)&&!out.some(x=>x.d===pd)){const l=bqList(pd),ds=Object.entries((DATA.prep||{})[pd]||{}).map(([id,v])=>({id,...v}));l.forEach(b=>{const its=ds.filter(t=>t&&t.t&&t.g==='banq'&&bqOf(t)===b.id);if(its.length||b.title||b.time||b.guests||b.place||b.note)out.push({d:pd,i:dDiff(pd,dAdd(0)),b,l,its})})}
return out.sort((p,q)=>p.d<q.d?-1:p.d>q.d?1:(p.b.time?svKey(p.b.time):1e9)-(q.b.time?svKey(q.b.time):1e9)||p.b.n-q.b.n)};
const bqSel=pool=>pool.filter(x=>!bsxx.has(bqKey(x)));
const bqSaveSel=()=>{const t0=dAdd(0);bsxx=new Set([...bsxx].filter(k=>k.slice(0,10)>=t0));LS.set('vip3-bsxx',[...bsxx])};
const bqMerge=sel=>{const M=new Map(),multi=new Set(sel.map(x=>x.d)).size>1;
for(const x of sel){const bn=bqName(x.b,x.l)+(multi?' ('+day(x.d)+')':'');
for(const t of x.its){if(!t||!t.t||t.g!=='banq')continue;const k=nt(t.t).replace(/ё/g,'е');let e=M.get(k);if(!e){e={k,name:String(t.t).trim(),S:{},txt:[],by:[],n:0,pr:0,sv:0};M.set(k,e)}
e.n++;if(isPrepd(t))e.pr++;if(isSv(t))e.sv++;
const lab=qtyText(t,x.d);let q=null;
if(t.pg){const g=guestsFor(t,x.d);if(g)q={v:Math.round(t.pg*g*1000)/1000,u:bqUk(t.pu)}}else q=bqNum(t.q);
if(q)bqAdd(e.S,q.v,q.u);else if(lab&&!e.txt.includes(lab))e.txt.push(lab);
e.by.push(bn+': '+(lab||'—'))}}
return[...M.values()].sort((a,b)=>COL.compare(a.name,b.name))};
const bqTotQ=e=>[bqSumText(e.S),...e.txt].filter(Boolean).join(' + ');
const bqGuests=sel=>sel.reduce((a,x)=>a+(Number(x.b.guests)||0),0);
const bqPickRow=(x,on)=>{const sub=[relDay(x.i)+' · '+day(x.d),x.b.time&&'🕐 '+x.b.time,x.b.guests&&'👥 '+x.b.guests,x.its.length+' '+rupl(x.its.length,['блюдо','блюда','блюд'])].filter(Boolean).join(' · ');
return `<button class="bqt-p${on?' on':''}" style="--bq:${bqCol(x.d,x.b)}" data-a="bqtpick" data-id="${esc(bqKey(x))}" aria-pressed="${on?'true':'false'}"><span class="bqt-ck">${on?'✓':''}</span><span class="bqt-t"><b>🎉 ${esc(bqName(x.b,x.l))}</b><small>${esc(sub)}</small></span></button>`};
let bqFold=false;const bqTotHtml=fold=>{const pool=bqPool(),sel=bqSel(pool),M=bqMerge(sel),gs=bqGuests(sel),n=M.length,pr=M.reduce((a,e)=>a+e.pr,0),sv=M.reduce((a,e)=>a+e.sv,0),all=M.reduce((a,e)=>a+e.n,0);
const pk0=null;if(!pool.length)return'<div class="em">Банкетов в ближайшие дни нет.<br>Добавьте банкет — и заготовки к нему.</div>';
const head=`<div class="bqt-h"><div><b>Σ Итого блюд</b><small>${sel.length} из ${pool.length} ${rupl(pool.length,['банкета','банкетов','банкетов'])}${gs?` · 👥 ${gs}`:''} · ${n} ${rupl(n,['блюдо','блюда','блюд'])}</small></div><button class="g" data-a="bqtcopy"${M.length?'':' disabled'}>📋 Копировать</button></div>`;
const pick=`<div class="bqt-lbl"><span>Выберите банкеты для суммы</span><span><button class="bqt-m" data-a="bqtall">Все</button><button class="bqt-m" data-a="bqtnone">Снять</button></span></div><div class="bqt-pick">${pool.map(x=>bqPickRow(x,!bsxx.has(bqKey(x)))).join('')}</div>`;
const pk=fold?`<details class="bqt-fold"${bqFold?' open':''}><summary>☑ Выбрано ${sel.length} из ${pool.length} · изменить</summary>${pick}</details>`:pick;
if(!sel.length)return head+pk+'<div class="em">Отметьте хотя бы один банкет выше.</div>';
if(!M.length)return head+pk+'<div class="em">В выбранных банкетах пока нет заготовок.</div>';
return head+pk+`<div class="small bqt-lg">Заготовок: ${all} · ✓ приготовлено: ${pr} · 🍽 подано: ${sv}</div>`+M.map(e=>{const q=bqTotQ(e);return `<div class="bqt-r${e.n&&e.sv===e.n?' sd':e.n&&e.pr===e.n?' ok':''}"><div class="bqt-n"><b>${esc(e.name)}</b><small>${esc(e.by.join(' · '))}</small></div><div class="bqt-q"><i class="qpill${q?'':' empty'}">${esc(q||'кол-во не указано')}</i><small>✓ ${e.pr}/${e.n}${e.sv?` · 🍽 ${e.sv}`:''}</small></div></div>`}).join('')};
const libFind=(t,g)=>libItems().find(i=>nt(i.t)===nt(t)&&((i.g==='banq')===(g==='banq')));
const libId=(t,g)=>hashText(nt(t)+(g==='banq'?'|b':''));
const hashText=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return 'l'+h.toString(36)};
const libItems=()=>Object.entries(DATA.prepLibrary||{}).map(([id,v])=>({id,...v})).filter(v=>v&&v.t);
const rememberPrep=(t,w)=>{if(!t||!t.t||!w||isObs())return;const old=libFind(t.t,t.g),id=old?old.id:libId(t.t,t.g);mut('PUT','prepLibrary/'+id,{t:t.t,q:t.q||'',g:t.g||'main',k:t.k||'other',...(t.pg?{pg:t.pg,pu:t.pu}:{}),by:{id:w.id,n:w.n},usedAt:Date.now()})};
const rLibrary=()=>{const q=nt($('#libq').value),items=libItems().filter(i=>matchF(i)&&(!q||nt(i.t).includes(q))).sort((a,b)=>(b.usedAt||0)-(a.usedAt||0));$('#libcount').textContent=`${items.length} сохранено`;$('#liblist').innerHTML=items.length?items.map(i=>`<article class="libitem"><div class="libname">${pcIcon(pk(i))} ${esc(i.t)}</div><div class="libmeta">${i.pg?`👥 ${esc(fmtQ(i.pg))} ${esc(i.pu||'')}/гость · `:i.q?`${esc(i.q)} · `:''}${i.g&&i.g!=='main'?`${esc(gname(i.g))} · `:''}${i.by?`Готовил: ${esc(i.by.n)} · `:'Запись в архиве · '}${i.usedAt?new Date(i.usedAt).toLocaleDateString('ru',{day:'2-digit',month:'2-digit',year:'numeric'}):'Ранее'}</div><div class="lib-actions"><button class="p" data-a="libadd" data-id="${esc(i.id)}">＋ В день</button><button data-a="libedit" data-id="${esc(i.id)}">✎ Изменить</button><button class="d" data-a="libdelete" data-id="${esc(i.id)}">Удалить</button></div></article>`).join(''):'<div class="em">История пока пуста. Добавьте заготовку или отметьте её выполненной.</div>'};
const rCatMgr=()=>{const cs=Object.entries(DATA.prepCats||{}).filter(([k,v])=>v&&v.n).sort((a,b)=>(a[1].o||0)-(b[1].o||0));$('#catl').innerHTML=cs.length?cs.map(([k,v])=>`<div class="catrow"><input class="ce" data-ce="${esc(k)}" value="${esc(v.e||'')}" maxlength="4" aria-label="Значок"><input data-cn="${esc(k)}" value="${esc(v.n)}" maxlength="30" aria-label="Название"><button class="x" data-a="catdel" data-id="${esc(k)}" aria-label="Удалить">✕</button></div>`).join(''):'<div class="small">Своих категорий пока нет. Базовые: '+PCATS0.map(c=>c[1]+' '+c[2]).join(', ')+'.</div>'};
const catEdit=(t,d)=>{if(!isAdmin())return;const id=d.ce||d.cn;if(!(DATA.prepCats||{})[id])return;if(d.cn){const n=t.value.trim().replace(/\s+/g,' ').slice(0,30);if(!n){rCatMgr();return}mut('PATCH','prepCats/'+id,{n})}else{mut('PATCH','prepCats/'+id,{e:Array.from(t.value.trim()||'🏷️').slice(0,2).join('')})}snd.tap()};
const libraryDialog=item=>{const groups=pgroups();$('#lltitle').textContent=item?'Изменить заготовку в архиве':'Добавить заготовку в архив';$('#dl').dataset.id=item?item.id:'';$('#llt').value=item?item.t:'';$('#llq').value=item?item.q||'':'';$('#llg').innerHTML=groups.map(g=>`<option value="${esc(g.id)}"${(item?item.g||'main':qg)===g.id?' selected':''}>${esc(g.n)}</option>`).join('');$('#llc').innerHTML='<option value="">🤖 Определить автоматически</option>'+pcats().map(c=>`<option value="${esc(c[0])}"${item&&item.ks!=='?'&&pk(item)===c[0]?' selected':''}>${esc(c[1])} ${esc(c[2])}</option>`).join('');$('#dl').showModal();$('#llt').focus()};
const dm=()=>(DATA.prep||{})[pd]||{},dayTasks=()=>Object.values(dm());
const pgroups=()=>[{id:'main',n:'Основные'},{id:'banq',n:'Банкет'},...Object.entries((DATA.plan||{}).groups||{}).map(([id,v])=>({id,n:v.n}))];
const gname=g=>(pgroups().find(x=>x.id===g)||{n:'Другое'}).n;
const WO_REASONS=[['spoiled_v2','Порча продукта'],['damaged_v2','Повреждение товара'],['expired','Истёк срок годности'],['storage','Нарушение условий хранения'],['trim','Обрезки'],['staff','Персонал'],['other','Другая причина']];
const woReason=id=>id==='spoiled'?'Старый вариант: порча или повреждение':(WO_REASONS.find(x=>x[0]===id)||WO_REASONS.find(x=>x[0]==='other'))[1];
const ruCount=(n,one,two,five)=>{const a=n%100,b=n%10;return a>=11&&a<=14?five:b===1?one:b>=2&&b<=4?two:five};
const woRows=date=>Object.entries(((DATA.writeoffs||{})[date])||{}).map(([id,v])=>({id,...(v||{}),c:(v&&v.c)||(prods().find(p=>p.id===v?.pid)||{}).c||''})).filter(v=>v&&v.name&&!v.carried);
const writeoffMessage=(date,rows=woRows(date))=>{const cs=cats(),seen=new Set(),out=[`🗑 Списание за ${day(date)}`,''];for(const c of cs){const g=rows.filter(v=>v.c===c.id);if(!g.length)continue;g.forEach(v=>seen.add(v.id));out.push(`${c.e} ${c.n}`,g.sort((a,b)=>COL.compare(a.name,b.name)).map(v=>`• ${v.name} — ${fmtQ(v.qty)} ${v.unit||''} — ${woReason(v.reason)}${v.note?` (${v.note})`:''}${v.by&&v.by.n?` · Списал: ${v.by.n}`:''}${v.carryFrom?` · перенос с ${day(v.carryFrom)}`:''}`).join('\n'),'')}const rest=rows.filter(v=>!seen.has(v.id));if(rest.length)out.push('📦 Другое',rest.sort((a,b)=>COL.compare(a.name,b.name)).map(v=>`• ${v.name} — ${fmtQ(v.qty)} ${v.unit||''} — ${woReason(v.reason)}${v.note?` (${v.note})`:''}${v.by&&v.by.n?` · Списал: ${v.by.n}`:''}${v.carryFrom?` · перенос с ${day(v.carryFrom)}`:''}`).join('\n'),'');out.push(`Всего: ${rows.length} поз.`);return out.join('\n')};
const planItems=()=>Object.entries((DATA.plan||{}).items||{}).map(([id,v])=>({id,...v})).filter(i=>i.t);
// ---------- перенос остатков: независимо от вкладки и отрисовки, всегда по свежим данным ----------
const savePd=()=>LS.set('vip3-prep-date',{d:pd,t:dAdd(0)});
let carryBusy=0,carryAt=0;const carryOK={};
const carryPrep=async()=>{if(isObs())return;const today=dAdd(0),prev=dAdd(-1,today);if(carryOK[today])return;
let src,dst,meta,pmeta;
if(DEMO){src=(DATA.prep||{})[prev];dst=(DATA.prep||{})[today];meta=(DATA.prepMeta||{})[today];pmeta=(DATA.prepMeta||{})[prev]}
else{if(!DB)return;[src,dst,meta,pmeta]=await Promise.all([jget('prep/'+prev),jget('prep/'+today),jget('prepMeta/'+today),jget('prepMeta/'+prev)])}
if(dAdd(0)!==today)return;
src=src||{};dst=Object.assign({},dst||{},(DATA.prep||{})[today]||{});meta=meta||{};pmeta=pmeta||{};
if(meta.cf||Object.values(dst).some(t=>t&&t.carryFrom===prev)){carryOK[today]=1;if(!meta.cf)mut('PUT',`prepMeta/${today}/cf`,prev);return}
const tgt=o=>o==='0'?'c'+prev.replace(/-/g,''):o,kf=(t,bq)=>nt(t&&t.t)+'|'+(t&&t.g==='banq'?bq:''),names=new Set(Object.values(dst).map(t=>kf(t,bqOf(t))));
const es=Object.entries(src).filter(([id,t])=>t&&t.t&&!t.done&&!t.sd&&!dst[id]).sort((a,b)=>(a[1].c||0)-(b[1].c||0)).filter(([id,t])=>{const k=kf(t,tgt(bqOf(t)));if(names.has(k))return false;names.add(k);return true});
if(es.length){const need=new Set(es.filter(e=>e[1].g==='banq').map(e=>bqOf(e[1])));
if(need.size){const pl=bqCalc(pmeta,src),have=meta.b||{};need.forEach(o=>{const id=tgt(o);if(have[id])return;const b=pl.find(x=>x.id===o),v={o:b&&b.o||Date.now(),cf:prev};['title','guests','time','place','note'].forEach(k=>{if(b&&b[k])v[k]=b[k]});mut('PUT',`prepMeta/${today}/b/${id}`,v)})}
es.forEach(([id,t],i)=>mut('PUT',`prep/${today}/${id}`,{t:t.t,...cqf(t,prev),g:t.g||'main',k:t.k||'other',...(t.ks?{ks:t.ks}:{}),...(t.lid?{lid:t.lid}:{}),...(t.g==='banq'?{bq:tgt(bqOf(t)),...(okTm(t.sv)?{sv:t.sv}:{})}:{}),carryFrom:prev,c:Date.now()+i}))}
mut('PUT',`prepMeta/${today}/cf`,prev);carryOK[today]=1;
if(es.length)toast(`↩ Перенесено с ${day(prev)}: ${es.length}`)};
const carryWo=async()=>{if(isObs())return;const today=dAdd(0),prev=dAdd(-1,today);let src,dst;
if(DEMO){src=(DATA.writeoffs||{})[prev];dst=(DATA.writeoffs||{})[today]}else{if(!DB)return;[src,dst]=await Promise.all([jget('writeoffs/'+prev),jget('writeoffs/'+today)])}
if(dAdd(0)!==today)return;src=src||{};dst=Object.assign({},dst||{},(DATA.writeoffs||{})[today]||{});let n=0;
Object.entries(src).forEach(([id,v])=>{if(!v||!v.name||v.done||v.carried||dst[id])return;mut('PUT',`writeoffs/${today}/${id}`,{...v,carryFrom:prev,updated:Date.now()});mut('PATCH',`writeoffs/${prev}/${id}`,{carried:today});n++});if(n)toast(`↩ Перенесено в списание: ${n}`)};
const carryAll=force=>{if(carryBusy)return;if(!force&&Date.now()-carryAt<20000&&carryOK[dAdd(0)])return;carryBusy=1;carryAt=Date.now();Promise.all([carryPrep().catch(()=>{}),carryWo().catch(()=>{})]).then(()=>{carryBusy=0},()=>{carryBusy=0})};
function setH(e,h){if(!e)return;if(e.__h===h&&e.firstChild!==null||(e.__h===h&&h===''))return;e.__h=h;e.innerHTML=h}
let pdnOpen=false,pdnOpenS=false;
const rPrep=()=>{const allT=Object.entries((DATA.prep||{})[pd]||{}).map(([id,v])=>({id,...v})),ts=allT.filter(t=>inSec(t.g)&&inBq(t)),rk=t=>nt(t.t)+'|'+(t.g==='banq'),remembered=new Set(libItems().map(rk));allT.filter(t=>t.done&&t.by&&!remembered.has(rk(t))).forEach(t=>{rememberPrep(t,t.by);remembered.add(rk(t))});
const bq0=psec==='banq',dn=ts.filter(t=>bq0?isPrepd(t):t.done).sort((a,b)=>(b.at||0)-(a.at||0)),gi=g=>Math.max(0,pgroups().findIndex(x=>x.id===(g||'main'))),td=ts.filter(t=>!t.done).sort((a,b)=>psec==='banq'?svSort(a,b):gi(a.g)-gi(b.g)||(a.c||0)-(b.c||0)),svn=bq0?ts.filter(isSv).length:0,k=team();
const sel=t=>`<select class="who${t.by?' on':''}" data-by="${t.id}"><option value="">Кто?</option>${k.map(c=>`<option value="${c.id}"${t.by&&t.by.id===c.id?' selected':''}>${esc(c.n)}</option>`).join('')}${t.by&&!k.some(c=>c.id===t.by.id)?`<option value="${esc(t.by.id)}" selected>${esc(t.by.n)}</option>`:''}</select>`;
const ckb=t=>{const on=t.g==='banq'?isPrepd(t):!!t.done;return `<button class="ck${justDone.has(t.id)?' pop':''}${on&&!t.done?' imp':''}" data-a="ptog" data-id="${t.id}" aria-label="${t.g==='banq'?'Приготовлено поваром':'Отметить'}">${on?'✓':''}</button>`},ckCol=t=>t.g==='banq'?`<div class="ckc">${ckb(t)}<button class="sv${okTm(t.sv)?'':' empty'}" data-a="svopen" data-id="${t.id}" aria-label="Время подачи${okTm(t.sv)?': '+t.sv:''}">${okTm(t.sv)?t.sv:'🕐'}</button></div>`:ckb(t);
const sdCol=t=>{const on=isSv(t);return `<div class="ckc sdc"><button class="sdk${on?' on':''}${justSrv.has(t.id)?' pop':''}${!on&&!canServe()?' lock':''}" data-a="psrv" data-id="${t.id}" aria-pressed="${on}" aria-label="${on?'Подано. Снять отметку':'Отметить: блюдо подано гостям'}">${on?'✓':'<span class="sdg">🍽</span>'}</button><span class="sdl${on?' on':''}">${on?tm(t.sa):'Подано'}</span></div>`};
const pmx=t=>`${qpillP(t)}${t.pn?`<span class="pn2">💬 ${esc(t.pn)}</span>`:''}${t.g&&t.g!=='main'&&t.g!=='banq'?`<em>${esc(gname(t.g))}</em>`:''}${t.ks==='?'?'<span class="qk">❓ категория</span>':''}${t.carryFrom?`<span class="cf">↩ ${esc(day(t.carryFrom))}</span>`:''}${t.done&&t.by?`<span class="by">✓ ${esc(t.by.n)} · ${tm(t.at)}</span>`:''}`;
const r=t=>t.g==='banq'?`<div class="pr bqr${isPrepd(t)?' ok':''}${isSv(t)?' sd':''}${seenRows.has(t.id)?'':' new'}">${ckCol(t)}<div class="bqw"><div class="pn" data-a="tkopen" data-id="${t.id}"><b>${esc(t.t)}</b><div class="pm">${pmx(t)}</div></div><div class="bqf">${sel(t)}</div></div>${sdCol(t)}</div>`:`<div class="pr${t.done?' ok':''}${seenRows.has(t.id)?'':' new'}">${ckCol(t)}<div class="pn" data-a="tkopen" data-id="${t.id}"><b>${esc(t.t)}</b><div class="pm">${pmx(t)}</div></div>${sel(t)}</div>`;
{const bl=bq0?bqList(pd):[],cu=bq0?bqCur():null;let html;
if(bq0&&cu&&cu.tot)html=bqTotHtml();
else if(bq0&&!bl.length)html='<div class="em">Банкетов на этот день нет.<br>Добавьте банкет — и заготовки к нему.</div><div class="acts"><button class="p" data-a="bqnew">＋ Добавить банкет</button></div>';
else if(bq0&&cu&&cu.all)html=bl.map(b=>{const its=ts.filter(t=>bqOf(t)===b.id).sort((p,q)=>isSv(p)-isSv(q)||svSort(p,q)),dk=its.filter(isPrepd).length,sk=its.filter(isSv).length,sub=[b.time&&'🕐 '+esc(b.time),b.guests&&'👥 '+b.guests].filter(Boolean).join(' · ');return `<div class="bqx" style="--bq:${bqCol(pd,b)}"><div class="bqx-h"><i class="bqdot"></i><b>🎉 ${esc(bqName(b,bl))}</b>${sub?`<span>${sub}</span>`:''}<i>${dk}/${its.length}${sk?` · 🍽${sk}`:''}</i><button class="g" data-a="bqsel" data-id="${esc(b.id)}" aria-label="Открыть банкет">›</button></div>${its.length?`<div class="plc">${its.map(r).join('')}</div>`:'<div class="small" style="margin:6px 2px 10px">Заготовок пока нет</div>'}</div>`}).join('');
else if(bq0&&ts.length){const sv=ts.filter(isSv).sort((a,b)=>(b.sa||0)-(a.sa||0)),lf=ts.filter(t=>!isSv(t)).sort(svSort),rd=lf.filter(isPrepd).length;
html=(lf.length?`<div class="gh">Осталось подать · ${lf.length}${rd?` <small>(готово к подаче: ${rd})</small>`:''}</div><div class="plc">${lf.map(r).join('')}</div>`:'<div class="bqall">🎉 Всё подано — банкет завершён</div>')+(canServe()&&rd>1?`<div class="acts"><button class="g" data-a="psrvall">🍽 Подать всё готовое · ${rd}</button></div>`:'')+(sv.length?`<details class="pdn sdn" id="pdns"${pdnOpenS||!lf.length?' open':''}><summary>✓ Подано · ${sv.length}</summary><div class="plc">${sv.map(r).join('')}</div></details>`:'')}
else html=ts.length?(td.length?`<div class="plc">${td.map(r).join('')}</div>`:'<div class="pall">🎉 Всё готово</div>')+(dn.length?`<details class="pdn" id="pdn"${pdnOpen||!td.length?' open':''}><summary>✓ Выполнено · ${dn.length}</summary><div class="plc">${dn.map(r).join('')}</div></details>`:''):(bq0?'<div class="em">В этом банкете заготовок пока нет.<br>Добавьте блюда ниже.</div>':'<div class="em">На этот день заготовок нет.<br>Добавьте ниже или выберите из истории.</div>');
setH($('#plist'),html)}
ts.forEach(t=>seenRows.add(t.id));justDone.clear();justSrv.clear();
{const pf=$('#pfill');pf.style.width=ts.length?Math.round(dn.length/ts.length*100)+'%':'0%';$('#pfill2').style.width=ts.length&&bq0?Math.round(svn/ts.length*100)+'%':'0%';$('#pinfo').textContent=ts.length?`✓ ${dn.length} из ${ts.length}${bq0&&svn?` · 🍽 ${svn}`:''}`:'пусто'}
setDp($('#pdate'),pd);[['-1',dAdd(-1)],['today',dAdd(0)],['1',dAdd(1)]].forEach(([id,dt])=>{const b=document.querySelector(`#pseg [data-id="${id}"]`);if(b){b.classList.toggle('on',pd===dt);b.setAttribute('aria-pressed',String(pd===dt))}});
const pins=DATA.prepPins||{},pinned=!!pins[pd],pinButton=$('#ppin'),dates=Object.keys(pins).filter(dt=>/^\d{4}-\d{2}-\d{2}$/.test(dt)&&pins[dt]).sort();pinButton.classList.toggle('on',pinned);pinButton.setAttribute('aria-pressed',String(pinned));pinButton.textContent='📌';pinButton.title=pinned?'День закреплён':'Закрепить день';$('#ppinlabel').hidden=!dates.length;setH($('#ppins'),dates.map(dt=>`<button class="chip pin-chip${dt===pd?' on':''}" data-a="ppick" data-id="${dt}">📌 ${esc(day(dt))}</button>`).join(''));rBq();rYday();rBqUp()};
const rBq=()=>{document.querySelectorAll('#psecs button').forEach(b=>{b.classList.toggle('on',b.dataset.id===psec);b.setAttribute('aria-pressed',String(b.dataset.id===psec))});
const all=Object.values(dm()).filter(t=>t&&t.t),c=s=>{const a=all.filter(t=>s==='banq'?t.g==='banq':t.g!=='banq'),v=s==='banq'?a.filter(isSv).length:0;return a.length?` ${a.filter(isPrepd).length}/${a.length}${v?' 🍽'+v:''}`:''};$('#pcm').textContent=c('main');$('#pcb').textContent=c('banq');
const isB=psec==='banq',bl=isB?bqList(pd):[],cu=isB?bqCur():null,one=cu&&!cu.all?cu:null,cur=one?bqEff():'prep',info=!!one&&cur==='info';
$('#bqbar').hidden=!isB;$('#bqtabs').hidden=!one;$('#bqinfo').hidden=!info;$('#bqh').hidden=!one||info;$('#plist').hidden=info;$('#ydbox').hidden=info;$('#padd').hidden=isB&&(!one||info);$('#libbox').hidden=isB&&(!one||info);
if(!isB)return;
const bqd=b=>all.filter(t=>t.g==='banq'&&bqOf(t)===b.id),bch=(id,ti,sub,prog,on,col)=>`<button class="bqc${on?' on':''}${/🍽/.test(prog)?' wide':''}"${col?` style="--bq:${col}"`:''} data-a="bqsel" data-id="${esc(id)}" aria-pressed="${on?'true':'false'}"><b>${esc(ti)}</b>${sub?`<small>${sub}</small>`:''}${prog?`<i>${prog}</i>`:''}</button>`;
$('#bqbar').innerHTML=(bl.length>1?bch('*','🗂 Все',bl.length+' '+rupl(bl.length,['банкет','банкета','банкетов']),'',!!(cu&&cu.all&&!cu.tot)):'')+((pool,sel)=>pool.length>=2||(cu&&cu.tot)?bch('#','Σ Итого',sel.length+' '+rupl(sel.length,['банкет','банкета','банкетов'])+' · '+bqMerge(sel).length+' '+rupl(bqMerge(sel).length,['блюдо','блюда','блюд']),'',!!(cu&&cu.tot)):'')(bqPool(),bqSel(bqPool()))+bl.map(b=>{const d=bqd(b),dd=d.filter(isPrepd).length,ds=d.filter(isSv).length,sub=[b.src==='pre'&&'🔗',b.time&&'🕐 '+esc(b.time),b.guests&&'👥 '+b.guests].filter(Boolean).join(' · ');return bch(b.id,bqName(b,bl),sub,d.length?dd+'/'+d.length+(ds?' · 🍽'+ds:''):'',!!(one&&one.id===b.id),bqCol(pd,b))}).join('')+'<button class="bqc add" data-a="bqnew" aria-label="Добавить банкет">＋ Банкет</button>';
if(!one)return;
{const pb=$('#prebox');if(pb){const pre=one.src==='pre';pb.hidden=!pre;if(pre){const tk=bqd(one).length,ds=preDishes(one),miss=ds.filter(d=>!dm()[d.key]).length;if(miss&&!isObs())setTimeout(autoPre,60);
pb.innerHTML='<b>🔗 Из предзаказов гостей</b><small>'+(tk?'Блюда ('+tk+') — во вкладке «Заготовки». ':'')+'Обновляется само при изменении на сайте предзаказов (до минуты). Телефон и предоплата сюда не передаются.</small>'+(!tk&&one.pi?'<pre>'+esc(one.pi)+'</pre>':'')+(miss&&!isObs()?`<button class="p prb" data-a="prefill" data-id="${esc(one.id)}">🍽 Добавить блюда в «Заготовки» (${miss})</button>`:'')}}}
document.querySelectorAll('#bqtabs button').forEach(b=>{const on=b.dataset.id===cur;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});
const bq=bqd(one),bn=bq.length,bd=bq.filter(isPrepd).length,bs=bq.filter(isSv).length,m=one;$('#pcq').textContent=bn?` ${bd}/${bn}${bs?' 🍽'+bs:''}`:'';
if(info){const fv=(q,v)=>{const e=$(q);if(document.activeElement!==e){e.value=v;if(e.classList)e.classList.remove('bad')}};fv('#bqt',m.title);fv('#bqs',m.time);fv('#bqg',m.guests||'');fv('#bqp',m.place);fv('#bqn',m.note);setDp($('#bqdt'),pd);{const g=bqGuess(m.title+'\n'+m.note),hh=$('#bqhint');if(g&&g!==pd){hh.hidden=false;hh.innerHTML=`📅 В названии есть дата <b>${esc(day(g))}</b>, а банкет записан на <b>${esc(day(pd))}</b>. <button class="p" data-a="bqmove" data-id="${g}">Перенести на ${esc(day(g))}</button>`}else{hh.hidden=true;hh.innerHTML=''}}$('#bqday').textContent=day(pd)+(bl.length>1?' · '+bqName(m,bl):'');const f=bq.filter(t=>okTm(t.sv)).sort(svSort)[0];$('#bqsum').innerHTML=bn?`Заготовок: <b>${bn}</b> · готово <b>${bd}</b> · подано <b>${bs}</b>${f?` · первая подача <b>${f.sv}</b>`:''}`:'Заготовок пока нет. Откройте вкладку «Заготовки» и добавьте блюда.'}
else{const parts=[m.time&&`<span>🕐 ${esc(m.time)}</span>`,m.guests&&`<span>👥 ${m.guests}</span>`,m.place&&`<span>📍 ${esc(m.place)}</span>`].filter(Boolean).join('');
$('#bqh').innerHTML=(m.title||parts||m.note||bn)?`<div class="bqs-h"><b>🎉 ${esc(m.title||bqName(m,bl))}</b><button class="g" data-a="bqtab" data-id="info" aria-label="Изменить данные банкета">✎ Изменить</button></div>${parts?`<div class="bqs-m">${parts}</div>`:''}${m.note?`<div class="bqs-n">📝 ${esc(m.note)}</div>`:''}${bn?`<div class="bqs-p"><span><i class="bqk ok"></i>Готово <b>${bd}</b>/${bn}</span><span><i class="bqk sd"></i>Подано <b>${bs}</b>/${bn}</span></div>`:''}`:`<div class="bqs-h"><span class="small" style="margin:0">Данные банкета не заполнены</span><button class="g" data-a="bqtab" data-id="info">＋ Заполнить</button></div>`}};
const rYday=()=>{const prev=dAdd(-1,pd),ts=Object.values((DATA.prep||{})[prev]||{}).filter(t=>t&&t.t&&inSec(t.g)),dn=ts.filter(isPrepd).sort((a,b)=>(a.at||0)-(b.at||0)),nd=ts.filter(t=>!isPrepd(t));
$('#ydcount').textContent=ts.length?`${day(prev)} · сделано ${dn.length} из ${ts.length}`:day(prev);
$('#ydlist').innerHTML=ts.length?(dn.length?`<div class="gh">Приготовлено · ${dn.length}</div>`+dn.map(t=>`<div class="ydr ok"><b>${esc(t.t)}</b>${t.q?`<i>${esc(t.q)}</i>`:''}<small>${t.by?esc(t.by.n):''}${t.at?' · '+tm(t.at):''}</small></div>`).join(''):'')+(nd.length?`<div class="gh">Не сделано · ${nd.length}</div>`+nd.map(t=>`<div class="ydr"><b>${esc(t.t)}</b>${t.q?`<i>${esc(t.q)}</i>`:''}</div>`).join(''):'')+`<div class="acts"><button class="p" data-a="pcopy">Скопировать на ${esc(day(pd))}</button></div>`:'<div class="em">За предыдущий день записей нет.</div>'};
const rPlan=()=>{const have=new Set(Object.values(dm()).filter(t=>t&&inSec(t.g)).map(t=>nt(t.t))),seen=new Set(),all=[...libItems().sort((a,b)=>(b.usedAt||0)-(a.usedAt||0)).map(i=>({key:'lib:'+i.id,t:i.t,g:i.g,k:i.k})),...planItems().map(i=>({key:'plan:'+i.id,t:i.t,g:i.g,k:i.k}))].filter(i=>{const n=nt(i.t);if(!n||seen.has(n))return false;seen.add(n);return!have.has(n)&&matchF(i)}).slice(0,12);
$('#qlist').innerHTML=all.length?all.map(i=>`<button class="chip qp" data-a="qpick" data-id="${esc(i.key)}">＋ ${esc(i.t)}${i.g==='banq'?' 🎉':''}</button>`).join(''):(lf==='all'?'':'<span class="small">В этой категории пока ничего нет.</span>');
rFil()};
// ---------- банкеты: цвета, уведомления, заготовки на ближайшие дни ----------
const bqLook=()=>{const v=Number((((DATA.plan||{}).cfg)||{}).bql);return v>=1&&v<=3?v:2};
const BQC=['#c026d3','#0891b2','#ea580c','#16a34a','#2563eb','#db2777','#ca8a04','#7c3aed'];
// у каждого банкета свой цвет: стабильный по хэшу, а в окне ближайших дней — без совпадений
const bqHash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h};
const bqCol=(d,b)=>{const t=dAdd(0),all=[];for(let i=0;i<=3;i++){const dd=dAdd(i,t);bqList(dd).forEach(x=>all.push([dd,x]))}
if(!all.some(p=>p[0]===d&&p[1].id===b.id))all.push([d,b]);all.sort((p,q)=>p[0]<q[0]?-1:p[0]>q[0]?1:p[1].n-q[1].n);
const used=new Set();let mine=0;for(const p of all){let c=bqHash(p[0]+'|'+p[1].id)%BQC.length,k=0;while(used.has(c)&&k<BQC.length){c=(c+1)%BQC.length;k++}used.add(c);if(p[0]===d&&p[1].id===b.id)mine=c}
return BQC[mine]};
const relDay=n=>n===0?'Сегодня':n===1?'Завтра':n===2?'Послезавтра':'Через '+n+' дн.';
const upBq=()=>{const L2=bqLook(),t=dAdd(0),out=[];for(let i=0;i<=L2;i++){const d=dAdd(i,t),l=bqList(d),ds=Object.entries((DATA.prep||{})[d]||{}).map(([id,v])=>({id,...v}));l.forEach(b=>{const its=ds.filter(x=>x&&x.t&&x.g==='banq'&&bqOf(x)===b.id);if(!its.length&&!(b.title||b.time||b.guests||b.place||b.note))return;out.push({d,i,b,l,its})})}return out};
const upBqAll=()=>{const t0=dAdd(0),t1=dAdd(BQ_SPAN,t0),out=[],ds=new Set();[...Object.keys(DATA.prepMeta||{}),...Object.keys(DATA.prep||{})].forEach(k=>{if(RXD.test(k)&&k>=t0&&k<=t1)ds.add(k)});
[...ds].sort().forEach(d=>{const l=bqList(d),dd=Object.entries((DATA.prep||{})[d]||{}).map(([id,v])=>({id,...v}));l.forEach(b=>{const its=dd.filter(x=>x&&x.t&&x.g==='banq'&&bqOf(x)===b.id);if(!its.length&&!(b.title||b.time||b.guests||b.place||b.note))return;out.push({d,i:dDiff(d,t0),b,l,its})})});return out};
const bqSub=(x,full)=>[full&&relDay(x.i)+' · '+day(x.d),x.b.time&&'🕐 '+x.b.time,x.b.guests&&'👥 '+x.b.guests,x.b.place&&'📍 '+x.b.place].filter(Boolean).join(' · ');

// Уведомления о банкетах — только внутри «Заготовок»: точка на вкладке (пока не открыли) и один тост при открытии / появлении нового банкета
const rBqAlert=()=>{const u=bqRangeOk?upBqAll():upBq(),tb=document.querySelector('.tab[data-id="prep"]');let fresh=[];
try{const key='vip3-bqk2',old=LS.get(key,null),cur=u.map(x=>x.d+'|'+x.b.id),t0=dAdd(0);
if(old===null){if(bqRangeOk)LS.set(key,cur)}else{fresh=u.filter(x=>!old.includes(x.d+'|'+x.b.id));
if(tab==='prep'){const keep=[...old.filter(k=>k.slice(0,10)>=t0),...cur.filter(k=>!old.includes(k))];
if(fresh.length&&!(psec==='banq'&&fresh.every(z=>z.d===pd))){const x=fresh[0];snd.add();toast(`🎉 Банкет: ${relDay(x.i).toLowerCase()}${x.b.time?' в '+x.b.time:''}${x.b.guests?' · '+x.b.guests+' '+rupl(x.b.guests,['гость','гостя','гостей']):''}`)}
if(fresh.length||keep.length!==old.length)LS.set(key,keep);fresh=[]}}}catch(e){}
if(tb)tb.classList.toggle('bqd',tab!=='prep'&&fresh.some(x=>x.i<=1))};
let bqUpMore=false;
const bqRowUp=(x,on)=>{const sub=[x.b.time&&'🕐 '+x.b.time,x.b.guests&&'👥 '+x.b.guests,x.b.place&&'📍 '+x.b.place].filter(Boolean).join(' · '),dn=x.its.filter(isPrepd).length;
return `<div class="bqu-r${on?' on':''}${x.i<=1?' hot':''}" style="--bq:${bqCol(x.d,x.b)}"><button class="bqu-ck" data-a="bqtpick" data-id="${esc(bqKey(x))}" aria-pressed="${on?'true':'false'}" aria-label="${on?'Снять выбор':'Выбрать'}: ${esc(bqName(x.b,x.l))}"><span class="bqt-ck">${on?'✓':''}</span></button><button class="bqu-go" data-a="bqopen" data-id="${x.d}|${esc(x.b.id)}"><span class="bqsr-w">${esc(relDay(x.i))}<small>${esc(day(x.d))}</small></span><span class="bqsr-t"><b>${esc(bqName(x.b,x.l))}</b><small>${esc(sub||'нажмите, чтобы открыть')}</small></span><em class="${x.its.length&&dn===x.its.length?'all':''}">${x.its.length?dn+'/'+x.its.length:'—'}</em><i class="bqa-go">›</i></button></div>`};
const rBqUp=()=>{const box=$('#bqup');if(!box)return;const u=bqPool();box.hidden=!u.length;if(!u.length){box.innerHTML='';return}
const sel=bqSel(u),near=u[0],keep=box.open,hot=u.some(x=>x.i<=1),show=bqUpMore?u:u.slice(0,5);
box.classList.toggle('hot',hot);
box.innerHTML=`<summary><span class="bqu-t">🎉 Предстоящие банкеты</span><b class="bqu-n">${u.length}</b><small>ближайший: ${esc(relDay(near.i).toLowerCase())}${near.b.time?' в '+esc(near.b.time):''}${near.b.guests?' · 👥 '+near.b.guests:''}</small></summary>`
+`<div class="bqt-lbl bqu-lbl"><span>Выберите банкеты для чтения вместе</span><span><button class="bqt-m" data-a="bqtall">Все</button><button class="bqt-m" data-a="bqtnone">Снять</button></span></div><div class="bqu-list">${show.map(x=>bqRowUp(x,!bsxx.has(bqKey(x)))).join('')}</div>`
+(u.length>5?`<button class="g bqu-more" data-a="bqumore">${bqUpMore?'Свернуть список':'Показать все · '+u.length}</button>`:'')
+`<button class="p bqu-read" data-a="bqtread"${sel.length?'':' disabled'}>📖 Читать вместе · ${sel.length} ${rupl(sel.length,['банкет','банкета','банкетов'])}</button>`;
box.open=keep};
const rBqDlg=()=>{const b=$('#dbtb');if(b)b.innerHTML=bqTotHtml(true)};
const bqSelRefresh=()=>{rBqUp();if(dialogOpen('#dbt'))rBqDlg();if(psec==='banq')rPrep()};
// ---------- «Кто вы?» при открытии приложения ----------
let whoHidAt=0,whoWait=false,whoWT=0;
const whoNeeded=()=>{try{return sessionStorage.getItem('vip3-who')!=='1'}catch{return true}};
const whoDone=()=>{try{sessionStorage.setItem('vip3-who','1')}catch{}};
const rWho=()=>{const el=$('#whol');if(!el)return;const k=team(),me=L.me&&k.find(x=>x.id===L.me.id);
if(whoWait&&!Object.keys(DATA.team||{}).length){el.innerHTML='<div class="who-wait" role="status">Загружаю список поваров…</div>';return}
el.innerHTML=(me?`<button class="p who-cont" data-a="whopick" data-id="${esc(me.id)}"><span>Продолжить как</span><b>${esc(me.n)}</b><small>${esc(me.r)}</small><i aria-hidden="true">›</i></button><div class="lbl who-or">Или выберите другого</div>`:'')+`<div class="who-grid">`+k.filter(c=>!me||c.id!==me.id).map(c=>`<button class="who-b" style="--cook:${cookColor(c.id)}" data-a="whopick" data-id="${esc(c.id)}"><i class="cook-dot"></i><span class="who-t"><b>${esc(c.n)}${c.pw?' 🔒':''}</b><small>${esc(c.r)}</small></span></button>`).join('')+`</div>`+whoLead()};
const whoOpen=()=>{const d=$('#dwho');if(!d||d.open)return;whoWait=true;clearTimeout(whoWT);whoWT=setTimeout(()=>{whoWait=false;if(dialogOpen('#dwho'))rWho()},4000);rWho();try{whoObsLoad()}catch(e){}try{d.showModal()}catch{d.setAttribute('open','')}};
const shiftsFor=date=>{const all=DATA.shifts||{},ex=all[date]||{};if(Object.keys(ex).some(k=>ex[k]!==undefined&&ex[k]!==null))return{map:ex,src:'own'};
const last=all._last||{},S=DATA.sched||{},sch=team().filter(c=>S[c.id]&&isWork(S[c.id][date]));
if(sch.length){const m={};sch.forEach(c=>{m[c.id]=last[c.id]||''});return{map:m,src:'sched'}}
return Object.keys(last).some(k=>last[k])?{map:last,src:'last'}:{map:{},src:'none'}};
const setShift=(id,val)=>{const tom=dAdd(1),cur=shiftsFor(tom),next=Object.assign({},cur.map);
if(cur.src!=='own')Object.keys(next).forEach(k=>{next[k]=next[k]||L.at||'14:00';mut('PUT',`shifts/${tom}/${k}`,next[k])});
if(val){next[id]=val;mut('PUT',`shifts/${tom}/${id}`,val)}else{delete next[id];mut('DELETE',`shifts/${tom}/${id}`)}
Object.keys(next).forEach(k=>{if(!next[k])delete next[k]});if(Object.keys(next).length)mut('PUT','shifts/_last',next);else mut('DELETE','shifts/_last')};
let rosBusy=0;
async function refreshRoster(){if(rosBusy||DEMO||!DB||document.hidden)return;rosBusy=1;try{const tom=dAdd(1),ps=['sched','shifts/'+tom,'shifts/_last','shifts/_hide'],res=await Promise.all(ps.map(p=>jget(p)));let ch=0;ps.forEach((p,i)=>{if(pendingFor(mkey(p)))return;if(sig(atPath(p))!==sig(res[i])){put('/'+p,res[i]);ch=1}});if(ch){rShifts();if(tab==='sched')rSched()}}catch(e){}rosBusy=0}
// часы работы кухни: Вс–Чт и Пт–Сб (plan/cfg/hw, plan/cfg/hf)
const HRE=/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;
const hrsCfg=()=>{const c=((DATA.plan||{}).cfg)||{};return{hw:HRE.test(c.hw||'')?c.hw:'12:00-02:00',hf:HRE.test(c.hf||'')?c.hf:'12:00-05:00'}};
const hoursFor=ds=>{const[y,m,d]=ds.split('-').map(Number),w=new Date(y,m-1,d,12).getDay(),c=hrsCfg(),fr=w===5||w===6,p=(fr?c.hf:c.hw).split('-');return{o:p[0],c:p[1],txt:p[0]+'–'+p[1],fr}};
const seenOf=ds=>(((DATA.plan||{}).seen||{})[ds])||{};
let seenOpen='',seenClean=0;
const hrsHid=ds=>!!(((DATA.shifts||{})._hide||{})[ds]);
const rShifts=()=>{const tom=dAdd(1),S=shiftsFor(tom),sh=S.map,k=team(),adm=isAdmin(),on=k.filter(c=>sh[c.id]!==undefined),seen=seenOf(tom),me=L.me&&k.find(x=>x.id===L.me.id),
isSeen=c=>{const s=seen[c.id];return!!(s&&typeof s==='object'&&s.t&&String(s.v||'')===String(sh[c.id]||''))},
chg=c=>{const s=seen[c.id];return!!(s&&typeof s==='object'&&s.t&&String(s.v||'')!==String(sh[c.id]||''))},
ns=on.filter(isSeen).length,hr=hoursFor(tom),nm=c=>c.n.split(' ')[0]+(sh[c.id]?' '+sh[c.id]:''),tag=S.src==='sched'?' · по графику':S.src==='last'?' ↻':'',mine=!!(me&&sh[me.id]!==undefined),mySeen=mine&&isSeen(me),
hid=hrsHid(tom),cov=hid&&!adm,nag=mine&&!mySeen&&!hid;
const hb=adm?`<button type="button" class="shx${hid?' on':''}" data-a="shhide" aria-pressed="${hid?'true':'false'}">${hid?'👁 Показать всем':'🙈 Скрыть от всех'}</button>`:'';
$('#shtitle').innerHTML=`<span class="shh"><b>⏰ Завтра</b><em>${esc(day(tom))}</em></span>`+(hid&&adm?'<span class="shl">🔒 скрыто</span>':'')+(on.length&&!cov?`<span class="seenb${ns===on.length?' all':''}" title="Увидели свою смену">👁 ${ns}/${on.length}</span>`:'')+hb+(on.length?(cov?'<span class="shn lk">🔒 Время смены пока не объявлено</span>':`<span class="shn">${esc(on.map(nm).join(' · ')+tag)}</span>`):'<span class="shn mu">на смену не назначено</span>');
const box=$('#shbox');box.classList.toggle('need',nag);if(nag&&seenOpen!==tom){seenOpen=tom;box.open=true}
const st=c=>{if(cov||sh[c.id]===undefined)return'';if(isSeen(c))return` · <span class="sn ok">👁 ${esc(tm(seen[c.id].t))}</span>`;if(chg(c))return' · <span class="sn chg">время изменено</span>';return' · <span class="sn">не отметил(а)</span>'};
const sub=c=>(c.u?'@'+esc(c.u):esc(c.r))+st(c);
const head=`<div class="shdate"><b>${esc(fmtLong(tom))}</b><span>🕐 кухня работает ${esc(hr.txt)}</span></div>`;
const lk=adm&&hid?`<div class="shlock"><span class="shli">🔒</span><div><b>Часы скрыты от поваров</b><small>Никто, кроме вас, их не видит. Меняйте спокойно — когда будете готовы, нажмите «Показать всем».</small></div><button class="p" type="button" data-a="shhide">👁 Показать всем</button></div>`:cov?`<div class="shlock"><span class="shli">🔒</span><div><b>Время начала смены пока скрыто</b><small>Шеф объявит его позже — тогда здесь появятся часы и кнопка «Увидел(а)».</small></div></div>`:'';
const my=mine?(cov?`<div class="myshift"><div class="mst"><small>Вы завтра на смене</small><b>🔒 время скрыто</b></div></div>`:`<div class="myshift${mySeen?' ok':''}"><div class="mst"><small>Вы завтра на смене</small><b>${sh[me.id]?esc(sh[me.id]):'смена по графику'}</b></div>${mySeen?`<div class="mok">✓ Вы отметили в ${esc(tm(seen[me.id].t))}</div>`:'<button class="p" data-a="shseen">👁 Увидел(а)</button>'}</div>`):(on.length&&!me&&!adm&&!cov?'<div class="small shpick">Выберите своё имя выше — и сможете отметить, что увидели свою смену.</div>':'');
const foot=adm&&!hid?'<div class="shfoot"><button class="g" type="button" data-a="shhide">🙈 Скрыть часы от всех поваров</button><small>Повара перестанут видеть часы, пока вы не нажмёте «Показать всем».</small></div>':'';
$('#shlist').innerHTML=head+lk+my+(adm?k.map(c=>{const h=sh[c.id]!==undefined;return `<div class="shr${h?' on':''}"><button class="ck" data-a="sfton" data-id="${esc(c.id)}" aria-label="Выйдет на смену">${h?'✓':''}</button><div class="n">${esc(c.n)}<i>${sub(c)}</i></div><input data-tm data-sft="${esc(c.id)}" inputmode="numeric" maxlength="5" placeholder="14:00" enterkeyhint="done" aria-label="Время начала смены" value="${esc(sh[c.id]||L.at||'14:00')}"${h?'':' disabled'}></div>`}).join('')+foot:(k.length?k.map(c=>{const h=sh[c.id]!==undefined;return `<div class="shr${h?' on':' off'}${me&&me.id===c.id?' me':''}"><span class="shdot">${h?'✓':'–'}</span><div class="n">${esc(c.n)}<i>${sub(c)}</i></div><b>${h?(!cov&&sh[c.id]?esc(sh[c.id]):'на смене'):(on.length?'выходной':'не назначено')}</b></div>`}).join(''):'<div class="small">Команда ещё не добавлена.</div>'));
$('#shhint').textContent=adm?(S.src==='sched'?'Состав взят из графика (Р). Укажите время начала — оно сохранится.':S.src==='last'?'↻ Показан прошлый состав — измените при необходимости.':'Отметьте поваров и время начала — они попадут в сообщение с упоминанием (@username). Повара отмечают «Увидел(а)» — вы видите это здесь.'):(cov?'':S.src==='sched'?'Состав по графику.':S.src==='last'?'↻ Состав как в прошлый раз.':'')};
const tomorrowParts=()=>{const tom=dAdd(1),td=dAdd(0),ln=d=>t=>{const q=qtyLeft(t,d);return `• ${t.t}${q?' — '+q:''}${t.g==='banq'&&okTm(t.sv)?' · подача '+t.sv:''}`},isB=t=>t.g==='banq',srt=(a,b)=>(a.c||0)-(b.c||0),
pt=Object.values((DATA.prep||{})[tom]||{}).filter(t=>t&&t.t).sort(srt),left=Object.values((DATA.prep||{})[td]||{}).filter(t=>t&&t.t&&!t.done&&!t.sd).sort(srt),
sh=shiftsFor(tom).map,cooks=team().filter(k=>sh[k.id]!==undefined),mt=(DATA.prepMeta||{})[tom]||{};let out=[];const P={prep:[],bq:[],left:[],shift:[],np:0,nb:0,nd:0,nl:0,ns:0};
const main=pt.filter(t=>!isB(t)),lm=left.filter(t=>!isB(t)),bt=bqList(tom),bl=bqList(td);
out=P.prep;P.np=main.length;if(main.length)out.push(`📋 Заготовки на завтра (${day(tom)})`,main.map(ln(tom)).join('\n'),'');out=P.bq;
bt.forEach(b=>{const its=pt.filter(t=>isB(t)&&bqOf(t)===b.id).sort(svSort);if(!its.length&&!(b.title||b.time||b.guests||b.place||b.note))return;P.nb++;P.nd+=its.length;
out.push(`🎉 ${bt.length>1?'Банкет '+b.n:'Банкет'} на завтра${b.title?' — '+b.title:''}${b.time?' · '+b.time:''}${b.guests?' · '+b.guests+' '+rupl(b.guests,['гость','гостя','гостей']):''}${b.place?' · '+b.place:''}`,...(b.note?['📝 '+b.note.replace(/\s*\n\s*/g,'; ')]:[]),...(its.length?[its.map(ln(tom)).join('\n')]:[]),'')});
out=P.left;P.nl+=lm.length;if(lm.length)out.push(`🔁 Осталось с сегодня (${day(td)})`,lm.map(ln(td)).join('\n'),'');
bl.forEach(b=>{const its=left.filter(t=>isB(t)&&bqOf(t)===b.id).sort(svSort);if(its.length)P.nl+=its.length;if(its.length)out.push(`🔁 Осталось по банкету${bl.length>1||b.title?' «'+bqName(b,bl)+'»':''} (${day(td)})`,its.map(ln(td)).join('\n'),'')});
out=P.shift;P.ns=cooks.length;const hh=hrsHid(tom);if(cooks.length)out.push(hh?'⏰ Завтра на смену':'⏰ Завтра на смену (начало)',cooks.map(k=>`${k.u?'@'+k.u:k.n}${!hh&&sh[k.id]?' — '+sh[k.id]:''}`).join('\n'));
return P};
const tomorrowBlock=sel=>{const P=tomorrowParts(),o=[];for(const k of ['prep','bq','left','shift'])if(!sel||sel[k])o.push(...P[k]);return o.join('\n').trim()};
const P2=n=>String(n).padStart(2,'0'),SC=()=>DATA.sched||{};
const rSched0=()=>{const k=team(),S=SC(),ed2=se&&isAdmin(),color=id=>{const c=k.find(x=>x.id===id);return c&&PALETTE.includes(c.color)?c.color:hashColor(id)};if(sf!=='all'&&!k.some(c=>c.id===sf))sf='all';
$('#sfilter').innerHTML=`<button class="chip${sf==='all'?' on':''}" data-a="sfil" data-id="all">Все</button>`+k.map(c=>`<button class="chip cook-chip${sf===c.id?' on':''}" style="--cook:${color(c.id)}" data-a="sfil" data-id="${c.id}"><i class="cook-dot"></i>${esc(c.n)}<small>${esc(c.r)}</small></button>`).join('');
const[y,m]=sm.split('-').map(Number),off=(new Date(y,m-1,1,12).getDay()+6)%7,dim=new Date(y,m,0).getDate(),today=dAdd(0),pins=DATA.prepPins||{},filterColor=sf==='all'?'':'--cook:'+color(sf);
$('#smt').textContent=MN(sm).toLowerCase();
let c='';for(let i=0;i<off;i++)c+='<i></i>';
for(let d=1;d<=dim;d++){const dt=`${y}-${P2(m)}-${P2(d)}`;let inner='',has=0;
if(sf==='all'){const rows=k.filter(x=>isWork(S[x.id]&&S[x.id][dt]));has=rows.length;inner=has?`<small class="marks" aria-label="Работают: ${esc(rows.map(x=>x.n).join(', '))}">${rows.slice(0,3).map(x=>`<b style="--cook:${color(x.id)};color:${color(x.id)}">Р</b>`).join('')}${has>3?`<em>+${has-3}</em>`:''}</small>`:''}
else{const s=(S[sf]||{})[dt];has=isWork(s);inner=has?`<small>${esc(workLabel(s))}</small>`:''}
const pin=pins[dt]?'<small class="day-pin" aria-label="Закреплённый день подготовки">📌</small>':'';
c+=`<button class="dc${has?' wk':''}${ssel.has(dt)?' sl':''}"${filterColor?` style="${filterColor}"`:''} data-a="sday" data-id="${dt}"><b>${d}</b>${pin}${inner}</button>`}
$('#sgrid').innerHTML=c;
{const mm0=`${y}-${P2(m)}-`,cn=(id,a,b)=>{let n=0;const sc=S[id]||{};for(let d=a;d<=b;d++)if(isWork(sc[mm0+P2(d)]))n++;return n},cm=today.slice(0,7),from=sm===cm?Number(today.slice(8)):(sm>cm?1:dim+1);
const rows=k.filter(x=>sf==='all'||x.id===sf).map(x=>({x,t:cn(x.id,1,dim),a:cn(x.id,1,15),b:cn(x.id,16,dim),r:cn(x.id,from,dim)})).filter(z=>sf!=='all'?true:z.t>0),tot=rows.reduce((a,z)=>a+z.t,0);
{const ms=$('#smsum');if(ms)ms.innerHTML=sf==='all'?(tot?`Всего смен в месяце: <b>${tot}</b>`:'Смен в этом месяце нет'):`${esc((rows[0]||{x:{n:''}}).x.n)}: <b>${rows.length?rows[0].t:0}</b> ${rupl(rows.length?rows[0].t:0,['смена','смены','смен'])}`}
$('#scount').innerHTML=`<div class="lbl">🔢 Смены · ${esc(MN(sm).toLowerCase())}</div>`+(rows.length?rows.map(z=>`<div class="scr"><i class="cook-dot" style="--cook:${color(z.x.id)}"></i><span class="scw"><b>${esc(z.x.n)}</b><small>1–15: ${z.a} · 16–${dim}: ${z.b}${sm>=cm&&z.r>0&&z.r<z.t?' · осталось '+z.r:''}</small></span><span class="scn" aria-label="Смен: ${z.t}">${z.t}</span></div>`).join('')+(sf==='all'&&rows.length>1?`<div class="sct"><span>Всего смен</span><b>${tot}</b></div>`:''):'<div class="small" style="margin:4px 0 0">В этом месяце смен нет.</div>')}
let l='',shown=0;const lim=sf==='all'?10:16;
for(let i=0;i<90&&shown<lim;i++){const dt=dAdd(i),t=dt===today?' · сегодня':'';
if(sf==='all'){const rows=k.filter(x=>isWork(S[x.id]&&S[x.id][dt]));if(rows.length){shown++;l+=`<div class="sh"><b>${esc(day(dt))}${t}</b>${rows.map(x=>`<div class="sh-person"><i class="cook-dot" style="--cook:${color(x.id)}"></i><b>${esc(x.n)}</b><span style="--cook:${color(x.id)}">${esc(workLabel(S[x.id][dt]))}</span></div>`).join('')}</div>`}}
else{const s=(S[sf]||{})[dt];if(isWork(s)){shown++;l+=`<div class="sh"><b>${esc(day(dt))}${t}</b><div class="sh-person"><i class="cook-dot" style="--cook:${color(sf)}"></i><b>${esc(k.find(x=>x.id===sf).n)}</b><span style="--cook:${color(sf)}">${esc(workLabel(s))}</span></div></div>`}}}
$('#slist').innerHTML=l||'<div class="em">Ближайших смен нет.</div>';
$('#sedit').hidden=!ed2;$('#sbtn').textContent=ed2?'✓ Готово':'✎ Править график';
const cc=k.find(x=>x.id===sf);$('#sedinfo').textContent=sf==='all'?'Выберите повара выше, чтобы отметить ему рабочие дни. В календаре появится цветная отметка Р.':`${cc?cc.n:''}: выбрано дней — ${ssel.size}. Нажимайте на дни в календаре.`};
const keepAt=(sel,fn)=>{const e=document.querySelector(sel),t=e?e.getBoundingClientRect().top:null;fn();if(t==null||t>innerHeight)return;const e2=document.querySelector(sel);if(!e2)return;const d=e2.getBoundingClientRect().top-t;if(Math.abs(d)>1)window.scrollTo({top:Math.max(0,scrollY+d),behavior:'instant'})},
touchy=()=>{try{return matchMedia('(pointer:coarse)').matches}catch{return false}},woSel=id=>`.wo-product[data-pid="${String(id).replace(/["\\]/g,'')}"]`;
const rWoCats=()=>{$('#wocats').innerHTML=`<button class="chip${wcat==='all'?' on':''}" data-a="wocat" data-id="all">Все</button>`+cats().map(c=>`<button class="chip${wcat===c.id?' on':''}" data-a="wocat" data-id="${esc(c.id)}">${c.e} ${esc(c.n.split(' и ')[0].split(',')[0])}</button>`).join('')};
const rWoProducts=()=>{const q=wq.trim().toLowerCase(),ps=prods().filter(p=>(wcat==='all'||p.c===wcat)&&(!q||p.n.toLowerCase().includes(q)));if(woDraft&&!ps.some(p=>p.id===woDraft.product.id)&&(wcat==='all'||woDraft.product.c===wcat)&&(!q||woDraft.product.n.toLowerCase().includes(q)))ps.push(woDraft.product);
const cs=cats(),defU=p=>((LS.get('vip3-wo-units',{})||{})[p.id])||p.u||'шт',uopts=u=>UNITS.includes(u)?UNITS:[...UNITS,u],
head=p=>{const x=woDraft;if(!(x&&x.product.id===p.id))return `<button class="p" data-a="woopen" data-id="${esc(p.id)}" aria-label="Списать">＋ ${esc(defU(p))}</button>`;return `<div class="st"><button data-a="wodec" aria-label="Меньше">−</button><input id="woQty" data-wovalue="qty" inputmode="decimal" value="${esc(String(x.qty).replace('.',','))}" aria-label="Количество"><select class="us" data-wounit="${esc(p.id)}" aria-label="Единица">${uopts(x.unit).map(u=>`<option${u===x.unit?' selected':''}>${esc(u)}</option>`).join('')}</select><button data-a="woinc" aria-label="Больше">+</button></div>`},
editor=p=>{const x=woDraft,legacy=x.reason==='spoiled',by=x.byId||'';return `<div class="wo-inline"><div class="wo-inline-grid"><label><span>Причина</span><select data-woreason>${(legacy?[['spoiled','Старый вариант: порча или повреждение']]:[]).concat(WO_REASONS).map(([id,name])=>`<option value="${esc(id)}"${id===x.reason?' selected':''}>${esc(name)}</option>`).join('')}</select></label><label><span>Кто списал</span><select data-woby><option value="">Не указан</option>${team().map(k=>`<option value="${esc(k.id)}"${k.id===by?' selected':''}>${esc(k.n)}</option>`).join('')}</select></label><label class="wo-wide"><span>Комментарий</span><input data-wovalue="note" maxlength="120" value="${esc(x.note)}" placeholder="Необязательно"></label></div><div class="wo-inline-actions"><button class="p" data-a="wosave">Сохранить списание</button><button class="g" data-a="wocancel">Отмена</button></div></div>`};
let h='';for(const c of cs){const rows=ps.filter(p=>p.c===c.id);if(rows.length)h+=(wcat==='all'||q?`<div class="gh">${c.e} ${esc(c.n)}</div>`:'')+rows.map(p=>{const active=woDraft&&woDraft.product.id===p.id;return `<article class="wo-product${active?' editing':''}" data-pid="${esc(String(p.id).replace(/["\\]/g,''))}"><div class="wo-product-head"><div class="n">${esc(p.n)}</div>${head(p)}</div>${active?editor(p):''}</article>`}).join('')}
$('#wocatalogcount').textContent=`${ps.length} товаров`;$('#woproducts').innerHTML=h||'<div class="em">Товары не найдены. Добавьте их во вкладке «Заказ».</div>'};
const rWoLog=()=>{const rows=woRows(wd).sort((a,b)=>(a.done?1:0)-(b.done?1:0)||(b.updated||b.created||0)-(a.updated||a.created||0));$('#wocount').textContent=`${rows.length} ${ruCount(rows.length,'запись','записи','записей')}`;$('#wocopy').disabled=!rows.length;$('#woshare').disabled=!rows.length;$('#woshare').hidden=typeof navigator.share!=='function';
$('#wolog').innerHTML=rows.length?rows.map(v=>`<article class="wo-entry wo-row${v.done?' ok':''}"><button class="ck" data-a="wodone" data-id="${esc(v.id)}" aria-label="Оформлено">${v.done?'✓':''}</button><div class="wo-body"><div class="wo-entry-head"><b>${esc(v.name)}</b><strong>${esc(fmtQ(v.qty))} ${esc(v.unit||'')}</strong></div><div class="libmeta">${esc(woReason(v.reason))}${v.note?` · ${esc(v.note)}`:''}${v.by&&v.by.n?` · Списал: ${esc(v.by.n)}`:''}${v.carryFrom?` · перенос с ${esc(day(v.carryFrom))}`:''}</div><div class="lib-actions"><button data-a="woedit" data-id="${esc(v.id)}">✎ Изменить</button><button class="d" data-a="wodel" data-id="${esc(v.id)}">Удалить</button></div></div></article>`).join(''):'<div class="em"><i aria-hidden="true">🗑️</i><b>За выбранный день списаний нет.</b>Выберите товар ниже, чтобы списать.</div>'};
const rWriteoff=()=>{setDp($('#woDate'),wd);rWoCats();rWoProducts();rWoLog()};
// ================= приёмка товара: заказано → привезено → остаток (+ лист для владельца, PDF, Excel) =================
const WDL=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const dlong=s=>{const[y,m,d]=String(s).split('-').map(Number);return y>0&&m>0&&d>0?WDL[new Date(y,m-1,d,12).getDay()]+', '+d+' '+MONG[m-1]+' '+y:String(s||'')};
const d2=n=>String(n).padStart(2,'0'),dshort=ts=>{const d=new Date(ts);return d2(d.getDate())+'.'+d2(d.getMonth()+1)};
const FAM={'г':['m',1],'кг':['m',1000],'мл':['v',1],'л':['v',1000]};
const cvt=(q,a,b)=>{if(a===b)return q;const x=FAM[a],y=FAM[b];return x&&y&&x[0]===y[0]?q*x[1]/y[1]:NaN},r3=n=>Math.round(n*1000)/1000;
let xeD=null,rcOid='',rcF='all',rcCat='all',rcSearch='',rcOpen='',rcCoOpen=0,rcDraft=null,rcPend=0,rcIx={r:[],e:[]};
const h36=s=>{let h=5381;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return h.toString(36)},rk=id=>{const s=String(id),k=s.replace(/[^\p{L}\p{N}:_-]/gu,'_');return k===s?k:k+'~'+h36(s)};
const rcRec=oid=>(DATA.receipts||{})[oid]||{},rcTouched=oid=>{const r=rcRec(oid);return Object.values(r.rows||{}).some(x=>x&&(x.x||Object.keys(x.e||{}).length))||Object.values(r.extra||{}).some(x=>x&&x.n&&Number(x.q)>0)},meObj=()=>L.me?{id:L.me.id,n:L.me.n}:null;
const rcSel=iid=>`.rc-row[data-iid="${String(iid).replace(/["\\]/g,'')}"]`;
const frs=i=>{const f=i&&i.fr;return Array.isArray(f)?f:(f&&typeof f==='object'?Object.values(f):[])};
let carDv=-1,carM=new Map(),covM=new Map();
// товар, который привезли, но не заказывали: receipts/{oid}/extra/{id} = {n,u,q,c,nt,at,by}
const rcEx=o=>Object.entries(rcRec(o.id).extra||{}).filter(([k,v])=>v&&v.n&&Number(v.q)>0).sort((a,b)=>(a[1].at||0)-(b[1].at||0)||(a[0]<b[0]?-1:1)).map(([k,v])=>{const q=r3(Number(v.q)),u=v.u||'шт',it={id:'ex:'+k,n:String(v.n),c:v.c||'',u,qty:0,ex:1,eid:k};return{it,iid:'ex_'+k,r:{},es:[{id:'e0',q,u,...(v.nt?{nt:v.nt}:{}),at:v.at||0,...(v.by?{by:v.by}:{})}],got:q,oth:[],qty:0,st0:'ok',rem0:0}});
const rcBase=o=>{const rows=rcRec(o.id).rows||{};return o.items.map(it=>{const iid=rk(it.id),r=rows[iid]||{},es=Object.entries(r.e||{}).map(([id,e])=>({...e,id})).filter(e=>e&&Number(e.q)>0).sort((a,b)=>(a.at||0)-(b.at||0));
let got=0;const oth=[];es.forEach(e=>{const c=cvt(Number(e.q),e.u,it.u);if(Number.isNaN(c))oth.push(e);else got+=c});got=r3(got);const qty=Number(it.qty)||0,st0=got>0&&got>=qty-1e-9?'ok':got>0?'part':oth.length?'chk':'none';
return{it,iid,r,es,got,oth,qty,st0,rem0:st0==='part'||st0==='none'?r3(Math.max(0,qty-got)):0}}).concat(rcEx(o))};
// Остаток недопоставки считается «перенесённым», если более поздний заказ уже содержит этот товар (вручную добавленный «↩ Не привезли ранее» или набранный самим поваром)
const carried=()=>{if(carDv===DV)return carM;carDv=DV;carM=new Map();covM=new Map();const os=ords();
os.forEach(o=>o.items.forEach(i=>{frs(i).forEach(f=>{if(f&&f.o&&f.i)carM.set(f.o+'|'+f.i,o)})}));
const asc=os.slice().sort((a,b)=>a.created-b.created),cap=new Map(),bs=new Map();
asc.forEach(o=>{if(rcTouched(o.id))bs.set(o.id,rcBase(o));o.items.forEach(i=>{const q=Number(i.qty)||0;if(q>0)cap.set(o.id+'|'+rk(i.id),{left:q,u:i.u})})});
asc.forEach(B=>B.items.forEach(i=>{const c=cap.get(B.id+'|'+rk(i.id));if(!c)return;frs(i).forEach(f=>{const a=f&&bs.get(f.o),l=a&&a.find(x=>x.iid===f.i);if(l&&l.rem0>0){const v=cvt(l.rem0,l.it.u,c.u);if(!Number.isNaN(v))c.left=Math.max(0,r3(c.left-v))}})}));
asc.forEach(A=>{const bl=bs.get(A.id);if(!bl)return;const t0=Number(rcRec(A.id).created)||A.created;
bl.forEach(l=>{if(!(l.rem0>0)||l.r.x||l.r.nc||carM.has(A.id+'|'+l.iid))return;let need=l.rem0,cov=0,first=null;
for(const B of asc){if(B.id===A.id||B.created<t0||String(B.date)<String(A.date))continue;const c=cap.get(B.id+'|'+l.iid);if(!c||!(c.left>1e-9))continue;const v=cvt(c.left,c.u,l.it.u);if(Number.isNaN(v)||!(v>1e-9))continue;const t=Math.min(need,v);cov=r3(cov+t);need=r3(need-t);c.left=Math.max(0,r3(c.left-cvt(t,l.it.u,c.u)));if(!first)first=B;if(need<=1e-9)break}
if(cov>0)covM.set(A.id+'|'+l.iid,{o:first,cov,full:need<=1e-9})})});
return carM};
const rcCarr=(oid,iid)=>{carried();const k=oid+'|'+iid,v=covM.get(k);return carM.has(k)||!!(v&&v.full)};
const rcLines=o=>{const cm=carried();return rcBase(o).map(b=>{const{it,iid,r,es,got,oth,qty,st0,rem0}=b,k=o.id+'|'+iid,car=r.nc?null:(cm.get(k)||(covM.get(k)&&covM.get(k).full?covM.get(k).o:null)),cv=r.nc?null:covM.get(k)||null,
xr=!!r.x,carr=!!car&&(st0==='part'||st0==='none'),x=xr||carr,st=x?'cx':st0,rem=st==='part'||st==='none'?rem0:0,xo=!xr&&carr?car.id:'',cov=!x&&cv&&!cv.full?cv.cov:0;
return{it,iid,es,got,oth,qty,rem,st,x,xo,cov,ex:!!it.ex,eid:it.eid||'',cvo:cov?cv.o.id:'',need:r3(Math.max(0,rem-cov)),xn:xo?'Перенесено в заказ на '+day(car.date):(r.xn||'')}})};
const rcSum=ls=>{const s={n:0,ok:0,part:0,none:0,chk:0,cx:0,car:0,ex:0};ls.forEach(l=>{if(l.ex){s.ex++;return}s.n++;s[l.st]++;if(l.xo)s.car++});s.open=s.part+s.none;s.done=s.ok+s.chk;return s};
const rcLabel=l=>l.ex?'Сверх заказа':l.st==='ok'?'Принято':l.st==='part'?'Частично':l.st==='none'?'Не привезли':l.st==='chk'?'Принято (другая ед.)':l.xo?'Перенесено в новый заказ':l.got>0?'Закрыто (частично)':'Не будет';
const rcQ=(q,u)=>fmtQ(r3(q))+' '+u;
const rcGot=l=>{const p=[];if(l.got>0)p.push(rcQ(l.got,l.it.u));l.oth.forEach(e=>p.push(rcQ(Number(e.q),e.u)));return p.join(' + ')};
const rcNote=l=>[...l.es.map(e=>e.nt).filter(Boolean),l.xn].filter(Boolean).join('; ');
const rcWho=l2=>{const s=new Set();l2.forEach(l=>l.es.forEach(e=>{if(e.by&&e.by.n)s.add(e.by.n)}));return[...s].join(', ')};
const rcOut=()=>{const out=[];ords().forEach(o=>{if(!rcTouched(o.id))return;const ls=rcLines(o).filter(l=>l.rem>0&&!l.x);if(ls.length)out.push({o,ls})});return out.sort((a,b)=>String(b.o.date).localeCompare(String(a.o.date))||b.o.created-a.o.created)};
const rcTouch=o=>{const rec=rcRec(o.id);mut('PATCH','receipts/'+o.id,{oid:o.id,date:o.date,updated:Date.now(),...(rec.created?{}:{created:Date.now()})})};
const rcTyping=()=>{const a=document.activeElement;return!!(a&&a.closest&&a.closest('#rcmain,#rchead')&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName))};
const rcOrderBtn=o=>{const ls=rcLines(o),s=rcSum(ls),touched=rcTouched(o.id),full=touched&&s.open===0,pct=s.n?Math.round((s.done+s.cx)/s.n*100):0,
lab=!touched?'Ещё не принимали':full?(s.car?(s.done?`✓ Принято · перенесено ${s.car}`:'↩ Перенесено в новый заказ'):s.done?'✓ Принято полностью':'Закрыто'):`Принято ${s.done+s.part} из ${s.n}`+(s.none?` · не привезли ${s.none}`:'');
return `<button class="rc-ord ${!touched?'new':full?'full':'part'}" data-a="rcopen" data-id="${esc(o.id)}"><div class="rc-ot"><b>Поставка ${esc(day(o.date))}</b><span>${s.n} поз.</span></div><small>${esc(o.cook.n)} · заказ от ${dshort(o.created)} ${tm(o.created)}</small><div class="rc-lab">${esc(lab)}</div><div class="rc-pb"><i style="width:${pct}%"></i></div></button>`};
const rcMissOpen=new Set();
const rcMiss=(o,ls)=>{if(!ls||!ls.length)return'';const nm=ls.slice(0,2).map(l=>l.it.n).join(', ')+(ls.length>2?' +'+(ls.length-2):'');
return `<details class="rc-miss" data-oid="${esc(o.id)}"${rcMissOpen.has(o.id)?' open':''}><summary><b>⚠️ Не привезли: ${ls.length}</b><span>${esc(nm)}</span></summary><div class="rc-mc">${ls.map(l=>`<button class="rc-mi" data-a="rcopen" data-id="${esc(o.id)}">${l.it.urg?'🚨 ':''}${esc(l.it.n)} <b>${esc(rcQ(l.need,l.it.u))}</b></button>`).join('')}</div></details>`};
const rcListHtml=()=>{const od=ords().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||b.created-a.created).slice(0,40),out=rcOut(),mo=new Map(out.map(g=>[g.o.id,g.ls]));let h='';
if(out.length){const n=out.reduce((a,g)=>a+g.ls.length,0);h+=`<div class="rc-strip"><div class="rc-st1"><b>⚠️ Не привезли</b><small>${n} поз. · ${out.length} ${ruCount(out.length,'заказ','заказа','заказов')}</small></div><button class="g" data-a="rcoutcopy" aria-label="Копировать список недопоставки">📋</button><button class="p" data-a="rcgoorder">↩ В заказ</button></div>`}
h+=`<section class="card"><div class="lbl"><span>📦 Заказы для приёмки</span>${od.length?'<small>нажмите, чтобы принять товар</small>':''}</div>`+(od.length?od.map(o=>`<div class="rc-ow${mo.has(o.id)?' m':''}">${rcOrderBtn(o)}${rcMiss(o,mo.get(o.id))}</div>`).join(''):'<div class="em"><i aria-hidden="true">📦</i><b>Принимать пока нечего</b>Оформите заказ во вкладке «Заказ» — он появится здесь.</div>')+`</section>`;return h};
const rcExRow=(l,n,op)=>{const e=l.es[0]||{},g=rcGot(l);return `<article class="rc-row s-ok ex${op?' open':''}" data-iid="${esc(l.iid)}"><div class="rc-r1"><button class="rc-nm" data-a="rctog" data-id="${n}" aria-expanded="${op}"><b>➕ ${esc(l.it.n)}</b><small>Сверх заказа · привезли ${esc(g)}</small></button><span class="rc-st s-ok">✓ ${esc(g)}</span></div>${op?`<div class="rc-e"><span>✓ ${esc(g)}${e.nt?` · ${esc(e.nt)}`:''}</span><small>${dshort(e.at||0)} ${tm(e.at||0)}${e.by&&e.by.n?' · '+esc(e.by.n):''}</small></div><div class="rc-ac"><button data-a="rcxedit" data-id="${n}">✎ Изменить</button><button class="g" data-a="rcxdel" data-id="${n}">🗑 Удалить</button></div>`:''}</article>`};
const rcRow=(o,l,n)=>{const ed=rcDraft&&rcDraft.oid===o.id&&rcDraft.iid===l.iid,op=ed||rcOpen===l.iid;rcIx.r[n]=l;if(l.ex)return rcExRow(l,n,op);
const ents=l.es.map(e=>{const k=rcIx.e.push({l,e})-1;return `<div class="rc-e"><span>✓ ${esc(rcQ(Number(e.q),e.u))}${e.nt?` · ${esc(e.nt)}`:''}</span><small>${dshort(e.at||0)} ${tm(e.at||0)}${e.by&&e.by.n?' · '+esc(e.by.n):''}</small><button data-a="rcedit" data-id="${k}" aria-label="Изменить запись">✎</button><button data-a="rcentdel" data-id="${k}" aria-label="Удалить запись">🗑</button></div>`}).join('')+(l.x?`<div class="rc-e rcx"><span>${esc(l.xn||'Остаток не привезут')}</span></div>`:'');
const covT=l.cov>0?` · <em class="rcov">в заказе на ${esc(day((ords().find(x=>x.id===l.cvo)||{}).date||''))}: ${esc(rcQ(l.cov,l.it.u))}</em>`:'';
const sub=(l.st==='part'?`Принято ${esc(rcGot(l))} из ${esc(rcQ(l.qty,l.it.u))} · <em>осталось ${esc(rcQ(l.rem,l.it.u))}</em>`:`Заказано: ${esc(rcQ(l.qty,l.it.u))}`+(l.st==='cx'&&l.got>0?` · принято ${esc(rcGot(l))}`:''))+covT;
let rt='';if(!ed){rt=l.st==='none'||l.st==='part'?`<button class="p rc-q" data-a="rcfull" data-id="${n}" aria-label="${l.st==='part'?'Привезли остаток':'Привезли всё'}">✓ ${esc(rcQ(l.rem,l.it.u))}</button>`:`<span class="rc-st s-${l.st}">${l.st==='cx'?(l.xo?'↩ Перенесено':'Не будет'):'✓ '+esc(rcGot(l)||'Принято')}</span>`}
let body='';if(ed){const d=rcDraft,us=UNITS.includes(d.unit)?UNITS:[...UNITS,d.unit];body=`<div class="rc-ed"><div class="st"><button data-a="rcdec" aria-label="Меньше">−</button><input id="rcQty" inputmode="decimal" data-rcv="qty" value="${esc(fmtQ(d.qty))}" aria-label="Привезли, количество"><select class="us" data-rcunit aria-label="Единица">${us.map(u=>`<option${u===d.unit?' selected':''}>${esc(u)}</option>`).join('')}</select><button data-a="rcinc" aria-label="Больше">+</button></div><input data-rcv="nt" maxlength="120" value="${esc(d.nt)}" placeholder="Вес или примечание (необязательно)" aria-label="Примечание"><div class="rc-ea"><button class="p" data-a="rcsave">Сохранить</button><button class="g" data-a="rccancel">Отмена</button>${d.eid?`<button class="d" data-a="rcdel">Удалить</button>`:''}</div></div>`}
else if(op){const a=[];if(!l.x)a.push(`<button data-a="rcnew" data-id="${n}">＋ Другое количество</button>`);if(l.st==='none'||l.st==='part')a.push(`<button class="g" data-a="rcxx" data-id="${n}">✕ Не привезут</button>`);if(l.x)a.push(`<button data-a="rcxx" data-id="${n}">↩ Вернуть в ожидание</button>`);body=`<div class="rc-ac">${a.join('')}</div>`}
return `<article class="rc-row s-${l.st}${ed?' editing':''}${op?' open':''}" data-iid="${esc(String(l.iid).replace(/["\\]/g,''))}"><div class="rc-r1"><button class="rc-nm" data-a="rctog" data-id="${n}" aria-expanded="${op}"><b>${l.it.urg?'🚨 ':''}${esc(l.it.n)}</b><small>${sub}</small></button>${rt}</div>${op?ents:''}${body}</article>`};
const rcFold=t=>String(t).toLowerCase().replace(/ё/g,'е'),rcCk=(cs,l)=>cs.some(c=>c.id===l.it.c)?l.it.c:'_',rcShort=c=>c.n.split(' и ')[0].split(',')[0];
const rcHeadHtml=(o,ls)=>{const s=rcSum(ls),pct=s.n?Math.round((s.done+s.cx)/s.n*100):0,who=rcWho(ls),cur=rcRec(o.id).courier||'',
flt=[['all','Все',s.n],['todo','Осталось',s.open],['done','Принято',s.done+s.cx]];
return `<section class="card rc-head"><div class="rc-bar"><button class="g" data-a="rcback">← Заказы</button><button class="g" data-a="rcsheet">📄 Лист владельцу</button></div><h3>Поставка ${esc(dlong(o.date))}</h3><div class="small">Заказал: ${esc(o.cook.n)}${o.cook.r?', '+esc(o.cook.r):''} · заказ от ${dshort(o.created)} ${tm(o.created)}${o.note?' · 💬 '+esc(o.note):''}${who?` · принимали: ${esc(who)}`:''}</div>
<div class="rc-pb big"><i style="width:${pct}%"></i></div>
<div class="chips wrap rc-flt">${flt.map(([id,n,c])=>`<button class="chip${rcF===id?' on':''}" data-a="rcflt" data-id="${id}">${n} · ${c}</button>`).join('')}</div>
${s.open?`<div class="acts"><button class="p" data-a="rcall">✓ Всё привезли</button><button class="g" data-a="rcclose">✕ Закрыть остаток</button></div>`:`<div class="rc-all">${s.car?'↩️ Остаток перенесён в новый заказ':'🎉 По этому заказу вопросов не осталось'}</div>`}
<button class="g rc-xadd" data-a="xnew">➕ Привезли то, что не заказывали</button><details class="rc-co"${rcCoOpen?' open':''}><summary>🚚 ${cur?esc(cur):'Курьер / поставщик'}</summary><input data-rccourier maxlength="40" value="${esc(cur)}" placeholder="Кто привёз (необязательно)" aria-label="Курьер или поставщик" autocomplete="off"></details></section>`};
const rcChipsHtml=ls=>{const cs=cats(),m=new Map();ls.forEach(l=>{const k=rcCk(cs,l),c=m.get(k)||m.set(k,{n:0,o:0}).get(k);c.n++;if(l.st==='none'||l.st==='part')c.o++});
return `<button class="chip${rcCat==='all'?' on':''}" data-a="rccat" data-id="all">Все</button>`+[...cs,{id:'_',n:'Другое',e:'📦'}].filter(c=>m.has(c.id)).map(c=>{const x=m.get(c.id);return `<button class="chip${rcCat===c.id?' on':''}" data-a="rccat" data-id="${esc(c.id)}">${c.e} ${esc(rcShort(c))}${x.o?` <i class="cn">${x.o}</i>`:''}</button>`}).join('')};
const rcListRows=(o,ls)=>{rcIx={r:[],e:[]};const q=rcFold(rcSearch.trim()),cs=cats(),g=new Map(),
ok=l=>(rcDraft&&rcDraft.oid===o.id&&rcDraft.iid===l.iid)||rcOpen===l.iid||((rcF==='all'||(rcF==='todo'?l.st==='none'||l.st==='part':l.st==='ok'||l.st==='chk'||l.st==='cx'))&&(rcCat==='all'||rcCk(cs,l)===rcCat)&&(!q||rcFold(l.it.n).includes(q)));
ls.forEach(l=>{const k=rcCk(cs,l);(g.get(k)||g.set(k,[]).get(k)).push(l)});let h='',n=0,any=0;
for(const c of [...cs,{id:'_',n:'Другое',e:'📦'}]){const a=(g.get(c.id)||[]).filter(ok).sort((x,y)=>COL.compare(x.it.n,y.it.n));if(a.length){any=1;h+=`<div class="gh">${c.e} ${esc(c.n)}</div>`+a.map(l=>rcRow(o,l,n++)).join('')}}
if(!any)h+=`<div class="em">${q?`Ничего не найдено по «${esc(rcSearch.trim())}»`:rcF==='todo'&&rcCat==='all'?'Всё принято ✓':'В этом фильтре ничего нет'}</div>`;return h};
const rRecv=()=>{const box=$('#rcmain');if(!box)return;rcPend=0;let o=rcOid&&ords().find(x=>x.id===rcOid);if(rcOid&&!o&&ords().length){rcOid='';rcDraft=null}
if(rcDraft&&(!o||rcDraft.oid!==o.id))rcDraft=null;const hd=$('#rchead'),sb=$('#rcsb');
if(o){const ls=rcLines(o),cs=cats();if(rcCat!=='all'&&!ls.some(l=>rcCk(cs,l)===rcCat))rcCat='all';hd.innerHTML=rcHeadHtml(o,ls);sb.hidden=false;$('#rcchips').innerHTML=rcChipsHtml(ls);box.innerHTML=rcListRows(o,ls)}
else{hd.innerHTML='';sb.hidden=true;box.innerHTML=rcListHtml()}};
const rcReset=()=>{rcCat='all';rcSearch='';rcOpen='';const q=$('#rcq');if(q)q.value=''};
const rcRefresh=iid=>{if(iid)keepAt(rcSel(iid),rRecv);else rRecv()};
// ---- модель отчёта (лист, текст, CSV, PDF)
const rcModel=o=>{const ls=rcLines(o),s=rcSum(ls),cs=cats(),g=new Map();ls.forEach(l=>{const k=cs.some(c=>c.id===l.it.c)?l.it.c:'_';(g.get(k)||g.set(k,[]).get(k)).push(l)});const rows=[];
for(const c of [...cs,{id:'_',n:'Другое',e:''}])(g.get(c.id)||[]).sort((x,y)=>COL.compare(x.it.n,y.it.n)).forEach(l=>rows.push({cat:c.n,l,name:l.it.n,ord:l.ex?'—':rcQ(l.qty,l.it.u),got:rcGot(l)||'—',rem:l.rem>0?rcQ(l.rem,l.it.u):'—',st:rcLabel(l),note:rcNote(l)}));
return{o,ls,s,rows,who:rcWho(ls),courier:rcRec(o.id).courier||'',out:ls.filter(l=>l.rem>0&&!l.x),title:'Приёмка товара',date:dlong(o.date),order:`${o.cook.n}${o.cook.r?', '+o.cook.r:''} · заказ от ${dshort(o.created)} ${tm(o.created)}`,made:`${d2(new Date().getDate())}.${d2(new Date().getMonth()+1)}.${new Date().getFullYear()} ${tm(Date.now())}`}};
const rcSummary=s=>`Принято ${s.done} из ${s.n}`+(s.part?` · частично ${s.part}`:'')+(s.none?` · не привезли ${s.none}`:'')+(s.cx-s.car>0?` · не будет ${s.cx-s.car}`:'')+(s.car?` · перенесено ${s.car}`:'')+(s.ex?` · сверх заказа ${s.ex}`:'');
const rcText=o=>{const m=rcModel(o),L2=[`📦 ${m.title}`,`Поставка: ${m.date}`,`Заказал: ${m.order}`];if(m.who)L2.push('Принимали: '+m.who);if(m.courier)L2.push('Курьер / поставщик: '+m.courier);L2.push('');
const sec=(t,a,f)=>{if(a.length)L2.push(t,...a.map(f),'')},ln=l=>`• ${l.it.n} — `;
sec('✅ Принято',m.ls.filter(l=>(l.st==='ok'||l.st==='chk')&&!l.ex),l=>ln(l)+`${rcGot(l)||'—'} (заказано ${rcQ(l.qty,l.it.u)})${rcNote(l)?' · '+rcNote(l):''}`);
sec('🟠 Частично',m.ls.filter(l=>l.st==='part'),l=>ln(l)+`привезли ${rcGot(l)} из ${rcQ(l.qty,l.it.u)}, осталось ${rcQ(l.rem,l.it.u)}${rcNote(l)?' · '+rcNote(l):''}`);
sec('❌ Не привезли',m.ls.filter(l=>l.st==='none'),l=>ln(l)+`${rcQ(l.qty,l.it.u)}`);
sec('↩️ Перенесено в новый заказ',m.ls.filter(l=>l.st==='cx'&&l.xo),l=>ln(l)+rcQ(r3(Math.max(0,l.qty-l.got)),l.it.u));
sec('➖ Остаток закрыт (не будет)',m.ls.filter(l=>l.st==='cx'&&!l.xo),l=>ln(l)+(l.got>0?`привезли ${rcGot(l)} из ${rcQ(l.qty,l.it.u)}`:`${rcQ(l.qty,l.it.u)}`));
sec('➕ Привезли сверх заказа',m.ls.filter(l=>l.ex),l=>`• ${l.it.n} — ${rcGot(l)||'—'}${rcNote(l)?' · '+rcNote(l):''}`);L2.push('Итого: '+rcSummary(m.s));return L2.join('\n')};
const csvq=v=>{v=String(v??'');return /[;"\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const rcCsv=o=>{const m=rcModel(o),R=[['Поставка','Группа','Товар','Заказано','Принято','Остаток','Статус','Примечание','Принял(и)']];
m.rows.forEach(r=>R.push([m.date,r.cat,r.name,r.ord,r.got,r.rem,r.st,r.note,rcWho([r.l])]));R.push([],['Итого',rcSummary(m.s)],['Заказал',m.order],...(m.courier?[['Курьер / поставщик',m.courier]]:[]),['Составлено',m.made]);
return'\ufeff'+R.map(r=>r.map(csvq).join(';')).join('\r\n')};
const rcSheetHtml=o=>{const m=rcModel(o),cl={ok:'ok',part:'pt',none:'no',chk:'ok',cx:'cx'};let last='',h=`<div class="rc-sh"><b>${esc(m.date)}</b><div class="small">Заказал: ${esc(m.order)}${m.who?`<br>Принимали: ${esc(m.who)}`:''}${m.courier?`<br>Курьер / поставщик: ${esc(m.courier)}`:''}</div><div class="rc-sum">${esc(rcSummary(m.s))}</div><div class="rc-tw"><table><thead><tr><th>Товар</th><th>Заказано</th><th>Принято</th><th>Остаток</th></tr></thead><tbody>`;
m.rows.forEach(r=>{if(r.cat!==last){last=r.cat;h+=`<tr class="cat"><td colspan="4">${esc(r.cat)}</td></tr>`}h+=`<tr><td>${esc(r.name)}<small class="stt ${cl[r.l.st]}">${esc(r.st)}</small>${r.note?`<small>${esc(r.note)}</small>`:''}</td><td>${esc(r.ord)}</td><td>${esc(r.got)}</td><td class="${r.l.rem>0?'no':''}">${esc(r.rem)}</td></tr>`});
return h+`</tbody></table></div></div>`};
// ---- файл: поделиться или скачать
const sendFile=async(blob,name,title)=>{const f=new File([blob],name,{type:blob.type});let can=0;try{can=!!(navigator.share&&navigator.canShare&&navigator.canShare({files:[f]}))}catch{}
if(can){try{await navigator.share({files:[f],title});return'shared'}catch(e){if(e&&e.name==='AbortError')return'cancel';
if(e&&e.name==='NotAllowedError'&&await ask('Файл готов',`<p>${esc(name)}</p>`,'↗ Отправить','Закрыть')){try{await navigator.share({files:[f],title});return'shared'}catch(e2){if(e2&&e2.name==='AbortError')return'cancel'}}}}
if((()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}catch{return false}})()){toast('Не удалось отправить файл из приложения. Откройте сайт в Safari/Chrome и повторите, либо нажмите «Копировать»');return'fail'}
const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),40000);return'download'};
// ---- PDF: страницы рисуются на canvas (кириллица без встроенных шрифтов) → JPEG → простой PDF
const pdfBuild=(jpgs,W,H,title)=>{const enc=new TextEncoder(),parts=[],offs=[];let len=0;const add=x=>{const u=typeof x==='string'?enc.encode(x):x;parts.push(u);len+=u.length};
const obj=(n,fn)=>{offs[n]=len;add(n+' 0 obj\n');fn();add('\nendobj\n')},n=jpgs.length,info=3+n*3;
add(new Uint8Array([37,80,68,70,45,49,46,52,10,37,226,227,207,211,10]));
obj(1,()=>add('<< /Type /Catalog /Pages 2 0 R >>'));
obj(2,()=>add('<< /Type /Pages /Count '+n+' /Kids ['+jpgs.map((_,i)=>(3+i*3)+' 0 R').join(' ')+'] >>'));
jpgs.forEach((j,i)=>{const p=3+i*3;
obj(p,()=>add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${p+2} 0 R >> >> /Contents ${p+1} 0 R >>`));
obj(p+1,()=>{const c='q 595 0 0 842 0 0 cm /Im0 Do Q';add(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`)});
obj(p+2,()=>{add(`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${j.length} >>\nstream\n`);add(j);add('\nendstream')})});
obj(info,()=>{let h='FEFF';for(const ch of title)h+=ch.charCodeAt(0).toString(16).padStart(4,'0').toUpperCase();add(`<< /Title <${h}> /Producer (VIP Restobar) >>`)});
const xr=len,tot=info+1;let x='xref\n0 '+tot+'\n0000000000 65535 f \n';for(let i=1;i<tot;i++)x+=String(offs[i]).padStart(10,'0')+' 00000 n \n';
add(x+'trailer\n<< /Size '+tot+' /Root 1 0 R /Info '+info+' 0 R >>\nstartxref\n'+xr+'\n%%EOF');return new Blob(parts,{type:'application/pdf'})};
const rcPdf=m=>{const W=1190,H=1684,MX=64,TOP=64,BOT=96,FF='system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),IW=W-MX*2;
const font=(s,w)=>g.font=`${w||400} ${s}px ${FF}`;
const wrap=(t,w,s,wt)=>{font(s,wt);const out=[];String(t).split('\n').forEach(par=>{let cur='';par.split(/\s+/).filter(Boolean).forEach(word=>{let x=cur?cur+' '+word:word;if(g.measureText(x).width<=w){cur=x;return}if(cur)out.push(cur);cur=word;while(g.measureText(cur).width>w&&cur.length>1){let k=cur.length-1;while(k>1&&g.measureText(cur.slice(0,k)).width>w)k--;out.push(cur.slice(0,k));cur=cur.slice(k)}});out.push(cur)});return out.length?out:['']};
const C=[{k:'name',t:'Товар',w:340},{k:'ord',t:'Заказано',w:166},{k:'got',t:'Принято',w:190},{k:'rem',t:'Осталось',w:150},{k:'st',t:'Статус',w:204}];let cx=MX;C.forEach(c=>{c.x=cx;cx+=c.w});
const col={ok:'#14733a',chk:'#14733a',part:'#b45309',none:'#b42318',cx:'#6b7280'},PAD=14,LH=30,LS2=26;
// раскладка
const rowsL=m.rows.map(r=>{const nm=wrap(r.name,C[0].w-PAD*2,24,700),nt=r.note?wrap(r.note,C[0].w-PAD*2,19,400):[],ord=wrap(r.ord,C[1].w-PAD*2,23),got=wrap(r.got,C[2].w-PAD*2,23),rem=wrap(r.rem,C[3].w-PAD*2,23,r.l.rem>0?700:400),st=wrap(r.st,C[4].w-PAD*2,21,700);
const h=Math.max(nm.length*LH+nt.length*LS2,ord.length*LH,got.length*LH,rem.length*LH,st.length*LH-2)+PAD*2;return{r,nm,nt,ord,got,rem,st,h}});
const head=[];const hd=(t,s,w,c)=>wrap(t,IW,s,w).forEach(l=>head.push({t:l,s,w,c}));
hd(m.title,42,800,'#111');hd(m.date,28,700,'#111');hd('Заказал: '+m.order,22,400,'#444');if(m.who)hd('Принимали: '+m.who,22,400,'#444');if(m.courier)hd('Курьер / поставщик: '+m.courier,22,400,'#444');hd(rcSummary(m.s),24,700,m.s.open?'#b42318':'#14733a');
const headH=head.reduce((a,x)=>a+x.s*1.35,0)+26,thH=52,catH=44;
const pages=[[]];let y=TOP+headH+thH,lastCat='';const pg=()=>pages[pages.length-1];
rowsL.forEach(R=>{const needCat=R.r.cat!==lastCat,need=R.h+(needCat?catH:0);if(y+need>H-BOT){pages.push([]);y=TOP+thH+40;lastCat=''}
if(R.r.cat!==lastCat){lastCat=R.r.cat;pg().push({type:'cat',y,t:R.r.cat});y+=catH}pg().push({type:'row',y,R});y+=R.h});
// итог: недопоставка + подписи
const outL=m.out.map(l=>wrap(`${l.it.n} — осталось ${rcQ(l.rem,l.it.u)} (из ${rcQ(l.qty,l.it.u)})`,IW-48,23,400));const outH=m.out.length?80+outL.reduce((a,x)=>a+x.length*LH,0)+16:96,sigH=130;
if(y+30+outH+sigH>H-BOT){pages.push([]);y=TOP+40}y+=30;pg().push({type:'out',y,h:outH,L:outL});y+=outH+20;pg().push({type:'sig',y:y+50});
const jpgs=[],N=pages.length;
pages.forEach((P,pi)=>{g.fillStyle='#fff';g.fillRect(0,0,W,H);let hy=TOP;
if(pi===0){head.forEach(x=>{font(x.s,x.w);g.fillStyle=x.c;g.textBaseline='top';g.fillText(x.t,MX,hy);hy+=x.s*1.35});hy=TOP+headH}else{font(20,700);g.fillStyle='#666';g.textBaseline='top';g.fillText(m.title+' · '+m.date,MX,hy);hy=TOP+40}
g.fillStyle='#1f2937';g.fillRect(MX,hy,IW,thH);font(21,700);g.fillStyle='#fff';g.textBaseline='middle';C.forEach(c=>g.fillText(c.t,c.x+PAD,hy+thH/2));
P.forEach(it=>{g.textBaseline='top';
if(it.type==='cat'){g.fillStyle='#e8ecf1';g.fillRect(MX,it.y,IW,catH);font(22,800);g.fillStyle='#111';g.fillText(it.t,MX+PAD,it.y+10)}
else if(it.type==='row'){const R=it.R,y0=it.y;g.fillStyle='#d4d8de';g.fillRect(MX,y0+R.h-1,IW,1.5);let yy=y0+PAD;font(24,700);g.fillStyle='#111';R.nm.forEach(l=>{font(24,700);g.fillText(l,C[0].x+PAD,yy);yy+=LH});font(19,400);g.fillStyle='#666';R.nt.forEach(l=>{g.fillText(l,C[0].x+PAD,yy);yy+=LS2});
const cell=(a,c,wt,clr)=>{font(23,wt);g.fillStyle=clr;a.forEach((l,i)=>g.fillText(l,c.x+PAD,y0+PAD+i*LH))};cell(R.ord,C[1],400,'#111');cell(R.got,C[2],R.r.l.got>0||R.r.l.oth.length?700:400,R.r.got==='—'?'#999':'#111');cell(R.rem,C[3],R.r.l.rem>0?700:400,R.r.l.rem>0?'#b42318':'#999');
font(21,700);g.fillStyle=col[R.r.l.st];R.st.forEach((l,i)=>g.fillText(l,C[4].x+PAD,y0+PAD+2+i*LH))}
else if(it.type==='out'){const bad=m.out.length>0;g.fillStyle=bad?'#fdecea':'#e7f6ec';g.strokeStyle=bad?'#b42318':'#14733a';g.lineWidth=2.5;g.beginPath();if(g.roundRect)g.roundRect(MX,it.y,IW,it.h,14);else g.rect(MX,it.y,IW,it.h);g.fill();g.stroke();
font(26,800);g.fillStyle=bad?'#b42318':'#14733a';g.fillText(bad?'Не привезли — осталось получить ('+m.out.length+')':'Всё привезли — недопоставки нет',MX+24,it.y+22);let yy=it.y+68;font(23,400);g.fillStyle='#111';it.L.forEach(a=>{a.forEach((l,i)=>{g.fillText((i?'   ':'• ')+l,MX+24,yy);yy+=LH})})}
else if(it.type==='sig'){font(22,400);g.fillStyle='#333';g.fillText('Принял: ______________________',MX,it.y);g.fillText('Курьер: ______________________',MX+IW/2+10,it.y);}});
font(18,400);g.fillStyle='#777';g.textBaseline='alphabetic';g.fillText('ВИАЙПИ РЕСТОБАР КУХНЯ · составлено '+m.made,MX,H-48);g.textAlign='right';g.fillText('стр. '+(pi+1)+' из '+N,W-MX,H-48);g.textAlign='left';
const b=atob(cv.toDataURL('image/jpeg',.92).split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);jpgs.push(u)});
return pdfBuild(jpgs,W,H,m.title+' '+m.date)};
const rcXSug=()=>{const box=$('#dxs');if(!box)return;const q=rcFold($('#dxn').value.trim());if(q.length<2){box.innerHTML='';return}const a=prods().filter(p=>rcFold(p.n).includes(q)&&rcFold(p.n)!==q).slice(0,6);box.innerHTML=a.map(p=>`<button type="button" class="chip" data-a="xpick" data-id="${esc(p.id)}">${esc(p.n)}<small>${esc(p.u)}</small></button>`).join('')};
const rcXFill=(n,eid,q,u,nt)=>{$('#dxeh').textContent=eid?'Изменить позицию':'Привезли сверх заказа';$('#dxn').value=n;$('#dxq').value=q;const us=UNITS.includes(u)?UNITS:[...UNITS,u];$('#dxu').innerHTML=us.map(x=>`<option${x===u?' selected':''}>${esc(x)}</option>`).join('');$('#dxt').value=nt;$('#dxd').hidden=!eid;rcXSug()};
const rcFile=(o,ext)=>'Priemka_'+String(o.date)+'.'+ext;
const rcCur=()=>rcOid&&ords().find(x=>x.id===rcOid);
const rcAdd=(o,l,q,u,nt,eid)=>{const id=eid||uid(),old=eid&&l.es.find(e=>e.id===eid),me=meObj();mut('PUT',`receipts/${o.id}/rows/${l.iid}/e/${id}`,{q,u,...(nt?{nt}:{}),at:old&&old.at?old.at:Date.now(),...(old&&old.by?{by:old.by}:me?{by:me}:{}),...(old?{upd:Date.now()}:{})})};
const rcNum=q=>{const v=parseFloat(String(q).replace(',','.'));return isFinite(v)&&v>0?Math.round(v*1000)/1000:0};
const stepOf=u=>u==='кг'||u==='л'?.5:u==='г'||u==='мл'?50:1;
const rcStable=fn=>{const rows=[...document.querySelectorAll('#rcmain .rc-row[data-iid]')],a=rows.find(r=>r.getBoundingClientRect().bottom>8);if(a)keepAt(rcSel(a.dataset.iid),fn);else fn()};
const rcRender=()=>{if(tab!=='recv')return;if(rcTyping()){rcPend=1;return}rcStable(rRecv)};
// ---------- недовезённое возвращается во вкладку «Заказ» ----------
const rcBackList=()=>{const lim=dAdd(-30),M=new Map();ords().forEach(o=>{if(String(o.date)<lim||!rcTouched(o.id))return;rcLines(o).forEach(l=>{if(!(l.rem>0)||l.x)return;const k=l.it.id+'|'+l.it.u;let g=M.get(k);if(!g){g={k,it:l.it,rem:0,src:[]};M.set(k,g)}g.rem=r3(g.rem+l.need);g.src.push({o,l});if(l.it.urg)g.urg=1})});return[...M.values()].sort((a,b)=>COL.compare(a.it.n,b.it.n))};
const rcbQty=g=>{const c=L.draft.items[g.it.id];if(!c)return 0;const v=cvt(Number(c.qty)||0,c.u,g.it.u);return Number.isNaN(v)?0:v};
const rcbIn=g=>{const c=L.draft.items[g.it.id];return!!(c&&(g.src.every(s=>frs(c).some(f=>f&&f.o===s.o.id&&f.i===s.l.iid))||rcbQty(g)>=g.rem-1e-9))};
const rcbPut=g=>{const id=g.it.id,c=L.draft.items[id];
if(c&&c.u!==g.it.u){snd.warn();toast('Этот товар уже в заказе в другой единице — измените вручную');return false}
const have=c?frs(c):[],fresh=g.src.filter(s=>!have.some(f=>f&&f.o===s.o.id&&f.i===s.l.iid));if(!fresh.length)return true;
const add=r3(fresh.reduce((a,s)=>a+s.l.need,0)),fr=fresh.map(s=>({o:s.o.id,i:s.l.iid}));
if(c){c.qty=r3((Number(c.qty)||0)+add);c.fr=have.concat(fr);if(g.urg)c.urg=1;return true}
L.draft.items[id]={id,n:g.it.n,c:g.it.c,u:g.it.u,qty:add,...(g.urg?{urg:1}:{}),fr};return true};
let rcbHtml='';
const rBack=()=>{const box=$('#rcback');if(!box)return;const gs=tab==='order'?rcBackList():[];
if(!gs.length){box.hidden=true;if(rcbHtml){box.innerHTML='';rcbHtml=''}return}
const pend=gs.filter(g=>!rcbIn(g)),
row=g=>{const inn=rcbIn(g),dt=[...new Set(g.src.map(s=>day(s.o.date)))].join(', '),q=g.src.length===1?` · заказано ${fmtQ(g.src[0].l.qty)}`:'';
return `<div class="rcb-r${inn?' in':''}"><div class="rcb-n"><b>${g.urg?'🚨 ':''}${esc(g.it.n)}</b><small>поставка ${esc(dt)}${esc(q)}</small></div><b class="rcb-q">${esc(rcQ(g.rem,g.it.u))}</b>${inn?`<span class="rcb-in">✓ в заказе${g.src.every(s=>frs(L.draft.items[g.it.id]||{}).some(f=>f&&f.o===s.o.id&&f.i===s.l.iid))?'':' · '+esc(rcQ(rcbQty(g),g.it.u))}</span>`:`<button class="p rcb-add" data-a="rcbadd" data-id="${esc(g.k)}" aria-label="Добавить в заказ">＋</button>`}</div>`},
html=`<summary><span class="rcb-t"><b>↩️ Не привезли ранее</b><em class="${pend.length?'rcw':'rco'}">${pend.length?pend.length+' '+ruCount(pend.length,'позиция','позиции','позиций')+' — вернуть в заказ':'всё добавлено в заказ'}</em></span></summary><div class="rcb-b">${gs.map(row).join('')}${pend.length>1?`<div class="acts"><button class="p" data-a="rcball">＋ Добавить все (${pend.length})</button></div>`:''}</div>`;
box.hidden=false;if(html!==rcbHtml){rcbHtml=html;box.innerHTML=html}};

// ================= личные кабинеты и зарплата =================
const PAYROLL=()=>DATA.payroll||{},CUR=()=>(PAYROLL()._cfg||{}).cur||'₽';
const fnum=n=>{n=Math.round((Number(n)||0)*100)/100;const neg=n<0,s=Math.abs(n).toFixed(2).replace(/\.?0+$/,''),p=s.split('.'),i=p[0].replace(/\B(?=(\d{3})+$)/g,'\u00a0');return(neg?'-':'')+i+(p[1]?','+p[1]:'')};
const MONN=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const fmtH=h=>String(Math.round((Number(h)||0)*100)/100).replace('.',','),mny=(n,c)=>fnum(n)+' '+(c||'₽');
const MN=ym=>{const a=String(ym).split('-').map(Number),s=MONN[(a[1]||1)-1]+' '+a[0];return s.charAt(0).toUpperCase()+s.slice(1)};
const nextM=ym=>iso(new Date(Number(ym.slice(0,4)),Number(ym.slice(5,7)),1,12)).slice(0,7),prevM=ym=>iso(new Date(Number(ym.slice(0,4)),Number(ym.slice(5,7))-2,1,12)).slice(0,7);
const PT={adv:'Аванс',sal:'Зарплата',oth:'Прочее'};
const daysMap=id=>{const p=PAYROLL()[id]||{},S=(DATA.sched||{})[id]||{},out={};Object.keys(S).forEach(d=>{if(isWork(S[d])&&Number(p.dh)>0)out[d]=Number(p.dh)});Object.keys(p.hours||{}).forEach(d=>{const h=Number(p.hours[d])||0;if(h>0)out[d]=h;else delete out[d]});return out};
const DRE=/^\d{4}-\d{2}-\d{2}$/;
// объединяет данные руководителя (sn) с тем, что ввёл сам повар (u: in — часы, rt — ставки по датам, pm — полученные суммы)
const mergeSn=(sn,u)=>{u=u||{};const days=Object.assign({},sn.days||{}),ex=sn.ex||{};Object.entries(u.in||{}).forEach(([d,v])=>{if(ex[d]||!v)return;const h=Number(v.h);if(h>0)days[d]=h;else if(h===0)delete days[d]});
const rs=[];Object.entries(sn.rs||{}).forEach(([id,v])=>{if(v&&DRE.test(v.f||'')&&Number(v.r)>=0)rs.push({id,f:v.f,r:Number(v.r),t:v.t||0,u:'a',...(DRE.test(v.e||'')&&v.e>=v.f?{e:v.e}:{})})});Object.entries(u.rt||{}).forEach(([id,v])=>{if(v&&DRE.test(v.f||'')&&Number(v.r)>=0)rs.push({id:'c_'+id,f:v.f,r:Number(v.r),t:v.t||0,u:'c'})});rs.sort((a,b)=>a.f<b.f?-1:a.f>b.f?1:a.t-b.t);
const pay=Object.assign({},sn.pay||{});Object.entries(u.pm||{}).forEach(([id,v])=>{if(v&&Number(v.a)>0&&DRE.test(v.d||''))pay['c_'+id]={d:v.d,a:Number(v.a),t:v.t||'oth',m:v.m||v.d.slice(0,7),n:v.n||'',u:'c'}});
return Object.assign({},sn,{days,rs,pay})};
const snapFor=(id,full)=>{const p=PAYROLL()[id]||{},k=team().find(x=>x.id===id)||{n:'?'},pay={},ex={},rs={},fn={};Object.entries(p.fines||{}).forEach(([i,v])=>{if(v&&Number(v.a)>0&&DRE.test(v.d||''))fn[i]={d:v.d,a:Number(v.a),n:v.n||''}});Object.entries(p.pay||{}).forEach(([i,v])=>{if(v)pay[i]={d:v.d,a:v.a,t:v.t,m:v.m,n:v.n||''}});Object.entries(p.rates||{}).forEach(([i,v])=>{if(v&&DRE.test(v.f||'')&&Number(v.r)>=0)rs[i]={f:v.f,r:Number(v.r),t:v.t||0,...(DRE.test(v.e||'')&&v.e>=v.f?{e:v.e}:{})}});Object.keys(p.hours||{}).forEach(d=>{if(p.hours[d]!==undefined&&p.hours[d]!==null)ex[d]=1});
const base={n:k.n,r:Number(p.rate)||0,c:CUR(),dh:Number(p.dh)||0,days:daysMap(id),ex,pay,rs,fn,up:Date.now()};return full?mergeSn(base,(DATA.acctU||{})[id]):base};
const pubT={};
const publishAcct=id=>{const p=PAYROLL()[id];if(!p||!p.key||!isAdmin())return;clearTimeout(pubT[id]);pubT[id]=setTimeout(()=>{const q=PAYROLL()[id];if(q&&q.key)mut('PATCH','acct/'+q.key,snapFor(id,false))},700)};
const publishAll=()=>team().forEach(k=>publishAcct(k.id));
const rateOn=(sn,d)=>{let r=Number(sn.r)||0;if(Array.isArray(sn.rs))for(const x of sn.rs){if(x.f>d)break;if(!x.e||d<=x.e)r=x.r}return r};
const r2=n=>Math.round((Number(n)||0)*100)/100;
const calcM=(sn,ym)=>{const list=Object.keys(sn.days||{}).filter(d=>d.slice(0,7)===ym).sort().map(d=>{const r=rateOn(sn,d),h=sn.days[d];return{d,h,r,s:r2(h*r)}}),hours=list.reduce((a,b)=>a+b.h,0),earned=r2(list.reduce((a,b)=>a+b.s,0)),pays=Object.entries(sn.pay||{}).map(([id,v])=>({id,...v})).filter(v=>v.m===ym).sort((a,b)=>(String(a.d)<String(b.d)?-1:String(a.d)>String(b.d)?1:0)),paid=r2(pays.reduce((a,b)=>a+(Number(b.a)||0),0)),
fines=Object.entries(sn.fn||{}).map(([id,v])=>({id,...v})).filter(v=>v&&Number(v.a)>0&&String(v.d||'').slice(0,7)===ym).sort((a,b)=>(String(a.d)<String(b.d)?-1:String(a.d)>String(b.d)?1:0)),fine=r2(fines.reduce((a,b)=>a+(Number(b.a)||0),0));return{list,hours,earned,pays,paid,fines,fine,left:r2(earned-fine-paid)}};
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
const WDH=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const shCal=(sn,c,ym,adm)=>{const[y,m]=ym.split('-').map(Number),off=wdIdx(y,m,1),dim=new Date(y,m,0).getDate(),today=dAdd(0),by={},ex=sn.ex||{};c.list.forEach(x=>{by[x.d]=x});
let h=`<div class="dw shw">${WDH.map(w=>`<span>${w}</span>`).join('')}</div><div class="cal shc">`;
for(let i=0;i<off;i++)h+='<i></i>';
for(let d=1;d<=dim;d++){const dt=`${y}-${P2(m)}-${P2(d)}`,x=by[dt],lk=!adm&&ex[dt];
h+=`<button class="dc shd${x?' wk':''}${dt===today?' td':''}${lk?' lk':''}" data-a="shday" data-id="${dt}" aria-label="${esc(fmtLong(dt))}${x?', '+fmtH(x.h)+' ч':''}"><b>${d}</b>${x?`<small>${fmtH(x.h)} ч</small>`:''}${lk?'<em>🔒</em>':''}</button>`}
return h+'</div>'};
const secSh=o=>{const {sn,c,cu,adm,pid,ym}=o,ex=sn.ex||{};
const rows=c.list.length?'<div class="gh">Смены месяца · '+c.list.length+'</div>'+c.list.map(x=>`<button class="ac-row shrow" data-a="shday" data-id="${x.d}"><span>${esc(day(x.d))}${adm?cinMark(pid,x.d):''}</span><span class="rt">${fmtH(x.h)} ч × ${fmtH(x.r)}</span><b>${fm(x.s,cu)}</b><i class="ed" aria-hidden="true">${!adm&&ex[x.d]?'🔒':'✎'}</i></button>`).join(''):'';
return `<div class="shtip">${adm?'Нажмите на день — запишите или исправьте смену.':'👆 Нажмите на день, в который вы работали, — выберите часы. Готово.'}</div>`+shCal(sn,c,ym,adm)+rows+`<div class="secn">${adm?'Смены берутся из графика (Р × часов в смене); любой день можно поправить или удалить. 👤 — день записал повар.':'Смену можно исправить или удалить: нажмите на день. 🔒 — день исправил шеф. Все записи видит шеф.'}</div>`};
const secPy=o=>{const {c,cu,adm,ym}=o,st=(t,d,l)=>{const v=c.pays.filter(p=>p.t===t).reduce((a,b)=>a+(Number(b.a)||0),0);return `<div class="ac-st${v?' ok':''}"><b>${l}</b><span>${esc(day(d))}</span><strong>${v?'✓ '+fm(v,cu):'ожидается'}</strong></div>`};
const rows=c.pays.length?c.pays.map(p=>{const own=p.u==='c';return `<div class="ac-row"><span>${esc(day(p.d))}</span><span>${esc(PT[p.t]||'')}${p.n?' · '+esc(p.n):''}${adm?(own?' · 👤':''):(own?'':' · шеф')}</span><b>${fm(p.a,cu)}</b>${adm?`<button class="x" data-a="paydel" data-id="${esc(p.id)}" aria-label="Удалить">✕</button>`:own?`<button class="x" data-a="cabpdel" data-id="${esc(p.id.slice(2))}" aria-label="Удалить">✕</button>`:''}</div>`}).join(''):'<div class="small em0">Выплат в этом месяце нет.</div>';
const sel='<option value="adv">Аванс</option><option value="sal">Зарплата</option><option value="oth">Прочее</option>';
const form=adm?`<div class="row2 stk">${dpBtn('pyd',dAdd(0))}<input id="pya" inputmode="decimal" placeholder="Сумма" autocomplete="off"></div><div class="row2"><select id="pyt">${sel}</select><input id="pyn" placeholder="Комментарий" maxlength="60" autocomplete="off"></div><div class="acts"><button class="p" data-a="payadd">Записать выплату</button></div>`:`<div class="row2 stk">${dpBtn('cabpd',dAdd(0))}<input id="cabpa" inputmode="decimal" placeholder="Сумма" autocomplete="off"></div><div class="row2"><select id="cabpt">${sel}</select><input id="cabpn" placeholder="Комментарий" maxlength="60" autocomplete="off"></div><div class="acts"><button class="p" data-a="cabpay">Записать полученное</button></div>`;
return st('adv',ym+'-28','Аванс')+st('sal',nextM(ym)+'-15','Зарплата')+rows+addf('py',adm?'＋ Записать выплату':'＋ Записать полученное',form)+`<div class="secn">Аванс — 28 числа (идёт в месяц даты выплаты), зарплата — 15 числа следующего месяца (закрывает предыдущий). «Прочее» относится к месяцу, открытому сейчас.</div>`};
const secFn=o=>{const {c,cu,adm}=o;
const rows=c.fines.length?c.fines.map(v=>`<div class="ac-row"><span>${esc(day(v.d))}</span><span>${esc(v.n||'Штраф')}</span><b class="neg">−${fm(v.a,cu)}</b>${adm?`<button class="x" data-a="finedel" data-id="${esc(v.id)}" aria-label="Удалить">✕</button>`:''}</div>`).join('')+`<div class="ac-row"><span>Итого</span><span></span><b class="neg">−${fm(c.fine,cu)}</b></div>`:`<div class="small em0">${adm?'Штрафов в этом месяце нет.':'Штрафов в этом месяце нет 👍'}</div>`;
const form=`<div class="row2 stk">${dpBtn('fnd',dAdd(0))}<input id="fna" inputmode="decimal" placeholder="Сумма штрафа" autocomplete="off"></div><input id="fnn" placeholder="Причина (необязательно)" maxlength="60" autocomplete="off" style="margin-top:8px"><div class="acts"><button class="d" data-a="fineadd">Назначить штраф</button></div>`;
return rows+(adm?addf('fn','＋ Назначить штраф',form)+'<div class="secn">Штраф сразу появляется в кабинете повара и вычитается из его начислений за месяц даты штрафа.</div>':'<div class="secn">Штрафы назначает шеф. Сумма вычитается из начисленного за месяц штрафа.</div>')};
const rngText=(f,e)=>e&&e!==f?`${day(f)} — ${day(e)}`:e?day(f):`с ${day(f)}`;
const secRt=o=>{const {sn,cu,adm,p}=o,now=rateOn(sn,dAdd(0)),rs=sn.rs||[];
let h=`<div class="ratenow"><small>Ставка сейчас</small><b>${now?fm(now,cu)+' / час':'не указана'}</b></div>`;
if(adm)h+=`<div class="row2"><label><div class="lbl">Основная ставка за час</div><input inputmode="decimal" data-pset="rate" value="${esc((p||{}).rate||'')}" placeholder="0"></label><label><div class="lbl">Часов в смене</div><input inputmode="decimal" data-pset="dh" value="${esc((p||{}).dh||'')}" placeholder="0"></label></div><div class="row2"><label><div class="lbl">Валюта</div><input data-pset="cur" value="${esc(cu)}" maxlength="6"></label><div></div></div>`;
h+='<div class="gh">Ставки по периодам</div>'+(sn.r?`<div class="ac-row"><span>Основная</span><span class="lk">если период не задан</span><b>${fm(sn.r,cu)} / ч</b></div>`:'')+(rs.length?rs.map(x=>`<div class="ac-row"><span>${esc(rngText(x.f,x.e))}</span><span class="lk">${x.u==='c'?(adm?'👤 повар':'записал(а) я'):''}</span><b>${fm(x.r,cu)} / ч</b>${adm?`<button class="x" data-a="ratedel" data-id="${esc(x.id)}" aria-label="Удалить">✕</button>`:x.u==='c'?`<button class="x" data-a="cabrdel" data-id="${esc(x.id.slice(2))}" aria-label="Удалить">✕</button>`:''}</div>`).join(''):(sn.r?'':'<div class="small em0">Ставка ещё не указана.</div>'));
const form=`<div class="row2 stk"><label class="fl"><span>С даты</span>${dpBtn('rtd',dAdd(0),'Начало периода')}</label><label class="fl"><span>По дату (необязательно)</span>${dpBtn('rte','','Конец периода','без конца')}</label></div><input id="rtr" inputmode="decimal" placeholder="${esc(cu)} / час на этот период" autocomplete="off" style="margin-top:8px"><div class="chips wrap" style="margin-top:8px"><button type="button" class="chip" data-a="rtmonth">Весь этот месяц</button><button type="button" class="chip" data-a="rtopen">Без конца</button></div><div class="acts"><button class="p" data-a="rateadd">Добавить ставку на период</button></div>`;
return h+(adm?addf('rt','＋ Ставка на период (с — по)',form):'')+`<div class="secn">${adm?'Укажите период «с — по» и ставку за час: все дни периода считаются по ней, остальные дни — по основной ставке. Если «по» не указано — ставка действует и дальше.':'Ставки назначает шеф. Каждый день считается по ставке, действующей в этот день.'}</div>`};
const SECF={sh:secSh,py:secPy,fn:secFn,rt:secRt};
const acctHTML=(sn0,ym)=>{const sn=mergeSn(sn0,sn0),c=calcM(sn,ym),cu=sn.c||'₽',tot=allTot(sn);
return `<div class="mh"><button class="g" data-a="cabmon" data-id="-1" aria-label="Назад">‹</button><b>${esc(MN(ym))}</b><button class="g" data-a="cabmon" data-id="1" aria-label="Вперёд">›</button></div>${heroH(c,cu,sn)}${secBar(c)}<div class="sec">${SECF[csec]({sn,c,cu,adm:0,ym})}</div>${allH(tot,cu)}`};
// сохраняет открытую форму и набранный в ней текст при фоновых обновлениях
const keepForms=(box,fn)=>{let st=[];if(box&&typeof box.querySelectorAll==='function')st=[...box.querySelectorAll('details.addf')].map(d=>[d.dataset.k,d.open,[...d.querySelectorAll('input,select,button[data-dp]')].map(i=>[i.id,i.value])]);fn();st.forEach(([k,o,vs])=>{if(!o)return;const d=box.querySelector(`details.addf[data-k="${k}"]`);if(!d)return;d.open=true;vs.forEach(([id,v])=>{const i=id&&d.querySelector('#'+id);if(i){if(i.dataset&&i.dataset.dp!==undefined)setDp(i,v);else i.value=v}})})};
const cabTouch=()=>{clearTimeout(idleT);if(ses)idleT=setTimeout(()=>cabLogout(true),180000)};
function cabLogout(auto){const was=!!(ses||cabPick);csec='sh';ses=null;acctData=null;cabPick=null;clearTimeout(idleT);clearTimeout(hideT);if(tab==='cab')rCab();if(auto&&was)toast('Кабинет закрыт — сессия завершена')}
const busyEdit=()=>{const a=document.activeElement,b=$('#cabBox');return!!(a&&b&&b.contains&&b.contains(a)&&/INPUT|SELECT|TEXTAREA/.test(a.tagName||''))};
const rCab=reset=>{const cu=$('#cabUser');if(!cu)return;const adm=isAdmin();cu.hidden=adm;$('#payadm').hidden=!adm;if(adm){rPayAdm(reset);return}
const k=team(),box=$('#cabBox');
if(ses&&acctData){const draw=()=>{box.innerHTML=`<div class="acc-bar"><b>👤 ${esc(acctData.n)}</b><button class="d" data-a="cabout">Закрыть</button></div>`+acctHTML(acctData,mm)};reset?draw():keepForms(box,draw);return}
if(cabPick){const c=k.find(x=>x.id===cabPick);if(!c){cabPick=null;rCab();return}box.innerHTML=`<div class="acc-bar"><b>${esc(c.n)}</b><button class="g" data-a="cabback">Назад</button></div><div class="small" style="margin:0 0 8px">Введите пароль, который выдал вам шеф.</div><input type="password" id="cabpw" placeholder="Пароль" autocomplete="new-password" autocapitalize="off" autocorrect="off" spellcheck="false"><div class="acts"><button class="p" data-a="cablogin">Войти</button></div>`;return}
box.innerHTML=`<div class="lbl">Выберите своё имя</div><div class="chips wrap">${k.map(c=>`<button class="chip cook-chip" style="--cook:${cookColor(c.id)}" data-a="cabpick" data-id="${esc(c.id)}"><i class="cook-dot"></i>${esc(c.n)}<small>${esc(c.r)}</small></button>`).join('')||'<span class="small">Повара не добавлены.</span>'}</div><div class="small" style="margin-top:10px">🔒 Кабинет защищён паролем. Каждый видит только свой счёт.</div>`};
const rGseg=()=>{const s=$('#gseg');if(!s)return;const on=tab==='sched'||tab==='cab';s.hidden=!on;if(!on)return;[['sched','#gsch'],['cab','#gcab']].forEach(([k,q])=>{const e=$(q);if(e)e.classList.toggle('on',k===tab)});const g=$('#gcab');if(g)g.textContent=isAdmin()?'💼 Зарплаты':'👤 Мой кабинет'};
const rMeBox=()=>{const b=$('#mebox');if(!b)return;const k=team().find(x=>x.id===sf);b.innerHTML=k?`<button class="p" data-a="cabgo">💼 Мой кабинет: ${esc(k.n)}</button>${TGB?`<a class="tgl" href="${esc(tgLink(k.id))}" target="_blank" rel="noopener">✈️ Подключить Telegram: уведомления о смене</a>`:''}`:'<div class="small">Выберите своё имя выше, чтобы открыть личный кабинет (часы и зарплата).</div>'};
async function cabW(sub,id,val){if(!ses||!DB)return{ok:0,st:0};try{const u=`${DB}/acct/${ses.key}/${sub}/${id}.json`,r=await fetchFast(u,val===null?{method:'DELETE'}:{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(val)},9000);if(!r.ok)return{ok:0,st:r.status};fetchFast(`${DB}/meta/cabinet.json`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(Date.now())},6000).catch(()=>{});return{ok:1,st:200}}catch(e){return{ok:0,st:0}}}
let shd=null;
const shPrev=()=>{const el=$('#dshm');if(!el||!shd)return;const h=Number(String($('#dshh').value).replace(',','.'));el.textContent=h>0&&shd.rate>0?`≈ ${mny(h*shd.rate,shd.cu)} · ставка ${mny(shd.rate,shd.cu)} / час`:(h>0&&!shd.adm?'Ставка пока не указана — сумма появится, когда шеф её задаст.':'')};
// мгновенная запись в кабинет: сначала показываем, потом отправляем; при ошибке возвращаем как было
async function cabOpt(sub,id,val,msg){if(!ses||!acctData)return false;const key=ses.key;acctData[sub]=acctData[sub]||{};const had=Object.prototype.hasOwnProperty.call(acctData[sub],id),old=acctData[sub][id];
if(val===null)delete acctData[sub][id];else acctData[sub][id]=val;cabTouch();snd.ok();rCab(true);if(msg)toast(msg);
const r=await cabW(sub,id,val);if(r.ok)return true;
if(ses&&ses.key===key&&acctData){acctData[sub]=acctData[sub]||{};if(had)acctData[sub][id]=old;else delete acctData[sub][id];rCab(true)}
snd.warn();vib(80);toast(r.st===401||r.st===403?'Нет прав записи — шефу нужно опубликовать новые правила Firebase':'Не сохранено — нет связи');return false}
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
$('#dinfo').textContent=[`Версия: ${VER}`,`Режим: ${DEMO?'ДЕМО (config.js не заполнен)':'облако'}`,`База: ${DB||'не найдена'}${DBV?' ✓':''}`,`Живая связь: ${ST.open.meta&&!metaBroken?'мгновенная (поток)':metaBroken?'быстрый опрос (обновите правила Firebase)':'быстрый опрос'}`,`В очереди на отправку: ${L.out.length}`,`Ответ базы: ${ST.okAt?Math.round((Date.now()-ST.okAt)/1e3)+' с назад':'нет'}`,`Последняя ошибка: ${ST.lastErr||'нет'}`,`Скачано сегодня: ${txFmt()}`,`Ошибок на телефоне: ${ERRS.length}`,`Телефон в сети: ${navigator.onLine?'да':'нет'}`,`Повара: ${team().length} · заказы: ${ords().length} · заготовок на день: ${Object.keys(dm()).length}`,`Устройство: ${DEV}`].join('\n');$('#dlog').textContent=''};
const rHist=()=>{const q=$('#hq').value.trim().toLowerCase();const l=ords().filter(o=>!q||(o.cook.n+' '+o.date+' '+day(o.date)+' '+o.items.map(i=>i.n).join(' ')).toLowerCase().includes(q));
$('#hl').innerHTML=l.length?l.map(o=>`<div class="hc"><b>${esc(day(o.date))} · ${esc(o.cook.n)}</b><small>${esc(o.cook.r)} · ${o.items.length} поз. · ${new Date(o.created).toLocaleDateString('ru')} ${tm(o.created)}${o.copied?' · ✓ скопирован':' · не скопирован'}</small><div style="font-size:13px;margin-top:4px">${esc([...o.items].sort((a,b)=>(b.urg?1:0)-(a.urg?1:0)).slice(0,5).map(i=>(i.urg?'🚨 ':'')+i.n).join(', '))}${o.items.length>5?'…':''}</div><div class="acts"><button data-a="open" data-id="${o.id}">Открыть и править</button><button data-a="rcgo" data-id="${o.id}">📦 Принять</button><button data-a="hcopy" data-id="${o.id}">Копировать</button><button data-a="himg" data-id="${o.id}">🖼 Лист A4</button><button class="d" data-a="hdel" data-id="${o.id}">Удалить</button></div></div>`).join(''):'<div class="em"><i aria-hidden="true">🕘</i><b>История пока пуста</b>Отправленные заказы появятся здесь.</div>'};
function render(){raf=0;const d={...D};for(const k in D)delete D[k];if(d.plan)applyDs();
if(d.team&&dialogOpen('#dwho'))rWho();
if(d.team){if(isAdmin())ensureTeamColors();rCooks();rPCooks();rShifts();if(tab==='prep'){rPrep();rPlan()}if(tab==='sched')rSched();if(dialogOpen('#dt'))rTeam()}
if((d.sched||d.prepPins)&&tab==='sched')rSched();
if(d.shifts||d.sched||d.shiftsLast||d.plan)rShifts();if(d.payroll&&tab==='cab'&&isAdmin())loadIn();if((d.payroll||d.acctU)&&tab==='cab')rPayAdm();if(d.team&&tab==='cab')rCab();
if(d.prepCats){rFil();if(tab==='prep'){rPrep();rPlan();rLibrary()}if(dialogOpen('#dcat'))rCatMgr()}
if(d.catalog){syncDraft();rCats();rList();rBar();if(tab==='writeoff'){rWoCats();rWoProducts()}if(dialogOpen('#dt'))rAdm()}
if(d.writeoffs&&tab==='writeoff')keepAt('#woproducts',rWoLog);
if(d.orders&&dialogOpen('#dh'))rHist();if(tab==='recv'&&(d.receipts||d.orders||d.catalog||d.team))rcRender();if(tab==='order'&&(d.orders||d.receipts)){try{rBack()}catch(e){console.error('rBack',e)}}
if(tab==='prep'&&(d.prep||d.plan||d.prepPins||d.prepLibrary||d.prepMeta))rPrep();
if(tab==='prep'&&(d.prep||d.plan||d.prepLibrary))rPlan();
if(tab==='prep'&&d.prepLibrary){rLibrary();autoLib()}
if(d.prepMeta||d.prep||d.plan||d.team)rBqAlert();
if(LIVE.msg&&dialogOpen('#dc'))LIVE.msg();
clearTimeout(ct);ct=setTimeout(()=>LS.set('vip3-cache',DATA),4000)}
const tkRes=()=>{const g=Math.round(Number(String($('#tkgst').value).replace(',','.')))||0,k=fq($('#tkk').value)||0;$('#tkres').textContent=g&&k?`= ${fmtQ(Math.round(g*k*100)/100)} ${$('#tkgu').value}`:'Введите число гостей';};
const tkMode=m=>{tk.mode=m;$('#tkNum').hidden=m!=='n';$('#tkG').hidden=m!=='g';document.querySelectorAll('#tkm button').forEach(b=>b.classList.toggle('on',b.dataset.id===m));if(m==='g')tkRes()};
const libTouch=p=>{const old=libFind(p.t,p.g),id=old?old.id:libId(p.t,p.g);mut('PUT','prepLibrary/'+id,{t:p.t,q:p.q||'',g:p.g||'main',k:p.k||'other',ks:p.ks||'auto',...(p.pg?{pg:p.pg,pu:p.pu}:{}),by:old&&old.by?old.by:null,usedAt:Date.now()})};
const addFromLib=(i,id)=>{const isBq=i.g==='banq',cu0=isBq?bqCur():null,bid=isBq?(cu0&&!cu0.all?cu0.id:bqTarget()):null;if(Object.values(dm()).some(t=>nt(t.t)===nt(i.t)&&((t.g==='banq')===isBq)&&(!isBq||bqOf(t)===bid))){snd.warn();toast(isBq?'Уже есть в этом банкете':'Уже есть на этот день');return}const nid=uid(),linked=!!i.pg;
mut('PUT',`prep/${pd}/${nid}`,{t:i.t,g:i.g||'main',k:i.k||'other',...(i.ks?{ks:i.ks}:{}),...(linked?{pg:i.pg,pu:i.pu||'порц'}:{}),...(bid&&bid!=='0'?{bq:bid}:{}),c:Date.now()});if(id)mut('PATCH','prepLibrary/'+id,{usedAt:Date.now()});snd.add();
if(!linked||!guestsFor({g:i.g,bq:bid},pd))setTimeout(()=>ACT.tkopen(nid,1),30);else toast('✓ Добавлено · '+qtyText({pg:i.pg,pu:i.pu||'порц',g:i.g,bq:bid},pd))};

// ---------- заказ ----------
const msg=(o,includeTodayWriteoffs=false)=>{const L2=[`🧾 Заказ на ${day(o.date)}`,`👨‍🍳 ${o.cook.n}, ${o.cook.r}`,`🕒 оформлен в ${tm(o.created)}`,''];
const cs=[...BASE,...Object.entries(cat0().groups||{}).map(([k,v])=>[k,v.n,'📦'])],seen=new Set(),ln=i=>`• ${i.urg?'🚨 ':''}${i.n} — ${fmtQ(i.qty)} ${i.u}`,ug=(a,b)=>(b.urg?1:0)-(a.urg?1:0);
for(const[id,n,e]of cs){const g=o.items.filter(i=>i.c===id);if(!g.length)continue;g.forEach(i=>seen.add(i.id));L2.push(`${e} ${n}`,g.sort((a,b)=>ug(a,b)||COL.compare(a.n,b.n)).map(ln).join('\n'),'')}
const r=o.items.filter(i=>!seen.has(i.id));if(r.length)L2.push('📦 Другое',r.sort((a,b)=>ug(a,b)).map(ln).join('\n'),'');
if(o.note)L2.push('💬 '+o.note,'');{const nu=o.items.filter(i=>i.urg).length;L2.push(`Всего: ${o.items.length} поз.${nu?` · 🚨 срочно: ${nu}`:''}`)}if(includeTodayWriteoffs){const date=dAdd(0),rows=woRows(date);if(rows.length)L2.push('',writeoffMessage(date,rows));const tb=tomorrowBlock();if(tb)L2.push('',tb)}if(o.closed)L2.push('','🔒 Кухня закрыта ✓ (проверил: '+o.cook.n+')');return L2.join('\n')};
const snap=()=>{const d=L.draft,old=d.editId&&ords().find(o=>o.id===d.editId);return{id:d.editId||'o'+uid(),created:old?old.created:Date.now(),updated:Date.now(),date:d.date,cook:d.cook,note:d.note.trim(),items:dI().map(i=>({...i})),copied:old?!!old.copied:false,...(old&&old.closed?{closed:true}:{})}};
const valid=()=>{if(!cnt()){snd.warn();vib(80);toast('Добавьте хотя бы один товар');return 0}if(!L.draft.cook){snd.warn();vib(80);toast('Выберите повара');$('#dr').close();$('#cooks').classList.add('bad');setTimeout(()=>$('#cooks').classList.remove('bad'),1500);window.scrollTo({top:0,behavior:'smooth'});return 0}return 1};
const upsert=o=>mut('PUT','orders/'+o.id,o);
const ask=(t,h,y='Да',n='Нет, вернуться')=>new Promise(res=>{const d=$('#dc');$('#ct').textContent=t;$('#cb').innerHTML=h;$('#cy').textContent=y;$('#cn').textContent=n;snd.ask();vib(40);const f=v=>()=>{d.close();res(v)};$('#cy').onclick=f(true);$('#cn').onclick=f(false);d.oncancel=()=>res(false);d.showModal()});
const clip=async t=>{try{await navigator.clipboard.writeText(t);return 1}catch{try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.append(a);a.select();const ok=document.execCommand('copy');a.remove();return ok}catch{return 0}}};
const copyOrder0=async()=>{const hasOrd=!!cnt();if(hasOrd&&!valid())return;try{await onMeta(true)}catch{}
const o=hasOrd?snap():{id:'',created:Date.now(),date:dAdd(0),cook:L.draft.cook||L.me||null,note:'',items:[],copied:false};
const sel=await sendPanel(o,hasOrd);if(!sel)return;
const orderIn=hasOrd&&!!sel.ord;o.closed=!!sel.close;const build=()=>composeMsg(o,sel,orderIn);
ORDCUR={o,sel,orderIn};$('#cx').hidden=false;LIVE.msg=()=>{const pre=document.querySelector('#cb pre.msg'),m=build();if(pre&&pre.textContent!==m)pre.textContent=m;return m};
const yes=await ask(orderIn?'Вы уверены?':'Отправить сводку?',`<p style="margin:0 0 10px;color:var(--mu)">Проверьте сообщение. Если что-то не так — вернитесь и исправьте.</p><pre class="msg">${esc(build())}</pre><div class="small live">🔄 Данные обновляются онлайн, пока окно открыто</div>`,'Да, копировать','Нет, вернуться');LIVE.msg=null;ORDCUR=null;$('#cx').hidden=true;if(!yes)return;const message=build();
if(!await clip(message)){snd.warn();toast('Не удалось скопировать. Разрешите доступ к буферу');return}
const tl=message.length>4000?`Скопировано (${message.length} симв.). Telegram режет сообщения длиннее 4096 символов`:'';
if(orderIn){o.copied=true;upsert(o);L.draft=blank(L.draft.cook);saveL();$('#dr').close();rAll();snd.ok();vib([60,40,60]);toast(tl?'✓ '+tl:'✓ Скопировано и сохранено в истории')}
else{try{$('#dr').close()}catch(e){}snd.ok();vib([60,40]);toast(tl?'✓ '+tl:'✓ Сводка скопирована')}};
const copyOrder=async()=>{if(SNDK)return;SNDK=1;try{await copyOrder0()}finally{SNDK=0}};
const saveOrder=()=>{if(!valid())return;const o=snap();upsert(o);L.draft.editId=o.id;saveL();snd.ok();toast('✓ Сохранено для всех. Можно редактировать')};
const open=id=>{rRev();$(id).showModal()};
const need=()=>{snd.warn();if(isObs()){toast('Это может только руководитель');return}toast('Нужен вход в админ-панель');ACT.admin()};
const rep=id=>{const p=prods().find(x=>x.id===id),r=document.querySelector(`[data-r="${cssEsc(id)}"]`);if(p&&r)r.outerHTML=row(p);rBar();if(dialogOpen('#dr'))rRev()};
const ui=()=>{rObs();rFil();rCats();rList();rAdm();rShifts();rGseg();if(tab==='sched')rSched();if(tab==='writeoff')rWriteoff();if(tab==='recv')rRecv()};
const afterLogin=()=>{ensureTeamColors();try{bkNag()}catch(e){}if(L.hold&&L.hold.length){L.out.push(...L.hold.splice(0));saveL();flush()}ui();if(want){const w=want;want='';if(w==='sedit'){ACT.tab('sched');se=1;rSched()}else ACT.tab(w)}else{rTeam();rAdm();rDs();try{rTg()}catch(e){errAdd(e&&e.message,'rTg')}$('#dt').showModal();ctLoad()}};
const authErr=m=>/TOO_MANY/.test(m)?'Google временно ограничил вход. Подождите и повторите':/CREDENTIAL_TOO_OLD/.test(m)?'Войдите заново и повторите':'Неверный пароль';
const ACT={
async tgref(){toast('Обновляю…');ctLoad(true)},
tgev(id){if(!isAdmin())return need();if(!TGEV.some(x=>x[0]===id))return;const n=CT.n||(CT.n={}),cf=n.cfg||(n.cfg={}),nv=cf[id]===0?1:0;cf[id]=nv;rTg();snd.tap();api('PUT','notify/cfg/'+id,nv).catch(()=>{cf[id]=nv?0:1;rTg();snd.warn();toast('Не удалось сохранить')})},
async tgcopy(){const l=tgLink('join');if(l&&await clip(l)){snd.ok();toast('✓ Ссылка скопирована')}},
async tgsend(){if(!isAdmin())return need();const t=($('#tgmsg').value||'').trim();if(!t){snd.warn();toast('Напишите текст');return}if(await tgOut('group',t))$('#tgmsg').value=''},
async tgtest(){if(!isAdmin())return need();await tgOut('group','✅ Тест: бот ВИАЙПИ работает')},
async tgunlink(id){if(!isAdmin())return need();if(!/^\d{1,20}$/.test(id||''))return;const v=((CT.c||{}).chats||{})[id];if(!await ask('Отвязать Telegram?',`<p>${esc(v&&v.n||'Аккаунт')}${v&&v.u?' (@'+esc(v.u)+')':''} перестанет получать личные сообщения от бота. Человек сможет подключиться заново.</p>`,'Да, отвязать','Нет'))return;try{await api('DELETE','contacts/chats/'+id);if(CT.c&&CT.c.chats)delete CT.c.chats[id];rTg();snd.ok()}catch(e){snd.warn();toast('Не удалось отвязать')}},
async tgclr(){if(!isAdmin())return need();if(!await ask('Очистить сообщения?','<p>Все сохранённые сообщения от поваров будут удалены.</p>','Да, очистить','Нет'))return;try{await api('DELETE','contacts/inbox');if(CT.c)delete CT.c.inbox;rTg();snd.ok()}catch(e){snd.warn();toast('Не удалось очистить')}},
async lvdel(k){if(!/^[\w-]{1,40}$/.test(k||'')||k===DEV)return;const x=LVO.find(z=>z.k===k);if(!await ask('Убрать запись?',`<p>${esc(x?liveName(x):'Кто-то')} · ${x?x.items.length:0} поз. ${x?'('+esc(liveAgo(x.t))+')':''}. Если человек всё ещё набирает заказ, запись появится снова.</p>`,'Да, убрать','Нет'))return;try{await api('DELETE','meta/live/'+k);if(DATA.meta&&DATA.meta.live)delete DATA.meta.live[k];liveCheck();rLive();snd.ok()}catch(e){snd.warn();toast('Не удалось убрать. Проверьте интернет')}},
whopick(id){const k=team().find(x=>x.id===id);if(!k)return;L.me=k;if(!cnt()||!L.draft.cook)L.draft.cook=k;saveL();whoDone();$('#dwho').close();snd.ok();vib(25);rCooks();rPCooks();rShifts();if(tab==='sched')rSched();toast('Здравствуйте, '+k.n+' 👋')},
whoskip(){whoDone();$('#dwho').close();snd.tap()},
syncnow(){retryAt=0;failures=0;tokFail=0;if(L.hold&&L.hold.length)L.out.push(...L.hold.splice(0));saveL();snd.tap();toast('Отправляю…');flush();setSt()},
loginrole(id){const o=id==='obs';document.querySelectorAll('#dar button').forEach(b=>b.classList.toggle('on',b.dataset.id===(o?'obs':'adm')));{const u=$('#au');if(u)u.value=o?VIEWER:CFG.adminEmail}{const hh=$('#dah');if(hh)hh.textContent=o?'Вход для наблюдателя':'Вход для руководителя'}snd.tap()},
async login0(){const pw=$('#ap').value,role=(($('#dar .on')||{}).dataset||{}).id==='obs'?'obs':'adm',em=role==='obs'?VIEWER:CFG.adminEmail;if(DEMO){AU.ok=true;ROLE='adm';$('#da').close();afterLogin();toast('Демо-режим: облако не настроено');return}
if(!pw){snd.warn();toast('Введите пароль');return}
try{const r=await fetchFast('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw,returnSecureToken:true})});const j=await r.json();
if(!r.ok){snd.warn();vib(120);toast(authErr(j.error&&j.error.message||''));return}
AU={t:j.idToken,rt:j.refreshToken,exp:Date.now()+j.expiresIn*1000,ok:true};roleSet(AU.t);LS.set('vip3-rt',AU.rt);LS.set('vip3-was',ROLE);credStore(em,pw);persistAsk();epSync();$('#ap').value='';$('#da').close();snd.ok();
if(ROLE==='obs'){edit=0;ui();obsTick(true);toast('✓ Вход: наблюдатель')}else{afterLogin();apLoad(true)}}catch{snd.warn();toast('Нет интернета')}},
async setpw(){const v=$('#npw').value;if(v.length<6){snd.warn();toast('Пароль — минимум 6 символов');return}if(DEMO){toast('В демо-режиме пароля нет');return}
try{const t=await tok();const r=await fetchFast('https://identitytoolkit.googleapis.com/v1/accounts:update?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:t,password:v,returnSecureToken:true})});const j=await r.json();
if(!r.ok){snd.warn();toast(authErr(j.error&&j.error.message||''));return}
AU={t:j.idToken,rt:j.refreshToken,exp:Date.now()+j.expiresIn*1000,ok:true};roleSet(AU.t);LS.set('vip3-rt',AU.rt);$('#npw').value='';snd.ok();toast('✓ Пароль изменён')}catch{snd.warn();toast('Не удалось. Проверьте сеть')}},
logout(){const cr=isAdmin()&&!DEMO&&DB?{t:AU.t,rt:AU.rt,exp:AU.exp}:null;AU={t:'',rt:'',exp:0,ok:false};if(cr)epBump(cr);LS.set('vip3-rt','');LS.set('vip3-was','');ROLE='adm';LS.set('vip3-role','adm');edit=0;AP.g=[];AP.n=0;AP.mx=-1;$('#dt').close();$('#dobs').close();ui();rAp();snd.tap()},
admin(){snd.tap();$('#dh').close();want='';if(isAdmin()){rTeam();rAdm();rDs();rAp();apLoad(true);try{rTg()}catch(e){errAdd(e&&e.message,'rTg')}document.querySelectorAll('#dt details.adm').forEach(x=>{x.open=x.id==='adA'?AP.n>0:(x.id==='adT'&&!AP.n)});$('#dt').showModal();$('#dt').scrollTop=0;ctLoad()}else{if(isObs()){rObs();snd.tap();$('#dobs').showModal();return}$('#ap').value='';ACT.loginrole(LS.get('vip3-was','')==='obs'?'obs':'adm');$('#da').showModal();$('#ap').focus()}},
toggled(){edit=!edit;ui();snd.tap()},
unhide(){if(!isAdmin())return need();mut('DELETE','catalog/hidden');snd.ok()},
tab(id){if(id==='plan')id='prep';const was=tab;if(id==='prep'||id==='writeoff')carryAll();if((was==='cab'||was==='sched')&&id!=='cab'&&id!=='sched'&&(ses||cabPick))cabLogout(false);tab=id;snd.tap();try{presSoon()}catch(e){}if(id==='order'){try{liveCheck();rLive()}catch(e){}}
[['order','#vOrder'],['prep','#vPrep'],['sched','#vSched'],['cab','#vCab'],['writeoff','#vWriteoff'],['recv','#vRecv']].forEach(([k,s])=>{const e=$(s);e.hidden=id!==k;if(id===k&&was!==k){e.classList.remove('vin');void e.offsetWidth;e.classList.add('vin')}});
$('#bar').hidden=id!=='order';const navId=id==='cab'?'sched':id;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.id===navId));rGseg();requestAnimationFrame(placeInd);
if(id==='order'){rShifts();refreshRoster();try{rBack()}catch(e){console.error('rBack',e)}}if(id==='prep'){rPrep();rPlan();rLibrary();rBqAlert()}if(id==='sched')rSched();if(id==='cab'){rCab();loadIn()}if(id==='writeoff')rWriteoff();if(id==='recv')rRecv();streams()},
add(id){const p=prods().find(x=>x.id===id);if(!p)return;L.draft.items[id]={id,n:p.n,c:p.c,u:L.lu[id]||p.u,qty:1};saveL();snd.add();vib(20);rep(id)},
shhide(){if(!isAdmin())return need();const tom=dAdd(1),on=!hrsHid(tom);if(on)mut('PUT','shifts/_hide/'+tom,{t:Date.now()});else mut('DELETE','shifts/_hide/'+tom);Object.keys(((DATA.shifts||{})._hide)||{}).forEach(d=>{if(d<dAdd(0))mut('DELETE','shifts/_hide/'+d)});snd.tap();vib(on?30:15);toast(on?'🔒 Часы скрыты от всех поваров':'👁 Часы показаны всем поварам');rShifts()},
rcgoorder(){ACT.tab('order');const b=$('#rcback');if(b&&!b.hidden){b.open=true;setTimeout(()=>{try{b.scrollIntoView({block:'start',behavior:'smooth'})}catch{}},80)}},
rcbadd(k){const g=rcBackList().find(x=>x.k===k);if(!g)return;if(rcbPut(g)===false)return;saveL();snd.add();vib(20);rep(g.it.id)},
rcball(){const gs=rcBackList().filter(g=>!rcbIn(g));let n=0;for(const g of gs)if(rcbPut(g)!==false)n++;if(!n)return;saveL();snd.add();vib(25);rList();rBar();if(dialogOpen('#dr'))rRev();toast('↩ Добавлено в заказ: '+n)},
urg(id){const i=L.draft.items[id];if(i){const on=!i.urg;if(on)i.urg=1;else delete i.urg;saveL();if(on){snd.warn();vib(35)}else{snd.tap();vib(15)}rep(id);return}const p=prods().find(x=>x.id===id);if(!p)return;L.draft.items[id]={id,n:p.n,c:p.c,u:L.lu[id]||p.u,qty:1,urg:1};saveL();snd.warn();vib(35);rep(id)},
inc(id){const i=L.draft.items[id];if(i){i.qty=Math.round((i.qty+1)*100)/100;saveL();snd.tap();rep(id)}},
dec(id){const i=L.draft.items[id];if(!i)return;i.qty=Math.round((i.qty-1)*100)/100;if(i.qty<=0){delete L.draft.items[id];snd.warn()}else snd.tap();saveL();rep(id)},
rm(id){delete L.draft.items[id];saveL();snd.warn();rep(id)},
pick(id){const k=team().find(x=>x.id===id);L.draft.cook=k;L.me=k;saveL();snd.add();rCooks();rPCooks();rShifts()},
me(id){L.me=team().find(x=>x.id===id);saveL();snd.add();rPCooks();rShifts()},
cat(id){cat=id;snd.tap();rCats();rList()},
wocat(id){wcat=id;snd.tap();rWoCats();rWoProducts()},
woopen(id){const p=prods().find(x=>x.id===id);if(!p)return;if(woDraft&&woDraft.product.id===id){woDraft=null;keepAt(woSel(id),rWoProducts);return}const units=LS.get('vip3-wo-units',{});woDraft={product:p,id:'',created:0,qty:'1',unit:units[id]||p.u||'шт',reason:LS.get('vip3-wo-reason','spoiled_v2'),note:'',byId:L.me&&team().some(k=>k.id===L.me.id)?L.me.id:''};keepAt(woSel(id),rWoProducts);if(!touchy())requestAnimationFrame(()=>$('#woQty')?.focus({preventScroll:true}))},
woedit(id){const e=(((DATA.writeoffs||{})[wd])||{})[id];if(!e)return;const current=prods().find(x=>x.id===e.pid),p={...(current||{id:e.pid||id,n:e.name||'Товар из старого каталога',u:e.unit||''}),c:e.c||current&&current.c||'',n:e.name||current&&current.n||'Товар из старого каталога',u:e.unit||current&&current.u||''};wcat=cats().some(c=>c.id===p.c)?p.c:'all';wq='';$('#woq').value='';woDraft={product:p,id,created:e.created||0,qty:String(e.qty||1),unit:e.unit||p.u||'шт',reason:e.reason||'spoiled_v2',note:e.note||'',byId:e.by&&e.by.id||''};rWoCats();rWoProducts();requestAnimationFrame(()=>{const row=document.querySelector('.wo-product.editing');row&&row.scrollIntoView({block:'center',behavior:'smooth'});if(!touchy())$('#woQty')?.focus({preventScroll:true})})},
wocancel(){const id=woDraft&&woDraft.product.id;woDraft=null;if(id!=null)keepAt(woSel(id),rWoProducts);else rWoProducts();snd.tap()},
wosave(){if(!woDraft||!woDraft.product)return;const qty=fq($('#woQty').value),reason=$('[data-woreason]').value,note=$('[data-wovalue="note"]').value.trim(),unit=$('[data-wounit]').value,kid=$('[data-woby]').value;if(!qty){snd.warn();toast('Укажите количество больше нуля');$('#woQty').focus();return}if(!unit){snd.warn();toast('Выберите единицу измерения');$('[data-wounit]').focus();return}if(!WO_REASONS.some(x=>x[0]===reason)&&!(woDraft.id&&reason==='spoiled')){snd.warn();toast('Выберите причину списания');$('[data-woreason]').focus();return}if(reason==='other'&&!note){snd.warn();toast('Опишите причину списания в комментарии');$('[data-wovalue="note"]').focus();return}const p=woDraft.product,k=team().find(x=>x.id===kid),id=woDraft.id||uid(),now=Date.now(),units=LS.get('vip3-wo-units',{});units[p.id]=unit;LS.set('vip3-wo-units',units);LS.set('vip3-wo-reason',reason);mut('PUT',`writeoffs/${wd}/${id}`,{pid:p.id,c:p.c||'',name:p.n,qty,unit,reason,note,by:k?{id:k.id,n:k.n}:null,created:woDraft.created||now,updated:now});woDraft=null;snd.ok();toast('✓ Списание сохранено');keepAt(woSel(p.id),()=>{rWoLog();rWoProducts()})},
async wocopy(){const rows=woRows(wd);if(!rows.length){snd.warn();toast('За этот день нет списаний для копирования');return}if(await clip(writeoffMessage(wd,rows))){snd.ok();toast('✓ Списание скопировано')}else{snd.warn();toast('Не удалось скопировать списание')}},
async woshare(){const rows=woRows(wd);if(!rows.length){snd.warn();toast('За этот день нет списаний для отправки');return}const text=writeoffMessage(wd,rows);if(typeof navigator.share!=='function')return ACT.wocopy();try{await navigator.share({title:`Списание за ${day(wd)}`,text});snd.ok();toast('✓ Списание отправлено')}catch(e){if(e&&e.name==='AbortError')return;if(await clip(text)){snd.ok();toast('Не удалось отправить — списание скопировано')}else{snd.warn();toast('Не удалось отправить или скопировать списание')}}},
async wodel(id){const e=(((DATA.writeoffs||{})[wd])||{})[id];if(!e||!await ask('Удалить запись о списании?',`<p>${esc(e.name)} — ${esc(fmtQ(e.qty))} ${esc(e.unit||'')}</p>`,'Да, удалить','Нет'))return;mut('DELETE',`writeoffs/${wd}/${id}`);snd.warn();toast('Запись удалена');rWoLog()},
review(){snd.tap();open('#dr');streams()},close(){snd.tap();document.querySelectorAll('dialog[open]').forEach(d=>d.close())},
copy:copyOrder,sendopen:copyOrder,save:saveOrder,
async clear(){if(!cnt())return;if(await ask('Очистить список?','<p>Все выбранные товары будут убраны из текущего заказа.</p>','Да, очистить','Нет, оставить')){L.draft=blank(L.draft.cook);saveL();rAll();rRev();snd.warn()}},
hist(){snd.tap();rHist();$('#dh').showModal();streams()},
addcook(){if(!isAdmin())return need();const n=$('#tn').value.trim(),r=$('#tr').value.trim(),u=$('#tu').value.trim().replace(/^@+/,'').replace(/\s+/g,'');if(!n||!r){snd.warn();toast('Укажите имя и должность');return}if(team().some(k=>k.n.trim().toLowerCase()===n.toLowerCase())){snd.warn();toast('Такой повар уже добавлен');return}const id=uid(),used=team().map(k=>PALETTE.includes(k.color)?k.color:hashColor(k.id)),color=PALETTE.find(c=>!used.includes(c))||hashColor(id);mut('PUT','team/'+id,Object.assign({n,r,color},u?{u}:{}));$('#tn').value=$('#tr').value=$('#tu').value='';snd.ok();$('#tn').focus();rTeam()},
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
pday(value){pd=value==='today'?dAdd(0):/^\d{4}-\d{2}-\d{2}$/.test(String(value))?String(value):dAdd(+value);savePd();streams();rPrep();rPlan();snd.tap()},
ptpin(){const pinned=!!(DATA.prepPins||{})[pd];mut(pinned?'DELETE':'PUT','prepPins/'+pd,pinned?undefined:true);snd.tap();toast(pinned?'День откреплён':'День подготовки закреплён');rPrep();rSched()},
ppick(dt){if(!(DATA.prepPins||{})[dt])return;pd=dt;savePd();streams();rPrep();rPlan();snd.tap()},
ptog(id){const t=((DATA.prep||{})[pd]||{})[id];if(!t)return;const p=`prep/${pd}/${id}`;
if(t.done){mut('PATCH',p,{done:null,at:null});snd.tap();return}
const w=t.by||L.me;if(!w){snd.warn();vib(80);toast('Выберите повара справа или вверху «Я работаю»');const s=document.querySelector(`[data-by="${id}"]`);if(s){s.classList.add('bad');setTimeout(()=>s.classList.remove('bad'),1500)}return}
justDone.add(id);mut('PATCH',p,{done:true,by:{id:w.id,n:w.n},at:Date.now(),...(t.dq?{dq:null,dqa:null,dqb:null}:{})});rememberPrep(t,w);snd.ok();vib(30)},
async pdel(id){const t=((DATA.prep||{})[pd]||{})[id];if(!t||!await ask('Удалить заготовку?',`<p>${esc(t.t)}</p>`,'Да, удалить','Нет'))return;pxMark(id,t);mut('DELETE',`prep/${pd}/${id}`);snd.warn()},
async pcopy(){const prev=dAdd(-1,pd);let src=(DATA.prep||{})[prev],pm=(DATA.prepMeta||{})[prev];
if(!DEMO&&(!src||(psec==='banq'&&!pm))){try{[src,pm]=await Promise.all([src||jget('prep/'+prev),pm||jget('prepMeta/'+prev)])}catch{toast('Нет сети');return}}
const es=Object.entries(src||{}).sort((a,b)=>(a[1].c||0)-(b[1].c||0)).filter(e=>e[1]&&e[1].t&&inSec(e[1].g));if(!es.length){snd.warn();toast('За вчера списка нет');return}
const m=dm(),tg=o=>o==='0'?'c'+prev.replace(/-/g,''):o,have=(((DATA.prepMeta||{})[pd])||{}).b||{},need=new Set(es.filter(e=>e[1].g==='banq'&&!m[e[0]]).map(e=>bqOf(e[1])));let n=0;
if(need.size){const pl=bqCalc(pm,src);need.forEach(o=>{const id=tg(o);if(have[id])return;const b=pl.find(x=>x.id===o),v={o:b&&b.o||Date.now()};['title','guests','time','place','note'].forEach(k=>{if(b&&b[k])v[k]=b[k]});mut('PUT',`prepMeta/${pd}/b/${id}`,v)})}
es.forEach(([k,t],i)=>{if(m[k])return;mut('PUT',`prep/${pd}/${k}`,{t:t.t,q:t.q||'',g:t.g||'main',k:t.k||'other',...(t.ks?{ks:t.ks}:{}),...(t.pg?{pg:t.pg,pu:t.pu}:{}),...(t.lid?{lid:t.lid}:{}),...(t.g==='banq'?{bq:tg(bqOf(t)),...(okTm(t.sv)?{sv:t.sv}:{})}:{}),c:Date.now()+i});n++});snd.ok();toast('✓ Скопировано: '+n)},
// график работы
sfil(id){sf=id;L.sf=id;ssel.clear();saveL();snd.tap();rSched()},
shday(dt){if(!DRE.test(dt||''))return;const adm=isAdmin();let sn;
if(adm){if(!pc)return;sn=snapFor(pc,true)}else{if(!ses||!acctData)return;sn=mergeSn(acctData,acctData)}
if(!adm&&(sn.ex||{})[dt]){snd.warn();vib(60);toast('🔒 Эту смену исправил шеф — изменить её может только он');return}
const cur=Number((sn.days||{})[dt])||0,pv=Object.keys(sn.days||{}).filter(d=>d<dt).sort(),def=cur||Number(sn.dh)||(pv.length?Number(sn.days[pv[pv.length-1]]):0)||10;
shd={dt,adm,ex:cur>0,rate:rateOn(sn,dt),cu:sn.c||'₽'};
$('#dsht').textContent=fmtLong(dt);$('#dshs').textContent=cur>0?'Смена записана. Можно исправить часы или удалить смену.':'Сколько часов вы отработали в этот день?';
$('#dshh').value=fmtH(def);$('#dshq').innerHTML=[...new Set([8,10,12,14,16,Number(sn.dh)||0].filter(x=>x>0))].sort((x,y)=>x-y).map(v=>`<button type="button" class="chip" data-a="shset" data-id="${v}">${fmtH(v)} ч</button>`).join('');
$('#dshd').hidden=!(cur>0);$('#dshp').textContent=cur>0?'Сохранить':'Записать смену';shPrev();snd.tap();$('#dsh').showModal()},
shstep(n){if(!shd)return;const v=Number(String($('#dshh').value).replace(',','.'))||0;$('#dshh').value=fmtH(Math.min(24,Math.max(0,Math.round((v+ +n)*100)/100)));snd.tap();shPrev()},
shset(n){if(!shd)return;$('#dshh').value=fmtH(+n);snd.tap();shPrev()},
shsave(){if(!shd)return;const raw=String($('#dshh').value||'').trim().replace(',','.'),h=Number(raw);if(raw===''||!(h>0)||h>24){snd.warn();vib(60);toast('Часы: от 0,5 до 24');return}
const v=Math.round(h*100)/100,{dt,adm}=shd;$('#dsh').close();
if(adm){if(!isAdmin()||!pc)return need();mut('PATCH','payroll/'+pc+'/hours',{[dt]:v});publishAcct(pc);snd.ok();toast('✓ Смена записана · '+fmtH(v)+' ч');rPayAdm(true)}
else cabOpt('in',dt,{h:v,t:Date.now()},'✓ Смена записана · '+fmtH(v)+' ч')},
shdel(){if(!shd||!shd.ex)return;const {dt,adm}=shd;$('#dsh').close();
if(adm){if(!isAdmin()||!pc)return need();const p=PAYROLL()[pc]||{},S=(DATA.sched||{})[pc]||{},fromSched=isWork(S[dt])&&Number(p.dh)>0,hasIn=!!((((DATA.acctU||{})[pc]||{}).in||{})[dt]);
mut('PATCH','payroll/'+pc+'/hours',{[dt]:fromSched?0:null});if(hasIn)delUser(pc,'in',dt);publishAcct(pc);snd.warn();toast('Смена удалена');rPayAdm(true)}
else{const chiefHas=Number(((acctData||{}).days||{})[dt])>0;cabOpt('in',dt,chiefHas?{h:0,t:Date.now()}:null,'Смена удалена')}},
rtmonth(){const[y,m]=sm.split('-').map(Number);setDp($('#rtd'),`${y}-${P2(m)}-01`);setDp($('#rte'),`${y}-${P2(m)}-${P2(new Date(y,m,0).getDate())}`);snd.tap()},
rtopen(){setDp($('#rte'),'');snd.tap()},
shseen(){const k=team(),me=L.me&&k.find(x=>x.id===L.me.id);if(!me){snd.warn();vib(60);toast('Сначала выберите своё имя');return}
const tom=dAdd(1),sh=shiftsFor(tom).map;if(sh[me.id]===undefined){snd.warn();toast('Завтра вас нет в списке смены');return}if(hrsHid(tom)&&!isAdmin()){snd.warn();toast('🔒 Время смены пока скрыто — шеф объявит его позже');rShifts();return}
mut('PUT',`plan/seen/${tom}/${me.id}`,{t:Date.now(),v:sh[me.id]||''});
if(!seenClean){seenClean=1;Object.keys(((DATA.plan||{}).seen)||{}).forEach(d=>{if(d<dAdd(0))mut('DELETE','plan/seen/'+d)})}
snd.ok();vib(40);toast('✓ Отмечено: вы увидели свою смену');rShifts()},
bqlset(id){if(!isAdmin())return need();const v=+id;if(!(v>=1&&v<=3))return;snd.ok();mut('PUT','plan/cfg/bql',v);toast('🎉 Банкеты показываются за '+v+' '+rupl(v,['день','дня','дней'])+' до события')},
bqopen(id){const[d,b]=String(id).split('|');if(!RXD.test(d||''))return;pd=d;savePd();psec='banq';LS.set('vip3-psec','banq');bqSelect(b);bqt='prep';LS.set('vip3-bqt','prep');streams();snd.tap();rPrep();rPlan();rLibrary();window.scrollTo({top:0,behavior:'smooth'})},
bqgo(id){ACT.tab('prep');ACT.bqopen(id)},
psrv(id){const t=((DATA.prep||{})[pd]||{})[id];if(!t||t.g!=='banq')return;
if(!canServe()){snd.warn();vib(80);toast('Подачу отмечает шеф. Войдите в админ-панель');return}
const p=`prep/${pd}/${id}`;
if(t.sd){mut('PATCH',p,{sd:null,sa:null,sb:null});snd.tap();toast('Отметка «Подано» снята');return}
const w=L.me;justSrv.add(id);mut('PATCH',p,{sd:true,sa:Date.now(),sb:w?{id:w.id,n:w.n}:null});snd.ok();vib(30)},
async psrvall(){if(!canServe()){snd.warn();toast('Подачу отмечает шеф. Войдите в админ-панель');return}
const m=dm(),ids=Object.keys(m).filter(id=>{const t=m[id];return t&&t.t&&t.g==='banq'&&inBq(t)&&isPrepd(t)&&!isSv(t)});if(!ids.length)return;
if(!await ask('Подать всё готовое?',`<p>Отметить как поданные: ${ids.length} блюд, которые повара уже приготовили.</p>`,'Да, подано','Нет'))return;
const now=Date.now(),w=L.me;ids.forEach((id,i)=>{if(((DATA.prep||{})[pd]||{})[id]&&isPrepd(((DATA.prep||{})[pd]||{})[id])){justSrv.add(id);mut('PATCH',`prep/${pd}/${id}`,{sd:true,sa:now+i,sb:w?{id:w.id,n:w.n}:null})}});snd.ok();vib(30)},
theme(){snd.tap();applyTheme();$('#dth').showModal()},
setth(id){if(!THEMES[id])return;TH=id;LS.set('vip3-theme',id);applyTheme();snd.tap();$('#dth').close();toast('Тема: '+THEMES[id][1])},
rcopen(id){if(!ords().some(o=>o.id===id)){snd.warn();toast('Заказ не найден');return}rcOid=id;rcDraft=null;rcF='all';rcReset();snd.tap();rRecv();window.scrollTo({top:0,behavior:'instant'})},
rcback(){rcOid='';rcDraft=null;rcReset();snd.tap();rRecv();window.scrollTo({top:0,behavior:'instant'})},
rcflt(id){rcF=id;rcDraft=null;rcOpen='';snd.tap();rRecv()},
rctog(n){const l=rcIx.r[n];if(!l)return;if(rcDraft&&rcDraft.iid===l.iid)return;rcDraft=null;rcOpen=rcOpen===l.iid?'':l.iid;snd.tap();const o=rcCur();if(!o)return;keepAt(rcSel(l.iid),rRecv)},
rccat(id){const o=rcCur();if(!o)return;rcCat=id;snd.tap();const ls=rcLines(o);$('#rcchips').innerHTML=rcChipsHtml(ls);$('#rcmain').innerHTML=rcListRows(o,ls);const sb=$('#rcsb'),r=$('#rcmain').getBoundingClientRect(),h=(sb&&sb.offsetHeight)||0;if(r.top<h)window.scrollTo({top:Math.max(0,scrollY+r.top-h-4),behavior:'instant'})},
rcfull(n){const o=rcCur(),l=rcIx.r[n];if(!o||!l||!(l.rem>0))return;rcAdd(o,l,l.rem,l.it.u,'');rcTouch(o);snd.add();vib(20);rcRefresh(l.iid)},
rcnew(n){const o=rcCur(),l=rcIx.r[n];if(!o||!l)return;rcDraft={oid:o.id,iid:l.iid,eid:'',qty:String(l.rem>0?l.rem:1).replace('.',','),unit:l.it.u,nt:''};rcOpen=l.iid;snd.tap();keepAt(rcSel(l.iid),rRecv);if(!touchy()){const q=$('#rcQty');if(q){q.focus();q.select()}}},
rcedit(k){const o=rcCur(),x=rcIx.e[k];if(!o||!x)return;const{l,e}=x;rcDraft={oid:o.id,iid:l.iid,eid:e.id,qty:fmtQ(Number(e.q)),unit:e.u,nt:e.nt||''};rcOpen=l.iid;snd.tap();keepAt(rcSel(l.iid),rRecv);if(!touchy()){const q=$('#rcQty');if(q){q.focus();q.select()}}},
rcinc(){const q=$('#rcQty'),u=$('[data-rcunit]');if(!q||!rcDraft)return;const v=r3(rcNum(q.value)+stepOf(u?u.value:rcDraft.unit));q.value=fmtQ(v);rcDraft.qty=q.value;snd.tap()},
rcdec(){const q=$('#rcQty'),u=$('[data-rcunit]');if(!q||!rcDraft)return;const v=r3(rcNum(q.value)-stepOf(u?u.value:rcDraft.unit));if(v<=0){snd.warn();return}q.value=fmtQ(v);rcDraft.qty=q.value;snd.tap()},
rcsave(){const o=rcCur();if(!o||!rcDraft)return;const q=$('#rcQty'),qty=rcNum(q?q.value:rcDraft.qty),u=$('[data-rcunit]'),unit=u?u.value:rcDraft.unit,nt=(($('[data-rcv="nt"]')||{}).value||rcDraft.nt||'').trim();
if(!qty){snd.warn();toast('Укажите количество больше нуля');if(q)q.focus();return}if(!unit){snd.warn();toast('Выберите единицу');return}
const d=rcDraft,l=rcLines(o).find(x=>x.iid===d.iid);if(!l){rcDraft=null;rRecv();return}rcAdd(o,l,qty,unit,nt,d.eid);rcTouch(o);rcDraft=null;rcOpen='';snd.add();vib(20);toast('✓ Записано: '+l.it.n+' — '+rcQ(qty,unit));rcRefresh(l.iid)},
rccancel(){const iid=rcDraft&&rcDraft.iid;rcDraft=null;rcOpen='';snd.tap();rcRefresh(iid)},
xnew(){const o=rcCur();if(!o)return;xeD={eid:'',c:''};rcXFill('','', '','шт','');snd.tap();$('#dxe').showModal()},
rcxedit(n){const o=rcCur(),l=rcIx.r[n];if(!o||!l||!l.ex)return;const e=l.es[0]||{};xeD={eid:l.eid,c:l.it.c||''};rcXFill(l.it.n,l.eid,fmtQ(Number(e.q)||1),l.it.u,e.nt||'');snd.tap();$('#dxe').showModal()},
xpick(id){const p=prods().find(x=>x.id===id);if(!p||!xeD)return;$('#dxn').value=p.n;xeD.c=p.c||'';const u=$('#dxu');if(![...u.options].some(o=>o.value===p.u)){const op=document.createElement('option');op.textContent=p.u;u.appendChild(op)}u.value=p.u;rcXSug();snd.tap();const q=$('#dxq');if(q&&!touchy())q.focus()},
xinc(){const q=$('#dxq'),u=$('#dxu');if(!q)return;q.value=fmtQ(r3(rcNum(q.value)+stepOf(u?u.value:'шт')));snd.tap()},
xdec(){const q=$('#dxq'),u=$('#dxu');if(!q)return;const v=r3(rcNum(q.value)-stepOf(u?u.value:'шт'));if(v<=0){snd.warn();return}q.value=fmtQ(v);snd.tap()},
xsave(){const o=rcCur();if(!o||!xeD)return;const n=$('#dxn').value.trim().replace(/\s+/g,' '),q=rcNum($('#dxq').value),u=$('#dxu').value,nt=$('#dxt').value.trim();
if(!n){snd.warn();toast('Напишите название товара');$('#dxn').focus();return}if(!q){snd.warn();toast('Укажите количество больше нуля');$('#dxq').focus();return}
const dup=!xeD.eid&&o.items.find(i=>rcFold(i.n)===rcFold(n));if(dup){snd.warn();toast('«'+dup.n+'» уже есть в этом заказе — отметьте приёмку в списке');return}
let c=xeD.c||'';const m=prods().find(p=>rcFold(p.n)===rcFold(n));if(m)c=m.c||c;
const old=xeD.eid&&(rcRec(o.id).extra||{})[xeD.eid],id=xeD.eid||uid(),me=meObj();
mut('PUT',`receipts/${o.id}/extra/${id}`,{n,u,q,...(c?{c}:{}),...(nt?{nt}:{}),at:old&&old.at?old.at:Date.now(),...(old&&old.by?{by:old.by}:me?{by:me}:{}),...(old?{upd:Date.now()}:{})});
rcTouch(o);xeD=null;$('#dxe').close();rcOpen='ex_'+id;snd.add();vib(20);toast('➕ Сверх заказа: '+n+' — '+rcQ(q,u));rRecv()},
async xdel(){const o=rcCur();if(!o||!xeD||!xeD.eid)return;const id=xeD.eid,nm=$('#dxn').value.trim();if(!await ask('Удалить позицию?',`<p style="margin:0"><b>${esc(nm)}</b><br>Строка будет удалена из приёмки и из листа.</p>`,'Да, удалить','Нет, вернуться'))return;
mut('DELETE',`receipts/${o.id}/extra/${id}`);rcTouch(o);xeD=null;$('#dxe').close();rcOpen='';snd.tap();rRecv()},
async rcxdel(n){const o=rcCur(),l=rcIx.r[n];if(!o||!l||!l.ex)return;if(!await ask('Удалить позицию?',`<p style="margin:0"><b>${esc(l.it.n)}</b> — ${esc(rcGot(l))}<br>Строка будет удалена из приёмки и из листа.</p>`,'Да, удалить','Нет, вернуться'))return;
mut('DELETE',`receipts/${o.id}/extra/${l.eid}`);rcTouch(o);rcOpen='';snd.tap();rcRefresh(l.iid)},
async rcentdel(k){const o=rcCur(),x=rcIx.e[k];if(!o||!x)return;const{l,e}=x;if(!await ask('Удалить запись?',`<p style="margin:0"><b>${esc(l.it.n)}</b><br>${esc(rcQ(Number(e.q),e.u))} — запись будет удалена, количество вернётся в «осталось».</p>`,'Да, удалить','Нет, вернуться'))return;
mut('DELETE',`receipts/${o.id}/rows/${l.iid}/e/${e.id}`);rcTouch(o);if(rcDraft&&rcDraft.eid===e.id)rcDraft=null;snd.tap();rcRefresh(l.iid)},
async rcdel(){const o=rcCur();if(!o||!rcDraft||!rcDraft.eid)return;const d=rcDraft;if(!await ask('Удалить запись?',`<p style="margin:0">Запись о приёмке будет удалена, количество вернётся в «осталось».</p>`,'Да, удалить','Нет, вернуться'))return;if(!rcDraft||rcDraft.eid!==d.eid)return;mut('DELETE',`receipts/${o.id}/rows/${d.iid}/e/${d.eid}`);rcTouch(o);rcDraft=null;rcOpen='';snd.tap();rcRefresh(d.iid)},
async rcxx(n){const o=rcCur(),l=rcIx.r[n];if(!o||!l)return;const p=`receipts/${o.id}/rows/${l.iid}`;if(l.x){mut('PATCH',p,{x:null,xn:null,xat:null,...(rcCarr(o.id,l.iid)?{nc:true}:{})});rcTouch(o);rcOpen='';snd.tap();rcRefresh(l.iid);return}
if(!await ask('Остаток не привезут?',`<p style="margin:0"><b>${esc(l.it.n)}</b><br>Осталось: ${esc(rcQ(l.rem,l.it.u))}. Позиция уйдёт из списка «Не привезли».</p>`,'Да, не привезут','Нет, вернуться'))return;
const me=meObj();mut('PATCH',p,{x:true,xn:'Остаток не привезут',xat:Date.now(),...(me?{xby:me}:{})});rcTouch(o);rcOpen='';snd.tap();rcRefresh(l.iid)},
async rcall(){const o=rcCur();if(!o)return;const op=rcLines(o).filter(l=>l.rem>0&&!l.x);if(!op.length)return;if(!await ask('Всё привезли?',`<p style="margin:0">Будет записано, что ${op.length} ${ruCount(op.length,'позиция','позиции','позиций')} привезли полностью — как заказано.</p>`,'Да, всё привезли','Нет, вернуться'))return;const cur=rcCur();if(!cur||cur.id!==o.id)return;
rcLines(o).filter(l=>l.rem>0&&!l.x).forEach(l=>rcAdd(o,l,l.rem,l.it.u,''));rcTouch(o);rcDraft=null;snd.ok();vib([40,30,40]);toast('✓ Всё принято');rcStable(rRecv)},
async rcclose(){const o=rcCur();if(!o)return;const op=rcLines(o).filter(l=>l.rem>0&&!l.x);if(!op.length)return;if(!await ask('Остальное не привезут?',`<p style="margin:0">${op.length} ${ruCount(op.length,'позиция','позиции','позиций')} будут закрыты как «не будет» и уйдут из списка «Не привезли».</p>`,'Да, закрыть','Нет, вернуться'))return;const me=meObj(),now=Date.now();
rcLines(o).filter(l=>l.rem>0&&!l.x).forEach(l=>mut('PATCH',`receipts/${o.id}/rows/${l.iid}`,{x:true,xn:'Остаток не привезут',xat:now,...(me?{xby:me}:{})}));rcTouch(o);rcDraft=null;snd.tap();rcStable(rRecv)},
rcsheet(){const o=rcCur();if(!o)return;const m=rcModel(o);$('#drsb').innerHTML=(m.s.open?`<div class="rc-warn">⚠️ Не отмечено как привезённое: ${m.s.open} ${ruCount(m.s.open,'позиция','позиции','позиций')}. В листе они указаны как «Не привезли» / «Частично».</div>`:'')+rcSheetHtml(o);const b=$('#rcsend');if(b)b.hidden=!navigator.share;snd.tap();$('#drs').showModal()},
async rcpdf(){const o=rcCur();if(!o)return;const b=$('[data-a="rcpdf"]');if(b)b.disabled=true;toast('Готовлю PDF…');try{await new Promise(r=>setTimeout(r,30));const blob=rcPdf(rcModel(o)),r=await sendFile(blob,rcFile(o,'pdf'),'Приёмка товара '+dlong(o.date));if(r==='download')toast('✓ PDF сохранён в загрузки');else if(r==='shared')snd.ok()}catch(e){console.error('rcpdf',e&&e.stack||e);snd.warn();toast('Не удалось создать PDF')}finally{if(b)b.disabled=false}},
async rccsv(){const o=rcCur();if(!o)return;try{const r=await sendFile(new Blob([rcCsv(o)],{type:'text/csv;charset=utf-8'}),rcFile(o,'csv'),'Приёмка товара '+dlong(o.date));if(r==='download')toast('✓ Файл для Excel сохранён')}catch{snd.warn();toast('Не удалось создать файл')}},
async rctext(){const o=rcCur();if(!o)return;if(await clip(rcText(o))){snd.ok();toast('✓ Скопировано')}else{snd.warn();toast('Не удалось скопировать')}},
async rcsend(){const o=rcCur();if(!o||!navigator.share)return;try{await navigator.share({title:'Приёмка товара '+dlong(o.date),text:rcText(o)})}catch(e){if(!e||e.name!=='AbortError'){snd.warn();toast('Не удалось отправить. Нажмите «Копировать»')}}},
async rcoutcopy(){const out=rcOut();if(!out.length)return;const t=['⚠️ Не привезли',''];out.forEach(g=>{t.push(`Заказ на ${dlong(g.o.date)} (${g.o.cook.n}, оформлен ${dshort(g.o.created)}):`);g.ls.forEach(l=>t.push(`• ${l.it.n} — осталось ${rcQ(l.need,l.it.u)} (из ${fmtQ(l.qty)})`));t.push('')});if(await clip(t.join('\n').trim())){snd.ok();toast('✓ Список скопирован')}else{snd.warn();toast('Не удалось скопировать')}},
rcgo(id){const d=$('#dh');if(d&&d.open)d.close();ACT.tab('recv');ACT.rcopen(id)},
smon(n){const[y,m]=sm.split('-').map(Number);sm=iso(new Date(y,m-1+(+n),1,12)).slice(0,7);snd.tap();if(tab==='cab'&&isAdmin())rPayAdm(true);else rSched()},
sedit(){if(!isAdmin()){want='sedit';snd.tap();$('#ap').value='';$('#da').showModal();$('#ap').focus();return}se=!se;ssel.clear();snd.tap();rSched()},
sday(dt){if(!(se&&isAdmin()&&sf!=='all'))return;ssel.has(dt)?ssel.delete(dt):ssel.add(dt);snd.tap();rSched()},
sapply(){if(!isAdmin())return need();if(sf==='all'){snd.warn();toast('Сначала выберите повара');return}if(!ssel.size){snd.warn();toast('Выберите дни в календаре');return}
const n=ssel.size;ssel.forEach(dt=>mut('PUT',`sched/${sf}/${dt}`,{r:'Р',work:true}));publishAcct(sf);ssel.clear();snd.ok();toast('✓ Рабочие дни отмечены: '+n);rSched()},
sclear(){if(!isAdmin())return need();if(sf==='all'||!ssel.size){snd.warn();toast('Выберите повара и дни');return}const n=ssel.size;ssel.forEach(dt=>mut('DELETE',`sched/${sf}/${dt}`));publishAcct(sf);ssel.clear();snd.warn();toast('Смены убраны: '+n);rSched()},
// диагностика
diag(){snd.tap();rDiag();$('#dd').showModal()},
async backup(){if(!isAdmin()){toast('Копия — только для руководителя');return}
const b=$('[data-a=backup]');if(b&&b.dataset.busy)return;if(b){b.dataset.busy='1';b.disabled=true}toast('Готовлю копию…');
try{const out={},bad=[];for(const n of BK_NODES){try{out[n]=await jget(n,'',true)}catch(e){bad.push(n+(e&&e.status?' ('+e.status+')':''))}}
const keys=Object.values(out.payroll||{}).map(p=>p&&p.key).filter(k=>typeof k==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(k));
out.acct={};for(const k of keys){try{const v=await jget('acct/'+k,'',true);if(v)out.acct[k]=v}catch(e){bad.push('acct')}}
if(bad.includes('payroll (auth)')||!out.team){toast('Не удалось прочитать данные. Войдите как руководитель заново');return}
const txt=JSON.stringify({app:'vip-restobar',ver:VER,at:new Date().toISOString(),notread:bad,data:out}),d=new Date(),p2=n=>String(n).padStart(2,'0'),nm=`vip-backup-${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}.json`;
const r=await sendFile(new Blob([txt],{type:'application/json'}),nm,'Резервная копия ВИАЙПИ');
if(r==='shared'||r==='download'){LS.set('vip3-lastbk',Date.now());api('PUT','plan/cfg/bk',Date.now()).catch(()=>{});toast('✓ Копия сохранена · '+(txt.length/1048576).toFixed(2)+' МБ'+(bad.length?' · не прочитано: '+bad.length:''));rBk()}else if(r==='cancel')toast('Отменено')}
catch(e){toast('Не удалось сделать копию. Проверьте связь')}finally{if(b){delete b.dataset.busy;b.disabled=false}}},
async errshow(){snd.tap();const x=$('#errbox');x.hidden=false;x.textContent='Загрузка…';const mine=Object.fromEntries(ERRS.map((e,i)=>['l'+i,e]));let d={},note='';try{d=(await jget('errlog'))||{}}catch(e){note='\n\n⚠ Журнал других телефонов не прочитан. Если правила Firebase ещё не обновлены (новый узел errlog), опубликуйте firebase-rules.json.'}d[DEV]=mine;x.textContent=errFmt(d)+note},
async errcopy(){snd.tap();const x=$('#errbox');const t=x.hidden?errFmt({[DEV]:Object.fromEntries(ERRS.map((e,i)=>[i,e]))}):x.textContent;toast(await clip(t)?'✓ Скопировано':'Не удалось скопировать')},
async errclear(){if(!isAdmin()){toast('Только для руководителя');return}if(!await ask('Очистить журнал ошибок?','<p>Будут удалены записи ошибок со всех телефонов. Данные приложения не затрагиваются.</p>','Очистить'))return;try{await api('DELETE','errlog');ERRS=[];LS.set(ERRK,[]);$('#errbox').textContent='Ошибок нет 👍';rBk();toast('Журнал очищен')}catch(e){toast('Не удалось очистить журнал')}},

async dtest(){const out=[],log=s=>{out.push(s);$('#dlog').textContent=out.join('\n')};if(DEMO){log('Демо-режим: config.js не заполнен');return}
if(!DB){await detect();log('Поиск базы: '+(DB||'не найдена'));if(!DB)return}log('База: '+DB);
try{const r=await fetchFast(DB+'/.json?shallow=true',{},5000);log('Чтение: HTTP '+r.status)}catch(e){log('Чтение: нет связи')}
const u=`${DB}/prep/_ping/${DEV}.json`;try{const r=await fetchFast(u,{method:'PUT',body:JSON.stringify({t:Date.now()})},5000);log('Запись: HTTP '+r.status);const g=await fetchFast(u,{},5000);log('Проверка записи: HTTP '+g.status);await fetchFast(u,{method:'DELETE'},5000)}catch(e){log('Запись: нет связи')}
log('Живая связь: '+(ST.open.meta&&!metaBroken?'мгновенная ✓':metaBroken?'опрос (правила)':'опрос'));log('Если оба кода 200 — всё работает.')},
dre(){snd.tap();Object.keys(ES).forEach(k=>ES[k].close());for(const k in MV)delete MV[k];metaBroken=0;ST.err='';setSt();detect(true).then(()=>{streams();flush();setSt();setTimeout(rDiag,2000)})},
async dclr(){if(!await ask('Сбросить кэш?','<p>Очистятся временные данные этого телефона и приложение перезагрузится. Данные в облаке не затрагиваются.</p>','Да, сбросить','Нет'))return;try{LS.set('vip3-cache',{});LS.set('vip3-db','');LS.set('vip3-dbv',null)}catch{}if(window.__vipHeal)window.__vipHeal('manual');else location.reload()},
// добавление заготовок (простой режим)

cuser(id){if(!isAdmin())return need();const k=team().find(x=>x.id===id);if(!k)return;$('#uu').value=k.u||'';$('#du').dataset.id=id;$('#utitle').textContent='Username: '+k.n;snd.tap();$('#du').showModal();$('#uu').focus()},
usave(){if(!isAdmin())return need();const id=$('#du').dataset.id,k=team().find(x=>x.id===id),u=$('#uu').value.trim().replace(/^@+/,'').replace(/\s+/g,'');if(!k)return;if(k.virtual)mut('PUT','team/'+id,{n:k.n,r:k.r,color:cookColor(id),u});else mut('PATCH','team/'+id,{u:u||null});$('#du').close();snd.ok();toast(u?'✓ @'+u+' сохранён':'Username убран');rTeam();rShifts()},
sfton(id){if(!isAdmin())return need();const tom=dAdd(1);if(shiftsFor(tom).map[id]!==undefined){setShift(id,'');snd.tap();return}const inp=document.querySelector(`[data-sft="${cssEsc(id)}"]`),v=(inp&&normTm(inp.value))||L.at||'14:00';L.at=v;saveL();setShift(id,v);snd.add()},
woinc(){if(!woDraft)return;const v=Math.round(((fq(woDraft.qty)||0)+1)*100)/100;woDraft.qty=String(v);$('#woQty').value=fmtQ(v);snd.tap()},
wodec(){if(!woDraft)return;const v=Math.round(((fq(woDraft.qty)||1)-1)*100)/100;if(v<=0){snd.warn();return}woDraft.qty=String(v);$('#woQty').value=fmtQ(v);snd.tap()},
qban(){qb=qb?0:1;snd.tap();rPlan()},
qpick(key){const p=String(key).split(':'),kind=p.shift(),id=p.join(':'),i=kind==='lib'?libItems().find(x=>x.id===id):planItems().find(x=>x.id===id);if(!i)return;addFromLib(i,kind==='lib'?id:'')},
tkopen(id,isNew){const t=dm()[id];if(!t)return;tk={id,mode:t.pg?'g':'n',kt:0};const lib=libItems().find(x=>nt(x.t)===nt(t.t));
$('#tkh').textContent=isNew?'Сколько приготовить?':'Заготовка';$('#tkn').value=t.t;$('#tkb').checked=t.g==='banq';$('#tksv').value=okTm(t.sv)?t.sv:'';$('#tksvb').hidden=t.g!=='banq';{const bl=bqList(pd),cu=bqCur();$('#tkbq').innerHTML=bl.map(b=>`<option value="${esc(b.id)}">${esc(bqName(b,bl))}${b.time?' · '+esc(b.time):''}</option>`).join('');$('#tkbq').value=t.g==='banq'?bqOf(t):(cu&&!cu.all?cu.id:(bl[0]||{}).id||'');$('#tkbqb').hidden=!(t.g==='banq'&&bl.length>1)}$('#tkc').innerHTML=pcats().map(c=>`<option value="${esc(c[0])}"${c[0]===pk(t)?' selected':''}>${esc(c[1])} ${esc(c[2])}</option>`).join('');
const m=String(t.q||'').match(/^\s*(\d+(?:[.,]\d+)?)\s*(.*)$/),u=PU.indexOf(((m&&m[2])||'').trim())>=0?m[2].trim():LS.get('vip3-tk-unit','порц');
$('#tku').innerHTML=PU.map(x=>`<option${x===u?' selected':''}>${x}</option>`).join('');$('#tkq').value=m?m[1]:'';
$('#tkgu').innerHTML=PU.map(x=>`<option${x===(t.pu||'порц')?' selected':''}>${x}</option>`).join('');$('#tkk').value=t.pg?fmtQ(t.pg):'1';$('#tkgst').value=guestsFor(t,pd)||'';
let h='';if(lib&&lib.pg)h=`<button class="chip qp" data-a="tkhint" data-id="g">👥 как раньше: ${esc(fmtQ(lib.pg))} ${esc(lib.pu||'')} на гостя</button>`;else if(lib&&lib.q)h=`<button class="chip qp" data-a="tkhint" data-id="n">как раньше: ${esc(lib.q)}</button>`;
if(guestsFor(t,pd)>0&&!t.pg)h+=`<button class="chip qp" data-a="tkguest">👥 Как число гостей (${guestsFor(t,pd)})</button>`;$('#tkhint').innerHTML=h;{const ks=t.ks||(lib&&lib.ks)||'';$('#tkcs').textContent=ks==='auto'?'✨ Определено автоматически — измените, если не так':ks==='?'?'❓ Не удалось определить — выберите категорию':''}tkMode(tk.mode);snd.tap();$('#dtk').showModal();setTimeout(()=>{(tk.mode==='n'?$('#tkq'):$('#tkgst')).focus()},60)},

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
paypw(id){if(!isAdmin())return need();const k=team().find(x=>x.id===id);if(!k)return;$('#pwh').textContent='Пароль: '+k.n;$('#pwv').value='';$('#dpw').dataset.id=id;$('#pwdel').hidden=!(PAYROLL()[id]&&PAYROLL()[id].key);snd.tap();$('#dpw').showModal();setTimeout(()=>$('#pwv').focus(),60)},
async pwsave(){if(!isAdmin())return need();const id=$('#dpw').dataset.id,pw=$('#pwv').value.trim();if(pw.length<6){snd.warn();toast('Пароль — минимум 6 символов');return}if(!(window.crypto&&crypto.subtle)){toast('Браузер не поддерживает защищённый вход');return}
const key=await acctKey(id,pw),old=(PAYROLL()[id]||{}).key;if(old&&old!==key){let u=null;try{u=await jget('acct/'+old)}catch(e){}if(u)['in','rt','pm'].forEach(s=>{if(u[s])mut('PUT','acct/'+key+'/'+s,u[s])});mut('DELETE','acct/'+old)}mut('PATCH','payroll/'+id,{key});mut('PATCH','team/'+id,{pw:1});publishAcct(id);$('#dpw').close();snd.ok();toast('✓ Пароль установлен. Сообщите его повару');rPayAdm(true)},
async pwdel(){if(!isAdmin())return need();const id=$('#dpw').dataset.id,old=(PAYROLL()[id]||{}).key;if(old){let u=null;try{u=await jget('acct/'+old)}catch(e){toast('Нет связи — кабинет не отключён');return}u=u||{};
Object.entries(u.in||{}).forEach(([d,v])=>{if(v&&Number(v.h)>=0&&!(((PAYROLL()[id]||{}).hours||{})[d]!==undefined))mut('PATCH',`payroll/${id}/hours`,{[d]:Number(v.h)})});
Object.entries(u.rt||{}).forEach(([r,v])=>{if(v&&DRE.test(v.f||''))mut('PUT',`payroll/${id}/rates/${r}`,{f:v.f,r:Number(v.r)||0,t:v.t||0})});
Object.entries(u.pm||{}).forEach(([r,v])=>{if(v&&Number(v.a)>0)mut('PUT',`payroll/${id}/pay/${r}`,{d:v.d,a:Number(v.a),t:v.t||'oth',m:v.m||String(v.d).slice(0,7),n:(v.n||'')+' (записал повар)'})});
mut('DELETE','acct/'+old)}mut('PATCH','payroll/'+id,{key:null});mut('PATCH','team/'+id,{pw:null});$('#dpw').close();snd.warn();toast('Кабинет повара отключён. Всё, что он записал, сохранено у вас');if(DATA.acctU)delete DATA.acctU[id];rPayAdm(true)},
phadd(){if(!isAdmin()||!pc)return need();const d=$('#phd').value,h=Number(String($('#phh').value).replace(',','.'));if(!d||!(h>0)){snd.warn();toast('Укажите дату и часы');return}mut('PATCH','payroll/'+pc+'/hours',{[d]:h});publishAcct(pc);$('#phh').value='';snd.ok();rPayAdm(true)},
payadd(){if(!isAdmin()||!pc)return need();const d=$('#pyd').value,a=Number(String($('#pya').value).replace(',','.')),t=$('#pyt').value,n=$('#pyn').value.trim();if(!d||!(a>0)){snd.warn();toast('Укажите дату и сумму');return}
const m=t==='sal'?prevM(d.slice(0,7)):d.slice(0,7);mut('PUT',`payroll/${pc}/pay/${uid()}`,{d,a:Math.round(a*100)/100,t,m,n});publishAcct(pc);$('#pya').value=$('#pyn').value='';snd.ok();toast('✓ Выплата записана');rPayAdm(true)},
fineadd(){if(!isAdmin()||!pc)return need();const d=($('#fnd')||{}).value,raw=String(($('#fna')||{}).value||'').trim().replace(',','.'),a=Number(raw),n=String(($('#fnn')||{}).value||'').trim().replace(/\s+/g,' ').slice(0,60);if(!DRE.test(d||'')||raw===''||!(a>0)||a>10000000){snd.warn();toast('Укажите дату и сумму штрафа');return}mut('PUT',`payroll/${pc}/fines/${uid()}`,{d,a:Math.round(a*100)/100,n,t:Date.now()});publishAcct(pc);snd.warn();toast('✓ Штраф записан: −'+mny(a,CUR()));rPayAdm(true)},
async finedel(id){if(!isAdmin()||!pc)return need();const v=((PAYROLL()[pc]||{}).fines||{})[id];if(!v||!await ask('Удалить штраф?',`<p>${esc(day(v.d))} · −${esc(mny(v.a,CUR()))}${v.n?' · '+esc(v.n):''}</p><p class="small">Сумма вернётся в начисления повара.</p>`,'Да, удалить','Нет'))return;mut('DELETE',`payroll/${pc}/fines/${id}`);publishAcct(pc);snd.warn();rPayAdm(true)},
async paydel(id){if(!isAdmin()||!pc)return need();const v=snapFor(pc,true).pay[id];if(!v||!await ask('Удалить выплату?',`<p>${esc(day(v.d))} · ${esc(mny(v.a,CUR()))}${v.u==='c'?' (записал повар)':''}</p>`,'Да, удалить','Нет'))return;if(id.slice(0,2)==='c_')delUser(pc,'pm',id.slice(2));else{mut('DELETE',`payroll/${pc}/pay/${id}`);publishAcct(pc)}snd.warn();rPayAdm(true)},
rateadd(){if(!isAdmin()||!pc)return need();const f=$('#rtd').value,e=(($('#rte')||{}).value)||'',raw=String($('#rtr').value||'').trim().replace(',','.'),r=Number(raw);if(!DRE.test(f||'')||raw===''||!(r>=0)||r>100000){snd.warn();toast('Укажите дату «с» и ставку');return}
if(e&&(!DRE.test(e)||e<f)){snd.warn();vib(60);toast('Дата «по» не может быть раньше даты «с»');return}
mut('PUT',`payroll/${pc}/rates/${uid()}`,{f,r:Math.round(r*100)/100,t:Date.now(),...(e?{e}:{})});publishAcct(pc);$('#rtr').value='';setDp($('#rte'),'');snd.ok();toast('✓ Ставка записана · '+rngText(f,e));rPayAdm(true)},
async ratedel(id){if(!isAdmin()||!pc)return need();const x=(snapFor(pc,true).rs||[]).find(v=>v.id===id);if(!x||!await ask('Удалить ставку?',`<p>с ${esc(day(x.f))} — ${esc(mny(x.r,CUR()))} / час${x.u==='c'?' (записал повар)':''}</p>`,'Да, удалить','Нет'))return;if(id.slice(0,2)==='c_')delUser(pc,'rt',id.slice(2));else{mut('DELETE',`payroll/${pc}/rates/${id}`);publishAcct(pc)}snd.warn();rPayAdm(true)},
lfil(id){lf=id;snd.tap();rPlan();rLibrary()},
tkinc(){const v=Math.round(((fq($('#tkq').value)||0)+1)*100)/100;$('#tkq').value=fmtQ(v);snd.tap()},
tkdec(){const v=Math.round(((fq($('#tkq').value)||1)-1)*100)/100;if(v>0)$('#tkq').value=fmtQ(v);snd.tap()},
tkset(v){$('#tkq').value=v;if(tk&&tk.mode!=='n')tkMode('n');snd.tap()},
tkguest(){if(!tk)return;$('#tkk').value='1';$('#tkgst').value=guestsFor(dm()[tk.id],pd)||'';$('#tkgu').value='порц';tkMode('g');snd.tap()},
clchk(i){if(!CL)return;CL.st[i]=CL.st[i]?0:1;CL.draw();CL.st[i]?snd.tap():snd.warn()},
clgo(){if(!CL)return;const S=CL;if(!SELK.some(([k])=>S.sel[k])){snd.warn();toast('Отметьте, что отправить');return}if(S.sel.close&&S.st.some(x=>!x)){snd.warn();toast('Отметьте все пункты закрытия');return}if(S.sel.close&&!(S.o.cook&&S.o.cook.id)){snd.warn();toast('Выберите повара — кто проверил кухню');return}const r=S.res,sel={...S.sel};CL=null;$('#dcl').onclose=null;$('#dcl').close();r(sel)},
sdt(k){if(!CL||!SELK.some(x=>x[0]===k))return;if(k!=='close'&&!CL.av[k].n)return;CL.sel[k]=CL.sel[k]?0:1;LS.set('vip3-sel',{d:dAdd(0),s:CL.sel});CL.draw();CL.sel[k]?snd.tap():snd.warn()},
async sdcook(){if(!CL)return;const id=($('#sdck')||{}).value,k=team().find(x=>x.id===id),S=CL;if(!k)return;if(needPw(id)&&!await idAsk(id)){S.draw();return}if(CL!==S)return;L.draft.cook=k;L.me=k;saveL();S.o.cook=k;rCooks();rPCooks();S.draw()},
clno(){if(!CL)return;const r=CL.res;CL=null;$('#dcl').onclose=null;$('#dcl').close();r(false)},
tkmode(m){if(tk){tkMode(m);snd.tap()}},
tkhint(kind){if(!tk)return;const t=dm()[tk.id],lib=t&&libItems().find(x=>nt(x.t)===nt(t.t));if(!lib)return;if(kind==='g'){$('#tkk').value=fmtQ(lib.pg);$('#tkgu').value=lib.pu||'порц';tkMode('g')}else{const m=String(lib.q||'').match(/^\s*(\d+(?:[.,]\d+)?)\s*(.*)$/);if(m){$('#tkq').value=m[1];if(PU.indexOf(m[2].trim())>=0)$('#tku').value=m[2].trim()}tkMode('n')}snd.tap()},
tksave(){if(!tk)return;const id=tk.id;if(!dm()[id])return;const t=$('#tkn').value.trim().replace(/\s+/g,' ');if(!t){snd.warn();toast('Введите название');return}{const rs=$('#tksv').value.trim();if($('#tkb').checked&&rs&&!normTm(rs)){snd.warn();toast('Время подачи, например 19:30');return}}const g=$('#tkb').checked?'banq':'main',k=$('#tkc').value||'other',ks=tk.kt?'user':(dm()[id].ks||'auto'),bid=g==='banq'?bqPick():null;let patch;
if(tk.mode==='g'){const gs=Math.round(Number(String($('#tkgst').value).replace(',','.')))||0,k=fq($('#tkk').value);if(!k){snd.warn();toast('Сколько на одного гостя?');return}{const cg=g==='banq'?((bqFind(pd,bid)||{}).guests||0):guestsOf(pd);if(gs>0&&gs!==cg)mut('PUT',g==='banq'?`${bqP(pd,bid)}/guests`:`prepMeta/${pd}/guests`,gs)}patch={t,g,k:$('#tkc').value||'other',ks,q:null,pg:k,pu:$('#tkgu').value}}
else{const n=fq($('#tkq').value),u=$('#tku').value;LS.set('vip3-tk-unit',u);patch={t,g,k,ks,q:n?`${fmtQ(n)} ${u}`:'',pg:null,pu:null}}
{const sv=normTm($('#tksv').value);patch.sv=g==='banq'&&sv?sv:null;patch.bq=g==='banq'&&bid&&bid!=='0'?bid:null}mut('PATCH',`prep/${pd}/${id}`,patch);libTouch(patch);$('#dtk').close();snd.ok()},
async tkdel(){const id=tk&&tk.id;if(!id)return;await ACT.pdel(id);if(!dm()[id])$('#dtk').close()},
gstedit(){$('#gsn').value=guestsOf(pd)||'';snd.tap();$('#dgs').showModal();setTimeout(()=>$('#gsn').focus(),60)},
gstsave(){const n=Math.round(Number(String($('#gsn').value).replace(',','.')))||0;if(n>0)mut('PUT',`prepMeta/${pd}/guests`,n);else mut('DELETE',`prepMeta/${pd}/guests`);$('#dgs').close();snd.ok();rPrep()},
wodone(id){const e=((DATA.writeoffs||{})[wd]||{})[id];if(!e)return;mut('PATCH',`writeoffs/${wd}/${id}`,e.done?{done:null,doneAt:null}:{done:true,doneAt:Date.now()});snd.ok()},
qgrp(id){qg=id;snd.tap();rPlan()},
qnewg(){snd.tap();$('#qgn').value='';$('#dq').showModal();$('#qgn').focus()},
qaddg(){const n=$('#qgn').value.trim();if(!n){snd.warn();toast('Введите название группы');return}if(pgroups().some(g=>nt(g.n)===nt(n))){snd.warn();toast('Такая группа уже есть');return}const k='q'+uid();mut('PUT','plan/groups/'+k,{n});qg=k;$('#dq').close();snd.ok();rPlan()},
async qdelg(){const g=pgroups().find(x=>x.id===qg);if(!g||g.id==='main'||g.id==='banq')return;const its=planItems().filter(i=>(i.g||'main')===g.id);if(!await ask('Удалить группу?',`<p>«${esc(g.n)}»${its.length?` и заготовок в ней: ${its.length}`:''} будут удалены.</p>`,'Да, удалить','Нет'))return;its.forEach(i=>mut('DELETE','plan/items/'+i.id));mut('DELETE','plan/groups/'+g.id);qg='main';snd.warn();rPlan()},
qadd(){const t=$('#qt').value.trim().replace(/\s+/g,' '),qn=$('#qq').value.trim(),qu=($('#qu')||{}).value||'',q=qn&&qu&&/^\d+(?:[.,]\d+)?$/.test(qn)?qn+' '+qu:qn;if(!t){snd.warn();toast('Напишите, что приготовить');$('#qt').focus();return}
const g=psec==='banq'?'banq':'main',cu=g==='banq'?bqCur():null,bid=g==='banq'?(cu&&!cu.all?cu.id:''):null;if(g==='banq'&&!bid){snd.warn();toast('Сначала выберите банкет');return}if(Object.values(dm()).some(x=>nt(x.t)===nt(t)&&((x.g==='banq')===(g==='banq'))&&(g!=='banq'||bqOf(x)===bid))){snd.warn();toast(g==='banq'?'Эта заготовка уже есть в этом банкете':'Эта заготовка уже есть на этот день');return}
const old=libFind(t,g),cl=classify(t),ctx=curK();let k,ks;
if(old&&old.ks==='user'&&old.k&&old.k!=='other'){k=old.k;ks='user'}else if(cl.k!=='other'){k=cl.k;ks='auto'}else if(ctx!=='other'){k=ctx;ks='ctx'}else{k='other';ks='?'}
mut('PUT',`prep/${pd}/${uid()}`,{t,q,g,k,ks,...(bid&&bid!=='0'?{bq:bid}:{}),c:Date.now()});mut('PUT','prepLibrary/'+(old?old.id:libId(t,g)),{t,q,g,k,ks,by:old&&old.by?old.by:null,usedAt:Date.now()});$('#qt').value=$('#qq').value='';snd.add();toast(ks==='?'?'✓ Добавлено · выберите категорию (❓)':'✓ Добавлено · '+pcIcon(k)+' '+(catById(k)||[0,0,''])[2]);$('#qt').focus()},
dpopen(id){const el=$('#'+id);if(el)openDp(el)},
dpmon(n){if(!dpk)return;let m=dpk.m+(+n),y=dpk.y;while(m<1){m+=12;y--}while(m>12){m-=12;y++}dpk.y=y;dpk.m=m;snd.tap();rDpk()},
dppick(v){if(!dpk||!RXD.test(String(v)))return;const el=dpk.el;dpk=null;$('#dpk').close();setDp(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));snd.tap()},
dpq(n){ACT.dppick(dAdd(+n))},
dsset(id){if(!isAdmin())return need();const v=+id;if(!(Number.isInteger(v)&&v>=0&&v<=8))return;snd.ok();mut('PUT','plan/cfg/ds',v);toast(v===0?'🌅 Новый день начинается в полночь':'🌅 Новый день начинается в '+String(v).padStart(2,'0')+':00')},
psec(id){psec=id==='banq'?'banq':'main';LS.set('vip3-psec',psec);lf='all';snd.tap();rPrep();rPlan();rLibrary()},
bqtcopy(){const pool=bqPool(),sel=bqSel(pool),M=bqMerge(sel);if(!M.length){snd.warn();toast('Выберите банкеты с заготовками');return}const gs=bqGuests(sel),L2=['🎉 Итого блюд по банкетам',...sel.map(x=>`• ${bqName(x.b,x.l)} — ${day(x.d)}${x.b.time?', '+x.b.time:''}${x.b.guests?' · 👥 '+x.b.guests:''}`),'',...(gs?[`👥 Гостей всего: ${gs}`,'']:[])];M.forEach(e=>L2.push(`• ${e.name} — ${bqTotQ(e)||'кол-во не указано'}${e.by.length>1?` (${e.by.join(', ')})`:''}`));L2.push('',`Всего: ${M.length} ${rupl(M.length,['блюдо','блюда','блюд'])}`);clip(L2.join('\n')).then(ok=>{if(ok){snd.ok();toast('📋 Итог блюд скопирован')}else{snd.warn();toast('Не удалось скопировать')}})},
bqtpick(id){const k=String(id||'');if(!bqPool().some(x=>bqKey(x)===k))return;if(bsxx.has(k))bsxx.delete(k);else bsxx.add(k);bqSaveSel();snd.tap();vib(10);bqSelRefresh()},
bqtall(){bsxx=new Set();bqSaveSel();snd.tap();bqSelRefresh()},
bqumore(){bqUpMore=!bqUpMore;snd.tap();rBqUp()},
bqtread(){if(!bqSel(bqPool()).length){snd.warn();toast('Отметьте хотя бы один банкет');return}rBqDlg();snd.tap();$('#dbt').showModal()},
bqtnone(){bsxx=new Set(bqPool().map(bqKey));bqSaveSel();snd.tap();bqSelRefresh()},
bqsel(id){bqSelect(id);bqt='';LS.set('vip3-bqt','');snd.tap();rPrep();rPlan();rLibrary();requestAnimationFrame(()=>{try{const e=document.querySelector('#bqbar .on');e&&e.scrollIntoView({inline:'center',block:'nearest'})}catch{}})},
bqnew(){const id='b'+uid();mut('PUT',`prepMeta/${pd}/b/${id}`,{o:Date.now()});bqSelect(id);bqt='info';LS.set('vip3-bqt','info');snd.add();rPrep();setTimeout(()=>{try{$('#bqt').focus()}catch{}},60)},
async bqdel(){const c=bqCur();if(!c||c.all)return;const bl=bqList(pd),its=Object.entries(dm()).filter(([,t])=>t&&t.g==='banq'&&bqOf(t)===c.id);
if(!await ask('Удалить банкет?',`<p><b>${esc(bqName(c,bl))}</b></p><p style="color:var(--mu)">${its.length?'Будут удалены и заготовки банкета: '+its.length+'.':'Заготовок в нём нет.'}</p>`,'Да, удалить','Нет'))return;
its.forEach(([id])=>mut('DELETE',`prep/${pd}/${id}`));
if(c.id==='0')['title','time','place','note','guests'].forEach(k=>mut('DELETE',`prepMeta/${pd}/${k}`));else mut('DELETE',`prepMeta/${pd}/b/${c.id}`);
bqSelect('');bqt='';LS.set('vip3-bqt','');snd.warn();toast('Банкет удалён');rPrep()},
bqtab(id){bqt=id==='prep'?'prep':'info';LS.set('vip3-bqt',bqt);snd.tap();rBq()},
async bqsave(){const c0=bqCur();if(!c0||c0.all)return;if(!bqWrite()){snd.warn();toast('Время начала: например 18:00');try{$('#bqs').focus()}catch{}return}
const g=bqGuess($('#bqt').value),ak=c0.id+'|'+pd+'|'+g;
if(g&&g!==pd&&!bqAsked.has(ak)){bqAsked.add(ak);if(await ask('Перенести банкет на '+day(g)+'?',`<p>В названии указана дата <b>${esc(day(g))}</b>, а банкет сейчас записан на <b>${esc(day(pd))}</b>.</p>`,'Да, перенести','Нет, оставить здесь')){ACT.bqmove(g);bqt='prep';LS.set('vip3-bqt',bqt);rBq();return}}
bqt='prep';LS.set('vip3-bqt',bqt);snd.ok();toast('✓ Банкет сохранён · теперь заготовки');rBq();try{$('#bqtabs').scrollIntoView({block:'start'})}catch{}},
bqmove(date){const c=bqCur();date=String(date||'');if(!c||c.all||!RXD.test(date)||date===pd)return;const nid=bqMove(c.id,pd,date);if(!nid)return;pd=date;savePd();bqSelect(nid);streams();snd.ok();toast('📅 Банкет перенесён на '+day(pd));rPrep();rPlan();rBqAlert()},
svopen(id){const t=dm()[id];if(!t)return;svd={id};$('#svn').textContent=t.t;$('#svt').value=okTm(t.sv)?t.sv:'';$('#svq').innerHTML=svChips((bqFind(pd,bqOf(t))||{}).time);snd.tap();$('#dsv').showModal()},
svset(v){if(okTm(v)){$('#svt').value=v;snd.tap()}},
svsave(){if(!svd)return;const id=svd.id;if(!dm()[id]){$('#dsv').close();return}const raw=$('#svt').value.trim(),v=normTm(raw);if(raw&&!v){snd.warn();toast('Введите время, например 19:30');return}mut('PATCH',`prep/${pd}/${id}`,{sv:v||null});$('#dsv').close();snd.ok();if(v)toast('🕐 Подача в '+v)},
svclr(){if(!svd)return;const id=svd.id;if(dm()[id])mut('PATCH',`prep/${pd}/${id}`,{sv:null});$('#dsv').close();snd.tap()},
qone(){const t=$('#qt').value.trim().replace(/\s+/g,' '),q=$('#qq').value.trim();if(!t){snd.warn();toast('Напишите название заготовки');$('#qt').focus();return}mut('PUT',`prep/${pd}/${uid()}`,{t,q,g:qg,...bqTag(qg),c:Date.now()});$('#qt').value=$('#qq').value='';snd.add();toast('✓ Добавлено в подготовку на этот день')},
async qtog(id){const i=planItems().find(x=>x.id===id);if(!i)return;const t=dm()[id];
if(t){if(isPrepd(t)&&!await ask('Заготовка уже выполнена',`<p>${esc(t.t)} ${t.sd?'уже подана':'отмечена поваром'}. Убрать из дня?</p>`,'Да, убрать','Нет'))return;pxMark(id,t);mut('DELETE',`prep/${pd}/${id}`);snd.tap();return}
mut('PUT',`prep/${pd}/${id}`,{t:i.t,q:i.q||'',g:i.g||'main',...bqTag(i.g),lid:id,c:Date.now()});snd.add()},
qall(){const m=dm();let n=0;planItems().filter(i=>(i.g||'main')===qg&&!m[i.id]).forEach((i,k)=>{mut('PUT',`prep/${pd}/${i.id}`,{t:i.t,q:i.q||'',g:i.g||'main',...bqTag(i.g),lid:i.id,c:Date.now()+k});n++});if(n){snd.ok();toast('✓ Добавлено в день: '+n)}},
qnone(){const m=dm();let n=0;planItems().filter(i=>(i.g||'main')===qg&&m[i.id]&&!m[i.id].done).forEach(i=>{mut('DELETE',`prep/${pd}/${i.id}`);n++});if(n){snd.tap();toast('Убрано из дня: '+n+' (выполненные остаются)')}},
async qdel(id){const i=planItems().find(x=>x.id===id);if(!i||!await ask('Удалить из списка?',`<p>${esc(i.t)}</p><p style="color:var(--mu)">Из уже созданных дней она не удаляется.</p>`,'Да, удалить','Нет'))return;mut('DELETE','plan/items/'+id);snd.warn()},
libnew(){libraryDialog(null)},
libedit(id){const i=libItems().find(x=>x.id===id);if(i)libraryDialog(i)},
libsave(){const raw=$('#llt').value.trim().replace(/\s+/g,' '),q=$('#llq').value.trim().replace(/\s+/g,' '),g=$('#llg').value||'main',oldId=$('#dl').dataset.id||'';if(!raw){snd.warn();toast('Введите название заготовки');$('#llt').focus();return}const duplicate=libItems().find(i=>i.id!==oldId&&nt(i.t)===nt(raw));if(duplicate){snd.warn();toast('Такая заготовка уже есть в истории');return}const old=oldId?libItems().find(i=>i.id===oldId):null,id=oldId||libId(raw,g);const sel=($('#llc')||{}).value||'';let kk,kks;if(sel){kk=sel;kks=old&&old.k===sel&&old.ks?old.ks:'user'}else{const cl=classify(raw);kk=cl.k;kks=cl.ks}mut('PUT','prepLibrary/'+id,{t:raw,q,g,k:kk,ks:kks,...(old&&old.pg?{pg:old.pg,pu:old.pu}:{}),by:old&&old.by?old.by:null,usedAt:old&&old.usedAt||Date.now()});$('#dl').close();snd.ok();toast(old?'Изменения сохранены':'Заготовка добавлена в историю');rLibrary()},
async libdelete(id){const i=libItems().find(x=>x.id===id);if(!i||!await ask('Удалить заготовку из истории?',`<p>${esc(i.t)}</p><p style="color:var(--mu)">Записи в днях подготовки останутся без изменений.</p>`,'Да, удалить','Нет'))return;mut('DELETE','prepLibrary/'+id);snd.warn();toast('Удалено из истории')},
libadd(id){const i=libItems().find(x=>x.id===id);if(i)addFromLib(i,id)}
};
const rAll=()=>{rCooks();rPCooks();rCats();rList();rBar();rShifts();rBqAlert();rPrep();rPlan();rLibrary();rSched();if(tab==='writeoff')rWriteoff();if(tab==='recv')rRecv()};
on('#dh','close',streams);
document.addEventListener('click',e=>{const dpb=e.target.closest&&e.target.closest('[data-dp]');if(dpb&&!dpb.disabled)return openDp(dpb);const b=e.target.closest('[data-a]');if(b&&ACT[b.dataset.a]){if(e.target.closest('summary'))e.preventDefault();ACT[b.dataset.a](b.dataset.id)}else if(e.target.tagName==='DIALOG'&&!e.target.id.startsWith('dc'))e.target.close()});
document.addEventListener('input',e=>{const rv=e.target.dataset.rcv;if(rv&&rcDraft)rcDraft[rv]=e.target.value;const key=e.target.dataset.wovalue;if(key&&woDraft)woDraft[key]=e.target.value;if(e.target.id==='tkgst'||e.target.id==='tkk')tkRes();if(e.target.id==='dxn'){if(xeD)xeD.c='';rcXSug()}});
document.addEventListener('change',e=>{const t=e.target,d=t.dataset;
if(d.rcunit!==undefined){if(rcDraft)rcDraft.unit=t.value;return}
if(d.rccourier!==undefined){const o=rcCur();if(o){const v=t.value.trim().slice(0,40);mut('PATCH','receipts/'+o.id,{oid:o.id,date:o.date,updated:Date.now(),courier:v||null,...(rcRec(o.id).created?{}:{created:Date.now()})})}return}
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
else if(d.hr){if(!isAdmin())return;const nv=normTm(t.value);if(!nv){snd.warn();toast('Время, например 12:00');rHrs();return}t.value=nv;const o=$('#'+d.hr+'o').value,c=$('#'+d.hr+'c').value;if(okTm(o)&&okTm(c)){mut('PUT','plan/cfg/'+d.hr,o+'-'+c);snd.tap();rShifts()}}
else if(d.sft){if(!isAdmin())return;const nv=normTm(t.value);if(nv){t.value=nv;L.at=nv;saveL();setShift(d.sft,nv);snd.tap()}else if(t.value){snd.warn();toast('Время начала, например 14:00');t.value=L.at||'14:00'}}
else if(d.by){const k=team().find(x=>x.id===t.value);mut('PATCH',`prep/${pd}/${d.by}`,{by:k?{id:k.id,n:k.n}:null});snd.add()}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing&&e.target.dataset&&e.target.dataset.rcv!==undefined){e.preventDefault();ACT.rcsave()}else if(e.key==='Enter'&&e.target.id==='rcq'){e.preventDefault();e.target.blur()}});
document.addEventListener('focusout',()=>{if(!rcPend)return;setTimeout(()=>{if(rcPend&&!rcTyping())rcRender()},80)});
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.matches&&t.matches('details.pdn')){if(t.id==='pdns')pdnOpenS=t.open;else pdnOpen=t.open}if(t&&t.matches&&t.matches('details.rc-co'))rcCoOpen=t.open?1:0;if(t&&t.matches&&t.matches('details.rc-miss')){const k=t.dataset.oid;if(t.open)rcMissOpen.add(k);else rcMissOpen.delete(k)}},true);
let rf;on('#q','input',e=>{qs=e.target.value;cancelAnimationFrame(rf);rf=requestAnimationFrame(rList)});
let rcrf;on('#rcq','input',e=>{rcSearch=e.target.value;cancelAnimationFrame(rcrf);rcrf=requestAnimationFrame(()=>{const o=rcCur();if(o)$('#rcmain').innerHTML=rcListRows(o,rcLines(o))})});on('#rcq','focus',e=>{const t=e.target;setTimeout(()=>{try{t.select()}catch{}},0)});
let wrf;on('#woq','input',e=>{wq=e.target.value;cancelAnimationFrame(wrf);wrf=requestAnimationFrame(rWoProducts)});
on('#woDate','change',e=>{if(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)){wd=e.target.value;streams();rWriteoff()}});
on('#date','change',e=>{L.draft.date=e.target.value||dAdd(1);L.draft.man=L.draft.date!==dAdd(1);saveL();sumDn()});
on('#note','input',e=>{L.draft.note=e.target.value;saveL();sumDn();fitNote()});on('#dnbox','toggle',fitNote);
on('#hq','input',rHist);
on('#bqdt','change',e=>{if(RXD.test(e.target.value||''))ACT.bqmove(e.target.value)});
on('#bqinfo','change',e=>{if(e.target&&e.target.id==='bqdt')return;if(bqWrite())snd.tap();else{snd.warn();toast('Время начала: например 18:00')}});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.id==='dshh')shPrev();if(t&&t.dataset&&t.dataset.tm!==undefined){const f=tmTyping(t.value);if(f!==t.value)t.value=f;if(t.classList)t.classList.remove('bad')}});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.tm!==undefined){const n=normTm(t.value);if(n&&n!==t.value)t.value=n}});
on('#bqinfo','keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.tagName==='INPUT'){e.preventDefault();e.target.blur()}});
on('#tkb','change',e=>{$('#tksvb').hidden=!e.target.checked;$('#tkbqb').hidden=!(e.target.checked&&bqList(pd).length>1)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='cabpw')ACT.cablogin()});document.addEventListener('pointerdown',()=>{if(ses)cabTouch()});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(hideT);if(ses)hideT=setTimeout(()=>cabLogout(true),30000)}else clearTimeout(hideT)});
on('#pwv','keydown',e=>{if(e.key==='Enter')ACT.pwsave()});
setInterval(()=>{if(document.hidden)return;if(tab==='cab'&&ses&&!busyEdit())refreshAcct();if(tab==='cab'&&isAdmin())loadIn()},8000);on('#libq','input',rLibrary);on('#dbtb','toggle',e=>{if(e.target.classList&&e.target.classList.contains('bqt-fold'))bqFold=e.target.open},true);
const setPd=e=>{if(e.target.value){pd=e.target.value;savePd();streams();rPrep();rPlan()}};on('#pdate','change',setPd);
on('#qt','keydown',e=>{if(e.key==='Enter')ACT.qadd()});
on('#qq','keydown',e=>{if(e.key==='Enter')ACT.qadd()});
on('#qgn','keydown',e=>{if(e.key==='Enter')ACT.qaddg()});
on('#daf','submit',e=>{e.preventDefault();ACT.login()});on('#obcfg','input',()=>{AP.dirty=1});on('#obcfg','change',()=>{AP.dirty=1});
setInterval(()=>{try{if(document.hidden)return;if(isAdmin()){const mp=(DATA.meta||{}).proposals||0;if(mp!==AP.mp){AP.mp=mp;apLoad(true)}else apLoad()}else if(isObs())obsTick()}catch(e){errAdd(e&&e.message,'ap')}},4000);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();$('#q').focus()}});
addEventListener('online',()=>{retryAt=0;failures=0;ST.wk=Date.now();for(const k in RF)delete RF[k];if(!DBV)detect(true);streams();flush();refreshRoster();carryAll(true)});
// ---------- смена кухонного дня: точный таймер + проверка при любом «пробуждении» приложения ----------
const applyDs=()=>{const v=Number((((DATA.plan||{}).cfg)||{}).ds);if(Number.isInteger(v)&&v>=0&&v<=8&&v!==BDAY_H){BDAY_H=v;LS.set('vip3-ds',v);armDay();dayCheck();rShifts()}rDs()};
const rDs=()=>{document.querySelectorAll('#dsl button').forEach(b=>{const on=+b.dataset.id===BDAY_H;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});document.querySelectorAll('#bqlc button').forEach(b=>{const on=+b.dataset.id===bqLook();b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});{const e=$('#adsD');if(e)e.textContent=d2(BDAY_H)+':00';const f=$('#adsB');if(f)f.textContent='за '+bqLook()+' '+(bqLook()===1?'день':'дня')}rHrs()};
const rHrs=()=>{const c=hrsCfg();[['hw',c.hw],['hf',c.hf]].forEach(([k,v])=>{const o=$('#'+k+'o'),e=$('#'+k+'c'),p=v.split('-');if(o&&document.activeElement!==o)o.value=p[0];if(e&&document.activeElement!==e)e.value=p[1]})};
let curDay=dAdd(0),dayT=0;
const nextBoundary=()=>{const n=new Date(),t=new Date(n.getFullYear(),n.getMonth(),n.getDate(),BDAY_H,0,0,0);if(t.getTime()<=n.getTime())t.setDate(t.getDate()+1);return t.getTime()};
const armDay=()=>{clearTimeout(dayT);dayT=setTimeout(()=>{dayCheck();armDay()},Math.min(Math.max(nextBoundary()-Date.now()+300,1000),2e9))};
function fixDraftDate(quiet){const d=L.draft;if(!d)return;const t1=dAdd(1),t0=dAdd(0);let ch=0;
if(!RXD.test(d.date||'')){d.date=t1;d.man=false;ch=1}
else if(d.man===true){if(d.date<t0){d.date=t1;d.man=false;ch=1}}
else if(d.man===false){if(d.date!==t1){d.date=t1;ch=1}}
else if(d.date<t1){d.date=t1;d.man=false;ch=1}
if(ch){saveL();setDp($('#date'),d.date);sumDn();if(!quiet&&d.items&&Object.keys(d.items).length)toast('📅 Дата поставки обновлена: '+day(d.date))}}
function dayTurn(o,n){if(pd===o){pd=n;savePd()}if(wd===o)wd=n;if(sm===o.slice(0,7)&&n.slice(0,7)!==sm)sm=n.slice(0,7);if(mm===o.slice(0,7)&&n.slice(0,7)!==mm)mm=n.slice(0,7);
fixDraftDate();rAll();streams();refreshRoster();carryAll(true);toast('🌅 Новый день: '+day(n))}
function dayCheck(){const n=dAdd(0);if(n===curDay)return false;const o=curDay;curDay=n;dayTurn(o,n);return true}
let hidAt=0;const wake=()=>{ST.wk=Date.now();for(const k in RF)delete RF[k];dayCheck();armDay();fixDraftDate(true);if(hidAt&&Date.now()-hidAt>15000){hidAt=0;restartStreams()}else streams();flush();refreshRoster();carryAll()};
document.addEventListener('visibilitychange',()=>{if(document.hidden){hidAt=Date.now();return}if(!document.hidden){wake();try{navigator.serviceWorker.getRegistration().then(r=>r&&r.update()).catch(()=>{})}catch{}}});
addEventListener('pageshow',e=>{if(e.persisted)wake()});addEventListener('focus',()=>{if(!dayCheck())carryAll()});document.addEventListener('resume',wake);
setInterval(dayCheck,15000);armDay();setInterval(()=>{if(tab==='order')refreshRoster()},60000);addEventListener('offline',()=>setSt());
setInterval(()=>{if(!DEMO&&!document.hidden&&Date.now()-lastDet>60000&&(!DB||!DBV||Date.now()-(ST.okAt||0)>45000))detect(true).then(ok=>{if(ok){streams();refreshRoster()}setSt()});if(AU.rt&&L.hold&&L.hold.length&&!L.out.length){L.out.push(...L.hold.splice(0));saveL()}flush();if(!document.hidden&&Object.keys(ES).some(k=>ST.open[k]&&Date.now()-(ST.seen[k]||0)>90000))restartStreams()},30000);
setInterval(()=>{if(document.hidden)return;tickN++;const sse=ST.open.meta&&!metaBroken,hasMeta=Object.keys(DATA.meta||{}).length>0;if(sse&&hasMeta&&tickN%12)return;pollMeta(sse?tickN%12===0:(metaBroken||!hasMeta||tickN%8===0),true)},2500);
// ---- 9.7.2: все объявления ниже стоят ДО первой отрисовки (rAll), иначе const ещё «не создан» (TDZ) ----
let SNDK=0,PWSC=0,EPT=0,PREW=LS.get('vip3-pw',''),PRK=0;const PRA={};
// ---------- 9.8.0: заказ одним листом A4 (картинка / PDF) для WhatsApp, Telegram, VK ----------
let ORDCUR=null;const IMG={blob:null,url:'',o:null,fresh:false,name:'',cv:null};
const A4W=1654,A4H=2339;
const ordGroups=o=>{const cs=[...BASE,...Object.entries(cat0().groups||{}).map(([k,v])=>[k,v.n,'📦'])],seen=new Set(),ug=(a,b)=>(b.urg?1:0)-(a.urg?1:0),G=[];
for(const[id,n,e]of cs){const g=o.items.filter(i=>i.c===id);if(!g.length)continue;g.forEach(i=>seen.add(i.id));G.push({h:e+' '+n,rows:g.slice().sort((a,b)=>ug(a,b)||COL.compare(a.n,b.n))})}
const r=o.items.filter(i=>!seen.has(i.id));if(r.length)G.push({h:'📦 Другое',rows:r.slice().sort(ug)});return G};
const ordExtra=o=>{if(o.date!==dAdd(1))return'';const date=dAdd(0),rows=woRows(date),p=[];if(rows.length)p.push(writeoffMessage(date,rows));const tb=tomorrowBlock();if(tb)p.push(tb);return p.join('\n\n')};
const loadImg=src=>new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src});
const cvBlob=(cv,type,q)=>new Promise(res=>{try{cv.toBlob(b=>res(b),type,q)}catch(e){res(null)}});
async function ordCanvas(o,extra){
const W=A4W,H=A4H,M=84,FF='system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
const ink='#16130f',mu='#6b6258',red='#c81e1e',ln='#cfc6b8',band='#f1eadf';
x.fillStyle='#fff';x.fillRect(0,0,W,H);x.textBaseline='alphabetic';x.textAlign='left';
const logo=await loadImg('logo-ink.png');let hx=M;if(logo){const lh=118,lw=Math.round(logo.width*lh/logo.height);x.drawImage(logo,M,M-8,lw,lh);hx=M+lw+30}
x.fillStyle=ink;x.font='800 56px '+FF;x.fillText(o.noOrder?'СВОДКА · '+day(dAdd(0)).toUpperCase():'ЗАКАЗ · '+day(o.date).toUpperCase(),hx,M+52);
x.fillStyle=mu;x.font='600 30px '+FF;x.fillText('ВИАЙПИ РЕСТОБАР КУХНЯ',hx,M+96);
x.textAlign='right';x.fillStyle=ink;x.font='700 38px '+FF;x.fillText(String(o.cook&&o.cook.n||''),W-M,M+44);x.fillStyle=mu;x.font='500 28px '+FF;x.fillText((o.cook&&o.cook.r?o.cook.r+' · ':'')+(o.noOrder?'сформировано в ':'оформлен в ')+tm(o.noOrder?Date.now():o.created),W-M,M+88);x.textAlign='left';
x.fillStyle=ink;x.fillRect(M,M+128,W-2*M,5);const top=M+128+5+34;
const wrap=(t,w)=>{const out=[];String(t).split('\n').forEach(par=>{if(!par.trim()){out.push('');return}let line='';par.split(/\s+/).forEach(wd=>{const tr=line?line+' '+wd:wd;if(x.measureText(tr).width>w&&line){out.push(line);line=wd}else line=tr});out.push(line)});return out};
// низ листа: итог, комментарий, закрытие кухни
const nu=o.items.filter(i=>i.urg).length;let foot=[];
if(o.note){x.font='500 30px '+FF;foot=wrap('💬 '+o.note,W-2*M-40)}
const footH=96+(foot.length?foot.length*40+30:0);
// дополнительный блок (списания, заготовки на завтра) — тот же текст, что в сообщении
let exL=[],exF=22,exH=0;
const maxEx=o.noOrder?H-M-footH-top-60:H*.4;
if(extra){for(const f of (o.noOrder?[40,38,36,34,32,30,28,26,24,22,20,18,16,15]:[22,20,18,16,15])){exF=f;x.font='500 '+f+'px '+FF;exL=wrap(extra,W-2*M-44);exH=exL.length*Math.round(f*1.4)+54;if(exH<=maxEx)break}
const ml=Math.max(3,Math.floor((maxEx-54)/Math.round(exF*1.4)));if(exL.length>ml){exL=exL.slice(0,ml-1);exL.push('… полный текст — в сообщении');exH=exL.length*Math.round(exF*1.4)+54}}
const bottom=H-M-footH-(exH?exH+26:0),avail=bottom-top;
const G=o.noOrder?[]:ordGroups(o);
const flow=(fs,cols)=>{const lh=Math.round(fs*1.62),hh=Math.round(fs*2.0),cw=(W-2*M-(cols-1)*56)/cols,A=[[]];let y=0;
for(const g of G){let first=true,started=false;for(const r of g.rows){if(y+(first?hh+lh:lh)>avail&&y>0){A.push([]);y=0;first=true;if(A.length>cols)return null}
if(first){A[A.length-1].push({k:'h',t:g.h+(started?' (прод.)':''),y});y+=hh;first=false}A[A.length-1].push({k:'r',r,y});y+=lh;started=true}}
if(y>avail&&A.length>=cols)return null;return{A,lh,hh,cw,fs}};
let L2=null;for(let fs=46;fs>=12&&!L2;fs--)for(let cols=1;cols<=3&&!L2;cols++)L2=flow(fs,cols);
if(!L2){const fs=12;L2=flow(fs,3)||{A:[[]],lh:20,hh:24,cw:(W-2*M-112)/3,fs}}
const{A,lh,hh,cw,fs}=L2,bs=Math.round(fs*.74);
A.forEach((col,ci)=>{const cx=M+ci*(cw+56);col.forEach(u=>{const y0=top+u.y;
if(u.k==='h'){x.fillStyle=band;x.fillRect(cx,y0,cw,hh-6);x.fillStyle=ink;x.textAlign='left';let hf=Math.round(fs*.92),ht=u.t;const hw=cw-28;x.font='800 '+hf+'px '+FF;while(hf>Math.round(fs*.6)&&x.measureText(ht).width>hw){hf--;x.font='800 '+hf+'px '+FF}if(x.measureText(ht).width>hw){while(ht.length>2&&x.measureText(ht+'…').width>hw)ht=ht.slice(0,-1);ht+='…'}x.fillText(ht,cx+14,y0+Math.round(hh*.66));return}
const r=u.r,base=y0+Math.round(lh*.7),qty=fmtQ(r.qty)+' '+(r.u||''),urg=!!r.urg;
x.strokeStyle=urg?red:ink;x.lineWidth=3;x.strokeRect(cx+4,base-bs+3,bs,bs);
x.font='800 '+fs+'px '+FF;x.textAlign='right';const qw=x.measureText(qty).width;x.fillStyle=urg?red:ink;x.fillText(qty,cx+cw,base);
x.textAlign='left';x.font=(urg?'800 ':'600 ')+fs+'px '+FF;let nx=cx+bs+22;
if(urg){x.fillStyle=red;x.beginPath();x.arc(nx+fs*.3,base-fs*.32,fs*.3,0,7);x.fill();x.fillStyle='#fff';x.font='900 '+Math.round(fs*.5)+'px '+FF;x.textAlign='center';x.fillText('!',nx+fs*.3,base-fs*.16);x.textAlign='left';x.font='800 '+fs+'px '+FF;nx+=fs*.8}
let nm=String(r.n),mw=cw-(nx-cx)-qw-28;x.fillStyle=urg?red:ink;
if(x.measureText(nm).width>mw){while(nm.length>1&&x.measureText(nm+'…').width>mw)nm=nm.slice(0,-1);nm+='…'}
x.fillText(nm,nx,base);const ew=x.measureText(nm).width;
x.strokeStyle=ln;x.lineWidth=2;x.setLineDash([2,8]);x.beginPath();x.moveTo(nx+ew+12,base-4);x.lineTo(cx+cw-qw-14,base-4);x.stroke();x.setLineDash([])})});
// дополнительный блок
let fy=o.noOrder?top:bottom+26;
if(exH){x.fillStyle='#faf6ef';x.fillRect(M,fy,W-2*M,exH);x.strokeStyle=ln;x.lineWidth=2;x.strokeRect(M,fy,W-2*M,exH);x.fillStyle=ink;x.font='500 '+exF+'px '+FF;exL.forEach((t,i)=>x.fillText(t,M+22,fy+Math.round(exF*.95)+14+i*Math.round(exF*1.4)));fy+=exH}
// подвал
const fb=H-M-footH+20;x.fillStyle=ink;x.fillRect(M,fb,W-2*M,3);x.font='800 40px '+FF;if(!o.noOrder)x.fillText('Всего: '+o.items.length+' поз.'+(nu?' · срочно: '+nu:''),M,fb+58);
if(o.closed){x.textAlign='right';x.fillStyle=mu;x.font='600 28px '+FF;x.fillText('Кухня закрыта ✓ · проверил: '+(o.cook&&o.cook.n||''),W-M,fb+56);x.textAlign='left'}
if(foot.length){x.fillStyle=ink;x.font='500 30px '+FF;foot.forEach((t,i)=>x.fillText(t,M,fb+104+i*40))}
return cv}
async function pdfFromCanvas(cv){const jb=await cvBlob(cv,'image/jpeg',.92);if(!jb)return null;const jpg=new Uint8Array(await jb.arrayBuffer()),enc=new TextEncoder(),parts=[],offs=[];let len=0;
const add=u=>{parts.push(u);len+=u.length},addS=t=>add(enc.encode(t)),obj=(n,b)=>{offs[n]=len;addS(n+' 0 obj\n'+b+'\nendobj\n')};
addS('%PDF-1.4\n');obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,'<</Type/Pages/Kids[3 0 R]/Count 1>>');obj(3,'<</Type/Page/Parent 2 0 R/MediaBox[0 0 595.28 841.89]/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>');
offs[4]=len;addS('4 0 obj\n<</Type/XObject/Subtype/Image/Width '+cv.width+'/Height '+cv.height+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+jpg.length+'>>\nstream\n');add(jpg);addS('\nendstream\nendobj\n');
const cs='q 595.28 0 0 841.89 0 0 cm /Im0 Do Q';obj(5,'<</Length '+cs.length+'>>\nstream\n'+cs+'\nendstream');
const xo=len;let xr='xref\n0 6\n0000000000 65535 f \n';for(let i=1;i<=5;i++)xr+=String(offs[i]).padStart(10,'0')+' 00000 n \n';addS(xr+'trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n'+xo+'\n%%EOF\n');return new Blob(parts,{type:'application/pdf'})}
const imgDownload=(blob,name)=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),6000)};
async function imgBuild(o0,sel,orderIn){toast('Готовлю лист A4…');let cv=null,o=o0;try{if(sel){o=orderIn?{...o0,closed:!!sel.close}:{...o0,items:[],noOrder:true,closed:!!sel.close};cv=await ordCanvas(o,composeExtra(o0,sel))}else cv=await ordCanvas(o,ordExtra(o))}catch(e){errAdd(e&&e.message,'ordCanvas')}
const b=cv&&await cvBlob(cv,'image/png');if(!b){snd.warn();toast('Не удалось создать картинку');return 0}
IMG.cv=cv;IMG.blob=b;IMG.o=o;IMG.name=(o.noOrder?'svodka-':'zakaz-')+(o.noOrder?dAdd(0):o.date)+'.png';if(IMG.url)URL.revokeObjectURL(IMG.url);IMG.url=URL.createObjectURL(b);$('#imgp').src=IMG.url;if(!$('#dimg').open)$('#dimg').showModal();return 1}
const ordFinish=o=>{o.copied=true;upsert(o);L.draft=blank(L.draft.cook);saveL();try{$('#dimg').close()}catch(e){}try{if($('#dc').open)$('#cn').click()}catch(e){}try{$('#dr').close()}catch(e){}rAll();snd.ok();vib([60,40,60]);toast('✓ Отправлено и сохранено в истории')};
async function imgShareFile(blob,name,type){const f=new File([blob],name,{type});
try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:IMG.o.noOrder?'Сводка кухни · '+day(dAdd(0)):'Заказ на '+day(IMG.o.date)});return 1}}catch(e){if(e&&e.name==='AbortError')return -1;snd.warn();toast('Не удалось открыть «Поделиться». Нажмите «Скачать»');return -1}
imgDownload(blob,name);toast('Файл сохранён — отправьте его из галереи или «Файлов» в WhatsApp / Telegram / VK');return 0}
Object.assign(ACT,{
async ordimg(){if(!ORDCUR)return;IMG.fresh=!!ORDCUR.orderIn;await imgBuild(ORDCUR.o,ORDCUR.sel,ORDCUR.orderIn)},
async himg(id){const o=ords().find(x=>x.id===id);if(!o)return;IMG.fresh=false;await imgBuild(o)},
async imgshare(){if(!IMG.blob)return;const r=await imgShareFile(IMG.blob,IMG.name,'image/png');if(r===1){if(IMG.fresh)ordFinish(IMG.o);else{snd.ok();toast('✓ Готово')}}},
async imgpdf(){if(!IMG.cv)return;const p=await pdfFromCanvas(IMG.cv);if(!p){snd.warn();toast('Не удалось создать PDF');return}const r=await imgShareFile(p,IMG.name.replace(/\.png$/,'.pdf'),'application/pdf');if(r===1){if(IMG.fresh)ordFinish(IMG.o);else{snd.ok();toast('✓ Готово')}}},
imgclose(){snd.tap();$('#dimg').close()},
imgsave(){if(!IMG.blob)return;imgDownload(IMG.blob,IMG.name);snd.ok();toast('✓ Картинка сохранена')},
async imgcopy(){try{await navigator.clipboard.write([new ClipboardItem({'image/png':IMG.blob})]);snd.ok();toast('✓ Картинка скопирована — вставьте в чат')}catch(e){snd.warn();toast('Этот браузер не копирует картинки. Нажмите «Скачать»')}}});
// ---------- 9.8.0: наблюдатель и утверждения ----------
const AP={dirty:0,g:[],n:0,cfg:null,t:0,busy:0,err:'',mx:-1,mp:null,raw:{}};
function apDesc(m,p,v){const a=String(p).split('/'),old=atPath(p),nm=o=>o&&typeof o==='object'?String(o.t||o.n||o.title||o.name||''):'';
const AREA={prep:'Заготовки',prepMeta:'Банкет/гости',prepLibrary:'Архив заготовок',prepPins:'Закрепления',writeoffs:'Списания',plan:'План',orders:'Заказ',receipts:'Приёмка',catalog:'Каталог',prepCats:'Категории'}[a[0]]||a[0];
const dd=RXD.test(a[1]||'')?' · '+a[1].split('-').reverse().slice(0,2).join('.'):'';
const verb=m==='DELETE'?'Удалить':m==='PATCH'?'Изменить':'Записать';let what=nm(m==='DELETE'?old:v)||nm(old),ex='';
if(m==='PATCH'&&v&&typeof v==='object'){const k=Object.keys(v);if(k.includes('done'))ex=v.done?' — отметить «готово»':' — снять отметку';else ex=' ('+k.slice(0,4).map(x=>x+': '+(v[x]&&typeof v[x]==='object'?'…':String(v[x]).slice(0,18))).join(', ')+')'}
return(verb+' · '+AREA+dd+(what?' · «'+what.slice(0,50)+'»':'')+ex).slice(0,200)}
function propose(m,p,v){if(Date.now()-gestT>4000)return;
if((OBS.cfg.mode||'view')!=='edit'||OBS.cfg.on===0){if(Date.now()-OBS.vt>1500){OBS.vt=Date.now();snd.warn();toast('👁 Режим просмотра: правки выключены')}return}
if(!gG||gG.t!==gestT)gG={t:gestT,id:uid()};
const t=Math.max(Date.now(),OBS.last+1);OBS.last=t;const rec={m,p,t,by:String(OBS.cfg.n||'Наблюдатель').slice(0,40),g:gG.id,d:apDesc(m,p,v)};
if(v!==undefined&&v!==null){let j='';try{j=JSON.stringify(v)}catch(e){}if(j.length>30000){toast('Слишком большая правка');return}rec.v=j}
const id=uid();OBS.ls.push({id,g:rec.g,d:rec.d,t});if(OBS.ls.length>60)OBS.ls.shift();LS.set('vip3-myprop',OBS.ls);
mut0('PUT','proposals/'+id,rec);if(DATA&&DATA.proposals)delete DATA.proposals;
if(Date.now()-OBS.nt>1500){OBS.nt=Date.now();snd.ok();toast('✎ Отправлено шефу на утверждение')}
rObs()}
function rObs(){const b=$('#obsbar');if(!b)return;const on=isObs();b.hidden=!on;document.body.classList.toggle('obs',on);if(!on)return;
const e2=(OBS.cfg.mode||'view')==='edit';b.textContent=(e2?'✎ Наблюдатель · правки идут шефу на утверждение':'👁 Наблюдатель · только просмотр')+(OBS.ls.length?' · ждут: '+OBS.ls.length:'');
const l=$('#obsl');if(l)l.innerHTML=OBS.ls.length?OBS.ls.slice().reverse().map(x=>`<div class="api">${esc(x.d||'')}<small> · ${esc(tm(x.t))}</small></div>`).join(''):'<p class="small">Нет правок, ожидающих утверждения.</p>';
const t=$('#obst');if(t)t.textContent=e2?'Вы можете менять данные: каждая правка уходит шефу и вступает в силу только после его утверждения.':'Сейчас включён режим просмотра: изменить данные нельзя.'}
async function obsTick(force){if(!isObs()||DEMO||!DB||OBS.busy)return;if(!force&&Date.now()-OBS.t<2e4)return;OBS.busy=1;
try{const c=await jget('access/obs');OBS.cfg=c&&typeof c==='object'?c:{};LS.set('vip3-obscfg',OBS.cfg);OBS.t=Date.now();
if(OBS.cfg.on===0){OBS.busy=0;toast('Доступ наблюдателя выключен шефом');ACT.logout();return}
if(OBS.ls.length){const d=(await jget('proposals','',true))||{},keep=[];let ok=0,no=0;OBS.ls.forEach(x=>{const r=d[x.id];if(r&&r.s==='ok'){ok++;return}if(r&&r.s==='no'){no++;return}if(!r&&Date.now()-x.t>3e5)return;keep.push(x)});
if(keep.length!==OBS.ls.length){OBS.ls=keep;LS.set('vip3-myprop',keep)}if(ok){snd.ok();toast('✓ Шеф утвердил правок: '+ok)}else if(no){snd.warn();toast('✕ Шеф отклонил правок: '+no)}}}catch(e){}
OBS.busy=0;rObs()}
const apDivOK=(m,p)=>/^(?:PUT|PATCH|DELETE)$/.test(m)&&typeof p==='string'&&p.length<=200&&OBS_DIV.test(p)&&!OBS_FREE.test(p)&&p.split('/').every(x=>x&&!/[.#$\[\]]/.test(x));
function apBuild(){const raw=AP.raw||{},now=Date.now(),by=new Map();let mx=0;
Object.entries(raw).forEach(([id,r])=>{if(!r||typeof r!=='object')return;if(r.s){if(now-(Number(r.dt)||0)>1728e5)api('DELETE','proposals/'+id).catch(()=>{});return}
if(!apDivOK(r.m,r.p)){api('PATCH','proposals/'+id,{s:'no',dt:now}).catch(()=>{});return}
const g=String(r.g||id);let o=by.get(g);if(!o){o={g,t:Number(r.t)||0,by:String(r.by||'Наблюдатель'),items:[]};by.set(g,o)}o.items.push({...r,id});if((Number(r.t)||0)>mx)mx=Number(r.t)||0});
const l=[...by.values()];l.forEach(o=>o.items.sort((a,b)=>((a.t||0)-(b.t||0))||(a.id<b.id?-1:1)));l.sort((a,b)=>a.t-b.t);AP.g=l;AP.n=l.length;
if(AP.mx>=0&&mx>AP.mx){snd.ok();vib(60);toast('🔔 Наблюдатель: правка ждёт вашего утверждения ('+AP.n+')')}AP.mx=Math.max(AP.mx,mx)}
async function apLoad(force){if(!isAdmin()||DEMO||!DB||AP.busy)return;if(!force&&Date.now()-AP.t<2e4)return;AP.busy=1;
try{const d=(await jget('proposals','',true))||{};AP.raw=d&&typeof d==='object'?d:{};AP.t=Date.now();AP.err='';apBuild();try{const c=await jget('access/obs');AP.cfg=c&&typeof c==='object'?c:{}}catch(e){}}catch(e){AP.t=Date.now();AP.err=e&&e.status?'HTTP '+e.status:'нет связи'}
AP.busy=0;rAp()}
function rAp(){const b=$('#apbadge');if(b){b.hidden=!(AP.n&&isAdmin());b.textContent=AP.n>9?'9+':String(AP.n)}
const sm=$('#adsA');if(sm)sm.textContent=AP.err?'⚠':AP.n?'ждут: '+AP.n:'';
if(!dialogOpen('#dt'))return;const el=$('#apl');if(!el)return;
el.innerHTML=AP.err?`<p class="small apw">Не удалось загрузить (${esc(AP.err)}). Опубликуйте новые правила Firebase — файл firebase-rules.json.</p>`:AP.g.length?AP.g.map(o=>`<div class="apg"><div class="apt"><b>${esc(o.by)}</b> · ${esc(tm(o.t))}</div>${o.items.slice(0,6).map(i=>`<div class="api">${esc(i.d||i.p)}</div>`).join('')}${o.items.length>6?`<div class="api">…и ещё ${o.items.length-6}</div>`:''}<div class="acts"><button class="p" data-a="apok" data-id="${esc(o.g)}">✓ Утвердить</button><button class="d" data-a="apno" data-id="${esc(o.g)}">✕ Отклонить</button></div></div>`).join('')+(AP.g.length>1?'<div class="acts"><button data-a="apokall">✓ Утвердить все</button><button class="d" data-a="apnoall">✕ Отклонить все</button></div>':''):'<p class="small">Нет правок на утверждение.</p>';
const fa=document.activeElement,box=$('#obcfg');if(box&&!AP.dirty&&!(fa&&box.contains(fa))){const c=AP.cfg||{};$('#obn').value=c.n||'';$('#obm').value=c.mode==='edit'?'edit':'view';$('#obo').checked=c.on!==0}}
async function apDecide(g,yes,quiet){const o=AP.g.find(x=>x.g===g);if(!o||o.busy)return 0;o.busy=1;let skipped=0;
try{if(yes){for(const it of o.items){if(!apDivOK(it.m,it.p)){skipped++;continue}let v=null;if(typeof it.v==='string'&&it.v){try{v=JSON.parse(it.v)}catch(e){skipped++;continue}}
if(it.m==='PATCH'){let cur;try{cur=await jget(it.p)}catch(e){cur=undefined}if(cur===null){skipped++;continue}}
mut0(it.m,it.p,it.m==='DELETE'?null:v)}}
const dt=Date.now();for(const it of o.items)await api('PATCH','proposals/'+it.id,{s:yes?'ok':'no',dt});
o.items.forEach(it=>{if(AP.raw[it.id])AP.raw[it.id]={...AP.raw[it.id],s:yes?'ok':'no',dt}});apBuild();rAp();
if(!quiet){yes?snd.ok():snd.tap();toast(yes?(skipped?'✓ Утверждено (пропущено: '+skipped+' — объект уже удалён)':'✓ Утверждено'):'✕ Отклонено')}}catch(e){o.busy=0;snd.warn();toast('Не удалось. Проверьте сеть и правила Firebase');return 0}
return 1}
Object.assign(ACT,{
login(){if(ACT.lgb)return;ACT.lgb=1;return ACT.login0().finally(()=>{ACT.lgb=0})},
async apok(g){await apDecide(g,true)},async apno(g){if(await ask('Отклонить правку?','<p>Изменение не будет применено.</p>','Отклонить'))await apDecide(g,false)},
async apokall(){if(!AP.n)return;let k=0;for(const o of [...AP.g])k+=await apDecide(o.g,true,true);snd.ok();toast('✓ Утверждено: '+k)},
async apnoall(){if(!AP.n)return;if(!await ask('Отклонить все правки?','<p>Ни одно из '+AP.n+' изменений не будет применено.</p>','Отклонить все'))return;let k=0;for(const o of [...AP.g])k+=await apDecide(o.g,false,true);snd.tap();toast('✕ Отклонено: '+k)},
obssave(){if(!isAdmin())return need();const n=$('#obn').value.trim().slice(0,40),mode=$('#obm').value==='edit'?'edit':'view',on=$('#obo').checked?1:0;mut('PUT','access/obs',{n,mode,on});AP.cfg={n,mode,on};AP.dirty=0;snd.ok();toast('✓ Сохранено')},
async obscreate(){if(!isAdmin())return need();const pw=$('#obp').value;if(pw.length<6){snd.warn();toast('Пароль — минимум 6 символов');return}
try{const r=await fetchFast('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:VIEWER,password:pw,returnSecureToken:false})});const j=await r.json(),msg=(j.error&&j.error.message)||'';
if(!r.ok){snd.warn();toast(/EMAIL_EXISTS/.test(msg)?'Аккаунт уже создан. Пароль меняет сам наблюдатель (или удалите его в Firebase → Authentication)':/OPERATION_NOT_ALLOWED/.test(msg)?'Создайте пользователя '+VIEWER+' в Firebase → Authentication':authErr(msg));return}
$('#obp').value='';snd.ok();toast('✓ Аккаунт наблюдателя создан: '+VIEWER)}catch{snd.warn();toast('Нет интернета')}},
async obspw(){const v=$('#onp').value;if(v.length<6){snd.warn();toast('Пароль — минимум 6 символов');return}
try{const t=await tok();const r=await fetchFast('https://identitytoolkit.googleapis.com/v1/accounts:update?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:t,password:v,returnSecureToken:true})});const j=await r.json();
if(!r.ok){snd.warn();toast(authErr(j.error&&j.error.message||''));return}
AU={t:j.idToken,rt:j.refreshToken,exp:Date.now()+j.expiresIn*1000,ok:true};roleSet(AU.t);LS.set('vip3-rt',AU.rt);$('#onp').value='';snd.ok();toast('✓ Пароль изменён')}catch{snd.warn();toast('Не удалось. Проверьте сеть')}},
obs(){snd.tap();rObs();$('#dobs').showModal()}});
// ---- 9.4: резервная копия (напоминание, список узлов), журнал ошибок (вывод), уборка служебных отметок meta
const BK_NODES=['team','catalog','orders','prep','prepMeta','prepLibrary','prepPins','prepCats','writeoffs','plan','sched','shifts','receipts','payroll'];
const bkDays=()=>{const l=Number(LS.get('vip3-lastbk',0))||0;return l?Math.floor((Date.now()-l)/864e5):-1};
// ---------- Телефоны и Telegram (9.5): contacts/notify/devices читают только шеф и бот ----------
const agoD=t=>{const m=Math.round((Date.now()-(Number(t)||0))/6e4);return m<1?'только что':m<60?m+' мин назад':m<1440?Math.floor(m/60)+' ч назад':Math.floor(m/1440)+' дн. назад'};
// ---------- 9.9.1: личные пароли · корзина · блюда предзаказа в заготовках ----------
const PWM=new Set();async function pwScan(){if(PWSC||!isAdmin()||DEMO||!DB)return;PWSC=1;try{const d=await jget('payroll','',true);if(d&&typeof d==='object'){put('/payroll',d);dirty('payroll');pwMig()}}catch(e){PWSC=0}}
function pwMig(){if(!isAdmin()||DEMO)return;const P=PAYROLL();if(!Object.keys(P).length){pwScan();return}team().forEach(k=>{if(k.virtual||k.pw||PWM.has(k.id))return;if(P[k.id]&&P[k.id].key){PWM.add(k.id);mut('PATCH','team/'+k.id,{pw:1})}})}
const IDKS=()=>{const o=LS.get('vip3-idk',{});return o&&typeof o==='object'&&!Array.isArray(o)?o:{}};
const needPw=id=>{if(DEMO||isAdmin())return false;const k=team().find(x=>x.id===id);return!!(k&&k.pw&&!k.virtual&&!IDKS()[id])};
let PIDW=null,WHOOBS=(()=>{const c=LS.get('vip3-obsn',null);return c&&typeof c==='object'&&c.ok?c:null})(),WHOOBS_T=0,IDCK_T=0;
const idAsk=id=>new Promise(res=>{const k=team().find(x=>x.id===id),d=$('#dpid');if(!k||!d){res(!k?false:true);return}
if(PIDW){const r=PIDW.res;PIDW=null;r(false)}
PIDW={id,res,fail:0,lock:0};$('#pidh').textContent='Пароль: '+k.n;$('#pidv').value='';$('#pide').textContent='';$('#pidgo').disabled=false;
d.onclose=()=>{if(PIDW){const r=PIDW.res;PIDW=null;r(false)}};try{d.showModal()}catch{d.setAttribute('open','')}setTimeout(()=>{try{$('#pidv').focus()}catch(e){}},80)});
async function whoObsLoad(){if(DEMO||!DB||!navigator.onLine||Date.now()-WHOOBS_T<6e4)return;WHOOBS_T=Date.now();
try{const c=await jget('access/obs');if(c&&typeof c==='object'){WHOOBS={n:String(c.n||'').slice(0,40),on:c.on===0?0:1,mode:c.mode,ok:1};LS.set('vip3-obsn',WHOOBS)}else{WHOOBS=null;LS.set('vip3-obsn',null)}if(dialogOpen('#dwho'))rWho()}catch(e){}}
function whoLead(){const ob=WHOOBS&&WHOOBS.ok&&WHOOBS.on!==0?WHOOBS:null;
return `<div class="lbl who-or">Руководство</div><div class="who-grid"><button class="who-b who-ld" data-a="admin"><i class="cook-dot"></i><span class="who-t"><b>🔐 Шеф</b><small>Руководитель</small></span></button>${ob?`<button class="who-b who-ld" data-a="whoobs"><i class="cook-dot"></i><span class="who-t"><b>👁 ${esc(ob.n||'Наблюдатель')}</b><small>Наблюдатель</small></span></button>`:''}</div>`}
async function idChk(){if(DEMO||!DB||!navigator.onLine||!Object.keys(DATA.team||{}).length||Date.now()-IDCK_T<6e4)return;IDCK_T=Date.now();
const m=IDKS();let drop=[];for(const id of Object.keys(m)){try{const d=await jget('acct/'+m[id]);if(d===null||d===undefined)drop.push(id)}catch(e){}}
if(drop.length){const n=IDKS();drop.forEach(i=>delete n[i]);LS.set('vip3-idk',n)}
if(chiefOut()){toast('Имя шефа — только по паролю руководителя')}const me=L.me;if(me&&needPw(me.id)){L.me=null;if(L.draft.cook&&L.draft.cook.id===me.id)L.draft.cook=null;saveL();try{rCooks();rPCooks();rShifts()}catch(e){}toast('Нужен пароль — войдите под своим именем');whoOpen()}}
// ---------- 9.9.1: выход шефа = выход со всех телефонов; имя шефа защищено ----------
// Шеф при выходе пишет в access/ep новое число. Каждый телефон помнит число, с которым вошёл (vip3-aep); увидел большее — сам выходит из режима руководителя и просит пароль заново.
const AEP=()=>{const v=LS.get('vip3-aep',null);return typeof v==='number'?v:null};
async function epSync(){if(DEMO||!DB)return;try{const v=await jget('access/ep');LS.set('vip3-aep',typeof v==='number'?v:0)}catch(e){}}
async function epBump(cr){let t=cr.t;try{if(!t||Date.now()>=cr.exp-6e4){const r=await fetchFast('https://securetoken.googleapis.com/v1/token?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(cr.rt)},9000);const j=await r.json();if(!r.ok||!j.id_token)throw 0;t=j.id_token}
const v=Date.now(),r=await fetchFast(`${DB}/access/ep.json?auth=${encodeURIComponent(t)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:String(v)},9000);if(!r.ok)throw 0;LS.set('vip3-aep',v);toast('✓ Выход выполнен на всех телефонах')}catch(e){toast('⚠ Нет связи: с других телефонов выйти не удалось — выйдите ещё раз при сети')}}
function chiefOut(){try{const me=L.me;if(me&&!isAdmin()&&!DEMO){const k=team().find(x=>x.id===me.id);if(k&&k.ch){L.me=null;if(L.draft.cook&&L.draft.cook.id===me.id)L.draft.cook=null;saveL();try{rCooks();rPCooks();rShifts()}catch(e){}return true}}}catch(e){}return false}
function epDrop(){const adm=ROLE==='adm'&&!!AU.rt;if(adm){AU={t:'',rt:'',exp:0,ok:false};LS.set('vip3-rt','');LS.set('vip3-was','');edit=0;AP.g=[];AP.n=0;AP.mx=-1;try{$('#dt').close()}catch(e){}ui();try{rAp()}catch(e){}}
const c=chiefOut();if(adm||c){snd.warn();toast('Шеф вышел из приложения — для входа нужен пароль')}}
async function epCheck(force){if(DEMO||!DB)return;if(chiefOut())toast('Имя шефа — только по паролю руководителя');if(!navigator.onLine||(!force&&Date.now()-EPT<15e3))return;EPT=Date.now();
try{const v=await jget('access/ep'),ep=typeof v==='number'?v:0,mine=AEP();if(mine===null){LS.set('vip3-aep',ep);return}if(ep>mine){LS.set('vip3-aep',ep);epDrop()}}catch(e){}}
setInterval(()=>{if(!document.hidden)epCheck()},2e4);document.addEventListener('visibilitychange',()=>{if(!document.hidden)epCheck(1)});setTimeout(()=>epCheck(1),2500);
// корзина: каждое удаление (по нажатию человека) 60 дней лежит в trash/, шеф возвращает его в админке
const TR={list:[],t:0,busy:0,err:'',parsed:[]};
const TRASH_RX=/^(?:orders|prep|prepMeta|prepLibrary|prepPins|writeoffs|receipts|catalog|prepCats|plan|sched)\/[^/]+/;
function trDesc(p,o){const a=p.split('/'),nm=x=>x&&typeof x==='object'?String(x.t||x.n||x.title||x.name||''):'';
if(a[0]==='orders'&&o&&o.items)return 'Заказ на '+day(o.date)+' · '+((o.cook&&o.cook.n)||'')+' · '+(Array.isArray(o.items)?o.items.length:Object.keys(o.items).length)+' поз.';
if(a[0]==='prep'&&a.length===3)return 'Заготовка · '+day(a[1])+' · «'+nm(o).slice(0,50)+'»';
if(a[0]==='prepMeta'&&a[2]==='b')return 'Банкет · '+day(a[1])+' · «'+String((o&&o.title)||'без названия').slice(0,50)+'»';
if(a[0]==='prepMeta')return 'Данные банкета · '+day(a[1]);
if(a[0]==='writeoffs')return 'Списание · '+(RXD.test(a[1]||'')?day(a[1])+' · ':'')+nm(o).slice(0,50);
if(a[0]==='team')return 'Повар · '+nm(o);
const AREA={prepLibrary:'Архив заготовок',prepPins:'Закрепление',receipts:'Приёмка',catalog:'Каталог',prepCats:'Категория',plan:'План',sched:'График'}[a[0]]||a[0];return AREA+' · '+(nm(o)||a.slice(1).join('/')).slice(0,60)}
function trashCap(m,p,v){if(DEMO||!DB||isObs()||Date.now()-gestT>8000)return;const ent=[];
if(m==='PATCH'){if(!v||typeof v!=='object')return;for(const k of Object.keys(v))if(v[k]===null&&TRASH_RX.test(p+'/'+k)){const o=atPath(p+'/'+k);if(o!=null)ent.push([p+'/'+k,o])}}
else if(m==='DELETE'||(m==='PUT'&&v===null)){if(TRASH_RX.test(p)||/^team\/[^/]+$/.test(p)){const o=atPath(p);if(o!=null)ent.push([p,o])}}
if(!ent.length)return;if(!gG||gG.t!==gestT)gG={t:gestT,id:uid()};
for(const[pp,o]of ent){let j='';try{j=JSON.stringify(o)}catch(e){continue}if(!j||j.length>90000||j==='null')continue;
mut0('PUT','trash/'+uid(),{p:pp,t:Date.now(),d:trDesc(pp,o).slice(0,160),by:String((L.me&&L.me.n)||(isAdmin()?'Шеф':'')).slice(0,40),g:gG.id,v:j})}}
async function trLoad(force){if(!isAdmin()||DEMO||!DB||TR.busy)return;if(!force&&Date.now()-TR.t<15e3)return;TR.busy=1;
try{let d;try{d=await jget('trash','orderBy="t"&limitToLast=400',true)}catch(e){if(e&&e.status===400)d=await jget('trash','',true);else throw e}
TR.list=Object.entries(d&&typeof d==='object'?d:{}).map(([id,v])=>({id,...v})).filter(x=>x&&typeof x.p==='string'&&typeof x.v==='string'&&x.t).sort((a,b)=>b.t-a.t);TR.err='';TR.t=Date.now();
const old=TR.list.filter(x=>Date.now()-x.t>60*864e5).slice(0,40);old.forEach(x=>mut0('DELETE','trash/'+x.id));if(old.length)TR.list=TR.list.filter(x=>!old.includes(x))}
catch(e){TR.err=e&&(e.status===401||e.status===403)?'Нет доступа: сначала опубликуйте новые правила Firebase (firebase-rules.json)':'Нет связи'}TR.busy=0;rTr()}
function trGroups(){const gs=new Map();TR.list.forEach(x=>{const k=x.g||x.id;if(!gs.has(k))gs.set(k,[]);gs.get(k).push(x)});return gs}
function rTr(){const el=$('#trl'),sm=$('#adsR');if(!el)return;const gs=trGroups();if(sm)sm.textContent=gs.size?String(gs.size):'';
if(TR.err){el.innerHTML=`<div class="tgw">${esc(TR.err)}</div>`;return}
if(!gs.size){el.innerHTML='<div class="em">Корзина пуста</div>';return}
el.innerHTML=[...gs.entries()].slice(0,60).map(([k,a])=>{const main=a.slice().sort((x,y)=>x.p.length-y.p.length)[0];
return `<div class="trg"><b>${esc(main.d||main.p)}${a.length>1?` <span class="small">+ ещё ${a.length-1}</span>`:''}</b><small>${esc(day(iso(new Date(main.t))))}, ${esc(tm(main.t))}${main.by?' · удалил(а): '+esc(main.by):''}</small><div class="acts"><button class="p" data-a="trrest" data-id="${esc(k)}">↩ Вернуть</button><button class="g" data-a="trdel" data-id="${esc(k)}">✕ Убрать</button></div></div>`}).join('')}
// заказы из текста сообщения (Telegram / WhatsApp) или из файла копии
const stripE=s=>String(s||'').replace(/^[^\p{L}\p{N}]+/u,'').trim();
function parseOrders(txt){const out=[],blocks=String(txt||'').split(/(?=🧾\s*Заказ на)/).filter(b=>/🧾\s*Заказ на/.test(b)),tdy=new Date(Date.now()-BDAY_H*36e5),cs=cats(),pr=prods(),tm0=team();
for(const b of blocks){const ls=b.split(/\r?\n/).map(x=>x.trim()),h=ls[0].replace(/^🧾\s*Заказ на\s*/,''),dm=/(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/.exec(h);if(!dm)continue;
const d=+dm[1],mo=+dm[2];let y=dm[3]?(+dm[3]<100?2000+ +dm[3]:+dm[3]):0;
if(!y){let best=1e18;[tdy.getFullYear()-1,tdy.getFullYear(),tdy.getFullYear()+1].forEach(yy=>{const df=Math.abs(new Date(yy,mo-1,d,12).getTime()-tdy.getTime());if(df<best){best=df;y=yy}})}
const date=y+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0');if(!RXD.test(date)||mo<1||mo>12||d<1||d>31)continue;
let cook=null,tmv='',note='',closed=false,cur='',inItems=true;const its=[];
for(let i=1;i<ls.length;i++){const l=ls[i];if(!l)continue;
if(/^👨‍🍳/.test(l)){const t=l.replace(/^👨‍🍳\s*/,''),k=t.indexOf(',');cook={n:(k<0?t:t.slice(0,k)).trim(),r:k<0?'':t.slice(k+1).trim()};continue}
const m1=/^🕒\s*оформлен в\s*(\d{1,2}):(\d{2})/.exec(l);if(m1){tmv=m1[1].padStart(2,'0')+':'+m1[2];continue}
if(/^💬/.test(l)){note=l.replace(/^💬\s*/,'').slice(0,300);continue}
if(/^🔒\s*Кухня закрыта/.test(l)){closed=true;continue}
if(/^Всего:/.test(l)||/^(🗑|📋|🎉|🔁|⏰)/.test(l)){inItems=false;continue}
if(!inItems)continue;
if(/^[•·\-]\s*/.test(l)){const t=l.replace(/^[•·\-]\s*/,''),urg=/^🚨\s*/.test(t),t2=t.replace(/^🚨\s*/,''),k=t2.lastIndexOf(' — ');if(k<0)continue;const nm=t2.slice(0,k).trim(),qm=/^(\d+(?:[.,]\d+)?)\s*(.*)$/.exec(t2.slice(k+3).trim());if(!nm||!qm)continue;its.push({n:nm,qty:Number(qm[1].replace(',','.')),u:qm[2]||'',urg,cat:cur});continue}
cur=l}
if(!its.length)continue;
const mm=cook&&tm0.find(x=>nt(x.n)===nt(cook.n)),ck=mm?{id:mm.id,n:mm.n,r:mm.r,u:mm.u||'',color:mm.color||''}:{id:'r'+hashText(nt(cook&&cook.n||'?')).slice(1),n:(cook&&cook.n)||'—',r:(cook&&cook.r)||'',u:'',color:''};
const hh=tmv?+tmv.slice(0,2):12,mi=tmv?+tmv.slice(3):0;let cr=new Date(y,mo-1,d,hh,mi).getTime();if(hh>=12)cr-=864e5;
const items=its.map(it=>{const p=pr.find(x=>nt(x.n)===nt(it.n)),cc=p?p.c:((cs.find(c=>nt(c.n)===nt(stripE(it.cat)))||{}).id||'');return{id:p?p.id:'r'+hashText(nt(it.n)).slice(1),n:p?p.n:it.n,qty:it.qty,u:it.u||(p&&p.u)||'',c:cc||'',...(it.urg?{urg:1}:{})}});
const dup=ords().some(o=>o.date===date&&nt(o.cook&&o.cook.n)===nt(ck.n)&&o.items.length===items.length&&nt((o.items[0]||{}).n)===nt(items[0].n));
out.push({dup,o:{id:'o'+uid(),created:cr,updated:cr,date,cook:ck,note,items,copied:true,...(closed?{closed:true}:{})}})}
return out}
function rTrPv(list,src){const el=$('#trpv');if(!el)return;TR.parsed=list.filter(x=>!x.dup).map(x=>x.o);
if(!list.length){el.innerHTML='<div class="em">Заказов не найдено. Нужен текст, который начинается с «🧾 Заказ на …».</div>';return}
el.innerHTML=`<div class="small" style="margin:6px 0">${src}</div>`+list.map(x=>`<div class="trg"><b>${x.dup?'✓ уже есть · ':'➕ '}Заказ на ${esc(day(x.o.date))}</b><small>${esc(x.o.cook.n)} · ${x.o.items.length} поз.</small></div>`).join('')+(TR.parsed.length?`<div class="acts"><button class="p" data-a="trapply">Вернуть в историю (${TR.parsed.length})</button></div>`:'')}
// блюда предзаказа → заготовки банкета (те же ключи, что у Worker, поэтому дублей не будет)
const fnv36=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h.toString(36)};
function preDishes(b){const raw=String(b&&b.pi||'');if(!raw)return[];const pid=String(b.id).replace(/^pre_/,''),m=new Map(),first=new Map();
for(const l0 of raw.split('\n')){let t=l0.replace(/^[•·\-]\s*/,'').trim();if(!t)continue;let nm=t,qty=0,rq='',sv='',nt='';
{const nm0=/\s\(([^()]*)\)\s*$/.exec(t);if(nm0&&/ × /.test(t.slice(0,nm0.index))){nt=nm0[1].trim();t=t.slice(0,nm0.index).trim()}}
const sm=/\s@(\d{2}:\d{2})\s*$/.exec(t);if(sm&&okTm(sm[1])){sv=sm[1];t=t.slice(0,sm.index).trim()}nm=t;
const k=t.lastIndexOf(' × ');
if(k>0){nm=t.slice(0,k).trim();const rest=t.slice(k+3).trim(),qm=/^(\d+(?:[.,]\d+)?)/.exec(rest);if(qm)qty=Number(qm[1].replace(',','.'));else rq=rest.slice(0,20)}
nm=nm.replace(/\s+/g,' ').slice(0,80);if(!nm)continue;const base=fnv36(nm.toLowerCase().replace(/ё/g,'е')),f=first.has(base)?first.get(base):(first.set(base,sv),sv),key='pre_'+pid+'_'+base+(sv===f?'':'_'+fnv36(sv||'-')),u=/(сет|ваз|набор|пицц|торт|бутыл)/i.test(nm)?'шт':'порц',o=m.get(key);
if(o){o.n+=qty>0?qty:0;if(nt&&o.nt.indexOf(nt)<0)o.nt=(o.nt?o.nt+'; ':'')+nt;continue}m.set(key,{key,t:nm,n:qty>0?qty:0,u,sv,nt,raw:qty>0?'':rq})}
return[...m.values()].map(d=>({key:d.key,t:d.t,sv:d.sv,nt:d.nt.slice(0,120),q:d.n>0?(Math.round(d.n*100)/100)+' '+d.u:d.raw}))}
// 9.9.1: блюда предзаказа попадают в «Заготовки» банкета сами (без кнопки). Блюдо, удалённое шефом, помечается в prepMeta/<день>/px и больше не возвращается.
function preAdd(b,force){const have=(DATA.prep||{})[pd]||{},px=((DATA.prepMeta||{})[pd]||{}).px||{},pid=String(b.id).replace(/^pre_/,'');let n=0;
preDishes(b).forEach((d,i)=>{if(have[d.key])return;if(!force&&(px[d.key]||PRA[pd+d.key]))return;PRA[pd+d.key]=1;const v=d.sv||b.time||'';
mut('PUT',`prep/${pd}/${d.key}`,{t:d.t,q:d.q,g:'banq',bq:b.id,k:'other',ks:'auto',c:Date.now()+i,src:'pre',pid,...(d.nt?{pn:d.nt}:{}),...(v?{sv:v,svs:v}:{})});if(px[d.key])mut('DELETE',`prepMeta/${pd}/px/${d.key}`);n++});return n}
function autoPre(){if(isObs()||DEMO||!DB||tab!=='prep'||rangePend())return;
if(!String(MV.prep||'').startsWith('prep/'+pd+'|')||!String(MV.prepMeta||'').startsWith('prepMeta/'+pd+'|'))return;
let n=0;bqList(pd).forEach(b=>{if(b.src==='pre'&&b.pi)n+=preAdd(b,0)});if(n){try{rPrep()}catch(e){}}}
// 9.9.2: мгновенная связь с сайтом предзаказов. Адрес Worker берётся из публичного access/w (его пишет сам Worker); сайт предзаказов «толкает» Worker сразу после сохранения, а здесь — страховка при открытых «Заготовках».
const preLoadW=async()=>{if(DEMO||!DB||!navigator.onLine)return;try{const w=await jget('access/w');if(typeof w==='string'&&/^https:\/\/[A-Za-z0-9][A-Za-z0-9.-]{2,100}$/.test(w)&&w!==PREW){PREW=w;LS.set('vip3-pw',w)}}catch(e){}};
const preSync=()=>{if(DEMO||!PREW||!navigator.onLine||Date.now()-PRK<2e4)return;PRK=Date.now();try{fetch(PREW+'/presync',{method:'POST',mode:'no-cors',keepalive:true}).catch(()=>{})}catch(e){}};
setInterval(()=>{if(!document.hidden&&tab==='prep')preSync()},3e4);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&tab==='prep')preSync()});setTimeout(async()=>{await preLoadW();if(tab==='prep')preSync()},3200);
// 9.9.2: «приготовлено частично» — сделано 10 из 20, остаток виден в списке, в сообщении и переносится на следующий день
const qtyN=(t,d)=>{const m=String(qtyText(t,d||pd)||'').match(/^\s*(\d+(?:[.,]\d+)?)\s*(.*)$/);const n=m?Number(m[1].replace(',','.')):0;return n>0?{n,u:(m[2]||'').trim()}:null};
const r2q=v=>Math.round(v*100)/100;
const dqPart=(t,d)=>{if(!t||t.done||!(t.dq>0))return null;const q=qtyN(t,d);if(!q)return null;const dq=Math.min(Number(t.dq),q.n);return{n:q.n,u:q.u,dq,rem:r2q(Math.max(0,q.n-dq)),pc:Math.round(dq/q.n*100)}};
const qtyLeft=(t,d)=>{const p=dqPart(t,d);return p?`осталось ${fmtQ(p.rem)}${p.u?' '+p.u:''} из ${fmtQ(p.n)}${p.u?' '+p.u:''}`:qtyText(t,d)};
const qpillP=t=>{const p=dqPart(t,pd);if(p)return `<i class="qpill part" data-a="dqopen" data-id="${t.id}" role="button" aria-label="Приготовлено ${fmtQ(p.dq)} из ${fmtQ(p.n)}">${fmtQ(p.dq)}/${fmtQ(p.n)}${p.u?' '+esc(p.u):''}</i><span class="dqr">осталось ${fmtQ(p.rem)}</span><span class="dqb"><i style="width:${p.pc}%"></i></span>`;
if(!t.done&&!isSv(t)&&qtyN(t,pd))return `<i class="qpill act" data-a="dqopen" data-id="${t.id}" role="button" aria-label="Отметить, сколько приготовлено">${esc(qtyText(t,pd))}</i>`;return qpill(t,pd)};
const cqf=(t,prev)=>{const p=dqPart(t,prev);return p?{q:`${fmtQ(p.rem)} ${p.u}`.trim()}:{q:t.q||'',...(t.pg?{pg:t.pg,pu:t.pu}:{})}};
let dqS=null;const dqStep=u=>/^(кг|л|kg|l)\b/i.test(u||'')?0.5:1,dqVal=()=>{const v=Number(String($('#dqv').value).replace(',','.'));return isFinite(v)?v:0};
const dqUi=()=>{if(!dqS)return;let v=Math.max(0,Math.min(dqS.n,dqVal()));const rem=r2q(dqS.n-v);$('#dqfill').style.width=Math.round(v/dqS.n*100)+'%';$('#dqr').innerHTML=v>=dqS.n?'✓ Всё готово — заготовка закроется':v<=0?'Ничего не отмечено':`Осталось приготовить: <b>${fmtQ(rem)}${dqS.u?' '+esc(dqS.u):''}</b>`};
{const dv=$('#dqv');if(dv)dv.addEventListener('input',dqUi)}
const pxMark=(id,t)=>{if(t&&t.src==='pre'&&t.pid&&/^pre_/.test(id))mut('PUT',`prepMeta/${pd}/px/${id}`,1)};
Object.assign(ACT,{
dqopen(id){const t=dm()[id];if(!t||t.done||isSv(t))return;const q=qtyN(t,pd);if(!q||!$('#ddq'))return ACT.tkopen(id);const cur=t.dq>0?Math.min(Number(t.dq),q.n):0;dqS={id,n:q.n,u:q.u,st:dqStep(q.u)};$('#dqh').textContent=t.t;$('#dqn').textContent=`Нужно: ${fmtQ(q.n)}${q.u?' '+q.u:''}`+(t.dq>0&&t.dqb&&t.dqa?` · последняя отметка: ${t.dqb.n}, ${tm(t.dqa)}`:'');$('#dqu').textContent=q.u||'';$('#dqv').value=cur?fmtQ(cur):'';
$('#dqch').innerHTML=[[.25,'¼'],[.5,'½'],[.75,'¾'],[1,'Всё']].map(([f,l])=>`<button class="chip" data-a="dqset" data-id="${f}">${l}</button>`).join('')+'<button class="chip" data-a="dqset" data-id="0">Сбросить</button>';dqUi();open('#ddq');setTimeout(()=>{try{$('#dqv').focus();$('#dqv').select()}catch(e){}},80);snd.tap()},
dqinc(){if(!dqS)return;$('#dqv').value=fmtQ(Math.min(dqS.n,r2q(dqVal()+dqS.st)));dqUi();snd.tap()},
dqdec(){if(!dqS)return;$('#dqv').value=fmtQ(Math.max(0,r2q(dqVal()-dqS.st)));dqUi();snd.tap()},
dqset(f){if(!dqS)return;f=Number(f);const v=f>=1?dqS.n:f<=0?0:Math.min(dqS.n,Math.round(dqS.n*f/dqS.st)*dqS.st);$('#dqv').value=v?fmtQ(r2q(v)):'';dqUi();snd.tap()},
dqedit(){if(!dqS)return;const id=dqS.id;$('#ddq').close();ACT.tkopen(id)},
dqsave(){if(!dqS)return;const t=dm()[dqS.id];if(!t||t.done){$('#ddq').close();return}let v=Math.max(0,Math.min(dqS.n,dqVal()));const id=dqS.id,p=`prep/${pd}/${id}`;
if(v<=0){if(t.dq>0)mut('PATCH',p,{dq:null,dqa:null,dqb:null});$('#ddq').close();snd.tap();return}
const w=t.by||L.me;if(!w){snd.warn();vib(80);toast('Сначала выберите повара: справа в строке или вверху «Я работаю»');return}
if(v>=dqS.n){justDone.add(id);mut('PATCH',p,{done:true,by:{id:w.id,n:w.n},at:Date.now(),dq:null,dqa:null,dqb:null});rememberPrep(t,w);snd.ok();vib(30);toast('✓ Готово полностью')}
else{mut('PATCH',p,{dq:r2q(v),dqa:Date.now(),dqb:{id:w.id,n:w.n}});snd.ok();toast(`✓ Приготовлено ${fmtQ(r2q(v))} из ${fmtQ(dqS.n)} · осталось ${fmtQ(r2q(dqS.n-v))}`)}
$('#ddq').close()},
whoobs(){whoDone();try{$('#dwho').close()}catch(e){}ACT.loginrole('obs');$('#ap').value='';$('#da').showModal();setTimeout(()=>{try{$('#ap').focus()}catch(e){}},60);snd.tap()},
async pidgo(){const P=PIDW;if(!P)return;const pw=String($('#pidv').value||'').trim();if(!pw){snd.warn();return}if(Date.now()<P.lock){$('#pide').textContent='Подождите немного и повторите';return}
if(!(window.crypto&&crypto.subtle)){$('#pide').textContent='Браузер не поддерживает защищённый вход';return}
$('#pidgo').disabled=true;try{const key=await acctKey(P.id,pw),d=await jget('acct/'+key);if(PIDW!==P)return;
if(d&&d.n){const m=IDKS();m[P.id]=key;LS.set('vip3-idk',m);PIDW=null;$('#dpid').onclose=null;$('#dpid').close();snd.ok();vib(25);P.res(true);return}
P.fail++;vib(120);snd.warn();$('#pide').textContent='Неверный пароль';if(P.fail>=5){P.lock=Date.now()+3e4;P.fail=0;$('#pide').textContent='Слишком много попыток — подождите 30 секунд'}try{$('#pidv').select()}catch(e){}}
catch(e){snd.warn();$('#pide').textContent='Нет связи — проверить пароль не удалось'}finally{if(PIDW===P)$('#pidgo').disabled=false}},
pidno(){snd.tap();const P=PIDW;PIDW=null;try{$('#dpid').onclose=null;$('#dpid').close()}catch(e){}if(P)P.res(false)},
trload(){snd.tap();trLoad(true)},
async trrest(k){if(!isAdmin())return need();const a=trGroups().get(k);if(!a)return;const ex=a.filter(x=>atPath(x.p)!=null);
if(ex.length&&!await ask('Заменить существующее?',`<p>${ex.length>1?'Часть данных':'Эта запись'} уже есть на месте. Вернуть из корзины и заменить?</p>`,'Да, вернуть','Нет'))return;
let n=0;for(const x of a){let v;try{v=JSON.parse(x.v)}catch(e){continue}if(v===null||v===undefined)continue;mut0('PUT',x.p,v);mut0('DELETE','trash/'+x.id);n++}
TR.list=TR.list.filter(x=>!a.includes(x));rTr();snd.ok();toast(n?'✓ Восстановлено: '+n:'Не удалось восстановить');try{rAll()}catch(e){}},
async trdel(k){if(!isAdmin())return need();const a=trGroups().get(k);if(!a)return;if(!await ask('Убрать из корзины?',`<p>${esc(a[0].d||'')}</p><p class="small">Запись исчезнет навсегда.</p>`,'Да, убрать','Нет'))return;
a.forEach(x=>mut0('DELETE','trash/'+x.id));TR.list=TR.list.filter(x=>!a.includes(x));rTr();snd.warn()},
trparse(){if(!isAdmin())return need();const t=($('#trmsg')||{}).value||'',l=parseOrders(t);rTrPv(l,'Найдено в тексте: '+l.length);snd.tap()},
trfile(){if(!isAdmin())return need();const f=$('#trfi');if(f){f.value='';f.click()}},
trapply(){if(!isAdmin())return need();const a=TR.parsed;if(!a.length)return;a.forEach(o=>mut('PUT','orders/'+o.id,o));TR.parsed=[];const n=a.length;const el=$('#trpv');if(el)el.innerHTML='<div class="small">✓ Возвращено заказов: '+n+'. Они в «История заказов».</div>';const tx=$('#trmsg');if(tx)tx.value='';snd.ok();toast('✓ Заказы возвращены: '+n);try{rAll()}catch(e){}},
prefill(id){if(isObs())return need();const b=bqFind(pd,String(id));if(!b||b.src!=='pre')return;const n=preAdd(b,1);
snd.ok();toast(n?'✓ Блюда добавлены в «Заготовки»: '+n:'Все блюда уже в списке');try{rPrep()}catch(e){}}});
['whopick','pick','me'].forEach(n=>{const f=ACT[n];if(typeof f!=='function')return;ACT[n]=function(id,...r){const kk=team().find(x=>x.id===id);if(kk&&kk.ch&&!isAdmin()&&!DEMO){snd.warn();toast('Имя шефа — только по паролю руководителя');try{$('#dwho').close()}catch(e){}ACT.loginrole('adm');$('#ap').value='';$('#da').showModal();setTimeout(()=>{try{$('#ap').focus()}catch(e){}},60);return}if(needPw(id)){idAsk(id).then(ok=>{if(ok)f.call(ACT,id,...r)});return}return f.call(ACT,id,...r)}});
{const f=ACT.admin;ACT.admin=function(...r){const x=f.apply(ACT,r);try{if(isAdmin())trLoad(true)}catch(e){}return x}}
on('#sdck','change',()=>ACT.sdcook());
on('#pidf','submit',e=>{e.preventDefault();ACT.pidgo()});
on('#adR','toggle',()=>{const d=$('#adR');if(d&&d.open)trLoad(true)});
on('#trfi','change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(f.size>40e6){toast('Файл слишком большой');return}
try{const j=JSON.parse(await f.text()),od=j&&j.data&&j.data.orders;if(!od||typeof od!=='object'){toast('В файле нет заказов');return}
const have=DATA.orders||{},l=Object.entries(od).filter(([id,o])=>o&&typeof o==='object'&&o.id&&o.cook&&o.date&&RXD.test(o.date)&&/^[A-Za-z0-9_-]{1,40}$/.test(id)).map(([id,o])=>({dup:!!have[id],o:{...o,id}}));
rTrPv(l,`В файле заказов: ${l.length} · уже есть в базе: ${l.filter(x=>x.dup).length}`)}catch(er){toast('Не удалось прочитать файл')}});
setTimeout(()=>{try{idChk()}catch(e){}},4500);
setTimeout(()=>{try{pwMig()}catch(e){}},6500);
addEventListener('visibilitychange',()=>{if(!document.hidden){try{idChk()}catch(e){}}});
const PHRE=/^\+?[0-9 ()\-]{5,20}$/,TGEV=[['sh','⏰ Смена на завтра'],['bq','🎉 Банкет'],['od','🧾 Новый заказ'],['al','⚠ Для шефа']];
const tgLink=id=>TGB?`https://t.me/${TGB}${id&&id!=='join'&&/^[A-Za-z0-9_-]{1,60}$/.test(id)?'?start=c_'+id:''}`:'';
async function ctLoad(force){if(!isAdmin()||DEMO||!DB||CT.busy)return;if(!force&&Date.now()-CT.t<15e3)return;CT.busy=1;const bad=[],g=async n=>{try{return(await jget(n,'',true))||{}}catch(e){bad.push(n+(e&&e.status?' '+e.status:''));return null}};
let c=null,d=null,n=null;try{[c,d,n]=await Promise.all([g('contacts'),g('devices'),g('notify')])}catch(e){}CT.busy=0;CT.t=Date.now();CT.bad=bad.join(', ');if(c)CT.c=c;if(d)CT.d=d;if(n)CT.n=n;
try{const inf=(CT.n&&CT.n.info)||{};if(inf.bot&&/^[A-Za-z0-9_]{3,40}$/.test(inf.bot)&&inf.bot!==TGB){TGB=inf.bot;LS.set('vip3-tgbot',TGB)}}catch(e){}rTg()};
const tgBotLoad=async()=>{if(DEMO||!DB||!navigator.onLine)return;try{const i=await jget('notify/info');if(i&&/^[A-Za-z0-9_]{3,40}$/.test(String(i.bot||''))&&i.bot!==TGB){TGB=i.bot;LS.set('vip3-tgbot',TGB);try{rMeBox()}catch(e){}}if(i){const w=typeof i.w==='string'&&/^https:\/\/[A-Za-z0-9][A-Za-z0-9.-]{2,100}$/.test(i.w)?i.w:'';if(w!==TGW){TGW=w;LS.set('vip3-tgw',w)}if(w&&w!==PREW&&isAdmin()){PREW=w;LS.set('vip3-pw',w);mut('PUT','access/w',w)}}}catch(e){}};
const tgOut=async(to,x)=>{try{await api('PUT','notify/outbox/m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),{to,x:String(x).slice(0,900),t:Date.now()});tgPoke();snd.ok();toast(TGW?'✓ Отправляется в Telegram…':'✓ В очереди. Бот отправит в течение нескольких минут');return 1}catch(e){snd.warn();toast(e&&(e.status===401||e.status===403)?'Нет доступа: сначала опубликуйте новые правила Firebase':'Не удалось отправить. Проверьте интернет');return 0}};
function rTg(){const el=$('#tgbox'),st=$('#tgst'),sm=$('#adsG');if(!el)return;const fa=document.activeElement;if(fa&&el.contains(fa)&&/^(INPUT|TEXTAREA)$/.test(fa.tagName))return;
const C=CT.c||{},N=CT.n||{},D=CT.d||{},info=N.info||{},cfg=N.cfg||{},chats=C.chats||{},phs=C.phones||{},grp=C.group,inb=C.inbox||{},k=team(),ids=new Set(k.map(x=>x.id));
const dvs=Object.values(D).filter(v=>v&&typeof v==='object'&&v.t),dvOf=id=>dvs.filter(v=>v.c&&v.c.id===id).sort((x,y)=>y.t-x.t)[0],dvLine=v=>`📱 ${esc(v.u||'?')} · v${esc(v.v||'?')} · ${esc(agoD(v.t))}${v.v&&v.v!==VER?' · <b>⚠ старая версия</b>':''}${v.q>0?' · <b>⚠ не отправлено: '+(+v.q)+'</b>':''}`;
const chOf=id=>Object.entries(chats).filter(([,v])=>v&&v.k===id).map(([tid,v])=>({tid,...v}));
let on=0;
const rows=k.map(c=>{const ch=chOf(c.id),ph=String(phs[c.id]||''),dv=dvOf(c.id);if(ch.length)on++;
return `<div class="tgc"><div class="tgh"><i class="lvd" style="--c:${cookColor(c.id)}"></i><b>${esc(c.n)}</b><small>${esc(c.r)}</small><span class="tgs ${ch.length?'ok':'no'}">${ch.length?'✈️ '+(ch[0].u?'@'+esc(ch[0].u):esc(ch[0].n||'подключён')):'Telegram не подключён'}</span></div>`+
`<input class="tgph" type="tel" inputmode="tel" data-id="${esc(c.id)}" value="${esc(ph)}" placeholder="Телефон: +7 900 123-45-67" autocomplete="off" aria-label="Телефон: ${esc(c.n)}">`+
`<div class="acts" style="margin-top:6px">${ph&&PHRE.test(ph)?`<a class="tgl" href="tel:${esc(ph.replace(/[^\d+]/g,''))}">📞 Позвонить</a>`:''}${ch.map(z=>`<button class="g" data-a="tgunlink" data-id="${esc(z.tid)}">Отвязать Telegram</button>`).join('')}</div>`+
`<div class="small">${dv?dvLine(dv):'Телефон пока не заходил в версию 9.5'}</div></div>`}).join('');
const free=Object.entries(chats).filter(([,v])=>v&&!ids.has(v.k)).map(([tid,v])=>`<div class="tgc"><div class="tgh"><b>${esc(v.n||'?')}</b>${v.u?'<small>@'+esc(v.u)+'</small>':''}<span class="tgs no">без привязки</span></div><div class="acts" style="margin-top:0"><button class="g" data-a="tgunlink" data-id="${esc(tid)}">Убрать</button></div></div>`).join('');
const oth=dvs.filter(v=>!(v.c&&ids.has(v.c.id))).sort((x,y)=>y.t-x.t).slice(0,8).map(v=>`<div class="small" style="margin:4px 0">${dvLine(v)}${v.c&&v.c.n?' · '+esc(v.c.n):''}</div>`).join('');
const inbL=Object.entries(inb).filter(([,v])=>v&&v.x).map(([id,v])=>({id,...v})).sort((x,y)=>(y.t||0)-(x.t||0)).slice(0,15);
const stale=info.t&&Date.now()-info.t>30*6e4;
let s='';if(CT.bad)s+=`<div class="tgw">⚠ Не прочитано: ${esc(CT.bad)}. Если там 401 или 403 — опубликуйте новые правила (файл firebase-rules.json) и войдите заново.</div>`;
s+=!info.t?'<div class="tgw">Бот ещё не запускался. Откройте файл BOT-AR.md и выполните шаги.</div>':`<div class="${stale?'tgw':'small'}">${stale?'⚠ ':''}✈️ @${esc(info.bot||'?')} · последний запуск ${esc(agoD(info.t))}${info.w?' · ⚡ мгновенный режим':''}${stale?(info.w?'. Бот давно не отвечает — проверьте Cloudflare → Workers.':'. Бот давно не запускался — проверьте GitHub → Actions.'):''}</div>`;
{const pr=(N.pre||{}).info;if(pr&&pr.t){const bad=!!pr.err,old=Date.now()-pr.t>15*6e4;s+=`<div class="${bad||old?'tgw':'small'}">🔗 Предзаказы: ${bad?'ошибка — '+esc(String(pr.err).slice(0,150)):'найдено '+(+pr.n||0)+' · обновлено '+esc(agoD(pr.t))+(old?' (давно — проверьте Cloudflare → Workers)':'')+(+pr.n?(pr.k?'<br>🕐 Время в первом заказе: '+esc(String(pr.k).split(' | ')[0].replace(/^time=/,'')):''):'. Если заказы есть, а здесь 0 — сообщите разработчику поля: '+esc(String(pr.k||'—')))}</div>`}else if(info.w)s+='<div class="small">🔗 Предзаказы: не подключены (в Worker нет секрета PRE_PASSWORD)</div>'}
s+=grp&&grp.id?`<div class="small">👥 Группа: <b>${esc(grp.n||'подключена')}</b></div>`:'<div class="tgw">Группа не подключена: добавьте бота в группу и напишите там /group</div>';
if(N.err&&N.err.m)s+=`<div class="tgw">Последняя ошибка бота (${esc(agoD(N.err.t))}): ${esc(String(N.err.m).slice(0,200))}</div>`;
if(st)st.innerHTML=s;if(sm)sm.textContent=CT.c?(on+'/'+k.length+' в Telegram'):'';
const keep=($('#tgmsg')||{}).value||'';
el.innerHTML=`<div class="lbl f">Что присылать</div><div class="chips wrap">${TGEV.map(([id,t])=>`<button class="chip tgx${cfg[id]===0?'':' on'}" data-a="tgev" data-id="${id}" aria-pressed="${cfg[id]===0?'false':'true'}">${t}</button>`).join('')}</div>`+
(TGB?`<div class="lbl f">Ссылка для команды</div><div class="small" style="word-break:break-all">${esc(tgLink('join'))}</div><div class="acts" style="margin-top:6px"><button data-a="tgcopy">Скопировать ссылку</button></div>`:'')+
`<div class="lbl f">Повара</div>${rows||'<div class="small">Повара не добавлены.</div>'}${free?`<div class="lbl f">Telegram без привязки к повару</div>${free}`:''}${oth?`<div class="lbl f">Другие устройства</div>${oth}`:''}`+
`<div class="lbl f">Сообщение команде</div><textarea id="tgmsg" rows="2" maxlength="900" placeholder="Текст для группы в Telegram"></textarea><div class="acts"><button class="p" data-a="tgsend">📣 Отправить в группу</button><button data-a="tgtest">Тест</button></div>`+
`<div class="lbl f">Сообщения от поваров</div>${inbL.length?inbL.map(m=>`<div class="tgm"><div class="tgmh"><b>${esc(m.n||'?')}</b><small>${esc(agoD(m.t))}</small></div><div>${esc(m.x)}</div></div>`).join('')+'<div class="acts"><button class="d" data-a="tgclr">Очистить сообщения</button></div>':'<div class="small">Повара могут писать боту в личку — сообщения сохранятся здесь и придут вам в Telegram.</div>'}`+
`<div class="acts"><button data-a="tgref">↻ Обновить</button></div>`;
const m2=$('#tgmsg');if(m2&&keep)m2.value=keep};
const rBk=()=>{const e=$('#bkinfo'),s=$('#adsK'),t=$('#txinfo'),x=$('#errinfo');if(!e)return;const dd=bkDays(),old=dd<0||dd>7;
e.textContent=(old?'⚠ ':'')+(dd<0?'Копия ещё не делалась':dd===0?'Последняя копия: сегодня':'Последняя копия: '+dd+' дн. назад')+'. Файл можно сохранить в «Файлы» или отправить себе в Telegram.';e.classList.toggle('bkw',old);
if(s)s.textContent=old?'⚠ сделайте копию':'';
if(t)t.textContent='Сегодня скачано примерно '+txFmt()+' (оценка до сжатия, только этот телефон). Бесплатный лимит Firebase — 10 ГБ в месяц на все телефоны вместе.';
if(x)x.textContent='На этом телефоне записано ошибок: '+ERRS.length+'. Журнал всех телефонов — кнопка «Показать».'};
const bkNag=()=>{if(!isAdmin())return;const dd=bkDays();if(dd>=0&&dd<=7)return;const td=txDay();if(LS.get('vip3-bkn','')===td)return;LS.set('vip3-bkn',td);setTimeout(()=>toast(dd<0?'💾 Сделайте первую резервную копию: Админ-панель → Данные и копия':'💾 Копия не делалась '+dd+' дн.: Админ-панель → Данные и копия'),3200)};
const errFmt=d=>{const rows=[];Object.entries(d||{}).forEach(([dev,o])=>{if(o&&typeof o==='object')Object.values(o).forEach(x=>{if(x&&typeof x==='object'&&x.t)rows.push({dev,...x})})});rows.sort((a,b)=>b.t-a.t);if(!rows.length)return'Ошибок нет 👍';
return rows.slice(0,60).map(x=>new Date(x.t).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+' · v'+(x.v||'?')+' · '+(x.k||'?')+' · '+(x.w||'?')+(x.n>1?' · ×'+x.n:'')+' · …'+String(x.dev).slice(-4)+'\n  '+x.m+(x.s?'  ('+x.s+')':'')).join('\n')};
const pruneMeta=async()=>{if(DEMO||!DB||!navigator.onLine||document.hidden)return;const last=Number(LS.get('vip3-prune',0))||0;if(Date.now()-last<20*36e5)return;const meta=DATA.meta||{};if(!Object.keys(meta).length)return;
const cut=dAdd(-45),now=Date.now(),del={};
Object.keys(meta).forEach(k=>{const m=/^(?:prep|prepMeta|writeoffs|shifts)_(\d{4}-\d{2}-\d{2})$/.exec(k);if(m&&m[1]<cut)del[k]=null});
for(const key of['live','pres']){const lv=meta[key];if(lv&&typeof lv==='object')Object.keys(lv).forEach(k=>{const v=lv[k];if(!v||typeof v!=='object'||now-(Number(v.t)||0)>864e5)del[key+'/'+k]=null})}
const ks=Object.keys(del);if(!ks.length){LS.set('vip3-prune',now);return}
try{for(let i=0;i<ks.length;i+=100){const part={};ks.slice(i,i+100).forEach(k=>part[k]=null);await api('PATCH','meta',part)}
ks.forEach(k=>{const m=/^(live|pres)\/(.+)$/.exec(k);if(m){if(DATA.meta&&DATA.meta[m[1]])delete DATA.meta[m[1]][m[2]]}else if(DATA.meta)delete DATA.meta[k]});LS.set('vip3-prune',now)}catch(e){if(e&&[400,401,403,404].includes(e.status))LS.set('vip3-prune',now)}};
const EMO=['🥩','🍗','🥓','🐟','🦐','🥚','🧀','🥛','🥬','🥕','🍅','🧅','🍄','🍎','🍋','🌶️','🧂','🫒','🍞','🥐','🍝','🍚','🥫','🍰','🍦','🍫','🥤','🍹','🍺','☕','🧴','🥡','🍢','🍔','🍕','🌯','🥗','🍲','🔥','📦'],emoH=a=>EMO.map(e=>`<button type="button" data-a="${a}" data-id="${e}" aria-label="${e}">${e}</button>`).join('');{const ga=$('#gemo'),gc=$('#cemo');if(ga)ga.innerHTML=emoH('emog');if(gc)gc.innerHTML=emoH('emoc')}
try{const u=$('#qu');if(u){const v=String(LS.get('vip3-qu','')||'');if(v&&[...u.options].some(o=>o.value===v||o.text===v))u.value=v;u.addEventListener('change',()=>LS.set('vip3-qu',u.value))}}catch(e){errAdd(e&&e.message,'init')}
try{fixDraftDate(true)}catch(e){errAdd(e&&e.message,'init')}try{syncDraft()}catch(e){errAdd(e&&e.message,'init')}try{rAll()}catch(e){errAdd(e&&e.message,'rAll')}setSt();try{placeInd()}catch(e){errAdd(e&&e.message,'init')}addEventListener('load',placeInd);addEventListener('resize',placeInd);addEventListener('orientationchange',()=>setTimeout(placeInd,200));Promise.resolve().then(()=>{streams();flush();carryAll(true);if(!DBV)detect().then(()=>setSt())});
L.hold=(L.hold||[]).filter(o=>!o.at||Date.now()-o.at<3*864e5);if(L.hold.length){L.out.push(...L.hold.splice(0));saveL()}
{const g=$('#dwho');if(g)g.addEventListener('cancel',e=>e.preventDefault());document.addEventListener('visibilitychange',()=>{if(document.hidden)whoHidAt=Date.now();else if(whoHidAt&&Date.now()-whoHidAt>30*6e4){try{sessionStorage.removeItem('vip3-who')}catch{}whoOpen()}});if(whoNeeded())whoOpen()}
if(AU.rt&&!DEMO)tok().then(()=>{epCheck(1);ensureTeamColors();try{bkNag()}catch(e){}ui();try{obsTick(true);apLoad(true)}catch(e){}if(L.out.length){retryAt=0;flush()}}).catch(()=>{if(!AU.rt&&LS.get('vip3-was','')){toast('Сессия закончилась — войдите снова');try{ACT.admin()}catch(e){}}});setInterval(()=>{if(!document.hidden)rSync()},2000);setInterval(()=>{try{liveBeat();presBeat();devSend();liveCheck();presCheck();if(tab==='order')rLive()}catch(e){}},6e4);setInterval(()=>{try{presCheck()}catch(e){}},2e4);setTimeout(()=>{try{presSend(true);devSend();tgBotLoad()}catch(e){}},7e3);setInterval(()=>{try{tgBotLoad();if(isAdmin()&&dialogOpen('#dt')&&$('#adG').open)ctLoad()}catch(e){}},216e5);setInterval(()=>{try{if(isAdmin()&&dialogOpen('#dt')&&$('#adG').open&&!document.hidden)ctLoad()}catch(e){}},3e4);{const g=$('#adG');if(g)g.addEventListener('toggle',()=>{if(g.open)ctLoad(true)})}{const b=$('#tgbox');if(b)b.addEventListener('change',async e=>{const t=e.target;if(!t||!t.classList||!t.classList.contains('tgph')||!isAdmin())return;const id=t.dataset.id,v=t.value.trim();if(!/^[\w-]{1,60}$/.test(id||''))return;if(v&&!PHRE.test(v)){snd.warn();toast('Телефон, например: +7 900 123-45-67');return}try{if(v)await api('PUT','contacts/phones/'+id,v);else await api('DELETE','contacts/phones/'+id);const c=CT.c||(CT.c={}),p=c.phones||(c.phones={});if(v)p[id]=v;else delete p[id];snd.ok();toast(v?'✓ Телефон сохранён':'Телефон удалён');rTg()}catch(er){snd.warn();toast('Не удалось сохранить телефон')}})}
setTimeout(pruneMeta,2e4+Math.random()*2e4);setInterval(pruneMeta,18e5);try{if(ERRS.length&&ERRS.some(x=>x.t>(Number(LS.get('vip3-errsent',0))||0)))errSoon()}catch(e){}
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

window.__vipBoot=1;
})();


if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){const had=!!navigator.serviceWorker.controller;addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!had||window.__rl)return;window.__rl=1;const idle=()=>document.hidden||(!document.querySelector('dialog[open]')&&!/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||''));if(idle()){location.reload();return}const t=setInterval(()=>{if(idle()){clearInterval(t);location.reload()}},1500)})}


