// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the util module is where things go that can't find a home anywhere else
// this module returns a static object

define([
    'underscore'
], function (Und) {
    // set up global variables and functions

    // makes a string behave like sprintf, about as useful a func as you'll find
    String.prototype.format = function () {
        var c = arguments;
        return this.replace(/\{(\d+)\}/g,
            function (h, g) {
                return "undefined" !== typeof c[g] ? c[g] : h;
            });
    };

    function inspectObject(obj) {
        return JSON.stringify(obj);
        //return Ko.toJSON(obj);
    }

    function randomString(len) {
        if (!len) len = 10;
        var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            alar = alphabet.split(''),
            randy;
        alar = Und.shuffle(alar);
        randy = alar.join('');
        return randy.substring(0, len);
    }

    // gets parameters from Url
    function getParameters() {
        var searchString = window.location.search.substring(1),
            params = searchString.split("&"),
            hash = {},
            i = 0,
            val;

        for (i = 0; i < params.length; i++) {
            val = params[i].split("=");
            hash[unescape(val[0])] = unescape(val[1]);
        }
        return hash;
    }

    return {
        inspectObject: inspectObject,
        randomString: randomString,
        getParameters: getParameters
    };
});

