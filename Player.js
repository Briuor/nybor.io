import GameObject from "./GameObject.js";

export default class Player extends GameObject {
  constructor(x, y, w, h, game) {
    super(x, y, w, h, "white");
    this.speed = 50;
    this.directionAngle = 0;
    this.attack = {
      duration: 300, // seg
      isAttacking: false,
      time: null,
    };
    this.game = game;
    this.radius = 10;

    // Bind the this context for the event listener
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("click", this.handleClick.bind(this));
  }

  handleMouseMove(e) {
    const x = e.clientX - this.game.canvas.getBoundingClientRect().left - this.game.camera.width/2
    const y = e.clientY - this.game.canvas.getBoundingClientRect().top - this.game.camera.height/2
    this.directionAngle = Math.atan2(y, x);
  }

  attackAction() {
    this.attack.isAttacking = true;
    this.attack.time = Date.now();
    const attackX = this.x + Math.cos(this.directionAngle) * 20;
    const attackY = this.y + Math.sin(this.directionAngle) * 20;

    for (let i = 0; i < this.game.bots.length; i++) {
      let bot = this.game.bots[i];
      const dist = Math.sqrt(
        Math.pow(attackX - bot.x, 2) + Math.pow(attackY - bot.y, 2)
      );

      if (dist <= 2 * bot.radius) {
        this.game.bots = this.game.bots.filter(b => b.id !== bot.id)
      }
    }
  }

  handleClick() {
    if (this.attack.isAttacking) return;

    this.attackAction();
  }

  update(dt) {
    if (this.attack.isAttacking) {
      if (Date.now() >= this.attack.time + this.attack.duration) {
        this.attack.isAttacking = false;
      }
    } else {
      this.move(dt);
    }
  }

  move(dt) {
     const nextX = this.x + Math.cos(this.directionAngle) * this.speed * dt;
    const nextY = this.y + Math.sin(this.directionAngle) * this.speed * dt;

    let willCollide = false;

    // Check for collisions with bots
    for (let bot of this.game.bots) {
      if (this.isColliding(nextX, nextY, bot)) {
        this.resolveCollision(bot);
        willCollide = true;
      }
    }

    // Check for collisions with the map
    if (!this.game.map.isWalkable(nextX, nextY)) {
      willCollide = true;
    }

    // Update position if no collision
    if (!willCollide) {
      this.x = nextX;
      this.y = nextY;
    }
  }

  isColliding(nextX, nextY, entity) {
    const distance = Math.sqrt(
      Math.pow(nextX - entity.x, 2) + Math.pow(nextY - entity.y, 2)
    );
    return distance < this.radius + entity.radius;
  }

  resolveCollision(entity) {
    const overlap = this.radius + entity.radius - Math.sqrt(
      Math.pow(this.x - entity.x, 2) + Math.pow(this.y - entity.y, 2)
    );

    const angle = Math.atan2(entity.y - this.y, entity.x - this.x);

    this.x -= Math.cos(angle) * overlap / 2;
    this.y -= Math.sin(angle) * overlap / 2;

    entity.x += Math.cos(angle) * overlap / 2;
    entity.y += Math.sin(angle) * overlap / 2;
  }

  draw(ctx, camera) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(camera.width / 2, camera.height / 2, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    // attack area
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(
      camera.width / 2 + Math.cos(this.directionAngle) * 20,
      camera.height / 2 + Math.sin(this.directionAngle) * 20,
      10,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}
