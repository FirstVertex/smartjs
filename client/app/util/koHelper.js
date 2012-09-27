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

    Ko.bindingHandlers.refreshListview = {
        update: function (element, valueAccessor) {
            Ko.utils.unwrapObservable(valueAccessor()); //just to create a dependency
            if (!element) return;
            Logger.log('Ko.bindingHandlers.refreshListview.update() > element.nodeName', element.nodeName);
            var ul = (element.nodeName === 'UL') ? Jquery(element) : Jquery(Ko.virtualElements.firstChild(element)).closest('ul');
            if (!ul || !ul.length) return;
            setTimeout(function (ul) { ul.listview('refresh'); }, 0, ul);
        }
    };

    Ko.virtualElements.allowedBindings.refreshListview = true;
});