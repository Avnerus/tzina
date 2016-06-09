const SUN_DISTANCE = 400000;

export default class Sky {
    constructor() {
        console.log("Sky constructed!")
        const glslify = require('glslify');

        // Shaders
        this.sky_fs = glslify('./shaders/sky_fs.glsl')
        this.sky_vs = glslify('./shaders/sky_vs.glsl')
    }
    init() {

        this.inclination = 0.1;
        this.azimuth = 0.14;

        this.shader = new THREE.ShaderMaterial( {
            uniforms: {

                luminance:	 { type: "f", value: 1.1 },
                turbidity:	 { type: "f", value: 5 },
                reileigh:	 { type: "f", value: 1 },
                mieCoefficient:	 { type: "f", value: 0.005 },
                mieDirectionalG: { type: "f", value: 0.8 },
                sunPosition: 	 { type: "v3", value: new THREE.Vector3() }
            },
            vertexShader: this.sky_vs,
            fragmentShader: this.sky_fs,
            side: THREE.BackSide
        } );

        /*
        var geometry = new THREE.SphereBufferGeometry( 450000, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        ths.mesh = new THREE.Mesh( geometry, material );*/
        
        this.geo = new THREE.SphereBufferGeometry( 450000, 32, 15 );
        this.mesh = new THREE.Mesh( this.geo, this.shader );

        this.updateSunPosition();
    }
    
    update(dt) {
        //console.log(this.camera.rotation);
        this.azimuth += 0.00001;
        this.inclination += 0.0001;
        this.updateSunPosition();
    }

    updateSunPosition() {
        let theta = Math.PI * ( this.inclination - 0.5 );
        let phi = 2 * Math.PI * ( this.azimuth - 0.5 );

        let newPosition = new THREE.Vector3(
            SUN_DISTANCE * Math.cos( phi ),
            SUN_DISTANCE * Math.sin( phi ) * Math.sin( theta ),
            SUN_DISTANCE * Math.sin( phi ) * Math.cos( theta )
        );

        this.shader.uniforms.sunPosition.value.copy(newPosition);
    }
}
