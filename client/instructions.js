import DebugUtil from './util/debug'
import {MeshText2D, textAlign} from './lib/text2d/index'

export default class Instructions {
    constructor(config, camera, square, soundManager) {
        this.config = config;
        this.camera = camera;
        this.square = square;

        this.soundManager = soundManager;

        this.lines_eng = [
            ["You are in one of the most","iconic landmarks of Tel Aviv."],
            ["This place no longer exists."],
            ["On January 2017", "it was demolished."],
            ["It was a space that", "attracted outsiders"],
            ["united only by their solitude."],
            ["The time is now"],
            ["but you can change it if", "you focus on one of the", "suns above you."]
        ];

        this.lines_heb = [
            ["הגעת אל אחד מסמליה",".החשובים של העיר תל אביב"],
            [".מקום זה אינו קיים עוד"],
            [",בינואר 2017", ".הוצאה לפועל הריסתו"],
            ["מרחב זה קיבץ", ".את אנשי השוליים של החברה"],
            [".שותפים לבדידות היומיומית"],
            [".השעה: עכשיו"],
            ["התמקדות באחת השמשות שמעליך", ".תאפשר שינוי של הזמן"]
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
        this.instructionText = new MeshText2D(" ", TEXT_DEFINITION);
        if (this.config.platform == "desktop") {
            this.instructionText.scale.multiplyScalar(0.00005);
            this.instructionText.position.set(0, 0, -0.1001);
        } else {
            this.instructionText.scale.multiplyScalar(0.0022);
            this.instructionText.position.set(0, 0, -2.6);
        }
        this.instructionText.material.opacity = 0;

        //DebugUtil.positionObject(this.instructionText, "Instrucitons text");

        this.instructionLineTwo = new MeshText2D(" ", TEXT_DEFINITION);
        this.instructionLineTwo.material.opacity = 0;
        this.instructionLineTwo.position.set(0,-100,0);
        this.instructionText.add(this.instructionLineTwo);

        this.instructionLineThree = new MeshText2D(" ", TEXT_DEFINITION);
        this.instructionLineThree.material.opacity = 0;
        this.instructionLineThree.position.set(0,-200,0);
        this.instructionText.add(this.instructionLineThree);

        

        this.loadInstructionSound(this.config.assetsHost + "assets/sound/instruction.ogg").then((result)=>{
            this.instructionSound = result;
        });

        console.log("Instructions initialized");
    }

    start() {
        this.lines = this.config.language == "heb" ? this.lines_heb : this.lines_eng;
        if (this.config.skipInstructions) {
            setTimeout(() => {
                console.log("Instructions skipping");
                if (this.config.platform == "vive") {
                    events.emit("delayed_rotation", true);
                }
                events.emit("instructions_end");
                this.square.extras.showExtras();

            },1000);
        } else {
            console.log("Instructions starting");
            this.camera.add(this.instructionText);
            this.playLines();
        }
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
        this.instructionSound.play();
        if (texts.length > 1) {
            this.instructionLineTwo.text = texts[1];
            this.instructionSound.play();
        } else {
            this.instructionLineTwo.text = " ";
        }
        if (texts.length > 2) {
            this.instructionLineThree.text = texts[2];
            this.instructionSound.play();
        } else {
            this.instructionLineThree.text = " ";
        }
        let delay = Math.max(5000,2500 * texts.length);

        TweenMax.to( this.instructionLineTwo.material, 1, { opacity: 1});
        TweenMax.to( this.instructionLineThree.material, 1, { opacity: 1});
        TweenMax.to( this.instructionText.material, 1, { opacity: 1, 
            onComplete: () => {
                setTimeout(() => {
                    this.instructionSound.stop();
                    this.hideLine();
                },delay);
            } 
        });
    }
    hideLine() {
        TweenMax.to( this.instructionLineTwo.material, 1, { opacity: 0});
        TweenMax.to( this.instructionLineThree.material, 1, { opacity: 0});
        TweenMax.to( this.instructionText.material, 1, { opacity: 0, 
            onComplete: () => {
                setTimeout(() => {
                    this.currentLine++;
                    if (this.currentLine == 3 && this.config.platform == "vive") {
                        setTimeout(() => {
                            events.emit("delayed_rotation", false);
                        },4000);
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
        this.instructionLineThree.material.dispose();
        this.instructionSound.unload();
    }
    loadInstructionSound(path) {
        return new Promise((resolve, reject) => {
            console.log("Loading Instruction sound", path);
            this.soundManager.createStaticSoundSampler(path, (sampler) => {
                console.log("Loaded Instruction sound", sampler);                              
                this.soundManager.panorama.append(sampler);
                resolve(sampler);
            });
        });
    }
}

