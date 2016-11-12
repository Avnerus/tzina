//Bring in all the stuff we need
import KeyboardController from './keyboard_controller'
import TzinaVRControls from './tzina_vr_controls'

import Trees from './trees'

//Paths
const SOUND_PATH = 'assets/ui_sounds/';

const TREES_PATH = "assets/trees/";

var TreesDef = {
  types: [
    {
      name: "Test",
      fileName: "points.ply",
    },
        {
      name: "ThreeTrees",
      fileName: "3tress_2.ply"
    },
     {
      name: "palm",
      fileName: "palm.ply"
    },
     {
      name: "single",
      fileName: "singleTree.ply"
    }
  ],
  instances: [

     {
      type: "ThreeTrees",
      position: [4,22,14],
      rotateX: -10,
      scale: 4.3
    },
    {
      type: "ThreeTrees",
      position: [43,24,3],
      rotateX: 0,
      scale: 4.4
    },
    {
      type: "ThreeTrees",
      position: [40,24,2],
      rotateX: 0,
      scale: 4.4
    },
    {
      type: "ThreeTrees",
      position: [20,24,-23],
      rotateX: 80,
      scale: 4.4
    },
    {
      type: "ThreeTrees",
      position: [30,24,-20],
      rotateX: 20,
      scale: 4.4
    },
 {
      type: "ThreeTrees",
      position: [30,24,-20],
      rotateX: 60,
      scale: 4.4
    },
 {
      type: "ThreeTrees",
      position: [30,24,-20],
      rotateX: 60,
      scale: 4.4
    },
  {
      type: "ThreeTrees",
      position: [6,23,-10],
      rotateX: 180,
      scale: 4.4
    },

  {
      type: "ThreeTrees",
      position: [-20,26,-20],
      rotateX: -30,
      scale: 4
    },



    {
      type: "palm",
      position: [-18,16,10],
      rotateX: -100,
      scale: 3
    },
    {
      type: "palm",
      position: [8,22,6],
      rotateX: 60,
      scale: 3
    },
     {
      type: "palm",
      position: [-38,20,-32],
      rotateX: 60,
      scale: 3.8
    },
  ]
};

var uniforms = {
  time: { type: "f", value: 0 },
  speedFactor: { type: "f", value: 1.0 },
  pointSize: { type: "f", value: 2.0 },
  bendFactor: { type: "f", value: 0.05 },
  bendHeightLimit: { type: "f", value: 0.0 },
  wind: { type: "v2", value: new THREE.Vector2 ( 1.0, 0.5 ) },
  rustleHeightLimit: { type: "f", value: 5.0 },
  rustleColorCheck: { type: "b", value: false },
  rustleFactor: { type: "f", value: 4.0 },
  rustleFrequency: { type: "f", value: 0.2 }
};

//Global Variables
var camera, renderer, trees, clock, controls, scene, trees;

