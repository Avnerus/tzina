import $ from 'jquery-browserify'
var Game = require('./game').default;
var config = require('./config').default;
//var Stats = require('stats.js');

var game = new Game(config);
//var stats = new Stats();
//stats.showPanel(0);

var fullscreen = require('fullscreen');
var lock = require('pointer-lock-chrome-tolerant');

console.log("Touch? ", Modernizr.touchevents)

var FPS  = config.fps;
var FPS_INTERVAL = 1000 / FPS;
var elapsed = 0
var lastTimestamp = 0;

window.onload = function() {
    $('.fadein').delay(500).fadeIn(500);

    $('#header').delay(500).fadeIn(500);

    $('#menu').click(function() {
      $(this).toggleClass('open');
        if($('#menu').hasClass('open')){
          $('#header').animate({'height':'300px'},100,function(){
            $('.chapter_text').fadeIn(750);
          });
        } else {
          $('.chapter_text').fadeOut(50);
          $('#header').animate({'height':'45px'},100,function(){

          });
        };
      });
    console.log("Loading...");
    game.init();

    //var el = document.getElementsByTagName('body')[0];
    //var el = document.getElementById('game');
    var el = document.documentElement;

    game.load(function() {
      $('#splash').delay( 1000 ).fadeOut( 500, function(){
        $('.instruc').fadeIn(500).delay(10000).fadeOut(500);
      });
        //document.getElementById('loading-container').style.display = "none";
        start();

    });
}

function start() {
    //document.getElementById('game').appendChild(stats.dom);
    game.start();
    window.addEventListener('resize', resize, false);
    window.addEventListener('vrdisplaypresentchange', resize, true);
    game.resize();
    //stats.begin();
    animate();
}


function animate(t) {
    requestAnimationFrame(animate);
    elapsed = t - lastTimestamp;
    if (elapsed >= FPS_INTERVAL) {
        lastTimestamp = t - (elapsed % FPS_INTERVAL);
        game.animate(t);
        //stats.end();
        //stats.begin();
    }
}

function resize() {
    game.resize();
}
