import { Game } from "./engine/game.js";
import { Input } from "./engine/input.js";
import { Dialogue } from "./engine/dialogue.js";
import { EgyptScene } from "./scenes/egypt.js";

const canvas=document.getElementById("game");
const input=new Input();
document.querySelectorAll("[data-a]").forEach(b=>input.bindButton(b,b.dataset.a));
const dialogue=new Dialogue(document.getElementById("dialog"),document.getElementById("dialogText"));
const game=new Game(canvas,input,dialogue);

document.getElementById("start").onclick=()=>{
  document.getElementById("intro").classList.remove("active");
  document.getElementById("hud").classList.remove("hidden");
  document.getElementById("controls").classList.remove("hidden");
  game.setScene(new EgyptScene(game));
  game.start();
};
window.onresize=()=>game.resize();
