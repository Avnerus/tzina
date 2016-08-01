/**
 * @author mrdoob / http://mrdoob.com
 * @modified by obviousjim / http://specular.cc
 * @modified by avnerus / http://avner.js.org
 * @modified by juniorxsound / http://orfleisher.com
 */
const SEC_PER_RGBD_FRAME = 1 / 25;
const VERTS_WIDE = 128;
const VERTS_TALL = 128;


export default class VideoRGBD  {
    constructor(properties) {
        const glslify = require('glslify');

        this.properties = properties;


        // Shaders
        this.rgbd_fs = glslify('../shaders/rgbd_fs.glsl')
        this.rgbd_vs = glslify('../shaders/rgbd_vs.glsl')

        this.timer = 0;

        console.log("VideoRGBD constructed: " , this.properties);
    }

    init(loadingManager) {
        this.video = document.createElement( 'video' );
        this.video.src = this.properties.basePath + '.webm';
        this.video.loop = true;


        this.isPlaying = false;
        this.videoTexture = new THREE.Texture( this.video );
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;
        this.videoTexture.generateMipmaps = false;

        this.imageTexture = new THREE.TextureLoader(loadingManager).load(this.properties.basePath + '.png' );

        /*
        this.debug = {
            x1: 1460,
            //x1: 1260,
            //x2: 1920,
            x2: 2800,
            x3: 1920,
            //y1: 720,
            // y2: 1440,
            y1: 1260,
            y2: 2040,
            y3: 1440,
            uvd: 0.440277,
            posz: 2600.0,
            posx: 150.0
            }*/
        this.debug = {
            x1: 1500,
            x2: 2400,
            x3: 1920,
            y1: 820,
            y2: 1700,
            y3: 940,
            uvd: 0.440277,
            posz: 2600.0,
            posx: 150.0
        }
        events.emit("add_gui", this.debug, "x1"); 
        events.emit("add_gui", this.debug, "x2"); 
        events.emit("add_gui", this.debug, "x3"); 
        events.emit("add_gui", this.debug, "y1"); 
        events.emit("add_gui", this.debug, "y2"); 
        events.emit("add_gui", this.debug, "y3"); 
        events.emit("add_gui", this.debug, "uvd"); 
        events.emit("add_gui", this.debug, "posx"); 
        events.emit("add_gui", this.debug, "posz"); 
        events.emit("add_gui", this.properties, "mindepth"); 
        events.emit("add_gui", this.properties, "maxdepth"); 

        this.meshMaterial = new THREE.ShaderMaterial( {

            uniforms: {
                "map": { type: "t", value: this.imageTexture },
                "mindepth" : { type : "f", value : this.properties.mindepth },
                "maxdepth" : { type : "f", value : this.properties.maxdepth },
                "x1" : { type : "f", value : this.debug.x1 },
                "x2" : { type : "f", value : this.debug.x2 },
                "x3" : { type : "f", value : this.debug.x3 },
                "y1" : { type : "f", value : this.debug.y1 },
                "y2" : { type : "f", value : this.debug.y2 },
                "y3" : { type : "f", value : this.debug.y3 },
                "uvd" : { type : "f", value : this.debug.uvd },
                "posx" : { type : "f", value : this.debug.posx },
                "posz" : { type : "f", value : this.debug.posz }
            },

            vertexShader: this.rgbd_vs,
            fragmentShader: this.rgbd_fs,
            blending: THREE.AdditiveBlending /*
            depthTest: false,
            depthWrite: false*/
        } );

        let geometry = this.buildMeshGeometry();

        //let material = new THREE.MeshBasicMaterial( { color: 0x0000ff , wireframe: true} );
        this.mesh = new THREE.Mesh( geometry, this.meshMaterial );
        //let mesh = new THREE.Mesh( geometry, material);
        //this.mesh.scale.set(0.0016, 0.0016, 0.0016);
        this.mesh.scale.set(0.003, 0.003, 0.003);
        this.mesh.rotation.set(
            this.properties.rotation[0],
            this.properties.rotation[1],
            this.properties.rotation[2]
        );


        //mesh.frustumCulled = false;

        /*
        var bbox = new THREE.BoundingBoxHelper( this.mesh, 0x00ff00  );
        bbox.update();
        scene.add( bbox );*/

    }


    buildMeshGeometry() {
        let meshGeometry = new THREE.Geometry();
        for ( let y = 0; y < VERTS_TALL; y++) {
            for ( let x = 0; x < VERTS_WIDE; x++ ) {
                meshGeometry.vertices.push(
                        new THREE.Vector3((-640 + x * 5), (480 -y * 5) , 0 ) );
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

        this.meshMaterial.uniforms.x1.value = this.debug.x1;
        this.meshMaterial.uniforms.x2.value = this.debug.x2;
        this.meshMaterial.uniforms.x3.value = this.debug.x3;
        this.meshMaterial.uniforms.y1.value = this.debug.y1;
        this.meshMaterial.uniforms.y2.value = this.debug.y2;
        this.meshMaterial.uniforms.y3.value = this.debug.y3;
        this.meshMaterial.uniforms.uvd.value = this.debug.uvd;
        this.meshMaterial.uniforms.posx.value = this.debug.posx;
        this.meshMaterial.uniforms.posz.value = this.debug.posz;
        this.meshMaterial.uniforms.mindepth.value = this.properties.mindepth;
        this.meshMaterial.uniforms.maxdepth.value = this.properties.maxdepth;
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
