'use strict';
/* ===== DATA ===== [이름, 소속, 색, HP, 속도, 공격, 특수기, 필살기, 타입(d=돌진,p=투사체), 승리문구] */
const D=[
['루피','원피스','#e53935',115,5.2,8,'고무고무 피스톨','고무고무 킹콩건','d','해적왕은 내가 된다!'],
['조로','원피스','#2e7d32',110,4.8,9,'삼천세계','아수라 · 귀기 구도류','d','아직 갈 길이 멀다.'],
['상디','원피스','#fdd835',100,5.8,7.5,'디아블 죙브','헬 메모리','d','레이디는 지켜야지.'],
['트라팔가 로','원피스','#fbc02d',95,5,7,'룸: 샴블즈','감마 나이프','p','내 계획대로야.'],
['포트거스 D. 에이스','원피스','#ff6f00',100,5.2,8,'화권','대염계 엔테이','p','불꽃처럼 타올랐다!'],
['샹크스','원피스','#b71c1c',120,4.8,9,'패왕색 일격','신위','d','승부는 정해졌다.'],
['카이도','원피스','#6a1b9a',140,4,11,'뇌명팔괘','용의 브레스','p','강자만이 살아남는다!'],
['미호크','원피스','#455a64',110,5,10,'흑도 참격','세계 최강의 검','p','그걸로는 부족하다.'],
['우즈마키 나루토','나루토','#ff9800',115,5.2,8,'나선환','구미 차크라 모드','d','포기하지 않는 게 내 닌도다!'],
['우치하 사스케','나루토','#283593',100,5.6,8.5,'치도리','스사노오 · 기린','d','내 복수는 끝나지 않았다.'],
['하루노 사쿠라','나루토','#f48fb1',95,5,9.5,'앵화충','백호의 인','d','내 주먹을 얕보지 마!'],
['하타케 카카시','나루토','#78909c',100,5.4,7.5,'뇌절','카무이 뇌절','d','동료를 버리는 건 쓰레기지.'],
['우치하 이타치','나루토','#b71c1c',95,5.6,7.5,'화둔 호화구','츠쿠요미','p','너는 아직 부족해.'],
['우치하 마다라','나루토','#4a148c',130,4.4,10,'화둔 대돌파','외도 메테오','p','꿈속에서 영원하라.'],
['페인','나루토','#e65100',115,4.6,9,'신라천정','천도 신라천정','p','고통을 알라.'],
['지라이야','나루토','#388e3c',120,4.4,9,'나선환 · 연','선법 · 대옥나선환','p','나는 호색 선인이다!']
];
const BG=[['아르바나','#f6c35b','#e8934a','#c9a063'],['마린포드','#6fb1e0','#d9e8f2','#8a8f98'],['와노쿠니','#2a1a3d','#c44a5a','#3b2a2a'],
['나뭇잎 마을','#8ed1f0','#cfeecf','#5a9a4a'],['종말의 계곡','#e8a060','#7a5a8a','#6b6b6b'],['우치하 일족 거주지','#14102a','#6a1a2a','#2a2030']];
const $=s=>document.querySelector(s),cv=$('#cv'),ctx=cv.getContext('2d');
const W=960,H=540,GY=450,rnd=n=>Math.random()*n;
const K=['left','right','jump','guard','a','b','c','ult'];
const MAP={a:'left',arrowleft:'left',d:'right',arrowright:'right',w:'jump',arrowup:'jump',s:'guard',arrowdown:'guard',j:'a',k:'b',l:'c',' ':'ult'};
const kb={},tc={},hc={};
let G=null,scene='title',sel=0,lv=1,last=0,acc=0;
const touch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
if(touch)document.body.classList.add('touch');

