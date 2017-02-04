import Trees from "./trees"
import Fountain from "./fountain"
import SunLoader from './sun_loader'
import Chapters from './chapters'
import Pool from './pool'
import {MeshText2D, textAlign} from './lib/text2d/index'

import DebugUtil from "./util/debug"
import _ from 'lodash';

const MODEL_PATH = "assets/square/scene/scene.json"
const BUILDINGS_PATH = "assets/square/buildings/buildings_new.json"
const SUNS_PATH = "assets/square/suns.json"
const COLLIDERS_PATH = "assets/square/colliders.json"
const BENCHES_PREFIX = "assets/square/benches/"
const FOUNTAIN_PATH = "assets/square/fountain/fountain.json"
const GROUND_PATH = "assets/square/squareRamp_22.json"

let SUN_LOADER_TIME = 3;

export default class Square extends THREE.Object3D{
    constructor(collisionManager, renderer, camera, config, soundManager, scene, extras, sky) {
        super();
        console.log("Square constructed!")

        this.collisionManager = collisionManager;
        this.renderer = renderer;
        this.config = config;
        this.camera = camera;
        this.scene = scene;
        this.extras = extras;
        this.sky = sky;

        this.debug = false;

        this.sunTextureOffsets = {
            19 : 0,
            17 : 0,
            12 : 0,
            9 : 0,
            7 : 0
        };


        this.ENTRY_POINTS = [
            {
                hour: 19,
                worldPosition: [-12,13,40],
                startPosition: [-25, 20, -8],
                endPosition: [-18, 22.1, -7]
            },
            {
                hour: 17,
                worldPosition: [50,13,26],
                startPosition: [-3, 20, 43],
                endPosition: [-3.5, 22.1, 18]
            },
            {
                hour: 12,
                worldPosition: [-14,12,41],
                startPosition: [22, 20.5, 38.5],
                endPosition: [14, 22.1, 8.5]
            },
            {
                hour: 9,
                worldPosition: [-7.5 ,12,51],
                startPosition: [40, 20.5, 17.6],
                endPosition: [15, 22.1, -1]
            },
            {
                hour: 7,
                worldPosition: [63,12,5],
                startPosition: [-26, 24.0, -62],
                endPosition: [-14, 23.7, -12]
            },
            {
                hour: 0,
                startPosition: [-60, 20.5, -30],
                endPosition: [-20, 22.1, -8]
            }
        ]

        this.currentSun = null;
        this.activatedSun = null;
        this.controlPassed = false;

        this.soundManager = soundManager;
    }
    init(loadingManager) {
        loadingManager.itemStart("Square");
        this.trees = new Trees(this.config, this.camera, this.renderer);
        this.fountain = new Fountain( this );

        let loaders = [
            this.loadSquare(loadingManager),
            this.fountain.init(loadingManager),
            this.loadBuildings(loadingManager),
            this.loadSuns(loadingManager),
            this.loadColliders(loadingManager),
            this.loadBenches(loadingManager),
            this.loadFountain(loadingManager),
            this.loadGround(loadingManager)
        ];
        if (!this.config.noExtras) {
            loaders.push(this.extras.init(loadingManager));
        }
        if (!this.config.noTrees) {
            loaders.push(this.trees.init(loadingManager));
        }
        Promise.all(loaders)
        .then((results) => {
            console.log("Load results", results);
            let obj = results[0];
            this.buildings = results[2];
            this.suns = results[3];
            this.suns.rotation.y = Math.PI * -70 / 180;

            this.mesh = obj;
            this.mesh.rotation.order = "YXZ";

            this.colliders = results[4];
            //this.mesh.add(this.colliders);

            this.benches = results[5];
            this.benches.rotation.order = "YXZ";

            this.fountainMesh = results[6];

            let ground = results[7];
          //  ground.position.set(1.2,0, -2.18);
           
            this.mesh.add(ground)

            this.mesh.add(this.fountainMesh);


            // Clockwork rotation object
            this.clockwork = new THREE.Object3D();

            // Cylinders
            this.cylinders = [];
            this.cylinders.push(this.fountainMesh.getObjectByName("f_15_SubMesh 0").parent);
            this.cylinders.push(this.fountainMesh.getObjectByName("f_14_SubMesh 0").parent);
            this.cylinders.push(this.fountainMesh.getObjectByName("f_13_SubMesh 0").parent);
            for(let i=0; i<this.cylinders.length; i++){
                this.cylinders[i].rotation.order = "YXZ";
                this.cylinders[i].rotation.z = Math.PI / 2;
            }

                /*
            let cylindersDebug = [new THREE.Object3D(), new THREE.Object3D(), new THREE.Object3D()];
            this.fountain.assignCylinders(cylindersDebug);*/

            this.fountain.assignCylinders(this.cylinders);

            this.activeClockwork = this.mesh;

                /*
            THREE.SceneUtils.detach(cylinder, cylinder.parent, this.scene);
            THREE.SceneUtils.attach(cylinder, this.scene, this.clockwork);*/


            DebugUtil.positionObject(this, "Square");

            this.clockwork.add(this.benches);


            this.clockwork.add(this.buildings);

            // Starts as a child of the square which does the actual rotation
            this.clockwork.rotation.order = "YXZ";
            this.clockworkOffset = new THREE.Object3D();
            this.clockworkOffset.rotation.order = "YXZ";

            this.clockworkOffset.add(this.clockwork);
            this.mesh.add(this.clockworkOffset);

            this.mesh.add(this.trees);
            this.mesh.add(this.fountain);
            this.mesh.add(this.extras);
            this.mesh.add(this.suns);

                /*
            this.textures = results[7];
            this.mesh.add(this.textures);*/

           // Lights
           this.loadLights();

           // POOL Shader
            this.pool = new Pool(this.renderer);
            this.pool.init();
            this.pool.renderOrder = 1;
            this.pool.position.set(0.66,21.52, -0.95);
            this.pool.rotation.x = 270 * Math.PI / 180;
            this.pool.scale.set(0.822, 0.822, 0.822);
            console.log("Adding square fountain pool", this.pool);
            this.mesh.add(this.pool);

            if (this.debug) {
                events.emit("add_gui", {folder: "Pool"}, this.pool, "visible"); 
                events.emit("add_gui", {folder: "Trees"}, this.trees, "visible"); 
                events.emit("add_gui", {folder: "Fountain water"}, this.fountain, "visible"); 
                events.emit("add_gui", {folder: "Extras"}, this.extras, "visible"); 
                events.emit("add_gui", {folder: "Buildings"}, this.buildings, "visible"); 
                events.emit("add_gui", {folder: "Suns"}, this.suns, "visible"); 
                events.emit("add_gui", {folder: "Benches"}, this.benches, "visible"); 
                events.emit("add_gui", {folder: "Fountain"}, this.fountainMesh, "visible"); 
                events.emit("add_gui", {folder: "Fountain"}, this.pool, "visible"); 

                //events.emit("add_gui", {folder: "Floor texture"}, this.textures, "visible"); 
                //events.emit("add_gui", {folder: "Benches texture 1"}, this.benches.children[0].children[0], "visible"); 
                //events.emit("add_gui", {folder: "Benches texture 2"}, this.benches.children[1].children[0], "visible"); 

                DebugUtil.positionObject(this.fountain, "Fountain water");
                //DebugUtil.positionObject(this.fountainMesh, "Fountain");
            //  DebugUtil.positionObject(this.pool, "Pool");
                DebugUtil.positionObject(this.mesh, "Square");
                DebugUtil.positionObject(this.benches, "Benches");

                events.emit("add_gui", {folder: "Clock rotation", listen: true}, this, "clockRotation", 0, 6.28); 

                DebugUtil.positionObject(this.cylinders[0], "Cylinder");
                DebugUtil.positionObject(this.clockwork, "Clockwork");
                DebugUtil.positionObject(ground, "Ground");
            }



            this.addColliders();
            this.setSquareMiddle();

            // VIVE SCALES
            this.mesh.scale.set(0.6, 0.6, 0.6);
                /*
            this.benches.scale.set(2,2,2);
            this.benches.position.set(7.13,-34,8);
            this.buildings.scale.set(3,3,3); 
                */

            //this.benches.rotation.set(0,256,0);

            this.fountain.position.set(0.69,24.93, -0.73);

            this.buildings.rotation.y = 4 * Math.PI / 180;
            
            
            //DebugUtil.positionObject(this.ground, "ground");
            //            DebugUtil.positionObject(this.clockwork, "Clockwork");
            //
            //


            // You can sit here
            /*
            let SIT_HERE_TEXT_DEFINITION = {
                 align: textAlign.center, 
                 font: '70px Miriam Libre',
                 fillStyle: '#cccccc',
                 antialias: true
            }
            this.sitHere = new MeshText2D("You can sit here", SIT_HERE_TEXT_DEFINITION);
            this.sitHere.scale.multiplyScalar(0.001);
            this.sitHere.position.set(0.67,13.38,4.85);
            this.sitHere.rotation.set(
                287 * Math.PI / 180,
                0,
                1 * Math.PI / 180
            )
            this.add(this.sitHere);
            
            DebugUtil.positionObject(this.sitHere, "Sit here");
            */

            console.log("Finished loading square");
            loadingManager.itemEnd("Square");

            // INITIAL STATE
            this.turnOffSuns();
            
/*            events.emit("add_gui", obj.position, "x"); */
            //events.emit("add_gui",{}, obj.position, "y"); 
            //events.emit("add_gui", obj.position, "z");
           // events.emit("add_gui", {step: 0.01} ,obj.rotation, "y", 0, 2 * Math.PI);
//events.emit("add_gui",{folder: "Clockwork rotation", listen: true, step: 0.001}, this.clockwork.rotation, "y"); 
//events.emit("add_gui",{folder: "Square rotation", listen: true, step: 0.001}, this.mesh.rotation, "y"); 

        });

        events.on("gaze_started", (name) => {
            this.turnOnSun(name, false);
            this.activateSun(name);
        });
        events.on("gaze_stopped", (name) => {
            this.turnOffSun(name);
            this.deactivateSun(name);
        });

        events.on("angle_updated", (hour) => {
            console.log("Square angle updated. Adding colliders");
            this.addColliders();
            this.setSquareMiddle(); 
        });
        events.on("show_start", () => {
            this.fountainLight.position.set(0,25.11,6.836);
        });
        events.on("show_end", () => {
            this.fountainLight.position.set(0,0,0);
        });
        events.on("control_threshold", (passed) => {
            this.controlPassed = passed;
            if (passed) {
                if (this.config.platform != "desktop") {
                    this.clockworkShift();
                }

               // Show the hidden loader
                let sun = this.suns.getObjectByName(this.currentSun)
                if (sun) {
                    sun.getObjectByName(this.currentSun + "_L").visible = true;
                }


                setTimeout(() => {
                    events.emit("angle_updated");
                },0)
            }
        });

        events.on("delayed_rotation", (skip = false) => {
            this.delayedRotation(skip);
        })
    }

