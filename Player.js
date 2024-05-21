import GameObject from "./GameObject.js";

export default class Player extends GameObject {
  constructor(x, y, w, h) {
    super(x, y, w, h, "white");
    this.speed = 100
    this.direction = { right: false, left: false, up: false, down: false };
    document.addEventListener("keydown", (e) =>
      this.handleKeyBoardInput(e, true, this.direction)
    );
    document.addEventListener("keyup", (e) =>
      this.handleKeyBoardInput(e, false, this.direction)
    );
  }

  handleKeyBoardInput(e, value, direction) {
    if (e.which == 39 || e.which == 68) direction.right = value;
    if (e.which == 37 || e.which == 65) direction.left = value;
    if (e.which == 38 || e.which == 87) direction.down = value;
    if (e.which == 40 || e.which == 83) direction.up = value;
  }

  move(dt) {
    if (this.direction.right) this.x += this.speed * dt;
    if (this.direction.left) this.x -= this.speed * dt;
    if (this.direction.down) this.y -= this.speed * dt;
    if (this.direction.up) this.y += this.speed * dt;
  }

  draw(ctx, camera) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(camera.width / 2, camera.height / 2, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
}
