import DebugUtil from '../util/debug'
import MultilineText from '../util/multiline_text'
import {textAlign} from '../lib/text2d/index'

export default class Agam12PMAnimation extends THREE.Object3D {
    constructor( config, square ) {
        super();
        this.config = config;
        this.BASE_PATH = this.config.assetsHost + 'assets/animations/agam12pm';

        this.square = square;
        this.didInit = false;

        this.INTRO_TEXT = [
            "Yaakov Agam, 89 years old.",
            "The godfather of Kinetic art and one of the first",
            "who asked the viewer to participate.",
            "This fountain, \“Water and Fire\”, is a piece that",
            "represents the core of his philosophy."
        ]

        this.INTRO_TEXT_HEB = [
            ".יעקב אגם, בן 89",
            "אבי האמנות הקינטית ומהראשונים",
            ".ששיתפו את הצופה ביצירה עצמה",
            ".המזרקה, פסל \"המים והאש\", מהווה את יסוד תורתו",
        ]

        this.showedIntro = false;
    }

    init(loadingManager) {
        if (!this.didInit) {
            this.loadingManager = loadingManager;
            this.setupAnim();

            // Intro text
            this.text = this.generateText();
            this.text.hide(0);
            this.text.setText(this.config.language == "heb" ? this.INTRO_TEXT_HEB : this.INTRO_TEXT);
            this.add(this.text);
            //DebugUtil.positionObject(this.text, "Agam text");

            this.didInit = true;
        }
    }

    showIntroText() {
        this.showedIntro = true;
        this.text.show(1);
        setTimeout(() => {
            if (this.text) {
                this.text.hide(1)
                .then(() => {
                    this.remove(this.text);
                });
            }            
        },20000);
    }

    generateText() {
        let TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '70px Miriam Libre',
             fillStyle: '#33e5ab',
             antialias: true,
             shadow: true,
             shadowSize: 6
        }
        let text = new MultilineText(5, TEXT_DEFINITION, 100);
        text.init();

        text.position.set(-9.1,5.4,-9,56);
        text.scale.set(0.0087,0.0087,0.0087);
        
        return text;
    }

    setupAnim() {

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = [
            { time: 15,  anim: ()=>{this.firstAni()} }
            // { time: 30,  anim: ()=>{this.characterDisappear()} }
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();

        this.loadingManager.itemStart("Agam12PMAnim");

        //        
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        let agamTex = tex_loader.load( this.BASE_PATH + "/images/agamFigure.jpg" );
        this.agamMat = new THREE.MeshLambertMaterial({map: agamTex});
        loader.load( this.BASE_PATH + "/models/agamFigure.json", (geometry, material) => {
            this.agamGeo = geometry;
            this.agamArt = new THREE.Mesh( this.agamGeo, this.agamMat );
            this.agamArt.position.set(-.44, .32, -4.78);
            this.agamArt.scale.multiplyScalar(1.31);
            this.add(this.agamArt);
            // DebugUtil.positionObject(this.agamArt, "agamArt");
        });

        let agamSmallTex_1 = tex_loader.load( this.BASE_PATH + "/images/agamSmall_1.jpg" );
        let agamSmallTex_2 = tex_loader.load( this.BASE_PATH + "/images/agamSmall_2.jpg" );
        this.agamSMat1 = new THREE.MeshLambertMaterial({map: agamSmallTex_1});
        this.agamSMat2 = new THREE.MeshLambertMaterial({map: agamSmallTex_2});
        loader.load( this.BASE_PATH + "/models/agamSmall.json", (geometry, material) => {
            this.agamGeoS = geometry;

            this.agamSmall_1 = new THREE.Mesh( this.agamGeoS, this.agamSMat1 );
            this.agamSmall_1.position.set(2.88, .26, -2.21);
            this.agamSmall_1.scale.multiplyScalar(0.56);
            this.add(this.agamSmall_1);
            // DebugUtil.positionObject(this.agamSmall_1, "agamSmall_1");

            this.agamSmall_2 = new THREE.Mesh( this.agamGeoS, this.agamSMat2 );
            this.agamSmall_2.position.set(-2, .18, -1.85);
            this.agamSmall_2.scale.multiplyScalar(0.5);
            this.add(this.agamSmall_2);
            // DebugUtil.positionObject(this.agamSmall_2, "agamSmall_2");
        });

        /*
        let testCube = new THREE.Mesh( new THREE.BoxGeometry(4,1,1), new THREE.MeshLambertMaterial({color: 0xff0000}) );
        this.add(testCube);
        DebugUtil.positionObject(testCube, "testCube");*/

        this.dummy = {opacity: 1};

        events.on("experience_end", ()=>{
            this.disposeAni();
        });

        // DebugUtil.positionObject(this, "Agam Ani");
        //
        this.loadingManager.itemEnd("Agam12PMAnim");
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    firstAni(){
        //
    }

    characterDisappear() {
        TweenMax.to( this.dummy, 5, { opacity:0, onUpdate: ()=>{
                this.parent.fullVideo.setOpacity(this.dummy.opacity);
            }, onStart: ()=>{
                //...
            }, onComplete: ()=>{
                this.parent.fullVideo.setOpacity(0.0);
            } } );
    }

    disposeAni() {
        this.remove(this.text);
        this.remove(this.agamArt);
        this.remove(this.agamSmall_1);
        this.remove(this.agamSmall_2);

        this.agamMat.map.dispose();
        this.agamSMat1.map.dispose();
        this.agamSMat2.map.dispose();
        this.agamMat.dispose();
        this.agamSMat1.dispose();
        this.agamSMat2.dispose();
        this.agamGeo.dispose();
        this.agamGeoS.dispose();

        console.log("dispose Agam ani!");
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
        
        if (!this.showedIntro && time >= 10) {
            this.showIntroText();
        }

        if (this.nextAnim && time >= this.nextAnim.time) {
            console.log("do anim sequence ", this.nextAnim);
            this.nextAnim.anim();
            if (this.currentSequence.length > 0) {
                this.nextAnim = this.currentSequence.shift();
            } else {
                this.nextAnim = null;
            }
        }

        this.square.fountain.updateVideoTime(time);
    }

    update(dt,et) {
        // 
    }
}
