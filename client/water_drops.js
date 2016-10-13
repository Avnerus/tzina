import DebugUtil from './util/debug'

export default class WaterDrops extends THREE.Object3D  {
    constructor() {
        super();

    }
    init(loadingManager) {
        let map = new THREE.TextureLoader(loadingManager).load( "assets/drops/water_drop.png" );
        let material = new THREE.SpriteMaterial( { map: map } );
        this.position.z = -0.5;

        //DebugUtil.positionObject(sprite, "Water drop");

        for (let i = 0; i < 60; i++ ) {
            let sprite = new THREE.Sprite( material );
            sprite.position.x = Math.random() * 0.8 - 0.4;
            sprite.position.y = Math.random() * 0.4 - 0.2;
            let scale = Math.random() * 0.03;
            sprite.scale.set(scale, scale, scale);
            this.add( sprite );
        }
    }
}
