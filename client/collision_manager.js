import boxIntersect from 'box-intersect'

const PLAYER_SIZE = {
    x: 1, 
    y: 5,
    z: 1 
}

const COLLIDERS = {
    stairs: ["Object_1111", "Object_1110"],
    ramps: ["Object_1077"]
}
export default class CollisionManager {
    constructor(camera, scene) {
        console.log("Collision Manager constructed!")

        this.characterObstacles = [];
        this.playerBox = [[0,0,0,0,0,0]]
        this.characterObstacleInfo = [];

        this.squareObstacles = [];
        this.squareDebug = [];
        this.squareMeshes = [];


        this.climbingStairs = false;
        this.climbingRamp = false;
        this.scene = scene;
        this.player = camera;
        this.meshColliders = [];

        this.debug = true;
    }
    init() {
    }

    refreshSquareColliders(colliders) {
        console.log("Refresh square colliders ", colliders);
        if (this.debug) {
            while(this.squareDebug.length > 0) {
                let object = this.squareDebug.pop();
                this.scene.remove(object);
            }
        }
        this.squareObstacles.splice(0);
        this.squareMeshes.splice(0);

        for (let i = 0; i < colliders.length; i++) {
            this.addBoundingBox(colliders[i]);
        }
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

        // Characters
        boxIntersect(this.playerBox, this.characterObstacles, (i,j) => {
            if (this.characterObstacleInfo[j].onCollision) {
                this.characterObstacleInfo[j].onCollision();
            }
        });

        // Square
        boxIntersect(this.playerBox, this.squareObstacles, (i,j) => {
            let distance = this.player.position.distanceTo(
                new THREE.Vector3().setFromMatrixPosition(this.squareMeshes[j].matrixWorld)
            );
            if (this.squareMeshes[j].onCollision) {
                this.squareMeshes[j].onCollision(distance);
            }
        });

    }
    setPlayer(player) {
        this.player = player;
    }

    testMovement(source, destination) {
        return new Promise((resolve, reject) => {
            resolve(true);
            /*
            // Square
            this.meshColliders.splice(0);
            boxIntersect(this.playerBox, this.squareObstacles, (i,j) => {
                this.meshColliders.push(this.squareMeshes[j]);
            });
            if (this.meshColliders.length > 0) {
                let legs = new THREE.Vector3().copy(source);
                legs.y = 21.7;

                let directionVector = new THREE.Vector3().copy(destination);
                directionVector.sub(source).normalize();

                // console.log("Direction vector ", directionVector);
                let ray = new THREE.Raycaster( legs, directionVector);
                let collisionResults = ray.intersectObjects(this.meshColliders);

                collisionResults.forEach((result) => {
                    if (result.distance < 0.1) {
                        resolve(false);
                    }
                });
                resolve(true);
            } else {
                resolve(true);
            }*/
        })
    }


    addCharacter(character) {
        if (character.props.space) {
            console.log("COLLISION MANAGER - Adding character ", character);
            let space = character.props.space;

            this.scene.updateMatrixWorld(true);

            let bbox = new THREE.BoundingBoxHelper(character, 0x00ff00);
            bbox.update();

            let offset = new THREE.Vector3();
            if (character.props.spaceOffset) {
                offset.fromArray(character.props.spaceOffset);
            }

            let newBox = this.enlargeBox(bbox.box, space, offset);

           if (this.debug) {
                let bboxMesh = new THREE.Mesh(new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } ) );
                newBox.getSize(bboxMesh.scale);
                newBox.getCenter(bboxMesh.position);
                this.scene.add(bboxMesh);
                events.emit("add_gui", {folder:character.props.name + " - BBOX Offset", listen: true, step: 0.01, onChange: () => {
                    newBox = this.enlargeBox(bbox.box,character.props.space,offset); 
                    newBox.getSize(bboxMesh.scale);
                    newBox.getCenter(bboxMesh.position);
                }}, offset, "x", -5,5); 
                events.emit("add_gui", {folder:character.props.name + " - BBOX Offset", listen: true, step: 0.01, onChange: () => {
                    newBox = this.enlargeBox(bbox.box,space,offset); 
                    newBox.getSize(bboxMesh.scale);
                    newBox.getCenter(bboxMesh.position);
                }}, offset, "y", -5,5); 
                events.emit("add_gui", {folder:character.props.name + " - BBOX Offset", listen: true, step: 0.01, onChange: () => {
                    newBox = this.enlargeBox(bbox.box,character.props.space,offset); 
                    newBox.getSize(bboxMesh.scale);
                    newBox.getCenter(bboxMesh.position);
                }}, offset, "z", -5,5); 
                events.emit("add_gui", {folder:character.props.name + " - BBOX Space", listen: true, step: 0.01, onChange: () => {
                    newBox = this.enlargeBox(bbox.box,character.props.space,offset); 
                    newBox.getSize(bboxMesh.scale);
                    newBox.getCenter(bboxMesh.position);
                }}, character.props, "space", 0,2); 
           }

            console.log("Adding collision box ", newBox);
            this.characterObstacles.push([
                newBox.min.x,
                newBox.min.y,
                newBox.min.z,
                newBox.max.x,
                newBox.max.y,
                newBox.max.z
            ]);

            character.obstacleIndex = this.characterObstacles.length -1;

            this.characterObstacleInfo.push(character);
        }
    }

    enlargeBox(box, space, offset) {
        let newBox = new THREE.Box3();
        newBox.copy(box);
        newBox.min.x = box.min.x - space + offset.x; 
        newBox.min.y = box.min.y - space + offset.y; 
        newBox.min.z = box.min.z - space + offset.z; 
        newBox.max.x = box.max.x +  space + offset.x
        newBox.max.y = box.max.y + space + offset.y; 
        newBox.max.z = box.max.z + space + offset.z;

        return newBox;
    }

    removeCharacter(character) {
        if (character.props.space) {
            console.log("COLLISION MANAGER - Removing character ", character, "Obstacle index: ",character.obstacleIndex);
            this.characterObstacles.splice(character.obstacleIndex, 1);
            this.characterObstacleInfo.splice(character.obstacleIndex, 1);
        }
    }

    addBoundingBox(obj) {
        //obj.children[0].material.wireframe = true;
        //obj.children[0].material.visible = false;
        let bbox = new THREE.BoundingBoxHelper(obj,0x00ff00);
        bbox.update();
        if (this.debug) {
            console.log("Collision bounding box", bbox);
            this.scene.add(bbox);
            this.squareDebug.push(bbox);
        }
        this.squareMeshes.push(obj);
        this.squareObstacles.push([
            bbox.box.min.x,
            bbox.box.min.y,
            bbox.box.min.z,
            bbox.box.max.x,
            bbox.box.max.y,
            bbox.box.max.z
        ]);
    }

    addBoundingBoxes(obj, scene) {
        /*
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
        //console.log(this.obstacles, this.obstacleInfo);*/
    }
    isClimbingStairs() {
        return this.climbingStairs
    }
}
