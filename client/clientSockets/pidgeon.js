var BlendCharacter=require('../util/BlendCharacter.js');
var blendMesh;
var loaded3dObject;
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
    console.log("pidgeon",Pidgeon.geometry);


    blendMesh=new THREE.BlendCharacter(loaded3dObject);
    this.add( blendMesh );
    blendMesh.play("Bird_Fly",1);
    // blendMesh.position.z=0.2*a;
    //these json models insist on coming rotated.
    blendMesh.rotation.x=Math.PI/-2;
    blendMesh.rotation.z=Math.PI;
    // this.mesh = new THREE.Mesh(Pidgeon.geometry,Pidgeon.material);
    // this.mesh.position.set(0,0.07,0);
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
        //get new vector to move towards
        let Lokat=new THREE.Vector3(newPosition.x||0,thisPidgeon.position.y,newPosition.z||0);
        thisPidgeon.lookAt(Lokat);
        //We want the object only to rotate around Y, so the coordinatetes of
        //lokat should only contain values on X and Z coords.
        //uncommenting the following line allows the object to rotate in the
        //three coordinates to face its new direction.
        // for(let b in newPosition){
          // Lokat[b]=newPosition[b];
        // }



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
          },
          tweenTo.onStart = function(){

            thisPidgeon.changeAnimStateTo("Bird_Walk",0.2);
          },
          tweenTo.onComplete = function(){
            //pendant: replace plays with crossfadeTo
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
          blendMesh.crossfadeTo(toAnim,0.2);
        }else{
          blendMesh.crossfadeToThrough(toAnim,"Bird_Land",0.2);
        }
      }else if(myCurrentAnimState=="Bird_FlyOff"){
        if(toAnim=="Bird_Land"||toAnim=="Bird_Pose"){
          blendMesh.crossfadeTo(toAnim,0.2);
        }else{
          blendMesh.crossfadeToThrough(toAnim,"Bird_Land",0.2);
        }
      }else if(myCurrentAnimState=="Bird_Idle"){
        if(toAnim=="Bird_Fly"){
          blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",0.2);
        }else{
          blendMesh.crossfadeTo(toAnim,0.2);
        }
      }else if(myCurrentAnimState=="Bird_Land"){
        if(toAnim=="Bird_Fly"){
          blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",0.2);
        }else{
          blendMesh.crossfadeTo(toAnim,0.2);
        }
      }else if(myCurrentAnimState=="Bird_Pose"){
        if(toAnim=="Bird_Fly"){
          blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",0.2);
        }else{
          blendMesh.crossfadeTo(toAnim,0.2);
        }
      }else if(myCurrentAnimState=="Bird_Walk"){
        if(toAnim=="Bird_Fly"){
          blendMesh.crossfadeToThrough(toAnim,"Bird_FlyOff",0.2);
        }else{
          blendMesh.crossfadeTo(toAnim,0.2);
        }
      }else{
        blendMesh.crossfadeTo(toAnim,0.2);
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
    this.geometry = new THREE.BoxGeometry(0.2,0.2,0.2);
    this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe:true} );

    let loader = new THREE.JSONLoader(loadingManager);
    try{
      //statically load mesh, animations and skin
      THREE.BlendCharacter.loadObject( 'assets/pidgeon/Bird_30.json', function(lo) {
  			loaded3dObject=lo;
  			console.log("pidgeon 3d object loaded");
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