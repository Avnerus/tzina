export default class SunGazer extends THREE.Object3D  {
    constructor(square, soundManager) {
        super();
        this.camPosition = new THREE.Vector3();
        this.camQuaternion = new THREE.Quaternion();
        this.camScale = new THREE.Vector3();
        this.square = square;
        this.soundManager = soundManager;

        this.active = false;

        this.GAZE_THRESHOLD = 0.97;
        this.BLUR_THRESHOLD = 0.93;

        this.gazingSun = null;
        this.lastBlur = 0;
        this.ended = false;

    }
    init() {

        let sunGazeSound, characterStartSound;

         this.soundManager.createStaticSoundSampler("assets/sound/ui/Hour_Replace_3.ogg",(staticSoundSampler)=>{

              // sunGazeSound = staticSoundSampler;

              // sunGazeSound.blurModule.controlVolume(0);

              // sunGazeSound.play();

        });

        this.soundManager.createStaticSoundSampler("assets/sound/ui/Button_C_3.ogg",(staticSoundSampler)=>{

              // characterStartSound = staticSoundSampler;

              // characterStartSound.blurModule.controlVolume(0);

              // characterStartSound.play();
              
        });

        events.on("control_threshold", (passed) => {      
            this.active = passed;
        });

        events.on("character_playing", () => {
            //            this.active = false;
        });
        events.on("character_idle", () => {
            if (!this.ended) {
                this.active = true;
            }
        });
        events.on("character_ended", () => {
            if (!this.ended) {
                this.active = true;
            }
        });

        events.on("experience_end", () => {
            this.active = false;
            this.ended = true;
        });
    }

    updateMatrixWorld(force) {
        if (this.active) {
            super.updateMatrixWorld(force);
            //console.log("Sun Gazer - updateMatrixWorld");

            this.matrixWorld.decompose( this.camPosition, this.camQuaternion, this.camScale );
            let camVector = new THREE.Vector3(0,0,-1).applyQuaternion(this.camQuaternion);

            if (this.gazingSun) {
                let res = this.getDotProduct(camVector, this.gazingSun.children[0]);
                if (res <= this.GAZE_THRESHOLD) {
                    this.stop();
                }
            } else if (this.blurringSun) {
                let res = this.getDotProduct(camVector, this.blurringSun.children[0]);
                if (res > this.GAZE_THRESHOLD) {
                    this.gazingSun = this.blurringSun;
                    events.emit("gaze_started", this.gazingSun.name);
                    this.setBlur(res);
                } else if (res > this.BLUR_THRESHOLD) {
                    this.setBlur(res);
                } else {
                    this.setBlur(0);
                    this.blurringSun = null;
                }
            } else {

                let thresholdPassed = false;

                // Skip the first child because it is a null parent
                for (let i = 0; i < this.square.suns.children.length && !thresholdPassed; i++) {
                    let sun = this.square.suns.children[i];
                    if (sun.name != this.square.currentSun) {
                        let res = this.getDotProduct(camVector, sun.children[0]);
                        if (res > this.BLUR_THRESHOLD) {
                            this.blurringSun = sun;
                            this.setBlur(res);
                            thresholdPassed = true;
                        }
                    }
                }
            }
        }
    }

    setBlur(res) {
        let value;
        if (res == 0) {
            value = 0;
        }
        else {
            value = Math.min(1,(res - this.BLUR_THRESHOLD) / (this.GAZE_THRESHOLD - this.BLUR_THRESHOLD));
        }
        if (value != this.lastBlur) {
            this.soundManager.panorama.setFocusWithLevel(null, value);
            this.lastBlur = value;
        }
    }

    stop() {
        if (this.gazingSun) {
            events.emit("gaze_stopped", this.gazingSun.name);
            this.gazingSun = null;
            this.blurringSun = null;
            this.setBlur(0);
        }
    }

    getDotProduct(camVector, sunMesh) {
        let camToSun = new THREE.Vector3().setFromMatrixPosition(sunMesh.matrixWorld).sub(this.camPosition).normalize();
        return camToSun.dot(camVector);
    }
}
