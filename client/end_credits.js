import Video360 from './util/video360'
import DebugUtil from './util/debug'

export default class EndCredits {
    constructor(camera) {
        console.log("End Credits constructed!")
        this.camera = camera;
    
    }
    init() {
        try {

            console.log("Credits init");
            this.creditsVideo = new Video360("assets/end/credits.webm")
            this.creditsVideo.init();

            let titlePlaneGeo = new THREE.PlaneGeometry( 2048, 1024 );

            let material = new THREE.MeshBasicMaterial( {map: this.creditsVideo.texture, side: THREE.DoubleSide, transparent:true}  );
            this.creditsPlane = new THREE.Mesh(titlePlaneGeo, material);

            this.creditsPlane.position.set(-0.02,-0.08,-20);
            this.creditsPlane.scale.set(0.01, 0.01, 0.01);

            DebugUtil.positionObject(this.creditsPlane, "End credits");

            this.camera.add(this.creditsPlane);
        }
        catch (e) {
            console.error("Exception",e);
        }

    }
    
    update(dt) {
        this.creditsVideo.update(dt);
    }
    play() {
        this.creditsVideo.play();
    }
}
