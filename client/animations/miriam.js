import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import EndArrayPlugin from '../util/EndArrayPlugin'
import DebugUtil from '../util/debug'
TweenPlugin.activate([EndArrayPlugin]);

export default class MiriamAnimation extends THREE.Object3D {
    constructor( renderer ) {
        super();
        this.BASE_PATH = 'assets/animations/miriam';

        // FBO_PARTICLES
        // ref: https://github.com/Avnerus/nao-game-client/blob/master/beam.js
        const glslify = require('glslify');

        // Shaders
        this.render_fs = glslify('../shaders/miriam/render_fs.glsl');
        this.render_vs = glslify('../shaders/miriam/render_vs.glsl');
        this.simulation_fs = glslify('../shaders/miriam/simulation_fs.glsl');
        this.simulation_vs = glslify('../shaders/miriam/simulation_vs.glsl');

        this.width = 256;
        this.height = 256;

        this.renderer = renderer;
        this.maxDepth = 50.0;
    }

    initParticles( geo ) {
        this.manFigure.matrixWorldNeedsUpdate = true;

        let fboGeo = geo.clone();
        // fboGeo.applyMatrix( this.manFigure.matrixWorld );

        let data = new Float32Array( this.width * this.height * 3  );

        let points = THREE.GeometryUtils.indexedPointsInGeometry( fboGeo, this.width * this.height, this.indexArray );
        for ( var i = 0, j = 0, l = data.length; i < l; i += 3, j += 1 ) {
            data[ i ] = points[ j ].x;
            data[ i + 1 ] = points[ j ].y;
            data[ i + 2 ] = points[ j ].z;
        }
        let positions = new THREE.DataTexture( data, this.width, this.height, THREE.RGBFormat, THREE.FloatType );
        positions.needsUpdate = true;
        
        return positions;
    }

