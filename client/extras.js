import ExtrasDef from './extras_def'
import Chapters from './chapters'
import _ from 'lodash'
import DebugUtil from './util/debug'

const EXTRAS_PATH = "assets/extras"

export default class Extras extends THREE.Object3D {
    constructor() {
        super();

        this.currentExtras = [];
        this.debug = false;

    }

    init(loadingManager) {
        this.store = {};
        this.extrasLoader = new THREE.PLYLoader(loadingManager);

        events.on("hour_updated", (hour) => {this.loadHour(hour)});

        return new Promise((resolve, reject) => {
            console.log("Loading extras", ExtrasDef)
            let typePromises = ExtrasDef.types.map((type) => {return this.loadType(type)});
            Promise.all(typePromises)
            .then((results) => {
                console.log("Finished loading extras", this.store);
                resolve();
            });
        });      

    }

    loadType(props) {
        return new Promise((resolve, reject) => {
            console.log("Loading extra type ", props);
            this.extrasLoader.load(EXTRAS_PATH + "/" + props.fileName ,( geometry ) => {
                props.geometry = geometry;
                this.store[props.name] = props;
                resolve();
            });
        });
    }

    loadHour(hour) {
        console.log("Loading extras for hour ", hour);
        this.currentExtras.forEach((extra) => {
            this.remove(extra.mesh); 
            if (this.debug) {
                DebugUtil.donePositioning(extra.name);
            }
        });
        this.currentExtras.splice(0);
        let chapter = _.find(Chapters, {hour: hour });
        chapter.extraAssets.forEach((asset) => {
            if (this.store[asset.name]) {
                console.log("Loading extra asset ", asset);
                let type = this.store[asset.name];
                let pointSize = type.pointSize ? type.pointSize : 0.13;
                let material = new THREE.PointsMaterial( { size: pointSize, vertexColors: true } );
                let mesh = new THREE.Points( type.geometry, material );
                mesh.position.fromArray(asset.position);
                if (asset.rotation) {
                    mesh.rotation.set(
                        asset.rotation[0] * Math.PI / 180,
                        asset.rotation[1] * Math.PI / 180,
                        asset.rotation[2]* Math.PI / 180
                    )
                }
                if (asset.scale) {
                    mesh.scale.multiplyScalar(asset.scale);
                }

                this.add(mesh);
                this.currentExtras.push({name: asset.name, mesh: mesh});
                if (this.debug) {
                    DebugUtil.positionObject(mesh, asset.name, false, -40,40, asset.rotation);
                }
            }            
        });
    }
}
