// https://github.com/nicoptere/FBO
import THREE from 'three'

export default class FBO {
    constructor() {
        console.log("FBO Constructed")
    }
    init( width, height, renderer, simulationMaterial, renderMaterial, particleGeometry) {

        let gl = renderer.getContext();

        //1 we need FLOAT Textures to store positions
        //https://github.com/KhronosGroup/WebGL/blob/master/sdk/tests/conformance/extensions/oes-texture-float.html
        if (!gl.getExtension("OES_texture_float")){
            throw new Error( "float textures not supported" );
        }

        //2 we need to access textures from within the vertex shader
        //https://github.com/KhronosGroup/WebGL/blob/90ceaac0c4546b1aad634a6a5c4d2dfae9f4d124/conformance-suites/1.0.0/extra/webgl-info.html
        if( gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0 ) {
            throw new Error( "vertex shader cannot read textures" );
        }

        //3 rtt setup
        this.scene = new THREE.Scene();
        this.simulationMaterial = simulationMaterial;
        this.orthoCamera = new THREE.OrthographicCamera(-1,1,1,-1,1/Math.pow( 2, 53 ),1 );

        //4 create a target texture
        let options = {
            minFilter: THREE.NearestFilter,//important as we want to sample square pixels
            magFilter: THREE.NearestFilter,//
            format: THREE.RGBAFormat,
            type:THREE.FloatType//important as we need precise coordinates (not ints)
        };
        this.rttOut = new THREE.WebGLRenderTarget( width,height, options);
        this.rttIn = this.rttOut.clone();

        //5 the simulation:
        //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
        let geom = new THREE.BufferGeometry();
        geom.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array([
                -1, -1, 0,
                 1, -1 ,0,
                 1,  1, 0,
                -1, -1, 0,
                 1,  1, 0,
                -1,  1, 0 
        ]), 3 ) );
        geom.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array([   0,1, 1,1, 1,0,     0,1, 1,0, 0,0 ]), 2 ) );
        this.scene.add( new THREE.Mesh( geom, simulationMaterial ) );


        let particleVertices = particleGeometry.vertices;
        console.log(particleVertices.length + " Particle vertices in each 'particle' ");

        // l is the number of 'elements'
        let l = (width * height );
        console.log("Surface of the FBO: " + l);

        // Each element is either one particle or a collection of particle vertices
        let points = l * particleVertices.length;
        console.log("Number of points: " + points);

        // Now let's fill up the vertices array
        let vertices = new Float32Array( points * 3 );

        let v = 0;
        for (var i = 0; i < l; i++) {
            for (var j = 0; j < particleVertices.length; j++) {
                vertices[v++] = particleVertices[j].x;
                vertices[v++] = particleVertices[j].y;
                vertices[v++] = particleVertices[j].z;
            }
        }

        //console.log("Vertices array: ", vertices);

        let references  = new Float32Array( points * 2);
        for(var vert = 0; vert < points; vert++ ) {

            var i = ~~(vert / 3);
            var x = (i % width) / width;
            var y = ~~(i / width) / height;

            references[ vert * 2     ] = x;
            references[ vert * 2 + 1 ] = y;
        }

        //create the particles geometry
        let geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position',  new THREE.BufferAttribute( vertices, 3 ) );
        geometry.addAttribute( 'reference',  new THREE.BufferAttribute( references, 2 ) );

        //the rendermaterial is used to render the particles
        if (particleVertices.length > 1) {
            this.particles = new THREE.Mesh( geometry, renderMaterial );
            this.particles.matrixAutoUpdate = false;
            this.particles.rotation.z = Math.PI/2;
            this.particles.rotation.x = Math.PI/2;
            this.particles.updateMatrix();
        }
        else {
            this.particles = new THREE.Points( geometry, renderMaterial );
            this.particles.frustumCulled = false;
        }
        this.renderer = renderer;

        // First render
        this.renderer.render(this.scene, this.orthoCamera, this.rttOut, false );

        this.update();

    }

    //7 update loop
    update(){

        let tmp = this.rttIn;
        this.rttIn = this.rttOut;
        this.rttOut = tmp;

        this.simulationMaterial.uniforms.positions.value = this.rttIn;
        this.renderer.render(this.scene, this.orthoCamera, this.rttOut, true );

        //2 use the result of the swap as the new position for the particles' renderer
        this.particles.material.uniforms.positions.value = this.rttOut;

   }
}
