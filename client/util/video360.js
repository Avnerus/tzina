const SEC_PER_360_FRAME = 1 / 25;

export default class Video360 {
    constructor(path, targetTexture) {
        this.path = path;
        console.log("Video360 constructed: " + this.path);
        this.targetTexture = targetTexture;

    }
    init() {
        this.video = document.createElement('video');
        this.video.loop = true;
        this.video.src = this.path;
        this.video.load();
        this.video.isPlaying = false;

        this.timer = 0;

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
        this.timer += dt;
        if (this.timer >= SEC_PER_360_FRAME) {
            this.timer = 0;
            if ( this.isPlaying && this.video.readyState === this.video.HAVE_ENOUGH_DATA ) {
                if (this.targetTexture) {
                    this.targetTexture.value = this.texture;
                }
                this.texture.needsUpdate = true;

            }
        }
    }
    play() {
        if ( this.isPlaying === true ) return;
        console.log("Video360 - play", this.path);
        this.video.play();
        this.isPlaying = true;
    }
    pause() {
        if ( this.isPlaying === false ) return;
        console.log("Video360 - pause");
        this.video.pause();
        this.isPlaying = false;
    }
    setRate(rate) {
        this.video.playbackRate = rate;
        console.log("Video360 playback rate = ", rate, this.video);
    }
    unload() {
        console.log("Video unload", this.path);
        this.pause();
        this.video.src = "";

        if (this.texture) {
            this.texture.dispose();
        }
    }
}
