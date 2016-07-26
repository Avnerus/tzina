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

        this.loadModelSculptures(this.BASE_PATH + "/models/base.js", this.BASE_PATH + "/models/top.js", this.BASE_PATH + "/models/down.js")
        .then((lupoArt) => {
            this.lupoArt = lupoArt;
            this.lupoArt.position.set(.7,-1.2,3);
            this.add(this.lupoArt);
            console.log("Loaded lupo art", this.lupoArt);
            // trigger rotating
            // TweenMax.to(this.lupoArt.rotation, 1, {x:Math.PI, repeat:-1, repeatDelay:2, yoyo:true});

            tl.to(this.lupoArt.rotation, 2, {x:Math.PI}).to(this.lupoArt.rotation, 2, {x:Math.PI*2}, "+=2");
        });

        this.loadingManager.itemEnd("LupoAnim");
    }

    initParticles() {
        let p_tex_loader = new THREE.TextureLoader(this.loadingManager);
        let particleTex = p_tex_loader.load(this.BASE_PATH + '/images/dandelion_particle.jpg');

        this.particleGroup = new SPE.Group({
            texture: {
                value: particleTex
            },
            depthTest: false
        });

        // reduce emitter amount to be 1/5 of domeMorphTargets.length
        for(let i = 0; i < this.domeMorphTargets.length-10; i+=10){
            let emitter = new SPE.Emitter({
                type: SPE.distributions.SPHERE,
                // duration: 10,
                maxAge: {
                    value: 10,
                    spread: 2
                },
                position: {
                    value: this.domeMorphTargets[i].mesh.position,
                    radius: 0.2,
                    // spread: new THREE.Vector3(1,1,1),
                    // radiusScale: new THREE.Vector3(1,1,1),
                    // distribution: SPE.distributions.SPHERE
                },
                acceleration: {
                    value: new THREE.Vector3(0,-0.5,0),
                    // spread: new THREE.Vector3(0.5,-0.8,0.5)
                },
                velocity: {
                    value: new THREE.Vector3(0.3,-0.3,0.3)
                    // distribution: SPE.distributions.SPHERE
                },
                rotation: {
                    angle: 0.5
                },
                angle: {
                    value: [0,0.5,-0.5],
                    spread: [0,-0.5,0.5]
                },
                // color: {
                // 	value: new THREE.Color( 0xAA4488 )
                // },
                opacity: {
                    value: [0,1,1,1,0]
                },
                size: {
                    value: [.05,.25,.25,.25,.15]
                    // spread: [1,3]
                },
                particleCount: 3,
                drag: 0.6
                // wiggle: 15
                // isStatic: true
            });
            this.particleGroup.addEmitter( emitter );
        }
        console.log(this.particleGroup.emitters.length);
        this.add( this.particleGroup.mesh );
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

