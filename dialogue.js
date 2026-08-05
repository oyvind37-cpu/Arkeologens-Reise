export class Dialogue{
constructor(box,text){this.box=box;this.text=text;this.timer=null}
say(t,d=4200){clearTimeout(this.timer);this.text.textContent=t;this.box.classList.remove("hidden");this.timer=setTimeout(()=>this.box.classList.add("hidden"),d)}
}
