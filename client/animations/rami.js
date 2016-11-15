import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import EndArrayPlugin from '../util/EndArrayPlugin'
TweenPlugin.activate([EndArrayPlugin]);
import DebugUtil from '../util/debug'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'

export default class RamiAnimation extends THREE.Object3D {
    constructor( renderer ) {
        super();
        this.BASE_PATH = 'assets/animations/rami';

        // FBO_PARTICLES
        // ref: https://github.com/Avnerus/nao-game-client/blob/master/beam.js
        const glslify = require('glslify');

        // Shaders
        this.render_fs = glslify('../shaders/rami/render_fs.glsl');
        this.render_vs = glslify('../shaders/rami/render_vs.glsl');
        this.simulation_fs = glslify('../shaders/rami/simulation_fs.glsl');
        this.simulation_vs = glslify('../shaders/rami/simulation_vs.glsl');

        this.width = 256;
        this.height = 256;

        this.renderer = renderer;
        this.maxDepth = 50.0;
    }

    initParticles( geo ) {
        this.peacock.matrixWorldNeedsUpdate = true;

        let fboGeo = geo.clone();

        fboGeo.applyMatrix( new THREE.Matrix4().makeScale(this.fboRefObj.scale.x, this.fboRefObj.scale.y, this.fboRefObj.scale.z) );
        // fboGeo.applyMatrix( new THREE.Matrix4().makeRotationFromEuler(ref.rotation) );
        fboGeo.applyMatrix( new THREE.Matrix4().makeTranslation(this.fboRefObj.position.x, this.fboRefObj.position.y, this.fboRefObj.position.z) );

        let data = new Float32Array( this.width * this.height * 3  );
        let points = THREE.GeometryUtils.indexedPointsInGeometry( fboGeo, this.width * this.height, this.indexArray );
        for ( var i = 0, j = 0, l = data.length; i < l; i += 3, j += 1 ) {
            data[ i ] = points[ j ].x;
            data[ i + 1 ] = points[ j ].y;
            data[ i + 2 ] = points[ j ].z;
        }
        let positions = new THREE.DataTexture( data, this.width, this.height, THREE.RGBFormat, THREE.FloatType );
        positions.needsUpdate = true;
        
        return positions;
    }

