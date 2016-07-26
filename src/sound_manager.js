const SOUND_PATH = "assets/sound/"

let fountain, highway_1, highway_2;

export default class SoundManager {
    constructor(camera, scene) {

        this.camera = camera;
        this.scene = scene;

    }

    init(camera) {
      //LISTENER
      this.listener = new THREE.AudioListener();

      this.camera.add(this.listener);

      //SOUNDS
      fountain = new THREE.PositionalAudio(this.listener);
      fountain.position.set(3,15,95);
      fountain.autoplay = false;
      fountain.loop = true;
/*
      highway_1 = new THREE.PositionalAudio(this.listener);
      highway_1.position.set(15,15,0);
      highway_1.autoplay = false;
      highway_1.loop = true;

      highway_2 = new THREE.PositionalAudio(this.listener);
      highway_2.position.set(3,15,95);
      highway_2.autoplay = false;
      highway_2.loop = true;

      this.testCube = new THREE.Mesh( new THREE.BoxGeometry( 15, 15, 15 ), new THREE.MeshNormalMaterial() );
      this.testCube.position.set(15,15,0);
      this.scene.add(this.testCube);
*/
      this.scene.add(fountain);


      // instantiate a loader
      let loader = new THREE.AudioLoader();

      // load the fountain
      loader.load(SOUND_PATH + 'ambient.ogg', function ( audioBuffer ) {
            fountain.setBuffer( audioBuffer );
          }, function(){
            console.log('Fountain sound loaded')
          }
        );
      }

    play(){
    fountain.play();

    }

    pause(){
    fountain.pause();
    }
}
