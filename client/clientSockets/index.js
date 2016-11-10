
import Wsock from './ClientWebSocket';
// let characters=require('./Characters');
import Pidgeon from './pidgeon'

//set here when to do certain things according to global events
let eventWhenTo={
  createSocket:"intro_end",
  land:"control_threshold"
}

//my own clientId, bint to server
let myClientId;
//pendant: this probably is no longer needed:
//my own sprite instance.
let localSprite;
//holds websocket and flags wether has been initialized
let wsock=false;
let insideSquare;
//what is the smallest movement to emit to the server; measured as cube shaped comparison as it is faster.
let minimumVectorChangeToBroadcast=0.7;
let emitInterval=0.5;
//last dt time a position was emitted to server
let lastEmitTime=0;
let verbose=false;
let isLanded=false;
export default class PidgeonController {
  constructor(scene,camera) {
    this.scene = scene;
    this.camera=camera;
    this.lastCameraPosition={x:0,y:0,z:0};
  }
  init(loadingManager){

    Pidgeon.initMesh(loadingManager);
    events.on(eventWhenTo.createSocket, (passed) => {
      if (!wsock){
        this.startSocket();
      }
    })


  }
  startSocket() {
    let host = window.document.location.host.replace(/:.*/, '');
    wsock=new Wsock('ws://' + host + ':9966');
    if(verbose)     console.log("Started pidgeon socket");

    let thisPidgeonController=this;
    // let pidgeon = new Pidgeon();
    // pidgeon.init();
    // pidgeon.position.y=30;

    // console.log("pidgeon",this.scene,pidgeon);


    wsock.on("message",function(message){

      if(verbose)console.log("pidgeon "+message.header+" of "+message.pointer+" is:",message.data);

      // console.log("incoming message",message);
      if(message.header=="changeposition"){
        // retrieve the pidgeon icon that represents my own.
        let remoteSprite=Pidgeon.remote(message.pointer);
        if(remoteSprite){
          //Positioning reception is multiplied by 0.001, and emission is multiplied
          //by 1000 because the server is int based and we want to have more detailed
          //pidgeon positioning than whole values
          //remoteSprite.transform.rotation(remoteSprite.transform.position({x:message.data[0]*0.001,y:message.data[1]*0.001,z:message.data[2]*0.001}).getMovementDirection()* 180 / Math.PI);
          try{
            // remoteSprite.transform.position({x:message.data[0]*0.001,y:message.data[1]*0.001,z:message.data[2]*0.001});
            //unlike transform.position, moveTowards.position will tween and rotate to face the movement vector.
            remoteSprite.walkTowards.position({x:message.data[0]*0.001,y:message.data[1]*0.001,z:message.data[2]*0.001});
          }catch(e){
            console.error(e,"pidgeon with remotesprite "+message.pointer,remoteSprite);
          }
          if(verbose)console.log("pidgeon retrieved",remoteSprite);
        }else{
          console.warn("couldn't retrieve the corresponding pidgeon. Creating a new one ",message);
          //if we don't have it, we create it. Comment this if many pidgeon sprites start appearing
          let newCharacter=new Pidgeon({position:{x:message.data[0]*0.001,y:message.data[1]*0.001,z:message.data[2]*0.001},unique:message.pointer});
          thisPidgeonController.scene.add(newCharacter);
        }

      }else if(message.header=="landed"){
        console.log("pidgeon receive landed");
        // retrieve the pidgeon icon that represents my own.
        let remoteSprite=Pidgeon.remote(message.pointer);
        let landed=message.data[0]>0.5;
        console.log("pidgeon receive single landed of id"+message.pointer+"="+landed);
        if(remoteSprite){
          try{
            remoteSprite.flyOrLand(stateValue);
          }catch(e){
            console.error(e,"pidgeon with remotesprite "+message.pointer,remoteSprite);
          }
          if(verbose)console.log("pidgeon retrieved",remoteSprite);
        }else{
          console.warn("couldn't retrieve the corresponding pidgeon. Creating a new one ",message);
          //if we don't have it, we create it. Comment this if many pidgeon sprites start appearing
          let newCharacter=new Pidgeon({position:{x:message.data[0]*0.001,y:message.data[1]*0.001,z:message.data[2]*0.001},unique:message.pointer});
          thisPidgeonController.scene.add(newCharacter);
        }

      }else if(message.header=="remove"){
        if(verbose)console.log("pidgeon remove "+message.pointer);
        //pendant:this should be inside
        let remoteSprite=Pidgeon.remote(message.pointer);
        if(remoteSprite){
          remoteSprite.flyAway(function(){
            thisPidgeonController.scene.remove(remoteSprite);
          });
          //remoteSprite.remove();
        }else{
          console.warn("couldn't retrieve the corresponding pidgeon ",message);
        }
      }else if(message.header=="newid"){
        myClientId=message.pointer;
        if(verbose)console.log("pidgeon client id:"+myClientId);
        //localSprite=new characters.Character({unique:myClientId});
        //console.log("new client Id",message);

        events.on(eventWhenTo.land, (passed) => {
          if(!isLanded){
            console.log("pidgeon emit landed");
            if (passed){
              wsock.emit({header:"landed",pointer:myClientId,data:[1]},function(err,pl){
                if(err){
                  console.error("landed not sent",err);
                }else{
                }
              });
            }
            isLanded=true;
          }
        });


      }else if(message.header=="positionbatch"){
        let batch=new Array();
        // var numeric_array = new Array();
        for (var items in message.data){
            batch.push( message.data[items] );
        }
        //for each state registry
        for(let a = 0; a<batch.length; a+=4){
          //the unique index of the object over which the data will be applied
          let stateObjectUnique=batch[a];
          //check that the batch unique is not my own.
          if(stateObjectUnique!=myClientId){
            //check if we already have a sprite for this remote object
            let dataOwner=Pidgeon.remote(stateObjectUnique);
            let dataCoordinates={x:batch[a+1]*0.001,y:batch[a+2]*0.001,z:batch[a+3]*0.001};
            if(dataOwner){
              if(verbose)console.log("pidgeon object "+stateObjectUnique+" found apply");
              //if we have it, will apply all the data to it. So far only position
              dataOwner.transform.position(dataCoordinates);
            }else{
              if(verbose)console.log("pidgeon object "+stateObjectUnique+" notfound create");
              //if we don't have it, we create it.
              let newCharacter=new Pidgeon({position:dataCoordinates,unique:stateObjectUnique});
              thisPidgeonController.scene.add(newCharacter);
            }
          }
        }
      }else  if(message.header=="landedbatch"){
        let batch=new Array();
        // var numeric_array = new Array();
        for (var items in message.data){
            batch.push( message.data[items] );
        }
        //for each state registry
        for(let a = 0; a<batch.length; a+=2){
          //the unique index of the object over which the data will be applied
          let stateObjectUnique=batch[a];
          let stateValue=[a+1]>0.5;
          if(stateObjectUnique!=myClientId){
            //check if we already have a sprite for this remote object
            let dataOwner=Pidgeon.remote(stateObjectUnique);
            let dataCoordinates={x:batch[a+1]*0.001,y:batch[a+2]*0.001,z:batch[a+3]*0.001};
            if(dataOwner){
              if(verbose)console.log("pidgeon object "+stateObjectUnique+" found apply");
              //if we have it, will apply all the data to it. So far only position
              dataOwner.flyOrLand(stateValue);
            }else{
              if(verbose)console.log("pidgeon object "+stateObjectUnique+" notfound create");
              //if we don't have it, we create it.
              let newCharacter=new Pidgeon({position:dataCoordinates,unique:stateObjectUnique});
              thisPidgeonController.scene.add(newCharacter);
            }
          }
        }
      }else if(message.header=="newclient"){
        // console.log("new client",message);
        let pidgeon=new Pidgeon({unique:message.pointer});
        thisPidgeonController.scene.add(pidgeon);
      }else{
        console.warn("pidgeon unexpected message header:",message);
      }
    });
  }
  frame(dt){
    if(!this.time) this.time=0;
    this.time+=dt;
    // console.log("pidgeon",this.time);
    Pidgeon.updateEach(dt);
    if(this.time-lastEmitTime>=emitInterval){
      this.socketEmitCameraPosition();
      lastEmitTime=this.time;
    }
  }
  socketEmitCameraPosition(){
    if(wsock){
      let position=this.camera.position;
      let different=false;
      //check that the movement is big enough to send
      for(let a in {x:0,y:0,z:0}){
        //console.log(this.camera.position[a]+"!="+this.lastCameraPosition[a]);
        if(Math.abs(this.camera.position[a]-this.lastCameraPosition[a])>=minimumVectorChangeToBroadcast){
          this.lastCameraPosition[a]=this.camera.position[a];
          different=true;
        }
      }
      // console.log("pidgeon tweets position",this.camera.position);

      if(different){
        //console.log("pos!=lastpos");
        wsock.emit({header:"changeposition",pointer:myClientId,data:[position.x*1000,position.y*1000,position.z*1000]},function(err,pl){
          if(err){
            console.error("changePosition not sent",err);
          }else{
          }
        });
      }
      if(localSprite){
        //pendant: this may no longer be needed. place where the local sprite is moved, but camera is inside it by definition
        // localSprite.transform.rotation(localSprite.transform.position({x:e.clientX,y:e.clientY}).getMovementDirection()* 180 / Math.PI);
        // localSprite.transform.position({x:e.clientX,y:e.clientY});
      }
    }
  }
}








