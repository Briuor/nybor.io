import Map from "./Map.js";
import Camera from "./Camera.js";
import Player from "./Player.js";

export default class Game {
    constructor() {
      this.canvas = document.getElementById("canvas");
      this.canvas.width = 10*Map.TILE_SIZE;
      this.canvas.height = 10*Map.TILE_SIZE;
      this.ctx = this.canvas.getContext("2d");
      this.map = new Map();
      this.camera = new Camera();
      this.player = new Player(32*5, 32*5, 32, 32)
    }
  
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.camera.render(this.ctx, this.map);
    // this.map.render(this.ctx);
      this.player.draw(this.ctx, this.camera);
    //   this.enemy.draw(this.ctx);
      // draw map
      // draw player
      // draw boss
    }
  
    update() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let now = Date.now();
      let dt = (now - this.lastUpdate) / 1000;
      this.lastUpdate = now;

      // update movement
      this.player.move(dt);
      this.camera.update(this.player);
    }
  
    run() {
      this.update();
      this.render();
    }
  
    start() {
      this.lastUpdate = Date.now();
      setInterval(this.run.bind(this), 1000/60);
    }
  }