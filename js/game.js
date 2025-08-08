// Логика игры/сессии + графики сессии
const { state, Save, addXP, addCoins, toast, updSide } = window.__edq__;
const { drawLine, drawBars } = window.__charts__ || {};

const qArea=document.getElementById('questionArea');
const roundNum=document.getElementById('roundNum');
const subjectPill=document.getElementById('subjectPill');

document.getElementById('skipBtn')?.addEventListener('click', nextQuestion);
document.getElementById('nextBtn')?.addEventListener('click', nextQuestion);
document.getElementById('finishBtn')?.addEventListener('click', finishSession);

document.getElementById('startBtn')?.addEventListener('click', ()=>{
  location.href='game.html';
});

function startIfNeeded(){
  if(!qArea) return; // не на странице игры
  if(state.session.total===0 && state.session.round===0){ buildDeck(); nextQuestion(); }
  renderSession();
}
window.addEventListener('load', ()=>{ updSide(); startIfNeeded(); });

// Вопросы
const QUESTIONS=(function(){ const arr=[]; const push=(id,subject,type,text,extra)=>arr.push(Object.assign({id,subject,type,text,xp:10},extra||{}));
for(let i=1;i<=30;i++){
  const m=i%3; if(m===0) push('m'+i,'math','mcq',`(Математика) Найти производную: f(x)=${i+1}x^2`,{choices:['2x','2(x+1)','x^2','x'],answer:0});
  if(m===1) push('m'+i,'math','input',`(Математика) Реши: ${i+1}x - ${i} = 0. x = ?`,{answer:String(i/(i+1))});
  if(m===2) push('m'+i,'math','order','(Математика) Упорядочить по возрастанию',{items:['-2','0','3','1'],answer:['-2','0','1','3']});

  const r=i%3; if(r===0) push('r'+i,'russian','mcq','Найдите слово с проверяемой гласной в корне',{choices:['к...снуться','зар...сли','р...сток','ск...кать'],answer:0});
  if(r===1) push('r'+i,'russian','input','Вставь пропущенные буквы: пр…зидент',{answer:'президент'});
  if(r===2) push('r'+i,'russian','order','Собери правильное предложение',{items:['на','идёт','улице','дождь'],answer:['на','улице','идёт','дождь']});

  const p=i%3; if(p===0) push('p'+i,'physics','mcq','Единица силы в СИ:',{choices:['Джоуль','Паскаль','Ньютон','Ватт'],answer:2});
  if(p===1) push('p'+i,'physics','input','Скорость света ~ 3·10^? м/с. Введи показатель',{answer:'8'});
  if(p===2) push('p'+i,'physics','order','Расположи по возрастанию длины волны',{items:['фиолетовый','зелёный','красный'],answer:['фиолетовый','зелёный','красный']});
  } return arr; })();
let deck=[];
function buildDeck(){ deck=QUESTIONS.slice().sort(()=>Math.random()-.5) }

