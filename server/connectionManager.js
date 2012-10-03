var Schema = require("./schema"),
    Util = require("./util"),
    handlers = [],
    handlerCount = 0;

function handleConnection(xStruct, callback) {
    var request = Schema.request.create(xStruct, callback);

    var handled = false;
    for (var i = 0; i < handlerCount; i++) {
        handled = handlers[i].processConnection(request);
        if (handled) break;
    }

    if (!handled) {
        Util.processResponse(request, 'unhandled event kind=' + xStruct.kind, null);
    }
}

// allow to dynamically add a handler at run time
function addHandler(handlerName) {
    var handlerPath = "./connectionHandlers/" + handlerName + "Handler";
    handlers.push(require(handlerPath));
    handlerCount = handlers.length;
}

addHandler("group");
addHandler("data");

module.exports = {
    handleConnection: handleConnection,
    addHandler: addHandler
};