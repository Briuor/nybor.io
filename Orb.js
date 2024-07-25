import GameObject from "./GameObject.js";

export default class Orb extends GameObject {

    constructor(id, x, y, exp, game) {
        super(x, y, 20, "pink");
        this.id = id;
        this.exp = exp
        this.type = "orb",
        this.radius = this.radius * this.exp/10
        this.heartImage = game.loader.getImage("heart");
        this.currentFrame = 0;
        this.animationTime = Date.now();
        this.animationDuration = 150;
        this.totalFrames = 3;
    }

    draw(ctx, camera) {
        if (Date.now() - this.animationDuration >= this.animationTime) {
            this.currentFrame =
                this.currentFrame >= this.totalFrames ? 0 : this.currentFrame + 1;
            this.animationTime = Date.now();
        }


        // ctx.fillStyle = this.color;
        // ctx.beginPath();
        // ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, 2 * Math.PI);
        // ctx.fill();
        
        ctx.drawImage(
            this.heartImage,
            this.currentFrame * 25,
            0,
            25,
            22,
            this.x - camera.x - this.radius,
            this.y - camera.y - this.radius,
            this.radius*2,
            this.radius*2,
          );


        
      }
}