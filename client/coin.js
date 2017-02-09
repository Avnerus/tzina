import Chapters from './chapters'
import DebugUtil from './util/debug'
import _ from 'lodash'

export default class Coin extends THREE.Object3D  {
    constructor(character_controller) {
        super();
        this.character_controller = character_controller;
        this.BASE_PATH = 'assets/animations/coin/';
    }
    init(loadingManager) {
        
        this.coins = {};
        this.activeCoins = [];
        this.beLookedCount = 0;

        let tex_loader = new THREE.TextureLoader(loadingManager);
        let tex_map = tex_loader.load( this.BASE_PATH + "images/coin.jpg" );
        let NRM_map = tex_loader.load( this.BASE_PATH + "images/coin_NRM.png" );
        let DISP_map = tex_loader.load( this.BASE_PATH + "images/coin_DISP.png" );
        this.coinMat = new THREE.MeshPhongMaterial( {
            color: 0xa7874c,
            normalMap: NRM_map,
            specular: 0x110e02,
            shininess: 76
        } );
        
        this.loadCoin( this.BASE_PATH + "/models/coin.json" )
        .then( (coinModel) => {
            this.coinModel = coinModel;

            for (var key in this.character_controller.characters) {
                if (this.character_controller.characters.hasOwnProperty(key)) {
                    var coinSet = {};
                    coinSet.coin = this.coinModel.clone();
                    coinSet.coin.visible = false;

                    coinSet.character = this.character_controller.characters[key];
                    coinSet.coin.position.copy(coinSet.character.position);
                    this.coins[key] = coinSet;

                    this.add(coinSet.coin);
                }
            }
            //console.log(this.coins);
            DebugUtil.positionObject(this.coins['Mark'].coin, "Mark Coin");
        });

        

        events.on("hour_updated", (hour) => {
            this.loadHour(hour);            
        });
    }

    updateCoinPosition() {
        for (var key in this.coins) {
            this.coins[key].coin.position.copy(this.coins[key].character.position);
        }
    }

    loadCoin( modelFile ) {
        let promise = new Promise( (resolve, reject) => {

            let loader = new THREE.JSONLoader(this.loadingManager);
            let coinModel;
            loader.load( modelFile, (geometry)=>{
                this.coinGeo = geometry;
                coinModel = new THREE.Mesh(this.coinGeo, this.coinMat);
                //coinModel.scale.multiplyScalar(5);

                resolve( coinModel );
            } );            
        });
        return promise;
    }

    loadHour(hour) {
        let chapter = _.find(Chapters, {hour});

        for (var key in this.coins) {
            this.coins[key].coin.visible = false;
        }

        chapter.characters.forEach((characterName) => {
            this.coins[characterName].coin.visible = true;
        });
    }

    update(camera) {
        // if camera.y < xxx => bend down
        // rotate/spin + fade out
        // report to coinMaster
    }
}
