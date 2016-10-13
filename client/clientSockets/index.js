import Wsock from './ClientWebSocket';
// let characters=require('./Characters');
import Pidgeon from './pidgeon'
//pendant:myClientId should be a .this let.
//my own clientId, bint to server
let myClientId;
//pendant: this probably is no longer needed:
//my own sprite instance.
let localSprite;
let wsock;

export default class PidgeonController {
  constructor(scene,camera) {
    let host = window.document.location.host.replace(/:.*/, '');
    this.scene = scene;
    this.camera=camera;
    wsock=new Wsock('ws://' + host + ':9966');
  }
  init(loadingManager) {
    console.log("init PidgeonController");
    Pidgeon.initMesh(loadingManager);

    let pidgeon = new Pidgeon();
    pidgeon.init();
    pidgeon.position.y=30;

    console.log("pidgeon",this.scene,pidgeon);
    this.scene.add(pidgeon);

    wsock.on("message",function(message){
      console.log(message.header+" of "+message.pointer+" is:",message.data);

      // console.log("incoming message",message);
      if(message.header=="changeposition"){
        // message.no
        let remoteSprite=characters.remote(message.pointer);
        if(remoteSprite){
          remoteSprite.transform.rotation(remoteSprite.transform.position({x:message.data[0],y:message.data[1],z:message.data[2]}).getMovementDirection()* 180 / Math.PI);
          console.log("retrieved",remoteSprite);
        }else{
          console.warn("couldn't retrieve the corresponding sprite",message);
          console.log(characters.chac);
        }
        // console.log(message.data);
        // characters.each(function(ch){
        //   ch.transform.rotation(ch.transform.position(message).getMovementDirection()* 180 / Math.PI);
        // });
      }else if(message.header=="remove"){
        //pendant:this should be inside
        let remoteSprite=characters.remote(message.pointer);
        if(remoteSprite){
          remoteSprite.remove();
        }else{
          console.warn("couldn't retrieve the corresponding sprite",message);
        }
      }else if(message.header=="newid"){
        myClientId=message.pointer;
        console.log("client id:"+myClientId);
        localSprite=new characters.Character({unique:myClientId});
        //console.log("new client Id",message);
      }else if(message.header=="statebatch"){
        let batch=new Array();
        // var numeric_array = new Array();
        for (var items in message.data){
            batch.push( message.data[items] );
        }
        //for each state registry
        for(let a = 0; a<batch.length; a+=4){
          //the unique index of the object over which the data will be applied
          let stateObjectUnique=batch[a];
          //check if we already have a sprite for this remote object
          let dataOwner=characters.remote(stateObjectUnique);
          let dataCoordinates={x:batch[a+1],y:batch[a+2],z:batch[a+3]};
          if(dataOwner){
            console.log("object "+stateObjectUnique+" found apply");
            //if we have it, will apply all the data to it. So far only position
            dataOwner.transform.position(dataCoordinates);
          }else{
            console.log("object "+stateObjectUnique+" notfound create");
            //if we don't have it, we create it.
            let newCharacter=new characters.Character({position:dataCoordinates,unique:stateObjectUnique});
            //if the character id is of my same server id, means that is the localSprite
            console.log("myclient",myClientId);
            if(message.pointer==myClientId){ localSprite=newCharacter; }
          }
        }
      }else if(message.header=="newclient"){
        // console.log("new client",message);
        new characters.Character({unique:message.pointer});
      }else{
        console.warn("unexpected message header:",message);
      }
    });
  }
  socketEmitCameraPosition(){
    let position=this.camera.position;
    console.log("pidgeon tweets position",this.camera.position);
    wsock.emit({header:"changeposition",pointer:myClientId,data:[position.x,position.y,position.z]},function(err,pl){
      if(err){
        console.log("not sent",err);
      }else{
        //console.log(pl);
      }
    });
    if(localSprite){
      // console.log("clientid",myClientId,characters)
      // localSprite=characters.remote(myClientId);
      // console.log(localSprite);
      localSprite.transform.rotation(localSprite.transform.position({x:e.clientX,y:e.clientY}).getMovementDirection()* 180 / Math.PI);
    }
  }
}








