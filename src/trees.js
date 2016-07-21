import TreesDef from '../assets/trees/trees_def'
const TREES_PATH = "assets/trees"

export default class Trees extends THREE.Object3D {
    constructor() {
        super();
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
                TreesDef.instances.forEach((instance) => {
                    let mesh = new THREE.Points( treeTypes[instance.type], material );
                    mesh.position.fromArray(instance.position);
                    mesh.scale.set(0.25 * instance.scale, 0.25 * instance.scale, 0.25 * instance.scale);
                    mesh.rotateZ(90 * Math.PI / 180);
                    mesh.rotateX(instance.rotateX * Math.PI / 180);
                    this.add(mesh);
                    resolve();
                })
            });
        });      
    }

    loadType(props,store) {
        return new Promise((resolve, reject) => {
            console.log("Loading tree type ", props);
            this.treesLoader.load(TREES_PATH + "/" + props.fileName ,( geometry ) => {
                store[props.name] = geometry;
                resolve();
            });
        });
    }
}
