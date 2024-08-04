import Game from "./Game.js";
import Loader from "./Loader.js";

const $play = document.getElementById("play");
const $playAgain = document.getElementById("play-again");
const $game = document.getElementById("game");
const $canvas = document.getElementById("canvas");
const $leaderboardWrapper = document.getElementById("leaderboard-wrapper");
const $menu = document.getElementById("menu");
const $expBarContainer = document.getElementById("expBarContainer");
const $nameInput = document.getElementById("name-play");
const $killsCounter = document.getElementById("kills-wrapper");
const $playAgainModal = document.getElementById("play-again-modal");
const $dontWorkOnMobileText = document.getElementById("nomobile");
const $howToPlay = document.getElementById("howtoplay");
const $playForm = document.getElementById("play-form");
const $loading = document.getElementById('loading');

document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name-play");

  nameInput.addEventListener("input", (event) => {
    const pattern = /^[A-Za-z]{0,14}$/;
    const value = event.target.value;

    if (!pattern.test(value)) {
      event.target.value = value.slice(0, -1); // Remove last character if it doesn't match the pattern
    }
  });
});


const detectMob = () => {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}

if(detectMob()) {
  $dontWorkOnMobileText.style.display = "block";
  $howToPlay.style.display = "none";
  $playForm.style.display = "none";
}

const deathAudio = new Howl({
  src: ['audio/death.wav'],
  volume: 0.5,
})
const attackAudio = new Howl({
  src: ['audio/attack.wav'],
  volume: 0.5,
})
const levelUpAudio = new Howl({
  src: ['audio/levelup.wav'],
  volume: 0.5,
})
const getOrbAudio = new Howl({
  src: ['audio/getorb.mp3'],
  volume: 0.5,
})

var battleAudio = new Howl({
  src: ['audio/battle.mp3'],
  volume: 0.7,
  loop: true,
});

const sounds = {
  "deathAudio": deathAudio,
  "attackAudio": attackAudio,
  "levelUpAudio": levelUpAudio,
  "getOrbAudio": getOrbAudio,
  "battleAudio": battleAudio 
}
const loadSound = (sound) => {
  return new Promise((resolve, reject) => {
    sound.once('load', function(){
      resolve();
    });
  })
}

const canPlay = () => {
  $play.disabled = false;
  $play.classList.remove("is-disabled");
  $play.innerText = "Play";
  $loading.style.display = 'none';
}

const loader = new Loader();

Promise.all([
  loader.loadImage("human", "images/levels/human.png"),
  loader.loadImage("viking", "images/levels/viking.png"),
  loader.loadImage("rogue", "images/levels/rogue.png"),
  loader.loadImage("bard", "images/levels/bard.png"),
  loader.loadImage("soldier", "images/levels/soldier.png"),
  loader.loadImage("mage", "images/levels/mage.png"),
  loader.loadImage("ninja", "images/levels/ninja.png"),
  loader.loadImage("samurai", "images/levels/samurai.png"),
  loader.loadImage("soldierarmor", "images/levels/soldierarmor.png"),
  loader.loadImage("golden", "images/levels/golden.png"),
  loadSound(attackAudio),
  loadSound(deathAudio),
  loadSound(levelUpAudio),
  loadSound(getOrbAudio),
  loadSound(battleAudio),
  loader.loadImage("sc", "images/sc.png"),
  loader.loadImage("atk", "images/atk.png"),
  loader.loadImage("atkindicator", "images/atkindicator.png"),
  loader.loadImage("tileset", "images/tileset.png"),
  loader.loadImage("front", "images/front.png"),
  loader.loadImage("back", "images/back.png"),
  loader.loadImage("heart", "images/heart.png"),
  loader.loadImage("death", "images/die.png"),
]).then((res) => {
  canPlay();
});



let game = null;

$play.addEventListener("click", () => {
  $game.style.display = "block";
  $menu.style.display = "none";
  $leaderboardWrapper.style.display = "block";
  $canvas.style.display = "block";
  $expBarContainer.style.display = "block";
  $killsCounter.style.display = "block";

  battleAudio.play()

    game = new Game(loader, sounds);
    game.player.levels = [
      { image: loader.getImage("human"), width: 60, height: 72 },
      { image: loader.getImage("viking"), width: 60, height: 72 },
      { image: loader.getImage("rogue"), width: 60, height: 72 },
      { image: loader.getImage("bard"), width: 63, height: 72 },
      { image: loader.getImage("soldier"), width: 60, height: 72 },
      { image: loader.getImage("mage"), width: 63, height: 78 },
      { image: loader.getImage("ninja"), width: 60, height: 72 },
      { image: loader.getImage("samurai"), width: 66, height: 72 },
      { image: loader.getImage("soldierarmor"), width: 69, height: 84 },
      { image: loader.getImage("golden"), width: 69, height: 82 },
    ];
    game.player.swordImage = loader.getImage("sc");
    game.player.name = $nameInput.value || "Unammed";
    game.player.attackImage = loader.getImage("atk");
    game.player.evolution.frontImage = loader.getImage("front");
    game.player.evolution.backImage = loader.getImage("back");
    game.player.atkindicatorImage = loader.getImage("atkindicator");
    game.map.tilesetImage = loader.getImage("tileset");
    game.start();
});

$playAgain.addEventListener("click", () => {
  $game.style.display = "none";
  $menu.style.display = "block";
  $leaderboardWrapper.style.display = "none";
  $canvas.style.display = "none";
  $expBarContainer.style.display = "none";
  $killsCounter.style.display = "none";
  $playAgainModal.classList.remove("active");
  game.stop();
  battleAudio.stop();
  game = null;
});