import BlurModule from "./util/SoundBlur";
const SOUND_PATH = "assets/sound/"

let fountain, highway_1, highway_2, innerKikar, wind;


class StaticSoundSampler{
  constructor(audioContext){
    this.blurModule=new BlurModule(audioContext);
    this.audioContext=audioContext;
    //in practical terms, where to connect the blurmodule:
    //if static, will be an audiocontext, but if positional, will be positional audionode
    this.staticSoundOutputDestination=audioContext.destination;
  }
  setToLoop(loopValue){
    if(loopValue!==undefined){
      this.source.loop=loopValue;
    }else{
      this.source.loop=true;
    }
  }
  setBlur(value){
    this.blurModule.control(value);
  }
  init(sampleUrl,loadingManager,loadReadyCallback){
    this.sampleUrl=sampleUrl;
    let audioContext=this.audioContext;
    let thisStaticSoundSampler=this;
    //blurModule loads a impulse response audio file
    this.blurModule.init(loadingManager);
    //so we can more safely check if (thisStaticSoundSampler.source)
    this.source=false;
    //pendant: I don't know what to do with the loadingManager
    let source = audioContext.createBufferSource();
    //connect my buffer source to the blur module, and then the blur module to the output.
    try{
      source.connect(this.blurModule.inputNode);
      this.blurModule.connect(this.staticSoundOutputDestination);
    }catch(e){
      console.log(this.blurModule,this.blurModule.inputNode,audioContext.destination);
      console.error(e);
    }
    let request = new XMLHttpRequest();
    request.open('GET', this.sampleUrl, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      console.log("request",request);
      var audioData = request.response;

      audioContext.decodeAudioData(audioData, function(buffer) {
          var myBuffer = buffer;
          source.buffer = myBuffer;
          thisStaticSoundSampler.source=source;
          if(loadReadyCallback){
            loadReadyCallback(thisStaticSoundSampler);
          }

        },

        function(e){"Error with decoding audio data" + e.err});

    }
    request.send();
  }
  play(/*loop*/){
    if(this.source){
      this.source.start();
      /*this.source.loop = loop||false;*/
    }else{
      console.warn("thisStaticSoundSampler mistake: you requested to play, but the source has not been loaded yet");
    }
  }
}
class PositionalSoundSampler extends StaticSoundSampler{
  constructor(listener){
    let audioContext=listener.context;
    super(audioContext);
    let connectorNode=audioContext.createGain();
    this.staticSoundOutputDestination=connectorNode;
    this.positionalAudio=new THREE.PositionalAudio(listener);
    this.positionalAudio.setNodeSource(connectorNode);
    this.position=this.positionalAudio.position;
    // this.position=this.positionalAudio.position;
  }
  init(sampleUrl,loadingManager,loadReadyCallback){
    super.init(sampleUrl,loadingManager,loadReadyCallback);
    this.positionalAudio.setRefDistance( 1 );
    this.positionalAudio.autoplay = false;
    // this.positionalAudio.setLoop(true);
  }

  createDebugCube(scene,incolor){
    //DEBUG CUBE so I can show where the sound is coming from
    this.testCube = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10, 0.3), new THREE.MeshBasicMaterial({color:incolor||0x0000FFCC}));
    this.testCube.position.set(this.position.x,this.position.y,this.position.z);
    scene.add(this.testCube);
  }
}


