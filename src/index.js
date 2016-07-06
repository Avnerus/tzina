var Game = require('./game').default;
var config = require('./config').default;
var Stats = require('stats.js');

var game = new Game(config);
var stats = new Stats();
stats.showPanel(0);

var fullscreen = require('fullscreen');
var lock = require('pointer-lock-chrome-tolerant');

console.log("Touch? ", Modernizr.touchevents)

var FPS  = 30;
var FPS_INTERVAL = 1000 / FPS;
var elapsed = 0
var lastTimestamp = 0;

window.onload = function() {
    console.log("Loading...");
    game.init();
    //var el = document.getElementsByTagName('body')[0];
    //var el = document.getElementById('game');
    var el = document.documentElement;

    document.getElementById('start-button').addEventListener('click',function(event) {
        if (!Modernizr.touchevents && config.controls == "locked" && lock.available()) {
            
            var pointer = lock(el);

            pointer.on('attain', function() {
                console.log("Pointer attained!");
                start();
                });

                pointer.request(); 
        }

        
        if (fullscreen.available()) {
            var fs = fullscreen(el);

            fs.on('attain',function() {
                console.log("Full screen attained!");
                if (typeof(pointer) != 'undefined') {
                    pointer.request();
                } else {
                    start();
                }
            });

            fs.request();
        } else {
            start();
        }

        //start(); 
    });



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
    stats.begin();
    animate();
}


function animate(t) {
    requestAnimationFrame(animate);
    elapsed = t - lastTimestamp;
    if (elapsed >= FPS_INTERVAL) {
        lastTimestamp = t - (elapsed % FPS_INTERVAL);
        game.animate(t);
        stats.end();
        stats.begin();
    }
}

function resize() {
    game.resize();
}

