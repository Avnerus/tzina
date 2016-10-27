import DebugUtil from './util/debug'

const MAX_FLOOD_HEIGHT = 13;

export default class Flood extends THREE.Object3D  {
    constructor() {
        super();
        console.log("Flood constructed!")

        this.waveSource = new THREE.Vector3(0, -30, 0);
        this.waveFrequencey = 0.35;
        this.waveHeight = 1.2;
        this.waveLength = 0.7;
    }
    init(scene) {
        //let geometry = new THREE.PlaneGeometry(1000, 1000, 24, 24);
        let geometry = new THREE.CircleGeometry( 100, 24  );
        let tessellateModifier = new THREE.TessellateModifier(.01);
        let tessellationDepth = 5;
        for(let i = 0; i < tessellationDepth; i++){
            tessellateModifier.modify(geometry);
        }

        console.log(geometry);
        let material = new THREE.MeshPhongMaterial({
            color: 0x99F9FF,
            opacity: 0.75,
            shininess: 20,
            shading: THREE.FlatShading,
            transparent: true,
            //side: THREE.DoubleSide,
            wireframe: false
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.frustumCulled = false;
        //
        // Fountain center
        this.mesh.position.set(0.42, 10, 0.42)

        this.mesh.rotation.x = -Math.PI / 2;

        DebugUtil.positionObject(this.mesh, "Flood");

        this.add(this.mesh);

        this.time = 0;


        events.emit("add_gui", {folder:"Flood", listen:false}, this, "waveLength");
        events.emit("add_gui", {folder:"Flood", listen:false}, this, "waveFrequencey");
        events.emit("add_gui", {folder:"Flood", listen:false}, this, "waveHeight");
        events.emit("add_gui", {folder:"Flood", listen:false}, this.waveSource, "x");
        events.emit("add_gui", {folder:"Flood", listen:false}, this.waveSource, "y");
        events.emit("add_gui", {folder:"Flood", listen:false}, this.waveSource, "z");
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
