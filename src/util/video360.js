export default class Video360 {
    constructor(path) {
        this.path = path;
        console.log("Video360 constructed: " + this.path);
    }
    init() {
        this.video = document.createElement('video');
        this.video.loop = true;
        this.video.src = this.path;
        this.video.load();
        this.video.play();

        this.texture = new THREE.Texture(this.video);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        //this.texture.format = THREE.RGBFormat;
        //this.texture.generateMipmaps = false;
    }

    isReady() {
        return ( this.video.readyState === this.video.HAVE_ENOUGH_DATA );
    }
    
    update(dt) {
        this.texture.needsUpdate = true;
    }
}
