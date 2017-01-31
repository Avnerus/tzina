import EndCredits from './end_credits'
import DebugUtil from './util/debug'
import {MeshText2D, textAlign} from './lib/text2d/index'

export default class Ending {
    constructor(config, camera, timeController, characterController, scene, vrControls, square, introAni) {
        this.config = config;
        this.timeController = timeController;
        this.characterController = characterController;
        this.camera = camera;
        this.scene = scene;
        this.vrControls = vrControls;
        this.square = square;
        this.introAni = introAni;

        this.debug = true;

        this.endCredits = new EndCredits(this.camera);
        this.faded = false;

        this.SQUARE_POSITON = [
            -28.24,
            -15.41,
            7.48
        ]

        this.CHARACTER_ORDER = ["Rami", "Meir", "Itzik", "Miriam", "Lupo5PM", "Mark", "Hannah", "Haim", "Itzhak" ]
        //this.CHARACTER_ORDER = ["Rami", "Hannah"];
        //this.CHARACTER_ORDER = ["Miriam"];
        
        this.nextCharacter = null;

        this.CHARACTER_TEXTS = {
            "Meir": [
                "Meir tried to form a Facebook group", 
                "against the destruction of the square.",
                "He was very upset and worried",
                "over the impact it will have on the area.",
                "He continues to feed the lost pigeons."
            ],
            "Rami": [
                "Rami doesn’t care too much",
                "about the removal of the square.",
                "He says life is always in motion,",
                "and one shouldn’t fear that."
            ],
            "Miriam": [
                "Miriam passed away",
                "around April-May 2015.",
                "We shot a reenactment",
                "of a conversation with her.",
            ],
            "Itzik": [
                "Itzik hopes that the demolition",
                "will keep the junkies away.",
                "He will likely keep sitting",
                "on the benches in the area."
            ],
            "Mark": [
                "Mark found an apartment at south Tel Aviv",
                "and doesn’t sleep on the benches anymore.",
                "He still use drugs and he still comes",
                "to visit the square every week.",
                "He was in deep grief about the demolition."
            ],
            "Lupo5PM": [
                "Lupo is bored from the area",
                "and is happy with any change",
                "that might energizes the place.",
                "He wished that Agam’s sculpture",
                "would have been destroyed as well."
            ],
            "Hannah": [
                "Hanna get upset every time",
                "she is reminded over the demolishion,",
                "since she often forgets about it."
            ],
            "Itzhak": [
                "Yitzhak says that for the lack",
                "of a better option,",
                "he will keep coming to the square."
            ],
            "Haim": [
                "Haim wished that the square",
                "would be torn down after his death.",
                "That did not happen. Haim is alive",
                "and still begs at the same spot."
            ]
        }
    }

    generateText() {
        let TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '70px Miriam Libre',
             fillStyle: '#ffffff',
             antialias: true
        }
        let text = new THREE.Object3D();

        text.position.set(-45.22, 14.96, 11.3);
        text.rotation.set(
             327 * Math.PI / 180,
             105 * Math.PI / 180,
             31 * Math.PI / 180
        );

        text.scale.set(0.016, 0.016, 0.016);

        if (this.config.platform == "desktop") {
        } else {
        }
        if (this.debug) {
            DebugUtil.positionObject(text, "Ending character text");
        }
        let offset = 0;

        for (let i = 0; i < 5; i++) {
            let line = new MeshText2D("", TEXT_DEFINITION);
            line.material.opacity = 0;
            line.position.set(0,offset,0);
            text.add(line);
            offset -= 100;
        }

        return text;
    }

    init(loadingManager) {
        let fadePlaneGeo = new THREE.PlaneGeometry( 20, 20 );
        let fadePlaneMaterial = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, transparent:true, opacity: 0.0} );
        this.fadePlane = new THREE.Mesh(fadePlaneGeo, fadePlaneMaterial);
        this.fadePlane.position.set(0, 0, -0.1001);
        //DebugUtil.positionObject(this.fadePlane, "Ending Fade plane");
        //events.emit("add_gui", {folder: "Ending Fade plane", step: 0.01, listen: true} ,this.fadePlane.material, "opacity", 0, 1);

        let miriamGeo = new THREE.PlaneGeometry( 512, 1024 );
        new THREE.TextureLoader(loadingManager).load('assets/end/miriam.png', (texture) => {
            let material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.DoubleSide, transparent:true}  );
            this.miriamPlane = new THREE.Mesh(miriamGeo, material);
            this.miriamPlane.position.set(610,-73,24);
            this.miriamPlane.scale.set(0.83, 0.83, 0.83);
            DebugUtil.positionObject(this.miriamPlane, "Miriam image", false, -1000, 1000);
        });

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

        this.text = this.generateText();

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
            this.square.suns.visible = false;
            if (this.config.platform == "vive") {
                this.square.clockRotation = 17 * 15 * Math.PI / 180; // Best view 
            }

            this.square.position.fromArray(this.SQUARE_POSITON);

            if (this.config.platform == "desktop") {
                this.camera.position.set(0,1.2,0);
                this.square.mesh.rotation.y = 2.7;
            }

            this.introAni.createSnowParticle();
            this.introAni.simulationShader.uniforms.squareRadius.value = 0.0;
            this.introAni.fbo.particles.position.x = -38;


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
        this.scene.add(this.text);
        this.showTextLines();
    }
    showTextLines() {
        for (let i = 0; i < this.text.children.length; i++) {
            TweenMax.to( this.text.children[i].material, 1, { opacity: 1});
        }
    }

    hideTextLines() {
        for (let i = 0; i < this.text.children.length; i++) {
            TweenMax.to( this.text.children[i].material, 1, { opacity: 0});
        }
    }

    setTextLines(lines) {
        for (let i = 0; i < this.text.children.length; i++) {
            if (i < lines.length) {
                this.text.children[i].text = lines[i];
            }
            else {
                this.text.children[i].text = "";
            }
        }
    }

    showNextText() {
        let nextText = this.showingTexts.shift();
        let targetCharacter = this.characterController.characters[nextText];
        //this.hideTextLines();
        this.setTextLines(this.CHARACTER_TEXTS[nextText]); 
        console.log("Ending - showing text", nextText, this.text);
        this.spotLight.target = targetCharacter;
        targetCharacter.idleVideo.play();
        if (nextText == "Miriam") {
            this.text.add(this.miriamPlane);
        }
        setTimeout(() => {
            targetCharacter.idleVideo.pause();
            if (nextText == "Miriam") {
                this.text.remove(this.miriamPlane);
            }
            if (this.showingTexts.length > 0) {
                this.showNextText();
            } else {
                this.hideTextLines();
            }
        },10000); 
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

