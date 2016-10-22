const SOUND_PATH = "assets/sound/"

let fountain, highway_1, highway_2, innerKikar, wind, testsound;

class BlurModule{
  constructor(audioContext){
    this.filterLowestCut=80;
    this.filterHighestCut=20000;

    this.audioContext=audioContext;

    this.inputNode=audioContext.createGain();
    this.outputNode=audioContext.createGain();
  }
  init(loadingManager){
    // console.log("blurmodule init");
    let thisBlurModule=this;
    let audioContext=this.audioContext;
    this.biquadFilter = audioContext.createBiquadFilter();
    this.convolver=audioContext.createConvolver();

    let inputNode=this.inputNode;
    let outputNode=this.outputNode;

    this.dryLevel=audioContext.createGain();
    this.wetLevel=audioContext.createGain();
    /*
    [input node _______________________]
      V
    [Low pass filte ___________________]
      V                    V
    [dryLevel node]     [wetLevel node]
      |                    V
      |                 [convolver]
      V                    V
    [output node _____________________]
    */

    inputNode.connect(this.biquadFilter);

    this.biquadFilter.connect(this.dryLevel);
    this.biquadFilter.connect(this.wetLevel);

    this.dryLevel.connect(outputNode);
    this.wetLevel.connect(this.convolver);

    this.convolver.connect(outputNode);


    this.biquadFilter.type = "lowpass";
    this.biquadFilter.frequency.value = 300;

    //most code of this function comes from http://middleearmedia.com/web-audio-api-convolver-node/
    function getImpulse(impulseUrl) {
      let ajaxRequest = new XMLHttpRequest();
      ajaxRequest.open('GET', impulseUrl, true);
      ajaxRequest.responseType = 'arraybuffer';
      ajaxRequest.onload = function() {
        let impulseData = ajaxRequest.response;
        audioContext.decodeAudioData(impulseData, function(buffer) {
          let myImpulseBuffer = buffer;
          thisBlurModule.convolver.buffer = myImpulseBuffer;
          thisBlurModule.convolver.loop = true;
          thisBlurModule.convolver.normalize = true;
        },
        function(e){"Error with decoding audio data" + e.err});

      }

      ajaxRequest.send();
    }
    // getImpulse("audio/Batcave.wav");
    getImpulse(SOUND_PATH + "ui/Tunnel_impulse_response.wav");
  }
  setRange(min,max){
    this.filterLowestCut=min;
    this.filterHighestCut=max;
  }
  connect(audioInputNode){
    this.outputNode.connect(audioInputNode);
  }
  control(value){
    let wet=value;
    let filterCut=(1-value*value)*this.filterHighestCut+this.filterLowestCut;
    console.log(filterCut);
    this.biquadFilter.frequency.value=filterCut;
    this.dryLevel.gain.value=1-wet;
    this.wetLevel.gain.value=wet;
  };
}
class StaticSoundSampler{
  constructor(audioContext,sampleUrl){
    this.blurModule=new BlurModule(audioContext);
    this.sampleUrl=sampleUrl;
    this.audioContext=audioContext;
  }
  setBlur(value){
    this.blurModule.control(value);
  }
  init(loadingManager,loadReadyCallback){
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
      this.blurModule.connect(audioContext.destination);
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
  play(loop){
    if(this.source){
      this.source.start();
      this.source.loop = loop||false;
    }else{
      console.warn("thisStaticSoundSampler mistake: you requested to play, but the source has not been loaded yet");
    }
  }
  // will we need these functions?
  // stop(){
  //   if(this.source){
  //     this.source.stop();
  //     source.loop = loop||false;
  //   }else{
  //     console.warn("thisStaticSoundSampler mistake: you requested to stop, but the source has not been loaded yet");
  //   }
  // }
  // pause(){}
}
//this is a proposition of how to manage positional sounds:
class PositionalSampler{
  constructor(listener){
    //create the module for sound blur
    this.context=listener.context;
    this.positionalAudio = new THREE.PositionalAudio(listener);
    this.blurModule=new BlurModule(this.context);
    this.context=this.positionalAudio.context;
    //allows positionalSampler.position.set()
    // this.position=this.positionalAudio.postion;
    this.position={
      set:function(i){console.log(i);}
    }
  }
  setBlur(value){
    this.blurModule.control(value);
  }
  init(sampleUrl,loadingManager,scene,loadReadyCallback){
    console.log("initializing a positionalSampler",[sampleUrl,loadingManager,scene,loadReadyCallback]);
    let positionalAudio=this.positionalAudio;
    let context=this.context;
    let thisPositionalSampler=this;
    //pendant: probably we want to use Promise here
    this.loader = new THREE.AudioLoader(loadingManager);
    this.sampleUrl=sampleUrl;
    this.scene=scene;
    //blurModule loads an impulse response audio file
    this.blurModule.init(loadingManager);


    // source.connect(this.blurModule.inputNode);
    // this.blurModule.connect(context.destination);

    //load the sample that was provided through call parameter before
    this.loader.load(this.sampleUrl, function(audioBuffer) {
      //onload
      console.log("audiobuffer loaded");
      positionalAudio.setBuffer(audioBuffer);
      // var source = thisPositionalSampler.context.createBufferSource();
      // thisPositionalSampler.source=source;
      if(loadReadyCallback){
        loadReadyCallback(thisPositionalSampler);
      }
    }, function() {
      //onprogress
    }, function(e) {
      console.error(e);
    });


    scene.add(this);

  }
  createDebugCube(){
    //DEBUG CUBE so I can show where the sound is coming from
    this.testCube = new THREE.Mesh(new THREE.BoxGeometry(1, 20, 1), new THREE.MeshBasicMaterial({color:0x00ff00}));
    this.testCube.position.set(this.position.x,this.position.y,this.position.z);
    this.scene.add(this.testCube);
  }
  play(){
    console.log("playing a positionalSampler");
    // super.play();

    // if(this.source){
      this.source.play();
    // }else{
      // console.warn("thisStaticSoundSampler mistake: you requested to play, but the source has not been loaded yet");
    // }
  }
  // will we need these functions?
  // stop(){
  //   if(this.source){
  //     this.source.stop();
  //     source.loop = loop||false;
  //   }else{
  //     console.warn("thisStaticSoundSampler mistake: you requested to stop, but the source has not been loaded yet");
  //   }
  // }
  // pause(){}
}

export default class SoundManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
    }
    init(loadingManager) {
      console.log("initializing a SoundManager");

      // test sound player
      window.setTimeout(function () {
        console.log("Sound trying to play testsampler");
        let staticAudioContext=new (window.AudioContext || window.webkitAudioContext)();
        let testSampler=new StaticSoundSampler(staticAudioContext, SOUND_PATH + 'ui/Button_Click.ogg');
        testSampler.init(loadingManager,function(thisSampler){
          thisSampler.play(true);
          document.addEventListener('mousemove',function(e){
            // console.log(document.width);
            thisSampler.setBlur(e.clientX/(window.innerWidth-5));
          });
        });
      }, 15000);


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

        //LISTENER
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        //SOUNDS

        //Fontain Water
        fountain=new PositionalSampler(this.listener);
        // fountain = new THREE.PositionalAudio(this.listener);
        console.log("sound","following line is error");
        console.log("sound",fountain.position);
        fountain.position.set(0, 20, 0);
        fountain.setRefDistance( 1 );
        // fountain.autoplay = false;
        // fountain.loop = true;
        fountain.init(SOUND_PATH + 'Kikar_Inner.ogg',loadingManager,this.scene,function(){
          console.log("fountain sound loaded and initialized");
          fountain.createDebugCube();
        });

        //Street Sound 1
        highway_1=new PositionalSampler(this.listener);
        // highway_1 = new THREE.PositionalAudio(this.listener);
        highway_1.position.set(-25, 15, 0);
        // highway_1.autoplay = false;
        // highway_1.loop = true;
        highway_1.init(SOUND_PATH + 'Kikar_Ambiance_1_Loud.ogg',loadingManager,this.scene,function(){
          console.log("highway_1 sound loaded and initialized");
          highway_1.createDebugCube();
        });

        //Street Sound 2
        highway_2=new PositionalSampler(this.listener);
        // highway_2 = new THREE.PositionalAudio(this.listener);
        highway_2.position.set(25, 15, 0);
        // highway_2.autoplay = false;
        // highway_2.loop = true;
        highway_2.init(SOUND_PATH + 'Kikar_Ambiance_2_Loud.ogg',loadingManager,this.scene,function(){
          console.log("highway_2 sound loaded and initialized");
          highway_2.createDebugCube();
        });

        //Inner Kikar Sound
        innerKikar = new PositionalSampler(this.listener);
        // innerKikar = new THREE.PositionalAudio(this.listener);
        innerKikar.position.set(0, 20, 0);
        // innerKikar.autoplay = false;
        // innerKikar.loop = true;
        innerKikar.init(SOUND_PATH + 'Pigeons_Center_Kikar.ogg',loadingManager,this.scene,function(){
          console.log("innerKikar sound loaded and initialized");
          innerKikar.createDebugCube();
        });

        //Wind in the Trees
        wind = new PositionalSampler(this.listener);
        // wind = new THREE.PositionalAudio(this.listener);
        wind.position.set(0, 30, 20);
        // wind.autoplay = false;
        // wind.loop = true;
        wind.init(SOUND_PATH + 'WindinTrees.ogg',loadingManager,this.scene,function(){
          console.log("wind sound loaded and initialized");
          wind.createDebugCube();
        });

        //Fontain Water
        testsound=new PositionalSampler(this.listener);
        // fountain = new THREE.PositionalAudio(this.listener);
        testsound.position.set(0, 20, 0);
        // testsound.setRefDistance( 1 );
        // fountain.autoplay = false;
        // fountain.loop = true;
        testsound.init(SOUND_PATH + 'testsound.wav',loadingManager,this.scene,function(){
          console.log("fountain sound loaded and initialized");
          testsound.createDebugCube();
        });


        //SOUND ADDING
        // this.scene.add(fountain);
        // this.scene.add(highway_1);
        // this.scene.add(highway_2);
        // this.scene.add(innerKikar);
        // this.scene.add(wind);

        //BUFFER THE SOUNDS INTO THE PROPER ELEMENTS
        this.loader = new THREE.AudioLoader(loadingManager);

        // Dynamically loaded sounds
        this.sounds = {}

        // FOUNTAIN
        // this.loader.load(SOUND_PATH + 'Kikar_Inner.ogg', function(audioBuffer) {
        //     // fountain.setBuffer(audioBuffer);
        // }, function() {
        // });
        //
        // // HIGHWAY ONE
        // this.loader.load(SOUND_PATH + 'Kikar_Ambiance_1_Loud.ogg', function(audioBuffer) {
        //     // highway_1.setBuffer(audioBuffer);
        // }, function() {
        // });
        //
        // // HIGHWAY TWO
        // this.loader.load(SOUND_PATH + 'Kikar_Ambiance_2_Loud.ogg', function(audioBuffer) {
        //     // highway_2.setBuffer(audioBuffer);
        // }, function() {
        // });
        //
        // // Inner Kikar sound
        // this.loader.load(SOUND_PATH + 'Pigeons_Center_Kikar.ogg', function(audioBuffer) {
        //     // innerKikar.setBuffer(audioBuffer);
        // }, function() {
        // });
        //
        // // Wind
        // this.loader.load(SOUND_PATH + 'WindinTrees.ogg', function(audioBuffer) {
        //     // wind.setBuffer(audioBuffer);
        // }, function() {
        // });
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
        fountain.play(true);
        highway_1.play(true);
        highway_2.play(true);
        innerKikar.play(true);
        wind.play(true);
        testsound.play(true);
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
        // fountain.pause();
        // fountain.currentTime = 0;

        // highway_1.pause();
        // highway_1.currentTime = 0;

        highway_2.pause();
        highway_2.currentTime = 0;

        // innerKikar.pause();
        // innerKikar.currentTime = 0;

        // wind.pause();
        // wind.currentTime = 0;

    }
}
