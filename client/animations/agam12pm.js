import DebugUtil from '../util/debug'

export default class Agam12PMAnimation extends THREE.Object3D {
    constructor( square ) {
        super();
        this.BASE_PATH = 'assets/animations/agam12pm';

        this.square = square;
        this.didInit = false;
    }

    init(loadingManager) {
        if (!this.didInit) {
            this.loadingManager = loadingManager;
            this.setupAnim();
            this.didInit = true;
        }
    }

    setupAnim() {

        // setup animation sequence
        console.log("AGAM12PM setupanim");
        this.animStart = false;
        this.sequenceConfig = [
            { time: 15,  anim: ()=>{this.firstAni()} }
            // { time: 30,  anim: ()=>{this.characterDisappear()} }
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();

        this.loadingManager.itemStart("Agam12PMAnim");

        //        
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        let agamTex = tex_loader.load( this.BASE_PATH + "/images/agamFigure.jpg" );
        let agamMat = new THREE.MeshLambertMaterial({map: agamTex});
        loader.load( this.BASE_PATH + "/models/agamFigure.json", (geometry, material) => {
            this.agamArt = new THREE.Mesh( geometry, agamMat );
            this.agamArt.position.set(-.44, .32, -4.78);
            this.agamArt.scale.multiplyScalar(1.31);
            this.add(this.agamArt);
            // DebugUtil.positionObject(this.agamArt, "agamArt");
        });

        let agamSmallTex_1 = tex_loader.load( this.BASE_PATH + "/images/agamSmall_1.jpg" );
        let agamSmallTex_2 = tex_loader.load( this.BASE_PATH + "/images/agamSmall_2.jpg" );
        let agamSMat1 = new THREE.MeshLambertMaterial({map: agamSmallTex_1});
        let agamSMat2 = new THREE.MeshLambertMaterial({map: agamSmallTex_2});
        loader.load( this.BASE_PATH + "/models/agamSmall.json", (geometry, material) => {
            this.agamSmall_1 = new THREE.Mesh( geometry, agamSMat1 );
            this.agamSmall_1.position.set(2.88, .26, -2.21);
            this.agamSmall_1.scale.multiplyScalar(0.56);
            this.add(this.agamSmall_1);
            // DebugUtil.positionObject(this.agamSmall_1, "agamSmall_1");

            this.agamSmall_2 = new THREE.Mesh( geometry, agamSMat2 );
            this.agamSmall_2.position.set(-2, .18, -1.85);
            this.agamSmall_2.scale.multiplyScalar(0.5);
            this.add(this.agamSmall_2);
            // DebugUtil.positionObject(this.agamSmall_2, "agamSmall_2");
        });

        /*
        let testCube = new THREE.Mesh( new THREE.BoxGeometry(4,1,1), new THREE.MeshLambertMaterial({color: 0xff0000}) );
        this.add(testCube);
        DebugUtil.positionObject(testCube, "testCube");*/

        this.dummy = {opacity: 1};

        DebugUtil.positionObject(this, "Agam Ani");
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

        this.square.fountain.updateVideoTime(time);
    }

    update(dt,et) {
        // 
    }
}
