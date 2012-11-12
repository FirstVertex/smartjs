var connectionKind = 'group',
    Util = require('../util'),
    Nowjs = require('now'),
    LiveTopicList = require('../liveTopicList'),
    eventHandlers = [],
    eventHandlerCount = 0,
    serverClientId = -1;

function processConnection(request) {
    console.log('processConnection(group): ' + Util.inspectObject(request));

    if (!request ||
        !request.xStruct ||
        !request.xStruct.kind ||
        request.xStruct.kind != connectionKind ||
        !request.xStruct.data ||
        !request.xStruct.event) { return false; }

    var group = request.xStruct.data.groupName ? Nowjs.getGroup(request.xStruct.data.groupName) : null;

    var handled = false;
    for (var i = 0; i < eventHandlerCount; i++) {
        if (eventHandlers[i].eventName === request.xStruct.event) {
            eventHandlers[i].handleEvent(request, group);
            handled = true;
            break;
        }
    }

    if (!handled) {
        // default handler
        console.log('handle generic group event=' + request.xStruct.event);
        group.now.eventServerToClient(request.xStruct.event, request.xStruct.data, request.xStruct.sender);
    }

    return true;
}

function addEventHandler(eventName, callback) {
    eventHandlers.push({
        eventName: eventName,
        handleEvent: callback
    });
    eventHandlerCount = eventHandlers.length;
}

function notifyGroupRemoval(group, clientId) {
    var newCountDto = LiveTopicList.removeClient(group.groupName, clientId);
    if (newCountDto) {
        var removeDto = {
            topicName: group.groupName
        };
        group.now.eventServerToClient('group.removeMember', removeDto, clientId);
        notifyTopicCountChanged(newCountDto);
    }
}

function notifyTopicCountChanged(topicCountDto) {
    var watchGroup = Nowjs.getGroup(LiveTopicList.watchGroupName);
    console.log('notify of topic count change: ' + Util.inspectObject(topicCountDto));
    watchGroup.now.eventServerToClient('topic.count', topicCountDto, serverClientId);
}

function onJoinGroup(request, group) {
    if (request.xStruct.data.exitGroupName) {
        Nowjs.getGroup(request.xStruct.data.exitGroupName).removeUser(request.xStruct.sender);
    }
    group.addUser(request.xStruct.sender);

    var newCountDto = LiveTopicList.addClient(group.groupName, request.xStruct.sender, request.xStruct.data.memberName);
    if (newCountDto) {
        group.exclude([request.xStruct.sender]).now.eventServerToClient('group.addMember', { memberName: request.xStruct.data.memberName }, request.xStruct.sender);
        notifyTopicCountChanged(newCountDto);
    }
}
addEventHandler('group.addMember', onJoinGroup);

function onLeaveGroup(request, group) {
    group.removeUser(request.xStruct.sender);
    // group notification of leaving is handled automatically, because it can happen abruptly by a disconnect
}
addEventHandler('group.removeMember', onLeaveGroup);

function onTopicList(request) {
    var topicListDto = LiveTopicList.getTopicList();
    Util.processResponse(request, null, topicListDto);
}
addEventHandler('topic.list', onTopicList);

function onTopicMembers(request) {
    var topicMemberListDto = LiveTopicList.getTopicMemberList(request.xStruct.data.topicName);
    Util.processResponse(request, null, topicMemberListDto);
}
addEventHandler('topic.members', onTopicMembers);

// interface for dataHandler to call when a topic is added, need to update cache
function newTopicWasSaved(topicName) {
    var newCountDto = LiveTopicList.addTopicToCache(topicName);
    if (newCountDto) {
        notifyTopicCountChanged(newCountDto);
    }
}

// interface to call to send a message to all
function broadcastToAll(message) {
    var everyone = Nowjs.getGroup('everyone');
    var dto = {
        words: message
    };
    console.log('broadcast message to all: ' + Util.inspectObject(dto));
    if (everyone && everyone.now && everyone.now.eventServerToClient) {
        everyone.now.eventServerToClient('chat.message', dto, serverClientId);
    }
}

// each time a new nowjs group is created, attach to it's leave handler
Nowjs.on('newgroup', function (group) {
    console.log('Nowjs group created: ' + group.groupName);
    group.on('leave', function () {
        notifyGroupRemoval(group, this.user.clientId);
    });
});

Nowjs.on('disconnect', function () {
    var currentClientId = this.user.clientId;

    console.log('disconnect notice, this.getGroups=' + this.getGroups);
    console.log('this.now=' + Util.inspectObject(this.now));
    console.log('this.user=' + Util.inspectObject(this.user));
    console.log('this.groups=' + Util.inspectObject(this.groups));

    this.getGroups(function (groups) {
        console.log('discod user belongs to groups:' + Util.inspectObject(groups));
        for (var i = 0; i < groups.length; i++) {
            notifyGroupRemoval(groups[i], currentClientId);
        }
    });
});

// feature to broadcast the time periodically
function nextTick() {
    return 60000 - (new Date() % 60000);
}
function onTimer() {
    var echo = 'The date/time is now: ' + new Date().toString();
    broadcastToAll(echo);
    setTimeout(onTimer, nextTick());
}
setTimeout(onTimer, nextTick());

module.exports = {
    processConnection: processConnection,
    // interface for dataHandler to call when a topic is added, need to update cache
    newTopicWasSaved: newTopicWasSaved
};

// the reply mechanism uses now to call a function directly on the client, this is a copy of the client method signature
// now.eventServerToClient = function (eventName, data, senderClientId) {}
