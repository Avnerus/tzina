var Game = require('./game').default;
var config = require('./config').default;
var Stats = require('stats.js');

var game = new Game(config);
var stats = new Stats();
stats.showPanel(0);

var fullscreen = require('fullscreen');
var lock = require('pointer-lock-chrome-tolerant');

console.log("Touch? ", Modernizr.touchevents)

window.onload = function() {
    console.log("Loading...");
    game.init();
    var el = document.getElementById('game');

    document.getElementById('start-button').addEventListener('click',function(event) {
        if (fullscreen.available()) {
            var fs = fullscreen(el);

            fs.on('attain',function() {
                console.log("Full screen attained!");
                if (pointer) {
                    pointer.request();
                } else {
                    start();
                }
            });

            fs.request();
        } else {
            start();
        }
    });

    if (!Modernizr.touchevents && config.controls == "locked" && lock.available()) {
        var pointer = lock(el);

        pointer.on('attain', function() {
            console.log("Pointer attained!");
            start();
        });
    }


    game.load(function() {
        document.getElementById('start-container').style.display = "flex";
        document.getElementById('loading-container').style.display = "none";
    });
}

function start() {
    document.getElementById('start-container').style.display = "none";
    document.getElementById('game').appendChild(stats.dom);
    game.start();
    window.addEventListener('resize', resize, false);
    window.addEventListener('vrdisplaypresentchange', resize, true);
    game.resize();
    animate();
}


function animate(t) {
    stats.begin();
    game.animate(t);
    stats.end();
    requestAnimationFrame(animate);
}

function resize() {
    game.resize();
}

