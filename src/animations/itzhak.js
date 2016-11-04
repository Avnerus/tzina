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
            { time: 1,  anim: ()=>{this.growClouds(20)} },
            { time: 25,  anim: ()=>{this.dropClouds(4)} },
            { time: 45,  anim: ()=>{this.dropClouds(7)} },  
            { time: 65,  anim: ()=>{this.dropClouds(10)} },
            { time: 85,  anim: ()=>{this.dropClouds(15)} },
            { time: 105,  anim: ()=>{this.dropClouds(20)} },
            { time: 130, anim: ()=>{this.characterDisappear()} }
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
            this.cloudRadius = 5;
            this.cloudColors = [ new THREE.Color(0xafe2f3), new THREE.Color(0xf3afc0) ];
        // ================ Setting End =====================
        this.cloudIndex = [];
        for(let i=0; i<this.cloudAmount; i++){
            this.cloudIndex.push(i);
        }
        this.itzhakLoadingManager = new THREE.LoadingManager();
        this.itzhakLoadingManager.onLoad = ()=>{
            for(let j=0; j<this.cloudGeos.length; j++){
                this.cloudGeos[j].morphTargets.push( {name: 'h1', vertices: this.heartGeos[j].vertices} );
                this.cloudGeos[j].computeMorphNormals();
            }
            this.createClouds();
        };
        let cloudFiles = [ this.BASE_PATH + "/models/cloud1.json", this.BASE_PATH + "/models/cloud2.json" ];
        let heartFiles = [ this.BASE_PATH + "/models/heart1.json", this.BASE_PATH + "/models/heart2.json" ];
        this.cloudGeos = [];
        this.heartGeos = [];
        this.cloudGroup = [];
        this.cloudVirtualGroup = {};
        
        this.loadClouds( cloudFiles, heartFiles );

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
        let cloudMaterial = new THREE.MeshLambertMaterial({color: this.cloudColors[0], morphTargets: true, morphNormals: true});
        
        for(let i=0; i<3; i++){
            let cloudRing = new THREE.Object3D();
            cloudRing.position.y = 3 - i;
            
            let t_m = TweenMax.to( cloudRing.rotation, 150+i*20, {
                y: Math.PI*2,
                ease: Power0.easeNone,
                repeat:-1
            });

            cloudRing.tweenmax = t_m;
            this.add(cloudRing);
            this.cloudGroup.push(cloudRing);
        }

        for(let i=0; i<this.cloudAmount; i++){
            let cloudObject = {};
            let cloudd = new THREE.Mesh( this.cloudGeos[i%2], cloudMaterial.clone() );
            cloudd.position.set(
                Math.sin(Math.PI*2/this.cloudAmount*i) * this.cloudRadius,
                this.lookupTable[i]*2,
                Math.cos(Math.PI*2/this.cloudAmount*i) * this.cloudRadius
            );
            // cloudd.rotation.y = Math.PI*2/this.cloudAmount*i + Math.PI;
            cloudd.rotation.set(
                0,
                Math.PI*2/this.cloudAmount*i + Math.PI,
                0,
                'YXZ'
            );
            // cloudd.scale.multiplyScalar( 0.1 + 0.2*this.lookupTable[i] );
            cloudd.scale.multiplyScalar( 0.001 );

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

        for(let i=0; i<this.cloudGroup.length; i++){
            this.cloudGroup[i].tweenmax.kill();
            TweenMax.to( this.cloudGroup[i].scale, 2, {
                x: 0.01,
                y: 0.01,
                z: 0.01,
                delay: 5,
                ease: Back.easeInOut
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
                    TweenMax.to(theCloud.position, 4, {
                        y: "+=" + toY
                    });
                }
            });
            TweenMax.to( theCloud.morphTargetInfluences, 2, {endArray: [1]});

            TweenMax.to( theCloud.scale, 3, {
                x: "+=1.5",
                y: "+=2",
                z: "+=1.5",
                delay: this.lookupTable[i]*3,
                yoyo: true,
                repeat: 1
            });
        }

        TweenMax.to( this.parent.fullVideo.mesh.scale, 1, {
            x:0.00001,y:0.00001,z:0.00001, ease: Back.easeInOut, delay: 5.5, onComplete: ()=>{
            this.parent.fullVideo.setOpacity(0.0);
        } } );
    }

    growClouds(diff) {
        for(let i=0; i<this.cloudAmount; i++){
            TweenMax.to(  this.cloudVirtualGroup[i].object.scale, 2, {
                x: 0.1 + 0.2*this.lookupTable[i],
                y: 0.1 + 0.2*this.lookupTable[i],
                z: 0.1 + 0.2*this.lookupTable[i],
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
                endArray: [1], ease: RoughEase.ease.config({
                    template:  Power0.easeNone, strength: 1, points: 20, taper: "none", randomize:  true, clamp: false}),
                onComplete: ()=>{
                    setTimeout( ()=>{                   
                        this.detach( theCloud, theParent, this);
                        // console.log(theCloud.position);
                    }, 4500);

                    TweenMax.to(theCloud.position, 2, {y:0, ease: Bounce.easeOut, delay:5+c_index*0.05,
                        onStart: ()=>{
                            TweenMax.to(theCloud.rotation, 1, {x:Math.PI/2});
                        },
                        onCompleteParams: [theCloud.position.y+theParent.position.y],
                        onComplete: (oriHeight)=>{

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
                                },
                                onComplete:()=>{
                                    this.attach(theCloud, this, theParent);
                                    TweenMax.to(theCloud.rotation, 1, {x:0});
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
