import Video360 from './util/video360'

const CLOUDS_SEQUENCE_PATH = "assets/clouds/Sky_Afternoon.webm";
const CLOUDS_STATIC_PATH = "assets/clouds/static.png";

const States = {
    STATIC: "static",
    TRANSITON: "transition"
}

export default class Clouds {
    constructor(loadingManager) {
        console.log("Clouds constructed!")

        this.loadingManager = loadingManager;

        this.currentState = States.STATIC;
    
    }
    init(targetShader) {
        console.log("Clounds init");
        this.cloudsVideo = new Video360(CLOUDS_SEQUENCE_PATH, targetShader.uniforms.cloudsMap);
        this.cloudsVideo.init();

        this.staticTexture = new THREE.TextureLoader(this.loadingManager).load(CLOUDS_STATIC_PATH);
        targetShader.uniforms.cloudsMap.value = this.staticTexture;

        this.targetShader = targetShader;
    }
    
    update(dt) {
        if (this.currentState === States.TRANSITON) {
            this.cloudsVideo.update(dt);
        } 
    }

    startTransition() {
        this.currentState = States.TRANSITON;
        this.cloudsVideo.play();
    }

    stopTransition() {
        this.currentState = States.STATIC
        this.cloudsVideo.pause();
        this.cloudsVideo.video.currentTime = 0;
        this.targetShader.uniforms.cloudsMap.value = this.staticTexture;
    }
}
