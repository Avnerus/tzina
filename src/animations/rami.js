import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import EndArrayPlugin from '../util/EndArrayPlugin'
TweenPlugin.activate([EndArrayPlugin]);
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
            { time: 1, anim: ()=>{this.doFirstAni()} },
            { time: 5, anim: ()=>{this.peacockAround(5)} },
            { time: 10, anim: ()=>{this.peacockOpen(5)} },
            { time: 15, anim: ()=>{this.peacockBack(5)} }
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

        let peacockTex = tex_loader.load( this.BASE_PATH + "/images/peacockS.jpg" );
        let feathersTex = tex_loader.load( this.BASE_PATH + "/images/pea.jpg" );
        feathersTex.wrapS = THREE.RepeatWrapping;
        feathersTex.wrapT = THREE.RepeatWrapping;
        feathersTex.repeat.set( 5, 5 );

        let grassTex = tex_loader.load( this.BASE_PATH + "/images/grasslight-thin.jpg" );
        this.peacockMaterial = new THREE.MeshPhongMaterial({ map: peacockTex,
                                                            blending: THREE.AdditiveBlending,
                                                            specular: 0x04340d,
                                                            shininess: 77,
                                                            specularMap: grassTex,
                                                            side: THREE.DoubleSide,                                                            
                                                            morphTargets: true,
                                                            morphNormals: true });

        let peacockFiles = [
            this.BASE_PATH + "/models/pea_0.json", this.BASE_PATH + "/models/pea_1.json",
            this.BASE_PATH + "/models/pea_2.json", this.BASE_PATH + "/models/pea_3.json"
        ];
        this.peacockGeos = {};

        this.ramiLoadingManager = new THREE.LoadingManager();
        this.ramiLoadingManager.onLoad = ()=>{
            // create peacock
            let peacockGeo = this.peacockGeos[0];

            for(let i=1; i<4; i++){
                peacockGeo.morphTargets.push({name: 'p1', vertices: this.peacockGeos[i].vertices});
            }
            peacockGeo.computeMorphNormals();
            this.peacock = new THREE.Mesh( peacockGeo, this.peacockMaterial );
            this.peacock.position.set(3,-1,-1);
            this.peacock.scale.multiplyScalar(2);
            this.add(this.peacock);
            DebugUtil.positionObject(this.peacock, "peacock");
        };
        this.loadPeacocks( peacockFiles );

        // DebugUtil.positionObject(this, "Rami Ani");
        //
        this.loadingManager.itemEnd("RamiAnim");
    }

    loadPeacocks( files ) {
        let pLoader = new THREE.JSONLoader(this.ramiLoadingManager);
        for(let i=0; i<files.length; i++){
            pLoader.load(files[i], (geometry)=>{
                this.peacockGeos[i] = geometry;
            });
        }
    }

    doFirstAni(){
        console.log("do first animation.");
    }

    peacockAround (_duration) {
        let tmpEndArray = [1,0,0];
        TweenMax.to( this.peacock.morphTargetInfluences, _duration, { endArray: tmpEndArray, ease: Power3.easeInOut } );
    }

    peacockOpen (_duration) {
        let tmpEndArray = [0,1,0];
        TweenMax.to( this.peacock.morphTargetInfluences, _duration, { endArray: tmpEndArray, ease: Power3.easeInOut } );
    }

    peacockBack (_duration) {
        let tmpEndArray = [0,0,1];
        TweenMax.to( this.peacock.morphTargetInfluences, _duration, { endArray: tmpEndArray, ease: Power3.easeInOut } );

        tmpEndArray = [0,0.5,0.8];
        TweenMax.to( this.peacock.morphTargetInfluences, _duration, {
            endArray: tmpEndArray,
            ease: Power3.easeInOut,
            delay: _duration,
            repeat: -1,
            yoyo: true
        } );
    }

    characterDisappear() {
        TweenMax.to( this.parent.fullVideo.mesh.scale, 1, {
            x:0.00001,y:0.00001,z:0.00001, ease: Back.easeInOut, onComplete: ()=>{
            this.parent.fullVideo.setOpacity(0.0);
        } } );
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
