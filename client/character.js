import VideoRGBD from './util/video_rgbd'
import DebugUtil from './util/debug'

export default class Character extends THREE.Object3D {
    constructor(config, props, collisionManager, soundManager, scene) {
        super();
        this.collisionManager = collisionManager;
        this.soundManager = soundManager;
        this.config = config;
        this.inControl = false;

        this.debug = true;
        this.inShow = false;
        this.scene = scene;

        if (config.assetsHost) {
            props.basePath = config.assetsHost + props.basePath;
        }

        console.log("Character base path", props.basePath);

        if (!props.fullOnly) {
            this.idleVideo = new VideoRGBD({
                mindepth: props.mindepth,
                maxdepth: props.maxdepth,
                fileName: props.basePath + "_idle.webm",
                uvdy: props.uvdy_idle ? props.uvdy_idle : props.uvdy,
                uvdx: props.uvdx_idle ? props.uvdx_idle : props.uvdx,
                scale: props.scale,
                width: props.width,
                height: props.height,
                volume: props.event ? 1 : 0,
                fps: props.event ? 25 : 15,
            });
        }

        if (!props.idleOnly) {
            this.fullVideo = new VideoRGBD({
                mindepth: props.mindepth,
                maxdepth: props.maxdepth,
                fileName: props.basePath + "_full.webm",
                uvdy: props.uvdy,
                uvdx: props.uvdx,
                scale: props.scale,
                volume: props.volume,
                width: props.width,
                height: props.height,
                fps: 25
            });
        }


        console.log(props.name + " character constructed!");

        this.props = props;

        this.playingFull = false;
        this.isPaused = false;
        this.done = false;

        this.active = false;
        this.onHold = false;

        this.playedIntro = false;

        this.subtitlesReady = false;
        this.fullReady = false;
        this.audioReady = false;
        this.ambientReady = false;

        this.nextAdjustment = null;
        this.lastAdjustment = null;

        this.adjustments = null;

        this.colliding = false;
        this.audio = null;
        this.ambientAudio = null;
    }
    init(loadingManager) {
            this.position.fromArray(this.props.position);

            this.rotation.set(
                this.props.rotation[0] * Math. PI / 180,
                this.props.rotation[1] * Math. PI / 180,
                this.props.rotation[2] * Math. PI / 180
            );

            if (this.animation) {
                if(!this.animation.initialized) {
                    this.animation.init(loadingManager);
                    this.animation.initialized = true;
                }

                // move to load()
                /*
                this.animation.scale.multiplyScalar(this.props.animationScale);
                this.animation.position.fromArray(this.props.animationPosition);
                this.animation.rotation.set(
                    this.props.animationRotation[0] * Math. PI / 180,
                    this.props.animationRotation[1] * Math. PI / 180,
                    this.props.animationRotation[2] * Math. PI / 180
                );
                */
                if (!this.props.fullOnly) {
                    this.animation.visible = false;
                }  else {
                    console.log(this.props.name, "Showing animation");
                    this.animation.visible = true;
                }
            } else {
                this.animation = null;
            }

            events.on("chapter_sound_playing", (isIt)=>{
                if(isIt){
                    this.hold(false);
                } else {
                    this.unhold();
                }
            });

            events.on("character_playing", (name) => {
                if (this.idleException(name)) {
                    return;
                }
                if (this.props.name != name &&
                    this.props.name != "FatmanShower" && this.props.name != "FatmanSleep")  {
                    this.hold(true);
                }
            });
            events.on("character_idle", (name) => {
                if (this.idleException(name)) {
                    return;
                }
                if (this.props.name != name) {
                    this.unhold();
                }
            });

            events.on("control_threshold", () => {
                this.inControl = true;
                setTimeout(() => {
                    if (this.onHold && this.active && !this.inShow) {
                        if (!this.props.fullOnly) {
                            this.idleVideo.setOpacity(1.0);
                            this.idleVideo.play();
                        }
                        this.onHold = false;
                    }
                },500);
            });

            events.on("show_start", () => {this.inShow = true});
            events.on("show_end", () => {this.inShow = false});

            if (this.props.event) {
                events.on("square_rotating", () => {
                    this.updateAudioPosition();
                });
            }

        //events.on("experience_end", () => {this.unload()});
    }
    idleException(name) {
        if (
            (name == "Lupo5PM" && this.props.name == "LupoDogs5PM" ) ||
            (name == "Lupo12PM" && this.props.name == "LupoDogs12PM" ) ||
            (name == "Agam12PM" && this.props.name == "FatmanSleep" )
        )  {
            return true;
        } else {
            return false;
        }
    }
    hold(freeze) {
        if (this.active && !this.done && !this.ending) {
            this.onHold = true;
            console.log(this.props.name, "is pausing");
            if (!this.props.fullOnly) {
                if (freeze) {
                    this.idleVideo.pause();
                }
                this.idleVideo.setOpacity(0.5);
            }
        }
    }
    unhold() {
        if (this.active && this.onHold && !this.done && !this.ending) {
            this.onHold = false;
            console.log(name, " is idle." , this.props.name, "is playing");
            if (!this.props.fullOnly) {
                this.idleVideo.setOpacity(1.0);
                this.idleVideo.play();
            }
        }
    }
    play() {
        if ((!this.done || this.ending) && !this.props.fullOnly) {
            console.log(this.props.name + " Play idle video");
            this.idleVideo.load();
            this.idleVideo.setVisible(true);

            if (this.inControl) {
                this.idleVideo.play();
            } else {
                this.idleVideo.play();
                setTimeout(() => {
                    console.log(this.props.name + " Character video idle pausing because in intro");
                    this.onHold = true;
                    this.idleVideo.pause();
                    this.idleVideo.setOpacity(0.5);
                },7000);
            }

            if (this.ending) {
                let fade = {opacity: 0};
                this.idleVideo.setOpacity(fade.opacity);
                TweenMax.to(fade, 1.0, { opacity:1.0, onComplete: () => {
                    this.idleVideo.pause();
                }, onUpdate: () => {
                    this.idleVideo.setOpacity(fade.opacity);
                }});
            }

            if (this.props.event) {
                // for event character
                if (this.animation) {
                    this.animation.visible = true;
                }
                //Load the positional dialog audio
                this.loadAudio()
                .then(() => {
                    this.soundManager.panorama.append(this.audio);
                    this.audio.play();
                });

                setTimeout(() => {
                    events.emit("character_playing", this.props.name)
                },5000);
                this.idleVideo.video.loop = false;
                this.idleVideo.video.addEventListener('ended',() => {
                    console.log(this.props.name, "Character video ended");
                    this.idleVideo.pause();
                    this.idleVideo.unload();
                    this.soundManager.panorama.detach(this.audio);
                    this.audio.stop();
                    this.audio.unload();
                    this.remove(this.idleVideo.mesh);
                    if (this.idleVideo.wire) {
                        this.remove(this.idleVideo.wire);
                    }
                    if (this.animation) {
                        this.remove(this.animation);
                    }
                    this.done = true;
                    events.emit("character_idle", this.props.name)
                    events.emit("character_ended", this.props.name)
                });
                this.idleVideo.video.addEventListener('timeupdate',() => {
                    if (this.animation) {
                        this.animation.updateVideoTime(this.idleVideo.video.currentTime);
                    }
                },false);
            }
        }
    }

