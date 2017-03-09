//Bring in all the stuff we need
import KeyboardController from './keyboard_controller'
import TzinaVRControls from './tzina_vr_controls'
import DebugUtil from './util/debug'
import Trees from './trees'


var Game = require('./game').default;
var config = require('./config').default;
var Stats = require('stats.js');

// DISABLE LOGGING
//
if (config.production) {
  window['console']['log'] = function () { };
}

var game = new Game(config);
var stats = new Stats();
stats.showPanel(0);

var fullscreen = require('fullscreen');
var lock = require('pointer-lock-chrome-tolerant');

console.log("Touch? ", Modernizr.touchevents);

var FPS = config.fps;
var FPS_INTERVAL = 1000 / FPS;
var elapsed = 0
var lastTimestamp = 0;

var clickShaderEffect = 0;

$('body').click(function () {

  clickShaderEffect = 1;

  setTimeout(function () {

    clickShaderEffect = 0;

  }, 100);

});

//Paths
const SOUND_PATH = 'assets/ui_sounds/';

const TREES_PATH = "assets/trees/";

//Global Variables
var camera, renderer, trees, clock, landingControls, scene, trees, landingKeyControl;

var mouseX = 0;
var mouseY = 0;
var followX = 0;
var followY = 0;

var windowHalfX = window.innerWidth >> 1;
var windowHalfY = window.innerHeight >> 1;

let landingScreen = true;

