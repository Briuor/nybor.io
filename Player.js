import GameObject from "./GameObject.js";
import pixelCanvas from "./pixelCanvas.js";

export default class Player extends GameObject {
  constructor(id, name, x, y, game) {
    super(x, y, 32, "white");
    this.name = name;
    this.id = id;
    this.speed = 200;
    this.directionAngle = 0;
    this.attack = {
      duration: 300, // ms
      isAttacking: false,
      time: null,
      angle: 0,
    };
    this.game = game;
    this.health = 50;
    this.maxHealth = 50;
    this.damage = 20; // Damage dealt per attack
    this.attackRange = 40;
    this.impulse = { x: 0, y: 0, duration: 0 };
    this.level = 1;
    this.exp = 0;
    this.expToNextLevel = 50;
    this.pixelCanvas = new pixelCanvas();
    this.kills = 0;

    this.playerImage = null;
    this.swordImage = null;
    this.attackImage = null;
    this.currentFrame = 0;
    this.animationTime = Date.now();
    this.animationDuration = 100;

    // Bind the this context for the event listener
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("click", this.handleClick.bind(this));
  }

  handleMouseMove(e) {
    const x =
      e.clientX -
      this.game.canvas.getBoundingClientRect().left -
      this.game.camera.width / 2;
    const y =
      e.clientY -
      this.game.canvas.getBoundingClientRect().top -
      this.game.camera.height / 2;
    this.directionAngle = Math.atan2(y, x);
  }

  attackAction() {
    this.attack.isAttacking = true;
    this.attack.animation = true;
    this.currentFrame = 0;
    this.attack.time = Date.now();
    this.attack.angle = this.directionAngle;
    const attackX = this.x + Math.cos(this.directionAngle) * this.attackRange;
    const attackY = this.y + Math.sin(this.directionAngle) * this.attackRange;

    for (let i = 0; i < this.game.bots.length; i++) {
      let bot = this.game.bots[i];
      const dist = Math.sqrt(
        Math.pow(attackX - bot.x, 2) + Math.pow(attackY - bot.y, 2)
      );

      if (dist <= 2 * bot.radius) {
        bot.health -= this.damage;
        if (bot.health <= 0) {
          bot.health = 0;
          this.kills += 1;
          // Handle bot death
          this.game.bots = this.game.bots.filter((b) => b.id !== bot.id);
          this.game.updateLeaderBoard();
        }
        // Apply impulse
        const impulseStrength = 100; // Adjust this value as needed
        const impulseDuration = 0.5; // Duration in seconds
        const angle = Math.atan2(bot.y - this.y, bot.x - this.x);
        bot.impulse.x = Math.cos(angle) * impulseStrength;
        bot.impulse.y = Math.sin(angle) * impulseStrength;
        bot.impulse.duration = impulseDuration;
      }
    }
  }

  handleClick() {
    if (this.attack.isAttacking) return;

    this.attackAction();
  }

  update(dt) {
    if (this.impulse.duration > 0) {
      const impulseX = this.impulse.x * dt;
      const impulseY = this.impulse.y * dt;
      let nextX = this.x + impulseX;
      let nextY = this.y + impulseY;

      // Check for collisions with the map
      if (!this.game.map.isWalkable(nextX, nextY)) {
        nextX = this.x;
        nextY = this.y;
      }

      this.x = nextX;
      this.y = nextY;
      this.impulse.duration -= dt;
    }

    for (let i = 0; i < this.game.orbs.length; i++) {
      let orb = this.game.orbs[i];
      const dist = Math.sqrt(
        Math.pow(this.x - orb.x, 2) + Math.pow(this.y - orb.y, 2)
      );
      if (dist < (this.radius + orb.radius)) {
        this.exp += orb.exp;

        if (this.exp >= this.expToNextLevel) {
          this.exp = 0;
          this.level++;
          this.maxHealth += 10;
          this.health = this.maxHealth;
        }

        this.game.orbs = this.game.orbs.filter((o) => o.id !== orb.id);
      }
    }

    if (this.attack.isAttacking) {
      if (Date.now() >= this.attack.time + this.attack.duration) {
        this.attack.isAttacking = false;
      }
    }
    this.move(dt);
  }

  move(dt) {
    const nextX = this.x + Math.cos(this.directionAngle) * this.speed * dt;
    const nextY = this.y + Math.sin(this.directionAngle) * this.speed * dt;

    let willCollide = false;

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

  draw(ctx, camera) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(camera.width / 2, camera.height / 2, this.radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(
      camera.width / 2 + Math.cos(this.directionAngle) * this.attackRange,
      camera.height / 2 + Math.sin(this.directionAngle) * this.attackRange,
      32,
      0,
      2 * Math.PI
    );
    ctx.fill();

    let col;
    let angle = (180 * this.directionAngle) / Math.PI;
    if (angle < 0) angle = 360 + angle;

    if (angle >= 90 && angle < 270) {
      col = this.attack.animation ? 2 : 0;
    } else {
      col = this.attack.animation ? 3 : 1;
    }

    let totalFrames = this.attack.animation ? 3 : 4;

    if (Date.now() - this.animationDuration >= this.animationTime) {
      this.currentFrame =
        this.currentFrame >= totalFrames ? 0 : this.currentFrame + 1;
      this.animationTime = Date.now();
    }
    if (
      this.attack.animation &&
      this.currentFrame == totalFrames &&
      totalFrames == 3
    ) {
      this.attack.animation = false;
    }

    // draw sword
    if (!this.attack.animation) {
      ctx.drawImage(
        this.swordImage,
        this.currentFrame * 35,
        col * 38,
        35,
        38,
        camera.width / 2 + (col == 0 ? -5 : -80),
        camera.height / 2 - 80,
        35 * 2.5,
        38 * 2.5
      );
    }

    ctx.drawImage(
      this.playerImage,
      this.currentFrame * 28,
      col * 26,
      28,
      26,
      camera.width / 2 - 28,
      camera.height / 2 - 26,
      28 * 2,
      26 * 2
    );
    ctx.restore();

    if (this.attack.animation) {
      ctx.save();

      ctx.translate(camera.width / 2, camera.height / 2);

      // Rotate the canvas to the direction angle (convert to radians)
      ctx.rotate(this.attack.angle + 3.14);
      console.log(this.attack.angle);
      ctx.drawImage(
        this.attackImage,
        this.currentFrame * 51,
        0,
        51,
        54,
        (-51 * 3) / 2, // offset by half image width
        (-54 * 3) / 2, // offset by half image height
        51 * 3,
        54 * 3
      );
      ctx.restore();
    }

    // Draw health bar
    ctx.fillStyle = "red";
    ctx.fillRect(camera.width / 2 - 50, camera.height / 2 + 55, 100, 10);
    ctx.fillStyle = "green";
    ctx.fillRect(
      camera.width / 2 - 50,
      camera.height / 2 + 55,
      (this.health / this.maxHealth) * 100,
      10
    );
    this.pixelCanvas.drawName(
      ctx,
      this.name,
      1.5,
      Math.floor(camera.width / 2 - this.name.length * 2) - 5,
      Math.floor(camera.height / 2) + 40
    );
  }
}
