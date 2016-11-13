import {SpriteText2D, textAlign} from '../lib/text2d/index'

export default class FPSCount {
    constructor(camera) {
        this.camera = camera;
        this.beginTime = performance.now();
        this.prevTime = this.beginTime;
        this.frames = 0;
    }

    init(loadingManager) {
        let FPS_TEXT = {
             align: textAlign.center, 
             font: '20px Miriam Libre',
             fillStyle: '#FFFFFF',
             antialias: true 
        }
        let FPS_TEXT_SCALE = 0.0005;

        this.fpsText = new SpriteText2D("FPS", FPS_TEXT);
        this.fpsText.scale.multiplyScalar(FPS_TEXT_SCALE);
        this.fpsText.position.set(-0.02,0.2,-0.5);
        this.camera.add(this.fpsText);
    }
    begin() {
        this.beginTime = performance.now();
    }
    end () {
        this.frames ++;
        let time = performance.now();

        if ( time > this.prevTime + 1000 ) {

            let fps =  Math.round(( this.frames * 1000 ) / ( time - this.prevTime ));
            this.fpsText.text = fps + "FPS";

            this.prevTime = time;
            this.frames = 0;
        }
    }
}
