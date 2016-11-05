import $ from 'jquery-browserify'
import JQueryMouseWheel from 'jquery-mousewheel';
import { easeOutQuad, easeInQuart } from 'easing-utils';
import DebugUtil from './util/debug'
import _ from 'lodash'

export default class ZoomController {
    constructor(config, emitter, camera, square, scene, vrControls) {
        this.camera = camera;
        this.square = square;
        this.recalculateZoom = true;
        this.velocityZ = 0;
        this.emitter = emitter;
        this.zoomVector = new THREE.Vector3();
        this.lastCameraOrientation = new THREE.Quaternion();
        this.lastCameraOrientation.y = 1;
        this.config = config;
        this.scene = scene;
        this.wasUsed = false;
        this.done = false;
        this.vrControls = vrControls;

        this.distanceOnCurve = 0;

        this.friction = 0.01;

        this.STARTING_ROTATION = new THREE.Euler(
            -0.03997799566520428,
            -0.001781628129114201, 
            -0.00007126384840989064,
            "XYZ"
        )
        this.STARTING_POSITION = new THREE.Vector3(
            0,
            15,
            100
        );
        this.MID_ZOOM = new THREE.Vector3(
            0,
            10,
            50 
        );


        this.BASE_WORLD_POSITION = new THREE.Vector3(
            -3.51,
            12.67,
            -5.44
        );

        this.CHAPTER_THRESHOLD = 0.45;
        this.CONTROL_THRESHOLD = 1;

        this.passedChapterThreshold = false;
        this.passedControlThreshold = false;

        this.basePosition = true;

    }
    init() {
        JQueryMouseWheel($);
        console.log("Zoom controller init");

        $(document.documentElement).on('mousewheel', (event) => {
                this.velocityZ = event.deltaY * 10;
                if (this.velocityZ > 0) {
                    this.velocityZ = Math.max(this.velocityZ, 60);
                } else if (this.velocityZ < 0) {
                    this.velocityZ = Math.min(this.velocityZ,-100);
                }
        });

        // keyboard zoom
        document.addEventListener('keydown', (event) => {
            if (!this.passedControlThreshold) {
                switch ( event.keyCode ) {
                    case 69: // e
                        event.preventDefault();
                        this.velocityZ += 5;
                        break;
                    case 84: // t
                        event.preventDefault();
                        this.velocityZ -= 5;
                        break;
                    case 85: // u
                        event.preventDefault();
                        this.calculateZoomCurve(this.lastEntryPoint);
                        break;
                }
            }
            return false;
        }, false);

        /*
        events.emit("add_gui",{folder: "Camera", listen: true}, this.camera.position, "z"); 
        events.emit("add_gui",{folder: "Camera", listen: true}, this.camera.position, "y"); 
        */

        events.on("angle_updated", (hour) => {
            if (!this.done) {
                if (hour == 24) { hour = 0; }
                console.log("Zoom Controller: Hour angle updated to ", hour);
                let entryPoint = _.find(this.square.ENTRY_POINTS, {hour: hour});
                if (entryPoint) {
                    this.calculateZoomCurve(entryPoint);
                    this.lastEntryPoint = entryPoint;
                } else {
                    this.velocityZ = null;
                    this.zoomCurve = null;
                }
            }
        });
        this.camera.position.copy(this.STARTING_POSITION);
        this.camera.rotation.copy(this.STARTING_ROTATION);
    }

    getZoomOutPosition() {
        let vec = new THREE.Vector3();
        vec.copy(new THREE.Vector3(0,0,1)).applyQuaternion(this.camera.quaternion).multiplyScalar(500);
        vec.add(this.camera.position);
        vec.y += 100;
        return vec;
    }

    calculateZoomVector() {
        let quat = new THREE.Quaternion().copy(this.camera.quaternion);
        this.zoomVector.copy(new THREE.Vector3(0, 0, 1) ).applyQuaternion(quat);
        this.zoomVector.y = 0;
    }

    calculateEaseQuaternion() {
        // To east the camera rotation into the curve
        let cameraClone = this.camera.clone();
        this.easeQuaternionSource = new THREE.Quaternion().copy(cameraClone.quaternion);
        cameraClone.position.copy(this.zoomCurve.getPoint(0.95));
        cameraClone.lookAt(this.zoomCurve.getPoint(0.951));
        this.easeQuaternionTarget = new THREE.Quaternion().copy(cameraClone.quaternion);
        //console.log("Ease quaternion Source ", this.easeQuaternionSource, " Target: ", this.easeQuaternionTarget);
    }

