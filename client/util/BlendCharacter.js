/**
 * @author Michael Guerrero / http://realitymeltdown.com
 */
THREE.BlendCharacter={};
 //this file is slightly modified from Guerrero's original.

THREE.BlendCharacter = function (loadedObject) {

	this.weightSchedule = [];
	this.warpSchedule = [];
	this.currentAnim="";
	var thisBlendCharacter=this;
	this.load = function ( url, onLoad ) {

		// THREE.BlendCharacter.loadObject(url,function(loadedObject){
		// 	thisBlendCharacter.applyLoadedObject(loadedObject);
		// 	console.log(thisBlendCharacter.mixer);
		// });

		THREE.BlendCharacter.loadGeometry(url,function(a,b){
			thisBlendCharacter.applyLoadedGeometry(a,b);
			console.log(thisBlendCharacter.mixer);
		});

		// if(onLoad!==undefined) onLoad();
	};
	//used when it was loaded using an object loader because object type is object
	this.applyLoadedObject=function(loadedObject){
		// The exporter does not currently allow exporting a skinned mesh by itself
		// so we must fish it out of the hierarchy it is embedded in (scene)
		loadedObject.traverse( function( object ) {

			if ( object instanceof THREE.SkinnedMesh ) {

				thisBlendCharacter.skinnedMesh = object;

			}

		} );

		THREE.SkinnedMesh.call( this, this.skinnedMesh.geometry, thisBlendCharacter.skinnedMesh.material );

		// If we didn't successfully find the mesh, bail out
		if ( this.skinnedMesh == undefined ) {

			console.log( 'unable to find skinned mesh in ' + url );
			return;

		}

		this.material.skinning = true;
		this.material.transparent=true;
		this.mixer = new THREE.AnimationMixer( this );
		this.mixer = this.mixer;

		// Create the animations
		for ( var i = 0; i < this.geometry.animations.length; ++ i ) {
			console.log("animation",this.geometry.animations[ i ]);
			this.mixer.clipAction( this.geometry.animations[ i ] );
		}

	}
	//used when it was loaded using a json loader because object type is geometry
	this.applyLoadedGeometry=function(geometry,materials){
		var originalMaterial = materials[ 0 ];

		originalMaterial.skinning = true;
		THREE.SkinnedMesh.call( this, geometry, originalMaterial );

		var mixer = new THREE.AnimationMixer( this );
		this.mixer = mixer;

		// Create the animations
		for ( var i = 0; i < geometry.animations.length; ++ i ) {
			console.log("animation",this.geometry.animations[ i ]);
			mixer.clipAction( geometry.animations[ i ] );

		}
		// this.skeleton.bones[0].position.y=2;
		// console.log("pidgeon skeleton",this.skeleton);
	}
	this.wireframe=function(){
		this.material=new THREE.MeshBasicMaterial({color:0xFF0000,wireframe:true});
	}
	this.applyNewDiffuse=function(texture){
		console.log("pidgeon texture loaded");
		//thisBlendCharacter.material.map=texture;
		thisBlendCharacter.material = new THREE.MeshBasicMaterial( {
			map: texture,
			skinning:true,
			transparent:true,

		 } );
		//  if ( onLoad !== undefined ) onLoad();
	}


	this.update = function( dt ) {
		if(this.mixer){
			this.mixer.update( dt );
		}else{ console.warn("trtyin to update but this.mixer is undefined",this);
		};
	}

	this.play = function( animName, weight ) {
		this.currentAnim=animName;
		//console.log("play('%s', %f)", animName, weight);
		console.log(this.mixer);
		return this.mixer.clipAction( animName ).
				setEffectiveWeight( weight ).play();
	};

	this.crossfade = function( fromAnimName, toAnimName, duration ) {

		this.mixer.stopAllAction();

		var fromAction = this.play( fromAnimName, 1 );

		var toAction = this.play( toAnimName, 1 );

		fromAction.crossFadeTo( toAction, duration, false );
		//in the future the animation change should get locked during change so it doesnt jump
		//also there sould be transitional animations such as takeoff and land
		this.currentAnim=toAnimName;

	};
	//crossfade toAnimName
	this.crossfadeTo=function(toAnimName, duration){
		try{
			console.log(this.currentAnim, toAnimName, duration);
			this.crossfade(this.currentAnim, toAnimName, duration);
		}catch(e){
			console.error("BlendCharacter. crossfadeTo error",e);
		}
	}
	//change to an animation, and when finished, change to the toAnimName
	this.crossfadeToThrough=function(toAnimName,throughAnimName, duration){
		try{
			console.log(this.currentAnim, toAnimName, duration);
			this.crossfade(this.currentAnim, toAnimName, duration);
		}catch(e){
			console.error("BlendCharacter. crossfadeTo error",e);
		}
	}

	this.warp = function( fromAnimName, toAnimName, duration ) {

		this.mixer.stopAllAction();

		var fromAction = this.play( fromAnimName, 1 );
		var toAction = this.play( toAnimName, 1 );

		fromAction.crossFadeTo( toAction, duration, true );

	};



	this.applyWeight = function( animName, weight ) {

		this.mixer.clipAction( animName ).setEffectiveWeight( weight );

	};

	this.getWeight = function( animName ) {

		return this.mixer.clipAction( animName ).getEffectiveWeight();

	}

	this.pauseAll = function() {

		this.mixer.timeScale = 0;

	};

	this.unPauseAll = function() {

		this.mixer.timeScale = 1;

	};


	this.stopAll = function() {

		this.mixer.stopAllAction();

	};

	this.showModel = function( boolean ) {

		this.visible = boolean;

	}

	//this allows us to instance one same loadedObject into multiple BlendCharacters
	if(loadedObject){
		if(loadedObject.tipology=="Object"){
			this.applyLoadedObject(loadedObject);
		}else if(loadedObject.tipology=="Geometry"){
			this.applyLoadedGeometry(loadedObject.geometry,loadedObject.materials);
		}else{
			this.applyLoadedObject(loadedObject);
		}
	};

};

