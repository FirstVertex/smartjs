// prevent deep linking. might as well do this first because it will refresh if they have a hash when visiting the page for the 1st time
if (location.hash || location.href.slice(-1) == "#") {
    window.history.pushState("", document.title, window.location.pathname);
}

// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the bootstrap module is the application entry point
// require Js is configured here
// this module does not return an interface
// this module will publish a single event to get the app booted
// this module will require any orphan dependencies so their code is established into the ecosystem


// config for requirejs, should be the 1st thing encountered by require
requirejs.config({
    paths: {
        // alias all libs for easier versioning
        jquery: '../lib/jquery-1.8.0',
        jqueryMobile: '../lib/jquery.mobile-1.2.0-alpha.1',
        jstorage: '../lib/jstorage',
        pubsubLib: '../lib/jquery.pubsub',
        knockout: '../lib/knockout-2.1.0',
        now: '../lib/now',
        phonegap: '../lib/cordova-2.0.0',
        underscore: '../lib/lodash.custom'
    }
});

require([
    'require',
    'config',
    'jquery',
    'jqueryMobile'
], function (require, Config, Jquery) {

    var isDeviceReady = false,
        isDocReady = false,
        isLaunched = false;

    function checkLaunchConditions() {
        if (!isLaunched && isDeviceReady && isDocReady) {
            isLaunched = true;
            require([
                'util/storage',
                'util/logger',
                'util/pubsub',
                'router',   // need to explictily load it here because nobody depends on it
                'util/koHelper',   // need to explictily load it here because nobody depends on it
                'util/fullHeight'   // need to explictily load it here because nobody depends on it
            ], function (LocalStorage, Logger, Pubsub) {
                Logger.log('Bootstrap: app is launching');

                // todo: implement browser screen
                var isBrowserAllowed = true; // Browser.isPermitted()
                var eventName = !isBrowserAllowed ? 'error.redirect' : LocalStorage.hasLocalMember() ? 'member.load' : 'member.none';

                Pubsub.publish(eventName, LocalStorage.getLocalMember());
            });
        }
    }

    if (Config.device === 'web') {
        // don't wait for deviceready event
        isDeviceReady = true;
    } else {
        // mobile device, load phonegap and wait for deviceready event
        document.addEventListener('deviceready', function () {
            isDeviceReady = true;
            checkLaunchConditions();
        }, false);
        // phonegap will send out deviceready event
        require(['phonegap']);
    }

    // listen for doc ready
    Jquery(document).ready(function () {
        console.log('docready');
        isDocReady = true;
        checkLaunchConditions();
    });
});