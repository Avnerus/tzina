import DebugUtil from './util/debug'

export default class Show {
    constructor( square ) {
        console.log("Show constructed!")
        this.square = square;

        this.in12pmShow = false;
        this.in7pmShow = false;
    }

    init(loadingManager) {

        events.on("hour_updated", (hour) => {
            
            if(hour==12 && !this.in12pmShow){
                this.square.fountain.startShow();
                this.in12pmShow = true;
            }

            if(hour!=12 && this.in12pmShow){
                this.square.fountain.resetShow();
                this.in12pmShow = false;
            }

            if(hour==19 && !this.in7pmShow){
                this.square.fountain.startShow();
                this.in7pmShow = true;
            }

            if(hour!=19 && this.in7pmShow){
                this.square.fountain.resetShow();
                this.in7pmShow = false;
            }
        });
    }

}
