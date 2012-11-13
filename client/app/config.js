// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the config module contains different application configurations that contain settings
// this module returns a static object

define([
    // needed for string.format
    'util/util'
], function (Util) {
        
    var envs = {
        dev: {
            serverPort: 99,
            localhost: '127.0.0.1',
            // will be used in local android builds, ip of your machine
            serverIP: '10.1.0.112'
        },
        prod: {
            serverPort: 80,
            serverName: 'smartjs.programico.com'
        }
    };

    // see if a config was specified by a bulid script using uglify's --define
    // example usage is in /qa/builds/build.android.js
    function getBuildEnv() {
        if (typeof (BuildEnv) === "undefined") return null;
        if (!BuildEnv && !envs[BuildEnv]) return null;
        return envs[BuildEnv];
    }

    // set the current environment
    envs.current = getBuildEnv() ||
        // the env to use if no other is specified
        envs.dev;

    var isProd = envs.current === envs.prod;

    function getServerAddress(preferLocalHost) {
        var port = envs.current.serverPort == 80 ? '' : ':' + envs.current.serverPort,
            address = envs.current.serverName || (preferLocalHost ? envs.current.localhost : envs.current.serverIP);
        return 'http://{0}{1}'.format(address, port);
    }

    // all configurations used by the application
    var configs = {
            test: {
                device: 'web',
                serverAddress: getServerAddress(false),
                showConsoleMessages: true,
                isTest: true
            },
            web: {
                device: 'web',
                serverAddress: getServerAddress(false),
                showConsoleMessages: true
            },
            android: {
                device: 'android',
                serverAddress: getServerAddress(false),
                showConsoleMessages: true
            }
        };

    // the config to use if no other is specified
    configs.current = configs.web;

    // private functions

    // see if a config was passed on the Url line
    function getUrlConfig() {
        var urlParams = Util.getParameters(),
            config = urlParams.config;
        return config && configs[config];
    }

    // see if a config was specified by a bulid script using uglify's --define
    // example usage is in /qa/builds/build.android.js
    function getBuildConfig() {
        if (typeof (BuildConfig) === "undefined") return null;
        if (!BuildConfig && !configs[BuildConfig]) return null;
        return configs[BuildConfig];
    }
    
    // determine which configuration to use
    var currentConfig = getBuildConfig() || getUrlConfig() || configs.current;
    // the config knows whether its in prod
    currentConfig.isProd = isProd;
    
    return currentConfig;
});