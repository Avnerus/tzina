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

// Animations
import HannahAnimation from './animations/hannah'
import LupoAnimation from './animations/lupo'
import HaimAnimation from './animations/haim'
import ItzikAnimation from './animations/itzik'
import MeirAnimation from './animations/meir'
import MarkAnimation from './animations/mark'
import ShirinAnimation from './animations/shirin'

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
        //this.renderer.setClearColor( 0x000000, 1 );

        this.scene = new THREE.Scene();
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
        this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
        this.hemiLight.color.setHSL(1,1,1);
        //this.hemiLight.groundColor.setHSL( 0., 1, 0.75 );
        this.hemiLight.position.set( 0, 500, 0 );
        this.scene.add( this.hemiLight );

        this.dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
        this.dirLight.position.set( 1, 1, 1  );
        this.dirLight.color.setHSL(1,1,1);
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

        this.shirin = new Character({
            //basePath : 'http://d39fgma5mmu2v7.cloudfront.net/assets/characters/hanna',
            basePath : 'assets/characters/shirin',
            mindepth : 1983.749877930,
            maxdepth : 3119.456298828,
            position : [-30, 8, 150],
            rotation: [0, 0, 0],
            name: 'Shirin',
            animation: 'Shirin',
            uvd: 0.50634765625,
            scale: 0.005,
            animationPosition: [0, 0, 1],
            animationRotation: [0, 0, 0],
            space: 20,
            subtitles: "subtitles"
        }, this.collisionManager);

        // Test characters
        /*
        this.testCharacter = new Character({
            basePath : 'assets/characters/lupocomp',
            mindepth : 2331.267333984,
            maxdepth : 3446.559326172,
            position : [30, 6, 42],
            rotation: [0, 170, 0],
            name: 'Hannah',
            animation: 'Hannah'
            });*/

        /*
        this.mark = new Character({
            //basePath : 'http://d39fgma5mmu2v7.cloudfront.net/assets/characters/hanna',
            basePath : 'assets/characters/mark',
            mindepth : 1482.958618164,
            maxdepth : 2514.773681641,
            position : [-30, 8, 150],
            rotation: [0, 0, 0],
            name: 'Mark',
            animation: 'Mark',
            uvd: 0.440277,
            scale: 0.005,
            animationPosition: [0, 0, 1],
            animationRotation: [0, 0, 0],
            space: 7,
            subtitles: "subtitles"
        }, this.collisionManager);
    
        this.meir = new Character({
            //basePath : 'http://d39fgma5mmu2v7.cloudfront.net/assets/characters/hanna',
            basePath : 'assets/characters/meir',
            mindepth : 1482.958618164,
            maxdepth : 2514.773681641,
            position : [-30, 8, 150],
            rotation: [0, 0, 0],
            name: 'Meir',
            animation: 'Meir',
            uvd: 0.440277,
            scale: 0.005,
            animationPosition: [0, 0, 0],
            animationRotation: [0, 0, 0],
            space: 7,
            subtitles: "subtitles"
        }, this.collisionManager);

        this.itzik = new Character({
            //basePath : 'http://d39fgma5mmu2v7.cloudfront.net/assets/characters/hanna',
            basePath : 'assets/characters/itzik',
            mindepth : 2138.454101562,
            maxdepth : 3047.334472656,
            position : [-32, 8.1, 152.5],
            rotation: [0, 0, 0],
            name: 'Itzik',
            animation: 'Itzik',
            uvd: 0.440277,
            scale: 0.005,
            animationPosition: [0, 0, 0],
            animationRotation: [0, 0, 0],
            space: 7,
            subtitles: "subtitles"
        }, this.collisionManager);

        
        this.haim = new Character({
            //basePath : 'http://d39fgma5mmu2v7.cloudfront.net/assets/characters/hanna',
            basePath : 'assets/characters/haim',
            mindepth : 2138.454101562,
            maxdepth : 3047.334472656,
            position : [-32, 8.1, 152.5],
            rotation: [0,0,0],
            name: 'Haim',
            animation: 'Haim',
            uvd: 0.440277,
            scale: 0.005,
            animationPosition: [0.2,-1,-0.5],
            animationRotation: [0, 0, 0],
            space: 7,
            subtitles: "subtitles"
        }, this.collisionManager);

        this.hannah = new Character({
            //basePath : 'http://d39fgma5mmu2v7.cloudfront.net/assets/characters/hanna',
            basePath : 'assets/characters/hanna',
            mindepth : 2138.454101562,
            maxdepth : 3047.334472656,
            position : [-32, 8.1, 152.5],
            rotation: [-19, 45, 15],
            name: 'Hannah',
            animation: 'Hannah',
            uvd: 0.440277,
            scale: 0.005,
            animationPosition: [0,-1.5,-2.2],
            animationRotation: [20, 0, 0],
            space: 7,
            subtitles: "subtitles"
        }, this.collisionManager);

        
        this.lupo = new Character({
            //basePath : 'http://d39fgma5mmu2v7.cloudfront.net/assets/characters/lupo',
            basePath : 'assets/characters/lupo',
            mindepth : 1500.681884766,
            maxdepth : 3376.051757813,
            position : [-51, 7.9, 126],//[51, 7.9, 77], // [-41, 7.9, 121], 
            rotation: [-8,20,6],//[6, 195, 6], // [6,215,6],
            name: 'Lupo',
            uvd: 0.45,
            scale: 0.006,
            animation: 'Lupo',
            animationPosition: [0, -1.8, -4],
            animationRotation: [5, 0, -3],
            space: 9 ,
            subtitles: "subtitles2"
        }, this.collisionManager);*/

        this.sky = new Sky(this.loadingManager, this.dirLight, this.hemiLight);


        // animations
        this.animations = {
            // 'Hannah': new HannahAnimation()
           //  'Lupo': new LupoAnimation()
            // 'Haim': new HaimAnimation( this.scene, this.renderer )
            // 'Itzik': new ItzikAnimation()
            // 'Meir': new MeirAnimation()
            // 'Mark': new MarkAnimation()
            'Shirin': new ShirinAnimation()
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

        // Intro
        this.intro = new Intro(this.camera, this.square, this.sky, this.soundManager, this.scene);

        this.zoomController = new ZoomController(this.config, this.emitter, this.camera, this.square);
        this.zoomController.init();

    }

    load(onLoad) {
        this.loadingManager.onLoad = () => {

            console.log("Done loading everything!");

            // this.scene.add(this.square);
            this.sky.applyToMesh(this.square.getSphereMesh());
            //this.scene.add(this.lupo)
            // this.scene.add(this.hannah)
            // this.scene.add(this.haim)
            // this.scene.add(this.itzik)
            // this.scene.add(this.meir);
            // this.scene.add(this.mark);
            this.scene.add(this.shirin);


            // DEBUG
            var geometry = new THREE.BoxGeometry( 5, 5, 5 );
            var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
            let cube = new THREE.Mesh( geometry, material );
            this.square.mesh.updateMatrixWorld(true);
            cube.position.fromArray(this.square.ENTRY_POINTS[0].position).applyMatrix4(this.square.mesh.matrixWorld);
            this.scene.add( cube );
            // events.emit("add_gui",{}, cube.position, "x"); 
            // events.emit("add_gui",{}, cube.position, "y"); 
            // events.emit("add_gui",{}, cube.position, "z"); 


            /*

            this.lupo.rotationY = 20;
            this.lupo.rotationX = -14;
            this.lupo.rotationZ = 6; 
            events.emit("add_gui", this.lupo.position, "x"); 
            events.emit("add_gui", this.lupo.position, "z");
            events.emit("add_gui", this.lupo.position, "y");
            events.emit("add_gui", this.lupo, "rotationY"); 
            events.emit("add_gui", this.lupo, "rotationZ"); 
            events.emit("add_gui", this.lupo, "rotationX"); */

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
        // this.hannah.init(this.loadingManager, this.animations)
        //this.lupo.init(this.loadingManager, this.animations)
        // this.haim.init(this.loadingManager, this.animations)
        //this.itzik.init(this.loadingManager, this.animations)
        // this.meir.init(this.loadingManager, this.animations)
        // this.mark.init(this.loadingManager, this.animations);
        this.shirin.init(this.loadingManager, this.animations);
        this.square.init(this.collisionManager, this.loadingManager);

        // Animations init
        Object.keys(this.animations).forEach((key) => {
            this.animations[key].init(this.loadingManager);
        });

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
        this.container = document.getElementById('game');
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
            this.keyboardController.setPosition(-35, 10, 177);
            this.sky.transitionTo(17,1);
            // this.hannah.play(); 
            // this.haim.play(); 
            //this.itzik.play(); 
            // this.meir.play(); 
            // this.mark.play(); 
            this.shirin.play();
        } else {
            // Init the intro

            this.sky.transitionTo(17,1);
            this.intro.init();
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
        if (this.vrControls) {
               this.vrControls.update();
            }
        // this.hannah.update(dt,et);
        // this.lupo.update(dt,et);
        // this.haim.update(dt,et);
        //this.itzik.update(dt,et);
        // this.meir.update(dt,et);
        // this.mark.update(dt,et);
        this.shirin.update(dt,et);

        /*
        this.lupo.rotation.y = this.lupo.rotationY * Math.PI / 180;
        this.lupo.rotation.x = this.lupo.rotationX * Math.PI / 180;
        this.lupo.rotation.z = this.lupo.rotationZ * Math.PI / 180;*/

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