try {

    var loadingManager = new THREE.LoadingManager();

     loadingManager.onProgress = function (item, loaded, total) {

      console.log(loaded / total * 100 + '%');


      $('#progress').css({'width': loaded / total * 100 + '%'})
        //console.log(loaded * 20);

      $('#progress_text').html('Loading Tzina...' + loaded / total * 100 + '%');

     };

      var videoLogo = $('#logo').get(0);

      var videoBirds = $('#birds').get(0);

      //Init the three scene first
      init();

      var currentLanguage = 'en';

      //Intro sound
      var introSound = new Audio(SOUND_PATH + 'Theme_Intro_1.ogg');

      introSound.loop = true;

      introSound.volume = 0.5;

    //Declare all button sounds and play logo video

      //Hover
      var buttonSound = new Audio(SOUND_PATH + 'Button_C_1_new.ogg');

      var buttonClick = new Audio(SOUND_PATH + 'Button_Click_new.ogg');

      $('.button').mouseenter(function(){

        buttonSound.play();

      });

      //Reset the sound
      $('.button').mouseleave(function(){

        buttonSound.pause();

        buttonSound.currentTime = 0;

      });

      //Click
      $('.button').click(function(){

        buttonClick.play();

        setTimeout( function() {

          buttonClick.pause();

          buttonClick.currentTime = 0;

        }, 1000);

      });

      //Fade in the first screen from black after tree scene was loaded
      // loadingManager.onLoad = function(){

          //Start rendering the canvas
          render();

          //Change language bind

         


              $('#landing_screen').delay(50).fadeIn(500, function(){

                  console.log('Landing screen faded in');

                  //Disable mouse control on tree scene
                  $('#tree_scene').css({
                    "pointer-events": "none"
                  });
                    
                  //After scene loaded get rid of the progress bar
                  $('#progress').hide();

                  //Ambient Sound
                  introSound.play();

                  $('#progress_text').fadeOut(50);

                  $('#headphones_solo').delay(250).fadeIn(250).delay(5000).fadeOut(50, function(){

                      $('#firstscreen').fadeIn(250);

                      //Fade in the canvas
                      $('#tree_scene').delay(250).fadeIn(500, function(){

                            //Fade in about button
                            $('#about').fadeIn(250);

                            //Fade in language selector
                            $('#language').fadeIn(250);

                            $('#birds').fadeIn(250);

                      });

                      videoBirds.loop = true;

                      videoBirds.play();

                   }); 

                  

            });

      // }

    //Pagination
    //About
      $('#about').click(function(){

        //Click sound
        buttonClick.play();

        setTimeout( function() {

          buttonClick.pause();

          buttonClick.currentTime = 0;

        }, 1000);

        //Rotate the icon
        $('#about').toggleClass('open');

        //Toggle the screen container (display on/off)
        $('#about_container').toggle(250);

      });
    //Device Chooser Buttons
      $('#enter_button').mouseenter(function(){
          $('#logo').removeClass('grayscale');
          videoLogo.play();
      });

      $('#enter_button').mouseleave(function(){
          $('#logo').addClass('grayscale');
          videoLogo.pause();
          videoLogo.currentTime = 0;
      });

      $('#enter_button').click(function(){

        $('#enter_button').fadeOut(250, function(){

          console.log('platform specific buttons');

          $('#vive_button').delay(250).fadeIn(250);

          $('#desktop_button').delay(250).fadeIn(250, function(){

              $('#logo').removeClass('grayscale');

              videoLogo.loop = true;

              videoLogo.play();

          });

        });

      });
      //Change language functionallity
      $('#language').click(function(){

        $('#landing_screen').fadeOut(500, function(){

          if(currentLanguage == 'en'){

            console.log('language changed to Hebrew');

            currentLanguage = 'he';

            $('#language').html('ENGLISH');

            $('#desc_sub').html('מאת שירין אנלן webVR דוקומנטרי');

            $('#enter_button').html('כניסה');

            $('#lower_tag').html('מסע דרך שטפון רגשי של בדידות ואהבה');

            $('#landing_screen').fadeIn(250);

          } else if(currentLanguage == 'he') {

            console.log('language changed to English');

            currentLanguage = 'en';

            $('#language').html('עברית');

            $('#desc_sub').html('A WEBVR DOCUMENTARY BY SHIRIN ANLEN');

            $('#enter_button').html('ENTER');

            $('#lower_tag').html('a journey through an emotional flood<br>of love and loneliness');

            $('#landing_screen').fadeIn(250);

          }

        });

      });





    ////////////////////
    //////HTC VIVE//////
    ////////////////////
      $('#vive_button').click(function(){

        //Fade out the overlays
        $('#landing_screen').fadeOut(250, function(){
          $('#about').animate({
            top: '-100px'
          }, 100);

          $('#language').animate({
            top: '-100px'
          }, 100);
        });

        //Fade in the first set of instructions
        $('#instruction_screen').delay(500).fadeIn(250, function(){

            $('#vive_instruc').fadeIn(250);

          console.log('instructions faded in');

          //Enable mouse events on instructions
          $('#tree_scene').css({
                "pointer-events": "auto"
          });


          //Fade in the first instruction screen and timeout fadeout


        });

      });

    ////////////////////
    //////DESKTOP///////
    ////////////////////
      $('#desktop_button').click(function(){

        //Fade out the overlays
        $('#landing_screen').fadeOut(250, function(){

          //Get rid of the about button
          $('#about').animate({
            top: '-100px'
          }, 100);

          $('#language').animate({
            top: '-100px'
          }, 100);

        });

        //Fade in the first set of instructions
        $('#instruction_screen').delay(500).fadeIn(250, function(){

            $('#desktop_instruc').fadeIn(250);

          console.log('instructions faded in');

          //Enable mouse events on instructions
          $('#tree_scene').css({
                "pointer-events": "auto"
          });

          $( document ).on( "mousemove", function( mousePosition ) {

          var mouseToRadius = Math.round((mousePosition.pageX * (Math.PI / 360) * 36) + 30);

          console.log(mouseToRadius);

          $('#mouse').css({

            'transform': 'rotate(' + mouseToRadius + 'deg)'

          });

          });


          //Fade in the first instruction screen and timeout fadeout
          $('#sunsall').mouseenter(function(){
            $('#sun7').fadeIn(250).delay(200).fadeOut(250, function(){
              $('#sun9').fadeIn(250).delay(200).fadeOut(250, function(){
                $('#sun12').fadeIn(250).delay(200).fadeOut(250, function(){
                  $('#sun5').fadeIn(250).delay(200).fadeOut(250, function(){
                    $('#sun7p').fadeIn(250).delay(200).fadeOut(250);
                  })
                })
              })
            })
          });

          });

        });

          //Utility Functions

            //Keycodes for the keyboard tutorial
           $(document).on( "keypress", function(key){
              console.log(key.keyCode);

                if( key.keyCode == 119 ){
                  console.log('W key pressed');
                  $('#wkey').fadeIn(50);
                  //Then remove it
                  setTimeout(function(){
                  $('#wkey').fadeOut(50);
                }, 350);

                } else if ( key.keyCode == 115 ) {
                  console.log('S key pressed');
                  //Turn the key white
                  $('#skey').fadeIn(50);
                  //Then remove it
                  setTimeout(function(){
                  $('#skey').fadeOut(50);
                }, 350);

                } else if( key.keyCode == 100 ){
                   console.log('D key pressed');
                  //Turn the key white
                  $('#dkey').fadeIn(50);
                  //Then remove it
                  setTimeout(function(){
                  $('#dkey').fadeOut(50);
                }, 350);

                } else if( key.keyCode == 97 ){
                    console.log('A key pressed');
                  //Turn the key white
                  $('#akey').fadeIn(50);
                  //Then remove it
                  setTimeout(function(){
                  $('#akey').fadeOut(50);
                }, 350);
                }
           });





    //Threejs Tree Scene
  function init() {

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.getElementById("tree_scene").appendChild(renderer.domElement);

        camera.position.set(3,20, 3.2893155474929934);
        camera.rotation.set(2.897615188414925, -1, 3.0189561019538735);
        //camera.lookAt( new THREE.Vector3( 15, 40, 15 ) );
        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.target.set( 15, 30, 15 );
        // load & add the trees
        trees = new Trees(camera, renderer);
        trees.init(loadingManager);
        scene.add(trees);
        // we need to pass delta time to the shader so we need a clock
        clock = new THREE.Clock();
        clock.start();

  }

  function render() {
        //Without this you will need to move the mouse or keyboard to start the render
        controls.update();

        requestAnimationFrame( render );

        renderer.render(scene, camera);

        // update time
        var delta = clock.getDelta();

        uniforms.time.value += delta;

  }
}
catch(e) {
    console.error("Exception", e);
}


