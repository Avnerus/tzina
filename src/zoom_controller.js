import $ from 'jquery-browserify'
import JQueryMouseWheel from 'jquery-mousewheel';
import { easeOutQuad, easeInQuart } from 'easing-utils';
import DebugUtil from './util/debug'
import _ from 'lodash'

export default class ZoomController {
    constructor(config, emitter, camera, square, scene) {
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

        this.distanceOnCurve = 0;

        this.STARTING_POSITION = new THREE.Vector3(
            0,
            50,
            1400
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
        });

        // keyboard zoom
        document.addEventListener('keydown', (event) => {
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
                    this.calculateZoomCurve();
                    break;
            }
            return false;
        }, false);

        events.emit("add_gui",{}, this.camera.position, "z"); 

        events.on("hour_updated", (hour) => {
            console.log("Zoom Controller: Hour updated to ", hour);
            let entryPoint = _.find(this.square.ENTRY_POINTS, {hour: hour});
            if (entryPoint) {
                this.calculateZoomCurve(entryPoint);
                this.lastEntryPoint = entryPoint;
            } else {
                this.calculateZoomVector();
                this.zoomCurve = null;
            }
        });
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
            // Zooming back out
            console.log("Zoom curve from camera in control position", this.camera.position);
            let movement = new THREE.Vector3();
            movement.copy(this.zoomVector).multiplyScalar(200);
            let midPoint = new THREE.Vector3().copy(this.camera.position).add(movement);
            midPoint.y = this.camera.position.y + 0.5 * (this.STARTING_POSITION.y - this.camera.position.y);

            this.zoomCurve = new THREE.CatmullRomCurve3( [
                new THREE.Vector3().copy(this.STARTING_POSITION),
                midPoint,
                new THREE.Vector3().copy(this.camera.position),
            ] );
            this.distanceOnCurve = 1;
            this.calculateEaseQuaternion();
        } else {
            this.square.mesh.updateMatrixWorld();
            this.easeQuaternionSource = null;
            this.easeQuaternionTarget = null;
            let startPoint = new THREE.Vector3().fromArray(entryPoint.startPosition).applyMatrix4(this.square.mesh.matrixWorld);
            console.log("START POINT ", startPoint);
            let endPoint = new THREE.Vector3().fromArray(entryPoint.endPosition).applyMatrix4(this.square.mesh.matrixWorld);

            if (this.camera.position.equals(this.STARTING_POSITION)) {
                console.log("Zoom curve from camera in starting position", this.STARTING_POSITION);
                let midPoint = new THREE.Vector3().copy(this.camera.position);
                midPoint.z = 700;
                midPoint.y = startPoint.y + 0.5 * (this.camera.position.y - startPoint.y);
                console.log("Creating curv. Points: ", this.camera.position, midPoint, startPoint, endPoint);
                this.zoomCurve = new THREE.CatmullRomCurve3( [
                    new THREE.Vector3().copy(this.camera.position),
                    midPoint,
                    startPoint,
                    endPoint
                ] )
            } else {
                console.log("Zoom curve includes starting position");    
                this.zoomCurve = new THREE.CatmullRomCurve3( [
                    new THREE.Vector3().copy(this.STARTING_POSITION),
                    new THREE.Vector3().copy(this.camera.position),
                    startPoint,
                    endPoint
                ] )
                // http://stackoverflow.com/questions/16650360/distance-of-a-specific-point-along-a-splinecurve3-tubegeometry-in-three-js
                this.distanceOnCurve = 1 / 3;
            }
        }
        console.log(this.zoomCurve);
        this.scene.add(DebugUtil.drawCurve(this.zoomCurve, 0x0000ff));
    }

    update(dt) {
        if (this.velocityZ != 0 && this.zoomCurve) {
            /*
            if (!this.camera.quaternion.equals(this.lastCameraOrientation)) {
                this.lastCameraOrientation.copy(this.camera.quaternion);
                this.calculateZoomVector();
                }*/

            if (this.velocityZ < 0 && this.passedControlThreshold) {
                this.calculateZoomCurve();
            }
            this.distanceOnCurve = Math.max(0,Math.min(1, this.distanceOnCurve + this.velocityZ * dt * 0.001));
            //console.log(this.distanceOnCurve);
            this.camera.position.copy(this.zoomCurve.getPoint(this.distanceOnCurve));
            if (this.easeQuaternionTarget && this.distanceOnCurve >= 0.95) {
                let easePercent = (1 - this.distanceOnCurve) / 0.05;
                console.log("EASE Quaternion ", easePercent);
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
                console.log("Reset camera rotation");
                this.basePosition = true;
                this.velocityZ = 0;
                this.calculateZoomCurve(this.lastEntryPoint);
                //this.camera.rotation.set(0,0,0);
            } else if (this.basePosition && this.distanceOnCurve > 0) {
                this.basePosition = false;
            }

            if (this.velocityZ > 0) {
                this.velocityZ = Math.max(0, this.velocityZ - 0.01 * dt);
            } else {
                this.velocityZ = Math.min(0, this.velocityZ + 0.01 * dt);
            }

            //console.log(this.camera.position, this.camera.rotation);
        }
    }
}
