import EndCredits from './end_credits'
import DebugUtil from './util/debug'

export default class Ending {
    constructor(config, camera, timeController, characterController, scene) {
        this.config = config;
        this.timeController = timeController;
        this.characterController;
        this.camera = camera;
        this.scene = scene;

        this.endCredits = new EndCredits(this.camera);
    }

    init(loadingManager) {
    }

    start() {
        console.log("Ending is starting!");
        events.emit("experience_end");
        this.endCredits.init();
        this.endCredits.scale.set(0.01, 0.01, 0.01);
        this.endCredits.position.set(-30.37, 16.65, -15.72);
        this.endCredits.rotation.y = 80 * Math.PI /180;

        // Move to midnight
        this.timeController.clockworkTransitionTo(0, 6, false);


        // Add the dramatic spotlight
        let spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-1.44, 22.69, -17.9 );
        spotLight.intensity = 2;
        spotLight.castShadow = false;
        spotLight.angle = 0.2;
        spotLight.distance = 50;
        spotLight.decay = 1;
        spotLight.penumbra = 0.5;

        events.on("character_playing", (name) => {
            this.scene.add(this.endCredits);
            this.endCredits.play();
        });

        DebugUtil.positionObject(this.endCredits, "End credits");

        /*
        let i = 0;
        events.emit("add_gui", {folder:"Spotlight " + i, listen: true}, spotLight, "castShadow");
        events.emit("add_gui", {folder:"Spotlight " + i, listen: true, step: 0.01}, spotLight.position, "x", -100, 100);
        events.emit("add_gui", {folder:"Spotlight " + i, listen: true, step: 0.01}, spotLight.position, "y", -100, 100);
        events.emit("add_gui", {folder:"Spotlight " + i, listen: true, step: 0.01}, spotLight.position, "z", -100, 100);
        events.emit("add_gui", {folder:"Spotlight " + i, listen:true}, spotLight, "intensity",0,2);
        events.emit("add_gui", {folder:"Spotlight " + i, listen: true, step: 0.1}, spotLight, "angle", 0, Math.PI / 2);
        events.emit("add_gui", {folder:"Spotlight " + i, listen:true}, spotLight, "distance",0,100);
        events.emit("add_gui", {folder:"Spotlight " + i, listen:true, step: 0.1}, spotLight, "decay",1,2);
        events.emit("add_gui", {folder:"Spotlight " + i, listen:true, step: 0.1}, spotLight, "penumbra",0,1);
        DebugUtil.colorPicker("Spotlight " + i, spotLight, "color");
        */
        this.scene.add(spotLight);
    }
    update(dt) {
        this.endCredits.update(dt);
    }
}

