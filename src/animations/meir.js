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

        this.birds = [];
        /// ANI-SETTING ----------------------------------------------------
        // 0: eat, 1: jump, 2: jumpandturnV1, 3: jumpandturnV2, 4: flap, 5: swing
        this.birdsAniSetting = [ {seq: [6,6,0,5,5], timeGap: [2,1,1.5,4,1], label: ["swing_1", "swing_2", "jumpTurn", "swing_3", "swing_4"], seqNum: 5}, // {seq: [0,0,1], timeGap: [0,2,1], label: ["eat_1", "eat_2", "jump"], seqNum: 3},
                                 {seq: [0,4,3], timeGap: [6,0,1], label: ["eat", "flap", "jumpTurn"], seqNum: 3},
                                 {seq: [5,5,2,6,6], timeGap: [2,1,1.5,4,1], label: ["swing_1", "swing_2", "jumpTurn", "swing_3", "swing_4"], seqNum: 5},
                                 {seq: [8,0,10,9], timeGap: [3,0,3,5], label: ["peakout", "eat", "turn", "peakback"], seqNum: 4},
                                 {seq: [0,1,4], timeGap: [0,1,2], label: ["eat", "jump", "flap"], seqNum: 3} ];
        this.birdsPos = [ new THREE.Vector3(1.5, 3, 1.5), new THREE.Vector3(3.5, -1, 3), new THREE.Vector3(-1, 3.3, 1),
                          new THREE.Vector3(-1, -1, 3), new THREE.Vector3(-2, -0.5, 3), new THREE.Vector3(2.5, 3, 1.5),
                          new THREE.Vector3(4.5, -1, 2.5), new THREE.Vector3(5, -1, 2), new THREE.Vector3(0, -0.5, 3.5),
                          new THREE.Vector3(3, 2, 2) ];
        this.birdTex = tex_loader.load( this.BASE_PATH + "/images/bird.jpg" );
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
        let birdMat = new THREE.MeshLambertMaterial({map: this.birdTex});

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

                    for(let i=0; i<9; i++){
                        let bd = this.bird.clone();
                        bd.scale.multiplyScalar(0.3);
                        bd.position.copy( this.birdsPos[i] );
                        this.birds.push(bd);
                        this.add(bd);
                    }

                    this.createBirdAnimations();
                });
            });
        });
    }

    createBirdAnimations(){
        for(let i=0; i<this.birds.length; i++){
            let tl = new TimelineMax({repeat: -1, repeatDelay: 2, delay: i%3});

            let birdAniSetting = this.birdsAniSetting[i%5];

            for(let j=0; j<birdAniSetting.seqNum; j++){
                let tweenLabelTime = "+="+birdAniSetting.timeGap[j];
                tl.add( birdAniSetting.label[j], tweenLabelTime );

                let tweenToBeAdded = this.selectBirdAnimation( this.birds[i], birdAniSetting.seq[j] );
                tl.add( tweenToBeAdded, birdAniSetting.label[j] );
            }
        }
    }

    // 0: eat, 1: jump, 2: jumpandturnV1, 3: jumpandturnV2, 4: flap, 5: swing
    selectBirdAnimation( bird, aniIndex ){
        switch ( aniIndex ) {

            case 0:
                return this.birdEat( bird, 1 );
                break;

            case 1:
                return this.birdJump( bird );
                break;

            case 2:
                return this.birdJumpTurnV1( bird );
                break;

            case 3:
                return this.birdJumpTurnV2( bird );
                break;

            case 4:
                return this.birdFlap( bird );
                break;

            case 5:
                return this.birdSwingRight( bird, true );
                break;

            case 6:
                return this.birdSwingRight( bird, false );
                break;

            case 7:
                return this.birdPeek( bird );
                break;

            case 8:
                return this.birdPeekOut( bird, true );
                break;

            case 9:
                return this.birdPeekOut( bird, false );
                break;

            case 10:
                return this.birdTurn( bird );
                break;
        }
    }

    createBirdAnimation(){
        for(let i=0; i<this.birds.length; i++){
            let tl = new TimelineMax({repeat: -1, repeatDelay: 2, delay: i%3});
            if(i%2==0){
                tl.add( "eat_1" );
                tl.add( this.birdEat( this.birds[i], 1 ), "eat_1" );
                tl.add( "eat_2", "+=2" );
                tl.add( this.birdEat( this.birds[i], 3 ), "eat_2" );
                tl.add( "jump", "+=1" );
                tl.add( this.birdJump( this.birds[i] ), "jump" );
            } else {
                tl.add( "eat_3" );
                tl.add( this.birdEat( this.birds[i], 3 ), "eat_3" );
                tl.add( "flap" );
                tl.add( this.birdFlap( this.birds[i] ), "flap" );
                tl.add( "jumpTurn", "+=1" );
                tl.add( this.birdJumpTurnV2( this.birds[i] ), "jumpTurn" );
            }
        }
        // var bird_tl = new TimelineMax({repeat: 1});
        // // eat, eat, jump
        // bird_tl.to( bird.rotation, 0.15, { x:20*Math.PI/180, repeat: 1, yoyo: true} )
        //        .to( bird.rotation, 0.15, { x:20*Math.PI/180, repeat: 3, yoyo: true, delay: 2} )
        //        .to( bird.position, 0.2, { y:2, repeat: 3, yoyo: true, delay: 1} );

        // var bird_tl_2 = new TimelineMax({repeat: 1});
        // // eat, flap wings, jump&turn_V2
        // bird_tl_2.to( bird.rotation, 0.15, { x:20*Math.PI/180, repeat: 3, yoyo: true, delay: 2} )
        //          .to( bird.children[0].rotation, 0.15, { x:10*Math.PI/180, y:30*Math.PI/180, repeat: 3, yoyo: true, onStart:()=>{
        //             TweenMax.to( bird.children[1].rotation, 0.15, { x:10*Math.PI/180, y:-30*Math.PI/180, repeat: 3, yoyo: true} );
        //             TweenMax.to( bird.position, 0.2, { y:1.5, repeat: 1, yoyo: true, delay: 0.1 } );
        //          }} ) 
        //          .to( bird.position, 0.2, { y:2, repeat: 1, yoyo: true, delay: 1, onStart:()=>{
        //                 TweenMax.to( bird.rotation, 0.2, { y:30*Math.PI/180} );
        //             }, onComplete: ()=>{
        //               TweenMax.to(bird.position, 0.2, { y:2.5, repeat: 1, yoyo: true, onComplete: ()=>{
        //                 TweenMax.to(bird.position, 0.15, { y:1.5, repeat: 1, yoyo: true });
        //                 TweenMax.to(bird.rotation, 0.15, { y:0 } );
        //               } });
        //               TweenMax.to(bird.rotation, 0.2, { y:-10*Math.PI/180 } );
        //             }} );
    }

    birdSwingRight( _bird, _right ){
        let direction = 1;
        if(!_right) direction = -1;

        return TweenMax.to( _bird.rotation, 0.2, { z:10*Math.PI/180*direction, onStart:()=>{
            let mov = direction * 0.1;
            TweenMax.to( _bird.position, 0.8, {x:"-="+mov});
        }, onComplete: ()=>{
            TweenMax.to( _bird.rotation, 0.4, { z:-10*Math.PI/180*direction, onComplete: ()=>{
                TweenMax.to( _bird.rotation, 0.2, { z:0 } );
            }} );
        }} );
    }

    birdEat( _bird, _repeat ){
        return TweenMax.to( _bird.rotation, 0.15, { x:20*Math.PI/180, repeat: _repeat, yoyo: true} );
    }

    birdPeek( _bird ){
        let t1 = TweenMax.to( _bird.rotation, 0.5, { x:10*Math.PI/180, repeat: 1, repeatDelay: 3, yoyo: true} );
        let t2 = TweenMax.to( _bird.position, 0.5, { z:"+=0.2", repeat: 1, repeatDelay: 3, yoyo: true} );
        return [t1, t2];
    }

    birdPeekOut( _bird, _out ){
        let direction, mov;

        if(_out){
            direction = 1;
            mov = 0.2;
        } else {
            direction = 0;
            mov = -0.2;
        }

        let t1 = TweenMax.to( _bird.rotation, 0.5, { x:10*Math.PI/180*direction} );
        let t2 = TweenMax.to( _bird.position, 0.5, { z:"+="+mov} );
        return [t1, t2];
    }

    birdFlap( _bird ){
        let t1 = TweenMax.to( _bird.children[0].rotation, 0.15, { x:10*Math.PI/180, y:40*Math.PI/180, repeat: 3, yoyo: true} );
        let t2 = TweenMax.to( _bird.children[1].rotation, 0.15, { x:10*Math.PI/180, y:-40*Math.PI/180, repeat: 3, yoyo: true} );
        let t3 = TweenMax.to( _bird.position, 0.2, { y:"+=0.1", repeat: 1, yoyo: true, delay: 0.1 } );

        return [t1, t2, t3];
    }
    
    birdJump( _bird ){
        return TweenMax.to( _bird.position, 0.15, { y:"+=0.05", repeat: 3, yoyo: true} );
    }

    birdTurn( _bird ){
        return TweenMax.to( _bird.rotation, 0.2, { y:10*Math.PI/180, repeat: 1, yoyo: true, repeatDelay: 1, onComplete: ()=>{
                TweenMax.to( _bird.rotation, 0.2, { y:-10*Math.PI/180, repeat: 1, yoyo: true, repeatDelay: 0.5});
            }} );
    }

    birdJumpTurnV1( _bird ){
        let t1 = TweenMax.to( _bird.position, 0.15, { y:"+=0.05", repeat: 1, yoyo: true, onComplete: ()=>{
                TweenMax.to( _bird.position, 0.15, { y:"+=0.05", repeat: 1, yoyo: true, delay: 1 });
                TweenMax.to( _bird.rotation, 0.2, { y:0, delay: 1.1 } );
            }} );
        let t2 = TweenMax.to( _bird.rotation, 0.2, { y:20*Math.PI/180, delay: 0.1} );
        return [t1, t2];
    }

    birdJumpTurnV2( _bird ){
        let t1 = TweenMax.to( _bird.position, 0.2, { y:"+=0.02", repeat: 1, yoyo: true, repeatDelay: 2, onComplete: ()=>{
                TweenMax.to( _bird.position, 0.2, { y:"+=0.04", repeat: 1, yoyo: true, repeatDelay: 2, onComplete: ()=>{
                    TweenMax.to( _bird.position, 0.15, { y:"+=0.02", repeat: 1, yoyo: true });
                    TweenMax.to( _bird.rotation, 0.15, { y:0 } );
                } });
                TweenMax.to( _bird.rotation, 0.2, { y:-10*Math.PI/180 } );
            }} );
        let t2 = TweenMax.to( _bird.rotation, 0.2, { y:30*Math.PI/180} );

        return [t1, t2];
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
