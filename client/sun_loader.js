import GeometryUtils from './util/GeometryUtils'
import FBO from './util/fbo'
import DebugUtil from './util/debug'

export default class SunLoader extends THREE.Object3D  {
    constructor(renderer) {
        super();

        const glslify = require('glslify');

        // Shaders
        this.render_fs = glslify('./shaders/sun_loader/render_fs.glsl');
        this.render_vs = glslify('./shaders/sun_loader/render_vs.glsl');
        this.simulation_fs = glslify('./shaders/sun_loader/simulation_fs.glsl');
        this.simulation_vs = glslify('./shaders/sun_loader/simulation_vs.glsl');

        this.width = 32;
        this.height = 32;

        this.timer = 0;

        this.renderer = renderer;

        this.radius = 0.8;
        this.tube = 0.2;

        this.orderTimer = 0.0;
    }
    organize() {
        TweenMax.to(this.simulationShader.uniforms.orderTimer, 1, {value: 1.0});
    }
    disorganize() {
        TweenMax.to(this.simulationShader.uniforms.orderTimer, 1, {value: 0.0});
    }
    initParticles() {
        let fboGeo = new THREE.TorusGeometry( this.radius, this.tube, 20, 100 );

        let data = new Float32Array( this.width * this.height * 3  );

        let points = THREE.GeometryUtils.randomPointsInGeometry(fboGeo, this.width * this.height );
        for ( var i = 0, j = 0, l = data.length; i < l; i += 3, j += 1 ) {
            data[ i ] = points[ j ].x;
            data[ i + 1 ] = points[ j ].y;
            data[ i + 2 ] = points[ j ].z;
        }
        let positions = new THREE.DataTexture( data, this.width, this.height, THREE.RGBFormat, THREE.FloatType );
        positions.needsUpdate = true;
        
        return positions;
    }
    init() {
        let positions = this.initParticles();

        this.simulationShader = new THREE.ShaderMaterial({
            uniforms: {
                positions: { type: "t", value: positions },
                origin: { type: "t", value: positions },
                timer: { type: "f", value: 0},
                radius: { type: "f", value: this.radius },
                tube: { type: "f", value: this.tube },
                orderTimer: { type: "f", value: this.orderTimer }
            },
            vertexShader: this.simulation_vs,
            fragmentShader:  this.simulation_fs,
        });

        this.renderShader = new THREE.ShaderMaterial( {
            uniforms: {
                positions: { type: "t", value: null },
                pointSize: { type: "f", value: 3},
                radius: { type: "f", value: this.radius },
                tube: { type: "f", value: this.tube }
            },
            vertexShader: this.render_vs,
            fragmentShader: this.render_fs,
            transparent: false,
//            blending:THREE.AdditiveBlending
        } );

        // Particle geometry? Just once particle
        var particleGeometry  = new THREE.Geometry();
        particleGeometry.vertices.push( new THREE.Vector3() );

        this.fbo = new FBO();
        this.fbo.init( this.width,this.height, this.renderer, this.simulationShader, this.renderShader, particleGeometry );
        this.add( this.fbo.particles );

        events.emit("add_gui", {folder:"Particles Order", listen:false}, this.simulationShader.uniforms.orderTimer, "value", 0.0, 1.0); 

        events.emit("add_gui", {folder:"Command", listen:false}, this, "organize"); 
        events.emit("add_gui", {folder:"Command", listen:false}, this, "disorganize"); 


        this.fbo.update();
    }
    update(dt,et) {
        this.simulationShader.uniforms.timer.value = et;
        this.fbo.update();
        if (this.simulationShader.uniforms.orderTimer.value > 0.3) {
            this.rotateZ(0.5 * dt);
        }
    }
}
