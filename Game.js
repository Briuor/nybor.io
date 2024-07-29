import Map from "./Map.js";
import Camera from "./Camera.js";
import Player from "./Player.js";
import Bot from "./Bot.js";
import Orb from "./Orb.js";
import { randomName } from "./util.js";

export default class Game {
  constructor(loader) {
    this.loader = loader;
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = new Map();
    this.deathAnimations = []
    this.lastSpawn = Date.now();
    this.lastSpawnOrbs = Date.now();
    this.camera = new Camera(this.canvas);

    this.orbs = [];
    this.bots = [];
    this.player = null;
    this.generateRandomGame();

    this.leaderBoardWrapper = document.getElementById("leaderboard-wrapper");
    this.leaderBoard = document.getElementById("leaderboard");
    this.playAgainModal = document.getElementById("play-again-modal");

    window.addEventListener("resize", this.resizeCanvas.bind(this));
    this.resizeCanvas();
    this.deathAudio = new Howl({
      src: ['audio/death.wav']
    })
    this.attackAudio = new Howl({
      src: ['audio/attack.wav']
    })
    this.levelUpAudio = new Howl({
      src: ['audio/levelup.wav']
    })
    var sound = new Howl({
      src: ['audio/battle.mp3'],
      autoplay: true,
      loop: true,
    });
    sound.play()
  }

  static EXP_TO_LEVEL_10 = 2750

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
      Math.floor(Math.random() * Game.EXP_TO_LEVEL_10),
      this
    );
  
    for (let i = 0; i < 100; i++) {
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
  
      this.bots.push(
        new Bot(
          Math.floor(Math.random() * 9999) + 1,
          randomName(),
          randomX,
          randomY,
          Math.floor(Math.random() * Game.EXP_TO_LEVEL_10),
          this
        )
      );
    }
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
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

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let now = Date.now();
    let dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;


    // generate random coordinate
    // check if has any entity there
    // if not spawn
    // else don't spawn and generate another coordinate
    if (now - this.lastSpawn >= 2000) {
      let shouldSpawn = true;
      const randomX = this.map.randomPositionX();
      const randomY = this.map.randomPositionY();

      const entities = [...(this.player.isActive ? [this.player] : []), ...this.bots];

      for(let entity of entities) {
        const dist = Math.sqrt(
          Math.pow(randomX - entity.x, 2) + Math.pow(randomY - entity.y, 2)
        );

        if (dist <= 400) {  
          shouldSpawn = false;
          break;
        }    
      }

      if(shouldSpawn) {
        this.bots.push(
          new Bot(
            Math.floor(Math.random() * 9999) + 1,
            randomName(),
            randomX,
            randomY,
            Math.floor(Math.random() * Game.EXP_TO_LEVEL_10),
            this
          )
        );
      }

      this.lastSpawn = now;
    }

    // spawn bots every 5 seconds
    if (now - this.lastSpawnOrbs >= 500) {
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
          $expEl.innerText = this.player.totalExp;
          $liList[i].style.backgroundColor = "rgba(25, 25, 25, 0.8)";
          return;
        }
        $liList[i].style.backgroundColor = entity.id === this.player.id ? "rgba(25, 25, 25, 0.8)" : "rgba(0, 0, 0, 0.8)";

        $nameEl.innerText = (i + 1) + "." + entity.name;
        $expEl.innerText = entity.totalExp;
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
    setInterval(this.run.bind(this), 1000 / 60);
  }
}
