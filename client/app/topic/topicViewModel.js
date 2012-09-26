// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the topicViewModel module binds to the UI as an item in a listView
// this module returns a factory function

define([
    'knockout'
], function (Ko) {
    function topicViewModel(topicName, memberCount) {
        var self = this;
        self.topicName = Ko.observable(topicName);
        self.memberCount = Ko.observable(memberCount || 0);
    };

    return topicViewModel;
});