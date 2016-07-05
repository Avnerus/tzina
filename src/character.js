import VideoRGBD from './util/video_rgbd'

export default class Character {
    constructor(props) {
        this.videoRGBD = new VideoRGBD(props);

        console.log(props.name + " character constructed!");
        
        this.props = props;
    }
    init(scene, loadingManager) {
        setTimeout(()=> {
            this.videoRGBD.init(loadingManager);
            this.videoRGBD.position.set(this.props.position[0], this.props.position[1], this.props.position[2]);
            this.videoRGBD.rotation.set(
                this.props.rotation[0] * Math.PI / 180,
                this.props.rotation[1] * Math.PI / 180,
                this.props.rotation[2] * Math.PI / 180
            );

            this.videoRGBD.scale.set(0.005, 0.005, 0.005);

            scene.add(this.videoRGBD);

        },0)
    }
    play() {
        this.videoRGBD.play();
    }
    update(dt) {
        this.videoRGBD.update(dt);
    }
}
