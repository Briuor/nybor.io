import Game from "./Game.js";
import Loader from "./Loader.js";

const $play = document.getElementById("play");
const $game = document.getElementById("game");
const $canvas = document.getElementById("canvas");
const $leaderboardWrapper = document.getElementById("leaderboard-wrapper");
const $menu = document.getElementById("menu");

// $play.addEventListener("click", () => {
  $game.style.display = "block";
  $menu.style.display = "none";
  $leaderboardWrapper.style.display = "block";
  $canvas.style.display = "block";

  const loader = new Loader();

  Promise.all([
    loader.loadImage("ghost", "images/ghost.png"),
    loader.loadImage("sword", "images/sword.png"),
    loader.loadImage("attack", "images/attack.png"),
    loader.loadImage("tileset", "images/tileset.png"),
  ]).then((res) => {
    const game = new Game(loader);
    game.player.playerImage = loader.getImage("ghost");
    game.player.swordImage = loader.getImage("sword");
    game.player.attackImage = loader.getImage("attack");
    game.map.tilesetImage = loader.getImage("tileset");
    game.start();
  });
// });
