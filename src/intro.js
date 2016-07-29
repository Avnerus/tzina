import _ from 'lodash'

export default class Intro {
    constructor(camera, square) {
        this.camera = camera;
        this.square = square;

        this.STARTING_POSITION = new THREE.Vector3(
            312.6124548161197,
            50,
            1297.4795914541091
        );

        this.STARTING_ROTATION = new THREE.Euler (
            -0.021886075735205162,
            0.29445780646733244,
            0.006352727962780677,
            'XYZ'
        );

    }

    init() {
        // Put the camera in the starting position
        events.emit("intro_start");
        this.camera.position.copy(this.STARTING_POSITION);
        this.camera.rotation.copy(this.STARTING_ROTATION);


        setTimeout(() => {
            this.turnOnWindows();
        },10000);
    }

    start() {

    }

    rotateSquare() {
        console.log("ROTATE SQUARE");
        TweenMax.to(this.square.mesh.rotation, 4, {y: 0, onComplete: () => { this.zoomToSquare() }});
    }


    turnOnWindows() {
        let shuffledWindows = _.shuffle(this.square.windows.children);
        console.log("INTRO: TURN ON " + shuffledWindows.length + " WINDOWS");
        let index = {
            value: 0
        }
        let lastIndex = 0;
        TweenMax.to(index, 5, {value: shuffledWindows.length - 1, onUpdate: (val) => {
            let currentIndex = Math.ceil(index.value);
            for (let i = lastIndex + 1; i <= currentIndex; i++) {
                shuffledWindows[i].visible = true;
            }
            lastIndex = currentIndex;
        },onComplete: () => {this.rotateSquare()}});
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
        
        timeline.to(zoom, 6, {ease: Linear.easeNone, value: -1120, yValue: 10, onUpdate: () => {
            let zoomAdd = new THREE.Vector3().copy(zoomVector).multiplyScalar(zoom.value);
            this.camera.position.copy(this.STARTING_POSITION).add(zoomAdd);
            this.camera.position.y = zoom.yValue;
        }, onComplete: () => {
            zoomVector = new THREE.Vector3().copy(new THREE.Vector3(0, 0, 1) ).applyQuaternion(this.camera.quaternion);
            console.log("END POSITION", this.camera.position);
        }})
        .to(this.camera.position, 2, {
            bezier: [
                middlePosition,
                endPosition
            ]
        })
        .to(this.camera.rotation, 2, {x: targetRotation.x, y: targetRotation.y, z: targetRotation.z, ease: Linear.easeNone, onComplete: () => { this.endIntro() } }, "-=2" )

    }

    endIntro() {
        console.log("END INTRO");
        events.emit("intro_end");
    }
}
