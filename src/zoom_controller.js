import $ from 'jquery-browserify'
import JQueryMouseWheel from 'jquery-mousewheel';

export default class ZoomController {
    constructor(camera) {
        this.camera = camera;
        this.inZoomMode = false;
    }
    init() {
        JQueryMouseWheel($);
        console.log("Zoom controller init");

        $(document.documentElement).on('mousewheel', (event) => {
                this.velocityZ = event.deltaY * 0.5;
        });
    }
    
    update(dt) {
        if (this.velocityZ != 0) {
            if (!this.inZoomMode) {
                this.camera.rotation.set( 0, 0, 0 );
                this.inZoomMode = true;
            }
            this.camera.translateZ( this.velocityZ * -1.0 * dt );
            if (this.velocityZ > 0) {
                this.velocityZ = Math.max(0, this.velocityZ - 10 * dt);
            } else {
                this.velocityZ = Math.min(0, this.velocityZ + 10 * dt);
            }
        }
    }
}
