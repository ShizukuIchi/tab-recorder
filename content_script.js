console.log('inserted')

const port = chrome.runtime.connect({ name: "page" });
port.onMessage.addListener(function(msg) {
  console.log(msg.msg)  
})

window.addEventListener('mousemove', handleMouseMove, true);
window.addEventListener('mousedown', handleMouseDown, true);
window.addEventListener('mouseup', handleMouseUp, true);
window.addEventListener('click', handleMouseClick, true);
window.addEventListener('scroll', handleScroll, true);

function handleMouseMove({clientX, clientY}) {
  port.postMessage({ type: 'mousemove', x: clientX, y: clientY })
}
function handleMouseDown({clientX, clientY}) {
  port.postMessage({ type: 'mousedown', x: clientX, y: clientY })
}
function handleMouseUp({clientX, clientY}) {
  port.postMessage({ type: 'mouseup', x: clientX, y: clientY })
}

function handleMouseClick({clientX, clientY}) {
  message = `click ${clientX}, ${clientY}`
  port.postMessage({ type: 'click' })
}

function handleScroll(e) {
  port.postMessage({ type: 'scroll'})
}


