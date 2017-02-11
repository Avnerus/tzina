import TreesDef from './trees/trees_def'
const TREES_PATH = "assets/trees"
import DebugUtil from './util/debug'

export default class Trees extends THREE.Object3D {
    constructor(config, camera, renderer) {
        super();
        this.debug = false;

        this.cameras = [camera];
        this.renderer = renderer;
        this.config = config;

        const glslify = require('glslify');
        this.windVertexShader = glslify('./shaders/potree_wind_vs.glsl');
    }

    init(loadingManager) {
        let treeTypes = {};

        return new Promise((resolve, reject) => {
            console.log("Loading trees", TreesDef)
            let typePromises = TreesDef.types.map((type) => {return this.loadType(type, treeTypes)});
            Promise.all(typePromises)
            .then((results) => {

                // Modify the potree point cloud material with a shader that supports wind
                this.potreeWindMaterial = new Potree.PointCloudMaterial();
                this.potreeMaterial = new Potree.PointCloudMaterial();

                let windUniforms = { 
                    time: { type: "f", value: 0 },
                    speedFactor: { type: "f", value: 1.0 },
                    pointSize: { type: "f", value: 0.03 },
                    bendFactor: { type: "f", value: 0.01 },
                    bendHeightLimit: { type: "f", value: 0.0 },
                    wind: { type: "v2", value: new THREE.Vector2 ( 1.0, 0.5 ) },
                    rustleHeightLimit: { type: "f", value: 5.0 },
                    rustleColorCheck: { type: "b", value: false },
                    rustleFactor: { type: "f", value: 1.0 },
                    rustleFrequency: { type: "f", value: 0.2 }
                };

                Object.assign(windUniforms, this.potreeWindMaterial.uniforms);
                let windShader = this.potreeWindMaterial.getDefines() + this.windVertexShader;

                this.potreeWindMaterial.setValues({
                    uniforms: windUniforms,
                    vertexShader: windShader
                    });


                let counter = 0;
                TreesDef.instances.forEach((instance) => {
        //            let mesh = new THREE.Points( treeTypes[instance.type], material );
                    if (treeTypes[instance.type]) {
                        let mesh;
                        if (instance.scale > 0.5) {
                            mesh = new Potree.PointCloudOctree(treeTypes[instance.type], this.potreeWindMaterial);
                        } else {
                            mesh = new Potree.PointCloudOctree(treeTypes[instance.type], this.potreeMaterial);
                        }
                        //mesh.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
                        mesh.material.size = 0.003;
                        mesh.material.lights = false;
                        mesh.position.fromArray(instance.position);
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
                    }
                })

                if (typeof(events) != 'undefined') {

                    events.on("control_threshold", (passed) => {
                        this.controlPassed = passed;
                        if (passed) {

                            let size = this.config.platform == "desktop" ? 0.07 : 0.03;
                            this.potreeWindMaterial.size = size;
                            this.potreeMaterial.size = size;

                            //
                            // In VR Hide some trees that won't be visible
                            if (inVR) {
                                let hide1 = this.children[8];
                                let hide2 = this.children[13];
                                console.log("Hiding 2 trees", hide1, hide2);

                                this.remove(hide1);
                                this.remove(hide2);
                            }
                        }
                    });
                    events.on("vr_start", (cameras) => {
                        this.cameras = cameras;
                    });
                }

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
        this.potreeWindMaterial.uniforms.time.value = et;
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.cameras.length; j++) {
                this.children[i].update(this.cameras[j], this.renderer);
            }
        }  
    }
    clickEffect(input){
        var counter = 1;
        if(input == 1){
            counter++;
            var shaderValue = Math.sin(counter) + 1.0;
            this.potreeWindMaterial.uniforms.speedFactor.value = shaderValue;
        } else {
            this.potreeWindMaterial.uniforms.speedFactor.value = 1.0;
        }
    }
}
