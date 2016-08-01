import VideoRGBD from './util/video_rgbd'

export default class Character extends THREE.Object3D {
    constructor(props, collisionManager) {
        super();
        this.idleVideo = new VideoRGBD({
            mindepth: props.mindepth,
            maxdepth: props.maxdepth,
            fileName: props.basePath + "_idle.webm",
            uvd: props.uvd,
            scale: props.scale
        });

        this.fullVideo = new VideoRGBD({
            mindepth: props.mindepth,
            maxdepth: props.maxdepth,
            fileName: props.basePath + "_full.mp4",
            uvd: props.uvd,
            scale: props.scale
        });
        this.collisionManager = collisionManager;

        console.log(props.name + " character constructed!");
        
        this.props = props;

        this.playingFull = false;
        this.isPaused = false;
    }
    init(loadingManager, animations) {
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

            this.position.fromArray(this.props.position);

            this.rotation.set(
                this.props.rotation[0] * Math. PI / 180,
                this.props.rotation[1] * Math. PI / 180,
                this.props.rotation[2] * Math. PI / 180
            );

            if (this.props.animation) {
                this.animation = animations[this.props.animation];
                this.animation.position.fromArray(this.props.animationPosition);
                this.animation.rotation.set(
                    this.props.animationRotation[0] * Math. PI / 180,
                    this.props.animationRotation[1] * Math. PI / 180,
                    this.props.animationRotation[2] * Math. PI / 180
                );
                this.add(this.animation);
                this.animation.visible = false;
            } else {
                this.animation = null;
            }

            this.collisionManager.addCharacter(this);
    }
    play() {
        this.idleVideo.play();
    }

    
    update(dt,et) {
        if (!this.playingFull) {
            this.idleVideo.update(dt);
        } else {
            this.fullVideo.update(dt);
            if (this.timeSinceCollision > 2) {
                console.log("Time since collision ", this.timeSinceCollision, "Ending sequence");
                this.pauseFull();
            }
        }

        if (this.animation && this.animation.visible) {
            this.animation.update(dt,et)
        }
        this.timeSinceCollision += dt;
    }

    endFull() {
        this.animation.visible = false;
        this.fullVideo.pause();
        this.idleVideo.mesh.visible = true;
        this.fullVideo.mesh.visible = false;
        this.idleVideo.play();
        this.playingFull = false;
        let subtitlesVideo = document.getElementById("subtitles");
        subtitlesVideo.src = "";
    }


    pauseFull() {
        this.animation.visible = false;
        this.fullVideo.pause();
        this.idleVideo.mesh.visible = true;
        this.fullVideo.mesh.visible = false;
        this.idleVideo.play();
        this.playingFull = false;
        let subtitlesVideo = document.getElementById("subtitles");
        subtitlesVideo.pause();
        subtitlesVideo.style.display = "none";
        this.isPaused = true;
    }

    onCollision() {
        this.timeSinceCollision = 0;
        if (!this.playingFull && this.animation && !this.animation.visible) {
            console.log("Character collision!");
            //this.animation.visible = true;

            // load substitles video
            if (!this.isPaused) {
                this.animation.start()

                let subtitlesVideo = document.getElementById("subtitles");
                subtitlesVideo.src = this.props.basePath + "_subtitles.webm";
                subtitlesVideo.addEventListener('canplay',() => {
                    subtitlesVideo.play();
                    this.playFull();
                },false);
                subtitlesVideo.load();
               this.playFull();
            } else {
                console.log("Resume");
                let subtitlesVideo = document.getElementById("subtitles");
                subtitlesVideo.style.display = "block";
                subtitlesVideo.play();
                this.playFull();
            }
        }
    }

    playFull() {
        this.playingFull = true;
        this.idleVideo.pause();
        this.fullVideo.mesh.visible = true;
        //this.fullVideo.video.currentTime = 0;
        this.fullVideo.play();
    }
}
