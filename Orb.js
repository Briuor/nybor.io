import GameObject from "./GameObject.js";

export default class Orb extends GameObject {

    constructor(id, x, y, exp) {
        super(x, y, 10, "pink");
        this.id = id;
        this.exp = exp
        this.radius = this.radius * this.exp/10
    }

    draw(ctx, camera) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
      }
}