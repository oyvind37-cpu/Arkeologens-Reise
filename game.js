export class Game{
constructor(canvas,input,dialogue){this.canvas=canvas;this.ctx=canvas.getContext("2d");this.input=input;this.dialogue=dialogue;this.scene=null;this.running=false;this.last=0;this.resize()}
resize(){const r=Math.min(devicePixelRatio||1,2);this.canvas.width=innerWidth*r;this.canvas.height=innerHeight*r;this.canvas.style.width=innerWidth+"px";this.canvas.style.height=innerHeight+"px";this.ctx.setTransform(r,0,0,r,0,0);this.width=innerWidth;this.height=innerHeight}
setScene(scene){this.scene=scene;scene.enter()}
start(){if(this.running)return;this.running=true;requestAnimationFrame(this.loop.bind(this))}
loop(t){const dt=Math.min((t-this.last)/1000||0,.035);this.last=t;this.scene.update(dt);this.scene.render(this.ctx,this.width,this.height);requestAnimationFrame(this.loop.bind(this))}
}
