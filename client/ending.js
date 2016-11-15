import EndCredits from './end_credits'
import DebugUtil from './util/debug'

export default class Ending {
    constructor(config, camera, timeController, characterController) {
        this.config = config;
        this.timeController = timeController;
        this.characterController;
        this.camera = camera;

        this.endCredits = new EndCredits(this.camera);
    }

    init(loadingManager) {
    }

    start() {
        console.log("Ending is starting!");
        events.emit("experience_end");

        // Move to midnight
        this.timeController.clockworkTransitionTo(0, 6, false);
    }
}

