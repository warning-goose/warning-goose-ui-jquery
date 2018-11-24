$(function() {
    /*
     * detect browser type and set agent
     */
    var AGENT_MODE_CHROME = 0
        ,AGENT_MODE_FIREFOX = 1
        ,agent
        ,agentMode;

    try { agent = browser; agentMode = AGENT_MODE_FIREFOX; } catch (e) { }
    try { agent = chrome; agentMode = AGENT_MODE_CHROME; } catch (e) { }

    /*
     * Helper functions
     */
    function updateUrl(url) {
        var $siteText = $('.site-url');
        $siteText.text(url);
    }

    function showTabs(tabs) {
        var url = tabs[0].url;

        var urlClean = url
            .replace(/^.*\/\//, '') // remove protocol
            .replace(/\/.*/, '') // remove path
            .replace(/^www\./, ''); // remove leading www

        updateUrl(urlClean);
    }

    /*
     * Setup event handlers 
     */

    // startup
    $('section:first').fadeIn();

    // enable action button after click
    $('section .form-group')
    .children('[type=radio], [type=checkbox], [type=text], [type=email]')
    .on('change', function() {
        console.log('change');
        var $submit = $(this).closest('section').find('[type=submit], [type=button]');
        $submit.removeAttr('disabled');
    });


    var $body = $('body');
    $('section .form-group > [type=button]').on('click', function() {
        var $section = $(this).closest('section').next();
        $body.animate({ opacity: 0 }, 250, function() {
            $body.css('opacity', '0');
            $body.css('display', 'block');
            $section.css('display', 'block');
            var top = $section.offset().top;
            $('html, body').scrollTop(top)  
            $body.animate({opacity: 1}, 250);
        });
    });

    $('#form').on('submit', function(ev) {
        ev.preventDefault();

        var data = {
            site: $('.site-url').text(),
            wassup: $('input[name="wassup"]').val(),
            topics: $('input[name="topics[]"]:checked').map(function() { 
                return $(this).val(); 
            }).toArray().join(','),
            email: $('input[name="your-email"]').val()
        };

        $.ajax({
		    type:'POST',
            url: "http://localhost:9200/api/v1/statements",

            data: JSON.stringify(data),
            dataType: 'json',
            cache: false,
            async: false,
            contentType: 'application/json; charset=utf-8',
            processData: false,
            success:function(data) {
                alert('Data with file are submitted !');
            }
        });
    });

    // Within extension only
    if (agent.runtime !== undefined) {
        agent.tabs
        .query({
            currentWindow: true, 
            active: true,
            lastFocusedWindow: true
        }, showTabs);
    } else {
        var fakeTabs = [{url: 'https://example.com/foo/bar'}];
        showTabs(fakeTabs);
    }
})
