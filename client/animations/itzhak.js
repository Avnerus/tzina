import ImprovedNoise from '../util/improved_noise'
import DebugUtil from '../util/debug'

export default class ItzhakAnimation extends THREE.Object3D {
    constructor( config ) {
        super();
        this.config = config;
        this.BASE_PATH = this.config.assetsHost + 'assets/animations/itzhak';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {

        // setup animation sequence
        /*
        ====> this.dropClouds( amount of falling clouds )
            the cycle of falling + rising takes around 20 seconds,
            so each this.dropClouds() needs 20 sec apart from each other
        */
        this.animStart = false;
        this.sequenceConfig = [
            { time: 1,  anim: ()=>{this.growClouds(3)} },
            //
            { time: 29,  anim: ()=>{this.dropClouds(5, false)} },
            { time: 62,  anim: ()=>{this.dropClouds(8, false)} },
            { time: 102,  anim: ()=>{this.dropClouds(3, false)} },
            { time: 120,  anim: ()=>{this.dropClouds(12, false)} },
            { time: 143,  anim: ()=>{this.dropClouds(16, false)} },
           
            { time: 166,  anim: ()=>{this.dropClouds(20, true)} }, //12 sec before characterDisappear
            { time: 179, anim: ()=>{this.characterDisappear()} } // total time: 186, characterDisappear() takes 6.5
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();

        this.loadingManager.itemStart("ItzhakAnim");

        //        
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        // cloud + heart
        // ============== Changeable Setting ================
            this.cloudAmount = 10;
            this.cloudRadius = [3,4,5];
            this.cloudScale = [0.15,0.3,0.45];
            this.cloudColors = [ new THREE.Color(0xe7f6fb), new THREE.Color(0xcc0000), new THREE.Color(0x4b2a79) ];
            this.floorHeight = -2.5;
            this.treeRadius = 3;
        // ================ Setting End =====================
        this.cloudIndex = [];
        for(let i=0; i<this.cloudAmount; i++){
            this.cloudIndex.push(i);
        }
        this.cloudTex = tex_loader.load( this.BASE_PATH + "/images/cloud3.png" );
        this.cloudTex.wrapS = THREE.RepeatWrapping;
        this.cloudTex.wrapT = THREE.RepeatWrapping;
        this.cloudTex.repeat.set( 5, 3 );

        this.itzhakLoadingManager = new THREE.LoadingManager();
        this.itzhakLoadingManager.onLoad = ()=>{
            for(let j=0; j<this.cloudGeos.length; j++){
                this.cloudGeos[j].morphTargets.push( {name: 'h1', vertices: this.heartGeos[j].vertices} );
                this.cloudGeos[j].computeMorphNormals();
            }
            this.createClouds();
        };
        let cloudFiles = [ this.BASE_PATH + "/models/cloud1_3.json", this.BASE_PATH + "/models/cloud2_3.json" ];
        let heartFiles = [ this.BASE_PATH + "/models/heart1.json", this.BASE_PATH + "/models/heart2.json" ];
        this.cloudGeos = [];
        this.heartGeos = [];
        this.cloudGroup = [];
        this.cloudOuterGroup = [];
        this.cloudVirtualGroup = {};
        // dispose
        this.cloudMats = [];
        
        this.loadClouds( cloudFiles, heartFiles );

        this.treeTex = tex_loader.load( this.BASE_PATH + "/images/house.jpg" );
        this.treeMat = new THREE.MeshBasicMaterial({map: this.treeTex});
        this.treeGroup = new THREE.Object3D();

        loader.load( this.BASE_PATH + "/models/singleTree.json", (geometry)=>{
            this.treeGeo = geometry;

            let tree = new THREE.Mesh(geometry, this.treeMat);

            for(let i=0; i<16; i++){
                let t = tree.clone();
                t.position.set(
                    Math.sin(Math.PI*2/32*(i+8)) * (this.treeRadius-.5) + this.lookupTable[i],
                    0,
                    Math.cos(Math.PI*2/32*(i+8)) * (this.treeRadius-.5) + this.lookupTable[i]
                );
                t.scale.y = 0.9+this.lookupTable[i]/2;
                t.rotation.y = this.lookupTable[i]*2;
                this.treeGroup.add(t);
            }

            for(let i=0; i<20; i++){
                let t = tree.clone();
                t.position.set(
                    Math.sin(Math.PI*2/40*(i+10)) * this.treeRadius + this.lookupTable[i],
                    0,
                    Math.cos(Math.PI*2/40*(i+10)) * this.treeRadius + this.lookupTable[i]
                );
                t.scale.y = 0.4+this.lookupTable[i]/2;
                t.rotation.y = this.lookupTable[i]*2;
                this.treeGroup.add(t);
            }
            this.treeGroup.position.z = 1;
            this.add(this.treeGroup);
            // DebugUtil.positionObject(this.treeGroup, "trees");
        } );

        this.dummy={timeScaleValue:0};

        this.rockGroup = new THREE.Object3D();
        // DebugUtil.positionObject(this.rockGroup, "rocks");
        this.add(this.rockGroup);
        this.rockTex = tex_loader.load( this.BASE_PATH + "/images/rock.jpg" );
        this.rockMat = new THREE.MeshLambertMaterial({map: this.rockTex});
        this.loadRock( this.BASE_PATH + "/models/rock1.json", this.BASE_PATH + "/models/rock2.json", loader );

        // DebugUtil.positionObject(this, "Itzhak Anim");

        events.on("experience_end", ()=>{
            this.disposeAni();
        });

        //
        this.loadingManager.itemEnd("ItzhakAnim");
    }

    loadRock(r_f_1, r_f_2, loader) {
        let rockss = [];
        this.rockGeo, this.rockGeo2;
        loader.load( r_f_1, (geometry)=>{
            this.rockGeo = geometry;
            let rock1 = new THREE.Mesh(geometry, this.rockMat);
            rockss.push(rock1);
            loader.load( r_f_2, (geometry2)=>{
                this.rockGeo2 = geometry2;
                let rock2 = new THREE.Mesh(geometry2, this.rockMat);
                rockss.push(rock2);

                for(let i=0; i<6; i++){
                    for(let j=0; j<9; j++){
                        let r = rockss[i*j%2].clone();
                        r.position.set(
                            Math.sin(Math.PI*2/12*(i+3)) * 1 + this.lookupTable[i+j],
                            j*0.3,
                            Math.cos(Math.PI*2/12*(i+3)) * 1 + this.lookupTable[i+j]
                        );
                        r.scale.multiplyScalar( 0.3+this.lookupTable[i+j]/2 );
                        r.rotation.y = this.lookupTable[i+j];
                        this.rockGroup.add(r);
                    }                    
                }
            });            
        } );
    }

    loadClouds( cloudFiles, heartFiles ) {
        let cloudLoader = new THREE.JSONLoader( this.itzhakLoadingManager );
        // let modelLoader = new THREE.JSONLoader( this.loadingManager );
        for(let i=0; i<cloudFiles.length; i++){
            cloudLoader.load( cloudFiles[i], (geometry)=>{
                geometry.name = "cloudGeo" + i;
                this.cloudGeos.push(geometry);
            } );

            cloudLoader.load( heartFiles[i], (geometry2)=>{
                geometry2.name = "heartGeo" + i;
                this.heartGeos.push(geometry2);
            } );
        }
    }

    createClouds() {
        // let cloudMaterial = new THREE.MeshLambertMaterial({color: this.cloudColors[0], morphTargets: true, morphNormals: true});
        this.cloudMaterial = new THREE.MeshBasicMaterial({
            color: this.cloudColors[0], map: this.cloudTex, //side: THREE.DoubleSide,
            transparent: true, opacity: .5, //blending: THREE.AdditiveBlending,
            morphTargets: true, morphNormals: true
        });
        
        this.outerCloudMaterial = new THREE.MeshBasicMaterial({
            color: this.cloudColors[0], map: this.cloudTex, //side: THREE.DoubleSide,
            transparent: true, opacity: 1
        });

        for(let i=0; i<3; i++){
            let cloudRing = new THREE.Object3D();
            cloudRing.position.y = 5 - i*2;
            
            // let t_m = TweenMax.to( cloudRing.rotation, 150+i*20, {
            //     y: Math.PI*2,
            //     ease: Power0.easeNone,
            //     repeat:-1
            // });
            // cloudRing.tweenmax = t_m;

            let tl = new TimelineMax({repeat: -1});
            tl.to( cloudRing.rotation, 150+i*20, {
                y: Math.PI*2,
                ease: Power0.easeNone
            } );
            cloudRing.tweenline = tl;

            this.add(cloudRing);
            this.cloudGroup.push(cloudRing);

            // OUTER RING
                let cloudOuterRing = new THREE.Object3D();
                cloudOuterRing.position.y = 8 - i*4;

                let tl_2 = new TimelineMax({repeat: -1});
                tl_2.to( cloudOuterRing.rotation, 150+i*20, {
                    y: Math.PI*2,
                    ease: Power0.easeNone
                } );
                cloudOuterRing.tweenline = tl_2;

                this.add(cloudOuterRing);
                this.cloudOuterGroup.push(cloudOuterRing);
        }        

        for(let i=0; i<this.cloudAmount; i++){
            let cloudObject = {};
            let _cloudMat = this.cloudMaterial.clone();
            this.cloudMats.push(_cloudMat);
            let cloudd = new THREE.Mesh( this.cloudGeos[i%2], _cloudMat );
            cloudd.position.set(
                Math.sin(Math.PI*2/this.cloudAmount*i) * this.cloudRadius[i%3],
                this.lookupTable[i],
                Math.cos(Math.PI*2/this.cloudAmount*i) * this.cloudRadius[i%3]
            );

            cloudd.rotation.set(
                0,
                Math.PI*2/this.cloudAmount*i + Math.PI,
                0,
                'YXZ'
            );

            cloudd.scale.multiplyScalar( this.cloudScale[i%3] * (1+this.lookupTable[i]/2) );
            cloudd.material.opacity=0;

            this.cloudGroup[i%3].add(cloudd);

            cloudObject.object = cloudd;
            this.cloudVirtualGroup[i] = cloudObject;

            // OUTER RING
                let cloudd_out = new THREE.Mesh( this.cloudGeos[i%2], this.outerCloudMaterial );
                cloudd_out.position.set(
                    Math.sin(Math.PI*2/this.cloudAmount*i) * this.cloudRadius[i%3] * 3,
                    this.lookupTable[i] * 3,
                    Math.cos(Math.PI*2/this.cloudAmount*i) * this.cloudRadius[i%3] * 3
                );

                cloudd_out.rotation.set(
                    0,
                    Math.PI*2/this.cloudAmount*i + Math.PI,
                    0,
                    'YXZ'
                );

                cloudd_out.scale.multiplyScalar( this.cloudScale[i%3] * (2+this.lookupTable[i]/2) );
                cloudd_out.material.opacity=0;

                this.cloudOuterGroup[i%3].add(cloudd_out);
        }
    }

    characterDisappear() {

        TweenMax.to( this.dummy, 6, {
            timeScaleValue: 80,
            ease: Power3.easeIn,
            onStart: ()=>{
                for(let i=0; i<this.cloudGroup.length; i++){
                    TweenMax.to( this.cloudGroup[i].scale, 2, {
                        x: "+=" + i*0.03,
                        // y: "+=" + i*0.05,
                        z: "+=" + i*0.03,
                    } );
                    TweenMax.to( this.cloudGroup[i].position, 2, {y:"-=" + (3-i)});
                }
            },
            onUpdate: ()=>{
                for(let i=0; i<this.cloudGroup.length; i++){
                    this.cloudGroup[i].tweenline.timeScale(this.dummy.timeScaleValue*(3-i)*2.5);
                }
            }
        } );

        for(let i=0; i<this.cloudGroup.length; i++){
            
            TweenMax.to( this.cloudGroup[i].scale, 1, {
                x: 0.01,
                y: 0.01,
                z: 0.01,
                delay: 5,
                ease: Back.easeIn.config(4),
                onStart: ()=>{
                    TweenMax.to( this.cloudGroup[i].position, 2, {y:0, ease: Back.easeInOut} );
                },
                onComplete: ()=>{
                    this.cloudGroup[i].visible = false;
                }
            });
        }

        for(let i=0; i<this.cloudAmount; i++){
            let theCloud = this.cloudVirtualGroup[i].object;
    
            if(theCloud.theParent!=null)
                this.attach(theCloud, this, theCloud.theParent);

            TweenMax.to( theCloud.rotation, 3, {x:0});
            TweenMax.to( theCloud.material.color, 2, {
                r: this.cloudColors[1].r,
                g: this.cloudColors[1].g,
                b: this.cloudColors[1].b,
                onStart:()=>{
                    let toY = theCloud.position.y + (-8*this.lookupTable[i]);
                    TweenMax.to(theCloud.position, 5, {
                        y: theCloud.oriHeight
                        // yoyo: true,
                        // repeat: -1
                    });
                }
            });
            //TweenMax.to( theCloud.morphTargetInfluences, 2, {endArray: [1]});

            TweenMax.to( theCloud.scale, 5, {
                x: "+=.8",
                y: "+=1.1",
                z: "+=.8",
                delay: this.lookupTable[i]*3
                // yoyo: true,
                // repeat: 1
            });
        }

        TweenMax.to( this.parent.fullVideo.mesh.scale, 1, {
            x:0.00001,y:0.00001,z:0.00001, ease: Back.easeInOut, delay: 5.5, onComplete: ()=>{
            this.parent.fullVideo.setOpacity(0.0);
        } } );
    }

    disposeAni(){
        // cloud
        for(var i=0; i<this.cloudGroup.length; i++){ this.remove(this.cloudGroup[i]); }
        for(var i=0; i<this.cloudOuterGroup.length; i++){ this.remove(this.cloudOuterGroup[i]); }
        for(var i=0; i<this.cloudGeos.length; i++){ this.cloudGeos[i].dispose(); }
        this.cloudMaterial.dispose();
        this.outerCloudMaterial.dispose();
        for(var i=0; i<this.cloudMats.length; i++){ this.cloudMats[i].dispose(); }
        this.cloudTex.dispose();

        // tree
        this.remove(this.treeGroup);
        this.treeGeo.dispose();
        this.treeMat.dispose();
        this.treeTex.dispose();

        // rock
        this.remove(this.rockGroup);
        this.rockGeo.dispose();
        this.rockGeo2.dispose();
        this.rockMat.dispose();
        this.rockTex.dispose();

        // heart
        for(var i=0; i<this.heartGeos.length; i++){ this.heartGeos[i].dispose(); }

        console.log("dispose Itzhak ani!");
    }

    growClouds(diff) {
        for(let i=0; i<this.cloudAmount; i++){
            // TweenMax.to(  this.cloudVirtualGroup[i].object.scale, 2, {
            //     // x: 0.1 + this.cloudScale[i%3]*this.lookupTable[i],
            //     // y: 0.1 + this.cloudScale[i%3]*this.lookupTable[i],
            //     // z: 0.1 + this.cloudScale[i%3]*this.lookupTable[i],
            //     x: this.cloudScale[i%3] * (1+this.lookupTable[i]/2),
            //     y: this.cloudScale[i%3] * (1+this.lookupTable[i]/2),
            //     z: this.cloudScale[i%3] * (1+this.lookupTable[i]/2),
            //     delay: this.lookupTable[i]*diff
            // });

            TweenMax.to(  this.cloudVirtualGroup[i].object.material, 2, {
                opacity: .5,
                delay: this.lookupTable[i]*diff
            });
        }

        TweenMax.to(  this.outerCloudMaterial, 2, { opacity: 1 });
    }

    dropCloud( c_index, theCloud, theParent, noRise ) {
        // totalTime: 2 + 5 + 2 + 5 + 2 + 1 = 17

        // change to heart
            TweenMax.to( theCloud.material.color, 2, {
                r: this.cloudColors[1].r,
                g: this.cloudColors[1].g,
                b: this.cloudColors[1].b,
                onStart: ()=>{
                    TweenMax.to( theCloud.material, 2, {opacity: 1} );
                }
            });
            TweenMax.to( theCloud.morphTargetInfluences, 2, {
                endArray: [1],
                onComplete: ()=>{
                    setTimeout( ()=>{                   
                        this.detach( theCloud, theParent, this);
                        // console.log(theCloud.position);
                    }, 3500);

                    TweenMax.to(theCloud.position, 2, {y:this.floorHeight, ease: Bounce.easeOut, delay:4+c_index*0.05,
                        onStart: ()=>{
                            TweenMax.to(theCloud.rotation, 1, {x:Math.PI/2, delay:0.5});
                        },
                        onCompleteParams: [theCloud.position.y+theParent.position.y],
                        onComplete: (oriHeight)=>{
                            TweenMax.to( theCloud.material.color, 0.5, {
                                r: this.cloudColors[2].r,
                                g: this.cloudColors[2].g,
                                b: this.cloudColors[2].b
                            });

                            if(!noRise){
                                TweenMax.to(theCloud.position, 4, {y: oriHeight, delay: 5,
                                    onStart:()=>{
                                        TweenMax.to( theCloud.morphTargetInfluences, 2, {
                                            endArray: [0], ease: RoughEase.ease.config({
                                                template:  Power0.easeNone, strength: 1, points: 20, taper: "none", randomize:  true, clamp: false
                                            })
                                        });
                                        TweenMax.to( theCloud.material.color, 2, {
                                            r: this.cloudColors[0].r,
                                            g: this.cloudColors[0].g,
                                            b: this.cloudColors[0].b
                                        });
                                        TweenMax.to( theCloud.rotation, 1, {x:0});
                                        TweenMax.to( theCloud.material, 2, {opacity: 0.5} );
                                    },
                                    onComplete:()=>{
                                        this.attach(theCloud, this, theParent);
                                        // TweenMax.to(theCloud.rotation, 1, {x:0});
                                    }
                                });
                            } else {
                                theCloud.oriHeight = oriHeight;
                                theCloud.theParent = theParent;
                                // this.attach(theCloud, this, theParent);
                            }
                            
                        }
                    });
                }
            });     
    }

    dropSingleCloud( c_index ){
        let whichCloud = c_index%3;
        let childIndex = Math.floor( c_index / 3 );
        let theParent = this.cloudGroup[whichCloud];
        let theCloud = this.cloudGroup[whichCloud].children[childIndex];
        this.dropCloud( c_index, theCloud, theParent );
    }

    dropMultiCloud( c_index, noRise ) {
        let theCloud = this.cloudVirtualGroup[c_index].object;
        let theParent = theCloud.parent;
        this.dropCloud( c_index, theCloud, theParent, noRise );
    }

    dropClouds( amount, noRise ) {
        let counter = 0;
        this.shuffle( this.cloudIndex );
        for(let i=0; i<amount; i++){
            this.dropMultiCloud( this.cloudIndex[i], noRise );
        }
    }

    shuffle(a) {
        for (let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }
    }

    detach ( child, parent, scene ) {
        child.applyMatrix( parent.matrix );
        parent.remove( child );
        scene.add( child );
    }

    attach ( child, scene, parent ) {
        var matrixWorldInverse = new THREE.Matrix4();
        matrixWorldInverse.getInverse( parent.matrix );
        child.applyMatrix( matrixWorldInverse );

        scene.remove( child );
        parent.add( child );
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
