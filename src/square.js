const MODEL_PATH = "assets/square/scene.json"

export default class Square {
    constructor() {
        console.log("Square constructed!")
    }
    init(scene,manager) {
        let loader = new THREE.ObjectLoader(manager);
        loader.load(MODEL_PATH,( obj ) => {
            console.log("Loaded square ", obj);
            obj.position.y = -1950;
            obj.position.z = 1200;
            scene.add(obj);
        });
    }
    update(dt) {
    }
}
