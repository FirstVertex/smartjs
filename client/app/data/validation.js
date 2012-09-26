// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the validation module provides routines to verify the correctness of models
// this module returns a static object

define([
    'jquery'
], function (Jquery) {

    function fail(message, errorMessages, fieldName) {
        errorMessages && errorMessages.push(message.format(fieldName));
        return false;
    }

    function hasProperty(obj, propertyName, errorMessages, objName) {
        if (!obj || !obj[propertyName]) {
            return fail("Invalid {0}", errorMessages, objName);
        }
        return true;
    }

    function isString(str, errorMessages, fieldName) {
        if (!str || typeof str !== "string") {
            return fail("{0} invalid type", errorMessages, fieldName);
        }
        return true;
    }

    function isNonEmpty(str, errorMessages, fieldName) {
        if (!isString(str, errorMessages, fieldName)) {
            return false;
        }
        if (!str.length) {
            return fail("{0} is empty", errorMessages, fieldName);
        }
        var trimt = Jquery.trim(str);
        if (!trimt.length || trimt !== str) {
            return fail("No leading/trailing whitespace in {0}", errorMessages, fieldName);
        }
        return true;
    }

    function isCorrectLength(str, min, max, errorMessages, fieldName) {
        if (!isString(str, errorMessages, fieldName)) {
            return false;
        }
        if (str.length < min) {
            return fail("{0} too short", errorMessages, fieldName);
        }
        if (str.length > max) {
            return fail("{0} too long", errorMessages, fieldName);
        }
        return true;
    }

    return {
        hasProperty: hasProperty,
        isString: isString,
        isNonEmpty: isNonEmpty,
        isCorrectLength: isCorrectLength
    };
});
