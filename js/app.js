$(function() {

    /*
     * CONSTANTS & GLOBALS 
     */
    var DEBUG = true;
    var MODEL; // will contain the data model
    var $BODY = $('body');

    // Network settings
    var API_URL = DEBUG ? 
        'http://localhost:9200' : 
        'https://warning-goose.maprivacy.org';

    // Internationalization
    var LANG = 'fr';
    var I18N = {
        "fr": {
            "error-when-sending-data": "Un probleme est survenu à l'envoi des données",
            "success-when-sending-data": "Votre alerte à été envoyée avec succès",
        }
    }

    // Browser detection
    var AGENT_MODE_CHROME = 0
        ,AGENT_MODE_FIREFOX = 1
        ,agent
        ,agentMode;

    try { agent = browser; agentMode = AGENT_MODE_FIREFOX; } catch (e) { }
    try { agent = chrome; agentMode = AGENT_MODE_CHROME; } catch (e) { }
    

    /** 
     * Functions & classes declarations
     */

    // internationalization
    function _(str) {
        if (I18N[LANG] === undefined) {
            return undefined; 
        }
        return I18N[LANG][str];
    }

    function getUrlFromTabs(tabs) {
        var url = tabs[0].url;
        MODEL.setTargetUrl(url);
    }

    // data model
    function Model() {
        let data = {
            email: '',
            offensive: '',
            targetDomain: '',
            targetUrl: '',
            topics: '',
            wassup: '',
        }

        this.toJson = function() {
              return JSON.parse(JSON.stringify(data));
        };

        for (let prop in data) {
            // capitalize
            let capProp = 
                'set' +
                prop.charAt(0).toUpperCase() + prop.slice(1);
            let kebabProp = 
                'set-' +
                prop.replace(/([a-z])([A-Z])/g, "$1-$2")
                .replace(/\s+/g, '-')
                .toLowerCase();
            this[capProp] = function(value) {
                data[prop] = value;
                console.log(data);
                // console.log("trigger wg:" + kebabProp + ' => ' + value);
                $BODY.trigger('wg:' + kebabProp, value);
            }
        }
    };


    /** 
     * EVENT MANAGEMENT
     **/

    $BODY.on('wg:set-target-url', function(ev, url) {
        var urlClean = url
            .replace(/^.*\/\//, '') // remove protocol
            .replace(/\/.*/, '') // remove path
            .replace(/^www\./, ''); // remove leading www

        MODEL.setTargetDomain(urlClean);
    });

    /* Update text zones with url */
    $BODY.on('wg:set-target-domain', function (ev, data) {
        var $siteText = $('.site-url');
        $siteText.text(data);
    });

    $('input[name="your-email"]').on('input', function() {
        var email = $(this).val();
        MODEL.setEmail(email);
    });

    $('input[name="wassup"]').on('change', function() {
        var wassup = $(this).val();
        MODEL.setWassup(wassup);
    });

    $('input[name="offensive"]').on('change', function() {
        var offensive = $(this).val();
        MODEL.setOffensive(offensive);
    });

    $('input[name="topics[]"]').on('change', function() {
        var topics = $('input[name="topics[]"]:checked').map(function() { 
            return $(this).val(); 
        }).toArray().join(',');
        MODEL.setTopics(topics);
    });

    /** 
     * MAIN
     */

    MODEL = new Model();

    // startup
    $('section:first').fadeIn();

    // enable action button after click
    $('section .form-group')
    .children('[type=radio], [type=checkbox], [type=text], [type=email]')
    .on('change', function() {
        var $submit = $(this).closest('section').find('[type=submit], [type=button]');
        $submit.removeAttr('disabled');
    });

    $('section .form-group > [type=button]').on('click', function() {
        var $section = $(this).closest('section').next();
        $BODY.animate({ opacity: 0 }, 250, function() {
            $BODY.css('opacity', '0');
            $BODY.css('display', 'block');
            $section.css('display', 'block');
            var top = $section.offset().top;
            $('html, body').scrollTop(top)  
            $BODY.animate({opacity: 1}, 250);
        });
    });

    $('#form').on('submit', function(ev) {
        ev.preventDefault();

        $.ajax({
		    type:'POST',
            url: API_URL + '/api/v1/statements',

            data: MODEL.toJson(),
            dataType: 'json',
            cache: false,
            contentType: 'application/json; charset=utf-8',
            processData: false,
        }).done(function() {
            alert(_("success-when-sending-data"));
        }).fail(function() {
            alert(_("error-when-sending-data"));
        });
    });

    // Within extension only
    if (agent.runtime !== undefined) {
        agent.tabs
        .query({
            currentWindow: true, 
            active: true,
            lastFocusedWindow: true
        }, getUrlFromTabs);
    } else {
        var fakeTabs = [{url: 'https://example.com/foo/bar'}];
        getUrlFromTabs(fakeTabs);
    }
})
