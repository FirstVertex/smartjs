// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the router module provides an abstraction around moving the user from one page to the next
// this module has no public Api, it just listens

define([
    'util/pageBinder',
    'util/pubsub',
    'require',
    'jquery',
    'jqueryMobile',
    'knockout',
    'config'
], function (Pages, Pubsub, Require, Jquery, Mobile, Ko, Config) {
    
    function gotoPage(page) {
        Mobile.changePage(page);
    }

    // lazily loaded and bound New Member Page
    var _boundNewMemberPage = null;
    function boundNewMemberPage(callback) {
        if (_boundNewMemberPage) {
            callback(_boundNewMemberPage);
        } else {
            Require(['member/newMemberPageViewModel'], function (Model) {
                Ko.applyBindings(Model, Pages.newMember.get(0));
                _boundNewMemberPage = Pages.newMember;
                callback(_boundNewMemberPage);
            });
        }
    }

    function gotoNewMember() {
        boundNewMemberPage(gotoPage);
    }

    // lazily loaded and bound Topic List Page
    var _boundTopicListPage = null;
    function boundTopicListPage(callback) {
        if (_boundTopicListPage) {
            callback(_boundTopicListPage);
        } else {
            Require(['topic/topicListPageViewModel'], function (Model) {
                Ko.applyBindings(Model, Pages.topicList.get(0));
                _boundTopicListPage = Pages.topicList;
                callback(_boundTopicListPage);
            });
        }
    }

    function gotoTopicList() {
        boundTopicListPage(gotoPage);
    }

    // lazily loaded and bound Chat Room Page
    var _boundChatRoomPage = null;
    var chatRoom = null;
    function boundChatRoomPage(roomName, callback) {
        if (_boundChatRoomPage) {
            chatRoom.init(roomName);
            callback(_boundChatRoomPage);
        } else {
            Require(['chat/chatRoomViewModel'], function (Model) {
                chatRoom = Model;
                chatRoom.init(roomName);
                Ko.applyBindings(Model, Pages.chatPage.get(0));
                _boundChatRoomPage = Pages.chatPage;
                callback(_boundChatRoomPage);
            });
        }
    }

    function gotoChatRoom(dto) {
        boundChatRoomPage(dto.topicName, gotoPage);
    }

    // provide 1/4 second throttle for when both hashchange and pageshow are received
    var topicViewTimer = false;
    function publishTopicView() {
        if (!topicViewTimer) {
            topicViewTimer = true;
            setTimeout(function () {
                topicViewTimer = false;
            }, 500);
            Pubsub.publish('topic.view');
        }
    }

    Pages.topicList.bind('pageinit', function (event, ui) {
        if (!ui || !ui.prevPage || !ui.prevPage.is('[data-role="dialog"]')) {
            publishTopicView();
        }
    });

    // these are the 2 possible events fired by bootstrap.  since it is the first transition, give it a couple ms to warm up
    Pubsub.subscribe('member.new', gotoTopicList);
    Pubsub.subscribe('member.load', gotoTopicList);

    Pubsub.subscribe('member.none', gotoNewMember);
    Pubsub.subscribe('topic.select', gotoChatRoom);

    // todo: 'error.redirect' subscriber, goto errorPage

    // no public Api is returned
});