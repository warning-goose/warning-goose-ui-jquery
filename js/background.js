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
url:"https://warninggoose.net/"})

console.log("browserAction clicked");
}

agent.runtime.onMessage.addListener(browserAction);
*/

/*
 * On click, fetch stored settings and forget browsing data.
 */
console.log("DT-WG loaded");
agent.browserAction.onClicked.addListener(() => {
    console.log("DT-WG clicked");
    // const gettingStoredSettings = agent.storage.local.get();
    // do something with data
    // gettingStoredSettings.then(forget, onError);
});
