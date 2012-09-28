// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the bootstrap module is the application entry point
// require Js is configured here
// this module does not return an interface
// this module will publish a single event to get the app booted
// this module will require any orphan dependencies so their code is established into the ecosystem

// prevent deep linking. might as well do this first because it will refresh if they have a hash when visiting the page for the 1st time
if (location.hash || location.href.slice(-1) == "#") {
    window.history.pushState("", document.title, window.location.pathname);
}

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
        underscore: '../lib/lodash.custom'
    }
});

require([
    'require',
    'config',
    'jquery',
    'jqueryMobile'
], function (require, Config, Jquery, Mobile) {

    var isDeviceReady = Config.device === 'web',
        isDocReady = false,
        isLaunched = false;

    function bootstrap(LocalStorage, Logger, Pubsub) {
        Logger.log('config', Config, true);

        // todo: implement browser screen
        var isBrowserAllowed = true, // Browser.isPermitted()
            hasMember = LocalStorage.hasLocalMember(),
            localMember = isBrowserAllowed && hasMember ? LocalStorage.getLocalMember() : null,
            eventName = !isBrowserAllowed ? 'error.redirect' : hasMember ? 'member.load' : 'member.none';

        // this will start off the app, most likely Router will handle it
        Pubsub.publish(eventName, localMember);
    }

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
            ], bootstrap);
        }
    }

    // mobile device, wait for deviceready event fired by phonegap
    function onDeviceReady() {
        console.log('deviceReady');
        isDeviceReady = true;
        checkLaunchConditions();
    }

    function onDocumentReady() {
        console.log('docReady');
        isDocReady = true;
        checkLaunchConditions();
    }

    if (!isDeviceReady) {
        document.addEventListener('deviceready', onDeviceReady, false);
    }

    Jquery(document).ready(onDocumentReady);

    Jquery.extend(Mobile, {
        ajaxEnabled: false,
        showLoadMsg: false,
        hashListeningEnabled: false,
        pushStateEnabled: false
    });
});