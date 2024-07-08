import GameObject from "./GameObject.js";

export default class Bot extends GameObject {
  constructor(id, x, y, w, h, game) {
    super(x, y, w, h, "red");
    this.id = id;
    this.speed = 50;
    this.radius = 10;
    this.game = game;
    this.x = x;
    this.y = y;
    this.directionAngle = 0;
    this.targetRadius = 100;
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
    this.attackRadius = 30;
    this.nextDirectionPoint = { x: 10, y: 10 };
  }

  move(dt) {
    if (this.target) {
      this.directionAngle = Math.atan2(
        this.target.y - this.y,
        this.target.x - this.x
      );
      const nextX = this.x + Math.cos(this.directionAngle) * this.speed * dt;
      const nextY = this.y + Math.sin(this.directionAngle) * this.speed * dt;

      if (
        !this.isColliding(nextX, nextY) &&
        this.game.map.isWalkable(nextX, nextY)
      ) {
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

      if (
        !this.isColliding(nextX, nextY) &&
        this.game.map.isWalkable(nextX, nextY)
      ) {
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

  isColliding(nextX, nextY) {
    // Check for collisions with the player
    const player = this.game.player;
    const distToPlayer = Math.sqrt(
      Math.pow(nextX - player.x, 2) + Math.pow(nextY - player.y, 2)
    );
    if (distToPlayer < this.radius + player.radius) {
      return true;
    }

    // Check for collisions with other bots
    for (let bot of this.game.bots) {
      if (bot.id !== this.id) {
        const distToBot = Math.sqrt(
          Math.pow(nextX - bot.x, 2) + Math.pow(nextY - bot.y, 2)
        );
        if (distToBot < this.radius + bot.radius) {
          return true;
        }
      }
    }

    return false;
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

    const attackX = this.x + Math.cos(this.directionAngle) * 20;
    const attackY = this.y + Math.sin(this.directionAngle) * 20;

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
      }
    }
  }

  update(game, dt) {
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

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      // Handle bot death
      this.game.bots = this.game.bots.filter((bot) => bot.id !== this.id);
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
  }
}
