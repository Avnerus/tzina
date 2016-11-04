import TreesDef from './trees/trees_def'
const TREES_PATH = "assets/trees"
import DebugUtil from './util/debug'

export default class Trees extends THREE.Object3D {
    constructor(camera, renderer) {
        super();
        this.debug = true;

        this.camera = camera;
        this.renderer = renderer;

        const glslify = require('glslify');
        this.windVertexShader = glslify('./shaders/potree_wind_vs.glsl');
    }

    init(loadingManager) {
        let treeTypes = {};
        this.treesLoader = new THREE.PLYLoader(loadingManager);

        return new Promise((resolve, reject) => {
            console.log("Loading trees", TreesDef)
            let typePromises = TreesDef.types.map((type) => {return this.loadType(type, treeTypes)});
            Promise.all(typePromises)
            .then((results) => {

                // Modify the potree point cloud material with a shader that supports wind
                this.potreeMaterial = new Potree.PointCloudMaterial();
                let windUniforms = { 
                    time: { type: "f", value: 0 },
                    speedFactor: { type: "f", value: 1.0 },
                    pointSize: { type: "f", value: 2.0 },
                    bendFactor: { type: "f", value: 0.05 },
                    bendHeightLimit: { type: "f", value: 0.0 },
                    wind: { type: "v2", value: new THREE.Vector2 ( 1.0, 0.5 ) },
                    rustleHeightLimit: { type: "f", value: 5.0 },
                    rustleColorCheck: { type: "b", value: false },
                    rustleFactor: { type: "f", value: 4.0 },
                    rustleFrequency: { type: "f", value: 0.2 }
                };

                Object.assign(windUniforms, this.potreeMaterial.uniforms);
                let windShader = this.potreeMaterial.getDefines() + this.windVertexShader;

                this.potreeMaterial.setValues({
                    uniforms: windUniforms,
                    vertexShader: windShader
                });

                console.log("Material shader ", this.potreeMaterial.vertexShader);

                let counter = 0;
                TreesDef.instances.forEach((instance) => {
        //            let mesh = new THREE.Points( treeTypes[instance.type], material );
                    if (treeTypes[instance.type]) {
                        let mesh = new Potree.PointCloudOctree(treeTypes[instance.type], this.potreeMaterial);
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
                            //DebugUtil.positionObject(mesh, instance.type + " " + counter, false, -40,40, instance.rotation);
                        }

                        counter++;
                    }
                })
                resolve();
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
        this.potreeMaterial.uniforms.time.value = et;
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].update(this.camera, this.renderer);
        }  
    }
}
