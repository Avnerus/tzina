import $ from 'jquery-browserify'
import JQueryMouseWheel from 'jquery-mousewheel';
import { easeOutQuad } from 'easing-utils';

export default class ZoomController {
    constructor(config, emitter, camera, square) {
        this.camera = camera;
        this.square = square;
        this.recalculateZoom = true;
        this.velocityZ = 0;
        this.emitter = emitter;
        this.zoomVector = new THREE.Vector3();
        this.lastCameraOrientation = new THREE.Quaternion();
        this.config = config;

        this.MAX_DISTANCE = 830;
        //this.MAX_DISTANCE = 1500;
        this.DISTANCE_BEFORE_RISING = 100;

    }
    init() {
        JQueryMouseWheel($);
        console.log("Zoom controller init");

        $(document.documentElement).on('mousewheel', (event) => {
                this.velocityZ = event.deltaY * 0.5;
        });
    }

    getZoomOutPosition() {
        let vec = new THREE.Vector3();
        vec.copy(new THREE.Vector3(0,0,1)).applyQuaternion(this.camera.quaternion).multiplyScalar(500);
        vec.add(this.camera.position);
        vec.y += 100;
        return vec;
    }
    
    update(dt) {
        if (this.velocityZ != 0) {
            if (!this.camera.quaternion.equals(this.lastCameraOrientation)) {
                let quat = new THREE.Quaternion().copy(this.camera.quaternion);

                this.zoomVector.copy(new THREE.Vector3(0, 0, 1) ).applyQuaternion(quat);
                this.zoomVector.y = 0;

                this.lastCameraOrientation.copy(this.camera.quaternion);


                //TweenMax.to(this.camera.position, 1, {x:zoomPosition.x, y: zoomPosition.y, z:zoomPosition.z});

            }
            let scalar = 0;
            let distanceToSquare = this.camera.position.distanceTo(this.square.getCenterPosition());
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
            }
            
            //console.log(distanceToSquare);
            /*
            if (distanceToSquare > this.DISTANCE_BEFORE_RISING ) {
                this.camera.position.y = this.config.basalHeight + 0.1 * (distanceToSquare - this.DISTANCE_BEFORE_RISING);
            } else {
                this.camera.position.y = this.config.basalHeight;
                }*/

                 
            let movement = new THREE.Vector3();
            movement.copy(this.zoomVector).multiplyScalar(scalar);
            this.camera.position.add(movement);
            this.camera.updateProjectionMatrix();


            if (this.velocityZ > 0) {
                this.velocityZ = Math.max(0, this.velocityZ - 10 * dt);
            } else {
                this.velocityZ = Math.min(0, this.velocityZ + 10 * dt);
            }

            //console.log(this.camera.position, this.camera.rotation);
        }
    }
}
