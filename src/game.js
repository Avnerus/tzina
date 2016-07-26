import EventEmitter from 'events'

import Sky from './sky'
import Square from './square'
import CollisionManager from './collision_manager'
import Character from './character'
import KeyboardController from './keyboard_controller'
import PostShader from './post_shader'
import Flood from './flood'
import ZoomController from './zoom_controller'
import TzinaVRControls from './tzina_vr_controls'
import SoundManager from './sound_manager'

// Animations
import HannahAnimation from './animations/hannah'

export default class Game {
    constructor(config) {
        console.log("Game constructed!")
        this.config = config;
        this.started = false;
    }
    init() {

        class TzinaEmitter extends EventEmitter {}
        this.emitter = new TzinaEmitter();

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor( 0, 1 );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        //this.renderer.setClearColor( 0x000000, 1 );

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight, 1, 2000000);

        //this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 2000000  );
        this.sound_manager = new SoundManager(this.camera, this.scene);


        this.scene.add(this.camera);
        this.clock = new THREE.Clock();

        //this.camera.rotation.x = 0.22;


        let helper = new THREE.GridHelper( 5000, 5000, 0xffffff, 0xffffff );
        this.scene.add( helper );
        let axis = new THREE.AxisHelper(75);
        this.scene.add(axis);
        //

        // LIGHT
        this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.7 );
        this.hemiLight.color.setHSL(1,1,1);
        //this.hemiLight.groundColor.setHSL( 0., 1, 0.75 );
        this.hemiLight.position.set( 0, 500, 0 );
        this.scene.add( this.hemiLight );

        this.dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
        this.dirLight.position.set( 0, 120, -200  );
        this.dirLight.color.setHSL(1,1,1);
        //dirLight.target.position.set(0,100,0);
        //
        //
        /*
        this.dirLight.shadow.camera.far = 3500;
        this.dirLight.shadow.bias = -0.000001;*/
        this.scene.add(this.dirLight);

        this.loadingManager = new THREE.LoadingManager();
        this.collisionManager = new CollisionManager(this.camera);


        // Square
        this.square = new Square();

        // Test characters
        /*this.testCharacter = new Character({
            basePath : 'assets/characters/take_1',
            mindepth : 404.999969482,
            maxdepth : 1111.719970703,
            position : [30, 15, 40],
            rotation: [0, 0, 0],
            name: 'test'
            });*/
        this.testCharacter = new Character({
            basePath : 'assets/characters/lupocomp',
            mindepth : 2331.267333984,
            maxdepth : 3446.559326172,
            position : [30, 6, 42],
            rotation: [0, 170, 0],
            name: 'Lupo',
            animation: 'Hannah'
        });

        this.sky = new Sky(this.loadingManager);


        // animations
        this.animations = {
            'Hannah': new HannahAnimation()
        }


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

    }

    load(onLoad) {
        this.loadingManager.onLoad = () => {

            console.log("Done loading everything!");
            this.scene.add(this.square);
            this.sky.applyToMesh(this.square.getSphereMesh());
            this.scene.add(this.testCharacter)

            onLoad();
        };
        this.loadingManager.onError = (err) => {
            console.log("Error during load", err);
        };

        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {

            console.log("Loaded ", url, "(" + itemsLoaded + "/" +  itemsTotal + ")");
        }

        this.sky.init();
        this.sound_manager.init();
        this.testCharacter.init(this.loadingManager, this.animations)
        this.square.init(this.collisionManager, this.loadingManager);

        // Animations init
        Object.keys(this.animations).forEach((key) => {
            this.animations[key].init(this.loadingManager);
        });

        // WebVR
        let vrEffect = new THREE.VREffect(this.renderer);
        vrEffect.setSize(window.innerWidth, window.innerHeight);

        let params = {
          hideButton: false, // Default: false.
          isUndistorted: false // Default: false.
        };
        this.vrManager = new WebVRManager(this.renderer, vrEffect, params);

    }

    start() {
        this.started = true;
        let element = this.renderer.domElement;
        this.container = document.getElementById('game');
        this.container.appendChild(element);
        this.sound_manager.play();
        console.log("VR Compatible?", this.vrManager.isVRCompatible);
        if (this.config.controls == "locked") {
                this.vrControls = new TzinaVRControls(this.emitter, this.camera);
                this.vrControls.standing = true;
                this.keyboardController = new KeyboardController(this.config, this.emitter,  this.camera, this.square, this.collisionManager)
                this.keyboardController.init();
                this.zoomController = new ZoomController(this.config, this.emitter, this.camera, this.square);
                this.zoomController.init();
                this.keyboardController.setPosition(40, 10, 65);

                /*
                let controls = new THREE.PointerLockControls( this.camera );
                controls.enabled = true;
                this.scene.add(controls.getObject());*/
        } else {
            this.controls = new THREE.OrbitControls( this.camera, element );
        }

        this.collisionManager.setPlayer(this.camera);
        this.resize();

        setTimeout(() => {
            //    this.testCharacter.play();
        },5000)
    }

    animate(t) {
        this.update(this.clock.getDelta(), this.clock.getElapsedTime());
        this.render();
    }

    update(dt,et) {
        this.sky.update(dt);
        this.dirLight.position.copy(this.sky.getSunPosition());
        if (this.keyboardController) {
            this.keyboardController.update(dt);
            this.zoomController.update(dt);
        }
        if (this.vrControls) {
               this.vrControls.update();
            }
        this.testCharacter.update(dt,et);
        //this.flood.update(dt);
        /*
        this.collisionManager.update(dt);
        //console.log(this.camera.rotation); */
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
        //this.composer.setSize(width, height);
    }
}
