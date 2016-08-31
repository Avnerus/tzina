import VideoRGBD from './util/video_rgbd'
import DebugUtil from './util/debug'

export default class Character extends THREE.Object3D {
    constructor(props, collisionManager, soundManager) {
        super();
        this.collisionManager = collisionManager;
        this.soundManager = soundManager;

        this.idleVideo = new VideoRGBD({
            mindepth: props.mindepth,
            maxdepth: props.maxdepth,
            fileName: props.basePath + "_idle.webm",
            uvdy: props.uvdy,
            uvdx: props.uvdx,
            scale: props.scale
        });

        this.fullVideo = new VideoRGBD({
            mindepth: props.mindepth,
            maxdepth: props.maxdepth,
            fileName: props.basePath + "_full.webm",
            uvdy: props.uvdy,
            uvdx: props.uvdx,
            scale: props.scale,
            volume: props.volume
        });

        console.log(props.name + " character constructed!");
        
        this.props = props;

        this.playingFull = false;
        this.isPaused = false;
        this.done = false;

        this.active = false;

        this.playedIntro = false;

        this.subtitlesReady = false;
        this.fullReady = false;

    }
    init(loadingManager) {
            this.idleVideo.init(loadingManager);
            this.fullVideo.init(loadingManager);

            this.fullVideo.mesh.visible = false;

            this.add(this.fullVideo.mesh);
            this.add(this.idleVideo.mesh);

            this.fullVideo.video.addEventListener('timeupdate',() => {
                if (this.playingFull && this.animation) {
                    this.animation.updateVideoTime(this.fullVideo.video.currentTime);
                }
            },false);

            this.fullVideo.video.addEventListener('ended',() => {
                console.log("Character video ended");
                this.endFull();
            },false);

            this.idleVideo.video.loop = true;
            this.fullVideo.video.loop = false;

            this.position.fromArray(this.props.position);

            this.rotation.set(
                this.props.rotation[0] * Math. PI / 180,
                this.props.rotation[1] * Math. PI / 180,
                this.props.rotation[2] * Math. PI / 180
            );

            if (this.animation) {
                this.animation.init(loadingManager);

                this.animation.scale.multiplyScalar(this.props.animationScale);
                this.animation.position.fromArray(this.props.animationPosition);
                this.animation.rotation.set(
                    this.props.animationRotation[0] * Math. PI / 180,
                    this.props.animationRotation[1] * Math. PI / 180,
                    this.props.animationRotation[2] * Math. PI / 180
                );
                //this.add(this.animation);
                this.animation.visible = false;
            } else {
                this.animation = null;
            }


            if (this.props.introSpace) {
                this.soundManager.loadPositionalSound(this.props.basePath + "_intro.ogg")
                .then((sound) => {
                    this.introSound = sound;
                    this.introSound.autoplay = false;
                    this.introSound.loop = false;
                    this.introSound.setRefDistance(7);
                    this.add(this.introSound);
                });
            } else {
                this.introSound = null;
            }

            events.on("character_playing", (name) => {
                if (this.active && !this.done && this.props.name != name) {
                    console.log(name, " is playing." , this.props.name, "is pausing");
                    this.idleVideo.pause();
                }                
            });
            events.on("character_idle", (name) => {
                if (this.active && !this.done && this.props.name != name) {
                    console.log(name, " is idle." , this.props.name, "is playing");
                    this.idleVideo.play();
                }                
            });


    }
    play() {
        console.log(this.props.name + " Play idle");
        if (!this.done) {
            this.idleVideo.play();
        }
    }

    load() {
        console.log("Character " + this.props.name + ": Load");
        if (!this.done) {
            this.idleVideo.load();
        }
        this.active = true;
    }

    unload() {
        this.fullVideo.unload();
        this.idleVideo.unload();
        if (this.subtitlesVideo) {
            this.subtitlesVideo.src = "";
        }
        //this.remove(this.animation);
        this.active = false;
    }
    
