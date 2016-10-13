/*this contains functions to encode and decode messages into and from websocket
communications. It is necessary because we want to send the smallest payloads possible.
this script is shared between server and client, and makes the task of compressing
adn decompressing the data */
// function VectorND(buffer){
//   switch(buffer.length){
//     case 4:
//     return {x:buffer[1],y:buffer[2],z:buffer[3]}
//     break;
//     case 3:
//     return {x:buffer[1],y:buffer[2]}
//     break;
//     case 2:
//     return {x:buffer[1]}
//     break;
//     default:
//     console.warn("MessageInterpreter: Message had a vector header, but it's length was out of rule",buffer);
//     return {};
//   }
// }
// function intArrayEncode(arr){
//   return new Uint32Array(arr);
// }
// function intArrayDecode(data){
//   return new Uint32Array(data);
// }
// function Raw(buffer){
//   return buffer;
// }
// let headerToReturnType={
//   0:Raw,
//   1:VectorND
// }

//to get quoted array you can type jsut the chars and process it with the regex
//[^,\n] -> "$&"
//first header in lookup is misspelled to let know the developer that a message was not well spelled or undefined.
let charLookup=["misspelled","newid","changeposition","newclient","statebatch","remove","ping","pong"];
//https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String

// function ab2str(buf) {
//   return String.fromCharCode.apply(null, new Uint16Array(buf));
// }
// function str2ab(str) {
//   let buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
//   let bufView = new Uint16Array(buf);
//   for (let i=0, strLen=str.length; i < strLen; i++) {
//     bufView[i] = str.charCodeAt(i);
//   }
//   return buf;
// }


function decode(bufferArray){
  try{

    let retArr={};

    // let blankBuffer=new ArrayBuffer(20);

    let inComing={
      //bytes 0-3 will contain message type name
      header:new Uint32Array(bufferArray,0,1),
      //bytes 4-7, quartets 1 will contain object pointer
      pointer:new Uint32Array(bufferArray,4,1),
      //bytes 8-19, quartets 2,3,4 will contain payload
      data:new Uint32Array(bufferArray,8)
    }
    //some implementations of dataViews will not slice the buffer, but serve the whole in a single dataview.
    //this solves that.
    // if(data.length==bufferArray.length){
    //   console.log("complete dataview");
    // }
    // inComing.data[0]=422;
    retArr.header=charLookup[inComing.header[0]];
    //console.log("header string of header "+inComing.header[0]+" is "+retArr.header);
    // your browser must support for..of loop
    // and let-scoped variables in for loops
    retArr.pointer=inComing.pointer[0];
    // console.log(inComing.pointer[0]);
    // var dataIterator=inComing.data.values();
    // let a=0;

    retArr.data={};
    for (let a in inComing.data) {
      retArr.data[a]=inComing.data[a];
    }

    // retArr.data=Array.from(new Uint32Array(inComing.data.buffer));

    // retArr.data=(inComing.data.slice(8,inComing.data.length));
    // for(var a =0;a<inComing.data.length;a++){
    //   retArr.data[a]=inComing.data[a];
      // for(var b =0;b<inComing.data.buffer.length;b++){
      //   retArr.data[a+""+b]=inComing.data[a].buffer[b];
      // }
    // }
    // retArr.data=Array.from(inComing.data);


    // console.log();
    return(retArr);
  }catch(e){
    console.log("error while decoding data from a socket",e);
    console.log("the recieved data was:",bufferArray);
  }
}
export {decode}
// encode({type:"vector",pointer:32,coords
function encode(data){
  //console.log("encode data",data);
  try{
    let datalen=3;
    if(data.data){
      datalen=data.data.length;
    }
    let bufferArray=new ArrayBuffer(8+datalen*4);
    let outGoing={
      //bytes 0-3 will contain message type name in a representative number
      header:new Uint32Array(bufferArray,0,1),
      //bytes 4-7, quartets 1 will contain object pointer
      pointer:new Uint32Array(bufferArray,4,1),
      //bytes 8-19, quartets 2,3,4 will contain payload
      data:new Uint32Array(bufferArray,8)
    }

    //encode header as four characters
    // data[0]=new Float32Array(str2ab(data[0]));
    // console.log(data[0]);
    let typeNum=charLookup.indexOf(data.header);
    //set wrong message types to "misspelled"
    if(typeNum==-1)typeNum=0, console.warn(data.header+" is misspelled");

    outGoing.header[0]=typeNum;
    // console.log(outGoing.header.buffer[0],data);
    if(data.data){
      for(let a=0;a<data.data.length;a++){
        outGoing.data[a]=data.data[a];
      }
    }else{
      //console.log("payloadless message",data);
      for(let a=0;a<outGoing.data.length;a++){
        outGoing.data[a]=0;
      }
    }

    //null pointer is forgiven, because client doesn't need to send a pointer of himself,
    //as the server is aware of the client index upon reception
    if(!data.pointer>0) data.pointer=0;
    outGoing.pointer[0]=data.pointer;
    //encode reference as uint32
    // outGoing.pointer=data.pointer;

    // console.log(data[1].length);
    return bufferArray;
  }
  catch(e){
    console.log("exception while trying to encode the data into the socket.",e);
    console.log("the data is expected to look like this:",{header:"vect",pointer:18,data:[-1,2,-3]}," but you provided:",data);
    return false;
  }
}
export {encode}
