import BlurModule from "./util/SoundBlur";
const SOUND_PATH = "assets/sound/"

/*note on sound focus and defocus:
Each StaticSoundSampler and each PositionalSoundSampler contains a blurModule.
this module applies some filters that will make the sound seem more diffuse, thus
allowing us to put focus on a sound while others go to background.
The panorama object that is initialized in the constructor will handle this. If
you need to add a StaticSoundSampler or PositionalSoundSampler that will become
focused and unfocused, append it to the panorama by using the panorama.append.
*/

let fountain, highway_1, highway_2, innerKikar, wind, testsound;
let ambientSamples=[
  {name: "fountain", path:'Kikar_Inner.ogg', color:0x00ffFF, position:[0, 20, 0]},
  {name: "highway_1", path:'Kikar_Ambiance_1_Loud.ogg', color:0xF0ff00, position:[-25, 15, 0]},
  {name: "highway_2", path:'Kikar_Ambiance_2_Loud.ogg', color:0x0Fff00, position:[25, 15, 0]},
  {name: "innerKikar", path:'Pigeons_Center_Kikar.ogg', color:0x00ff0F, position:[0, 20, 0]},
  {name: "wind", path:'WindinTrees.ogg', color:0x00ffF0, position:[0, 30, 20]},
  {name: "testsound", path:'testsound.ogg', color:0xFF0000, position:[0, 25, 15], disable:true}
];



export default class SoundManager {
    constructor(camera, scene) {
      this.camera = camera;
      this.scene = scene;
      //this array will contain all the positionalSamplers that we want to focus and unfocs
      //this lets us to blur all sounds while focusing on one, for the tweenFocus(to) function
      this.panorama={
        samplers:[],
        append:function(who){
          //check that this append will not cause crashes
          if(typeof(who.controlBlur)==='function'){
            this.samplers.push(who);
          }else{
            console.warn("you tried to append a sound to soundManager's panorama, but the sound doesn't have a controlBlur function.");
          }
        },
        detach:function(who){
          try{
            this.samplers.splice(this.samplers.indexOf(who),1);
          }catch(error){
            console.error("soundmanager.panorama could not detach the sampler: ");
            console.warn(error);
          }
        },
        eachSampler:function(what,except){
          for(var a in this.samplers){
            if(!except || except===undefined || except!=this.samplers[a]){
              what(this.samplers[a],a);
            }
          }
        },
        //you can also name it as blurAll(except)
        setFocus:function(on,time){
          //blurr all except the one in focus
          this.eachSampler(function(thisSampler,n){
            thisSampler.controlBlur(1,time);
          },on);
          //focus the one we are focusing, if there is any
          if(on && on!==undefined) if(typeof(on.controlBlur)==='function'){
            on.controlBlur(0,time);
          }else{
            console.warn("you tried to set sound focus, but the provided object didn't have a controlBlur function.");
          }
        },
        setFocusWithLevel:function(on,level){
          //blurr all except the one in focus
          this.eachSampler(function(thisSampler,n){
            thisSampler.controlBlur(level, 0);
          },on);
          //focus the one we are focusing, if there is any
          if(on && on!==undefined) if(typeof(on.controlBlur)==='function'){
            on.controlBlur(0,0);
          }else{
            console.warn("you tried to set sound focus, but the provided object didn't have a controlBlur function.");
          }
        },
        //go back to normal without focusing any sound
        unsetFocus:function(time){
          console.log("here 2");
          this.eachSampler(function(thisSampler,n){
            console.log("refocus"+n);
            thisSampler.controlBlur(0,time);
          });
        },
      };
      this.createStaticSoundSampler=function(url,onLoad){
        let sss=new StaticSoundSampler(this.listener.context);
        sss.init(url,this.loadingManager,onLoad);
        return sss;
      }
      this.createPositionalSoundSampler=function(url,onLoad){
        let pss=new PositionalSoundSampler(this.listener,this.scene);
        pss.init(url,this.loadingManager,onLoad);
        return pss;
      }
    }
    init(loadingManager) {
      let thisSoundManager=this;
      console.log("initializing a SoundManager");

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

        this.loader = new THREE.AudioLoader(new THREE.LoadingManager());

        //create positional samples
        for(var a in ambientSamples){

          let thisSample=ambientSamples[a];
          if(!thisSample.disable){
            let pSampler=new PositionalSoundSampler(this.listener,this.scene);
            pSampler.blurModule.controlVolume(0.5);
            pSampler.position.set(thisSample.position[0],thisSample.position[1],thisSample.position[2]);
            //pSampler.createDebugCube(0xFF0000);
            pSampler.init(SOUND_PATH + thisSample.path,loadingManager,function(thisSampler){
              //Put attention that thisSample is not the same as thisSampler.
              //on sample loaded
              thisSoundManager.panorama.append(thisSampler);
              thisSampler.setToLoop();

              let thisSamplerGuiControl={
                // blur:0.5,
                focus:function(){
                  thisSoundManager.panorama.setFocus(thisSampler,3);
                },
              }

              // events.emit("add_gui", {
              //   folder: "Sound Blur",
              //   step:0.01,
              //   onChange:function(a){
              //     thisSampler.blurModule.controlBlur(a)
              //   }
              // },thisSamplerGuiControl,"blur",0,1);

              /*

              events.emit("add_gui", {
                folder: "Sound setFocus",
                },thisSamplerGuiControl,"focus"); */

              console.log(thisSampler.name+" sample loaded");
            });
            thisSample.sampler=pSampler;
          }
        }
        //gui control for back to normal
        /*
        events.emit("add_gui", {
          folder: "Sound setFocus",
          },{unset:function(){console.log("here1");thisSoundManager.panorama.unsetFocus(3);}},"unset"); */

        // Dynamically loaded sounds
        this.sounds = {}
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

      }else if(setName == "ambience"){
        for(var a in ambientSamples){
          let thisSample=ambientSamples[a];
          console.log(thisSample);
          if((!thisSample.disable) && thisSample.sampler){
            thisSample.sampler.play();
          }
        }
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
        if(setName=="sunGazedSound"){
        }else if(setName=="flyingSound"){
        }else if(!setName){
          console.warn("SoundManager was called to play without providing a setName");
          for(var a in ambientSamples){
            let thisSample=ambientSamples[a];
            console.log(thisSample);
            if((!thisSample.disable) && thisSample.sampler){
              thisSample.sampler.pause();
              thisSample.sampler.currentTime = 0;
            }
          }
        }else{
          console.warn("SoundManager was called to play but the parameter setName didn't match any statement "+setName);
        }
    }

}