    delayedRotation(skip) {
        console.log("Instructions delayed rotation");
        TweenMax.to(this, skip ? 0 : 32, {ease: Power1.easeInOut, clockRotation: this.delayedRotationY, onComplete: () => {
            events.emit("angle_updated", this.delayedRotationY / 15);
        }, onUpdate: () => {}});
    }

    clockworkShift() {
        console.log("Performing clockwork shift");
        this.activeClockwork = this.clockwork;
        //THREE.SceneUtils.detach(this.clockwork, this.mesh, this.scene);
        this.clockworkOffset.rotation.y = -105 * Math.PI / 180;
        this.clockwork.rotation.y = this.mesh.rotation.y - 135 * Math.PI / 180;
        this.delayedRotationY = this.mesh.rotation.y;
        this.mesh.rotation.set(0,0,0);
        //THREE.SceneUtils.attach(this.clockwork, this.scene, this.mesh);
    }

    update(dt,et) {
        this.fountain.update(dt);
        if (this.controlPassed) {
            this.pool.update(dt,et);
        }
        if (!this.config.noTrees) {
            this.trees.update(dt,et);
        }
        if (!this.config.noExtras) {
            this.extras.update(dt);
        }
        for (let i = 0; i < this.suns.children.length; i++) {
            this.suns.children[i].children[2].update(dt,et)
        }
    }

