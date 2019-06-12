'use strict';

let mediaRecorder;
let recordedBlobs = [];
let recordOptions = { mimeType: 'video/webm;codecs=vp9' };

const recordedVideo = document.querySelector('video#recorded');

window.onfocus = blob2Src;

function blob2Src() {
  if (recordedVideo.src) return;
  mediaRecorder.stop();
  const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.play();
}

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
        maxFrameRate: 60,
      },
    },
  },
  handleSuccess,
);
