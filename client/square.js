import Trees from "./trees"
import Fountain from "./fountain"
import SunLoader from './sun_loader'
import Extras from './extras';

import DebugUtil from "./util/debug"
import _ from 'lodash';

const MODEL_PATH = "assets/square/scene.json"
const BUILDINGS_PATH = "assets/square/buildings.json"
const SUNS_PATH = "assets/square/suns.json"
const COLLIDERS_PATH = "assets/square/colliders.json"
const BENCHES_PATH = "assets/square/benches.json"

export default class Square extends THREE.Object3D{
    constructor(collisionManager, renderer, config) {
        super();
        console.log("Square constructed!")

        this.collisionManager = collisionManager;
        this.renderer = renderer;
        this.config = config;


        this.ENTRY_POINTS = [
            {
                hour: 19,
                worldPosition: [-140,40,180],
                startPosition: [-25, 20, -8],
                endPosition: [-18, 22.1, -7]
            },
            {
                hour: 17,
                worldPosition: [130,40,80],
                startPosition: [-3, 20, 43],
                endPosition: [-3.5, 22.1, 18]
            },
            {
                hour: 12,
                worldPosition: [-100,40,270],
                startPosition: [22, 20.5, 38.5],
                endPosition: [17, 22.1, 15.5]
            },
            {
                hour: 9,
                startPosition: [41, 20.5, 8],
                endPosition: [21, 22.1, 5]
            },
            {
                hour: 7,
                worldPosition: [130,40,80],
                startPosition: [-19, 20.5, -62],
                endPosition: [-10, 22.1, -17.5]
            },
            {
                hour: 0,
                startPosition: [-60, 20.5, -30],
                endPosition: [-20, 22.1, -8]
            }
        ]

        this.currentSun = null;
        this.activatedSun = null;
    }
    init(loadingManager) {
        loadingManager.itemStart("Square");
        let trees = new Trees();
        this.extras = new  Extras();
        this.fountain = new Fountain();

        let loaders = [
            this.loadSquare(loadingManager),
            trees.init(loadingManager),
            this.fountain.init(loadingManager),
            this.loadBuildings(loadingManager),
            this.loadSuns(loadingManager),
            this.loadColliders(loadingManager),
            this.loadBenches(loadingManager)
        ];
        if (!this.config.noExtras) {
            loaders.push(this.extras.init(loadingManager));
        }
        Promise.all(loaders)
        .then((results) => {
            console.log("Load results", results);
            let obj = results[0];
            obj.add(trees);
            obj.add(this.fountain);
            obj.add(this.extras);
            this.buildings = results[3];
            this.suns = results[4];
            this.suns.rotation.y = Math.PI * -70 / 180;

            obj.add(this.buildings);
            obj.add(this.suns);

            this.colliders = results[5];
            obj.add(this.colliders);

            this.benches = results[6];
            obj.add(this.benches);

            obj.rotation.order = "YXZ";
            this.mesh = obj;

            this.addColliders();
            this.setSquareMiddle();

            //this.mesh.scale.set(4,4,4);
            this.fountain.position.set(0.8,23.6, -0.6);
            //DebugUtil.positionObject(this.fountain, "Fountain");

            //this.fountain.scale.set(0.25, 0.25, 0.25);
            loadingManager.itemEnd("Square");

            // INITIAL STATE
            this.turnOffSuns();
            
/*            events.emit("add_gui", obj.position, "x"); */
            events.emit("add_gui",{}, obj.position, "y"); 
            //events.emit("add_gui", obj.position, "z");
            events.emit("add_gui", {step: 0.01} ,obj.rotation, "y", 0, 2 * Math.PI);

        });

        events.on("gaze_started", (name) => {
            this.activateSun(name);
        });
        events.on("gaze_stopped", (name) => {
            this.deactivateSun(name);
        });

        events.on("angle_updated", (hour) => {
            console.log("Square angle updated. Adding colliders");
            this.addColliders();
            this.setSquareMiddle(); 
        });
    }
    update(dt,et) {
        this.fountain.update(dt);
        for (let i = 1; i < this.suns.children.length; i++) {
            this.suns.children[i].children[1].update(dt,et)
        }
    }
    
    turnOffSuns() {
        this.suns.children.forEach((obj) => {
            if (obj.children.length > 0) {
                this.turnOffSun(obj.name);
            }
        })
    }

    turnOffSun(name) {
        console.log("Turn off sun ", name);
        let sun = this.suns.getObjectByName(name).children[0];
        console.log("Turn off sun", sun);
        sun.material.side = THREE.BackSide;
        sun.material.color = new THREE.Color(0x000733);
        sun.material.emissive = new THREE.Color(0x222223);
        sun.material.specular = new THREE.Color(0x000000);
        sun.material.opacity = .8;
    }

    turnOnSun(name) {
        if (this.suns) {
            let sun = this.suns.getObjectByName(name)
            if (sun) {
                if (this.currentSun) {
                    this.turnOffSun(this.currentSun);
                }
                let sunMesh = sun.children[0];
                console.log("Turn on sun", sun);
                sunMesh.material.color = new THREE.Color(0xF4F5DC);
                sunMesh.material.emissive = new THREE.Color(0xC8C5B9);
                sunMesh.material.specular = new THREE.Color(0xFFFFFF);
                sunMesh.material.side = THREE.DoubleSide;
                this.currentSun = name;
            }
        }
    }

    activateSun(name) {
        console.log("Activate sun! ", name);
        let sun = this.suns.getObjectByName(name)
        if (sun) {
            let sunMesh = sun.children[0];
            console.log("Turn on sun", sun);
            sunMesh.material.color = new THREE.Color(0xF4050C);
            sunMesh.material.emissive = new THREE.Color(0xC80509);
            sunMesh.material.specular = new THREE.Color(0xFF0000);
            sunMesh.material.side = THREE.DoubleSide;

            let sunLoader = sun.children[1];
            sunLoader.organize();
        }
    }

    deactivateSun(name) {
        let sun = this.suns.getObjectByName(name)
        if (sun) {
            let sunLoader = sun.children[1];
            sunLoader.disorganize();
        }
    }

    explodeSun(name) {
        let sun = this.suns.getObjectByName(name)
        if (sun) {
            let sunLoader = sun.children[1];
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
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(SUNS_PATH,( obj ) => {
                
                // Add a loader to all  of the suns (First object is the nesting export)
                for (let i = 1; i < obj.children.length; i++) {
                    let sunLoader = new SunLoader(this.renderer);
                    sunLoader.init();
                    sunLoader.quaternion.copy(obj.children[i].children[0].quaternion);
                    //obj.children[i].rotation.set(0,0,0);
                    obj.children[i].add(sunLoader);
                }

                console.log("Loaded suns ", obj );

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
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(BENCHES_PATH,( obj ) => {
                console.log("Loaded square benches ", obj);
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
        this.collisionManager.refreshSquareColliders(this.colliders.children);
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
}
