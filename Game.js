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
    this.orbs = [
      new Orb(
        Math.floor(Math.random() * 999) + 1,
        Map.TILE_SIZE * 10,
        Map.TILE_SIZE * 13,
        40
      ),
    ];
    this.camera = new Camera(this.canvas);
    this.player = new Player(
      0,
      "Bruno",
      Map.TILE_SIZE * 10,
      Map.TILE_SIZE * 10,
      this
    );
    this.bots = [
      new Bot(1, randomName(), Map.TILE_SIZE * 10, Map.TILE_SIZE * 10, this),
      new Bot(2, randomName(), Map.TILE_SIZE * 10, Map.TILE_SIZE * 10, this),
    ];
    this.lastSpawn = Date.now();
    this.lastSpawnOrbs = Date.now();

    this.leaderBoardWrapper = document.getElementById("leaderboard-wrapper");
    this.leaderBoard = document.getElementById("leaderboard");
    this.playAgainModal = document.getElementById("play-again-modal");

    window.addEventListener("resize", this.resizeCanvas.bind(this));
    this.resizeCanvas();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.camera.render(this.ctx, this.map);
    this.orbs.map((orb) => {
      orb.draw(this.ctx, this.camera);
    });
    this.player.draw(this.ctx, this.camera);
    this.bots.map((bot) => {
      bot.draw(this.ctx, this.camera);
    });

    const level = document.getElementById("level");
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

    // spawn bots every 5 seconds
    if (now - this.lastSpawn >= 5000) {
      this.bots.push(
        new Bot(
          Math.floor(Math.random() * 9999) + 1,
          randomName(),
          Math.random() * this.map.getMapMaxWidth,
          Math.random() * this.map.getMapMaxHeight,
          this
        )
      );
      this.lastSpawn = now;
    }

    // spawn bots every 5 seconds
    if (now - this.lastSpawnOrbs >= 2000) {
      this.orbs.push(
        new Orb(
          Math.floor(Math.random() * 999) + 1,
          Math.random() * this.map.getMapMaxWidth,
          Math.random() * this.map.getMapMaxHeight,
          Math.random() * 40 + 1
        )
      );
      this.lastSpawnOrbs = now;
    }

    // update movement
    this.player.update(dt);
    this.bots.map((bot) => {
      bot.update(this, dt);
    });

    this.camera.update(this.player);
    this.updateLeaderBoard();
  }

  updateLeaderBoard() {
    let liList = this.leaderBoard.children;
    let len = liList.length;
    liList[len - 1].children[0].style.display = "none";
    liList[len - 1].children[1].style.display = "none";

    const sortedPlayers = [this.player, ...this.bots].sort(
      (a, b) => b.kills - a.kills
    );

    // fill top 5 players
    for (let i = 0; i < len; i++) {
      let player = sortedPlayers[i];
      let nameEl = liList[i].children[0];
      let killsEl = liList[i].children[1];
      let highlight = "";
      if (player) {
        if (player.id == this.player.id) {
          highlight = ">";
          if (i == len - 1) {
            liList[len - 1].children[0].style.display = "inline-block";
            liList[len - 1].children[1].style.display = "inline-block";
            nameEl.innerText = highlight + "?." + player.name;
            killsEl.innerText = player.kills;
            break;
          }
        }
        nameEl.innerText = highlight + (i + 1) + "." + player.name;
        killsEl.innerText = player.kills;
      } else {
        nameEl.innerText = highlight + (i + 1) + ".-";
        killsEl.innerText = "-";
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
