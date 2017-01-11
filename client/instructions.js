import DebugUtil from './util/debug'
import {MeshText2D, textAlign} from './lib/text2d/index'

export default class Instructions {
    constructor(config, camera, square) {
        this.config = config;
        this.camera = camera;
        this.square = square;

        this.lines = [
            //     ["You are in one of the most", "iconic landmarks of Tel Aviv."],
            // ["This place no longer exists.","On January 2017 it was demolished."],
                   ["It was a space that attracted outsiders,","joined only by their solitude."],
            ["The time is now, but you can change it by", "focusing on one of the suns above you."]
        ]

        this.currentLine = 0;
    }

    init(loadingManager) {
        let TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '70px Miriam Libre',
             fillStyle: '#33e5ab',
             antialias: true,
             shadow: true
        }
        this.instructionText = new MeshText2D("", TEXT_DEFINITION);
        if (this.config.platform == "desktop") {
            this.instructionText.scale.multiplyScalar(0.00005);
            this.instructionText.position.set(0, 0, -0.1001);
        } else {
            this.instructionText.scale.multiplyScalar(0.0022);
            this.instructionText.position.set(0, 0, -2);
        }
        this.instructionText.material.opacity = 0;

        this.instructionLineTwo = new MeshText2D("", TEXT_DEFINITION);
        this.instructionLineTwo.material.opacity = 0;
        this.instructionLineTwo.position.set(0,-100,0);
        this.instructionText.add(this.instructionLineTwo);

        DebugUtil.positionObject(this.instructionText, "Instructions text");
        DebugUtil.positionObject(this.instructionLineTwo, "Instructions Line Two");

        console.log("Instructions initialized");
    }

    start() {
        console.log("Instructions starting");
        this.camera.add(this.instructionText);
        this.playLines();
    }

    update(dt) {
    }

    playLines() {
        this.currentLine = 0;
        this.showNextLine();
    }

    showNextLine() {
        let texts = this.lines[this.currentLine];
        this.instructionText.text = texts[0];
        if (texts.length > 1) {
            this.instructionLineTwo.text = texts[1];
        }
        TweenMax.to( this.instructionLineTwo.material, 1, { opacity: 1});
        TweenMax.to( this.instructionText.material, 1, { opacity: 1, 
            onComplete: () => {
                setTimeout(() => {
                    //this.hideLine();
                },5000);
            } 
        });
    }
    hideLine() {
        TweenMax.to( this.instructionLineTwo.material, 1, { opacity: 0});
        TweenMax.to( this.instructionText.material, 1, { opacity: 0, 
            onComplete: () => {
                setTimeout(() => {
                    this.currentLine++;
                    if (this.currentLine == 1 && this.config.platform == "vive") {
                        events.emit("delayed_rotation");
                    }
                    if (this.currentLine < this.lines.length) {
                        this.showNextLine();
                    } else {
                        this.camera.remove(this.instructionText);
                        this.square.extras.showExtras();
                        events.emit("instructions_end");
                    }
                },2000);
            } 
        });
    }
    dispose() {
        this.instructionText.material.dispose();
        this.instructionLineTwo.material.dispose();
    }
}

