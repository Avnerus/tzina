import Clouds from './clouds';

const SUN_DISTANCE = 80;


const States = {
    STATIC: "static",
    TRANSITON: "transition"
}

export default class Sky {
    constructor(loadingManager, scene, dirLight, hemiLight) {
        console.log("Sky constructed!")
        const glslify = require('glslify');

        // Shaders
        this.sky_fs = glslify('./shaders/sky_fs.glsl')
        this.sky_vs = glslify('./shaders/sky_vs.glsl')

        this.scene = scene;

        this.sunPosition = new THREE.Vector3(0,0,0);
        this.dirLight = dirLight;
        this.hemiLight = hemiLight;

        this.lensFlareActive = false;

        this.HOURS_DEFINITION = [
            {
                time: 0,
                inclination: 0.6,
                azimuth: 0.02
            },
            {
                time: 7,
                inclination: 0.1,
                azimuth: 0.07
            },
            {
                time: 9,
                inclination: 0.1,
                azimuth: 0.13
            },
            {
                time: 12,
                inclination: 0.1,
                azimuth: 0.255
            },
            {
                time: 17,
                inclination: 0.1,
                azimuth: 0.43
            },
            {
                time: 23,
                inclination: 0.6,
                azimuth: 0.5
            }
        ]
    }
    init(loadingManager) {

        //var imageTexture = THREE.ImageUtils.loadTexture('assets/test/venice.jpeg');

        this.currentTime = 0;
        this.baseTimeIndex = 0;
        this.nextTimeIndex = 1;

        this.inclination = this.HOURS_DEFINITION[this.currentTime].inclination;
        this.azimuth = this.HOURS_DEFINITION[this.currentTime].azimuth;

        this.shader = new THREE.ShaderMaterial( {
            uniforms: {
                luminance:	 { type: "f", value: 1.1 },
                turbidity:	 { type: "f", value: 10 },
                reileigh:	 { type: "f", value: 30.0},
                mieCoefficient:	 { type: "f", value: 0.005 },
                mieDirectionalG: { type: "f", value: 0.8 },
                sunPosition: 	 { type: "v3", value: new THREE.Vector3() },
                cloudsMap:   { type: "t"}
            },
            vertexShader: this.sky_vs,
            fragmentShader: this.sky_fs
        } );

        this.clouds = new Clouds(loadingManager);

        // Chrome Linux workaround
        this.clouds.init(this.shader);
                 //this.clouds.startTransition();

        this.setState(States.STATIC);

        this.loadLensFlare(loadingManager);

        this.updateSunPosition();



        /*
        events.emit("add_gui", {folder:"Sun shader", listen:false}, this.shader.uniforms.luminance, "value"); 
        events.emit("add_gui", {folder:"Sun shader", listen:false}, this.shader.uniforms.turbidity, "value"); 
        events.emit("add_gui", {folder:"Sun shader", listen:false}, this.shader.uniforms.reileigh, "value"); 
        events.emit("add_gui", {folder:"Sun shader", listen:false}, this.shader.uniforms.mieCoefficient, "value"); 
        events.emit("add_gui", {folder:"Sun shader", listen:false}, this.shader.uniforms.mieDirectionalG, "value"); 
        events.emit("add_gui", {folder:"Sun shader", listen:false}, this, "spinFactor"); */

       /*
        events.emit("add_gui",{
            onChange: () => {
                this.updateSunPosition();
            },
            folder: "Sun shader",
        }, this, "inclination", 0, 1); 
        events.emit("add_gui",{
            onChange: () => {
                this.updateSunPosition();
            },
            folder: "Sun shader",
        }, this, "azimuth", 0, 1);*/


        events.on("gaze_started", () => {
            //this.clouds.startTransition();
        });
        events.on("gaze_stopped", () => {
            this.clouds.stopTransition();
        });
    }

    loadLensFlare(loadingManager) {
        // Lens flares - http://threejs.org/examples/webgl_lensflares.html
        console.log("Loading lens flares");

        let textureLoader = new THREE.TextureLoader(loadingManager);

        let textureFlare0 = textureLoader.load( "assets/lensflare/lensflare0.png" );
        let textureFlare2 = textureLoader.load( "assets/lensflare/lensflare2.png" );
        let textureFlare3 = textureLoader.load( "assets/lensflare/lensflare3.png" );

        let lightHSL = this.dirLight.color.getHSL();
        
        let flareColor = new THREE.Color( 0xffffff );
        flareColor.setHSL( lightHSL.h, lightHSL.s, lightHSL.l + 0.5 );

        this.lensFlare = new THREE.LensFlare( textureFlare0, 200, 0.0, THREE.AdditiveBlending, flareColor );

        this.lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
        this.lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
        this.lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

        this.lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
        this.lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
        this.lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
        this.lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

        this.lensFlare.customUpdateCallback = this.lensFlareUpdateCallback;

    }

