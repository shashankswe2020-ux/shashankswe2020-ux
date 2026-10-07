(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e};
const $=id=>document.getElementById(id);
let seed=7;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};

/* ---------- static painting ---------- */
function roofs(g,base,h,fill,op){let x=-10;while(x<1450){const w=50+rnd()*110,hh=h*(.35+rnd()*.8),peak=rnd()>.72;
  el('path',{d:`M${x} 900 V${base-hh} ${peak?`L${x+w/2} ${base-hh-20}`:''} L${x+w-6} ${base-hh+(rnd()*6-3)} V900Z`,fill,opacity:op},g);
  if(rnd()>.65)el('rect',{x:x+12,y:base-hh-22,width:20+rnd()*14,height:22,rx:3,fill,opacity:op},g);x+=w;}}
roofs($('roofsP'),600,150,'#8a6a52',.92); roofs($('roofs6'),300,120,'#1d2640',1);
for(let x=0;x<1440;x+=130)el('path',{d:`M${x} 352 Q${x+65} 450 ${x+130} 352`},$('arches'));
const tr=$('train');const wins=[];
for(let i=0;i<3;i++){el('rect',{x:110+i*160,y:276,width:150,height:54,rx:6,fill:'#3a363c'},tr);for(let j=0;j<6;j++)wins.push(el('rect',{x:122+i*160+j*22,y:288,width:14,height:12,rx:2,fill:'#f2df78'},tr))}
el('path',{d:'M0 330 V286 q0 -12 12 -12 h60 q32 0 40 56Z',fill:'#3a363c'},tr);el('rect',{x:22,y:246,width:16,height:30,fill:'#3a363c'},tr);
const palms=[];[[1040,330,120],[1100,320,140],[1160,334,110]].forEach(([x,y,h])=>{const g=el('g',{},$('palms'));el('path',{d:`M${x} ${y} q8 -${h/2} 2 -${h}`},g);const top=el('g',{},g);for(let a=-2;a<=2;a++)el('path',{d:`M0 0 q${a*16} -14 ${a*34} 10`},top);palms.push({top,x:x+2,y:y-h})});
for(let x=-40;x<1500;x+=64)el('circle',{cx:x,cy:200+((x*37)%40),r:46+((x*29+3000)%44)},$('cloudsea'));el('rect',{x:0,y:220,width:1440,height:80},$('cloudsea'));
const wl=[];for(let i=0;i<5;i++)wl.push({p:el('path',{},$('windP')),y:120+i*70,o:rnd()*1700,s:.6+rnd()*.8});
const puffs=[];for(let i=0;i<16;i++)puffs.push({c:el('circle',{r:0,opacity:0},$('smoke')),age:i/16});
const motes=[];for(let i=0;i<22;i++)motes.push({c:el('circle',{r:1.2+rnd()*1.6},$('motes')),x:560+rnd()*320,y:120+rnd()*170,p:rnd()*6});
const envs=[];for(let i=0;i<5;i++){const g=el('g',{},$('envs'));const inner=el('g',{},g);el('rect',{x:-23,y:-15,width:46,height:30,fill:'#f3ead6',stroke:'#2b2520','stroke-width':1},inner);el('path',{d:'M-23 -15 L0 2 L23 -15',fill:'none',stroke:'#2b2520','stroke-width':1},inner);envs.push({g,inner,x:rnd()*1440,y:50+rnd()*150,p:rnd()*6})}
const cl=$('clouds'),clouds=[];
['cloud1','cloud2','cloud3','cloud2','cloud1','cloud3'].forEach(n=>{const im=new Image();im.src=`/tex/${n}.webp`;im.alt='';const w=220+rnd()*260;im.style.width=w+'px';cl.appendChild(im);clouds.push({im,w,x:rnd()*innerWidth,y:5+rnd()*70,depth:.3+rnd()*.7})});

/* ---------- one wind for everything (blows left → right) ---------- */
const W={t:0,boost:0};let lastY=scrollY;
function wind(t){if(reduce)return .55;return Math.max(.12,.55+.22*Math.sin(t*.31)+.14*Math.sin(t*.83+1)+.09*Math.sin(t*1.7+2)+.06*Math.sin(t*3.1)+W.boost)}

