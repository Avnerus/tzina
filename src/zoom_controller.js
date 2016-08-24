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

        //this.MAX_DISTANCE = 830;
        this.MAX_DISTANCE = 9500;
        this.DISTANCE_BEFORE_RISING = 100;

    }
    init() {
        JQueryMouseWheel($);
        console.log("Zoom controller init");

        $(document.documentElement).on('mousewheel', (event) => {
                this.velocityZ = event.deltaY * 0.5;
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
            this.calculateZoomCurve(entryPoint);
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

    calculateZoomCurve(entryPoint) {
        this.square.mesh.updateMatrixWorld();
        this.calculateZoomVector();
        let startPoint = new THREE.Vector3().fromArray(entryPoint.startPosition).applyMatrix4(this.square.mesh.matrixWorld);
        console.log("START POINT ", startPoint);

        let endPoint = new THREE.Vector3().fromArray(entryPoint.endPosition).applyMatrix4(this.square.mesh.matrixWorld);
        let movement = new THREE.Vector3();
        movement.copy(this.zoomVector).multiplyScalar(-100);
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
        console.log(this.zoomCurve);
        this.scene.add(DebugUtil.drawCurve(this.zoomCurve, 0x0000ff));

        events.emit("add_gui",{
            onChange: () => {
                this.camera.position.copy(this.zoomCurve.getPoint(this.distanceOnCurve));
                if (this.distanceOnCurve <= 0.9) {
                    this.camera.lookAt(this.zoomCurve.getPoint(this.distanceOnCurve + 0.1));
                }
            }
        }, this, "distanceOnCurve", 0, 1); 
    }

    update(dt) {
        if (this.velocityZ != 0) {
            if (!this.camera.quaternion.equals(this.lastCameraOrientation)) {
                this.lastCameraOrientation.copy(this.camera.quaternion);
                this.calculateZoomVector();
            }
            this.distanceOnCurve = Math.min(1, this.distanceOnCurve + this.velocityZ * dt * 0.001);
            console.log(this.distanceOnCurve);
            this.camera.position.copy(this.zoomCurve.getPoint(this.distanceOnCurve));
            this.camera.lookAt(this.zoomCurve.getPoint(this.distanceOnCurve + 0.01));
        

            if (this.velocityZ > 0) {
                this.velocityZ = Math.max(0, this.velocityZ - 10 * dt);
            } else {
                this.velocityZ = Math.min(0, this.velocityZ + 10 * dt);
            }

            //console.log(this.camera.position, this.camera.rotation);
        }
    }
}
