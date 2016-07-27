const SOUND_PATH = "assets/sound/"

let fountain, highway_1, highway_2;

export default class SoundManager {
    constructor(camera, scene) {

        this.camera = camera;
        this.scene = scene;

    }

    init() {
        //LISTENER
        this.listener = new THREE.AudioListener();

        this.camera.add(this.listener);

        //SOUNDS
        fountain = new THREE.PositionalAudio(this.listener);
        fountain.position.set(3, 15, 95);
        fountain.autoplay = false;
        fountain.loop = true;

        highway_1 = new THREE.PositionalAudio(this.listener);
        highway_1.position.set(-25, 15, 0);
        highway_1.autoplay = false;
        highway_1.loop = true;

        highway_2 = new THREE.PositionalAudio(this.listener);
        highway_2.position.set(3, 15, 170);
        highway_2.autoplay = false;
        highway_2.loop = true;

        //DEBUG CUBES
        this.testCubeone = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
        this.testCubeone.position.set(-25, 15, 0);
        this.scene.add(this.testCubeone);

        this.testCubetwo = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
        this.testCubetwo.position.set(30, 10, 190);
        this.scene.add(this.testCubetwo);

        //SOUND ADDING
        this.scene.add(fountain);
        this.scene.add(highway_1);
        this.scene.add(highway_2);

        //BUFFER THE SOUNDS INTO THE PROPER ELEMENTS
        let loader = new THREE.AudioLoader();

        // FOUNTAIN
        loader.load(SOUND_PATH + 'ambient.ogg', function(audioBuffer) {
            fountain.setBuffer(audioBuffer);
        }, function() {
            console.log('Fountain sound loaded');
        });

        // HIGHWAY ONE
        loader.load(SOUND_PATH + 'ambient.ogg', function(audioBuffer) {
            highway_1.setBuffer(audioBuffer);
        }, function() {
            console.log('Highway one sound loaded');
        });

        // HIGHWAY TWO
        loader.load(SOUND_PATH + 'ambient.ogg', function(audioBuffer) {
            highway_2.setBuffer(audioBuffer);
        }, function() {
            console.log('Highway two sound loaded');
        });



    }

    play() {
        fountain.play();
        highway_1.play();
        highway_2.play();

    }

    pause() {
        fountain.pause();
        fountain.currentTime = 0;
        highway_1.pause();
        highway_1.currentTime = 0;
        highway_2.pause();
        highway_2.currentTime = 0;

    }
}