    update(dt,et) {
        if (!this.done) {
            if (!this.playingFull) {
                this.idleVideo.update(dt);
            } else {
                this.fullVideo.update(dt);
                if (this.timeSinceCollision > 2) {
                    console.log("Time since collision ", this.timeSinceCollision, "Ending sequence");
                    this.pauseFull();
                }
            }
        }
        if (this.animation && this.animation.visible) {
            this.animation.update(dt,et)
        }
        this.timeSinceCollision += dt;
    }

    endFull() {
        this.fullVideo.pause();
        this.fullVideo.unload();

        this.idleVideo.pause();
        this.idleVideo.unload();

        this.idleVideo.mesh.visible = false;
        this.fullVideo.mesh.visible = false;
        this.playingFull = false;
        if (this.props.subtitles) {
            this.subtitlesVideo.src = "";
        }
        this.isPaused = false;
        this.done = true;
        events.emit("character_idle", this.props.name)
        events.emit("character_ended", this.props.name)
    }


    pauseFull() {
        if (this.animation) {
            this.animation.visible = false;
        }
        this.fullVideo.pause();
        this.idleVideo.mesh.visible = true;
        this.fullVideo.mesh.visible = false;
        this.idleVideo.play();
        this.playingFull = false;
        if (this.props.subtitles) {
            this.subtitlesVideo.pause();
            this.subtitlesVideo.style.display = "none";
        }
        this.isPaused = true;
        events.emit("character_idle", this.props.name)
    }

    onCollision() {
        this.timeSinceCollision = 0;
        if (!this.playingFull && !this.done) {
            this.playingFull = true;
            console.log(this.props.name + " - Loading full video ");
            if (this.animation) {
                this.animation.visible = false;
                this.add(this.animation);
            }

            // load subtitles video
            if (!this.isPaused) {

                if(this.props.subtitles) {
                    this.subtitlesVideo = document.getElementById("subtitles");
                    this.subtitlesVideo.addEventListener('canplay',() => {
                        if (!this.subtitlesReady) {
                            console.log(this.props.name + " - Subtitles Ready");
                            this.subtitlesReady = true;
                            this.checkReady();
                        }
                    },false);
                    this.subtitlesVideo.src = this.props.basePath + "_subtitles.webm";
                    this.subtitlesVideo.load();
                }
                this.fullVideo.video.addEventListener('canplay',() => {
                    if (!this.fullReady) {
                        console.log(this.props.name + " - Full video ready");
                        this.fullReady = true;
                        this.checkReady();
                    }
                },false);
                this.fullVideo.load();
                this.fullVideo.pause();

            } else {
                console.log("Resume");
                if (this.props.subtitles) {
                    this.subtitlesVideo.style.display = "block";
                    this.subtitlesVideo.play();
                }
                this.playFull();
            }
        }
    }

    checkReady() {
        if (this.fullReady && (this.subtitlesReady || !this.props.subtitles)) {
            if (this.animation) {
                this.animation.start()
            }
            this.playFull();
        }
        
    }

    onIntro() {
        if (!this.playedIntro && this.introSound) {
            console.log(this.props.name, " - Playing intro", this.introSound);
            this.playedIntro = true;
            this.introSound.play();
        }
    }

    playFull() {
        this.playingFull = true;
        this.idleVideo.pause();
        if (this.introSound) {
            this.introSound.pause();
        }
        this.fullVideo.mesh.visible = true;
        this.idleVideo.mesh.visible = false;
/*
        if (this.props.name == "Hannah") {
            this.fullVideo.video.currentTime = 285;
        } else {
            this.fullVideo.video.currentTime = 250;
        }*/

        this.fullVideo.play();
        if (this.subtitlesReady) {
            this.subtitlesVideo.style.display = "block";
            this.subtitlesVideo.play();
        }
        if (this.animation) {
            this.animation.visible = true;
        }
        events.emit("character_playing", this.props.name)
    }
}
