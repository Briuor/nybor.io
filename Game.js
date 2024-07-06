import Map from "./Map.js";
import Camera from "./Camera.js";
import Player from "./Player.js";
import Bot from "./Bot.js";

export default class Game {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.canvas.width = 20 * Map.TILE_SIZE;
    this.canvas.height = 20 * Map.TILE_SIZE;
    this.ctx = this.canvas.getContext("2d");
    this.map = new Map();
    this.camera = new Camera();
    this.player = new Player(
      Map.TILE_SIZE * 5,
      Map.TILE_SIZE * 5,
      Map.TILE_SIZE,
      Map.TILE_SIZE,
      this
    );
    this.bots = [
      new Bot(
        1,
        Map.TILE_SIZE * 10,
        Map.TILE_SIZE * 5,
        Map.TILE_SIZE,
        Map.TILE_SIZE,
        this
      ),
      new Bot(
        2,
        Map.TILE_SIZE * 12,
        Map.TILE_SIZE * 5,
        Map.TILE_SIZE,
        Map.TILE_SIZE,
        this
      ),
    ];
    this.lastSpawn = Date.now();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.camera.render(this.ctx, this.map);
    this.player.draw(this.ctx, this.camera);
    this.bots.map((bot) => {
      bot.draw(this.ctx, this.camera);
    });
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
          Math.floor(Math.random() * 999) + 1,
          Math.random() * this.map.getMapMaxWidth,
          Math.random() * this.map.getMapMaxHeight,
          Map.TILE_SIZE,
          Map.TILE_SIZE,
          this
        )
      );
      this.lastSpawn = now;
    }

    // update movement
    this.player.update(dt);
    this.bots.map((bot) => {
      bot.update(this, dt);
    });

    this.camera.update(this.player);
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
