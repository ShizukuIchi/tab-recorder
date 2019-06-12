chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({
    url: 'preview.html',
    active: false,
  });
});
