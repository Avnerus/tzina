import Chapters from './chapters'
import MathUtil from './util/math'
import _ from 'lodash'

export default class TimeController {
    constructor(config, element, square, sky) {
        this.square = square;
        this.config = config;
        this.element = element;
        this.sky = sky;
        
        this.rotateVelocity = 0;
        this.currentRotation = 0;
    }
    init() {
        console.log("Initializing Time Controller", this.element)
        this.times = Chapters.map((chapter) => {return chapter.hour}).sort((a,b) => {return a-b});
        this.angles = this.times.map((time) => {return time * 15});
        this.angles.push(360);
        console.log("Chapter times", this.times, this.angles);
        document.addEventListener("mousemove", (e) => {this.handleMouseMove(e)})

        this.currentHour = 0;
    }

    update(dt) {
        if (this.rotateVelocity != 0) {
            this.square.mesh.rotateY(this.rotateVelocity * Math.PI /180 * dt * 20);
            //console.log("Square RotY: ", this.square.mesh.rotation.y);
            this.updateRotation();
        }
    }

    updateRotation() {
        let rotationY = this.square.mesh.rotation.y;
        if (rotationY < 0) {
            rotationY = 2 * Math.PI + rotationY;
        }
        this.currentRotation = rotationY * 180 / Math.PI;
//            console.log(this.currentRotation + " :: " + this.currentRotation / 15);
        this.sky.setTime(this.currentRotation / 15);
    }

    updateSquare() {
        let rotationY = this.currentRotation
        if (rotationY > 180) {
            rotationY -= 360;
        }
        this.square.mesh.rotation.y = rotationY * Math.PI / 180;
        this.sky.setTime(this.currentRotation / 15);
    }

    handleMouseMove(e) {
        //console.log("Time move! ", e.pageX + "/" + this.element.offsetWidth);
        if (e.pageX > this.element.offsetWidth * 2 / 3) {
            this.rotateVelocity = (e.pageX - this.element.offsetWidth * 2 /3) / (this.element.offsetWidth / 3);
        } else if (e.pageX < this.element.offsetWidth / 3) {
            this.rotateVelocity = (this.element.offsetWidth / 3 - e.pageX) / (this.element.offsetWidth / 3) * -1;
        } else {
            if (this.rotateVelocity != 0) {
                // We stopped
                let closestAngle = MathUtil.closestValue(this.angles, this.currentRotation);
                let closestHour;

                if (closestAngle == 360) {
                    closestHour = 0;
                } else {
                    closestHour = closestAngle / 15;
                }
                console.log("Closest hour: ", closestHour, "Angle: ", closestAngle);

                this.stickToAngle(closestAngle);
                this.currentHour = closestHour;
            }
            this.rotateVelocity = 0;
        }
    } 
    stickToAngle(closestAngle) {
        let targetRotationY = closestAngle;
        console.log("Target rotationY ", targetRotationY, " from ", this.currentRotation);

        TweenMax.to(this, 1, {currentRotation: targetRotationY, onComplete: () => { 
            console.log("Fixed");
            this.showChapterTitle();
        }, onUpdate: () => {
            this.updateSquare();
        }});
    }

    showChapterTitle() {
        let chapter = _.find(Chapters, {hour: this.currentHour });
        document.getElementById("chapter-title-text").innerHTML = chapter.hour + ":00 - " + chapter.name;
    }
}
