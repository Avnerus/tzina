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
            { time: 5, anim: ()=>{this.showSculptures()} },
            { time: 16, anim: ()=>{this.flickerSculptureTextures()} },  // texture flickering
            // { time: 20, anim: ()=>{this.rotateSculptures()} }        // rotate sculptures forever
            { time: 20, anim: ()=>{this.shiftSculptures()} },           // shift sculptures
            { time: 24, anim: ()=>{this.shiftSculptures()} },
            { time: 28, anim: ()=>{this.shiftSculptures()} },
            { time: 32, anim: ()=>{this.shiftSculptures()} }
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
        // if( this.dummy.roughValue>2){
        //     for(let i=0; i<this.lupoArt.children[0].children.length; i++){
        //         this.lupoArt.children[0].children[i].material.map = this.sculptureMADTextures[i];
        //         // console.log( i + ", " + this.sculptureMADTextures[i].texIndex );
        //     }
        // } else {
        //     for(let i=0; i<this.lupoArt.children[0].children.length; i++){
        //         this.lupoArt.children[0].children[i].material.map = this.sculptureTextures[i];
        //         console.log( i + ", " + this.sculptureTextures[i].texIndex );
        //     }
        // }

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

