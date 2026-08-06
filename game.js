(() => {
const $=id=>document.getElementById(id);
const screens=[...document.querySelectorAll(".screen")];
const world=$("world"),aurora=$("aurora"),dialogText=$("dialogText");
const plate=$("pressurePlate"),arrows=$("arrows"),eyeWall=$("eyeWall"),eyeGlow=$("eyeGlow"),wallDust=$("wallDust");
const door=$("door"),wow=$("wowLight"),nearHint=$("nearHint"),interact=$("interact");
const state={x:180,left:false,right:false,jumping:false,stage:0,vision:false,camera:0,idle:0,last:0,nearEye:false,eyeOpened:false};

function show(s){screens.forEach(x=>x.classList.remove("active"));s.classList.add("active")}
function say(t){dialogText.textContent=t;state.idle=performance.now()}
function objective(t,n){$("objective").textContent=t;$("progress").textContent=n+" / 4"}

$("startBtn").onclick=()=>{
  show($("game"));
  say("Vi tar det rolig. Gå mot høyre og se etter noe uvanlig.");
  requestAnimationFrame(loop);
};

function hold(id,key){
 const b=$(id);
 ["pointerdown","touchstart"].forEach(e=>b.addEventListener(e,ev=>{ev.preventDefault();state[key]=true;state.idle=performance.now()},{passive:false}));
 ["pointerup","pointercancel","pointerleave","touchend"].forEach(e=>b.addEventListener(e,ev=>{ev.preventDefault();state[key]=false},{passive:false}));
}
hold("left","left");hold("right","right");

$("jump").onclick=()=>{
 if(state.jumping)return;
 state.jumping=true;
 aurora.classList.add("jump");
 setTimeout(()=>{aurora.classList.remove("jump");state.jumping=false},820);
};

$("vision").onclick=()=>{
 state.vision=!state.vision;
 plate.classList.toggle("glow",state.vision && state.stage<2);
 eyeWall.classList.toggle("ready",state.vision && state.stage>=2 && !state.eyeOpened);
 aurora.classList.add("observe");
 setTimeout(()=>aurora.classList.remove("observe"),1700);
 if(state.stage<2){
   say(state.vision?"Arkeologblikk: Den midterste steinen er mer slitt enn de andre.":"Arkeologblikk avsluttet.");
 }else{
   say(state.vision?"Arkeologblikk: Horus-øyet skjuler en mekanisk lås.":"Arkeologblikk avsluttet.");
 }
};

$("interact").onclick=()=>{
 aurora.classList.add("observe");
 setTimeout(()=>aurora.classList.remove("observe"),1700);

 if(state.stage===0){
   if(state.x<600){say("Jeg ville gått litt lenger frem først.");return}
   state.stage=1;objective("Undersøk trykkplaten",2);
   say("Vent. Det er en trykkplate. La oss forstå mekanismen før vi trår på den.");
   return;
 }

 if(state.stage===1){
   if(state.x<650||state.x>860){say("Jeg må stå nærmere den slitte steinen.");return}
   arrows.classList.add("show");
   setTimeout(()=>arrows.classList.remove("show"),1200);
   state.stage=2;objective("Finn Horus-øyet",3);
   plate.classList.remove("glow");
   say("Piler i veggen. Historien tester virkelig tålmodigheten vår.");
   return;
 }

 if(state.stage===2){
   if(!state.nearEye){
     say("Horus-øyet er lenger mot høyre. Jeg må stå helt inntil veggen.");
     return;
   }
   state.eyeOpened=true;
   eyeWall.classList.add("ready");
   wallDust.classList.add("active");
   say("Fantastisk... mekanismen virker fortsatt etter over tre tusen år.");
   setTimeout(()=>{
     eyeWall.classList.add("open");
     nearHint.classList.add("hidden");
     interact.classList.remove("ready");
   },450);
   setTimeout(()=>{
     door.classList.add("open");
     wow.classList.add("show");
     state.stage=3;
     objective("Gå inn i gravkammeret",4);
     say("Der åpnet den seg... Sollys har ikke nådd dette rommet på tusenvis av år.");
   },1500);
   return;
 }
};

function updateNearEye(){
 state.nearEye=state.stage===2 && !state.eyeOpened && state.x>=1210 && state.x<=1510;
 nearHint.classList.toggle("hidden",!state.nearEye);
 interact.classList.toggle("ready",state.nearEye);
 eyeWall.classList.toggle("ready",state.nearEye || (state.vision && state.stage===2 && !state.eyeOpened));
}

function loop(t){
 const dt=Math.min((t-state.last)/1000||0,.035);state.last=t;

 if(state.left){
   state.x-=225*dt;
   aurora.classList.add("face-left","walk");
 }
 if(state.right){
   state.x+=225*dt;
   aurora.classList.remove("face-left");
   aurora.classList.add("walk");
 }
 if(!state.left&&!state.right)aurora.classList.remove("walk");

 state.x=Math.max(60,Math.min(2180,state.x));
 aurora.style.left=state.x+"px";

 updateNearEye();

 const desired=Math.max(0,Math.min(2400-innerWidth,state.x-innerWidth*.36));
 state.camera+=(desired-state.camera)*.10;
 world.style.transform=`translateX(${-state.camera}px)`;

 if(state.stage===0&&state.x>600){
   objective("Undersøk gulvet",2);
   say("Ser du forskjellen i steinene? Prøv BLIKK eller UNDERSØK.");
   state.stage=1;
 }

 if(performance.now()-state.idle>9000){
   state.idle=performance.now();
   if(state.stage===1)say("Se én gang til. Den slitte steinen er viktig.");
   else if(state.stage===2)say("Horus-øyet i veggen skjuler trolig den neste mekanismen.");
 }

 requestAnimationFrame(loop);
}
})();