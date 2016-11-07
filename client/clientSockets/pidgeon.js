var BlendCharacter=require('../util/BlendCharacter.js');
var blendMesh;
var loaded3dObject;
//an array of the displayable pidgeons for client side reference
var characterList = [];
//an array of the associations between server id's and client side id's
var characterAssoc={};
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
    blendMesh.rotation.y=Math.PI;
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
        let tweenTo={
          onUpdate:function(){
            //don't use tweenCurrentPosition to iterate because it contains the
            //onupdate function
            for(let b in {x:0,y:0,z:0}){//this[b]?
              thisPidgeon.position[b]=tweenCurrentPosition[b];
            }
          },
          onStart:function(){
            //pendant: replace plays with crossfadeTo
            blendMesh.play("Bird_Walk",1);
          },
          onComplete:function(){
            //pendant: replace plays with crossfadeTo
            blendMesh.play("Bird_Idle",1);
          },
          ease: Power0.easeNone
        }
        thisPidgeon.lookAt(Lokat);
        for(let b in newPosition){
          tweenCurrentPosition[b]=thisPidgeon.position[b];
          tweenTo[b]=newPosition[b];
          transformReturnFunctions.prevCoords[b]=thisPidgeon.position[b];
          transformReturnFunctions.newCoords[b]=newPosition[b];
        }

        // console.log("walkTo",tweenCurrentPosition,tweenTo,transformReturnFunctions,newPosition);
        //tween time has to be finetuned evey time the server interval is changed.
        transformReturnFunctions.tween=TweenMax.to(tweenCurrentPosition, .3, tweenTo);
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
  update(delta){
    if ( blendMesh ) { blendMesh.update( delta ); }
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
  		} );
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