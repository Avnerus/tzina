import DebugUtil from './util/debug'

export default class Show {
    constructor(square, characterController, timeController) {
        console.log("Show constructed!")
        this.square = square;
        this.characterController = characterController;
        this.timeController = timeController;

        this.in12pmShow = false;
        this.in7pmShow = false;

        this.ended12pmShow = false;
        this.ended7pmShow = false;

        this.inControl = false;
    }
    

    init(loadingManager) {

        events.on("hour_updated", (hour) => {
            if (this.inControl) {
                this.checkShow(hour);
            }
        });
            
        events.on("character_ended", (name) => {
            if (this.timeController.currentChapter.hour == 19 && !this.ended7pmShow && name != "Waterman" && !this.in7pmShow) {
                this.square.fountain.startShow();
                this.characterController.addCharacter("Agam7PM");
                this.in7pmShow = true;
            }                                     
        });

        events.on("control_threshold", (passed) => {
            if (passed) {
                this.checkShow(this.timeController.currentChapter.hour);
            }
        });

        events.on("show_end", () => {
            if (this.timeController.currentChapter.hour == 19) {
                this.ended7pmShow = true;
            }
            else if (this.timeController.currentChapter.hour == 12) {
                this.ended12pmShow = true;
            }
        });
    }

    checkShow(hour) {
        if(hour==12 && !this.in12pmShow && !this.ended12pmShow){
            // So we do this after the other characters load
            setTimeout(() => {
                this.square.fountain.startShow();
                this.characterController.addCharacter("Agam12PM");
                this.in12pmShow = true;
            },3000);
        }

        if(hour!=12 && this.in12pmShow){
            this.square.fountain.resetShow();
            this.in12pmShow = false;
        }

        if(hour!=19 && this.in7pmShow){
            this.square.fountain.resetShow();
            this.in7pmShow = false;
        }
    }
}
