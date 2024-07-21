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
  $expBarContainer.style.display = 'block';

  const loader = new Loader();

  Promise.all([
    loader.loadImage("player", "images/player.png"),
    loader.loadImage("sc", "images/sc.png"),
    loader.loadImage("atk", "images/atk.png"),
    loader.loadImage("atkindicator", "images/atkindicator.png"),
    loader.loadImage("tileset", "images/tileset.png"),
    loader.loadImage("heart", "images/heart.png"),
    loader.loadImage("death", "images/die.png"),
  ]).then((res) => {  
    const game = new Game(loader);
    game.player.playerImage = loader.getImage("player");
    game.player.swordImage = loader.getImage("sc");
    game.player.attackImage = loader.getImage("atk");
    game.player.atkindicatorImage = loader.getImage("atkindicator");
    game.map.tilesetImage = loader.getImage("tileset");
    game.start();
  });
});
