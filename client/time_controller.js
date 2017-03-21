import Chapters from './chapters'
import ChaptersHeb from './chapters_heb'
import MathUtil from './util/math'
import DebugUtil from './util/debug'
import MiscUtil from './util/misc'
import _ from 'lodash'
import {MeshText2D, SpriteText2D, textAlign} from './lib/text2d/index'
import moment from 'moment';
import MultilineText from './util/multiline_text'

export default class TimeController {
    constructor(config, element, square, sky, scene, camera, soundManager, sunGazer) {
        this.square = square;
        this.config = config;
        this.element = element;
        this.sky = sky;
        this.scene = scene;
        
        this.rotateVelocity = 0;
        this.currentRotation = 0;
        this.camera = camera;

        this.soundManager = soundManager;
        this.sunGazer = sunGazer;

        this.gazeCounter = 0;
        this.gazeHour = -1;

        this.active = false;

        this.clockRunning = false;

        this.daySpeed = config.daySpeed;

        this.wasUsed = false;
        this.done = false;

        this.currentChapter;

        this.chapterProgress = {};

        this.totalExperienceTime = 0;

        this.idleTimer = 0;
        this.helpTimer = 0;
        this.inShow = false;
        this.usedSun = false;
        this.nowCount = 0;

        this.IDLE_TIMEOUT = 90;
        this.HELP_TIMEOUT = 30;
        this.NOW_HELP_TRIGGER = 3;
        this.characterPlaying = false;

        events.on("experience_end", () => {
            this.done = true;
        });

        events.on("character_playing", () => {
            this.characterPlaying = true;
        });
        events.on("character_idle", () => {
            this.characterPlaying = false;
        });
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

        this.isFirstChapter = true;
        
        //Load all sounds and create chapterSounds object to hold them
        this.chapterSounds = {};

        Promise.all([
            this.loadChapterSounds("VO", 7),
            this.loadChapterSounds("VO", 9),
            this.loadChapterSounds("VO", 12),
            this.loadChapterSounds("VO", 17),
            this.loadChapterSounds("VO", 19),
            this.loadChapterSounds("ambience", 7),
            this.loadChapterSounds("ambience", 9),
            this.loadChapterSounds("ambience", 12),
            this.loadChapterSounds("ambience", 17),
            this.loadChapterSounds("ambience", 19)   
        ]).then(sounds=>{
            sounds.forEach((sound)=>{
                if (!this.chapterSounds[sound.hour]) {
                    this.chapterSounds[sound.hour] = {};
                }
                this.chapterSounds[sound.hour][sound.type] = sound;
                console.log(sound);
            });
        }).catch(err=>{
            console.warn("An error with loading chapter sounds " + err);
        });

        console.log("Total experience time:", this.totalExperienceTime);

        events.on("chapter_threshold", (passed) => {
            this.active = !passed;
        });

        events.on("control_threshold", (passed) => {
            if (passed) {
                this.scene.remove(this.chapterTitle);
                console.log("Time contol thresholdPassed. Turn off ", this.square.currentSun, " Turn on ", this.currentHour.toString());
                if (this.square.currentSun) {
                    this.square.turnOffSun(this.square.currentSun);
                }
                this.square.currentSun = this.currentHour.toString();
                this.square.turnOnSun(this.currentHour.toString(), true);
                this.updateSunProgress();
            }
        });
        events.on("instructions_end", () => {
            this.clockRunning = true;
            this.isFirstChapter = false;
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
            this.active = true;
        });

        events.on("character_progress", (data) => {
            this.idleTimer = 0;
            this.helpTimer = 0;

            if (
                this.chapterProgress[this.currentChapter.hour] &&
                typeof(this.chapterProgress[this.currentChapter.hour][data.name]) != 'undefined'
            ) {
                this.chapterProgress[this.currentChapter.hour][data.name] = data.time;
                this.updateSunProgress();
                this.updateTotalTime();
            }            
        });

        events.on("show_start", () => {
            this.clockRunning = false;
            this.inShow = true;
            console.log("Time controller - Show start. Stopping clock");
        });
        events.on("show_end", () => {
            this.clockRunning = true;
            this.inShow = false;
            console.log("Time controller - Show end. Resuming clock");
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

        let NOWHELP_TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '70px Miriam Libre',
            fillStyle: '#bfbfbf',
             antialias: true,
             shadow: true
        }

        let SUN_TEXT_SCALE = this.config.platform == "desktop" ? 0.009 : 0.013;
        
        this.chapterTitle = new SpriteText2D("SPRITE", TEXT_DEFINITION)
        this.chapterTitle.scale.set(0.002, 0.002, 0.002);
        this.chapterTitle.visible = false;

        this.chapterTitleLineTwo = new SpriteText2D("SPRITE", TEXT_DEFINITION)
        this.chapterTitleLineTwo.visible = false;


        this.insideChapterTitle = new MeshText2D("", INSIDE_SUN_TEXT_DEFINITION);
        this.insideChapterTitle.scale.multiplyScalar(0.01);

        this.insideChapterTitleLineTwo = new MeshText2D("", INSIDE_TEXT_DEFINITION);
        this.insideChapterTitleLineTwo.scale.multiplyScalar(SUN_TEXT_SCALE);

        let nowText = (this.config.language == "eng") ? "Now:" : ":כעת";
        this.insideChapterTitleLineNow = new MeshText2D(nowText, INSIDE_TEXT_DEFINITION);
        this.insideChapterTitleLineNow.scale.multiplyScalar(SUN_TEXT_SCALE);

        let nowHelpText = (this.config.language == "eng") ? "Try a different sun" : "נסו שמש אחרת";
        this.insideChapterTitleLineNowHelp = new MeshText2D(nowHelpText, NOWHELP_TEXT_DEFINITION);
        this.insideChapterTitleLineNowHelp.scale.multiplyScalar(SUN_TEXT_SCALE);

        this.insideChapterTitle.visible = false;
        this.insideChapterTitleLineTwo.visible = false;
        this.insideChapterTitleLineNow.visible = false;
        this.insideChapterTitleLineNowHelp.visible = false;

        this.scene.add(this.insideChapterTitle);
        this.scene.add(this.insideChapterTitleLineTwo);
        this.scene.add(this.insideChapterTitleLineNow);
        this.scene.add(this.insideChapterTitleLineNowHelp);
        //DebugUtil.positionObject(this.insideChapterTitle, "Inside", true);
        //DebugUtil.positionObject(this.insideChapterTitleLineTwo, "Inside Line 2", true);

        //DebugUtil.positionObject(this.chapterTitle, "Outside title", true);
        this.chapterTitle.add(this.chapterTitleLineTwo);
        this.chapterTitleLineTwo.position.y = -30;
        this.scene.add(this.chapterTitle)

        this.helpText = this.generateHelpText();

        events.on("gaze_started", (hour) => {
            this.idleTimer = 0;
            this.helpTimer = 0;

            this.gazeHour = parseInt(hour);
            this.gazeCounter = 0;

            this.insideChapterTitle.visible = true;
            this.insideChapterTitleLineTwo.visible = true;

            this.showInsideChapterTitle(hour);

            console.log("Time controller - Starting gaze counter for target hour " + this.gazeHour);
        });

        events.on("gaze_current_started", (hour) => {
            this.insideChapterTitle.visible = true;
            this.insideChapterTitleLineTwo.visible = true;
            this.insideChapterTitleLineNow.visible = true;

            this.showInsideChapterTitle(hour);

            if (!this.usedSun) {
                this.nowCount++;
                if (this.nowCount >= this.NOW_HELP_TRIGGER) {
                    this.insideChapterTitleLineNowHelp.visible = true;
                }
            }

            console.log("Time controller - Starting gaze counter for current hour " + this.gazeHour, "now count",this.nowCount);
        });

        events.on("gaze_stopped", (hour) => {
            this.insideChapterTitle.visible = false;
            this.insideChapterTitleLineTwo.visible = false;
            this.sunWorld = null;
            this.gazeHour = -1;
        });

        events.on("gaze_current_stopped", (hour) => {
            this.insideChapterTitle.visible = false;
            this.insideChapterTitleLineTwo.visible = false;
            this.insideChapterTitleLineNow.visible = false;
            this.insideChapterTitleLineNowHelp.visible = false;
            this.sunWorld = null;
        });

        events.on("experience_end", () => {
            this.clockRunning = false;
        })
    }
    generateHelpText() {
        let TEXT_DEFINITION = {
             align: textAlign.center, 
             font: '70px Miriam Libre',
             fillStyle: '#bfbfbf',
             antialias: true,
             shadow: true
        }
        let text = new MultilineText(2, TEXT_DEFINITION, 100);
        text.init();

        if (this.config.platform == "desktop") {
            text.scale.multiplyScalar(0.00005);
            text.position.set(0, 0, -0.1001);
        } else {
            text.scale.multiplyScalar(0.001);
            text.position.set(0, 0, -1.56);
        }

        if (this.config.language == "heb") {
            text.setText([
                ",אם ברצונך לשנות את השעה",
                ".עליך להתמקד על אחת השמשות שמעליך",
            ]);
        } else {
            text.setText([
                "When you would like to change the time,",
                "Focus your gaze on one of the suns above.",
            ]);
        }

        text.hide(0);

        //DebugUtil.positionObject(text, "Help text");
        
        return text;
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
        this.experienceProgress = (sum / this.totalExperienceTime);
        //console.log("Total experience progress: ", sum + "/" + this.totalExperienceTime, this.experienceProgress);
        events.emit("experience_progress", this.experienceProgress);
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
        if (this.clockRunning && !this.done) {
            // Increase the idle timer
            this.idleTimer += dt;
            this.helpTimer += dt;

            if (this.idleTimer > this.IDLE_TIMEOUT) {
                console.log("Idle timer reached!", this.idleTimer);
                if (!this.characterPlaying) {
                    this.setDaySpeed(0.5);
                }
                this.idleTimer = 0;
                this.helpTimer = 0;
            }

            if (!this.usedSun && this.helpTimer > this.HELP_TIMEOUT) {
                this.helpTimer = 0;
                if (!this.characterPlaying) {
                    this.showHelp();
                    this.HELP_TIMEOUT = 60;
                }
            }

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
                if (roundHour != 0) {
                    this.setCurrentChapter();
                    console.log("Time - Updating next hour due to clock");
                    events.emit("hour_updated", roundHour);
                    if (this.square.currentSun) {
                        this.square.turnOffSun(this.square.currentSun);
                    }
                    this.square.currentSun = this.currentHour.toString();
                    this.square.turnOnSun(this.currentHour.toString(), true);
                    console.log("Time controller - next chapter");

                    if (!this.done) {
                        this.setDaySpeed(this.config.daySpeed);
                    }

                    if (this.config.platform == "vive") {
                        let previousHour = this.square.clockRotation * 180 / (Math.PI * 15);
                        this.rotateClockwork(previousHour, roundHour);
                    } else {
                        events.emit("angle_updated", roundHour);
                    }
                }
                this.updateNextHour();
            }
            //console.log("Current time: ", this.currentHour, this.clockRunning, this.done);
            this.sky.setTime(this.currentHour);
        }
        if (this.gazeHour != -1 && this.gazeHour != this.currentChapter.hour) {
            this.gazeCounter += dt;
            if (this.gazeCounter > 0.5 && this.sky.clouds.currentState != "transition" ) {
                this.sky.clouds.startTransition();
            }
            if (this.gazeCounter >= 3.2) {

                if (!this.usedSun) {
                    this.usedSun = true;
                    this.insideChapterTitleLineNowHelp.visible = false;
                    this.scene.remove(this.insideChapterTitleLineNowHelp);
                    if (this.helpText.parent == this.camera) {
                        this.camera.remove(this.helpText);
                    }
                }

                let targetHour = this.gazeHour;
                this.gazeHour = -1;
                this.clockworkTransitionTo(targetHour, 2,  true);

            }
        }
        if (this.sunWorld) {
            this.updateSunTitle();
        }
    }

