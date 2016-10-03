export default class Fountain extends THREE.Object3D  {
    constructor() {
        super();
        this.BASE_PATH = 'assets/fountain/'
        console.log("Fountain constructed!")

        this.downVelocity = new THREE.Vector3(1.5,6,0);
        this.upVelocity = new THREE.Vector3(1.5,8,0);

        this.outerUp = true;

    }
    init(loadingManager) {
        this.particleGroup = new SPE.Group({
            texture: {
                value: new THREE.TextureLoader(loadingManager).load(this.BASE_PATH + 'water_splash.png')
                //value: new THREE.TextureLoader(loadingManager).load(this.BASE_PATH + 'smokeparticle.png')
            },
            maxParticleCount: 6000
        });


        // Create fountains
        
        // First circle
        let angle = 30;
        let radius = 2.0;
        let position = new THREE.Vector3(0,0,0);
        let rotation = 0;

        for (let i = 0; i <= 360; i+= angle ) {
            rotation = i * Math.PI / 180;
            position.x = Math.cos(rotation) * radius;
            position.z = Math.sin(rotation) * radius;
            this.createTrickle(position, rotation, this.downVelocity);
        }
        this.add(this.particleGroup.mesh);

        // Second
        position.y = -0.5;
        radius = 3.5;

        for (let i = 0; i <= 360; i+= angle ) {
            rotation = i * Math.PI / 180;
            position.x = Math.cos(rotation) * radius;
            position.z = Math.sin(rotation) * radius;
            let backFace = (i + 180) * Math.PI / 180;
            this.createTrickle(position, backFace, this.upVelocity);
        }
    }

    update(dt) {
       this.particleGroup.tick(dt * 0.4); 
    }

    startCycle() {
        setInterval(() => {
            //console.log("Fountain cycle!", this.particleGroup.emitters.length + " Emitters");
            this.outerUp = !this.outerUp;
            for (let i = 0; i < this.particleGroup.emitters.length; i++) {
                if (i < this.particleGroup.emitters.length / 2) {
                    this.particleGroup.emitters[i].velocity.value = this.outerUp ? this.downVelocity : this.upVelocity;
                } else {
                    this.particleGroup.emitters[i].velocity.value = this.outerUp ? this.upVelocity : this.downVelocity;
                }
            }

        },10000);
    }

    createTrickle(position, rotation, velocity) {
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
                value: velocity
            },
            color: {
                value: new THREE.Color(0xB7C5C9)
            },
            size: {
                value: [0.2, 0.4, 0.0]
            },
            particleCount: 200,
            opacity: {
                value: [0.3, 0.8, 0.5]
            },
            transparent: true,
            wiggle: {
                value: 3,
                spread: 2
            }
        });

        this.particleGroup.addEmitter(emitter);
    }

}
