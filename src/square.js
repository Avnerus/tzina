import Trees from "./trees"
import Fountain from "./fountain"

const MODEL_PATH = "assets/square/scene.json"

export default class Square extends THREE.Object3D{
    constructor() {
        super();
        console.log("Square constructed!")
    }
    init(collisionManager,loadingManager) {
        loadingManager.itemStart("Square");
        let trees = new Trees();
        this.fountain = new Fountain();
        Promise.all([
            this.loadSquare(loadingManager),
            trees.init(loadingManager),
            this.fountain.init(loadingManager)
        ])
        .then((results) => {
            console.log("Load results", results);
            let obj = results[0];
            obj.add(trees);
            //obj.add(this.fountain);
            obj.add(this.fountain);
            this.fountain.position.set(0.5,22, -1);
            this.fountain.scale.set(0.25, 0.25, 0.25);
            //this.fountain.scale.set(0.25, 0.25, 0.25);
            loadingManager.itemEnd("Square");

            /*
            events.emit("add_gui", this.fountain.position, "x"); 
            events.emit("add_gui", this.fountain.position, "z");
            events.emit("add_gui", this.fountain.position, "y"); */
        });
    }
    update(dt) {
        this.fountain.update();
    }

    loadSquare(loadingManager) {
        return new Promise((resolve, reject) => {
            let loader = new THREE.ObjectLoader(loadingManager);
            loader.load(MODEL_PATH,( obj ) => {
                console.log("Loaded square ", obj);

                obj.position.y = -80;
                obj.position.z = 100;
                obj.position.x = 0;
                obj.scale.set( 4, 4, 4 );

                this.add(obj);
                obj.updateMatrixWorld();
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
