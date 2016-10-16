let a=require('../../shared/OnHandlers');
let interpreter=require('../../shared/MessageInterpreter');

export default class ClientWebSocket {
  constructor(address){
    a.onHandlers.call(this);
    console.log("ClientWebSocket constructed!");
    if(address){
      this.init(address);
    }
    return this;
  }
  init (address){
    let parent=this;
    //onHandlers.call(this);

    this.ws = new WebSocket(address);

    this.ws.binaryType='arraybuffer';//i actually would like to communicate by using arraybuffer

    //alias only for easier access
    let connection=this.ws;
    connection.onmessage = function (event) {
      let parsedMessage=interpreter.decode(event.data);
      if(parsedMessage.header=="ping"){
        parent.emit({header:"pong",pointer:0});
      }else{
        parent.handle("message",parsedMessage);
      }
    };
    connection.onopen = function (event) {
      // connection.send([42,45]);
      parent.handle("connectionOpened",event);
      //parent.emit("test");
    };
  }
  emit(payload,then){
    let connection=this.ws;
    let ret={};
    let encodedMessage=interpreter.encode(payload);
    // console.log("encodedecode",interpreter.decode(encodedMessage).data);

    try{
      connection.send(encodedMessage);
      this.handle("emit",encodedMessage);
      if(then)
      then(null,payload);
    }
    catch(error){
      if(then){
        then(error);
      }else{
        throw error;
      }
    }
    return ret;
  }

}
