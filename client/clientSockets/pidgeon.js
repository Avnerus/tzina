import {SpriteText2D , textAlign} from '../lib/text2d/index';
var BlendCharacter=require('../util/BlendCharacter.js');

var loaded3dObject;
var loadedSkinTexture;
var loadedSkinTexture2;
//an array of the displayable pidgeons for client side reference
var characterList = [];
//an array of the associations between server id's and client side id's
var characterAssoc={};
//contains a timeline that stacks movement twins, it smooths out the stutter that
//slower server update rate cretes
//it has a totalProgress function to avoid undefined function call below
var myWalkingTween={totalProgress:function(){return 1;}};


export default class Pidgeon extends THREE.Object3D{
  constructor(config, props){
    super();
    //this.walkingOnGround=false;

    this.config = config;
    console.log("PIDGEON", config);

    let thisPidgeon=this;
    let properties = props || {};
    // console.log("c",properties);
    characterList.push(this);
    if(properties.hasOwnProperty("unique")){
      console.log("new character",properties);
      characterAssoc[properties.unique+""]=this;
    }else{
      console.warn("you created a character without providing server unique. This renders the character unreachable");
    }
    // console.log("pidgeon",Pidgeon.geometry);
    this.blendMesh=new THREE.BlendCharacter(loaded3dObject);
    if(props.skin){
      this.blendMesh.applyNewDiffuse(loadedSkinTexture2);
    }else{
      this.blendMesh.applyNewDiffuse(loadedSkinTexture);
    }
    this.FLOORY=13.85 - 12.8;
    events.emit("add_gui", {folder: "Pidgeon Floor Y", listen: true, step: 0.01}, this, "FLOORY");
    this.add( this.blendMesh );
    // this.blendMesh.position.y=-1;
    this.blendMesh.play("Bird_Fly",1);
    // this.blendMesh.position.z=0.2*a;
    //these json models insist on coming rotated.
    // this.blendMesh.rotation.x=Math.PI/-2;
    // this.blendMesh.rotation.z=Math.PI;
    this.blendMesh.rotation.y=Math.PI;
    // this.mesh = new THREE.Mesh(Pidgeon.geometry,Pidgeon.material);
    this.blendMesh.position.set(0,-1,0);
    this.blendMesh.scale.set(0.3,0.3,0.3);
    // this.add(this.mesh);
    var box = new THREE.BoxGeometry(0.5,2,1);
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe:true, visible:false} );
    this.boundingBox = new THREE.Mesh( box, material );
    this.boundingBox.position.set(0,-1,0);
    this.add(this.boundingBox);
    /*pendant: these may become handy later, but currently unused:*/
    let transformReturnFunctions = {
      prevCoords: {x:0,y:0,z:0},
      newCoords: {x:0,y:0,z:0},
      getMovementDirection: function(returnInDegrees) {
        //pendant: so far these are 2d and using x/y coords.
        var rel = this.getRelativeMovement();
        let radDir=Math.atan2(rel.y, rel.x);
        if(returnInDegrees){
          return radDir*180 / Math.PI;
        }else{
          return radDir;
        }
      },
      getRelativeMovement: function() {
        //pendant: so far these are 2d and using x/y coords.
        return ({
          x: this.prevCoords.x - this.newCoords.x,
          y: this.prevCoords.y - this.newCoords.y,
          z: this.prevCoords.z - this.newCoords.z
        });
      },
    }
    this.walkTowards={
      position:function(newPosition){

        if(thisPidgeon.walkingOnGround){
          newPosition.y=thisPidgeon.FLOORY;
        }

        //get new vector to look at. this is only used for rotation and will ignore the y component avoiding weird rotations
        let Lokat=new THREE.Vector3(newPosition.x||0,thisPidgeon.position.y,newPosition.z||0);
        thisPidgeon.lookAt(Lokat);
        //this flag helps us transition from initial flying state to a walking state on the beginning
        //perhaps is more correct that the client emits the land event, but that needs a lot more of time
        /*if(!thisPidgeon.walkingOnGround){
          //if inside square circle
          //sqrt(19.696^2+22.094^2)=29.5986021967 which are landing coordinates
          console.log("dist x/z"+Lokat.distanceTo(new THREE.Vector3(0,thisPidgeon.position.y,0)) );
          if(Lokat.distanceTo(new THREE.Vector3(0,thisPidgeon.position.y,0))<29.00 ){
            console.log("distance from -5: "+-5-newPosition.z,newPosition);
            //and if at floor level
            if(-5-newPosition.z<0.1){
              thisPidgeon.changeAnimStateTo("Bird_Idle");
              thisPidgeon.walkingOnGround=true;
            }
          }
        }else{
          if(-5-newPosition.z>2){
            thisPidgeon.changeAnimStateTo("Bird_Fly");
            thisPidgeon.walkingOnGround=false;
          }
        }*/
        //object that will be subject to a tween. contains an onupdate function
        //that transfers it's state to the actual pidgeon position
        let tweenCurrentPosition={};
        let tweenTo={}
        for(let b in newPosition){
          tweenCurrentPosition[b]=thisPidgeon.position[b];
          tweenTo[b]=newPosition[b];
          transformReturnFunctions.prevCoords[b]=thisPidgeon.position[b];
          transformReturnFunctions.newCoords[b]=newPosition[b];
        }

        //depending on wether a tween is currently running (if not running)
        if(myWalkingTween.totalProgress()==1){
          //we create a new one
          tweenTo.onUpdate = function(){
            //don't use tweenCurrentPosition to iterate because it contains the
            //onupdate function
            for(let b in {x:0,y:0,z:0}){//this[b]?
              thisPidgeon.position[b]=tweenCurrentPosition[b];
            }
            // console.log("tw",[thisPidgeon.position.x,thisPidgeon.position.y,thisPidgeon.position.z]);
          },
          tweenTo.onStart = function(){
            if(thisPidgeon.walkingOnGround)
            thisPidgeon.changeAnimStateTo("Bird_Walk",0.2);
          },
          tweenTo.onComplete = function(){
            if(thisPidgeon.walkingOnGround)
            thisPidgeon.changeAnimStateTo("Bird_Idle",0.2);

          },
          tweenTo.ease = Power0.easeNone

          myWalkingTween=TweenMax.to(tweenCurrentPosition, 1, tweenTo);
          // myWalkingTween.to(tweenCurrentPosition, 1, tweenTo);
        }else{
          //or change tween target, restarting it's timer
          myWalkingTween.updateTo(tweenTo, true);
        }

        // console.log("walkTo",tweenCurrentPosition,tweenTo,transformReturnFunctions,newPosition);
        //tween time has to be finetuned evey time the server interval is changed.
        /*transformReturnFunctions.tween=*/
        //http://greensock.com/forums/topic/8109-chaining-instance-of-multiple-tweens/

        return transformReturnFunctions;
      }
    }
    this.transform = {
      jumpToFloor:function(checkIfWalking){
        if(checkIfWalking){
          if(this.walkingOnGround)
            thisPidgeon.position.y=thisPidgeon.FLOORY;
        }else{
          thisPidgeon.position.y=thisPidgeon.FLOORY;
        }
      },
      position: function(newPosition) {
        //transfer all the position properties to the mesh position
        //we are trusting that a looks like {x:int,y:int,z:int}
        //we are not requiring all the three corrdinates
        for(let b in newPosition){
          transformReturnFunctions.prevCoords[b]=thisPidgeon.position[b];
          thisPidgeon.position[b]=newPosition[b];
          transformReturnFunctions.newCoords[b]=newPosition[b];
        }
        return transformReturnFunctions;
      },
      rotation: function(a) {
        // myDom.style.webkitTransform = 'rotate(' + a + 'deg)';
        // myDom.style.mozTransform = 'rotate(' + a + 'deg)';
        // myDom.style.msTransform = 'rotate(' + a + 'deg)';
        // myDom.style.oTransform = 'rotate(' + a + 'deg)';
        // myDom.style.transform = 'rotate(' + a + 'deg)';
      }
    }
    // this.labelText("testext");
  }
  labelText(text,origin){
    if(this.textualLabel){
      this.labelTextChange(text,origin);
    }else{
      this.labelTextAdd(text, origin);
    }
  }
  labelTextGazed(dt){
    //when in frame updated gaz function gaze is detected twards this pidgeon
    this.isBeingGazed=2;
    // if(this.textualLabel)
    //   if(this.textualLabel.opacity)
    //     console.log("op"+this.textualLabel.opacity()+"gaz");
  }
  labelTextGazeCheck(dt){
    //each frame update on gaze function

    if(this.isBeingGazed>0){
      this.isBeingGazed--;
      if(this.textualLabel)
        if(this.textualLabel.opacity){
          if(this.textualLabel.opacity()<1.0){
            this.textualLabel.opacity(this.textualLabel.opacity()+2*dt);
          }
        }
    }else{
      if(this.textualLabel)
        if(this.textualLabel.opacity)
        if(this.textualLabel.opacity()>0){
          this.textualLabel.opacity(Math.floor(this.textualLabel.opacity()/2));
        }
    }
  }

  labelTextAdd(text, origin){
    // this.textualLabel = new SpriteText2D(text, {align: textAlign.center,
    //  font: '100px Miriam Libre',
    //  fillStyle: '#FFFFFF',
    //  antialias: true });

    this.textualLabel = makeTextSprite( text, origin,
		{ fontsize: 24, color:"#FFF", fontface:"Miriam Libre", backgroundColor: {r:0, g:0, b:0, a:0} } );
  	// this.textualLabel.position.set(0,0.2,0);
  	// this.add( spritey );
    this.textualLabel.scale.multiplyScalar(0.0022);
    this.add(this.textualLabel);
    this.textualLabel.position.x=0;
    this.textualLabel.position.y= -0.99;
    this.textualLabel.position.z=0;
    this.isBeingGazed=0;
    this.textualLabel.opacity=function(value){
      if(this.opacityValue==undefined){
        this.opacityValue=1;
      }
      if(!isNaN(value)){
        this.opacityValue=value;
        // this.fillStyle="rgba(255,255,255,"+this.opacityValue+")";
        this.material.opacity=this.opacityValue;
        //console.log(this);
      }

      return this.opacityValue;
    }
    this.textualLabel.opacity(0);
  }
  labelTextChange(text,origin){
    this.textualLabel.text = text;
  }

  flyOrLand(stateValue){
    if (stateValue) {
      this.land();
    }else{
      this.flyAway();
    }
  }
  land(){
    this.changeAnimStateTo("Bird_Idle");
    this.walkingOnGround=true;
    this.transform.jumpToFloor();
  }
  flyAway(onEndFunction){
    let thisPidgeon=this;
    let newPosition = {x:100,y:100,z:100}
    //get new vector to move towards|
    let Lokat=new THREE.Vector3(newPosition.x||0,newPosition.y||0,newPosition.z||0);
    thisPidgeon.lookAt(Lokat);

    let tweenCurrentPosition={};
    let tweenTo={}
    for(let b in newPosition){
      tweenCurrentPosition[b]=thisPidgeon.position[b];
      tweenTo[b]=newPosition[b];
    }

    tweenTo.onUpdate = function(){
      //don't use tweenCurrentPosition to iterate because it contains the
      //onupdate function
      for(let b in {x:0,y:0,z:0}){//this[b]?
        thisPidgeon.position[b]=tweenCurrentPosition[b];
      }
    },
    tweenTo.onStart = function(){
      thisPidgeon.changeAnimStateTo("Bird_Fly");
    },
    tweenTo.onComplete = function(){
      if(onEndFunction) onEndFunction();
    },
    // tweenTo.ease = Power0.easeNone
    tweenTo.ease = Sine.easeIn;

    myWalkingTween=TweenMax.to(tweenCurrentPosition, 14, tweenTo);

  }
  changeAnimStateTo(toAnim){
    //change animation using state machine behaviour
    let myCurrentAnimState=this.blendMesh.currentAnim;
    let thisPidgeon=this;
    /*
    animation names:
    Bird_Eat
    Bird_Fly
    Bird_FlyOff
    Bird_Idle
    Bird_Land
    Bird_Pose
    Bird_Walk
    */
    if(toAnim!=myCurrentAnimState){
      if(myCurrentAnimState=="Bird_Eat"){
        this.blendMesh.crossfadeTo(toAnim,0.2);
      }else if(myCurrentAnimState=="Bird_Fly"){
        //if i'm flying, I need to go through land animation unless our target state is land.
        if(toAnim=="Bird_Land"||toAnim=="Bird_Pose"){
          this.blendMesh.crossfadeTo(toAnim,1);
        }else{
          this.blendMesh.crossfadeToThrough(toAnim,"Bird_Land",1);
        }
      }else if(myCurrentAnimState=="Bird_FlyOff"){
        if(toAnim=="Bird_Land"||toAnim=="Bird_Pose"){
          this.blendMesh.crossfadeTo(toAnim,1);
        }else{
          this.blendMesh.crossfadeToThrough(toAnim,"Bird_Land",1);
        }
      }else if(myCurrentAnimState=="Bird_Idle"){

        //eventually eat
        setTimeout(function(){
          if(thisPidgeon.blendMesh.currentAnim=="Bird_Idle"){
            thisPidgeon.changeAnimStateTo("Bird_Eat");
            setTimeout(function(){
              if(thisPidgeon.blendMesh.currentAnim=="Bird_Eat"){
                thisPidgeon.changeAnimStateTo("Bird_Idle");
              }
            },100+Math.random()*15000);
          }
        },2000+Math.random()*30000);

        if(toAnim=="Bird_Fly"){
          this.blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",1);
        }else{
          this.blendMesh.crossfadeTo(toAnim,1);
        }
      }else if(myCurrentAnimState=="Bird_Land"){
        if(toAnim=="Bird_Fly"){
          this.blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",1);
        }else{
          this.blendMesh.crossfadeTo(toAnim,1);
        }
      }else if(myCurrentAnimState=="Bird_Pose"){
        if(toAnim=="Bird_Fly"){
          this.blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",1);
        }else{
          this.blendMesh.crossfadeTo(toAnim,1);
        }
      }else if(myCurrentAnimState=="Bird_Walk"){
        if(toAnim=="Bird_Fly"){
          this.blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",1);
        }else{
          this.blendMesh.crossfadeTo(toAnim,0.2);
        }
      }else{
        this.blendMesh.crossfadeTo(toAnim,1);
      }
    }
  }
  //provide camera to fade out when camera gets inside pidgeon
  update(delta/*,camera*/){
    if ( this.blendMesh ) {
      /*if(camera){
        let pidgeonDistanceToCamera=this.position.distanceTo( camera.position )
        if(pidgeonDistanceToCamera<1.2){
          // console.log(this.blendMesh)
          console.log("distance",pidgeonDistanceToCamera);
          if(this.blendMesh.material)
          this.blendMesh.material.opacity=Math.min(0,pidgeonDistanceToCamera-0.2);
        }
      }*/
      this.blendMesh.update( delta );
    }
  }
  static updateEach(delta/*,camera*/){
    for (var characterIndex in characterList) {
      characterList[characterIndex].update(delta/*,camera*/);
    }
  }
  //load and initialize meshes, textures and animations
  static initMesh(config, loadingManager){
    console.log("pidgeon load and init mesh");

    //initialize graphics, create mesh?

    // this.geometry = new THREE.BoxGeometry(0.2,0.2,0.2);
    // this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe:true} );

    // let loader = new THREE.JSONLoader(loadingManager);
    //statically load mesh, animations and skin
    try{
      THREE.BlendCharacter.loadGeometry(config.assetsHost +  'assets/pidgeon/Bird_33.json', function(geometry,materials) {
  			loaded3dObject={tipology:"Geometry",geometry:geometry,materials:materials};
  			console.log("pidgeon 3d object loaded");
  		},loadingManager );
    }catch(e){
      console.error("pidgeon",e);
    }
    try{
      THREE.BlendCharacter.loadNewDiffuse(config.assetsHost +  'assets/pidgeon/pigeons_v4.png', function(newTexture) {
  			loadedSkinTexture=newTexture;
  			console.log("pidgeon skin texture loaded");
  		},loadingManager );
      THREE.BlendCharacter.loadNewDiffuse(config.assetsHost + 'assets/pidgeon/pigeons_v2.png', function(newTexture) {
  			loadedSkinTexture2=newTexture;
  			console.log("pidgeon skin texture loaded");
  		},loadingManager );
    }catch(e){
      console.error("pidgeon",e);
    }
  }
  static each (callback) {
    for (var characterIndex in characterList) {
      var characterInstance = characterList[characterIndex];
      callback(characterInstance, characterIndex);
    }
  }
  //get a character using a unique
  static remote(unique){
    return characterAssoc[unique+""];
  }

  // static remove(unique){
  //
  // }

}

