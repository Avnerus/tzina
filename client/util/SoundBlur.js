//note:
//the current implementation doesn't allow you to provide a soundBlur instance as
//parameter to a connect() function. You rather need to provide the BlurModule.inputNode
const SOUND_PATH = "assets/sound/";

export default class BlurModule{
  constructor(audioContext){
    this.filterLowestCut=380;
    this.filterHighestCut=20000;
    this.volumeWhenBLurred=0.7;

    this.defaultBlurValue=0;

    this.audioContext=audioContext;

    this.inputNode=audioContext.createGain();
    this.outputNode=audioContext.createGain();
  }
  init(loadingManager){
    console.log("blurmodule init");
    let thisBlurModule=this;
    let audioContext=this.audioContext;
    this.biquadFilter = audioContext.createBiquadFilter();
    //this is low given the range of 0.0001 to 1000;
    this.biquadFilter.Q.value=0.01;
    this.convolver=audioContext.createConvolver();

    let inputNode=this.inputNode;
    let outputNode=this.outputNode;

    this.dryLevel=audioContext.createGain();
    this.wetLevel=audioContext.createGain();
    /*
    [input node _______________________]
      V
    [Low pass filte ___________________]
      V                    V
    [dryLevel node]     [wetLevel node]
      |                    V
      |                 [convolver]
      V                    V
    [output node _____________________]
    */

    inputNode.connect(this.biquadFilter);

    this.biquadFilter.connect(this.dryLevel);
    this.biquadFilter.connect(this.wetLevel);

    this.dryLevel.connect(outputNode);
    this.wetLevel.connect(this.convolver);

    this.convolver.connect(outputNode);


    this.biquadFilter.type = "lowpass";
    this.biquadFilter.frequency.value = 300;

    //most code of this function comes from http://middleearmedia.com/web-audio-api-convolver-node/
    function getImpulse(impulseUrl) {
      let ajaxRequest = new XMLHttpRequest();
      ajaxRequest.open('GET', impulseUrl, true);
      ajaxRequest.responseType = 'arraybuffer';
      ajaxRequest.onload = function() {
        let impulseData = ajaxRequest.response;
        audioContext.decodeAudioData(impulseData, function(buffer) {
          let myImpulseBuffer = buffer;
          thisBlurModule.convolver.buffer = myImpulseBuffer;
          thisBlurModule.convolver.loop = true;
          thisBlurModule.convolver.normalize = true;
        },
        function(e){"Error with decoding audio data" + e.err});

      }

      ajaxRequest.send();
    }
    // getImpulse("audio/Batcave.wav");
    getImpulse(SOUND_PATH + "ui/Tunnel_impulse_response.wav");
    this.controlBlur(this.defaultBlurValue);
  }
  setRange(min,max){
    this.filterLowestCut=min;
    this.filterHighestCut=max;
  }
  connect(audioInputNode){
    this.outputNode.connect(audioInputNode);
  }
  // disconnect(audioInputNode){
  //   this.outputNode.disconnect(audioInputNode);
  // }
  control(values){
    if(values.volume){
      this.controlVolume(values.volume);
    }
    if(values.Blur){
      this.controlVolume(values.Blur);
    }
    if(values.interpolateBlur){
      this.interpolateBlur(values.Blur);
    }
  }
  controlVolume(value){
    this.inputNode.gain.value=value;
  }
  controlBlur(value,changeRate){
    let wet=value;
    let filterCut=(1-value/**value*/)*this.filterHighestCut+this.filterLowestCut;
    if(changeRate){
      let interpolationStart=this.audioContext.currentTime+0.01;
      this.biquadFilter.frequency.setTargetAtTime(filterCut,interpolationStart,changeRate);
      this.dryLevel.gain.setTargetAtTime(1-wet,interpolationStart,changeRate);
      this.wetLevel.gain.setTargetAtTime(wet*this.volumeWhenBLurred,interpolationStart,changeRate);
    }else{
        //console.log("set value is "+wet);
      this.biquadFilter.frequency.value=filterCut;
      this.dryLevel.gain.value=1-wet;
      this.wetLevel.gain.value=wet*this.volumeWhenBLurred;
    }
  }
}