    showHelp() {
        this.camera.add(this.helpText);
        this.helpText.show(1)
        .then(() => {
            setTimeout(() => {
                this.helpText.hide(1)
                .then(() => {
                    this.camera.remove(this.helpText);
                });
                this.helpTimer = 0;
            },5000);
        });
    }

    clockworkTransitionTo(targetHour, time, usingGaze) {
        return new Promise((resolve, reject) => {
            if (targetHour == 0) {
                targetHour = 24;
            }
            let baseHour = this.currentHour;
            console.log("Time controller - Performing transition to " + targetHour + "! Stopping clock");
            this.clockRunning = false;

            if (usingGaze) {
                this.square.explodeSun(targetHour.toString());
            }

            TweenMax.to(this, time, {ease: Power2.easeInOut, currentHour: targetHour, onComplete: () => {
                if (targetHour == 24) {
                    this.currentHour = 0;
                }
                if (usingGaze) {
                    this.sunGazer.stop();
                    this.sunGazer.active = false;
                    if (this.square.currentSun) {
                        this.square.turnOffSun(this.square.currentSun);
                    }
                    this.square.currentSun = this.currentHour.toString();
                    this.square.turnOnSun(this.currentHour.toString(), true);
                }
                this.setCurrentChapter();
                events.emit("hour_updated", this.currentHour);
                // Rotate the clockwork only on vive
                if (this.config.platform != "desktop") {
                    setTimeout(() => {
                        this.rotateClockwork(baseHour, targetHour);
                    },1000);
                } else {
                    events.emit("angle_updated", this.currentHour);
                    this.updateNextHour();
                    if (this.currentHour != 0 && !this.done) {
                        this.sunGazer.active = true;
                        console.log("Time controller Finished transition -Resuming clock")
                        this.clockRunning = true;
                    }
                }
            }, onUpdate: () => {
                //console.log("CURRENT HOUR", this.currentHour);
                this.sky.setTime(this.currentHour);
            }});
        })       
    }

