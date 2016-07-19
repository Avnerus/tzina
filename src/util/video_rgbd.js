/**
 * @author mrdoob / http://mrdoob.com
 * @modified by obviousjim / http://specular.cc
 * @modified by avnerus / http://avner.js.org
 * @modified by juniorxsound / http://orfleisher.com
 */
const SEC_PER_RGBD_FRAME = 1 / 25;
const VERTS_WIDE = 128;
const VERTS_TALL = 128;


export default class VideoRGBD extends THREE.Object3D {
    constructor(properties) {
        const glslify = require('glslify');

        super();
        this.properties = properties;


        // Shaders
        this.rgbd_fs = glslify('../shaders/rgbd_fs.glsl')
        this.rgbd_vs = glslify('../shaders/rgbd_vs.glsl')

        this.timer = 0;

        console.log("VideoRGBD constructed: " , this.properties);
    }

    init(scene, loadingManager) {
        this.video = document.createElement( 'video' );
        this.video.src = this.properties.basePath + '.webm';
        this.video.loop = false;
        let imageTexture = new THREE.TextureLoader(loadingManager).load(this.properties.basePath + '.png' );


        this.isPlaying = false;
        this.videoTexture = new THREE.Texture( this.video );
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;
        this.videoTexture.generateMipmaps = false;

        let geometry = this.buildMeshGeometry();

        this.meshMaterial = new THREE.ShaderMaterial( {

            uniforms: {
                "map": { type: "t", value: imageTexture },
                "opacity": { type: "f", value: 0.25 },
                "mindepth" : { type : "f", value : this.properties.mindepth },
                "maxdepth" : { type : "f", value : this.properties.maxdepth }
            },

            vertexShader: this.rgbd_vs,
            fragmentShader: this.rgbd_fs,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
        } );

        //let material = new THREE.MeshBasicMaterial( { color: 0x0000ff , wireframe: true} );
        this.mesh = new THREE.Mesh( geometry, this.meshMaterial );
        //let mesh = new THREE.Mesh( geometry, material);
        this.mesh.scale.set(0.002, 0.002, 0.002);
        this.mesh.position.set(40,12,40);
        scene.add(this.mesh);
        //mesh.frustumCulled = false;

        var bbox = new THREE.BoundingBoxHelper( this.mesh, 0x00ff00  );
        bbox.update();
        scene.add( bbox );
    }

    buildMeshGeometry() {
        let meshGeometry = new THREE.Geometry();
        for ( let y = 0; y < VERTS_TALL; y++) {
            for ( let x = 0; x < VERTS_WIDE; x++ ) {
                meshGeometry.vertices.push(
                        new THREE.Vector3((-320 + x * 4), (240 -y * 4) , 0 ) );
                    // new THREE.Vector3(-x / VERTS_WIDE ,  y / VERTS_TALL, 0 ) );
            }
        }
        for ( let y = 0; y < VERTS_TALL - 1; y++ ) {
            for ( let x = 0; x < VERTS_WIDE - 1; x++) {
                meshGeometry.faces.push(
                    new THREE.Face3(
                        x + y * VERTS_WIDE,
                        x + (y+1) * VERTS_WIDE,
                        (x+1) + y * (VERTS_WIDE)
                ));
                meshGeometry.faces.push(
                    new THREE.Face3(
                        x + 1 + y * VERTS_WIDE,
                        x + (y+1) * VERTS_WIDE,
                        (x+1) + (y+1) * (VERTS_WIDE)
                ));
            }
        }
        return meshGeometry;
    }

    play() {
            if ( this.isPlaying === true ) return;
            this.video.play();
            this.isPlaying = true;
    }
    update(dt) {
        this.timer += dt;
        if (this.timer >= SEC_PER_RGBD_FRAME) {
            this.timer = 0;
            if ( this.isPlaying && this.video.readyState === this.video.HAVE_ENOUGH_DATA ) {

                this.meshMaterial.uniforms.map.value = this.videoTexture;

                this.videoTexture.needsUpdate = true;

            }
        }
    }
    pause() {
        if ( this.isPlaying === false ) return;

        this.video.pause();

        this.meshMaterial.uniforms.map.value = this.imageTexture;

        this.isPlaying = false;

    };

    isPlaying() {
        return this.isPlaying;
    };
};
