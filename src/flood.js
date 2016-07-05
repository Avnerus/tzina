const MAX_FLOOD_HEIGHT = 13;
export default class Flood extends THREE.Object3D  {
    constructor() {
        super();
        console.log("Flood constructed!")

        this.waveSource = new THREE.Vector3(0, 10, 0);
        this.waveFrequencey = 0.5;
        this.waveHeight = 1.2;
        this.waveLength = 0.7;
    }
    init(scene) {
        let geometry = new THREE.PlaneGeometry(1000, 1000, 24, 24);
        console.log(geometry);
        let material = new THREE.MeshPhongMaterial({
            color: 0x99F9FF,
            opacity: 0.75,
            shininess: 20,
            shading: THREE.FlatShading,
            transparent: true,
            side: THREE.DoubleSide,
            wireframe: false
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 10;
        this.mesh.rotation.x = -Math.PI / 2;
        this.add(this.mesh);

        this.time = 0;
    }

    update(dt) {
        this.time += dt;
        for (let i = 0; i < this.mesh.geometry.vertices.length; i++) {
            let dist = this.mesh.geometry.vertices[i].distanceTo(this.waveSource);
            dist = (dist % this.waveLength) / this.waveLength;
            this.mesh.geometry.vertices[i].z = 
                this.waveHeight * Math.sin(this.time * Math.PI * 2.0 * this.waveFrequencey + 
                (Math.PI * 2.0 * dist));
            //console.log(this.mesh.geometry.vertices[i].z);
        }
        /*this.mesh.geometry.computeFaceNormals();
        this.mesh.geometry.computeVertexNormals; */
        this.mesh.geometry.verticesNeedUpdate = true;

       /* 
        if (this.mesh.position.y < MAX_FLOOD_HEIGHT) {
            this.mesh.position.y += 0.01;
        }*/
    }

}
