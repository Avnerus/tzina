import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import EndArrayPlugin from '../util/EndArrayPlugin'
import DebugUtil from '../util/debug'
TweenPlugin.activate([EndArrayPlugin]);

export default class ItzikAnimation extends THREE.Object3D {
    constructor( scene, renderer ) {
        super();
        this.BASE_PATH = 'assets/animations/itzik';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = [
            { time: 5,  anim: ()=>{this.benchOutFirst()} },  // benchOut( sequence )
            { time: 10, anim: ()=>{this.benchOut(1)} },
            { time: 15, anim: ()=>{this.benchOut(2)} },
            { time: 20, anim: ()=>{this.benchOut(3)} },
            { time: 25, anim: ()=>{this.benchOut(4)} },
            { time: 30, anim: ()=>{this.benchOut(5)} },
            { time: 35, anim: ()=>{this.benchOut(6)} },
            { time: 40, anim: ()=>{this.benchOut(7)} },
            { time: 45, anim: ()=>{this.benchOut(8)} },
            { time: 50, anim: ()=>{this.benchOut(9)} }
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();


        //
        this.loadingManager.itemStart("ItzikAnim");
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        this.benchGroup = new THREE.Object3D();
        this.benchCount = 10;
        this.b_offset = 5;
        loader.load(this.BASE_PATH + "/models/bench.json", (geometry, material) => {
            for(let i=0; i<this.benchCount; i++){
                let benchMat;
                if(i==0)
                    benchMat = new THREE.MeshLambertMaterial({color: 0xff0000});
                else
                    benchMat = new THREE.MeshLambertMaterial({color: 0xffffff});

                let tmp_bench = new THREE.Mesh( geometry.clone(), benchMat );

                tmp_bench.position.set( Math.sin(Math.PI*2/10*this.b_offset)*18, 0, Math.cos(Math.PI*2/10*this.b_offset)*18 );
                tmp_bench.rotation.y = Math.PI*2/10*this.b_offset + Math.PI;
                
                tmp_bench.scale.multiplyScalar(0.001);
                this.benchGroup.add( tmp_bench );
            }
            this.benchGroup.position.set( 0, -4, 10 );
            // this.benchGroup.rotation.y = 182 * Math.PI/180;
            this.add( this.benchGroup );

            // let tmp_bench = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({color: 0xffffff}) );
            // this.add( tmp_bench );
            // this.benches.push( tmp_bench );
        });

        //
        this.loadingManager.itemEnd("ItzikAnim");
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    benchOutFirst() {
        TweenMax.to( this.benchGroup.children[0].scale, 1, { x: 1, y: 1, z: 1, ease: Back.easeInOut } );
    }

    // benchOutSecond() {
    //     TweenMax.to( _this.benchGroup.children[0].position, 1, { x: Math.sin( Math.PI*2/_this.benchCount*(_seq-_index+1) )*15, z: Math.cos( Math.PI*2/_this.benchCount*(_seq-_index+1) )*15, ease: Power1.easeInOut } );
    //     TweenMax.to( _this.benchGroup.children[0].rotation, 1, { y: Math.PI*2/_this.benchCount*(_seq-_index+1) + Math.PI, ease: Power1.easeInOut } );
    // }

    benchOut( _seq ) {
        for(let i=0; i<=_seq; i++){
            TweenMax.to( this.benchGroup.children[i].scale, 1, { x: 1, y: 1, z: 1, ease: Back.easeInOut,
                                                                                   onComplete: this.benchMove,
                                                                                   onCompleteParams: [ this, _seq, i] } );
        }
    }

    benchMove( _this, _seq, _index ) {
        TweenMax.to( _this.benchGroup.children[_index].position, 1, { x: Math.sin( Math.PI*2/_this.benchCount*(_seq-_index+1+_this.b_offset) )*18, z: Math.cos( Math.PI*2/_this.benchCount*(_seq-_index+1+_this.b_offset) )*18, ease: Power1.easeInOut } );
        TweenMax.to( _this.benchGroup.children[_index].rotation, 1, { y: Math.PI*2/_this.benchCount*(_seq-_index+1+_this.b_offset) + Math.PI, ease: Power1.easeInOut } );
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
