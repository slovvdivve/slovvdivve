// Простейшие канвас-чарты с нулевой базовой линией при пустых данных
function drawLine(id,arr,label){
  const c=document.getElementById(id); if(!c) return;
  const x=c.getContext('2d');
  c.width=c.clientWidth*devicePixelRatio; c.height=c.clientHeight*devicePixelRatio;
  x.clearRect(0,0,c.width,c.height);
  const pad=10*devicePixelRatio, w=c.width-pad*2, h=c.height-pad*2;

  // подпись
  x.fillStyle='rgba(230,250,255,.9)'; x.font=(12*devicePixelRatio)+'px system-ui';
  x.fillText(label, pad, 14*devicePixelRatio);

  // пусто или 1 точка — рисуем baseline = 0
  if(!arr || arr.length<2){
    const Y = pad + h;
    x.beginPath(); x.moveTo(pad, Y); x.lineTo(pad+w, Y);
    x.strokeStyle='#B9F3FF'; x.lineWidth=3*devicePixelRatio; x.shadowColor='rgba(185,243,255,.45)';
    x.shadowBlur=6*devicePixelRatio; x.stroke(); return;
  }

  const max=Math.max(...arr,100), min=Math.min(...arr,0);
  x.beginPath();
  arr.forEach((v,i)=>{
    const X=pad+i/(arr.length-1)*w;
    const Y=pad+(1-(v-min)/(max-min))*h;
    if(i===0) x.moveTo(X,Y); else x.lineTo(X,Y);
  });
  x.strokeStyle='#B9F3FF'; x.lineWidth=3*devicePixelRatio; x.shadowColor='rgba(185,243,255,.45)';
  x.shadowBlur=6*devicePixelRatio; x.stroke();
}

function drawBars(id,pairs){
  const c=document.getElementById(id); if(!c) return;
  const x=c.getContext('2d');
  c.width=c.clientWidth*devicePixelRatio; c.height=c.clientHeight*devicePixelRatio;
  x.clearRect(0,0,c.width,c.height);
  const pad=16*devicePixelRatio,bw=(c.width-pad*2)/(pairs.length*1.6),maxVal=Math.max(1,...pairs.map(p=>p[1]));
  pairs.forEach((p,i)=>{
    const X=pad+i*bw*1.6; const H=(c.height-pad*2)*(p[1]/maxVal);
    x.fillStyle='#C7FFE8'; x.fillRect(X,c.height-pad-H,bw,H);
    x.fillStyle='rgba(230,250,255,.85)'; x.font=(12*devicePixelRatio)+'px system-ui';
    x.fillText(p[0],X,c.height-4*devicePixelRatio);
  });
}

window.__charts__ = { drawLine, drawBars };
