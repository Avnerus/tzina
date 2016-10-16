import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import EndArrayPlugin from '../util/EndArrayPlugin'
import DebugUtil from '../util/debug'
TweenPlugin.activate([EndArrayPlugin]);

export default class Agam12PMAnimation extends THREE.Object3D {
    constructor( scene, renderer ) {
        super();
        this.BASE_PATH = 'assets/animations/agam12pm';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = [
            { time: 5,  anim: ()=>{this.firstAni()} }
            // { time: 30,  anim: ()=>{this.characterDisappear()} }
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();

        this.loadingManager.itemStart("Agam12PMAnim");

        //        
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        let agamTex = tex_loader.load( this.BASE_PATH + "/images/agam.jpg" );
        let agamMat = new THREE.MeshLambertMaterial({map: agamTex});
        loader.load( this.BASE_PATH + "/models/agam.json", (geometry, material) => {
            this.agamArt = new THREE.Mesh( geometry, agamMat );
            this.add(this.agamArt);
            DebugUtil.positionObject(this.agamArt, "agamArt");
        });

        this.dummy = {opacity: 1};

        // DebugUtil.positionObject(this, "mark");
        //
        this.loadingManager.itemEnd("Agam12PMAnim");
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    firstAni(){
        //
    }

    characterDisappear() {
        TweenMax.to( this.dummy, 5, { opacity:0, onUpdate: ()=>{
                this.parent.fullVideo.setOpacity(this.dummy.opacity);
            }, onStart: ()=>{
                //...
            }, onComplete: ()=>{
                this.parent.fullVideo.setOpacity(0.0);
            } } );
    }

    transX(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].x += n;
        }
    }

    transZ(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].z += n;
        }
    }

    transY(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].y += n;
        }
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
