import Game from "./Game.js";
import Loader from "./Loader.js";

const $play = document.getElementById("play");
const $game = document.getElementById("game");
const $canvas = document.getElementById("canvas");
const $leaderboardWrapper = document.getElementById("leaderboard-wrapper");
const $menu = document.getElementById("menu");
const $expBarContainer = document.getElementById("expBarContainer");

$play.addEventListener("click", () => {
  $game.style.display = "block";
  $menu.style.display = "none";
  $leaderboardWrapper.style.display = "block";
  $canvas.style.display = "block";
  $expBarContainer.style.display = "block";

  const loader = new Loader();

  Promise.all([
    loader.loadImage("level1", "images/level1.png"),
    loader.loadImage("level2", "images/level2.png"),
    loader.loadImage("level3", "images/level3.png"),
    loader.loadImage("level4", "images/level4.png"),
    loader.loadImage("level5", "images/level5.png"),
    loader.loadImage("sc", "images/sc.png"),
    loader.loadImage("atk", "images/atk.png"),
    loader.loadImage("atkindicator", "images/atkindicator.png"),
    loader.loadImage("tileset", "images/tileset.png"),
    loader.loadImage("front", "images/front.png"),
    loader.loadImage("back", "images/back.png"),
    loader.loadImage("heart", "images/heart.png"),
    loader.loadImage("death", "images/die.png"),
  ]).then((res) => {
    const game = new Game(loader);
    game.player.levels = [
      { image: loader.getImage("level1"), width: 60, height: 72},
      { image: loader.getImage("level2"), width: 60, height: 72 },
      { image: loader.getImage("level3"), width: 60, height: 72 },
      { image: loader.getImage("level4"), width: 60, height: 72 },
      { image: loader.getImage("level5"), width: 69, height: 84 },
    ];
    game.player.swordImage = loader.getImage("sc");
    game.player.attackImage = loader.getImage("atk");
    game.player.evolution.frontImage = loader.getImage("front");
    game.player.evolution.backImage = loader.getImage("back");
    game.player.atkindicatorImage = loader.getImage("atkindicator");
    game.map.tilesetImage = loader.getImage("tileset");
    game.start();
  });
});