    calculateZoomCurve(entryPoint) {
        this.calculateZoomVector();
        if (!entryPoint && this.passedControlThreshold) {
            this.zoomCurve = null;
            /*
            // Zooming back out
            console.log("Zoom curve from camera in control position", this.camera.position);
            let movement = new THREE.Vector3();
            movement.copy(this.zoomVector).multiplyScalar(100);
            let midPoint = new THREE.Vector3().copy(this.camera.position).add(movement);
            midPoint.y = this.camera.position.y + 0.5 * (this.STARTING_POSITION.y - this.camera.position.y);

            this.zoomCurve = new THREE.CatmullRomCurve3( [
                new THREE.Vector3().copy(this.STARTING_POSITION),
                this.MID_ZOOM,
                midPoint,
                new THREE.Vector3().copy(this.camera.position),
            ] );
            this.distanceOnCurve = 1;
            this.calculateEaseQuaternion();*/
        } else {
            if (this.square.mesh) {
                let baseVRPosition = null;

                if (this.vrControls) {
                    let currentVRPosition = this.vrControls.getCurrentPosition();
                    console.log("Current VR Position", currentVRPosition);
                    if (currentVRPosition) {
                        this.vrControls.basePosition.copy(this.BASE_WORLD_POSITION);
                        baseVRPosition = new THREE.Vector3().copy(this.BASE_WORLD_POSITION);
                        baseVRPosition.add(currentVRPosition);
                    }

                }
                this.square.mesh.updateMatrixWorld();
                this.easeQuaternionSource = null;
                this.easeQuaternionTarget = null;
                let startPoint = new THREE.Vector3().fromArray(entryPoint.startPosition).applyMatrix4(this.square.mesh.matrixWorld);
                let endPoint = new THREE.Vector3().fromArray(entryPoint.endPosition).applyMatrix4(this.square.mesh.matrixWorld);

                if (this.camera.position.equals(this.STARTING_POSITION)) {
                    let points = [
                        new THREE.Vector3().copy(this.camera.position),
                    ]
                    if (entryPoint.worldPosition) {
                        points.push(new THREE.Vector3().fromArray(entryPoint.worldPosition));
                    } else {
                        points.push(this.MID_ZOOM);
                    }
                    points.push(...[
                        startPoint,
                        endPoint
                    ])
                    if (baseVRPosition) {
                        points.push(baseVRPosition);
                    }
                    console.log("Curve points", points);
                    this.zoomCurve = new THREE.CatmullRomCurve3(points);
                } else {
                    this.zoomCurve = null;
                        /*
                    let points = [
                        new THREE.Vector3().copy(this.STARTING_POSITION),
                    ]
                    if (entryPoint.worldPosition) {
                        points.push(new THREE.Vector3().fromArray(entryPoint.worldPosition));
                        this.distanceOnCurve = 2 / 4
                    } else {
                        this.distanceOnCurve = 1 / 3;
                    }
                    // http://stackoverflow.com/questions/16650360/distance-of-a-specific-point-along-a-splinecurve3-tubegeometry-in-three-js
                    points.push(...[
                        new THREE.Vector3().copy(this.camera.position),
                        startPoint,
                        endPoint
                    ])
                    console.log("Curve points", points);
                    this.zoomCurve = new THREE.CatmullRomCurve3(points);*/
                }
            }
        }
        console.log(this.zoomCurve);
        //this.scene.add(DebugUtil.drawCurve(this.zoomCurve, 0x0000ff));
    }

    update(dt) {
        if (this.velocityZ != 0 && this.zoomCurve && !this.passedControlThreshold) {
            /*
            if (!this.camera.quaternion.equals(this.lastCameraOrientation)) {
                this.lastCameraOrientation.copy(this.camera.quaternion);
                this.calculateZoomVector();
                }*/

            if (this.passedControlThreshold) {
                if (this.velocityZ < 0) {
                    this.calculateZoomCurve();
                } else {
                    this.velocityZ = 0;
                    return;
                }
            }

            if (!this.wasUsed) {
                this.wasUsed = true;
                events.emit("zoom_used");
            }

            this.distanceOnCurve = Math.max(0,Math.min(1, this.distanceOnCurve + this.velocityZ * dt * 0.001));
            //console.log(this.distanceOnCurve);
            this.camera.position.copy(this.zoomCurve.getPoint(this.distanceOnCurve));
            if (this.easeQuaternionTarget && this.distanceOnCurve >= 0.95) {
                let easePercent = (1 - this.distanceOnCurve) / 0.05;
                THREE.Quaternion.slerp(
                    this.easeQuaternionSource, 
                    this.easeQuaternionTarget,
                    this.camera.quaternion,
                    easePercent
                );
            }
            else if (this.distanceOnCurve <= 0.99) {
                this.camera.lookAt(this.zoomCurve.getPoint(this.distanceOnCurve + 0.01));
            }

            if (!this.passedChapterThreshold && this.distanceOnCurve > this.CHAPTER_THRESHOLD) {
                this.passedChapterThreshold = true;
                events.emit("chapter_threshold", this.passedChapterThreshold);
            } else if (this.passedChapterThreshold && this.distanceOnCurve <= this.CHAPTER_THRESHOLD) {
                this.passedChapterThreshold = false;
                events.emit("chapter_threshold", this.passedChapterThreshold);
            }
        

            if (!this.passedControlThreshold && this.distanceOnCurve >= this.CONTROL_THRESHOLD) {
                this.passedControlThreshold = true;
                this.velocityZ = 0;
                events.emit("control_threshold", this.passedControlThreshold);
            } else if (this.passedControlThreshold && this.distanceOnCurve <= this.CONTROL_THRESHOLD) {
                this.passedControlThreshold = false;
                events.emit("control_threshold", this.passedControlThreshold);
            }

            if (!this.basePosition && this.distanceOnCurve == 0) {
                this.basePosition = true;
                this.velocityZ = 0;
                this.calculateZoomCurve(this.lastEntryPoint);
                events.emit("base_position");
                //this.camera.rotation.set(0,0,0);
            } else if (this.basePosition && this.distanceOnCurve > 0) {
                this.basePosition = false;
            }

            if (this.velocityZ > 0) {
                this.velocityZ = Math.max(0, this.velocityZ - this.friction * dt);
            } else {
                this.velocityZ = Math.min(0, this.velocityZ + this.friction * dt);
            }

            //console.log(this.camera.position, this.camera.rotation);
        }
    }
}