    load(ending) {
        console.log("Character " + this.props.name + ": Load");
        this.ending = ending;
        let withWire = this.ending ? false : true;
        if (!this.done || ending) {
            if (this.props.adjustments) {
                this.adjustments = this.props.adjustments.slice(0);
                this.nextAdjustment = this.adjustments.shift();
            }

            if (!this.props.fullOnly) {
                this.idleVideo.init(withWire);
                this.idleVideo.video.loop = true;
                this.add(this.idleVideo.mesh);
                if (this.idleVideo.wire) {
                    this.add(this.idleVideo.wire);
                }

                if (this.ending) {
                    this.idleVideo.multiplyScale(this.props.endingScaleMul);
                }
            }
            
            if (!this.props.idleOnly && !this.ending) {
                this.fullVideo.init();
                this.fullVideo.mesh.visible = false;
                this.fullVideo.wire.visible = false;

                console.log(this.props.name, "Adding video mesh ", this.fullVideo.video)
                this.add(this.fullVideo.mesh);
                this.add(this.fullVideo.wire);

                this.fullVideo.video.addEventListener('timeupdate',() => {
                    if (this.playingFull) {
                        if (this.animation) {
                            this.animation.updateVideoTime(this.fullVideo.video.currentTime);
                        }

                        if (this.nextAdjustment && this.fullVideo.video.currentTime >= this.nextAdjustment.sec) {
                            this.adjust();
                        }
                        events.emit("character_progress", {name: this.props.name, time: this.fullVideo.video.currentTime});
                    }
                },false);

                this.fullVideo.video.addEventListener('ended',() => {
                    console.log("Character video ended");
                    this.endFull();
                },false);

                this.fullVideo.video.loop = false;
            }

            if (this.animation) {
                this.add(this.animation);
                if(this.animation.callbackAfterLoaded) this.animation.afterLoaded();

                this.animation.scale.set(this.props.animationScale,this.props.animationScale,this.props.animationScale);
                this.animation.position.fromArray(this.props.animationPosition);
                this.animation.rotation.set(
                    this.props.animationRotation[0] * Math. PI / 180,
                    this.props.animationRotation[1] * Math. PI / 180,
                    this.props.animationRotation[2] * Math. PI / 180
                );
                if (!this.props.fullOnly) {
                    this.animation.visible = false;
                } 
            }
        }

        if (ending) {
            this.position.fromArray(this.props.endingPosition);
            this.rotation.set(
                this.props.endingRotation[0] * Math. PI / 180,
                this.props.endingRotation[1] * Math. PI / 180,
                this.props.endingRotation[2] * Math. PI / 180
            );
        }
        this.active = true;
        this.onHold = false;
    1}

