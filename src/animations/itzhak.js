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
        this.animStart = false;
        this.sequenceConfig = [
            { time: 5,  anim: ()=>{this.doFirstAni()} }
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
        this.itzhakLoadingManager = new THREE.LoadingManager();
        this.itzhakLoadingManager.onLoad = ()=>{
            for(let j=0; j<this.cloudGeos.length; j++){
                this.cloudGeos[j].morphTargets.push( {name: 'h1', vertices: this.heartGeos[j].vertices} );
                this.cloudGeos[j].computeMorphNormals();
                //console.log(this.cloudGeos[j]);
            }
            this.createClouds();
        };
        let cloudFiles = [ this.BASE_PATH + "/models/cloud1.json", this.BASE_PATH + "/models/cloud2.json" ];
        let heartFiles = [ this.BASE_PATH + "/models/heart1.json", this.BASE_PATH + "/models/heart2.json" ];
        this.cloudGeos = [];
        this.heartGeos = [];
        this.cloudGroup = [];
        
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
            this.add(cloudRing);
            this.cloudGroup.push(cloudRing);

            TweenMax.to( cloudRing.rotation, 150+i*20, {
                y: Math.PI*2,
                ease: Power0.easeNone,
                repeat:-1
            });
        }

        for(let i=0; i<this.cloudAmount; i++){
            let cloudd = new THREE.Mesh( this.cloudGeos[i%2], cloudMaterial );
            cloudd.position.set(
                Math.sin(Math.PI*2/this.cloudAmount*i) * this.cloudRadius,
                this.lookupTable[i]*2,
                Math.cos(Math.PI*2/this.cloudAmount*i) * this.cloudRadius
            );
            cloudd.rotation.y = Math.PI*2/this.cloudAmount*i + Math.PI;
            cloudd.scale.multiplyScalar( 0.3 + 0.2*this.lookupTable[i] );
            // this.add(cloudd);
            // this.cloudGroup.push(cloudd);
            this.cloudGroup[i%3].add(cloudd);

            TweenMax.to( cloudd.morphTargetInfluences, 2, { endArray: [1], yoyo: true, repeat:-1, repeatDelay: 5,
                                                            ease: RoughEase.ease.config({ template:  Power0.easeNone, 
                                                                strength: 1, points: 20, taper: "none",
                                                                randomize:  true, clamp: false}),
                                                            onStart: ()=>{
                                                                TweenMax.to( cloudd.material.color, 2, {
                                                                    r: this.cloudColors[1].r,
                                                                    g: this.cloudColors[1].g,
                                                                    b: this.cloudColors[1].b,
                                                                    yoyo: true, repeat:-1, repeatDelay: 5
                                                                });

                                                                TweenMax.to( cloudd.position, 2+(i%2)/2, {
                                                                    y: "+=0.1",
                                                                    delay: i%3,
                                                                    yoyo: true, repeat:-1
                                                                });
                                                            }
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
