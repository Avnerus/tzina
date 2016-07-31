import VideoRGBD from './util/video_rgbd'

export default class Character extends THREE.Object3D {
    constructor(props) {
        super();
        this.videoRGBD = new VideoRGBD(props);

        console.log(props.name + " character constructed!");
        
        this.props = props;
    }
    init(loadingManager, animations) {
            this.videoRGBD.init(loadingManager);

            this.position.fromArray(this.props.position);

            this.rotation.set(
                this.props.rotation[0] * Math. PI / 180,
                this.props.rotation[1] * Math. PI / 180,
                this.props.rotation[2] * Math. PI / 180
            );

            this.add(this.videoRGBD.mesh);
            this.animation = animations[this.props.animation];
            this.add(this.animation);
            // this.animation.scale.set(0.01, 0.01, 0.01);
            this.animation.position.set(1,0,-2);
    }
    play() {
            this.videoRGBD.play();
    }
    update(dt,et) {
         this.videoRGBD.update(dt);
         this.animation.update(dt,et)
    }
}
