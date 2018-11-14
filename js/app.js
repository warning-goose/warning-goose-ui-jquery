
// detect browser type and set agent
var AGENT_MODE_CHROME = 0,
    AGENT_MODE_FIREFOX = 1,
    agent,
    agentMode;
try { agent = browser; agentMode = AGENT_MODE_FIREFOX; } catch (e) { }
try { agent = chrome; agentMode = AGENT_MODE_CHROME; } catch (e) { }

// startup
$('section:first').fadeIn();

$('section .form-group')
.children('[type=radio], [type=checkbox], [type=text], [type=email]')
.on('change', function() {
    console.log('change');
    var $submit = $(this).closest('section').find('[type=submit], [type=button]');
    $submit.removeAttr('disabled');
});

$('section .form-group > [type=button]').on('click', function() {
    var $section = $(this).closest('section').next();
    $section.fadeIn();
    var top = $section.offset().top;
    $('html, body').scrollTop(top)  
});

// Extension only
if (agent.runtime !== undefined) {
    /*
    agent.runtime.sendMessage({
        message:'baction'
    }); */

   function updateUrl(url) {
       var $siteText = $('.site-url');
       $siteText.text(url);
   }

    function showTabs(tabs) {
        var url = tabs[0].url;

        var urlClean = url
            .replace(/^.*\/\//, '') // remove protocol
            .replace(/\/.*/, '') // remove path
            .replace(/^www\./, '') // remove leading www

            updateUrl(urlClean);
      //  alert(urlClean);
        // console.log(url); 
    }

    /*
    if (AGENT_MODE_FIREFOX) {
        agent.tabs
        .query({currentWindow: true, active: true})
        .then(
            showTabs,
            function (error) {
                console.error('something wrong happened ', error); 
            }
        );
    } else if (AGENT_MODE_CHROME) {
    */
    agent.tabs
        .query({
            currentWindow: true, 
            active: true,
            lastFocusedWindow: true
        }, showTabs);
    // }

}

/*
   var lien = document.getElementById('link');
   if (lien) {
   lien.addEventListener('click', function() {
   liens();
   });
   }

   function liens(){ 
   var w = window.open("https://datatransition.net/",'_blank');
   };
   */
