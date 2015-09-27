var $ = require('jquery');
var keenClient = require('./keen').client;
var timer = require('./timer.js')


var beganRecording;
var speech = {};
speech.transcript = '';
speech.words = [];
var hash = '' + new Date();
var timer = new timer();

exports.onMessage = function(msg) {
    // console.log('Mic socket msg: ', msg);
    $('#speech-container').css('display', 'block');
    if (msg.results) {
      if (msg.results && msg.results[0] && msg.results[0].final) {
        var final_message = msg.results[0].alternatives[0];
        speech.transcript += final_message.transcript;
        $('#resultsText').html(speech.transcript);
        for(var i = 0; i < final_message.word_confidence.length; ++i) {
          var next_word = {};
          next_word.text = final_message.word_confidence[i][0];
          next_word.confidence = final_message.word_confidence[i][1];
          var begin_time = final_message.timestamps[i][1];
          var end_time = final_message.timestamps[i][2];
          next_word.time = begin_time;
          next_word.duration = end_time - begin_time;
          next_word.speech_id = hash;
          keenClient.addEvent("words", next_word);
          speech.words.push(next_word);
        }
        // We don't need this -- it just updates the DOM with the incoming message
        // baseString = display.showResult(msg, baseString, model);
        // baseJSON = display.showJSON(msg, baseJSON);
      }
    }
}

function sendSpeechToKeen(speech) {
  var words = speech.words;
  var duration = speech.duration;

  if (!words || words.length == 0) {
    return;
  }

  var speech_id = words[0].speech_id;
  var multipleEvents = {
    "words": words
  };


  //// Pace ////
  var avgWpm = 150;
  var yourWpm = Math.round(words.length / (duration / 60 / 1000));
  var paceNotes = '';
  if (yourWpm < avgWpm && Math.abs(yourWpm - avgWpm) > 20) {
    paceNotes = 'Speed up!';
  } else if (yourWpm > avgWpm && Math.abs(yourWpm - avgWpm) > 20) {
    paceNotes = 'Slow down!';
  } else {
    paceNotes = 'Keep up the pace!';
  }
  $('#your-pace-chart-notes').html(paceNotes);

  new Keen.Dataviz()
    .el(document.getElementById("your-pace"))
    .parseRawData({result: yourWpm})
    .chartType('metric')
    .title('words per minute')
    .colors(['#437f97'])
    .height(300)
    .render();


  $('#loading-bar').css('display', 'none');
  $('#chart-container').css('display', 'block');

  new Keen.Dataviz()
    .el(document.getElementById("average-pace"))
    .parseRawData({result: avgWpm})
    .chartType('metric')
    .title('words per minute')
    .colors(['#437f97'])
    .height(300)
    .render();

  $('#chart-container').css('display', 'block');

  $('#loading-bar').css('display', 'block');
  setTimeout(function() {
    //// Word frequency graph ////
    var query = new Keen.Query("count", {
      eventCollection: "words",
      filters: [{"operator":"eq","property_name":"speech_id","property_value":speech_id}],
      groupBy: "text",
      timeframe: "this_14_days",
      timezone: "UTC"
    });

    keenClient.draw(query, document.getElementById('grid-1-1'), {
      // Custom configuration here
      chartType: "columnchart",
      height: 500,
      width: 'auto',
      chartOptions: {
        isStacked: true
      }
    });
    $('#wordFreq').css('display','block');
    $('#loading-bar').css('display', 'none');
  }, 15000);
}

exports.onClose = function() {
  timer.stop();
  var stoppedRecording = new Date();
  speech.duration = stoppedRecording - beganRecording;
  $('#resultsText').html(speech.transcript);
  sendSpeechToKeen(speech);
}

exports.onOpen = function(socket) {
    beganRecording = new Date();
    timer.start();
    timer.addEventListener('secondsUpdated', function(e) {
      $('#timer').html(timer.getTimeValues().toString());
    });
}
