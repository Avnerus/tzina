import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'

export default class HannahAnimation extends THREE.Object3D {
    constructor() {
        super();
        this.BASE_PATH = 'assets/animations/hannah';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {
        this.loadingManager.itemStart("HannahAnim");
        this.domeMorphTargets = [];
        this.perlin = new ImprovedNoise();

        let hannahRoomFiles = [this.BASE_PATH + "/models/hannah_room/hr_bookshelf.js", this.BASE_PATH + "/models/hannah_room/hr_chair.js",
                               this.BASE_PATH + "/models/hannah_room/hr_door.js", this.BASE_PATH + "/models/hannah_room/hr_fireplace.js",
                               this.BASE_PATH + "/models/hannah_room/hr_photo1.js", this.BASE_PATH + "/models/hannah_room/hr_photo2.js",
                               this.BASE_PATH + "/models/hannah_room/hr_photo3.js", this.BASE_PATH + "/models/hannah_room/hr_photo4.js",
                               this.BASE_PATH + "/models/hannah_room/hr_photo5.js", this.BASE_PATH + "/models/hannah_room/hr_room2.js",
                               this.BASE_PATH + "/models/hannah_room/hr_shelf.js", this.BASE_PATH + "/models/hannah_room/hr_sidewall.js",
                               this.BASE_PATH + "/models/hannah_room/hr_sofa.js", this.BASE_PATH + "/models/hannah_room/hr_sofa2.js",
                               this.BASE_PATH + "/models/hannah_room/hr_table.js", this.BASE_PATH + "/models/hannah_room/hr_window.js"];

        let doodleMenTexFiles = [this.BASE_PATH + "/images/doodleMen1.png", this.BASE_PATH + "/images/doodleMen2.png", this.BASE_PATH + "/images/doodleMen3.png"];
        let doodleMenTex = [], doodleMen = [];
        this.doodleMenAnimators = [];

        let p_tex_loader = new THREE.TextureLoader(this.loadingManager);

        let twigGeo, leafGeo, evilGeo, twigMat, leafMat, evilMat;

        leafMat = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors, wireframe: true } );

        let evilTex = p_tex_loader.load(this.BASE_PATH + '/images/spike3.jpg');

        twigMat = new THREE.MeshBasicMaterial( {color: 0x985a17, wireframe: true} );

        evilTex.wrapS = THREE.RepeatWrapping;
        evilTex.wrapT = THREE.RepeatWrapping;
        evilTex.repeat.set( 1, 4 );
        evilMat = new THREE.MeshLambertMaterial( {map: evilTex} );

        let loader = new THREE.JSONLoader(this.loadingManager);
        loader.load(this.BASE_PATH + "/models/spike_curvey.js", (geometry, material) => {
            evilGeo = geometry;
        });
        loader.load(this.BASE_PATH + "/models/leavesss_less.js", (geometry, material) => {
            leafGeo = geometry;

            // ref: https://stemkoski.github.io/Three.js/Vertex-Colors.html
            let face, numberOfSides, vertexIndex, point, color;
            let faceIndices = [ 'a', 'b', 'c', 'd' ];
            // vertex color
            for(let i=0; i < leafGeo.faces.length; i++)
            {
                face = leafGeo.faces[i];
                numberOfSides = (face instanceof THREE.Face3 ) ? 3 : 4;
                // assign color to each vertex of current face
                for(let j=0; j < numberOfSides; j++)
                {
                    vertexIndex = face[ faceIndices[j] ];
                    //store coordinates of vertex
                    point = leafGeo.vertices[ vertexIndex ];
                    // initialize color variable
                    color = new THREE.Color();
                    color.setRGB( 0.1 + (10+point.x) / ((j+4)*5), 0.5 + (10+point.y) / ((j+4)*15), 0.2 + (10+point.z) / ((j+4)*5) );
                    face.vertexColors[j] = color;
                }
            }
        });

        loader.load(this.BASE_PATH + "/models/twig.js", function(geometry, material){
            twigGeo = geometry;
        });

