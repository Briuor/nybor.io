import GameObject from "./GameObject.js";

export default class Bot extends GameObject {
  constructor(id, x, y, game) {
    super(x, y, 32, "red");
    this.id = id;
    this.speed = 80;
    this.game = game;
    this.x = x;
    this.y = y;
    this.directionAngle = 0;
    this.targetRadius = 180;
    this.target = null;
    this.health = 50;
    this.maxHealth = 50;
    this.damage = 10; // Damage dealt per attack
    this.attack = {
      duration: 300, // ms
      isAttacking: false,
      time: null,
      waitTime: null,
    };
    this.attackRadius = 90;
    this.attackRange = 40;
    this.nextDirectionPoint = { x: 10, y: 10 };
    this.impulse = { x: 0, y: 0, duration: 0 };
  }

  move(dt) {
    if (this.target) {
      this.directionAngle = Math.atan2(
        this.target.y - this.y,
        this.target.x - this.x
      );
      const nextX = this.x + Math.cos(this.directionAngle) * this.speed * dt;
      const nextY = this.y + Math.sin(this.directionAngle) * this.speed * dt;

      if (this.game.map.isWalkable(nextX, nextY)) {
        this.x = nextX;
        this.y = nextY;
      }
    } else {
      this.directionAngle = Math.atan2(
        this.nextDirectionPoint.y - this.y,
        this.nextDirectionPoint.x - this.x
      );
      const nextX = this.x + Math.cos(this.directionAngle) * this.speed * dt;
      const nextY = this.y + Math.sin(this.directionAngle) * this.speed * dt;

      if (this.game.map.isWalkable(nextX, nextY)) {
        this.x = nextX;
        this.y = nextY;
      }

      const distance = Math.sqrt(
        Math.pow(this.nextDirectionPoint.x - this.x, 2) +
          Math.pow(this.nextDirectionPoint.y - this.y, 2)
      );

      if (distance <= 20) {
        this.nextDirectionPoint.x =
          Math.random() * this.game.map.getMapMaxWidth;
        this.nextDirectionPoint.y =
          Math.random() * this.game.map.getMapMaxHeight;
      }
    }
  }

  findTargetToChase(enemies) {
    let nearEnemy = null;
    for (let enemy of enemies) {
      const distToEnemy = Math.sqrt(
        Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
      );
      if (distToEnemy <= this.targetRadius) {
        nearEnemy = enemy;
      }
    }
    return nearEnemy;
  }

  attackAction() {
    console.log(`${this.id} attacked ${this.target.id}`);
    this.attack.isAttacking = true;
    this.attack.time = Date.now();

    const attackX = this.x + Math.cos(this.directionAngle) * this.attackRange;
    const attackY = this.y + Math.sin(this.directionAngle) * this.attackRange;

    const enemies = [
      this.game.player,
      ...this.game.bots.filter((bot) => bot.id !== this.id),
    ];
    for (let i = 0; i < enemies.length; i++) {
      let enemy = enemies[i];
      const dist = Math.sqrt(
        Math.pow(attackX - enemy.x, 2) + Math.pow(attackY - enemy.y, 2)
      );

      if (dist <= 2 * enemy.radius) {
        enemy.health -= this.damage;
        if (enemy.health <= 0) {
          enemy.health = 0;

          // Handle death
          if (enemy.id === this.game.player.id) {
            console.log("game over");
          } else {
            this.game.bots = this.game.bots.filter(
              (bot) => bot.id !== enemy.id
            );
          }
        }

        // Apply impulse
        const impulseStrength = 100; // Adjust this value as needed
        const impulseDuration = 0.5; // Duration in seconds
        const angle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
        enemy.impulse.x = Math.cos(angle) * impulseStrength;
        enemy.impulse.y = Math.sin(angle) * impulseStrength;
        enemy.impulse.duration = impulseDuration;
      }
    }
  }

  update(game, dt) {
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

    const target = this.findTargetToChase([
      game.player,
      ...game.bots.filter((bot) => bot.id !== this.id),
    ]);
    this.target = target ?? null;

    if (this.target) {
      // check if target still exists and is still alive searching by game.bots
      const target = [this.game.player, ...this.game.bots].find(
        (bot) => bot.id === this.target.id
      );
      if (target) {
        this.target = target;
      } else {
        this.target = null;
      }
    }

    if (this.target && !this.attack.isAttacking) {
      const distToTarget = Math.sqrt(
        Math.pow(this.target.x - this.x, 2) +
          Math.pow(this.target.y - this.y, 2)
      );

      if (distToTarget <= this.attackRadius) {
        if (this.attack.waitTime === null) {
          // Set a random delay before attacking
          this.attack.waitTime = Date.now() + Math.random() * 500 + 100; // random delay between 500ms and 600ms
        }

        if (Date.now() >= this.attack.waitTime) {
          this.attackAction();
          this.attack.waitTime = null; // Reset wait time after attacking
        }
      } else {
        this.attack.waitTime = null; // Reset wait time if the target moves out of the attack radius
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

  draw(ctx, camera) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw health bar
    ctx.fillStyle = "red";
    ctx.fillRect(this.x - camera.x - 50, this.y - camera.y - 20, 100, 10);
    ctx.fillStyle = "green";
    ctx.fillRect(
      this.x - camera.x - 50,
      this.y - camera.y - 20,
      (this.health / this.maxHealth) * 100,
      10
    );

    // Target Area
    ctx.beginPath();
    ctx.arc(
      this.x - camera.x,
      this.y - camera.y,
      this.targetRadius,
      0,
      2 * Math.PI
    );
    ctx.stroke();

    // Attack Area
    ctx.beginPath();
    ctx.arc(
      this.x - camera.x,
      this.y - camera.y,
      this.attackRadius,
      0,
      2 * Math.PI
    );
    ctx.stroke();

    // attack field
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(
      this.x - camera.x + Math.cos(this.directionAngle) * this.attackRange,
      this.y - camera.y + Math.sin(this.directionAngle) * this.attackRange,
      32,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}
