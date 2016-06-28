const MODEL_PATH = "assets/square/scene.json"
const TREES_PATH = "assets/trees/points.ply"

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

        let treesLoader = new THREE.PLYLoader(loadingManager);
        treesLoader.load(TREES_PATH,( geometry ) => {
            console.log("Loaded trees ", geometry);
            let material = new THREE.PointsMaterial( { size: 0.05, vertexColors: true } );
            let mesh = new THREE.Points( geometry, material );
            mesh.position.set(-470, 22, 183);
            mesh.rotateZ(90 * Math.PI / 180);

            scene.add(mesh);
        });


    }
    update(dt) {
    }

    getCenterPosition() {
        return this.squareCenter;
    }
}
