console.log("I'm defined in background.js");

function browserAction(data){
    browser.tabs.update({
        url:"https://datatransition.net/"})
     
console.log("browserAction clicked");

    };
browser.runtime.onMessage.addListener(browserAction);