import GameObject from "./GameObject.js";

export default class DeathAnimation extends GameObject {
  constructor(x, y, game) {
    super(x, y);
    this.game = game;
    this.currentFrame = 0;
    this.animationTime = Date.now();
    this.animationDuration = 150;
    this.totalFrames = 3;
    this.hideTime = 5000; // 2 seconds before starting fade out
    this.deathImage = game.loader.getImage("death");
    this.fadeOutStart = null;
    this.fadeOutDuration = 2000; // 1 second for fade out
    this.alpha = 1;
  }

  draw(ctx, camera) {
    const now = Date.now();

    if (now - this.animationTime >= this.animationDuration) {
        this.currentFrame = this.currentFrame >= this.totalFrames ? 3 : this.currentFrame + 1;
        this.animationTime = now;
  
        if (this.currentFrame >= this.totalFrames && !this.fadeOutStart) {
          this.fadeOutStart = now + this.hideTime; // Set the fade-out start time to 2 seconds after animation ends
        }
      }

    ctx.save();

    if (this.fadeOutStart && now >= this.fadeOutStart) {
        const timeSinceFadeOutStart = now - this.fadeOutStart;
  
        if (timeSinceFadeOutStart >= this.fadeOutDuration) {
          this.alpha = 0; // Ensure alpha is exactly 0 at the end of fade out
        } else {
          this.alpha = 1 - timeSinceFadeOutStart / this.fadeOutDuration;
        }
  
        ctx.globalAlpha = this.alpha;
      }
  

    if (this.alpha >= 0) {
      ctx.drawImage(
        this.deathImage,
        this.currentFrame * 59,
        0,
        59,
        46,
        this.x - camera.x - 59,
        this.y - camera.y - 46,
        59 * 2,
        46 * 2
      );
    }

    ctx.restore();
  }
}
