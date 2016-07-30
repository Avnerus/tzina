import Clouds from './clouds';

const SUN_DISTANCE = 10000;

const HOURS_DEFINITION = {
    0: {
        inclination: 0.6,
        azimuth: 0.02
    },
    10: {
        inclination: 0,
        azimuth: 0.23
    },
    17 : {
        inclination: 0.09,
        azimuth: 0.42
    }
}

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
    }
    init() {

        //var imageTexture = THREE.ImageUtils.loadTexture('assets/test/venice.jpeg');

        this.currentTime = 0;
        this.inclination = HOURS_DEFINITION[this.currentTime].inclination;
        this.azimuth = HOURS_DEFINITION[this.currentTime].azimuth;

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

        this.state = States.STATIC;

        this.updateSunPosition();

    }

    transitionTo(time, inSeconds) {
        console.log("SKY: Transition to " + time + " in " + inSeconds + " seconds");
        this.state = States.TRANSITON;

        let tl = new TimelineMax({onUpdate: () => {
            this.updateSunPosition();
            this.updateHemiLght();
        }, onComplete : () => {this.state = States.STATIC}});
        tl.to(this, inSeconds / 2, Object.assign(HOURS_DEFINITION[10], {ease: Linear.easeNone}))
        .to(this, inSeconds / 2, Object.assign(HOURS_DEFINITION[time], {ease: Linear.easeNone}));

        TweenMax.to(this, inSeconds, {currentTime: time, onUpdate: () => {
            this.updateHemiLght();            
        }});

    }


    update(dt) {
        if (this.state == States.STATIC) {
            this.geo.rotateY(0.01 * Math.PI / 180);
        } else {
            this.geo.rotateY(0.5 * Math.PI / 180);
        }
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
            this.hemiLight = 0.3 * ((23 - this.currentTime) / 18) * ((23 - this.currentTime) / 18);
        }
        else {
            this.hemiLight.intensity = 0;
        }
    }


    getSunPosition() {
        return this.sunPosition;
    }
}
