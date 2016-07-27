export default class GuiManager {
    constructor(emitter) {
        this.emitter = emitter;
    }
    init() {
        this.gui = new dat.GUI();
        this.emitter.on('add_gui', (object, property) => {
            console.log("ADD GUI", object, property);
            this.gui.add(object, property);
        })
    }
}
