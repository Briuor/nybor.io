import Player from "./Player.js";

export default class Game {
    constructor() {
      this.canvas = document.getElementById("canvas");
      this.canvas.width = 35*10;
      this.canvas.height = 17*10;
      this.ctx = this.canvas.getContext("2d");
      this.player = new Player(32, 32, 32, 32)
    }
  
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //   this.map.draw(this.ctx);
      this.player.draw(this.ctx);
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

      this.player.move(dt);
      // update movement
      // render
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