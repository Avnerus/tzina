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


import DebugUtil from './util/debug'

export default class Game {
    constructor(config) {
        console.log("Game constructed!")
        this.config = config;
        this.started = false;
    }
    init() {

        class TzinaEmitter extends EventEmitter {}
        this.emitter = new TzinaEmitter();
        global.events = this.emitter;

        this.gui = new GuiManager(this.emitter);
        this.gui.init();

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor( 0, 1 );
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.container = document.getElementById('game');
        //this.renderer.setClearColor( 0x000000, 1 );

        this.scene = new THREE.Scene();
        console.log("SCENE: ", this.scene);
        this.camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight, 0.1, 2000000);
        
        //this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 2000000  );
        this.soundManager = new SoundManager(this.camera, this.scene);


        this.scene.add(this.camera);
        this.clock = new THREE.Clock();

        //this.camera.rotation.x = 0.22;


                 let helper = new THREE.GridHelper( 5000, 5000, 0xffffff, 0xffffff );
                 this.scene.add( helper );
                 let axis = new THREE.AxisHelper(75);
                 this.scene.add(axis);
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

        //events.emit("add_gui", {folder:"Directional light"}, this.dirLight, "intensity"); 

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
        this.square = new Square();

        // Test characters
        

        this.sky = new Sky(this.loadingManager, this.dirLight, this.hemiLight);




        /*
        this.flood = new Flood();
        this.flood.init();
        this.scene.add(this.flood); */

        /*
        // Post processing
        this.composer = new THREE.EffectComposer(this.renderer);
        let renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        let effect = new THREE.ShaderPass(PostShader);
        effect.renderToScreen = true;
        this.composer.addPass( effect );
        */

        this.intro = new Intro(this.camera, this.square, this.sky, this.soundManager, this.scene);

        this.zoomController = new ZoomController(this.config, this.emitter, this.camera, this.square, this.scene);
        this.zoomController.init();

        this.timeController = new TimeController(this.config, this.container, this.square, this.sky);
        this.timeController.init();

        this.characterController = new CharacterController(this.config, this.square, this.collisionManager);

    }

    load(onLoad) {
        this.loadingManager.onLoad = () => {

            console.log("Done loading everything!");
            this.scene.add(this.square);
            this.sky.applyToMesh(this.square.getSphereMesh());

            /*

            let cube = DebugUtil.adjustableCube(
                new THREE.Vector3().fromArray(this.square.ENTRY_POINTS[1].startPosition),
                "Ramp entry",
                1,
                0xff0000
            )
            this.square.mesh.add( cube );

            cube = DebugUtil.adjustableCube(
                new THREE.Vector3().fromArray(this.square.ENTRY_POINTS[1].endPosition),
                "Ramp end",
                1,
                0x00ffff
            )
            this.square.mesh.add( cube );*/

            onLoad();
        };
        this.loadingManager.onError = (err) => {
            console.log("Error during load", err);
        };

        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            console.log("Loaded ", url, "(" + itemsLoaded + "/" +  itemsTotal + ")");
        }

        this.sky.init();
        this.soundManager.init();
        this.square.init(this.collisionManager, this.loadingManager);

        // Characters
        this.characterController.init(this.loadingManager);

        // WebVR
        this.vrEffect = new THREE.VREffect(this.renderer);
        this.vrEffect.setSize(window.innerWidth, window.innerHeight);

        let params = {
          hideButton: false, // Default: false.
          isUndistorted: false // Default: false.
        };
        this.vrManager = new WebVRManager(this.renderer, this.vrEffect, params);

    }

    start() {
        this.started = true;
        this.vrManager.setMode_(2);
        let element = this.renderer.domElement;
        this.container.appendChild(element);
        this.soundManager.play();
        console.log("VR Compatible?", this.vrManager.isVRCompatible);
        if (this.config.controls == "locked") {
                this.vrControls = new TzinaVRControls(this.emitter, this.camera);
                this.vrControls.standing = true;
                this.keyboardController = new KeyboardController(this.config, this.camera, this.square, this.collisionManager)
                this.keyboardController.init();


        } else {
            this.controls = new THREE.OrbitControls( this.camera, element );
        }

        this.resize();


        this.square.fountain.startCycle();

        if (this.config.skipIntro) {
            // Get in the square
            //
            
           /*
            this.keyboardController.setPosition(-15, 10, 167);
            this.sky.transitionTo(17,1);
            */
        } else {
            // Init the intro
            this.intro.init();

            this.timeController.setTime(17);
        }


        events.on("intro_end", () => {
            //this.lupo.play();
            document.getElementById("wasd-container").style.display = "block";
            setTimeout(() => {
                document.getElementById("wasd-container").style.display = "none";
            },3000);
        });


        this.charactersEnded = 0;
        events.on("character_ended", (name) => {
            this.charactersEnded++;
            if (this.charactersEnded == 1) {
                setTimeout(() => {
                    this.zoomOut();
                },30000)
            }
        });
    }


    zoomOut() {
        console.log("FINAL ZOOM OUT");
        let zoomVector = new THREE.Vector3().copy(new THREE.Vector3(0, 0, 1) ).applyQuaternion(this.camera.quaternion);
        zoomVector.y = 0.15;
        zoomVector.multiplyScalar(1000);
        let newPosition = new THREE.Vector3().copy(this.camera.position);
        newPosition.add(zoomVector);
        console.log("Move to ", newPosition);
        TweenMax.to(this.camera.position, 20, {x: newPosition.x, y: newPosition.y, z: newPosition.z, onComplete: () => {
            document.getElementById("coming-soon").style.display = "block";
            document.getElementById("coming-img").style.opacity = 1;
        }});
    }

    animate(t) {
        this.update(this.clock.getDelta(), this.clock.getElapsedTime());
        this.render();
    }

    update(dt,et) {
        this.sky.update(dt);
        this.square.update();
        if (this.keyboardController) {
            this.keyboardController.update(dt);
            this.zoomController.update(dt);
        }
        this.timeController.update(dt);
        this.characterController.update(dt,et);
        if (this.vrControls) {
               this.vrControls.update();
        }

        //this.flood.update(dt);
        this.collisionManager.update(dt);
        //console.log(this.camera.rotation); */
        this.intro.update();
    }

    render() {
        // this.composer.render(); // For post processing
        //this.renderer.render(this.scene, this.camera);
        this.vrManager.render(this.scene, this.camera);
    }

    resize() {
        let width = this.container.offsetWidth;
        let height = this.container.offsetHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.vrEffect.setSize(width, height);
        //this.composer.setSize(width, height);
    }
}
