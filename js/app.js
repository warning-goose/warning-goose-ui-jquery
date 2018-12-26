dtwg_$(function() {
    // local jQuery
    var $ = dtwg_$;

    /*
     * CONSTANTS & GLOBALS 
     */
    var SCOPE = '#dtwg '; // do not remove the trailing space in string
    var DEBUG = false;
    var MODEL; // will contain the data model
    var $BODY = $(SCOPE + 'body');

    // Network settings
    var API_URL = DEBUG ? 
        'http://localhost:9200' : 
        'https://warning-goose.maprivacy.org';

    // Internationalization
    var LANG = 'fr';
    var I18N = {
        "fr": {
            "error-when-sending-data": "Un probleme est survenu à l'envoi des données. Veuillez-réessayer plus tard.",
            "success-when-sending-data": "Votre alerte à été envoyée avec succès",
            "why-i_am_forced_to": "Pourquoi %s t'oblige ?",
            "why-i_am_angry": "Pourquoi %s te mets en colère ?",
            "why-i_am_wondering": "Pourquoi %s te fait te poser des questions ?",

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
              return JSON.stringify(data);
        };

        for (let prop in data) {
            // capitalize
            let capProp = 
                prop.charAt(0).toUpperCase() + prop.slice(1);
            let kebabProp = 
                prop.replace(/([a-z])([A-Z])/g, "$1-$2")
                .replace(/\s+/g, '-')
                .toLowerCase();

            // create setter
            this['set' +capProp] = function(value) {
                data[prop] = value;
                console.log(data);
                // console.log("trigger wg:" + kebabProp + ' => ' + value);
                $BODY.trigger('wg:set-' +kebabProp, value);
            }

            // create getter
            this[prop] = function() {
                return data[prop];
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

    $BODY.on('wg:set-wassup', function(ev, wassup) {
        var text = _("why-" + wassup);
        text = text.replace('%s', "<span class='site-url'>" + MODEL.targetDomain() + "</span>");
        $(SCOPE + '#title-wassup').html(text);
    });

    /* Update text zones with url */
    $BODY.on('wg:set-target-domain', function (ev, data) {
        var $siteText = $(SCOPE + '.site-url');
        $siteText.text(data);
    });

    $(SCOPE + 'input[name="your-email"]').on('input', function() {
        var email = $(this).val();
        MODEL.setEmail(email);
    });

    $(SCOPE + 'input[name="wassup"]').on('change', function() {
        var wassup = $(this).val();
        MODEL.setWassup(wassup);
    });

    $(SCOPE + 'input[name="offensive"]').on('change', function() {
        var offensive = $(this).val();
        MODEL.setOffensive(offensive);
    });

    $(SCOPE + 'input[name="topics[]"]').on('change', function() {
        var topics = $(SCOPE + 'input[name="topics[]"]:checked').map(function() { 
            return $(this).val(); 
        }).toArray().join(',');
        MODEL.setTopics(topics);
    });

    /** 
     * MAIN
     */

    MODEL = new Model();

    // startup
    $(SCOPE + 'section:first').fadeIn();

    // enable action button after click
    $(SCOPE + 'section .form-group')
    .children('[type=radio], [type=checkbox], [type=text], [type=email]')
    .on('change', function() {
        var $submit = $(this).closest('section').find('[type=submit], [type=button]');
        $submit.removeAttr('disabled');
    });

    $(SCOPE + 'section .form-group > [type=button]').on('click', function() {
        var $curSection = $(this).closest('section');
        var $nextSection = $(this).closest('section').next();
        $BODY.animate({ opacity: 0 }, 250, function() {
            $BODY.css('opacity', '0');
            $BODY.css('display', 'block');
            $curSection.css('display', 'none');
            $nextSection.css('display', 'block');
            // var top = $section.offset().top;
            // $('html, body').scrollTop(top)  
            $BODY.animate({opacity: 1}, 250);
        });
    });

    $(SCOPE + '#form').on('submit', function(ev) {
        let $nextSection = $(this).find('section').last();
        let $curSection = $nextSection.prev();
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
            $BODY.animate({ opacity: 0 }, 250, function() {
                $BODY.css('opacity', '0');
                $BODY.css('display', 'block');
                $curSection.css('display', 'none');
                $nextSection.css('display', 'block');
                // var top = $section.offset().top;
                // $(SCOPE + 'html,' + SCOPE + ' body').scrollTop(top)  
                $BODY.animate({opacity: 1}, 250);
            });
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