export default class SoundManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
    }
    init(loadingManager) {
      let thisSoundManager=this;
      console.log("initializing a SoundManager");

      // test sound player
      // window.setTimeout(function () {
      //   console.log("Sound trying to play testsampler");
      //   let staticAudioContext=new (window.AudioContext || window.webkitAudioContext)();
      //   let testSampler=new StaticSoundSampler(staticAudioContext);
      //   testSampler.init(SOUND_PATH + 'testsound.wav',loadingManager,function(thisSampler){
      //     thisSampler.setToLoop();
      //     thisSampler.play();
      //     document.addEventListener('mousemove',function(e){
      //       thisSampler.setBlur(e.clientX/(window.innerWidth-5));
      //     });
      //   });
      // }, 15000);


      // Extending THREE.Audio
      THREE.Audio.prototype.playIn = function(seconds) {
          if ( this.isPlaying === true ) {
              console.warn( 'THREE.Audio: Audio is already playing.' );
              return;
          }

          if ( this.hasPlaybackControl === false ) {
              console.warn( 'THREE.Audio: this Audio has no playback control.' );
              return;
          }

          this.playStartTime = this.context.currentTime + seconds;
          var source = this.context.createBufferSource();

          source.buffer = this.source.buffer;
          source.loop = this.source.loop;
          source.onended = this.source.onended;
          source.start( this.playStartTime, this.startTime );
          source.playbackRate.value = this.playbackRate;

          this.isPlaying = true;

          this.source = source;

          return this.connect();
        }

        THREE.Audio.prototype.getCurrentTime = function() {
          return this.context.currentTime - this.playStartTime;
        }

        THREE.PositionalAudio.prototype.createDebugCube=function(scene,material){
          //DEBUG CUBE so I can show where the sound is coming from
          this.testCube = new THREE.Mesh(new THREE.BoxGeometry(1, 20, 1), new THREE.MeshBasicMaterial(material||{color:0x00ff00}));
          this.testCube.position.set(this.position.x,this.position.y,this.position.z);
          scene.add(this.testCube);
        }

        //LISTENER
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        //SOUNDS

        //Fontain Water
        fountain = new THREE.PositionalAudio(this.listener);
        fountain.position.set(0, 20, 0);
        fountain.setRefDistance( 1 );
        fountain.autoplay = false;
        fountain.setLoop(true);
        // fountain.createDebugCube(this.scene);

        //Street Sound 1
        highway_1 = new THREE.PositionalAudio(this.listener);
        highway_1.position.set(-25, 15, 0);
        highway_1.autoplay = false;
        highway_1.setLoop(true);
        // highway_1.createDebugCube(this.scene);

        //Street Sound 2
        highway_2 = new THREE.PositionalAudio(this.listener);
        highway_2.position.set(25, 15, 0);
        highway_2.autoplay = false;
        highway_2.setLoop(true);
        // highway_2.createDebugCube(this.scene);

        //Inner Kikar Sound
        innerKikar = new THREE.PositionalAudio(this.listener);
        innerKikar.position.set(0, 20, 0);
        innerKikar.autoplay = false;
        innerKikar.setLoop(true);
        // innerKikar.createDebugCube(this.scene);

        //Wind in the Trees
        wind = new THREE.PositionalAudio(this.listener);
        wind.position.set(0, 30, 20);
        wind.autoplay = false;
        wind.setLoop(true);
        // wind.createDebugCube(this.scene);


        //DEBUG CUBE so I can show where the sound is coming from
        // this.testCubeone = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
        // this.testCubeone.position.set(0, 30, 20);
        //this.scene.add(this.testCubeone);

        //SOUND ADDING
        this.scene.add(fountain);
        this.scene.add(highway_1);
        this.scene.add(highway_2);
        this.scene.add(innerKikar);
        this.scene.add(wind);

        //BUFFER THE SOUNDS INTO THE PROPER ELEMENTS
        this.loader = new THREE.AudioLoader(loadingManager);

        let testsound=new PositionalSoundSampler(this.listener);
        testsound.position.set(0, 5, 5);
        testsound.createDebugCube(this.scene,0xFF0000);
        testsound.init(SOUND_PATH + "testsound.ogg",loadingManager,function(a){
          console.log("testsound loaded",a);
          a.setToLoop();
          a.play();
        });

        // Dynamically loaded sounds
        this.sounds = {}

        // FOUNTAIN
        this.loader.load(SOUND_PATH + 'Kikar_Inner.ogg', function(audioBuffer) {
            fountain.setBuffer(audioBuffer);
        }, function() {
        });

        // HIGHWAY ONE
        this.loader.load(SOUND_PATH + 'Kikar_Ambiance_1_Loud.ogg', function(audioBuffer) {
            highway_1.setBuffer(audioBuffer);
        }, function() {
        });

        // HIGHWAY TWO
        this.loader.load(SOUND_PATH + 'Kikar_Ambiance_2_Loud.ogg', function(audioBuffer) {
            highway_2.setBuffer(audioBuffer);
        }, function() {
        });

        // Inner Kikar sound
        this.loader.load(SOUND_PATH + 'Pigeons_Center_Kikar.ogg', function(audioBuffer) {
            innerKikar.setBuffer(audioBuffer);
        }, function() {
        });

        // Wind
        this.loader.load(SOUND_PATH + 'WindinTrees.ogg', function(audioBuffer) {
            wind.setBuffer(audioBuffer);
        }, function() {
        });
        this.activateEventListeners();
    }
    activateEventListeners(){
      //here we set listeners and assign a play function upon the call of each listener
    }
    play(setName) {
      //choose which sounds to trigger
      //of course that all the other sound objects must have the play function to call at once from here.
      if(setName=="sunGazedSound"){
      }else if(setName=="flyingSound"){
      }else if(!setName){
        console.warn("SoundManager was called to play without providing a setName");
        fountain.play();

        highway_1.play();

        highway_2.play();

        innerKikar.play();

        wind.play();
      }else{
        console.warn("SoundManager was called to play but the parameter setName didn't match any statement "+setName);
      }
    }

    loadSound(fileName) {
        return new Promise((resolve, reject) => {
            let sound = new THREE.Audio(this.listener);
            this.loader.load(fileName, (audioBuffer) => {
                sound.setBuffer(audioBuffer)
                resolve(sound);
            });
        });
    }
    loadPositionalSound(fileName) {
        console.log("Loading positional audio sound ", fileName);
        return new Promise((resolve, reject) => {
            let sound = new THREE.PositionalAudio(this.listener);
            this.loader.load(fileName, (audioBuffer) => {
                sound.setBuffer(audioBuffer)
                //this.scene.add(sound);
                resolve(sound);
            });
        });
    }
    pause() {
        fountain.pause();
        fountain.currentTime = 0;

        highway_1.pause();
        highway_1.currentTime = 0;

        highway_2.pause();
        highway_2.currentTime = 0;

        innerKikar.pause();
        innerKikar.currentTime = 0;

        wind.pause();
        wind.currentTime = 0;

    }
}