    initParticlesFirstEver( geo ) {
        this.manFigure.matrixWorldNeedsUpdate = true;

        let fboGeo = geo.clone();
        fboGeo.applyMatrix( new THREE.Matrix4().makeScale(0.1,0.1,0.1) );
        // fboGeo.applyMatrix( new THREE.Matrix4().makeTranslation(31, 6, 40) );

        // fboGeo.applyMatrix( this.manFigure.matrixWorld );
        // fboGeo.applyMatrix( new THREE.Matrix4().makeRotationY(170 * Math.PI / 180) );

        let data = new Float32Array( this.width * this.height * 3  );
        //let data = Util.getSphere(this.width * this.height, 128);

        let results = THREE.GeometryUtils.randomPointsAndIndexInGeometry( fboGeo, this.width * this.height);
        let points = results[0];
        this.indexArray = results[1];

        for ( var i = 0, j = 0, l = data.length; i < l; i += 3, j += 1 ) {
            data[ i ] = points[ j ].x;
            data[ i + 1 ] = points[ j ].y;
            data[ i + 2 ] = points[ j ].z;
        }
        let positions = new THREE.DataTexture( data, this.width, this.height, THREE.RGBFormat, THREE.FloatType );
        positions.needsUpdate = true;
        
        return positions;
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {
        this.loadingManager.itemStart("MiriamAnim");
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        // setup animation sequence
        // time: when to happen, duration: how long / fast the animation is
        this.animStart = true;
        this.sequenceConfig = [
            { time: 5, anim: ()=>{this.manAppear(10)} },           //10
            { time: 15, anim: ()=>{this.manHold(8)} },              //40
            { time: 25, anim: ()=>{this.manLean(8)} },              //65
            { time: 35, anim: ()=>{this.manCircle(8)} },           //105
            { time: 40, anim: ()=>{this.manSwirl(8)} },            //110
            { time: 45, anim: ()=>{this.manSwirl2(8)} },           //115
            { time: 50, anim: ()=>{this.manSwirl3(8)} },           //120
            { time: 55, anim: ()=>{this.manSwirlNonstop()} },      //125
            { time: 75, anim: ()=>{this.manSwirlSpeedup(46)} }     //220, 20
        ];

        let GFClockTex = tex_loader.load(this.BASE_PATH + '/images/clockUV4.jpg');
        let GFClockMat = new THREE.MeshLambertMaterial( {map: GFClockTex} );
        this.loadModelClock(this.BASE_PATH + "/models/clock_surface.js",
                            this.BASE_PATH + "/models/clock_gear.js",
                            this.BASE_PATH + "/models/clock_pointerA.js",
                            this.BASE_PATH + "/models/clock_pointerB.js",
                            GFClockMat);

        let men_figures2 = {"1": [["-1.275", "13.468", "-0.008"], ["-0.597", "13.021", "0.000"], ["-0.736", "12.368", "0.000"], ["-2.449", "12.096", "0.000"], ["-3.088", "10.404", "0.000"], ["-3.719", "7.390", "-0.126"], ["-3.975", "3.350", "-0.126"], ["-2.830", "3.793", "-0.126"], ["-2.897", "7.008", "-0.126"], ["-2.120", "9.909", "0.000"], ["-1.914", "10.638", "0.000"], ["-1.519", "9.997", "0.000"], ["-1.867", "6.765", "0.000"], ["-2.219", "1.546", "0.000"], ["-2.375", "0.810", "0.000"], ["-2.440", "-0.069", "0.000"], ["-1.440", "-0.069", "0.000"], ["-1.066", "0.715", "0.000"], ["-1.019", "1.537", "0.000"], ["-0.808", "2.924", "0.000"], ["-0.418", "6.490", "0.000"], ["0.324", "6.219", "0.000"], ["0.233", "2.685", "0.000"], ["0.309", "1.428", "0.000"], ["0.311", "0.624", "0.000"], ["0.560", "-0.069", "0.000"], ["1.560", "-0.069", "0.000"], ["1.801", "0.854", "0.000"], ["1.762", "1.476", "0.000"], ["1.768", "6.424", "0.000"], ["1.348", "9.893", "-0.043"], ["1.889", "10.713", "0.027"], ["2.078", "9.739", "0.023"], ["2.668", "7.202", "-0.091"], ["2.535", "3.913", "-0.108"], ["3.543", "3.636", "-0.108"], ["3.688", "7.404", "-0.108"], ["3.033", "10.307", "0.000"], ["2.409", "12.095", "0.000"], ["0.699", "12.389", "0.000"], ["0.492", "13.042", "0.000"], ["1.244", "13.495", "0.000"], ["1.495", "14.295", "0.000"], ["1.381", "15.069", "0.000"], ["0.764", "15.646", "0.000"], ["0.048", "15.867", "0.000"], ["-0.718", "15.695", "0.041"], ["-1.170", "15.157", "0.041"]], "2": [["-1.029", "13.441", "1.233"], ["-0.573", "13.148", "1.053"], ["-0.771", "12.510", "0.789"], ["-2.449", "12.186", "0.531"], ["-3.381", "10.497", "0.025"], ["-3.781", "6.732", "2.982"], ["-0.731", "3.824", "6.626"], ["-0.665", "3.454", "6.073"], ["-3.008", "5.456", "2.829"], ["-2.182", "9.928", "-0.025"], ["-1.914", "10.697", "0.080"], ["-1.784", "10.027", "-0.022"], ["-1.867", "6.222", "-0.366"], ["-2.219", "1.546", "-0.124"], ["-2.375", "0.810", "-0.124"], ["-2.440", "-0.069", "0.004"], ["-1.440", "-0.069", "0.004"], ["-1.066", "0.715", "-0.124"], ["-1.019", "1.537", "-0.124"], ["-0.808", "2.924", "-0.152"], ["-0.420", "6.410", "-0.264"], ["0.331", "6.133", "-0.261"], ["0.233", "2.685", "-0.152"], ["0.309", "1.428", "-0.124"], ["0.311", "0.624", "-0.124"], ["0.560", "-0.069", "0.004"], ["1.560", "-0.069", "0.004"], ["1.801", "0.854", "-0.124"], ["1.762", "1.476", "-0.124"], ["1.768", "5.881", "-0.366"], ["1.565", "9.927", "-0.077"], ["1.889", "10.774", "0.127"], ["2.298", "9.683", "-0.052"], ["2.739", "5.531", "2.714"], ["0.485", "3.523", "6.075"], ["0.560", "3.859", "6.588"], ["3.757", "6.668", "3.056"], ["3.325", "10.235", "0.004"], ["2.409", "12.182", "0.522"], ["1.004", "12.550", "0.795"], ["0.704", "13.171", "1.061"], ["1.070", "13.488", "1.235"], ["1.553", "14.172", "1.901"], ["1.439", "14.689", "2.550"], ["0.822", "15.041", "3.050"], ["0.106", "15.181", "3.222"], ["-0.808", "14.956", "2.917"], ["-1.284", "14.530", "2.273"]], "3": [["1.229", "12.162", "2.879"], ["1.392", "11.560", "2.520"], ["0.825", "11.355", "2.001"], ["-1.350", "12.537", "2.634"], ["-3.122", "10.409", "0.277"], ["-3.898", "7.217", "2.537"], ["-0.731", "3.824", "6.622"], ["-0.665", "3.454", "6.069"], ["-3.148", "6.250", "2.001"], ["-1.816", "9.482", "0.234"], ["-0.708", "10.219", "0.796"], ["-1.080", "9.320", "0.192"], ["-2.431", "6.286", "0.062"], ["-2.340", "1.573", "-0.235"], ["-2.424", "0.814", "-0.127"], ["-2.440", "-0.069", "0.000"], ["-1.440", "-0.069", "0.000"], ["-1.066", "0.715", "-0.128"], ["-1.019", "1.537", "-0.128"], ["-0.808", "2.924", "-0.156"], ["-0.763", "6.410", "-0.268"], ["-0.012", "6.133", "-0.265"], ["0.233", "2.685", "-0.156"], ["0.309", "1.428", "-0.128"], ["0.311", "0.624", "-0.128"], ["0.560", "-0.069", "0.000"], ["1.560", "-0.069", "0.000"], ["1.801", "0.854", "-0.128"], ["1.762", "1.973", "-0.128"], ["1.768", "5.881", "-0.004"], ["2.199", "8.617", "0.729"], ["2.687", "7.856", "1.199"], ["3.296", "6.316", "2.159"], ["2.308", "4.830", "3.732"], ["0.485", "3.523", "6.071"], ["0.560", "3.859", "6.584"], ["3.508", "6.175", "3.541"], ["3.590", "8.520", "1.658"], ["3.241", "9.385", "1.829"], ["2.448", "10.353", "1.916"], ["2.219", "10.586", "2.537"], ["2.624", "10.445", "2.822"], ["3.214", "10.306", "3.702"], ["3.312", "10.534", "4.502"], ["3.017", "11.091", "5.100"], ["2.609", "11.682", "5.313"], ["2.035", "12.274", "5.051"], ["1.668", "12.554", "4.488"]], "4": [["1.386", "13.002", "1.584"], ["1.423", "13.212", "-0.134"], ["0.217", "12.537", "-0.511"], ["-1.667", "11.780", "-0.604"], ["-3.176", "10.981", "-0.601"], ["-4.194", "9.301", "0.598"], ["-4.692", "7.968", "1.621"], ["-4.663", "6.546", "2.549"], ["-3.918", "6.351", "1.852"], ["-3.275", "6.524", "0.980"], ["-2.442", "6.798", "-0.165"], ["-1.833", "6.680", "-1.015"], ["-1.886", "4.721", "-1.362"], ["-1.816", "2.699", "-1.268"], ["-1.407", "1.493", "-1.040"], ["-1.064", "0.907", "-0.882"], ["-0.550", "0.593", "-0.719"], ["-0.093", "0.958", "-0.613"], ["0.153", "1.847", "-0.564"], ["0.297", "2.756", "-0.633"], ["0.509", "3.337", "-0.697"], ["0.827", "3.625", "-0.702"], ["1.101", "2.975", "-0.594"], ["1.250", "1.971", "-0.528"], ["1.397", "1.232", "-0.409"], ["1.650", "0.849", "-0.107"], ["2.095", "0.932", "0.302"], ["2.691", "1.657", "0.622"], ["3.031", "3.341", "0.688"], ["3.136", "4.971", "1.343"], ["3.095", "5.103", "2.158"], ["3.127", "4.124", "2.696"], ["3.028", "2.660", "2.963"], ["1.376", "1.942", "3.830"], ["0.123", "1.834", "4.437"], ["-2.660", "1.921", "5.809"], ["-1.289", "3.151", "5.976"], ["3.301", "4.925", "4.479"], ["4.374", "6.323", "3.380"], ["4.143", "7.252", "2.876"], ["3.767", "8.254", "2.483"], ["3.321", "9.205", "2.386"], ["3.105", "9.985", "2.984"], ["3.558", "9.851", "4.949"], ["3.946", "9.517", "7.782"], ["2.436", "11.266", "5.564"], ["1.812", "11.975", "4.178"], ["1.570", "12.249", "3.543"]], "5": [["4.731", "11.922", "1.742"], ["3.352", "12.260", "0.637"], ["1.585", "12.488", "-0.072"], ["-0.180", "12.361", "-0.330"], ["-1.746", "12.012", "-0.161"], ["-3.101", "11.438", "0.380"], ["-4.110", "10.678", "1.202"], ["-4.715", "9.951", "2.197"], ["-5.041", "9.181", "3.218"], ["-5.221", "8.338", "4.075"], ["-5.234", "7.468", "4.587"], ["-5.116", "6.650", "4.677"], ["-4.917", "5.987", "4.397"], ["-4.665", "5.596", "3.883"], ["-4.366", "5.570", "3.267"], ["-4.044", "5.933", "2.609"], ["-3.764", "6.616", "1.910"], ["-3.521", "7.473", "1.161"], ["-3.165", "8.332", "0.388"], ["-2.567", "9.115", "-0.346"], ["-1.773", "9.654", "-0.967"], ["-0.823", "9.838", "-1.430"], ["0.242", "9.766", "-1.710"], ["1.362", "9.563", "-1.783"], ["2.430", "9.244", "-1.602"], ["3.323", "8.862", "-1.114"], ["3.919", "8.419", "-0.292"], ["4.105", "7.865", "0.832"], ["4.001", "7.169", "2.148"], ["3.712", "6.327", "3.464"], ["2.971", "5.308", "4.356"], ["1.738", "4.304", "5.025"], ["0.317", "3.444", "5.793"], ["-0.945", "2.972", "6.437"], ["-1.786", "2.737", "6.843"], ["-2.154", "2.708", "7.187"], ["-1.991", "2.860", "7.498"], ["-1.349", "3.143", "7.781"], ["-0.380", "3.554", "8.020"], ["0.711", "4.119", "8.126"], ["1.752", "4.796", "8.102"], ["2.732", "5.445", "7.974"], ["3.590", "6.166", "7.746"], ["4.334", "6.965", "7.337"], ["4.947", "7.879", "6.725"], ["5.337", "8.947", "5.912"], ["5.636", "10.116", "4.911"], ["5.075", "11.271", "3.158"]], "6": [["3.516", "11.720", "6.238"], ["3.957", "12.425", "4.862"], ["4.146", "12.871", "3.215"], ["3.789", "12.946", "1.697"], ["3.119", "12.593", "0.539"], ["2.546", "11.850", "-0.215"], ["2.170", "10.829", "-0.718"], ["1.953", "9.687", "-1.128"], ["1.555", "8.591", "-1.392"], ["0.793", "7.672", "-1.438"], ["-0.222", "6.968", "-1.246"], ["-1.166", "6.423", "-0.878"], ["-1.748", "5.947", "-0.530"], ["-1.822", "5.493", "-0.350"], ["-1.357", "5.081", "-0.396"], ["-0.350", "4.783", "-0.645"], ["1.083", "4.701", "-0.984"], ["2.498", "4.930", "-1.056"], ["3.614", "5.498", "-0.747"], ["4.322", "6.317", "-0.120"], ["4.680", "7.196", "0.716"], ["4.890", "7.943", "1.673"], ["5.023", "8.454", "2.820"], ["5.010", "8.705", "4.158"], ["4.785", "8.684", "5.431"], ["4.351", "8.368", "6.526"], ["3.696", "7.760", "7.370"], ["2.835", "6.930", "7.886"], ["1.750", "5.994", "7.991"], ["0.053", "5.078", "7.667"], ["-1.684", "4.295", "6.835"], ["-2.565", "3.725", "5.489"], ["-3.181", "3.392", "4.213"], ["-3.773", "3.260", "3.216"], ["-4.224", "3.267", "2.490"], ["-4.581", "3.358", "2.155"], ["-4.894", "3.504", "2.255"], ["-5.132", "3.693", "2.745"], ["-5.196", "3.924", "3.552"], ["-4.994", "4.209", "4.567"], ["-4.586", "4.570", "5.648"], ["-4.149", "5.029", "6.648"], ["-3.506", "5.601", "7.483"], ["-2.504", "6.297", "8.071"], ["-1.234", "7.122", "8.397"], ["0.092", "8.083", "8.442"], ["1.245", "9.164", "8.197"], ["2.415", "10.320", "7.895"]], "7": [["0.073", "9.635", "9.552"], ["1.662", "9.999", "9.517"], ["3.265", "10.361", "9.051"], ["4.449", "10.550", "8.072"], ["5.117", "10.627", "6.851"], ["5.349", "10.570", "5.720"], ["5.322", "10.441", "4.716"], ["5.215", "10.131", "3.830"], ["4.929", "9.689", "2.921"], ["4.382", "9.076", "1.977"], ["3.608", "8.310", "1.088"], ["2.763", "7.682", "0.342"], ["2.089", "7.253", "-0.135"], ["1.752", "6.790", "-0.290"], ["1.820", "6.170", "-0.117"], ["2.300", "5.395", "0.425"], ["3.086", "4.548", "1.342"], ["3.739", "3.904", "2.500"], ["4.066", "3.386", "3.747"], ["4.056", "3.015", "4.930"], ["3.757", "2.918", "5.967"], ["3.255", "3.031", "6.894"], ["2.481", "3.209", "7.756"], ["1.398", "3.575", "8.492"], ["0.205", "4.043", "8.923"], ["-1.011", "4.522", "8.985"], ["-2.187", "5.011", "8.636"], ["-3.227", "5.324", "7.880"], ["-4.029", "5.460", "6.709"], ["-4.543", "5.440", "5.022"], ["-4.905", "4.944", "3.213"], ["-4.238", "4.789", "1.700"], ["-3.132", "4.969", "0.408"], ["-1.790", "5.239", "-0.533"], ["-0.623", "5.694", "-0.915"], ["-0.119", "6.128", "-1.105"], ["-0.135", "6.544", "-1.208"], ["-0.673", "6.939", "-1.220"], ["-1.828", "7.335", "-1.072"], ["-3.289", "7.755", "-0.544"], ["-4.249", "8.101", "0.489"], ["-5.001", "8.463", "1.534"], ["-5.522", "8.783", "2.669"], ["-5.622", "9.029", "3.936"], ["-5.289", "9.336", "5.248"], ["-4.390", "9.437", "6.587"], ["-3.280", "9.550", "7.707"], ["-2.236", "9.410", "8.929"]]};

        // ORGANIZEING THE DATA
        let men_figures_vec = {}, men_figures_points=[];
        let m_f_size = Object.keys(men_figures2).length;

        for(let i=1; i<=m_f_size; i++) {
            men_figures_vec[i] = [];

            for(let j=0; j<men_figures2[i].length; j++){
                let newVector = new THREE.Vector3( Number(men_figures2[i][j][0]),
                                                   Number(men_figures2[i][j][1]),
                                                   Number(men_figures2[i][j][2]) );
                // scale down
                    newVector.multiplyScalar(0.3);
                men_figures_vec[i].push( newVector );
            }
        }

        // CREATE CURVE
        let manMaterial = new THREE.MeshLambertMaterial({color: 0xff0000, morphTargets: true, transparent: true, opacity: 0});
        let m_f_size2 = Object.keys(men_figures_vec).length;

        for(let i=1; i<=m_f_size2; i++) {
            let manSpline = new THREE.CatmullRomCurve3( men_figures_vec[i] );
            manSpline.type = 'catmullrom';
            manSpline.closed = true;
            // let manCurve = manSpline.getPoints( 50 );
            men_figures_points.push(manSpline);
        }
 
        let curveColors = [];
        this.manGeometries = [];

        let manGeometry = new THREE.TubeGeometry( men_figures_points[0], 100, 0.05, 2, true);
        this.manGeometries.push( manGeometry );
        
        // console.log("manGeometry.vertices.length: " + manGeometry.vertices.length);
        for(let i=1; i<men_figures_points.length; i++){
            let manGeometry2 = new THREE.TubeGeometry( men_figures_points[i], 100, 0.05, 2, true);
            let nameee = 't'+(i-1);
            manGeometry.morphTargets[i-1] = {name: nameee, vertices: manGeometry2.vertices};
            this.manGeometries.push(manGeometry2);
        }
        manGeometry.computeMorphNormals();

        this.manFigure = new THREE.Mesh(manGeometry, manMaterial);
        // manFigure.scale.set(80,80,80);
        // manFigure.rotation.y = Math.PI;
        this.manFigure.position.set(1,0,-2);
        this.add( this.manFigure );

        // this.manFigure.matrixWorldNeedsUpdate = true;

        this.dummy={timeScaleValue:0};

        this.completeSequenceSetup();

        // FBO_PARTICLES
        let positions = this.initParticlesFirstEver( this.manGeometries[0] );
        let morphPositions = this.initParticles( this.manGeometries[1] );
        this.rttIn = positions;

        this.simulationShader = new THREE.ShaderMaterial({
            uniforms: {
                positions: { type: "t", value: positions },
                timer: { type: "f", value: 0 },
                maxDepth : { type: "f", value: this.maxDepth },
                morphPositions: { type: "t", value: morphPositions },
                maxDistance: { type: "f", value: 50 },
                amplitude: { type: "f", value: 0.001 },
                frequency: { type: "f", value: 0.8 }
            },
            vertexShader: this.simulation_vs,
            fragmentShader:  this.simulation_fs,
        });

        this.renderShader = new THREE.ShaderMaterial( {
            uniforms: {
                positions: { type: "t", value: null },
                pointSize: { type: "f", value: 1 }
            },
            vertexShader: this.render_vs,
            fragmentShader: this.render_fs,
            transparent: true,
            blending:THREE.AdditiveBlending
        } );

        // Particle geometry? Just once particle
        var particleGeometry  = new THREE.Geometry();
        particleGeometry.vertices.push( new THREE.Vector3() );

        this.fbo = new FBO();
        this.fbo.init( this.width,this.height, this.renderer, this.simulationShader, this.renderShader, particleGeometry );
        this.add( this.fbo.particles );
        this.fbo.particles.position.set(1,0,-2);

        this.timerAnim = null;

        this.fbo.update();

        //
        this.loadingManager.itemEnd("MiriamAnim");
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    manAppear (_duration) {
        this.manFigure.material.opacity = 1;
        // TweenMax.to( this.manFigure.scale, _duration, { x:1,y:1,z:1, ease: Power3.easeOut } );
        TweenMax.fromTo( this.manFigure.scale, _duration, {x:0.01,y:0.01,z:0.01}, { x:1,y:1,z:1, ease: Power1.easeOut } );
    }
    manHold (_duration) {
        let tmpEndArray = [1,0,0,0,0,0];
        TweenMax.to( this.manFigure.morphTargetInfluences, _duration, { endArray: tmpEndArray, ease: Power1.easeInOut } );
    }
    manLean (_duration) {
        let tmpEndArray = [0,1,0,0,0,0];
        TweenMax.to( this.manFigure.morphTargetInfluences, _duration, { endArray: tmpEndArray, ease: Power1.easeInOut } );
    }
    manCircle (_duration) {
        let tmpEndArray = [0,0,1,0,0,0];
        TweenMax.to( this.manFigure.morphTargetInfluences, _duration, { endArray: tmpEndArray, ease: Power1.easeInOut } );
    }
    manSwirl (_duration) {
        let tmpEndArray = [0,0,0,1,0,0];
        TweenMax.to( this.manFigure.morphTargetInfluences, _duration, { endArray: tmpEndArray } );
    }
    manSwirl2 (_duration) {
        let tmpEndArray = [0,0,0,0,1,0];
        TweenMax.to( this.manFigure.morphTargetInfluences, _duration, { endArray: tmpEndArray } );
    }
    manSwirl3 (_duration) {
        let tmpEndArray = [0,0,0,0,0,1];
        TweenMax.to( this.manFigure.morphTargetInfluences, _duration, { endArray: tmpEndArray } );
    }
    manSwirlNonstop () {
        this.tl = new TimelineMax({repeat: -1});
        this.tl.to( this.manFigure.morphTargetInfluences, 4, { endArray: [0,0,0,1,0,0], onStart: ()=>{
                    this.updateMorphForFBO( this.manGeometries[4], this.dummy.timeScaleValue*2 );
                    // console.log("updateMorphForFBO with manGeometries[4], duration: " + this.dummy.timeScaleValue);
               } })
               .to( this.manFigure.morphTargetInfluences, 4, { endArray: [0,0,0,0,1,0], onStart: ()=>{
                    this.updateMorphForFBO( this.manGeometries[5], this.dummy.timeScaleValue*2 );
                    // console.log("updateMorphForFBO with manGeometries[5], duration: " + this.dummy.timeScaleValue);
               } })
               .to( this.manFigure.morphTargetInfluences, 4, { endArray: [0,0,0,0,0,1], onStart: ()=>{
                    this.updateMorphForFBO( this.manGeometries[6], this.dummy.timeScaleValue*2 );
                    // TweenMax.to( this.manFigure.rotation, 4, { y:"-="+Math.PI } );
                    // TweenMax.to( this.fbo.particles.rotation, 4, { y:"-="+Math.PI } );

                    // console.log("updateMorphForFBO with manGeometries[6], duration: " + this.dummy.timeScaleValue);
               } });
    }
    manSwirlSpeedup (_duration) {
        TweenMax.to( this.dummy, _duration, { timeScaleValue: 50,
                                       ease: Power2.easeIn,
                                       onStart: ()=>{
                                                    TweenMax.to( this.manFigure.scale, _duration, { x:2,y:2,z:2, ease: Expo.easeIn } );
                                                    TweenMax.to( this.manFigure.position, _duration, { y:"-=2", ease: Power3.easeIn } );
                                                    TweenMax.to( this.fbo.particles.scale, _duration, { x:2,y:2,z:2, ease: Expo.easeIn } );
                                                    this.speedUpStart = true;
                                                },
                                       onUpdate: ()=>{
                                                    this.tl.timeScale(this.dummy.timeScaleValue);
                                                    
                                                    // this.simulationShader.uniforms.amplitude.value = (this.manFigure.scale.x/250);

                                                    // this.simulationShader.uniforms.frequency.value *= (this.manFigure.scale.x);
                                                },
                                       onComplete: ()=>{
                                                       console.log("fastest!");
                                                       this.tl.kill();
                                                       // TweenMax.to( this.manFigure.scale, 2, { x:0.01,y:0.01,z:0.01, ease: Back.easeInOut, onComplete: ()=>{this.tl.kill()} } );
                                                       TweenMax.to( this.manFigure.scale, 1, { x:0.01,y:0.01,z:0.01, ease: Back.easeInOut } );
                                                       TweenMax.to( this.parent.fullVideo.mesh.scale, 1, { x:0.00001,y:0.00001,z:0.00001, ease: Back.easeInOut, onComplete: ()=>{
                                                            this.parent.fullVideo.setOpacity(0.0);
                                                       } } );
                                                    } } );
    }

    loadModelClock (model, modelB, modelC, modelD, meshMat) {

        let loader = new THREE.JSONLoader(this.loadingManager);
        let cloMat = meshMat;
        let myClock = new THREE.Object3D();
        this.myCP1 = new THREE.Object3D();
        this.myCP2 = new THREE.Object3D();
        this.grandFatherClock = new THREE.Object3D();
        this.pointer1Time = 0;
        this.pointer2Time = 0;

        loader.load(model, (geometry, material)=>{
            geometry.center();
            let cFace = new THREE.Mesh(geometry, cloMat);
            cFace.scale.set(1, 1, 1.7);
            cFace.position.set(0, 0, 3.1);
            myClock.add(cFace);
        });

        loader.load(modelB, (geometryB, material)=>{
            geometryB.center();
            this.transY(geometryB, 27);
            this.cGear = new THREE.Mesh(geometryB, cloMat);
            let myGear = new THREE.Object3D();
            myGear.add(this.cGear);
            myGear.rotation.z = -Math.PI/5;
            myClock.add(myGear);
        });

        loader.load(modelC, (geometryC, material)=>{
            geometryC.center();
            let cP1 = new THREE.Mesh(geometryC, cloMat);
            cP1.position.set(-2.2, 0, 6);
            cP1.scale.set(1, 1, 2.5);
            this.myCP1.add(cP1);
            myClock.add(this.myCP1);
            //
            // TweenMax.to(this.myCP1.rotation, 0.5, {z:"+="+0.1, repeat:-1, repeatDelay:2});
        });

        loader.load(modelD, (geometryD, material)=>{
            geometryD.center();
            let cP2 = new THREE.Mesh(geometryD, cloMat);
            cP2.position.set(0,12,3);
            cP2.scale.set(1, 1, 2.5);
            this.myCP2.add(cP2);
            myClock.add(this.myCP2);
            //
            // TweenMax.to(this.myCP2.rotation, 0.5, {z:"+="-0.1, repeat:-1, repeatDelay:2.6});

            myClock.position.y = -80;
            this.grandFatherClock.add(myClock);

            for(let i=0; i<6; i++){
                let geoTemp = new THREE.CylinderGeometry(0.5 ,0.5 ,90);
                let bar = new THREE.Mesh(geoTemp, cloMat);
                bar.position.y = -15;
                bar.position.x = i*3 - 8;
                this.grandFatherClock.add(bar);
            }

            this.grandFatherClock.scale.multiplyScalar(0.01);
            this.grandFatherClock.position.set(1, 3, -1.5);
            // this.grandFatherClock.rotation.y = Math.PI;
            //DebugUtil.positionObject(this.grandFatherClock, "Clock")

            this.add(this.grandFatherClock);

        });

    }

    transX(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].x += n;
        }
    }