//these functions come from
//http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
function makeTextSprite( message, origin, parameters )
{
	if ( parameters === undefined ) parameters = {};

	var fontface = parameters.hasOwnProperty("fontface") ?
		parameters["fontface"] : "Arial";

	var fontsize = parameters.hasOwnProperty("fontsize") ?
		parameters["fontsize"] : 18;

	var borderThickness = parameters.hasOwnProperty("borderThickness") ?
		parameters["borderThickness"] : 0;

	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

  var fontcolor = parameters.hasOwnProperty("color") ?
  	parameters["color"] : "rgba(0, 0, 0, 1.0)";

	/*var spriteAlignment = THREE.SpriteAlignment.topLeft;*/

	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');


  context.canvas.width  = 800;
  context.canvas.height  = 300; 

	context.font = "Bold " + fontsize + "px " + fontface;
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
    var metricsOrigin = context.measureText(origin);
    
	var textWidth = metrics.width > metricsOrigin.width ? metrics.width : metricsOrigin.width;

	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
/*	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";/**/

  //debug canvas draw border
/*  context.strokeStyle="#FF0000";
  roundRect(context, 0, 0, canvas.width,canvas.height, 6);
/**/

  // 1.4 is extra height factor for text below baseline: g,j,p,q.
/*  context.strokeStyle="#FFFF00";/**/
  /**context.lineWidth = borderThickness;/**/
  /*
  roundRect(context,(
      context.canvas.width/2)-(metrics.width/2)-borderThickness, 
      borderThickness/2, 
      textWidth + borderThickness + 20, 
      fontsize * 2.5 + 2*borderThickness, 
0);*/

  // text color
	context.fillStyle = fontcolor;
  
  context.textBaseline = 'middle';
  context.textAlign = "center";
  context.fillText( message,  context.canvas.width/2 + 10, fontsize / 2 + 10);
  context.fillText( origin,  context.canvas.width/2 + 10, fontsize * 1.7 + 10);

  // Line
  context.strokeStyle = "#FFFFFF";
  context.beginPath();
  context.moveTo(context.canvas.width / 2, fontsize * 2.5 + 10);
  context.lineTo(context.canvas.width / 2, fontsize * 2.5 + 70);
  context.stroke();

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas)
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial(
		{ map: texture, useScreenCoordinates: false/*, alignment: spriteAlignment*/ } );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(800,300,1.0);
	return sprite;
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r)
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	//ctx.stroke();
}


