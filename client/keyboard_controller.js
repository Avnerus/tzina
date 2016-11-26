import lock from 'pointer-lock-chrome-tolerant';

export default class KeyboardController {
    constructor(config, camera, square, collisionManager) {

        this.config = config;

        this.moveForward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveBackward = false;
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
    }
    init() {

        console.log("Keyboard controller init");

        this.pointer = lock(document.getElementById('game'));

        events.on("start_zoom" ,() => {
        //    this.active = false;

        });

        events.on("intro_end" ,() => {
            this.active = true;
        });

        document.addEventListener('keydown', (event) => {
            switch ( event.keyCode ) {
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
            switch( event.keyCode ) {

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
            } else {
                this.velocity.x = Math.min(this.velocity.x - this.velocity.x * 10.0 * delta, 0);
            }
            if (this.velocity.z > 0) {
                this.velocity.z = Math.max(this.velocity.z - this.velocity.z * 10.0 * delta, 0);
            } else {
                this.velocity.z = Math.min(this.velocity.z - this.velocity.z * 10.0 * delta, 0);
            }

            //this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
            
            if ( this.moveForward ) this.velocity.z -= 100.0 * delta * this.config.movementSpeed;
            if ( this.moveBackward ) this.velocity.z += 100.0 * delta * this.config.movementSpeed;

            if ( this.moveLeft ) this.velocity.x -= 100.0 * delta * this.config.movementSpeed;
            if ( this.moveRight ) this.velocity.x += 100.0 * delta * this.config.movementSpeed;

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
                        } else {
                            console.log("NO GO");
                        }
                    }); 
                } else {
                    this.camera.position.copy(target);
                }
            }
        }

    }
}
