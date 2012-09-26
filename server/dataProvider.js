var mongo = require('mongodb');
var Util = require('./util');
var dbName = 'smartjs-db';

function MongoDataProvider(host, port) {
    var self = this;

    self.dbHost = host;
    self.dbPort = port;

    self.dbServer = new mongo.Server(self.dbHost, self.dbPort, { auto_reconnect: true });
    self.db = new mongo.Db(dbName, self.dbServer);

    console.log('host=' + host + ',port=' + port + ',db=' + self.db);

    self.getCollection = function (collectionName, callback) {
        console.log('get collection ' + collectionName);
        this.db.collection(collectionName, callback);
    }

    self.membersCollection = function (callback) {
        this.getCollection('members', callback);
    }

    self.topicsCollection = function (callback) {
        this.getCollection('topics', callback);
    }

    self.findAll = function (collectionName, request, callback) {
        this.getCollection(collectionName, function (error1, result1) {
            if (!Util.isError(error1, request)) {
                result1.find().toArray(callback);
            }
        });
    }

    self.findById = function (collectionName, id, request, callback) {
        this.getCollection(collectionName, function (error1, result1) {
            if (!Util.isError(error1, request)) {
                result1.findOne(
                    { _id: id }, callback);
            }
        });
    }

    self.findByColumn = function (collectionName, columnName, columnValue, maxResults, request, callback) {
        this.getCollection(collectionName, function (error1, result1) {
            if (!Util.isError(error1, request)) {
                var queryWhere = {};
                queryWhere[columnName] = columnValue;

                // todo: sort by createDate
                result1.find(queryWhere).limit(maxResults).toArray(callback);
            }
        });
    }

    self.save = function (collectionName, saveItems, request, callback) {
        this.getCollection(collectionName, function (error1, result1) {
            if (!Util.isError(error1, request)) {
                if (typeof (saveItems.length) == "undefined")
                    saveItems = [saveItems];

                result1.save(saveItems, { safe: true }, callback);
            }
        });
    }

    self.deleteById = function (collectionName, id, request, callback) {
        this.getCollection(collectionName, function (error1, result1) {
            if (!Util.isError(error1, request)) {
                var queryWhere = {
                    '_id': mongo.ObjectID.createFromHexString(id)
                };
                result1.remove(queryWhere, { safe: true }, callback);
            }
        });
    }

    //insert - note insert returns an array while save return an item
    self.insert = function (collectionName, saveItems, request, callback) {
        this.getCollection(collectionName, function (error1, result1) {
            if (!Util.isError(error1, request)) {
                if (typeof (saveItems.length) == "undefined")
                    saveItems = [saveItems];
                console.log('about to insert ' + Util.inspectObject(saveItems));
                result1.insert(saveItems, { safe: true }, callback);
            }
        });
    }

    self.startup = function (callback) {
        console.log('in startup');
        var localRequest = Util.requestFactory(null,
	        function (rStruct) {
	            console.log('in custom callback');
	            callback(rStruct.error);
	        });

        console.log('open db');
        self.db.open(function (error1, result1) {
            if (!Util.isError(error1, localRequest)) {
                console.log('attempt to access members collection');

                self.membersCollection(function (error1, members) {
                    console.log('members=' + members);
                    if (members) {
                        members.ensureIndex(
						    { 'memberName': 1 },
						    { unique: true, safe: true },
						    function (error3) {
						        Util.processResponse(localRequest, error3, null);
						    }
					    );
                    } else {
                        Util.isError('Unable to get a handle to the members Collection, so quitting', localRequest);
                    }
                });

                self.topicsCollection(function (error1, topics) {
                    console.log('topics=' + topics);
                    if (topics) {
                        topics.ensureIndex(
						    { 'topicName': 1 },
						    { unique: true, safe: true },
						    function (error3) {
						        Util.isError(error3, localRequest);
						    }
					    );
                    } else {
                        Util.isError('Unable to get a handle to the topics Collection, so quitting', localRequest);
                    }
                });
            }
        });
    }
}

exports.dataProvider = MongoDataProvider;