    getFountainMesh() {
        return this.fountainMesh;
    }

    getCylinders() {
        return this.cylinders;
    }

    updateSunProgress(name, progress) {
        this.sunTextureOffsets[name] = (0.5 * progress);
        if (name == this.currentSun) {
            //    console.log("Update sun progress ", name, progress, this.currentSun, this.sunTextureOffsets[name]);
            this.sunTexture.offset.y = this.sunTextureOffsets[name];
        }
    }
    
    turnOffSuns() {
        this.suns.children.forEach((obj) => {
            if (obj.children.length > 0) {
                this.turnOffSun(obj.name);
            }
        })
    }
//change material of non active sun
    turnOffSun(name) {
        console.log("Turn off sun ", name);
        let sun = this.suns.getObjectByName(name);
        if (sun) {
            let strokeMesh = sun.getObjectByName(name + "_S").children[0];
            strokeMesh.material.color.set(0x001D16);
            strokeMesh.material.needsUpdate = true;

            let sunMesh = sun.getObjectByName(name + "_F").children[0];
            //console.log("Turn off sun", sun);
            sunMesh.material.color = new THREE.Color(0x001D16);
            sunMesh.material.emissive= new THREE.Color(0x57340C);
            sunMesh.material.specular= new THREE.Color(0xB3B600);
            sunMesh.material.transparent= true;
            sunMesh.material.opacity = .8;
            sunMesh.material.shininess = 0.2;
            sunMesh.material.bumpScale = 4;
            sunMesh.material.map = null;
            sunMesh.material.needsUpdate = true;
            sun.getObjectByName(name + "_L").visible = false;
        }
        if (this.currentSun) {
            this.sunTexture.offset.y = this.sunTextureOffsets[this.currentSun];
        }
    }
// material color under the texture
    turnOnSun(name, setCurrent) {
        if (this.suns) {
            let sun = this.suns.getObjectByName(name)
            if (sun) {
                console.log("Turning on sun ", name);

                let strokeMesh = sun.getObjectByName(name + "_S").children[0];
                strokeMesh.material.color.set(0xFEE428);
                strokeMesh.material.needsUpdate = true;

                let sunMesh = sun.getObjectByName(name + "_F").children[0];
                sunMesh.material.color = new THREE.Color(0xFFFF28);
                //sunMesh.material.emissive= new THREE.Color(11904267);
                sunMesh.material.bumpScale = 4;
                sunMesh.material.specular= new THREE.Color(0xFFFF00);
                sunMesh.material.shininess = 0.2;

                //sunMesh.material.side = THREE.Backside;
                   // sunMesh.material.opacity = 1.00;
                sunMesh.material.transparent = false;
                sunMesh.material.map = this.sunTexture;
                this.sunTexture.offset.y = this.sunTextureOffsets[name];
                //texture offset by progress in chapter 
                sunMesh.material.needsUpdate = true;

                // Show loader
                sun.getObjectByName(name + "_L").visible = true;
                sun.getObjectByName(name + "_L").disorganize();

                //console.log("Turned on sun", sun);
                if (setCurrent) {
                    this.currentSun = name;
                }
            }
        }
    }

