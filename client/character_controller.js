import Chapters from './chapters'
import Characters from './characters'
import Character from './character'
import DebugUtil from './util/debug'

import _ from 'lodash'

export default class CharacterController {
    constructor(config, animations, square, collisionManager, soundManager)  {
        this.config = config;
        this.collisionManager = collisionManager;
        this.soundManager = soundManager;
        this.characters = {};
        this.square = square;
        this.activeCharacters = [];
        this.animations = animations;
        this.addedColliders = false;
        this.debug = true;
    }
    init(loadingManager) {
        console.log("Initializing Character controller");
        Characters.forEach((characterProps) => {
            let character = new Character(this.config, characterProps, this.collisionManager, this.soundManager);
            character.animation = this.animations[characterProps.animation];
            character.init(loadingManager);
            this.characters[characterProps.name] = character;
        });
        events.on("hour_updated", (hour) => {
            
            let clone = this.activeCharacters.slice(0);
            this.activeCharacters = [];

            for (let i = 0; i < clone.length; i++) {
                let character = clone[i];

                if (!character.done) {
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

            // Is there an event character
            if (chapter.eventCharacters && chapter.eventAfter == 0) {
                chapter.eventCharacters.forEach((characterName) => {
                    this.addCharacter(characterName);
                });
            }
        });
        events.on("angle_updated", (hour) => {
            this.activeCharacters.forEach((character) => {
                if (!character.done && !character.addedColliders) {
                    console.log("Adding colliders: " + character.props.name);
                    this.collisionManager.addCharacter(character);
                    character.addedColliders = true;
                }
            });
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
                let bbox = new THREE.BoundingBoxHelper( character, 0x00ffff  );
                bbox.update();
                this.square.parent.add( bbox );
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
