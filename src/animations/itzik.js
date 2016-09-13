import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import EndArrayPlugin from '../util/EndArrayPlugin'
import DebugUtil from '../util/debug'
TweenPlugin.activate([EndArrayPlugin]);

export default class ItzikAnimation extends THREE.Object3D {
    constructor( scene, renderer ) {
        super();
        this.BASE_PATH = 'assets/animations/itzik';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = [
            { time: 5,  anim: ()=>{this.benchOutFirst()} },  // benchOut( sequence )
            { time: 10, anim: ()=>{this.benchMove(1)} },
            { time: 15, anim: ()=>{this.benchMove(2)} },
            { time: 20, anim: ()=>{this.benchMove(3)} },
            { time: 25, anim: ()=>{this.benchMove(4)} },
            { time: 30, anim: ()=>{this.benchMove(5)} },
            { time: 35, anim: ()=>{this.benchMove(6)} },
            { time: 40, anim: ()=>{this.benchMove(7)} },
            { time: 45, anim: ()=>{this.benchMove(8)} },
            { time: 50, anim: ()=>{this.benchMove(9)} },
            { time: 55, anim: ()=>{this.characterDisappear(0)} }
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();


        //
        this.loadingManager.itemStart("ItzikAnim");
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        this.benchGroup = new THREE.Object3D();
        this.benchCount = 10;
        this.b_offset = 5;
        this.b_radius = 20;
        this.clouds = [];
        this.items = [];
        
        this.cloudFiles = [ this.BASE_PATH + "/models/clouds/cloud_0.json", this.BASE_PATH + "/models/clouds/cloud_1.json",
                            this.BASE_PATH + "/models/clouds/cloud_2.json", this.BASE_PATH + "/models/clouds/cloud_3.json",
                            this.BASE_PATH + "/models/clouds/cloud_4.json", this.BASE_PATH + "/models/clouds/cloud_5.json",
                            this.BASE_PATH + "/models/clouds/cloud_6.json", this.BASE_PATH + "/models/clouds/cloud_7.json",
                            this.BASE_PATH + "/models/clouds/cloud_8.json", this.BASE_PATH + "/models/clouds/cloud_9.json"  ];

        this.itemFiles = [ this.BASE_PATH + "/models/items/1_baguette.json", this.BASE_PATH + "/models/items/2_coke.json",
                           this.BASE_PATH + "/models/items/3_newspaper.json", this.BASE_PATH + "/models/items/4_soccer.json",
                           this.BASE_PATH + "/models/items/5_dollhouse.json", this.BASE_PATH + "/models/items/1_baguette.json",
                           this.BASE_PATH + "/models/items/2_coke.json", this.BASE_PATH + "/models/items/3_newspaper.json",
                           this.BASE_PATH + "/models/items/4_soccer.json", this.BASE_PATH + "/models/items/5_dollhouse.json"];
        this.lightColor = [ 0xfe4226, 0xfe7826, 0xfeae26, 0xfee426, 0xfff39a, 0xa2fff4, 0x87f0ff, 0x87d4ff, 0x0966f4, 0x053d96 ];
        
        let cloudTex = tex_loader.load( this.BASE_PATH + "/images/clouds.jpg" );
        let cloudMat = new THREE.MeshLambertMaterial({map: cloudTex});

        let itemsTex = tex_loader.load( this.BASE_PATH + "/images/items.jpg" );
        let itemsMat = new THREE.MeshLambertMaterial({map: itemsTex});
        let smokeTex = tex_loader.load( this.BASE_PATH + "/images/smoke2.png" );
        this.smokeMat = new THREE.SpriteMaterial( { map: smokeTex, color: 0x053d96, transparent: true, opacity: 0 } ); //0x053d96

        for(let i=0; i<this.cloudFiles.length; i++){
            loader.load( this.cloudFiles[i], (geometry, material) => {
                let tmpCloud = new THREE.Mesh( geometry, cloudMat );

                // add point light
                    let pointLight = new THREE.PointLight( this.lightColor[i], 1, 15 );
                    pointLight.position.z = 10;
                    tmpCloud.add( pointLight );

                tmpCloud.scale.multiplyScalar(0.5);
                tmpCloud.position.y = 15;

                TweenMax.to( tmpCloud.position, 1, { y: 15.1, repeat: -1, yoyo: true, ease: Power1.easeInOut } );
                this.clouds[i] = tmpCloud;

                if(i==9){
                    //this.loadModelBench( this.BASE_PATH + "/models/bench.json", loader );
                    this.loadModelItems( this.itemFiles, itemsMat, loader );
                }
            });
        }
        
        // loader.load( url, (geometry, material) => {
        //     for(let i=0; i<this.benchCount; i++){
        //         let benchMat;
        //         if(i==0)
        //             benchMat = new THREE.MeshLambertMaterial({color: 0xff0000});
        //         else
        //             benchMat = new THREE.MeshLambertMaterial({color: 0xffffff});

        //         let tmp_bench = new THREE.Mesh( geometry.clone(), benchMat );

        //         tmp_bench.position.set( Math.sin(Math.PI*2/10*this.b_offset)*this.b_radius, 0, Math.cos(Math.PI*2/10*this.b_offset)*this.b_radius );
        //         tmp_bench.rotation.y = Math.PI*2/10*this.b_offset + Math.PI;
                
        //         tmp_bench.scale.multiplyScalar(0.0015);
        //         this.benchGroup.add( tmp_bench );
        //     }
        //     this.benchGroup.position.set( 0, -4, 15 );
        //     // this.benchGroup.rotation.y = 182 * Math.PI/180;
        //     this.add( this.benchGroup );

        //     // let tmp_bench = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({color: 0xffffff}) );
        //     // this.add( tmp_bench );
        //     // this.benches.push( tmp_bench );
        // });
        // 

        //
        this.loadingManager.itemEnd("ItzikAnim");
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    benchOutFirst() {
        TweenMax.to( this.benchGroup.children[0].scale, 1, { x: 1, y: 1, z: 1, ease: Back.easeInOut } );
    }

    // benchOutSecond() {
    //     TweenMax.to( _this.benchGroup.children[0].position, 1, { x: Math.sin( Math.PI*2/_this.benchCount*(_seq-_index+1) )*15, z: Math.cos( Math.PI*2/_this.benchCount*(_seq-_index+1) )*15, ease: Power1.easeInOut } );
    //     TweenMax.to( _this.benchGroup.children[0].rotation, 1, { y: Math.PI*2/_this.benchCount*(_seq-_index+1) + Math.PI, ease: Power1.easeInOut } );
    // }

    // benchOut( _seq ) {
    //     for(let i=0; i<=_seq; i++){
    //         TweenMax.to( this.benchGroup.children[i].scale, 1, { x: 1, y: 1, z: 1, ease: Back.easeInOut,
    //                                                                                onComplete: this.benchMove,
    //                                                                                onCompleteParams: [ this, _seq, i] } );
    //     }
    // }

    // benchMove( _this, _seq, _index ) {
    //     TweenMax.to( _this.benchGroup.children[_index].position, 1, { x: Math.sin( Math.PI*2/_this.benchCount*(_seq-_index+_this.b_offset) )*_this.b_radius, z: Math.cos( Math.PI*2/_this.benchCount*(_seq-_index+_this.b_offset) )*_this.b_radius, ease: Power1.easeInOut } );
    //     TweenMax.to( _this.benchGroup.children[_index].rotation, 1, { y: Math.PI*2/_this.benchCount*(_seq-_index+_this.b_offset) + Math.PI, ease: Power1.easeInOut } );
    // }

    benchMove( _seq ) {
        for(let i=0; i<=_seq; i++){
            let mathStuff = Math.PI * 2 / this.benchCount * ( _seq - i + this.b_offset );
            TweenMax.to( this.benchGroup.children[i].position, 1, { x: Math.sin( mathStuff )*this.b_radius, z: Math.cos( mathStuff )*this.b_radius, ease: Power1.easeInOut } );
            TweenMax.to( this.benchGroup.children[i].rotation, 1, { y: mathStuff + Math.PI, ease: Power1.easeInOut,
                                                                                             onComplete: this.benchOut,
                                                                                             onCompleteParams: [this, i] } );
        }
    }

    benchOut( _this, _index ) {
        TweenMax.to( _this.benchGroup.children[_index].scale, 1, { x: 1, y: 1, z: 1, ease: Back.easeInOut } );
    }

    characterDisappear() {
        TweenMax.to( this.smokeMat, 2, {opacity: 1});

        TweenMax.to( this.parent.fullVideo.mesh.scale, 1, { x:0.00001,y:0.00001,z:0.00001, ease: Power3.easeIn, delay: 2.5, onComplete: ()=>{
                this.parent.fullVideo.setOpacity(0.0);
                TweenMax.to( this.smokeMat, 3, {opacity: 0});
            } } );
    }


    loadModelItems( urls, mat, loader) {
        for(let i=0; i<urls.length; i++){
            loader.load( urls[i], (geometry, material) => {

                if(i!=9){
                    let tmpItem = new THREE.Mesh( geometry, mat );
                    this.items[i] = tmpItem;
                } else {
                    // let tmpItem = new THREE.Mesh( geometry, mat );
                    // this.items[i] = tmpItem;
                    let fog = new THREE.Object3D();
                    // let spriteMat = new THREE.SpriteMaterial( { map: this.smokeTex, color: 0x053d96, transparent: true, opacity: 0 } ); //0x053d96
                    for(let j=0; j<50; j++){
                        let sprite = new THREE.Sprite( this.smokeMat );
                        sprite.scale.multiplyScalar(3);
                        sprite.position.set( -7*Math.random()+3.5, -10*Math.random()+10, 4+Math.random()*2);
                        fog.add(sprite);
                    }

                    this.items[i] = fog;

                    this.loadModelBench( this.BASE_PATH + "/models/bench.json", loader );
                }
            });
        }
    }

    loadModelBench( url, loader ){
        loader.load( url, (geometry, material) => {

            for(let i=0; i<this.clouds.length; i++){
                let benchMat;
                if(i==0)
                    benchMat = new THREE.MeshLambertMaterial({color: 0xff0000});
                else
                    benchMat = new THREE.MeshLambertMaterial({color: 0xffffff});

                let tmp_bench = new THREE.Mesh( geometry.clone(), benchMat );

                tmp_bench.position.set( Math.sin(Math.PI*2/10*this.b_offset)*this.b_radius, 0, Math.cos(Math.PI*2/10*this.b_offset)*this.b_radius );
                tmp_bench.rotation.y = Math.PI*2/10*this.b_offset + Math.PI;
                tmp_bench.scale.multiplyScalar(0.0015);

                tmp_bench.add( this.clouds[i] );
                tmp_bench.add( this.items[i] );
                // console.log( this.clouds[i].children[0] );

                this.benchGroup.add( tmp_bench );
            }
            this.benchGroup.position.set( 0, -4, 15 );
            // this.benchGroup.rotation.y = 182 * Math.PI/180;
            this.add( this.benchGroup );

            // let tmp_bench = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({color: 0xffffff}) );
            // this.add( tmp_bench );
            // this.benches.push( tmp_bench );
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
