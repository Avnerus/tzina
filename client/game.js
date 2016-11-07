import EventEmitter from 'events'

import GuiManager from './gui_manager'

import Sky from './sky'
import Square from './square'
import CollisionManager from './collision_manager'
import Character from './character'
import KeyboardController from './keyboard_controller'
import PostShader from './post_shader'
import Flood from './flood'
import ZoomController from './zoom_controller'
import TzinaVRControls from './tzina_vr_controls'
import Intro from './intro'
import SoundManager from './sound_manager'
import TimeController from './time_controller'
import CharacterController from './character_controller'
import Show from './show'

import DebugUtil from './util/debug'

// Animations
import HannahAnimation from './animations/hannah'
import LupoAnimation from './animations/lupo'
import MiriamAnimation from './animations/miriam'
import HaimAnimation from './animations/haim'
import ItzikAnimation from './animations/itzik'
import MeirAnimation from './animations/meir'
import MarkAnimation from './animations/mark'
import Agam12PMAnimation from './animations/agam12pm'

import IntroAnimation from './animations/introAni'
import {MeshText2D, textAlign} from './lib/text2d/index'

import WaterDrops from './water_drops'

import FPSCount from './util/fpscount'

export default class Game {
    constructor(config) {
        console.log("Game constructed!")
        this.config = config;
        this.started = false;
        this.controlPassed = false;
        this.shownWASD = false;
        this.shownZoom = false;
    }
    init() {

        class TzinaEmitter extends EventEmitter {}
        this.emitter = new TzinaEmitter();
        this.emitter.setMaxListeners(30);
        global.events = this.emitter;

        this.gui = new GuiManager(this.emitter);
        this.gui.init();

        this.renderer = new THREE.WebGLRenderer({antialias: true,alpha: true});
        this.renderer.setClearColor( 0, 1 );
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.container = document.getElementById('game');
        //this.renderer.setClearColor( 0x000000, 1 );

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight, 0.1, 2000000);

        //this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 2000000  );
        this.soundManager = new SoundManager(this.camera, this.scene);


        this.scene.add(this.camera);
        this.clock = new THREE.Clock();

        //this.camera.rotation.x = 0.22;


       /*
                 let helper = new THREE.GridHelper( 5000, 5000, 0xffffff, 0xffffff );
                 this.scene.add( helper );
                 let axis = new THREE.AxisHelper(75);
                 this.scene.add(axis);*/
        //

