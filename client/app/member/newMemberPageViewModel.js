// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the newMemberPageViewModel module binds to the member signup page of the SPA
// this module returns a static object

define([
    'data/dataContext',
    'jquery',
    'knockout',
    'data/schema'
], function (DataContext, Jquery, Ko, Schema) {

    
    var // bind to UI textbox
        memberName = Ko.observable(''),
        // validation
        checkingMemberName = Ko.observable(false),
        goodMemberName = Ko.observable(false),
        errorMessages = Ko.observableArray(),

        invalidMemberName = Ko.computed({
            read: function () {
                return errorMessages().length > 0;
            }
        });

    // functionality
    function save() {
        errorMessages.removeAll();
        checkingMemberName(true);
        // hooray! this line was added as the result of unit testing!
        goodMemberName(false);

        // courtesy to trim it before submitting to validation layer
        var newMemberName = Jquery.trim(memberName());
        memberName(newMemberName);

        var dto = Schema.member.create(newMemberName);

        if (!Schema.member.validate(dto, errorMessages)) {
            checkingMemberName(false);
        }
        else {
            DataContext.saveMember(dto, function (saveResult) {
                checkingMemberName(false);
                if (saveResult) {
                    goodMemberName(true);
                } else {
                    errorMessages.push('That Member name is taken');
                }
            });
        }
    }

    return {
        memberName: memberName,
        checkingMemberName: checkingMemberName,
        goodMemberName: goodMemberName,
        errorMessages: errorMessages,
        invalidMemberName: invalidMemberName,
        save: save
    };
});