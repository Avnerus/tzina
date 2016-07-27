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
            maxParticleCount: 1000
        });
        this.createTrickle();
        //this.particleGroup.mesh.frustumCulled = false;
        this.add(this.particleGroup.mesh);
    }

    update(dt) {
       this.particleGroup.tick(dt); 
    }

    createTrickle() {
        let emitter = new SPE.Emitter({
            maxAge: 5,
            type: SPE.distributions.BOX,
            position : {
                value: new THREE.Vector3(0,4,0)
            },
            acceleration: {
                value: new THREE.Vector3(0,-12,0)
            },
            velocity: {
                value: new THREE.Vector3(7,20,0)
            },
            color: {
                value: new THREE.Color(0x87D9F5)
            },
            size: {
                value: [0,2.0,0]
            },
            particleCount: 200,
            opacity: [0, 0.5, 0],
            transparent: true
        });

        this.particleGroup.addEmitter(emitter);
    }

}
