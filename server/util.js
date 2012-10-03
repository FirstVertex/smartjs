// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the util module provides a general location for routines used everywhere
// this module returns a static object

var sysUtil = require('util');
var Schema = require('./schema');

function inspectObject (obj) {
    return sysUtil.inspect(obj, true, 7, true);
}

function processResponse(request, error, result) {
    if (error) {
        console.error(">>!! Error occurred: " + inspectObject(error));
    }
    if (request && request.callback) {
        var response = Schema.response.create(request.xStruct, error, result);
        console.log(">>Sending back response: " + inspectObject(response));
        request.callback(response);
    } else {
        console.log('non callback request');
    }
}

function isValidResult(error, result, request) {
    var emptyResult = error ? error : result ? null : 'Invalid result';
    if (emptyResult) {
        processResponse(request, emptyResult, null);
        return false;
    }
    return true;
}

function isError(error, request) {
    if (error) {
        processResponse(request, error, null);
        return true;
    }
    return false;
}

module.exports = {
    inspectObject: inspectObject,
    processResponse: processResponse,
    isValidResult: isValidResult,
    isError: isError
};