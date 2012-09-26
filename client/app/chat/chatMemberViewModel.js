// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the chatMemberViewModel module binds to the UI as an item in a listView
// this module returns a factory function

define([
    'server',
    'knockout'
], function (Server, Ko) {

    function chatMemberViewModel(memberName, clientId, isLocalMember) {
        var self = this;

        // even if not an observable it can still be bound
        // we don't need observable because there is no way to change your name on the fly
        self.memberName = memberName;
        self.clientId = clientId;
        self.isLocalMember = isLocalMember;

        var _isTyping = Ko.observable(false);
        self.isTyping = Ko.computed({
            read: function () {
                return _isTyping();
            },
            write: function (value) {
                var oldValue = _isTyping();
                if (value === oldValue) return;
                _isTyping(value);

                if (self.isLocalMember) {
                    var dto = {
                        isTyping: value
                    };
                    Server.publishGroupEvent('chat.typing', dto);
                }
            }
        });

        // todo: is this needed? test it.  the screen for localmember and oldvalue/newvalue might be sufficient
        self.setTypingWithoutPublishing = function (value) {
            _isTyping(value);
        }
    };

    return chatMemberViewModel;
});