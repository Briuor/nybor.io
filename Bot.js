import DeathAnimation from "./DeathAnimation.js";
import GameObject from "./GameObject.js";
import Map from "./Map.js";
import pixelCanvas from "./pixelCanvas.js";

export default class Bot extends GameObject {
  constructor(id, name, x, y, exp, game) {
    super(x, y, 32, "red");
    this.id = id;
    this.name = name;
    this.game = game;
    this.x = x;
    this.y = y;
    this.directionAngle = 0;
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
    this.targetRadius = Math.random() * 500 + 300;
    this.attackRadius = Math.random() * 170 + 230; // 170 is ok
    this.attackRange = 80;
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
    this.maxLevel = 10;
    this.levels = [
      { image: game.loader.getImage("human"), width: 60, height: 72 },
      { image: game.loader.getImage("viking"), width: 60, height: 72 },
      { image: game.loader.getImage("rogue"), width: 60, height: 72 },
      { image: game.loader.getImage("bard"), width: 62.5, height: 72 },
      { image: game.loader.getImage("soldier"), width: 60, height: 72 },
      { image: game.loader.getImage("mage"), width: 63, height: 78 },
      { image: game.loader.getImage("ninja"), width: 60, height: 72 },
      { image: game.loader.getImage("samurai"), width: 66, height: 72 },
      { image: game.loader.getImage("soldierarmor"), width: 69, height: 84 },
      { image: game.loader.getImage("golden"), width: 69, height: 82 },
    ];
    this.swordImage = game.loader.getImage("sc");
    this.attackImage = game.loader.getImage("atk");
    this.currentFrame = 0;
    this.animationTime = Date.now();
    this.animationDuration = 100;

    this.type = "bot";
    this.baseSpeed = 160; // Base speed
    this.boostedSpeed = 100; // Boosted speed
    this.isBoosting = false; // Boost state
    this.boostDuration = 0; // Boost duration in milliseconds
    this.boostCooldown = 5000; // Cooldown before another boost can occur
    this.lastBoostTime = 0; // Last time boost was activated
    this.increaseExp(exp);

  }

