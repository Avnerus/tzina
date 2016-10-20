import DebugUtil from "./util/debug"

export default class Fountain extends THREE.Object3D  {
    constructor( square, soundManager ) {
        super();
        this.BASE_PATH = 'assets/fountain/'
        console.log("Fountain constructed!")

        this.downVelocity = new THREE.Vector3(1.5,6,0);
        this.upVelocity = new THREE.Vector3(1.5,8,0);
        this.centerVelocity = new THREE.Vector3(0,9,0);

        this.outerUp = true;

        // EVENT
        this.square = square;
        this.soundManager = soundManager;
        this.soundEvents = [
            { time: 6, action: () => {
                            this.firstAni();
                        } },
            { time: 14.5, action: () => {
                            this.secAni();
                        } },
            { time: 27, action: () => {
                            this.thirdAni();
                        } },
            { time: 37, action: () => {
                            this.fourthAni();
                        } }
            // { time: 54, action: () => {
            //                 this.fifthAni();
            //             } },
            // { time: 62, action: () => {
            //                 this.sixthAni();
            //             } },
            // { time: 78, action: () => {
            //                 this.seventhAni();
            //             } },
            // { time: 97, action: () => {
            //                 this.eighthAni();
            //             } },
            // { time: 107, action: () => {
            //                 this.ninethAni();
            //             } },
            // { time: 117, action: () => {
            //                 this.tenthAni();
            //             } }
        ]
        
        this.event12pm_file = 'assets/sound/event12pm.wav';

    }
    init(loadingManager) {
        this.particleGroup = new SPE.Group({
            texture: {
                value: new THREE.TextureLoader(loadingManager).load(this.BASE_PATH + 'water_splash.png')
                //value: new THREE.TextureLoader(loadingManager).load(this.BASE_PATH + 'smokeparticle.png')
            },
            maxParticleCount: 20000
        });


        // Create fountains
        let angle = 30;
        let radius = 2.0;
        let position = new THREE.Vector3(0,0.5,0);
        let rotation = 0;

        // Center Water
        this.createTrickleCenter(position, this.centerVelocity, 0x00ffff);
        this.add(this.particleGroup.mesh);

        // First circle
        position.y = 0;
        for (let i = 0; i <= 360; i+= angle ) {
            rotation = i * Math.PI / 180;
            position.x = Math.cos(rotation) * radius;
            position.z = Math.sin(rotation) * radius;
            this.createTrickle(position, rotation, this.downVelocity, 0xB7C5C9);
        }

        // Second
        position.y = -0.5;
        radius = 3.5;

        for (let i = 0; i <= 360; i+= angle ) {
            rotation = i * Math.PI / 180;
            position.x = Math.cos(rotation) * radius;
            position.z = Math.sin(rotation) * radius;
            let backFace = (i + 180) * Math.PI / 180;
            this.createTrickle(position, backFace, this.upVelocity, 0xff0000);
        }

        // EmittersGroup
        this.centerRingEmitters = [];
        this.firstRingEmitters = [];
        this.secondRingEmitters = [];
        for(let i=0; i<this.particleGroup.emitters.length; i++){
            if(i==0) {
                this.centerRingEmitters.push( this.particleGroup.emitters[i] );
            } else if (i<(this.particleGroup.emitters.length-1)/2) {
                this.firstRingEmitters.push( this.particleGroup.emitters[i] );
            } else {
                this.secondRingEmitters.push( this.particleGroup.emitters[i] );
            }
        }

        // Sound
        this.soundManager.loadSound(this.event12pm_file)
        .then((sound) => {
            console.log("Sound ", sound);
            this.sound_12pm = sound;

            setTimeout(() => {
                // this.playSound();
                // console.log("play sound!");
                this.startEvent();
            },10000);
        });

        // water: velocity

        // fire: another group

        // central: another loop

        // cylinder: pass in through constructor; add function in square.js to get cylinders; getObjectByName
        this.fountainMeshes = this.square.getFountainMeshes();
        // DebugUtil.positionObject(this.fountainMeshes[0], "Fountain 0");
        // DebugUtil.positionObject(this.fountainMeshes[1], "Fountain 1");
        // DebugUtil.positionObject(this.fountainMeshes[2], "Fountain 2"); // doesn't move
    }

    playSound() {
        this.sound_12pm.playIn(1);
        this.currentEvent = this.soundEvents.shift();
    }

    update(dt) {
       this.particleGroup.tick(dt * 0.4);
       //
       if (this.sound_12pm && this.sound_12pm.isPlaying && this.currentEvent) {
            if (this.sound_12pm.getCurrentTime() >= this.currentEvent.time) {
                 console.log("do anim sequence ", this.currentEvent);
                this.currentEvent.action();
                if (this.soundEvents.length > 0) {
                    this.currentEvent = this.soundEvents.shift();
                } else {
                    this.currentEvent = null;
                }
            }
        }
    }

