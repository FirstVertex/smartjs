var configStub = {
    serverAddress: '123:456'
};

define("config", [], configStub);

var nowStub = {
    // control latency and availability of now server
    latency: 30,
    notReady: false,
    ready: function (callback) {
        // make the server never return, see what happens
        if (nowStub.notReady) return;
        setTimeout(callback, nowStub.latency);
    },
    core: {
        clientId: 'test77clientId'
    }
};

function nowInitStub(sa) {
    it(
        "Should init now with the config's server address",
        function () {
            expect(sa).toBe(configStub.serverAddress);
        }
    );
    // mock now
    return nowStub;
};

define('now', [], nowInitStub);

// tracks an instance of cbq that's created
var callbackQInstance = null;
function callbackQueueStub() {
    var self = callbackQInstance = this;
    self.reset = function() {
        self.playbackCalled = false;
        self.addToQueueCalled = false;
    }

    self.playbackCalled = false;
    self.playback = function () {
        self.playbackCalled = true;
    }

    self.que = [];

    self.addToQueueCalled = false;
    self.addToQueue = function (callback) {
        self.addToQueueCalled = true;
        self.que.push(callback);
    }
    return self;
}

define('util/callbackQueue', [], callbackQueueStub);

var pubsubStub = {
    mockEventKey: 'testEvent77',
    // flags to tell if methods were called
    reset: function() {
        publishEventQueue = [];
        subscribeEventQueue = [];
        unsubscribeEventQueue = [];
    },
    publishEventQueue: [],
    publishCalled: function () {
        return publishEventQueue.length > 0;
    },
    publish: function (eventName, data) {
        publishEventQueue.push(eventName);
    },
    subscribeEventQueue: [],
    subscribeCalled: function () {
        return subscribeEventQueue.length > 0;
    },
    subscribe: function (eventName, callback) {
        subscribeEventQueue.push(eventName);
        return pubsubStub.mockEventKey + eventName;
    },
    unsubscribeEventQueue: [],
    unsubscribeCalled: function () {
        return unsubscribeEventQueue.length > 0;
    },
    unsubscribe: function (eventKey) {
        unsubscribeEventQueue.push(eventKey);
        it(
            "Should have the mockEventKey as the unsub Key",
            function () {
                expect(eventKey).toBe(pubsubStub.mockEventKey + eventKey);
            }
        );
    }
};

define('util/pubsub', [], pubsubStub);

var loggerStub = {
    calledLogCount: 0,
    reset: function () {
        calledLogCount = 0;
    },
    log: function() {
        loggerStub.calledLogCount++;
    }
};

define('util/logger', [], loggerStub);

define(
    [
        "model"
    ],
    function (Model) {

        // Describe the test suite for this module.
        describe(
            "The Server module",
            function () {

                beforeEach(function () {
                    callbackQInstance = null;
                    pubsubStub.reset();
                    loggerStub.reset();
                });

                it(
                    "Should have the correct clientId",
                    function () {
                        expect(Model.getClientId()).toBe(nowStub.core.clientId);
                    }
                );
            }
        );
    }
);