    lensFlareUpdateCallback( object ) {

       let f, fl = object.lensFlares.length;
       let flare;
       let vecX = -object.positionScreen.x * 2;
       let vecY = -object.positionScreen.y * 2;


       for( f = 0; f < fl; f++ ) {

           flare = object.lensFlares[ f ];

           flare.x = object.positionScreen.x + vecX * flare.distance;
           flare.y = object.positionScreen.y + vecY * flare.distance;

           flare.rotation = 0;
       }

       object.lensFlares[ 2 ].y += 0.025;
       object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );

   }

    setTime(time) {
        let baseTime = this.HOURS_DEFINITION[this.baseTimeIndex].time;
        let nextTime = this.HOURS_DEFINITION[this.nextTimeIndex].time;
        
        if ((time > nextTime && nextTime > baseTime) || time < baseTime) {
            let temp = this.nextTimeIndex;
            this.nextTimeIndex = (this.nextTimeIndex + 1 > this.HOURS_DEFINITION.length -1 ) ? 0: this.nextTimeIndex +1; 
            this.baseTimeIndex = temp;
            this.setTime(time);
        } else {
            // Linear interpolation
            this.currentTime = time;

            let baseInclination = this.HOURS_DEFINITION[this.baseTimeIndex].inclination;
            let baseAzimuth = this.HOURS_DEFINITION[this.baseTimeIndex].azimuth;
            let nextInclination = this.HOURS_DEFINITION[this.nextTimeIndex].inclination;
            let nextAzimuth = this.HOURS_DEFINITION[this.nextTimeIndex].azimuth;

            if (nextTime == 0) {
                nextTime = 24;
            }
            
            this.inclination = baseInclination + ((time - baseTime) / (nextTime - baseTime)) * (nextInclination - baseInclination);
            this.azimuth = baseAzimuth + ((time - baseTime) / (nextTime - baseTime)) * (nextAzimuth - baseAzimuth);

            this.updateSunPosition();
            this.updateHemiLght();
        }

        if (time >= 11 && time <= 16) {
            if (!this.lensFlareActive) {
                console.log("Sky - adding lens flare");
                this.lensFlareActive = true;
                this.scene.add( this.lensFlare );
            }
        } else {
            if (this.lensFlareActive) {
                this.lensFlareActive = false;
                this.scene.remove( this.lensFlare );
            }
        }
    }

    fadeSpin() {
        TweenMax.to(this, 15, {spinFactor: 0.01});
    }

    setState(state) {
        this.state = state;
        if (state == States.STATIC) {
            this.spinFactor = 0.01;
        } else {
            this.spinFactor = 0.5;
        }
    }

    transitionTo(time, inSeconds) {
        console.log("SKY: Transition to " + time + " in " + inSeconds + " seconds");
        this.setState(States.TRANSITON);

        let tl = new TimelineMax({onUpdate: () => {
            this.updateSunPosition();
            this.updateHemiLght();
        }, onComplete : () => {
            this.fadeSpin();
            this.setState(States.STATIC);
        }});
        tl.to(this, inSeconds / 2, Object.assign(this.HOURS_DEFINITION[10], {ease: Linear.easeNone}))
        .to(this, inSeconds / 2, Object.assign(this.HOURS_DEFINITION[time], {ease: Linear.easeNone}));

        TweenMax.to(this, inSeconds, {currentTime: time, onUpdate: () => {
            this.updateHemiLght();            
        }});

    }


    update(dt) {
        this.geo.rotateY(this.spinFactor * Math.PI / 180);
        this.clouds.update(dt);
    }

    applyToMesh(mesh) {
        console.log("Apply sky to", mesh);
        if (mesh) {
            mesh.material = this.shader;
            this.geo = mesh.geometry;
        }
    }

    updateSunPosition() {
        let theta = Math.PI * ( this.inclination - 0.5 );
        let phi = 2 * Math.PI * ( this.azimuth - 0.5 );

        this.sunPosition.set(
            SUN_DISTANCE * Math.cos( phi ),
            SUN_DISTANCE * Math.sin( phi ) * Math.sin( theta ),
            SUN_DISTANCE * Math.sin( phi ) * Math.cos( theta )
        );

        this.shader.uniforms.sunPosition.value.copy(this.sunPosition);

        this.dirLight.position.copy(this.sunPosition);
        if (this.lensFlare) {
            this.lensFlare.position.copy(this.sunPosition);
        }
    }

    updateHemiLght() {
        if (this.currentTime > 0 && this.currentTime <= 14  ) {
            this.hemiLight.intensity = 0.3 * (this.currentTime / 14) * (this.currentTime / 14);
        } 
        else if (this.currentTime > 14 && this.currentTime <= 23) {
            this.hemiLight.intensity = 0.3 * ((23 - this.currentTime) / 9) * ((23 - this.currentTime) / 9);
        }
        else {
            this.hemiLight.intensity = 0;
        }
    }


    getSunPosition() {
        return this.sunPosition;
    }
}
