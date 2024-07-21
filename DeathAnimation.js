import GameObject from "./GameObject.js";

export default class DeathAnimation extends GameObject {

    constructor(x, y, game) {
        super(x, y);
        this.game = game;
        this.currentFrame = 0;
        this.animationTime = Date.now();
        this.animationDuration = 150;
        this.totalFrames = 3;
        this.deathImage = game.loader.getImage("death");
    }

    draw(ctx, camera) {
        if (Date.now() - this.animationDuration >= this.animationTime) {
            this.currentFrame =
                this.currentFrame >= this.totalFrames ? 3 : this.currentFrame + 1;
            this.animationTime = Date.now();
        }
        ctx.drawImage(
            this.deathImage,
            this.currentFrame * 59,
            0,
            59,
            46,
            this.x - camera.x- 59,
            this.y - camera.y- 46,
            59 * 2, 
            46 * 2
          );
      }
}