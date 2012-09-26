// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the koHelper module connects Knockout to jQuery Mobile, keeping the listView refreshed when content dynamically changes
// this module has no public Api, it modifies the Knockout object.  it will be triggered by ko html binding with refreshListview: true

define([
    'knockout',
    'jquery',
    'util/logger'
], function (Ko, Jquery, Logger) {

    var visibleCheckTimer = null;

    function fixWhenVisible(ul) {
        Logger.logCurrentFunction();
        if (ul.is(':visible')) {
            if (visibleCheckTimer) {
                clearInterval(visibleCheckTimer);
                visibleCheckTimer = null;
            }
            fixListview(ul);
        } else {
            if (!visibleCheckTimer) {
                visibleCheckTimer = setInterval(function () {
                    fixWhenVisible(ul);
                }, 50);
            }
        }
    }

    function fixListview(ul) {
        try {
            ul.listview('refresh');
            Logger.log('refreshListview.refresh');
        }
        catch (ex) {
            try {
                ul.listview();
                Logger.log('refreshListview.create');
            }
            catch (ex2) {
                Logger.log('refreshListview.nothing');
            }
        }
    }

    Ko.bindingHandlers.refreshListview = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var ul = (element.nodeName === 'UL') ? Jquery(element) : Jquery(element).closest('ul');
            fixWhenVisible(ul);
        }
    };

    Ko.virtualElements.allowedBindings.refreshListview = true;
});