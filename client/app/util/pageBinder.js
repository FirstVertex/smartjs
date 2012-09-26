// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the pageBinder module provides an abstraction around jQuery Mobile pages
// this module returns a static object

define([
    'jquery'
], function (Jquery) {
    var pages = {
        newMember: Jquery('#newMember'),
        topicList: Jquery('#topics'),
        chatPage: Jquery('#chat')
    };

    function getPageSelector(page) {
        return '#' + page.attr('id');
    }

    pages.getPageSelector = getPageSelector;

    return pages;
});