export default class SunGazer extends THREE.Object3D  {
    constructor(square, soundManager, collisionManager) {
        super();
        this.camPosition = new THREE.Vector3();
        this.camQuaternion = new THREE.Quaternion();
        this.camScale = new THREE.Vector3();
        this.square = square;
        this.soundManager = soundManager;

        this.active = false;

        this.GAZE_THRESHOLD = 0.977;
        this.BLUR_THRESHOLD = 0.965;

        this.gazingSun = null;
        this.lastBlur = 0;
        this.ended = false;
        this.currentCollider = null;
        this.collisionManager = collisionManager;
        this.raycaster = new THREE.Raycaster();
    }
    init() {

        events.on("instructions_end", (passed) => {      
            this.active = true;
            // Add the sun colliders
            setTimeout(() => {
                this.addSunColliders();
            },0)
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

    addSunColliders() {
        this.square.suns.children.forEach((sun) => {
            // Add the collision bounding box
            sun.updateMatrixWorld();
            let bbox = new THREE.BoundingBoxHelper(sun, 0xff0000);
            bbox.update();
            bbox.scale.multiplyScalar(4.5);

            bbox.onGaze = (camPosition, camVector, colliderPosition) => {
                this.onGaze(camPosition, camVector, colliderPosition, sun);
            }
            bbox.onGazeStop = () => {
                this.stop();
            }
            this.collisionManager.addGazeCollider(bbox);
        })
    }

    onGaze(camPosition, camVector, colliderPosition, sun) {
        if (this.active && !this.ended) {
           let gazeAngle = this.getDotProduct(camPosition, camVector, colliderPosition);
           if (this.gazingSun) {
                if (gazeAngle <= this.GAZE_THRESHOLD) {
                    this.stop();
                }
           }
           else if (sun.name == this.square.currentSun ) {
               if (gazeAngle > this.GAZE_THRESHOLD) {
                  this.gazingSun = sun;
                  events.emit("gaze_current_started", sun.name);
               }
           } else {
                if (this.blurringSun) {
                   this.setBlur(gazeAngle);
                   if (gazeAngle > this.GAZE_THRESHOLD) {
                       this.gazingSun = this.blurringSun;
                       events.emit("gaze_started", this.gazingSun.name);
                   }
                } else {
                    this.blurringSun = sun;
                    this.setBlur(gazeAngle);
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
            //console.log("SET BLUR", res, value);
        }
        if (value != this.lastBlur) {
            this.soundManager.panorama.setFocusWithLevel(null, value);
            this.lastBlur = value;
        }
    }

    stop() {
        if (this.blurringSun) {
            this.setBlur(0);
        }
        if (this.gazingSun) {
            if (this.gazingSun.name == this.square.currentSun) {
                events.emit("gaze_current_stopped");
            }
            else {
                events.emit("gaze_stopped", this.gazingSun.name);
            }
        }
        this.gazingSun = null;
        this.blurringSun = null;
    }

    getDotProduct(camPosition, camVector, colliderPosition) {
        let camToSun = new THREE.Vector3().copy(colliderPosition).sub(camPosition).normalize();
        return camToSun.dot(camVector);
    }
}
