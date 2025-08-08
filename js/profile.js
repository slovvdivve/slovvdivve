const { state } = window.__edq__;
const { drawBars } = window.__charts__ || {};

function pct(x){ return x.total? Math.round(x.correct/x.total*100):0 }

function renderProfilePage(){
  const lv=document.getElementById('pfLevel'); if(!lv) return;
  const need=100+(state.profile.level-1)*50;
  lv.textContent=state.profile.level;
  document.getElementById('pfXp').textContent=Math.floor(state.profile.xp)+' / '+need;
  document.getElementById('pfCoins').textContent=state.profile.coins;

  const total=(state.subjects.math.total+state.subjects.russian.total+state.subjects.physics.total)||1;
  const corr=(state.subjects.math.correct+state.subjects.russian.correct+state.subjects.physics.correct);
  document.getElementById('pfAcc').textContent=Math.round(corr/total*100)+'%';
  document.getElementById('pfMaxStreak').textContent=state.profile.maxStreak;
  document.getElementById('pfSolved').textContent=state.profile.solved;

  drawBars?.('chartSubjects', [
    ['Математика', pct(state.subjects.math)],
    ['Русский', pct(state.subjects.russian)],
    ['Физика', pct(state.subjects.physics)]
  ]);
}
window.addEventListener('load', renderProfilePage);
