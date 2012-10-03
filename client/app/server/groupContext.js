// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the groupContext module provides an abstraction around group-based communication needs
// this module returns a static object

define([
    'server/server'],
function (Server) {

    // prevent redundant group join
    var currentGroupName = null,
        eventKind = 'group';

    function joinGroup(memberName, groupName) {
        if ((currentGroupName && currentGroupName === groupName) || !memberName) {
            return;
        }

        var dto = {
            memberName: memberName,
            groupName: groupName,
            exitGroupName: currentGroupName
        };

        Server.initiateEvent('group.addMember', eventKind, dto);
        // the server will automatically publish group.addMember
        currentGroupName = groupName;
    }

    function leaveGroup() {
        Server.initiateEvent('group.removeMember', eventKind, null);
        currentGroupName = null;
    }

    // generic handler for all other group traffic, let caller specify event that is published to all clients in group
    // the event will be received locally as well
    function publish(eventName, eventData) {
        if (currentGroupName) {
            // stuff the groupName so receivers can verify this traffic was intended for their group
            eventData.groupName = currentGroupName;
            Server.initiateEvent(eventName, eventKind, eventData);
        }
    }

    function getCurrentGroupName() {
        return currentGroupName;
    }

    function listTopics(callback) {
        Server.initiateEvent('topic.list', eventKind, null, callback);
    }

    function getTopicMembers(topicName, callback) {
        var dto = {
            topicName: topicName
        };
        Server.initiateEvent('topic.members', eventKind, dto, callback);
    }

    return {
        joinGroup: joinGroup,
        leaveGroup: leaveGroup,
        publish: publish,
        getCurrentGroupName: getCurrentGroupName,
        listTopics: listTopics,
        getTopicMembers: getTopicMembers
    };
});