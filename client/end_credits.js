import Video360 from './util/video360'

export default class EndCredits {
    constructor(loadingManager) {
        console.log("End Credits constructed!")
    
    }
    init() {
        console.log("Clounds init");
        let titlePlaneGeo = new THREE.PlaneGeometry( 2048, 1024 );
        let loader = new THREE.TextureLoader(loadingManager);
        loader.load('assets/intro/title.png', (texture) => {
            this.titleTexture = texture;
            let material = new THREE.MeshBasicMaterial( {map: this.titleTexture, side: THREE.DoubleSide, transparent:true}  );
            this.titlePlane = new THREE.Mesh(titlePlaneGeo, material);
            this.titlePlane.position.copy(this.square.getCenterPosition());
            this.titlePlane.position.y = 400;
        });*/

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
