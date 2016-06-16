import Video360 from './util/video360'

const CLOUDS_SEQUENCE_PATH = "assets/clouds/sequence.webm";

export default class Clouds {
    constructor() {
        console.log("Clouds constructed!")
    }
    init(targetShader) {
        this.cloudsVideo = new Video360(CLOUDS_SEQUENCE_PATH);
        this.cloudsVideo.init();
        this.targetShader = targetShader;
    }
    
    update(dt) {
        if (this.cloudsVideo.isReady()) {
            this.targetShader.uniforms.cloudsMap.value = this.cloudsVideo.texture;
            this.cloudsVideo.update();
        }
    }
}
