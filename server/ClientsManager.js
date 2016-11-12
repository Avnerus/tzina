/*
this module contains the data for each client in a pool of websocket connections.
the idea is to be able to obtain the last state of each client side without
having necessarily to poll.
It also allows each client to have an 'unique' client ID, and know the client ID
of all the other clients that are connected to the server, and to attach the functions
to a client class, so we become able to call functions such as clientsManager.broadcast
and client.send.
*/

let eemiter=require('../shared/OnHandlers');
// let interpreter=require('../shared/MessageInterpreter');
let verbose=false;



export function ClientsManager(){
  let clients={};
  //uncomment to have access to the client list.
  //should not be a problem as long as iandexes are not altered. Or maybe even if so
  // this.clients=clients;
  let nextClientId=0;
  //question: is this ok?
  eemiter.onHandlers.call(this);
  let thisClientsManager=this;
  let nextClientIdSearch=function(startingFrom){
    //you can either try to be economic with the client id, or just allocate one entry per connection
  /*  var currentClientN=startingFrom;
    while(clients[currentClientN]){
      currentClientN++;
    }
    return currentClientN;*/
    nextClientId++;
    return nextClientId;
  }

  this.setKeepaliveTimer=function(time){
    thisClientsManager.on('clientMessage',function(e){
      if(e.parsedMessage)
      if(e.parsedMessage.header=="pong"){
        //The client has answered a ping message, and will not be removed on next ping timer.
        e.client.waitingPong=false;
      };
    });
    //timer for keepalive
    let pingPongTimer=setInterval(function(){
      thisClientsManager.forEach(function(thisClient){
        if(thisClient.waitingPong){
          thisClientsManager.removeClient(thisClient);
          if(verbose)console.log('stopping client '+thisClient.unique+" from ping-pong death");
          thisClient.broadcast({
            header: "remove",
            pointer: thisClient.unique
          });
        }else{
          if(verbose)console.log("iter"+thisClient.unique);
          thisClient.send({header:"ping"});
          thisClient.waitingPong=true;
        }
      });
    },time);
  }

  //new Client ID creates a space for a new client.
  //custom data can be provided, such as the websocket handle
  this.Client=function(append){
    eemiter.onHandlers.call(this);
    var append=append||{};
    var thisClient=this;
    //question: if timestamp is provided in append parameter, it will get overwritten. Is that ok?
    this.timestamp={created:Date.now()};
    this.currentState={};

    if(!append.ws){
      console.warn("you need to provide every client with a ws instance on creation. Otherwise they will make erros on each send");
    }
    for(var a in append){
      this[a]=append[a];
    }

    //get a new id for distinction among clients on communications
    this.unique=nextClientIdSearch();
    //add this element to a ClientsManager global array;
    clients[this.unique]=this;
    this.getIndexInArray=function(){
      return this.unique;
    }
    //pendant: client is holding a socketServerInstance under the ws variable,
    //this is misleading to programmers and the ws var should be renamed
    this.ws.on('message', function(event) {
      // console.log("->"+JSON.stringify(event));
      // console.log("client received msg"+msg);
      if(event.parsedMessage){
        //track changes and broadcast the ones that need
        thisClient.trackChange(event.parsedMessage);
        //I think that would be better programming that this happened in an integrated-
        //to-the-trackChange-method way.
        if(event.parsedMessage.header){
          if(event.parsedMessage.header=="changeposition")
          thisClientsManager.enqueuePosition(thisClient);
          if(event.parsedMessage.header=="landed")
          thisClientsManager.enqueueLandedState(thisClient);
        }else{
          console.error("[!] ClientsManager.js error: message without header?");
        }
        // if(event.parsedMessage.header=="landed"){
        //   if(verbose)console.log("event land",event.parsedMessage);
        //   // thisClient.broadcast(event.rawMessage);
        // }
        event.client=thisClient;
        thisClient.handle('message',event);
        thisClientsManager.handle('clientMessage',event);
      }
      // console.log(msg);
    });

    this.send=function(data){
      this.ws.send(data);
    }
    //some functions to this client
    this.broadcast=function(data) {
      //broadcast exept this.
      thisClientsManager.broadcast(data,thisClient.unique);
      // console.log("broadcast->");
      // //execute send to all the clients exept this client
      // var except=thisClient.unique;
      // thisClientsManager.forEach(function(client) {
      //   console.log(" iterate client"+client.unique);
      //   var d = true;
      //   if (except) {
      //     if (client.unique == except) {
      //       d = false;
      //     }
      //   }
      //   //ws was provided on connection event to each new client listing
      //   if (d) {
      //     try {
      //       client.send(data);
      //       console.log("client "+client.unique+" sent");
      //     } catch (e) {
      //       console.warn("object " + client.unique + " missed some data", data);
      //       console.warn(e);
      //     }
      //   }
      // });
    };



    // console.log("kk"+this.unique);
    this.id=this.unique;

    //keeps the record for current client's state, so we can make aware new clients
    //about the state of each other client
    this.trackChange=function(data){
      if(verbose) console.log(data.header+" of "+this.unique+" is "+data.data||false);
      this.currentState[data.header]=data.data||false;
      // for(var a in data){
      //   this.currentState[a]=data[a];
      // }
      this.timestamp.lastEmit=Date.now();
    }
    // return this;
  }

  this.forEach=function(callback){
    for(var a in clients){
      if(clients[a]!=null){
        callback(clients[a]);
      }
    }
  }
  this.getAllLandedStates=function(){
    let outGoing={header:"landedbatch",pointer:0,data:[]};
    this.forEach(function(thisClient){
      if(thisClient.currentState.landed){
        outGoing.data.push(thisClient.unique);
        outGoing.data.push(thisClient.currentState.landed[0]);
      }
    });
    // console.log(outGoing);
    return outGoing;
  }
  this.getAllPositions=function(){
    let outGoing={header:"positionbatch",pointer:0,data:[]};
    this.forEach(function(thisClient){
      if(thisClient.currentState.changeposition){
        outGoing.data.push(thisClient.unique);
        for (let a in thisClient.currentState.changeposition){
          outGoing.data.push(thisClient.currentState.changeposition[a]);
        }
      }
    });
    // console.log(outGoing);
    return outGoing;
  }
  let enqueuedClientPositions=[];
  //these will be statics when I update to es6 syntax
  this.enqueuePosition=function(ofClient){
    if(enqueuedClientPositions.indexOf(ofClient)==-1)
      enqueuedClientPositions.push(ofClient);
  }
  let enqueuedClientLandedStates=[];
  //these will be statics when I update to es6 syntax
  this.enqueueLandedState=function(ofClient){
    if(enqueuedClientLandedStates.indexOf(ofClient)==-1)
      enqueuedClientLandedStates.push(ofClient);
  }


  this.flushPositions=function(){
    if(enqueuedClientPositions.length==1){
      //there was only one enqueued message, so it belongs to the first in queue: [0]
      let thisClient=enqueuedClientPositions[0];
      if(verbose)console.log(thisClient.unique+"broadcast single pos",{
        header:"changeposition",
        pointer:thisClient.unique,
        data:thisClient.currentState.changeposition
      });
      thisClient.broadcast({
        header:"changeposition",
        pointer:thisClient.unique,
        data:thisClient.currentState.changeposition
      });

    }else if(enqueuedClientPositions.length>=1){
      let outGoing={header:"positionbatch",pointer:0,data:[]};
      for(let b in enqueuedClientPositions){
        let thisClient=enqueuedClientPositions[b];
        if(thisClient.currentState.changeposition){
          outGoing.data.push(thisClient.unique);
          for (let a in thisClient.currentState.changeposition){
            outGoing.data.push(thisClient.currentState.changeposition[a]);
          }
        }
      }
      if(verbose)console.log("broadcasting some points to many clients",outGoing);
      //clear the array
      thisClientsManager.broadcast(outGoing);

    }else{
      return false;
    }
    enqueuedClientPositions=[];

    return true;
  }

  this.flushLandedStates=function(){
    if(enqueuedClientLandedStates.length==1){
      //there was only one enqueued message, so it belongs to the first in queue: [0]
      let thisClient=enqueuedClientLandedStates[0];
      if(thisClient.currentState.landed){
        thisClient.broadcast({
          header:"landed",
          pointer:thisClient.unique,
          data:thisClient.currentState.landed
        });
        console.log("thisclient broadcast"+JSON.stringify({
          header:"landed",
          pointer:thisClient.unique,
          data:thisClient.currentState.landed
        })+">");
      }else{
        console.log("thisclient didnt have landed"+JSON.stringify(thisClient.currentState)+"X");
      }


    }else if(enqueuedClientLandedStates.length>=1){
      let outGoing={header:"landedbatch",pointer:0,data:[]};
      for(let b in enqueuedClientLandedStates){
        let thisClient=enqueuedClientLandedStates[b];
        if(thisClient.currentState.landed){
          outGoing.data.push(thisClient.unique);
          for (let a in thisClient.currentState.landed){
            outGoing.data.push(thisClient.currentState.landed[a]);
          }
        }
      }
      if(verbose)console.log("broadcasting some points to many clients",outGoing);
      //clear the array
      thisClientsManager.broadcast(outGoing);

    }else{
      return false;
    }
    enqueuedClientLandedStates=[];
    return true;
  }

  this.broadcast=function(data,exceptUnique) {
    if(verbose)console.log("broadcast->");


    thisClientsManager.forEach(function(client) {
      if(verbose)console.log(" iterate client"+client.unique);
      var d = true;
      if (exceptUnique) {
        if (client.unique == exceptUnique) {
          d = false;
        }
      }
      //ws was provided on connection event to each new client listing
      if (d) {
        try {
          client.send(data);
          if(verbose)console.log("client "+client.unique+" sent");
        } catch (e) {
          console.warn("object " + client.unique + " missed some data", data);
          console.warn(e);
        }
      }
    });
  };

  this.removeClient=function(client){
    return delete clients[client.getIndexInArray()];
  }
}