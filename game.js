(() => {
const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
let W=0,H=0,ratio=1,last=0,running=false;
let left=false,right=false;
let jumpPressed=false,interactPressed=false;
let stage=0,trap=false,door=false;
let aurora={x:180,y:0,vy:0,onGround:true,facing:1,cycle:0};
let cameraX=0;
const worldWidth=2200;

function resize(){
  ratio=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  canvas.width=Math.floor(W*ratio);
  canvas.height=Math.floor(H*ratio);
  canvas.style.width=W+"px";
  canvas.style.height=H+"px";
  ctx.setTransform(ratio,0,0,ratio,0,0);
}
window.addEventListener("resize",resize);
resize();

function say(text,duration=4200){
  const box=document.getElementById("dialog");
  document.getElementById("dialogText").textContent=text;
  box.classList.remove("hidden");
  clearTimeout(say.timer);
  say.timer=setTimeout(()=>box.classList.add("hidden"),duration);
}
function objective(text,progress){
  document.getElementById("objective").textContent=text;
  document.getElementById("progress").textContent=progress;
}

document.getElementById("start").addEventListener("click",()=>{
  document.getElementById("intro").classList.remove("active");
  document.getElementById("hud").classList.remove("hidden");
  document.getElementById("controls").classList.remove("hidden");
  say("Vi tar det rolig. Gå mot høyre og se etter det som ikke passer inn.");
  running=true;
  requestAnimationFrame(loop);
});

function bindHold(id,down,up){
  const b=document.getElementById(id);
  ["pointerdown","touchstart"].forEach(e=>b.addEventListener(e,ev=>{ev.preventDefault();down();},{passive:false}));
  ["pointerup","pointercancel","pointerleave","touchend"].forEach(e=>b.addEventListener(e,ev=>{ev.preventDefault();up();},{passive:false}));
}
bindHold("left",()=>left=true,()=>left=false);
bindHold("right",()=>right=true,()=>right=false);

document.getElementById("jump").addEventListener("click",()=>jumpPressed=true);
document.getElementById("interact").addEventListener("click",()=>interactPressed=true);

function update(dt){
  let moving=false;
  if(left){aurora.x-=210*dt;aurora.facing=-1;moving=true}
  if(right){aurora.x+=210*dt;aurora.facing=1;moving=true}
  if(jumpPressed&&aurora.onGround){aurora.vy=520;aurora.onGround=false}
  jumpPressed=false;

  if(!aurora.onGround){
    aurora.vy-=1050*dt;
    aurora.y+=aurora.vy*dt;
    if(aurora.y<=0){aurora.y=0;aurora.vy=0;aurora.onGround=true}
  }
  aurora.x=Math.max(45,Math.min(worldWidth-70,aurora.x));
  if(moving)aurora.cycle+=dt*10;

  if(stage===0&&aurora.x>620){
    stage=1;objective("Undersøk gulvet","2 / 4");
    say("Vent litt. Den midterste steinen ligger lavere enn de andre.");
  }

  if(stage===1&&interactPressed){
    if(aurora.x<560||aurora.x>780){
      say("Jeg må stå nærmere den slitte steinen.");
    }else{
      trap=true;stage=2;objective("Finn den skjulte mekanismen","3 / 4");
      say("En gammel trykkplate. Godt vi undersøkte før vi gikk videre.");
    }
  }

  if(stage===2&&interactPressed){
    if(aurora.x<1180){
      say("Jeg ville sett nærmere på veggen lenger mot høyre.");
    }else{
      door=true;stage=3;objective("Gå inn i gravkammeret","4 / 4");
      say("Der åpnet den seg. Ingen har sett dette rommet på svært lenge.");
    }
  }
  interactPressed=false;
  const desired=aurora.x-W*.38;
  cameraX+=(desired-cameraX)*.12;
  cameraX=Math.max(0,Math.min(worldWidth-W,cameraX));
}

function drawAurora(floorY){
  const x=aurora.x-cameraX;
  const y=floorY-112-aurora.y;
  const step=Math.sin(aurora.cycle)*7;
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(aurora.facing,1);

  ctx.fillStyle="rgba(0,0,0,.42)";
  ctx.beginPath();ctx.ellipse(0,117,31,8,0,0,Math.PI*2);ctx.fill();

  ctx.fillStyle="#c48962";
  ctx.beginPath();ctx.arc(0,18,17,0,Math.PI*2);ctx.fill();

  ctx.fillStyle="#2a1a12";
  ctx.beginPath();ctx.arc(-3,12,18,Math.PI,Math.PI*2);ctx.fill();

  ctx.fillStyle="#5e6047";
  ctx.fillRect(-18,36,36,45);

  ctx.strokeStyle="#3a3428";ctx.lineWidth=11;
  ctx.beginPath();
  ctx.moveTo(-9,80);ctx.lineTo(-12+step,108);
  ctx.moveTo(9,80);ctx.lineTo(12-step,108);
  ctx.stroke();

  ctx.strokeStyle="#a96c49";ctx.lineWidth=9;
  ctx.beginPath();
  ctx.moveTo(-16,43);ctx.lineTo(-24-step,72);
  ctx.moveTo(16,43);ctx.lineTo(24+step,72);
  ctx.stroke();
  ctx.restore();
}

function render(){
  const floorY=H*.72;
  ctx.clearRect(0,0,W,H);
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#5b412b");g.addColorStop(.7,"#211710");g.addColorStop(1,"#0c0805");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

  ctx.save();ctx.translate(-cameraX,0);
  ctx.fillStyle="#3f2e1e";ctx.fillRect(0,floorY,worldWidth,H-floorY);

  for(let x=0;x<worldWidth;x+=150){
    ctx.fillStyle=x%300===0?"#3a291b":"#2d2117";
    ctx.fillRect(x,floorY-250,100,250);
  }

  ctx.fillStyle=trap?"#8b6336":"#5e4328";
  ctx.fillRect(640,floorY-8,100,16);

  if(trap){
    ctx.strokeStyle="#bca27b";ctx.lineWidth=4;
    for(let i=0;i<4;i++){
      ctx.beginPath();
      ctx.moveTo(780+i*12,floorY-120-i*15);
      ctx.lineTo(850+i*12,floorY-90-i*15);
      ctx.stroke();
    }
  }

  ctx.fillStyle="#17110c";ctx.fillRect(1250,floorY-260,190,260);
  ctx.strokeStyle="#77593a";ctx.lineWidth=10;ctx.strokeRect(1250,floorY-260,190,260);
  ctx.fillStyle=door?"rgba(215,179,107,.20)":"#4a3522";
  ctx.fillRect(1260,floorY-250,170,250);
  ctx.restore();

  drawAurora(floorY);
}

function loop(t){
  if(!running)return;
  const dt=Math.min((t-last)/1000||0,.035);last=t;
  update(dt);render();
  requestAnimationFrame(loop);
}
})();