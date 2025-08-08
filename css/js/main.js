// === Общие утилиты, состояние и навигация между страницами ===
const DB='edquest.v913';
const Save={
  load(){ try{ return JSON.parse(localStorage.getItem(DB))||null }catch(e){ return null } },
  save(s){ localStorage.setItem(DB, JSON.stringify(s)) }
};
const init=()=>({
  profile:{level:1,xp:0,xpHist:[],coins:0,maxStreak:0,solved:0,acc:0},
  session:{round:0,correct:0,total:0,streak:0,times:[],accHist:[],xpGain:0,subjects:{math:0,russian:0,physics:0}},
  subjects:{math:{correct:0,total:0},russian:{correct:0,total:0},physics:{correct:0,total:0}},
  referrals:{code:code(),count:0,xp:0,coins:0,used:[]},
  shop:{owned:[]},
  ui:{scale:1}
});
let state = Save.load() || init();

function code(){ return Math.random().toString(36).slice(2,7).toUpperCase() }
function toast(msg){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; t.style.display='none'; document.body.appendChild(t); }
  t.textContent=msg; t.style.display='block'; clearTimeout(toast._t);
  toast._t=setTimeout(()=> t.style.display='none', 2200);
}

function addXP(n){
  state.profile.xp+=n; state.session.xpGain+=n;
  while(state.profile.xp>=(100+(state.profile.level-1)*50)){
    state.profile.xp-=(100+(state.profile.level-1)*50);
    state.profile.level++; addCoins(20);
  }
  Save.save(state); updSide();
}
function addCoins(n){ state.profile.coins+=n; Save.save(state); updSide(); }

function updSide(){
  const lvl=document.getElementById('uiLevel');
  const coins=document.getElementById('uiCoins');
  const fill=document.getElementById('uiXpFill');
  if(lvl) lvl.textContent=state.profile.level;
  if(coins) coins.textContent=state.profile.coins;
  if(fill){
    const need=100+(state.profile.level-1)*50;
    const pct=Math.max(2, Math.round(state.profile.xp/need*100));
    fill.style.width=pct+'%';
  }
}
updSide();

// Сайдбар + док: активная ссылка по текущему location
(function highlightNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  const map = {
    'index.html':'home','game.html':'game','profile.html':'profile',
    'store.html':'store','referrals.html':'ref','settings.html':'settings','help.html':'help'
  };
  document.querySelectorAll('.nav a').forEach(a=>{
    const key=a.getAttribute('data-key');
    if((key==='home' && path==='index.html') || key===map[path]) a.classList.add('active');
  });
  document.querySelectorAll('.dock a').forEach(a=>{
    const key=a.getAttribute('data-key');
    if((key==='home' && path==='index.html') || key===map[path]) a.classList.add('active');
  });
})();

// Клик по логотипу -> главная
document.getElementById('logoLink')?.addEventListener('click', e=>{
  e.preventDefault(); location.href='index.html';
});

// Масштаб UI из настроек
document.documentElement.style.fontSize = (16*(state.ui.scale||1))+'px';

// Экспорт для других скриптов (без модулей)
window.__edq__ = { state, Save, addXP, addCoins, toast, updSide };
