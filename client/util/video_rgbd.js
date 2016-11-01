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
        const glslify = require('glslify');

        this.properties = properties;


        // Shaders
        this.rgbd_fs = glslify('../shaders/rgbd_fs.glsl')
        this.rgbd_vs = glslify('../shaders/rgbd_vs.glsl')

        //SOME SPECIFIC CONTRAST & BRIGHNESS EFFECTS TO THE WIRE PIXEL SHADER
        this.wire_rgbd_fs = glslify('../shaders/rgbd_wire_fs.glsl')

        this.timer = 0;

        this.SEC_PER_RGBD_FRAME = 1 / this.properties.fps;

        console.log("VideoRGBD constructed: " , this.properties);
    }

    init(loadingManager) {
        this.video = document.createElement( 'video' );
        if (this.properties.volume) {
            console.log("Video volume ", this.properties.volume);
            this.video.volume = this.properties.volume;
        }

        /*
        this.video.crossOrigin = "anonymous"
        console.log("Cross origin video ", this.video.crossOrigin); */

        this.isPlaying = false;
        this.videoTexture = new THREE.Texture( this.video );
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;
        this.videoTexture.generateMipmaps = false;

        this.linesMaterial = new THREE.ShaderMaterial( {
          uniforms: {
              "map": { type: "t" },
              "mindepth" : { type : "f", value : this.properties.mindepth },
              "maxdepth" : { type : "f", value : this.properties.maxdepth },
              "uvdy" : { type : "f", value : this.properties.uvdy },
              "uvdx" : { type : "f", value : this.properties.uvdx },
              "opacity" : { type : "f", value : 0.1 },
              "brightness" : { type : "f", value : 0.3 }
          },

          vertexShader: this.rgbd_vs,
          fragmentShader: this.wire_rgbd_fs,
          blending: THREE.AdditiveBlending,
          wireframe:      true,
          transparent:    true
        } );

        this.meshMaterial = new THREE.ShaderMaterial( {

            uniforms: {
                "map": { type: "t" },
                "mindepth" : { type : "f", value : this.properties.mindepth },
                "maxdepth" : { type : "f", value : this.properties.maxdepth },
                "uvdy" : { type : "f", value : this.properties.uvdy },
                "uvdx" : { type : "f", value : this.properties.uvdx },
                "width" : { type : "f", value : this.properties.width },
                "height" : { type : "f", value : this.properties.height },
                "opacity" : { type : "f", value : 1.0 }
            },

            vertexShader: this.rgbd_vs,
            fragmentShader: this.rgbd_fs,
            //blending: THREE.AdditiveBlending,
            transparent: true,
            wireframe:false
        } );

        let geometry = this.buildMeshGeometry();

        //events.emit("add_gui", {folder: "UVDX", step: 0.01}, this.meshMaterial.uniforms.uvdx, "value", -1,0);
        //events.emit("add_gui", {folder: "UVDY", step: 0.01}, this.meshMaterial.uniforms.uvdy, "value", -1,1);
       //let material = new THREE.MeshBasicMaterial( { color: 0x0000ff , wireframe: true} );

        this.mesh = new THREE.Mesh( geometry, this.meshMaterial );
//        console.log("Character mesh ", this.mesh);
        this.wire = new THREE.Mesh( geometry, this.linesMaterial );

        //DebugUtil.positionObject(this.wire, this.properties.fileName + " - Wire", false);

        this.wire.position.z = 0.01;

        this.mesh.scale.set(this.properties.scale, this.properties.scale, this.properties.scale);
        this.wire.scale.set(this.properties.scale, this.properties.scale, this.properties.scale);



       /*

        if (scene) {
            var bbox = new THREE.BoundingBoxHelper( this.mesh, 0xff0000  );
            bbox.update();
            scene.add( bbox );
        }*/
    }
    load() {
        this.video.src = this.properties.fileName;
        this.video.load();
    }
    unload() {
        this.pause();
        this.video.src = "";
    }

    buildMeshGeometry() {
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

                this.meshMaterial.uniforms.map.value = this.videoTexture;

                this.linesMaterial.uniforms.map.value = this.videoTexture;

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
        this.meshMaterial.uniforms.opacity.value = opacity;
        this.linesMaterial.uniforms.opacity.value = Math.min(opacity,0.1);
    }
};
