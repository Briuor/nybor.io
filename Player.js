import DeathAnimation from "./DeathAnimation.js";
import GameObject from "./GameObject.js";
import pixelCanvas from "./pixelCanvas.js";

export default class Player extends GameObject {
  constructor(id, name, x, y, exp, game) {
    super(x, y, 32, "white");
    this.name = name;
    this.id = id;
    this.speed = 180;
    this.directionAngle = 0;
    this.attack = {
      duration: 450, // ms
      isAttacking: false,
      time: 0,
      angle: 0,
      animation: false,
    };
    this.game = game;
    this.health = 50;
    this.maxHealth = 50;
    this.damage = 20; // Damage dealt per attack
    this.attackRange = 65;
    this.impulse = { x: 0, y: 0, duration: 0 };
    this.exp = 0;
    this.totalExp = 0;
    this.expToNextLevel = 50;
    this.level = 1;
    this.maxLevel = 10;

    this.pixelCanvas = new pixelCanvas();
    this.kills = 0;

    this.playerImage = null;
    this.swordImage = null;
    this.attackImage = null;
    this.currentFrame = 0;
    this.animationTime = Date.now();
    this.animationDuration = 150;

    this.getHitAnimation = false;
    this.isActive = true;

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
    if(!this.isActive) return ;

    this.game.attackAudio.play();
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

      if (dist <= this.attackRange + bot.radius) {
        this.game.deathAudio.play();
        this.game.bots = this.game.bots.filter((b) => b.id !== bot.id);
        this.game.updateLeaderBoard();
        this.game.deathAnimations.push(
          new DeathAnimation(bot.x, bot.y, this.game)
        );
        this.kills += 1;
        this.increaseExp(Math.floor(bot.exp > 30 ? bot.exp / 3 : 10));
      }
    }
  }

  increaseExp(exp) {
    this.exp += exp; 
    this.totalExp += exp;
    console.log(`Adding ${exp} experience.`);
    console.log(`Initial state: level=${this.level}, exp=${this.exp}, expToNextLevel=${this.expToNextLevel}`);

    while(this.exp >= this.expToNextLevel && this.level < this.maxLevel) {
      this.exp -= this.expToNextLevel;
      this.level += 1;
      this.expToNextLevel *= 2;

      console.log(`Leveled up: level=${this.level}, exp=${this.exp}, expToNextLevel=${this.expToNextLevel}`);

      if (this.level >= this.maxLevel) {
        this.exp = 0;
        this.level = this.maxLevel;
        console.log(`Max level reached: level=${this.level}, exp=${this.exp}`);

        break;
      }
    }
  }

  handleClick() {
    if (this.attack.isAttacking) return;

    this.attackAction();
  }

  update(dt) {
    if(!this.isActive) return ;

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
      if (dist < this.radius + orb.radius) {
        this.increaseExp(orb.exp);
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
    if(!this.isActive) return ;

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
    if(!this.isActive) return ;

    // ctx.fillStyle = this.color;
    // ctx.beginPath();
    // ctx.arc(camera.width / 2, camera.height / 2, this.radius, 0, 2 * Math.PI);
    // ctx.fill();

    // ctx.save();
    // ctx.strokeStyle = "black";
    // ctx.translate(
    //   camera.width / 2 + Math.cos(this.directionAngle) * this.attackRange,
    //   camera.height / 2 + Math.sin(this.directionAngle) * this.attackRange
    // );
    // ctx.rotate(this.directionAngle);
    // ctx.beginPath();
    // ctx.arc(
    //   this.attackRange/2,
    //    this.attackRange/2,
    //   this.attackRange,
    //   -0.5 * Math.PI,
    //   -1.5 * Math.PI
    // );
    // ctx.stroke();
    // ctx.restore();

    let col, totalFrames;
    let angle = (180 * this.directionAngle) / Math.PI;
    if (angle < 0) angle = 360 + angle;

    if (angle >= 90 && angle < 270) {
      col = 0;
      totalFrames = 3;
      if (this.attack.animation) {
        col = 2;
        totalFrames = 3;
      }
      if (this.getHitAnimation) {
        col = 4;
        totalFrames = 2;
      }
    } else {
      col = 1;
      totalFrames = 3;
      if (this.attack.animation) {
        col = 3;
        totalFrames = 3;
      }
      if (this.getHitAnimation) {
        col = 5;
        totalFrames = 2;
      }
    }

    if (Date.now() - this.animationDuration >= this.animationTime) {
      if (this.currentFrame >= totalFrames) {
        this.currentFrame = 0;
        this.attack.animation = false;
        this.getHitAnimation = false;
      } else {
        this.currentFrame += 1;
      }
      this.animationTime = Date.now();
    }

    // draw sword
    if (!this.attack.animation) {
      ctx.drawImage(
        this.swordImage,
        this.currentFrame * 58,
        col * 29,
        58,
        29,
        camera.width / 2 + (col == 0 ? -65 : -50),
        camera.height / 2 - 80,
        58 * 2,
        29 * 2
      );
    }

    ctx.drawImage(
      this.playerImage,
      this.currentFrame * 38,
      col * 38,
      38,
      38,
      camera.width / 2 - 38,
      camera.height / 2 - 38,
      38 * 2,
      38 * 2
    );
    ctx.restore();

    if (!this.attack.animation) {
    ctx.save();
    ctx.translate(camera.width / 2, camera.height / 2);
    ctx.rotate(this.directionAngle);

    ctx.drawImage(
      this.atkindicatorImage,
      0,
      0,
      52,
      76,
      (-52 * 2 + 155) / 2, // offset by half image width
      (-76 * 2) / 2, // offset by half image height
      52 * 2,
      76 * 2
    );
    ctx.restore();
  }

    if (this.attack.animation) {
      ctx.save();
      ctx.translate(camera.width / 2, camera.height / 2);
      ctx.rotate(this.attack.angle);
      ctx.drawImage(
        this.attackImage,
        this.currentFrame * 52,
        0,
        52,
        76,
        (-52 * 2 + 155) / 2, // offset by half image width
        (-76 * 2) / 2, // offset by half image height
        52 * 2,
        76 * 2
      );
      ctx.restore();
    }

    // Draw health bar
    const elapsedTime = Date.now() - this.attack.time;

    // Calculate the fill percentage
    const remainingPercentage = Math.max(
      100 - (elapsedTime / this.attack.duration) * 100,
      0
    );
    ctx.fillStyle = "#f2ec8b";
    ctx.fillRect(
      camera.width / 2 - 50,
      camera.height / 2 + 55,
      remainingPercentage,
      5
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
