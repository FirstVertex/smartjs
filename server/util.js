var sysUtil = require('util');

function Util() {
}

Util.prototype.inspectObject = function (obj) {
    return sysUtil.inspect(obj, true, 7, true);
};

Util.prototype.requestFactory = function (xStruct, callback) {
    return {
        xStruct: xStruct,
        callback: callback
    };
};

Util.prototype.responseFactory = function (xStruct, error, result) {
    return {
        event: xStruct ? xStruct.event : null,
        kind: xStruct ? xStruct.kind : null,
        sender: xStruct ? xStruct.sender : null,
        error: error,
        data: result
    };
};

Util.prototype.processResponse = function (request, error, result) {
    if (error) {
        console.error(">>!! Error occurred: " + this.inspectObject(error));
    }
    if (request && request.callback) {
        var response = this.responseFactory(request.xStruct, error, result);
        console.log(">>Sending back response: " + this.inspectObject(response));
        request.callback(response);
    } else {
        console.log('non callback request');
    }
}

Util.prototype.isError = function (error, request) {
    if (error) {
        this.processResponse(request, error, null);
        return true;
    }
    return false;
}

module.exports = new Util();