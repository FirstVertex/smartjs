// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the callbackQueue module provides a means to store and run a series of functions
// this module returns a factory function

define(function () {

    function runCallbacks(callbacks) {
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i]();
        }
    }

    function callbackQueue() {
        var self = this;

        self.isReady = false;
        self.readyCalls = [];

        self.addToQueue = function (callback) {
            if (self.isReady) {
                callback();
            } else {
                self.readyCalls.push(callback);
            }
        };

        self.playback = function () {
            self.isReady = true;

            if (self.isReady) {
                var callbacks = self.readyCalls;

                if (callbacks.length) {
                    self.readyCalls = [];
                    runCallbacks(callbacks);
                }
            }
        };

        self.startQueueing = function () {
            self.isReady = false;
        };
    }

    return callbackQueue;
});
