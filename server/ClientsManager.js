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
          console.log('stopping client '+thisClient.unique+" from ping-pong death");
          thisClient.broadcast({
            header: "remove",
            pointer: thisClient.unique
          });
        }else{
          console.log("iter"+thisClient.unique);
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
      // console.log("client received msg"+msg);
      if(event.parsedMessage){
        //track changes and broadcast the ones that need
        thisClient.trackChange(event.parsedMessage);
        if(event.parsedMessage.header=="changeposition"){
          console.log("position",event.parsedMessage);
          thisClient.broadcast(event.rawMessage);
        }
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
      console.log("broadcast->");
      //execute send to all the clients exept this client
      var except=thisClient.unique;
      thisClientsManager.forEach(function(client) {
        console.log(" iterate client"+client.unique);
        var d = true;
        if (except) {
          if (client.unique == except) {
            d = false;
          }
        }
        //ws was provided on connection event to each new client listing
        if (d) {
          try {
            client.send(data);
            console.log("client "+client.unique+" sent");
          } catch (e) {
            console.warn("object " + client.unique + " missed some data", data);
            console.warn(e);
          }
        }
      });
    };



    console.log("kk"+this.unique);
    this.id=this.unique;

    //keeps the record for current client's state, so we can make aware new clients
    //about the state of each other client
    this.trackChange=function(data){
      console.log(data.header+" of "+this.unique+" is "+data.data||false);
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

  this.getAllStates=function(){

    let outGoing={header:"statebatch",pointer:0,data:[]};
    this.forEach(function(thisClient){
      if(thisClient.currentState.changeposition){
        outGoing.data.push(thisClient.unique);
        for (let a in thisClient.currentState.changeposition){
          outGoing.data.push(thisClient.currentState.changeposition[a]);
        }
      }
    });
    console.log(outGoing);
    return outGoing;
  }
  this.removeClient=function(client){
    return delete clients[client.getIndexInArray()];
  }
}