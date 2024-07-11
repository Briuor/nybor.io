import GameObject from "./GameObject.js";

export default class Orb extends GameObject {

    constructor(x, y, exp) {
        super(x, y, 10, "pink");
        this.exp = exp
    }

    draw(ctx, camera) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius*this.exp/10, 0, 2 * Math.PI);
        ctx.fill();
      }
}