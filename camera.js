export class Camera{
constructor(viewWidth,worldWidth){this.x=0;this.viewWidth=viewWidth;this.worldWidth=worldWidth}
update(targetX){const d=targetX-this.viewWidth*.38;this.x+=(d-this.x)*.12;this.x=Math.max(0,Math.min(this.worldWidth-this.viewWidth,this.x))}
}
