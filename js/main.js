'use strict';

let mediaRecorder;
let recordedBlobs = [];
let recordOptions = { mimeType: 'video/webm;codecs=vp9' };
let cursor = {x:0, y:0};
let cursorBeforePause = {x:0, y:0};
let blob;
let timer;
 

const recordedVideo = document.querySelector('video#recorded');

function blob2Src() {
  const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = window.URL.createObjectURL(superBuffer); 
  window.onfocus = function() {
    recordedVideo.controls = true;
    recordedVideo.play()
  }
};

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    blob = event.data
    recordedBlobs.push(blob);
  }
}

function handleSuccess(stream) {
  try {
    mediaRecorder = new MediaRecorder(stream, recordOptions);
  } catch (e) {
    console.error(`Exception while creating MediaRecorder: ${e}`);
    return;
  }
  timer = setTimeout(()=> mediaRecorder.pause(), 100);
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onpause = function(){ 
    window.port.postMessage({ msg: 'pause' }) 
  }
  mediaRecorder.onresume = function(){ window.port.postMessage({ msg: 'resume' }) }
  mediaRecorder.start(10);
}

chrome.tabCapture.capture(
  {
    video: true, 
    audio: true,
    videoConstraints: {
      mandatory: {
        maxWidth: window.innerWidth,
        maxHeight: window.innerHeight,
        maxFrameRate: 60
      },
    },
  }, handleSuccess
);

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "page");
  window.port = port
  port.onMessage.addListener(function(msg) {
    if(msg.type == 'mousemove'){
      cursor.x = msg.x;
      cursor.y = msg.y;
    } else if(mediaRecorder.state){
      if (mediaRecorder.state == 'paused') {
        mediaRecorder.resume()
        port.postMessage({msg:`(${cursorBeforePause.x},${cursorBeforePause.y})->(${cursor.x},${cursor.y})`})
      }
      clearTimeout(timer)
      timer = setTimeout(()=>{
        blob2Src()
        mediaRecorder.pause()
        cursorBeforePause.x = cursor.x
        cursorBeforePause.y = cursor.y
      }, 100)
    }
  });
});

 