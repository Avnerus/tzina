/**
 * @author mrdoob / http://mrdoob.com
 * @modified by obviousjim / http://specular.cc
 * @modified by avnerus / http://avner.js.org
 * @modified by juniorxsound / http://orfleisher.com
 */

import DebugUtil from './debug'

const VERTS_WIDE = 256;
const VERTS_TALL = 256;
const precision  = 3;


export default class VideoRGBD  {
    constructor(properties) {

        this.properties = properties;

        this.timer = 0;

        this.SEC_PER_RGBD_FRAME = 1 / this.properties.fps;

        this.video = document.createElement( 'video' );

        this.isPlaying = false;


        //console.log("VideoRGBD constructed: " , this.properties);
    }
    static initPool() {

        const glslify = require('glslify');

        // Shaders
        let rgbd_fs = glslify('../shaders/rgbd_fs.glsl')
        let rgbd_vs = glslify('../shaders/rgbd_vs.glsl')

        //SOME SPECIFIC CONTRAST & BRIGHNESS EFFECTS TO THE WIRE PIXEL SHADER
        let wire_rgbd_fs = glslify('../shaders/rgbd_wire_fs.glsl')
        let wire_rgbd_vs = glslify('../shaders/rgbd_wire_vs.glsl')

        console.log("VideoRGBD init pool");
        this.meshPool = [];
        this.wirePool = [];

        let baseGeometry = this.buildMeshGeometry();
        
        for (let i = 0; i < 10; i++) {
            let linesMaterial = new THREE.ShaderMaterial( {
              uniforms: {
                  "map": { type: "t" },
                  "mindepth" : { type : "f", value : 0.0 },
                  "maxdepth" : { type : "f", value : 0.0 },
                  "uvdy" : { type : "f", value : 0.5 },
                  "uvdx" : { type : "f", value : 0.0 },
                  "opacity" : { type : "f", value : 0.01 },
                  "width" : { type : "f", value : 0.0 },
                  "height" : { type : "f", value : 0.0 },
                  "brightness" : { type : "f", value : 0.3 },
                  "wire_strech": { type : "f", value : 1.0 },
                  "contrast" : { type : "f", value : 0.001 }
              },

              vertexShader: wire_rgbd_vs,
              fragmentShader: wire_rgbd_fs,
              blending: THREE.AdditiveBlending,
              wireframe:      true,
              transparent:    true
            } );

            let meshMaterial = new THREE.ShaderMaterial( {

                uniforms: {
                    "map": { type: "t" },
                    "mindepth" : { type : "f", value : 0.0 },
                    "maxdepth" : { type : "f", value : 0.0 },
                    "uvdy" : { type : "f", value : 0.5 },
                    "uvdx" : { type : "f", value : 0.0 },
                    "width" : { type : "f", value : 0.0 },
                    "height" : { type : "f", value : 0.0 },
                    "opacity" : { type : "f", value : 1.0 }
                },

                vertexShader: rgbd_vs,
                fragmentShader: rgbd_fs,
                //blending: THREE.AdditiveBlending,
                transparent: true,
                wireframe:false
            } );

            let geometry = baseGeometry.clone();


           //let material = new THREE.MeshBasicMaterial( { color: 0x0000ff , wireframe: true} );

            this.meshPool.push(new THREE.Mesh(geometry, meshMaterial ));
            this.wirePool.push(new THREE.Mesh( geometry, linesMaterial ));
        }

    }
    init() {
        console.log("Video rgbd loading ", this.properties.fileName);
        this.videoTexture = new THREE.Texture( this.video );
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;
        this.videoTexture.generateMipmaps = false;


        //DebugUtil.positionObject(this.wire, this.properties.fileName + " - Wire", false);

        //this.wire.position.z = -0.6;
        this.mesh = VideoRGBD.meshPool.pop();
        this.wire = VideoRGBD.wirePool.pop();

        if (this.mesh) {

            this.mesh.material.uniforms.mindepth.value = this.wire.material.uniforms.mindepth.value = this.properties.mindepth;
            this.mesh.material.uniforms.maxdepth.value = this.wire.material.uniforms.maxdepth.value = this.properties.maxdepth;
            this.mesh.material.uniforms.uvdy.value = this.wire.material.uniforms.uvdy.value = this.properties.uvdy;
            this.mesh.material.uniforms.uvdx.value = this.wire.material.uniforms.uvdx.value = this.properties.uvdx;
            this.mesh.material.uniforms.width.value = this.wire.material.uniforms.width.value = this.properties.width;
            this.mesh.material.uniforms.height.value = this.wire.material.uniforms.height.value = this.properties.height;

            this.wire.position.z += 0.01;

            this.mesh.scale.set(this.properties.scale, this.properties.scale, this.properties.scale);
            this.wire.scale.set(this.properties.scale, this.properties.scale, this.properties.scale);

            events.emit("add_gui", {folder: this.properties.fileName + " UVDX", step: 0.001}, this.mesh.material.uniforms.uvdx, "value", -1,0);
            events.emit("add_gui", {folder: this.properties.fileName + " UVDY", step: 0.001}, this.mesh.material.uniforms.uvdy, "value", -1,1);
        } else {
            console.error("Video RGBD Failed to load mesh from pool", this.properties.fileName);
        }


    }
    load() {
        this.video.src = this.properties.fileName;
        if (typeof(this.properties.volume) != 'undefined') {
            console.log("Video volume ", this.properties.volume);
            this.video.volume = this.properties.volume;
        }

        this.video.load();
    }
    unload() {
        console.log("Video unload", this.properties.fileName);
        this.pause();
        this.video.src = "";

        if (this.videoTexture) {
            this.videoTexture.dispose();
        }
        if (this.mesh) {
            VideoRGBD.meshPool.push(this.mesh);
            VideoRGBD.wirePool.push(this.wire);
        }

        
        this.mesh = null;
        this.wire = null;
    }

