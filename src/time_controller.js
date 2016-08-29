import Chapters from './chapters'
import MathUtil from './util/math'
import DebugUtil from './util/debug'
import _ from 'lodash'
import {MeshText2D, textAlign} from '../lib/text2d/index'

export default class TimeController {
    constructor(config, element, square, sky, scene) {
        this.square = square;
        this.config = config;
        this.element = element;
        this.sky = sky;
        this.scene = scene;
        
        this.rotateVelocity = 0;
        this.currentRotation = 0;

        this.active = true;

        this.clockRunning = false;
    }
    init() {
        console.log("Initializing Time Controller", this.element)
        this.times = Chapters.map((chapter) => {return chapter.hour}).sort((a,b) => {return a-b});
        this.angles = this.times.map((time) => {return time * 15});
        this.angles.push(360);
        console.log("Chapter times", this.times, this.angles);
        document.addEventListener("mousemove", (e) => {this.handleMouseMove(e)})
        this.currentHour = 0;
        this.nextHour = this.times[1];

        events.on("chapter_threshold", (passed) => {
            this.active = !passed;
        });

        events.on("control_threshold", (passed) => {
            this.clockRunning = passed;
        });

        let TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '25px Arial',
             fillStyle: '#FFFFFF',
             antialias: true 
        }
        this.chapterTitle = new MeshText2D("SPRITE", TEXT_DEFINITION)
        this.chapterTitle.visible = false;

        this.prevChapterTitle = new MeshText2D("SPRITE", TEXT_DEFINITION)
        this.prevChapterTitle.visible = false;

        //DebugUtil.positionObject(this.chapterTitle, "text");
        this.scene.add(this.chapterTitle)
        this.scene.add(this.prevChapterTitle)
    }

    update(dt) {
        if (this.active && this.rotateVelocity != 0) {
            this.square.mesh.rotateY(this.rotateVelocity * Math.PI /180 * dt * 20);
            //console.log("Square RotY: ", this.square.mesh.rotation.y);
            this.updateRotation();
        }
        if (this.clockRunning) {
            this.currentHour += dt * this.config.daySpeed;
            if (this.currentHour >= 24) {
                this.currentHour = 0;
            }

            if ((this.currentHour >= this.nextHour && this.nextHour != 0) ||
                (this.nextHour == 0 && this.currentHour > 0 && this.currentHour < this.times[1])) {
                this.currentHour = this.nextHour;
                this.updateNextHour();
                events.emit("hour_updated", this.currentHour);
            }
            this.sky.setTime(this.currentHour);
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

        let closestAngle = MathUtil.closestValue(this.angles, this.currentRotation);
        let closestHour = this.getHour(closestAngle);
        if (closestHour != this.currentHour) {
            this.currentHour = closestHour;
            this.updateNextHour();
            events.emit("hour_updated", this.currentHour);
            this.showChapterTitle();
        }
    }

    updateNextHour() {
        let currentIndex = this.times.indexOf(this.currentHour);
        if (currentIndex == this.times.length -1) {
            this.nextHour = this.times[0];
        } else {
            this.nextHour = this.times[currentIndex +1];
        }

        console.log("Next hour: ", this.nextHour);
    }

    updateSquare() {
        if (this.square.mesh) {
            let rotationY = this.currentRotation
            if (rotationY > 180) {
                rotationY -= 360;
            }
            this.square.mesh.rotation.y = rotationY * Math.PI / 180;
            this.sky.setTime(this.currentRotation / 15);
        }
    }

    getHour(angle) {
        let hour;

        if (angle == 360) {
            hour = 0;
        } else {
            hour = angle / 15;
        }

        return hour;
    }

    handleMouseMove(e) {

        if (!this.active) {
            return;
        }

        //console.log("Time move! ", e.pageX + "/" + this.element.offsetWidth);
        if (e.pageX > this.element.offsetWidth * 2 / 3) {
            this.rotateVelocity = (e.pageX - this.element.offsetWidth * 2 /3) / (this.element.offsetWidth / 3);
        } else if (e.pageX < this.element.offsetWidth / 3) {
            this.rotateVelocity = (this.element.offsetWidth / 3 - e.pageX) / (this.element.offsetWidth / 3) * -1;
        } else {
            if (this.rotateVelocity != 0) {
                // We stopped
                
                let closestAngle = MathUtil.closestValue(this.angles, this.currentRotation);
                let closestHour = this.getHour(closestAngle);

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
            events.emit("angle_updated", this.currentHour);
        }, onUpdate: () => {
            this.updateSquare();
        }});
    }

    showChapterTitle() {
        let chapter = _.find(Chapters, {hour: this.currentHour });
        if (this.chapterTitle.visible) {
            this.prevChapterTitle.visible = true;
            this.prevChapterTitle.text = this.chapterTitle.text;
            this.prevChapterTitle.position.copy(this.chapterTitle.position);
            this.prevChapterTitle.material.opacity = this.chapterTitle.material.opacity;
            TweenMax.to(this.prevChapterTitle.material, 1, {opacity: 0});
        }
        let targetOpacity;
        if (this.currentHour == 17 || this.currentHour == 19) {
            targetOpacity = 1.0;
        } else {
            targetOpacity = 0.3;
        }
        this.chapterTitle.text = chapter.hour + ":00 - " + chapter.name;
        this.chapterTitle.visible = true;
        this.chapterTitle.position.fromArray(chapter.titlePosition);
        this.chapterTitle.material.opacity = 0;

        TweenMax.to(this.chapterTitle.material, 1, {opacity: targetOpacity});

        //document.getElementById("chapter-title-text").innerHTML = chapter.hour + ":00 - " + chapter.name;
        this.turnOnChapterSun(this.currentHour);

    }

    turnOnChapterSun() {
        if (this.currentHour == 17 ) {
            this.square.turnOnSun("9");
        } else if (this.currentHour == 19) {
            this.square.turnOnSun("7");
        } else {
            this.square.turnOffSun(this.square.currentSun);
        }
    }

    setTime(hour) {
        this.currentHour = hour;
        this.currentRotation = hour * 15;
        this.updateSquare();
        this.showChapterTitle();
        events.emit("hour_updated", this.currentHour);
        events.emit("angle_updated", this.currentHour);
        this.updateNextHour();
    }
}