/* ===== INPUT (keyboard + pointer events) ===== */
addEventListener('keydown',e=>{const k=MAP[e.key.toLowerCase()];if(k){kb[k]=1;e.preventDefault()}});
addEventListener('keyup',e=>{const k=MAP[e.key.toLowerCase()];if(k)kb[k]=0});
const pads=[...document.querySelectorAll('#pad [data-k]')];
function clearIn(){K.forEach(k=>{kb[k]=0;tc[k]=0});pads.forEach(b=>{b._i.clear();b.classList.remove('on')})}
pads.forEach(b=>{
  const k=b.dataset.k;b._i=new Set();
  b.addEventListener('pointerdown',e=>{e.preventDefault();b._i.add(e.pointerId);try{b.setPointerCapture(e.pointerId)}catch(_){}tc[k]=1;b.classList.add('on')});
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,e=>{b._i.delete(e.pointerId);if(!b._i.size){tc[k]=0;b.classList.remove('on')}}));
});
addEventListener('blur',clearIn);addEventListener('pagehide',clearIn);
document.addEventListener('visibilitychange',clearIn);
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
const paused=()=>touch&&innerHeight>innerWidth;

/* ===== SCREENS ===== */
function setScene(s){scene=s;document.body.dataset.s=s;clearIn();document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===s))}
const rows=$('#rows');
['원피스','나루토'].forEach(s=>{
  const r=document.createElement('div');r.className='row';r.innerHTML=`<b>${s}</b>`;
  D.forEach((d,i)=>{if(d[1]!==s)return;const b=document.createElement('button');b.className='ch';b.style.setProperty('--c',d[2]);
    b.innerHTML=`<i>${d[0].split(' ').pop()[0]}</i>${d[0].split(' ').pop()}`;b.onclick=()=>pick(i);r.append(b)});
  rows.append(r);
});
function pick(i){
  sel=i;const d=D[i];
  document.querySelectorAll('.ch').forEach((b,n)=>b.classList.toggle('on',n===i));
  $('#info').innerHTML=`<b>${d[0]}</b> (${d[1]}) · HP ${d[3]} / 속도 ${d[4]} / 공격 ${d[5]}<br>J 기본공격 · K 강공격 · L <b>${d[6]}</b> · SPACE <b>${d[7]}</b>`;
}
pick(0);
$('#start').onclick=()=>setScene('sel');
$('#back').onclick=()=>setScene('title');
document.querySelectorAll('.df').forEach(b=>b.onclick=()=>{lv=+b.dataset.d;document.querySelectorAll('.df').forEach(x=>x.classList.toggle('on',x===b))});
$('#go').onclick=$('#again').onclick=startFight;
$('#resel').onclick=()=>setScene('sel');

