const MAX_FLOOD_HEIGHT = 13;
export default class Flood extends THREE.Object3D  {
    constructor() {
        super();
        console.log("Flood constructed!")
    }
    init(scene) {
        this.geometry = new THREE.PlaneBufferGeometry(100000, 100000);
        let material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xfbdfd3),
            opacity: 0.75,
            transparent: true,
            side: THREE.DoubleSide
        });
        this.mesh = new THREE.Mesh(this.geometry, material);
        this.mesh.position.y = 0;
        this.mesh.rotation.x = -Math.PI / 2;
        this.add(this.mesh);
    }

    update(dt) {
        if (this.mesh.position.y < MAX_FLOOD_HEIGHT) {
            this.mesh.position.y += 0.01;
        }
    }

}
