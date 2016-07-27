export default class Fountain extends THREE.Object3D  {
    constructor() {
        super();
        this.BASE_PATH = '/assets/fountain/'
        console.log("Fountain constructed!")

    }
    init(loadingManager) {
        this.particleGroup = new SPE.Group({
            texture: {
                //value: new THREE.TextureLoader(loadingManager).load(this.BASE_PATH + 'water_splash.png')
                value: new THREE.TextureLoader(loadingManager).load(this.BASE_PATH + 'smokeparticle.png')
            },
            maxParticleCount: 2400
        });


        // Create fountains
        let angle = 30;
        let radius = 9.5;
        let position = new THREE.Vector3(0,0,0);
        let rotation = 0;

        for (let i = 0; i <= 360; i+= angle ) {
            rotation = i * Math.PI / 180;
            position.x = Math.cos(rotation) * radius;
            position.z = Math.sin(rotation) * radius;
            this.createTrickle(position, rotation);
        }
        //this.particleGroup.mesh.frustumCulled = false;
        this.add(this.particleGroup.mesh);
    }

    update(dt) {
       this.particleGroup.tick(dt); 
    }

    createTrickle(position, rotation) {
        // Get the velocity after rotation
        let emitter = new SPE.Emitter({
            maxAge: 5,
            type: SPE.distributions.BOX,
            position : {
                value: position
            },
            rotation: {
                axis: new THREE.Vector3(0, 1, 0),
                angle: rotation,
                static: true
            },
            acceleration: {
                value: new THREE.Vector3(0,-12,0)
            },
            velocity: {
                value: new THREE.Vector3(2,30,0)
            },
            color: {
                value: new THREE.Color(0x87D9F5)
            },
            size: {
                value: [0,2.0,0]
            },
            particleCount: 200,
            opacity: {
                value: [0.5, 1.0, 0.5]
            },
            transparent: true
        });

        this.particleGroup.addEmitter(emitter);
    }

}
