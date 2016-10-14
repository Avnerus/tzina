export default class GuiManager {
    constructor(emitter) {
        this.emitter = emitter;
        this.folders = {};
    }
    init() {
        this.gui = new dat.GUI();
        //this.gui.close();
        this.emitter.on('add_gui', (opts,...args) => {
            console.log("ADD GUI",args);
            let control;
            let addFunction = "add";
            if (opts.color) {
                addFunction = "addColor"
            }
            if (opts.folder) {
                if (!this.folders[opts.folder]) {
                    this.folders[opts.folder] = this.gui.addFolder(opts.folder);
                    this.folders[opts.folder].open();
                }
                control = this.folders[opts.folder][addFunction].apply(this.folders[opts.folder], args);
            } else {
                control = this.gui[addFunction].apply(this.gui, args);
            }
            if (opts.step) {
                control.step(opts.step);
            }

            if (opts.onChange) {
                control.onChange(opts.onChange);
            }

            if (opts.listen) {
                control.listen();
            }
        })

        this.emitter.on('remove_gui_folder', (name) => {
            console.log("GUI - remove folder ", name);
            if (this.folders[name]) {
                this.folders[name].domElement.parentNode.removeChild(this.folders[name].domElement);
            }            
        });
    }
}
