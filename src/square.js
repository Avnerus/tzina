const MODEL_PATH = "assets/square/scene.json"

export default class Square {
    constructor() {
        console.log("Square constructed!")
    }
    init(scene,collisionManager,loadingManager) {
        let loader = new THREE.ObjectLoader(loadingManager);
        loader.load(MODEL_PATH,( obj ) => {
            console.log("Loaded square ", obj);
            obj.position.y = -1950;
            obj.position.z = 1200;

            scene.add(obj);
            obj.updateMatrixWorld();
            collisionManager.addBoundingBoxes(obj,scene);

            this.squareMiddle  = obj.getObjectByName("MB_PS");
            this.squareCenter  = new THREE.Vector3();
            this.squareCenter.setFromMatrixPosition(this.squareMiddle.matrixWorld);
        });
    }
    update(dt) {
    }

    getCenterPosition() {
        return this.squareCenter;
    }
}
