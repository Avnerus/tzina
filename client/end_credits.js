import Video360 from './util/video360'
import DebugUtil from './util/debug'

export default class EndCredits extends THREE.Object3D {
    constructor(config) {
        super();
        console.log("End Credits constructed!")
        this.playing = false;
        this.config = config;
    
    }
    init() {
        try {
            console.log("Credits init");
            this.creditsVideo = new Video360("assets/end/credits_" + this.config.language + ".webm")
            this.creditsVideo.init();

            let titlePlaneGeo = new THREE.PlaneGeometry( 2048, 1024 );

            let material = new THREE.MeshBasicMaterial( {map: this.creditsVideo.texture, side: THREE.DoubleSide, transparent:true}  );
            //let material = new THREE.MeshBasicMaterial( { color: 0x0000ff , wireframe: false} );
            this.creditsPlane = new THREE.Mesh(titlePlaneGeo, material);
            this.add(this.creditsPlane);

            //this.creditsPlane.position.set(-0.02,-0.08,-50);
            //this.creditsPlane.scale.set(0.06, 0.06, 0.06);


            //this.camera.add(this.creditsPlane);
        }
        catch (e) {
            console.error("Exception",e);
        }

    }
    
    update(dt) {
        if (this.creditsVideo) {
            this.creditsVideo.update(dt);
        }
    }
    play() {
        //events.emit("end_credits");
        this.playing = true;
        this.creditsVideo.play();
    }
}
