export default class SunGazer extends THREE.Object3D  {
    constructor(square) {
        super();
        this.camPosition = new THREE.Vector3();
        this.camQuaternion = new THREE.Quaternion();
        this.camScale = new THREE.Vector3();
        this.square = square;

        this.active = false;

        this.GAZE_THRESHOLD = 0.98;
        this.gazingSun = null;
    }
    init() {
        events.on("control_threshold", (passed) => {
            this.active = passed;
        });

        events.on("character_playing", () => {
            this.active = false;
        })
        events.on("character_idle", () => {
            this.active = true;
        })
        events.on("character_ended", () => {
            this.active = true;
        })
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
            } else {

                let thresholdPassed = false;

                // Skip the first child because it is a null parent
                for (let i = 1; i < this.square.suns.children.length && !thresholdPassed; i++) {
                    let sun = this.square.suns.children[i];
                    if (sun.name != this.square.currentSun) {
                        let res = this.getDotProduct(camVector, sun.children[0]);
                        if (res > this.GAZE_THRESHOLD) {
                            this.gazingSun = sun;
                            events.emit("gaze_started", this.gazingSun.name);
                        }
                    }
                }
            }
        }
    }

    stop() {
        if (this.gazingSun) {
            events.emit("gaze_stopped", this.gazingSun.name);
            this.gazingSun = null;
        }
    }

    getDotProduct(camVector, sunMesh) {
        let camToSun = new THREE.Vector3().setFromMatrixPosition(sunMesh.matrixWorld).sub(this.camPosition).normalize();
        return camToSun.dot(camVector);
    }
}
