import EndCredits from './end_credits'
import DebugUtil from './util/debug'

export default class Ending {
    constructor(config, camera, timeController, characterController, scene, vrControls) {
        this.config = config;
        this.timeController = timeController;
        this.characterController;
        this.camera = camera;
        this.scene = scene;
        this.vrControls = vrControls;

        this.endCredits = new EndCredits(this.camera);
        this.faded = false;
    }

    init(loadingManager) {
        let fadePlaneGeo = new THREE.PlaneGeometry( 20, 20 );
        let fadePlaneMaterial = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, transparent:true, opacity: 0.0} );
        this.fadePlane = new THREE.Mesh(fadePlaneGeo, fadePlaneMaterial);
        this.fadePlane.position.set(0, 0, -0.1001);
        //DebugUtil.positionObject(this.fadePlane, "Ending Fade plane");
        //events.emit("add_gui", {folder: "Ending Fade plane", step: 0.01, listen: true} ,this.fadePlane.material, "opacity", 0, 1);

        events.on("vr_start", () => {
            console.log("Into VR Start!");
            this.fadePlane.position.set(0, 0, -0.050001);
        });
    }

    start() {
        console.log("Ending is starting!");
        events.emit("experience_end");
        this.endCredits.init();
        this.endCredits.scale.set(0.019, 0.019, 0.019);
        this.endCredits.position.set(-33.62, 21.88, -11.75);
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
            setTimeout(() => {
                console.log("Ending video");
                this.scene.add(this.endCredits);
                this.endCredits.play();
                this.endCredits.creditsVideo.video.addEventListener('timeupdate',() => {
                    if(!this.faded && this.endCredits.creditsVideo.video.currentTime > 60) {
                        console.log("Ending fade");
                        this.faded = true;                    
                        this.fadeOut()
                        .then(() => {
                            this.endCredits.scale.set(0.077, 0.077, 0.077);
                            this.endCredits.rotation.y = 0;
                            this.camera.add(this.endCredits);
                            if (inVR) {
                                this.endCredits.position.set(-0.02,-0.08,-60);
                                this.vrControls.basePosition.set(0,15,150);
                            } else {
                                this.endCredits.position.set(-0.02,-0.08,-50);
                                this.camera.position.set(0, 15, 150);
                            }
                            this.fadeIn()
                            .then(() => {

                            })
                        });
                    }
                },false);
            },23000);
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
    fadeIn() {
        return new Promise((resolve, reject) => {
            TweenMax.to(this.fadePlane.material, 2.0, { opacity:0, onComplete: () => {
                this.camera.remove(this.fadePlane);
            resolve()}});
        });
    }
    fadeOut() {
        return new Promise((resolve, reject) => {
            this.camera.add(this.fadePlane);
            TweenMax.to(this.fadePlane.material, 2.0, { opacity:1, onComplete: () => {resolve()}});
        });
    }
    update(dt) {
        this.endCredits.update(dt);
    }
}

