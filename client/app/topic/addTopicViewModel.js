// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the addTopicViewModel module binds to the popup form for adding a new topic
// this module returns a static object

define([
    'data/dataContext',
    'jquery',
    'knockout',
    'util/pubsub',
    'data/schema'
], function (DataContext, Jquery, Ko, Pubsub, Schema) {
    
    var
        // binded to ui
        newTopicName = Ko.observable(''),
        isVisible = Ko.observable(false),

        // feedback
        checkingTopicName = Ko.observable(false),
        errorMessages = Ko.observableArray(),

        invalidTopicName = Ko.computed({
            read: function () {
                return errorMessages().length > 0;
            }
        });

    // functionality
    function toggleVisibile() {
        isVisible(!isVisible());
    }

    function addNewTopic() {
        errorMessages.removeAll();
        checkingTopicName(true);

        // courtesy to trim it before submitting to validation layer
        var topicName = Jquery.trim(newTopicName());
        newTopicName(topicName);

        var dto = Schema.topic.create(topicName);

        if (!Schema.topic.validate(dto, errorMessages)) {
            checkingTopicName(false);
        }
        else {
            DataContext.newTopic(dto, function (saveResult) {
                checkingTopicName(false);
                if (saveResult) {
                    isVisible(false);
                    newTopicName('');
                } else {
                    errorMessages.push('That Topic name is taken');
                }
            });
        }
    }

    return {
        newTopicName: newTopicName,
        isVisible: isVisible,
        checkingTopicName: checkingTopicName,
        errorMessages: errorMessages,
        invalidTopicName: invalidTopicName,
        toggleVisibile: toggleVisibile,
        addNewTopic: addNewTopic
    };
});