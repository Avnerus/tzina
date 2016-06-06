import Sky from './sky'

export default class Game {
    constructor() {
        console.log("Game constructed!")
    }
    init() {
        this.renderer = new THREE.WebGLRenderer(); 
        this.renderer.setClearColor( 0, 1 );
        //this.renderer.setClearColor( 0x000000, 1 );
        let element = this.renderer.domElement;
        let container = document.getElementById('game');
        container.appendChild(element);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight, 1, 2000000);
        //this.camera.position.z = 100;
        this.camera.position.set( 0, 100, 2000 );

        this.control = new THREE.OrbitControls( this.camera, element );
        this.scene.add(this.camera);
        this.clock = new THREE.Clock();

        //this.camera.rotation.x = 0.22;


        let helper = new THREE.GridHelper( 5000, 5000, 0xffffff, 0xffffff );
        this.scene.add( helper );

        // SKY
        this.sky = new Sky();
        this.sky.init();
        this.scene.add(this.sky.mesh);


        this.resize();
    }
    
    animate(t) {
      this.update(this.clock.getDelta());
      this.render(this.clock.getDelta());
    }

    update(dt) {
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
