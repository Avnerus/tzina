var Game = require('./game').default;
var game = new Game();
var fullscreen = require('fullscreen');
var lock = require('pointer-lock');

window.onload = function() {
    console.log("Loading...");
    game.init();
    var el = document.getElementById('game');
    var fs = fullscreen(el);
    var pointer = lock(el);
    document.getElementById('start-button').addEventListener('click',function(event) {
        fs.request();
    });

    fs.on('attain',function() {
        console.log("Full screen attained!");
        pointer.request();
    });

    pointer.on('attain', function() {
        console.log("Pointer attained!");
        start();
    });

    game.load(function() {
        document.getElementById('start-container').style.display = "flex";
        document.getElementById('loading-container').style.display = "none";
    });
}

function start() {
    game.start();
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

