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
            { time: 5, anim: ()=>{this.peacockBack(5)} },
            { time: 15, anim: ()=>{this.peacockOpen(5)} },
            { time: 25, anim: ()=>{this.peacockBun(5)} },
            { time: 35, anim: ()=>{this.peacockSwallow(5)} },
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

        let peacockTex = tex_loader.load( this.BASE_PATH + "/images/peacockB.jpg" );
        this.peacockTexAni = new TextureAnimator( peacockTex, 3, 1, 15, 60, [0,1,2,0,0,0,0,0,0,0,0,0,0,0,0] );

        let feathersTex = tex_loader.load( this.BASE_PATH + "/images/pea.jpg" );
        feathersTex.wrapS = THREE.RepeatWrapping;
        feathersTex.wrapT = THREE.RepeatWrapping;
        feathersTex.repeat.set( 5, 5 );

        let grassTex = tex_loader.load( this.BASE_PATH + "/images/redlight-thin.jpg" );
        this.peacockMaterial = new THREE.MeshPhongMaterial({ map: peacockTex,
                                                            blending: THREE.AdditiveBlending,
                                                            specular: 0x630824,
                                                            shininess: 77,
                                                            specularMap: grassTex,
                                                            side: THREE.DoubleSide,                                                            
                                                            morphTargets: true,
                                                            morphNormals: true });

        let peacockFiles = [];
        for(let i=0; i<5; i++){
            let file = this.BASE_PATH + "/models/peafowl/p_" + i + ".json";
            peacockFiles.push(file);
        }
        this.peacockGeos = {};

        this.tweenTransition = null;

        this.ramiLoadingManager = new THREE.LoadingManager();
        this.ramiLoadingManager.onLoad = ()=>{
            // create peacock
            let peacockGeo = this.peacockGeos[0];

            for(let i=1; i<5; i++){
                peacockGeo.morphTargets.push({name: 'p'+i, vertices: this.peacockGeos[i].vertices});
            }
            peacockGeo.computeMorphNormals();
            this.peacock = new THREE.Mesh( peacockGeo, this.peacockMaterial );
            this.peacock.position.set(0.9, -5, -5);
            this.peacock.scale.multiplyScalar(3 );
            this.add(this.peacock);
            // console.log(this.peacock);
            DebugUtil.positionObject(this.peacock, "peacock");
        };
        this.loadPeacocks( peacockFiles );

        this.initParticles();

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

    initParticles() {
        let p_tex_loader = new THREE.TextureLoader(this.loadingManager);
        let particleTex = p_tex_loader.load(this.BASE_PATH + '/images/feather_particle.jpg');

        this.particleGroup = new SPE.Group({
            texture: {
                value: particleTex
            },
            maxParticleCount: 1000
        });

        // reduce emitter amount to be 1/5 of domeMorphTargets.length
        // for(let i = 0; i < this.domeMorphTargets.length-10; i+=10){
            let emitter = new SPE.Emitter({
                type: SPE.distributions.SPHERE,
                // duration: 10,
                maxAge: {
                    value: 10,
                    spread: 2
                },
                position: {
                    value: new THREE.Vector3(),
                    radius: 2
                },
                acceleration: {
                    value: new THREE.Vector3(0,-0.5,0)
                },
                velocity: {
                    value: new THREE.Vector3(0.3,-0.3,0.3)
                },
                rotation: {
                    angle: 0.5
                },
                angle: {
                    value: [0,0.5,-0.5],
                    spread: [0,-0.5,0.5]
                },
                opacity: {
                    value: [0,1,1,1,0]
                },
                size: {
                    value: [.2,1,1,1,.3]
                },
                particleCount: 15,
                drag: 0.6,
                activeMultiplier: 1
            });
            this.particleGroup.addEmitter( emitter );
        // }
        this.add( this.particleGroup.mesh );
    }

    doFirstAni(){
        console.log("do first animation.");
    }

    peacockBack (_duration) {
        // console.log( this.peacock.morphTargetInfluences );
        this.createMorph( _duration, [1, 0, 0, 0] );
        this.createTransition(_duration, [0.8, 0, 0, 0] );
    }

    peacockOpen (_duration) {
        this.createMorph( _duration, [0, 1, 0, 0] );
        this.createTransition(_duration, [0.5, 0.8, 0, 0] );
    }

    peacockBun (_duration) {
        this.createMorph( _duration, [0, 0, 1, 0] );
        this.createTransition(_duration, [0, 0.5, 0.8, 0] );
    }

    peacockSwallow (_duration) {
        this.createMorph( _duration, [0, 0, 0, 1] );
        this.createTransition(_duration, [0, 0, 0.5, 0.8] );

        // let tmpEndArray = [0,0.5,0.8];
        // TweenMax.to( this.peacock.morphTargetInfluences, _duration, {
        //     endArray: tmpEndArray,
        //     ease: Power3.easeInOut,
        //     delay: _duration,
        //     repeat: -1,
        //     yoyo: true
        // } );
    }

    createMorph( _duration, _array ) {
        // console.log( this.peacock.morphTargetInfluences );
        TweenMax.to( this.peacock.morphTargetInfluences, _duration, { endArray: _array, ease: Power1.easeInOut } );
    }

    createTransition( _duration, toArray ) {
        TweenMax.to( this.peacock.morphTargetInfluences, _duration/4, {
            endArray: toArray,
            ease: Power0.easeNone,
            delay: _duration,
            repeat: 3,
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
        this.peacockTexAni.updateWithOrder( 300*dt );
        if(this.particleGroup) {
            this.particleGroup.tick( dt );
        }
    }
}
