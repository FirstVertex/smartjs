// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the config module contains different application configurations that contain settings
// this module returns a static object

define([
    'util/util'
], function (Util) {
        
    var serverPort = '99',
        localhost = '127.0.0.1',
        serverAddress = '192.168.1.115';

    // all configurations used by the application
    var configs = {
            test: {
                device: 'web',
                serverAddress: '//{0}:{1}'.format(localhost, serverPort),
                storagePrefix: Util.randomString(),
                useIntellisense: true,
                showConsoleMessages: true
            },
            web: {
                device: 'web',
                serverAddress: '//{0}:{1}'.format(localhost, serverPort),
                storagePrefix: '',
                useIntellisense: true,
                showConsoleMessages: true
            },
            phone: {
                device: 'phone',
                serverAddress: '//{0}:{1}'.format(serverAddress, serverPort),
                storagePrefix: '',
                useIntellisense: false,
                showConsoleMessages: true
            }
            /* not used
            tablet: {
                device: 'tablet',
                serverAddress: '//{0}:{1}'.format(serverAddress, serverPort),
                storagePrefix: ''
            }
            */
        };

    // change the configuration here based on the tageted platform
    configs.current = configs.web;    

    // private functions
    
    // see if a config was passed on the Url line
    function getUrlConfig() {
        var urlParams = Util.getParameters();
        var config = null;
        if (urlParams.config !== undefined) {
            config = urlParams.config;
        }
        if (config) return configs[config];
        return null;
    }
    
    // if the config was specified on the url use it, else use current set above
    var currentConfig = getUrlConfig() || configs.current;

    // avoid depending on Logger, because it depends on Config!
    function logMessage(message) {
        if (!currentConfig.isTest) return;
        console.log(message);
    }

    logMessage('Config: currentConfig=' + Util.inspectObject(configs.current));
    
    return currentConfig;
});