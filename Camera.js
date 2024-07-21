import Map from "./Map.js";

class Animator {
  constructor(frame_set, delay) {
    this.count = 0;
    this.delay = delay;

    this.frame_set = frame_set; // animation frames
    this.frame_index = 0; // playhead
    this.frame_value = frame_set[0]; // current frame
  }

  animate() {
    this.count++;

    if (this.count > this.delay) {
      this.count = 0;

      this.frame_index =
        this.frame_index == this.frame_set.length - 1
          ? 0
          : this.frame_index + 1;
      this.frame_value = this.frame_set[this.frame_index];
    }
  }
}

export default class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.animations = {
      22: new Animator([22, 23, 24, 25, 26, 38], 16),
      28: new Animator([29, 30, 31, 32, 38, 28], 16),
      33: new Animator([38, 33, 34, 35, 36, 37], 16),
    };
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  update(player) {
      this.x = player.x - this.width / 2;
      this.y = player.y - this.height / 2;
      
  }

  
  render(ctx, map) {
    // start end
    const startCol = Math.floor(this.x / Map.TILE_SIZE);
    const startRow = Math.floor(this.y / Map.TILE_SIZE);
    const endCol = startCol + this.width / Map.TILE_SIZE + 1;
    const endRow = startRow + this.height / Map.TILE_SIZE + 1;
    const offsetX = -this.x + startCol * Map.TILE_SIZE;
    const offsetY = -this.y + startRow * Map.TILE_SIZE;
    for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
        if(col < 0 || row < 0 || col >= map.getTilesCols || row >= map.getTilesRows) {
          ctx.drawImage(
            map.tilesetImage,
            1,
            0,
            Map.TILE_SIZE,
            Map.TILE_SIZE,
            Math.round((col -startCol) * Map.TILE_SIZE + offsetX),
            Math.round((row -startRow) * Map.TILE_SIZE + offsetY),
            Map.TILE_SIZE,
            Map.TILE_SIZE
          );
          continue;
        }
        ctx.drawImage(
          map.tilesetImage,
          (map.tiles[row][col]-1)*Map.TILE_SIZE,
          0,
          Map.TILE_SIZE,
          Map.TILE_SIZE,
          Math.floor((col -startCol) * Map.TILE_SIZE + offsetX),
          Math.floor((row -startRow) * Map.TILE_SIZE + offsetY),
          Map.TILE_SIZE+1,
          Map.TILE_SIZE+1
        );

        // ctx.fillRect(
        //   Math.round((col -startCol) * Map.TILE_SIZE + offsetX),
        //   Math.round((row -startRow) * Map.TILE_SIZE + offsetY),
        //   Map.TILE_SIZE,
        //   Map.TILE_SIZE
        // );
      }
    }
    // remove offset
    // loop to draw de map from start to end
  }


}
