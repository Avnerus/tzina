import {SpriteText2D , textAlign} from '../lib/text2d/index';

var BlendCharacter=require('../util/BlendCharacter.js');
var blendMesh;
var loaded3dObject;
var loadedSkinTexture;
//an array of the displayable pidgeons for client side reference
var characterList = [];
//an array of the associations between server id's and client side id's
var characterAssoc={};
//contains a timeline that stacks movement twins, it smooths out the stutter that
//slower server update rate cretes
//it has a totalProgress function to avoid undefined function call below
var myWalkingTween={totalProgress:function(){return 1;}};


export default class Pidgeon extends THREE.Object3D{
  constructor(props){
    super();
    //this.walkingOnGround=false;

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
    blendMesh=new THREE.BlendCharacter(loaded3dObject);
    blendMesh.applyNewDiffuse(loadedSkinTexture);
    this.add( blendMesh );
    blendMesh.play("Bird_Fly",1);
    // blendMesh.position.z=0.2*a;
    //these json models insist on coming rotated.
    // blendMesh.rotation.x=Math.PI/-2;
    // blendMesh.rotation.z=Math.PI;
    blendMesh.rotation.y=Math.PI;
    // this.mesh = new THREE.Mesh(Pidgeon.geometry,Pidgeon.material);
    blendMesh.position.set(0,-0.49,0);
    // this.mesh.scale.set(0.3,0.3,0.3);
    // this.add(this.mesh);
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
    this.labelText("testext");
  }
  labelText(text){
    if(this.textualLabel){
      this.labelTextChange(text);
    }else{
      this.labelTextAdd(text);
    }
  }
  labelTextAdd(text){
    this.textualLabel = new SpriteText2D(text, {align: textAlign.center,font: '20px Arial',fillStyle: '#FFFFFF',antialias: true});
    this.textualLabel.scale.multiplyScalar(0.02);
    this.add(this.textualLabel);
    this.textualLabel.position.x=0;
    this.textualLabel.position.y=0.7;
    this.textualLabel.position.z=0;
  }
  labelTextChange(text){
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
    var myCurrentAnimState=blendMesh.currentAnim;
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
        blendMesh.crossfadeTo(toAnim,0.2);
      }else if(myCurrentAnimState=="Bird_Fly"){
        //if i'm flying, I need to go through land animation unless our target state is land.
        if(toAnim=="Bird_Land"||toAnim=="Bird_Pose"){
          blendMesh.crossfadeTo(toAnim,1);
        }else{
          blendMesh.crossfadeToThrough(toAnim,"Bird_Land",1);
        }
      }else if(myCurrentAnimState=="Bird_FlyOff"){
        if(toAnim=="Bird_Land"||toAnim=="Bird_Pose"){
          blendMesh.crossfadeTo(toAnim,1);
        }else{
          blendMesh.crossfadeToThrough(toAnim,"Bird_Land",1);
        }
      }else if(myCurrentAnimState=="Bird_Idle"){
        if(toAnim=="Bird_Fly"){
          blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",1);
        }else{
          blendMesh.crossfadeTo(toAnim,1);
        }
      }else if(myCurrentAnimState=="Bird_Land"){
        if(toAnim=="Bird_Fly"){
          blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",1);
        }else{
          blendMesh.crossfadeTo(toAnim,1);
        }
      }else if(myCurrentAnimState=="Bird_Pose"){
        if(toAnim=="Bird_Fly"){
          blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",1);
        }else{
          blendMesh.crossfadeTo(toAnim,1);
        }
      }else if(myCurrentAnimState=="Bird_Walk"){
        if(toAnim=="Bird_Fly"){
          blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",1);
        }else{
          blendMesh.crossfadeTo(toAnim,0.2);
        }
      }else{
        blendMesh.crossfadeTo(toAnim,1);
      }
    }
  }
  update(delta){
    if ( blendMesh ) { blendMesh.update( delta ); }
  }
  static updateEach(delta){
    for (var characterIndex in characterList) {
      characterList[characterIndex].update(delta);
    }
  }
  //load and initialize meshes, textures and animations
  static initMesh(loadingManager){
    console.log("pidgeon load and init mesh");

    //initialize graphics, create mesh?

    // this.geometry = new THREE.BoxGeometry(0.2,0.2,0.2);
    // this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe:true} );

    // let loader = new THREE.JSONLoader(loadingManager);
    //statically load mesh, animations and skin
    try{
      THREE.BlendCharacter.loadGeometry( 'assets/pidgeon/Bird_27.json', function(geometry,materials) {
  			loaded3dObject={tipology:"Geometry",geometry:geometry,materials:materials};
  			console.log("pidgeon 3d object loaded");
  		},loadingManager );
    }catch(e){
      console.error("pidgeon",e);
    }
    try{
      THREE.BlendCharacter.loadNewDiffuse( 'assets/pidgeon/pigeons_v2.jpg', function(newTexture) {
  			loadedSkinTexture=newTexture;
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