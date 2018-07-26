'use strict';

let mediaRecorder;
let recordedBlobs = [];
let recordOptions = { mimeType: 'video/webm;codecs=vp9' };
let currentTime = 0;

const recordedVideo = document.querySelector('video#recorded');

function blob2Src() {
  const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  window.onfocus = function () {
    recordedVideo.currentTime = currentTime
    recordedVideo.play()
  }
  window.onblur = function () {
    currentTime = recordedVideo.currentTime
  }
};

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function handleSuccess(stream) {
  try {
    mediaRecorder = new MediaRecorder(stream, recordOptions);
  } catch (e) {
    console.error(`Exception while creating MediaRecorder: ${e}`);
    return;
  }
  mediaRecorder.ondataavailable = handleDataAvailable;
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

chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name == "page");
  window.port = port
  port.onMessage.addListener(function (msg) {
    if (msg.msg === 'toggle' && mediaRecorder.state) {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.pause()
        blob2Src()
      } else {
        mediaRecorder.resume()
      }
    }
  });
  port.onDisconnect.addListener(function () {
    console.log('disconnect')
  })
});

function sendToContent(text) {
  try {
    window.port.postMessage({ msg: text })
  } catch (e) {
    console.log('send message error', e)
    if (window.port) {
      window.port.disconnect();
    }
  }
}
