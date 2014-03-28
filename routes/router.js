//////////////////////////////////////////////////////////////////////////
// router - Handles actual http requests from clients
//////////////////////////////////////////////////////////////////////////
//
// Main script!
/* ----------------------------------------------------------------------
													Object Structures
-------------------------------------------------------------------------
	
*/
//////////////////////////////////////////////////////////////////////////
// Requires
require('json5/lib/require');       // Set us up to use JSON5 just in case

var TDSP = require("D:/iZotope/node-tdsp").tdsp,
    dspPaths = require("../dspPaths"),
    JSONB = require('json-buffer'),
    config = require("../config"),
    levelup = require('levelup'),
    uuid = require("node-uuid"),
    ares = require("ares").ares,
    nodePath = require("path"),
    async = require("async"),
	url = require("url"),
    fs = require("fs");    

var db = levelup('./db/faust'),
    loadInfoCallQueue = [],
    tdsp = new TDSP(),
	dspModules = {};


//////////////////////////////////////////////////////////////////////////
// Constructor
function Router() {
	var _this = this;

	this.paths = dspPaths;

    // Load module info for each path
	for( var iPath in this.paths ) {
		var path = dspPaths[iPath],
            info = tdsp.getInfo( path );

        for( var iDSP in info ) {
            var elementName = info[iDSP].name;
            dspModules[elementName] = info[iDSP];
            dspModules[elementName].path = path;
            dspModules[elementName].iInstance = iDSP;

            dspModules[elementName].defaultPreset = {
                name: elementName,
                parameters: {}
            };

            for( var iParam in info[iDSP].params ) {
                dspModules[elementName].defaultPreset.parameters[iParam] = info[iDSP].params[iParam].default;
            }
        }
	}

	// Run our async call queue
	console.log( "Loading Modules" );
	async.series( loadInfoCallQueue, function(err) {
		console.log( "FINISHED LOADING MODULES" );
	});
} 


// leto-marker-routes
// GET /process
Router.prototype.dsp = function( req, res ) {

    // We don't want the browser to cache the results 
    res.header( 'Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0' );

    // Build an array out of the dsp modules we've found so that
    // we conform to what Backbone wants on the client side
    var dspArray = [];
    for( var iModule in dspModules ) {
    	dspArray.push( dspModules[iModule] );
    }

    res.json( 200, dspArray );
};


Router.prototype.dspById = function( req, res ) {
	// We don't want the browser to cache the results 
    res.header( 'Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0' );

    res.json( 200, dspModules[req.params.id] );
};


Router.prototype.demoById = function( req, res ) {
    // We don't want the browser to cache the results 
    res.header( 'Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0' );

    var presetsFound = [];

    var onClose = function() {

        var responseData = {
            dsp: dspModules[req.params.id],
            presets: presetsFound,
            guid: req.params.guid
        }

        res.json( 200, responseData );
    };

    var onPresetFound = function( preset ) {
        presetsFound.push( preset );
    };

    var filterObj = {
        start: "presets:" + req.params.id + ":",
        end: "presets:" + req.params.id + ":zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    };

    db.createReadStream(filterObj).on('data', onPresetFound)
                                  .on('close', onClose);
};


Router.prototype.process = function( req, res ) {

    // We don't want the browser to cache the results 
    res.header( 'Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0' );

    res.json( 200, {} );
};


// GET /processed
Router.prototype.getProcessed = function( req, res ) {
	console.log( "Getting processed file" );

    // We don't want the browser to cache the results 
    res.header( 'Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0' );

    var id = req.params.id;

    res.json( 200, {"guid": id} );
};


// GET /results/:id
Router.prototype.showResults = function( req, res ) {
    var id = req.params.id;
    console.log( "Getting presentation " + id );

    // Load the html with this id
    var htmlFile = fs.readFileSync( "./processed/" + id + ".wav" );

    if( htmlFile != undefined ) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write( htmlFile );
        res.end();
    } else {
        res.json( 500, {'error':'result not found'} );
    }
}


// POST /upload
Router.prototype.upload = function( req, res ) {
    
    var file = req.body,
    	uploadID = uuid.v1(),
    	fileExtension = file.name.split('.').pop(),
        fileBuffer;

    var outputPath = config.upload_dir + '/' + uploadID + "." + fileExtension;

    // If the upload folder doesn't exist already, create it
    if( !fs.existsSync(config.upload_dir) ) {
        fs.mkdirSync( config.upload_dir );
    }
    
    // Load the file contents and write it to disk in our uploads folder
    file.contents = file.contents.split(',').pop();
    fileBuffer = new Buffer( file.contents, "base64" );
    fs.writeFileSync( outputPath, fileBuffer );

    var successData = {
    	guid: uploadID
    };

    if( dspModules[file.dsp].path != undefined ) {
        var fullName = uploadID + "." + file.dsp + "." + "default",
            inPath = "D:/Projects/MrsFaust/uploads/" + uploadID + ".wav",
            outPath = "D:/Projects/MrsFaust/processed/" + fullName + ".wav";

        tdsp.processFile( dspModules[file.dsp].path, inPath, outPath, dspModules[file.dsp].iInstance, dspModules[file.dsp].defaultPreset, dspModules[file.dsp] );

        var convertInputPath = "D:/Projects/MrsFaust/processed/" + fullName + ".wav",
            convertOutputPath = "D:/Projects/MrsFaust/processed/" + fullName + ".mp3",
            originalInputPath = "D:/Projects/MrsFaust/uploads/" + uploadID + ".wav",
            originalOutputPath = "D:/Projects/MrsFaust/processed/" + uploadID + ".original.mp3",
            convertCommand = 'C:/lame/lame.exe "' + convertInputPath + '" "' + convertOutputPath + '"',
            originalConvertCommand = 'C:/lame/lame.exe "' + originalInputPath + '" "' + originalOutputPath + '"';

        // Convert the 
        ares( convertCommand, true, function() {         
            console.log( "DEFAULT" );
            console.log( convertCommand );   
            ares( originalConvertCommand, true, function() {
                console.log( "ORIGINAL" );
                console.log( originalConvertCommand );
                console.log( "FINISHED" );
                res.json( 200, successData );
            });
        });
    } else {
    	console.log( "TRYING TO PROCESS WITH DSP THAT DOESN'T EXIST!");
    	console.log( file.dsp );
    	console.log( dspPaths );
    }    
}


