import EndCredits from './end_credits'
import DebugUtil from './util/debug'
import MultilineText from './util/multiline_text'
import {textAlign} from './lib/text2d/index'

export default class Ending {
    constructor(config, camera, timeController, characterController, scene, vrControls, square, introAni, soundManager) {
        this.config = config;
        this.timeController = timeController;
        this.characterController = characterController;
        this.camera = camera;
        this.scene = scene;
        this.vrControls = vrControls;
        this.square = square;
        this.introAni = introAni;
        this.soundManager = soundManager;

        this.endingSound;

        this.debug = false;

        this.endCredits = new EndCredits(this.config);
        this.faded = false;

        this.SQUARE_POSITON = [
            -29.17,
            -15.28,
            7.77
        ]

        this.CHARACTER_ORDER = ["Rami", "Meir", "Itzik", "Miriam", "Lupo5PM", "Mark", "Hannah", "Haim", "Itzhak" ]
        //this.CHARACTER_ORDER = ["Rami", "Hannah"];
        //this.CHARACTER_ORDER = ["Miriam"];
        
        this.nextCharacter = null;

        this.CHARACTER_TEXTS = {
            "Meir": [
                "Meir tried to form a Facebook group against the ruin", 
                "He was very worried for what it willl do to the area.",
                "He continues to feed the lost pigeons.",
            ],
            "Rami": [
                "Rami doesn’t care too much about the removal",
                "of the square. He says life is always",
                "in motion, and one shouldn’t fear that."
            ],
            "Miriam": [
                "Miriam passed away around April-May 2015.",
                "We shot a reenactment of a conversation with her."
            ],
            "Itzik": [
                "Itzik hopes that the demolition will keep the",
                "junkies away. He will likely keep sitting",
                " on the benches in the area."
            ],
            "Mark": [
                "Mark found an apartment at south Tel Aviv and doesn’t sleep",
                "on the benches anymore. He still use drugs and still visit.",
                "He was in deep grief about the demolition."
            ],
            "Lupo5PM": [
                "Lupo is bored from the area and is happy with any change",
                "that might energizes the place. He wished that Agam’s",
                "fountain would have been destroyed as well."
            ],
            "Hannah": [
                "Hanna get upset every time",
                "she is reminded over the demolishion,",
                "since she often forgets about it."
            ],
            "Itzhak": [
                "Yitzhak says that for the lack of a better option,",
                "he will keep coming to the square."
            ],
            "Haim": [
                "Haim wished that the square would be torn down",
                "after his death. That did not happen.",
                "Haim is alive and still begs at the same spot."
            ]
        }
        this.CHARACTER_TEXTS_HEB = {
            "Meir": [
                ".מאיר ניסה להקים קבוצת פייסבוק נגד הריסת הכיכר", 
                ".הוא נסער מאוד מהשינוי ופוחד ממה שיקרה לאזור",
                ".ממשיך להגיע ולהאכיל את היונים האבודות"
            ],
            "Rami": [
                ",רמי אדיש להורדת הכיכר. מרגיש שהחיים הם",
                ".חלק מתנועה ואין מה לפחד ממה שהם מזמנים"
            ],
            "Miriam": [
                ".מרים נפטרה באזור אפריל-מאי 2015",
                ".לצורך הצילומים בוצע שחזור של שיחה עמה"
            ],
            "Itzik": [
                "איציק מקווה שהורדת הכיכר תרחיק את",
                "הנרקומנים מהאזור. הוא ככל הנראה ימשיך",
                ".להגיע ולשבת על הספסלים"
            ],
            "Mark": [
                "מארק מצא דירה בדרום תל אביב, הוא יותר לא ישן על",
                "ספסלי הכיכר. עדיין משתמש בסמים",
                ".ועדיין מגיע לבקר. הוא כאב מאוד את ההריסה"
            ],
            "Lupo5PM": [
                "לופו משעומם ביותר מהאזור ושמח על כל שינוי",
                "שמביא עמו אנרגיה חדשה. הוא קיווה שהפסל",
                ".של אגם יהרס גם יחד עם הכיכר"
            ],
            "Hannah": [
                "חנה מצטערת על הרס הכיכר",
                ",בכל פעם מחדש",
                ".מאחר והיא נוטה לשכוח שזה קרה"
            ],
            "Itzhak": [
                ",יצחק מעיד כי ימשיך להגיע לשבת בכיכר",
                ".בלית ברירה"
            ],
            "Haim": [
                "חיים יחל לכך שיהרסו את הכיכר",
                "רק לאחר מותו ,זה לא קרה. חיים עדיין חי",
                ".ועדיין יושב באותו מקום מקבץ נדבות"
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
        let text = new MultilineText(5, TEXT_DEFINITION, 100);

        text.position.set(-45.22, 9, 11.3);
        text.rotation.set(
             327 * Math.PI / 180,
             105 * Math.PI / 180,
             31 * Math.PI / 180
        );

        text.scale.set(0.0136, 0.0136, 0.0136);

        if (this.debug) {
            DebugUtil.positionObject(text, "Ending character text");
        }

        text.init();
        text.hide(0);

        return text;
    }

    init(loadingManager) {
        let fadePlaneGeo = new THREE.PlaneGeometry( 20, 20 );
        let fadePlaneMaterial = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, transparent:true, opacity: 0.0} );
        this.fadePlane = new THREE.Mesh(fadePlaneGeo, fadePlaneMaterial);
        this.fadePlane.position.set(0, 0, -0.1001);
        //DebugUtil.positionObject(this.fadePlane, "Ending Fade plane");
        //events.emit("add_gui", {folder: "Ending Fade plane", step: 0.01, listen: true} ,this.fadePlane.material, "opacity", 0, 1);

        this.loadEndingSound().then(()=>{
            console.log("Ending sound loaded");
        });

        let miriamGeo = new THREE.PlaneGeometry( 512, 1024 );
        new THREE.TextureLoader(loadingManager).load('assets/end/miriam.png', (texture) => {
            let material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.DoubleSide, transparent:true}  );
            this.miriamPlane = new THREE.Mesh(miriamGeo, material);
            if (this.config.platform == "vive") {
                this.miriamPlane.position.set(-3.93,13.4,8.61);
            } else {
                this.miriamPlane.position.set(-10.84,13.4,8.24);
            }
            this.miriamPlane.rotation.set(0,112 * Math.PI/180,0);
            this.miriamPlane.scale.set(0.00169, 0.00169, 0.00169);
            //DebugUtil.positionObject(this.miriamPlane, "Miriam image");
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
        if (this.config.platform == "vive") {
            this.spotLight.position.set(-6,2.4,4.14);
        } else {
            this.spotLight.position.set(-51.73,20.44,29.46);
        }

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
        if (this.config.language == "heb") {
            this.CHARACTER_TEXTS = this.CHARACTER_TEXTS_HEB;
        }
        this.floodLight = new THREE.PointLight( 0xffffff, 0.6, 13); // 5
        this.floodLight.position.set(-15.3,2.36,2.36);
        if (this.debug) {
            events.emit("add_gui", {folder:"floodLight " + i, listen:true, step: 0.1}, this.floodLight, "decay",1,2);
            events.emit("add_gui", {folder:"floodLight " + i, listen: true, step: 0.01}, this.floodLight.position, "x", -100, 100);
            events.emit("add_gui", {folder:"floodLight " + i, listen: true, step: 0.01}, this.floodLight.position, "y", -100, 100);
            events.emit("add_gui", {folder:"floodLight " + i, listen: true, step: 0.01}, this.floodLight.position, "z", -100, 100);
            events.emit("add_gui", {folder:"floodLight " + i, listen:true}, this.floodLight, "intensity",0,2);
            events.emit("add_gui", {folder:"floodLight " + i, listen:true}, this.floodLight, "distance",0,100);
        }
        this.scene.add(this.floodLight);

        this.fadeOut()
        .then(() => {
            // Move to midnight, kill all tweens before
            TweenMax.killAll();

            this.timeController.jumpToTime(0);
            this.square.suns.visible = false;
            this.square.pool.enableWaves = false;
            this.square.fountainLight.intensity = 0.2;

            if (this.config.platform == "vive") {
                this.square.clockRotation = 17 * 15 * Math.PI / 180; // Best view 
            }

            this.square.position.fromArray(this.SQUARE_POSITON);

            if (this.config.platform == "desktop") {
                this.camera.position.set(-1.2,1.6,-3.1);
                this.square.mesh.rotation.y = 2.7;
                this.square.setEndingColliders();
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
        });

        events.on("character_ended", (name) => {
            this.showTexts();
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
        } 
    }
    showTexts() {
        if(!this.endingSound.isPlaying){
            this.endingSound.play();
        }
        this.showingTexts = this.CHARACTER_ORDER.slice(0);
        this.showNextText();
        this.scene.add(this.spotLight);
        this.scene.add(this.text);
        this.text.show(1);
    }

    showNextText() {
        let nextText = this.showingTexts.shift();
        let targetCharacter = this.characterController.characters[nextText];
        //this.hideTextLines();
        this.text.setText(this.CHARACTER_TEXTS[nextText]); 
        console.log("Ending - showing text", nextText, this.text);
        this.spotLight.target = targetCharacter;
        targetCharacter.idleVideo.play();
        if (nextText == "Miriam") {
            console.log("Ending - Miriam plane");
            this.square.add(this.miriamPlane);
        } 
        setTimeout(() => {
            if (nextText == "Miriam") {
                this.square.remove(this.miriamPlane);
            } 
            targetCharacter.idleVideo.pause();
            if (this.showingTexts.length > 0) {
                this.showNextText();
            } else {
                this.text.hide(1);
                setTimeout(() => {
                    this.showCredits();
                },3000);
            }
        },10000); 
    }
    showCredits() {
        this.fadeOut()
        .then(() => {
            this.introAni.disposeAni();
            this.camera.add(this.endCredits);
            this.endCredits.rotation.y = 0;
            this.endCredits.init();
            if (this.config.platform == "vive") {
                this.endCredits.position.set(-0.02,-0.08,-60);
                this.endCredits.scale.set(0.053, 0.053, 0.053);
                this.square.position.set(0,-15,-150);
            } else {
                this.endCredits.position.set(-0.02,-0.08,-50);
                this.endCredits.scale.set(0.04, 0.04, 0.04);
                this.camera.position.set(0, 15, 150);
            }
            this.fadeIn()
            .then(() => {
                TweenMax.to(this.endingSound, 1.0, {volume: 0.1, onComlete: () =>{
                    console.log("Faded sound to 0.4 for video dialog");
                }, onUpdate: () => {
                    this.endingSound.controlVolume(this.endingSound.volume);
                }});
                this.endCredits.play();
            });
        });
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

    loadEndingSound(){
                return new Promise((resolve, reject) => {

                this.soundManager.createStaticSoundSampler(
                    "assets/sound/new_end.ogg",
                    (sampler) => {
                        this.endingSound = sampler;
                        this.endingSound.volume = 0.5;
                        this.endingSound.controlVolume(this.endingSound.volume);
                        resolve(sampler);
                    }
                );
            }
        );
    }
}

