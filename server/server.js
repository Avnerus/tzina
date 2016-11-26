

//++console.log(__dirname);
//question: is this the best way to go here? with respect to file relative paths

var socketServerManager = require("./socketServerManager").default;
var socketSM=new socketServerManager(9966);
let geolocator=require('./geolocator');

let clientsMan=new(require('./ClientsManager').ClientsManager)();
let ev = require('events');
let events = new ev.EventEmitter();

clientsMan.setKeepaliveTimer(5000);

setInterval(function(){
  if(clientsMan.flushPositions()){};//else{console.log("nothing to send");};
  if(clientsMan.flushLandedStates()){
    console.log("->landed");
  };
},200);

//when socketServerManager gets a client, we instance a client in clientsMan
socketSM.on('connection',function(ws){
  //get country name of the websocket connection
  console.log("New connection");
  // console.log("socketSMConn",ws);
  let client = new clientsMan.Client({
    ws: ws
  });


  //inform all the other clients about the new user
  client.broadcast({header: "newclient",pointer: client.unique});
  //send the client Id to the client
  console.log("Sending newid");
  client.send({
    header: "newid",
    pointer: client.unique
  });

  client.send(clientsMan.getAllPositions());
  client.send(clientsMan.getAllLandedStates());

  client.trackChange({
    header: "newclient",
    pointer: client.unique
  });

  //get my country and broadcast it.
  geolocator.getCountryName(
      ws.ws.upgradeReq.headers['x-forwarded-for'] || ws.ws.upgradeReq.connection.remoteAddress,function(data){
    console.log("->"+data.country);
    let clientTextTag={header: "tagText",pointer:client.unique,data:data.country+""};
    client.broadcast(clientTextTag);
    client.trackChange(clientTextTag);
  });

  //get and send (each other client's country) to the new client
  clientsMan.forEach(function(iteratedClient){
    if(iteratedClient.currentState.tagText){
      console.log("send "+iteratedClient.currentState.tagText+" to client "+client.unique);
      client.send({header: "tagText",pointer:iteratedClient.unique,data:iteratedClient.currentState.tagText+""});
    }
  },client.unique);


  //inform whoever is seeing the console about the new client
  console.log('New client [' + client.unique + '] connected');
  //set some handlers to this client's websocket
  ws.on('close', function() {
    client.broadcast({
      header: "remove",
      pointer: client.unique
    });
    console.log('stopping client'+client.unique);
    clientsMan.removeClient(client);
  });
});
