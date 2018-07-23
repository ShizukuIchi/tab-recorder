'use strict';

let mediaRecorder;
let recordedBlobs;
let recordOptions = { mimeType: 'video/webm;codecs=vp9' };

const recordedVideo = document.querySelector('video#recorded');

const recordButton = document.querySelector('button#record');
recordButton.addEventListener('click', function() {
  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    stopRecording();
  }
});

function playBlob() {
  const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.onloadedmetadata = function() {
    recordedVideo.play();
  };
};

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecording() {
  recordedBlobs = [];
  try {
    mediaRecorder = new MediaRecorder(window.stream, recordOptions);
  } catch (e) {
    console.error(`Exception while creating MediaRecorder: ${e}`);
    return;
  }
  recordButton.textContent = 'Stop Recording';
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10);
}

function stopRecording() {
  mediaRecorder.stop();
  recordedVideo.controls = true;
  recordButton.textContent = 'Start Recording';
  playBlob();
}

function handleSuccess(stream) {
  recordButton.disabled = false;
  window.stream = stream;
  startRecording();
  window.onfocus = function() {
    if (recordButton.textContent === 'Stop Recording') {
      stopRecording();
    }
  }
}

chrome.tabCapture.capture(
  {
    video: true, 
    audio: true,
    videoConstraints: {
      mandatory: {
        maxWidth: window.innerWidth,
        maxHeight: window.innerHeight
      },
    },
  }, handleSuccess
);