THREE.BlendCharacter.loadObject=function(url, onLoad, loadingManager){
	if(loadingManager){
		var loader = new THREE.ObjectLoader();
	}else{
		var loader = new THREE.ObjectLoader(loadingManager);
	}

	loader.load( url, function( loadedObject ) {
		if ( onLoad !== undefined ) onLoad(loadedObject);
	} );
};

THREE.BlendCharacter.loadGeometry = function ( url, onLoad, loadingManager ) {
	if(loadingManager){
		var loader = new THREE.JSONLoader();
	}else{
		var loader = new THREE.JSONLoader(loadingManager);
	}

	loader.load( url, function( geometry, materials ) {
			if ( onLoad !== undefined ) onLoad(geometry, materials );
	} );
};

THREE.BlendCharacter.loadNewDiffuse=function(url,onLoad,loadingManager){
	if(loadingManager){
		var loader = new THREE.TextureLoader();
	}else{
		var loader = new THREE.TextureLoader(loadingManager);
	}

	loader.load(url,/*onready*/function ( texture ) {
			if(onLoad!==undefined) onLoad(texture);
		},/*onprogress*/function ( xhr ) {
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
		},/*onerror*/function ( xhr ) {
			console.log( 'An error happened' );
		}
	);
}
THREE.BlendCharacter.prototype = Object.create( THREE.SkinnedMesh.prototype );
THREE.BlendCharacter.prototype.constructor = THREE.BlendCharacter;

THREE.BlendCharacter.prototype.getForward = function() {

	var forward = new THREE.Vector3();

	return function() {

		// pull the character's forward basis vector out of the matrix
		forward.set(
			- this.matrix.elements[ 8 ],
			- this.matrix.elements[ 9 ],
			- this.matrix.elements[ 10 ]
		);

		return forward;

	}

};