    rotateClockwork(baseHour, targetHour) {
        console.log("Time controller rotating clockwork from " + baseHour + " to " + targetHour);
        let targetRotationY = targetHour * 15;
        targetRotationY *= Math.PI / 180;
        console.log("Time controller - rotating square from ", this.square.clockRotation, " to ", targetRotationY," Stopping clock");
        this.sunGazer.active = false;
        this.clockRunning = false;
        TweenMax.to(this.square, 7 * (Math.abs(targetHour - baseHour) * 0.5), {ease: Power2.easeInOut, delay: 1, clockRotation: targetRotationY, onComplete: () => {
            events.emit("angle_updated", this.currentHour);
            this.updateNextHour();
            if (this.currentHour == 0) {
                this.square.clockRotation = 0;
            } else if (!this.done) {
                this.sunGazer.active = true;
                if (!this.inShow) {
                    this.clockRunning = true;
                }
            }
        }, onUpdate: () => {events.emit("square_rotating")}});
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



        /*
    transitionToLocalTime(time) {
        return this.transitionTo(closestHour, time);
        }*/

    preloadLocalTime() {
        let now = new Date();
        let localTime = now.getHours() + (now.getMinutes() / 60);
        let availableTimes = this.times.slice(1);
        let closestHour = MathUtil.closestValue(availableTimes, localTime);
        console.log("Current local time ", localTime, "Available times", availableTimes, "Closest time", closestHour);
        events.emit("hour_updated", closestHour);
        return closestHour;
    }

    preloadTime(hour) {
        events.emit("hour_updated", hour);
    }

    transitionTo(hour, time, setChapter) {
        return new Promise((resolve, reject) => {
            let targetRotationY;
            if (hour == 0) {
                targetRotationY = 360;
            } else {
                targetRotationY = hour * 15;
            }
            console.log("Time transition - Square rotating to ", targetRotationY);
            TweenMax.to(this, time, {ease: Linear.easeNone, currentRotation: targetRotationY, onComplete: () => {
                this.currentHour = hour;
                if (this.currentHour == 0) {
                    this.currentRotation = 0;
                    this.updateSquare();
                }
                this.updateNextHour();
                this.setCurrentChapter();
                this.showChapterTitle();
                if (setChapter) {
                    events.emit("hour_updated", this.currentHour);
                }
                events.emit("angle_updated", this.currentHour);
                resolve();
            }, onUpdate: () => {
                this.updateSquare();
            }});
        });
    }
    rotate(angle, time) {
        return new Promise((resolve, reject) => {
            TweenMax.to(this, time, {ease: Linear.easeNone, currentRotation: angle, onComplete: () => {
            }, onUpdate: () => {
                this.updateSquare();
            }, onComplete: () => {resolve()} });
        });
    }

    setCurrentChapter() {
        this.currentChapter = _.find(Chapters, {hour: this.currentHour });
        if (this.config.language == "heb") {
            let hebChapter = _.find(ChaptersHeb, {hour: this.currentHour});
            MiscUtil.overwriteProps(this.currentChapter, hebChapter);
        }

        this.characterPlaying = false;

        this.clearVoiceovers();

        //Seven PM play call comes in the show_ended event since we want to delay it
        console.log("Chapter sound check ", this.currentHour, this.isFirstChapter, this.chapterSounds);
        if(this.currentHour != 19 && !this.isFirstChapter){
            let hour = this.currentHour;
            setTimeout(() => {
                this.playChapterSounds(hour);
            },1000);
        }
    }

   showChapterTitle() {
        // 0 is hidden for now
        if (this.currentChapter.hour == 0) { return; }

        let now = moment();

        let targetOpacity = 1.0;

        if (this.config.language == "eng") {
            this.chapterTitle.text = "Your Local Time " + now.format("HH:mm");
        } else {
            this.chapterTitle.text = "השעה כעת " + now.format("HH:mm");
        }
        this.chapterTitle.visible = true;
        this.chapterTitle.position.fromArray(this.currentChapter.titlePosition).add(this.square.position);
        this.chapterTitle.material.opacity = 0;

        this.chapterTitleLineTwo.text = this.currentChapter.name;
        this.chapterTitleLineTwo.visible = true;
        this.chapterTitleLineTwo.material.opacity = 0;

        TweenMax.to(this.chapterTitle.material, 1, {opacity: targetOpacity});
        TweenMax.to(this.chapterTitleLineTwo.material, 1, {opacity: targetOpacity});


        //document.getElementById("chapter-title-text").innerHTML = chapter.hour + ":00 - " + chapter.name;

        if (this.square.currentSun) {
            this.square.turnOffSun(this.square.currentSun);
        }
        this.square.currentSun = this.currentHour.toString();
        this.turnOnChapterSun(this.currentHour, true);
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
        let chapter = this.config.language == "eng" ?  _.find(Chapters, {hour: parseInt(hour)}) : _.find(ChaptersHeb, {hour: parseInt(hour)});
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

            if (this.insideChapterTitleLineNow.visible) {
                this.insideChapterTitleLineNow.position.copy(this.sunWorld);
                this.insideChapterTitleLineNow.lookAt(this.camera.position);
                this.insideChapterTitleLineNow.translateZ(5);
                this.insideChapterTitleLineNow.quaternion.copy(this.camera.quaternion);
                this.insideChapterTitleLineNow.translateY(2.5);

                if (this.insideChapterTitleLineNowHelp.visible) {
                    this.insideChapterTitleLineNowHelp.position.copy(this.sunWorld);
                    this.insideChapterTitleLineNowHelp.lookAt(this.camera.position);
                    this.insideChapterTitleLineNowHelp.translateZ(5);
                    this.insideChapterTitleLineNowHelp.quaternion.copy(this.camera.quaternion);
                    this.insideChapterTitleLineNowHelp.translateY(-2.5);
                }
            }
        }
    }

