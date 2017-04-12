import ExtrasDef from './extras_def'
import Chapters from './chapters'
import ChaptersWeb from './web/chapters'
import _ from 'lodash'
import DebugUtil from './util/debug'
import MiscUtil from './util/misc'

const EXTRAS_PATH = "assets/extras"
const HEART_PATH = "ass"

export default class Extras extends THREE.Object3D {
    constructor(config, camera, renderer, soundManager) {
        super();

        this.soundManager = soundManager;
        this.currentExtras = [];
        this.cameras = [camera];
        this.renderer = renderer;
        this.config = config;
        this.debug = false;
        this.inControl = false;
    }

    init(loadingManager) {
        this.store = {};

        events.on("hour_updated", (hour) => {
            setTimeout(() => {
                this.loadHour(hour)
            },1000);
        });

        events.on("control_threshold", (passed) => {
            if (passed) {
                for (let i = 0; i < this.currentExtras.length; i++) {
                    this.currentExtras[i].mesh.material.size = this.currentExtras[i].mesh.material.rightSize;
                }  
            }
        });

        events.on("vr_start", (cameras) => {
            this.cameras = cameras;
        });

        return new Promise((resolve, reject) => {
            console.log("Loading extras", ExtrasDef)
            this.loadHeart(loadingManager)
            .then((heartResult) => {
                let typePromises = ExtrasDef.types.map((type) => {return this.loadType(type)});
                return Promise.all(typePromises)
            })
            .then((results) => {
                console.log("Finished loading extras", this.store);
                resolve();
            });
        });      

    }

    loadHeart(loadingManager) {
        // Itzhak's heart
        
        return new Promise((resolve, reject) => {
            new THREE.JSONLoader(loadingManager).load("assets/animations/itzhak/models/heart1.json", (geometry, material) => {
                this.heartGeo = geometry;
                this.heartMat = new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, transparent: true});
                resolve();
            })
        })
    }

    loadType(props) {
        return new Promise((resolve, reject) => {
            console.log("Loading extra type ", props);
            Potree.POCLoader.load(EXTRAS_PATH + "/" + props.fileName,( geometry ) => {
                props.geometry = geometry;
                this.store[props.name] = props;
                resolve();
            });
        });
    }

    loadHour(hour) {
        console.log("Loading extras for hour ", hour);
        this.currentExtras.forEach((extra) => {
            this.remove(extra.handle); 
            if (this.debug) {
                //DebugUtil.donePositioning(extra.name);
            }
        });
        this.currentExtras.splice(0);
        let chapter = _.find(Chapters, {hour: hour });
        chapter.extraAssets.forEach((asset) => {

            if (this.store[asset.name]) {
                console.log("Loading extra asset ", asset);
                let type = this.store[asset.name];

                if (this.config.platform == "desktop") {
                    let chapterWeb = _.find(ChaptersWeb, {hour: hour });
                    let assetWeb = _.find(chapterWeb.extraAssets, {name: asset.name})
                    if (assetWeb) {
                        MiscUtil.overwriteProps(asset, assetWeb);
                    }
                }
                
                let extra = new THREE.Object3D();
                let mesh = new Potree.PointCloudOctree(type.geometry);
                mesh.material.rightSize = type.pointSize ? type.pointSize : 0.1;
                mesh.material.size = mesh.material.rightSize * 0.01;
                mesh.material.lights = false;
                mesh.position.set(0,0,0);

                extra.position.fromArray(asset.position);
               // mesh.position.y -= 1.1;
                if (asset.rotation) {
                    extra.rotation.set(
                        asset.rotation[0] * Math.PI / 180,
                        asset.rotation[1] * Math.PI / 180,
                        asset.rotation[2]* Math.PI / 180
                    )
                }
                if (asset.scale) {
                    extra.scale.multiplyScalar(asset.scale);
                }
                // Add hearts
                let hearts = [];
                if (type.hearts) {
                    let counter = 1;
                    type.hearts.forEach((heartDef) => {
                        let heart = new THREE.Mesh(this.heartGeo, this.heartMat);
                        heart.position.fromArray(heartDef.position);
                        if (heartDef.rotation) {
                            heart.rotation.set(
                                heartDef.rotation[0] * Math.PI / 180,
                                heartDef.rotation[1] * Math.PI / 180,
                                heartDef.rotation[2]* Math.PI / 180
                            )
                        }
                        if (heartDef.scale) {
                            heart.scale.multiplyScalar(heartDef.scale);
                            if (this.config.platform == "vive") {
                                heart.scale.multiplyScalar(2);
                            }
                        }
                        if (this.debug) {
                            DebugUtil.positionObject(heart, asset.name + "'s heart " + counter, false, -50, 50, heartDef.rotation);
                        }
                        extra.add(heart);
                        hearts.push(heart);
                    });
                }
                extra.add(mesh);

                this.add(extra);

                //If we have sound on the character load it and push it to the currentExtras object      
                if(asset.sound){
                    console.log(asset.name + " has a point cloud sound");
                    this.loadPointSound(asset.sound.url).then((sampler)=>{
                        this.updateMatrixWorld();
                        sampler.positionalAudio.panner.refDistance = asset.sound.distance;
                        this.audio = sampler;
                        //Debug cube - for positioning
                        this.audio.position.set(asset.sound.position[0],asset.sound.position[1],asset.sound.position[2]);
                        //this.audio.createDebugCube();

                        this.audio.loop = true;
                        this.audio.controlVolume(3.0);

                        

                        console.log("the POCSounds reference distance is  " + this.audio.positionalAudio.panner.refDistance);
                        
                         this.currentExtras.push({name: asset.name, mesh: mesh, handle: extra, hearts: hearts, sound: this.audio});

                    });

                   
                } else {
                    this.currentExtras.push({name: asset.name, mesh: mesh, handle: extra, hearts: hearts});
                }
                
                

                
                if (this.debug) {
                    DebugUtil.positionObject(extra, asset.name, false, -40,40, asset.rotation);
                }
            }            
        });
    }
    update(dt,et) {
        for (let i = 0; i < this.currentExtras.length; i++) {
            for (let j = 0; j < this.cameras.length; j++) {
                this.currentExtras[i].mesh.update(this.cameras[j], this.renderer);
            }
        }  
    }

    hideExtras() {
        this.currentExtras.forEach((extra) => {
            extra.mesh.children[0].material.opacity = 0;
            extra.hearts.forEach((heart) => {heart.visible = false});
            if(extra.sound){
                extra.sound.stop();
            }
        });
    }
    showExtras() {
        this.currentExtras.forEach((extra) => {
            if(extra.sound){
                extra.sound.play();
            }
            TweenMax.to( extra.mesh.children[0].material, 1, { opacity: 1, onComplete: () => {
                extra.hearts.forEach((heart) => {heart.visible = true});
            }});
        });
    }

        loadPointSound(url){
                return new Promise((resolve, reject) => {
                this.soundManager.createPositionalSoundSampler(
                    url,
                    (sampler) => {
                        resolve(sampler);
                    }
                );
            }
        );
    }
}
