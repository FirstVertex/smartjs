var webServerPort = 99,
    dbServerIpAddress = '127.0.0.1',
    dbServerPort = 98,
    dbName = 'smartjs-db';

require('./mongoDataConnector').startup(dbServerIpAddress, dbServerPort, dbName, function (succeeded) {
    if (!succeeded) {
        console.log('Failed to connect to Database, so quitting');
        return;
    }
    console.log('Successfully connected to Database');

    var readFile = require('fs').readFileSync,
        indexFile = readFile(__dirname + '/static/index.html'),
        indexHandler = function (req, res) {
            console.log('Received request for ' + req.url);
            res.end(indexFile);
        },
        createServer = require('http').createServer,
        server = createServer(indexHandler).listen(webServerPort),
        Nowjs = require('now'),
        everyone = Nowjs.initialize(server),
        ConnectionManager = require('./connectionManager');
    
    // this is all the wiring necessary
    everyone.now.eventClientToServer = ConnectionManager.handleConnection;

    console.log('NodeJs listening on port ' + webServerPort);
    console.log('==================');
    console.log('Hit Ctrl+C to quit');
    console.log('==================');
});