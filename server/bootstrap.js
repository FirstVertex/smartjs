var dbServerIpAddress = '127.0.0.1',
    dbServerPort = 98,
    webServerPort = 99,
    Database = require('./dataProvider').dataProvider,
    dataProvider = new Database(dbServerIpAddress, dbServerPort);

dataProvider.startup(function (isError) {
    if (isError) {
        console.log('Failed to connect to Database, so quitting');
        return;
    }
    console.log('Successfully connected to Database');

    var readFile = require('fs').readFileSync,
        indexFile = readFile(__dirname + '/index.html'),
        indexHandler = function (req, res) {
            console.log('Received request for ' + req.url);
            res.end(indexFile);
        },
        createServer = require('http').createServer,  
        server = createServer(indexHandler).listen(webServerPort),
        nowjs = require('now'),
        everyone = nowjs.initialize(server);

    console.log('Node Js Nowserver listening on port ' + webServerPort);

    new require('./application').App(dataProvider, everyone, nowjs);

    console.log('Application started');
    console.log('==================');
    console.log('Hit Ctrl+C to quit');
    console.log('==================');
});