        this.loadModelDome(this.BASE_PATH + '/models/shield.js', this.BASE_PATH + '/models/dome.js', this.BASE_PATH + '/models/collapse.js')
        .then((dome) => {
            this.add(dome);
            console.log("Loaded dome, setting up 'things'", dome);
            let centerV = new THREE.Vector3();
            let upp = new THREE.Vector3(0,-1,0);

            for(let i = 0; i < dome.geometry.vertices.length; i++){
                let fMesh = new Thing( dome.geometry.vertices[i],
                                       twigGeo, leafGeo, evilGeo,
                                       twigMat, leafMat, evilMat );

                this.add(fMesh.mesh);

                let m1 = new THREE.Matrix4();
                m1.lookAt( centerV, dome.geometry.vertices[i], upp );
                fMesh.mesh.quaternion.setFromRotationMatrix( m1 );

                this.domeMorphTargets.push( fMesh );
            }
            this.initParticles();
        });
        let hannahRoom = new THREE.Object3D();

        // DOODLE_MEN
        let menGeometry = new THREE.PlaneGeometry( 5, 10 );
        for(let i = 0; i < doodleMenTexFiles.length; i++){
            let mTex = p_tex_loader.load( doodleMenTexFiles[i] );
        
            let mAni = new TextureAnimator( mTex, 2, 1, 2, 60, [0,1] );
            this.doodleMenAnimators.push(mAni);

            let mMat = new THREE.MeshBasicMaterial( {map: mTex, side: THREE.DoubleSide, transparent: true} );
            let mMesh = new THREE.Mesh( menGeometry, mMat );
            mMesh.position.x = -15-i*6;
            mMesh.position.y = 7.5;
            hannahRoom.add(mMesh);
            doodleMen.push(mMesh);
        }

        for(var i = 0; i < hannahRoomFiles.length; i++){
            loader.load( hannahRoomFiles[i], function(geometry){
                var colorValue = Math.random() * 0xFF | 0;
                var colorString = "rgb("+colorValue+","+colorValue+","+colorValue+")";
                let mat = new THREE.MeshLambertMaterial({ color: colorString });
                let meshhh = new THREE.Mesh(geometry, mat);
                hannahRoom.add(meshhh);
            });
        }
        hannahRoom.scale.set(8,8,8);
        hannahRoom.rotation.y = Math.PI;
        hannahRoom.position.y = 400;
        this.add(hannahRoom);