        // LIGHT
        //this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.7 );
        this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.0 );
        this.hemiLight.color.setHSL(1,1,1);

        //this.hemiLight.groundColor.setHSL( 0., 1, 0.75 );
        this.hemiLight.position.set( 0, 500, 0 );
        this.scene.add( this.hemiLight );


            /*
        events.emit("add_gui", {folder:"Hemi light", listen: true, step: 0.01}, this.hemiLight, "intensity", 0, 1);
        events.emit("add_gui", {folder:"Hemi light"}, this.hemiLight.position, "y"); */


        this.dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
        this.dirLight.position.set( 0, 120, -200  );
        this.dirLight.color.setHSL(1,1,1);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
        this.dirLight.color.setHSL(0.1,0.42,0.9);


        // --- hide by laura --- start
    
            /*
        events.emit("add_gui", {folder:"Dir light", listen:true}, this.dirLight, "intensity",0,2);
        events.emit("add_gui", {folder:"Hemi light", listen:true, step: 0.01}, this.hemiLight, "intensity",0,2);
        events.emit("add_gui", {folder:"Hemi light", listen:true}, this.hemiLight.position, "y");
        DebugUtil.colorPicker("Dir light", this.dirLight, "color");
        DebugUtil.colorPicker("Hemi light", this.hemiLight, "groundColor");
        DebugUtil.colorPicker("Hemi light", this.hemiLight, "color");
        */
        // --- hide by laura --- end

        //dirLight.target.position.set(0,100,0);
        //
        //
        /*
        this.dirLight.shadow.camera.far = 3500;
        this.dirLight.shadow.bias = -0.000001;*/
        this.scene.add(this.dirLight);

        this.loadingManager = new THREE.LoadingManager();
        this.collisionManager = new CollisionManager(this.camera, this.scene);

        // Square
        this.square = new Square(this.collisionManager, this.renderer, this.camera, this.config, this.soundManager, this.scene);

        this.sky = new Sky(this.loadingManager, this.scene,  this.dirLight, this.hemiLight);

        this.flood = new Flood();
        this.flood.init();
        this.scene.add(this.flood); 

        /*
        // Post processing
        this.composer = new THREE.EffectComposer(this.renderer);
        let renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        let effect = new THREE.ShaderPass(PostShader);
        effect.renderToScreen = true;
        this.composer.addPass( effect );
        */

       
        this.vrControls = new TzinaVRControls(this.emitter, this.camera);

        this.zoomController = new ZoomController(this.config, this.emitter, this.camera, this.square, this.scene, this.vrControls);
        this.zoomController.init();

        this.timeController = new TimeController(this.config, this.container, this.square, this.sky, this.scene, this.camera);

        this.intro = new Intro(this.camera, this.square, this.timeController, this.soundManager, this.scene);
        this.introAni = new IntroAnimation( this.scene, this.renderer, this.square, this.timeController);


        if (!this.config.noAnimations) {
            this.animations = {
                'Hannah' : new HannahAnimation(),
                'Miriam' : new MiriamAnimation(this.renderer),
                'Haim' : new HaimAnimation(this.renderer),
                'Itzik' : new ItzikAnimation(),
                'Meir' : new MeirAnimation(),
                'Mark' : new MarkAnimation(),
                'Agam12PM' : new Agam12PMAnimation()
            }
        } else {
            this.animations = {};
        }


        this.characterController = new CharacterController(this.config, this.animations, this.square, this.collisionManager, this.soundManager);

        let TEXT_DEFINITION = {
             align: textAlign.center,
             font: '20px Arial',
             fillStyle: '#FFFFFF',
             antialias: true
        }
        this.zoomGuidance = new MeshText2D("SCROLL TO ENTER", TEXT_DEFINITION)
        this.zoomGuidance.position.set(0, -180, 0);
        this.zoomGuidance.material.opacity = 0;
        this.scene.add(this.zoomGuidance);

        this.ZOOM_OUT_SOUND = 'assets/sound/zoom_out.ogg'

        this.waterDrops = new WaterDrops();
        this.camera.add(this.waterDrops);

            /*
        this.fpsCount = new FPSCount(this.camera);
        this.fpsCount.init();*/
    }

    load(onLoad) {
        this.loadingManager.onLoad = () => {

            console.log("Done loading everything!");
            if (!this.config.noSquare) {
                this.scene.add(this.square);
                this.sky.applyToMesh(this.square.getSphereMesh());
                this.introAni.initFBOParticle();
                this.scene.add(this.introAni);
            }

            //DebugUtil.positionEntry(this.square.ENTRY_POINTS[4], this.square.mesh, this.scene);

            onLoad();
        };
        this.loadingManager.onError = (err) => {
            console.log("Error during load", err);
        };

        this.loadingManager.onStart = (url,itemsLoaded, itemsTotal) => {
            console.log("Loading ", url, "(" + itemsLoaded + "/" + itemsLoaded  + ")");
        };

        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            console.log("Loaded " + itemsLoaded + "/" +  itemsTotal);
        }

        if (!this.config.noSquare) {
            this.square.init(this.loadingManager);
            this.introAni.init(this.loadingManager);
            this.sky.init(this.loadingManager);

            // Characters
            console.log("Initializing characters");
            this.characterController.init(this.loadingManager);
        }
        this.intro.init(this.loadingManager);
        this.soundManager.init(this.loadingManager);
        this.timeController.init(this.loadingManager);
        this.waterDrops.init(this.loadingManager);

        // WebVR
        this.vrEffect = new THREE.VREffect(this.renderer);
        this.vrEffect.setSize(window.innerWidth, window.innerHeight);

        let params = {
          hideButton: false, // Default: false.
          isUndistorted: false // Default: false.
        };
        this.vrManager = new WebVRManager(this.renderer, this.vrEffect, params);
        console.log("VR Manager: ", this.vrManager);

        let element = this.renderer.domElement;
        this.container.appendChild(element);

        this.resize();

    }

    showZoomGuidance() {
        let targetOpacity = 1;
        TweenMax.to(this.zoomGuidance.material, 1, {opacity: targetOpacity});
    }
    hideZoomGuidance() {
        let targetOpacity = 0;
        TweenMax.to(this.zoomGuidance.material, 1, {opacity: targetOpacity});
    }

    start() {

        events.on("intro_end", () => {
            console.log("Intro ended");
            if (!this.config.noSquare) {
                setTimeout(() => {
                    this.introAni.start();
                },5000);
            }
        });

        this.counter = 0;

        events.on("angle_updated", (hour) => {
            if (this.timeController.wasUsed && !this.zoomController.wasUsed && (hour == 17 || hour == 19)) {
                let lastHour = hour;
                setTimeout(() => {
                    if (this.timeController.currentHour == lastHour && !this.zoomController.wasUsed) {
                        this.showZoomGuidance();
                        setTimeout(() => {
                            this.hideZoomGuidance();
                        },3000);
                    }
                }, 3000);
            }
        });

        events.on("zoom_used", () => {
            console.log("Zoom controller used!");
            this.shownZoom = true;
            this.hideZoomGuidance();
            this.scene.remove(this.zoomGuidance);
        });

        events.on("time_rotated", () => {
        });

        events.on("base_position", () => {
        });
        events.on("chapter_threshold", (passed) => {
        });

        events.on("control_threshold", (passed) => {
            if (passed) {
                this.controlPassed = true;
                //this.introAni.disposeAni();
                if (!this.shownWASD) {
                    document.getElementById("wasd-container").style.display = "block";
                    setTimeout(() => {
                        document.getElementById("wasd-container").style.display = "none";
                    },3000);
                    this.shownWASD = true;
                }
            }
        });

        this.charactersEnded = [];
        events.on("character_ended", (name) => {
            this.charactersEnded.push(name);
            if (this.charactersEnded.length == 4) {
                this.timeController.setDaySpeed(0.1);
                this.timeController.done = true;
                this.zoomController.done = true;
                this.timeController.chapterTitle.visible = false;
                setTimeout(() => {
                    this.vrControls.active = false;
                    this.zoomController.velocityZ = -15.0;
                    this.zoomController.friction = 0;
                    document.getElementById("coming-soon").style.display = "block";
                    events.on("base_position", () => {
                            document.getElementById("coming-img").style.opacity = 1;
                    });
                    this.soundManager.loadSound(this.ZOOM_OUT_SOUND)
                    .then((sound) => {
                        sound.playIn(3);
                    });
                },40000);
            }
            else if (this.charactersEnded.indexOf("Itzik") != -1 &&
                this.charactersEnded.indexOf("Hannah") != -1 &&
                this.timeController.currentHour >= 17 &&
                this.timeController.currentHour < 19
               ) {
                   this.timeController.setDaySpeed(0.06);
            }
            else if (this.charactersEnded.indexOf("Miriam") != -1 &&
                this.charactersEnded.indexOf("Haim") != -1 &&
                this.timeController.currentHour >= 19
               ) {
                 this.timeController.jumpToTime(17);
            }

        });

        this.started = true;
            /*
        if (this.config.fullscreen) {
            this.vrManager.setMode_(2);
            }*/
        //this.soundManager.play("ambience");
        console.log("VR Compatible?", this.vrManager.isVRCompatible);
        if (this.config.controls == "locked" && !window.WebVRConfig.FORCE_ENABLE_VR) {
                this.keyboardController = new KeyboardController(this.config, this.camera, this.square, this.collisionManager)
                this.keyboardController.init();
                this.vrControls.standing = true;
                // this.vrControls.scale = 1.5;

                // --- hide by laura --- start
                events.emit("add_gui", {folder: "VR Position", listen: true, step: 0.01}, this.vrControls.basePosition, "x");
                events.emit("add_gui", {folder: "VR Position", listen: true, step: 0.01}, this.vrControls.basePosition, "y");
                events.emit("add_gui", {folder: "VR Position", listen: true, step: 0.01}, this.vrControls.basePosition, "z");
                // --- hide by laura --- end
        } else {
            this.vrControls = null;
            console.log("Orbit controls");
            this.keyboardController = new KeyboardController(this.config, this.camera, this.square, this.collisionManager)
            this.keyboardController.init();
            this.controls = new THREE.OrbitControls( this.camera  );
        }


        this.zoomController.start();

        if (!this.config.noSquare) {
            this.square.fountain.startCycle();
        }

        if (this.config.skipIntro) {
            if (!this.config.noSquare) {
                this.timeController.transitionTo(this.config.startTime, 1);
            }
            setTimeout(() => {
                events.emit("intro_end");
                this.intro.playCredits();
            },3000);


        } else {
            // start the intro
            this.intro.start();
            //this.timeController.setTime(17);//17
        }

    }

    animate(t) {
        //        this.fpsCount.begin();
        this.update(this.clock.getDelta(), this.clock.getElapsedTime());
        this.render();
        //this.fpsCount.end();
    }

    update(dt,et) {
        if (!this.config.noSquare) {
            this.sky.update(dt);
            this.square.update(dt,et);
            this.timeController.update(dt,et);
            this.characterController.update(dt,et);
            this.waterDrops.update(dt);
            if (!this.controlPassed) {
                this.intro.update();
            }
        }
        if (this.keyboardController) {
            this.keyboardController.update(dt);
        }
        this.introAni.update(dt,et);
        this.zoomController.update(dt);
        if (this.vrControls) {
               this.vrControls.update();
        } else {
            this.controls.update();
        }
        this.collisionManager.update(dt);
        this.flood.update(dt);
    }

    render() {
        // this.composer.render(); // For post processing
        //this.renderer.render(this.scene, this.camera);
        this.vrManager.render(this.scene, this.camera);
    }

    resize() {
        let width = this.container.offsetWidth;
        let height = this.container.offsetHeight;
        console.log("Tzina set size ", width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.vrEffect.setSize(width, height);
        //this.composer.setSize(width, height);
    }
}
