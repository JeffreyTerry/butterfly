(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var utils = require('./utils');
/**
 * Captures microphone input from the browser.
 * Works at least on latest versions of Firefox and Chrome
 */
function Microphone(_options) {
  var options = _options || {};

  // we record in mono because the speech recognition service
  // does not support stereo.
  this.bufferSize = options.bufferSize || 8192;
  this.inputChannels = options.inputChannels || 1;
  this.outputChannels = options.outputChannels || 1;
  this.recording = false;
  this.requestedAccess = false;
  this.sampleRate = 16000;
  // auxiliar buffer to keep unused samples (used when doing downsampling)
  this.bufferUnusedSamples = new Float32Array(0);

  // Chrome or Firefox or IE User media
  if (!navigator.getUserMedia) {
    navigator.getUserMedia = navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;
  }

}

/**
 * Called when the user reject the use of the michrophone
 * @param  error The error
 */
Microphone.prototype.onPermissionRejected = function() {
  console.log('Microphone.onPermissionRejected()');
  this.requestedAccess = false;
  this.onError('Permission to access the microphone rejeted.');
};

Microphone.prototype.onError = function(error) {
  console.log('Microphone.onError():', error);
};

/**
 * Called when the user authorizes the use of the microphone.
 * @param  {Object} stream The Stream to connect to
 *
 */
Microphone.prototype.onMediaStream =  function(stream) {
  var AudioCtx = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtx)
    throw new Error('AudioContext not available');

  if (!this.audioContext)
    this.audioContext = new AudioCtx();

  var gain = this.audioContext.createGain();
  var audioInput = this.audioContext.createMediaStreamSource(stream);

  audioInput.connect(gain);

  this.mic = this.audioContext.createScriptProcessor(this.bufferSize,
    this.inputChannels, this.outputChannels);

  // uncomment the following line if you want to use your microphone sample rate
  //this.sampleRate = this.audioContext.sampleRate;
  console.log('Microphone.onMediaStream(): sampling rate is:', this.sampleRate);

  this.mic.onaudioprocess = this._onaudioprocess.bind(this);
  this.stream = stream;

  gain.connect(this.mic);
  this.mic.connect(this.audioContext.destination);
  this.recording = true;
  this.requestedAccess = false;
  this.onStartRecording();
};

/**
 * callback that is being used by the microphone
 * to send audio chunks.
 * @param  {object} data audio
 */
Microphone.prototype._onaudioprocess = function(data) {
  if (!this.recording) {
    // We speak but we are not recording
    return;
  }

  // Single channel
  var chan = data.inputBuffer.getChannelData(0);  
  
  //resampler(this.audioContext.sampleRate,data.inputBuffer,this.onAudio);

  this.onAudio(this._exportDataBufferTo16Khz(new Float32Array(chan)));

  //export with microphone mhz, remember to update the this.sampleRate
  // with the sample rate from your microphone
  // this.onAudio(this._exportDataBuffer(new Float32Array(chan)));

};

/**
 * Start the audio recording
 */
Microphone.prototype.record = function() {
  if (!navigator.getUserMedia){
    this.onError('Browser doesn\'t support microphone input');
    return;
  }
  if (this.requestedAccess) {
    return;
  }

  this.requestedAccess = true;
  navigator.getUserMedia({ audio: true },
    this.onMediaStream.bind(this), // Microphone permission granted
    this.onPermissionRejected.bind(this)); // Microphone permission rejected
};

/**
 * Stop the audio recording
 */
Microphone.prototype.stop = function() {
  if (!this.recording)
    return;
  this.recording = false;
  this.stream.stop();
  this.requestedAccess = false;
  this.mic.disconnect(0);
  this.mic = null;
  this.onStopRecording();
};

/**
 * Creates a Blob type: 'audio/l16' with the chunk and downsampling to 16 kHz
 * coming from the microphone.
 * Explanation for the math: The raw values captured from the Web Audio API are
 * in 32-bit Floating Point, between -1 and 1 (per the specification).
 * The values for 16-bit PCM range between -32768 and +32767 (16-bit signed integer).
 * Multiply to control the volume of the output. We store in little endian.
 * @param  {Object} buffer Microphone audio chunk
 * @return {Blob} 'audio/l16' chunk
 * @deprecated This method is depracated
 */
Microphone.prototype._exportDataBufferTo16Khz = function(bufferNewSamples) {
  var buffer = null,
    newSamples = bufferNewSamples.length,
    unusedSamples = this.bufferUnusedSamples.length;   
    

  if (unusedSamples > 0) {
    buffer = new Float32Array(unusedSamples + newSamples);
    for (var i = 0; i < unusedSamples; ++i) {
      buffer[i] = this.bufferUnusedSamples[i];
    }
    for (i = 0; i < newSamples; ++i) {
      buffer[unusedSamples + i] = bufferNewSamples[i];
    }
  } else {
    buffer = bufferNewSamples;
  }

  // downsampling variables
  var filter = [
      -0.037935, -0.00089024, 0.040173, 0.019989, 0.0047792, -0.058675, -0.056487,
      -0.0040653, 0.14527, 0.26927, 0.33913, 0.26927, 0.14527, -0.0040653, -0.056487,
      -0.058675, 0.0047792, 0.019989, 0.040173, -0.00089024, -0.037935
    ],
    samplingRateRatio = this.audioContext.sampleRate / 16000,
    nOutputSamples = Math.floor((buffer.length - filter.length) / (samplingRateRatio)) + 1,
    pcmEncodedBuffer16k = new ArrayBuffer(nOutputSamples * 2),
    dataView16k = new DataView(pcmEncodedBuffer16k),
    index = 0,
    volume = 0x7FFF, //range from 0 to 0x7FFF to control the volume
    nOut = 0;

  for (var i = 0; i + filter.length - 1 < buffer.length; i = Math.round(samplingRateRatio * nOut)) {
    var sample = 0;
    for (var j = 0; j < filter.length; ++j) {
      sample += buffer[i + j] * filter[j];
    }
    sample *= volume;
    dataView16k.setInt16(index, sample, true); // 'true' -> means little endian
    index += 2;
    nOut++;
  }

  var indexSampleAfterLastUsed = Math.round(samplingRateRatio * nOut);
  var remaining = buffer.length - indexSampleAfterLastUsed;
  if (remaining > 0) {
    this.bufferUnusedSamples = new Float32Array(remaining);
    for (i = 0; i < remaining; ++i) {
      this.bufferUnusedSamples[i] = buffer[indexSampleAfterLastUsed + i];
    }
  } else {
    this.bufferUnusedSamples = new Float32Array(0);
  }

  return new Blob([dataView16k], {
    type: 'audio/l16'
  });
  };

  
  
// native way of resampling captured audio
var resampler = function(sampleRate, audioBuffer, callbackProcessAudio) {
	
	console.log("length: " + audioBuffer.length + " " + sampleRate);
	var channels = 1; 
	var targetSampleRate = 16000;
   var numSamplesTarget = audioBuffer.length * targetSampleRate / sampleRate;

   var offlineContext = new OfflineAudioContext(channels, numSamplesTarget, targetSampleRate);
   var bufferSource = offlineContext.createBufferSource();
   bufferSource.buffer = audioBuffer;

	// callback that is called when the resampling finishes
   offlineContext.oncomplete = function(event) {   	
      var samplesTarget = event.renderedBuffer.getChannelData(0);                                       
      console.log('Done resampling: ' + samplesTarget.length + " samples produced");  

		// convert from [-1,1] range of floating point numbers to [-32767,32767] range of integers
		var index = 0;
		var volume = 0x7FFF;
  		var pcmEncodedBuffer = new ArrayBuffer(samplesTarget.length*2);    // short integer to byte
  		var dataView = new DataView(pcmEncodedBuffer);
      for (var i = 0; i < samplesTarget.length; i++) {
    		dataView.setInt16(index, samplesTarget[i]*volume, true);
    		index += 2;
  		}

      // l16 is the MIME type for 16-bit PCM
      callbackProcessAudio(new Blob([dataView], { type: 'audio/l16' }));         
   };

   bufferSource.connect(offlineContext.destination);
   bufferSource.start(0);
   offlineContext.startRendering();   
};
 
  

/**
 * Creates a Blob type: 'audio/l16' with the
 * chunk coming from the microphone.
 */
var exportDataBuffer = function(buffer, bufferSize) {
  var pcmEncodedBuffer = null,
    dataView = null,
    index = 0,
    volume = 0x7FFF; //range from 0 to 0x7FFF to control the volume

  pcmEncodedBuffer = new ArrayBuffer(bufferSize * 2);
  dataView = new DataView(pcmEncodedBuffer);

  /* Explanation for the math: The raw values captured from the Web Audio API are
   * in 32-bit Floating Point, between -1 and 1 (per the specification).
   * The values for 16-bit PCM range between -32768 and +32767 (16-bit signed integer).
   * Multiply to control the volume of the output. We store in little endian.
   */
  for (var i = 0; i < buffer.length; i++) {
    dataView.setInt16(index, buffer[i] * volume, true);
    index += 2;
  }

  // l16 is the MIME type for 16-bit PCM
  return new Blob([dataView], { type: 'audio/l16' });
};

Microphone.prototype._exportDataBuffer = function(buffer){
  utils.exportDataBuffer(buffer, this.bufferSize);
}; 


// Functions used to control Microphone events listeners.
Microphone.prototype.onStartRecording =  function() {};
Microphone.prototype.onStopRecording =  function() {};
Microphone.prototype.onAudio =  function() {};