        this.loadingManager.itemEnd("HannahAnim");
    }

    initParticles() {
        let p_tex_loader = new THREE.TextureLoader(this.loadingManager);
        let particleTex = p_tex_loader.load(this.BASE_PATH + '/images/dandelion_particle.jpg');

        this.particleGroup = new SPE.Group({
            texture: {
                value: particleTex
            },
            depthTest: false
        });

        // reduce emitter amount to be 1/5 of domeMorphTargets.length
        for(let i = 0; i < this.domeMorphTargets.length-6; i+=6){
            let emitter = new SPE.Emitter({
                type: SPE.distributions.SPHERE,
                // duration: 10,
                maxAge: {
                    value: 10,
                    spread: 2
                },
                position: {
                    value: this.domeMorphTargets[i].mesh.position,
                    spread: new THREE.Vector3(20,20,20),
                    radiusScale: new THREE.Vector3(3,3,3),
                    distribution: SPE.distributions.SPHERE
                },
                acceleration: {
                    value: new THREE.Vector3(0,-5,0),
                    spread: new THREE.Vector3(2,-5,2)
                },
                velocity: {
                    value: new THREE.Vector3(1,-1,1)
                    // distribution: SPE.distributions.SPHERE
                },
                rotation: {
                    angle: 1
                },
                angle: {
                    value: [0,1,-1],
                    spread: [0,-1,1]
                },
                // color: {
                // 	value: new THREE.Color( 0xAA4488 )
                // },
                opacity: {
                    value: [0,1,1,1,0]
                },
                size: {
                    value: [10,50,50,50,30]
                    // spread: [1,3]
                },
                particleCount: 1,
                drag: 0.5
                // wiggle: 15
                // isStatic: true
            });
            this.particleGroup.addEmitter( emitter );
        }
        this.add( this.particleGroup.mesh );
    }

    loadModelDome (modelS, modelD, modelC) {

        let promise = new Promise( (resolve, reject) => {
            let loader = new THREE.JSONLoader(this.loadingManager);
            let domeMat = new THREE.MeshBasicMaterial({morphTargets: true, color: 0xAA4488, wireframe: true, visible: false});
            let followMat = new THREE.MeshBasicMaterial({color: 0xffff00});
            let followMesh = new THREE.Mesh(new THREE.SphereGeometry(10), followMat);


            loader.load(modelS, (geometry, material) => {

                this.shieldGeo = geometry;
                
                loader.load(modelD, (geometryD, materialD) => {
                    let domeGeo = geometryD;

                    loader.load(modelC, (geometryC, materialC) => {
                        let collapseGeo = geometryC;

                        var tempDome = new THREE.Mesh(domeGeo, followMat);
                        tempDome.rotation.y = Math.PI;
                        tempDome.scale.multiplyScalar(90);
                        tempDome.updateMatrix();

                        domeGeo.applyMatrix( tempDome.matrix );
                        this.shieldGeo.applyMatrix( tempDome.matrix );
                        collapseGeo.applyMatrix( tempDome.matrix );

                        this.shieldGeo.morphTargets[0] = {name: 't1', vertices: domeGeo.vertices};
                        this.shieldGeo.morphTargets[1] = {name: 't2', vertices: collapseGeo.vertices};
                        this.shieldGeo.computeMorphNormals();

                        let dome = new THREE.Mesh(this.shieldGeo, domeMat);
                        resolve(dome);
                    });
                });
                
            });
        });
        return promise;
    }
    update(dt,et) {
        if(this.particleGroup) {
            this.particleGroup.tick( dt );
        }
        for(let i=0; i < this.shieldGeo.vertices.length; i++){
            let h = this.perlin.noise(et*0.1, i, 1)/2;
            this.domeMorphTargets[i].mesh.position.addScalar( h );

            if( i % 6==0 ){
                if(i/6 != 63)
                    this.particleGroup.emitters[i/6].position.value = this.particleGroup.emitters[i/6].position.value.addScalar( h );
            }
        }

        // DOODLE_MEN
        if( this.doodleMenAnimators.length > 0) {
            for(var i=0; i < this.doodleMenAnimators.length; i++){
                this.doodleMenAnimators[i].updateWithOrder( 300*dt );
            }
        }
    }
}

function Thing( pos, geoTwig, geoLeaf, geoEvil, twigMat, leafMat, evilMat ){

    this.position = pos.clone();
    this.acceleration = new THREE.Vector3(0,0,0);
    this.velocity = new THREE.Vector3(0,0,0);

    this.r = 15; // 0.6
    this.maxSpeed = 2; //0.3
    this.maxForce = 0.005; //0.01
    this.maxForceSelf = 0.00001; //0.0001
    this.toChase = true;

    this.neighbordist = 10;

    var lightDis = 20;

    this.separateSingleScalar = 0.1;
    this.arriveScalar = 1;

    this.mesh = new THREE.Object3D();

    // v.2
    this.twig = new THREE.Mesh(geoTwig, twigMat);
    this.leaf = new THREE.Mesh(geoLeaf, leafMat);
    this.evil = new THREE.Mesh(geoEvil, evilMat);

    this.mesh.add(this.twig);
    this.mesh.add(this.leaf);
    this.mesh.add(this.evil);

    this.mesh.position.copy(this.position);

    this.mesh.children[1].scale.set(0.01, 0.01, 0.01);
    this.mesh.children[2].scale.set(0.01, 0.01, 0.01);
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
