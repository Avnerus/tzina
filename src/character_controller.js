import Chapters from './chapters'
import Characters from './characters'
import Character from './character'

import _ from 'lodash'

export default class CharacterController {
    constructor(config, square, collisionManager)  {
        this.config = config;
        this.collisionManager = collisionManager;
        this.characters = {};
        this.square = square;
    }
    init(loadingManager) {
        console.log("Initializing Character controller");
        Characters.forEach((characterProps) => {
            let character = new Character(characterProps, this.collisionManager);
            character.init(loadingManager);
            this.characters[characterProps.name] = character;
        });
        events.on("hour_updated", (hour) => {
            console.log("Loading characters for ", hour);
        });
    }

    update(dt) {
    }
}
