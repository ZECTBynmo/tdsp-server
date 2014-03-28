
/**
 * Here's a clone of the popular "wav2mp3" program, but using node-lame and
 * node-wav.
 */

var fs = require('fs');
var lame = require('lame');
var wav = require('wav');
var filename = process.argv[2];

if (process.stdin.isTTY && !filename) {
  // print help
  console.log('usage:');
  console.log('  encode a wav file:');
  console.log('    $ %s <infile.wav> <outfile.mp3>', process.argv.join(' '));
  console.log('  or encode a wav from stdin:');
  console.log('    $ cat song.wav | %s | mpg123 -', process.argv.join(' '));
  process.exit(1);
}

// first figure out if we're encoding from a filename, or from stdin
var input;
var output;
if (filename) {
  var outfile = process.argv[3];
  if (!outfile) {
    console.error('FATAL: must specify an output mp3 file!');
    process.exit(1);
  }
  console.log('encoding %j', filename);
  console.log('to %j', outfile);
  input = fs.createReadStream(filename);
  output = fs.createWriteStream(outfile);
} else {
  input = process.stdin;
  output = process.stdout;
}

// start reading the WAV file from the input
var reader = new wav.Reader();

// we have to wait for the "format" event before we can start encoding
reader.on('format', onFormat);

// and start transferring the data
input.pipe(reader);

function onFormat (format) {
  console.log('WAV format: %j', format);

  format.float = true;

  // encoding the wave file into an MP3 is as simple as calling pipe()
  var encoder = new lame.Encoder(format);
  reader.pipe(encoder).pipe(output);
}