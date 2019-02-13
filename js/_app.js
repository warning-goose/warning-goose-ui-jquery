dtwg_$(function() {
    /*
     * CONSTANTS & GLOBALS 
     */
    var $ = dtwg_$; // local definition of jQuery
    var ENVIRONMENT = __ENVIRONMENT__;
    var SCOPE = '#dtwg '; // do not remove the trailing space in string
    var MODEL; // will contain the data model
    var $BODY = $(SCOPE + 'body');
    var EMAIL_REGEXP = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

    // Network settings
    var API_URL = (function() {
        switch (ENVIRONMENT) {
            case 'development': 
                return 'http://localhost';
                break;
            case 'production': 
                return 'https://api.warninggoose.net';
                break;
            default: 
                return 'http://example.com/no/environment/defined';
                break;
        }
    })();

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

    function closePopup() {
        window.close();
    }

    function getUrlFromTabs(tabs) {
        var url = tabs[0].url;
        MODEL.setTargetUrl(url);
    }

    // data model
    function Model() {
        let dataDefault = {
            email: '',
            offensive: '',
            targetDomain: '',
            targetUrl: '',
            topics: '',
            wassup: '',
        }
        let data = JSON.parse(JSON.stringify(dataDefault));

        this.save = function() {
            $BODY.trigger('wg:before-save', data);
            console.log("saving data OK");
            agent.storage.local.set(data);
            console.log(data);
            $BODY.trigger('wg:after-save', data);
            $BODY.trigger('wg:save', data);
        }

        this.load = function() {
            console.log("loading data");
            $BODY.trigger('wg:before-load', data);
            let loadDataPromise = agent.storage.local.get();
            if (loadDataPromise !== undefined) {
                loadDataPromise.then(
                    function(loadData) {
                        console.log("loading data OK");
                        console.log(loadData);
                        let loadDataKeys = Object.keys(loadData);
                        loadDataKeys.forEach(function(k,i) {
                            data[k] = loadData[k];
                        });
                        console.log(data);
                    }, 
                    function(err) {
                        console.error(err);
                    }
                );
            }

            $BODY.trigger('wg:after-load', data);
            $BODY.trigger('wg:load', data);
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
            this['set' + capProp] = function(value) {
                data[prop] = value;
                // console.log(data);
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
     * EVENT MANAGEMENT : WG MODEL
     **/

    $BODY.on('wg:set-target-url', function(ev, url) {
        var urlClean = url
            .replace(/^.*\/\//, '') // remove protocol
            .replace(/\/.*/, '') // remove path
            .replace(/^www\./, ''); // remove leading www

        MODEL.setTargetDomain(urlClean);
    });

    $BODY.on('wg:set-wassup', function(ev, wassup) {
        // var text = _("why-" + wassup);
        // text = text.replace('%s', "<span class='site-url'>" + MODEL.targetDomain() + "</span>");
        // $(SCOPE + '#title-wassup').html(text);
        enableButton($('#screen-wassup'));
    });

    /* Update text zones with url */
    $BODY.on('wg:load', function(ev, data) {
        var $emailInput = $(SCOPE + 'input[name="your-email"]');
        $emailInput.val(data['email']);
    });

    $BODY.on('wg:set-target-domain', function (ev, data) {
        var $siteText = $(SCOPE + '.site-url');
        $siteText.text(data);
    });

    $BODY.on('wg:set-topics', function (ev, data) {
        enableButton($('#screen-topics'));
    });

    $BODY.on('wg:set-offensive', function (ev, data) {
        enableButton($('#screen-offensive'));
    });

    $BODY.on('wg:set-email', function (ev, data) {
        if (data.match(EMAIL_REGEXP)) {
            MODEL.save();
            enableButton($('#screen-email'));
        } else {
            disableButton($('#screen-email'));
        }
    });

    /** 
     * EVENT MANAGEMENT : HTML ELEMENTS
     **/

    $(SCOPE + '.endgame').on('click', function(ev) {
        ev.preventDefault();
        closePopup();
    });

    $(SCOPE + 'input[name="your-email"]').on('input', function() {
        var email = $(this).val();
        MODEL.setEmail(email);
    });

    $(SCOPE + 'input[name="your-email"]').on('change', function() {
        var email = $(this).val();
        MODEL.setEmail(email);
    });

    $(SCOPE + 'input[name="your-email"]').on('blur', function() {
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
    MODEL.load();

    // startup
    $(SCOPE + 'section:first').fadeIn();

    // enable action button after click
    /*
    $(SCOPE + 'section .form-group')
    .children('[type=radio], [type=checkbox], [type=text], [type=email]')
    .on('change', function() {
        var $submit = $(this).closest('section').find('[type=submit], [type=button]');
        $submit.removeAttr('disabled');
    });
    */
   /*
    */

    function enableButton($curSection) {
        var $submit = $curSection.find('[type=submit], [type=button]');
        $submit.removeAttr('disabled');
        $submit.prop('disabled', false);
    }

    function disableButton($curSection) {
        var $submit = $curSection.find('[type=submit], [type=button]');
        $submit.prop('disabled', true);
    }

    function switchPage($curSection, $nextSection) {
        $BODY.animate({ opacity: 0 }, 250, function() {
            $BODY.css('opacity', '0');
            $BODY.css('display', 'block');
            $curSection.css('display', 'none');
            $nextSection.css('display', 'block');
            // var top = $section.offset().top;
            // $('html, body').scrollTop(top)  
            $BODY.animate({opacity: 1}, 250);
        });
    }

    $(SCOPE + 'section .form-group > [type=button]').on('click', function() {
        var $curSection = $(this).closest('section');
        var $nextSection = $(this).closest('section').next();
        switchPage($curSection, $nextSection);
    });

    $(SCOPE + '#form').on('submit', function(ev) {
        let $nextSection = $(this).find('section').last();
        let $curSection = $nextSection.prev();
        ev.preventDefault();
        let $submitButton = $curSection.find('input[type=submit]');
        
        $submitButton.val('');
        $submitButton.next().show();

        console.log("sending data to " + API_URL + '/api/v1/statements');
        $.ajax({
		    type:'POST',
            url: API_URL + '/api/v1/statements',
            data: MODEL.toJson(),
            dataType: 'json',
            cache: false,
            contentType: 'application/json; charset=utf-8',
            processData: false,
        }).done(function() {
            switchPage($curSection, $nextSection);
        }).fail(function() {
            alert(_("error-when-sending-data"));
        });
    });

    // Within extension only
    if ((agent.runtime !== undefined) && (agent.tabs !== undefined)) {
        agent.tabs.query(
            {
                currentWindow: true, 
                active: true,
                // lastFocusedWindow: true
            }, 
            getUrlFromTabs
        );
    } else {
        var fakeTabs = [{url: 'https://example.com/foo/bar'}];
        getUrlFromTabs(fakeTabs);
    }
})