    unload() {
        console.log("Character " + this.props.name + " Unload");
        if (!this.done) {
            if (this.fullVideo) {
                this.fullVideo.unload();
            }
            if (this.idleVideo) {
                this.idleVideo.unload();
            }
            if (this.subtitlesVideo) {
                this.subtitlesVideo.src = "";
            }
            if (this.audio) {
                this.soundManager.panorama.detach(this.audio);
                this.audio.stop();
                this.audio.unload();
            }
            if(this.ambientAudio && this.props.hasAmbience){
                this.ambientAudio.stop();
                this.ambientAudio.unload();
            }

            // revert evn light changes if any
            if(this.animation){
                if (this.animation.envLightChanged) {
                    this.animation.skyLightBack();
                }
            }            
        }
        //this.remove(this.animation);
        this.active = false;
        this.isPaused = false;
        this.playingFull = false;
        this.subtitlesReady = false;
        this.audioReady = false;
        this.ambientReady = false;
        this.fullReady = false;

        this.nextAdjustment = null;
        this.lastAdjustment = null;

        this.adjustments = null;

        this.colliding = false;

        // attach animation back
        if (this.props.adjustments) {
            this.attach( this.animation, this.scene, this );
        }
    }

    update(dt,et) {
        if (!this.done || this.ending) {
            if (!this.playingFull && !this.props.fullOnly) {
                this.idleVideo.update(dt);
            } else if (this.playingFull) {
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
        console.log(this.props.name, "Video end full");
        this.fullVideo.pause();
        this.fullVideo.unload();

        this.soundManager.panorama.detach(this.audio);
        this.audio.stop();
        this.audio.unload();

        if(this.props.hasAmbience){
            this.ambientAudio.stop();
            this.ambientAudio.unload();
        }
        

        if (!this.props.fullOnly) {
            this.idleVideo.pause();
            this.idleVideo.unload();
            this.remove(this.idleVideo.mesh);
            if (this.idleVideo.wire) {
                this.add(this.idleVideo.wire);
            }
        }

        this.remove(this.fullVideo.mesh);
        if (this.fullVideo.wire) {
            this.remove(this.fullVideo.wire);
        }

        if (this.props.event) {
            this.remove(this.animation);
        }

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
        console.log(this.props.name, "Video pause full");
        if (!this.props.fullOnly) {
            if (this.animation) {
                this.animation.visible = false;
            }
            this.idleVideo.setVisible(true);
            this.idleVideo.play();
        }
        this.fullVideo.pause();
        if (this.audio) {
            this.audio.pause();         
        }
        if(this.ambientAudio && this.props.hasAmbience){
            this.ambientAudio.pause();
        }

        this.fullVideo.setVisible(false);
        this.playingFull = false;
        if (this.props.subtitles) {
            this.subtitlesVideo.pause();
            this.subtitlesVideo.style.display = "none";
        }
        this.isPaused = true;
        events.emit("character_idle", this.props.name)

        if (this.lastAdjustment) {
            console.log("Character was adjusted - reverting")
            this.position.fromArray(this.props.position);
        }
    }
    adjust() {
        this.fullVideo.setDepth(this.nextAdjustment.mindepth, this.nextAdjustment.maxdepth);
        console.log(this.props.name + " Adjustment!!", this.nextAdjustment.sec);

        if (this.nextAdjustment.scale) {
            this.fullVideo.setScale(this.nextAdjustment.scale);
        }
        if (this.nextAdjustment.position) {
            // ANIMATION Offset
            // let aniPosAdjust = new THREE.Vector3().fromArray(this.nextAdjustment.position);
            // aniPosAdjust.sub(new THREE.Vector3().fromArray(this.props.position));
            // aniPosAdjust.multiplyScalar(this.props.scale);
            // this.animation.position.add(aniPosAdjust);

            // LAURA Mesh position offset?
            // let possitionOffset = new THREE.Vector3().fromArray(this.nextAdjustment.position).sub(new THREE.Vector3().fromArray(this.props.position));
            // possitionOffset.add(this.fullVideo.mesh.position);
            // this.fullVideo.setPosition(possitionOffset);
            

            if(this.nextAdjustment.sec!=0 && this.animation && !this.animation.beDetached){
                this.detach( this.animation, this, this.scene );
                console.log("detach animation!");
                this.animation.beDetached = true;
            }
    
            this.position.fromArray(this.nextAdjustment.position);
            // this.attach( this.animation, this.scene, this );
        } else if (this.lastAdjustment && this.lastAdjustment.position) {
            this.nextAdjustment.position = this.lastAdjustment.position.slice(0);
        }

        this.lastAdjustment = this.nextAdjustment;
        if (this.adjustments.length > 0) {
            this.nextAdjustment = this.adjustments.shift();
        } else {
            this.nextAdjustment = null;
        }
        console.log(this.props.name + " last adjustment ", this.lastAdjustment);
    }
    detach ( child, parent, scene ) {
        if (child && parent && scene) {
            child.applyMatrix( parent.matrixWorld );
            parent.remove( child );
            scene.add( child );
        }
    }

    attach ( child, scene, parent ) {
        if (child && parent && scene) {
            var matrixWorldInverse = new THREE.Matrix4();
            matrixWorldInverse.getInverse( parent.matrixWorld );
            child.applyMatrix( matrixWorldInverse );

            scene.remove( child );
            parent.add( child );
        }
    }
    onCollision() {
        //console.log("Collision!! ", this.onHold, this.props.name, this.inControl, this.active, this.playingFull, this.done);
        this.timeSinceCollision = 0;
        if (this.active && !this.colliding) {
            this.colliding = true;
            // Avoiding 2 collisions at the same time
            setTimeout(() => {
                this.colliding = false;
                if (this.active && this.inControl && !this.playingFull && !this.onHold && !this.done) {
                    this.playingFull = true;
                    console.log(this.props.name + " - Loading full video ");
                    if (this.animation && !this.props.fullOnly) {
                        this.animation.visible = false;
                    }

                    if (!this.isPaused) {

                        // load subtitles video
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

                        // Load dialog audio
                        this.loadAudio()
                        .then((audio) => {
                            this.audioReady = true;
                            this.checkReady();
                        });
                        if(this.props.hasAmbience){
                            // Load ambient audio
                            this.loadCharacterAmbience()
                            .then((audio)=>{
                                this.ambientReady = true;
                                this.checkReady();
                            });
                        }
                      
                    } else {
                        console.log(this.props.name + " Resume");
                        if (this.props.subtitles) {
                            this.subtitlesVideo.style.display = "block";
                            this.subtitlesVideo.play();
                        }
                        this.playFull();
                    }
                }
            }, Math.floor(Math.random() * 100) )
        }

    }
    
    loadAudio() {
        console.log("The current character sound is " + this.props.name);
        return new Promise((resolve, reject) => {
            console.log("Loading character audio", this.props.basePath + "_" + this.config.language + ".ogg");
            this.soundManager.createPositionalSoundSampler(this.props.basePath + "_" + this.config.language + ".ogg",(sampler) => {
                console.log("Loaded character audio ", sampler);                              
                this.audio = sampler;
                this.audio.controlVolume(2.0);
                this.updateAudioPosition();

                resolve(sampler);
            });
        });
    }

    loadCharacterAmbience() {
        return new Promise((resolve, reject) => {
            let relPath = this.config.assetsHost + "assets/sound/character_ambience/" + this.props.name + ".ogg";
            console.log("Loading characters ambience ", relPath);
            this.soundManager.createStaticSoundSampler(relPath, sampler=> {
                console.log("Loaded characters ambience ", sampler);
                this.ambientAudio = sampler;
                resolve(sampler);
            });
        });
    }

    updateAudioPosition() {
        // Position audio
        if (this.audio) {
            this.updateMatrixWorld();
            let worldPos = new THREE.Vector3().setFromMatrixPosition(this.matrixWorld);
            //console.log("Setting character audio position: ", worldPos);                              
            this.audio.position.set(worldPos.x, worldPos.y, worldPos.z);
        }
    }

    checkReady() {
        console.log(this.props.name, "Checking ready");
        if (this.fullReady && 
            this.audioReady && 
	    this.active && !this.onHold &&
            (this.ambientReady || !this.props.hasAmbience)&& 
            (this.subtitlesReady || !this.props.subtitles)) {
        
            if (this.animation) {
                this.animation.start(this.props.name);
            }
            console.log("Check ready adjustment", this.nextAdjustment);
            if (this.nextAdjustment && this.nextAdjustment.sec == 0) {
                this.adjust();
            }
            this.playFull();

            if (this.debug) {
                events.emit("add_gui", {folder: this.props.name}, this , "pauseFullDebug");
                events.emit("add_gui", {folder: this.props.name}, this , "playFullDebug");
            }
        }

    }

    pauseFullDebug() {
       this.fullVideo.pause();
    }

    playFullDebug() {
       this.fullVideo.play(); 
    }

    playFull() {
        if (this.fullVideo.mesh) {
            this.playingFull = true;
            if (this.idleVideo) {
                this.idleVideo.pause();
                if (this.idleVideo.mesh) {
                    this.idleVideo.setVisible(false);
                }
            }
            this.fullVideo.setVisible(true);

            if (this.lastAdjustment && this.lastAdjustment.position) {
                this.position.fromArray(this.lastAdjustment.position);
            }

            if(this.config.skipCharacters) {
                DebugUtil.fastForward(this.fullVideo.video);
            }

            this.fullVideo.play();
            if (this.audio) {
                this.soundManager.panorama.append(this.audio);
                this.audio.play();
            }

            if(this.ambientAudio && this.props.name != this.ambienceExceptions) {
                this.ambientAudio.play();
            }
        
            if (this.subtitlesReady) {
                this.subtitlesVideo.style.display = "block";
                this.subtitlesVideo.play();
            }
            if (this.animation) {
                setTimeout(() => {
                    this.animation.visible = true;
                },1000)
            }
            events.emit("character_playing", this.props.name)
        } else {
            console.log("Cannot play video!", this.props.name);
        }
    }
}
