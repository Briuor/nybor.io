import Map from "./Map.js";

export default class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    this.width = window.innerWidth + 32;
    this.height = window.innerHeight + 32;
  }

  update(player) {
    this.x = player.x - this.width / 2;
    this.y = player.y - this.height / 2;
  }

  render(ctx, map) {
    // start end
    const startCol = Math.floor(this.x / Map.TILE_SIZE);
    const startRow = Math.floor(this.y / Map.TILE_SIZE);
    const endCol = startCol + this.width / Map.TILE_SIZE;
    const endRow = startRow + this.height / Map.TILE_SIZE;
    const offsetX = -this.x + startCol * Map.TILE_SIZE;
    const offsetY = -this.y + startRow * Map.TILE_SIZE;
    for (let col = startCol; col <= endCol; col++) {
      for (let row = startRow; row <= endRow; row++) {
        if (!map.tiles[row] || !map.tiles[row][col]) continue;
        if (map.tiles[row][col] == 2) {
          ctx.fillStyle = "green";
        } else if (map.tiles[row][col] == 3) {
          ctx.fillStyle = "blue";
        }
        ctx.fillRect(
          Math.round((col -startCol) * Map.TILE_SIZE + offsetX),
          Math.round((row -startRow) * Map.TILE_SIZE + offsetY),
          Map.TILE_SIZE,
          Map.TILE_SIZE
        );
      }
    }
    // remove offset
    // loop to draw de map from start to end
  }
}