export class StaticSoundSampler{
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
      //console.log("request",request);
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
  pause(){
    console.warn("sound stop and pause is untested. Test it and remove these lines");
    this.source.stop();
  }
  stop(){
    console.warn("sound stop and pause is untested. Test it and remove these lines");
    this.source.stop();
    this.source.currentTime = 0;
  }
}


export class PositionalSoundSampler extends StaticSoundSampler{
  constructor(listener,scene){
    let audioContext=listener.context;
    super(audioContext);
    this.listener=listener;
    this.scene=scene;
    let connectorNode=audioContext.createGain();
    this.staticSoundOutputDestination=connectorNode;
    let pa=new THREE.PositionalAudio(listener);
    this.positionalAudio=pa;
    this.positionalAudio.setNodeSource(connectorNode);
    this.scene.add(this.positionalAudio);
    this.position={
      set:function(a,b,c){return pa.position.set(a,b,c)},
      get:function(){return pa.position.get()}
    }
    //using apply because there are n arguments
    this.control=function(...a){this.blurModule.control.apply(this.blurModule,a)};
    this.controlBlur=function(...a){this.blurModule.controlBlur.apply(this.blurModule,a)};
    this.controlVolume=function(...a){this.blurModule.controlVolume.apply(this.blurModule,a)};
    // this.position=this.positionalAudio.position;
  }
  init(sampleUrl,loadingManager,loadReadyCallback){
    super.init(sampleUrl,loadingManager,loadReadyCallback);
    this.positionalAudio.setRefDistance( 1 );
    this.positionalAudio.autoplay = false;
    // this.positionalAudio.setLoop(true);
  }
  createDebugCube(incolor){
    //DEBUG CUBE so I can show where the sound is coming from
    this.testCube = new THREE.Mesh(new THREE.BoxGeometry(2, 15, 2), new THREE.MeshBasicMaterial({color:incolor||0x0000FF}));
    this.testCube.position.set(0,0,0);
    this.positionalAudio.add(this.testCube);
  }
}
