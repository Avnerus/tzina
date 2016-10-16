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
    this.mesh = new THREE.Mesh(Pidgeon.geometry,Pidgeon.material);
    this.mesh.position.set(0,0.07,0);
    this.mesh.scale.set(0.3,0.3,0.3);
    this.add(this.mesh);
    /*pendant: these may become handy later, but currently unused:*/
    let transformReturnFunctions = {
      prevCoords: {x:0,y:0,z:0},
      newCoords: {x:0,y:0,z:0},
      getMovementDirection: function() {
        //pendant: so far these are 2d and using x/y coords.
        var rel = this.getRelativeMovement();
        return Math.atan2(rel.y, rel.x)
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
    this.transform = {
      position: function(newPosition) {
        //transfer all the position properties to the mesh position
        //we are trusting that a looks like {x:int,y:int,z:int}
        //we are not requiring all the three corrdinates
        for(let b in newPosition){
          transformReturnFunctions.prevCoords[b]=thisPidgeon.position[b];
          thisPidgeon.position[b]=newPosition[b];
          transformReturnFunctions.newCoords[b]=b[newPosition];
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
  update(deltaTime){
    // console.log("update"+deltaTime);
    // console.log(camera.position);
    //poll camera
  }

  static initMesh(loadingManager){
    console.log("pidgeon init mesh");
    //initialize graphics, create mesh?
    this.geometry = new THREE.BoxGeometry(0.2,0.2,0.2);
    this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe:true} );

    let loader = new THREE.JSONLoader(loadingManager);
    // let createMesh = function( geometry )
    // {
    //   console.log("pidgeon mesh loaded from file");
    //   this.geometry=geometry;
    //   // this.zmesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial() );
    //   // zmesh.position.set( 0, 0, 0 );
    //   // zmesh.scale.set( 3, 3, 3 );
    //   // zmesh.overdraw = true;
    // };
    try{
      loader.load( "assets/pidgeons/birrd.json", function(geometry){
        Pidgeon.geometry=geometry;
      },function(){
        console.log("pidgeon profress");
      },function(e){
        console.error("pidgeon",e);
      });
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