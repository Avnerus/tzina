import Sky from './sky'
import Square from './square'
import CollisionManager from './collision_manager'

import KeyboardController from './keyboard_controller'

export default class Game {
    constructor(config) {
        console.log("Game constructed!")
        this.config = config;
    }
    init() {
        this.renderer = new THREE.WebGLRenderer(); 
        this.renderer.setClearColor( 0, 1 );
        //this.renderer.setClearColor( 0x000000, 1 );

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight, 1, 2000000);
        //this.camera.position.set( 0, 1950, -1200);


        this.scene.add(this.camera);
        this.clock = new THREE.Clock();

        //this.camera.rotation.x = 0.22;


        let helper = new THREE.GridHelper( 5000, 5000, 0xffffff, 0xffffff );
        this.scene.add( helper );

        this.loadingManager = new THREE.LoadingManager();
        this.collisionManager = new CollisionManager(this.camera);

        // SKY
        this.sky = new Sky();
        this.sky.init();
        this.scene.add(this.sky.mesh);

        // Square
        this.square = new Square();


        this.resize();
    }

    load(onLoad) {
        let objectReady = (obj) => {

        }
        this.loadingManager.onLoad = () => {
            console.log("Done loading everything!");

            onLoad();
        };
        this.loadingManager.onError = (err) => {
            console.log("Error during load", err);
        };

        this.square.init(this.scene, this.collisionManager, this.loadingManager);
    }

    start() {
        let element = this.renderer.domElement;
        let container = document.getElementById('game');
        container.appendChild(element);
        if (this.config.controls == "locked") {
            let controls = new THREE.PointerLockControls( this.camera );
            this.scene.add( controls.getObject() );
            controls.enabled = true;

            this.keyboardController = new KeyboardController()
            this.keyboardController.init(controls);

            this.collisionManager.setPlayer(controls.getObject());
        } else {
            this.controls = new THREE.OrbitControls( this.camera, element );
        }
       
    }
    
    animate(t) {
      this.update(this.clock.getDelta());
      this.render(this.clock.getDelta());
    }

    update(dt) {
        this.collisionManager.update(dt);
        this.sky.update(dt);
        if (this.keyboardController) {
            this.keyboardController.update(dt);
        }
        //console.log(this.camera.rotation);
    }

    render(dt) {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