    initParticlesFirstEver( geo ) {
        this.peacock.matrixWorldNeedsUpdate = true;

        let fboGeo = geo.clone();
        fboGeo.applyMatrix( new THREE.Matrix4().makeScale(0.1,0.1,0.1) );
        // fboGeo.applyMatrix( new THREE.Matrix4().makeScale(this.fboRefObj.scale.x, this.fboRefObj.scale.y, this.fboRefObj.scale.z) );
        // fboGeo.applyMatrix( new THREE.Matrix4().makeRotationFromEuler(ref.rotation) );
        fboGeo.applyMatrix( new THREE.Matrix4().makeTranslation(this.fboRefObj.position.x, this.fboRefObj.position.y, this.fboRefObj.position.z) );

        let data = new Float32Array( this.width * this.height * 3  );

        let results = THREE.GeometryUtils.randomPointsAndIndexInGeometry( fboGeo, this.width * this.height);
        let points = results[0];
        this.indexArray = results[1];

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

        this.animStart = false;
        this.sequenceConfig = [
            { time: 1, anim: ()=>{this.peacockTail(5)} },
            { time: 20, anim: ()=>{this.peacockBack(5)} },
            { time: 35, anim: ()=>{this.peacockOpen(5)} },
            { time: 50, anim: ()=>{this.peacockBun(5)} },
            { time: 65, anim: ()=>{this.peacockSwallow(5)} },
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
        peacockTex.wrapS = THREE.RepeatWrapping;
        peacockTex.wrapT = THREE.RepeatWrapping;
        peacockTex.repeat.set( 1,2 );

        let feathersTex = tex_loader.load( this.BASE_PATH + "/images/pea.jpg" );
        feathersTex.wrapS = THREE.RepeatWrapping;
        feathersTex.wrapT = THREE.RepeatWrapping;
        feathersTex.repeat.set( 5, 5 );

        let grassTex = tex_loader.load( this.BASE_PATH + "/images/redlight-thin.jpg" );
        this.peacockMaterial = new THREE.MeshPhongMaterial({ map: peacockTex,
                                                            // blending: THREE.AdditiveBlending,
                                                            specular: 0x630824,
                                                            shininess: 77,
                                                            specularMap: grassTex,
                                                            side: THREE.DoubleSide,
                                                            wireframe: true,
                                                            wireframeWidth: 2,                                                            
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
            let peacockGeo = this.peacockGeos[4];

            for(let i=0; i<4; i++){
                peacockGeo.morphTargets.push({name: 'p'+i, vertices: this.peacockGeos[i].vertices});
            }
            peacockGeo.computeMorphNormals();
            this.peacock = new THREE.Mesh( peacockGeo, this.peacockMaterial );
            this.peacock.position.set(0.9, -5, -5);
            this.peacock.scale.multiplyScalar(3);
            this.add(this.peacock);
            // DebugUtil.positionObject(this.peacock, "peacock");
            this.peacock.morphTargetInfluences[0] = 1;

            this.fboRefObj = new THREE.Object3D();
            this.fboRefObj.scale.multiplyScalar(3);
            this.fboRefObj.position.set(0.9, -5, -5);

            this.initFBOParticles();
        };
        this.loadPeacocks( peacockFiles );

        this.initSPEParticles();

        var light = new THREE.PointLight( 0xffffff, .5, 100 );
        light.position.set( 0, 1.5, 3.5 );
        // DebugUtil.positionObject(light, "Rami Light");
        this.add( light );            

        // DebugUtil.positionObject(this, "Rami Ani");
        //
        this.loadingManager.itemEnd("RamiAnim");
    }

    initFBOParticles() {
        let positions = this.initParticlesFirstEver( this.peacockGeos[4] );
        let morphPositions = this.initParticles( this.peacockGeos[0] );
        this.rttIn = positions;

        this.simulationShader = new THREE.ShaderMaterial({
            uniforms: {
                positions: { type: "t", value: positions },
                timer: { type: "f", value: 0 },
                maxDepth : { type: "f", value: this.maxDepth },
                morphPositions: { type: "t", value: morphPositions },
                maxDistance: { type: "f", value: 50 },
                amplitude: { type: "f", value: 0.001 },
                frequency: { type: "f", value: 0.8 }
            },
            vertexShader: this.simulation_vs,
            fragmentShader:  this.simulation_fs,
        });

        this.renderShader = new THREE.ShaderMaterial( {
            uniforms: {
                positions: { type: "t", value: null },
                pointSize: { type: "f", value: 2 }
            },
            vertexShader: this.render_vs,
            fragmentShader: this.render_fs,
            transparent: true,
            blending:THREE.AdditiveBlending
        } );

        var particleGeometry  = new THREE.Geometry();
        particleGeometry.vertices.push( new THREE.Vector3() );

        this.fbo = new FBO();
        this.fbo.init( this.width,this.height, this.renderer, this.simulationShader, this.renderShader, particleGeometry );
        this.fbo.particles.frustumCulled = false;
        this.add( this.fbo.particles );

        // this.fbo.particles.position.set(0.8, -3.84, -4.44);
        // this.fbo.particles.multiplyScalar(2.58);

        DebugUtil.positionObject(this.fbo.particles, "Rami FBO");
        console.log(this.simulationShader.uniforms.timer);
        events.emit("add_gui", {folder:"fbo timer", listen: true, step: 0.01}, this.simulationShader.uniforms.timer, "value", 0, 1);

        this.timerAnim = null;

        this.fbo.update();
    }

    loadPeacocks( files ) {
        let pLoader = new THREE.JSONLoader(this.ramiLoadingManager);
        for(let i=0; i<files.length; i++){
            pLoader.load(files[i], (geometry)=>{
                this.peacockGeos[i] = geometry;
            });
        }
    }

    initSPEParticles() {
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
                    value: new THREE.Vector3(0, 0, -4),
                    radius: 1
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
                    spread: [0,-1.5,1.5]
                },
                opacity: {
                    value: [0,1,1,1,0]
                },
                size: {
                    value: [.05, .15, .15, .15, .1]
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

    peacockTail (_duration) {
        this.createTransition(_duration, [0.8, 0, 0, 0] );

        this.updateMorphForFBO(this.peacockGeos[0], _duration);
        this.updateMorphTransitionForFBO(this.peacockGeos[0], _duration);
    }

    peacockBack (_duration) {
        this.createMorph( _duration, [0, 1, 0, 0] );
        this.createTransition(_duration, [0.3, 0.8, 0, 0] );

        this.updateMorphForFBO(this.peacockGeos[1], _duration);
        this.updateMorphTransitionForFBO(this.peacockGeos[0], _duration);
    }

    peacockOpen (_duration) {
        this.createMorph( _duration, [0, 0, 1, 0] );
        this.createTransition(_duration, [0, 0.2, 0.8, 0] );

        this.updateMorphForFBO(this.peacockGeos[2], _duration);
        this.updateMorphTransitionForFBO(this.peacockGeos[2], _duration);
    }

    peacockBun (_duration) {
        this.createMorph( _duration, [0, 0, 0, 1] );
        this.createTransition(_duration, [0, 0, 0.2, 0.8] );

        this.updateMorphForFBO(this.peacockGeos[3], _duration);
        this.updateMorphTransitionForFBO(this.peacockGeos[3], _duration);
    }

    peacockSwallow (_duration) {
        this.createMorph( _duration, [0, 0, 0, 0] );
        this.createTransition(_duration, [0, 0, 0, 0.2] );

        this.updateMorphForFBO(this.peacockGeos[4], _duration);
        this.updateMorphTransitionForFBO(this.peacockGeos[4], _duration);

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
        TweenMax.to( this.peacock.morphTargetInfluences, _duration/2, {
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

    updateMorphForFBO(geo, _duration) {
        let morphPositions = this.initParticles( geo );
        this.simulationShader.uniforms.morphPositions.value = morphPositions;
        
        TweenMax.fromTo(this.simulationShader.uniforms.timer, _duration, {value:0}, {value:0.3, ease: Power3.easeIn});
    }

    updateMorphTransitionForFBO( toGeo, _duration) {
        // let fromPositions = this.initParticles( fromGeo );
        let morphPositions = this.initParticles( toGeo );

        // this.simulationShader.uniforms.positions.value = fromPositions;
        // this.simulationShader.uniforms.morphPositions.value = morphPositions;
        
        TweenMax.fromTo(this.simulationShader.uniforms.timer, _duration/4, {value:0.3}, {
            value: 0.0,
            ease: Power0.easeNone,
            delay: _duration,
            repeat: 3,
            yoyo: true
        });
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

        // FBO
        this.fbo.update();
    }
}
