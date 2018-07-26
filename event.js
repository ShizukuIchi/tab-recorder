chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.executeScript(null, {file: "content_script.js"});
  chrome.tabs.create({
      url: "preview.html",
      active: false
  });
});