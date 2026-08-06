(() => {
const $=id=>document.getElementById(id);
const screens=[...document.querySelectorAll(".screen")];
const world=$("world"),aurora=$("aurora"),dialogText=$("dialogText");
const plate=$("pressurePlate"),arrows=$("arrows"),eyeWall=$("eyeWall"),eyeGlow=$("eyeGlow"),wallDust=$("wallDust");
const door=$("door"),wow=$("wowLight"),nearHint=$("nearHint"),interact=$("interact"),enterChamberBtn=$("enterChamberBtn");
const state={x:180,left:false,right:false,jumping:false,stage:0,vision:false,camera:0,idle:0,last:0,nearEye:false,eyeOpened:false};

function show(s){screens.forEach(x=>x.classList.remove("active"));s.classList.add("active")}
function say(t){dialogText.textContent=t;state.idle=performance.now()}
function objective(t,n){$("objective").textContent=t;$("progress").textContent=n+" / 4"}

const musicTrack=$("musicTrack");
const musicIntroBtn=$("musicIntroBtn");
const musicGameBtn=$("musicGameBtn");
let musicWanted=true;
let fallbackAudio=null;

musicTrack.volume=.38;

function startFallbackMusic(){
  if(fallbackAudio)return;
  try{
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    const ac=new AudioContext();
    const master=ac.createGain();
    master.gain.value=.055;
    master.connect(ac.destination);

    const frequencies=[55,82.41,110,164.81];
    const oscillators=[];
    frequencies.forEach((frequency,index)=>{
      const osc=ac.createOscillator();
      const gain=ac.createGain();
      osc.type=index%2===0?"sine":"triangle";
      osc.frequency.value=frequency;
      gain.gain.value=index===0?.75:.18;
      osc.connect(gain).connect(master);
      osc.start();
      oscillators.push({osc,gain});
    });

    const lfo=ac.createOscillator();
    const lfoGain=ac.createGain();
    lfo.frequency.value=.075;
    lfoGain.gain.value=.018;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();

    fallbackAudio={ac,master,oscillators,lfo};
  }catch(error){
    console.log("Reservemusikk kunne ikke starte:",error);
  }
}

async function startMusic(){
  if(!musicWanted)return;
  try{
    musicTrack.currentTime=0;
    await musicTrack.play();
  }catch(error){
    console.log("MP3 kunne ikke spilles. Starter reservemusikk.",error);
    startFallbackMusic();
  }
}

function stopMusic(){
  musicTrack.pause();
  if(fallbackAudio){
    fallbackAudio.master.gain.setTargetAtTime(0,fallbackAudio.ac.currentTime,.08);
  }
}

function resumeFallback(){
  if(fallbackAudio){
    fallbackAudio.master.gain.setTargetAtTime(.055,fallbackAudio.ac.currentTime,.08);
    fallbackAudio.ac.resume();
  }else{
    startFallbackMusic();
  }
}

function updateMusicButtons(){
  musicIntroBtn.textContent=musicWanted?"♫ MUSIKK PÅ":"♫ MUSIKK AV";
  musicIntroBtn.classList.toggle("off",!musicWanted);
  musicGameBtn.textContent=musicWanted?"♫":"♪";
  musicGameBtn.classList.toggle("off",!musicWanted);
}

function toggleMusic(){
  musicWanted=!musicWanted;
  updateMusicButtons();
  if(musicWanted){
    musicTrack.play().catch(()=>resumeFallback());
  }else{
    stopMusic();
  }
}

musicIntroBtn.onclick=toggleMusic;
musicGameBtn.onclick=toggleMusic;
updateMusicButtons();

$("startBtn").onclick=async()=>{
  await startMusic();
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
     enterChamberBtn.classList.remove("hidden");
     say("Der åpnet den seg... Et større kammer ligger bak veggen.");
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

/* ---------- GRAVKAMMER 4.6 ---------- */
const chamber=$("chamber"),journal=$("journal"),chamberAurora=$("chamberAurora");
const chamberText=$("chamberDialogText"),chamberObjective=$("chamberObjective"),chamberProgress=$("chamberProgress");
const sarcophagus=$("sarcophagus"),symbolPuzzle=$("symbolPuzzle"),treasureChest=$("treasureChest"),compassArtifact=$("compassArtifact");
let chamberX=7,chamberLeft=false,chamberRight=false,chamberStage=0,glyphs=[];

function chamberSay(text){chamberText.textContent=text}
function chamberGoal(text,n){chamberObjective.textContent=text;chamberProgress.textContent=n+" / 3"}

enterChamberBtn.onclick=()=>{
  show(chamber);
  chamberX=7;
  chamberAurora.style.left=chamberX+"%";
  chamberStage=0;
  glyphs=[];
  symbolPuzzle.classList.remove("solved");
  symbolPuzzle.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
  sarcophagus.classList.remove("open");
  treasureChest.classList.remove("revealed","open");
  compassArtifact.classList.remove("show");
  chamberGoal("Undersøk hieroglyfene",1);
  chamberSay("Utrolig... veggene er dekket av hieroglyfer. Ta deg tid til å se.");
};

function chamberHold(id,key){
  const b=$(id);
  const down=e=>{e.preventDefault();if(key==="left")chamberLeft=true;else chamberRight=true};
  const up=e=>{e.preventDefault();if(key==="left")chamberLeft=false;else chamberRight=false};
  ["pointerdown","touchstart"].forEach(t=>b.addEventListener(t,down,{passive:false}));
  ["pointerup","pointercancel","pointerleave","touchend"].forEach(t=>b.addEventListener(t,up,{passive:false}));
}
chamberHold("chamberLeft","left");
chamberHold("chamberRight","right");

symbolPuzzle.querySelectorAll("button").forEach(button=>{
  button.onclick=()=>{
    if(chamberStage!==1)return;
    glyphs.push(button.dataset.glyph);
    button.classList.add("selected");
    if(glyphs.length===3){
      if(glyphs.join(",")==="sun,eye,ankh"){
        chamberStage=2;
        symbolPuzzle.classList.add("solved");
        sarcophagus.classList.add("open");
        treasureChest.classList.add("revealed");
        chamberGoal("Undersøk gullkisten",3);
        chamberSay("Sol, øye og liv. Sarkofagen skjulte en ny sokkel... og en gullkiste.");
      }else{
        chamberSay("Rekkefølgen er feil. Les veggen fra soloppgang mot livstegnet.");
        glyphs=[];
        setTimeout(()=>symbolPuzzle.querySelectorAll("button").forEach(b=>b.classList.remove("selected")),450);
      }
    }
  };
});

$("chamberInspect").onclick=()=>{
  if(chamberStage===0){
    if(chamberX<30){
      chamberSay("Jeg må gå nærmere hieroglyfene i midten av kammeret.");
      return;
    }
    chamberStage=1;
    chamberGoal("Løs vokternes rekkefølge",2);
    chamberSay("Innskriften sier: Solen ser. Øyet vokter. Livet åpner.");
    return;
  }
  if(chamberStage===1){
    chamberSay("Trykk symbolene i denne rekkefølgen: sol, øye og ankh.");
    return;
  }
  if(chamberStage===2){
    if(chamberX<43){
      chamberSay("Jeg må stå nærmere gullkisten.");
      return;
    }
    chamberStage=3;
    treasureChest.classList.add("open");
    compassArtifact.classList.add("show");
    chamberGoal("Før funnet i feltdagboken",3);
    chamberSay("Et kompass... men nålen peker ikke mot nord. Den peker mot Mykene.");
    setTimeout(()=>show(journal),2500);
  }
};

$("closeJournal").onclick=()=>show(chamber);

function chamberLoop(){
  if(chamber.classList.contains("active")){
    if(chamberLeft){
      chamberX-=.42;
      chamberAurora.classList.add("face-left","walk");
    }
    if(chamberRight){
      chamberX+=.42;
      chamberAurora.classList.remove("face-left");
      chamberAurora.classList.add("walk");
    }
    if(!chamberLeft&&!chamberRight)chamberAurora.classList.remove("walk");
    chamberX=Math.max(4,Math.min(83,chamberX));
    chamberAurora.style.left=chamberX+"%";
  }
  requestAnimationFrame(chamberLoop);
}
requestAnimationFrame(chamberLoop);

})();