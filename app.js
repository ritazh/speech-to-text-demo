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
var clientSecret = 'ceb21dbbce474431ad3fc95b12a6cc90'; // API key from Cognitive Service Speech service
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
      url: 'https://speech.platform.bing.com/recognize/query',
      qs: {
        'scenarios': 'ulm',
        'appid': 'D4D52672-91D7-4C74-8AD8-42B1D98141A5',
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
        'id': 'cad83334-1da4-4363-8a77-45468fbae851', // API key from Cognitive Service LUIS service
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

function getWeather(query, callback) {
    request.get({
      url: 'http://api.openweathermap.org/data/2.5/weather',
      qs: {
        'APPID': 'bb979403214e22577769ec227d86e8fd', // LUIS APP ID for GetWeather
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
app.use(bodyParser.urlencoded());

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
      console.log('Done parsing file data from form!');
      var result = '';

      getAccessToken(clientId, clientSecret, function(err, accessToken) {
          if(err) return console.log(err);
          console.log('Got access token: ' + accessToken)
          speechToText(savedFile, accessToken, function(err, speechres) {
              if(err) return console.log(err);
              result = 'Did you mean "' + speechres.results[0].lexical + '"? Confidence score: ' + speechres.results[0].confidence + '.';
              console.log(result);

              LUIS(speechres.results[0].lexical, function(err, luisres) {
                if(err) return console.log(err);
                console.log(luisres['entities']);
                var city = null;
                var score = null;
                for (var i = 0; i < luisres['entities'].length; ++i) {
                  score = luisres['entities'][i]['score'];
                  console.log(score);
                  if(score > 0.5){
                    city = luisres['entities'][i]['entity'];
                    break;
                  }
                }
                
                if(city && score){
                  result = result + ' <br/>We found a matching city: "' + city + '".  Confidence score: ' + score + '.';
                  getWeather(city, function(err, weatherres) {
                    if(err) return console.log(err);
                    var weatherData = null;
                    var main = weatherres['weather'][0]['description'];
                    var temp = weatherres['main']['temp'];
                    if(temp){
                      temp = Math.floor(temp*9/5 - 459.67);
                    }
                    weatherData = 'Current weather in "' + city + '" is ' + main + '. current temperature is ' + temp + '°F.';
                    if(weatherData){
                      result += '<br/>' + weatherData;
                    }
                    
                    console.log(result);
                    res.status(200).send(result);

                  });
                }else{
                  result = result + ' <br/>LUIS intent `GetWeather` was not matched for this query. HINT: Ask about a city.'; 
                  console.log(result);
                  res.status(200).send(result);
                }
                
              });
              
          });
      })
    
  });
    
  req.pipe(busboy);

  
})
app.listen(process.env.PORT || 3000);
console.log("Running at Port 3000");