    transZ(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].z += n;
        }
    }

    transY(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].y += n;
        }
    }

    updateMorphForFBO(geo, speedUp) {
        let morphPositions = this.initParticles( geo );
        let timerSpeed = 8/((speedUp+12.5)/12.5);

        // if(this.timerAnim!=null)
        //     this.timerAnim.kill();

        this.simulationShader.uniforms.morphPositions.value = morphPositions;

        if(!this.speedUpStart)
            this.timerAnim = TweenMax.fromTo(this.simulationShader.uniforms.timer, timerSpeed, {value:0}, {value:1, ease: Expo.easeInOut});
        else
            this.timerAnim = TweenMax.fromTo(this.simulationShader.uniforms.timer, timerSpeed, {value:0}, {value:1, ease: Expo.easeOut});
    }

    updateVideoTime(time) {
        if (this.nextAnim && time >= this.nextAnim.time) {
            console.log("Miriam - do anim sequence ", this.nextAnim);
            this.nextAnim.anim();
            let index = this.sequenceConfig.indexOf(this.nextAnim);
            if (index < this.manGeometries.length -1) {
                this.updateMorphForFBO( this.manGeometries[index], 0 );
            }
            if (this.currentSequence.length > 0) {
                this.nextAnim = this.currentSequence.shift();
            } else {
                this.nextAnim = null;
            }
        }
    }

    start() {
        this.currentSequence = this.sequenceConfig.slice(0);
        this.nextAnim = this.currentSequence.shift();
    }

    update(dt,et) {
        this.grandFatherClock.rotation.z = Math.sin(et*1000 / 1000) * (Math.PI/10);
        this.cGear.rotation.y += 0.008;
        if(this.pointer1Time + 1.2 < et ){
            this.myCP1.rotation.z += 0.1;
            this.pointer1Time = et;
        }

        if(this.pointer2Time + 2 < et ){
            this.myCP2.rotation.z -= 0.1;
            this.pointer2Time = et;
        }

        // FBO
        this.fbo.update();

    }
}
