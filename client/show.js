import DebugUtil from './util/debug'

export default class Show {
    constructor(square, characterController, timeController) {
        console.log("Show constructed!")
        this.square = square;
        this.characterController = characterController;
        this.timeController = timeController;

        this.in12pmShow = false;
        this.in7pmShow = false;
        this.in9amshow = false;

        this.ended12pmShow = false;
        this.ended7pmShow = false;
        this.ended9amShow = false;

        this.inControl = false;
    }
    

    init(loadingManager) {

        events.on("hour_updated", (hour) => {
            if (this.inControl) {
                this.checkShow(hour);
            }
        });
            
        events.on("character_ended", (name) => {
            let hour = this.timeController.currentChapter.hour;
            if (hour == 19 && !this.ended7pmShow && name != "Waterman" && !this.in7pmShow) {
                this.square.fountain.startShow(hour);
                this.characterController.addCharacter("Agam7PM");
                this.in7pmShow = true;
            }                                     
            else if (hour == 9 && !this.ended9amShow && !this.in9amshow) {
                this.square.fountain.startShow(hour);
                this.characterController.addCharacter("Agam12PM");
                this.in9amshow = true;
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
            else if (this.timeController.currentChapter.hour == 9) {
                this.ended9amShow = true;
            }
        });
    }


    // OK SO 12 pm show is moved to 9
    checkShow(hour) {
        if(hour==19 && !this.in7pmShow && !this.ended7pmShow){
            // So we do this after the other characters load
            setTimeout(() => {
                this.square.fountain.startShow(hour);
                this.characterController.addCharacter("Agam7PM");
                this.in7pmShow = true;
            },3000);
        }

        if(hour==9 && !this.in9amshow && !this.ended9amShow){
            // So we do this after the other characters load
            setTimeout(() => {
                this.square.fountain.startShow(hour);
                this.characterController.addCharacter("Agam12PM");
                this.in9amshow = true;
            },3000);
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
}
