export default class KeyboardController {
    constructor() {
        this.moveForward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveBackward = false;
        this.isOnObject = false;

        this.velocity = new THREE.Vector3();
    }
    init(controls) {

        this.controls = controls;
        console.log("Keyboard controller init");

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
    
    update(dt) {
        let delta = dt;
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        if ( this.moveForward ) this.velocity.z -= 400.0 * delta;
        if ( this.moveBackward ) this.velocity.z += 400.0 * delta;

        if ( this.moveLeft ) this.velocity.x -= 400.0 * delta;
        if ( this.moveRight ) this.velocity.x += 400.0 * delta;

        if ( this.isOnObject === true ) {
            this.velocity.y = Math.max( 0, this.velocity.y );

            this.canJump = true;
        }

        this.controls.getObject().translateX( this.velocity.x * delta );
        this.controls.getObject().translateY( this.velocity.y * delta );
        this.controls.getObject().translateZ( this.velocity.z * delta );

        if ( this.controls.getObject().position.y < 10 ) {

            this.velocity.y = 0;
            this.controls.getObject().position.y = 10;

            this.canJump = true;
        }
    }
}
