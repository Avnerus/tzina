import EndCredits from './end_credits'
import DebugUtil from './util/debug'

export default class Ending {
    constructor(config, camera, timeController, characterController, scene, vrControls, square) {
        this.config = config;
        this.timeController = timeController;
        this.characterController = characterController;
        this.camera = camera;
        this.scene = scene;
        this.vrControls = vrControls;
        this.square = square;

        this.debug = true;

        this.endCredits = new EndCredits(this.camera);
        this.faded = false;

        this.SQUARE_POSITON = [
            -28.24,
            -15.41,
            7.48
        ]

        //this.CHARACTER_ORDER = ["Rami", "Meir", "Itzik", "Miriam", "Lupo5PM", "Mark", "Hannah", "Haim", "Itzhak" ]
        this.CHARACTER_ORDER = ["Rami"];
        
        this.nextCharacter = null;
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

        // Add the dramatic spotlight
        this.spotLight = new THREE.SpotLight(0xffffff);
        this.spotLight.intensity = 2;
        this.spotLight.castShadow = false;
        this.spotLight.angle = 0.1;
        this.spotLight.distance = 0;
        this.spotLight.decay = 1;
        this.spotLight.penumbra = 0.8;
        this.spotLight.position.set(-6,2.4,4.14);

        if (this.debug) {
            let i = 0;
            events.emit("add_gui", {folder:"Spotlight " + i, listen: true}, this.spotLight, "castShadow");
            events.emit("add_gui", {folder:"Spotlight " + i, listen: true, step: 0.01}, this.spotLight.position, "x", -100, 100);
            events.emit("add_gui", {folder:"Spotlight " + i, listen: true, step: 0.01}, this.spotLight.position, "y", -100, 100);
            events.emit("add_gui", {folder:"Spotlight " + i, listen: true, step: 0.01}, this.spotLight.position, "z", -100, 100);
            events.emit("add_gui", {folder:"Spotlight " + i, listen:true}, this.spotLight, "intensity",0,2);
            events.emit("add_gui", {folder:"Spotlight " + i, listen: true, step: 0.1}, this.spotLight, "angle", 0, Math.PI / 2);
            events.emit("add_gui", {folder:"Spotlight " + i, listen:true}, this.spotLight, "distance",0,100);
            events.emit("add_gui", {folder:"Spotlight " + i, listen:true, step: 0.1}, this.spotLight, "decay",1,2);
            events.emit("add_gui", {folder:"Spotlight " + i, listen:true, step: 0.1}, this.spotLight, "penumbra",0,1);
            DebugUtil.colorPicker("Spotlight " + i, this.spotLight, "color");
        }
    }

    start() {
        console.log("Ending is starting!");
        events.emit("experience_end");
        this.endCredits.init();
        this.endCredits.scale.set(0.019, 0.019, 0.019);
        this.endCredits.position.set(30.51, 24, -7.18);
        this.endCredits.rotation.y = 285 * Math.PI /180;

        this.fadeOut()
        .then(() => {
            // Move to midnight
            this.timeController.jumpToTime(0);
            if (this.config.platform == "vive") {
                this.square.clockRotation = 17 * 15 * Math.PI / 180; // Best view 
            }

            this.square.position.fromArray(this.SQUARE_POSITON);

            if (this.config.platform == "desktop") {
                this.camera.position.set(0,1.2,0);
                this.square.mesh.rotation.y = 2.7;
            }


            setTimeout(() => {
                this.fadeIn()
                .then(() => {
                    setTimeout(() => {
                        this.characterController.addColiders();
                    },4000);
                });
            },3000);
        });


        events.on("character_playing", (name) => {
            setTimeout(() => {
                this.showCharacters();
            },5000);
            /*
            setTimeout(() => {
                console.log("Ending video");
                this.square.add(this.endCredits);
                this.endCredits.creditsVideo.video.addEventListener('timeupdate',() => {
                    if(!this.faded && this.endCredits.creditsVideo.video.currentTime > 60) {
                        console.log("Ending fade");
                        this.faded = true;                    
                        this.fadeOut()
                        .then(() => {
                            this.camera.add(this.endCredits);
                            this.endCredits.scale.set(0.077, 0.077, 0.077);
                            this.endCredits.rotation.y = 0;
                            if (inVR) {
                                this.endCredits.position.set(-0.02,-0.08,-60);
                                this.square.position.set(0,-15,-150);
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
            },2300000);*/
        });


        if (this.debug) {
            DebugUtil.positionObject(this.endCredits, "End credits");
        }


    }
    showCharacters() {
        this.showingCharacters = this.CHARACTER_ORDER.slice(0);
        this.showNextCharacter();
    }
    showNextCharacter() {
        let nextCharacter = this.showingCharacters.shift();
        console.log("Ending - showing ", nextCharacter);
        this.characterController.addCharacter(nextCharacter, true);
        if (this.showingCharacters.length > 0) {
            setTimeout(() => {
                this.showNextCharacter();
            },4000);
        } else {
            setTimeout(() => {
                this.showTexts();
            },2000);
        }

    }
    showTexts() {
        this.showingTexts = this.CHARACTER_ORDER.slice(0);
        this.showNextText();
        this.scene.add(this.spotLight);
    }
    showNextText() {
        let nextText = this.showingTexts.shift();
        let targetCharacter = this.characterController.characters[nextText];
        console.log("Ending - showing text", nextText,targetCharacter);
        this.spotLight.target = targetCharacter;
        if (this.showingTexts.length > 0) {
            setTimeout(() => {
                this.showNextText();
            },4000);
        }     }
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

