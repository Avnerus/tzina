import DebugUtil from './util/debug'

const MAX_FLOOD_HEIGHT = 13;

export default class Flood extends THREE.Object3D  {
    constructor() {
        super();
        console.log("Flood constructed!")

        this.waveSource = new THREE.Vector3(0, -30, 0);
        this.waveFrequencey = 0.07;
        this.waveHeight = 0.5;
        this.waveLength = 0.3;

        this.END_SCALE = 0.447;
        this.START_SCALE = 0.005;
        this.END_HEIGHT = 12.45;
        this.START_HEIGHT = 11.65;

    }
    init(scene) {
        //let geometry = new THREE.PlaneGeometry(1000, 1000, 24, 24);
        let geometry = new THREE.CircleGeometry( 100, 16  );
        let tessellateModifier = new THREE.TessellateModifier(.1);
        let tessellationDepth = 7;
        for(let i = 0; i < tessellationDepth; i++){
            tessellateModifier.modify(geometry);
        }
        console.log(geometry);
        let texture = new THREE.TextureLoader().load( "assets/flood/emotions.jpg" );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10,10);

        let material = new THREE.MeshLambertMaterial({
           // color: 0x99F9FF,
            opacity: 0.80,
            map:texture,
          //  shininess: 164,
            shading: THREE.FlatShading,
            transparent: true,
            side: THREE.DoubleSide,
            wireframe: false,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.renderOrder = 1;
        this.mesh.scale.set(this.START_SCALE, this.START_SCALE, this.START_SCALE);

        //
        // Fountain center
        this.mesh.position.set(-0.7, this.START_HEIGHT, 0);

        this.mesh.rotation.x = -Math.PI / 2;

        //DebugUtil.positionObject(this.mesh, "Flood", true);

        this.add(this.mesh);

        this.time = 0;

        //events.emit("add_gui", {folder:"Flood", listen:false}, this, "waveFrequencey");

        /*
        events.emit("add_gui", {folder:"Flood", listen:false}, this, "waveLength");
        events.emit("add_gui", {folder:"Flood", listen:false}, this, "waveHeight");
        events.emit("add_gui", {folder:"Flood", listen:false}, this.waveSource, "x");
        events.emit("add_gui", {folder:"Flood", listen:false}, this.waveSource, "y");
        events.emit("add_gui", {folder:"Flood", listen:false}, this.waveSource, "z");*/

        events.on("experience_progress", (percentage) => {
            //console.log("FLOOD progress", percentage);
            // First scale, then rise
            if (percentage <= 0.5) {
                let scale = (this.START_SCALE + (this.END_SCALE - this.START_SCALE) * (percentage / 0.5));
                this.mesh.scale.set(scale, scale, scale);
            } else {
                let height = (this.START_HEIGHT + (this.END_HEIGHT - this.START_HEIGHT) * ((percentage - 0.5) / 0.5));
                this.mesh.position.y = height;
            }
        });
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
