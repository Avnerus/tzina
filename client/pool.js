import GeometryUtils from './util/GeometryUtils'
import FBO from './util/fbo'

export default class Pool extends THREE.Object3D {
        constructor(renderer) {
            super();
            this.renderer = renderer;

            const glslify = require('glslify');

            // Shaders
            this.render_fs = glslify('./shaders/pool/render_fs.glsl');
            this.render_vs = glslify('./shaders/pool/render_vs.glsl');
            this.simulation_fs = glslify('./shaders/pool/simulation_fs.glsl');
            this.simulation_vs = glslify('./shaders/pool/simulation_vs.glsl');
            this.pool_fs = glslify('./shaders/pool/pool_fs.glsl');
            this.pool_vs = glslify('./shaders/pool/pool_vs.glsl');
            console.log("Pool vertex shader", this.pool_vs);
        }
        init(loadingManager) {
            this.size = 10; // waterSurface diameter
            this.circle = new THREE.CircleGeometry( this.size, 64 );
            this.initLights();
            this.initWaves();
            this.initUniforms();
            // Initialize particle systems
            this.positions = this.initParticles();
            this.initParticleParents();
            this.initCircularWaves();
            this.initMaterials();
        }

        initLights() {

          // end of throw away
        }

        initWaves() {
          // setup random strengths for initial circular waves
          // really ugly, but these will be passed to the shader
          this.circularWaveStrength1 = Math.random();
          this.circularWaveStrength2 = Math.random();
          this.circularWaveStrength3 = Math.random();
          this.circularWaveStrength4 = Math.random();
          this.circularWaveStrength5 = Math.random();
          this.circularWaveStrength6 = Math.random();
          this.circularWaveStrength7 = Math.random();
          this.circularWaveStrength8 = Math.random();
        }

