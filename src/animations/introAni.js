import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import DebugUtil from '../util/debug'
import EndArrayPlugin from '../util/EndArrayPlugin'
TweenPlugin.activate([EndArrayPlugin]);

export default class IntroAnimation extends THREE.Object3D {
    constructor( scene, renderer, square, timeController ) {
        super();
        this.BASE_PATH = 'assets/animations/intro';

        // FBO_PARTICLES
        // ref: https://github.com/Avnerus/nao-game-client/blob/master/beam.js
        const glslify = require('glslify');

        // Shaders
        this.render_fs = glslify('../shaders/intro/render_fs.glsl');
        this.render_vs = glslify('../shaders/intro/render_vs.glsl');
        this.simulation_fs = glslify('../shaders/intro/simulation_fs.glsl');
        this.simulation_vs = glslify('../shaders/intro/simulation_vs.glsl');

        this.width = 256;
        this.height = 256;

        this.scene = scene;
        this.renderer = renderer;
        this.maxDepth = 50.0;

        this.square = square;
        this.timeController = timeController;

        console.log("FBO Constructed!")
    }

    initParticles( ref, geo ) {
        let fboGeo = geo.clone();

        if(ref != null){
            fboGeo.applyMatrix( new THREE.Matrix4().makeScale(ref.scale.x, ref.scale.y, ref.scale.z) );
            fboGeo.applyMatrix( new THREE.Matrix4().makeRotationFromEuler(ref.rotation) );
            // fboGeo.applyMatrix( new THREE.Matrix4().makeRotationY(ref.rotation.y) );
            // fboGeo.applyMatrix( new THREE.Matrix4().makeRotationZ(ref.rotation.z) );
            fboGeo.applyMatrix( new THREE.Matrix4().makeTranslation(ref.position.x, ref.position.y, ref.position.z) );
        }
        
        let data = new Float32Array( this.width * this.height * 3  );
        // let points = THREE.GeometryUtils.randomPointsInGeometry( fboGeo, this.width * this.height);
        let points = THREE.GeometryUtils.randomPointsInNoFaceGeometry( fboGeo, this.width * this.height);

        for ( var i = 0, j = 0, l = data.length; i < l; i += 3, j += 1 ) {
            data[ i ] = points[ j ].x;
            data[ i + 1 ] = points[ j ].y;
            data[ i + 2 ] = points[ j ].z;
        }
        let positions = new THREE.DataTexture( data, this.width, this.height, THREE.RGBFormat, THREE.FloatType );
        positions.needsUpdate = true;
        return positions;
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {
        this.isStarted = false;

        this.loadingManager.itemStart("IntroAnim");
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);
        let plyLoader = new THREE.PLYLoader(this.loadingManager);

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = [
            { time: 5,  anim: ()=>{this.something()} }
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();


        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        plyLoader.load(this.BASE_PATH + "/models/onetreecolorless.ply", (geometry) => {
            // geometry.computeFaceNormals();
            console.log(geometry);

            let material = new THREE.PointsMaterial( { color: 0xffffff, size: 1 } );
            let materials = [ new THREE.PointsMaterial( { color: 0xffffff, size: 1 } ),
                              new THREE.PointsMaterial( { color: 0xff0000, size: 1 } ),
                              new THREE.PointsMaterial( { color: 0x00ffff, size: 1 } ) ];

            // scale, position, rotation
            let treeTransformer = [ [new THREE.Vector3(70, 70, 10), new THREE.Vector3(0,1100,300), new THREE.Vector3(Math.PI*9/8,0,Math.PI/2)],
                                    [new THREE.Vector3(50, 50, 50), new THREE.Vector3(500,800,1000), new THREE.Vector3(Math.PI*9/8,0,Math.PI/2*(1-1/2)) ],
                                    [new THREE.Vector3(65, 40, 50), new THREE.Vector3(-500,900,1000), new THREE.Vector3(Math.PI*9/8,0,Math.PI/2*(1+1/2))] ];
            
            this.trees = new THREE.Object3D();
            for(let i=0; i<treeTransformer.length; i++){
                let tree = new THREE.Points( geometry.clone(), materials[i] );
                tree.scale.set( treeTransformer[i][0].x, treeTransformer[i][0].y, treeTransformer[i][0].z );
                tree.position.set( treeTransformer[i][1].x, treeTransformer[i][1].y, treeTransformer[i][1].z );
                tree.rotation.set( treeTransformer[i][2].x, treeTransformer[i][2].y, treeTransformer[i][2].z );
                //this.add( tree );
                this.trees.add( tree );
            }
            this.trees.scale.multiplyScalar(0.2);
            this.trees.position.y = 140;
            this.add(this.trees);
            // DebugUtil.positionObject(this.trees, "TREE");

            // this.tree = new THREE.Points( geometry, material );
            // this.tree.scale.set( 150, 130, 100 );
            // this.tree.position.set(0,1800,100);
            // this.tree.rotation.set(Math.PI,0,Math.PI/2);
            // this.add( this.tree );

            let refObj = new THREE.Object3D();
            refObj.scale.set( 15, 15, 10 );    // 110, 90, 80 // 110, 90, 10
            refObj.position.set(0,250,200);    // 0,900,1100 // 0,1500,300
            refObj.rotation.set(Math.PI*9/8,0,Math.PI/2);

            this.positionsForFBO = this.initParticles( refObj, geometry );

            this.rttIn = this.positionsForFBO;
            // this.initFBOParticle( positions );
        });

        loader.load(this.BASE_PATH + "/models/terrain4.json", (geometry, material) => {
            this.terrain = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:0x17212c, shininess:10, shading: THREE.FlatShading}) ); //0x005a78
            // this.terrain.scale.set(150,50,110);//80,50,50
            this.terrain.scale.multiplyScalar(15);
            // this.terrain.rotation.y = Math.PI;
            this.terrain.position.set(0,-3000,200);
            this.add( this.terrain );
        });

        let houseTex = tex_loader.load( this.BASE_PATH + '/images/house_lowSat.jpg' );
        let houseEmisTex = tex_loader.load( this.BASE_PATH + '/images/house_EMI.png' );
        loader.load(this.BASE_PATH + "/models/house3.json", (geometry, material) => {
            this.house = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({map:houseTex, emissiveMap:houseEmisTex, emissive:0xffff00, emissiveIntensity: 0.3}) );

            TweenMax.to(this.house.material, 2, {emissiveIntensity:1.5, repeat:-1, yoyo:true, ease: RoughEase.ease.config({ template: Power0.easeNone, strength: 1, points: 20, taper: "none", randomize: true, clamp: false})});

            this.house.scale.multiplyScalar(15);//80,50,50
            // this.terrain.rotation.y = Math.PI;
            this.house.position.set(0,-3000,200);
            this.add( this.house );
        });


        this.completeSequenceSetup();
        //
        this.loadingManager.itemEnd("IntroAnim");
    }

    initFBOParticle() {
        // get square data: radius & center
        let squareMesh = this.square.getSphereMesh();
        console.log(squareMesh.geometry.boundingSphere);
        this.sRadius = squareMesh.geometry.boundingSphere.radius;
        this.sCenter = squareMesh.geometry.boundingSphere.center;
        console.log("Square radius ", this.sRadius, "Center: ", this.sCenter);

        this.simulationShader = new THREE.ShaderMaterial({
            uniforms: {
                positions: { type: "t", value: this.positionsForFBO },
                deltaTime: { type: "f", value: 0 },
                maxDepth : { type: "f", value: this.maxDepth },
                maxDistance: { type: "f", value: 50 },
                amplitude: { type: "f", value: 0 }, // 0.2
                frequency: { type: "f", value: 1 },
                gravity: { type: "f", value: 12.5 }, // 2
                mouseRotation: { type: "f", value: 0 }, // 2
                squareRadius: {type: "f", value: this.sRadius*7.5},
                squareCenterX: {type: "f", value: this.sCenter.x},
                squareCenterY: {type: "f", value: this.sCenter.y},
                squareCenterZ: {type: "f", value: this.sCenter.z},
                bounceFactor: {type: "f", value: 2}
            },
            vertexShader: this.simulation_vs,
            fragmentShader:  this.simulation_fs,
        });

        this.renderShader = new THREE.ShaderMaterial( {
            uniforms: {
                positions: { type: "t", value: null },
                pointSize: { type: "f", value: 1 }
            },
            vertexShader: this.render_vs,
            fragmentShader: this.render_fs,
            transparent: true,
            blending:THREE.AdditiveBlending,
        } );

        // Particle geometry? Just once particle
        var particleGeometry  = new THREE.Geometry();
        // particleGeometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(0, -0.05, -0.1), new THREE.Vector3(0,-0.05,0.1));
        particleGeometry.vertices.push( new THREE.Vector3() );
        // particleGeometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(-0.1, -0.05, 0), new THREE.Vector3(0.1, -0.05, 0), new THREE.Vector3(0,0.1,0));

        this.fbo = new FBO();
        this.fbo.init( this.width,this.height, this.renderer, this.simulationShader, this.renderShader, particleGeometry );
        this.add( this.fbo.particles );
        this.timerAnim = null;
        this.fbo.particles.position.y = 1500;
        this.fbo.update();
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
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
        this.isStarted = true;
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
        if(this.isStarted){
            // test
            this.simulationShader.uniforms.deltaTime.value = dt;
            this.simulationShader.uniforms.mouseRotation.value = this.timeController.rotateVelocity;
            this.fbo.update();
        }
    }
}