/* ---------- kite rig: faces into the wind, tail streams downwind ---------- */
const anchor={x:577,y:362},N=16,SEG=15,rope=[];let kp={x:1000,y:200};
for(let i=0;i<N;i++)rope.push({x:kp.x,y:kp.y+i*SEG,px:kp.x,py:kp.y+i*SEG});
const bows=[];for(let i=3;i<N;i+=4)bows.push({i,e:el('path',{d:'M-7 -5 L7 0 L-7 5 L-3 0Z'},$('bows'))});
function kiteStep(t,w,dt){
  const L=430+60*Math.min(w,1.3),elev=(26+22*Math.min(w,1.3))*Math.PI/180+.05*Math.sin(t*1.3)+.03*Math.sin(t*2.9);
  kp={x:anchor.x+L*Math.cos(elev),y:anchor.y-L*Math.sin(elev)};
  const pitch=-(12+14*Math.min(w,1.3))+6*Math.sin(t*1.9)+3*Math.sin(t*4.3);
  $('boyP').setAttribute('transform',`rotate(${(Math.sin(t*1.7)*.6*w).toFixed(2)} 555 566)`);
  $('kite').setAttribute('transform',`translate(${kp.x.toFixed(1)} ${kp.y.toFixed(1)}) rotate(${pitch.toFixed(2)})`);
  const mx=(anchor.x+kp.x)/2,my=(anchor.y+kp.y)/2,sag=Math.max(8,150*(1.25-w));
  $('string').setAttribute('d',`M${anchor.x} ${anchor.y} Q${(mx+sag*.35).toFixed(1)} ${(my+sag).toFixed(1)} ${kp.x.toFixed(1)} ${(kp.y+8).toFixed(1)}`);
  const a=pitch*Math.PI/180;rope[0].x=kp.x+Math.sin(-a)*-84;rope[0].y=kp.y+Math.cos(a)*84;
  const s=dt*60;
  for(let i=1;i<N;i++){const p=rope[i],vx=(p.x-p.px)*.93,vy=(p.y-p.py)*.93;p.px=p.x;p.py=p.y;
    p.x+=vx+(w*1.0+.12)*s+Math.sin(t*7+i*.8)*.35*w*s;p.y+=vy+.3*s+Math.cos(t*6+i*.9)*.55*w*s;}
  for(let k=0;k<4;k++)for(let i=1;i<N;i++){const q=rope[i-1],b=rope[i],dx=b.x-q.x,dy=b.y-q.y,d=Math.hypot(dx,dy)||1,f=(d-SEG)/d;b.x-=dx*f;b.y-=dy*f;}
  let d=`M${rope[0].x.toFixed(1)} ${rope[0].y.toFixed(1)}`;for(let i=1;i<N-1;i++){d+=` Q${rope[i].x.toFixed(1)} ${rope[i].y.toFixed(1)} ${((rope[i].x+rope[i+1].x)/2).toFixed(1)} ${((rope[i].y+rope[i+1].y)/2).toFixed(1)}`}
  $('tail').setAttribute('d',d);
  bows.forEach(b=>{const p=rope[b.i],q=rope[b.i-1],ang=Math.atan2(p.y-q.y,p.x-q.x)*180/Math.PI+Math.sin(t*12+b.i)*25*w;b.e.setAttribute('transform',`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})`)});
  wl.forEach(l=>{l.o=(l.o+w*l.s*dt*260)%1700;const x=l.o-200;l.p.setAttribute('d',`M${x.toFixed(1)} ${l.y} q60 -14 120 0 t120 0`);l.p.setAttribute('opacity',(.2+.5*Math.min(1,w)).toFixed(2))});
}

