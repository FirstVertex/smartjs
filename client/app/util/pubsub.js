// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the pubsub module provides an abstraction around the jQuery pubsub lib
// the reason for this abstraction is so that SmartJs can log pubs and subs
// i also find the form Pubsub.publish(eventName, data) more intuitive than $.topic(eventName).publish(data)
// this module returns a static object

define([
    'util/logger',
    'pubsubLib'
], function (Logger, Topic) {
    
    function publish(eventName) {
        var event = eventName;
        [].shift.call(arguments);
        Logger.log('event', event, true);
        return Topic(event).publish.apply(this, arguments);
    }

    function subscribe(eventName) {
        var event = eventName;
        [].shift.call(arguments);
        Logger.log('event', event, true);
        return Topic(event).subscribe.apply(this, arguments);
    }

    function unsubscribe(eventName) {
        var event = eventName;
        [].shift.call(arguments);
        Logger.log('event', event, true);
        return Topic(event).unsubscribe.apply(this, arguments);
    }

    return {
        publish: publish,
        subscribe: subscribe,
        unsubscribe: unsubscribe
    };
});
