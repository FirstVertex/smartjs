// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the logger module provides an abstraction around logging to the console
// this module returns a static object

define([
    'config',
    'util/util'
], function (Config, Util) {
    var showMessages = Config.showConsoleMessages;

    function log (message, obj, showCurrentFunction) {
        if (!showMessages || !console) return;

        var formattedMessage = showCurrentFunction ?
            "> function {0}()".format(arguments.callee.caller.name) :
            "> {0}".format(message);

        if (showCurrentFunction && message) {
            formattedMessage = "{0} > {1}".format(formattedMessage, message);
        }
        if (obj) {
            formattedMessage = "{0} = {1}".format(formattedMessage, Util.inspectObject(obj));
        }

        console.log(formattedMessage);
    }

    // have to reimplement it in order to preserve arguments.callee
    function logCurrentFunction() {
        if (!showMessages) return;
        console.log("> function {0}()".format(arguments.callee.caller.name));
    }

    return {
        log: log,
        logCurrentFunction: logCurrentFunction
    };
});
