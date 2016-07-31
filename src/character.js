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
            fileName: props.basePath + "_full.webm",
            uvd: props.uvd,
            scale: props.scale
        });
        this.collisionManager = collisionManager;

        console.log(props.name + " character constructed!");
        
        this.props = props;

        this.playingFull = false;
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
                this.remove(this.animation);
                this.remove(this.fullVideo.mesh);
                this.idleVideo.mesh.visible = true;
                this.idleVideo.play();
                this.playingFull = false;
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
                this.animation.position.set(0,-1.5,-2.2);
                this.animation.rotation.x = 20 * Math.PI/180;
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
            if (this.animation) {
                this.animation.update(dt,et)
            }
        }
    }

    onCollision() {
        if (!this.playingFull && this.animation) {
            this.playingFull = true;
            console.log("Character collision!");
            this.idleVideo.pause();
            this.fullVideo.mesh.visible = true;
            this.animation.visible = true;
            this.animation.start()
            this.fullVideo.play();
        }
    }
}
