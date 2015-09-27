
'use strict';

var initSocket = require('./socket').initSocket;
var display = require('./views/displaymetadata');

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

  var speech_text = '';
  function onMessage(msg, socket) {
    // console.log('Mic socket msg: ', msg);
    if (msg.results) {
      if (msg.results && msg.results[0] && msg.results[0].final) {
        var final_message = msg.results[0].alternatives[0];
        speech_text += final_message.transcript;
        console.log(speech_text);

        // We don't need this -- it just updates the DOM with the incoming message
        // baseString = display.showResult(msg, baseString, model);
        // baseJSON = display.showJSON(msg, baseJSON);
      }
    }
  }

  function onError(r, socket) {
    console.log('Mic socket err: ', err);
  }

  function onClose(evt) {
    // console.log('Mic socket close: ', evt);
    // TODO: send stuff to keen io
  }

  initSocket(options, onOpen, onListening, onMessage, onError, onClose);
}