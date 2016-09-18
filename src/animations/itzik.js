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
        this.perlin = new ImprovedNoise();
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
        this.itemIsMoving = [];
        for(let i=0; i<this.benchCount; i++){
            this.itemIsMoving.push(false);
        }
        
        this.cloudFiles = [ this.BASE_PATH + "/models/clouds/cloud_0.json", this.BASE_PATH + "/models/clouds/cloud_1.json",
                            this.BASE_PATH + "/models/clouds/cloud_2.json", this.BASE_PATH + "/models/clouds/cloud_3.json",
                            this.BASE_PATH + "/models/clouds/cloud_4.json", this.BASE_PATH + "/models/clouds/cloud_5.json",
                            this.BASE_PATH + "/models/clouds/cloud_6.json", this.BASE_PATH + "/models/clouds/cloud_7.json",
                            this.BASE_PATH + "/models/clouds/cloud_8.json", this.BASE_PATH + "/models/clouds/cloud_9.json"  ];

        this.itemFiles = [ this.BASE_PATH + "/models/items/1_baguette.json", this.BASE_PATH + "/models/items/2_coke.json",
                           this.BASE_PATH + "/models/items/3_newspaper.json", this.BASE_PATH + "/models/items/4_soccer.json",
                           this.BASE_PATH + "/models/items/5_cigarettes.json", this.BASE_PATH + "/models/items/6_bags.json",
                           this.BASE_PATH + "/models/items/7_bucket.json", this.BASE_PATH + "/models/items/8_soccerFlat.json",
                           this.BASE_PATH + "/models/items/9_dollhouse.json", this.BASE_PATH + "/models/items/9_dollhouse.json"];
        this.lightColor = [ 0xfe4226, 0xfe7826, 0xfeae26, 0xfee426, 0xfff39a, 0xa2fff4, 0x87f0ff, 0x87d4ff, 0x0966f4, 0x053d96 ];

        this.benchTexFiles = [ this.BASE_PATH + "/images/benches/1_carpet.jpg", this.BASE_PATH + "/images/benches/2_metal.jpg",
                               this.BASE_PATH + "/images/benches/3_marble.jpg", this.BASE_PATH + "/images/benches/4_rock.jpg",
                               this.BASE_PATH + "/images/benches/5_photo.jpg", this.BASE_PATH + "/images/benches/6_wood.jpg",
                               this.BASE_PATH + "/images/benches/7_sand.jpg", this.BASE_PATH + "/images/benches/8_rust.jpg",
                               this.BASE_PATH + "/images/benches/9_tiles.jpg", this.BASE_PATH + "/images/benches/10_metal.jpg" ];
        this.benchTexNRMFiles = [ this.BASE_PATH + "/images/benches/NRM/1_carpet_NRM.png", this.BASE_PATH + "/images/benches/NRM/2_metal_NRM.png",
                               this.BASE_PATH + "/images/benches/NRM/3_marble_NRM.png", this.BASE_PATH + "/images/benches/NRM/4_rock_NRM.png",
                               this.BASE_PATH + "/images/benches/NRM/5_photo_NRM.png", this.BASE_PATH + "/images/benches/NRM/6_wood_NRM.png",
                               this.BASE_PATH + "/images/benches/NRM/7_sand_NRM.png", this.BASE_PATH + "/images/benches/NRM/8_rust_NRM.png",
                               this.BASE_PATH + "/images/benches/NRM/9_tiles_NRM.png", this.BASE_PATH + "/images/benches/NRM/10_metal_NRM.png" ];

        this.benchTextures = [];
        this.benchTexturesNRM = [];
        this.benchMats = [];

        for(let i=0; i<this.benchTexFiles.length; i++){
            let bt = tex_loader.load( this.benchTexFiles[i] );
            this.benchTextures.push(bt);
            let btNRM = tex_loader.load( this.benchTexNRMFiles[i] );
            this.benchTexturesNRM.push(btNRM);
            let bm = new THREE.MeshStandardMaterial({map:bt, normalMap:btNRM, roughness:1, metalness:0});
            this.benchMats.push(bm);
        }

        let cloudTex = tex_loader.load( this.BASE_PATH + "/images/clouds.jpg" );
        let cloudMat = new THREE.MeshLambertMaterial({map: cloudTex});

        let itemsTex = tex_loader.load( this.BASE_PATH + "/images/items.jpg" );
        let itemsMat = new THREE.MeshLambertMaterial({map: itemsTex});
        let itemsTex2 = tex_loader.load( this.BASE_PATH + "/images/items2.png" );
        let itemsMat2 = new THREE.MeshLambertMaterial({map: itemsTex2, transparent: true});

        let smokeTex = tex_loader.load( this.BASE_PATH + "/images/smoke2.png" );
        this.smokeMat = new THREE.SpriteMaterial( { map: smokeTex, color: 0x053d96, transparent: true, opacity: 0 } ); //0x053d96
        this.fog = new THREE.Object3D();

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
                    this.loadModelItems( this.itemFiles, itemsMat, itemsMat2, loader );
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

        this.dummy = {opacity: 1};

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

        this.itemIsMoving[_seq] = true;
        if(_seq==3){
            TweenMax.to( this.benchGroup.children[3].children[1].rotation, 1, {z:1, repeat: -1, yoyo: true, ease: Power1.easeInOut} );
            // TweenMax.to( this.benchGroup.children[3].children[1].position, 1, {z:0.5, repeat: -1, yoyo: true, ease: Power1.easeInOut} );
        }
        
    }

    benchOut( _this, _index ) {
        TweenMax.to( _this.benchGroup.children[_index].scale, 1, { x: 1, y: 1, z: 1, ease: Back.easeInOut } );
    }

    characterDisappear() {
        TweenMax.to( this.smokeMat, 1, {opacity: 1});
        TweenMax.to( this.fog.position, 4, {x:0, delay:0.9, ease: Power1.easeInOut});

        TweenMax.to( this.dummy, 3, { opacity:0, delay: 10, onUpdate: ()=>{
                this.parent.fullVideo.setOpacity(this.dummy.opacity);
            }, onStart: ()=>{
                TweenMax.to( this.smokeMat, 4, {opacity: 0});
            }, onComplete: ()=>{
                this.parent.fullVideo.setOpacity(0.0);

                // rotate bench group infinitely
                let mathStuff = Math.PI * 2 / this.benchCount;
                this.benchGroupRotateOn(this, mathStuff);
            } } );
    }

    benchGroupRotateOn(_this, angle){
        TweenMax.to( _this.benchGroup.rotation, 2, { y:"+="+angle, ease:Power3.easeInOut, delay:2, onComplete: _this.benchGroupRotateOn, onCompleteParams:[_this, angle]} );
    }


    loadModelItems( urls, mat, mat2, loader) {
        for(let i=0; i<urls.length; i++){
            loader.load( urls[i], (geometry, material) => {

                if(i==3){
                    geometry.applyMatrix(new THREE.Matrix4().makeTranslation( -2, -1.5, 0 ) );
                    let tmpItem = new THREE.Mesh( geometry, mat );
                    tmpItem.position.set(2,1.5,0);
                    this.items[i] = tmpItem;
                }
                else if(i==4 || i==5 || i==6){
                    let tmpItem = new THREE.Mesh( geometry, mat2 );
                    this.items[i] = tmpItem;
                }
                else if(i==9){
                    // let tmpItem = new THREE.Mesh( geometry, mat );
                    // this.items[i] = tmpItem;
                    // this.fog = new THREE.Object3D();

                    // let spriteMat = new THREE.SpriteMaterial( { map: this.smokeTex, color: 0x053d96, transparent: true, opacity: 0 } ); //0x053d96
                    for(let j=0; j<50; j++){
                        let sprite = new THREE.Sprite( this.smokeMat );
                        sprite.scale.multiplyScalar(3);
                        sprite.position.set( -7*Math.random()+3.5, -10*Math.random()+10, 4+Math.random()*2);
                        this.fog.add(sprite);
                    }
                    this.fog.position.x = 7;
                    this.items[i] = this.fog;

                    this.loadModelBench( this.BASE_PATH + "/models/bench.json", loader );
                }
                else {
                    let tmpItem = new THREE.Mesh( geometry, mat );
                    this.items[i] = tmpItem;
                }
            });
        }
    }

    loadModelBench( url, loader ){
        loader.load( url, (geometry, material) => {

            for(let i=0; i<this.clouds.length; i++){
                //let benchMat;
                // if(i==0)
                //     benchMat = new THREE.MeshLambertMaterial({color: 0xff0000});
                // else
                    //benchMat = new THREE.MeshLambertMaterial({color: 0xffffff});

                let tmp_bench = new THREE.Mesh( geometry.clone(), this.benchMats[i] );

                tmp_bench.position.set( Math.sin(Math.PI*2/10*this.b_offset)*this.b_radius, 0, Math.cos(Math.PI*2/10*this.b_offset)*this.b_radius );
                tmp_bench.rotation.y = Math.PI*2/10*this.b_offset + Math.PI;
                tmp_bench.scale.multiplyScalar(0.005);

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

        if(this.itemIsMoving[9]){
            for(let i=0; i<this.fog.children.length; i++){
                let h = this.perlin.noise(et*0.1, i, 1)/50;
                this.fog.children[i].position.addScalar( h );
            }
        }
    }
}
