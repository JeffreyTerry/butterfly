var Keen = require('keen-js');

exports.client = new Keen({
  projectId: "5606f3f490e4bd7b0e0e1ddc", // String (required always)
  writeKey: "2fc76068ea39562a5e3c8f3ae5c10a0588bf074246861b36fa17150bd21dd01140ac051b2bae4ae1158e217857baf73112120d4f90a72b56e4c1c97d3f4b0e248b905427cfe8182552bac3b91ae72d7d062ab20412681ac39844918a4ca2d00c4075ae048030fe8fc95212774010db65",   // String (required for sending data)
  readKey: "b2e5446a0409b73d192cc7c6c3b39ad2fc5abea3876d1885eae25f250da383497a227cfd6f69d30246065a96e621a33a2b6d22feec80a7ee4d520775552a0f09bc378ee7ec8a53d7534c4163bc5b920d7eb698554ce5b0fd8bf00de399675d454146166d1f94da22160808ce27511064"      // String (required for querying data)

  // protocol: "https",         // String (optional: https | http | auto)
  // host: "api.keen.io/3.0",   // String (optional)
  // requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
});