module.exports = Microphone;


},{"./utils":7}],2:[function(require,module,exports){
module.exports={
   "models": [
      {
         "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/en-US_BroadbandModel", 
         "rate": 16000, 
         "name": "en-US_BroadbandModel", 
         "language": "en-US", 
         "description": "US English broadband model (16KHz)"
      }, 
      {
         "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/en-US_NarrowbandModel", 
         "rate": 8000, 
         "name": "en-US_NarrowbandModel", 
         "language": "en-US", 
         "description": "US English narrowband model (8KHz)"
      },
      {
         "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/es-ES_BroadbandModel", 
         "rate": 16000, 
         "name": "es-ES_BroadbandModel", 
         "language": "es-ES", 
         "description": "Spanish broadband model (16KHz)"
      }, 
      {
         "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/es-ES_NarrowbandModel", 
         "rate": 8000, 
         "name": "es-ES_NarrowbandModel", 
         "language": "es-ES", 
         "description": "Spanish narrowband model (8KHz)"
      }, 
      {
         "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/ja-JP_BroadbandModel", 
         "rate": 16000, 
         "name": "ja-JP_BroadbandModel", 
         "language": "ja-JP", 
         "description": "Japanese broadband model (16KHz)"
      }, 
      {
         "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/ja-JP_NarrowbandModel", 
         "rate": 8000, 
         "name": "ja-JP_NarrowbandModel", 
         "language": "ja-JP", 
         "description": "Japanese narrowband model (8KHz)"
      },
      {
         "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/pt-BR_BroadbandModel", 
         "rate": 16000, 
         "name": "pt-BR_BroadbandModel", 
         "language": "pt-BR", 
         "description": "Brazilian Portuguese broadband model (16KHz)"
      }, 
      {
         "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/pt-BR_NarrowbandModel", 
         "rate": 8000, 
         "name": "pt-BR_NarrowbandModel", 
         "language": "pt-BR", 
         "description": "Brazilian Portuguese narrowband model (8KHz)"
      },
      {
         "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/zh-CN_BroadbandModel", 
         "rate": 16000, 
         "name": "zh-CN_BroadbandModel", 
         "language": "zh-CN", 
         "description": "Mandarin broadband model (16KHz)"
      },     
      {
         "url": "https://stream.watsonplatform.net/speech-to-text/api/v1/models/zh-CN_NarrowbandModel", 
         "rate": 8000, 
         "name": "zh-CN_NarrowbandModel", 
         "language": "zh-CN", 
         "description": "Mandarin narrowband model (8KHz)"
      }      
   ]
}

},{}],3:[function(require,module,exports){

var effects = require('./views/effects');
var display = require('./views/displaymetadata');
var hideError = require('./views/showerror').hideError;
var initSocket = require('./socket').initSocket;

exports.handleFileUpload = function(token, model, file, contentType, callback, onend) {

    // Set currentlyDisplaying to prevent other sockets from opening
    localStorage.setItem('currentlyDisplaying', true);

    // $('#progressIndicator').css('visibility', 'visible');

    $.subscribe('progress', function(evt, data) {
      console.log('progress: ', data);
    });

    console.log('contentType', contentType);

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
      'content-type': contentType,
      'interim_results': true,
      'continuous': true,
      'word_confidence': true,
      'timestamps': true,
      'max_alternatives': 3,
      'inactivity_timeout': 600
    };
    options.model = model;

    function onOpen(socket) {
      console.log('Socket opened');
    }

    function onListening(socket) {
      console.log('Socket listening');
      callback(socket);
    }

    function onMessage(msg) {
      if (msg.results) {
        // Convert to closure approach
        baseString = display.showResult(msg, baseString, model);
        baseJSON = display.showJSON(msg, baseJSON);
      }
    }

    function onError(evt) {
      localStorage.setItem('currentlyDisplaying', false);
      onend(evt);
      console.log('Socket err: ', evt.code);
    }

    function onClose(evt) {
      localStorage.setItem('currentlyDisplaying', false);
      onend(evt);
      console.log('Socket closing: ', evt);
    }

    initSocket(options, onOpen, onListening, onMessage, onError, onClose);
}


},{"./socket":6,"./views/displaymetadata":9,"./views/effects":11,"./views/showerror":18}],4:[function(require,module,exports){

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
},{"./socket":6,"./views/displaymetadata":9}],5:[function(require,module,exports){
/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global $:false */

'use strict';

var Microphone = require('./Microphone');
var models = require('./data/models.json').models;
var utils = require('./utils');
utils.initPubSub();
var initViews = require('./views').initViews;

window.BUFFERSIZE = 8192;

$(document).ready(function() {

  // Make call to API to try and get token
  utils.getToken(function(token) {

    window.onbeforeunload = function(e) {
      localStorage.clear();
    };

    if (!token) {
      console.error('No authorization token available');
      console.error('Attempting to reconnect...');
    }

    var viewContext = {
      currentModel: 'en-US_BroadbandModel',
      models: models,
      token: token,
      bufferSize: BUFFERSIZE
    };

    initViews(viewContext);

    // Save models to localstorage
    localStorage.setItem('models', JSON.stringify(models));

    // Set default current model
    localStorage.setItem('currentModel', 'en-US_BroadbandModel');
    localStorage.setItem('sessionPermissions', 'true');


    $.subscribe('clearscreen', function() {
      $('#resultsText').text('');
      $('#resultsJSON').text('');
      $('.error-row').hide();
      $('.notification-row').hide();
      $('.hypotheses > ul').empty();
      $('#metadataTableBody').empty();
    });

  });

});

},{"./Microphone":1,"./data/models.json":2,"./utils":7,"./views":13}],6:[function(require,module,exports){
/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global $:false */


var utils = require('./utils');
var Microphone = require('./Microphone');
var showerror = require('./views/showerror');
var showError = showerror.showError;
var hideError = showerror.hideError;

// Mini WS callback API, so we can initialize
// with model and token in URI, plus
// start message

// Initialize closure, which holds maximum getToken call count
var tokenGenerator = utils.createTokenGenerator();

var initSocket = exports.initSocket = function(options, onopen, onlistening, onmessage, onerror, onclose) {
  var listening;
  function withDefault(val, defaultVal) {
    return typeof val === 'undefined' ? defaultVal : val;
  }
  var socket;
  var token = options.token;
  var model = options.model || localStorage.getItem('currentModel');
  var message = options.message || {'action': 'start'};
  var sessionPermissions = withDefault(options.sessionPermissions, JSON.parse(localStorage.getItem('sessionPermissions')));
  var sessionPermissionsQueryParam = sessionPermissions ? '0' : '1';
  var url = options.serviceURI || 'wss://stream.watsonplatform.net/speech-to-text/api/v1/recognize?watson-token='
    + token
    + '&X-WDC-PL-OPT-OUT=' + sessionPermissionsQueryParam
    + '&model=' + model;
  console.log('URL model', model);
  try {
    socket = new WebSocket(url);
  } catch(err) {
    console.error('WS connection error: ', err);
  }
  socket.onopen = function(evt) {
    listening = false;
    $.subscribe('hardsocketstop', function(data) {
      console.log('MICROPHONE: close.');
      socket.send(JSON.stringify({action:'stop'}));
    });
    $.subscribe('socketstop', function(data) {
      console.log('MICROPHONE: close.');
      socket.close();
    });
    socket.send(JSON.stringify(message));
    onopen(socket);
  };
  socket.onmessage = function(evt) {
    var msg = JSON.parse(evt.data);
    if (msg.error) {
      showError(msg.error);
      $.publish('hardsocketstop');
      return;
    }
    if (msg.state === 'listening') {
      // Early cut off, without notification
      if (!listening) {
        onlistening(socket);
        listening = true;
      } else {
        console.log('MICROPHONE: Closing socket.');
        socket.close();
      }
    }
    onmessage(msg, socket);
  };

  socket.onerror = function(evt) {
    console.log('WS onerror: ', evt);
    showError('Application error ' + evt.code + ': please refresh your browser and try again');
    $.publish('clearscreen');
    onerror(evt);
  };

  socket.onclose = function(evt) {
    console.log('WS onclose: ', evt);
    if (evt.code === 1006) {
      // Authentication error, try to reconnect
      console.log('generator count', tokenGenerator.getCount());
      if (tokenGenerator.getCount() > 1) {
        $.publish('hardsocketstop');
        throw new Error("No authorization token is currently available");
      }
      tokenGenerator.getToken(function(token, err) {
        if (err) {
          $.publish('hardsocketstop');
          return false;
        }
        console.log('Fetching additional token...');
        options.token = token;
        initSocket(options, onopen, onlistening, onmessage, onerror, onclose);
      });
      return false;
    }
    if (evt.code === 1011) {
      console.error('Server error ' + evt.code + ': please refresh your browser and try again');
      return false;
    }
    if (evt.code > 1000) {
      console.error('Server error ' + evt.code + ': please refresh your browser and try again');
      // showError('Server error ' + evt.code + ': please refresh your browser and try again');
      return false;
    }
    // Made it through, normal close
    $.unsubscribe('hardsocketstop');
    $.unsubscribe('socketstop');
    onclose(evt);
  };

}
},{"./Microphone":1,"./utils":7,"./views/showerror":18}],7:[function(require,module,exports){
(function (global){

// For non-view logic
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var fileBlock = function(_offset, length, _file, readChunk) {
  var r = new FileReader();
  var blob = _file.slice(_offset, length + _offset);
  r.onload = readChunk;
  r.readAsArrayBuffer(blob);
}

// Based on alediaferia's SO response
// http://stackoverflow.com/questions/14438187/javascript-filereader-parsing-long-file-in-chunks
exports.onFileProgress = function(options, ondata, onerror, onend, samplingRate) {
  var file       = options.file;
  var fileSize   = file.size;
  var chunkSize  = options.bufferSize || 16000;  // in bytes
  var offset     = 0;
  var readChunk = function(evt) {
    if (offset >= fileSize) {
      console.log("Done reading file");
      onend();
      return;
    }
    if (evt.target.error == null) {
      var buffer = evt.target.result;
      var len = buffer.byteLength;
      offset += len;
      console.log("sending: " + len)
      ondata(buffer); // callback for handling read chunk
    } else {
      var errorMessage = evt.target.error;
      console.log("Read error: " + errorMessage);
      onerror(errorMessage);
      return;
    }
    // use this timeout to pace the data upload for the playSample case, the idea is that the hyps do not arrive before the audio is played back
    if (samplingRate) {
    	console.log("samplingRate: " +  samplingRate + " timeout: " + (chunkSize*1000)/(samplingRate*2))
    	setTimeout(function() { fileBlock(offset, chunkSize, file, readChunk); }, (chunkSize*1000)/(samplingRate*2));
    } else {
      fileBlock(offset, chunkSize, file, readChunk);
    }
  }
  fileBlock(offset, chunkSize, file, readChunk);
}

exports.createTokenGenerator = function() {
  // Make call to API to try and get token
  var hasBeenRunTimes = 0;
  return {
    getToken: function(callback) {
    ++hasBeenRunTimes;
    if (hasBeenRunTimes > 5) {
      var err = new Error('Cannot reach server');
      callback(null, err);
      return;
    }
    var url = '/token';
    var tokenRequest = new XMLHttpRequest();
    tokenRequest.open("GET", url, true);
    tokenRequest.onload = function(evt) {
      var token = tokenRequest.responseText;
      callback(token);
    };
    tokenRequest.send();
    },
    getCount: function() { return hasBeenRunTimes; }
  }
};

exports.getToken = (function() {
  // Make call to API to try and get token
  var hasBeenRunTimes = 0;
  return function(callback) {
    hasBeenRunTimes++
    if (hasBeenRunTimes > 5) {
      var err = new Error('Cannot reach server');
      callback(null, err);
      return;
    }
    var url = '/token';
    var tokenRequest = new XMLHttpRequest();
    tokenRequest.open("GET", url, true);
    tokenRequest.onload = function(evt) {
      var token = tokenRequest.responseText;
      callback(token);
    };
    tokenRequest.send();
  }
})();

exports.initPubSub = function() {
  var o         = $({});
  $.subscribe   = o.on.bind(o);
  $.unsubscribe = o.off.bind(o);
  $.publish     = o.trigger.bind(o);
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){


exports.initAnimatePanel = function() {
  $('.panel-heading span.clickable').on("click", function (e) {
    if ($(this).hasClass('panel-collapsed')) {
      // expand the panel
      $(this).parents('.panel').find('.panel-body').slideDown();
      $(this).removeClass('panel-collapsed');
      $(this).find('i').removeClass('caret-down').addClass('caret-up');
    }
    else {
      // collapse the panel
      $(this).parents('.panel').find('.panel-body').slideUp();
      $(this).addClass('panel-collapsed');
      $(this).find('i').removeClass('caret-up').addClass('caret-down');
    }
  });
}


},{}],9:[function(require,module,exports){
(function (global){
'use strict';

var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var scrolled = false,
    textScrolled = false;

var showTimestamp = function(timestamps, confidences) {
  var word = timestamps[0],
      t0 = timestamps[1],
      t1 = timestamps[2];
  var timelength = t1 - t0;
  // Show confidence if defined, else 'n/a'
  var displayConfidence = confidences ? confidences[1].toString().substring(0, 3) : 'n/a';
  $('#metadataTable > tbody:last-child').append(
      '<tr>'
      + '<td>' + word + '</td>'
      + '<td>' + t0 + '</td>'
      + '<td>' + t1 + '</td>'
      + '<td>' + displayConfidence + '</td>'
      + '</tr>'
      );
}


var showMetaData = function(alternative) {
  var confidenceNestedArray = alternative.word_confidence;;
  var timestampNestedArray = alternative.timestamps;
  if (confidenceNestedArray && confidenceNestedArray.length > 0) {
    for (var i = 0; i < confidenceNestedArray.length; i++) {
      var timestamps = timestampNestedArray[i];
      var confidences = confidenceNestedArray[i];
      showTimestamp(timestamps, confidences);
    }
    return;
  } else {
    if (timestampNestedArray && timestampNestedArray.length > 0) {
      timestampNestedArray.forEach(function(timestamp) {
        showTimestamp(timestamp);
      });
    }
  }
}

var Alternatives = function(){

  var stringOne = '',
    stringTwo = '',
    stringThree = '';

  this.clearString = function() {
    stringOne = '';
    stringTwo = '';
    stringThree = '';
  };

  this.showAlternatives = function(alternatives, isFinal, testing) {
    var $hypotheses = $('.hypotheses ol');
    $hypotheses.empty();
    // $hypotheses.append($('</br>'));
    alternatives.forEach(function(alternative, idx) {
      var $alternative;
      if (alternative.transcript) {
        var transcript = alternative.transcript.replace(/%HESITATION\s/g, '');
        transcript = transcript.replace(/(.)\1{2,}/g, '');
        switch (idx) {
          case 0:
            stringOne = stringOne + transcript;
            $alternative = $('<li data-hypothesis-index=' + idx + ' >' + stringOne + '</li>');
            break;
          case 1:
            stringTwo = stringTwo + transcript;
            $alternative = $('<li data-hypothesis-index=' + idx + ' >' + stringTwo + '</li>');
            break;
          case 2:
            stringThree = stringThree + transcript;
            $alternative = $('<li data-hypothesis-index=' + idx + ' >' + stringThree + '</li>');
            break;
        }
        $hypotheses.append($alternative);
      }
    });
  };
}

var alternativePrototype = new Alternatives();


// TODO: Convert to closure approach
/*var processString = function(baseString, isFinished) {

  if (isFinished) {
    var formattedString = baseString.slice(0, -1);
    formattedString = formattedString.charAt(0).toUpperCase() + formattedString.substring(1);
    formattedString = formattedString.trim() + '. ';
    $('#resultsText').val(formattedString);
    return formattedString;
  } else {
    $('#resultsText').val(baseString);
    return baseString;
  }
}*/

exports.showJSON = function(msg, baseJSON) {
  
   var json = JSON.stringify(msg, null, 2);
    baseJSON += json;
    baseJSON += '\n';                                                          

  if ($('.nav-tabs .active').text() == "JSON") {
      $('#resultsJSON').append(baseJSON);
      baseJSON = "";
      console.log("updating json");
  }
  
  return baseJSON;
}

function updateTextScroll(){
  if(!scrolled){
    var element = $('#resultsText').get(0);
    element.scrollTop = element.scrollHeight;
  }
}

var initTextScroll = function() {
  $('#resultsText').on('scroll', function(){
      textScrolled = true;
  });
}

function updateScroll(){
  if(!scrolled){
    var element = $('.table-scroll').get(0);
    element.scrollTop = element.scrollHeight;
  }
}

var initScroll = function() {
  $('.table-scroll').on('scroll', function(){
      scrolled=true;
  });
}

exports.initDisplayMetadata = function() {
  initScroll();
  initTextScroll();
};


exports.showResult = function(msg, baseString, model, callback) {

  var idx = +msg.result_index;

  if (msg.results && msg.results.length > 0) {

    var alternatives = msg.results[0].alternatives;
    var text = msg.results[0].alternatives[0].transcript || '';
    
    // apply mappings to beautify
    text = text.replace(/%HESITATION\s/g, '');
    text = text.replace(/(.)\1{2,}/g, '');
    if (msg.results[0].final)
       console.log("-> " + text + "\n");
    text = text.replace(/D_[^\s]+/g,'');
    
    // if all words are mapped to nothing then there is nothing else to do
    if ((text.length == 0) || (/^\s+$/.test(text))) {
    	 return baseString;
    }    	  
    
    // capitalize first word
    // if final results, append a new paragraph
    if (msg.results && msg.results[0] && msg.results[0].final) {
       text = text.slice(0, -1);
       text = text.charAt(0).toUpperCase() + text.substring(1);
       if ((model.substring(0,5) == "ja-JP") || (model.substring(0,5) == "zh-CN")) {        
          text = text.trim() + '。';
          text = text.replace(/ /g,'');      // remove whitespaces 
       } else {  
          text = text.trim() + '. ';
       }       
       baseString += text;
       $('#resultsText').val(baseString);
       showMetaData(alternatives[0]);
       // Only show alternatives if we're final
       alternativePrototype.showAlternatives(alternatives);
    } else {
       if ((model.substring(0,5) == "ja-JP") || (model.substring(0,5) == "zh-CN")) {        
          text = text.replace(/ /g,'');      // remove whitespaces     	         
       } else {
        	 text = text.charAt(0).toUpperCase() + text.substring(1);
       }
    	 $('#resultsText').val(baseString + text);    	 
    }
  }

  updateScroll();
  updateTextScroll();
  return baseString;
};

$.subscribe('clearscreen', function() {
  var $hypotheses = $('.hypotheses ul');
  scrolled = false;
  $hypotheses.empty();
  alternativePrototype.clearString();
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],10:[function(require,module,exports){

'use strict';

var handleSelectedFile = require('./fileupload').handleSelectedFile;

exports.initDragDrop = function(ctx) {

  var dragAndDropTarget = $(document);

  dragAndDropTarget.on('dragenter', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });

  dragAndDropTarget.on('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });

  dragAndDropTarget.on('drop', function (e) {
    console.log('File dropped');
    e.preventDefault();
    var evt = e.originalEvent;
    // Handle dragged file event
    handleFileUploadEvent(evt);
  });

  function handleFileUploadEvent(evt) {
    // Init file upload with default model
    var file = evt.dataTransfer.files[0];
    handleSelectedFile(ctx.token, file);
  }

}

},{"./fileupload":12}],11:[function(require,module,exports){



exports.flashSVG = function(el) {
  el.css({ fill: '#A53725' });
  function loop() {
    el.animate({ fill: '#A53725' },
        1000, 'linear')
      .animate({ fill: 'white' },
          1000, 'linear');
  }
  // return timer
  var timer = setTimeout(loop, 2000);
  return timer;
};

exports.stopFlashSVG = function(timer) {
  el.css({ fill: 'white' } );
  clearInterval(timer);
}

exports.toggleImage = function(el, name) {
  if(el.attr('src') === 'images/' + name + '.svg') {
    el.attr("src", 'images/stop-red.svg');
  } else {
    el.attr('src', 'images/stop.svg');
  }
}

var restoreImage = exports.restoreImage = function(el, name) {
  el.attr('src', 'images/' + name + '.svg');
}

exports.stopToggleImage = function(timer, el, name) {
  clearInterval(timer);
  restoreImage(el, name);
}

},{}],12:[function(require,module,exports){

'use strict';

var showError = require('./showerror').showError;
var showNotice = require('./showerror').showNotice;
var handleFileUpload = require('../handlefileupload').handleFileUpload;
var effects = require('./effects');
var utils = require('../utils');

// Need to remove the view logic here and move this out to the handlefileupload controller
var handleSelectedFile = exports.handleSelectedFile = (function() {

    var running = false;
    localStorage.setItem('currentlyDisplaying', false);

    return function(token, file) {

    var currentlyDisplaying = JSON.parse(localStorage.getItem('currentlyDisplaying'));

    // if (currentlyDisplaying) {
    //   showError('Currently another file is playing, please stop the file or wait until it finishes');
    //   return;
    // }

    $.publish('clearscreen');

    localStorage.setItem('currentlyDisplaying', true);
    running = true;

    // Visual effects
    var uploadImageTag = $('#fileUploadTarget > img');
    var timer = setInterval(effects.toggleImage, 750, uploadImageTag, 'stop');
    var uploadText = $('#fileUploadTarget > span');
    uploadText.text('Stop Transcribing');

    function restoreUploadTab() {
      clearInterval(timer);
      effects.restoreImage(uploadImageTag, 'upload');
      uploadText.text('Select File');
    }

    // Clear flashing if socket upload is stopped
    $.subscribe('hardsocketstop', function(data) {
      restoreUploadTab();
    });

    // Get current model
    var currentModel = localStorage.getItem('currentModel');
    console.log('currentModel', currentModel);

    // Read first 4 bytes to determine header
    var blobToText = new Blob([file]).slice(0, 4);
    var r = new FileReader();
    r.readAsText(blobToText);
    r.onload = function() {
      var contentType;
      if (r.result === 'fLaC') {
        contentType = 'audio/flac';
        showNotice('Notice: browsers do not support playing FLAC audio, so no audio will accompany the transcription');
      } else if (r.result === 'RIFF') {
        contentType = 'audio/wav';
        var audio = new Audio();
        var wavBlob = new Blob([file], {type: 'audio/wav'});
        var wavURL = URL.createObjectURL(wavBlob);
        audio.src = wavURL;
        audio.play();
        $.subscribe('hardsocketstop', function() {
          audio.pause();
          audio.currentTime = 0;
        });
      } else {
        restoreUploadTab();
        showError('Only WAV or FLAC files can be transcribed, please try another file format');
        return;
      }
      handleFileUpload(token, currentModel, file, contentType, function(socket) {
        var blob = new Blob([file]);
        var parseOptions = {
          file: blob
        };
        utils.onFileProgress(parseOptions,
          // On data chunk
          function(chunk) {
            socket.send(chunk);
          },
          // On file read error
          function(evt) {
            console.log('Error reading file: ', evt.message);
            showError('Error: ' + evt.message);
          },
          // On load end
          function() {
            socket.send(JSON.stringify({'action': 'stop'}));
          });
      }, 
        function(evt) {
          effects.stopToggleImage(timer, uploadImageTag, 'upload');
          uploadText.text('Select File');
          localStorage.setItem('currentlyDisplaying', false);
        }
      );
    };
  }
})();


exports.initFileUpload = function(ctx) {

  var fileUploadDialog = $("#fileUploadDialog");

  fileUploadDialog.change(function(evt) {
    var file = fileUploadDialog.get(0).files[0];
    handleSelectedFile(ctx.token, file);
  });

  $("#fileUploadTarget").click(function(evt) {

    var currentlyDisplaying = JSON.parse(localStorage.getItem('currentlyDisplaying'));

    if (currentlyDisplaying) {
      console.log('HARD SOCKET STOP');
      $.publish('hardsocketstop');
      localStorage.setItem('currentlyDisplaying', false);
      return;
    }

    fileUploadDialog.val(null);

    fileUploadDialog
    .trigger('click');

  });

}
},{"../handlefileupload":3,"../utils":7,"./effects":11,"./showerror":18}],13:[function(require,module,exports){

var initSessionPermissions = require('./sessionpermissions').initSessionPermissions;
var initSelectModel = require('./selectmodel').initSelectModel;
var initAnimatePanel = require('./animatepanel').initAnimatePanel;
var initShowTab = require('./showtab').initShowTab;
var initDragDrop = require('./dragdrop').initDragDrop;
var initPlaySample = require('./playsample').initPlaySample;
var initRecordButton = require('./recordbutton').initRecordButton;
var initFileUpload = require('./fileupload').initFileUpload;
var initDisplayMetadata = require('./displaymetadata').initDisplayMetadata;


exports.initViews = function(ctx) {
  console.log('Initializing views...');
  initSelectModel(ctx);
  initPlaySample(ctx);
  initDragDrop(ctx);
  initRecordButton(ctx);
  initFileUpload(ctx);
  initSessionPermissions();
  initShowTab();
  initAnimatePanel();
  initShowTab();
  initDisplayMetadata();
}

},{"./animatepanel":8,"./displaymetadata":9,"./dragdrop":10,"./fileupload":12,"./playsample":14,"./recordbutton":15,"./selectmodel":16,"./sessionpermissions":17,"./showtab":19}],14:[function(require,module,exports){

'use strict';

var utils = require('../utils');
var onFileProgress = utils.onFileProgress;
var handleFileUpload = require('../handlefileupload').handleFileUpload;
var initSocket = require('../socket').initSocket;
var showError = require('./showerror').showError;
var effects = require('./effects');


var LOOKUP_TABLE = {
  'en-US_BroadbandModel': ['Us_English_Broadband_Sample_1.wav', 'Us_English_Broadband_Sample_2.wav'],
  'en-US_NarrowbandModel': ['Us_English_Narrowband_Sample_1.wav', 'Us_English_Narrowband_Sample_2.wav'],
  'es-ES_BroadbandModel': ['Es_ES_spk24_16khz.wav', 'Es_ES_spk19_16khz.wav'],
  'es-ES_NarrowbandModel': ['Es_ES_spk24_8khz.wav', 'Es_ES_spk19_8khz.wav'],
  'ja-JP_BroadbandModel': ['sample-Ja_JP-wide1.wav', 'sample-Ja_JP-wide2.wav'],
  'ja-JP_NarrowbandModel': ['sample-Ja_JP-narrow3.wav', 'sample-Ja_JP-narrow4.wav'],
  'pt-BR_BroadbandModel': ['pt-BR_Sample1-16KHz.wav', 'pt-BR_Sample2-16KHz.wav'],
  'pt-BR_NarrowbandModel': ['pt-BR_Sample1-8KHz.wav', 'pt-BR_Sample2-8KHz.wav'],
  'zh-CN_BroadbandModel': ['zh-CN_sample1_for_16k.wav', 'zh-CN_sample2_for_16k.wav'],
  'zh-CN_NarrowbandModel': ['zh-CN_sample1_for_8k.wav', 'zh-CN_sample2_for_8k.wav']  
};

var playSample = (function() {

  var running = false;
  localStorage.setItem('currentlyDisplaying', false);

  return function(token, imageTag, iconName, url, callback) {

    $.publish('clearscreen');

    var currentlyDisplaying = JSON.parse(localStorage.getItem('currentlyDisplaying'));

    console.log('CURRENTLY DISPLAYING', currentlyDisplaying);

    // This error handling needs to be expanded to accomodate
    // the two different play samples files
    if (currentlyDisplaying) {
      console.log('HARD SOCKET STOP');
      $.publish('socketstop');
      localStorage.setItem('currentlyDisplaying', false);
      effects.stopToggleImage(timer, imageTag, iconName);
      effects.restoreImage(imageTag, iconName);
      running = false;
      return;
    }

    if (currentlyDisplaying && running) {
      showError('Currently another file is playing, please stop the file or wait until it finishes');
      return;
    }

    localStorage.setItem('currentlyDisplaying', true);
    running = true;
    
    $('#resultsText').val('');   // clear hypotheses from previous runs

    var timer = setInterval(effects.toggleImage, 750, imageTag, iconName);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
      var blob = xhr.response;
      var currentModel = localStorage.getItem('currentModel') || 'en-US_BroadbandModel';
      var reader = new FileReader();
      var blobToText = new Blob([blob]).slice(0, 4);
      reader.readAsText(blobToText);
      reader.onload = function() {
        var contentType = reader.result === 'fLaC' ? 'audio/flac' : 'audio/wav';
        console.log('Uploading file', reader.result);
        var mediaSourceURL = URL.createObjectURL(blob);
        var audio = new Audio();
        audio.src = mediaSourceURL;
        audio.play();
        $.subscribe('hardsocketstop', function() {
          audio.pause();
          audio.currentTime = 0;
        });
        $.subscribe('socketstop', function() {
          audio.pause();
          audio.currentTime = 0;
        });
        handleFileUpload(token, currentModel, blob, contentType, function(socket) {
          var parseOptions = {
            file: blob
          };
          var samplingRate = (currentModel.indexOf("Broadband") != -1) ? 16000 : 8000;
          onFileProgress(parseOptions,
            // On data chunk
            function(chunk) {
              socket.send(chunk);
            },
            // On file read error
            function(evt) {
              console.log('Error reading file: ', evt.message);
              // showError(evt.message);
            },
            // On load end
            function() {
              socket.send(JSON.stringify({'action': 'stop'}));
            },
            samplingRate
            );
        }, 
        // On connection end
          function(evt) {
            effects.stopToggleImage(timer, imageTag, iconName);
            effects.restoreImage(imageTag, iconName);
            localStorage.getItem('currentlyDisplaying', false);
          }
        );
      };
    };
    xhr.send();
  };
})();


exports.initPlaySample = function(ctx) {

  (function() {
    var fileName = 'audio/' + LOOKUP_TABLE[ctx.currentModel][0];
    var el = $('.play-sample-1');
    el.off('click');
    var iconName = 'play';
    var imageTag = el.find('img');
    el.click( function(evt) {
      playSample(ctx.token, imageTag, iconName, fileName, function(result) {
        console.log('Play sample result', result);
      });
    });
  })(ctx, LOOKUP_TABLE);

  (function() {
    var fileName = 'audio/' + LOOKUP_TABLE[ctx.currentModel][1];
    var el = $('.play-sample-2');
    el.off('click');
    var iconName = 'play';
    var imageTag = el.find('img');
    el.click( function(evt) {
      playSample(ctx.token, imageTag, iconName, fileName, function(result) {
        console.log('Play sample result', result);
      });
    });
  })(ctx, LOOKUP_TABLE);

};



},{"../handlefileupload":3,"../socket":6,"../utils":7,"./effects":11,"./showerror":18}],15:[function(require,module,exports){

'use strict';

var Microphone = require('../Microphone');
var handleMicrophone = require('../handlemicrophone').handleMicrophone;
var showError = require('./showerror').showError;
var showNotice = require('./showerror').showNotice;

exports.initRecordButton = function(ctx) {

  var recordButton = $('#recordButton');

  recordButton.click((function() {

    var running = false;
    var token = ctx.token;
    var micOptions = {
      bufferSize: ctx.buffersize
    };
    var mic = new Microphone(micOptions);

    return function(evt) {
      // Prevent default anchor behavior
      evt.preventDefault();

      var currentModel = localStorage.getItem('currentModel');
      var currentlyDisplaying = JSON.parse(localStorage.getItem('currentlyDisplaying'));

      if (currentlyDisplaying) {
        showError('Currently another file is playing, please stop the file or wait until it finishes');
        return;
      }

      if (!running) {
        $('#resultsText').val('');   // clear hypotheses from previous runs
        console.log('Not running, handleMicrophone()');
        handleMicrophone(token, currentModel, mic, function(err, socket) {
          if (err) {
            var msg = 'Error: ' + err.message;
            console.log(msg);
            showError(msg);
            running = false;
          } else {
            recordButton.css('background-color', '#d74108');
            recordButton.find('img').attr('src', 'images/stop.svg');
            console.log('starting mic');
            mic.record();
            running = true;
          }
        });        
      } else {
        console.log('Stopping microphone, sending stop action message');
        recordButton.removeAttr('style');
        recordButton.find('img').attr('src', 'images/microphone.svg');
        $.publish('hardsocketstop');
        mic.stop();
        running = false;
      }
    }
  })());
}
},{"../Microphone":1,"../handlemicrophone":4,"./showerror":18}],16:[function(require,module,exports){

var initPlaySample = require('./playsample').initPlaySample;

exports.initSelectModel = function(ctx) {

  function isDefault(model) {
    return model === 'en-US_BroadbandModel';
  }

  ctx.models.forEach(function(model) {
    $("#dropdownMenuList").append(
      $("<li>")
        .attr('role', 'presentation')
        .append(
          $('<a>').attr('role', 'menu-item')
            .attr('href', '/')
            .attr('data-model', model.name)
            .append(model.description)
          )
      )
  });

  $("#dropdownMenuList").click(function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    console.log('Change view', $(evt.target).text());
    var newModelDescription = $(evt.target).text();
    var newModel = $(evt.target).data('model');
    $('#dropdownMenuDefault').empty().text(newModelDescription);
    $('#dropdownMenu1').dropdown('toggle');
    localStorage.setItem('currentModel', newModel);
    ctx.currentModel = newModel;
    initPlaySample(ctx);
    $.publish('clearscreen');
  });

}
},{"./playsample":14}],17:[function(require,module,exports){

'use strict';

exports.initSessionPermissions = function() {
  console.log('Initializing session permissions handler');
  // Radio buttons
  var sessionPermissionsRadio = $("#sessionPermissionsRadioGroup input[type='radio']");
  sessionPermissionsRadio.click(function(evt) {
    var checkedValue = sessionPermissionsRadio.filter(':checked').val();
    console.log('checkedValue', checkedValue);
    localStorage.setItem('sessionPermissions', checkedValue);
  });
}

},{}],18:[function(require,module,exports){

'use strict';

exports.showError = function(msg) {
  console.log('Error: ', msg);
  var errorAlert = $('.error-row');
  errorAlert.hide();
  errorAlert.css('background-color', '#d74108');
  errorAlert.css('color', 'white');
  var errorMessage = $('#errorMessage');
  errorMessage.text(msg);
  errorAlert.show();
  $('#errorClose').click(function(e) {
    e.preventDefault();
    errorAlert.hide();
    return false;
  });
}

exports.showNotice = function(msg) {
  console.log('Notice: ', msg);
  var noticeAlert = $('.notification-row');
  noticeAlert.hide();
  noticeAlert.css('border', '2px solid #ececec');
  noticeAlert.css('background-color', '#f4f4f4');
  noticeAlert.css('color', 'black');
  var noticeMessage = $('#notificationMessage');
  noticeMessage.text(msg);
  noticeAlert.show();
  $('#notificationClose').click(function(e) {
    e.preventDefault();
    noticeAlert.hide();
    return false;
  });
}

exports.hideError = function() {
  var errorAlert = $('.error-row');
  errorAlert.hide();
}
},{}],19:[function(require,module,exports){

'use strict';

exports.initShowTab = function() {

  $('.nav-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    //show selected tab / active
    var target = $(e.target).text();
    if (target === 'JSON') {
      console.log('showing json');
      $.publish('showjson');
    }
  });

}
},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL01pY3JvcGhvbmUuanMiLCJzcmMvZGF0YS9tb2RlbHMuanNvbiIsInNyYy9oYW5kbGVmaWxldXBsb2FkLmpzIiwic3JjL2hhbmRsZW1pY3JvcGhvbmUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvc29ja2V0LmpzIiwic3JjL3V0aWxzLmpzIiwic3JjL3ZpZXdzL2FuaW1hdGVwYW5lbC5qcyIsInNyYy92aWV3cy9kaXNwbGF5bWV0YWRhdGEuanMiLCJzcmMvdmlld3MvZHJhZ2Ryb3AuanMiLCJzcmMvdmlld3MvZWZmZWN0cy5qcyIsInNyYy92aWV3cy9maWxldXBsb2FkLmpzIiwic3JjL3ZpZXdzL2luZGV4LmpzIiwic3JjL3ZpZXdzL3BsYXlzYW1wbGUuanMiLCJzcmMvdmlld3MvcmVjb3JkYnV0dG9uLmpzIiwic3JjL3ZpZXdzL3NlbGVjdG1vZGVsLmpzIiwic3JjL3ZpZXdzL3Nlc3Npb25wZXJtaXNzaW9ucy5qcyIsInNyYy92aWV3cy9zaG93ZXJyb3IuanMiLCJzcmMvdmlld3Mvc2hvd3RhYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTQgSUJNIENvcnAuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlICdMaWNlbnNlJyk7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuICdBUyBJUycgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuLyoqXG4gKiBDYXB0dXJlcyBtaWNyb3Bob25lIGlucHV0IGZyb20gdGhlIGJyb3dzZXIuXG4gKiBXb3JrcyBhdCBsZWFzdCBvbiBsYXRlc3QgdmVyc2lvbnMgb2YgRmlyZWZveCBhbmQgQ2hyb21lXG4gKi9cbmZ1bmN0aW9uIE1pY3JvcGhvbmUoX29wdGlvbnMpIHtcbiAgdmFyIG9wdGlvbnMgPSBfb3B0aW9ucyB8fCB7fTtcblxuICAvLyB3ZSByZWNvcmQgaW4gbW9ubyBiZWNhdXNlIHRoZSBzcGVlY2ggcmVjb2duaXRpb24gc2VydmljZVxuICAvLyBkb2VzIG5vdCBzdXBwb3J0IHN0ZXJlby5cbiAgdGhpcy5idWZmZXJTaXplID0gb3B0aW9ucy5idWZmZXJTaXplIHx8IDgxOTI7XG4gIHRoaXMuaW5wdXRDaGFubmVscyA9IG9wdGlvbnMuaW5wdXRDaGFubmVscyB8fCAxO1xuICB0aGlzLm91dHB1dENoYW5uZWxzID0gb3B0aW9ucy5vdXRwdXRDaGFubmVscyB8fCAxO1xuICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICB0aGlzLnJlcXVlc3RlZEFjY2VzcyA9IGZhbHNlO1xuICB0aGlzLnNhbXBsZVJhdGUgPSAxNjAwMDtcbiAgLy8gYXV4aWxpYXIgYnVmZmVyIHRvIGtlZXAgdW51c2VkIHNhbXBsZXMgKHVzZWQgd2hlbiBkb2luZyBkb3duc2FtcGxpbmcpXG4gIHRoaXMuYnVmZmVyVW51c2VkU2FtcGxlcyA9IG5ldyBGbG9hdDMyQXJyYXkoMCk7XG5cbiAgLy8gQ2hyb21lIG9yIEZpcmVmb3ggb3IgSUUgVXNlciBtZWRpYVxuICBpZiAoIW5hdmlnYXRvci5nZXRVc2VyTWVkaWEpIHtcbiAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhO1xuICB9XG5cbn1cblxuLyoqXG4gKiBDYWxsZWQgd2hlbiB0aGUgdXNlciByZWplY3QgdGhlIHVzZSBvZiB0aGUgbWljaHJvcGhvbmVcbiAqIEBwYXJhbSAgZXJyb3IgVGhlIGVycm9yXG4gKi9cbk1pY3JvcGhvbmUucHJvdG90eXBlLm9uUGVybWlzc2lvblJlamVjdGVkID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCdNaWNyb3Bob25lLm9uUGVybWlzc2lvblJlamVjdGVkKCknKTtcbiAgdGhpcy5yZXF1ZXN0ZWRBY2Nlc3MgPSBmYWxzZTtcbiAgdGhpcy5vbkVycm9yKCdQZXJtaXNzaW9uIHRvIGFjY2VzcyB0aGUgbWljcm9waG9uZSByZWpldGVkLicpO1xufTtcblxuTWljcm9waG9uZS5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uKGVycm9yKSB7XG4gIGNvbnNvbGUubG9nKCdNaWNyb3Bob25lLm9uRXJyb3IoKTonLCBlcnJvcik7XG59O1xuXG4vKipcbiAqIENhbGxlZCB3aGVuIHRoZSB1c2VyIGF1dGhvcml6ZXMgdGhlIHVzZSBvZiB0aGUgbWljcm9waG9uZS5cbiAqIEBwYXJhbSAge09iamVjdH0gc3RyZWFtIFRoZSBTdHJlYW0gdG8gY29ubmVjdCB0b1xuICpcbiAqL1xuTWljcm9waG9uZS5wcm90b3R5cGUub25NZWRpYVN0cmVhbSA9ICBmdW5jdGlvbihzdHJlYW0pIHtcbiAgdmFyIEF1ZGlvQ3R4ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuXG4gIGlmICghQXVkaW9DdHgpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdWRpb0NvbnRleHQgbm90IGF2YWlsYWJsZScpO1xuXG4gIGlmICghdGhpcy5hdWRpb0NvbnRleHQpXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9DdHgoKTtcblxuICB2YXIgZ2FpbiA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgdmFyIGF1ZGlvSW5wdXQgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZShzdHJlYW0pO1xuXG4gIGF1ZGlvSW5wdXQuY29ubmVjdChnYWluKTtcblxuICB0aGlzLm1pYyA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZVNjcmlwdFByb2Nlc3Nvcih0aGlzLmJ1ZmZlclNpemUsXG4gICAgdGhpcy5pbnB1dENoYW5uZWxzLCB0aGlzLm91dHB1dENoYW5uZWxzKTtcblxuICAvLyB1bmNvbW1lbnQgdGhlIGZvbGxvd2luZyBsaW5lIGlmIHlvdSB3YW50IHRvIHVzZSB5b3VyIG1pY3JvcGhvbmUgc2FtcGxlIHJhdGVcbiAgLy90aGlzLnNhbXBsZVJhdGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlO1xuICBjb25zb2xlLmxvZygnTWljcm9waG9uZS5vbk1lZGlhU3RyZWFtKCk6IHNhbXBsaW5nIHJhdGUgaXM6JywgdGhpcy5zYW1wbGVSYXRlKTtcblxuICB0aGlzLm1pYy5vbmF1ZGlvcHJvY2VzcyA9IHRoaXMuX29uYXVkaW9wcm9jZXNzLmJpbmQodGhpcyk7XG4gIHRoaXMuc3RyZWFtID0gc3RyZWFtO1xuXG4gIGdhaW4uY29ubmVjdCh0aGlzLm1pYyk7XG4gIHRoaXMubWljLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICB0aGlzLnJlY29yZGluZyA9IHRydWU7XG4gIHRoaXMucmVxdWVzdGVkQWNjZXNzID0gZmFsc2U7XG4gIHRoaXMub25TdGFydFJlY29yZGluZygpO1xufTtcblxuLyoqXG4gKiBjYWxsYmFjayB0aGF0IGlzIGJlaW5nIHVzZWQgYnkgdGhlIG1pY3JvcGhvbmVcbiAqIHRvIHNlbmQgYXVkaW8gY2h1bmtzLlxuICogQHBhcmFtICB7b2JqZWN0fSBkYXRhIGF1ZGlvXG4gKi9cbk1pY3JvcGhvbmUucHJvdG90eXBlLl9vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgaWYgKCF0aGlzLnJlY29yZGluZykge1xuICAgIC8vIFdlIHNwZWFrIGJ1dCB3ZSBhcmUgbm90IHJlY29yZGluZ1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFNpbmdsZSBjaGFubmVsXG4gIHZhciBjaGFuID0gZGF0YS5pbnB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTsgIFxuICBcbiAgLy9yZXNhbXBsZXIodGhpcy5hdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSxkYXRhLmlucHV0QnVmZmVyLHRoaXMub25BdWRpbyk7XG5cbiAgdGhpcy5vbkF1ZGlvKHRoaXMuX2V4cG9ydERhdGFCdWZmZXJUbzE2S2h6KG5ldyBGbG9hdDMyQXJyYXkoY2hhbikpKTtcblxuICAvL2V4cG9ydCB3aXRoIG1pY3JvcGhvbmUgbWh6LCByZW1lbWJlciB0byB1cGRhdGUgdGhlIHRoaXMuc2FtcGxlUmF0ZVxuICAvLyB3aXRoIHRoZSBzYW1wbGUgcmF0ZSBmcm9tIHlvdXIgbWljcm9waG9uZVxuICAvLyB0aGlzLm9uQXVkaW8odGhpcy5fZXhwb3J0RGF0YUJ1ZmZlcihuZXcgRmxvYXQzMkFycmF5KGNoYW4pKSk7XG5cbn07XG5cbi8qKlxuICogU3RhcnQgdGhlIGF1ZGlvIHJlY29yZGluZ1xuICovXG5NaWNyb3Bob25lLnByb3RvdHlwZS5yZWNvcmQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKXtcbiAgICB0aGlzLm9uRXJyb3IoJ0Jyb3dzZXIgZG9lc25cXCd0IHN1cHBvcnQgbWljcm9waG9uZSBpbnB1dCcpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGhpcy5yZXF1ZXN0ZWRBY2Nlc3MpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLnJlcXVlc3RlZEFjY2VzcyA9IHRydWU7XG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoeyBhdWRpbzogdHJ1ZSB9LFxuICAgIHRoaXMub25NZWRpYVN0cmVhbS5iaW5kKHRoaXMpLCAvLyBNaWNyb3Bob25lIHBlcm1pc3Npb24gZ3JhbnRlZFxuICAgIHRoaXMub25QZXJtaXNzaW9uUmVqZWN0ZWQuYmluZCh0aGlzKSk7IC8vIE1pY3JvcGhvbmUgcGVybWlzc2lvbiByZWplY3RlZFxufTtcblxuLyoqXG4gKiBTdG9wIHRoZSBhdWRpbyByZWNvcmRpbmdcbiAqL1xuTWljcm9waG9uZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMucmVjb3JkaW5nKVxuICAgIHJldHVybjtcbiAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZTtcbiAgdGhpcy5zdHJlYW0uc3RvcCgpO1xuICB0aGlzLnJlcXVlc3RlZEFjY2VzcyA9IGZhbHNlO1xuICB0aGlzLm1pYy5kaXNjb25uZWN0KDApO1xuICB0aGlzLm1pYyA9IG51bGw7XG4gIHRoaXMub25TdG9wUmVjb3JkaW5nKCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBCbG9iIHR5cGU6ICdhdWRpby9sMTYnIHdpdGggdGhlIGNodW5rIGFuZCBkb3duc2FtcGxpbmcgdG8gMTYga0h6XG4gKiBjb21pbmcgZnJvbSB0aGUgbWljcm9waG9uZS5cbiAqIEV4cGxhbmF0aW9uIGZvciB0aGUgbWF0aDogVGhlIHJhdyB2YWx1ZXMgY2FwdHVyZWQgZnJvbSB0aGUgV2ViIEF1ZGlvIEFQSSBhcmVcbiAqIGluIDMyLWJpdCBGbG9hdGluZyBQb2ludCwgYmV0d2VlbiAtMSBhbmQgMSAocGVyIHRoZSBzcGVjaWZpY2F0aW9uKS5cbiAqIFRoZSB2YWx1ZXMgZm9yIDE2LWJpdCBQQ00gcmFuZ2UgYmV0d2VlbiAtMzI3NjggYW5kICszMjc2NyAoMTYtYml0IHNpZ25lZCBpbnRlZ2VyKS5cbiAqIE11bHRpcGx5IHRvIGNvbnRyb2wgdGhlIHZvbHVtZSBvZiB0aGUgb3V0cHV0LiBXZSBzdG9yZSBpbiBsaXR0bGUgZW5kaWFuLlxuICogQHBhcmFtICB7T2JqZWN0fSBidWZmZXIgTWljcm9waG9uZSBhdWRpbyBjaHVua1xuICogQHJldHVybiB7QmxvYn0gJ2F1ZGlvL2wxNicgY2h1bmtcbiAqIEBkZXByZWNhdGVkIFRoaXMgbWV0aG9kIGlzIGRlcHJhY2F0ZWRcbiAqL1xuTWljcm9waG9uZS5wcm90b3R5cGUuX2V4cG9ydERhdGFCdWZmZXJUbzE2S2h6ID0gZnVuY3Rpb24oYnVmZmVyTmV3U2FtcGxlcykge1xuICB2YXIgYnVmZmVyID0gbnVsbCxcbiAgICBuZXdTYW1wbGVzID0gYnVmZmVyTmV3U2FtcGxlcy5sZW5ndGgsXG4gICAgdW51c2VkU2FtcGxlcyA9IHRoaXMuYnVmZmVyVW51c2VkU2FtcGxlcy5sZW5ndGg7ICAgXG4gICAgXG5cbiAgaWYgKHVudXNlZFNhbXBsZXMgPiAwKSB7XG4gICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSh1bnVzZWRTYW1wbGVzICsgbmV3U2FtcGxlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1bnVzZWRTYW1wbGVzOyArK2kpIHtcbiAgICAgIGJ1ZmZlcltpXSA9IHRoaXMuYnVmZmVyVW51c2VkU2FtcGxlc1tpXTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IG5ld1NhbXBsZXM7ICsraSkge1xuICAgICAgYnVmZmVyW3VudXNlZFNhbXBsZXMgKyBpXSA9IGJ1ZmZlck5ld1NhbXBsZXNbaV07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJ1ZmZlciA9IGJ1ZmZlck5ld1NhbXBsZXM7XG4gIH1cblxuICAvLyBkb3duc2FtcGxpbmcgdmFyaWFibGVzXG4gIHZhciBmaWx0ZXIgPSBbXG4gICAgICAtMC4wMzc5MzUsIC0wLjAwMDg5MDI0LCAwLjA0MDE3MywgMC4wMTk5ODksIDAuMDA0Nzc5MiwgLTAuMDU4Njc1LCAtMC4wNTY0ODcsXG4gICAgICAtMC4wMDQwNjUzLCAwLjE0NTI3LCAwLjI2OTI3LCAwLjMzOTEzLCAwLjI2OTI3LCAwLjE0NTI3LCAtMC4wMDQwNjUzLCAtMC4wNTY0ODcsXG4gICAgICAtMC4wNTg2NzUsIDAuMDA0Nzc5MiwgMC4wMTk5ODksIDAuMDQwMTczLCAtMC4wMDA4OTAyNCwgLTAuMDM3OTM1XG4gICAgXSxcbiAgICBzYW1wbGluZ1JhdGVSYXRpbyA9IHRoaXMuYXVkaW9Db250ZXh0LnNhbXBsZVJhdGUgLyAxNjAwMCxcbiAgICBuT3V0cHV0U2FtcGxlcyA9IE1hdGguZmxvb3IoKGJ1ZmZlci5sZW5ndGggLSBmaWx0ZXIubGVuZ3RoKSAvIChzYW1wbGluZ1JhdGVSYXRpbykpICsgMSxcbiAgICBwY21FbmNvZGVkQnVmZmVyMTZrID0gbmV3IEFycmF5QnVmZmVyKG5PdXRwdXRTYW1wbGVzICogMiksXG4gICAgZGF0YVZpZXcxNmsgPSBuZXcgRGF0YVZpZXcocGNtRW5jb2RlZEJ1ZmZlcjE2ayksXG4gICAgaW5kZXggPSAwLFxuICAgIHZvbHVtZSA9IDB4N0ZGRiwgLy9yYW5nZSBmcm9tIDAgdG8gMHg3RkZGIHRvIGNvbnRyb2wgdGhlIHZvbHVtZVxuICAgIG5PdXQgPSAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpICsgZmlsdGVyLmxlbmd0aCAtIDEgPCBidWZmZXIubGVuZ3RoOyBpID0gTWF0aC5yb3VuZChzYW1wbGluZ1JhdGVSYXRpbyAqIG5PdXQpKSB7XG4gICAgdmFyIHNhbXBsZSA9IDA7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBmaWx0ZXIubGVuZ3RoOyArK2opIHtcbiAgICAgIHNhbXBsZSArPSBidWZmZXJbaSArIGpdICogZmlsdGVyW2pdO1xuICAgIH1cbiAgICBzYW1wbGUgKj0gdm9sdW1lO1xuICAgIGRhdGFWaWV3MTZrLnNldEludDE2KGluZGV4LCBzYW1wbGUsIHRydWUpOyAvLyAndHJ1ZScgLT4gbWVhbnMgbGl0dGxlIGVuZGlhblxuICAgIGluZGV4ICs9IDI7XG4gICAgbk91dCsrO1xuICB9XG5cbiAgdmFyIGluZGV4U2FtcGxlQWZ0ZXJMYXN0VXNlZCA9IE1hdGgucm91bmQoc2FtcGxpbmdSYXRlUmF0aW8gKiBuT3V0KTtcbiAgdmFyIHJlbWFpbmluZyA9IGJ1ZmZlci5sZW5ndGggLSBpbmRleFNhbXBsZUFmdGVyTGFzdFVzZWQ7XG4gIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgdGhpcy5idWZmZXJVbnVzZWRTYW1wbGVzID0gbmV3IEZsb2F0MzJBcnJheShyZW1haW5pbmcpO1xuICAgIGZvciAoaSA9IDA7IGkgPCByZW1haW5pbmc7ICsraSkge1xuICAgICAgdGhpcy5idWZmZXJVbnVzZWRTYW1wbGVzW2ldID0gYnVmZmVyW2luZGV4U2FtcGxlQWZ0ZXJMYXN0VXNlZCArIGldO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLmJ1ZmZlclVudXNlZFNhbXBsZXMgPSBuZXcgRmxvYXQzMkFycmF5KDApO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBCbG9iKFtkYXRhVmlldzE2a10sIHtcbiAgICB0eXBlOiAnYXVkaW8vbDE2J1xuICB9KTtcbiAgfTtcblxuICBcbiAgXG4vLyBuYXRpdmUgd2F5IG9mIHJlc2FtcGxpbmcgY2FwdHVyZWQgYXVkaW9cbnZhciByZXNhbXBsZXIgPSBmdW5jdGlvbihzYW1wbGVSYXRlLCBhdWRpb0J1ZmZlciwgY2FsbGJhY2tQcm9jZXNzQXVkaW8pIHtcblx0XG5cdGNvbnNvbGUubG9nKFwibGVuZ3RoOiBcIiArIGF1ZGlvQnVmZmVyLmxlbmd0aCArIFwiIFwiICsgc2FtcGxlUmF0ZSk7XG5cdHZhciBjaGFubmVscyA9IDE7IFxuXHR2YXIgdGFyZ2V0U2FtcGxlUmF0ZSA9IDE2MDAwO1xuICAgdmFyIG51bVNhbXBsZXNUYXJnZXQgPSBhdWRpb0J1ZmZlci5sZW5ndGggKiB0YXJnZXRTYW1wbGVSYXRlIC8gc2FtcGxlUmF0ZTtcblxuICAgdmFyIG9mZmxpbmVDb250ZXh0ID0gbmV3IE9mZmxpbmVBdWRpb0NvbnRleHQoY2hhbm5lbHMsIG51bVNhbXBsZXNUYXJnZXQsIHRhcmdldFNhbXBsZVJhdGUpO1xuICAgdmFyIGJ1ZmZlclNvdXJjZSA9IG9mZmxpbmVDb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgYnVmZmVyU291cmNlLmJ1ZmZlciA9IGF1ZGlvQnVmZmVyO1xuXG5cdC8vIGNhbGxiYWNrIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIHJlc2FtcGxpbmcgZmluaXNoZXNcbiAgIG9mZmxpbmVDb250ZXh0Lm9uY29tcGxldGUgPSBmdW5jdGlvbihldmVudCkgeyAgIFx0XG4gICAgICB2YXIgc2FtcGxlc1RhcmdldCA9IGV2ZW50LnJlbmRlcmVkQnVmZmVyLmdldENoYW5uZWxEYXRhKDApOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ0RvbmUgcmVzYW1wbGluZzogJyArIHNhbXBsZXNUYXJnZXQubGVuZ3RoICsgXCIgc2FtcGxlcyBwcm9kdWNlZFwiKTsgIFxuXG5cdFx0Ly8gY29udmVydCBmcm9tIFstMSwxXSByYW5nZSBvZiBmbG9hdGluZyBwb2ludCBudW1iZXJzIHRvIFstMzI3NjcsMzI3NjddIHJhbmdlIG9mIGludGVnZXJzXG5cdFx0dmFyIGluZGV4ID0gMDtcblx0XHR2YXIgdm9sdW1lID0gMHg3RkZGO1xuICBcdFx0dmFyIHBjbUVuY29kZWRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc2FtcGxlc1RhcmdldC5sZW5ndGgqMik7ICAgIC8vIHNob3J0IGludGVnZXIgdG8gYnl0ZVxuICBcdFx0dmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KHBjbUVuY29kZWRCdWZmZXIpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzYW1wbGVzVGFyZ2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgXHRcdGRhdGFWaWV3LnNldEludDE2KGluZGV4LCBzYW1wbGVzVGFyZ2V0W2ldKnZvbHVtZSwgdHJ1ZSk7XG4gICAgXHRcdGluZGV4ICs9IDI7XG4gIFx0XHR9XG5cbiAgICAgIC8vIGwxNiBpcyB0aGUgTUlNRSB0eXBlIGZvciAxNi1iaXQgUENNXG4gICAgICBjYWxsYmFja1Byb2Nlc3NBdWRpbyhuZXcgQmxvYihbZGF0YVZpZXddLCB7IHR5cGU6ICdhdWRpby9sMTYnIH0pKTsgICAgICAgICBcbiAgIH07XG5cbiAgIGJ1ZmZlclNvdXJjZS5jb25uZWN0KG9mZmxpbmVDb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgIGJ1ZmZlclNvdXJjZS5zdGFydCgwKTtcbiAgIG9mZmxpbmVDb250ZXh0LnN0YXJ0UmVuZGVyaW5nKCk7ICAgXG59O1xuIFxuICBcblxuLyoqXG4gKiBDcmVhdGVzIGEgQmxvYiB0eXBlOiAnYXVkaW8vbDE2JyB3aXRoIHRoZVxuICogY2h1bmsgY29taW5nIGZyb20gdGhlIG1pY3JvcGhvbmUuXG4gKi9cbnZhciBleHBvcnREYXRhQnVmZmVyID0gZnVuY3Rpb24oYnVmZmVyLCBidWZmZXJTaXplKSB7XG4gIHZhciBwY21FbmNvZGVkQnVmZmVyID0gbnVsbCxcbiAgICBkYXRhVmlldyA9IG51bGwsXG4gICAgaW5kZXggPSAwLFxuICAgIHZvbHVtZSA9IDB4N0ZGRjsgLy9yYW5nZSBmcm9tIDAgdG8gMHg3RkZGIHRvIGNvbnRyb2wgdGhlIHZvbHVtZVxuXG4gIHBjbUVuY29kZWRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVyU2l6ZSAqIDIpO1xuICBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhwY21FbmNvZGVkQnVmZmVyKTtcblxuICAvKiBFeHBsYW5hdGlvbiBmb3IgdGhlIG1hdGg6IFRoZSByYXcgdmFsdWVzIGNhcHR1cmVkIGZyb20gdGhlIFdlYiBBdWRpbyBBUEkgYXJlXG4gICAqIGluIDMyLWJpdCBGbG9hdGluZyBQb2ludCwgYmV0d2VlbiAtMSBhbmQgMSAocGVyIHRoZSBzcGVjaWZpY2F0aW9uKS5cbiAgICogVGhlIHZhbHVlcyBmb3IgMTYtYml0IFBDTSByYW5nZSBiZXR3ZWVuIC0zMjc2OCBhbmQgKzMyNzY3ICgxNi1iaXQgc2lnbmVkIGludGVnZXIpLlxuICAgKiBNdWx0aXBseSB0byBjb250cm9sIHRoZSB2b2x1bWUgb2YgdGhlIG91dHB1dC4gV2Ugc3RvcmUgaW4gbGl0dGxlIGVuZGlhbi5cbiAgICovXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgZGF0YVZpZXcuc2V0SW50MTYoaW5kZXgsIGJ1ZmZlcltpXSAqIHZvbHVtZSwgdHJ1ZSk7XG4gICAgaW5kZXggKz0gMjtcbiAgfVxuXG4gIC8vIGwxNiBpcyB0aGUgTUlNRSB0eXBlIGZvciAxNi1iaXQgUENNXG4gIHJldHVybiBuZXcgQmxvYihbZGF0YVZpZXddLCB7IHR5cGU6ICdhdWRpby9sMTYnIH0pO1xufTtcblxuTWljcm9waG9uZS5wcm90b3R5cGUuX2V4cG9ydERhdGFCdWZmZXIgPSBmdW5jdGlvbihidWZmZXIpe1xuICB1dGlscy5leHBvcnREYXRhQnVmZmVyKGJ1ZmZlciwgdGhpcy5idWZmZXJTaXplKTtcbn07IFxuXG5cbi8vIEZ1bmN0aW9ucyB1c2VkIHRvIGNvbnRyb2wgTWljcm9waG9uZSBldmVudHMgbGlzdGVuZXJzLlxuTWljcm9waG9uZS5wcm90b3R5cGUub25TdGFydFJlY29yZGluZyA9ICBmdW5jdGlvbigpIHt9O1xuTWljcm9waG9uZS5wcm90b3R5cGUub25TdG9wUmVjb3JkaW5nID0gIGZ1bmN0aW9uKCkge307XG5NaWNyb3Bob25lLnByb3RvdHlwZS5vbkF1ZGlvID0gIGZ1bmN0aW9uKCkge307XG5cbm1vZHVsZS5leHBvcnRzID0gTWljcm9waG9uZTtcblxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICAgXCJtb2RlbHNcIjogW1xuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9lbi1VU19Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiAxNjAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJlbi1VU19Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJlbi1VU1wiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJVUyBFbmdsaXNoIGJyb2FkYmFuZCBtb2RlbCAoMTZLSHopXCJcbiAgICAgIH0sIFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9lbi1VU19OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogODAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJlbi1VU19OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiZW4tVVNcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVVMgRW5nbGlzaCBuYXJyb3diYW5kIG1vZGVsICg4S0h6KVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9lcy1FU19Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiAxNjAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJlcy1FU19Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJlcy1FU1wiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTcGFuaXNoIGJyb2FkYmFuZCBtb2RlbCAoMTZLSHopXCJcbiAgICAgIH0sIFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9lcy1FU19OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogODAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJlcy1FU19OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiZXMtRVNcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3BhbmlzaCBuYXJyb3diYW5kIG1vZGVsICg4S0h6KVwiXG4gICAgICB9LCBcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvamEtSlBfQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogMTYwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwiamEtSlBfQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiamEtSlBcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSmFwYW5lc2UgYnJvYWRiYW5kIG1vZGVsICgxNktIeilcIlxuICAgICAgfSwgXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL2phLUpQX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiA4MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcImphLUpQX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJqYS1KUFwiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJKYXBhbmVzZSBuYXJyb3diYW5kIG1vZGVsICg4S0h6KVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9wdC1CUl9Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiAxNjAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJwdC1CUl9Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJwdC1CUlwiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJCcmF6aWxpYW4gUG9ydHVndWVzZSBicm9hZGJhbmQgbW9kZWwgKDE2S0h6KVwiXG4gICAgICB9LCBcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvcHQtQlJfTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDgwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwicHQtQlJfTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcInB0LUJSXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkJyYXppbGlhbiBQb3J0dWd1ZXNlIG5hcnJvd2JhbmQgbW9kZWwgKDhLSHopXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL3poLUNOX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDE2MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcInpoLUNOX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcInpoLUNOXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1hbmRhcmluIGJyb2FkYmFuZCBtb2RlbCAoMTZLSHopXCJcbiAgICAgIH0sICAgICBcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvemgtQ05fTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDgwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwiemgtQ05fTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcInpoLUNOXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1hbmRhcmluIG5hcnJvd2JhbmQgbW9kZWwgKDhLSHopXCJcbiAgICAgIH0gICAgICBcbiAgIF1cbn1cbiIsIlxudmFyIGVmZmVjdHMgPSByZXF1aXJlKCcuL3ZpZXdzL2VmZmVjdHMnKTtcbnZhciBkaXNwbGF5ID0gcmVxdWlyZSgnLi92aWV3cy9kaXNwbGF5bWV0YWRhdGEnKTtcbnZhciBoaWRlRXJyb3IgPSByZXF1aXJlKCcuL3ZpZXdzL3Nob3dlcnJvcicpLmhpZGVFcnJvcjtcbnZhciBpbml0U29ja2V0ID0gcmVxdWlyZSgnLi9zb2NrZXQnKS5pbml0U29ja2V0O1xuXG5leHBvcnRzLmhhbmRsZUZpbGVVcGxvYWQgPSBmdW5jdGlvbih0b2tlbiwgbW9kZWwsIGZpbGUsIGNvbnRlbnRUeXBlLCBjYWxsYmFjaywgb25lbmQpIHtcblxuICAgIC8vIFNldCBjdXJyZW50bHlEaXNwbGF5aW5nIHRvIHByZXZlbnQgb3RoZXIgc29ja2V0cyBmcm9tIG9wZW5pbmdcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIHRydWUpO1xuXG4gICAgLy8gJCgnI3Byb2dyZXNzSW5kaWNhdG9yJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcblxuICAgICQuc3Vic2NyaWJlKCdwcm9ncmVzcycsIGZ1bmN0aW9uKGV2dCwgZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ3Byb2dyZXNzOiAnLCBkYXRhKTtcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKCdjb250ZW50VHlwZScsIGNvbnRlbnRUeXBlKTtcblxuICAgIHZhciBiYXNlU3RyaW5nID0gJyc7XG4gICAgdmFyIGJhc2VKU09OID0gJyc7XG5cbiAgICAkLnN1YnNjcmliZSgnc2hvd2pzb24nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgJHJlc3VsdHNKU09OID0gJCgnI3Jlc3VsdHNKU09OJylcbiAgICAgICRyZXN1bHRzSlNPTi5lbXB0eSgpO1xuICAgICAgJHJlc3VsdHNKU09OLmFwcGVuZChiYXNlSlNPTik7XG4gICAgfSk7XG5cbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIG9wdGlvbnMudG9rZW4gPSB0b2tlbjtcbiAgICBvcHRpb25zLm1lc3NhZ2UgPSB7XG4gICAgICAnYWN0aW9uJzogJ3N0YXJ0JyxcbiAgICAgICdjb250ZW50LXR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICdpbnRlcmltX3Jlc3VsdHMnOiB0cnVlLFxuICAgICAgJ2NvbnRpbnVvdXMnOiB0cnVlLFxuICAgICAgJ3dvcmRfY29uZmlkZW5jZSc6IHRydWUsXG4gICAgICAndGltZXN0YW1wcyc6IHRydWUsXG4gICAgICAnbWF4X2FsdGVybmF0aXZlcyc6IDMsXG4gICAgICAnaW5hY3Rpdml0eV90aW1lb3V0JzogNjAwXG4gICAgfTtcbiAgICBvcHRpb25zLm1vZGVsID0gbW9kZWw7XG5cbiAgICBmdW5jdGlvbiBvbk9wZW4oc29ja2V0KSB7XG4gICAgICBjb25zb2xlLmxvZygnU29ja2V0IG9wZW5lZCcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uTGlzdGVuaW5nKHNvY2tldCkge1xuICAgICAgY29uc29sZS5sb2coJ1NvY2tldCBsaXN0ZW5pbmcnKTtcbiAgICAgIGNhbGxiYWNrKHNvY2tldCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25NZXNzYWdlKG1zZykge1xuICAgICAgaWYgKG1zZy5yZXN1bHRzKSB7XG4gICAgICAgIC8vIENvbnZlcnQgdG8gY2xvc3VyZSBhcHByb2FjaFxuICAgICAgICBiYXNlU3RyaW5nID0gZGlzcGxheS5zaG93UmVzdWx0KG1zZywgYmFzZVN0cmluZywgbW9kZWwpO1xuICAgICAgICBiYXNlSlNPTiA9IGRpc3BsYXkuc2hvd0pTT04obXNnLCBiYXNlSlNPTik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25FcnJvcihldnQpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgZmFsc2UpO1xuICAgICAgb25lbmQoZXZ0KTtcbiAgICAgIGNvbnNvbGUubG9nKCdTb2NrZXQgZXJyOiAnLCBldnQuY29kZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25DbG9zZShldnQpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgZmFsc2UpO1xuICAgICAgb25lbmQoZXZ0KTtcbiAgICAgIGNvbnNvbGUubG9nKCdTb2NrZXQgY2xvc2luZzogJywgZXZ0KTtcbiAgICB9XG5cbiAgICBpbml0U29ja2V0KG9wdGlvbnMsIG9uT3Blbiwgb25MaXN0ZW5pbmcsIG9uTWVzc2FnZSwgb25FcnJvciwgb25DbG9zZSk7XG59XG5cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5pdFNvY2tldCA9IHJlcXVpcmUoJy4vc29ja2V0JykuaW5pdFNvY2tldDtcbnZhciBkaXNwbGF5ID0gcmVxdWlyZSgnLi92aWV3cy9kaXNwbGF5bWV0YWRhdGEnKTtcblxuZXhwb3J0cy5oYW5kbGVNaWNyb3Bob25lID0gZnVuY3Rpb24odG9rZW4sIG1vZGVsLCBtaWMsIGNhbGxiYWNrKSB7XG5cbiAgaWYgKG1vZGVsLmluZGV4T2YoJ05hcnJvd2JhbmQnKSA+IC0xKSB7XG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcignTWljcm9waG9uZSB0cmFuc2NyaXB0aW9uIGNhbm5vdCBhY2NvbW9kYXRlIG5hcnJvd2JhbmQgbW9kZWxzLCBwbGVhc2Ugc2VsZWN0IGFub3RoZXInKTtcbiAgICBjYWxsYmFjayhlcnIsIG51bGwpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gICQucHVibGlzaCgnY2xlYXJzY3JlZW4nKTtcblxuICAvLyBUZXN0IG91dCB3ZWJzb2NrZXRcbiAgdmFyIGJhc2VTdHJpbmcgPSAnJztcbiAgdmFyIGJhc2VKU09OID0gJyc7XG5cbiAgJC5zdWJzY3JpYmUoJ3Nob3dqc29uJywgZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciAkcmVzdWx0c0pTT04gPSAkKCcjcmVzdWx0c0pTT04nKVxuICAgICRyZXN1bHRzSlNPTi5lbXB0eSgpO1xuICAgICRyZXN1bHRzSlNPTi5hcHBlbmQoYmFzZUpTT04pO1xuICB9KTtcblxuICB2YXIgb3B0aW9ucyA9IHt9O1xuICBvcHRpb25zLnRva2VuID0gdG9rZW47XG4gIG9wdGlvbnMubWVzc2FnZSA9IHtcbiAgICAnYWN0aW9uJzogJ3N0YXJ0JyxcbiAgICAnY29udGVudC10eXBlJzogJ2F1ZGlvL2wxNjtyYXRlPTE2MDAwJyxcbiAgICAnaW50ZXJpbV9yZXN1bHRzJzogdHJ1ZSxcbiAgICAnY29udGludW91cyc6IHRydWUsXG4gICAgJ3dvcmRfY29uZmlkZW5jZSc6IHRydWUsXG4gICAgJ3RpbWVzdGFtcHMnOiB0cnVlLFxuICAgICdtYXhfYWx0ZXJuYXRpdmVzJzogMyxcbiAgICAnaW5hY3Rpdml0eV90aW1lb3V0JzogNjAwICAgIFxuICB9O1xuICBvcHRpb25zLm1vZGVsID0gbW9kZWw7XG5cbiAgZnVuY3Rpb24gb25PcGVuKHNvY2tldCkge1xuICAgIGNvbnNvbGUubG9nKCdNaWMgc29ja2V0OiBvcGVuZWQnKTtcbiAgICBjYWxsYmFjayhudWxsLCBzb2NrZXQpO1xuICB9XG5cbiAgZnVuY3Rpb24gb25MaXN0ZW5pbmcoc29ja2V0KSB7XG5cbiAgICBtaWMub25BdWRpbyA9IGZ1bmN0aW9uKGJsb2IpIHtcbiAgICAgIGlmIChzb2NrZXQucmVhZHlTdGF0ZSA8IDIpIHtcbiAgICAgICAgc29ja2V0LnNlbmQoYmxvYilcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgdmFyIHNwZWVjaF90ZXh0ID0gJyc7XG4gIGZ1bmN0aW9uIG9uTWVzc2FnZShtc2csIHNvY2tldCkge1xuICAgIC8vIGNvbnNvbGUubG9nKCdNaWMgc29ja2V0IG1zZzogJywgbXNnKTtcbiAgICBpZiAobXNnLnJlc3VsdHMpIHtcbiAgICAgIGlmIChtc2cucmVzdWx0cyAmJiBtc2cucmVzdWx0c1swXSAmJiBtc2cucmVzdWx0c1swXS5maW5hbCkge1xuICAgICAgICB2YXIgZmluYWxfbWVzc2FnZSA9IG1zZy5yZXN1bHRzWzBdLmFsdGVybmF0aXZlc1swXTtcbiAgICAgICAgc3BlZWNoX3RleHQgKz0gZmluYWxfbWVzc2FnZS50cmFuc2NyaXB0O1xuICAgICAgICBjb25zb2xlLmxvZyhzcGVlY2hfdGV4dCk7XG5cbiAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0aGlzIC0tIGl0IGp1c3QgdXBkYXRlcyB0aGUgRE9NIHdpdGggdGhlIGluY29taW5nIG1lc3NhZ2VcbiAgICAgICAgLy8gYmFzZVN0cmluZyA9IGRpc3BsYXkuc2hvd1Jlc3VsdChtc2csIGJhc2VTdHJpbmcsIG1vZGVsKTtcbiAgICAgICAgLy8gYmFzZUpTT04gPSBkaXNwbGF5LnNob3dKU09OKG1zZywgYmFzZUpTT04pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRXJyb3Iociwgc29ja2V0KSB7XG4gICAgY29uc29sZS5sb2coJ01pYyBzb2NrZXQgZXJyOiAnLCBlcnIpO1xuICB9XG5cbiAgZnVuY3Rpb24gb25DbG9zZShldnQpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnTWljIHNvY2tldCBjbG9zZTogJywgZXZ0KTtcbiAgICAvLyBUT0RPOiBzZW5kIHN0dWZmIHRvIGtlZW4gaW9cbiAgfVxuXG4gIGluaXRTb2NrZXQob3B0aW9ucywgb25PcGVuLCBvbkxpc3RlbmluZywgb25NZXNzYWdlLCBvbkVycm9yLCBvbkNsb3NlKTtcbn0iLCIvKipcbiAqIENvcHlyaWdodCAyMDE0IElCTSBDb3JwLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbi8qZ2xvYmFsICQ6ZmFsc2UgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWljcm9waG9uZSA9IHJlcXVpcmUoJy4vTWljcm9waG9uZScpO1xudmFyIG1vZGVscyA9IHJlcXVpcmUoJy4vZGF0YS9tb2RlbHMuanNvbicpLm1vZGVscztcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnV0aWxzLmluaXRQdWJTdWIoKTtcbnZhciBpbml0Vmlld3MgPSByZXF1aXJlKCcuL3ZpZXdzJykuaW5pdFZpZXdzO1xuXG53aW5kb3cuQlVGRkVSU0laRSA9IDgxOTI7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gIC8vIE1ha2UgY2FsbCB0byBBUEkgdG8gdHJ5IGFuZCBnZXQgdG9rZW5cbiAgdXRpbHMuZ2V0VG9rZW4oZnVuY3Rpb24odG9rZW4pIHtcblxuICAgIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgIH07XG5cbiAgICBpZiAoIXRva2VuKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdObyBhdXRob3JpemF0aW9uIHRva2VuIGF2YWlsYWJsZScpO1xuICAgICAgY29uc29sZS5lcnJvcignQXR0ZW1wdGluZyB0byByZWNvbm5lY3QuLi4nKTtcbiAgICB9XG5cbiAgICB2YXIgdmlld0NvbnRleHQgPSB7XG4gICAgICBjdXJyZW50TW9kZWw6ICdlbi1VU19Ccm9hZGJhbmRNb2RlbCcsXG4gICAgICBtb2RlbHM6IG1vZGVscyxcbiAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgIGJ1ZmZlclNpemU6IEJVRkZFUlNJWkVcbiAgICB9O1xuXG4gICAgaW5pdFZpZXdzKHZpZXdDb250ZXh0KTtcblxuICAgIC8vIFNhdmUgbW9kZWxzIHRvIGxvY2Fsc3RvcmFnZVxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdtb2RlbHMnLCBKU09OLnN0cmluZ2lmeShtb2RlbHMpKTtcblxuICAgIC8vIFNldCBkZWZhdWx0IGN1cnJlbnQgbW9kZWxcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudE1vZGVsJywgJ2VuLVVTX0Jyb2FkYmFuZE1vZGVsJyk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Nlc3Npb25QZXJtaXNzaW9ucycsICd0cnVlJyk7XG5cblxuICAgICQuc3Vic2NyaWJlKCdjbGVhcnNjcmVlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgJCgnI3Jlc3VsdHNUZXh0JykudGV4dCgnJyk7XG4gICAgICAkKCcjcmVzdWx0c0pTT04nKS50ZXh0KCcnKTtcbiAgICAgICQoJy5lcnJvci1yb3cnKS5oaWRlKCk7XG4gICAgICAkKCcubm90aWZpY2F0aW9uLXJvdycpLmhpZGUoKTtcbiAgICAgICQoJy5oeXBvdGhlc2VzID4gdWwnKS5lbXB0eSgpO1xuICAgICAgJCgnI21ldGFkYXRhVGFibGVCb2R5JykuZW1wdHkoKTtcbiAgICB9KTtcblxuICB9KTtcblxufSk7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDE0IElCTSBDb3JwLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbi8qZ2xvYmFsICQ6ZmFsc2UgKi9cblxuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgTWljcm9waG9uZSA9IHJlcXVpcmUoJy4vTWljcm9waG9uZScpO1xudmFyIHNob3dlcnJvciA9IHJlcXVpcmUoJy4vdmlld3Mvc2hvd2Vycm9yJyk7XG52YXIgc2hvd0Vycm9yID0gc2hvd2Vycm9yLnNob3dFcnJvcjtcbnZhciBoaWRlRXJyb3IgPSBzaG93ZXJyb3IuaGlkZUVycm9yO1xuXG4vLyBNaW5pIFdTIGNhbGxiYWNrIEFQSSwgc28gd2UgY2FuIGluaXRpYWxpemVcbi8vIHdpdGggbW9kZWwgYW5kIHRva2VuIGluIFVSSSwgcGx1c1xuLy8gc3RhcnQgbWVzc2FnZVxuXG4vLyBJbml0aWFsaXplIGNsb3N1cmUsIHdoaWNoIGhvbGRzIG1heGltdW0gZ2V0VG9rZW4gY2FsbCBjb3VudFxudmFyIHRva2VuR2VuZXJhdG9yID0gdXRpbHMuY3JlYXRlVG9rZW5HZW5lcmF0b3IoKTtcblxudmFyIGluaXRTb2NrZXQgPSBleHBvcnRzLmluaXRTb2NrZXQgPSBmdW5jdGlvbihvcHRpb25zLCBvbm9wZW4sIG9ubGlzdGVuaW5nLCBvbm1lc3NhZ2UsIG9uZXJyb3IsIG9uY2xvc2UpIHtcbiAgdmFyIGxpc3RlbmluZztcbiAgZnVuY3Rpb24gd2l0aERlZmF1bHQodmFsLCBkZWZhdWx0VmFsKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnID8gZGVmYXVsdFZhbCA6IHZhbDtcbiAgfVxuICB2YXIgc29ja2V0O1xuICB2YXIgdG9rZW4gPSBvcHRpb25zLnRva2VuO1xuICB2YXIgbW9kZWwgPSBvcHRpb25zLm1vZGVsIHx8IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50TW9kZWwnKTtcbiAgdmFyIG1lc3NhZ2UgPSBvcHRpb25zLm1lc3NhZ2UgfHwgeydhY3Rpb24nOiAnc3RhcnQnfTtcbiAgdmFyIHNlc3Npb25QZXJtaXNzaW9ucyA9IHdpdGhEZWZhdWx0KG9wdGlvbnMuc2Vzc2lvblBlcm1pc3Npb25zLCBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzZXNzaW9uUGVybWlzc2lvbnMnKSkpO1xuICB2YXIgc2Vzc2lvblBlcm1pc3Npb25zUXVlcnlQYXJhbSA9IHNlc3Npb25QZXJtaXNzaW9ucyA/ICcwJyA6ICcxJztcbiAgdmFyIHVybCA9IG9wdGlvbnMuc2VydmljZVVSSSB8fCAnd3NzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvcmVjb2duaXplP3dhdHNvbi10b2tlbj0nXG4gICAgKyB0b2tlblxuICAgICsgJyZYLVdEQy1QTC1PUFQtT1VUPScgKyBzZXNzaW9uUGVybWlzc2lvbnNRdWVyeVBhcmFtXG4gICAgKyAnJm1vZGVsPScgKyBtb2RlbDtcbiAgY29uc29sZS5sb2coJ1VSTCBtb2RlbCcsIG1vZGVsKTtcbiAgdHJ5IHtcbiAgICBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVybCk7XG4gIH0gY2F0Y2goZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcignV1MgY29ubmVjdGlvbiBlcnJvcjogJywgZXJyKTtcbiAgfVxuICBzb2NrZXQub25vcGVuID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgbGlzdGVuaW5nID0gZmFsc2U7XG4gICAgJC5zdWJzY3JpYmUoJ2hhcmRzb2NrZXRzdG9wJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ01JQ1JPUEhPTkU6IGNsb3NlLicpO1xuICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe2FjdGlvbjonc3RvcCd9KSk7XG4gICAgfSk7XG4gICAgJC5zdWJzY3JpYmUoJ3NvY2tldHN0b3AnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBjb25zb2xlLmxvZygnTUlDUk9QSE9ORTogY2xvc2UuJyk7XG4gICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICB9KTtcbiAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgb25vcGVuKHNvY2tldCk7XG4gIH07XG4gIHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldnQpIHtcbiAgICB2YXIgbXNnID0gSlNPTi5wYXJzZShldnQuZGF0YSk7XG4gICAgaWYgKG1zZy5lcnJvcikge1xuICAgICAgc2hvd0Vycm9yKG1zZy5lcnJvcik7XG4gICAgICAkLnB1Ymxpc2goJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChtc2cuc3RhdGUgPT09ICdsaXN0ZW5pbmcnKSB7XG4gICAgICAvLyBFYXJseSBjdXQgb2ZmLCB3aXRob3V0IG5vdGlmaWNhdGlvblxuICAgICAgaWYgKCFsaXN0ZW5pbmcpIHtcbiAgICAgICAgb25saXN0ZW5pbmcoc29ja2V0KTtcbiAgICAgICAgbGlzdGVuaW5nID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNSUNST1BIT05FOiBDbG9zaW5nIHNvY2tldC4nKTtcbiAgICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIG9ubWVzc2FnZShtc2csIHNvY2tldCk7XG4gIH07XG5cbiAgc29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbihldnQpIHtcbiAgICBjb25zb2xlLmxvZygnV1Mgb25lcnJvcjogJywgZXZ0KTtcbiAgICBzaG93RXJyb3IoJ0FwcGxpY2F0aW9uIGVycm9yICcgKyBldnQuY29kZSArICc6IHBsZWFzZSByZWZyZXNoIHlvdXIgYnJvd3NlciBhbmQgdHJ5IGFnYWluJyk7XG4gICAgJC5wdWJsaXNoKCdjbGVhcnNjcmVlbicpO1xuICAgIG9uZXJyb3IoZXZ0KTtcbiAgfTtcblxuICBzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uKGV2dCkge1xuICAgIGNvbnNvbGUubG9nKCdXUyBvbmNsb3NlOiAnLCBldnQpO1xuICAgIGlmIChldnQuY29kZSA9PT0gMTAwNikge1xuICAgICAgLy8gQXV0aGVudGljYXRpb24gZXJyb3IsIHRyeSB0byByZWNvbm5lY3RcbiAgICAgIGNvbnNvbGUubG9nKCdnZW5lcmF0b3IgY291bnQnLCB0b2tlbkdlbmVyYXRvci5nZXRDb3VudCgpKTtcbiAgICAgIGlmICh0b2tlbkdlbmVyYXRvci5nZXRDb3VudCgpID4gMSkge1xuICAgICAgICAkLnB1Ymxpc2goJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGF1dGhvcml6YXRpb24gdG9rZW4gaXMgY3VycmVudGx5IGF2YWlsYWJsZVwiKTtcbiAgICAgIH1cbiAgICAgIHRva2VuR2VuZXJhdG9yLmdldFRva2VuKGZ1bmN0aW9uKHRva2VuLCBlcnIpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICQucHVibGlzaCgnaGFyZHNvY2tldHN0b3AnKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ0ZldGNoaW5nIGFkZGl0aW9uYWwgdG9rZW4uLi4nKTtcbiAgICAgICAgb3B0aW9ucy50b2tlbiA9IHRva2VuO1xuICAgICAgICBpbml0U29ja2V0KG9wdGlvbnMsIG9ub3Blbiwgb25saXN0ZW5pbmcsIG9ubWVzc2FnZSwgb25lcnJvciwgb25jbG9zZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGV2dC5jb2RlID09PSAxMDExKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdTZXJ2ZXIgZXJyb3IgJyArIGV2dC5jb2RlICsgJzogcGxlYXNlIHJlZnJlc2ggeW91ciBicm93c2VyIGFuZCB0cnkgYWdhaW4nKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGV2dC5jb2RlID4gMTAwMCkge1xuICAgICAgY29uc29sZS5lcnJvcignU2VydmVyIGVycm9yICcgKyBldnQuY29kZSArICc6IHBsZWFzZSByZWZyZXNoIHlvdXIgYnJvd3NlciBhbmQgdHJ5IGFnYWluJyk7XG4gICAgICAvLyBzaG93RXJyb3IoJ1NlcnZlciBlcnJvciAnICsgZXZ0LmNvZGUgKyAnOiBwbGVhc2UgcmVmcmVzaCB5b3VyIGJyb3dzZXIgYW5kIHRyeSBhZ2FpbicpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBNYWRlIGl0IHRocm91Z2gsIG5vcm1hbCBjbG9zZVxuICAgICQudW5zdWJzY3JpYmUoJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgJC51bnN1YnNjcmliZSgnc29ja2V0c3RvcCcpO1xuICAgIG9uY2xvc2UoZXZ0KTtcbiAgfTtcblxufSIsIlxuLy8gRm9yIG5vbi12aWV3IGxvZ2ljXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBmaWxlQmxvY2sgPSBmdW5jdGlvbihfb2Zmc2V0LCBsZW5ndGgsIF9maWxlLCByZWFkQ2h1bmspIHtcbiAgdmFyIHIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICB2YXIgYmxvYiA9IF9maWxlLnNsaWNlKF9vZmZzZXQsIGxlbmd0aCArIF9vZmZzZXQpO1xuICByLm9ubG9hZCA9IHJlYWRDaHVuaztcbiAgci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKTtcbn1cblxuLy8gQmFzZWQgb24gYWxlZGlhZmVyaWEncyBTTyByZXNwb25zZVxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNDQzODE4Ny9qYXZhc2NyaXB0LWZpbGVyZWFkZXItcGFyc2luZy1sb25nLWZpbGUtaW4tY2h1bmtzXG5leHBvcnRzLm9uRmlsZVByb2dyZXNzID0gZnVuY3Rpb24ob3B0aW9ucywgb25kYXRhLCBvbmVycm9yLCBvbmVuZCwgc2FtcGxpbmdSYXRlKSB7XG4gIHZhciBmaWxlICAgICAgID0gb3B0aW9ucy5maWxlO1xuICB2YXIgZmlsZVNpemUgICA9IGZpbGUuc2l6ZTtcbiAgdmFyIGNodW5rU2l6ZSAgPSBvcHRpb25zLmJ1ZmZlclNpemUgfHwgMTYwMDA7ICAvLyBpbiBieXRlc1xuICB2YXIgb2Zmc2V0ICAgICA9IDA7XG4gIHZhciByZWFkQ2h1bmsgPSBmdW5jdGlvbihldnQpIHtcbiAgICBpZiAob2Zmc2V0ID49IGZpbGVTaXplKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkRvbmUgcmVhZGluZyBmaWxlXCIpO1xuICAgICAgb25lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGV2dC50YXJnZXQuZXJyb3IgPT0gbnVsbCkge1xuICAgICAgdmFyIGJ1ZmZlciA9IGV2dC50YXJnZXQucmVzdWx0O1xuICAgICAgdmFyIGxlbiA9IGJ1ZmZlci5ieXRlTGVuZ3RoO1xuICAgICAgb2Zmc2V0ICs9IGxlbjtcbiAgICAgIGNvbnNvbGUubG9nKFwic2VuZGluZzogXCIgKyBsZW4pXG4gICAgICBvbmRhdGEoYnVmZmVyKTsgLy8gY2FsbGJhY2sgZm9yIGhhbmRsaW5nIHJlYWQgY2h1bmtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IGV2dC50YXJnZXQuZXJyb3I7XG4gICAgICBjb25zb2xlLmxvZyhcIlJlYWQgZXJyb3I6IFwiICsgZXJyb3JNZXNzYWdlKTtcbiAgICAgIG9uZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gdXNlIHRoaXMgdGltZW91dCB0byBwYWNlIHRoZSBkYXRhIHVwbG9hZCBmb3IgdGhlIHBsYXlTYW1wbGUgY2FzZSwgdGhlIGlkZWEgaXMgdGhhdCB0aGUgaHlwcyBkbyBub3QgYXJyaXZlIGJlZm9yZSB0aGUgYXVkaW8gaXMgcGxheWVkIGJhY2tcbiAgICBpZiAoc2FtcGxpbmdSYXRlKSB7XG4gICAgXHRjb25zb2xlLmxvZyhcInNhbXBsaW5nUmF0ZTogXCIgKyAgc2FtcGxpbmdSYXRlICsgXCIgdGltZW91dDogXCIgKyAoY2h1bmtTaXplKjEwMDApLyhzYW1wbGluZ1JhdGUqMikpXG4gICAgXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBmaWxlQmxvY2sob2Zmc2V0LCBjaHVua1NpemUsIGZpbGUsIHJlYWRDaHVuayk7IH0sIChjaHVua1NpemUqMTAwMCkvKHNhbXBsaW5nUmF0ZSoyKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbGVCbG9jayhvZmZzZXQsIGNodW5rU2l6ZSwgZmlsZSwgcmVhZENodW5rKTtcbiAgICB9XG4gIH1cbiAgZmlsZUJsb2NrKG9mZnNldCwgY2h1bmtTaXplLCBmaWxlLCByZWFkQ2h1bmspO1xufVxuXG5leHBvcnRzLmNyZWF0ZVRva2VuR2VuZXJhdG9yID0gZnVuY3Rpb24oKSB7XG4gIC8vIE1ha2UgY2FsbCB0byBBUEkgdG8gdHJ5IGFuZCBnZXQgdG9rZW5cbiAgdmFyIGhhc0JlZW5SdW5UaW1lcyA9IDA7XG4gIHJldHVybiB7XG4gICAgZ2V0VG9rZW46IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgKytoYXNCZWVuUnVuVGltZXM7XG4gICAgaWYgKGhhc0JlZW5SdW5UaW1lcyA+IDUpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0Nhbm5vdCByZWFjaCBzZXJ2ZXInKTtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB1cmwgPSAnL3Rva2VuJztcbiAgICB2YXIgdG9rZW5SZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgdG9rZW5SZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICB0b2tlblJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICB2YXIgdG9rZW4gPSB0b2tlblJlcXVlc3QucmVzcG9uc2VUZXh0O1xuICAgICAgY2FsbGJhY2sodG9rZW4pO1xuICAgIH07XG4gICAgdG9rZW5SZXF1ZXN0LnNlbmQoKTtcbiAgICB9LFxuICAgIGdldENvdW50OiBmdW5jdGlvbigpIHsgcmV0dXJuIGhhc0JlZW5SdW5UaW1lczsgfVxuICB9XG59O1xuXG5leHBvcnRzLmdldFRva2VuID0gKGZ1bmN0aW9uKCkge1xuICAvLyBNYWtlIGNhbGwgdG8gQVBJIHRvIHRyeSBhbmQgZ2V0IHRva2VuXG4gIHZhciBoYXNCZWVuUnVuVGltZXMgPSAwO1xuICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBoYXNCZWVuUnVuVGltZXMrK1xuICAgIGlmIChoYXNCZWVuUnVuVGltZXMgPiA1KSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdDYW5ub3QgcmVhY2ggc2VydmVyJyk7XG4gICAgICBjYWxsYmFjayhudWxsLCBlcnIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdXJsID0gJy90b2tlbic7XG4gICAgdmFyIHRva2VuUmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHRva2VuUmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgdG9rZW5SZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgdmFyIHRva2VuID0gdG9rZW5SZXF1ZXN0LnJlc3BvbnNlVGV4dDtcbiAgICAgIGNhbGxiYWNrKHRva2VuKTtcbiAgICB9O1xuICAgIHRva2VuUmVxdWVzdC5zZW5kKCk7XG4gIH1cbn0pKCk7XG5cbmV4cG9ydHMuaW5pdFB1YlN1YiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbyAgICAgICAgID0gJCh7fSk7XG4gICQuc3Vic2NyaWJlICAgPSBvLm9uLmJpbmQobyk7XG4gICQudW5zdWJzY3JpYmUgPSBvLm9mZi5iaW5kKG8pO1xuICAkLnB1Ymxpc2ggICAgID0gby50cmlnZ2VyLmJpbmQobyk7XG59IiwiXG5cbmV4cG9ydHMuaW5pdEFuaW1hdGVQYW5lbCA9IGZ1bmN0aW9uKCkge1xuICAkKCcucGFuZWwtaGVhZGluZyBzcGFuLmNsaWNrYWJsZScpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygncGFuZWwtY29sbGFwc2VkJykpIHtcbiAgICAgIC8vIGV4cGFuZCB0aGUgcGFuZWxcbiAgICAgICQodGhpcykucGFyZW50cygnLnBhbmVsJykuZmluZCgnLnBhbmVsLWJvZHknKS5zbGlkZURvd24oKTtcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xuICAgICAgJCh0aGlzKS5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2NhcmV0LWRvd24nKS5hZGRDbGFzcygnY2FyZXQtdXAnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBjb2xsYXBzZSB0aGUgcGFuZWxcbiAgICAgICQodGhpcykucGFyZW50cygnLnBhbmVsJykuZmluZCgnLnBhbmVsLWJvZHknKS5zbGlkZVVwKCk7XG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcbiAgICAgICQodGhpcykuZmluZCgnaScpLnJlbW92ZUNsYXNzKCdjYXJldC11cCcpLmFkZENsYXNzKCdjYXJldC1kb3duJyk7XG4gICAgfVxuICB9KTtcbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgc2Nyb2xsZWQgPSBmYWxzZSxcbiAgICB0ZXh0U2Nyb2xsZWQgPSBmYWxzZTtcblxudmFyIHNob3dUaW1lc3RhbXAgPSBmdW5jdGlvbih0aW1lc3RhbXBzLCBjb25maWRlbmNlcykge1xuICB2YXIgd29yZCA9IHRpbWVzdGFtcHNbMF0sXG4gICAgICB0MCA9IHRpbWVzdGFtcHNbMV0sXG4gICAgICB0MSA9IHRpbWVzdGFtcHNbMl07XG4gIHZhciB0aW1lbGVuZ3RoID0gdDEgLSB0MDtcbiAgLy8gU2hvdyBjb25maWRlbmNlIGlmIGRlZmluZWQsIGVsc2UgJ24vYSdcbiAgdmFyIGRpc3BsYXlDb25maWRlbmNlID0gY29uZmlkZW5jZXMgPyBjb25maWRlbmNlc1sxXS50b1N0cmluZygpLnN1YnN0cmluZygwLCAzKSA6ICduL2EnO1xuICAkKCcjbWV0YWRhdGFUYWJsZSA+IHRib2R5Omxhc3QtY2hpbGQnKS5hcHBlbmQoXG4gICAgICAnPHRyPidcbiAgICAgICsgJzx0ZD4nICsgd29yZCArICc8L3RkPidcbiAgICAgICsgJzx0ZD4nICsgdDAgKyAnPC90ZD4nXG4gICAgICArICc8dGQ+JyArIHQxICsgJzwvdGQ+J1xuICAgICAgKyAnPHRkPicgKyBkaXNwbGF5Q29uZmlkZW5jZSArICc8L3RkPidcbiAgICAgICsgJzwvdHI+J1xuICAgICAgKTtcbn1cblxuXG52YXIgc2hvd01ldGFEYXRhID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmUpIHtcbiAgdmFyIGNvbmZpZGVuY2VOZXN0ZWRBcnJheSA9IGFsdGVybmF0aXZlLndvcmRfY29uZmlkZW5jZTs7XG4gIHZhciB0aW1lc3RhbXBOZXN0ZWRBcnJheSA9IGFsdGVybmF0aXZlLnRpbWVzdGFtcHM7XG4gIGlmIChjb25maWRlbmNlTmVzdGVkQXJyYXkgJiYgY29uZmlkZW5jZU5lc3RlZEFycmF5Lmxlbmd0aCA+IDApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbmZpZGVuY2VOZXN0ZWRBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHRpbWVzdGFtcHMgPSB0aW1lc3RhbXBOZXN0ZWRBcnJheVtpXTtcbiAgICAgIHZhciBjb25maWRlbmNlcyA9IGNvbmZpZGVuY2VOZXN0ZWRBcnJheVtpXTtcbiAgICAgIHNob3dUaW1lc3RhbXAodGltZXN0YW1wcywgY29uZmlkZW5jZXMpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH0gZWxzZSB7XG4gICAgaWYgKHRpbWVzdGFtcE5lc3RlZEFycmF5ICYmIHRpbWVzdGFtcE5lc3RlZEFycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRpbWVzdGFtcE5lc3RlZEFycmF5LmZvckVhY2goZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgICAgIHNob3dUaW1lc3RhbXAodGltZXN0YW1wKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG52YXIgQWx0ZXJuYXRpdmVzID0gZnVuY3Rpb24oKXtcblxuICB2YXIgc3RyaW5nT25lID0gJycsXG4gICAgc3RyaW5nVHdvID0gJycsXG4gICAgc3RyaW5nVGhyZWUgPSAnJztcblxuICB0aGlzLmNsZWFyU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgc3RyaW5nT25lID0gJyc7XG4gICAgc3RyaW5nVHdvID0gJyc7XG4gICAgc3RyaW5nVGhyZWUgPSAnJztcbiAgfTtcblxuICB0aGlzLnNob3dBbHRlcm5hdGl2ZXMgPSBmdW5jdGlvbihhbHRlcm5hdGl2ZXMsIGlzRmluYWwsIHRlc3RpbmcpIHtcbiAgICB2YXIgJGh5cG90aGVzZXMgPSAkKCcuaHlwb3RoZXNlcyBvbCcpO1xuICAgICRoeXBvdGhlc2VzLmVtcHR5KCk7XG4gICAgLy8gJGh5cG90aGVzZXMuYXBwZW5kKCQoJzwvYnI+JykpO1xuICAgIGFsdGVybmF0aXZlcy5mb3JFYWNoKGZ1bmN0aW9uKGFsdGVybmF0aXZlLCBpZHgpIHtcbiAgICAgIHZhciAkYWx0ZXJuYXRpdmU7XG4gICAgICBpZiAoYWx0ZXJuYXRpdmUudHJhbnNjcmlwdCkge1xuICAgICAgICB2YXIgdHJhbnNjcmlwdCA9IGFsdGVybmF0aXZlLnRyYW5zY3JpcHQucmVwbGFjZSgvJUhFU0lUQVRJT05cXHMvZywgJycpO1xuICAgICAgICB0cmFuc2NyaXB0ID0gdHJhbnNjcmlwdC5yZXBsYWNlKC8oLilcXDF7Mix9L2csICcnKTtcbiAgICAgICAgc3dpdGNoIChpZHgpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBzdHJpbmdPbmUgPSBzdHJpbmdPbmUgKyB0cmFuc2NyaXB0O1xuICAgICAgICAgICAgJGFsdGVybmF0aXZlID0gJCgnPGxpIGRhdGEtaHlwb3RoZXNpcy1pbmRleD0nICsgaWR4ICsgJyA+JyArIHN0cmluZ09uZSArICc8L2xpPicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgc3RyaW5nVHdvID0gc3RyaW5nVHdvICsgdHJhbnNjcmlwdDtcbiAgICAgICAgICAgICRhbHRlcm5hdGl2ZSA9ICQoJzxsaSBkYXRhLWh5cG90aGVzaXMtaW5kZXg9JyArIGlkeCArICcgPicgKyBzdHJpbmdUd28gKyAnPC9saT4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHN0cmluZ1RocmVlID0gc3RyaW5nVGhyZWUgKyB0cmFuc2NyaXB0O1xuICAgICAgICAgICAgJGFsdGVybmF0aXZlID0gJCgnPGxpIGRhdGEtaHlwb3RoZXNpcy1pbmRleD0nICsgaWR4ICsgJyA+JyArIHN0cmluZ1RocmVlICsgJzwvbGk+Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAkaHlwb3RoZXNlcy5hcHBlbmQoJGFsdGVybmF0aXZlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn1cblxudmFyIGFsdGVybmF0aXZlUHJvdG90eXBlID0gbmV3IEFsdGVybmF0aXZlcygpO1xuXG5cbi8vIFRPRE86IENvbnZlcnQgdG8gY2xvc3VyZSBhcHByb2FjaFxuLyp2YXIgcHJvY2Vzc1N0cmluZyA9IGZ1bmN0aW9uKGJhc2VTdHJpbmcsIGlzRmluaXNoZWQpIHtcblxuICBpZiAoaXNGaW5pc2hlZCkge1xuICAgIHZhciBmb3JtYXR0ZWRTdHJpbmcgPSBiYXNlU3RyaW5nLnNsaWNlKDAsIC0xKTtcbiAgICBmb3JtYXR0ZWRTdHJpbmcgPSBmb3JtYXR0ZWRTdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmb3JtYXR0ZWRTdHJpbmcuc3Vic3RyaW5nKDEpO1xuICAgIGZvcm1hdHRlZFN0cmluZyA9IGZvcm1hdHRlZFN0cmluZy50cmltKCkgKyAnLiAnO1xuICAgICQoJyNyZXN1bHRzVGV4dCcpLnZhbChmb3JtYXR0ZWRTdHJpbmcpO1xuICAgIHJldHVybiBmb3JtYXR0ZWRTdHJpbmc7XG4gIH0gZWxzZSB7XG4gICAgJCgnI3Jlc3VsdHNUZXh0JykudmFsKGJhc2VTdHJpbmcpO1xuICAgIHJldHVybiBiYXNlU3RyaW5nO1xuICB9XG59Ki9cblxuZXhwb3J0cy5zaG93SlNPTiA9IGZ1bmN0aW9uKG1zZywgYmFzZUpTT04pIHtcbiAgXG4gICB2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KG1zZywgbnVsbCwgMik7XG4gICAgYmFzZUpTT04gKz0ganNvbjtcbiAgICBiYXNlSlNPTiArPSAnXFxuJzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbiAgaWYgKCQoJy5uYXYtdGFicyAuYWN0aXZlJykudGV4dCgpID09IFwiSlNPTlwiKSB7XG4gICAgICAkKCcjcmVzdWx0c0pTT04nKS5hcHBlbmQoYmFzZUpTT04pO1xuICAgICAgYmFzZUpTT04gPSBcIlwiO1xuICAgICAgY29uc29sZS5sb2coXCJ1cGRhdGluZyBqc29uXCIpO1xuICB9XG4gIFxuICByZXR1cm4gYmFzZUpTT047XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRleHRTY3JvbGwoKXtcbiAgaWYoIXNjcm9sbGVkKXtcbiAgICB2YXIgZWxlbWVudCA9ICQoJyNyZXN1bHRzVGV4dCcpLmdldCgwKTtcbiAgICBlbGVtZW50LnNjcm9sbFRvcCA9IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0O1xuICB9XG59XG5cbnZhciBpbml0VGV4dFNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAkKCcjcmVzdWx0c1RleHQnKS5vbignc2Nyb2xsJywgZnVuY3Rpb24oKXtcbiAgICAgIHRleHRTY3JvbGxlZCA9IHRydWU7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTY3JvbGwoKXtcbiAgaWYoIXNjcm9sbGVkKXtcbiAgICB2YXIgZWxlbWVudCA9ICQoJy50YWJsZS1zY3JvbGwnKS5nZXQoMCk7XG4gICAgZWxlbWVudC5zY3JvbGxUb3AgPSBlbGVtZW50LnNjcm9sbEhlaWdodDtcbiAgfVxufVxuXG52YXIgaW5pdFNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAkKCcudGFibGUtc2Nyb2xsJykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uKCl7XG4gICAgICBzY3JvbGxlZD10cnVlO1xuICB9KTtcbn1cblxuZXhwb3J0cy5pbml0RGlzcGxheU1ldGFkYXRhID0gZnVuY3Rpb24oKSB7XG4gIGluaXRTY3JvbGwoKTtcbiAgaW5pdFRleHRTY3JvbGwoKTtcbn07XG5cblxuZXhwb3J0cy5zaG93UmVzdWx0ID0gZnVuY3Rpb24obXNnLCBiYXNlU3RyaW5nLCBtb2RlbCwgY2FsbGJhY2spIHtcblxuICB2YXIgaWR4ID0gK21zZy5yZXN1bHRfaW5kZXg7XG5cbiAgaWYgKG1zZy5yZXN1bHRzICYmIG1zZy5yZXN1bHRzLmxlbmd0aCA+IDApIHtcblxuICAgIHZhciBhbHRlcm5hdGl2ZXMgPSBtc2cucmVzdWx0c1swXS5hbHRlcm5hdGl2ZXM7XG4gICAgdmFyIHRleHQgPSBtc2cucmVzdWx0c1swXS5hbHRlcm5hdGl2ZXNbMF0udHJhbnNjcmlwdCB8fCAnJztcbiAgICBcbiAgICAvLyBhcHBseSBtYXBwaW5ncyB0byBiZWF1dGlmeVxuICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyVIRVNJVEFUSU9OXFxzL2csICcnKTtcbiAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oLilcXDF7Mix9L2csICcnKTtcbiAgICBpZiAobXNnLnJlc3VsdHNbMF0uZmluYWwpXG4gICAgICAgY29uc29sZS5sb2coXCItPiBcIiArIHRleHQgKyBcIlxcblwiKTtcbiAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9EX1teXFxzXSsvZywnJyk7XG4gICAgXG4gICAgLy8gaWYgYWxsIHdvcmRzIGFyZSBtYXBwZWQgdG8gbm90aGluZyB0aGVuIHRoZXJlIGlzIG5vdGhpbmcgZWxzZSB0byBkb1xuICAgIGlmICgodGV4dC5sZW5ndGggPT0gMCkgfHwgKC9eXFxzKyQvLnRlc3QodGV4dCkpKSB7XG4gICAgXHQgcmV0dXJuIGJhc2VTdHJpbmc7XG4gICAgfSAgICBcdCAgXG4gICAgXG4gICAgLy8gY2FwaXRhbGl6ZSBmaXJzdCB3b3JkXG4gICAgLy8gaWYgZmluYWwgcmVzdWx0cywgYXBwZW5kIGEgbmV3IHBhcmFncmFwaFxuICAgIGlmIChtc2cucmVzdWx0cyAmJiBtc2cucmVzdWx0c1swXSAmJiBtc2cucmVzdWx0c1swXS5maW5hbCkge1xuICAgICAgIHRleHQgPSB0ZXh0LnNsaWNlKDAsIC0xKTtcbiAgICAgICB0ZXh0ID0gdGV4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRleHQuc3Vic3RyaW5nKDEpO1xuICAgICAgIGlmICgobW9kZWwuc3Vic3RyaW5nKDAsNSkgPT0gXCJqYS1KUFwiKSB8fCAobW9kZWwuc3Vic3RyaW5nKDAsNSkgPT0gXCJ6aC1DTlwiKSkgeyAgICAgICAgXG4gICAgICAgICAgdGV4dCA9IHRleHQudHJpbSgpICsgJ+OAgic7XG4gICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvIC9nLCcnKTsgICAgICAvLyByZW1vdmUgd2hpdGVzcGFjZXMgXG4gICAgICAgfSBlbHNlIHsgIFxuICAgICAgICAgIHRleHQgPSB0ZXh0LnRyaW0oKSArICcuICc7XG4gICAgICAgfSAgICAgICBcbiAgICAgICBiYXNlU3RyaW5nICs9IHRleHQ7XG4gICAgICAgJCgnI3Jlc3VsdHNUZXh0JykudmFsKGJhc2VTdHJpbmcpO1xuICAgICAgIHNob3dNZXRhRGF0YShhbHRlcm5hdGl2ZXNbMF0pO1xuICAgICAgIC8vIE9ubHkgc2hvdyBhbHRlcm5hdGl2ZXMgaWYgd2UncmUgZmluYWxcbiAgICAgICBhbHRlcm5hdGl2ZVByb3RvdHlwZS5zaG93QWx0ZXJuYXRpdmVzKGFsdGVybmF0aXZlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICBpZiAoKG1vZGVsLnN1YnN0cmluZygwLDUpID09IFwiamEtSlBcIikgfHwgKG1vZGVsLnN1YnN0cmluZygwLDUpID09IFwiemgtQ05cIikpIHsgICAgICAgIFxuICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyAvZywnJyk7ICAgICAgLy8gcmVtb3ZlIHdoaXRlc3BhY2VzICAgICBcdCAgICAgICAgIFxuICAgICAgIH0gZWxzZSB7XG4gICAgICAgIFx0IHRleHQgPSB0ZXh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGV4dC5zdWJzdHJpbmcoMSk7XG4gICAgICAgfVxuICAgIFx0ICQoJyNyZXN1bHRzVGV4dCcpLnZhbChiYXNlU3RyaW5nICsgdGV4dCk7ICAgIFx0IFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVNjcm9sbCgpO1xuICB1cGRhdGVUZXh0U2Nyb2xsKCk7XG4gIHJldHVybiBiYXNlU3RyaW5nO1xufTtcblxuJC5zdWJzY3JpYmUoJ2NsZWFyc2NyZWVuJywgZnVuY3Rpb24oKSB7XG4gIHZhciAkaHlwb3RoZXNlcyA9ICQoJy5oeXBvdGhlc2VzIHVsJyk7XG4gIHNjcm9sbGVkID0gZmFsc2U7XG4gICRoeXBvdGhlc2VzLmVtcHR5KCk7XG4gIGFsdGVybmF0aXZlUHJvdG90eXBlLmNsZWFyU3RyaW5nKCk7XG59KTtcblxuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciBoYW5kbGVTZWxlY3RlZEZpbGUgPSByZXF1aXJlKCcuL2ZpbGV1cGxvYWQnKS5oYW5kbGVTZWxlY3RlZEZpbGU7XG5cbmV4cG9ydHMuaW5pdERyYWdEcm9wID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgdmFyIGRyYWdBbmREcm9wVGFyZ2V0ID0gJChkb2N1bWVudCk7XG5cbiAgZHJhZ0FuZERyb3BUYXJnZXQub24oJ2RyYWdlbnRlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGRyYWdBbmREcm9wVGFyZ2V0Lm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGRyYWdBbmREcm9wVGFyZ2V0Lm9uKCdkcm9wJywgZnVuY3Rpb24gKGUpIHtcbiAgICBjb25zb2xlLmxvZygnRmlsZSBkcm9wcGVkJyk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBldnQgPSBlLm9yaWdpbmFsRXZlbnQ7XG4gICAgLy8gSGFuZGxlIGRyYWdnZWQgZmlsZSBldmVudFxuICAgIGhhbmRsZUZpbGVVcGxvYWRFdmVudChldnQpO1xuICB9KTtcblxuICBmdW5jdGlvbiBoYW5kbGVGaWxlVXBsb2FkRXZlbnQoZXZ0KSB7XG4gICAgLy8gSW5pdCBmaWxlIHVwbG9hZCB3aXRoIGRlZmF1bHQgbW9kZWxcbiAgICB2YXIgZmlsZSA9IGV2dC5kYXRhVHJhbnNmZXIuZmlsZXNbMF07XG4gICAgaGFuZGxlU2VsZWN0ZWRGaWxlKGN0eC50b2tlbiwgZmlsZSk7XG4gIH1cblxufVxuIiwiXG5cblxuZXhwb3J0cy5mbGFzaFNWRyA9IGZ1bmN0aW9uKGVsKSB7XG4gIGVsLmNzcyh7IGZpbGw6ICcjQTUzNzI1JyB9KTtcbiAgZnVuY3Rpb24gbG9vcCgpIHtcbiAgICBlbC5hbmltYXRlKHsgZmlsbDogJyNBNTM3MjUnIH0sXG4gICAgICAgIDEwMDAsICdsaW5lYXInKVxuICAgICAgLmFuaW1hdGUoeyBmaWxsOiAnd2hpdGUnIH0sXG4gICAgICAgICAgMTAwMCwgJ2xpbmVhcicpO1xuICB9XG4gIC8vIHJldHVybiB0aW1lclxuICB2YXIgdGltZXIgPSBzZXRUaW1lb3V0KGxvb3AsIDIwMDApO1xuICByZXR1cm4gdGltZXI7XG59O1xuXG5leHBvcnRzLnN0b3BGbGFzaFNWRyA9IGZ1bmN0aW9uKHRpbWVyKSB7XG4gIGVsLmNzcyh7IGZpbGw6ICd3aGl0ZScgfSApO1xuICBjbGVhckludGVydmFsKHRpbWVyKTtcbn1cblxuZXhwb3J0cy50b2dnbGVJbWFnZSA9IGZ1bmN0aW9uKGVsLCBuYW1lKSB7XG4gIGlmKGVsLmF0dHIoJ3NyYycpID09PSAnaW1hZ2VzLycgKyBuYW1lICsgJy5zdmcnKSB7XG4gICAgZWwuYXR0cihcInNyY1wiLCAnaW1hZ2VzL3N0b3AtcmVkLnN2ZycpO1xuICB9IGVsc2Uge1xuICAgIGVsLmF0dHIoJ3NyYycsICdpbWFnZXMvc3RvcC5zdmcnKTtcbiAgfVxufVxuXG52YXIgcmVzdG9yZUltYWdlID0gZXhwb3J0cy5yZXN0b3JlSW1hZ2UgPSBmdW5jdGlvbihlbCwgbmFtZSkge1xuICBlbC5hdHRyKCdzcmMnLCAnaW1hZ2VzLycgKyBuYW1lICsgJy5zdmcnKTtcbn1cblxuZXhwb3J0cy5zdG9wVG9nZ2xlSW1hZ2UgPSBmdW5jdGlvbih0aW1lciwgZWwsIG5hbWUpIHtcbiAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gIHJlc3RvcmVJbWFnZShlbCwgbmFtZSk7XG59XG4iLCJcbid1c2Ugc3RyaWN0JztcblxudmFyIHNob3dFcnJvciA9IHJlcXVpcmUoJy4vc2hvd2Vycm9yJykuc2hvd0Vycm9yO1xudmFyIHNob3dOb3RpY2UgPSByZXF1aXJlKCcuL3Nob3dlcnJvcicpLnNob3dOb3RpY2U7XG52YXIgaGFuZGxlRmlsZVVwbG9hZCA9IHJlcXVpcmUoJy4uL2hhbmRsZWZpbGV1cGxvYWQnKS5oYW5kbGVGaWxlVXBsb2FkO1xudmFyIGVmZmVjdHMgPSByZXF1aXJlKCcuL2VmZmVjdHMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8vIE5lZWQgdG8gcmVtb3ZlIHRoZSB2aWV3IGxvZ2ljIGhlcmUgYW5kIG1vdmUgdGhpcyBvdXQgdG8gdGhlIGhhbmRsZWZpbGV1cGxvYWQgY29udHJvbGxlclxudmFyIGhhbmRsZVNlbGVjdGVkRmlsZSA9IGV4cG9ydHMuaGFuZGxlU2VsZWN0ZWRGaWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcblxuICAgIHJldHVybiBmdW5jdGlvbih0b2tlbiwgZmlsZSkge1xuXG4gICAgdmFyIGN1cnJlbnRseURpc3BsYXlpbmcgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJykpO1xuXG4gICAgLy8gaWYgKGN1cnJlbnRseURpc3BsYXlpbmcpIHtcbiAgICAvLyAgIHNob3dFcnJvcignQ3VycmVudGx5IGFub3RoZXIgZmlsZSBpcyBwbGF5aW5nLCBwbGVhc2Ugc3RvcCB0aGUgZmlsZSBvciB3YWl0IHVudGlsIGl0IGZpbmlzaGVzJyk7XG4gICAgLy8gICByZXR1cm47XG4gICAgLy8gfVxuXG4gICAgJC5wdWJsaXNoKCdjbGVhcnNjcmVlbicpO1xuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCB0cnVlKTtcbiAgICBydW5uaW5nID0gdHJ1ZTtcblxuICAgIC8vIFZpc3VhbCBlZmZlY3RzXG4gICAgdmFyIHVwbG9hZEltYWdlVGFnID0gJCgnI2ZpbGVVcGxvYWRUYXJnZXQgPiBpbWcnKTtcbiAgICB2YXIgdGltZXIgPSBzZXRJbnRlcnZhbChlZmZlY3RzLnRvZ2dsZUltYWdlLCA3NTAsIHVwbG9hZEltYWdlVGFnLCAnc3RvcCcpO1xuICAgIHZhciB1cGxvYWRUZXh0ID0gJCgnI2ZpbGVVcGxvYWRUYXJnZXQgPiBzcGFuJyk7XG4gICAgdXBsb2FkVGV4dC50ZXh0KCdTdG9wIFRyYW5zY3JpYmluZycpO1xuXG4gICAgZnVuY3Rpb24gcmVzdG9yZVVwbG9hZFRhYigpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpO1xuICAgICAgZWZmZWN0cy5yZXN0b3JlSW1hZ2UodXBsb2FkSW1hZ2VUYWcsICd1cGxvYWQnKTtcbiAgICAgIHVwbG9hZFRleHQudGV4dCgnU2VsZWN0IEZpbGUnKTtcbiAgICB9XG5cbiAgICAvLyBDbGVhciBmbGFzaGluZyBpZiBzb2NrZXQgdXBsb2FkIGlzIHN0b3BwZWRcbiAgICAkLnN1YnNjcmliZSgnaGFyZHNvY2tldHN0b3AnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXN0b3JlVXBsb2FkVGFiKCk7XG4gICAgfSk7XG5cbiAgICAvLyBHZXQgY3VycmVudCBtb2RlbFxuICAgIHZhciBjdXJyZW50TW9kZWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudE1vZGVsJyk7XG4gICAgY29uc29sZS5sb2coJ2N1cnJlbnRNb2RlbCcsIGN1cnJlbnRNb2RlbCk7XG5cbiAgICAvLyBSZWFkIGZpcnN0IDQgYnl0ZXMgdG8gZGV0ZXJtaW5lIGhlYWRlclxuICAgIHZhciBibG9iVG9UZXh0ID0gbmV3IEJsb2IoW2ZpbGVdKS5zbGljZSgwLCA0KTtcbiAgICB2YXIgciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgci5yZWFkQXNUZXh0KGJsb2JUb1RleHQpO1xuICAgIHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29udGVudFR5cGU7XG4gICAgICBpZiAoci5yZXN1bHQgPT09ICdmTGFDJykge1xuICAgICAgICBjb250ZW50VHlwZSA9ICdhdWRpby9mbGFjJztcbiAgICAgICAgc2hvd05vdGljZSgnTm90aWNlOiBicm93c2VycyBkbyBub3Qgc3VwcG9ydCBwbGF5aW5nIEZMQUMgYXVkaW8sIHNvIG5vIGF1ZGlvIHdpbGwgYWNjb21wYW55IHRoZSB0cmFuc2NyaXB0aW9uJyk7XG4gICAgICB9IGVsc2UgaWYgKHIucmVzdWx0ID09PSAnUklGRicpIHtcbiAgICAgICAgY29udGVudFR5cGUgPSAnYXVkaW8vd2F2JztcbiAgICAgICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgIHZhciB3YXZCbG9iID0gbmV3IEJsb2IoW2ZpbGVdLCB7dHlwZTogJ2F1ZGlvL3dhdid9KTtcbiAgICAgICAgdmFyIHdhdlVSTCA9IFVSTC5jcmVhdGVPYmplY3RVUkwod2F2QmxvYik7XG4gICAgICAgIGF1ZGlvLnNyYyA9IHdhdlVSTDtcbiAgICAgICAgYXVkaW8ucGxheSgpO1xuICAgICAgICAkLnN1YnNjcmliZSgnaGFyZHNvY2tldHN0b3AnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBhdWRpby5wYXVzZSgpO1xuICAgICAgICAgIGF1ZGlvLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN0b3JlVXBsb2FkVGFiKCk7XG4gICAgICAgIHNob3dFcnJvcignT25seSBXQVYgb3IgRkxBQyBmaWxlcyBjYW4gYmUgdHJhbnNjcmliZWQsIHBsZWFzZSB0cnkgYW5vdGhlciBmaWxlIGZvcm1hdCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBoYW5kbGVGaWxlVXBsb2FkKHRva2VuLCBjdXJyZW50TW9kZWwsIGZpbGUsIGNvbnRlbnRUeXBlLCBmdW5jdGlvbihzb2NrZXQpIHtcbiAgICAgICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbZmlsZV0pO1xuICAgICAgICB2YXIgcGFyc2VPcHRpb25zID0ge1xuICAgICAgICAgIGZpbGU6IGJsb2JcbiAgICAgICAgfTtcbiAgICAgICAgdXRpbHMub25GaWxlUHJvZ3Jlc3MocGFyc2VPcHRpb25zLFxuICAgICAgICAgIC8vIE9uIGRhdGEgY2h1bmtcbiAgICAgICAgICBmdW5jdGlvbihjaHVuaykge1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoY2h1bmspO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gT24gZmlsZSByZWFkIGVycm9yXG4gICAgICAgICAgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgcmVhZGluZyBmaWxlOiAnLCBldnQubWVzc2FnZSk7XG4gICAgICAgICAgICBzaG93RXJyb3IoJ0Vycm9yOiAnICsgZXZ0Lm1lc3NhZ2UpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gT24gbG9hZCBlbmRcbiAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KHsnYWN0aW9uJzogJ3N0b3AnfSkpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSwgXG4gICAgICAgIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgIGVmZmVjdHMuc3RvcFRvZ2dsZUltYWdlKHRpbWVyLCB1cGxvYWRJbWFnZVRhZywgJ3VwbG9hZCcpO1xuICAgICAgICAgIHVwbG9hZFRleHQudGV4dCgnU2VsZWN0IEZpbGUnKTtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9O1xuICB9XG59KSgpO1xuXG5cbmV4cG9ydHMuaW5pdEZpbGVVcGxvYWQgPSBmdW5jdGlvbihjdHgpIHtcblxuICB2YXIgZmlsZVVwbG9hZERpYWxvZyA9ICQoXCIjZmlsZVVwbG9hZERpYWxvZ1wiKTtcblxuICBmaWxlVXBsb2FkRGlhbG9nLmNoYW5nZShmdW5jdGlvbihldnQpIHtcbiAgICB2YXIgZmlsZSA9IGZpbGVVcGxvYWREaWFsb2cuZ2V0KDApLmZpbGVzWzBdO1xuICAgIGhhbmRsZVNlbGVjdGVkRmlsZShjdHgudG9rZW4sIGZpbGUpO1xuICB9KTtcblxuICAkKFwiI2ZpbGVVcGxvYWRUYXJnZXRcIikuY2xpY2soZnVuY3Rpb24oZXZ0KSB7XG5cbiAgICB2YXIgY3VycmVudGx5RGlzcGxheWluZyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnKSk7XG5cbiAgICBpZiAoY3VycmVudGx5RGlzcGxheWluZykge1xuICAgICAgY29uc29sZS5sb2coJ0hBUkQgU09DS0VUIFNUT1AnKTtcbiAgICAgICQucHVibGlzaCgnaGFyZHNvY2tldHN0b3AnKTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZpbGVVcGxvYWREaWFsb2cudmFsKG51bGwpO1xuXG4gICAgZmlsZVVwbG9hZERpYWxvZ1xuICAgIC50cmlnZ2VyKCdjbGljaycpO1xuXG4gIH0pO1xuXG59IiwiXG52YXIgaW5pdFNlc3Npb25QZXJtaXNzaW9ucyA9IHJlcXVpcmUoJy4vc2Vzc2lvbnBlcm1pc3Npb25zJykuaW5pdFNlc3Npb25QZXJtaXNzaW9ucztcbnZhciBpbml0U2VsZWN0TW9kZWwgPSByZXF1aXJlKCcuL3NlbGVjdG1vZGVsJykuaW5pdFNlbGVjdE1vZGVsO1xudmFyIGluaXRBbmltYXRlUGFuZWwgPSByZXF1aXJlKCcuL2FuaW1hdGVwYW5lbCcpLmluaXRBbmltYXRlUGFuZWw7XG52YXIgaW5pdFNob3dUYWIgPSByZXF1aXJlKCcuL3Nob3d0YWInKS5pbml0U2hvd1RhYjtcbnZhciBpbml0RHJhZ0Ryb3AgPSByZXF1aXJlKCcuL2RyYWdkcm9wJykuaW5pdERyYWdEcm9wO1xudmFyIGluaXRQbGF5U2FtcGxlID0gcmVxdWlyZSgnLi9wbGF5c2FtcGxlJykuaW5pdFBsYXlTYW1wbGU7XG52YXIgaW5pdFJlY29yZEJ1dHRvbiA9IHJlcXVpcmUoJy4vcmVjb3JkYnV0dG9uJykuaW5pdFJlY29yZEJ1dHRvbjtcbnZhciBpbml0RmlsZVVwbG9hZCA9IHJlcXVpcmUoJy4vZmlsZXVwbG9hZCcpLmluaXRGaWxlVXBsb2FkO1xudmFyIGluaXREaXNwbGF5TWV0YWRhdGEgPSByZXF1aXJlKCcuL2Rpc3BsYXltZXRhZGF0YScpLmluaXREaXNwbGF5TWV0YWRhdGE7XG5cblxuZXhwb3J0cy5pbml0Vmlld3MgPSBmdW5jdGlvbihjdHgpIHtcbiAgY29uc29sZS5sb2coJ0luaXRpYWxpemluZyB2aWV3cy4uLicpO1xuICBpbml0U2VsZWN0TW9kZWwoY3R4KTtcbiAgaW5pdFBsYXlTYW1wbGUoY3R4KTtcbiAgaW5pdERyYWdEcm9wKGN0eCk7XG4gIGluaXRSZWNvcmRCdXR0b24oY3R4KTtcbiAgaW5pdEZpbGVVcGxvYWQoY3R4KTtcbiAgaW5pdFNlc3Npb25QZXJtaXNzaW9ucygpO1xuICBpbml0U2hvd1RhYigpO1xuICBpbml0QW5pbWF0ZVBhbmVsKCk7XG4gIGluaXRTaG93VGFiKCk7XG4gIGluaXREaXNwbGF5TWV0YWRhdGEoKTtcbn1cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIG9uRmlsZVByb2dyZXNzID0gdXRpbHMub25GaWxlUHJvZ3Jlc3M7XG52YXIgaGFuZGxlRmlsZVVwbG9hZCA9IHJlcXVpcmUoJy4uL2hhbmRsZWZpbGV1cGxvYWQnKS5oYW5kbGVGaWxlVXBsb2FkO1xudmFyIGluaXRTb2NrZXQgPSByZXF1aXJlKCcuLi9zb2NrZXQnKS5pbml0U29ja2V0O1xudmFyIHNob3dFcnJvciA9IHJlcXVpcmUoJy4vc2hvd2Vycm9yJykuc2hvd0Vycm9yO1xudmFyIGVmZmVjdHMgPSByZXF1aXJlKCcuL2VmZmVjdHMnKTtcblxuXG52YXIgTE9PS1VQX1RBQkxFID0ge1xuICAnZW4tVVNfQnJvYWRiYW5kTW9kZWwnOiBbJ1VzX0VuZ2xpc2hfQnJvYWRiYW5kX1NhbXBsZV8xLndhdicsICdVc19FbmdsaXNoX0Jyb2FkYmFuZF9TYW1wbGVfMi53YXYnXSxcbiAgJ2VuLVVTX05hcnJvd2JhbmRNb2RlbCc6IFsnVXNfRW5nbGlzaF9OYXJyb3diYW5kX1NhbXBsZV8xLndhdicsICdVc19FbmdsaXNoX05hcnJvd2JhbmRfU2FtcGxlXzIud2F2J10sXG4gICdlcy1FU19Ccm9hZGJhbmRNb2RlbCc6IFsnRXNfRVNfc3BrMjRfMTZraHoud2F2JywgJ0VzX0VTX3NwazE5XzE2a2h6LndhdiddLFxuICAnZXMtRVNfTmFycm93YmFuZE1vZGVsJzogWydFc19FU19zcGsyNF84a2h6LndhdicsICdFc19FU19zcGsxOV84a2h6LndhdiddLFxuICAnamEtSlBfQnJvYWRiYW5kTW9kZWwnOiBbJ3NhbXBsZS1KYV9KUC13aWRlMS53YXYnLCAnc2FtcGxlLUphX0pQLXdpZGUyLndhdiddLFxuICAnamEtSlBfTmFycm93YmFuZE1vZGVsJzogWydzYW1wbGUtSmFfSlAtbmFycm93My53YXYnLCAnc2FtcGxlLUphX0pQLW5hcnJvdzQud2F2J10sXG4gICdwdC1CUl9Ccm9hZGJhbmRNb2RlbCc6IFsncHQtQlJfU2FtcGxlMS0xNktIei53YXYnLCAncHQtQlJfU2FtcGxlMi0xNktIei53YXYnXSxcbiAgJ3B0LUJSX05hcnJvd2JhbmRNb2RlbCc6IFsncHQtQlJfU2FtcGxlMS04S0h6LndhdicsICdwdC1CUl9TYW1wbGUyLThLSHoud2F2J10sXG4gICd6aC1DTl9Ccm9hZGJhbmRNb2RlbCc6IFsnemgtQ05fc2FtcGxlMV9mb3JfMTZrLndhdicsICd6aC1DTl9zYW1wbGUyX2Zvcl8xNmsud2F2J10sXG4gICd6aC1DTl9OYXJyb3diYW5kTW9kZWwnOiBbJ3poLUNOX3NhbXBsZTFfZm9yXzhrLndhdicsICd6aC1DTl9zYW1wbGUyX2Zvcl84ay53YXYnXSAgXG59O1xuXG52YXIgcGxheVNhbXBsZSA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgcnVubmluZyA9IGZhbHNlO1xuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcblxuICByZXR1cm4gZnVuY3Rpb24odG9rZW4sIGltYWdlVGFnLCBpY29uTmFtZSwgdXJsLCBjYWxsYmFjaykge1xuXG4gICAgJC5wdWJsaXNoKCdjbGVhcnNjcmVlbicpO1xuXG4gICAgdmFyIGN1cnJlbnRseURpc3BsYXlpbmcgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJykpO1xuXG4gICAgY29uc29sZS5sb2coJ0NVUlJFTlRMWSBESVNQTEFZSU5HJywgY3VycmVudGx5RGlzcGxheWluZyk7XG5cbiAgICAvLyBUaGlzIGVycm9yIGhhbmRsaW5nIG5lZWRzIHRvIGJlIGV4cGFuZGVkIHRvIGFjY29tb2RhdGVcbiAgICAvLyB0aGUgdHdvIGRpZmZlcmVudCBwbGF5IHNhbXBsZXMgZmlsZXNcbiAgICBpZiAoY3VycmVudGx5RGlzcGxheWluZykge1xuICAgICAgY29uc29sZS5sb2coJ0hBUkQgU09DS0VUIFNUT1AnKTtcbiAgICAgICQucHVibGlzaCgnc29ja2V0c3RvcCcpO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCBmYWxzZSk7XG4gICAgICBlZmZlY3RzLnN0b3BUb2dnbGVJbWFnZSh0aW1lciwgaW1hZ2VUYWcsIGljb25OYW1lKTtcbiAgICAgIGVmZmVjdHMucmVzdG9yZUltYWdlKGltYWdlVGFnLCBpY29uTmFtZSk7XG4gICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRseURpc3BsYXlpbmcgJiYgcnVubmluZykge1xuICAgICAgc2hvd0Vycm9yKCdDdXJyZW50bHkgYW5vdGhlciBmaWxlIGlzIHBsYXlpbmcsIHBsZWFzZSBzdG9wIHRoZSBmaWxlIG9yIHdhaXQgdW50aWwgaXQgZmluaXNoZXMnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIHRydWUpO1xuICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgIFxuICAgICQoJyNyZXN1bHRzVGV4dCcpLnZhbCgnJyk7ICAgLy8gY2xlYXIgaHlwb3RoZXNlcyBmcm9tIHByZXZpb3VzIHJ1bnNcblxuICAgIHZhciB0aW1lciA9IHNldEludGVydmFsKGVmZmVjdHMudG9nZ2xlSW1hZ2UsIDc1MCwgaW1hZ2VUYWcsIGljb25OYW1lKTtcblxuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgYmxvYiA9IHhoci5yZXNwb25zZTtcbiAgICAgIHZhciBjdXJyZW50TW9kZWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudE1vZGVsJykgfHwgJ2VuLVVTX0Jyb2FkYmFuZE1vZGVsJztcbiAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgdmFyIGJsb2JUb1RleHQgPSBuZXcgQmxvYihbYmxvYl0pLnNsaWNlKDAsIDQpO1xuICAgICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYlRvVGV4dCk7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb250ZW50VHlwZSA9IHJlYWRlci5yZXN1bHQgPT09ICdmTGFDJyA/ICdhdWRpby9mbGFjJyA6ICdhdWRpby93YXYnO1xuICAgICAgICBjb25zb2xlLmxvZygnVXBsb2FkaW5nIGZpbGUnLCByZWFkZXIucmVzdWx0KTtcbiAgICAgICAgdmFyIG1lZGlhU291cmNlVVJMID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgIGF1ZGlvLnNyYyA9IG1lZGlhU291cmNlVVJMO1xuICAgICAgICBhdWRpby5wbGF5KCk7XG4gICAgICAgICQuc3Vic2NyaWJlKCdoYXJkc29ja2V0c3RvcCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XG4gICAgICAgICAgYXVkaW8uY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB9KTtcbiAgICAgICAgJC5zdWJzY3JpYmUoJ3NvY2tldHN0b3AnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBhdWRpby5wYXVzZSgpO1xuICAgICAgICAgIGF1ZGlvLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGhhbmRsZUZpbGVVcGxvYWQodG9rZW4sIGN1cnJlbnRNb2RlbCwgYmxvYiwgY29udGVudFR5cGUsIGZ1bmN0aW9uKHNvY2tldCkge1xuICAgICAgICAgIHZhciBwYXJzZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICBmaWxlOiBibG9iXG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgc2FtcGxpbmdSYXRlID0gKGN1cnJlbnRNb2RlbC5pbmRleE9mKFwiQnJvYWRiYW5kXCIpICE9IC0xKSA/IDE2MDAwIDogODAwMDtcbiAgICAgICAgICBvbkZpbGVQcm9ncmVzcyhwYXJzZU9wdGlvbnMsXG4gICAgICAgICAgICAvLyBPbiBkYXRhIGNodW5rXG4gICAgICAgICAgICBmdW5jdGlvbihjaHVuaykge1xuICAgICAgICAgICAgICBzb2NrZXQuc2VuZChjaHVuayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gT24gZmlsZSByZWFkIGVycm9yXG4gICAgICAgICAgICBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHJlYWRpbmcgZmlsZTogJywgZXZ0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAvLyBzaG93RXJyb3IoZXZ0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIE9uIGxvYWQgZW5kXG4gICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoeydhY3Rpb24nOiAnc3RvcCd9KSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2FtcGxpbmdSYXRlXG4gICAgICAgICAgICApO1xuICAgICAgICB9LCBcbiAgICAgICAgLy8gT24gY29ubmVjdGlvbiBlbmRcbiAgICAgICAgICBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgIGVmZmVjdHMuc3RvcFRvZ2dsZUltYWdlKHRpbWVyLCBpbWFnZVRhZywgaWNvbk5hbWUpO1xuICAgICAgICAgICAgZWZmZWN0cy5yZXN0b3JlSW1hZ2UoaW1hZ2VUYWcsIGljb25OYW1lKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfTtcbiAgICB4aHIuc2VuZCgpO1xuICB9O1xufSkoKTtcblxuXG5leHBvcnRzLmluaXRQbGF5U2FtcGxlID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIHZhciBmaWxlTmFtZSA9ICdhdWRpby8nICsgTE9PS1VQX1RBQkxFW2N0eC5jdXJyZW50TW9kZWxdWzBdO1xuICAgIHZhciBlbCA9ICQoJy5wbGF5LXNhbXBsZS0xJyk7XG4gICAgZWwub2ZmKCdjbGljaycpO1xuICAgIHZhciBpY29uTmFtZSA9ICdwbGF5JztcbiAgICB2YXIgaW1hZ2VUYWcgPSBlbC5maW5kKCdpbWcnKTtcbiAgICBlbC5jbGljayggZnVuY3Rpb24oZXZ0KSB7XG4gICAgICBwbGF5U2FtcGxlKGN0eC50b2tlbiwgaW1hZ2VUYWcsIGljb25OYW1lLCBmaWxlTmFtZSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQbGF5IHNhbXBsZSByZXN1bHQnLCByZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pKGN0eCwgTE9PS1VQX1RBQkxFKTtcblxuICAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZpbGVOYW1lID0gJ2F1ZGlvLycgKyBMT09LVVBfVEFCTEVbY3R4LmN1cnJlbnRNb2RlbF1bMV07XG4gICAgdmFyIGVsID0gJCgnLnBsYXktc2FtcGxlLTInKTtcbiAgICBlbC5vZmYoJ2NsaWNrJyk7XG4gICAgdmFyIGljb25OYW1lID0gJ3BsYXknO1xuICAgIHZhciBpbWFnZVRhZyA9IGVsLmZpbmQoJ2ltZycpO1xuICAgIGVsLmNsaWNrKCBmdW5jdGlvbihldnQpIHtcbiAgICAgIHBsYXlTYW1wbGUoY3R4LnRva2VuLCBpbWFnZVRhZywgaWNvbk5hbWUsIGZpbGVOYW1lLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BsYXkgc2FtcGxlIHJlc3VsdCcsIHJlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSkoY3R4LCBMT09LVVBfVEFCTEUpO1xuXG59O1xuXG5cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWljcm9waG9uZSA9IHJlcXVpcmUoJy4uL01pY3JvcGhvbmUnKTtcbnZhciBoYW5kbGVNaWNyb3Bob25lID0gcmVxdWlyZSgnLi4vaGFuZGxlbWljcm9waG9uZScpLmhhbmRsZU1pY3JvcGhvbmU7XG52YXIgc2hvd0Vycm9yID0gcmVxdWlyZSgnLi9zaG93ZXJyb3InKS5zaG93RXJyb3I7XG52YXIgc2hvd05vdGljZSA9IHJlcXVpcmUoJy4vc2hvd2Vycm9yJykuc2hvd05vdGljZTtcblxuZXhwb3J0cy5pbml0UmVjb3JkQnV0dG9uID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgdmFyIHJlY29yZEJ1dHRvbiA9ICQoJyNyZWNvcmRCdXR0b24nKTtcblxuICByZWNvcmRCdXR0b24uY2xpY2soKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICB2YXIgdG9rZW4gPSBjdHgudG9rZW47XG4gICAgdmFyIG1pY09wdGlvbnMgPSB7XG4gICAgICBidWZmZXJTaXplOiBjdHguYnVmZmVyc2l6ZVxuICAgIH07XG4gICAgdmFyIG1pYyA9IG5ldyBNaWNyb3Bob25lKG1pY09wdGlvbnMpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGFuY2hvciBiZWhhdmlvclxuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHZhciBjdXJyZW50TW9kZWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudE1vZGVsJyk7XG4gICAgICB2YXIgY3VycmVudGx5RGlzcGxheWluZyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnKSk7XG5cbiAgICAgIGlmIChjdXJyZW50bHlEaXNwbGF5aW5nKSB7XG4gICAgICAgIHNob3dFcnJvcignQ3VycmVudGx5IGFub3RoZXIgZmlsZSBpcyBwbGF5aW5nLCBwbGVhc2Ugc3RvcCB0aGUgZmlsZSBvciB3YWl0IHVudGlsIGl0IGZpbmlzaGVzJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFydW5uaW5nKSB7XG4gICAgICAgICQoJyNyZXN1bHRzVGV4dCcpLnZhbCgnJyk7ICAgLy8gY2xlYXIgaHlwb3RoZXNlcyBmcm9tIHByZXZpb3VzIHJ1bnNcbiAgICAgICAgY29uc29sZS5sb2coJ05vdCBydW5uaW5nLCBoYW5kbGVNaWNyb3Bob25lKCknKTtcbiAgICAgICAgaGFuZGxlTWljcm9waG9uZSh0b2tlbiwgY3VycmVudE1vZGVsLCBtaWMsIGZ1bmN0aW9uKGVyciwgc29ja2V0KSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgdmFyIG1zZyA9ICdFcnJvcjogJyArIGVyci5tZXNzYWdlO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgICAgICAgIHNob3dFcnJvcihtc2cpO1xuICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWNvcmRCdXR0b24uY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJywgJyNkNzQxMDgnKTtcbiAgICAgICAgICAgIHJlY29yZEJ1dHRvbi5maW5kKCdpbWcnKS5hdHRyKCdzcmMnLCAnaW1hZ2VzL3N0b3Auc3ZnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc3RhcnRpbmcgbWljJyk7XG4gICAgICAgICAgICBtaWMucmVjb3JkKCk7XG4gICAgICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pOyAgICAgICAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnU3RvcHBpbmcgbWljcm9waG9uZSwgc2VuZGluZyBzdG9wIGFjdGlvbiBtZXNzYWdlJyk7XG4gICAgICAgIHJlY29yZEJ1dHRvbi5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICByZWNvcmRCdXR0b24uZmluZCgnaW1nJykuYXR0cignc3JjJywgJ2ltYWdlcy9taWNyb3Bob25lLnN2ZycpO1xuICAgICAgICAkLnB1Ymxpc2goJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgICAgIG1pYy5zdG9wKCk7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pKCkpO1xufSIsIlxudmFyIGluaXRQbGF5U2FtcGxlID0gcmVxdWlyZSgnLi9wbGF5c2FtcGxlJykuaW5pdFBsYXlTYW1wbGU7XG5cbmV4cG9ydHMuaW5pdFNlbGVjdE1vZGVsID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgZnVuY3Rpb24gaXNEZWZhdWx0KG1vZGVsKSB7XG4gICAgcmV0dXJuIG1vZGVsID09PSAnZW4tVVNfQnJvYWRiYW5kTW9kZWwnO1xuICB9XG5cbiAgY3R4Lm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgJChcIiNkcm9wZG93bk1lbnVMaXN0XCIpLmFwcGVuZChcbiAgICAgICQoXCI8bGk+XCIpXG4gICAgICAgIC5hdHRyKCdyb2xlJywgJ3ByZXNlbnRhdGlvbicpXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgJCgnPGE+JykuYXR0cigncm9sZScsICdtZW51LWl0ZW0nKVxuICAgICAgICAgICAgLmF0dHIoJ2hyZWYnLCAnLycpXG4gICAgICAgICAgICAuYXR0cignZGF0YS1tb2RlbCcsIG1vZGVsLm5hbWUpXG4gICAgICAgICAgICAuYXBwZW5kKG1vZGVsLmRlc2NyaXB0aW9uKVxuICAgICAgICAgIClcbiAgICAgIClcbiAgfSk7XG5cbiAgJChcIiNkcm9wZG93bk1lbnVMaXN0XCIpLmNsaWNrKGZ1bmN0aW9uKGV2dCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBjb25zb2xlLmxvZygnQ2hhbmdlIHZpZXcnLCAkKGV2dC50YXJnZXQpLnRleHQoKSk7XG4gICAgdmFyIG5ld01vZGVsRGVzY3JpcHRpb24gPSAkKGV2dC50YXJnZXQpLnRleHQoKTtcbiAgICB2YXIgbmV3TW9kZWwgPSAkKGV2dC50YXJnZXQpLmRhdGEoJ21vZGVsJyk7XG4gICAgJCgnI2Ryb3Bkb3duTWVudURlZmF1bHQnKS5lbXB0eSgpLnRleHQobmV3TW9kZWxEZXNjcmlwdGlvbik7XG4gICAgJCgnI2Ryb3Bkb3duTWVudTEnKS5kcm9wZG93bigndG9nZ2xlJyk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRNb2RlbCcsIG5ld01vZGVsKTtcbiAgICBjdHguY3VycmVudE1vZGVsID0gbmV3TW9kZWw7XG4gICAgaW5pdFBsYXlTYW1wbGUoY3R4KTtcbiAgICAkLnB1Ymxpc2goJ2NsZWFyc2NyZWVuJyk7XG4gIH0pO1xuXG59IiwiXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuaW5pdFNlc3Npb25QZXJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIHNlc3Npb24gcGVybWlzc2lvbnMgaGFuZGxlcicpO1xuICAvLyBSYWRpbyBidXR0b25zXG4gIHZhciBzZXNzaW9uUGVybWlzc2lvbnNSYWRpbyA9ICQoXCIjc2Vzc2lvblBlcm1pc3Npb25zUmFkaW9Hcm91cCBpbnB1dFt0eXBlPSdyYWRpbyddXCIpO1xuICBzZXNzaW9uUGVybWlzc2lvbnNSYWRpby5jbGljayhmdW5jdGlvbihldnQpIHtcbiAgICB2YXIgY2hlY2tlZFZhbHVlID0gc2Vzc2lvblBlcm1pc3Npb25zUmFkaW8uZmlsdGVyKCc6Y2hlY2tlZCcpLnZhbCgpO1xuICAgIGNvbnNvbGUubG9nKCdjaGVja2VkVmFsdWUnLCBjaGVja2VkVmFsdWUpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzZXNzaW9uUGVybWlzc2lvbnMnLCBjaGVja2VkVmFsdWUpO1xuICB9KTtcbn1cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLnNob3dFcnJvciA9IGZ1bmN0aW9uKG1zZykge1xuICBjb25zb2xlLmxvZygnRXJyb3I6ICcsIG1zZyk7XG4gIHZhciBlcnJvckFsZXJ0ID0gJCgnLmVycm9yLXJvdycpO1xuICBlcnJvckFsZXJ0LmhpZGUoKTtcbiAgZXJyb3JBbGVydC5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAnI2Q3NDEwOCcpO1xuICBlcnJvckFsZXJ0LmNzcygnY29sb3InLCAnd2hpdGUnKTtcbiAgdmFyIGVycm9yTWVzc2FnZSA9ICQoJyNlcnJvck1lc3NhZ2UnKTtcbiAgZXJyb3JNZXNzYWdlLnRleHQobXNnKTtcbiAgZXJyb3JBbGVydC5zaG93KCk7XG4gICQoJyNlcnJvckNsb3NlJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlcnJvckFsZXJ0LmhpZGUoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufVxuXG5leHBvcnRzLnNob3dOb3RpY2UgPSBmdW5jdGlvbihtc2cpIHtcbiAgY29uc29sZS5sb2coJ05vdGljZTogJywgbXNnKTtcbiAgdmFyIG5vdGljZUFsZXJ0ID0gJCgnLm5vdGlmaWNhdGlvbi1yb3cnKTtcbiAgbm90aWNlQWxlcnQuaGlkZSgpO1xuICBub3RpY2VBbGVydC5jc3MoJ2JvcmRlcicsICcycHggc29saWQgI2VjZWNlYycpO1xuICBub3RpY2VBbGVydC5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAnI2Y0ZjRmNCcpO1xuICBub3RpY2VBbGVydC5jc3MoJ2NvbG9yJywgJ2JsYWNrJyk7XG4gIHZhciBub3RpY2VNZXNzYWdlID0gJCgnI25vdGlmaWNhdGlvbk1lc3NhZ2UnKTtcbiAgbm90aWNlTWVzc2FnZS50ZXh0KG1zZyk7XG4gIG5vdGljZUFsZXJ0LnNob3coKTtcbiAgJCgnI25vdGlmaWNhdGlvbkNsb3NlJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBub3RpY2VBbGVydC5oaWRlKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn1cblxuZXhwb3J0cy5oaWRlRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGVycm9yQWxlcnQgPSAkKCcuZXJyb3Itcm93Jyk7XG4gIGVycm9yQWxlcnQuaGlkZSgpO1xufSIsIlxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmluaXRTaG93VGFiID0gZnVuY3Rpb24oKSB7XG5cbiAgJCgnLm5hdi10YWJzIGFbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKS5vbignc2hvd24uYnMudGFiJywgZnVuY3Rpb24gKGUpIHtcbiAgICAvL3Nob3cgc2VsZWN0ZWQgdGFiIC8gYWN0aXZlXG4gICAgdmFyIHRhcmdldCA9ICQoZS50YXJnZXQpLnRleHQoKTtcbiAgICBpZiAodGFyZ2V0ID09PSAnSlNPTicpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzaG93aW5nIGpzb24nKTtcbiAgICAgICQucHVibGlzaCgnc2hvd2pzb24nKTtcbiAgICB9XG4gIH0pO1xuXG59Il19