        initUniforms() {
          // wave uniforms, wave lengths etc are arbitrary
          this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib['lights'],
            {
              time: { type: "f", value: 0.0 },
              timeFactor: { type: "f", value: 1.5 },
              amplitudeFactor: { type: "f", value: 0.3 },
              amplitudeDisplacementFactor: { type: "f", value: 0.0 },
              amplitudeNormalFactor: { type: "f", value: 1.0 },
              scale: { type: "f", value: 0.5 },
              wavelengths: { type: "f[]", value: [8.0, 5.0, 3.2, 2.2, 1.7, 1.3] },
              speeds: { type: "f[]", value: [0.4, 0.43, 0.47, 0.5, 0.8, 0.9] },
              amplitudes: { type: "f[]", value: [0.5, 0.45, 0.3, 0.17, 0.13, 0.05] },
              directions: { type: "v2[]", value: [
                new THREE.Vector2 ( 1.0, 0.0 ).normalize(),
                new THREE.Vector2 ( 0.5, 0.5 ).normalize(),
                new THREE.Vector2 ( 0.4, 0.7 ).normalize(),
                new THREE.Vector2 ( 0.8, 0.2 ).normalize(),
                new THREE.Vector2 ( 1.0, 0.3 ).normalize(),
                new THREE.Vector2 ( 0.0, 0.4 ).normalize()
              ] },
              circularWavelength: { type: "f", value: 0.6 },
              circularSpeed: { type: "f", value: 0.6 },
              circularWaveStrengths: { type: "f[]", value: [this.circularWaveStrength1, this.circularWaveStrength2, this.circularWaveStrength3, this.circularWaveStrength4,
                this.circularWaveStrength5, this.circularWaveStrength6,
                this.circularWaveStrength7, this.circularWaveStrength8] },
              circularWaveCenterPoints: { type: "v2[]", value: [
                this.getRandomPoint(),
                this.getRandomPoint(),
                this.getRandomPoint(),
                this.getRandomPoint(),
                this.getRandomPoint(),
                this.getRandomPoint(),
                this.getRandomPoint(),
                this.getRandomPoint()
              ] },
              circularAmplitudeFactor: { type: "f", value: 0.08 },
              circularAmplitudeDisplacementFactor: { type: "f", value: 0.0 },
              circularAmplitudeNormalFactor: { type: "f", value: 1.0 },
              circularMaxDist: { type: "f", value: 10.0 },
              minAlpha: { type: "f", value: 0.5 }, // minimum n.x = 270  * Math.PI / 180;n
              maxAlpha: { type: "f", value: 0.9 }, // maximum alpha of water
              minLightAmt: { type: "f", value: 0.05 } // ambient light
            }
          ]);
        }

        initParticles() {
          let fboGeo = new THREE.SphereGeometry(1); // initial positions are randomized within a sphere of radius 1
          var noOfParticles = 10000; // Maximum amount of particles

          let data = new Float32Array( noOfParticles );

          let points = THREE.GeometryUtils.randomPointsInGeometry(fboGeo, noOfParticles );
          for ( var i = 0, j = 0, l = data.length; i < l; i += 3, j += 1 ) {
              data[ i ] = points[ j ].x;
              data[ i + 1 ] = points[ j ].y;
              data[ i + 2 ] = points[ j ].z;
          }

          let positions = new THREE.DataTexture( data, 32, 32, THREE.RGBFormat, THREE.FloatType );
          positions.needsUpdate = true;
          return positions;
        };

        initParticleParents() {
        this.particleParents = []; // (empty) parent objects for particle systems
        this.fbos = [];
        }

        initCircularWaves() {
          this.noOfCircularWaves = 8; // if this is changed, the change must be reflected in water surface shaders
          this.particleSimulationShaders = [];
          let particleRenderShaders = []; // There WAS a reason for different declarations but I'm not too sure of that anymore. Better not touch.
          for (var i = 0; i < this.noOfCircularWaves; i++) {
            var s = new THREE.Object3D(); // empty parent object for particle system
            s.position.set( 0, 0, 0 );
            this.add(s);
            this.particleParents[i] = s;

            this.positions = this.initParticles();

            this.particleSimulationShaders[i] = new THREE.ShaderMaterial( {
              uniforms: {
                positions: { type: "t", value: this.positions },
                origin: { type: "t", value: this.positions },
                timer: { type: "f", value: 0 },
                timeFactor: {type: "f", value: 3.0 },
                orderTimer: { type: "f", value: 0.0 },
                splashTimer: { type: "f", value: 0.0 },
                forceFactor: { type: "f", value: 1.0 }
              },
              vertexShader: this.simulation_vs,
              fragmentShader: this.simulation_fs
            } );

            particleRenderShaders[i] = new THREE.ShaderMaterial( {
              uniforms: {
                  positions: { type: "t", value: null },
                  pointSize: { type: "f", value: 1.0 }
              },
              vertexShader: this.render_vs,
              fragmentShader: this.render_fs,
              transparent: true, // TODO fix shader loading
            } );
          }          

          for (var i = 0; i < this.noOfCircularWaves; i++) {
            var particleGeometry  = new THREE.Geometry();
            particleGeometry.vertices.push( new THREE.Vector3() );
            this.fbos[i] = new FBO();
            this.fbos[i].init( 32, 32, this.renderer, this.particleSimulationShaders[i], particleRenderShaders[i], particleGeometry );
            this.fbos[i].particles.renderOrder = 1;
            this.particleParents[i].add( this.fbos[i].particles );
            this.fbos[i].update();
          }
        }

        // dt = delta time, et = elapsed time
        updateParticleSystems(dt, et) {
          for(var i = 0; i < this.noOfCircularWaves; i++){
            this.particleSimulationShaders[i].uniforms.timer.value = et;
            this.fbos[i].update();
            this.particleSimulationShaders[i].uniforms.splashTimer.value -= dt;
          }
        }

        initMaterials() {
          // water material
          // TODO fix shader loading
          this.material = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: this.pool_vs,
            fragmentShader: this.pool_fs,
            transparent: true,
            lights: true
          } );

          console.log("Pool material", this.material);

          // create water surface
          this.waterSurface = new THREE.Mesh( this.circle, this.material );
          this.add( this.waterSurface );

          var tessellateModifier = new THREE.TessellateModifier(.01);      
          var tessellationDepth = 11; // decrease / increase according to performance & quality
          for(var i = 0; i < tessellationDepth; i++){
            tessellateModifier.modify(this.circle);
          }
        }

        getRandomPoint() {
          var dSquared = Math.random() * this.size * this.size;
          var theta = Math.random() * Math.PI * 2;
          var x = Math.sqrt(dSquared) * Math.cos(theta);
          var y = Math.sqrt(dSquared) * Math.sin(theta);
          return new THREE.Vector2(x, y);
        }

        update(dt,et) {
          this.uniforms.time.value = et;
          // update waves
          for(var i = 0; i < this.noOfCircularWaves; i++){
            if(this.uniforms.circularWaveStrengths.value[i] > 0) {
              this.uniforms.circularWaveStrengths.value[i] -= (dt/1.0);
            } else {
              // spawn new wave
              var center = this.getRandomPoint();
              this.particleParents[i].position.x = center.x;
              this.particleParents[i].position.y = center.y;
              this.uniforms.circularWaveCenterPoints.value[i] = center;
              this.particleSimulationShaders[i].uniforms.splashTimer.value = 10.0;
              this.uniforms.circularWaveStrengths.value[i] = Math.random()/2 + 0.5;
            }
          }
          // update particle systems
          this.updateParticleSystems(dt, et);
        }
      }
