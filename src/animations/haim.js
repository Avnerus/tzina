import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import EndArrayPlugin from '../util/EndArrayPlugin'
TweenPlugin.activate([EndArrayPlugin]);

export default class HaimAnimation extends THREE.Object3D {
    constructor() {
        super();
        this.BASE_PATH = 'assets/animations/haim';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {
        this.loadingManager.itemStart("MiriamAnim");
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        // setup animation sequence
        // this.animStart = false;
        // this.sequenceConfig = [
        //     { time: 10, anim: ()=>{this.manAppear(10)} },           //10
        //     { time: 20, anim: ()=>{this.manHold(8)} },              //40
        //     { time: 30, anim: ()=>{this.manLean(6)} },              //65
        //     { time: 40, anim: ()=>{this.manCircle(6)} },           //105
        //     { time: 45, anim: ()=>{this.manSwirl(6)} },            //110
        //     { time: 50, anim: ()=>{this.manSwirl2(6)} },           //115
        //     { time: 55, anim: ()=>{this.manSwirl3(6)} },           //120
        //     { time: 60, anim: ()=>{this.manSwirlNonstop()} },      //125
        //     { time: 80, anim: ()=>{this.manSwirlSpeedup(20)} }     //220
        // ];
        // this.completeSequenceSetup();

        //
        this.loadingManager.itemEnd("HaimAnim");
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    loadModelClock (model, modelB, modelC, modelD, meshMat) {

        let loader = new THREE.JSONLoader(this.loadingManager);
        let cloMat = meshMat;
        let myClock = new THREE.Object3D();
        this.myCP1 = new THREE.Object3D();
        this.myCP2 = new THREE.Object3D();
        this.grandFatherClock = new THREE.Object3D();
        this.pointer1Time = 0;
        this.pointer2Time = 0;

        loader.load(model, (geometry, material)=>{
            geometry.center();
            let cFace = new THREE.Mesh(geometry, cloMat);
            cFace.scale.set(1, 1, 1.7);
            cFace.position.set(0, 0, 3.1);
            myClock.add(cFace);
        });

        loader.load(modelB, (geometryB, material)=>{
            geometryB.center();
            this.transY(geometryB, 27);
            this.cGear = new THREE.Mesh(geometryB, cloMat);
            let myGear = new THREE.Object3D();
            myGear.add(this.cGear);
            myGear.rotation.z = -Math.PI/5;
            myClock.add(myGear);
        });

        loader.load(modelC, (geometryC, material)=>{
            geometryC.center();
            let cP1 = new THREE.Mesh(geometryC, cloMat);
            cP1.position.set(-2.2, 0, 6);
            cP1.scale.set(1, 1, 2.5);
            this.myCP1.add(cP1);
            myClock.add(this.myCP1);
            //
            // TweenMax.to(this.myCP1.rotation, 0.5, {z:"+="+0.1, repeat:-1, repeatDelay:2});
        });

        loader.load(modelD, (geometryD, material)=>{
            geometryD.center();
            let cP2 = new THREE.Mesh(geometryD, cloMat);
            cP2.position.set(0,12,3);
            cP2.scale.set(1, 1, 2.5);
            this.myCP2.add(cP2);
            myClock.add(this.myCP2);
            //
            // TweenMax.to(this.myCP2.rotation, 0.5, {z:"+="-0.1, repeat:-1, repeatDelay:2.6});

            myClock.position.y = -80;
            this.grandFatherClock.add(myClock);

            for(let i=0; i<6; i++){
                let geoTemp = new THREE.CylinderGeometry(0.5 ,0.5 ,90);
                let bar = new THREE.Mesh(geoTemp, cloMat);
                bar.position.y = -15;
                bar.position.x = i*3 - 8;
                this.grandFatherClock.add(bar);
            }

            this.grandFatherClock.scale.multiplyScalar(0.01);
            this.grandFatherClock.position.set(1, 3, -1.2);
            // this.grandFatherClock.rotation.y = Math.PI;

            this.add(this.grandFatherClock);

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

    update(dt,et) {

        // ANIMATION_SEQUENCE
        if(!this.animStart){
            this.animStartTime = et;
            this.animStart = true;
        }

        if(this.animStart){
            let animTime = et-this.animStartTime;

            // for(let i=0; i<this.sequenceConfig.length; i++){
            //     // move on to 'next' sequence
            //     if(animTime >= this.sequenceConfig[i].time && !this.sequenceConfig[i].performed){
            //         this.sequenceConfig[i].anim( this );
            //         this.sequenceConfig[i].performed = true;
            //         console.log("do anim sequence: " + i);
            //     }
            // }
        }

    }
}
