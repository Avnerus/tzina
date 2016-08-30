import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import EndArrayPlugin from '../util/EndArrayPlugin'
import DebugUtil from '../util/debug'
TweenPlugin.activate([EndArrayPlugin]);

export default class HaimAnimation extends THREE.Object3D {
    constructor( renderer ) {
        super();
        this.BASE_PATH = 'assets/animations/haim';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
        // DebugUtil.positionObject(this, "haim anim");
    }

    setupAnim() {
        this.loadingManager.itemStart("HaimAnim");
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        // setup animation sequence
        // time: when to start animation, duration: how fast the animation is
        this.sequenceConfig = [
            { time: 10,  anim: ()=>{this.tubeDown(1)} },
            { time: 30, anim: ()=>{this.tubeOut(0.5)} },
            { time: 50, anim: ()=>{this.characterDisappear()} }
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        // TUBE
        this.ARC_SEGMENTS = 20;

        let liquidTex = tex_loader.load(this.BASE_PATH + '/images/liquid_trans.png');
        liquidTex.repeat.x = 1;
        liquidTex.repeat.y = 1;
        liquidTex.offset.x = -1.5;
        // liquidTex.offset.y = 0.5;

        let liquidOutTex = tex_loader.load(this.BASE_PATH + '/images/liquid_trans.png');
        liquidOutTex.offset.x = -1.5;

        //
        let curveData = [ {"0": [["-3.159", "10.927", "0.000"], ["-3.189", "11.500", "0.000"], ["-3.177", "12.022", "0.000"], ["-3.136", "12.631", "0.000"], ["-3.128", "13.234", "0.000"]], "1": [["-3.781", "8.857", "0.000"], ["-3.286", "9.857", "0.000"], ["-3.160", "11.100", "0.000"], ["-3.068", "12.128", "0.000"], ["-3.128", "13.234", "0.000"]], "2": [["-7.611", "5.348", "0.000"], ["-6.050", "7.141", "0.000"], ["-4.323", "8.570", "0.000"], ["-3.094", "10.206", "0.000"], ["-3.128", "13.234", "0.000"]], "3": [["-5.944", "2.942", "0.000"], ["-6.979", "5.283", "0.000"], ["-4.898", "7.275", "0.000"], ["-3.115", "9.459", "0.000"], ["-3.128", "13.234", "0.000"]], "4": [["-1.120", "0.241", "0.000"], ["-2.292", "1.358", "0.000"], ["-3.449", "3.592", "0.000"], ["-3.163", "7.837", "0.000"], ["-3.128", "13.234", "0.000"]]},
                          {"0": [["2.018", "10.354", "0.000"], ["2.019", "10.557", "0.000"], ["2.019", "10.644", "0.000"], ["2.019", "10.857", "0.000"], ["2.019", "11.103", "0.000"]], "1": [["3.076", "8.242", "0.000"], ["2.423", "9.122", "0.000"], ["2.229", "9.807", "0.000"], ["2.089", "10.399", "0.000"], ["2.023", "11.103", "0.000"]], "2": [["4.283", "5.164", "0.000"], ["4.339", "6.507", "0.000"], ["3.444", "7.655", "0.000"], ["2.348", "9.105", "0.000"], ["2.026", "11.103", "0.000"]], "3": [["3.733", "4.397", "0.000"], ["5.174", "5.680", "0.000"], ["4.101", "7.572", "0.000"], ["2.319", "8.977", "0.000"], ["2.027", "11.103", "0.000"]], "4": [["0.309", "1.753", "0.000"], ["0.922", "2.383", "0.000"], ["2.148", "3.644", "0.000"], ["2.068", "8.616", "0.000"], ["2.028", "11.103", "0.000"]]},
                          {"0": [["-5.225", "11.075", "0.000"], ["-5.225", "11.207", "0.000"], ["-5.225", "11.322", "0.000"], ["-5.225", "11.454", "0.000"], ["-5.229", "11.617", "0.000"]], "1": [["-5.531", "9.877", "0.000"], ["-5.346", "10.366", "0.000"], ["-5.282", "10.892", "0.000"], ["-5.207", "11.245", "0.000"], ["-5.229", "11.617", "0.000"]], "2": [["-6.292", "7.159", "0.000"], ["-6.103", "8.209", "0.000"], ["-5.783", "9.283", "0.000"], ["-5.226", "10.430", "0.000"], ["-5.229", "11.617", "0.000"]], "3": [["-6.584", "4.154", "0.000"], ["-7.290", "5.244", "0.000"], ["-6.810", "7.861", "0.000"], ["-5.263", "9.541", "0.000"], ["-5.229", "11.617", "0.000"]], "4": [["-2.564", "1.722", "0.000"], ["-4.488", "2.871", "0.000"], ["-5.184", "6.074", "0.000"], ["-5.283", "9.124", "0.000"], ["-5.229", "11.617", "0.000"]]},
                          {"0": [["4.340", "10.498", "0.000"], ["4.340", "10.631", "0.000"], ["4.340", "10.763", "0.000"], ["4.340", "10.949", "0.000"], ["4.340", "11.109", "0.000"]], "1": [["4.883", "9.308", "0.000"], ["4.646", "9.712", "0.000"], ["4.466", "10.098", "0.000"], ["4.394", "10.526", "0.000"], ["4.340", "11.109", "0.000"]], "2": [["5.913", "6.951", "0.000"], ["5.945", "7.930", "0.000"], ["5.383", "8.794", "0.000"], ["4.804", "9.583", "0.000"], ["4.340", "11.109", "0.000"]], "3": [["5.201", "3.987", "0.000"], ["6.796", "4.851", "0.000"], ["7.024", "6.938", "0.000"], ["4.738", "8.295", "0.000"], ["4.340", "11.109", "0.000"]], "4": [["0.395", "0.520", "0.000"], ["2.293", "1.171", "0.000"], ["4.523", "2.861", "0.000"], ["4.307", "8.094", "0.000"], ["4.340", "11.109", "0.000"]]} ];
        this.tubes = [];
        this.liquidInTubes = [];
        this.tubesVec = [];
        this.tubesCurve = [];

        // PARSE DATA
        for(let k=0; k<curveData.length; k++) {
            let curve_vec = {};
            let c_size = Object.keys( curveData[k] ).length;

            for(let i=0; i<c_size; i++) {
                curve_vec[i] = [];
                for(let j=0; j<curveData[k][i].length; j++){
                    let newVector = new THREE.Vector3( Number(curveData[k][i][j][0]),
                                                       Number(curveData[k][i][j][1]),
                                                       Number(curveData[k][i][j][2]) );
                    // scale down
                        newVector.multiplyScalar(0.5);
                        // newVector.multiply( new THREE.Vector3(1,2,1) );
                    curve_vec[i].push( newVector );
                }
            }
            this.tubesVec.push( curve_vec );
        }

        // CLOUND
        let cloudTex = tex_loader.load( this.BASE_PATH + '/images/clouds.png' );
        // cloudTex.repeat.y = 2;
        this.cloudMat = new THREE.MeshBasicMaterial( {color: 0x00ffff, map: cloudTex, blending: "AdditiveBlending", transparent: true, side: THREE.DoubleSide, opacity: 0.4} );

        // TUBE_BAG
        this.bag;
        this.bagTexs = [], this.bagAniTexs = [];
        let bagFiles = [ this.BASE_PATH + '/images/tubeBag.png', this.BASE_PATH + '/images/tubeBag_B.png',
                         this.BASE_PATH + '/images/tubeBag_E.png', this.BASE_PATH + '/images/tubeBag_M.png'];
        let bagAniFiles = [ this.BASE_PATH + '/images/lip_ani.png', this.BASE_PATH + '/images/wool_ani.png',
                            this.BASE_PATH + '/images/eye_ani.png', this.BASE_PATH + '/images/dollar_ani.png'];
        for(let i=0; i<bagFiles.length; i++){
            let bagTex = tex_loader.load( bagFiles[i] );
            let bagAniTex = tex_loader.load( bagAniFiles[i] );
            this.bagTexs.push( bagTex );
            this.bagAniTexs.push( bagAniTex );
        }

        // OUT_BOUND CURVES
        let curveOutData = [ {"0": [["-0.147", "1.266", "0.000"], ["0.065", "1.479", "0.000"], ["0.207", "1.585", "0.000"], ["0.384", "1.869", "0.000"], ["0.597", "2.188", "0.000"]], "1": [["-0.147", "1.266", "0.000"], ["0.233", "1.658", "0.000"], ["0.630", "2.155", "0.000"], ["1.191", "2.917", "0.000"], ["1.528", "3.654", "0.000"]], "2": [["-0.147", "1.266", "0.000"], ["0.758", "2.335", "0.000"], ["1.724", "3.843", "0.000"], ["2.172", "6.088", "0.000"], ["2.369", "8.359", "0.000"]], "3": [["-0.147", "1.266", "0.000"], ["1.466", "2.775", "0.000"], ["2.347", "5.554", "0.000"], ["2.663", "9.469", "0.000"], ["2.790", "12.589", "0.000"]], "4": [["-0.147", "1.266", "0.000"], ["1.896", "2.992", "0.000"], ["2.635", "6.535", "0.000"], ["2.875", "11.431", "0.000"], ["2.972", "14.938", "0.000"]]},
                             {"0": [["-0.633", "0.149", "0.000"], ["-0.895", "0.234", "0.000"], ["-1.105", "0.360", "0.000"], ["-1.367", "0.456", "0.000"], ["-1.597", "0.578", "0.000"]], "1": [["-0.633", "0.149", "0.000"], ["-1.193", "0.319", "0.000"], ["-1.684", "0.615", "0.000"], ["-2.361", "0.931", "0.000"], ["-3.178", "1.504", "0.000"]], "2": [["-0.633", "0.149", "0.000"], ["-1.789", "0.705", "0.000"], ["-2.732", "1.524", "0.000"], ["-3.950", "3.068", "0.000"], ["-4.440", "5.833", "0.000"]], "3": [["-0.633", "0.149", "0.000"], ["-2.132", "1.118", "0.000"], ["-3.568", "2.806", "0.000"], ["-4.379", "6.028", "0.000"], ["-4.347", "10.511", "0.000"]], "4": [["-0.633", "0.149", "0.000"], ["-2.292", "1.358", "0.000"], ["-3.632", "3.592", "0.000"], ["-4.259", "7.837", "0.000"], ["-4.254", "13.234", "0.000"]]},
                             {"0": [["-1.262", "0.857", "0.000"], ["-1.400", "0.882", "0.000"], ["-1.543", "0.917", "0.000"], ["-1.677", "0.953", "0.000"], ["-1.850", "1.034", "0.000"]], "1": [["-1.486", "0.904", "0.000"], ["-2.084", "1.038", "0.000"], ["-2.531", "1.239", "0.000"], ["-2.895", "1.468", "0.000"], ["-3.302", "1.702", "0.000"]], "2": [["-2.157", "1.132", "0.000"], ["-3.441", "1.852", "0.000"], ["-4.398", "2.858", "0.000"], ["-5.202", "4.046", "0.000"], ["-5.580", "5.445", "0.000"]], "3": [["-2.844", "1.709", "0.000"], ["-4.513", "4.023", "0.000"], ["-5.346", "6.622", "0.000"], ["-5.645", "8.918", "0.000"], ["-5.625", "11.571", "0.000"]], "4": [["-2.918", "2.360", "0.000"], ["-4.913", "5.778", "0.000"], ["-5.609", "8.980", "0.000"], ["-5.708", "12.031", "0.000"], ["-5.796", "15.019", "0.000"]]},
                             {"0": [["-0.420", "0.945", "0.000"], ["-0.216", "0.961", "0.000"], ["-0.019", "1.000", "0.000"], ["0.138", "1.050", "0.000"], ["0.281", "1.118", "0.000"]], "1": [["-0.420", "0.945", "0.000"], ["-0.008", "0.980", "0.000"], ["0.349", "1.109", "0.000"], ["0.823", "1.268", "0.000"], ["1.226", "1.537", "0.000"]], "2": [["-0.420", "0.945", "0.000"], ["0.767", "1.323", "0.000"], ["2.006", "2.157", "0.000"], ["3.105", "3.346", "0.000"], ["4.046", "4.728", "0.000"]], "3": [["-0.420", "0.945", "0.000"], ["1.857", "1.863", "0.000"], ["3.865", "4.380", "0.000"], ["4.745", "7.761", "0.000"], ["5.188", "10.209", "0.000"]], "4": [["-0.420", "0.945", "0.000"], ["2.399", "2.199", "0.000"], ["5.019", "5.944", "0.000"], ["5.548", "11.248", "0.000"], ["5.474", "13.625", "0.000"]]} ];
        this.outTubes = [];
        this.liquidInOutTubes = [];
        this.outTubesVec = [];
        this.outTubesCurve = [];

        // PARSE DATA
        for(let k=0; k<curveOutData.length; k++) {
            let curve_vec = {};
            let c_size = Object.keys( curveOutData[k] ).length;

            for(let i=0; i<c_size; i++) {
                curve_vec[i] = [];
                for(let j=0; j<curveOutData[k][i].length; j++){
                    let newVector = new THREE.Vector3( Number(curveOutData[k][i][j][0]),
                                                       Number(curveOutData[k][i][j][1]),
                                                       Number(curveOutData[k][i][j][2]) );
                    // scale down
                        // newVector.multiplyScalar(0.7);
                        newVector.multiply( new THREE.Vector3(0.9,0.6,0.9) );
                    curve_vec[i].push( newVector );
                }
            }
            this.outTubesVec.push( curve_vec );
        }

        loader.load(this.BASE_PATH + "/models/haim_tubeBag.json", (geometry, material) => {
            this.bag = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {map: this.bagTexs[0], transparent: true} ) );
            
            loader.load(this.BASE_PATH + "/models/cloud.json", (geometry, material) => {
                this.cloud = new THREE.Mesh( geometry, this.cloudMat );
                // this.cloud.rotation.x = Math.PI/2;
                this.cloud.scale.multiplyScalar(0.01);

                // CREATE CURVE
                this.cvMaterial = new THREE.MeshBasicMaterial({color: 0x00ffff, wireframe: true, morphTargets: true, transparent: true, opacity: 0.1});
                this.liquidMaterial = new THREE.MeshBasicMaterial({map: liquidTex, transparent: true, opacity: 0.9});
                this.liquidDown = false;
                this.createCurve( new THREE.Vector3(), new THREE.Vector3() );
                this.createCurve( new THREE.Vector3(), new THREE.Vector3(0,0.25,0) );
                this.createCurve( new THREE.Vector3(), new THREE.Vector3(0,-0.5,0) );

                // CREATE OUT_BOUDN CURVE
                this.cvOutMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true, morphTargets: true, transparent: true, opacity: 0.1});
                this.liquidOutMaterial = new THREE.MeshBasicMaterial({map: liquidOutTex, transparent: true, opacity: 0.9});
                this.liquidOut = false;
                this.createOutCurve( new THREE.Vector3(), new THREE.Vector3(0,0.3,0) );
                this.createOutCurve( new THREE.Vector3(), new THREE.Vector3(0,-0.2,0) );

                this.initSPEParicle( tex_loader );
                this.createGroundPuddle( tex_loader );
            });
        });

        // SPINE
        let boneTex = tex_loader.load( this.BASE_PATH + '/images/bone.jpg' );
        boneTex.wrapS = boneTex.wrapT = THREE.RepeatWrapping;
        boneTex.repeat.set( 5, 5 );
        loader.load(this.BASE_PATH + "/models/spine.json", (geometry, material) => {
            this.boneGeo = geometry.clone();
            this.spine = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({map: boneTex}) );
            this.add( this.spine );
        });

        //
        this.loadingManager.itemEnd("HaimAnim");
    }

    initSPEParicle( tex_loader) {
        let particleTex = tex_loader.load(this.BASE_PATH + '/images/tubeBag_ani_3.png');

        this.particleGroup = new SPE.Group({
            texture: {
                value: particleTex,
                frames: new THREE.Vector2(4,4),
                frameCount: 16,
                loop: 3
            },
            depthTest: false
        });

        // reduce emitter amount to be 1/5 of domeMorphTargets.length
        for(let i = 0; i < this.outTubes.length; i++){
            let emitter = new SPE.Emitter({
                // type: SPE.distributions.SPHERE,
                // duration: 10,
                maxAge: {
                    value: 10,
                    spread: 4
                },
                position: {
                    value: this.outTubes[i].children[2].position,
                    spread: new THREE.Vector3(5,0,5)
                    // radius: 0.5
                },
                acceleration: {
                    value: new THREE.Vector3(0,-1.2,0),
                    spread: new THREE.Vector3(0,-1,0)       //0,-2,0
                },
                velocity: {
                    value: new THREE.Vector3(0.1,-1,0.1)  //0.1,-0.5,0.1
                },
                // rotation: {
                //     angle: 0.5
                // },
                // angle: {
                //     value: [0,0.5,-0.5],
                //     spread: [0,-0.5,0.5]
                // },
                opacity: {
                    value: [.5,1,1,1,1,0]
                },
                size: {
                    value: [.1,2,3,3,2],
                    spread: 1
                },
                particleCount: 15
                // drag: 0.1,
                // activeMultiplier: 0.5
            });
            this.particleGroup.addEmitter( emitter );
            // console.log( this.particleGroup.emitters[0] );
        }
        this.add( this.particleGroup.mesh );

    }

    createGroundPuddle( tex_loader) {
        this.puddles = new THREE.Object3D();
        this.puddleAnimators = [];
        let puddleTex = tex_loader.load( this.BASE_PATH + '/images/puddle.png');
        let puddleMats = [];
        let orders = [ [0,1,2,3,2,0], [1,2,3,2,0,1], [2,3,2,0,1,2], [3,2,0,1,2,3] ];

        for(let i=0; i<orders.length; i++){
            let pTex = puddleTex.clone();
            pTex.needsUpdate = true;
            let puddleAni = new TextureAnimator( pTex, 4, 1, 6, 60, orders[i] );
            let puddleMat = new THREE.MeshBasicMaterial({map: pTex, transparent: true, side: THREE.DoubleSide, opacity: 0.5});

            this.puddleAnimators.push(puddleAni);
            puddleMats.push(puddleMat);
        }
        
        var puddleGeo = new THREE.PlaneGeometry(5,5);
        for(let i=0; i<50; i++){
            let puddle = new THREE.Mesh(puddleGeo, puddleMats[i%4]);
            puddle.position.set(Math.random()*14-7,
                                -1,
                                Math.random()*16-8 +3);
            puddle.rotation.x = Math.PI/2;
            // puddle.scale.multiplyScalar( (Math.random()+1) );
            this.puddles.add(puddle);
            //this.add(puddle);
        }
        this.add(this.puddles);
        console.log(this.puddles);
        console.log(this.puddleAnimators);
        DebugUtil.positionObject(this.puddles, "puddle");
    }

    createCurve( pos, rot ){
        for(let j=0; j<this.tubesVec.length; j++){
            let tubeObject = new THREE.Object3D();

            let curve_points = [];
            let c_size2 = Object.keys( this.tubesVec[j] ).length;

            for(let i=0; i<c_size2; i++) {
                let cSpline = new THREE.CatmullRomCurve3( this.tubesVec[j][i] );
                cSpline.type = 'chordal';
                // cSpline.closed = true;
                // let manCurve = manSpline.getPoints( 50 );
                curve_points.push(cSpline);
            }

            let cvGeometry = new THREE.TubeGeometry( curve_points[curve_points.length-1], this.ARC_SEGMENTS, 0.05, 3, false);
            for(let i=0; i<curve_points.length-1; i++){
                let cvGeometry2 = new THREE.TubeGeometry( curve_points[i], this.ARC_SEGMENTS, 0.05, 3, false);
                let nameee = 't'+(i);
                cvGeometry.morphTargets[i] = {name: nameee, vertices: cvGeometry2.vertices};
            }
            cvGeometry.computeMorphNormals();

            // children_0
            let cvTube = new THREE.Mesh(cvGeometry, this.cvMaterial);
            // cvTube.position.copy( pos );
            // cvTube.rotation.set( rot.x, rot.y, rot.z );
            cvTube.morphTargetInfluences[0] = 1;
            tubeObject.add( cvTube );
            // this.tubes.push( cvTube );

            // children_1
            let liquidGeo = new THREE.TubeGeometry( curve_points[curve_points.length-1], this.ARC_SEGMENTS, 0.03, 3, false);
            let tubeLiquid = new THREE.Mesh(liquidGeo, this.liquidMaterial);
            // tubeLiquid.position.copy( pos );
            // tubeLiquid.rotation.set( rot.x, rot.y, rot.z );
            tubeObject.add( tubeLiquid );

            // children_2
            let theBag = this.bag.clone();
            theBag.material = new THREE.MeshBasicMaterial( {map: this.bagTexs[j%4], transparent: true} );
            let lengthhh = liquidGeo.vertices.length-1;
            theBag.position.copy( liquidGeo.vertices[lengthhh] );
            theBag.scale.multiplyScalar( this.clamp(this.lookupTable[j], 0.3, 1) );
            theBag.rotation.y = -rot.y + this.lookupTable[j]/2;
            tubeObject.add( theBag );

            // children_3 -> COULDS
            let theCloud = this.cloud.clone();
            lengthhh = liquidGeo.vertices.length-1;
            theCloud.position.copy( liquidGeo.vertices[lengthhh] );
            // theCloud.position.y += (this.lookupTable[j]*2);
            tubeObject.add( theCloud );

            tubeObject.position.copy( pos );
            tubeObject.rotation.set( rot.x, rot.y, rot.z );
            this.tubes.push( tubeObject );
            this.add( tubeObject );
            // this.liquidInTubes.push( tubeLiquid );
        }
    }

    createOutCurve( pos, rot ){
        for(let j=0; j<this.outTubesVec.length; j++){
            let tubeObject = new THREE.Object3D();

            let curve_points = [];
            let c_size2 = Object.keys( this.outTubesVec[j] ).length;

            for(let i=0; i<c_size2; i++) {
                let cSpline = new THREE.CatmullRomCurve3( this.outTubesVec[j][i] );
                cSpline.type = 'chordal';
                curve_points.push(cSpline);
            }

            let cvGeometry = new THREE.TubeGeometry( curve_points[curve_points.length-1], this.ARC_SEGMENTS, 0.05, 3, false);
            for(let i=0; i<curve_points.length-1; i++){
                let cvGeometry2 = new THREE.TubeGeometry( curve_points[i], this.ARC_SEGMENTS, 0.05, 3, false);
                let nameee = 't'+(i);
                cvGeometry.morphTargets[i] = {name: nameee, vertices: cvGeometry2.vertices};
            }
            cvGeometry.computeMorphNormals();

            // children_0
            let cvTube = new THREE.Mesh(cvGeometry, this.cvOutMaterial);
            cvTube.morphTargetInfluences[0] = 1;
            tubeObject.add( cvTube );

            // children_1
            let liquidGeo = new THREE.TubeGeometry( curve_points[curve_points.length-1], this.ARC_SEGMENTS, 0.03, 3, false);
            let tubeLiquid = new THREE.Mesh(liquidGeo, this.liquidOutMaterial);
            tubeObject.add( tubeLiquid );

            // children_2 -> COULDS
            let theCloud = this.cloud.clone();
            let lengthhh = liquidGeo.vertices.length-1;
            theCloud.position.copy( liquidGeo.vertices[lengthhh] );
            // theBag.scale.multiplyScalar( this.clamp(this.lookupTable[j], 0.3, 1) );
            // theBag.rotation.y = -rot.y;
            tubeObject.add( theCloud );

            tubeObject.position.copy( pos );
            tubeObject.rotation.set( rot.x, rot.y, rot.z );
            this.outTubes.push( tubeObject );
            this.add( tubeObject );
        }
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    addSplineObject( position ) {
        let geometry = new THREE.BoxGeometry(0.5,0.5,0.5);
        let object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff} ) );
        if ( position ) {
            object.position.copy( position );
        } else {
            object.position.x = Math.random() * 10 - 5;
            object.position.y = Math.random() * 6;
            object.position.z = Math.random() * 10 - 5;
        }
        this.add( object );
        this.splineHelperObjects.push( object );
        return object;
    }

    updateSplineOutline() {
        let p, p2;
        // for ( let k in this.splines ) {
            let spline = this.splines.line;
            let splineMesh = spline.mesh;
            for ( let i = 0; i < this.ARC_SEGMENTS; i +=2 ) {
                p = splineMesh.geometry.vertices[ i ];
                p.copy( spline.getPoint( i /  ( this.ARC_SEGMENTS - 1 ) ) );
                p2 = splineMesh.geometry.vertices[ i+1 ];
                p2.copy(p).add( new THREE.Vector3(1,0,0) );
            }
            splineMesh.geometry.verticesNeedUpdate = true;
        // }
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    tubeDown(_duration) {
        /*
        let tmpEndArray  = [1,0,0,0];
        let tmpEndArray2 = [0,1,0,0];
        let tmpEndArray3 = [0,0,1,0];
        let tmpEndArray4 = [0,0,0,1];
        let targets = [];
        for(let i=0; i<this.tubes.length; i++){
            targets.push( this.tubes[i].children[0].morphTargetInfluences );
        }
        this.tl = new TimelineMax();    //{repeat: -1}
        this.tl.to( targets, _duration*2, { endArray: tmpEndArray, ease: Power0.easeNone, onStart: ()=>{
                    this.tubes[0].children[1].material.map.offset.x=-1.5;
               }} )
               .to( targets, _duration*2, { endArray: tmpEndArray2, ease: Power0.easeNone })
               .to( targets, _duration*2, { endArray: tmpEndArray3, ease: Power0.easeNone })
               .to( targets, _duration, { endArray: tmpEndArray4, ease: Power0.easeNone, onStart: ()=>{
                    this.tubes[0].children[1].material.map.offset.x=-1.5;
                    this.liquidDown = true;
               } });
        */
        let tmpEndArray  = [0,1,0,0];
        let tmpEndArray2 = [0,0,1,0];
        let tmpEndArray3 = [0,0,0,1];
        let tmpEndArray4 = [0,0,0,0];
        let targets = [];
        for(let i=0; i<this.tubes.length; i++){
            targets.push( this.tubes[i].children[0].morphTargetInfluences );
        }
        // hide the liquid
        this.tubes[0].children[1].material.transparent = true;
        this.tubes[0].children[1].material.opacity = 0;
        this.outTubes[0].children[1].material.transparent = true;
        this.outTubes[0].children[1].material.opacity = 0;

        this.tl = new TimelineMax();    //{repeat: -1}
        this.tl.to( targets, _duration, { endArray: tmpEndArray, ease: Power0.easeNone, onStart: ()=>{
                    this.tubes[0].children[1].material.map.offset.x=-1.5;
               }} )
               .to( targets, _duration, { endArray: tmpEndArray2, ease: Power0.easeNone })
               .to( targets, _duration, { endArray: tmpEndArray3, ease: Power0.easeNone })
               .to( targets, _duration/1.5, { endArray: tmpEndArray4, ease: Back.easeInOut.config(2.5), onStart: ()=>{
                    this.tubes[0].children[1].material.opacity = 1;
                    this.tubes[0].children[1].material.map.offset.x=-1.5;
                    this.liquidDown = true;
               }, onComplete: ()=>{
                    for(let i=0; i<this.tubes.length; i++){
                        TweenMax.to( this.tubes[i].children[2].scale, _duration*(this.clamp(this.tubes[i].children[2].scale.x, 0.5, 1)*20), { x: 0.01, y: 0.01, z: 0.01, ease: Bounce.easeInOut } );
                    }
               } });
    }

    tubeOut(_duration) {
        let tmpEndArray  = [0,1,0,0];
        let tmpEndArray2 = [0,0,1,0];
        let tmpEndArray3 = [0,0,0,1];
        let tmpEndArray4 = [0,0,0,0];
        let targets = [];
        for(let i=0; i<this.outTubes.length; i++){
            targets.push( this.outTubes[i].children[0].morphTargetInfluences );
        }
        this.tl = new TimelineMax();    //{repeat: -1}
        this.tl.to( targets, _duration*1.5, { endArray: tmpEndArray, ease: Back.easeInOut.config(2.5), onStart: ()=>{
                    // this.tubes[0].children[1].material.map.offset.x=-1.5;
               }} )
               .to( targets, _duration*2, { endArray: tmpEndArray2, ease: Power0.easeNone })
               .to( targets, _duration*2, { endArray: tmpEndArray3, ease: Power0.easeNone })
               .to( targets, _duration*2, { endArray: tmpEndArray4, ease: Power0.easeNone, onComplete: ()=>{
                    // this.tubes[0].children[1].material.map.offset.x=-1.5;
                    // this.liquidOut = true;
                    // this.fbo.particles.position.y = 0;

                    // scale up clouds
                    for(let i=0; i<this.outTubes.length; i++){
                        TweenMax.to( this.outTubes[i].children[2].scale, _duration*20, { x: 1.5, y: 1, z: 1.5, ease: Power0.easeNone } );
                        TweenMax.to( this.tubes[i].children[3].scale, _duration*20, { x: 1.5, y: 1, z: 1.5, ease: Power0.easeNone, onComplete: ()=>{
                            this.liquidOut = true;
                            this.outTubes[0].children[1].material.opacity = 1;
                        } } );
                    }
               } });
    }

    characterDisappear() {
        TweenMax.to( this.parent.fullVideo.mesh.scale, 1, { x:0.00001,y:0.00001,z:0.00001, ease: Back.easeInOut } );
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
        // test
        this.particleGroup.tick( dt );

        if(this.liquidDown && !this.liquidOut){
            this.tubes[0].children[1].material.map.offset.x+=0.01;
            if(this.tubes[0].children[1].material.map.offset.x>1)
                this.tubes[0].children[1].material.map.offset.x=-1;
        } else if(this.liquidOut) {
            this.tubes[0].children[1].material.map.offset.x-=0.01;
            if(this.tubes[0].children[1].material.map.offset.x<-1)
                this.tubes[0].children[1].material.map.offset.x=1;

            this.outTubes[0].children[1].material.map.offset.x-=0.01;
            if(this.outTubes[0].children[1].material.map.offset.x<-1)
                this.outTubes[0].children[1].material.map.offset.x=1;

            // FBO
            // this.fbo.update();
            // SPE
            // this.particleGroup.tick( dt );
            for(let i=0; i<this.puddleAnimators.length; i++){
                this.puddleAnimators[i].updateWithOrder( 300*dt );
            }
        }
    }
}
