
'use strict';

var initSocket = require('./socket').initSocket;
var display = require('./views/displaymetadata');
var $ = require('jquery');
var keenClient = require('./keen').client;

exports.handleMicrophone = function(token, model, mic, callback) {

  if (model.indexOf('Narrowband') > -1) {
    var err = new Error('Microphone transcription cannot accomodate narrowband models, please select another');
    callback(err, null);
    return false;
  }
  $.publish('clearscreen');

  // Test out websocket
  var baseString = '';
  var baseJSON = '';

  $.subscribe('showjson', function(data) {
    var $resultsJSON = $('#resultsJSON')
    $resultsJSON.empty();
    $resultsJSON.append(baseJSON);
  });

  var options = {};
  options.token = token;
  options.message = {
    'action': 'start',
    'content-type': 'audio/l16;rate=16000',
    'interim_results': true,
    'continuous': true,
    'word_confidence': true,
    'timestamps': true,
    'max_alternatives': 3,
    'inactivity_timeout': 600    
  };
  options.model = model;

  function onOpen(socket) {
    console.log('Mic socket: opened');
    callback(null, socket);
  }

  function onListening(socket) {

    mic.onAudio = function(blob) {
      if (socket.readyState < 2) {
        socket.send(blob)
      }
    };
  }

  var speech = {};
  speech.transcript = '';
  speech.words = [];
  function onMessage(msg, socket) {
    // console.log('Mic socket msg: ', msg);
    if (msg.results) {
      if (msg.results && msg.results[0] && msg.results[0].final) {
        var final_message = msg.results[0].alternatives[0];
        speech.transcript += final_message.transcript;
        for(var i = 0; i < final_message.word_confidence.length; ++i) {
          var next_word = {};
          next_word.text = final_message.word_confidence[i][0];
          next_word.confidence = final_message.word_confidence[i][1];
          var begin_time = final_message.timestamps[i][1];
          var end_time = final_message.timestamps[i][2];
          next_word.time = begin_time;
          next_word.duration = end_time - begin_time;
          speech.words.push(next_word);
        }
        // We don't need this -- it just updates the DOM with the incoming message
        // baseString = display.showResult(msg, baseString, model);
        // baseJSON = display.showJSON(msg, baseJSON);
      }
    }
  }

  function onError(r, socket) {
    console.log('Mic socket err: ', err);
  }

  function sendWordsToKeen(words) {
    if (!words || words.length == 0) {
      return;
    }

    var speech_id = words[0].speech_id;
    var multipleEvents = {
      "words": words
    };

    keenClient.addEvents(multipleEvents, function(err, res){
      if (err) {
        console.log('err', err);
      }
      else {
        var query = new Keen.Query("count", {
          eventCollection: "words",
          // filters: [{"operator":"eq","property_name":"speech_id","property_value":speech_id}],
          groupBy: "text",
          timeframe: "this_14_days",
          timezone: "UTC"
        });

        keenClient.draw(query, document.getElementById('grid-1-1'), {
          // Custom configuration here
        });

        $('#chart-container').css('display', 'block');
      }
    });
    // var api_key = '2fc76068ea39562a5e3c8f3ae5c10a0588bf074246861b36fa17150bd21dd01140ac051b2bae4ae1158e217857baf73112120d4f90a72b56e4c1c97d3f4b0e248b905427cfe8182552bac3b91ae72d7d062ab20412681ac39844918a4ca2d00c4075ae048030fe8fc95212774010db65';
    // var keen_url = 'https://api.keen.io/3.0/projects/5606f3f490e4bd7b0e0e1ddc/events/words';
    // $.ajax({
    //   url: keen_url,
    //   type: 'post',
    //   data: {
    //     'key': api_key
    //   },
    //   headers: {
    //     'Authorization': 'WRITE_KEY',
    //     'Content-Type': 'application/json'
    //   },
    //   dataType: 'json',
    //   success: function (response) {
    //     console.log('keen response', response);
    //   }
    // });
    // // $.post(keen_url, data, function(response) {
    // //   console.log('keen response', response);
    // // });
  }

  function onClose(evt) {
    // var salt = bcrypt.genSaltSync(10);
    // var hash = bcrypt.hashSync(speech.transcript, salt);
    var hash = '' + new Date();
    for(var i = 0; i < speech.words.length; ++i) {
      speech.words[i].speech_id = hash;
    }
    $('#resultsText').html(speech.transcript);
    sendWordsToKeen(speech.words);
    // console.log('Mic socket close: ', evt);
    // TODO: send stuff to keen io
  }

  initSocket(options, onOpen, onListening, onMessage, onError, onClose);
}