Router.prototype.updateParams = function( req, res ) {

    // We don't want the browser to cache the results 
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

//  var paramFile = JSON.parse( req.params["paramFile"] ).paramFile;

    var paramFile = req.body;

    for( var iParam in paramFile.parameters ) {
        if( paramFile.parameters[iParam] == "true" || paramFile.parameters[iParam] == "false" )
            paramFile.parameters[iParam] = Boolean( paramFile.parameters[iParam] );
        else
            paramFile.parameters[iParam] = Number( paramFile.parameters[iParam] );
    }

    var dbKey = "presets:" + paramFile.name + ":" + paramFile.presetName;

    console.log( "Saving " + dbKey );
    console.log( paramFile );

    // Stick this preset file into our database
    db.put( dbKey, JSONB.stringify(paramFile), function(err) {
        if( err ) {
            res.json( 500, {error: err} );
        } else {
            res.json( 200, {} );
        }        
    });
}


Router.prototype.requestProcess = function( req, res ) {
    console.log( req.body );
    console.log( req.params );

    var uploadID = req.params.guid,
        dspName = req.params.id,
        presetName = req.params.presetName;

    console.log( dspModules[dspName] );

    if( dspModules[dspName].path != undefined ) {
        var fullName = uploadID + "." + dspName + "." + presetName,
            key = "presets:" + dspName + ":" + presetName,
            inPath = "D:/Projects/MrsFaust/uploads/" + uploadID + ".wav",
            outPath = "D:/Projects/MrsFaust/processed/" + fullName + ".wav";

        var successData = {
            fullName: fullName,
        };

        var presetsFound = [];

        var onData = function( value ) {
            presetsFound.push( value );
        };

        var onClose = function() {
            if( presetsFound.length == 0 ) {
                console.log( "No presets found matching key" );
                res.json( 500, {error:"No presets found matching key"} );
            } else {
                var preset = JSONB.parse(presetsFound[0].value);

                console.log( "PROCESSING PRESET" );
                console.log( preset );

                tdsp.processFile( dspModules[dspName].path, inPath, outPath, dspModules[dspName].iInstance, preset, dspModules[dspName] );

                var convertInputPath = "D:/Projects/MrsFaust/processed/" + fullName + ".wav",
                    convertOutputPath = "D:/Projects/MrsFaust/processed/" + fullName + ".mp3",
                    convertCommand = 'C:/lame/lame.exe "' + convertInputPath + '" "' + convertOutputPath + '"';

                console.log( convertCommand );

                ares( convertCommand, true, function() {
                    console.log( "FINISHED" );
                    res.json( 200, successData );
                });
            }
        }

        var filterObj = {
            start: key,
            end: "presets:" + req.params.id + ":zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
        };

        db.createReadStream(filterObj).on('data', onData)
                                      .on('close', onClose);
    } else {
        console.log( "TRYING TO PROCESS WITH DSP THAT DOESN'T EXIST!");
        console.log( dspName );
        console.log( dspPaths );
        res.json( 500, {error:"Trying to process with DSP that doesn't exist"} );
    } 
}


Router.prototype.presets = function( req, res ) {

    // We don't want the browser to cache the results 
    res.header( 'Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0' );

    var presetsFound = [];

    var onClose = function() {

        if( presetsFound.length > 0 ) {
            if( req.params.presetName == undefined && req.params.id == undefined ) {
                var responsePresets = {};
                for( var iPreset in presetsFound ) {
                    var presetValue = JSONB.parse( presetsFound[iPreset].value );

                    if( responsePresets[presetValue.name] === undefined )
                        responsePresets[presetValue.name] = {};

                    var name = presetsFound[iPreset].key.split(":")[2];
                    responsePresets[presetValue.name][name] = presetValue;
                }
                var responseData = { presets: responsePresets };
            } else if( req.params.presetName === undefined ) {
                var responsePresets = {};
                for( var iPreset in presetsFound ) {
                    var name = presetsFound[iPreset].key.split(":")[2];
                    responsePresets[name] = JSONB.parse( presetsFound[iPreset].value );
                }
                var responseData = { presets: responsePresets };
            } else {
                var responseData = { preset: JSONB.parse(presetsFound[0].value) };
            }

            res.json( 200, responseData );
        } else {
            var responseData = { error: "No such preset" }
            res.json( 400, responseData );
        }
    };

    var onPresetFound = function( preset ) {
        presetsFound.push( preset );
    };

    if( req.params.presetName == undefined && req.params.presetName == undefined ) {
        var strKeyStart = "presets:";
        var strKeyEnd = "presets:zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";
    } else if( req.params.presetName == undefined ) {
        var strKeyStart = "presets:" + req.params.id + ":";
        var strKeyEnd = "presets:" + req.params.id + ":zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";
    } else {
        var strKeyStart = "presets:" + req.params.id + ":" + req.params.presetName;
        var strKeyEnd = "presets:" + req.params.id + ":zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";
    }

    var filterObj = {
        start: strKeyStart,
        end: strKeyEnd,
    };

    db.createReadStream(filterObj).on('data', onPresetFound)
                                  .on('close', onClose);
}


exports.Router = Router;