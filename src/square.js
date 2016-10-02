import Trees from "./trees"
import Fountain from "./fountain"
import DebugUtil from "./util/debug"

const MODEL_PATH = "assets/square/scene.json"
const WINDOWS_PATH = "assets/square/windows.json"
const SUNS_PATH = "assets/square/suns.json"
const TEXTURES_PATH = "assets/square/textures/textures.json"

export default class Square extends THREE.Object3D{
    constructor() {
        super();
        console.log("Square constructed!")


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
                endPosition: [-16, 22.1, -17.5]
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
    init(collisionManager,loadingManager) {
        loadingManager.itemStart("Square");
        let trees = new Trees();
        this.fountain = new Fountain();
        Promise.all([
            this.loadSquare(loadingManager),
            trees.init(loadingManager),
            this.fountain.init(loadingManager),
            this.loadWindows(loadingManager),
            this.loadSuns(loadingManager),
            this.loadTextures(loadingManager)
        ])
        .then((results) => {
            console.log("Load results", results);
            let obj = results[0];
            obj.add(trees);
            obj.add(this.fountain);
            this.windows = results[3];
            this.suns = results[4];
            this.suns.rotation.y = Math.PI * -70 / 180;

            obj.add(this.windows);
            obj.add(this.suns);

            let textures = results[5];
            obj.add(textures);

            obj.rotation.order = "YXZ";
            this.mesh = obj;
            //this.mesh.scale.set(4,4,4);
            this.fountain.position.set(0.8,23.6, -0.6);
            //DebugUtil.positionObject(this.fountain, "Fountain");

            //this.fountain.scale.set(0.25, 0.25, 0.25);
            loadingManager.itemEnd("Square");

            // INITIAL STATE
            this.turnOffWindows();
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
            if (name == this.currentSun) {
                this.turnOnSun(name);
            } else {
                this.turnOffSun(name);
            }
        });
    }
    update(dt) {
        this.fountain.update(dt);
    }

    turnOffWindows() {
        this.windows.children.forEach((obj) => {obj.visible = false});
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

    activateSun(name) {

    }

    turnOnSun(name) {
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
        }
    }

    loadWindows(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(WINDOWS_PATH,( obj ) => {
                console.log("Loaded Windows ", obj );
                resolve(obj);
            });
        });
    }
    loadSuns(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(SUNS_PATH,( obj ) => {
                console.log("Loaded suns ", obj );
                resolve(obj);
            });
        });
    }
    loadTextures(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(TEXTURES_PATH,( obj ) => {
                console.log("Loaded textures ", obj );
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
                //obj.updateMatrixWorld();
                //collisionManager.addBoundingBoxes(obj,this);

                this.squareMiddle  = obj.getObjectByName("basin");
                if (this.squareMiddle) {
                    this.squareCenter  = new THREE.Vector3();
                    this.squareCenter.setFromMatrixPosition(this.squareMiddle.matrixWorld);
                    console.log("Square center", this.squareCenter);
                } else {
                    this.squareCenter = new THREE.Vector3(0,0,0);
                }

                this.sphereMesh = obj.getObjectByName("SkySphere").children[0];
                console.log("Sky sphere", this.sphereMesh);
                resolve(obj);
            });

        });
    }

    getSphereMesh() {
        return this.sphereMesh;
    }

    getCenterPosition() {
        return this.squareCenter;
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
