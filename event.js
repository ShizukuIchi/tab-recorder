chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({
        url: "preview.html",
        active: false
    }, function(tab) {
        console.log('window open');
    });
});
