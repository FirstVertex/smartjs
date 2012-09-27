var Util = require('./util');

function App(dataProvider, everyone, nowjs) {
	var self = this;
	self.dataProvider = dataProvider;
	self.nowjs = nowjs;

	self.watchGroupName = 'topicWatchers';
    
	self.topicCountChange = function (topic) {
	    var topicName = topic.topicName;
	    if (topicName != self.watchGroupName) {
	        var watchGroup = self.nowjs.getGroup(self.watchGroupName);
	        var dto = {
	            topicName: topicName,
	            memberCount: topic.memberList.length
	        };
	        console.log('Notifying watcher group that topic count changed: ' + Util.inspectObject(dto));
            // server's "clientId" is considered to be -1
	        watchGroup.now.eventServerToClient('topic.count', dto, -1);
	    }
	}

	self.processGroupRequest = function (xStruct) {
	    console.log('Access Nowjs group in processGroupRequest: ' + xStruct.data.groupName);
	    var group = self.nowjs.getGroup(xStruct.data.groupName);
	    switch (xStruct.event) {
	        case 'group.addMember':
	            if (xStruct.data.exitGroupName) {
	                self.nowjs.getGroup(xStruct.data.exitGroupName).removeUser(xStruct.sender);
	            }
	            group.addUser(xStruct.sender);

	            var topic = self.getGroupTopic(group);
	            if (topic) {
	                var newUser = addClient(topic, xStruct.sender, xStruct.data.memberName);
	                if (newUser) {
	                    // send different message to other clients than the joiner
	                    group.exclude([xStruct.sender]).now.eventServerToClient('group.addMember', { memberName: xStruct.data.memberName }, xStruct.sender);
	                }

	                // too early for this, wait for client to request it when they are ready
	                //this.now.eventServerToClient('group.members', topic.memberList, currentClientId);
	            }
	            break;
	        case 'group.removeMember':
                group.removeUser(xStruct.sender);
                break;
	        default:
	            console.log('handle generic group event');
	            group.now.eventServerToClient(xStruct.event, xStruct.data, xStruct.sender);
	            break;
	    }
	}

	function removeClient(topic, clientId) {
	    if (!topic) return;
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
	    
	    self.topicCountChange(topic);
	}

	function addClient(topic, clientId, memberName) {
	    if (!topic) return null;
	    console.log('add client to group\'s memberlist: ' + clientId);
	    var newUser = {
	        clientId: clientId,
	        memberName: memberName
	    };
	    
	    topic.memberList.push(newUser);
	    console.log('client is added to topic=' + Util.inspectObject(topic));
	    self.topicCountChange(topic);
	    return newUser;
	}

	self.nowjs.on('newgroup', function (group) {
	    console.log('Nowjs group created: ' + group.groupName);
	    //group.now.userList = [];
	    //console.log('userList=' + Util.inspectObject(group.now.userList));
	    group.on('leave', function () {
	        var currentClientId = this.user.clientId;
	        removeClient(self.getGroupTopic(group), currentClientId);
	        var removeDto = {
	            topicName: group.groupName
	        };
	        group.now.eventServerToClient('group.removeMember', removeDto, currentClientId);
	    });
	});

	self.nowjs.on('disconnect', function () {
	    var currentClientId = this.user.clientId;

	    console.log('disconnect notice, this.getGroups=' + this.getGroups);
	    console.log('this.now=' +  Util.inspectObject(this.now));
	    console.log('this.user=' + Util.inspectObject(this.user));
	    console.log('this.groups=' + Util.inspectObject(this.groups));

	    this.getGroups(function (groups) {
	        console.log('discod user belongs to groups:' + Util.inspectObject(groups));
	        for (var i = 0; i < groups.length; i++) {
	            var topicName = groups[i];
	            var topic = self.getTopicCache(topicName);
	            removeClient(topic, currentClientId);
	            if (topic) {
	                self.nowjs.getGroup(topicName).exclude([currentClientId]).now.eventServerToClient('group.removeMember', null, currentClientId);
	            }
	        }
	    });
    });

    /*
    // if this can be factored out to only exist on the client in the form of a group.on leave
	self.nowjs.on('disconnect', function () {
	    var currentClientId = this.user.clientId;
	    if (this.now.userInfo) {
	        if (this.now.userInfo.currentGroup) {
	            var group = self.nowjs.getGroup(this.now.userInfo.currentGroup);
	            group.exclude([currentClientId]).now.eventServerToClient('user.disconnected', null, currentClientId);
	        }
	        console.log("Disco notice from: " + this.now.userInfo.memberName);
	    } else {
	        console.log("Disco notice (no userInfo struct) from: " + currentClientId);
	    }
	});
    */

	self.topicCache = [];

	self.addTopicToCache = function (topicName) {
	    self.topicCache.push({
	        topicName: topicName,
            memberList: []
	        //memberCount: 0
	    });
	}

	self.getGroupTopic = function (group) {
	    return self.getTopicCache(group.groupName);
	}

	self.getTopicCache = function (topicName) {
	    for (var i = 0; i < self.topicCache.length; i++) {
	        if (self.topicCache[i].topicName === topicName) {
	            return self.topicCache[i];
	        }
	    }
	    return null;
	}

    // do this now on load
	self.dataProvider.findAll('topics', null, function (error, result) {
	    if (!error) {
	        for (var i = 0; i < result.length; i++) {
	            self.addTopicToCache(result[i].topicName);
	        }
	    }
	    console.log('loaded topicCache: \n' + Util.inspectObject(self.topicCache));
	});

	self.processDataRequest = function (request) {
	    switch (request.xStruct.event) {
	        case 'member.new':
	            self.dataProvider.insert('members', request.xStruct.data, request, function (error, result) {
	                Util.processResponse(request, error, result && result[0]);
	            });
	            break;
            case 'topic.new':
                self.dataProvider.insert('topics', request.xStruct.data, request, function (error, result) {
                    if (!Util.isError(error)) {
                        result = result[0];
                        self.addTopicToCache(result.topicName);
                    }
                    Util.processResponse(request, error, result);
                });
                break;
	        case 'topic.list':
	            var topicListDto = [];
	            for (var i = 0; i < self.topicCache.length; i++) {
	                topicListDto.push({
	                    topicName: self.topicCache[i].topicName,
	                    memberCount: self.topicCache[i].memberList.length
	                });
	            }
	            Util.processResponse(request, null, topicListDto);
	            break;
                // just to list a group's members
	        case 'topic.members':
	            var topic = self.getTopicCache(request.xStruct.data.topicName);
	            var responseData = {
	                topicName: request.xStruct.data.topicName,
	                memberList: topic ? topic.memberList : []
	            };
	            Util.processResponse(request, null, responseData);
                break;
	        default:
	            console.log('unhandled Event in processDataRequest. This is usually bad!');
	            Util.processResponse(request, 'Unknown data request', null);
	            break;
	    }
	}

    // the client has sent an event to the server for processing
	everyone.now.eventClientToServer = function (xStruct, callback) {
	    console.log('eventClientToServer, xStruct= ' + Util.inspectObject(xStruct));
	    
	    switch (xStruct.kind) {
	        case 'data':
                // in the case of a data request, callback is generally only used to communicate success or failure and in failure cases, also errorMessages
	            var request = Util.requestFactory(xStruct, callback);
	            self.processDataRequest(request);
	            break;
	        case 'group':
                // group request do not currently do anything with callback, it is assumed group ops always succeed
	            self.processGroupRequest(xStruct);
	            break;
	        default:
	            console.log('unhandled Event in eventClientToServer. This is usually bad!');
	            if (callback) {
	                var request = Util.requestFactory(xStruct, callback);
	                Util.processResponse(request, 'Unknown event', null);
	            }
	            break;
	    }
	};

    // the reply mechanism uses now to call a function directly on the client, this is a copy of the client method signature
	// now.eventServerToClient = function (eventName, data, senderClientId) {}
}

exports.App = App;