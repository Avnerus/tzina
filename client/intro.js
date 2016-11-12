import _ from 'lodash'
import Credits from './credits';
import {SpriteText2D, textAlign} from './lib/text2d/index'
import DebugUtil from './util/debug'
import StaticSoundSampler from './sound_manager'

export default class Intro {
    constructor(camera, square, timeConroller, soundManager, scene, vrControls) {
        this.camera = camera;
        this.square = square;
        this.soundManager = soundManager;
        this.timeConroller = timeConroller;
        this.scene = scene;
        this.vrControls = vrControls;

        this.soundEvents = [
            {
                time: 5,
                action: () => {
                    this.bringUpSun()
                }
            },
            {
                time: 7,
                action: () => {
                //    this.hideTitle();
                  //  this.bringUpSun();
                }
            },
            {
                time: 55.3,
                action: () => {
                  //  this.endIntro();
                }
            }
        ]

        
        this.INTRO_SOUND = 'assets/sound/INTRO_Shirin.ogg'
        this.LOGO_PATH = 'assets/intro/logo/logo.json';

        this.STARTING_POSITION = new THREE.Vector3(
            0,
            //    -0.52,
            -1.0,
            0.1
        );

    }

    init(loadingManager) {
        // Put the camera in the starting position
//        events.emit("intro_start");
        // events.emit("add_gui",{}, this.camera.position, "y"); 
        
       /*

        let titlePlaneGeo = new THREE.PlaneGeometry( 512, 128 );
        let loader = new THREE.TextureLoader(loadingManager);
        loader.load('assets/intro/title.png', (texture) => {
            this.titleTexture = texture;
            let material = new THREE.MeshBasicMaterial( {map: this.titleTexture, side: THREE.DoubleSide, transparent:true}  );
            this.titlePlane = new THREE.Mesh(titlePlaneGeo, material);
            this.titlePlane.position.copy(this.square.getCenterPosition());
            this.titlePlane.position.y = 400;
        });*/


        let CREDIT_TEXT_TITLE = {
             align: textAlign.center, 
             font: '20px Miriam Libre',
             fillStyle: '#FFFFFF',
             antialias: true 
        }
        let CREDIT_TEXT_NAME = {
             align: textAlign.center, 
             font: 'bold 26px Miriam Libre',
             fillStyle: '#FFFFFF',
             antialias: true 
        }
        let CREDIT_TEXT_SCALE = 0.0005;

        this.creditTextTitle = new SpriteText2D("", CREDIT_TEXT_TITLE);
        this.creditTextTitle.scale.multiplyScalar(CREDIT_TEXT_SCALE);
        this.creditTextTitle.position.set(-0.02,-0.16,-0.5);
        this.creditTextTitle.material.opacity = 0;
        this.camera.add(this.creditTextTitle);

        this.creditTextName = new SpriteText2D("", CREDIT_TEXT_NAME);
        this.creditTextName.scale.multiplyScalar(CREDIT_TEXT_SCALE);
        this.creditTextName.position.set(-0.02,-0.18,-0.5);
        this.creditTextName.material.opacity = 0;
        this.camera.add(this.creditTextName);

        let loader = new THREE.ObjectLoader(loadingManager);
        loader.load(this.LOGO_PATH,( obj ) => {
            this.logo = obj;
            this.square.add(this.logo);
            this.logo.scale.set(0.626, 0.626, 0.626);
            this.logo.rotation.y = 213 * Math.PI / 180;

            this.logoHebrew  = this.logo.getObjectByName("heb").children[0];
            this.logoEnglish = this.logo.getObjectByName("logoEng").children[0];

            console.log("Loaded Intro logo ", obj, this.logoHebrew, this.logoEnglish);

            // Turn of neon
            this.logoHebrew.material.emissiveIntensity = 0;
            this.logoEnglish.material.emissiveIntensity = 0;
            this.logoHebrew.material.color = new THREE.Color(0xcccccc);
            this.logoEnglish.material.color = new THREE.Color(0xcccccc);

            DebugUtil.positionObject(this.logo, "Logo");
        });

        let fadePlaneGeo = new THREE.PlaneGeometry( 10, 10 );
        let fadePlaneMaterial = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, transparent:true, opacity: 1.0} );
        this.fadePlane = new THREE.Mesh(fadePlaneGeo, fadePlaneMaterial);
        this.fadePlane.position.set(0, 0, -0.1001);
            /*
        DebugUtil.positionObject(this.fadePlane, "Fade plane");
        events.emit("add_gui", {folder: "Fade plane", step: 0.01, listen: true} ,this.fadePlane.material, "opacity", 0, 1);*/

        events.on("vr_start", () => {
            console.log("Into VR Start!");
            this.fadePlane.position.set(0, 0, -0.5001);
        });

    }
    start() {
        // Get into the starting position
        if (this.vrControls.getCurrentPosition()) {
            this.vrControls.basePosition.copy(this.STARTING_POSITION);
        } else {
            this.STARTING_POSITION.set(0,0.5,2);
            this.camera.position.copy(this.STARTING_POSITION);
        }
        
        this.camera.add(this.fadePlane);

        // Scale the square
        this.square.scale.set(0.015, 0.015, 0.015);

        DebugUtil.positionObject(this.square, "Square",true);

        // Load the sound
        this.soundManager.loadSound(this.INTRO_SOUND)
        .then((sound) => {
            console.log("Intro Sound ", sound);
            this.sound = sound;

            setTimeout(() => {
                
        //        this.turnOnWindows();
                this.playSound(); 
                setTimeout(() => {
                    this.fadeIn();
                },1000)
                //this.zoomToSquare();

            },3000);
        });
    }

    fadeIn() {
        TweenMax.to(this.fadePlane.material, 2.0, { opacity:0});
    }
    fadeOut() {
        TweenMax.to(this.fadePlane.material, 2.0, { opacity:1});
    }

    bringUpSun() {
        this.timeConroller.transitionTo(17,2);
        /*0000
        this.timeConroller.rotate(360,5)
        .then(() => {
            // transition to local time
            this.timeConroller.transitionToLocalTime();
        });*/
    }

    playSound() {
        this.sound.playIn(1);
        this.currentEvent = this.soundEvents.shift();
        //this.bringUpSun();
    }

    showTitle() {
        this.logoHebrew.material.color.copy(this.logoHebrew.material.emissive);
        this.logoEnglish.material.color.copy(this.logoEnglish.material.emissive);
        this.logoHebrew.material.emissiveIntensity = 1;
        this.logoEnglish.material.emissiveIntensity = 1;
    }
    hideTitle() {
    }

    turnOnWindows() {
        let shuffledWindows = _.shuffle(this.square.windows.children);
        console.log("INTRO: TURN ON  WINDOWS");
        let index = {
            value: 0
        }
        let lastIndex = 0;
        TweenMax.to(index, 50, {value: Math.floor((shuffledWindows.length - 1) / 3), ease: Circ.easeIn, onUpdate: (val) => {
            let currentIndex = Math.ceil(index.value);
            for (let i = lastIndex + 1; i <= currentIndex; i++) {
                shuffledWindows[i].visible = true;
            }
            lastIndex = currentIndex;
        }});
    }

    turnOffWindows() {
        let litWindows = _.filter(this.square.windows.children, _.matchesProperty('visible', true));
        console.log("INTRO: TURN OFF " + litWindows.length + "  WINDOWS");
        let index = {
            value: 0
        }
        let lastIndex = 0;
        TweenMax.to(index, 6, {value:litWindows.length - 1, ease: Circ.easeIn, onUpdate: (val) => {
            let currentIndex = Math.ceil(index.value);
            for (let i = lastIndex + 1; i <= currentIndex; i++) {
                litWindows[i].visible = false;
            }
            lastIndex = currentIndex;
        }});
    }

    endIntro() {
        setTimeout(() => {
            console.log("END INTRO");
            events.emit("intro_end");
        },5000)
    }

    update() {
        if (this.sound && this.sound.isPlaying && this.currentEvent) {
            if (this.sound.getCurrentTime() >= this.currentEvent.time) {
                this.currentEvent.action();
                if (this.soundEvents.length > 0) {
                    this.currentEvent = this.soundEvents.shift();
                } else {
                    this.currentEvent = null;
                }
            }
        }
    }

    playCredits() {
        this.currentCredit = 0;
        this.showNextCredit();
    }

    showNextCredit() {
        let name = Credits.credits[this.currentCredit].Name;
        let title = Credits.credits[this.currentCredit].Role;
        
        this.creditTextTitle.text = title;
        this.creditTextName.text = name;

        TweenMax.to( this.creditTextName.material, 1, { opacity: 1});
        TweenMax.to( this.creditTextTitle.material, 1, { opacity: 1, 
            onComplete: () => {
                setTimeout(() => {
                   this.hideCredit();
                },2500);
            } 
        });

    }

    hideCredit() {
        TweenMax.to( this.creditTextName.material, 1, { opacity: 0});
        TweenMax.to( this.creditTextTitle.material, 1, { opacity: 0, 
            onComplete: () => {
                this.currentCredit++;
                if (this.currentCredit < Credits.credits.length) {
                    this.showNextCredit();
                } else {
                    this.camera.remove(this.creditTextTitle);
                    this.camera.remove(this.creditTextName);
                }
            } 
        });
    }
}
