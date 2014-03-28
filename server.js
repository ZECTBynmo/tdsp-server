var express = require('express'),
	config = require("./config"),
    path = require('path'),
    http = require('http'),
    io = require('socket.io'),
    LocalTunnel = require('localtunnel-wrapper'),
    Router = require(__dirname + '/routes/router').Router,
    router = new Router();

var app = express();

app.configure( function() {
	app.set( 'port', process.env.PORT || config.port );
    app.use( express.logger('dev') );  /* 'default', 'short', 'tiny', 'dev' */
    app.use( express.bodyParser({limit: '50mb'}) ),
    app.use( "/raw", express.static(path.join(__dirname, 'processed')) );
    app.use( express.static(path.join(__dirname, 'public')) );

    // GET requests
    app.get( '/dsp',                                  router.dsp );
    app.get( '/dsp/:id',                              router.dspById );
    app.get( '/dsp/:id/demo',                         router.demoById );
    app.get( '/dsp/:id/demo/:guid',                   router.demoById );
    app.get( '/presets',                              router.presets );
    app.get( '/presets/:id',                          router.presets );
    app.get( '/presets/:id/:presetName',              router.presets );
    app.get( '/requestProcess/:guid/:id/:presetName', router.requestProcess );

    // POST requests
    app.post( '/updateParams',                        router.updateParams );
    app.post( '/upload',                              router.upload );
});

// Create our server
var server = http.createServer(app).listen(app.get('port'), function () {
    console.log( "Express server listening on port " + app.get('port') );
});

process.on('uncaughtException', function (err) {
    console.log(err);
});