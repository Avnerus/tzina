import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import EndArrayPlugin from '../util/EndArrayPlugin'
import DebugUtil from '../util/debug'
TweenPlugin.activate([EndArrayPlugin]);

export default class MeirAnimation extends THREE.Object3D {
    constructor( scene, renderer ) {
        super();
        this.BASE_PATH = 'assets/animations/meir';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = [
            { time: 5,  anim: ()=>{this.doFirstAni()} }
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();

        this.loadingManager.itemStart("MeirAnim");

        //        
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        this.loadModelBird( this.BASE_PATH + "/models/bird/bird_body.json",
                       this.BASE_PATH + "/models/bird/bird_wingR.json",
                       this.BASE_PATH + "/models/bird/bird_wingL.json", loader );
        //
        this.loadingManager.itemEnd("MeirAnim");
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    doFirstAni(){
        console.log("do first animation.");
    }

    loadModelBird( _body, _wingR, _wingL, loader ){
        let birdMat = new THREE.MeshLambertMaterial({color: 0x00ffff});

        loader.load( _body, (geometry, material) => {
            this.bird = new THREE.Mesh(geometry, birdMat);
            
            loader.load( _wingR, (geometry, material) => {
                let wingR = new THREE.Mesh(geometry, birdMat);
                wingR.position.x = -0.6;
                this.bird.add(wingR);

                loader.load( _wingL, (geometry, material) => {
                    let wingL = new THREE.Mesh(geometry, birdMat);
                    wingL.position.x = 0.6;
                    this.bird.add(wingL);

                    this.add(this.bird);
                });
            });
        });
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
