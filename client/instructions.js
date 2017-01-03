import DebugUtil from './util/debug'
import {MeshText2D, textAlign} from './lib/text2d/index'

export default class Instructions {
    constructor(config, camera) {
        this.config = config;
        this.camera = camera;
    }

    init(loadingManager) {
        let TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '70px Miriam Libre',
             fillStyle: '#33e5ab',
             antialias: true,
             shadow: true
        }
        this.instructionText = new MeshText2D("You are in one of the most iconic landmarks of Tel Aviv.", TEXT_DEFINITION);
        this.instructionText.scale.multiplyScalar(0.00005);
        this.instructionText.position.set(0, 0, -0.1001);

        DebugUtil.positionObject(this.instructionText, "Instructions text");

        console.log("Instructions initialized");
    }

    start() {
        console.log("Instructions starting");
        this.camera.add(this.instructionText);
    }

    update(dt) {
    }
}

