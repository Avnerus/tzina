import boxIntersect from 'box-intersect'

const PLAYER_SIZE = {
    x: 4,
    y: 100,
    z: 4 
}
export default class CollisionManager {
    constructor() {
        console.log("Collision Manager constructed!")

        this.obstacles = [];
        this.playerBox = [[0,0,0,0,0,0]]
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
        console.log('crossings=', boxIntersect(this.playerBox, this.obstacles))
    }
    setPlayer(player) {
        this.player = player;
    }
    addBoundingBoxes(obj, scene) {
        console.log("Add bounding boxes from ", obj);
        obj.traverse( (child) => {
            if (child.type == "Object3D" && (child.name == "Object_1110" || child.name == "Object_1111")) {
                console.log(child);
                let bbox = new THREE.BoundingBoxHelper(child, 0x00ff00);
                bbox.update();
                bbox.box.min.y -= 1950;
                bbox.box.min.z += 1200;
                bbox.box.max.y -= 1950;
                bbox.box.max.z += 1200;
                bbox.box.center(bbox.position);
                //bbox.position.y -= 1950;
                //bbox.position.z += 1200;
                console.log(bbox.box);
                scene.add(bbox);

                this.obstacles.push([
                    bbox.box.min.x, 
                    bbox.box.min.y, 
                    bbox.box.min.z, 
                    bbox.box.max.x, 
                    bbox.box.max.y, 
                    bbox.box.max.z
                ])
            }
        })
        console.log(this.obstacles);
    }
}
