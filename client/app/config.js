// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the config module contains different application configurations that contain settings
// this module returns a static object

define([
    'util/util'
], function (Util) {
        
    var envs = {
        dev: {
            serverPort: 99,
            localhost: '127.0.0.1',
            serverIP: '192.168.1.101'
        },
        prod: {
            serverPort: 80,
            localhost: 'localhost_not_defined_in_prod',// this will generate a run time error when trying to connect
            serverName: 'smartjs.programico.com'
        }
    };

    // see if a config was specified by a bulid script using uglify's --define
    // example usage is in /qa/builds/build.android.js
    function getBuildEnv() {
        return BuildEnv && envs[BuildEnv];
    }

    // set the current environment
    envs.current = getBuildEnv() ||
        // the env to use if no other is specified
        envs.dev;

    var isProd = envs.current === envs.prod;

    function getServerAddress(preferLocalHost) {
        var port = envs.current.serverPort == 80 ? '' : ':' + envs.current.serverPort,
            address = envs.current.serverName || (preferLocalHost ? envs.current.localhost : envs.current.serverIP);
        return '//{0}{1}'.format(address, port);
    }

    // all configurations used by the application
    var configs = {
            test: {
                device: 'web',
                serverAddress: getServerAddress(true),
                // this is picked up by the storage module and allows to create a random namespace in localStorage, which can be useful in testing
                storagePrefix: Util.randomString(),
                showConsoleMessages: true
            },
            web: {
                device: 'web',
                serverAddress: getServerAddress(true),
                storagePrefix: '',
                showConsoleMessages: true
            },
            android: {
                device: 'android',
                serverAddress: getServerAddress(false),
                storagePrefix: '',
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
        return BuildConfig && configs[BuildConfig];
    }
    
    // determine which configuration to use
    var currentConfig = getBuildConfig() || getUrlConfig() || configs.current;
    // the config knows what env
    currentConfig.isProd = isProd;

    // avoid depending on Logger, because it depends on Config!
    function logMessage(message) {
        if (!currentConfig.showConsoleMessages) return;
        console.log(message);
    }

    logMessage('Config: currentConfig=' + Util.inspectObject(configs.current));
    
    return currentConfig;
});