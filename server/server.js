

//++console.log(__dirname);
//question: is this the best way to go here? with respect to file relative paths

var socketServerManager = require("./socketServerManager").default;
var socketSM=new socketServerManager(9966);

let clientsMan=new(require('./ClientsManager').ClientsManager)();

let ev = require('events');
let events = new ev.EventEmitter();


// clientsMan.setKeepaliveTimer(5000);

//when socketServerManager gets a client, we instance a client in clientsMan
socketSM.on('connection',function(ws){
  // console.log("socketSMConn",ws);
  let client = new clientsMan.Client({
    ws: ws
  });
  //send the client Id to the client
  client.send({
    header: "newid",
    pointer: client.unique
  });

  client.send(clientsMan.getAllStates());
  //inform all the other clients about the nuw user
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
