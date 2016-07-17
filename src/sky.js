import Clouds from './clouds';

const SUN_DISTANCE = 10000;

export default class Sky {
    constructor(loadingManager) {
        console.log("Sky constructed!")
        const glslify = require('glslify');

        // Shaders
        this.sky_fs = glslify('./shaders/sky_fs.glsl')
        this.sky_vs = glslify('./shaders/sky_vs.glsl')

        this.clouds = new Clouds(loadingManager);

        this.sunPosition = new THREE.Vector3(0,0,0);
    }
    init() {

        //var imageTexture = THREE.ImageUtils.loadTexture('assets/test/venice.jpeg');

        this.inclination = 0.1;
        this.azimuth = 0.14;

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
            fragmentShader: this.sky_fs,
            side: THREE.BackSide
        } );

        // Chrome Linux workaround
        setTimeout(()=> {
            this.clouds.init(this.shader);
        },0);

        /*
        var geometry = new THREE.SphereBufferGeometry( 450000, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        ths.mesh = new THREE.Mesh( geometry, material );*/
        
        /*
        this.geo = new THREE.SphereBufferGeometry( 450000, 32, 15 );
        this.mesh = new THREE.Mesh( this.geo, this.shader );
        */

        this.updateSunPosition();

    }

    update(dt) {
        this.azimuth += 0.00002;
        this.inclination += 0.0002;
        this.updateSunPosition();

        this.geo.rotateY(0.01 * Math.PI / 180);
        this.clouds.update(dt);
    }

    applyToMesh(mesh) {
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
    }

    getSunPosition() {
        return this.sunPosition;
    }
}
