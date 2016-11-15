import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import DebugUtil from '../util/debug'
import EndArrayPlugin from '../util/EndArrayPlugin'
TweenPlugin.activate([EndArrayPlugin]);

import SunLoader from '../sun_loader'

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

    initParticles(ref,geo) {
        let fboGeo = geo;

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
            this.treeGeo = geometry;
            this.treeMaterial = new THREE.PointsMaterial( { color: 0xffffff, size: 1 } );

            // scale, position, rotation
            let treeTransformer = [ [new THREE.Vector3(10, 10, 2), new THREE.Vector3(0,300,-50), new THREE.Vector3(Math.PI*9/8,0,Math.PI/2)]];
            
            this.trees = new THREE.Object3D();
            for(let i=0; i<treeTransformer.length; i++){
                let tree = new THREE.Points( geometry.clone(), this.treeMaterial );
                tree.scale.set( treeTransformer[i][0].x, treeTransformer[i][0].y, treeTransformer[i][0].z );
                tree.position.set( treeTransformer[i][1].x, treeTransformer[i][1].y, treeTransformer[i][1].z );
                tree.rotation.set( treeTransformer[i][2].x, treeTransformer[i][2].y, treeTransformer[i][2].z );
                this.trees.add( tree );
            }
            this.trees.scale.multiplyScalar(4);
            this.trees.position.set(-50, -130, 345);
            this.add(this.trees);
            // DebugUtil.positionObject(this.trees, "Intro TREE");

            let refObj = new THREE.Object3D();
            refObj.scale.set( 15, 15, 5 );    // 15, 15, 10 // 110, 90, 80 // 110, 90, 10
            refObj.position.set(0,250,80);    // 0,150,180 // 0,900,1100 // 0,1500,300
            refObj.rotation.set(Math.PI*9/8,0,Math.PI/2);

            this.positionsForFBO = this.initParticles( refObj, geometry );

            // this.initFBOParticle( positions );
            //
            //
            // AVNER TEST
            this.test = new SunLoader(this.renderer);
            this.test.init();
            //this.scene.add(this.test);
            this.test.position.set(0,60,0);
            //DebugUtil.positionObject(this.test, "Test particles");
        });

        this.blueprint = tex_loader.load( this.BASE_PATH + '/images/blueprint_edit.jpg' );
        this.blueprint.wrapS = THREE.RepeatWrapping;
        this.blueprint.wrapT = THREE.RepeatWrapping;
        this.blueprintMat = new THREE.MeshPhongMaterial({ map:this.blueprint, color: 0x31475e, shininess:10, shading: THREE.FlatShading});
        loader.load(this.BASE_PATH + "/models/terrain5.json", (geometry, material) => {
            this.terrain = new THREE.Mesh( geometry, this.blueprintMat ); //0x17212c

            this.terrain.scale.multiplyScalar(4);
            this.terrain.position.set(-40,-500,20);
            this.add( this.terrain );

            // DebugUtil.positionObject(this.terrain, "terrain");
        });


        // CLOUDS
        // ============== Changeable Setting ================
            this.cloudAmount = 20;
            this.cloudRadius = [180, 120, 300];
            this.cloudScale = [9, 8, 15];
            this.cloudColors = [ new THREE.Color(0xe7f6fb), new THREE.Color(0xcc0000), new THREE.Color(0x4b2a79) ];
            this.floorHeight = 0;
            this.treeRadius = 3;
        // ================ Setting End =====================
            this.cloudTex = tex_loader.load( this.BASE_PATH + "/images/cloud3.png" );
            this.cloudTex.wrapS = THREE.RepeatWrapping;
            this.cloudTex.wrapT = THREE.RepeatWrapping;
            this.cloudTex.repeat.set( 5, 3 );
            let cloudFiles = [ this.BASE_PATH + "/models/cloud1_3.json", this.BASE_PATH + "/models/cloud2_3.json" ];
            this.cloudGeos = [];
            this.cloudGroup = [];
            this.cloudMaterial = new THREE.MeshBasicMaterial({
                color: this.cloudColors[0], map: this.cloudTex, //side: THREE.DoubleSide,
                transparent: true, opacity: .2
            });

            this.loadClouds( cloudFiles )
            .then( ()=>{
                // create clouds!
                // let testCloud = new THREE.Mesh( this.cloudGeos[0], this.cloudMaterial );
                // testCloud.scale.multiplyScalar(40);
                // this.add( testCloud );
                // DebugUtil.positionObject(testCloud, "testCloud" + 0);
                
                // Ring
                for(let i=0; i<3; i++){
                    let cloudRing = new THREE.Object3D();
                    cloudRing.position.y = (i+1)*(-100);
                    
                    let tl = new TimelineMax({repeat: -1});
                    tl.to( cloudRing.rotation, 250+i*50, {
                        y: Math.PI*2,
                        ease: Power0.easeNone
                    } );
                    cloudRing.tweenline = tl;

                    this.add(cloudRing);
                    this.cloudGroup.push(cloudRing);
                    // DebugUtil.positionObject(cloudRing, "cloud Ring "+i);
                }        

                for(let i=0; i<this.cloudAmount; i++){
                    let cloudd = new THREE.Mesh( this.cloudGeos[i%2], this.cloudMaterial );
                    cloudd.position.set(
                        Math.sin(Math.PI*2/this.cloudAmount*i) * this.cloudRadius[i%3] * (1+this.lookupTable[i]/2),
                        this.lookupTable[i],
                        Math.cos(Math.PI*2/this.cloudAmount*i) * this.cloudRadius[i%3] * (1+this.lookupTable[i+1]/2)
                    );

                    cloudd.rotation.set(
                        0,
                        Math.PI*2/this.cloudAmount*i + Math.PI,
                        0,
                        'YXZ'
                    );

                    cloudd.scale.multiplyScalar( this.cloudScale[i%3] * (1+this.lookupTable[i]/2) );
                    this.cloudGroup[i%3].add(cloudd);
                }                
            } );

        //
        this.completeSequenceSetup();
        //
        this.loadingManager.itemEnd("IntroAnim");
    }

    loadClouds( cloudFiles ) {
        let loaders = [];
        for(let i=0; i<cloudFiles.length; i++){
            loaders.push( this.loadFile(this.loadingManager, cloudFiles[i]) );
        }

        let promise = new Promise( (resolve, reject)=>{
            Promise.all(loaders)
            .then((results) => {
                for(let i=0; i<results.length; i++){
                    this.cloudGeos.push( results[i] );
                }
                resolve();
            });
        } );
        return promise;
    }

    loadFile(loadingManager, path) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.JSONLoader(loadingManager);
            loader.load(path ,( geo ) => {
                resolve(geo);
            });
        });
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
                gravity: { type: "f", value: 7 }, // 7
                mouseRotation: { type: "f", value: 0 }, // 2
                squareRadius: {type: "f", value: this.sRadius*0.04},
                squareCenterX: {type: "f", value: this.sCenter.x},
                squareCenterY: {type: "f", value: this.sCenter.y},
                squareCenterZ: {type: "f", value: this.sCenter.z-70},
                bounceFactor: {type: "f", value: 2} //2
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
            transparent: false
            //blending:THREE.AdditiveBlending,
        } );

        // Particle geometry? Just once particle
        var particleGeometry  = new THREE.Geometry();
        // particleGeometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(0, -0.05, -0.1), new THREE.Vector3(0,-0.05,0.1));
        particleGeometry.vertices.push( new THREE.Vector3() );
        // particleGeometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(-0.1, -0.05, 0), new THREE.Vector3(0.1, -0.05, 0), new THREE.Vector3(0,0.1,0));

        this.fbo = new FBO();
        this.fbo.init( this.width, this.height, this.renderer, this.simulationShader, this.renderShader, particleGeometry );
        this.fbo.particles.frustumCulled = false;
        //DebugUtil.positionObject(this.fbo.particles, "Intro particles", false, -100, 100);
        this.add( this.fbo.particles );
        this.timerAnim = null;
    }

    disposeAni() {
        console.log("Intro animation - disposing");
        this.remove( this.fbo.particles );
        this.remove(this.trees);
        this.remove(this.terrain);
        
        this.fbo.particles.geometry.dispose();
        this.blueprint.dispose();
        this.blueprintMat.dispose();
        this.treeGeo.dispose();
        this.treeMaterial.dispose();

        for(var i=0; i<this.cloudGroup.length; i++){
            this.cloudGroup[i].tweenline.kill();
            this.remove(this.cloudGroup[i]);
        }
        this.cloudTex.dispose();
        this.cloudMaterial.dispose();
        for(var i=0; i<this.cloudGeos.length; i++){
            this.cloudGeos[i].dispose();
        }

        if (this.test) {
            this.remove(this.test);
        }
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
        //this.fbo.update();
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
            //this.simulationShader.uniforms.mouseRotation.value = this.timeController.rotateVelocity;
            this.fbo.update();
            this.test.update(dt,et);
        }
    }
}
