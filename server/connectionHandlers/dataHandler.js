var connectionKind = 'data',
    Util = require('../util'),
    MongoConnection = require('../mongoDataConnector'),
    GroupHandler = require('./groupHandler'),
    eventHandlers = [],
    eventHandlerCount = 0;

function processConnection(request) {
    if (!request ||
        !request.xStruct ||
        !request.xStruct.kind ||
        request.xStruct.kind != connectionKind ||
        !request.xStruct.data ||
        !request.xStruct.event) { return false; }

    var handled = false;
    for (var i = 0; i < eventHandlerCount; i++) {
        if (eventHandlers[i].eventName === request.xStruct.event) {
            eventHandlers[i].handleEvent(request);
            handled = true;
            break;
        }
    }

    if (!handled) {
        Util.processResponse(request, 'unhandled data event=' + request.xStruct.event, null);
    }
    return handled;
}

function addEventHandler(eventName, callback) {
    eventHandlers.push({
        eventName: eventName,
        handleEvent: callback
    });
    eventHandlerCount = eventHandlers.length;
}

function onNewMember(request) {
    MongoConnection.insert('members', request.xStruct.data, request, function (error, result) {
        Util.processResponse(request, error, result && result[0]);
    });
}
addEventHandler('member.new', onNewMember);

function onNewTopic(request) {
    MongoConnection.insert('topics', request.xStruct.data, request, function (error, result) {
        if (!Util.isError(error)) {
            result = result[0];
            GroupHandler.newTopicWasSaved(result.topicName);
        }
        Util.processResponse(request, error, result);
    });
}
addEventHandler('topic.new', onNewTopic);

module.exports = {
    processConnection: processConnection
};