/*this contains functions to encode and decode messages into and from websocket
communications. It is necessary because we want to send the smallest payloads possible.
this script is shared between server and client, and makes the task of compressing
adn decompressing the data */

//first header in lookup is misspelled to let know the developer that a message was not well spelled or undefined.
let charLookup=["misspelled","newid","changeposition","landed","newclient","statebatch","remove","ping","pong"];
let verbose=false;

function decode(bufferArray){
  try{

    let retArr={};

    // let blankBuffer=new ArrayBuffer(20);

    let inComing={
      //bytes 0-3 will contain message type name
      header:new Int32Array(bufferArray,0,1),
      //bytes 4-7, quartets 1 will contain object pointer
      pointer:new Int32Array(bufferArray,4,1),
      //bytes 8-19, quartets 2,3,4 will contain payload
      data:new Int32Array(bufferArray,8)
    }

    retArr.header=charLookup[inComing.header[0]];
    retArr.pointer=inComing.pointer[0];

    retArr.data={};
    for (let a in inComing.data) {
      retArr.data[a]=inComing.data[a];
    }

    return(retArr);
  }catch(e){
    if (verbose) console.log("error while decoding data from a socket",e);
    if (verbose) console.log("the recieved data was:",bufferArray);
  }
}
export {decode}
function encode(data){
  try{
    let datalen=3;
    if(data.data){
      datalen=data.data.length;
    }
    let bufferArray=new ArrayBuffer(8+datalen*4);
    let outGoing={
      //bytes 0-3 will contain message type name in a representative number
      header:new Int32Array(bufferArray,0,1),
      //bytes 4-7, quartets 1 will contain object pointer
      pointer:new Int32Array(bufferArray,4,1),
      //bytes 8-19, quartets 2,3,4 will contain payload
      data:new Int32Array(bufferArray,8)
    }

    //encode header as four characters
    let typeNum=charLookup.indexOf(data.header);
    //set wrong message types to "misspelled"
    if(typeNum==-1)typeNum=0, console.warn(data.header+" is misspelled");
    outGoing.header[0]=typeNum;
    if(data.data){
      for(let a=0;a<data.data.length;a++){
        outGoing.data[a]=data.data[a];
      }
    }else{
      //if (verbose) console.log("payloadless message",data);
      for(let a=0;a<outGoing.data.length;a++){
        outGoing.data[a]=0;
      }
    }

    //null pointer value is forgiven, because client doesn't need to send a pointer of himself,
    //as the server is aware of the client index upon reception
    if(!data.pointer>0) data.pointer=0;
    outGoing.pointer[0]=data.pointer;
    //encode reference as uint32
    // outGoing.pointer=data.pointer;

    // if (verbose) console.log(data[1].length);
    return bufferArray;
  }
  catch(e){
    if (verbose) console.log("exception while trying to encode the data into the socket.",e);
    if (verbose) console.log("the data is expected to look like this:",{header:"vect",pointer:18,data:[-1,2,-3]}," but you provided:",data);
    return false;
  }
}
export {encode}
