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

        this.height = config.basalHeight;

        this.active = false;

        this.zAxis = new THREE.Vector3(0,0,1);
    }
    init() {

        console.log("Keyboard controller init");
        this.pointer = lock(document.getElementById('game'));

        events.on("start_zoom" ,() => {
        //    this.active = false;

        });

        events.on("intro_start" ,() => {
            this.active = false;
        });

        events.on("intro_end" ,() => {
            this.active = true;
        });

        events.on("control_threshold", (passed) => {
            if (passed) {
                this.active = true;
            } else {
                this.active = false;
            }
        })

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
                    //this.moveLeft = true; 
                    break;

                case 40: // down
                case 83: // s
                    event.preventDefault();
                    this.moveBackward = true;
                    break;

                case 39: // right
                case 68: // d
                    event.preventDefault();
                    //this.moveRight = true;
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
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            //this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
            
            if ( this.moveForward ) this.velocity.z -= 100.0 * delta * this.config.movementSpeed;
            if ( this.moveBackward ) this.velocity.z += 100.0 * delta * this.config.movementSpeed;

            if ( this.moveLeft ) this.velocity.x -= 100.0 * delta * this.config.movementSpeed;
            if ( this.moveRight ) this.velocity.x += 100.0 * delta * this.config.movementSpeed;

            /*
            if (this.collisionManager.isClimbingStairs() && this.velocity.z != 0) {
                this.climbStairs();
                }*/

            if ( this.isOnObject === true)  {
                this.velocity.y = Math.max( 0, this.velocity.y );

                this.canJump = true;
            }


            
            this.camera.translateX( this.velocity.x * delta );
            this.camera.position.y += this.velocity.y * delta;
            if (this.config.enableFlying) {
                this.camera.translateZ(this.velocity.z * delta);
            } else {
                let zVector = new THREE.Vector3().copy(this.zAxis).applyQuaternion(this.camera.quaternion);
                zVector.y = 0;
                this.camera.position.add(zVector.multiplyScalar(this.velocity.z * delta));
            }

            /*

            if ( this.camera.position.y < this.height) {
                    if ( this.camera.position.y < this.height) {

                         this.velocity.y = 0;
                         this.camera.position.y = this.height;

                         this.canJump = true;
                    }


                 this.canJump = true;
                 }*/


            //console.log(this.camera.position);
            
        }

    }

    climbStairs() {
        let distanceToCenter = this.camera.position.distanceTo(this.square.getCenterPosition());
        let distanceInStairs = Math.max(0, 260 - distanceToCenter);
        this.height = Math.max(Math.min(30,distanceInStairs),this.config.basalHeight);
    }

    setPosition(x,y,z) {
        this.height = y;
        this.camera.position.set(x,y,z);
    }
}
