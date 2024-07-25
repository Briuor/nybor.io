import DeathAnimation from "./DeathAnimation.js";
import GameObject from "./GameObject.js";
import Map from "./Map.js";
import pixelCanvas from "./pixelCanvas.js";

export default class Bot extends GameObject {
  constructor(id, name, x, y, exp, game) {
    super(x, y, 32, "red");
    this.id = id;
    this.name = name;
    this.speed = 120;
    this.game = game;
    this.x = x;
    this.y = y;
    this.directionAngle = 0;
    this.targetRadius = 250;
    this.target = null;
    this.health = 50;
    this.maxHealth = 50;
    this.damage = 20; // Damage dealt per attack
    this.attack = {
      duration: 300, // ms
      isAttacking: false,
      time: null,
      waitTime: null,
      animation: false,
      angle: 0,
    };
    this.attackRadius = 170;
    this.attackRange = 65;
    this.nextDirectionPoint = {
      x: this.game.map.randomPositionX(),
      y: this.game.map.randomPositionY(),
    };
    this.impulse = { x: 0, y: 0, duration: 0 };
    this.pixelCanvas = new pixelCanvas();
    this.kills = 0;
    this.exp = 0;
    this.expToNextLevel = 50;
    this.totalExp = 0;
    this.level = 1;
    console.log(exp)
    this.increaseExp(exp);
    this.maxLevel = 10;
    50, 100, 150, 200, 250, 300, 350, 400, 450, 500;
    500 + 450 + 400 + 350 + 300 + 250 + 200 + 150 + 100 + 50;


    this.botImage = game.loader.getImage("player");
    this.swordImage = game.loader.getImage("sc");
    this.attackImage = game.loader.getImage("atk");
    this.currentFrame = 0;
    this.animationTime = Date.now();
    this.animationDuration = 100;

    this.type = "bot";
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
        this.nextDirectionPoint.x = this.game.map.randomPositionX();
        this.nextDirectionPoint.y = this.game.map.randomPositionY();
      }
    }
  }

  checkTargetAreaCollision = (entities) => {
    let near = { entity: null, dist: Infinity };
    for (let entity of entities) {

      const dist = Math.sqrt(
        Math.pow(entity.x - this.x, 2) + Math.pow(entity.y - this.y, 2)
      );
      if (dist <= this.targetRadius && dist < near.dist) {
        near.entity = entity;
        near.dist = dist;
      }
    }
    return near.entity;
  };


  findTargetToChase() {
    const enemies = [
      this.game.player,
      ...this.game.bots.filter((bot) => bot.id !== this.id),
    ]

    const nearEnemy = this.checkTargetAreaCollision(enemies);
    if(nearEnemy) return nearEnemy;

    const nearOrb = this.checkTargetAreaCollision(this.game.orbs);
    if(nearOrb) return nearOrb;

  }

  attackAction() {
    this.game.attackAudio.play();
    this.attack.isAttacking = true;
    this.attack.animation = true;
    this.currentFrame = 0;
    this.attack.time = Date.now();
    this.attack.angle = this.directionAngle;

    const attackX = this.x + Math.cos(this.directionAngle) * this.attackRange;
    const attackY = this.y + Math.sin(this.directionAngle) * this.attackRange;

    const enemies = [
      ...(this.game.player.isActive ? [this.game.player] : []),
      ...this.game.bots.filter((bot) => bot.id !== this.id),
    ];
    for (let i = 0; i < enemies.length; i++) {
      let enemy = enemies[i];
      const dist = Math.sqrt(
        Math.pow(attackX - enemy.x, 2) + Math.pow(attackY - enemy.y, 2)
      );

      if (dist <= this.attackRange + enemy.radius) {
        this.kills += 1;
        this.increaseExp(Math.floor(enemy.exp > 30 ? enemy.exp / 3 : 10))
        if (enemy.id === this.game.player.id) {
          this.game.deathAudio.play();
          this.game.deathAnimations.push(
            new DeathAnimation(enemy.x, enemy.y, this.game)
          );
          this.game.player.isActive = false;
          setTimeout(() => {
            this.game.playAgainModal.classList.add("active");
          }, 2000);
        } else {
          this.game.deathAudio.play();
          this.game.deathAnimations.push(
            new DeathAnimation(enemy.x, enemy.y, this.game)
          );
          this.game.bots = this.game.bots.filter((bot) => bot.id !== enemy.id);
        }

        this.game.updateLeaderBoard();
      }
    }
  }

  increaseExp(exp) {
    this.exp += exp; 
    this.totalExp += exp;

    while(this.exp >= this.expToNextLevel) {
      this.level += 1;
      this.exp = this.exp % this.expToNextLevel;
      this.expToNextLevel *= 2;
    }

    if(this.level >= this.maxLevel) {
      this.exp = 0
      this.level = maxLevel;
    };
  }

  update(dt) {
    for (let i = 0; i < this.game.orbs.length; i++) {
      let orb = this.game.orbs[i];
      if (
        Math.abs(this.x - orb.x) < this.radius &&
        Math.abs(this.y - orb.y) < this.radius
      ) {
        this.increaseExp(orb.exp);
        this.game.orbs = this.game.orbs.filter((o) => o !== orb);
      }
    }

    const target = this.findTargetToChase();
    this.target = target ?? null;

    if (this.target) {
      // check if target still exists and is still alive searching by game.bots
      const target = [
        ...(this.game.player.isActive ? [this.game.player] : []),
        ...this.game.bots,
        ...this.game.orbs,
      ].find((bot) => bot.id === this.target.id);
      if (target) {
        this.target = target;
      } else {
        this.target = null;
      }
    }

    if (this.target && !this.attack.isAttacking && this.target.type !== "orb") {
      const distToTarget = Math.sqrt(
        Math.pow(this.target.x - this.x, 2) +
          Math.pow(this.target.y - this.y, 2)
      );

      if (distToTarget <= this.attackRadius) {
        if (this.attack.waitTime === null) {
          // Set a random delay before attacking
          this.attack.waitTime = Date.now() + Math.random() * 300 + 100; // random delay between 300ms and 400ms
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
    }
    this.move(dt);
  }

  draw(ctx, camera) {
    // ctx.fillStyle = this.color;
    // ctx.beginPath();
    // ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, 2 * Math.PI);
    // ctx.fill();

    // attack field
    // ctx.fillStyle = "black";
    // ctx.beginPath();
    // ctx.arc(
    //   this.x - camera.x + Math.cos(this.directionAngle) * this.attackRange,
    //   this.y - camera.y + Math.sin(this.directionAngle) * this.attackRange,
    //   this.attackRange,
    //   0,
    //   2 * Math.PI
    // );
    // ctx.fill();

    let col;
    let angle = (180 * this.directionAngle) / Math.PI;
    if (angle < 0) angle = 360 + angle;

    if (angle >= 90 && angle < 270) {
      col = this.attack.animation ? 2 : 0;
    } else {
      col = this.attack.animation ? 3 : 1;
    }

    let totalFrames = this.attack.animation ? 2 : 3;

    if (Date.now() - this.animationDuration >= this.animationTime) {
      this.currentFrame =
        this.currentFrame >= totalFrames ? 0 : this.currentFrame + 1;
      this.animationTime = Date.now();
    }
    if (
      this.attack.animation &&
      this.currentFrame == totalFrames &&
      totalFrames == 2
    ) {
      this.attack.animation = false;
    }

    // draw sword
    if (!this.attack.animation) {
      ctx.drawImage(
        this.swordImage,
        this.currentFrame * 58,
        col * 29,
        58,
        29,
        this.x - camera.x + (col == 0 ? -65 : -50),
        this.y - camera.y - 80,
        58 * 2,
        29 * 2
      );
    }

    ctx.drawImage(
      this.botImage,
      this.currentFrame * 38,
      col * 38,
      38,
      38,
      this.x - camera.x - 38,
      this.y - camera.y - 38,
      38 * 2,
      38 * 2
    );

    if (this.attack.animation) {
      ctx.save();

      ctx.translate(this.x - camera.x, this.y - camera.y);

      // Rotate the canvas to the direction angle (convert to radians)
      ctx.rotate(this.attack.angle);
      ctx.drawImage(
        this.attackImage,
        this.currentFrame * 52,
        0,
        52,
        76,
        (-52 * 3) / 2, // offset by half image width
        (-76 * 3) / 2, // offset by half image height
        52 * 3,
        76 * 3
      );
      ctx.restore();
    }

    // Draw health bar
    // ctx.fillStyle = "red";
    // ctx.fillRect(this.x - camera.x - 50, this.y - camera.y + 55, 100, 10);
    // ctx.fillStyle = "green";
    // ctx.fillRect(
    //   this.x - camera.x - 50,
    //   this.y - camera.y + 55,
    //   (this.health / this.maxHealth) * 100,
    //   10
    // );

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

    this.pixelCanvas.drawName(
      ctx,
      this.name,
      1.5,
      Math.floor(this.x - camera.x - 5 - this.name.length * 2),
      this.y - camera.y + 40
    );
  }
}
