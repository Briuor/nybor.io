export default class Map {
  constructor() {
    this.tiles = [
      [2, 3, 3, 3, 3, 3, 3, 3, 3, 4],
      [9, 14, 14, 14, 14, 14, 14, 14, 14, 8],
      [10, 1, 1, 1, 1, 1, 1, 1, 1, 11],
      [10, 1, 1, 1, 1, 1, 1, 1, 1, 11],
      [10, 1, 1, 1, 1, 1, 1, 1, 1, 11],
      [10, 1, 1, 1, 1, 1, 1, 1, 1, 11],
      [10, 1, 1, 1, 1, 1, 1, 1, 1, 11],
      [10, 1, 1, 1, 1, 1, 1, 1, 1, 11],
      [5, 6, 6, 6, 6, 6, 6, 6, 6, 7],
      [12, 14, 14, 14, 14, 14, 14, 14, 14, 13],
    ];
  }

  get getTilesCols() {
    return this.tiles[0].length;
  }
  get getTilesRows() {
    return this.tiles.length;
  }
  get getMapMaxWidth() {
    return this.tiles[0].length * Map.TILE_SIZE;
  }
  get getMapMaxHeight() {
    return this.tiles.length * Map.TILE_SIZE;
  }

  randomPositionX() {
    return Math.random() * (this.getMapMaxWidth - 5 * Map.TILE_SIZE) + 2 * Map.TILE_SIZE
  }
  randomPositionY() {
    return Math.random() * (this.getMapMaxHeight - 5 * Map.TILE_SIZE) + 2 * Map.TILE_SIZE
  }

  isWalkable(x, y) {
    const col = Math.floor(x / Map.TILE_SIZE);
    const row = Math.floor(y / Map.TILE_SIZE);

    // Check if the position is within the map boundaries
    if (
      row >= 0 &&
      row < this.tiles.length &&
      col >= 0 &&
      col < this.tiles[0].length
    ) {
      const excludesValue = [2, 3, 4, 9 , 14, 8, 10, 11, 5, 6, 7, 12, 13];
      return this.tiles[row][col] >= 1 && this.tiles[row][col] != 2 && !excludesValue.includes(this.tiles[row][col])
    }
    return false;
  }

  static TILE_SIZE = 79;
}
