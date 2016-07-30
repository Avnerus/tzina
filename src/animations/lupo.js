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

        let tl = new TimelineMax({delay: 5, repeatDelay: 3, repeat: -1});


        let p_tex_loader = new THREE.TextureLoader(this.loadingManager);

        this.baseMat = new THREE.MeshLambertMaterial( { color: 0x9f43fa, wireframe: true } );
        this.bottomMat = new THREE.MeshLambertMaterial( { color: 0x43fa9f} );
        this.topMat = new THREE.MeshLambertMaterial( { color: 0xfa9f43} );

        let modelLoader = new THREE.JSONLoader(this.loadingManager);

        let sculptureModelFiles = [ this.BASE_PATH + "/models/sculptures/deer.js",
                                    this.BASE_PATH + "/models/sculptures/dog.js",
                                    this.BASE_PATH + "/models/sculptures/macho.js",
                                    this.BASE_PATH + "/models/sculptures/painter.js",
                                    this.BASE_PATH + "/models/sculptures/pig.js",
                                    this.BASE_PATH + "/models/sculptures/right_arm.js",
                                    this.BASE_PATH + "/models/sculptures/short_legs.js",
                                    this.BASE_PATH + "/models/sculptures/two_heads.js" ];
        let sculptureTextureFiles = [ this.BASE_PATH + "/images/sculptures/lupo_deer.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_dog.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_macho.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_painter.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_pig.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_rightArm.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_shortLegs.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_twoHeads.png" ];
        let sculptureTextMADFiles = [ this.BASE_PATH + "/images/sculptures/lupo_deer_MAD.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_dog_MAD.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_macho_MAD.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_painter_MAD.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_pig_MAD.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_rightArm_MAD.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_shortLegs_MAD.png",
                                      this.BASE_PATH + "/images/sculptures/lupo_twoHeads_MAD.png" ];

        let sculptureModels=[];
        this.sculptureMaterials=[];
        this.sculptureTextures=[];
        this.sculptureMADMaterials=[];
        this.sculptureMADTextures=[];

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
            // console.log("Loaded lupo art materials", lupoArtMat);

            this.loadSculptureModels( sculptureModelFiles )
            .then((lupoArt) => {
                this.lupoArt = lupoArt;
                this.lupoArt.position.set(.7,-1.2,3);
                this.add(this.lupoArt);
                console.log("Loaded lupo art", this.lupoArt);
                // trigger rotating
                tl.to(this.lupoArt.rotation, 2, {x:Math.PI}).to(this.lupoArt.rotation, 2, {x:Math.PI*2}, "+=2");
            });
        });

        this.loadingManager.itemEnd("LupoAnim");
    }

    loadSculptureTextures ( textureFiles, textureMADFiles ) {
        let promise = new Promise( (resolve, reject) => {
            // this.sculptureTextures = lupoArtText;
            // this.sculptureMaterials = lupoArtMat;
            // let lupoArtText=[];
            // let lupoArtMat=[];
            let tex_loader = new THREE.TextureLoader(this.loadingManager);
            for(let i=0; i<textureFiles.length; i++){
                let _tex = tex_loader.load( textureFiles[i] );
                this.sculptureTextures.push( _tex );
                let _mat = new THREE.MeshPhongMaterial({map: _tex, transparent: true, shininess: 200});
                this.sculptureMaterials.push( _mat );
            }
            for(let i=0; i<textureMADFiles.length; i++){
                let _tex = tex_loader.load( textureMADFiles[i] );
                this.sculptureMADTextures.push( _tex );
                let _mat = new THREE.MeshPhongMaterial({map: _tex, transparent: true, shininess: 200});
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
                let modelF = modelFiles[i];
                let matF = this.sculptureMaterials[i];
                let matMADF = this.sculptureMADMaterials[i];
                loader.load( modelFiles[i], (geometry) => {
                    let meshhh = new THREE.Mesh( geometry, matF );
                    lupoArtTop.add(meshhh);

                    let meshh = new THREE.Mesh( geometry, matMADF );
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

    update(dt,et) {
        // ...
    }
}

