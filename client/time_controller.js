import Chapters from './chapters'
import MathUtil from './util/math'
import DebugUtil from './util/debug'
import _ from 'lodash'
import {MeshText2D, SpriteText2D, textAlign} from './lib/text2d/index'
import SunGazer from './sun_gazer'

export default class TimeController {
    constructor(config, element, square, sky, scene, camera, renderer) {
        this.square = square;
        this.config = config;
        this.element = element;
        this.sky = sky;
        this.scene = scene;
        
        this.rotateVelocity = 0;
        this.currentRotation = 0;
        this.camera = camera;

        this.gazeCounter = 0;
        this.gazeHour = -1;

        this.active = false;

        this.clockRunning = false;

        this.daySpeed = config.daySpeed;

        this.wasUsed = false;
        this.done = false;

        this.accelerating = false;
    }
    init(loadingManager) {
        console.log("Initializing Time Controller", this.element)
        this.times = Chapters.map((chapter) => {return chapter.hour}).sort((a,b) => {return a-b});
        this.angles = this.times.map((time) => {return time * 15});
        this.angles.push(360);
        console.log("Chapter times", this.times, this.angles);
        //document.addEventListener("mousemove", (e) => {this.handleMouseMove(e)})
        this.currentHour = 0;
        this.nextHour = this.times[1];

        events.on("chapter_threshold", (passed) => {
            this.active = !passed;
        });

        events.on("control_threshold", (passed) => {
            if (passed) {
                this.scene.remove(this.chapterTitle);
                this.scene.remove(this.prevChapterTitle);
                this.square.turnOnSun(this.currentHour.toString());
            }
            this.clockRunning = passed;
        });

        events.on("base_position", () => {
            if (!this.done) {
                console.log("Return to base, hour is ", this.currentHour);            
                let closestAngle = MathUtil.closestValue(this.angles, this.currentHour * 15);
                let closestHour = this.getHour(closestAngle);
                this.stickToAngle(closestAngle);
                this.currentHour = closestHour;

                this.showChapterTitle();
            }
        });

        events.on("intro_end", () => {
            this.showChapterTitle();
            this.active = true;
        });

        let TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '25px Arial',
             fillStyle: '#FFFFFF',
             antialias: true 
        }
        let INSIDE_TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '20px Arial',
             fillStyle: '#FFFFFF',
             antialias: true 
        }
        
        this.chapterTitle = new MeshText2D("SPRITE", TEXT_DEFINITION)
        this.chapterTitle.scale.set(0.3, 0.3, 0.3);
        this.chapterTitle.visible = false;

        this.prevChapterTitle = new MeshText2D("SPRITE", TEXT_DEFINITION)
        this.prevChapterTitle.scale.set(0.3, 0.3, 0.3);
        this.prevChapterTitle.visible = false;

        this.insideChapterTitle = new SpriteText2D("", INSIDE_TEXT_DEFINITION);
        this.insideChapterTitle.scale.multiplyScalar(0.02);
        //DebugUtil.positionObject(this.insideChapterTitle, "Inside", true);

        this.scene.add(this.chapterTitle)
        this.scene.add(this.prevChapterTitle)

        // Sun gazer
        this.sunGazer = new SunGazer(this.square);
        this.sunGazer.init();
        this.camera.add(this.sunGazer);

        events.on("gaze_started", (hour) => {
            this.gazeHour = parseInt(hour);
            this.gazeCounter = 0;

            this.showInsideChapterTitle(hour);

            console.log("Time controller - Starting gaze counter for target hour " + this.gazeHour);
        });

        events.on("gaze_stopped", (hour) => {
            if (this.insideChapterTitle.parent) {
                this.insideChapterTitle.parent.remove(this.insideChapterTitle);
            }
            this.gazeHour = -1;
        });
    }

    update(dt,et) {
        if (this.active && this.rotateVelocity != 0) {
            if (!this.wasUsed) {
                this.wasUsed = true;
                events.emit("time_rotated");
            }
            this.square.mesh.rotateY(this.rotateVelocity * Math.PI /180 * dt * 20);
            //console.log("Square RotY: ", this.square.mesh.rotation.y);
            this.updateRotation();
        }
        if (this.clockRunning) {
            this.currentHour += dt * this.daySpeed;
            if (this.currentHour >= 24) {
                this.currentHour = 0;
            }

            if ((this.currentHour >= this.nextHour && this.nextHour != 0) ||
                (this.nextHour == 0 && this.currentHour > 0 && this.currentHour < this.times[1])
               )
                  {
                this.currentHour = this.nextHour;
                let roundHour = this.nextHour;
                events.emit("hour_updated", roundHour);
                this.square.turnOnSun(this.currentHour.toString());
                console.log("Time controller - next chapter");

                if (!this.done) {
                    this.daySpeed = this.config.daySpeed;
                }
                this.updateNextHour();
            }
            this.sky.setTime(this.currentHour);
        }
        if (!this.accelerating) {
            if (this.rotateVelocity < 0) {
                this.rotateVelocity = Math.min(0, this.rotateVelocity + 0.03);
                if (this.rotateVelocity == 0) {
                    this.stoppedTurning();
                }
            } else if (this.rotateVelocity > 0) {
                this.rotateVelocity = Math.max(0, this.rotateVelocity - 0.03);
                if (this.rotateVelocity == 0) {
                    this.stoppedTurning();
                }
            } 
        }

        if (this.gazeHour != -1) {
            this.gazeCounter += dt;
            if (this.gazeCounter > 1 && this.sky.clouds.currentState != "transition" ) {
                this.sky.clouds.startTransition();
            }
            if (this.gazeCounter >= 4) {

                let targetHour = this.gazeHour;
                this.gazeHour = -1;
                console.log("Time controller - Performing transition to " + targetHour + "!");
                this.clockRunning = false;

                TweenMax.to(this, 3, {ease: Power2.easeInOut, currentHour: targetHour, onComplete: () => {
                    this.square.explodeSun(this.currentHour.toString());
                    setTimeout(() => {
                        this.sunGazer.stop();
                        this.sunGazer.active = false;
                        this.square.turnOnSun(this.currentHour.toString());
                        events.emit("hour_updated", this.currentHour);
                        let targetRotationY = this.currentHour * 15;
                        if (targetRotationY > 180) {
                            targetRotationY -= 360;
                        }
                        targetRotationY *= Math.PI / 180;
                        console.log("Time controller - rotating square from ", this.square.mesh.rotation.y, " to ", targetRotationY);
                        TweenMax.to(this.square.mesh.rotation, 7, {ease: Power2.easeInOut, delay: 1, y: targetRotationY, onComplete: () => {
                            events.emit("angle_updated", this.currentHour);
                            this.updateNextHour();
                            this.sunGazer.active = true;
                            this.clockRunning = true;
                        }});
                    },1000);
                }, onUpdate: () => {
                    this.sky.setTime(this.currentHour);
                }});
            }
        }
    }

    setDaySpeed(speed) {
        console.log("Time controller - setting day speed to " + speed);
        this.daySpeed = speed;
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
            this.showChapterTitle();
            events.emit("hour_updated", this.currentHour);
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

        if (!this.active || this.done) {
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
                this.stoppedTurning();
            }
            this.rotateVelocity = 0;
        }
    } 
    stoppedTurning() {
        let closestAngle = MathUtil.closestValue(this.angles, this.currentRotation);
        let closestHour = this.getHour(closestAngle);

        this.stickToAngle(closestAngle);
        this.currentHour = closestHour;
    }
    stickToAngle(closestAngle) {
        let targetRotationY = closestAngle;
        console.log("Target rotationY ", targetRotationY, " from ", this.currentRotation);
        let roundHour = targetRotationY / 15;

        TweenMax.to(this, 1, {currentRotation: targetRotationY, onComplete: () => {
            events.emit("angle_updated", roundHour);
        }, onUpdate: () => {
            this.updateSquare();
        }});
    }

    transitionTo(hour, time) {
        let targetRotationY = hour * 15;
        TweenMax.to(this, time, {ease: Linear.easeNone, currentRotation: targetRotationY, onComplete: () => {
            this.currentHour = hour;
            this.updateNextHour();
            this.showChapterTitle();
            events.emit("hour_updated", this.currentHour);
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
        let targetOpacity = 1.0;
        this.chapterTitle.text = chapter.hour + ":00 - " + chapter.name;
        this.chapterTitle.visible = true;
        this.chapterTitle.position.fromArray(chapter.titlePosition);
        this.chapterTitle.material.opacity = 0;

        TweenMax.to(this.chapterTitle.material, 1, {opacity: targetOpacity});

        //document.getElementById("chapter-title-text").innerHTML = chapter.hour + ":00 - " + chapter.name;
        this.turnOnChapterSun(this.currentHour);
    }

    showInsideChapterTitle(hour) {
        let sun = this.square.getSun(hour);
        if (!sun) {
            throw new Error("Invalid chapter sun " + hour);
        }
        let chapter = _.find(Chapters, {hour: parseInt(hour)});
        if (!chapter) {
            throw new Error("Invalid chapter hour " + hour);
        }
        this.insideChapterTitle.text = chapter.hour + ":00 - " + chapter.name;
        this.insideChapterTitle.position.fromArray(chapter.insideTitlePosition);
        //sun.lookAt(this.camera.position);
        sun.add(this.insideChapterTitle);
        /*
        this.gazingSun = this.insideChapterTitle;
        events.emit("add_gui", {folder:"Sun rotation"}, sun.rotation, "x");
        events.emit("add_gui", {folder:"Sun rotation"}, sun.rotation, "y");
        events.emit("add_gui", {folder:"Sun rotation"}, sun.rotation, "z");*/
        //sun.quaternion.copy(this.camera.quaternion);

       /*
        let m1 = new THREE.Matrix4();
        m1.lookAt( this.camera.position, sun.position, sun.up );
        sun.quaternion.setFromRotationMatrix( m1 ); */
    }

    turnOnChapterSun() {
        if (this.currentHour == 17 || this.currentHour == 9 ) {
            this.square.turnOnSun("9");
        } else if (this.currentHour == 19 || this.currentHour == 7) {
            this.square.turnOnSun("7");
        } else if (this.currentHour == 12) {
            this.square.turnOnSun("12");
        }
        else {
            if (this.square.currentSun) {
                this.square.turnOffSun(this.square.currentSun);
            }
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

    jumpToTime(hour) {
        this.currentHour = hour;
        this.sky.setTime(this.currentHour);
        events.emit("hour_updated", this.currentHour);
        events.emit("angle_updated", this.currentHour);
        this.showChapterTitle();
        this.updateNextHour();
    }
}
