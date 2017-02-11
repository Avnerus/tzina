// question: this line is repeated in ClientWebSocket. Should it be a global instead?
var a = require('../../shared/OnHandlers');
//an array of the displayable characters for client side reference
var characterList = [];
//an array of the associations between server id's and client side id's
var characterAssoc={};
let verbose=false;
exports.chac=characterAssoc;
//functions to access characters:
//iterate all with callback
exports.each = function(callback) {
  for (var characterIndex in characterList) {
    var characterInstance = characterList[characterIndex];
    callback(characterInstance, characterIndex);
  }
}
//get a character using a unique
exports.remote=function(unique){
  return characterAssoc[unique+""];
}
//the raw list of characters
exports.list = characterList;
//construction function
exports.Character = function(properties) {
  var parent = this;
  var properties = properties || {};
  // console.log("c",properties);
  characterList.push(this);
  if(properties.hasOwnProperty("unique")){
if(verbose)     console.log("new character",properties);
    characterAssoc[properties.unique+""]=this;
  }else{
    console.warn("you created a character without providing server unique. This renders the character unreachable");
  }
  a.onHandlers.call(this);
  this.properties = {
    color: properties.color || "transparent",
    position: properties.position || {
      x: 0,
      y: 0
    },
    width: properties.width || 32,
    height: properties.height || 32
  };
  var props = this.properties;
  var myDom = document.createElement('div');
  this.dom = myDom;
  myDom.style.cssText = 'position:absolute;width:' + props.width + 'px;height:' + props.height + 'px;opacity:1;z-index:100;background:' + props.color + ';';
  myDom.innerHTML = '<img src="fly1.png" style="width:100%; height:100%;"/>'+properties.unique;
  //document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(myDom);
  //}, false);
  myDom.addEventListener("mousedown", function(e) {
    e.preventDefault()
    parent.mousePressed = true;
    myDom.style.background = "red";
    parent.handle("mousedown", e);
  });
  myDom.addEventListener("mouseup", function(e) {
    e.preventDefault()
    parent.mousePressed = false;
    myDom.style.background = props.color;
    parent.handle("mouseup", e);
  });

  myDom.addEventListener("mouseleave", function(e) {
    e.preventDefault()
    if (parent.mousePressed) {
      myDom.style.background = props.color;
      parent.handle("mouseup", e);
    }
  });
  var transformReturnFunctions = {
    prevCoords: {
      x: 0,
      y: 0
    },
    newCoords: {
      x: 0,
      y: 0
    },
    getMovementDirection: function() {
      var rel = this.getRelativeMovement();
      return Math.atan2(rel.y, rel.x)
    },
    getRelativeMovement: function() {
      return ({
        x: this.prevCoords.x - this.newCoords.x,
        y: this.prevCoords.y - this.newCoords.y,
        z: this.prevCoords.z - this.newCoords.z
      });
    },
  }
  this.transform = {
    position: function(a) {
      transformReturnFunctions.prevCoords = props.position;
      myDom.style.left = (a.x - props.width / 2) + "px";
      myDom.style.top = (a.y - props.height / 2) + "px";
      props.position = a;
      transformReturnFunctions.newCoords = props.position;
      return transformReturnFunctions;
    },
    rotation: function(a) {
      myDom.style.webkitTransform = 'rotate(' + a + 'deg)';
      myDom.style.mozTransform = 'rotate(' + a + 'deg)';
      myDom.style.msTransform = 'rotate(' + a + 'deg)';
      myDom.style.oTransform = 'rotate(' + a + 'deg)';
      myDom.style.transform = 'rotate(' + a + 'deg)';
    }
  }
  this.transform.position(this.properties.position);
  this.remove=function(){
    document.body.removeChild(myDom);
  }
}