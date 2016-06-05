
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
        this.camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 100;

        this.control = new THREE.OrbitControls( this.camera, element );
        this.scene.add(this.camera);
        this.clock = new THREE.Clock();

        //this.camera.rotation.x = 0.22;


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
