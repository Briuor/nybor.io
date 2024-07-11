import Game from "./Game.js";

const $play = document.getElementById('play');
const $game = document.getElementById('game');
const $canvas = document.getElementById('canvas');
const $leaderboardWrapper = document.getElementById('leaderboard-wrapper');
const $menu = document.getElementById('menu');

$play.addEventListener('click', () => {
    $game.style.display = 'block';
    $menu.style.display = 'none';
    $leaderboardWrapper.style.display = 'block';
    $canvas.style.display = 'block';

    const game = new Game();
    game.start();
})

