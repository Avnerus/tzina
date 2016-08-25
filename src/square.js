import Trees from "./trees"
import Fountain from "./fountain"

const MODEL_PATH = "assets/square/scene.json"
const WINDOWS_PATH = "assets/square/windows.json"

export default class Square extends THREE.Object3D{
    constructor() {
        super();
        console.log("Square constructed!")


        this.ENTRY_POINTS = [
            {
                hour: 19,
                startPosition: [21, 20, 34],
                endPosition: [15, 22, 14]
            },
            {
                hour: 17,
                startPosition: [-3, 20, 43],
                endPosition: [-3.5, 22, 18]
            }
        ]
    }
    init(collisionManager,loadingManager) {
        loadingManager.itemStart("Square");
        let trees = new Trees();
        this.fountain = new Fountain();
        Promise.all([
            this.loadSquare(loadingManager),
            trees.init(loadingManager),
            this.fountain.init(loadingManager),
            this.loadWindows(loadingManager)
        ])
        .then((results) => {
            console.log("Load results", results);
            let obj = results[0];
            obj.add(trees);
            //obj.add(this.fountain);
            obj.add(this.fountain);
            this.windows = results[3];
            obj.add(this.windows);
            obj.rotation.order = "YXZ";
            this.mesh = obj;
            this.fountain.position.set(0.6,24.6, -0.8);
            this.fountain.scale.set(0.25, 0.25, 0.25);
            //this.fountain.scale.set(0.25, 0.25, 0.25);
            loadingManager.itemEnd("Square");

            // INITIAL STATE
            this.turnOffWindows();
            
/*            events.emit("add_gui", obj.position, "x"); */
            events.emit("add_gui",{}, obj.position, "y"); 
            //events.emit("add_gui", obj.position, "z");
            events.emit("add_gui", {step: 0.01} ,obj.rotation, "y", 0, 2 * Math.PI);

        });
    }
    update(dt) {
        this.fountain.update();
    }

    turnOffWindows() {
        this.windows.children.forEach((obj) => {obj.visible = false});
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

    loadSquare(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(MODEL_PATH,( obj ) => {
                console.log("Loaded square ", obj);

                obj.position.y = -80;
                obj.position.z = 0;
                obj.position.x = 0;
                obj.scale.set( 4, 4, 4 );

                this.rotation.y = Math.PI * 80 / 180;
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
}
