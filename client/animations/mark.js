import DebugUtil from '../util/debug'

export default class MeirAnimation extends THREE.Object3D {
    constructor( scene, renderer ) {
        super();
        this.BASE_PATH = 'assets/animations/mark';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = [
            { time: 5,  anim: ()=>{ this.pinkNeonOn() } },
            { time: 10, anim: ()=>{ this.blueNeonOn() } },
            { time: 15, anim: ()=>{ this.neonRotate() } },
            { time: 32, anim: ()=>{ this.neonRotate() } },
            { time: 40, anim: ()=>{ this.neonFlickering( 0.2, 3 ) } },    // neonFlickering( speed, time ) <-- how fast & how many times of flickering
            { time: 25, anim: ()=>{ this.neonRotateBack() } },
            { time: 55, anim: ()=>{ this.neonRotate() } },
            { time: 94, anim: ()=>{ this.neonRotateBack() } },
            { time: 99, anim: ()=>{ this.neonRotate() } },
            { time: 105, anim: ()=>{ this.neonRotateBack() } },
            { time: 110, anim: ()=>{ this.neonRotate() } },
            { time: 115, anim: ()=>{ this.neonRotateBack() } },
            { time: 120, anim: ()=>{ this.neonRotate() } },
            { time: 198, anim: ()=>{ this.neonFlickering( 0.15, 6 ) } },
            { time: 200, anim: ()=>{ this.neonRotateBack() } },
            { time: 207, anim: ()=>{ this.neonFlickering( 0.15, 6 ) } },
            { time: 209, anim: ()=>{ this.neonRotate() } },  
            { time: 218, anim: ()=>{ this.characterDisappear() } }
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();

        this.loadingManager.itemStart("MarkAnim");

        //        
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        // NEON       
            this.neon1_light = new THREE.PointLight( 0xff0055, 0, 5 );
            this.neon1_light.position.set(0.2, 1, 1);
            this.neon2_light = new THREE.PointLight( 0x00eaff, 0, 5 );
            this.neon2_light.position.set(-0.2, 1, -1);

            let neonFiles = [];
            for(let i=1; i<=9; i++){
                let fileName = this.BASE_PATH + "/models/neon/" + i + ".json";
                neonFiles.push(fileName);
            }

            let neonFiles2 = [];
            for(let i=1; i<=8; i++){
                let fileName = this.BASE_PATH + "/models/neon2/" + i + ".json";
                neonFiles2.push(fileName);
            }
            this.neon1 = new THREE.Object3D();
            this.neon2 = new THREE.Object3D();

            for(let i=0; i<neonFiles.length; i++){
                loader.load( neonFiles[i], (geometry, material) => {
                    let neonMat = new THREE.MeshPhongMaterial({color: 0xc43b69, emissive: 0xff0055, emissiveIntensity: .1});
                    let neon = new THREE.Mesh( geometry, neonMat );

                    if(i==0){
                        neon.add(this.neon1_light);
                    }

                    let tween = this.createNeonAnim( neon, i );
                    neon.tween = tween;

                    this.neon1.add(neon);
                });
                this.add(this.neon1);
            }
            this.neon1.position.set( 2, 0, -0.11 );
            this.neon1.rotation.set( 0, 142*Math.PI/180, 0 );
            // DebugUtil.positionObject(this.neon1, "neon1");


            for(let i=0; i<neonFiles2.length; i++){
                loader.load( neonFiles2[i], (geometry, material) => {
                    let neonMat = new THREE.MeshPhongMaterial({color: 0x45baba, emissive: 0x00ffff, emissiveIntensity: .1});
                    let neon = new THREE.Mesh( geometry, neonMat );
                    // TweenMax.to( neon.material, 2, { emissiveIntensity: 1, ease: Bounce.easeInOut, delay: i, repeat: -1, repeatDelay: 5 } );

                    if(i==0){
                        neon.add(this.neon2_light);
                    }

                    let tween = this.createNeonAnim( neon, i );
                    neon.tween = tween;

                    this.neon2.add(neon);
                });
                this.add(this.neon2);
            }
            this.neon2.position.set( 1.71, 0, 0.54 );
            this.neon2.rotation.set( 0, 142*Math.PI/180, 0 );
            // DebugUtil.positionObject(this.neon2, "neon2");

        this.dummy = {opacity: 1};

        // DebugUtil.positionObject(this, "Mark Ani");
        //
        this.loadingManager.itemEnd("MarkAnim");
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    pinkNeonOn(){
        this.neon1_light.intensity = 1;
    }

    blueNeonOn(){
        this.neon2_light.intensity = 1;
    }

    neonRotate(){
        TweenMax.to( [this.neon1.rotation, this.neon2.rotation], 2, { y: 0, ease: Back.easeInOut } );
        TweenMax.to( [this.neon1.position, this.neon2.position], 2, { x: 1.26, y: 0, z: 0, ease: Back.easeInOut } );
    }

    neonRotateBack(){
        TweenMax.to( this.neon1.rotation, 2, { y: 142*Math.PI/180, ease: Back.easeInOut } );
        TweenMax.to( this.neon1.position, 2, { x: 2, y: -0, z: -0.11, ease: Back.easeInOut } );

        TweenMax.to( this.neon2.rotation, 2, { y: 142*Math.PI/180, ease: Back.easeInOut } );
        TweenMax.to( this.neon2.position, 2, { x: 1.71, y: -0, z: 0.54, ease: Back.easeInOut } );
    }

    neonFlickering( _speed, _times ){
        let repeatTimes = 1 + (_times-1)*2;
        for(let i=0; i<this.neon1.children.length; i++){
            this.neon1.children[i].tween.pause();
            if(i==0){
                TweenMax.fromTo( this.neon1.children[i].material, _speed,
                                    { emissiveIntensity: 1 },
                                    { emissiveIntensity: 0, ease: Power0.easeNone, repeat: repeatTimes, yoyo: true,
                                        onComplete:()=>{
                                            this.neon1.children[i].tween.resume();
                                        }, onUpdate:()=>{
                                            this.neon1_light.intensity = this.neon1.children[i].material.emissiveIntensity;
                                        }
                                    }
                                );
            }else{
                TweenMax.fromTo( this.neon1.children[i].material, _speed, { emissiveIntensity: 0 }, { emissiveIntensity: 1, ease: Power0.easeNone, repeat: repeatTimes, yoyo: true, onComplete:()=>{
                    this.neon1.children[i].tween.resume();
                } } );
            }
        }
        for(let i=0; i<this.neon2.children.length; i++){
            this.neon2.children[i].tween.pause();
            if(i==0){
                TweenMax.fromTo( this.neon2.children[i].material, _speed,
                                    { emissiveIntensity: 1 },
                                    { emissiveIntensity: 0, ease: Power0.easeNone, repeat: repeatTimes, yoyo: true,
                                        onComplete:()=>{
                                            this.neon2.children[i].tween.resume();
                                        }, onUpdate:()=>{
                                            this.neon2_light.intensity = this.neon2.children[i].material.emissiveIntensity;
                                        }
                                    }
                                );
            }else{
                TweenMax.fromTo( this.neon2.children[i].material, _speed, { emissiveIntensity: 0 }, { emissiveIntensity: 1, ease: Power0.easeNone, repeat: repeatTimes, yoyo: true, onComplete:()=>{
                    this.neon2.children[i].tween.resume();
                } } );
            }
        }

    }

    characterDisappear() {
        this.neonFlickering( 0.05, 40 );

        TweenMax.to( this.dummy, 4, { opacity:0, ease: SteppedEase.config(3), onUpdate: ()=>{
                this.parent.fullVideo.setOpacity(this.dummy.opacity);
            }, onComplete: ()=>{
                this.parent.fullVideo.setOpacity(0.0);
            } } );
    }

    createNeonAnim( object, index ){
        let tweenM = TweenMax.to( object.material, 2, { emissiveIntensity: 1,
                                                         delay: index*1.5%3, 
                                                         repeat: -1, 
                                                         repeatDelay: 2+index%3, 
                                                         ease: RoughEase.ease.config({
                                                            template: Power0.easeNone,
                                                            strength: 2,
                                                            points: 20,
                                                            taper: "none",
                                                            randomize: true,
                                                            clamp: false})} );
        return tweenM;
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
