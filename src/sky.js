import Clouds from './clouds';

const SUN_DISTANCE = 10000;


const States = {
    STATIC: "static",
    TRANSITON: "transition"
}

export default class Sky {
    constructor(loadingManager, dirLight, hemiLight) {
        console.log("Sky constructed!")
        const glslify = require('glslify');

        // Shaders
        this.sky_fs = glslify('./shaders/sky_fs.glsl')
        this.sky_vs = glslify('./shaders/sky_vs.glsl')

        this.clouds = new Clouds(loadingManager);

        this.sunPosition = new THREE.Vector3(0,0,0);
        this.dirLight = dirLight;
        this.hemiLight = hemiLight;

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
                azimuth: 0.37
            },
            {
                time: 23,
                inclination: 0.6,
                azimuth: 0.5
            }
        ]
    }
    init() {

        //var imageTexture = THREE.ImageUtils.loadTexture('assets/test/venice.jpeg');

        this.currentTime = 0;
        this.baseTimeIndex = 0;
        this.nextTimeIndex = 1;

        this.inclination = this.HOURS_DEFINITION[this.currentTime].inclination;
        this.azimuth = this.HOURS_DEFINITION[this.currentTime].azimuth;

        this.shader = new THREE.ShaderMaterial( {
            uniforms: {
                luminance:	 { type: "f", value: 1.1 },
                turbidity:	 { type: "f", value: 5 },
                reileigh:	 { type: "f", value: 1 },
                mieCoefficient:	 { type: "f", value: 0.005 },
                mieDirectionalG: { type: "f", value: 0.8 },
                sunPosition: 	 { type: "v3", value: new THREE.Vector3() },
                cloudsMap:   { type: "t"}
            },
            vertexShader: this.sky_vs,
            fragmentShader: this.sky_fs
        } );

        // Chrome Linux workaround
        setTimeout(()=> {
                 this.clouds.init(this.shader);
                 //this.clouds.startTransition();
        },0);

        this.setState(States.STATIC);

        this.updateSunPosition();

        events.emit("add_gui",{
            onChange: () => {
                this.updateSunPosition();
            },
            folder: "Sun",
        }, this, "inclination", 0, 1); 
        events.emit("add_gui",{
            onChange: () => {
                this.updateSunPosition();
            },
            folder: "Sun",
        }, this, "azimuth", 0, 1); 

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
