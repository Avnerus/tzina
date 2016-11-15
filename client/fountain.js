import DebugUtil from "./util/debug"

export default class Fountain extends THREE.Object3D  {
    constructor( square ) {
        super();
        this.BASE_PATH = 'assets/fountain/'
        console.log("Fountain constructed!")

        this.debug = false;

        this.downVelocity = new THREE.Vector3(1,7.8,0);
        this.upVelocity = new THREE.Vector3(1.5,11,0);
        this.centerVelocity = new THREE.Vector3(0, 15, 0);

        this.outerUp = true;

        this.centerRingOriParameter = [
            new THREE.Vector3(0,9,0), new THREE.Vector3(0,0.5,0), new THREE.Vector3(0,-14,0), new THREE.Vector3(1,0,1)
        ];
        this.firstRingOriParameter = [
            new THREE.Vector3(1.5,6,0), new THREE.Vector3(), new THREE.Vector3(0,-12,0), new THREE.Vector3()
        ];
        this.secondRingOriParameter = [
            new THREE.Vector3(1.5,8,0), new THREE.Vector3(), new THREE.Vector3(0,-12,0), new THREE.Vector3()
        ];
        this.fireOriParameter = [
            new THREE.Vector3(0,5,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0.3,0,0.2), new THREE.Vector3()
        ];

        // EVENT
        this.square = square;
        this.showTime = false;

        this.trickleSize = [0.15, 0.3, 0.0];

        this.soundEvents = {
            9: [
                { time: 1, action: () => {
                                this.zeroAni();
                            } }, 
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
                            } },
                { time: 54, action: () => {
                                this.fifthAni();
                            } },
                { time: 62, action: () => {
                                this.sixthAni();
                            } },
                { time: 78, action: () => {
                                this.seventhAni();
                            } },
                { time: 97, action: () => {
                                this.eighthAni();
                            } },
                { time: 107, action: () => {
                                this.ninethAni();
                            } },
                { time: 117, action: () => {
                                this.tenthAni();
                            } }
            ],
            19: [
                { time: 1, action: () => {
                                this.zeroAni();
                            } }, 
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
                            } },
                { time: 54, action: () => {
                                this.fifthAni();
                            } },
                { time: 62, action: () => {
                                this.sixthAni();
                            } },
                { time: 78, action: () => {
                                this.seventhAni();
                            } },
                { time: 97, action: () => {
                                this.eighthAni();
                            } },
                { time: 107, action: () => {
                                this.tenthAni();
                            } }
            ]
        };
        // this.soundEventsRecords = this.soundEvents.slice();
        
    }

    init(loadingManager) {
        this.particleGroup = new SPE.Group({
            texture: {
                value: new THREE.TextureLoader(loadingManager).load(this.BASE_PATH + 'water_splash.png')
            },
            maxParticleCount: 10000
        });

        this.fireParticleGroup = new SPE.Group({
            texture: {
                value: new THREE.TextureLoader(loadingManager).load(this.BASE_PATH + 'fire.jpg'),
                frames: new THREE.Vector2(4,1),
                loop: 4
            },
            maxParticleCount: 6000
        });

        let emitter;

        // Create fire
        let position = new THREE.Vector3(0,1,0);
        emitter = this.createFire(position, 0xffffff);
        emitter.disable();
        this.add(this.fireParticleGroup.mesh);

        // EmittersGroup
        this.fireEmitters = [emitter];

        // Create fountains
        let angle = 30;
        let radius = 3.5;
        let rotation = 0;

        // EmittersGroup
        this.centerRingEmitters = [];
        this.firstRingEmitters = [];
        this.secondRingEmitters = [];


        // Center Water
        emitter = this.createTrickleCenter(position, this.centerVelocity, 0x00ffff);
        emitter.disable();
        this.centerRingEmitters = [emitter];
        
        // First circle
        position.y = 0;

        for (let i = 0; i <= 360; i+= angle ) {
            rotation = i * Math.PI / 180;
            position.x = Math.cos(rotation) * radius;
            position.z = Math.sin(rotation) * radius;
            emitter = this.createTrickle(position, rotation, this.downVelocity, 0xB7C5C9);
            //emitter.disable();
            this.firstRingEmitters.push(emitter);
        }
        this.add(this.particleGroup.mesh);

        // Second
        position.y = -0.5;
        radius = 5.0;
        this.colorWhite = new THREE.Color(0xffffff);
        this.colorRed = new THREE.Color(0xff0000);
        for (let i = 0; i <= 360; i+= angle ) {
            rotation = i * Math.PI / 180;
            position.x = Math.cos(rotation) * radius;
            position.z = Math.sin(rotation) * radius;
            let backFace = (i + 180) * Math.PI / 180;
            emitter = this.createTrickle(position, backFace, this.upVelocity, 0xffffff);
            //emitter.disable();
            this.secondRingEmitters.push(emitter);
        }

        // Light
        

        let geo = new THREE.SphereGeometry( .3 );
        let mat = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        this.center = new THREE.Mesh(geo, mat);

        
        this.spotLights = [];
        this.spotLights[0] = this.createSpotLight( new THREE.Vector3(6.8, -3.2, 0.96),
                                                   new THREE.Vector3(0.3, 1, -0.3),
                                                   1,   // intensity
                                                   0.6, // angle
                                                   20,  // distance
                                                   1.5, // decay
                                                   0.3  // penumbra
                                                );
        this.spotLights[1] = this.createSpotLight( new THREE.Vector3(-7.8, -3.2, 1.2),
                                                   new THREE.Vector3(-0.3, 1, 0.3),
                                                   1,   // intensity
                                                   0.6, // angle
                                                   20,  // distance
                                                   1.5, // decay
                                                   0.3  // penumbra
                                                );
        this.spotLights[2] = this.createSpotLight( new THREE.Vector3(-0.78, -3.2, -7.9),
                                                   new THREE.Vector3(-0.3, 1, -0.3),
                                                   1,   // intensity
                                                   0.7, // angle
                                                   20,  // distance
                                                   1.5, // decay
                                                   0.3  // penumbra
                                                );
        this.spotLightCenters = new THREE.Object3D();
        this.spotLightCenters.add(this.spotLights[0].target);
        this.spotLightCenters.add(this.spotLights[1].target);
        this.spotLightCenters.add(this.spotLights[2].target);
        this.add( this.spotLightCenters );

        this.switchLight(false);
        this.lightsAreOn = false;

        // DebugUtil.positionObject(this.spotLightCenters, "target");
        // DebugUtil.positionObject(this.spotLights[0], "light 0");
        // DebugUtil.positionObject(this.spotLights[1], "light 1");
        // DebugUtil.positionObject(this.spotLights[2], "light 2");
        

        if (this.debug) {
            events.emit("add_gui", {folder: "Fountain water up``", listen: true, step: 0.01}, this.upVelocity, "x");
            events.emit("add_gui", {folder: "Fountain water up``", listen: true, step: 0.01}, this.upVelocity, "y");
            events.emit("add_gui", {folder: "Fountain water down``", listen: true, step: 0.01}, this.downVelocity, "x");
            events.emit("add_gui", {folder: "Fountain water down``", listen: true, step: 0.01}, this.downVelocity, "y");
        }

        events.on("control_threshold", (passed) => {
            if (passed) {
                for (let i = 0; i < this.particleGroup.emitters.length; i++) {
                    this.particleGroup.emitters[i].size.value = this.trickleSize;
                }  
            }
        });
    }

    assignCylinders(cylinders){
        this.cylinders = cylinders;
        // console.log(this.cylinders);
        /*
        DebugUtil.positionObject(this.cylinders[0], "Fountain 0");
        DebugUtil.positionObject(this.cylinders[1], "Fountain 1");
        DebugUtil.positionObject(this.cylinders[2], "Fountain 2"); // doesn't move*/
    }

    createSpotLight( pos, pos2, _intensity, _angle, _distance, _decay, _penumbra ) {
        let geometry = new THREE.ConeGeometry( .1, .2, 8 );
        let material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        let cone = new THREE.Mesh( geometry, material );
        cone.visible = false;
        let s_l = new THREE.SpotLight( 0xfff291, _intensity, _distance, _angle, _penumbra, _decay ); //0xfff291
        // s_l.target.add( this.center.clone() );
        s_l.target.position.copy( pos2 );
        s_l.position.copy( pos );
        s_l.add(cone);
        this.add(s_l);
        // this.add(s_l.target);
        return s_l;
    }

    // playSound() {
    //     this.sound_12pm.playIn(1);
    //     this.currentEvent = this.soundEvents.shift();
    // }

    update(dt) {
       this.particleGroup.tick(dt * 0.4); 
       if (this.showTime) {
            this.fireParticleGroup.tick(dt * 0.4);

            // if (this.sound_12pm && this.sound_12pm.isPlaying && this.currentEvent) {
            //      if (this.sound_12pm.getCurrentTime() >= this.currentEvent.time) {
            //           console.log("do anim sequence at ", this.currentEvent.time );
            //          this.currentEvent.action();
            //          if (this.soundEvents.length > 0) {
            //              this.currentEvent = this.soundEvents.shift();
            //          } else {
            //              this.currentEvent = null;
            //          }
            //      }
            //  }
       }
    }

    updateVideoTime(time) {
        if (this.nextAnim && time >= this.nextAnim.time) {
            console.log("Show Fountain - do anim sequence ", this.nextAnim);
            this.nextAnim.action();
            if (this.currentSequence.length > 0) {
                this.nextAnim = this.currentSequence.shift();
            } else {
                this.nextAnim = null;
                //
                console.log("count down 10 sec to reset ani");
                setTimeout(()=>{
                    this.resetAni();
                    this.startCycle();
                }, 10000);
                
            }
        }
    }

    startShow(hour) {
        console.log("Fountain starting show!");
        this.showTime = true;

        clearInterval(this.cycleIntervalID);

        this.fireEmitters[0].enable();
        this.centerRingEmitters[0].enable();
        this.changeWaterColor(true);
    
        if(hour!=9)
            this.switchLight(true);

        this.currentSequence = this.soundEvents[hour].slice(0);
        this.nextAnim = this.currentSequence.shift();
        events.emit("show_start");
    }

    resetShow() {
        // this.soundEvents = this.soundEventsRecords.slice();
        this.resetAni();
    }

    changeWaterColor(showTime) {
        for(let i=0; i<this.secondRingEmitters.length; i++){
            this.secondRingEmitters[i].color.value = showTime ? this.colorRed : this.colorWhite;
        }
    }

    switchLight(on) {
        if (this.spotLights) {
            for(let i=0; i<this.spotLights.length; i++){
                this.spotLights[i].intensity = on; 
            }
        }

    }

    resetAni() {
        console.log("SHOW END");
        for(let i=0; i<this.centerRingOriParameter.length; i++){
            this.setGroupEmittersValue( this.centerRingEmitters, i, this.centerRingOriParameter[i].clone() );
            this.setGroupEmittersValue( this.firstRingEmitters, i, this.firstRingOriParameter[i].clone() );
            this.setGroupEmittersValue( this.secondRingEmitters, i, this.secondRingOriParameter[i].clone() );
            this.setGroupEmittersValue( this.fireEmitters, i, this.fireOriParameter[i].clone() );
        }        
        if (this.spotLightCenters) {
            TweenMax.to( this.spotLightCenters.position, 3, { y: 0, onComplete:()=>{
                this.showTime = false;
            } } );
        }
        this.fireEmitters[0].disable();
        this.centerRingEmitters[0].disable();
        this.changeWaterColor(false);

        this.switchLight(false);

        // stop cylinder rotating
        this.stopCylinderAni();

        events.emit("show_end");
    }

    startCycle() {
        this.cycleIntervalID = setInterval(() => {
            //console.log("Fountain cycle!", this.particleGroup.emitters.length + " Emitters");
            this.outerUp = !this.outerUp;
            for (let i = 0; i < this.firstRingEmitters.length; i++) {
                this.firstRingEmitters[i].velocity.value = this.outerUp ? this.downVelocity : this.upVelocity;
            }
            for (let i = 0; i < this.firstRingEmitters.length; i++) {
                this.secondRingEmitters[i].velocity.value = this.outerUp ? this.upVelocity : this.downVelocity;
            }
        },10000);
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
                value: velocity.clone()
            },
            color: {
                value: new THREE.Color(colorCode)
            },
            size: {
                value: [0.0015, 0.003, 0.0] //[0.2, 0.4, 0.0]
            },
            particleCount: 200,
            opacity: {
                value: [0.5, 0.8, 0.5] //[0.3, 0.8, 0.5]
            },
            transparent: true,
            wiggle: {
                value: 2, //3
                spread: 1 //2
            }
        });

        this.particleGroup.addEmitter(emitter);
        return emitter;
    }

    createTrickleCenter(position, velocity, colorCode) {
        // Get the velocity after rotation
        let emitter = new SPE.Emitter({
            maxAge: {
                value: 2,
                spread: 0
            },
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
                value: new THREE.Color(colorCode)
            },
            size: {
                value: [0.3, 0.4, 0.2, 0.0]
            },
            particleCount: 800,
            opacity: {
                value: [0.5, 0.8, 0.4, 0.2]
            },
            transparent: true
        });
        this.particleGroup.addEmitter(emitter);
        return emitter;
    }

    createFire(position, colorCode) {
        // Get the velocity after rotation
        let emitter = new SPE.Emitter({
            maxAge: {
                value: 0.5,
                spread: 0
            },
            type: SPE.distributions.BOX,
            position : {
                value: position,
                spread: new THREE.Vector3( .2, 0, .2 )
            },
            velocity: {
                value: new THREE.Vector3( 0, 5, 0 ),
                spread: new THREE.Vector3( 0, 1, 0 )
            },
            acceleration: {
                value: new THREE.Vector3( 0.3, 0, 0.2 ),
                spread: new THREE.Vector3()
            },
            color: {
                value: new THREE.Color(colorCode)
            },
            size: {
                value: [4, 3, 2, 0]
            },
            particleCount: 200,
            opacity: {
                value: [1, 0.8, 0.6, 0]
            },
            transparent: true,
            drag: {
                value: 0.5,
                spread: 0
            }
        });
        this.fireParticleGroup.addEmitter(emitter);
        return emitter;
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

    setGroupEmittersValue( emitters, valueIndex, value ){
        switch ( valueIndex ) {
            case 0:
                for(let i=0; i<emitters.length; i++){
                    emitters[i].velocity.value = value;
                }
                break;

            case 1:
                for(let i=0; i<emitters.length; i++){
                    emitters[i].velocity.spread = value;
                }
                break;

            case 2:
                for(let i=0; i<emitters.length; i++){
                    emitters[i].acceleration.value = value;
                }
                break;

            case 3:
                for(let i=0; i<emitters.length; i++){
                    emitters[i].acceleration.spread = value;
                }
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

    startCylinderAni() {
        // bigger one
        this.cylinders[0].tweenAni = TweenMax.to( this.cylinders[0].rotation, 60, {
            y: Math.PI*2,
            ease: Power0.easeNone,
            yoyo: true,
            repeat: 1
        } );

        this.cylinders[1].tweenAni = TweenMax.to( this.cylinders[1].rotation, 60, {
            y: -Math.PI*4,
            ease: Power0.easeNone,
            yoyo: true,
            repeat: 1
        } );
    }

    stopCylinderAni() {
        if(this.cylinders[0].tweenAni!=null)
            this.cylinders[0].tweenAni.kill();
        if(this.cylinders[1].tweenAni!=null)
            this.cylinders[1].tweenAni.kill();
    }

    // velocity, velocity.spread, acceleration, acceleration.spread

    // emitters, arrayOfIndex, _arrayOfValue,
    // time, yoyo, repeatTime, delay, repeatDelay

    zeroAni() {
        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:8, z:0} ],
                                 0.1, true, 7, 0, 2);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:6, z:0} ],
                                 0.1, true, 7, 0, 2);
        this.startCylinderAni();
    }

    firstAni() {
        // from 9
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0,1,2 ],
                                 [ {x:0, y:16, z:0}, {x:3, y:0, z:3}, {x:0, y: -30, z:0} ],
                                 3, true, 1, 0, 1);
        //
        // from 5
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:10, z:0} ],
                                 3, true, 1, 0, 1);
        //
        if (this.spotLightCenters) {
            TweenMax.to( this.spotLightCenters.position, 3, { y: 1.4,
                                                     yoyo: true, repeat: 1,
                                                     delay: 0, repeatDelay: 1} );
        }
    }

    secAni() {
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0,3,2 ],
                                 [ {x:0, y:14, z:0}, {x:3, y:0, z:3}, {x:0, y: -25, z:0} ],
                                 0, false, 3, 0, 5);

        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0 ],
                                 [ {x:0, y:8, z:0} ],
                                 4, false, 3, 1, 1);

        //

        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:10, z:0} ],
                                 0, false, 3, 0, 5);

        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:5, z:0} ],
                                 4, false, 2, 1, 1);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:6, z:0} ],
                                 0, false, 3, 0, 5);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:11, z:0} ],
                                 4, false, 2, 1, 1);
        //
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:12, z:0} ],
                                 0, false, 3, 0, 5);
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:4, z:0} ],
                                 4, false, 3, 1, 1);
        //
        if (this.spotLightCenters) {
            TweenMax.to( this.spotLightCenters.position, 2, { y: 1.4,
                                                     yoyo: false, repeat: 3,
                                                     delay: 1.5, repeatDelay: 2} );
            TweenMax.to( this.spotLightCenters.position, 4, { y: -1,
                                                     yoyo: false, repeat: 2,
                                                     delay: 1.5, repeatDelay: 1} );
        }
    }

    thirdAni() {
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0, 3 ],
                                 [ {x:0, y:14, z:0}, {x:5, y:0, z:5} ],
                                 0.5, true, 3, 1, 2);
        //
        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:7, z:0} ],
                                 0.5, true, 3, 1, 2);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:2, y:6, z:0} ],
                                 0.5, true, 3, 1, 2);
        //
        // time, yoyo, repeatTime, delay, repeatDelay
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:7, z:0} ],
                                 0.5, true, 3, 1, 2);
        //
        if (this.spotLightCenters) {
            
            TweenMax.to( this.spotLightCenters.position, 2, { y: 1.4 } );
            TweenMax.to( this.spotLightCenters.rotation, 2, { y: 4,
                                                     yoyo: true, repeat: 5,
                                                     delay: 0, repeatDelay: 0} );
        }
    }

    fourthAni() {
        // tall & thin
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0,2,3 ],
                                 [ {x:0, y:16, z:0}, {x:0, y: -30, z:0}, {x:1, y:0, z:1} ],
                                 0, false, 0, 0, 0);
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0 ],
                                 [ {x:0, y:14, z:0} ],
                                 0, false, 0, 1, 0);
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 1 ],
                                 [ {x:3, y:.5, z:3} ],
                                 1, true, 3, 1, 2);

        // 
        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:2.5, y:10, z:0} ],
                                 1, true, 3, 1, 2);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:12, z:0} ],
                                 1, true, 3, 1, 2);
        //
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:8.5, z:0} ],
                                 1, true, 3, 1, 2);
        //
        if (this.spotLightCenters) {
            TweenMax.to( this.spotLightCenters.rotation, 3, { y: -4,
                                                     yoyo: true, repeat: 3,
                                                     delay: 1, repeatDelay: 0} );
            TweenMax.to( this.spotLightCenters.position, 2, { x: "+=1", z: "+=1",
                                                     yoyo: true, repeat: 3,
                                                     delay: 1, repeatDelay: 1} );
        }
    }

    fifthAni() {
        // slow down
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0,2 ],
                                 [ {x:0, y:9, z:0}, {x:0, y: -20, z:0} ],
                                 8, false, 0, 0, 0);
        //
        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:6, z:0} ],
                                 8, false, 0, 0, 0);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:7, z:0} ],
                                 8, false, 0, 0, 0);
        //
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:5, z:0} ],
                                 8, false, 0, 0, 0);
        //
        if (this.spotLightCenters) {
            TweenMax.to( this.spotLightCenters.position, 8, { y: -2.5 } );
        }
    }

    sixthAni() {
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0 ],
                                 [ {x:0, y:14, z:0} ],
                                 1, true, 7, 0, 1);
        //
        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:9, z:0} ],
                                 1, true, 7, 1, 1);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:2.5, y:9, z:0} ],
                                 1, true, 7, 0, 1);
        //
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:6, z:0} ],
                                 1, true, 7, 0, 1);
        //
        if (this.spotLightCenters) {
            
            TweenMax.to( this.spotLightCenters.position, 2, { y: 1.4,
                                                     yoyo: true, repeat: 7,
                                                     delay: 0, repeatDelay: 0} );
        }
    }

    seventhAni() {
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 1 ],
                                 [ {x:2, y:.5, z:2} ],
                                 0, false, 0, 0, 0);
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0 ],
                                 [ {x:0, y:13, z:0} ],
                                 1, true, 7, 0, 1);
        //
        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:2.5, y:9, z:0} ],
                                 1, true, 7, 0, 1);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:12, z:0} ],
                                 1, true, 7, 0, 1);
        //
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:6.5, z:0} ],
                                 1, true, 7, 0, 1);
        //
        if (this.spotLightCenters) {
            TweenMax.to( this.spotLightCenters.position, 2, { y: 1.5,
                                                     yoyo: true, repeat: 6,
                                                     delay: 0, repeatDelay: 0} );
            
        }
    }

    eighthAni() {
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0, 1, 2, 3 ],
                                 [ {x:0, y:16, z:0}, {x:1, y:0.5, z:1}, {x:0, y:-30, z:0}, {x:3, y:0, z:3} ],
                                 8, false, 0, 0, 0);

        //
        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:3, y:9, z:0} ],
                                 8, false, 0, 0, 0);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:12, z:0} ],
                                 8, false, 0, 0, 0);
        //
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:9.5, z:0} ],
                                 6, false, 0, 2, 0);
        //
        if (this.spotLightCenters) {
            TweenMax.to( this.spotLightCenters.rotation, 12, { y: Math.PI*8, delay: 2} );
            TweenMax.to( this.spotLightCenters.position, 3, { x: "-=1", z: "-=1",
                                                     yoyo: true, repeat: 5} );
            
        }
    }

    ninethAni() {
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0 ],
                                 [ {x:0, y:12, z:0} ],
                                 0.1, true, 7, 0, 1);
        //
        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:1, y:6, z:0} ],
                                 0.1, true, 7, 0, 1);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:9, z:0} ],
                                 0.1, true, 7, 0, 1);
        //
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:6, z:0} ],
                                 0.1, true, 7, 0, 1);
    }

    tenthAni() {
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0, 3 ],
                                 [ {x:0, y:18, z:0}, {x:1, y:0, z:1} ],
                                 0, false, 0, 0, 0);
        this.updateEmittersValue( this.centerRingEmitters,
                                 [ 0 ],
                                 [ {x:0, y:9, z:0} ],
                                 8, false, 0, 2, 0);
        //
        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:1, y:10, z:0} ],
                                 0, false, 0, 0, 0);

        this.updateEmittersValue( this.firstRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:6, z:0} ],
                                 8, false, 0, 2, 0);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:1, y:14, z:0} ],
                                 0, false, 0, 0, 0);

        this.updateEmittersValue( this.secondRingEmitters,
                                 [ 0 ],
                                 [ {x:1.5, y:7, z:0} ],
                                 8, false, 0, 2, 0);
        //
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:12, z:0} ],
                                 0, false, 0, 0, 0);
        this.updateEmittersValue( this.fireEmitters,
                                 [ 0 ],
                                 [ {x:0, y:4, z:0} ],
                                 5, false, 0, 2, 0);
        //
        if (this.spotLightCenters) {
            TweenMax.to( this.spotLightCenters.position, 2, { y: 1.8 } );
            TweenMax.to( this.spotLightCenters.position, 5, { y: -1.7, delay: 2} );
        }
    }
}
