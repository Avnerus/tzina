import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import DebugUtil from '../util/debug'

export default class RamiAnimation extends THREE.Object3D {
    constructor( scene, renderer ) {
        super();
        this.BASE_PATH = 'assets/animations/rami';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {

        this.animStart = false;
        this.sequenceConfig = [
            { time: 1,  anim: ()=>{this.doFirstAni()} }
        ];
        this.nextAnim = null;

        this.loadingManager.itemStart("RamiAnim");

        //        
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        let peacockTex = tex_loader.load( this.BASE_PATH + "/images/seamless.jpg" );
        let grassTex = tex_loader.load( this.BASE_PATH + "/images/seamless.jpg" );
        this.peacockMaterial = new THREE.MeshPhongMaterial({ map: this.peacockTex,
                                                            specular: 0x04340d,
                                                            shininess: 77,
                                                            specularMap: grassTex,
                                                            side: THREE.DoubleSide,
                                                            morphTargets: true,
                                                            morphNormals: true });

        // DebugUtil.positionObject(this, "Rami Ani");
        //
        this.loadingManager.itemEnd("RamiAnim");
    }

    characterDisappear() {
        TweenMax.to( this.parent.fullVideo.mesh.scale, 1, {
            x:0.00001,y:0.00001,z:0.00001, ease: Back.easeInOut, onComplete: ()=>{
            this.parent.fullVideo.setOpacity(0.0);
        } } );
    }

    doFirstAni(){
        console.log("do first animation.");
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }
    
    start() {
        this.currentSequence = this.sequenceConfig.slice(0);
        this.nextAnim = this.currentSequence.shift();
    }

    updateVideoTime(time) {
        if (this.nextAnim && time >= this.nextAnim.time) {
            console.log("do anim sequence ", this.nextAnim);
            this.nextAnim.anim();
            if (this.currentSequence.length > 0) {
                this.nextAnim = this.currentSequence.shift();
            } else {
                this.nextAnim = null;
            }
        }
    }

    update(dt,et) {
        // 
    }
}
