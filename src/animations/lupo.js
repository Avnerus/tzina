import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'

export default class LupoAnimation extends THREE.Object3D {
    constructor() {
        super();
        this.BASE_PATH = 'assets/animations/lupo';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {
        this.loadingManager.itemStart("LupoAnim");
        this.perlin = new ImprovedNoise();

        // setup animation sequence
        this.sequenceConfig = [
            { time: 2, anim: ()=>{this.showSculptures()} },    // 16
            { time: 5, anim: ()=>{this.growCactus()} },
            { time: 10, anim: ()=>{this.flickerSculptureTextures()} }  // 24 // texture flickering
            // { time: 44, anim: ()=>{this.shiftSculptures()} },           // shift sculptures---> plastic
            // { time: 67, anim: ()=>{this.shiftSculptures()} },
            // { time: 112, anim: ()=>{this.shiftSculptures()} },
            // { time: 143, anim: ()=>{this.shiftSculptures()} },
            // { time: 180, anim: ()=>{this.shiftSculptures()} },           // shift sculptures---> plastic
            // { time: 191, anim: ()=>{this.shiftSculptures()} },
            // { time: 203, anim: ()=>{this.shiftSculptures()} },
            // { time: 210, anim: ()=>{this.flickerSculptureTextures()} },
            // { time: 213, anim: ()=>{this.shiftSculptures()} },           // shift sculptures---> plastic
            // { time: 228, anim: ()=>{this.shiftSculptures()} },
            // { time: 243, anim: ()=>{this.shiftSculptures()} },
            // { time: 295, anim: ()=>{this.shiftSculptures()} },
            // { time: 312, anim: ()=>{this.shiftSculptures()} },           // shift sculptures---> plastic
            // { time: 314, anim: ()=>{this.shiftSculptures()} },
            // { time: 340, anim: ()=>{this.shiftSculptures()} },
            // { time: 358, anim: ()=>{this.shiftSculptures()} }
        ];
        this.sequenceConfigOriginal =  this.sequenceConfig.slice(0);

        this.nextAnim = null;
        this.tweenAnimCollectors = [];

        let p_tex_loader = new THREE.TextureLoader(this.loadingManager);

        this.baseMat = new THREE.MeshLambertMaterial( { color: 0x9f43fa, wireframe: true } );
        this.bottomMat = new THREE.MeshLambertMaterial( { color: 0x43fa9f} );
        this.topMat = new THREE.MeshLambertMaterial( { color: 0xfa9f43} );

        let modelLoader = new THREE.JSONLoader(this.loadingManager);

        // url + targetPosition + startPosition
        let sculptureModelFiles = [ [this.BASE_PATH + "/models/sculptures/deer.js", new THREE.Vector3(2, .3, 2), new THREE.Vector3(2, .5, 2)],
                                    [this.BASE_PATH + "/models/sculptures/dog.js", new THREE.Vector3(-2, .3, 1.5), new THREE.Vector3(-2, .5, 1.5)],
                                    [this.BASE_PATH + "/models/sculptures/macho.js", new THREE.Vector3(-3.8, .7, 0), new THREE.Vector3(-3.8, 2, 1.3)],
                                    [this.BASE_PATH + "/models/sculptures/painter.js", new THREE.Vector3(5, 1, -1), new THREE.Vector3(5, 2, -1)],
                                    [this.BASE_PATH + "/models/sculptures/pig.js", new THREE.Vector3(3.5, 0.3, 1), new THREE.Vector3(3.5, .5, 1)],
                                    [this.BASE_PATH + "/models/sculptures/right_arm.js", new THREE.Vector3(2.7, .9, 0), new THREE.Vector3(2.7, 2.5, -1)],
                                    [this.BASE_PATH + "/models/sculptures/short_legs.js", new THREE.Vector3(-2.5, .3, 1.8), new THREE.Vector3(-2.5, 2, 1.8)],
                                    [this.BASE_PATH + "/models/sculptures/two_heads.js", new THREE.Vector3(0, 1.5, -1.4),new THREE.Vector3(0, 2, -1.4)] ];
        let sculptureTextureFiles = [ this.BASE_PATH + "/images/sculptures/lupo_deer.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_dog.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_macho.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_painter.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_pig.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_rightArm.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_shortLegs.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_twoHeads.jpg" ];
        let sculptureTextMADFiles = [ this.BASE_PATH + "/images/sculptures/lupo_deer_MAD.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_dog_MAD.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_macho_MAD.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_painter_MAD.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_pig_MAD.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_rightArm_MAD.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_shortLegs_MAD.jpg",
                                      this.BASE_PATH + "/images/sculptures/lupo_twoHeads_MAD.jpg" ];

        let sculptureModels=[];
        this.sculptureMaterials=[];
        // this.sculptureTextures=[];
        this.sculptureTextures={};

        this.sculptureMADMaterials=[];
        // this.sculptureMADTextures=[];
        this.sculptureMADTextures={};

        // v.OLD
        // this.loadModelSculptures(this.BASE_PATH + "/models/base.js", this.BASE_PATH + "/models/top.js", this.BASE_PATH + "/models/down.js,")
        // .then((lupoArt) => {
        //     this.lupoArt = lupoArt;
        //     this.lupoArt.position.set(.7,-1.2,3);
        //     this.add(this.lupoArt);
        //     console.log("Loaded lupo art", this.lupoArt);
        //     // trigger rotating
        //     // TweenMax.to(this.lupoArt.rotation, 1, {x:Math.PI, repeat:-1, repeatDelay:2, yoyo:true});

        //     tl.to(this.lupoArt.rotation, 2, {x:Math.PI}).to(this.lupoArt.rotation, 2, {x:Math.PI*2}, "+=2");
        // });

        this.loadSculptureTextures( sculptureTextureFiles, sculptureTextMADFiles )
        .then( () => {

            // this.sculptureTextures = lupoArtText;
            // this.sculptureMaterials = lupoArtMat;
            console.log("Loaded lupo art materials");

            this.loadSculptureModels( sculptureModelFiles )
            .then((lupoArt) => {
                this.lupoArt = lupoArt;
                this.lupoArt.position.set(.7,-1.2,3);
                this.add(this.lupoArt);
                console.log("Loaded lupo art", this.lupoArt);

                // trigger rotating
                // tl.to(this.lupoArt.rotation, 2, {x:Math.PI}).to(this.lupoArt.rotation, 2, {x:Math.PI*2}, "+=2");

                // testing scaling animation

                // for(let i=0; i<this.lupoArt.children[0].children.length; i++){
                //     TweenMax.to(this.lupoArt.children[0].children[i].scale, 2, {x:1, y:1, z:1, delay: 10});
                // }
            });
        });

        // CACTUS!
            this.cactusPosOffsetData = [ [0,0], [0.398,1.655], [0.636,2.088], [-0.338,1.894], [-0.63,2.875],
                            [-0.609,3.692], [-0.251,3.527], [-0.586,-0.023], [-0.883,1.099], [-1.275,0.934],
                            [-1.657,1.475], [0.406,0.024], [0.938,0.877] ];
            this.cactusPosOffsetData2 = [ [0,0], [0.157,1.724], [0.645,2.238], [-0.62,1.799], [-0.419,2.056],
                                 [-1.191,2.406], [-0.139,2.723], [0.419,0.008], [0.733,1.068], [0.937,1.113],
                                 [-1.004,2.568] ];
            this.cactusAniSequence = [ [0,7,11], [3,9,12], [1,4,8], [2,5,6,10] ];
            this.cactusAniSequence2 = [ [0,7], [1,3,9], [2,4,5], [6,8,10] ];
            this.cactusAniLabel = ["1", "2", "3", "4"];

            this.cactusPot = new THREE.Object3D();
            this.cactusPot2 = new THREE.Object3D();
            this.cactusFiles = [];
            this.cactusFiles2 = [];
            this.cactusPotList = {};
            this.cactusPotList2 = {};
            this.cactusOffsetPos = [];
            this.cactusOffsetPos2 = [];
            this.cactusGroup = [];
            this.cactusTimelines = [];

            this.cactusLoadingManager = new THREE.LoadingManager();
            this.cactusLoadingManager.onLoad = () => {

                for(let i=0; i<10; i++){
                    let new_c;
                    if(i%2==0)
                        new_c = this.cactusPot.clone(true);
                    else
                        new_c = this.cactusPot2.clone(true);
                    
                    new_c.position.set(Math.random()*20, 0, Math.random()*20);
                    this.add(new_c);
                    this.cactusGroup.push(new_c);
                }
                this.createCactusAnimation();
            };


            for(let i=1; i<=13; i++){
                let fileName = this.BASE_PATH + "/models/cactus/c_" + i + ".json";
                this.cactusFiles.push( fileName );
            }
            for(let i=1; i<=11; i++){
                let fileName = this.BASE_PATH + "/models/cactus2/c_" + i + ".json";
                this.cactusFiles2.push( fileName );
            }

            for(let i=0; i<this.cactusPosOffsetData.length; i++){
                let cP = new THREE.Vector3( this.cactusPosOffsetData[i][0], this.cactusPosOffsetData[i][1], 0 );
                this.cactusOffsetPos.push(cP);
            }
            for(let i=0; i<this.cactusPosOffsetData2.length; i++){
                let cP = new THREE.Vector3( this.cactusPosOffsetData2[i][0], this.cactusPosOffsetData2[i][1], 0 );
                this.cactusOffsetPos2.push(cP);
            }

            let cactusMat = new THREE.MeshLambertMaterial({color: 0x298a59});

            // this.loadCactus1( cactusMat )
            // .then( (cactus_1) => {
            //     this.cactusPot = cactus_1;

            //     this.loadCactus2( cactusMat )
            //     .then( (cactus_2) => {
            //         this.cactusPot2 = cactus_2;

            //         // setTimeout(function(){ 
            //             for(let i=0; i<10; i++){
            //                 let new_c;
            //                 if(i%2==0)
            //                     new_c = this.cactusPot.clone(true);
            //                 else
            //                     new_c = this.cactusPot2.clone(true);
                            
            //                 new_c.position.set(Math.random()*20, 0, Math.random()*20);
            //                 this.add(new_c);
            //                 this.cactusGroup.push(new_c);
            //             }
            //             this.createCactusAnimation();
            //         // }, 3000);
            //     });
            // });

            this.loadCactus1( cactusMat );
            this.loadCactus2( cactusMat )

        this.lookupTable=[];
        for (var i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }
        this.dummy={roughValue:0};

        this.completeSequenceSetup();

        this.loadingManager.itemEnd("LupoAnim");
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    growCactus() {
        for(let i=0; i<this.cactusTimelines.length; i++){
            this.cactusTimelines[i].play();
        }
    }

    showSculptures() {
        for(let i=0; i<this.lupoArt.children[0].children.length; i++){
            let targetPos = this.lupoArt.children[0].children[i].targetPosition;
            let delayT = i*this.lookupTable[i];
            let t_scale = TweenMax.to(this.lupoArt.children[0].children[i].scale, 3, { y:1, delay: delayT, ease: RoughEase.ease.config({ template: Power0.easeNone, strength: 0.2, points: 100, taper: "out", randomize: true, clamp: false}) });  // ease: Back.easeInOut.config(0.5)
            let t_pos = TweenMax.to(this.lupoArt.children[0].children[i].position, 3, { x:targetPos.x, y:targetPos.y, z:targetPos.z, delay: delayT });
            let t_mat = TweenMax.to(this.lupoArt.children[0].children[i].material, 0.2, { opacity:1, delay: delayT });
            //
            this.tweenAnimCollectors.push(t_scale);
            this.tweenAnimCollectors.push(t_pos);
            this.tweenAnimCollectors.push(t_mat);
        }
    }

    flickerSculptureTextures() {
        let t_flicker = TweenMax.to(this.dummy, 2, { roughValue:5, 
                                     ease: RoughEase.ease.config({ template: Power0.easeNone, strength: 5, points: 100, taper: "both", randomize: true, clamp: false}),
                                     onUpdate: ()=>{this.shiftTextures()},
                                     onComplete: ()=>{this.doneShiftTextures()} });  // ease: Back.easeInOut.config(0.5)
        this.tweenAnimCollectors.push(t_flicker);
    }

    shiftTextures() {
        let target = this.lupoArt.children[0].children;
        for(let i=0; i<target.length; i++){
            if( this.dummy.roughValue>2)
                target[i].material.map = this.sculptureMADTextures[ target[i].material.map.texIndex ];
            else
                target[i].material.map = this.sculptureTextures[ target[i].material.map.texIndex ];
        }
    }

    doneShiftTextures() {
        let target = this.lupoArt.children[0].children;
        for(let i=0; i<target.length; i++){
            target[i].material.map = this.sculptureTextures[ target[i].material.map.texIndex ];
        }
    }

    rotateSculptures() {
        this.lupoArt.rotation.x = 0;
        this.tl = new TimelineMax({repeatDelay: 3, repeat: -1});
        this.tl.to(this.lupoArt.rotation, 2, {x:Math.PI})
               .to(this.lupoArt.rotation, 2, {x:Math.PI*2}, "+=2");
        //
        this.tweenAnimCollectors.push( this.tl );
    }

    shiftSculptures() {
        TweenMax.to(this.lupoArt.rotation, 2, { x:"+="+Math.PI });
        //
        this.tweenAnimCollectors.push( this.tl );
    }

    loadCactus1( mat ) {
        // let promise = new Promise( (resolve, reject) => {

            let cactusLoader = new THREE.JSONLoader( this.cactusLoadingManager );
            for(let i=0; i<this.cactusFiles.length; i++){
                cactusLoader.load( this.cactusFiles[i], (geometry)=> {
                    console.log(i);
                    let cc = new THREE.Mesh( geometry, mat );
                    cc.position.copy( this.cactusOffsetPos[i] );
                    cc.scale.multiplyScalar(0.1);
                    this.cactusPot.add(cc);
                    this.cactusPotList[i]=cc;
                    cc.visible = false;
                } );
            }
        //     resolve( cactus );
        // } );
        // return promise;
    }

    loadCactus2( mat ) {
        // let promise = new Promise( (resolve, reject) => {

            let cactusLoader = new THREE.JSONLoader( this.cactusLoadingManager );
            for(let i=0; i<this.cactusFiles2.length; i++){
                cactusLoader.load( this.cactusFiles2[i], (geometry)=> {
                    console.log(i);
                    let cc = new THREE.Mesh( geometry, mat );
                    cc.position.copy( this.cactusOffsetPos2[i] );
                    cc.scale.multiplyScalar(0.1);
                    this.cactusPot2.add(cc);
                    this.cactusPotList2[i]=cc;
                    cc.visible = false;
                } );
            }
        //     resolve( cactus );
        // } );
        // return promise;
    }

    createCactusAnimation() {
        for(let i=0; i<this.cactusGroup.length; i++){

            let tl = new TimelineMax({delay:i*0.5});
            let timeGap = 0;
            let theAniSequence;

            if(i%2==0){
                theAniSequence = this.cactusAniSequence;
            } else {
                theAniSequence = this.cactusAniSequence2;
            }

            for(let k=0; k<theAniSequence.length; k++){
                let toTween=[];
                for(let j=0; j<theAniSequence[k].length; j++){
                    let tw = this.createCactusAni( this.cactusGroup[i], theAniSequence[k][j] );
                    toTween.push(tw);
                }
                tl.add( toTween, timeGap );
                timeGap += 0.2;
            }
            tl.pause();
            this.cactusTimelines.push(tl);
        }
    }

    createCactusAni(cactusP, index) {
        // console.log(cactusP.children.length + ", " + index);
        return TweenMax.to( cactusP.children[index].scale, .5, { x:1,y:1,z:1,ease: Back.easeOut.config(1.7), onStart:()=>{
            cactusP.children[index].visible = true;
        } } );
    }

    loadSculptureTextures ( textureFiles, textureMADFiles ) {
        let promise = new Promise( (resolve, reject) => {

            let tex_loader = new THREE.TextureLoader(this.loadingManager);
            for(let i=0; i<textureFiles.length; i++){
                let _tex = tex_loader.load( textureFiles[i] );
                _tex.texIndex=i;
                _tex.name="sculptureTex_" + i;
                this.sculptureTextures[i] = _tex;

                let _mat = new THREE.MeshPhongMaterial({map: _tex, transparent: true, shininess: 100});
                this.sculptureMaterials.push( _mat );
            }
            for(let i=0; i<textureMADFiles.length; i++){
                let _tex = tex_loader.load( textureMADFiles[i] );
                _tex.texIndex=i;
                _tex.name="sculptureMadTex_" + i;
                this.sculptureMADTextures[i] = _tex;

                let _mat = new THREE.MeshPhongMaterial({map: _tex, transparent: true, shininess: 100});
                this.sculptureMADMaterials.push( _mat );
            }
            resolve();
        });
        return promise;
    }

    loadSculptureModels ( modelFiles ) {
        let promise = new Promise( (resolve, reject) => {
            let lupoArt = new THREE.Object3D();
            let lupoArtTop = new THREE.Object3D();
            let lupoArtBottom = new THREE.Object3D();
            let loader = new THREE.JSONLoader(this.loadingManager);

            for(var i = 0; i < modelFiles.length; i++){
                let modelF = modelFiles[i][0];
                let modelPos = modelFiles[i][2];
                let modelTargetPos = modelFiles[i][1];
                let matF = this.sculptureMaterials[i];
                matF.texIndex = 0;
                let matMADF = this.sculptureMADMaterials[i];

                loader.load( modelF, (geometry) => {
                    let meshhh = new THREE.Mesh( geometry, matF );
                    meshhh.scale.y = 0.01;
                    meshhh.material.opacity = 0;
                    meshhh.position.copy( modelPos );
                    // save for later use
                    meshhh.targetPosition = modelTargetPos;
                    meshhh.originalPosition = modelPos;
                    lupoArtTop.add(meshhh);

                    let meshh = new THREE.Mesh( geometry, matMADF );
                    meshh.position.copy( modelTargetPos );
                    lupoArtBottom.add(meshh);
                });
                // this.loadModels.bind(undefined, loader, i);
            }

            lupoArt.add( lupoArtTop );
            lupoArtBottom.rotation.x = Math.PI;
            lupoArt.add( lupoArtBottom );

            resolve( lupoArt );
        });
        return promise;
    }

    loadModelSculptures (model, modelT, modelB) {

        let promise = new Promise( (resolve, reject) => {
            let loader = new THREE.JSONLoader(this.loadingManager);

            loader.load(model, (geometry, material) => {

                let lupoArt = new THREE.Object3D();

                let s_base = new THREE.Mesh( geometry, this.baseMat );
                // s_base.rotation.y = 30/180*Math.PI;
                lupoArt.add( s_base );
                
                loader.load(modelT, (geometryT, materialT) => {
                    let s_top = new THREE.Mesh( geometryT, this.topMat );
                    // s_top.rotation.y = 30/180*Math.PI;
                    lupoArt.add( s_top );

                    loader.load(modelB, (geometryB, materialB) => {
                        let s_bottom = new THREE.Mesh( geometryB, this.bottomMat );
                        // s_bottom.rotation.y = 30/180*Math.PI;
                        lupoArt.add( s_bottom );

                        resolve(lupoArt);
                    });
                });
                
            });
        });
        return promise;
    }

    start() {
        this.nextAnim = this.sequenceConfig.shift();
    }

    reset() {
        // stop animation
        for(let i=0; i<this.tweenAnimCollectors.length; i++){
            this.tweenAnimCollectors[i].kill();
        }
        // clean the collector
        this.tweenAnimCollectors = [];

        // back to original status
        TweenMax.to(this.lupoArt.rotation, 1, { x:0 });
        for(let i=0; i<this.lupoArt.children[0].children.length; i++){
            let origPos = this.lupoArt.children[0].children[i].originalPosition;
            TweenMax.to(this.lupoArt.children[0].children[i].scale, 1.5, { y:0.01, delay: 1 });
            TweenMax.to(this.lupoArt.children[0].children[i].position, 1.5, { x:origPos.x, y:origPos.y, z:origPos.z, delay: 1 });
            TweenMax.to(this.lupoArt.children[0].children[i].material, 0.2, { opacity:0, delay: 1 });
        }

        // reset sequence
        this.sequenceConfig = [];
        this.sequenceConfig = this.sequenceConfigOriginal.slice(0); // copy the original setting
        this.completeSequenceSetup();

        // this.start();
    }

    updateVideoTime(time) {
        if (this.nextAnim && time >= this.nextAnim.time) {
            console.log("do anim sequence ", this.nextAnim);
            this.nextAnim.anim();
            if (this.sequenceConfig.length > 0) {
                this.nextAnim = this.sequenceConfig.shift();
            } else {
                this.nextAnim = null;
            }
        }
    }

    update(dt,et) {
    }
}

