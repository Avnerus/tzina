//import Chapters from './chapters'
import DebugUtil from './util/debug'
//import _ from 'lodash'

export default class Coin extends THREE.Object3D  {
    constructor(character_controller) {
        super();
        this.character_controller = character_controller;
        this.BASE_PATH = 'assets/animations/coin/';
    }
    init(loadingManager) {
        
        this.coins = {};    // name --> coin
                            //      --> beLooked
        this.coinsOffset = {
            "Meir": [0.5, -0.95, 1.35],
            "Rami": [-0.3, -0.9, 0],
            "Mark": [0.27, -0.63, -0.77],
            "Hannah": [0.14, -0.84, 0.79],
            "Itzik": [-0.85, -0.84, 0.57],
            "Lupo12PM": [0.56, -0.78, 1.17],
            "Lupo5PM": [0, -0.77, 0],
            "Haim": [0.93, -0.56, 8.06],
            "Itzhak": [0.04, -0.74, 1.3],
            "Miriam": [0.09, -0.85, 0.55],
        };
        this.activeCoins = [];
        this.beLookedCount = 0;

        this.toCheck = false;
        this.coinTimestamp = -1;
        this.currentOnCharacter = null;
        this.isShining = false;
        this.tweenAnimCollectors = [];

        let tex_loader = new THREE.TextureLoader(loadingManager);
        let tex_map = tex_loader.load( this.BASE_PATH + "images/coin.jpg" );
        // let shine_map = tex_loader.load( this.BASE_PATH + "images/coin_shine.png" );
        // shine_map.repeat.x = 1;
        // shine_map.repeat.y = 1;
        // shine_map.offset.x = -1.5;
        let NRM_map = tex_loader.load( this.BASE_PATH + "images/coin_NRM.png" );
        let DISP_map = tex_loader.load( this.BASE_PATH + "images/coin_DISP.png" );
        this.coinMat = new THREE.MeshPhongMaterial( {
            color: 0xebc41c,
            normalMap: NRM_map,
            specular: 0x110e02,
            shininess: 30 //76
        } );
        
        this.loadCoin( this.BASE_PATH + "/models/coin.json" )
        .then( (coinModel) => {
            this.coinModel = coinModel;
            
            for (var key in this.character_controller.characters) {
                if (this.character_controller.characters.hasOwnProperty(key)) {

                    if(key in this.coinsOffset){
                        let coinn = this.coinModel.clone();
                        coinn.position.fromArray(this.coinsOffset[key]);
                        coinn.visible = false;
                        this.character_controller.characters[key].add(coinn);
                        
                        this.coins[key] = {};
                        this.coins[key].coin = coinn;
                        this.coins[key].beLooked = false;
                    }                    
                }
            }
            DebugUtil.positionObject(this.coins['Itzhak'].coin, "Coin Itzhak");
            DebugUtil.positionObject(this.coins['Lupo5PM'].coin, "Coin Lupo5PM");
        });

        // events.on("hour_updated", (hour) => {
        //     this.loadHour(hour);            
        // });

        events.on("character_playing", (name) => {

            if(name in this.coinsOffset){
                // reset
                this.reset();

                // start new character if hasn't got 2 coins to be looked yet
                if(this.beLookedCount<2) {
                    this.coins[name].coin.visible = true;
                    this.toCheck = true;
                    this.currentOnCharacter = name;
                }
            }            
        });
    }

    // updateCoinPosition() {
    //     for (var key in this.coins) {
    //         this.coins[key].coin.position.copy(this.coins[key].character.position);
    //     }
    // }

    loadCoin( modelFile ) {
        let promise = new Promise( (resolve, reject) => {
            let loader = new THREE.JSONLoader(this.loadingManager);
            let coinModel;
            loader.load( modelFile, (geometry)=>{
                this.coinGeo = geometry;
                coinModel = new THREE.Mesh(this.coinGeo, this.coinMat);
                coinModel.scale.multiplyScalar(0.04);
                resolve( coinModel );
            } );            
        });
        return promise;
    }

    loadHour(hour) {
        //let chapter = _.find(Chapters, {hour});

        for (var key in this.coins) {
            this.coins[key].coin.visible = false;
        }

        /*
        chapter.characters.forEach((characterName) => {
            this.coins[characterName].visible = true;
        });
        */
    }

    reset() {
        if (this.currentOnCharacter!=null) {
            this.coins[this.currentOnCharacter].coin.visible = false;
            this.currentOnCharacter = null;
        }
        this.coinTimestamp = -1;
        this.coinMat.shininess = 30;
        this.isShining = false;

        // stop animation
        if(this.tweenAnimCollectors.length>0){
            for(let i=0; i<this.tweenAnimCollectors.length; i++){
                this.tweenAnimCollectors[i].kill();
            }
            // clean the collector
            this.tweenAnimCollectors = [];
        }        

        // if this.beLookedCount==2, job done!! never starts againn
        if (this.beLookedCount==2) {
            this.toCheck = false;   // double-check
            // delete all the coins??
            // stop event.on??
        }
    }

    update(camera, dt, et) {
        // record start time
        if(this.coinTimestamp==-1) {
            this.coinTimestamp = et;
        }

        // if camera doesn't bend down after 10 sec, shine
        if( !this.isShining && ((et - this.coinTimestamp)>13) ) {
            console.log("start shining");

            // shine
            this.coinMat.shininess = 80;

            // ani
            let coinAni = TweenMax.fromTo( this.coins[this.currentOnCharacter].coin.rotation, .8,
                { z: -0.3 }, { z: 0.3, repeat: -1, yoyo: true, ease: Power0.easeNone });
            this.tweenAnimCollectors.push( coinAni );

            let coinAni2 = TweenMax.fromTo( this.coins[this.currentOnCharacter].coin.rotation, .8,
                { x: -0.3 }, { x: 0.3, repeat: -1, yoyo: true, delay: 0.5, ease: Power0.easeNone });
            this.tweenAnimCollectors.push( coinAni2 );

            // audio cue

            this.isShining = true;
        }

        // if bend down
        if (camera.position.y < 0.6) {

            // audio cue

            // rotate/spin + sink
            for(let i=0; i<this.tweenAnimCollectors.length; i++){
                this.tweenAnimCollectors[i].kill();
            }
            this.coins[this.currentOnCharacter].coin.rotation.set(0,0,0);

            TweenMax.to( this.coins[this.currentOnCharacter].coin.rotation, .7, {
                delay: 3, x: 90*Math.PI/180, onStart:()=>{
                    TweenMax.to( this.coins[this.currentOnCharacter].coin.position, .7, {
                        delay: 3, y:"+=0.05"
                    });
                }, onComplete:()=>{
                    TweenMax.to( this.coins[this.currentOnCharacter].coin.rotation, 0.5, {
                        z: Math.PI*2, repeat: 12, ease: Power0.easeNone, onStart:()=>{
                            TweenMax.to( this.coins[this.currentOnCharacter].coin.position, 2, {
                                delay: 2.5, y:"-=1", onComplete:()=>{
                                    this.reset();
                                    console.log("reset!");
                                }
                            });
                        }
                    });
                }
            });

            // report to coinMaster
            this.beLookedCount++;
            this.coins[this.currentOnCharacter].beLooked = true;
            this.toCheck = false;

            console.log("a coin be looked!");
        }
        
    }
}
