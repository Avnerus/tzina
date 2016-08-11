import $ from 'jquery-browserify'
import JQueryMouseWheel from 'jquery-mousewheel';
import { easeOutQuad, easeInQuart } from 'easing-utils';
import DebugUtil from './util/debug'

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

    calculateZoomCurve() {
        this.calculateZoomVector();
        let entryPoint = new THREE.Vector3().fromArray(this.square.ENTRY_POINTS[0].startPosition).applyMatrix4(this.square.mesh.matrixWorld);
        let endPoint = new THREE.Vector3().fromArray(this.square.ENTRY_POINTS[0].endPosition).applyMatrix4(this.square.mesh.matrixWorld);
        let movement = new THREE.Vector3();
        movement.copy(this.zoomVector).multiplyScalar(-100);
        let midPoint = new THREE.Vector3().copy(this.camera.position);
        midPoint.z = 700;
        midPoint.y = entryPoint.y + 0.5 * (this.camera.position.y - entryPoint.y);
        console.log("Creating curv. Points: ", this.camera.position, midPoint, entryPoint, endPoint);
        this.zoomCurve = new THREE.CatmullRomCurve3( [
            new THREE.Vector3().copy(this.camera.position),
            midPoint,
            entryPoint,
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

                //TweenMax.to(this.camera.position, 1, {x:zoomPosition.x, y: zoomPosition.y, z:zoomPosition.z});

            }
            //let scalar = 0;
            //let distanceToSquare = this.camera.position.distanceTo(this.square.getCenterPosition());
            //let distanceToEntry  = this.camera.position.distanceTo(this.entryPoint);

            //console.log("Distance to square ", distanceToSquare, "Distance to entry point ", distanceToEntry);

            /*
            if (distanceToSquare > this.MAX_DISTANCE && this.velocityZ < 0) {
                scalar = 0;
            } else if (distanceToSquare > this.DISTANCE_BEFORE_RISING) {
                let progress = (distanceToSquare - this.DISTANCE_BEFORE_RISING) / (this.MAX_DISTANCE + 30 - this.DISTANCE_BEFORE_RISING);
                let easedOutProgress = easeOutQuad(progress);
                if (this.velocityZ > 0) {
                    progress = 1 - progress;
                }
                scalar = this.velocityZ * -3.0 * dt * (2 - progress);
            } else {
                scalar = this.velocityZ * -3.5 * dt;
            }*/
            
            //console.log(distanceToSquare);
            /*
            if (distanceToSquare > this.DISTANCE_BEFORE_RISING ) {
                this.camera.position.y = this.config.basalHeight + 0.1 * (distanceToSquare - this.DISTANCE_BEFORE_RISING);
            } else {
                this.camera.position.y = this.config.basalHeight;
                }*/

                 
        /*
            scalar = this.velocityZ * -3.5 * dt;

            let movement = new THREE.Vector3();
            movement.copy(this.zoomVector).multiplyScalar(scalar);
            this.camera.position.add(movement);

            // SLERP into entry point
            //let p = Math.min(1,(1400 - this.camera.position.z)/180000);
            let p = (1- (distanceToEntry / this.distanceToEntry));
            console.log(p);
            THREE.Quaternion.slerp(this.originalQuaternion, this.entryQuaternion, this.camera.quaternion, p * 0.0062);

            this.camera.position.y = this.originalHeight - (this.originalHeight - this.entryPoint.y) * p;
            this.camera.updateProjectionMatrix();*/


            this.distanceOnCurve += this.velocityZ * dt * 0.001;
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
