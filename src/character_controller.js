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
    }
    init(loadingManager) {
        console.log("Initializing Character controller");
        Characters.forEach((characterProps) => {
            let character = new Character(characterProps, this.collisionManager, this.soundManager);
            character.animation = this.animations[characterProps.animation];
            character.init(loadingManager);
            this.characters[characterProps.name] = character;
        });
        events.on("hour_updated", (hour) => {

            console.log("Unloading active characters");
            this.activeCharacters.forEach((character) => {
                this.square.mesh.remove(character);
                character.unload();
                if (this.addedColliders) {
                    this.collisionManager.removeCharacter(character);
                }
            });
            this.activeCharacters = [];            

            console.log("Loading characters for ", hour);
            
            let chapter = _.find(Chapters, {hour});
            chapter.characters.forEach((characterName) => {
                if (this.characters[characterName]) {
                    this.activeCharacters.push(this.characters[characterName]);
                }
            });

            this.activeCharacters.forEach((character) => {
                this.square.mesh.add(character);
                character.load();
                character.play();
                DebugUtil.positionObject(character, character.props.name, character.props.rotation);
            });

            this.addedColliders = false;

        });
        events.on("angle_updated", (hour) => {
            if (!this.addedColliders) {
                this.activeCharacters.forEach((character) => {
                    this.collisionManager.addCharacter(character);
                });

                this.addedColliders = true;
            }
        });
    }

    update(dt,et) {
        for (let i = 0; i < this.activeCharacters.length; i++) {
            this.activeCharacters[i].update(dt,et);
        }
    }
}
