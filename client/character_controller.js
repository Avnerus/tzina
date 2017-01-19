import Chapters from './chapters'
import Characters from './characters'
import CharactersWeb from './web/characters'
import Character from './character'
import DebugUtil from './util/debug'
import MiscUtil from './util/misc'

import _ from 'lodash'

export default class CharacterController {
    constructor(config, animations, square, collisionManager, soundManager, scene)  {
        this.config = config;
        this.collisionManager = collisionManager;
        this.soundManager = soundManager;
        this.characters = {};
        this.square = square;
        this.activeCharacters = [];
        this.animations = animations;
        this.addedColliders = false;
        this.inControl = false;
        this.debug = false;
        this.scene = scene;
    }
    init(loadingManager) {
        console.log("Initializing Character controller");
        if (!this.config.noCharacters) {
            Characters.forEach((characterProps) => {

                if (this.config.platform == "desktop") {
                    let updateCharacter = _.find(CharactersWeb, {name: characterProps.name});
                    if (updateCharacter) {
                        MiscUtil.overwriteProps(characterProps, updateCharacter);
                    }
                } 

                let character = new Character(this.config, characterProps, this.collisionManager, this.soundManager, this.scene);
                character.animation = this.animations[characterProps.animation];
                character.init(loadingManager);
                this.characters[characterProps.name] = character;
            });
        }
        events.on("instructions_end", () => {
            console.log("Character controller now in control");
            this.inControl = true;
            if (this.config.platform == "desktop") {
                this.addColiders();
            }
        });

        events.on("hour_updated", (hour) => {
            this.loadHour(hour);            
        });
        events.on("angle_updated", (hour) => {
            console.log("Character controller Angle updated", hour, this.activeCharacters, this.inControl);
            if (this.inControl){ {
            }}
        });
    }

    addColiders() {
        this.activeCharacters.forEach((character) => {
            character.updateAudioPosition();
            if (character.idleOnly) {
                character.addedColliders = true;
            }
            else if (!character.done && !character.addedColliders) {
                console.log("Adding colliders: " + character.props.name);
                this.collisionManager.addCharacter(character);
                character.addedColliders = true;
            }
        });
    }
    
    loadHour(hour) {
        console.log("Character controller loading hour ", hour);
        let clone = this.activeCharacters.slice(0);
        this.activeCharacters = [];

        for (let i = 0; i < clone.length; i++) {
            let character = clone[i];

            if (!character.done && !(character.props.event && hour == 9) && !(character.props.event && hour == 19)) {
                console.log("Removing character ", character.props.name, " when loading hour ", hour);
                this.square.clockwork.remove(character);
                character.unload();
            } else {
                console.log("Character " + character.props.name + " is still active");
                this.activeCharacters.push(character);
            }
            if (character.addedColliders) {
                console.log("Removing colliders: " + character.props.name);
                this.collisionManager.removeCharacter(character);
                character.addedColliders = false;
            }
        }

        console.log("Loading characters for ", hour);
        
        let chapter = _.find(Chapters, {hour});
        chapter.characters.forEach((characterName) => {
            this.addCharacter(characterName);
        });
    }

    addCharacter(characterName) {
        if (this.characters[characterName] && !this.characters[characterName].done) {
            console.log("Adding character " + characterName);
            let character = this.characters[characterName];
            this.activeCharacters.push(character);
            this.square.clockwork.add(character);
            if (this.debug) {
                DebugUtil.positionObject(character, character.props.name, false, -40, 40, character.props.rotation);
                    /*
                let bbox = new THREE.BoundingBoxHelper( character, 0x00ffff  );
                bbox.update();
                this.square.parent.add( bbox );*/
            }
            character.load();
            character.play();
        }
    }

    update(dt,et) {
        for (let i = 0; i < this.activeCharacters.length; i++) {
            this.activeCharacters[i].update(dt,et);
        }
    }
}
