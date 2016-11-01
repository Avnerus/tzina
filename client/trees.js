import TreesDef from './trees/trees_def'
const TREES_PATH = "assets/trees"
import DebugUtil from './util/debug'

export default class Trees extends THREE.Object3D {
    constructor(camera, renderer) {
        super();
        this.debug = false;

        this.camera = camera;
        this.renderer = renderer;
    }

    init(loadingManager) {
        let treeTypes = {};
        this.treesLoader = new THREE.PLYLoader(loadingManager);

        return new Promise((resolve, reject) => {
            console.log("Loading trees", TreesDef)
            let typePromises = TreesDef.types.map((type) => {return this.loadType(type, treeTypes)});
            Promise.all(typePromises)
            .then((results) => {
                let material = new THREE.PointsMaterial( { size: 0.13, vertexColors: true } );
                let counter = 0;
                TreesDef.instances.forEach((instance) => {
        //            let mesh = new THREE.Points( treeTypes[instance.type], material );
                    let mesh = new Potree.PointCloudOctree(treeTypes[instance.type]);
                    //mesh.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
                    mesh.material.size = 0.09;
                    mesh.material.lights = false;
                    mesh.position.fromArray(instance.position);
                    mesh.position.y -= 1.1;
                    if (instance.scale) {
                        mesh.scale.multiplyScalar(instance.scale);
                    }
                    mesh.rotation.order ="ZXY";
                    mesh.rotation.set(
                        instance.rotation[0] * Math.PI / 180,
                        instance.rotation[1] * Math.PI / 180,
                        instance.rotation[2]* Math.PI / 180
                    )
                        /*
                    mesh.rotateZ(90 * Math.PI / 180);
                    mesh.rotateX(instance.rotateX * Math.PI / 180);*/

                    this.add(mesh);

                    if (this.debug) {
                        DebugUtil.positionObject(mesh, instance.type + " " + counter, false, -40,40, instance.rotation);
                    }

                    counter++;
                    resolve();
                })
            });
        });      
    }

    loadType(props,store) {
        return new Promise((resolve, reject) => {
            console.log("Loading tree type ", props);
            Potree.POCLoader.load(TREES_PATH + "/" + props.fileName,( geometry ) => {
                store[props.name] = geometry;
                resolve();
            });
        });
    }

    update(dt,et) {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].update(this.camera, this.renderer);
        }  
    }
}
