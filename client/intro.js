import _ from 'lodash'
import Credits from './credits';
import CreditsHeb from './credits_heb';
import {SpriteText2D, textAlign} from './lib/text2d/index'
import DebugUtil from './util/debug'
import Video360 from './util/video360'

export default class Intro {
    constructor(camera, square, timeConroller, soundManager, scene, vrControls, zoomController, config, introAni) {
        this.camera = camera;
        this.square = square;
        this.soundManager = soundManager;
        this.timeConroller = timeConroller;
        this.scene = scene;
        this.vrControls = vrControls;
        this.zoomController = zoomController;
        this.config = config;
        this.introAni = introAni;


        this.soundEvents = [
            {
                time: 9.33,
                action: () => {
                    this.showTitle()
                }
            },
            {
                time: 23,
                action: () => {
                    this.bringUpSun();
                }
            },
            {
                time: 50,
                action: () => {
                    this.playCredits();
                }
            }
        ]

        
        this.INTRO_SOUND = this.config.language == "eng" ? 'assets/sound/INTRO_Shirin.ogg': 'assets/sound/INTRO_Shirin_heb.ogg';
        this.LOGO_PATH = 'assets/intro/logo/logo.json';

        this.STARTING_POSITION = new THREE.Vector3(
            0,
            -0.65,
            0.11
        );

        //this.guideVideo = new Video360("assets/intro/guide.webm")

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

        this.credits = this.config.language == "eng" ? Credits : CreditsHeb;

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
        let CREDIT_TEXT_SCALE = 0.039;

        this.creditTextTitle = new SpriteText2D("", CREDIT_TEXT_TITLE);
        this.creditTextTitle.scale.multiplyScalar(CREDIT_TEXT_SCALE);
        this.creditTextTitle.position.set(0.4,7.27,-17);
        this.creditTextTitle.material.opacity = 0;

        if (this.config.platform == "desktop") {
            this.creditTextTitle.position.set(-0.2, 6, -17);
            this.creditTextTitle.scale.set(0.02, 0.02, 0.02);
        }

        this.scene.add(this.creditTextTitle);

        this.creditTextName = new SpriteText2D("", CREDIT_TEXT_NAME);
        this.creditTextName.position.y = -30;
        this.creditTextName.material.opacity = 0;
        this.creditTextTitle.add(this.creditTextName);

        //DebugUtil.positionObject(this.creditTextTitle, "Credits title");

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

            //DebugUtil.positionObject(this.logo, "Logo");

            this.logoEnglish.updateMatrixWorld();
            this.logoHebrew.updateMatrixWorld();
            this.lightEng = new THREE.PointLight( this.logoEnglish.material.emissive, 0, 0.03 );
            this.lightEng.position.copy(new THREE.Vector3().setFromMatrixPosition(this.logoEnglish.matrixWorld));
            this.scene.add(this.lightEng);
                /*
            DebugUtil.positionObject(this.lightEng, "Light english");
            events.emit("add_gui", {folder: "Light english", step: 0.01, listen: true} ,this.lightEng, "distance", 0, 5);
            events.emit("add_gui", {folder: "Light english", step: 0.01, listen: true} ,this.lightEng, "intensity", 0, 5);*/

            this.lightHeb = new THREE.PointLight( this.logoHebrew.material.emissive, 0, 0.03 );
            this.lightHeb.position.copy(new THREE.Vector3().setFromMatrixPosition(this.logoHebrew.matrixWorld));
            this.scene.add(this.lightHeb);
        });

        let fadePlaneGeo = new THREE.PlaneGeometry( 20, 20 );
        let fadePlaneMaterial = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, transparent:true, opacity: 1.0} );
        this.fadePlane = new THREE.Mesh(fadePlaneGeo, fadePlaneMaterial);
        this.fadePlane.position.set(0, 0, -0.1001);
            /*
        DebugUtil.positionObject(this.fadePlane, "Fade plane");
        events.emit("add_gui", {folder: "Fade plane", step: 0.01, listen: true} ,this.fadePlane.material, "opacity", 0, 1);*/

    /*
        this.guideVideo.init();
        let guidePlaneGeo = new THREE.PlaneGeometry( 2048, 2048 );
        let guideMaterial = new THREE.MeshBasicMaterial( {map: this.guideVideo.texture, side: THREE.DoubleSide, transparent:false}  );
        // let guideMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff , wireframe: false} );
        this.guidePlane = new THREE.Mesh(guidePlaneGeo, guideMaterial);
        this.guidePlane.position.set(0,0,-2000);
        DebugUtil.positionObject(this.guidePlane, "Guide plane", true, -3000,3000);*/
        

        events.on("vr_start", () => {
            console.log("Into VR Start!");
            this.fadePlane.position.set(0, 0, -0.050001);
            //this.guidePlane.position.set(0,0,-1600);

            console.log("CALIBRATE - Base position INTRO", this.vrControls.basePosition);
        });

        //this.square.visible = false;
        // this.introAni.visible = false;

    }
    position() {
        // Scale the square
        this.square.scale.set(0.013, 0.013, 0.013);


        //DebugUtil.positionObject(this.square, "Square",true);
        if (inVR) {
            let squarePosition = new THREE.Vector3().copy(this.STARTING_POSITION).multiplyScalar(-1.0);
            this.square.position.copy(squarePosition);
        } else {
            this.STARTING_POSITION.set(0,0.5,2);
            this.camera.position.copy(this.STARTING_POSITION);
        }
    }
    start() {
        if (this.config.speedIntro) {
            this.localHour = this.config.startTime;
            this.timeConroller.preloadTime(this.localHour);
        } else {
            this.localHour = this.timeConroller.preloadLocalTime();
        }

        //this.guideVideo.video.loop = false;
        this.playIntro();

            /*
        if (this.config.speedIntro) {
            this.playIntro();
        } else {
            setTimeout(() => {
                this.camera.add(this.guidePlane);
                this.guideVideo.video.addEventListener('ended',() => {
                    console.log("Guide video ended");
                    this.playIntro();
                });
                this.guideVideo.play();
            },3000);
            }*/

        events.emit("intro_start");

        // Load the sound
    }

    playIntro() {
        /*
        this.camera.remove(this.guidePlane);
        this.guideVideo.unload();
        this.guidePlane.geometry.dispose();
        this.guidePlane.material.dispose();
        this.square.visible = true;
        this.introAni.visible = true;*/

        this.soundManager.loadSound(this.INTRO_SOUND)
        .then((sound) => {
            console.log("Intro Sound ", sound);
            this.sound = sound;

            setTimeout(() => {
                
        //        this.turnOnWindows();
                if (!this.config.speedIntro) {
                    this.playSound();
                } else {
                    this.bringUpSun();
                }

            },2000);
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
            TweenMax.to(this.fadePlane.material, 3.0, { opacity:1, onComplete: () => {resolve()}});
        });
    }

    bringUpSun() {
        let speed1 = this.config.speedIntro ? 3 : 37;
        let speed2 = this.config.speedIntro ? 3 : 14;
        let speed3 = this.config.speedIntro ? 1000 : 10000;

        this.timeConroller.transitionTo(0,speed1, false)
        .then(() => {
            // transition to local time
            if (!this.config.speedIntro) {
                return this.timeConroller.transitionTo(this.localHour, speed2, false);
            } else {
                return this.timeConroller.transitionTo(this.config.startTime, speed2, false);
            }
        })
        .then( () => { 
            setTimeout(() => {
                return this.fadeOut()
                .then(() => {
                    this.enterSquare();                    
                    this.square.extras.hideExtras();
                });
                },speed3)
        });
    }

    enterSquare() {
        console.log("Intro - enter square");
        this.square.scale.set(1,1,1);
        this.zoomController.start();
        this.zoomController.jumpIn();
        this.fadeIn()
        .then(() => {
            this.endIntro();
        });
    }

    playSound() {
        this.sound.playIn(1);
        this.currentEvent = this.soundEvents.shift();
        //this.bringUpSun();
    }

    showTitle() {
        this.logoHebrew.material.color.copy(this.logoHebrew.material.emissive);
        this.logoEnglish.material.color.copy(this.logoEnglish.material.emissive);
        this.flickerLight(this.logoHebrew.material, this.lightHeb, 0.05, 3);
        this.flickerLight(this.logoEnglish.material, this.lightEng, 0.05, 3);
            /*
        this.logoHebrew.material.emissiveIntensity = 1;
        this.logoEnglish.material.emissiveIntensity = 1;*/
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
        console.log("END INTRO");
        this.fadePlane.geometry.dispose();
        this.fadePlane.material.dispose();
        this.creditTextTitle.material.dispose();
        this.creditTextName.material.dispose();
        this.square.remove(this.logo);
        this.logoHebrew.material.dispose();
        this.logoHebrew.geometry.dispose();
        this.logoEnglish.material.dispose();
        this.logoEnglish.geometry.dispose();
        this.scene.remove(this.lightEng);
        this.scene.remove(this.lightHeb);
        events.emit("intro_end");
    }

    update(dt,et) {
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
            /*
        if (this.guideVideo) {
            this.guideVideo.update(dt);
            }*/
    }

    playCredits() {
        this.currentCredit = 0;
        this.showNextCredit();
    }

    showNextCredit() {
        let name = this.credits.credits[this.currentCredit].Name;
        let title = this.credits.credits[this.currentCredit].Role;
        
        this.creditTextTitle.text = title;
        this.creditTextName.text = name;

        TweenMax.to( this.creditTextName.material, 1, { opacity: 1});
        TweenMax.to( this.creditTextTitle.material, 1, { opacity: 1, 
            onComplete: () => {
                setTimeout(() => {
                    this.hideCredit();
                },2200);
            } 
        });
    }
    flickerLight(material, light, _speed, _times ){
        let repeatTimes = 1 + (_times-1)*2;
        TweenMax.fromTo(material, _speed,
                { emissiveIntensity: 1 },
                { emissiveIntensity: 0, ease: Power0.easeNone, repeat: repeatTimes, yoyo: true,
                 onUpdate:()=>{light.intensity = material.emissiveIntensity; }
                });
    }

    hideCredit() {
        TweenMax.to( this.creditTextName.material, 1, { opacity: 0});
        TweenMax.to( this.creditTextTitle.material, 1, { opacity: 0, 
            onComplete: () => {
                this.currentCredit++;
                if (this.currentCredit < this.credits.credits.length) {
                    this.showNextCredit();
                } else {
                    this.camera.remove(this.creditTextTitle);
                    this.camera.remove(this.creditTextName);
                }
            } 
        });
    }
}