    turnOnChapterSun() {
        if (this.currentHour == 17 || this.currentHour == 9 ) {
            this.square.turnOnSun("9", true);
        } else if (this.currentHour == 19 || this.currentHour == 7) {
            this.square.turnOnSun("7", true);
        } else if (this.currentHour == 12) {
            this.square.turnOnSun("12", true);
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
        this.setCurrentChapter();
        this.showChapterTitle();
        this.updateNextHour();
    }

    clearVoiceovers() {
            _.forIn(this.chapterSounds,(chapterSound,hour) => {
                if (chapterSound.VO && chapterSound.VO.playedOnce) {
                    console.log("Clear chapter sound", hour, chapterSound.VO);
                    this.unloadChapterSound(chapterSound.VO);
                    delete this.chapterSounds[hour].VO;
                }    
            });
    } 

    unloadChapterSound(chapterSound){
        chapterSound.sampler.stop();
        chapterSound.sampler.unload();
    }
    loadChapterSounds(type, hour) {
        return new Promise((resolve, reject) => {
            if(type == "ambience"){
                this.soundManager.createStaticSoundSampler(
                    this.config.assetsHost + "assets/sound/chapter_vo/ambience/" + hour + "_" + type + ".ogg", 
                    (sampler) => {
                        resolve({
                            sampler: sampler,
                            type: type,
                            hour: hour
                        });
                
                    }
                );
            } else if (type == "VO"){
                this.soundManager.createStaticSoundSampler(
                    this.config.assetsHost + "assets/sound/chapter_vo/" + hour + "_" + this.config.language + ".ogg",
                    (sampler) => {
                        resolve({
                            sampler: sampler,
                            type: type,
                            hour: hour,
                            playedOnce: false
                        });
                    }
                );
            }
        });
    }
    playChapterSounds(hour){
        //Play the sounds
        if (this.chapterSounds[hour]){
            if(!this.chapterSounds[hour].VO){
                this.chapterSounds[hour].ambience.sampler.play();
            } else {
                this.chapterSounds[hour].VO.sampler.play();
                events.emit("chapter_sound_playing", true);
                this.chapterSounds[hour].VO.playedOnce = true;
                this.chapterSounds[hour].VO.sampler.source.onended = () =>{
                    events.emit("chapter_sound_playing", false);
                    this.clearVoiceovers();
                }
            }
        }
    }
}
