var Game = require('./game').default;
var config = require('./config').default;

var game = new Game(config);

var fullscreen = require('fullscreen');
var lock = require('pointer-lock');


window.onload = function() {
    console.log("Loading...");
    game.init();
    var el = document.getElementById('game');
    var fs = fullscreen(el);
    document.getElementById('start-button').addEventListener('click',function(event) {
        fs.request();
    });

    if (config.controls == "locked") {
        var pointer = lock(el);

        pointer.on('attain', function() {
            console.log("Pointer attained!");
            start();
        });
    }
    fs.on('attain',function() {
        console.log("Full screen attained!");
        if (pointer) {
            pointer.request();
        } else {
            start();
        }
    });


    game.load(function() {
        document.getElementById('start-container').style.display = "flex";
        document.getElementById('loading-container').style.display = "none";
    });
}

function start() {
    document.getElementById('start-container').style.display = "none";
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

