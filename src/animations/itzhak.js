import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import EndArrayPlugin from '../util/EndArrayPlugin'
import DebugUtil from '../util/debug'
TweenPlugin.activate([EndArrayPlugin]);

export default class ItzhakAnimation extends THREE.Object3D {
    constructor( scene, renderer ) {
        super();
        this.BASE_PATH = 'assets/animations/itzhak';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {

        // setup animation sequence
        /*
        ====> this.growClouds( delay )
            delay: difference between all the clouds
        ====> this.dropClouds( amount of falling clouds )
            the cycle of full falling and rising is around 20 seconds,
            so the can only do another this.dropClouds(x) after 20 seconds
        */
        this.animStart = false;
        this.sequenceConfig = [
            { time: 1,  anim: ()=>{this.growClouds(5)} },
            { time: 10,  anim: ()=>{this.dropClouds(7)} },
            { time: 30,  anim: ()=>{this.dropClouds(15)} },  
            { time: 50,  anim: ()=>{this.dropClouds(20)} },
            // { time: 70,  anim: ()=>{this.dropClouds(15)} },
            // { time: 90,  anim: ()=>{this.dropClouds(20)} },
            { time: 80, anim: ()=>{this.characterDisappear()} }
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
            this.cloudAmount = 20;
            this.cloudRadius = [3,4,5];
            this.cloudScale = [0.15,0.3,0.45];
            this.cloudColors = [ new THREE.Color(0xe7f6fb), new THREE.Color(0xf3afc0), new THREE.Color(0x4b2a79) ];
            this.floorHeight = 0;
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
        this.cloudVirtualGroup = {};
        
        this.loadClouds( cloudFiles, heartFiles );

        this.treeTex = tex_loader.load( this.BASE_PATH + "/images/house.jpg" );
        this.treeMat = new THREE.MeshBasicMaterial({map: this.treeTex});
        this.treeGroup = new THREE.Object3D();
        loader.load( this.BASE_PATH + "/models/singleTree.json", (geometry)=>{
            let tree = new THREE.Mesh(geometry, this.treeMat);

            for(let i=0; i<15; i++){
                let t = tree.clone();
                t.position.set(
                    Math.sin(Math.PI*2/40*(i+10)) * (this.treeRadius-.5) + this.lookupTable[i],
                    0,
                    Math.cos(Math.PI*2/40*(i+10)) * (this.treeRadius-.5) + this.lookupTable[i]
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
            DebugUtil.positionObject(this.treeGroup, "trees");
        } );

        this.dummy={timeScaleValue:0};

        // DebugUtil.positionObject(this, "itzhak");
        //
        this.loadingManager.itemEnd("ItzhakAnim");
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
        let cloudMaterial = new THREE.MeshBasicMaterial({
            color: this.cloudColors[0], map: this.cloudTex, //side: THREE.DoubleSide,
            transparent: true, opacity: 1, //blending: THREE.AdditiveBlending,
            morphTargets: true, morphNormals: true
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
        }

        for(let i=0; i<this.cloudAmount; i++){
            let cloudObject = {};
            let cloudd = new THREE.Mesh( this.cloudGeos[i%2], cloudMaterial.clone() );
            cloudd.position.set(
                Math.sin(Math.PI*2/this.cloudAmount*i) * this.cloudRadius[i%3],
                this.lookupTable[i],
                Math.cos(Math.PI*2/this.cloudAmount*i) * this.cloudRadius[i%3]
            );
            // cloudd.rotation.y = Math.PI*2/this.cloudAmount*i + Math.PI;
            cloudd.rotation.set(
                0,
                Math.PI*2/this.cloudAmount*i + Math.PI,
                0,
                'YXZ'
            );
            // cloudd.scale.multiplyScalar( 0.1 + 0.2*this.lookupTable[i] );
            // cloudd.scale.multiplyScalar( 0.001 );
            cloudd.scale.multiplyScalar( this.cloudScale[i%3] * (1+this.lookupTable[i]/2) );
            cloudd.material.opacity=0;

            this.cloudGroup[i%3].add(cloudd);

            cloudObject.object = cloudd;
            this.cloudVirtualGroup[i] = cloudObject;

            // TweenMax.to( cloudd.morphTargetInfluences, 2, { endArray: [1], yoyo: true, repeat:-1, repeatDelay: 5,
            //                                                 ease: RoughEase.ease.config({ template:  Power0.easeNone, 
            //                                                     strength: 1, points: 20, taper: "none",
            //                                                     randomize:  true, clamp: false}),
            //                                                 onStart: ()=>{
            //                                                     TweenMax.to( cloudd.material.color, 2, {
            //                                                         r: this.cloudColors[1].r,
            //                                                         g: this.cloudColors[1].g,
            //                                                         b: this.cloudColors[1].b,
            //                                                         yoyo: true, repeat:-1, repeatDelay: 5
            //                                                     });

            //                                                     TweenMax.to( cloudd.position, 2+(i%2)/2, {
            //                                                         y: "+=0.1",
            //                                                         delay: i%3,
            //                                                         yoyo: true, repeat:-1
            //                                                     });
            //                                                 }
            //                                             });
        }
    }

    characterDisappear() {

        TweenMax.to( this.dummy, 8, {
            timeScaleValue: 50,
            onUpdate: ()=>{
                for(let i=0; i<this.cloudGroup.length; i++){
                    this.cloudGroup[i].tweenline.timeScale(this.dummy.timeScaleValue);
                }
            }
        } );

        for(let i=0; i<this.cloudGroup.length; i++){
            
            
            TweenMax.to( this.cloudGroup[i].scale, 2, {
                x: 0.01,
                y: 0.01,
                z: 0.01,
                delay: 5,
                ease: Back.easeInOut,
                onStart: ()=>{
                    TweenMax.to( this.cloudGroup[i].position, 2, {y:3, ease: Back.easeInOut} );
                },
                onComplete: ()=>{
                    this.cloudGroup[i].visible = false;
                }
            });
        }

        for(let i=0; i<this.cloudAmount; i++){
            let theCloud = this.cloudVirtualGroup[i].object;
            TweenMax.to( theCloud.material.color, 2, {
                r: this.cloudColors[1].r,
                g: this.cloudColors[1].g,
                b: this.cloudColors[1].b,
                onStart:()=>{
                    let toY = theCloud.position.y + (-8*this.lookupTable[i]);
                    TweenMax.to(theCloud.position, 1, {
                        y: "-=" + 1,
                        yoyo: true,
                        repeat: -1
                    });
                }
            });
            TweenMax.to( theCloud.morphTargetInfluences, 2, {endArray: [1]});

            TweenMax.to( theCloud.scale, 3, {
                x: "+=1.1",
                y: "+=1.4",
                z: "+=1.1",
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
                opacity: 1,
                delay: this.lookupTable[i]*diff
            });
        }
    }

    dropCloud( c_index, theCloud, theParent ) {
        // totalTime: 2 + 5 + 2 + 5 + 2 + 1 = 17

        // change to heart
            TweenMax.to( theCloud.material.color, 2, {
                r: this.cloudColors[1].r,
                g: this.cloudColors[1].g,
                b: this.cloudColors[1].b
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
                                    TweenMax.to(theCloud.rotation, 1, {x:0});
                                },
                                onComplete:()=>{
                                    this.attach(theCloud, this, theParent);
                                    // TweenMax.to(theCloud.rotation, 1, {x:0});
                                }
                            });
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

    dropMultiCloud( c_index ) {
        let theCloud = this.cloudVirtualGroup[c_index].object;
        let theParent = theCloud.parent;
        this.dropCloud( c_index, theCloud, theParent );
    }

    dropClouds( amount ) {
        let counter = 0;
        this.shuffle( this.cloudIndex );
        for(let i=0; i<amount; i++){
            this.dropMultiCloud( this.cloudIndex[i] );
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
