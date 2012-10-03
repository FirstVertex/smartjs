// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the schema module provides an abstraction around creating models
// this module returns a static object

// request/response are containers for parameters that need to be passed around the app
module.exports = {
    request: {
        create: function (xStruct, callback) {
            return {
                xStruct: xStruct,
                callback: callback
            };
        }
    },
    response: {
        create: function (xStruct, error, result) {
            return {
                event: xStruct ? xStruct.event : null,
                kind: xStruct ? xStruct.kind : null,
                sender: xStruct ? xStruct.sender : null,
                error: error,
                data: result
            };
        }
    }
};