  move(dt) {
    let currentSpeed = this.isBoosting ? this.baseSpeed+this.boostedSpeed : this.baseSpeed;
    if (this.isBoosting && this.level !== this.maxLevel) {
      this.exp -= dt * 3; // Consume 10 exp per second during boost
      this.totalExp -= dt * 3;
      if (this.exp <= 0) {
        this.exp = 0;
        this.isBoosting = false;
      }
    }

    if (this.exp <= 0 && this.level === 1) {
      this.exp = 0;
      this.totalExp  = 0;
    }

    if (this.target) {
      this.directionAngle = Math.atan2(
        this.target.y - this.y,
        this.target.x - this.x
      );
      const nextX = this.x + Math.cos(this.directionAngle) * currentSpeed * dt;
      const nextY = this.y + Math.sin(this.directionAngle) * currentSpeed * dt;

      if (this.game.map.isWalkable(nextX, nextY)) {
        this.x = nextX;
        this.y = nextY;
      }
    } else {
      this.directionAngle = Math.atan2(
        this.nextDirectionPoint.y - this.y,
        this.nextDirectionPoint.x - this.x
      );
      const nextX = this.x + Math.cos(this.directionAngle) * currentSpeed * dt;
      const nextY = this.y + Math.sin(this.directionAngle) * currentSpeed * dt;

      if (this.game.map.isWalkable(nextX, nextY)) {
        this.x = nextX;
        this.y = nextY;
      }

      const distance = Math.sqrt(
        Math.pow(this.nextDirectionPoint.x - this.x, 2) +
          Math.pow(this.nextDirectionPoint.y - this.y, 2)
      );

      if (distance <= 40) {
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
      ...(this.game.player.isActive ? [this.game.player] : []),
      ...this.game.bots.filter((bot) => bot.id !== this.id),
    ];

    const nearEnemy = this.checkTargetAreaCollision(enemies);
    if (nearEnemy) return nearEnemy;

    const nearOrb = this.checkTargetAreaCollision(this.game.orbs);
    if (nearOrb) return nearOrb;

    return null
  }

  // check if the bot is in the camera area to play a sound
  inCamera() {
    const x = this.x;
    const y = this.y;
    if (
      x < this.game.camera.x + this.game.camera.width &&
      x > this.game.camera.x &&
      y < this.game.camera.y + this.game.camera.height &&
      y > this.game.camera.y
    ) {
      return true;
    }
    return false;
  }

  attackAction() {
    if (this.inCamera()) {
      this.game.attackAudio.play();
    }

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
        this.increaseExp(enemy.level*20);
        if (enemy.id === this.game.player.id) {
          if (this.inCamera()) {
            this.game.deathAudio.play();
          }
          this.game.deathAnimations.push(
            new DeathAnimation(enemy.x, enemy.y, this.game)
          );
          this.game.player.isActive = false;
          this.game.endKills.innerText = this.game.player.kills;
          this.game.endExp.innerText = Math.round(this.game.player.totalExp); 

          if(this.game.player.kills > this.game.save.kills) this.game.save.kills = this.game.player.kills;
          if(this.game.player.totalExp > this.game.save.exp) this.game.save.exp = this.game.player.totalExp;
          localStorage.setItem("save", JSON.stringify(this.game.save));

          setTimeout(() => {
            this.game.playAgainModal.classList.add("active");
          }, 2000);
        } else {
          if (this.inCamera()) {
            this.game.deathAudio.play();
          }
          this.game.deathAnimations.push(
            new DeathAnimation(enemy.x, enemy.y, this.game)
          );
          this.game.bots = this.game.bots.filter((bot) => bot.id !== enemy.id);
        }

        this.game.updateLeaderBoard();
      }
    }
  }

  startEvolutionAnimation() {
    this.evolution.time = Date.now();
    this.evolution.animation = true;
  }

  increaseExp(exp) {
    this.exp += exp;
    this.totalExp += exp;
    let leveledUp = false;

    while (this.exp >= this.expToNextLevel && this.level < this.maxLevel) {
      if (!leveledUp) {
        // this.startEvolutionAnimation();
        leveledUp = true;
      }
      this.exp -= this.expToNextLevel;
      this.level += 1;
      this.expToNextLevel *= 1.5;
      this.baseSpeed += 25;

      if (this.level >= this.maxLevel) {
        this.exp = 0;
        this.level = this.maxLevel;
        break;
      }
    }
  }

  update(dt) {
    if (
      !this.isBoosting &&
      Date.now() - this.lastBoostTime > this.boostCooldown &&
      this.exp > 0
    ) {
      if (Math.random() < 0.01) {
        // 1% chance per update to start boosting
        this.isBoosting = true;
        this.lastBoostTime = Date.now();
        this.boostDuration = Math.random() * 2000 + 1000; // Random duration between 1 to 3 seconds

        setTimeout(() => {
          this.isBoosting = false;
        }, this.boostDuration);
      }
    }

    for (let i = 0; i < this.game.orbs.length; i++) {
      let orb = this.game.orbs[i];
      if (
        Math.abs(this.x - orb.x) < this.radius &&
        Math.abs(this.y - orb.y) < this.radius
      ) {
        this.increaseExp(this.level === 1 ? orb.exp*this.level : orb.exp*this.level/2);
        this.game.orbs = this.game.orbs.filter((o) => o !== orb);
      }
    }

    const target = this.findTargetToChase();
    this.target = target ?? null;

    if (this.target && !this.attack.isAttacking && this.target.type !== "orb") {
      const distToTarget = Math.sqrt(
        Math.pow(this.target.x - this.x, 2) +
          Math.pow(this.target.y - this.y, 2)
      );

      if (distToTarget <= this.attackRadius) {
        if (this.attack.waitTime === null) {
          // Set a random delay before attacking
          if(this.level >= 1 && this.level <= 4)
            this.attack.waitTime = Date.now() + Math.random() * 300 + 500; // random delay between 300ms and 400ms
          else if(this.level > 4 && this.level <= 7)
            this.attack.waitTime = Date.now() + Math.random() * 200 + 400; // random delay between 300ms and 400ms
          else if(this.level > 7 && this.level <= 10)
            this.attack.waitTime = Date.now() + 400; // random delay between 300ms and 400ms
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

    // // attack field
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

    const width = this.levels[this.level - 1].width;
    const height = this.levels[this.level - 1].height;
    ctx.drawImage(
      this.levels[this.level - 1].image,
      this.currentFrame * width,
      col * height,
      width,
      height,
      this.x - camera.x - width / 2,
      this.y - camera.y - height / 2,
      width,
      height,
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
        (-52 * 2 + 220) / 2, // offset by half image width
        (-76 * 2) / 2, // offset by half image height
        52 * 2,
        76 * 2
      );
      ctx.restore();
    }

    // // Target Area
    // ctx.beginPath();
    // ctx.arc(
    //   this.x - camera.x,
    //   this.y - camera.y,
    //   this.targetRadius,
    //   0,
    //   2 * Math.PI
    // );
    // ctx.stroke();

    // // Attack Area
    // ctx.beginPath();
    // ctx.arc(
    //   this.x - camera.x,
    //   this.y - camera.y,
    //   this.attackRadius,
    //   0,
    //   2 * Math.PI
    // );
    // ctx.stroke();

    this.pixelCanvas.drawName(
      ctx,
      this.name,
      2.2,
      Math.floor(this.x - camera.x - this.name.length *2.2* 2),
      this.y - camera.y + 40
    );
  }
}