try {

  if (/Mobi/.test(navigator.userAgent)) {
    $('#mobile_splash').show();
    console.log('mobile splash');
  }

  var loadingManager = new THREE.LoadingManager();

  loadingManager.onProgress = function (item, loaded, total) {

    console.log(loaded / total * 100 + '%');


    $('#progress').css({
      'width': loaded / total * 100 + '%'
    })
    //console.log(loaded * 20);

    $('#progress_text').html('Loading Tzina...' + loaded / total * 100 + '%');

  };

  var videoLogo = $('#logo').get(0);

  var videoBirds = $('#birds').get(0);

  //Init the three scene first
  init();

  var currentLanguage = 'en';

  //Intro sound
  var introSound = new Audio(SOUND_PATH + 'intro.ogg');

  introSound.loop = true;

  introSound.volume = 0.5;

  //Declare all button sounds and play logo video

  //Hover
  var buttonSound = new Audio(SOUND_PATH + 'Button_C_1_new.ogg');

  var buttonClick = new Audio(SOUND_PATH + 'Button_Click_new.ogg');

  $('.button').mouseenter(function () {

    buttonSound.play();

  });

  //Reset the sound
  $('.button').mouseleave(function () {

    buttonSound.pause();

    buttonSound.currentTime = 0;

  });

  //Click
  $('.button').click(function () {

    buttonClick.play();

    setTimeout(function () {

      buttonClick.pause();

      buttonClick.currentTime = 0;

    }, 1000);

  });

  $('#about_readmore').click(function () {
    $('.about_moretext').fadeToggle(250);
    $('#about_readmore :nth-child(2)').fadeToggle(100);
    $('#about_readmore :nth-child(1)').fadeToggle(100);
  });

  $('#about_readmore_heb').click(function () {
    $('.about_moretext_heb').fadeToggle(250);
    $('#about_readmore_heb :nth-child(2)').fadeToggle(100);
    $('#about_readmore_heb :nth-child(1)').fadeToggle(100);
  });

  //Fade in the first screen from black after tree scene was loaded
  // loadingManager.onLoad = function(){

  //Start rendering the canvas

  //Change language bind

  if (!config.skipLanding) {
    $("#loading-container").hide();

    $('#landing_screen').delay(50).fadeIn(500, function () {

      console.log('Landing screen faded in');

      //Disable mouse control on tree scene
      $('#tree_scene').css({
        "pointer-events": "none"
      });

      //After scene loaded get rid of the progress bar

      //Ambient Sound
      introSound.play();

      $('#progress_text').fadeOut(50);

      $('#headphones-solo').delay(250).fadeIn(250).delay(5000).fadeOut(50, function () {

        $('#firstscreen').fadeIn(250);

        //Fade in the canvas
        $('#tree_scene').delay(250).fadeIn(500, function () {

          //Fade in about button
          $('#about').fadeIn(250);

          //Fade in language selector
          $('#language').fadeIn(250);

        });

      });



    });
  }



  // }

  //Pagination
  //About
  $('#about').click(function () {

    $('#language').fadeToggle(250);

    //Click sound
    buttonClick.play();

    $('#landing_screen').fadeToggle(250);

    setTimeout(function () {


      buttonClick.pause();

      buttonClick.currentTime = 0;

    }, 1000);

    //Rotate the icon
    $('#about').toggleClass('open');

    //Toggle the screen container (display on/off)
    $('#about_container').fadeToggle(500);

  });
  //Device Chooser Buttons
  $('#enter_button').mouseenter(function () {
    $('#logo').removeClass('grayscale');
    videoLogo.play();
  });

  $('#enter_button').mouseleave(function () {
    $('#logo').addClass('grayscale');
    videoLogo.pause();
    videoLogo.currentTime = 0;
  });

  $('#enter_button').click(function () {

    $('#enter_button').fadeOut(250, function () {

      console.log('platform specific buttons');

      $('#vive_button').delay(250).fadeIn(250).css("display", "inline-block");

      $('#desktop_button').delay(250).fadeIn(250, function () {

        $('#logo').removeClass('grayscale');

        //videoLogo.loop = true;

        //videoLogo.play();

      }).css("display", "inline-block");

    });

  });
  //Change language functionallity
  $('#language').click(function () {

    $("#about_grid_he").toggle();
    $("#about_grid_en").toggle();

    $('#landing_screen').fadeOut(500, function () {

      if (currentLanguage == 'en') {

        console.log('language changed to Hebrew');

        currentLanguage = 'he';
        config.language = 'heb';

        $('#language').html('<img src="assets/ui/language_Eng.png">');

        $('#desc_sub').html('מאת שירין אנלן webVR דוקומנטרי');

        $('#enter_button').html('כניסה');

        $('#lower_tag').html('מסע דרך שטפון של בדידות ואהבה');

        $('#vive_instruc').html('הסתכל סביב, ולך במרחב של שלושה מטר רבוע<br>הסתכל על השמשות בכדי לשלוט בשעה');

        $('#desktop_instruc').html('השתמש בחצים בשביל לזוז<br> השתמש בעכבר בשביל להסתכל סביב<br> הסתכל על השמשות בכדי לשלוט בשעה')

        $('#landing_screen').fadeIn(250);

      } else if (currentLanguage == 'he') {

        console.log('language changed to English');

        currentLanguage = 'en';
        config.language = 'eng';

        $('#language').html('<img src="assets/ui/language-Heb.png">');

        $('#desc_sub').html('A webVR Documentary by Shirin Anlen');

        $('#enter_button').html('ENTER');

        $('#vive_instruc').html('LOOK AROUND AND WALK WITHIN A 3X3 METER RANGE <br> GAZE AT THE SUN TO CHANGE THE TIME');

        $('#desktop_instruc').html('Use arrow/WASD keys to move around<br> Use mouse/trackpad to look around<br> Gaze at the suns to change the time');

        $('#lower_tag').html('journey through a flood of love and loneliness');

        $('#landing_screen').fadeIn(250);

      }

    });

  });





  ////////////////////
  //////HTC VIVE//////
  ////////////////////
  $('#vive_button').click(function () {

    $('#vive_button').fadeOut(250);
    $('#desktop_button').fadeOut(250);

    $('#about').animate({
      top: '-100px'
    }, 100);

    $('#language').animate({
      top: '-100px'
    }, 100);

    //Fade in the first set of instructions
    $('#instruction_screen').fadeIn(250, function () {

      $('#vive_instruc').fadeIn(250);

      $('#progress_text').fadeIn(250).delay(2000, function () {

        game.setPlatform("vive");

        try {
          game.load(function () {
            console.log('Game Finished Loading');
            $('#instruction_screen').fadeOut(250, function () {

              $('#landing_screen').hide();
              $('#tree_scene').hide();
              $('#progress').hide();
              $('#progress_text').hide();
              killLanding();

              $('#start_head').fadeIn(250, function () {

                $('#start_experience').delay(100).fadeIn(250);

                buttonClick.play();

                introSound.pause();

              });

            });

          }, function (url, itemsLoaded, itemsTotal) {
            console.log("Landing loaded", itemsLoaded, itemsTotal);
            $('#progress').css({
              'width': itemsLoaded / itemsTotal * 100 + '%'
            })
            if (currentLanguage == 'en') {
              $('#progress_text').html('Loading Tzina...' + Math.round(itemsLoaded / itemsTotal * 100) + '%');
            } else {
              $('#progress_text').html(Math.round(itemsLoaded / itemsTotal * 100) + '%' + '...טוען');
            }



          });
        } catch (e) {
          console.error("Exception during game load ", e);
        }


      });


    });

  });

  ////////////////////
  //////DESKTOP///////
  ////////////////////
  $('#desktop_button').click(function () {

    $('#vive_button').fadeOut(250);
    $('#desktop_button').fadeOut(250);

    //Get rid of the about button
    $('#about').animate({
      top: '-100px'
    }, 100);

    $('#language').animate({
      top: '-100px'
    }, 100);

    //Fade in the first set of instructions
    $('#instruction_screen').fadeIn(250, function () {

      $('#desktop_instruc').fadeIn(250);

      $('#progress_text').fadeIn(250).delay(2000, function () {

        game.setPlatform("desktop");

        try {
          game.load(function () {
            console.log('Game Finished Loading');
            $('#instruction_screen').fadeOut(250, function () {

              $('#landing_screen').hide();
              $('#tree_scene').hide();
              $('#progress').hide();
              $('#progress_text').hide();
              killLanding();

              $('#start_head').fadeIn(250, function () {

                $('#start_experience').delay(100).fadeIn(250);

                buttonClick.play();

                introSound.pause();

              });

            });

          },
            function (url, itemsLoaded, itemsTotal) {
              $('#progress').css({
                'width': itemsLoaded / itemsTotal * 100 + '%'
              })
              if (currentLanguage == 'en') {
                $('#progress_text').html('Loading Tzina...' + Math.round(itemsLoaded / itemsTotal * 100) + '%');
              } else {
                $('#progress_text').html(Math.round(itemsLoaded / itemsTotal * 100) + '%' + '...טוען');
              }
            });
        } catch (e) {
          console.error("Exception during game load ", e);
        }

        //Enable mouse events on instructions
        $('#tree_scene').css({
          "pointer-events": "auto"
        });

      });

    });

  });
  ///////////////////////////
  ////Main start buttons/////
  ///////////////////////////
  var el = document.getElementById('game');
  //Vive
  $('#start_experience').click(function () {


    function startExperience() {
      if (!game.started) {
        window.addEventListener('resize', resize, false);
        window.addEventListener('vrdisplaypresentchange', vrchange, true);
        game.start();
        //Show the Element
        console.log("Landing Show the game");
        $('#game').show();
        if (!config.production) {
          document.getElementById('game').appendChild(stats.dom);
        }
        game.resize();
        animate();

        $('#start_head').fadeOut(250, function () {

          $('#start_experience').fadeOut(250);

        });
      }
    }

    if (!Modernizr.touchevents && lock.available()) {

      console.log("Landing requesting pointer lock")
      var pointer = lock(document.getElementById('game'));

      pointer.on('attain', function () {
        console.log("Pointer attained!");
        startExperience();
      });

      if (config.platform == "desktop") {

        var fs = fullscreen(el);

        fs.on('attain', function () {
          console.log("Full screen attained!");
          if (typeof (pointer) != 'undefined' && !game.started) {
            pointer.request();
          }
        });
        fs.request();
      } else {
        startExperience();
      }

      /*
    

    
    if (config.fullscreen && fullscreen.available()) {
        var fs = fullscreen(el);

        fs.on('attain',function() {
            console.log("Full screen attained!");
            if (typeof(pointer) != 'undefined' && !game.started) {
                pointer.request();
            } else {
                if (!game.started) {
                    game.start();
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
                game.start();
            }
        }
    }*/


    }
  });

  function killLanding() {
    console.log("Kill landing");

    landingScreen = false;
    scene.remove(camera);
    scene.remove(trees);
    landingKeyControl = null;
    landingControls = null;
    renderer = null;
    scene = null;

  }

  //Threejs Tree Scene
  function init() {

    game.init();

    if (!config.skipLanding) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({
        alpha: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.getElementById("tree_scene").appendChild(renderer.domElement);

      camera.position.set(50, 30.08, -7.64);
      camera.rotation.set(0, 117 * Math.PI / 180, 0);


      DebugUtil.positionObject(camera, "Landing cam");

      // load & add the trees
      trees = new Trees(config, camera, renderer);
      trees.init(loadingManager, "landing")
        .then(() => {
          scene.add(trees);
          // we need to pass delta time to the shader so we need a clock
          clock = new THREE.Clock();
          clock.start();
          render();
          console.log(scene);
        });

    } else {
      game.load(function () {
        console.log('Game Finished Loading');
        $('#loading-container').hide();
        $('#instruction_screen').fadeOut(250, function () {
          $('#start_head').fadeIn(250, function () {
            $('#start_experience').delay(100).fadeIn(250);
          });
        });
      });
    }
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
  }

  var et = 0;

  function onMouseMove(e) {

    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function render() {
    if (landingScreen) {

      requestAnimationFrame(render);

      //Mouse movement
      var moveX = (mouseX - followX) / 150;
      var moveY = (mouseY - followY) / 150;

      followX += moveX;
      followY += moveY;

      camera.position.y = 30 + (followY / 70) * -1;
      camera.position.x = 30 + (followX / 70) * -1;

      // update time
      var delta = clock.getDelta();
      et += delta;
      trees.update(delta, et);

      // landingControls.update();
      // landingKeyControl.update(delta);

      trees.clickEffect(clickShaderEffect);

      renderer.render(scene, camera);

    } else {
      cancelAnimationFrame(render);
    }
  }

  function animate(t) {
    if (game.vrManager.hmd.isPresenting) {
      game.vrManager.hmd.requestAnimationFrame(animate)
    } else {
      requestAnimationFrame(animate);
    }

    game.animate(t);
    stats.end();
    stats.begin();
  }

  function resize() {
    game.resize();
  }

  function vrchange() {
    game.resize();
    game.vrChange();
  }


} catch (e) {
  console.error("Exception", e);
}