import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import EndArrayPlugin from '../util/EndArrayPlugin'
import DebugUtil from '../util/debug'
TweenPlugin.activate([EndArrayPlugin]);

export default class ShirinAnimation extends THREE.Object3D {
    constructor( config ) {
        super();
        this.config = config;
        this.BASE_PATH = this.config.assetsHost + 'assets/animations/shirin';
        this.initialized = false;
    }

    init(loadingManager) {
        this.callbackAfterLoaded = true;

        this.initialized = true;
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = {
            'Shirin7AM': [
                { time: 5, anim: ()=>{this.crackCocoon(0)} },
                { time: 8,  anim: ()=>{this.stopFragment(0)} }
            ],
            'Shirin9AM': [
                { time: 5, anim: ()=>{this.crackCocoon(4)} },
                { time: 8,  anim: ()=>{this.stopFragment(4)} }
            ],
            'Shirin12PM': [
                { time: 5, anim: ()=>{this.crackCocoon(3)} },
                { time: 8,  anim: ()=>{this.stopFragment(3)} }
            ],
            'Shirin5PM': [
                { time: 5, anim: ()=>{this.crackCocoon(1)} },
                { time: 8,  anim: ()=>{this.stopFragment(1)} }
            ],
            'Shirin7PM': [
                { time: 1, anim: ()=>{this.crackCocoon(2)} },
                { time: 3, anim: ()=>{this.showShirin()} },
                { time: 77, anim: ()=>{this.closeCocoon(2)} },
                { time: 80,  anim: ()=>{this.stopFragment(2)} }
            ]
        };
        // v.1
        /*
        this.sequenceConfig = [
            // { time: 0.5, anim: ()=>{this.pauseVideo()} },

            { time: 5, anim: ()=>{this.crackCocoon(0)} },
            { time: 8,  anim: ()=>{this.stopFragment(0)} },

            { time: 10, anim: ()=>{this.crackCocoon(1)} },
            { time: 13,  anim: ()=>{this.stopFragment(1)} },

            { time: 15, anim: ()=>{this.crackCocoon(2)} },
            { time: 18,  anim: ()=>{this.stopFragment(2)} },

            { time: 20, anim: ()=>{this.crackCocoon(3)} },
            { time: 23,  anim: ()=>{this.stopFragment(3)} },

            { time: 25, anim: ()=>{this.crackCocoon(4)} },
            { time: 28,  anim: ()=>{this.stopFragment(4)} }
        ];*/
        this.nextAnim = null;
        this.tweenAnimCollectors = [];

        this.completeSequenceSetup();

        this.loadingManager.itemStart("ShirinAnim");

        //        
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        // --------------PARAMETER------ TO_BE_CHANGED!!!
            this.benchHeight = -5;
            this.branchWebPos = new THREE.Vector3( 0,18,-2 );
            this.candyHeight = 15;
            this.candyGroupPos = new THREE.Vector3( -12,0,0 );
            this.cocoonGroupPos = new THREE.Vector3( 0,25,0 );
            this.cobwebGroupPos = new THREE.Vector3( 14,10,0 );
            this.smallShirinPos = new THREE.Vector3( 0.05, -0.24, 0.64 );
        //
        let webTexture = tex_loader.load( this.BASE_PATH + "/images/web2.jpg" );
        this.webMat = new THREE.MeshBasicMaterial({map: webTexture, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending});
        loader.load( this.BASE_PATH + "/models/branchWeb.json", (geometry) => {
            this.branchWeb = new THREE.Mesh( geometry, this.webMat );
            this.branchWeb.scale.multiplyScalar(3);
            this.branchWeb.position.copy(this.branchWebPos);
            this.add(this.branchWeb);
        });

        //
        this.candyGroup = new THREE.Object3D();
        this.candyTimeline = [];
        let candyTexture = tex_loader.load( this.BASE_PATH + "/images/candy_texture.jpeg" );
        this.candyMats = [ new THREE.MeshPhongMaterial({map: candyTexture, shininess: 30}),
                           new THREE.MeshPhongMaterial({map: candyTexture, shininess: 30, color: 0x00ff00}),
                           new THREE.MeshPhongMaterial({map: candyTexture, shininess: 30, color: 0x00ffff}) ];
        loader.load( this.BASE_PATH + "/models/candy.json", (geometry) => {
            let candyGeo = geometry;
            for(let i=0; i<20; i++){
                let candyy = new THREE.Mesh( candyGeo, this.candyMats[i%3] );
                candyy.scale.multiplyScalar(0.01);
                candyy.position.set( Math.sin( Math.PI*2/10*i)*3,
                                               10-10*this.lookupTable[i] + this.candyHeight,
                                               Math.cos(Math.PI*2/10*i)*3 );
                candyy.rotation.set( this.lookupTable[i], this.lookupTable[i+1], this.lookupTable[i+2] );
                this.candyGroup.add(candyy);
            }
            this.candyGroup.position.copy(this.candyGroupPos);
            this.add(this.candyGroup);

            this.createCandyAnimation();
        });

        // MOON
        let moonTexture = tex_loader.load( this.BASE_PATH + "/images/moon.jpg" );
        let moonNRMTexture = tex_loader.load( this.BASE_PATH + "/images/moonNormal.jpg" );
        let moonMat = new THREE.MeshPhongMaterial({map: moonTexture, normalMap: moonNRMTexture, emissive: 0x111111});
        this.moon = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 32), moonMat);
        this.moon.rotation.set(Math.PI/2, Math.PI/2, Math.PI/2);
        // MOON location
            // console.log(this.parent);
            // if( this.parent.config.platform=="desktop" ){
            //     this.moon.position.y = 200;
            // } else {
                this.moon.position.set(900,480,345);
                this.moon.scale.set(3.3,3.3,3.3);
            // }
        this.add( this.moon );
        DebugUtil.positionObject(this.moon, "moon");

        //
        let cocoonTexFiles = [ this.BASE_PATH + "/images/seamless_circle.png",
                               this.BASE_PATH + "/images/seamless_color_noise.jpg",
                               this.BASE_PATH + "/images/seamless_curvy.jpg",
                               this.BASE_PATH + "/images/seamless_graphic.jpg",
                               this.BASE_PATH + "/images/seamless_pencil.jpg" ];
        let cocoonTextures = [];
        let grassTex = tex_loader.load( this.BASE_PATH + "/images/grasslight-thin.jpg" );
        this.cocoonMaterials = [];
        for(let i=0; i<cocoonTexFiles.length; i++){
            cocoonTextures[i] = tex_loader.load( cocoonTexFiles[i] );
            this.cocoonMaterials[i] = new THREE.MeshPhongMaterial({ map: cocoonTextures[i],
                                                                    specular: 0x04340d,
                                                                    shininess: 77,
                                                                    specularMap: grassTex,
                                                                    side: THREE.DoubleSide,
                                                                    morphTargets: true,
                                                                    morphNormals: true });
        }

        let cocoonFiles = [], cocoonCrackFiles = [], caterpillarFiles = [];
        this.cocoonGeos = {};
        this.cocoonCrackGeos = {};
        this.caterpillarGeos = {};
        this.cocoonGroup = new THREE.Object3D();
        this.cocoonAnimation = [];

        this.caterpillarGroup = [];
        this.cobwebGeos = [];
        this.cobwebGroup = new THREE.Object3D();
        this.cobwebPos = [];

        for(let i=1; i<=5; i++){
            let f_1 = this.BASE_PATH + "/models/cocoon/cocoon_" + i + ".json";
            let f_2 = this.BASE_PATH + "/models/cocoon/cocoon_" + i + "_O.json";
            let f_3 = this.BASE_PATH + "/models/cocoon/ca_" + i + ".json";
            cocoonFiles.push( f_1 );
            cocoonCrackFiles.push( f_2 );
            caterpillarFiles.push( f_3 );
        }
        this.shirinLoadingManager = new THREE.LoadingManager();
        this.shirinLoadingManager.onLoad = ()=>{

            // create cocoon
            let cocoonLength = Object.keys(this.cocoonGeos).length;
            for(let i=0; i<cocoonLength; i++){
                let cocoonGeo = this.cocoonGeos[i].clone();
                cocoonGeo.morphTargets.push({name: 'c1', vertices: this.cocoonCrackGeos[i].vertices});
                cocoonGeo.computeMorphNormals();

                let cocooonnn = new THREE.Mesh( cocoonGeo, this.cocoonMaterials[i] );
                cocooonnn.position.x = (i-2)*2.5;
                // TweenMax.to( cocooonnn.morphTargetInfluences, 2, { endArray: [1], yoyo: true, repeat:-1, repeatDelay: 1,
                //                                                    ease: RoughEase.ease.config({ template:  Power0.easeNone, 
                //                                                                                  strength: 1, points: 20, taper: "none",
                //                                                                                  randomize:  true, clamp: false}) });
                this.cocoonGroup.add( cocooonnn );
            }
            this.cocoonGroup.scale.multiplyScalar(5);
            this.cocoonGroup.position.copy(this.cocoonGroupPos);
            this.add(this.cocoonGroup);
            // hide all the cocoon except 7pm
            for(var i=0; i<this.cocoonGroup.children.length; i++){
                if(i==2){
                    this.cocoonGroup.children[i].rotation.x = 233 * Math.PI/180;
                    this.cocoonGroup.children[i].rotation.y = 14 * Math.PI/180;
                    // DebugUtil.positionObject(this.cocoonGroup.children[i], "cocoon");
                    this.cocoonGroup.children[i].position.set(0.02, -9.48, -1.82);
                    this.cocoonGroup.children[i].scale.set(1.55, 1.55, 1.55);
                }else{
                    this.cocoonGroup.children[i].visible = false;
                }
            }

            this.initSPEParticles( tex_loader );

            // create caterpillars
                let caterMat = new THREE.MeshPhongMaterial({ color: 0x01700e,
                                                            specular: 0x550202,
                                                            shininess: 50,
                                                            morphTargets: true,
                                                            morphNormals: true });
                let stringGeo = new THREE.BoxGeometry(.07, 50, .07);
                this.transY(stringGeo,23);
                let stringMat = new THREE.MeshPhongMaterial({ color: 0x550202 });

                for(let i=0; i<10; i++){
                    let caterGeo = this.cocoonGeos[i%5].clone();
                    caterGeo.morphTargets.push({name: 'c1', vertices: this.caterpillarGeos[i%5].vertices});
                    caterGeo.computeMorphNormals();

                    let caterpillaaa = new THREE.Mesh( caterGeo, caterMat.clone() );
                    caterpillaaa.scale.multiplyScalar(.01);
                    caterpillaaa.position.set( Math.sin(Math.PI*2/10*i)*5,
                                               10-10*Math.random()+50,
                                               Math.cos(Math.PI*2/10*i)*5 );
                    caterpillaaa.rotation.y = this.lookupTable[i];

                    // string!
                        let string = new THREE.Mesh(stringGeo, stringMat);
                        caterpillaaa.add(string);

                    this.add(caterpillaaa);
                    this.caterpillarGroup.push( caterpillaaa );

                    // create Cobweb
                        let cobwebb = new THREE.Mesh( this.cobwebGeos[i%5], this.webMat );
                        cobwebb.scale.multiplyScalar(.01);
                        this.cobwebPos.push( new THREE.Vector3( Math.sin(Math.PI*2/10*i)*7,
                                                                10-10*Math.random(),
                                                                Math.cos(Math.PI*2/10*i)*7 ) );
                        cobwebb.rotation.y = this.lookupTable[i];
                        this.cobwebGroup.add(cobwebb);
                }
                this.cobwebGroup.position.copy( this.cobwebGroupPos );
                this.add(this.cobwebGroup);
                // DebugUtil.positionObject(this.cobwebGroup, "cobweb");

                this.cobwebsScale = [
                    new THREE.Vector3(0.5, 3, 7),
                    new THREE.Vector3(6, 3, .5),
                    new THREE.Vector3(1.2, 3, 7),
                    new THREE.Vector3(5.4, 2.6, 0.5),
                    new THREE.Vector3(3.7, 2.7, 1)
                ];
        }
        this.loadcocoon( cocoonFiles, cocoonCrackFiles, caterpillarFiles );

        // DebugUtil.positionObject(this, "Shirin Ani");
        //
        this.loadingManager.itemEnd("ShirinAnim");
    }

    initSPEParticles( _tex_loader ) {
        this.particleGroup = new SPE.Group({
            texture: {
                value: _tex_loader.load( this.BASE_PATH + '/images/fragments.png'),
                frames: new THREE.Vector2(3,3),
                frameCount: 9,
                loop: 5
            },
            maxParticleCount: 2000
        });

        for(let i = 0; i < this.cocoonGroup.children.length; i++){
            let particlePosition = this.cocoonGroup.children[i].position.clone();
            particlePosition.multiplyScalar(5);
            particlePosition.y = this.cocoonGroup.position.y - 6;

            let emitter = new SPE.Emitter({
                type: SPE.distributions.BOX,
                // duration: 10,
                maxAge: {
                    value: 7,
                    spread: 2
                },
                position: {
                    value: particlePosition,
                    spread: new THREE.Vector3(4,0,3)
                },
                acceleration: {
                    value: new THREE.Vector3(0,-2,0), //0,-.4,0
                    spread: new THREE.Vector3(.1,1,.1) // .1,.3,.1
                },
                opacity: {
                    value: [0,1,1,1,0]
                },
                size: {
                    value: [0.02, 0.3, 0.3, 0.3, .2], // 0.1,5,5,5,3    // 0.1,1,1,1,.5
                    spread: 0.5 // 2
                },
                particleCount: 120 //60
            });
            emitter.activeMultiplier = 0.5;
            emitter.disable();

            this.particleGroup.addEmitter( emitter );
        }
        this.add( this.particleGroup.mesh );
    }

    loadcocoon( files, files2, files3 ) {
        let cocoonLoader = new THREE.JSONLoader( this.shirinLoadingManager );
        for(let i=0; i<files.length; i++){
            cocoonLoader.load( files[i], (geometry)=>{
                this.cocoonGeos[i] = geometry;

                this.cobwebGeos[i] = geometry.clone();
            });
        }

        for(let i=0; i<files2.length; i++){
            cocoonLoader.load( files2[i], (geometry)=>{
                this.cocoonCrackGeos[i] = geometry;
            });
        }

        for(let i=0; i<files3.length; i++){
            cocoonLoader.load( files3[i], (geometry)=>{
                this.caterpillarGeos[i] = geometry;
            });
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

    pauseVideo() {
        //this.parent.fullVideo.pause();
        this.parent.fullVideo.mesh.position.y += 2;
        this.parent.fullVideo.wire.position.y += 2;

        setTimeout( ()=>{
            this.crackCocoon(0);
            this.parent.fullVideo.mesh.position.y -= 2;
            this.parent.fullVideo.wire.position.y -= 2;
        }, 5000 );

        setTimeout( ()=>{
            this.stopFragment(0);
          //  this.parent.fullVideo.play();
        }, 8000 );
    }

    closeCocoon(index) {
        this.particleGroup.emitters[index].activeMultiplier = 1;

        var newEPos = this.particleGroup.emitters[2].position.value;
        newEPos.y -= 9;
        newEPos.z += 18;
        this.particleGroup.emitters[2].position.value = newEPos;

        setTimeout( (_index)=>{
            this.resetFragment(_index);

            var newEPos2 = this.particleGroup.emitters[2].position.value;
            newEPos2.y += 9;
            newEPos2.z -= 18;
            this.particleGroup.emitters[2].position.value = newEPos2;

        }, 3000, index);

        let crackTween = TweenMax.to( this.cocoonGroup.children[index].morphTargetInfluences, 3, {
            delay: 1,
            endArray: [0],
            ease: RoughEase.ease.config({ template:  Power0.easeNone, 
                                         strength: 1, points: 20, taper: "none",
                                         randomize:  true, clamp: false}) 
        });
        this.tweenAnimCollectors.push(crackTween);

        TweenMax.to(this.parent.fullVideo.mesh.position, 2, { x:this.smallShirinPos.x, y:this.smallShirinPos.y, z:this.smallShirinPos.z, delay: 2.5 });
        TweenMax.to(this.parent.fullVideo.wire.position, 2, { x:this.smallShirinPos.x, y:this.smallShirinPos.y, z:this.smallShirinPos.z, delay: 2.5 });
        TweenMax.to(this.parent.fullVideo.mesh.scale, 2, { x:this.oriShirinScale*0.01, y:this.oriShirinScale*0.01, z:this.oriShirinScale*0.01, delay: 2.5 });
        TweenMax.to(this.parent.fullVideo.wire.scale, 2, { x:this.oriShirinScale*0.01, y:this.oriShirinScale*0.01, z:this.oriShirinScale*0.01, delay: 2.5 });
    }

    crackCocoon(index) {
        this.dropFragment(index);
        let crackTween = TweenMax.to( this.cocoonGroup.children[index].morphTargetInfluences, 2, {
            delay: 1,
            endArray: [1], // yoyo: true, repeat:-1, repeatDelay: 1,
            ease: RoughEase.ease.config({ template:  Power0.easeNone, 
                                         strength: 1, points: 20, taper: "none",
                                         randomize:  true, clamp: false}) 
        });
        this.tweenAnimCollectors.push(crackTween);

        switch ( index ) {
            case 0:
                // nothing
                break;

            case 1:
                // drop candies
                this.dropCandy(true);
                break;

            case 2:
                // drop caterpillars
                this.dropCaterpillars();
                break;

            case 3:
                // drop cobwebs
                this.dropCobwebs();
                break;

            case 3:
                // nothing
                break;
        }
    }

    dropFragment(f_i) {
        // console.log("do first animation.");
        // for(let i=0; i<this.particleGroup.emitters.length; i++){
            this.particleGroup.emitters[f_i].enable();
            this.particleGroup.emitters[f_i].activeMultiplier = 2;
            setTimeout( (index)=>{
                this.resetFragment(index);

                var newEPos = this.particleGroup.emitters[2].position.value;
                newEPos.y += 9;
                newEPos.z -= 18;
                this.particleGroup.emitters[2].position.value = newEPos;

            }, 3000, f_i);
        // }
    }

    stopFragment(f_i) {
        // for(let i=0; i<this.particleGroup.emitters.length; i++){
            this.particleGroup.emitters[f_i].disable();
        // }
    }

    resetFragment(index) {
        this.particleGroup.emitters[index].activeMultiplier = 0.5;
    }

    dropCaterpillars() {
        for(let i=0; i<this.caterpillarGroup.length; i++){
            let c_t_pos = TweenMax.to( this.caterpillarGroup[i].position, 4, {y: "-=50", ease: Bounce.easeOut, delay:this.lookupTable[i]*2, onStart: ()=>{
                let c_t_scale = TweenMax.to( this.caterpillarGroup[i].scale, 0.2, {x:.5,y:.5,z:.5} );
                this.tweenAnimCollectors.push(c_t_scale);
            }, onComplete:()=>{
                let c_t_morph = TweenMax.to( this.caterpillarGroup[i].morphTargetInfluences, .5, { endArray: [1], yoyo: true, repeat:-1 });
                this.tweenAnimCollectors.push(c_t_morph);
            } });

            this.tweenAnimCollectors.push(c_t_pos);
        }
    }

    dropCobwebs() {
        for(let i=0; i<this.cobwebGroup.children.length; i++){
            let cw_posTween = TweenMax.to( this.cobwebGroup.children[i].position, 3, {
                x: this.cobwebPos[i].x,
                y: this.cobwebPos[i].y,
                z: this.cobwebPos[i].z,
                ease: Power1.easeInOut, 
                delay:this.lookupTable[i]*2,
                onStart: ()=>{
                    let cw_scaleTween = TweenMax.to( this.cobwebGroup.children[i].scale, 0.2, {
                        x: this.cobwebsScale[i%5].x,
                        y: this.cobwebsScale[i%5].y,
                        z: this.cobwebsScale[i%5].z
                    });
                    this.tweenAnimCollectors.push(cw_scaleTween);
                },
                onComplete:()=>{
                    let cw_rotTween;
                    if(i%2==0){
                        cw_rotTween = TweenMax.to( this.cobwebGroup.children[i].rotation, 4, {
                            x:"+=0.3", y:"+=1",
                            ease: Power1.easeInOut,
                            yoyo: true, repeat:-1
                        });                        
                    }
                    else{
                        cw_rotTween = TweenMax.to( this.cobwebGroup.children[i].rotation, 4, {
                            z:"-=0.3", y:"-=1",
                            ease: Power1.easeInOut,
                            yoyo: true, repeat:-1
                        });
                    }
                    this.tweenAnimCollectors.push(cw_rotTween);
            } });

            this.tweenAnimCollectors.push(cw_posTween);
        }
    }

    createCandyAnimation() {
        for(let i=0; i<this.candyGroup.children.length; i++){
            let tl = new TimelineMax({delay: this.lookupTable[i]*2});
            let origianlPos = this.candyGroup.children[i].position;
            tl.add( TweenMax.to( this.candyGroup.children[i].position, 1.5, {y: this.benchHeight, ease: Expo.easeIn, onStart: ()=>{
                TweenMax.to( this.candyGroup.children[i].scale, 0.2, { x: 1, y: 1, z: 1 } );
            }} ) );
            tl.add( TweenMax.to( this.candyGroup.children[i].position, 0.2, {y: "+=3", ease: Power1.easeOut} ) );
            tl.add( TweenMax.to( this.candyGroup.children[i].position, 1, {y: "-=20", ease: Power1.easeIn} ) );
            tl.add( TweenMax.to( this.candyGroup.children[i].scale, 0.1, {x:0.01, y:0.01, z:0.01} ) );
            tl.add( TweenMax.to( this.candyGroup.children[i].position, 0.1, {x:origianlPos.x,
                                                                             y:origianlPos.y,
                                                                             z:origianlPos.z} ) );
            tl.pause();
            this.candyTimeline.push(tl);
        }
    }

    dropCandy( firstTime ) {
        for(let i=0; i<this.candyTimeline.length; i++){
            if(firstTime)
                this.candyTimeline[i].play();
            else
                this.candyTimeline[i].restart(true);
        } 
    }

    dropShirin() {
        TweenMax.to(this.parent.fullVideo.mesh.position, 1.5, { ease: Bounce.easeOut, y:"-=2" });
        TweenMax.to(this.parent.fullVideo.wire.position, 1.5, { ease: Bounce.easeOut, y:"-=2" });
        TweenMax.to(this.parent.fullVideo.mesh.scale, 2, { x:this.oriShirinScale, y:this.oriShirinScale, z:this.oriShirinScale });
        TweenMax.to(this.parent.fullVideo.wire.scale, 2, { x:this.oriShirinScale, y:this.oriShirinScale, z:this.oriShirinScale,
            onComplete: ()=>{
                this.parent.fullVideo.play();
            }
        });

    }

    showShirin() {
        TweenMax.to(this.parent.fullVideo.mesh.position, 3, { x:this.oriShirinPos.x, y:this.oriShirinPos.y, z:this.oriShirinPos.z });
        TweenMax.to(this.parent.fullVideo.wire.position, 3, { x:this.oriShirinPos.x, y:this.oriShirinPos.y, z:this.oriShirinPos.z });
        TweenMax.to(this.parent.fullVideo.mesh.scale, 3, { x:this.oriShirinScale, y:this.oriShirinScale, z:this.oriShirinScale });
        TweenMax.to(this.parent.fullVideo.wire.scale, 3, { x:this.oriShirinScale, y:this.oriShirinScale, z:this.oriShirinScale,
            onComplete: ()=>{
                this.parent.fullVideo.play();
            }
        });
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

    afterLoaded() {
        // if( this.parent.config.platform=="desktop" ){
        //     this.moon.position.y = 200;
        // } else {
        //     this.moon.position.set(500,690,500);
        //     this.moon.scale.set(4,4,4);
        // }
    }

    start(time) {
        this.reset(time);

        console.log("Shirin animation starting with ", time);
        this.currentSequence = this.sequenceConfig[time].slice(0);
        this.nextAnim = this.currentSequence.shift();
    }

    reset(time) {
        // stop animation
        for(let i=0; i<this.tweenAnimCollectors.length; i++){
            this.tweenAnimCollectors[i].kill();
        }
        // clean the collector
        this.tweenAnimCollectors = [];

        // back to original status: closed
        for(let i=0; i<this.cocoonGroup.children.length; i++){
            this.cocoonGroup.children[i].morphTargetInfluences[0] = 0;
        }

        if(time == "Shirin7PM"){
            var newEPos = this.particleGroup.emitters[2].position.value;
            newEPos.y -= 37; //-=28
            newEPos.z += 18;
            this.particleGroup.emitters[2].position.value = newEPos;
            this.particleGroup.emitters[2].acceleration.value = new THREE.Vector3(0,0.7,0);
            this.particleGroup.emitters[2].acceleration.spread = new THREE.Vector3(.8,1,.8);
            //value: new THREE.Vector3(0,-2,0), //0,-.4,0
            //spread: new THREE.Vector3(.1,1,.1)

            // transforming video
            this.oriShirinScale = this.parent.fullVideo.mesh.scale.x;
            this.parent.fullVideo.setScale(this.oriShirinScale * 0.01);
            this.parent.fullVideo.pause();
            // this.parent.fullVideo.mesh.position.y += 2;
            // this.parent.fullVideo.wire.position.y += 2;
            this.oriShirinPos = this.parent.fullVideo.mesh.position.clone();
            this.parent.fullVideo.mesh.position.copy(this.smallShirinPos);
            this.parent.fullVideo.wire.position.copy(this.smallShirinPos);
        } else {
            // unhidden the cocoons
            for(var i=0; i<this.cocoonGroup.children.length; i++){
                this.cocoonGroup.children[i].visible = true;
            }
        }
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
        this.particleGroup.tick( dt );

        // for(let i=0; i<this.cocoonGroup.children.length; i++){
        //     this.cocoonGroup.children[i].
        // }
    }
}
