export default class Sky {
    constructor() {
        console.log("Sky constructed!")
        const glslify = require('glslify');

        // Shaders
        this.sky_fs = glslify('./shaders/sky_fs.glsl')
        this.sky_vs = glslify('./shaders/sky_vs.glsl')
    }
    init() {
        this.shader = new THREE.ShaderMaterial( {
            uniforms: {

                luminance:	 { type: "f", value: 1.1 },
                turbidity:	 { type: "f", value: 5 },
                reileigh:	 { type: "f", value: 1 },
                mieCoefficient:	 { type: "f", value: 0.005 },
                mieDirectionalG: { type: "f", value: 0.8 },
                sunPosition: 	 { type: "v3", value: new THREE.Vector3(-273713.00880935474,291010.7337795954,
                                                                        -19847.962958236305) }
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
        //this.mesh = new THREE.Mesh( this.geo, new THREE.MeshBasicMaterial({color: 0x7777ff}) );
    }
    
    update(dt) {
        //console.log(this.camera.rotation);
    }
}
