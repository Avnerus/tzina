const MODEL_PATH = "assets/square/scene.json"
const TREES_PATH = "assets/trees/points.ply"

export default class Square extends THREE.Object3D{
    constructor() {
        super();
        console.log("Square constructed!")
    }
    init(collisionManager,loadingManager) {
        let loader = new THREE.ObjectLoader(loadingManager);
        loader.load(MODEL_PATH,( obj ) => {
            console.log("Loaded square ", obj);

            /*
            obj.position.y = -1950;
            obj.position.z = 1200;
            */

            obj.position.y = -80;
            obj.position.z = 100;
            obj.position.x = 0;
            obj.scale.set( 4, 4, 4 );

            this.add(obj);
            obj.updateMatrixWorld();
            collisionManager.addBoundingBoxes(obj,this);

            this.squareMiddle  = obj.getObjectByName("MB_PS");
            if (this.squareMiddle) {
                this.squareCenter  = new THREE.Vector3();
                this.squareCenter.setFromMatrixPosition(this.squareMiddle.matrixWorld);
                console.log("Square center", this.squareCenter);
            } else {
                this.squareCenter = new THREE.Vector3(0,0,0);
            }

            this.sphereMesh = obj.getObjectByName("SkySphere").children[0];
            console.log("Sky sphere", this.sphereMesh);
        });

        let treesLoader = new THREE.PLYLoader(loadingManager);
        treesLoader.load(TREES_PATH,( geometry ) => {
            console.log("Loaded trees ", geometry);
            let material = new THREE.PointsMaterial( { size: 0.05, vertexColors: true } );
            let mesh = new THREE.Points( geometry, material );
            mesh.position.set(-100,12, -20);
            mesh.rotateZ(90 * Math.PI / 180);

            this.add(mesh);
        });


    }
    update(dt) {
    }

    getSphereMesh() {
        return this.sphereMesh;
    }

    getCenterPosition() {
        return this.squareCenter;
    }
}
