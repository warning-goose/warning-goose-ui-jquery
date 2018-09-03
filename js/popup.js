console.log("popup work");
browser.runtime.sendMessage({
        message:'baction'
    });


var lien = document.getElementById('link');
           
lien.addEventListener('click', function() {
            liens();
    });
    
function liens(){ 
            var w = window.open("https://datatransition.net/",'_blank');
            
    };

function getTabUrl(tabs){

        var querying = browser.tabs.query({currentWindow: true, active: true});
        return querying
     };
     
    var greetingPromise = getTabUrl();
        greetingPromise.then(function (greeting) {
            var url = greeting[0].url;
            console.log(url); 
            return url
        },
    
    function (error) {
            console.error('something wrong happened ', error); 
     }
);
