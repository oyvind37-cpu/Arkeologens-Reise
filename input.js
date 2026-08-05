export class Input{
constructor(){this.state={left:false,right:false,jump:false,interact:false};this.pressed=new Set()}
bindButton(btn,a){const d=e=>{e.preventDefault();this.state[a]=true;this.pressed.add(a)};const u=e=>{e.preventDefault();this.state[a]=false};btn.addEventListener("pointerdown",d);["pointerup","pointercancel","pointerleave"].forEach(x=>btn.addEventListener(x,u))}
consume(a){if(!this.pressed.has(a))return false;this.pressed.delete(a);return true}
}
