import VideoRGBD from './util/video_rgbd'

export default class Character {
    constructor(props) {
        console.log("Character constructed!")
        this.videoRGBD = new VideoRGBD(props);

        this.props = props;
    }
    init(scene) {
        this.videoRGBD.init();
        this.videoRGBD.position.set(this.props.position[0], this.props.position[1], this.props.position[2]);
        this.videoRGBD.rotation.set(
            this.props.rotation[0] * Math.PI / 180, 
            this.props.rotation[1] * Math.PI / 180, 
            this.props.rotation[2] * Math.PI / 180
        );

        this.videoRGBD.scale.set(0.02, 0.02, 0.02);

        scene.add(this.videoRGBD);


    }
    play() {
        this.videoRGBD.play();
    }
    update(dt) {
        this.videoRGBD.update(dt);
    }
}
