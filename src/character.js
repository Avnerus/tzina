import VideoRGBD from './util/video_rgbd'

export default class Character extends THREE.Object3D {
    constructor(props, collisionManager) {
        super();
        this.idleVideo = new VideoRGBD({
            mindepth: props.mindepth,
            maxdepth: props.maxdepth,
            fileName: props.basePath + "_idle.webm"
        });

        this.fullVideo = new VideoRGBD({
            mindepth: props.mindepth,
            maxdepth: props.maxdepth,
            fileName: props.basePath + "_full.webm"
        });
        this.collisionManager = collisionManager;

        console.log(props.name + " character constructed!");
        
        this.props = props;

        this.playingFull = false;
    }
    init(loadingManager, animations) {
            this.idleVideo.init(loadingManager);
            this.fullVideo.init(loadingManager);

            this.fullVideo.video.addEventListener('timeupdate',() => {
                if (this.playingFull && this.animation) {
                    this.animation.updateVideoTime(this.fullVideo.video.currentTime);
                }
            },false);


            this.idleVideo.video.loop = true;

            this.position.fromArray(this.props.position);

            this.rotation.set(
                this.props.rotation[0] * Math. PI / 180,
                this.props.rotation[1] * Math. PI / 180,
                this.props.rotation[2] * Math. PI / 180
            );
            this.add(this.idleVideo.mesh);
            this.animation = animations[this.props.animation];
            this.animation.position.set(1,0,-2);

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
            this.animation.update(dt,et)
        }
    }

    onCollision() {
        if (!this.playingFull) {
            this.playingFull = true;
            console.log("Character collision!");
            this.idleVideo.pause();
            this.remove(this.idleVideo.mesh);
            this.add(this.fullVideo.mesh);
            this.add(this.animation);
            this.animation.start()
            this.fullVideo.play();
        }
    }
}