    activateSun(name) {
        let sun = this.suns.getObjectByName(name)
        if (sun) {
            let sunLoader = sun.getObjectByName(name + "_L");
            sunLoader.organize(SUN_LOADER_TIME);
        }
    }
    deactivateSun(name) {
        let sun = this.suns.getObjectByName(name)
        if (sun) {
            let sunLoader = sun.getObjectByName(name + "_L");
            sunLoader.disorganize();
        }
    }

    explodeSun(name) {
        let sun = this.suns.getObjectByName(name)
        if (sun) {
            let sunLoader = sun.getObjectByName(name + "_L");
            sunLoader.explode();
        }
    }

    loadBuildings(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(BUILDINGS_PATH,( obj ) => {
                console.log("Loaded Buildings ", obj );
                resolve(obj);
            })
        });
    }
    loadSuns(loadingManager) {
        console.log("Loading suns")
        return new Promise((resolve, reject) => {
            let textureLoader = new THREE.TextureLoader(loadingManager);

            this.sunTexture = textureLoader.load("assets/square/sunActive_gradientSun2.png");
            this.sunTexture.repeat.set(1.0,0.5);

            //debug 
            console.log("Sun textures ", this.sunTexture); 

            let loader = new THREE.ObjectLoader(loadingManager);

            //events.emit("add_gui", {folder: "Sun texture", step: 0.01, listen: true} ,this.sunTexture.offset, "y", 0, 1);
            loader.load(SUNS_PATH,( obj ) => {
                console.log("Loaded suns", obj)

                let reorderedSuns = new THREE.Object3D();
                Chapters.forEach((chapter) => {
                    let parent = obj.getObjectByName(chapter.hour.toString());
                    if (parent) {
                        let fill = obj.getObjectByName(chapter.hour.toString() + "_F");
                        fill.position.set(0,0,0);

                        // Replace the geometry with my own
                        fill.children[0].geometry.dispose();
                        fill.children[0].geometry = new THREE.SphereBufferGeometry( 2.0 , 32, 32  ); //size of fill
                        fill.scale.set(1,1,1);
                        parent.add(fill);

                        let stroke = obj.getObjectByName(chapter.hour.toString() + "_S");
                        stroke.children[0].material.side = THREE.BackSide;
                        stroke.children[0].material.color.set(0x666633);
                        stroke.children[0].material.opacity = 0.32;
                        stroke.position.set(0,0,0);
                        stroke.scale.set(1,1,1);
                        stroke.children[0].geometry.dispose();
                        stroke.children[0].geometry = new THREE.SphereBufferGeometry( 2.1, 32, 32  );   //size of stroke
                        parent.add(stroke);

                        reorderedSuns.add(parent);

                        // Add the sun loader
                        let sunLoader = new SunLoader(this.renderer);
                        sunLoader.init();
                        sunLoader.name = chapter.hour.toString() + "_L";
                        parent.add(sunLoader);
                        sunLoader.scale.set(0.83, 0.83, 0.83);
                        sunLoader.rotation.set(
                            chapter.sunLoaderRotation[0] * Math.PI / 180,                             
                            chapter.sunLoaderRotation[1] * Math.PI / 180,                             
                            chapter.sunLoaderRotation[2] * Math.PI / 180,
                            "XYZ"
                        );

                        if (this.debug) {
                            //DebugUtil.positionObject(sunLoader, sunLoader.name, true, -50, 50, chapter.sunLoaderRotation);
                        }


                    }
                })

                // SPECIAL ZIV FIX for 19:00 sun
                let sun19 = reorderedSuns.getObjectByName("19");
                sun19.position.set(-47.29, 45.4, 38.41);

                let sun7 = reorderedSuns.getObjectByName("7");
                //DebugUtil.positionObject(sun7,"Sun 7AM");
                sun7.position.y = 45.57;

                console.log("Reordered suns", reorderedSuns);
                resolve(reorderedSuns);
            });
        });
    }
    loadFile(loadingManager, path) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(path ,( obj ) => {
                resolve(obj);
            });
        });
    }
    loadColliders(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(COLLIDERS_PATH,( obj ) => {
                let colliders;
                obj.children  = _.filter(obj.children, function(o) { return (o.name != "BenchColliders2" && o.name != "BenchColliders"); });
                obj.children.forEach((o) => {o.children.splice(0,1)});
                console.log("Loaded square colliders ", obj);
                resolve(obj);
            });
        });
    }
    loadBenches(loadingManager) {

        if (this.config.platform == "desktop") {
            return this.loadBenchesDesktop(loadingManager);
        } else {
            let benches = [
                "bottomleft",
                "topleft",
                "group2",
                "bottomright",
                "topright",
                "group1",
            ]

                /*
            let benchPositions = [
                [1.09, -10.65, -3.47],
                [4.44, -10.65, -0.09],
                [-0.52, 2.5, 1.66],
                [0,-10.65,0],
                [0,-10.65,0],
                [0,2.5,0]
                ];*/


            let benchPositions = [
                [9.68, -8.48, 30.72],
                [-36.44, -8.48, -4.6],
                [-0.79, 2.36, 1.9],
                [-14.86,-8.48, 1.79],
                [-33.54,-8.48,-15.01],
                [-0.84,1.97,1.76]
            ];

            let benchRotations = [
                [0,243,0],
                [0,172,0],
                [0,0,0],
                [0,0,0],
                [0,297,0],
                [0,20,0]
            ];

            let benchScales = [
                1.4,
                1.4,
                0.9,
                1.4,
                1.4,
                0.9
            ]
            let loaders = [];
            benches.forEach((benchGroup) => {
                loaders.push(this.loadFile(loadingManager, BENCHES_PREFIX + benchGroup + ".json"));
            });
            return new Promise((resolve, reject) => {
                Promise.all(loaders)
                .then((results) => {
                    console.log("Benches Load results", results);
                    let allBenches = new THREE.Object3D();
                    for (let i = 0; i < results.length; i++) {
                        results[i].position.fromArray(benchPositions[i]);
                        results[i].rotation.set(
                            benchRotations[i][0] * Math.PI / 180,
                            benchRotations[i][1] * Math.PI / 180,
                            benchRotations[i][2] * Math.PI / 180,
                            "YXZ"
                        );
                        let benchScale = benchScales[i];
                        results[i].scale.set(benchScale, benchScale, benchScale);
                        allBenches.add(results[i]);

                        if (this.debug) {
                            //DebugUtil.positionObject(results[i], benches[i]);
                        }
                    }

                    resolve(allBenches);
                });
            });
        }
    }

    loadBenchesDesktop(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(BENCHES_PREFIX + "BenchAll.json",( obj ) => {
                console.log("Loaded Desktop benches ", obj);
                obj.scale.set(0.95,0.95,0.95);
                obj.position.set(0.86,0.82,-1.38);
                resolve(obj);
            });
        });
    }

    disableDepthWrite(objectArray) {
        for (let i = 0; i < objectArray.children.length; i++) {
            if (objectArray.children[i].children[0]) {
                objectArray.children[i].children[0].material.depthWrite = false;
            }
        }
    }
    loadFountain(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(FOUNTAIN_PATH,( obj ) => {
                console.log("Loaded square fountain ", obj);
                resolve(obj);
            });
        });
    }
    loadGround(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(GROUND_PATH,( obj ) => {
                console.log("Loaded ground ", obj);
                resolve(obj);
            });
        });
    }
    loadSquare(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(MODEL_PATH,( obj ) => {
                console.log("Loaded square ", obj);

                this.rotation.y = Math.PI * 150 / 180;
                this.updateMatrixWorld();

                this.add(obj);
                //collisionManager.addBoundingBoxes(obj,this);

                this.sphereMesh = obj.getObjectByName("SkySphere").children[0];
                console.log("Sky sphere", this.sphereMesh);
                //DebugUtil.positionObject(this.sphereMesh, "Sky Sphere");
                resolve(obj);
            });

        });
    }

    setSquareMiddle() {
        this.squareMiddle  = this.mesh.getObjectByName("f_06");
        if (this.squareMiddle) {
            this.squareCenter  = new THREE.Vector3();
            this.squareCenter.setFromMatrixPosition(this.squareMiddle.matrixWorld);
            console.log("Square center", this.squareCenter);
        } else {
            this.squareCenter = new THREE.Vector3(0,0,0);
        }
    }

    addColliders() {
        this.mesh.updateMatrixWorld(true);
        //let aroundFountain  = this.mesh.getObjectByName("f_11_SubMesh 0");
        /*
        this.colliders.forEach((collider) => {
            collider.matrixWorld.multiply(this.mesh.matrixWorld);
        })*/
        let aroundFountain  = this.fountainMesh.getObjectByName("f_11_SubMesh 0");
        aroundFountain.onCollision = (distance) => {
            events.emit("fountain_collision", distance);
        }
        //let aroundFountain  = this.mesh.getObjectByName("fntn");
        //this.collisionManager.refreshSquareColliders(this.colliders.children);
        this.collisionManager.refreshSquareColliders([aroundFountain]);
    }

    getSphereMesh() {
        return this.sphereMesh;
    }

    getCenterPosition() {
        return this.squareCenter;
    }

    getSun(name) {
        return this.suns.getObjectByName(name)
    }

    getSunPosition(name) {
        let sun = this.suns.getObjectByName(name)
        if (sun) {
            let sunMesh = sun.children[0]; 
            return new THREE.Vector3().setFromMatrixPosition(sunMesh.matrixWorld);
        } else {
            return null;
        }
    }

    getClockwork() {
        return this.activeClockwork;

    }

    loadLights() {
      this.fountainLight = new THREE.PointLight( 0xffffff, 0.5, 100 );
      this.fountainLight.position.set(0,0,0);
      this.fountainLight.intensity = 0.9;
      events.emit("add_gui", {folder: "Fountain light ", listen: true, step: 0.01}, this.fountainLight, "intensity", 0, 2); 
      this.mesh.add(this.fountainLight);
      DebugUtil.positionObject(this.fountainLight, "Fountain light");
    }

    get clockRotation() {
        return this.activeClockwork.rotation.y;
    }

    set clockRotation(rotation) {
        this.activeClockwork.rotation.y = rotation;
        if (this.activeClockwork == this.clockwork) {
            // Rotate also cylinder
            this.cylinders[0].rotation.y = rotation;
        }
    }
}
