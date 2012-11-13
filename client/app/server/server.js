// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the server module provides an abstraction around connecting to a remote server for persistence and communication services
// this module returns a static object

define([
    'now',
    'util/callbackQueue',
    'config',
    'util/pubsub',
    'util/logger'],
function (NowInit, CallbackQueue, Config, Pubsub, Logger) {
    var
        isReady = false,
        clientId = null,
        callbackQueue = new CallbackQueue();

    Logger.log('server module: serverAddress', Config.serverAddress);

    function whenServerReady() {
        Logger.log('communication with nowJs server initialized', null, true);
        clientId = now.core.clientId;
        Logger.log('clientId', clientId);
        isReady = true;
        callbackQueue.playback();
    }

    var now = NowInit(Config.serverAddress, {});
    now.ready(whenServerReady);

    function sendEventToServer(txStruct, callback) {
        // have to do this assignment here, when we know the server is ready
        txStruct.sender = clientId;
        Logger.log('txStruct', txStruct, true);

        if (callback) {
            now.eventClientToServer(txStruct, function (rxStruct) {
                /*
                rxStruct schema for reference
                var rxStruct = {
                    event: txStruct.event,
                    kind: txStruct.kind,
                    sender: txStruct.sender,
                    error: error,
                    data: result
                };
                */

                var succeeded = true;
                if (rxStruct.error) succeeded = false;

                // provides success or failure notice back to caller
                callback(succeeded, rxStruct.error);

                if (succeeded) {
                    // the server does not send the event back to us, which would be wasteful
                    // so in the callback, we fake it by sending the event through the same place it would have gone if it came from the server
                    // end result is all clients get the event around the same time
                    receiveEventFromServer(rxStruct.event, rxStruct.data, clientId);
                }
            });
        } else {
            now.eventClientToServer(txStruct);
        }
    }

    function receiveEventFromServer(eventName, data, senderClientId) {
        // set isRemoteEvent flag so things can detect this was a locally initiated event, if they want
        var isRemoteEvent = senderClientId != clientId;
        Pubsub.publish(eventName, data, isRemoteEvent, senderClientId);
    }

    // wire up receiveEventFromServer to now namespace so it can be called from the server
    now.eventServerToClient = receiveEventFromServer;

    function initiateEvent(eventName, eventKind, dataStructure, callback) {
        dataStructure = dataStructure || {};

        var txStruct = {
            event: eventName,
            kind: eventKind,
            data: dataStructure
        };

        if (!isReady) {

            callbackQueue.addToQueue(function () {
                sendEventToServer(txStruct, callback);
            });

        } else {
            sendEventToServer(txStruct, callback);
        }
    }

    // the clientId might change, so provide a getter for this volatile data
    function getClientId() {
        return clientId;
    }

    return {
        getClientId: getClientId,
        initiateEvent: initiateEvent
    };
});