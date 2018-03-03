import {MeshText2D, textAlign} from '../lib/text2d/index'

export default class MultilineText extends THREE.Object3D  {
    constructor(numLines, textDefinition, lineOffset) {
        super();
        console.log("Multiline text constructed!")

        this.numLines = numLines;
        this.textDefinition = textDefinition;
        this.lineOffset = lineOffset;
    }
    init(loadingManager) {
        let offset = 0;

        for (let i = 0; i < this.numLines; i++) {
            let line = new MeshText2D(" ", this.textDefinition);
            line.position.set(0,offset,0);
            this.add(line);
            offset -= this.lineOffset;
        }
        console.log("Multinline text initialized with " + this.numLines + " lines");
    }
    show(time) {
        if (this.children.length > 0) {
            return new Promise((resolve, reject) => {
                TweenMax.to( this.children[0].material, time, { opacity: 1, onComplete:() => {
                    resolve();
                }});
                for (let i = 1; i < this.children.length; i++) {
                    TweenMax.to( this.children[i].material, time, { opacity: 1});
                }
            });
        }
    }

    hide(time) {
        if (this.children.length > 0) {
            return new Promise((resolve, reject) => {
                TweenMax.to( this.children[0].material, time, { opacity: 0, onComplete:() => {
                    resolve();
                }});
                for (let i = 1; i < this.children.length; i++) {
                    TweenMax.to( this.children[i].material, time, { opacity: 0});
                }
            });
        }
    }

    setText(lines) {
        for (let i = 0; i < this.children.length; i++) {
            if (i < lines.length) {
                this.children[i].text = lines[i];
            }
            else {
                this.children[i].text = "";
            }
        }
    }
}
