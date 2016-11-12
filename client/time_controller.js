import Chapters from './chapters'
import MathUtil from './util/math'
import DebugUtil from './util/debug'
import _ from 'lodash'
import {MeshText2D, SpriteText2D, textAlign} from './lib/text2d/index'
import SunGazer from './sun_gazer'

export default class TimeController {
    constructor(config, element, square, sky, scene, camera, soundManager) {
        this.square = square;
        this.config = config;
        this.element = element;
        this.sky = sky;
        this.scene = scene;
        
        this.rotateVelocity = 0;
        this.currentRotation = 0;
        this.camera = camera;

        this.soundManager = soundManager;

        this.gazeCounter = 0;
        this.gazeHour = -1;

        this.active = false;

        this.clockRunning = false;

        this.daySpeed = config.daySpeed;

        this.wasUsed = false;
        this.done = false;

        this.accelerating = false;

        this.currentChapter;

        this.chapterProgress = {};

        this.totalExperienceTime = 0;
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

        // Chapter progress
        Chapters.forEach((chapter) => {
            this.chapterProgress[chapter.hour] = {};
            this.totalExperienceTime += chapter.totalTime;
            chapter.characters.forEach((character) => {
                this.chapterProgress[chapter.hour][character] = 0;
            });
        });

        this.totalExperienceTime = 212; // DEBUG
        console.log("Total experience time:", this.totalExperienceTime);


        events.on("chapter_threshold", (passed) => {
            this.active = !passed;
        });

        events.on("control_threshold", (passed) => {
            if (passed) {
                this.scene.remove(this.chapterTitle);
                this.scene.remove(this.prevChapterTitle);
                if (this.square.currentSun) {
                    this.square.turnOffSun(this.square.currentSun);
                }
                this.square.currentSun = this.currentHour.toString();
                this.square.turnOnSun(this.currentHour.toString());
                this.updateSunProgress();
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

                this.setCurrentChapter();
                this.showChapterTitle();
            }
        });

        events.on("intro_end", () => {
            this.setCurrentChapter();
            this.showChapterTitle();
            this.active = true;
        });

        events.on("character_progress", (data) => {
            if (
                this.chapterProgress[this.currentChapter.hour] &&
                typeof(this.chapterProgress[this.currentChapter.hour][data.name]) != 'undefined'
            ) {
                this.chapterProgress[this.currentChapter.hour][data.name] = data.time;
                this.updateSunProgress();
                this.updateTotalTime();
            }            
        });

        let TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '22px Miriam Libre',
             fillStyle: '#FFFFFF',
             antialias: true
        }
        let INSIDE_TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '70px Miriam Libre',
             fillStyle: '#cccccc',
             antialias: true 
        }

        let INSIDE_SUN_TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '70px Miriam Libre',
             fillStyle: '#cccccc',
             antialias: true,
             shadow: true
        }
        
        this.chapterTitle = new MeshText2D("SPRITE", TEXT_DEFINITION)
        this.chapterTitle.scale.set(0.109, 0.109, 0.109);
        this.chapterTitle.visible = false;

        this.prevChapterTitle = new MeshText2D("SPRITE", TEXT_DEFINITION)
        this.prevChapterTitle.scale.set(0.3, 0.3, 0.3);
        this.prevChapterTitle.visible = false;

        this.insideChapterTitle = new MeshText2D("", INSIDE_SUN_TEXT_DEFINITION);
        this.insideChapterTitle.scale.multiplyScalar(0.01);

        this.insideChapterTitleLineTwo = new MeshText2D("", INSIDE_TEXT_DEFINITION);
        this.insideChapterTitleLineTwo.scale.multiplyScalar(0.013);

        this.insideChapterTitle.visible = false;
        this.insideChapterTitleLineTwo.visible = false;

        this.scene.add(this.insideChapterTitle);
        this.scene.add(this.insideChapterTitleLineTwo);
        //DebugUtil.positionObject(this.insideChapterTitle, "Inside", true);
        //DebugUtil.positionObject(this.insideChapterTitleLineTwo, "Inside Line 2", true);

        //DebugUtil.positionObject(this.chapterTitle, "Outside title", true);
        this.scene.add(this.chapterTitle)
        this.scene.add(this.prevChapterTitle)

        // Sun gazer
        this.sunGazer = new SunGazer(this.square, this.soundManager);
        this.sunGazer.init();
        this.camera.add(this.sunGazer);

        events.on("gaze_started", (hour) => {
            this.gazeHour = parseInt(hour);
            this.gazeCounter = 0;

            this.insideChapterTitle.visible = true;
            this.insideChapterTitleLineTwo.visible = true;

            this.showInsideChapterTitle(hour);

            console.log("Time controller - Starting gaze counter for target hour " + this.gazeHour);
        });

        events.on("gaze_stopped", (hour) => {
            this.insideChapterTitle.visible = false;
            this.insideChapterTitleLineTwo.visible = false;
            this.sunWorld = null;
            this.gazeHour = -1;
        });
    }

    updateSunProgress() {
        let sum = 0;
        _.forEach(this.chapterProgress[this.currentChapter.hour], (value, key) => {
            if (key != "total") {
                sum += value;
            }
        });

        this.chapterProgress[this.currentChapter.hour]["total"] = sum;

        this.square.updateSunProgress(this.currentChapter.hour.toString(), sum / this.currentChapter.totalTime);
    }

    updateTotalTime() {
        let sum = 0;
        _.forEach(this.chapterProgress, (value, key) => {
            if (value["total"]) {
                sum += value["total"];
            }
        });
        //console.log("Total experience progress:", sum + "/" + this.totalExperienceTime);
        events.emit("experience_progress", sum / this.totalExperienceTime);
    }

    update(dt,et) {
        if (this.active && this.rotateVelocity != 0) {
            if (!this.wasUsed) {
                this.wasUsed = true;
                events.emit("time_rotated");
            }
            this.square.getClockwork().rotateY(this.rotateVelocity * Math.PI /180 * dt * 20);
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
                this.setCurrentChapter();
                events.emit("hour_updated", roundHour);
                if (this.square.currentSun) {
                    this.square.turnOffSun(this.square.currentSun);
                }
                this.square.currentSun = this.currentHour.toString();
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
                let baseHour = this.currentHour;
                this.gazeHour = -1;
                console.log("Time controller - Performing transition to " + targetHour + "!");
                this.clockRunning = false;

                TweenMax.to(this, 3, {ease: Power2.easeInOut, currentHour: targetHour, onComplete: () => {
                    this.square.explodeSun(this.currentHour.toString());
                    setTimeout(() => {
                        this.sunGazer.stop();
                        this.sunGazer.active = false;
                        if (this.square.currentSun) {
                            this.square.turnOffSun(this.square.currentSun);
                        }
                        this.square.currentSun = this.currentHour.toString();
                        this.square.turnOnSun(this.currentHour.toString());
                        this.setCurrentChapter();
                        events.emit("hour_updated", this.currentHour);
                        let targetRotationY = this.currentHour * 15;
                        targetRotationY *= Math.PI / 180;
                        console.log("Time controller - rotating square from ", this.square.clockRotation, " to ", targetRotationY);
                        TweenMax.to(this.square, 7 * (Math.abs(targetHour - baseHour) * 0.5), {ease: Power2.easeInOut, delay: 1, clockRotation: targetRotationY, onComplete: () => {
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
        if (this.sunWorld) {
            this.updateSunTitle();
        }
    }

    setDaySpeed(speed) {
        console.log("Time controller - setting day speed to " + speed);
        this.daySpeed = speed;
    }

    updateRotation() {
        let rotationY = this.square.clockRotation;
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
            this.setCurrentChapter();
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
            this.square.clockRotation = rotationY * Math.PI / 180;
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


    rotate(angle, time) {
        return new Promise((resolve, reject) => {
            TweenMax.to(this, time, {ease: Linear.easeNone, currentRotation: angle, onComplete: () => {
            }, onUpdate: () => {
                this.updateSquare();
            }, onComplete: () => {resolve()} });
        });
    }

    transitionToLocalTime(time) {
        let now = new Date();
        let localTime = now.getHours() + (now.getMinutes() / 60);
        let availableTimes = this.times.slice(1);
        let closestHour = MathUtil.closestValue(availableTimes, localTime);
        console.log("Current local time ", localTime, "Available times", availableTimes, "Closest time", closestHour);
        return this.transitionTo(closestHour, time);
    }

    transitionTo(hour, time) {
        return new Promise((resolve, reject) => {
            let targetRotationY = hour * 15;
            TweenMax.to(this, time, {ease: Linear.easeNone, currentRotation: targetRotationY, onComplete: () => {
                this.currentHour = hour;
                this.updateNextHour();
                this.setCurrentChapter();
                this.showChapterTitle();
                events.emit("hour_updated", this.currentHour);
                events.emit("angle_updated", this.currentHour);
                resolve();
            }, onUpdate: () => {
                this.updateSquare();
            }});
        });
    }

    setCurrentChapter() {
        this.currentChapter = _.find(Chapters, {hour: this.currentHour });
    }

   showChapterTitle() {
        // 0 is hidden for now
        if (this.currentChapter.hour == 0) { return; }

        if (this.chapterTitle.visible) {
            this.prevChapterTitle.visible = true;
            this.prevChapterTitle.text = this.chapterTitle.text;
            this.prevChapterTitle.position.copy(this.chapterTitle.position);
            this.prevChapterTitle.material.opacity = this.chapterTitle.material.opacity;
            TweenMax.to(this.prevChapterTitle.material, 1, {opacity: 0});
        }
        let targetOpacity = 1.0;
        this.chapterTitle.text = this.getHourText(this.currentChapter.hour) + " - " + this.currentChapter.name;
        this.chapterTitle.visible = true;
        this.chapterTitle.position.fromArray(this.currentChapter.titlePosition);
        this.chapterTitle.material.opacity = 0;

        TweenMax.to(this.chapterTitle.material, 1, {opacity: targetOpacity});

        //document.getElementById("chapter-title-text").innerHTML = chapter.hour + ":00 - " + chapter.name;

        if (this.square.currentSun) {
            this.square.turnOffSun(this.square.currentSun);
        }
        this.square.currentSun = this.currentHour.toString();
        this.turnOnChapterSun(this.currentHour);
    }

    getHourText(hour) {
        let hourText = "";
        
        if (hour == 12) {
            hourText = "12PM"            
        } else if (hour > 12) {
            hourText = (hour - 12) + "PM"
        } else {
            hourText = hour + "AM";
        }

        return hourText;
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
        let hourText = this.getHourText(chapter.hour);

        this.insideChapterTitle.text = hourText;
        this.insideChapterTitleLineTwo.text = chapter.name;
  
        // this.insideChapterTitle.rotation.set(
        //     chapter.sunLoaderRotation[0] * Math.PI / 180,                             
        //     chapter.sunLoaderRotation[1] * Math.PI / 180,                             
        //     chapter.sunLoaderRotation[2] * Math.PI / 180,
        //     "XYZ"
        // );
        sun.updateMatrixWorld();

        this.sunWorld = new THREE.Vector3().setFromMatrixPosition(sun.matrixWorld);


        console.log("Sun title position ", this.insideChapterTitle.position);

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

    updateSunTitle() {
        if (this.sunWorld) {
            this.insideChapterTitle.position.copy(this.sunWorld);
            this.insideChapterTitle.lookAt(this.camera.position);
            this.insideChapterTitle.translateZ(5);
            this.insideChapterTitle.quaternion.copy(this.camera.quaternion);
            this.insideChapterTitle.translateY(0.5);

            this.insideChapterTitleLineTwo.position.copy(this.sunWorld);
            this.insideChapterTitleLineTwo.lookAt(this.camera.position);
            this.insideChapterTitleLineTwo.translateZ(5);
            this.insideChapterTitleLineTwo.quaternion.copy(this.camera.quaternion);
            this.insideChapterTitleLineTwo.translateY(-1.5);
        }
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
        this.setCurrentChapter();
        this.updateSquare();
        this.setCurrentChapter();
        this.showChapterTitle();
        events.emit("hour_updated", this.currentHour);
        events.emit("angle_updated", this.currentHour);
        this.updateNextHour();
    }

    jumpToTime(hour) {
        this.currentHour = hour;
        this.sky.setTime(this.currentHour);
        this.setCurrentChapter();
        events.emit("hour_updated", this.currentHour);
        events.emit("angle_updated", this.currentHour);
        this.setCurrentChapter();
        this.showChapterTitle();
        this.updateNextHour();
    }
}
