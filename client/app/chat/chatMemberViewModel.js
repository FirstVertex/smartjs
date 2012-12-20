// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the chatMemberViewModel module binds to the UI as an item in a listView
// this module returns a factory function

define([
    'server/groupContext',
    'knockout'
], function (GroupContext, Ko) {

    function chatMemberViewModel(memberName, clientId, isLocalMember) {
        var self = this;

        // even if not an observable it can still be bound
        // we don't need observable because there is no way to change your name on the fly
        self.memberName = memberName;
        self.clientId = clientId;
        self.isLocalMember = isLocalMember;

        self._isTyping = Ko.observable(false);
        self.isTyping = Ko.computed({
            read: function () {
                return self._isTyping();
            },
            write: function (value) {
                var oldValue = self._isTyping();
                if (value === oldValue) return;
                self._isTyping(value);

                if (self.isLocalMember) {
                    var dto = {
                        isTyping: value
                    };
                    GroupContext.publish('chat.typing', dto);
                }
            }
        });

        // this is very useful, so don't delete it.  it's just a way to set without causing network traffic
        self.setTypingWithoutPublishing = function (value) {
            _isTyping(value);
        }
    };

    return chatMemberViewModel;
});