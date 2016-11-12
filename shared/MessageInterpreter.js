/*this contains functions to encode and decode messages into and from websocket
communications. It is necessary because we want to send the smallest payloads possible.
this script is shared between server and client, and makes the task of compressing
adn decompressing the data */

//first header in lookup is misspelled to let know the developer that a message was not well spelled or undefined.
let charLookup=["misspelled","newid","changeposition","landed","newclient","statebatch","positionbatch","landedbatch","remove","ping","pong","tagText"];
let verbose=false;

function decode(bufferArray){
  //console.log("<-"+bufferArray.length)
  try{
    let retArr={};
    // let blankBuffer=new ArrayBuffer(20);
    let inComing={
      //bytes 0-3 will contain message type name
      header:new Int32Array(bufferArray,0,1),
      //bytes 4-7, nibbles 1 will contain object pointer
      pointer:new Int32Array(bufferArray,4,1),
      //bytes 8-19, nibbles 2,3,4 will contain payload
      data:new Int32Array(bufferArray,8)
    }
    // if(retArr.header=="landed")
    // console.log("pidgeon decoding a landed!");
    retArr.pointer=inComing.pointer[0];

    retArr.data={};
    for (let a in inComing.data) {
      retArr.data[a]=inComing.data[a];
    }

    //postprocess
    retArr.header=charLookup[inComing.header[0]];
    if(retArr.header=="tagText"){
      retArr.batch=new Array();
      retArr.string=String.fromCharCode.apply(null,inComing.data);
      // var numeric_array = new Array();
      for (var item in retArr.data){
        // console.log("pid",retArr.data[item]);
        retArr.batch.push( inComing.data[item] );
        // retArr.string+=inComing.data[item];
      }
    }


    return(retArr);
  }catch(e){
    if (verbose) console.log("error while decoding data from a socket",e);
    if (verbose) console.log("the recieved data was:",bufferArray);
  }
}
export {decode}
function encode(data){
  let datalen=3;
  if(data.data){
    datalen=data.data.length;
  }

  let typeNum=charLookup.indexOf(data.header);

  try{
    let bufferArray=new ArrayBuffer(8+datalen*4);
    let outGoing={
      //bytes 0-3 will contain message type name in a representative number
      header:new Int32Array(bufferArray,0,1),
      //bytes 4-7, nibbles 1 will contain object pointer
      pointer:new Int32Array(bufferArray,4,1),
      //bytes 8-19, nibbles 2,3,4 will contain payload

    }
    if(data.header=="tagText"){
      var str = data.data;
      outGoing.data=new Int32Array(bufferArray,8);
      for (var i=0; i<data.data.length; i++) {
        outGoing.data[i]=str.charCodeAt(i);
        // outGoing.data.setInt32(8+i,str.charCodeAt(i));
        console.log(outGoing.data[i]);
      }
    }else {
      outGoing.data=new Int32Array(bufferArray,8);




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
    }
    //set wrong message types to "misspelled"
    if(typeNum==-1)typeNum=0, console.warn(data.header+" is misspelled");
    outGoing.header[0]=typeNum;
    //null pointer value is forgiven, because client doesn't need to send a pointer of himself,
    //as the server is aware of the client index upon reception
    if(!data.pointer>0) data.pointer=0;
    outGoing.pointer[0]=data.pointer;
    //encode reference as uint32
    // outGoing.pointer=data.pointer;

    // console.log(bufferArray);
    // if (verbose) console.log(data[1].length);
    // console.log("--");
    var genericView=new Int32Array(bufferArray);
    for(var a =0; a<genericView.length; a++){
      // console.log(genericView[a]);
    }

    return bufferArray;
  }
  catch(e){
    if (verbose) console.log("exception while trying to encode the data into the socket.",e);
    if (verbose) console.log("the data is expected to look like this:",{header:"vect",pointer:18,data:[-1,2,-3]}," but you provided:",data);
    return false;
  }
}

export {encode}
