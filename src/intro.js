import _ from 'lodash'

export default class Intro {
    constructor(camera, square, sky, soundManager, scene) {
        this.camera = camera;
        this.square = square;
        this.soundManager = soundManager;
        this.sky = sky;
        this.scene = scene;

        this.soundEvents = [
            {
                time: 10.283,
                action: () => {
                    this.showTitle()
                }
            },
            {
                time: 21.3,
                action: () => {
                    this.rotateSquare()
                    this.hideTitle();
                }
           },
           {
                time: 34.3,
                action: () => {
                    this.bringUpSun()
                }
           }
        ]

        
        /*
        this.STARTING_POSITION = new THREE.Vector3(
            312.6124548161197,
            50,
            1297.4795914541091
        );*/
        this.STARTING_POSITION = new THREE.Vector3(
            0,
            50,
            1400
        );

        this.INTRO_SOUND = 'INTRO_Shirin.ogg'

        let titlePlaneGeo = new THREE.PlaneGeometry( 1024, 128 );
        let loader = new THREE.TextureLoader();
        loader.load('assets/intro/title.png', (texture) => {
            this.titleTexture = texture;
            let material = new THREE.MeshBasicMaterial( {map: this.titleTexture, side: THREE.DoubleSide, transparent:true}  );
            this.titlePlane = new THREE.Mesh(titlePlaneGeo, material);
        });

    }

    init() {
        // Put the camera in the starting position
//        events.emit("intro_start");
        this.camera.position.copy(this.STARTING_POSITION);
        events.emit("add_gui",{}, this.camera.position, "y"); 
        
        /*

        this.titlePlane.position.copy(this.square.getCenterPosition());
        this.titlePlane.position.y = 400;
        this.titlePlane.rotation.copy(this.STARTING_ROTATION);
        

        // Load the sound
        this.soundManager.loadSound(this.INTRO_SOUND)
        .then((sound) => {
            console.log("Sound ", sound);
            this.sound = sound;

            setTimeout(() => {
                
                this.turnOnWindows();
                this.playSound(); 
                //this.zoomToSquare();

            },3000);
        }); */

    }

    bringUpSun() {
        this.sky.transitionTo(17, 22);
    }

    playSound() {
        this.sound.playIn(1);
        this.currentEvent = this.soundEvents.shift();
        //this.bringUpSun();
    }

    showTitle() {
        this.scene.add(this.titlePlane);
    }
    hideTitle() {
        this.scene.remove(this.titlePlane);
    }

    rotateSquare() {
        TweenMax.to(this.square.mesh.rotation, 34, {y: -176 * Math.PI / 180, ease: Sine.easeInOut, onComplete: () => { 
            setTimeout(() => {
                this.turnOffWindows();
                this.zoomToSquare();
            },2000)
        }});
    }


    turnOnWindows() {
        let shuffledWindows = _.shuffle(this.square.windows.children);
        console.log("INTRO: TURN ON  WINDOWS");
        let index = {
            value: 0
        }
        let lastIndex = 0;
        TweenMax.to(index, 50, {value: Math.floor((shuffledWindows.length - 1) / 3), ease: Circ.easeIn, onUpdate: (val) => {
            let currentIndex = Math.ceil(index.value);
            for (let i = lastIndex + 1; i <= currentIndex; i++) {
                shuffledWindows[i].visible = true;
            }
            lastIndex = currentIndex;
        }});
    }

    turnOffWindows() {
        let litWindows = _.filter(this.square.windows.children, _.matchesProperty('visible', true));
        console.log("INTRO: TURN OFF " + litWindows.length + "  WINDOWS");
        let index = {
            value: 0
        }
        let lastIndex = 0;
        TweenMax.to(index, 6, {value:litWindows.length - 1, ease: Circ.easeIn, onUpdate: (val) => {
            let currentIndex = Math.ceil(index.value);
            for (let i = lastIndex + 1; i <= currentIndex; i++) {
                litWindows[i].visible = false;
            }
            lastIndex = currentIndex;
        }});
    }

    zoomToSquare() {
        console.log("ZOOM TO SQUARE");
        let timeline = new TimelineMax();
        let zoomVector = new THREE.Vector3().copy(new THREE.Vector3(0, 0, 1) ).applyQuaternion(this.camera.quaternion);
        zoomVector.y = 0;
        let zoom  = {
            value: 0,
            yValue: this.camera.position.y
        }
        /*
        let targetRotation = new THREE.Euler(
            -0.047656278802702984,
            -0.08255415675631501,
            -0.00393271404071559,
            "XYZ"            
            );*/
        let targetRotation = new THREE.Euler(
            0,
            0,
            0,
            "XYZ"            
        );

        let middlePosition = {

            x: -16.788420454247046, 
            y: 10,
            z: 211.59052377108628
        };
        let endPosition = {
            x: -13.39503267959696,
            y: 10,
            z: 170.62551810949714
        };

        let startPosition;
        
        timeline.to(zoom, 14, {ease: Linear.easeNone, value: -1120, yValue: 10, onUpdate: () => {
            let zoomAdd = new THREE.Vector3().copy(zoomVector).multiplyScalar(zoom.value);
            this.camera.position.copy(this.STARTING_POSITION).add(zoomAdd);
            this.camera.position.y = zoom.yValue;
        }, onComplete: () => {
            zoomVector = new THREE.Vector3().copy(new THREE.Vector3(0, 0, 1) ).applyQuaternion(this.camera.quaternion);
            console.log("END POSITION", this.camera.position);
        }})
        .to(this.camera.position, 5, {
            bezier: [
                middlePosition,
                endPosition
            ]
        , ease: Linear.easeNone})
        .to(this.camera.rotation, 5, {x: targetRotation.x, y: targetRotation.y, z: targetRotation.z, ease: Linear.easeNone, onComplete: () => { this.endIntro() } }, "-=5" )

    }

    endIntro() {
        console.log("END INTRO");
        events.emit("intro_end");
    }

    update() {
        if (this.sound && this.sound.isPlaying && this.currentEvent) {
            if (this.sound.getCurrentTime() >= this.currentEvent.time) {
                this.currentEvent.action();
                if (this.soundEvents.length > 0) {
                    this.currentEvent = this.soundEvents.shift();
                } else {
                    this.currentEvent = null;
                }
            }
        }
    }
}
