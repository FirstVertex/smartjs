// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the fullHeight module keeps the content area of a jQuery Mobile page surface the full height of the viewport
// it is based on a discussion found here http://forum.jquery.com/topic/how-to-solve-the-100-height-problem
// this module has no public Api, it just listens

define([
    'jquery',
    'util/pubsub',
    'util/logger'
], function (Jquery, Pubsub, Logger) {
        
    function resetHeight() {
        var headerSelector = 'div.ui-page-active div[data-role="header"]',
            contentSelector = 'div.ui-page-active div[data-role="content"]',
            footerSelector = 'div.ui-page-active div[data-role="footer"]',
            headerHeight = Jquery(headerSelector).outerHeight() || 0,
            content = Jquery(contentSelector),
            contentHeight = content.outerHeight() || 0,
            footerHeight = Jquery(footerSelector).outerHeight() || 0,
            chromeHeight = headerHeight + footerHeight,
            winHeight = Jquery(window).height(),
            fullHeight = winHeight - chromeHeight + 'px';

        if (content.css('height') != fullHeight) {
            Logger.log('fixed height of content', fullHeight, true);
            content.css({ 'min-height': fullHeight, 'max-height': fullHeight, 'height': fullHeight });
        }
    }

    Jquery(window).bind('resize orientationchange', resetHeight);
    Jquery(document).bind('pagechange', resetHeight);

    // app can publish this to force resize
    Pubsub.subscribe('window.resetHeight', resetHeight);
});