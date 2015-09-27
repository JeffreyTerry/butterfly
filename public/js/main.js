(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],2:[function(require,module,exports){
/*!
  * domready (c) Dustin Diaz 2012 - License MIT
  */
!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()
}('domready', function (ready) {

  var fns = [], fn, f = false
    , doc = document
    , testEl = doc.documentElement
    , hack = testEl.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , addEventListener = 'addEventListener'
    , onreadystatechange = 'onreadystatechange'
    , readyState = 'readyState'
    , loadedRgx = hack ? /^loaded|^c/ : /^loaded|c/
    , loaded = loadedRgx.test(doc[readyState])

  function flush(f) {
    loaded = 1
    while (f = fns.shift()) f()
  }

  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
    doc.removeEventListener(domContentLoaded, fn, f)
    flush()
  }, f)


  hack && doc.attachEvent(onreadystatechange, fn = function () {
    if (/^c/.test(doc[readyState])) {
      doc.detachEvent(onreadystatechange, fn)
      flush()
    }
  })

  return (ready = hack ?
    function (fn) {
      self != top ?
        loaded ? fn() : fns.push(fn) :
        function () {
          try {
            testEl.doScroll('left')
          } catch (e) {
            return setTimeout(function() { ready(fn) }, 50)
          }
          fn()
        }()
    } :
    function (fn) {
      loaded ? fn() : fns.push(fn)
    })
})

},{}],3:[function(require,module,exports){
(function (global){
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 * http://spin.js.org/
 *
 * Example:
    var opts = {
      lines: 12             // The number of lines to draw
    , length: 7             // The length of each line
    , width: 5              // The line thickness
    , radius: 10            // The radius of the inner circle
    , scale: 1.0            // Scales overall size of the spinner
    , corners: 1            // Roundness (0..1)
    , color: '#000'         // #rgb or #rrggbb
    , opacity: 1/4          // Opacity of the lines
    , rotate: 0             // Rotation offset
    , direction: 1          // 1: clockwise, -1: counterclockwise
    , speed: 1              // Rounds per second
    , trail: 100            // Afterglow percentage
    , fps: 20               // Frames per second when using setTimeout()
    , zIndex: 2e9           // Use a high z-index by default
    , className: 'spinner'  // CSS class to assign to the element
    , top: '50%'            // center vertically
    , left: '50%'           // center horizontally
    , shadow: false         // Whether to render a shadow
    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
    , position: 'absolute'  // Element positioning
    }
    var target = document.getElementById('foo')
    var spinner = new Spinner(opts).spin(target)
 */
;(function (root, factory) {

  /* CommonJS */
  if (typeof module == 'object' && module.exports) module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}(this, function () {
  "use strict"

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */
    , sheet /* A stylesheet to hold the @keyframe or VML rules. */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl (tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for (n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins (parent /* child1, child2, ...*/) {
    for (var i = 1, n = arguments.length; i < n; i++) {
      parent.appendChild(arguments[i])
    }

    return parent
  }

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation (alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor (el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    if (s[prop] !== undefined) return prop
    for (i = 0; i < prefixes.length; i++) {
      pp = prefixes[i]+prop
      if (s[pp] !== undefined) return pp
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css (el, prop) {
    for (var n in prop) {
      el.style[vendor(el, n) || n] = prop[n]
    }

    return el
  }

  /**
   * Fills in default values.
   */
  function merge (obj) {
    for (var i = 1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def) {
        if (obj[n] === undefined) obj[n] = def[n]
      }
    }
    return obj
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor (color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12             // The number of lines to draw
  , length: 7             // The length of each line
  , width: 5              // The line thickness
  , radius: 10            // The radius of the inner circle
  , scale: 1.0            // Scales overall size of the spinner
  , corners: 1            // Roundness (0..1)
  , color: '#000'         // #rgb or #rrggbb
  , opacity: 1/4          // Opacity of the lines
  , rotate: 0             // Rotation offset
  , direction: 1          // 1: clockwise, -1: counterclockwise
  , speed: 1              // Rounds per second
  , trail: 100            // Afterglow percentage
  , fps: 20               // Frames per second when using setTimeout()
  , zIndex: 2e9           // Use a high z-index by default
  , className: 'spinner'  // CSS class to assign to the element
  , top: '50%'            // center vertically
  , left: '50%'           // center horizontally
  , shadow: false         // Whether to render a shadow
  , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
  , position: 'absolute'  // Element positioning
  }

  /** The constructor */
  function Spinner (o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function (target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = createEl(null, {className: o.className})

      css(el, {
        position: o.position
      , width: 0
      , zIndex: o.zIndex
      , left: o.left
      , top: o.top
      })

      if (target) {
        target.insertBefore(el, target.firstChild || null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps / o.speed
          , ostep = (1 - o.opacity) / (f * o.trail / 100)
          , astep = f / o.lines

        ;(function anim () {
          i++
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000 / fps))
        })()
      }
      return self
    }

    /**
     * Stops and removes the Spinner.
     */
  , stop: function () {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    }

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
  , lines: function (el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill (color, shadow) {
        return css(createEl(), {
          position: 'absolute'
        , width: o.scale * (o.length + o.width) + 'px'
        , height: o.scale * o.width + 'px'
        , background: color
        , boxShadow: shadow
        , transformOrigin: 'left'
        , transform: 'rotate(' + ~~(360/o.lines*i + o.rotate) + 'deg) translate(' + o.scale*o.radius + 'px' + ',0)'
        , borderRadius: (o.corners * o.scale * o.width >> 1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute'
        , top: 1 + ~(o.scale * o.width / 2) + 'px'
        , transform: o.hwaccel ? 'translate3d(0,0,0)' : ''
        , opacity: o.opacity
        , animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px #000'), {top: '2px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    }

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
  , opacity: function (el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML () {

    /* Utility function to create a VML tag */
    function vml (tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function (el, o) {
      var r = o.scale * (o.length + o.width)
        , s = o.scale * 2 * r

      function grp () {
        return css(
          vml('group', {
            coordsize: s + ' ' + s
          , coordorigin: -r + ' ' + -r
          })
        , { width: s, height: s }
        )
      }

      var margin = -(o.width + o.length) * o.scale * 2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg (i, dx, filter) {
        ins(
          g
        , ins(
            css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx})
          , ins(
              css(
                vml('roundrect', {arcsize: o.corners})
              , { width: r
                , height: o.scale * o.width
                , left: o.scale * o.radius
                , top: -o.scale * o.width >> 1
                , filter: filter
                }
              )
            , vml('fill', {color: getColor(o.color, i), opacity: o.opacity})
            , vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++) {
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')
        }

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function (el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i + o < c.childNodes.length) {
        c = c.childNodes[i + o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  if (typeof document !== 'undefined') {
    sheet = (function () {
      var el = createEl('style', {type : 'text/css'})
      ins(document.getElementsByTagName('head')[0], el)
      return el.sheet || el.styleSheet
    }())

    var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

    if (!vendor(probe, 'transform') && probe.adj) initVML()
    else useCssAnimations = vendor(probe, 'animation')
  }

  return Spinner

}));

},{}],5:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.req.method !='HEAD' 
     ? this.xhr.responseText 
     : null;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && str.length
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self); 
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
    }

    self.callback(err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":6,"reduce":7}],6:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],7:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],8:[function(require,module,exports){
var Keen = require("./index"),
    each = require("./utils/each");

module.exports = function(){
  var loaded = window['Keen'] || null,
      cached = window['_' + 'Keen'] || null,
      clients,
      ready;

  if (loaded && cached) {
    clients = cached['clients'] || {},
    ready = cached['ready'] || [];

    each(clients, function(client, id){

      each(Keen.prototype, function(method, key){
        loaded.prototype[key] = method;
      });

      each(["Query", "Request", "Dataset", "Dataviz"], function(name){
        loaded[name] = (Keen[name]) ? Keen[name] : function(){};
      });

      // Run config
      if (client._config) {
        client.configure.call(client, client._config);
      }

      // Add Global Properties
      if (client._setGlobalProperties) {
        each(client._setGlobalProperties, function(fn){
          client.setGlobalProperties.apply(client, fn);
        });
      }

      // Send Queued Events
      if (client._addEvent) {
        each(client._addEvent, function(obj){
          client.addEvent.apply(client, obj);
        });
      }

      // Set event listeners
      var callback = client._on || [];
      if (client._on) {
        each(client._on, function(obj){
          client.on.apply(client, obj);
        });
        client.trigger('ready');
      }

      // unset config
      each(["_config", "_setGlobalProperties", "_addEvent", "_on"], function(name){
        if (client[name]) {
          client[name] = undefined;
          try{
            delete client[name];
          } catch(e){}
        }
      });

    });

    each(ready, function(cb, i){
      Keen.once("ready", cb);
    });
  }

  window['_' + 'Keen'] = undefined;
  try {
    delete window['_' + 'Keen']
  } catch(e) {}
};

},{"./index":16,"./utils/each":28}],9:[function(require,module,exports){
module.exports = function(){
  return "undefined" == typeof window ? "server" : "browser";
};

},{}],10:[function(require,module,exports){
var each = require('../utils/each'),
    json = require('../utils/json-shim');

module.exports = function(params){
  var query = [];
  each(params, function(value, key){
    // if (Object.prototype.toString.call(value) !== '[object String]') {}
    if ('string' !== typeof value) {
      value = json.stringify(value);
    }
    query.push(key + '=' + encodeURIComponent(value));
  });
  return '?' + query.join('&');
};

},{"../utils/each":28,"../utils/json-shim":31}],11:[function(require,module,exports){
module.exports = function(){
  return new Date().getTimezoneOffset() * -60;
};

},{}],12:[function(require,module,exports){
module.exports = function(){
  if ("undefined" !== typeof window) {
    if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
      return 2000;
    }
  }
  return 16000;
};

},{}],13:[function(require,module,exports){
module.exports = function() {
  // yay, superagent!
  var root = "undefined" == typeof window ? this : window;
  if (root.XMLHttpRequest && ("file:" != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch(e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch(e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch(e) {}
  }
  return false;
};

},{}],14:[function(require,module,exports){
module.exports = function(err, res, callback) {
  var cb = callback || function() {};
  if (res && !res.ok) {
    var is_err = res.body && res.body.error_code;
    err = new Error(is_err ? res.body.message : 'Unknown error occurred');
    err.code = is_err ? res.body.error_code : 'UnknownError';
  }
  if (err) {
    cb(err, null);
  }
  else {
    cb(null, res.body);
  }
  return;
};

},{}],15:[function(require,module,exports){
var superagent = require('superagent');
var each = require('../utils/each'),
    getXHR = require('./get-xhr-object');

module.exports = function(type, opts){
  return function(request) {
    var __super__ = request.constructor.prototype.end;
    if ( 'undefined' === typeof window ) return;
    request.requestType = request.requestType || {};
    request.requestType['type'] = type;
    request.requestType['options'] = request.requestType['options'] || {
      // TODO: find acceptable default values
      async: true,
      success: {
        responseText: '{ "created": true }',
        status: 201
      },
      error: {
        responseText: '{ "error_code": "ERROR", "message": "Request failed" }',
        status: 404
      }
    };

    // Apply options
    if (opts) {
      if ( 'boolean' === typeof opts.async ) {
        request.requestType['options'].async = opts.async;
      }
      if ( opts.success ) {
        extend(request.requestType['options'].success, opts.success);
      }
      if ( opts.error ) {
        extend(request.requestType['options'].error, opts.error);
      }
    }

    request.end = function(fn){
      var self = this,
          reqType = (this.requestType) ? this.requestType['type'] : 'xhr',
          query,
          timeout;

      if ( ('GET' !== self['method'] || 'xhr' === reqType) && self.requestType['options'].async ) {
        __super__.call(self, fn);
        return;
      }

      query = self._query.join('&');
      timeout = self._timeout;
      // store callback
      self._callback = fn || noop;
      // timeout
      if (timeout && !self._timer) {
        self._timer = setTimeout(function(){
          abortRequest.call(self);
        }, timeout);
      }
      if (query) {
        query = superagent.serializeObject(query);
        self.url += ~self.url.indexOf('?') ? '&' + query : '?' + query;
      }
      // send stuff
      self.emit('request', self);

      if ( !self.requestType['options'].async ) {
        sendXhrSync.call(self);
      }
      else if ( 'jsonp' === reqType ) {
        sendJsonp.call(self);
      }
      else if ( 'beacon' === reqType ) {
        sendBeacon.call(self);
      }
      return self;
    };
    return request;
  };
};

function sendXhrSync(){
  var xhr = getXHR();
  if (xhr) {
    xhr.open('GET', this.url, false);
    xhr.send(null);
  }
  return this;
}

function sendJsonp(){
  var self = this,
      timestamp = new Date().getTime(),
      script = document.createElement('script'),
      parent = document.getElementsByTagName('head')[0],
      callbackName = 'keenJSONPCallback',
      loaded = false;
  callbackName += timestamp;
  while (callbackName in window) {
    callbackName += 'a';
  }
  window[callbackName] = function(response) {
    if (loaded === true) return;
    loaded = true;
    handleSuccess.call(self, response);
    cleanup();
  };
  script.src = self.url + '&jsonp=' + callbackName;
  parent.appendChild(script);
  // for early IE w/ no onerror event
  script.onreadystatechange = function() {
    if (loaded === false && self.readyState === 'loaded') {
      loaded = true;
      handleError.call(self);
      cleanup();
    }
  };
  // non-ie, etc
  script.onerror = function() {
    // on IE9 both onerror and onreadystatechange are called
    if (loaded === false) {
      loaded = true;
      handleError.call(self);
      cleanup();
    }
  };
  function cleanup(){
    window[callbackName] = undefined;
    try {
      delete window[callbackName];
    } catch(e){}
    parent.removeChild(script);
  }
}

function sendBeacon(){
  var self = this,
      img = document.createElement('img'),
      loaded = false;
  img.onload = function() {
    loaded = true;
    if ('naturalHeight' in this) {
      if (this.naturalHeight + this.naturalWidth === 0) {
        this.onerror();
        return;
      }
    } else if (this.width + this.height === 0) {
      this.onerror();
      return;
    }
    handleSuccess.call(self);
  };
  img.onerror = function() {
    loaded = true;
    handleError.call(self);
  };
  img.src = self.url + '&c=clv1';
}

function handleSuccess(res){
  var opts = this.requestType['options']['success'],
      response = '';
  xhrShim.call(this, opts);
  if (res) {
    try {
      response = JSON.stringify(res);
    } catch(e) {}
  }
  else {
    response = opts['responseText'];
  }
  this.xhr.responseText = response;
  this.xhr.status = opts['status'];
  this.emit('end');
}

function handleError(){
  var opts = this.requestType['options']['error'];
  xhrShim.call(this, opts);
  this.xhr.responseText = opts['responseText'];
  this.xhr.status = opts['status'];
  this.emit('end');
}

// custom spin on self.abort();
function abortRequest(){
  this.aborted = true;
  this.clearTimeout();
  this.emit('abort');
}

// hackety hack hack :) keep moving
function xhrShim(opts){
  this.xhr = {
    getAllResponseHeaders: function(){ return ''; },
    getResponseHeader: function(){ return 'application/json'; },
    responseText: opts['responseText'],
    status: opts['status']
  };
  return this;
}

},{"../utils/each":28,"./get-xhr-object":13,"superagent":5}],16:[function(require,module,exports){
var root = 'undefined' !== typeof window ? window : this;
var previous_Keen = root.Keen;

var Emitter = require('./utils/emitter-shim');

function Keen(config) {
  this.configure(config || {});
  Keen.trigger('client', this);
}

Keen.debug = false;
Keen.enabled = true;
Keen.loaded = true;
Keen.version = '0.2.1';

Emitter(Keen);
Emitter(Keen.prototype);

Keen.prototype.configure = function(cfg){
  var config = cfg || {};
  if (config['host']) {
    config['host'].replace(/.*?:\/\//g, '');
  }
  if (config.protocol && config.protocol === 'auto') {
    config['protocol'] = location.protocol.replace(/:/g, '');
  }
  this.config = {
    projectId   : config.projectId,
    writeKey    : config.writeKey,
    readKey     : config.readKey,
    masterKey   : config.masterKey,
    requestType : config.requestType || 'jsonp',
    host        : config['host']     || 'api.keen.io/3.0',
    protocol    : config['protocol'] || 'https',
    globalProperties: null
  };
  if (Keen.debug) {
    this.on('error', Keen.log);
  }
  this.trigger('ready');
};

Keen.prototype.projectId = function(str){
  if (!arguments.length) return this.config.projectId;
  this.config.projectId = (str ? String(str) : null);
  return this;
};

Keen.prototype.masterKey = function(str){
  if (!arguments.length) return this.config.masterKey;
  this.config.masterKey = (str ? String(str) : null);
  return this;
};

Keen.prototype.readKey = function(str){
  if (!arguments.length) return this.config.readKey;
  this.config.readKey = (str ? String(str) : null);
  return this;
};

Keen.prototype.writeKey = function(str){
  if (!arguments.length) return this.config.writeKey;
  this.config.writeKey = (str ? String(str) : null);
  return this;
};

Keen.prototype.url = function(path){
  if (!this.projectId()) {
    this.trigger('error', 'Client is missing projectId property');
    return;
  }
  return this.config.protocol + '://' + this.config.host + '/projects/' + this.projectId() + path;
};

Keen.log = function(message) {
  if (Keen.debug && typeof console == 'object') {
    console.log('[Keen IO]', message);
  }
};

Keen.noConflict = function(){
  root.Keen = previous_Keen;
  return Keen;
};

Keen.ready = function(fn){
  if (Keen.loaded) {
    fn();
  } else {
    Keen.once('ready', fn);
  }
};

module.exports = Keen;

},{"./utils/emitter-shim":29}],17:[function(require,module,exports){
var json = require('../utils/json-shim');
var request = require('superagent');

var Keen = require('../index');

var base64 = require('../utils/base64'),
    each = require('../utils/each'),
    getContext = require('../helpers/get-context'),
    getQueryString = require('../helpers/get-query-string'),
    getUrlMaxLength = require('../helpers/get-url-max-length'),
    getXHR = require('../helpers/get-xhr-object'),
    requestTypes = require('../helpers/superagent-request-types'),
    responseHandler = require('../helpers/superagent-handle-response');

module.exports = function(collection, payload, callback, async) {
  var self = this,
      urlBase = this.url('/events/' + encodeURIComponent(collection)),
      reqType = this.config.requestType,
      data = {},
      cb = callback,
      isAsync,
      getUrl;

  isAsync = ('boolean' === typeof async) ? async : true;

  if (!Keen.enabled) {
    handleValidationError.call(self, 'Keen.enabled = false');
    return;
  }

  if (!self.projectId()) {
    handleValidationError.call(self, 'Missing projectId property');
    return;
  }

  if (!self.writeKey()) {
    handleValidationError.call(self, 'Missing writeKey property');
    return;
  }

  if (!collection || typeof collection !== 'string') {
    handleValidationError.call(self, 'Collection name must be a string');
    return;
  }

  // Attach properties from client.globalProperties
  if (self.config.globalProperties) {
    data = self.config.globalProperties(collection);
  }
  // Attach properties from user-defined event
  each(payload, function(value, key){
    data[key] = value;
  });

  // Override reqType if XHR not supported
  if ( !getXHR() && 'xhr' === reqType ) {
    reqType = 'jsonp';
  }

  // Pre-flight for GET requests
  if ( 'xhr' !== reqType || !isAsync ) {
    getUrl = prepareGetRequest.call(self, urlBase, data);
  }

  if ( getUrl && getContext() === 'browser' ) {
    request
      .get(getUrl)
      .use(requestTypes(reqType, { async: isAsync }))
      .end(handleResponse);
  }
  else if ( getXHR() || getContext() === 'server' ) {
    request
      .post(urlBase)
      .set('Content-Type', 'application/json')
      .set('Authorization', self.writeKey())
      .send(data)
      .end(handleResponse);
  }
  else {
    self.trigger('error', 'Request not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.');
  }

  function handleResponse(err, res){
    responseHandler(err, res, cb);
    cb = callback = null;
  }

  function handleValidationError(msg){
    var err = 'Event not recorded: ' + msg;
    self.trigger('error', err);
    if (cb) {
      cb.call(self, err, null);
      cb = callback = null;
    }
  }

  return;
};

function prepareGetRequest(url, data){
  // Set API key
  url += getQueryString({
    api_key  : this.writeKey(),
    data     : base64.encode( json.stringify(data) ),
    modified : new Date().getTime()
  });
  return ( url.length < getUrlMaxLength() ) ? url : false;
}

},{"../helpers/get-context":9,"../helpers/get-query-string":10,"../helpers/get-url-max-length":12,"../helpers/get-xhr-object":13,"../helpers/superagent-handle-response":14,"../helpers/superagent-request-types":15,"../index":16,"../utils/base64":26,"../utils/each":28,"../utils/json-shim":31,"superagent":5}],18:[function(require,module,exports){
var Keen = require('../index');
var request = require('superagent');

var each = require('../utils/each'),
    getContext = require('../helpers/get-context'),
    getXHR = require('../helpers/get-xhr-object'),
    requestTypes = require('../helpers/superagent-request-types'),
    responseHandler = require('../helpers/superagent-handle-response');

module.exports = function(payload, callback) {
  var self = this,
      urlBase = this.url('/events'),
      data = {},
      cb = callback;

  if (!Keen.enabled) {
    handleValidationError.call(self, 'Keen.enabled = false');
    return;
  }

  if (!self.projectId()) {
    handleValidationError.call(self, 'Missing projectId property');
    return;
  }

  if (!self.writeKey()) {
    handleValidationError.call(self, 'Missing writeKey property');
    return;
  }

  if (arguments.length > 2) {
    handleValidationError.call(self, 'Incorrect arguments provided to #addEvents method');
    return;
  }

  if (typeof payload !== 'object' || payload instanceof Array) {
    handleValidationError.call(self, 'Request payload must be an object');
    return;
  }

  // Attach properties from client.globalProperties
  if (self.config.globalProperties) {
    // Loop over each set of events
    each(payload, function(events, collection){
      // Loop over each individual event
      each(events, function(body, index){
        // Start with global properties for this collection
        var base = self.config.globalProperties(collection);
        // Apply provided properties for this event body
        each(body, function(value, key){
          base[key] = value;
        });
        // Create a new payload
        data[collection].push(base);
      });
    });
  }
  else {
    // Use existing payload
    data = payload;
  }

  if ( getXHR() || getContext() === 'server' ) {
    request
      .post(urlBase)
      .set('Content-Type', 'application/json')
      .set('Authorization', self.writeKey())
      .send(data)
      .end(function(err, res){
        responseHandler(err, res, cb);
        cb = callback = null;
      });
  }
  else {
    // TODO: queue and fire in small, asynchronous batches
    self.trigger('error', 'Events not recorded: XHR support is required for batch upload');
  }

  function handleValidationError(msg){
    var err = 'Events not recorded: ' + msg;
    self.trigger('error', err);
    if (cb) {
      cb.call(self, err, null);
      cb = callback = null;
    }
  }

  return;
};

},{"../helpers/get-context":9,"../helpers/get-xhr-object":13,"../helpers/superagent-handle-response":14,"../helpers/superagent-request-types":15,"../index":16,"../utils/each":28,"superagent":5}],19:[function(require,module,exports){
var request = require('superagent');
var getQueryString = require('../helpers/get-query-string'),
    handleResponse = require('../helpers/superagent-handle-response'),
    requestTypes = require('../helpers/superagent-request-types');

module.exports = function(url, params, api_key, callback){
  var reqType = this.config.requestType,
      data = params || {};

  if (reqType === 'beacon') {
    reqType = 'jsonp';
  }

  // Ensure api_key is present for GET requests
  data['api_key'] = data['api_key'] || api_key;

  request
    .get(url+getQueryString(data))
    .use(requestTypes(reqType))
    .end(function(err, res){
      handleResponse(err, res, callback);
      callback = null;
    });
};

},{"../helpers/get-query-string":10,"../helpers/superagent-handle-response":14,"../helpers/superagent-request-types":15,"superagent":5}],20:[function(require,module,exports){
var request = require('superagent');
var handleResponse = require('../helpers/superagent-handle-response');

module.exports = function(url, data, api_key, callback){
  request
    .post(url)
    .set('Content-Type', 'application/json')
    .set('Authorization', api_key)
    .send(data || {})
    .end(function(err, res) {
      handleResponse(err, res, callback);
      callback = null;
    });
};

},{"../helpers/superagent-handle-response":14,"superagent":5}],21:[function(require,module,exports){
var Request = require("../request");
module.exports = function(query, callback) {
  var queries = [],
      cb = callback,
      request;

  if (query instanceof Array) {
    queries = query;
  } else {
    queries.push(query);
  }
  request = new Request(this, queries, cb).refresh();
  cb = callback = null;
  return request;
};

},{"../request":25}],22:[function(require,module,exports){
module.exports = function(newGlobalProperties) {
  if (newGlobalProperties && typeof(newGlobalProperties) == "function") {
    this.config.globalProperties = newGlobalProperties;
  } else {
    this.trigger("error", "Invalid value for global properties: " + newGlobalProperties);
  }
};

},{}],23:[function(require,module,exports){
// var sendEvent = require("../utils/sendEvent");
var addEvent = require("./addEvent");

module.exports = function(jsEvent, eventCollection, payload, timeout, timeoutCallback){
  var evt = jsEvent,
      target = (evt.currentTarget) ? evt.currentTarget : (evt.srcElement || evt.target),
      timer = timeout || 500,
      triggered = false,
      targetAttr = "",
      callback,
      win;

  if (target.getAttribute !== void 0) {
    targetAttr = target.getAttribute("target");
  } else if (target.target) {
    targetAttr = target.target;
  }

  if ((targetAttr == "_blank" || targetAttr == "blank") && !evt.metaKey) {
    win = window.open("about:blank");
    win.document.location = target.href;
  }

  if (target.nodeName === "A") {
    callback = function(){
      if(!triggered && !evt.metaKey && (targetAttr !== "_blank" && targetAttr !== "blank")){
        triggered = true;
        window.location = target.href;
      }
    };
  } else if (target.nodeName === "FORM") {
    callback = function(){
      if(!triggered){
        triggered = true;
        target.submit();
      }
    };
  } else {
    this.trigger("error", "#trackExternalLink method not attached to an <a> or <form> DOM element");
  }

  if (timeoutCallback) {
    callback = function(){
      if(!triggered){
        triggered = true;
        timeoutCallback();
      }
    };
  }
  addEvent.call(this, eventCollection, payload, callback);

  setTimeout(callback, timer);
  if (!evt.metaKey) {
    return false;
  }
};

},{"./addEvent":17}],24:[function(require,module,exports){
var each = require("./utils/each"),
    extend = require("./utils/extend"),
    getTimezoneOffset = require("./helpers/get-timezone-offset"),
    getQueryString = require("./helpers/get-query-string");

var Emitter = require('./utils/emitter-shim');

function Query(){
  this.configure.apply(this, arguments);
};
Emitter(Query.prototype);

Query.prototype.configure = function(analysisType, params) {
  this.analysis = analysisType;

  // Apply params w/ #set method
  this.params = this.params || {};
  this.set(params);

  // Localize timezone if none is set
  if (this.params.timezone === void 0) {
    this.params.timezone = getTimezoneOffset();
  }
  return this;
};

Query.prototype.set = function(attributes) {
  var self = this;
  each(attributes, function(v, k){
    var key = k, value = v;
    if (k.match(new RegExp("[A-Z]"))) {
      key = k.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
    }
    self.params[key] = value;
    if (value instanceof Array) {
      each(value, function(dv, index){
        if (dv instanceof Array == false && typeof dv === "object") { //  _type(dv)==="Object"
          each(dv, function(deepValue, deepKey){
            if (deepKey.match(new RegExp("[A-Z]"))) {
              var _deepKey = deepKey.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
              delete self.params[key][index][deepKey];
              self.params[key][index][_deepKey] = deepValue;
            }
          });
        }
      });
    }
  });
  return self;
};

Query.prototype.get = function(attribute) {
  var key = attribute;
  if (key.match(new RegExp("[A-Z]"))) {
    key = key.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
  }
  if (this.params) {
    return this.params[key] || null;
  }
};

Query.prototype.addFilter = function(property, operator, value) {
  this.params.filters = this.params.filters || [];
  this.params.filters.push({
    "property_name": property,
    "operator": operator,
    "property_value": value
  });
  return this;
};

module.exports = Query;

},{"./helpers/get-query-string":10,"./helpers/get-timezone-offset":11,"./utils/each":28,"./utils/emitter-shim":29,"./utils/extend":30}],25:[function(require,module,exports){
var each = require("./utils/each"),
    extend = require("./utils/extend"),
    sendQuery = require("./utils/sendQuery");

var Keen = require("./");
var Emitter = require('./utils/emitter-shim');

function Request(client, queries, callback){
  var cb = callback;
  this.config = {
    timeout: 300 * 1000
  };
  this.configure(client, queries, cb);
  cb = callback = null;
};
Emitter(Request.prototype);

Request.prototype.configure = function(client, queries, callback){
  var cb = callback;
  extend(this, {
    "client"   : client,
    "queries"  : queries,
    "data"     : {},
    "callback" : cb
  });
  cb = callback = null;
  return this;
};

Request.prototype.timeout = function(ms){
  if (!arguments.length) return this.config.timeout;
  this.config.timeout = (!isNaN(parseInt(ms)) ? parseInt(ms) : null);
  return this;
};

Request.prototype.refresh = function(){
  var self = this,
      completions = 0,
      response = [],
      errored = false;

  var handleResponse = function(err, res, index){
    if (errored) {
      return;
    }
    if (err) {
      self.trigger("error", err);
      if (self.callback) {
        self.callback(err, null);
      }
      errored = true;
      return;
    }
    response[index] = res;
    completions++;
    if (completions == self.queries.length && !errored) {
      self.data = (self.queries.length == 1) ? response[0] : response;
      self.trigger("complete", null, self.data);
      if (self.callback) {
        self.callback(null, self.data);
      }
    }
  };

  each(self.queries, function(query, index){
    var path;
    var cbSequencer = function(err, res){
      handleResponse(err, res, index);
    };

    if (query instanceof Keen.Query) {
      path = "/queries/" + query.analysis;
      sendQuery.call(self, path, query.params, cbSequencer);
    }
    else if ( Object.prototype.toString.call(query) === "[object String]" ) {
      path = "/saved_queries/" + encodeURIComponent(query) + "/result";
      sendQuery.call(self, path, null, cbSequencer);
    }
    else {
      var res = {
        statusText: "Bad Request",
        responseText: { message: "Error: Query " + (+index+1) + " of " + self.queries.length + " for project " + self.client.projectId() + " is not a valid request" }
      };
      self.trigger("error", res.responseText.message);
      if (self.callback) {
        self.callback(res.responseText.message, null);
      }
    }
  });
  return this;
};

module.exports = Request;

},{"./":16,"./utils/each":28,"./utils/emitter-shim":29,"./utils/extend":30,"./utils/sendQuery":33}],26:[function(require,module,exports){
module.exports = {
  map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function (n) {
    "use strict";
    var o = "", i = 0, m = this.map, i1, i2, i3, e1, e2, e3, e4;
    n = this.utf8.encode(n);
    while (i < n.length) {
      i1 = n.charCodeAt(i++); i2 = n.charCodeAt(i++); i3 = n.charCodeAt(i++);
      e1 = (i1 >> 2); e2 = (((i1 & 3) << 4) | (i2 >> 4)); e3 = (isNaN(i2) ? 64 : ((i2 & 15) << 2) | (i3 >> 6));
      e4 = (isNaN(i2) || isNaN(i3)) ? 64 : i3 & 63;
      o = o + m.charAt(e1) + m.charAt(e2) + m.charAt(e3) + m.charAt(e4);
    } return o;
  },
  decode: function (n) {
    "use strict";
    var o = "", i = 0, m = this.map, cc = String.fromCharCode, e1, e2, e3, e4, c1, c2, c3;
    n = n.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < n.length) {
      e1 = m.indexOf(n.charAt(i++)); e2 = m.indexOf(n.charAt(i++));
      e3 = m.indexOf(n.charAt(i++)); e4 = m.indexOf(n.charAt(i++));
      c1 = (e1 << 2) | (e2 >> 4); c2 = ((e2 & 15) << 4) | (e3 >> 2);
      c3 = ((e3 & 3) << 6) | e4;
      o = o + (cc(c1) + ((e3 != 64) ? cc(c2) : "")) + (((e4 != 64) ? cc(c3) : ""));
    } return this.utf8.decode(o);
  },
  utf8: {
    encode: function (n) {
      "use strict";
      var o = "", i = 0, cc = String.fromCharCode, c;
      while (i < n.length) {
        c = n.charCodeAt(i++); o = o + ((c < 128) ? cc(c) : ((c > 127) && (c < 2048)) ?
        (cc((c >> 6) | 192) + cc((c & 63) | 128)) : (cc((c >> 12) | 224) + cc(((c >> 6) & 63) | 128) + cc((c & 63) | 128)));
        } return o;
    },
    decode: function (n) {
      "use strict";
      var o = "", i = 0, cc = String.fromCharCode, c2, c;
      while (i < n.length) {
        c = n.charCodeAt(i);
        o = o + ((c < 128) ? [cc(c), i++][0] : ((c > 191) && (c < 224)) ?
        [cc(((c & 31) << 6) | ((c2 = n.charCodeAt(i + 1)) & 63)), (i += 2)][0] :
        [cc(((c & 15) << 12) | (((c2 = n.charCodeAt(i + 1)) & 63) << 6) | ((c3 = n.charCodeAt(i + 2)) & 63)), (i += 3)][0]);
      } return o;
    }
  }
};

},{}],27:[function(require,module,exports){
var json = require('./json-shim');

module.exports = function(target) {
  return json.parse( json.stringify( target ) );
};

},{"./json-shim":31}],28:[function(require,module,exports){
module.exports = function(o, cb, s){
  var n;
  if (!o){
    return 0;
  }
  s = !s ? o : s;
  if (o instanceof Array){
    // Indexed arrays, needed for Safari
    for (n=0; n<o.length; n++) {
      if (cb.call(s, o[n], n, o) === false){
        return 0;
      }
    }
  } else {
    // Hashtables
    for (n in o){
      if (o.hasOwnProperty(n)) {
        if (cb.call(s, o[n], n, o) === false){
          return 0;
        }
      }
    }
  }
  return 1;
};

},{}],29:[function(require,module,exports){
var Emitter = require('component-emitter');
Emitter.prototype.trigger = Emitter.prototype.emit;
module.exports = Emitter;

},{"component-emitter":1}],30:[function(require,module,exports){
module.exports = function(target){
  for (var i = 1; i < arguments.length; i++) {
    for (var prop in arguments[i]){
      target[prop] = arguments[i][prop];
    }
  }
  return target;
};

},{}],31:[function(require,module,exports){
module.exports = ('undefined' !== typeof window && window.JSON) ? window.JSON : require("json3");

},{"json3":3}],32:[function(require,module,exports){
function parseParams(str){
  // via: http://stackoverflow.com/a/2880929/2511985
  var urlParams = {},
      match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = str.split("?")[1];

  while (!!(match=search.exec(query))) {
    urlParams[decode(match[1])] = decode(match[2]);
  }
  return urlParams;
};

module.exports = parseParams;

},{}],33:[function(require,module,exports){
var request = require('superagent');

var getContext = require('../helpers/get-context'),
    getQueryString = require('../helpers/get-query-string'),
    getUrlMaxLength = require('../helpers/get-url-max-length'),
    getXHR = require('../helpers/get-xhr-object'),
    requestTypes = require('../helpers/superagent-request-types'),
    responseHandler = require('../helpers/superagent-handle-response');

module.exports = function(path, params, callback){
  var self = this,
      urlBase = this.client.url(path),
      reqType = this.client.config.requestType,
      cb = callback;

  callback = null;

  if (!self.client.projectId()) {
    self.client.trigger('error', 'Query not sent: Missing projectId property');
    return;
  }

  if (!self.client.readKey()) {
    self.client.trigger('error', 'Query not sent: Missing readKey property');
    return;
  }

  if (getXHR() || getContext() === 'server' ) {
    request
      .post(urlBase)
        .set('Content-Type', 'application/json')
        .set('Authorization', self.client.readKey())
        .timeout(self.timeout())
        .send(params || {})
        .end(handleResponse);
  }
  else {
    extend(params, { api_key: self.client.readKey() });
    urlBase += getQueryString(params);
    if (urlBase.length < getUrlMaxLength() ) {
      request
        .get(urlBase)
        .timeout(self.timeout())
        .use(requestTypes('jsonp'))
        .end(handleResponse);
    }
    else {
      self.client.trigger('error', 'Query not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.');
    }
  }

  function handleResponse(err, res){
    responseHandler(err, res, cb);
    cb = callback = null;
  }

  return;
}

},{"../helpers/get-context":9,"../helpers/get-query-string":10,"../helpers/get-url-max-length":12,"../helpers/get-xhr-object":13,"../helpers/superagent-handle-response":14,"../helpers/superagent-request-types":15,"superagent":5}],34:[function(require,module,exports){
var clone = require("../core/utils/clone"),
    each = require("../core/utils/each"),
    flatten = require("./utils/flatten"),
    parse = require("./utils/parse");

var Emitter = require('../core/utils/emitter-shim');

function Dataset(){
  this.data = {
    input: {},
    output: [['index']]
  };
  this.meta = {
    schema: {},
    method: undefined
  };
  // temp fwd
  if (arguments.length > 0) {
    this.parse.apply(this, arguments);
  }
}

Dataset.defaults = {
  delimeter: " -> "
};

Emitter(Dataset);
Emitter(Dataset.prototype);

Dataset.prototype.input = function(obj){
  if (!arguments.length) return this["data"]["input"];
  this["data"]["input"] = (obj ? clone(obj) : null);
  return this;
};

Dataset.prototype.output = function(arr){
  if (!arguments.length) return this["data"].output;
  this["data"].output = (arr instanceof Array ? arr : null);
  return this;
}

Dataset.prototype.method = function(str){
  if (!arguments.length) return this.meta["method"];
  this.meta["method"] = (str ? String(str) : null);
  return this;
};

Dataset.prototype.schema = function(obj){
  if (!arguments.length) return this.meta.schema;
  this.meta.schema = (obj ? obj : null);
  return this;
};

Dataset.prototype.parse = function(raw, schema){
  var options;
  if (raw) this.input(raw);
  if (schema) this.schema(schema);

  // Reset output value
  this.output([[]]);

  if (this.meta.schema.select) {
    this.method("select");
    options = extend({
      records: "",
      select: true
    }, this.schema());
    _select.call(this, _optHash(options));
  }
  else if (this.meta.schema.unpack) {
    this.method("unpack");
    options = extend({
      records: "",
      unpack: {
        index: false,
        value: false,
        label: false
      }
    }, this.schema());
    _unpack.call(this, _optHash(options));
  }
  return this;
};


// Select
// --------------------------------------

function _select(cfg){

  var self = this,
      options = cfg || {},
      target_set = [],
      unique_keys = [];

  var root, records_target;
  if (options.records === "" || !options.records) {
    root = [self.input()];
  } else {
    records_target = options.records.split(Dataset.defaults.delimeter);
    root = parse.apply(self, [self.input()].concat(records_target))[0];
  }

  each(options.select, function(prop){
    target_set.push(prop.path.split(Dataset.defaults.delimeter));
  });

  // Retrieve keys found in asymmetrical collections
  if (target_set.length == 0) {
    each(root, function(record, interval){
      var flat = flatten(record);
      //console.log('flat', flat);
      for (var key in flat) {
        if (flat.hasOwnProperty(key) && unique_keys.indexOf(key) == -1) {
          unique_keys.push(key);
          target_set.push([key]);
        }
      }
    });
  }

  var test = [[]];

  // Append header row
  each(target_set, function(props, i){
    if (target_set.length == 1) {
      // Static header for single value
      test[0].push('label', 'value');
    } else {
      // Dynamic header for n-values
      test[0].push(props.join("."));
    }
  });

  // Append all rows
  each(root, function(record, i){
    var flat = flatten(record);
    if (target_set.length == 1) {
      // Static row for single value
      test.push([target_set.join("."), flat[target_set.join(".")]]);
    } else {
      // Dynamic row for n-values
      test.push([]);
      each(target_set, function(t, j){
        var target = t.join(".");
        test[i+1].push(flat[target]);
      });
    }
  });

  self.output(test);
  self.format(options.select);
  return self;
}


// Unpack
// --------------------------------------

function _unpack(options){
  //console.log('Unpacking', options);
  var self = this, discovered_labels = [];

  var value_set = (options.unpack.value) ? options.unpack.value.path.split(Dataset.defaults.delimeter) : false,
      label_set = (options.unpack.label) ? options.unpack.label.path.split(Dataset.defaults.delimeter) : false,
      index_set = (options.unpack.index) ? options.unpack.index.path.split(Dataset.defaults.delimeter) : false;
  //console.log(index_set, label_set, value_set);

  var value_desc = (value_set[value_set.length-1] !== "") ? value_set[value_set.length-1] : "Value",
      label_desc = (label_set[label_set.length-1] !== "") ? label_set[label_set.length-1] : "Label",
      index_desc = (index_set[index_set.length-1] !== "") ? index_set[index_set.length-1] : "Index";

  // Prepare root for parsing
  var root = (function(){
    var root;
    if (options.records == "") {
      root = [self.input()];
    } else {
      root = parse.apply(self, [self.input()].concat(options.records.split(Dataset.defaults.delimeter)));
    }
    return root[0];
  })();

  if (root instanceof Array == false) {
    root = [root];
  }

  // Find labels
  each(root, function(record, interval){
    var labels = (label_set) ? parse.apply(self, [record].concat(label_set)) : [];
    if (labels) {
      discovered_labels = labels;
    }
  });

  // Parse each record
  each(root, function(record, interval){
    //console.log('record', record);

    var plucked_value = (value_set) ? parse.apply(self, [record].concat(value_set)) : false,
        //plucked_label = (label_set) ? parse.apply(self, [record].concat(label_set)) : false,
        plucked_index = (index_set) ? parse.apply(self, [record].concat(index_set)) : false;
    //console.log(plucked_index, plucked_label, plucked_value);

    // Inject row for each index
    if (plucked_index) {
      each(plucked_index, function(){
        self.data.output.push([]);
      });
    } else {
      self.data.output.push([]);
    }

    // Build index column
    if (plucked_index) {

      // Build index/label on first interval
      if (interval == 0) {

        // Push last index property to 0,0
        self.data.output[0].push(index_desc);

        // Build subsequent series headers (1:N)
        if (discovered_labels.length > 0) {
          each(discovered_labels, function(value, i){
            self.data.output[0].push(value);
          });

        } else {
          self.data.output[0].push(value_desc);
        }
      }

      // Correct for odd root cases
      if (root.length < self.data.output.length-1) {
        if (interval == 0) {
          each(self.data.output, function(row, i){
            if (i > 0) {
              self.data.output[i].push(plucked_index[i-1]);
            }
          });
        }
      } else {
        self.data.output[interval+1].push(plucked_index[0]);
      }
    }

    // Build label column
    if (!plucked_index && discovered_labels.length > 0) {
      if (interval == 0) {
        self.data.output[0].push(label_desc);
        self.data.output[0].push(value_desc);
      }
      self.data.output[interval+1].push(discovered_labels[0]);
    }

    if (!plucked_index && discovered_labels.length == 0) {
      // [REVISIT]
      self.data.output[0].push('');
    }

    // Append values
    if (plucked_value) {
      // Correct for odd root cases
      if (root.length < self.data.output.length-1) {
        if (interval == 0) {
          each(self.data.output, function(row, i){
            if (i > 0) {
              self.data.output[i].push(plucked_value[i-1]);
            }
          });
        }
      } else {
        each(plucked_value, function(value){
          self.data.output[interval+1].push(value);
        });
      }
    } else {
      // append null across this row
      each(self.data.output[0], function(cell, i){
        var offset = (plucked_index) ? 0 : -1;
        if (i > offset) {
          self.data.output[interval+1].push(null);
        }
      })
    }

  });

  self.format(options.unpack);
  //self.sort(options.sort);
  return this;
}



// String configs to hash paths
// --------------------------------------

function _optHash(options){
  each(options.unpack, function(value, key, object){
    if (value && is(value, 'string')) {
      options.unpack[key] = { path: options.unpack[key] };
    }
  });
  return options;
}


// via: https://github.com/spocke/punymce
function is(o, t){
  o = typeof(o);
  if (!t){
    return o != 'undefined';
  }
  return o == t;
}

// Adapted to exclude null values
function extend(o, e){
  each(e, function(v, n){
    if (is(o[n], 'object') && is(v, 'object')){
      o[n] = extend(o[n], v);
    } else if (v !== null) {
      o[n] = v;
    }
  });
  return o;
}

module.exports = Dataset;

},{"../core/utils/clone":27,"../core/utils/each":28,"../core/utils/emitter-shim":29,"./utils/flatten":47,"./utils/parse":48}],35:[function(require,module,exports){
var extend = require("../core/utils/extend"),
    Dataset = require("./dataset");

extend(Dataset.prototype, require("./lib/append"));
extend(Dataset.prototype, require("./lib/delete"));
extend(Dataset.prototype, require("./lib/filter"));
extend(Dataset.prototype, require("./lib/insert"));
extend(Dataset.prototype, require("./lib/select"));
extend(Dataset.prototype, require("./lib/set"));
extend(Dataset.prototype, require("./lib/sort"));
extend(Dataset.prototype, require("./lib/update"));

extend(Dataset.prototype, require("./lib/analyses"));
extend(Dataset.prototype, {
  "format": require("./lib/format")
});

module.exports = Dataset;

},{"../core/utils/extend":30,"./dataset":34,"./lib/analyses":36,"./lib/append":37,"./lib/delete":38,"./lib/filter":39,"./lib/format":40,"./lib/insert":41,"./lib/select":42,"./lib/set":43,"./lib/sort":44,"./lib/update":45}],36:[function(require,module,exports){
var each = require("../../core/utils/each"),
    arr = ["Average", "Maximum", "Minimum", "Sum"],
    output = {};

output["average"] = function(arr, start, end){
  var set = arr.slice(start||0, (end ? end+1 : arr.length)),
      sum = 0,
      avg = null;

  // Add numeric values
  each(set, function(val, i){
    if (typeof val === "number" && !isNaN(parseFloat(val))) {
      sum += parseFloat(val);
    }
  });
  return sum / set.length;
};

output["maximum"] = function(arr, start, end){
  var set = arr.slice(start||0, (end ? end+1 : arr.length)),
      nums = [];

  // Pull numeric values
  each(set, function(val, i){
    if (typeof val === "number" && !isNaN(parseFloat(val))) {
      nums.push(parseFloat(val));
    }
  });
  return Math.max.apply(Math, nums);
};

output["minimum"] = function(arr, start, end){
  var set = arr.slice(start||0, (end ? end+1 : arr.length)),
      nums = [];

  // Pull numeric values
  each(set, function(val, i){
    if (typeof val === "number" && !isNaN(parseFloat(val))) {
      nums.push(parseFloat(val));
    }
  });
  return Math.min.apply(Math, nums);
};

output["sum"] = function(arr, start, end){
  // Copy set with given range
  var set = arr.slice(start||0, (end ? end+1 : arr.length)),
      sum = 0;

  // Add numeric values
  each(set, function(val, i){
    if (typeof val === "number" && !isNaN(parseFloat(val))) {
      sum += parseFloat(val);
    }
  });
  return sum;
};

// Convenience methods

each(arr, function(v,i){
  output["getColumn"+v] = output["getRow"+v] = function(arr){
    return this[v.toLowerCase()](arr, 1);
  };
});

output["getColumnLabel"] = output["getRowIndex"] = function(arr){
  return arr[0];
};

module.exports = output;

},{"../../core/utils/each":28}],37:[function(require,module,exports){
var each = require("../../core/utils/each");
var createNullList = require('../utils/create-null-list');

module.exports = {
  "appendColumn": appendColumn,
  "appendRow": appendRow
};

function appendColumn(str, input){
  var self = this,
      args = Array.prototype.slice.call(arguments, 2),
      label = (str !== undefined) ? str : null;

  if (typeof input === "function") {
    self.data.output[0].push(label);
    each(self.output(), function(row, i){
      var cell;
      if (i > 0) {
        cell = input.call(self, row, i);
        if (typeof cell === "undefined") {
          cell = null;
        }
        self.data.output[i].push(cell);
      }
    });
  }

  else if (!input || input instanceof Array) {
    input = input || [];

    if (input.length <= self.output().length - 1) {
      input = input.concat( createNullList(self.output().length - 1 - input.length) );
    }
    else {
      // If this new column is longer than existing columns,
      // we need to update the rest to match ...
      each(input, function(value, i){
        if (self.data.output.length -1 < input.length) {
          appendRow.call(self, String( self.data.output.length ));
        }
      });
    }

    self.data.output[0].push(label);
    each(input, function(value, i){
      self.data.output[i+1][self.data.output[0].length-1] = value;
    });

  }

  return self;
}


function appendRow(str, input){
  var self = this,
      args = Array.prototype.slice.call(arguments, 2),
      label = (str !== undefined) ? str : null,
      newRow = [];

  newRow.push(label);

  if (typeof input === "function") {
    each(self.data.output[0], function(label, i){
      var col, cell;
      if (i > 0) {
        col = self.selectColumn(i);
        cell = input.call(self, col, i);
        if (typeof cell === "undefined") {
          cell = null;
        }
        newRow.push(cell);
      }
    });
    self.data.output.push(newRow);
  }

  else if (!input || input instanceof Array) {
    input = input || [];

    if (input.length <= self.data.output[0].length - 1) {
      input = input.concat( createNullList( self.data.output[0].length - 1 - input.length ) );
    }
    else {
      each(input, function(value, i){
        if (self.data.output[0].length -1 < input.length) {
          appendColumn.call(self, String( self.data.output[0].length ));
        }
      });
    }

    self.data.output.push( newRow.concat(input) );
  }

  return self;
}

},{"../../core/utils/each":28,"../utils/create-null-list":46}],38:[function(require,module,exports){
var each = require("../../core/utils/each");

module.exports = {
  "deleteColumn": deleteColumn,
  "deleteRow": deleteRow
};

function deleteColumn(q){
  var self = this,
      index = (typeof q === 'number') ? q : this.data.output[0].indexOf(q);

  if (index > -1) {
    each(self.data.output, function(row, i){
      self.data.output[i].splice(index, 1);
    });
  }
  return self;
}

function deleteRow(q){
  var index = (typeof q === 'number') ? q : this.selectColumn(0).indexOf(q);

  if (index > -1) {
    this.data.output.splice(index, 1);
  }
  return this;
}

},{"../../core/utils/each":28}],39:[function(require,module,exports){
var each = require("../../core/utils/each");

module.exports = {
  "filterColumns": filterColumns,
  "filterRows": filterRows
};

function filterColumns(fn){
  var self = this,
      clone = new Array();

  each(self.data.output, function(row, i){
    clone.push([]);
  });

  each(self.data.output[0], function(col, i){
    var selectedColumn = self.selectColumn(i);
    if (i == 0 || fn.call(self, selectedColumn, i)) {
      each(selectedColumn, function(cell, ri){
        clone[ri].push(cell);
      });
    }
  });

  self.output(clone);
  return self;
}

function filterRows(fn){
  var self = this,
      clone = [];

  each(self.output(), function(row, i){
    if (i == 0 || fn.call(self, row, i)) {
      clone.push(row);
    }
  });

  self.output(clone);
  return self;
}

},{"../../core/utils/each":28}],40:[function(require,module,exports){
var each = require("../../core/utils/each");

module.exports = function(options){
  var self = this;

    if (this.method() === 'select') {

      each(self.output(), function(row, i){
        // Replace labels
        if (i == 0) {
          each(row, function(cell, j){
            if (options[j] && options[j].label) {
              self.data.output[i][j] = options[j].label;
            }
          });
        } else {
          each(row, function(cell, j){
            self.data.output[i][j] = _applyFormat(self.data.output[i][j], options[j]);
          });
        }
      });

    }

  if (this.method() === 'unpack') {

    if (options.index) {
      each(self.output(), function(row, i){
        if (i == 0) {
          if (options.index.label) {
            self.data.output[i][0] = options.index.label;
          }
        } else {
          self.data.output[i][0] = _applyFormat(self.data.output[i][0], options.index);
        }
      });
    }

    if (options.label) {
      if (options.index) {
        each(self.output(), function(row, i){
          each(row, function(cell, j){
            if (i == 0 && j > 0) {
              self.data.output[i][j] = _applyFormat(self.data.output[i][j], options.label);
            }
          });
        });
      } else {
        each(self.output(), function(row, i){
          if (i > 0) {
            self.data.output[i][0] = _applyFormat(self.data.output[i][0], options.label);
          }
        });
      }
    }

    if (options.value) {
      if (options.index) {
        // start > 0
        each(self.output(), function(row, i){
          each(row, function(cell, j){
            if (i > 0 && j > 0) {
              self.data.output[i][j] = _applyFormat(self.data.output[i][j], options.value);
            }
          });
        });
      } else {
        // start @ 0
        each(self.output(), function(row, i){
          each(row, function(cell, j){
            if (i > 0) {
              self.data.output[i][j] = _applyFormat(self.data.output[i][j], options.value);
            }
          });
        });
      }
    }

  }

  return self;
};

function _applyFormat(value, opts){
  var output = value,
      options = opts || {};

  if (options.replace) {
    each(options.replace, function(val, key){
      if (output == key || String(output) == String(key) || parseFloat(output) == parseFloat(key)) {
        output = val;
      }
    });
  }

  if (options.type && options.type == 'date') {
    if (options.format && moment && moment(value).isValid()) {
      output = moment(output).format(options.format);
    } else {
      output = new Date(output); //.toISOString();
    }
  }

  if (options.type && options.type == 'string') {
    output = String(output);
  }

  if (options.type && options.type == 'number' && !isNaN(parseFloat(output))) {
    output = parseFloat(output);
  }

  return output;
}

},{"../../core/utils/each":28}],41:[function(require,module,exports){
var each = require("../../core/utils/each");
var createNullList = require('../utils/create-null-list');
var append = require('./append');

var appendRow = append.appendRow,
    appendColumn = append.appendColumn;

module.exports = {
  "insertColumn": insertColumn,
  "insertRow": insertRow
};

function insertColumn(index, str, input){
  var self = this, label;

  label = (str !== undefined) ? str : null;

  if (typeof input === "function") {

    self.data.output[0].splice(index, 0, label);
    each(self.output(), function(row, i){
      var cell;
      if (i > 0) {
        cell = input.call(self, row, i);
        if (typeof cell === "undefined") {
          cell = null;
        }
        self.data.output[i].splice(index, 0, cell);
      }
    });

  }

  else if (!input || input instanceof Array) {
    input = input || [];

    if (input.length <= self.output().length - 1) {
      input = input.concat( createNullList(self.output().length - 1 - input.length) );
    }
    else {
      // If this new column is longer than existing columns,
      // we need to update the rest to match ...
      each(input, function(value, i){
        if (self.data.output.length -1 < input.length) {
          appendRow.call(self, String( self.data.output.length ));
        }
      });
    }

    self.data.output[0].splice(index, 0, label);
    each(input, function(value, i){
      self.data.output[i+1].splice(index, 0, value);
    });

  }
  return self;
}

function insertRow(index, str, input){
  var self = this, label, newRow = [];

  label = (str !== undefined) ? str : null;
  newRow.push(label);

  if (typeof input === "function") {
    each(self.output()[0], function(label, i){
      var col, cell;
      if (i > 0) {
        col = self.selectColumn(i);
        cell = input.call(self, col, i);
        if (typeof cell === "undefined") {
          cell = null;
        }
        newRow.push(cell);
      }
    });
    self.data.output.splice(index, 0, newRow);
  }

  else if (!input || input instanceof Array) {
    input = input || [];

    if (input.length <= self.data.output[0].length - 1) {
      input = input.concat( createNullList( self.data.output[0].length - 1 - input.length ) );
    }
    else {
      each(input, function(value, i){
        if (self.data.output[0].length -1 < input.length) {
          appendColumn.call(self, String( self.data.output[0].length ));
        }
      });
    }

    self.data.output.splice(index, 0, newRow.concat(input) );
  }

  return self;
}

},{"../../core/utils/each":28,"../utils/create-null-list":46,"./append":37}],42:[function(require,module,exports){
var each = require("../../core/utils/each");

module.exports = {
  "selectColumn": selectColumn,
  "selectRow": selectRow
};

function selectColumn(q){
  var result = new Array(),
      index = (typeof q === 'number') ? q : this.data.output[0].indexOf(q);

  if (index > -1 && 'undefined' !== typeof this.data.output[0][index]) {
    each(this.data.output, function(row, i){
      result.push(row[index]);
    });
  }
  return result;
}

function selectRow(q){
  var result = new Array(),
      index = (typeof q === 'number') ? q : this.selectColumn(0).indexOf(q);

  if (index > -1 && 'undefined' !== typeof this.data.output[index]) {
    result = this.data.output[index];
  }
  return  result;
}

},{"../../core/utils/each":28}],43:[function(require,module,exports){
var each = require("../../core/utils/each");

var append = require('./append');
var select = require('./select');

module.exports = {
  "set": set
};

function set(coords, value){
  if (arguments.length < 2 || coords.length < 2) {
    throw Error('Incorrect arguments provided for #set method');
  }

  var colIndex = 'number' === typeof coords[0] ? coords[0] : this.data.output[0].indexOf(coords[0]),
      rowIndex = 'number' === typeof coords[1] ? coords[1] : select.selectColumn.call(this, 0).indexOf(coords[1]);

  var colResult = select.selectColumn.call(this, coords[0]), // this.data.output[0][coords[0]],
      rowResult = select.selectRow.call(this, coords[1]);

  // Column doesn't exist...
  //  Let's create it and reset colIndex
  if (colResult.length < 1) {
    append.appendColumn.call(this, coords[0]);
    colIndex = this.data.output[0].length-1;
  }

  // Row doesn't exist...
  //  Let's create it and reset rowIndex
  if (rowResult.length < 1) {
    append.appendRow.call(this, coords[1]);
    rowIndex = this.data.output.length-1;
  }

  // Set provided value
  this.data.output[ rowIndex ][ colIndex ] = value;
  return this;
}

},{"../../core/utils/each":28,"./append":37,"./select":42}],44:[function(require,module,exports){
var each = require("../../core/utils/each");

module.exports = {
  "sortColumns": sortColumns,
  "sortRows": sortRows
};

function sortColumns(str, comp){
  var self = this,
      head = this.output()[0].slice(1), // minus index
      cols = [],
      clone = [],
      fn = comp || this.getColumnLabel;

  // Isolate each column (except the index)
  each(head, function(cell, i){
    cols.push(self.selectColumn(i+1).slice(0));
  });
  cols.sort(function(a,b){
    // If fn(a) > fn(b)
    var op = fn.call(self, a) > fn.call(self, b);
    if (op) {
      return (str === "asc" ? 1 : -1);
    } else if (!op) {
      return (str === "asc" ? -1 : 1);
    } else {
      return 0;
    }
  });
  each(cols, function(col, i){
    self
      .deleteColumn(i+1)
      .insertColumn(i+1, col[0], col.slice(1));
  });
  return self;
}

function sortRows(str, comp){
  var self = this,
      head = this.output().slice(0,1),
      body = this.output().slice(1),
      fn = comp || this.getRowIndex;

  body.sort(function(a, b){
    // If fn(a) > fn(b)
    var op = fn.call(self, a) > fn.call(self, b);
    if (op) {
      return (str === "asc" ? 1 : -1);
    } else if (!op) {
      return (str === "asc" ? -1 : 1);
    } else {
      return 0;
    }
  });
  self.output(head.concat(body));
  return self;
}

},{"../../core/utils/each":28}],45:[function(require,module,exports){
var each = require("../../core/utils/each");
var createNullList = require('../utils/create-null-list');
var append = require('./append');

var appendRow = append.appendRow,
    appendColumn = append.appendColumn;

module.exports = {
  "updateColumn": updateColumn,
  "updateRow": updateRow
};

function updateColumn(q, input){
  var self = this,
      index = (typeof q === 'number') ? q : this.data.output[0].indexOf(q);

  if (index > -1) {

    if (typeof input === "function") {

      each(self.output(), function(row, i){
        var cell;
        if (i > 0) {
          cell = input.call(self, row[index], i, row);
          if (typeof cell !== "undefined") {
            self.data.output[i][index] = cell;
          }
        }
      });

    } else if (!input || input instanceof Array) {
      input = input || [];

      if (input.length <= self.output().length - 1) {
        input = input.concat( createNullList(self.output().length - 1 - input.length) );
      }
      else {
        // If this new column is longer than existing columns,
        // we need to update the rest to match ...
        each(input, function(value, i){
          if (self.data.output.length -1 < input.length) {
            appendRow.call(self, String( self.data.output.length ));
          }
        });
      }

      each(input, function(value, i){
        self.data.output[i+1][index] = value;
      });

    }

  }
  return self;
}

function updateRow(q, input){
  var self = this,
      index = (typeof q === 'number') ? q : this.selectColumn(0).indexOf(q);

  if (index > -1) {

    if (typeof input === "function") {

      each(self.output()[index], function(value, i){
        var col = self.selectColumn(i),
        cell = input.call(self, value, i, col);
        if (typeof cell !== "undefined") {
          self.data.output[index][i] = cell;
        }
      });

    } else if (!input || input instanceof Array) {
      input = input || [];

      if (input.length <= self.data.output[0].length - 1) {
        input = input.concat( createNullList( self.data.output[0].length - 1 - input.length ) );
      }
      else {
        each(input, function(value, i){
          if (self.data.output[0].length -1 < input.length) {
            appendColumn.call(self, String( self.data.output[0].length ));
          }
        });
      }

      each(input, function(value, i){
        self.data.output[index][i+1] = value;
      });
    }

  }
  return self;
}

},{"../../core/utils/each":28,"../utils/create-null-list":46,"./append":37}],46:[function(require,module,exports){
module.exports = function(len){
  var list = new Array();
  for (i = 0; i < len; i++) {
    list.push(null);
  }
  return list;
};

},{}],47:[function(require,module,exports){
// Pure awesomeness by Will Rayner (penguinboy)
// https://gist.github.com/penguinboy/762197
module.exports = flatten;
function flatten(ob) {
  var toReturn = {};
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;
    if ((typeof ob[i]) == 'object' && ob[i] !== null) {
      var flatObject = flatten(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

},{}],48:[function(require,module,exports){
// ♫♩♬ Holy Diver! ♬♩♫
// --------------------------------------

var each = require("../../core/utils/each");

module.exports = function() {
  var result = [];
  var loop = function() {
    var root = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    var target = args.pop();

    if (args.length === 0) {
      if (root instanceof Array) {
        args = root;
      } else if (typeof root === 'object') {
        args.push(root);
      }
    }

    each(args, function(el){

      // Grab the numbers and nulls
      if (target == "") {
        if (typeof el == "number" || el == null) {
          return result.push(el);
        }
      }

      if (el[target] || el[target] === 0 || el[target] !== void 0) {
        // Easy grab!
        if (el[target] === null) {
          return result.push(null);
        } else {
          return result.push(el[target]);
        }

      } else if (root[el]){
        if (root[el] instanceof Array) {
          // dive through each array item

          each(root[el], function(n, i) {
            var splinter = [root[el]].concat(root[el][i]).concat(args.slice(1)).concat(target);
            return loop.apply(this, splinter);
          });

        } else {
          if (root[el][target]) {
            // grab it!
            return result.push(root[el][target]);

          } else {
            // dive down a level!
            return loop.apply(this, [root[el]].concat(args.splice(1)).concat(target));

          }
        }

      } else if (typeof root === 'object' && root instanceof Array === false && !root[target]) {
        throw new Error("Target property does not exist", target);

      } else {
        // dive down a level!
        return loop.apply(this, [el].concat(args.splice(1)).concat(target));
      }

      return;

    });
    if (result.length > 0) {
      return result;
    }
  };
  return loop.apply(this, arguments);
}

},{"../../core/utils/each":28}],49:[function(require,module,exports){
/*!
 * ----------------------
 * C3.js Adapter
 * ----------------------
 */

var Dataviz = require('../dataviz'),
    each = require('../../core/utils/each'),
    extend = require('../../core/utils/extend');

module.exports = function(){

  // chartOptions:
  // -------------
  // axis: {}
  // color: {}    <-- be aware: we set values here
  // grid: {}
  // legend: {}
  // point: {}
  // regions: {}
  // size: {}     <-- be aware: we set values here
  // tooltip: {}
  // zoom: {}

  // line, pie, donut etc...

  var dataTypes = {
    // dataType            : // chartTypes
    'singular'             : ['gauge'],
    'categorical'          : ['donut', 'pie'],
    'cat-interval'         : ['area-step', 'step', 'bar', 'area', 'area-spline', 'spline', 'line'],
    'cat-ordinal'          : ['bar', 'area', 'area-spline', 'spline', 'line', 'step', 'area-step'],
    'chronological'        : ['area', 'area-spline', 'spline', 'line', 'bar', 'step', 'area-step'],
    'cat-chronological'    : ['line', 'spline', 'area', 'area-spline', 'bar', 'step', 'area-step']
    // 'nominal'           : [],
    // 'extraction'        : []
  };

  var charts = {};
  each(['gauge', 'donut', 'pie', 'bar', 'area', 'area-spline', 'spline', 'line', 'step', 'area-step'], function(type, index){
    charts[type] = {
      render: function(){
        var setup = getSetupTemplate.call(this, type);
        this.view._artifacts['c3'] = c3.generate(setup);
        this.update();
      },
      update: function(){
        var self = this, cols = [];
        if (type === 'gauge') {
          self.view._artifacts['c3'].load({
            columns: [ [self.title(), self.data()[1][1]] ]
          })
        }
        else if (type === 'pie' || type === 'donut') {
          self.view._artifacts['c3'].load({
            columns: self.dataset.data.output.slice(1)
          });
        }
        else {
          if (this.dataType().indexOf('chron') > -1) {
            cols.push(self.dataset.selectColumn(0));
            cols[0][0] = 'x';
          }

          each(self.data()[0], function(c, i){
            if (i > 0) {
              cols.push(self.dataset.selectColumn(i));
            }
          });

          if (self.stacked()) {
            self.view._artifacts['c3'].groups([self.labels()]);
          }

          self.view._artifacts['c3'].load({
            columns: cols
          });
        }
      },
      destroy: function(){
        _selfDestruct.call(this);
      }
    };
  });

  function getSetupTemplate(type){
    var setup = {
      axis: {},
      bindto: this.el(),
      data: {
        columns: []
      },
      color: {
        pattern: this.colors()
      },
      size: {
        height: this.height(),
        width: this.width()
      }
    };

    // Enforce type, sorry no overrides here
    setup['data']['type'] = type;

    if (type === 'gauge') {}
    else if (type === 'pie' || type === 'donut') {
      setup[type] = { title: this.title() };
    }
    else {
      if (this.dataType().indexOf('chron') > -1) {
        setup['data']['x'] = 'x';
        setup['axis']['x'] = {
          type: 'timeseries',
          tick: {
            format: '%Y-%m-%d'
          }
        };
      }
      else {
        if (this.dataType() === 'cat-ordinal') {
          setup['axis']['x'] = {
            type: 'category',
            categories: this.labels()
          };
        }
      }
      if (this.title()) {
        setup['axis']['y'] = { label: this.title() }
      }
    }
    return extend(setup, this.chartOptions());
  }

  function _selfDestruct(){
    if (this.view._artifacts['c3']) {
      this.view._artifacts['c3'].destroy();
      this.view._artifacts['c3'] = null;
    }
  }

  // Register library + add dependencies + types
  // -------------------------------
  Dataviz.register('c3', charts, { capabilities: dataTypes });

};

},{"../../core/utils/each":28,"../../core/utils/extend":30,"../dataviz":53}],50:[function(require,module,exports){
/*!
 * ----------------------
 * Chart.js Adapter
 * ----------------------
 */

var Dataviz = require("../dataviz"),
    each = require("../../core/utils/each"),
    extend = require("../../core/utils/extend");

module.exports = function(){

  if (typeof Chart !== "undefined") {
    Chart.defaults.global.responsive = true;
  }

  var dataTypes = {
    // dataType            : // chartTypes
    //"singular"             : [],
    "categorical"          : ["doughnut", "pie", "polar-area", "radar"],
    "cat-interval"         : ["bar", "line"],
    "cat-ordinal"          : ["bar", "line"],
    "chronological"        : ["line", "bar"],
    "cat-chronological"    : ["line", "bar"]
    // "nominal"           : [],
    // "extraction"        : []
  };

  var ChartNameMap = {
    "radar": "Radar",
    "polar-area": "PolarArea",
    "pie": "Pie",
    "doughnut": "Doughnut",
    "line": "Line",
    "bar": "Bar"
  };
  var dataTransformers = {
    'doughnut': getCategoricalData,
    'pie': getCategoricalData,
    'polar-area': getCategoricalData,
    'radar': getSeriesData,
    'line': getSeriesData,
    'bar': getSeriesData
  };

  function getCategoricalData(){
    var self = this, result = [];
    each(self.dataset.selectColumn(0).slice(1), function(label, i){
      result.push({
        value: self.dataset.selectColumn(1).slice(1)[i],
        color: self.colors()[+i],
        hightlight: self.colors()[+i+9],
        label: label
      });
    });
    return result;
  }

  function getSeriesData(){
    var self = this,
        labels,
        result = {
          labels: [],
          datasets: []
        };

    labels = this.dataset.selectColumn(0).slice(1);
    each(labels, function(l,i){
      if (l instanceof Date) {
        result.labels.push((l.getMonth()+1) + "-" + l.getDate() + "-" + l.getFullYear());
      } else {
        result.labels.push(l);
      }
    })

    each(self.dataset.selectRow(0).slice(1), function(label, i){
      var hex = {
        r: hexToR(self.colors()[i]),
        g: hexToG(self.colors()[i]),
        b: hexToB(self.colors()[i])
      };
      result.datasets.push({
        label: label,
        fillColor    : "rgba(" + hex.r + "," + hex.g + "," + hex.b + ",0.2)",
        strokeColor  : "rgba(" + hex.r + "," + hex.g + "," + hex.b + ",1)",
        pointColor   : "rgba(" + hex.r + "," + hex.g + "," + hex.b + ",1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(" + hex.r + "," + hex.g + "," + hex.b + ",1)",
        data: self.dataset.selectColumn(+i+1).slice(1)
      });
    });
    return result;
  }

  var charts = {};
  each(["doughnut", "pie", "polar-area", "radar", "bar", "line"], function(type, index){
    charts[type] = {
      initialize: function(){
        if (this.el().nodeName.toLowerCase() !== "canvas") {
          var canvas = document.createElement('canvas');
          this.el().innerHTML = "";
          this.el().appendChild(canvas);
          this.view._artifacts["ctx"] = canvas.getContext("2d");
        }
        else {
          this.view._artifacts["ctx"] = this.el().getContext("2d");
        }

        if (this.height()) {
          this.view._artifacts["ctx"].canvas.height = this.height();
          this.view._artifacts["ctx"].canvas.style.height = String(this.height() + "px");
        }

        if (this.width()) {
          this.view._artifacts["ctx"].canvas.width = this.width();
          this.view._artifacts["ctx"].canvas.style.width = String(this.width() + "px");
        }

        return this;
      },
      render: function(){
        var method = ChartNameMap[type],
            opts = extend({}, this.chartOptions()),
            data = dataTransformers[type].call(this);

        if (this.view._artifacts["chartjs"]) {
          this.view._artifacts["chartjs"].destroy();
        }
        this.view._artifacts["chartjs"] = new Chart(this.view._artifacts["ctx"])[method](data, opts);
        return this;
      },
      destroy: function(){
        _selfDestruct.call(this);
      }
    };
  });

  function _selfDestruct(){
    if (this.view._artifacts["chartjs"]) {
      this.view._artifacts["chartjs"].destroy();
      this.view._artifacts["chartjs"] = null;
    }
  }


  // Based on this awesome little demo:
  // http://www.javascripter.net/faq/hextorgb.htm
  function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
  function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
  function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
  function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

  // Register library + add dependencies + types
  // -------------------------------
  Dataviz.register("chartjs", charts, { capabilities: dataTypes });

};

},{"../../core/utils/each":28,"../../core/utils/extend":30,"../dataviz":53}],51:[function(require,module,exports){
/*!
 * ----------------------
 * Google Charts Adapter
 * ----------------------
 */

/*

  TODO:

  [ ] Build a more robust DataTable transformer
  [ ] ^Expose date parser for google charts tooltips (#70)
  [ ] ^Allow custom tooltips (#147)

*/

var Dataviz = require("../dataviz"),
    each = require("../../core/utils/each"),
    extend = require("../../core/utils/extend"),
    Keen = require("../../core");

module.exports = function(){

  Keen.loaded = false;

  var errorMapping = {
    "Data column(s) for axis #0 cannot be of type string": "No results to visualize"
  };

  var chartTypes = ['AreaChart', 'BarChart', 'ColumnChart', 'LineChart', 'PieChart', 'Table'];
  var chartMap = {};

  var dataTypes = {
    // dataType           // chartTypes (namespace)
    // 'singular':        null,
    'categorical':        ['piechart', 'barchart', 'columnchart', 'table'],
    'cat-interval':       ['columnchart', 'barchart', 'table'],
    'cat-ordinal':        ['barchart', 'columnchart', 'areachart', 'linechart', 'table'],
    'chronological':      ['areachart', 'linechart', 'table'],
    'cat-chronological':  ['linechart', 'columnchart', 'barchart', 'areachart'],
    'nominal':            ['table'],
    'extraction':         ['table']
  };

  // Create chart types
  // -------------------------------
  each(chartTypes, function (type) {
    var name = type.toLowerCase();
    chartMap[name] = {
      initialize: function(){
        // Nothing to do here
      },
      render: function(){
        if(typeof google === "undefined") {
          this.error("The Google Charts library could not be loaded.");
          return;
        }
        var self = this;
        if (self.view._artifacts['googlechart']) {
          this.destroy();
        }
        self.view._artifacts['googlechart'] = self.view._artifacts['googlechart'] || new google.visualization[type](self.el());
        google.visualization.events.addListener(self.view._artifacts['googlechart'], 'error', function(stack){
          _handleErrors.call(self, stack);
        });
        this.update();
      },
      update: function(){
        var options = _getDefaultAttributes.call(this, type);
        extend(options, this.chartOptions(), this.attributes());

        // Apply stacking if set by top-level option
        options['isStacked'] = (this.stacked() || options['isStacked']);

        this.view._artifacts['datatable'] = google.visualization.arrayToDataTable(this.data());
        // if (this.view._artifacts['datatable']) {}
        if (this.view._artifacts['googlechart']) {
          this.view._artifacts['googlechart'].draw(this.view._artifacts['datatable'], options);
        }
      },
      destroy: function(){
        if (this.view._artifacts['googlechart']) {
          google.visualization.events.removeAllListeners(this.view._artifacts['googlechart']);
          this.view._artifacts['googlechart'].clearChart();
          this.view._artifacts['googlechart'] = null;
          this.view._artifacts['datatable'] = null;
        }
      }
    };
  });


  // Register library + types
  // -------------------------------

  Dataviz.register('google', chartMap, {
    capabilities: dataTypes,
    dependencies: [{
      type: 'script',
      url: 'https://www.google.com/jsapi',
      cb: function(done) {
        if (typeof google === 'undefined'){
          this.trigger("error", "Problem loading Google Charts library. Please contact us!");
          done();
        }
        else {
          google.load('visualization', '1.1', {
              packages: ['corechart', 'table'],
              callback: function(){
                done();
              }
          });
        }
      }
    }]
  });

  function _handleErrors(stack){
    var message = errorMapping[stack['message']] || stack['message'] || 'An error occurred';
    this.error(message);
  }

  function _getDefaultAttributes(type){
    var output = {};
    switch (type.toLowerCase()) {

      case "areachart":
        output.lineWidth = 2;
        output.hAxis = {
          baselineColor: 'transparent',
          gridlines: { color: 'transparent' }
        };
        output.vAxis = {
          viewWindow: { min: 0 }
        };
        if (this.dataType() === "chronological" || this.dataType() === "cat-ordinal") {
          output.legend = "none";
          output.chartArea = {
            width: "85%"
          };
        }
        break;

      case "barchart":
        output.hAxis = {
          viewWindow: { min: 0 }
        };
        output.vAxis = {
          baselineColor: 'transparent',
          gridlines: { color: 'transparent' }
        };
        if (this.dataType() === "chronological" || this.dataType() === "cat-ordinal") {
          output.legend = "none";
        }
        break;

      case "columnchart":
        output.hAxis = {
          baselineColor: 'transparent',
          gridlines: { color: 'transparent' }
        };
        output.vAxis = {
          viewWindow: { min: 0 }
        };
        if (this.dataType() === "chronological" || this.dataType() === "cat-ordinal") {
          output.legend = "none";
          output.chartArea = {
            width: "85%"
          };
        }
        break;

      case "linechart":
        output.lineWidth = 2;
        output.hAxis = {
          baselineColor: 'transparent',
          gridlines: { color: 'transparent' }
        };
        output.vAxis = {
          viewWindow: { min: 0 }
        };
        if (this.dataType() === "chronological" || this.dataType() === "cat-ordinal") {
          output.legend = "none";
          output.chartArea = {
            width: "85%"
          };
        }
        break;

      case "piechart":
        output.sliceVisibilityThreshold = 0.01;
        break;

      case "table":
        break;
    }
    return output;
  }

};

},{"../../core":16,"../../core/utils/each":28,"../../core/utils/extend":30,"../dataviz":53}],52:[function(require,module,exports){
/*!
* ----------------------
* Keen IO Adapter
* ----------------------
*/

var Keen = require("../../core"),
    Dataviz = require("../dataviz");

var clone = require("../../core/utils/clone"),
    each = require("../../core/utils/each"),
    extend = require("../../core/utils/extend"),
    prettyNumber = require("../utils/prettyNumber");

module.exports = function(){
  // (function(lib){
  // var Keen = lib || {},
  var Metric, Error, Spinner;

  Keen.Error = {
    defaults: {
      backgroundColor : "",
      borderRadius    : "4px",
      color           : "#ccc",
      display         : "block",
      fontFamily      : "Helvetica Neue, Helvetica, Arial, sans-serif",
      fontSize        : "21px",
      fontWeight      : "light",
      textAlign       : "center"
    }
  };

  Keen.Spinner.defaults = {
    height: 138,                  // Used if no height is provided
    lines: 10,                    // The number of lines to draw
    length: 8,                    // The length of each line
    width: 3,                     // The line thickness
    radius: 10,                   // The radius of the inner circle
    corners: 1,                   // Corner roundness (0..1)
    rotate: 0,                    // The rotation offset
    direction: 1,                 // 1: clockwise, -1: counterclockwise
    color: '#4d4d4d',             // #rgb or #rrggbb or array of colors
    speed: 1.67,                  // Rounds per second
    trail: 60,                    // Afterglow percentage
    shadow: false,                // Whether to render a shadow
    hwaccel: false,               // Whether to use hardware acceleration
    className: 'keen-spinner',    // The CSS class to assign to the spinner
    zIndex: 2e9,                  // The z-index (defaults to 2000000000)
    top: '50%',                   // Top position relative to parent
    left: '50%'                   // Left position relative to parent
  };

  var dataTypes = {
    'singular': ['metric']
  };

  Metric = {
    initialize: function(){
      var css = document.createElement("style"),
          bgDefault = "#49c5b1";

      css.id = "keen-widgets";
      css.type = "text/css";
      css.innerHTML = "\
  .keen-metric { \n  background: " + bgDefault + "; \n  border-radius: 4px; \n  color: #fff; \n  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; \n  padding: 10px 0; \n  text-align: center; \n} \
  .keen-metric-value { \n  display: block; \n  font-size: 84px; \n  font-weight: 700; \n  line-height: 84px; \n} \
  .keen-metric-title { \n  display: block; \n  font-size: 24px; \n  font-weight: 200; \n}";
      if (!document.getElementById(css.id)) {
        document.body.appendChild(css);
      }
    },

    render: function(){
      var bgColor = (this.colors().length == 1) ? this.colors()[0] : "#49c5b1",
          title = this.title() || "Result",
          value = this.data()[1][1] || 0,
          width = this.width(),
          opts = this.chartOptions() || {},
          prefix = "",
          suffix = "";

      var styles = {
        'width': (width) ? width + 'px' : 'auto'
      };

      var formattedNum = value;
      if ( typeof opts.prettyNumber === 'undefined' || opts.prettyNumber == true ) {
        if ( !isNaN(parseInt(value)) ) {
          formattedNum = prettyNumber(value);
        }
      }

      if (opts['prefix']) {
        prefix = '<span class="keen-metric-prefix">' + opts['prefix'] + '</span>';
      }
      if (opts['suffix']) {
        suffix = '<span class="keen-metric-suffix">' + opts['suffix'] + '</span>';
      }

      this.el().innerHTML = '' +
        '<div class="keen-widget keen-metric" style="background-color: ' + bgColor + '; width:' + styles.width + ';" title="' + value + '">' +
          '<span class="keen-metric-value">' + prefix + formattedNum + suffix + '</span>' +
          '<span class="keen-metric-title">' + title + '</span>' +
        '</div>';
    }
  };

  Error = {
    initialize: function(){},
    render: function(text, style){
      var err, msg;

      var defaultStyle = clone(Keen.Error.defaults);
      var currentStyle = extend(defaultStyle, style);

      err = document.createElement("div");
      err.className = "keen-error";
      each(currentStyle, function(value, key){
        err.style[key] = value;
      });
      err.style.height = String(this.height() + "px");
      err.style.paddingTop = (this.height() / 2 - 15) + "px";
      err.style.width = String(this.width() + "px");

      msg = document.createElement("span");
      msg.innerHTML = text || "Yikes! An error occurred!";

      err.appendChild(msg);

      this.el().innerHTML = "";
      this.el().appendChild(err);
    },
    destroy: function(){
      this.el().innerHTML = "";
    }
  };

  Spinner = {
    initialize: function(){},
    render: function(){
      var spinner = document.createElement("div");
      var height = this.height() || Keen.Spinner.defaults.height;
      spinner.className = "keen-loading";
      spinner.style.height = String(height + "px");
      spinner.style.position = "relative";
      spinner.style.width = String(this.width() + "px");

      this.el().innerHTML = "";
      this.el().appendChild(spinner);
      this.view._artifacts.spinner = new Keen.Spinner(Keen.Spinner.defaults).spin(spinner);
    },
    destroy: function(){
      this.view._artifacts.spinner.stop();
      this.view._artifacts.spinner = null;
    }
  };

  Keen.Dataviz.register('keen-io', {
    'metric': Metric,
    'error': Error,
    'spinner': Spinner
  }, {
    capabilities: dataTypes
  });

}; //)(Keen);

},{"../../core":16,"../../core/utils/clone":27,"../../core/utils/each":28,"../../core/utils/extend":30,"../dataviz":53,"../utils/prettyNumber":92}],53:[function(require,module,exports){
var clone = require('../core/utils/clone'),
    each = require('../core/utils/each'),
    extend = require('../core/utils/extend'),
    loadScript = require('./utils/loadScript'),
    loadStyle = require('./utils/loadStyle');

var Keen = require('../core');
var Emitter = require('../core/utils/emitter-shim');

var Dataset = require('../dataset');

function Dataviz(){
  this.dataset = new Dataset();
  this.view = {
    _prepared: false,
    _initialized: false,
    _rendered: false,
    _artifacts: { /* state bin */ },
    adapter: {
      library: undefined,
      chartOptions: {},
      chartType: undefined,
      defaultChartType: undefined,
      dataType: undefined
    },
    attributes: clone(Dataviz.defaults),
    defaults: clone(Dataviz.defaults),
    el: undefined,
    loader: { library: 'keen-io', chartType: 'spinner' }
  };
  Dataviz.visuals.push(this);
};

extend(Dataviz, {
  dataTypeMap: {
    'singular':          { library: 'keen-io', chartType: 'metric'      },
    'categorical':       { library: 'google',  chartType: 'piechart'    },
    'cat-interval':      { library: 'google',  chartType: 'columnchart' },
    'cat-ordinal':       { library: 'google',  chartType: 'barchart'    },
    'chronological':     { library: 'google',  chartType: 'areachart'   },
    'cat-chronological': { library: 'google',  chartType: 'linechart'   },
    'extraction':        { library: 'google',  chartType: 'table'       },
    'nominal':           { library: 'google',  chartType: 'table'       }
  },
  defaults: {
    colors: [
    /* teal      red        yellow     purple     orange     mint       blue       green      lavender */
    '#00bbde', '#fe6672', '#eeb058', '#8a8ad6', '#ff855c', '#00cfbb', '#5a9eed', '#73d483', '#c879bb',
    '#0099b6', '#d74d58', '#cb9141', '#6b6bb6', '#d86945', '#00aa99', '#4281c9', '#57b566', '#ac5c9e',
    '#27cceb', '#ff818b', '#f6bf71', '#9b9be1', '#ff9b79', '#26dfcd', '#73aff4', '#87e096', '#d88bcb'
    ],
    indexBy: 'timeframe.start',
    stacked: false
  },
  dependencies: {
    loading: 0,
    loaded: 0,
    urls: {}
  },
  libraries: {},
  visuals: []
});

Emitter(Dataviz);
Emitter(Dataviz.prototype);

Dataviz.register = function(name, methods, config){
  var self = this;
  var loadHandler = function(st) {
    st.loaded++;
    if(st.loaded === st.loading) {
      Keen.loaded = true;
      Keen.trigger('ready');
    }
  };

  Dataviz.libraries[name] = Dataviz.libraries[name] || {};

  // Add method to library hash
  each(methods, function(method, key){
    Dataviz.libraries[name][key] = method;
  });

  // Set default capabilities hash
  if (config && config.capabilities) {
    Dataviz.libraries[name]._defaults = Dataviz.libraries[name]._defaults || {};
    each(config.capabilities, function(typeSet, key){
      // store somewhere in library
      Dataviz.libraries[name]._defaults[key] = typeSet;
    });
  }

  // For all dependencies
  if (config && config.dependencies) {
    each(config.dependencies, function (dependency, index, collection) {
      var status = Dataviz.dependencies;
      // If it doesn't exist in the current dependencies being loaded
      if(!status.urls[dependency.url]) {
        status.urls[dependency.url] = true;
        status.loading++;
        var method = dependency.type === 'script' ? loadScript : loadStyle;

        method(dependency.url, function() {
          if(dependency.cb) {
            dependency.cb.call(self, function() {
              loadHandler(status);
            });
          } else {
            loadHandler(status);
          }
        });
      }
    });
  }
};

Dataviz.find = function(target){
  if (!arguments.length) return Dataviz.visuals;
  var el = target.nodeName ? target : document.querySelector(target),
      match;

  each(Dataviz.visuals, function(visual){
    if (el == visual.el()){
      match = visual;
      return false;
    }
  });
  if (match) return match;
};

module.exports = Dataviz;

},{"../core":16,"../core/utils/clone":27,"../core/utils/each":28,"../core/utils/emitter-shim":29,"../core/utils/extend":30,"../dataset":35,"./utils/loadScript":90,"./utils/loadStyle":91}],54:[function(require,module,exports){
var clone = require("../../core/utils/clone"),
    extend = require("../../core/utils/extend"),
    Dataviz = require("../dataviz"),
    Request = require("../../core/request");

module.exports = function(query, el, cfg) {
  var DEFAULTS = clone(Dataviz.defaults),
      visual = new Dataviz(),
      request = new Request(this, [query]),
      config = cfg ? clone(cfg) : {};

  if (config.chartType) {
    visual.chartType(config.chartType);
    delete config.chartType;
  }

  if (config.library) {
    visual.library(config.library);
    delete config.library;
  }

  if (config.chartOptions) {
    visual.chartOptions(config.chartOptions);
    delete config.chartOptions;
  }

  visual
    .attributes(extend(DEFAULTS, config))
    .el(el)
    .prepare();

  request.refresh();
  request.on("complete", function(){
    visual
      .parseRequest(this)
      .call(function(){
        if (config.labels) {
          this.labels(config.labels);
        }
      })
      .render();
  });
  request.on("error", function(res){
    visual.error(res.message);
  });

  return visual;
};

},{"../../core/request":25,"../../core/utils/clone":27,"../../core/utils/extend":30,"../dataviz":53}],55:[function(require,module,exports){
var Dataviz = require("../dataviz"),
    extend = require("../../core/utils/extend")

module.exports = function(){
  var map = extend({}, Dataviz.dataTypeMap),
      dataType = this.dataType(),
      library = this.library(),
      chartType = this.chartType() || this.defaultChartType();

  // Use the default library as a backup
  if (!library && map[dataType]) {
    library = map[dataType].library;
  }

  // Use this library's default chartType for this dataType
  if (library && !chartType && dataType) {
    chartType = Dataviz.libraries[library]._defaults[dataType][0];
  }

  // Still no luck?
  if (library && !chartType && map[dataType]) {
    chartType = map[dataType].chartType;
  }

  // Return if found
  return (library && chartType) ? Dataviz.libraries[library][chartType] : {};
};

},{"../../core/utils/extend":30,"../dataviz":53}],56:[function(require,module,exports){
var each = require("../../core/utils/each"),
    Dataset = require("../../dataset");

module.exports = {
  "extraction": parseExtraction
};

function parseExtraction(req){
  var data = (req.data instanceof Array ? req.data[0] : req.data),
  names = req.queries[0].get("property_names") || [],
  schema = { records: "result", select: true };
  if (names) {
    schema.select = [];
    each(names, function(p){
      schema.select.push({ path: p });
    });
  }

  return new Dataset(data, schema);
}

},{"../../core/utils/each":28,"../../dataset":35}],57:[function(require,module,exports){
module.exports = function(req){
  var analysis = req.queries[0].analysis.replace("_", " "),
  collection = req.queries[0].get('event_collection'),
  output;
  output = analysis.replace( /\b./g, function(a){
    return a.toUpperCase();
  });
  if (collection) {
    output += ' - ' + collection;
  }
  return output;
};

},{}],58:[function(require,module,exports){
module.exports = function(query){
  var isInterval = typeof query.params.interval === "string",
  isGroupBy = typeof query.params.group_by === "string",
  is2xGroupBy = query.params.group_by instanceof Array,
  dataType;

  // metric
  if (!isGroupBy && !isInterval) {
    dataType = 'singular';
  }

  // group_by, no interval
  if (isGroupBy && !isInterval) {
    dataType = 'categorical';
  }

  // interval, no group_by
  if (isInterval && !isGroupBy) {
    dataType = 'chronological';
  }

  // interval, group_by
  if (isInterval && isGroupBy) {
    dataType = 'cat-chronological';
  }

  // 2x group_by
  // TODO: research possible dataType options
  if (!isInterval && is2xGroupBy) {
    dataType = 'categorical';
  }

  // interval, 2x group_by
  // TODO: research possible dataType options
  if (isInterval && is2xGroupBy) {
    dataType = 'cat-chronological';
  }

  if (query.analysis === "funnel") {
    dataType = 'cat-ordinal';
  }

  if (query.analysis === "extraction") {
    dataType = 'extraction';
  }
  if (query.analysis === "select_unique") {
    dataType = 'nominal';
  }

  return dataType;
};

},{}],59:[function(require,module,exports){
var extend = require('../core/utils/extend'),
    Dataviz = require('./dataviz');

extend(Dataviz.prototype, {
  'adapter'          : require('./lib/adapter'),
  'attributes'       : require('./lib/attributes'),
  'call'             : require('./lib/call'),
  'chartOptions'     : require('./lib/chartOptions'),
  'chartType'        : require('./lib/chartType'),
  'colorMapping'     : require('./lib/colorMapping'),
  'colors'           : require('./lib/colors'),
  'data'             : require('./lib/data'),
  'dataType'         : require('./lib/dataType'),
  'defaultChartType' : require('./lib/defaultChartType'),
  'el'               : require('./lib/el'),
  'height'           : require('./lib/height'),
  'indexBy'          : require('./lib/indexBy'),
  'labelMapping'     : require('./lib/labelMapping'),
  'labels'           : require('./lib/labels'),
  'library'          : require('./lib/library'),
  'parseRawData'     : require('./lib/parseRawData'),
  'parseRequest'     : require('./lib/parseRequest'),
  'prepare'          : require('./lib/prepare'),
  'sortGroups'       : require('./lib/sortGroups'),
  'sortIntervals'    : require('./lib/sortIntervals'),
  'stacked'          : require('./lib/stacked'),
  'title'            : require('./lib/title'),
  'width'            : require('./lib/width')
});

extend(Dataviz.prototype, {
  'destroy'          : require('./lib/actions/destroy'),
  'error'            : require('./lib/actions/error'),
  'initialize'       : require('./lib/actions/initialize'),
  'render'           : require('./lib/actions/render'),
  'update'           : require('./lib/actions/update')
});

module.exports = Dataviz;

},{"../core/utils/extend":30,"./dataviz":53,"./lib/actions/destroy":60,"./lib/actions/error":61,"./lib/actions/initialize":62,"./lib/actions/render":63,"./lib/actions/update":64,"./lib/adapter":65,"./lib/attributes":66,"./lib/call":67,"./lib/chartOptions":68,"./lib/chartType":69,"./lib/colorMapping":70,"./lib/colors":71,"./lib/data":72,"./lib/dataType":73,"./lib/defaultChartType":74,"./lib/el":75,"./lib/height":76,"./lib/indexBy":77,"./lib/labelMapping":78,"./lib/labels":79,"./lib/library":80,"./lib/parseRawData":81,"./lib/parseRequest":82,"./lib/prepare":83,"./lib/sortGroups":84,"./lib/sortIntervals":85,"./lib/stacked":86,"./lib/title":87,"./lib/width":88}],60:[function(require,module,exports){
var getAdapterActions = require("../../helpers/getAdapterActions");

module.exports = function(){
  var actions = getAdapterActions.call(this);
  if (actions.destroy) {
    actions.destroy.apply(this, arguments);
  }
  // clear rendered artifats, state bin
  if (this.el()) {
    this.el().innerHTML = "";
  }
  this.view._prepared = false;
  this.view._initialized = false;
  this.view._rendered = false;
  this.view._artifacts = {};
  return this;
};

},{"../../helpers/getAdapterActions":55}],61:[function(require,module,exports){
var getAdapterActions = require("../../helpers/getAdapterActions"),
    Dataviz = require("../../dataviz");

module.exports = function(){
  var actions = getAdapterActions.call(this);
  if (actions['error']) {
    actions['error'].apply(this, arguments);
  } else {
    Dataviz.libraries['keen-io']['error'].render.apply(this, arguments);
  }
  return this;
};

},{"../../dataviz":53,"../../helpers/getAdapterActions":55}],62:[function(require,module,exports){
var getAdapterActions = require("../../helpers/getAdapterActions"),
    Dataviz = require("../../dataviz");

module.exports = function(){
  var actions = getAdapterActions.call(this);
  var loader = Dataviz.libraries[this.view.loader.library][this.view.loader.chartType];
  if (this.view._prepared) {
    if (loader.destroy) loader.destroy.apply(this, arguments);
  } else {
    if (this.el()) this.el().innerHTML = "";
  }
  if (actions.initialize) actions.initialize.apply(this, arguments);
  this.view._initialized = true;
  return this;
};

},{"../../dataviz":53,"../../helpers/getAdapterActions":55}],63:[function(require,module,exports){
var getAdapterActions = require("../../helpers/getAdapterActions"),
    applyTransforms = require("../../utils/applyTransforms");

module.exports = function(){
  var actions = getAdapterActions.call(this);
  applyTransforms.call(this);
  if (!this.view._initialized) {
    this.initialize();
  }
  if (this.el() && actions.render) {
    actions.render.apply(this, arguments);
    this.view._rendered = true;
  }
  return this;
};

},{"../../helpers/getAdapterActions":55,"../../utils/applyTransforms":89}],64:[function(require,module,exports){
var getAdapterActions = require("../../helpers/getAdapterActions"),
    applyTransforms = require("../../utils/applyTransforms");

module.exports = function(){
  var actions = getAdapterActions.call(this);
  applyTransforms.call(this);
  if (actions.update) {
    actions.update.apply(this, arguments);
  } else if (actions.render) {
    this.render();
  }
  return this;
};

},{"../../helpers/getAdapterActions":55,"../../utils/applyTransforms":89}],65:[function(require,module,exports){
var each = require("../../core/utils/each");

module.exports = function(obj){
  if (!arguments.length) return this.view.adapter;
  var self = this;
  each(obj, function(prop, key){
    self.view.adapter[key] = (prop ? prop : null);
  });
  return this;
};

},{"../../core/utils/each":28}],66:[function(require,module,exports){
var each = require("../../core/utils/each");
var chartOptions = require("./chartOptions");

module.exports = function(obj){
  if (!arguments.length) return this.view["attributes"];
  var self = this;
  each(obj, function(prop, key){
    if (key === "chartOptions") {
      chartOptions.call(self, prop);
      // self.chartOptions(prop);
    } else {
      self.view["attributes"][key] = prop;
    }
  });
  return this;
};

},{"../../core/utils/each":28,"./chartOptions":68}],67:[function(require,module,exports){
module.exports = function(fn){
  fn.call(this);
  return this;
};

},{}],68:[function(require,module,exports){
var extend = require('../../core/utils/extend');
module.exports = function(obj){
  if (!arguments.length) return this.view.adapter.chartOptions;
  extend(this.view.adapter.chartOptions, obj);
  return this;
};

},{"../../core/utils/extend":30}],69:[function(require,module,exports){
module.exports = function(str){
  if (!arguments.length) return this.view.adapter.chartType;
  this.view.adapter.chartType = (str ? String(str) : null);
  return this;
};

},{}],70:[function(require,module,exports){
var each = require("../../core/utils/each");

module.exports = function(obj){
  if (!arguments.length) return this.view["attributes"].colorMapping;
  this.view["attributes"].colorMapping = (obj ? obj : null);
  colorMapping.call(this);
  return this;
};

function colorMapping(){
  var self = this,
      schema = this.dataset.schema,
      data = this.dataset.output(),
      colorSet = this.view.defaults.colors.slice(),
      colorMap = this.colorMapping(),
      dt = this.dataType() || "";

  if (colorMap) {
    if (dt.indexOf("chronological") > -1 || (schema.unpack && data[0].length > 2)) {
      each(data[0].slice(1), function(label, i){
        var color = colorMap[label];
        if (color && colorSet[i] !== color) {
          colorSet.splice(i, 0, color);
        }
      });
    }
    else {
      each(self.dataset.selectColumn(0).slice(1), function(label, i){
        var color = colorMap[label];
        if (color && colorSet[i] !== color) {
          colorSet.splice(i, 0, color);
        }
      });
    }
    self.view.attributes.colors = colorSet;
  }
}

},{"../../core/utils/each":28}],71:[function(require,module,exports){
module.exports = function(arr){
  if (!arguments.length) return this.view["attributes"].colors;
  this.view["attributes"].colors = (arr instanceof Array ? arr : null);
  this.view.defaults.colors = (arr instanceof Array ? arr : null);
  return this;
};

},{}],72:[function(require,module,exports){
var Dataset = require("../../dataset"),
    Request = require("../../core/request");

module.exports = function(data){
  if (!arguments.length) return this.dataset.output();
  if (data instanceof Dataset) {
    this.dataset = data;
  } else if (data instanceof Request) {
    this.parseRequest(data);
  } else {
    this.parseRawData(data);
  }
  return this;
};

},{"../../core/request":25,"../../dataset":35}],73:[function(require,module,exports){
module.exports = function(str){
  if (!arguments.length) return this.view.adapter.dataType;
  this.view.adapter.dataType = (str ? String(str) : null);
  return this;
};

},{}],74:[function(require,module,exports){
module.exports = function(str){
  if (!arguments.length) return this.view.adapter.defaultChartType;
  this.view.adapter.defaultChartType = (str ? String(str) : null);
  return this;
};

},{}],75:[function(require,module,exports){
module.exports = function(el){
  if (!arguments.length) return this.view.el;
  this.view.el = el;
  return this;
};

},{}],76:[function(require,module,exports){
module.exports = function(num){
  if (!arguments.length) return this.view["attributes"]["height"];
  this.view["attributes"]["height"] = (!isNaN(parseInt(num)) ? parseInt(num) : null);
  return this;
};

},{}],77:[function(require,module,exports){
var Dataset = require("../../dataset"),
    Dataviz = require("../dataviz"),
    each = require("../../core/utils/each");

module.exports = function(str){
  if (!arguments.length) return this.view["attributes"].indexBy;
  this.view["attributes"].indexBy = (str ? String(str) : Dataviz.defaults.indexBy);
  indexBy.call(this);
  return this;
};

function indexBy(){
  var self = this,
  root = this.dataset.meta.schema || this.dataset.meta.unpack,
  newOrder = this.indexBy().split(".").join(Dataset.defaults.delimeter);
  // Replace in schema and re-run dataset.parse()
  each(root, function(def, i){
    // update 'select' configs
    if (i === "select" && def instanceof Array) {
      each(def, function(c, j){
        if (c.path.indexOf("timeframe -> ") > -1) {
          self.dataset.meta.schema[i][j].path = newOrder;
        }
      });
    }
    // update 'unpack' configs
    else if (i === "unpack" && typeof def === "object") {
      self.dataset.meta.schema[i]['index'].path = newOrder;
    }
  });
  this.dataset.parse();
}

},{"../../core/utils/each":28,"../../dataset":35,"../dataviz":53}],78:[function(require,module,exports){
var each = require("../../core/utils/each");

module.exports = function(obj){
  if (!arguments.length) return this.view["attributes"].labelMapping;
  this.view["attributes"].labelMapping = (obj ? obj : null);
  applyLabelMapping.call(this);
  return this;
};

function applyLabelMapping(){
  var self = this,
  labelMap = this.labelMapping(),
  schema = this.dataset.schema() || {},
  dt = this.dataType() || "";

  if (labelMap) {
    if (dt.indexOf("chronological") > -1 || (schema.unpack && self.dataset.output()[0].length > 2)) {
      // loop over header cells
      each(self.dataset.output()[0], function(c, i){
        if (i > 0) {
          self.dataset.data.output[0][i] = labelMap[c] || c;
        }
      });
    }
    else if (schema.select && self.dataset.output()[0].length === 2) {
      // update column 0
      self.dataset.updateColumn(0, function(c, i){
        return labelMap[c] || c;
      });
    }
  }
}

},{"../../core/utils/each":28}],79:[function(require,module,exports){
var each = require('../../core/utils/each');

module.exports = function(arr){
  if (!arguments.length) {
    // If labels config is empty, return what's in the dataset
    if (!this.view['attributes'].labels || !this.view['attributes'].labels.length) {
      return getLabels.call(this);
    }
    else {
      return this.view['attributes'].labels;
    }
  }
  else {
    this.view['attributes'].labels = (arr instanceof Array ? arr : null);
    setLabels.call(this);
    return this;
  }
};

function setLabels(){
  var self = this,
      labelSet = this.labels() || null,
      schema = this.dataset.schema() || {},
      data = this.dataset.output(),
      dt = this.dataType() || '';

  if (labelSet) {
    if (dt.indexOf('chronological') > -1 || (schema.unpack && data[0].length > 2)) {
      each(data[0], function(cell,i){
        if (i > 0 && labelSet[i-1]) {
          self.dataset.data.output[0][i] = labelSet[i-1];
        }
      });
    }
    else {
      each(data, function(row,i){
        if (i > 0 && labelSet[i-1]) {
          self.dataset.data.output[i][0] = labelSet[i-1];
        }
      });
    }
  }
}

function getLabels(){
  var schema = this.dataset.schema() || {},
      data = this.dataset.output(),
      dt = this.dataType() || '',
      labels;

  if (dt.indexOf('chron') > -1 || (schema.unpack && data[0].length > 2)) {
    labels = this.dataset.selectRow(0).slice(1);
  }
  else {
    labels = this.dataset.selectColumn(0).slice(1);
  }
  return labels;
}

},{"../../core/utils/each":28}],80:[function(require,module,exports){
module.exports = function(str){
  if (!arguments.length) return this.view.adapter.library;
  this.view.adapter.library = (str ? String(str) : null);
  return this;
};

},{}],81:[function(require,module,exports){
var Dataviz = require('../dataviz'),
    Dataset = require('../../dataset');

var each = require('../../core/utils/each');

module.exports = function(raw){
  this.dataset = parseRawData.call(this, raw);
  return this;
};

function parseRawData(response){
  var self = this,
      schema = {},
      indexBy,
      delimeter,
      indexTarget,
      labelSet,
      labelMap,
      dataType,
      dataset;

  indexBy = self.indexBy() ? self.indexBy() : Dataviz.defaults.indexBy;
  delimeter = Dataset.defaults.delimeter;
  indexTarget = indexBy.split('.').join(delimeter);

  labelSet = self.labels() || null;
  labelMap = self.labelMapping() || null;

  // Metric
  // -------------------------------
  if (typeof response.result == 'number'){
    //return new Dataset(response, {
    dataType = 'singular';
    schema = {
      records: '',
      select: [{
        path: 'result',
        type: 'string',
        label: 'Metric'
      }]
    }
  }

  // Everything else
  // -------------------------------
  if (response.result instanceof Array && response.result.length > 0){

    // Interval w/ single value
    // -------------------------------
    if (response.result[0].timeframe && (typeof response.result[0].value == 'number' || response.result[0].value == null)) {
      dataType = 'chronological';
      schema = {
        records: 'result',
        select: [
          {
            path: indexTarget,
            type: 'date'
          },
          {
            path: 'value',
            type: 'number'
            // format: '10'
          }
        ]
      }
    }

    // Static GroupBy
    // -------------------------------
    if (typeof response.result[0].result == 'number'){
      dataType = 'categorical';
      schema = {
        records: 'result',
        select: []
      };
      for (var key in response.result[0]){
        if (response.result[0].hasOwnProperty(key) && key !== 'result'){
          schema.select.push({
            path: key,
            type: 'string'
          });
          break;
        }
      }
      schema.select.push({
        path: 'result',
        type: 'number'
      });
    }

    // Grouped Interval
    // -------------------------------
    if (response.result[0].value instanceof Array){
      dataType = 'cat-chronological';
      schema = {
        records: 'result',
        unpack: {
          index: {
            path: indexTarget,
            type: 'date'
          },
          value: {
            path: 'value -> result',
            type: 'number'
          }
        }
      }
      for (var key in response.result[0].value[0]){
        if (response.result[0].value[0].hasOwnProperty(key) && key !== 'result'){
          schema.unpack.label = {
            path: 'value -> ' + key,
            type: 'string'
          }
          break;
        }
      }
    }

    // Funnel
    // -------------------------------
    if (typeof response.result[0] == 'number' && typeof response.result.steps !== "undefined"){
      dataType = 'cat-ordinal';
      schema = {
        records: '',
        unpack: {
          index: {
            path: 'steps -> event_collection',
            type: 'string'
          },
          value: {
            path: 'result -> ',
            type: 'number'
          }
        }
      }
    }

    // Select Unique
    // -------------------------------
    if (typeof response.result[0] == 'string' || typeof response.result[0] == 'number'){
      dataType = 'nominal';
      dataset = new Dataset();
      dataset.appendColumn('unique values', []);
      each(response.result, function(result, i){
        dataset.appendRow(result);
      });
    }

    // Extraction
    // -------------------------------
    if (dataType === void 0) {
      dataType = 'extraction';
      schema = { records: 'result', select: true };
    }

  }

  dataset = dataset instanceof Dataset ? dataset : new Dataset(response, schema);

  // Set dataType
  if (dataType) {
    self.dataType(dataType);
  }

  return dataset;
}

},{"../../core/utils/each":28,"../../dataset":35,"../dataviz":53}],82:[function(require,module,exports){
var getDatasetSchemas = require("../helpers/getDatasetSchemas"),
    getDefaultTitle = require("../helpers/getDefaultTitle"),
    getQueryDataType = require("../helpers/getQueryDataType");

var Dataset = require("../../dataset"),
    parseRawData = require("./parseRawData");

module.exports = function(req){
  var dataType = getQueryDataType(req.queries[0]);

  if (dataType === "extraction") {
    this.dataset = getDatasetSchemas.extraction(req);
  }
  else {
    this.parseRawData(req.data instanceof Array ? req.data[0] : req.data);
  }

  // Set dataType
  this.dataType(dataType);

  // Update the default title every time
  this.view.defaults.title = getDefaultTitle.call(this, req);

  // Update the active title if not set
  if (!this.title()) {
    this.title(this.view.defaults.title);
  }
  return this;
};

},{"../../dataset":35,"../helpers/getDatasetSchemas":56,"../helpers/getDefaultTitle":57,"../helpers/getQueryDataType":58,"./parseRawData":81}],83:[function(require,module,exports){
var Dataviz = require("../dataviz");

module.exports = function(){
  var loader;
  if (this.view._rendered) {
    this.destroy();
  }
  if (this.el()) {
    this.el().innerHTML = "";
    loader = Dataviz.libraries[this.view.loader.library][this.view.loader.chartType];
    if (loader.initialize) {
      loader.initialize.apply(this, arguments);
    }
    if (loader.render) {
      loader.render.apply(this, arguments);
    }
    this.view._prepared = true;
  }
  return this;
};

},{"../dataviz":53}],84:[function(require,module,exports){
module.exports = function(str){
  if (!arguments.length) return this.view["attributes"].sortGroups;
  this.view["attributes"].sortGroups = (str ? String(str) : null);
  runSortGroups.call(this);
  return this;
};

function runSortGroups(){
  var dt = this.dataType();
  if (!this.sortGroups()) return;
  if ((dt && dt.indexOf("chronological") > -1) || this.data()[0].length > 2) {
    // Sort columns by Sum (n values)
    this.dataset.sortColumns(this.sortGroups(), this.dataset.getColumnSum);
  }
  else if (dt && (dt.indexOf("cat-") > -1 || dt.indexOf("categorical") > -1)) {
    // Sort rows by Sum (1 value)
    this.dataset.sortRows(this.sortGroups(), this.dataset.getRowSum);
  }
  return;
}

},{}],85:[function(require,module,exports){
module.exports = function(str){
  if (!arguments.length) return this.view["attributes"].sortIntervals;
  this.view["attributes"].sortIntervals = (str ? String(str) : null);
  runSortIntervals.call(this);
  return this;
};

function runSortIntervals(){
  if (!this.sortIntervals()) return;
  // Sort rows by index
  this.dataset.sortRows(this.sortIntervals());
  return;
}

},{}],86:[function(require,module,exports){
module.exports = function(bool){
  if (!arguments.length) return this.view['attributes']['stacked'];
  this.view['attributes']['stacked'] = bool ? true : false;
  return this;
};

},{}],87:[function(require,module,exports){
module.exports = function(str){
  if (!arguments.length) return this.view["attributes"]["title"];
  this.view["attributes"]["title"] = (str ? String(str) : null);
  return this;
};

},{}],88:[function(require,module,exports){
module.exports = function(num){
  if (!arguments.length) return this.view["attributes"]["width"];
  this.view["attributes"]["width"] = (!isNaN(parseInt(num)) ? parseInt(num) : null);
  return this;
};

},{}],89:[function(require,module,exports){
module.exports = function(){

  if (this.labelMapping()) {
    this.labelMapping(this.labelMapping());
  }

  if (this.colorMapping()) {
    this.colorMapping(this.colorMapping());
  }

  if (this.sortGroups()) {
    this.sortGroups(this.sortGroups());
  }

  if (this.sortIntervals()) {
    this.sortIntervals(this.sortIntervals());
  }

};

},{}],90:[function(require,module,exports){
module.exports = function(url, cb) {
  var doc = document;
  var handler;
  var head = doc.head || doc.getElementsByTagName("head");

  // loading code borrowed directly from LABjs itself
  setTimeout(function () {
    // check if ref is still a live node list
    if ('item' in head) {
      // append_to node not yet ready
      if (!head[0]) {
        setTimeout(arguments.callee, 25);
        return;
      }
      // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
      head = head[0];
    }
    var script = doc.createElement("script"),
    scriptdone = false;
    script.onload = script.onreadystatechange = function () {
      if ((script.readyState && script.readyState !== "complete" && script.readyState !== "loaded") || scriptdone) {
        return false;
      }
      script.onload = script.onreadystatechange = null;
      scriptdone = true;
      cb();
    };
    script.src = url;
    head.insertBefore(script, head.firstChild);
  }, 0);

  // required: shim for FF <= 3.5 not having document.readyState
  if (doc.readyState === null && doc.addEventListener) {
    doc.readyState = "loading";
    doc.addEventListener("DOMContentLoaded", handler = function () {
      doc.removeEventListener("DOMContentLoaded", handler, false);
      doc.readyState = "complete";
    }, false);
  }
};

},{}],91:[function(require,module,exports){
module.exports = function(url, cb) {
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.type = 'text/css';
  link.href = url;
  cb();
  document.head.appendChild(link);
};

},{}],92:[function(require,module,exports){
module.exports = function(_input) {
  // If it has 3 or fewer sig figs already, just return the number.
  var input = Number(_input),
      sciNo = input.toPrecision(3),
      prefix = "",
      suffixes = ["", "k", "M", "B", "T"];

  if (Number(sciNo) == input && String(input).length <= 4) {
    return String(input);
  }

  if(input >= 1 || input <= -1) {
    if(input < 0){
      //Pull off the negative side and stash that.
      input = -input;
      prefix = "-";
    }
    return prefix + recurse(input, 0);
  } else {
    return input.toPrecision(3);
  }

  function recurse(input, iteration) {
    var input = String(input);
    var split = input.split(".");
    // If there's a dot
    if(split.length > 1) {
      // Keep the left hand side only
      input = split[0];
      var rhs = split[1];
      // If the left-hand side is too short, pad until it has 3 digits
      if (input.length == 2 && rhs.length > 0) {
        // Pad with right-hand side if possible
        if (rhs.length > 0) {
          input = input + "." + rhs.charAt(0);
        }
        // Pad with zeroes if you must
        else {
          input += "0";
        }
      }
      else if (input.length == 1 && rhs.length > 0) {
        input = input + "." + rhs.charAt(0);
        // Pad with right-hand side if possible
        if(rhs.length > 1) {
          input += rhs.charAt(1);
        }
        // Pad with zeroes if you must
        else {
          input += "0";
        }
      }
    }
    var numNumerals = input.length;
    // if it has a period, then numNumerals is 1 smaller than the string length:
    if (input.split(".").length > 1) {
      numNumerals--;
    }
    if(numNumerals <= 3) {
      return String(input) + suffixes[iteration];
    }
    else {
      return recurse(Number(input) / 1000, iteration + 1);
    }
  }
};

},{}],93:[function(require,module,exports){
(function (global){
;(function (f) {
  // RequireJS
  if (typeof define === "function" && define.amd) {
    define("keen", [], function(){ return f(); });
  }
  // CommonJS
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  }
  // Global
  var g = null;
  if (typeof window !== "undefined") {
    g = window;
  } else if (typeof global !== "undefined") {
    g = global;
  } else if (typeof self !== "undefined") {
    g = self;
  }
  if (g) {
    g.Keen = f();
  }
})(function() {
  "use strict";

  var Keen = require("./core"),
      extend = require("./core/utils/extend");

  extend(Keen.prototype, {
    "addEvent"            : require("./core/lib/addEvent"),
    "addEvents"           : require("./core/lib/addEvents"),
    "setGlobalProperties" : require("./core/lib/setGlobalProperties"),
    "trackExternalLink"   : require("./core/lib/trackExternalLink"),
    "get"                 : require("./core/lib/get"),
    "post"                : require("./core/lib/post"),
    "put"                 : require("./core/lib/post"),
    "run"                 : require("./core/lib/run"),
    "draw"                : require("./dataviz/extensions/draw")
  });

  Keen.Query = require("./core/query");
  Keen.Request = require("./core/request");
  Keen.Dataset = require("./dataset");
  Keen.Dataviz = require("./dataviz");

  Keen.Base64 = require("./core/utils/base64");
  Keen.Spinner = require("spin.js");

  Keen.utils = {
    "domready"     : require("domready"),
    "each"         : require("./core/utils/each"),
    "extend"       : extend,
    "parseParams"  : require("./core/utils/parseParams"),
    "prettyNumber" : require("./dataviz/utils/prettyNumber")
    // "loadScript"   : require("./dataviz/utils/loadScript"),
    // "loadStyle"    : require("./dataviz/utils/loadStyle")
  };

  require("./dataviz/adapters/keen-io")();
  require("./dataviz/adapters/google")();
  require("./dataviz/adapters/c3")();
  require("./dataviz/adapters/chartjs")();

  if (Keen.loaded) {
    setTimeout(function(){
      Keen.utils.domready(function(){
        Keen.emit("ready");
      });
    }, 0);
  }
  require("./core/async")();

  module.exports = Keen;
  return Keen;
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core":16,"./core/async":8,"./core/lib/addEvent":17,"./core/lib/addEvents":18,"./core/lib/get":19,"./core/lib/post":20,"./core/lib/run":21,"./core/lib/setGlobalProperties":22,"./core/lib/trackExternalLink":23,"./core/query":24,"./core/request":25,"./core/utils/base64":26,"./core/utils/each":28,"./core/utils/extend":30,"./core/utils/parseParams":32,"./dataset":35,"./dataviz":59,"./dataviz/adapters/c3":49,"./dataviz/adapters/chartjs":50,"./dataviz/adapters/google":51,"./dataviz/adapters/keen-io":52,"./dataviz/extensions/draw":54,"./dataviz/utils/prettyNumber":92,"domready":2,"spin.js":4}],94:[function(require,module,exports){
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


},{"./utils":101}],95:[function(require,module,exports){
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

},{}],96:[function(require,module,exports){

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


},{"./socket":100,"./views/displaymetadata":103,"./views/effects":105,"./views/showerror":112}],97:[function(require,module,exports){
(function (global){

'use strict';

var initSocket = require('./socket').initSocket;
var display = require('./views/displaymetadata');
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
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
        socket.send(blob);
      }
    };
  }

  var speech = {};
  speech.transcript = '';
  speech.words = [];
  var hash = '' + new Date();
  function onMessage(msg, socket) {
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

    // Keen.ready(function() {
    //   keenClient.addEvents(multipleEvents, function(err, res){
    //     if (err) {
    //       console.log('err', err);
    //     }
    //     else {
          setTimeout(function() {
            console.log(speech_id);
            var query = new Keen.Query("count", {
              eventCollection: "words",
              filters: [{"operator":"eq","property_name":"speech_id","property_value":speech_id}],
              groupBy: "text",
              timeframe: "this_14_days",
              timezone: "UTC"
            });

            keenClient.draw(query, document.getElementById('grid-1-1'), {
              // Custom configuration here
            });

            $('#chart-container').css('display', 'block');
          }, 10000);
    //     }
    //   });
    // });
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
    $('#resultsText').html(speech.transcript);
    sendWordsToKeen(speech.words);
    // console.log('Mic socket close: ', evt);
    // TODO: send stuff to keen io
  }

  initSocket(options, onOpen, onListening, onMessage, onError, onClose);
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./keen":99,"./socket":100,"./views/displaymetadata":103}],98:[function(require,module,exports){
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

},{"./Microphone":94,"./data/models.json":95,"./utils":101,"./views":107}],99:[function(require,module,exports){
var Keen = require('keen-js');

exports.client = new Keen({
  projectId: "5606f3f490e4bd7b0e0e1ddc", // String (required always)
  writeKey: "2fc76068ea39562a5e3c8f3ae5c10a0588bf074246861b36fa17150bd21dd01140ac051b2bae4ae1158e217857baf73112120d4f90a72b56e4c1c97d3f4b0e248b905427cfe8182552bac3b91ae72d7d062ab20412681ac39844918a4ca2d00c4075ae048030fe8fc95212774010db65",   // String (required for sending data)
  readKey: "b2e5446a0409b73d192cc7c6c3b39ad2fc5abea3876d1885eae25f250da383497a227cfd6f69d30246065a96e621a33a2b6d22feec80a7ee4d520775552a0f09bc378ee7ec8a53d7534c4163bc5b920d7eb698554ce5b0fd8bf00de399675d454146166d1f94da22160808ce27511064"      // String (required for querying data)

  // protocol: "https",         // String (optional: https | http | auto)
  // host: "api.keen.io/3.0",   // String (optional)
  // requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
});


},{"keen-js":93}],100:[function(require,module,exports){
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
},{"./Microphone":94,"./utils":101,"./views/showerror":112}],101:[function(require,module,exports){
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

},{}],102:[function(require,module,exports){


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


},{}],103:[function(require,module,exports){
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

},{}],104:[function(require,module,exports){

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

},{"./fileupload":106}],105:[function(require,module,exports){



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

},{}],106:[function(require,module,exports){

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
},{"../handlefileupload":96,"../utils":101,"./effects":105,"./showerror":112}],107:[function(require,module,exports){

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

},{"./animatepanel":102,"./displaymetadata":103,"./dragdrop":104,"./fileupload":106,"./playsample":108,"./recordbutton":109,"./selectmodel":110,"./sessionpermissions":111,"./showtab":113}],108:[function(require,module,exports){

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



},{"../handlefileupload":96,"../socket":100,"../utils":101,"./effects":105,"./showerror":112}],109:[function(require,module,exports){

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
        $('#resultsText').html('');   // clear hypotheses from previous runs
        console.log('Not running, handleMicrophone()');
        handleMicrophone(token, currentModel, mic, function(err, socket) {
          if (err) {
            var msg = 'Error: ' + err.message;
            console.log(msg);
            showError(msg);
            running = false;
          } else {
            recordButton.css('background-color', '#D62030');
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
},{"../Microphone":94,"../handlemicrophone":97,"./showerror":112}],110:[function(require,module,exports){

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
},{"./playsample":108}],111:[function(require,module,exports){

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

},{}],112:[function(require,module,exports){

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
},{}],113:[function(require,module,exports){

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
},{}]},{},[98])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL2RvbXJlYWR5L3JlYWR5LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL2pzb24zL2xpYi9qc29uMy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL25vZGVfbW9kdWxlcy9zcGluLmpzL3NwaW4uanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9ub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9hc3luYy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2hlbHBlcnMvZ2V0LWNvbnRleHQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL2dldC1xdWVyeS1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL2dldC10aW1lem9uZS1vZmZzZXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL2dldC11cmwtbWF4LWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2hlbHBlcnMvZ2V0LXhoci1vYmplY3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL3N1cGVyYWdlbnQtaGFuZGxlLXJlc3BvbnNlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2NvcmUvaGVscGVycy9zdXBlcmFnZW50LXJlcXVlc3QtdHlwZXMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2xpYi9hZGRFdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2xpYi9hZGRFdmVudHMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9saWIvZ2V0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2NvcmUvbGliL3Bvc3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9saWIvcnVuLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2NvcmUvbGliL3NldEdsb2JhbFByb3BlcnRpZXMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9saWIvdHJhY2tFeHRlcm5hbExpbmsuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9xdWVyeS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL3JlcXVlc3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9iYXNlNjQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9jbG9uZS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL3V0aWxzL2VhY2guanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9lbWl0dGVyLXNoaW0uanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9leHRlbmQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9qc29uLXNoaW0uanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9wYXJzZVBhcmFtcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL3V0aWxzL3NlbmRRdWVyeS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2RhdGFzZXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9hbmFseXNlcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9hcHBlbmQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9saWIvZGVsZXRlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGFzZXQvbGliL2ZpbHRlci5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9mb3JtYXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9saWIvaW5zZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGFzZXQvbGliL3NlbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9zZXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9saWIvc29ydC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi91cGRhdGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC91dGlscy9jcmVhdGUtbnVsbC1saXN0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGFzZXQvdXRpbHMvZmxhdHRlbi5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L3V0aWxzL3BhcnNlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovYWRhcHRlcnMvYzMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9hZGFwdGVycy9jaGFydGpzLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovYWRhcHRlcnMvZ29vZ2xlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovYWRhcHRlcnMva2Vlbi1pby5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2RhdGF2aXouanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9leHRlbnNpb25zL2RyYXcuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9oZWxwZXJzL2dldEFkYXB0ZXJBY3Rpb25zLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovaGVscGVycy9nZXREYXRhc2V0U2NoZW1hcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2hlbHBlcnMvZ2V0RGVmYXVsdFRpdGxlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovaGVscGVycy9nZXRRdWVyeURhdGFUeXBlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovaW5kZXguanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvYWN0aW9ucy9kZXN0cm95LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FjdGlvbnMvZXJyb3IuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvYWN0aW9ucy9pbml0aWFsaXplLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FjdGlvbnMvcmVuZGVyLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FjdGlvbnMvdXBkYXRlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FkYXB0ZXIuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvYXR0cmlidXRlcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9jYWxsLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2NoYXJ0T3B0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9jaGFydFR5cGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvY29sb3JNYXBwaW5nLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2NvbG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9kYXRhLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2RhdGFUeXBlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2RlZmF1bHRDaGFydFR5cGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvZWwuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvaGVpZ2h0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2luZGV4QnkuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvbGFiZWxNYXBwaW5nLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2xhYmVscy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9saWJyYXJ5LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL3BhcnNlUmF3RGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9wYXJzZVJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvcHJlcGFyZS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9zb3J0R3JvdXBzLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL3NvcnRJbnRlcnZhbHMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvc3RhY2tlZC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi90aXRsZS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi93aWR0aC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L3V0aWxzL2FwcGx5VHJhbnNmb3Jtcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L3V0aWxzL2xvYWRTY3JpcHQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei91dGlscy9sb2FkU3R5bGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei91dGlscy9wcmV0dHlOdW1iZXIuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMva2Vlbi5qcyIsInNyYy9NaWNyb3Bob25lLmpzIiwic3JjL2RhdGEvbW9kZWxzLmpzb24iLCJzcmMvaGFuZGxlZmlsZXVwbG9hZC5qcyIsInNyYy9oYW5kbGVtaWNyb3Bob25lLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL2tlZW4uanMiLCJzcmMvc29ja2V0LmpzIiwic3JjL3V0aWxzLmpzIiwic3JjL3ZpZXdzL2FuaW1hdGVwYW5lbC5qcyIsInNyYy92aWV3cy9kaXNwbGF5bWV0YWRhdGEuanMiLCJzcmMvdmlld3MvZHJhZ2Ryb3AuanMiLCJzcmMvdmlld3MvZWZmZWN0cy5qcyIsInNyYy92aWV3cy9maWxldXBsb2FkLmpzIiwic3JjL3ZpZXdzL2luZGV4LmpzIiwic3JjL3ZpZXdzL3BsYXlzYW1wbGUuanMiLCJzcmMvdmlld3MvcmVjb3JkYnV0dG9uLmpzIiwic3JjL3ZpZXdzL3NlbGVjdG1vZGVsLmpzIiwic3JjL3ZpZXdzL3Nlc3Npb25wZXJtaXNzaW9ucy5qcyIsInNyYy92aWV3cy9zaG93ZXJyb3IuanMiLCJzcmMvdmlld3Mvc2hvd3RhYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3Q0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgdGhpcy5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiLyohXG4gICogZG9tcmVhZHkgKGMpIER1c3RpbiBEaWF6IDIwMTIgLSBMaWNlbnNlIE1JVFxuICAqL1xuIWZ1bmN0aW9uIChuYW1lLCBkZWZpbml0aW9uKSB7XG4gIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnKSBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKVxuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcpIGRlZmluZShkZWZpbml0aW9uKVxuICBlbHNlIHRoaXNbbmFtZV0gPSBkZWZpbml0aW9uKClcbn0oJ2RvbXJlYWR5JywgZnVuY3Rpb24gKHJlYWR5KSB7XG5cbiAgdmFyIGZucyA9IFtdLCBmbiwgZiA9IGZhbHNlXG4gICAgLCBkb2MgPSBkb2N1bWVudFxuICAgICwgdGVzdEVsID0gZG9jLmRvY3VtZW50RWxlbWVudFxuICAgICwgaGFjayA9IHRlc3RFbC5kb1Njcm9sbFxuICAgICwgZG9tQ29udGVudExvYWRlZCA9ICdET01Db250ZW50TG9hZGVkJ1xuICAgICwgYWRkRXZlbnRMaXN0ZW5lciA9ICdhZGRFdmVudExpc3RlbmVyJ1xuICAgICwgb25yZWFkeXN0YXRlY2hhbmdlID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSdcbiAgICAsIHJlYWR5U3RhdGUgPSAncmVhZHlTdGF0ZSdcbiAgICAsIGxvYWRlZFJneCA9IGhhY2sgPyAvXmxvYWRlZHxeYy8gOiAvXmxvYWRlZHxjL1xuICAgICwgbG9hZGVkID0gbG9hZGVkUmd4LnRlc3QoZG9jW3JlYWR5U3RhdGVdKVxuXG4gIGZ1bmN0aW9uIGZsdXNoKGYpIHtcbiAgICBsb2FkZWQgPSAxXG4gICAgd2hpbGUgKGYgPSBmbnMuc2hpZnQoKSkgZigpXG4gIH1cblxuICBkb2NbYWRkRXZlbnRMaXN0ZW5lcl0gJiYgZG9jW2FkZEV2ZW50TGlzdGVuZXJdKGRvbUNvbnRlbnRMb2FkZWQsIGZuID0gZnVuY3Rpb24gKCkge1xuICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKGRvbUNvbnRlbnRMb2FkZWQsIGZuLCBmKVxuICAgIGZsdXNoKClcbiAgfSwgZilcblxuXG4gIGhhY2sgJiYgZG9jLmF0dGFjaEV2ZW50KG9ucmVhZHlzdGF0ZWNoYW5nZSwgZm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKC9eYy8udGVzdChkb2NbcmVhZHlTdGF0ZV0pKSB7XG4gICAgICBkb2MuZGV0YWNoRXZlbnQob25yZWFkeXN0YXRlY2hhbmdlLCBmbilcbiAgICAgIGZsdXNoKClcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIChyZWFkeSA9IGhhY2sgP1xuICAgIGZ1bmN0aW9uIChmbikge1xuICAgICAgc2VsZiAhPSB0b3AgP1xuICAgICAgICBsb2FkZWQgPyBmbigpIDogZm5zLnB1c2goZm4pIDpcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0ZXN0RWwuZG9TY3JvbGwoJ2xlZnQnKVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyByZWFkeShmbikgfSwgNTApXG4gICAgICAgICAgfVxuICAgICAgICAgIGZuKClcbiAgICAgICAgfSgpXG4gICAgfSA6XG4gICAgZnVuY3Rpb24gKGZuKSB7XG4gICAgICBsb2FkZWQgPyBmbigpIDogZm5zLnB1c2goZm4pXG4gICAgfSlcbn0pXG4iLCIvKiEgSlNPTiB2My4zLjIgfCBodHRwOi8vYmVzdGllanMuZ2l0aHViLmlvL2pzb24zIHwgQ29weXJpZ2h0IDIwMTItMjAxNCwgS2l0IENhbWJyaWRnZSB8IGh0dHA6Ly9raXQubWl0LWxpY2Vuc2Uub3JnICovXG47KGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IHRoZSBgZGVmaW5lYCBmdW5jdGlvbiBleHBvc2VkIGJ5IGFzeW5jaHJvbm91cyBtb2R1bGUgbG9hZGVycy4gVGhlXG4gIC8vIHN0cmljdCBgZGVmaW5lYCBjaGVjayBpcyBuZWNlc3NhcnkgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBgci5qc2AuXG4gIHZhciBpc0xvYWRlciA9IHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kO1xuXG4gIC8vIEEgc2V0IG9mIHR5cGVzIHVzZWQgdG8gZGlzdGluZ3Vpc2ggb2JqZWN0cyBmcm9tIHByaW1pdGl2ZXMuXG4gIHZhciBvYmplY3RUeXBlcyA9IHtcbiAgICBcImZ1bmN0aW9uXCI6IHRydWUsXG4gICAgXCJvYmplY3RcIjogdHJ1ZVxuICB9O1xuXG4gIC8vIERldGVjdCB0aGUgYGV4cG9ydHNgIG9iamVjdCBleHBvc2VkIGJ5IENvbW1vbkpTIGltcGxlbWVudGF0aW9ucy5cbiAgdmFyIGZyZWVFeHBvcnRzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGV4cG9ydHNdICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuICAvLyBVc2UgdGhlIGBnbG9iYWxgIG9iamVjdCBleHBvc2VkIGJ5IE5vZGUgKGluY2x1ZGluZyBCcm93c2VyaWZ5IHZpYVxuICAvLyBgaW5zZXJ0LW1vZHVsZS1nbG9iYWxzYCksIE5hcndoYWwsIGFuZCBSaW5nbyBhcyB0aGUgZGVmYXVsdCBjb250ZXh0LFxuICAvLyBhbmQgdGhlIGB3aW5kb3dgIG9iamVjdCBpbiBicm93c2Vycy4gUmhpbm8gZXhwb3J0cyBhIGBnbG9iYWxgIGZ1bmN0aW9uXG4gIC8vIGluc3RlYWQuXG4gIHZhciByb290ID0gb2JqZWN0VHlwZXNbdHlwZW9mIHdpbmRvd10gJiYgd2luZG93IHx8IHRoaXMsXG4gICAgICBmcmVlR2xvYmFsID0gZnJlZUV4cG9ydHMgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIG1vZHVsZV0gJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgdHlwZW9mIGdsb2JhbCA9PSBcIm9iamVjdFwiICYmIGdsb2JhbDtcblxuICBpZiAoZnJlZUdsb2JhbCAmJiAoZnJlZUdsb2JhbFtcImdsb2JhbFwiXSA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsW1wid2luZG93XCJdID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWxbXCJzZWxmXCJdID09PSBmcmVlR2xvYmFsKSkge1xuICAgIHJvb3QgPSBmcmVlR2xvYmFsO1xuICB9XG5cbiAgLy8gUHVibGljOiBJbml0aWFsaXplcyBKU09OIDMgdXNpbmcgdGhlIGdpdmVuIGBjb250ZXh0YCBvYmplY3QsIGF0dGFjaGluZyB0aGVcbiAgLy8gYHN0cmluZ2lmeWAgYW5kIGBwYXJzZWAgZnVuY3Rpb25zIHRvIHRoZSBzcGVjaWZpZWQgYGV4cG9ydHNgIG9iamVjdC5cbiAgZnVuY3Rpb24gcnVuSW5Db250ZXh0KGNvbnRleHQsIGV4cG9ydHMpIHtcbiAgICBjb250ZXh0IHx8IChjb250ZXh0ID0gcm9vdFtcIk9iamVjdFwiXSgpKTtcbiAgICBleHBvcnRzIHx8IChleHBvcnRzID0gcm9vdFtcIk9iamVjdFwiXSgpKTtcblxuICAgIC8vIE5hdGl2ZSBjb25zdHJ1Y3RvciBhbGlhc2VzLlxuICAgIHZhciBOdW1iZXIgPSBjb250ZXh0W1wiTnVtYmVyXCJdIHx8IHJvb3RbXCJOdW1iZXJcIl0sXG4gICAgICAgIFN0cmluZyA9IGNvbnRleHRbXCJTdHJpbmdcIl0gfHwgcm9vdFtcIlN0cmluZ1wiXSxcbiAgICAgICAgT2JqZWN0ID0gY29udGV4dFtcIk9iamVjdFwiXSB8fCByb290W1wiT2JqZWN0XCJdLFxuICAgICAgICBEYXRlID0gY29udGV4dFtcIkRhdGVcIl0gfHwgcm9vdFtcIkRhdGVcIl0sXG4gICAgICAgIFN5bnRheEVycm9yID0gY29udGV4dFtcIlN5bnRheEVycm9yXCJdIHx8IHJvb3RbXCJTeW50YXhFcnJvclwiXSxcbiAgICAgICAgVHlwZUVycm9yID0gY29udGV4dFtcIlR5cGVFcnJvclwiXSB8fCByb290W1wiVHlwZUVycm9yXCJdLFxuICAgICAgICBNYXRoID0gY29udGV4dFtcIk1hdGhcIl0gfHwgcm9vdFtcIk1hdGhcIl0sXG4gICAgICAgIG5hdGl2ZUpTT04gPSBjb250ZXh0W1wiSlNPTlwiXSB8fCByb290W1wiSlNPTlwiXTtcblxuICAgIC8vIERlbGVnYXRlIHRvIHRoZSBuYXRpdmUgYHN0cmluZ2lmeWAgYW5kIGBwYXJzZWAgaW1wbGVtZW50YXRpb25zLlxuICAgIGlmICh0eXBlb2YgbmF0aXZlSlNPTiA9PSBcIm9iamVjdFwiICYmIG5hdGl2ZUpTT04pIHtcbiAgICAgIGV4cG9ydHMuc3RyaW5naWZ5ID0gbmF0aXZlSlNPTi5zdHJpbmdpZnk7XG4gICAgICBleHBvcnRzLnBhcnNlID0gbmF0aXZlSlNPTi5wYXJzZTtcbiAgICB9XG5cbiAgICAvLyBDb252ZW5pZW5jZSBhbGlhc2VzLlxuICAgIHZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGUsXG4gICAgICAgIGdldENsYXNzID0gb2JqZWN0UHJvdG8udG9TdHJpbmcsXG4gICAgICAgIGlzUHJvcGVydHksIGZvckVhY2gsIHVuZGVmO1xuXG4gICAgLy8gVGVzdCB0aGUgYERhdGUjZ2V0VVRDKmAgbWV0aG9kcy4gQmFzZWQgb24gd29yayBieSBAWWFmZmxlLlxuICAgIHZhciBpc0V4dGVuZGVkID0gbmV3IERhdGUoLTM1MDk4MjczMzQ1NzMyOTIpO1xuICAgIHRyeSB7XG4gICAgICAvLyBUaGUgYGdldFVUQ0Z1bGxZZWFyYCwgYE1vbnRoYCwgYW5kIGBEYXRlYCBtZXRob2RzIHJldHVybiBub25zZW5zaWNhbFxuICAgICAgLy8gcmVzdWx0cyBmb3IgY2VydGFpbiBkYXRlcyBpbiBPcGVyYSA+PSAxMC41My5cbiAgICAgIGlzRXh0ZW5kZWQgPSBpc0V4dGVuZGVkLmdldFVUQ0Z1bGxZZWFyKCkgPT0gLTEwOTI1MiAmJiBpc0V4dGVuZGVkLmdldFVUQ01vbnRoKCkgPT09IDAgJiYgaXNFeHRlbmRlZC5nZXRVVENEYXRlKCkgPT09IDEgJiZcbiAgICAgICAgLy8gU2FmYXJpIDwgMi4wLjIgc3RvcmVzIHRoZSBpbnRlcm5hbCBtaWxsaXNlY29uZCB0aW1lIHZhbHVlIGNvcnJlY3RseSxcbiAgICAgICAgLy8gYnV0IGNsaXBzIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGRhdGUgbWV0aG9kcyB0byB0aGUgcmFuZ2Ugb2ZcbiAgICAgICAgLy8gc2lnbmVkIDMyLWJpdCBpbnRlZ2VycyAoWy0yICoqIDMxLCAyICoqIDMxIC0gMV0pLlxuICAgICAgICBpc0V4dGVuZGVkLmdldFVUQ0hvdXJzKCkgPT0gMTAgJiYgaXNFeHRlbmRlZC5nZXRVVENNaW51dGVzKCkgPT0gMzcgJiYgaXNFeHRlbmRlZC5nZXRVVENTZWNvbmRzKCkgPT0gNiAmJiBpc0V4dGVuZGVkLmdldFVUQ01pbGxpc2Vjb25kcygpID09IDcwODtcbiAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG5cbiAgICAvLyBJbnRlcm5hbDogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBuYXRpdmUgYEpTT04uc3RyaW5naWZ5YCBhbmQgYHBhcnNlYFxuICAgIC8vIGltcGxlbWVudGF0aW9ucyBhcmUgc3BlYy1jb21wbGlhbnQuIEJhc2VkIG9uIHdvcmsgYnkgS2VuIFNueWRlci5cbiAgICBmdW5jdGlvbiBoYXMobmFtZSkge1xuICAgICAgaWYgKGhhc1tuYW1lXSAhPT0gdW5kZWYpIHtcbiAgICAgICAgLy8gUmV0dXJuIGNhY2hlZCBmZWF0dXJlIHRlc3QgcmVzdWx0LlxuICAgICAgICByZXR1cm4gaGFzW25hbWVdO1xuICAgICAgfVxuICAgICAgdmFyIGlzU3VwcG9ydGVkO1xuICAgICAgaWYgKG5hbWUgPT0gXCJidWctc3RyaW5nLWNoYXItaW5kZXhcIikge1xuICAgICAgICAvLyBJRSA8PSA3IGRvZXNuJ3Qgc3VwcG9ydCBhY2Nlc3Npbmcgc3RyaW5nIGNoYXJhY3RlcnMgdXNpbmcgc3F1YXJlXG4gICAgICAgIC8vIGJyYWNrZXQgbm90YXRpb24uIElFIDggb25seSBzdXBwb3J0cyB0aGlzIGZvciBwcmltaXRpdmVzLlxuICAgICAgICBpc1N1cHBvcnRlZCA9IFwiYVwiWzBdICE9IFwiYVwiO1xuICAgICAgfSBlbHNlIGlmIChuYW1lID09IFwianNvblwiKSB7XG4gICAgICAgIC8vIEluZGljYXRlcyB3aGV0aGVyIGJvdGggYEpTT04uc3RyaW5naWZ5YCBhbmQgYEpTT04ucGFyc2VgIGFyZVxuICAgICAgICAvLyBzdXBwb3J0ZWQuXG4gICAgICAgIGlzU3VwcG9ydGVkID0gaGFzKFwianNvbi1zdHJpbmdpZnlcIikgJiYgaGFzKFwianNvbi1wYXJzZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB2YWx1ZSwgc2VyaWFsaXplZCA9ICd7XCJhXCI6WzEsdHJ1ZSxmYWxzZSxudWxsLFwiXFxcXHUwMDAwXFxcXGJcXFxcblxcXFxmXFxcXHJcXFxcdFwiXX0nO1xuICAgICAgICAvLyBUZXN0IGBKU09OLnN0cmluZ2lmeWAuXG4gICAgICAgIGlmIChuYW1lID09IFwianNvbi1zdHJpbmdpZnlcIikge1xuICAgICAgICAgIHZhciBzdHJpbmdpZnkgPSBleHBvcnRzLnN0cmluZ2lmeSwgc3RyaW5naWZ5U3VwcG9ydGVkID0gdHlwZW9mIHN0cmluZ2lmeSA9PSBcImZ1bmN0aW9uXCIgJiYgaXNFeHRlbmRlZDtcbiAgICAgICAgICBpZiAoc3RyaW5naWZ5U3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAvLyBBIHRlc3QgZnVuY3Rpb24gb2JqZWN0IHdpdGggYSBjdXN0b20gYHRvSlNPTmAgbWV0aG9kLlxuICAgICAgICAgICAgKHZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH0pLnRvSlNPTiA9IHZhbHVlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgc3RyaW5naWZ5U3VwcG9ydGVkID1cbiAgICAgICAgICAgICAgICAvLyBGaXJlZm94IDMuMWIxIGFuZCBiMiBzZXJpYWxpemUgc3RyaW5nLCBudW1iZXIsIGFuZCBib29sZWFuXG4gICAgICAgICAgICAgICAgLy8gcHJpbWl0aXZlcyBhcyBvYmplY3QgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KDApID09PSBcIjBcIiAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCBiMiwgYW5kIEpTT04gMiBzZXJpYWxpemUgd3JhcHBlZCBwcmltaXRpdmVzIGFzIG9iamVjdFxuICAgICAgICAgICAgICAgIC8vIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgTnVtYmVyKCkpID09PSBcIjBcIiAmJlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgU3RyaW5nKCkpID09ICdcIlwiJyAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCAyIHRocm93IGFuIGVycm9yIGlmIHRoZSB2YWx1ZSBpcyBgbnVsbGAsIGB1bmRlZmluZWRgLCBvclxuICAgICAgICAgICAgICAgIC8vIGRvZXMgbm90IGRlZmluZSBhIGNhbm9uaWNhbCBKU09OIHJlcHJlc2VudGF0aW9uICh0aGlzIGFwcGxpZXMgdG9cbiAgICAgICAgICAgICAgICAvLyBvYmplY3RzIHdpdGggYHRvSlNPTmAgcHJvcGVydGllcyBhcyB3ZWxsLCAqdW5sZXNzKiB0aGV5IGFyZSBuZXN0ZWRcbiAgICAgICAgICAgICAgICAvLyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5KS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoZ2V0Q2xhc3MpID09PSB1bmRlZiAmJlxuICAgICAgICAgICAgICAgIC8vIElFIDggc2VyaWFsaXplcyBgdW5kZWZpbmVkYCBhcyBgXCJ1bmRlZmluZWRcImAuIFNhZmFyaSA8PSA1LjEuNyBhbmRcbiAgICAgICAgICAgICAgICAvLyBGRiAzLjFiMyBwYXNzIHRoaXMgdGVzdC5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkodW5kZWYpID09PSB1bmRlZiAmJlxuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSA8PSA1LjEuNyBhbmQgRkYgMy4xYjMgdGhyb3cgYEVycm9yYHMgYW5kIGBUeXBlRXJyb3JgcyxcbiAgICAgICAgICAgICAgICAvLyByZXNwZWN0aXZlbHksIGlmIHRoZSB2YWx1ZSBpcyBvbWl0dGVkIGVudGlyZWx5LlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeSgpID09PSB1bmRlZiAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCAyIHRocm93IGFuIGVycm9yIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBub3QgYSBudW1iZXIsXG4gICAgICAgICAgICAgICAgLy8gc3RyaW5nLCBhcnJheSwgb2JqZWN0LCBCb29sZWFuLCBvciBgbnVsbGAgbGl0ZXJhbC4gVGhpcyBhcHBsaWVzIHRvXG4gICAgICAgICAgICAgICAgLy8gb2JqZWN0cyB3aXRoIGN1c3RvbSBgdG9KU09OYCBtZXRob2RzIGFzIHdlbGwsIHVubGVzcyB0aGV5IGFyZSBuZXN0ZWRcbiAgICAgICAgICAgICAgICAvLyBpbnNpZGUgb2JqZWN0IG9yIGFycmF5IGxpdGVyYWxzLiBZVUkgMy4wLjBiMSBpZ25vcmVzIGN1c3RvbSBgdG9KU09OYFxuICAgICAgICAgICAgICAgIC8vIG1ldGhvZHMgZW50aXJlbHkuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KHZhbHVlKSA9PT0gXCIxXCIgJiZcbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoW3ZhbHVlXSkgPT0gXCJbMV1cIiAmJlxuICAgICAgICAgICAgICAgIC8vIFByb3RvdHlwZSA8PSAxLjYuMSBzZXJpYWxpemVzIGBbdW5kZWZpbmVkXWAgYXMgYFwiW11cImAgaW5zdGVhZCBvZlxuICAgICAgICAgICAgICAgIC8vIGBcIltudWxsXVwiYC5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoW3VuZGVmXSkgPT0gXCJbbnVsbF1cIiAmJlxuICAgICAgICAgICAgICAgIC8vIFlVSSAzLjAuMGIxIGZhaWxzIHRvIHNlcmlhbGl6ZSBgbnVsbGAgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG51bGwpID09IFwibnVsbFwiICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIDIgaGFsdHMgc2VyaWFsaXphdGlvbiBpZiBhbiBhcnJheSBjb250YWlucyBhIGZ1bmN0aW9uOlxuICAgICAgICAgICAgICAgIC8vIGBbMSwgdHJ1ZSwgZ2V0Q2xhc3MsIDFdYCBzZXJpYWxpemVzIGFzIFwiWzEsdHJ1ZSxdLFwiLiBGRiAzLjFiM1xuICAgICAgICAgICAgICAgIC8vIGVsaWRlcyBub24tSlNPTiB2YWx1ZXMgZnJvbSBvYmplY3RzIGFuZCBhcnJheXMsIHVubGVzcyB0aGV5XG4gICAgICAgICAgICAgICAgLy8gZGVmaW5lIGN1c3RvbSBgdG9KU09OYCBtZXRob2RzLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShbdW5kZWYsIGdldENsYXNzLCBudWxsXSkgPT0gXCJbbnVsbCxudWxsLG51bGxdXCIgJiZcbiAgICAgICAgICAgICAgICAvLyBTaW1wbGUgc2VyaWFsaXphdGlvbiB0ZXN0LiBGRiAzLjFiMSB1c2VzIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlc1xuICAgICAgICAgICAgICAgIC8vIHdoZXJlIGNoYXJhY3RlciBlc2NhcGUgY29kZXMgYXJlIGV4cGVjdGVkIChlLmcuLCBgXFxiYCA9PiBgXFx1MDAwOGApLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeSh7IFwiYVwiOiBbdmFsdWUsIHRydWUsIGZhbHNlLCBudWxsLCBcIlxceDAwXFxiXFxuXFxmXFxyXFx0XCJdIH0pID09IHNlcmlhbGl6ZWQgJiZcbiAgICAgICAgICAgICAgICAvLyBGRiAzLjFiMSBhbmQgYjIgaWdub3JlIHRoZSBgZmlsdGVyYCBhbmQgYHdpZHRoYCBhcmd1bWVudHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG51bGwsIHZhbHVlKSA9PT0gXCIxXCIgJiZcbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoWzEsIDJdLCBudWxsLCAxKSA9PSBcIltcXG4gMSxcXG4gMlxcbl1cIiAmJlxuICAgICAgICAgICAgICAgIC8vIEpTT04gMiwgUHJvdG90eXBlIDw9IDEuNywgYW5kIG9sZGVyIFdlYktpdCBidWlsZHMgaW5jb3JyZWN0bHlcbiAgICAgICAgICAgICAgICAvLyBzZXJpYWxpemUgZXh0ZW5kZWQgeWVhcnMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBEYXRlKC04LjY0ZTE1KSkgPT0gJ1wiLTI3MTgyMS0wNC0yMFQwMDowMDowMC4wMDBaXCInICYmXG4gICAgICAgICAgICAgICAgLy8gVGhlIG1pbGxpc2Vjb25kcyBhcmUgb3B0aW9uYWwgaW4gRVMgNSwgYnV0IHJlcXVpcmVkIGluIDUuMS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoOC42NGUxNSkpID09ICdcIisyNzU3NjAtMDktMTNUMDA6MDA6MDAuMDAwWlwiJyAmJlxuICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggPD0gMTEuMCBpbmNvcnJlY3RseSBzZXJpYWxpemVzIHllYXJzIHByaW9yIHRvIDAgYXMgbmVnYXRpdmVcbiAgICAgICAgICAgICAgICAvLyBmb3VyLWRpZ2l0IHllYXJzIGluc3RlYWQgb2Ygc2l4LWRpZ2l0IHllYXJzLiBDcmVkaXRzOiBAWWFmZmxlLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgRGF0ZSgtNjIxOTg3NTUyZTUpKSA9PSAnXCItMDAwMDAxLTAxLTAxVDAwOjAwOjAwLjAwMFpcIicgJiZcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgPD0gNS4xLjUgYW5kIE9wZXJhID49IDEwLjUzIGluY29ycmVjdGx5IHNlcmlhbGl6ZSBtaWxsaXNlY29uZFxuICAgICAgICAgICAgICAgIC8vIHZhbHVlcyBsZXNzIHRoYW4gMTAwMC4gQ3JlZGl0czogQFlhZmZsZS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoLTEpKSA9PSAnXCIxOTY5LTEyLTMxVDIzOjU5OjU5Ljk5OVpcIic7XG4gICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgc3RyaW5naWZ5U3VwcG9ydGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlzU3VwcG9ydGVkID0gc3RyaW5naWZ5U3VwcG9ydGVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRlc3QgYEpTT04ucGFyc2VgLlxuICAgICAgICBpZiAobmFtZSA9PSBcImpzb24tcGFyc2VcIikge1xuICAgICAgICAgIHZhciBwYXJzZSA9IGV4cG9ydHMucGFyc2U7XG4gICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCBiMiB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhIGJhcmUgbGl0ZXJhbCBpcyBwcm92aWRlZC5cbiAgICAgICAgICAgICAgLy8gQ29uZm9ybWluZyBpbXBsZW1lbnRhdGlvbnMgc2hvdWxkIGFsc28gY29lcmNlIHRoZSBpbml0aWFsIGFyZ3VtZW50IHRvXG4gICAgICAgICAgICAgIC8vIGEgc3RyaW5nIHByaW9yIHRvIHBhcnNpbmcuXG4gICAgICAgICAgICAgIGlmIChwYXJzZShcIjBcIikgPT09IDAgJiYgIXBhcnNlKGZhbHNlKSkge1xuICAgICAgICAgICAgICAgIC8vIFNpbXBsZSBwYXJzaW5nIHRlc3QuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZShzZXJpYWxpemVkKTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyc2VTdXBwb3J0ZWQgPSB2YWx1ZVtcImFcIl0ubGVuZ3RoID09IDUgJiYgdmFsdWVbXCJhXCJdWzBdID09PSAxO1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZVN1cHBvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpIDw9IDUuMS4yIGFuZCBGRiAzLjFiMSBhbGxvdyB1bmVzY2FwZWQgdGFicyBpbiBzdHJpbmdzLlxuICAgICAgICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9ICFwYXJzZSgnXCJcXHRcIicpO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7fVxuICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gRkYgNC4wIGFuZCA0LjAuMSBhbGxvdyBsZWFkaW5nIGArYCBzaWducyBhbmQgbGVhZGluZ1xuICAgICAgICAgICAgICAgICAgICAgIC8vIGRlY2ltYWwgcG9pbnRzLiBGRiA0LjAsIDQuMC4xLCBhbmQgSUUgOS0xMCBhbHNvIGFsbG93XG4gICAgICAgICAgICAgICAgICAgICAgLy8gY2VydGFpbiBvY3RhbCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9IHBhcnNlKFwiMDFcIikgIT09IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmIChwYXJzZVN1cHBvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEZGIDQuMCwgNC4wLjEsIGFuZCBSaGlubyAxLjdSMy1SNCBhbGxvdyB0cmFpbGluZyBkZWNpbWFsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gcG9pbnRzLiBUaGVzZSBlbnZpcm9ubWVudHMsIGFsb25nIHdpdGggRkYgMy4xYjEgYW5kIDIsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gYWxzbyBhbGxvdyB0cmFpbGluZyBjb21tYXMgaW4gSlNPTiBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VTdXBwb3J0ZWQgPSBwYXJzZShcIjEuXCIpICE9PSAxO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgcGFyc2VTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaXNTdXBwb3J0ZWQgPSBwYXJzZVN1cHBvcnRlZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGhhc1tuYW1lXSA9ICEhaXNTdXBwb3J0ZWQ7XG4gICAgfVxuXG4gICAgaWYgKCFoYXMoXCJqc29uXCIpKSB7XG4gICAgICAvLyBDb21tb24gYFtbQ2xhc3NdXWAgbmFtZSBhbGlhc2VzLlxuICAgICAgdmFyIGZ1bmN0aW9uQ2xhc3MgPSBcIltvYmplY3QgRnVuY3Rpb25dXCIsXG4gICAgICAgICAgZGF0ZUNsYXNzID0gXCJbb2JqZWN0IERhdGVdXCIsXG4gICAgICAgICAgbnVtYmVyQ2xhc3MgPSBcIltvYmplY3QgTnVtYmVyXVwiLFxuICAgICAgICAgIHN0cmluZ0NsYXNzID0gXCJbb2JqZWN0IFN0cmluZ11cIixcbiAgICAgICAgICBhcnJheUNsYXNzID0gXCJbb2JqZWN0IEFycmF5XVwiLFxuICAgICAgICAgIGJvb2xlYW5DbGFzcyA9IFwiW29iamVjdCBCb29sZWFuXVwiO1xuXG4gICAgICAvLyBEZXRlY3QgaW5jb21wbGV0ZSBzdXBwb3J0IGZvciBhY2Nlc3Npbmcgc3RyaW5nIGNoYXJhY3RlcnMgYnkgaW5kZXguXG4gICAgICB2YXIgY2hhckluZGV4QnVnZ3kgPSBoYXMoXCJidWctc3RyaW5nLWNoYXItaW5kZXhcIik7XG5cbiAgICAgIC8vIERlZmluZSBhZGRpdGlvbmFsIHV0aWxpdHkgbWV0aG9kcyBpZiB0aGUgYERhdGVgIG1ldGhvZHMgYXJlIGJ1Z2d5LlxuICAgICAgaWYgKCFpc0V4dGVuZGVkKSB7XG4gICAgICAgIHZhciBmbG9vciA9IE1hdGguZmxvb3I7XG4gICAgICAgIC8vIEEgbWFwcGluZyBiZXR3ZWVuIHRoZSBtb250aHMgb2YgdGhlIHllYXIgYW5kIHRoZSBudW1iZXIgb2YgZGF5cyBiZXR3ZWVuXG4gICAgICAgIC8vIEphbnVhcnkgMXN0IGFuZCB0aGUgZmlyc3Qgb2YgdGhlIHJlc3BlY3RpdmUgbW9udGguXG4gICAgICAgIHZhciBNb250aHMgPSBbMCwgMzEsIDU5LCA5MCwgMTIwLCAxNTEsIDE4MSwgMjEyLCAyNDMsIDI3MywgMzA0LCAzMzRdO1xuICAgICAgICAvLyBJbnRlcm5hbDogQ2FsY3VsYXRlcyB0aGUgbnVtYmVyIG9mIGRheXMgYmV0d2VlbiB0aGUgVW5peCBlcG9jaCBhbmQgdGhlXG4gICAgICAgIC8vIGZpcnN0IGRheSBvZiB0aGUgZ2l2ZW4gbW9udGguXG4gICAgICAgIHZhciBnZXREYXkgPSBmdW5jdGlvbiAoeWVhciwgbW9udGgpIHtcbiAgICAgICAgICByZXR1cm4gTW9udGhzW21vbnRoXSArIDM2NSAqICh5ZWFyIC0gMTk3MCkgKyBmbG9vcigoeWVhciAtIDE5NjkgKyAobW9udGggPSArKG1vbnRoID4gMSkpKSAvIDQpIC0gZmxvb3IoKHllYXIgLSAxOTAxICsgbW9udGgpIC8gMTAwKSArIGZsb29yKCh5ZWFyIC0gMTYwMSArIG1vbnRoKSAvIDQwMCk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEludGVybmFsOiBEZXRlcm1pbmVzIGlmIGEgcHJvcGVydHkgaXMgYSBkaXJlY3QgcHJvcGVydHkgb2YgdGhlIGdpdmVuXG4gICAgICAvLyBvYmplY3QuIERlbGVnYXRlcyB0byB0aGUgbmF0aXZlIGBPYmplY3QjaGFzT3duUHJvcGVydHlgIG1ldGhvZC5cbiAgICAgIGlmICghKGlzUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eSkpIHtcbiAgICAgICAgaXNQcm9wZXJ0eSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgIHZhciBtZW1iZXJzID0ge30sIGNvbnN0cnVjdG9yO1xuICAgICAgICAgIGlmICgobWVtYmVycy5fX3Byb3RvX18gPSBudWxsLCBtZW1iZXJzLl9fcHJvdG9fXyA9IHtcbiAgICAgICAgICAgIC8vIFRoZSAqcHJvdG8qIHByb3BlcnR5IGNhbm5vdCBiZSBzZXQgbXVsdGlwbGUgdGltZXMgaW4gcmVjZW50XG4gICAgICAgICAgICAvLyB2ZXJzaW9ucyBvZiBGaXJlZm94IGFuZCBTZWFNb25rZXkuXG4gICAgICAgICAgICBcInRvU3RyaW5nXCI6IDFcbiAgICAgICAgICB9LCBtZW1iZXJzKS50b1N0cmluZyAhPSBnZXRDbGFzcykge1xuICAgICAgICAgICAgLy8gU2FmYXJpIDw9IDIuMC4zIGRvZXNuJ3QgaW1wbGVtZW50IGBPYmplY3QjaGFzT3duUHJvcGVydHlgLCBidXRcbiAgICAgICAgICAgIC8vIHN1cHBvcnRzIHRoZSBtdXRhYmxlICpwcm90byogcHJvcGVydHkuXG4gICAgICAgICAgICBpc1Byb3BlcnR5ID0gZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgIC8vIENhcHR1cmUgYW5kIGJyZWFrIHRoZSBvYmplY3QncyBwcm90b3R5cGUgY2hhaW4gKHNlZSBzZWN0aW9uIDguNi4yXG4gICAgICAgICAgICAgIC8vIG9mIHRoZSBFUyA1LjEgc3BlYykuIFRoZSBwYXJlbnRoZXNpemVkIGV4cHJlc3Npb24gcHJldmVudHMgYW5cbiAgICAgICAgICAgICAgLy8gdW5zYWZlIHRyYW5zZm9ybWF0aW9uIGJ5IHRoZSBDbG9zdXJlIENvbXBpbGVyLlxuICAgICAgICAgICAgICB2YXIgb3JpZ2luYWwgPSB0aGlzLl9fcHJvdG9fXywgcmVzdWx0ID0gcHJvcGVydHkgaW4gKHRoaXMuX19wcm90b19fID0gbnVsbCwgdGhpcyk7XG4gICAgICAgICAgICAgIC8vIFJlc3RvcmUgdGhlIG9yaWdpbmFsIHByb3RvdHlwZSBjaGFpbi5cbiAgICAgICAgICAgICAgdGhpcy5fX3Byb3RvX18gPSBvcmlnaW5hbDtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENhcHR1cmUgYSByZWZlcmVuY2UgdG8gdGhlIHRvcC1sZXZlbCBgT2JqZWN0YCBjb25zdHJ1Y3Rvci5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gbWVtYmVycy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgIC8vIFVzZSB0aGUgYGNvbnN0cnVjdG9yYCBwcm9wZXJ0eSB0byBzaW11bGF0ZSBgT2JqZWN0I2hhc093blByb3BlcnR5YCBpblxuICAgICAgICAgICAgLy8gb3RoZXIgZW52aXJvbm1lbnRzLlxuICAgICAgICAgICAgaXNQcm9wZXJ0eSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gKHRoaXMuY29uc3RydWN0b3IgfHwgY29uc3RydWN0b3IpLnByb3RvdHlwZTtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5IGluIHRoaXMgJiYgIShwcm9wZXJ0eSBpbiBwYXJlbnQgJiYgdGhpc1twcm9wZXJ0eV0gPT09IHBhcmVudFtwcm9wZXJ0eV0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbWVtYmVycyA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuIGlzUHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eSk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEludGVybmFsOiBOb3JtYWxpemVzIHRoZSBgZm9yLi4uaW5gIGl0ZXJhdGlvbiBhbGdvcml0aG0gYWNyb3NzXG4gICAgICAvLyBlbnZpcm9ubWVudHMuIEVhY2ggZW51bWVyYXRlZCBrZXkgaXMgeWllbGRlZCB0byBhIGBjYWxsYmFja2AgZnVuY3Rpb24uXG4gICAgICBmb3JFYWNoID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNpemUgPSAwLCBQcm9wZXJ0aWVzLCBtZW1iZXJzLCBwcm9wZXJ0eTtcblxuICAgICAgICAvLyBUZXN0cyBmb3IgYnVncyBpbiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCdzIGBmb3IuLi5pbmAgYWxnb3JpdGhtLiBUaGVcbiAgICAgICAgLy8gYHZhbHVlT2ZgIHByb3BlcnR5IGluaGVyaXRzIHRoZSBub24tZW51bWVyYWJsZSBmbGFnIGZyb21cbiAgICAgICAgLy8gYE9iamVjdC5wcm90b3R5cGVgIGluIG9sZGVyIHZlcnNpb25zIG9mIElFLCBOZXRzY2FwZSwgYW5kIE1vemlsbGEuXG4gICAgICAgIChQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMudmFsdWVPZiA9IDA7XG4gICAgICAgIH0pLnByb3RvdHlwZS52YWx1ZU9mID0gMDtcblxuICAgICAgICAvLyBJdGVyYXRlIG92ZXIgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGBQcm9wZXJ0aWVzYCBjbGFzcy5cbiAgICAgICAgbWVtYmVycyA9IG5ldyBQcm9wZXJ0aWVzKCk7XG4gICAgICAgIGZvciAocHJvcGVydHkgaW4gbWVtYmVycykge1xuICAgICAgICAgIC8vIElnbm9yZSBhbGwgcHJvcGVydGllcyBpbmhlcml0ZWQgZnJvbSBgT2JqZWN0LnByb3RvdHlwZWAuXG4gICAgICAgICAgaWYgKGlzUHJvcGVydHkuY2FsbChtZW1iZXJzLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgIHNpemUrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgUHJvcGVydGllcyA9IG1lbWJlcnMgPSBudWxsO1xuXG4gICAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgaXRlcmF0aW9uIGFsZ29yaXRobS5cbiAgICAgICAgaWYgKCFzaXplKSB7XG4gICAgICAgICAgLy8gQSBsaXN0IG9mIG5vbi1lbnVtZXJhYmxlIHByb3BlcnRpZXMgaW5oZXJpdGVkIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLlxuICAgICAgICAgIG1lbWJlcnMgPSBbXCJ2YWx1ZU9mXCIsIFwidG9TdHJpbmdcIiwgXCJ0b0xvY2FsZVN0cmluZ1wiLCBcInByb3BlcnR5SXNFbnVtZXJhYmxlXCIsIFwiaXNQcm90b3R5cGVPZlwiLCBcImhhc093blByb3BlcnR5XCIsIFwiY29uc3RydWN0b3JcIl07XG4gICAgICAgICAgLy8gSUUgPD0gOCwgTW96aWxsYSAxLjAsIGFuZCBOZXRzY2FwZSA2LjIgaWdub3JlIHNoYWRvd2VkIG5vbi1lbnVtZXJhYmxlXG4gICAgICAgICAgLy8gcHJvcGVydGllcy5cbiAgICAgICAgICBmb3JFYWNoID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBpc0Z1bmN0aW9uID0gZ2V0Q2xhc3MuY2FsbChvYmplY3QpID09IGZ1bmN0aW9uQ2xhc3MsIHByb3BlcnR5LCBsZW5ndGg7XG4gICAgICAgICAgICB2YXIgaGFzUHJvcGVydHkgPSAhaXNGdW5jdGlvbiAmJiB0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yICE9IFwiZnVuY3Rpb25cIiAmJiBvYmplY3RUeXBlc1t0eXBlb2Ygb2JqZWN0Lmhhc093blByb3BlcnR5XSAmJiBvYmplY3QuaGFzT3duUHJvcGVydHkgfHwgaXNQcm9wZXJ0eTtcbiAgICAgICAgICAgIGZvciAocHJvcGVydHkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgIC8vIEdlY2tvIDw9IDEuMCBlbnVtZXJhdGVzIHRoZSBgcHJvdG90eXBlYCBwcm9wZXJ0eSBvZiBmdW5jdGlvbnMgdW5kZXJcbiAgICAgICAgICAgICAgLy8gY2VydGFpbiBjb25kaXRpb25zOyBJRSBkb2VzIG5vdC5cbiAgICAgICAgICAgICAgaWYgKCEoaXNGdW5jdGlvbiAmJiBwcm9wZXJ0eSA9PSBcInByb3RvdHlwZVwiKSAmJiBoYXNQcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socHJvcGVydHkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBNYW51YWxseSBpbnZva2UgdGhlIGNhbGxiYWNrIGZvciBlYWNoIG5vbi1lbnVtZXJhYmxlIHByb3BlcnR5LlxuICAgICAgICAgICAgZm9yIChsZW5ndGggPSBtZW1iZXJzLmxlbmd0aDsgcHJvcGVydHkgPSBtZW1iZXJzWy0tbGVuZ3RoXTsgaGFzUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSAmJiBjYWxsYmFjayhwcm9wZXJ0eSkpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoc2l6ZSA9PSAyKSB7XG4gICAgICAgICAgLy8gU2FmYXJpIDw9IDIuMC40IGVudW1lcmF0ZXMgc2hhZG93ZWQgcHJvcGVydGllcyB0d2ljZS5cbiAgICAgICAgICBmb3JFYWNoID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIHNldCBvZiBpdGVyYXRlZCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICAgdmFyIG1lbWJlcnMgPSB7fSwgaXNGdW5jdGlvbiA9IGdldENsYXNzLmNhbGwob2JqZWN0KSA9PSBmdW5jdGlvbkNsYXNzLCBwcm9wZXJ0eTtcbiAgICAgICAgICAgIGZvciAocHJvcGVydHkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgIC8vIFN0b3JlIGVhY2ggcHJvcGVydHkgbmFtZSB0byBwcmV2ZW50IGRvdWJsZSBlbnVtZXJhdGlvbi4gVGhlXG4gICAgICAgICAgICAgIC8vIGBwcm90b3R5cGVgIHByb3BlcnR5IG9mIGZ1bmN0aW9ucyBpcyBub3QgZW51bWVyYXRlZCBkdWUgdG8gY3Jvc3MtXG4gICAgICAgICAgICAgIC8vIGVudmlyb25tZW50IGluY29uc2lzdGVuY2llcy5cbiAgICAgICAgICAgICAgaWYgKCEoaXNGdW5jdGlvbiAmJiBwcm9wZXJ0eSA9PSBcInByb3RvdHlwZVwiKSAmJiAhaXNQcm9wZXJ0eS5jYWxsKG1lbWJlcnMsIHByb3BlcnR5KSAmJiAobWVtYmVyc1twcm9wZXJ0eV0gPSAxKSAmJiBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhwcm9wZXJ0eSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5vIGJ1Z3MgZGV0ZWN0ZWQ7IHVzZSB0aGUgc3RhbmRhcmQgYGZvci4uLmluYCBhbGdvcml0aG0uXG4gICAgICAgICAgZm9yRWFjaCA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgaXNGdW5jdGlvbiA9IGdldENsYXNzLmNhbGwob2JqZWN0KSA9PSBmdW5jdGlvbkNsYXNzLCBwcm9wZXJ0eSwgaXNDb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgIGZvciAocHJvcGVydHkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgIGlmICghKGlzRnVuY3Rpb24gJiYgcHJvcGVydHkgPT0gXCJwcm90b3R5cGVcIikgJiYgaXNQcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpICYmICEoaXNDb25zdHJ1Y3RvciA9IHByb3BlcnR5ID09PSBcImNvbnN0cnVjdG9yXCIpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socHJvcGVydHkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBNYW51YWxseSBpbnZva2UgdGhlIGNhbGxiYWNrIGZvciB0aGUgYGNvbnN0cnVjdG9yYCBwcm9wZXJ0eSBkdWUgdG9cbiAgICAgICAgICAgIC8vIGNyb3NzLWVudmlyb25tZW50IGluY29uc2lzdGVuY2llcy5cbiAgICAgICAgICAgIGlmIChpc0NvbnN0cnVjdG9yIHx8IGlzUHJvcGVydHkuY2FsbChvYmplY3QsIChwcm9wZXJ0eSA9IFwiY29uc3RydWN0b3JcIikpKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKHByb3BlcnR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3JFYWNoKG9iamVjdCwgY2FsbGJhY2spO1xuICAgICAgfTtcblxuICAgICAgLy8gUHVibGljOiBTZXJpYWxpemVzIGEgSmF2YVNjcmlwdCBgdmFsdWVgIGFzIGEgSlNPTiBzdHJpbmcuIFRoZSBvcHRpb25hbFxuICAgICAgLy8gYGZpbHRlcmAgYXJndW1lbnQgbWF5IHNwZWNpZnkgZWl0aGVyIGEgZnVuY3Rpb24gdGhhdCBhbHRlcnMgaG93IG9iamVjdCBhbmRcbiAgICAgIC8vIGFycmF5IG1lbWJlcnMgYXJlIHNlcmlhbGl6ZWQsIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MgYW5kIG51bWJlcnMgdGhhdFxuICAgICAgLy8gaW5kaWNhdGVzIHdoaWNoIHByb3BlcnRpZXMgc2hvdWxkIGJlIHNlcmlhbGl6ZWQuIFRoZSBvcHRpb25hbCBgd2lkdGhgXG4gICAgICAvLyBhcmd1bWVudCBtYXkgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIG51bWJlciB0aGF0IHNwZWNpZmllcyB0aGUgaW5kZW50YXRpb25cbiAgICAgIC8vIGxldmVsIG9mIHRoZSBvdXRwdXQuXG4gICAgICBpZiAoIWhhcyhcImpzb24tc3RyaW5naWZ5XCIpKSB7XG4gICAgICAgIC8vIEludGVybmFsOiBBIG1hcCBvZiBjb250cm9sIGNoYXJhY3RlcnMgYW5kIHRoZWlyIGVzY2FwZWQgZXF1aXZhbGVudHMuXG4gICAgICAgIHZhciBFc2NhcGVzID0ge1xuICAgICAgICAgIDkyOiBcIlxcXFxcXFxcXCIsXG4gICAgICAgICAgMzQ6ICdcXFxcXCInLFxuICAgICAgICAgIDg6IFwiXFxcXGJcIixcbiAgICAgICAgICAxMjogXCJcXFxcZlwiLFxuICAgICAgICAgIDEwOiBcIlxcXFxuXCIsXG4gICAgICAgICAgMTM6IFwiXFxcXHJcIixcbiAgICAgICAgICA5OiBcIlxcXFx0XCJcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogQ29udmVydHMgYHZhbHVlYCBpbnRvIGEgemVyby1wYWRkZWQgc3RyaW5nIHN1Y2ggdGhhdCBpdHNcbiAgICAgICAgLy8gbGVuZ3RoIGlzIGF0IGxlYXN0IGVxdWFsIHRvIGB3aWR0aGAuIFRoZSBgd2lkdGhgIG11c3QgYmUgPD0gNi5cbiAgICAgICAgdmFyIGxlYWRpbmdaZXJvZXMgPSBcIjAwMDAwMFwiO1xuICAgICAgICB2YXIgdG9QYWRkZWRTdHJpbmcgPSBmdW5jdGlvbiAod2lkdGgsIHZhbHVlKSB7XG4gICAgICAgICAgLy8gVGhlIGB8fCAwYCBleHByZXNzaW9uIGlzIG5lY2Vzc2FyeSB0byB3b3JrIGFyb3VuZCBhIGJ1ZyBpblxuICAgICAgICAgIC8vIE9wZXJhIDw9IDcuNTR1MiB3aGVyZSBgMCA9PSAtMGAsIGJ1dCBgU3RyaW5nKC0wKSAhPT0gXCIwXCJgLlxuICAgICAgICAgIHJldHVybiAobGVhZGluZ1plcm9lcyArICh2YWx1ZSB8fCAwKSkuc2xpY2UoLXdpZHRoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogRG91YmxlLXF1b3RlcyBhIHN0cmluZyBgdmFsdWVgLCByZXBsYWNpbmcgYWxsIEFTQ0lJIGNvbnRyb2xcbiAgICAgICAgLy8gY2hhcmFjdGVycyAoY2hhcmFjdGVycyB3aXRoIGNvZGUgdW5pdCB2YWx1ZXMgYmV0d2VlbiAwIGFuZCAzMSkgd2l0aFxuICAgICAgICAvLyB0aGVpciBlc2NhcGVkIGVxdWl2YWxlbnRzLiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIHRoZVxuICAgICAgICAvLyBgUXVvdGUodmFsdWUpYCBvcGVyYXRpb24gZGVmaW5lZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLlxuICAgICAgICB2YXIgdW5pY29kZVByZWZpeCA9IFwiXFxcXHUwMFwiO1xuICAgICAgICB2YXIgcXVvdGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gJ1wiJywgaW5kZXggPSAwLCBsZW5ndGggPSB2YWx1ZS5sZW5ndGgsIHVzZUNoYXJJbmRleCA9ICFjaGFySW5kZXhCdWdneSB8fCBsZW5ndGggPiAxMDtcbiAgICAgICAgICB2YXIgc3ltYm9scyA9IHVzZUNoYXJJbmRleCAmJiAoY2hhckluZGV4QnVnZ3kgPyB2YWx1ZS5zcGxpdChcIlwiKSA6IHZhbHVlKTtcbiAgICAgICAgICBmb3IgKDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjaGFyQ29kZSA9IHZhbHVlLmNoYXJDb2RlQXQoaW5kZXgpO1xuICAgICAgICAgICAgLy8gSWYgdGhlIGNoYXJhY3RlciBpcyBhIGNvbnRyb2wgY2hhcmFjdGVyLCBhcHBlbmQgaXRzIFVuaWNvZGUgb3JcbiAgICAgICAgICAgIC8vIHNob3J0aGFuZCBlc2NhcGUgc2VxdWVuY2U7IG90aGVyd2lzZSwgYXBwZW5kIHRoZSBjaGFyYWN0ZXIgYXMtaXMuXG4gICAgICAgICAgICBzd2l0Y2ggKGNoYXJDb2RlKSB7XG4gICAgICAgICAgICAgIGNhc2UgODogY2FzZSA5OiBjYXNlIDEwOiBjYXNlIDEyOiBjYXNlIDEzOiBjYXNlIDM0OiBjYXNlIDkyOlxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBFc2NhcGVzW2NoYXJDb2RlXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPCAzMikge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IHVuaWNvZGVQcmVmaXggKyB0b1BhZGRlZFN0cmluZygyLCBjaGFyQ29kZS50b1N0cmluZygxNikpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSB1c2VDaGFySW5kZXggPyBzeW1ib2xzW2luZGV4XSA6IHZhbHVlLmNoYXJBdChpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQgKyAnXCInO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBSZWN1cnNpdmVseSBzZXJpYWxpemVzIGFuIG9iamVjdC4gSW1wbGVtZW50cyB0aGVcbiAgICAgICAgLy8gYFN0cihrZXksIGhvbGRlcilgLCBgSk8odmFsdWUpYCwgYW5kIGBKQSh2YWx1ZSlgIG9wZXJhdGlvbnMuXG4gICAgICAgIHZhciBzZXJpYWxpemUgPSBmdW5jdGlvbiAocHJvcGVydHksIG9iamVjdCwgY2FsbGJhY2ssIHByb3BlcnRpZXMsIHdoaXRlc3BhY2UsIGluZGVudGF0aW9uLCBzdGFjaykge1xuICAgICAgICAgIHZhciB2YWx1ZSwgY2xhc3NOYW1lLCB5ZWFyLCBtb250aCwgZGF0ZSwgdGltZSwgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc2Vjb25kcywgcmVzdWx0cywgZWxlbWVudCwgaW5kZXgsIGxlbmd0aCwgcHJlZml4LCByZXN1bHQ7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIE5lY2Vzc2FyeSBmb3IgaG9zdCBvYmplY3Qgc3VwcG9ydC5cbiAgICAgICAgICAgIHZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTtcbiAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcIm9iamVjdFwiICYmIHZhbHVlKSB7XG4gICAgICAgICAgICBjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUgPT0gZGF0ZUNsYXNzICYmICFpc1Byb3BlcnR5LmNhbGwodmFsdWUsIFwidG9KU09OXCIpKSB7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSA+IC0xIC8gMCAmJiB2YWx1ZSA8IDEgLyAwKSB7XG4gICAgICAgICAgICAgICAgLy8gRGF0ZXMgYXJlIHNlcmlhbGl6ZWQgYWNjb3JkaW5nIHRvIHRoZSBgRGF0ZSN0b0pTT05gIG1ldGhvZFxuICAgICAgICAgICAgICAgIC8vIHNwZWNpZmllZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS45LjUuNDQuIFNlZSBzZWN0aW9uIDE1LjkuMS4xNVxuICAgICAgICAgICAgICAgIC8vIGZvciB0aGUgSVNPIDg2MDEgZGF0ZSB0aW1lIHN0cmluZyBmb3JtYXQuXG4gICAgICAgICAgICAgICAgaWYgKGdldERheSkge1xuICAgICAgICAgICAgICAgICAgLy8gTWFudWFsbHkgY29tcHV0ZSB0aGUgeWVhciwgbW9udGgsIGRhdGUsIGhvdXJzLCBtaW51dGVzLFxuICAgICAgICAgICAgICAgICAgLy8gc2Vjb25kcywgYW5kIG1pbGxpc2Vjb25kcyBpZiB0aGUgYGdldFVUQypgIG1ldGhvZHMgYXJlXG4gICAgICAgICAgICAgICAgICAvLyBidWdneS4gQWRhcHRlZCBmcm9tIEBZYWZmbGUncyBgZGF0ZS1zaGltYCBwcm9qZWN0LlxuICAgICAgICAgICAgICAgICAgZGF0ZSA9IGZsb29yKHZhbHVlIC8gODY0ZTUpO1xuICAgICAgICAgICAgICAgICAgZm9yICh5ZWFyID0gZmxvb3IoZGF0ZSAvIDM2NS4yNDI1KSArIDE5NzAgLSAxOyBnZXREYXkoeWVhciArIDEsIDApIDw9IGRhdGU7IHllYXIrKyk7XG4gICAgICAgICAgICAgICAgICBmb3IgKG1vbnRoID0gZmxvb3IoKGRhdGUgLSBnZXREYXkoeWVhciwgMCkpIC8gMzAuNDIpOyBnZXREYXkoeWVhciwgbW9udGggKyAxKSA8PSBkYXRlOyBtb250aCsrKTtcbiAgICAgICAgICAgICAgICAgIGRhdGUgPSAxICsgZGF0ZSAtIGdldERheSh5ZWFyLCBtb250aCk7XG4gICAgICAgICAgICAgICAgICAvLyBUaGUgYHRpbWVgIHZhbHVlIHNwZWNpZmllcyB0aGUgdGltZSB3aXRoaW4gdGhlIGRheSAoc2VlIEVTXG4gICAgICAgICAgICAgICAgICAvLyA1LjEgc2VjdGlvbiAxNS45LjEuMikuIFRoZSBmb3JtdWxhIGAoQSAlIEIgKyBCKSAlIEJgIGlzIHVzZWRcbiAgICAgICAgICAgICAgICAgIC8vIHRvIGNvbXB1dGUgYEEgbW9kdWxvIEJgLCBhcyB0aGUgYCVgIG9wZXJhdG9yIGRvZXMgbm90XG4gICAgICAgICAgICAgICAgICAvLyBjb3JyZXNwb25kIHRvIHRoZSBgbW9kdWxvYCBvcGVyYXRpb24gZm9yIG5lZ2F0aXZlIG51bWJlcnMuXG4gICAgICAgICAgICAgICAgICB0aW1lID0gKHZhbHVlICUgODY0ZTUgKyA4NjRlNSkgJSA4NjRlNTtcbiAgICAgICAgICAgICAgICAgIC8vIFRoZSBob3VycywgbWludXRlcywgc2Vjb25kcywgYW5kIG1pbGxpc2Vjb25kcyBhcmUgb2J0YWluZWQgYnlcbiAgICAgICAgICAgICAgICAgIC8vIGRlY29tcG9zaW5nIHRoZSB0aW1lIHdpdGhpbiB0aGUgZGF5LiBTZWUgc2VjdGlvbiAxNS45LjEuMTAuXG4gICAgICAgICAgICAgICAgICBob3VycyA9IGZsb29yKHRpbWUgLyAzNmU1KSAlIDI0O1xuICAgICAgICAgICAgICAgICAgbWludXRlcyA9IGZsb29yKHRpbWUgLyA2ZTQpICUgNjA7XG4gICAgICAgICAgICAgICAgICBzZWNvbmRzID0gZmxvb3IodGltZSAvIDFlMykgJSA2MDtcbiAgICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kcyA9IHRpbWUgJSAxZTM7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHllYXIgPSB2YWx1ZS5nZXRVVENGdWxsWWVhcigpO1xuICAgICAgICAgICAgICAgICAgbW9udGggPSB2YWx1ZS5nZXRVVENNb250aCgpO1xuICAgICAgICAgICAgICAgICAgZGF0ZSA9IHZhbHVlLmdldFVUQ0RhdGUoKTtcbiAgICAgICAgICAgICAgICAgIGhvdXJzID0gdmFsdWUuZ2V0VVRDSG91cnMoKTtcbiAgICAgICAgICAgICAgICAgIG1pbnV0ZXMgPSB2YWx1ZS5nZXRVVENNaW51dGVzKCk7XG4gICAgICAgICAgICAgICAgICBzZWNvbmRzID0gdmFsdWUuZ2V0VVRDU2Vjb25kcygpO1xuICAgICAgICAgICAgICAgICAgbWlsbGlzZWNvbmRzID0gdmFsdWUuZ2V0VVRDTWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFNlcmlhbGl6ZSBleHRlbmRlZCB5ZWFycyBjb3JyZWN0bHkuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAoeWVhciA8PSAwIHx8IHllYXIgPj0gMWU0ID8gKHllYXIgPCAwID8gXCItXCIgOiBcIitcIikgKyB0b1BhZGRlZFN0cmluZyg2LCB5ZWFyIDwgMCA/IC15ZWFyIDogeWVhcikgOiB0b1BhZGRlZFN0cmluZyg0LCB5ZWFyKSkgK1xuICAgICAgICAgICAgICAgICAgXCItXCIgKyB0b1BhZGRlZFN0cmluZygyLCBtb250aCArIDEpICsgXCItXCIgKyB0b1BhZGRlZFN0cmluZygyLCBkYXRlKSArXG4gICAgICAgICAgICAgICAgICAvLyBNb250aHMsIGRhdGVzLCBob3VycywgbWludXRlcywgYW5kIHNlY29uZHMgc2hvdWxkIGhhdmUgdHdvXG4gICAgICAgICAgICAgICAgICAvLyBkaWdpdHM7IG1pbGxpc2Vjb25kcyBzaG91bGQgaGF2ZSB0aHJlZS5cbiAgICAgICAgICAgICAgICAgIFwiVFwiICsgdG9QYWRkZWRTdHJpbmcoMiwgaG91cnMpICsgXCI6XCIgKyB0b1BhZGRlZFN0cmluZygyLCBtaW51dGVzKSArIFwiOlwiICsgdG9QYWRkZWRTdHJpbmcoMiwgc2Vjb25kcykgK1xuICAgICAgICAgICAgICAgICAgLy8gTWlsbGlzZWNvbmRzIGFyZSBvcHRpb25hbCBpbiBFUyA1LjAsIGJ1dCByZXF1aXJlZCBpbiA1LjEuXG4gICAgICAgICAgICAgICAgICBcIi5cIiArIHRvUGFkZGVkU3RyaW5nKDMsIG1pbGxpc2Vjb25kcykgKyBcIlpcIjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlLnRvSlNPTiA9PSBcImZ1bmN0aW9uXCIgJiYgKChjbGFzc05hbWUgIT0gbnVtYmVyQ2xhc3MgJiYgY2xhc3NOYW1lICE9IHN0cmluZ0NsYXNzICYmIGNsYXNzTmFtZSAhPSBhcnJheUNsYXNzKSB8fCBpc1Byb3BlcnR5LmNhbGwodmFsdWUsIFwidG9KU09OXCIpKSkge1xuICAgICAgICAgICAgICAvLyBQcm90b3R5cGUgPD0gMS42LjEgYWRkcyBub24tc3RhbmRhcmQgYHRvSlNPTmAgbWV0aG9kcyB0byB0aGVcbiAgICAgICAgICAgICAgLy8gYE51bWJlcmAsIGBTdHJpbmdgLCBgRGF0ZWAsIGFuZCBgQXJyYXlgIHByb3RvdHlwZXMuIEpTT04gM1xuICAgICAgICAgICAgICAvLyBpZ25vcmVzIGFsbCBgdG9KU09OYCBtZXRob2RzIG9uIHRoZXNlIG9iamVjdHMgdW5sZXNzIHRoZXkgYXJlXG4gICAgICAgICAgICAgIC8vIGRlZmluZWQgZGlyZWN0bHkgb24gYW4gaW5zdGFuY2UuXG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9KU09OKHByb3BlcnR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHJlcGxhY2VtZW50IGZ1bmN0aW9uIHdhcyBwcm92aWRlZCwgY2FsbCBpdCB0byBvYnRhaW4gdGhlIHZhbHVlXG4gICAgICAgICAgICAvLyBmb3Igc2VyaWFsaXphdGlvbi5cbiAgICAgICAgICAgIHZhbHVlID0gY2FsbGJhY2suY2FsbChvYmplY3QsIHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFwibnVsbFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHZhbHVlKTtcbiAgICAgICAgICBpZiAoY2xhc3NOYW1lID09IGJvb2xlYW5DbGFzcykge1xuICAgICAgICAgICAgLy8gQm9vbGVhbnMgYXJlIHJlcHJlc2VudGVkIGxpdGVyYWxseS5cbiAgICAgICAgICAgIHJldHVybiBcIlwiICsgdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUgPT0gbnVtYmVyQ2xhc3MpIHtcbiAgICAgICAgICAgIC8vIEpTT04gbnVtYmVycyBtdXN0IGJlIGZpbml0ZS4gYEluZmluaXR5YCBhbmQgYE5hTmAgYXJlIHNlcmlhbGl6ZWQgYXNcbiAgICAgICAgICAgIC8vIGBcIm51bGxcImAuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPiAtMSAvIDAgJiYgdmFsdWUgPCAxIC8gMCA/IFwiXCIgKyB2YWx1ZSA6IFwibnVsbFwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzKSB7XG4gICAgICAgICAgICAvLyBTdHJpbmdzIGFyZSBkb3VibGUtcXVvdGVkIGFuZCBlc2NhcGVkLlxuICAgICAgICAgICAgcmV0dXJuIHF1b3RlKFwiXCIgKyB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoaXMgaXMgYSBsaW5lYXIgc2VhcmNoOyBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgLy8gaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mIHVuaXF1ZSBuZXN0ZWQgb2JqZWN0cy5cbiAgICAgICAgICAgIGZvciAobGVuZ3RoID0gc3RhY2subGVuZ3RoOyBsZW5ndGgtLTspIHtcbiAgICAgICAgICAgICAgaWYgKHN0YWNrW2xlbmd0aF0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgLy8gQ3ljbGljIHN0cnVjdHVyZXMgY2Fubm90IGJlIHNlcmlhbGl6ZWQgYnkgYEpTT04uc3RyaW5naWZ5YC5cbiAgICAgICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQWRkIHRoZSBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgICAgICAgICAgc3RhY2sucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICAvLyBTYXZlIHRoZSBjdXJyZW50IGluZGVudGF0aW9uIGxldmVsIGFuZCBpbmRlbnQgb25lIGFkZGl0aW9uYWwgbGV2ZWwuXG4gICAgICAgICAgICBwcmVmaXggPSBpbmRlbnRhdGlvbjtcbiAgICAgICAgICAgIGluZGVudGF0aW9uICs9IHdoaXRlc3BhY2U7XG4gICAgICAgICAgICBpZiAoY2xhc3NOYW1lID09IGFycmF5Q2xhc3MpIHtcbiAgICAgICAgICAgICAgLy8gUmVjdXJzaXZlbHkgc2VyaWFsaXplIGFycmF5IGVsZW1lbnRzLlxuICAgICAgICAgICAgICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBzZXJpYWxpemUoaW5kZXgsIHZhbHVlLCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgaW5kZW50YXRpb24sIHN0YWNrKTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZWxlbWVudCA9PT0gdW5kZWYgPyBcIm51bGxcIiA6IGVsZW1lbnQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdHMubGVuZ3RoID8gKHdoaXRlc3BhY2UgPyBcIltcXG5cIiArIGluZGVudGF0aW9uICsgcmVzdWx0cy5qb2luKFwiLFxcblwiICsgaW5kZW50YXRpb24pICsgXCJcXG5cIiArIHByZWZpeCArIFwiXVwiIDogKFwiW1wiICsgcmVzdWx0cy5qb2luKFwiLFwiKSArIFwiXVwiKSkgOiBcIltdXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBSZWN1cnNpdmVseSBzZXJpYWxpemUgb2JqZWN0IG1lbWJlcnMuIE1lbWJlcnMgYXJlIHNlbGVjdGVkIGZyb21cbiAgICAgICAgICAgICAgLy8gZWl0aGVyIGEgdXNlci1zcGVjaWZpZWQgbGlzdCBvZiBwcm9wZXJ0eSBuYW1lcywgb3IgdGhlIG9iamVjdFxuICAgICAgICAgICAgICAvLyBpdHNlbGYuXG4gICAgICAgICAgICAgIGZvckVhY2gocHJvcGVydGllcyB8fCB2YWx1ZSwgZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBzZXJpYWxpemUocHJvcGVydHksIHZhbHVlLCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgaW5kZW50YXRpb24sIHN0YWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudCAhPT0gdW5kZWYpIHtcbiAgICAgICAgICAgICAgICAgIC8vIEFjY29yZGluZyB0byBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zOiBcIklmIGBnYXBgIHt3aGl0ZXNwYWNlfVxuICAgICAgICAgICAgICAgICAgLy8gaXMgbm90IHRoZSBlbXB0eSBzdHJpbmcsIGxldCBgbWVtYmVyYCB7cXVvdGUocHJvcGVydHkpICsgXCI6XCJ9XG4gICAgICAgICAgICAgICAgICAvLyBiZSB0aGUgY29uY2F0ZW5hdGlvbiBvZiBgbWVtYmVyYCBhbmQgdGhlIGBzcGFjZWAgY2hhcmFjdGVyLlwiXG4gICAgICAgICAgICAgICAgICAvLyBUaGUgXCJgc3BhY2VgIGNoYXJhY3RlclwiIHJlZmVycyB0byB0aGUgbGl0ZXJhbCBzcGFjZVxuICAgICAgICAgICAgICAgICAgLy8gY2hhcmFjdGVyLCBub3QgdGhlIGBzcGFjZWAge3dpZHRofSBhcmd1bWVudCBwcm92aWRlZCB0b1xuICAgICAgICAgICAgICAgICAgLy8gYEpTT04uc3RyaW5naWZ5YC5cbiAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChxdW90ZShwcm9wZXJ0eSkgKyBcIjpcIiArICh3aGl0ZXNwYWNlID8gXCIgXCIgOiBcIlwiKSArIGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdHMubGVuZ3RoID8gKHdoaXRlc3BhY2UgPyBcIntcXG5cIiArIGluZGVudGF0aW9uICsgcmVzdWx0cy5qb2luKFwiLFxcblwiICsgaW5kZW50YXRpb24pICsgXCJcXG5cIiArIHByZWZpeCArIFwifVwiIDogKFwie1wiICsgcmVzdWx0cy5qb2luKFwiLFwiKSArIFwifVwiKSkgOiBcInt9XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIG9iamVjdCBmcm9tIHRoZSB0cmF2ZXJzZWQgb2JqZWN0IHN0YWNrLlxuICAgICAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBQdWJsaWM6IGBKU09OLnN0cmluZ2lmeWAuIFNlZSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLlxuICAgICAgICBleHBvcnRzLnN0cmluZ2lmeSA9IGZ1bmN0aW9uIChzb3VyY2UsIGZpbHRlciwgd2lkdGgpIHtcbiAgICAgICAgICB2YXIgd2hpdGVzcGFjZSwgY2FsbGJhY2ssIHByb3BlcnRpZXMsIGNsYXNzTmFtZTtcbiAgICAgICAgICBpZiAob2JqZWN0VHlwZXNbdHlwZW9mIGZpbHRlcl0gJiYgZmlsdGVyKSB7XG4gICAgICAgICAgICBpZiAoKGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwoZmlsdGVyKSkgPT0gZnVuY3Rpb25DbGFzcykge1xuICAgICAgICAgICAgICBjYWxsYmFjayA9IGZpbHRlcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lID09IGFycmF5Q2xhc3MpIHtcbiAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgcHJvcGVydHkgbmFtZXMgYXJyYXkgaW50byBhIG1ha2VzaGlmdCBzZXQuXG4gICAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwLCBsZW5ndGggPSBmaWx0ZXIubGVuZ3RoLCB2YWx1ZTsgaW5kZXggPCBsZW5ndGg7IHZhbHVlID0gZmlsdGVyW2luZGV4KytdLCAoKGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpKSwgY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzIHx8IGNsYXNzTmFtZSA9PSBudW1iZXJDbGFzcykgJiYgKHByb3BlcnRpZXNbdmFsdWVdID0gMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgICAgIGlmICgoY2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbCh3aWR0aCkpID09IG51bWJlckNsYXNzKSB7XG4gICAgICAgICAgICAgIC8vIENvbnZlcnQgdGhlIGB3aWR0aGAgdG8gYW4gaW50ZWdlciBhbmQgY3JlYXRlIGEgc3RyaW5nIGNvbnRhaW5pbmdcbiAgICAgICAgICAgICAgLy8gYHdpZHRoYCBudW1iZXIgb2Ygc3BhY2UgY2hhcmFjdGVycy5cbiAgICAgICAgICAgICAgaWYgKCh3aWR0aCAtPSB3aWR0aCAlIDEpID4gMCkge1xuICAgICAgICAgICAgICAgIGZvciAod2hpdGVzcGFjZSA9IFwiXCIsIHdpZHRoID4gMTAgJiYgKHdpZHRoID0gMTApOyB3aGl0ZXNwYWNlLmxlbmd0aCA8IHdpZHRoOyB3aGl0ZXNwYWNlICs9IFwiIFwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MpIHtcbiAgICAgICAgICAgICAgd2hpdGVzcGFjZSA9IHdpZHRoLmxlbmd0aCA8PSAxMCA/IHdpZHRoIDogd2lkdGguc2xpY2UoMCwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBPcGVyYSA8PSA3LjU0dTIgZGlzY2FyZHMgdGhlIHZhbHVlcyBhc3NvY2lhdGVkIHdpdGggZW1wdHkgc3RyaW5nIGtleXNcbiAgICAgICAgICAvLyAoYFwiXCJgKSBvbmx5IGlmIHRoZXkgYXJlIHVzZWQgZGlyZWN0bHkgd2l0aGluIGFuIG9iamVjdCBtZW1iZXIgbGlzdFxuICAgICAgICAgIC8vIChlLmcuLCBgIShcIlwiIGluIHsgXCJcIjogMX0pYCkuXG4gICAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZShcIlwiLCAodmFsdWUgPSB7fSwgdmFsdWVbXCJcIl0gPSBzb3VyY2UsIHZhbHVlKSwgY2FsbGJhY2ssIHByb3BlcnRpZXMsIHdoaXRlc3BhY2UsIFwiXCIsIFtdKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gUHVibGljOiBQYXJzZXMgYSBKU09OIHNvdXJjZSBzdHJpbmcuXG4gICAgICBpZiAoIWhhcyhcImpzb24tcGFyc2VcIikpIHtcbiAgICAgICAgdmFyIGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IEEgbWFwIG9mIGVzY2FwZWQgY29udHJvbCBjaGFyYWN0ZXJzIGFuZCB0aGVpciB1bmVzY2FwZWRcbiAgICAgICAgLy8gZXF1aXZhbGVudHMuXG4gICAgICAgIHZhciBVbmVzY2FwZXMgPSB7XG4gICAgICAgICAgOTI6IFwiXFxcXFwiLFxuICAgICAgICAgIDM0OiAnXCInLFxuICAgICAgICAgIDQ3OiBcIi9cIixcbiAgICAgICAgICA5ODogXCJcXGJcIixcbiAgICAgICAgICAxMTY6IFwiXFx0XCIsXG4gICAgICAgICAgMTEwOiBcIlxcblwiLFxuICAgICAgICAgIDEwMjogXCJcXGZcIixcbiAgICAgICAgICAxMTQ6IFwiXFxyXCJcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogU3RvcmVzIHRoZSBwYXJzZXIgc3RhdGUuXG4gICAgICAgIHZhciBJbmRleCwgU291cmNlO1xuXG4gICAgICAgIC8vIEludGVybmFsOiBSZXNldHMgdGhlIHBhcnNlciBzdGF0ZSBhbmQgdGhyb3dzIGEgYFN5bnRheEVycm9yYC5cbiAgICAgICAgdmFyIGFib3J0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIEluZGV4ID0gU291cmNlID0gbnVsbDtcbiAgICAgICAgICB0aHJvdyBTeW50YXhFcnJvcigpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBSZXR1cm5zIHRoZSBuZXh0IHRva2VuLCBvciBgXCIkXCJgIGlmIHRoZSBwYXJzZXIgaGFzIHJlYWNoZWRcbiAgICAgICAgLy8gdGhlIGVuZCBvZiB0aGUgc291cmNlIHN0cmluZy4gQSB0b2tlbiBtYXkgYmUgYSBzdHJpbmcsIG51bWJlciwgYG51bGxgXG4gICAgICAgIC8vIGxpdGVyYWwsIG9yIEJvb2xlYW4gbGl0ZXJhbC5cbiAgICAgICAgdmFyIGxleCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgc291cmNlID0gU291cmNlLCBsZW5ndGggPSBzb3VyY2UubGVuZ3RoLCB2YWx1ZSwgYmVnaW4sIHBvc2l0aW9uLCBpc1NpZ25lZCwgY2hhckNvZGU7XG4gICAgICAgICAgd2hpbGUgKEluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgIHN3aXRjaCAoY2hhckNvZGUpIHtcbiAgICAgICAgICAgICAgY2FzZSA5OiBjYXNlIDEwOiBjYXNlIDEzOiBjYXNlIDMyOlxuICAgICAgICAgICAgICAgIC8vIFNraXAgd2hpdGVzcGFjZSB0b2tlbnMsIGluY2x1ZGluZyB0YWJzLCBjYXJyaWFnZSByZXR1cm5zLCBsaW5lXG4gICAgICAgICAgICAgICAgLy8gZmVlZHMsIGFuZCBzcGFjZSBjaGFyYWN0ZXJzLlxuICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgMTIzOiBjYXNlIDEyNTogY2FzZSA5MTogY2FzZSA5MzogY2FzZSA1ODogY2FzZSA0NDpcbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBhIHB1bmN0dWF0b3IgdG9rZW4gKGB7YCwgYH1gLCBgW2AsIGBdYCwgYDpgLCBvciBgLGApIGF0XG4gICAgICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBjaGFySW5kZXhCdWdneSA/IHNvdXJjZS5jaGFyQXQoSW5kZXgpIDogc291cmNlW0luZGV4XTtcbiAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICAgICAgICAvLyBgXCJgIGRlbGltaXRzIGEgSlNPTiBzdHJpbmc7IGFkdmFuY2UgdG8gdGhlIG5leHQgY2hhcmFjdGVyIGFuZFxuICAgICAgICAgICAgICAgIC8vIGJlZ2luIHBhcnNpbmcgdGhlIHN0cmluZy4gU3RyaW5nIHRva2VucyBhcmUgcHJlZml4ZWQgd2l0aCB0aGVcbiAgICAgICAgICAgICAgICAvLyBzZW50aW5lbCBgQGAgY2hhcmFjdGVyIHRvIGRpc3Rpbmd1aXNoIHRoZW0gZnJvbSBwdW5jdHVhdG9ycyBhbmRcbiAgICAgICAgICAgICAgICAvLyBlbmQtb2Ytc3RyaW5nIHRva2Vucy5cbiAgICAgICAgICAgICAgICBmb3IgKHZhbHVlID0gXCJAXCIsIEluZGV4Kys7IEluZGV4IDwgbGVuZ3RoOykge1xuICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPCAzMikge1xuICAgICAgICAgICAgICAgICAgICAvLyBVbmVzY2FwZWQgQVNDSUkgY29udHJvbCBjaGFyYWN0ZXJzICh0aG9zZSB3aXRoIGEgY29kZSB1bml0XG4gICAgICAgICAgICAgICAgICAgIC8vIGxlc3MgdGhhbiB0aGUgc3BhY2UgY2hhcmFjdGVyKSBhcmUgbm90IHBlcm1pdHRlZC5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhckNvZGUgPT0gOTIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSByZXZlcnNlIHNvbGlkdXMgKGBcXGApIG1hcmtzIHRoZSBiZWdpbm5pbmcgb2YgYW4gZXNjYXBlZFxuICAgICAgICAgICAgICAgICAgICAvLyBjb250cm9sIGNoYXJhY3RlciAoaW5jbHVkaW5nIGBcImAsIGBcXGAsIGFuZCBgL2ApIG9yIFVuaWNvZGVcbiAgICAgICAgICAgICAgICAgICAgLy8gZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNoYXJDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSA5MjogY2FzZSAzNDogY2FzZSA0NzogY2FzZSA5ODogY2FzZSAxMTY6IGNhc2UgMTEwOiBjYXNlIDEwMjogY2FzZSAxMTQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXZpdmUgZXNjYXBlZCBjb250cm9sIGNoYXJhY3RlcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSBVbmVzY2FwZXNbY2hhckNvZGVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgSW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTE3OlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYFxcdWAgbWFya3MgdGhlIGJlZ2lubmluZyBvZiBhIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWR2YW5jZSB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIGFuZCB2YWxpZGF0ZSB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvdXItZGlnaXQgY29kZSBwb2ludC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luID0gKytJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAocG9zaXRpb24gPSBJbmRleCArIDQ7IEluZGV4IDwgcG9zaXRpb247IEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEEgdmFsaWQgc2VxdWVuY2UgY29tcHJpc2VzIGZvdXIgaGV4ZGlnaXRzIChjYXNlLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnNlbnNpdGl2ZSkgdGhhdCBmb3JtIGEgc2luZ2xlIGhleGFkZWNpbWFsIHZhbHVlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1NyB8fCBjaGFyQ29kZSA+PSA5NyAmJiBjaGFyQ29kZSA8PSAxMDIgfHwgY2hhckNvZGUgPj0gNjUgJiYgY2hhckNvZGUgPD0gNzApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW52YWxpZCBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXZpdmUgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gZnJvbUNoYXJDb2RlKFwiMHhcIiArIHNvdXJjZS5zbGljZShiZWdpbiwgSW5kZXgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSAzNCkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIHVuZXNjYXBlZCBkb3VibGUtcXVvdGUgY2hhcmFjdGVyIG1hcmtzIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgLy8gc3RyaW5nLlxuICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBiZWdpbiA9IEluZGV4O1xuICAgICAgICAgICAgICAgICAgICAvLyBPcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiBjYXNlIHdoZXJlIGEgc3RyaW5nIGlzIHZhbGlkLlxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY2hhckNvZGUgPj0gMzIgJiYgY2hhckNvZGUgIT0gOTIgJiYgY2hhckNvZGUgIT0gMzQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB0aGUgc3RyaW5nIGFzLWlzLlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSBzb3VyY2Uuc2xpY2UoYmVnaW4sIEluZGV4KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KSA9PSAzNCkge1xuICAgICAgICAgICAgICAgICAgLy8gQWR2YW5jZSB0byB0aGUgbmV4dCBjaGFyYWN0ZXIgYW5kIHJldHVybiB0aGUgcmV2aXZlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBVbnRlcm1pbmF0ZWQgc3RyaW5nLlxuICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgbnVtYmVycyBhbmQgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgYmVnaW4gPSBJbmRleDtcbiAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHBhc3QgdGhlIG5lZ2F0aXZlIHNpZ24sIGlmIG9uZSBpcyBzcGVjaWZpZWQuXG4gICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDQ1KSB7XG4gICAgICAgICAgICAgICAgICBpc1NpZ25lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBhbiBpbnRlZ2VyIG9yIGZsb2F0aW5nLXBvaW50IHZhbHVlLlxuICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nykge1xuICAgICAgICAgICAgICAgICAgLy8gTGVhZGluZyB6ZXJvZXMgYXJlIGludGVycHJldGVkIGFzIG9jdGFsIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDQ4ICYmICgoY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCArIDEpKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElsbGVnYWwgb2N0YWwgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlzU2lnbmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAvLyBQYXJzZSB0aGUgaW50ZWdlciBjb21wb25lbnQuXG4gICAgICAgICAgICAgICAgICBmb3IgKDsgSW5kZXggPCBsZW5ndGggJiYgKChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KSksIGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KTsgSW5kZXgrKyk7XG4gICAgICAgICAgICAgICAgICAvLyBGbG9hdHMgY2Fubm90IGNvbnRhaW4gYSBsZWFkaW5nIGRlY2ltYWwgcG9pbnQ7IGhvd2V2ZXIsIHRoaXNcbiAgICAgICAgICAgICAgICAgIC8vIGNhc2UgaXMgYWxyZWFkeSBhY2NvdW50ZWQgZm9yIGJ5IHRoZSBwYXJzZXIuXG4gICAgICAgICAgICAgICAgICBpZiAoc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpID09IDQ2KSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gKytJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhlIGRlY2ltYWwgY29tcG9uZW50LlxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgcG9zaXRpb24gPCBsZW5ndGggJiYgKChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KHBvc2l0aW9uKSksIGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KTsgcG9zaXRpb24rKyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbiA9PSBJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIElsbGVnYWwgdHJhaWxpbmcgZGVjaW1hbC5cbiAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIEluZGV4ID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAvLyBQYXJzZSBleHBvbmVudHMuIFRoZSBgZWAgZGVub3RpbmcgdGhlIGV4cG9uZW50IGlzXG4gICAgICAgICAgICAgICAgICAvLyBjYXNlLWluc2Vuc2l0aXZlLlxuICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gMTAxIHx8IGNoYXJDb2RlID09IDY5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNraXAgcGFzdCB0aGUgc2lnbiBmb2xsb3dpbmcgdGhlIGV4cG9uZW50LCBpZiBvbmUgaXNcbiAgICAgICAgICAgICAgICAgICAgLy8gc3BlY2lmaWVkLlxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gNDMgfHwgY2hhckNvZGUgPT0gNDUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFBhcnNlIHRoZSBleHBvbmVudGlhbCBjb21wb25lbnQuXG4gICAgICAgICAgICAgICAgICAgIGZvciAocG9zaXRpb24gPSBJbmRleDsgcG9zaXRpb24gPCBsZW5ndGggJiYgKChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KHBvc2l0aW9uKSksIGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KTsgcG9zaXRpb24rKyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbiA9PSBJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIElsbGVnYWwgZW1wdHkgZXhwb25lbnQuXG4gICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBJbmRleCA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLy8gQ29lcmNlIHRoZSBwYXJzZWQgdmFsdWUgdG8gYSBKYXZhU2NyaXB0IG51bWJlci5cbiAgICAgICAgICAgICAgICAgIHJldHVybiArc291cmNlLnNsaWNlKGJlZ2luLCBJbmRleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEEgbmVnYXRpdmUgc2lnbiBtYXkgb25seSBwcmVjZWRlIG51bWJlcnMuXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lnbmVkKSB7XG4gICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBgdHJ1ZWAsIGBmYWxzZWAsIGFuZCBgbnVsbGAgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5zbGljZShJbmRleCwgSW5kZXggKyA0KSA9PSBcInRydWVcIikge1xuICAgICAgICAgICAgICAgICAgSW5kZXggKz0gNDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlLnNsaWNlKEluZGV4LCBJbmRleCArIDUpID09IFwiZmFsc2VcIikge1xuICAgICAgICAgICAgICAgICAgSW5kZXggKz0gNTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZS5zbGljZShJbmRleCwgSW5kZXggKyA0KSA9PSBcIm51bGxcIikge1xuICAgICAgICAgICAgICAgICAgSW5kZXggKz0gNDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBVbnJlY29nbml6ZWQgdG9rZW4uXG4gICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmV0dXJuIHRoZSBzZW50aW5lbCBgJGAgY2hhcmFjdGVyIGlmIHRoZSBwYXJzZXIgaGFzIHJlYWNoZWQgdGhlIGVuZFxuICAgICAgICAgIC8vIG9mIHRoZSBzb3VyY2Ugc3RyaW5nLlxuICAgICAgICAgIHJldHVybiBcIiRcIjtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogUGFyc2VzIGEgSlNPTiBgdmFsdWVgIHRva2VuLlxuICAgICAgICB2YXIgZ2V0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdHMsIGhhc01lbWJlcnM7XG4gICAgICAgICAgaWYgKHZhbHVlID09IFwiJFwiKSB7XG4gICAgICAgICAgICAvLyBVbmV4cGVjdGVkIGVuZCBvZiBpbnB1dC5cbiAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWYgKChjaGFySW5kZXhCdWdneSA/IHZhbHVlLmNoYXJBdCgwKSA6IHZhbHVlWzBdKSA9PSBcIkBcIikge1xuICAgICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHNlbnRpbmVsIGBAYCBjaGFyYWN0ZXIuXG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zbGljZSgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBhcnNlIG9iamVjdCBhbmQgYXJyYXkgbGl0ZXJhbHMuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJbXCIpIHtcbiAgICAgICAgICAgICAgLy8gUGFyc2VzIGEgSlNPTiBhcnJheSwgcmV0dXJuaW5nIGEgbmV3IEphdmFTY3JpcHQgYXJyYXkuXG4gICAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgZm9yICg7OyBoYXNNZW1iZXJzIHx8IChoYXNNZW1iZXJzID0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGxleCgpO1xuICAgICAgICAgICAgICAgIC8vIEEgY2xvc2luZyBzcXVhcmUgYnJhY2tldCBtYXJrcyB0aGUgZW5kIG9mIHRoZSBhcnJheSBsaXRlcmFsLlxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIl1cIikge1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBhcnJheSBsaXRlcmFsIGNvbnRhaW5zIGVsZW1lbnRzLCB0aGUgY3VycmVudCB0b2tlblxuICAgICAgICAgICAgICAgIC8vIHNob3VsZCBiZSBhIGNvbW1hIHNlcGFyYXRpbmcgdGhlIHByZXZpb3VzIGVsZW1lbnQgZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyBuZXh0LlxuICAgICAgICAgICAgICAgIGlmIChoYXNNZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBsZXgoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiXVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVW5leHBlY3RlZCB0cmFpbGluZyBgLGAgaW4gYXJyYXkgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIGAsYCBtdXN0IHNlcGFyYXRlIGVhY2ggYXJyYXkgZWxlbWVudC5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRWxpc2lvbnMgYW5kIGxlYWRpbmcgY29tbWFzIGFyZSBub3QgcGVybWl0dGVkLlxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIixcIikge1xuICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGdldCh2YWx1ZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PSBcIntcIikge1xuICAgICAgICAgICAgICAvLyBQYXJzZXMgYSBKU09OIG9iamVjdCwgcmV0dXJuaW5nIGEgbmV3IEphdmFTY3JpcHQgb2JqZWN0LlxuICAgICAgICAgICAgICByZXN1bHRzID0ge307XG4gICAgICAgICAgICAgIGZvciAoOzsgaGFzTWVtYmVycyB8fCAoaGFzTWVtYmVycyA9IHRydWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBsZXgoKTtcbiAgICAgICAgICAgICAgICAvLyBBIGNsb3NpbmcgY3VybHkgYnJhY2UgbWFya3MgdGhlIGVuZCBvZiB0aGUgb2JqZWN0IGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwifVwiKSB7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5zIG1lbWJlcnMsIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIGJlIGEgY29tbWEgc2VwYXJhdG9yLlxuICAgICAgICAgICAgICAgIGlmIChoYXNNZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBsZXgoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwifVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVW5leHBlY3RlZCB0cmFpbGluZyBgLGAgaW4gb2JqZWN0IGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBgLGAgbXVzdCBzZXBhcmF0ZSBlYWNoIG9iamVjdCBtZW1iZXIuXG4gICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIExlYWRpbmcgY29tbWFzIGFyZSBub3QgcGVybWl0dGVkLCBvYmplY3QgcHJvcGVydHkgbmFtZXMgbXVzdCBiZVxuICAgICAgICAgICAgICAgIC8vIGRvdWJsZS1xdW90ZWQgc3RyaW5ncywgYW5kIGEgYDpgIG11c3Qgc2VwYXJhdGUgZWFjaCBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgIC8vIG5hbWUgYW5kIHZhbHVlLlxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIixcIiB8fCB0eXBlb2YgdmFsdWUgIT0gXCJzdHJpbmdcIiB8fCAoY2hhckluZGV4QnVnZ3kgPyB2YWx1ZS5jaGFyQXQoMCkgOiB2YWx1ZVswXSkgIT0gXCJAXCIgfHwgbGV4KCkgIT0gXCI6XCIpIHtcbiAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHNbdmFsdWUuc2xpY2UoMSldID0gZ2V0KGxleCgpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFVuZXhwZWN0ZWQgdG9rZW4gZW5jb3VudGVyZWQuXG4gICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFVwZGF0ZXMgYSB0cmF2ZXJzZWQgb2JqZWN0IG1lbWJlci5cbiAgICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uIChzb3VyY2UsIHByb3BlcnR5LCBjYWxsYmFjaykge1xuICAgICAgICAgIHZhciBlbGVtZW50ID0gd2Fsayhzb3VyY2UsIHByb3BlcnR5LCBjYWxsYmFjayk7XG4gICAgICAgICAgaWYgKGVsZW1lbnQgPT09IHVuZGVmKSB7XG4gICAgICAgICAgICBkZWxldGUgc291cmNlW3Byb3BlcnR5XTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc291cmNlW3Byb3BlcnR5XSA9IGVsZW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBSZWN1cnNpdmVseSB0cmF2ZXJzZXMgYSBwYXJzZWQgSlNPTiBvYmplY3QsIGludm9raW5nIHRoZVxuICAgICAgICAvLyBgY2FsbGJhY2tgIGZ1bmN0aW9uIGZvciBlYWNoIHZhbHVlLiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIHRoZVxuICAgICAgICAvLyBgV2Fsayhob2xkZXIsIG5hbWUpYCBvcGVyYXRpb24gZGVmaW5lZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS4xMi4yLlxuICAgICAgICB2YXIgd2FsayA9IGZ1bmN0aW9uIChzb3VyY2UsIHByb3BlcnR5LCBjYWxsYmFjaykge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHNvdXJjZVtwcm9wZXJ0eV0sIGxlbmd0aDtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGBmb3JFYWNoYCBjYW4ndCBiZSB1c2VkIHRvIHRyYXZlcnNlIGFuIGFycmF5IGluIE9wZXJhIDw9IDguNTRcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgaXRzIGBPYmplY3QjaGFzT3duUHJvcGVydHlgIGltcGxlbWVudGF0aW9uIHJldHVybnMgYGZhbHNlYFxuICAgICAgICAgICAgLy8gZm9yIGFycmF5IGluZGljZXMgKGUuZy4sIGAhWzEsIDIsIDNdLmhhc093blByb3BlcnR5KFwiMFwiKWApLlxuICAgICAgICAgICAgaWYgKGdldENsYXNzLmNhbGwodmFsdWUpID09IGFycmF5Q2xhc3MpIHtcbiAgICAgICAgICAgICAgZm9yIChsZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGxlbmd0aC0tOykge1xuICAgICAgICAgICAgICAgIHVwZGF0ZSh2YWx1ZSwgbGVuZ3RoLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGZvckVhY2godmFsdWUsIGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZSh2YWx1ZSwgcHJvcGVydHksIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHNvdXJjZSwgcHJvcGVydHksIHZhbHVlKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBQdWJsaWM6IGBKU09OLnBhcnNlYC4gU2VlIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjIuXG4gICAgICAgIGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiAoc291cmNlLCBjYWxsYmFjaykge1xuICAgICAgICAgIHZhciByZXN1bHQsIHZhbHVlO1xuICAgICAgICAgIEluZGV4ID0gMDtcbiAgICAgICAgICBTb3VyY2UgPSBcIlwiICsgc291cmNlO1xuICAgICAgICAgIHJlc3VsdCA9IGdldChsZXgoKSk7XG4gICAgICAgICAgLy8gSWYgYSBKU09OIHN0cmluZyBjb250YWlucyBtdWx0aXBsZSB0b2tlbnMsIGl0IGlzIGludmFsaWQuXG4gICAgICAgICAgaWYgKGxleCgpICE9IFwiJFwiKSB7XG4gICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZXNldCB0aGUgcGFyc2VyIHN0YXRlLlxuICAgICAgICAgIEluZGV4ID0gU291cmNlID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sgJiYgZ2V0Q2xhc3MuY2FsbChjYWxsYmFjaykgPT0gZnVuY3Rpb25DbGFzcyA/IHdhbGsoKHZhbHVlID0ge30sIHZhbHVlW1wiXCJdID0gcmVzdWx0LCB2YWx1ZSksIFwiXCIsIGNhbGxiYWNrKSA6IHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnRzW1wicnVuSW5Db250ZXh0XCJdID0gcnVuSW5Db250ZXh0O1xuICAgIHJldHVybiBleHBvcnRzO1xuICB9XG5cbiAgaWYgKGZyZWVFeHBvcnRzICYmICFpc0xvYWRlcikge1xuICAgIC8vIEV4cG9ydCBmb3IgQ29tbW9uSlMgZW52aXJvbm1lbnRzLlxuICAgIHJ1bkluQ29udGV4dChyb290LCBmcmVlRXhwb3J0cyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gRXhwb3J0IGZvciB3ZWIgYnJvd3NlcnMgYW5kIEphdmFTY3JpcHQgZW5naW5lcy5cbiAgICB2YXIgbmF0aXZlSlNPTiA9IHJvb3QuSlNPTixcbiAgICAgICAgcHJldmlvdXNKU09OID0gcm9vdFtcIkpTT04zXCJdLFxuICAgICAgICBpc1Jlc3RvcmVkID0gZmFsc2U7XG5cbiAgICB2YXIgSlNPTjMgPSBydW5JbkNvbnRleHQocm9vdCwgKHJvb3RbXCJKU09OM1wiXSA9IHtcbiAgICAgIC8vIFB1YmxpYzogUmVzdG9yZXMgdGhlIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSBnbG9iYWwgYEpTT05gIG9iamVjdCBhbmRcbiAgICAgIC8vIHJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIGBKU09OM2Agb2JqZWN0LlxuICAgICAgXCJub0NvbmZsaWN0XCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFpc1Jlc3RvcmVkKSB7XG4gICAgICAgICAgaXNSZXN0b3JlZCA9IHRydWU7XG4gICAgICAgICAgcm9vdC5KU09OID0gbmF0aXZlSlNPTjtcbiAgICAgICAgICByb290W1wiSlNPTjNcIl0gPSBwcmV2aW91c0pTT047XG4gICAgICAgICAgbmF0aXZlSlNPTiA9IHByZXZpb3VzSlNPTiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04zO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHJvb3QuSlNPTiA9IHtcbiAgICAgIFwicGFyc2VcIjogSlNPTjMucGFyc2UsXG4gICAgICBcInN0cmluZ2lmeVwiOiBKU09OMy5zdHJpbmdpZnlcbiAgICB9O1xuICB9XG5cbiAgLy8gRXhwb3J0IGZvciBhc3luY2hyb25vdXMgbW9kdWxlIGxvYWRlcnMuXG4gIGlmIChpc0xvYWRlcikge1xuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gSlNPTjM7XG4gICAgfSk7XG4gIH1cbn0pLmNhbGwodGhpcyk7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE0IEZlbGl4IEduYXNzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqIGh0dHA6Ly9zcGluLmpzLm9yZy9cbiAqXG4gKiBFeGFtcGxlOlxuICAgIHZhciBvcHRzID0ge1xuICAgICAgbGluZXM6IDEyICAgICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xuICAgICwgbGVuZ3RoOiA3ICAgICAgICAgICAgIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgLCB3aWR0aDogNSAgICAgICAgICAgICAgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgLCByYWRpdXM6IDEwICAgICAgICAgICAgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgLCBzY2FsZTogMS4wICAgICAgICAgICAgLy8gU2NhbGVzIG92ZXJhbGwgc2l6ZSBvZiB0aGUgc3Bpbm5lclxuICAgICwgY29ybmVyczogMSAgICAgICAgICAgIC8vIFJvdW5kbmVzcyAoMC4uMSlcbiAgICAsIGNvbG9yOiAnIzAwMCcgICAgICAgICAvLyAjcmdiIG9yICNycmdnYmJcbiAgICAsIG9wYWNpdHk6IDEvNCAgICAgICAgICAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xuICAgICwgcm90YXRlOiAwICAgICAgICAgICAgIC8vIFJvdGF0aW9uIG9mZnNldFxuICAgICwgZGlyZWN0aW9uOiAxICAgICAgICAgIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcbiAgICAsIHNwZWVkOiAxICAgICAgICAgICAgICAvLyBSb3VuZHMgcGVyIHNlY29uZFxuICAgICwgdHJhaWw6IDEwMCAgICAgICAgICAgIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXG4gICAgLCBmcHM6IDIwICAgICAgICAgICAgICAgLy8gRnJhbWVzIHBlciBzZWNvbmQgd2hlbiB1c2luZyBzZXRUaW1lb3V0KClcbiAgICAsIHpJbmRleDogMmU5ICAgICAgICAgICAvLyBVc2UgYSBoaWdoIHotaW5kZXggYnkgZGVmYXVsdFxuICAgICwgY2xhc3NOYW1lOiAnc3Bpbm5lcicgIC8vIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIGVsZW1lbnRcbiAgICAsIHRvcDogJzUwJScgICAgICAgICAgICAvLyBjZW50ZXIgdmVydGljYWxseVxuICAgICwgbGVmdDogJzUwJScgICAgICAgICAgIC8vIGNlbnRlciBob3Jpem9udGFsbHlcbiAgICAsIHNoYWRvdzogZmFsc2UgICAgICAgICAvLyBXaGV0aGVyIHRvIHJlbmRlciBhIHNoYWRvd1xuICAgICwgaHdhY2NlbDogZmFsc2UgICAgICAgIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiAobWlnaHQgYmUgYnVnZ3kpXG4gICAgLCBwb3NpdGlvbjogJ2Fic29sdXRlJyAgLy8gRWxlbWVudCBwb3NpdGlvbmluZ1xuICAgIH1cbiAgICB2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZvbycpXG4gICAgdmFyIHNwaW5uZXIgPSBuZXcgU3Bpbm5lcihvcHRzKS5zcGluKHRhcmdldClcbiAqL1xuOyhmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuXG4gIC8qIENvbW1vbkpTICovXG4gIGlmICh0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKVxuXG4gIC8qIEFNRCBtb2R1bGUgKi9cbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShmYWN0b3J5KVxuXG4gIC8qIEJyb3dzZXIgZ2xvYmFsICovXG4gIGVsc2Ugcm9vdC5TcGlubmVyID0gZmFjdG9yeSgpXG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgXCJ1c2Ugc3RyaWN0XCJcblxuICB2YXIgcHJlZml4ZXMgPSBbJ3dlYmtpdCcsICdNb3onLCAnbXMnLCAnTyddIC8qIFZlbmRvciBwcmVmaXhlcyAqL1xuICAgICwgYW5pbWF0aW9ucyA9IHt9IC8qIEFuaW1hdGlvbiBydWxlcyBrZXllZCBieSB0aGVpciBuYW1lICovXG4gICAgLCB1c2VDc3NBbmltYXRpb25zIC8qIFdoZXRoZXIgdG8gdXNlIENTUyBhbmltYXRpb25zIG9yIHNldFRpbWVvdXQgKi9cbiAgICAsIHNoZWV0IC8qIEEgc3R5bGVzaGVldCB0byBob2xkIHRoZSBAa2V5ZnJhbWUgb3IgVk1MIHJ1bGVzLiAqL1xuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBlbGVtZW50cy4gSWYgbm8gdGFnIG5hbWUgaXMgZ2l2ZW4sXG4gICAqIGEgRElWIGlzIGNyZWF0ZWQuIE9wdGlvbmFsbHkgcHJvcGVydGllcyBjYW4gYmUgcGFzc2VkLlxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlRWwgKHRhZywgcHJvcCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnIHx8ICdkaXYnKVxuICAgICAgLCBuXG5cbiAgICBmb3IgKG4gaW4gcHJvcCkgZWxbbl0gPSBwcm9wW25dXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBjaGlsZHJlbiBhbmQgcmV0dXJucyB0aGUgcGFyZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gaW5zIChwYXJlbnQgLyogY2hpbGQxLCBjaGlsZDIsIC4uLiovKSB7XG4gICAgZm9yICh2YXIgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoYXJndW1lbnRzW2ldKVxuICAgIH1cblxuICAgIHJldHVybiBwYXJlbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG9wYWNpdHkga2V5ZnJhbWUgYW5pbWF0aW9uIHJ1bGUgYW5kIHJldHVybnMgaXRzIG5hbWUuXG4gICAqIFNpbmNlIG1vc3QgbW9iaWxlIFdlYmtpdHMgaGF2ZSB0aW1pbmcgaXNzdWVzIHdpdGggYW5pbWF0aW9uLWRlbGF5LFxuICAgKiB3ZSBjcmVhdGUgc2VwYXJhdGUgcnVsZXMgZm9yIGVhY2ggbGluZS9zZWdtZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gYWRkQW5pbWF0aW9uIChhbHBoYSwgdHJhaWwsIGksIGxpbmVzKSB7XG4gICAgdmFyIG5hbWUgPSBbJ29wYWNpdHknLCB0cmFpbCwgfn4oYWxwaGEgKiAxMDApLCBpLCBsaW5lc10uam9pbignLScpXG4gICAgICAsIHN0YXJ0ID0gMC4wMSArIGkvbGluZXMgKiAxMDBcbiAgICAgICwgeiA9IE1hdGgubWF4KDEgLSAoMS1hbHBoYSkgLyB0cmFpbCAqICgxMDAtc3RhcnQpLCBhbHBoYSlcbiAgICAgICwgcHJlZml4ID0gdXNlQ3NzQW5pbWF0aW9ucy5zdWJzdHJpbmcoMCwgdXNlQ3NzQW5pbWF0aW9ucy5pbmRleE9mKCdBbmltYXRpb24nKSkudG9Mb3dlckNhc2UoKVxuICAgICAgLCBwcmUgPSBwcmVmaXggJiYgJy0nICsgcHJlZml4ICsgJy0nIHx8ICcnXG5cbiAgICBpZiAoIWFuaW1hdGlvbnNbbmFtZV0pIHtcbiAgICAgIHNoZWV0Lmluc2VydFJ1bGUoXG4gICAgICAgICdAJyArIHByZSArICdrZXlmcmFtZXMgJyArIG5hbWUgKyAneycgK1xuICAgICAgICAnMCV7b3BhY2l0eTonICsgeiArICd9JyArXG4gICAgICAgIHN0YXJ0ICsgJyV7b3BhY2l0eTonICsgYWxwaGEgKyAnfScgK1xuICAgICAgICAoc3RhcnQrMC4wMSkgKyAnJXtvcGFjaXR5OjF9JyArXG4gICAgICAgIChzdGFydCt0cmFpbCkgJSAxMDAgKyAnJXtvcGFjaXR5OicgKyBhbHBoYSArICd9JyArXG4gICAgICAgICcxMDAle29wYWNpdHk6JyArIHogKyAnfScgK1xuICAgICAgICAnfScsIHNoZWV0LmNzc1J1bGVzLmxlbmd0aClcblxuICAgICAgYW5pbWF0aW9uc1tuYW1lXSA9IDFcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWVzIHZhcmlvdXMgdmVuZG9yIHByZWZpeGVzIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBzdXBwb3J0ZWQgcHJvcGVydHkuXG4gICAqL1xuICBmdW5jdGlvbiB2ZW5kb3IgKGVsLCBwcm9wKSB7XG4gICAgdmFyIHMgPSBlbC5zdHlsZVxuICAgICAgLCBwcFxuICAgICAgLCBpXG5cbiAgICBwcm9wID0gcHJvcC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSlcbiAgICBpZiAoc1twcm9wXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJvcFxuICAgIGZvciAoaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcHAgPSBwcmVmaXhlc1tpXStwcm9wXG4gICAgICBpZiAoc1twcF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHBwXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgbXVsdGlwbGUgc3R5bGUgcHJvcGVydGllcyBhdCBvbmNlLlxuICAgKi9cbiAgZnVuY3Rpb24gY3NzIChlbCwgcHJvcCkge1xuICAgIGZvciAodmFyIG4gaW4gcHJvcCkge1xuICAgICAgZWwuc3R5bGVbdmVuZG9yKGVsLCBuKSB8fCBuXSA9IHByb3Bbbl1cbiAgICB9XG5cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWxscyBpbiBkZWZhdWx0IHZhbHVlcy5cbiAgICovXG4gIGZ1bmN0aW9uIG1lcmdlIChvYmopIHtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlZiA9IGFyZ3VtZW50c1tpXVxuICAgICAgZm9yICh2YXIgbiBpbiBkZWYpIHtcbiAgICAgICAgaWYgKG9ialtuXSA9PT0gdW5kZWZpbmVkKSBvYmpbbl0gPSBkZWZbbl1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9ialxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxpbmUgY29sb3IgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nIG9yIGFycmF5LlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0Q29sb3IgKGNvbG9yLCBpZHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGNvbG9yID09ICdzdHJpbmcnID8gY29sb3IgOiBjb2xvcltpZHggJSBjb2xvci5sZW5ndGhdXG4gIH1cblxuICAvLyBCdWlsdC1pbiBkZWZhdWx0c1xuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBsaW5lczogMTIgICAgICAgICAgICAgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICwgbGVuZ3RoOiA3ICAgICAgICAgICAgIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICwgd2lkdGg6IDUgICAgICAgICAgICAgIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAsIHJhZGl1czogMTAgICAgICAgICAgICAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgLCBzY2FsZTogMS4wICAgICAgICAgICAgLy8gU2NhbGVzIG92ZXJhbGwgc2l6ZSBvZiB0aGUgc3Bpbm5lclxuICAsIGNvcm5lcnM6IDEgICAgICAgICAgICAvLyBSb3VuZG5lc3MgKDAuLjEpXG4gICwgY29sb3I6ICcjMDAwJyAgICAgICAgIC8vICNyZ2Igb3IgI3JyZ2diYlxuICAsIG9wYWNpdHk6IDEvNCAgICAgICAgICAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xuICAsIHJvdGF0ZTogMCAgICAgICAgICAgICAvLyBSb3RhdGlvbiBvZmZzZXRcbiAgLCBkaXJlY3Rpb246IDEgICAgICAgICAgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAsIHNwZWVkOiAxICAgICAgICAgICAgICAvLyBSb3VuZHMgcGVyIHNlY29uZFxuICAsIHRyYWlsOiAxMDAgICAgICAgICAgICAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxuICAsIGZwczogMjAgICAgICAgICAgICAgICAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKVxuICAsIHpJbmRleDogMmU5ICAgICAgICAgICAvLyBVc2UgYSBoaWdoIHotaW5kZXggYnkgZGVmYXVsdFxuICAsIGNsYXNzTmFtZTogJ3NwaW5uZXInICAvLyBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBlbGVtZW50XG4gICwgdG9wOiAnNTAlJyAgICAgICAgICAgIC8vIGNlbnRlciB2ZXJ0aWNhbGx5XG4gICwgbGVmdDogJzUwJScgICAgICAgICAgIC8vIGNlbnRlciBob3Jpem9udGFsbHlcbiAgLCBzaGFkb3c6IGZhbHNlICAgICAgICAgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcbiAgLCBod2FjY2VsOiBmYWxzZSAgICAgICAgLy8gV2hldGhlciB0byB1c2UgaGFyZHdhcmUgYWNjZWxlcmF0aW9uIChtaWdodCBiZSBidWdneSlcbiAgLCBwb3NpdGlvbjogJ2Fic29sdXRlJyAgLy8gRWxlbWVudCBwb3NpdGlvbmluZ1xuICB9XG5cbiAgLyoqIFRoZSBjb25zdHJ1Y3RvciAqL1xuICBmdW5jdGlvbiBTcGlubmVyIChvKSB7XG4gICAgdGhpcy5vcHRzID0gbWVyZ2UobyB8fCB7fSwgU3Bpbm5lci5kZWZhdWx0cywgZGVmYXVsdHMpXG4gIH1cblxuICAvLyBHbG9iYWwgZGVmYXVsdHMgdGhhdCBvdmVycmlkZSB0aGUgYnVpbHQtaW5zOlxuICBTcGlubmVyLmRlZmF1bHRzID0ge31cblxuICBtZXJnZShTcGlubmVyLnByb3RvdHlwZSwge1xuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIHNwaW5uZXIgdG8gdGhlIGdpdmVuIHRhcmdldCBlbGVtZW50LiBJZiB0aGlzIGluc3RhbmNlIGlzIGFscmVhZHlcbiAgICAgKiBzcGlubmluZywgaXQgaXMgYXV0b21hdGljYWxseSByZW1vdmVkIGZyb20gaXRzIHByZXZpb3VzIHRhcmdldCBiIGNhbGxpbmdcbiAgICAgKiBzdG9wKCkgaW50ZXJuYWxseS5cbiAgICAgKi9cbiAgICBzcGluOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICB0aGlzLnN0b3AoKVxuXG4gICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgLCBvID0gc2VsZi5vcHRzXG4gICAgICAgICwgZWwgPSBzZWxmLmVsID0gY3JlYXRlRWwobnVsbCwge2NsYXNzTmFtZTogby5jbGFzc05hbWV9KVxuXG4gICAgICBjc3MoZWwsIHtcbiAgICAgICAgcG9zaXRpb246IG8ucG9zaXRpb25cbiAgICAgICwgd2lkdGg6IDBcbiAgICAgICwgekluZGV4OiBvLnpJbmRleFxuICAgICAgLCBsZWZ0OiBvLmxlZnRcbiAgICAgICwgdG9wOiBvLnRvcFxuICAgICAgfSlcblxuICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQuZmlyc3RDaGlsZCB8fCBudWxsKVxuICAgICAgfVxuXG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAncHJvZ3Jlc3NiYXInKVxuICAgICAgc2VsZi5saW5lcyhlbCwgc2VsZi5vcHRzKVxuXG4gICAgICBpZiAoIXVzZUNzc0FuaW1hdGlvbnMpIHtcbiAgICAgICAgLy8gTm8gQ1NTIGFuaW1hdGlvbiBzdXBwb3J0LCB1c2Ugc2V0VGltZW91dCgpIGluc3RlYWRcbiAgICAgICAgdmFyIGkgPSAwXG4gICAgICAgICAgLCBzdGFydCA9IChvLmxpbmVzIC0gMSkgKiAoMSAtIG8uZGlyZWN0aW9uKSAvIDJcbiAgICAgICAgICAsIGFscGhhXG4gICAgICAgICAgLCBmcHMgPSBvLmZwc1xuICAgICAgICAgICwgZiA9IGZwcyAvIG8uc3BlZWRcbiAgICAgICAgICAsIG9zdGVwID0gKDEgLSBvLm9wYWNpdHkpIC8gKGYgKiBvLnRyYWlsIC8gMTAwKVxuICAgICAgICAgICwgYXN0ZXAgPSBmIC8gby5saW5lc1xuXG4gICAgICAgIDsoZnVuY3Rpb24gYW5pbSAoKSB7XG4gICAgICAgICAgaSsrXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBvLmxpbmVzOyBqKyspIHtcbiAgICAgICAgICAgIGFscGhhID0gTWF0aC5tYXgoMSAtIChpICsgKG8ubGluZXMgLSBqKSAqIGFzdGVwKSAlIGYgKiBvc3RlcCwgby5vcGFjaXR5KVxuXG4gICAgICAgICAgICBzZWxmLm9wYWNpdHkoZWwsIGogKiBvLmRpcmVjdGlvbiArIHN0YXJ0LCBhbHBoYSwgbylcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VsZi50aW1lb3V0ID0gc2VsZi5lbCAmJiBzZXRUaW1lb3V0KGFuaW0sIH5+KDEwMDAgLyBmcHMpKVxuICAgICAgICB9KSgpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2VsZlxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGFuZCByZW1vdmVzIHRoZSBTcGlubmVyLlxuICAgICAqL1xuICAsIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlbCA9IHRoaXMuZWxcbiAgICAgIGlmIChlbCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgICAgICBpZiAoZWwucGFyZW50Tm9kZSkgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcbiAgICAgICAgdGhpcy5lbCA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbCBtZXRob2QgdGhhdCBkcmF3cyB0aGUgaW5kaXZpZHVhbCBsaW5lcy4gV2lsbCBiZSBvdmVyd3JpdHRlblxuICAgICAqIGluIFZNTCBmYWxsYmFjayBtb2RlIGJlbG93LlxuICAgICAqL1xuICAsIGxpbmVzOiBmdW5jdGlvbiAoZWwsIG8pIHtcbiAgICAgIHZhciBpID0gMFxuICAgICAgICAsIHN0YXJ0ID0gKG8ubGluZXMgLSAxKSAqICgxIC0gby5kaXJlY3Rpb24pIC8gMlxuICAgICAgICAsIHNlZ1xuXG4gICAgICBmdW5jdGlvbiBmaWxsIChjb2xvciwgc2hhZG93KSB7XG4gICAgICAgIHJldHVybiBjc3MoY3JlYXRlRWwoKSwge1xuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnXG4gICAgICAgICwgd2lkdGg6IG8uc2NhbGUgKiAoby5sZW5ndGggKyBvLndpZHRoKSArICdweCdcbiAgICAgICAgLCBoZWlnaHQ6IG8uc2NhbGUgKiBvLndpZHRoICsgJ3B4J1xuICAgICAgICAsIGJhY2tncm91bmQ6IGNvbG9yXG4gICAgICAgICwgYm94U2hhZG93OiBzaGFkb3dcbiAgICAgICAgLCB0cmFuc2Zvcm1PcmlnaW46ICdsZWZ0J1xuICAgICAgICAsIHRyYW5zZm9ybTogJ3JvdGF0ZSgnICsgfn4oMzYwL28ubGluZXMqaSArIG8ucm90YXRlKSArICdkZWcpIHRyYW5zbGF0ZSgnICsgby5zY2FsZSpvLnJhZGl1cyArICdweCcgKyAnLDApJ1xuICAgICAgICAsIGJvcmRlclJhZGl1czogKG8uY29ybmVycyAqIG8uc2NhbGUgKiBvLndpZHRoID4+IDEpICsgJ3B4J1xuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBmb3IgKDsgaSA8IG8ubGluZXM7IGkrKykge1xuICAgICAgICBzZWcgPSBjc3MoY3JlYXRlRWwoKSwge1xuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnXG4gICAgICAgICwgdG9wOiAxICsgfihvLnNjYWxlICogby53aWR0aCAvIDIpICsgJ3B4J1xuICAgICAgICAsIHRyYW5zZm9ybTogby5od2FjY2VsID8gJ3RyYW5zbGF0ZTNkKDAsMCwwKScgOiAnJ1xuICAgICAgICAsIG9wYWNpdHk6IG8ub3BhY2l0eVxuICAgICAgICAsIGFuaW1hdGlvbjogdXNlQ3NzQW5pbWF0aW9ucyAmJiBhZGRBbmltYXRpb24oby5vcGFjaXR5LCBvLnRyYWlsLCBzdGFydCArIGkgKiBvLmRpcmVjdGlvbiwgby5saW5lcykgKyAnICcgKyAxIC8gby5zcGVlZCArICdzIGxpbmVhciBpbmZpbml0ZSdcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoby5zaGFkb3cpIGlucyhzZWcsIGNzcyhmaWxsKCcjMDAwJywgJzAgMCA0cHggIzAwMCcpLCB7dG9wOiAnMnB4J30pKVxuICAgICAgICBpbnMoZWwsIGlucyhzZWcsIGZpbGwoZ2V0Q29sb3Ioby5jb2xvciwgaSksICcwIDAgMXB4IHJnYmEoMCwwLDAsLjEpJykpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGVsXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgbWV0aG9kIHRoYXQgYWRqdXN0cyB0aGUgb3BhY2l0eSBvZiBhIHNpbmdsZSBsaW5lLlxuICAgICAqIFdpbGwgYmUgb3ZlcndyaXR0ZW4gaW4gVk1MIGZhbGxiYWNrIG1vZGUgYmVsb3cuXG4gICAgICovXG4gICwgb3BhY2l0eTogZnVuY3Rpb24gKGVsLCBpLCB2YWwpIHtcbiAgICAgIGlmIChpIDwgZWwuY2hpbGROb2Rlcy5sZW5ndGgpIGVsLmNoaWxkTm9kZXNbaV0uc3R5bGUub3BhY2l0eSA9IHZhbFxuICAgIH1cblxuICB9KVxuXG5cbiAgZnVuY3Rpb24gaW5pdFZNTCAoKSB7XG5cbiAgICAvKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIFZNTCB0YWcgKi9cbiAgICBmdW5jdGlvbiB2bWwgKHRhZywgYXR0cikge1xuICAgICAgcmV0dXJuIGNyZWF0ZUVsKCc8JyArIHRhZyArICcgeG1sbnM9XCJ1cm46c2NoZW1hcy1taWNyb3NvZnQuY29tOnZtbFwiIGNsYXNzPVwic3Bpbi12bWxcIj4nLCBhdHRyKVxuICAgIH1cblxuICAgIC8vIE5vIENTUyB0cmFuc2Zvcm1zIGJ1dCBWTUwgc3VwcG9ydCwgYWRkIGEgQ1NTIHJ1bGUgZm9yIFZNTCBlbGVtZW50czpcbiAgICBzaGVldC5hZGRSdWxlKCcuc3Bpbi12bWwnLCAnYmVoYXZpb3I6dXJsKCNkZWZhdWx0I1ZNTCknKVxuXG4gICAgU3Bpbm5lci5wcm90b3R5cGUubGluZXMgPSBmdW5jdGlvbiAoZWwsIG8pIHtcbiAgICAgIHZhciByID0gby5zY2FsZSAqIChvLmxlbmd0aCArIG8ud2lkdGgpXG4gICAgICAgICwgcyA9IG8uc2NhbGUgKiAyICogclxuXG4gICAgICBmdW5jdGlvbiBncnAgKCkge1xuICAgICAgICByZXR1cm4gY3NzKFxuICAgICAgICAgIHZtbCgnZ3JvdXAnLCB7XG4gICAgICAgICAgICBjb29yZHNpemU6IHMgKyAnICcgKyBzXG4gICAgICAgICAgLCBjb29yZG9yaWdpbjogLXIgKyAnICcgKyAtclxuICAgICAgICAgIH0pXG4gICAgICAgICwgeyB3aWR0aDogcywgaGVpZ2h0OiBzIH1cbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICB2YXIgbWFyZ2luID0gLShvLndpZHRoICsgby5sZW5ndGgpICogby5zY2FsZSAqIDIgKyAncHgnXG4gICAgICAgICwgZyA9IGNzcyhncnAoKSwge3Bvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6IG1hcmdpbiwgbGVmdDogbWFyZ2lufSlcbiAgICAgICAgLCBpXG5cbiAgICAgIGZ1bmN0aW9uIHNlZyAoaSwgZHgsIGZpbHRlcikge1xuICAgICAgICBpbnMoXG4gICAgICAgICAgZ1xuICAgICAgICAsIGlucyhcbiAgICAgICAgICAgIGNzcyhncnAoKSwge3JvdGF0aW9uOiAzNjAgLyBvLmxpbmVzICogaSArICdkZWcnLCBsZWZ0OiB+fmR4fSlcbiAgICAgICAgICAsIGlucyhcbiAgICAgICAgICAgICAgY3NzKFxuICAgICAgICAgICAgICAgIHZtbCgncm91bmRyZWN0Jywge2FyY3NpemU6IG8uY29ybmVyc30pXG4gICAgICAgICAgICAgICwgeyB3aWR0aDogclxuICAgICAgICAgICAgICAgICwgaGVpZ2h0OiBvLnNjYWxlICogby53aWR0aFxuICAgICAgICAgICAgICAgICwgbGVmdDogby5zY2FsZSAqIG8ucmFkaXVzXG4gICAgICAgICAgICAgICAgLCB0b3A6IC1vLnNjYWxlICogby53aWR0aCA+PiAxXG4gICAgICAgICAgICAgICAgLCBmaWx0ZXI6IGZpbHRlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgLCB2bWwoJ2ZpbGwnLCB7Y29sb3I6IGdldENvbG9yKG8uY29sb3IsIGkpLCBvcGFjaXR5OiBvLm9wYWNpdHl9KVxuICAgICAgICAgICAgLCB2bWwoJ3N0cm9rZScsIHtvcGFjaXR5OiAwfSkgLy8gdHJhbnNwYXJlbnQgc3Ryb2tlIHRvIGZpeCBjb2xvciBibGVlZGluZyB1cG9uIG9wYWNpdHkgY2hhbmdlXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIGlmIChvLnNoYWRvdylcbiAgICAgICAgZm9yIChpID0gMTsgaSA8PSBvLmxpbmVzOyBpKyspIHtcbiAgICAgICAgICBzZWcoaSwgLTIsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuQmx1cihwaXhlbHJhZGl1cz0yLG1ha2VzaGFkb3c9MSxzaGFkb3dvcGFjaXR5PS4zKScpXG4gICAgICAgIH1cblxuICAgICAgZm9yIChpID0gMTsgaSA8PSBvLmxpbmVzOyBpKyspIHNlZyhpKVxuICAgICAgcmV0dXJuIGlucyhlbCwgZylcbiAgICB9XG5cbiAgICBTcGlubmVyLnByb3RvdHlwZS5vcGFjaXR5ID0gZnVuY3Rpb24gKGVsLCBpLCB2YWwsIG8pIHtcbiAgICAgIHZhciBjID0gZWwuZmlyc3RDaGlsZFxuICAgICAgbyA9IG8uc2hhZG93ICYmIG8ubGluZXMgfHwgMFxuICAgICAgaWYgKGMgJiYgaSArIG8gPCBjLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIGMgPSBjLmNoaWxkTm9kZXNbaSArIG9dOyBjID0gYyAmJiBjLmZpcnN0Q2hpbGQ7IGMgPSBjICYmIGMuZmlyc3RDaGlsZFxuICAgICAgICBpZiAoYykgYy5vcGFjaXR5ID0gdmFsXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzaGVldCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZWwgPSBjcmVhdGVFbCgnc3R5bGUnLCB7dHlwZSA6ICd0ZXh0L2Nzcyd9KVxuICAgICAgaW5zKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sIGVsKVxuICAgICAgcmV0dXJuIGVsLnNoZWV0IHx8IGVsLnN0eWxlU2hlZXRcbiAgICB9KCkpXG5cbiAgICB2YXIgcHJvYmUgPSBjc3MoY3JlYXRlRWwoJ2dyb3VwJyksIHtiZWhhdmlvcjogJ3VybCgjZGVmYXVsdCNWTUwpJ30pXG5cbiAgICBpZiAoIXZlbmRvcihwcm9iZSwgJ3RyYW5zZm9ybScpICYmIHByb2JlLmFkaikgaW5pdFZNTCgpXG4gICAgZWxzZSB1c2VDc3NBbmltYXRpb25zID0gdmVuZG9yKHByb2JlLCAnYW5pbWF0aW9uJylcbiAgfVxuXG4gIHJldHVybiBTcGlubmVyXG5cbn0pKTtcbiIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyZWR1Y2UnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdCA9ICd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3dcbiAgPyB0aGlzXG4gIDogd2luZG93O1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe307XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogVE9ETzogZnV0dXJlIHByb29mLCBtb3ZlIHRvIGNvbXBvZW50IGxhbmRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNIb3N0KG9iaikge1xuICB2YXIgc3RyID0ge30udG9TdHJpbmcuY2FsbChvYmopO1xuXG4gIHN3aXRjaCAoc3RyKSB7XG4gICAgY2FzZSAnW29iamVjdCBGaWxlXSc6XG4gICAgY2FzZSAnW29iamVjdCBCbG9iXSc6XG4gICAgY2FzZSAnW29iamVjdCBGb3JtRGF0YV0nOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxuZnVuY3Rpb24gZ2V0WEhSKCkge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdFxuICAgICYmICgnZmlsZTonICE9IHJvb3QubG9jYXRpb24ucHJvdG9jb2wgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSwgYWRkZWQgdG8gc3VwcG9ydCBJRS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIHRyaW0gPSAnJy50cmltXG4gID8gZnVuY3Rpb24ocykgeyByZXR1cm4gcy50cmltKCk7IH1cbiAgOiBmdW5jdGlvbihzKSB7IHJldHVybiBzLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZywgJycpOyB9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgZ2l2ZW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VyaWFsaXplKG9iaikge1xuICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gIHZhciBwYWlycyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKG51bGwgIT0gb2JqW2tleV0pIHtcbiAgICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSlcbiAgICAgICAgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2tleV0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0ID0gc2VyaWFsaXplO1xuXG4gLyoqXG4gICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICogQGFwaSBwcml2YXRlXG4gICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgnJicpO1xuICB2YXIgcGFydHM7XG4gIHZhciBwYWlyO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICBwYXJ0cyA9IHBhaXIuc3BsaXQoJz0nKTtcbiAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBFeHBvc2UgcGFyc2VyLlxuICovXG5cbnJlcXVlc3QucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcblxuLyoqXG4gKiBEZWZhdWx0IE1JTUUgdHlwZSBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICovXG5cbnJlcXVlc3QudHlwZXMgPSB7XG4gIGh0bWw6ICd0ZXh0L2h0bWwnLFxuICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gIHhtbDogJ2FwcGxpY2F0aW9uL3htbCcsXG4gIHVybGVuY29kZWQ6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybS1kYXRhJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbi8qKlxuICogRGVmYXVsdCBzZXJpYWxpemF0aW9uIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ob2JqKXtcbiAqICAgICAgIHJldHVybiAnZ2VuZXJhdGVkIHhtbCBoZXJlJztcbiAqICAgICB9O1xuICpcbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemUgPSB7XG4gICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogc2VyaWFsaXplLFxuICAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnN0cmluZ2lmeVxuIH07XG5cbiAvKipcbiAgKiBEZWZhdWx0IHBhcnNlcnMuXG4gICpcbiAgKiAgICAgc3VwZXJhZ2VudC5wYXJzZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihzdHIpe1xuICAqICAgICAgIHJldHVybiB7IG9iamVjdCBwYXJzZWQgZnJvbSBzdHIgfTtcbiAgKiAgICAgfTtcbiAgKlxuICAqL1xuXG5yZXF1ZXN0LnBhcnNlID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcGFyc2VTdHJpbmcsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5wYXJzZVxufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gaGVhZGVyIGBzdHJgIGludG9cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtYXBwZWQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyKHN0cikge1xuICB2YXIgbGluZXMgPSBzdHIuc3BsaXQoL1xccj9cXG4vKTtcbiAgdmFyIGZpZWxkcyA9IHt9O1xuICB2YXIgaW5kZXg7XG4gIHZhciBsaW5lO1xuICB2YXIgZmllbGQ7XG4gIHZhciB2YWw7XG5cbiAgbGluZXMucG9wKCk7IC8vIHRyYWlsaW5nIENSTEZcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBsaW5lID0gbGluZXNbaV07XG4gICAgaW5kZXggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBmaWVsZCA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdHJpbShsaW5lLnNsaWNlKGluZGV4ICsgMSkpO1xuICAgIGZpZWxkc1tmaWVsZF0gPSB2YWw7XG4gIH1cblxuICByZXR1cm4gZmllbGRzO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJhbXMoc3RyKXtcbiAgcmV0dXJuIHJlZHVjZShzdHIuc3BsaXQoLyAqOyAqLyksIGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLylcbiAgICAgICwga2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgLCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICB0aGlzLnRleHQgPSB0aGlzLnJlcS5tZXRob2QgIT0nSEVBRCcgXG4gICAgID8gdGhpcy54aHIucmVzcG9uc2VUZXh0IFxuICAgICA6IG51bGw7XG4gIHRoaXMuc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG4gIHRoaXMuYm9keSA9IHRoaXMucmVxLm1ldGhvZCAhPSAnSEVBRCdcbiAgICA/IHRoaXMucGFyc2VCb2R5KHRoaXMudGV4dClcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2UgJiYgc3RyICYmIHN0ci5sZW5ndGhcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzIHx8IDEyMjMgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBFbWl0dGVyLmNhbGwodGhpcyk7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTtcbiAgdGhpcy5faGVhZGVyID0ge307XG4gIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGVyciA9IG51bGw7XG4gICAgdmFyIHJlcyA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpOyBcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGVyciA9IG5ldyBFcnJvcignUGFyc2VyIGlzIHVuYWJsZSB0byBwYXJzZSB0aGUgcmVzcG9uc2UnKTtcbiAgICAgIGVyci5wYXJzZSA9IHRydWU7XG4gICAgICBlcnIub3JpZ2luYWwgPSBlO1xuICAgIH1cblxuICAgIHNlbGYuY2FsbGJhY2soZXJyLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKG5hbWUsIHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgZmlsZW5hbWVgLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmF0dGFjaChuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbihmaWVsZCwgZmlsZSwgZmlsZW5hbWUpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQoZmllbGQsIGZpbGUsIGZpbGVuYW1lKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNlbmQgYGRhdGFgLCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIHF1ZXJ5c3RyaW5nXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbXVsdGlwbGUgZGF0YSBcIndyaXRlc1wiXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5zZW5kKHsgc2VhcmNoOiAncXVlcnknIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgcmFuZ2U6ICcxLi41JyB9KVxuICogICAgICAgICAuc2VuZCh7IG9yZGVyOiAnZGVzYycgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAgKiAgICAgICAgLnNlbmQoJ25hbWU9dG9iaScpXG4gICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgb2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuXG4gIC8vIG1lcmdlXG4gIGlmIChvYmogJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgIH1cbiAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgZGF0YSkge1xuICAgIGlmICghdHlwZSkgdGhpcy50eXBlKCdmb3JtJyk7XG4gICAgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAoJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgPT0gdHlwZSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RhdGFcbiAgICAgICAgPyB0aGlzLl9kYXRhICsgJyYnICsgZGF0YVxuICAgICAgICA6IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RhdGEgPSAodGhpcy5fZGF0YSB8fCAnJykgKyBkYXRhO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgfVxuXG4gIGlmICghb2JqKSByZXR1cm4gdGhpcztcbiAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2pzb24nKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBgZXJyYCBhbmQgYHJlc2BcbiAqIGFuZCBoYW5kbGUgYXJpdHkgY2hlY2suXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24oZXJyLCByZXMpe1xuICB2YXIgZm4gPSB0aGlzLl9jYWxsYmFjaztcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgaWYgKDIgPT0gZm4ubGVuZ3RoKSByZXR1cm4gZm4oZXJyLCByZXMpO1xuICBpZiAoZXJyKSByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gIGZuKHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0RXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3RpbWVvdXQgb2YgJyArIHRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnKTtcbiAgZXJyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndpdGhDcmVkZW50aWFscyA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB4aHIgPSB0aGlzLnhociA9IGdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcbiAgICBpZiAoMCA9PSB4aHIuc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm4gc2VsZi50aW1lb3V0RXJyb3IoKTtcbiAgICAgIHJldHVybiBzZWxmLmNyb3NzRG9tYWluRXJyb3IoKTtcbiAgICB9XG4gICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgfTtcblxuICAvLyBwcm9ncmVzc1xuICBpZiAoeGhyLnVwbG9hZCkge1xuICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICAgIH07XG4gIH1cblxuICAvLyB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCdHRVQnICE9IHRoaXMubWV0aG9kICYmICdIRUFEJyAhPSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSAmJiAhaXNIb3N0KGRhdGEpKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgdmFyIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplW3RoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKV07XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG4gIHhoci5zZW5kKGRhdGEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5yZXF1ZXN0LlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIElzc3VlIGEgcmVxdWVzdDpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICByZXF1ZXN0KCdHRVQnLCAnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJywgY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHVybCBvciBjYWxsYmFja1xuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmhlYWQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZGVsID0gZnVuY3Rpb24odXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHNlbGYub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIG9uLmZuID0gZm47XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2I7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xufTtcbiIsIlxuLyoqXG4gKiBSZWR1Y2UgYGFycmAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TWl4ZWR9IGluaXRpYWxcbiAqXG4gKiBUT0RPOiBjb21iYXRpYmxlIGVycm9yIGhhbmRsaW5nP1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbiwgaW5pdGlhbCl7ICBcbiAgdmFyIGlkeCA9IDA7XG4gIHZhciBsZW4gPSBhcnIubGVuZ3RoO1xuICB2YXIgY3VyciA9IGFyZ3VtZW50cy5sZW5ndGggPT0gM1xuICAgID8gaW5pdGlhbFxuICAgIDogYXJyW2lkeCsrXTtcblxuICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgY3VyciA9IGZuLmNhbGwobnVsbCwgY3VyciwgYXJyW2lkeF0sICsraWR4LCBhcnIpO1xuICB9XG4gIFxuICByZXR1cm4gY3Vycjtcbn07IiwidmFyIEtlZW4gPSByZXF1aXJlKFwiLi9pbmRleFwiKSxcbiAgICBlYWNoID0gcmVxdWlyZShcIi4vdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgbG9hZGVkID0gd2luZG93WydLZWVuJ10gfHwgbnVsbCxcbiAgICAgIGNhY2hlZCA9IHdpbmRvd1snXycgKyAnS2VlbiddIHx8IG51bGwsXG4gICAgICBjbGllbnRzLFxuICAgICAgcmVhZHk7XG5cbiAgaWYgKGxvYWRlZCAmJiBjYWNoZWQpIHtcbiAgICBjbGllbnRzID0gY2FjaGVkWydjbGllbnRzJ10gfHwge30sXG4gICAgcmVhZHkgPSBjYWNoZWRbJ3JlYWR5J10gfHwgW107XG5cbiAgICBlYWNoKGNsaWVudHMsIGZ1bmN0aW9uKGNsaWVudCwgaWQpe1xuXG4gICAgICBlYWNoKEtlZW4ucHJvdG90eXBlLCBmdW5jdGlvbihtZXRob2QsIGtleSl7XG4gICAgICAgIGxvYWRlZC5wcm90b3R5cGVba2V5XSA9IG1ldGhvZDtcbiAgICAgIH0pO1xuXG4gICAgICBlYWNoKFtcIlF1ZXJ5XCIsIFwiUmVxdWVzdFwiLCBcIkRhdGFzZXRcIiwgXCJEYXRhdml6XCJdLCBmdW5jdGlvbihuYW1lKXtcbiAgICAgICAgbG9hZGVkW25hbWVdID0gKEtlZW5bbmFtZV0pID8gS2VlbltuYW1lXSA6IGZ1bmN0aW9uKCl7fTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBSdW4gY29uZmlnXG4gICAgICBpZiAoY2xpZW50Ll9jb25maWcpIHtcbiAgICAgICAgY2xpZW50LmNvbmZpZ3VyZS5jYWxsKGNsaWVudCwgY2xpZW50Ll9jb25maWcpO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgR2xvYmFsIFByb3BlcnRpZXNcbiAgICAgIGlmIChjbGllbnQuX3NldEdsb2JhbFByb3BlcnRpZXMpIHtcbiAgICAgICAgZWFjaChjbGllbnQuX3NldEdsb2JhbFByb3BlcnRpZXMsIGZ1bmN0aW9uKGZuKXtcbiAgICAgICAgICBjbGllbnQuc2V0R2xvYmFsUHJvcGVydGllcy5hcHBseShjbGllbnQsIGZuKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNlbmQgUXVldWVkIEV2ZW50c1xuICAgICAgaWYgKGNsaWVudC5fYWRkRXZlbnQpIHtcbiAgICAgICAgZWFjaChjbGllbnQuX2FkZEV2ZW50LCBmdW5jdGlvbihvYmope1xuICAgICAgICAgIGNsaWVudC5hZGRFdmVudC5hcHBseShjbGllbnQsIG9iaik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBTZXQgZXZlbnQgbGlzdGVuZXJzXG4gICAgICB2YXIgY2FsbGJhY2sgPSBjbGllbnQuX29uIHx8IFtdO1xuICAgICAgaWYgKGNsaWVudC5fb24pIHtcbiAgICAgICAgZWFjaChjbGllbnQuX29uLCBmdW5jdGlvbihvYmope1xuICAgICAgICAgIGNsaWVudC5vbi5hcHBseShjbGllbnQsIG9iaik7XG4gICAgICAgIH0pO1xuICAgICAgICBjbGllbnQudHJpZ2dlcigncmVhZHknKTtcbiAgICAgIH1cblxuICAgICAgLy8gdW5zZXQgY29uZmlnXG4gICAgICBlYWNoKFtcIl9jb25maWdcIiwgXCJfc2V0R2xvYmFsUHJvcGVydGllc1wiLCBcIl9hZGRFdmVudFwiLCBcIl9vblwiXSwgZnVuY3Rpb24obmFtZSl7XG4gICAgICAgIGlmIChjbGllbnRbbmFtZV0pIHtcbiAgICAgICAgICBjbGllbnRbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgZGVsZXRlIGNsaWVudFtuYW1lXTtcbiAgICAgICAgICB9IGNhdGNoKGUpe31cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIGVhY2gocmVhZHksIGZ1bmN0aW9uKGNiLCBpKXtcbiAgICAgIEtlZW4ub25jZShcInJlYWR5XCIsIGNiKTtcbiAgICB9KTtcbiAgfVxuXG4gIHdpbmRvd1snXycgKyAnS2VlbiddID0gdW5kZWZpbmVkO1xuICB0cnkge1xuICAgIGRlbGV0ZSB3aW5kb3dbJ18nICsgJ0tlZW4nXVxuICB9IGNhdGNoKGUpIHt9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gXCJ1bmRlZmluZWRcIiA9PSB0eXBlb2Ygd2luZG93ID8gXCJzZXJ2ZXJcIiA6IFwiYnJvd3NlclwiO1xufTtcbiIsInZhciBlYWNoID0gcmVxdWlyZSgnLi4vdXRpbHMvZWFjaCcpLFxuICAgIGpzb24gPSByZXF1aXJlKCcuLi91dGlscy9qc29uLXNoaW0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwYXJhbXMpe1xuICB2YXIgcXVlcnkgPSBbXTtcbiAgZWFjaChwYXJhbXMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuICAgIC8vIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICE9PSAnW29iamVjdCBTdHJpbmddJykge31cbiAgICBpZiAoJ3N0cmluZycgIT09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBqc29uLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgfVxuICAgIHF1ZXJ5LnB1c2goa2V5ICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gIH0pO1xuICByZXR1cm4gJz8nICsgcXVlcnkuam9pbignJicpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZXpvbmVPZmZzZXQoKSAqIC02MDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIGlmIChcInVuZGVmaW5lZFwiICE9PSB0eXBlb2Ygd2luZG93KSB7XG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTVNJRScpICE9PSAtMSB8fCBuYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKCdUcmlkZW50LycpID4gMCkge1xuICAgICAgcmV0dXJuIDIwMDA7XG4gICAgfVxuICB9XG4gIHJldHVybiAxNjAwMDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAvLyB5YXksIHN1cGVyYWdlbnQhXG4gIHZhciByb290ID0gXCJ1bmRlZmluZWRcIiA9PSB0eXBlb2Ygd2luZG93ID8gdGhpcyA6IHdpbmRvdztcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3QgJiYgKFwiZmlsZTpcIiAhPSByb290LmxvY2F0aW9uLnByb3RvY29sIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1zeG1sMi5YTUxIVFRQLjYuMFwiKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1zeG1sMi5YTUxIVFRQLjMuMFwiKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1zeG1sMi5YTUxIVFRQXCIpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXJyLCByZXMsIGNhbGxiYWNrKSB7XG4gIHZhciBjYiA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKCkge307XG4gIGlmIChyZXMgJiYgIXJlcy5vaykge1xuICAgIHZhciBpc19lcnIgPSByZXMuYm9keSAmJiByZXMuYm9keS5lcnJvcl9jb2RlO1xuICAgIGVyciA9IG5ldyBFcnJvcihpc19lcnIgPyByZXMuYm9keS5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnKTtcbiAgICBlcnIuY29kZSA9IGlzX2VyciA/IHJlcy5ib2R5LmVycm9yX2NvZGUgOiAnVW5rbm93bkVycm9yJztcbiAgfVxuICBpZiAoZXJyKSB7XG4gICAgY2IoZXJyLCBudWxsKTtcbiAgfVxuICBlbHNlIHtcbiAgICBjYihudWxsLCByZXMuYm9keSk7XG4gIH1cbiAgcmV0dXJuO1xufTtcbiIsInZhciBzdXBlcmFnZW50ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xudmFyIGVhY2ggPSByZXF1aXJlKCcuLi91dGlscy9lYWNoJyksXG4gICAgZ2V0WEhSID0gcmVxdWlyZSgnLi9nZXQteGhyLW9iamVjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHR5cGUsIG9wdHMpe1xuICByZXR1cm4gZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHZhciBfX3N1cGVyX18gPSByZXF1ZXN0LmNvbnN0cnVjdG9yLnByb3RvdHlwZS5lbmQ7XG4gICAgaWYgKCAndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHdpbmRvdyApIHJldHVybjtcbiAgICByZXF1ZXN0LnJlcXVlc3RUeXBlID0gcmVxdWVzdC5yZXF1ZXN0VHlwZSB8fCB7fTtcbiAgICByZXF1ZXN0LnJlcXVlc3RUeXBlWyd0eXBlJ10gPSB0eXBlO1xuICAgIHJlcXVlc3QucmVxdWVzdFR5cGVbJ29wdGlvbnMnXSA9IHJlcXVlc3QucmVxdWVzdFR5cGVbJ29wdGlvbnMnXSB8fCB7XG4gICAgICAvLyBUT0RPOiBmaW5kIGFjY2VwdGFibGUgZGVmYXVsdCB2YWx1ZXNcbiAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgc3VjY2Vzczoge1xuICAgICAgICByZXNwb25zZVRleHQ6ICd7IFwiY3JlYXRlZFwiOiB0cnVlIH0nLFxuICAgICAgICBzdGF0dXM6IDIwMVxuICAgICAgfSxcbiAgICAgIGVycm9yOiB7XG4gICAgICAgIHJlc3BvbnNlVGV4dDogJ3sgXCJlcnJvcl9jb2RlXCI6IFwiRVJST1JcIiwgXCJtZXNzYWdlXCI6IFwiUmVxdWVzdCBmYWlsZWRcIiB9JyxcbiAgICAgICAgc3RhdHVzOiA0MDRcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQXBwbHkgb3B0aW9uc1xuICAgIGlmIChvcHRzKSB7XG4gICAgICBpZiAoICdib29sZWFuJyA9PT0gdHlwZW9mIG9wdHMuYXN5bmMgKSB7XG4gICAgICAgIHJlcXVlc3QucmVxdWVzdFR5cGVbJ29wdGlvbnMnXS5hc3luYyA9IG9wdHMuYXN5bmM7XG4gICAgICB9XG4gICAgICBpZiAoIG9wdHMuc3VjY2VzcyApIHtcbiAgICAgICAgZXh0ZW5kKHJlcXVlc3QucmVxdWVzdFR5cGVbJ29wdGlvbnMnXS5zdWNjZXNzLCBvcHRzLnN1Y2Nlc3MpO1xuICAgICAgfVxuICAgICAgaWYgKCBvcHRzLmVycm9yICkge1xuICAgICAgICBleHRlbmQocmVxdWVzdC5yZXF1ZXN0VHlwZVsnb3B0aW9ucyddLmVycm9yLCBvcHRzLmVycm9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXF1ZXN0LmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICByZXFUeXBlID0gKHRoaXMucmVxdWVzdFR5cGUpID8gdGhpcy5yZXF1ZXN0VHlwZVsndHlwZSddIDogJ3hocicsXG4gICAgICAgICAgcXVlcnksXG4gICAgICAgICAgdGltZW91dDtcblxuICAgICAgaWYgKCAoJ0dFVCcgIT09IHNlbGZbJ21ldGhvZCddIHx8ICd4aHInID09PSByZXFUeXBlKSAmJiBzZWxmLnJlcXVlc3RUeXBlWydvcHRpb25zJ10uYXN5bmMgKSB7XG4gICAgICAgIF9fc3VwZXJfXy5jYWxsKHNlbGYsIGZuKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBxdWVyeSA9IHNlbGYuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgICAgIHRpbWVvdXQgPSBzZWxmLl90aW1lb3V0O1xuICAgICAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgICAgIHNlbGYuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcbiAgICAgIC8vIHRpbWVvdXRcbiAgICAgIGlmICh0aW1lb3V0ICYmICFzZWxmLl90aW1lcikge1xuICAgICAgICBzZWxmLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBhYm9ydFJlcXVlc3QuY2FsbChzZWxmKTtcbiAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICB9XG4gICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgcXVlcnkgPSBzdXBlcmFnZW50LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgICAgIHNlbGYudXJsICs9IH5zZWxmLnVybC5pbmRleE9mKCc/JykgPyAnJicgKyBxdWVyeSA6ICc/JyArIHF1ZXJ5O1xuICAgICAgfVxuICAgICAgLy8gc2VuZCBzdHVmZlxuICAgICAgc2VsZi5lbWl0KCdyZXF1ZXN0Jywgc2VsZik7XG5cbiAgICAgIGlmICggIXNlbGYucmVxdWVzdFR5cGVbJ29wdGlvbnMnXS5hc3luYyApIHtcbiAgICAgICAgc2VuZFhoclN5bmMuY2FsbChzZWxmKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCAnanNvbnAnID09PSByZXFUeXBlICkge1xuICAgICAgICBzZW5kSnNvbnAuY2FsbChzZWxmKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCAnYmVhY29uJyA9PT0gcmVxVHlwZSApIHtcbiAgICAgICAgc2VuZEJlYWNvbi5jYWxsKHNlbGYpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcbiAgICByZXR1cm4gcmVxdWVzdDtcbiAgfTtcbn07XG5cbmZ1bmN0aW9uIHNlbmRYaHJTeW5jKCl7XG4gIHZhciB4aHIgPSBnZXRYSFIoKTtcbiAgaWYgKHhocikge1xuICAgIHhoci5vcGVuKCdHRVQnLCB0aGlzLnVybCwgZmFsc2UpO1xuICAgIHhoci5zZW5kKG51bGwpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG5mdW5jdGlvbiBzZW5kSnNvbnAoKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSxcbiAgICAgIHBhcmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICBjYWxsYmFja05hbWUgPSAna2VlbkpTT05QQ2FsbGJhY2snLFxuICAgICAgbG9hZGVkID0gZmFsc2U7XG4gIGNhbGxiYWNrTmFtZSArPSB0aW1lc3RhbXA7XG4gIHdoaWxlIChjYWxsYmFja05hbWUgaW4gd2luZG93KSB7XG4gICAgY2FsbGJhY2tOYW1lICs9ICdhJztcbiAgfVxuICB3aW5kb3dbY2FsbGJhY2tOYW1lXSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgaWYgKGxvYWRlZCA9PT0gdHJ1ZSkgcmV0dXJuO1xuICAgIGxvYWRlZCA9IHRydWU7XG4gICAgaGFuZGxlU3VjY2Vzcy5jYWxsKHNlbGYsIHJlc3BvbnNlKTtcbiAgICBjbGVhbnVwKCk7XG4gIH07XG4gIHNjcmlwdC5zcmMgPSBzZWxmLnVybCArICcmanNvbnA9JyArIGNhbGxiYWNrTmFtZTtcbiAgcGFyZW50LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIC8vIGZvciBlYXJseSBJRSB3LyBubyBvbmVycm9yIGV2ZW50XG4gIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAobG9hZGVkID09PSBmYWxzZSAmJiBzZWxmLnJlYWR5U3RhdGUgPT09ICdsb2FkZWQnKSB7XG4gICAgICBsb2FkZWQgPSB0cnVlO1xuICAgICAgaGFuZGxlRXJyb3IuY2FsbChzZWxmKTtcbiAgICAgIGNsZWFudXAoKTtcbiAgICB9XG4gIH07XG4gIC8vIG5vbi1pZSwgZXRjXG4gIHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gb24gSUU5IGJvdGggb25lcnJvciBhbmQgb25yZWFkeXN0YXRlY2hhbmdlIGFyZSBjYWxsZWRcbiAgICBpZiAobG9hZGVkID09PSBmYWxzZSkge1xuICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgIGhhbmRsZUVycm9yLmNhbGwoc2VsZik7XG4gICAgICBjbGVhbnVwKCk7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBjbGVhbnVwKCl7XG4gICAgd2luZG93W2NhbGxiYWNrTmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgdHJ5IHtcbiAgICAgIGRlbGV0ZSB3aW5kb3dbY2FsbGJhY2tOYW1lXTtcbiAgICB9IGNhdGNoKGUpe31cbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZW5kQmVhY29uKCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpLFxuICAgICAgbG9hZGVkID0gZmFsc2U7XG4gIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBsb2FkZWQgPSB0cnVlO1xuICAgIGlmICgnbmF0dXJhbEhlaWdodCcgaW4gdGhpcykge1xuICAgICAgaWYgKHRoaXMubmF0dXJhbEhlaWdodCArIHRoaXMubmF0dXJhbFdpZHRoID09PSAwKSB7XG4gICAgICAgIHRoaXMub25lcnJvcigpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLndpZHRoICsgdGhpcy5oZWlnaHQgPT09IDApIHtcbiAgICAgIHRoaXMub25lcnJvcigpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBoYW5kbGVTdWNjZXNzLmNhbGwoc2VsZik7XG4gIH07XG4gIGltZy5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgbG9hZGVkID0gdHJ1ZTtcbiAgICBoYW5kbGVFcnJvci5jYWxsKHNlbGYpO1xuICB9O1xuICBpbWcuc3JjID0gc2VsZi51cmwgKyAnJmM9Y2x2MSc7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVN1Y2Nlc3MocmVzKXtcbiAgdmFyIG9wdHMgPSB0aGlzLnJlcXVlc3RUeXBlWydvcHRpb25zJ11bJ3N1Y2Nlc3MnXSxcbiAgICAgIHJlc3BvbnNlID0gJyc7XG4gIHhoclNoaW0uY2FsbCh0aGlzLCBvcHRzKTtcbiAgaWYgKHJlcykge1xuICAgIHRyeSB7XG4gICAgICByZXNwb25zZSA9IEpTT04uc3RyaW5naWZ5KHJlcyk7XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG4gIGVsc2Uge1xuICAgIHJlc3BvbnNlID0gb3B0c1sncmVzcG9uc2VUZXh0J107XG4gIH1cbiAgdGhpcy54aHIucmVzcG9uc2VUZXh0ID0gcmVzcG9uc2U7XG4gIHRoaXMueGhyLnN0YXR1cyA9IG9wdHNbJ3N0YXR1cyddO1xuICB0aGlzLmVtaXQoJ2VuZCcpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVFcnJvcigpe1xuICB2YXIgb3B0cyA9IHRoaXMucmVxdWVzdFR5cGVbJ29wdGlvbnMnXVsnZXJyb3InXTtcbiAgeGhyU2hpbS5jYWxsKHRoaXMsIG9wdHMpO1xuICB0aGlzLnhoci5yZXNwb25zZVRleHQgPSBvcHRzWydyZXNwb25zZVRleHQnXTtcbiAgdGhpcy54aHIuc3RhdHVzID0gb3B0c1snc3RhdHVzJ107XG4gIHRoaXMuZW1pdCgnZW5kJyk7XG59XG5cbi8vIGN1c3RvbSBzcGluIG9uIHNlbGYuYWJvcnQoKTtcbmZ1bmN0aW9uIGFib3J0UmVxdWVzdCgpe1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG59XG5cbi8vIGhhY2tldHkgaGFjayBoYWNrIDopIGtlZXAgbW92aW5nXG5mdW5jdGlvbiB4aHJTaGltKG9wdHMpe1xuICB0aGlzLnhociA9IHtcbiAgICBnZXRBbGxSZXNwb25zZUhlYWRlcnM6IGZ1bmN0aW9uKCl7IHJldHVybiAnJzsgfSxcbiAgICBnZXRSZXNwb25zZUhlYWRlcjogZnVuY3Rpb24oKXsgcmV0dXJuICdhcHBsaWNhdGlvbi9qc29uJzsgfSxcbiAgICByZXNwb25zZVRleHQ6IG9wdHNbJ3Jlc3BvbnNlVGV4dCddLFxuICAgIHN0YXR1czogb3B0c1snc3RhdHVzJ11cbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJ2YXIgcm9vdCA9ICd1bmRlZmluZWQnICE9PSB0eXBlb2Ygd2luZG93ID8gd2luZG93IDogdGhpcztcbnZhciBwcmV2aW91c19LZWVuID0gcm9vdC5LZWVuO1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJy4vdXRpbHMvZW1pdHRlci1zaGltJyk7XG5cbmZ1bmN0aW9uIEtlZW4oY29uZmlnKSB7XG4gIHRoaXMuY29uZmlndXJlKGNvbmZpZyB8fCB7fSk7XG4gIEtlZW4udHJpZ2dlcignY2xpZW50JywgdGhpcyk7XG59XG5cbktlZW4uZGVidWcgPSBmYWxzZTtcbktlZW4uZW5hYmxlZCA9IHRydWU7XG5LZWVuLmxvYWRlZCA9IHRydWU7XG5LZWVuLnZlcnNpb24gPSAnMC4yLjEnO1xuXG5FbWl0dGVyKEtlZW4pO1xuRW1pdHRlcihLZWVuLnByb3RvdHlwZSk7XG5cbktlZW4ucHJvdG90eXBlLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uKGNmZyl7XG4gIHZhciBjb25maWcgPSBjZmcgfHwge307XG4gIGlmIChjb25maWdbJ2hvc3QnXSkge1xuICAgIGNvbmZpZ1snaG9zdCddLnJlcGxhY2UoLy4qPzpcXC9cXC8vZywgJycpO1xuICB9XG4gIGlmIChjb25maWcucHJvdG9jb2wgJiYgY29uZmlnLnByb3RvY29sID09PSAnYXV0bycpIHtcbiAgICBjb25maWdbJ3Byb3RvY29sJ10gPSBsb2NhdGlvbi5wcm90b2NvbC5yZXBsYWNlKC86L2csICcnKTtcbiAgfVxuICB0aGlzLmNvbmZpZyA9IHtcbiAgICBwcm9qZWN0SWQgICA6IGNvbmZpZy5wcm9qZWN0SWQsXG4gICAgd3JpdGVLZXkgICAgOiBjb25maWcud3JpdGVLZXksXG4gICAgcmVhZEtleSAgICAgOiBjb25maWcucmVhZEtleSxcbiAgICBtYXN0ZXJLZXkgICA6IGNvbmZpZy5tYXN0ZXJLZXksXG4gICAgcmVxdWVzdFR5cGUgOiBjb25maWcucmVxdWVzdFR5cGUgfHwgJ2pzb25wJyxcbiAgICBob3N0ICAgICAgICA6IGNvbmZpZ1snaG9zdCddICAgICB8fCAnYXBpLmtlZW4uaW8vMy4wJyxcbiAgICBwcm90b2NvbCAgICA6IGNvbmZpZ1sncHJvdG9jb2wnXSB8fCAnaHR0cHMnLFxuICAgIGdsb2JhbFByb3BlcnRpZXM6IG51bGxcbiAgfTtcbiAgaWYgKEtlZW4uZGVidWcpIHtcbiAgICB0aGlzLm9uKCdlcnJvcicsIEtlZW4ubG9nKTtcbiAgfVxuICB0aGlzLnRyaWdnZXIoJ3JlYWR5Jyk7XG59O1xuXG5LZWVuLnByb3RvdHlwZS5wcm9qZWN0SWQgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLmNvbmZpZy5wcm9qZWN0SWQ7XG4gIHRoaXMuY29uZmlnLnByb2plY3RJZCA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbktlZW4ucHJvdG90eXBlLm1hc3RlcktleSA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuY29uZmlnLm1hc3RlcktleTtcbiAgdGhpcy5jb25maWcubWFzdGVyS2V5ID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuS2Vlbi5wcm90b3R5cGUucmVhZEtleSA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuY29uZmlnLnJlYWRLZXk7XG4gIHRoaXMuY29uZmlnLnJlYWRLZXkgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5LZWVuLnByb3RvdHlwZS53cml0ZUtleSA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuY29uZmlnLndyaXRlS2V5O1xuICB0aGlzLmNvbmZpZy53cml0ZUtleSA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbktlZW4ucHJvdG90eXBlLnVybCA9IGZ1bmN0aW9uKHBhdGgpe1xuICBpZiAoIXRoaXMucHJvamVjdElkKCkpIHtcbiAgICB0aGlzLnRyaWdnZXIoJ2Vycm9yJywgJ0NsaWVudCBpcyBtaXNzaW5nIHByb2plY3RJZCBwcm9wZXJ0eScpO1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gdGhpcy5jb25maWcucHJvdG9jb2wgKyAnOi8vJyArIHRoaXMuY29uZmlnLmhvc3QgKyAnL3Byb2plY3RzLycgKyB0aGlzLnByb2plY3RJZCgpICsgcGF0aDtcbn07XG5cbktlZW4ubG9nID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBpZiAoS2Vlbi5kZWJ1ZyAmJiB0eXBlb2YgY29uc29sZSA9PSAnb2JqZWN0Jykge1xuICAgIGNvbnNvbGUubG9nKCdbS2VlbiBJT10nLCBtZXNzYWdlKTtcbiAgfVxufTtcblxuS2Vlbi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKXtcbiAgcm9vdC5LZWVuID0gcHJldmlvdXNfS2VlbjtcbiAgcmV0dXJuIEtlZW47XG59O1xuXG5LZWVuLnJlYWR5ID0gZnVuY3Rpb24oZm4pe1xuICBpZiAoS2Vlbi5sb2FkZWQpIHtcbiAgICBmbigpO1xuICB9IGVsc2Uge1xuICAgIEtlZW4ub25jZSgncmVhZHknLCBmbik7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gS2VlbjtcbiIsInZhciBqc29uID0gcmVxdWlyZSgnLi4vdXRpbHMvanNvbi1zaGltJyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcblxudmFyIEtlZW4gPSByZXF1aXJlKCcuLi9pbmRleCcpO1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnLi4vdXRpbHMvYmFzZTY0JyksXG4gICAgZWFjaCA9IHJlcXVpcmUoJy4uL3V0aWxzL2VhY2gnKSxcbiAgICBnZXRDb250ZXh0ID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQtY29udGV4dCcpLFxuICAgIGdldFF1ZXJ5U3RyaW5nID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQtcXVlcnktc3RyaW5nJyksXG4gICAgZ2V0VXJsTWF4TGVuZ3RoID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQtdXJsLW1heC1sZW5ndGgnKSxcbiAgICBnZXRYSFIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC14aHItb2JqZWN0JyksXG4gICAgcmVxdWVzdFR5cGVzID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdXBlcmFnZW50LXJlcXVlc3QtdHlwZXMnKSxcbiAgICByZXNwb25zZUhhbmRsZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N1cGVyYWdlbnQtaGFuZGxlLXJlc3BvbnNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgcGF5bG9hZCwgY2FsbGJhY2ssIGFzeW5jKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHVybEJhc2UgPSB0aGlzLnVybCgnL2V2ZW50cy8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGNvbGxlY3Rpb24pKSxcbiAgICAgIHJlcVR5cGUgPSB0aGlzLmNvbmZpZy5yZXF1ZXN0VHlwZSxcbiAgICAgIGRhdGEgPSB7fSxcbiAgICAgIGNiID0gY2FsbGJhY2ssXG4gICAgICBpc0FzeW5jLFxuICAgICAgZ2V0VXJsO1xuXG4gIGlzQXN5bmMgPSAoJ2Jvb2xlYW4nID09PSB0eXBlb2YgYXN5bmMpID8gYXN5bmMgOiB0cnVlO1xuXG4gIGlmICghS2Vlbi5lbmFibGVkKSB7XG4gICAgaGFuZGxlVmFsaWRhdGlvbkVycm9yLmNhbGwoc2VsZiwgJ0tlZW4uZW5hYmxlZCA9IGZhbHNlJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFzZWxmLnByb2plY3RJZCgpKSB7XG4gICAgaGFuZGxlVmFsaWRhdGlvbkVycm9yLmNhbGwoc2VsZiwgJ01pc3NpbmcgcHJvamVjdElkIHByb3BlcnR5Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFzZWxmLndyaXRlS2V5KCkpIHtcbiAgICBoYW5kbGVWYWxpZGF0aW9uRXJyb3IuY2FsbChzZWxmLCAnTWlzc2luZyB3cml0ZUtleSBwcm9wZXJ0eScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghY29sbGVjdGlvbiB8fCB0eXBlb2YgY29sbGVjdGlvbiAhPT0gJ3N0cmluZycpIHtcbiAgICBoYW5kbGVWYWxpZGF0aW9uRXJyb3IuY2FsbChzZWxmLCAnQ29sbGVjdGlvbiBuYW1lIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBBdHRhY2ggcHJvcGVydGllcyBmcm9tIGNsaWVudC5nbG9iYWxQcm9wZXJ0aWVzXG4gIGlmIChzZWxmLmNvbmZpZy5nbG9iYWxQcm9wZXJ0aWVzKSB7XG4gICAgZGF0YSA9IHNlbGYuY29uZmlnLmdsb2JhbFByb3BlcnRpZXMoY29sbGVjdGlvbik7XG4gIH1cbiAgLy8gQXR0YWNoIHByb3BlcnRpZXMgZnJvbSB1c2VyLWRlZmluZWQgZXZlbnRcbiAgZWFjaChwYXlsb2FkLCBmdW5jdGlvbih2YWx1ZSwga2V5KXtcbiAgICBkYXRhW2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gT3ZlcnJpZGUgcmVxVHlwZSBpZiBYSFIgbm90IHN1cHBvcnRlZFxuICBpZiAoICFnZXRYSFIoKSAmJiAneGhyJyA9PT0gcmVxVHlwZSApIHtcbiAgICByZXFUeXBlID0gJ2pzb25wJztcbiAgfVxuXG4gIC8vIFByZS1mbGlnaHQgZm9yIEdFVCByZXF1ZXN0c1xuICBpZiAoICd4aHInICE9PSByZXFUeXBlIHx8ICFpc0FzeW5jICkge1xuICAgIGdldFVybCA9IHByZXBhcmVHZXRSZXF1ZXN0LmNhbGwoc2VsZiwgdXJsQmFzZSwgZGF0YSk7XG4gIH1cblxuICBpZiAoIGdldFVybCAmJiBnZXRDb250ZXh0KCkgPT09ICdicm93c2VyJyApIHtcbiAgICByZXF1ZXN0XG4gICAgICAuZ2V0KGdldFVybClcbiAgICAgIC51c2UocmVxdWVzdFR5cGVzKHJlcVR5cGUsIHsgYXN5bmM6IGlzQXN5bmMgfSkpXG4gICAgICAuZW5kKGhhbmRsZVJlc3BvbnNlKTtcbiAgfVxuICBlbHNlIGlmICggZ2V0WEhSKCkgfHwgZ2V0Q29udGV4dCgpID09PSAnc2VydmVyJyApIHtcbiAgICByZXF1ZXN0XG4gICAgICAucG9zdCh1cmxCYXNlKVxuICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsIHNlbGYud3JpdGVLZXkoKSlcbiAgICAgIC5zZW5kKGRhdGEpXG4gICAgICAuZW5kKGhhbmRsZVJlc3BvbnNlKTtcbiAgfVxuICBlbHNlIHtcbiAgICBzZWxmLnRyaWdnZXIoJ2Vycm9yJywgJ1JlcXVlc3Qgbm90IHNlbnQ6IFVSTCBsZW5ndGggZXhjZWVkcyBjdXJyZW50IGJyb3dzZXIgbGltaXQsIGFuZCBYSFIgKFBPU1QpIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShlcnIsIHJlcyl7XG4gICAgcmVzcG9uc2VIYW5kbGVyKGVyciwgcmVzLCBjYik7XG4gICAgY2IgPSBjYWxsYmFjayA9IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVWYWxpZGF0aW9uRXJyb3IobXNnKXtcbiAgICB2YXIgZXJyID0gJ0V2ZW50IG5vdCByZWNvcmRlZDogJyArIG1zZztcbiAgICBzZWxmLnRyaWdnZXIoJ2Vycm9yJywgZXJyKTtcbiAgICBpZiAoY2IpIHtcbiAgICAgIGNiLmNhbGwoc2VsZiwgZXJyLCBudWxsKTtcbiAgICAgIGNiID0gY2FsbGJhY2sgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybjtcbn07XG5cbmZ1bmN0aW9uIHByZXBhcmVHZXRSZXF1ZXN0KHVybCwgZGF0YSl7XG4gIC8vIFNldCBBUEkga2V5XG4gIHVybCArPSBnZXRRdWVyeVN0cmluZyh7XG4gICAgYXBpX2tleSAgOiB0aGlzLndyaXRlS2V5KCksXG4gICAgZGF0YSAgICAgOiBiYXNlNjQuZW5jb2RlKCBqc29uLnN0cmluZ2lmeShkYXRhKSApLFxuICAgIG1vZGlmaWVkIDogbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgfSk7XG4gIHJldHVybiAoIHVybC5sZW5ndGggPCBnZXRVcmxNYXhMZW5ndGgoKSApID8gdXJsIDogZmFsc2U7XG59XG4iLCJ2YXIgS2VlbiA9IHJlcXVpcmUoJy4uL2luZGV4Jyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcblxudmFyIGVhY2ggPSByZXF1aXJlKCcuLi91dGlscy9lYWNoJyksXG4gICAgZ2V0Q29udGV4dCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LWNvbnRleHQnKSxcbiAgICBnZXRYSFIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC14aHItb2JqZWN0JyksXG4gICAgcmVxdWVzdFR5cGVzID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdXBlcmFnZW50LXJlcXVlc3QtdHlwZXMnKSxcbiAgICByZXNwb25zZUhhbmRsZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N1cGVyYWdlbnQtaGFuZGxlLXJlc3BvbnNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocGF5bG9hZCwgY2FsbGJhY2spIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdXJsQmFzZSA9IHRoaXMudXJsKCcvZXZlbnRzJyksXG4gICAgICBkYXRhID0ge30sXG4gICAgICBjYiA9IGNhbGxiYWNrO1xuXG4gIGlmICghS2Vlbi5lbmFibGVkKSB7XG4gICAgaGFuZGxlVmFsaWRhdGlvbkVycm9yLmNhbGwoc2VsZiwgJ0tlZW4uZW5hYmxlZCA9IGZhbHNlJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFzZWxmLnByb2plY3RJZCgpKSB7XG4gICAgaGFuZGxlVmFsaWRhdGlvbkVycm9yLmNhbGwoc2VsZiwgJ01pc3NpbmcgcHJvamVjdElkIHByb3BlcnR5Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFzZWxmLndyaXRlS2V5KCkpIHtcbiAgICBoYW5kbGVWYWxpZGF0aW9uRXJyb3IuY2FsbChzZWxmLCAnTWlzc2luZyB3cml0ZUtleSBwcm9wZXJ0eScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgIGhhbmRsZVZhbGlkYXRpb25FcnJvci5jYWxsKHNlbGYsICdJbmNvcnJlY3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvICNhZGRFdmVudHMgbWV0aG9kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwYXlsb2FkICE9PSAnb2JqZWN0JyB8fCBwYXlsb2FkIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBoYW5kbGVWYWxpZGF0aW9uRXJyb3IuY2FsbChzZWxmLCAnUmVxdWVzdCBwYXlsb2FkIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQXR0YWNoIHByb3BlcnRpZXMgZnJvbSBjbGllbnQuZ2xvYmFsUHJvcGVydGllc1xuICBpZiAoc2VsZi5jb25maWcuZ2xvYmFsUHJvcGVydGllcykge1xuICAgIC8vIExvb3Agb3ZlciBlYWNoIHNldCBvZiBldmVudHNcbiAgICBlYWNoKHBheWxvYWQsIGZ1bmN0aW9uKGV2ZW50cywgY29sbGVjdGlvbil7XG4gICAgICAvLyBMb29wIG92ZXIgZWFjaCBpbmRpdmlkdWFsIGV2ZW50XG4gICAgICBlYWNoKGV2ZW50cywgZnVuY3Rpb24oYm9keSwgaW5kZXgpe1xuICAgICAgICAvLyBTdGFydCB3aXRoIGdsb2JhbCBwcm9wZXJ0aWVzIGZvciB0aGlzIGNvbGxlY3Rpb25cbiAgICAgICAgdmFyIGJhc2UgPSBzZWxmLmNvbmZpZy5nbG9iYWxQcm9wZXJ0aWVzKGNvbGxlY3Rpb24pO1xuICAgICAgICAvLyBBcHBseSBwcm92aWRlZCBwcm9wZXJ0aWVzIGZvciB0aGlzIGV2ZW50IGJvZHlcbiAgICAgICAgZWFjaChib2R5LCBmdW5jdGlvbih2YWx1ZSwga2V5KXtcbiAgICAgICAgICBiYXNlW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBwYXlsb2FkXG4gICAgICAgIGRhdGFbY29sbGVjdGlvbl0ucHVzaChiYXNlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIFVzZSBleGlzdGluZyBwYXlsb2FkXG4gICAgZGF0YSA9IHBheWxvYWQ7XG4gIH1cblxuICBpZiAoIGdldFhIUigpIHx8IGdldENvbnRleHQoKSA9PT0gJ3NlcnZlcicgKSB7XG4gICAgcmVxdWVzdFxuICAgICAgLnBvc3QodXJsQmFzZSlcbiAgICAgIC5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCBzZWxmLndyaXRlS2V5KCkpXG4gICAgICAuc2VuZChkYXRhKVxuICAgICAgLmVuZChmdW5jdGlvbihlcnIsIHJlcyl7XG4gICAgICAgIHJlc3BvbnNlSGFuZGxlcihlcnIsIHJlcywgY2IpO1xuICAgICAgICBjYiA9IGNhbGxiYWNrID0gbnVsbDtcbiAgICAgIH0pO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIFRPRE86IHF1ZXVlIGFuZCBmaXJlIGluIHNtYWxsLCBhc3luY2hyb25vdXMgYmF0Y2hlc1xuICAgIHNlbGYudHJpZ2dlcignZXJyb3InLCAnRXZlbnRzIG5vdCByZWNvcmRlZDogWEhSIHN1cHBvcnQgaXMgcmVxdWlyZWQgZm9yIGJhdGNoIHVwbG9hZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlVmFsaWRhdGlvbkVycm9yKG1zZyl7XG4gICAgdmFyIGVyciA9ICdFdmVudHMgbm90IHJlY29yZGVkOiAnICsgbXNnO1xuICAgIHNlbGYudHJpZ2dlcignZXJyb3InLCBlcnIpO1xuICAgIGlmIChjYikge1xuICAgICAgY2IuY2FsbChzZWxmLCBlcnIsIG51bGwpO1xuICAgICAgY2IgPSBjYWxsYmFjayA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuO1xufTtcbiIsInZhciByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xudmFyIGdldFF1ZXJ5U3RyaW5nID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQtcXVlcnktc3RyaW5nJyksXG4gICAgaGFuZGxlUmVzcG9uc2UgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N1cGVyYWdlbnQtaGFuZGxlLXJlc3BvbnNlJyksXG4gICAgcmVxdWVzdFR5cGVzID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdXBlcmFnZW50LXJlcXVlc3QtdHlwZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIHBhcmFtcywgYXBpX2tleSwgY2FsbGJhY2spe1xuICB2YXIgcmVxVHlwZSA9IHRoaXMuY29uZmlnLnJlcXVlc3RUeXBlLFxuICAgICAgZGF0YSA9IHBhcmFtcyB8fCB7fTtcblxuICBpZiAocmVxVHlwZSA9PT0gJ2JlYWNvbicpIHtcbiAgICByZXFUeXBlID0gJ2pzb25wJztcbiAgfVxuXG4gIC8vIEVuc3VyZSBhcGlfa2V5IGlzIHByZXNlbnQgZm9yIEdFVCByZXF1ZXN0c1xuICBkYXRhWydhcGlfa2V5J10gPSBkYXRhWydhcGlfa2V5J10gfHwgYXBpX2tleTtcblxuICByZXF1ZXN0XG4gICAgLmdldCh1cmwrZ2V0UXVlcnlTdHJpbmcoZGF0YSkpXG4gICAgLnVzZShyZXF1ZXN0VHlwZXMocmVxVHlwZSkpXG4gICAgLmVuZChmdW5jdGlvbihlcnIsIHJlcyl7XG4gICAgICBoYW5kbGVSZXNwb25zZShlcnIsIHJlcywgY2FsbGJhY2spO1xuICAgICAgY2FsbGJhY2sgPSBudWxsO1xuICAgIH0pO1xufTtcbiIsInZhciByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xudmFyIGhhbmRsZVJlc3BvbnNlID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdXBlcmFnZW50LWhhbmRsZS1yZXNwb25zZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgYXBpX2tleSwgY2FsbGJhY2spe1xuICByZXF1ZXN0XG4gICAgLnBvc3QodXJsKVxuICAgIC5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgYXBpX2tleSlcbiAgICAuc2VuZChkYXRhIHx8IHt9KVxuICAgIC5lbmQoZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgIGhhbmRsZVJlc3BvbnNlKGVyciwgcmVzLCBjYWxsYmFjayk7XG4gICAgICBjYWxsYmFjayA9IG51bGw7XG4gICAgfSk7XG59O1xuIiwidmFyIFJlcXVlc3QgPSByZXF1aXJlKFwiLi4vcmVxdWVzdFwiKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXVlcnksIGNhbGxiYWNrKSB7XG4gIHZhciBxdWVyaWVzID0gW10sXG4gICAgICBjYiA9IGNhbGxiYWNrLFxuICAgICAgcmVxdWVzdDtcblxuICBpZiAocXVlcnkgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHF1ZXJpZXMgPSBxdWVyeTtcbiAgfSBlbHNlIHtcbiAgICBxdWVyaWVzLnB1c2gocXVlcnkpO1xuICB9XG4gIHJlcXVlc3QgPSBuZXcgUmVxdWVzdCh0aGlzLCBxdWVyaWVzLCBjYikucmVmcmVzaCgpO1xuICBjYiA9IGNhbGxiYWNrID0gbnVsbDtcbiAgcmV0dXJuIHJlcXVlc3Q7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuZXdHbG9iYWxQcm9wZXJ0aWVzKSB7XG4gIGlmIChuZXdHbG9iYWxQcm9wZXJ0aWVzICYmIHR5cGVvZihuZXdHbG9iYWxQcm9wZXJ0aWVzKSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB0aGlzLmNvbmZpZy5nbG9iYWxQcm9wZXJ0aWVzID0gbmV3R2xvYmFsUHJvcGVydGllcztcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnRyaWdnZXIoXCJlcnJvclwiLCBcIkludmFsaWQgdmFsdWUgZm9yIGdsb2JhbCBwcm9wZXJ0aWVzOiBcIiArIG5ld0dsb2JhbFByb3BlcnRpZXMpO1xuICB9XG59O1xuIiwiLy8gdmFyIHNlbmRFdmVudCA9IHJlcXVpcmUoXCIuLi91dGlscy9zZW5kRXZlbnRcIik7XG52YXIgYWRkRXZlbnQgPSByZXF1aXJlKFwiLi9hZGRFdmVudFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihqc0V2ZW50LCBldmVudENvbGxlY3Rpb24sIHBheWxvYWQsIHRpbWVvdXQsIHRpbWVvdXRDYWxsYmFjayl7XG4gIHZhciBldnQgPSBqc0V2ZW50LFxuICAgICAgdGFyZ2V0ID0gKGV2dC5jdXJyZW50VGFyZ2V0KSA/IGV2dC5jdXJyZW50VGFyZ2V0IDogKGV2dC5zcmNFbGVtZW50IHx8IGV2dC50YXJnZXQpLFxuICAgICAgdGltZXIgPSB0aW1lb3V0IHx8IDUwMCxcbiAgICAgIHRyaWdnZXJlZCA9IGZhbHNlLFxuICAgICAgdGFyZ2V0QXR0ciA9IFwiXCIsXG4gICAgICBjYWxsYmFjayxcbiAgICAgIHdpbjtcblxuICBpZiAodGFyZ2V0LmdldEF0dHJpYnV0ZSAhPT0gdm9pZCAwKSB7XG4gICAgdGFyZ2V0QXR0ciA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJ0YXJnZXRcIik7XG4gIH0gZWxzZSBpZiAodGFyZ2V0LnRhcmdldCkge1xuICAgIHRhcmdldEF0dHIgPSB0YXJnZXQudGFyZ2V0O1xuICB9XG5cbiAgaWYgKCh0YXJnZXRBdHRyID09IFwiX2JsYW5rXCIgfHwgdGFyZ2V0QXR0ciA9PSBcImJsYW5rXCIpICYmICFldnQubWV0YUtleSkge1xuICAgIHdpbiA9IHdpbmRvdy5vcGVuKFwiYWJvdXQ6YmxhbmtcIik7XG4gICAgd2luLmRvY3VtZW50LmxvY2F0aW9uID0gdGFyZ2V0LmhyZWY7XG4gIH1cblxuICBpZiAodGFyZ2V0Lm5vZGVOYW1lID09PSBcIkFcIikge1xuICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKCF0cmlnZ2VyZWQgJiYgIWV2dC5tZXRhS2V5ICYmICh0YXJnZXRBdHRyICE9PSBcIl9ibGFua1wiICYmIHRhcmdldEF0dHIgIT09IFwiYmxhbmtcIikpe1xuICAgICAgICB0cmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSB0YXJnZXQuaHJlZjtcbiAgICAgIH1cbiAgICB9O1xuICB9IGVsc2UgaWYgKHRhcmdldC5ub2RlTmFtZSA9PT0gXCJGT1JNXCIpIHtcbiAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZighdHJpZ2dlcmVkKXtcbiAgICAgICAgdHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgdGFyZ2V0LnN1Ym1pdCgpO1xuICAgICAgfVxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdGhpcy50cmlnZ2VyKFwiZXJyb3JcIiwgXCIjdHJhY2tFeHRlcm5hbExpbmsgbWV0aG9kIG5vdCBhdHRhY2hlZCB0byBhbiA8YT4gb3IgPGZvcm0+IERPTSBlbGVtZW50XCIpO1xuICB9XG5cbiAgaWYgKHRpbWVvdXRDYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKCF0cmlnZ2VyZWQpe1xuICAgICAgICB0cmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICB0aW1lb3V0Q2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGFkZEV2ZW50LmNhbGwodGhpcywgZXZlbnRDb2xsZWN0aW9uLCBwYXlsb2FkLCBjYWxsYmFjayk7XG5cbiAgc2V0VGltZW91dChjYWxsYmFjaywgdGltZXIpO1xuICBpZiAoIWV2dC5tZXRhS2V5KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi91dGlscy9lYWNoXCIpLFxuICAgIGV4dGVuZCA9IHJlcXVpcmUoXCIuL3V0aWxzL2V4dGVuZFwiKSxcbiAgICBnZXRUaW1lem9uZU9mZnNldCA9IHJlcXVpcmUoXCIuL2hlbHBlcnMvZ2V0LXRpbWV6b25lLW9mZnNldFwiKSxcbiAgICBnZXRRdWVyeVN0cmluZyA9IHJlcXVpcmUoXCIuL2hlbHBlcnMvZ2V0LXF1ZXJ5LXN0cmluZ1wiKTtcblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCcuL3V0aWxzL2VtaXR0ZXItc2hpbScpO1xuXG5mdW5jdGlvbiBRdWVyeSgpe1xuICB0aGlzLmNvbmZpZ3VyZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbkVtaXR0ZXIoUXVlcnkucHJvdG90eXBlKTtcblxuUXVlcnkucHJvdG90eXBlLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uKGFuYWx5c2lzVHlwZSwgcGFyYW1zKSB7XG4gIHRoaXMuYW5hbHlzaXMgPSBhbmFseXNpc1R5cGU7XG5cbiAgLy8gQXBwbHkgcGFyYW1zIHcvICNzZXQgbWV0aG9kXG4gIHRoaXMucGFyYW1zID0gdGhpcy5wYXJhbXMgfHwge307XG4gIHRoaXMuc2V0KHBhcmFtcyk7XG5cbiAgLy8gTG9jYWxpemUgdGltZXpvbmUgaWYgbm9uZSBpcyBzZXRcbiAgaWYgKHRoaXMucGFyYW1zLnRpbWV6b25lID09PSB2b2lkIDApIHtcbiAgICB0aGlzLnBhcmFtcy50aW1lem9uZSA9IGdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5RdWVyeS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oYXR0cmlidXRlcykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGVhY2goYXR0cmlidXRlcywgZnVuY3Rpb24odiwgayl7XG4gICAgdmFyIGtleSA9IGssIHZhbHVlID0gdjtcbiAgICBpZiAoay5tYXRjaChuZXcgUmVnRXhwKFwiW0EtWl1cIikpKSB7XG4gICAgICBrZXkgPSBrLnJlcGxhY2UoLyhbQS1aXSkvZywgZnVuY3Rpb24oJDEpIHsgcmV0dXJuIFwiX1wiKyQxLnRvTG93ZXJDYXNlKCk7IH0pO1xuICAgIH1cbiAgICBzZWxmLnBhcmFtc1trZXldID0gdmFsdWU7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGVhY2godmFsdWUsIGZ1bmN0aW9uKGR2LCBpbmRleCl7XG4gICAgICAgIGlmIChkdiBpbnN0YW5jZW9mIEFycmF5ID09IGZhbHNlICYmIHR5cGVvZiBkdiA9PT0gXCJvYmplY3RcIikgeyAvLyAgX3R5cGUoZHYpPT09XCJPYmplY3RcIlxuICAgICAgICAgIGVhY2goZHYsIGZ1bmN0aW9uKGRlZXBWYWx1ZSwgZGVlcEtleSl7XG4gICAgICAgICAgICBpZiAoZGVlcEtleS5tYXRjaChuZXcgUmVnRXhwKFwiW0EtWl1cIikpKSB7XG4gICAgICAgICAgICAgIHZhciBfZGVlcEtleSA9IGRlZXBLZXkucmVwbGFjZSgvKFtBLVpdKS9nLCBmdW5jdGlvbigkMSkgeyByZXR1cm4gXCJfXCIrJDEudG9Mb3dlckNhc2UoKTsgfSk7XG4gICAgICAgICAgICAgIGRlbGV0ZSBzZWxmLnBhcmFtc1trZXldW2luZGV4XVtkZWVwS2V5XTtcbiAgICAgICAgICAgICAgc2VsZi5wYXJhbXNba2V5XVtpbmRleF1bX2RlZXBLZXldID0gZGVlcFZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc2VsZjtcbn07XG5cblF1ZXJ5LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihhdHRyaWJ1dGUpIHtcbiAgdmFyIGtleSA9IGF0dHJpYnV0ZTtcbiAgaWYgKGtleS5tYXRjaChuZXcgUmVnRXhwKFwiW0EtWl1cIikpKSB7XG4gICAga2V5ID0ga2V5LnJlcGxhY2UoLyhbQS1aXSkvZywgZnVuY3Rpb24oJDEpIHsgcmV0dXJuIFwiX1wiKyQxLnRvTG93ZXJDYXNlKCk7IH0pO1xuICB9XG4gIGlmICh0aGlzLnBhcmFtcykge1xuICAgIHJldHVybiB0aGlzLnBhcmFtc1trZXldIHx8IG51bGw7XG4gIH1cbn07XG5cblF1ZXJ5LnByb3RvdHlwZS5hZGRGaWx0ZXIgPSBmdW5jdGlvbihwcm9wZXJ0eSwgb3BlcmF0b3IsIHZhbHVlKSB7XG4gIHRoaXMucGFyYW1zLmZpbHRlcnMgPSB0aGlzLnBhcmFtcy5maWx0ZXJzIHx8IFtdO1xuICB0aGlzLnBhcmFtcy5maWx0ZXJzLnB1c2goe1xuICAgIFwicHJvcGVydHlfbmFtZVwiOiBwcm9wZXJ0eSxcbiAgICBcIm9wZXJhdG9yXCI6IG9wZXJhdG9yLFxuICAgIFwicHJvcGVydHlfdmFsdWVcIjogdmFsdWVcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWVyeTtcbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4vdXRpbHMvZWFjaFwiKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKFwiLi91dGlscy9leHRlbmRcIiksXG4gICAgc2VuZFF1ZXJ5ID0gcmVxdWlyZShcIi4vdXRpbHMvc2VuZFF1ZXJ5XCIpO1xuXG52YXIgS2VlbiA9IHJlcXVpcmUoXCIuL1wiKTtcbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnLi91dGlscy9lbWl0dGVyLXNoaW0nKTtcblxuZnVuY3Rpb24gUmVxdWVzdChjbGllbnQsIHF1ZXJpZXMsIGNhbGxiYWNrKXtcbiAgdmFyIGNiID0gY2FsbGJhY2s7XG4gIHRoaXMuY29uZmlnID0ge1xuICAgIHRpbWVvdXQ6IDMwMCAqIDEwMDBcbiAgfTtcbiAgdGhpcy5jb25maWd1cmUoY2xpZW50LCBxdWVyaWVzLCBjYik7XG4gIGNiID0gY2FsbGJhY2sgPSBudWxsO1xufTtcbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jb25maWd1cmUgPSBmdW5jdGlvbihjbGllbnQsIHF1ZXJpZXMsIGNhbGxiYWNrKXtcbiAgdmFyIGNiID0gY2FsbGJhY2s7XG4gIGV4dGVuZCh0aGlzLCB7XG4gICAgXCJjbGllbnRcIiAgIDogY2xpZW50LFxuICAgIFwicXVlcmllc1wiICA6IHF1ZXJpZXMsXG4gICAgXCJkYXRhXCIgICAgIDoge30sXG4gICAgXCJjYWxsYmFja1wiIDogY2JcbiAgfSk7XG4gIGNiID0gY2FsbGJhY2sgPSBudWxsO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuY29uZmlnLnRpbWVvdXQ7XG4gIHRoaXMuY29uZmlnLnRpbWVvdXQgPSAoIWlzTmFOKHBhcnNlSW50KG1zKSkgPyBwYXJzZUludChtcykgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgY29tcGxldGlvbnMgPSAwLFxuICAgICAgcmVzcG9uc2UgPSBbXSxcbiAgICAgIGVycm9yZWQgPSBmYWxzZTtcblxuICB2YXIgaGFuZGxlUmVzcG9uc2UgPSBmdW5jdGlvbihlcnIsIHJlcywgaW5kZXgpe1xuICAgIGlmIChlcnJvcmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChlcnIpIHtcbiAgICAgIHNlbGYudHJpZ2dlcihcImVycm9yXCIsIGVycik7XG4gICAgICBpZiAoc2VsZi5jYWxsYmFjaykge1xuICAgICAgICBzZWxmLmNhbGxiYWNrKGVyciwgbnVsbCk7XG4gICAgICB9XG4gICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzcG9uc2VbaW5kZXhdID0gcmVzO1xuICAgIGNvbXBsZXRpb25zKys7XG4gICAgaWYgKGNvbXBsZXRpb25zID09IHNlbGYucXVlcmllcy5sZW5ndGggJiYgIWVycm9yZWQpIHtcbiAgICAgIHNlbGYuZGF0YSA9IChzZWxmLnF1ZXJpZXMubGVuZ3RoID09IDEpID8gcmVzcG9uc2VbMF0gOiByZXNwb25zZTtcbiAgICAgIHNlbGYudHJpZ2dlcihcImNvbXBsZXRlXCIsIG51bGwsIHNlbGYuZGF0YSk7XG4gICAgICBpZiAoc2VsZi5jYWxsYmFjaykge1xuICAgICAgICBzZWxmLmNhbGxiYWNrKG51bGwsIHNlbGYuZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGVhY2goc2VsZi5xdWVyaWVzLCBmdW5jdGlvbihxdWVyeSwgaW5kZXgpe1xuICAgIHZhciBwYXRoO1xuICAgIHZhciBjYlNlcXVlbmNlciA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgICAgIGhhbmRsZVJlc3BvbnNlKGVyciwgcmVzLCBpbmRleCk7XG4gICAgfTtcblxuICAgIGlmIChxdWVyeSBpbnN0YW5jZW9mIEtlZW4uUXVlcnkpIHtcbiAgICAgIHBhdGggPSBcIi9xdWVyaWVzL1wiICsgcXVlcnkuYW5hbHlzaXM7XG4gICAgICBzZW5kUXVlcnkuY2FsbChzZWxmLCBwYXRoLCBxdWVyeS5wYXJhbXMsIGNiU2VxdWVuY2VyKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChxdWVyeSkgPT09IFwiW29iamVjdCBTdHJpbmddXCIgKSB7XG4gICAgICBwYXRoID0gXCIvc2F2ZWRfcXVlcmllcy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChxdWVyeSkgKyBcIi9yZXN1bHRcIjtcbiAgICAgIHNlbmRRdWVyeS5jYWxsKHNlbGYsIHBhdGgsIG51bGwsIGNiU2VxdWVuY2VyKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXIgcmVzID0ge1xuICAgICAgICBzdGF0dXNUZXh0OiBcIkJhZCBSZXF1ZXN0XCIsXG4gICAgICAgIHJlc3BvbnNlVGV4dDogeyBtZXNzYWdlOiBcIkVycm9yOiBRdWVyeSBcIiArICgraW5kZXgrMSkgKyBcIiBvZiBcIiArIHNlbGYucXVlcmllcy5sZW5ndGggKyBcIiBmb3IgcHJvamVjdCBcIiArIHNlbGYuY2xpZW50LnByb2plY3RJZCgpICsgXCIgaXMgbm90IGEgdmFsaWQgcmVxdWVzdFwiIH1cbiAgICAgIH07XG4gICAgICBzZWxmLnRyaWdnZXIoXCJlcnJvclwiLCByZXMucmVzcG9uc2VUZXh0Lm1lc3NhZ2UpO1xuICAgICAgaWYgKHNlbGYuY2FsbGJhY2spIHtcbiAgICAgICAgc2VsZi5jYWxsYmFjayhyZXMucmVzcG9uc2VUZXh0Lm1lc3NhZ2UsIG51bGwpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXF1ZXN0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1hcDogXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiLFxuICBlbmNvZGU6IGZ1bmN0aW9uIChuKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG8gPSBcIlwiLCBpID0gMCwgbSA9IHRoaXMubWFwLCBpMSwgaTIsIGkzLCBlMSwgZTIsIGUzLCBlNDtcbiAgICBuID0gdGhpcy51dGY4LmVuY29kZShuKTtcbiAgICB3aGlsZSAoaSA8IG4ubGVuZ3RoKSB7XG4gICAgICBpMSA9IG4uY2hhckNvZGVBdChpKyspOyBpMiA9IG4uY2hhckNvZGVBdChpKyspOyBpMyA9IG4uY2hhckNvZGVBdChpKyspO1xuICAgICAgZTEgPSAoaTEgPj4gMik7IGUyID0gKCgoaTEgJiAzKSA8PCA0KSB8IChpMiA+PiA0KSk7IGUzID0gKGlzTmFOKGkyKSA/IDY0IDogKChpMiAmIDE1KSA8PCAyKSB8IChpMyA+PiA2KSk7XG4gICAgICBlNCA9IChpc05hTihpMikgfHwgaXNOYU4oaTMpKSA/IDY0IDogaTMgJiA2MztcbiAgICAgIG8gPSBvICsgbS5jaGFyQXQoZTEpICsgbS5jaGFyQXQoZTIpICsgbS5jaGFyQXQoZTMpICsgbS5jaGFyQXQoZTQpO1xuICAgIH0gcmV0dXJuIG87XG4gIH0sXG4gIGRlY29kZTogZnVuY3Rpb24gKG4pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbyA9IFwiXCIsIGkgPSAwLCBtID0gdGhpcy5tYXAsIGNjID0gU3RyaW5nLmZyb21DaGFyQ29kZSwgZTEsIGUyLCBlMywgZTQsIGMxLCBjMiwgYzM7XG4gICAgbiA9IG4ucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csIFwiXCIpO1xuICAgIHdoaWxlIChpIDwgbi5sZW5ndGgpIHtcbiAgICAgIGUxID0gbS5pbmRleE9mKG4uY2hhckF0KGkrKykpOyBlMiA9IG0uaW5kZXhPZihuLmNoYXJBdChpKyspKTtcbiAgICAgIGUzID0gbS5pbmRleE9mKG4uY2hhckF0KGkrKykpOyBlNCA9IG0uaW5kZXhPZihuLmNoYXJBdChpKyspKTtcbiAgICAgIGMxID0gKGUxIDw8IDIpIHwgKGUyID4+IDQpOyBjMiA9ICgoZTIgJiAxNSkgPDwgNCkgfCAoZTMgPj4gMik7XG4gICAgICBjMyA9ICgoZTMgJiAzKSA8PCA2KSB8IGU0O1xuICAgICAgbyA9IG8gKyAoY2MoYzEpICsgKChlMyAhPSA2NCkgPyBjYyhjMikgOiBcIlwiKSkgKyAoKChlNCAhPSA2NCkgPyBjYyhjMykgOiBcIlwiKSk7XG4gICAgfSByZXR1cm4gdGhpcy51dGY4LmRlY29kZShvKTtcbiAgfSxcbiAgdXRmODoge1xuICAgIGVuY29kZTogZnVuY3Rpb24gKG4pIHtcbiAgICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgdmFyIG8gPSBcIlwiLCBpID0gMCwgY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLCBjO1xuICAgICAgd2hpbGUgKGkgPCBuLmxlbmd0aCkge1xuICAgICAgICBjID0gbi5jaGFyQ29kZUF0KGkrKyk7IG8gPSBvICsgKChjIDwgMTI4KSA/IGNjKGMpIDogKChjID4gMTI3KSAmJiAoYyA8IDIwNDgpKSA/XG4gICAgICAgIChjYygoYyA+PiA2KSB8IDE5MikgKyBjYygoYyAmIDYzKSB8IDEyOCkpIDogKGNjKChjID4+IDEyKSB8IDIyNCkgKyBjYygoKGMgPj4gNikgJiA2MykgfCAxMjgpICsgY2MoKGMgJiA2MykgfCAxMjgpKSk7XG4gICAgICAgIH0gcmV0dXJuIG87XG4gICAgfSxcbiAgICBkZWNvZGU6IGZ1bmN0aW9uIChuKSB7XG4gICAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAgIHZhciBvID0gXCJcIiwgaSA9IDAsIGNjID0gU3RyaW5nLmZyb21DaGFyQ29kZSwgYzIsIGM7XG4gICAgICB3aGlsZSAoaSA8IG4ubGVuZ3RoKSB7XG4gICAgICAgIGMgPSBuLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIG8gPSBvICsgKChjIDwgMTI4KSA/IFtjYyhjKSwgaSsrXVswXSA6ICgoYyA+IDE5MSkgJiYgKGMgPCAyMjQpKSA/XG4gICAgICAgIFtjYygoKGMgJiAzMSkgPDwgNikgfCAoKGMyID0gbi5jaGFyQ29kZUF0KGkgKyAxKSkgJiA2MykpLCAoaSArPSAyKV1bMF0gOlxuICAgICAgICBbY2MoKChjICYgMTUpIDw8IDEyKSB8ICgoKGMyID0gbi5jaGFyQ29kZUF0KGkgKyAxKSkgJiA2MykgPDwgNikgfCAoKGMzID0gbi5jaGFyQ29kZUF0KGkgKyAyKSkgJiA2MykpLCAoaSArPSAzKV1bMF0pO1xuICAgICAgfSByZXR1cm4gbztcbiAgICB9XG4gIH1cbn07XG4iLCJ2YXIganNvbiA9IHJlcXVpcmUoJy4vanNvbi1zaGltJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gIHJldHVybiBqc29uLnBhcnNlKCBqc29uLnN0cmluZ2lmeSggdGFyZ2V0ICkgKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG8sIGNiLCBzKXtcbiAgdmFyIG47XG4gIGlmICghbyl7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgcyA9ICFzID8gbyA6IHM7XG4gIGlmIChvIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgIC8vIEluZGV4ZWQgYXJyYXlzLCBuZWVkZWQgZm9yIFNhZmFyaVxuICAgIGZvciAobj0wOyBuPG8ubGVuZ3RoOyBuKyspIHtcbiAgICAgIGlmIChjYi5jYWxsKHMsIG9bbl0sIG4sIG8pID09PSBmYWxzZSl7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBIYXNodGFibGVzXG4gICAgZm9yIChuIGluIG8pe1xuICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkobikpIHtcbiAgICAgICAgaWYgKGNiLmNhbGwocywgb1tuXSwgbiwgbykgPT09IGZhbHNlKXtcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gMTtcbn07XG4iLCJ2YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1lbWl0dGVyJyk7XG5FbWl0dGVyLnByb3RvdHlwZS50cmlnZ2VyID0gRW1pdHRlci5wcm90b3R5cGUuZW1pdDtcbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0KXtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBwcm9wIGluIGFyZ3VtZW50c1tpXSl7XG4gICAgICB0YXJnZXRbcHJvcF0gPSBhcmd1bWVudHNbaV1bcHJvcF07XG4gICAgfVxuICB9XG4gIHJldHVybiB0YXJnZXQ7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB3aW5kb3cgJiYgd2luZG93LkpTT04pID8gd2luZG93LkpTT04gOiByZXF1aXJlKFwianNvbjNcIik7XG4iLCJmdW5jdGlvbiBwYXJzZVBhcmFtcyhzdHIpe1xuICAvLyB2aWE6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI4ODA5MjkvMjUxMTk4NVxuICB2YXIgdXJsUGFyYW1zID0ge30sXG4gICAgICBtYXRjaCxcbiAgICAgIHBsICAgICA9IC9cXCsvZywgIC8vIFJlZ2V4IGZvciByZXBsYWNpbmcgYWRkaXRpb24gc3ltYm9sIHdpdGggYSBzcGFjZVxuICAgICAgc2VhcmNoID0gLyhbXiY9XSspPT8oW14mXSopL2csXG4gICAgICBkZWNvZGUgPSBmdW5jdGlvbiAocykgeyByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHMucmVwbGFjZShwbCwgXCIgXCIpKTsgfSxcbiAgICAgIHF1ZXJ5ICA9IHN0ci5zcGxpdChcIj9cIilbMV07XG5cbiAgd2hpbGUgKCEhKG1hdGNoPXNlYXJjaC5leGVjKHF1ZXJ5KSkpIHtcbiAgICB1cmxQYXJhbXNbZGVjb2RlKG1hdGNoWzFdKV0gPSBkZWNvZGUobWF0Y2hbMl0pO1xuICB9XG4gIHJldHVybiB1cmxQYXJhbXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlUGFyYW1zO1xuIiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5cbnZhciBnZXRDb250ZXh0ID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQtY29udGV4dCcpLFxuICAgIGdldFF1ZXJ5U3RyaW5nID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQtcXVlcnktc3RyaW5nJyksXG4gICAgZ2V0VXJsTWF4TGVuZ3RoID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQtdXJsLW1heC1sZW5ndGgnKSxcbiAgICBnZXRYSFIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC14aHItb2JqZWN0JyksXG4gICAgcmVxdWVzdFR5cGVzID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdXBlcmFnZW50LXJlcXVlc3QtdHlwZXMnKSxcbiAgICByZXNwb25zZUhhbmRsZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N1cGVyYWdlbnQtaGFuZGxlLXJlc3BvbnNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocGF0aCwgcGFyYW1zLCBjYWxsYmFjayl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHVybEJhc2UgPSB0aGlzLmNsaWVudC51cmwocGF0aCksXG4gICAgICByZXFUeXBlID0gdGhpcy5jbGllbnQuY29uZmlnLnJlcXVlc3RUeXBlLFxuICAgICAgY2IgPSBjYWxsYmFjaztcblxuICBjYWxsYmFjayA9IG51bGw7XG5cbiAgaWYgKCFzZWxmLmNsaWVudC5wcm9qZWN0SWQoKSkge1xuICAgIHNlbGYuY2xpZW50LnRyaWdnZXIoJ2Vycm9yJywgJ1F1ZXJ5IG5vdCBzZW50OiBNaXNzaW5nIHByb2plY3RJZCBwcm9wZXJ0eScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghc2VsZi5jbGllbnQucmVhZEtleSgpKSB7XG4gICAgc2VsZi5jbGllbnQudHJpZ2dlcignZXJyb3InLCAnUXVlcnkgbm90IHNlbnQ6IE1pc3NpbmcgcmVhZEtleSBwcm9wZXJ0eScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChnZXRYSFIoKSB8fCBnZXRDb250ZXh0KCkgPT09ICdzZXJ2ZXInICkge1xuICAgIHJlcXVlc3RcbiAgICAgIC5wb3N0KHVybEJhc2UpXG4gICAgICAgIC5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsIHNlbGYuY2xpZW50LnJlYWRLZXkoKSlcbiAgICAgICAgLnRpbWVvdXQoc2VsZi50aW1lb3V0KCkpXG4gICAgICAgIC5zZW5kKHBhcmFtcyB8fCB7fSlcbiAgICAgICAgLmVuZChoYW5kbGVSZXNwb25zZSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgZXh0ZW5kKHBhcmFtcywgeyBhcGlfa2V5OiBzZWxmLmNsaWVudC5yZWFkS2V5KCkgfSk7XG4gICAgdXJsQmFzZSArPSBnZXRRdWVyeVN0cmluZyhwYXJhbXMpO1xuICAgIGlmICh1cmxCYXNlLmxlbmd0aCA8IGdldFVybE1heExlbmd0aCgpICkge1xuICAgICAgcmVxdWVzdFxuICAgICAgICAuZ2V0KHVybEJhc2UpXG4gICAgICAgIC50aW1lb3V0KHNlbGYudGltZW91dCgpKVxuICAgICAgICAudXNlKHJlcXVlc3RUeXBlcygnanNvbnAnKSlcbiAgICAgICAgLmVuZChoYW5kbGVSZXNwb25zZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2VsZi5jbGllbnQudHJpZ2dlcignZXJyb3InLCAnUXVlcnkgbm90IHNlbnQ6IFVSTCBsZW5ndGggZXhjZWVkcyBjdXJyZW50IGJyb3dzZXIgbGltaXQsIGFuZCBYSFIgKFBPU1QpIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UoZXJyLCByZXMpe1xuICAgIHJlc3BvbnNlSGFuZGxlcihlcnIsIHJlcywgY2IpO1xuICAgIGNiID0gY2FsbGJhY2sgPSBudWxsO1xuICB9XG5cbiAgcmV0dXJuO1xufVxuIiwidmFyIGNsb25lID0gcmVxdWlyZShcIi4uL2NvcmUvdXRpbHMvY2xvbmVcIiksXG4gICAgZWFjaCA9IHJlcXVpcmUoXCIuLi9jb3JlL3V0aWxzL2VhY2hcIiksXG4gICAgZmxhdHRlbiA9IHJlcXVpcmUoXCIuL3V0aWxzL2ZsYXR0ZW5cIiksXG4gICAgcGFyc2UgPSByZXF1aXJlKFwiLi91dGlscy9wYXJzZVwiKTtcblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCcuLi9jb3JlL3V0aWxzL2VtaXR0ZXItc2hpbScpO1xuXG5mdW5jdGlvbiBEYXRhc2V0KCl7XG4gIHRoaXMuZGF0YSA9IHtcbiAgICBpbnB1dDoge30sXG4gICAgb3V0cHV0OiBbWydpbmRleCddXVxuICB9O1xuICB0aGlzLm1ldGEgPSB7XG4gICAgc2NoZW1hOiB7fSxcbiAgICBtZXRob2Q6IHVuZGVmaW5lZFxuICB9O1xuICAvLyB0ZW1wIGZ3ZFxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICB0aGlzLnBhcnNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuRGF0YXNldC5kZWZhdWx0cyA9IHtcbiAgZGVsaW1ldGVyOiBcIiAtPiBcIlxufTtcblxuRW1pdHRlcihEYXRhc2V0KTtcbkVtaXR0ZXIoRGF0YXNldC5wcm90b3R5cGUpO1xuXG5EYXRhc2V0LnByb3RvdHlwZS5pbnB1dCA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXNbXCJkYXRhXCJdW1wiaW5wdXRcIl07XG4gIHRoaXNbXCJkYXRhXCJdW1wiaW5wdXRcIl0gPSAob2JqID8gY2xvbmUob2JqKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkRhdGFzZXQucHJvdG90eXBlLm91dHB1dCA9IGZ1bmN0aW9uKGFycil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXNbXCJkYXRhXCJdLm91dHB1dDtcbiAgdGhpc1tcImRhdGFcIl0ub3V0cHV0ID0gKGFyciBpbnN0YW5jZW9mIEFycmF5ID8gYXJyIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5EYXRhc2V0LnByb3RvdHlwZS5tZXRob2QgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLm1ldGFbXCJtZXRob2RcIl07XG4gIHRoaXMubWV0YVtcIm1ldGhvZFwiXSA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkRhdGFzZXQucHJvdG90eXBlLnNjaGVtYSA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMubWV0YS5zY2hlbWE7XG4gIHRoaXMubWV0YS5zY2hlbWEgPSAob2JqID8gb2JqIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRGF0YXNldC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihyYXcsIHNjaGVtYSl7XG4gIHZhciBvcHRpb25zO1xuICBpZiAocmF3KSB0aGlzLmlucHV0KHJhdyk7XG4gIGlmIChzY2hlbWEpIHRoaXMuc2NoZW1hKHNjaGVtYSk7XG5cbiAgLy8gUmVzZXQgb3V0cHV0IHZhbHVlXG4gIHRoaXMub3V0cHV0KFtbXV0pO1xuXG4gIGlmICh0aGlzLm1ldGEuc2NoZW1hLnNlbGVjdCkge1xuICAgIHRoaXMubWV0aG9kKFwic2VsZWN0XCIpO1xuICAgIG9wdGlvbnMgPSBleHRlbmQoe1xuICAgICAgcmVjb3JkczogXCJcIixcbiAgICAgIHNlbGVjdDogdHJ1ZVxuICAgIH0sIHRoaXMuc2NoZW1hKCkpO1xuICAgIF9zZWxlY3QuY2FsbCh0aGlzLCBfb3B0SGFzaChvcHRpb25zKSk7XG4gIH1cbiAgZWxzZSBpZiAodGhpcy5tZXRhLnNjaGVtYS51bnBhY2spIHtcbiAgICB0aGlzLm1ldGhvZChcInVucGFja1wiKTtcbiAgICBvcHRpb25zID0gZXh0ZW5kKHtcbiAgICAgIHJlY29yZHM6IFwiXCIsXG4gICAgICB1bnBhY2s6IHtcbiAgICAgICAgaW5kZXg6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgIGxhYmVsOiBmYWxzZVxuICAgICAgfVxuICAgIH0sIHRoaXMuc2NoZW1hKCkpO1xuICAgIF91bnBhY2suY2FsbCh0aGlzLCBfb3B0SGFzaChvcHRpb25zKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5cbi8vIFNlbGVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gX3NlbGVjdChjZmcpe1xuXG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIG9wdGlvbnMgPSBjZmcgfHwge30sXG4gICAgICB0YXJnZXRfc2V0ID0gW10sXG4gICAgICB1bmlxdWVfa2V5cyA9IFtdO1xuXG4gIHZhciByb290LCByZWNvcmRzX3RhcmdldDtcbiAgaWYgKG9wdGlvbnMucmVjb3JkcyA9PT0gXCJcIiB8fCAhb3B0aW9ucy5yZWNvcmRzKSB7XG4gICAgcm9vdCA9IFtzZWxmLmlucHV0KCldO1xuICB9IGVsc2Uge1xuICAgIHJlY29yZHNfdGFyZ2V0ID0gb3B0aW9ucy5yZWNvcmRzLnNwbGl0KERhdGFzZXQuZGVmYXVsdHMuZGVsaW1ldGVyKTtcbiAgICByb290ID0gcGFyc2UuYXBwbHkoc2VsZiwgW3NlbGYuaW5wdXQoKV0uY29uY2F0KHJlY29yZHNfdGFyZ2V0KSlbMF07XG4gIH1cblxuICBlYWNoKG9wdGlvbnMuc2VsZWN0LCBmdW5jdGlvbihwcm9wKXtcbiAgICB0YXJnZXRfc2V0LnB1c2gocHJvcC5wYXRoLnNwbGl0KERhdGFzZXQuZGVmYXVsdHMuZGVsaW1ldGVyKSk7XG4gIH0pO1xuXG4gIC8vIFJldHJpZXZlIGtleXMgZm91bmQgaW4gYXN5bW1ldHJpY2FsIGNvbGxlY3Rpb25zXG4gIGlmICh0YXJnZXRfc2V0Lmxlbmd0aCA9PSAwKSB7XG4gICAgZWFjaChyb290LCBmdW5jdGlvbihyZWNvcmQsIGludGVydmFsKXtcbiAgICAgIHZhciBmbGF0ID0gZmxhdHRlbihyZWNvcmQpO1xuICAgICAgLy9jb25zb2xlLmxvZygnZmxhdCcsIGZsYXQpO1xuICAgICAgZm9yICh2YXIga2V5IGluIGZsYXQpIHtcbiAgICAgICAgaWYgKGZsYXQuaGFzT3duUHJvcGVydHkoa2V5KSAmJiB1bmlxdWVfa2V5cy5pbmRleE9mKGtleSkgPT0gLTEpIHtcbiAgICAgICAgICB1bmlxdWVfa2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgdGFyZ2V0X3NldC5wdXNoKFtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdmFyIHRlc3QgPSBbW11dO1xuXG4gIC8vIEFwcGVuZCBoZWFkZXIgcm93XG4gIGVhY2godGFyZ2V0X3NldCwgZnVuY3Rpb24ocHJvcHMsIGkpe1xuICAgIGlmICh0YXJnZXRfc2V0Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAvLyBTdGF0aWMgaGVhZGVyIGZvciBzaW5nbGUgdmFsdWVcbiAgICAgIHRlc3RbMF0ucHVzaCgnbGFiZWwnLCAndmFsdWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRHluYW1pYyBoZWFkZXIgZm9yIG4tdmFsdWVzXG4gICAgICB0ZXN0WzBdLnB1c2gocHJvcHMuam9pbihcIi5cIikpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gQXBwZW5kIGFsbCByb3dzXG4gIGVhY2gocm9vdCwgZnVuY3Rpb24ocmVjb3JkLCBpKXtcbiAgICB2YXIgZmxhdCA9IGZsYXR0ZW4ocmVjb3JkKTtcbiAgICBpZiAodGFyZ2V0X3NldC5sZW5ndGggPT0gMSkge1xuICAgICAgLy8gU3RhdGljIHJvdyBmb3Igc2luZ2xlIHZhbHVlXG4gICAgICB0ZXN0LnB1c2goW3RhcmdldF9zZXQuam9pbihcIi5cIiksIGZsYXRbdGFyZ2V0X3NldC5qb2luKFwiLlwiKV1dKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRHluYW1pYyByb3cgZm9yIG4tdmFsdWVzXG4gICAgICB0ZXN0LnB1c2goW10pO1xuICAgICAgZWFjaCh0YXJnZXRfc2V0LCBmdW5jdGlvbih0LCBqKXtcbiAgICAgICAgdmFyIHRhcmdldCA9IHQuam9pbihcIi5cIik7XG4gICAgICAgIHRlc3RbaSsxXS5wdXNoKGZsYXRbdGFyZ2V0XSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHNlbGYub3V0cHV0KHRlc3QpO1xuICBzZWxmLmZvcm1hdChvcHRpb25zLnNlbGVjdCk7XG4gIHJldHVybiBzZWxmO1xufVxuXG5cbi8vIFVucGFja1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gX3VucGFjayhvcHRpb25zKXtcbiAgLy9jb25zb2xlLmxvZygnVW5wYWNraW5nJywgb3B0aW9ucyk7XG4gIHZhciBzZWxmID0gdGhpcywgZGlzY292ZXJlZF9sYWJlbHMgPSBbXTtcblxuICB2YXIgdmFsdWVfc2V0ID0gKG9wdGlvbnMudW5wYWNrLnZhbHVlKSA/IG9wdGlvbnMudW5wYWNrLnZhbHVlLnBhdGguc3BsaXQoRGF0YXNldC5kZWZhdWx0cy5kZWxpbWV0ZXIpIDogZmFsc2UsXG4gICAgICBsYWJlbF9zZXQgPSAob3B0aW9ucy51bnBhY2subGFiZWwpID8gb3B0aW9ucy51bnBhY2subGFiZWwucGF0aC5zcGxpdChEYXRhc2V0LmRlZmF1bHRzLmRlbGltZXRlcikgOiBmYWxzZSxcbiAgICAgIGluZGV4X3NldCA9IChvcHRpb25zLnVucGFjay5pbmRleCkgPyBvcHRpb25zLnVucGFjay5pbmRleC5wYXRoLnNwbGl0KERhdGFzZXQuZGVmYXVsdHMuZGVsaW1ldGVyKSA6IGZhbHNlO1xuICAvL2NvbnNvbGUubG9nKGluZGV4X3NldCwgbGFiZWxfc2V0LCB2YWx1ZV9zZXQpO1xuXG4gIHZhciB2YWx1ZV9kZXNjID0gKHZhbHVlX3NldFt2YWx1ZV9zZXQubGVuZ3RoLTFdICE9PSBcIlwiKSA/IHZhbHVlX3NldFt2YWx1ZV9zZXQubGVuZ3RoLTFdIDogXCJWYWx1ZVwiLFxuICAgICAgbGFiZWxfZGVzYyA9IChsYWJlbF9zZXRbbGFiZWxfc2V0Lmxlbmd0aC0xXSAhPT0gXCJcIikgPyBsYWJlbF9zZXRbbGFiZWxfc2V0Lmxlbmd0aC0xXSA6IFwiTGFiZWxcIixcbiAgICAgIGluZGV4X2Rlc2MgPSAoaW5kZXhfc2V0W2luZGV4X3NldC5sZW5ndGgtMV0gIT09IFwiXCIpID8gaW5kZXhfc2V0W2luZGV4X3NldC5sZW5ndGgtMV0gOiBcIkluZGV4XCI7XG5cbiAgLy8gUHJlcGFyZSByb290IGZvciBwYXJzaW5nXG4gIHZhciByb290ID0gKGZ1bmN0aW9uKCl7XG4gICAgdmFyIHJvb3Q7XG4gICAgaWYgKG9wdGlvbnMucmVjb3JkcyA9PSBcIlwiKSB7XG4gICAgICByb290ID0gW3NlbGYuaW5wdXQoKV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJvb3QgPSBwYXJzZS5hcHBseShzZWxmLCBbc2VsZi5pbnB1dCgpXS5jb25jYXQob3B0aW9ucy5yZWNvcmRzLnNwbGl0KERhdGFzZXQuZGVmYXVsdHMuZGVsaW1ldGVyKSkpO1xuICAgIH1cbiAgICByZXR1cm4gcm9vdFswXTtcbiAgfSkoKTtcblxuICBpZiAocm9vdCBpbnN0YW5jZW9mIEFycmF5ID09IGZhbHNlKSB7XG4gICAgcm9vdCA9IFtyb290XTtcbiAgfVxuXG4gIC8vIEZpbmQgbGFiZWxzXG4gIGVhY2gocm9vdCwgZnVuY3Rpb24ocmVjb3JkLCBpbnRlcnZhbCl7XG4gICAgdmFyIGxhYmVscyA9IChsYWJlbF9zZXQpID8gcGFyc2UuYXBwbHkoc2VsZiwgW3JlY29yZF0uY29uY2F0KGxhYmVsX3NldCkpIDogW107XG4gICAgaWYgKGxhYmVscykge1xuICAgICAgZGlzY292ZXJlZF9sYWJlbHMgPSBsYWJlbHM7XG4gICAgfVxuICB9KTtcblxuICAvLyBQYXJzZSBlYWNoIHJlY29yZFxuICBlYWNoKHJvb3QsIGZ1bmN0aW9uKHJlY29yZCwgaW50ZXJ2YWwpe1xuICAgIC8vY29uc29sZS5sb2coJ3JlY29yZCcsIHJlY29yZCk7XG5cbiAgICB2YXIgcGx1Y2tlZF92YWx1ZSA9ICh2YWx1ZV9zZXQpID8gcGFyc2UuYXBwbHkoc2VsZiwgW3JlY29yZF0uY29uY2F0KHZhbHVlX3NldCkpIDogZmFsc2UsXG4gICAgICAgIC8vcGx1Y2tlZF9sYWJlbCA9IChsYWJlbF9zZXQpID8gcGFyc2UuYXBwbHkoc2VsZiwgW3JlY29yZF0uY29uY2F0KGxhYmVsX3NldCkpIDogZmFsc2UsXG4gICAgICAgIHBsdWNrZWRfaW5kZXggPSAoaW5kZXhfc2V0KSA/IHBhcnNlLmFwcGx5KHNlbGYsIFtyZWNvcmRdLmNvbmNhdChpbmRleF9zZXQpKSA6IGZhbHNlO1xuICAgIC8vY29uc29sZS5sb2cocGx1Y2tlZF9pbmRleCwgcGx1Y2tlZF9sYWJlbCwgcGx1Y2tlZF92YWx1ZSk7XG5cbiAgICAvLyBJbmplY3Qgcm93IGZvciBlYWNoIGluZGV4XG4gICAgaWYgKHBsdWNrZWRfaW5kZXgpIHtcbiAgICAgIGVhY2gocGx1Y2tlZF9pbmRleCwgZnVuY3Rpb24oKXtcbiAgICAgICAgc2VsZi5kYXRhLm91dHB1dC5wdXNoKFtdKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmRhdGEub3V0cHV0LnB1c2goW10pO1xuICAgIH1cblxuICAgIC8vIEJ1aWxkIGluZGV4IGNvbHVtblxuICAgIGlmIChwbHVja2VkX2luZGV4KSB7XG5cbiAgICAgIC8vIEJ1aWxkIGluZGV4L2xhYmVsIG9uIGZpcnN0IGludGVydmFsXG4gICAgICBpZiAoaW50ZXJ2YWwgPT0gMCkge1xuXG4gICAgICAgIC8vIFB1c2ggbGFzdCBpbmRleCBwcm9wZXJ0eSB0byAwLDBcbiAgICAgICAgc2VsZi5kYXRhLm91dHB1dFswXS5wdXNoKGluZGV4X2Rlc2MpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHN1YnNlcXVlbnQgc2VyaWVzIGhlYWRlcnMgKDE6TilcbiAgICAgICAgaWYgKGRpc2NvdmVyZWRfbGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBlYWNoKGRpc2NvdmVyZWRfbGFiZWxzLCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0WzBdLnB1c2godmFsdWUpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFswXS5wdXNoKHZhbHVlX2Rlc2MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENvcnJlY3QgZm9yIG9kZCByb290IGNhc2VzXG4gICAgICBpZiAocm9vdC5sZW5ndGggPCBzZWxmLmRhdGEub3V0cHV0Lmxlbmd0aC0xKSB7XG4gICAgICAgIGlmIChpbnRlcnZhbCA9PSAwKSB7XG4gICAgICAgICAgZWFjaChzZWxmLmRhdGEub3V0cHV0LCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV0ucHVzaChwbHVja2VkX2luZGV4W2ktMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ludGVydmFsKzFdLnB1c2gocGx1Y2tlZF9pbmRleFswXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgbGFiZWwgY29sdW1uXG4gICAgaWYgKCFwbHVja2VkX2luZGV4ICYmIGRpc2NvdmVyZWRfbGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChpbnRlcnZhbCA9PSAwKSB7XG4gICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbMF0ucHVzaChsYWJlbF9kZXNjKTtcbiAgICAgICAgc2VsZi5kYXRhLm91dHB1dFswXS5wdXNoKHZhbHVlX2Rlc2MpO1xuICAgICAgfVxuICAgICAgc2VsZi5kYXRhLm91dHB1dFtpbnRlcnZhbCsxXS5wdXNoKGRpc2NvdmVyZWRfbGFiZWxzWzBdKTtcbiAgICB9XG5cbiAgICBpZiAoIXBsdWNrZWRfaW5kZXggJiYgZGlzY292ZXJlZF9sYWJlbHMubGVuZ3RoID09IDApIHtcbiAgICAgIC8vIFtSRVZJU0lUXVxuICAgICAgc2VsZi5kYXRhLm91dHB1dFswXS5wdXNoKCcnKTtcbiAgICB9XG5cbiAgICAvLyBBcHBlbmQgdmFsdWVzXG4gICAgaWYgKHBsdWNrZWRfdmFsdWUpIHtcbiAgICAgIC8vIENvcnJlY3QgZm9yIG9kZCByb290IGNhc2VzXG4gICAgICBpZiAocm9vdC5sZW5ndGggPCBzZWxmLmRhdGEub3V0cHV0Lmxlbmd0aC0xKSB7XG4gICAgICAgIGlmIChpbnRlcnZhbCA9PSAwKSB7XG4gICAgICAgICAgZWFjaChzZWxmLmRhdGEub3V0cHV0LCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV0ucHVzaChwbHVja2VkX3ZhbHVlW2ktMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlYWNoKHBsdWNrZWRfdmFsdWUsIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ludGVydmFsKzFdLnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYXBwZW5kIG51bGwgYWNyb3NzIHRoaXMgcm93XG4gICAgICBlYWNoKHNlbGYuZGF0YS5vdXRwdXRbMF0sIGZ1bmN0aW9uKGNlbGwsIGkpe1xuICAgICAgICB2YXIgb2Zmc2V0ID0gKHBsdWNrZWRfaW5kZXgpID8gMCA6IC0xO1xuICAgICAgICBpZiAoaSA+IG9mZnNldCkge1xuICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaW50ZXJ2YWwrMV0ucHVzaChudWxsKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgfSk7XG5cbiAgc2VsZi5mb3JtYXQob3B0aW9ucy51bnBhY2spO1xuICAvL3NlbGYuc29ydChvcHRpb25zLnNvcnQpO1xuICByZXR1cm4gdGhpcztcbn1cblxuXG5cbi8vIFN0cmluZyBjb25maWdzIHRvIGhhc2ggcGF0aHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIF9vcHRIYXNoKG9wdGlvbnMpe1xuICBlYWNoKG9wdGlvbnMudW5wYWNrLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmplY3Qpe1xuICAgIGlmICh2YWx1ZSAmJiBpcyh2YWx1ZSwgJ3N0cmluZycpKSB7XG4gICAgICBvcHRpb25zLnVucGFja1trZXldID0geyBwYXRoOiBvcHRpb25zLnVucGFja1trZXldIH07XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG9wdGlvbnM7XG59XG5cblxuLy8gdmlhOiBodHRwczovL2dpdGh1Yi5jb20vc3BvY2tlL3B1bnltY2VcbmZ1bmN0aW9uIGlzKG8sIHQpe1xuICBvID0gdHlwZW9mKG8pO1xuICBpZiAoIXQpe1xuICAgIHJldHVybiBvICE9ICd1bmRlZmluZWQnO1xuICB9XG4gIHJldHVybiBvID09IHQ7XG59XG5cbi8vIEFkYXB0ZWQgdG8gZXhjbHVkZSBudWxsIHZhbHVlc1xuZnVuY3Rpb24gZXh0ZW5kKG8sIGUpe1xuICBlYWNoKGUsIGZ1bmN0aW9uKHYsIG4pe1xuICAgIGlmIChpcyhvW25dLCAnb2JqZWN0JykgJiYgaXModiwgJ29iamVjdCcpKXtcbiAgICAgIG9bbl0gPSBleHRlbmQob1tuXSwgdik7XG4gICAgfSBlbHNlIGlmICh2ICE9PSBudWxsKSB7XG4gICAgICBvW25dID0gdjtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhc2V0O1xuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoXCIuLi9jb3JlL3V0aWxzL2V4dGVuZFwiKSxcbiAgICBEYXRhc2V0ID0gcmVxdWlyZShcIi4vZGF0YXNldFwiKTtcblxuZXh0ZW5kKERhdGFzZXQucHJvdG90eXBlLCByZXF1aXJlKFwiLi9saWIvYXBwZW5kXCIpKTtcbmV4dGVuZChEYXRhc2V0LnByb3RvdHlwZSwgcmVxdWlyZShcIi4vbGliL2RlbGV0ZVwiKSk7XG5leHRlbmQoRGF0YXNldC5wcm90b3R5cGUsIHJlcXVpcmUoXCIuL2xpYi9maWx0ZXJcIikpO1xuZXh0ZW5kKERhdGFzZXQucHJvdG90eXBlLCByZXF1aXJlKFwiLi9saWIvaW5zZXJ0XCIpKTtcbmV4dGVuZChEYXRhc2V0LnByb3RvdHlwZSwgcmVxdWlyZShcIi4vbGliL3NlbGVjdFwiKSk7XG5leHRlbmQoRGF0YXNldC5wcm90b3R5cGUsIHJlcXVpcmUoXCIuL2xpYi9zZXRcIikpO1xuZXh0ZW5kKERhdGFzZXQucHJvdG90eXBlLCByZXF1aXJlKFwiLi9saWIvc29ydFwiKSk7XG5leHRlbmQoRGF0YXNldC5wcm90b3R5cGUsIHJlcXVpcmUoXCIuL2xpYi91cGRhdGVcIikpO1xuXG5leHRlbmQoRGF0YXNldC5wcm90b3R5cGUsIHJlcXVpcmUoXCIuL2xpYi9hbmFseXNlc1wiKSk7XG5leHRlbmQoRGF0YXNldC5wcm90b3R5cGUsIHtcbiAgXCJmb3JtYXRcIjogcmVxdWlyZShcIi4vbGliL2Zvcm1hdFwiKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YXNldDtcbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKSxcbiAgICBhcnIgPSBbXCJBdmVyYWdlXCIsIFwiTWF4aW11bVwiLCBcIk1pbmltdW1cIiwgXCJTdW1cIl0sXG4gICAgb3V0cHV0ID0ge307XG5cbm91dHB1dFtcImF2ZXJhZ2VcIl0gPSBmdW5jdGlvbihhcnIsIHN0YXJ0LCBlbmQpe1xuICB2YXIgc2V0ID0gYXJyLnNsaWNlKHN0YXJ0fHwwLCAoZW5kID8gZW5kKzEgOiBhcnIubGVuZ3RoKSksXG4gICAgICBzdW0gPSAwLFxuICAgICAgYXZnID0gbnVsbDtcblxuICAvLyBBZGQgbnVtZXJpYyB2YWx1ZXNcbiAgZWFjaChzZXQsIGZ1bmN0aW9uKHZhbCwgaSl7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCIgJiYgIWlzTmFOKHBhcnNlRmxvYXQodmFsKSkpIHtcbiAgICAgIHN1bSArPSBwYXJzZUZsb2F0KHZhbCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHN1bSAvIHNldC5sZW5ndGg7XG59O1xuXG5vdXRwdXRbXCJtYXhpbXVtXCJdID0gZnVuY3Rpb24oYXJyLCBzdGFydCwgZW5kKXtcbiAgdmFyIHNldCA9IGFyci5zbGljZShzdGFydHx8MCwgKGVuZCA/IGVuZCsxIDogYXJyLmxlbmd0aCkpLFxuICAgICAgbnVtcyA9IFtdO1xuXG4gIC8vIFB1bGwgbnVtZXJpYyB2YWx1ZXNcbiAgZWFjaChzZXQsIGZ1bmN0aW9uKHZhbCwgaSl7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCIgJiYgIWlzTmFOKHBhcnNlRmxvYXQodmFsKSkpIHtcbiAgICAgIG51bXMucHVzaChwYXJzZUZsb2F0KHZhbCkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCBudW1zKTtcbn07XG5cbm91dHB1dFtcIm1pbmltdW1cIl0gPSBmdW5jdGlvbihhcnIsIHN0YXJ0LCBlbmQpe1xuICB2YXIgc2V0ID0gYXJyLnNsaWNlKHN0YXJ0fHwwLCAoZW5kID8gZW5kKzEgOiBhcnIubGVuZ3RoKSksXG4gICAgICBudW1zID0gW107XG5cbiAgLy8gUHVsbCBudW1lcmljIHZhbHVlc1xuICBlYWNoKHNldCwgZnVuY3Rpb24odmFsLCBpKXtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIiAmJiAhaXNOYU4ocGFyc2VGbG9hdCh2YWwpKSkge1xuICAgICAgbnVtcy5wdXNoKHBhcnNlRmxvYXQodmFsKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIG51bXMpO1xufTtcblxub3V0cHV0W1wic3VtXCJdID0gZnVuY3Rpb24oYXJyLCBzdGFydCwgZW5kKXtcbiAgLy8gQ29weSBzZXQgd2l0aCBnaXZlbiByYW5nZVxuICB2YXIgc2V0ID0gYXJyLnNsaWNlKHN0YXJ0fHwwLCAoZW5kID8gZW5kKzEgOiBhcnIubGVuZ3RoKSksXG4gICAgICBzdW0gPSAwO1xuXG4gIC8vIEFkZCBudW1lcmljIHZhbHVlc1xuICBlYWNoKHNldCwgZnVuY3Rpb24odmFsLCBpKXtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIiAmJiAhaXNOYU4ocGFyc2VGbG9hdCh2YWwpKSkge1xuICAgICAgc3VtICs9IHBhcnNlRmxvYXQodmFsKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc3VtO1xufTtcblxuLy8gQ29udmVuaWVuY2UgbWV0aG9kc1xuXG5lYWNoKGFyciwgZnVuY3Rpb24odixpKXtcbiAgb3V0cHV0W1wiZ2V0Q29sdW1uXCIrdl0gPSBvdXRwdXRbXCJnZXRSb3dcIit2XSA9IGZ1bmN0aW9uKGFycil7XG4gICAgcmV0dXJuIHRoaXNbdi50b0xvd2VyQ2FzZSgpXShhcnIsIDEpO1xuICB9O1xufSk7XG5cbm91dHB1dFtcImdldENvbHVtbkxhYmVsXCJdID0gb3V0cHV0W1wiZ2V0Um93SW5kZXhcIl0gPSBmdW5jdGlvbihhcnIpe1xuICByZXR1cm4gYXJyWzBdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBvdXRwdXQ7XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG52YXIgY3JlYXRlTnVsbExpc3QgPSByZXF1aXJlKCcuLi91dGlscy9jcmVhdGUtbnVsbC1saXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcImFwcGVuZENvbHVtblwiOiBhcHBlbmRDb2x1bW4sXG4gIFwiYXBwZW5kUm93XCI6IGFwcGVuZFJvd1xufTtcblxuZnVuY3Rpb24gYXBwZW5kQ29sdW1uKHN0ciwgaW5wdXQpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSxcbiAgICAgIGxhYmVsID0gKHN0ciAhPT0gdW5kZWZpbmVkKSA/IHN0ciA6IG51bGw7XG5cbiAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgc2VsZi5kYXRhLm91dHB1dFswXS5wdXNoKGxhYmVsKTtcbiAgICBlYWNoKHNlbGYub3V0cHV0KCksIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICB2YXIgY2VsbDtcbiAgICAgIGlmIChpID4gMCkge1xuICAgICAgICBjZWxsID0gaW5wdXQuY2FsbChzZWxmLCByb3csIGkpO1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBjZWxsID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldLnB1c2goY2VsbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBlbHNlIGlmICghaW5wdXQgfHwgaW5wdXQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGlucHV0ID0gaW5wdXQgfHwgW107XG5cbiAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IHNlbGYub3V0cHV0KCkubGVuZ3RoIC0gMSkge1xuICAgICAgaW5wdXQgPSBpbnB1dC5jb25jYXQoIGNyZWF0ZU51bGxMaXN0KHNlbGYub3V0cHV0KCkubGVuZ3RoIC0gMSAtIGlucHV0Lmxlbmd0aCkgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBJZiB0aGlzIG5ldyBjb2x1bW4gaXMgbG9uZ2VyIHRoYW4gZXhpc3RpbmcgY29sdW1ucyxcbiAgICAgIC8vIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSByZXN0IHRvIG1hdGNoIC4uLlxuICAgICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgICBpZiAoc2VsZi5kYXRhLm91dHB1dC5sZW5ndGggLTEgPCBpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICBhcHBlbmRSb3cuY2FsbChzZWxmLCBTdHJpbmcoIHNlbGYuZGF0YS5vdXRwdXQubGVuZ3RoICkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzZWxmLmRhdGEub3V0cHV0WzBdLnB1c2gobGFiZWwpO1xuICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaSsxXVtzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aC0xXSA9IHZhbHVlO1xuICAgIH0pO1xuXG4gIH1cblxuICByZXR1cm4gc2VsZjtcbn1cblxuXG5mdW5jdGlvbiBhcHBlbmRSb3coc3RyLCBpbnB1dCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpLFxuICAgICAgbGFiZWwgPSAoc3RyICE9PSB1bmRlZmluZWQpID8gc3RyIDogbnVsbCxcbiAgICAgIG5ld1JvdyA9IFtdO1xuXG4gIG5ld1Jvdy5wdXNoKGxhYmVsKTtcblxuICBpZiAodHlwZW9mIGlucHV0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBlYWNoKHNlbGYuZGF0YS5vdXRwdXRbMF0sIGZ1bmN0aW9uKGxhYmVsLCBpKXtcbiAgICAgIHZhciBjb2wsIGNlbGw7XG4gICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgY29sID0gc2VsZi5zZWxlY3RDb2x1bW4oaSk7XG4gICAgICAgIGNlbGwgPSBpbnB1dC5jYWxsKHNlbGYsIGNvbCwgaSk7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGNlbGwgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIG5ld1Jvdy5wdXNoKGNlbGwpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYuZGF0YS5vdXRwdXQucHVzaChuZXdSb3cpO1xuICB9XG5cbiAgZWxzZSBpZiAoIWlucHV0IHx8IGlucHV0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBpbnB1dCA9IGlucHV0IHx8IFtdO1xuXG4gICAgaWYgKGlucHV0Lmxlbmd0aCA8PSBzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCAtIDEpIHtcbiAgICAgIGlucHV0ID0gaW5wdXQuY29uY2F0KCBjcmVhdGVOdWxsTGlzdCggc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggLSAxIC0gaW5wdXQubGVuZ3RoICkgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICAgIGlmIChzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCAtMSA8IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgIGFwcGVuZENvbHVtbi5jYWxsKHNlbGYsIFN0cmluZyggc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbGYuZGF0YS5vdXRwdXQucHVzaCggbmV3Um93LmNvbmNhdChpbnB1dCkgKTtcbiAgfVxuXG4gIHJldHVybiBzZWxmO1xufVxuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJkZWxldGVDb2x1bW5cIjogZGVsZXRlQ29sdW1uLFxuICBcImRlbGV0ZVJvd1wiOiBkZWxldGVSb3dcbn07XG5cbmZ1bmN0aW9uIGRlbGV0ZUNvbHVtbihxKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgaW5kZXggPSAodHlwZW9mIHEgPT09ICdudW1iZXInKSA/IHEgOiB0aGlzLmRhdGEub3V0cHV0WzBdLmluZGV4T2YocSk7XG5cbiAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICBlYWNoKHNlbGYuZGF0YS5vdXRwdXQsIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICBzZWxmLmRhdGEub3V0cHV0W2ldLnNwbGljZShpbmRleCwgMSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHNlbGY7XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZVJvdyhxKXtcbiAgdmFyIGluZGV4ID0gKHR5cGVvZiBxID09PSAnbnVtYmVyJykgPyBxIDogdGhpcy5zZWxlY3RDb2x1bW4oMCkuaW5kZXhPZihxKTtcblxuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIHRoaXMuZGF0YS5vdXRwdXQuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiZmlsdGVyQ29sdW1uc1wiOiBmaWx0ZXJDb2x1bW5zLFxuICBcImZpbHRlclJvd3NcIjogZmlsdGVyUm93c1xufTtcblxuZnVuY3Rpb24gZmlsdGVyQ29sdW1ucyhmbil7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGNsb25lID0gbmV3IEFycmF5KCk7XG5cbiAgZWFjaChzZWxmLmRhdGEub3V0cHV0LCBmdW5jdGlvbihyb3csIGkpe1xuICAgIGNsb25lLnB1c2goW10pO1xuICB9KTtcblxuICBlYWNoKHNlbGYuZGF0YS5vdXRwdXRbMF0sIGZ1bmN0aW9uKGNvbCwgaSl7XG4gICAgdmFyIHNlbGVjdGVkQ29sdW1uID0gc2VsZi5zZWxlY3RDb2x1bW4oaSk7XG4gICAgaWYgKGkgPT0gMCB8fCBmbi5jYWxsKHNlbGYsIHNlbGVjdGVkQ29sdW1uLCBpKSkge1xuICAgICAgZWFjaChzZWxlY3RlZENvbHVtbiwgZnVuY3Rpb24oY2VsbCwgcmkpe1xuICAgICAgICBjbG9uZVtyaV0ucHVzaChjZWxsKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgc2VsZi5vdXRwdXQoY2xvbmUpO1xuICByZXR1cm4gc2VsZjtcbn1cblxuZnVuY3Rpb24gZmlsdGVyUm93cyhmbil7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGNsb25lID0gW107XG5cbiAgZWFjaChzZWxmLm91dHB1dCgpLCBmdW5jdGlvbihyb3csIGkpe1xuICAgIGlmIChpID09IDAgfHwgZm4uY2FsbChzZWxmLCByb3csIGkpKSB7XG4gICAgICBjbG9uZS5wdXNoKHJvdyk7XG4gICAgfVxuICB9KTtcblxuICBzZWxmLm91dHB1dChjbG9uZSk7XG4gIHJldHVybiBzZWxmO1xufVxuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5tZXRob2QoKSA9PT0gJ3NlbGVjdCcpIHtcblxuICAgICAgZWFjaChzZWxmLm91dHB1dCgpLCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgICAvLyBSZXBsYWNlIGxhYmVsc1xuICAgICAgICBpZiAoaSA9PSAwKSB7XG4gICAgICAgICAgZWFjaChyb3csIGZ1bmN0aW9uKGNlbGwsIGope1xuICAgICAgICAgICAgaWYgKG9wdGlvbnNbal0gJiYgb3B0aW9uc1tqXS5sYWJlbCkge1xuICAgICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldW2pdID0gb3B0aW9uc1tqXS5sYWJlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlYWNoKHJvdywgZnVuY3Rpb24oY2VsbCwgail7XG4gICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldW2pdID0gX2FwcGx5Rm9ybWF0KHNlbGYuZGF0YS5vdXRwdXRbaV1bal0sIG9wdGlvbnNbal0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH1cblxuICBpZiAodGhpcy5tZXRob2QoKSA9PT0gJ3VucGFjaycpIHtcblxuICAgIGlmIChvcHRpb25zLmluZGV4KSB7XG4gICAgICBlYWNoKHNlbGYub3V0cHV0KCksIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy5pbmRleC5sYWJlbCkge1xuICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXVswXSA9IG9wdGlvbnMuaW5kZXgubGFiZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV1bMF0gPSBfYXBwbHlGb3JtYXQoc2VsZi5kYXRhLm91dHB1dFtpXVswXSwgb3B0aW9ucy5pbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmxhYmVsKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbmRleCkge1xuICAgICAgICBlYWNoKHNlbGYub3V0cHV0KCksIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICAgICAgZWFjaChyb3csIGZ1bmN0aW9uKGNlbGwsIGope1xuICAgICAgICAgICAgaWYgKGkgPT0gMCAmJiBqID4gMCkge1xuICAgICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldW2pdID0gX2FwcGx5Rm9ybWF0KHNlbGYuZGF0YS5vdXRwdXRbaV1bal0sIG9wdGlvbnMubGFiZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVhY2goc2VsZi5vdXRwdXQoKSwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV1bMF0gPSBfYXBwbHlGb3JtYXQoc2VsZi5kYXRhLm91dHB1dFtpXVswXSwgb3B0aW9ucy5sYWJlbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy52YWx1ZSkge1xuICAgICAgaWYgKG9wdGlvbnMuaW5kZXgpIHtcbiAgICAgICAgLy8gc3RhcnQgPiAwXG4gICAgICAgIGVhY2goc2VsZi5vdXRwdXQoKSwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgICAgICBlYWNoKHJvdywgZnVuY3Rpb24oY2VsbCwgail7XG4gICAgICAgICAgICBpZiAoaSA+IDAgJiYgaiA+IDApIHtcbiAgICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXVtqXSA9IF9hcHBseUZvcm1hdChzZWxmLmRhdGEub3V0cHV0W2ldW2pdLCBvcHRpb25zLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBzdGFydCBAIDBcbiAgICAgICAgZWFjaChzZWxmLm91dHB1dCgpLCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgICAgIGVhY2gocm93LCBmdW5jdGlvbihjZWxsLCBqKXtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldW2pdID0gX2FwcGx5Rm9ybWF0KHNlbGYuZGF0YS5vdXRwdXRbaV1bal0sIG9wdGlvbnMudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuXG4gIHJldHVybiBzZWxmO1xufTtcblxuZnVuY3Rpb24gX2FwcGx5Rm9ybWF0KHZhbHVlLCBvcHRzKXtcbiAgdmFyIG91dHB1dCA9IHZhbHVlLFxuICAgICAgb3B0aW9ucyA9IG9wdHMgfHwge307XG5cbiAgaWYgKG9wdGlvbnMucmVwbGFjZSkge1xuICAgIGVhY2gob3B0aW9ucy5yZXBsYWNlLCBmdW5jdGlvbih2YWwsIGtleSl7XG4gICAgICBpZiAob3V0cHV0ID09IGtleSB8fCBTdHJpbmcob3V0cHV0KSA9PSBTdHJpbmcoa2V5KSB8fCBwYXJzZUZsb2F0KG91dHB1dCkgPT0gcGFyc2VGbG9hdChrZXkpKSB7XG4gICAgICAgIG91dHB1dCA9IHZhbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLnR5cGUgJiYgb3B0aW9ucy50eXBlID09ICdkYXRlJykge1xuICAgIGlmIChvcHRpb25zLmZvcm1hdCAmJiBtb21lbnQgJiYgbW9tZW50KHZhbHVlKS5pc1ZhbGlkKCkpIHtcbiAgICAgIG91dHB1dCA9IG1vbWVudChvdXRwdXQpLmZvcm1hdChvcHRpb25zLmZvcm1hdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dCA9IG5ldyBEYXRlKG91dHB1dCk7IC8vLnRvSVNPU3RyaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdGlvbnMudHlwZSAmJiBvcHRpb25zLnR5cGUgPT0gJ3N0cmluZycpIHtcbiAgICBvdXRwdXQgPSBTdHJpbmcob3V0cHV0KTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLnR5cGUgJiYgb3B0aW9ucy50eXBlID09ICdudW1iZXInICYmICFpc05hTihwYXJzZUZsb2F0KG91dHB1dCkpKSB7XG4gICAgb3V0cHV0ID0gcGFyc2VGbG9hdChvdXRwdXQpO1xuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn1cbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcbnZhciBjcmVhdGVOdWxsTGlzdCA9IHJlcXVpcmUoJy4uL3V0aWxzL2NyZWF0ZS1udWxsLWxpc3QnKTtcbnZhciBhcHBlbmQgPSByZXF1aXJlKCcuL2FwcGVuZCcpO1xuXG52YXIgYXBwZW5kUm93ID0gYXBwZW5kLmFwcGVuZFJvdyxcbiAgICBhcHBlbmRDb2x1bW4gPSBhcHBlbmQuYXBwZW5kQ29sdW1uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJpbnNlcnRDb2x1bW5cIjogaW5zZXJ0Q29sdW1uLFxuICBcImluc2VydFJvd1wiOiBpbnNlcnRSb3dcbn07XG5cbmZ1bmN0aW9uIGluc2VydENvbHVtbihpbmRleCwgc3RyLCBpbnB1dCl7XG4gIHZhciBzZWxmID0gdGhpcywgbGFiZWw7XG5cbiAgbGFiZWwgPSAoc3RyICE9PSB1bmRlZmluZWQpID8gc3RyIDogbnVsbDtcblxuICBpZiAodHlwZW9mIGlucHV0ID09PSBcImZ1bmN0aW9uXCIpIHtcblxuICAgIHNlbGYuZGF0YS5vdXRwdXRbMF0uc3BsaWNlKGluZGV4LCAwLCBsYWJlbCk7XG4gICAgZWFjaChzZWxmLm91dHB1dCgpLCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgdmFyIGNlbGw7XG4gICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgY2VsbCA9IGlucHV0LmNhbGwoc2VsZiwgcm93LCBpKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjZWxsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgY2VsbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXS5zcGxpY2UoaW5kZXgsIDAsIGNlbGwpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH1cblxuICBlbHNlIGlmICghaW5wdXQgfHwgaW5wdXQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGlucHV0ID0gaW5wdXQgfHwgW107XG5cbiAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IHNlbGYub3V0cHV0KCkubGVuZ3RoIC0gMSkge1xuICAgICAgaW5wdXQgPSBpbnB1dC5jb25jYXQoIGNyZWF0ZU51bGxMaXN0KHNlbGYub3V0cHV0KCkubGVuZ3RoIC0gMSAtIGlucHV0Lmxlbmd0aCkgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBJZiB0aGlzIG5ldyBjb2x1bW4gaXMgbG9uZ2VyIHRoYW4gZXhpc3RpbmcgY29sdW1ucyxcbiAgICAgIC8vIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSByZXN0IHRvIG1hdGNoIC4uLlxuICAgICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgICBpZiAoc2VsZi5kYXRhLm91dHB1dC5sZW5ndGggLTEgPCBpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICBhcHBlbmRSb3cuY2FsbChzZWxmLCBTdHJpbmcoIHNlbGYuZGF0YS5vdXRwdXQubGVuZ3RoICkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzZWxmLmRhdGEub3V0cHV0WzBdLnNwbGljZShpbmRleCwgMCwgbGFiZWwpO1xuICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaSsxXS5zcGxpY2UoaW5kZXgsIDAsIHZhbHVlKTtcbiAgICB9KTtcblxuICB9XG4gIHJldHVybiBzZWxmO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRSb3coaW5kZXgsIHN0ciwgaW5wdXQpe1xuICB2YXIgc2VsZiA9IHRoaXMsIGxhYmVsLCBuZXdSb3cgPSBbXTtcblxuICBsYWJlbCA9IChzdHIgIT09IHVuZGVmaW5lZCkgPyBzdHIgOiBudWxsO1xuICBuZXdSb3cucHVzaChsYWJlbCk7XG5cbiAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZWFjaChzZWxmLm91dHB1dCgpWzBdLCBmdW5jdGlvbihsYWJlbCwgaSl7XG4gICAgICB2YXIgY29sLCBjZWxsO1xuICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgIGNvbCA9IHNlbGYuc2VsZWN0Q29sdW1uKGkpO1xuICAgICAgICBjZWxsID0gaW5wdXQuY2FsbChzZWxmLCBjb2wsIGkpO1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBjZWxsID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBuZXdSb3cucHVzaChjZWxsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBzZWxmLmRhdGEub3V0cHV0LnNwbGljZShpbmRleCwgMCwgbmV3Um93KTtcbiAgfVxuXG4gIGVsc2UgaWYgKCFpbnB1dCB8fCBpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgaW5wdXQgPSBpbnB1dCB8fCBbXTtcblxuICAgIGlmIChpbnB1dC5sZW5ndGggPD0gc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggLSAxKSB7XG4gICAgICBpbnB1dCA9IGlucHV0LmNvbmNhdCggY3JlYXRlTnVsbExpc3QoIHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoIC0gMSAtIGlucHV0Lmxlbmd0aCApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgICBpZiAoc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggLTEgPCBpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICBhcHBlbmRDb2x1bW4uY2FsbChzZWxmLCBTdHJpbmcoIHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoICkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzZWxmLmRhdGEub3V0cHV0LnNwbGljZShpbmRleCwgMCwgbmV3Um93LmNvbmNhdChpbnB1dCkgKTtcbiAgfVxuXG4gIHJldHVybiBzZWxmO1xufVxuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJzZWxlY3RDb2x1bW5cIjogc2VsZWN0Q29sdW1uLFxuICBcInNlbGVjdFJvd1wiOiBzZWxlY3RSb3dcbn07XG5cbmZ1bmN0aW9uIHNlbGVjdENvbHVtbihxKXtcbiAgdmFyIHJlc3VsdCA9IG5ldyBBcnJheSgpLFxuICAgICAgaW5kZXggPSAodHlwZW9mIHEgPT09ICdudW1iZXInKSA/IHEgOiB0aGlzLmRhdGEub3V0cHV0WzBdLmluZGV4T2YocSk7XG5cbiAgaWYgKGluZGV4ID4gLTEgJiYgJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLmRhdGEub3V0cHV0WzBdW2luZGV4XSkge1xuICAgIGVhY2godGhpcy5kYXRhLm91dHB1dCwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgIHJlc3VsdC5wdXNoKHJvd1tpbmRleF0pO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdFJvdyhxKXtcbiAgdmFyIHJlc3VsdCA9IG5ldyBBcnJheSgpLFxuICAgICAgaW5kZXggPSAodHlwZW9mIHEgPT09ICdudW1iZXInKSA/IHEgOiB0aGlzLnNlbGVjdENvbHVtbigwKS5pbmRleE9mKHEpO1xuXG4gIGlmIChpbmRleCA+IC0xICYmICd1bmRlZmluZWQnICE9PSB0eXBlb2YgdGhpcy5kYXRhLm91dHB1dFtpbmRleF0pIHtcbiAgICByZXN1bHQgPSB0aGlzLmRhdGEub3V0cHV0W2luZGV4XTtcbiAgfVxuICByZXR1cm4gIHJlc3VsdDtcbn1cbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxudmFyIGFwcGVuZCA9IHJlcXVpcmUoJy4vYXBwZW5kJyk7XG52YXIgc2VsZWN0ID0gcmVxdWlyZSgnLi9zZWxlY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwic2V0XCI6IHNldFxufTtcblxuZnVuY3Rpb24gc2V0KGNvb3JkcywgdmFsdWUpe1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIgfHwgY29vcmRzLmxlbmd0aCA8IDIpIHtcbiAgICB0aHJvdyBFcnJvcignSW5jb3JyZWN0IGFyZ3VtZW50cyBwcm92aWRlZCBmb3IgI3NldCBtZXRob2QnKTtcbiAgfVxuXG4gIHZhciBjb2xJbmRleCA9ICdudW1iZXInID09PSB0eXBlb2YgY29vcmRzWzBdID8gY29vcmRzWzBdIDogdGhpcy5kYXRhLm91dHB1dFswXS5pbmRleE9mKGNvb3Jkc1swXSksXG4gICAgICByb3dJbmRleCA9ICdudW1iZXInID09PSB0eXBlb2YgY29vcmRzWzFdID8gY29vcmRzWzFdIDogc2VsZWN0LnNlbGVjdENvbHVtbi5jYWxsKHRoaXMsIDApLmluZGV4T2YoY29vcmRzWzFdKTtcblxuICB2YXIgY29sUmVzdWx0ID0gc2VsZWN0LnNlbGVjdENvbHVtbi5jYWxsKHRoaXMsIGNvb3Jkc1swXSksIC8vIHRoaXMuZGF0YS5vdXRwdXRbMF1bY29vcmRzWzBdXSxcbiAgICAgIHJvd1Jlc3VsdCA9IHNlbGVjdC5zZWxlY3RSb3cuY2FsbCh0aGlzLCBjb29yZHNbMV0pO1xuXG4gIC8vIENvbHVtbiBkb2Vzbid0IGV4aXN0Li4uXG4gIC8vICBMZXQncyBjcmVhdGUgaXQgYW5kIHJlc2V0IGNvbEluZGV4XG4gIGlmIChjb2xSZXN1bHQubGVuZ3RoIDwgMSkge1xuICAgIGFwcGVuZC5hcHBlbmRDb2x1bW4uY2FsbCh0aGlzLCBjb29yZHNbMF0pO1xuICAgIGNvbEluZGV4ID0gdGhpcy5kYXRhLm91dHB1dFswXS5sZW5ndGgtMTtcbiAgfVxuXG4gIC8vIFJvdyBkb2Vzbid0IGV4aXN0Li4uXG4gIC8vICBMZXQncyBjcmVhdGUgaXQgYW5kIHJlc2V0IHJvd0luZGV4XG4gIGlmIChyb3dSZXN1bHQubGVuZ3RoIDwgMSkge1xuICAgIGFwcGVuZC5hcHBlbmRSb3cuY2FsbCh0aGlzLCBjb29yZHNbMV0pO1xuICAgIHJvd0luZGV4ID0gdGhpcy5kYXRhLm91dHB1dC5sZW5ndGgtMTtcbiAgfVxuXG4gIC8vIFNldCBwcm92aWRlZCB2YWx1ZVxuICB0aGlzLmRhdGEub3V0cHV0WyByb3dJbmRleCBdWyBjb2xJbmRleCBdID0gdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufVxuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJzb3J0Q29sdW1uc1wiOiBzb3J0Q29sdW1ucyxcbiAgXCJzb3J0Um93c1wiOiBzb3J0Um93c1xufTtcblxuZnVuY3Rpb24gc29ydENvbHVtbnMoc3RyLCBjb21wKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgaGVhZCA9IHRoaXMub3V0cHV0KClbMF0uc2xpY2UoMSksIC8vIG1pbnVzIGluZGV4XG4gICAgICBjb2xzID0gW10sXG4gICAgICBjbG9uZSA9IFtdLFxuICAgICAgZm4gPSBjb21wIHx8IHRoaXMuZ2V0Q29sdW1uTGFiZWw7XG5cbiAgLy8gSXNvbGF0ZSBlYWNoIGNvbHVtbiAoZXhjZXB0IHRoZSBpbmRleClcbiAgZWFjaChoZWFkLCBmdW5jdGlvbihjZWxsLCBpKXtcbiAgICBjb2xzLnB1c2goc2VsZi5zZWxlY3RDb2x1bW4oaSsxKS5zbGljZSgwKSk7XG4gIH0pO1xuICBjb2xzLnNvcnQoZnVuY3Rpb24oYSxiKXtcbiAgICAvLyBJZiBmbihhKSA+IGZuKGIpXG4gICAgdmFyIG9wID0gZm4uY2FsbChzZWxmLCBhKSA+IGZuLmNhbGwoc2VsZiwgYik7XG4gICAgaWYgKG9wKSB7XG4gICAgICByZXR1cm4gKHN0ciA9PT0gXCJhc2NcIiA/IDEgOiAtMSk7XG4gICAgfSBlbHNlIGlmICghb3ApIHtcbiAgICAgIHJldHVybiAoc3RyID09PSBcImFzY1wiID8gLTEgOiAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICB9KTtcbiAgZWFjaChjb2xzLCBmdW5jdGlvbihjb2wsIGkpe1xuICAgIHNlbGZcbiAgICAgIC5kZWxldGVDb2x1bW4oaSsxKVxuICAgICAgLmluc2VydENvbHVtbihpKzEsIGNvbFswXSwgY29sLnNsaWNlKDEpKTtcbiAgfSk7XG4gIHJldHVybiBzZWxmO1xufVxuXG5mdW5jdGlvbiBzb3J0Um93cyhzdHIsIGNvbXApe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBoZWFkID0gdGhpcy5vdXRwdXQoKS5zbGljZSgwLDEpLFxuICAgICAgYm9keSA9IHRoaXMub3V0cHV0KCkuc2xpY2UoMSksXG4gICAgICBmbiA9IGNvbXAgfHwgdGhpcy5nZXRSb3dJbmRleDtcblxuICBib2R5LnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgLy8gSWYgZm4oYSkgPiBmbihiKVxuICAgIHZhciBvcCA9IGZuLmNhbGwoc2VsZiwgYSkgPiBmbi5jYWxsKHNlbGYsIGIpO1xuICAgIGlmIChvcCkge1xuICAgICAgcmV0dXJuIChzdHIgPT09IFwiYXNjXCIgPyAxIDogLTEpO1xuICAgIH0gZWxzZSBpZiAoIW9wKSB7XG4gICAgICByZXR1cm4gKHN0ciA9PT0gXCJhc2NcIiA/IC0xIDogMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfSk7XG4gIHNlbGYub3V0cHV0KGhlYWQuY29uY2F0KGJvZHkpKTtcbiAgcmV0dXJuIHNlbGY7XG59XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG52YXIgY3JlYXRlTnVsbExpc3QgPSByZXF1aXJlKCcuLi91dGlscy9jcmVhdGUtbnVsbC1saXN0Jyk7XG52YXIgYXBwZW5kID0gcmVxdWlyZSgnLi9hcHBlbmQnKTtcblxudmFyIGFwcGVuZFJvdyA9IGFwcGVuZC5hcHBlbmRSb3csXG4gICAgYXBwZW5kQ29sdW1uID0gYXBwZW5kLmFwcGVuZENvbHVtbjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwidXBkYXRlQ29sdW1uXCI6IHVwZGF0ZUNvbHVtbixcbiAgXCJ1cGRhdGVSb3dcIjogdXBkYXRlUm93XG59O1xuXG5mdW5jdGlvbiB1cGRhdGVDb2x1bW4ocSwgaW5wdXQpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBpbmRleCA9ICh0eXBlb2YgcSA9PT0gJ251bWJlcicpID8gcSA6IHRoaXMuZGF0YS5vdXRwdXRbMF0uaW5kZXhPZihxKTtcblxuICBpZiAoaW5kZXggPiAtMSkge1xuXG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJmdW5jdGlvblwiKSB7XG5cbiAgICAgIGVhY2goc2VsZi5vdXRwdXQoKSwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgICAgdmFyIGNlbGw7XG4gICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgIGNlbGwgPSBpbnB1dC5jYWxsKHNlbGYsIHJvd1tpbmRleF0sIGksIHJvdyk7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjZWxsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldW2luZGV4XSA9IGNlbGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSBpZiAoIWlucHV0IHx8IGlucHV0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGlucHV0ID0gaW5wdXQgfHwgW107XG5cbiAgICAgIGlmIChpbnB1dC5sZW5ndGggPD0gc2VsZi5vdXRwdXQoKS5sZW5ndGggLSAxKSB7XG4gICAgICAgIGlucHV0ID0gaW5wdXQuY29uY2F0KCBjcmVhdGVOdWxsTGlzdChzZWxmLm91dHB1dCgpLmxlbmd0aCAtIDEgLSBpbnB1dC5sZW5ndGgpICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gSWYgdGhpcyBuZXcgY29sdW1uIGlzIGxvbmdlciB0aGFuIGV4aXN0aW5nIGNvbHVtbnMsXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSByZXN0IHRvIG1hdGNoIC4uLlxuICAgICAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICAgICAgaWYgKHNlbGYuZGF0YS5vdXRwdXQubGVuZ3RoIC0xIDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgICBhcHBlbmRSb3cuY2FsbChzZWxmLCBTdHJpbmcoIHNlbGYuZGF0YS5vdXRwdXQubGVuZ3RoICkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpKzFdW2luZGV4XSA9IHZhbHVlO1xuICAgICAgfSk7XG5cbiAgICB9XG5cbiAgfVxuICByZXR1cm4gc2VsZjtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUm93KHEsIGlucHV0KXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgaW5kZXggPSAodHlwZW9mIHEgPT09ICdudW1iZXInKSA/IHEgOiB0aGlzLnNlbGVjdENvbHVtbigwKS5pbmRleE9mKHEpO1xuXG4gIGlmIChpbmRleCA+IC0xKSB7XG5cbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSBcImZ1bmN0aW9uXCIpIHtcblxuICAgICAgZWFjaChzZWxmLm91dHB1dCgpW2luZGV4XSwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgICB2YXIgY29sID0gc2VsZi5zZWxlY3RDb2x1bW4oaSksXG4gICAgICAgIGNlbGwgPSBpbnB1dC5jYWxsKHNlbGYsIHZhbHVlLCBpLCBjb2wpO1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2luZGV4XVtpXSA9IGNlbGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfSBlbHNlIGlmICghaW5wdXQgfHwgaW5wdXQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgaW5wdXQgPSBpbnB1dCB8fCBbXTtcblxuICAgICAgaWYgKGlucHV0Lmxlbmd0aCA8PSBzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgaW5wdXQgPSBpbnB1dC5jb25jYXQoIGNyZWF0ZU51bGxMaXN0KCBzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCAtIDEgLSBpbnB1dC5sZW5ndGggKSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgICAgICBpZiAoc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggLTEgPCBpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFwcGVuZENvbHVtbi5jYWxsKHNlbGYsIFN0cmluZyggc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2luZGV4XVtpKzFdID0gdmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfVxuICByZXR1cm4gc2VsZjtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGVuKXtcbiAgdmFyIGxpc3QgPSBuZXcgQXJyYXkoKTtcbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbGlzdC5wdXNoKG51bGwpO1xuICB9XG4gIHJldHVybiBsaXN0O1xufTtcbiIsIi8vIFB1cmUgYXdlc29tZW5lc3MgYnkgV2lsbCBSYXluZXIgKHBlbmd1aW5ib3kpXG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wZW5ndWluYm95Lzc2MjE5N1xubW9kdWxlLmV4cG9ydHMgPSBmbGF0dGVuO1xuZnVuY3Rpb24gZmxhdHRlbihvYikge1xuICB2YXIgdG9SZXR1cm4gPSB7fTtcbiAgZm9yICh2YXIgaSBpbiBvYikge1xuICAgIGlmICghb2IuaGFzT3duUHJvcGVydHkoaSkpIGNvbnRpbnVlO1xuICAgIGlmICgodHlwZW9mIG9iW2ldKSA9PSAnb2JqZWN0JyAmJiBvYltpXSAhPT0gbnVsbCkge1xuICAgICAgdmFyIGZsYXRPYmplY3QgPSBmbGF0dGVuKG9iW2ldKTtcbiAgICAgIGZvciAodmFyIHggaW4gZmxhdE9iamVjdCkge1xuICAgICAgICBpZiAoIWZsYXRPYmplY3QuaGFzT3duUHJvcGVydHkoeCkpIGNvbnRpbnVlO1xuICAgICAgICB0b1JldHVybltpICsgJy4nICsgeF0gPSBmbGF0T2JqZWN0W3hdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0b1JldHVybltpXSA9IG9iW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdG9SZXR1cm47XG59XG4iLCIvLyDimavimanimawgSG9seSBEaXZlciEg4pms4pmp4pmrXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGxvb3AgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcm9vdCA9IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIHRhcmdldCA9IGFyZ3MucG9wKCk7XG5cbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgIGlmIChyb290IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgYXJncyA9IHJvb3Q7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiByb290ID09PSAnb2JqZWN0Jykge1xuICAgICAgICBhcmdzLnB1c2gocm9vdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZWFjaChhcmdzLCBmdW5jdGlvbihlbCl7XG5cbiAgICAgIC8vIEdyYWIgdGhlIG51bWJlcnMgYW5kIG51bGxzXG4gICAgICBpZiAodGFyZ2V0ID09IFwiXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbCA9PSBcIm51bWJlclwiIHx8IGVsID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnB1c2goZWwpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlbFt0YXJnZXRdIHx8IGVsW3RhcmdldF0gPT09IDAgfHwgZWxbdGFyZ2V0XSAhPT0gdm9pZCAwKSB7XG4gICAgICAgIC8vIEVhc3kgZ3JhYiFcbiAgICAgICAgaWYgKGVsW3RhcmdldF0gPT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnB1c2gobnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5wdXNoKGVsW3RhcmdldF0pO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAocm9vdFtlbF0pe1xuICAgICAgICBpZiAocm9vdFtlbF0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgIC8vIGRpdmUgdGhyb3VnaCBlYWNoIGFycmF5IGl0ZW1cblxuICAgICAgICAgIGVhY2gocm9vdFtlbF0sIGZ1bmN0aW9uKG4sIGkpIHtcbiAgICAgICAgICAgIHZhciBzcGxpbnRlciA9IFtyb290W2VsXV0uY29uY2F0KHJvb3RbZWxdW2ldKS5jb25jYXQoYXJncy5zbGljZSgxKSkuY29uY2F0KHRhcmdldCk7XG4gICAgICAgICAgICByZXR1cm4gbG9vcC5hcHBseSh0aGlzLCBzcGxpbnRlcik7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocm9vdFtlbF1bdGFyZ2V0XSkge1xuICAgICAgICAgICAgLy8gZ3JhYiBpdCFcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQucHVzaChyb290W2VsXVt0YXJnZXRdKTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBkaXZlIGRvd24gYSBsZXZlbCFcbiAgICAgICAgICAgIHJldHVybiBsb29wLmFwcGx5KHRoaXMsIFtyb290W2VsXV0uY29uY2F0KGFyZ3Muc3BsaWNlKDEpKS5jb25jYXQodGFyZ2V0KSk7XG5cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygcm9vdCA9PT0gJ29iamVjdCcgJiYgcm9vdCBpbnN0YW5jZW9mIEFycmF5ID09PSBmYWxzZSAmJiAhcm9vdFt0YXJnZXRdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRhcmdldCBwcm9wZXJ0eSBkb2VzIG5vdCBleGlzdFwiLCB0YXJnZXQpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkaXZlIGRvd24gYSBsZXZlbCFcbiAgICAgICAgcmV0dXJuIGxvb3AuYXBwbHkodGhpcywgW2VsXS5jb25jYXQoYXJncy5zcGxpY2UoMSkpLmNvbmNhdCh0YXJnZXQpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuXG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxvb3AuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiIsIi8qIVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQzMuanMgQWRhcHRlclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbnZhciBEYXRhdml6ID0gcmVxdWlyZSgnLi4vZGF0YXZpeicpLFxuICAgIGVhY2ggPSByZXF1aXJlKCcuLi8uLi9jb3JlL3V0aWxzL2VhY2gnKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKCcuLi8uLi9jb3JlL3V0aWxzL2V4dGVuZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cbiAgLy8gY2hhcnRPcHRpb25zOlxuICAvLyAtLS0tLS0tLS0tLS0tXG4gIC8vIGF4aXM6IHt9XG4gIC8vIGNvbG9yOiB7fSAgICA8LS0gYmUgYXdhcmU6IHdlIHNldCB2YWx1ZXMgaGVyZVxuICAvLyBncmlkOiB7fVxuICAvLyBsZWdlbmQ6IHt9XG4gIC8vIHBvaW50OiB7fVxuICAvLyByZWdpb25zOiB7fVxuICAvLyBzaXplOiB7fSAgICAgPC0tIGJlIGF3YXJlOiB3ZSBzZXQgdmFsdWVzIGhlcmVcbiAgLy8gdG9vbHRpcDoge31cbiAgLy8gem9vbToge31cblxuICAvLyBsaW5lLCBwaWUsIGRvbnV0IGV0Yy4uLlxuXG4gIHZhciBkYXRhVHlwZXMgPSB7XG4gICAgLy8gZGF0YVR5cGUgICAgICAgICAgICA6IC8vIGNoYXJ0VHlwZXNcbiAgICAnc2luZ3VsYXInICAgICAgICAgICAgIDogWydnYXVnZSddLFxuICAgICdjYXRlZ29yaWNhbCcgICAgICAgICAgOiBbJ2RvbnV0JywgJ3BpZSddLFxuICAgICdjYXQtaW50ZXJ2YWwnICAgICAgICAgOiBbJ2FyZWEtc3RlcCcsICdzdGVwJywgJ2JhcicsICdhcmVhJywgJ2FyZWEtc3BsaW5lJywgJ3NwbGluZScsICdsaW5lJ10sXG4gICAgJ2NhdC1vcmRpbmFsJyAgICAgICAgICA6IFsnYmFyJywgJ2FyZWEnLCAnYXJlYS1zcGxpbmUnLCAnc3BsaW5lJywgJ2xpbmUnLCAnc3RlcCcsICdhcmVhLXN0ZXAnXSxcbiAgICAnY2hyb25vbG9naWNhbCcgICAgICAgIDogWydhcmVhJywgJ2FyZWEtc3BsaW5lJywgJ3NwbGluZScsICdsaW5lJywgJ2JhcicsICdzdGVwJywgJ2FyZWEtc3RlcCddLFxuICAgICdjYXQtY2hyb25vbG9naWNhbCcgICAgOiBbJ2xpbmUnLCAnc3BsaW5lJywgJ2FyZWEnLCAnYXJlYS1zcGxpbmUnLCAnYmFyJywgJ3N0ZXAnLCAnYXJlYS1zdGVwJ11cbiAgICAvLyAnbm9taW5hbCcgICAgICAgICAgIDogW10sXG4gICAgLy8gJ2V4dHJhY3Rpb24nICAgICAgICA6IFtdXG4gIH07XG5cbiAgdmFyIGNoYXJ0cyA9IHt9O1xuICBlYWNoKFsnZ2F1Z2UnLCAnZG9udXQnLCAncGllJywgJ2JhcicsICdhcmVhJywgJ2FyZWEtc3BsaW5lJywgJ3NwbGluZScsICdsaW5lJywgJ3N0ZXAnLCAnYXJlYS1zdGVwJ10sIGZ1bmN0aW9uKHR5cGUsIGluZGV4KXtcbiAgICBjaGFydHNbdHlwZV0gPSB7XG4gICAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBzZXR1cCA9IGdldFNldHVwVGVtcGxhdGUuY2FsbCh0aGlzLCB0eXBlKTtcbiAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2MzJ10gPSBjMy5nZW5lcmF0ZShzZXR1cCk7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIGNvbHMgPSBbXTtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdnYXVnZScpIHtcbiAgICAgICAgICBzZWxmLnZpZXcuX2FydGlmYWN0c1snYzMnXS5sb2FkKHtcbiAgICAgICAgICAgIGNvbHVtbnM6IFsgW3NlbGYudGl0bGUoKSwgc2VsZi5kYXRhKClbMV1bMV1dIF1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdwaWUnIHx8IHR5cGUgPT09ICdkb251dCcpIHtcbiAgICAgICAgICBzZWxmLnZpZXcuX2FydGlmYWN0c1snYzMnXS5sb2FkKHtcbiAgICAgICAgICAgIGNvbHVtbnM6IHNlbGYuZGF0YXNldC5kYXRhLm91dHB1dC5zbGljZSgxKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLmRhdGFUeXBlKCkuaW5kZXhPZignY2hyb24nKSA+IC0xKSB7XG4gICAgICAgICAgICBjb2xzLnB1c2goc2VsZi5kYXRhc2V0LnNlbGVjdENvbHVtbigwKSk7XG4gICAgICAgICAgICBjb2xzWzBdWzBdID0gJ3gnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVhY2goc2VsZi5kYXRhKClbMF0sIGZ1bmN0aW9uKGMsIGkpe1xuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgIGNvbHMucHVzaChzZWxmLmRhdGFzZXQuc2VsZWN0Q29sdW1uKGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChzZWxmLnN0YWNrZWQoKSkge1xuICAgICAgICAgICAgc2VsZi52aWV3Ll9hcnRpZmFjdHNbJ2MzJ10uZ3JvdXBzKFtzZWxmLmxhYmVscygpXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi52aWV3Ll9hcnRpZmFjdHNbJ2MzJ10ubG9hZCh7XG4gICAgICAgICAgICBjb2x1bW5zOiBjb2xzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgICAgICBfc2VsZkRlc3RydWN0LmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gZ2V0U2V0dXBUZW1wbGF0ZSh0eXBlKXtcbiAgICB2YXIgc2V0dXAgPSB7XG4gICAgICBheGlzOiB7fSxcbiAgICAgIGJpbmR0bzogdGhpcy5lbCgpLFxuICAgICAgZGF0YToge1xuICAgICAgICBjb2x1bW5zOiBbXVxuICAgICAgfSxcbiAgICAgIGNvbG9yOiB7XG4gICAgICAgIHBhdHRlcm46IHRoaXMuY29sb3JzKClcbiAgICAgIH0sXG4gICAgICBzaXplOiB7XG4gICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQoKSxcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgoKVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBFbmZvcmNlIHR5cGUsIHNvcnJ5IG5vIG92ZXJyaWRlcyBoZXJlXG4gICAgc2V0dXBbJ2RhdGEnXVsndHlwZSddID0gdHlwZTtcblxuICAgIGlmICh0eXBlID09PSAnZ2F1Z2UnKSB7fVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdwaWUnIHx8IHR5cGUgPT09ICdkb251dCcpIHtcbiAgICAgIHNldHVwW3R5cGVdID0geyB0aXRsZTogdGhpcy50aXRsZSgpIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKHRoaXMuZGF0YVR5cGUoKS5pbmRleE9mKCdjaHJvbicpID4gLTEpIHtcbiAgICAgICAgc2V0dXBbJ2RhdGEnXVsneCddID0gJ3gnO1xuICAgICAgICBzZXR1cFsnYXhpcyddWyd4J10gPSB7XG4gICAgICAgICAgdHlwZTogJ3RpbWVzZXJpZXMnLFxuICAgICAgICAgIHRpY2s6IHtcbiAgICAgICAgICAgIGZvcm1hdDogJyVZLSVtLSVkJ1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5kYXRhVHlwZSgpID09PSAnY2F0LW9yZGluYWwnKSB7XG4gICAgICAgICAgc2V0dXBbJ2F4aXMnXVsneCddID0ge1xuICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3J5JyxcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IHRoaXMubGFiZWxzKClcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50aXRsZSgpKSB7XG4gICAgICAgIHNldHVwWydheGlzJ11bJ3knXSA9IHsgbGFiZWw6IHRoaXMudGl0bGUoKSB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBleHRlbmQoc2V0dXAsIHRoaXMuY2hhcnRPcHRpb25zKCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gX3NlbGZEZXN0cnVjdCgpe1xuICAgIGlmICh0aGlzLnZpZXcuX2FydGlmYWN0c1snYzMnXSkge1xuICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2MzJ10uZGVzdHJveSgpO1xuICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2MzJ10gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlZ2lzdGVyIGxpYnJhcnkgKyBhZGQgZGVwZW5kZW5jaWVzICsgdHlwZXNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBEYXRhdml6LnJlZ2lzdGVyKCdjMycsIGNoYXJ0cywgeyBjYXBhYmlsaXRpZXM6IGRhdGFUeXBlcyB9KTtcblxufTtcbiIsIi8qIVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQ2hhcnQuanMgQWRhcHRlclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbnZhciBEYXRhdml6ID0gcmVxdWlyZShcIi4uL2RhdGF2aXpcIiksXG4gICAgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIiksXG4gICAgZXh0ZW5kID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZXh0ZW5kXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cbiAgaWYgKHR5cGVvZiBDaGFydCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5yZXNwb25zaXZlID0gdHJ1ZTtcbiAgfVxuXG4gIHZhciBkYXRhVHlwZXMgPSB7XG4gICAgLy8gZGF0YVR5cGUgICAgICAgICAgICA6IC8vIGNoYXJ0VHlwZXNcbiAgICAvL1wic2luZ3VsYXJcIiAgICAgICAgICAgICA6IFtdLFxuICAgIFwiY2F0ZWdvcmljYWxcIiAgICAgICAgICA6IFtcImRvdWdobnV0XCIsIFwicGllXCIsIFwicG9sYXItYXJlYVwiLCBcInJhZGFyXCJdLFxuICAgIFwiY2F0LWludGVydmFsXCIgICAgICAgICA6IFtcImJhclwiLCBcImxpbmVcIl0sXG4gICAgXCJjYXQtb3JkaW5hbFwiICAgICAgICAgIDogW1wiYmFyXCIsIFwibGluZVwiXSxcbiAgICBcImNocm9ub2xvZ2ljYWxcIiAgICAgICAgOiBbXCJsaW5lXCIsIFwiYmFyXCJdLFxuICAgIFwiY2F0LWNocm9ub2xvZ2ljYWxcIiAgICA6IFtcImxpbmVcIiwgXCJiYXJcIl1cbiAgICAvLyBcIm5vbWluYWxcIiAgICAgICAgICAgOiBbXSxcbiAgICAvLyBcImV4dHJhY3Rpb25cIiAgICAgICAgOiBbXVxuICB9O1xuXG4gIHZhciBDaGFydE5hbWVNYXAgPSB7XG4gICAgXCJyYWRhclwiOiBcIlJhZGFyXCIsXG4gICAgXCJwb2xhci1hcmVhXCI6IFwiUG9sYXJBcmVhXCIsXG4gICAgXCJwaWVcIjogXCJQaWVcIixcbiAgICBcImRvdWdobnV0XCI6IFwiRG91Z2hudXRcIixcbiAgICBcImxpbmVcIjogXCJMaW5lXCIsXG4gICAgXCJiYXJcIjogXCJCYXJcIlxuICB9O1xuICB2YXIgZGF0YVRyYW5zZm9ybWVycyA9IHtcbiAgICAnZG91Z2hudXQnOiBnZXRDYXRlZ29yaWNhbERhdGEsXG4gICAgJ3BpZSc6IGdldENhdGVnb3JpY2FsRGF0YSxcbiAgICAncG9sYXItYXJlYSc6IGdldENhdGVnb3JpY2FsRGF0YSxcbiAgICAncmFkYXInOiBnZXRTZXJpZXNEYXRhLFxuICAgICdsaW5lJzogZ2V0U2VyaWVzRGF0YSxcbiAgICAnYmFyJzogZ2V0U2VyaWVzRGF0YVxuICB9O1xuXG4gIGZ1bmN0aW9uIGdldENhdGVnb3JpY2FsRGF0YSgpe1xuICAgIHZhciBzZWxmID0gdGhpcywgcmVzdWx0ID0gW107XG4gICAgZWFjaChzZWxmLmRhdGFzZXQuc2VsZWN0Q29sdW1uKDApLnNsaWNlKDEpLCBmdW5jdGlvbihsYWJlbCwgaSl7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIHZhbHVlOiBzZWxmLmRhdGFzZXQuc2VsZWN0Q29sdW1uKDEpLnNsaWNlKDEpW2ldLFxuICAgICAgICBjb2xvcjogc2VsZi5jb2xvcnMoKVsraV0sXG4gICAgICAgIGhpZ2h0bGlnaHQ6IHNlbGYuY29sb3JzKClbK2krOV0sXG4gICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNlcmllc0RhdGEoKXtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGxhYmVscyxcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgIGxhYmVsczogW10sXG4gICAgICAgICAgZGF0YXNldHM6IFtdXG4gICAgICAgIH07XG5cbiAgICBsYWJlbHMgPSB0aGlzLmRhdGFzZXQuc2VsZWN0Q29sdW1uKDApLnNsaWNlKDEpO1xuICAgIGVhY2gobGFiZWxzLCBmdW5jdGlvbihsLGkpe1xuICAgICAgaWYgKGwgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHJlc3VsdC5sYWJlbHMucHVzaCgobC5nZXRNb250aCgpKzEpICsgXCItXCIgKyBsLmdldERhdGUoKSArIFwiLVwiICsgbC5nZXRGdWxsWWVhcigpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5sYWJlbHMucHVzaChsKTtcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgZWFjaChzZWxmLmRhdGFzZXQuc2VsZWN0Um93KDApLnNsaWNlKDEpLCBmdW5jdGlvbihsYWJlbCwgaSl7XG4gICAgICB2YXIgaGV4ID0ge1xuICAgICAgICByOiBoZXhUb1Ioc2VsZi5jb2xvcnMoKVtpXSksXG4gICAgICAgIGc6IGhleFRvRyhzZWxmLmNvbG9ycygpW2ldKSxcbiAgICAgICAgYjogaGV4VG9CKHNlbGYuY29sb3JzKClbaV0pXG4gICAgICB9O1xuICAgICAgcmVzdWx0LmRhdGFzZXRzLnB1c2goe1xuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIGZpbGxDb2xvciAgICA6IFwicmdiYShcIiArIGhleC5yICsgXCIsXCIgKyBoZXguZyArIFwiLFwiICsgaGV4LmIgKyBcIiwwLjIpXCIsXG4gICAgICAgIHN0cm9rZUNvbG9yICA6IFwicmdiYShcIiArIGhleC5yICsgXCIsXCIgKyBoZXguZyArIFwiLFwiICsgaGV4LmIgKyBcIiwxKVwiLFxuICAgICAgICBwb2ludENvbG9yICAgOiBcInJnYmEoXCIgKyBoZXguciArIFwiLFwiICsgaGV4LmcgKyBcIixcIiArIGhleC5iICsgXCIsMSlcIixcbiAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogXCIjZmZmXCIsXG4gICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogXCIjZmZmXCIsXG4gICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiBcInJnYmEoXCIgKyBoZXguciArIFwiLFwiICsgaGV4LmcgKyBcIixcIiArIGhleC5iICsgXCIsMSlcIixcbiAgICAgICAgZGF0YTogc2VsZi5kYXRhc2V0LnNlbGVjdENvbHVtbigraSsxKS5zbGljZSgxKVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZhciBjaGFydHMgPSB7fTtcbiAgZWFjaChbXCJkb3VnaG51dFwiLCBcInBpZVwiLCBcInBvbGFyLWFyZWFcIiwgXCJyYWRhclwiLCBcImJhclwiLCBcImxpbmVcIl0sIGZ1bmN0aW9uKHR5cGUsIGluZGV4KXtcbiAgICBjaGFydHNbdHlwZV0gPSB7XG4gICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe1xuICAgICAgICBpZiAodGhpcy5lbCgpLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09IFwiY2FudmFzXCIpIHtcbiAgICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgdGhpcy5lbCgpLmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgdGhpcy5lbCgpLmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjdHhcIl0gPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY3R4XCJdID0gdGhpcy5lbCgpLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmhlaWdodCgpKSB7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjdHhcIl0uY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0KCk7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjdHhcIl0uY2FudmFzLnN0eWxlLmhlaWdodCA9IFN0cmluZyh0aGlzLmhlaWdodCgpICsgXCJweFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLndpZHRoKCkpIHtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1tcImN0eFwiXS5jYW52YXMud2lkdGggPSB0aGlzLndpZHRoKCk7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjdHhcIl0uY2FudmFzLnN0eWxlLndpZHRoID0gU3RyaW5nKHRoaXMud2lkdGgoKSArIFwicHhcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBtZXRob2QgPSBDaGFydE5hbWVNYXBbdHlwZV0sXG4gICAgICAgICAgICBvcHRzID0gZXh0ZW5kKHt9LCB0aGlzLmNoYXJ0T3B0aW9ucygpKSxcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhVHJhbnNmb3JtZXJzW3R5cGVdLmNhbGwodGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY2hhcnRqc1wiXSkge1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY2hhcnRqc1wiXS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjaGFydGpzXCJdID0gbmV3IENoYXJ0KHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY3R4XCJdKVttZXRob2RdKGRhdGEsIG9wdHMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgICAgICBfc2VsZkRlc3RydWN0LmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gX3NlbGZEZXN0cnVjdCgpe1xuICAgIGlmICh0aGlzLnZpZXcuX2FydGlmYWN0c1tcImNoYXJ0anNcIl0pIHtcbiAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY2hhcnRqc1wiXS5kZXN0cm95KCk7XG4gICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1tcImNoYXJ0anNcIl0gPSBudWxsO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gQmFzZWQgb24gdGhpcyBhd2Vzb21lIGxpdHRsZSBkZW1vOlxuICAvLyBodHRwOi8vd3d3LmphdmFzY3JpcHRlci5uZXQvZmFxL2hleHRvcmdiLmh0bVxuICBmdW5jdGlvbiBoZXhUb1IoaCkge3JldHVybiBwYXJzZUludCgoY3V0SGV4KGgpKS5zdWJzdHJpbmcoMCwyKSwxNil9XG4gIGZ1bmN0aW9uIGhleFRvRyhoKSB7cmV0dXJuIHBhcnNlSW50KChjdXRIZXgoaCkpLnN1YnN0cmluZygyLDQpLDE2KX1cbiAgZnVuY3Rpb24gaGV4VG9CKGgpIHtyZXR1cm4gcGFyc2VJbnQoKGN1dEhleChoKSkuc3Vic3RyaW5nKDQsNiksMTYpfVxuICBmdW5jdGlvbiBjdXRIZXgoaCkge3JldHVybiAoaC5jaGFyQXQoMCk9PVwiI1wiKSA/IGguc3Vic3RyaW5nKDEsNyk6aH1cblxuICAvLyBSZWdpc3RlciBsaWJyYXJ5ICsgYWRkIGRlcGVuZGVuY2llcyArIHR5cGVzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgRGF0YXZpei5yZWdpc3RlcihcImNoYXJ0anNcIiwgY2hhcnRzLCB7IGNhcGFiaWxpdGllczogZGF0YVR5cGVzIH0pO1xuXG59O1xuIiwiLyohXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBHb29nbGUgQ2hhcnRzIEFkYXB0ZXJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG4vKlxuXG4gIFRPRE86XG5cbiAgWyBdIEJ1aWxkIGEgbW9yZSByb2J1c3QgRGF0YVRhYmxlIHRyYW5zZm9ybWVyXG4gIFsgXSBeRXhwb3NlIGRhdGUgcGFyc2VyIGZvciBnb29nbGUgY2hhcnRzIHRvb2x0aXBzICgjNzApXG4gIFsgXSBeQWxsb3cgY3VzdG9tIHRvb2x0aXBzICgjMTQ3KVxuXG4qL1xuXG52YXIgRGF0YXZpeiA9IHJlcXVpcmUoXCIuLi9kYXRhdml6XCIpLFxuICAgIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpLFxuICAgIGV4dGVuZCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2V4dGVuZFwiKSxcbiAgICBLZWVuID0gcmVxdWlyZShcIi4uLy4uL2NvcmVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcblxuICBLZWVuLmxvYWRlZCA9IGZhbHNlO1xuXG4gIHZhciBlcnJvck1hcHBpbmcgPSB7XG4gICAgXCJEYXRhIGNvbHVtbihzKSBmb3IgYXhpcyAjMCBjYW5ub3QgYmUgb2YgdHlwZSBzdHJpbmdcIjogXCJObyByZXN1bHRzIHRvIHZpc3VhbGl6ZVwiXG4gIH07XG5cbiAgdmFyIGNoYXJ0VHlwZXMgPSBbJ0FyZWFDaGFydCcsICdCYXJDaGFydCcsICdDb2x1bW5DaGFydCcsICdMaW5lQ2hhcnQnLCAnUGllQ2hhcnQnLCAnVGFibGUnXTtcbiAgdmFyIGNoYXJ0TWFwID0ge307XG5cbiAgdmFyIGRhdGFUeXBlcyA9IHtcbiAgICAvLyBkYXRhVHlwZSAgICAgICAgICAgLy8gY2hhcnRUeXBlcyAobmFtZXNwYWNlKVxuICAgIC8vICdzaW5ndWxhcic6ICAgICAgICBudWxsLFxuICAgICdjYXRlZ29yaWNhbCc6ICAgICAgICBbJ3BpZWNoYXJ0JywgJ2JhcmNoYXJ0JywgJ2NvbHVtbmNoYXJ0JywgJ3RhYmxlJ10sXG4gICAgJ2NhdC1pbnRlcnZhbCc6ICAgICAgIFsnY29sdW1uY2hhcnQnLCAnYmFyY2hhcnQnLCAndGFibGUnXSxcbiAgICAnY2F0LW9yZGluYWwnOiAgICAgICAgWydiYXJjaGFydCcsICdjb2x1bW5jaGFydCcsICdhcmVhY2hhcnQnLCAnbGluZWNoYXJ0JywgJ3RhYmxlJ10sXG4gICAgJ2Nocm9ub2xvZ2ljYWwnOiAgICAgIFsnYXJlYWNoYXJ0JywgJ2xpbmVjaGFydCcsICd0YWJsZSddLFxuICAgICdjYXQtY2hyb25vbG9naWNhbCc6ICBbJ2xpbmVjaGFydCcsICdjb2x1bW5jaGFydCcsICdiYXJjaGFydCcsICdhcmVhY2hhcnQnXSxcbiAgICAnbm9taW5hbCc6ICAgICAgICAgICAgWyd0YWJsZSddLFxuICAgICdleHRyYWN0aW9uJzogICAgICAgICBbJ3RhYmxlJ11cbiAgfTtcblxuICAvLyBDcmVhdGUgY2hhcnQgdHlwZXNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBlYWNoKGNoYXJ0VHlwZXMsIGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgdmFyIG5hbWUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hhcnRNYXBbbmFtZV0gPSB7XG4gICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe1xuICAgICAgICAvLyBOb3RoaW5nIHRvIGRvIGhlcmVcbiAgICAgIH0sXG4gICAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKHR5cGVvZiBnb29nbGUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICB0aGlzLmVycm9yKFwiVGhlIEdvb2dsZSBDaGFydHMgbGlicmFyeSBjb3VsZCBub3QgYmUgbG9hZGVkLlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoc2VsZi52aWV3Ll9hcnRpZmFjdHNbJ2dvb2dsZWNoYXJ0J10pIHtcbiAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLnZpZXcuX2FydGlmYWN0c1snZ29vZ2xlY2hhcnQnXSA9IHNlbGYudmlldy5fYXJ0aWZhY3RzWydnb29nbGVjaGFydCddIHx8IG5ldyBnb29nbGUudmlzdWFsaXphdGlvblt0eXBlXShzZWxmLmVsKCkpO1xuICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMuYWRkTGlzdGVuZXIoc2VsZi52aWV3Ll9hcnRpZmFjdHNbJ2dvb2dsZWNoYXJ0J10sICdlcnJvcicsIGZ1bmN0aW9uKHN0YWNrKXtcbiAgICAgICAgICBfaGFuZGxlRXJyb3JzLmNhbGwoc2VsZiwgc3RhY2spO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBvcHRpb25zID0gX2dldERlZmF1bHRBdHRyaWJ1dGVzLmNhbGwodGhpcywgdHlwZSk7XG4gICAgICAgIGV4dGVuZChvcHRpb25zLCB0aGlzLmNoYXJ0T3B0aW9ucygpLCB0aGlzLmF0dHJpYnV0ZXMoKSk7XG5cbiAgICAgICAgLy8gQXBwbHkgc3RhY2tpbmcgaWYgc2V0IGJ5IHRvcC1sZXZlbCBvcHRpb25cbiAgICAgICAgb3B0aW9uc1snaXNTdGFja2VkJ10gPSAodGhpcy5zdGFja2VkKCkgfHwgb3B0aW9uc1snaXNTdGFja2VkJ10pO1xuXG4gICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzWydkYXRhdGFibGUnXSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUodGhpcy5kYXRhKCkpO1xuICAgICAgICAvLyBpZiAodGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2RhdGF0YWJsZSddKSB7fVxuICAgICAgICBpZiAodGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2dvb2dsZWNoYXJ0J10pIHtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1snZ29vZ2xlY2hhcnQnXS5kcmF3KHRoaXMudmlldy5fYXJ0aWZhY3RzWydkYXRhdGFibGUnXSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgICAgICBpZiAodGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2dvb2dsZWNoYXJ0J10pIHtcbiAgICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMucmVtb3ZlQWxsTGlzdGVuZXJzKHRoaXMudmlldy5fYXJ0aWZhY3RzWydnb29nbGVjaGFydCddKTtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1snZ29vZ2xlY2hhcnQnXS5jbGVhckNoYXJ0KCk7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2dvb2dsZWNoYXJ0J10gPSBudWxsO1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzWydkYXRhdGFibGUnXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9KTtcblxuXG4gIC8vIFJlZ2lzdGVyIGxpYnJhcnkgKyB0eXBlc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgRGF0YXZpei5yZWdpc3RlcignZ29vZ2xlJywgY2hhcnRNYXAsIHtcbiAgICBjYXBhYmlsaXRpZXM6IGRhdGFUeXBlcyxcbiAgICBkZXBlbmRlbmNpZXM6IFt7XG4gICAgICB0eXBlOiAnc2NyaXB0JyxcbiAgICAgIHVybDogJ2h0dHBzOi8vd3d3Lmdvb2dsZS5jb20vanNhcGknLFxuICAgICAgY2I6IGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBnb29nbGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJlcnJvclwiLCBcIlByb2JsZW0gbG9hZGluZyBHb29nbGUgQ2hhcnRzIGxpYnJhcnkuIFBsZWFzZSBjb250YWN0IHVzIVwiKTtcbiAgICAgICAgICBkb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4xJywge1xuICAgICAgICAgICAgICBwYWNrYWdlczogWydjb3JlY2hhcnQnLCAndGFibGUnXSxcbiAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XVxuICB9KTtcblxuICBmdW5jdGlvbiBfaGFuZGxlRXJyb3JzKHN0YWNrKXtcbiAgICB2YXIgbWVzc2FnZSA9IGVycm9yTWFwcGluZ1tzdGFja1snbWVzc2FnZSddXSB8fCBzdGFja1snbWVzc2FnZSddIHx8ICdBbiBlcnJvciBvY2N1cnJlZCc7XG4gICAgdGhpcy5lcnJvcihtZXNzYWdlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9nZXREZWZhdWx0QXR0cmlidXRlcyh0eXBlKXtcbiAgICB2YXIgb3V0cHV0ID0ge307XG4gICAgc3dpdGNoICh0eXBlLnRvTG93ZXJDYXNlKCkpIHtcblxuICAgICAgY2FzZSBcImFyZWFjaGFydFwiOlxuICAgICAgICBvdXRwdXQubGluZVdpZHRoID0gMjtcbiAgICAgICAgb3V0cHV0LmhBeGlzID0ge1xuICAgICAgICAgIGJhc2VsaW5lQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgZ3JpZGxpbmVzOiB7IGNvbG9yOiAndHJhbnNwYXJlbnQnIH1cbiAgICAgICAgfTtcbiAgICAgICAgb3V0cHV0LnZBeGlzID0ge1xuICAgICAgICAgIHZpZXdXaW5kb3c6IHsgbWluOiAwIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuZGF0YVR5cGUoKSA9PT0gXCJjaHJvbm9sb2dpY2FsXCIgfHwgdGhpcy5kYXRhVHlwZSgpID09PSBcImNhdC1vcmRpbmFsXCIpIHtcbiAgICAgICAgICBvdXRwdXQubGVnZW5kID0gXCJub25lXCI7XG4gICAgICAgICAgb3V0cHV0LmNoYXJ0QXJlYSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjg1JVwiXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImJhcmNoYXJ0XCI6XG4gICAgICAgIG91dHB1dC5oQXhpcyA9IHtcbiAgICAgICAgICB2aWV3V2luZG93OiB7IG1pbjogMCB9XG4gICAgICAgIH07XG4gICAgICAgIG91dHB1dC52QXhpcyA9IHtcbiAgICAgICAgICBiYXNlbGluZUNvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgIGdyaWRsaW5lczogeyBjb2xvcjogJ3RyYW5zcGFyZW50JyB9XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmRhdGFUeXBlKCkgPT09IFwiY2hyb25vbG9naWNhbFwiIHx8IHRoaXMuZGF0YVR5cGUoKSA9PT0gXCJjYXQtb3JkaW5hbFwiKSB7XG4gICAgICAgICAgb3V0cHV0LmxlZ2VuZCA9IFwibm9uZVwiO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiY29sdW1uY2hhcnRcIjpcbiAgICAgICAgb3V0cHV0LmhBeGlzID0ge1xuICAgICAgICAgIGJhc2VsaW5lQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgZ3JpZGxpbmVzOiB7IGNvbG9yOiAndHJhbnNwYXJlbnQnIH1cbiAgICAgICAgfTtcbiAgICAgICAgb3V0cHV0LnZBeGlzID0ge1xuICAgICAgICAgIHZpZXdXaW5kb3c6IHsgbWluOiAwIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuZGF0YVR5cGUoKSA9PT0gXCJjaHJvbm9sb2dpY2FsXCIgfHwgdGhpcy5kYXRhVHlwZSgpID09PSBcImNhdC1vcmRpbmFsXCIpIHtcbiAgICAgICAgICBvdXRwdXQubGVnZW5kID0gXCJub25lXCI7XG4gICAgICAgICAgb3V0cHV0LmNoYXJ0QXJlYSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjg1JVwiXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImxpbmVjaGFydFwiOlxuICAgICAgICBvdXRwdXQubGluZVdpZHRoID0gMjtcbiAgICAgICAgb3V0cHV0LmhBeGlzID0ge1xuICAgICAgICAgIGJhc2VsaW5lQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgZ3JpZGxpbmVzOiB7IGNvbG9yOiAndHJhbnNwYXJlbnQnIH1cbiAgICAgICAgfTtcbiAgICAgICAgb3V0cHV0LnZBeGlzID0ge1xuICAgICAgICAgIHZpZXdXaW5kb3c6IHsgbWluOiAwIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuZGF0YVR5cGUoKSA9PT0gXCJjaHJvbm9sb2dpY2FsXCIgfHwgdGhpcy5kYXRhVHlwZSgpID09PSBcImNhdC1vcmRpbmFsXCIpIHtcbiAgICAgICAgICBvdXRwdXQubGVnZW5kID0gXCJub25lXCI7XG4gICAgICAgICAgb3V0cHV0LmNoYXJ0QXJlYSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjg1JVwiXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInBpZWNoYXJ0XCI6XG4gICAgICAgIG91dHB1dC5zbGljZVZpc2liaWxpdHlUaHJlc2hvbGQgPSAwLjAxO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInRhYmxlXCI6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbn07XG4iLCIvKiFcbiogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKiBLZWVuIElPIEFkYXB0ZXJcbiogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKi9cblxudmFyIEtlZW4gPSByZXF1aXJlKFwiLi4vLi4vY29yZVwiKSxcbiAgICBEYXRhdml6ID0gcmVxdWlyZShcIi4uL2RhdGF2aXpcIik7XG5cbnZhciBjbG9uZSA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2Nsb25lXCIpLFxuICAgIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpLFxuICAgIGV4dGVuZCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2V4dGVuZFwiKSxcbiAgICBwcmV0dHlOdW1iZXIgPSByZXF1aXJlKFwiLi4vdXRpbHMvcHJldHR5TnVtYmVyXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIC8vIChmdW5jdGlvbihsaWIpe1xuICAvLyB2YXIgS2VlbiA9IGxpYiB8fCB7fSxcbiAgdmFyIE1ldHJpYywgRXJyb3IsIFNwaW5uZXI7XG5cbiAgS2Vlbi5FcnJvciA9IHtcbiAgICBkZWZhdWx0czoge1xuICAgICAgYmFja2dyb3VuZENvbG9yIDogXCJcIixcbiAgICAgIGJvcmRlclJhZGl1cyAgICA6IFwiNHB4XCIsXG4gICAgICBjb2xvciAgICAgICAgICAgOiBcIiNjY2NcIixcbiAgICAgIGRpc3BsYXkgICAgICAgICA6IFwiYmxvY2tcIixcbiAgICAgIGZvbnRGYW1pbHkgICAgICA6IFwiSGVsdmV0aWNhIE5ldWUsIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWZcIixcbiAgICAgIGZvbnRTaXplICAgICAgICA6IFwiMjFweFwiLFxuICAgICAgZm9udFdlaWdodCAgICAgIDogXCJsaWdodFwiLFxuICAgICAgdGV4dEFsaWduICAgICAgIDogXCJjZW50ZXJcIlxuICAgIH1cbiAgfTtcblxuICBLZWVuLlNwaW5uZXIuZGVmYXVsdHMgPSB7XG4gICAgaGVpZ2h0OiAxMzgsICAgICAgICAgICAgICAgICAgLy8gVXNlZCBpZiBubyBoZWlnaHQgaXMgcHJvdmlkZWRcbiAgICBsaW5lczogMTAsICAgICAgICAgICAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICBsZW5ndGg6IDgsICAgICAgICAgICAgICAgICAgICAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgIHdpZHRoOiAzLCAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgIHJhZGl1czogMTAsICAgICAgICAgICAgICAgICAgIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgIGNvcm5lcnM6IDEsICAgICAgICAgICAgICAgICAgIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXG4gICAgcm90YXRlOiAwLCAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHJvdGF0aW9uIG9mZnNldFxuICAgIGRpcmVjdGlvbjogMSwgICAgICAgICAgICAgICAgIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcbiAgICBjb2xvcjogJyM0ZDRkNGQnLCAgICAgICAgICAgICAvLyAjcmdiIG9yICNycmdnYmIgb3IgYXJyYXkgb2YgY29sb3JzXG4gICAgc3BlZWQ6IDEuNjcsICAgICAgICAgICAgICAgICAgLy8gUm91bmRzIHBlciBzZWNvbmRcbiAgICB0cmFpbDogNjAsICAgICAgICAgICAgICAgICAgICAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxuICAgIHNoYWRvdzogZmFsc2UsICAgICAgICAgICAgICAgIC8vIFdoZXRoZXIgdG8gcmVuZGVyIGEgc2hhZG93XG4gICAgaHdhY2NlbDogZmFsc2UsICAgICAgICAgICAgICAgLy8gV2hldGhlciB0byB1c2UgaGFyZHdhcmUgYWNjZWxlcmF0aW9uXG4gICAgY2xhc3NOYW1lOiAna2Vlbi1zcGlubmVyJywgICAgLy8gVGhlIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIHNwaW5uZXJcbiAgICB6SW5kZXg6IDJlOSwgICAgICAgICAgICAgICAgICAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcbiAgICB0b3A6ICc1MCUnLCAgICAgICAgICAgICAgICAgICAvLyBUb3AgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XG4gICAgbGVmdDogJzUwJScgICAgICAgICAgICAgICAgICAgLy8gTGVmdCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcbiAgfTtcblxuICB2YXIgZGF0YVR5cGVzID0ge1xuICAgICdzaW5ndWxhcic6IFsnbWV0cmljJ11cbiAgfTtcblxuICBNZXRyaWMgPSB7XG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBjc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIiksXG4gICAgICAgICAgYmdEZWZhdWx0ID0gXCIjNDljNWIxXCI7XG5cbiAgICAgIGNzcy5pZCA9IFwia2Vlbi13aWRnZXRzXCI7XG4gICAgICBjc3MudHlwZSA9IFwidGV4dC9jc3NcIjtcbiAgICAgIGNzcy5pbm5lckhUTUwgPSBcIlxcXG4gIC5rZWVuLW1ldHJpYyB7IFxcbiAgYmFja2dyb3VuZDogXCIgKyBiZ0RlZmF1bHQgKyBcIjsgXFxuICBib3JkZXItcmFkaXVzOiA0cHg7IFxcbiAgY29sb3I6ICNmZmY7IFxcbiAgZm9udC1mYW1pbHk6ICdIZWx2ZXRpY2EgTmV1ZScsIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7IFxcbiAgcGFkZGluZzogMTBweCAwOyBcXG4gIHRleHQtYWxpZ246IGNlbnRlcjsgXFxufSBcXFxuICAua2Vlbi1tZXRyaWMtdmFsdWUgeyBcXG4gIGRpc3BsYXk6IGJsb2NrOyBcXG4gIGZvbnQtc2l6ZTogODRweDsgXFxuICBmb250LXdlaWdodDogNzAwOyBcXG4gIGxpbmUtaGVpZ2h0OiA4NHB4OyBcXG59IFxcXG4gIC5rZWVuLW1ldHJpYy10aXRsZSB7IFxcbiAgZGlzcGxheTogYmxvY2s7IFxcbiAgZm9udC1zaXplOiAyNHB4OyBcXG4gIGZvbnQtd2VpZ2h0OiAyMDA7IFxcbn1cIjtcbiAgICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY3NzLmlkKSkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNzcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBiZ0NvbG9yID0gKHRoaXMuY29sb3JzKCkubGVuZ3RoID09IDEpID8gdGhpcy5jb2xvcnMoKVswXSA6IFwiIzQ5YzViMVwiLFxuICAgICAgICAgIHRpdGxlID0gdGhpcy50aXRsZSgpIHx8IFwiUmVzdWx0XCIsXG4gICAgICAgICAgdmFsdWUgPSB0aGlzLmRhdGEoKVsxXVsxXSB8fCAwLFxuICAgICAgICAgIHdpZHRoID0gdGhpcy53aWR0aCgpLFxuICAgICAgICAgIG9wdHMgPSB0aGlzLmNoYXJ0T3B0aW9ucygpIHx8IHt9LFxuICAgICAgICAgIHByZWZpeCA9IFwiXCIsXG4gICAgICAgICAgc3VmZml4ID0gXCJcIjtcblxuICAgICAgdmFyIHN0eWxlcyA9IHtcbiAgICAgICAgJ3dpZHRoJzogKHdpZHRoKSA/IHdpZHRoICsgJ3B4JyA6ICdhdXRvJ1xuICAgICAgfTtcblxuICAgICAgdmFyIGZvcm1hdHRlZE51bSA9IHZhbHVlO1xuICAgICAgaWYgKCB0eXBlb2Ygb3B0cy5wcmV0dHlOdW1iZXIgPT09ICd1bmRlZmluZWQnIHx8IG9wdHMucHJldHR5TnVtYmVyID09IHRydWUgKSB7XG4gICAgICAgIGlmICggIWlzTmFOKHBhcnNlSW50KHZhbHVlKSkgKSB7XG4gICAgICAgICAgZm9ybWF0dGVkTnVtID0gcHJldHR5TnVtYmVyKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0c1sncHJlZml4J10pIHtcbiAgICAgICAgcHJlZml4ID0gJzxzcGFuIGNsYXNzPVwia2Vlbi1tZXRyaWMtcHJlZml4XCI+JyArIG9wdHNbJ3ByZWZpeCddICsgJzwvc3Bhbj4nO1xuICAgICAgfVxuICAgICAgaWYgKG9wdHNbJ3N1ZmZpeCddKSB7XG4gICAgICAgIHN1ZmZpeCA9ICc8c3BhbiBjbGFzcz1cImtlZW4tbWV0cmljLXN1ZmZpeFwiPicgKyBvcHRzWydzdWZmaXgnXSArICc8L3NwYW4+JztcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbCgpLmlubmVySFRNTCA9ICcnICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJrZWVuLXdpZGdldCBrZWVuLW1ldHJpY1wiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogJyArIGJnQ29sb3IgKyAnOyB3aWR0aDonICsgc3R5bGVzLndpZHRoICsgJztcIiB0aXRsZT1cIicgKyB2YWx1ZSArICdcIj4nICtcbiAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJrZWVuLW1ldHJpYy12YWx1ZVwiPicgKyBwcmVmaXggKyBmb3JtYXR0ZWROdW0gKyBzdWZmaXggKyAnPC9zcGFuPicgK1xuICAgICAgICAgICc8c3BhbiBjbGFzcz1cImtlZW4tbWV0cmljLXRpdGxlXCI+JyArIHRpdGxlICsgJzwvc3Bhbj4nICtcbiAgICAgICAgJzwvZGl2Pic7XG4gICAgfVxuICB9O1xuXG4gIEVycm9yID0ge1xuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7fSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHRleHQsIHN0eWxlKXtcbiAgICAgIHZhciBlcnIsIG1zZztcblxuICAgICAgdmFyIGRlZmF1bHRTdHlsZSA9IGNsb25lKEtlZW4uRXJyb3IuZGVmYXVsdHMpO1xuICAgICAgdmFyIGN1cnJlbnRTdHlsZSA9IGV4dGVuZChkZWZhdWx0U3R5bGUsIHN0eWxlKTtcblxuICAgICAgZXJyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIGVyci5jbGFzc05hbWUgPSBcImtlZW4tZXJyb3JcIjtcbiAgICAgIGVhY2goY3VycmVudFN0eWxlLCBmdW5jdGlvbih2YWx1ZSwga2V5KXtcbiAgICAgICAgZXJyLnN0eWxlW2tleV0gPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgZXJyLnN0eWxlLmhlaWdodCA9IFN0cmluZyh0aGlzLmhlaWdodCgpICsgXCJweFwiKTtcbiAgICAgIGVyci5zdHlsZS5wYWRkaW5nVG9wID0gKHRoaXMuaGVpZ2h0KCkgLyAyIC0gMTUpICsgXCJweFwiO1xuICAgICAgZXJyLnN0eWxlLndpZHRoID0gU3RyaW5nKHRoaXMud2lkdGgoKSArIFwicHhcIik7XG5cbiAgICAgIG1zZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgbXNnLmlubmVySFRNTCA9IHRleHQgfHwgXCJZaWtlcyEgQW4gZXJyb3Igb2NjdXJyZWQhXCI7XG5cbiAgICAgIGVyci5hcHBlbmRDaGlsZChtc2cpO1xuXG4gICAgICB0aGlzLmVsKCkuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgIHRoaXMuZWwoKS5hcHBlbmRDaGlsZChlcnIpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMuZWwoKS5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH1cbiAgfTtcblxuICBTcGlubmVyID0ge1xuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7fSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgc3Bpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICB2YXIgaGVpZ2h0ID0gdGhpcy5oZWlnaHQoKSB8fCBLZWVuLlNwaW5uZXIuZGVmYXVsdHMuaGVpZ2h0O1xuICAgICAgc3Bpbm5lci5jbGFzc05hbWUgPSBcImtlZW4tbG9hZGluZ1wiO1xuICAgICAgc3Bpbm5lci5zdHlsZS5oZWlnaHQgPSBTdHJpbmcoaGVpZ2h0ICsgXCJweFwiKTtcbiAgICAgIHNwaW5uZXIuc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XG4gICAgICBzcGlubmVyLnN0eWxlLndpZHRoID0gU3RyaW5nKHRoaXMud2lkdGgoKSArIFwicHhcIik7XG5cbiAgICAgIHRoaXMuZWwoKS5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgdGhpcy5lbCgpLmFwcGVuZENoaWxkKHNwaW5uZXIpO1xuICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHMuc3Bpbm5lciA9IG5ldyBLZWVuLlNwaW5uZXIoS2Vlbi5TcGlubmVyLmRlZmF1bHRzKS5zcGluKHNwaW5uZXIpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzLnNwaW5uZXIuc3RvcCgpO1xuICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHMuc3Bpbm5lciA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIEtlZW4uRGF0YXZpei5yZWdpc3Rlcigna2Vlbi1pbycsIHtcbiAgICAnbWV0cmljJzogTWV0cmljLFxuICAgICdlcnJvcic6IEVycm9yLFxuICAgICdzcGlubmVyJzogU3Bpbm5lclxuICB9LCB7XG4gICAgY2FwYWJpbGl0aWVzOiBkYXRhVHlwZXNcbiAgfSk7XG5cbn07IC8vKShLZWVuKTtcbiIsInZhciBjbG9uZSA9IHJlcXVpcmUoJy4uL2NvcmUvdXRpbHMvY2xvbmUnKSxcbiAgICBlYWNoID0gcmVxdWlyZSgnLi4vY29yZS91dGlscy9lYWNoJyksXG4gICAgZXh0ZW5kID0gcmVxdWlyZSgnLi4vY29yZS91dGlscy9leHRlbmQnKSxcbiAgICBsb2FkU2NyaXB0ID0gcmVxdWlyZSgnLi91dGlscy9sb2FkU2NyaXB0JyksXG4gICAgbG9hZFN0eWxlID0gcmVxdWlyZSgnLi91dGlscy9sb2FkU3R5bGUnKTtcblxudmFyIEtlZW4gPSByZXF1aXJlKCcuLi9jb3JlJyk7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJy4uL2NvcmUvdXRpbHMvZW1pdHRlci1zaGltJyk7XG5cbnZhciBEYXRhc2V0ID0gcmVxdWlyZSgnLi4vZGF0YXNldCcpO1xuXG5mdW5jdGlvbiBEYXRhdml6KCl7XG4gIHRoaXMuZGF0YXNldCA9IG5ldyBEYXRhc2V0KCk7XG4gIHRoaXMudmlldyA9IHtcbiAgICBfcHJlcGFyZWQ6IGZhbHNlLFxuICAgIF9pbml0aWFsaXplZDogZmFsc2UsXG4gICAgX3JlbmRlcmVkOiBmYWxzZSxcbiAgICBfYXJ0aWZhY3RzOiB7IC8qIHN0YXRlIGJpbiAqLyB9LFxuICAgIGFkYXB0ZXI6IHtcbiAgICAgIGxpYnJhcnk6IHVuZGVmaW5lZCxcbiAgICAgIGNoYXJ0T3B0aW9uczoge30sXG4gICAgICBjaGFydFR5cGU6IHVuZGVmaW5lZCxcbiAgICAgIGRlZmF1bHRDaGFydFR5cGU6IHVuZGVmaW5lZCxcbiAgICAgIGRhdGFUeXBlOiB1bmRlZmluZWRcbiAgICB9LFxuICAgIGF0dHJpYnV0ZXM6IGNsb25lKERhdGF2aXouZGVmYXVsdHMpLFxuICAgIGRlZmF1bHRzOiBjbG9uZShEYXRhdml6LmRlZmF1bHRzKSxcbiAgICBlbDogdW5kZWZpbmVkLFxuICAgIGxvYWRlcjogeyBsaWJyYXJ5OiAna2Vlbi1pbycsIGNoYXJ0VHlwZTogJ3NwaW5uZXInIH1cbiAgfTtcbiAgRGF0YXZpei52aXN1YWxzLnB1c2godGhpcyk7XG59O1xuXG5leHRlbmQoRGF0YXZpeiwge1xuICBkYXRhVHlwZU1hcDoge1xuICAgICdzaW5ndWxhcic6ICAgICAgICAgIHsgbGlicmFyeTogJ2tlZW4taW8nLCBjaGFydFR5cGU6ICdtZXRyaWMnICAgICAgfSxcbiAgICAnY2F0ZWdvcmljYWwnOiAgICAgICB7IGxpYnJhcnk6ICdnb29nbGUnLCAgY2hhcnRUeXBlOiAncGllY2hhcnQnICAgIH0sXG4gICAgJ2NhdC1pbnRlcnZhbCc6ICAgICAgeyBsaWJyYXJ5OiAnZ29vZ2xlJywgIGNoYXJ0VHlwZTogJ2NvbHVtbmNoYXJ0JyB9LFxuICAgICdjYXQtb3JkaW5hbCc6ICAgICAgIHsgbGlicmFyeTogJ2dvb2dsZScsICBjaGFydFR5cGU6ICdiYXJjaGFydCcgICAgfSxcbiAgICAnY2hyb25vbG9naWNhbCc6ICAgICB7IGxpYnJhcnk6ICdnb29nbGUnLCAgY2hhcnRUeXBlOiAnYXJlYWNoYXJ0JyAgIH0sXG4gICAgJ2NhdC1jaHJvbm9sb2dpY2FsJzogeyBsaWJyYXJ5OiAnZ29vZ2xlJywgIGNoYXJ0VHlwZTogJ2xpbmVjaGFydCcgICB9LFxuICAgICdleHRyYWN0aW9uJzogICAgICAgIHsgbGlicmFyeTogJ2dvb2dsZScsICBjaGFydFR5cGU6ICd0YWJsZScgICAgICAgfSxcbiAgICAnbm9taW5hbCc6ICAgICAgICAgICB7IGxpYnJhcnk6ICdnb29nbGUnLCAgY2hhcnRUeXBlOiAndGFibGUnICAgICAgIH1cbiAgfSxcbiAgZGVmYXVsdHM6IHtcbiAgICBjb2xvcnM6IFtcbiAgICAvKiB0ZWFsICAgICAgcmVkICAgICAgICB5ZWxsb3cgICAgIHB1cnBsZSAgICAgb3JhbmdlICAgICBtaW50ICAgICAgIGJsdWUgICAgICAgZ3JlZW4gICAgICBsYXZlbmRlciAqL1xuICAgICcjMDBiYmRlJywgJyNmZTY2NzInLCAnI2VlYjA1OCcsICcjOGE4YWQ2JywgJyNmZjg1NWMnLCAnIzAwY2ZiYicsICcjNWE5ZWVkJywgJyM3M2Q0ODMnLCAnI2M4NzliYicsXG4gICAgJyMwMDk5YjYnLCAnI2Q3NGQ1OCcsICcjY2I5MTQxJywgJyM2YjZiYjYnLCAnI2Q4Njk0NScsICcjMDBhYTk5JywgJyM0MjgxYzknLCAnIzU3YjU2NicsICcjYWM1YzllJyxcbiAgICAnIzI3Y2NlYicsICcjZmY4MThiJywgJyNmNmJmNzEnLCAnIzliOWJlMScsICcjZmY5Yjc5JywgJyMyNmRmY2QnLCAnIzczYWZmNCcsICcjODdlMDk2JywgJyNkODhiY2InXG4gICAgXSxcbiAgICBpbmRleEJ5OiAndGltZWZyYW1lLnN0YXJ0JyxcbiAgICBzdGFja2VkOiBmYWxzZVxuICB9LFxuICBkZXBlbmRlbmNpZXM6IHtcbiAgICBsb2FkaW5nOiAwLFxuICAgIGxvYWRlZDogMCxcbiAgICB1cmxzOiB7fVxuICB9LFxuICBsaWJyYXJpZXM6IHt9LFxuICB2aXN1YWxzOiBbXVxufSk7XG5cbkVtaXR0ZXIoRGF0YXZpeik7XG5FbWl0dGVyKERhdGF2aXoucHJvdG90eXBlKTtcblxuRGF0YXZpei5yZWdpc3RlciA9IGZ1bmN0aW9uKG5hbWUsIG1ldGhvZHMsIGNvbmZpZyl7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGxvYWRIYW5kbGVyID0gZnVuY3Rpb24oc3QpIHtcbiAgICBzdC5sb2FkZWQrKztcbiAgICBpZihzdC5sb2FkZWQgPT09IHN0LmxvYWRpbmcpIHtcbiAgICAgIEtlZW4ubG9hZGVkID0gdHJ1ZTtcbiAgICAgIEtlZW4udHJpZ2dlcigncmVhZHknKTtcbiAgICB9XG4gIH07XG5cbiAgRGF0YXZpei5saWJyYXJpZXNbbmFtZV0gPSBEYXRhdml6LmxpYnJhcmllc1tuYW1lXSB8fCB7fTtcblxuICAvLyBBZGQgbWV0aG9kIHRvIGxpYnJhcnkgaGFzaFxuICBlYWNoKG1ldGhvZHMsIGZ1bmN0aW9uKG1ldGhvZCwga2V5KXtcbiAgICBEYXRhdml6LmxpYnJhcmllc1tuYW1lXVtrZXldID0gbWV0aG9kO1xuICB9KTtcblxuICAvLyBTZXQgZGVmYXVsdCBjYXBhYmlsaXRpZXMgaGFzaFxuICBpZiAoY29uZmlnICYmIGNvbmZpZy5jYXBhYmlsaXRpZXMpIHtcbiAgICBEYXRhdml6LmxpYnJhcmllc1tuYW1lXS5fZGVmYXVsdHMgPSBEYXRhdml6LmxpYnJhcmllc1tuYW1lXS5fZGVmYXVsdHMgfHwge307XG4gICAgZWFjaChjb25maWcuY2FwYWJpbGl0aWVzLCBmdW5jdGlvbih0eXBlU2V0LCBrZXkpe1xuICAgICAgLy8gc3RvcmUgc29tZXdoZXJlIGluIGxpYnJhcnlcbiAgICAgIERhdGF2aXoubGlicmFyaWVzW25hbWVdLl9kZWZhdWx0c1trZXldID0gdHlwZVNldDtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEZvciBhbGwgZGVwZW5kZW5jaWVzXG4gIGlmIChjb25maWcgJiYgY29uZmlnLmRlcGVuZGVuY2llcykge1xuICAgIGVhY2goY29uZmlnLmRlcGVuZGVuY2llcywgZnVuY3Rpb24gKGRlcGVuZGVuY3ksIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICB2YXIgc3RhdHVzID0gRGF0YXZpei5kZXBlbmRlbmNpZXM7XG4gICAgICAvLyBJZiBpdCBkb2Vzbid0IGV4aXN0IGluIHRoZSBjdXJyZW50IGRlcGVuZGVuY2llcyBiZWluZyBsb2FkZWRcbiAgICAgIGlmKCFzdGF0dXMudXJsc1tkZXBlbmRlbmN5LnVybF0pIHtcbiAgICAgICAgc3RhdHVzLnVybHNbZGVwZW5kZW5jeS51cmxdID0gdHJ1ZTtcbiAgICAgICAgc3RhdHVzLmxvYWRpbmcrKztcbiAgICAgICAgdmFyIG1ldGhvZCA9IGRlcGVuZGVuY3kudHlwZSA9PT0gJ3NjcmlwdCcgPyBsb2FkU2NyaXB0IDogbG9hZFN0eWxlO1xuXG4gICAgICAgIG1ldGhvZChkZXBlbmRlbmN5LnVybCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYoZGVwZW5kZW5jeS5jYikge1xuICAgICAgICAgICAgZGVwZW5kZW5jeS5jYi5jYWxsKHNlbGYsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBsb2FkSGFuZGxlcihzdGF0dXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvYWRIYW5kbGVyKHN0YXR1cyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuRGF0YXZpei5maW5kID0gZnVuY3Rpb24odGFyZ2V0KXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gRGF0YXZpei52aXN1YWxzO1xuICB2YXIgZWwgPSB0YXJnZXQubm9kZU5hbWUgPyB0YXJnZXQgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCksXG4gICAgICBtYXRjaDtcblxuICBlYWNoKERhdGF2aXoudmlzdWFscywgZnVuY3Rpb24odmlzdWFsKXtcbiAgICBpZiAoZWwgPT0gdmlzdWFsLmVsKCkpe1xuICAgICAgbWF0Y2ggPSB2aXN1YWw7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KTtcbiAgaWYgKG1hdGNoKSByZXR1cm4gbWF0Y2g7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGF2aXo7XG4iLCJ2YXIgY2xvbmUgPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9jbG9uZVwiKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9leHRlbmRcIiksXG4gICAgRGF0YXZpeiA9IHJlcXVpcmUoXCIuLi9kYXRhdml6XCIpLFxuICAgIFJlcXVlc3QgPSByZXF1aXJlKFwiLi4vLi4vY29yZS9yZXF1ZXN0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHF1ZXJ5LCBlbCwgY2ZnKSB7XG4gIHZhciBERUZBVUxUUyA9IGNsb25lKERhdGF2aXouZGVmYXVsdHMpLFxuICAgICAgdmlzdWFsID0gbmV3IERhdGF2aXooKSxcbiAgICAgIHJlcXVlc3QgPSBuZXcgUmVxdWVzdCh0aGlzLCBbcXVlcnldKSxcbiAgICAgIGNvbmZpZyA9IGNmZyA/IGNsb25lKGNmZykgOiB7fTtcblxuICBpZiAoY29uZmlnLmNoYXJ0VHlwZSkge1xuICAgIHZpc3VhbC5jaGFydFR5cGUoY29uZmlnLmNoYXJ0VHlwZSk7XG4gICAgZGVsZXRlIGNvbmZpZy5jaGFydFR5cGU7XG4gIH1cblxuICBpZiAoY29uZmlnLmxpYnJhcnkpIHtcbiAgICB2aXN1YWwubGlicmFyeShjb25maWcubGlicmFyeSk7XG4gICAgZGVsZXRlIGNvbmZpZy5saWJyYXJ5O1xuICB9XG5cbiAgaWYgKGNvbmZpZy5jaGFydE9wdGlvbnMpIHtcbiAgICB2aXN1YWwuY2hhcnRPcHRpb25zKGNvbmZpZy5jaGFydE9wdGlvbnMpO1xuICAgIGRlbGV0ZSBjb25maWcuY2hhcnRPcHRpb25zO1xuICB9XG5cbiAgdmlzdWFsXG4gICAgLmF0dHJpYnV0ZXMoZXh0ZW5kKERFRkFVTFRTLCBjb25maWcpKVxuICAgIC5lbChlbClcbiAgICAucHJlcGFyZSgpO1xuXG4gIHJlcXVlc3QucmVmcmVzaCgpO1xuICByZXF1ZXN0Lm9uKFwiY29tcGxldGVcIiwgZnVuY3Rpb24oKXtcbiAgICB2aXN1YWxcbiAgICAgIC5wYXJzZVJlcXVlc3QodGhpcylcbiAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChjb25maWcubGFiZWxzKSB7XG4gICAgICAgICAgdGhpcy5sYWJlbHMoY29uZmlnLmxhYmVscyk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAucmVuZGVyKCk7XG4gIH0pO1xuICByZXF1ZXN0Lm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24ocmVzKXtcbiAgICB2aXN1YWwuZXJyb3IocmVzLm1lc3NhZ2UpO1xuICB9KTtcblxuICByZXR1cm4gdmlzdWFsO1xufTtcbiIsInZhciBEYXRhdml6ID0gcmVxdWlyZShcIi4uL2RhdGF2aXpcIiksXG4gICAgZXh0ZW5kID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZXh0ZW5kXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIG1hcCA9IGV4dGVuZCh7fSwgRGF0YXZpei5kYXRhVHlwZU1hcCksXG4gICAgICBkYXRhVHlwZSA9IHRoaXMuZGF0YVR5cGUoKSxcbiAgICAgIGxpYnJhcnkgPSB0aGlzLmxpYnJhcnkoKSxcbiAgICAgIGNoYXJ0VHlwZSA9IHRoaXMuY2hhcnRUeXBlKCkgfHwgdGhpcy5kZWZhdWx0Q2hhcnRUeXBlKCk7XG5cbiAgLy8gVXNlIHRoZSBkZWZhdWx0IGxpYnJhcnkgYXMgYSBiYWNrdXBcbiAgaWYgKCFsaWJyYXJ5ICYmIG1hcFtkYXRhVHlwZV0pIHtcbiAgICBsaWJyYXJ5ID0gbWFwW2RhdGFUeXBlXS5saWJyYXJ5O1xuICB9XG5cbiAgLy8gVXNlIHRoaXMgbGlicmFyeSdzIGRlZmF1bHQgY2hhcnRUeXBlIGZvciB0aGlzIGRhdGFUeXBlXG4gIGlmIChsaWJyYXJ5ICYmICFjaGFydFR5cGUgJiYgZGF0YVR5cGUpIHtcbiAgICBjaGFydFR5cGUgPSBEYXRhdml6LmxpYnJhcmllc1tsaWJyYXJ5XS5fZGVmYXVsdHNbZGF0YVR5cGVdWzBdO1xuICB9XG5cbiAgLy8gU3RpbGwgbm8gbHVjaz9cbiAgaWYgKGxpYnJhcnkgJiYgIWNoYXJ0VHlwZSAmJiBtYXBbZGF0YVR5cGVdKSB7XG4gICAgY2hhcnRUeXBlID0gbWFwW2RhdGFUeXBlXS5jaGFydFR5cGU7XG4gIH1cblxuICAvLyBSZXR1cm4gaWYgZm91bmRcbiAgcmV0dXJuIChsaWJyYXJ5ICYmIGNoYXJ0VHlwZSkgPyBEYXRhdml6LmxpYnJhcmllc1tsaWJyYXJ5XVtjaGFydFR5cGVdIDoge307XG59O1xuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpLFxuICAgIERhdGFzZXQgPSByZXF1aXJlKFwiLi4vLi4vZGF0YXNldFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiZXh0cmFjdGlvblwiOiBwYXJzZUV4dHJhY3Rpb25cbn07XG5cbmZ1bmN0aW9uIHBhcnNlRXh0cmFjdGlvbihyZXEpe1xuICB2YXIgZGF0YSA9IChyZXEuZGF0YSBpbnN0YW5jZW9mIEFycmF5ID8gcmVxLmRhdGFbMF0gOiByZXEuZGF0YSksXG4gIG5hbWVzID0gcmVxLnF1ZXJpZXNbMF0uZ2V0KFwicHJvcGVydHlfbmFtZXNcIikgfHwgW10sXG4gIHNjaGVtYSA9IHsgcmVjb3JkczogXCJyZXN1bHRcIiwgc2VsZWN0OiB0cnVlIH07XG4gIGlmIChuYW1lcykge1xuICAgIHNjaGVtYS5zZWxlY3QgPSBbXTtcbiAgICBlYWNoKG5hbWVzLCBmdW5jdGlvbihwKXtcbiAgICAgIHNjaGVtYS5zZWxlY3QucHVzaCh7IHBhdGg6IHAgfSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gbmV3IERhdGFzZXQoZGF0YSwgc2NoZW1hKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocmVxKXtcbiAgdmFyIGFuYWx5c2lzID0gcmVxLnF1ZXJpZXNbMF0uYW5hbHlzaXMucmVwbGFjZShcIl9cIiwgXCIgXCIpLFxuICBjb2xsZWN0aW9uID0gcmVxLnF1ZXJpZXNbMF0uZ2V0KCdldmVudF9jb2xsZWN0aW9uJyksXG4gIG91dHB1dDtcbiAgb3V0cHV0ID0gYW5hbHlzaXMucmVwbGFjZSggL1xcYi4vZywgZnVuY3Rpb24oYSl7XG4gICAgcmV0dXJuIGEudG9VcHBlckNhc2UoKTtcbiAgfSk7XG4gIGlmIChjb2xsZWN0aW9uKSB7XG4gICAgb3V0cHV0ICs9ICcgLSAnICsgY29sbGVjdGlvbjtcbiAgfVxuICByZXR1cm4gb3V0cHV0O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXVlcnkpe1xuICB2YXIgaXNJbnRlcnZhbCA9IHR5cGVvZiBxdWVyeS5wYXJhbXMuaW50ZXJ2YWwgPT09IFwic3RyaW5nXCIsXG4gIGlzR3JvdXBCeSA9IHR5cGVvZiBxdWVyeS5wYXJhbXMuZ3JvdXBfYnkgPT09IFwic3RyaW5nXCIsXG4gIGlzMnhHcm91cEJ5ID0gcXVlcnkucGFyYW1zLmdyb3VwX2J5IGluc3RhbmNlb2YgQXJyYXksXG4gIGRhdGFUeXBlO1xuXG4gIC8vIG1ldHJpY1xuICBpZiAoIWlzR3JvdXBCeSAmJiAhaXNJbnRlcnZhbCkge1xuICAgIGRhdGFUeXBlID0gJ3Npbmd1bGFyJztcbiAgfVxuXG4gIC8vIGdyb3VwX2J5LCBubyBpbnRlcnZhbFxuICBpZiAoaXNHcm91cEJ5ICYmICFpc0ludGVydmFsKSB7XG4gICAgZGF0YVR5cGUgPSAnY2F0ZWdvcmljYWwnO1xuICB9XG5cbiAgLy8gaW50ZXJ2YWwsIG5vIGdyb3VwX2J5XG4gIGlmIChpc0ludGVydmFsICYmICFpc0dyb3VwQnkpIHtcbiAgICBkYXRhVHlwZSA9ICdjaHJvbm9sb2dpY2FsJztcbiAgfVxuXG4gIC8vIGludGVydmFsLCBncm91cF9ieVxuICBpZiAoaXNJbnRlcnZhbCAmJiBpc0dyb3VwQnkpIHtcbiAgICBkYXRhVHlwZSA9ICdjYXQtY2hyb25vbG9naWNhbCc7XG4gIH1cblxuICAvLyAyeCBncm91cF9ieVxuICAvLyBUT0RPOiByZXNlYXJjaCBwb3NzaWJsZSBkYXRhVHlwZSBvcHRpb25zXG4gIGlmICghaXNJbnRlcnZhbCAmJiBpczJ4R3JvdXBCeSkge1xuICAgIGRhdGFUeXBlID0gJ2NhdGVnb3JpY2FsJztcbiAgfVxuXG4gIC8vIGludGVydmFsLCAyeCBncm91cF9ieVxuICAvLyBUT0RPOiByZXNlYXJjaCBwb3NzaWJsZSBkYXRhVHlwZSBvcHRpb25zXG4gIGlmIChpc0ludGVydmFsICYmIGlzMnhHcm91cEJ5KSB7XG4gICAgZGF0YVR5cGUgPSAnY2F0LWNocm9ub2xvZ2ljYWwnO1xuICB9XG5cbiAgaWYgKHF1ZXJ5LmFuYWx5c2lzID09PSBcImZ1bm5lbFwiKSB7XG4gICAgZGF0YVR5cGUgPSAnY2F0LW9yZGluYWwnO1xuICB9XG5cbiAgaWYgKHF1ZXJ5LmFuYWx5c2lzID09PSBcImV4dHJhY3Rpb25cIikge1xuICAgIGRhdGFUeXBlID0gJ2V4dHJhY3Rpb24nO1xuICB9XG4gIGlmIChxdWVyeS5hbmFseXNpcyA9PT0gXCJzZWxlY3RfdW5pcXVlXCIpIHtcbiAgICBkYXRhVHlwZSA9ICdub21pbmFsJztcbiAgfVxuXG4gIHJldHVybiBkYXRhVHlwZTtcbn07XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi4vY29yZS91dGlscy9leHRlbmQnKSxcbiAgICBEYXRhdml6ID0gcmVxdWlyZSgnLi9kYXRhdml6Jyk7XG5cbmV4dGVuZChEYXRhdml6LnByb3RvdHlwZSwge1xuICAnYWRhcHRlcicgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9hZGFwdGVyJyksXG4gICdhdHRyaWJ1dGVzJyAgICAgICA6IHJlcXVpcmUoJy4vbGliL2F0dHJpYnV0ZXMnKSxcbiAgJ2NhbGwnICAgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvY2FsbCcpLFxuICAnY2hhcnRPcHRpb25zJyAgICAgOiByZXF1aXJlKCcuL2xpYi9jaGFydE9wdGlvbnMnKSxcbiAgJ2NoYXJ0VHlwZScgICAgICAgIDogcmVxdWlyZSgnLi9saWIvY2hhcnRUeXBlJyksXG4gICdjb2xvck1hcHBpbmcnICAgICA6IHJlcXVpcmUoJy4vbGliL2NvbG9yTWFwcGluZycpLFxuICAnY29sb3JzJyAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9jb2xvcnMnKSxcbiAgJ2RhdGEnICAgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvZGF0YScpLFxuICAnZGF0YVR5cGUnICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9kYXRhVHlwZScpLFxuICAnZGVmYXVsdENoYXJ0VHlwZScgOiByZXF1aXJlKCcuL2xpYi9kZWZhdWx0Q2hhcnRUeXBlJyksXG4gICdlbCcgICAgICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2VsJyksXG4gICdoZWlnaHQnICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2hlaWdodCcpLFxuICAnaW5kZXhCeScgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9pbmRleEJ5JyksXG4gICdsYWJlbE1hcHBpbmcnICAgICA6IHJlcXVpcmUoJy4vbGliL2xhYmVsTWFwcGluZycpLFxuICAnbGFiZWxzJyAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9sYWJlbHMnKSxcbiAgJ2xpYnJhcnknICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvbGlicmFyeScpLFxuICAncGFyc2VSYXdEYXRhJyAgICAgOiByZXF1aXJlKCcuL2xpYi9wYXJzZVJhd0RhdGEnKSxcbiAgJ3BhcnNlUmVxdWVzdCcgICAgIDogcmVxdWlyZSgnLi9saWIvcGFyc2VSZXF1ZXN0JyksXG4gICdwcmVwYXJlJyAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL3ByZXBhcmUnKSxcbiAgJ3NvcnRHcm91cHMnICAgICAgIDogcmVxdWlyZSgnLi9saWIvc29ydEdyb3VwcycpLFxuICAnc29ydEludGVydmFscycgICAgOiByZXF1aXJlKCcuL2xpYi9zb3J0SW50ZXJ2YWxzJyksXG4gICdzdGFja2VkJyAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL3N0YWNrZWQnKSxcbiAgJ3RpdGxlJyAgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvdGl0bGUnKSxcbiAgJ3dpZHRoJyAgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvd2lkdGgnKVxufSk7XG5cbmV4dGVuZChEYXRhdml6LnByb3RvdHlwZSwge1xuICAnZGVzdHJveScgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9hY3Rpb25zL2Rlc3Ryb3knKSxcbiAgJ2Vycm9yJyAgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvYWN0aW9ucy9lcnJvcicpLFxuICAnaW5pdGlhbGl6ZScgICAgICAgOiByZXF1aXJlKCcuL2xpYi9hY3Rpb25zL2luaXRpYWxpemUnKSxcbiAgJ3JlbmRlcicgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvYWN0aW9ucy9yZW5kZXInKSxcbiAgJ3VwZGF0ZScgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvYWN0aW9ucy91cGRhdGUnKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YXZpejtcbiIsInZhciBnZXRBZGFwdGVyQWN0aW9ucyA9IHJlcXVpcmUoXCIuLi8uLi9oZWxwZXJzL2dldEFkYXB0ZXJBY3Rpb25zXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBhY3Rpb25zID0gZ2V0QWRhcHRlckFjdGlvbnMuY2FsbCh0aGlzKTtcbiAgaWYgKGFjdGlvbnMuZGVzdHJveSkge1xuICAgIGFjdGlvbnMuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIC8vIGNsZWFyIHJlbmRlcmVkIGFydGlmYXRzLCBzdGF0ZSBiaW5cbiAgaWYgKHRoaXMuZWwoKSkge1xuICAgIHRoaXMuZWwoKS5pbm5lckhUTUwgPSBcIlwiO1xuICB9XG4gIHRoaXMudmlldy5fcHJlcGFyZWQgPSBmYWxzZTtcbiAgdGhpcy52aWV3Ll9pbml0aWFsaXplZCA9IGZhbHNlO1xuICB0aGlzLnZpZXcuX3JlbmRlcmVkID0gZmFsc2U7XG4gIHRoaXMudmlldy5fYXJ0aWZhY3RzID0ge307XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBnZXRBZGFwdGVyQWN0aW9ucyA9IHJlcXVpcmUoXCIuLi8uLi9oZWxwZXJzL2dldEFkYXB0ZXJBY3Rpb25zXCIpLFxuICAgIERhdGF2aXogPSByZXF1aXJlKFwiLi4vLi4vZGF0YXZpelwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgYWN0aW9ucyA9IGdldEFkYXB0ZXJBY3Rpb25zLmNhbGwodGhpcyk7XG4gIGlmIChhY3Rpb25zWydlcnJvciddKSB7XG4gICAgYWN0aW9uc1snZXJyb3InXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9IGVsc2Uge1xuICAgIERhdGF2aXoubGlicmFyaWVzWydrZWVuLWlvJ11bJ2Vycm9yJ10ucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIGdldEFkYXB0ZXJBY3Rpb25zID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvZ2V0QWRhcHRlckFjdGlvbnNcIiksXG4gICAgRGF0YXZpeiA9IHJlcXVpcmUoXCIuLi8uLi9kYXRhdml6XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBhY3Rpb25zID0gZ2V0QWRhcHRlckFjdGlvbnMuY2FsbCh0aGlzKTtcbiAgdmFyIGxvYWRlciA9IERhdGF2aXoubGlicmFyaWVzW3RoaXMudmlldy5sb2FkZXIubGlicmFyeV1bdGhpcy52aWV3LmxvYWRlci5jaGFydFR5cGVdO1xuICBpZiAodGhpcy52aWV3Ll9wcmVwYXJlZCkge1xuICAgIGlmIChsb2FkZXIuZGVzdHJveSkgbG9hZGVyLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodGhpcy5lbCgpKSB0aGlzLmVsKCkuaW5uZXJIVE1MID0gXCJcIjtcbiAgfVxuICBpZiAoYWN0aW9ucy5pbml0aWFsaXplKSBhY3Rpb25zLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgdGhpcy52aWV3Ll9pbml0aWFsaXplZCA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBnZXRBZGFwdGVyQWN0aW9ucyA9IHJlcXVpcmUoXCIuLi8uLi9oZWxwZXJzL2dldEFkYXB0ZXJBY3Rpb25zXCIpLFxuICAgIGFwcGx5VHJhbnNmb3JtcyA9IHJlcXVpcmUoXCIuLi8uLi91dGlscy9hcHBseVRyYW5zZm9ybXNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIGFjdGlvbnMgPSBnZXRBZGFwdGVyQWN0aW9ucy5jYWxsKHRoaXMpO1xuICBhcHBseVRyYW5zZm9ybXMuY2FsbCh0aGlzKTtcbiAgaWYgKCF0aGlzLnZpZXcuX2luaXRpYWxpemVkKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gIH1cbiAgaWYgKHRoaXMuZWwoKSAmJiBhY3Rpb25zLnJlbmRlcikge1xuICAgIGFjdGlvbnMucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy52aWV3Ll9yZW5kZXJlZCA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIGdldEFkYXB0ZXJBY3Rpb25zID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvZ2V0QWRhcHRlckFjdGlvbnNcIiksXG4gICAgYXBwbHlUcmFuc2Zvcm1zID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL2FwcGx5VHJhbnNmb3Jtc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgYWN0aW9ucyA9IGdldEFkYXB0ZXJBY3Rpb25zLmNhbGwodGhpcyk7XG4gIGFwcGx5VHJhbnNmb3Jtcy5jYWxsKHRoaXMpO1xuICBpZiAoYWN0aW9ucy51cGRhdGUpIHtcbiAgICBhY3Rpb25zLnVwZGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9IGVsc2UgaWYgKGFjdGlvbnMucmVuZGVyKSB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3LmFkYXB0ZXI7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgZWFjaChvYmosIGZ1bmN0aW9uKHByb3AsIGtleSl7XG4gICAgc2VsZi52aWV3LmFkYXB0ZXJba2V5XSA9IChwcm9wID8gcHJvcCA6IG51bGwpO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xudmFyIGNoYXJ0T3B0aW9ucyA9IHJlcXVpcmUoXCIuL2NoYXJ0T3B0aW9uc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGVhY2gob2JqLCBmdW5jdGlvbihwcm9wLCBrZXkpe1xuICAgIGlmIChrZXkgPT09IFwiY2hhcnRPcHRpb25zXCIpIHtcbiAgICAgIGNoYXJ0T3B0aW9ucy5jYWxsKHNlbGYsIHByb3ApO1xuICAgICAgLy8gc2VsZi5jaGFydE9wdGlvbnMocHJvcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYudmlld1tcImF0dHJpYnV0ZXNcIl1ba2V5XSA9IHByb3A7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbil7XG4gIGZuLmNhbGwodGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBleHRlbmQgPSByZXF1aXJlKCcuLi8uLi9jb3JlL3V0aWxzL2V4dGVuZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXcuYWRhcHRlci5jaGFydE9wdGlvbnM7XG4gIGV4dGVuZCh0aGlzLnZpZXcuYWRhcHRlci5jaGFydE9wdGlvbnMsIG9iaik7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3LmFkYXB0ZXIuY2hhcnRUeXBlO1xuICB0aGlzLnZpZXcuYWRhcHRlci5jaGFydFR5cGUgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0uY29sb3JNYXBwaW5nO1xuICB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLmNvbG9yTWFwcGluZyA9IChvYmogPyBvYmogOiBudWxsKTtcbiAgY29sb3JNYXBwaW5nLmNhbGwodGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gY29sb3JNYXBwaW5nKCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHNjaGVtYSA9IHRoaXMuZGF0YXNldC5zY2hlbWEsXG4gICAgICBkYXRhID0gdGhpcy5kYXRhc2V0Lm91dHB1dCgpLFxuICAgICAgY29sb3JTZXQgPSB0aGlzLnZpZXcuZGVmYXVsdHMuY29sb3JzLnNsaWNlKCksXG4gICAgICBjb2xvck1hcCA9IHRoaXMuY29sb3JNYXBwaW5nKCksXG4gICAgICBkdCA9IHRoaXMuZGF0YVR5cGUoKSB8fCBcIlwiO1xuXG4gIGlmIChjb2xvck1hcCkge1xuICAgIGlmIChkdC5pbmRleE9mKFwiY2hyb25vbG9naWNhbFwiKSA+IC0xIHx8IChzY2hlbWEudW5wYWNrICYmIGRhdGFbMF0ubGVuZ3RoID4gMikpIHtcbiAgICAgIGVhY2goZGF0YVswXS5zbGljZSgxKSwgZnVuY3Rpb24obGFiZWwsIGkpe1xuICAgICAgICB2YXIgY29sb3IgPSBjb2xvck1hcFtsYWJlbF07XG4gICAgICAgIGlmIChjb2xvciAmJiBjb2xvclNldFtpXSAhPT0gY29sb3IpIHtcbiAgICAgICAgICBjb2xvclNldC5zcGxpY2UoaSwgMCwgY29sb3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlYWNoKHNlbGYuZGF0YXNldC5zZWxlY3RDb2x1bW4oMCkuc2xpY2UoMSksIGZ1bmN0aW9uKGxhYmVsLCBpKXtcbiAgICAgICAgdmFyIGNvbG9yID0gY29sb3JNYXBbbGFiZWxdO1xuICAgICAgICBpZiAoY29sb3IgJiYgY29sb3JTZXRbaV0gIT09IGNvbG9yKSB7XG4gICAgICAgICAgY29sb3JTZXQuc3BsaWNlKGksIDAsIGNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHNlbGYudmlldy5hdHRyaWJ1dGVzLmNvbG9ycyA9IGNvbG9yU2V0O1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFycil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0uY29sb3JzO1xuICB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLmNvbG9ycyA9IChhcnIgaW5zdGFuY2VvZiBBcnJheSA/IGFyciA6IG51bGwpO1xuICB0aGlzLnZpZXcuZGVmYXVsdHMuY29sb3JzID0gKGFyciBpbnN0YW5jZW9mIEFycmF5ID8gYXJyIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBEYXRhc2V0ID0gcmVxdWlyZShcIi4uLy4uL2RhdGFzZXRcIiksXG4gICAgUmVxdWVzdCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3JlcXVlc3RcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSl7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuZGF0YXNldC5vdXRwdXQoKTtcbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBEYXRhc2V0KSB7XG4gICAgdGhpcy5kYXRhc2V0ID0gZGF0YTtcbiAgfSBlbHNlIGlmIChkYXRhIGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgIHRoaXMucGFyc2VSZXF1ZXN0KGRhdGEpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucGFyc2VSYXdEYXRhKGRhdGEpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3LmFkYXB0ZXIuZGF0YVR5cGU7XG4gIHRoaXMudmlldy5hZGFwdGVyLmRhdGFUeXBlID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3LmFkYXB0ZXIuZGVmYXVsdENoYXJ0VHlwZTtcbiAgdGhpcy52aWV3LmFkYXB0ZXIuZGVmYXVsdENoYXJ0VHlwZSA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3LmVsO1xuICB0aGlzLnZpZXcuZWwgPSBlbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihudW0pe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdW1wiaGVpZ2h0XCJdO1xuICB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdW1wiaGVpZ2h0XCJdID0gKCFpc05hTihwYXJzZUludChudW0pKSA/IHBhcnNlSW50KG51bSkgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIERhdGFzZXQgPSByZXF1aXJlKFwiLi4vLi4vZGF0YXNldFwiKSxcbiAgICBEYXRhdml6ID0gcmVxdWlyZShcIi4uL2RhdGF2aXpcIiksXG4gICAgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5pbmRleEJ5O1xuICB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLmluZGV4QnkgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBEYXRhdml6LmRlZmF1bHRzLmluZGV4QnkpO1xuICBpbmRleEJ5LmNhbGwodGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gaW5kZXhCeSgpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gIHJvb3QgPSB0aGlzLmRhdGFzZXQubWV0YS5zY2hlbWEgfHwgdGhpcy5kYXRhc2V0Lm1ldGEudW5wYWNrLFxuICBuZXdPcmRlciA9IHRoaXMuaW5kZXhCeSgpLnNwbGl0KFwiLlwiKS5qb2luKERhdGFzZXQuZGVmYXVsdHMuZGVsaW1ldGVyKTtcbiAgLy8gUmVwbGFjZSBpbiBzY2hlbWEgYW5kIHJlLXJ1biBkYXRhc2V0LnBhcnNlKClcbiAgZWFjaChyb290LCBmdW5jdGlvbihkZWYsIGkpe1xuICAgIC8vIHVwZGF0ZSAnc2VsZWN0JyBjb25maWdzXG4gICAgaWYgKGkgPT09IFwic2VsZWN0XCIgJiYgZGVmIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGVhY2goZGVmLCBmdW5jdGlvbihjLCBqKXtcbiAgICAgICAgaWYgKGMucGF0aC5pbmRleE9mKFwidGltZWZyYW1lIC0+IFwiKSA+IC0xKSB7XG4gICAgICAgICAgc2VsZi5kYXRhc2V0Lm1ldGEuc2NoZW1hW2ldW2pdLnBhdGggPSBuZXdPcmRlcjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIHVwZGF0ZSAndW5wYWNrJyBjb25maWdzXG4gICAgZWxzZSBpZiAoaSA9PT0gXCJ1bnBhY2tcIiAmJiB0eXBlb2YgZGVmID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBzZWxmLmRhdGFzZXQubWV0YS5zY2hlbWFbaV1bJ2luZGV4J10ucGF0aCA9IG5ld09yZGVyO1xuICAgIH1cbiAgfSk7XG4gIHRoaXMuZGF0YXNldC5wYXJzZSgpO1xufVxuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0ubGFiZWxNYXBwaW5nO1xuICB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLmxhYmVsTWFwcGluZyA9IChvYmogPyBvYmogOiBudWxsKTtcbiAgYXBwbHlMYWJlbE1hcHBpbmcuY2FsbCh0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBhcHBseUxhYmVsTWFwcGluZygpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gIGxhYmVsTWFwID0gdGhpcy5sYWJlbE1hcHBpbmcoKSxcbiAgc2NoZW1hID0gdGhpcy5kYXRhc2V0LnNjaGVtYSgpIHx8IHt9LFxuICBkdCA9IHRoaXMuZGF0YVR5cGUoKSB8fCBcIlwiO1xuXG4gIGlmIChsYWJlbE1hcCkge1xuICAgIGlmIChkdC5pbmRleE9mKFwiY2hyb25vbG9naWNhbFwiKSA+IC0xIHx8IChzY2hlbWEudW5wYWNrICYmIHNlbGYuZGF0YXNldC5vdXRwdXQoKVswXS5sZW5ndGggPiAyKSkge1xuICAgICAgLy8gbG9vcCBvdmVyIGhlYWRlciBjZWxsc1xuICAgICAgZWFjaChzZWxmLmRhdGFzZXQub3V0cHV0KClbMF0sIGZ1bmN0aW9uKGMsIGkpe1xuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICBzZWxmLmRhdGFzZXQuZGF0YS5vdXRwdXRbMF1baV0gPSBsYWJlbE1hcFtjXSB8fCBjO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2NoZW1hLnNlbGVjdCAmJiBzZWxmLmRhdGFzZXQub3V0cHV0KClbMF0ubGVuZ3RoID09PSAyKSB7XG4gICAgICAvLyB1cGRhdGUgY29sdW1uIDBcbiAgICAgIHNlbGYuZGF0YXNldC51cGRhdGVDb2x1bW4oMCwgZnVuY3Rpb24oYywgaSl7XG4gICAgICAgIHJldHVybiBsYWJlbE1hcFtjXSB8fCBjO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoJy4uLy4uL2NvcmUvdXRpbHMvZWFjaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFycil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIC8vIElmIGxhYmVscyBjb25maWcgaXMgZW1wdHksIHJldHVybiB3aGF0J3MgaW4gdGhlIGRhdGFzZXRcbiAgICBpZiAoIXRoaXMudmlld1snYXR0cmlidXRlcyddLmxhYmVscyB8fCAhdGhpcy52aWV3WydhdHRyaWJ1dGVzJ10ubGFiZWxzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGdldExhYmVscy5jYWxsKHRoaXMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpZXdbJ2F0dHJpYnV0ZXMnXS5sYWJlbHM7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMudmlld1snYXR0cmlidXRlcyddLmxhYmVscyA9IChhcnIgaW5zdGFuY2VvZiBBcnJheSA/IGFyciA6IG51bGwpO1xuICAgIHNldExhYmVscy5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG5mdW5jdGlvbiBzZXRMYWJlbHMoKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgbGFiZWxTZXQgPSB0aGlzLmxhYmVscygpIHx8IG51bGwsXG4gICAgICBzY2hlbWEgPSB0aGlzLmRhdGFzZXQuc2NoZW1hKCkgfHwge30sXG4gICAgICBkYXRhID0gdGhpcy5kYXRhc2V0Lm91dHB1dCgpLFxuICAgICAgZHQgPSB0aGlzLmRhdGFUeXBlKCkgfHwgJyc7XG5cbiAgaWYgKGxhYmVsU2V0KSB7XG4gICAgaWYgKGR0LmluZGV4T2YoJ2Nocm9ub2xvZ2ljYWwnKSA+IC0xIHx8IChzY2hlbWEudW5wYWNrICYmIGRhdGFbMF0ubGVuZ3RoID4gMikpIHtcbiAgICAgIGVhY2goZGF0YVswXSwgZnVuY3Rpb24oY2VsbCxpKXtcbiAgICAgICAgaWYgKGkgPiAwICYmIGxhYmVsU2V0W2ktMV0pIHtcbiAgICAgICAgICBzZWxmLmRhdGFzZXQuZGF0YS5vdXRwdXRbMF1baV0gPSBsYWJlbFNldFtpLTFdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlYWNoKGRhdGEsIGZ1bmN0aW9uKHJvdyxpKXtcbiAgICAgICAgaWYgKGkgPiAwICYmIGxhYmVsU2V0W2ktMV0pIHtcbiAgICAgICAgICBzZWxmLmRhdGFzZXQuZGF0YS5vdXRwdXRbaV1bMF0gPSBsYWJlbFNldFtpLTFdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxzKCl7XG4gIHZhciBzY2hlbWEgPSB0aGlzLmRhdGFzZXQuc2NoZW1hKCkgfHwge30sXG4gICAgICBkYXRhID0gdGhpcy5kYXRhc2V0Lm91dHB1dCgpLFxuICAgICAgZHQgPSB0aGlzLmRhdGFUeXBlKCkgfHwgJycsXG4gICAgICBsYWJlbHM7XG5cbiAgaWYgKGR0LmluZGV4T2YoJ2Nocm9uJykgPiAtMSB8fCAoc2NoZW1hLnVucGFjayAmJiBkYXRhWzBdLmxlbmd0aCA+IDIpKSB7XG4gICAgbGFiZWxzID0gdGhpcy5kYXRhc2V0LnNlbGVjdFJvdygwKS5zbGljZSgxKTtcbiAgfVxuICBlbHNlIHtcbiAgICBsYWJlbHMgPSB0aGlzLmRhdGFzZXQuc2VsZWN0Q29sdW1uKDApLnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBsYWJlbHM7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlldy5hZGFwdGVyLmxpYnJhcnk7XG4gIHRoaXMudmlldy5hZGFwdGVyLmxpYnJhcnkgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIERhdGF2aXogPSByZXF1aXJlKCcuLi9kYXRhdml6JyksXG4gICAgRGF0YXNldCA9IHJlcXVpcmUoJy4uLy4uL2RhdGFzZXQnKTtcblxudmFyIGVhY2ggPSByZXF1aXJlKCcuLi8uLi9jb3JlL3V0aWxzL2VhY2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihyYXcpe1xuICB0aGlzLmRhdGFzZXQgPSBwYXJzZVJhd0RhdGEuY2FsbCh0aGlzLCByYXcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIHBhcnNlUmF3RGF0YShyZXNwb25zZSl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHNjaGVtYSA9IHt9LFxuICAgICAgaW5kZXhCeSxcbiAgICAgIGRlbGltZXRlcixcbiAgICAgIGluZGV4VGFyZ2V0LFxuICAgICAgbGFiZWxTZXQsXG4gICAgICBsYWJlbE1hcCxcbiAgICAgIGRhdGFUeXBlLFxuICAgICAgZGF0YXNldDtcblxuICBpbmRleEJ5ID0gc2VsZi5pbmRleEJ5KCkgPyBzZWxmLmluZGV4QnkoKSA6IERhdGF2aXouZGVmYXVsdHMuaW5kZXhCeTtcbiAgZGVsaW1ldGVyID0gRGF0YXNldC5kZWZhdWx0cy5kZWxpbWV0ZXI7XG4gIGluZGV4VGFyZ2V0ID0gaW5kZXhCeS5zcGxpdCgnLicpLmpvaW4oZGVsaW1ldGVyKTtcblxuICBsYWJlbFNldCA9IHNlbGYubGFiZWxzKCkgfHwgbnVsbDtcbiAgbGFiZWxNYXAgPSBzZWxmLmxhYmVsTWFwcGluZygpIHx8IG51bGw7XG5cbiAgLy8gTWV0cmljXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaWYgKHR5cGVvZiByZXNwb25zZS5yZXN1bHQgPT0gJ251bWJlcicpe1xuICAgIC8vcmV0dXJuIG5ldyBEYXRhc2V0KHJlc3BvbnNlLCB7XG4gICAgZGF0YVR5cGUgPSAnc2luZ3VsYXInO1xuICAgIHNjaGVtYSA9IHtcbiAgICAgIHJlY29yZHM6ICcnLFxuICAgICAgc2VsZWN0OiBbe1xuICAgICAgICBwYXRoOiAncmVzdWx0JyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGxhYmVsOiAnTWV0cmljJ1xuICAgICAgfV1cbiAgICB9XG4gIH1cblxuICAvLyBFdmVyeXRoaW5nIGVsc2VcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpZiAocmVzcG9uc2UucmVzdWx0IGluc3RhbmNlb2YgQXJyYXkgJiYgcmVzcG9uc2UucmVzdWx0Lmxlbmd0aCA+IDApe1xuXG4gICAgLy8gSW50ZXJ2YWwgdy8gc2luZ2xlIHZhbHVlXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlmIChyZXNwb25zZS5yZXN1bHRbMF0udGltZWZyYW1lICYmICh0eXBlb2YgcmVzcG9uc2UucmVzdWx0WzBdLnZhbHVlID09ICdudW1iZXInIHx8IHJlc3BvbnNlLnJlc3VsdFswXS52YWx1ZSA9PSBudWxsKSkge1xuICAgICAgZGF0YVR5cGUgPSAnY2hyb25vbG9naWNhbCc7XG4gICAgICBzY2hlbWEgPSB7XG4gICAgICAgIHJlY29yZHM6ICdyZXN1bHQnLFxuICAgICAgICBzZWxlY3Q6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBwYXRoOiBpbmRleFRhcmdldCxcbiAgICAgICAgICAgIHR5cGU6ICdkYXRlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcGF0aDogJ3ZhbHVlJyxcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgICAgICAvLyBmb3JtYXQ6ICcxMCdcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTdGF0aWMgR3JvdXBCeVxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAodHlwZW9mIHJlc3BvbnNlLnJlc3VsdFswXS5yZXN1bHQgPT0gJ251bWJlcicpe1xuICAgICAgZGF0YVR5cGUgPSAnY2F0ZWdvcmljYWwnO1xuICAgICAgc2NoZW1hID0ge1xuICAgICAgICByZWNvcmRzOiAncmVzdWx0JyxcbiAgICAgICAgc2VsZWN0OiBbXVxuICAgICAgfTtcbiAgICAgIGZvciAodmFyIGtleSBpbiByZXNwb25zZS5yZXN1bHRbMF0pe1xuICAgICAgICBpZiAocmVzcG9uc2UucmVzdWx0WzBdLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5ICE9PSAncmVzdWx0Jyl7XG4gICAgICAgICAgc2NoZW1hLnNlbGVjdC5wdXNoKHtcbiAgICAgICAgICAgIHBhdGg6IGtleSxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNjaGVtYS5zZWxlY3QucHVzaCh7XG4gICAgICAgIHBhdGg6ICdyZXN1bHQnLFxuICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gR3JvdXBlZCBJbnRlcnZhbFxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAocmVzcG9uc2UucmVzdWx0WzBdLnZhbHVlIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZGF0YVR5cGUgPSAnY2F0LWNocm9ub2xvZ2ljYWwnO1xuICAgICAgc2NoZW1hID0ge1xuICAgICAgICByZWNvcmRzOiAncmVzdWx0JyxcbiAgICAgICAgdW5wYWNrOiB7XG4gICAgICAgICAgaW5kZXg6IHtcbiAgICAgICAgICAgIHBhdGg6IGluZGV4VGFyZ2V0LFxuICAgICAgICAgICAgdHlwZTogJ2RhdGUnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgcGF0aDogJ3ZhbHVlIC0+IHJlc3VsdCcsXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yICh2YXIga2V5IGluIHJlc3BvbnNlLnJlc3VsdFswXS52YWx1ZVswXSl7XG4gICAgICAgIGlmIChyZXNwb25zZS5yZXN1bHRbMF0udmFsdWVbMF0uaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkgIT09ICdyZXN1bHQnKXtcbiAgICAgICAgICBzY2hlbWEudW5wYWNrLmxhYmVsID0ge1xuICAgICAgICAgICAgcGF0aDogJ3ZhbHVlIC0+ICcgKyBrZXksXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZ1bm5lbFxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAodHlwZW9mIHJlc3BvbnNlLnJlc3VsdFswXSA9PSAnbnVtYmVyJyAmJiB0eXBlb2YgcmVzcG9uc2UucmVzdWx0LnN0ZXBzICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgIGRhdGFUeXBlID0gJ2NhdC1vcmRpbmFsJztcbiAgICAgIHNjaGVtYSA9IHtcbiAgICAgICAgcmVjb3JkczogJycsXG4gICAgICAgIHVucGFjazoge1xuICAgICAgICAgIGluZGV4OiB7XG4gICAgICAgICAgICBwYXRoOiAnc3RlcHMgLT4gZXZlbnRfY29sbGVjdGlvbicsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIHBhdGg6ICdyZXN1bHQgLT4gJyxcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2VsZWN0IFVuaXF1ZVxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAodHlwZW9mIHJlc3BvbnNlLnJlc3VsdFswXSA9PSAnc3RyaW5nJyB8fCB0eXBlb2YgcmVzcG9uc2UucmVzdWx0WzBdID09ICdudW1iZXInKXtcbiAgICAgIGRhdGFUeXBlID0gJ25vbWluYWwnO1xuICAgICAgZGF0YXNldCA9IG5ldyBEYXRhc2V0KCk7XG4gICAgICBkYXRhc2V0LmFwcGVuZENvbHVtbigndW5pcXVlIHZhbHVlcycsIFtdKTtcbiAgICAgIGVhY2gocmVzcG9uc2UucmVzdWx0LCBmdW5jdGlvbihyZXN1bHQsIGkpe1xuICAgICAgICBkYXRhc2V0LmFwcGVuZFJvdyhyZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRXh0cmFjdGlvblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAoZGF0YVR5cGUgPT09IHZvaWQgMCkge1xuICAgICAgZGF0YVR5cGUgPSAnZXh0cmFjdGlvbic7XG4gICAgICBzY2hlbWEgPSB7IHJlY29yZHM6ICdyZXN1bHQnLCBzZWxlY3Q6IHRydWUgfTtcbiAgICB9XG5cbiAgfVxuXG4gIGRhdGFzZXQgPSBkYXRhc2V0IGluc3RhbmNlb2YgRGF0YXNldCA/IGRhdGFzZXQgOiBuZXcgRGF0YXNldChyZXNwb25zZSwgc2NoZW1hKTtcblxuICAvLyBTZXQgZGF0YVR5cGVcbiAgaWYgKGRhdGFUeXBlKSB7XG4gICAgc2VsZi5kYXRhVHlwZShkYXRhVHlwZSk7XG4gIH1cblxuICByZXR1cm4gZGF0YXNldDtcbn1cbiIsInZhciBnZXREYXRhc2V0U2NoZW1hcyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2dldERhdGFzZXRTY2hlbWFzXCIpLFxuICAgIGdldERlZmF1bHRUaXRsZSA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2dldERlZmF1bHRUaXRsZVwiKSxcbiAgICBnZXRRdWVyeURhdGFUeXBlID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZ2V0UXVlcnlEYXRhVHlwZVwiKTtcblxudmFyIERhdGFzZXQgPSByZXF1aXJlKFwiLi4vLi4vZGF0YXNldFwiKSxcbiAgICBwYXJzZVJhd0RhdGEgPSByZXF1aXJlKFwiLi9wYXJzZVJhd0RhdGFcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocmVxKXtcbiAgdmFyIGRhdGFUeXBlID0gZ2V0UXVlcnlEYXRhVHlwZShyZXEucXVlcmllc1swXSk7XG5cbiAgaWYgKGRhdGFUeXBlID09PSBcImV4dHJhY3Rpb25cIikge1xuICAgIHRoaXMuZGF0YXNldCA9IGdldERhdGFzZXRTY2hlbWFzLmV4dHJhY3Rpb24ocmVxKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLnBhcnNlUmF3RGF0YShyZXEuZGF0YSBpbnN0YW5jZW9mIEFycmF5ID8gcmVxLmRhdGFbMF0gOiByZXEuZGF0YSk7XG4gIH1cblxuICAvLyBTZXQgZGF0YVR5cGVcbiAgdGhpcy5kYXRhVHlwZShkYXRhVHlwZSk7XG5cbiAgLy8gVXBkYXRlIHRoZSBkZWZhdWx0IHRpdGxlIGV2ZXJ5IHRpbWVcbiAgdGhpcy52aWV3LmRlZmF1bHRzLnRpdGxlID0gZ2V0RGVmYXVsdFRpdGxlLmNhbGwodGhpcywgcmVxKTtcblxuICAvLyBVcGRhdGUgdGhlIGFjdGl2ZSB0aXRsZSBpZiBub3Qgc2V0XG4gIGlmICghdGhpcy50aXRsZSgpKSB7XG4gICAgdGhpcy50aXRsZSh0aGlzLnZpZXcuZGVmYXVsdHMudGl0bGUpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBEYXRhdml6ID0gcmVxdWlyZShcIi4uL2RhdGF2aXpcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIGxvYWRlcjtcbiAgaWYgKHRoaXMudmlldy5fcmVuZGVyZWQpIHtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgfVxuICBpZiAodGhpcy5lbCgpKSB7XG4gICAgdGhpcy5lbCgpLmlubmVySFRNTCA9IFwiXCI7XG4gICAgbG9hZGVyID0gRGF0YXZpei5saWJyYXJpZXNbdGhpcy52aWV3LmxvYWRlci5saWJyYXJ5XVt0aGlzLnZpZXcubG9hZGVyLmNoYXJ0VHlwZV07XG4gICAgaWYgKGxvYWRlci5pbml0aWFsaXplKSB7XG4gICAgICBsb2FkZXIuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICBpZiAobG9hZGVyLnJlbmRlcikge1xuICAgICAgbG9hZGVyLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICB0aGlzLnZpZXcuX3ByZXBhcmVkID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0uc29ydEdyb3VwcztcbiAgdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5zb3J0R3JvdXBzID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJ1blNvcnRHcm91cHMuY2FsbCh0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBydW5Tb3J0R3JvdXBzKCl7XG4gIHZhciBkdCA9IHRoaXMuZGF0YVR5cGUoKTtcbiAgaWYgKCF0aGlzLnNvcnRHcm91cHMoKSkgcmV0dXJuO1xuICBpZiAoKGR0ICYmIGR0LmluZGV4T2YoXCJjaHJvbm9sb2dpY2FsXCIpID4gLTEpIHx8IHRoaXMuZGF0YSgpWzBdLmxlbmd0aCA+IDIpIHtcbiAgICAvLyBTb3J0IGNvbHVtbnMgYnkgU3VtIChuIHZhbHVlcylcbiAgICB0aGlzLmRhdGFzZXQuc29ydENvbHVtbnModGhpcy5zb3J0R3JvdXBzKCksIHRoaXMuZGF0YXNldC5nZXRDb2x1bW5TdW0pO1xuICB9XG4gIGVsc2UgaWYgKGR0ICYmIChkdC5pbmRleE9mKFwiY2F0LVwiKSA+IC0xIHx8IGR0LmluZGV4T2YoXCJjYXRlZ29yaWNhbFwiKSA+IC0xKSkge1xuICAgIC8vIFNvcnQgcm93cyBieSBTdW0gKDEgdmFsdWUpXG4gICAgdGhpcy5kYXRhc2V0LnNvcnRSb3dzKHRoaXMuc29ydEdyb3VwcygpLCB0aGlzLmRhdGFzZXQuZ2V0Um93U3VtKTtcbiAgfVxuICByZXR1cm47XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0uc29ydEludGVydmFscztcbiAgdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5zb3J0SW50ZXJ2YWxzID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJ1blNvcnRJbnRlcnZhbHMuY2FsbCh0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBydW5Tb3J0SW50ZXJ2YWxzKCl7XG4gIGlmICghdGhpcy5zb3J0SW50ZXJ2YWxzKCkpIHJldHVybjtcbiAgLy8gU29ydCByb3dzIGJ5IGluZGV4XG4gIHRoaXMuZGF0YXNldC5zb3J0Um93cyh0aGlzLnNvcnRJbnRlcnZhbHMoKSk7XG4gIHJldHVybjtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYm9vbCl7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1snYXR0cmlidXRlcyddWydzdGFja2VkJ107XG4gIHRoaXMudmlld1snYXR0cmlidXRlcyddWydzdGFja2VkJ10gPSBib29sID8gdHJ1ZSA6IGZhbHNlO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl1bXCJ0aXRsZVwiXTtcbiAgdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXVtcInRpdGxlXCJdID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obnVtKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXVtcIndpZHRoXCJdO1xuICB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdW1wid2lkdGhcIl0gPSAoIWlzTmFOKHBhcnNlSW50KG51bSkpID8gcGFyc2VJbnQobnVtKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cbiAgaWYgKHRoaXMubGFiZWxNYXBwaW5nKCkpIHtcbiAgICB0aGlzLmxhYmVsTWFwcGluZyh0aGlzLmxhYmVsTWFwcGluZygpKTtcbiAgfVxuXG4gIGlmICh0aGlzLmNvbG9yTWFwcGluZygpKSB7XG4gICAgdGhpcy5jb2xvck1hcHBpbmcodGhpcy5jb2xvck1hcHBpbmcoKSk7XG4gIH1cblxuICBpZiAodGhpcy5zb3J0R3JvdXBzKCkpIHtcbiAgICB0aGlzLnNvcnRHcm91cHModGhpcy5zb3J0R3JvdXBzKCkpO1xuICB9XG5cbiAgaWYgKHRoaXMuc29ydEludGVydmFscygpKSB7XG4gICAgdGhpcy5zb3J0SW50ZXJ2YWxzKHRoaXMuc29ydEludGVydmFscygpKTtcbiAgfVxuXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIGNiKSB7XG4gIHZhciBkb2MgPSBkb2N1bWVudDtcbiAgdmFyIGhhbmRsZXI7XG4gIHZhciBoZWFkID0gZG9jLmhlYWQgfHwgZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKTtcblxuICAvLyBsb2FkaW5nIGNvZGUgYm9ycm93ZWQgZGlyZWN0bHkgZnJvbSBMQUJqcyBpdHNlbGZcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgLy8gY2hlY2sgaWYgcmVmIGlzIHN0aWxsIGEgbGl2ZSBub2RlIGxpc3RcbiAgICBpZiAoJ2l0ZW0nIGluIGhlYWQpIHtcbiAgICAgIC8vIGFwcGVuZF90byBub2RlIG5vdCB5ZXQgcmVhZHlcbiAgICAgIGlmICghaGVhZFswXSkge1xuICAgICAgICBzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsIDI1KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gcmVhc3NpZ24gZnJvbSBsaXZlIG5vZGUgbGlzdCByZWYgdG8gcHVyZSBub2RlIHJlZiAtLSBhdm9pZHMgbmFzdHkgSUUgYnVnIHdoZXJlIGNoYW5nZXMgdG8gRE9NIGludmFsaWRhdGUgbGl2ZSBub2RlIGxpc3RzXG4gICAgICBoZWFkID0gaGVhZFswXTtcbiAgICB9XG4gICAgdmFyIHNjcmlwdCA9IGRvYy5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpLFxuICAgIHNjcmlwdGRvbmUgPSBmYWxzZTtcbiAgICBzY3JpcHQub25sb2FkID0gc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICgoc2NyaXB0LnJlYWR5U3RhdGUgJiYgc2NyaXB0LnJlYWR5U3RhdGUgIT09IFwiY29tcGxldGVcIiAmJiBzY3JpcHQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkZWRcIikgfHwgc2NyaXB0ZG9uZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBzY3JpcHQub25sb2FkID0gc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICBzY3JpcHRkb25lID0gdHJ1ZTtcbiAgICAgIGNiKCk7XG4gICAgfTtcbiAgICBzY3JpcHQuc3JjID0gdXJsO1xuICAgIGhlYWQuaW5zZXJ0QmVmb3JlKHNjcmlwdCwgaGVhZC5maXJzdENoaWxkKTtcbiAgfSwgMCk7XG5cbiAgLy8gcmVxdWlyZWQ6IHNoaW0gZm9yIEZGIDw9IDMuNSBub3QgaGF2aW5nIGRvY3VtZW50LnJlYWR5U3RhdGVcbiAgaWYgKGRvYy5yZWFkeVN0YXRlID09PSBudWxsICYmIGRvYy5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgZG9jLnJlYWR5U3RhdGUgPSBcImxvYWRpbmdcIjtcbiAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgICBkb2MucmVhZHlTdGF0ZSA9IFwiY29tcGxldGVcIjtcbiAgICB9LCBmYWxzZSk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVybCwgY2IpIHtcbiAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gIGxpbmsuc2V0QXR0cmlidXRlKCdyZWwnLCAnc3R5bGVzaGVldCcpO1xuICBsaW5rLnR5cGUgPSAndGV4dC9jc3MnO1xuICBsaW5rLmhyZWYgPSB1cmw7XG4gIGNiKCk7XG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihfaW5wdXQpIHtcbiAgLy8gSWYgaXQgaGFzIDMgb3IgZmV3ZXIgc2lnIGZpZ3MgYWxyZWFkeSwganVzdCByZXR1cm4gdGhlIG51bWJlci5cbiAgdmFyIGlucHV0ID0gTnVtYmVyKF9pbnB1dCksXG4gICAgICBzY2lObyA9IGlucHV0LnRvUHJlY2lzaW9uKDMpLFxuICAgICAgcHJlZml4ID0gXCJcIixcbiAgICAgIHN1ZmZpeGVzID0gW1wiXCIsIFwia1wiLCBcIk1cIiwgXCJCXCIsIFwiVFwiXTtcblxuICBpZiAoTnVtYmVyKHNjaU5vKSA9PSBpbnB1dCAmJiBTdHJpbmcoaW5wdXQpLmxlbmd0aCA8PSA0KSB7XG4gICAgcmV0dXJuIFN0cmluZyhpbnB1dCk7XG4gIH1cblxuICBpZihpbnB1dCA+PSAxIHx8IGlucHV0IDw9IC0xKSB7XG4gICAgaWYoaW5wdXQgPCAwKXtcbiAgICAgIC8vUHVsbCBvZmYgdGhlIG5lZ2F0aXZlIHNpZGUgYW5kIHN0YXNoIHRoYXQuXG4gICAgICBpbnB1dCA9IC1pbnB1dDtcbiAgICAgIHByZWZpeCA9IFwiLVwiO1xuICAgIH1cbiAgICByZXR1cm4gcHJlZml4ICsgcmVjdXJzZShpbnB1dCwgMCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGlucHV0LnRvUHJlY2lzaW9uKDMpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVjdXJzZShpbnB1dCwgaXRlcmF0aW9uKSB7XG4gICAgdmFyIGlucHV0ID0gU3RyaW5nKGlucHV0KTtcbiAgICB2YXIgc3BsaXQgPSBpbnB1dC5zcGxpdChcIi5cIik7XG4gICAgLy8gSWYgdGhlcmUncyBhIGRvdFxuICAgIGlmKHNwbGl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgIC8vIEtlZXAgdGhlIGxlZnQgaGFuZCBzaWRlIG9ubHlcbiAgICAgIGlucHV0ID0gc3BsaXRbMF07XG4gICAgICB2YXIgcmhzID0gc3BsaXRbMV07XG4gICAgICAvLyBJZiB0aGUgbGVmdC1oYW5kIHNpZGUgaXMgdG9vIHNob3J0LCBwYWQgdW50aWwgaXQgaGFzIDMgZGlnaXRzXG4gICAgICBpZiAoaW5wdXQubGVuZ3RoID09IDIgJiYgcmhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gUGFkIHdpdGggcmlnaHQtaGFuZCBzaWRlIGlmIHBvc3NpYmxlXG4gICAgICAgIGlmIChyaHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGlucHV0ID0gaW5wdXQgKyBcIi5cIiArIHJocy5jaGFyQXQoMCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUGFkIHdpdGggemVyb2VzIGlmIHlvdSBtdXN0XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlucHV0ICs9IFwiMFwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpbnB1dC5sZW5ndGggPT0gMSAmJiByaHMubGVuZ3RoID4gMCkge1xuICAgICAgICBpbnB1dCA9IGlucHV0ICsgXCIuXCIgKyByaHMuY2hhckF0KDApO1xuICAgICAgICAvLyBQYWQgd2l0aCByaWdodC1oYW5kIHNpZGUgaWYgcG9zc2libGVcbiAgICAgICAgaWYocmhzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBpbnB1dCArPSByaHMuY2hhckF0KDEpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFBhZCB3aXRoIHplcm9lcyBpZiB5b3UgbXVzdFxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpbnB1dCArPSBcIjBcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgbnVtTnVtZXJhbHMgPSBpbnB1dC5sZW5ndGg7XG4gICAgLy8gaWYgaXQgaGFzIGEgcGVyaW9kLCB0aGVuIG51bU51bWVyYWxzIGlzIDEgc21hbGxlciB0aGFuIHRoZSBzdHJpbmcgbGVuZ3RoOlxuICAgIGlmIChpbnB1dC5zcGxpdChcIi5cIikubGVuZ3RoID4gMSkge1xuICAgICAgbnVtTnVtZXJhbHMtLTtcbiAgICB9XG4gICAgaWYobnVtTnVtZXJhbHMgPD0gMykge1xuICAgICAgcmV0dXJuIFN0cmluZyhpbnB1dCkgKyBzdWZmaXhlc1tpdGVyYXRpb25dO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiByZWN1cnNlKE51bWJlcihpbnB1dCkgLyAxMDAwLCBpdGVyYXRpb24gKyAxKTtcbiAgICB9XG4gIH1cbn07XG4iLCI7KGZ1bmN0aW9uIChmKSB7XG4gIC8vIFJlcXVpcmVKU1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoXCJrZWVuXCIsIFtdLCBmdW5jdGlvbigpeyByZXR1cm4gZigpOyB9KTtcbiAgfVxuICAvLyBDb21tb25KU1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZigpO1xuICB9XG4gIC8vIEdsb2JhbFxuICB2YXIgZyA9IG51bGw7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgZyA9IHdpbmRvdztcbiAgfSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgZyA9IGdsb2JhbDtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGcgPSBzZWxmO1xuICB9XG4gIGlmIChnKSB7XG4gICAgZy5LZWVuID0gZigpO1xuICB9XG59KShmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIEtlZW4gPSByZXF1aXJlKFwiLi9jb3JlXCIpLFxuICAgICAgZXh0ZW5kID0gcmVxdWlyZShcIi4vY29yZS91dGlscy9leHRlbmRcIik7XG5cbiAgZXh0ZW5kKEtlZW4ucHJvdG90eXBlLCB7XG4gICAgXCJhZGRFdmVudFwiICAgICAgICAgICAgOiByZXF1aXJlKFwiLi9jb3JlL2xpYi9hZGRFdmVudFwiKSxcbiAgICBcImFkZEV2ZW50c1wiICAgICAgICAgICA6IHJlcXVpcmUoXCIuL2NvcmUvbGliL2FkZEV2ZW50c1wiKSxcbiAgICBcInNldEdsb2JhbFByb3BlcnRpZXNcIiA6IHJlcXVpcmUoXCIuL2NvcmUvbGliL3NldEdsb2JhbFByb3BlcnRpZXNcIiksXG4gICAgXCJ0cmFja0V4dGVybmFsTGlua1wiICAgOiByZXF1aXJlKFwiLi9jb3JlL2xpYi90cmFja0V4dGVybmFsTGlua1wiKSxcbiAgICBcImdldFwiICAgICAgICAgICAgICAgICA6IHJlcXVpcmUoXCIuL2NvcmUvbGliL2dldFwiKSxcbiAgICBcInBvc3RcIiAgICAgICAgICAgICAgICA6IHJlcXVpcmUoXCIuL2NvcmUvbGliL3Bvc3RcIiksXG4gICAgXCJwdXRcIiAgICAgICAgICAgICAgICAgOiByZXF1aXJlKFwiLi9jb3JlL2xpYi9wb3N0XCIpLFxuICAgIFwicnVuXCIgICAgICAgICAgICAgICAgIDogcmVxdWlyZShcIi4vY29yZS9saWIvcnVuXCIpLFxuICAgIFwiZHJhd1wiICAgICAgICAgICAgICAgIDogcmVxdWlyZShcIi4vZGF0YXZpei9leHRlbnNpb25zL2RyYXdcIilcbiAgfSk7XG5cbiAgS2Vlbi5RdWVyeSA9IHJlcXVpcmUoXCIuL2NvcmUvcXVlcnlcIik7XG4gIEtlZW4uUmVxdWVzdCA9IHJlcXVpcmUoXCIuL2NvcmUvcmVxdWVzdFwiKTtcbiAgS2Vlbi5EYXRhc2V0ID0gcmVxdWlyZShcIi4vZGF0YXNldFwiKTtcbiAgS2Vlbi5EYXRhdml6ID0gcmVxdWlyZShcIi4vZGF0YXZpelwiKTtcblxuICBLZWVuLkJhc2U2NCA9IHJlcXVpcmUoXCIuL2NvcmUvdXRpbHMvYmFzZTY0XCIpO1xuICBLZWVuLlNwaW5uZXIgPSByZXF1aXJlKFwic3Bpbi5qc1wiKTtcblxuICBLZWVuLnV0aWxzID0ge1xuICAgIFwiZG9tcmVhZHlcIiAgICAgOiByZXF1aXJlKFwiZG9tcmVhZHlcIiksXG4gICAgXCJlYWNoXCIgICAgICAgICA6IHJlcXVpcmUoXCIuL2NvcmUvdXRpbHMvZWFjaFwiKSxcbiAgICBcImV4dGVuZFwiICAgICAgIDogZXh0ZW5kLFxuICAgIFwicGFyc2VQYXJhbXNcIiAgOiByZXF1aXJlKFwiLi9jb3JlL3V0aWxzL3BhcnNlUGFyYW1zXCIpLFxuICAgIFwicHJldHR5TnVtYmVyXCIgOiByZXF1aXJlKFwiLi9kYXRhdml6L3V0aWxzL3ByZXR0eU51bWJlclwiKVxuICAgIC8vIFwibG9hZFNjcmlwdFwiICAgOiByZXF1aXJlKFwiLi9kYXRhdml6L3V0aWxzL2xvYWRTY3JpcHRcIiksXG4gICAgLy8gXCJsb2FkU3R5bGVcIiAgICA6IHJlcXVpcmUoXCIuL2RhdGF2aXovdXRpbHMvbG9hZFN0eWxlXCIpXG4gIH07XG5cbiAgcmVxdWlyZShcIi4vZGF0YXZpei9hZGFwdGVycy9rZWVuLWlvXCIpKCk7XG4gIHJlcXVpcmUoXCIuL2RhdGF2aXovYWRhcHRlcnMvZ29vZ2xlXCIpKCk7XG4gIHJlcXVpcmUoXCIuL2RhdGF2aXovYWRhcHRlcnMvYzNcIikoKTtcbiAgcmVxdWlyZShcIi4vZGF0YXZpei9hZGFwdGVycy9jaGFydGpzXCIpKCk7XG5cbiAgaWYgKEtlZW4ubG9hZGVkKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgS2Vlbi51dGlscy5kb21yZWFkeShmdW5jdGlvbigpe1xuICAgICAgICBLZWVuLmVtaXQoXCJyZWFkeVwiKTtcbiAgICAgIH0pO1xuICAgIH0sIDApO1xuICB9XG4gIHJlcXVpcmUoXCIuL2NvcmUvYXN5bmNcIikoKTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IEtlZW47XG4gIHJldHVybiBLZWVuO1xufSk7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDE0IElCTSBDb3JwLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSAnTGljZW5zZScpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiAnQVMgSVMnIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbi8qKlxuICogQ2FwdHVyZXMgbWljcm9waG9uZSBpbnB1dCBmcm9tIHRoZSBicm93c2VyLlxuICogV29ya3MgYXQgbGVhc3Qgb24gbGF0ZXN0IHZlcnNpb25zIG9mIEZpcmVmb3ggYW5kIENocm9tZVxuICovXG5mdW5jdGlvbiBNaWNyb3Bob25lKF9vcHRpb25zKSB7XG4gIHZhciBvcHRpb25zID0gX29wdGlvbnMgfHwge307XG5cbiAgLy8gd2UgcmVjb3JkIGluIG1vbm8gYmVjYXVzZSB0aGUgc3BlZWNoIHJlY29nbml0aW9uIHNlcnZpY2VcbiAgLy8gZG9lcyBub3Qgc3VwcG9ydCBzdGVyZW8uXG4gIHRoaXMuYnVmZmVyU2l6ZSA9IG9wdGlvbnMuYnVmZmVyU2l6ZSB8fCA4MTkyO1xuICB0aGlzLmlucHV0Q2hhbm5lbHMgPSBvcHRpb25zLmlucHV0Q2hhbm5lbHMgfHwgMTtcbiAgdGhpcy5vdXRwdXRDaGFubmVscyA9IG9wdGlvbnMub3V0cHV0Q2hhbm5lbHMgfHwgMTtcbiAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZTtcbiAgdGhpcy5yZXF1ZXN0ZWRBY2Nlc3MgPSBmYWxzZTtcbiAgdGhpcy5zYW1wbGVSYXRlID0gMTYwMDA7XG4gIC8vIGF1eGlsaWFyIGJ1ZmZlciB0byBrZWVwIHVudXNlZCBzYW1wbGVzICh1c2VkIHdoZW4gZG9pbmcgZG93bnNhbXBsaW5nKVxuICB0aGlzLmJ1ZmZlclVudXNlZFNhbXBsZXMgPSBuZXcgRmxvYXQzMkFycmF5KDApO1xuXG4gIC8vIENocm9tZSBvciBGaXJlZm94IG9yIElFIFVzZXIgbWVkaWFcbiAgaWYgKCFuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKSB7XG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHxcbiAgICBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYTtcbiAgfVxuXG59XG5cbi8qKlxuICogQ2FsbGVkIHdoZW4gdGhlIHVzZXIgcmVqZWN0IHRoZSB1c2Ugb2YgdGhlIG1pY2hyb3Bob25lXG4gKiBAcGFyYW0gIGVycm9yIFRoZSBlcnJvclxuICovXG5NaWNyb3Bob25lLnByb3RvdHlwZS5vblBlcm1pc3Npb25SZWplY3RlZCA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnTWljcm9waG9uZS5vblBlcm1pc3Npb25SZWplY3RlZCgpJyk7XG4gIHRoaXMucmVxdWVzdGVkQWNjZXNzID0gZmFsc2U7XG4gIHRoaXMub25FcnJvcignUGVybWlzc2lvbiB0byBhY2Nlc3MgdGhlIG1pY3JvcGhvbmUgcmVqZXRlZC4nKTtcbn07XG5cbk1pY3JvcGhvbmUucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbihlcnJvcikge1xuICBjb25zb2xlLmxvZygnTWljcm9waG9uZS5vbkVycm9yKCk6JywgZXJyb3IpO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBhdXRob3JpemVzIHRoZSB1c2Ugb2YgdGhlIG1pY3JvcGhvbmUuXG4gKiBAcGFyYW0gIHtPYmplY3R9IHN0cmVhbSBUaGUgU3RyZWFtIHRvIGNvbm5lY3QgdG9cbiAqXG4gKi9cbk1pY3JvcGhvbmUucHJvdG90eXBlLm9uTWVkaWFTdHJlYW0gPSAgZnVuY3Rpb24oc3RyZWFtKSB7XG4gIHZhciBBdWRpb0N0eCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcblxuICBpZiAoIUF1ZGlvQ3R4KVxuICAgIHRocm93IG5ldyBFcnJvcignQXVkaW9Db250ZXh0IG5vdCBhdmFpbGFibGUnKTtcblxuICBpZiAoIXRoaXMuYXVkaW9Db250ZXh0KVxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ3R4KCk7XG5cbiAgdmFyIGdhaW4gPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gIHZhciBhdWRpb0lucHV0ID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2Uoc3RyZWFtKTtcblxuICBhdWRpb0lucHV0LmNvbm5lY3QoZ2Fpbik7XG5cbiAgdGhpcy5taWMgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IodGhpcy5idWZmZXJTaXplLFxuICAgIHRoaXMuaW5wdXRDaGFubmVscywgdGhpcy5vdXRwdXRDaGFubmVscyk7XG5cbiAgLy8gdW5jb21tZW50IHRoZSBmb2xsb3dpbmcgbGluZSBpZiB5b3Ugd2FudCB0byB1c2UgeW91ciBtaWNyb3Bob25lIHNhbXBsZSByYXRlXG4gIC8vdGhpcy5zYW1wbGVSYXRlID0gdGhpcy5hdWRpb0NvbnRleHQuc2FtcGxlUmF0ZTtcbiAgY29uc29sZS5sb2coJ01pY3JvcGhvbmUub25NZWRpYVN0cmVhbSgpOiBzYW1wbGluZyByYXRlIGlzOicsIHRoaXMuc2FtcGxlUmF0ZSk7XG5cbiAgdGhpcy5taWMub25hdWRpb3Byb2Nlc3MgPSB0aGlzLl9vbmF1ZGlvcHJvY2Vzcy5iaW5kKHRoaXMpO1xuICB0aGlzLnN0cmVhbSA9IHN0cmVhbTtcblxuICBnYWluLmNvbm5lY3QodGhpcy5taWMpO1xuICB0aGlzLm1pYy5jb25uZWN0KHRoaXMuYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgdGhpcy5yZWNvcmRpbmcgPSB0cnVlO1xuICB0aGlzLnJlcXVlc3RlZEFjY2VzcyA9IGZhbHNlO1xuICB0aGlzLm9uU3RhcnRSZWNvcmRpbmcoKTtcbn07XG5cbi8qKlxuICogY2FsbGJhY2sgdGhhdCBpcyBiZWluZyB1c2VkIGJ5IHRoZSBtaWNyb3Bob25lXG4gKiB0byBzZW5kIGF1ZGlvIGNodW5rcy5cbiAqIEBwYXJhbSAge29iamVjdH0gZGF0YSBhdWRpb1xuICovXG5NaWNyb3Bob25lLnByb3RvdHlwZS5fb25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbihkYXRhKSB7XG4gIGlmICghdGhpcy5yZWNvcmRpbmcpIHtcbiAgICAvLyBXZSBzcGVhayBidXQgd2UgYXJlIG5vdCByZWNvcmRpbmdcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBTaW5nbGUgY2hhbm5lbFxuICB2YXIgY2hhbiA9IGRhdGEuaW5wdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7ICBcbiAgXG4gIC8vcmVzYW1wbGVyKHRoaXMuYXVkaW9Db250ZXh0LnNhbXBsZVJhdGUsZGF0YS5pbnB1dEJ1ZmZlcix0aGlzLm9uQXVkaW8pO1xuXG4gIHRoaXMub25BdWRpbyh0aGlzLl9leHBvcnREYXRhQnVmZmVyVG8xNktoeihuZXcgRmxvYXQzMkFycmF5KGNoYW4pKSk7XG5cbiAgLy9leHBvcnQgd2l0aCBtaWNyb3Bob25lIG1oeiwgcmVtZW1iZXIgdG8gdXBkYXRlIHRoZSB0aGlzLnNhbXBsZVJhdGVcbiAgLy8gd2l0aCB0aGUgc2FtcGxlIHJhdGUgZnJvbSB5b3VyIG1pY3JvcGhvbmVcbiAgLy8gdGhpcy5vbkF1ZGlvKHRoaXMuX2V4cG9ydERhdGFCdWZmZXIobmV3IEZsb2F0MzJBcnJheShjaGFuKSkpO1xuXG59O1xuXG4vKipcbiAqIFN0YXJ0IHRoZSBhdWRpbyByZWNvcmRpbmdcbiAqL1xuTWljcm9waG9uZS5wcm90b3R5cGUucmVjb3JkID0gZnVuY3Rpb24oKSB7XG4gIGlmICghbmF2aWdhdG9yLmdldFVzZXJNZWRpYSl7XG4gICAgdGhpcy5vbkVycm9yKCdCcm93c2VyIGRvZXNuXFwndCBzdXBwb3J0IG1pY3JvcGhvbmUgaW5wdXQnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHRoaXMucmVxdWVzdGVkQWNjZXNzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5yZXF1ZXN0ZWRBY2Nlc3MgPSB0cnVlO1xuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKHsgYXVkaW86IHRydWUgfSxcbiAgICB0aGlzLm9uTWVkaWFTdHJlYW0uYmluZCh0aGlzKSwgLy8gTWljcm9waG9uZSBwZXJtaXNzaW9uIGdyYW50ZWRcbiAgICB0aGlzLm9uUGVybWlzc2lvblJlamVjdGVkLmJpbmQodGhpcykpOyAvLyBNaWNyb3Bob25lIHBlcm1pc3Npb24gcmVqZWN0ZWRcbn07XG5cbi8qKlxuICogU3RvcCB0aGUgYXVkaW8gcmVjb3JkaW5nXG4gKi9cbk1pY3JvcGhvbmUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLnJlY29yZGluZylcbiAgICByZXR1cm47XG4gIHRoaXMucmVjb3JkaW5nID0gZmFsc2U7XG4gIHRoaXMuc3RyZWFtLnN0b3AoKTtcbiAgdGhpcy5yZXF1ZXN0ZWRBY2Nlc3MgPSBmYWxzZTtcbiAgdGhpcy5taWMuZGlzY29ubmVjdCgwKTtcbiAgdGhpcy5taWMgPSBudWxsO1xuICB0aGlzLm9uU3RvcFJlY29yZGluZygpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgQmxvYiB0eXBlOiAnYXVkaW8vbDE2JyB3aXRoIHRoZSBjaHVuayBhbmQgZG93bnNhbXBsaW5nIHRvIDE2IGtIelxuICogY29taW5nIGZyb20gdGhlIG1pY3JvcGhvbmUuXG4gKiBFeHBsYW5hdGlvbiBmb3IgdGhlIG1hdGg6IFRoZSByYXcgdmFsdWVzIGNhcHR1cmVkIGZyb20gdGhlIFdlYiBBdWRpbyBBUEkgYXJlXG4gKiBpbiAzMi1iaXQgRmxvYXRpbmcgUG9pbnQsIGJldHdlZW4gLTEgYW5kIDEgKHBlciB0aGUgc3BlY2lmaWNhdGlvbikuXG4gKiBUaGUgdmFsdWVzIGZvciAxNi1iaXQgUENNIHJhbmdlIGJldHdlZW4gLTMyNzY4IGFuZCArMzI3NjcgKDE2LWJpdCBzaWduZWQgaW50ZWdlcikuXG4gKiBNdWx0aXBseSB0byBjb250cm9sIHRoZSB2b2x1bWUgb2YgdGhlIG91dHB1dC4gV2Ugc3RvcmUgaW4gbGl0dGxlIGVuZGlhbi5cbiAqIEBwYXJhbSAge09iamVjdH0gYnVmZmVyIE1pY3JvcGhvbmUgYXVkaW8gY2h1bmtcbiAqIEByZXR1cm4ge0Jsb2J9ICdhdWRpby9sMTYnIGNodW5rXG4gKiBAZGVwcmVjYXRlZCBUaGlzIG1ldGhvZCBpcyBkZXByYWNhdGVkXG4gKi9cbk1pY3JvcGhvbmUucHJvdG90eXBlLl9leHBvcnREYXRhQnVmZmVyVG8xNktoeiA9IGZ1bmN0aW9uKGJ1ZmZlck5ld1NhbXBsZXMpIHtcbiAgdmFyIGJ1ZmZlciA9IG51bGwsXG4gICAgbmV3U2FtcGxlcyA9IGJ1ZmZlck5ld1NhbXBsZXMubGVuZ3RoLFxuICAgIHVudXNlZFNhbXBsZXMgPSB0aGlzLmJ1ZmZlclVudXNlZFNhbXBsZXMubGVuZ3RoOyAgIFxuICAgIFxuXG4gIGlmICh1bnVzZWRTYW1wbGVzID4gMCkge1xuICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkodW51c2VkU2FtcGxlcyArIG5ld1NhbXBsZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdW51c2VkU2FtcGxlczsgKytpKSB7XG4gICAgICBidWZmZXJbaV0gPSB0aGlzLmJ1ZmZlclVudXNlZFNhbXBsZXNbaV07XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBuZXdTYW1wbGVzOyArK2kpIHtcbiAgICAgIGJ1ZmZlclt1bnVzZWRTYW1wbGVzICsgaV0gPSBidWZmZXJOZXdTYW1wbGVzW2ldO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBidWZmZXIgPSBidWZmZXJOZXdTYW1wbGVzO1xuICB9XG5cbiAgLy8gZG93bnNhbXBsaW5nIHZhcmlhYmxlc1xuICB2YXIgZmlsdGVyID0gW1xuICAgICAgLTAuMDM3OTM1LCAtMC4wMDA4OTAyNCwgMC4wNDAxNzMsIDAuMDE5OTg5LCAwLjAwNDc3OTIsIC0wLjA1ODY3NSwgLTAuMDU2NDg3LFxuICAgICAgLTAuMDA0MDY1MywgMC4xNDUyNywgMC4yNjkyNywgMC4zMzkxMywgMC4yNjkyNywgMC4xNDUyNywgLTAuMDA0MDY1MywgLTAuMDU2NDg3LFxuICAgICAgLTAuMDU4Njc1LCAwLjAwNDc3OTIsIDAuMDE5OTg5LCAwLjA0MDE3MywgLTAuMDAwODkwMjQsIC0wLjAzNzkzNVxuICAgIF0sXG4gICAgc2FtcGxpbmdSYXRlUmF0aW8gPSB0aGlzLmF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlIC8gMTYwMDAsXG4gICAgbk91dHB1dFNhbXBsZXMgPSBNYXRoLmZsb29yKChidWZmZXIubGVuZ3RoIC0gZmlsdGVyLmxlbmd0aCkgLyAoc2FtcGxpbmdSYXRlUmF0aW8pKSArIDEsXG4gICAgcGNtRW5jb2RlZEJ1ZmZlcjE2ayA9IG5ldyBBcnJheUJ1ZmZlcihuT3V0cHV0U2FtcGxlcyAqIDIpLFxuICAgIGRhdGFWaWV3MTZrID0gbmV3IERhdGFWaWV3KHBjbUVuY29kZWRCdWZmZXIxNmspLFxuICAgIGluZGV4ID0gMCxcbiAgICB2b2x1bWUgPSAweDdGRkYsIC8vcmFuZ2UgZnJvbSAwIHRvIDB4N0ZGRiB0byBjb250cm9sIHRoZSB2b2x1bWVcbiAgICBuT3V0ID0gMDtcblxuICBmb3IgKHZhciBpID0gMDsgaSArIGZpbHRlci5sZW5ndGggLSAxIDwgYnVmZmVyLmxlbmd0aDsgaSA9IE1hdGgucm91bmQoc2FtcGxpbmdSYXRlUmF0aW8gKiBuT3V0KSkge1xuICAgIHZhciBzYW1wbGUgPSAwO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgZmlsdGVyLmxlbmd0aDsgKytqKSB7XG4gICAgICBzYW1wbGUgKz0gYnVmZmVyW2kgKyBqXSAqIGZpbHRlcltqXTtcbiAgICB9XG4gICAgc2FtcGxlICo9IHZvbHVtZTtcbiAgICBkYXRhVmlldzE2ay5zZXRJbnQxNihpbmRleCwgc2FtcGxlLCB0cnVlKTsgLy8gJ3RydWUnIC0+IG1lYW5zIGxpdHRsZSBlbmRpYW5cbiAgICBpbmRleCArPSAyO1xuICAgIG5PdXQrKztcbiAgfVxuXG4gIHZhciBpbmRleFNhbXBsZUFmdGVyTGFzdFVzZWQgPSBNYXRoLnJvdW5kKHNhbXBsaW5nUmF0ZVJhdGlvICogbk91dCk7XG4gIHZhciByZW1haW5pbmcgPSBidWZmZXIubGVuZ3RoIC0gaW5kZXhTYW1wbGVBZnRlckxhc3RVc2VkO1xuICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgIHRoaXMuYnVmZmVyVW51c2VkU2FtcGxlcyA9IG5ldyBGbG9hdDMyQXJyYXkocmVtYWluaW5nKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcmVtYWluaW5nOyArK2kpIHtcbiAgICAgIHRoaXMuYnVmZmVyVW51c2VkU2FtcGxlc1tpXSA9IGJ1ZmZlcltpbmRleFNhbXBsZUFmdGVyTGFzdFVzZWQgKyBpXTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5idWZmZXJVbnVzZWRTYW1wbGVzID0gbmV3IEZsb2F0MzJBcnJheSgwKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgQmxvYihbZGF0YVZpZXcxNmtdLCB7XG4gICAgdHlwZTogJ2F1ZGlvL2wxNidcbiAgfSk7XG4gIH07XG5cbiAgXG4gIFxuLy8gbmF0aXZlIHdheSBvZiByZXNhbXBsaW5nIGNhcHR1cmVkIGF1ZGlvXG52YXIgcmVzYW1wbGVyID0gZnVuY3Rpb24oc2FtcGxlUmF0ZSwgYXVkaW9CdWZmZXIsIGNhbGxiYWNrUHJvY2Vzc0F1ZGlvKSB7XG5cdFxuXHRjb25zb2xlLmxvZyhcImxlbmd0aDogXCIgKyBhdWRpb0J1ZmZlci5sZW5ndGggKyBcIiBcIiArIHNhbXBsZVJhdGUpO1xuXHR2YXIgY2hhbm5lbHMgPSAxOyBcblx0dmFyIHRhcmdldFNhbXBsZVJhdGUgPSAxNjAwMDtcbiAgIHZhciBudW1TYW1wbGVzVGFyZ2V0ID0gYXVkaW9CdWZmZXIubGVuZ3RoICogdGFyZ2V0U2FtcGxlUmF0ZSAvIHNhbXBsZVJhdGU7XG5cbiAgIHZhciBvZmZsaW5lQ29udGV4dCA9IG5ldyBPZmZsaW5lQXVkaW9Db250ZXh0KGNoYW5uZWxzLCBudW1TYW1wbGVzVGFyZ2V0LCB0YXJnZXRTYW1wbGVSYXRlKTtcbiAgIHZhciBidWZmZXJTb3VyY2UgPSBvZmZsaW5lQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgIGJ1ZmZlclNvdXJjZS5idWZmZXIgPSBhdWRpb0J1ZmZlcjtcblxuXHQvLyBjYWxsYmFjayB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSByZXNhbXBsaW5nIGZpbmlzaGVzXG4gICBvZmZsaW5lQ29udGV4dC5vbmNvbXBsZXRlID0gZnVuY3Rpb24oZXZlbnQpIHsgICBcdFxuICAgICAgdmFyIHNhbXBsZXNUYXJnZXQgPSBldmVudC5yZW5kZXJlZEJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGNvbnNvbGUubG9nKCdEb25lIHJlc2FtcGxpbmc6ICcgKyBzYW1wbGVzVGFyZ2V0Lmxlbmd0aCArIFwiIHNhbXBsZXMgcHJvZHVjZWRcIik7ICBcblxuXHRcdC8vIGNvbnZlcnQgZnJvbSBbLTEsMV0gcmFuZ2Ugb2YgZmxvYXRpbmcgcG9pbnQgbnVtYmVycyB0byBbLTMyNzY3LDMyNzY3XSByYW5nZSBvZiBpbnRlZ2Vyc1xuXHRcdHZhciBpbmRleCA9IDA7XG5cdFx0dmFyIHZvbHVtZSA9IDB4N0ZGRjtcbiAgXHRcdHZhciBwY21FbmNvZGVkQnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHNhbXBsZXNUYXJnZXQubGVuZ3RoKjIpOyAgICAvLyBzaG9ydCBpbnRlZ2VyIHRvIGJ5dGVcbiAgXHRcdHZhciBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhwY21FbmNvZGVkQnVmZmVyKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2FtcGxlc1RhcmdldC5sZW5ndGg7IGkrKykge1xuICAgIFx0XHRkYXRhVmlldy5zZXRJbnQxNihpbmRleCwgc2FtcGxlc1RhcmdldFtpXSp2b2x1bWUsIHRydWUpO1xuICAgIFx0XHRpbmRleCArPSAyO1xuICBcdFx0fVxuXG4gICAgICAvLyBsMTYgaXMgdGhlIE1JTUUgdHlwZSBmb3IgMTYtYml0IFBDTVxuICAgICAgY2FsbGJhY2tQcm9jZXNzQXVkaW8obmV3IEJsb2IoW2RhdGFWaWV3XSwgeyB0eXBlOiAnYXVkaW8vbDE2JyB9KSk7ICAgICAgICAgXG4gICB9O1xuXG4gICBidWZmZXJTb3VyY2UuY29ubmVjdChvZmZsaW5lQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICBidWZmZXJTb3VyY2Uuc3RhcnQoMCk7XG4gICBvZmZsaW5lQ29udGV4dC5zdGFydFJlbmRlcmluZygpOyAgIFxufTtcbiBcbiAgXG5cbi8qKlxuICogQ3JlYXRlcyBhIEJsb2IgdHlwZTogJ2F1ZGlvL2wxNicgd2l0aCB0aGVcbiAqIGNodW5rIGNvbWluZyBmcm9tIHRoZSBtaWNyb3Bob25lLlxuICovXG52YXIgZXhwb3J0RGF0YUJ1ZmZlciA9IGZ1bmN0aW9uKGJ1ZmZlciwgYnVmZmVyU2l6ZSkge1xuICB2YXIgcGNtRW5jb2RlZEJ1ZmZlciA9IG51bGwsXG4gICAgZGF0YVZpZXcgPSBudWxsLFxuICAgIGluZGV4ID0gMCxcbiAgICB2b2x1bWUgPSAweDdGRkY7IC8vcmFuZ2UgZnJvbSAwIHRvIDB4N0ZGRiB0byBjb250cm9sIHRoZSB2b2x1bWVcblxuICBwY21FbmNvZGVkQnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlclNpemUgKiAyKTtcbiAgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcocGNtRW5jb2RlZEJ1ZmZlcik7XG5cbiAgLyogRXhwbGFuYXRpb24gZm9yIHRoZSBtYXRoOiBUaGUgcmF3IHZhbHVlcyBjYXB0dXJlZCBmcm9tIHRoZSBXZWIgQXVkaW8gQVBJIGFyZVxuICAgKiBpbiAzMi1iaXQgRmxvYXRpbmcgUG9pbnQsIGJldHdlZW4gLTEgYW5kIDEgKHBlciB0aGUgc3BlY2lmaWNhdGlvbikuXG4gICAqIFRoZSB2YWx1ZXMgZm9yIDE2LWJpdCBQQ00gcmFuZ2UgYmV0d2VlbiAtMzI3NjggYW5kICszMjc2NyAoMTYtYml0IHNpZ25lZCBpbnRlZ2VyKS5cbiAgICogTXVsdGlwbHkgdG8gY29udHJvbCB0aGUgdm9sdW1lIG9mIHRoZSBvdXRwdXQuIFdlIHN0b3JlIGluIGxpdHRsZSBlbmRpYW4uXG4gICAqL1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1ZmZlci5sZW5ndGg7IGkrKykge1xuICAgIGRhdGFWaWV3LnNldEludDE2KGluZGV4LCBidWZmZXJbaV0gKiB2b2x1bWUsIHRydWUpO1xuICAgIGluZGV4ICs9IDI7XG4gIH1cblxuICAvLyBsMTYgaXMgdGhlIE1JTUUgdHlwZSBmb3IgMTYtYml0IFBDTVxuICByZXR1cm4gbmV3IEJsb2IoW2RhdGFWaWV3XSwgeyB0eXBlOiAnYXVkaW8vbDE2JyB9KTtcbn07XG5cbk1pY3JvcGhvbmUucHJvdG90eXBlLl9leHBvcnREYXRhQnVmZmVyID0gZnVuY3Rpb24oYnVmZmVyKXtcbiAgdXRpbHMuZXhwb3J0RGF0YUJ1ZmZlcihidWZmZXIsIHRoaXMuYnVmZmVyU2l6ZSk7XG59OyBcblxuXG4vLyBGdW5jdGlvbnMgdXNlZCB0byBjb250cm9sIE1pY3JvcGhvbmUgZXZlbnRzIGxpc3RlbmVycy5cbk1pY3JvcGhvbmUucHJvdG90eXBlLm9uU3RhcnRSZWNvcmRpbmcgPSAgZnVuY3Rpb24oKSB7fTtcbk1pY3JvcGhvbmUucHJvdG90eXBlLm9uU3RvcFJlY29yZGluZyA9ICBmdW5jdGlvbigpIHt9O1xuTWljcm9waG9uZS5wcm90b3R5cGUub25BdWRpbyA9ICBmdW5jdGlvbigpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pY3JvcGhvbmU7XG5cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgIFwibW9kZWxzXCI6IFtcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvZW4tVVNfQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogMTYwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwiZW4tVVNfQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiZW4tVVNcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVVMgRW5nbGlzaCBicm9hZGJhbmQgbW9kZWwgKDE2S0h6KVwiXG4gICAgICB9LCBcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvZW4tVVNfTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDgwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwiZW4tVVNfTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcImVuLVVTXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlVTIEVuZ2xpc2ggbmFycm93YmFuZCBtb2RlbCAoOEtIeilcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvZXMtRVNfQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogMTYwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwiZXMtRVNfQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiZXMtRVNcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3BhbmlzaCBicm9hZGJhbmQgbW9kZWwgKDE2S0h6KVwiXG4gICAgICB9LCBcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvZXMtRVNfTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDgwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwiZXMtRVNfTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcImVzLUVTXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNwYW5pc2ggbmFycm93YmFuZCBtb2RlbCAoOEtIeilcIlxuICAgICAgfSwgXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL2phLUpQX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDE2MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcImphLUpQX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcImphLUpQXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkphcGFuZXNlIGJyb2FkYmFuZCBtb2RlbCAoMTZLSHopXCJcbiAgICAgIH0sIFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9qYS1KUF9OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogODAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJqYS1KUF9OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiamEtSlBcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSmFwYW5lc2UgbmFycm93YmFuZCBtb2RlbCAoOEtIeilcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvcHQtQlJfQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogMTYwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwicHQtQlJfQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwicHQtQlJcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQnJhemlsaWFuIFBvcnR1Z3Vlc2UgYnJvYWRiYW5kIG1vZGVsICgxNktIeilcIlxuICAgICAgfSwgXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL3B0LUJSX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiA4MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcInB0LUJSX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJwdC1CUlwiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJCcmF6aWxpYW4gUG9ydHVndWVzZSBuYXJyb3diYW5kIG1vZGVsICg4S0h6KVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy96aC1DTl9Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiAxNjAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJ6aC1DTl9Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJ6aC1DTlwiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNYW5kYXJpbiBicm9hZGJhbmQgbW9kZWwgKDE2S0h6KVwiXG4gICAgICB9LCAgICAgXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL3poLUNOX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiA4MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcInpoLUNOX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJ6aC1DTlwiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNYW5kYXJpbiBuYXJyb3diYW5kIG1vZGVsICg4S0h6KVwiXG4gICAgICB9ICAgICAgXG4gICBdXG59XG4iLCJcbnZhciBlZmZlY3RzID0gcmVxdWlyZSgnLi92aWV3cy9lZmZlY3RzJyk7XG52YXIgZGlzcGxheSA9IHJlcXVpcmUoJy4vdmlld3MvZGlzcGxheW1ldGFkYXRhJyk7XG52YXIgaGlkZUVycm9yID0gcmVxdWlyZSgnLi92aWV3cy9zaG93ZXJyb3InKS5oaWRlRXJyb3I7XG52YXIgaW5pdFNvY2tldCA9IHJlcXVpcmUoJy4vc29ja2V0JykuaW5pdFNvY2tldDtcblxuZXhwb3J0cy5oYW5kbGVGaWxlVXBsb2FkID0gZnVuY3Rpb24odG9rZW4sIG1vZGVsLCBmaWxlLCBjb250ZW50VHlwZSwgY2FsbGJhY2ssIG9uZW5kKSB7XG5cbiAgICAvLyBTZXQgY3VycmVudGx5RGlzcGxheWluZyB0byBwcmV2ZW50IG90aGVyIHNvY2tldHMgZnJvbSBvcGVuaW5nXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCB0cnVlKTtcblxuICAgIC8vICQoJyNwcm9ncmVzc0luZGljYXRvcicpLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG5cbiAgICAkLnN1YnNjcmliZSgncHJvZ3Jlc3MnLCBmdW5jdGlvbihldnQsIGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwcm9ncmVzczogJywgZGF0YSk7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnY29udGVudFR5cGUnLCBjb250ZW50VHlwZSk7XG5cbiAgICB2YXIgYmFzZVN0cmluZyA9ICcnO1xuICAgIHZhciBiYXNlSlNPTiA9ICcnO1xuXG4gICAgJC5zdWJzY3JpYmUoJ3Nob3dqc29uJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyICRyZXN1bHRzSlNPTiA9ICQoJyNyZXN1bHRzSlNPTicpXG4gICAgICAkcmVzdWx0c0pTT04uZW1wdHkoKTtcbiAgICAgICRyZXN1bHRzSlNPTi5hcHBlbmQoYmFzZUpTT04pO1xuICAgIH0pO1xuXG4gICAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgICBvcHRpb25zLnRva2VuID0gdG9rZW47XG4gICAgb3B0aW9ucy5tZXNzYWdlID0ge1xuICAgICAgJ2FjdGlvbic6ICdzdGFydCcsXG4gICAgICAnY29udGVudC10eXBlJzogY29udGVudFR5cGUsXG4gICAgICAnaW50ZXJpbV9yZXN1bHRzJzogdHJ1ZSxcbiAgICAgICdjb250aW51b3VzJzogdHJ1ZSxcbiAgICAgICd3b3JkX2NvbmZpZGVuY2UnOiB0cnVlLFxuICAgICAgJ3RpbWVzdGFtcHMnOiB0cnVlLFxuICAgICAgJ21heF9hbHRlcm5hdGl2ZXMnOiAzLFxuICAgICAgJ2luYWN0aXZpdHlfdGltZW91dCc6IDYwMFxuICAgIH07XG4gICAgb3B0aW9ucy5tb2RlbCA9IG1vZGVsO1xuXG4gICAgZnVuY3Rpb24gb25PcGVuKHNvY2tldCkge1xuICAgICAgY29uc29sZS5sb2coJ1NvY2tldCBvcGVuZWQnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkxpc3RlbmluZyhzb2NrZXQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdTb2NrZXQgbGlzdGVuaW5nJyk7XG4gICAgICBjYWxsYmFjayhzb2NrZXQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uTWVzc2FnZShtc2cpIHtcbiAgICAgIGlmIChtc2cucmVzdWx0cykge1xuICAgICAgICAvLyBDb252ZXJ0IHRvIGNsb3N1cmUgYXBwcm9hY2hcbiAgICAgICAgYmFzZVN0cmluZyA9IGRpc3BsYXkuc2hvd1Jlc3VsdChtc2csIGJhc2VTdHJpbmcsIG1vZGVsKTtcbiAgICAgICAgYmFzZUpTT04gPSBkaXNwbGF5LnNob3dKU09OKG1zZywgYmFzZUpTT04pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uRXJyb3IoZXZ0KSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcbiAgICAgIG9uZW5kKGV2dCk7XG4gICAgICBjb25zb2xlLmxvZygnU29ja2V0IGVycjogJywgZXZ0LmNvZGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uQ2xvc2UoZXZ0KSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcbiAgICAgIG9uZW5kKGV2dCk7XG4gICAgICBjb25zb2xlLmxvZygnU29ja2V0IGNsb3Npbmc6ICcsIGV2dCk7XG4gICAgfVxuXG4gICAgaW5pdFNvY2tldChvcHRpb25zLCBvbk9wZW4sIG9uTGlzdGVuaW5nLCBvbk1lc3NhZ2UsIG9uRXJyb3IsIG9uQ2xvc2UpO1xufVxuXG4iLCJcbid1c2Ugc3RyaWN0JztcblxudmFyIGluaXRTb2NrZXQgPSByZXF1aXJlKCcuL3NvY2tldCcpLmluaXRTb2NrZXQ7XG52YXIgZGlzcGxheSA9IHJlcXVpcmUoJy4vdmlld3MvZGlzcGxheW1ldGFkYXRhJyk7XG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIga2VlbkNsaWVudCA9IHJlcXVpcmUoJy4va2VlbicpLmNsaWVudDtcblxuZXhwb3J0cy5oYW5kbGVNaWNyb3Bob25lID0gZnVuY3Rpb24odG9rZW4sIG1vZGVsLCBtaWMsIGNhbGxiYWNrKSB7XG5cbiAgaWYgKG1vZGVsLmluZGV4T2YoJ05hcnJvd2JhbmQnKSA+IC0xKSB7XG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcignTWljcm9waG9uZSB0cmFuc2NyaXB0aW9uIGNhbm5vdCBhY2NvbW9kYXRlIG5hcnJvd2JhbmQgbW9kZWxzLCBwbGVhc2Ugc2VsZWN0IGFub3RoZXInKTtcbiAgICBjYWxsYmFjayhlcnIsIG51bGwpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAkLnB1Ymxpc2goJ2NsZWFyc2NyZWVuJyk7XG5cbiAgLy8gVGVzdCBvdXQgd2Vic29ja2V0XG4gIHZhciBiYXNlU3RyaW5nID0gJyc7XG4gIHZhciBiYXNlSlNPTiA9ICcnO1xuXG4gICQuc3Vic2NyaWJlKCdzaG93anNvbicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgJHJlc3VsdHNKU09OID0gJCgnI3Jlc3VsdHNKU09OJylcbiAgICAkcmVzdWx0c0pTT04uZW1wdHkoKTtcbiAgICAkcmVzdWx0c0pTT04uYXBwZW5kKGJhc2VKU09OKTtcbiAgfSk7XG5cbiAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgb3B0aW9ucy50b2tlbiA9IHRva2VuO1xuICBvcHRpb25zLm1lc3NhZ2UgPSB7XG4gICAgJ2FjdGlvbic6ICdzdGFydCcsXG4gICAgJ2NvbnRlbnQtdHlwZSc6ICdhdWRpby9sMTY7cmF0ZT0xNjAwMCcsXG4gICAgJ2ludGVyaW1fcmVzdWx0cyc6IHRydWUsXG4gICAgJ2NvbnRpbnVvdXMnOiB0cnVlLFxuICAgICd3b3JkX2NvbmZpZGVuY2UnOiB0cnVlLFxuICAgICd0aW1lc3RhbXBzJzogdHJ1ZSxcbiAgICAnbWF4X2FsdGVybmF0aXZlcyc6IDMsXG4gICAgJ2luYWN0aXZpdHlfdGltZW91dCc6IDYwMCAgICBcbiAgfTtcbiAgb3B0aW9ucy5tb2RlbCA9IG1vZGVsO1xuXG4gIGZ1bmN0aW9uIG9uT3Blbihzb2NrZXQpIHtcbiAgICBjb25zb2xlLmxvZygnTWljIHNvY2tldDogb3BlbmVkJyk7XG4gICAgY2FsbGJhY2sobnVsbCwgc29ja2V0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uTGlzdGVuaW5nKHNvY2tldCkge1xuXG4gICAgbWljLm9uQXVkaW8gPSBmdW5jdGlvbihibG9iKSB7XG4gICAgICBpZiAoc29ja2V0LnJlYWR5U3RhdGUgPCAyKSB7XG4gICAgICAgIHNvY2tldC5zZW5kKGJsb2IpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICB2YXIgc3BlZWNoID0ge307XG4gIHNwZWVjaC50cmFuc2NyaXB0ID0gJyc7XG4gIHNwZWVjaC53b3JkcyA9IFtdO1xuICB2YXIgaGFzaCA9ICcnICsgbmV3IERhdGUoKTtcbiAgZnVuY3Rpb24gb25NZXNzYWdlKG1zZywgc29ja2V0KSB7XG4gICAgLy8gY29uc29sZS5sb2coJ01pYyBzb2NrZXQgbXNnOiAnLCBtc2cpO1xuICAgICQoJyNzcGVlY2gtY29udGFpbmVyJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgaWYgKG1zZy5yZXN1bHRzKSB7XG4gICAgICBpZiAobXNnLnJlc3VsdHMgJiYgbXNnLnJlc3VsdHNbMF0gJiYgbXNnLnJlc3VsdHNbMF0uZmluYWwpIHtcbiAgICAgICAgdmFyIGZpbmFsX21lc3NhZ2UgPSBtc2cucmVzdWx0c1swXS5hbHRlcm5hdGl2ZXNbMF07XG4gICAgICAgIHNwZWVjaC50cmFuc2NyaXB0ICs9IGZpbmFsX21lc3NhZ2UudHJhbnNjcmlwdDtcbiAgICAgICAgJCgnI3Jlc3VsdHNUZXh0JykuaHRtbChzcGVlY2gudHJhbnNjcmlwdCk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBmaW5hbF9tZXNzYWdlLndvcmRfY29uZmlkZW5jZS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIHZhciBuZXh0X3dvcmQgPSB7fTtcbiAgICAgICAgICBuZXh0X3dvcmQudGV4dCA9IGZpbmFsX21lc3NhZ2Uud29yZF9jb25maWRlbmNlW2ldWzBdO1xuICAgICAgICAgIG5leHRfd29yZC5jb25maWRlbmNlID0gZmluYWxfbWVzc2FnZS53b3JkX2NvbmZpZGVuY2VbaV1bMV07XG4gICAgICAgICAgdmFyIGJlZ2luX3RpbWUgPSBmaW5hbF9tZXNzYWdlLnRpbWVzdGFtcHNbaV1bMV07XG4gICAgICAgICAgdmFyIGVuZF90aW1lID0gZmluYWxfbWVzc2FnZS50aW1lc3RhbXBzW2ldWzJdO1xuICAgICAgICAgIG5leHRfd29yZC50aW1lID0gYmVnaW5fdGltZTtcbiAgICAgICAgICBuZXh0X3dvcmQuZHVyYXRpb24gPSBlbmRfdGltZSAtIGJlZ2luX3RpbWU7XG4gICAgICAgICAgbmV4dF93b3JkLnNwZWVjaF9pZCA9IGhhc2g7XG4gICAgICAgICAga2VlbkNsaWVudC5hZGRFdmVudChcIndvcmRzXCIsIG5leHRfd29yZCk7XG4gICAgICAgICAgc3BlZWNoLndvcmRzLnB1c2gobmV4dF93b3JkKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRoaXMgLS0gaXQganVzdCB1cGRhdGVzIHRoZSBET00gd2l0aCB0aGUgaW5jb21pbmcgbWVzc2FnZVxuICAgICAgICAvLyBiYXNlU3RyaW5nID0gZGlzcGxheS5zaG93UmVzdWx0KG1zZywgYmFzZVN0cmluZywgbW9kZWwpO1xuICAgICAgICAvLyBiYXNlSlNPTiA9IGRpc3BsYXkuc2hvd0pTT04obXNnLCBiYXNlSlNPTik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25FcnJvcihyLCBzb2NrZXQpIHtcbiAgICBjb25zb2xlLmxvZygnTWljIHNvY2tldCBlcnI6ICcsIGVycik7XG4gIH1cblxuICBmdW5jdGlvbiBzZW5kV29yZHNUb0tlZW4od29yZHMpIHtcbiAgICBpZiAoIXdvcmRzIHx8IHdvcmRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNwZWVjaF9pZCA9IHdvcmRzWzBdLnNwZWVjaF9pZDtcbiAgICB2YXIgbXVsdGlwbGVFdmVudHMgPSB7XG4gICAgICBcIndvcmRzXCI6IHdvcmRzXG4gICAgfTtcblxuICAgIC8vIEtlZW4ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy8gICBrZWVuQ2xpZW50LmFkZEV2ZW50cyhtdWx0aXBsZUV2ZW50cywgZnVuY3Rpb24oZXJyLCByZXMpe1xuICAgIC8vICAgICBpZiAoZXJyKSB7XG4gICAgLy8gICAgICAgY29uc29sZS5sb2coJ2VycicsIGVycik7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgZWxzZSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNwZWVjaF9pZCk7XG4gICAgICAgICAgICB2YXIgcXVlcnkgPSBuZXcgS2Vlbi5RdWVyeShcImNvdW50XCIsIHtcbiAgICAgICAgICAgICAgZXZlbnRDb2xsZWN0aW9uOiBcIndvcmRzXCIsXG4gICAgICAgICAgICAgIGZpbHRlcnM6IFt7XCJvcGVyYXRvclwiOlwiZXFcIixcInByb3BlcnR5X25hbWVcIjpcInNwZWVjaF9pZFwiLFwicHJvcGVydHlfdmFsdWVcIjpzcGVlY2hfaWR9XSxcbiAgICAgICAgICAgICAgZ3JvdXBCeTogXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgIHRpbWVmcmFtZTogXCJ0aGlzXzE0X2RheXNcIixcbiAgICAgICAgICAgICAgdGltZXpvbmU6IFwiVVRDXCJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBrZWVuQ2xpZW50LmRyYXcocXVlcnksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdncmlkLTEtMScpLCB7XG4gICAgICAgICAgICAgIC8vIEN1c3RvbSBjb25maWd1cmF0aW9uIGhlcmVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCcjY2hhcnQtY29udGFpbmVyJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgfSwgMTAwMDApO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9KTtcbiAgICAvLyB9KTtcbiAgICAvLyB2YXIgYXBpX2tleSA9ICcyZmM3NjA2OGVhMzk1NjJhNWUzYzhmM2FlNWMxMGEwNTg4YmYwNzQyNDY4NjFiMzZmYTE3MTUwYmQyMWRkMDExNDBhYzA1MWIyYmFlNGFlMTE1OGUyMTc4NTdiYWY3MzExMjEyMGQ0ZjkwYTcyYjU2ZTRjMWM5N2QzZjRiMGUyNDhiOTA1NDI3Y2ZlODE4MjU1MmJhYzNiOTFhZTcyZDdkMDYyYWIyMDQxMjY4MWFjMzk4NDQ5MThhNGNhMmQwMGM0MDc1YWUwNDgwMzBmZThmYzk1MjEyNzc0MDEwZGI2NSc7XG4gICAgLy8gdmFyIGtlZW5fdXJsID0gJ2h0dHBzOi8vYXBpLmtlZW4uaW8vMy4wL3Byb2plY3RzLzU2MDZmM2Y0OTBlNGJkN2IwZTBlMWRkYy9ldmVudHMvd29yZHMnO1xuICAgIC8vICQuYWpheCh7XG4gICAgLy8gICB1cmw6IGtlZW5fdXJsLFxuICAgIC8vICAgdHlwZTogJ3Bvc3QnLFxuICAgIC8vICAgZGF0YToge1xuICAgIC8vICAgICAna2V5JzogYXBpX2tleVxuICAgIC8vICAgfSxcbiAgICAvLyAgIGhlYWRlcnM6IHtcbiAgICAvLyAgICAgJ0F1dGhvcml6YXRpb24nOiAnV1JJVEVfS0VZJyxcbiAgICAvLyAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIC8vICAgfSxcbiAgICAvLyAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgLy8gICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coJ2tlZW4gcmVzcG9uc2UnLCByZXNwb25zZSk7XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gICAgLy8gLy8gJC5wb3N0KGtlZW5fdXJsLCBkYXRhLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgIC8vIC8vICAgY29uc29sZS5sb2coJ2tlZW4gcmVzcG9uc2UnLCByZXNwb25zZSk7XG4gICAgLy8gLy8gfSk7XG4gIH1cblxuICBmdW5jdGlvbiBvbkNsb3NlKGV2dCkge1xuICAgIC8vIHZhciBzYWx0ID0gYmNyeXB0LmdlblNhbHRTeW5jKDEwKTtcbiAgICAvLyB2YXIgaGFzaCA9IGJjcnlwdC5oYXNoU3luYyhzcGVlY2gudHJhbnNjcmlwdCwgc2FsdCk7XG4gICAgJCgnI3Jlc3VsdHNUZXh0JykuaHRtbChzcGVlY2gudHJhbnNjcmlwdCk7XG4gICAgc2VuZFdvcmRzVG9LZWVuKHNwZWVjaC53b3Jkcyk7XG4gICAgLy8gY29uc29sZS5sb2coJ01pYyBzb2NrZXQgY2xvc2U6ICcsIGV2dCk7XG4gICAgLy8gVE9ETzogc2VuZCBzdHVmZiB0byBrZWVuIGlvXG4gIH1cblxuICBpbml0U29ja2V0KG9wdGlvbnMsIG9uT3Blbiwgb25MaXN0ZW5pbmcsIG9uTWVzc2FnZSwgb25FcnJvciwgb25DbG9zZSk7XG59IiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNCBJQk0gQ29ycC4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG4vKmdsb2JhbCAkOmZhbHNlICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIE1pY3JvcGhvbmUgPSByZXF1aXJlKCcuL01pY3JvcGhvbmUnKTtcbnZhciBtb2RlbHMgPSByZXF1aXJlKCcuL2RhdGEvbW9kZWxzLmpzb24nKS5tb2RlbHM7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG51dGlscy5pbml0UHViU3ViKCk7XG52YXIgaW5pdFZpZXdzID0gcmVxdWlyZSgnLi92aWV3cycpLmluaXRWaWV3cztcblxud2luZG93LkJVRkZFUlNJWkUgPSA4MTkyO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuICAvLyBNYWtlIGNhbGwgdG8gQVBJIHRvIHRyeSBhbmQgZ2V0IHRva2VuXG4gIHV0aWxzLmdldFRva2VuKGZ1bmN0aW9uKHRva2VuKSB7XG5cbiAgICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICBsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcbiAgICB9O1xuXG4gICAgaWYgKCF0b2tlbikge1xuICAgICAgY29uc29sZS5lcnJvcignTm8gYXV0aG9yaXphdGlvbiB0b2tlbiBhdmFpbGFibGUnKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0F0dGVtcHRpbmcgdG8gcmVjb25uZWN0Li4uJyk7XG4gICAgfVxuXG4gICAgdmFyIHZpZXdDb250ZXh0ID0ge1xuICAgICAgY3VycmVudE1vZGVsOiAnZW4tVVNfQnJvYWRiYW5kTW9kZWwnLFxuICAgICAgbW9kZWxzOiBtb2RlbHMsXG4gICAgICB0b2tlbjogdG9rZW4sXG4gICAgICBidWZmZXJTaXplOiBCVUZGRVJTSVpFXG4gICAgfTtcblxuICAgIGluaXRWaWV3cyh2aWV3Q29udGV4dCk7XG5cbiAgICAvLyBTYXZlIG1vZGVscyB0byBsb2NhbHN0b3JhZ2VcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbW9kZWxzJywgSlNPTi5zdHJpbmdpZnkobW9kZWxzKSk7XG5cbiAgICAvLyBTZXQgZGVmYXVsdCBjdXJyZW50IG1vZGVsXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRNb2RlbCcsICdlbi1VU19Ccm9hZGJhbmRNb2RlbCcpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzZXNzaW9uUGVybWlzc2lvbnMnLCAndHJ1ZScpO1xuXG5cbiAgICAkLnN1YnNjcmliZSgnY2xlYXJzY3JlZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICQoJyNyZXN1bHRzVGV4dCcpLnRleHQoJycpO1xuICAgICAgJCgnI3Jlc3VsdHNKU09OJykudGV4dCgnJyk7XG4gICAgICAkKCcuZXJyb3Itcm93JykuaGlkZSgpO1xuICAgICAgJCgnLm5vdGlmaWNhdGlvbi1yb3cnKS5oaWRlKCk7XG4gICAgICAkKCcuaHlwb3RoZXNlcyA+IHVsJykuZW1wdHkoKTtcbiAgICAgICQoJyNtZXRhZGF0YVRhYmxlQm9keScpLmVtcHR5KCk7XG4gICAgfSk7XG5cbiAgfSk7XG5cbn0pO1xuIiwidmFyIEtlZW4gPSByZXF1aXJlKCdrZWVuLWpzJyk7XG5cbmV4cG9ydHMuY2xpZW50ID0gbmV3IEtlZW4oe1xuICBwcm9qZWN0SWQ6IFwiNTYwNmYzZjQ5MGU0YmQ3YjBlMGUxZGRjXCIsIC8vIFN0cmluZyAocmVxdWlyZWQgYWx3YXlzKVxuICB3cml0ZUtleTogXCIyZmM3NjA2OGVhMzk1NjJhNWUzYzhmM2FlNWMxMGEwNTg4YmYwNzQyNDY4NjFiMzZmYTE3MTUwYmQyMWRkMDExNDBhYzA1MWIyYmFlNGFlMTE1OGUyMTc4NTdiYWY3MzExMjEyMGQ0ZjkwYTcyYjU2ZTRjMWM5N2QzZjRiMGUyNDhiOTA1NDI3Y2ZlODE4MjU1MmJhYzNiOTFhZTcyZDdkMDYyYWIyMDQxMjY4MWFjMzk4NDQ5MThhNGNhMmQwMGM0MDc1YWUwNDgwMzBmZThmYzk1MjEyNzc0MDEwZGI2NVwiLCAgIC8vIFN0cmluZyAocmVxdWlyZWQgZm9yIHNlbmRpbmcgZGF0YSlcbiAgcmVhZEtleTogXCJiMmU1NDQ2YTA0MDliNzNkMTkyY2M3YzZjM2IzOWFkMmZjNWFiZWEzODc2ZDE4ODVlYWUyNWYyNTBkYTM4MzQ5N2EyMjdjZmQ2ZjY5ZDMwMjQ2MDY1YTk2ZTYyMWEzM2EyYjZkMjJmZWVjODBhN2VlNGQ1MjA3NzU1NTJhMGYwOWJjMzc4ZWU3ZWM4YTUzZDc1MzRjNDE2M2JjNWI5MjBkN2ViNjk4NTU0Y2U1YjBmZDhiZjAwZGUzOTk2NzVkNDU0MTQ2MTY2ZDFmOTRkYTIyMTYwODA4Y2UyNzUxMTA2NFwiICAgICAgLy8gU3RyaW5nIChyZXF1aXJlZCBmb3IgcXVlcnlpbmcgZGF0YSlcblxuICAvLyBwcm90b2NvbDogXCJodHRwc1wiLCAgICAgICAgIC8vIFN0cmluZyAob3B0aW9uYWw6IGh0dHBzIHwgaHR0cCB8IGF1dG8pXG4gIC8vIGhvc3Q6IFwiYXBpLmtlZW4uaW8vMy4wXCIsICAgLy8gU3RyaW5nIChvcHRpb25hbClcbiAgLy8gcmVxdWVzdFR5cGU6IFwianNvbnBcIiAgICAgICAvLyBTdHJpbmcgKG9wdGlvbmFsOiBqc29ucCwgeGhyLCBiZWFjb24pXG59KTtcblxuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNCBJQk0gQ29ycC4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG4vKmdsb2JhbCAkOmZhbHNlICovXG5cblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIE1pY3JvcGhvbmUgPSByZXF1aXJlKCcuL01pY3JvcGhvbmUnKTtcbnZhciBzaG93ZXJyb3IgPSByZXF1aXJlKCcuL3ZpZXdzL3Nob3dlcnJvcicpO1xudmFyIHNob3dFcnJvciA9IHNob3dlcnJvci5zaG93RXJyb3I7XG52YXIgaGlkZUVycm9yID0gc2hvd2Vycm9yLmhpZGVFcnJvcjtcblxuLy8gTWluaSBXUyBjYWxsYmFjayBBUEksIHNvIHdlIGNhbiBpbml0aWFsaXplXG4vLyB3aXRoIG1vZGVsIGFuZCB0b2tlbiBpbiBVUkksIHBsdXNcbi8vIHN0YXJ0IG1lc3NhZ2VcblxuLy8gSW5pdGlhbGl6ZSBjbG9zdXJlLCB3aGljaCBob2xkcyBtYXhpbXVtIGdldFRva2VuIGNhbGwgY291bnRcbnZhciB0b2tlbkdlbmVyYXRvciA9IHV0aWxzLmNyZWF0ZVRva2VuR2VuZXJhdG9yKCk7XG5cbnZhciBpbml0U29ja2V0ID0gZXhwb3J0cy5pbml0U29ja2V0ID0gZnVuY3Rpb24ob3B0aW9ucywgb25vcGVuLCBvbmxpc3RlbmluZywgb25tZXNzYWdlLCBvbmVycm9yLCBvbmNsb3NlKSB7XG4gIHZhciBsaXN0ZW5pbmc7XG4gIGZ1bmN0aW9uIHdpdGhEZWZhdWx0KHZhbCwgZGVmYXVsdFZhbCkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJyA/IGRlZmF1bHRWYWwgOiB2YWw7XG4gIH1cbiAgdmFyIHNvY2tldDtcbiAgdmFyIHRva2VuID0gb3B0aW9ucy50b2tlbjtcbiAgdmFyIG1vZGVsID0gb3B0aW9ucy5tb2RlbCB8fCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudE1vZGVsJyk7XG4gIHZhciBtZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlIHx8IHsnYWN0aW9uJzogJ3N0YXJ0J307XG4gIHZhciBzZXNzaW9uUGVybWlzc2lvbnMgPSB3aXRoRGVmYXVsdChvcHRpb25zLnNlc3Npb25QZXJtaXNzaW9ucywgSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc2Vzc2lvblBlcm1pc3Npb25zJykpKTtcbiAgdmFyIHNlc3Npb25QZXJtaXNzaW9uc1F1ZXJ5UGFyYW0gPSBzZXNzaW9uUGVybWlzc2lvbnMgPyAnMCcgOiAnMSc7XG4gIHZhciB1cmwgPSBvcHRpb25zLnNlcnZpY2VVUkkgfHwgJ3dzczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL3JlY29nbml6ZT93YXRzb24tdG9rZW49J1xuICAgICsgdG9rZW5cbiAgICArICcmWC1XREMtUEwtT1BULU9VVD0nICsgc2Vzc2lvblBlcm1pc3Npb25zUXVlcnlQYXJhbVxuICAgICsgJyZtb2RlbD0nICsgbW9kZWw7XG4gIGNvbnNvbGUubG9nKCdVUkwgbW9kZWwnLCBtb2RlbCk7XG4gIHRyeSB7XG4gICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmwpO1xuICB9IGNhdGNoKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1dTIGNvbm5lY3Rpb24gZXJyb3I6ICcsIGVycik7XG4gIH1cbiAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uKGV2dCkge1xuICAgIGxpc3RlbmluZyA9IGZhbHNlO1xuICAgICQuc3Vic2NyaWJlKCdoYXJkc29ja2V0c3RvcCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdNSUNST1BIT05FOiBjbG9zZS4nKTtcbiAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KHthY3Rpb246J3N0b3AnfSkpO1xuICAgIH0pO1xuICAgICQuc3Vic2NyaWJlKCdzb2NrZXRzdG9wJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ01JQ1JPUEhPTkU6IGNsb3NlLicpO1xuICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgfSk7XG4gICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgIG9ub3Blbihzb2NrZXQpO1xuICB9O1xuICBzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgdmFyIG1zZyA9IEpTT04ucGFyc2UoZXZ0LmRhdGEpO1xuICAgIGlmIChtc2cuZXJyb3IpIHtcbiAgICAgIHNob3dFcnJvcihtc2cuZXJyb3IpO1xuICAgICAgJC5wdWJsaXNoKCdoYXJkc29ja2V0c3RvcCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAobXNnLnN0YXRlID09PSAnbGlzdGVuaW5nJykge1xuICAgICAgLy8gRWFybHkgY3V0IG9mZiwgd2l0aG91dCBub3RpZmljYXRpb25cbiAgICAgIGlmICghbGlzdGVuaW5nKSB7XG4gICAgICAgIG9ubGlzdGVuaW5nKHNvY2tldCk7XG4gICAgICAgIGxpc3RlbmluZyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnTUlDUk9QSE9ORTogQ2xvc2luZyBzb2NrZXQuJyk7XG4gICAgICAgIHNvY2tldC5jbG9zZSgpO1xuICAgICAgfVxuICAgIH1cbiAgICBvbm1lc3NhZ2UobXNnLCBzb2NrZXQpO1xuICB9O1xuXG4gIHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgY29uc29sZS5sb2coJ1dTIG9uZXJyb3I6ICcsIGV2dCk7XG4gICAgc2hvd0Vycm9yKCdBcHBsaWNhdGlvbiBlcnJvciAnICsgZXZ0LmNvZGUgKyAnOiBwbGVhc2UgcmVmcmVzaCB5b3VyIGJyb3dzZXIgYW5kIHRyeSBhZ2FpbicpO1xuICAgICQucHVibGlzaCgnY2xlYXJzY3JlZW4nKTtcbiAgICBvbmVycm9yKGV2dCk7XG4gIH07XG5cbiAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbihldnQpIHtcbiAgICBjb25zb2xlLmxvZygnV1Mgb25jbG9zZTogJywgZXZ0KTtcbiAgICBpZiAoZXZ0LmNvZGUgPT09IDEwMDYpIHtcbiAgICAgIC8vIEF1dGhlbnRpY2F0aW9uIGVycm9yLCB0cnkgdG8gcmVjb25uZWN0XG4gICAgICBjb25zb2xlLmxvZygnZ2VuZXJhdG9yIGNvdW50JywgdG9rZW5HZW5lcmF0b3IuZ2V0Q291bnQoKSk7XG4gICAgICBpZiAodG9rZW5HZW5lcmF0b3IuZ2V0Q291bnQoKSA+IDEpIHtcbiAgICAgICAgJC5wdWJsaXNoKCdoYXJkc29ja2V0c3RvcCcpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhdXRob3JpemF0aW9uIHRva2VuIGlzIGN1cnJlbnRseSBhdmFpbGFibGVcIik7XG4gICAgICB9XG4gICAgICB0b2tlbkdlbmVyYXRvci5nZXRUb2tlbihmdW5jdGlvbih0b2tlbiwgZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAkLnB1Ymxpc2goJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdGZXRjaGluZyBhZGRpdGlvbmFsIHRva2VuLi4uJyk7XG4gICAgICAgIG9wdGlvbnMudG9rZW4gPSB0b2tlbjtcbiAgICAgICAgaW5pdFNvY2tldChvcHRpb25zLCBvbm9wZW4sIG9ubGlzdGVuaW5nLCBvbm1lc3NhZ2UsIG9uZXJyb3IsIG9uY2xvc2UpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChldnQuY29kZSA9PT0gMTAxMSkge1xuICAgICAgY29uc29sZS5lcnJvcignU2VydmVyIGVycm9yICcgKyBldnQuY29kZSArICc6IHBsZWFzZSByZWZyZXNoIHlvdXIgYnJvd3NlciBhbmQgdHJ5IGFnYWluJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChldnQuY29kZSA+IDEwMDApIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1NlcnZlciBlcnJvciAnICsgZXZ0LmNvZGUgKyAnOiBwbGVhc2UgcmVmcmVzaCB5b3VyIGJyb3dzZXIgYW5kIHRyeSBhZ2FpbicpO1xuICAgICAgLy8gc2hvd0Vycm9yKCdTZXJ2ZXIgZXJyb3IgJyArIGV2dC5jb2RlICsgJzogcGxlYXNlIHJlZnJlc2ggeW91ciBicm93c2VyIGFuZCB0cnkgYWdhaW4nKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gTWFkZSBpdCB0aHJvdWdoLCBub3JtYWwgY2xvc2VcbiAgICAkLnVuc3Vic2NyaWJlKCdoYXJkc29ja2V0c3RvcCcpO1xuICAgICQudW5zdWJzY3JpYmUoJ3NvY2tldHN0b3AnKTtcbiAgICBvbmNsb3NlKGV2dCk7XG4gIH07XG5cbn0iLCJcbi8vIEZvciBub24tdmlldyBsb2dpY1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG52YXIgZmlsZUJsb2NrID0gZnVuY3Rpb24oX29mZnNldCwgbGVuZ3RoLCBfZmlsZSwgcmVhZENodW5rKSB7XG4gIHZhciByID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgdmFyIGJsb2IgPSBfZmlsZS5zbGljZShfb2Zmc2V0LCBsZW5ndGggKyBfb2Zmc2V0KTtcbiAgci5vbmxvYWQgPSByZWFkQ2h1bms7XG4gIHIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYik7XG59XG5cbi8vIEJhc2VkIG9uIGFsZWRpYWZlcmlhJ3MgU08gcmVzcG9uc2Vcbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTQ0MzgxODcvamF2YXNjcmlwdC1maWxlcmVhZGVyLXBhcnNpbmctbG9uZy1maWxlLWluLWNodW5rc1xuZXhwb3J0cy5vbkZpbGVQcm9ncmVzcyA9IGZ1bmN0aW9uKG9wdGlvbnMsIG9uZGF0YSwgb25lcnJvciwgb25lbmQsIHNhbXBsaW5nUmF0ZSkge1xuICB2YXIgZmlsZSAgICAgICA9IG9wdGlvbnMuZmlsZTtcbiAgdmFyIGZpbGVTaXplICAgPSBmaWxlLnNpemU7XG4gIHZhciBjaHVua1NpemUgID0gb3B0aW9ucy5idWZmZXJTaXplIHx8IDE2MDAwOyAgLy8gaW4gYnl0ZXNcbiAgdmFyIG9mZnNldCAgICAgPSAwO1xuICB2YXIgcmVhZENodW5rID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgaWYgKG9mZnNldCA+PSBmaWxlU2l6ZSkge1xuICAgICAgY29uc29sZS5sb2coXCJEb25lIHJlYWRpbmcgZmlsZVwiKTtcbiAgICAgIG9uZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChldnQudGFyZ2V0LmVycm9yID09IG51bGwpIHtcbiAgICAgIHZhciBidWZmZXIgPSBldnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgIHZhciBsZW4gPSBidWZmZXIuYnl0ZUxlbmd0aDtcbiAgICAgIG9mZnNldCArPSBsZW47XG4gICAgICBjb25zb2xlLmxvZyhcInNlbmRpbmc6IFwiICsgbGVuKVxuICAgICAgb25kYXRhKGJ1ZmZlcik7IC8vIGNhbGxiYWNrIGZvciBoYW5kbGluZyByZWFkIGNodW5rXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSBldnQudGFyZ2V0LmVycm9yO1xuICAgICAgY29uc29sZS5sb2coXCJSZWFkIGVycm9yOiBcIiArIGVycm9yTWVzc2FnZSk7XG4gICAgICBvbmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIHVzZSB0aGlzIHRpbWVvdXQgdG8gcGFjZSB0aGUgZGF0YSB1cGxvYWQgZm9yIHRoZSBwbGF5U2FtcGxlIGNhc2UsIHRoZSBpZGVhIGlzIHRoYXQgdGhlIGh5cHMgZG8gbm90IGFycml2ZSBiZWZvcmUgdGhlIGF1ZGlvIGlzIHBsYXllZCBiYWNrXG4gICAgaWYgKHNhbXBsaW5nUmF0ZSkge1xuICAgIFx0Y29uc29sZS5sb2coXCJzYW1wbGluZ1JhdGU6IFwiICsgIHNhbXBsaW5nUmF0ZSArIFwiIHRpbWVvdXQ6IFwiICsgKGNodW5rU2l6ZSoxMDAwKS8oc2FtcGxpbmdSYXRlKjIpKVxuICAgIFx0c2V0VGltZW91dChmdW5jdGlvbigpIHsgZmlsZUJsb2NrKG9mZnNldCwgY2h1bmtTaXplLCBmaWxlLCByZWFkQ2h1bmspOyB9LCAoY2h1bmtTaXplKjEwMDApLyhzYW1wbGluZ1JhdGUqMikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaWxlQmxvY2sob2Zmc2V0LCBjaHVua1NpemUsIGZpbGUsIHJlYWRDaHVuayk7XG4gICAgfVxuICB9XG4gIGZpbGVCbG9jayhvZmZzZXQsIGNodW5rU2l6ZSwgZmlsZSwgcmVhZENodW5rKTtcbn1cblxuZXhwb3J0cy5jcmVhdGVUb2tlbkdlbmVyYXRvciA9IGZ1bmN0aW9uKCkge1xuICAvLyBNYWtlIGNhbGwgdG8gQVBJIHRvIHRyeSBhbmQgZ2V0IHRva2VuXG4gIHZhciBoYXNCZWVuUnVuVGltZXMgPSAwO1xuICByZXR1cm4ge1xuICAgIGdldFRva2VuOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICsraGFzQmVlblJ1blRpbWVzO1xuICAgIGlmIChoYXNCZWVuUnVuVGltZXMgPiA1KSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdDYW5ub3QgcmVhY2ggc2VydmVyJyk7XG4gICAgICBjYWxsYmFjayhudWxsLCBlcnIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdXJsID0gJy90b2tlbic7XG4gICAgdmFyIHRva2VuUmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHRva2VuUmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgdG9rZW5SZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgdmFyIHRva2VuID0gdG9rZW5SZXF1ZXN0LnJlc3BvbnNlVGV4dDtcbiAgICAgIGNhbGxiYWNrKHRva2VuKTtcbiAgICB9O1xuICAgIHRva2VuUmVxdWVzdC5zZW5kKCk7XG4gICAgfSxcbiAgICBnZXRDb3VudDogZnVuY3Rpb24oKSB7IHJldHVybiBoYXNCZWVuUnVuVGltZXM7IH1cbiAgfVxufTtcblxuZXhwb3J0cy5nZXRUb2tlbiA9IChmdW5jdGlvbigpIHtcbiAgLy8gTWFrZSBjYWxsIHRvIEFQSSB0byB0cnkgYW5kIGdldCB0b2tlblxuICB2YXIgaGFzQmVlblJ1blRpbWVzID0gMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgaGFzQmVlblJ1blRpbWVzKytcbiAgICBpZiAoaGFzQmVlblJ1blRpbWVzID4gNSkge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignQ2Fubm90IHJlYWNoIHNlcnZlcicpO1xuICAgICAgY2FsbGJhY2sobnVsbCwgZXJyKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHVybCA9ICcvdG9rZW4nO1xuICAgIHZhciB0b2tlblJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB0b2tlblJlcXVlc3Qub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgIHRva2VuUmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgIHZhciB0b2tlbiA9IHRva2VuUmVxdWVzdC5yZXNwb25zZVRleHQ7XG4gICAgICBjYWxsYmFjayh0b2tlbik7XG4gICAgfTtcbiAgICB0b2tlblJlcXVlc3Quc2VuZCgpO1xuICB9XG59KSgpO1xuXG5leHBvcnRzLmluaXRQdWJTdWIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG8gICAgICAgICA9ICQoe30pO1xuICAkLnN1YnNjcmliZSAgID0gby5vbi5iaW5kKG8pO1xuICAkLnVuc3Vic2NyaWJlID0gby5vZmYuYmluZChvKTtcbiAgJC5wdWJsaXNoICAgICA9IG8udHJpZ2dlci5iaW5kKG8pO1xufSIsIlxuXG5leHBvcnRzLmluaXRBbmltYXRlUGFuZWwgPSBmdW5jdGlvbigpIHtcbiAgJCgnLnBhbmVsLWhlYWRpbmcgc3Bhbi5jbGlja2FibGUnKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpKSB7XG4gICAgICAvLyBleHBhbmQgdGhlIHBhbmVsXG4gICAgICAkKHRoaXMpLnBhcmVudHMoJy5wYW5lbCcpLmZpbmQoJy5wYW5lbC1ib2R5Jykuc2xpZGVEb3duKCk7XG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcbiAgICAgICQodGhpcykuZmluZCgnaScpLnJlbW92ZUNsYXNzKCdjYXJldC1kb3duJykuYWRkQ2xhc3MoJ2NhcmV0LXVwJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gY29sbGFwc2UgdGhlIHBhbmVsXG4gICAgICAkKHRoaXMpLnBhcmVudHMoJy5wYW5lbCcpLmZpbmQoJy5wYW5lbC1ib2R5Jykuc2xpZGVVcCgpO1xuICAgICAgJCh0aGlzKS5hZGRDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XG4gICAgICAkKHRoaXMpLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnY2FyZXQtdXAnKS5hZGRDbGFzcygnY2FyZXQtZG93bicpO1xuICAgIH1cbiAgfSk7XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIHNjcm9sbGVkID0gZmFsc2UsXG4gICAgdGV4dFNjcm9sbGVkID0gZmFsc2U7XG5cbnZhciBzaG93VGltZXN0YW1wID0gZnVuY3Rpb24odGltZXN0YW1wcywgY29uZmlkZW5jZXMpIHtcbiAgdmFyIHdvcmQgPSB0aW1lc3RhbXBzWzBdLFxuICAgICAgdDAgPSB0aW1lc3RhbXBzWzFdLFxuICAgICAgdDEgPSB0aW1lc3RhbXBzWzJdO1xuICB2YXIgdGltZWxlbmd0aCA9IHQxIC0gdDA7XG4gIC8vIFNob3cgY29uZmlkZW5jZSBpZiBkZWZpbmVkLCBlbHNlICduL2EnXG4gIHZhciBkaXNwbGF5Q29uZmlkZW5jZSA9IGNvbmZpZGVuY2VzID8gY29uZmlkZW5jZXNbMV0udG9TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMykgOiAnbi9hJztcbiAgJCgnI21ldGFkYXRhVGFibGUgPiB0Ym9keTpsYXN0LWNoaWxkJykuYXBwZW5kKFxuICAgICAgJzx0cj4nXG4gICAgICArICc8dGQ+JyArIHdvcmQgKyAnPC90ZD4nXG4gICAgICArICc8dGQ+JyArIHQwICsgJzwvdGQ+J1xuICAgICAgKyAnPHRkPicgKyB0MSArICc8L3RkPidcbiAgICAgICsgJzx0ZD4nICsgZGlzcGxheUNvbmZpZGVuY2UgKyAnPC90ZD4nXG4gICAgICArICc8L3RyPidcbiAgICAgICk7XG59XG5cblxudmFyIHNob3dNZXRhRGF0YSA9IGZ1bmN0aW9uKGFsdGVybmF0aXZlKSB7XG4gIHZhciBjb25maWRlbmNlTmVzdGVkQXJyYXkgPSBhbHRlcm5hdGl2ZS53b3JkX2NvbmZpZGVuY2U7O1xuICB2YXIgdGltZXN0YW1wTmVzdGVkQXJyYXkgPSBhbHRlcm5hdGl2ZS50aW1lc3RhbXBzO1xuICBpZiAoY29uZmlkZW5jZU5lc3RlZEFycmF5ICYmIGNvbmZpZGVuY2VOZXN0ZWRBcnJheS5sZW5ndGggPiAwKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWRlbmNlTmVzdGVkQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB0aW1lc3RhbXBzID0gdGltZXN0YW1wTmVzdGVkQXJyYXlbaV07XG4gICAgICB2YXIgY29uZmlkZW5jZXMgPSBjb25maWRlbmNlTmVzdGVkQXJyYXlbaV07XG4gICAgICBzaG93VGltZXN0YW1wKHRpbWVzdGFtcHMsIGNvbmZpZGVuY2VzKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9IGVsc2Uge1xuICAgIGlmICh0aW1lc3RhbXBOZXN0ZWRBcnJheSAmJiB0aW1lc3RhbXBOZXN0ZWRBcnJheS5sZW5ndGggPiAwKSB7XG4gICAgICB0aW1lc3RhbXBOZXN0ZWRBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICAgICAgICBzaG93VGltZXN0YW1wKHRpbWVzdGFtcCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxudmFyIEFsdGVybmF0aXZlcyA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHN0cmluZ09uZSA9ICcnLFxuICAgIHN0cmluZ1R3byA9ICcnLFxuICAgIHN0cmluZ1RocmVlID0gJyc7XG5cbiAgdGhpcy5jbGVhclN0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHN0cmluZ09uZSA9ICcnO1xuICAgIHN0cmluZ1R3byA9ICcnO1xuICAgIHN0cmluZ1RocmVlID0gJyc7XG4gIH07XG5cbiAgdGhpcy5zaG93QWx0ZXJuYXRpdmVzID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmVzLCBpc0ZpbmFsLCB0ZXN0aW5nKSB7XG4gICAgdmFyICRoeXBvdGhlc2VzID0gJCgnLmh5cG90aGVzZXMgb2wnKTtcbiAgICAkaHlwb3RoZXNlcy5lbXB0eSgpO1xuICAgIC8vICRoeXBvdGhlc2VzLmFwcGVuZCgkKCc8L2JyPicpKTtcbiAgICBhbHRlcm5hdGl2ZXMuZm9yRWFjaChmdW5jdGlvbihhbHRlcm5hdGl2ZSwgaWR4KSB7XG4gICAgICB2YXIgJGFsdGVybmF0aXZlO1xuICAgICAgaWYgKGFsdGVybmF0aXZlLnRyYW5zY3JpcHQpIHtcbiAgICAgICAgdmFyIHRyYW5zY3JpcHQgPSBhbHRlcm5hdGl2ZS50cmFuc2NyaXB0LnJlcGxhY2UoLyVIRVNJVEFUSU9OXFxzL2csICcnKTtcbiAgICAgICAgdHJhbnNjcmlwdCA9IHRyYW5zY3JpcHQucmVwbGFjZSgvKC4pXFwxezIsfS9nLCAnJyk7XG4gICAgICAgIHN3aXRjaCAoaWR4KSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgc3RyaW5nT25lID0gc3RyaW5nT25lICsgdHJhbnNjcmlwdDtcbiAgICAgICAgICAgICRhbHRlcm5hdGl2ZSA9ICQoJzxsaSBkYXRhLWh5cG90aGVzaXMtaW5kZXg9JyArIGlkeCArICcgPicgKyBzdHJpbmdPbmUgKyAnPC9saT4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHN0cmluZ1R3byA9IHN0cmluZ1R3byArIHRyYW5zY3JpcHQ7XG4gICAgICAgICAgICAkYWx0ZXJuYXRpdmUgPSAkKCc8bGkgZGF0YS1oeXBvdGhlc2lzLWluZGV4PScgKyBpZHggKyAnID4nICsgc3RyaW5nVHdvICsgJzwvbGk+Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBzdHJpbmdUaHJlZSA9IHN0cmluZ1RocmVlICsgdHJhbnNjcmlwdDtcbiAgICAgICAgICAgICRhbHRlcm5hdGl2ZSA9ICQoJzxsaSBkYXRhLWh5cG90aGVzaXMtaW5kZXg9JyArIGlkeCArICcgPicgKyBzdHJpbmdUaHJlZSArICc8L2xpPicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgJGh5cG90aGVzZXMuYXBwZW5kKCRhbHRlcm5hdGl2ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59XG5cbnZhciBhbHRlcm5hdGl2ZVByb3RvdHlwZSA9IG5ldyBBbHRlcm5hdGl2ZXMoKTtcblxuXG4vLyBUT0RPOiBDb252ZXJ0IHRvIGNsb3N1cmUgYXBwcm9hY2hcbi8qdmFyIHByb2Nlc3NTdHJpbmcgPSBmdW5jdGlvbihiYXNlU3RyaW5nLCBpc0ZpbmlzaGVkKSB7XG5cbiAgaWYgKGlzRmluaXNoZWQpIHtcbiAgICB2YXIgZm9ybWF0dGVkU3RyaW5nID0gYmFzZVN0cmluZy5zbGljZSgwLCAtMSk7XG4gICAgZm9ybWF0dGVkU3RyaW5nID0gZm9ybWF0dGVkU3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZm9ybWF0dGVkU3RyaW5nLnN1YnN0cmluZygxKTtcbiAgICBmb3JtYXR0ZWRTdHJpbmcgPSBmb3JtYXR0ZWRTdHJpbmcudHJpbSgpICsgJy4gJztcbiAgICAkKCcjcmVzdWx0c1RleHQnKS52YWwoZm9ybWF0dGVkU3RyaW5nKTtcbiAgICByZXR1cm4gZm9ybWF0dGVkU3RyaW5nO1xuICB9IGVsc2Uge1xuICAgICQoJyNyZXN1bHRzVGV4dCcpLnZhbChiYXNlU3RyaW5nKTtcbiAgICByZXR1cm4gYmFzZVN0cmluZztcbiAgfVxufSovXG5cbmV4cG9ydHMuc2hvd0pTT04gPSBmdW5jdGlvbihtc2csIGJhc2VKU09OKSB7XG4gIFxuICAgdmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeShtc2csIG51bGwsIDIpO1xuICAgIGJhc2VKU09OICs9IGpzb247XG4gICAgYmFzZUpTT04gKz0gJ1xcbic7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG4gIGlmICgkKCcubmF2LXRhYnMgLmFjdGl2ZScpLnRleHQoKSA9PSBcIkpTT05cIikge1xuICAgICAgJCgnI3Jlc3VsdHNKU09OJykuYXBwZW5kKGJhc2VKU09OKTtcbiAgICAgIGJhc2VKU09OID0gXCJcIjtcbiAgICAgIGNvbnNvbGUubG9nKFwidXBkYXRpbmcganNvblwiKTtcbiAgfVxuICBcbiAgcmV0dXJuIGJhc2VKU09OO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUZXh0U2Nyb2xsKCl7XG4gIGlmKCFzY3JvbGxlZCl7XG4gICAgdmFyIGVsZW1lbnQgPSAkKCcjcmVzdWx0c1RleHQnKS5nZXQoMCk7XG4gICAgZWxlbWVudC5zY3JvbGxUb3AgPSBlbGVtZW50LnNjcm9sbEhlaWdodDtcbiAgfVxufVxuXG52YXIgaW5pdFRleHRTY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgJCgnI3Jlc3VsdHNUZXh0Jykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uKCl7XG4gICAgICB0ZXh0U2Nyb2xsZWQgPSB0cnVlO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU2Nyb2xsKCl7XG4gIGlmKCFzY3JvbGxlZCl7XG4gICAgdmFyIGVsZW1lbnQgPSAkKCcudGFibGUtc2Nyb2xsJykuZ2V0KDApO1xuICAgIGVsZW1lbnQuc2Nyb2xsVG9wID0gZWxlbWVudC5zY3JvbGxIZWlnaHQ7XG4gIH1cbn1cblxudmFyIGluaXRTY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgJCgnLnRhYmxlLXNjcm9sbCcpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbigpe1xuICAgICAgc2Nyb2xsZWQ9dHJ1ZTtcbiAgfSk7XG59XG5cbmV4cG9ydHMuaW5pdERpc3BsYXlNZXRhZGF0YSA9IGZ1bmN0aW9uKCkge1xuICBpbml0U2Nyb2xsKCk7XG4gIGluaXRUZXh0U2Nyb2xsKCk7XG59O1xuXG5cbmV4cG9ydHMuc2hvd1Jlc3VsdCA9IGZ1bmN0aW9uKG1zZywgYmFzZVN0cmluZywgbW9kZWwsIGNhbGxiYWNrKSB7XG5cbiAgdmFyIGlkeCA9ICttc2cucmVzdWx0X2luZGV4O1xuXG4gIGlmIChtc2cucmVzdWx0cyAmJiBtc2cucmVzdWx0cy5sZW5ndGggPiAwKSB7XG5cbiAgICB2YXIgYWx0ZXJuYXRpdmVzID0gbXNnLnJlc3VsdHNbMF0uYWx0ZXJuYXRpdmVzO1xuICAgIHZhciB0ZXh0ID0gbXNnLnJlc3VsdHNbMF0uYWx0ZXJuYXRpdmVzWzBdLnRyYW5zY3JpcHQgfHwgJyc7XG4gICAgXG4gICAgLy8gYXBwbHkgbWFwcGluZ3MgdG8gYmVhdXRpZnlcbiAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8lSEVTSVRBVElPTlxccy9nLCAnJyk7XG4gICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKC4pXFwxezIsfS9nLCAnJyk7XG4gICAgaWYgKG1zZy5yZXN1bHRzWzBdLmZpbmFsKVxuICAgICAgIGNvbnNvbGUubG9nKFwiLT4gXCIgKyB0ZXh0ICsgXCJcXG5cIik7XG4gICAgdGV4dCA9IHRleHQucmVwbGFjZSgvRF9bXlxcc10rL2csJycpO1xuICAgIFxuICAgIC8vIGlmIGFsbCB3b3JkcyBhcmUgbWFwcGVkIHRvIG5vdGhpbmcgdGhlbiB0aGVyZSBpcyBub3RoaW5nIGVsc2UgdG8gZG9cbiAgICBpZiAoKHRleHQubGVuZ3RoID09IDApIHx8ICgvXlxccyskLy50ZXN0KHRleHQpKSkge1xuICAgIFx0IHJldHVybiBiYXNlU3RyaW5nO1xuICAgIH0gICAgXHQgIFxuICAgIFxuICAgIC8vIGNhcGl0YWxpemUgZmlyc3Qgd29yZFxuICAgIC8vIGlmIGZpbmFsIHJlc3VsdHMsIGFwcGVuZCBhIG5ldyBwYXJhZ3JhcGhcbiAgICBpZiAobXNnLnJlc3VsdHMgJiYgbXNnLnJlc3VsdHNbMF0gJiYgbXNnLnJlc3VsdHNbMF0uZmluYWwpIHtcbiAgICAgICB0ZXh0ID0gdGV4dC5zbGljZSgwLCAtMSk7XG4gICAgICAgdGV4dCA9IHRleHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0ZXh0LnN1YnN0cmluZygxKTtcbiAgICAgICBpZiAoKG1vZGVsLnN1YnN0cmluZygwLDUpID09IFwiamEtSlBcIikgfHwgKG1vZGVsLnN1YnN0cmluZygwLDUpID09IFwiemgtQ05cIikpIHsgICAgICAgIFxuICAgICAgICAgIHRleHQgPSB0ZXh0LnRyaW0oKSArICfjgIInO1xuICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyAvZywnJyk7ICAgICAgLy8gcmVtb3ZlIHdoaXRlc3BhY2VzIFxuICAgICAgIH0gZWxzZSB7ICBcbiAgICAgICAgICB0ZXh0ID0gdGV4dC50cmltKCkgKyAnLiAnO1xuICAgICAgIH0gICAgICAgXG4gICAgICAgYmFzZVN0cmluZyArPSB0ZXh0O1xuICAgICAgICQoJyNyZXN1bHRzVGV4dCcpLnZhbChiYXNlU3RyaW5nKTtcbiAgICAgICBzaG93TWV0YURhdGEoYWx0ZXJuYXRpdmVzWzBdKTtcbiAgICAgICAvLyBPbmx5IHNob3cgYWx0ZXJuYXRpdmVzIGlmIHdlJ3JlIGZpbmFsXG4gICAgICAgYWx0ZXJuYXRpdmVQcm90b3R5cGUuc2hvd0FsdGVybmF0aXZlcyhhbHRlcm5hdGl2ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgaWYgKChtb2RlbC5zdWJzdHJpbmcoMCw1KSA9PSBcImphLUpQXCIpIHx8IChtb2RlbC5zdWJzdHJpbmcoMCw1KSA9PSBcInpoLUNOXCIpKSB7ICAgICAgICBcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8gL2csJycpOyAgICAgIC8vIHJlbW92ZSB3aGl0ZXNwYWNlcyAgICAgXHQgICAgICAgICBcbiAgICAgICB9IGVsc2Uge1xuICAgICAgICBcdCB0ZXh0ID0gdGV4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRleHQuc3Vic3RyaW5nKDEpO1xuICAgICAgIH1cbiAgICBcdCAkKCcjcmVzdWx0c1RleHQnKS52YWwoYmFzZVN0cmluZyArIHRleHQpOyAgICBcdCBcbiAgICB9XG4gIH1cblxuICB1cGRhdGVTY3JvbGwoKTtcbiAgdXBkYXRlVGV4dFNjcm9sbCgpO1xuICByZXR1cm4gYmFzZVN0cmluZztcbn07XG5cbiQuc3Vic2NyaWJlKCdjbGVhcnNjcmVlbicsIGZ1bmN0aW9uKCkge1xuICB2YXIgJGh5cG90aGVzZXMgPSAkKCcuaHlwb3RoZXNlcyB1bCcpO1xuICBzY3JvbGxlZCA9IGZhbHNlO1xuICAkaHlwb3RoZXNlcy5lbXB0eSgpO1xuICBhbHRlcm5hdGl2ZVByb3RvdHlwZS5jbGVhclN0cmluZygpO1xufSk7XG5cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFuZGxlU2VsZWN0ZWRGaWxlID0gcmVxdWlyZSgnLi9maWxldXBsb2FkJykuaGFuZGxlU2VsZWN0ZWRGaWxlO1xuXG5leHBvcnRzLmluaXREcmFnRHJvcCA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gIHZhciBkcmFnQW5kRHJvcFRhcmdldCA9ICQoZG9jdW1lbnQpO1xuXG4gIGRyYWdBbmREcm9wVGFyZ2V0Lm9uKCdkcmFnZW50ZXInLCBmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9KTtcblxuICBkcmFnQW5kRHJvcFRhcmdldC5vbignZHJhZ292ZXInLCBmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9KTtcblxuICBkcmFnQW5kRHJvcFRhcmdldC5vbignZHJvcCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgY29uc29sZS5sb2coJ0ZpbGUgZHJvcHBlZCcpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgZXZ0ID0gZS5vcmlnaW5hbEV2ZW50O1xuICAgIC8vIEhhbmRsZSBkcmFnZ2VkIGZpbGUgZXZlbnRcbiAgICBoYW5kbGVGaWxlVXBsb2FkRXZlbnQoZXZ0KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlRmlsZVVwbG9hZEV2ZW50KGV2dCkge1xuICAgIC8vIEluaXQgZmlsZSB1cGxvYWQgd2l0aCBkZWZhdWx0IG1vZGVsXG4gICAgdmFyIGZpbGUgPSBldnQuZGF0YVRyYW5zZmVyLmZpbGVzWzBdO1xuICAgIGhhbmRsZVNlbGVjdGVkRmlsZShjdHgudG9rZW4sIGZpbGUpO1xuICB9XG5cbn1cbiIsIlxuXG5cbmV4cG9ydHMuZmxhc2hTVkcgPSBmdW5jdGlvbihlbCkge1xuICBlbC5jc3MoeyBmaWxsOiAnI0E1MzcyNScgfSk7XG4gIGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgZWwuYW5pbWF0ZSh7IGZpbGw6ICcjQTUzNzI1JyB9LFxuICAgICAgICAxMDAwLCAnbGluZWFyJylcbiAgICAgIC5hbmltYXRlKHsgZmlsbDogJ3doaXRlJyB9LFxuICAgICAgICAgIDEwMDAsICdsaW5lYXInKTtcbiAgfVxuICAvLyByZXR1cm4gdGltZXJcbiAgdmFyIHRpbWVyID0gc2V0VGltZW91dChsb29wLCAyMDAwKTtcbiAgcmV0dXJuIHRpbWVyO1xufTtcblxuZXhwb3J0cy5zdG9wRmxhc2hTVkcgPSBmdW5jdGlvbih0aW1lcikge1xuICBlbC5jc3MoeyBmaWxsOiAnd2hpdGUnIH0gKTtcbiAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG59XG5cbmV4cG9ydHMudG9nZ2xlSW1hZ2UgPSBmdW5jdGlvbihlbCwgbmFtZSkge1xuICBpZihlbC5hdHRyKCdzcmMnKSA9PT0gJ2ltYWdlcy8nICsgbmFtZSArICcuc3ZnJykge1xuICAgIGVsLmF0dHIoXCJzcmNcIiwgJ2ltYWdlcy9zdG9wLXJlZC5zdmcnKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5hdHRyKCdzcmMnLCAnaW1hZ2VzL3N0b3Auc3ZnJyk7XG4gIH1cbn1cblxudmFyIHJlc3RvcmVJbWFnZSA9IGV4cG9ydHMucmVzdG9yZUltYWdlID0gZnVuY3Rpb24oZWwsIG5hbWUpIHtcbiAgZWwuYXR0cignc3JjJywgJ2ltYWdlcy8nICsgbmFtZSArICcuc3ZnJyk7XG59XG5cbmV4cG9ydHMuc3RvcFRvZ2dsZUltYWdlID0gZnVuY3Rpb24odGltZXIsIGVsLCBuYW1lKSB7XG4gIGNsZWFySW50ZXJ2YWwodGltZXIpO1xuICByZXN0b3JlSW1hZ2UoZWwsIG5hbWUpO1xufVxuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzaG93RXJyb3IgPSByZXF1aXJlKCcuL3Nob3dlcnJvcicpLnNob3dFcnJvcjtcbnZhciBzaG93Tm90aWNlID0gcmVxdWlyZSgnLi9zaG93ZXJyb3InKS5zaG93Tm90aWNlO1xudmFyIGhhbmRsZUZpbGVVcGxvYWQgPSByZXF1aXJlKCcuLi9oYW5kbGVmaWxldXBsb2FkJykuaGFuZGxlRmlsZVVwbG9hZDtcbnZhciBlZmZlY3RzID0gcmVxdWlyZSgnLi9lZmZlY3RzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vLyBOZWVkIHRvIHJlbW92ZSB0aGUgdmlldyBsb2dpYyBoZXJlIGFuZCBtb3ZlIHRoaXMgb3V0IHRvIHRoZSBoYW5kbGVmaWxldXBsb2FkIGNvbnRyb2xsZXJcbnZhciBoYW5kbGVTZWxlY3RlZEZpbGUgPSBleHBvcnRzLmhhbmRsZVNlbGVjdGVkRmlsZSA9IChmdW5jdGlvbigpIHtcblxuICAgIHZhciBydW5uaW5nID0gZmFsc2U7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCBmYWxzZSk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24odG9rZW4sIGZpbGUpIHtcblxuICAgIHZhciBjdXJyZW50bHlEaXNwbGF5aW5nID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycpKTtcblxuICAgIC8vIGlmIChjdXJyZW50bHlEaXNwbGF5aW5nKSB7XG4gICAgLy8gICBzaG93RXJyb3IoJ0N1cnJlbnRseSBhbm90aGVyIGZpbGUgaXMgcGxheWluZywgcGxlYXNlIHN0b3AgdGhlIGZpbGUgb3Igd2FpdCB1bnRpbCBpdCBmaW5pc2hlcycpO1xuICAgIC8vICAgcmV0dXJuO1xuICAgIC8vIH1cblxuICAgICQucHVibGlzaCgnY2xlYXJzY3JlZW4nKTtcblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgdHJ1ZSk7XG4gICAgcnVubmluZyA9IHRydWU7XG5cbiAgICAvLyBWaXN1YWwgZWZmZWN0c1xuICAgIHZhciB1cGxvYWRJbWFnZVRhZyA9ICQoJyNmaWxlVXBsb2FkVGFyZ2V0ID4gaW1nJyk7XG4gICAgdmFyIHRpbWVyID0gc2V0SW50ZXJ2YWwoZWZmZWN0cy50b2dnbGVJbWFnZSwgNzUwLCB1cGxvYWRJbWFnZVRhZywgJ3N0b3AnKTtcbiAgICB2YXIgdXBsb2FkVGV4dCA9ICQoJyNmaWxlVXBsb2FkVGFyZ2V0ID4gc3BhbicpO1xuICAgIHVwbG9hZFRleHQudGV4dCgnU3RvcCBUcmFuc2NyaWJpbmcnKTtcblxuICAgIGZ1bmN0aW9uIHJlc3RvcmVVcGxvYWRUYWIoKSB7XG4gICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICAgIGVmZmVjdHMucmVzdG9yZUltYWdlKHVwbG9hZEltYWdlVGFnLCAndXBsb2FkJyk7XG4gICAgICB1cGxvYWRUZXh0LnRleHQoJ1NlbGVjdCBGaWxlJyk7XG4gICAgfVxuXG4gICAgLy8gQ2xlYXIgZmxhc2hpbmcgaWYgc29ja2V0IHVwbG9hZCBpcyBzdG9wcGVkXG4gICAgJC5zdWJzY3JpYmUoJ2hhcmRzb2NrZXRzdG9wJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmVzdG9yZVVwbG9hZFRhYigpO1xuICAgIH0pO1xuXG4gICAgLy8gR2V0IGN1cnJlbnQgbW9kZWxcbiAgICB2YXIgY3VycmVudE1vZGVsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRNb2RlbCcpO1xuICAgIGNvbnNvbGUubG9nKCdjdXJyZW50TW9kZWwnLCBjdXJyZW50TW9kZWwpO1xuXG4gICAgLy8gUmVhZCBmaXJzdCA0IGJ5dGVzIHRvIGRldGVybWluZSBoZWFkZXJcbiAgICB2YXIgYmxvYlRvVGV4dCA9IG5ldyBCbG9iKFtmaWxlXSkuc2xpY2UoMCwgNCk7XG4gICAgdmFyIHIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIHIucmVhZEFzVGV4dChibG9iVG9UZXh0KTtcbiAgICByLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbnRlbnRUeXBlO1xuICAgICAgaWYgKHIucmVzdWx0ID09PSAnZkxhQycpIHtcbiAgICAgICAgY29udGVudFR5cGUgPSAnYXVkaW8vZmxhYyc7XG4gICAgICAgIHNob3dOb3RpY2UoJ05vdGljZTogYnJvd3NlcnMgZG8gbm90IHN1cHBvcnQgcGxheWluZyBGTEFDIGF1ZGlvLCBzbyBubyBhdWRpbyB3aWxsIGFjY29tcGFueSB0aGUgdHJhbnNjcmlwdGlvbicpO1xuICAgICAgfSBlbHNlIGlmIChyLnJlc3VsdCA9PT0gJ1JJRkYnKSB7XG4gICAgICAgIGNvbnRlbnRUeXBlID0gJ2F1ZGlvL3dhdic7XG4gICAgICAgIHZhciBhdWRpbyA9IG5ldyBBdWRpbygpO1xuICAgICAgICB2YXIgd2F2QmxvYiA9IG5ldyBCbG9iKFtmaWxlXSwge3R5cGU6ICdhdWRpby93YXYnfSk7XG4gICAgICAgIHZhciB3YXZVUkwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHdhdkJsb2IpO1xuICAgICAgICBhdWRpby5zcmMgPSB3YXZVUkw7XG4gICAgICAgIGF1ZGlvLnBsYXkoKTtcbiAgICAgICAgJC5zdWJzY3JpYmUoJ2hhcmRzb2NrZXRzdG9wJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgYXVkaW8ucGF1c2UoKTtcbiAgICAgICAgICBhdWRpby5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdG9yZVVwbG9hZFRhYigpO1xuICAgICAgICBzaG93RXJyb3IoJ09ubHkgV0FWIG9yIEZMQUMgZmlsZXMgY2FuIGJlIHRyYW5zY3JpYmVkLCBwbGVhc2UgdHJ5IGFub3RoZXIgZmlsZSBmb3JtYXQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaGFuZGxlRmlsZVVwbG9hZCh0b2tlbiwgY3VycmVudE1vZGVsLCBmaWxlLCBjb250ZW50VHlwZSwgZnVuY3Rpb24oc29ja2V0KSB7XG4gICAgICAgIHZhciBibG9iID0gbmV3IEJsb2IoW2ZpbGVdKTtcbiAgICAgICAgdmFyIHBhcnNlT3B0aW9ucyA9IHtcbiAgICAgICAgICBmaWxlOiBibG9iXG4gICAgICAgIH07XG4gICAgICAgIHV0aWxzLm9uRmlsZVByb2dyZXNzKHBhcnNlT3B0aW9ucyxcbiAgICAgICAgICAvLyBPbiBkYXRhIGNodW5rXG4gICAgICAgICAgZnVuY3Rpb24oY2h1bmspIHtcbiAgICAgICAgICAgIHNvY2tldC5zZW5kKGNodW5rKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIC8vIE9uIGZpbGUgcmVhZCBlcnJvclxuICAgICAgICAgIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHJlYWRpbmcgZmlsZTogJywgZXZ0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgc2hvd0Vycm9yKCdFcnJvcjogJyArIGV2dC5tZXNzYWdlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIC8vIE9uIGxvYWQgZW5kXG4gICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeSh7J2FjdGlvbic6ICdzdG9wJ30pKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0sIFxuICAgICAgICBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICBlZmZlY3RzLnN0b3BUb2dnbGVJbWFnZSh0aW1lciwgdXBsb2FkSW1hZ2VUYWcsICd1cGxvYWQnKTtcbiAgICAgICAgICB1cGxvYWRUZXh0LnRleHQoJ1NlbGVjdCBGaWxlJyk7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfTtcbiAgfVxufSkoKTtcblxuXG5leHBvcnRzLmluaXRGaWxlVXBsb2FkID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgdmFyIGZpbGVVcGxvYWREaWFsb2cgPSAkKFwiI2ZpbGVVcGxvYWREaWFsb2dcIik7XG5cbiAgZmlsZVVwbG9hZERpYWxvZy5jaGFuZ2UoZnVuY3Rpb24oZXZ0KSB7XG4gICAgdmFyIGZpbGUgPSBmaWxlVXBsb2FkRGlhbG9nLmdldCgwKS5maWxlc1swXTtcbiAgICBoYW5kbGVTZWxlY3RlZEZpbGUoY3R4LnRva2VuLCBmaWxlKTtcbiAgfSk7XG5cbiAgJChcIiNmaWxlVXBsb2FkVGFyZ2V0XCIpLmNsaWNrKGZ1bmN0aW9uKGV2dCkge1xuXG4gICAgdmFyIGN1cnJlbnRseURpc3BsYXlpbmcgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJykpO1xuXG4gICAgaWYgKGN1cnJlbnRseURpc3BsYXlpbmcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdIQVJEIFNPQ0tFVCBTVE9QJyk7XG4gICAgICAkLnB1Ymxpc2goJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmaWxlVXBsb2FkRGlhbG9nLnZhbChudWxsKTtcblxuICAgIGZpbGVVcGxvYWREaWFsb2dcbiAgICAudHJpZ2dlcignY2xpY2snKTtcblxuICB9KTtcblxufSIsIlxudmFyIGluaXRTZXNzaW9uUGVybWlzc2lvbnMgPSByZXF1aXJlKCcuL3Nlc3Npb25wZXJtaXNzaW9ucycpLmluaXRTZXNzaW9uUGVybWlzc2lvbnM7XG52YXIgaW5pdFNlbGVjdE1vZGVsID0gcmVxdWlyZSgnLi9zZWxlY3Rtb2RlbCcpLmluaXRTZWxlY3RNb2RlbDtcbnZhciBpbml0QW5pbWF0ZVBhbmVsID0gcmVxdWlyZSgnLi9hbmltYXRlcGFuZWwnKS5pbml0QW5pbWF0ZVBhbmVsO1xudmFyIGluaXRTaG93VGFiID0gcmVxdWlyZSgnLi9zaG93dGFiJykuaW5pdFNob3dUYWI7XG52YXIgaW5pdERyYWdEcm9wID0gcmVxdWlyZSgnLi9kcmFnZHJvcCcpLmluaXREcmFnRHJvcDtcbnZhciBpbml0UGxheVNhbXBsZSA9IHJlcXVpcmUoJy4vcGxheXNhbXBsZScpLmluaXRQbGF5U2FtcGxlO1xudmFyIGluaXRSZWNvcmRCdXR0b24gPSByZXF1aXJlKCcuL3JlY29yZGJ1dHRvbicpLmluaXRSZWNvcmRCdXR0b247XG52YXIgaW5pdEZpbGVVcGxvYWQgPSByZXF1aXJlKCcuL2ZpbGV1cGxvYWQnKS5pbml0RmlsZVVwbG9hZDtcbnZhciBpbml0RGlzcGxheU1ldGFkYXRhID0gcmVxdWlyZSgnLi9kaXNwbGF5bWV0YWRhdGEnKS5pbml0RGlzcGxheU1ldGFkYXRhO1xuXG5cbmV4cG9ydHMuaW5pdFZpZXdzID0gZnVuY3Rpb24oY3R4KSB7XG4gIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgdmlld3MuLi4nKTtcbiAgaW5pdFNlbGVjdE1vZGVsKGN0eCk7XG4gIGluaXRQbGF5U2FtcGxlKGN0eCk7XG4gIGluaXREcmFnRHJvcChjdHgpO1xuICBpbml0UmVjb3JkQnV0dG9uKGN0eCk7XG4gIGluaXRGaWxlVXBsb2FkKGN0eCk7XG4gIGluaXRTZXNzaW9uUGVybWlzc2lvbnMoKTtcbiAgaW5pdFNob3dUYWIoKTtcbiAgaW5pdEFuaW1hdGVQYW5lbCgpO1xuICBpbml0U2hvd1RhYigpO1xuICBpbml0RGlzcGxheU1ldGFkYXRhKCk7XG59XG4iLCJcbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBvbkZpbGVQcm9ncmVzcyA9IHV0aWxzLm9uRmlsZVByb2dyZXNzO1xudmFyIGhhbmRsZUZpbGVVcGxvYWQgPSByZXF1aXJlKCcuLi9oYW5kbGVmaWxldXBsb2FkJykuaGFuZGxlRmlsZVVwbG9hZDtcbnZhciBpbml0U29ja2V0ID0gcmVxdWlyZSgnLi4vc29ja2V0JykuaW5pdFNvY2tldDtcbnZhciBzaG93RXJyb3IgPSByZXF1aXJlKCcuL3Nob3dlcnJvcicpLnNob3dFcnJvcjtcbnZhciBlZmZlY3RzID0gcmVxdWlyZSgnLi9lZmZlY3RzJyk7XG5cblxudmFyIExPT0tVUF9UQUJMRSA9IHtcbiAgJ2VuLVVTX0Jyb2FkYmFuZE1vZGVsJzogWydVc19FbmdsaXNoX0Jyb2FkYmFuZF9TYW1wbGVfMS53YXYnLCAnVXNfRW5nbGlzaF9Ccm9hZGJhbmRfU2FtcGxlXzIud2F2J10sXG4gICdlbi1VU19OYXJyb3diYW5kTW9kZWwnOiBbJ1VzX0VuZ2xpc2hfTmFycm93YmFuZF9TYW1wbGVfMS53YXYnLCAnVXNfRW5nbGlzaF9OYXJyb3diYW5kX1NhbXBsZV8yLndhdiddLFxuICAnZXMtRVNfQnJvYWRiYW5kTW9kZWwnOiBbJ0VzX0VTX3NwazI0XzE2a2h6LndhdicsICdFc19FU19zcGsxOV8xNmtoei53YXYnXSxcbiAgJ2VzLUVTX05hcnJvd2JhbmRNb2RlbCc6IFsnRXNfRVNfc3BrMjRfOGtoei53YXYnLCAnRXNfRVNfc3BrMTlfOGtoei53YXYnXSxcbiAgJ2phLUpQX0Jyb2FkYmFuZE1vZGVsJzogWydzYW1wbGUtSmFfSlAtd2lkZTEud2F2JywgJ3NhbXBsZS1KYV9KUC13aWRlMi53YXYnXSxcbiAgJ2phLUpQX05hcnJvd2JhbmRNb2RlbCc6IFsnc2FtcGxlLUphX0pQLW5hcnJvdzMud2F2JywgJ3NhbXBsZS1KYV9KUC1uYXJyb3c0LndhdiddLFxuICAncHQtQlJfQnJvYWRiYW5kTW9kZWwnOiBbJ3B0LUJSX1NhbXBsZTEtMTZLSHoud2F2JywgJ3B0LUJSX1NhbXBsZTItMTZLSHoud2F2J10sXG4gICdwdC1CUl9OYXJyb3diYW5kTW9kZWwnOiBbJ3B0LUJSX1NhbXBsZTEtOEtIei53YXYnLCAncHQtQlJfU2FtcGxlMi04S0h6LndhdiddLFxuICAnemgtQ05fQnJvYWRiYW5kTW9kZWwnOiBbJ3poLUNOX3NhbXBsZTFfZm9yXzE2ay53YXYnLCAnemgtQ05fc2FtcGxlMl9mb3JfMTZrLndhdiddLFxuICAnemgtQ05fTmFycm93YmFuZE1vZGVsJzogWyd6aC1DTl9zYW1wbGUxX2Zvcl84ay53YXYnLCAnemgtQ05fc2FtcGxlMl9mb3JfOGsud2F2J10gIFxufTtcblxudmFyIHBsYXlTYW1wbGUgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCBmYWxzZSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHRva2VuLCBpbWFnZVRhZywgaWNvbk5hbWUsIHVybCwgY2FsbGJhY2spIHtcblxuICAgICQucHVibGlzaCgnY2xlYXJzY3JlZW4nKTtcblxuICAgIHZhciBjdXJyZW50bHlEaXNwbGF5aW5nID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycpKTtcblxuICAgIGNvbnNvbGUubG9nKCdDVVJSRU5UTFkgRElTUExBWUlORycsIGN1cnJlbnRseURpc3BsYXlpbmcpO1xuXG4gICAgLy8gVGhpcyBlcnJvciBoYW5kbGluZyBuZWVkcyB0byBiZSBleHBhbmRlZCB0byBhY2NvbW9kYXRlXG4gICAgLy8gdGhlIHR3byBkaWZmZXJlbnQgcGxheSBzYW1wbGVzIGZpbGVzXG4gICAgaWYgKGN1cnJlbnRseURpc3BsYXlpbmcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdIQVJEIFNPQ0tFVCBTVE9QJyk7XG4gICAgICAkLnB1Ymxpc2goJ3NvY2tldHN0b3AnKTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgZmFsc2UpO1xuICAgICAgZWZmZWN0cy5zdG9wVG9nZ2xlSW1hZ2UodGltZXIsIGltYWdlVGFnLCBpY29uTmFtZSk7XG4gICAgICBlZmZlY3RzLnJlc3RvcmVJbWFnZShpbWFnZVRhZywgaWNvbk5hbWUpO1xuICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50bHlEaXNwbGF5aW5nICYmIHJ1bm5pbmcpIHtcbiAgICAgIHNob3dFcnJvcignQ3VycmVudGx5IGFub3RoZXIgZmlsZSBpcyBwbGF5aW5nLCBwbGVhc2Ugc3RvcCB0aGUgZmlsZSBvciB3YWl0IHVudGlsIGl0IGZpbmlzaGVzJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCB0cnVlKTtcbiAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICBcbiAgICAkKCcjcmVzdWx0c1RleHQnKS52YWwoJycpOyAgIC8vIGNsZWFyIGh5cG90aGVzZXMgZnJvbSBwcmV2aW91cyBydW5zXG5cbiAgICB2YXIgdGltZXIgPSBzZXRJbnRlcnZhbChlZmZlY3RzLnRvZ2dsZUltYWdlLCA3NTAsIGltYWdlVGFnLCBpY29uTmFtZSk7XG5cbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJztcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGJsb2IgPSB4aHIucmVzcG9uc2U7XG4gICAgICB2YXIgY3VycmVudE1vZGVsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRNb2RlbCcpIHx8ICdlbi1VU19Ccm9hZGJhbmRNb2RlbCc7XG4gICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgIHZhciBibG9iVG9UZXh0ID0gbmV3IEJsb2IoW2Jsb2JdKS5zbGljZSgwLCA0KTtcbiAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2JUb1RleHQpO1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29udGVudFR5cGUgPSByZWFkZXIucmVzdWx0ID09PSAnZkxhQycgPyAnYXVkaW8vZmxhYycgOiAnYXVkaW8vd2F2JztcbiAgICAgICAgY29uc29sZS5sb2coJ1VwbG9hZGluZyBmaWxlJywgcmVhZGVyLnJlc3VsdCk7XG4gICAgICAgIHZhciBtZWRpYVNvdXJjZVVSTCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIHZhciBhdWRpbyA9IG5ldyBBdWRpbygpO1xuICAgICAgICBhdWRpby5zcmMgPSBtZWRpYVNvdXJjZVVSTDtcbiAgICAgICAgYXVkaW8ucGxheSgpO1xuICAgICAgICAkLnN1YnNjcmliZSgnaGFyZHNvY2tldHN0b3AnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBhdWRpby5wYXVzZSgpO1xuICAgICAgICAgIGF1ZGlvLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgfSk7XG4gICAgICAgICQuc3Vic2NyaWJlKCdzb2NrZXRzdG9wJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgYXVkaW8ucGF1c2UoKTtcbiAgICAgICAgICBhdWRpby5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgIH0pO1xuICAgICAgICBoYW5kbGVGaWxlVXBsb2FkKHRva2VuLCBjdXJyZW50TW9kZWwsIGJsb2IsIGNvbnRlbnRUeXBlLCBmdW5jdGlvbihzb2NrZXQpIHtcbiAgICAgICAgICB2YXIgcGFyc2VPcHRpb25zID0ge1xuICAgICAgICAgICAgZmlsZTogYmxvYlxuICAgICAgICAgIH07XG4gICAgICAgICAgdmFyIHNhbXBsaW5nUmF0ZSA9IChjdXJyZW50TW9kZWwuaW5kZXhPZihcIkJyb2FkYmFuZFwiKSAhPSAtMSkgPyAxNjAwMCA6IDgwMDA7XG4gICAgICAgICAgb25GaWxlUHJvZ3Jlc3MocGFyc2VPcHRpb25zLFxuICAgICAgICAgICAgLy8gT24gZGF0YSBjaHVua1xuICAgICAgICAgICAgZnVuY3Rpb24oY2h1bmspIHtcbiAgICAgICAgICAgICAgc29ja2V0LnNlbmQoY2h1bmspO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIE9uIGZpbGUgcmVhZCBlcnJvclxuICAgICAgICAgICAgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciByZWFkaW5nIGZpbGU6ICcsIGV2dC5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgLy8gc2hvd0Vycm9yKGV2dC5tZXNzYWdlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBPbiBsb2FkIGVuZFxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KHsnYWN0aW9uJzogJ3N0b3AnfSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNhbXBsaW5nUmF0ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSwgXG4gICAgICAgIC8vIE9uIGNvbm5lY3Rpb24gZW5kXG4gICAgICAgICAgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICBlZmZlY3RzLnN0b3BUb2dnbGVJbWFnZSh0aW1lciwgaW1hZ2VUYWcsIGljb25OYW1lKTtcbiAgICAgICAgICAgIGVmZmVjdHMucmVzdG9yZUltYWdlKGltYWdlVGFnLCBpY29uTmFtZSk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9O1xuICAgIH07XG4gICAgeGhyLnNlbmQoKTtcbiAgfTtcbn0pKCk7XG5cblxuZXhwb3J0cy5pbml0UGxheVNhbXBsZSA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gIChmdW5jdGlvbigpIHtcbiAgICB2YXIgZmlsZU5hbWUgPSAnYXVkaW8vJyArIExPT0tVUF9UQUJMRVtjdHguY3VycmVudE1vZGVsXVswXTtcbiAgICB2YXIgZWwgPSAkKCcucGxheS1zYW1wbGUtMScpO1xuICAgIGVsLm9mZignY2xpY2snKTtcbiAgICB2YXIgaWNvbk5hbWUgPSAncGxheSc7XG4gICAgdmFyIGltYWdlVGFnID0gZWwuZmluZCgnaW1nJyk7XG4gICAgZWwuY2xpY2soIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgcGxheVNhbXBsZShjdHgudG9rZW4sIGltYWdlVGFnLCBpY29uTmFtZSwgZmlsZU5hbWUsIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBjb25zb2xlLmxvZygnUGxheSBzYW1wbGUgcmVzdWx0JywgcmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KShjdHgsIExPT0tVUF9UQUJMRSk7XG5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIHZhciBmaWxlTmFtZSA9ICdhdWRpby8nICsgTE9PS1VQX1RBQkxFW2N0eC5jdXJyZW50TW9kZWxdWzFdO1xuICAgIHZhciBlbCA9ICQoJy5wbGF5LXNhbXBsZS0yJyk7XG4gICAgZWwub2ZmKCdjbGljaycpO1xuICAgIHZhciBpY29uTmFtZSA9ICdwbGF5JztcbiAgICB2YXIgaW1hZ2VUYWcgPSBlbC5maW5kKCdpbWcnKTtcbiAgICBlbC5jbGljayggZnVuY3Rpb24oZXZ0KSB7XG4gICAgICBwbGF5U2FtcGxlKGN0eC50b2tlbiwgaW1hZ2VUYWcsIGljb25OYW1lLCBmaWxlTmFtZSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQbGF5IHNhbXBsZSByZXN1bHQnLCByZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pKGN0eCwgTE9PS1VQX1RBQkxFKTtcblxufTtcblxuXG4iLCJcbid1c2Ugc3RyaWN0JztcblxudmFyIE1pY3JvcGhvbmUgPSByZXF1aXJlKCcuLi9NaWNyb3Bob25lJyk7XG52YXIgaGFuZGxlTWljcm9waG9uZSA9IHJlcXVpcmUoJy4uL2hhbmRsZW1pY3JvcGhvbmUnKS5oYW5kbGVNaWNyb3Bob25lO1xudmFyIHNob3dFcnJvciA9IHJlcXVpcmUoJy4vc2hvd2Vycm9yJykuc2hvd0Vycm9yO1xudmFyIHNob3dOb3RpY2UgPSByZXF1aXJlKCcuL3Nob3dlcnJvcicpLnNob3dOb3RpY2U7XG5cbmV4cG9ydHMuaW5pdFJlY29yZEJ1dHRvbiA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gIHZhciByZWNvcmRCdXR0b24gPSAkKCcjcmVjb3JkQnV0dG9uJyk7XG5cbiAgcmVjb3JkQnV0dG9uLmNsaWNrKChmdW5jdGlvbigpIHtcblxuICAgIHZhciBydW5uaW5nID0gZmFsc2U7XG4gICAgdmFyIHRva2VuID0gY3R4LnRva2VuO1xuICAgIHZhciBtaWNPcHRpb25zID0ge1xuICAgICAgYnVmZmVyU2l6ZTogY3R4LmJ1ZmZlcnNpemVcbiAgICB9O1xuICAgIHZhciBtaWMgPSBuZXcgTWljcm9waG9uZShtaWNPcHRpb25zKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihldnQpIHtcbiAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBhbmNob3IgYmVoYXZpb3JcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB2YXIgY3VycmVudE1vZGVsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRNb2RlbCcpO1xuICAgICAgdmFyIGN1cnJlbnRseURpc3BsYXlpbmcgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJykpO1xuXG4gICAgICBpZiAoY3VycmVudGx5RGlzcGxheWluZykge1xuICAgICAgICBzaG93RXJyb3IoJ0N1cnJlbnRseSBhbm90aGVyIGZpbGUgaXMgcGxheWluZywgcGxlYXNlIHN0b3AgdGhlIGZpbGUgb3Igd2FpdCB1bnRpbCBpdCBmaW5pc2hlcycpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghcnVubmluZykge1xuICAgICAgICAkKCcjcmVzdWx0c1RleHQnKS5odG1sKCcnKTsgICAvLyBjbGVhciBoeXBvdGhlc2VzIGZyb20gcHJldmlvdXMgcnVuc1xuICAgICAgICBjb25zb2xlLmxvZygnTm90IHJ1bm5pbmcsIGhhbmRsZU1pY3JvcGhvbmUoKScpO1xuICAgICAgICBoYW5kbGVNaWNyb3Bob25lKHRva2VuLCBjdXJyZW50TW9kZWwsIG1pYywgZnVuY3Rpb24oZXJyLCBzb2NrZXQpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICB2YXIgbXNnID0gJ0Vycm9yOiAnICsgZXJyLm1lc3NhZ2U7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgICAgICAgc2hvd0Vycm9yKG1zZyk7XG4gICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlY29yZEJ1dHRvbi5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAnI0Q2MjAzMCcpO1xuICAgICAgICAgICAgcmVjb3JkQnV0dG9uLmZpbmQoJ2ltZycpLmF0dHIoJ3NyYycsICdpbWFnZXMvc3RvcC5zdmcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFydGluZyBtaWMnKTtcbiAgICAgICAgICAgIG1pYy5yZWNvcmQoKTtcbiAgICAgICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7ICAgICAgICBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTdG9wcGluZyBtaWNyb3Bob25lLCBzZW5kaW5nIHN0b3AgYWN0aW9uIG1lc3NhZ2UnKTtcbiAgICAgICAgcmVjb3JkQnV0dG9uLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgIHJlY29yZEJ1dHRvbi5maW5kKCdpbWcnKS5hdHRyKCdzcmMnLCAnaW1hZ2VzL21pY3JvcGhvbmUuc3ZnJyk7XG4gICAgICAgICQucHVibGlzaCgnaGFyZHNvY2tldHN0b3AnKTtcbiAgICAgICAgbWljLnN0b3AoKTtcbiAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfSkoKSk7XG59IiwiXG52YXIgaW5pdFBsYXlTYW1wbGUgPSByZXF1aXJlKCcuL3BsYXlzYW1wbGUnKS5pbml0UGxheVNhbXBsZTtcblxuZXhwb3J0cy5pbml0U2VsZWN0TW9kZWwgPSBmdW5jdGlvbihjdHgpIHtcblxuICBmdW5jdGlvbiBpc0RlZmF1bHQobW9kZWwpIHtcbiAgICByZXR1cm4gbW9kZWwgPT09ICdlbi1VU19Ccm9hZGJhbmRNb2RlbCc7XG4gIH1cblxuICBjdHgubW9kZWxzLmZvckVhY2goZnVuY3Rpb24obW9kZWwpIHtcbiAgICAkKFwiI2Ryb3Bkb3duTWVudUxpc3RcIikuYXBwZW5kKFxuICAgICAgJChcIjxsaT5cIilcbiAgICAgICAgLmF0dHIoJ3JvbGUnLCAncHJlc2VudGF0aW9uJylcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAkKCc8YT4nKS5hdHRyKCdyb2xlJywgJ21lbnUtaXRlbScpXG4gICAgICAgICAgICAuYXR0cignaHJlZicsICcvJylcbiAgICAgICAgICAgIC5hdHRyKCdkYXRhLW1vZGVsJywgbW9kZWwubmFtZSlcbiAgICAgICAgICAgIC5hcHBlbmQobW9kZWwuZGVzY3JpcHRpb24pXG4gICAgICAgICAgKVxuICAgICAgKVxuICB9KTtcblxuICAkKFwiI2Ryb3Bkb3duTWVudUxpc3RcIikuY2xpY2soZnVuY3Rpb24oZXZ0KSB7XG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGNvbnNvbGUubG9nKCdDaGFuZ2UgdmlldycsICQoZXZ0LnRhcmdldCkudGV4dCgpKTtcbiAgICB2YXIgbmV3TW9kZWxEZXNjcmlwdGlvbiA9ICQoZXZ0LnRhcmdldCkudGV4dCgpO1xuICAgIHZhciBuZXdNb2RlbCA9ICQoZXZ0LnRhcmdldCkuZGF0YSgnbW9kZWwnKTtcbiAgICAkKCcjZHJvcGRvd25NZW51RGVmYXVsdCcpLmVtcHR5KCkudGV4dChuZXdNb2RlbERlc2NyaXB0aW9uKTtcbiAgICAkKCcjZHJvcGRvd25NZW51MScpLmRyb3Bkb3duKCd0b2dnbGUnKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudE1vZGVsJywgbmV3TW9kZWwpO1xuICAgIGN0eC5jdXJyZW50TW9kZWwgPSBuZXdNb2RlbDtcbiAgICBpbml0UGxheVNhbXBsZShjdHgpO1xuICAgICQucHVibGlzaCgnY2xlYXJzY3JlZW4nKTtcbiAgfSk7XG5cbn0iLCJcbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5pbml0U2Vzc2lvblBlcm1pc3Npb25zID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgc2Vzc2lvbiBwZXJtaXNzaW9ucyBoYW5kbGVyJyk7XG4gIC8vIFJhZGlvIGJ1dHRvbnNcbiAgdmFyIHNlc3Npb25QZXJtaXNzaW9uc1JhZGlvID0gJChcIiNzZXNzaW9uUGVybWlzc2lvbnNSYWRpb0dyb3VwIGlucHV0W3R5cGU9J3JhZGlvJ11cIik7XG4gIHNlc3Npb25QZXJtaXNzaW9uc1JhZGlvLmNsaWNrKGZ1bmN0aW9uKGV2dCkge1xuICAgIHZhciBjaGVja2VkVmFsdWUgPSBzZXNzaW9uUGVybWlzc2lvbnNSYWRpby5maWx0ZXIoJzpjaGVja2VkJykudmFsKCk7XG4gICAgY29uc29sZS5sb2coJ2NoZWNrZWRWYWx1ZScsIGNoZWNrZWRWYWx1ZSk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Nlc3Npb25QZXJtaXNzaW9ucycsIGNoZWNrZWRWYWx1ZSk7XG4gIH0pO1xufVxuIiwiXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuc2hvd0Vycm9yID0gZnVuY3Rpb24obXNnKSB7XG4gIGNvbnNvbGUubG9nKCdFcnJvcjogJywgbXNnKTtcbiAgdmFyIGVycm9yQWxlcnQgPSAkKCcuZXJyb3Itcm93Jyk7XG4gIGVycm9yQWxlcnQuaGlkZSgpO1xuICBlcnJvckFsZXJ0LmNzcygnYmFja2dyb3VuZC1jb2xvcicsICcjZDc0MTA4Jyk7XG4gIGVycm9yQWxlcnQuY3NzKCdjb2xvcicsICd3aGl0ZScpO1xuICB2YXIgZXJyb3JNZXNzYWdlID0gJCgnI2Vycm9yTWVzc2FnZScpO1xuICBlcnJvck1lc3NhZ2UudGV4dChtc2cpO1xuICBlcnJvckFsZXJ0LnNob3coKTtcbiAgJCgnI2Vycm9yQ2xvc2UnKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGVycm9yQWxlcnQuaGlkZSgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG59XG5cbmV4cG9ydHMuc2hvd05vdGljZSA9IGZ1bmN0aW9uKG1zZykge1xuICBjb25zb2xlLmxvZygnTm90aWNlOiAnLCBtc2cpO1xuICB2YXIgbm90aWNlQWxlcnQgPSAkKCcubm90aWZpY2F0aW9uLXJvdycpO1xuICBub3RpY2VBbGVydC5oaWRlKCk7XG4gIG5vdGljZUFsZXJ0LmNzcygnYm9yZGVyJywgJzJweCBzb2xpZCAjZWNlY2VjJyk7XG4gIG5vdGljZUFsZXJ0LmNzcygnYmFja2dyb3VuZC1jb2xvcicsICcjZjRmNGY0Jyk7XG4gIG5vdGljZUFsZXJ0LmNzcygnY29sb3InLCAnYmxhY2snKTtcbiAgdmFyIG5vdGljZU1lc3NhZ2UgPSAkKCcjbm90aWZpY2F0aW9uTWVzc2FnZScpO1xuICBub3RpY2VNZXNzYWdlLnRleHQobXNnKTtcbiAgbm90aWNlQWxlcnQuc2hvdygpO1xuICAkKCcjbm90aWZpY2F0aW9uQ2xvc2UnKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIG5vdGljZUFsZXJ0LmhpZGUoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufVxuXG5leHBvcnRzLmhpZGVFcnJvciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZXJyb3JBbGVydCA9ICQoJy5lcnJvci1yb3cnKTtcbiAgZXJyb3JBbGVydC5oaWRlKCk7XG59IiwiXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuaW5pdFNob3dUYWIgPSBmdW5jdGlvbigpIHtcblxuICAkKCcubmF2LXRhYnMgYVtkYXRhLXRvZ2dsZT1cInRhYlwiXScpLm9uKCdzaG93bi5icy50YWInLCBmdW5jdGlvbiAoZSkge1xuICAgIC8vc2hvdyBzZWxlY3RlZCB0YWIgLyBhY3RpdmVcbiAgICB2YXIgdGFyZ2V0ID0gJChlLnRhcmdldCkudGV4dCgpO1xuICAgIGlmICh0YXJnZXQgPT09ICdKU09OJykge1xuICAgICAgY29uc29sZS5sb2coJ3Nob3dpbmcganNvbicpO1xuICAgICAgJC5wdWJsaXNoKCdzaG93anNvbicpO1xuICAgIH1cbiAgfSk7XG5cbn0iXX0=
