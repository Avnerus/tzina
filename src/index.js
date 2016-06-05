console.log("COOPERATIVE TELEPRESENCE EXPERIMENT");
var Game = require('./game').default;
var game = new Game();

window.onload = function() {
    console.log("Loading...");
    game.init();
    window.addEventListener('resize', resize, false);
    game.resize();
    animate();
}


function animate(t) {
    game.animate(t);
    requestAnimationFrame(animate);
}

function resize() {
    game.resize();
}

