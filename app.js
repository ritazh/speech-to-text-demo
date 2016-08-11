'use strict';

var fs = require('fs'),
    util = require('util'),
    request = require('request'),
    inspect = require('util').inspect,
    os = require('os'),
    Busboy = require('busboy'),
    express = require('express'),
    app = express(),
    path = require('path'),
    connect = require('connect'),
    bodyParser = require('body-parser');

var clientId = 'test-app';   
var clientSecret = 'f735c587f01b4c5a82048418caf5c97f'; 
//'ceb21dbbce474431ad3fc95b12a6cc90'; // API key from Bing Speech service
var savedFile = null;

function getAccessToken(clientId, clientSecret, callback) {
  request.post({
    url: 'https://oxford-speech.cloudapp.net/token/issueToken',
    form: {
      'grant_type': 'client_credentials',
      'client_id': encodeURIComponent(clientId),
      'client_secret': encodeURIComponent(clientSecret),
      'scope': 'https://speech.platform.bing.com'
    }
  }, function(err, resp, body) {
    if(err) return callback(err);
    try {
      var accessToken = JSON.parse(body).access_token;
      if(accessToken) {
        callback(null, accessToken);
      } else {
        callback(body);
      }
    } catch(e) {
      callback(e);
    }
  });
}

function speechToText(filename, accessToken, callback) {
  fs.readFile(filename, function(err, waveData) {
    if(err) return callback(err);
    request.post({
      url: 'https://653b18d0e1f24f1397a20586e2654959.api.cris.ai/cris/speech/query?cid=a1787a15-7150-4ee4-b277-f51ddb98be87', //'https://speech.platform.bing.com/recognize',
      qs: {
        'scenarios': 'ulm',
        'appid': '31b3d95b-af74-4550-9619-de76fe33f0f0', 
        //'D4D52672-91D7-4C74-8AD8-42B1D98141A5',// Using Bing Speech service
        'locale': 'en-US',
        'device.os': 'wp7',
        'version': '3.0',
        'format': 'json',
        'requestid': '1d4b6030-9099-11e0-91e4-0800200c9a66',
        'instanceid': '1d4b6030-9099-11e0-91e4-0800200c9a66'
      },
      body: waveData,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'audio/wav; samplerate=16000',
        'Content-Length' : waveData.length
      }
    }, function(err, resp, body) {
      if(err) return callback(err);
      try {
        console.log(body);
        callback(null, JSON.parse(body));
      } catch(e) {
        callback(e);
      }
    });
  });
}

function LUIS(query, callback) {
    request.get({
      url: 'https://api.projectoxford.ai/luis/v1/application',
      qs: {
        'id': '04eb9f25-174a-496f-b457-787ee0b5e6e7', // API key from Cognitive Service LUIS service
        'subscription-key': 'c831821ce79e4f13844a75f6099de616', // LUIS Subscription ID
        'q': query
      }
    }, function(err, resp, body) {
      if(err) return callback(err);
      try {
        callback(null, JSON.parse(body));
      } catch(e) {
        callback(e);
      }
    });
}

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

app.post('/recognize', function(req, res) {
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      savedFile = path.join(os.tmpDir(), 'test.wav');
      file.pipe(fs.createWriteStream(savedFile));
      console.log('File is saved to: ' + savedFile);
  });

  busboy.on('finish', function() {
      var result = '';

      getAccessToken(clientId, clientSecret, function(err, accessToken) {
          if(err) return console.log(err);
          console.log('Got access token: ' + accessToken)
          speechToText(savedFile, accessToken, function(err, speechres) {
              if(err) return console.log(err);
              result = 'Did you mean "' + speechres.results[0].lexical + '"? Confidence score: ' + speechres.results[0].confidence + '.';
              console.log(result);
              res.status(200).send(speechres.results[0].lexical);
              
          });
      })
    
  });
    
  req.pipe(busboy);
});

app.get('/luis', function(req, res) {
  console.log(req.query.q);
  LUIS(req.query.q, function(err, luisres) {
      if(err) return console.log(err);
        console.log(luisres);
        res.status(200).send(luisres);
    });
});

app.listen(process.env.PORT || 3000);
console.log("Running at Port 3000");

