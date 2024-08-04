import Map from "./Map.js";
import Camera from "./Camera.js";
import Player from "./Player.js";
import Bot from "./Bot.js";
import Orb from "./Orb.js";
import { randomName } from "./util.js";

export default class Game {
  constructor(loader, sounds) {
    this.loader = loader;
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = new Map();
    this.deathAnimations = []
    this.lastSpawn = Date.now();
    this.lastSpawnOrbs = Date.now();

    this.orbs = [];
    this.bots = [];
    this.player = null;

    this.leaderBoardWrapper = document.getElementById("leaderboard-wrapper");
    this.leaderBoard = document.getElementById("leaderboard");
    this.playAgainModal = document.getElementById("play-again-modal");
    this.killsCounterEl = document.getElementById("kills");
    this.endKills = document.getElementById("end-kills");
    this.endExp = document.getElementById("end-exp");

    this.width = 1920;
    this.height = 1080;
    this.canvasWidth = 1920;
    this.canvasHeight = 1080;

    window.addEventListener("resize", this.resizeCanvas.bind(this));
    this.resizeCanvas();
    this.deathAudio = sounds["deathAudio"];
    this.attackAudio = sounds["attackAudio"];
    this.levelUpAudio = sounds["levelUpAudio"];
    this.getOrbAudio = sounds["getOrbAudio"];
    this.camera = new Camera(this.canvas, this);
    this.gameLoopInterval = null;
    this.generateRandomGame();
  }

  getExpForLevel(level) {
    let exp = 0;
    for (let i = 1; i < level; i++) {
      exp += Math.floor(100 * Math.pow(1.5, i - 1));
    }
    return exp;
  }
  
  // Function to generate a random level between 1 and 10
  getRandomLevel() {
    return Math.floor(Math.random() * 9) + 1;
  }

  generateRandomGame() {
    for (let i = 0; i < 200; i++) {
      this.orbs.push(
        new Orb(
          Math.floor(Math.random() * 999) + 1,
          this.map.randomPositionX(),
          this.map.randomPositionY(),
          Math.floor(Math.random() * 10 + 2),
          this
        )
      );
    }
  
    this.player = new Player(
      0,
      "Bruno",
      this.map.randomPositionX(),
      this.map.randomPositionY(),
      0,
      this
    );
  
    for (let i = 0; i < 200; i++) {
      const randomX = this.map.randomPositionX();
      const randomY = this.map.randomPositionY();
  
      const entities = [
        this.player,
        ...this.bots,
      ];

      let spawn = true;
  
      for (let entity of entities) {
        const dist = Math.sqrt(
          Math.pow(randomX - entity.x, 2) + Math.pow(randomY - entity.y, 2)
        );
  
        if (dist <= 500) {
          spawn = false;
          break;
        }
      }

      if(!spawn) continue;
      const randomLevel = this.getRandomLevel();
      const randomExp = this.getExpForLevel(randomLevel);
      this.bots.push(
        new Bot(
          Math.floor(Math.random() * 9999) + 1,
          randomName(),
          randomX,
          randomY,
          randomExp,
          this
        )
      );
    }
  }

  resizeCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvasWidth = window.innerWidth - 4;
    this.canvasHeight = window.innerHeight - 4;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;


    this.canvas.style.width = this.canvasWidth + "px";
    this.canvas.style.height = this.canvasHeight + "px";
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.camera.render(this.ctx, this.map);
    
    this.deathAnimations.map((d) => {
      d.draw(this.ctx, this.camera);
    });
    this.orbs.map((orb) => {
      orb.draw(this.ctx, this.camera);
    });
    this.player.draw(this.ctx, this.camera);
    this.bots.map((bot) => {
      bot.draw(this.ctx, this.camera);
    });

    const level = document.getElementById("level-content");
    const expBar = document.getElementById("expBar");
    level.innerText = this.player.level;
    const expPercentage = (this.player.exp / this.player.expToNextLevel) * 100;
    expBar.style.width = expPercentage + "%";

  }

  spawnBot() {
    const now = Date.now();
    const randomLevel = this.getRandomLevel();
    const randomExp = this.getExpForLevel(randomLevel);

    if (now - this.lastSpawn >= 400) {
      const areas = this.map.getAreas();
      let areaFound = false;

      for (const area of areas) {
        if (this.map.isAreaEmpty(area, [...(this.player.isActive ? [this.player] : []), ...this.bots], 400)) {
          const randomX = Math.random() * (area.width - 2 * Map.TILE_SIZE) + area.x + Map.TILE_SIZE;
          const randomY = Math.random() * (area.height - 2 * Map.TILE_SIZE) + area.y + Map.TILE_SIZE;

          this.bots.push(
            new Bot(
              Math.floor(Math.random() * 9999) + 1,
              randomName(), // Assuming randomName is defined
              randomX,
              randomY,
              randomExp,
              this
            )
          );
          areaFound = true;
          break;
        }
      }

      if (!areaFound) {
        console.log('No suitable area found for spawning.');
      }

      this.lastSpawn = now;
    }
  }

  update() {
    let now = Date.now();
    let dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;


    // generate random coordinate
    // check if has any entity there
    // if not spawn
    // else don't spawn and generate another coordinate
    this.spawnBot()

    // spawn bots every 5 seconds
    if (now - this.lastSpawnOrbs >= 100) {
      this.orbs.push(
        new Orb(
          Math.floor(Math.random() * 999) + 1,
          this.map.randomPositionX(),
          this.map.randomPositionY(),
          Math.floor(Math.random() * 10 + 2),
          this
        )
      );
      this.lastSpawnOrbs = now;
    }

    // update movement
    this.player.update(dt);
    this.bots.map((bot) => {
      bot.update(dt);
    });

    this.camera.update(this.player);
    this.updateLeaderBoard();
  }

  updateLeaderBoard() {
    let $liList = this.leaderBoard.children;
    let len = $liList.length;
    let isPlayerTop5 = false;

    $liList[len - 1].style.display = "none";

    const sortedEntities = [this.player, ...this.bots].sort(
      (a, b) => b.totalExp - a.totalExp
    );

    // fill top 5 players
    for (let i = 0; i < len; i++) {
      let entity = sortedEntities[i];
      let $nameEl = $liList[i].children[0];
      let $expEl = $liList[i].children[1];

      if (entity) {
        if(entity.id === this.player.id && i!= len -1 && !isPlayerTop5) 
          isPlayerTop5 = true;
        
        if(i === len -1 && !isPlayerTop5) {
          $liList[len - 1].style.display = "block";
          const playerPosition = sortedEntities.findIndex((entity) =>entity.id === this.player.id);
          $nameEl.innerText = (playerPosition + 1) + "." + this.player.name;
          $expEl.innerText = Math.round(this.player.totalExp);
          $liList[i].style.backgroundColor = "rgba(25, 25, 25, 0.8)";
          return;
        }
        $liList[i].style.backgroundColor = entity.id === this.player.id ? "rgba(25, 25, 25, 0.8)" : "rgba(0, 0, 0, 0.8)";

        $nameEl.innerText = (i + 1) + "." + entity.name;
        $expEl.innerText = Math.round(entity.totalExp);
      } else {
        $nameEl.innerText = (i + 1) + ".-";
        $expEl.innerText = "-";
        $liList[i].style.backgroundColor = "rgba(0, 0, 0, 0.8)"
      }
    }
  }

  run() {
    this.update();
    this.render();
  }

  start() {
    this.lastUpdate = Date.now();
    this.gameLoopInterval = setInterval(this.run.bind(this), 1000 / 60);
  }

  stop() {
    clearInterval(this.gameLoopInterval);
  }
}