/* ===== FIGHTERS ===== */
const mk=(i,x,f,ai)=>({i,d:D[i],x,y:GY,vy:0,kx:0,f,hp:D[i][3],m:D[i][3],lag:D[i][3],en:30,ai,st:0,at:null,cb:0,ct:0,bl:0,inp:{},jp:{},aiT:30,pl:{m:0,g:0},wk:0});
function startFight(){
  const op=D.map((_,i)=>i).filter(i=>D[i][1]!==D[sel][1]);
  G={p:mk(sel,260,1,0),e:mk(op[rnd(op.length)|0],700,-1,1),pr:[],pp:[],pt:[],sh:0,fz:0,uf:null,over:0,oT:0,w:null,bi:rnd(6)|0,lv,t:0};
  setScene('fight');
}
function startAtk(f,k){
  const d=f.d,A={a:[7,6,9,1,70,6],b:[15,8,16,2,90,14],c:[8,18,12,2.2,85,12],u:[8,4,30,0,0,0]}[k];
  const pj=k=='u'||(k=='c'&&d[8]=='p');
  f.at={k,t:0,su:pj?(k=='u'?10:14):A[0],act:pj?0:A[1],end:(pj?(k=='u'?10:14):A[0])+A[1]*(pj?0:1)+A[2],dm:d[5]*A[3],rng:A[4],kb:A[5],h:0,pj};
  if(k=='c')f.en-=30;
  if(k=='u'){f.en=0;G.fz=45;G.uf=f}
}
function hurt(o,dm,kx,s,k){
  const g=G;
  if(s.ai)dm*=[.7,1,1.25][g.lv];
  if(o.bl){dm*=.12;kx*=.25;o.st=7}
  else{o.st=(k=='b'||k=='u')?26:16;o.at=null;o.cb=0;o.en=Math.min(100,o.en+5);g.sh=Math.max(g.sh,k=='a'?4:9)}
  dm=Math.max(1,Math.round(dm));o.hp=Math.max(0,o.hp-dm);o.kx=kx;s.en=Math.min(100,s.en+8);
  g.pp.push({x:o.x,y:o.y-135,t:40,s:dm});
  for(let n=0;n<8;n++)g.pt.push({x:o.x,y:o.y-70,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*10,t:20,c:o.bl?'#8cf':s.d[2]});
  if(o.hp<=0&&!g.over){g.over=1;g.oT=0;g.w=s;g.sh=18}
}
function upd(f,o){
  const d=f.d,i=f.inp,j=f.jp;
  f.en=Math.min(100,f.en+.07);
  if(f.ct>0&&--f.ct==0)f.cb=0;
  f.bl=0;
  if(f.st>0){f.st--;f.x+=f.kx;f.kx*=.88}
  else if(f.hp>0){
    if(!f.at){
      f.f=o.x>f.x?1:-1;
      f.bl=i.guard&&f.y>=GY;
      if(!f.bl){
        const m=(i.right?1:0)-(i.left?1:0);
        f.x+=m*d[4];f.wk+=Math.abs(m)*.3;
        if(j.jump&&f.y>=GY)f.vy=-15;
        if(j.ult&&f.en>=100)startAtk(f,'u');
        else if(j.c&&f.en>=30)startAtk(f,'c');
        else if(j.b)startAtk(f,'b');
        else if(j.a)startAtk(f,'a');
      }
    }
    const a=f.at;
    if(a){
      a.t++;
      if(a.pj&&a.t==a.su){
        const u=a.k=='u';
        G.pr.push({x:f.x+f.f*40,y:f.y-70,vx:f.f*(u?13:9),r:u?55:22,dm:u?d[5]*4+14:d[5]*2.2,c:d[2],o:f,kb:u?22:12,l:90,u});
        if(u)G.sh=14;
      }
      if(!a.pj&&a.t>=a.su&&a.t<a.su+a.act){
        if(a.k=='c')f.x+=f.f*9;
        if(!a.h){
          const ax=f.x+f.f*a.rng/2;
          if(Math.abs(o.x-ax)<a.rng/2+22&&Math.abs(o.y-f.y)<90&&o.hp>0){
            a.h=1;let dm=a.dm;
            if(a.k=='a'){f.cb=Math.min(f.cb+1,4);f.ct=45;dm*=1+.2*(f.cb-1)}
            hurt(o,dm,a.kb*f.f,f,a.k);
          }
        }
      }
      if(a.t>=a.end)f.at=null;
    }
  }
  f.vy+=.85;f.y+=f.vy;if(f.y>=GY){f.y=GY;f.vy=0}
  if(Math.abs(f.x-o.x)<36&&Math.abs(f.y-o.y)<80)f.x+=(f.x<o.x?-1:1)*2;
  f.x=Math.max(40,Math.min(W-40,f.x));
  f.lag+=(f.hp-f.lag)*.05;
}
/* ===== AI ===== */
function ai(f,o){
  const L=G.lv,j={},i={left:0,right:0,jump:0,guard:0};f.jp=j;f.inp=i;
  const d=Math.abs(o.x-f.x),tw=o.x>f.x?1:-1;
  if(f.aiT--<=0){
    f.aiT=[34,20,9][L]+rnd(8);f.pl={m:0,g:0,a:null,jmp:0};
    const r=Math.random(),b=(f.i*7%5)/10,p=f.pl; // b: 캐릭터별 공격 성향
    if(o.at&&d<140&&r<[.25,.55,.85][L]){p.g=1;if(r<.1)p.m=-tw}
    else if(f.en>=100&&d<420&&r<.5)p.a='ult';
    else if(f.d[8]=='p'&&f.en>=30&&d>180&&r<.35+b)p.a='c';
    else if(d>100)p.m=r<.12?0:tw;
    else if(r<.25+b/2)p.a='a';
    else if(r<.5+b/2)p.a='b';
    else if(f.en>=30&&r<.65)p.a='c';
    else if(r<.7)p.m=-tw;
    else if(r<.76)p.jmp=1;
  }
  const p=f.pl;
  i.left=p.m<0;i.right=p.m>0;i.guard=p.g;
  if(p.a){j[p.a]=1;p.a=null}
  if(p.jmp){j.jump=1;p.jmp=0}
}
/* ===== LOOP ===== */
function step(){
  const g=G;if(g.fz>0){g.fz--;return}
  g.t++;const {p,e}=g;
  if(!g.over){
    K.forEach(k=>{const c=!!(kb[k]||tc[k]);hc[k]=c?(hc[k]||0)+1:0;p.jp[k]=c&&(hc[k]==1||(k=='a'&&hc[k]%14==0));p.inp[k]=c});
    ai(e,p);
  }else{p.inp={};e.inp={};p.jp={};e.jp={}}
  upd(p,e);upd(e,p);
  g.pr=g.pr.filter(q=>{
    q.x+=q.vx;q.l--;const o=q.o===p?e:p;
    if(o.hp>0&&Math.abs(o.x-q.x)<q.r+22&&Math.abs(o.y-70-q.y)<q.r+60){hurt(o,q.dm,Math.sign(q.vx)*q.kb,q.o,q.u?'u':'p');return false}
    return q.l>0&&q.x>-90&&q.x<W+90;
  });
  g.pp.forEach(t=>{t.t--;t.y-=1});g.pp=g.pp.filter(t=>t.t>0);
  g.pt.forEach(t=>{t.x+=t.vx;t.y+=t.vy;t.t--});g.pt=g.pt.filter(t=>t.t>0);
  if(g.sh>0)g.sh-=.7;
  if(g.over&&++g.oT==100&&scene=='fight')endScreen();
}
function endScreen(){
  const w=G.w;
  $('#msg').innerHTML=`${w===G.p?'YOU WIN!':'YOU LOSE...'}<small>${w.d[0]} : “${w.d[9]}”</small>`;
  setScene('end');
}
function loop(t){
  requestAnimationFrame(loop);
  const dt=Math.min(100,t-last);last=t;
  if(G&&(scene=='fight'||scene=='end')){
    if(!paused()){acc+=dt;while(acc>=16.667){step();acc-=16.667}}
    draw();
  }
}
/* ===== RENDER ===== */
function bg(b){
  const gr=ctx.createLinearGradient(0,0,0,GY);gr.addColorStop(0,b[1]);gr.addColorStop(1,b[2]);
  ctx.fillStyle=gr;ctx.fillRect(-30,-30,W+60,GY+30);
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(780,90,40,0,7);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.25)';
  for(let n=0;n<7;n++){const x=n*150-20,h=90+(n*53%120),m=G.bi%3;
    if(m==0)ctx.fillRect(x,GY-h,70,h);
    else if(m==1){ctx.beginPath();ctx.moveTo(x-40,GY);ctx.lineTo(x+40,GY-h*1.3);ctx.lineTo(x+120,GY);ctx.fill()}
    else{ctx.beginPath();ctx.arc(x+40,GY,h*.7,Math.PI,0);ctx.fill()}}
  ctx.fillStyle=b[3];ctx.fillRect(-30,GY,W+60,H-GY+30);
  ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('STAGE: '+b[0],W/2,H-14);
}
function drawF(f){
  const c=f.d[2],hurtd=f.st>0&&f.hp>0,dead=f.hp<=0,win=G.over&&f===G.w;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(f.x,GY+4,28,7,0,0,7);ctx.fill();
  ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.f,1);
  if(dead){ctx.translate(-20,0);ctx.rotate(-1.4)}
  const sw=Math.sin(f.wk)*8;
  ctx.fillStyle='#222';ctx.fillRect(-16,-34,14,34+(f.y<GY?-8:sw/2));ctx.fillRect(2,-34,14,34+(f.y<GY?-8:-sw/2));
  ctx.fillStyle=hurtd?'#fff':c;ctx.fillRect(-19,-96,38,64);
  ctx.fillStyle='#f2c9a0';ctx.beginPath();ctx.arc(0,-114,18,0,7);ctx.fill();
  ctx.fillStyle=hurtd?'#fff':c;ctx.beginPath();ctx.arc(0,-117,18,Math.PI,0);ctx.fill();
  ctx.fillStyle='#000';ctx.fillRect(7,-116,4,4);
  ctx.fillStyle='#f2c9a0';
  const a=f.at;
  if(win)ctx.fillRect(8,-150,9,60);
  else if(a){const ext=a.t>=a.su?(a.pj?40:a.rng):20+a.t*2;ctx.fillRect(10,-84,Math.min(ext,a.rng||50),11);if(a.k=='c'&&!a.pj){ctx.fillStyle=c;ctx.fillRect(10,-88,30,19)}}
  else ctx.fillRect(10,-80,22,10);
  if(f.bl){ctx.strokeStyle='#7df';ctx.lineWidth=5;ctx.beginPath();ctx.arc(14,-70,48,-1.2,1.2);ctx.stroke()}
  ctx.restore();
}
function hud(g){
  [[g.p,20,1],[g.e,940,-1]].forEach(([f,x,s])=>{
    const w=400,R=(v,mx,col,y,h)=>{ctx.fillStyle=col;const ww=w*v/mx;ctx.fillRect(s>0?x:x-ww,y,ww,h)};
    ctx.fillStyle='#000b';ctx.fillRect(s>0?x:x-w,16,w,24);
    R(f.lag,f.m,'#fff',16,24);R(f.hp,f.m,f.d[2],16,24);
    ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(s>0?x:x-w,16,w,24);
    ctx.fillStyle='#000b';ctx.fillRect(s>0?x:x-w,44,w,10);
    R(f.en,100,f.en>=100?'#ffe03a':'#3ac1ff',44,10);
    ctx.fillStyle='#fff';ctx.font='bold 16px sans-serif';ctx.textAlign=s>0?'left':'right';
    ctx.fillText(f.d[0]+(f.ai?' (CPU)':''),x,74);
    if(f.cb>1){ctx.fillStyle='#ffd54f';ctx.font='900 26px sans-serif';ctx.fillText(f.cb+' HIT!',x,104)}
  });
}
function cine(g){
  const f=g.uf;ctx.save();ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=f.d[2];ctx.lineWidth=3;
  for(let n=0;n<40;n++){const a=n*.157+g.fz*.03;ctx.beginPath();ctx.moveTo(W/2+Math.cos(a)*200,H/2+Math.sin(a)*200);ctx.lineTo(W/2+Math.cos(a)*700,H/2+Math.sin(a)*700);ctx.stroke()}
  ctx.font='900 54px sans-serif';ctx.textAlign='center';ctx.lineWidth=7;ctx.strokeText(f.d[7],W/2,H/2);ctx.fillStyle='#fff';ctx.fillText(f.d[7],W/2,H/2);
  ctx.restore();
}
function draw(){
  const g=G;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
  ctx.save();
  if(g.sh>0)ctx.translate(rnd(g.sh)-g.sh/2,rnd(g.sh)-g.sh/2);
  if(g.fz>0){const f=g.uf;ctx.translate(f.x,f.y-80);ctx.scale(1.2,1.2);ctx.translate(-f.x,-f.y+80)}
  bg(BG[g.bi]);
  drawF(g.e);drawF(g.p);
  g.pr.forEach(q=>{const r=ctx.createRadialGradient(q.x,q.y,2,q.x,q.y,q.r);r.addColorStop(0,'#fff');r.addColorStop(.5,q.c);r.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=r;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,7);ctx.fill()});
  g.pt.forEach(t=>{ctx.fillStyle=t.c;ctx.globalAlpha=t.t/20;ctx.fillRect(t.x,t.y,6,6)});ctx.globalAlpha=1;
  ctx.font='900 26px sans-serif';ctx.textAlign='center';
  g.pp.forEach(t=>{ctx.globalAlpha=Math.min(1,t.t/20);ctx.lineWidth=4;ctx.strokeStyle='#000';ctx.strokeText(t.s,t.x,t.y);ctx.fillStyle='#ff5';ctx.fillText(t.s,t.x,t.y)});ctx.globalAlpha=1;
  ctx.restore();
  hud(g);
  if(g.fz>0)cine(g);
}
/* ===== RESIZE ===== */
function fit(){const s=Math.min(innerWidth/W,innerHeight/H);cv.style.width=W*s+'px';cv.style.height=H*s+'px'}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,250));fit();
requestAnimationFrame(loop);
