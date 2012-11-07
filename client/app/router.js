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
], function (Pages, Pubsub, require, Jquery, Mobile, Ko, Config) {
    
    function gotoPage(page) {
        Mobile.changePage(page.page);
    }

    var boundPages = [];

    function boundPage(page, modulePath, callback) {
        var pageKey = page.attr('id');
        if (boundPages[pageKey]) {
            callback(boundPages[pageKey]);
        } else {
            require([modulePath], function (Model) {
                Ko.applyBindings(Model, page.get(0));
                boundPages[pageKey] = {
                    page: page,
                    model: Model
                };
                callback(boundPages[pageKey]);
            });
        }
    }

    function gotoNewMember() {
        boundPage(Pages.newMember, 'member/newMemberPageViewModel', gotoPage);
    }

    function gotoTopicList() {
        boundPage(Pages.topicList, 'topic/topicListPageViewModel', gotoPage);
    }

    function gotoChatRoom(dto) {
        boundPage(Pages.chatPage, 'chat/chatRoomViewModel', function (boundPage) {
            boundPage.model.init(dto.topicName);
            gotoPage(boundPage);
        });
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

    function onHashChanged(event) {
        var oldHash = '#' + event.oldURL.split('#')[1];
        var newHash = '#' + event.newURL.split('#')[1];

        if (newHash === Pages.getPageSelector(Pages.topicList)) {
            publishTopicView();
        }
    }
    window.addEventListener('hashchange', onHashChanged, false);

    // these are the 2 possible events fired by bootstrap.  since it is the first transition, give it a couple ms to warm up
    Pubsub.subscribe('member.new', gotoTopicList);
    Pubsub.subscribe('member.load', gotoTopicList);

    Pubsub.subscribe('member.none', gotoNewMember);
    Pubsub.subscribe('topic.select', gotoChatRoom);

    // todo: 'error.redirect' subscriber, goto errorPage

    // no public Api is returned
});