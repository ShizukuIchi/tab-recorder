console.log('inserted')

if (port) {
  console.log()
}

let port
try {
  port = chrome.runtime.connect({ name: "page" });
  port.onMessage.addListener(function (msg) {
    console.log(msg.msg)
  })
  port.onDisconnect.addListener(function () {
    console.log('disconnect')
  })
} catch (e) {
  console.log(e)
  port = null;
}

window.addEventListener('keypress', (e) => {
  const { shiftKey, ctrlKey, key } = e;
  if (shiftKey && ctrlKey && key === 'R') {
    sendToBackground('toggle')
    console.log('RRR')
  }
})


function sendToBackground(text) {
  try {
    port.postMessage({ msg: text })
  } catch (e) {
    console.log('send message error', e)
  }
}
