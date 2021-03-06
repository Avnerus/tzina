import boxIntersect from 'box-intersect'
import GeometryUtils from './util/GeometryUtils'
import DebugUtil from './util/debug'

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
        this.squareEventObstacles = [];
        this.squareDebug = [];
        this.squareMeshes = [];
        this.squareEventMeshes = [];


        this.climbingStairs = false;
        this.climbingRamp = false;
        this.scene = scene;
        this.player = camera;
        this.meshColliders = [];

        this.gazeObjects = [];

        this.raycaster = new THREE.Raycaster();

        this.debugCollisions = false;
        this.debugGaze = false;
        this.debugCharacters = false;

        this.lastGaze = null;
    }
    init() {
    }

    refreshSquareColliders(colliders) {
        console.log("Refresh square colliders ", colliders);
        if (this.debugCollisions) {
            while(this.squareDebug.length > 0) {
                let object = this.squareDebug.pop();
                this.scene.remove(object);
            }
        }
        this.squareObstacles.splice(0);
        this.squareEventObstacles.splice(0);
        this.squareMeshes.splice(0);
        this.squareEventMeshes.splice(0);

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
        boxIntersect(this.playerBox, this.squareEventObstacles, (i,j) => {
            let distance = this.player.position.distanceTo(
                new THREE.Vector3().setFromMatrixPosition(this.squareEventMeshes[j].matrixWorld)
            );
            this.squareEventMeshes[j].onCollision(distance);
        });

        this.gaze();
    }
    setPlayer(player) {
        this.player = player;
    }

    testMovement(source, destination) {
        return new Promise((resolve, reject) => {
            // Square
            this.meshColliders.splice(0);
            boxIntersect(this.playerBox, this.squareObstacles, (i,j) => {
                this.meshColliders.push(this.squareMeshes[j]);
            });
            if (this.meshColliders.length > 0) {
                let legs = new THREE.Vector3().copy(source);
                legs.y = 0;

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
            }
        })
    }


    addCharacter(character) {
        character.updateMatrixWorld(true);

        if (character.props.space) {
            console.log("COLLISION MANAGER - Adding character ", character.props.name);
            let space = character.props.space;


            let bbox = new THREE.BoundingBoxHelper(character, 0x00ff00);
            bbox.update();

            let offset = new THREE.Vector3();
            if (character.props.spaceOffset) {
                offset.fromArray(character.props.spaceOffset);
            }

            let newBox = THREE.GeometryUtils.enlargeBox(bbox.box, space, offset);

            if (this.debugCharacters) {
                DebugUtil.adjustBBox(bbox, character.props.name + " - bbox", character.props.space, offset);
                this.scene.add(bbox);
            }

            console.log("Adding collision box for " + character.props.name, newBox);
            this.characterObstacles.push([
                newBox.min.x,
                newBox.min.y,
                newBox.min.z,
                newBox.max.x,
                newBox.max.y,
                newBox.max.z
            ]);

            this.characterObstacleInfo.push(character);
        }

        // Gaze box from the idle mesh
        if (character.idleVideo && character.idleVideo.mesh) {
            let gazeSpace = new THREE.Vector3();
            let gazeOffset = new THREE.Vector3();

            if (character.props.gazeSpace) {
                gazeSpace.fromArray(character.props.gazeSpace);
            }
            if (character.props.gazeOffset) {
                gazeOffset.fromArray(character.props.gazeOffset);
            }

            if (!character.gazeBox) {
                character.gazeBox  = new THREE.BoundingBoxHelper(character.idleVideo.mesh, 0xffff00);
            }

            character.gazeBox.update();
            let newBox = THREE.GeometryUtils.enlargeBox(character.gazeBox.box, gazeSpace, gazeOffset);
            newBox.getSize(character.gazeBox.scale);
            newBox.getCenter(character.gazeBox.position);


            if (this.debugGaze) {
                DebugUtil.adjustBBox(character.gazeBox, character.props.name + " - Gaze",gazeSpace, gazeOffset);
            } else {
                character.gazeBox.material.visible = false;
            }
            this.gazeObjects.push(character.gazeBox);
            this.scene.add(character.gazeBox);
        }

    }

    gaze() {
        let camVector = new THREE.Vector3(0,0,-1).applyQuaternion(this.player.quaternion);
        this.raycaster.set(this.player.position, camVector);

        let collisionResults = this.raycaster.intersectObjects(this.gazeObjects);
        if (collisionResults.length > 0 && collisionResults[0].object.onGaze) {
            collisionResults[0].object.onGaze(this.player.position, camVector, collisionResults[0].object.position);
            this.lastGaze = collisionResults[0].object;
        } else if (this.lastGaze) {
            this.lastGaze.onGazeStop();
            this.lastGaze = null;
        }
    }

    addGazeCollider(bbox) {
        console.log("addGazeCollider");
        this.scene.add(bbox);
        if (!this.debugGaze) {
            bbox.material.visible = false;
            console.log("Sun gaze box", bbox);
        }
        this.gazeObjects.push(bbox);
    }

    removeCharacter(character) {
        if (character.props.space) {
            let obstacleIndex = this.characterObstacleInfo.indexOf(character);
            if (obstacleIndex != -1) {
                console.log("COLLISION MANAGER - Removing character ", character.props.name, "Obstacle index: ", obstacleIndex);
                this.characterObstacles.splice(obstacleIndex, 1);
                this.characterObstacleInfo.splice(obstacleIndex, 1);
            } else {
                console.log("COLLISION MANAGER - no obstacle object for ", character.props.name);
            }
        }
        // Gaze box from the idle mesh
        if (character.gazeBox) {
            let gazeIndex = this.gazeObjects.indexOf(character.gazeBox);
            if (gazeIndex != -1) {
                console.log("COLLISION MANAGER - Removing character ", character.props.name, "Gaze index: ", gazeIndex);
                this.gazeObjects.splice(gazeIndex, 1);
            } else {
                console.log("COLLISION MANAGER - no gaze object for ", character.props.name);
            }
        }
    }

    addBoundingBox(obj) {
        //obj.children[0].material.wireframe = true;
        let bbox = new THREE.BoundingBoxHelper(obj,0x00ff00);
        //console.log("Add bounding box", obj);
        bbox.update();
        if (this.debugCollisions) {
            //console.log("Collision bounding box", bbox);
            this.scene.add(bbox);
            this.squareDebug.push(bbox);
        }
        let mesh;
        if (obj.type == "Mesh") {
            mesh = obj;
        } else {
            mesh = obj.children[0];
        }
        if (obj.name != "f_11_SubMesh 0") {
            mesh.material.visible = false; // Our specially crafted collider
        }

        if (obj.onCollision) {
            this.squareEventMeshes.push(mesh);
            this.squareEventObstacles.push([
                bbox.box.min.x,
                bbox.box.min.y,
                bbox.box.min.z,
                bbox.box.max.x,
                bbox.box.max.y,
                bbox.box.max.z
            ]);
        } 
        this.squareMeshes.push(mesh);
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