    startCycle() {
        setInterval(() => {
            //console.log("Fountain cycle!", this.particleGroup.emitters.length + " Emitters");
            this.outerUp = !this.outerUp;
            for (let i = 1; i < this.particleGroup.emitters.length; i++) {
                if (i < (this.particleGroup.emitters.length-1) / 2) {
                    this.particleGroup.emitters[i].velocity.value = this.outerUp ? this.downVelocity : this.upVelocity;
                } else {
                    this.particleGroup.emitters[i].velocity.value = this.outerUp ? this.upVelocity : this.downVelocity;
                }
            }

        },8000);
    }

    startEvent() {
        // SOUND
        this.playSound();
        console.log("play sound!");

        // Water

        // Fire

        // Central water
        
    }

    updateEmittersValue( emitters, arrayOfIndex, arrayOfValue, time, _yoyo, _repeatTime, _delay, _repeatDelay ){

            let dummyVectors = [];
            
            for(let j=0; j<arrayOfIndex.length; j++){
                dummyVectors.push( this.selectToChangeValue(emitters[0], arrayOfIndex[j]) );
            }

            TweenMax.to( dummyVectors[0], time, { x: arrayOfValue[0].x,
                                                  y: arrayOfValue[0].y,
                                                  z: arrayOfValue[0].z,
                                                  yoyo: _yoyo, repeat: _repeatTime,
                                                  delay: _delay, repeatDelay: _repeatDelay,
                    onStart:()=>{
                        if(dummyVectors.length>1){
                            for(let k=1; k<dummyVectors.length; k++){
                                 TweenMax.to( dummyVectors[k], time, { x: arrayOfValue[k].x,
                                                                       y: arrayOfValue[k].y,
                                                                       z: arrayOfValue[k].z,
                                                                       yoyo: _yoyo, repeat: _repeatTime,
                                                                       delay: _delay, repeatDelay: _repeatDelay });
                            }
                        }
                    },
                    onUpdate: ()=>{
                        for(let i=0; i<emitters.length; i++){
                            for(let k=0; k<dummyVectors.length; k++){
                                this.setEmitterValue( emitters[i], arrayOfIndex[k], dummyVectors[k] );
                            }
                        }
                    }
                }
            );  
        //}
    }

    setEmitterValue( emitter, valueIndex, value ){
        switch ( valueIndex ) {
            case 0:
                emitter.velocity.value = value;
                break;

            case 1:
                emitter.velocity.spread = value;
                break;

            case 2:
                emitter.acceleration.value = value;
                break;

            case 3:
                emitter.acceleration.spread = value;
                break;
        }
    }

    selectToChangeValue( emitter, valueIndex ){
        switch ( valueIndex ) {
            case 0:
                return emitter.velocity.value.clone();
                break;

            case 1:
                return emitter.velocity.spread.clone();
                break;

            case 2:
                return emitter.acceleration.value.clone();
                break;

            case 3:
                return emitter.acceleration.spread.clone();
                break;
        }
    }

    firstAni() {
        // emitters, arrayOfIndex, _arrayOfValue,
        // time, yoyo, repeatTime, delay, repeatDelay
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0,1,2 ],
                                 [ {x:0, y:16, z:0}, {x:8, y:0.5, z:8}, {x:0, y: -30, z:0} ],
                                 4, true, 1, 0, 0);
    }

    secAni() {
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0,1,2 ],
                                 [ {x:0, y:14, z:0}, {x:3, y:0.5, z:3}, {x:0, y: -25, z:0} ],
                                 0, false, 3, 0, 5);

        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0 ],
                                 [ {x:0, y:8, z:0} ],
                                 4, false, 2, 1, 1);
    }

    thirdAni() {
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0, 1 ],
                                 [ {x:0, y:14, z:0}, {x:5, y:0.5, z:5} ],
                                 1, true, 5, 0, 2);
    }

    fourthAni() {
        //
    }

    createTrickle(position, rotation, velocity, colorCode) {
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
                value: new THREE.Color(colorCode)
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

    createTrickleCenter(position, velocity, colorCode) {
        // Get the velocity after rotation
        let emitter = new SPE.Emitter({
            maxAge: 5,
            type: SPE.distributions.BOX,
            position : {
                value: position,
                spread: new THREE.Vector3( .3, 0, .3 )
            },
            acceleration: {
                value: new THREE.Vector3(0,-14,0),
                spread: new THREE.Vector3( 1, 0, 1 )
            },
            velocity: {
                value: velocity,
                spread: new THREE.Vector3( 0, 0.5, 0 )
            },
            color: {
                value: new THREE.Color(0xB7C5C9)
            },
            size: {
                value: [0.3, 0.4, 0.2, 0.0]
            },
            particleCount: 1000,
            opacity: {
                value: [0.5, 0.8, 0.4, 0.2]
            },
            transparent: true
        });
        this.particleGroup.addEmitter(emitter);
    }

    transX(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].x += n;
        }
    }

    transZ(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].z += n;
        }
    }

    transY(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].y += n;
        }
    }

}
