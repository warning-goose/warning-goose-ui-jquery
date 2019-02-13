// Browser detection
var AGENT_MODE_CHROME = 0
    ,AGENT_MODE_FIREFOX = 1
    ,agent
    ,agentMode;

try { agent = browser; agentMode = AGENT_MODE_FIREFOX; } catch (e) { }
try { agent = chrome; agentMode = AGENT_MODE_CHROME; } catch (e) { }

    /*
       function browserAction(data){
       agent.tabs.update({
url:"https://maprivacy.org/"})

console.log("browserAction clicked");
}

agent.runtime.onMessage.addListener(browserAction);
*/

/*
 * On click, fetch stored settings and forget browsing data.
 */
console.log("malibu loaded");
agent.browserAction.onClicked.addListener(() => {
    const gettingStoredSettings = agent.storage.local.get();
    console.log("a malibu");
    // do something with data
    // gettingStoredSettings.then(forget, onError);
});
