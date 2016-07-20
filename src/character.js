import VideoRGBD from './util/video_rgbd'

export default class Character extends THREE.Object3D {
    constructor(props) {
        super();
        this.videoRGBD = new VideoRGBD(props);

        console.log(props.name + " character constructed!");
        
        this.props = props;
    }
    init(loadingManager) {
            this.videoRGBD.init(loadingManager);
            this.position.set(
                this.props.position[0],
                this.props.position[1],
                this.props.position[2]
            );
            this.add(this.videoRGBD.mesh);
    }
    play() {
            this.videoRGBD.play();
    }
    update(dt) {
         this.videoRGBD.update(dt);
    }
}
