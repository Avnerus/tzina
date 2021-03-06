import ImprovedNoise from '../util/improved_noise'
import DebugUtil from '../util/debug'

export default class ItzikAnimation extends THREE.Object3D {
    constructor(config) {
        super();
        this.config = config;
        this.BASE_PATH = this.config.assetsHost + 'assets/animations/itzik';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {
        let scope = this;

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = [
            { time: 50, anim: ()=>{this.benchOutFirst()} },     //50
            { time: 60, anim: ()=>{this.benchMove(1)} },        //60
            { time: 68, anim: ()=>{this.benchMove(2)} },        //68
            { time: 75, anim: ()=>{this.benchMove(3)} },        //75
            { time: 80, anim: ()=>{this.benchMove(4)} },        //80
            { time: 85, anim: ()=>{this.benchMove(5)} },        //85
            { time: 93, anim: ()=>{this.benchRotateNoScale_On()} },     //93
            { time: 190, anim: ()=>{this.benchRotateNoScale_Off()} },   //190
            // end: 211, ani takes 13
            { time: 197, anim: ()=>{this.characterDisappear()} }//197
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
        this.benchCount = 6;   //10
        this.b_offset = 5;
        this.b_radius = 11.55;
        this.b_open_index = 0;

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
                               this.BASE_PATH + "/images/benches/5_photo.jpg", this.BASE_PATH + "/images/benches/9_tiles.jpg",
                               this.BASE_PATH + "/images/benches/7_sand.jpg", this.BASE_PATH + "/images/benches/8_rust.jpg",
                               this.BASE_PATH + "/images/benches/6_wood.jpg", this.BASE_PATH + "/images/benches/10_metal.jpg" ];
        this.benchTexNRMFiles = [ this.BASE_PATH + "/images/benches/NRM/1_carpet_NRM.png", this.BASE_PATH + "/images/benches/NRM/2_metal_NRM.png",
                               this.BASE_PATH + "/images/benches/NRM/3_marble_NRM.png", this.BASE_PATH + "/images/benches/NRM/4_rock_NRM.png",
                               this.BASE_PATH + "/images/benches/NRM/5_photo_NRM.png", this.BASE_PATH + "/images/benches/NRM/9_tiles_NRM.png",
                               this.BASE_PATH + "/images/benches/NRM/7_sand_NRM.png", this.BASE_PATH + "/images/benches/NRM/8_rust_NRM.png",
                               this.BASE_PATH + "/images/benches/NRM/6_wood_NRM.png", this.BASE_PATH + "/images/benches/NRM/10_metal_NRM.png" ];

        this.benchTextures = [];
        this.benchTexturesNRM = [];
        this.benchMats = [];
        // dispose
        this.disposeRelatedGeos = [];

        for(let i=0; i<this.benchCount; i++){
            let bt = tex_loader.load( this.benchTexFiles[i] );
            this.benchTextures.push(bt);
            let btNRM = tex_loader.load( this.benchTexNRMFiles[i] );
            this.benchTexturesNRM.push(btNRM);
            let bm = new THREE.MeshStandardMaterial({map:bt, normalMap:btNRM, roughness:1, metalness:0});
            this.benchMats.push(bm);
        }

        this.cloudTex = tex_loader.load( this.BASE_PATH + "/images/clouds.jpg" );
        this.cloudMat = new THREE.MeshLambertMaterial({map: this.cloudTex});

        this.itemsTex = tex_loader.load( this.BASE_PATH + "/images/items.jpg" );
        this.itemsMat = new THREE.MeshLambertMaterial({map: this.itemsTex});
        this.itemsTex2 = tex_loader.load( this.BASE_PATH + "/images/items2.png" );
        this.itemsMat2 = new THREE.MeshLambertMaterial({map: this.itemsTex2, transparent: true});

        this.smokeTex = tex_loader.load( this.BASE_PATH + "/images/smoke2.png" );
        this.smokeMat = new THREE.SpriteMaterial( { map: this.smokeTex, color: 0x053d96, transparent: true, opacity: 0 } ); //0x053d96
        this.fog = new THREE.Object3D();

        for(let i=0; i<this.benchCount; i++){
            loader.load( this.cloudFiles[i], (geometry, material) => {
                scope.disposeRelatedGeos.push(geometry);
                let tmpCloud = new THREE.Mesh( geometry, this.cloudMat );

                // add point light
                    let pointLight = new THREE.PointLight( this.lightColor[i], 1, 2 );
                    pointLight.position.z = 10;
                    tmpCloud.add( pointLight );
                    pointLight.visible = false;

                tmpCloud.scale.multiplyScalar(0.5);
                tmpCloud.position.y = 15;

                TweenMax.to( tmpCloud.position, 1, { y: 15.1, repeat: -1, yoyo: true, ease: Power1.easeInOut } );
                this.clouds[i] = tmpCloud;

                if( i==(this.benchCount-1) ){
                    this.loadModelItems( this.itemFiles, this.itemsMat, this.itemsMat2, loader );
                }
            });
        }

        this.dummy = {opacity: 1};

        // DebugUtil.positionObject(this, "Itzik Ani");

        events.on("experience_end", ()=>{
            this.disposeAni();
        });

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
        TweenMax.to( this.benchGroup.children[0].scale, 1.5, { x: 1, y: 1, z: 1, ease: Back.easeInOut } );
    }

    benchMove( _seq ) {
        for(let i=0; i<=_seq; i++){
            let mathStuff = Math.PI * 2 / this.benchCount * ( _seq - i + this.b_offset - 2 );

            TweenMax.to( this.benchGroup.children[i].position, 2, { x: Math.sin( mathStuff )*this.b_radius, z: Math.cos( mathStuff )*this.b_radius, ease: Power3.easeInOut } );
            TweenMax.to( this.benchGroup.children[i].rotation, 2, { y: mathStuff + Math.PI, ease: Power3.easeInOut,
                                                                                             onComplete: this.benchOut,
                                                                                             onCompleteParams: [this, i] } );
        }

        this.itemIsMoving[_seq] = true;
        if(_seq==3){
            TweenMax.to( this.benchGroup.children[3].children[1].rotation, 2, {z:1, repeat: -1, yoyo: true, ease: Power3.easeInOut} );
            // TweenMax.to( this.benchGroup.children[3].children[1].position, 1, {z:0.5, repeat: -1, yoyo: true, ease: Power1.easeInOut} );
        }
        
    }

    benchOut( _this, _index ) {
        TweenMax.to( _this.benchGroup.children[_index].scale, 1.5, { x: 1, y: 1, z: 1, ease: Back.easeInOut } );
    }

    // total took time: 14
    characterDisappear() {
        TweenMax.to( this.smokeMat, 1, {opacity: 1});
        TweenMax.to( this.fog.position, 4, {x:0, delay:0.9, ease: Power1.easeInOut});

        if (this.parent.fullVideo) {
            TweenMax.to( this.dummy, 3, { opacity:0, delay: 10, onUpdate: ()=>{
                    this.parent.fullVideo.setOpacity(this.dummy.opacity);
                }, onStart: ()=>{
                    TweenMax.to( this.smokeMat, 4, {opacity: 0});
                }, onComplete: ()=>{
                    this.parent.fullVideo.setOpacity(0.0);

                    // rotate bench group infinitely
                    let mathStuff = Math.PI * 2 / this.benchCount;
                    this.benchGroupRotateOn(this, mathStuff);

                    // loose the clouds and suns
                    for(let i=0; i<this.benchGroup.children.length; i++){
                        this.benchGroup.children[i].children[0].visible = false;
                    }
                } } );
        }
    }

    disposeAni(){
        // bench
        this.remove(this.benchGroup);   // has clouds + items
        for(var i=0; i<this.disposeRelatedGeos.length; i++){ this.disposeRelatedGeos[i].dispose(); }
        for(var i=0; i<this.benchMats.length; i++){ this.benchMats[i].dispose(); }
        for(var i=0; i<this.benchTextures.length; i++){ this.benchTextures[i].dispose(); }
        for(var i=0; i<this.benchTexturesNRM.length; i++){ this.benchTexturesNRM[i].dispose(); }

        // smoke, item, fog
        this.cloudMat.dispose();
        this.itemsMat.dispose();
        this.itemsMat2.dispose();
        this.smokeMat.dispose();
        this.cloudTex.dispose();
        this.itemsTex.dispose();
        this.itemsTex2.dispose();
        this.smokeTex.dispose();

        console.log("dispose Itzik ani!");
    }

    benchRotateNoScale_On(){
        let angle = Math.PI * 2 / this.benchCount;
        this.benchTimeline = new TimelineMax({repeat:-1});
        this.benchTimeline.to( this.benchGroup.rotation, 2, { y:"+="+angle, ease:Power3.easeInOut }, "+=2" );
        this.benchTimeline.to( this.benchGroup.rotation, 2, { y:"+="+angle, ease:Power3.easeInOut }, "+=2" );
        this.benchTimeline.to( this.benchGroup.rotation, 2, { y:"+="+angle, ease:Power3.easeInOut }, "+=2" );
        this.benchTimeline.to( this.benchGroup.rotation, 2, { y:"+="+angle, ease:Power3.easeInOut }, "+=2" );
        this.benchTimeline.to( this.benchGroup.rotation, 2, { y:"+="+angle, ease:Power3.easeInOut }, "+=2" );
        this.benchTimeline.to( this.benchGroup.rotation, 2, { y:"+="+angle, ease:Power3.easeInOut }, "+=2" );
    }
    benchRotateNoScale_Off(){
        if(this.benchTimeline==null) return;
        this.benchTimeline.pause();
    }

    benchGroupRotateOn(_this, angle){
        let closeIndex = ( _this.b_open_index+(_this.benchCount-3) ) % _this.benchCount;
        let openIndex = ( _this.b_open_index+(_this.benchCount-2) ) % _this.benchCount;
        // _this.benchGroup.children[ closeIndex ].visible = true;
        // _this.benchGroup.children[ openIndex ].visible = false;
        TweenMax.to( _this.benchGroup.children[ closeIndex ].scale, 1, { x: 1, y: 1, z: 1, ease: Power1.easeInOut } );
        TweenMax.to( _this.benchGroup.children[ openIndex ].scale, 0.5, { x: 0.01, y: 0.01, z: 0.01, ease: Power1.easeInOut } );
        _this.b_open_index ++;

        TweenMax.to( _this.benchGroup.rotation, 2, { y:"+="+angle, ease:Power3.easeInOut, delay:2, onComplete: _this.benchGroupRotateOn, onCompleteParams:[_this, angle]} );
    }


    loadModelItems( urls, mat, mat2, loader) {
        for(let i=0; i<urls.length; i++){
            loader.load( urls[i], (geometry, material) => {
                this.disposeRelatedGeos.push(geometry);

                if(i==3){
                    geometry.applyMatrix(new THREE.Matrix4().makeTranslation( -2, -1.5, 0 ) );
                    let tmpItem = new THREE.Mesh( geometry, mat );
                    tmpItem.position.set(-2.5,1.5,0);
                    this.items[i] = tmpItem;
                }
                else if(i==4 || i==6){
                    let tmpItem = new THREE.Mesh( geometry, mat2 );
                    tmpItem.position.x = -5;
                    this.items[i] = tmpItem;
                }
                else if(i==5){
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
                let _geo = geometry.clone();
                this.disposeRelatedGeos.push(_geo);
                let tmp_bench = new THREE.Mesh( _geo, this.benchMats[i] );

                tmp_bench.position.set( Math.sin(Math.PI*2/10*this.b_offset)*this.b_radius, 0, Math.cos(Math.PI*2/10*this.b_offset)*this.b_radius );
                tmp_bench.rotation.y = Math.PI*2/10*this.b_offset + Math.PI;
                tmp_bench.scale.multiplyScalar(0.005);

                tmp_bench.add( this.clouds[i] );
                tmp_bench.add( this.items[i] );

                this.benchGroup.add( tmp_bench );
            }
            this.benchGroup.position.set( 0, -4, 15 );
            this.add( this.benchGroup );
        });
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
        if(this.itemIsMoving[ (this.benchCount-1) ]){
            for(let i=0; i<this.fog.children.length; i++){
                let h = this.perlin.noise(et*0.1, i, 1)/50;
                this.fog.children[i].position.addScalar( h );
            }
        }
    }
}
