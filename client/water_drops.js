import DebugUtil from './util/debug'

export default class WaterDrops extends THREE.Object3D  {
    constructor(config) {
        super();

        this.active = false;
        this.fading = false;
        this.inControl = false;
        this.config = config;

        this.drops = [];
        this.timeSinceCollision = 0;
        this.timeSinceChange = 0;

    }
    init(loadingManager) {
        let map = new THREE.TextureLoader(loadingManager).load(this.config.assetsHost + "assets/drops/water_drop.png" );
        this.material = new THREE.SpriteMaterial( { map: map } );
        this.position.z = -0.5;

        this.FOUNTAIN_DISTANCE = this.config.platform == "vive" ? 15 : 15.3;

        //DebugUtil.positionObject(sprite, "Water drop");

        events.on("control_threshold", (passed) => {
            this.inControl = passed;
        });

        events.on("fountain_collision", (distance) => {
            //console.log("Fountain collision!", distance);
            if (distance < this.FOUNTAIN_DISTANCE) {
                this.timeSinceCollision = 0;
                if (this.inControl && !this.active) {
                    this.timeSinceChange = 0;
                    this.active = true;
                }
            }
        });
    }
    update(dt) {
        this.timeSinceCollision += dt;
        this.timeSinceChange += dt;
        if (this.active && this.timeSinceCollision > 2) {
            this.active = false;
            this.fading = true;
            TweenMax.to( this.material, 3, { opacity:0, 
                onComplete: () => {
                    this.drops.forEach((drop) => {
                        this.remove(drop);
                    });
                    this.drops.splice(0);
                    this.material.opacity = 1;
                    this.fading = false;
                } 
            });
        }
        if (this.active && !this.fading && this.timeSinceChange > 0.2 && this.drops.length < 100) {
            if (Math.random() < this.timeSinceChange) {
                this.timeSinceChange = 0;
                let sprite = new THREE.Sprite( this.material );
                sprite.position.x = Math.random() * 0.8 - 0.4;
                sprite.position.y = Math.random() * 0.4 - 0.2;
                let scale = Math.random() * 0.03;
                sprite.scale.set(scale, scale, scale);
                this.add( sprite );
                this.drops.push(sprite);
            }
        }
    }
}
