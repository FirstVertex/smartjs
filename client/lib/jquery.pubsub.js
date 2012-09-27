// https://gist.github.com/1321768
// (option 1)
// http://addyosmani.com/blog/jquery-1-7s-callbacks-feature-demystified/
define([
    'jquery'
], function (jQuery) {
	
	var topics = {};

	jQuery.Topic = function (id) {
		var callbacks,
			topic = id && topics[id];
		if (!topic) {
			callbacks = jQuery.Callbacks();
			topic = {
				publish: callbacks.fire,
				subscribe: callbacks.add,
				unsubscribe: callbacks.remove
			};
			if (id) {
				topics[id] = topic;
			}
		}
		return topic;
	};

	return jQuery.Topic;
});