/* ---------- other scenes ---------- */
let trainX=950;
function scene1(t,w,dt){fatherStep(t,w,dt);trainX-=dt*70;if(trainX<-700)trainX=1500;$('train').setAttribute('transform',`translate(${trainX.toFixed(1)} 0)`);
  wins.forEach((r,i)=>r.setAttribute('opacity',(.75+.25*Math.sin(t*9+i*1.7)).toFixed(2)));
  puffs.forEach(p=>{p.age+=dt*.45;if(p.age>1)p.age-=1;const a=p.age,x=trainX+30+a*(160+260*w),y=244-a*(110-40*Math.min(w,1))+Math.sin(t*2+a*6)*6;
    p.c.setAttribute('cx',x.toFixed(1));p.c.setAttribute('cy',y.toFixed(1));p.c.setAttribute('r',(8+a*34).toFixed(1));p.c.setAttribute('opacity',(.75*(1-a)).toFixed(2))});}
function wave(id,base,amp,k,sp,t,w,h){let d=`M0 ${h}`;for(let x=0;x<=1440;x+=24){const y=base+amp*(1+w*.6)*Math.sin(x*k+t*sp)+amp*.4*Math.sin(x*k*2.3-t*sp*1.4);d+=` L${x} ${y.toFixed(1)}`}$(id).setAttribute('d',d+` L1440 ${h}Z`)}
let planeX=-200;
function scene2(t,w,dt){wave('sea1',340,5,.012,1.2,t,w,520);wave('sea2',390,6,.009,-1.6,t,w,520);
  palms.forEach((p,i)=>p.top.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${(w*16+Math.sin(t*2.2+i)*6*w).toFixed(1)})`));
  planeX+=dt*(90+60*w);if(planeX>1650)planeX=-300;
  $('plane2').setAttribute('transform',`translate(${planeX.toFixed(1)} ${(110+Math.sin(t*1.6)*8*w).toFixed(1)}) rotate(${(Math.sin(t*1.6+1)*4*w).toFixed(2)})`);
  $('trail2').setAttribute('stroke-dashoffset',(t*40).toFixed(1));}
let fx=260;
function fatherStep(t,w,dt){fx-=dt*38;if(fx<-260)fx=1500;$('fatherI').setAttribute('x',fx.toFixed(1));$('fatherI').setAttribute('y',(300-Math.abs(Math.sin(t*5.2))*3).toFixed(1));}
let sx=-.35;
function scooterStep(t,w,dt){sx+=dt*.035;if(sx>1.1)sx=-.4;const im=$('scooterI');im.style.left=(sx*100).toFixed(2)+'%';im.style.transform=`translateY(${(Math.sin(t*9)*1.2+Math.sin(t*2.3)*1.5).toFixed(2)}px) rotate(${(Math.sin(t*2.3)*.4).toFixed(2)}deg)`;}
let p4=-200;function scene4(t,w,dt){p4+=dt*(60+40*w);if(p4>1700)p4=-200;$('plane4').setAttribute('transform',`translate(${p4.toFixed(1)} ${(150-p4*.05+Math.sin(t*1.4)*6*w).toFixed(1)}) rotate(${(-4+Math.sin(t*1.4+1)*3*w).toFixed(2)})`)}
function scene5(t,w,dt){$('glow5').setAttribute('opacity',(.3+.07*Math.sin(t*13)+.04*Math.sin(t*31)+.04*(Math.random()-.5)).toFixed(3));
  motes.forEach(m=>{m.x+=dt*(8+w*14);m.y+=Math.sin(t+m.p)*.15;if(m.x>900)m.x=560;m.c.setAttribute('cx',m.x.toFixed(1));m.c.setAttribute('cy',m.y.toFixed(1));m.c.setAttribute('opacity',(.35+.35*Math.sin(t*2+m.p)).toFixed(2))})}
function scene6(t,w,dt){envs.forEach(e=>{e.x+=dt*(40+90*w);if(e.x>1520)e.x=-60;e.g.setAttribute('transform',`translate(${e.x.toFixed(1)} ${(e.y+Math.sin(t*1.1+e.p)*16*w).toFixed(1)})`);e.inner.setAttribute('transform',`rotate(${(Math.sin(t*2.4+e.p)*22*w).toFixed(1)}) scale(1 ${(.75+.25*Math.cos(t*3+e.p)).toFixed(2)})`)})}
function sceneE(t,w,dt){wave('seaE1',300,4,.011,.9,t,w,420);wave('seaE2',330,5,.008,-1.2,t,w,420);
  const kx=1170+Math.sin(t*.7)*16*w,ky=70+Math.sin(t*1.3)*9*w-w*10;$('kiteE').setAttribute('transform',`translate(${kx.toFixed(1)} ${ky.toFixed(1)}) rotate(${(-18-10*w).toFixed(1)})`);$('stringE').setAttribute('d',`M975 234 Q${(1075+40*(1.2-w)).toFixed(1)} ${(170+60*(1.2-w)).toFixed(1)} ${kx.toFixed(1)} ${(ky+12).toFixed(1)}`);
  let d='M0 22';for(let i=1;i<10;i++)d+=` L${(i*8*(.6+w*.5)).toFixed(1)} ${(22+i*4+Math.sin(t*6+i)*4*w).toFixed(1)}`;$('tailE').setAttribute('d',d);}

/* fireflies + grass on canvas */
const cv=$('field'),cx=cv.getContext('2d');let FW=0,FH=0,DPR=1,blades=[],flies=[];
function sizeField(){const r=cv.getBoundingClientRect();DPR=Math.min(2,devicePixelRatio||1);cv.width=Math.max(1,r.width*DPR);cv.height=Math.max(1,r.height*DPR);FW=cv.width;FH=cv.height;
  blades=[];const n=Math.round(r.width/4);for(let i=0;i<n;i++)blades.push({x:i/n*FW+Math.random()*4,h:FH*(.22+Math.random()*.4),c:Math.random()});
  flies=Array.from({length:Math.max(12,Math.round(r.width/24))},()=>({x:Math.random()*FW,y:FH*(.15+Math.random()*.75),p:Math.random()*6.28}));}
function field(t,w,dt){scooterStep(t,w,dt);cx.clearRect(0,0,FW,FH);
  cx.fillStyle='#e9e2c8';cx.globalAlpha=.85;cx.beginPath();cx.arc(FW*.8,FH*.18,FH*.08,0,7);cx.fill();cx.globalAlpha=1;
  cx.fillStyle='#16251e';cx.beginPath();cx.moveTo(0,FH);for(let x=0;x<=FW;x+=FW/40)cx.lineTo(x,FH*.62+Math.sin(x/FW*6)*FH*.03);cx.lineTo(FW,FH);cx.fill();
  cx.lineWidth=1.6*DPR;cx.lineCap='round';
  for(const b of blades){const bend=(w*.55+.12)*b.h*.5*(1+.35*Math.sin(t*2.2-b.x/FW*9));cx.strokeStyle=b.c>.5?'#203529':'#2a4334';cx.beginPath();cx.moveTo(b.x,FH);cx.quadraticCurveTo(b.x+bend*.2,FH-b.h*.55,b.x+bend,FH-b.h);cx.stroke();}
  for(const f of flies){f.p+=dt*1.2;f.x+=(w*18+Math.cos(f.p)*10)*dt*DPR;f.y+=Math.sin(f.p*1.3)*8*dt*DPR;if(f.x>FW+20)f.x=-20;
    const a=.3+.7*Math.max(0,Math.sin(f.p*2.1)),r=9*DPR,g=cx.createRadialGradient(f.x,f.y,0,f.x,f.y,r);g.addColorStop(0,`rgba(242,223,120,${a.toFixed(2)})`);g.addColorStop(1,'rgba(242,223,120,0)');cx.fillStyle=g;cx.beginPath();cx.arc(f.x,f.y,r,0,7);cx.fill();}}
sizeField();addEventListener('resize',sizeField);

/* ---------- chapters, sky, flight path ---------- */
const secs=[...document.querySelectorAll('.chapter')],track=$('track'),plane=$('plane');
const dots=secs.map((s,i)=>{const a=document.createElement('a');a.className='dot';a.href='#'+s.id;a.setAttribute('aria-label',s.dataset.name);a.title=s.dataset.name;a.style.left=(i/(secs.length-1)*100)+'%';track.appendChild(a);return a});
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mix=(a,b,t)=>'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')+')';
const themeMeta=document.querySelector('meta[name="theme-color"]');
const pals=secs.map(s=>s.dataset.sky.split(',').map(hex)),root=document.documentElement;let current=0;
function onScroll(){const mid=innerHeight*.5;let idx=0,t=0;secs.forEach((s,i)=>{const r=s.getBoundingClientRect();if(r.top<=mid){idx=i;t=Math.min(1,Math.max(0,(mid-r.top)/r.height))}});
  const a=pals[idx],b=pals[Math.min(idx+1,pals.length-1)],k=Math.max(0,(t-.65)/.35);
  const top=mix(a[0],b[0],k);root.style.setProperty('--sky-top',top);if(themeMeta)themeMeta.content=top;root.style.setProperty('--sky-bot',mix(a[1],b[1],k));
  dots.forEach((d,i)=>d.setAttribute('aria-current',i===idx));root.style.setProperty('--cloud-op',secs[idx].classList.contains('night')?'.14':'.6');plane.style.left=((idx+t)/(secs.length-1)*100)+'%';current=idx;
  const dy=Math.abs(scrollY-lastY);lastY=scrollY;W.boost=Math.min(.7,W.boost+dy*.0015);}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();

/* only animate what is on screen */
const runners={sceneP:kiteStep,scene1,scene2,scene4,scene5,scene6,sceneE,fieldWrap:field};
const visible=new Set(Object.keys(runners).filter(id=>{const r=$(id).getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100}));
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?visible.add(e.target.id):visible.delete(e.target.id)),{rootMargin:'100px'});
Object.keys(runners).forEach(id=>io.observe($(id)));

for(let i=0;i<150;i++)kiteStep(i*.016,.55,.016);Object.keys(runners).forEach(k=>{if(k!=='sceneP')runners[k](1,.55,.016)});
let last=performance.now();
function frame(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;W.t+=dt;W.boost*=Math.pow(.25,dt);const w=wind(W.t);
  root.style.setProperty('--wind',(w-.55).toFixed(3));
  for(const id of visible)runners[id](W.t,w,dt);
  clouds.forEach(c=>{c.x+=dt*(6+w*22)*c.depth;if(c.x>innerWidth+60)c.x=-c.w-60;c.im.style.transform=`translate(${c.x.toFixed(1)}px,${(c.y*innerHeight/100-scrollY*.06*c.depth).toFixed(1)}px)`});
  if(!reduce)requestAnimationFrame(frame);}
if(reduce){frame(performance.now());}
else requestAnimationFrame(frame);

/* ---------- music ---------- */
const au=$('music'),rb=$('rec'),rl=$('recLabel');let target=0,ft;const base=.55;
const night=()=>secs[current].classList.contains('night')?.6:1;
function fade(){clearInterval(ft);ft=setInterval(()=>{const d=target-au.volume;if(Math.abs(d)<.02){au.volume=target;clearInterval(ft);if(target===0)au.pause();return}au.volume=Math.min(1,Math.max(0,au.volume+Math.sign(d)*.02))},40)}
rb.addEventListener('click',()=>{const on=rb.getAttribute('aria-pressed')!=='true';rb.setAttribute('aria-pressed',on);rl.textContent=on?'pause the music':'play the music';rb.setAttribute('aria-label',on?'Pause music':'Play music');
  if(on){au.volume=0;au.play().then(()=>{target=base*night();fade()}).catch(()=>{rb.setAttribute('aria-pressed','false');rl.textContent='play the music'})}else{target=0;fade()}});
addEventListener('scroll',()=>{if(rb.getAttribute('aria-pressed')==='true'){const t=base*night();if(Math.abs(t-target)>.01){target=t;fade()}}},{passive:true});

/* ---------- copy email ---------- */
$('copy').addEventListener('click',e=>{const b=e.currentTarget,t=$('email').textContent;navigator.clipboard.writeText(t).then(()=>b.textContent='copied',()=>{const r=document.createRange();r.selectNodeContents($('email'));const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='selected'});setTimeout(()=>b.textContent='copy',2200)});
})();
