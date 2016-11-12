

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
  console.log(geolocator);
  //get my country and broadcast it.
  geolocator.getCountryName(ws.ws.upgradeReq.connection.remoteAddress,function(data){
    console.log("->"+data.country);
    client.broadcast({header: "tagText",pointer:client.unique,data:data.country+""});

  });
  // console.log("socketSMConn",ws);
  let client = new clientsMan.Client({
    ws: ws
  });
  //send the client Id to the client
  client.send({
    header: "newid",
    pointer: client.unique
  });

  client.send(clientsMan.getAllPositions());
  client.send(clientsMan.getAllLandedStates());
  //inform all the other clients about the new user
  client.broadcast({
    header: "newclient",//newClient
    pointer: client.unique
  });

  //pendant: sort this
  client.trackChange({
    header: "newclient",
    pointer: client.unique
  });
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
