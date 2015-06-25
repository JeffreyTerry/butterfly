/**
 * Copyright 2014, 2015 IBM Corp. All Rights Reserved.
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

'use strict';

var express = require('express'),
    app = express(),
    errorhandler = require('errorhandler'),
    bluemix = require('./config/bluemix'),
    request = require('request'),
    path = require('path'),
    // Environmental variable: username, password, etc.
    authorizationConfig = JSON.parse(process.env.WATSON_CONFIG),
    extend = require('util')._extend;

// if bluemix authorization credentials exist, then override local
var authorizationCredentials = extend(authorizationConfig, bluemix.getServiceCreds('authorization'));
var authorization = new watson.authorization(authorizationCredentials);

// Setup static public directory
app.use(express.static(path.join(__dirname , './public')));

// Add error handling in dev
if (!process.env.VCAP_SERVICES) {
  app.use(errorhandler());
}

// Serve home page
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, './public', 'index.html'));
});

// Get token from Watson using your credentials
app.get('/token', function(req, res) {
  console.log('Fetching token');
  var params = {
    // Specify URL of resource required
    url: 'https://' + credentials.hostname + '/speech-to-text/api'
  }
  authorization.getToken(params, function(token) {
    console.log('Fetching token', token);
    res.send(token);
  });
});


var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);