// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the mongoDataConnector module is an abstraction around mongo db using node-mongo-native
// this module returns a static object

var Util = require('./util'),
    Mongo = require('mongodb'),
    Database;

function ensureUniqueIndex(tableName, columnName, callback) {
    Database.collection(tableName, function (error1, tableRef) {
        if (Util.isError(error1)) {
            callback(false);
        } else if (!tableRef) {
            Util.isError('Can\'t find ' + tableName + ' Collection');
            callback(false);
        } else {
            var indexSpec = {};
            indexSpec[columnName] = 1;
            tableRef.ensureIndex(indexSpec,
                { unique: true, safe: true },
                function (error2) {
                    if (Util.isError(error2)) {
                        callback(false);
                    } else {
                        console.log('Set ' + columnName + ' unique on ' + tableName + ' collection');
                        callback(true);
                    }
                }
            );  
        }
    });
}

// callback just needs a true or false
function checkTables(callback) {
    console.log('open db');
    Database.open(function (error1, result1) {
        if (Util.isError(error1)) {
            callback(false);
        } else {
            ensureUniqueIndex('members', 'memberName',
                function (ok) {
                    if (ok) {
                        ensureUniqueIndex('topics', 'topicName', callback);
                    } else {
                        callback(false);
                    }
                });
        }
    });
}

function startup(host, port, dbName, callback) {
    console.log('mongoDataConnector.startup');

    var dbServer = new Mongo.Server(host, port, { auto_reconnect: true });
    Database = new Mongo.Db(dbName, dbServer, { safe: true });
    console.log('host=' + host + ',port=' + port + ',db=' + Database);
    if (!Database) {
        console.log('quitting because there is no database');
        callback(false);
    } else {
        checkTables(callback);
    }
}

function findAll(collectionName, request, callback) {
    Database.collection(collectionName, function (error1, result1) {
        if (!Util.isError(error1, request)) {
            result1.find().toArray(callback);
        }
    });
}

function findById(collectionName, id, request, callback) {
    Database.collection(collectionName, function (error1, result1) {
        if (!Util.isError(error1, request)) {
            result1.findOne(
                { _id: id }, callback);
        }
    });
}

function findByColumn(collectionName, columnName, columnValue, maxResults, request, callback) {
    Database.collection(collectionName, function (error1, result1) {
        if (!Util.isError(error1, request)) {
            var queryWhere = {};
            queryWhere[columnName] = columnValue;

            // todo: sort by createDate
            result1.find(queryWhere).limit(maxResults).toArray(callback);
        }
    });
}

//insert - note insert returns an array while save returns an item
function insert(collectionName, saveItems, request, callback) {
    Database.collection(collectionName, function (error1, result1) {
        if (!Util.isError(error1, request)) {
            if (typeof (saveItems.length) == "undefined")
                saveItems = [saveItems];
            console.log('about to insert ' + Util.inspectObject(saveItems));
            result1.insert(saveItems, { safe: true }, callback);
        }
    });
}

function save(collectionName, saveItems, request, callback) {
    Database.collection(collectionName, function (error1, result1) {
        if (!Util.isError(error1, request)) {
            if (typeof (saveItems.length) == "undefined")
                saveItems = [saveItems];

            result1.save(saveItems, { safe: true }, callback);
        }
    });
}

function deleteById(collectionName, id, request, callback) {
    Database.collection(collectionName, function (error1, result1) {
        if (!Util.isError(error1, request)) {
            var queryWhere = {
                '_id': mongo.ObjectID.createFromHexString(id)
            };
            result1.remove(queryWhere, { safe: true }, callback);
        }
    });
}

module.exports = {
    startup: startup,
    findAll: findAll,
    findById: findById,
    findByColumn: findByColumn,
    insert: insert,
    save: save,
    deleteById: deleteById
};