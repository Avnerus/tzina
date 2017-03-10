import lock from 'pointer-lock-chrome-tolerant';

export default class KeyboardController {
    constructor(config, camera, square, collisionManager) {

        this.config = config;

        this.moveForward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveBackward = false;
        this.crouch = false;
        this.isOnObject = false;

        this.velocity = new THREE.Vector3();
        this.camera = camera;
        this.square = square;
        this.collisionManager = collisionManager;

        this.playerToCenter = new THREE.Vector3();
        this.walkingDirection = new THREE.Vector3();

        this.active = true;

        this.zAxis = new THREE.Vector3(0,0,1);
        this.xAxis = new THREE.Vector3(1,0,0);

        this.CROUCH_HEIGHT = 0.3;
        this.STAND_HEIGHT = 0.5
    }
    init() {

        console.log("Keyboard controller init");

        this.pointer = lock(document.getElementById('game'));

        events.on("start_zoom" ,() => {
        //    this.active = false;

        });

        events.on("intro_end" ,() => {
            this.CROUCH_HEIGHT = 0.55;
            this.STAND_HEIGHT = 1.1;
        });

        events.on("experience_end" ,() => {
            this.CROUCH_HEIGHT = 1;
            this.STAND_HEIGHT = 1.6;
        });

        document.addEventListener('keydown', (event) => {
            switch ( event.keyCode ) {
                case 16: // Shift
                    event.preventDefault();
                    this.crouch = true;
                    break;
                case 38: // up
                case 87: // w
                    event.preventDefault();
                    this.moveForward = true;
                    break;

                case 37: // left
                case 65: // a
                    event.preventDefault();
                    this.moveLeft = true; 
                    break;

                case 40: // down
                case 83: // s
                    event.preventDefault();
                    this.moveBackward = true;
                    break;

                case 39: // right
                case 68: // d
                    event.preventDefault();
                    this.moveRight = true;
                    break;

                case 32: // space
                    event.preventDefault();
                    if ( this.canJump === true ) this.velocity.y += 350;
                    this.canJump = false;
                    break;
            }
            return false;
        }, false);


        document.addEventListener('keyup', (event) => {
            //console.log("Key up", event);
            switch( event.keyCode ) {
                case 16: // Shift
                    event.preventDefault();
                    this.crouch = false;
                    break;
                case 38: // up
                case 87: // w
                    event.preventDefault();
                    this.moveForward = false;
                    break;

                case 37: // left
                case 65: // a
                    event.preventDefault();
                    this.moveLeft = false;
                    break;

                case 40: // down
                case 83: // s
                    event.preventDefault();
                    this.moveBackward = false;
                    break;

                case 39: // right
                case 68: // d
                    event.preventDefault();
                    this.moveRight = false;
                    break;
            }

            return false;
        }, false);
    }
    
    update(delta) {
        if (this.active && delta < 0.1) {
            if (this.velocity.x > 0) {
                this.velocity.x = Math.max(this.velocity.x - this.velocity.x * 10.0 * delta, 0);
            } else if (this.velocity.x < 0) {
                this.velocity.x = Math.min(this.velocity.x - this.velocity.x * 10.0 * delta, 0);
            }
            if (this.velocity.z > 0) {
                this.velocity.z = Math.max(this.velocity.z - this.velocity.z * 10.0 * delta, 0);
            } else if (this.velocity.z < 0) {
                this.velocity.z = Math.min(this.velocity.z - this.velocity.z * 10.0 * delta, 0);
            }
            if (this.velocity.y > 0) {
                this.velocity.y = Math.max(this.velocity.y - this.velocity.y * delta, 0);
            } else if (this.velocity.y < 0) {
                this.velocity.y = Math.min(this.velocity.y - this.velocity.y * delta, 0);
            }

            //this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
            
            if ( this.moveForward ) this.velocity.z -= 100.0 * delta * this.config.movementSpeed;
            if ( this.moveBackward ) this.velocity.z += 100.0 * delta * this.config.movementSpeed;

            if ( this.moveLeft ) this.velocity.x -= 100.0 * delta * this.config.movementSpeed;
            if ( this.moveRight ) this.velocity.x += 100.0 * delta * this.config.movementSpeed;

            if (this.crouch) {
                this.velocity.y -= delta * 0.8;
                this.camera.position.y = Math.max(this.camera.position.y + this.velocity.y, this.CROUCH_HEIGHT);
            } else if (this.camera.position.y < this.STAND_HEIGHT) {
                this.velocity.y = Math.max(0, this.velocity.y + delta * 0.8);
                this.camera.position.y = Math.min(this.camera.position.y + this.velocity.y, this.STAND_HEIGHT);
            } else {
                this.velocity.y = 0;
            }
            //console.log("Velocity Y: ", this.velocity.y);

            /*
            if (this.collisionManager.isClimbingStairs() && this.velocity.z != 0) {
                this.climbStairs();
                }*/

            
            if (this.velocity.z != 0 || this.velocity.x != 0) {

                // Test the movement before actually moving
                let xVector = new THREE.Vector3().copy(this.xAxis).applyQuaternion(this.camera.quaternion);
                let zVector = new THREE.Vector3().copy(this.zAxis).applyQuaternion(this.camera.quaternion);
                if (!this.config.enableFlying) {
                    zVector.y = 0;
                    xVector.y = 0
                }
                let target = new THREE.Vector3().copy(this.camera.position);
                target.add(zVector.multiplyScalar(this.velocity.z * delta));
                target.add(xVector.multiplyScalar(this.velocity.x * delta));

                if (this.collisionManager) {
                    this.collisionManager.testMovement(this.camera.position, target)
                    .then((result) => {
                        if (result) {
                            this.camera.position.copy(target);
                        } 
                    }); 
                } else {
                    this.camera.position.copy(target);
                }
            }
        }

    }
}
