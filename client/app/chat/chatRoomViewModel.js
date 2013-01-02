// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the chatRoomViewModel module binds to the chatRoom page
// this module returns a static object

define([
    'chat/chatMemberViewModel',
    'server/server',
    'server/groupContext',
    'knockout',
    'util/pubsub',
    'util/logger',
    'jquery',
    'underscore'
], function (ChatMemberViewModel, Server, GroupContext, Ko, Pubsub, Logger, Jquery, Underscore) {
    Logger.log('chatRoomViewModel line 1');
    
        // identifies me
    var localClientId = Server.getClientId(),
        // public variables
        roomName = Ko.observable(''),
        // connected memberList
        members = Ko.observableArray(),
        // messages of the chat
        chatMessages = Ko.observableArray(),
        // loading the member list
        loadingMembers = Ko.observable(true),

        _currentChatInput = Ko.observable(''),
        currentChatInput = Ko.computed({
            read: function () {
                return _currentChatInput();
            },
            write: function (value) {
                var oldValue = _currentChatInput();
                value = value || '';
                if (value === oldValue) return;
                _currentChatInput(value);
                var isTyping = value.length ? true : false;
                // only the localMember can touch the chatInput
                localMemberViewModel().isTyping(isTyping);
            }
        });
    members.extend({ throttle: 50 });

    function sayChat () {
        var words = Jquery.trim(currentChatInput());
        if (!words.length) return;
        var chatDto = {
            memberName: localMemberViewModel().memberName,
            words: currentChatInput()
        };
        GroupContext.publish('chat.message', chatDto);
        // set the private variable to prevent a redundant packet
        localMemberViewModel().setTypingWithoutPublishing(false);
        currentChatInput('');
    }

    // when joining a room we get called
    function init(newRoomName) {
        roomName(newRoomName);
        chatMessages.removeAll();

        loadingMembers(true);
        GroupContext.initializeTopic(newRoomName, function () {
            loadingMembers(false);
        });
    }

    // private methods

    function findMemberViewModel(clientId) {
        var userList = members();
        return Underscore.find(userList, function (user) {
            return user.clientId === clientId;
        });
    }

    function localMemberViewModel() {
        return findMemberViewModel(localClientId);
    }

    // event handlers
    function onChatroomJoin(memberDto, isRemoteEvent, senderId) {
        Logger.log('memberDto', memberDto, true);
        // if not it is in the 3rd param to this event
        members.unshift(new ChatMemberViewModel(memberDto.memberName, senderId, !isRemoteEvent));
    }

    function onChatroomLeave(leaveDto, isRemoteEvent, exitClientId) {
        if (leaveDto.topicName !== roomName()) return;
        var cutIndex = -1,
            userList = members();

        Underscore.find(userList, function (user, index) {
            var found = user.clientId === exitClientId;
            if (found) { cutIndex = index; }
            return found;
        });

        if (cutIndex != -1) {
            members.splice(cutIndex, 1);
        }
    }

    function onChatroomData(chatData, isRemoteEvent, senderClientId) {
        var sender;
        if (senderClientId !== -1) {
            sender = findMemberViewModel(senderClientId);
        }
        chatMessages.push({
            memberName: chatData.memberName,
            words: chatData.words
        });
        if (sender) {
            sender.setTypingWithoutPublishing(false);
        }
    }

    function onMemberTyping(typingDto, isRemoteEvent, senderClientId) {
        if (isRemoteEvent) {
            var sender = findMemberViewModel(senderClientId);
            if (sender) {
                sender.isTyping(typingDto.isTyping);
            }
        }
    }

    function onTopicInitialize(topicDto) {
        if (topicDto.topicName !== roomName()) return;

        var memberVms = Underscore.map(topicDto.memberList, function (dto) {
            return new ChatMemberViewModel(dto.memberName, dto.clientId, dto.clientId === localClientId);
        }), i;

        Logger.log('topicDto', topicDto, true);
        Logger.log('memberVms', memberVms);

        members(memberVms);

        if (!topicDto.messageCache || ! topicDto.messageCache.length) return;

        // get the chatMessages out of the array of xStruct in messageCache
        for (i = 0; i < topicDto.messageCache.length; i++) {
            onChatroomData(topicDto.messageCache[i].data, true, topicDto.messageCache[i].sender);
        }
    }

    // subscriptions
    Pubsub.subscribe('topic.initialize', onTopicInitialize);
    Pubsub.subscribe('group.addMember', onChatroomJoin);
    Pubsub.subscribe('group.removeMember', onChatroomLeave);
    Pubsub.subscribe('chat.message', onChatroomData);
    Pubsub.subscribe('chat.typing', onMemberTyping);

    return {
        roomName: roomName,
        members: members,
        chatMessages: chatMessages,
        loadingMembers: loadingMembers,
        currentChatInput: currentChatInput,
        sayChat: sayChat,
        init: init
    };
});

// todo: research
// https://github.com/jameskeane/knockout-now/blob/master/ko.now.js