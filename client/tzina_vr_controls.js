/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 * @author avnerus / http://avner.js.org
 */
export default function ( emitter, object, onError, square ) {

	var scope = this;

    this.square = square;

	var vrInput;

	var standingMatrix = new THREE.Matrix4();

	function gotVRDevices( devices ) {

		for ( var i = 0; i < devices.length; i ++ ) {

			if ( ( 'VRDisplay' in window && devices[ i ] instanceof VRDisplay ) ||
				 ( 'PositionSensorVRDevice' in window && devices[ i ] instanceof PositionSensorVRDevice ) ) {

				vrInput = devices[ i ];
				break;  // We keep the first we encounter

			}

		}

		if ( !vrInput ) {

			if ( onError ) onError( 'VR input not available.' );

		}

	}

	if ( navigator.getVRDisplays ) {

		navigator.getVRDisplays().then( gotVRDevices );

	} else if ( navigator.getVRDevices ) {

		// Deprecated API.
		navigator.getVRDevices().then( gotVRDevices );

	}

	// the Rift SDK returns the position in meters
	// this scale factor allows the user to define how meters
	// are converted to scene units.

	this.scale = 1;

	// If true will use "standing space" coordinate system where y=0 is the
	// floor and x=0, z=0 is the center of the room.
	this.standing = true;

	// Distance from the users eyes to the floor in meters. Used when
	// standing=true but the VRDisplay doesn't provide stageParameters.
	this.userHeight = 22.1;

    this.active = true;

    this.basePosition = new THREE.Vector3(0,0,0);

    this.offset = new THREE.Vector3(0,0,0);

    this.BASE_VIVE = new THREE.Vector3(
        0.030513843521475792,
        0,
        1.2663648128509521
    );

    this.SQUARE_POSITION = new THREE.Vector3();

    events.on("control_threshold", (passed) => {
        if (passed) {
            console.log("VR Control threshold: ", object.position);
            this.active = true;
        } else {
            this.active = false;
        }        
    })

    this.calibrate = function() {
        console.log("CALIBRATE with square");
            /*
        let squareCube = new THREE.Object3D();
        squareCube.position.set(0.49,24,11.7);
        this.square.clockwork.add(squareCube);

        this.square.clockwork.updateMatrixWorld(true);
        squareCube.updateMatrixWorld(true);
        let worldPos = new THREE.Vector3().setFromMatrixPosition(squareCube.matrixWorld);
        //worldPos.multiplyScalar(1 / 0.013);

        console.log("CALIBRATE - Desired world positon by square: ", worldPos);
        worldPos.y = 12.67;
        this.SQUARE_POSITION.copy(worldPos); */

            /*

        this.update();
        let currentPosition = new THREE.Vector3().copy(object.position);
        if (currentPosition) {
            console.log("CALIBRATE - Current position", currentPosition.x, currentPosition.z);
            this.offset.copy(this.BASE_VIVE).sub(currentPosition);
            this.offset.y = 0;
            console.log("CALIBRATE - Offset:", this.offset);
        }*/
    }

    this.getCurrentPosition = function () {
        if (vrInput) { 
            let pose = vrInput.getPose().position;
            if (pose) {
                let position = new THREE.Vector3().fromArray(pose);
                if (this.standing) {
                    standingMatrix.fromArray(vrInput.stageParameters.sittingToStandingTransform);
                    position.applyMatrix4(standingMatrix);
                    return position;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

	this.update = function () {

        if ( vrInput ) {

            if ( vrInput.getPose ) {

                var pose = vrInput.getPose();

                if ( pose.orientation !== null ) {

                    object.quaternion.fromArray( pose.orientation );
                }


                if ( this.active && pose.position !== null ) {
                    //console.log("Calibrate VR Position", pose.position);

                    object.position.fromArray(pose.position).multiplyScalar(this.scale).add(this.basePosition);
                    //object.position.copy(this.basePosition);
                    
                    if ( this.standing ) {

                        if ( vrInput.stageParameters ) {
                            
                            object.updateMatrix();

                            standingMatrix.fromArray(vrInput.stageParameters.sittingToStandingTransform);

                            object.applyMatrix( standingMatrix );
                        } else {

                            object.position.setY( object.position.y + this.userHeight );

                        }

                    }
                }

            } else {

                // Deprecated API.
                var state = vrInput.getState();

                if ( state.orientation !== null ) {

                    object.quaternion.copy( state.orientation );

                }

                if ( state.position !== null ) {

                    object.position.copy( state.position );

                } 
            }
            //console.log("Calibrate VR Position", pose.position);

        }
	};

	this.resetPose = function () {

		if ( vrInput ) {

			if ( vrInput.resetPose !== undefined ) {
                console.log("CALIBRATE resetPose");

				vrInput.resetPose();

			} else if ( vrInput.resetSensor !== undefined ) {

				// Deprecated API.
				vrInput.resetSensor();

			} else if ( vrInput.zeroSensor !== undefined ) {

				// Really deprecated API.
				vrInput.zeroSensor();

			}

		}

	};

	this.resetSensor = function () {

		console.warn( 'THREE.VRControls: .resetSensor() is now .resetPose().' );
		this.resetPose();

	};

	this.zeroSensor = function () {

		console.warn( 'THREE.VRControls: .zeroSensor() is now .resetPose().' );
		this.resetPose();

	};

	this.dispose = function () {

		vrInput = null;

	};

};
