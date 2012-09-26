// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the schema module provides an abstraction around creating and validating persistent models
// this module returns a static object

define([
    'data/validation'
], function (Validation) {

    var member = {
            create: function (name) {
                // persisted dto, mongo will add _id and most VM's will add clientId
                return {
                    memberName: name
                };
            },
            minNameLength: 2,
            maxNameLength: 20,
            validate: function (dto, errorMessages) {
                return Validation.hasProperty(dto, 'memberName', errorMessages, 'member') &&
                    Validation.isNonEmpty(dto.memberName, errorMessages, 'Member Name') &&
                    Validation.isCorrectLength(dto.memberName, member.minNameLength, member.maxNameLength, errorMessages, 'Member Name');
            }
        },
        topic = {
            create: function (name) {
                // persisted dto, server will add memberList etc
                return {
                    topicName: name
                };
            },
            minNameLength: 2,
            maxNameLength: 20,
            validate: function (dto, errorMessages) {
                return Validation.hasProperty(dto, 'topicName', errorMessages, 'topic') &&
                    Validation.isNonEmpty(dto.topicName, errorMessages, 'Topic Name') &&
                    Validation.isCorrectLength(dto.topicName, topic.minNameLength, topic.maxNameLength, errorMessages, 'Topic Name');
            }
        };

    return {
        member: member,
        topic: topic
    };
});
