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
        callbackQueue = new CallbackQueue(),
        // define an 'enum' of 2 kinds of operations supplied by server
        eventType = {
            data: 'data',
            group: 'group'
        };

    // the clientId might change, so provide a getter for this volatile data
    function getClientId() {
        return clientId;
    }

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

    function sendEventToServer(xStruct, callback) {
        // have to do this assignment here, when we know the server is ready
        xStruct.sender = clientId;
        Logger.log('xStruct', xStruct, true);

        if (callback) {
            now.eventClientToServer(xStruct, function (rStruct) {
                /*
                rStruct schema for reference
                var rStruct = {
                    event: xStruct.event,
                    kind: xStruct.kind,
                    sender: xStruct.sender,
                    error: error,
                    data: result
                };
                */

                var succeeded = true;
                if (rStruct.error) succeeded = false;

                // provides success or failure notice back to caller
                callback(succeeded, rStruct.error);

                if (succeeded) {
                    // the server does not send the event back to us, which would be wasteful
                    // so in the callback, we fake it by sending the event through the same place it would have gone if it came from the server
                    // end result is all clients get the event around the same time
                    // set a flag so things can detect this was a locally initiated event, if they want
                    receiveEventFromServer(rStruct.event, rStruct.data, clientId);
                }
            });
        } else {
            now.eventClientToServer(xStruct);
        }
    }

    function receiveEventFromServer(eventName, data, senderClientId) {
        var isRemoteEvent = senderClientId != clientId;
        Pubsub.publish(eventName, data, isRemoteEvent, senderClientId);
    }

    // wire up receiveEventFromServer to now namespace so it can be called from the server
    now.eventServerToClient = receiveEventFromServer;

    function initiateEvent(eventName, eventKind, dataStructure, callback) {
        dataStructure = dataStructure || {};

        var xStruct = {
            event: eventName,
            kind: eventKind,
            data: dataStructure
        };

        if (!isReady) {

            callbackQueue.addToQueue(function () {
                sendEventToServer(xStruct, callback);
            });

        } else {
            sendEventToServer(xStruct, callback);
        }
    }

    // DATA API

    function saveMember(memberData, callback) {
        initiateEvent('member.new', eventType.data, memberData, callback);
    }

    function newTopic(topicData, callback) {
        initiateEvent('topic.new', eventType.data, topicData, callback);
    }

    function listTopics(callback) {
        initiateEvent('topic.list', eventType.data, null, callback);
    }

    function getTopicMembers(topicName, callback) {
        var dto = {
            topicName: topicName
        };
        initiateEvent('topic.members', eventType.data, dto, callback);
    }

    // GROUP API

    // prevent redundant group join
    var currentGroupName = null;
    function joinGroup(memberName, groupName) {
        if ((currentGroupName && currentGroupName === groupName) || !memberName) {
            return;
        }

        var dto = {
            memberName: memberName,
            groupName: groupName,
            exitGroupName: currentGroupName
        };
        
        initiateEvent('group.addMember', eventType.group, dto);
        // the server will automatically publish group.addMember
        currentGroupName = groupName;
    }

    function leaveGroup() {
        initiateEvent('group.removeMember', eventType.group, null);
        currentGroupName = null;
    }

    // generic handler for all other group traffic, let caller specify event that is published to all clients in group
    // the event will be received locally as well
    function publishGroupEvent(eventName, eventData) {
        if (currentGroupName) {
            // stuff the groupName so receivers can verify this traffic was intended for their group
            eventData.groupName = currentGroupName;
            initiateEvent(eventName, eventType.group, eventData);
        }
    }

    return {
        // server level service
        getClientId: getClientId,

        // data ops
        saveMember: saveMember,
        newTopic: newTopic,
        listTopics: listTopics,
        getTopicMembers: getTopicMembers,

        // group ops
        joinGroup: joinGroup,
        leaveGroup: leaveGroup,
        publishGroupEvent: publishGroupEvent
    };
});