/**
 * @author mrdoob / http://mrdoob.com
 * @modified by obviousjim / http://specular.cc
 * @modified by avnerus / http://avner.js.org
 * @modified by juniorxsound / http://orfleisher.com
 */
const SEC_PER_RGBD_FRAME = 1 / 25;

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

    init() {
        this.video = document.createElement( 'video' );
        this.video.loop = false;
        let imageTexture = new THREE.TextureLoader().load(this.properties.basePath + '.png' );

        let precision = 3;
        let linesGeometry = new THREE.Geometry();

        for ( let y = 240; y > - 240; y -= precision ) {

            for (let x = - 320, x2 = - 320 + precision; x < 320; x += precision, x2 += precision ) {
                linesGeometry.vertices.push( new THREE.Vector3( x, y, 0 ) );
                linesGeometry.vertices.push( new THREE.Vector3( x2, y, 0 ) );
            }
        }

        let pointsGeometry = new THREE.Geometry();

        for ( let y = 240; y > - 240; y -= precision ) {

            for ( let x = - 320; x < 320; x += precision ) {

                pointsGeometry.vertices.push( new THREE.Vector3( x, y, 0 ) );

            }
        }

        this.isPlaying = false;
        this.videoTexture = new THREE.Texture( this.video );
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;
        this.videoTexture.generateMipmaps = false;

        this.linesMaterial = new THREE.ShaderMaterial( {

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
            wireframe: true,
            transparent: true

        } );

        this.linesMaterial.linewidth = 1;

        this.add( new THREE.Line( linesGeometry, this.linesMaterial, THREE.LineSegments ) );

        this.pointsMaterial = new THREE.ShaderMaterial( {

            uniforms: {

                "map": { type: "t", value: imageTexture },
                "opacity": { type: "f", value: 0.95 },
                "mindepth" : { type : "f", value : this.properties.mindepth },
                "maxdepth" : { type : "f", value : this.properties.maxdepth }
            },

            vertexShader: this.rgbd_vs,
            fragmentShader: this.rgbd_fs,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true

        } );

        this.add( new THREE.Points( pointsGeometry, this.pointsMaterial ) );
    }

    play() {
            if ( this.isPlaying === true ) return;

            this.video.src = this.properties.basePath + '.webm';
            this.video.play();
            this.isPlaying = true;
    }
    update(dt) {
        this.timer += dt;
        if (this.timer >= SEC_PER_RGBD_FRAME) {
            this.timer = 0;
            if ( this.isPlaying && this.video.readyState === this.video.HAVE_ENOUGH_DATA ) {

                this.linesMaterial.uniforms.map.value = this.videoTexture;
                this.pointsMaterial.uniforms.map.value = this.videoTexture;

                this.videoTexture.needsUpdate = true;

            }
        }
    }
    pause() {
        if ( this.isPlaying === false ) return;

        this.video.src = this.properties.basePath + '.png';
        this.video.pause();
        this.isPlaying = false;

    };

    isPlaying() {
        return this.isPlaying;
    };
};
