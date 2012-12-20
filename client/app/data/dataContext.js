// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the dataContext module provides an abstraction around persistence needs
// this module returns a static object

define([
    'server/server'
], function (Server) {
    var eventKind = 'data';

    function saveMember(memberData, callback) {
        Server.initiateEvent('member.new', eventKind, memberData, callback);
    }

    function newTopic(topicData, callback) {
        Server.initiateEvent('topic.new', eventKind, topicData, callback);
    }

    return {
        saveMember: saveMember,
        newTopic: newTopic
    };
});