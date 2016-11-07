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
        // DebugUtil.positionObject(this, "meir anim");
    }

    setupAnim() {

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = [
            { time: 20, anim: ()=>{this.birdsOut()} },
            { time: 102, anim: ()=>{this.characterDisappear()} }
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
        
        this.backBirds = new THREE.Object3D();

        /// ANI-SETTING ----------------------------------------------------

        //v.1
        /*
        // 0: eat, 1: jump, 2: jumpandturnV1, 3: jumpandturnV2, 4: flap, 5: swing
        this.birdsAniSetting = [ {
                                    seq: [6,6,0,5,5],
                                    timeGap: [2,1,1.5,4,1],
                                    label: ["swing_1", "swing_2", "jumpTurn", "swing_3", "swing_4"],
                                    seqNum: 5
                                 }, // {seq: [0,0,1], timeGap: [0,2,1], label: ["eat_1", "eat_2", "jump"], seqNum: 3},
                                 {
                                    seq: [0,4,3],
                                    timeGap: [6,0,1], 
                                    label: ["eat", "flap", "jumpTurn"], 
                                    seqNum: 3
                                 },
                                 {
                                    seq: [5,5,2,6,6], 
                                    timeGap: [2,1,1.5,4,1], 
                                    label: ["swing_1", "swing_2", "jumpTurn", "swing_3", "swing_4"], 
                                    seqNum: 5
                                 },
                                 {
                                    seq: [8,0,10,9], 
                                    timeGap: [3,0,3,5], 
                                    label: ["peakout", "eat", "turn", "peakback"], 
                                    seqNum: 4
                                 },
                                 {
                                    seq: [0,1,4], 
                                    timeGap: [0,1,2], 
                                    label: ["eat", "jump", "flap"], 
                                    seqNum: 3
                                 } ];
        this.birdsPos = [ new THREE.Vector3(-.2, 4.1, 4.3), new THREE.Vector3( 0.6,  5, 4.8), new THREE.Vector3( 2, 3.5, 4.2),
                          new THREE.Vector3( .8, 3.1, 3.5), new THREE.Vector3(-0.8, -.8, 3), new THREE.Vector3(-.5, 3.7, 4),
                          new THREE.Vector3(3.5, -.8, 2.6), new THREE.Vector3( 2.2, .7, 5.6), new THREE.Vector3( 1, 3.5, 3.5),
                          new THREE.Vector3(  3, 2, 2) ];
        */
        // Sequence -----------
            // 0: eat, 1: jump, 2: jumpandturnV1, 3: jumpandturnV2, 4: flap, 5: swing right
            // 6: swing left, 7: peak, 8: peak out, 9: peak back, 10: turn
        // Ani Setting --------
            // 0: swing L+R, 1: swing R+L, 2:eat, 3: peak eat, 4: peak turn
        this.birdsAniSetting = [ {
                                    seq: [6,6,0,5,5],
                                    timeGap: [2,1,1.5,4,1],
                                    label: ["swing_1", "swing_2", "jumpTurn", "swing_3", "swing_4"],
                                    seqNum: 5
                                 },
                                 {
                                    seq: [5,5,2,6,6], 
                                    timeGap: [2,1,1.5,4,1], 
                                    label: ["swing_1", "swing_2", "jumpTurn", "swing_3", "swing_4"], 
                                    seqNum: 5
                                 },
                                 {
                                    seq: [0,4,3],
                                    timeGap: [3,0,1], 
                                    label: ["eat", "flap", "jumpTurn"], 
                                    seqNum: 3
                                 },
                                 {
                                    seq: [8,0,0,10,9], 
                                    timeGap: [3,0,1,1,5], 
                                    label: ["peakout", "eat", "eat", "turn", "peakback"], 
                                    seqNum: 5
                                 },
                                 {
                                    seq: [8,10,4,9], 
                                    timeGap: [3,1,1,3], 
                                    label: ["peakout", "turn", "flap", "peakback"], 
                                    seqNum: 4
                                 } ];
        this.birdAniConfig = [
            4,3,4,3,4,
            3,4,3,4,3,
            4,3,4,3,4,
            0,0,2,1
        ];
        this.birdAniTimelines = [];
        this.backbirdAniTimelines = [];

        // behind bear, behind shoulder, 4 appearing
        let birdPosNum = [
            [.86, 2.88, 3.3], [0.64, 3.32, 3.3], [.46, 2.83, 3.3], [1.35, 3.52, 3.3], [1.2, 2.57, 3.3],
            [1.02, 3.1, 3.3], [0.4, 3.36, 3.3], [.9, 3.4, 3.3], [.45, 3.03, 3.3], [.68, 2.46, 3.3],
            [.03, 3.71, 3.3], [1.38, 3.47, 3.3], [1.33, 3.23, 3.3], [0.73, 3.16, 3.3], [1.19, 3.67, 3.3],
            [-.07, 4.07, 4.3], [-.54, 3.82, 4.02], [0.9, 4.8, 4.8], [1.73, 3.73, 4.27]
        ];

        this.birdsPos = [];
        for(let i=0; i<birdPosNum.length; i++){
            let birdP = new THREE.Vector3( birdPosNum[i][0], birdPosNum[i][1], birdPosNum[i][2] );
            this.birdsPos.push(birdP);
        }

        let birdDownPosNum = [
            [.86, 0, 2.8], [2.8, 0, 1.5], [.3, 0, 2.3], [3, 0, 2.3], [2, 0, 2.3],
            [-3, 0, 2], [-0.4, 0, 2], [2.5, 0, 2], [.45, 0, 1], [-2.68, 0, 2],
            [.03, 0, 2], [-2.3, 0, 2], [3, 0, 2], [0.73, 0, 2.5], [2.5, 0, 2],
            [-1.07, 0, 2.3], [-1.54, 0, 2.02], [0.9, 0, 2.8], [2.73, 0, 2.27]
        ];
        this.birdsDownPos = [];
        for(let i=0; i<birdDownPosNum.length; i++){
            let birdP = new THREE.Vector3( birdDownPosNum[i][0], birdDownPosNum[i][1], birdDownPosNum[i][2] );
            this.birdsDownPos.push(birdP);
        }
        // #16, 17, 9: shoulder walking
        // #18: on the head
        // #3, 8: behind beard
        // #4: down on the left
        // #6: down on the right 
        this.birdTex = tex_loader.load( this.BASE_PATH + "/images/bird.jpg" );
        this.loadModelBird( this.BASE_PATH + "/models/bird/bird_body.json",
                       this.BASE_PATH + "/models/bird/bird_wingR.json",
                       this.BASE_PATH + "/models/bird/bird_wingL.json", loader );

        // let testCube = new THREE.Mesh( new THREE.BoxGeometry(5,1,1), new THREE.MeshBasicMaterial({color:0xff0000}));
        // this.add(testCube);

        this.dummy = {opacity: 1};

        this.pinBall = new THREE.Mesh( new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide}) );
        //this.pinBall.position.copy( this.parent.fullVideo.mesh.geometry.faces[100].position );
        this.add(this.pinBall);
        // console.log(this.parent);
        // this.parent.fullvideo.updateMatrixWorld();

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

    birdsOut() {
        for(let i=0; i<15; i++){
            this.birdAniTimelines[i].resume();
        }
    }

    characterDisappear() {
        // kill current animation
        for(let i=0; i<this.birdAniTimelines.length; i++){
            this.birdAniTimelines[i].kill();
        }
        for(let i=0; i<this.backbirdAniTimelines.length; i++){
            this.backbirdAniTimelines[i].kill();
        }

        // flap and down to the rail
        for(let i=0; i<this.birds.length; i++){
            this.birdFlapDown( this.birds[i], i );
        }
        for(let i=0; i<this.backBirds.children.length; i++){
            this.backBirdFlapDown( this.backBirds.children[i], i );
        }

        // TweenMax.to( this.smokeMat, 1, {opacity: 1});
        // TweenMax.to( this.fog.position, 4, {x:0, delay:0.9, ease: Power1.easeInOut});

        TweenMax.to( this.dummy, 3, { opacity:0, delay: 1, onUpdate: ()=>{
                this.parent.fullVideo.setOpacity(this.dummy.opacity);
            }, onStart: ()=>{
                // TweenMax.to( this.smokeMat, 4, {opacity: 0});
            }, onComplete: ()=>{
                this.parent.fullVideo.setOpacity(0.0);

                // back to animation routine
                this.createBirdAnimations( true );
                this.createBackBirdAnimations( true );
            } } );
    }

    loadModelBird( _body, _wingR, _wingL, loader ){
        // let birdMat = new THREE.MeshLambertMaterial({map: this.birdTex});
        let birdMat = new THREE.MeshBasicMaterial({color: 0xa5d0c3, map: this.birdTex});

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

                    for(let i=0; i<this.birdsPos.length; i++){
                        let bd = this.bird.clone();
                        bd.scale.multiplyScalar(0.2);
                        bd.position.copy( this.birdsPos[i] );
                        this.birds.push(bd);
                        this.add(bd);

                        // position
                        // if(i==0)
                            // DebugUtil.positionObject(bd, "bird_"+i);
                    }

                    for(let i=3; i<6; i++){
                        let mathStuff = Math.PI*2/9*i;

                        for(let j=0; j<9; j++){
                            let bd = this.bird.clone();
                            bd.scale.multiplyScalar(0.4);

                            let tempA = new THREE.Vector3();
                            if(j>6)
                                tempA.set( Math.sin(mathStuff)*(1-j/18), j/2, Math.cos(mathStuff)*(1-j/18) );
                            else if(j<2)
                                tempA.set( Math.sin(mathStuff)*(1+(3-j)/4), j/2, Math.cos(mathStuff)*(1+(3-j)/4) );
                            else
                                tempA.set( Math.sin(mathStuff)*1, j/2, Math.cos(mathStuff)*1 );
                            
                            tempA.set( tempA.x + this.lookupTable[(i*j)%45]*0.3,
                                       tempA.y + this.lookupTable[(i*j)%46]*0.3,
                                       tempA.z + this.lookupTable[(i*j)%47]*0.3 );
                            
                            bd.position.copy( tempA );
                            bd.rotation.y = mathStuff - Math.PI*2;
                            
                            this.backBirds.add(bd);
                        }
                    }
                    this.add(this.backBirds);
                    this.backBirds.position.set(0.1, -0.36, 3.33);
                    this.backBirds.rotation.y = 10 * Math.PI/180;
                    // DebugUtil.positionObject(this.backBirds, "backBirds");

                    this.createBirdAnimations( false );

                    this.createBackBirdAnimations( false );
                });
            });
        });
    }

    createBirdAnimations( again ){
        for(let i=0; i<this.birds.length; i++){
            let tl = new TimelineMax({repeat: -1, repeatDelay: 2, delay: i%5});

            let index = this.birdAniConfig[i];
            let birdAniSetting = this.birdsAniSetting[ index ];

            if(again){
                birdAniSetting = this.birdsAniSetting[ i%3 ];
            }

            for(let j=0; j<birdAniSetting.seqNum; j++){
                let tweenLabelTime = "+="+birdAniSetting.timeGap[j];
                tl.add( birdAniSetting.label[j], tweenLabelTime );

                let tweenToBeAdded = this.selectBirdAnimation( this.birds[i], birdAniSetting.seq[j] );
                tl.add( tweenToBeAdded, birdAniSetting.label[j] );
            }

            if(!again){
                if(i<15)
                    tl.pause();
                this.birdAniTimelines.push( tl );
            }
            else{
                this.birdAniTimelines[i] = tl;
            }
            
        }
    }

    createBackBirdAnimations( again ){
        let b_b_length = this.backBirds.children.length;
        for(let i=0; i<this.backBirds.children.length; i++){
            let tl = new TimelineMax({repeat: -1, repeatDelay: 1+(i/b_b_length), delay: (i%5)+(i/b_b_length) });

            let index = this.birdAniConfig[i];
            let birdAniSetting = this.birdsAniSetting[ i%3 ];

            for(let j=0; j<birdAniSetting.seqNum; j++){
                let tweenLabelTime = "+="+birdAniSetting.timeGap[j];
                tl.add( birdAniSetting.label[j], tweenLabelTime );

                let tweenToBeAdded = this.selectBirdAnimation( this.backBirds.children[i], birdAniSetting.seq[j] );
                tl.add( tweenToBeAdded, birdAniSetting.label[j] );
            }
            if(!again){
                this.backbirdAniTimelines.push( tl );
            } else {
                this.backbirdAniTimelines[i] = tl;
            }
        }
    }

    // 0: eat, 1: jump, 2: jumpandturnV1, 3: jumpandturnV2, 4: flap, 5: swing right
    // 6: swing left, 7: peak, 8: peak out, 9: peak back, 10: turn
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
        let t2 = TweenMax.to( _bird.position, 1, { z:"+=.9", repeat: 1, repeatDelay: 3, yoyo: true} );
        return [t1, t2];
    }

    birdPeekOut( _bird, _out ){
        let direction, mov;

        if(_out){
            direction = 1;
            mov = 1.1;
        } else {
            direction = 0;
            mov = -1.1;
        }

        let t1 = TweenMax.to( _bird.rotation, 0.5, { x:10*Math.PI/180*direction} );
        let t2 = TweenMax.to( _bird.position, 1, { z:"+="+mov} );
        return [t1, t2];
    }

    birdFlap( _bird ){
        let rotY = 40*Math.PI/180;
        let t1 = TweenMax.to( _bird.children[0].rotation, 0.15, { x:10*Math.PI/180, y:"+="+rotY, repeat: 3, yoyo: true} );
        let t2 = TweenMax.to( _bird.children[1].rotation, 0.15, { x:10*Math.PI/180, y:"-="+rotY, repeat: 3, yoyo: true} );
        let t3 = TweenMax.to( _bird.position, 0.2, { y:"+=0.1", repeat: 1, yoyo: true, delay: 0.1 } );

        return [t1, t2, t3];
    }

    birdFlapDown( _bird, index ){
        let rotY = 40*Math.PI/180;
        TweenMax.to( _bird.children[0].rotation, 0.15, { x:10*Math.PI/180, y:"+="+rotY, repeat: 7, yoyo: true, delay: index*0.1} );
        TweenMax.to( _bird.children[1].rotation, 0.15, { x:10*Math.PI/180, y:"-="+rotY, repeat: 7, yoyo: true, delay: index*0.1} );
        TweenMax.to( _bird.position, 0.2, { y:"+=0.1", delay: index*0.1+1, onComplete: ()=>{
            TweenMax.to( _bird.position, 2, { x:this.birdsDownPos[index].x, y:this.birdsDownPos[index].y, z:this.birdsDownPos[index].z} );
        } } );
    }

    backBirdFlapDown( _bird, index ){
        let rotY = 40*Math.PI/180;
        TweenMax.to( _bird.children[0].rotation, 0.15, { x:10*Math.PI/180, y:"+="+rotY, repeat: 7, yoyo: true, delay: (index*0.1)%1.5} );
        TweenMax.to( _bird.children[1].rotation, 0.15, { x:10*Math.PI/180, y:"-="+rotY, repeat: 7, yoyo: true, delay: (index*0.1)%1.5} );
        TweenMax.to( _bird.position, 0.2, { y:"+=0.1", delay: (index*0.1+1)%1.5, onComplete: ()=>{
            let xPos = this.birdsDownPos[index%14].x + this.lookupTable[index%48]*3 - this.backBirds.position.x;
            let yPos = this.birdsDownPos[index%14].y - this.backBirds.position.y;
            let zPos = this.birdsDownPos[index%14].z + this.lookupTable[index%49]*2 - this.backBirds.position.z - 2;
            
            TweenMax.to( _bird.position, 2, { x:xPos, y:yPos, z:zPos} );
            TweenMax.to( _bird.rotation, 2, { y:0 } );
        } } );
    }
    
    birdJump( _bird ){
        return TweenMax.to( _bird.position, 0.15, { y:"+=0.05", repeat: 3, yoyo: true} );
    }

    birdTurn( _bird ){
        let rotY = 10*Math.PI/180;
        return TweenMax.to( _bird.rotation, 0.2, { y:"+="+rotY, repeat: 1, yoyo: true, repeatDelay: 1, onComplete: ()=>{
                TweenMax.to( _bird.rotation, 0.2, { y:"-="+rotY, repeat: 1, yoyo: true, repeatDelay: 0.5});
            }} );
    }

    birdJumpTurnV1( _bird ){
        let oriRotY = _bird.rotation.y;
        let rotY = 20*Math.PI/180;
        let t1 = TweenMax.to( _bird.position, 0.15, { y:"+=0.05", repeat: 1, yoyo: true, onComplete: ()=>{
                TweenMax.to( _bird.position, 0.15, { y:"+=0.05", repeat: 1, yoyo: true, delay: 1 });
                TweenMax.to( _bird.rotation, 0.2, { y:oriRotY, delay: 1.1 } );
            }} );
        let t2 = TweenMax.to( _bird.rotation, 0.2, { y:"+="+rotY, delay: 0.1} );
        return [t1, t2];
    }

    birdJumpTurnV2( _bird ){
        let oriRotY = _bird.rotation.y;
        let rotY = 10*Math.PI/180;
        let rotY2 = 30*Math.PI/180;
        let t1 = TweenMax.to( _bird.position, 0.2, { y:"+=0.02", repeat: 1, yoyo: true, repeatDelay: 2, onComplete: ()=>{
                TweenMax.to( _bird.position, 0.2, { y:"+=0.04", repeat: 1, yoyo: true, repeatDelay: 2, onComplete: ()=>{
                    TweenMax.to( _bird.position, 0.15, { y:"+=0.02", repeat: 1, yoyo: true });
                    TweenMax.to( _bird.rotation, 0.15, { y:oriRotY } );
                } });
                TweenMax.to( _bird.rotation, 0.2, { y:"-="+rotY } );
            }} );
        let t2 = TweenMax.to( _bird.rotation, 0.2, { y:"+="+rotY2} );

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
        this.parent.updateMatrixWorld();
        this.parent.fullVideo.mesh.updateMatrixWorld();     
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
        let facePos = new THREE.Vector3( this.parent.fullVideo.mesh.geometry.faces[100].a,
                                  this.parent.fullVideo.mesh.geometry.faces[100].b,
                                  this.parent.fullVideo.mesh.geometry.faces[100].c);
        facePos.multiplyScalar( this.parent.fullVideo.mesh.scale );
        facePos.applyMatrix4( this.parent.fullVideo.mesh.matrixWorld );


        this.pinBall.position.copy( facePos );
    }
}
