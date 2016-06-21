import Video360 from './util/video360'

const CLOUDS_SEQUENCE_PATH = "assets/clouds/sequence.webm";
const CLOUDS_STATIC_PATH = "assets/clouds/static.png";

const States = {
    STATIC: "static",
    TRANSITON: "transition"
}

export default class Clouds {
    constructor() {
        console.log("Clouds constructed!")

        this.currentState = States.STATIC;
    
    }
    init(targetShader) {
        this.cloudsVideo = new Video360(CLOUDS_SEQUENCE_PATH);
        this.cloudsVideo.init();

        this.staticTexture = new THREE.TextureLoader().load(CLOUDS_STATIC_PATH);

        this.targetShader = targetShader;
    }
    
    update(dt) {
        if (this.currentState === States.TRANSITON) {
            if (this.cloudsVideo.isReady()) {
                this.targetShader.uniforms.cloudsMap.value = this.cloudsVideo.texture;
                this.cloudsVideo.update();
            }
        } else {
            this.targetShader.uniforms.cloudsMap.value = this.staticTexture;
        }
    }
}
