import DebugUtil from './util/debug'

export default class Show {
    constructor(config, square, characterController, timeController, soundManager) {
        console.log("Show constructed!")
        this.config = config;
        this.square = square;
        this.characterController = characterController;
        this.timeController = timeController;
        this.soundManager = soundManager;

        this.in12pmShow = false;
        this.in7pmShow = false;
        this.in9amshow = false;

        this.ended12pmShow = false;
        this.ended7pmShow = false;
        this.ended9amShow = false;

        this.inControl = false;
    }
    

    init(loadingManager) {

        Promise.all([
            this.loadAudio(this.config.assetsHost + "assets/sound/event9am.ogg"),
            this.loadAudio(this.config.assetsHost + "assets/sound/event7pm.ogg")
        ])
        .then((results) => {
            this.music9am = results[0];
            this.music7pm = results[1];
            this.music9am.controlVolume(0.4);
            this.music7pm.controlVolume(0.4);
        });

        events.on("hour_updated", (hour) => {
            if (this.inControl) {
                this.checkShow(hour);
            }
        });
            
        events.on("character_ended", (name) => {
            let hour = this.timeController.currentChapter.hour;
            if (hour == 19 && !this.ended7pmShow && name != "Waterman" && !this.in7pmShow) {
                console.log("7PM Show starting", name);
                this.square.fountain.startShow(hour);
                this.music7pm.play();
                this.characterController.addCharacter("Agam7PM");
                this.in7pmShow = true;
            }                                     
            else if (hour == 9 && !this.ended9amShow && !this.in9amshow) {
                console.log("9AM Show starting", name);
                this.square.fountain.startShow(hour);
                this.music9am.play();
                this.characterController.addCharacter("Agam12PM");
                this.in9amshow = true;
            }                                     
        });

        events.on("instructions_end", () => {
            this.inControl = true;
            this.checkShow(this.timeController.currentChapter.hour);
        });

        events.on("show_end", () => {
            if (this.in7pmShow || this.timeController.currentChapter.hour == 19) {
                console.log("7PM Show ended");
                this.ended7pmShow = true;
                this.music7pm.stop();
                this.music7pm.unload();
                this.soundManager.panorama.detach(this.music7pm);
            }
            else if (this.in9amshow || this.timeController.currentChapter.hour == 9) {
                console.log("9AM Show ended");
                this.ended9amShow = true;
                this.music9am.stop();
                this.music9am.unload();
                this.soundManager.panorama.detach(this.music9am);
            }
        });
    }


    // OK SO 12 pm show is moved to 9
    checkShow(hour) {
        console.log("Check show ", hour, this.in9amshow, this.in7pmShow);
        if(hour==19 && !this.in7pmShow && !this.ended7pmShow){
            // So we do this after the other characters load
            this.square.fountain.startShow(hour);
            this.music7pm.play();
            this.in7pmShow = true;
             setTimeout(() => {
                this.characterController.addCharacter("Agam7PM");
            },500);
        }

            /*
        if(hour!=12 && this.in12pmShow){
            this.square.fountain.resetShow();
            this.in12pmShow = false;
            }*/

        if(hour!=19 && this.in7pmShow){
            this.square.fountain.resetShow();
            this.in7pmShow = false;
        } 

        if (hour != 9 && this.in9amshow) {
            this.square.fountain.resetShow();
            this.in9amshow = false;
        }

    }
    loadAudio(path) {
        return new Promise((resolve, reject) => {
            console.log("Loading show audio ", path);
            this.soundManager.createStaticSoundSampler(path, (sampler) => {
                console.log("Loaded show audio ", sampler);                              
                this.soundManager.panorama.append(sampler);
                resolve(sampler);
            });
        });
    }
}
