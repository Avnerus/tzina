export default class GuiManager {
    constructor(emitter) {
        this.emitter = emitter;
    }
    init() {
        this.gui = new dat.GUI();
        //this.gui.close();
        this.emitter.on('add_gui', (opts,...args) => {
            console.log("ADD GUI",args);
            let control = this.gui.add.apply(this.gui, args);
            console.log(control, opts);
            if (opts.step) {
                control.step(opts.step);
            }
        })
    }
}
