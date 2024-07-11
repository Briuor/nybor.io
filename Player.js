import GameObject from "./GameObject.js";
import pixelCanvas from "./pixelCanvas.js";

export default class Player extends GameObject {
  constructor(id, name, x, y, game) {
    super(x, y, 32, "white");
    this.name = name;
    this.id = id;
    this.speed = 80;
    this.directionAngle = 0;
    this.attack = {
      duration: 300, // ms
      isAttacking: false,
      time: null,
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
    this.attack.time = Date.now();
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
      if (
        Math.abs(this.x - orb.x) < this.radius &&
        Math.abs(this.y - orb.y) < this.radius
      ) {
        this.exp += orb.exp;

        if (this.exp >= this.expToNextLevel) {
          this.exp = 0;
          this.level++;
          this.maxHealth += 10;
          this.health = this.maxHealth;
        }
        
        this.game.orbs = this.game.orbs.filter((o) => o !== orb);
      }
    }

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

    // Draw attack area
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
    this.pixelCanvas.drawName(ctx, this.name, 1.5, Math.floor(camera.width/2 - (this.name.length * 2)) -5, Math.floor(camera.height/2) +40 );
  }
}