    setPosition(newPosition) {
        if (this.mesh) {
            this.mesh.position.copy(newPosition)
        }
        if (this.wire) {
            this.wire.position.copy(newPosition)
            this.wire.position.z += 0.01;
        }
    }

    static buildMeshGeometry() {
        let meshGeometry = new THREE.Geometry();
        for ( let y = 0; y < VERTS_TALL; y++) {
            for ( let x = 0; x < VERTS_WIDE; x++ ) {
                meshGeometry.vertices.push(
                        new THREE.Vector3((-640 + x * 5), (480 -y * 5) , 0 ) );
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
    //We don't really need this function since I am using the Mesh Geometry to create wireframe
    buildWireGeometry() {
        let wireGeometry = new THREE.Geometry();
        for ( let y = 0; y < VERTS_TALL; y++) {
            for ( let x = 0, x2 = precision; x < VERTS_WIDE; x += precision, x2 += precision ) {
                /*wireGeometry.vertices.push(
                        new THREE.Vector3((-640 + x * 5), (480 -y * 5) , 0 ) );*/
                wireGeometry.vertices.push( new THREE.Vector3( x, y, 0 ) );
                wireGeometry.vertices.push( new THREE.Vector3( x2, y, 0 ) );
            }
        }
        return wireGeometry;
    }

    play() {
            if ( this.isPlaying === true ) return;
            this.video.play();
            this.isPlaying = true;
    }
    update(dt) {
        this.timer += dt;
        if (this.timer >= this.SEC_PER_RGBD_FRAME) {
            this.timer = 0;
            if ( this.isPlaying && this.video.readyState === this.video.HAVE_ENOUGH_DATA ) {

                this.mesh.material.uniforms.map.value = this.videoTexture;

                this.wire.material.uniforms.map.value = this.videoTexture;

                this.videoTexture.needsUpdate = true;
            }
        }
    }
    pause() {
        if ( this.isPlaying === false ) return;

        this.video.pause();

        this.isPlaying = false;

    };

    isPlaying() {
        return this.isPlaying;
    };

    setOpacity(opacity) {
        if (this.mesh && this.wire) {
            this.mesh.material.uniforms.opacity.value = opacity;
            this.wire.material.uniforms.opacity.value = Math.min(opacity,0.1);
        }
    }

    setDepth(min, max) {
        console.log("Video " + this.properties.fileName + "Changing depth ", min, max);
        this.mesh.material.uniforms.mindepth.value = min;
        this.mesh.material.uniforms.maxdepth.value = max;

        this.wire.material.uniforms.mindepth.value = min;
        this.wire.material.uniforms.maxdepth.value = max;
    }

    setScale(scale) {
        this.mesh.scale.set(scale, scale, scale);
        this.wire.scale.set(scale, scale, scale);
    }
};