let qStart=0;
function nextQuestion(){
  const nb=document.getElementById('nextBtn'); if(nb) nb.disabled=true;
  if(deck.length===0) buildDeck();
  const q=deck.shift(); state.session.round++; renderQuestion(q);
}
function renderQuestion(q){
  if(!qArea) return;
  qStart=performance.now();
  if(roundNum) roundNum.textContent=state.session.round;
  if(subjectPill) subjectPill.textContent=({math:'Математика',russian:'Русский',physics:'Физика'}[q.subject]);
  qArea.innerHTML='';

  const t=document.createElement('div'); t.className='title'; t.textContent=q.text; qArea.appendChild(t);

  if(q.type==='mcq'){
    const box=document.createElement('div'); box.className='gridgap';
    q.choices.forEach((c,i)=>{
      const b=document.createElement('div'); b.className='choice'; b.textContent='• '+c;
      b.addEventListener('click',()=>checkAnswer(q,i===q.answer,b,()=>b.classList.add(i===q.answer?'correct':'wrong')));
      box.appendChild(b);
    }); qArea.appendChild(box);

  } else if(q.type==='input'){
    const input=document.createElement('input'); input.className='answer-input'; input.placeholder='Введи ответ…';
    const b=document.createElement('button'); b.className='btn'; b.textContent='Ответить';
    b.addEventListener('click',()=>{ const val=(input.value||'').trim().toLowerCase().replace(',', '.').replace(' ', ''); const ok=String(q.answer).toLowerCase()===val; checkAnswer(q,ok,input,()=> input.style.outline='2px solid '+(ok?'#9CF000':'#ff6b88')); });
    input.addEventListener('keydown',e=>{ if(e.key==='Enter') b.click(); });
    qArea.appendChild(input); qArea.appendChild(b);

  } else { // order
    const list=document.createElement('ul'); list.style.listStyle='none'; list.style.padding='0'; list.className='gridgap';
    q.items.slice().sort(()=>Math.random()-.5).forEach(txt=>{
      const li=document.createElement('li'); li.className='choice'; li.textContent=txt; li.draggable=true;
      li.addEventListener('dragstart',()=>li.classList.add('dragging')); li.addEventListener('dragend',()=>li.classList.remove('dragging'));
      list.appendChild(li);
    });
    list.addEventListener('dragover',e=>{
      e.preventDefault();
      const dragging=list.querySelector('.dragging'); if(!dragging) return;
      const after=[...list.querySelectorAll('.choice:not(.dragging)')].find(el=> e.clientY < el.getBoundingClientRect().top + el.offsetHeight/2);
      if(after) list.insertBefore(dragging,after); else list.appendChild(dragging);
    });
    const b=document.createElement('button'); b.className='btn'; b.textContent='Проверить порядок';
    b.addEventListener('click',()=>{ const arr=[...list.children].map(li=>li.textContent); const ok=JSON.stringify(arr)===JSON.stringify(q.answer); checkAnswer(q,ok,list,()=> list.style.outline='2px solid '+(ok?'#9CF000':'#ff6b88')); });
    qArea.appendChild(list); qArea.appendChild(b);
  }
}

function checkAnswer(q,ok,el,decorate){
  decorate&&decorate(); const elapsed=(performance.now()-qStart)/1000;
  state.session.total++; state.profile.solved++; state.session.times.push(elapsed);

  if(ok){ state.session.correct++; state.session.streak++; addXP(q.xp||10); addCoins(1); state.session.subjects[q.subject]++; toast('Верно! +' + (q.xp||10) + ' XP'); }
  else { state.session.streak=0; }

  state.profile.maxStreak=Math.max(state.profile.maxStreak,state.session.streak);
  state.subjects[q.subject].total++; if(ok) state.subjects[q.subject].correct++;

  const acc=state.session.correct/state.session.total;
  state.session.accHist.push(acc);

  Save.save(state); renderSession();
  const nb=document.getElementById('nextBtn'); if(nb) nb.disabled=false;
}

function renderSession(){
  const acc=state.session.total? Math.round(state.session.correct/state.session.total*100):0;
  const sA=document.getElementById('sessAcc'); if(sA) sA.textContent=acc+'%';
  const sS=document.getElementById('sessStreak'); if(sS) sS.textContent=state.session.streak;
  const sN=document.getElementById('sessSolved'); if(sN) sN.textContent=state.session.total;
  const t=state.session.times.at(-1)||0; const sT=document.getElementById('sessTime'); if(sT) sT.textContent=t.toFixed(1)+'с';

  drawLine?.('chartAcc', state.session.accHist.map(v=>Math.round(v*100)), 'Точность %');
  drawLine?.('chartTime', state.session.times, 'Время (с)');
  updSide();
}

function finishSession(){ toast('Сессия завершена'); location.href='index.html'; }
