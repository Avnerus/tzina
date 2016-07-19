import VideoRGBD from './util/video_rgbd'

export default class Character {
    constructor(props) {
        this.videoRGBD = new VideoRGBD(props);

        console.log(props.name + " character constructed!");
        
        this.props = props;
    }
    init(scene, loadingManager) {
            this.videoRGBD.init(scene, loadingManager);
            this.videoRGBD.position.set(this.props.position[0], this.props.position[1], this.props.position[2]);
            this.videoRGBD.rotation.set(
                this.props.rotation[0] * Math.PI / 180,
                this.props.rotation[1] * Math.PI / 180,
                this.props.rotation[2] * Math.PI / 180
            );

            //this.videoRGBD.scale.set(0.002 , 0.002, 0.002);

            //this.videoRGBD.updateMatrixWorld();
            

            //scene.add(this.videoRGBD);

            let geometry = new THREE.BoxGeometry( 1000, 1000, 1000  );
            var material = new THREE.MeshBasicMaterial( {color: 0x00ffff}  );
            var cube = new THREE.Mesh( geometry, material  );
            cube.scale.set(0.002, 0.002, 0.002);
            cube.position.x = 35;
            cube.position.y = 10;
            cube.position.z = 30;
            scene.add(cube);

    }
    play() {
        this.videoRGBD.play();
    }
    update(dt) {
        this.videoRGBD.update(dt);
    }
}
