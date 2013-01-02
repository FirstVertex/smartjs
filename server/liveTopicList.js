// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the liveTopicList module keeps a list of topics and their associated members
// this module returns a static object

var Util = require('./util'),
    MongoConnection = require('./mongoDataConnector'),
    topicCache = [],
    watchGroupName = 'topicWatchers',
    maxCacheMessages = 5;

function addTopicToCache(topicName) {
    if (topicName != watchGroupName) {
        var newTopic = {
            topicName: topicName,
            memberList: [],
            messageCache: []
        };
        topicCache.unshift(newTopic);
        return getTopicCountChangeDto(newTopic);
    }
    return null;
}

function cacheChatMessage(xStruct) {
    if (!xStruct || !xStruct.data || !xStruct.data.groupName) { return null; }
    var topic = getCachedTopic(xStruct.data.groupName);
    if (!topic) { return null; }

    console.log('add chat message to group\'s messageCache: ' + Util.inspectObject(xStruct));
    topic.messageCache.push(xStruct);
    while (topic.messageCache.length > maxCacheMessages) {
        topic.messageCache.shift();
    }
}

function getTopicCountChangeDto(topic) {
    if (!topic || !topic.topicName) { return null; }
    var topicName = topic.topicName;
    if (topicName === watchGroupName) { return null; }

    // todo: move to Schema
    var dto = {
        topicName: topicName,
        memberCount: topic.memberList.length
    };

    return dto;
}

function getCachedTopic(topicName) {
    for (var i = 0; i < topicCache.length; i++) {
        if (topicCache[i].topicName === topicName) {
            return topicCache[i];
        }
    }
    return null;
}

function getTopicInitialData(topicName) {
    var topic = getCachedTopic(topicName);
    return {
        topicName: topicName,
        memberList: topic ? topic.memberList : [],
        messageCache: topic ? topic.messageCache : []
    };
}

function getTopicList() {
    var topicListDto = [];
    for (var i = 0; i < topicCache.length; i++) {
        topicListDto.push({
            topicName: topicCache[i].topicName,
            memberCount: topicCache[i].memberList.length
        });
    }
    return topicListDto;
}

function addClient(topicName, clientId, memberName) {
    if (!topicName) { return null; }
    var topic = getCachedTopic(topicName);
    if (!topic) { return null; }

    console.log('add client to group\'s memberlist: ' + clientId);
    var newUser = {
        clientId: clientId,
        memberName: memberName
    };

    topic.memberList.push(newUser);
    console.log('client is added to topic=' + Util.inspectObject(topic));
    return getTopicCountChangeDto(topic);
}

function removeClient(topicName, clientId) {
    if (!topicName) { return null; }
    var topic = getCachedTopic(topicName);
    if (!topic) { return null; }

    console.log('got removeClient notice, topic=' + Util.inspectObject(topic) + ',client=' + clientId);
    var cutIndex = -1;
    //var userList = group.now.userList;
    //console.log('cut client from memberList: ' + Util.inspectObject(topic.memberList));
    for (var i = 0; i < topic.memberList.length; i++) {
        if (topic.memberList[i].clientId === clientId) {
            cutIndex = i;
            break;
        }
    }
    if (cutIndex != -1) {
        console.log('remove client from group\'s memberlist: ' + clientId);
        topic.memberList.splice(cutIndex, 1);
        console.log('client is removed from topic=' + Util.inspectObject(topic));
    }

    return getTopicCountChangeDto(topic);
}


// initialize topic cache at startup
MongoConnection.findAll('topics', null, function (error, result) {
    if (!error) {
        for (var i = 0; i < result.length; i++) {
            addTopicToCache(result[i].topicName);
        }
    }
    console.log('loaded topicCache: \n' + Util.inspectObject(topicCache));
});

module.exports = {
    addTopicToCache: addTopicToCache,
    cacheChatMessage: cacheChatMessage,
    addClient: addClient,
    removeClient: removeClient,
    getTopicList: getTopicList,
    getTopicInitialData: getTopicInitialData,
    watchGroupName: watchGroupName
};