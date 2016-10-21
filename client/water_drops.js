export default class WaterDrops extends THREE.Object3D  {
    constructor() {
        super();

    }
    init(loadingManager) {
        let map = new THREE.TextureLoader(loadingManager).load( "assets/drops/teddy.png" );
        let material = new THREE.SpriteMaterial( { map: map } );
        let sprite = new THREE.Sprite( material );
        this.add( sprite );
    }
}
