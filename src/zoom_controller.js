import $ from 'jquery-browserify'
import JQueryMouseWheel from 'jquery-mousewheel';

export default class ZoomController {
    constructor(config, camera, square) {
        this.camera = camera;
        this.square = square;
        this.inZoomMode = false;
        this.velocityZ = 0;
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
            if (!this.inZoomMode) {
                this.inZoomMode = true;
                this.startZ = this.camera.position.z;
                this.startY = this.camera.position.y;

                let zoomPosition = this.getZoomOutPosition();

                //TweenMax.to(this.camera.position, 1, {x:zoomPosition.x, y: zoomPosition.y, z:zoomPosition.z});


            }
            this.camera.translateZ( this.velocityZ * -3.0 * dt );
            this.camera.translateY( this.velocityZ * -0.5 * dt );
            this.camera.updateProjectionMatrix();
            if (this.velocityZ > 0) {
                this.velocityZ = Math.max(0, this.velocityZ - 10 * dt);
            } else {
                this.velocityZ = Math.min(0, this.velocityZ + 10 * dt);
                }
        }
    }
}
