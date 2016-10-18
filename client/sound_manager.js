const SOUND_PATH = "assets/sound/"

let fountain, highway_1, highway_2, innerKikar;

export default class SoundManager {
    constructor(camera, scene) {

        this.camera = camera;
        this.scene = scene;

    }

    init(loadingManager) {

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
        fountain = new THREE.PositionalAudio(this.listener);
        fountain.position.set(0, 20, 0);
        fountain.setRefDistance( 1 );
        fountain.autoplay = false;
        fountain.loop = true;

        //Street Sound 1
        highway_1 = new THREE.PositionalAudio(this.listener);
        highway_1.position.set(-25, 15, 0);
        highway_1.autoplay = false;
        highway_1.loop = true;

        //Street Sound 2
        highway_2 = new THREE.PositionalAudio(this.listener);
        highway_2.position.set(25, 15, 0);
        highway_2.autoplay = false;
        highway_2.loop = true;

        //Inner Kikar Sound
        innerKikar = new THREE.PositionalAudio(this.listener);
        innerKikar.position.set(0, 20, 0);
        innerKikar.autoplay = false;
        innerKikar.loop = true;

        //DEBUG CUBES

        this.testCubeone = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
        this.testCubeone.position.set(-25, 15, 0);
        this.scene.add(this.testCubeone);

        this.testCubetwo = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
        this.testCubetwo.position.set(0, 20, 0);
        this.scene.add(this.testCubetwo);

        this.testCubethree = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
        this.testCubethree.position.set(25, 15, 0);
        this.scene.add(this.testCubethree);

        //SOUND ADDING
        this.scene.add(fountain);
        this.scene.add(highway_1);
        this.scene.add(highway_2);
        this.scene.add(innerKikar);

        //BUFFER THE SOUNDS INTO THE PROPER ELEMENTS
        this.loader = new THREE.AudioLoader(loadingManager);

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

    }

    play() {
        fountain.play();

        highway_1.play();

        highway_2.play();

        innerKikar.play();

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

    }
}
