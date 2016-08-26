import boxIntersect from 'box-intersect'

const PLAYER_SIZE = {
    x: 2,
    y: 100,
    z: 2 
}

const COLLIDERS = {
    stairs: ["Object_1111", "Object_1110"],
    ramps: ["Object_1077"]
}
export default class CollisionManager {
    constructor(camera, scene) {
        console.log("Collision Manager constructed!")

        this.obstacles = [];
        this.playerBox = [[0,0,0,0,0,0]]

        this.obstacleInfo = [];

        this.climbingStairs = false;
        this.climbingRamp = false;
        this.scene = scene;
        this.player = camera;
    }
    init() {
    }
    update(dt) {
        this.playerBox[0] = [
            this.player.position.x - PLAYER_SIZE.x / 2,
            this.player.position.y - PLAYER_SIZE.y / 2,
            this.player.position.z - PLAYER_SIZE.z / 2,
            this.player.position.x + PLAYER_SIZE.x / 2,
            this.player.position.y + PLAYER_SIZE.y / 2,
            this.player.position.z + PLAYER_SIZE.z / 2,
        ]
        this.crossing = boxIntersect(this.playerBox, this.obstacles, (i,j) => {
            if (this.obstacleInfo[j].onCollision) {
                this.obstacleInfo[j].onCollision();
            }
        });
    }
    setPlayer(player) {
        this.player = player;
    }

    addCharacter(character) {
        console.log("COLLISION MANAGER - Adding character ", character);
        let space = character.props.space;

        let bbox = new THREE.BoundingBoxHelper(character, 0x00ff00);
        bbox.update();
        //this.scene.add(bbox);

        this.obstacles.push([
            bbox.box.min.x - space, 
            bbox.box.min.y - space, 
            bbox.box.min.z - space, 
            bbox.box.max.x + space, 
            bbox.box.max.y + space, 
            bbox.box.max.z + space
        ])

        character.obstacleIndex = this.obstacles.length -1;

        this.obstacleInfo.push(character);
    }

    removeCharacter(character) {

    }

    addBoundingBoxes(obj, scene) {
        obj.traverse( (child) => {
            if (child.type == "Object3D") {
                for (let key of Object.keys(COLLIDERS)) {
                    if (COLLIDERS[key].includes(child.name)) {
                        console.log(child);
                        let bbox = new THREE.BoundingBoxHelper(child, 0x00ff00);
                        bbox.update();
                        //scene.add(bbox);

                        this.obstacles.push([
                            bbox.box.min.x, 
                            bbox.box.min.y, 
                            bbox.box.min.z, 
                            bbox.box.max.x, 
                            bbox.box.max.y, 
                            bbox.box.max.z
                        ])

                        this.obstacleInfo.push(key);
                    }                    
                }
            }
        })
        //console.log(this.obstacles, this.obstacleInfo);
    }
    isClimbingStairs() {
        return this.climbingStairs
    }
}
