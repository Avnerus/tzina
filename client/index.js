var Game = require('./game').default;
var config = require('./config').default;
var Stats = require('stats.js');

var game = new Game(config);
var stats = new Stats();
stats.showPanel(0);

var fullscreen = require('fullscreen');
var lock = require('pointer-lock-chrome-tolerant');

if (config.production) {
    window['console']['log'] = function() {};
}

console.log("Touch? ", Modernizr.touchevents)

var FPS  = config.fps;
var FPS_INTERVAL = 1000 / FPS;
var elapsed = 0
var lastTimestamp = 0;

console.log("Loading...");
game.init();
//var el = document.getElementsByTagName('body')[0];
//var el = document.getElementById('game');
var el = document.documentElement;

document.getElementById('start-button').addEventListener('click',function(event) {
    if (!Modernizr.touchevents && config.controls == "locked" && lock.available()) {
        
        var pointer = lock(document.getElementById('game'));

        pointer.on('attain', function() {
            console.log("Pointer attained!");
            if (!game.started) {
                start();
            }
            });

            pointer.request(); 
    }

    
    if (config.fullscreen && fullscreen.available()) {
        var fs = fullscreen(el);

        fs.on('attain',function() {
            console.log("Full screen attained!");
            if (typeof(pointer) != 'undefined' && !game.started) {
                pointer.request();
            } else {
                if (!game.started) {
                    start();
                }
            }
        });
        fs.request();
    } else {
        if (pointer) {
            pointer.request();
        }
        else {
            if (!game.started) {
                start();
            }
        }
    }

    //start(); 
});

try {
    game.load(function() {
        console.log("GAME LOADED");
        document.getElementById('start-container').style.display = "flex";
        document.getElementById('loading-container').style.display = "none";
    });
}
catch(e) {
    console.error("Exception during game load ", e);
}


function start() {
    document.getElementById('start-container').style.display = "none";
    document.getElementById('game').appendChild(stats.dom);
    game.start();
    window.addEventListener('resize', resize, false);
    window.addEventListener('vrdisplaypresentchange', vrchange, true);
    game.resize();
    stats.begin();
    animate();
}


function animate(t) {
    if(game.vrManager.hmd.isPresenting) {
        game.vrManager.hmd.requestAnimationFrame(animate) 
    } else {
        requestAnimationFrame(animate);
    }

    /*
    elapsed = t - lastTimestamp;
    if (elapsed >= FPS_INTERVAL) {
        lastTimestamp = t - (elapsed % FPS_INTERVAL);*/
    game.animate(t);
    stats.end();
    stats.begin();
   // }
}

function resize() {
    game.resize();
}

function vrchange() {
    game.resize();
    game.vrChange();
}

