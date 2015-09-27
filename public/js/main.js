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
    $('#resultsText').val(speech.transcript);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL2RvbXJlYWR5L3JlYWR5LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL2pzb24zL2xpYi9qc29uMy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL25vZGVfbW9kdWxlcy9zcGluLmpzL3NwaW4uanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9ub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9hc3luYy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2hlbHBlcnMvZ2V0LWNvbnRleHQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL2dldC1xdWVyeS1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL2dldC10aW1lem9uZS1vZmZzZXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL2dldC11cmwtbWF4LWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2hlbHBlcnMvZ2V0LXhoci1vYmplY3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL3N1cGVyYWdlbnQtaGFuZGxlLXJlc3BvbnNlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2NvcmUvaGVscGVycy9zdXBlcmFnZW50LXJlcXVlc3QtdHlwZXMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2xpYi9hZGRFdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2xpYi9hZGRFdmVudHMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9saWIvZ2V0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2NvcmUvbGliL3Bvc3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9saWIvcnVuLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2NvcmUvbGliL3NldEdsb2JhbFByb3BlcnRpZXMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9saWIvdHJhY2tFeHRlcm5hbExpbmsuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9xdWVyeS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL3JlcXVlc3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9iYXNlNjQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9jbG9uZS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL3V0aWxzL2VhY2guanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9lbWl0dGVyLXNoaW0uanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9leHRlbmQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9qc29uLXNoaW0uanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9wYXJzZVBhcmFtcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL3V0aWxzL3NlbmRRdWVyeS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2RhdGFzZXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9hbmFseXNlcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9hcHBlbmQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9saWIvZGVsZXRlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGFzZXQvbGliL2ZpbHRlci5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9mb3JtYXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9saWIvaW5zZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGFzZXQvbGliL3NlbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9zZXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9saWIvc29ydC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi91cGRhdGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC91dGlscy9jcmVhdGUtbnVsbC1saXN0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGFzZXQvdXRpbHMvZmxhdHRlbi5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L3V0aWxzL3BhcnNlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovYWRhcHRlcnMvYzMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9hZGFwdGVycy9jaGFydGpzLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovYWRhcHRlcnMvZ29vZ2xlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovYWRhcHRlcnMva2Vlbi1pby5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2RhdGF2aXouanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9leHRlbnNpb25zL2RyYXcuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9oZWxwZXJzL2dldEFkYXB0ZXJBY3Rpb25zLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovaGVscGVycy9nZXREYXRhc2V0U2NoZW1hcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2hlbHBlcnMvZ2V0RGVmYXVsdFRpdGxlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovaGVscGVycy9nZXRRdWVyeURhdGFUeXBlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovaW5kZXguanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvYWN0aW9ucy9kZXN0cm95LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FjdGlvbnMvZXJyb3IuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvYWN0aW9ucy9pbml0aWFsaXplLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FjdGlvbnMvcmVuZGVyLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FjdGlvbnMvdXBkYXRlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FkYXB0ZXIuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvYXR0cmlidXRlcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9jYWxsLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2NoYXJ0T3B0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9jaGFydFR5cGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvY29sb3JNYXBwaW5nLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2NvbG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9kYXRhLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2RhdGFUeXBlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2RlZmF1bHRDaGFydFR5cGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvZWwuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvaGVpZ2h0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2luZGV4QnkuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvbGFiZWxNYXBwaW5nLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2xhYmVscy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9saWJyYXJ5LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL3BhcnNlUmF3RGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9wYXJzZVJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvcHJlcGFyZS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9zb3J0R3JvdXBzLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL3NvcnRJbnRlcnZhbHMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvc3RhY2tlZC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi90aXRsZS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi93aWR0aC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L3V0aWxzL2FwcGx5VHJhbnNmb3Jtcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L3V0aWxzL2xvYWRTY3JpcHQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei91dGlscy9sb2FkU3R5bGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei91dGlscy9wcmV0dHlOdW1iZXIuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMva2Vlbi5qcyIsInNyYy9NaWNyb3Bob25lLmpzIiwic3JjL2RhdGEvbW9kZWxzLmpzb24iLCJzcmMvaGFuZGxlZmlsZXVwbG9hZC5qcyIsInNyYy9oYW5kbGVtaWNyb3Bob25lLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL2tlZW4uanMiLCJzcmMvc29ja2V0LmpzIiwic3JjL3V0aWxzLmpzIiwic3JjL3ZpZXdzL2FuaW1hdGVwYW5lbC5qcyIsInNyYy92aWV3cy9kaXNwbGF5bWV0YWRhdGEuanMiLCJzcmMvdmlld3MvZHJhZ2Ryb3AuanMiLCJzcmMvdmlld3MvZWZmZWN0cy5qcyIsInNyYy92aWV3cy9maWxldXBsb2FkLmpzIiwic3JjL3ZpZXdzL2luZGV4LmpzIiwic3JjL3ZpZXdzL3BsYXlzYW1wbGUuanMiLCJzcmMvdmlld3MvcmVjb3JkYnV0dG9uLmpzIiwic3JjL3ZpZXdzL3NlbGVjdG1vZGVsLmpzIiwic3JjL3ZpZXdzL3Nlc3Npb25wZXJtaXNzaW9ucy5qcyIsInNyYy92aWV3cy9zaG93ZXJyb3IuanMiLCJzcmMvdmlld3Mvc2hvd3RhYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3Q0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHRoaXMub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIG9uLmZuID0gZm47XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2I7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xufTtcbiIsIi8qIVxuICAqIGRvbXJlYWR5IChjKSBEdXN0aW4gRGlheiAyMDEyIC0gTGljZW5zZSBNSVRcbiAgKi9cbiFmdW5jdGlvbiAobmFtZSwgZGVmaW5pdGlvbikge1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJykgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKClcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnKSBkZWZpbmUoZGVmaW5pdGlvbilcbiAgZWxzZSB0aGlzW25hbWVdID0gZGVmaW5pdGlvbigpXG59KCdkb21yZWFkeScsIGZ1bmN0aW9uIChyZWFkeSkge1xuXG4gIHZhciBmbnMgPSBbXSwgZm4sIGYgPSBmYWxzZVxuICAgICwgZG9jID0gZG9jdW1lbnRcbiAgICAsIHRlc3RFbCA9IGRvYy5kb2N1bWVudEVsZW1lbnRcbiAgICAsIGhhY2sgPSB0ZXN0RWwuZG9TY3JvbGxcbiAgICAsIGRvbUNvbnRlbnRMb2FkZWQgPSAnRE9NQ29udGVudExvYWRlZCdcbiAgICAsIGFkZEV2ZW50TGlzdGVuZXIgPSAnYWRkRXZlbnRMaXN0ZW5lcidcbiAgICAsIG9ucmVhZHlzdGF0ZWNoYW5nZSA9ICdvbnJlYWR5c3RhdGVjaGFuZ2UnXG4gICAgLCByZWFkeVN0YXRlID0gJ3JlYWR5U3RhdGUnXG4gICAgLCBsb2FkZWRSZ3ggPSBoYWNrID8gL15sb2FkZWR8XmMvIDogL15sb2FkZWR8Yy9cbiAgICAsIGxvYWRlZCA9IGxvYWRlZFJneC50ZXN0KGRvY1tyZWFkeVN0YXRlXSlcblxuICBmdW5jdGlvbiBmbHVzaChmKSB7XG4gICAgbG9hZGVkID0gMVxuICAgIHdoaWxlIChmID0gZm5zLnNoaWZ0KCkpIGYoKVxuICB9XG5cbiAgZG9jW2FkZEV2ZW50TGlzdGVuZXJdICYmIGRvY1thZGRFdmVudExpc3RlbmVyXShkb21Db250ZW50TG9hZGVkLCBmbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihkb21Db250ZW50TG9hZGVkLCBmbiwgZilcbiAgICBmbHVzaCgpXG4gIH0sIGYpXG5cblxuICBoYWNrICYmIGRvYy5hdHRhY2hFdmVudChvbnJlYWR5c3RhdGVjaGFuZ2UsIGZuID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICgvXmMvLnRlc3QoZG9jW3JlYWR5U3RhdGVdKSkge1xuICAgICAgZG9jLmRldGFjaEV2ZW50KG9ucmVhZHlzdGF0ZWNoYW5nZSwgZm4pXG4gICAgICBmbHVzaCgpXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiAocmVhZHkgPSBoYWNrID9cbiAgICBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHNlbGYgIT0gdG9wID9cbiAgICAgICAgbG9hZGVkID8gZm4oKSA6IGZucy5wdXNoKGZuKSA6XG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGVzdEVsLmRvU2Nyb2xsKCdsZWZ0JylcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgcmVhZHkoZm4pIH0sIDUwKVxuICAgICAgICAgIH1cbiAgICAgICAgICBmbigpXG4gICAgICAgIH0oKVxuICAgIH0gOlxuICAgIGZ1bmN0aW9uIChmbikge1xuICAgICAgbG9hZGVkID8gZm4oKSA6IGZucy5wdXNoKGZuKVxuICAgIH0pXG59KVxuIiwiLyohIEpTT04gdjMuMy4yIHwgaHR0cDovL2Jlc3RpZWpzLmdpdGh1Yi5pby9qc29uMyB8IENvcHlyaWdodCAyMDEyLTIwMTQsIEtpdCBDYW1icmlkZ2UgfCBodHRwOi8va2l0Lm1pdC1saWNlbnNlLm9yZyAqL1xuOyhmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCB0aGUgYGRlZmluZWAgZnVuY3Rpb24gZXhwb3NlZCBieSBhc3luY2hyb25vdXMgbW9kdWxlIGxvYWRlcnMuIFRoZVxuICAvLyBzdHJpY3QgYGRlZmluZWAgY2hlY2sgaXMgbmVjZXNzYXJ5IGZvciBjb21wYXRpYmlsaXR5IHdpdGggYHIuanNgLlxuICB2YXIgaXNMb2FkZXIgPSB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZDtcblxuICAvLyBBIHNldCBvZiB0eXBlcyB1c2VkIHRvIGRpc3Rpbmd1aXNoIG9iamVjdHMgZnJvbSBwcmltaXRpdmVzLlxuICB2YXIgb2JqZWN0VHlwZXMgPSB7XG4gICAgXCJmdW5jdGlvblwiOiB0cnVlLFxuICAgIFwib2JqZWN0XCI6IHRydWVcbiAgfTtcblxuICAvLyBEZXRlY3QgdGhlIGBleHBvcnRzYCBvYmplY3QgZXhwb3NlZCBieSBDb21tb25KUyBpbXBsZW1lbnRhdGlvbnMuXG4gIHZhciBmcmVlRXhwb3J0cyA9IG9iamVjdFR5cGVzW3R5cGVvZiBleHBvcnRzXSAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbiAgLy8gVXNlIHRoZSBgZ2xvYmFsYCBvYmplY3QgZXhwb3NlZCBieSBOb2RlIChpbmNsdWRpbmcgQnJvd3NlcmlmeSB2aWFcbiAgLy8gYGluc2VydC1tb2R1bGUtZ2xvYmFsc2ApLCBOYXJ3aGFsLCBhbmQgUmluZ28gYXMgdGhlIGRlZmF1bHQgY29udGV4dCxcbiAgLy8gYW5kIHRoZSBgd2luZG93YCBvYmplY3QgaW4gYnJvd3NlcnMuIFJoaW5vIGV4cG9ydHMgYSBgZ2xvYmFsYCBmdW5jdGlvblxuICAvLyBpbnN0ZWFkLlxuICB2YXIgcm9vdCA9IG9iamVjdFR5cGVzW3R5cGVvZiB3aW5kb3ddICYmIHdpbmRvdyB8fCB0aGlzLFxuICAgICAgZnJlZUdsb2JhbCA9IGZyZWVFeHBvcnRzICYmIG9iamVjdFR5cGVzW3R5cGVvZiBtb2R1bGVdICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIHR5cGVvZiBnbG9iYWwgPT0gXCJvYmplY3RcIiAmJiBnbG9iYWw7XG5cbiAgaWYgKGZyZWVHbG9iYWwgJiYgKGZyZWVHbG9iYWxbXCJnbG9iYWxcIl0gPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbFtcIndpbmRvd1wiXSA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsW1wic2VsZlwiXSA9PT0gZnJlZUdsb2JhbCkpIHtcbiAgICByb290ID0gZnJlZUdsb2JhbDtcbiAgfVxuXG4gIC8vIFB1YmxpYzogSW5pdGlhbGl6ZXMgSlNPTiAzIHVzaW5nIHRoZSBnaXZlbiBgY29udGV4dGAgb2JqZWN0LCBhdHRhY2hpbmcgdGhlXG4gIC8vIGBzdHJpbmdpZnlgIGFuZCBgcGFyc2VgIGZ1bmN0aW9ucyB0byB0aGUgc3BlY2lmaWVkIGBleHBvcnRzYCBvYmplY3QuXG4gIGZ1bmN0aW9uIHJ1bkluQ29udGV4dChjb250ZXh0LCBleHBvcnRzKSB7XG4gICAgY29udGV4dCB8fCAoY29udGV4dCA9IHJvb3RbXCJPYmplY3RcIl0oKSk7XG4gICAgZXhwb3J0cyB8fCAoZXhwb3J0cyA9IHJvb3RbXCJPYmplY3RcIl0oKSk7XG5cbiAgICAvLyBOYXRpdmUgY29uc3RydWN0b3IgYWxpYXNlcy5cbiAgICB2YXIgTnVtYmVyID0gY29udGV4dFtcIk51bWJlclwiXSB8fCByb290W1wiTnVtYmVyXCJdLFxuICAgICAgICBTdHJpbmcgPSBjb250ZXh0W1wiU3RyaW5nXCJdIHx8IHJvb3RbXCJTdHJpbmdcIl0sXG4gICAgICAgIE9iamVjdCA9IGNvbnRleHRbXCJPYmplY3RcIl0gfHwgcm9vdFtcIk9iamVjdFwiXSxcbiAgICAgICAgRGF0ZSA9IGNvbnRleHRbXCJEYXRlXCJdIHx8IHJvb3RbXCJEYXRlXCJdLFxuICAgICAgICBTeW50YXhFcnJvciA9IGNvbnRleHRbXCJTeW50YXhFcnJvclwiXSB8fCByb290W1wiU3ludGF4RXJyb3JcIl0sXG4gICAgICAgIFR5cGVFcnJvciA9IGNvbnRleHRbXCJUeXBlRXJyb3JcIl0gfHwgcm9vdFtcIlR5cGVFcnJvclwiXSxcbiAgICAgICAgTWF0aCA9IGNvbnRleHRbXCJNYXRoXCJdIHx8IHJvb3RbXCJNYXRoXCJdLFxuICAgICAgICBuYXRpdmVKU09OID0gY29udGV4dFtcIkpTT05cIl0gfHwgcm9vdFtcIkpTT05cIl07XG5cbiAgICAvLyBEZWxlZ2F0ZSB0byB0aGUgbmF0aXZlIGBzdHJpbmdpZnlgIGFuZCBgcGFyc2VgIGltcGxlbWVudGF0aW9ucy5cbiAgICBpZiAodHlwZW9mIG5hdGl2ZUpTT04gPT0gXCJvYmplY3RcIiAmJiBuYXRpdmVKU09OKSB7XG4gICAgICBleHBvcnRzLnN0cmluZ2lmeSA9IG5hdGl2ZUpTT04uc3RyaW5naWZ5O1xuICAgICAgZXhwb3J0cy5wYXJzZSA9IG5hdGl2ZUpTT04ucGFyc2U7XG4gICAgfVxuXG4gICAgLy8gQ29udmVuaWVuY2UgYWxpYXNlcy5cbiAgICB2YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlLFxuICAgICAgICBnZXRDbGFzcyA9IG9iamVjdFByb3RvLnRvU3RyaW5nLFxuICAgICAgICBpc1Byb3BlcnR5LCBmb3JFYWNoLCB1bmRlZjtcblxuICAgIC8vIFRlc3QgdGhlIGBEYXRlI2dldFVUQypgIG1ldGhvZHMuIEJhc2VkIG9uIHdvcmsgYnkgQFlhZmZsZS5cbiAgICB2YXIgaXNFeHRlbmRlZCA9IG5ldyBEYXRlKC0zNTA5ODI3MzM0NTczMjkyKTtcbiAgICB0cnkge1xuICAgICAgLy8gVGhlIGBnZXRVVENGdWxsWWVhcmAsIGBNb250aGAsIGFuZCBgRGF0ZWAgbWV0aG9kcyByZXR1cm4gbm9uc2Vuc2ljYWxcbiAgICAgIC8vIHJlc3VsdHMgZm9yIGNlcnRhaW4gZGF0ZXMgaW4gT3BlcmEgPj0gMTAuNTMuXG4gICAgICBpc0V4dGVuZGVkID0gaXNFeHRlbmRlZC5nZXRVVENGdWxsWWVhcigpID09IC0xMDkyNTIgJiYgaXNFeHRlbmRlZC5nZXRVVENNb250aCgpID09PSAwICYmIGlzRXh0ZW5kZWQuZ2V0VVRDRGF0ZSgpID09PSAxICYmXG4gICAgICAgIC8vIFNhZmFyaSA8IDIuMC4yIHN0b3JlcyB0aGUgaW50ZXJuYWwgbWlsbGlzZWNvbmQgdGltZSB2YWx1ZSBjb3JyZWN0bHksXG4gICAgICAgIC8vIGJ1dCBjbGlwcyB0aGUgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBkYXRlIG1ldGhvZHMgdG8gdGhlIHJhbmdlIG9mXG4gICAgICAgIC8vIHNpZ25lZCAzMi1iaXQgaW50ZWdlcnMgKFstMiAqKiAzMSwgMiAqKiAzMSAtIDFdKS5cbiAgICAgICAgaXNFeHRlbmRlZC5nZXRVVENIb3VycygpID09IDEwICYmIGlzRXh0ZW5kZWQuZ2V0VVRDTWludXRlcygpID09IDM3ICYmIGlzRXh0ZW5kZWQuZ2V0VVRDU2Vjb25kcygpID09IDYgJiYgaXNFeHRlbmRlZC5nZXRVVENNaWxsaXNlY29uZHMoKSA9PSA3MDg7XG4gICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7fVxuXG4gICAgLy8gSW50ZXJuYWw6IERldGVybWluZXMgd2hldGhlciB0aGUgbmF0aXZlIGBKU09OLnN0cmluZ2lmeWAgYW5kIGBwYXJzZWBcbiAgICAvLyBpbXBsZW1lbnRhdGlvbnMgYXJlIHNwZWMtY29tcGxpYW50LiBCYXNlZCBvbiB3b3JrIGJ5IEtlbiBTbnlkZXIuXG4gICAgZnVuY3Rpb24gaGFzKG5hbWUpIHtcbiAgICAgIGlmIChoYXNbbmFtZV0gIT09IHVuZGVmKSB7XG4gICAgICAgIC8vIFJldHVybiBjYWNoZWQgZmVhdHVyZSB0ZXN0IHJlc3VsdC5cbiAgICAgICAgcmV0dXJuIGhhc1tuYW1lXTtcbiAgICAgIH1cbiAgICAgIHZhciBpc1N1cHBvcnRlZDtcbiAgICAgIGlmIChuYW1lID09IFwiYnVnLXN0cmluZy1jaGFyLWluZGV4XCIpIHtcbiAgICAgICAgLy8gSUUgPD0gNyBkb2Vzbid0IHN1cHBvcnQgYWNjZXNzaW5nIHN0cmluZyBjaGFyYWN0ZXJzIHVzaW5nIHNxdWFyZVxuICAgICAgICAvLyBicmFja2V0IG5vdGF0aW9uLiBJRSA4IG9ubHkgc3VwcG9ydHMgdGhpcyBmb3IgcHJpbWl0aXZlcy5cbiAgICAgICAgaXNTdXBwb3J0ZWQgPSBcImFcIlswXSAhPSBcImFcIjtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PSBcImpzb25cIikge1xuICAgICAgICAvLyBJbmRpY2F0ZXMgd2hldGhlciBib3RoIGBKU09OLnN0cmluZ2lmeWAgYW5kIGBKU09OLnBhcnNlYCBhcmVcbiAgICAgICAgLy8gc3VwcG9ydGVkLlxuICAgICAgICBpc1N1cHBvcnRlZCA9IGhhcyhcImpzb24tc3RyaW5naWZ5XCIpICYmIGhhcyhcImpzb24tcGFyc2VcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdmFsdWUsIHNlcmlhbGl6ZWQgPSAne1wiYVwiOlsxLHRydWUsZmFsc2UsbnVsbCxcIlxcXFx1MDAwMFxcXFxiXFxcXG5cXFxcZlxcXFxyXFxcXHRcIl19JztcbiAgICAgICAgLy8gVGVzdCBgSlNPTi5zdHJpbmdpZnlgLlxuICAgICAgICBpZiAobmFtZSA9PSBcImpzb24tc3RyaW5naWZ5XCIpIHtcbiAgICAgICAgICB2YXIgc3RyaW5naWZ5ID0gZXhwb3J0cy5zdHJpbmdpZnksIHN0cmluZ2lmeVN1cHBvcnRlZCA9IHR5cGVvZiBzdHJpbmdpZnkgPT0gXCJmdW5jdGlvblwiICYmIGlzRXh0ZW5kZWQ7XG4gICAgICAgICAgaWYgKHN0cmluZ2lmeVN1cHBvcnRlZCkge1xuICAgICAgICAgICAgLy8gQSB0ZXN0IGZ1bmN0aW9uIG9iamVjdCB3aXRoIGEgY3VzdG9tIGB0b0pTT05gIG1ldGhvZC5cbiAgICAgICAgICAgICh2YWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9KS50b0pTT04gPSB2YWx1ZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHN0cmluZ2lmeVN1cHBvcnRlZCA9XG4gICAgICAgICAgICAgICAgLy8gRmlyZWZveCAzLjFiMSBhbmQgYjIgc2VyaWFsaXplIHN0cmluZywgbnVtYmVyLCBhbmQgYm9vbGVhblxuICAgICAgICAgICAgICAgIC8vIHByaW1pdGl2ZXMgYXMgb2JqZWN0IGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeSgwKSA9PT0gXCIwXCIgJiZcbiAgICAgICAgICAgICAgICAvLyBGRiAzLjFiMSwgYjIsIGFuZCBKU09OIDIgc2VyaWFsaXplIHdyYXBwZWQgcHJpbWl0aXZlcyBhcyBvYmplY3RcbiAgICAgICAgICAgICAgICAvLyBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IE51bWJlcigpKSA9PT0gXCIwXCIgJiZcbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IFN0cmluZygpKSA9PSAnXCJcIicgJiZcbiAgICAgICAgICAgICAgICAvLyBGRiAzLjFiMSwgMiB0aHJvdyBhbiBlcnJvciBpZiB0aGUgdmFsdWUgaXMgYG51bGxgLCBgdW5kZWZpbmVkYCwgb3JcbiAgICAgICAgICAgICAgICAvLyBkb2VzIG5vdCBkZWZpbmUgYSBjYW5vbmljYWwgSlNPTiByZXByZXNlbnRhdGlvbiAodGhpcyBhcHBsaWVzIHRvXG4gICAgICAgICAgICAgICAgLy8gb2JqZWN0cyB3aXRoIGB0b0pTT05gIHByb3BlcnRpZXMgYXMgd2VsbCwgKnVubGVzcyogdGhleSBhcmUgbmVzdGVkXG4gICAgICAgICAgICAgICAgLy8gd2l0aGluIGFuIG9iamVjdCBvciBhcnJheSkuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KGdldENsYXNzKSA9PT0gdW5kZWYgJiZcbiAgICAgICAgICAgICAgICAvLyBJRSA4IHNlcmlhbGl6ZXMgYHVuZGVmaW5lZGAgYXMgYFwidW5kZWZpbmVkXCJgLiBTYWZhcmkgPD0gNS4xLjcgYW5kXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjMgcGFzcyB0aGlzIHRlc3QuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KHVuZGVmKSA9PT0gdW5kZWYgJiZcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgPD0gNS4xLjcgYW5kIEZGIDMuMWIzIHRocm93IGBFcnJvcmBzIGFuZCBgVHlwZUVycm9yYHMsXG4gICAgICAgICAgICAgICAgLy8gcmVzcGVjdGl2ZWx5LCBpZiB0aGUgdmFsdWUgaXMgb21pdHRlZCBlbnRpcmVseS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoKSA9PT0gdW5kZWYgJiZcbiAgICAgICAgICAgICAgICAvLyBGRiAzLjFiMSwgMiB0aHJvdyBhbiBlcnJvciBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgbm90IGEgbnVtYmVyLFxuICAgICAgICAgICAgICAgIC8vIHN0cmluZywgYXJyYXksIG9iamVjdCwgQm9vbGVhbiwgb3IgYG51bGxgIGxpdGVyYWwuIFRoaXMgYXBwbGllcyB0b1xuICAgICAgICAgICAgICAgIC8vIG9iamVjdHMgd2l0aCBjdXN0b20gYHRvSlNPTmAgbWV0aG9kcyBhcyB3ZWxsLCB1bmxlc3MgdGhleSBhcmUgbmVzdGVkXG4gICAgICAgICAgICAgICAgLy8gaW5zaWRlIG9iamVjdCBvciBhcnJheSBsaXRlcmFscy4gWVVJIDMuMC4wYjEgaWdub3JlcyBjdXN0b20gYHRvSlNPTmBcbiAgICAgICAgICAgICAgICAvLyBtZXRob2RzIGVudGlyZWx5LlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeSh2YWx1ZSkgPT09IFwiMVwiICYmXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KFt2YWx1ZV0pID09IFwiWzFdXCIgJiZcbiAgICAgICAgICAgICAgICAvLyBQcm90b3R5cGUgPD0gMS42LjEgc2VyaWFsaXplcyBgW3VuZGVmaW5lZF1gIGFzIGBcIltdXCJgIGluc3RlYWQgb2ZcbiAgICAgICAgICAgICAgICAvLyBgXCJbbnVsbF1cImAuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KFt1bmRlZl0pID09IFwiW251bGxdXCIgJiZcbiAgICAgICAgICAgICAgICAvLyBZVUkgMy4wLjBiMSBmYWlscyB0byBzZXJpYWxpemUgYG51bGxgIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShudWxsKSA9PSBcIm51bGxcIiAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCAyIGhhbHRzIHNlcmlhbGl6YXRpb24gaWYgYW4gYXJyYXkgY29udGFpbnMgYSBmdW5jdGlvbjpcbiAgICAgICAgICAgICAgICAvLyBgWzEsIHRydWUsIGdldENsYXNzLCAxXWAgc2VyaWFsaXplcyBhcyBcIlsxLHRydWUsXSxcIi4gRkYgMy4xYjNcbiAgICAgICAgICAgICAgICAvLyBlbGlkZXMgbm9uLUpTT04gdmFsdWVzIGZyb20gb2JqZWN0cyBhbmQgYXJyYXlzLCB1bmxlc3MgdGhleVxuICAgICAgICAgICAgICAgIC8vIGRlZmluZSBjdXN0b20gYHRvSlNPTmAgbWV0aG9kcy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoW3VuZGVmLCBnZXRDbGFzcywgbnVsbF0pID09IFwiW251bGwsbnVsbCxudWxsXVwiICYmXG4gICAgICAgICAgICAgICAgLy8gU2ltcGxlIHNlcmlhbGl6YXRpb24gdGVzdC4gRkYgMy4xYjEgdXNlcyBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZXNcbiAgICAgICAgICAgICAgICAvLyB3aGVyZSBjaGFyYWN0ZXIgZXNjYXBlIGNvZGVzIGFyZSBleHBlY3RlZCAoZS5nLiwgYFxcYmAgPT4gYFxcdTAwMDhgKS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoeyBcImFcIjogW3ZhbHVlLCB0cnVlLCBmYWxzZSwgbnVsbCwgXCJcXHgwMFxcYlxcblxcZlxcclxcdFwiXSB9KSA9PSBzZXJpYWxpemVkICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEgYW5kIGIyIGlnbm9yZSB0aGUgYGZpbHRlcmAgYW5kIGB3aWR0aGAgYXJndW1lbnRzLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShudWxsLCB2YWx1ZSkgPT09IFwiMVwiICYmXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KFsxLCAyXSwgbnVsbCwgMSkgPT0gXCJbXFxuIDEsXFxuIDJcXG5dXCIgJiZcbiAgICAgICAgICAgICAgICAvLyBKU09OIDIsIFByb3RvdHlwZSA8PSAxLjcsIGFuZCBvbGRlciBXZWJLaXQgYnVpbGRzIGluY29ycmVjdGx5XG4gICAgICAgICAgICAgICAgLy8gc2VyaWFsaXplIGV4dGVuZGVkIHllYXJzLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgRGF0ZSgtOC42NGUxNSkpID09ICdcIi0yNzE4MjEtMDQtMjBUMDA6MDA6MDAuMDAwWlwiJyAmJlxuICAgICAgICAgICAgICAgIC8vIFRoZSBtaWxsaXNlY29uZHMgYXJlIG9wdGlvbmFsIGluIEVTIDUsIGJ1dCByZXF1aXJlZCBpbiA1LjEuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBEYXRlKDguNjRlMTUpKSA9PSAnXCIrMjc1NzYwLTA5LTEzVDAwOjAwOjAwLjAwMFpcIicgJiZcbiAgICAgICAgICAgICAgICAvLyBGaXJlZm94IDw9IDExLjAgaW5jb3JyZWN0bHkgc2VyaWFsaXplcyB5ZWFycyBwcmlvciB0byAwIGFzIG5lZ2F0aXZlXG4gICAgICAgICAgICAgICAgLy8gZm91ci1kaWdpdCB5ZWFycyBpbnN0ZWFkIG9mIHNpeC1kaWdpdCB5ZWFycy4gQ3JlZGl0czogQFlhZmZsZS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoLTYyMTk4NzU1MmU1KSkgPT0gJ1wiLTAwMDAwMS0wMS0wMVQwMDowMDowMC4wMDBaXCInICYmXG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIDw9IDUuMS41IGFuZCBPcGVyYSA+PSAxMC41MyBpbmNvcnJlY3RseSBzZXJpYWxpemUgbWlsbGlzZWNvbmRcbiAgICAgICAgICAgICAgICAvLyB2YWx1ZXMgbGVzcyB0aGFuIDEwMDAuIENyZWRpdHM6IEBZYWZmbGUuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBEYXRlKC0xKSkgPT0gJ1wiMTk2OS0xMi0zMVQyMzo1OTo1OS45OTlaXCInO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgIHN0cmluZ2lmeVN1cHBvcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpc1N1cHBvcnRlZCA9IHN0cmluZ2lmeVN1cHBvcnRlZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBUZXN0IGBKU09OLnBhcnNlYC5cbiAgICAgICAgaWYgKG5hbWUgPT0gXCJqc29uLXBhcnNlXCIpIHtcbiAgICAgICAgICB2YXIgcGFyc2UgPSBleHBvcnRzLnBhcnNlO1xuICAgICAgICAgIGlmICh0eXBlb2YgcGFyc2UgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyBGRiAzLjFiMSwgYjIgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYSBiYXJlIGxpdGVyYWwgaXMgcHJvdmlkZWQuXG4gICAgICAgICAgICAgIC8vIENvbmZvcm1pbmcgaW1wbGVtZW50YXRpb25zIHNob3VsZCBhbHNvIGNvZXJjZSB0aGUgaW5pdGlhbCBhcmd1bWVudCB0b1xuICAgICAgICAgICAgICAvLyBhIHN0cmluZyBwcmlvciB0byBwYXJzaW5nLlxuICAgICAgICAgICAgICBpZiAocGFyc2UoXCIwXCIpID09PSAwICYmICFwYXJzZShmYWxzZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBTaW1wbGUgcGFyc2luZyB0ZXN0LlxuICAgICAgICAgICAgICAgIHZhbHVlID0gcGFyc2Uoc2VyaWFsaXplZCk7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnNlU3VwcG9ydGVkID0gdmFsdWVbXCJhXCJdLmxlbmd0aCA9PSA1ICYmIHZhbHVlW1wiYVwiXVswXSA9PT0gMTtcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNhZmFyaSA8PSA1LjEuMiBhbmQgRkYgMy4xYjEgYWxsb3cgdW5lc2NhcGVkIHRhYnMgaW4gc3RyaW5ncy5cbiAgICAgICAgICAgICAgICAgICAgcGFyc2VTdXBwb3J0ZWQgPSAhcGFyc2UoJ1wiXFx0XCInKTtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cbiAgICAgICAgICAgICAgICAgIGlmIChwYXJzZVN1cHBvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEZGIDQuMCBhbmQgNC4wLjEgYWxsb3cgbGVhZGluZyBgK2Agc2lnbnMgYW5kIGxlYWRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAvLyBkZWNpbWFsIHBvaW50cy4gRkYgNC4wLCA0LjAuMSwgYW5kIElFIDktMTAgYWxzbyBhbGxvd1xuICAgICAgICAgICAgICAgICAgICAgIC8vIGNlcnRhaW4gb2N0YWwgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VTdXBwb3J0ZWQgPSBwYXJzZShcIjAxXCIpICE9PSAxO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAocGFyc2VTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBGRiA0LjAsIDQuMC4xLCBhbmQgUmhpbm8gMS43UjMtUjQgYWxsb3cgdHJhaWxpbmcgZGVjaW1hbFxuICAgICAgICAgICAgICAgICAgICAgIC8vIHBvaW50cy4gVGhlc2UgZW52aXJvbm1lbnRzLCBhbG9uZyB3aXRoIEZGIDMuMWIxIGFuZCAyLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIGFsc28gYWxsb3cgdHJhaWxpbmcgY29tbWFzIGluIEpTT04gb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlU3VwcG9ydGVkID0gcGFyc2UoXCIxLlwiKSAhPT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7fVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgIHBhcnNlU3VwcG9ydGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlzU3VwcG9ydGVkID0gcGFyc2VTdXBwb3J0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBoYXNbbmFtZV0gPSAhIWlzU3VwcG9ydGVkO1xuICAgIH1cblxuICAgIGlmICghaGFzKFwianNvblwiKSkge1xuICAgICAgLy8gQ29tbW9uIGBbW0NsYXNzXV1gIG5hbWUgYWxpYXNlcy5cbiAgICAgIHZhciBmdW5jdGlvbkNsYXNzID0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiLFxuICAgICAgICAgIGRhdGVDbGFzcyA9IFwiW29iamVjdCBEYXRlXVwiLFxuICAgICAgICAgIG51bWJlckNsYXNzID0gXCJbb2JqZWN0IE51bWJlcl1cIixcbiAgICAgICAgICBzdHJpbmdDbGFzcyA9IFwiW29iamVjdCBTdHJpbmddXCIsXG4gICAgICAgICAgYXJyYXlDbGFzcyA9IFwiW29iamVjdCBBcnJheV1cIixcbiAgICAgICAgICBib29sZWFuQ2xhc3MgPSBcIltvYmplY3QgQm9vbGVhbl1cIjtcblxuICAgICAgLy8gRGV0ZWN0IGluY29tcGxldGUgc3VwcG9ydCBmb3IgYWNjZXNzaW5nIHN0cmluZyBjaGFyYWN0ZXJzIGJ5IGluZGV4LlxuICAgICAgdmFyIGNoYXJJbmRleEJ1Z2d5ID0gaGFzKFwiYnVnLXN0cmluZy1jaGFyLWluZGV4XCIpO1xuXG4gICAgICAvLyBEZWZpbmUgYWRkaXRpb25hbCB1dGlsaXR5IG1ldGhvZHMgaWYgdGhlIGBEYXRlYCBtZXRob2RzIGFyZSBidWdneS5cbiAgICAgIGlmICghaXNFeHRlbmRlZCkge1xuICAgICAgICB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgICAgICAvLyBBIG1hcHBpbmcgYmV0d2VlbiB0aGUgbW9udGhzIG9mIHRoZSB5ZWFyIGFuZCB0aGUgbnVtYmVyIG9mIGRheXMgYmV0d2VlblxuICAgICAgICAvLyBKYW51YXJ5IDFzdCBhbmQgdGhlIGZpcnN0IG9mIHRoZSByZXNwZWN0aXZlIG1vbnRoLlxuICAgICAgICB2YXIgTW9udGhzID0gWzAsIDMxLCA1OSwgOTAsIDEyMCwgMTUxLCAxODEsIDIxMiwgMjQzLCAyNzMsIDMwNCwgMzM0XTtcbiAgICAgICAgLy8gSW50ZXJuYWw6IENhbGN1bGF0ZXMgdGhlIG51bWJlciBvZiBkYXlzIGJldHdlZW4gdGhlIFVuaXggZXBvY2ggYW5kIHRoZVxuICAgICAgICAvLyBmaXJzdCBkYXkgb2YgdGhlIGdpdmVuIG1vbnRoLlxuICAgICAgICB2YXIgZ2V0RGF5ID0gZnVuY3Rpb24gKHllYXIsIG1vbnRoKSB7XG4gICAgICAgICAgcmV0dXJuIE1vbnRoc1ttb250aF0gKyAzNjUgKiAoeWVhciAtIDE5NzApICsgZmxvb3IoKHllYXIgLSAxOTY5ICsgKG1vbnRoID0gKyhtb250aCA+IDEpKSkgLyA0KSAtIGZsb29yKCh5ZWFyIC0gMTkwMSArIG1vbnRoKSAvIDEwMCkgKyBmbG9vcigoeWVhciAtIDE2MDEgKyBtb250aCkgLyA0MDApO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBJbnRlcm5hbDogRGV0ZXJtaW5lcyBpZiBhIHByb3BlcnR5IGlzIGEgZGlyZWN0IHByb3BlcnR5IG9mIHRoZSBnaXZlblxuICAgICAgLy8gb2JqZWN0LiBEZWxlZ2F0ZXMgdG8gdGhlIG5hdGl2ZSBgT2JqZWN0I2hhc093blByb3BlcnR5YCBtZXRob2QuXG4gICAgICBpZiAoIShpc1Byb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHkpKSB7XG4gICAgICAgIGlzUHJvcGVydHkgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgICB2YXIgbWVtYmVycyA9IHt9LCBjb25zdHJ1Y3RvcjtcbiAgICAgICAgICBpZiAoKG1lbWJlcnMuX19wcm90b19fID0gbnVsbCwgbWVtYmVycy5fX3Byb3RvX18gPSB7XG4gICAgICAgICAgICAvLyBUaGUgKnByb3RvKiBwcm9wZXJ0eSBjYW5ub3QgYmUgc2V0IG11bHRpcGxlIHRpbWVzIGluIHJlY2VudFxuICAgICAgICAgICAgLy8gdmVyc2lvbnMgb2YgRmlyZWZveCBhbmQgU2VhTW9ua2V5LlxuICAgICAgICAgICAgXCJ0b1N0cmluZ1wiOiAxXG4gICAgICAgICAgfSwgbWVtYmVycykudG9TdHJpbmcgIT0gZ2V0Q2xhc3MpIHtcbiAgICAgICAgICAgIC8vIFNhZmFyaSA8PSAyLjAuMyBkb2Vzbid0IGltcGxlbWVudCBgT2JqZWN0I2hhc093blByb3BlcnR5YCwgYnV0XG4gICAgICAgICAgICAvLyBzdXBwb3J0cyB0aGUgbXV0YWJsZSAqcHJvdG8qIHByb3BlcnR5LlxuICAgICAgICAgICAgaXNQcm9wZXJ0eSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAvLyBDYXB0dXJlIGFuZCBicmVhayB0aGUgb2JqZWN0J3MgcHJvdG90eXBlIGNoYWluIChzZWUgc2VjdGlvbiA4LjYuMlxuICAgICAgICAgICAgICAvLyBvZiB0aGUgRVMgNS4xIHNwZWMpLiBUaGUgcGFyZW50aGVzaXplZCBleHByZXNzaW9uIHByZXZlbnRzIGFuXG4gICAgICAgICAgICAgIC8vIHVuc2FmZSB0cmFuc2Zvcm1hdGlvbiBieSB0aGUgQ2xvc3VyZSBDb21waWxlci5cbiAgICAgICAgICAgICAgdmFyIG9yaWdpbmFsID0gdGhpcy5fX3Byb3RvX18sIHJlc3VsdCA9IHByb3BlcnR5IGluICh0aGlzLl9fcHJvdG9fXyA9IG51bGwsIHRoaXMpO1xuICAgICAgICAgICAgICAvLyBSZXN0b3JlIHRoZSBvcmlnaW5hbCBwcm90b3R5cGUgY2hhaW4uXG4gICAgICAgICAgICAgIHRoaXMuX19wcm90b19fID0gb3JpZ2luYWw7XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBDYXB0dXJlIGEgcmVmZXJlbmNlIHRvIHRoZSB0b3AtbGV2ZWwgYE9iamVjdGAgY29uc3RydWN0b3IuXG4gICAgICAgICAgICBjb25zdHJ1Y3RvciA9IG1lbWJlcnMuY29uc3RydWN0b3I7XG4gICAgICAgICAgICAvLyBVc2UgdGhlIGBjb25zdHJ1Y3RvcmAgcHJvcGVydHkgdG8gc2ltdWxhdGUgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAgaW5cbiAgICAgICAgICAgIC8vIG90aGVyIGVudmlyb25tZW50cy5cbiAgICAgICAgICAgIGlzUHJvcGVydHkgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgdmFyIHBhcmVudCA9ICh0aGlzLmNvbnN0cnVjdG9yIHx8IGNvbnN0cnVjdG9yKS5wcm90b3R5cGU7XG4gICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eSBpbiB0aGlzICYmICEocHJvcGVydHkgaW4gcGFyZW50ICYmIHRoaXNbcHJvcGVydHldID09PSBwYXJlbnRbcHJvcGVydHldKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIG1lbWJlcnMgPSBudWxsO1xuICAgICAgICAgIHJldHVybiBpc1Byb3BlcnR5LmNhbGwodGhpcywgcHJvcGVydHkpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBJbnRlcm5hbDogTm9ybWFsaXplcyB0aGUgYGZvci4uLmluYCBpdGVyYXRpb24gYWxnb3JpdGhtIGFjcm9zc1xuICAgICAgLy8gZW52aXJvbm1lbnRzLiBFYWNoIGVudW1lcmF0ZWQga2V5IGlzIHlpZWxkZWQgdG8gYSBgY2FsbGJhY2tgIGZ1bmN0aW9uLlxuICAgICAgZm9yRWFjaCA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzaXplID0gMCwgUHJvcGVydGllcywgbWVtYmVycywgcHJvcGVydHk7XG5cbiAgICAgICAgLy8gVGVzdHMgZm9yIGJ1Z3MgaW4gdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQncyBgZm9yLi4uaW5gIGFsZ29yaXRobS4gVGhlXG4gICAgICAgIC8vIGB2YWx1ZU9mYCBwcm9wZXJ0eSBpbmhlcml0cyB0aGUgbm9uLWVudW1lcmFibGUgZmxhZyBmcm9tXG4gICAgICAgIC8vIGBPYmplY3QucHJvdG90eXBlYCBpbiBvbGRlciB2ZXJzaW9ucyBvZiBJRSwgTmV0c2NhcGUsIGFuZCBNb3ppbGxhLlxuICAgICAgICAoUHJvcGVydGllcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLnZhbHVlT2YgPSAwO1xuICAgICAgICB9KS5wcm90b3R5cGUudmFsdWVPZiA9IDA7XG5cbiAgICAgICAgLy8gSXRlcmF0ZSBvdmVyIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBgUHJvcGVydGllc2AgY2xhc3MuXG4gICAgICAgIG1lbWJlcnMgPSBuZXcgUHJvcGVydGllcygpO1xuICAgICAgICBmb3IgKHByb3BlcnR5IGluIG1lbWJlcnMpIHtcbiAgICAgICAgICAvLyBJZ25vcmUgYWxsIHByb3BlcnRpZXMgaW5oZXJpdGVkIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLlxuICAgICAgICAgIGlmIChpc1Byb3BlcnR5LmNhbGwobWVtYmVycywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgICBzaXplKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFByb3BlcnRpZXMgPSBtZW1iZXJzID0gbnVsbDtcblxuICAgICAgICAvLyBOb3JtYWxpemUgdGhlIGl0ZXJhdGlvbiBhbGdvcml0aG0uXG4gICAgICAgIGlmICghc2l6ZSkge1xuICAgICAgICAgIC8vIEEgbGlzdCBvZiBub24tZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGluaGVyaXRlZCBmcm9tIGBPYmplY3QucHJvdG90eXBlYC5cbiAgICAgICAgICBtZW1iZXJzID0gW1widmFsdWVPZlwiLCBcInRvU3RyaW5nXCIsIFwidG9Mb2NhbGVTdHJpbmdcIiwgXCJwcm9wZXJ0eUlzRW51bWVyYWJsZVwiLCBcImlzUHJvdG90eXBlT2ZcIiwgXCJoYXNPd25Qcm9wZXJ0eVwiLCBcImNvbnN0cnVjdG9yXCJdO1xuICAgICAgICAgIC8vIElFIDw9IDgsIE1vemlsbGEgMS4wLCBhbmQgTmV0c2NhcGUgNi4yIGlnbm9yZSBzaGFkb3dlZCBub24tZW51bWVyYWJsZVxuICAgICAgICAgIC8vIHByb3BlcnRpZXMuXG4gICAgICAgICAgZm9yRWFjaCA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgaXNGdW5jdGlvbiA9IGdldENsYXNzLmNhbGwob2JqZWN0KSA9PSBmdW5jdGlvbkNsYXNzLCBwcm9wZXJ0eSwgbGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGhhc1Byb3BlcnR5ID0gIWlzRnVuY3Rpb24gJiYgdHlwZW9mIG9iamVjdC5jb25zdHJ1Y3RvciAhPSBcImZ1bmN0aW9uXCIgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIG9iamVjdC5oYXNPd25Qcm9wZXJ0eV0gJiYgb2JqZWN0Lmhhc093blByb3BlcnR5IHx8IGlzUHJvcGVydHk7XG4gICAgICAgICAgICBmb3IgKHByb3BlcnR5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgICAvLyBHZWNrbyA8PSAxLjAgZW51bWVyYXRlcyB0aGUgYHByb3RvdHlwZWAgcHJvcGVydHkgb2YgZnVuY3Rpb25zIHVuZGVyXG4gICAgICAgICAgICAgIC8vIGNlcnRhaW4gY29uZGl0aW9uczsgSUUgZG9lcyBub3QuXG4gICAgICAgICAgICAgIGlmICghKGlzRnVuY3Rpb24gJiYgcHJvcGVydHkgPT0gXCJwcm90b3R5cGVcIikgJiYgaGFzUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHByb3BlcnR5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTWFudWFsbHkgaW52b2tlIHRoZSBjYWxsYmFjayBmb3IgZWFjaCBub24tZW51bWVyYWJsZSBwcm9wZXJ0eS5cbiAgICAgICAgICAgIGZvciAobGVuZ3RoID0gbWVtYmVycy5sZW5ndGg7IHByb3BlcnR5ID0gbWVtYmVyc1stLWxlbmd0aF07IGhhc1Byb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkgJiYgY2FsbGJhY2socHJvcGVydHkpKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHNpemUgPT0gMikge1xuICAgICAgICAgIC8vIFNhZmFyaSA8PSAyLjAuNCBlbnVtZXJhdGVzIHNoYWRvd2VkIHByb3BlcnRpZXMgdHdpY2UuXG4gICAgICAgICAgZm9yRWFjaCA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYSBzZXQgb2YgaXRlcmF0ZWQgcHJvcGVydGllcy5cbiAgICAgICAgICAgIHZhciBtZW1iZXJzID0ge30sIGlzRnVuY3Rpb24gPSBnZXRDbGFzcy5jYWxsKG9iamVjdCkgPT0gZnVuY3Rpb25DbGFzcywgcHJvcGVydHk7XG4gICAgICAgICAgICBmb3IgKHByb3BlcnR5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgICAvLyBTdG9yZSBlYWNoIHByb3BlcnR5IG5hbWUgdG8gcHJldmVudCBkb3VibGUgZW51bWVyYXRpb24uIFRoZVxuICAgICAgICAgICAgICAvLyBgcHJvdG90eXBlYCBwcm9wZXJ0eSBvZiBmdW5jdGlvbnMgaXMgbm90IGVudW1lcmF0ZWQgZHVlIHRvIGNyb3NzLVxuICAgICAgICAgICAgICAvLyBlbnZpcm9ubWVudCBpbmNvbnNpc3RlbmNpZXMuXG4gICAgICAgICAgICAgIGlmICghKGlzRnVuY3Rpb24gJiYgcHJvcGVydHkgPT0gXCJwcm90b3R5cGVcIikgJiYgIWlzUHJvcGVydHkuY2FsbChtZW1iZXJzLCBwcm9wZXJ0eSkgJiYgKG1lbWJlcnNbcHJvcGVydHldID0gMSkgJiYgaXNQcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socHJvcGVydHkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBObyBidWdzIGRldGVjdGVkOyB1c2UgdGhlIHN0YW5kYXJkIGBmb3IuLi5pbmAgYWxnb3JpdGhtLlxuICAgICAgICAgIGZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGlzRnVuY3Rpb24gPSBnZXRDbGFzcy5jYWxsKG9iamVjdCkgPT0gZnVuY3Rpb25DbGFzcywgcHJvcGVydHksIGlzQ29uc3RydWN0b3I7XG4gICAgICAgICAgICBmb3IgKHByb3BlcnR5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgICBpZiAoIShpc0Z1bmN0aW9uICYmIHByb3BlcnR5ID09IFwicHJvdG90eXBlXCIpICYmIGlzUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSAmJiAhKGlzQ29uc3RydWN0b3IgPSBwcm9wZXJ0eSA9PT0gXCJjb25zdHJ1Y3RvclwiKSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHByb3BlcnR5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTWFudWFsbHkgaW52b2tlIHRoZSBjYWxsYmFjayBmb3IgdGhlIGBjb25zdHJ1Y3RvcmAgcHJvcGVydHkgZHVlIHRvXG4gICAgICAgICAgICAvLyBjcm9zcy1lbnZpcm9ubWVudCBpbmNvbnNpc3RlbmNpZXMuXG4gICAgICAgICAgICBpZiAoaXNDb25zdHJ1Y3RvciB8fCBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LCAocHJvcGVydHkgPSBcImNvbnN0cnVjdG9yXCIpKSkge1xuICAgICAgICAgICAgICBjYWxsYmFjayhwcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm9yRWFjaChvYmplY3QsIGNhbGxiYWNrKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFB1YmxpYzogU2VyaWFsaXplcyBhIEphdmFTY3JpcHQgYHZhbHVlYCBhcyBhIEpTT04gc3RyaW5nLiBUaGUgb3B0aW9uYWxcbiAgICAgIC8vIGBmaWx0ZXJgIGFyZ3VtZW50IG1heSBzcGVjaWZ5IGVpdGhlciBhIGZ1bmN0aW9uIHRoYXQgYWx0ZXJzIGhvdyBvYmplY3QgYW5kXG4gICAgICAvLyBhcnJheSBtZW1iZXJzIGFyZSBzZXJpYWxpemVkLCBvciBhbiBhcnJheSBvZiBzdHJpbmdzIGFuZCBudW1iZXJzIHRoYXRcbiAgICAgIC8vIGluZGljYXRlcyB3aGljaCBwcm9wZXJ0aWVzIHNob3VsZCBiZSBzZXJpYWxpemVkLiBUaGUgb3B0aW9uYWwgYHdpZHRoYFxuICAgICAgLy8gYXJndW1lbnQgbWF5IGJlIGVpdGhlciBhIHN0cmluZyBvciBudW1iZXIgdGhhdCBzcGVjaWZpZXMgdGhlIGluZGVudGF0aW9uXG4gICAgICAvLyBsZXZlbCBvZiB0aGUgb3V0cHV0LlxuICAgICAgaWYgKCFoYXMoXCJqc29uLXN0cmluZ2lmeVwiKSkge1xuICAgICAgICAvLyBJbnRlcm5hbDogQSBtYXAgb2YgY29udHJvbCBjaGFyYWN0ZXJzIGFuZCB0aGVpciBlc2NhcGVkIGVxdWl2YWxlbnRzLlxuICAgICAgICB2YXIgRXNjYXBlcyA9IHtcbiAgICAgICAgICA5MjogXCJcXFxcXFxcXFwiLFxuICAgICAgICAgIDM0OiAnXFxcXFwiJyxcbiAgICAgICAgICA4OiBcIlxcXFxiXCIsXG4gICAgICAgICAgMTI6IFwiXFxcXGZcIixcbiAgICAgICAgICAxMDogXCJcXFxcblwiLFxuICAgICAgICAgIDEzOiBcIlxcXFxyXCIsXG4gICAgICAgICAgOTogXCJcXFxcdFwiXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IENvbnZlcnRzIGB2YWx1ZWAgaW50byBhIHplcm8tcGFkZGVkIHN0cmluZyBzdWNoIHRoYXQgaXRzXG4gICAgICAgIC8vIGxlbmd0aCBpcyBhdCBsZWFzdCBlcXVhbCB0byBgd2lkdGhgLiBUaGUgYHdpZHRoYCBtdXN0IGJlIDw9IDYuXG4gICAgICAgIHZhciBsZWFkaW5nWmVyb2VzID0gXCIwMDAwMDBcIjtcbiAgICAgICAgdmFyIHRvUGFkZGVkU3RyaW5nID0gZnVuY3Rpb24gKHdpZHRoLCB2YWx1ZSkge1xuICAgICAgICAgIC8vIFRoZSBgfHwgMGAgZXhwcmVzc2lvbiBpcyBuZWNlc3NhcnkgdG8gd29yayBhcm91bmQgYSBidWcgaW5cbiAgICAgICAgICAvLyBPcGVyYSA8PSA3LjU0dTIgd2hlcmUgYDAgPT0gLTBgLCBidXQgYFN0cmluZygtMCkgIT09IFwiMFwiYC5cbiAgICAgICAgICByZXR1cm4gKGxlYWRpbmdaZXJvZXMgKyAodmFsdWUgfHwgMCkpLnNsaWNlKC13aWR0aCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IERvdWJsZS1xdW90ZXMgYSBzdHJpbmcgYHZhbHVlYCwgcmVwbGFjaW5nIGFsbCBBU0NJSSBjb250cm9sXG4gICAgICAgIC8vIGNoYXJhY3RlcnMgKGNoYXJhY3RlcnMgd2l0aCBjb2RlIHVuaXQgdmFsdWVzIGJldHdlZW4gMCBhbmQgMzEpIHdpdGhcbiAgICAgICAgLy8gdGhlaXIgZXNjYXBlZCBlcXVpdmFsZW50cy4gVGhpcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGVcbiAgICAgICAgLy8gYFF1b3RlKHZhbHVlKWAgb3BlcmF0aW9uIGRlZmluZWQgaW4gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMy5cbiAgICAgICAgdmFyIHVuaWNvZGVQcmVmaXggPSBcIlxcXFx1MDBcIjtcbiAgICAgICAgdmFyIHF1b3RlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9ICdcIicsIGluZGV4ID0gMCwgbGVuZ3RoID0gdmFsdWUubGVuZ3RoLCB1c2VDaGFySW5kZXggPSAhY2hhckluZGV4QnVnZ3kgfHwgbGVuZ3RoID4gMTA7XG4gICAgICAgICAgdmFyIHN5bWJvbHMgPSB1c2VDaGFySW5kZXggJiYgKGNoYXJJbmRleEJ1Z2d5ID8gdmFsdWUuc3BsaXQoXCJcIikgOiB2YWx1ZSk7XG4gICAgICAgICAgZm9yICg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgY2hhckNvZGUgPSB2YWx1ZS5jaGFyQ29kZUF0KGluZGV4KTtcbiAgICAgICAgICAgIC8vIElmIHRoZSBjaGFyYWN0ZXIgaXMgYSBjb250cm9sIGNoYXJhY3RlciwgYXBwZW5kIGl0cyBVbmljb2RlIG9yXG4gICAgICAgICAgICAvLyBzaG9ydGhhbmQgZXNjYXBlIHNlcXVlbmNlOyBvdGhlcndpc2UsIGFwcGVuZCB0aGUgY2hhcmFjdGVyIGFzLWlzLlxuICAgICAgICAgICAgc3dpdGNoIChjaGFyQ29kZSkge1xuICAgICAgICAgICAgICBjYXNlIDg6IGNhc2UgOTogY2FzZSAxMDogY2FzZSAxMjogY2FzZSAxMzogY2FzZSAzNDogY2FzZSA5MjpcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gRXNjYXBlc1tjaGFyQ29kZV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlIDwgMzIpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSB1bmljb2RlUHJlZml4ICsgdG9QYWRkZWRTdHJpbmcoMiwgY2hhckNvZGUudG9TdHJpbmcoMTYpKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gdXNlQ2hhckluZGV4ID8gc3ltYm9sc1tpbmRleF0gOiB2YWx1ZS5jaGFyQXQoaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0ICsgJ1wiJztcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogUmVjdXJzaXZlbHkgc2VyaWFsaXplcyBhbiBvYmplY3QuIEltcGxlbWVudHMgdGhlXG4gICAgICAgIC8vIGBTdHIoa2V5LCBob2xkZXIpYCwgYEpPKHZhbHVlKWAsIGFuZCBgSkEodmFsdWUpYCBvcGVyYXRpb25zLlxuICAgICAgICB2YXIgc2VyaWFsaXplID0gZnVuY3Rpb24gKHByb3BlcnR5LCBvYmplY3QsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCB3aGl0ZXNwYWNlLCBpbmRlbnRhdGlvbiwgc3RhY2spIHtcbiAgICAgICAgICB2YXIgdmFsdWUsIGNsYXNzTmFtZSwgeWVhciwgbW9udGgsIGRhdGUsIHRpbWUsIGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNlY29uZHMsIHJlc3VsdHMsIGVsZW1lbnQsIGluZGV4LCBsZW5ndGgsIHByZWZpeCwgcmVzdWx0O1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBOZWNlc3NhcnkgZm9yIGhvc3Qgb2JqZWN0IHN1cHBvcnQuXG4gICAgICAgICAgICB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7fVxuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgY2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbCh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoY2xhc3NOYW1lID09IGRhdGVDbGFzcyAmJiAhaXNQcm9wZXJ0eS5jYWxsKHZhbHVlLCBcInRvSlNPTlwiKSkge1xuICAgICAgICAgICAgICBpZiAodmFsdWUgPiAtMSAvIDAgJiYgdmFsdWUgPCAxIC8gMCkge1xuICAgICAgICAgICAgICAgIC8vIERhdGVzIGFyZSBzZXJpYWxpemVkIGFjY29yZGluZyB0byB0aGUgYERhdGUjdG9KU09OYCBtZXRob2RcbiAgICAgICAgICAgICAgICAvLyBzcGVjaWZpZWQgaW4gRVMgNS4xIHNlY3Rpb24gMTUuOS41LjQ0LiBTZWUgc2VjdGlvbiAxNS45LjEuMTVcbiAgICAgICAgICAgICAgICAvLyBmb3IgdGhlIElTTyA4NjAxIGRhdGUgdGltZSBzdHJpbmcgZm9ybWF0LlxuICAgICAgICAgICAgICAgIGlmIChnZXREYXkpIHtcbiAgICAgICAgICAgICAgICAgIC8vIE1hbnVhbGx5IGNvbXB1dGUgdGhlIHllYXIsIG1vbnRoLCBkYXRlLCBob3VycywgbWludXRlcyxcbiAgICAgICAgICAgICAgICAgIC8vIHNlY29uZHMsIGFuZCBtaWxsaXNlY29uZHMgaWYgdGhlIGBnZXRVVEMqYCBtZXRob2RzIGFyZVxuICAgICAgICAgICAgICAgICAgLy8gYnVnZ3kuIEFkYXB0ZWQgZnJvbSBAWWFmZmxlJ3MgYGRhdGUtc2hpbWAgcHJvamVjdC5cbiAgICAgICAgICAgICAgICAgIGRhdGUgPSBmbG9vcih2YWx1ZSAvIDg2NGU1KTtcbiAgICAgICAgICAgICAgICAgIGZvciAoeWVhciA9IGZsb29yKGRhdGUgLyAzNjUuMjQyNSkgKyAxOTcwIC0gMTsgZ2V0RGF5KHllYXIgKyAxLCAwKSA8PSBkYXRlOyB5ZWFyKyspO1xuICAgICAgICAgICAgICAgICAgZm9yIChtb250aCA9IGZsb29yKChkYXRlIC0gZ2V0RGF5KHllYXIsIDApKSAvIDMwLjQyKTsgZ2V0RGF5KHllYXIsIG1vbnRoICsgMSkgPD0gZGF0ZTsgbW9udGgrKyk7XG4gICAgICAgICAgICAgICAgICBkYXRlID0gMSArIGRhdGUgLSBnZXREYXkoeWVhciwgbW9udGgpO1xuICAgICAgICAgICAgICAgICAgLy8gVGhlIGB0aW1lYCB2YWx1ZSBzcGVjaWZpZXMgdGhlIHRpbWUgd2l0aGluIHRoZSBkYXkgKHNlZSBFU1xuICAgICAgICAgICAgICAgICAgLy8gNS4xIHNlY3Rpb24gMTUuOS4xLjIpLiBUaGUgZm9ybXVsYSBgKEEgJSBCICsgQikgJSBCYCBpcyB1c2VkXG4gICAgICAgICAgICAgICAgICAvLyB0byBjb21wdXRlIGBBIG1vZHVsbyBCYCwgYXMgdGhlIGAlYCBvcGVyYXRvciBkb2VzIG5vdFxuICAgICAgICAgICAgICAgICAgLy8gY29ycmVzcG9uZCB0byB0aGUgYG1vZHVsb2Agb3BlcmF0aW9uIGZvciBuZWdhdGl2ZSBudW1iZXJzLlxuICAgICAgICAgICAgICAgICAgdGltZSA9ICh2YWx1ZSAlIDg2NGU1ICsgODY0ZTUpICUgODY0ZTU7XG4gICAgICAgICAgICAgICAgICAvLyBUaGUgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIGFuZCBtaWxsaXNlY29uZHMgYXJlIG9idGFpbmVkIGJ5XG4gICAgICAgICAgICAgICAgICAvLyBkZWNvbXBvc2luZyB0aGUgdGltZSB3aXRoaW4gdGhlIGRheS4gU2VlIHNlY3Rpb24gMTUuOS4xLjEwLlxuICAgICAgICAgICAgICAgICAgaG91cnMgPSBmbG9vcih0aW1lIC8gMzZlNSkgJSAyNDtcbiAgICAgICAgICAgICAgICAgIG1pbnV0ZXMgPSBmbG9vcih0aW1lIC8gNmU0KSAlIDYwO1xuICAgICAgICAgICAgICAgICAgc2Vjb25kcyA9IGZsb29yKHRpbWUgLyAxZTMpICUgNjA7XG4gICAgICAgICAgICAgICAgICBtaWxsaXNlY29uZHMgPSB0aW1lICUgMWUzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB5ZWFyID0gdmFsdWUuZ2V0VVRDRnVsbFllYXIoKTtcbiAgICAgICAgICAgICAgICAgIG1vbnRoID0gdmFsdWUuZ2V0VVRDTW9udGgoKTtcbiAgICAgICAgICAgICAgICAgIGRhdGUgPSB2YWx1ZS5nZXRVVENEYXRlKCk7XG4gICAgICAgICAgICAgICAgICBob3VycyA9IHZhbHVlLmdldFVUQ0hvdXJzKCk7XG4gICAgICAgICAgICAgICAgICBtaW51dGVzID0gdmFsdWUuZ2V0VVRDTWludXRlcygpO1xuICAgICAgICAgICAgICAgICAgc2Vjb25kcyA9IHZhbHVlLmdldFVUQ1NlY29uZHMoKTtcbiAgICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kcyA9IHZhbHVlLmdldFVUQ01pbGxpc2Vjb25kcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTZXJpYWxpemUgZXh0ZW5kZWQgeWVhcnMgY29ycmVjdGx5LlxuICAgICAgICAgICAgICAgIHZhbHVlID0gKHllYXIgPD0gMCB8fCB5ZWFyID49IDFlNCA/ICh5ZWFyIDwgMCA/IFwiLVwiIDogXCIrXCIpICsgdG9QYWRkZWRTdHJpbmcoNiwgeWVhciA8IDAgPyAteWVhciA6IHllYXIpIDogdG9QYWRkZWRTdHJpbmcoNCwgeWVhcikpICtcbiAgICAgICAgICAgICAgICAgIFwiLVwiICsgdG9QYWRkZWRTdHJpbmcoMiwgbW9udGggKyAxKSArIFwiLVwiICsgdG9QYWRkZWRTdHJpbmcoMiwgZGF0ZSkgK1xuICAgICAgICAgICAgICAgICAgLy8gTW9udGhzLCBkYXRlcywgaG91cnMsIG1pbnV0ZXMsIGFuZCBzZWNvbmRzIHNob3VsZCBoYXZlIHR3b1xuICAgICAgICAgICAgICAgICAgLy8gZGlnaXRzOyBtaWxsaXNlY29uZHMgc2hvdWxkIGhhdmUgdGhyZWUuXG4gICAgICAgICAgICAgICAgICBcIlRcIiArIHRvUGFkZGVkU3RyaW5nKDIsIGhvdXJzKSArIFwiOlwiICsgdG9QYWRkZWRTdHJpbmcoMiwgbWludXRlcykgKyBcIjpcIiArIHRvUGFkZGVkU3RyaW5nKDIsIHNlY29uZHMpICtcbiAgICAgICAgICAgICAgICAgIC8vIE1pbGxpc2Vjb25kcyBhcmUgb3B0aW9uYWwgaW4gRVMgNS4wLCBidXQgcmVxdWlyZWQgaW4gNS4xLlxuICAgICAgICAgICAgICAgICAgXCIuXCIgKyB0b1BhZGRlZFN0cmluZygzLCBtaWxsaXNlY29uZHMpICsgXCJaXCI7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZS50b0pTT04gPT0gXCJmdW5jdGlvblwiICYmICgoY2xhc3NOYW1lICE9IG51bWJlckNsYXNzICYmIGNsYXNzTmFtZSAhPSBzdHJpbmdDbGFzcyAmJiBjbGFzc05hbWUgIT0gYXJyYXlDbGFzcykgfHwgaXNQcm9wZXJ0eS5jYWxsKHZhbHVlLCBcInRvSlNPTlwiKSkpIHtcbiAgICAgICAgICAgICAgLy8gUHJvdG90eXBlIDw9IDEuNi4xIGFkZHMgbm9uLXN0YW5kYXJkIGB0b0pTT05gIG1ldGhvZHMgdG8gdGhlXG4gICAgICAgICAgICAgIC8vIGBOdW1iZXJgLCBgU3RyaW5nYCwgYERhdGVgLCBhbmQgYEFycmF5YCBwcm90b3R5cGVzLiBKU09OIDNcbiAgICAgICAgICAgICAgLy8gaWdub3JlcyBhbGwgYHRvSlNPTmAgbWV0aG9kcyBvbiB0aGVzZSBvYmplY3RzIHVubGVzcyB0aGV5IGFyZVxuICAgICAgICAgICAgICAvLyBkZWZpbmVkIGRpcmVjdGx5IG9uIGFuIGluc3RhbmNlLlxuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTihwcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgLy8gSWYgYSByZXBsYWNlbWVudCBmdW5jdGlvbiB3YXMgcHJvdmlkZWQsIGNhbGwgaXQgdG8gb2J0YWluIHRoZSB2YWx1ZVxuICAgICAgICAgICAgLy8gZm9yIHNlcmlhbGl6YXRpb24uXG4gICAgICAgICAgICB2YWx1ZSA9IGNhbGxiYWNrLmNhbGwob2JqZWN0LCBwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbCh2YWx1ZSk7XG4gICAgICAgICAgaWYgKGNsYXNzTmFtZSA9PSBib29sZWFuQ2xhc3MpIHtcbiAgICAgICAgICAgIC8vIEJvb2xlYW5zIGFyZSByZXByZXNlbnRlZCBsaXRlcmFsbHkuXG4gICAgICAgICAgICByZXR1cm4gXCJcIiArIHZhbHVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lID09IG51bWJlckNsYXNzKSB7XG4gICAgICAgICAgICAvLyBKU09OIG51bWJlcnMgbXVzdCBiZSBmaW5pdGUuIGBJbmZpbml0eWAgYW5kIGBOYU5gIGFyZSBzZXJpYWxpemVkIGFzXG4gICAgICAgICAgICAvLyBgXCJudWxsXCJgLlxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gLTEgLyAwICYmIHZhbHVlIDwgMSAvIDAgPyBcIlwiICsgdmFsdWUgOiBcIm51bGxcIjtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNsYXNzTmFtZSA9PSBzdHJpbmdDbGFzcykge1xuICAgICAgICAgICAgLy8gU3RyaW5ncyBhcmUgZG91YmxlLXF1b3RlZCBhbmQgZXNjYXBlZC5cbiAgICAgICAgICAgIHJldHVybiBxdW90ZShcIlwiICsgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZWN1cnNpdmVseSBzZXJpYWxpemUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGlzIGlzIGEgbGluZWFyIHNlYXJjaDsgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgIC8vIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZiB1bmlxdWUgbmVzdGVkIG9iamVjdHMuXG4gICAgICAgICAgICBmb3IgKGxlbmd0aCA9IHN0YWNrLmxlbmd0aDsgbGVuZ3RoLS07KSB7XG4gICAgICAgICAgICAgIGlmIChzdGFja1tsZW5ndGhdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIEN5Y2xpYyBzdHJ1Y3R1cmVzIGNhbm5vdCBiZSBzZXJpYWxpemVkIGJ5IGBKU09OLnN0cmluZ2lmeWAuXG4gICAgICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEFkZCB0aGUgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICAgICAgICAgIHN0YWNrLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgY3VycmVudCBpbmRlbnRhdGlvbiBsZXZlbCBhbmQgaW5kZW50IG9uZSBhZGRpdGlvbmFsIGxldmVsLlxuICAgICAgICAgICAgcHJlZml4ID0gaW5kZW50YXRpb247XG4gICAgICAgICAgICBpbmRlbnRhdGlvbiArPSB3aGl0ZXNwYWNlO1xuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSA9PSBhcnJheUNsYXNzKSB7XG4gICAgICAgICAgICAgIC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBhcnJheSBlbGVtZW50cy5cbiAgICAgICAgICAgICAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gc2VyaWFsaXplKGluZGV4LCB2YWx1ZSwgY2FsbGJhY2ssIHByb3BlcnRpZXMsIHdoaXRlc3BhY2UsIGluZGVudGF0aW9uLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGVsZW1lbnQgPT09IHVuZGVmID8gXCJudWxsXCIgOiBlbGVtZW50KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHRzLmxlbmd0aCA/ICh3aGl0ZXNwYWNlID8gXCJbXFxuXCIgKyBpbmRlbnRhdGlvbiArIHJlc3VsdHMuam9pbihcIixcXG5cIiArIGluZGVudGF0aW9uKSArIFwiXFxuXCIgKyBwcmVmaXggKyBcIl1cIiA6IChcIltcIiArIHJlc3VsdHMuam9pbihcIixcIikgKyBcIl1cIikpIDogXCJbXVwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gUmVjdXJzaXZlbHkgc2VyaWFsaXplIG9iamVjdCBtZW1iZXJzLiBNZW1iZXJzIGFyZSBzZWxlY3RlZCBmcm9tXG4gICAgICAgICAgICAgIC8vIGVpdGhlciBhIHVzZXItc3BlY2lmaWVkIGxpc3Qgb2YgcHJvcGVydHkgbmFtZXMsIG9yIHRoZSBvYmplY3RcbiAgICAgICAgICAgICAgLy8gaXRzZWxmLlxuICAgICAgICAgICAgICBmb3JFYWNoKHByb3BlcnRpZXMgfHwgdmFsdWUsIGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gc2VyaWFsaXplKHByb3BlcnR5LCB2YWx1ZSwgY2FsbGJhY2ssIHByb3BlcnRpZXMsIHdoaXRlc3BhY2UsIGluZGVudGF0aW9uLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQgIT09IHVuZGVmKSB7XG4gICAgICAgICAgICAgICAgICAvLyBBY2NvcmRpbmcgdG8gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMzogXCJJZiBgZ2FwYCB7d2hpdGVzcGFjZX1cbiAgICAgICAgICAgICAgICAgIC8vIGlzIG5vdCB0aGUgZW1wdHkgc3RyaW5nLCBsZXQgYG1lbWJlcmAge3F1b3RlKHByb3BlcnR5KSArIFwiOlwifVxuICAgICAgICAgICAgICAgICAgLy8gYmUgdGhlIGNvbmNhdGVuYXRpb24gb2YgYG1lbWJlcmAgYW5kIHRoZSBgc3BhY2VgIGNoYXJhY3Rlci5cIlxuICAgICAgICAgICAgICAgICAgLy8gVGhlIFwiYHNwYWNlYCBjaGFyYWN0ZXJcIiByZWZlcnMgdG8gdGhlIGxpdGVyYWwgc3BhY2VcbiAgICAgICAgICAgICAgICAgIC8vIGNoYXJhY3Rlciwgbm90IHRoZSBgc3BhY2VgIHt3aWR0aH0gYXJndW1lbnQgcHJvdmlkZWQgdG9cbiAgICAgICAgICAgICAgICAgIC8vIGBKU09OLnN0cmluZ2lmeWAuXG4gICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocXVvdGUocHJvcGVydHkpICsgXCI6XCIgKyAod2hpdGVzcGFjZSA/IFwiIFwiIDogXCJcIikgKyBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHRzLmxlbmd0aCA/ICh3aGl0ZXNwYWNlID8gXCJ7XFxuXCIgKyBpbmRlbnRhdGlvbiArIHJlc3VsdHMuam9pbihcIixcXG5cIiArIGluZGVudGF0aW9uKSArIFwiXFxuXCIgKyBwcmVmaXggKyBcIn1cIiA6IChcIntcIiArIHJlc3VsdHMuam9pbihcIixcIikgKyBcIn1cIikpIDogXCJ7fVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBvYmplY3QgZnJvbSB0aGUgdHJhdmVyc2VkIG9iamVjdCBzdGFjay5cbiAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUHVibGljOiBgSlNPTi5zdHJpbmdpZnlgLiBTZWUgRVMgNS4xIHNlY3Rpb24gMTUuMTIuMy5cbiAgICAgICAgZXhwb3J0cy5zdHJpbmdpZnkgPSBmdW5jdGlvbiAoc291cmNlLCBmaWx0ZXIsIHdpZHRoKSB7XG4gICAgICAgICAgdmFyIHdoaXRlc3BhY2UsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCBjbGFzc05hbWU7XG4gICAgICAgICAgaWYgKG9iamVjdFR5cGVzW3R5cGVvZiBmaWx0ZXJdICYmIGZpbHRlcikge1xuICAgICAgICAgICAgaWYgKChjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKGZpbHRlcikpID09IGZ1bmN0aW9uQ2xhc3MpIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2sgPSBmaWx0ZXI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNsYXNzTmFtZSA9PSBhcnJheUNsYXNzKSB7XG4gICAgICAgICAgICAgIC8vIENvbnZlcnQgdGhlIHByb3BlcnR5IG5hbWVzIGFycmF5IGludG8gYSBtYWtlc2hpZnQgc2V0LlxuICAgICAgICAgICAgICBwcm9wZXJ0aWVzID0ge307XG4gICAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMCwgbGVuZ3RoID0gZmlsdGVyLmxlbmd0aCwgdmFsdWU7IGluZGV4IDwgbGVuZ3RoOyB2YWx1ZSA9IGZpbHRlcltpbmRleCsrXSwgKChjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHZhbHVlKSksIGNsYXNzTmFtZSA9PSBzdHJpbmdDbGFzcyB8fCBjbGFzc05hbWUgPT0gbnVtYmVyQ2xhc3MpICYmIChwcm9wZXJ0aWVzW3ZhbHVlXSA9IDEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHdpZHRoKSB7XG4gICAgICAgICAgICBpZiAoKGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwod2lkdGgpKSA9PSBudW1iZXJDbGFzcykge1xuICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBgd2lkdGhgIHRvIGFuIGludGVnZXIgYW5kIGNyZWF0ZSBhIHN0cmluZyBjb250YWluaW5nXG4gICAgICAgICAgICAgIC8vIGB3aWR0aGAgbnVtYmVyIG9mIHNwYWNlIGNoYXJhY3RlcnMuXG4gICAgICAgICAgICAgIGlmICgod2lkdGggLT0gd2lkdGggJSAxKSA+IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKHdoaXRlc3BhY2UgPSBcIlwiLCB3aWR0aCA+IDEwICYmICh3aWR0aCA9IDEwKTsgd2hpdGVzcGFjZS5sZW5ndGggPCB3aWR0aDsgd2hpdGVzcGFjZSArPSBcIiBcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzKSB7XG4gICAgICAgICAgICAgIHdoaXRlc3BhY2UgPSB3aWR0aC5sZW5ndGggPD0gMTAgPyB3aWR0aCA6IHdpZHRoLnNsaWNlKDAsIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gT3BlcmEgPD0gNy41NHUyIGRpc2NhcmRzIHRoZSB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIGVtcHR5IHN0cmluZyBrZXlzXG4gICAgICAgICAgLy8gKGBcIlwiYCkgb25seSBpZiB0aGV5IGFyZSB1c2VkIGRpcmVjdGx5IHdpdGhpbiBhbiBvYmplY3QgbWVtYmVyIGxpc3RcbiAgICAgICAgICAvLyAoZS5nLiwgYCEoXCJcIiBpbiB7IFwiXCI6IDF9KWApLlxuICAgICAgICAgIHJldHVybiBzZXJpYWxpemUoXCJcIiwgKHZhbHVlID0ge30sIHZhbHVlW1wiXCJdID0gc291cmNlLCB2YWx1ZSksIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCB3aGl0ZXNwYWNlLCBcIlwiLCBbXSk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIFB1YmxpYzogUGFyc2VzIGEgSlNPTiBzb3VyY2Ugc3RyaW5nLlxuICAgICAgaWYgKCFoYXMoXCJqc29uLXBhcnNlXCIpKSB7XG4gICAgICAgIHZhciBmcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG4gICAgICAgIC8vIEludGVybmFsOiBBIG1hcCBvZiBlc2NhcGVkIGNvbnRyb2wgY2hhcmFjdGVycyBhbmQgdGhlaXIgdW5lc2NhcGVkXG4gICAgICAgIC8vIGVxdWl2YWxlbnRzLlxuICAgICAgICB2YXIgVW5lc2NhcGVzID0ge1xuICAgICAgICAgIDkyOiBcIlxcXFxcIixcbiAgICAgICAgICAzNDogJ1wiJyxcbiAgICAgICAgICA0NzogXCIvXCIsXG4gICAgICAgICAgOTg6IFwiXFxiXCIsXG4gICAgICAgICAgMTE2OiBcIlxcdFwiLFxuICAgICAgICAgIDExMDogXCJcXG5cIixcbiAgICAgICAgICAxMDI6IFwiXFxmXCIsXG4gICAgICAgICAgMTE0OiBcIlxcclwiXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFN0b3JlcyB0aGUgcGFyc2VyIHN0YXRlLlxuICAgICAgICB2YXIgSW5kZXgsIFNvdXJjZTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogUmVzZXRzIHRoZSBwYXJzZXIgc3RhdGUgYW5kIHRocm93cyBhIGBTeW50YXhFcnJvcmAuXG4gICAgICAgIHZhciBhYm9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBJbmRleCA9IFNvdXJjZSA9IG51bGw7XG4gICAgICAgICAgdGhyb3cgU3ludGF4RXJyb3IoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogUmV0dXJucyB0aGUgbmV4dCB0b2tlbiwgb3IgYFwiJFwiYCBpZiB0aGUgcGFyc2VyIGhhcyByZWFjaGVkXG4gICAgICAgIC8vIHRoZSBlbmQgb2YgdGhlIHNvdXJjZSBzdHJpbmcuIEEgdG9rZW4gbWF5IGJlIGEgc3RyaW5nLCBudW1iZXIsIGBudWxsYFxuICAgICAgICAvLyBsaXRlcmFsLCBvciBCb29sZWFuIGxpdGVyYWwuXG4gICAgICAgIHZhciBsZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIHNvdXJjZSA9IFNvdXJjZSwgbGVuZ3RoID0gc291cmNlLmxlbmd0aCwgdmFsdWUsIGJlZ2luLCBwb3NpdGlvbiwgaXNTaWduZWQsIGNoYXJDb2RlO1xuICAgICAgICAgIHdoaWxlIChJbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICBzd2l0Y2ggKGNoYXJDb2RlKSB7XG4gICAgICAgICAgICAgIGNhc2UgOTogY2FzZSAxMDogY2FzZSAxMzogY2FzZSAzMjpcbiAgICAgICAgICAgICAgICAvLyBTa2lwIHdoaXRlc3BhY2UgdG9rZW5zLCBpbmNsdWRpbmcgdGFicywgY2FycmlhZ2UgcmV0dXJucywgbGluZVxuICAgICAgICAgICAgICAgIC8vIGZlZWRzLCBhbmQgc3BhY2UgY2hhcmFjdGVycy5cbiAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIDEyMzogY2FzZSAxMjU6IGNhc2UgOTE6IGNhc2UgOTM6IGNhc2UgNTg6IGNhc2UgNDQ6XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgYSBwdW5jdHVhdG9yIHRva2VuIChge2AsIGB9YCwgYFtgLCBgXWAsIGA6YCwgb3IgYCxgKSBhdFxuICAgICAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IHBvc2l0aW9uLlxuICAgICAgICAgICAgICAgIHZhbHVlID0gY2hhckluZGV4QnVnZ3kgPyBzb3VyY2UuY2hhckF0KEluZGV4KSA6IHNvdXJjZVtJbmRleF07XG4gICAgICAgICAgICAgICAgSW5kZXgrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgIGNhc2UgMzQ6XG4gICAgICAgICAgICAgICAgLy8gYFwiYCBkZWxpbWl0cyBhIEpTT04gc3RyaW5nOyBhZHZhbmNlIHRvIHRoZSBuZXh0IGNoYXJhY3RlciBhbmRcbiAgICAgICAgICAgICAgICAvLyBiZWdpbiBwYXJzaW5nIHRoZSBzdHJpbmcuIFN0cmluZyB0b2tlbnMgYXJlIHByZWZpeGVkIHdpdGggdGhlXG4gICAgICAgICAgICAgICAgLy8gc2VudGluZWwgYEBgIGNoYXJhY3RlciB0byBkaXN0aW5ndWlzaCB0aGVtIGZyb20gcHVuY3R1YXRvcnMgYW5kXG4gICAgICAgICAgICAgICAgLy8gZW5kLW9mLXN0cmluZyB0b2tlbnMuXG4gICAgICAgICAgICAgICAgZm9yICh2YWx1ZSA9IFwiQFwiLCBJbmRleCsrOyBJbmRleCA8IGxlbmd0aDspIHtcbiAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlIDwgMzIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVW5lc2NhcGVkIEFTQ0lJIGNvbnRyb2wgY2hhcmFjdGVycyAodGhvc2Ugd2l0aCBhIGNvZGUgdW5pdFxuICAgICAgICAgICAgICAgICAgICAvLyBsZXNzIHRoYW4gdGhlIHNwYWNlIGNoYXJhY3RlcikgYXJlIG5vdCBwZXJtaXR0ZWQuXG4gICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoYXJDb2RlID09IDkyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcmV2ZXJzZSBzb2xpZHVzIChgXFxgKSBtYXJrcyB0aGUgYmVnaW5uaW5nIG9mIGFuIGVzY2FwZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gY29udHJvbCBjaGFyYWN0ZXIgKGluY2x1ZGluZyBgXCJgLCBgXFxgLCBhbmQgYC9gKSBvciBVbmljb2RlXG4gICAgICAgICAgICAgICAgICAgIC8vIGVzY2FwZSBzZXF1ZW5jZS5cbiAgICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdCgrK0luZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChjaGFyQ29kZSkge1xuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgOTI6IGNhc2UgMzQ6IGNhc2UgNDc6IGNhc2UgOTg6IGNhc2UgMTE2OiBjYXNlIDExMDogY2FzZSAxMDI6IGNhc2UgMTE0OlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmV2aXZlIGVzY2FwZWQgY29udHJvbCBjaGFyYWN0ZXJzLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gVW5lc2NhcGVzW2NoYXJDb2RlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIDExNzpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGBcXHVgIG1hcmtzIHRoZSBiZWdpbm5pbmcgb2YgYSBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkdmFuY2UgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBhbmQgdmFsaWRhdGUgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3VyLWRpZ2l0IGNvZGUgcG9pbnQuXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWdpbiA9ICsrSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHBvc2l0aW9uID0gSW5kZXggKyA0OyBJbmRleCA8IHBvc2l0aW9uOyBJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBIHZhbGlkIHNlcXVlbmNlIGNvbXByaXNlcyBmb3VyIGhleGRpZ2l0cyAoY2FzZS1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW5zZW5zaXRpdmUpIHRoYXQgZm9ybSBhIHNpbmdsZSBoZXhhZGVjaW1hbCB2YWx1ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcgfHwgY2hhckNvZGUgPj0gOTcgJiYgY2hhckNvZGUgPD0gMTAyIHx8IGNoYXJDb2RlID49IDY1ICYmIGNoYXJDb2RlIDw9IDcwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEludmFsaWQgVW5pY29kZSBlc2NhcGUgc2VxdWVuY2UuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmV2aXZlIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlICs9IGZyb21DaGFyQ29kZShcIjB4XCIgKyBzb3VyY2Uuc2xpY2UoYmVnaW4sIEluZGV4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW52YWxpZCBlc2NhcGUgc2VxdWVuY2UuXG4gICAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gMzQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiB1bmVzY2FwZWQgZG91YmxlLXF1b3RlIGNoYXJhY3RlciBtYXJrcyB0aGUgZW5kIG9mIHRoZVxuICAgICAgICAgICAgICAgICAgICAgIC8vIHN0cmluZy5cbiAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgYmVnaW4gPSBJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgLy8gT3B0aW1pemUgZm9yIHRoZSBjb21tb24gY2FzZSB3aGVyZSBhIHN0cmluZyBpcyB2YWxpZC5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGNoYXJDb2RlID49IDMyICYmIGNoYXJDb2RlICE9IDkyICYmIGNoYXJDb2RlICE9IDM0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdCgrK0luZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBBcHBlbmQgdGhlIHN0cmluZyBhcy1pcy5cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gc291cmNlLnNsaWNlKGJlZ2luLCBJbmRleCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuY2hhckNvZGVBdChJbmRleCkgPT0gMzQpIHtcbiAgICAgICAgICAgICAgICAgIC8vIEFkdmFuY2UgdG8gdGhlIG5leHQgY2hhcmFjdGVyIGFuZCByZXR1cm4gdGhlIHJldml2ZWQgc3RyaW5nLlxuICAgICAgICAgICAgICAgICAgSW5kZXgrKztcbiAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVW50ZXJtaW5hdGVkIHN0cmluZy5cbiAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIFBhcnNlIG51bWJlcnMgYW5kIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgIGJlZ2luID0gSW5kZXg7XG4gICAgICAgICAgICAgICAgLy8gQWR2YW5jZSBwYXN0IHRoZSBuZWdhdGl2ZSBzaWduLCBpZiBvbmUgaXMgc3BlY2lmaWVkLlxuICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSA0NSkge1xuICAgICAgICAgICAgICAgICAgaXNTaWduZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdCgrK0luZGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgYW4gaW50ZWdlciBvciBmbG9hdGluZy1wb2ludCB2YWx1ZS5cbiAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpIHtcbiAgICAgICAgICAgICAgICAgIC8vIExlYWRpbmcgemVyb2VzIGFyZSBpbnRlcnByZXRlZCBhcyBvY3RhbCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSA0OCAmJiAoKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXggKyAxKSksIGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbGxlZ2FsIG9jdGFsIGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpc1NpZ25lZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhlIGludGVnZXIgY29tcG9uZW50LlxuICAgICAgICAgICAgICAgICAgZm9yICg7IEluZGV4IDwgbGVuZ3RoICYmICgoY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCkpLCBjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nyk7IEluZGV4KyspO1xuICAgICAgICAgICAgICAgICAgLy8gRmxvYXRzIGNhbm5vdCBjb250YWluIGEgbGVhZGluZyBkZWNpbWFsIHBvaW50OyBob3dldmVyLCB0aGlzXG4gICAgICAgICAgICAgICAgICAvLyBjYXNlIGlzIGFscmVhZHkgYWNjb3VudGVkIGZvciBieSB0aGUgcGFyc2VyLlxuICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KSA9PSA0Nikge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbiA9ICsrSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIC8vIFBhcnNlIHRoZSBkZWNpbWFsIGNvbXBvbmVudC5cbiAgICAgICAgICAgICAgICAgICAgZm9yICg7IHBvc2l0aW9uIDwgbGVuZ3RoICYmICgoY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChwb3NpdGlvbikpLCBjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nyk7IHBvc2l0aW9uKyspO1xuICAgICAgICAgICAgICAgICAgICBpZiAocG9zaXRpb24gPT0gSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBJbGxlZ2FsIHRyYWlsaW5nIGRlY2ltYWwuXG4gICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBJbmRleCA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLy8gUGFyc2UgZXhwb25lbnRzLiBUaGUgYGVgIGRlbm90aW5nIHRoZSBleHBvbmVudCBpc1xuICAgICAgICAgICAgICAgICAgLy8gY2FzZS1pbnNlbnNpdGl2ZS5cbiAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDEwMSB8fCBjaGFyQ29kZSA9PSA2OSkge1xuICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBTa2lwIHBhc3QgdGhlIHNpZ24gZm9sbG93aW5nIHRoZSBleHBvbmVudCwgaWYgb25lIGlzXG4gICAgICAgICAgICAgICAgICAgIC8vIHNwZWNpZmllZC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDQzIHx8IGNoYXJDb2RlID09IDQ1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgSW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBQYXJzZSB0aGUgZXhwb25lbnRpYWwgY29tcG9uZW50LlxuICAgICAgICAgICAgICAgICAgICBmb3IgKHBvc2l0aW9uID0gSW5kZXg7IHBvc2l0aW9uIDwgbGVuZ3RoICYmICgoY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChwb3NpdGlvbikpLCBjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nyk7IHBvc2l0aW9uKyspO1xuICAgICAgICAgICAgICAgICAgICBpZiAocG9zaXRpb24gPT0gSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBJbGxlZ2FsIGVtcHR5IGV4cG9uZW50LlxuICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgSW5kZXggPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8vIENvZXJjZSB0aGUgcGFyc2VkIHZhbHVlIHRvIGEgSmF2YVNjcmlwdCBudW1iZXIuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gK3NvdXJjZS5zbGljZShiZWdpbiwgSW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBIG5lZ2F0aXZlIHNpZ24gbWF5IG9ubHkgcHJlY2VkZSBudW1iZXJzLlxuICAgICAgICAgICAgICAgIGlmIChpc1NpZ25lZCkge1xuICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gYHRydWVgLCBgZmFsc2VgLCBhbmQgYG51bGxgIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgIGlmIChzb3VyY2Uuc2xpY2UoSW5kZXgsIEluZGV4ICsgNCkgPT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgICAgICAgIEluZGV4ICs9IDQ7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZS5zbGljZShJbmRleCwgSW5kZXggKyA1KSA9PSBcImZhbHNlXCIpIHtcbiAgICAgICAgICAgICAgICAgIEluZGV4ICs9IDU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2Uuc2xpY2UoSW5kZXgsIEluZGV4ICsgNCkgPT0gXCJudWxsXCIpIHtcbiAgICAgICAgICAgICAgICAgIEluZGV4ICs9IDQ7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVW5yZWNvZ25pemVkIHRva2VuLlxuICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFJldHVybiB0aGUgc2VudGluZWwgYCRgIGNoYXJhY3RlciBpZiB0aGUgcGFyc2VyIGhhcyByZWFjaGVkIHRoZSBlbmRcbiAgICAgICAgICAvLyBvZiB0aGUgc291cmNlIHN0cmluZy5cbiAgICAgICAgICByZXR1cm4gXCIkXCI7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFBhcnNlcyBhIEpTT04gYHZhbHVlYCB0b2tlbi5cbiAgICAgICAgdmFyIGdldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIHZhciByZXN1bHRzLCBoYXNNZW1iZXJzO1xuICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIiRcIikge1xuICAgICAgICAgICAgLy8gVW5leHBlY3RlZCBlbmQgb2YgaW5wdXQuXG4gICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGlmICgoY2hhckluZGV4QnVnZ3kgPyB2YWx1ZS5jaGFyQXQoMCkgOiB2YWx1ZVswXSkgPT0gXCJAXCIpIHtcbiAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBzZW50aW5lbCBgQGAgY2hhcmFjdGVyLlxuICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuc2xpY2UoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQYXJzZSBvYmplY3QgYW5kIGFycmF5IGxpdGVyYWxzLlxuICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiW1wiKSB7XG4gICAgICAgICAgICAgIC8vIFBhcnNlcyBhIEpTT04gYXJyYXksIHJldHVybmluZyBhIG5ldyBKYXZhU2NyaXB0IGFycmF5LlxuICAgICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgIGZvciAoOzsgaGFzTWVtYmVycyB8fCAoaGFzTWVtYmVycyA9IHRydWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBsZXgoKTtcbiAgICAgICAgICAgICAgICAvLyBBIGNsb3Npbmcgc3F1YXJlIGJyYWNrZXQgbWFya3MgdGhlIGVuZCBvZiB0aGUgYXJyYXkgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJdXCIpIHtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgYXJyYXkgbGl0ZXJhbCBjb250YWlucyBlbGVtZW50cywgdGhlIGN1cnJlbnQgdG9rZW5cbiAgICAgICAgICAgICAgICAvLyBzaG91bGQgYmUgYSBjb21tYSBzZXBhcmF0aW5nIHRoZSBwcmV2aW91cyBlbGVtZW50IGZyb20gdGhlXG4gICAgICAgICAgICAgICAgLy8gbmV4dC5cbiAgICAgICAgICAgICAgICBpZiAoaGFzTWVtYmVycykge1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiLFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbGV4KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIl1cIikge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFVuZXhwZWN0ZWQgdHJhaWxpbmcgYCxgIGluIGFycmF5IGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBgLGAgbXVzdCBzZXBhcmF0ZSBlYWNoIGFycmF5IGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEVsaXNpb25zIGFuZCBsZWFkaW5nIGNvbW1hcyBhcmUgbm90IHBlcm1pdHRlZC5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIpIHtcbiAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChnZXQodmFsdWUpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT0gXCJ7XCIpIHtcbiAgICAgICAgICAgICAgLy8gUGFyc2VzIGEgSlNPTiBvYmplY3QsIHJldHVybmluZyBhIG5ldyBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAgICAgICAgICAgcmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICBmb3IgKDs7IGhhc01lbWJlcnMgfHwgKGhhc01lbWJlcnMgPSB0cnVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbGV4KCk7XG4gICAgICAgICAgICAgICAgLy8gQSBjbG9zaW5nIGN1cmx5IGJyYWNlIG1hcmtzIHRoZSBlbmQgb2YgdGhlIG9iamVjdCBsaXRlcmFsLlxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIn1cIikge1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBvYmplY3QgbGl0ZXJhbCBjb250YWlucyBtZW1iZXJzLCB0aGUgY3VycmVudCB0b2tlblxuICAgICAgICAgICAgICAgIC8vIHNob3VsZCBiZSBhIGNvbW1hIHNlcGFyYXRvci5cbiAgICAgICAgICAgICAgICBpZiAoaGFzTWVtYmVycykge1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiLFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbGV4KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIn1cIikge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFVuZXhwZWN0ZWQgdHJhaWxpbmcgYCxgIGluIG9iamVjdCBsaXRlcmFsLlxuICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgYCxgIG11c3Qgc2VwYXJhdGUgZWFjaCBvYmplY3QgbWVtYmVyLlxuICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBMZWFkaW5nIGNvbW1hcyBhcmUgbm90IHBlcm1pdHRlZCwgb2JqZWN0IHByb3BlcnR5IG5hbWVzIG11c3QgYmVcbiAgICAgICAgICAgICAgICAvLyBkb3VibGUtcXVvdGVkIHN0cmluZ3MsIGFuZCBhIGA6YCBtdXN0IHNlcGFyYXRlIGVhY2ggcHJvcGVydHlcbiAgICAgICAgICAgICAgICAvLyBuYW1lIGFuZCB2YWx1ZS5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIgfHwgdHlwZW9mIHZhbHVlICE9IFwic3RyaW5nXCIgfHwgKGNoYXJJbmRleEJ1Z2d5ID8gdmFsdWUuY2hhckF0KDApIDogdmFsdWVbMF0pICE9IFwiQFwiIHx8IGxleCgpICE9IFwiOlwiKSB7XG4gICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzW3ZhbHVlLnNsaWNlKDEpXSA9IGdldChsZXgoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBVbmV4cGVjdGVkIHRva2VuIGVuY291bnRlcmVkLlxuICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBVcGRhdGVzIGEgdHJhdmVyc2VkIG9iamVjdCBtZW1iZXIuXG4gICAgICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoc291cmNlLCBwcm9wZXJ0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICB2YXIgZWxlbWVudCA9IHdhbGsoc291cmNlLCBwcm9wZXJ0eSwgY2FsbGJhY2spO1xuICAgICAgICAgIGlmIChlbGVtZW50ID09PSB1bmRlZikge1xuICAgICAgICAgICAgZGVsZXRlIHNvdXJjZVtwcm9wZXJ0eV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNvdXJjZVtwcm9wZXJ0eV0gPSBlbGVtZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogUmVjdXJzaXZlbHkgdHJhdmVyc2VzIGEgcGFyc2VkIEpTT04gb2JqZWN0LCBpbnZva2luZyB0aGVcbiAgICAgICAgLy8gYGNhbGxiYWNrYCBmdW5jdGlvbiBmb3IgZWFjaCB2YWx1ZS4gVGhpcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGVcbiAgICAgICAgLy8gYFdhbGsoaG9sZGVyLCBuYW1lKWAgb3BlcmF0aW9uIGRlZmluZWQgaW4gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMi5cbiAgICAgICAgdmFyIHdhbGsgPSBmdW5jdGlvbiAoc291cmNlLCBwcm9wZXJ0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBzb3VyY2VbcHJvcGVydHldLCBsZW5ndGg7XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcIm9iamVjdFwiICYmIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBgZm9yRWFjaGAgY2FuJ3QgYmUgdXNlZCB0byB0cmF2ZXJzZSBhbiBhcnJheSBpbiBPcGVyYSA8PSA4LjU0XG4gICAgICAgICAgICAvLyBiZWNhdXNlIGl0cyBgT2JqZWN0I2hhc093blByb3BlcnR5YCBpbXBsZW1lbnRhdGlvbiByZXR1cm5zIGBmYWxzZWBcbiAgICAgICAgICAgIC8vIGZvciBhcnJheSBpbmRpY2VzIChlLmcuLCBgIVsxLCAyLCAzXS5oYXNPd25Qcm9wZXJ0eShcIjBcIilgKS5cbiAgICAgICAgICAgIGlmIChnZXRDbGFzcy5jYWxsKHZhbHVlKSA9PSBhcnJheUNsYXNzKSB7XG4gICAgICAgICAgICAgIGZvciAobGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBsZW5ndGgtLTspIHtcbiAgICAgICAgICAgICAgICB1cGRhdGUodmFsdWUsIGxlbmd0aCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBmb3JFYWNoKHZhbHVlLCBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICB1cGRhdGUodmFsdWUsIHByb3BlcnR5LCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbChzb3VyY2UsIHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUHVibGljOiBgSlNPTi5wYXJzZWAuIFNlZSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4yLlxuICAgICAgICBleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gKHNvdXJjZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICB2YXIgcmVzdWx0LCB2YWx1ZTtcbiAgICAgICAgICBJbmRleCA9IDA7XG4gICAgICAgICAgU291cmNlID0gXCJcIiArIHNvdXJjZTtcbiAgICAgICAgICByZXN1bHQgPSBnZXQobGV4KCkpO1xuICAgICAgICAgIC8vIElmIGEgSlNPTiBzdHJpbmcgY29udGFpbnMgbXVsdGlwbGUgdG9rZW5zLCBpdCBpcyBpbnZhbGlkLlxuICAgICAgICAgIGlmIChsZXgoKSAhPSBcIiRcIikge1xuICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmVzZXQgdGhlIHBhcnNlciBzdGF0ZS5cbiAgICAgICAgICBJbmRleCA9IFNvdXJjZSA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrICYmIGdldENsYXNzLmNhbGwoY2FsbGJhY2spID09IGZ1bmN0aW9uQ2xhc3MgPyB3YWxrKCh2YWx1ZSA9IHt9LCB2YWx1ZVtcIlwiXSA9IHJlc3VsdCwgdmFsdWUpLCBcIlwiLCBjYWxsYmFjaykgOiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0c1tcInJ1bkluQ29udGV4dFwiXSA9IHJ1bkluQ29udGV4dDtcbiAgICByZXR1cm4gZXhwb3J0cztcbiAgfVxuXG4gIGlmIChmcmVlRXhwb3J0cyAmJiAhaXNMb2FkZXIpIHtcbiAgICAvLyBFeHBvcnQgZm9yIENvbW1vbkpTIGVudmlyb25tZW50cy5cbiAgICBydW5JbkNvbnRleHQocm9vdCwgZnJlZUV4cG9ydHMpO1xuICB9IGVsc2Uge1xuICAgIC8vIEV4cG9ydCBmb3Igd2ViIGJyb3dzZXJzIGFuZCBKYXZhU2NyaXB0IGVuZ2luZXMuXG4gICAgdmFyIG5hdGl2ZUpTT04gPSByb290LkpTT04sXG4gICAgICAgIHByZXZpb3VzSlNPTiA9IHJvb3RbXCJKU09OM1wiXSxcbiAgICAgICAgaXNSZXN0b3JlZCA9IGZhbHNlO1xuXG4gICAgdmFyIEpTT04zID0gcnVuSW5Db250ZXh0KHJvb3QsIChyb290W1wiSlNPTjNcIl0gPSB7XG4gICAgICAvLyBQdWJsaWM6IFJlc3RvcmVzIHRoZSBvcmlnaW5hbCB2YWx1ZSBvZiB0aGUgZ2xvYmFsIGBKU09OYCBvYmplY3QgYW5kXG4gICAgICAvLyByZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBgSlNPTjNgIG9iamVjdC5cbiAgICAgIFwibm9Db25mbGljdFwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghaXNSZXN0b3JlZCkge1xuICAgICAgICAgIGlzUmVzdG9yZWQgPSB0cnVlO1xuICAgICAgICAgIHJvb3QuSlNPTiA9IG5hdGl2ZUpTT047XG4gICAgICAgICAgcm9vdFtcIkpTT04zXCJdID0gcHJldmlvdXNKU09OO1xuICAgICAgICAgIG5hdGl2ZUpTT04gPSBwcmV2aW91c0pTT04gPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKU09OMztcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICByb290LkpTT04gPSB7XG4gICAgICBcInBhcnNlXCI6IEpTT04zLnBhcnNlLFxuICAgICAgXCJzdHJpbmdpZnlcIjogSlNPTjMuc3RyaW5naWZ5XG4gICAgfTtcbiAgfVxuXG4gIC8vIEV4cG9ydCBmb3IgYXN5bmNocm9ub3VzIG1vZHVsZSBsb2FkZXJzLlxuICBpZiAoaXNMb2FkZXIpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIEpTT04zO1xuICAgIH0pO1xuICB9XG59KS5jYWxsKHRoaXMpO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCBGZWxpeCBHbmFzc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiBodHRwOi8vc3Bpbi5qcy5vcmcvXG4gKlxuICogRXhhbXBsZTpcbiAgICB2YXIgb3B0cyA9IHtcbiAgICAgIGxpbmVzOiAxMiAgICAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAsIGxlbmd0aDogNyAgICAgICAgICAgICAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICwgd2lkdGg6IDUgICAgICAgICAgICAgIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgICwgcmFkaXVzOiAxMCAgICAgICAgICAgIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgICwgc2NhbGU6IDEuMCAgICAgICAgICAgIC8vIFNjYWxlcyBvdmVyYWxsIHNpemUgb2YgdGhlIHNwaW5uZXJcbiAgICAsIGNvcm5lcnM6IDEgICAgICAgICAgICAvLyBSb3VuZG5lc3MgKDAuLjEpXG4gICAgLCBjb2xvcjogJyMwMDAnICAgICAgICAgLy8gI3JnYiBvciAjcnJnZ2JiXG4gICAgLCBvcGFjaXR5OiAxLzQgICAgICAgICAgLy8gT3BhY2l0eSBvZiB0aGUgbGluZXNcbiAgICAsIHJvdGF0ZTogMCAgICAgICAgICAgICAvLyBSb3RhdGlvbiBvZmZzZXRcbiAgICAsIGRpcmVjdGlvbjogMSAgICAgICAgICAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXG4gICAgLCBzcGVlZDogMSAgICAgICAgICAgICAgLy8gUm91bmRzIHBlciBzZWNvbmRcbiAgICAsIHRyYWlsOiAxMDAgICAgICAgICAgICAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxuICAgICwgZnBzOiAyMCAgICAgICAgICAgICAgIC8vIEZyYW1lcyBwZXIgc2Vjb25kIHdoZW4gdXNpbmcgc2V0VGltZW91dCgpXG4gICAgLCB6SW5kZXg6IDJlOSAgICAgICAgICAgLy8gVXNlIGEgaGlnaCB6LWluZGV4IGJ5IGRlZmF1bHRcbiAgICAsIGNsYXNzTmFtZTogJ3NwaW5uZXInICAvLyBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBlbGVtZW50XG4gICAgLCB0b3A6ICc1MCUnICAgICAgICAgICAgLy8gY2VudGVyIHZlcnRpY2FsbHlcbiAgICAsIGxlZnQ6ICc1MCUnICAgICAgICAgICAvLyBjZW50ZXIgaG9yaXpvbnRhbGx5XG4gICAgLCBzaGFkb3c6IGZhbHNlICAgICAgICAgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcbiAgICAsIGh3YWNjZWw6IGZhbHNlICAgICAgICAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb24gKG1pZ2h0IGJlIGJ1Z2d5KVxuICAgICwgcG9zaXRpb246ICdhYnNvbHV0ZScgIC8vIEVsZW1lbnQgcG9zaXRpb25pbmdcbiAgICB9XG4gICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb28nKVxuICAgIHZhciBzcGlubmVyID0gbmV3IFNwaW5uZXIob3B0cykuc3Bpbih0YXJnZXQpXG4gKi9cbjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblxuICAvKiBDb21tb25KUyAqL1xuICBpZiAodHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KClcblxuICAvKiBBTUQgbW9kdWxlICovXG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZmFjdG9yeSlcblxuICAvKiBCcm93c2VyIGdsb2JhbCAqL1xuICBlbHNlIHJvb3QuU3Bpbm5lciA9IGZhY3RvcnkoKVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gIFwidXNlIHN0cmljdFwiXG5cbiAgdmFyIHByZWZpeGVzID0gWyd3ZWJraXQnLCAnTW96JywgJ21zJywgJ08nXSAvKiBWZW5kb3IgcHJlZml4ZXMgKi9cbiAgICAsIGFuaW1hdGlvbnMgPSB7fSAvKiBBbmltYXRpb24gcnVsZXMga2V5ZWQgYnkgdGhlaXIgbmFtZSAqL1xuICAgICwgdXNlQ3NzQW5pbWF0aW9ucyAvKiBXaGV0aGVyIHRvIHVzZSBDU1MgYW5pbWF0aW9ucyBvciBzZXRUaW1lb3V0ICovXG4gICAgLCBzaGVldCAvKiBBIHN0eWxlc2hlZXQgdG8gaG9sZCB0aGUgQGtleWZyYW1lIG9yIFZNTCBydWxlcy4gKi9cblxuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgZWxlbWVudHMuIElmIG5vIHRhZyBuYW1lIGlzIGdpdmVuLFxuICAgKiBhIERJViBpcyBjcmVhdGVkLiBPcHRpb25hbGx5IHByb3BlcnRpZXMgY2FuIGJlIHBhc3NlZC5cbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsICh0YWcsIHByb3ApIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyB8fCAnZGl2JylcbiAgICAgICwgblxuXG4gICAgZm9yIChuIGluIHByb3ApIGVsW25dID0gcHJvcFtuXVxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgY2hpbGRyZW4gYW5kIHJldHVybnMgdGhlIHBhcmVudC5cbiAgICovXG4gIGZ1bmN0aW9uIGlucyAocGFyZW50IC8qIGNoaWxkMSwgY2hpbGQyLCAuLi4qLykge1xuICAgIGZvciAodmFyIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGFyZ3VtZW50c1tpXSlcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyZW50XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvcGFjaXR5IGtleWZyYW1lIGFuaW1hdGlvbiBydWxlIGFuZCByZXR1cm5zIGl0cyBuYW1lLlxuICAgKiBTaW5jZSBtb3N0IG1vYmlsZSBXZWJraXRzIGhhdmUgdGltaW5nIGlzc3VlcyB3aXRoIGFuaW1hdGlvbi1kZWxheSxcbiAgICogd2UgY3JlYXRlIHNlcGFyYXRlIHJ1bGVzIGZvciBlYWNoIGxpbmUvc2VnbWVudC5cbiAgICovXG4gIGZ1bmN0aW9uIGFkZEFuaW1hdGlvbiAoYWxwaGEsIHRyYWlsLCBpLCBsaW5lcykge1xuICAgIHZhciBuYW1lID0gWydvcGFjaXR5JywgdHJhaWwsIH5+KGFscGhhICogMTAwKSwgaSwgbGluZXNdLmpvaW4oJy0nKVxuICAgICAgLCBzdGFydCA9IDAuMDEgKyBpL2xpbmVzICogMTAwXG4gICAgICAsIHogPSBNYXRoLm1heCgxIC0gKDEtYWxwaGEpIC8gdHJhaWwgKiAoMTAwLXN0YXJ0KSwgYWxwaGEpXG4gICAgICAsIHByZWZpeCA9IHVzZUNzc0FuaW1hdGlvbnMuc3Vic3RyaW5nKDAsIHVzZUNzc0FuaW1hdGlvbnMuaW5kZXhPZignQW5pbWF0aW9uJykpLnRvTG93ZXJDYXNlKClcbiAgICAgICwgcHJlID0gcHJlZml4ICYmICctJyArIHByZWZpeCArICctJyB8fCAnJ1xuXG4gICAgaWYgKCFhbmltYXRpb25zW25hbWVdKSB7XG4gICAgICBzaGVldC5pbnNlcnRSdWxlKFxuICAgICAgICAnQCcgKyBwcmUgKyAna2V5ZnJhbWVzICcgKyBuYW1lICsgJ3snICtcbiAgICAgICAgJzAle29wYWNpdHk6JyArIHogKyAnfScgK1xuICAgICAgICBzdGFydCArICcle29wYWNpdHk6JyArIGFscGhhICsgJ30nICtcbiAgICAgICAgKHN0YXJ0KzAuMDEpICsgJyV7b3BhY2l0eToxfScgK1xuICAgICAgICAoc3RhcnQrdHJhaWwpICUgMTAwICsgJyV7b3BhY2l0eTonICsgYWxwaGEgKyAnfScgK1xuICAgICAgICAnMTAwJXtvcGFjaXR5OicgKyB6ICsgJ30nICtcbiAgICAgICAgJ30nLCBzaGVldC5jc3NSdWxlcy5sZW5ndGgpXG5cbiAgICAgIGFuaW1hdGlvbnNbbmFtZV0gPSAxXG4gICAgfVxuXG4gICAgcmV0dXJuIG5hbWVcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB2YXJpb3VzIHZlbmRvciBwcmVmaXhlcyBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgc3VwcG9ydGVkIHByb3BlcnR5LlxuICAgKi9cbiAgZnVuY3Rpb24gdmVuZG9yIChlbCwgcHJvcCkge1xuICAgIHZhciBzID0gZWwuc3R5bGVcbiAgICAgICwgcHBcbiAgICAgICwgaVxuXG4gICAgcHJvcCA9IHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnNsaWNlKDEpXG4gICAgaWYgKHNbcHJvcF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3BcbiAgICBmb3IgKGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHBwID0gcHJlZml4ZXNbaV0rcHJvcFxuICAgICAgaWYgKHNbcHBdICE9PSB1bmRlZmluZWQpIHJldHVybiBwcFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIG11bHRpcGxlIHN0eWxlIHByb3BlcnRpZXMgYXQgb25jZS5cbiAgICovXG4gIGZ1bmN0aW9uIGNzcyAoZWwsIHByb3ApIHtcbiAgICBmb3IgKHZhciBuIGluIHByb3ApIHtcbiAgICAgIGVsLnN0eWxlW3ZlbmRvcihlbCwgbikgfHwgbl0gPSBwcm9wW25dXG4gICAgfVxuXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvKipcbiAgICogRmlsbHMgaW4gZGVmYXVsdCB2YWx1ZXMuXG4gICAqL1xuICBmdW5jdGlvbiBtZXJnZSAob2JqKSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZWYgPSBhcmd1bWVudHNbaV1cbiAgICAgIGZvciAodmFyIG4gaW4gZGVmKSB7XG4gICAgICAgIGlmIChvYmpbbl0gPT09IHVuZGVmaW5lZCkgb2JqW25dID0gZGVmW25dXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmpcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsaW5lIGNvbG9yIGZyb20gdGhlIGdpdmVuIHN0cmluZyBvciBhcnJheS5cbiAgICovXG4gIGZ1bmN0aW9uIGdldENvbG9yIChjb2xvciwgaWR4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBjb2xvciA9PSAnc3RyaW5nJyA/IGNvbG9yIDogY29sb3JbaWR4ICUgY29sb3IubGVuZ3RoXVxuICB9XG5cbiAgLy8gQnVpbHQtaW4gZGVmYXVsdHNcblxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgbGluZXM6IDEyICAgICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xuICAsIGxlbmd0aDogNyAgICAgICAgICAgICAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAsIHdpZHRoOiA1ICAgICAgICAgICAgICAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgLCByYWRpdXM6IDEwICAgICAgICAgICAgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICwgc2NhbGU6IDEuMCAgICAgICAgICAgIC8vIFNjYWxlcyBvdmVyYWxsIHNpemUgb2YgdGhlIHNwaW5uZXJcbiAgLCBjb3JuZXJzOiAxICAgICAgICAgICAgLy8gUm91bmRuZXNzICgwLi4xKVxuICAsIGNvbG9yOiAnIzAwMCcgICAgICAgICAvLyAjcmdiIG9yICNycmdnYmJcbiAgLCBvcGFjaXR5OiAxLzQgICAgICAgICAgLy8gT3BhY2l0eSBvZiB0aGUgbGluZXNcbiAgLCByb3RhdGU6IDAgICAgICAgICAgICAgLy8gUm90YXRpb24gb2Zmc2V0XG4gICwgZGlyZWN0aW9uOiAxICAgICAgICAgIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcbiAgLCBzcGVlZDogMSAgICAgICAgICAgICAgLy8gUm91bmRzIHBlciBzZWNvbmRcbiAgLCB0cmFpbDogMTAwICAgICAgICAgICAgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcbiAgLCBmcHM6IDIwICAgICAgICAgICAgICAgLy8gRnJhbWVzIHBlciBzZWNvbmQgd2hlbiB1c2luZyBzZXRUaW1lb3V0KClcbiAgLCB6SW5kZXg6IDJlOSAgICAgICAgICAgLy8gVXNlIGEgaGlnaCB6LWluZGV4IGJ5IGRlZmF1bHRcbiAgLCBjbGFzc05hbWU6ICdzcGlubmVyJyAgLy8gQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgZWxlbWVudFxuICAsIHRvcDogJzUwJScgICAgICAgICAgICAvLyBjZW50ZXIgdmVydGljYWxseVxuICAsIGxlZnQ6ICc1MCUnICAgICAgICAgICAvLyBjZW50ZXIgaG9yaXpvbnRhbGx5XG4gICwgc2hhZG93OiBmYWxzZSAgICAgICAgIC8vIFdoZXRoZXIgdG8gcmVuZGVyIGEgc2hhZG93XG4gICwgaHdhY2NlbDogZmFsc2UgICAgICAgIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiAobWlnaHQgYmUgYnVnZ3kpXG4gICwgcG9zaXRpb246ICdhYnNvbHV0ZScgIC8vIEVsZW1lbnQgcG9zaXRpb25pbmdcbiAgfVxuXG4gIC8qKiBUaGUgY29uc3RydWN0b3IgKi9cbiAgZnVuY3Rpb24gU3Bpbm5lciAobykge1xuICAgIHRoaXMub3B0cyA9IG1lcmdlKG8gfHwge30sIFNwaW5uZXIuZGVmYXVsdHMsIGRlZmF1bHRzKVxuICB9XG5cbiAgLy8gR2xvYmFsIGRlZmF1bHRzIHRoYXQgb3ZlcnJpZGUgdGhlIGJ1aWx0LWluczpcbiAgU3Bpbm5lci5kZWZhdWx0cyA9IHt9XG5cbiAgbWVyZ2UoU3Bpbm5lci5wcm90b3R5cGUsIHtcbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBzcGlubmVyIHRvIHRoZSBnaXZlbiB0YXJnZXQgZWxlbWVudC4gSWYgdGhpcyBpbnN0YW5jZSBpcyBhbHJlYWR5XG4gICAgICogc3Bpbm5pbmcsIGl0IGlzIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZCBmcm9tIGl0cyBwcmV2aW91cyB0YXJnZXQgYiBjYWxsaW5nXG4gICAgICogc3RvcCgpIGludGVybmFsbHkuXG4gICAgICovXG4gICAgc3BpbjogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgdGhpcy5zdG9wKClcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICwgbyA9IHNlbGYub3B0c1xuICAgICAgICAsIGVsID0gc2VsZi5lbCA9IGNyZWF0ZUVsKG51bGwsIHtjbGFzc05hbWU6IG8uY2xhc3NOYW1lfSlcblxuICAgICAgY3NzKGVsLCB7XG4gICAgICAgIHBvc2l0aW9uOiBvLnBvc2l0aW9uXG4gICAgICAsIHdpZHRoOiAwXG4gICAgICAsIHpJbmRleDogby56SW5kZXhcbiAgICAgICwgbGVmdDogby5sZWZ0XG4gICAgICAsIHRvcDogby50b3BcbiAgICAgIH0pXG5cbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShlbCwgdGFyZ2V0LmZpcnN0Q2hpbGQgfHwgbnVsbClcbiAgICAgIH1cblxuICAgICAgZWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Byb2dyZXNzYmFyJylcbiAgICAgIHNlbGYubGluZXMoZWwsIHNlbGYub3B0cylcblxuICAgICAgaWYgKCF1c2VDc3NBbmltYXRpb25zKSB7XG4gICAgICAgIC8vIE5vIENTUyBhbmltYXRpb24gc3VwcG9ydCwgdXNlIHNldFRpbWVvdXQoKSBpbnN0ZWFkXG4gICAgICAgIHZhciBpID0gMFxuICAgICAgICAgICwgc3RhcnQgPSAoby5saW5lcyAtIDEpICogKDEgLSBvLmRpcmVjdGlvbikgLyAyXG4gICAgICAgICAgLCBhbHBoYVxuICAgICAgICAgICwgZnBzID0gby5mcHNcbiAgICAgICAgICAsIGYgPSBmcHMgLyBvLnNwZWVkXG4gICAgICAgICAgLCBvc3RlcCA9ICgxIC0gby5vcGFjaXR5KSAvIChmICogby50cmFpbCAvIDEwMClcbiAgICAgICAgICAsIGFzdGVwID0gZiAvIG8ubGluZXNcblxuICAgICAgICA7KGZ1bmN0aW9uIGFuaW0gKCkge1xuICAgICAgICAgIGkrK1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgby5saW5lczsgaisrKSB7XG4gICAgICAgICAgICBhbHBoYSA9IE1hdGgubWF4KDEgLSAoaSArIChvLmxpbmVzIC0gaikgKiBhc3RlcCkgJSBmICogb3N0ZXAsIG8ub3BhY2l0eSlcblxuICAgICAgICAgICAgc2VsZi5vcGFjaXR5KGVsLCBqICogby5kaXJlY3Rpb24gKyBzdGFydCwgYWxwaGEsIG8pXG4gICAgICAgICAgfVxuICAgICAgICAgIHNlbGYudGltZW91dCA9IHNlbGYuZWwgJiYgc2V0VGltZW91dChhbmltLCB+figxMDAwIC8gZnBzKSlcbiAgICAgICAgfSkoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNlbGZcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBhbmQgcmVtb3ZlcyB0aGUgU3Bpbm5lci5cbiAgICAgKi9cbiAgLCBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZWwgPSB0aGlzLmVsXG4gICAgICBpZiAoZWwpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICAgICAgaWYgKGVsLnBhcmVudE5vZGUpIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXG4gICAgICAgIHRoaXMuZWwgPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgbWV0aG9kIHRoYXQgZHJhd3MgdGhlIGluZGl2aWR1YWwgbGluZXMuIFdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgICAgKiBpbiBWTUwgZmFsbGJhY2sgbW9kZSBiZWxvdy5cbiAgICAgKi9cbiAgLCBsaW5lczogZnVuY3Rpb24gKGVsLCBvKSB7XG4gICAgICB2YXIgaSA9IDBcbiAgICAgICAgLCBzdGFydCA9IChvLmxpbmVzIC0gMSkgKiAoMSAtIG8uZGlyZWN0aW9uKSAvIDJcbiAgICAgICAgLCBzZWdcblxuICAgICAgZnVuY3Rpb24gZmlsbCAoY29sb3IsIHNoYWRvdykge1xuICAgICAgICByZXR1cm4gY3NzKGNyZWF0ZUVsKCksIHtcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJ1xuICAgICAgICAsIHdpZHRoOiBvLnNjYWxlICogKG8ubGVuZ3RoICsgby53aWR0aCkgKyAncHgnXG4gICAgICAgICwgaGVpZ2h0OiBvLnNjYWxlICogby53aWR0aCArICdweCdcbiAgICAgICAgLCBiYWNrZ3JvdW5kOiBjb2xvclxuICAgICAgICAsIGJveFNoYWRvdzogc2hhZG93XG4gICAgICAgICwgdHJhbnNmb3JtT3JpZ2luOiAnbGVmdCdcbiAgICAgICAgLCB0cmFuc2Zvcm06ICdyb3RhdGUoJyArIH5+KDM2MC9vLmxpbmVzKmkgKyBvLnJvdGF0ZSkgKyAnZGVnKSB0cmFuc2xhdGUoJyArIG8uc2NhbGUqby5yYWRpdXMgKyAncHgnICsgJywwKSdcbiAgICAgICAgLCBib3JkZXJSYWRpdXM6IChvLmNvcm5lcnMgKiBvLnNjYWxlICogby53aWR0aCA+PiAxKSArICdweCdcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgZm9yICg7IGkgPCBvLmxpbmVzOyBpKyspIHtcbiAgICAgICAgc2VnID0gY3NzKGNyZWF0ZUVsKCksIHtcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJ1xuICAgICAgICAsIHRvcDogMSArIH4oby5zY2FsZSAqIG8ud2lkdGggLyAyKSArICdweCdcbiAgICAgICAgLCB0cmFuc2Zvcm06IG8uaHdhY2NlbCA/ICd0cmFuc2xhdGUzZCgwLDAsMCknIDogJydcbiAgICAgICAgLCBvcGFjaXR5OiBvLm9wYWNpdHlcbiAgICAgICAgLCBhbmltYXRpb246IHVzZUNzc0FuaW1hdGlvbnMgJiYgYWRkQW5pbWF0aW9uKG8ub3BhY2l0eSwgby50cmFpbCwgc3RhcnQgKyBpICogby5kaXJlY3Rpb24sIG8ubGluZXMpICsgJyAnICsgMSAvIG8uc3BlZWQgKyAncyBsaW5lYXIgaW5maW5pdGUnXG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKG8uc2hhZG93KSBpbnMoc2VnLCBjc3MoZmlsbCgnIzAwMCcsICcwIDAgNHB4ICMwMDAnKSwge3RvcDogJzJweCd9KSlcbiAgICAgICAgaW5zKGVsLCBpbnMoc2VnLCBmaWxsKGdldENvbG9yKG8uY29sb3IsIGkpLCAnMCAwIDFweCByZ2JhKDAsMCwwLC4xKScpKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIG1ldGhvZCB0aGF0IGFkanVzdHMgdGhlIG9wYWNpdHkgb2YgYSBzaW5nbGUgbGluZS5cbiAgICAgKiBXaWxsIGJlIG92ZXJ3cml0dGVuIGluIFZNTCBmYWxsYmFjayBtb2RlIGJlbG93LlxuICAgICAqL1xuICAsIG9wYWNpdHk6IGZ1bmN0aW9uIChlbCwgaSwgdmFsKSB7XG4gICAgICBpZiAoaSA8IGVsLmNoaWxkTm9kZXMubGVuZ3RoKSBlbC5jaGlsZE5vZGVzW2ldLnN0eWxlLm9wYWNpdHkgPSB2YWxcbiAgICB9XG5cbiAgfSlcblxuXG4gIGZ1bmN0aW9uIGluaXRWTUwgKCkge1xuXG4gICAgLyogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYSBWTUwgdGFnICovXG4gICAgZnVuY3Rpb24gdm1sICh0YWcsIGF0dHIpIHtcbiAgICAgIHJldHVybiBjcmVhdGVFbCgnPCcgKyB0YWcgKyAnIHhtbG5zPVwidXJuOnNjaGVtYXMtbWljcm9zb2Z0LmNvbTp2bWxcIiBjbGFzcz1cInNwaW4tdm1sXCI+JywgYXR0cilcbiAgICB9XG5cbiAgICAvLyBObyBDU1MgdHJhbnNmb3JtcyBidXQgVk1MIHN1cHBvcnQsIGFkZCBhIENTUyBydWxlIGZvciBWTUwgZWxlbWVudHM6XG4gICAgc2hlZXQuYWRkUnVsZSgnLnNwaW4tdm1sJywgJ2JlaGF2aW9yOnVybCgjZGVmYXVsdCNWTUwpJylcblxuICAgIFNwaW5uZXIucHJvdG90eXBlLmxpbmVzID0gZnVuY3Rpb24gKGVsLCBvKSB7XG4gICAgICB2YXIgciA9IG8uc2NhbGUgKiAoby5sZW5ndGggKyBvLndpZHRoKVxuICAgICAgICAsIHMgPSBvLnNjYWxlICogMiAqIHJcblxuICAgICAgZnVuY3Rpb24gZ3JwICgpIHtcbiAgICAgICAgcmV0dXJuIGNzcyhcbiAgICAgICAgICB2bWwoJ2dyb3VwJywge1xuICAgICAgICAgICAgY29vcmRzaXplOiBzICsgJyAnICsgc1xuICAgICAgICAgICwgY29vcmRvcmlnaW46IC1yICsgJyAnICsgLXJcbiAgICAgICAgICB9KVxuICAgICAgICAsIHsgd2lkdGg6IHMsIGhlaWdodDogcyB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgdmFyIG1hcmdpbiA9IC0oby53aWR0aCArIG8ubGVuZ3RoKSAqIG8uc2NhbGUgKiAyICsgJ3B4J1xuICAgICAgICAsIGcgPSBjc3MoZ3JwKCksIHtwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiBtYXJnaW4sIGxlZnQ6IG1hcmdpbn0pXG4gICAgICAgICwgaVxuXG4gICAgICBmdW5jdGlvbiBzZWcgKGksIGR4LCBmaWx0ZXIpIHtcbiAgICAgICAgaW5zKFxuICAgICAgICAgIGdcbiAgICAgICAgLCBpbnMoXG4gICAgICAgICAgICBjc3MoZ3JwKCksIHtyb3RhdGlvbjogMzYwIC8gby5saW5lcyAqIGkgKyAnZGVnJywgbGVmdDogfn5keH0pXG4gICAgICAgICAgLCBpbnMoXG4gICAgICAgICAgICAgIGNzcyhcbiAgICAgICAgICAgICAgICB2bWwoJ3JvdW5kcmVjdCcsIHthcmNzaXplOiBvLmNvcm5lcnN9KVxuICAgICAgICAgICAgICAsIHsgd2lkdGg6IHJcbiAgICAgICAgICAgICAgICAsIGhlaWdodDogby5zY2FsZSAqIG8ud2lkdGhcbiAgICAgICAgICAgICAgICAsIGxlZnQ6IG8uc2NhbGUgKiBvLnJhZGl1c1xuICAgICAgICAgICAgICAgICwgdG9wOiAtby5zY2FsZSAqIG8ud2lkdGggPj4gMVxuICAgICAgICAgICAgICAgICwgZmlsdGVyOiBmaWx0ZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICwgdm1sKCdmaWxsJywge2NvbG9yOiBnZXRDb2xvcihvLmNvbG9yLCBpKSwgb3BhY2l0eTogby5vcGFjaXR5fSlcbiAgICAgICAgICAgICwgdm1sKCdzdHJva2UnLCB7b3BhY2l0eTogMH0pIC8vIHRyYW5zcGFyZW50IHN0cm9rZSB0byBmaXggY29sb3IgYmxlZWRpbmcgdXBvbiBvcGFjaXR5IGNoYW5nZVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICBpZiAoby5zaGFkb3cpXG4gICAgICAgIGZvciAoaSA9IDE7IGkgPD0gby5saW5lczsgaSsrKSB7XG4gICAgICAgICAgc2VnKGksIC0yLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkJsdXIocGl4ZWxyYWRpdXM9MixtYWtlc2hhZG93PTEsc2hhZG93b3BhY2l0eT0uMyknKVxuICAgICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDE7IGkgPD0gby5saW5lczsgaSsrKSBzZWcoaSlcbiAgICAgIHJldHVybiBpbnMoZWwsIGcpXG4gICAgfVxuXG4gICAgU3Bpbm5lci5wcm90b3R5cGUub3BhY2l0eSA9IGZ1bmN0aW9uIChlbCwgaSwgdmFsLCBvKSB7XG4gICAgICB2YXIgYyA9IGVsLmZpcnN0Q2hpbGRcbiAgICAgIG8gPSBvLnNoYWRvdyAmJiBvLmxpbmVzIHx8IDBcbiAgICAgIGlmIChjICYmIGkgKyBvIDwgYy5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICBjID0gYy5jaGlsZE5vZGVzW2kgKyBvXTsgYyA9IGMgJiYgYy5maXJzdENoaWxkOyBjID0gYyAmJiBjLmZpcnN0Q2hpbGRcbiAgICAgICAgaWYgKGMpIGMub3BhY2l0eSA9IHZhbFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgc2hlZXQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVsID0gY3JlYXRlRWwoJ3N0eWxlJywge3R5cGUgOiAndGV4dC9jc3MnfSlcbiAgICAgIGlucyhkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLCBlbClcbiAgICAgIHJldHVybiBlbC5zaGVldCB8fCBlbC5zdHlsZVNoZWV0XG4gICAgfSgpKVxuXG4gICAgdmFyIHByb2JlID0gY3NzKGNyZWF0ZUVsKCdncm91cCcpLCB7YmVoYXZpb3I6ICd1cmwoI2RlZmF1bHQjVk1MKSd9KVxuXG4gICAgaWYgKCF2ZW5kb3IocHJvYmUsICd0cmFuc2Zvcm0nKSAmJiBwcm9iZS5hZGopIGluaXRWTUwoKVxuICAgIGVsc2UgdXNlQ3NzQW5pbWF0aW9ucyA9IHZlbmRvcihwcm9iZSwgJ2FuaW1hdGlvbicpXG4gIH1cblxuICByZXR1cm4gU3Bpbm5lclxuXG59KSk7XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG5cbi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3QgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93XG4gID8gdGhpc1xuICA6IHdpbmRvdztcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbmZ1bmN0aW9uIGdldFhIUigpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAmJiAoJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgdGhpcy50ZXh0ID0gdGhpcy5yZXEubWV0aG9kICE9J0hFQUQnIFxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dCBcbiAgICAgOiBudWxsO1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQpXG4gICAgOiBudWxsO1xufVxuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uKGhlYWRlcil7XG4gIC8vIGNvbnRlbnQtdHlwZVxuICB2YXIgY3QgPSB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICB2YXIgb2JqID0gcGFyYW1zKGN0KTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikgdGhpc1trZXldID0gb2JqW2tleV07XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnBhcnNlQm9keSA9IGZ1bmN0aW9uKHN0cil7XG4gIHZhciBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiBzdHIubGVuZ3RoXG4gICAgPyBwYXJzZShzdHIpXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uKHN0YXR1cyl7XG4gIHZhciB0eXBlID0gc3RhdHVzIC8gMTAwIHwgMDtcblxuICAvLyBzdGF0dXMgLyBjbGFzc1xuICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAvLyBiYXNpY3NcbiAgdGhpcy5pbmZvID0gMSA9PSB0eXBlO1xuICB0aGlzLm9rID0gMiA9PSB0eXBlO1xuICB0aGlzLmNsaWVudEVycm9yID0gNCA9PSB0eXBlO1xuICB0aGlzLnNlcnZlckVycm9yID0gNSA9PSB0eXBlO1xuICB0aGlzLmVycm9yID0gKDQgPT0gdHlwZSB8fCA1ID09IHR5cGUpXG4gICAgPyB0aGlzLnRvRXJyb3IoKVxuICAgIDogZmFsc2U7XG5cbiAgLy8gc3VnYXJcbiAgdGhpcy5hY2NlcHRlZCA9IDIwMiA9PSBzdGF0dXM7XG4gIHRoaXMubm9Db250ZW50ID0gMjA0ID09IHN0YXR1cyB8fCAxMjIzID09IHN0YXR1cztcbiAgdGhpcy5iYWRSZXF1ZXN0ID0gNDAwID09IHN0YXR1cztcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSA0MDEgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEFjY2VwdGFibGUgPSA0MDYgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEZvdW5kID0gNDA0ID09IHN0YXR1cztcbiAgdGhpcy5mb3JiaWRkZW4gPSA0MDMgPT0gc3RhdHVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXEgPSB0aGlzLnJlcTtcbiAgdmFyIG1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gIHZhciB1cmwgPSByZXEudXJsO1xuXG4gIHZhciBtc2cgPSAnY2Fubm90ICcgKyBtZXRob2QgKyAnICcgKyB1cmwgKyAnICgnICsgdGhpcy5zdGF0dXMgKyAnKSc7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307XG4gIHRoaXMuX2hlYWRlciA9IHt9O1xuICB0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBlcnIgPSBudWxsO1xuICAgIHZhciByZXMgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlcyA9IG5ldyBSZXNwb25zZShzZWxmKTsgXG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICB9XG5cbiAgICBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgLlxuICovXG5cbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4vKipcbiAqIEFsbG93IGZvciBleHRlbnNpb25cbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihmbikge1xuICBmbih0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogU2V0IHRpbWVvdXQgdG8gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMpe1xuICB0aGlzLl90aW1lb3V0ID0gbXM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLl90aW1lb3V0ID0gMDtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5hYm9ydGVkKSByZXR1cm47XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMueGhyLmFib3J0KCk7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpe1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBoZWFkZXIgYGZpZWxkYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnVuc2V0KCdVc2VyLUFnZW50JylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51bnNldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgZGVsZXRlIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbiAgZGVsZXRlIHRoaXMuaGVhZGVyW2ZpZWxkXTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0SGVhZGVyID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzKXtcbiAgdmFyIHN0ciA9IGJ0b2EodXNlciArICc6JyArIHBhc3MpO1xuICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgc3RyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbipcbiogRXhhbXBsZXM6XG4qXG4qICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4qICAgICAucXVlcnkoJ3NpemU9MTAnKVxuKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuKlxuKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiogQGFwaSBwdWJsaWNcbiovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKXtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgZmllbGQgYG5hbWVgIGFuZCBgdmFsYCBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCJcbiAqIHJlcXVlc3QgYm9kaWVzLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKCdmb28nLCAnYmFyJylcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd8QmxvYnxGaWxlfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5maWVsZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYGZpbGVuYW1lYC5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2gobmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oZmllbGQsIGZpbGUsIGZpbGVuYW1lKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBxdWVyeXN0cmluZ1xuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG11bHRpcGxlIGRhdGEgXCJ3cml0ZXNcIlxuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuc2VuZCh7IHNlYXJjaDogJ3F1ZXJ5JyB9KVxuICogICAgICAgICAuc2VuZCh7IHJhbmdlOiAnMS4uNScgfSlcbiAqICAgICAgICAgLnNlbmQoeyBvcmRlcjogJ2Rlc2MnIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaikgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIGlmICgyID09IGZuLmxlbmd0aCkgcmV0dXJuIGZuKGVyciwgcmVzKTtcbiAgaWYgKGVycikgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICBmbihyZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicpO1xuICBlcnIuY3Jvc3NEb21haW4gPSB0cnVlO1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSBnZXRYSFIoKTtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIGlmICg0ICE9IHhoci5yZWFkeVN0YXRlKSByZXR1cm47XG4gICAgaWYgKDAgPT0geGhyLnN0YXR1cykge1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgaWYgKHhoci51cGxvYWQpIHtcbiAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucGVyY2VudCA9IGUubG9hZGVkIC8gZS50b3RhbCAqIDEwMDtcbiAgICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYuYWJvcnQoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIGlmIChxdWVyeSkge1xuICAgIHF1ZXJ5ID0gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgIHRoaXMudXJsICs9IH50aGlzLnVybC5pbmRleE9mKCc/JylcbiAgICAgID8gJyYnICsgcXVlcnlcbiAgICAgIDogJz8nICsgcXVlcnk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmICgnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIWlzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVt0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyldO1xuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuICB4aHIuc2VuZChkYXRhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmRlbCA9IGZ1bmN0aW9uKHVybCwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnREVMRVRFJywgdXJsKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wYXRjaCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUEFUQ0gnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucG9zdCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUE9TVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBVVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnB1dCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUFVUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogRXhwb3NlIGByZXF1ZXN0YC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVlc3Q7XG4iLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyIsInZhciBLZWVuID0gcmVxdWlyZShcIi4vaW5kZXhcIiksXG4gICAgZWFjaCA9IHJlcXVpcmUoXCIuL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIGxvYWRlZCA9IHdpbmRvd1snS2VlbiddIHx8IG51bGwsXG4gICAgICBjYWNoZWQgPSB3aW5kb3dbJ18nICsgJ0tlZW4nXSB8fCBudWxsLFxuICAgICAgY2xpZW50cyxcbiAgICAgIHJlYWR5O1xuXG4gIGlmIChsb2FkZWQgJiYgY2FjaGVkKSB7XG4gICAgY2xpZW50cyA9IGNhY2hlZFsnY2xpZW50cyddIHx8IHt9LFxuICAgIHJlYWR5ID0gY2FjaGVkWydyZWFkeSddIHx8IFtdO1xuXG4gICAgZWFjaChjbGllbnRzLCBmdW5jdGlvbihjbGllbnQsIGlkKXtcblxuICAgICAgZWFjaChLZWVuLnByb3RvdHlwZSwgZnVuY3Rpb24obWV0aG9kLCBrZXkpe1xuICAgICAgICBsb2FkZWQucHJvdG90eXBlW2tleV0gPSBtZXRob2Q7XG4gICAgICB9KTtcblxuICAgICAgZWFjaChbXCJRdWVyeVwiLCBcIlJlcXVlc3RcIiwgXCJEYXRhc2V0XCIsIFwiRGF0YXZpelwiXSwgZnVuY3Rpb24obmFtZSl7XG4gICAgICAgIGxvYWRlZFtuYW1lXSA9IChLZWVuW25hbWVdKSA/IEtlZW5bbmFtZV0gOiBmdW5jdGlvbigpe307XG4gICAgICB9KTtcblxuICAgICAgLy8gUnVuIGNvbmZpZ1xuICAgICAgaWYgKGNsaWVudC5fY29uZmlnKSB7XG4gICAgICAgIGNsaWVudC5jb25maWd1cmUuY2FsbChjbGllbnQsIGNsaWVudC5fY29uZmlnKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIEdsb2JhbCBQcm9wZXJ0aWVzXG4gICAgICBpZiAoY2xpZW50Ll9zZXRHbG9iYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgIGVhY2goY2xpZW50Ll9zZXRHbG9iYWxQcm9wZXJ0aWVzLCBmdW5jdGlvbihmbil7XG4gICAgICAgICAgY2xpZW50LnNldEdsb2JhbFByb3BlcnRpZXMuYXBwbHkoY2xpZW50LCBmbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBTZW5kIFF1ZXVlZCBFdmVudHNcbiAgICAgIGlmIChjbGllbnQuX2FkZEV2ZW50KSB7XG4gICAgICAgIGVhY2goY2xpZW50Ll9hZGRFdmVudCwgZnVuY3Rpb24ob2JqKXtcbiAgICAgICAgICBjbGllbnQuYWRkRXZlbnQuYXBwbHkoY2xpZW50LCBvYmopO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gU2V0IGV2ZW50IGxpc3RlbmVyc1xuICAgICAgdmFyIGNhbGxiYWNrID0gY2xpZW50Ll9vbiB8fCBbXTtcbiAgICAgIGlmIChjbGllbnQuX29uKSB7XG4gICAgICAgIGVhY2goY2xpZW50Ll9vbiwgZnVuY3Rpb24ob2JqKXtcbiAgICAgICAgICBjbGllbnQub24uYXBwbHkoY2xpZW50LCBvYmopO1xuICAgICAgICB9KTtcbiAgICAgICAgY2xpZW50LnRyaWdnZXIoJ3JlYWR5Jyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHVuc2V0IGNvbmZpZ1xuICAgICAgZWFjaChbXCJfY29uZmlnXCIsIFwiX3NldEdsb2JhbFByb3BlcnRpZXNcIiwgXCJfYWRkRXZlbnRcIiwgXCJfb25cIl0sIGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICBpZiAoY2xpZW50W25hbWVdKSB7XG4gICAgICAgICAgY2xpZW50W25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgIGRlbGV0ZSBjbGllbnRbbmFtZV07XG4gICAgICAgICAgfSBjYXRjaChlKXt9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICBlYWNoKHJlYWR5LCBmdW5jdGlvbihjYiwgaSl7XG4gICAgICBLZWVuLm9uY2UoXCJyZWFkeVwiLCBjYik7XG4gICAgfSk7XG4gIH1cblxuICB3aW5kb3dbJ18nICsgJ0tlZW4nXSA9IHVuZGVmaW5lZDtcbiAgdHJ5IHtcbiAgICBkZWxldGUgd2luZG93WydfJyArICdLZWVuJ11cbiAgfSBjYXRjaChlKSB7fVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIFwidW5kZWZpbmVkXCIgPT0gdHlwZW9mIHdpbmRvdyA/IFwic2VydmVyXCIgOiBcImJyb3dzZXJcIjtcbn07XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoJy4uL3V0aWxzL2VhY2gnKSxcbiAgICBqc29uID0gcmVxdWlyZSgnLi4vdXRpbHMvanNvbi1zaGltJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocGFyYW1zKXtcbiAgdmFyIHF1ZXJ5ID0gW107XG4gIGVhY2gocGFyYW1zLCBmdW5jdGlvbih2YWx1ZSwga2V5KXtcbiAgICAvLyBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSAhPT0gJ1tvYmplY3QgU3RyaW5nXScpIHt9XG4gICAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgdmFsdWUpIHtcbiAgICAgIHZhbHVlID0ganNvbi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIH1cbiAgICBxdWVyeS5wdXNoKGtleSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuICB9KTtcbiAgcmV0dXJuICc/JyArIHF1ZXJ5LmpvaW4oJyYnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWV6b25lT2Zmc2V0KCkgKiAtNjA7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICBpZiAoXCJ1bmRlZmluZWRcIiAhPT0gdHlwZW9mIHdpbmRvdykge1xuICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ01TSUUnKSAhPT0gLTEgfHwgbmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZignVHJpZGVudC8nKSA+IDApIHtcbiAgICAgIHJldHVybiAyMDAwO1xuICAgIH1cbiAgfVxuICByZXR1cm4gMTYwMDA7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgLy8geWF5LCBzdXBlcmFnZW50IVxuICB2YXIgcm9vdCA9IFwidW5kZWZpbmVkXCIgPT0gdHlwZW9mIHdpbmRvdyA/IHRoaXMgOiB3aW5kb3c7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0ICYmIChcImZpbGU6XCIgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbCB8fCAhcm9vdC5BY3RpdmVYT2JqZWN0KSkge1xuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTWljcm9zb2Z0LlhNTEhUVFBcIik7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNc3htbDIuWE1MSFRUUC42LjBcIik7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNc3htbDIuWE1MSFRUUC4zLjBcIik7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNc3htbDIuWE1MSFRUUFwiKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVyciwgcmVzLCBjYWxsYmFjaykge1xuICB2YXIgY2IgPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpIHt9O1xuICBpZiAocmVzICYmICFyZXMub2spIHtcbiAgICB2YXIgaXNfZXJyID0gcmVzLmJvZHkgJiYgcmVzLmJvZHkuZXJyb3JfY29kZTtcbiAgICBlcnIgPSBuZXcgRXJyb3IoaXNfZXJyID8gcmVzLmJvZHkubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJyk7XG4gICAgZXJyLmNvZGUgPSBpc19lcnIgPyByZXMuYm9keS5lcnJvcl9jb2RlIDogJ1Vua25vd25FcnJvcic7XG4gIH1cbiAgaWYgKGVycikge1xuICAgIGNiKGVyciwgbnVsbCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgY2IobnVsbCwgcmVzLmJvZHkpO1xuICB9XG4gIHJldHVybjtcbn07XG4iLCJ2YXIgc3VwZXJhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcbnZhciBlYWNoID0gcmVxdWlyZSgnLi4vdXRpbHMvZWFjaCcpLFxuICAgIGdldFhIUiA9IHJlcXVpcmUoJy4vZ2V0LXhoci1vYmplY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0eXBlLCBvcHRzKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgICB2YXIgX19zdXBlcl9fID0gcmVxdWVzdC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUuZW5kO1xuICAgIGlmICggJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiB3aW5kb3cgKSByZXR1cm47XG4gICAgcmVxdWVzdC5yZXF1ZXN0VHlwZSA9IHJlcXVlc3QucmVxdWVzdFR5cGUgfHwge307XG4gICAgcmVxdWVzdC5yZXF1ZXN0VHlwZVsndHlwZSddID0gdHlwZTtcbiAgICByZXF1ZXN0LnJlcXVlc3RUeXBlWydvcHRpb25zJ10gPSByZXF1ZXN0LnJlcXVlc3RUeXBlWydvcHRpb25zJ10gfHwge1xuICAgICAgLy8gVE9ETzogZmluZCBhY2NlcHRhYmxlIGRlZmF1bHQgdmFsdWVzXG4gICAgICBhc3luYzogdHJ1ZSxcbiAgICAgIHN1Y2Nlc3M6IHtcbiAgICAgICAgcmVzcG9uc2VUZXh0OiAneyBcImNyZWF0ZWRcIjogdHJ1ZSB9JyxcbiAgICAgICAgc3RhdHVzOiAyMDFcbiAgICAgIH0sXG4gICAgICBlcnJvcjoge1xuICAgICAgICByZXNwb25zZVRleHQ6ICd7IFwiZXJyb3JfY29kZVwiOiBcIkVSUk9SXCIsIFwibWVzc2FnZVwiOiBcIlJlcXVlc3QgZmFpbGVkXCIgfScsXG4gICAgICAgIHN0YXR1czogNDA0XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEFwcGx5IG9wdGlvbnNcbiAgICBpZiAob3B0cykge1xuICAgICAgaWYgKCAnYm9vbGVhbicgPT09IHR5cGVvZiBvcHRzLmFzeW5jICkge1xuICAgICAgICByZXF1ZXN0LnJlcXVlc3RUeXBlWydvcHRpb25zJ10uYXN5bmMgPSBvcHRzLmFzeW5jO1xuICAgICAgfVxuICAgICAgaWYgKCBvcHRzLnN1Y2Nlc3MgKSB7XG4gICAgICAgIGV4dGVuZChyZXF1ZXN0LnJlcXVlc3RUeXBlWydvcHRpb25zJ10uc3VjY2Vzcywgb3B0cy5zdWNjZXNzKTtcbiAgICAgIH1cbiAgICAgIGlmICggb3B0cy5lcnJvciApIHtcbiAgICAgICAgZXh0ZW5kKHJlcXVlc3QucmVxdWVzdFR5cGVbJ29wdGlvbnMnXS5lcnJvciwgb3B0cy5lcnJvcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVxdWVzdC5lbmQgPSBmdW5jdGlvbihmbil7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgcmVxVHlwZSA9ICh0aGlzLnJlcXVlc3RUeXBlKSA/IHRoaXMucmVxdWVzdFR5cGVbJ3R5cGUnXSA6ICd4aHInLFxuICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgIHRpbWVvdXQ7XG5cbiAgICAgIGlmICggKCdHRVQnICE9PSBzZWxmWydtZXRob2QnXSB8fCAneGhyJyA9PT0gcmVxVHlwZSkgJiYgc2VsZi5yZXF1ZXN0VHlwZVsnb3B0aW9ucyddLmFzeW5jICkge1xuICAgICAgICBfX3N1cGVyX18uY2FsbChzZWxmLCBmbik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcXVlcnkgPSBzZWxmLl9xdWVyeS5qb2luKCcmJyk7XG4gICAgICB0aW1lb3V0ID0gc2VsZi5fdGltZW91dDtcbiAgICAgIC8vIHN0b3JlIGNhbGxiYWNrXG4gICAgICBzZWxmLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG4gICAgICAvLyB0aW1lb3V0XG4gICAgICBpZiAodGltZW91dCAmJiAhc2VsZi5fdGltZXIpIHtcbiAgICAgICAgc2VsZi5fdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgYWJvcnRSZXF1ZXN0LmNhbGwoc2VsZik7XG4gICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgfVxuICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgIHF1ZXJ5ID0gc3VwZXJhZ2VudC5zZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgICAgICBzZWxmLnVybCArPSB+c2VsZi51cmwuaW5kZXhPZignPycpID8gJyYnICsgcXVlcnkgOiAnPycgKyBxdWVyeTtcbiAgICAgIH1cbiAgICAgIC8vIHNlbmQgc3R1ZmZcbiAgICAgIHNlbGYuZW1pdCgncmVxdWVzdCcsIHNlbGYpO1xuXG4gICAgICBpZiAoICFzZWxmLnJlcXVlc3RUeXBlWydvcHRpb25zJ10uYXN5bmMgKSB7XG4gICAgICAgIHNlbmRYaHJTeW5jLmNhbGwoc2VsZik7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggJ2pzb25wJyA9PT0gcmVxVHlwZSApIHtcbiAgICAgICAgc2VuZEpzb25wLmNhbGwoc2VsZik7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggJ2JlYWNvbicgPT09IHJlcVR5cGUgKSB7XG4gICAgICAgIHNlbmRCZWFjb24uY2FsbChzZWxmKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH07XG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH07XG59O1xuXG5mdW5jdGlvbiBzZW5kWGhyU3luYygpe1xuICB2YXIgeGhyID0gZ2V0WEhSKCk7XG4gIGlmICh4aHIpIHtcbiAgICB4aHIub3BlbignR0VUJywgdGhpcy51cmwsIGZhbHNlKTtcbiAgICB4aHIuc2VuZChudWxsKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxuZnVuY3Rpb24gc2VuZEpzb25wKCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JyksXG4gICAgICBwYXJlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgY2FsbGJhY2tOYW1lID0gJ2tlZW5KU09OUENhbGxiYWNrJyxcbiAgICAgIGxvYWRlZCA9IGZhbHNlO1xuICBjYWxsYmFja05hbWUgKz0gdGltZXN0YW1wO1xuICB3aGlsZSAoY2FsbGJhY2tOYW1lIGluIHdpbmRvdykge1xuICAgIGNhbGxiYWNrTmFtZSArPSAnYSc7XG4gIH1cbiAgd2luZG93W2NhbGxiYWNrTmFtZV0gPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgIGlmIChsb2FkZWQgPT09IHRydWUpIHJldHVybjtcbiAgICBsb2FkZWQgPSB0cnVlO1xuICAgIGhhbmRsZVN1Y2Nlc3MuY2FsbChzZWxmLCByZXNwb25zZSk7XG4gICAgY2xlYW51cCgpO1xuICB9O1xuICBzY3JpcHQuc3JjID0gc2VsZi51cmwgKyAnJmpzb25wPScgKyBjYWxsYmFja05hbWU7XG4gIHBhcmVudC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAvLyBmb3IgZWFybHkgSUUgdy8gbm8gb25lcnJvciBldmVudFxuICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGxvYWRlZCA9PT0gZmFsc2UgJiYgc2VsZi5yZWFkeVN0YXRlID09PSAnbG9hZGVkJykge1xuICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgIGhhbmRsZUVycm9yLmNhbGwoc2VsZik7XG4gICAgICBjbGVhbnVwKCk7XG4gICAgfVxuICB9O1xuICAvLyBub24taWUsIGV0Y1xuICBzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIG9uIElFOSBib3RoIG9uZXJyb3IgYW5kIG9ucmVhZHlzdGF0ZWNoYW5nZSBhcmUgY2FsbGVkXG4gICAgaWYgKGxvYWRlZCA9PT0gZmFsc2UpIHtcbiAgICAgIGxvYWRlZCA9IHRydWU7XG4gICAgICBoYW5kbGVFcnJvci5jYWxsKHNlbGYpO1xuICAgICAgY2xlYW51cCgpO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gY2xlYW51cCgpe1xuICAgIHdpbmRvd1tjYWxsYmFja05hbWVdID0gdW5kZWZpbmVkO1xuICAgIHRyeSB7XG4gICAgICBkZWxldGUgd2luZG93W2NhbGxiYWNrTmFtZV07XG4gICAgfSBjYXRjaChlKXt9XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2VuZEJlYWNvbigpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKSxcbiAgICAgIGxvYWRlZCA9IGZhbHNlO1xuICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgbG9hZGVkID0gdHJ1ZTtcbiAgICBpZiAoJ25hdHVyYWxIZWlnaHQnIGluIHRoaXMpIHtcbiAgICAgIGlmICh0aGlzLm5hdHVyYWxIZWlnaHQgKyB0aGlzLm5hdHVyYWxXaWR0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLm9uZXJyb3IoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy53aWR0aCArIHRoaXMuaGVpZ2h0ID09PSAwKSB7XG4gICAgICB0aGlzLm9uZXJyb3IoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaGFuZGxlU3VjY2Vzcy5jYWxsKHNlbGYpO1xuICB9O1xuICBpbWcub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIGxvYWRlZCA9IHRydWU7XG4gICAgaGFuZGxlRXJyb3IuY2FsbChzZWxmKTtcbiAgfTtcbiAgaW1nLnNyYyA9IHNlbGYudXJsICsgJyZjPWNsdjEnO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVTdWNjZXNzKHJlcyl7XG4gIHZhciBvcHRzID0gdGhpcy5yZXF1ZXN0VHlwZVsnb3B0aW9ucyddWydzdWNjZXNzJ10sXG4gICAgICByZXNwb25zZSA9ICcnO1xuICB4aHJTaGltLmNhbGwodGhpcywgb3B0cyk7XG4gIGlmIChyZXMpIHtcbiAgICB0cnkge1xuICAgICAgcmVzcG9uc2UgPSBKU09OLnN0cmluZ2lmeShyZXMpO1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuICBlbHNlIHtcbiAgICByZXNwb25zZSA9IG9wdHNbJ3Jlc3BvbnNlVGV4dCddO1xuICB9XG4gIHRoaXMueGhyLnJlc3BvbnNlVGV4dCA9IHJlc3BvbnNlO1xuICB0aGlzLnhoci5zdGF0dXMgPSBvcHRzWydzdGF0dXMnXTtcbiAgdGhpcy5lbWl0KCdlbmQnKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlRXJyb3IoKXtcbiAgdmFyIG9wdHMgPSB0aGlzLnJlcXVlc3RUeXBlWydvcHRpb25zJ11bJ2Vycm9yJ107XG4gIHhoclNoaW0uY2FsbCh0aGlzLCBvcHRzKTtcbiAgdGhpcy54aHIucmVzcG9uc2VUZXh0ID0gb3B0c1sncmVzcG9uc2VUZXh0J107XG4gIHRoaXMueGhyLnN0YXR1cyA9IG9wdHNbJ3N0YXR1cyddO1xuICB0aGlzLmVtaXQoJ2VuZCcpO1xufVxuXG4vLyBjdXN0b20gc3BpbiBvbiBzZWxmLmFib3J0KCk7XG5mdW5jdGlvbiBhYm9ydFJlcXVlc3QoKXtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xufVxuXG4vLyBoYWNrZXR5IGhhY2sgaGFjayA6KSBrZWVwIG1vdmluZ1xuZnVuY3Rpb24geGhyU2hpbShvcHRzKXtcbiAgdGhpcy54aHIgPSB7XG4gICAgZ2V0QWxsUmVzcG9uc2VIZWFkZXJzOiBmdW5jdGlvbigpeyByZXR1cm4gJyc7IH0sXG4gICAgZ2V0UmVzcG9uc2VIZWFkZXI6IGZ1bmN0aW9uKCl7IHJldHVybiAnYXBwbGljYXRpb24vanNvbic7IH0sXG4gICAgcmVzcG9uc2VUZXh0OiBvcHRzWydyZXNwb25zZVRleHQnXSxcbiAgICBzdGF0dXM6IG9wdHNbJ3N0YXR1cyddXG4gIH07XG4gIHJldHVybiB0aGlzO1xufVxuIiwidmFyIHJvb3QgPSAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHdpbmRvdyA/IHdpbmRvdyA6IHRoaXM7XG52YXIgcHJldmlvdXNfS2VlbiA9IHJvb3QuS2VlbjtcblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCcuL3V0aWxzL2VtaXR0ZXItc2hpbScpO1xuXG5mdW5jdGlvbiBLZWVuKGNvbmZpZykge1xuICB0aGlzLmNvbmZpZ3VyZShjb25maWcgfHwge30pO1xuICBLZWVuLnRyaWdnZXIoJ2NsaWVudCcsIHRoaXMpO1xufVxuXG5LZWVuLmRlYnVnID0gZmFsc2U7XG5LZWVuLmVuYWJsZWQgPSB0cnVlO1xuS2Vlbi5sb2FkZWQgPSB0cnVlO1xuS2Vlbi52ZXJzaW9uID0gJzAuMi4xJztcblxuRW1pdHRlcihLZWVuKTtcbkVtaXR0ZXIoS2Vlbi5wcm90b3R5cGUpO1xuXG5LZWVuLnByb3RvdHlwZS5jb25maWd1cmUgPSBmdW5jdGlvbihjZmcpe1xuICB2YXIgY29uZmlnID0gY2ZnIHx8IHt9O1xuICBpZiAoY29uZmlnWydob3N0J10pIHtcbiAgICBjb25maWdbJ2hvc3QnXS5yZXBsYWNlKC8uKj86XFwvXFwvL2csICcnKTtcbiAgfVxuICBpZiAoY29uZmlnLnByb3RvY29sICYmIGNvbmZpZy5wcm90b2NvbCA9PT0gJ2F1dG8nKSB7XG4gICAgY29uZmlnWydwcm90b2NvbCddID0gbG9jYXRpb24ucHJvdG9jb2wucmVwbGFjZSgvOi9nLCAnJyk7XG4gIH1cbiAgdGhpcy5jb25maWcgPSB7XG4gICAgcHJvamVjdElkICAgOiBjb25maWcucHJvamVjdElkLFxuICAgIHdyaXRlS2V5ICAgIDogY29uZmlnLndyaXRlS2V5LFxuICAgIHJlYWRLZXkgICAgIDogY29uZmlnLnJlYWRLZXksXG4gICAgbWFzdGVyS2V5ICAgOiBjb25maWcubWFzdGVyS2V5LFxuICAgIHJlcXVlc3RUeXBlIDogY29uZmlnLnJlcXVlc3RUeXBlIHx8ICdqc29ucCcsXG4gICAgaG9zdCAgICAgICAgOiBjb25maWdbJ2hvc3QnXSAgICAgfHwgJ2FwaS5rZWVuLmlvLzMuMCcsXG4gICAgcHJvdG9jb2wgICAgOiBjb25maWdbJ3Byb3RvY29sJ10gfHwgJ2h0dHBzJyxcbiAgICBnbG9iYWxQcm9wZXJ0aWVzOiBudWxsXG4gIH07XG4gIGlmIChLZWVuLmRlYnVnKSB7XG4gICAgdGhpcy5vbignZXJyb3InLCBLZWVuLmxvZyk7XG4gIH1cbiAgdGhpcy50cmlnZ2VyKCdyZWFkeScpO1xufTtcblxuS2Vlbi5wcm90b3R5cGUucHJvamVjdElkID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5jb25maWcucHJvamVjdElkO1xuICB0aGlzLmNvbmZpZy5wcm9qZWN0SWQgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5LZWVuLnByb3RvdHlwZS5tYXN0ZXJLZXkgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLmNvbmZpZy5tYXN0ZXJLZXk7XG4gIHRoaXMuY29uZmlnLm1hc3RlcktleSA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbktlZW4ucHJvdG90eXBlLnJlYWRLZXkgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLmNvbmZpZy5yZWFkS2V5O1xuICB0aGlzLmNvbmZpZy5yZWFkS2V5ID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuS2Vlbi5wcm90b3R5cGUud3JpdGVLZXkgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLmNvbmZpZy53cml0ZUtleTtcbiAgdGhpcy5jb25maWcud3JpdGVLZXkgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5LZWVuLnByb3RvdHlwZS51cmwgPSBmdW5jdGlvbihwYXRoKXtcbiAgaWYgKCF0aGlzLnByb2plY3RJZCgpKSB7XG4gICAgdGhpcy50cmlnZ2VyKCdlcnJvcicsICdDbGllbnQgaXMgbWlzc2luZyBwcm9qZWN0SWQgcHJvcGVydHknKTtcbiAgICByZXR1cm47XG4gIH1cbiAgcmV0dXJuIHRoaXMuY29uZmlnLnByb3RvY29sICsgJzovLycgKyB0aGlzLmNvbmZpZy5ob3N0ICsgJy9wcm9qZWN0cy8nICsgdGhpcy5wcm9qZWN0SWQoKSArIHBhdGg7XG59O1xuXG5LZWVuLmxvZyA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgaWYgKEtlZW4uZGVidWcgJiYgdHlwZW9mIGNvbnNvbGUgPT0gJ29iamVjdCcpIHtcbiAgICBjb25zb2xlLmxvZygnW0tlZW4gSU9dJywgbWVzc2FnZSk7XG4gIH1cbn07XG5cbktlZW4ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCl7XG4gIHJvb3QuS2VlbiA9IHByZXZpb3VzX0tlZW47XG4gIHJldHVybiBLZWVuO1xufTtcblxuS2Vlbi5yZWFkeSA9IGZ1bmN0aW9uKGZuKXtcbiAgaWYgKEtlZW4ubG9hZGVkKSB7XG4gICAgZm4oKTtcbiAgfSBlbHNlIHtcbiAgICBLZWVuLm9uY2UoJ3JlYWR5JywgZm4pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEtlZW47XG4iLCJ2YXIganNvbiA9IHJlcXVpcmUoJy4uL3V0aWxzL2pzb24tc2hpbScpO1xudmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5cbnZhciBLZWVuID0gcmVxdWlyZSgnLi4vaW5kZXgnKTtcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJy4uL3V0aWxzL2Jhc2U2NCcpLFxuICAgIGVhY2ggPSByZXF1aXJlKCcuLi91dGlscy9lYWNoJyksXG4gICAgZ2V0Q29udGV4dCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LWNvbnRleHQnKSxcbiAgICBnZXRRdWVyeVN0cmluZyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LXF1ZXJ5LXN0cmluZycpLFxuICAgIGdldFVybE1heExlbmd0aCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LXVybC1tYXgtbGVuZ3RoJyksXG4gICAgZ2V0WEhSID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQteGhyLW9iamVjdCcpLFxuICAgIHJlcXVlc3RUeXBlcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3VwZXJhZ2VudC1yZXF1ZXN0LXR5cGVzJyksXG4gICAgcmVzcG9uc2VIYW5kbGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdXBlcmFnZW50LWhhbmRsZS1yZXNwb25zZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHBheWxvYWQsIGNhbGxiYWNrLCBhc3luYykge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1cmxCYXNlID0gdGhpcy51cmwoJy9ldmVudHMvJyArIGVuY29kZVVSSUNvbXBvbmVudChjb2xsZWN0aW9uKSksXG4gICAgICByZXFUeXBlID0gdGhpcy5jb25maWcucmVxdWVzdFR5cGUsXG4gICAgICBkYXRhID0ge30sXG4gICAgICBjYiA9IGNhbGxiYWNrLFxuICAgICAgaXNBc3luYyxcbiAgICAgIGdldFVybDtcblxuICBpc0FzeW5jID0gKCdib29sZWFuJyA9PT0gdHlwZW9mIGFzeW5jKSA/IGFzeW5jIDogdHJ1ZTtcblxuICBpZiAoIUtlZW4uZW5hYmxlZCkge1xuICAgIGhhbmRsZVZhbGlkYXRpb25FcnJvci5jYWxsKHNlbGYsICdLZWVuLmVuYWJsZWQgPSBmYWxzZScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghc2VsZi5wcm9qZWN0SWQoKSkge1xuICAgIGhhbmRsZVZhbGlkYXRpb25FcnJvci5jYWxsKHNlbGYsICdNaXNzaW5nIHByb2plY3RJZCBwcm9wZXJ0eScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghc2VsZi53cml0ZUtleSgpKSB7XG4gICAgaGFuZGxlVmFsaWRhdGlvbkVycm9yLmNhbGwoc2VsZiwgJ01pc3Npbmcgd3JpdGVLZXkgcHJvcGVydHknKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNvbGxlY3Rpb24gfHwgdHlwZW9mIGNvbGxlY3Rpb24gIT09ICdzdHJpbmcnKSB7XG4gICAgaGFuZGxlVmFsaWRhdGlvbkVycm9yLmNhbGwoc2VsZiwgJ0NvbGxlY3Rpb24gbmFtZSBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQXR0YWNoIHByb3BlcnRpZXMgZnJvbSBjbGllbnQuZ2xvYmFsUHJvcGVydGllc1xuICBpZiAoc2VsZi5jb25maWcuZ2xvYmFsUHJvcGVydGllcykge1xuICAgIGRhdGEgPSBzZWxmLmNvbmZpZy5nbG9iYWxQcm9wZXJ0aWVzKGNvbGxlY3Rpb24pO1xuICB9XG4gIC8vIEF0dGFjaCBwcm9wZXJ0aWVzIGZyb20gdXNlci1kZWZpbmVkIGV2ZW50XG4gIGVhY2gocGF5bG9hZCwgZnVuY3Rpb24odmFsdWUsIGtleSl7XG4gICAgZGF0YVtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIE92ZXJyaWRlIHJlcVR5cGUgaWYgWEhSIG5vdCBzdXBwb3J0ZWRcbiAgaWYgKCAhZ2V0WEhSKCkgJiYgJ3hocicgPT09IHJlcVR5cGUgKSB7XG4gICAgcmVxVHlwZSA9ICdqc29ucCc7XG4gIH1cblxuICAvLyBQcmUtZmxpZ2h0IGZvciBHRVQgcmVxdWVzdHNcbiAgaWYgKCAneGhyJyAhPT0gcmVxVHlwZSB8fCAhaXNBc3luYyApIHtcbiAgICBnZXRVcmwgPSBwcmVwYXJlR2V0UmVxdWVzdC5jYWxsKHNlbGYsIHVybEJhc2UsIGRhdGEpO1xuICB9XG5cbiAgaWYgKCBnZXRVcmwgJiYgZ2V0Q29udGV4dCgpID09PSAnYnJvd3NlcicgKSB7XG4gICAgcmVxdWVzdFxuICAgICAgLmdldChnZXRVcmwpXG4gICAgICAudXNlKHJlcXVlc3RUeXBlcyhyZXFUeXBlLCB7IGFzeW5jOiBpc0FzeW5jIH0pKVxuICAgICAgLmVuZChoYW5kbGVSZXNwb25zZSk7XG4gIH1cbiAgZWxzZSBpZiAoIGdldFhIUigpIHx8IGdldENvbnRleHQoKSA9PT0gJ3NlcnZlcicgKSB7XG4gICAgcmVxdWVzdFxuICAgICAgLnBvc3QodXJsQmFzZSlcbiAgICAgIC5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCBzZWxmLndyaXRlS2V5KCkpXG4gICAgICAuc2VuZChkYXRhKVxuICAgICAgLmVuZChoYW5kbGVSZXNwb25zZSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgc2VsZi50cmlnZ2VyKCdlcnJvcicsICdSZXF1ZXN0IG5vdCBzZW50OiBVUkwgbGVuZ3RoIGV4Y2VlZHMgY3VycmVudCBicm93c2VyIGxpbWl0LCBhbmQgWEhSIChQT1NUKSBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UoZXJyLCByZXMpe1xuICAgIHJlc3BvbnNlSGFuZGxlcihlcnIsIHJlcywgY2IpO1xuICAgIGNiID0gY2FsbGJhY2sgPSBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlVmFsaWRhdGlvbkVycm9yKG1zZyl7XG4gICAgdmFyIGVyciA9ICdFdmVudCBub3QgcmVjb3JkZWQ6ICcgKyBtc2c7XG4gICAgc2VsZi50cmlnZ2VyKCdlcnJvcicsIGVycik7XG4gICAgaWYgKGNiKSB7XG4gICAgICBjYi5jYWxsKHNlbGYsIGVyciwgbnVsbCk7XG4gICAgICBjYiA9IGNhbGxiYWNrID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICByZXR1cm47XG59O1xuXG5mdW5jdGlvbiBwcmVwYXJlR2V0UmVxdWVzdCh1cmwsIGRhdGEpe1xuICAvLyBTZXQgQVBJIGtleVxuICB1cmwgKz0gZ2V0UXVlcnlTdHJpbmcoe1xuICAgIGFwaV9rZXkgIDogdGhpcy53cml0ZUtleSgpLFxuICAgIGRhdGEgICAgIDogYmFzZTY0LmVuY29kZSgganNvbi5zdHJpbmdpZnkoZGF0YSkgKSxcbiAgICBtb2RpZmllZCA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gIH0pO1xuICByZXR1cm4gKCB1cmwubGVuZ3RoIDwgZ2V0VXJsTWF4TGVuZ3RoKCkgKSA/IHVybCA6IGZhbHNlO1xufVxuIiwidmFyIEtlZW4gPSByZXF1aXJlKCcuLi9pbmRleCcpO1xudmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5cbnZhciBlYWNoID0gcmVxdWlyZSgnLi4vdXRpbHMvZWFjaCcpLFxuICAgIGdldENvbnRleHQgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC1jb250ZXh0JyksXG4gICAgZ2V0WEhSID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQteGhyLW9iamVjdCcpLFxuICAgIHJlcXVlc3RUeXBlcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3VwZXJhZ2VudC1yZXF1ZXN0LXR5cGVzJyksXG4gICAgcmVzcG9uc2VIYW5kbGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdXBlcmFnZW50LWhhbmRsZS1yZXNwb25zZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHBheWxvYWQsIGNhbGxiYWNrKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHVybEJhc2UgPSB0aGlzLnVybCgnL2V2ZW50cycpLFxuICAgICAgZGF0YSA9IHt9LFxuICAgICAgY2IgPSBjYWxsYmFjaztcblxuICBpZiAoIUtlZW4uZW5hYmxlZCkge1xuICAgIGhhbmRsZVZhbGlkYXRpb25FcnJvci5jYWxsKHNlbGYsICdLZWVuLmVuYWJsZWQgPSBmYWxzZScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghc2VsZi5wcm9qZWN0SWQoKSkge1xuICAgIGhhbmRsZVZhbGlkYXRpb25FcnJvci5jYWxsKHNlbGYsICdNaXNzaW5nIHByb2plY3RJZCBwcm9wZXJ0eScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghc2VsZi53cml0ZUtleSgpKSB7XG4gICAgaGFuZGxlVmFsaWRhdGlvbkVycm9yLmNhbGwoc2VsZiwgJ01pc3Npbmcgd3JpdGVLZXkgcHJvcGVydHknKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICBoYW5kbGVWYWxpZGF0aW9uRXJyb3IuY2FsbChzZWxmLCAnSW5jb3JyZWN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byAjYWRkRXZlbnRzIG1ldGhvZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcGF5bG9hZCAhPT0gJ29iamVjdCcgfHwgcGF5bG9hZCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgaGFuZGxlVmFsaWRhdGlvbkVycm9yLmNhbGwoc2VsZiwgJ1JlcXVlc3QgcGF5bG9hZCBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEF0dGFjaCBwcm9wZXJ0aWVzIGZyb20gY2xpZW50Lmdsb2JhbFByb3BlcnRpZXNcbiAgaWYgKHNlbGYuY29uZmlnLmdsb2JhbFByb3BlcnRpZXMpIHtcbiAgICAvLyBMb29wIG92ZXIgZWFjaCBzZXQgb2YgZXZlbnRzXG4gICAgZWFjaChwYXlsb2FkLCBmdW5jdGlvbihldmVudHMsIGNvbGxlY3Rpb24pe1xuICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggaW5kaXZpZHVhbCBldmVudFxuICAgICAgZWFjaChldmVudHMsIGZ1bmN0aW9uKGJvZHksIGluZGV4KXtcbiAgICAgICAgLy8gU3RhcnQgd2l0aCBnbG9iYWwgcHJvcGVydGllcyBmb3IgdGhpcyBjb2xsZWN0aW9uXG4gICAgICAgIHZhciBiYXNlID0gc2VsZi5jb25maWcuZ2xvYmFsUHJvcGVydGllcyhjb2xsZWN0aW9uKTtcbiAgICAgICAgLy8gQXBwbHkgcHJvdmlkZWQgcHJvcGVydGllcyBmb3IgdGhpcyBldmVudCBib2R5XG4gICAgICAgIGVhY2goYm9keSwgZnVuY3Rpb24odmFsdWUsIGtleSl7XG4gICAgICAgICAgYmFzZVtrZXldID0gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgcGF5bG9hZFxuICAgICAgICBkYXRhW2NvbGxlY3Rpb25dLnB1c2goYmFzZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBVc2UgZXhpc3RpbmcgcGF5bG9hZFxuICAgIGRhdGEgPSBwYXlsb2FkO1xuICB9XG5cbiAgaWYgKCBnZXRYSFIoKSB8fCBnZXRDb250ZXh0KCkgPT09ICdzZXJ2ZXInICkge1xuICAgIHJlcXVlc3RcbiAgICAgIC5wb3N0KHVybEJhc2UpXG4gICAgICAuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgc2VsZi53cml0ZUtleSgpKVxuICAgICAgLnNlbmQoZGF0YSlcbiAgICAgIC5lbmQoZnVuY3Rpb24oZXJyLCByZXMpe1xuICAgICAgICByZXNwb25zZUhhbmRsZXIoZXJyLCByZXMsIGNiKTtcbiAgICAgICAgY2IgPSBjYWxsYmFjayA9IG51bGw7XG4gICAgICB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBUT0RPOiBxdWV1ZSBhbmQgZmlyZSBpbiBzbWFsbCwgYXN5bmNocm9ub3VzIGJhdGNoZXNcbiAgICBzZWxmLnRyaWdnZXIoJ2Vycm9yJywgJ0V2ZW50cyBub3QgcmVjb3JkZWQ6IFhIUiBzdXBwb3J0IGlzIHJlcXVpcmVkIGZvciBiYXRjaCB1cGxvYWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVZhbGlkYXRpb25FcnJvcihtc2cpe1xuICAgIHZhciBlcnIgPSAnRXZlbnRzIG5vdCByZWNvcmRlZDogJyArIG1zZztcbiAgICBzZWxmLnRyaWdnZXIoJ2Vycm9yJywgZXJyKTtcbiAgICBpZiAoY2IpIHtcbiAgICAgIGNiLmNhbGwoc2VsZiwgZXJyLCBudWxsKTtcbiAgICAgIGNiID0gY2FsbGJhY2sgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybjtcbn07XG4iLCJ2YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcbnZhciBnZXRRdWVyeVN0cmluZyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LXF1ZXJ5LXN0cmluZycpLFxuICAgIGhhbmRsZVJlc3BvbnNlID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdXBlcmFnZW50LWhhbmRsZS1yZXNwb25zZScpLFxuICAgIHJlcXVlc3RUeXBlcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3VwZXJhZ2VudC1yZXF1ZXN0LXR5cGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXJsLCBwYXJhbXMsIGFwaV9rZXksIGNhbGxiYWNrKXtcbiAgdmFyIHJlcVR5cGUgPSB0aGlzLmNvbmZpZy5yZXF1ZXN0VHlwZSxcbiAgICAgIGRhdGEgPSBwYXJhbXMgfHwge307XG5cbiAgaWYgKHJlcVR5cGUgPT09ICdiZWFjb24nKSB7XG4gICAgcmVxVHlwZSA9ICdqc29ucCc7XG4gIH1cblxuICAvLyBFbnN1cmUgYXBpX2tleSBpcyBwcmVzZW50IGZvciBHRVQgcmVxdWVzdHNcbiAgZGF0YVsnYXBpX2tleSddID0gZGF0YVsnYXBpX2tleSddIHx8IGFwaV9rZXk7XG5cbiAgcmVxdWVzdFxuICAgIC5nZXQodXJsK2dldFF1ZXJ5U3RyaW5nKGRhdGEpKVxuICAgIC51c2UocmVxdWVzdFR5cGVzKHJlcVR5cGUpKVxuICAgIC5lbmQoZnVuY3Rpb24oZXJyLCByZXMpe1xuICAgICAgaGFuZGxlUmVzcG9uc2UoZXJyLCByZXMsIGNhbGxiYWNrKTtcbiAgICAgIGNhbGxiYWNrID0gbnVsbDtcbiAgICB9KTtcbn07XG4iLCJ2YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcbnZhciBoYW5kbGVSZXNwb25zZSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3VwZXJhZ2VudC1oYW5kbGUtcmVzcG9uc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGFwaV9rZXksIGNhbGxiYWNrKXtcbiAgcmVxdWVzdFxuICAgIC5wb3N0KHVybClcbiAgICAuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgLnNldCgnQXV0aG9yaXphdGlvbicsIGFwaV9rZXkpXG4gICAgLnNlbmQoZGF0YSB8fCB7fSlcbiAgICAuZW5kKGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgICBoYW5kbGVSZXNwb25zZShlcnIsIHJlcywgY2FsbGJhY2spO1xuICAgICAgY2FsbGJhY2sgPSBudWxsO1xuICAgIH0pO1xufTtcbiIsInZhciBSZXF1ZXN0ID0gcmVxdWlyZShcIi4uL3JlcXVlc3RcIik7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHF1ZXJ5LCBjYWxsYmFjaykge1xuICB2YXIgcXVlcmllcyA9IFtdLFxuICAgICAgY2IgPSBjYWxsYmFjayxcbiAgICAgIHJlcXVlc3Q7XG5cbiAgaWYgKHF1ZXJ5IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBxdWVyaWVzID0gcXVlcnk7XG4gIH0gZWxzZSB7XG4gICAgcXVlcmllcy5wdXNoKHF1ZXJ5KTtcbiAgfVxuICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodGhpcywgcXVlcmllcywgY2IpLnJlZnJlc2goKTtcbiAgY2IgPSBjYWxsYmFjayA9IG51bGw7XG4gIHJldHVybiByZXF1ZXN0O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmV3R2xvYmFsUHJvcGVydGllcykge1xuICBpZiAobmV3R2xvYmFsUHJvcGVydGllcyAmJiB0eXBlb2YobmV3R2xvYmFsUHJvcGVydGllcykgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdGhpcy5jb25maWcuZ2xvYmFsUHJvcGVydGllcyA9IG5ld0dsb2JhbFByb3BlcnRpZXM7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy50cmlnZ2VyKFwiZXJyb3JcIiwgXCJJbnZhbGlkIHZhbHVlIGZvciBnbG9iYWwgcHJvcGVydGllczogXCIgKyBuZXdHbG9iYWxQcm9wZXJ0aWVzKTtcbiAgfVxufTtcbiIsIi8vIHZhciBzZW5kRXZlbnQgPSByZXF1aXJlKFwiLi4vdXRpbHMvc2VuZEV2ZW50XCIpO1xudmFyIGFkZEV2ZW50ID0gcmVxdWlyZShcIi4vYWRkRXZlbnRcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oanNFdmVudCwgZXZlbnRDb2xsZWN0aW9uLCBwYXlsb2FkLCB0aW1lb3V0LCB0aW1lb3V0Q2FsbGJhY2spe1xuICB2YXIgZXZ0ID0ganNFdmVudCxcbiAgICAgIHRhcmdldCA9IChldnQuY3VycmVudFRhcmdldCkgPyBldnQuY3VycmVudFRhcmdldCA6IChldnQuc3JjRWxlbWVudCB8fCBldnQudGFyZ2V0KSxcbiAgICAgIHRpbWVyID0gdGltZW91dCB8fCA1MDAsXG4gICAgICB0cmlnZ2VyZWQgPSBmYWxzZSxcbiAgICAgIHRhcmdldEF0dHIgPSBcIlwiLFxuICAgICAgY2FsbGJhY2ssXG4gICAgICB3aW47XG5cbiAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUgIT09IHZvaWQgMCkge1xuICAgIHRhcmdldEF0dHIgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKFwidGFyZ2V0XCIpO1xuICB9IGVsc2UgaWYgKHRhcmdldC50YXJnZXQpIHtcbiAgICB0YXJnZXRBdHRyID0gdGFyZ2V0LnRhcmdldDtcbiAgfVxuXG4gIGlmICgodGFyZ2V0QXR0ciA9PSBcIl9ibGFua1wiIHx8IHRhcmdldEF0dHIgPT0gXCJibGFua1wiKSAmJiAhZXZ0Lm1ldGFLZXkpIHtcbiAgICB3aW4gPSB3aW5kb3cub3BlbihcImFib3V0OmJsYW5rXCIpO1xuICAgIHdpbi5kb2N1bWVudC5sb2NhdGlvbiA9IHRhcmdldC5ocmVmO1xuICB9XG5cbiAgaWYgKHRhcmdldC5ub2RlTmFtZSA9PT0gXCJBXCIpIHtcbiAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZighdHJpZ2dlcmVkICYmICFldnQubWV0YUtleSAmJiAodGFyZ2V0QXR0ciAhPT0gXCJfYmxhbmtcIiAmJiB0YXJnZXRBdHRyICE9PSBcImJsYW5rXCIpKXtcbiAgICAgICAgdHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gdGFyZ2V0LmhyZWY7XG4gICAgICB9XG4gICAgfTtcbiAgfSBlbHNlIGlmICh0YXJnZXQubm9kZU5hbWUgPT09IFwiRk9STVwiKSB7XG4gICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpe1xuICAgICAgaWYoIXRyaWdnZXJlZCl7XG4gICAgICAgIHRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgIHRhcmdldC5zdWJtaXQoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHRoaXMudHJpZ2dlcihcImVycm9yXCIsIFwiI3RyYWNrRXh0ZXJuYWxMaW5rIG1ldGhvZCBub3QgYXR0YWNoZWQgdG8gYW4gPGE+IG9yIDxmb3JtPiBET00gZWxlbWVudFwiKTtcbiAgfVxuXG4gIGlmICh0aW1lb3V0Q2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZighdHJpZ2dlcmVkKXtcbiAgICAgICAgdHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgdGltZW91dENhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBhZGRFdmVudC5jYWxsKHRoaXMsIGV2ZW50Q29sbGVjdGlvbiwgcGF5bG9hZCwgY2FsbGJhY2spO1xuXG4gIHNldFRpbWVvdXQoY2FsbGJhY2ssIHRpbWVyKTtcbiAgaWYgKCFldnQubWV0YUtleSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4vdXRpbHMvZWFjaFwiKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKFwiLi91dGlscy9leHRlbmRcIiksXG4gICAgZ2V0VGltZXpvbmVPZmZzZXQgPSByZXF1aXJlKFwiLi9oZWxwZXJzL2dldC10aW1lem9uZS1vZmZzZXRcIiksXG4gICAgZ2V0UXVlcnlTdHJpbmcgPSByZXF1aXJlKFwiLi9oZWxwZXJzL2dldC1xdWVyeS1zdHJpbmdcIik7XG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnLi91dGlscy9lbWl0dGVyLXNoaW0nKTtcblxuZnVuY3Rpb24gUXVlcnkoKXtcbiAgdGhpcy5jb25maWd1cmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5FbWl0dGVyKFF1ZXJ5LnByb3RvdHlwZSk7XG5cblF1ZXJ5LnByb3RvdHlwZS5jb25maWd1cmUgPSBmdW5jdGlvbihhbmFseXNpc1R5cGUsIHBhcmFtcykge1xuICB0aGlzLmFuYWx5c2lzID0gYW5hbHlzaXNUeXBlO1xuXG4gIC8vIEFwcGx5IHBhcmFtcyB3LyAjc2V0IG1ldGhvZFxuICB0aGlzLnBhcmFtcyA9IHRoaXMucGFyYW1zIHx8IHt9O1xuICB0aGlzLnNldChwYXJhbXMpO1xuXG4gIC8vIExvY2FsaXplIHRpbWV6b25lIGlmIG5vbmUgaXMgc2V0XG4gIGlmICh0aGlzLnBhcmFtcy50aW1lem9uZSA9PT0gdm9pZCAwKSB7XG4gICAgdGhpcy5wYXJhbXMudGltZXpvbmUgPSBnZXRUaW1lem9uZU9mZnNldCgpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuUXVlcnkucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGF0dHJpYnV0ZXMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBlYWNoKGF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHYsIGspe1xuICAgIHZhciBrZXkgPSBrLCB2YWx1ZSA9IHY7XG4gICAgaWYgKGsubWF0Y2gobmV3IFJlZ0V4cChcIltBLVpdXCIpKSkge1xuICAgICAga2V5ID0gay5yZXBsYWNlKC8oW0EtWl0pL2csIGZ1bmN0aW9uKCQxKSB7IHJldHVybiBcIl9cIiskMS50b0xvd2VyQ2FzZSgpOyB9KTtcbiAgICB9XG4gICAgc2VsZi5wYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBlYWNoKHZhbHVlLCBmdW5jdGlvbihkdiwgaW5kZXgpe1xuICAgICAgICBpZiAoZHYgaW5zdGFuY2VvZiBBcnJheSA9PSBmYWxzZSAmJiB0eXBlb2YgZHYgPT09IFwib2JqZWN0XCIpIHsgLy8gIF90eXBlKGR2KT09PVwiT2JqZWN0XCJcbiAgICAgICAgICBlYWNoKGR2LCBmdW5jdGlvbihkZWVwVmFsdWUsIGRlZXBLZXkpe1xuICAgICAgICAgICAgaWYgKGRlZXBLZXkubWF0Y2gobmV3IFJlZ0V4cChcIltBLVpdXCIpKSkge1xuICAgICAgICAgICAgICB2YXIgX2RlZXBLZXkgPSBkZWVwS2V5LnJlcGxhY2UoLyhbQS1aXSkvZywgZnVuY3Rpb24oJDEpIHsgcmV0dXJuIFwiX1wiKyQxLnRvTG93ZXJDYXNlKCk7IH0pO1xuICAgICAgICAgICAgICBkZWxldGUgc2VsZi5wYXJhbXNba2V5XVtpbmRleF1bZGVlcEtleV07XG4gICAgICAgICAgICAgIHNlbGYucGFyYW1zW2tleV1baW5kZXhdW19kZWVwS2V5XSA9IGRlZXBWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5RdWVyeS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oYXR0cmlidXRlKSB7XG4gIHZhciBrZXkgPSBhdHRyaWJ1dGU7XG4gIGlmIChrZXkubWF0Y2gobmV3IFJlZ0V4cChcIltBLVpdXCIpKSkge1xuICAgIGtleSA9IGtleS5yZXBsYWNlKC8oW0EtWl0pL2csIGZ1bmN0aW9uKCQxKSB7IHJldHVybiBcIl9cIiskMS50b0xvd2VyQ2FzZSgpOyB9KTtcbiAgfVxuICBpZiAodGhpcy5wYXJhbXMpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJhbXNba2V5XSB8fCBudWxsO1xuICB9XG59O1xuXG5RdWVyeS5wcm90b3R5cGUuYWRkRmlsdGVyID0gZnVuY3Rpb24ocHJvcGVydHksIG9wZXJhdG9yLCB2YWx1ZSkge1xuICB0aGlzLnBhcmFtcy5maWx0ZXJzID0gdGhpcy5wYXJhbXMuZmlsdGVycyB8fCBbXTtcbiAgdGhpcy5wYXJhbXMuZmlsdGVycy5wdXNoKHtcbiAgICBcInByb3BlcnR5X25hbWVcIjogcHJvcGVydHksXG4gICAgXCJvcGVyYXRvclwiOiBvcGVyYXRvcixcbiAgICBcInByb3BlcnR5X3ZhbHVlXCI6IHZhbHVlXG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnk7XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuL3V0aWxzL2VhY2hcIiksXG4gICAgZXh0ZW5kID0gcmVxdWlyZShcIi4vdXRpbHMvZXh0ZW5kXCIpLFxuICAgIHNlbmRRdWVyeSA9IHJlcXVpcmUoXCIuL3V0aWxzL3NlbmRRdWVyeVwiKTtcblxudmFyIEtlZW4gPSByZXF1aXJlKFwiLi9cIik7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJy4vdXRpbHMvZW1pdHRlci1zaGltJyk7XG5cbmZ1bmN0aW9uIFJlcXVlc3QoY2xpZW50LCBxdWVyaWVzLCBjYWxsYmFjayl7XG4gIHZhciBjYiA9IGNhbGxiYWNrO1xuICB0aGlzLmNvbmZpZyA9IHtcbiAgICB0aW1lb3V0OiAzMDAgKiAxMDAwXG4gIH07XG4gIHRoaXMuY29uZmlndXJlKGNsaWVudCwgcXVlcmllcywgY2IpO1xuICBjYiA9IGNhbGxiYWNrID0gbnVsbDtcbn07XG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblxuUmVxdWVzdC5wcm90b3R5cGUuY29uZmlndXJlID0gZnVuY3Rpb24oY2xpZW50LCBxdWVyaWVzLCBjYWxsYmFjayl7XG4gIHZhciBjYiA9IGNhbGxiYWNrO1xuICBleHRlbmQodGhpcywge1xuICAgIFwiY2xpZW50XCIgICA6IGNsaWVudCxcbiAgICBcInF1ZXJpZXNcIiAgOiBxdWVyaWVzLFxuICAgIFwiZGF0YVwiICAgICA6IHt9LFxuICAgIFwiY2FsbGJhY2tcIiA6IGNiXG4gIH0pO1xuICBjYiA9IGNhbGxiYWNrID0gbnVsbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLmNvbmZpZy50aW1lb3V0O1xuICB0aGlzLmNvbmZpZy50aW1lb3V0ID0gKCFpc05hTihwYXJzZUludChtcykpID8gcGFyc2VJbnQobXMpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGNvbXBsZXRpb25zID0gMCxcbiAgICAgIHJlc3BvbnNlID0gW10sXG4gICAgICBlcnJvcmVkID0gZmFsc2U7XG5cbiAgdmFyIGhhbmRsZVJlc3BvbnNlID0gZnVuY3Rpb24oZXJyLCByZXMsIGluZGV4KXtcbiAgICBpZiAoZXJyb3JlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXJyKSB7XG4gICAgICBzZWxmLnRyaWdnZXIoXCJlcnJvclwiLCBlcnIpO1xuICAgICAgaWYgKHNlbGYuY2FsbGJhY2spIHtcbiAgICAgICAgc2VsZi5jYWxsYmFjayhlcnIsIG51bGwpO1xuICAgICAgfVxuICAgICAgZXJyb3JlZCA9IHRydWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlc3BvbnNlW2luZGV4XSA9IHJlcztcbiAgICBjb21wbGV0aW9ucysrO1xuICAgIGlmIChjb21wbGV0aW9ucyA9PSBzZWxmLnF1ZXJpZXMubGVuZ3RoICYmICFlcnJvcmVkKSB7XG4gICAgICBzZWxmLmRhdGEgPSAoc2VsZi5xdWVyaWVzLmxlbmd0aCA9PSAxKSA/IHJlc3BvbnNlWzBdIDogcmVzcG9uc2U7XG4gICAgICBzZWxmLnRyaWdnZXIoXCJjb21wbGV0ZVwiLCBudWxsLCBzZWxmLmRhdGEpO1xuICAgICAgaWYgKHNlbGYuY2FsbGJhY2spIHtcbiAgICAgICAgc2VsZi5jYWxsYmFjayhudWxsLCBzZWxmLmRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBlYWNoKHNlbGYucXVlcmllcywgZnVuY3Rpb24ocXVlcnksIGluZGV4KXtcbiAgICB2YXIgcGF0aDtcbiAgICB2YXIgY2JTZXF1ZW5jZXIgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gICAgICBoYW5kbGVSZXNwb25zZShlcnIsIHJlcywgaW5kZXgpO1xuICAgIH07XG5cbiAgICBpZiAocXVlcnkgaW5zdGFuY2VvZiBLZWVuLlF1ZXJ5KSB7XG4gICAgICBwYXRoID0gXCIvcXVlcmllcy9cIiArIHF1ZXJ5LmFuYWx5c2lzO1xuICAgICAgc2VuZFF1ZXJ5LmNhbGwoc2VsZiwgcGF0aCwgcXVlcnkucGFyYW1zLCBjYlNlcXVlbmNlcik7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocXVlcnkpID09PSBcIltvYmplY3QgU3RyaW5nXVwiICkge1xuICAgICAgcGF0aCA9IFwiL3NhdmVkX3F1ZXJpZXMvXCIgKyBlbmNvZGVVUklDb21wb25lbnQocXVlcnkpICsgXCIvcmVzdWx0XCI7XG4gICAgICBzZW5kUXVlcnkuY2FsbChzZWxmLCBwYXRoLCBudWxsLCBjYlNlcXVlbmNlcik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHJlcyA9IHtcbiAgICAgICAgc3RhdHVzVGV4dDogXCJCYWQgUmVxdWVzdFwiLFxuICAgICAgICByZXNwb25zZVRleHQ6IHsgbWVzc2FnZTogXCJFcnJvcjogUXVlcnkgXCIgKyAoK2luZGV4KzEpICsgXCIgb2YgXCIgKyBzZWxmLnF1ZXJpZXMubGVuZ3RoICsgXCIgZm9yIHByb2plY3QgXCIgKyBzZWxmLmNsaWVudC5wcm9qZWN0SWQoKSArIFwiIGlzIG5vdCBhIHZhbGlkIHJlcXVlc3RcIiB9XG4gICAgICB9O1xuICAgICAgc2VsZi50cmlnZ2VyKFwiZXJyb3JcIiwgcmVzLnJlc3BvbnNlVGV4dC5tZXNzYWdlKTtcbiAgICAgIGlmIChzZWxmLmNhbGxiYWNrKSB7XG4gICAgICAgIHNlbGYuY2FsbGJhY2socmVzLnJlc3BvbnNlVGV4dC5tZXNzYWdlLCBudWxsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVxdWVzdDtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBtYXA6IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIixcbiAgZW5jb2RlOiBmdW5jdGlvbiAobikge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciBvID0gXCJcIiwgaSA9IDAsIG0gPSB0aGlzLm1hcCwgaTEsIGkyLCBpMywgZTEsIGUyLCBlMywgZTQ7XG4gICAgbiA9IHRoaXMudXRmOC5lbmNvZGUobik7XG4gICAgd2hpbGUgKGkgPCBuLmxlbmd0aCkge1xuICAgICAgaTEgPSBuLmNoYXJDb2RlQXQoaSsrKTsgaTIgPSBuLmNoYXJDb2RlQXQoaSsrKTsgaTMgPSBuLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgIGUxID0gKGkxID4+IDIpOyBlMiA9ICgoKGkxICYgMykgPDwgNCkgfCAoaTIgPj4gNCkpOyBlMyA9IChpc05hTihpMikgPyA2NCA6ICgoaTIgJiAxNSkgPDwgMikgfCAoaTMgPj4gNikpO1xuICAgICAgZTQgPSAoaXNOYU4oaTIpIHx8IGlzTmFOKGkzKSkgPyA2NCA6IGkzICYgNjM7XG4gICAgICBvID0gbyArIG0uY2hhckF0KGUxKSArIG0uY2hhckF0KGUyKSArIG0uY2hhckF0KGUzKSArIG0uY2hhckF0KGU0KTtcbiAgICB9IHJldHVybiBvO1xuICB9LFxuICBkZWNvZGU6IGZ1bmN0aW9uIChuKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG8gPSBcIlwiLCBpID0gMCwgbSA9IHRoaXMubWFwLCBjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUsIGUxLCBlMiwgZTMsIGU0LCBjMSwgYzIsIGMzO1xuICAgIG4gPSBuLnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXFw9XS9nLCBcIlwiKTtcbiAgICB3aGlsZSAoaSA8IG4ubGVuZ3RoKSB7XG4gICAgICBlMSA9IG0uaW5kZXhPZihuLmNoYXJBdChpKyspKTsgZTIgPSBtLmluZGV4T2Yobi5jaGFyQXQoaSsrKSk7XG4gICAgICBlMyA9IG0uaW5kZXhPZihuLmNoYXJBdChpKyspKTsgZTQgPSBtLmluZGV4T2Yobi5jaGFyQXQoaSsrKSk7XG4gICAgICBjMSA9IChlMSA8PCAyKSB8IChlMiA+PiA0KTsgYzIgPSAoKGUyICYgMTUpIDw8IDQpIHwgKGUzID4+IDIpO1xuICAgICAgYzMgPSAoKGUzICYgMykgPDwgNikgfCBlNDtcbiAgICAgIG8gPSBvICsgKGNjKGMxKSArICgoZTMgIT0gNjQpID8gY2MoYzIpIDogXCJcIikpICsgKCgoZTQgIT0gNjQpID8gY2MoYzMpIDogXCJcIikpO1xuICAgIH0gcmV0dXJuIHRoaXMudXRmOC5kZWNvZGUobyk7XG4gIH0sXG4gIHV0Zjg6IHtcbiAgICBlbmNvZGU6IGZ1bmN0aW9uIChuKSB7XG4gICAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAgIHZhciBvID0gXCJcIiwgaSA9IDAsIGNjID0gU3RyaW5nLmZyb21DaGFyQ29kZSwgYztcbiAgICAgIHdoaWxlIChpIDwgbi5sZW5ndGgpIHtcbiAgICAgICAgYyA9IG4uY2hhckNvZGVBdChpKyspOyBvID0gbyArICgoYyA8IDEyOCkgPyBjYyhjKSA6ICgoYyA+IDEyNykgJiYgKGMgPCAyMDQ4KSkgP1xuICAgICAgICAoY2MoKGMgPj4gNikgfCAxOTIpICsgY2MoKGMgJiA2MykgfCAxMjgpKSA6IChjYygoYyA+PiAxMikgfCAyMjQpICsgY2MoKChjID4+IDYpICYgNjMpIHwgMTI4KSArIGNjKChjICYgNjMpIHwgMTI4KSkpO1xuICAgICAgICB9IHJldHVybiBvO1xuICAgIH0sXG4gICAgZGVjb2RlOiBmdW5jdGlvbiAobikge1xuICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgICB2YXIgbyA9IFwiXCIsIGkgPSAwLCBjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUsIGMyLCBjO1xuICAgICAgd2hpbGUgKGkgPCBuLmxlbmd0aCkge1xuICAgICAgICBjID0gbi5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBvID0gbyArICgoYyA8IDEyOCkgPyBbY2MoYyksIGkrK11bMF0gOiAoKGMgPiAxOTEpICYmIChjIDwgMjI0KSkgP1xuICAgICAgICBbY2MoKChjICYgMzEpIDw8IDYpIHwgKChjMiA9IG4uY2hhckNvZGVBdChpICsgMSkpICYgNjMpKSwgKGkgKz0gMildWzBdIDpcbiAgICAgICAgW2NjKCgoYyAmIDE1KSA8PCAxMikgfCAoKChjMiA9IG4uY2hhckNvZGVBdChpICsgMSkpICYgNjMpIDw8IDYpIHwgKChjMyA9IG4uY2hhckNvZGVBdChpICsgMikpICYgNjMpKSwgKGkgKz0gMyldWzBdKTtcbiAgICAgIH0gcmV0dXJuIG87XG4gICAgfVxuICB9XG59O1xuIiwidmFyIGpzb24gPSByZXF1aXJlKCcuL2pzb24tc2hpbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICByZXR1cm4ganNvbi5wYXJzZSgganNvbi5zdHJpbmdpZnkoIHRhcmdldCApICk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvLCBjYiwgcyl7XG4gIHZhciBuO1xuICBpZiAoIW8pe1xuICAgIHJldHVybiAwO1xuICB9XG4gIHMgPSAhcyA/IG8gOiBzO1xuICBpZiAobyBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAvLyBJbmRleGVkIGFycmF5cywgbmVlZGVkIGZvciBTYWZhcmlcbiAgICBmb3IgKG49MDsgbjxvLmxlbmd0aDsgbisrKSB7XG4gICAgICBpZiAoY2IuY2FsbChzLCBvW25dLCBuLCBvKSA9PT0gZmFsc2Upe1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSGFzaHRhYmxlc1xuICAgIGZvciAobiBpbiBvKXtcbiAgICAgIGlmIChvLmhhc093blByb3BlcnR5KG4pKSB7XG4gICAgICAgIGlmIChjYi5jYWxsKHMsIG9bbl0sIG4sIG8pID09PSBmYWxzZSl7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIDE7XG59O1xuIiwidmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdjb21wb25lbnQtZW1pdHRlcicpO1xuRW1pdHRlci5wcm90b3R5cGUudHJpZ2dlciA9IEVtaXR0ZXIucHJvdG90eXBlLmVtaXQ7XG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCl7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgcHJvcCBpbiBhcmd1bWVudHNbaV0pe1xuICAgICAgdGFyZ2V0W3Byb3BdID0gYXJndW1lbnRzW2ldW3Byb3BdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKCd1bmRlZmluZWQnICE9PSB0eXBlb2Ygd2luZG93ICYmIHdpbmRvdy5KU09OKSA/IHdpbmRvdy5KU09OIDogcmVxdWlyZShcImpzb24zXCIpO1xuIiwiZnVuY3Rpb24gcGFyc2VQYXJhbXMoc3RyKXtcbiAgLy8gdmlhOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yODgwOTI5LzI1MTE5ODVcbiAgdmFyIHVybFBhcmFtcyA9IHt9LFxuICAgICAgbWF0Y2gsXG4gICAgICBwbCAgICAgPSAvXFwrL2csICAvLyBSZWdleCBmb3IgcmVwbGFjaW5nIGFkZGl0aW9uIHN5bWJvbCB3aXRoIGEgc3BhY2VcbiAgICAgIHNlYXJjaCA9IC8oW14mPV0rKT0/KFteJl0qKS9nLFxuICAgICAgZGVjb2RlID0gZnVuY3Rpb24gKHMpIHsgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzLnJlcGxhY2UocGwsIFwiIFwiKSk7IH0sXG4gICAgICBxdWVyeSAgPSBzdHIuc3BsaXQoXCI/XCIpWzFdO1xuXG4gIHdoaWxlICghIShtYXRjaD1zZWFyY2guZXhlYyhxdWVyeSkpKSB7XG4gICAgdXJsUGFyYW1zW2RlY29kZShtYXRjaFsxXSldID0gZGVjb2RlKG1hdGNoWzJdKTtcbiAgfVxuICByZXR1cm4gdXJsUGFyYW1zO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZVBhcmFtcztcbiIsInZhciByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xuXG52YXIgZ2V0Q29udGV4dCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LWNvbnRleHQnKSxcbiAgICBnZXRRdWVyeVN0cmluZyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LXF1ZXJ5LXN0cmluZycpLFxuICAgIGdldFVybE1heExlbmd0aCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LXVybC1tYXgtbGVuZ3RoJyksXG4gICAgZ2V0WEhSID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQteGhyLW9iamVjdCcpLFxuICAgIHJlcXVlc3RUeXBlcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3VwZXJhZ2VudC1yZXF1ZXN0LXR5cGVzJyksXG4gICAgcmVzcG9uc2VIYW5kbGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9zdXBlcmFnZW50LWhhbmRsZS1yZXNwb25zZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHBhdGgsIHBhcmFtcywgY2FsbGJhY2spe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1cmxCYXNlID0gdGhpcy5jbGllbnQudXJsKHBhdGgpLFxuICAgICAgcmVxVHlwZSA9IHRoaXMuY2xpZW50LmNvbmZpZy5yZXF1ZXN0VHlwZSxcbiAgICAgIGNiID0gY2FsbGJhY2s7XG5cbiAgY2FsbGJhY2sgPSBudWxsO1xuXG4gIGlmICghc2VsZi5jbGllbnQucHJvamVjdElkKCkpIHtcbiAgICBzZWxmLmNsaWVudC50cmlnZ2VyKCdlcnJvcicsICdRdWVyeSBub3Qgc2VudDogTWlzc2luZyBwcm9qZWN0SWQgcHJvcGVydHknKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIXNlbGYuY2xpZW50LnJlYWRLZXkoKSkge1xuICAgIHNlbGYuY2xpZW50LnRyaWdnZXIoJ2Vycm9yJywgJ1F1ZXJ5IG5vdCBzZW50OiBNaXNzaW5nIHJlYWRLZXkgcHJvcGVydHknKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoZ2V0WEhSKCkgfHwgZ2V0Q29udGV4dCgpID09PSAnc2VydmVyJyApIHtcbiAgICByZXF1ZXN0XG4gICAgICAucG9zdCh1cmxCYXNlKVxuICAgICAgICAuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCBzZWxmLmNsaWVudC5yZWFkS2V5KCkpXG4gICAgICAgIC50aW1lb3V0KHNlbGYudGltZW91dCgpKVxuICAgICAgICAuc2VuZChwYXJhbXMgfHwge30pXG4gICAgICAgIC5lbmQoaGFuZGxlUmVzcG9uc2UpO1xuICB9XG4gIGVsc2Uge1xuICAgIGV4dGVuZChwYXJhbXMsIHsgYXBpX2tleTogc2VsZi5jbGllbnQucmVhZEtleSgpIH0pO1xuICAgIHVybEJhc2UgKz0gZ2V0UXVlcnlTdHJpbmcocGFyYW1zKTtcbiAgICBpZiAodXJsQmFzZS5sZW5ndGggPCBnZXRVcmxNYXhMZW5ndGgoKSApIHtcbiAgICAgIHJlcXVlc3RcbiAgICAgICAgLmdldCh1cmxCYXNlKVxuICAgICAgICAudGltZW91dChzZWxmLnRpbWVvdXQoKSlcbiAgICAgICAgLnVzZShyZXF1ZXN0VHlwZXMoJ2pzb25wJykpXG4gICAgICAgIC5lbmQoaGFuZGxlUmVzcG9uc2UpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNlbGYuY2xpZW50LnRyaWdnZXIoJ2Vycm9yJywgJ1F1ZXJ5IG5vdCBzZW50OiBVUkwgbGVuZ3RoIGV4Y2VlZHMgY3VycmVudCBicm93c2VyIGxpbWl0LCBhbmQgWEhSIChQT1NUKSBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKGVyciwgcmVzKXtcbiAgICByZXNwb25zZUhhbmRsZXIoZXJyLCByZXMsIGNiKTtcbiAgICBjYiA9IGNhbGxiYWNrID0gbnVsbDtcbiAgfVxuXG4gIHJldHVybjtcbn1cbiIsInZhciBjbG9uZSA9IHJlcXVpcmUoXCIuLi9jb3JlL3V0aWxzL2Nsb25lXCIpLFxuICAgIGVhY2ggPSByZXF1aXJlKFwiLi4vY29yZS91dGlscy9lYWNoXCIpLFxuICAgIGZsYXR0ZW4gPSByZXF1aXJlKFwiLi91dGlscy9mbGF0dGVuXCIpLFxuICAgIHBhcnNlID0gcmVxdWlyZShcIi4vdXRpbHMvcGFyc2VcIik7XG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnLi4vY29yZS91dGlscy9lbWl0dGVyLXNoaW0nKTtcblxuZnVuY3Rpb24gRGF0YXNldCgpe1xuICB0aGlzLmRhdGEgPSB7XG4gICAgaW5wdXQ6IHt9LFxuICAgIG91dHB1dDogW1snaW5kZXgnXV1cbiAgfTtcbiAgdGhpcy5tZXRhID0ge1xuICAgIHNjaGVtYToge30sXG4gICAgbWV0aG9kOiB1bmRlZmluZWRcbiAgfTtcbiAgLy8gdGVtcCBmd2RcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgdGhpcy5wYXJzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG59XG5cbkRhdGFzZXQuZGVmYXVsdHMgPSB7XG4gIGRlbGltZXRlcjogXCIgLT4gXCJcbn07XG5cbkVtaXR0ZXIoRGF0YXNldCk7XG5FbWl0dGVyKERhdGFzZXQucHJvdG90eXBlKTtcblxuRGF0YXNldC5wcm90b3R5cGUuaW5wdXQgPSBmdW5jdGlvbihvYmope1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzW1wiZGF0YVwiXVtcImlucHV0XCJdO1xuICB0aGlzW1wiZGF0YVwiXVtcImlucHV0XCJdID0gKG9iaiA/IGNsb25lKG9iaikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5EYXRhc2V0LnByb3RvdHlwZS5vdXRwdXQgPSBmdW5jdGlvbihhcnIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzW1wiZGF0YVwiXS5vdXRwdXQ7XG4gIHRoaXNbXCJkYXRhXCJdLm91dHB1dCA9IChhcnIgaW5zdGFuY2VvZiBBcnJheSA/IGFyciA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn1cblxuRGF0YXNldC5wcm90b3R5cGUubWV0aG9kID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5tZXRhW1wibWV0aG9kXCJdO1xuICB0aGlzLm1ldGFbXCJtZXRob2RcIl0gPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5EYXRhc2V0LnByb3RvdHlwZS5zY2hlbWEgPSBmdW5jdGlvbihvYmope1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLm1ldGEuc2NoZW1hO1xuICB0aGlzLm1ldGEuc2NoZW1hID0gKG9iaiA/IG9iaiA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkRhdGFzZXQucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24ocmF3LCBzY2hlbWEpe1xuICB2YXIgb3B0aW9ucztcbiAgaWYgKHJhdykgdGhpcy5pbnB1dChyYXcpO1xuICBpZiAoc2NoZW1hKSB0aGlzLnNjaGVtYShzY2hlbWEpO1xuXG4gIC8vIFJlc2V0IG91dHB1dCB2YWx1ZVxuICB0aGlzLm91dHB1dChbW11dKTtcblxuICBpZiAodGhpcy5tZXRhLnNjaGVtYS5zZWxlY3QpIHtcbiAgICB0aGlzLm1ldGhvZChcInNlbGVjdFwiKTtcbiAgICBvcHRpb25zID0gZXh0ZW5kKHtcbiAgICAgIHJlY29yZHM6IFwiXCIsXG4gICAgICBzZWxlY3Q6IHRydWVcbiAgICB9LCB0aGlzLnNjaGVtYSgpKTtcbiAgICBfc2VsZWN0LmNhbGwodGhpcywgX29wdEhhc2gob3B0aW9ucykpO1xuICB9XG4gIGVsc2UgaWYgKHRoaXMubWV0YS5zY2hlbWEudW5wYWNrKSB7XG4gICAgdGhpcy5tZXRob2QoXCJ1bnBhY2tcIik7XG4gICAgb3B0aW9ucyA9IGV4dGVuZCh7XG4gICAgICByZWNvcmRzOiBcIlwiLFxuICAgICAgdW5wYWNrOiB7XG4gICAgICAgIGluZGV4OiBmYWxzZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICBsYWJlbDogZmFsc2VcbiAgICAgIH1cbiAgICB9LCB0aGlzLnNjaGVtYSgpKTtcbiAgICBfdW5wYWNrLmNhbGwodGhpcywgX29wdEhhc2gob3B0aW9ucykpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vLyBTZWxlY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIF9zZWxlY3QoY2ZnKXtcblxuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBvcHRpb25zID0gY2ZnIHx8IHt9LFxuICAgICAgdGFyZ2V0X3NldCA9IFtdLFxuICAgICAgdW5pcXVlX2tleXMgPSBbXTtcblxuICB2YXIgcm9vdCwgcmVjb3Jkc190YXJnZXQ7XG4gIGlmIChvcHRpb25zLnJlY29yZHMgPT09IFwiXCIgfHwgIW9wdGlvbnMucmVjb3Jkcykge1xuICAgIHJvb3QgPSBbc2VsZi5pbnB1dCgpXTtcbiAgfSBlbHNlIHtcbiAgICByZWNvcmRzX3RhcmdldCA9IG9wdGlvbnMucmVjb3Jkcy5zcGxpdChEYXRhc2V0LmRlZmF1bHRzLmRlbGltZXRlcik7XG4gICAgcm9vdCA9IHBhcnNlLmFwcGx5KHNlbGYsIFtzZWxmLmlucHV0KCldLmNvbmNhdChyZWNvcmRzX3RhcmdldCkpWzBdO1xuICB9XG5cbiAgZWFjaChvcHRpb25zLnNlbGVjdCwgZnVuY3Rpb24ocHJvcCl7XG4gICAgdGFyZ2V0X3NldC5wdXNoKHByb3AucGF0aC5zcGxpdChEYXRhc2V0LmRlZmF1bHRzLmRlbGltZXRlcikpO1xuICB9KTtcblxuICAvLyBSZXRyaWV2ZSBrZXlzIGZvdW5kIGluIGFzeW1tZXRyaWNhbCBjb2xsZWN0aW9uc1xuICBpZiAodGFyZ2V0X3NldC5sZW5ndGggPT0gMCkge1xuICAgIGVhY2gocm9vdCwgZnVuY3Rpb24ocmVjb3JkLCBpbnRlcnZhbCl7XG4gICAgICB2YXIgZmxhdCA9IGZsYXR0ZW4ocmVjb3JkKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2ZsYXQnLCBmbGF0KTtcbiAgICAgIGZvciAodmFyIGtleSBpbiBmbGF0KSB7XG4gICAgICAgIGlmIChmbGF0Lmhhc093blByb3BlcnR5KGtleSkgJiYgdW5pcXVlX2tleXMuaW5kZXhPZihrZXkpID09IC0xKSB7XG4gICAgICAgICAgdW5pcXVlX2tleXMucHVzaChrZXkpO1xuICAgICAgICAgIHRhcmdldF9zZXQucHVzaChba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHZhciB0ZXN0ID0gW1tdXTtcblxuICAvLyBBcHBlbmQgaGVhZGVyIHJvd1xuICBlYWNoKHRhcmdldF9zZXQsIGZ1bmN0aW9uKHByb3BzLCBpKXtcbiAgICBpZiAodGFyZ2V0X3NldC5sZW5ndGggPT0gMSkge1xuICAgICAgLy8gU3RhdGljIGhlYWRlciBmb3Igc2luZ2xlIHZhbHVlXG4gICAgICB0ZXN0WzBdLnB1c2goJ2xhYmVsJywgJ3ZhbHVlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIER5bmFtaWMgaGVhZGVyIGZvciBuLXZhbHVlc1xuICAgICAgdGVzdFswXS5wdXNoKHByb3BzLmpvaW4oXCIuXCIpKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEFwcGVuZCBhbGwgcm93c1xuICBlYWNoKHJvb3QsIGZ1bmN0aW9uKHJlY29yZCwgaSl7XG4gICAgdmFyIGZsYXQgPSBmbGF0dGVuKHJlY29yZCk7XG4gICAgaWYgKHRhcmdldF9zZXQubGVuZ3RoID09IDEpIHtcbiAgICAgIC8vIFN0YXRpYyByb3cgZm9yIHNpbmdsZSB2YWx1ZVxuICAgICAgdGVzdC5wdXNoKFt0YXJnZXRfc2V0LmpvaW4oXCIuXCIpLCBmbGF0W3RhcmdldF9zZXQuam9pbihcIi5cIildXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIER5bmFtaWMgcm93IGZvciBuLXZhbHVlc1xuICAgICAgdGVzdC5wdXNoKFtdKTtcbiAgICAgIGVhY2godGFyZ2V0X3NldCwgZnVuY3Rpb24odCwgail7XG4gICAgICAgIHZhciB0YXJnZXQgPSB0LmpvaW4oXCIuXCIpO1xuICAgICAgICB0ZXN0W2krMV0ucHVzaChmbGF0W3RhcmdldF0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBzZWxmLm91dHB1dCh0ZXN0KTtcbiAgc2VsZi5mb3JtYXQob3B0aW9ucy5zZWxlY3QpO1xuICByZXR1cm4gc2VsZjtcbn1cblxuXG4vLyBVbnBhY2tcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIF91bnBhY2sob3B0aW9ucyl7XG4gIC8vY29uc29sZS5sb2coJ1VucGFja2luZycsIG9wdGlvbnMpO1xuICB2YXIgc2VsZiA9IHRoaXMsIGRpc2NvdmVyZWRfbGFiZWxzID0gW107XG5cbiAgdmFyIHZhbHVlX3NldCA9IChvcHRpb25zLnVucGFjay52YWx1ZSkgPyBvcHRpb25zLnVucGFjay52YWx1ZS5wYXRoLnNwbGl0KERhdGFzZXQuZGVmYXVsdHMuZGVsaW1ldGVyKSA6IGZhbHNlLFxuICAgICAgbGFiZWxfc2V0ID0gKG9wdGlvbnMudW5wYWNrLmxhYmVsKSA/IG9wdGlvbnMudW5wYWNrLmxhYmVsLnBhdGguc3BsaXQoRGF0YXNldC5kZWZhdWx0cy5kZWxpbWV0ZXIpIDogZmFsc2UsXG4gICAgICBpbmRleF9zZXQgPSAob3B0aW9ucy51bnBhY2suaW5kZXgpID8gb3B0aW9ucy51bnBhY2suaW5kZXgucGF0aC5zcGxpdChEYXRhc2V0LmRlZmF1bHRzLmRlbGltZXRlcikgOiBmYWxzZTtcbiAgLy9jb25zb2xlLmxvZyhpbmRleF9zZXQsIGxhYmVsX3NldCwgdmFsdWVfc2V0KTtcblxuICB2YXIgdmFsdWVfZGVzYyA9ICh2YWx1ZV9zZXRbdmFsdWVfc2V0Lmxlbmd0aC0xXSAhPT0gXCJcIikgPyB2YWx1ZV9zZXRbdmFsdWVfc2V0Lmxlbmd0aC0xXSA6IFwiVmFsdWVcIixcbiAgICAgIGxhYmVsX2Rlc2MgPSAobGFiZWxfc2V0W2xhYmVsX3NldC5sZW5ndGgtMV0gIT09IFwiXCIpID8gbGFiZWxfc2V0W2xhYmVsX3NldC5sZW5ndGgtMV0gOiBcIkxhYmVsXCIsXG4gICAgICBpbmRleF9kZXNjID0gKGluZGV4X3NldFtpbmRleF9zZXQubGVuZ3RoLTFdICE9PSBcIlwiKSA/IGluZGV4X3NldFtpbmRleF9zZXQubGVuZ3RoLTFdIDogXCJJbmRleFwiO1xuXG4gIC8vIFByZXBhcmUgcm9vdCBmb3IgcGFyc2luZ1xuICB2YXIgcm9vdCA9IChmdW5jdGlvbigpe1xuICAgIHZhciByb290O1xuICAgIGlmIChvcHRpb25zLnJlY29yZHMgPT0gXCJcIikge1xuICAgICAgcm9vdCA9IFtzZWxmLmlucHV0KCldO1xuICAgIH0gZWxzZSB7XG4gICAgICByb290ID0gcGFyc2UuYXBwbHkoc2VsZiwgW3NlbGYuaW5wdXQoKV0uY29uY2F0KG9wdGlvbnMucmVjb3Jkcy5zcGxpdChEYXRhc2V0LmRlZmF1bHRzLmRlbGltZXRlcikpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJvb3RbMF07XG4gIH0pKCk7XG5cbiAgaWYgKHJvb3QgaW5zdGFuY2VvZiBBcnJheSA9PSBmYWxzZSkge1xuICAgIHJvb3QgPSBbcm9vdF07XG4gIH1cblxuICAvLyBGaW5kIGxhYmVsc1xuICBlYWNoKHJvb3QsIGZ1bmN0aW9uKHJlY29yZCwgaW50ZXJ2YWwpe1xuICAgIHZhciBsYWJlbHMgPSAobGFiZWxfc2V0KSA/IHBhcnNlLmFwcGx5KHNlbGYsIFtyZWNvcmRdLmNvbmNhdChsYWJlbF9zZXQpKSA6IFtdO1xuICAgIGlmIChsYWJlbHMpIHtcbiAgICAgIGRpc2NvdmVyZWRfbGFiZWxzID0gbGFiZWxzO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gUGFyc2UgZWFjaCByZWNvcmRcbiAgZWFjaChyb290LCBmdW5jdGlvbihyZWNvcmQsIGludGVydmFsKXtcbiAgICAvL2NvbnNvbGUubG9nKCdyZWNvcmQnLCByZWNvcmQpO1xuXG4gICAgdmFyIHBsdWNrZWRfdmFsdWUgPSAodmFsdWVfc2V0KSA/IHBhcnNlLmFwcGx5KHNlbGYsIFtyZWNvcmRdLmNvbmNhdCh2YWx1ZV9zZXQpKSA6IGZhbHNlLFxuICAgICAgICAvL3BsdWNrZWRfbGFiZWwgPSAobGFiZWxfc2V0KSA/IHBhcnNlLmFwcGx5KHNlbGYsIFtyZWNvcmRdLmNvbmNhdChsYWJlbF9zZXQpKSA6IGZhbHNlLFxuICAgICAgICBwbHVja2VkX2luZGV4ID0gKGluZGV4X3NldCkgPyBwYXJzZS5hcHBseShzZWxmLCBbcmVjb3JkXS5jb25jYXQoaW5kZXhfc2V0KSkgOiBmYWxzZTtcbiAgICAvL2NvbnNvbGUubG9nKHBsdWNrZWRfaW5kZXgsIHBsdWNrZWRfbGFiZWwsIHBsdWNrZWRfdmFsdWUpO1xuXG4gICAgLy8gSW5qZWN0IHJvdyBmb3IgZWFjaCBpbmRleFxuICAgIGlmIChwbHVja2VkX2luZGV4KSB7XG4gICAgICBlYWNoKHBsdWNrZWRfaW5kZXgsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNlbGYuZGF0YS5vdXRwdXQucHVzaChbXSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5kYXRhLm91dHB1dC5wdXNoKFtdKTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCBpbmRleCBjb2x1bW5cbiAgICBpZiAocGx1Y2tlZF9pbmRleCkge1xuXG4gICAgICAvLyBCdWlsZCBpbmRleC9sYWJlbCBvbiBmaXJzdCBpbnRlcnZhbFxuICAgICAgaWYgKGludGVydmFsID09IDApIHtcblxuICAgICAgICAvLyBQdXNoIGxhc3QgaW5kZXggcHJvcGVydHkgdG8gMCwwXG4gICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbMF0ucHVzaChpbmRleF9kZXNjKTtcblxuICAgICAgICAvLyBCdWlsZCBzdWJzZXF1ZW50IHNlcmllcyBoZWFkZXJzICgxOk4pXG4gICAgICAgIGlmIChkaXNjb3ZlcmVkX2xhYmVscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgZWFjaChkaXNjb3ZlcmVkX2xhYmVscywgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFswXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbMF0ucHVzaCh2YWx1ZV9kZXNjKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBDb3JyZWN0IGZvciBvZGQgcm9vdCBjYXNlc1xuICAgICAgaWYgKHJvb3QubGVuZ3RoIDwgc2VsZi5kYXRhLm91dHB1dC5sZW5ndGgtMSkge1xuICAgICAgICBpZiAoaW50ZXJ2YWwgPT0gMCkge1xuICAgICAgICAgIGVhY2goc2VsZi5kYXRhLm91dHB1dCwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldLnB1c2gocGx1Y2tlZF9pbmRleFtpLTFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpbnRlcnZhbCsxXS5wdXNoKHBsdWNrZWRfaW5kZXhbMF0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEJ1aWxkIGxhYmVsIGNvbHVtblxuICAgIGlmICghcGx1Y2tlZF9pbmRleCAmJiBkaXNjb3ZlcmVkX2xhYmVscy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoaW50ZXJ2YWwgPT0gMCkge1xuICAgICAgICBzZWxmLmRhdGEub3V0cHV0WzBdLnB1c2gobGFiZWxfZGVzYyk7XG4gICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbMF0ucHVzaCh2YWx1ZV9kZXNjKTtcbiAgICAgIH1cbiAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaW50ZXJ2YWwrMV0ucHVzaChkaXNjb3ZlcmVkX2xhYmVsc1swXSk7XG4gICAgfVxuXG4gICAgaWYgKCFwbHVja2VkX2luZGV4ICYmIGRpc2NvdmVyZWRfbGFiZWxzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAvLyBbUkVWSVNJVF1cbiAgICAgIHNlbGYuZGF0YS5vdXRwdXRbMF0ucHVzaCgnJyk7XG4gICAgfVxuXG4gICAgLy8gQXBwZW5kIHZhbHVlc1xuICAgIGlmIChwbHVja2VkX3ZhbHVlKSB7XG4gICAgICAvLyBDb3JyZWN0IGZvciBvZGQgcm9vdCBjYXNlc1xuICAgICAgaWYgKHJvb3QubGVuZ3RoIDwgc2VsZi5kYXRhLm91dHB1dC5sZW5ndGgtMSkge1xuICAgICAgICBpZiAoaW50ZXJ2YWwgPT0gMCkge1xuICAgICAgICAgIGVhY2goc2VsZi5kYXRhLm91dHB1dCwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldLnB1c2gocGx1Y2tlZF92YWx1ZVtpLTFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWFjaChwbHVja2VkX3ZhbHVlLCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpbnRlcnZhbCsxXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGFwcGVuZCBudWxsIGFjcm9zcyB0aGlzIHJvd1xuICAgICAgZWFjaChzZWxmLmRhdGEub3V0cHV0WzBdLCBmdW5jdGlvbihjZWxsLCBpKXtcbiAgICAgICAgdmFyIG9mZnNldCA9IChwbHVja2VkX2luZGV4KSA/IDAgOiAtMTtcbiAgICAgICAgaWYgKGkgPiBvZmZzZXQpIHtcbiAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ludGVydmFsKzFdLnB1c2gobnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gIH0pO1xuXG4gIHNlbGYuZm9ybWF0KG9wdGlvbnMudW5wYWNrKTtcbiAgLy9zZWxmLnNvcnQob3B0aW9ucy5zb3J0KTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cblxuXG4vLyBTdHJpbmcgY29uZmlncyB0byBoYXNoIHBhdGhzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBfb3B0SGFzaChvcHRpb25zKXtcbiAgZWFjaChvcHRpb25zLnVucGFjaywgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqZWN0KXtcbiAgICBpZiAodmFsdWUgJiYgaXModmFsdWUsICdzdHJpbmcnKSkge1xuICAgICAgb3B0aW9ucy51bnBhY2tba2V5XSA9IHsgcGF0aDogb3B0aW9ucy51bnBhY2tba2V5XSB9O1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvcHRpb25zO1xufVxuXG5cbi8vIHZpYTogaHR0cHM6Ly9naXRodWIuY29tL3Nwb2NrZS9wdW55bWNlXG5mdW5jdGlvbiBpcyhvLCB0KXtcbiAgbyA9IHR5cGVvZihvKTtcbiAgaWYgKCF0KXtcbiAgICByZXR1cm4gbyAhPSAndW5kZWZpbmVkJztcbiAgfVxuICByZXR1cm4gbyA9PSB0O1xufVxuXG4vLyBBZGFwdGVkIHRvIGV4Y2x1ZGUgbnVsbCB2YWx1ZXNcbmZ1bmN0aW9uIGV4dGVuZChvLCBlKXtcbiAgZWFjaChlLCBmdW5jdGlvbih2LCBuKXtcbiAgICBpZiAoaXMob1tuXSwgJ29iamVjdCcpICYmIGlzKHYsICdvYmplY3QnKSl7XG4gICAgICBvW25dID0gZXh0ZW5kKG9bbl0sIHYpO1xuICAgIH0gZWxzZSBpZiAodiAhPT0gbnVsbCkge1xuICAgICAgb1tuXSA9IHY7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG87XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YXNldDtcbiIsInZhciBleHRlbmQgPSByZXF1aXJlKFwiLi4vY29yZS91dGlscy9leHRlbmRcIiksXG4gICAgRGF0YXNldCA9IHJlcXVpcmUoXCIuL2RhdGFzZXRcIik7XG5cbmV4dGVuZChEYXRhc2V0LnByb3RvdHlwZSwgcmVxdWlyZShcIi4vbGliL2FwcGVuZFwiKSk7XG5leHRlbmQoRGF0YXNldC5wcm90b3R5cGUsIHJlcXVpcmUoXCIuL2xpYi9kZWxldGVcIikpO1xuZXh0ZW5kKERhdGFzZXQucHJvdG90eXBlLCByZXF1aXJlKFwiLi9saWIvZmlsdGVyXCIpKTtcbmV4dGVuZChEYXRhc2V0LnByb3RvdHlwZSwgcmVxdWlyZShcIi4vbGliL2luc2VydFwiKSk7XG5leHRlbmQoRGF0YXNldC5wcm90b3R5cGUsIHJlcXVpcmUoXCIuL2xpYi9zZWxlY3RcIikpO1xuZXh0ZW5kKERhdGFzZXQucHJvdG90eXBlLCByZXF1aXJlKFwiLi9saWIvc2V0XCIpKTtcbmV4dGVuZChEYXRhc2V0LnByb3RvdHlwZSwgcmVxdWlyZShcIi4vbGliL3NvcnRcIikpO1xuZXh0ZW5kKERhdGFzZXQucHJvdG90eXBlLCByZXF1aXJlKFwiLi9saWIvdXBkYXRlXCIpKTtcblxuZXh0ZW5kKERhdGFzZXQucHJvdG90eXBlLCByZXF1aXJlKFwiLi9saWIvYW5hbHlzZXNcIikpO1xuZXh0ZW5kKERhdGFzZXQucHJvdG90eXBlLCB7XG4gIFwiZm9ybWF0XCI6IHJlcXVpcmUoXCIuL2xpYi9mb3JtYXRcIilcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFzZXQ7XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIiksXG4gICAgYXJyID0gW1wiQXZlcmFnZVwiLCBcIk1heGltdW1cIiwgXCJNaW5pbXVtXCIsIFwiU3VtXCJdLFxuICAgIG91dHB1dCA9IHt9O1xuXG5vdXRwdXRbXCJhdmVyYWdlXCJdID0gZnVuY3Rpb24oYXJyLCBzdGFydCwgZW5kKXtcbiAgdmFyIHNldCA9IGFyci5zbGljZShzdGFydHx8MCwgKGVuZCA/IGVuZCsxIDogYXJyLmxlbmd0aCkpLFxuICAgICAgc3VtID0gMCxcbiAgICAgIGF2ZyA9IG51bGw7XG5cbiAgLy8gQWRkIG51bWVyaWMgdmFsdWVzXG4gIGVhY2goc2V0LCBmdW5jdGlvbih2YWwsIGkpe1xuICAgIGlmICh0eXBlb2YgdmFsID09PSBcIm51bWJlclwiICYmICFpc05hTihwYXJzZUZsb2F0KHZhbCkpKSB7XG4gICAgICBzdW0gKz0gcGFyc2VGbG9hdCh2YWwpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzdW0gLyBzZXQubGVuZ3RoO1xufTtcblxub3V0cHV0W1wibWF4aW11bVwiXSA9IGZ1bmN0aW9uKGFyciwgc3RhcnQsIGVuZCl7XG4gIHZhciBzZXQgPSBhcnIuc2xpY2Uoc3RhcnR8fDAsIChlbmQgPyBlbmQrMSA6IGFyci5sZW5ndGgpKSxcbiAgICAgIG51bXMgPSBbXTtcblxuICAvLyBQdWxsIG51bWVyaWMgdmFsdWVzXG4gIGVhY2goc2V0LCBmdW5jdGlvbih2YWwsIGkpe1xuICAgIGlmICh0eXBlb2YgdmFsID09PSBcIm51bWJlclwiICYmICFpc05hTihwYXJzZUZsb2F0KHZhbCkpKSB7XG4gICAgICBudW1zLnB1c2gocGFyc2VGbG9hdCh2YWwpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgbnVtcyk7XG59O1xuXG5vdXRwdXRbXCJtaW5pbXVtXCJdID0gZnVuY3Rpb24oYXJyLCBzdGFydCwgZW5kKXtcbiAgdmFyIHNldCA9IGFyci5zbGljZShzdGFydHx8MCwgKGVuZCA/IGVuZCsxIDogYXJyLmxlbmd0aCkpLFxuICAgICAgbnVtcyA9IFtdO1xuXG4gIC8vIFB1bGwgbnVtZXJpYyB2YWx1ZXNcbiAgZWFjaChzZXQsIGZ1bmN0aW9uKHZhbCwgaSl7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCIgJiYgIWlzTmFOKHBhcnNlRmxvYXQodmFsKSkpIHtcbiAgICAgIG51bXMucHVzaChwYXJzZUZsb2F0KHZhbCkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCBudW1zKTtcbn07XG5cbm91dHB1dFtcInN1bVwiXSA9IGZ1bmN0aW9uKGFyciwgc3RhcnQsIGVuZCl7XG4gIC8vIENvcHkgc2V0IHdpdGggZ2l2ZW4gcmFuZ2VcbiAgdmFyIHNldCA9IGFyci5zbGljZShzdGFydHx8MCwgKGVuZCA/IGVuZCsxIDogYXJyLmxlbmd0aCkpLFxuICAgICAgc3VtID0gMDtcblxuICAvLyBBZGQgbnVtZXJpYyB2YWx1ZXNcbiAgZWFjaChzZXQsIGZ1bmN0aW9uKHZhbCwgaSl7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCIgJiYgIWlzTmFOKHBhcnNlRmxvYXQodmFsKSkpIHtcbiAgICAgIHN1bSArPSBwYXJzZUZsb2F0KHZhbCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHN1bTtcbn07XG5cbi8vIENvbnZlbmllbmNlIG1ldGhvZHNcblxuZWFjaChhcnIsIGZ1bmN0aW9uKHYsaSl7XG4gIG91dHB1dFtcImdldENvbHVtblwiK3ZdID0gb3V0cHV0W1wiZ2V0Um93XCIrdl0gPSBmdW5jdGlvbihhcnIpe1xuICAgIHJldHVybiB0aGlzW3YudG9Mb3dlckNhc2UoKV0oYXJyLCAxKTtcbiAgfTtcbn0pO1xuXG5vdXRwdXRbXCJnZXRDb2x1bW5MYWJlbFwiXSA9IG91dHB1dFtcImdldFJvd0luZGV4XCJdID0gZnVuY3Rpb24oYXJyKXtcbiAgcmV0dXJuIGFyclswXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gb3V0cHV0O1xuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xudmFyIGNyZWF0ZU51bGxMaXN0ID0gcmVxdWlyZSgnLi4vdXRpbHMvY3JlYXRlLW51bGwtbGlzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJhcHBlbmRDb2x1bW5cIjogYXBwZW5kQ29sdW1uLFxuICBcImFwcGVuZFJvd1wiOiBhcHBlbmRSb3dcbn07XG5cbmZ1bmN0aW9uIGFwcGVuZENvbHVtbihzdHIsIGlucHV0KXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMiksXG4gICAgICBsYWJlbCA9IChzdHIgIT09IHVuZGVmaW5lZCkgPyBzdHIgOiBudWxsO1xuXG4gIGlmICh0eXBlb2YgaW5wdXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHNlbGYuZGF0YS5vdXRwdXRbMF0ucHVzaChsYWJlbCk7XG4gICAgZWFjaChzZWxmLm91dHB1dCgpLCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgdmFyIGNlbGw7XG4gICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgY2VsbCA9IGlucHV0LmNhbGwoc2VsZiwgcm93LCBpKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjZWxsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgY2VsbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXS5wdXNoKGNlbGwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZWxzZSBpZiAoIWlucHV0IHx8IGlucHV0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBpbnB1dCA9IGlucHV0IHx8IFtdO1xuXG4gICAgaWYgKGlucHV0Lmxlbmd0aCA8PSBzZWxmLm91dHB1dCgpLmxlbmd0aCAtIDEpIHtcbiAgICAgIGlucHV0ID0gaW5wdXQuY29uY2F0KCBjcmVhdGVOdWxsTGlzdChzZWxmLm91dHB1dCgpLmxlbmd0aCAtIDEgLSBpbnB1dC5sZW5ndGgpICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gSWYgdGhpcyBuZXcgY29sdW1uIGlzIGxvbmdlciB0aGFuIGV4aXN0aW5nIGNvbHVtbnMsXG4gICAgICAvLyB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgcmVzdCB0byBtYXRjaCAuLi5cbiAgICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgICAgaWYgKHNlbGYuZGF0YS5vdXRwdXQubGVuZ3RoIC0xIDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgYXBwZW5kUm93LmNhbGwoc2VsZiwgU3RyaW5nKCBzZWxmLmRhdGEub3V0cHV0Lmxlbmd0aCApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VsZi5kYXRhLm91dHB1dFswXS5wdXNoKGxhYmVsKTtcbiAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICBzZWxmLmRhdGEub3V0cHV0W2krMV1bc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGgtMV0gPSB2YWx1ZTtcbiAgICB9KTtcblxuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59XG5cblxuZnVuY3Rpb24gYXBwZW5kUm93KHN0ciwgaW5wdXQpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSxcbiAgICAgIGxhYmVsID0gKHN0ciAhPT0gdW5kZWZpbmVkKSA/IHN0ciA6IG51bGwsXG4gICAgICBuZXdSb3cgPSBbXTtcblxuICBuZXdSb3cucHVzaChsYWJlbCk7XG5cbiAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZWFjaChzZWxmLmRhdGEub3V0cHV0WzBdLCBmdW5jdGlvbihsYWJlbCwgaSl7XG4gICAgICB2YXIgY29sLCBjZWxsO1xuICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgIGNvbCA9IHNlbGYuc2VsZWN0Q29sdW1uKGkpO1xuICAgICAgICBjZWxsID0gaW5wdXQuY2FsbChzZWxmLCBjb2wsIGkpO1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBjZWxsID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBuZXdSb3cucHVzaChjZWxsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBzZWxmLmRhdGEub3V0cHV0LnB1c2gobmV3Um93KTtcbiAgfVxuXG4gIGVsc2UgaWYgKCFpbnB1dCB8fCBpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgaW5wdXQgPSBpbnB1dCB8fCBbXTtcblxuICAgIGlmIChpbnB1dC5sZW5ndGggPD0gc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggLSAxKSB7XG4gICAgICBpbnB1dCA9IGlucHV0LmNvbmNhdCggY3JlYXRlTnVsbExpc3QoIHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoIC0gMSAtIGlucHV0Lmxlbmd0aCApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgICBpZiAoc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggLTEgPCBpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICBhcHBlbmRDb2x1bW4uY2FsbChzZWxmLCBTdHJpbmcoIHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoICkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzZWxmLmRhdGEub3V0cHV0LnB1c2goIG5ld1Jvdy5jb25jYXQoaW5wdXQpICk7XG4gIH1cblxuICByZXR1cm4gc2VsZjtcbn1cbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiZGVsZXRlQ29sdW1uXCI6IGRlbGV0ZUNvbHVtbixcbiAgXCJkZWxldGVSb3dcIjogZGVsZXRlUm93XG59O1xuXG5mdW5jdGlvbiBkZWxldGVDb2x1bW4ocSl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGluZGV4ID0gKHR5cGVvZiBxID09PSAnbnVtYmVyJykgPyBxIDogdGhpcy5kYXRhLm91dHB1dFswXS5pbmRleE9mKHEpO1xuXG4gIGlmIChpbmRleCA+IC0xKSB7XG4gICAgZWFjaChzZWxmLmRhdGEub3V0cHV0LCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBzZWxmO1xufVxuXG5mdW5jdGlvbiBkZWxldGVSb3cocSl7XG4gIHZhciBpbmRleCA9ICh0eXBlb2YgcSA9PT0gJ251bWJlcicpID8gcSA6IHRoaXMuc2VsZWN0Q29sdW1uKDApLmluZGV4T2YocSk7XG5cbiAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICB0aGlzLmRhdGEub3V0cHV0LnNwbGljZShpbmRleCwgMSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcImZpbHRlckNvbHVtbnNcIjogZmlsdGVyQ29sdW1ucyxcbiAgXCJmaWx0ZXJSb3dzXCI6IGZpbHRlclJvd3Ncbn07XG5cbmZ1bmN0aW9uIGZpbHRlckNvbHVtbnMoZm4pe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBjbG9uZSA9IG5ldyBBcnJheSgpO1xuXG4gIGVhY2goc2VsZi5kYXRhLm91dHB1dCwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICBjbG9uZS5wdXNoKFtdKTtcbiAgfSk7XG5cbiAgZWFjaChzZWxmLmRhdGEub3V0cHV0WzBdLCBmdW5jdGlvbihjb2wsIGkpe1xuICAgIHZhciBzZWxlY3RlZENvbHVtbiA9IHNlbGYuc2VsZWN0Q29sdW1uKGkpO1xuICAgIGlmIChpID09IDAgfHwgZm4uY2FsbChzZWxmLCBzZWxlY3RlZENvbHVtbiwgaSkpIHtcbiAgICAgIGVhY2goc2VsZWN0ZWRDb2x1bW4sIGZ1bmN0aW9uKGNlbGwsIHJpKXtcbiAgICAgICAgY2xvbmVbcmldLnB1c2goY2VsbCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHNlbGYub3V0cHV0KGNsb25lKTtcbiAgcmV0dXJuIHNlbGY7XG59XG5cbmZ1bmN0aW9uIGZpbHRlclJvd3MoZm4pe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBjbG9uZSA9IFtdO1xuXG4gIGVhY2goc2VsZi5vdXRwdXQoKSwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICBpZiAoaSA9PSAwIHx8IGZuLmNhbGwoc2VsZiwgcm93LCBpKSkge1xuICAgICAgY2xvbmUucHVzaChyb3cpO1xuICAgIH1cbiAgfSk7XG5cbiAgc2VsZi5vdXRwdXQoY2xvbmUpO1xuICByZXR1cm4gc2VsZjtcbn1cbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMubWV0aG9kKCkgPT09ICdzZWxlY3QnKSB7XG5cbiAgICAgIGVhY2goc2VsZi5vdXRwdXQoKSwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgICAgLy8gUmVwbGFjZSBsYWJlbHNcbiAgICAgICAgaWYgKGkgPT0gMCkge1xuICAgICAgICAgIGVhY2gocm93LCBmdW5jdGlvbihjZWxsLCBqKXtcbiAgICAgICAgICAgIGlmIChvcHRpb25zW2pdICYmIG9wdGlvbnNbal0ubGFiZWwpIHtcbiAgICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXVtqXSA9IG9wdGlvbnNbal0ubGFiZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWFjaChyb3csIGZ1bmN0aW9uKGNlbGwsIGope1xuICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXVtqXSA9IF9hcHBseUZvcm1hdChzZWxmLmRhdGEub3V0cHV0W2ldW2pdLCBvcHRpb25zW2pdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9XG5cbiAgaWYgKHRoaXMubWV0aG9kKCkgPT09ICd1bnBhY2snKSB7XG5cbiAgICBpZiAob3B0aW9ucy5pbmRleCkge1xuICAgICAgZWFjaChzZWxmLm91dHB1dCgpLCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgICBpZiAoaSA9PSAwKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMuaW5kZXgubGFiZWwpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV1bMF0gPSBvcHRpb25zLmluZGV4LmxhYmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldWzBdID0gX2FwcGx5Rm9ybWF0KHNlbGYuZGF0YS5vdXRwdXRbaV1bMF0sIG9wdGlvbnMuaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5sYWJlbCkge1xuICAgICAgaWYgKG9wdGlvbnMuaW5kZXgpIHtcbiAgICAgICAgZWFjaChzZWxmLm91dHB1dCgpLCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgICAgIGVhY2gocm93LCBmdW5jdGlvbihjZWxsLCBqKXtcbiAgICAgICAgICAgIGlmIChpID09IDAgJiYgaiA+IDApIHtcbiAgICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXVtqXSA9IF9hcHBseUZvcm1hdChzZWxmLmRhdGEub3V0cHV0W2ldW2pdLCBvcHRpb25zLmxhYmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlYWNoKHNlbGYub3V0cHV0KCksIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldWzBdID0gX2FwcGx5Rm9ybWF0KHNlbGYuZGF0YS5vdXRwdXRbaV1bMF0sIG9wdGlvbnMubGFiZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMudmFsdWUpIHtcbiAgICAgIGlmIChvcHRpb25zLmluZGV4KSB7XG4gICAgICAgIC8vIHN0YXJ0ID4gMFxuICAgICAgICBlYWNoKHNlbGYub3V0cHV0KCksIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICAgICAgZWFjaChyb3csIGZ1bmN0aW9uKGNlbGwsIGope1xuICAgICAgICAgICAgaWYgKGkgPiAwICYmIGogPiAwKSB7XG4gICAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV1bal0gPSBfYXBwbHlGb3JtYXQoc2VsZi5kYXRhLm91dHB1dFtpXVtqXSwgb3B0aW9ucy52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc3RhcnQgQCAwXG4gICAgICAgIGVhY2goc2VsZi5vdXRwdXQoKSwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgICAgICBlYWNoKHJvdywgZnVuY3Rpb24oY2VsbCwgail7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXVtqXSA9IF9hcHBseUZvcm1hdChzZWxmLmRhdGEub3V0cHV0W2ldW2pdLCBvcHRpb25zLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cblxuICByZXR1cm4gc2VsZjtcbn07XG5cbmZ1bmN0aW9uIF9hcHBseUZvcm1hdCh2YWx1ZSwgb3B0cyl7XG4gIHZhciBvdXRwdXQgPSB2YWx1ZSxcbiAgICAgIG9wdGlvbnMgPSBvcHRzIHx8IHt9O1xuXG4gIGlmIChvcHRpb25zLnJlcGxhY2UpIHtcbiAgICBlYWNoKG9wdGlvbnMucmVwbGFjZSwgZnVuY3Rpb24odmFsLCBrZXkpe1xuICAgICAgaWYgKG91dHB1dCA9PSBrZXkgfHwgU3RyaW5nKG91dHB1dCkgPT0gU3RyaW5nKGtleSkgfHwgcGFyc2VGbG9hdChvdXRwdXQpID09IHBhcnNlRmxvYXQoa2V5KSkge1xuICAgICAgICBvdXRwdXQgPSB2YWw7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBpZiAob3B0aW9ucy50eXBlICYmIG9wdGlvbnMudHlwZSA9PSAnZGF0ZScpIHtcbiAgICBpZiAob3B0aW9ucy5mb3JtYXQgJiYgbW9tZW50ICYmIG1vbWVudCh2YWx1ZSkuaXNWYWxpZCgpKSB7XG4gICAgICBvdXRwdXQgPSBtb21lbnQob3V0cHV0KS5mb3JtYXQob3B0aW9ucy5mb3JtYXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQgPSBuZXcgRGF0ZShvdXRwdXQpOyAvLy50b0lTT1N0cmluZygpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChvcHRpb25zLnR5cGUgJiYgb3B0aW9ucy50eXBlID09ICdzdHJpbmcnKSB7XG4gICAgb3V0cHV0ID0gU3RyaW5nKG91dHB1dCk7XG4gIH1cblxuICBpZiAob3B0aW9ucy50eXBlICYmIG9wdGlvbnMudHlwZSA9PSAnbnVtYmVyJyAmJiAhaXNOYU4ocGFyc2VGbG9hdChvdXRwdXQpKSkge1xuICAgIG91dHB1dCA9IHBhcnNlRmxvYXQob3V0cHV0KTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG52YXIgY3JlYXRlTnVsbExpc3QgPSByZXF1aXJlKCcuLi91dGlscy9jcmVhdGUtbnVsbC1saXN0Jyk7XG52YXIgYXBwZW5kID0gcmVxdWlyZSgnLi9hcHBlbmQnKTtcblxudmFyIGFwcGVuZFJvdyA9IGFwcGVuZC5hcHBlbmRSb3csXG4gICAgYXBwZW5kQ29sdW1uID0gYXBwZW5kLmFwcGVuZENvbHVtbjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiaW5zZXJ0Q29sdW1uXCI6IGluc2VydENvbHVtbixcbiAgXCJpbnNlcnRSb3dcIjogaW5zZXJ0Um93XG59O1xuXG5mdW5jdGlvbiBpbnNlcnRDb2x1bW4oaW5kZXgsIHN0ciwgaW5wdXQpe1xuICB2YXIgc2VsZiA9IHRoaXMsIGxhYmVsO1xuXG4gIGxhYmVsID0gKHN0ciAhPT0gdW5kZWZpbmVkKSA/IHN0ciA6IG51bGw7XG5cbiAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJmdW5jdGlvblwiKSB7XG5cbiAgICBzZWxmLmRhdGEub3V0cHV0WzBdLnNwbGljZShpbmRleCwgMCwgbGFiZWwpO1xuICAgIGVhY2goc2VsZi5vdXRwdXQoKSwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgIHZhciBjZWxsO1xuICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgIGNlbGwgPSBpbnB1dC5jYWxsKHNlbGYsIHJvdywgaSk7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGNlbGwgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV0uc3BsaWNlKGluZGV4LCAwLCBjZWxsKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICB9XG5cbiAgZWxzZSBpZiAoIWlucHV0IHx8IGlucHV0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBpbnB1dCA9IGlucHV0IHx8IFtdO1xuXG4gICAgaWYgKGlucHV0Lmxlbmd0aCA8PSBzZWxmLm91dHB1dCgpLmxlbmd0aCAtIDEpIHtcbiAgICAgIGlucHV0ID0gaW5wdXQuY29uY2F0KCBjcmVhdGVOdWxsTGlzdChzZWxmLm91dHB1dCgpLmxlbmd0aCAtIDEgLSBpbnB1dC5sZW5ndGgpICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gSWYgdGhpcyBuZXcgY29sdW1uIGlzIGxvbmdlciB0aGFuIGV4aXN0aW5nIGNvbHVtbnMsXG4gICAgICAvLyB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgcmVzdCB0byBtYXRjaCAuLi5cbiAgICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgICAgaWYgKHNlbGYuZGF0YS5vdXRwdXQubGVuZ3RoIC0xIDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgYXBwZW5kUm93LmNhbGwoc2VsZiwgU3RyaW5nKCBzZWxmLmRhdGEub3V0cHV0Lmxlbmd0aCApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VsZi5kYXRhLm91dHB1dFswXS5zcGxpY2UoaW5kZXgsIDAsIGxhYmVsKTtcbiAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICBzZWxmLmRhdGEub3V0cHV0W2krMV0uc3BsaWNlKGluZGV4LCAwLCB2YWx1ZSk7XG4gICAgfSk7XG5cbiAgfVxuICByZXR1cm4gc2VsZjtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0Um93KGluZGV4LCBzdHIsIGlucHV0KXtcbiAgdmFyIHNlbGYgPSB0aGlzLCBsYWJlbCwgbmV3Um93ID0gW107XG5cbiAgbGFiZWwgPSAoc3RyICE9PSB1bmRlZmluZWQpID8gc3RyIDogbnVsbDtcbiAgbmV3Um93LnB1c2gobGFiZWwpO1xuXG4gIGlmICh0eXBlb2YgaW5wdXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGVhY2goc2VsZi5vdXRwdXQoKVswXSwgZnVuY3Rpb24obGFiZWwsIGkpe1xuICAgICAgdmFyIGNvbCwgY2VsbDtcbiAgICAgIGlmIChpID4gMCkge1xuICAgICAgICBjb2wgPSBzZWxmLnNlbGVjdENvbHVtbihpKTtcbiAgICAgICAgY2VsbCA9IGlucHV0LmNhbGwoc2VsZiwgY29sLCBpKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjZWxsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgY2VsbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbmV3Um93LnB1c2goY2VsbCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgc2VsZi5kYXRhLm91dHB1dC5zcGxpY2UoaW5kZXgsIDAsIG5ld1Jvdyk7XG4gIH1cblxuICBlbHNlIGlmICghaW5wdXQgfHwgaW5wdXQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGlucHV0ID0gaW5wdXQgfHwgW107XG5cbiAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoIC0gMSkge1xuICAgICAgaW5wdXQgPSBpbnB1dC5jb25jYXQoIGNyZWF0ZU51bGxMaXN0KCBzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCAtIDEgLSBpbnB1dC5sZW5ndGggKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgICAgaWYgKHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoIC0xIDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgYXBwZW5kQ29sdW1uLmNhbGwoc2VsZiwgU3RyaW5nKCBzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VsZi5kYXRhLm91dHB1dC5zcGxpY2UoaW5kZXgsIDAsIG5ld1Jvdy5jb25jYXQoaW5wdXQpICk7XG4gIH1cblxuICByZXR1cm4gc2VsZjtcbn1cbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwic2VsZWN0Q29sdW1uXCI6IHNlbGVjdENvbHVtbixcbiAgXCJzZWxlY3RSb3dcIjogc2VsZWN0Um93XG59O1xuXG5mdW5jdGlvbiBzZWxlY3RDb2x1bW4ocSl7XG4gIHZhciByZXN1bHQgPSBuZXcgQXJyYXkoKSxcbiAgICAgIGluZGV4ID0gKHR5cGVvZiBxID09PSAnbnVtYmVyJykgPyBxIDogdGhpcy5kYXRhLm91dHB1dFswXS5pbmRleE9mKHEpO1xuXG4gIGlmIChpbmRleCA+IC0xICYmICd1bmRlZmluZWQnICE9PSB0eXBlb2YgdGhpcy5kYXRhLm91dHB1dFswXVtpbmRleF0pIHtcbiAgICBlYWNoKHRoaXMuZGF0YS5vdXRwdXQsIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICByZXN1bHQucHVzaChyb3dbaW5kZXhdKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBzZWxlY3RSb3cocSl7XG4gIHZhciByZXN1bHQgPSBuZXcgQXJyYXkoKSxcbiAgICAgIGluZGV4ID0gKHR5cGVvZiBxID09PSAnbnVtYmVyJykgPyBxIDogdGhpcy5zZWxlY3RDb2x1bW4oMCkuaW5kZXhPZihxKTtcblxuICBpZiAoaW5kZXggPiAtMSAmJiAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHRoaXMuZGF0YS5vdXRwdXRbaW5kZXhdKSB7XG4gICAgcmVzdWx0ID0gdGhpcy5kYXRhLm91dHB1dFtpbmRleF07XG4gIH1cbiAgcmV0dXJuICByZXN1bHQ7XG59XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbnZhciBhcHBlbmQgPSByZXF1aXJlKCcuL2FwcGVuZCcpO1xudmFyIHNlbGVjdCA9IHJlcXVpcmUoJy4vc2VsZWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcInNldFwiOiBzZXRcbn07XG5cbmZ1bmN0aW9uIHNldChjb29yZHMsIHZhbHVlKXtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyIHx8IGNvb3Jkcy5sZW5ndGggPCAyKSB7XG4gICAgdGhyb3cgRXJyb3IoJ0luY29ycmVjdCBhcmd1bWVudHMgcHJvdmlkZWQgZm9yICNzZXQgbWV0aG9kJyk7XG4gIH1cblxuICB2YXIgY29sSW5kZXggPSAnbnVtYmVyJyA9PT0gdHlwZW9mIGNvb3Jkc1swXSA/IGNvb3Jkc1swXSA6IHRoaXMuZGF0YS5vdXRwdXRbMF0uaW5kZXhPZihjb29yZHNbMF0pLFxuICAgICAgcm93SW5kZXggPSAnbnVtYmVyJyA9PT0gdHlwZW9mIGNvb3Jkc1sxXSA/IGNvb3Jkc1sxXSA6IHNlbGVjdC5zZWxlY3RDb2x1bW4uY2FsbCh0aGlzLCAwKS5pbmRleE9mKGNvb3Jkc1sxXSk7XG5cbiAgdmFyIGNvbFJlc3VsdCA9IHNlbGVjdC5zZWxlY3RDb2x1bW4uY2FsbCh0aGlzLCBjb29yZHNbMF0pLCAvLyB0aGlzLmRhdGEub3V0cHV0WzBdW2Nvb3Jkc1swXV0sXG4gICAgICByb3dSZXN1bHQgPSBzZWxlY3Quc2VsZWN0Um93LmNhbGwodGhpcywgY29vcmRzWzFdKTtcblxuICAvLyBDb2x1bW4gZG9lc24ndCBleGlzdC4uLlxuICAvLyAgTGV0J3MgY3JlYXRlIGl0IGFuZCByZXNldCBjb2xJbmRleFxuICBpZiAoY29sUmVzdWx0Lmxlbmd0aCA8IDEpIHtcbiAgICBhcHBlbmQuYXBwZW5kQ29sdW1uLmNhbGwodGhpcywgY29vcmRzWzBdKTtcbiAgICBjb2xJbmRleCA9IHRoaXMuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoLTE7XG4gIH1cblxuICAvLyBSb3cgZG9lc24ndCBleGlzdC4uLlxuICAvLyAgTGV0J3MgY3JlYXRlIGl0IGFuZCByZXNldCByb3dJbmRleFxuICBpZiAocm93UmVzdWx0Lmxlbmd0aCA8IDEpIHtcbiAgICBhcHBlbmQuYXBwZW5kUm93LmNhbGwodGhpcywgY29vcmRzWzFdKTtcbiAgICByb3dJbmRleCA9IHRoaXMuZGF0YS5vdXRwdXQubGVuZ3RoLTE7XG4gIH1cblxuICAvLyBTZXQgcHJvdmlkZWQgdmFsdWVcbiAgdGhpcy5kYXRhLm91dHB1dFsgcm93SW5kZXggXVsgY29sSW5kZXggXSA9IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn1cbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwic29ydENvbHVtbnNcIjogc29ydENvbHVtbnMsXG4gIFwic29ydFJvd3NcIjogc29ydFJvd3Ncbn07XG5cbmZ1bmN0aW9uIHNvcnRDb2x1bW5zKHN0ciwgY29tcCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGhlYWQgPSB0aGlzLm91dHB1dCgpWzBdLnNsaWNlKDEpLCAvLyBtaW51cyBpbmRleFxuICAgICAgY29scyA9IFtdLFxuICAgICAgY2xvbmUgPSBbXSxcbiAgICAgIGZuID0gY29tcCB8fCB0aGlzLmdldENvbHVtbkxhYmVsO1xuXG4gIC8vIElzb2xhdGUgZWFjaCBjb2x1bW4gKGV4Y2VwdCB0aGUgaW5kZXgpXG4gIGVhY2goaGVhZCwgZnVuY3Rpb24oY2VsbCwgaSl7XG4gICAgY29scy5wdXNoKHNlbGYuc2VsZWN0Q29sdW1uKGkrMSkuc2xpY2UoMCkpO1xuICB9KTtcbiAgY29scy5zb3J0KGZ1bmN0aW9uKGEsYil7XG4gICAgLy8gSWYgZm4oYSkgPiBmbihiKVxuICAgIHZhciBvcCA9IGZuLmNhbGwoc2VsZiwgYSkgPiBmbi5jYWxsKHNlbGYsIGIpO1xuICAgIGlmIChvcCkge1xuICAgICAgcmV0dXJuIChzdHIgPT09IFwiYXNjXCIgPyAxIDogLTEpO1xuICAgIH0gZWxzZSBpZiAoIW9wKSB7XG4gICAgICByZXR1cm4gKHN0ciA9PT0gXCJhc2NcIiA/IC0xIDogMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfSk7XG4gIGVhY2goY29scywgZnVuY3Rpb24oY29sLCBpKXtcbiAgICBzZWxmXG4gICAgICAuZGVsZXRlQ29sdW1uKGkrMSlcbiAgICAgIC5pbnNlcnRDb2x1bW4oaSsxLCBjb2xbMF0sIGNvbC5zbGljZSgxKSk7XG4gIH0pO1xuICByZXR1cm4gc2VsZjtcbn1cblxuZnVuY3Rpb24gc29ydFJvd3Moc3RyLCBjb21wKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgaGVhZCA9IHRoaXMub3V0cHV0KCkuc2xpY2UoMCwxKSxcbiAgICAgIGJvZHkgPSB0aGlzLm91dHB1dCgpLnNsaWNlKDEpLFxuICAgICAgZm4gPSBjb21wIHx8IHRoaXMuZ2V0Um93SW5kZXg7XG5cbiAgYm9keS5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIC8vIElmIGZuKGEpID4gZm4oYilcbiAgICB2YXIgb3AgPSBmbi5jYWxsKHNlbGYsIGEpID4gZm4uY2FsbChzZWxmLCBiKTtcbiAgICBpZiAob3ApIHtcbiAgICAgIHJldHVybiAoc3RyID09PSBcImFzY1wiID8gMSA6IC0xKTtcbiAgICB9IGVsc2UgaWYgKCFvcCkge1xuICAgICAgcmV0dXJuIChzdHIgPT09IFwiYXNjXCIgPyAtMSA6IDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH0pO1xuICBzZWxmLm91dHB1dChoZWFkLmNvbmNhdChib2R5KSk7XG4gIHJldHVybiBzZWxmO1xufVxuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xudmFyIGNyZWF0ZU51bGxMaXN0ID0gcmVxdWlyZSgnLi4vdXRpbHMvY3JlYXRlLW51bGwtbGlzdCcpO1xudmFyIGFwcGVuZCA9IHJlcXVpcmUoJy4vYXBwZW5kJyk7XG5cbnZhciBhcHBlbmRSb3cgPSBhcHBlbmQuYXBwZW5kUm93LFxuICAgIGFwcGVuZENvbHVtbiA9IGFwcGVuZC5hcHBlbmRDb2x1bW47XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcInVwZGF0ZUNvbHVtblwiOiB1cGRhdGVDb2x1bW4sXG4gIFwidXBkYXRlUm93XCI6IHVwZGF0ZVJvd1xufTtcblxuZnVuY3Rpb24gdXBkYXRlQ29sdW1uKHEsIGlucHV0KXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgaW5kZXggPSAodHlwZW9mIHEgPT09ICdudW1iZXInKSA/IHEgOiB0aGlzLmRhdGEub3V0cHV0WzBdLmluZGV4T2YocSk7XG5cbiAgaWYgKGluZGV4ID4gLTEpIHtcblxuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwiZnVuY3Rpb25cIikge1xuXG4gICAgICBlYWNoKHNlbGYub3V0cHV0KCksIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICAgIHZhciBjZWxsO1xuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICBjZWxsID0gaW5wdXQuY2FsbChzZWxmLCByb3dbaW5kZXhdLCBpLCByb3cpO1xuICAgICAgICAgIGlmICh0eXBlb2YgY2VsbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXVtpbmRleF0gPSBjZWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9IGVsc2UgaWYgKCFpbnB1dCB8fCBpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBpbnB1dCA9IGlucHV0IHx8IFtdO1xuXG4gICAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IHNlbGYub3V0cHV0KCkubGVuZ3RoIC0gMSkge1xuICAgICAgICBpbnB1dCA9IGlucHV0LmNvbmNhdCggY3JlYXRlTnVsbExpc3Qoc2VsZi5vdXRwdXQoKS5sZW5ndGggLSAxIC0gaW5wdXQubGVuZ3RoKSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIElmIHRoaXMgbmV3IGNvbHVtbiBpcyBsb25nZXIgdGhhbiBleGlzdGluZyBjb2x1bW5zLFxuICAgICAgICAvLyB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgcmVzdCB0byBtYXRjaCAuLi5cbiAgICAgICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgICAgIGlmIChzZWxmLmRhdGEub3V0cHV0Lmxlbmd0aCAtMSA8IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgICAgYXBwZW5kUm93LmNhbGwoc2VsZiwgU3RyaW5nKCBzZWxmLmRhdGEub3V0cHV0Lmxlbmd0aCApKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaSsxXVtpbmRleF0gPSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgfVxuXG4gIH1cbiAgcmV0dXJuIHNlbGY7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVJvdyhxLCBpbnB1dCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGluZGV4ID0gKHR5cGVvZiBxID09PSAnbnVtYmVyJykgPyBxIDogdGhpcy5zZWxlY3RDb2x1bW4oMCkuaW5kZXhPZihxKTtcblxuICBpZiAoaW5kZXggPiAtMSkge1xuXG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJmdW5jdGlvblwiKSB7XG5cbiAgICAgIGVhY2goc2VsZi5vdXRwdXQoKVtpbmRleF0sIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgICAgdmFyIGNvbCA9IHNlbGYuc2VsZWN0Q29sdW1uKGkpLFxuICAgICAgICBjZWxsID0gaW5wdXQuY2FsbChzZWxmLCB2YWx1ZSwgaSwgY29sKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjZWxsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpbmRleF1baV0gPSBjZWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSBpZiAoIWlucHV0IHx8IGlucHV0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGlucHV0ID0gaW5wdXQgfHwgW107XG5cbiAgICAgIGlmIChpbnB1dC5sZW5ndGggPD0gc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggLSAxKSB7XG4gICAgICAgIGlucHV0ID0gaW5wdXQuY29uY2F0KCBjcmVhdGVOdWxsTGlzdCggc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggLSAxIC0gaW5wdXQubGVuZ3RoICkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICAgICAgaWYgKHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoIC0xIDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgICBhcHBlbmRDb2x1bW4uY2FsbChzZWxmLCBTdHJpbmcoIHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoICkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpbmRleF1baSsxXSA9IHZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH1cbiAgcmV0dXJuIHNlbGY7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxlbil7XG4gIHZhciBsaXN0ID0gbmV3IEFycmF5KCk7XG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGxpc3QucHVzaChudWxsKTtcbiAgfVxuICByZXR1cm4gbGlzdDtcbn07XG4iLCIvLyBQdXJlIGF3ZXNvbWVuZXNzIGJ5IFdpbGwgUmF5bmVyIChwZW5ndWluYm95KVxuLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGVuZ3VpbmJveS83NjIxOTdcbm1vZHVsZS5leHBvcnRzID0gZmxhdHRlbjtcbmZ1bmN0aW9uIGZsYXR0ZW4ob2IpIHtcbiAgdmFyIHRvUmV0dXJuID0ge307XG4gIGZvciAodmFyIGkgaW4gb2IpIHtcbiAgICBpZiAoIW9iLmhhc093blByb3BlcnR5KGkpKSBjb250aW51ZTtcbiAgICBpZiAoKHR5cGVvZiBvYltpXSkgPT0gJ29iamVjdCcgJiYgb2JbaV0gIT09IG51bGwpIHtcbiAgICAgIHZhciBmbGF0T2JqZWN0ID0gZmxhdHRlbihvYltpXSk7XG4gICAgICBmb3IgKHZhciB4IGluIGZsYXRPYmplY3QpIHtcbiAgICAgICAgaWYgKCFmbGF0T2JqZWN0Lmhhc093blByb3BlcnR5KHgpKSBjb250aW51ZTtcbiAgICAgICAgdG9SZXR1cm5baSArICcuJyArIHhdID0gZmxhdE9iamVjdFt4XTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdG9SZXR1cm5baV0gPSBvYltpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRvUmV0dXJuO1xufVxuIiwiLy8g4pmr4pmp4pmsIEhvbHkgRGl2ZXIhIOKZrOKZqeKZq1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBsb29wID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJvb3QgPSBhcmd1bWVudHNbMF07XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHZhciB0YXJnZXQgPSBhcmdzLnBvcCgpO1xuXG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBpZiAocm9vdCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGFyZ3MgPSByb290O1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygcm9vdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgYXJncy5wdXNoKHJvb3QpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGVhY2goYXJncywgZnVuY3Rpb24oZWwpe1xuXG4gICAgICAvLyBHcmFiIHRoZSBudW1iZXJzIGFuZCBudWxsc1xuICAgICAgaWYgKHRhcmdldCA9PSBcIlwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZWwgPT0gXCJudW1iZXJcIiB8fCBlbCA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5wdXNoKGVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZWxbdGFyZ2V0XSB8fCBlbFt0YXJnZXRdID09PSAwIHx8IGVsW3RhcmdldF0gIT09IHZvaWQgMCkge1xuICAgICAgICAvLyBFYXN5IGdyYWIhXG4gICAgICAgIGlmIChlbFt0YXJnZXRdID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5wdXNoKG51bGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZXN1bHQucHVzaChlbFt0YXJnZXRdKTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKHJvb3RbZWxdKXtcbiAgICAgICAgaWYgKHJvb3RbZWxdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAvLyBkaXZlIHRocm91Z2ggZWFjaCBhcnJheSBpdGVtXG5cbiAgICAgICAgICBlYWNoKHJvb3RbZWxdLCBmdW5jdGlvbihuLCBpKSB7XG4gICAgICAgICAgICB2YXIgc3BsaW50ZXIgPSBbcm9vdFtlbF1dLmNvbmNhdChyb290W2VsXVtpXSkuY29uY2F0KGFyZ3Muc2xpY2UoMSkpLmNvbmNhdCh0YXJnZXQpO1xuICAgICAgICAgICAgcmV0dXJuIGxvb3AuYXBwbHkodGhpcywgc3BsaW50ZXIpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHJvb3RbZWxdW3RhcmdldF0pIHtcbiAgICAgICAgICAgIC8vIGdyYWIgaXQhXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnB1c2gocm9vdFtlbF1bdGFyZ2V0XSk7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZGl2ZSBkb3duIGEgbGV2ZWwhXG4gICAgICAgICAgICByZXR1cm4gbG9vcC5hcHBseSh0aGlzLCBbcm9vdFtlbF1dLmNvbmNhdChhcmdzLnNwbGljZSgxKSkuY29uY2F0KHRhcmdldCkpO1xuXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJvb3QgPT09ICdvYmplY3QnICYmIHJvb3QgaW5zdGFuY2VvZiBBcnJheSA9PT0gZmFsc2UgJiYgIXJvb3RbdGFyZ2V0XSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUYXJnZXQgcHJvcGVydHkgZG9lcyBub3QgZXhpc3RcIiwgdGFyZ2V0KTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGl2ZSBkb3duIGEgbGV2ZWwhXG4gICAgICAgIHJldHVybiBsb29wLmFwcGx5KHRoaXMsIFtlbF0uY29uY2F0KGFyZ3Muc3BsaWNlKDEpKS5jb25jYXQodGFyZ2V0KSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcblxuICAgIH0pO1xuICAgIGlmIChyZXN1bHQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsb29wLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG4iLCIvKiFcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEMzLmpzIEFkYXB0ZXJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG52YXIgRGF0YXZpeiA9IHJlcXVpcmUoJy4uL2RhdGF2aXonKSxcbiAgICBlYWNoID0gcmVxdWlyZSgnLi4vLi4vY29yZS91dGlscy9lYWNoJyksXG4gICAgZXh0ZW5kID0gcmVxdWlyZSgnLi4vLi4vY29yZS91dGlscy9leHRlbmQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG4gIC8vIGNoYXJ0T3B0aW9uczpcbiAgLy8gLS0tLS0tLS0tLS0tLVxuICAvLyBheGlzOiB7fVxuICAvLyBjb2xvcjoge30gICAgPC0tIGJlIGF3YXJlOiB3ZSBzZXQgdmFsdWVzIGhlcmVcbiAgLy8gZ3JpZDoge31cbiAgLy8gbGVnZW5kOiB7fVxuICAvLyBwb2ludDoge31cbiAgLy8gcmVnaW9uczoge31cbiAgLy8gc2l6ZToge30gICAgIDwtLSBiZSBhd2FyZTogd2Ugc2V0IHZhbHVlcyBoZXJlXG4gIC8vIHRvb2x0aXA6IHt9XG4gIC8vIHpvb206IHt9XG5cbiAgLy8gbGluZSwgcGllLCBkb251dCBldGMuLi5cblxuICB2YXIgZGF0YVR5cGVzID0ge1xuICAgIC8vIGRhdGFUeXBlICAgICAgICAgICAgOiAvLyBjaGFydFR5cGVzXG4gICAgJ3Npbmd1bGFyJyAgICAgICAgICAgICA6IFsnZ2F1Z2UnXSxcbiAgICAnY2F0ZWdvcmljYWwnICAgICAgICAgIDogWydkb251dCcsICdwaWUnXSxcbiAgICAnY2F0LWludGVydmFsJyAgICAgICAgIDogWydhcmVhLXN0ZXAnLCAnc3RlcCcsICdiYXInLCAnYXJlYScsICdhcmVhLXNwbGluZScsICdzcGxpbmUnLCAnbGluZSddLFxuICAgICdjYXQtb3JkaW5hbCcgICAgICAgICAgOiBbJ2JhcicsICdhcmVhJywgJ2FyZWEtc3BsaW5lJywgJ3NwbGluZScsICdsaW5lJywgJ3N0ZXAnLCAnYXJlYS1zdGVwJ10sXG4gICAgJ2Nocm9ub2xvZ2ljYWwnICAgICAgICA6IFsnYXJlYScsICdhcmVhLXNwbGluZScsICdzcGxpbmUnLCAnbGluZScsICdiYXInLCAnc3RlcCcsICdhcmVhLXN0ZXAnXSxcbiAgICAnY2F0LWNocm9ub2xvZ2ljYWwnICAgIDogWydsaW5lJywgJ3NwbGluZScsICdhcmVhJywgJ2FyZWEtc3BsaW5lJywgJ2JhcicsICdzdGVwJywgJ2FyZWEtc3RlcCddXG4gICAgLy8gJ25vbWluYWwnICAgICAgICAgICA6IFtdLFxuICAgIC8vICdleHRyYWN0aW9uJyAgICAgICAgOiBbXVxuICB9O1xuXG4gIHZhciBjaGFydHMgPSB7fTtcbiAgZWFjaChbJ2dhdWdlJywgJ2RvbnV0JywgJ3BpZScsICdiYXInLCAnYXJlYScsICdhcmVhLXNwbGluZScsICdzcGxpbmUnLCAnbGluZScsICdzdGVwJywgJ2FyZWEtc3RlcCddLCBmdW5jdGlvbih0eXBlLCBpbmRleCl7XG4gICAgY2hhcnRzW3R5cGVdID0ge1xuICAgICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgc2V0dXAgPSBnZXRTZXR1cFRlbXBsYXRlLmNhbGwodGhpcywgdHlwZSk7XG4gICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzWydjMyddID0gYzMuZ2VuZXJhdGUoc2V0dXApO1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCBjb2xzID0gW107XG4gICAgICAgIGlmICh0eXBlID09PSAnZ2F1Z2UnKSB7XG4gICAgICAgICAgc2VsZi52aWV3Ll9hcnRpZmFjdHNbJ2MzJ10ubG9hZCh7XG4gICAgICAgICAgICBjb2x1bW5zOiBbIFtzZWxmLnRpdGxlKCksIHNlbGYuZGF0YSgpWzFdWzFdXSBdXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSAncGllJyB8fCB0eXBlID09PSAnZG9udXQnKSB7XG4gICAgICAgICAgc2VsZi52aWV3Ll9hcnRpZmFjdHNbJ2MzJ10ubG9hZCh7XG4gICAgICAgICAgICBjb2x1bW5zOiBzZWxmLmRhdGFzZXQuZGF0YS5vdXRwdXQuc2xpY2UoMSlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5kYXRhVHlwZSgpLmluZGV4T2YoJ2Nocm9uJykgPiAtMSkge1xuICAgICAgICAgICAgY29scy5wdXNoKHNlbGYuZGF0YXNldC5zZWxlY3RDb2x1bW4oMCkpO1xuICAgICAgICAgICAgY29sc1swXVswXSA9ICd4JztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBlYWNoKHNlbGYuZGF0YSgpWzBdLCBmdW5jdGlvbihjLCBpKXtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICBjb2xzLnB1c2goc2VsZi5kYXRhc2V0LnNlbGVjdENvbHVtbihpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoc2VsZi5zdGFja2VkKCkpIHtcbiAgICAgICAgICAgIHNlbGYudmlldy5fYXJ0aWZhY3RzWydjMyddLmdyb3Vwcyhbc2VsZi5sYWJlbHMoKV0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYudmlldy5fYXJ0aWZhY3RzWydjMyddLmxvYWQoe1xuICAgICAgICAgICAgY29sdW1uczogY29sc1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZGVzdHJveTogZnVuY3Rpb24oKXtcbiAgICAgICAgX3NlbGZEZXN0cnVjdC5jYWxsKHRoaXMpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGdldFNldHVwVGVtcGxhdGUodHlwZSl7XG4gICAgdmFyIHNldHVwID0ge1xuICAgICAgYXhpczoge30sXG4gICAgICBiaW5kdG86IHRoaXMuZWwoKSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgY29sdW1uczogW11cbiAgICAgIH0sXG4gICAgICBjb2xvcjoge1xuICAgICAgICBwYXR0ZXJuOiB0aGlzLmNvbG9ycygpXG4gICAgICB9LFxuICAgICAgc2l6ZToge1xuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0KCksXG4gICAgICAgIHdpZHRoOiB0aGlzLndpZHRoKClcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRW5mb3JjZSB0eXBlLCBzb3JyeSBubyBvdmVycmlkZXMgaGVyZVxuICAgIHNldHVwWydkYXRhJ11bJ3R5cGUnXSA9IHR5cGU7XG5cbiAgICBpZiAodHlwZSA9PT0gJ2dhdWdlJykge31cbiAgICBlbHNlIGlmICh0eXBlID09PSAncGllJyB8fCB0eXBlID09PSAnZG9udXQnKSB7XG4gICAgICBzZXR1cFt0eXBlXSA9IHsgdGl0bGU6IHRoaXMudGl0bGUoKSB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmRhdGFUeXBlKCkuaW5kZXhPZignY2hyb24nKSA+IC0xKSB7XG4gICAgICAgIHNldHVwWydkYXRhJ11bJ3gnXSA9ICd4JztcbiAgICAgICAgc2V0dXBbJ2F4aXMnXVsneCddID0ge1xuICAgICAgICAgIHR5cGU6ICd0aW1lc2VyaWVzJyxcbiAgICAgICAgICB0aWNrOiB7XG4gICAgICAgICAgICBmb3JtYXQ6ICclWS0lbS0lZCdcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YVR5cGUoKSA9PT0gJ2NhdC1vcmRpbmFsJykge1xuICAgICAgICAgIHNldHVwWydheGlzJ11bJ3gnXSA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yeScsXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiB0aGlzLmxhYmVscygpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMudGl0bGUoKSkge1xuICAgICAgICBzZXR1cFsnYXhpcyddWyd5J10gPSB7IGxhYmVsOiB0aGlzLnRpdGxlKCkgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXh0ZW5kKHNldHVwLCB0aGlzLmNoYXJ0T3B0aW9ucygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9zZWxmRGVzdHJ1Y3QoKXtcbiAgICBpZiAodGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2MzJ10pIHtcbiAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzWydjMyddLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzWydjMyddID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBSZWdpc3RlciBsaWJyYXJ5ICsgYWRkIGRlcGVuZGVuY2llcyArIHR5cGVzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgRGF0YXZpei5yZWdpc3RlcignYzMnLCBjaGFydHMsIHsgY2FwYWJpbGl0aWVzOiBkYXRhVHlwZXMgfSk7XG5cbn07XG4iLCIvKiFcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIENoYXJ0LmpzIEFkYXB0ZXJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG52YXIgRGF0YXZpeiA9IHJlcXVpcmUoXCIuLi9kYXRhdml6XCIpLFxuICAgIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpLFxuICAgIGV4dGVuZCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2V4dGVuZFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG4gIGlmICh0eXBlb2YgQ2hhcnQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBDaGFydC5kZWZhdWx0cy5nbG9iYWwucmVzcG9uc2l2ZSA9IHRydWU7XG4gIH1cblxuICB2YXIgZGF0YVR5cGVzID0ge1xuICAgIC8vIGRhdGFUeXBlICAgICAgICAgICAgOiAvLyBjaGFydFR5cGVzXG4gICAgLy9cInNpbmd1bGFyXCIgICAgICAgICAgICAgOiBbXSxcbiAgICBcImNhdGVnb3JpY2FsXCIgICAgICAgICAgOiBbXCJkb3VnaG51dFwiLCBcInBpZVwiLCBcInBvbGFyLWFyZWFcIiwgXCJyYWRhclwiXSxcbiAgICBcImNhdC1pbnRlcnZhbFwiICAgICAgICAgOiBbXCJiYXJcIiwgXCJsaW5lXCJdLFxuICAgIFwiY2F0LW9yZGluYWxcIiAgICAgICAgICA6IFtcImJhclwiLCBcImxpbmVcIl0sXG4gICAgXCJjaHJvbm9sb2dpY2FsXCIgICAgICAgIDogW1wibGluZVwiLCBcImJhclwiXSxcbiAgICBcImNhdC1jaHJvbm9sb2dpY2FsXCIgICAgOiBbXCJsaW5lXCIsIFwiYmFyXCJdXG4gICAgLy8gXCJub21pbmFsXCIgICAgICAgICAgIDogW10sXG4gICAgLy8gXCJleHRyYWN0aW9uXCIgICAgICAgIDogW11cbiAgfTtcblxuICB2YXIgQ2hhcnROYW1lTWFwID0ge1xuICAgIFwicmFkYXJcIjogXCJSYWRhclwiLFxuICAgIFwicG9sYXItYXJlYVwiOiBcIlBvbGFyQXJlYVwiLFxuICAgIFwicGllXCI6IFwiUGllXCIsXG4gICAgXCJkb3VnaG51dFwiOiBcIkRvdWdobnV0XCIsXG4gICAgXCJsaW5lXCI6IFwiTGluZVwiLFxuICAgIFwiYmFyXCI6IFwiQmFyXCJcbiAgfTtcbiAgdmFyIGRhdGFUcmFuc2Zvcm1lcnMgPSB7XG4gICAgJ2RvdWdobnV0JzogZ2V0Q2F0ZWdvcmljYWxEYXRhLFxuICAgICdwaWUnOiBnZXRDYXRlZ29yaWNhbERhdGEsXG4gICAgJ3BvbGFyLWFyZWEnOiBnZXRDYXRlZ29yaWNhbERhdGEsXG4gICAgJ3JhZGFyJzogZ2V0U2VyaWVzRGF0YSxcbiAgICAnbGluZSc6IGdldFNlcmllc0RhdGEsXG4gICAgJ2Jhcic6IGdldFNlcmllc0RhdGFcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRDYXRlZ29yaWNhbERhdGEoKXtcbiAgICB2YXIgc2VsZiA9IHRoaXMsIHJlc3VsdCA9IFtdO1xuICAgIGVhY2goc2VsZi5kYXRhc2V0LnNlbGVjdENvbHVtbigwKS5zbGljZSgxKSwgZnVuY3Rpb24obGFiZWwsIGkpe1xuICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICB2YWx1ZTogc2VsZi5kYXRhc2V0LnNlbGVjdENvbHVtbigxKS5zbGljZSgxKVtpXSxcbiAgICAgICAgY29sb3I6IHNlbGYuY29sb3JzKClbK2ldLFxuICAgICAgICBoaWdodGxpZ2h0OiBzZWxmLmNvbG9ycygpWytpKzldLFxuICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTZXJpZXNEYXRhKCl7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBsYWJlbHMsXG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICBsYWJlbHM6IFtdLFxuICAgICAgICAgIGRhdGFzZXRzOiBbXVxuICAgICAgICB9O1xuXG4gICAgbGFiZWxzID0gdGhpcy5kYXRhc2V0LnNlbGVjdENvbHVtbigwKS5zbGljZSgxKTtcbiAgICBlYWNoKGxhYmVscywgZnVuY3Rpb24obCxpKXtcbiAgICAgIGlmIChsIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICByZXN1bHQubGFiZWxzLnB1c2goKGwuZ2V0TW9udGgoKSsxKSArIFwiLVwiICsgbC5nZXREYXRlKCkgKyBcIi1cIiArIGwuZ2V0RnVsbFllYXIoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQubGFiZWxzLnB1c2gobCk7XG4gICAgICB9XG4gICAgfSlcblxuICAgIGVhY2goc2VsZi5kYXRhc2V0LnNlbGVjdFJvdygwKS5zbGljZSgxKSwgZnVuY3Rpb24obGFiZWwsIGkpe1xuICAgICAgdmFyIGhleCA9IHtcbiAgICAgICAgcjogaGV4VG9SKHNlbGYuY29sb3JzKClbaV0pLFxuICAgICAgICBnOiBoZXhUb0coc2VsZi5jb2xvcnMoKVtpXSksXG4gICAgICAgIGI6IGhleFRvQihzZWxmLmNvbG9ycygpW2ldKVxuICAgICAgfTtcbiAgICAgIHJlc3VsdC5kYXRhc2V0cy5wdXNoKHtcbiAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICBmaWxsQ29sb3IgICAgOiBcInJnYmEoXCIgKyBoZXguciArIFwiLFwiICsgaGV4LmcgKyBcIixcIiArIGhleC5iICsgXCIsMC4yKVwiLFxuICAgICAgICBzdHJva2VDb2xvciAgOiBcInJnYmEoXCIgKyBoZXguciArIFwiLFwiICsgaGV4LmcgKyBcIixcIiArIGhleC5iICsgXCIsMSlcIixcbiAgICAgICAgcG9pbnRDb2xvciAgIDogXCJyZ2JhKFwiICsgaGV4LnIgKyBcIixcIiArIGhleC5nICsgXCIsXCIgKyBoZXguYiArIFwiLDEpXCIsXG4gICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6IFwiI2ZmZlwiLFxuICAgICAgICBwb2ludEhpZ2hsaWdodEZpbGw6IFwiI2ZmZlwiLFxuICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogXCJyZ2JhKFwiICsgaGV4LnIgKyBcIixcIiArIGhleC5nICsgXCIsXCIgKyBoZXguYiArIFwiLDEpXCIsXG4gICAgICAgIGRhdGE6IHNlbGYuZGF0YXNldC5zZWxlY3RDb2x1bW4oK2krMSkuc2xpY2UoMSlcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2YXIgY2hhcnRzID0ge307XG4gIGVhY2goW1wiZG91Z2hudXRcIiwgXCJwaWVcIiwgXCJwb2xhci1hcmVhXCIsIFwicmFkYXJcIiwgXCJiYXJcIiwgXCJsaW5lXCJdLCBmdW5jdGlvbih0eXBlLCBpbmRleCl7XG4gICAgY2hhcnRzW3R5cGVdID0ge1xuICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHRoaXMuZWwoKS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICE9PSBcImNhbnZhc1wiKSB7XG4gICAgICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgIHRoaXMuZWwoKS5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgIHRoaXMuZWwoKS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY3R4XCJdID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1tcImN0eFwiXSA9IHRoaXMuZWwoKS5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5oZWlnaHQoKSkge1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY3R4XCJdLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodCgpO1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY3R4XCJdLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBTdHJpbmcodGhpcy5oZWlnaHQoKSArIFwicHhcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy53aWR0aCgpKSB7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjdHhcIl0uY2FudmFzLndpZHRoID0gdGhpcy53aWR0aCgpO1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY3R4XCJdLmNhbnZhcy5zdHlsZS53aWR0aCA9IFN0cmluZyh0aGlzLndpZHRoKCkgKyBcInB4XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbWV0aG9kID0gQ2hhcnROYW1lTWFwW3R5cGVdLFxuICAgICAgICAgICAgb3B0cyA9IGV4dGVuZCh7fSwgdGhpcy5jaGFydE9wdGlvbnMoKSksXG4gICAgICAgICAgICBkYXRhID0gZGF0YVRyYW5zZm9ybWVyc1t0eXBlXS5jYWxsKHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLnZpZXcuX2FydGlmYWN0c1tcImNoYXJ0anNcIl0pIHtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1tcImNoYXJ0anNcIl0uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY2hhcnRqc1wiXSA9IG5ldyBDaGFydCh0aGlzLnZpZXcuX2FydGlmYWN0c1tcImN0eFwiXSlbbWV0aG9kXShkYXRhLCBvcHRzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgZGVzdHJveTogZnVuY3Rpb24oKXtcbiAgICAgICAgX3NlbGZEZXN0cnVjdC5jYWxsKHRoaXMpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIF9zZWxmRGVzdHJ1Y3QoKXtcbiAgICBpZiAodGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjaGFydGpzXCJdKSB7XG4gICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1tcImNoYXJ0anNcIl0uZGVzdHJveSgpO1xuICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjaGFydGpzXCJdID0gbnVsbDtcbiAgICB9XG4gIH1cblxuXG4gIC8vIEJhc2VkIG9uIHRoaXMgYXdlc29tZSBsaXR0bGUgZGVtbzpcbiAgLy8gaHR0cDovL3d3dy5qYXZhc2NyaXB0ZXIubmV0L2ZhcS9oZXh0b3JnYi5odG1cbiAgZnVuY3Rpb24gaGV4VG9SKGgpIHtyZXR1cm4gcGFyc2VJbnQoKGN1dEhleChoKSkuc3Vic3RyaW5nKDAsMiksMTYpfVxuICBmdW5jdGlvbiBoZXhUb0coaCkge3JldHVybiBwYXJzZUludCgoY3V0SGV4KGgpKS5zdWJzdHJpbmcoMiw0KSwxNil9XG4gIGZ1bmN0aW9uIGhleFRvQihoKSB7cmV0dXJuIHBhcnNlSW50KChjdXRIZXgoaCkpLnN1YnN0cmluZyg0LDYpLDE2KX1cbiAgZnVuY3Rpb24gY3V0SGV4KGgpIHtyZXR1cm4gKGguY2hhckF0KDApPT1cIiNcIikgPyBoLnN1YnN0cmluZygxLDcpOmh9XG5cbiAgLy8gUmVnaXN0ZXIgbGlicmFyeSArIGFkZCBkZXBlbmRlbmNpZXMgKyB0eXBlc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIERhdGF2aXoucmVnaXN0ZXIoXCJjaGFydGpzXCIsIGNoYXJ0cywgeyBjYXBhYmlsaXRpZXM6IGRhdGFUeXBlcyB9KTtcblxufTtcbiIsIi8qIVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogR29vZ2xlIENoYXJ0cyBBZGFwdGVyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuLypcblxuICBUT0RPOlxuXG4gIFsgXSBCdWlsZCBhIG1vcmUgcm9idXN0IERhdGFUYWJsZSB0cmFuc2Zvcm1lclxuICBbIF0gXkV4cG9zZSBkYXRlIHBhcnNlciBmb3IgZ29vZ2xlIGNoYXJ0cyB0b29sdGlwcyAoIzcwKVxuICBbIF0gXkFsbG93IGN1c3RvbSB0b29sdGlwcyAoIzE0NylcblxuKi9cblxudmFyIERhdGF2aXogPSByZXF1aXJlKFwiLi4vZGF0YXZpelwiKSxcbiAgICBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9leHRlbmRcIiksXG4gICAgS2VlbiA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cbiAgS2Vlbi5sb2FkZWQgPSBmYWxzZTtcblxuICB2YXIgZXJyb3JNYXBwaW5nID0ge1xuICAgIFwiRGF0YSBjb2x1bW4ocykgZm9yIGF4aXMgIzAgY2Fubm90IGJlIG9mIHR5cGUgc3RyaW5nXCI6IFwiTm8gcmVzdWx0cyB0byB2aXN1YWxpemVcIlxuICB9O1xuXG4gIHZhciBjaGFydFR5cGVzID0gWydBcmVhQ2hhcnQnLCAnQmFyQ2hhcnQnLCAnQ29sdW1uQ2hhcnQnLCAnTGluZUNoYXJ0JywgJ1BpZUNoYXJ0JywgJ1RhYmxlJ107XG4gIHZhciBjaGFydE1hcCA9IHt9O1xuXG4gIHZhciBkYXRhVHlwZXMgPSB7XG4gICAgLy8gZGF0YVR5cGUgICAgICAgICAgIC8vIGNoYXJ0VHlwZXMgKG5hbWVzcGFjZSlcbiAgICAvLyAnc2luZ3VsYXInOiAgICAgICAgbnVsbCxcbiAgICAnY2F0ZWdvcmljYWwnOiAgICAgICAgWydwaWVjaGFydCcsICdiYXJjaGFydCcsICdjb2x1bW5jaGFydCcsICd0YWJsZSddLFxuICAgICdjYXQtaW50ZXJ2YWwnOiAgICAgICBbJ2NvbHVtbmNoYXJ0JywgJ2JhcmNoYXJ0JywgJ3RhYmxlJ10sXG4gICAgJ2NhdC1vcmRpbmFsJzogICAgICAgIFsnYmFyY2hhcnQnLCAnY29sdW1uY2hhcnQnLCAnYXJlYWNoYXJ0JywgJ2xpbmVjaGFydCcsICd0YWJsZSddLFxuICAgICdjaHJvbm9sb2dpY2FsJzogICAgICBbJ2FyZWFjaGFydCcsICdsaW5lY2hhcnQnLCAndGFibGUnXSxcbiAgICAnY2F0LWNocm9ub2xvZ2ljYWwnOiAgWydsaW5lY2hhcnQnLCAnY29sdW1uY2hhcnQnLCAnYmFyY2hhcnQnLCAnYXJlYWNoYXJ0J10sXG4gICAgJ25vbWluYWwnOiAgICAgICAgICAgIFsndGFibGUnXSxcbiAgICAnZXh0cmFjdGlvbic6ICAgICAgICAgWyd0YWJsZSddXG4gIH07XG5cbiAgLy8gQ3JlYXRlIGNoYXJ0IHR5cGVzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZWFjaChjaGFydFR5cGVzLCBmdW5jdGlvbiAodHlwZSkge1xuICAgIHZhciBuYW1lID0gdHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgIGNoYXJ0TWFwW25hbWVdID0ge1xuICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gTm90aGluZyB0byBkbyBoZXJlXG4gICAgICB9LFxuICAgICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgICBpZih0eXBlb2YgZ29vZ2xlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgdGhpcy5lcnJvcihcIlRoZSBHb29nbGUgQ2hhcnRzIGxpYnJhcnkgY291bGQgbm90IGJlIGxvYWRlZC5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKHNlbGYudmlldy5fYXJ0aWZhY3RzWydnb29nbGVjaGFydCddKSB7XG4gICAgICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi52aWV3Ll9hcnRpZmFjdHNbJ2dvb2dsZWNoYXJ0J10gPSBzZWxmLnZpZXcuX2FydGlmYWN0c1snZ29vZ2xlY2hhcnQnXSB8fCBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb25bdHlwZV0oc2VsZi5lbCgpKTtcbiAgICAgICAgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZXZlbnRzLmFkZExpc3RlbmVyKHNlbGYudmlldy5fYXJ0aWZhY3RzWydnb29nbGVjaGFydCddLCAnZXJyb3InLCBmdW5jdGlvbihzdGFjayl7XG4gICAgICAgICAgX2hhbmRsZUVycm9ycy5jYWxsKHNlbGYsIHN0YWNrKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgb3B0aW9ucyA9IF9nZXREZWZhdWx0QXR0cmlidXRlcy5jYWxsKHRoaXMsIHR5cGUpO1xuICAgICAgICBleHRlbmQob3B0aW9ucywgdGhpcy5jaGFydE9wdGlvbnMoKSwgdGhpcy5hdHRyaWJ1dGVzKCkpO1xuXG4gICAgICAgIC8vIEFwcGx5IHN0YWNraW5nIGlmIHNldCBieSB0b3AtbGV2ZWwgb3B0aW9uXG4gICAgICAgIG9wdGlvbnNbJ2lzU3RhY2tlZCddID0gKHRoaXMuc3RhY2tlZCgpIHx8IG9wdGlvbnNbJ2lzU3RhY2tlZCddKTtcblxuICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1snZGF0YXRhYmxlJ10gPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKHRoaXMuZGF0YSgpKTtcbiAgICAgICAgLy8gaWYgKHRoaXMudmlldy5fYXJ0aWZhY3RzWydkYXRhdGFibGUnXSkge31cbiAgICAgICAgaWYgKHRoaXMudmlldy5fYXJ0aWZhY3RzWydnb29nbGVjaGFydCddKSB7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2dvb2dsZWNoYXJ0J10uZHJhdyh0aGlzLnZpZXcuX2FydGlmYWN0c1snZGF0YXRhYmxlJ10sIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZGVzdHJveTogZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHRoaXMudmlldy5fYXJ0aWZhY3RzWydnb29nbGVjaGFydCddKSB7XG4gICAgICAgICAgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZXZlbnRzLnJlbW92ZUFsbExpc3RlbmVycyh0aGlzLnZpZXcuX2FydGlmYWN0c1snZ29vZ2xlY2hhcnQnXSk7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2dvb2dsZWNoYXJ0J10uY2xlYXJDaGFydCgpO1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzWydnb29nbGVjaGFydCddID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1snZGF0YXRhYmxlJ10gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cblxuICAvLyBSZWdpc3RlciBsaWJyYXJ5ICsgdHlwZXNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIERhdGF2aXoucmVnaXN0ZXIoJ2dvb2dsZScsIGNoYXJ0TWFwLCB7XG4gICAgY2FwYWJpbGl0aWVzOiBkYXRhVHlwZXMsXG4gICAgZGVwZW5kZW5jaWVzOiBbe1xuICAgICAgdHlwZTogJ3NjcmlwdCcsXG4gICAgICB1cmw6ICdodHRwczovL3d3dy5nb29nbGUuY29tL2pzYXBpJyxcbiAgICAgIGNiOiBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZ29vZ2xlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgdGhpcy50cmlnZ2VyKFwiZXJyb3JcIiwgXCJQcm9ibGVtIGxvYWRpbmcgR29vZ2xlIENoYXJ0cyBsaWJyYXJ5LiBQbGVhc2UgY29udGFjdCB1cyFcIik7XG4gICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMScsIHtcbiAgICAgICAgICAgICAgcGFja2FnZXM6IFsnY29yZWNoYXJ0JywgJ3RhYmxlJ10sXG4gICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfV1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gX2hhbmRsZUVycm9ycyhzdGFjayl7XG4gICAgdmFyIG1lc3NhZ2UgPSBlcnJvck1hcHBpbmdbc3RhY2tbJ21lc3NhZ2UnXV0gfHwgc3RhY2tbJ21lc3NhZ2UnXSB8fCAnQW4gZXJyb3Igb2NjdXJyZWQnO1xuICAgIHRoaXMuZXJyb3IobWVzc2FnZSk7XG4gIH1cblxuICBmdW5jdGlvbiBfZ2V0RGVmYXVsdEF0dHJpYnV0ZXModHlwZSl7XG4gICAgdmFyIG91dHB1dCA9IHt9O1xuICAgIHN3aXRjaCAodHlwZS50b0xvd2VyQ2FzZSgpKSB7XG5cbiAgICAgIGNhc2UgXCJhcmVhY2hhcnRcIjpcbiAgICAgICAgb3V0cHV0LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIG91dHB1dC5oQXhpcyA9IHtcbiAgICAgICAgICBiYXNlbGluZUNvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgIGdyaWRsaW5lczogeyBjb2xvcjogJ3RyYW5zcGFyZW50JyB9XG4gICAgICAgIH07XG4gICAgICAgIG91dHB1dC52QXhpcyA9IHtcbiAgICAgICAgICB2aWV3V2luZG93OiB7IG1pbjogMCB9XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmRhdGFUeXBlKCkgPT09IFwiY2hyb25vbG9naWNhbFwiIHx8IHRoaXMuZGF0YVR5cGUoKSA9PT0gXCJjYXQtb3JkaW5hbFwiKSB7XG4gICAgICAgICAgb3V0cHV0LmxlZ2VuZCA9IFwibm9uZVwiO1xuICAgICAgICAgIG91dHB1dC5jaGFydEFyZWEgPSB7XG4gICAgICAgICAgICB3aWR0aDogXCI4NSVcIlxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJiYXJjaGFydFwiOlxuICAgICAgICBvdXRwdXQuaEF4aXMgPSB7XG4gICAgICAgICAgdmlld1dpbmRvdzogeyBtaW46IDAgfVxuICAgICAgICB9O1xuICAgICAgICBvdXRwdXQudkF4aXMgPSB7XG4gICAgICAgICAgYmFzZWxpbmVDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICBncmlkbGluZXM6IHsgY29sb3I6ICd0cmFuc3BhcmVudCcgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5kYXRhVHlwZSgpID09PSBcImNocm9ub2xvZ2ljYWxcIiB8fCB0aGlzLmRhdGFUeXBlKCkgPT09IFwiY2F0LW9yZGluYWxcIikge1xuICAgICAgICAgIG91dHB1dC5sZWdlbmQgPSBcIm5vbmVcIjtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImNvbHVtbmNoYXJ0XCI6XG4gICAgICAgIG91dHB1dC5oQXhpcyA9IHtcbiAgICAgICAgICBiYXNlbGluZUNvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgIGdyaWRsaW5lczogeyBjb2xvcjogJ3RyYW5zcGFyZW50JyB9XG4gICAgICAgIH07XG4gICAgICAgIG91dHB1dC52QXhpcyA9IHtcbiAgICAgICAgICB2aWV3V2luZG93OiB7IG1pbjogMCB9XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmRhdGFUeXBlKCkgPT09IFwiY2hyb25vbG9naWNhbFwiIHx8IHRoaXMuZGF0YVR5cGUoKSA9PT0gXCJjYXQtb3JkaW5hbFwiKSB7XG4gICAgICAgICAgb3V0cHV0LmxlZ2VuZCA9IFwibm9uZVwiO1xuICAgICAgICAgIG91dHB1dC5jaGFydEFyZWEgPSB7XG4gICAgICAgICAgICB3aWR0aDogXCI4NSVcIlxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJsaW5lY2hhcnRcIjpcbiAgICAgICAgb3V0cHV0LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIG91dHB1dC5oQXhpcyA9IHtcbiAgICAgICAgICBiYXNlbGluZUNvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgIGdyaWRsaW5lczogeyBjb2xvcjogJ3RyYW5zcGFyZW50JyB9XG4gICAgICAgIH07XG4gICAgICAgIG91dHB1dC52QXhpcyA9IHtcbiAgICAgICAgICB2aWV3V2luZG93OiB7IG1pbjogMCB9XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmRhdGFUeXBlKCkgPT09IFwiY2hyb25vbG9naWNhbFwiIHx8IHRoaXMuZGF0YVR5cGUoKSA9PT0gXCJjYXQtb3JkaW5hbFwiKSB7XG4gICAgICAgICAgb3V0cHV0LmxlZ2VuZCA9IFwibm9uZVwiO1xuICAgICAgICAgIG91dHB1dC5jaGFydEFyZWEgPSB7XG4gICAgICAgICAgICB3aWR0aDogXCI4NSVcIlxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJwaWVjaGFydFwiOlxuICAgICAgICBvdXRwdXQuc2xpY2VWaXNpYmlsaXR5VGhyZXNob2xkID0gMC4wMTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJ0YWJsZVwiOlxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG59O1xuIiwiLyohXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiogS2VlbiBJTyBBZGFwdGVyXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiovXG5cbnZhciBLZWVuID0gcmVxdWlyZShcIi4uLy4uL2NvcmVcIiksXG4gICAgRGF0YXZpeiA9IHJlcXVpcmUoXCIuLi9kYXRhdml6XCIpO1xuXG52YXIgY2xvbmUgPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9jbG9uZVwiKSxcbiAgICBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9leHRlbmRcIiksXG4gICAgcHJldHR5TnVtYmVyID0gcmVxdWlyZShcIi4uL3V0aWxzL3ByZXR0eU51bWJlclwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICAvLyAoZnVuY3Rpb24obGliKXtcbiAgLy8gdmFyIEtlZW4gPSBsaWIgfHwge30sXG4gIHZhciBNZXRyaWMsIEVycm9yLCBTcGlubmVyO1xuXG4gIEtlZW4uRXJyb3IgPSB7XG4gICAgZGVmYXVsdHM6IHtcbiAgICAgIGJhY2tncm91bmRDb2xvciA6IFwiXCIsXG4gICAgICBib3JkZXJSYWRpdXMgICAgOiBcIjRweFwiLFxuICAgICAgY29sb3IgICAgICAgICAgIDogXCIjY2NjXCIsXG4gICAgICBkaXNwbGF5ICAgICAgICAgOiBcImJsb2NrXCIsXG4gICAgICBmb250RmFtaWx5ICAgICAgOiBcIkhlbHZldGljYSBOZXVlLCBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmXCIsXG4gICAgICBmb250U2l6ZSAgICAgICAgOiBcIjIxcHhcIixcbiAgICAgIGZvbnRXZWlnaHQgICAgICA6IFwibGlnaHRcIixcbiAgICAgIHRleHRBbGlnbiAgICAgICA6IFwiY2VudGVyXCJcbiAgICB9XG4gIH07XG5cbiAgS2Vlbi5TcGlubmVyLmRlZmF1bHRzID0ge1xuICAgIGhlaWdodDogMTM4LCAgICAgICAgICAgICAgICAgIC8vIFVzZWQgaWYgbm8gaGVpZ2h0IGlzIHByb3ZpZGVkXG4gICAgbGluZXM6IDEwLCAgICAgICAgICAgICAgICAgICAgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgbGVuZ3RoOiA4LCAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICB3aWR0aDogMywgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICByYWRpdXM6IDEwLCAgICAgICAgICAgICAgICAgICAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICBjb3JuZXJzOiAxLCAgICAgICAgICAgICAgICAgICAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgIHJvdGF0ZTogMCwgICAgICAgICAgICAgICAgICAgIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcbiAgICBkaXJlY3Rpb246IDEsICAgICAgICAgICAgICAgICAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXG4gICAgY29sb3I6ICcjNGQ0ZDRkJywgICAgICAgICAgICAgLy8gI3JnYiBvciAjcnJnZ2JiIG9yIGFycmF5IG9mIGNvbG9yc1xuICAgIHNwZWVkOiAxLjY3LCAgICAgICAgICAgICAgICAgIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gICAgdHJhaWw6IDYwLCAgICAgICAgICAgICAgICAgICAgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcbiAgICBzaGFkb3c6IGZhbHNlLCAgICAgICAgICAgICAgICAvLyBXaGV0aGVyIHRvIHJlbmRlciBhIHNoYWRvd1xuICAgIGh3YWNjZWw6IGZhbHNlLCAgICAgICAgICAgICAgIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxuICAgIGNsYXNzTmFtZTogJ2tlZW4tc3Bpbm5lcicsICAgIC8vIFRoZSBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBzcGlubmVyXG4gICAgekluZGV4OiAyZTksICAgICAgICAgICAgICAgICAgLy8gVGhlIHotaW5kZXggKGRlZmF1bHRzIHRvIDIwMDAwMDAwMDApXG4gICAgdG9wOiAnNTAlJywgICAgICAgICAgICAgICAgICAgLy8gVG9wIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxuICAgIGxlZnQ6ICc1MCUnICAgICAgICAgICAgICAgICAgIC8vIExlZnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XG4gIH07XG5cbiAgdmFyIGRhdGFUeXBlcyA9IHtcbiAgICAnc2luZ3VsYXInOiBbJ21ldHJpYyddXG4gIH07XG5cbiAgTWV0cmljID0ge1xuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgY3NzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpLFxuICAgICAgICAgIGJnRGVmYXVsdCA9IFwiIzQ5YzViMVwiO1xuXG4gICAgICBjc3MuaWQgPSBcImtlZW4td2lkZ2V0c1wiO1xuICAgICAgY3NzLnR5cGUgPSBcInRleHQvY3NzXCI7XG4gICAgICBjc3MuaW5uZXJIVE1MID0gXCJcXFxuICAua2Vlbi1tZXRyaWMgeyBcXG4gIGJhY2tncm91bmQ6IFwiICsgYmdEZWZhdWx0ICsgXCI7IFxcbiAgYm9yZGVyLXJhZGl1czogNHB4OyBcXG4gIGNvbG9yOiAjZmZmOyBcXG4gIGZvbnQtZmFtaWx5OiAnSGVsdmV0aWNhIE5ldWUnLCBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmOyBcXG4gIHBhZGRpbmc6IDEwcHggMDsgXFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7IFxcbn0gXFxcbiAgLmtlZW4tbWV0cmljLXZhbHVlIHsgXFxuICBkaXNwbGF5OiBibG9jazsgXFxuICBmb250LXNpemU6IDg0cHg7IFxcbiAgZm9udC13ZWlnaHQ6IDcwMDsgXFxuICBsaW5lLWhlaWdodDogODRweDsgXFxufSBcXFxuICAua2Vlbi1tZXRyaWMtdGl0bGUgeyBcXG4gIGRpc3BsYXk6IGJsb2NrOyBcXG4gIGZvbnQtc2l6ZTogMjRweDsgXFxuICBmb250LXdlaWdodDogMjAwOyBcXG59XCI7XG4gICAgICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNzcy5pZCkpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjc3MpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgYmdDb2xvciA9ICh0aGlzLmNvbG9ycygpLmxlbmd0aCA9PSAxKSA/IHRoaXMuY29sb3JzKClbMF0gOiBcIiM0OWM1YjFcIixcbiAgICAgICAgICB0aXRsZSA9IHRoaXMudGl0bGUoKSB8fCBcIlJlc3VsdFwiLFxuICAgICAgICAgIHZhbHVlID0gdGhpcy5kYXRhKClbMV1bMV0gfHwgMCxcbiAgICAgICAgICB3aWR0aCA9IHRoaXMud2lkdGgoKSxcbiAgICAgICAgICBvcHRzID0gdGhpcy5jaGFydE9wdGlvbnMoKSB8fCB7fSxcbiAgICAgICAgICBwcmVmaXggPSBcIlwiLFxuICAgICAgICAgIHN1ZmZpeCA9IFwiXCI7XG5cbiAgICAgIHZhciBzdHlsZXMgPSB7XG4gICAgICAgICd3aWR0aCc6ICh3aWR0aCkgPyB3aWR0aCArICdweCcgOiAnYXV0bydcbiAgICAgIH07XG5cbiAgICAgIHZhciBmb3JtYXR0ZWROdW0gPSB2YWx1ZTtcbiAgICAgIGlmICggdHlwZW9mIG9wdHMucHJldHR5TnVtYmVyID09PSAndW5kZWZpbmVkJyB8fCBvcHRzLnByZXR0eU51bWJlciA9PSB0cnVlICkge1xuICAgICAgICBpZiAoICFpc05hTihwYXJzZUludCh2YWx1ZSkpICkge1xuICAgICAgICAgIGZvcm1hdHRlZE51bSA9IHByZXR0eU51bWJlcih2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHNbJ3ByZWZpeCddKSB7XG4gICAgICAgIHByZWZpeCA9ICc8c3BhbiBjbGFzcz1cImtlZW4tbWV0cmljLXByZWZpeFwiPicgKyBvcHRzWydwcmVmaXgnXSArICc8L3NwYW4+JztcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzWydzdWZmaXgnXSkge1xuICAgICAgICBzdWZmaXggPSAnPHNwYW4gY2xhc3M9XCJrZWVuLW1ldHJpYy1zdWZmaXhcIj4nICsgb3B0c1snc3VmZml4J10gKyAnPC9zcGFuPic7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwoKS5pbm5lckhUTUwgPSAnJyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwia2Vlbi13aWRnZXQga2Vlbi1tZXRyaWNcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICcgKyBiZ0NvbG9yICsgJzsgd2lkdGg6JyArIHN0eWxlcy53aWR0aCArICc7XCIgdGl0bGU9XCInICsgdmFsdWUgKyAnXCI+JyArXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwia2Vlbi1tZXRyaWMtdmFsdWVcIj4nICsgcHJlZml4ICsgZm9ybWF0dGVkTnVtICsgc3VmZml4ICsgJzwvc3Bhbj4nICtcbiAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJrZWVuLW1ldHJpYy10aXRsZVwiPicgKyB0aXRsZSArICc8L3NwYW4+JyArXG4gICAgICAgICc8L2Rpdj4nO1xuICAgIH1cbiAgfTtcblxuICBFcnJvciA9IHtcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG4gICAgcmVuZGVyOiBmdW5jdGlvbih0ZXh0LCBzdHlsZSl7XG4gICAgICB2YXIgZXJyLCBtc2c7XG5cbiAgICAgIHZhciBkZWZhdWx0U3R5bGUgPSBjbG9uZShLZWVuLkVycm9yLmRlZmF1bHRzKTtcbiAgICAgIHZhciBjdXJyZW50U3R5bGUgPSBleHRlbmQoZGVmYXVsdFN0eWxlLCBzdHlsZSk7XG5cbiAgICAgIGVyciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBlcnIuY2xhc3NOYW1lID0gXCJrZWVuLWVycm9yXCI7XG4gICAgICBlYWNoKGN1cnJlbnRTdHlsZSwgZnVuY3Rpb24odmFsdWUsIGtleSl7XG4gICAgICAgIGVyci5zdHlsZVtrZXldID0gdmFsdWU7XG4gICAgICB9KTtcbiAgICAgIGVyci5zdHlsZS5oZWlnaHQgPSBTdHJpbmcodGhpcy5oZWlnaHQoKSArIFwicHhcIik7XG4gICAgICBlcnIuc3R5bGUucGFkZGluZ1RvcCA9ICh0aGlzLmhlaWdodCgpIC8gMiAtIDE1KSArIFwicHhcIjtcbiAgICAgIGVyci5zdHlsZS53aWR0aCA9IFN0cmluZyh0aGlzLndpZHRoKCkgKyBcInB4XCIpO1xuXG4gICAgICBtc2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgIG1zZy5pbm5lckhUTUwgPSB0ZXh0IHx8IFwiWWlrZXMhIEFuIGVycm9yIG9jY3VycmVkIVwiO1xuXG4gICAgICBlcnIuYXBwZW5kQ2hpbGQobXNnKTtcblxuICAgICAgdGhpcy5lbCgpLmlubmVySFRNTCA9IFwiXCI7XG4gICAgICB0aGlzLmVsKCkuYXBwZW5kQ2hpbGQoZXJyKTtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLmVsKCkuaW5uZXJIVE1MID0gXCJcIjtcbiAgICB9XG4gIH07XG5cbiAgU3Bpbm5lciA9IHtcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgdmFyIGhlaWdodCA9IHRoaXMuaGVpZ2h0KCkgfHwgS2Vlbi5TcGlubmVyLmRlZmF1bHRzLmhlaWdodDtcbiAgICAgIHNwaW5uZXIuY2xhc3NOYW1lID0gXCJrZWVuLWxvYWRpbmdcIjtcbiAgICAgIHNwaW5uZXIuc3R5bGUuaGVpZ2h0ID0gU3RyaW5nKGhlaWdodCArIFwicHhcIik7XG4gICAgICBzcGlubmVyLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuICAgICAgc3Bpbm5lci5zdHlsZS53aWR0aCA9IFN0cmluZyh0aGlzLndpZHRoKCkgKyBcInB4XCIpO1xuXG4gICAgICB0aGlzLmVsKCkuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgIHRoaXMuZWwoKS5hcHBlbmRDaGlsZChzcGlubmVyKTtcbiAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzLnNwaW5uZXIgPSBuZXcgS2Vlbi5TcGlubmVyKEtlZW4uU3Bpbm5lci5kZWZhdWx0cykuc3BpbihzcGlubmVyKTtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnZpZXcuX2FydGlmYWN0cy5zcGlubmVyLnN0b3AoKTtcbiAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzLnNwaW5uZXIgPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICBLZWVuLkRhdGF2aXoucmVnaXN0ZXIoJ2tlZW4taW8nLCB7XG4gICAgJ21ldHJpYyc6IE1ldHJpYyxcbiAgICAnZXJyb3InOiBFcnJvcixcbiAgICAnc3Bpbm5lcic6IFNwaW5uZXJcbiAgfSwge1xuICAgIGNhcGFiaWxpdGllczogZGF0YVR5cGVzXG4gIH0pO1xuXG59OyAvLykoS2Vlbik7XG4iLCJ2YXIgY2xvbmUgPSByZXF1aXJlKCcuLi9jb3JlL3V0aWxzL2Nsb25lJyksXG4gICAgZWFjaCA9IHJlcXVpcmUoJy4uL2NvcmUvdXRpbHMvZWFjaCcpLFxuICAgIGV4dGVuZCA9IHJlcXVpcmUoJy4uL2NvcmUvdXRpbHMvZXh0ZW5kJyksXG4gICAgbG9hZFNjcmlwdCA9IHJlcXVpcmUoJy4vdXRpbHMvbG9hZFNjcmlwdCcpLFxuICAgIGxvYWRTdHlsZSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9hZFN0eWxlJyk7XG5cbnZhciBLZWVuID0gcmVxdWlyZSgnLi4vY29yZScpO1xudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCcuLi9jb3JlL3V0aWxzL2VtaXR0ZXItc2hpbScpO1xuXG52YXIgRGF0YXNldCA9IHJlcXVpcmUoJy4uL2RhdGFzZXQnKTtcblxuZnVuY3Rpb24gRGF0YXZpeigpe1xuICB0aGlzLmRhdGFzZXQgPSBuZXcgRGF0YXNldCgpO1xuICB0aGlzLnZpZXcgPSB7XG4gICAgX3ByZXBhcmVkOiBmYWxzZSxcbiAgICBfaW5pdGlhbGl6ZWQ6IGZhbHNlLFxuICAgIF9yZW5kZXJlZDogZmFsc2UsXG4gICAgX2FydGlmYWN0czogeyAvKiBzdGF0ZSBiaW4gKi8gfSxcbiAgICBhZGFwdGVyOiB7XG4gICAgICBsaWJyYXJ5OiB1bmRlZmluZWQsXG4gICAgICBjaGFydE9wdGlvbnM6IHt9LFxuICAgICAgY2hhcnRUeXBlOiB1bmRlZmluZWQsXG4gICAgICBkZWZhdWx0Q2hhcnRUeXBlOiB1bmRlZmluZWQsXG4gICAgICBkYXRhVHlwZTogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBhdHRyaWJ1dGVzOiBjbG9uZShEYXRhdml6LmRlZmF1bHRzKSxcbiAgICBkZWZhdWx0czogY2xvbmUoRGF0YXZpei5kZWZhdWx0cyksXG4gICAgZWw6IHVuZGVmaW5lZCxcbiAgICBsb2FkZXI6IHsgbGlicmFyeTogJ2tlZW4taW8nLCBjaGFydFR5cGU6ICdzcGlubmVyJyB9XG4gIH07XG4gIERhdGF2aXoudmlzdWFscy5wdXNoKHRoaXMpO1xufTtcblxuZXh0ZW5kKERhdGF2aXosIHtcbiAgZGF0YVR5cGVNYXA6IHtcbiAgICAnc2luZ3VsYXInOiAgICAgICAgICB7IGxpYnJhcnk6ICdrZWVuLWlvJywgY2hhcnRUeXBlOiAnbWV0cmljJyAgICAgIH0sXG4gICAgJ2NhdGVnb3JpY2FsJzogICAgICAgeyBsaWJyYXJ5OiAnZ29vZ2xlJywgIGNoYXJ0VHlwZTogJ3BpZWNoYXJ0JyAgICB9LFxuICAgICdjYXQtaW50ZXJ2YWwnOiAgICAgIHsgbGlicmFyeTogJ2dvb2dsZScsICBjaGFydFR5cGU6ICdjb2x1bW5jaGFydCcgfSxcbiAgICAnY2F0LW9yZGluYWwnOiAgICAgICB7IGxpYnJhcnk6ICdnb29nbGUnLCAgY2hhcnRUeXBlOiAnYmFyY2hhcnQnICAgIH0sXG4gICAgJ2Nocm9ub2xvZ2ljYWwnOiAgICAgeyBsaWJyYXJ5OiAnZ29vZ2xlJywgIGNoYXJ0VHlwZTogJ2FyZWFjaGFydCcgICB9LFxuICAgICdjYXQtY2hyb25vbG9naWNhbCc6IHsgbGlicmFyeTogJ2dvb2dsZScsICBjaGFydFR5cGU6ICdsaW5lY2hhcnQnICAgfSxcbiAgICAnZXh0cmFjdGlvbic6ICAgICAgICB7IGxpYnJhcnk6ICdnb29nbGUnLCAgY2hhcnRUeXBlOiAndGFibGUnICAgICAgIH0sXG4gICAgJ25vbWluYWwnOiAgICAgICAgICAgeyBsaWJyYXJ5OiAnZ29vZ2xlJywgIGNoYXJ0VHlwZTogJ3RhYmxlJyAgICAgICB9XG4gIH0sXG4gIGRlZmF1bHRzOiB7XG4gICAgY29sb3JzOiBbXG4gICAgLyogdGVhbCAgICAgIHJlZCAgICAgICAgeWVsbG93ICAgICBwdXJwbGUgICAgIG9yYW5nZSAgICAgbWludCAgICAgICBibHVlICAgICAgIGdyZWVuICAgICAgbGF2ZW5kZXIgKi9cbiAgICAnIzAwYmJkZScsICcjZmU2NjcyJywgJyNlZWIwNTgnLCAnIzhhOGFkNicsICcjZmY4NTVjJywgJyMwMGNmYmInLCAnIzVhOWVlZCcsICcjNzNkNDgzJywgJyNjODc5YmInLFxuICAgICcjMDA5OWI2JywgJyNkNzRkNTgnLCAnI2NiOTE0MScsICcjNmI2YmI2JywgJyNkODY5NDUnLCAnIzAwYWE5OScsICcjNDI4MWM5JywgJyM1N2I1NjYnLCAnI2FjNWM5ZScsXG4gICAgJyMyN2NjZWInLCAnI2ZmODE4YicsICcjZjZiZjcxJywgJyM5YjliZTEnLCAnI2ZmOWI3OScsICcjMjZkZmNkJywgJyM3M2FmZjQnLCAnIzg3ZTA5NicsICcjZDg4YmNiJ1xuICAgIF0sXG4gICAgaW5kZXhCeTogJ3RpbWVmcmFtZS5zdGFydCcsXG4gICAgc3RhY2tlZDogZmFsc2VcbiAgfSxcbiAgZGVwZW5kZW5jaWVzOiB7XG4gICAgbG9hZGluZzogMCxcbiAgICBsb2FkZWQ6IDAsXG4gICAgdXJsczoge31cbiAgfSxcbiAgbGlicmFyaWVzOiB7fSxcbiAgdmlzdWFsczogW11cbn0pO1xuXG5FbWl0dGVyKERhdGF2aXopO1xuRW1pdHRlcihEYXRhdml6LnByb3RvdHlwZSk7XG5cbkRhdGF2aXoucmVnaXN0ZXIgPSBmdW5jdGlvbihuYW1lLCBtZXRob2RzLCBjb25maWcpe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBsb2FkSGFuZGxlciA9IGZ1bmN0aW9uKHN0KSB7XG4gICAgc3QubG9hZGVkKys7XG4gICAgaWYoc3QubG9hZGVkID09PSBzdC5sb2FkaW5nKSB7XG4gICAgICBLZWVuLmxvYWRlZCA9IHRydWU7XG4gICAgICBLZWVuLnRyaWdnZXIoJ3JlYWR5Jyk7XG4gICAgfVxuICB9O1xuXG4gIERhdGF2aXoubGlicmFyaWVzW25hbWVdID0gRGF0YXZpei5saWJyYXJpZXNbbmFtZV0gfHwge307XG5cbiAgLy8gQWRkIG1ldGhvZCB0byBsaWJyYXJ5IGhhc2hcbiAgZWFjaChtZXRob2RzLCBmdW5jdGlvbihtZXRob2QsIGtleSl7XG4gICAgRGF0YXZpei5saWJyYXJpZXNbbmFtZV1ba2V5XSA9IG1ldGhvZDtcbiAgfSk7XG5cbiAgLy8gU2V0IGRlZmF1bHQgY2FwYWJpbGl0aWVzIGhhc2hcbiAgaWYgKGNvbmZpZyAmJiBjb25maWcuY2FwYWJpbGl0aWVzKSB7XG4gICAgRGF0YXZpei5saWJyYXJpZXNbbmFtZV0uX2RlZmF1bHRzID0gRGF0YXZpei5saWJyYXJpZXNbbmFtZV0uX2RlZmF1bHRzIHx8IHt9O1xuICAgIGVhY2goY29uZmlnLmNhcGFiaWxpdGllcywgZnVuY3Rpb24odHlwZVNldCwga2V5KXtcbiAgICAgIC8vIHN0b3JlIHNvbWV3aGVyZSBpbiBsaWJyYXJ5XG4gICAgICBEYXRhdml6LmxpYnJhcmllc1tuYW1lXS5fZGVmYXVsdHNba2V5XSA9IHR5cGVTZXQ7XG4gICAgfSk7XG4gIH1cblxuICAvLyBGb3IgYWxsIGRlcGVuZGVuY2llc1xuICBpZiAoY29uZmlnICYmIGNvbmZpZy5kZXBlbmRlbmNpZXMpIHtcbiAgICBlYWNoKGNvbmZpZy5kZXBlbmRlbmNpZXMsIGZ1bmN0aW9uIChkZXBlbmRlbmN5LCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgdmFyIHN0YXR1cyA9IERhdGF2aXouZGVwZW5kZW5jaWVzO1xuICAgICAgLy8gSWYgaXQgZG9lc24ndCBleGlzdCBpbiB0aGUgY3VycmVudCBkZXBlbmRlbmNpZXMgYmVpbmcgbG9hZGVkXG4gICAgICBpZighc3RhdHVzLnVybHNbZGVwZW5kZW5jeS51cmxdKSB7XG4gICAgICAgIHN0YXR1cy51cmxzW2RlcGVuZGVuY3kudXJsXSA9IHRydWU7XG4gICAgICAgIHN0YXR1cy5sb2FkaW5nKys7XG4gICAgICAgIHZhciBtZXRob2QgPSBkZXBlbmRlbmN5LnR5cGUgPT09ICdzY3JpcHQnID8gbG9hZFNjcmlwdCA6IGxvYWRTdHlsZTtcblxuICAgICAgICBtZXRob2QoZGVwZW5kZW5jeS51cmwsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmKGRlcGVuZGVuY3kuY2IpIHtcbiAgICAgICAgICAgIGRlcGVuZGVuY3kuY2IuY2FsbChzZWxmLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgbG9hZEhhbmRsZXIoc3RhdHVzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2FkSGFuZGxlcihzdGF0dXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbkRhdGF2aXouZmluZCA9IGZ1bmN0aW9uKHRhcmdldCl7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIERhdGF2aXoudmlzdWFscztcbiAgdmFyIGVsID0gdGFyZ2V0Lm5vZGVOYW1lID8gdGFyZ2V0IDogZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpLFxuICAgICAgbWF0Y2g7XG5cbiAgZWFjaChEYXRhdml6LnZpc3VhbHMsIGZ1bmN0aW9uKHZpc3VhbCl7XG4gICAgaWYgKGVsID09IHZpc3VhbC5lbCgpKXtcbiAgICAgIG1hdGNoID0gdmlzdWFsO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSk7XG4gIGlmIChtYXRjaCkgcmV0dXJuIG1hdGNoO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhdml6O1xuIiwidmFyIGNsb25lID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvY2xvbmVcIiksXG4gICAgZXh0ZW5kID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZXh0ZW5kXCIpLFxuICAgIERhdGF2aXogPSByZXF1aXJlKFwiLi4vZGF0YXZpelwiKSxcbiAgICBSZXF1ZXN0ID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvcmVxdWVzdFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxdWVyeSwgZWwsIGNmZykge1xuICB2YXIgREVGQVVMVFMgPSBjbG9uZShEYXRhdml6LmRlZmF1bHRzKSxcbiAgICAgIHZpc3VhbCA9IG5ldyBEYXRhdml6KCksXG4gICAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodGhpcywgW3F1ZXJ5XSksXG4gICAgICBjb25maWcgPSBjZmcgPyBjbG9uZShjZmcpIDoge307XG5cbiAgaWYgKGNvbmZpZy5jaGFydFR5cGUpIHtcbiAgICB2aXN1YWwuY2hhcnRUeXBlKGNvbmZpZy5jaGFydFR5cGUpO1xuICAgIGRlbGV0ZSBjb25maWcuY2hhcnRUeXBlO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5saWJyYXJ5KSB7XG4gICAgdmlzdWFsLmxpYnJhcnkoY29uZmlnLmxpYnJhcnkpO1xuICAgIGRlbGV0ZSBjb25maWcubGlicmFyeTtcbiAgfVxuXG4gIGlmIChjb25maWcuY2hhcnRPcHRpb25zKSB7XG4gICAgdmlzdWFsLmNoYXJ0T3B0aW9ucyhjb25maWcuY2hhcnRPcHRpb25zKTtcbiAgICBkZWxldGUgY29uZmlnLmNoYXJ0T3B0aW9ucztcbiAgfVxuXG4gIHZpc3VhbFxuICAgIC5hdHRyaWJ1dGVzKGV4dGVuZChERUZBVUxUUywgY29uZmlnKSlcbiAgICAuZWwoZWwpXG4gICAgLnByZXBhcmUoKTtcblxuICByZXF1ZXN0LnJlZnJlc2goKTtcbiAgcmVxdWVzdC5vbihcImNvbXBsZXRlXCIsIGZ1bmN0aW9uKCl7XG4gICAgdmlzdWFsXG4gICAgICAucGFyc2VSZXF1ZXN0KHRoaXMpXG4gICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICBpZiAoY29uZmlnLmxhYmVscykge1xuICAgICAgICAgIHRoaXMubGFiZWxzKGNvbmZpZy5sYWJlbHMpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnJlbmRlcigpO1xuICB9KTtcbiAgcmVxdWVzdC5vbihcImVycm9yXCIsIGZ1bmN0aW9uKHJlcyl7XG4gICAgdmlzdWFsLmVycm9yKHJlcy5tZXNzYWdlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHZpc3VhbDtcbn07XG4iLCJ2YXIgRGF0YXZpeiA9IHJlcXVpcmUoXCIuLi9kYXRhdml6XCIpLFxuICAgIGV4dGVuZCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2V4dGVuZFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBtYXAgPSBleHRlbmQoe30sIERhdGF2aXouZGF0YVR5cGVNYXApLFxuICAgICAgZGF0YVR5cGUgPSB0aGlzLmRhdGFUeXBlKCksXG4gICAgICBsaWJyYXJ5ID0gdGhpcy5saWJyYXJ5KCksXG4gICAgICBjaGFydFR5cGUgPSB0aGlzLmNoYXJ0VHlwZSgpIHx8IHRoaXMuZGVmYXVsdENoYXJ0VHlwZSgpO1xuXG4gIC8vIFVzZSB0aGUgZGVmYXVsdCBsaWJyYXJ5IGFzIGEgYmFja3VwXG4gIGlmICghbGlicmFyeSAmJiBtYXBbZGF0YVR5cGVdKSB7XG4gICAgbGlicmFyeSA9IG1hcFtkYXRhVHlwZV0ubGlicmFyeTtcbiAgfVxuXG4gIC8vIFVzZSB0aGlzIGxpYnJhcnkncyBkZWZhdWx0IGNoYXJ0VHlwZSBmb3IgdGhpcyBkYXRhVHlwZVxuICBpZiAobGlicmFyeSAmJiAhY2hhcnRUeXBlICYmIGRhdGFUeXBlKSB7XG4gICAgY2hhcnRUeXBlID0gRGF0YXZpei5saWJyYXJpZXNbbGlicmFyeV0uX2RlZmF1bHRzW2RhdGFUeXBlXVswXTtcbiAgfVxuXG4gIC8vIFN0aWxsIG5vIGx1Y2s/XG4gIGlmIChsaWJyYXJ5ICYmICFjaGFydFR5cGUgJiYgbWFwW2RhdGFUeXBlXSkge1xuICAgIGNoYXJ0VHlwZSA9IG1hcFtkYXRhVHlwZV0uY2hhcnRUeXBlO1xuICB9XG5cbiAgLy8gUmV0dXJuIGlmIGZvdW5kXG4gIHJldHVybiAobGlicmFyeSAmJiBjaGFydFR5cGUpID8gRGF0YXZpei5saWJyYXJpZXNbbGlicmFyeV1bY2hhcnRUeXBlXSA6IHt9O1xufTtcbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKSxcbiAgICBEYXRhc2V0ID0gcmVxdWlyZShcIi4uLy4uL2RhdGFzZXRcIik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcImV4dHJhY3Rpb25cIjogcGFyc2VFeHRyYWN0aW9uXG59O1xuXG5mdW5jdGlvbiBwYXJzZUV4dHJhY3Rpb24ocmVxKXtcbiAgdmFyIGRhdGEgPSAocmVxLmRhdGEgaW5zdGFuY2VvZiBBcnJheSA/IHJlcS5kYXRhWzBdIDogcmVxLmRhdGEpLFxuICBuYW1lcyA9IHJlcS5xdWVyaWVzWzBdLmdldChcInByb3BlcnR5X25hbWVzXCIpIHx8IFtdLFxuICBzY2hlbWEgPSB7IHJlY29yZHM6IFwicmVzdWx0XCIsIHNlbGVjdDogdHJ1ZSB9O1xuICBpZiAobmFtZXMpIHtcbiAgICBzY2hlbWEuc2VsZWN0ID0gW107XG4gICAgZWFjaChuYW1lcywgZnVuY3Rpb24ocCl7XG4gICAgICBzY2hlbWEuc2VsZWN0LnB1c2goeyBwYXRoOiBwIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBEYXRhc2V0KGRhdGEsIHNjaGVtYSk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHJlcSl7XG4gIHZhciBhbmFseXNpcyA9IHJlcS5xdWVyaWVzWzBdLmFuYWx5c2lzLnJlcGxhY2UoXCJfXCIsIFwiIFwiKSxcbiAgY29sbGVjdGlvbiA9IHJlcS5xdWVyaWVzWzBdLmdldCgnZXZlbnRfY29sbGVjdGlvbicpLFxuICBvdXRwdXQ7XG4gIG91dHB1dCA9IGFuYWx5c2lzLnJlcGxhY2UoIC9cXGIuL2csIGZ1bmN0aW9uKGEpe1xuICAgIHJldHVybiBhLnRvVXBwZXJDYXNlKCk7XG4gIH0pO1xuICBpZiAoY29sbGVjdGlvbikge1xuICAgIG91dHB1dCArPSAnIC0gJyArIGNvbGxlY3Rpb247XG4gIH1cbiAgcmV0dXJuIG91dHB1dDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHF1ZXJ5KXtcbiAgdmFyIGlzSW50ZXJ2YWwgPSB0eXBlb2YgcXVlcnkucGFyYW1zLmludGVydmFsID09PSBcInN0cmluZ1wiLFxuICBpc0dyb3VwQnkgPSB0eXBlb2YgcXVlcnkucGFyYW1zLmdyb3VwX2J5ID09PSBcInN0cmluZ1wiLFxuICBpczJ4R3JvdXBCeSA9IHF1ZXJ5LnBhcmFtcy5ncm91cF9ieSBpbnN0YW5jZW9mIEFycmF5LFxuICBkYXRhVHlwZTtcblxuICAvLyBtZXRyaWNcbiAgaWYgKCFpc0dyb3VwQnkgJiYgIWlzSW50ZXJ2YWwpIHtcbiAgICBkYXRhVHlwZSA9ICdzaW5ndWxhcic7XG4gIH1cblxuICAvLyBncm91cF9ieSwgbm8gaW50ZXJ2YWxcbiAgaWYgKGlzR3JvdXBCeSAmJiAhaXNJbnRlcnZhbCkge1xuICAgIGRhdGFUeXBlID0gJ2NhdGVnb3JpY2FsJztcbiAgfVxuXG4gIC8vIGludGVydmFsLCBubyBncm91cF9ieVxuICBpZiAoaXNJbnRlcnZhbCAmJiAhaXNHcm91cEJ5KSB7XG4gICAgZGF0YVR5cGUgPSAnY2hyb25vbG9naWNhbCc7XG4gIH1cblxuICAvLyBpbnRlcnZhbCwgZ3JvdXBfYnlcbiAgaWYgKGlzSW50ZXJ2YWwgJiYgaXNHcm91cEJ5KSB7XG4gICAgZGF0YVR5cGUgPSAnY2F0LWNocm9ub2xvZ2ljYWwnO1xuICB9XG5cbiAgLy8gMnggZ3JvdXBfYnlcbiAgLy8gVE9ETzogcmVzZWFyY2ggcG9zc2libGUgZGF0YVR5cGUgb3B0aW9uc1xuICBpZiAoIWlzSW50ZXJ2YWwgJiYgaXMyeEdyb3VwQnkpIHtcbiAgICBkYXRhVHlwZSA9ICdjYXRlZ29yaWNhbCc7XG4gIH1cblxuICAvLyBpbnRlcnZhbCwgMnggZ3JvdXBfYnlcbiAgLy8gVE9ETzogcmVzZWFyY2ggcG9zc2libGUgZGF0YVR5cGUgb3B0aW9uc1xuICBpZiAoaXNJbnRlcnZhbCAmJiBpczJ4R3JvdXBCeSkge1xuICAgIGRhdGFUeXBlID0gJ2NhdC1jaHJvbm9sb2dpY2FsJztcbiAgfVxuXG4gIGlmIChxdWVyeS5hbmFseXNpcyA9PT0gXCJmdW5uZWxcIikge1xuICAgIGRhdGFUeXBlID0gJ2NhdC1vcmRpbmFsJztcbiAgfVxuXG4gIGlmIChxdWVyeS5hbmFseXNpcyA9PT0gXCJleHRyYWN0aW9uXCIpIHtcbiAgICBkYXRhVHlwZSA9ICdleHRyYWN0aW9uJztcbiAgfVxuICBpZiAocXVlcnkuYW5hbHlzaXMgPT09IFwic2VsZWN0X3VuaXF1ZVwiKSB7XG4gICAgZGF0YVR5cGUgPSAnbm9taW5hbCc7XG4gIH1cblxuICByZXR1cm4gZGF0YVR5cGU7XG59O1xuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoJy4uL2NvcmUvdXRpbHMvZXh0ZW5kJyksXG4gICAgRGF0YXZpeiA9IHJlcXVpcmUoJy4vZGF0YXZpeicpO1xuXG5leHRlbmQoRGF0YXZpei5wcm90b3R5cGUsIHtcbiAgJ2FkYXB0ZXInICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvYWRhcHRlcicpLFxuICAnYXR0cmlidXRlcycgICAgICAgOiByZXF1aXJlKCcuL2xpYi9hdHRyaWJ1dGVzJyksXG4gICdjYWxsJyAgICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2NhbGwnKSxcbiAgJ2NoYXJ0T3B0aW9ucycgICAgIDogcmVxdWlyZSgnLi9saWIvY2hhcnRPcHRpb25zJyksXG4gICdjaGFydFR5cGUnICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2NoYXJ0VHlwZScpLFxuICAnY29sb3JNYXBwaW5nJyAgICAgOiByZXF1aXJlKCcuL2xpYi9jb2xvck1hcHBpbmcnKSxcbiAgJ2NvbG9ycycgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvY29sb3JzJyksXG4gICdkYXRhJyAgICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2RhdGEnKSxcbiAgJ2RhdGFUeXBlJyAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvZGF0YVR5cGUnKSxcbiAgJ2RlZmF1bHRDaGFydFR5cGUnIDogcmVxdWlyZSgnLi9saWIvZGVmYXVsdENoYXJ0VHlwZScpLFxuICAnZWwnICAgICAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9lbCcpLFxuICAnaGVpZ2h0JyAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9oZWlnaHQnKSxcbiAgJ2luZGV4QnknICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvaW5kZXhCeScpLFxuICAnbGFiZWxNYXBwaW5nJyAgICAgOiByZXF1aXJlKCcuL2xpYi9sYWJlbE1hcHBpbmcnKSxcbiAgJ2xhYmVscycgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvbGFiZWxzJyksXG4gICdsaWJyYXJ5JyAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2xpYnJhcnknKSxcbiAgJ3BhcnNlUmF3RGF0YScgICAgIDogcmVxdWlyZSgnLi9saWIvcGFyc2VSYXdEYXRhJyksXG4gICdwYXJzZVJlcXVlc3QnICAgICA6IHJlcXVpcmUoJy4vbGliL3BhcnNlUmVxdWVzdCcpLFxuICAncHJlcGFyZScgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9wcmVwYXJlJyksXG4gICdzb3J0R3JvdXBzJyAgICAgICA6IHJlcXVpcmUoJy4vbGliL3NvcnRHcm91cHMnKSxcbiAgJ3NvcnRJbnRlcnZhbHMnICAgIDogcmVxdWlyZSgnLi9saWIvc29ydEludGVydmFscycpLFxuICAnc3RhY2tlZCcgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9zdGFja2VkJyksXG4gICd0aXRsZScgICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL3RpdGxlJyksXG4gICd3aWR0aCcgICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL3dpZHRoJylcbn0pO1xuXG5leHRlbmQoRGF0YXZpei5wcm90b3R5cGUsIHtcbiAgJ2Rlc3Ryb3knICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvYWN0aW9ucy9kZXN0cm95JyksXG4gICdlcnJvcicgICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2FjdGlvbnMvZXJyb3InKSxcbiAgJ2luaXRpYWxpemUnICAgICAgIDogcmVxdWlyZSgnLi9saWIvYWN0aW9ucy9pbml0aWFsaXplJyksXG4gICdyZW5kZXInICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2FjdGlvbnMvcmVuZGVyJyksXG4gICd1cGRhdGUnICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2FjdGlvbnMvdXBkYXRlJylcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGF2aXo7XG4iLCJ2YXIgZ2V0QWRhcHRlckFjdGlvbnMgPSByZXF1aXJlKFwiLi4vLi4vaGVscGVycy9nZXRBZGFwdGVyQWN0aW9uc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgYWN0aW9ucyA9IGdldEFkYXB0ZXJBY3Rpb25zLmNhbGwodGhpcyk7XG4gIGlmIChhY3Rpb25zLmRlc3Ryb3kpIHtcbiAgICBhY3Rpb25zLmRlc3Ryb3kuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICAvLyBjbGVhciByZW5kZXJlZCBhcnRpZmF0cywgc3RhdGUgYmluXG4gIGlmICh0aGlzLmVsKCkpIHtcbiAgICB0aGlzLmVsKCkuaW5uZXJIVE1MID0gXCJcIjtcbiAgfVxuICB0aGlzLnZpZXcuX3ByZXBhcmVkID0gZmFsc2U7XG4gIHRoaXMudmlldy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgdGhpcy52aWV3Ll9yZW5kZXJlZCA9IGZhbHNlO1xuICB0aGlzLnZpZXcuX2FydGlmYWN0cyA9IHt9O1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgZ2V0QWRhcHRlckFjdGlvbnMgPSByZXF1aXJlKFwiLi4vLi4vaGVscGVycy9nZXRBZGFwdGVyQWN0aW9uc1wiKSxcbiAgICBEYXRhdml6ID0gcmVxdWlyZShcIi4uLy4uL2RhdGF2aXpcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIGFjdGlvbnMgPSBnZXRBZGFwdGVyQWN0aW9ucy5jYWxsKHRoaXMpO1xuICBpZiAoYWN0aW9uc1snZXJyb3InXSkge1xuICAgIGFjdGlvbnNbJ2Vycm9yJ10uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSBlbHNlIHtcbiAgICBEYXRhdml6LmxpYnJhcmllc1sna2Vlbi1pbyddWydlcnJvciddLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBnZXRBZGFwdGVyQWN0aW9ucyA9IHJlcXVpcmUoXCIuLi8uLi9oZWxwZXJzL2dldEFkYXB0ZXJBY3Rpb25zXCIpLFxuICAgIERhdGF2aXogPSByZXF1aXJlKFwiLi4vLi4vZGF0YXZpelwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgYWN0aW9ucyA9IGdldEFkYXB0ZXJBY3Rpb25zLmNhbGwodGhpcyk7XG4gIHZhciBsb2FkZXIgPSBEYXRhdml6LmxpYnJhcmllc1t0aGlzLnZpZXcubG9hZGVyLmxpYnJhcnldW3RoaXMudmlldy5sb2FkZXIuY2hhcnRUeXBlXTtcbiAgaWYgKHRoaXMudmlldy5fcHJlcGFyZWQpIHtcbiAgICBpZiAobG9hZGVyLmRlc3Ryb3kpIGxvYWRlci5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHRoaXMuZWwoKSkgdGhpcy5lbCgpLmlubmVySFRNTCA9IFwiXCI7XG4gIH1cbiAgaWYgKGFjdGlvbnMuaW5pdGlhbGl6ZSkgYWN0aW9ucy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIHRoaXMudmlldy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgZ2V0QWRhcHRlckFjdGlvbnMgPSByZXF1aXJlKFwiLi4vLi4vaGVscGVycy9nZXRBZGFwdGVyQWN0aW9uc1wiKSxcbiAgICBhcHBseVRyYW5zZm9ybXMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvYXBwbHlUcmFuc2Zvcm1zXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBhY3Rpb25zID0gZ2V0QWRhcHRlckFjdGlvbnMuY2FsbCh0aGlzKTtcbiAgYXBwbHlUcmFuc2Zvcm1zLmNhbGwodGhpcyk7XG4gIGlmICghdGhpcy52aWV3Ll9pbml0aWFsaXplZCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICB9XG4gIGlmICh0aGlzLmVsKCkgJiYgYWN0aW9ucy5yZW5kZXIpIHtcbiAgICBhY3Rpb25zLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMudmlldy5fcmVuZGVyZWQgPSB0cnVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBnZXRBZGFwdGVyQWN0aW9ucyA9IHJlcXVpcmUoXCIuLi8uLi9oZWxwZXJzL2dldEFkYXB0ZXJBY3Rpb25zXCIpLFxuICAgIGFwcGx5VHJhbnNmb3JtcyA9IHJlcXVpcmUoXCIuLi8uLi91dGlscy9hcHBseVRyYW5zZm9ybXNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIGFjdGlvbnMgPSBnZXRBZGFwdGVyQWN0aW9ucy5jYWxsKHRoaXMpO1xuICBhcHBseVRyYW5zZm9ybXMuY2FsbCh0aGlzKTtcbiAgaWYgKGFjdGlvbnMudXBkYXRlKSB7XG4gICAgYWN0aW9ucy51cGRhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSBlbHNlIGlmIChhY3Rpb25zLnJlbmRlcikge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlldy5hZGFwdGVyO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGVhY2gob2JqLCBmdW5jdGlvbihwcm9wLCBrZXkpe1xuICAgIHNlbGYudmlldy5hZGFwdGVyW2tleV0gPSAocHJvcCA/IHByb3AgOiBudWxsKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcbnZhciBjaGFydE9wdGlvbnMgPSByZXF1aXJlKFwiLi9jaGFydE9wdGlvbnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBlYWNoKG9iaiwgZnVuY3Rpb24ocHJvcCwga2V5KXtcbiAgICBpZiAoa2V5ID09PSBcImNoYXJ0T3B0aW9uc1wiKSB7XG4gICAgICBjaGFydE9wdGlvbnMuY2FsbChzZWxmLCBwcm9wKTtcbiAgICAgIC8vIHNlbGYuY2hhcnRPcHRpb25zKHByb3ApO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLnZpZXdbXCJhdHRyaWJ1dGVzXCJdW2tleV0gPSBwcm9wO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4pe1xuICBmbi5jYWxsKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi4vLi4vY29yZS91dGlscy9leHRlbmQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3LmFkYXB0ZXIuY2hhcnRPcHRpb25zO1xuICBleHRlbmQodGhpcy52aWV3LmFkYXB0ZXIuY2hhcnRPcHRpb25zLCBvYmopO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlldy5hZGFwdGVyLmNoYXJ0VHlwZTtcbiAgdGhpcy52aWV3LmFkYXB0ZXIuY2hhcnRUeXBlID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLmNvbG9yTWFwcGluZztcbiAgdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5jb2xvck1hcHBpbmcgPSAob2JqID8gb2JqIDogbnVsbCk7XG4gIGNvbG9yTWFwcGluZy5jYWxsKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGNvbG9yTWFwcGluZygpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBzY2hlbWEgPSB0aGlzLmRhdGFzZXQuc2NoZW1hLFxuICAgICAgZGF0YSA9IHRoaXMuZGF0YXNldC5vdXRwdXQoKSxcbiAgICAgIGNvbG9yU2V0ID0gdGhpcy52aWV3LmRlZmF1bHRzLmNvbG9ycy5zbGljZSgpLFxuICAgICAgY29sb3JNYXAgPSB0aGlzLmNvbG9yTWFwcGluZygpLFxuICAgICAgZHQgPSB0aGlzLmRhdGFUeXBlKCkgfHwgXCJcIjtcblxuICBpZiAoY29sb3JNYXApIHtcbiAgICBpZiAoZHQuaW5kZXhPZihcImNocm9ub2xvZ2ljYWxcIikgPiAtMSB8fCAoc2NoZW1hLnVucGFjayAmJiBkYXRhWzBdLmxlbmd0aCA+IDIpKSB7XG4gICAgICBlYWNoKGRhdGFbMF0uc2xpY2UoMSksIGZ1bmN0aW9uKGxhYmVsLCBpKXtcbiAgICAgICAgdmFyIGNvbG9yID0gY29sb3JNYXBbbGFiZWxdO1xuICAgICAgICBpZiAoY29sb3IgJiYgY29sb3JTZXRbaV0gIT09IGNvbG9yKSB7XG4gICAgICAgICAgY29sb3JTZXQuc3BsaWNlKGksIDAsIGNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZWFjaChzZWxmLmRhdGFzZXQuc2VsZWN0Q29sdW1uKDApLnNsaWNlKDEpLCBmdW5jdGlvbihsYWJlbCwgaSl7XG4gICAgICAgIHZhciBjb2xvciA9IGNvbG9yTWFwW2xhYmVsXTtcbiAgICAgICAgaWYgKGNvbG9yICYmIGNvbG9yU2V0W2ldICE9PSBjb2xvcikge1xuICAgICAgICAgIGNvbG9yU2V0LnNwbGljZShpLCAwLCBjb2xvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBzZWxmLnZpZXcuYXR0cmlidXRlcy5jb2xvcnMgPSBjb2xvclNldDtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLmNvbG9ycztcbiAgdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5jb2xvcnMgPSAoYXJyIGluc3RhbmNlb2YgQXJyYXkgPyBhcnIgOiBudWxsKTtcbiAgdGhpcy52aWV3LmRlZmF1bHRzLmNvbG9ycyA9IChhcnIgaW5zdGFuY2VvZiBBcnJheSA/IGFyciA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgRGF0YXNldCA9IHJlcXVpcmUoXCIuLi8uLi9kYXRhc2V0XCIpLFxuICAgIFJlcXVlc3QgPSByZXF1aXJlKFwiLi4vLi4vY29yZS9yZXF1ZXN0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLmRhdGFzZXQub3V0cHV0KCk7XG4gIGlmIChkYXRhIGluc3RhbmNlb2YgRGF0YXNldCkge1xuICAgIHRoaXMuZGF0YXNldCA9IGRhdGE7XG4gIH0gZWxzZSBpZiAoZGF0YSBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICB0aGlzLnBhcnNlUmVxdWVzdChkYXRhKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnBhcnNlUmF3RGF0YShkYXRhKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlldy5hZGFwdGVyLmRhdGFUeXBlO1xuICB0aGlzLnZpZXcuYWRhcHRlci5kYXRhVHlwZSA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlldy5hZGFwdGVyLmRlZmF1bHRDaGFydFR5cGU7XG4gIHRoaXMudmlldy5hZGFwdGVyLmRlZmF1bHRDaGFydFR5cGUgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCl7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlldy5lbDtcbiAgdGhpcy52aWV3LmVsID0gZWw7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obnVtKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXVtcImhlaWdodFwiXTtcbiAgdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXVtcImhlaWdodFwiXSA9ICghaXNOYU4ocGFyc2VJbnQobnVtKSkgPyBwYXJzZUludChudW0pIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBEYXRhc2V0ID0gcmVxdWlyZShcIi4uLy4uL2RhdGFzZXRcIiksXG4gICAgRGF0YXZpeiA9IHJlcXVpcmUoXCIuLi9kYXRhdml6XCIpLFxuICAgIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0uaW5kZXhCeTtcbiAgdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5pbmRleEJ5ID0gKHN0ciA/IFN0cmluZyhzdHIpIDogRGF0YXZpei5kZWZhdWx0cy5pbmRleEJ5KTtcbiAgaW5kZXhCeS5jYWxsKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGluZGV4QnkoKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICByb290ID0gdGhpcy5kYXRhc2V0Lm1ldGEuc2NoZW1hIHx8IHRoaXMuZGF0YXNldC5tZXRhLnVucGFjayxcbiAgbmV3T3JkZXIgPSB0aGlzLmluZGV4QnkoKS5zcGxpdChcIi5cIikuam9pbihEYXRhc2V0LmRlZmF1bHRzLmRlbGltZXRlcik7XG4gIC8vIFJlcGxhY2UgaW4gc2NoZW1hIGFuZCByZS1ydW4gZGF0YXNldC5wYXJzZSgpXG4gIGVhY2gocm9vdCwgZnVuY3Rpb24oZGVmLCBpKXtcbiAgICAvLyB1cGRhdGUgJ3NlbGVjdCcgY29uZmlnc1xuICAgIGlmIChpID09PSBcInNlbGVjdFwiICYmIGRlZiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBlYWNoKGRlZiwgZnVuY3Rpb24oYywgail7XG4gICAgICAgIGlmIChjLnBhdGguaW5kZXhPZihcInRpbWVmcmFtZSAtPiBcIikgPiAtMSkge1xuICAgICAgICAgIHNlbGYuZGF0YXNldC5tZXRhLnNjaGVtYVtpXVtqXS5wYXRoID0gbmV3T3JkZXI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyB1cGRhdGUgJ3VucGFjaycgY29uZmlnc1xuICAgIGVsc2UgaWYgKGkgPT09IFwidW5wYWNrXCIgJiYgdHlwZW9mIGRlZiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgc2VsZi5kYXRhc2V0Lm1ldGEuc2NoZW1hW2ldWydpbmRleCddLnBhdGggPSBuZXdPcmRlcjtcbiAgICB9XG4gIH0pO1xuICB0aGlzLmRhdGFzZXQucGFyc2UoKTtcbn1cbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLmxhYmVsTWFwcGluZztcbiAgdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5sYWJlbE1hcHBpbmcgPSAob2JqID8gb2JqIDogbnVsbCk7XG4gIGFwcGx5TGFiZWxNYXBwaW5nLmNhbGwodGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gYXBwbHlMYWJlbE1hcHBpbmcoKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICBsYWJlbE1hcCA9IHRoaXMubGFiZWxNYXBwaW5nKCksXG4gIHNjaGVtYSA9IHRoaXMuZGF0YXNldC5zY2hlbWEoKSB8fCB7fSxcbiAgZHQgPSB0aGlzLmRhdGFUeXBlKCkgfHwgXCJcIjtcblxuICBpZiAobGFiZWxNYXApIHtcbiAgICBpZiAoZHQuaW5kZXhPZihcImNocm9ub2xvZ2ljYWxcIikgPiAtMSB8fCAoc2NoZW1hLnVucGFjayAmJiBzZWxmLmRhdGFzZXQub3V0cHV0KClbMF0ubGVuZ3RoID4gMikpIHtcbiAgICAgIC8vIGxvb3Agb3ZlciBoZWFkZXIgY2VsbHNcbiAgICAgIGVhY2goc2VsZi5kYXRhc2V0Lm91dHB1dCgpWzBdLCBmdW5jdGlvbihjLCBpKXtcbiAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgc2VsZi5kYXRhc2V0LmRhdGEub3V0cHV0WzBdW2ldID0gbGFiZWxNYXBbY10gfHwgYztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNjaGVtYS5zZWxlY3QgJiYgc2VsZi5kYXRhc2V0Lm91dHB1dCgpWzBdLmxlbmd0aCA9PT0gMikge1xuICAgICAgLy8gdXBkYXRlIGNvbHVtbiAwXG4gICAgICBzZWxmLmRhdGFzZXQudXBkYXRlQ29sdW1uKDAsIGZ1bmN0aW9uKGMsIGkpe1xuICAgICAgICByZXR1cm4gbGFiZWxNYXBbY10gfHwgYztcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIiwidmFyIGVhY2ggPSByZXF1aXJlKCcuLi8uLi9jb3JlL3V0aWxzL2VhY2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAvLyBJZiBsYWJlbHMgY29uZmlnIGlzIGVtcHR5LCByZXR1cm4gd2hhdCdzIGluIHRoZSBkYXRhc2V0XG4gICAgaWYgKCF0aGlzLnZpZXdbJ2F0dHJpYnV0ZXMnXS5sYWJlbHMgfHwgIXRoaXMudmlld1snYXR0cmlidXRlcyddLmxhYmVscy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBnZXRMYWJlbHMuY2FsbCh0aGlzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy52aWV3WydhdHRyaWJ1dGVzJ10ubGFiZWxzO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLnZpZXdbJ2F0dHJpYnV0ZXMnXS5sYWJlbHMgPSAoYXJyIGluc3RhbmNlb2YgQXJyYXkgPyBhcnIgOiBudWxsKTtcbiAgICBzZXRMYWJlbHMuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxuZnVuY3Rpb24gc2V0TGFiZWxzKCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGxhYmVsU2V0ID0gdGhpcy5sYWJlbHMoKSB8fCBudWxsLFxuICAgICAgc2NoZW1hID0gdGhpcy5kYXRhc2V0LnNjaGVtYSgpIHx8IHt9LFxuICAgICAgZGF0YSA9IHRoaXMuZGF0YXNldC5vdXRwdXQoKSxcbiAgICAgIGR0ID0gdGhpcy5kYXRhVHlwZSgpIHx8ICcnO1xuXG4gIGlmIChsYWJlbFNldCkge1xuICAgIGlmIChkdC5pbmRleE9mKCdjaHJvbm9sb2dpY2FsJykgPiAtMSB8fCAoc2NoZW1hLnVucGFjayAmJiBkYXRhWzBdLmxlbmd0aCA+IDIpKSB7XG4gICAgICBlYWNoKGRhdGFbMF0sIGZ1bmN0aW9uKGNlbGwsaSl7XG4gICAgICAgIGlmIChpID4gMCAmJiBsYWJlbFNldFtpLTFdKSB7XG4gICAgICAgICAgc2VsZi5kYXRhc2V0LmRhdGEub3V0cHV0WzBdW2ldID0gbGFiZWxTZXRbaS0xXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZWFjaChkYXRhLCBmdW5jdGlvbihyb3csaSl7XG4gICAgICAgIGlmIChpID4gMCAmJiBsYWJlbFNldFtpLTFdKSB7XG4gICAgICAgICAgc2VsZi5kYXRhc2V0LmRhdGEub3V0cHV0W2ldWzBdID0gbGFiZWxTZXRbaS0xXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldExhYmVscygpe1xuICB2YXIgc2NoZW1hID0gdGhpcy5kYXRhc2V0LnNjaGVtYSgpIHx8IHt9LFxuICAgICAgZGF0YSA9IHRoaXMuZGF0YXNldC5vdXRwdXQoKSxcbiAgICAgIGR0ID0gdGhpcy5kYXRhVHlwZSgpIHx8ICcnLFxuICAgICAgbGFiZWxzO1xuXG4gIGlmIChkdC5pbmRleE9mKCdjaHJvbicpID4gLTEgfHwgKHNjaGVtYS51bnBhY2sgJiYgZGF0YVswXS5sZW5ndGggPiAyKSkge1xuICAgIGxhYmVscyA9IHRoaXMuZGF0YXNldC5zZWxlY3RSb3coMCkuc2xpY2UoMSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgbGFiZWxzID0gdGhpcy5kYXRhc2V0LnNlbGVjdENvbHVtbigwKS5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gbGFiZWxzO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXcuYWRhcHRlci5saWJyYXJ5O1xuICB0aGlzLnZpZXcuYWRhcHRlci5saWJyYXJ5ID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBEYXRhdml6ID0gcmVxdWlyZSgnLi4vZGF0YXZpeicpLFxuICAgIERhdGFzZXQgPSByZXF1aXJlKCcuLi8uLi9kYXRhc2V0Jyk7XG5cbnZhciBlYWNoID0gcmVxdWlyZSgnLi4vLi4vY29yZS91dGlscy9lYWNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocmF3KXtcbiAgdGhpcy5kYXRhc2V0ID0gcGFyc2VSYXdEYXRhLmNhbGwodGhpcywgcmF3KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBwYXJzZVJhd0RhdGEocmVzcG9uc2Upe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBzY2hlbWEgPSB7fSxcbiAgICAgIGluZGV4QnksXG4gICAgICBkZWxpbWV0ZXIsXG4gICAgICBpbmRleFRhcmdldCxcbiAgICAgIGxhYmVsU2V0LFxuICAgICAgbGFiZWxNYXAsXG4gICAgICBkYXRhVHlwZSxcbiAgICAgIGRhdGFzZXQ7XG5cbiAgaW5kZXhCeSA9IHNlbGYuaW5kZXhCeSgpID8gc2VsZi5pbmRleEJ5KCkgOiBEYXRhdml6LmRlZmF1bHRzLmluZGV4Qnk7XG4gIGRlbGltZXRlciA9IERhdGFzZXQuZGVmYXVsdHMuZGVsaW1ldGVyO1xuICBpbmRleFRhcmdldCA9IGluZGV4Qnkuc3BsaXQoJy4nKS5qb2luKGRlbGltZXRlcik7XG5cbiAgbGFiZWxTZXQgPSBzZWxmLmxhYmVscygpIHx8IG51bGw7XG4gIGxhYmVsTWFwID0gc2VsZi5sYWJlbE1hcHBpbmcoKSB8fCBudWxsO1xuXG4gIC8vIE1ldHJpY1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGlmICh0eXBlb2YgcmVzcG9uc2UucmVzdWx0ID09ICdudW1iZXInKXtcbiAgICAvL3JldHVybiBuZXcgRGF0YXNldChyZXNwb25zZSwge1xuICAgIGRhdGFUeXBlID0gJ3Npbmd1bGFyJztcbiAgICBzY2hlbWEgPSB7XG4gICAgICByZWNvcmRzOiAnJyxcbiAgICAgIHNlbGVjdDogW3tcbiAgICAgICAgcGF0aDogJ3Jlc3VsdCcsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBsYWJlbDogJ01ldHJpYydcbiAgICAgIH1dXG4gICAgfVxuICB9XG5cbiAgLy8gRXZlcnl0aGluZyBlbHNlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaWYgKHJlc3BvbnNlLnJlc3VsdCBpbnN0YW5jZW9mIEFycmF5ICYmIHJlc3BvbnNlLnJlc3VsdC5sZW5ndGggPiAwKXtcblxuICAgIC8vIEludGVydmFsIHcvIHNpbmdsZSB2YWx1ZVxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAocmVzcG9uc2UucmVzdWx0WzBdLnRpbWVmcmFtZSAmJiAodHlwZW9mIHJlc3BvbnNlLnJlc3VsdFswXS52YWx1ZSA9PSAnbnVtYmVyJyB8fCByZXNwb25zZS5yZXN1bHRbMF0udmFsdWUgPT0gbnVsbCkpIHtcbiAgICAgIGRhdGFUeXBlID0gJ2Nocm9ub2xvZ2ljYWwnO1xuICAgICAgc2NoZW1hID0ge1xuICAgICAgICByZWNvcmRzOiAncmVzdWx0JyxcbiAgICAgICAgc2VsZWN0OiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgcGF0aDogaW5kZXhUYXJnZXQsXG4gICAgICAgICAgICB0eXBlOiAnZGF0ZSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHBhdGg6ICd2YWx1ZScsXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgICAgICAgLy8gZm9ybWF0OiAnMTAnXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3RhdGljIEdyb3VwQnlcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKHR5cGVvZiByZXNwb25zZS5yZXN1bHRbMF0ucmVzdWx0ID09ICdudW1iZXInKXtcbiAgICAgIGRhdGFUeXBlID0gJ2NhdGVnb3JpY2FsJztcbiAgICAgIHNjaGVtYSA9IHtcbiAgICAgICAgcmVjb3JkczogJ3Jlc3VsdCcsXG4gICAgICAgIHNlbGVjdDogW11cbiAgICAgIH07XG4gICAgICBmb3IgKHZhciBrZXkgaW4gcmVzcG9uc2UucmVzdWx0WzBdKXtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnJlc3VsdFswXS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleSAhPT0gJ3Jlc3VsdCcpe1xuICAgICAgICAgIHNjaGVtYS5zZWxlY3QucHVzaCh7XG4gICAgICAgICAgICBwYXRoOiBrZXksXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzY2hlbWEuc2VsZWN0LnB1c2goe1xuICAgICAgICBwYXRoOiAncmVzdWx0JyxcbiAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEdyb3VwZWQgSW50ZXJ2YWxcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKHJlc3BvbnNlLnJlc3VsdFswXS52YWx1ZSBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgIGRhdGFUeXBlID0gJ2NhdC1jaHJvbm9sb2dpY2FsJztcbiAgICAgIHNjaGVtYSA9IHtcbiAgICAgICAgcmVjb3JkczogJ3Jlc3VsdCcsXG4gICAgICAgIHVucGFjazoge1xuICAgICAgICAgIGluZGV4OiB7XG4gICAgICAgICAgICBwYXRoOiBpbmRleFRhcmdldCxcbiAgICAgICAgICAgIHR5cGU6ICdkYXRlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIHBhdGg6ICd2YWx1ZSAtPiByZXN1bHQnLFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGtleSBpbiByZXNwb25zZS5yZXN1bHRbMF0udmFsdWVbMF0pe1xuICAgICAgICBpZiAocmVzcG9uc2UucmVzdWx0WzBdLnZhbHVlWzBdLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5ICE9PSAncmVzdWx0Jyl7XG4gICAgICAgICAgc2NoZW1hLnVucGFjay5sYWJlbCA9IHtcbiAgICAgICAgICAgIHBhdGg6ICd2YWx1ZSAtPiAnICsga2V5LFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGdW5uZWxcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKHR5cGVvZiByZXNwb25zZS5yZXN1bHRbMF0gPT0gJ251bWJlcicgJiYgdHlwZW9mIHJlc3BvbnNlLnJlc3VsdC5zdGVwcyAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICBkYXRhVHlwZSA9ICdjYXQtb3JkaW5hbCc7XG4gICAgICBzY2hlbWEgPSB7XG4gICAgICAgIHJlY29yZHM6ICcnLFxuICAgICAgICB1bnBhY2s6IHtcbiAgICAgICAgICBpbmRleDoge1xuICAgICAgICAgICAgcGF0aDogJ3N0ZXBzIC0+IGV2ZW50X2NvbGxlY3Rpb24nLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBwYXRoOiAncmVzdWx0IC0+ICcsXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNlbGVjdCBVbmlxdWVcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKHR5cGVvZiByZXNwb25zZS5yZXN1bHRbMF0gPT0gJ3N0cmluZycgfHwgdHlwZW9mIHJlc3BvbnNlLnJlc3VsdFswXSA9PSAnbnVtYmVyJyl7XG4gICAgICBkYXRhVHlwZSA9ICdub21pbmFsJztcbiAgICAgIGRhdGFzZXQgPSBuZXcgRGF0YXNldCgpO1xuICAgICAgZGF0YXNldC5hcHBlbmRDb2x1bW4oJ3VuaXF1ZSB2YWx1ZXMnLCBbXSk7XG4gICAgICBlYWNoKHJlc3BvbnNlLnJlc3VsdCwgZnVuY3Rpb24ocmVzdWx0LCBpKXtcbiAgICAgICAgZGF0YXNldC5hcHBlbmRSb3cocmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEV4dHJhY3Rpb25cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKGRhdGFUeXBlID09PSB2b2lkIDApIHtcbiAgICAgIGRhdGFUeXBlID0gJ2V4dHJhY3Rpb24nO1xuICAgICAgc2NoZW1hID0geyByZWNvcmRzOiAncmVzdWx0Jywgc2VsZWN0OiB0cnVlIH07XG4gICAgfVxuXG4gIH1cblxuICBkYXRhc2V0ID0gZGF0YXNldCBpbnN0YW5jZW9mIERhdGFzZXQgPyBkYXRhc2V0IDogbmV3IERhdGFzZXQocmVzcG9uc2UsIHNjaGVtYSk7XG5cbiAgLy8gU2V0IGRhdGFUeXBlXG4gIGlmIChkYXRhVHlwZSkge1xuICAgIHNlbGYuZGF0YVR5cGUoZGF0YVR5cGUpO1xuICB9XG5cbiAgcmV0dXJuIGRhdGFzZXQ7XG59XG4iLCJ2YXIgZ2V0RGF0YXNldFNjaGVtYXMgPSByZXF1aXJlKFwiLi4vaGVscGVycy9nZXREYXRhc2V0U2NoZW1hc1wiKSxcbiAgICBnZXREZWZhdWx0VGl0bGUgPSByZXF1aXJlKFwiLi4vaGVscGVycy9nZXREZWZhdWx0VGl0bGVcIiksXG4gICAgZ2V0UXVlcnlEYXRhVHlwZSA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2dldFF1ZXJ5RGF0YVR5cGVcIik7XG5cbnZhciBEYXRhc2V0ID0gcmVxdWlyZShcIi4uLy4uL2RhdGFzZXRcIiksXG4gICAgcGFyc2VSYXdEYXRhID0gcmVxdWlyZShcIi4vcGFyc2VSYXdEYXRhXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHJlcSl7XG4gIHZhciBkYXRhVHlwZSA9IGdldFF1ZXJ5RGF0YVR5cGUocmVxLnF1ZXJpZXNbMF0pO1xuXG4gIGlmIChkYXRhVHlwZSA9PT0gXCJleHRyYWN0aW9uXCIpIHtcbiAgICB0aGlzLmRhdGFzZXQgPSBnZXREYXRhc2V0U2NoZW1hcy5leHRyYWN0aW9uKHJlcSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5wYXJzZVJhd0RhdGEocmVxLmRhdGEgaW5zdGFuY2VvZiBBcnJheSA/IHJlcS5kYXRhWzBdIDogcmVxLmRhdGEpO1xuICB9XG5cbiAgLy8gU2V0IGRhdGFUeXBlXG4gIHRoaXMuZGF0YVR5cGUoZGF0YVR5cGUpO1xuXG4gIC8vIFVwZGF0ZSB0aGUgZGVmYXVsdCB0aXRsZSBldmVyeSB0aW1lXG4gIHRoaXMudmlldy5kZWZhdWx0cy50aXRsZSA9IGdldERlZmF1bHRUaXRsZS5jYWxsKHRoaXMsIHJlcSk7XG5cbiAgLy8gVXBkYXRlIHRoZSBhY3RpdmUgdGl0bGUgaWYgbm90IHNldFxuICBpZiAoIXRoaXMudGl0bGUoKSkge1xuICAgIHRoaXMudGl0bGUodGhpcy52aWV3LmRlZmF1bHRzLnRpdGxlKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgRGF0YXZpeiA9IHJlcXVpcmUoXCIuLi9kYXRhdml6XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBsb2FkZXI7XG4gIGlmICh0aGlzLnZpZXcuX3JlbmRlcmVkKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cbiAgaWYgKHRoaXMuZWwoKSkge1xuICAgIHRoaXMuZWwoKS5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGxvYWRlciA9IERhdGF2aXoubGlicmFyaWVzW3RoaXMudmlldy5sb2FkZXIubGlicmFyeV1bdGhpcy52aWV3LmxvYWRlci5jaGFydFR5cGVdO1xuICAgIGlmIChsb2FkZXIuaW5pdGlhbGl6ZSkge1xuICAgICAgbG9hZGVyLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgaWYgKGxvYWRlci5yZW5kZXIpIHtcbiAgICAgIGxvYWRlci5yZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgdGhpcy52aWV3Ll9wcmVwYXJlZCA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLnNvcnRHcm91cHM7XG4gIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0uc29ydEdyb3VwcyA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICBydW5Tb3J0R3JvdXBzLmNhbGwodGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gcnVuU29ydEdyb3Vwcygpe1xuICB2YXIgZHQgPSB0aGlzLmRhdGFUeXBlKCk7XG4gIGlmICghdGhpcy5zb3J0R3JvdXBzKCkpIHJldHVybjtcbiAgaWYgKChkdCAmJiBkdC5pbmRleE9mKFwiY2hyb25vbG9naWNhbFwiKSA+IC0xKSB8fCB0aGlzLmRhdGEoKVswXS5sZW5ndGggPiAyKSB7XG4gICAgLy8gU29ydCBjb2x1bW5zIGJ5IFN1bSAobiB2YWx1ZXMpXG4gICAgdGhpcy5kYXRhc2V0LnNvcnRDb2x1bW5zKHRoaXMuc29ydEdyb3VwcygpLCB0aGlzLmRhdGFzZXQuZ2V0Q29sdW1uU3VtKTtcbiAgfVxuICBlbHNlIGlmIChkdCAmJiAoZHQuaW5kZXhPZihcImNhdC1cIikgPiAtMSB8fCBkdC5pbmRleE9mKFwiY2F0ZWdvcmljYWxcIikgPiAtMSkpIHtcbiAgICAvLyBTb3J0IHJvd3MgYnkgU3VtICgxIHZhbHVlKVxuICAgIHRoaXMuZGF0YXNldC5zb3J0Um93cyh0aGlzLnNvcnRHcm91cHMoKSwgdGhpcy5kYXRhc2V0LmdldFJvd1N1bSk7XG4gIH1cbiAgcmV0dXJuO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLnNvcnRJbnRlcnZhbHM7XG4gIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0uc29ydEludGVydmFscyA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICBydW5Tb3J0SW50ZXJ2YWxzLmNhbGwodGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gcnVuU29ydEludGVydmFscygpe1xuICBpZiAoIXRoaXMuc29ydEludGVydmFscygpKSByZXR1cm47XG4gIC8vIFNvcnQgcm93cyBieSBpbmRleFxuICB0aGlzLmRhdGFzZXQuc29ydFJvd3ModGhpcy5zb3J0SW50ZXJ2YWxzKCkpO1xuICByZXR1cm47XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGJvb2wpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbJ2F0dHJpYnV0ZXMnXVsnc3RhY2tlZCddO1xuICB0aGlzLnZpZXdbJ2F0dHJpYnV0ZXMnXVsnc3RhY2tlZCddID0gYm9vbCA/IHRydWUgOiBmYWxzZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdW1widGl0bGVcIl07XG4gIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl1bXCJ0aXRsZVwiXSA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG51bSl7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl1bXCJ3aWR0aFwiXTtcbiAgdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXVtcIndpZHRoXCJdID0gKCFpc05hTihwYXJzZUludChudW0pKSA/IHBhcnNlSW50KG51bSkgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG4gIGlmICh0aGlzLmxhYmVsTWFwcGluZygpKSB7XG4gICAgdGhpcy5sYWJlbE1hcHBpbmcodGhpcy5sYWJlbE1hcHBpbmcoKSk7XG4gIH1cblxuICBpZiAodGhpcy5jb2xvck1hcHBpbmcoKSkge1xuICAgIHRoaXMuY29sb3JNYXBwaW5nKHRoaXMuY29sb3JNYXBwaW5nKCkpO1xuICB9XG5cbiAgaWYgKHRoaXMuc29ydEdyb3VwcygpKSB7XG4gICAgdGhpcy5zb3J0R3JvdXBzKHRoaXMuc29ydEdyb3VwcygpKTtcbiAgfVxuXG4gIGlmICh0aGlzLnNvcnRJbnRlcnZhbHMoKSkge1xuICAgIHRoaXMuc29ydEludGVydmFscyh0aGlzLnNvcnRJbnRlcnZhbHMoKSk7XG4gIH1cblxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXJsLCBjYikge1xuICB2YXIgZG9jID0gZG9jdW1lbnQ7XG4gIHZhciBoYW5kbGVyO1xuICB2YXIgaGVhZCA9IGRvYy5oZWFkIHx8IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIik7XG5cbiAgLy8gbG9hZGluZyBjb2RlIGJvcnJvd2VkIGRpcmVjdGx5IGZyb20gTEFCanMgaXRzZWxmXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIC8vIGNoZWNrIGlmIHJlZiBpcyBzdGlsbCBhIGxpdmUgbm9kZSBsaXN0XG4gICAgaWYgKCdpdGVtJyBpbiBoZWFkKSB7XG4gICAgICAvLyBhcHBlbmRfdG8gbm9kZSBub3QgeWV0IHJlYWR5XG4gICAgICBpZiAoIWhlYWRbMF0pIHtcbiAgICAgICAgc2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLCAyNSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIHJlYXNzaWduIGZyb20gbGl2ZSBub2RlIGxpc3QgcmVmIHRvIHB1cmUgbm9kZSByZWYgLS0gYXZvaWRzIG5hc3R5IElFIGJ1ZyB3aGVyZSBjaGFuZ2VzIHRvIERPTSBpbnZhbGlkYXRlIGxpdmUgbm9kZSBsaXN0c1xuICAgICAgaGVhZCA9IGhlYWRbMF07XG4gICAgfVxuICAgIHZhciBzY3JpcHQgPSBkb2MuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKSxcbiAgICBzY3JpcHRkb25lID0gZmFsc2U7XG4gICAgc2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoKHNjcmlwdC5yZWFkeVN0YXRlICYmIHNjcmlwdC5yZWFkeVN0YXRlICE9PSBcImNvbXBsZXRlXCIgJiYgc2NyaXB0LnJlYWR5U3RhdGUgIT09IFwibG9hZGVkXCIpIHx8IHNjcmlwdGRvbmUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgc2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgc2NyaXB0ZG9uZSA9IHRydWU7XG4gICAgICBjYigpO1xuICAgIH07XG4gICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICBoZWFkLmluc2VydEJlZm9yZShzY3JpcHQsIGhlYWQuZmlyc3RDaGlsZCk7XG4gIH0sIDApO1xuXG4gIC8vIHJlcXVpcmVkOiBzaGltIGZvciBGRiA8PSAzLjUgbm90IGhhdmluZyBkb2N1bWVudC5yZWFkeVN0YXRlXG4gIGlmIChkb2MucmVhZHlTdGF0ZSA9PT0gbnVsbCAmJiBkb2MuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIGRvYy5yZWFkeVN0YXRlID0gXCJsb2FkaW5nXCI7XG4gICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaGFuZGxlciwgZmFsc2UpO1xuICAgICAgZG9jLnJlYWR5U3RhdGUgPSBcImNvbXBsZXRlXCI7XG4gICAgfSwgZmFsc2UpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIGNiKSB7XG4gIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICBsaW5rLnNldEF0dHJpYnV0ZSgncmVsJywgJ3N0eWxlc2hlZXQnKTtcbiAgbGluay50eXBlID0gJ3RleHQvY3NzJztcbiAgbGluay5ocmVmID0gdXJsO1xuICBjYigpO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oX2lucHV0KSB7XG4gIC8vIElmIGl0IGhhcyAzIG9yIGZld2VyIHNpZyBmaWdzIGFscmVhZHksIGp1c3QgcmV0dXJuIHRoZSBudW1iZXIuXG4gIHZhciBpbnB1dCA9IE51bWJlcihfaW5wdXQpLFxuICAgICAgc2NpTm8gPSBpbnB1dC50b1ByZWNpc2lvbigzKSxcbiAgICAgIHByZWZpeCA9IFwiXCIsXG4gICAgICBzdWZmaXhlcyA9IFtcIlwiLCBcImtcIiwgXCJNXCIsIFwiQlwiLCBcIlRcIl07XG5cbiAgaWYgKE51bWJlcihzY2lObykgPT0gaW5wdXQgJiYgU3RyaW5nKGlucHV0KS5sZW5ndGggPD0gNCkge1xuICAgIHJldHVybiBTdHJpbmcoaW5wdXQpO1xuICB9XG5cbiAgaWYoaW5wdXQgPj0gMSB8fCBpbnB1dCA8PSAtMSkge1xuICAgIGlmKGlucHV0IDwgMCl7XG4gICAgICAvL1B1bGwgb2ZmIHRoZSBuZWdhdGl2ZSBzaWRlIGFuZCBzdGFzaCB0aGF0LlxuICAgICAgaW5wdXQgPSAtaW5wdXQ7XG4gICAgICBwcmVmaXggPSBcIi1cIjtcbiAgICB9XG4gICAgcmV0dXJuIHByZWZpeCArIHJlY3Vyc2UoaW5wdXQsIDApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBpbnB1dC50b1ByZWNpc2lvbigzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY3Vyc2UoaW5wdXQsIGl0ZXJhdGlvbikge1xuICAgIHZhciBpbnB1dCA9IFN0cmluZyhpbnB1dCk7XG4gICAgdmFyIHNwbGl0ID0gaW5wdXQuc3BsaXQoXCIuXCIpO1xuICAgIC8vIElmIHRoZXJlJ3MgYSBkb3RcbiAgICBpZihzcGxpdC5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBLZWVwIHRoZSBsZWZ0IGhhbmQgc2lkZSBvbmx5XG4gICAgICBpbnB1dCA9IHNwbGl0WzBdO1xuICAgICAgdmFyIHJocyA9IHNwbGl0WzFdO1xuICAgICAgLy8gSWYgdGhlIGxlZnQtaGFuZCBzaWRlIGlzIHRvbyBzaG9ydCwgcGFkIHVudGlsIGl0IGhhcyAzIGRpZ2l0c1xuICAgICAgaWYgKGlucHV0Lmxlbmd0aCA9PSAyICYmIHJocy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIFBhZCB3aXRoIHJpZ2h0LWhhbmQgc2lkZSBpZiBwb3NzaWJsZVxuICAgICAgICBpZiAocmhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBpbnB1dCA9IGlucHV0ICsgXCIuXCIgKyByaHMuY2hhckF0KDApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFBhZCB3aXRoIHplcm9lcyBpZiB5b3UgbXVzdFxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpbnB1dCArPSBcIjBcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaW5wdXQubGVuZ3RoID09IDEgJiYgcmhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaW5wdXQgPSBpbnB1dCArIFwiLlwiICsgcmhzLmNoYXJBdCgwKTtcbiAgICAgICAgLy8gUGFkIHdpdGggcmlnaHQtaGFuZCBzaWRlIGlmIHBvc3NpYmxlXG4gICAgICAgIGlmKHJocy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgaW5wdXQgKz0gcmhzLmNoYXJBdCgxKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBQYWQgd2l0aCB6ZXJvZXMgaWYgeW91IG11c3RcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaW5wdXQgKz0gXCIwXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIG51bU51bWVyYWxzID0gaW5wdXQubGVuZ3RoO1xuICAgIC8vIGlmIGl0IGhhcyBhIHBlcmlvZCwgdGhlbiBudW1OdW1lcmFscyBpcyAxIHNtYWxsZXIgdGhhbiB0aGUgc3RyaW5nIGxlbmd0aDpcbiAgICBpZiAoaW5wdXQuc3BsaXQoXCIuXCIpLmxlbmd0aCA+IDEpIHtcbiAgICAgIG51bU51bWVyYWxzLS07XG4gICAgfVxuICAgIGlmKG51bU51bWVyYWxzIDw9IDMpIHtcbiAgICAgIHJldHVybiBTdHJpbmcoaW5wdXQpICsgc3VmZml4ZXNbaXRlcmF0aW9uXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcmVjdXJzZShOdW1iZXIoaW5wdXQpIC8gMTAwMCwgaXRlcmF0aW9uICsgMSk7XG4gICAgfVxuICB9XG59O1xuIiwiOyhmdW5jdGlvbiAoZikge1xuICAvLyBSZXF1aXJlSlNcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFwia2VlblwiLCBbXSwgZnVuY3Rpb24oKXsgcmV0dXJuIGYoKTsgfSk7XG4gIH1cbiAgLy8gQ29tbW9uSlNcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGYoKTtcbiAgfVxuICAvLyBHbG9iYWxcbiAgdmFyIGcgPSBudWxsO1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGcgPSB3aW5kb3c7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGcgPSBnbG9iYWw7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBnID0gc2VsZjtcbiAgfVxuICBpZiAoZykge1xuICAgIGcuS2VlbiA9IGYoKTtcbiAgfVxufSkoZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBLZWVuID0gcmVxdWlyZShcIi4vY29yZVwiKSxcbiAgICAgIGV4dGVuZCA9IHJlcXVpcmUoXCIuL2NvcmUvdXRpbHMvZXh0ZW5kXCIpO1xuXG4gIGV4dGVuZChLZWVuLnByb3RvdHlwZSwge1xuICAgIFwiYWRkRXZlbnRcIiAgICAgICAgICAgIDogcmVxdWlyZShcIi4vY29yZS9saWIvYWRkRXZlbnRcIiksXG4gICAgXCJhZGRFdmVudHNcIiAgICAgICAgICAgOiByZXF1aXJlKFwiLi9jb3JlL2xpYi9hZGRFdmVudHNcIiksXG4gICAgXCJzZXRHbG9iYWxQcm9wZXJ0aWVzXCIgOiByZXF1aXJlKFwiLi9jb3JlL2xpYi9zZXRHbG9iYWxQcm9wZXJ0aWVzXCIpLFxuICAgIFwidHJhY2tFeHRlcm5hbExpbmtcIiAgIDogcmVxdWlyZShcIi4vY29yZS9saWIvdHJhY2tFeHRlcm5hbExpbmtcIiksXG4gICAgXCJnZXRcIiAgICAgICAgICAgICAgICAgOiByZXF1aXJlKFwiLi9jb3JlL2xpYi9nZXRcIiksXG4gICAgXCJwb3N0XCIgICAgICAgICAgICAgICAgOiByZXF1aXJlKFwiLi9jb3JlL2xpYi9wb3N0XCIpLFxuICAgIFwicHV0XCIgICAgICAgICAgICAgICAgIDogcmVxdWlyZShcIi4vY29yZS9saWIvcG9zdFwiKSxcbiAgICBcInJ1blwiICAgICAgICAgICAgICAgICA6IHJlcXVpcmUoXCIuL2NvcmUvbGliL3J1blwiKSxcbiAgICBcImRyYXdcIiAgICAgICAgICAgICAgICA6IHJlcXVpcmUoXCIuL2RhdGF2aXovZXh0ZW5zaW9ucy9kcmF3XCIpXG4gIH0pO1xuXG4gIEtlZW4uUXVlcnkgPSByZXF1aXJlKFwiLi9jb3JlL3F1ZXJ5XCIpO1xuICBLZWVuLlJlcXVlc3QgPSByZXF1aXJlKFwiLi9jb3JlL3JlcXVlc3RcIik7XG4gIEtlZW4uRGF0YXNldCA9IHJlcXVpcmUoXCIuL2RhdGFzZXRcIik7XG4gIEtlZW4uRGF0YXZpeiA9IHJlcXVpcmUoXCIuL2RhdGF2aXpcIik7XG5cbiAgS2Vlbi5CYXNlNjQgPSByZXF1aXJlKFwiLi9jb3JlL3V0aWxzL2Jhc2U2NFwiKTtcbiAgS2Vlbi5TcGlubmVyID0gcmVxdWlyZShcInNwaW4uanNcIik7XG5cbiAgS2Vlbi51dGlscyA9IHtcbiAgICBcImRvbXJlYWR5XCIgICAgIDogcmVxdWlyZShcImRvbXJlYWR5XCIpLFxuICAgIFwiZWFjaFwiICAgICAgICAgOiByZXF1aXJlKFwiLi9jb3JlL3V0aWxzL2VhY2hcIiksXG4gICAgXCJleHRlbmRcIiAgICAgICA6IGV4dGVuZCxcbiAgICBcInBhcnNlUGFyYW1zXCIgIDogcmVxdWlyZShcIi4vY29yZS91dGlscy9wYXJzZVBhcmFtc1wiKSxcbiAgICBcInByZXR0eU51bWJlclwiIDogcmVxdWlyZShcIi4vZGF0YXZpei91dGlscy9wcmV0dHlOdW1iZXJcIilcbiAgICAvLyBcImxvYWRTY3JpcHRcIiAgIDogcmVxdWlyZShcIi4vZGF0YXZpei91dGlscy9sb2FkU2NyaXB0XCIpLFxuICAgIC8vIFwibG9hZFN0eWxlXCIgICAgOiByZXF1aXJlKFwiLi9kYXRhdml6L3V0aWxzL2xvYWRTdHlsZVwiKVxuICB9O1xuXG4gIHJlcXVpcmUoXCIuL2RhdGF2aXovYWRhcHRlcnMva2Vlbi1pb1wiKSgpO1xuICByZXF1aXJlKFwiLi9kYXRhdml6L2FkYXB0ZXJzL2dvb2dsZVwiKSgpO1xuICByZXF1aXJlKFwiLi9kYXRhdml6L2FkYXB0ZXJzL2MzXCIpKCk7XG4gIHJlcXVpcmUoXCIuL2RhdGF2aXovYWRhcHRlcnMvY2hhcnRqc1wiKSgpO1xuXG4gIGlmIChLZWVuLmxvYWRlZCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIEtlZW4udXRpbHMuZG9tcmVhZHkoZnVuY3Rpb24oKXtcbiAgICAgICAgS2Vlbi5lbWl0KFwicmVhZHlcIik7XG4gICAgICB9KTtcbiAgICB9LCAwKTtcbiAgfVxuICByZXF1aXJlKFwiLi9jb3JlL2FzeW5jXCIpKCk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBLZWVuO1xuICByZXR1cm4gS2Vlbjtcbn0pO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNCBJQk0gQ29ycC4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgJ0xpY2Vuc2UnKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gJ0FTIElTJyBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG4vKipcbiAqIENhcHR1cmVzIG1pY3JvcGhvbmUgaW5wdXQgZnJvbSB0aGUgYnJvd3Nlci5cbiAqIFdvcmtzIGF0IGxlYXN0IG9uIGxhdGVzdCB2ZXJzaW9ucyBvZiBGaXJlZm94IGFuZCBDaHJvbWVcbiAqL1xuZnVuY3Rpb24gTWljcm9waG9uZShfb3B0aW9ucykge1xuICB2YXIgb3B0aW9ucyA9IF9vcHRpb25zIHx8IHt9O1xuXG4gIC8vIHdlIHJlY29yZCBpbiBtb25vIGJlY2F1c2UgdGhlIHNwZWVjaCByZWNvZ25pdGlvbiBzZXJ2aWNlXG4gIC8vIGRvZXMgbm90IHN1cHBvcnQgc3RlcmVvLlxuICB0aGlzLmJ1ZmZlclNpemUgPSBvcHRpb25zLmJ1ZmZlclNpemUgfHwgODE5MjtcbiAgdGhpcy5pbnB1dENoYW5uZWxzID0gb3B0aW9ucy5pbnB1dENoYW5uZWxzIHx8IDE7XG4gIHRoaXMub3V0cHV0Q2hhbm5lbHMgPSBvcHRpb25zLm91dHB1dENoYW5uZWxzIHx8IDE7XG4gIHRoaXMucmVjb3JkaW5nID0gZmFsc2U7XG4gIHRoaXMucmVxdWVzdGVkQWNjZXNzID0gZmFsc2U7XG4gIHRoaXMuc2FtcGxlUmF0ZSA9IDE2MDAwO1xuICAvLyBhdXhpbGlhciBidWZmZXIgdG8ga2VlcCB1bnVzZWQgc2FtcGxlcyAodXNlZCB3aGVuIGRvaW5nIGRvd25zYW1wbGluZylcbiAgdGhpcy5idWZmZXJVbnVzZWRTYW1wbGVzID0gbmV3IEZsb2F0MzJBcnJheSgwKTtcblxuICAvLyBDaHJvbWUgb3IgRmlyZWZveCBvciBJRSBVc2VyIG1lZGlhXG4gIGlmICghbmF2aWdhdG9yLmdldFVzZXJNZWRpYSkge1xuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8XG4gICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWE7XG4gIH1cblxufVxuXG4vKipcbiAqIENhbGxlZCB3aGVuIHRoZSB1c2VyIHJlamVjdCB0aGUgdXNlIG9mIHRoZSBtaWNocm9waG9uZVxuICogQHBhcmFtICBlcnJvciBUaGUgZXJyb3JcbiAqL1xuTWljcm9waG9uZS5wcm90b3R5cGUub25QZXJtaXNzaW9uUmVqZWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJ01pY3JvcGhvbmUub25QZXJtaXNzaW9uUmVqZWN0ZWQoKScpO1xuICB0aGlzLnJlcXVlc3RlZEFjY2VzcyA9IGZhbHNlO1xuICB0aGlzLm9uRXJyb3IoJ1Blcm1pc3Npb24gdG8gYWNjZXNzIHRoZSBtaWNyb3Bob25lIHJlamV0ZWQuJyk7XG59O1xuXG5NaWNyb3Bob25lLnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcbiAgY29uc29sZS5sb2coJ01pY3JvcGhvbmUub25FcnJvcigpOicsIGVycm9yKTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHdoZW4gdGhlIHVzZXIgYXV0aG9yaXplcyB0aGUgdXNlIG9mIHRoZSBtaWNyb3Bob25lLlxuICogQHBhcmFtICB7T2JqZWN0fSBzdHJlYW0gVGhlIFN0cmVhbSB0byBjb25uZWN0IHRvXG4gKlxuICovXG5NaWNyb3Bob25lLnByb3RvdHlwZS5vbk1lZGlhU3RyZWFtID0gIGZ1bmN0aW9uKHN0cmVhbSkge1xuICB2YXIgQXVkaW9DdHggPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG5cbiAgaWYgKCFBdWRpb0N0eClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0F1ZGlvQ29udGV4dCBub3QgYXZhaWxhYmxlJyk7XG5cbiAgaWYgKCF0aGlzLmF1ZGlvQ29udGV4dClcbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0N0eCgpO1xuXG4gIHZhciBnYWluID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICB2YXIgYXVkaW9JbnB1dCA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZU1lZGlhU3RyZWFtU291cmNlKHN0cmVhbSk7XG5cbiAgYXVkaW9JbnB1dC5jb25uZWN0KGdhaW4pO1xuXG4gIHRoaXMubWljID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKHRoaXMuYnVmZmVyU2l6ZSxcbiAgICB0aGlzLmlucHV0Q2hhbm5lbHMsIHRoaXMub3V0cHV0Q2hhbm5lbHMpO1xuXG4gIC8vIHVuY29tbWVudCB0aGUgZm9sbG93aW5nIGxpbmUgaWYgeW91IHdhbnQgdG8gdXNlIHlvdXIgbWljcm9waG9uZSBzYW1wbGUgcmF0ZVxuICAvL3RoaXMuc2FtcGxlUmF0ZSA9IHRoaXMuYXVkaW9Db250ZXh0LnNhbXBsZVJhdGU7XG4gIGNvbnNvbGUubG9nKCdNaWNyb3Bob25lLm9uTWVkaWFTdHJlYW0oKTogc2FtcGxpbmcgcmF0ZSBpczonLCB0aGlzLnNhbXBsZVJhdGUpO1xuXG4gIHRoaXMubWljLm9uYXVkaW9wcm9jZXNzID0gdGhpcy5fb25hdWRpb3Byb2Nlc3MuYmluZCh0aGlzKTtcbiAgdGhpcy5zdHJlYW0gPSBzdHJlYW07XG5cbiAgZ2Fpbi5jb25uZWN0KHRoaXMubWljKTtcbiAgdGhpcy5taWMuY29ubmVjdCh0aGlzLmF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gIHRoaXMucmVjb3JkaW5nID0gdHJ1ZTtcbiAgdGhpcy5yZXF1ZXN0ZWRBY2Nlc3MgPSBmYWxzZTtcbiAgdGhpcy5vblN0YXJ0UmVjb3JkaW5nKCk7XG59O1xuXG4vKipcbiAqIGNhbGxiYWNrIHRoYXQgaXMgYmVpbmcgdXNlZCBieSB0aGUgbWljcm9waG9uZVxuICogdG8gc2VuZCBhdWRpbyBjaHVua3MuXG4gKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgYXVkaW9cbiAqL1xuTWljcm9waG9uZS5wcm90b3R5cGUuX29uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24oZGF0YSkge1xuICBpZiAoIXRoaXMucmVjb3JkaW5nKSB7XG4gICAgLy8gV2Ugc3BlYWsgYnV0IHdlIGFyZSBub3QgcmVjb3JkaW5nXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gU2luZ2xlIGNoYW5uZWxcbiAgdmFyIGNoYW4gPSBkYXRhLmlucHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKDApOyAgXG4gIFxuICAvL3Jlc2FtcGxlcih0aGlzLmF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlLGRhdGEuaW5wdXRCdWZmZXIsdGhpcy5vbkF1ZGlvKTtcblxuICB0aGlzLm9uQXVkaW8odGhpcy5fZXhwb3J0RGF0YUJ1ZmZlclRvMTZLaHoobmV3IEZsb2F0MzJBcnJheShjaGFuKSkpO1xuXG4gIC8vZXhwb3J0IHdpdGggbWljcm9waG9uZSBtaHosIHJlbWVtYmVyIHRvIHVwZGF0ZSB0aGUgdGhpcy5zYW1wbGVSYXRlXG4gIC8vIHdpdGggdGhlIHNhbXBsZSByYXRlIGZyb20geW91ciBtaWNyb3Bob25lXG4gIC8vIHRoaXMub25BdWRpbyh0aGlzLl9leHBvcnREYXRhQnVmZmVyKG5ldyBGbG9hdDMyQXJyYXkoY2hhbikpKTtcblxufTtcblxuLyoqXG4gKiBTdGFydCB0aGUgYXVkaW8gcmVjb3JkaW5nXG4gKi9cbk1pY3JvcGhvbmUucHJvdG90eXBlLnJlY29yZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIW5hdmlnYXRvci5nZXRVc2VyTWVkaWEpe1xuICAgIHRoaXMub25FcnJvcignQnJvd3NlciBkb2VzblxcJ3Qgc3VwcG9ydCBtaWNyb3Bob25lIGlucHV0Jyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0aGlzLnJlcXVlc3RlZEFjY2Vzcykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMucmVxdWVzdGVkQWNjZXNzID0gdHJ1ZTtcbiAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSh7IGF1ZGlvOiB0cnVlIH0sXG4gICAgdGhpcy5vbk1lZGlhU3RyZWFtLmJpbmQodGhpcyksIC8vIE1pY3JvcGhvbmUgcGVybWlzc2lvbiBncmFudGVkXG4gICAgdGhpcy5vblBlcm1pc3Npb25SZWplY3RlZC5iaW5kKHRoaXMpKTsgLy8gTWljcm9waG9uZSBwZXJtaXNzaW9uIHJlamVjdGVkXG59O1xuXG4vKipcbiAqIFN0b3AgdGhlIGF1ZGlvIHJlY29yZGluZ1xuICovXG5NaWNyb3Bob25lLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5yZWNvcmRpbmcpXG4gICAgcmV0dXJuO1xuICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICB0aGlzLnN0cmVhbS5zdG9wKCk7XG4gIHRoaXMucmVxdWVzdGVkQWNjZXNzID0gZmFsc2U7XG4gIHRoaXMubWljLmRpc2Nvbm5lY3QoMCk7XG4gIHRoaXMubWljID0gbnVsbDtcbiAgdGhpcy5vblN0b3BSZWNvcmRpbmcoKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIEJsb2IgdHlwZTogJ2F1ZGlvL2wxNicgd2l0aCB0aGUgY2h1bmsgYW5kIGRvd25zYW1wbGluZyB0byAxNiBrSHpcbiAqIGNvbWluZyBmcm9tIHRoZSBtaWNyb3Bob25lLlxuICogRXhwbGFuYXRpb24gZm9yIHRoZSBtYXRoOiBUaGUgcmF3IHZhbHVlcyBjYXB0dXJlZCBmcm9tIHRoZSBXZWIgQXVkaW8gQVBJIGFyZVxuICogaW4gMzItYml0IEZsb2F0aW5nIFBvaW50LCBiZXR3ZWVuIC0xIGFuZCAxIChwZXIgdGhlIHNwZWNpZmljYXRpb24pLlxuICogVGhlIHZhbHVlcyBmb3IgMTYtYml0IFBDTSByYW5nZSBiZXR3ZWVuIC0zMjc2OCBhbmQgKzMyNzY3ICgxNi1iaXQgc2lnbmVkIGludGVnZXIpLlxuICogTXVsdGlwbHkgdG8gY29udHJvbCB0aGUgdm9sdW1lIG9mIHRoZSBvdXRwdXQuIFdlIHN0b3JlIGluIGxpdHRsZSBlbmRpYW4uXG4gKiBAcGFyYW0gIHtPYmplY3R9IGJ1ZmZlciBNaWNyb3Bob25lIGF1ZGlvIGNodW5rXG4gKiBAcmV0dXJuIHtCbG9ifSAnYXVkaW8vbDE2JyBjaHVua1xuICogQGRlcHJlY2F0ZWQgVGhpcyBtZXRob2QgaXMgZGVwcmFjYXRlZFxuICovXG5NaWNyb3Bob25lLnByb3RvdHlwZS5fZXhwb3J0RGF0YUJ1ZmZlclRvMTZLaHogPSBmdW5jdGlvbihidWZmZXJOZXdTYW1wbGVzKSB7XG4gIHZhciBidWZmZXIgPSBudWxsLFxuICAgIG5ld1NhbXBsZXMgPSBidWZmZXJOZXdTYW1wbGVzLmxlbmd0aCxcbiAgICB1bnVzZWRTYW1wbGVzID0gdGhpcy5idWZmZXJVbnVzZWRTYW1wbGVzLmxlbmd0aDsgICBcbiAgICBcblxuICBpZiAodW51c2VkU2FtcGxlcyA+IDApIHtcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHVudXNlZFNhbXBsZXMgKyBuZXdTYW1wbGVzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVudXNlZFNhbXBsZXM7ICsraSkge1xuICAgICAgYnVmZmVyW2ldID0gdGhpcy5idWZmZXJVbnVzZWRTYW1wbGVzW2ldO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgbmV3U2FtcGxlczsgKytpKSB7XG4gICAgICBidWZmZXJbdW51c2VkU2FtcGxlcyArIGldID0gYnVmZmVyTmV3U2FtcGxlc1tpXTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyID0gYnVmZmVyTmV3U2FtcGxlcztcbiAgfVxuXG4gIC8vIGRvd25zYW1wbGluZyB2YXJpYWJsZXNcbiAgdmFyIGZpbHRlciA9IFtcbiAgICAgIC0wLjAzNzkzNSwgLTAuMDAwODkwMjQsIDAuMDQwMTczLCAwLjAxOTk4OSwgMC4wMDQ3NzkyLCAtMC4wNTg2NzUsIC0wLjA1NjQ4NyxcbiAgICAgIC0wLjAwNDA2NTMsIDAuMTQ1MjcsIDAuMjY5MjcsIDAuMzM5MTMsIDAuMjY5MjcsIDAuMTQ1MjcsIC0wLjAwNDA2NTMsIC0wLjA1NjQ4NyxcbiAgICAgIC0wLjA1ODY3NSwgMC4wMDQ3NzkyLCAwLjAxOTk4OSwgMC4wNDAxNzMsIC0wLjAwMDg5MDI0LCAtMC4wMzc5MzVcbiAgICBdLFxuICAgIHNhbXBsaW5nUmF0ZVJhdGlvID0gdGhpcy5hdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSAvIDE2MDAwLFxuICAgIG5PdXRwdXRTYW1wbGVzID0gTWF0aC5mbG9vcigoYnVmZmVyLmxlbmd0aCAtIGZpbHRlci5sZW5ndGgpIC8gKHNhbXBsaW5nUmF0ZVJhdGlvKSkgKyAxLFxuICAgIHBjbUVuY29kZWRCdWZmZXIxNmsgPSBuZXcgQXJyYXlCdWZmZXIobk91dHB1dFNhbXBsZXMgKiAyKSxcbiAgICBkYXRhVmlldzE2ayA9IG5ldyBEYXRhVmlldyhwY21FbmNvZGVkQnVmZmVyMTZrKSxcbiAgICBpbmRleCA9IDAsXG4gICAgdm9sdW1lID0gMHg3RkZGLCAvL3JhbmdlIGZyb20gMCB0byAweDdGRkYgdG8gY29udHJvbCB0aGUgdm9sdW1lXG4gICAgbk91dCA9IDA7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgKyBmaWx0ZXIubGVuZ3RoIC0gMSA8IGJ1ZmZlci5sZW5ndGg7IGkgPSBNYXRoLnJvdW5kKHNhbXBsaW5nUmF0ZVJhdGlvICogbk91dCkpIHtcbiAgICB2YXIgc2FtcGxlID0gMDtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGZpbHRlci5sZW5ndGg7ICsraikge1xuICAgICAgc2FtcGxlICs9IGJ1ZmZlcltpICsgal0gKiBmaWx0ZXJbal07XG4gICAgfVxuICAgIHNhbXBsZSAqPSB2b2x1bWU7XG4gICAgZGF0YVZpZXcxNmsuc2V0SW50MTYoaW5kZXgsIHNhbXBsZSwgdHJ1ZSk7IC8vICd0cnVlJyAtPiBtZWFucyBsaXR0bGUgZW5kaWFuXG4gICAgaW5kZXggKz0gMjtcbiAgICBuT3V0Kys7XG4gIH1cblxuICB2YXIgaW5kZXhTYW1wbGVBZnRlckxhc3RVc2VkID0gTWF0aC5yb3VuZChzYW1wbGluZ1JhdGVSYXRpbyAqIG5PdXQpO1xuICB2YXIgcmVtYWluaW5nID0gYnVmZmVyLmxlbmd0aCAtIGluZGV4U2FtcGxlQWZ0ZXJMYXN0VXNlZDtcbiAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICB0aGlzLmJ1ZmZlclVudXNlZFNhbXBsZXMgPSBuZXcgRmxvYXQzMkFycmF5KHJlbWFpbmluZyk7XG4gICAgZm9yIChpID0gMDsgaSA8IHJlbWFpbmluZzsgKytpKSB7XG4gICAgICB0aGlzLmJ1ZmZlclVudXNlZFNhbXBsZXNbaV0gPSBidWZmZXJbaW5kZXhTYW1wbGVBZnRlckxhc3RVc2VkICsgaV07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuYnVmZmVyVW51c2VkU2FtcGxlcyA9IG5ldyBGbG9hdDMyQXJyYXkoMCk7XG4gIH1cblxuICByZXR1cm4gbmV3IEJsb2IoW2RhdGFWaWV3MTZrXSwge1xuICAgIHR5cGU6ICdhdWRpby9sMTYnXG4gIH0pO1xuICB9O1xuXG4gIFxuICBcbi8vIG5hdGl2ZSB3YXkgb2YgcmVzYW1wbGluZyBjYXB0dXJlZCBhdWRpb1xudmFyIHJlc2FtcGxlciA9IGZ1bmN0aW9uKHNhbXBsZVJhdGUsIGF1ZGlvQnVmZmVyLCBjYWxsYmFja1Byb2Nlc3NBdWRpbykge1xuXHRcblx0Y29uc29sZS5sb2coXCJsZW5ndGg6IFwiICsgYXVkaW9CdWZmZXIubGVuZ3RoICsgXCIgXCIgKyBzYW1wbGVSYXRlKTtcblx0dmFyIGNoYW5uZWxzID0gMTsgXG5cdHZhciB0YXJnZXRTYW1wbGVSYXRlID0gMTYwMDA7XG4gICB2YXIgbnVtU2FtcGxlc1RhcmdldCA9IGF1ZGlvQnVmZmVyLmxlbmd0aCAqIHRhcmdldFNhbXBsZVJhdGUgLyBzYW1wbGVSYXRlO1xuXG4gICB2YXIgb2ZmbGluZUNvbnRleHQgPSBuZXcgT2ZmbGluZUF1ZGlvQ29udGV4dChjaGFubmVscywgbnVtU2FtcGxlc1RhcmdldCwgdGFyZ2V0U2FtcGxlUmF0ZSk7XG4gICB2YXIgYnVmZmVyU291cmNlID0gb2ZmbGluZUNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICBidWZmZXJTb3VyY2UuYnVmZmVyID0gYXVkaW9CdWZmZXI7XG5cblx0Ly8gY2FsbGJhY2sgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgcmVzYW1wbGluZyBmaW5pc2hlc1xuICAgb2ZmbGluZUNvbnRleHQub25jb21wbGV0ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7ICAgXHRcbiAgICAgIHZhciBzYW1wbGVzVGFyZ2V0ID0gZXZlbnQucmVuZGVyZWRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBjb25zb2xlLmxvZygnRG9uZSByZXNhbXBsaW5nOiAnICsgc2FtcGxlc1RhcmdldC5sZW5ndGggKyBcIiBzYW1wbGVzIHByb2R1Y2VkXCIpOyAgXG5cblx0XHQvLyBjb252ZXJ0IGZyb20gWy0xLDFdIHJhbmdlIG9mIGZsb2F0aW5nIHBvaW50IG51bWJlcnMgdG8gWy0zMjc2NywzMjc2N10gcmFuZ2Ugb2YgaW50ZWdlcnNcblx0XHR2YXIgaW5kZXggPSAwO1xuXHRcdHZhciB2b2x1bWUgPSAweDdGRkY7XG4gIFx0XHR2YXIgcGNtRW5jb2RlZEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzYW1wbGVzVGFyZ2V0Lmxlbmd0aCoyKTsgICAgLy8gc2hvcnQgaW50ZWdlciB0byBieXRlXG4gIFx0XHR2YXIgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcocGNtRW5jb2RlZEJ1ZmZlcik7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNhbXBsZXNUYXJnZXQubGVuZ3RoOyBpKyspIHtcbiAgICBcdFx0ZGF0YVZpZXcuc2V0SW50MTYoaW5kZXgsIHNhbXBsZXNUYXJnZXRbaV0qdm9sdW1lLCB0cnVlKTtcbiAgICBcdFx0aW5kZXggKz0gMjtcbiAgXHRcdH1cblxuICAgICAgLy8gbDE2IGlzIHRoZSBNSU1FIHR5cGUgZm9yIDE2LWJpdCBQQ01cbiAgICAgIGNhbGxiYWNrUHJvY2Vzc0F1ZGlvKG5ldyBCbG9iKFtkYXRhVmlld10sIHsgdHlwZTogJ2F1ZGlvL2wxNicgfSkpOyAgICAgICAgIFxuICAgfTtcblxuICAgYnVmZmVyU291cmNlLmNvbm5lY3Qob2ZmbGluZUNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgYnVmZmVyU291cmNlLnN0YXJ0KDApO1xuICAgb2ZmbGluZUNvbnRleHQuc3RhcnRSZW5kZXJpbmcoKTsgICBcbn07XG4gXG4gIFxuXG4vKipcbiAqIENyZWF0ZXMgYSBCbG9iIHR5cGU6ICdhdWRpby9sMTYnIHdpdGggdGhlXG4gKiBjaHVuayBjb21pbmcgZnJvbSB0aGUgbWljcm9waG9uZS5cbiAqL1xudmFyIGV4cG9ydERhdGFCdWZmZXIgPSBmdW5jdGlvbihidWZmZXIsIGJ1ZmZlclNpemUpIHtcbiAgdmFyIHBjbUVuY29kZWRCdWZmZXIgPSBudWxsLFxuICAgIGRhdGFWaWV3ID0gbnVsbCxcbiAgICBpbmRleCA9IDAsXG4gICAgdm9sdW1lID0gMHg3RkZGOyAvL3JhbmdlIGZyb20gMCB0byAweDdGRkYgdG8gY29udHJvbCB0aGUgdm9sdW1lXG5cbiAgcGNtRW5jb2RlZEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJTaXplICogMik7XG4gIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KHBjbUVuY29kZWRCdWZmZXIpO1xuXG4gIC8qIEV4cGxhbmF0aW9uIGZvciB0aGUgbWF0aDogVGhlIHJhdyB2YWx1ZXMgY2FwdHVyZWQgZnJvbSB0aGUgV2ViIEF1ZGlvIEFQSSBhcmVcbiAgICogaW4gMzItYml0IEZsb2F0aW5nIFBvaW50LCBiZXR3ZWVuIC0xIGFuZCAxIChwZXIgdGhlIHNwZWNpZmljYXRpb24pLlxuICAgKiBUaGUgdmFsdWVzIGZvciAxNi1iaXQgUENNIHJhbmdlIGJldHdlZW4gLTMyNzY4IGFuZCArMzI3NjcgKDE2LWJpdCBzaWduZWQgaW50ZWdlcikuXG4gICAqIE11bHRpcGx5IHRvIGNvbnRyb2wgdGhlIHZvbHVtZSBvZiB0aGUgb3V0cHV0LiBXZSBzdG9yZSBpbiBsaXR0bGUgZW5kaWFuLlxuICAgKi9cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICBkYXRhVmlldy5zZXRJbnQxNihpbmRleCwgYnVmZmVyW2ldICogdm9sdW1lLCB0cnVlKTtcbiAgICBpbmRleCArPSAyO1xuICB9XG5cbiAgLy8gbDE2IGlzIHRoZSBNSU1FIHR5cGUgZm9yIDE2LWJpdCBQQ01cbiAgcmV0dXJuIG5ldyBCbG9iKFtkYXRhVmlld10sIHsgdHlwZTogJ2F1ZGlvL2wxNicgfSk7XG59O1xuXG5NaWNyb3Bob25lLnByb3RvdHlwZS5fZXhwb3J0RGF0YUJ1ZmZlciA9IGZ1bmN0aW9uKGJ1ZmZlcil7XG4gIHV0aWxzLmV4cG9ydERhdGFCdWZmZXIoYnVmZmVyLCB0aGlzLmJ1ZmZlclNpemUpO1xufTsgXG5cblxuLy8gRnVuY3Rpb25zIHVzZWQgdG8gY29udHJvbCBNaWNyb3Bob25lIGV2ZW50cyBsaXN0ZW5lcnMuXG5NaWNyb3Bob25lLnByb3RvdHlwZS5vblN0YXJ0UmVjb3JkaW5nID0gIGZ1bmN0aW9uKCkge307XG5NaWNyb3Bob25lLnByb3RvdHlwZS5vblN0b3BSZWNvcmRpbmcgPSAgZnVuY3Rpb24oKSB7fTtcbk1pY3JvcGhvbmUucHJvdG90eXBlLm9uQXVkaW8gPSAgZnVuY3Rpb24oKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBNaWNyb3Bob25lO1xuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gICBcIm1vZGVsc1wiOiBbXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL2VuLVVTX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDE2MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcImVuLVVTX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcImVuLVVTXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlVTIEVuZ2xpc2ggYnJvYWRiYW5kIG1vZGVsICgxNktIeilcIlxuICAgICAgfSwgXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL2VuLVVTX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiA4MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcImVuLVVTX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJlbi1VU1wiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJVUyBFbmdsaXNoIG5hcnJvd2JhbmQgbW9kZWwgKDhLSHopXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL2VzLUVTX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDE2MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcImVzLUVTX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcImVzLUVTXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNwYW5pc2ggYnJvYWRiYW5kIG1vZGVsICgxNktIeilcIlxuICAgICAgfSwgXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL2VzLUVTX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiA4MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcImVzLUVTX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJlcy1FU1wiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTcGFuaXNoIG5hcnJvd2JhbmQgbW9kZWwgKDhLSHopXCJcbiAgICAgIH0sIFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9qYS1KUF9Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiAxNjAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJqYS1KUF9Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJqYS1KUFwiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJKYXBhbmVzZSBicm9hZGJhbmQgbW9kZWwgKDE2S0h6KVwiXG4gICAgICB9LCBcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvamEtSlBfTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDgwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwiamEtSlBfTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcImphLUpQXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkphcGFuZXNlIG5hcnJvd2JhbmQgbW9kZWwgKDhLSHopXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL3B0LUJSX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDE2MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcInB0LUJSX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcInB0LUJSXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkJyYXppbGlhbiBQb3J0dWd1ZXNlIGJyb2FkYmFuZCBtb2RlbCAoMTZLSHopXCJcbiAgICAgIH0sIFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9wdC1CUl9OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogODAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJwdC1CUl9OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwicHQtQlJcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQnJhemlsaWFuIFBvcnR1Z3Vlc2UgbmFycm93YmFuZCBtb2RlbCAoOEtIeilcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvemgtQ05fQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogMTYwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwiemgtQ05fQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiemgtQ05cIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWFuZGFyaW4gYnJvYWRiYW5kIG1vZGVsICgxNktIeilcIlxuICAgICAgfSwgICAgIFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy96aC1DTl9OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogODAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJ6aC1DTl9OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiemgtQ05cIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWFuZGFyaW4gbmFycm93YmFuZCBtb2RlbCAoOEtIeilcIlxuICAgICAgfSAgICAgIFxuICAgXVxufVxuIiwiXG52YXIgZWZmZWN0cyA9IHJlcXVpcmUoJy4vdmlld3MvZWZmZWN0cycpO1xudmFyIGRpc3BsYXkgPSByZXF1aXJlKCcuL3ZpZXdzL2Rpc3BsYXltZXRhZGF0YScpO1xudmFyIGhpZGVFcnJvciA9IHJlcXVpcmUoJy4vdmlld3Mvc2hvd2Vycm9yJykuaGlkZUVycm9yO1xudmFyIGluaXRTb2NrZXQgPSByZXF1aXJlKCcuL3NvY2tldCcpLmluaXRTb2NrZXQ7XG5cbmV4cG9ydHMuaGFuZGxlRmlsZVVwbG9hZCA9IGZ1bmN0aW9uKHRva2VuLCBtb2RlbCwgZmlsZSwgY29udGVudFR5cGUsIGNhbGxiYWNrLCBvbmVuZCkge1xuXG4gICAgLy8gU2V0IGN1cnJlbnRseURpc3BsYXlpbmcgdG8gcHJldmVudCBvdGhlciBzb2NrZXRzIGZyb20gb3BlbmluZ1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgdHJ1ZSk7XG5cbiAgICAvLyAkKCcjcHJvZ3Jlc3NJbmRpY2F0b3InKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuXG4gICAgJC5zdWJzY3JpYmUoJ3Byb2dyZXNzJywgZnVuY3Rpb24oZXZ0LCBkYXRhKSB7XG4gICAgICBjb25zb2xlLmxvZygncHJvZ3Jlc3M6ICcsIGRhdGEpO1xuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ2NvbnRlbnRUeXBlJywgY29udGVudFR5cGUpO1xuXG4gICAgdmFyIGJhc2VTdHJpbmcgPSAnJztcbiAgICB2YXIgYmFzZUpTT04gPSAnJztcblxuICAgICQuc3Vic2NyaWJlKCdzaG93anNvbicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciAkcmVzdWx0c0pTT04gPSAkKCcjcmVzdWx0c0pTT04nKVxuICAgICAgJHJlc3VsdHNKU09OLmVtcHR5KCk7XG4gICAgICAkcmVzdWx0c0pTT04uYXBwZW5kKGJhc2VKU09OKTtcbiAgICB9KTtcblxuICAgIHZhciBvcHRpb25zID0ge307XG4gICAgb3B0aW9ucy50b2tlbiA9IHRva2VuO1xuICAgIG9wdGlvbnMubWVzc2FnZSA9IHtcbiAgICAgICdhY3Rpb24nOiAnc3RhcnQnLFxuICAgICAgJ2NvbnRlbnQtdHlwZSc6IGNvbnRlbnRUeXBlLFxuICAgICAgJ2ludGVyaW1fcmVzdWx0cyc6IHRydWUsXG4gICAgICAnY29udGludW91cyc6IHRydWUsXG4gICAgICAnd29yZF9jb25maWRlbmNlJzogdHJ1ZSxcbiAgICAgICd0aW1lc3RhbXBzJzogdHJ1ZSxcbiAgICAgICdtYXhfYWx0ZXJuYXRpdmVzJzogMyxcbiAgICAgICdpbmFjdGl2aXR5X3RpbWVvdXQnOiA2MDBcbiAgICB9O1xuICAgIG9wdGlvbnMubW9kZWwgPSBtb2RlbDtcblxuICAgIGZ1bmN0aW9uIG9uT3Blbihzb2NrZXQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdTb2NrZXQgb3BlbmVkJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25MaXN0ZW5pbmcoc29ja2V0KSB7XG4gICAgICBjb25zb2xlLmxvZygnU29ja2V0IGxpc3RlbmluZycpO1xuICAgICAgY2FsbGJhY2soc29ja2V0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbk1lc3NhZ2UobXNnKSB7XG4gICAgICBpZiAobXNnLnJlc3VsdHMpIHtcbiAgICAgICAgLy8gQ29udmVydCB0byBjbG9zdXJlIGFwcHJvYWNoXG4gICAgICAgIGJhc2VTdHJpbmcgPSBkaXNwbGF5LnNob3dSZXN1bHQobXNnLCBiYXNlU3RyaW5nLCBtb2RlbCk7XG4gICAgICAgIGJhc2VKU09OID0gZGlzcGxheS5zaG93SlNPTihtc2csIGJhc2VKU09OKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkVycm9yKGV2dCkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCBmYWxzZSk7XG4gICAgICBvbmVuZChldnQpO1xuICAgICAgY29uc29sZS5sb2coJ1NvY2tldCBlcnI6ICcsIGV2dC5jb2RlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkNsb3NlKGV2dCkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCBmYWxzZSk7XG4gICAgICBvbmVuZChldnQpO1xuICAgICAgY29uc29sZS5sb2coJ1NvY2tldCBjbG9zaW5nOiAnLCBldnQpO1xuICAgIH1cblxuICAgIGluaXRTb2NrZXQob3B0aW9ucywgb25PcGVuLCBvbkxpc3RlbmluZywgb25NZXNzYWdlLCBvbkVycm9yLCBvbkNsb3NlKTtcbn1cblxuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpbml0U29ja2V0ID0gcmVxdWlyZSgnLi9zb2NrZXQnKS5pbml0U29ja2V0O1xudmFyIGRpc3BsYXkgPSByZXF1aXJlKCcuL3ZpZXdzL2Rpc3BsYXltZXRhZGF0YScpO1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIGtlZW5DbGllbnQgPSByZXF1aXJlKCcuL2tlZW4nKS5jbGllbnQ7XG5cbmV4cG9ydHMuaGFuZGxlTWljcm9waG9uZSA9IGZ1bmN0aW9uKHRva2VuLCBtb2RlbCwgbWljLCBjYWxsYmFjaykge1xuXG4gIGlmIChtb2RlbC5pbmRleE9mKCdOYXJyb3diYW5kJykgPiAtMSkge1xuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ01pY3JvcGhvbmUgdHJhbnNjcmlwdGlvbiBjYW5ub3QgYWNjb21vZGF0ZSBuYXJyb3diYW5kIG1vZGVscywgcGxlYXNlIHNlbGVjdCBhbm90aGVyJyk7XG4gICAgY2FsbGJhY2soZXJyLCBudWxsKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgJC5wdWJsaXNoKCdjbGVhcnNjcmVlbicpO1xuXG4gIC8vIFRlc3Qgb3V0IHdlYnNvY2tldFxuICB2YXIgYmFzZVN0cmluZyA9ICcnO1xuICB2YXIgYmFzZUpTT04gPSAnJztcblxuICAkLnN1YnNjcmliZSgnc2hvd2pzb24nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyICRyZXN1bHRzSlNPTiA9ICQoJyNyZXN1bHRzSlNPTicpXG4gICAgJHJlc3VsdHNKU09OLmVtcHR5KCk7XG4gICAgJHJlc3VsdHNKU09OLmFwcGVuZChiYXNlSlNPTik7XG4gIH0pO1xuXG4gIHZhciBvcHRpb25zID0ge307XG4gIG9wdGlvbnMudG9rZW4gPSB0b2tlbjtcbiAgb3B0aW9ucy5tZXNzYWdlID0ge1xuICAgICdhY3Rpb24nOiAnc3RhcnQnLFxuICAgICdjb250ZW50LXR5cGUnOiAnYXVkaW8vbDE2O3JhdGU9MTYwMDAnLFxuICAgICdpbnRlcmltX3Jlc3VsdHMnOiB0cnVlLFxuICAgICdjb250aW51b3VzJzogdHJ1ZSxcbiAgICAnd29yZF9jb25maWRlbmNlJzogdHJ1ZSxcbiAgICAndGltZXN0YW1wcyc6IHRydWUsXG4gICAgJ21heF9hbHRlcm5hdGl2ZXMnOiAzLFxuICAgICdpbmFjdGl2aXR5X3RpbWVvdXQnOiA2MDAgICAgXG4gIH07XG4gIG9wdGlvbnMubW9kZWwgPSBtb2RlbDtcblxuICBmdW5jdGlvbiBvbk9wZW4oc29ja2V0KSB7XG4gICAgY29uc29sZS5sb2coJ01pYyBzb2NrZXQ6IG9wZW5lZCcpO1xuICAgIGNhbGxiYWNrKG51bGwsIHNvY2tldCk7XG4gIH1cblxuICBmdW5jdGlvbiBvbkxpc3RlbmluZyhzb2NrZXQpIHtcblxuICAgIG1pYy5vbkF1ZGlvID0gZnVuY3Rpb24oYmxvYikge1xuICAgICAgaWYgKHNvY2tldC5yZWFkeVN0YXRlIDwgMikge1xuICAgICAgICBzb2NrZXQuc2VuZChibG9iKVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICB2YXIgc3BlZWNoID0ge307XG4gIHNwZWVjaC50cmFuc2NyaXB0ID0gJyc7XG4gIHNwZWVjaC53b3JkcyA9IFtdO1xuICBmdW5jdGlvbiBvbk1lc3NhZ2UobXNnLCBzb2NrZXQpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnTWljIHNvY2tldCBtc2c6ICcsIG1zZyk7XG4gICAgaWYgKG1zZy5yZXN1bHRzKSB7XG4gICAgICBpZiAobXNnLnJlc3VsdHMgJiYgbXNnLnJlc3VsdHNbMF0gJiYgbXNnLnJlc3VsdHNbMF0uZmluYWwpIHtcbiAgICAgICAgdmFyIGZpbmFsX21lc3NhZ2UgPSBtc2cucmVzdWx0c1swXS5hbHRlcm5hdGl2ZXNbMF07XG4gICAgICAgIHNwZWVjaC50cmFuc2NyaXB0ICs9IGZpbmFsX21lc3NhZ2UudHJhbnNjcmlwdDtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGZpbmFsX21lc3NhZ2Uud29yZF9jb25maWRlbmNlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgdmFyIG5leHRfd29yZCA9IHt9O1xuICAgICAgICAgIG5leHRfd29yZC50ZXh0ID0gZmluYWxfbWVzc2FnZS53b3JkX2NvbmZpZGVuY2VbaV1bMF07XG4gICAgICAgICAgbmV4dF93b3JkLmNvbmZpZGVuY2UgPSBmaW5hbF9tZXNzYWdlLndvcmRfY29uZmlkZW5jZVtpXVsxXTtcbiAgICAgICAgICB2YXIgYmVnaW5fdGltZSA9IGZpbmFsX21lc3NhZ2UudGltZXN0YW1wc1tpXVsxXTtcbiAgICAgICAgICB2YXIgZW5kX3RpbWUgPSBmaW5hbF9tZXNzYWdlLnRpbWVzdGFtcHNbaV1bMl07XG4gICAgICAgICAgbmV4dF93b3JkLnRpbWUgPSBiZWdpbl90aW1lO1xuICAgICAgICAgIG5leHRfd29yZC5kdXJhdGlvbiA9IGVuZF90aW1lIC0gYmVnaW5fdGltZTtcbiAgICAgICAgICBzcGVlY2gud29yZHMucHVzaChuZXh0X3dvcmQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdGhpcyAtLSBpdCBqdXN0IHVwZGF0ZXMgdGhlIERPTSB3aXRoIHRoZSBpbmNvbWluZyBtZXNzYWdlXG4gICAgICAgIC8vIGJhc2VTdHJpbmcgPSBkaXNwbGF5LnNob3dSZXN1bHQobXNnLCBiYXNlU3RyaW5nLCBtb2RlbCk7XG4gICAgICAgIC8vIGJhc2VKU09OID0gZGlzcGxheS5zaG93SlNPTihtc2csIGJhc2VKU09OKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbkVycm9yKHIsIHNvY2tldCkge1xuICAgIGNvbnNvbGUubG9nKCdNaWMgc29ja2V0IGVycjogJywgZXJyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlbmRXb3Jkc1RvS2Vlbih3b3Jkcykge1xuICAgIGlmICghd29yZHMgfHwgd29yZHMubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc3BlZWNoX2lkID0gd29yZHNbMF0uc3BlZWNoX2lkO1xuICAgIHZhciBtdWx0aXBsZUV2ZW50cyA9IHtcbiAgICAgIFwid29yZHNcIjogd29yZHNcbiAgICB9O1xuXG4gICAga2VlbkNsaWVudC5hZGRFdmVudHMobXVsdGlwbGVFdmVudHMsIGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2VycicsIGVycik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gbmV3IEtlZW4uUXVlcnkoXCJjb3VudFwiLCB7XG4gICAgICAgICAgZXZlbnRDb2xsZWN0aW9uOiBcIndvcmRzXCIsXG4gICAgICAgICAgLy8gZmlsdGVyczogW3tcIm9wZXJhdG9yXCI6XCJlcVwiLFwicHJvcGVydHlfbmFtZVwiOlwic3BlZWNoX2lkXCIsXCJwcm9wZXJ0eV92YWx1ZVwiOnNwZWVjaF9pZH1dLFxuICAgICAgICAgIGdyb3VwQnk6IFwidGV4dFwiLFxuICAgICAgICAgIHRpbWVmcmFtZTogXCJ0aGlzXzE0X2RheXNcIixcbiAgICAgICAgICB0aW1lem9uZTogXCJVVENcIlxuICAgICAgICB9KTtcblxuICAgICAgICBrZWVuQ2xpZW50LmRyYXcocXVlcnksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdncmlkLTEtMScpLCB7XG4gICAgICAgICAgLy8gQ3VzdG9tIGNvbmZpZ3VyYXRpb24gaGVyZVxuICAgICAgICB9KTtcblxuICAgICAgICAkKCcjY2hhcnQtY29udGFpbmVyJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8gdmFyIGFwaV9rZXkgPSAnMmZjNzYwNjhlYTM5NTYyYTVlM2M4ZjNhZTVjMTBhMDU4OGJmMDc0MjQ2ODYxYjM2ZmExNzE1MGJkMjFkZDAxMTQwYWMwNTFiMmJhZTRhZTExNThlMjE3ODU3YmFmNzMxMTIxMjBkNGY5MGE3MmI1NmU0YzFjOTdkM2Y0YjBlMjQ4YjkwNTQyN2NmZTgxODI1NTJiYWMzYjkxYWU3MmQ3ZDA2MmFiMjA0MTI2ODFhYzM5ODQ0OTE4YTRjYTJkMDBjNDA3NWFlMDQ4MDMwZmU4ZmM5NTIxMjc3NDAxMGRiNjUnO1xuICAgIC8vIHZhciBrZWVuX3VybCA9ICdodHRwczovL2FwaS5rZWVuLmlvLzMuMC9wcm9qZWN0cy81NjA2ZjNmNDkwZTRiZDdiMGUwZTFkZGMvZXZlbnRzL3dvcmRzJztcbiAgICAvLyAkLmFqYXgoe1xuICAgIC8vICAgdXJsOiBrZWVuX3VybCxcbiAgICAvLyAgIHR5cGU6ICdwb3N0JyxcbiAgICAvLyAgIGRhdGE6IHtcbiAgICAvLyAgICAgJ2tleSc6IGFwaV9rZXlcbiAgICAvLyAgIH0sXG4gICAgLy8gICBoZWFkZXJzOiB7XG4gICAgLy8gICAgICdBdXRob3JpemF0aW9uJzogJ1dSSVRFX0tFWScsXG4gICAgLy8gICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAvLyAgIH0sXG4gICAgLy8gICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIC8vICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCdrZWVuIHJlc3BvbnNlJywgcmVzcG9uc2UpO1xuICAgIC8vICAgfVxuICAgIC8vIH0pO1xuICAgIC8vIC8vICQucG9zdChrZWVuX3VybCwgZGF0YSwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAvLyAvLyAgIGNvbnNvbGUubG9nKCdrZWVuIHJlc3BvbnNlJywgcmVzcG9uc2UpO1xuICAgIC8vIC8vIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gb25DbG9zZShldnQpIHtcbiAgICAvLyB2YXIgc2FsdCA9IGJjcnlwdC5nZW5TYWx0U3luYygxMCk7XG4gICAgLy8gdmFyIGhhc2ggPSBiY3J5cHQuaGFzaFN5bmMoc3BlZWNoLnRyYW5zY3JpcHQsIHNhbHQpO1xuICAgIHZhciBoYXNoID0gJycgKyBuZXcgRGF0ZSgpO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzcGVlY2gud29yZHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHNwZWVjaC53b3Jkc1tpXS5zcGVlY2hfaWQgPSBoYXNoO1xuICAgIH1cbiAgICAkKCcjcmVzdWx0c1RleHQnKS52YWwoc3BlZWNoLnRyYW5zY3JpcHQpO1xuICAgIHNlbmRXb3Jkc1RvS2VlbihzcGVlY2gud29yZHMpO1xuICAgIC8vIGNvbnNvbGUubG9nKCdNaWMgc29ja2V0IGNsb3NlOiAnLCBldnQpO1xuICAgIC8vIFRPRE86IHNlbmQgc3R1ZmYgdG8ga2VlbiBpb1xuICB9XG5cbiAgaW5pdFNvY2tldChvcHRpb25zLCBvbk9wZW4sIG9uTGlzdGVuaW5nLCBvbk1lc3NhZ2UsIG9uRXJyb3IsIG9uQ2xvc2UpO1xufSIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTQgSUJNIENvcnAuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuLypnbG9iYWwgJDpmYWxzZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBNaWNyb3Bob25lID0gcmVxdWlyZSgnLi9NaWNyb3Bob25lJyk7XG52YXIgbW9kZWxzID0gcmVxdWlyZSgnLi9kYXRhL21vZGVscy5qc29uJykubW9kZWxzO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudXRpbHMuaW5pdFB1YlN1YigpO1xudmFyIGluaXRWaWV3cyA9IHJlcXVpcmUoJy4vdmlld3MnKS5pbml0Vmlld3M7XG5cbndpbmRvdy5CVUZGRVJTSVpFID0gODE5MjtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgLy8gTWFrZSBjYWxsIHRvIEFQSSB0byB0cnkgYW5kIGdldCB0b2tlblxuICB1dGlscy5nZXRUb2tlbihmdW5jdGlvbih0b2tlbikge1xuXG4gICAgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgfTtcblxuICAgIGlmICghdG9rZW4pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGF1dGhvcml6YXRpb24gdG9rZW4gYXZhaWxhYmxlJyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdBdHRlbXB0aW5nIHRvIHJlY29ubmVjdC4uLicpO1xuICAgIH1cblxuICAgIHZhciB2aWV3Q29udGV4dCA9IHtcbiAgICAgIGN1cnJlbnRNb2RlbDogJ2VuLVVTX0Jyb2FkYmFuZE1vZGVsJyxcbiAgICAgIG1vZGVsczogbW9kZWxzLFxuICAgICAgdG9rZW46IHRva2VuLFxuICAgICAgYnVmZmVyU2l6ZTogQlVGRkVSU0laRVxuICAgIH07XG5cbiAgICBpbml0Vmlld3Modmlld0NvbnRleHQpO1xuXG4gICAgLy8gU2F2ZSBtb2RlbHMgdG8gbG9jYWxzdG9yYWdlXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ21vZGVscycsIEpTT04uc3RyaW5naWZ5KG1vZGVscykpO1xuXG4gICAgLy8gU2V0IGRlZmF1bHQgY3VycmVudCBtb2RlbFxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50TW9kZWwnLCAnZW4tVVNfQnJvYWRiYW5kTW9kZWwnKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc2Vzc2lvblBlcm1pc3Npb25zJywgJ3RydWUnKTtcblxuXG4gICAgJC5zdWJzY3JpYmUoJ2NsZWFyc2NyZWVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAkKCcjcmVzdWx0c1RleHQnKS50ZXh0KCcnKTtcbiAgICAgICQoJyNyZXN1bHRzSlNPTicpLnRleHQoJycpO1xuICAgICAgJCgnLmVycm9yLXJvdycpLmhpZGUoKTtcbiAgICAgICQoJy5ub3RpZmljYXRpb24tcm93JykuaGlkZSgpO1xuICAgICAgJCgnLmh5cG90aGVzZXMgPiB1bCcpLmVtcHR5KCk7XG4gICAgICAkKCcjbWV0YWRhdGFUYWJsZUJvZHknKS5lbXB0eSgpO1xuICAgIH0pO1xuXG4gIH0pO1xuXG59KTtcbiIsInZhciBLZWVuID0gcmVxdWlyZSgna2Vlbi1qcycpO1xuXG5leHBvcnRzLmNsaWVudCA9IG5ldyBLZWVuKHtcbiAgcHJvamVjdElkOiBcIjU2MDZmM2Y0OTBlNGJkN2IwZTBlMWRkY1wiLCAvLyBTdHJpbmcgKHJlcXVpcmVkIGFsd2F5cylcbiAgd3JpdGVLZXk6IFwiMmZjNzYwNjhlYTM5NTYyYTVlM2M4ZjNhZTVjMTBhMDU4OGJmMDc0MjQ2ODYxYjM2ZmExNzE1MGJkMjFkZDAxMTQwYWMwNTFiMmJhZTRhZTExNThlMjE3ODU3YmFmNzMxMTIxMjBkNGY5MGE3MmI1NmU0YzFjOTdkM2Y0YjBlMjQ4YjkwNTQyN2NmZTgxODI1NTJiYWMzYjkxYWU3MmQ3ZDA2MmFiMjA0MTI2ODFhYzM5ODQ0OTE4YTRjYTJkMDBjNDA3NWFlMDQ4MDMwZmU4ZmM5NTIxMjc3NDAxMGRiNjVcIiwgICAvLyBTdHJpbmcgKHJlcXVpcmVkIGZvciBzZW5kaW5nIGRhdGEpXG4gIHJlYWRLZXk6IFwiYjJlNTQ0NmEwNDA5YjczZDE5MmNjN2M2YzNiMzlhZDJmYzVhYmVhMzg3NmQxODg1ZWFlMjVmMjUwZGEzODM0OTdhMjI3Y2ZkNmY2OWQzMDI0NjA2NWE5NmU2MjFhMzNhMmI2ZDIyZmVlYzgwYTdlZTRkNTIwNzc1NTUyYTBmMDliYzM3OGVlN2VjOGE1M2Q3NTM0YzQxNjNiYzViOTIwZDdlYjY5ODU1NGNlNWIwZmQ4YmYwMGRlMzk5Njc1ZDQ1NDE0NjE2NmQxZjk0ZGEyMjE2MDgwOGNlMjc1MTEwNjRcIiAgICAgIC8vIFN0cmluZyAocmVxdWlyZWQgZm9yIHF1ZXJ5aW5nIGRhdGEpXG5cbiAgLy8gcHJvdG9jb2w6IFwiaHR0cHNcIiwgICAgICAgICAvLyBTdHJpbmcgKG9wdGlvbmFsOiBodHRwcyB8IGh0dHAgfCBhdXRvKVxuICAvLyBob3N0OiBcImFwaS5rZWVuLmlvLzMuMFwiLCAgIC8vIFN0cmluZyAob3B0aW9uYWwpXG4gIC8vIHJlcXVlc3RUeXBlOiBcImpzb25wXCIgICAgICAgLy8gU3RyaW5nIChvcHRpb25hbDoganNvbnAsIHhociwgYmVhY29uKVxufSk7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDE0IElCTSBDb3JwLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbi8qZ2xvYmFsICQ6ZmFsc2UgKi9cblxuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgTWljcm9waG9uZSA9IHJlcXVpcmUoJy4vTWljcm9waG9uZScpO1xudmFyIHNob3dlcnJvciA9IHJlcXVpcmUoJy4vdmlld3Mvc2hvd2Vycm9yJyk7XG52YXIgc2hvd0Vycm9yID0gc2hvd2Vycm9yLnNob3dFcnJvcjtcbnZhciBoaWRlRXJyb3IgPSBzaG93ZXJyb3IuaGlkZUVycm9yO1xuXG4vLyBNaW5pIFdTIGNhbGxiYWNrIEFQSSwgc28gd2UgY2FuIGluaXRpYWxpemVcbi8vIHdpdGggbW9kZWwgYW5kIHRva2VuIGluIFVSSSwgcGx1c1xuLy8gc3RhcnQgbWVzc2FnZVxuXG4vLyBJbml0aWFsaXplIGNsb3N1cmUsIHdoaWNoIGhvbGRzIG1heGltdW0gZ2V0VG9rZW4gY2FsbCBjb3VudFxudmFyIHRva2VuR2VuZXJhdG9yID0gdXRpbHMuY3JlYXRlVG9rZW5HZW5lcmF0b3IoKTtcblxudmFyIGluaXRTb2NrZXQgPSBleHBvcnRzLmluaXRTb2NrZXQgPSBmdW5jdGlvbihvcHRpb25zLCBvbm9wZW4sIG9ubGlzdGVuaW5nLCBvbm1lc3NhZ2UsIG9uZXJyb3IsIG9uY2xvc2UpIHtcbiAgdmFyIGxpc3RlbmluZztcbiAgZnVuY3Rpb24gd2l0aERlZmF1bHQodmFsLCBkZWZhdWx0VmFsKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnID8gZGVmYXVsdFZhbCA6IHZhbDtcbiAgfVxuICB2YXIgc29ja2V0O1xuICB2YXIgdG9rZW4gPSBvcHRpb25zLnRva2VuO1xuICB2YXIgbW9kZWwgPSBvcHRpb25zLm1vZGVsIHx8IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50TW9kZWwnKTtcbiAgdmFyIG1lc3NhZ2UgPSBvcHRpb25zLm1lc3NhZ2UgfHwgeydhY3Rpb24nOiAnc3RhcnQnfTtcbiAgdmFyIHNlc3Npb25QZXJtaXNzaW9ucyA9IHdpdGhEZWZhdWx0KG9wdGlvbnMuc2Vzc2lvblBlcm1pc3Npb25zLCBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzZXNzaW9uUGVybWlzc2lvbnMnKSkpO1xuICB2YXIgc2Vzc2lvblBlcm1pc3Npb25zUXVlcnlQYXJhbSA9IHNlc3Npb25QZXJtaXNzaW9ucyA/ICcwJyA6ICcxJztcbiAgdmFyIHVybCA9IG9wdGlvbnMuc2VydmljZVVSSSB8fCAnd3NzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvcmVjb2duaXplP3dhdHNvbi10b2tlbj0nXG4gICAgKyB0b2tlblxuICAgICsgJyZYLVdEQy1QTC1PUFQtT1VUPScgKyBzZXNzaW9uUGVybWlzc2lvbnNRdWVyeVBhcmFtXG4gICAgKyAnJm1vZGVsPScgKyBtb2RlbDtcbiAgY29uc29sZS5sb2coJ1VSTCBtb2RlbCcsIG1vZGVsKTtcbiAgdHJ5IHtcbiAgICBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVybCk7XG4gIH0gY2F0Y2goZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcignV1MgY29ubmVjdGlvbiBlcnJvcjogJywgZXJyKTtcbiAgfVxuICBzb2NrZXQub25vcGVuID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgbGlzdGVuaW5nID0gZmFsc2U7XG4gICAgJC5zdWJzY3JpYmUoJ2hhcmRzb2NrZXRzdG9wJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ01JQ1JPUEhPTkU6IGNsb3NlLicpO1xuICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe2FjdGlvbjonc3RvcCd9KSk7XG4gICAgfSk7XG4gICAgJC5zdWJzY3JpYmUoJ3NvY2tldHN0b3AnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBjb25zb2xlLmxvZygnTUlDUk9QSE9ORTogY2xvc2UuJyk7XG4gICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICB9KTtcbiAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgb25vcGVuKHNvY2tldCk7XG4gIH07XG4gIHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldnQpIHtcbiAgICB2YXIgbXNnID0gSlNPTi5wYXJzZShldnQuZGF0YSk7XG4gICAgaWYgKG1zZy5lcnJvcikge1xuICAgICAgc2hvd0Vycm9yKG1zZy5lcnJvcik7XG4gICAgICAkLnB1Ymxpc2goJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChtc2cuc3RhdGUgPT09ICdsaXN0ZW5pbmcnKSB7XG4gICAgICAvLyBFYXJseSBjdXQgb2ZmLCB3aXRob3V0IG5vdGlmaWNhdGlvblxuICAgICAgaWYgKCFsaXN0ZW5pbmcpIHtcbiAgICAgICAgb25saXN0ZW5pbmcoc29ja2V0KTtcbiAgICAgICAgbGlzdGVuaW5nID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNSUNST1BIT05FOiBDbG9zaW5nIHNvY2tldC4nKTtcbiAgICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIG9ubWVzc2FnZShtc2csIHNvY2tldCk7XG4gIH07XG5cbiAgc29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbihldnQpIHtcbiAgICBjb25zb2xlLmxvZygnV1Mgb25lcnJvcjogJywgZXZ0KTtcbiAgICBzaG93RXJyb3IoJ0FwcGxpY2F0aW9uIGVycm9yICcgKyBldnQuY29kZSArICc6IHBsZWFzZSByZWZyZXNoIHlvdXIgYnJvd3NlciBhbmQgdHJ5IGFnYWluJyk7XG4gICAgJC5wdWJsaXNoKCdjbGVhcnNjcmVlbicpO1xuICAgIG9uZXJyb3IoZXZ0KTtcbiAgfTtcblxuICBzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uKGV2dCkge1xuICAgIGNvbnNvbGUubG9nKCdXUyBvbmNsb3NlOiAnLCBldnQpO1xuICAgIGlmIChldnQuY29kZSA9PT0gMTAwNikge1xuICAgICAgLy8gQXV0aGVudGljYXRpb24gZXJyb3IsIHRyeSB0byByZWNvbm5lY3RcbiAgICAgIGNvbnNvbGUubG9nKCdnZW5lcmF0b3IgY291bnQnLCB0b2tlbkdlbmVyYXRvci5nZXRDb3VudCgpKTtcbiAgICAgIGlmICh0b2tlbkdlbmVyYXRvci5nZXRDb3VudCgpID4gMSkge1xuICAgICAgICAkLnB1Ymxpc2goJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGF1dGhvcml6YXRpb24gdG9rZW4gaXMgY3VycmVudGx5IGF2YWlsYWJsZVwiKTtcbiAgICAgIH1cbiAgICAgIHRva2VuR2VuZXJhdG9yLmdldFRva2VuKGZ1bmN0aW9uKHRva2VuLCBlcnIpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICQucHVibGlzaCgnaGFyZHNvY2tldHN0b3AnKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ0ZldGNoaW5nIGFkZGl0aW9uYWwgdG9rZW4uLi4nKTtcbiAgICAgICAgb3B0aW9ucy50b2tlbiA9IHRva2VuO1xuICAgICAgICBpbml0U29ja2V0KG9wdGlvbnMsIG9ub3Blbiwgb25saXN0ZW5pbmcsIG9ubWVzc2FnZSwgb25lcnJvciwgb25jbG9zZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGV2dC5jb2RlID09PSAxMDExKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdTZXJ2ZXIgZXJyb3IgJyArIGV2dC5jb2RlICsgJzogcGxlYXNlIHJlZnJlc2ggeW91ciBicm93c2VyIGFuZCB0cnkgYWdhaW4nKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGV2dC5jb2RlID4gMTAwMCkge1xuICAgICAgY29uc29sZS5lcnJvcignU2VydmVyIGVycm9yICcgKyBldnQuY29kZSArICc6IHBsZWFzZSByZWZyZXNoIHlvdXIgYnJvd3NlciBhbmQgdHJ5IGFnYWluJyk7XG4gICAgICAvLyBzaG93RXJyb3IoJ1NlcnZlciBlcnJvciAnICsgZXZ0LmNvZGUgKyAnOiBwbGVhc2UgcmVmcmVzaCB5b3VyIGJyb3dzZXIgYW5kIHRyeSBhZ2FpbicpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBNYWRlIGl0IHRocm91Z2gsIG5vcm1hbCBjbG9zZVxuICAgICQudW5zdWJzY3JpYmUoJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgJC51bnN1YnNjcmliZSgnc29ja2V0c3RvcCcpO1xuICAgIG9uY2xvc2UoZXZ0KTtcbiAgfTtcblxufSIsIlxuLy8gRm9yIG5vbi12aWV3IGxvZ2ljXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBmaWxlQmxvY2sgPSBmdW5jdGlvbihfb2Zmc2V0LCBsZW5ndGgsIF9maWxlLCByZWFkQ2h1bmspIHtcbiAgdmFyIHIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICB2YXIgYmxvYiA9IF9maWxlLnNsaWNlKF9vZmZzZXQsIGxlbmd0aCArIF9vZmZzZXQpO1xuICByLm9ubG9hZCA9IHJlYWRDaHVuaztcbiAgci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKTtcbn1cblxuLy8gQmFzZWQgb24gYWxlZGlhZmVyaWEncyBTTyByZXNwb25zZVxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNDQzODE4Ny9qYXZhc2NyaXB0LWZpbGVyZWFkZXItcGFyc2luZy1sb25nLWZpbGUtaW4tY2h1bmtzXG5leHBvcnRzLm9uRmlsZVByb2dyZXNzID0gZnVuY3Rpb24ob3B0aW9ucywgb25kYXRhLCBvbmVycm9yLCBvbmVuZCwgc2FtcGxpbmdSYXRlKSB7XG4gIHZhciBmaWxlICAgICAgID0gb3B0aW9ucy5maWxlO1xuICB2YXIgZmlsZVNpemUgICA9IGZpbGUuc2l6ZTtcbiAgdmFyIGNodW5rU2l6ZSAgPSBvcHRpb25zLmJ1ZmZlclNpemUgfHwgMTYwMDA7ICAvLyBpbiBieXRlc1xuICB2YXIgb2Zmc2V0ICAgICA9IDA7XG4gIHZhciByZWFkQ2h1bmsgPSBmdW5jdGlvbihldnQpIHtcbiAgICBpZiAob2Zmc2V0ID49IGZpbGVTaXplKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkRvbmUgcmVhZGluZyBmaWxlXCIpO1xuICAgICAgb25lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGV2dC50YXJnZXQuZXJyb3IgPT0gbnVsbCkge1xuICAgICAgdmFyIGJ1ZmZlciA9IGV2dC50YXJnZXQucmVzdWx0O1xuICAgICAgdmFyIGxlbiA9IGJ1ZmZlci5ieXRlTGVuZ3RoO1xuICAgICAgb2Zmc2V0ICs9IGxlbjtcbiAgICAgIGNvbnNvbGUubG9nKFwic2VuZGluZzogXCIgKyBsZW4pXG4gICAgICBvbmRhdGEoYnVmZmVyKTsgLy8gY2FsbGJhY2sgZm9yIGhhbmRsaW5nIHJlYWQgY2h1bmtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IGV2dC50YXJnZXQuZXJyb3I7XG4gICAgICBjb25zb2xlLmxvZyhcIlJlYWQgZXJyb3I6IFwiICsgZXJyb3JNZXNzYWdlKTtcbiAgICAgIG9uZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gdXNlIHRoaXMgdGltZW91dCB0byBwYWNlIHRoZSBkYXRhIHVwbG9hZCBmb3IgdGhlIHBsYXlTYW1wbGUgY2FzZSwgdGhlIGlkZWEgaXMgdGhhdCB0aGUgaHlwcyBkbyBub3QgYXJyaXZlIGJlZm9yZSB0aGUgYXVkaW8gaXMgcGxheWVkIGJhY2tcbiAgICBpZiAoc2FtcGxpbmdSYXRlKSB7XG4gICAgXHRjb25zb2xlLmxvZyhcInNhbXBsaW5nUmF0ZTogXCIgKyAgc2FtcGxpbmdSYXRlICsgXCIgdGltZW91dDogXCIgKyAoY2h1bmtTaXplKjEwMDApLyhzYW1wbGluZ1JhdGUqMikpXG4gICAgXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBmaWxlQmxvY2sob2Zmc2V0LCBjaHVua1NpemUsIGZpbGUsIHJlYWRDaHVuayk7IH0sIChjaHVua1NpemUqMTAwMCkvKHNhbXBsaW5nUmF0ZSoyKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbGVCbG9jayhvZmZzZXQsIGNodW5rU2l6ZSwgZmlsZSwgcmVhZENodW5rKTtcbiAgICB9XG4gIH1cbiAgZmlsZUJsb2NrKG9mZnNldCwgY2h1bmtTaXplLCBmaWxlLCByZWFkQ2h1bmspO1xufVxuXG5leHBvcnRzLmNyZWF0ZVRva2VuR2VuZXJhdG9yID0gZnVuY3Rpb24oKSB7XG4gIC8vIE1ha2UgY2FsbCB0byBBUEkgdG8gdHJ5IGFuZCBnZXQgdG9rZW5cbiAgdmFyIGhhc0JlZW5SdW5UaW1lcyA9IDA7XG4gIHJldHVybiB7XG4gICAgZ2V0VG9rZW46IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgKytoYXNCZWVuUnVuVGltZXM7XG4gICAgaWYgKGhhc0JlZW5SdW5UaW1lcyA+IDUpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0Nhbm5vdCByZWFjaCBzZXJ2ZXInKTtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB1cmwgPSAnL3Rva2VuJztcbiAgICB2YXIgdG9rZW5SZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgdG9rZW5SZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICB0b2tlblJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICB2YXIgdG9rZW4gPSB0b2tlblJlcXVlc3QucmVzcG9uc2VUZXh0O1xuICAgICAgY2FsbGJhY2sodG9rZW4pO1xuICAgIH07XG4gICAgdG9rZW5SZXF1ZXN0LnNlbmQoKTtcbiAgICB9LFxuICAgIGdldENvdW50OiBmdW5jdGlvbigpIHsgcmV0dXJuIGhhc0JlZW5SdW5UaW1lczsgfVxuICB9XG59O1xuXG5leHBvcnRzLmdldFRva2VuID0gKGZ1bmN0aW9uKCkge1xuICAvLyBNYWtlIGNhbGwgdG8gQVBJIHRvIHRyeSBhbmQgZ2V0IHRva2VuXG4gIHZhciBoYXNCZWVuUnVuVGltZXMgPSAwO1xuICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBoYXNCZWVuUnVuVGltZXMrK1xuICAgIGlmIChoYXNCZWVuUnVuVGltZXMgPiA1KSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdDYW5ub3QgcmVhY2ggc2VydmVyJyk7XG4gICAgICBjYWxsYmFjayhudWxsLCBlcnIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdXJsID0gJy90b2tlbic7XG4gICAgdmFyIHRva2VuUmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHRva2VuUmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgdG9rZW5SZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgdmFyIHRva2VuID0gdG9rZW5SZXF1ZXN0LnJlc3BvbnNlVGV4dDtcbiAgICAgIGNhbGxiYWNrKHRva2VuKTtcbiAgICB9O1xuICAgIHRva2VuUmVxdWVzdC5zZW5kKCk7XG4gIH1cbn0pKCk7XG5cbmV4cG9ydHMuaW5pdFB1YlN1YiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbyAgICAgICAgID0gJCh7fSk7XG4gICQuc3Vic2NyaWJlICAgPSBvLm9uLmJpbmQobyk7XG4gICQudW5zdWJzY3JpYmUgPSBvLm9mZi5iaW5kKG8pO1xuICAkLnB1Ymxpc2ggICAgID0gby50cmlnZ2VyLmJpbmQobyk7XG59IiwiXG5cbmV4cG9ydHMuaW5pdEFuaW1hdGVQYW5lbCA9IGZ1bmN0aW9uKCkge1xuICAkKCcucGFuZWwtaGVhZGluZyBzcGFuLmNsaWNrYWJsZScpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygncGFuZWwtY29sbGFwc2VkJykpIHtcbiAgICAgIC8vIGV4cGFuZCB0aGUgcGFuZWxcbiAgICAgICQodGhpcykucGFyZW50cygnLnBhbmVsJykuZmluZCgnLnBhbmVsLWJvZHknKS5zbGlkZURvd24oKTtcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xuICAgICAgJCh0aGlzKS5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2NhcmV0LWRvd24nKS5hZGRDbGFzcygnY2FyZXQtdXAnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBjb2xsYXBzZSB0aGUgcGFuZWxcbiAgICAgICQodGhpcykucGFyZW50cygnLnBhbmVsJykuZmluZCgnLnBhbmVsLWJvZHknKS5zbGlkZVVwKCk7XG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcbiAgICAgICQodGhpcykuZmluZCgnaScpLnJlbW92ZUNsYXNzKCdjYXJldC11cCcpLmFkZENsYXNzKCdjYXJldC1kb3duJyk7XG4gICAgfVxuICB9KTtcbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgc2Nyb2xsZWQgPSBmYWxzZSxcbiAgICB0ZXh0U2Nyb2xsZWQgPSBmYWxzZTtcblxudmFyIHNob3dUaW1lc3RhbXAgPSBmdW5jdGlvbih0aW1lc3RhbXBzLCBjb25maWRlbmNlcykge1xuICB2YXIgd29yZCA9IHRpbWVzdGFtcHNbMF0sXG4gICAgICB0MCA9IHRpbWVzdGFtcHNbMV0sXG4gICAgICB0MSA9IHRpbWVzdGFtcHNbMl07XG4gIHZhciB0aW1lbGVuZ3RoID0gdDEgLSB0MDtcbiAgLy8gU2hvdyBjb25maWRlbmNlIGlmIGRlZmluZWQsIGVsc2UgJ24vYSdcbiAgdmFyIGRpc3BsYXlDb25maWRlbmNlID0gY29uZmlkZW5jZXMgPyBjb25maWRlbmNlc1sxXS50b1N0cmluZygpLnN1YnN0cmluZygwLCAzKSA6ICduL2EnO1xuICAkKCcjbWV0YWRhdGFUYWJsZSA+IHRib2R5Omxhc3QtY2hpbGQnKS5hcHBlbmQoXG4gICAgICAnPHRyPidcbiAgICAgICsgJzx0ZD4nICsgd29yZCArICc8L3RkPidcbiAgICAgICsgJzx0ZD4nICsgdDAgKyAnPC90ZD4nXG4gICAgICArICc8dGQ+JyArIHQxICsgJzwvdGQ+J1xuICAgICAgKyAnPHRkPicgKyBkaXNwbGF5Q29uZmlkZW5jZSArICc8L3RkPidcbiAgICAgICsgJzwvdHI+J1xuICAgICAgKTtcbn1cblxuXG52YXIgc2hvd01ldGFEYXRhID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmUpIHtcbiAgdmFyIGNvbmZpZGVuY2VOZXN0ZWRBcnJheSA9IGFsdGVybmF0aXZlLndvcmRfY29uZmlkZW5jZTs7XG4gIHZhciB0aW1lc3RhbXBOZXN0ZWRBcnJheSA9IGFsdGVybmF0aXZlLnRpbWVzdGFtcHM7XG4gIGlmIChjb25maWRlbmNlTmVzdGVkQXJyYXkgJiYgY29uZmlkZW5jZU5lc3RlZEFycmF5Lmxlbmd0aCA+IDApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbmZpZGVuY2VOZXN0ZWRBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHRpbWVzdGFtcHMgPSB0aW1lc3RhbXBOZXN0ZWRBcnJheVtpXTtcbiAgICAgIHZhciBjb25maWRlbmNlcyA9IGNvbmZpZGVuY2VOZXN0ZWRBcnJheVtpXTtcbiAgICAgIHNob3dUaW1lc3RhbXAodGltZXN0YW1wcywgY29uZmlkZW5jZXMpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH0gZWxzZSB7XG4gICAgaWYgKHRpbWVzdGFtcE5lc3RlZEFycmF5ICYmIHRpbWVzdGFtcE5lc3RlZEFycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRpbWVzdGFtcE5lc3RlZEFycmF5LmZvckVhY2goZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgICAgIHNob3dUaW1lc3RhbXAodGltZXN0YW1wKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG52YXIgQWx0ZXJuYXRpdmVzID0gZnVuY3Rpb24oKXtcblxuICB2YXIgc3RyaW5nT25lID0gJycsXG4gICAgc3RyaW5nVHdvID0gJycsXG4gICAgc3RyaW5nVGhyZWUgPSAnJztcblxuICB0aGlzLmNsZWFyU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgc3RyaW5nT25lID0gJyc7XG4gICAgc3RyaW5nVHdvID0gJyc7XG4gICAgc3RyaW5nVGhyZWUgPSAnJztcbiAgfTtcblxuICB0aGlzLnNob3dBbHRlcm5hdGl2ZXMgPSBmdW5jdGlvbihhbHRlcm5hdGl2ZXMsIGlzRmluYWwsIHRlc3RpbmcpIHtcbiAgICB2YXIgJGh5cG90aGVzZXMgPSAkKCcuaHlwb3RoZXNlcyBvbCcpO1xuICAgICRoeXBvdGhlc2VzLmVtcHR5KCk7XG4gICAgLy8gJGh5cG90aGVzZXMuYXBwZW5kKCQoJzwvYnI+JykpO1xuICAgIGFsdGVybmF0aXZlcy5mb3JFYWNoKGZ1bmN0aW9uKGFsdGVybmF0aXZlLCBpZHgpIHtcbiAgICAgIHZhciAkYWx0ZXJuYXRpdmU7XG4gICAgICBpZiAoYWx0ZXJuYXRpdmUudHJhbnNjcmlwdCkge1xuICAgICAgICB2YXIgdHJhbnNjcmlwdCA9IGFsdGVybmF0aXZlLnRyYW5zY3JpcHQucmVwbGFjZSgvJUhFU0lUQVRJT05cXHMvZywgJycpO1xuICAgICAgICB0cmFuc2NyaXB0ID0gdHJhbnNjcmlwdC5yZXBsYWNlKC8oLilcXDF7Mix9L2csICcnKTtcbiAgICAgICAgc3dpdGNoIChpZHgpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBzdHJpbmdPbmUgPSBzdHJpbmdPbmUgKyB0cmFuc2NyaXB0O1xuICAgICAgICAgICAgJGFsdGVybmF0aXZlID0gJCgnPGxpIGRhdGEtaHlwb3RoZXNpcy1pbmRleD0nICsgaWR4ICsgJyA+JyArIHN0cmluZ09uZSArICc8L2xpPicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgc3RyaW5nVHdvID0gc3RyaW5nVHdvICsgdHJhbnNjcmlwdDtcbiAgICAgICAgICAgICRhbHRlcm5hdGl2ZSA9ICQoJzxsaSBkYXRhLWh5cG90aGVzaXMtaW5kZXg9JyArIGlkeCArICcgPicgKyBzdHJpbmdUd28gKyAnPC9saT4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHN0cmluZ1RocmVlID0gc3RyaW5nVGhyZWUgKyB0cmFuc2NyaXB0O1xuICAgICAgICAgICAgJGFsdGVybmF0aXZlID0gJCgnPGxpIGRhdGEtaHlwb3RoZXNpcy1pbmRleD0nICsgaWR4ICsgJyA+JyArIHN0cmluZ1RocmVlICsgJzwvbGk+Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAkaHlwb3RoZXNlcy5hcHBlbmQoJGFsdGVybmF0aXZlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn1cblxudmFyIGFsdGVybmF0aXZlUHJvdG90eXBlID0gbmV3IEFsdGVybmF0aXZlcygpO1xuXG5cbi8vIFRPRE86IENvbnZlcnQgdG8gY2xvc3VyZSBhcHByb2FjaFxuLyp2YXIgcHJvY2Vzc1N0cmluZyA9IGZ1bmN0aW9uKGJhc2VTdHJpbmcsIGlzRmluaXNoZWQpIHtcblxuICBpZiAoaXNGaW5pc2hlZCkge1xuICAgIHZhciBmb3JtYXR0ZWRTdHJpbmcgPSBiYXNlU3RyaW5nLnNsaWNlKDAsIC0xKTtcbiAgICBmb3JtYXR0ZWRTdHJpbmcgPSBmb3JtYXR0ZWRTdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmb3JtYXR0ZWRTdHJpbmcuc3Vic3RyaW5nKDEpO1xuICAgIGZvcm1hdHRlZFN0cmluZyA9IGZvcm1hdHRlZFN0cmluZy50cmltKCkgKyAnLiAnO1xuICAgICQoJyNyZXN1bHRzVGV4dCcpLnZhbChmb3JtYXR0ZWRTdHJpbmcpO1xuICAgIHJldHVybiBmb3JtYXR0ZWRTdHJpbmc7XG4gIH0gZWxzZSB7XG4gICAgJCgnI3Jlc3VsdHNUZXh0JykudmFsKGJhc2VTdHJpbmcpO1xuICAgIHJldHVybiBiYXNlU3RyaW5nO1xuICB9XG59Ki9cblxuZXhwb3J0cy5zaG93SlNPTiA9IGZ1bmN0aW9uKG1zZywgYmFzZUpTT04pIHtcbiAgXG4gICB2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KG1zZywgbnVsbCwgMik7XG4gICAgYmFzZUpTT04gKz0ganNvbjtcbiAgICBiYXNlSlNPTiArPSAnXFxuJzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbiAgaWYgKCQoJy5uYXYtdGFicyAuYWN0aXZlJykudGV4dCgpID09IFwiSlNPTlwiKSB7XG4gICAgICAkKCcjcmVzdWx0c0pTT04nKS5hcHBlbmQoYmFzZUpTT04pO1xuICAgICAgYmFzZUpTT04gPSBcIlwiO1xuICAgICAgY29uc29sZS5sb2coXCJ1cGRhdGluZyBqc29uXCIpO1xuICB9XG4gIFxuICByZXR1cm4gYmFzZUpTT047XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRleHRTY3JvbGwoKXtcbiAgaWYoIXNjcm9sbGVkKXtcbiAgICB2YXIgZWxlbWVudCA9ICQoJyNyZXN1bHRzVGV4dCcpLmdldCgwKTtcbiAgICBlbGVtZW50LnNjcm9sbFRvcCA9IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0O1xuICB9XG59XG5cbnZhciBpbml0VGV4dFNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAkKCcjcmVzdWx0c1RleHQnKS5vbignc2Nyb2xsJywgZnVuY3Rpb24oKXtcbiAgICAgIHRleHRTY3JvbGxlZCA9IHRydWU7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTY3JvbGwoKXtcbiAgaWYoIXNjcm9sbGVkKXtcbiAgICB2YXIgZWxlbWVudCA9ICQoJy50YWJsZS1zY3JvbGwnKS5nZXQoMCk7XG4gICAgZWxlbWVudC5zY3JvbGxUb3AgPSBlbGVtZW50LnNjcm9sbEhlaWdodDtcbiAgfVxufVxuXG52YXIgaW5pdFNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAkKCcudGFibGUtc2Nyb2xsJykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uKCl7XG4gICAgICBzY3JvbGxlZD10cnVlO1xuICB9KTtcbn1cblxuZXhwb3J0cy5pbml0RGlzcGxheU1ldGFkYXRhID0gZnVuY3Rpb24oKSB7XG4gIGluaXRTY3JvbGwoKTtcbiAgaW5pdFRleHRTY3JvbGwoKTtcbn07XG5cblxuZXhwb3J0cy5zaG93UmVzdWx0ID0gZnVuY3Rpb24obXNnLCBiYXNlU3RyaW5nLCBtb2RlbCwgY2FsbGJhY2spIHtcblxuICB2YXIgaWR4ID0gK21zZy5yZXN1bHRfaW5kZXg7XG5cbiAgaWYgKG1zZy5yZXN1bHRzICYmIG1zZy5yZXN1bHRzLmxlbmd0aCA+IDApIHtcblxuICAgIHZhciBhbHRlcm5hdGl2ZXMgPSBtc2cucmVzdWx0c1swXS5hbHRlcm5hdGl2ZXM7XG4gICAgdmFyIHRleHQgPSBtc2cucmVzdWx0c1swXS5hbHRlcm5hdGl2ZXNbMF0udHJhbnNjcmlwdCB8fCAnJztcbiAgICBcbiAgICAvLyBhcHBseSBtYXBwaW5ncyB0byBiZWF1dGlmeVxuICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyVIRVNJVEFUSU9OXFxzL2csICcnKTtcbiAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oLilcXDF7Mix9L2csICcnKTtcbiAgICBpZiAobXNnLnJlc3VsdHNbMF0uZmluYWwpXG4gICAgICAgY29uc29sZS5sb2coXCItPiBcIiArIHRleHQgKyBcIlxcblwiKTtcbiAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9EX1teXFxzXSsvZywnJyk7XG4gICAgXG4gICAgLy8gaWYgYWxsIHdvcmRzIGFyZSBtYXBwZWQgdG8gbm90aGluZyB0aGVuIHRoZXJlIGlzIG5vdGhpbmcgZWxzZSB0byBkb1xuICAgIGlmICgodGV4dC5sZW5ndGggPT0gMCkgfHwgKC9eXFxzKyQvLnRlc3QodGV4dCkpKSB7XG4gICAgXHQgcmV0dXJuIGJhc2VTdHJpbmc7XG4gICAgfSAgICBcdCAgXG4gICAgXG4gICAgLy8gY2FwaXRhbGl6ZSBmaXJzdCB3b3JkXG4gICAgLy8gaWYgZmluYWwgcmVzdWx0cywgYXBwZW5kIGEgbmV3IHBhcmFncmFwaFxuICAgIGlmIChtc2cucmVzdWx0cyAmJiBtc2cucmVzdWx0c1swXSAmJiBtc2cucmVzdWx0c1swXS5maW5hbCkge1xuICAgICAgIHRleHQgPSB0ZXh0LnNsaWNlKDAsIC0xKTtcbiAgICAgICB0ZXh0ID0gdGV4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRleHQuc3Vic3RyaW5nKDEpO1xuICAgICAgIGlmICgobW9kZWwuc3Vic3RyaW5nKDAsNSkgPT0gXCJqYS1KUFwiKSB8fCAobW9kZWwuc3Vic3RyaW5nKDAsNSkgPT0gXCJ6aC1DTlwiKSkgeyAgICAgICAgXG4gICAgICAgICAgdGV4dCA9IHRleHQudHJpbSgpICsgJ+OAgic7XG4gICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvIC9nLCcnKTsgICAgICAvLyByZW1vdmUgd2hpdGVzcGFjZXMgXG4gICAgICAgfSBlbHNlIHsgIFxuICAgICAgICAgIHRleHQgPSB0ZXh0LnRyaW0oKSArICcuICc7XG4gICAgICAgfSAgICAgICBcbiAgICAgICBiYXNlU3RyaW5nICs9IHRleHQ7XG4gICAgICAgJCgnI3Jlc3VsdHNUZXh0JykudmFsKGJhc2VTdHJpbmcpO1xuICAgICAgIHNob3dNZXRhRGF0YShhbHRlcm5hdGl2ZXNbMF0pO1xuICAgICAgIC8vIE9ubHkgc2hvdyBhbHRlcm5hdGl2ZXMgaWYgd2UncmUgZmluYWxcbiAgICAgICBhbHRlcm5hdGl2ZVByb3RvdHlwZS5zaG93QWx0ZXJuYXRpdmVzKGFsdGVybmF0aXZlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICBpZiAoKG1vZGVsLnN1YnN0cmluZygwLDUpID09IFwiamEtSlBcIikgfHwgKG1vZGVsLnN1YnN0cmluZygwLDUpID09IFwiemgtQ05cIikpIHsgICAgICAgIFxuICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyAvZywnJyk7ICAgICAgLy8gcmVtb3ZlIHdoaXRlc3BhY2VzICAgICBcdCAgICAgICAgIFxuICAgICAgIH0gZWxzZSB7XG4gICAgICAgIFx0IHRleHQgPSB0ZXh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGV4dC5zdWJzdHJpbmcoMSk7XG4gICAgICAgfVxuICAgIFx0ICQoJyNyZXN1bHRzVGV4dCcpLnZhbChiYXNlU3RyaW5nICsgdGV4dCk7ICAgIFx0IFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVNjcm9sbCgpO1xuICB1cGRhdGVUZXh0U2Nyb2xsKCk7XG4gIHJldHVybiBiYXNlU3RyaW5nO1xufTtcblxuJC5zdWJzY3JpYmUoJ2NsZWFyc2NyZWVuJywgZnVuY3Rpb24oKSB7XG4gIHZhciAkaHlwb3RoZXNlcyA9ICQoJy5oeXBvdGhlc2VzIHVsJyk7XG4gIHNjcm9sbGVkID0gZmFsc2U7XG4gICRoeXBvdGhlc2VzLmVtcHR5KCk7XG4gIGFsdGVybmF0aXZlUHJvdG90eXBlLmNsZWFyU3RyaW5nKCk7XG59KTtcblxuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciBoYW5kbGVTZWxlY3RlZEZpbGUgPSByZXF1aXJlKCcuL2ZpbGV1cGxvYWQnKS5oYW5kbGVTZWxlY3RlZEZpbGU7XG5cbmV4cG9ydHMuaW5pdERyYWdEcm9wID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgdmFyIGRyYWdBbmREcm9wVGFyZ2V0ID0gJChkb2N1bWVudCk7XG5cbiAgZHJhZ0FuZERyb3BUYXJnZXQub24oJ2RyYWdlbnRlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGRyYWdBbmREcm9wVGFyZ2V0Lm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGRyYWdBbmREcm9wVGFyZ2V0Lm9uKCdkcm9wJywgZnVuY3Rpb24gKGUpIHtcbiAgICBjb25zb2xlLmxvZygnRmlsZSBkcm9wcGVkJyk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBldnQgPSBlLm9yaWdpbmFsRXZlbnQ7XG4gICAgLy8gSGFuZGxlIGRyYWdnZWQgZmlsZSBldmVudFxuICAgIGhhbmRsZUZpbGVVcGxvYWRFdmVudChldnQpO1xuICB9KTtcblxuICBmdW5jdGlvbiBoYW5kbGVGaWxlVXBsb2FkRXZlbnQoZXZ0KSB7XG4gICAgLy8gSW5pdCBmaWxlIHVwbG9hZCB3aXRoIGRlZmF1bHQgbW9kZWxcbiAgICB2YXIgZmlsZSA9IGV2dC5kYXRhVHJhbnNmZXIuZmlsZXNbMF07XG4gICAgaGFuZGxlU2VsZWN0ZWRGaWxlKGN0eC50b2tlbiwgZmlsZSk7XG4gIH1cblxufVxuIiwiXG5cblxuZXhwb3J0cy5mbGFzaFNWRyA9IGZ1bmN0aW9uKGVsKSB7XG4gIGVsLmNzcyh7IGZpbGw6ICcjQTUzNzI1JyB9KTtcbiAgZnVuY3Rpb24gbG9vcCgpIHtcbiAgICBlbC5hbmltYXRlKHsgZmlsbDogJyNBNTM3MjUnIH0sXG4gICAgICAgIDEwMDAsICdsaW5lYXInKVxuICAgICAgLmFuaW1hdGUoeyBmaWxsOiAnd2hpdGUnIH0sXG4gICAgICAgICAgMTAwMCwgJ2xpbmVhcicpO1xuICB9XG4gIC8vIHJldHVybiB0aW1lclxuICB2YXIgdGltZXIgPSBzZXRUaW1lb3V0KGxvb3AsIDIwMDApO1xuICByZXR1cm4gdGltZXI7XG59O1xuXG5leHBvcnRzLnN0b3BGbGFzaFNWRyA9IGZ1bmN0aW9uKHRpbWVyKSB7XG4gIGVsLmNzcyh7IGZpbGw6ICd3aGl0ZScgfSApO1xuICBjbGVhckludGVydmFsKHRpbWVyKTtcbn1cblxuZXhwb3J0cy50b2dnbGVJbWFnZSA9IGZ1bmN0aW9uKGVsLCBuYW1lKSB7XG4gIGlmKGVsLmF0dHIoJ3NyYycpID09PSAnaW1hZ2VzLycgKyBuYW1lICsgJy5zdmcnKSB7XG4gICAgZWwuYXR0cihcInNyY1wiLCAnaW1hZ2VzL3N0b3AtcmVkLnN2ZycpO1xuICB9IGVsc2Uge1xuICAgIGVsLmF0dHIoJ3NyYycsICdpbWFnZXMvc3RvcC5zdmcnKTtcbiAgfVxufVxuXG52YXIgcmVzdG9yZUltYWdlID0gZXhwb3J0cy5yZXN0b3JlSW1hZ2UgPSBmdW5jdGlvbihlbCwgbmFtZSkge1xuICBlbC5hdHRyKCdzcmMnLCAnaW1hZ2VzLycgKyBuYW1lICsgJy5zdmcnKTtcbn1cblxuZXhwb3J0cy5zdG9wVG9nZ2xlSW1hZ2UgPSBmdW5jdGlvbih0aW1lciwgZWwsIG5hbWUpIHtcbiAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gIHJlc3RvcmVJbWFnZShlbCwgbmFtZSk7XG59XG4iLCJcbid1c2Ugc3RyaWN0JztcblxudmFyIHNob3dFcnJvciA9IHJlcXVpcmUoJy4vc2hvd2Vycm9yJykuc2hvd0Vycm9yO1xudmFyIHNob3dOb3RpY2UgPSByZXF1aXJlKCcuL3Nob3dlcnJvcicpLnNob3dOb3RpY2U7XG52YXIgaGFuZGxlRmlsZVVwbG9hZCA9IHJlcXVpcmUoJy4uL2hhbmRsZWZpbGV1cGxvYWQnKS5oYW5kbGVGaWxlVXBsb2FkO1xudmFyIGVmZmVjdHMgPSByZXF1aXJlKCcuL2VmZmVjdHMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8vIE5lZWQgdG8gcmVtb3ZlIHRoZSB2aWV3IGxvZ2ljIGhlcmUgYW5kIG1vdmUgdGhpcyBvdXQgdG8gdGhlIGhhbmRsZWZpbGV1cGxvYWQgY29udHJvbGxlclxudmFyIGhhbmRsZVNlbGVjdGVkRmlsZSA9IGV4cG9ydHMuaGFuZGxlU2VsZWN0ZWRGaWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcblxuICAgIHJldHVybiBmdW5jdGlvbih0b2tlbiwgZmlsZSkge1xuXG4gICAgdmFyIGN1cnJlbnRseURpc3BsYXlpbmcgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJykpO1xuXG4gICAgLy8gaWYgKGN1cnJlbnRseURpc3BsYXlpbmcpIHtcbiAgICAvLyAgIHNob3dFcnJvcignQ3VycmVudGx5IGFub3RoZXIgZmlsZSBpcyBwbGF5aW5nLCBwbGVhc2Ugc3RvcCB0aGUgZmlsZSBvciB3YWl0IHVudGlsIGl0IGZpbmlzaGVzJyk7XG4gICAgLy8gICByZXR1cm47XG4gICAgLy8gfVxuXG4gICAgJC5wdWJsaXNoKCdjbGVhcnNjcmVlbicpO1xuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCB0cnVlKTtcbiAgICBydW5uaW5nID0gdHJ1ZTtcblxuICAgIC8vIFZpc3VhbCBlZmZlY3RzXG4gICAgdmFyIHVwbG9hZEltYWdlVGFnID0gJCgnI2ZpbGVVcGxvYWRUYXJnZXQgPiBpbWcnKTtcbiAgICB2YXIgdGltZXIgPSBzZXRJbnRlcnZhbChlZmZlY3RzLnRvZ2dsZUltYWdlLCA3NTAsIHVwbG9hZEltYWdlVGFnLCAnc3RvcCcpO1xuICAgIHZhciB1cGxvYWRUZXh0ID0gJCgnI2ZpbGVVcGxvYWRUYXJnZXQgPiBzcGFuJyk7XG4gICAgdXBsb2FkVGV4dC50ZXh0KCdTdG9wIFRyYW5zY3JpYmluZycpO1xuXG4gICAgZnVuY3Rpb24gcmVzdG9yZVVwbG9hZFRhYigpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpO1xuICAgICAgZWZmZWN0cy5yZXN0b3JlSW1hZ2UodXBsb2FkSW1hZ2VUYWcsICd1cGxvYWQnKTtcbiAgICAgIHVwbG9hZFRleHQudGV4dCgnU2VsZWN0IEZpbGUnKTtcbiAgICB9XG5cbiAgICAvLyBDbGVhciBmbGFzaGluZyBpZiBzb2NrZXQgdXBsb2FkIGlzIHN0b3BwZWRcbiAgICAkLnN1YnNjcmliZSgnaGFyZHNvY2tldHN0b3AnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXN0b3JlVXBsb2FkVGFiKCk7XG4gICAgfSk7XG5cbiAgICAvLyBHZXQgY3VycmVudCBtb2RlbFxuICAgIHZhciBjdXJyZW50TW9kZWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudE1vZGVsJyk7XG4gICAgY29uc29sZS5sb2coJ2N1cnJlbnRNb2RlbCcsIGN1cnJlbnRNb2RlbCk7XG5cbiAgICAvLyBSZWFkIGZpcnN0IDQgYnl0ZXMgdG8gZGV0ZXJtaW5lIGhlYWRlclxuICAgIHZhciBibG9iVG9UZXh0ID0gbmV3IEJsb2IoW2ZpbGVdKS5zbGljZSgwLCA0KTtcbiAgICB2YXIgciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgci5yZWFkQXNUZXh0KGJsb2JUb1RleHQpO1xuICAgIHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29udGVudFR5cGU7XG4gICAgICBpZiAoci5yZXN1bHQgPT09ICdmTGFDJykge1xuICAgICAgICBjb250ZW50VHlwZSA9ICdhdWRpby9mbGFjJztcbiAgICAgICAgc2hvd05vdGljZSgnTm90aWNlOiBicm93c2VycyBkbyBub3Qgc3VwcG9ydCBwbGF5aW5nIEZMQUMgYXVkaW8sIHNvIG5vIGF1ZGlvIHdpbGwgYWNjb21wYW55IHRoZSB0cmFuc2NyaXB0aW9uJyk7XG4gICAgICB9IGVsc2UgaWYgKHIucmVzdWx0ID09PSAnUklGRicpIHtcbiAgICAgICAgY29udGVudFR5cGUgPSAnYXVkaW8vd2F2JztcbiAgICAgICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgIHZhciB3YXZCbG9iID0gbmV3IEJsb2IoW2ZpbGVdLCB7dHlwZTogJ2F1ZGlvL3dhdid9KTtcbiAgICAgICAgdmFyIHdhdlVSTCA9IFVSTC5jcmVhdGVPYmplY3RVUkwod2F2QmxvYik7XG4gICAgICAgIGF1ZGlvLnNyYyA9IHdhdlVSTDtcbiAgICAgICAgYXVkaW8ucGxheSgpO1xuICAgICAgICAkLnN1YnNjcmliZSgnaGFyZHNvY2tldHN0b3AnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBhdWRpby5wYXVzZSgpO1xuICAgICAgICAgIGF1ZGlvLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN0b3JlVXBsb2FkVGFiKCk7XG4gICAgICAgIHNob3dFcnJvcignT25seSBXQVYgb3IgRkxBQyBmaWxlcyBjYW4gYmUgdHJhbnNjcmliZWQsIHBsZWFzZSB0cnkgYW5vdGhlciBmaWxlIGZvcm1hdCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBoYW5kbGVGaWxlVXBsb2FkKHRva2VuLCBjdXJyZW50TW9kZWwsIGZpbGUsIGNvbnRlbnRUeXBlLCBmdW5jdGlvbihzb2NrZXQpIHtcbiAgICAgICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbZmlsZV0pO1xuICAgICAgICB2YXIgcGFyc2VPcHRpb25zID0ge1xuICAgICAgICAgIGZpbGU6IGJsb2JcbiAgICAgICAgfTtcbiAgICAgICAgdXRpbHMub25GaWxlUHJvZ3Jlc3MocGFyc2VPcHRpb25zLFxuICAgICAgICAgIC8vIE9uIGRhdGEgY2h1bmtcbiAgICAgICAgICBmdW5jdGlvbihjaHVuaykge1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoY2h1bmspO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gT24gZmlsZSByZWFkIGVycm9yXG4gICAgICAgICAgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgcmVhZGluZyBmaWxlOiAnLCBldnQubWVzc2FnZSk7XG4gICAgICAgICAgICBzaG93RXJyb3IoJ0Vycm9yOiAnICsgZXZ0Lm1lc3NhZ2UpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gT24gbG9hZCBlbmRcbiAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KHsnYWN0aW9uJzogJ3N0b3AnfSkpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSwgXG4gICAgICAgIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgIGVmZmVjdHMuc3RvcFRvZ2dsZUltYWdlKHRpbWVyLCB1cGxvYWRJbWFnZVRhZywgJ3VwbG9hZCcpO1xuICAgICAgICAgIHVwbG9hZFRleHQudGV4dCgnU2VsZWN0IEZpbGUnKTtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9O1xuICB9XG59KSgpO1xuXG5cbmV4cG9ydHMuaW5pdEZpbGVVcGxvYWQgPSBmdW5jdGlvbihjdHgpIHtcblxuICB2YXIgZmlsZVVwbG9hZERpYWxvZyA9ICQoXCIjZmlsZVVwbG9hZERpYWxvZ1wiKTtcblxuICBmaWxlVXBsb2FkRGlhbG9nLmNoYW5nZShmdW5jdGlvbihldnQpIHtcbiAgICB2YXIgZmlsZSA9IGZpbGVVcGxvYWREaWFsb2cuZ2V0KDApLmZpbGVzWzBdO1xuICAgIGhhbmRsZVNlbGVjdGVkRmlsZShjdHgudG9rZW4sIGZpbGUpO1xuICB9KTtcblxuICAkKFwiI2ZpbGVVcGxvYWRUYXJnZXRcIikuY2xpY2soZnVuY3Rpb24oZXZ0KSB7XG5cbiAgICB2YXIgY3VycmVudGx5RGlzcGxheWluZyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnKSk7XG5cbiAgICBpZiAoY3VycmVudGx5RGlzcGxheWluZykge1xuICAgICAgY29uc29sZS5sb2coJ0hBUkQgU09DS0VUIFNUT1AnKTtcbiAgICAgICQucHVibGlzaCgnaGFyZHNvY2tldHN0b3AnKTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZpbGVVcGxvYWREaWFsb2cudmFsKG51bGwpO1xuXG4gICAgZmlsZVVwbG9hZERpYWxvZ1xuICAgIC50cmlnZ2VyKCdjbGljaycpO1xuXG4gIH0pO1xuXG59IiwiXG52YXIgaW5pdFNlc3Npb25QZXJtaXNzaW9ucyA9IHJlcXVpcmUoJy4vc2Vzc2lvbnBlcm1pc3Npb25zJykuaW5pdFNlc3Npb25QZXJtaXNzaW9ucztcbnZhciBpbml0U2VsZWN0TW9kZWwgPSByZXF1aXJlKCcuL3NlbGVjdG1vZGVsJykuaW5pdFNlbGVjdE1vZGVsO1xudmFyIGluaXRBbmltYXRlUGFuZWwgPSByZXF1aXJlKCcuL2FuaW1hdGVwYW5lbCcpLmluaXRBbmltYXRlUGFuZWw7XG52YXIgaW5pdFNob3dUYWIgPSByZXF1aXJlKCcuL3Nob3d0YWInKS5pbml0U2hvd1RhYjtcbnZhciBpbml0RHJhZ0Ryb3AgPSByZXF1aXJlKCcuL2RyYWdkcm9wJykuaW5pdERyYWdEcm9wO1xudmFyIGluaXRQbGF5U2FtcGxlID0gcmVxdWlyZSgnLi9wbGF5c2FtcGxlJykuaW5pdFBsYXlTYW1wbGU7XG52YXIgaW5pdFJlY29yZEJ1dHRvbiA9IHJlcXVpcmUoJy4vcmVjb3JkYnV0dG9uJykuaW5pdFJlY29yZEJ1dHRvbjtcbnZhciBpbml0RmlsZVVwbG9hZCA9IHJlcXVpcmUoJy4vZmlsZXVwbG9hZCcpLmluaXRGaWxlVXBsb2FkO1xudmFyIGluaXREaXNwbGF5TWV0YWRhdGEgPSByZXF1aXJlKCcuL2Rpc3BsYXltZXRhZGF0YScpLmluaXREaXNwbGF5TWV0YWRhdGE7XG5cblxuZXhwb3J0cy5pbml0Vmlld3MgPSBmdW5jdGlvbihjdHgpIHtcbiAgY29uc29sZS5sb2coJ0luaXRpYWxpemluZyB2aWV3cy4uLicpO1xuICBpbml0U2VsZWN0TW9kZWwoY3R4KTtcbiAgaW5pdFBsYXlTYW1wbGUoY3R4KTtcbiAgaW5pdERyYWdEcm9wKGN0eCk7XG4gIGluaXRSZWNvcmRCdXR0b24oY3R4KTtcbiAgaW5pdEZpbGVVcGxvYWQoY3R4KTtcbiAgaW5pdFNlc3Npb25QZXJtaXNzaW9ucygpO1xuICBpbml0U2hvd1RhYigpO1xuICBpbml0QW5pbWF0ZVBhbmVsKCk7XG4gIGluaXRTaG93VGFiKCk7XG4gIGluaXREaXNwbGF5TWV0YWRhdGEoKTtcbn1cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIG9uRmlsZVByb2dyZXNzID0gdXRpbHMub25GaWxlUHJvZ3Jlc3M7XG52YXIgaGFuZGxlRmlsZVVwbG9hZCA9IHJlcXVpcmUoJy4uL2hhbmRsZWZpbGV1cGxvYWQnKS5oYW5kbGVGaWxlVXBsb2FkO1xudmFyIGluaXRTb2NrZXQgPSByZXF1aXJlKCcuLi9zb2NrZXQnKS5pbml0U29ja2V0O1xudmFyIHNob3dFcnJvciA9IHJlcXVpcmUoJy4vc2hvd2Vycm9yJykuc2hvd0Vycm9yO1xudmFyIGVmZmVjdHMgPSByZXF1aXJlKCcuL2VmZmVjdHMnKTtcblxuXG52YXIgTE9PS1VQX1RBQkxFID0ge1xuICAnZW4tVVNfQnJvYWRiYW5kTW9kZWwnOiBbJ1VzX0VuZ2xpc2hfQnJvYWRiYW5kX1NhbXBsZV8xLndhdicsICdVc19FbmdsaXNoX0Jyb2FkYmFuZF9TYW1wbGVfMi53YXYnXSxcbiAgJ2VuLVVTX05hcnJvd2JhbmRNb2RlbCc6IFsnVXNfRW5nbGlzaF9OYXJyb3diYW5kX1NhbXBsZV8xLndhdicsICdVc19FbmdsaXNoX05hcnJvd2JhbmRfU2FtcGxlXzIud2F2J10sXG4gICdlcy1FU19Ccm9hZGJhbmRNb2RlbCc6IFsnRXNfRVNfc3BrMjRfMTZraHoud2F2JywgJ0VzX0VTX3NwazE5XzE2a2h6LndhdiddLFxuICAnZXMtRVNfTmFycm93YmFuZE1vZGVsJzogWydFc19FU19zcGsyNF84a2h6LndhdicsICdFc19FU19zcGsxOV84a2h6LndhdiddLFxuICAnamEtSlBfQnJvYWRiYW5kTW9kZWwnOiBbJ3NhbXBsZS1KYV9KUC13aWRlMS53YXYnLCAnc2FtcGxlLUphX0pQLXdpZGUyLndhdiddLFxuICAnamEtSlBfTmFycm93YmFuZE1vZGVsJzogWydzYW1wbGUtSmFfSlAtbmFycm93My53YXYnLCAnc2FtcGxlLUphX0pQLW5hcnJvdzQud2F2J10sXG4gICdwdC1CUl9Ccm9hZGJhbmRNb2RlbCc6IFsncHQtQlJfU2FtcGxlMS0xNktIei53YXYnLCAncHQtQlJfU2FtcGxlMi0xNktIei53YXYnXSxcbiAgJ3B0LUJSX05hcnJvd2JhbmRNb2RlbCc6IFsncHQtQlJfU2FtcGxlMS04S0h6LndhdicsICdwdC1CUl9TYW1wbGUyLThLSHoud2F2J10sXG4gICd6aC1DTl9Ccm9hZGJhbmRNb2RlbCc6IFsnemgtQ05fc2FtcGxlMV9mb3JfMTZrLndhdicsICd6aC1DTl9zYW1wbGUyX2Zvcl8xNmsud2F2J10sXG4gICd6aC1DTl9OYXJyb3diYW5kTW9kZWwnOiBbJ3poLUNOX3NhbXBsZTFfZm9yXzhrLndhdicsICd6aC1DTl9zYW1wbGUyX2Zvcl84ay53YXYnXSAgXG59O1xuXG52YXIgcGxheVNhbXBsZSA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgcnVubmluZyA9IGZhbHNlO1xuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcblxuICByZXR1cm4gZnVuY3Rpb24odG9rZW4sIGltYWdlVGFnLCBpY29uTmFtZSwgdXJsLCBjYWxsYmFjaykge1xuXG4gICAgJC5wdWJsaXNoKCdjbGVhcnNjcmVlbicpO1xuXG4gICAgdmFyIGN1cnJlbnRseURpc3BsYXlpbmcgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJykpO1xuXG4gICAgY29uc29sZS5sb2coJ0NVUlJFTlRMWSBESVNQTEFZSU5HJywgY3VycmVudGx5RGlzcGxheWluZyk7XG5cbiAgICAvLyBUaGlzIGVycm9yIGhhbmRsaW5nIG5lZWRzIHRvIGJlIGV4cGFuZGVkIHRvIGFjY29tb2RhdGVcbiAgICAvLyB0aGUgdHdvIGRpZmZlcmVudCBwbGF5IHNhbXBsZXMgZmlsZXNcbiAgICBpZiAoY3VycmVudGx5RGlzcGxheWluZykge1xuICAgICAgY29uc29sZS5sb2coJ0hBUkQgU09DS0VUIFNUT1AnKTtcbiAgICAgICQucHVibGlzaCgnc29ja2V0c3RvcCcpO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCBmYWxzZSk7XG4gICAgICBlZmZlY3RzLnN0b3BUb2dnbGVJbWFnZSh0aW1lciwgaW1hZ2VUYWcsIGljb25OYW1lKTtcbiAgICAgIGVmZmVjdHMucmVzdG9yZUltYWdlKGltYWdlVGFnLCBpY29uTmFtZSk7XG4gICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRseURpc3BsYXlpbmcgJiYgcnVubmluZykge1xuICAgICAgc2hvd0Vycm9yKCdDdXJyZW50bHkgYW5vdGhlciBmaWxlIGlzIHBsYXlpbmcsIHBsZWFzZSBzdG9wIHRoZSBmaWxlIG9yIHdhaXQgdW50aWwgaXQgZmluaXNoZXMnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIHRydWUpO1xuICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgIFxuICAgICQoJyNyZXN1bHRzVGV4dCcpLnZhbCgnJyk7ICAgLy8gY2xlYXIgaHlwb3RoZXNlcyBmcm9tIHByZXZpb3VzIHJ1bnNcblxuICAgIHZhciB0aW1lciA9IHNldEludGVydmFsKGVmZmVjdHMudG9nZ2xlSW1hZ2UsIDc1MCwgaW1hZ2VUYWcsIGljb25OYW1lKTtcblxuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgYmxvYiA9IHhoci5yZXNwb25zZTtcbiAgICAgIHZhciBjdXJyZW50TW9kZWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudE1vZGVsJykgfHwgJ2VuLVVTX0Jyb2FkYmFuZE1vZGVsJztcbiAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgdmFyIGJsb2JUb1RleHQgPSBuZXcgQmxvYihbYmxvYl0pLnNsaWNlKDAsIDQpO1xuICAgICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYlRvVGV4dCk7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb250ZW50VHlwZSA9IHJlYWRlci5yZXN1bHQgPT09ICdmTGFDJyA/ICdhdWRpby9mbGFjJyA6ICdhdWRpby93YXYnO1xuICAgICAgICBjb25zb2xlLmxvZygnVXBsb2FkaW5nIGZpbGUnLCByZWFkZXIucmVzdWx0KTtcbiAgICAgICAgdmFyIG1lZGlhU291cmNlVVJMID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgIGF1ZGlvLnNyYyA9IG1lZGlhU291cmNlVVJMO1xuICAgICAgICBhdWRpby5wbGF5KCk7XG4gICAgICAgICQuc3Vic2NyaWJlKCdoYXJkc29ja2V0c3RvcCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XG4gICAgICAgICAgYXVkaW8uY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB9KTtcbiAgICAgICAgJC5zdWJzY3JpYmUoJ3NvY2tldHN0b3AnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBhdWRpby5wYXVzZSgpO1xuICAgICAgICAgIGF1ZGlvLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGhhbmRsZUZpbGVVcGxvYWQodG9rZW4sIGN1cnJlbnRNb2RlbCwgYmxvYiwgY29udGVudFR5cGUsIGZ1bmN0aW9uKHNvY2tldCkge1xuICAgICAgICAgIHZhciBwYXJzZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICBmaWxlOiBibG9iXG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgc2FtcGxpbmdSYXRlID0gKGN1cnJlbnRNb2RlbC5pbmRleE9mKFwiQnJvYWRiYW5kXCIpICE9IC0xKSA/IDE2MDAwIDogODAwMDtcbiAgICAgICAgICBvbkZpbGVQcm9ncmVzcyhwYXJzZU9wdGlvbnMsXG4gICAgICAgICAgICAvLyBPbiBkYXRhIGNodW5rXG4gICAgICAgICAgICBmdW5jdGlvbihjaHVuaykge1xuICAgICAgICAgICAgICBzb2NrZXQuc2VuZChjaHVuayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gT24gZmlsZSByZWFkIGVycm9yXG4gICAgICAgICAgICBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHJlYWRpbmcgZmlsZTogJywgZXZ0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAvLyBzaG93RXJyb3IoZXZ0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIE9uIGxvYWQgZW5kXG4gICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoeydhY3Rpb24nOiAnc3RvcCd9KSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2FtcGxpbmdSYXRlXG4gICAgICAgICAgICApO1xuICAgICAgICB9LCBcbiAgICAgICAgLy8gT24gY29ubmVjdGlvbiBlbmRcbiAgICAgICAgICBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgIGVmZmVjdHMuc3RvcFRvZ2dsZUltYWdlKHRpbWVyLCBpbWFnZVRhZywgaWNvbk5hbWUpO1xuICAgICAgICAgICAgZWZmZWN0cy5yZXN0b3JlSW1hZ2UoaW1hZ2VUYWcsIGljb25OYW1lKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfTtcbiAgICB4aHIuc2VuZCgpO1xuICB9O1xufSkoKTtcblxuXG5leHBvcnRzLmluaXRQbGF5U2FtcGxlID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIHZhciBmaWxlTmFtZSA9ICdhdWRpby8nICsgTE9PS1VQX1RBQkxFW2N0eC5jdXJyZW50TW9kZWxdWzBdO1xuICAgIHZhciBlbCA9ICQoJy5wbGF5LXNhbXBsZS0xJyk7XG4gICAgZWwub2ZmKCdjbGljaycpO1xuICAgIHZhciBpY29uTmFtZSA9ICdwbGF5JztcbiAgICB2YXIgaW1hZ2VUYWcgPSBlbC5maW5kKCdpbWcnKTtcbiAgICBlbC5jbGljayggZnVuY3Rpb24oZXZ0KSB7XG4gICAgICBwbGF5U2FtcGxlKGN0eC50b2tlbiwgaW1hZ2VUYWcsIGljb25OYW1lLCBmaWxlTmFtZSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQbGF5IHNhbXBsZSByZXN1bHQnLCByZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pKGN0eCwgTE9PS1VQX1RBQkxFKTtcblxuICAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZpbGVOYW1lID0gJ2F1ZGlvLycgKyBMT09LVVBfVEFCTEVbY3R4LmN1cnJlbnRNb2RlbF1bMV07XG4gICAgdmFyIGVsID0gJCgnLnBsYXktc2FtcGxlLTInKTtcbiAgICBlbC5vZmYoJ2NsaWNrJyk7XG4gICAgdmFyIGljb25OYW1lID0gJ3BsYXknO1xuICAgIHZhciBpbWFnZVRhZyA9IGVsLmZpbmQoJ2ltZycpO1xuICAgIGVsLmNsaWNrKCBmdW5jdGlvbihldnQpIHtcbiAgICAgIHBsYXlTYW1wbGUoY3R4LnRva2VuLCBpbWFnZVRhZywgaWNvbk5hbWUsIGZpbGVOYW1lLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BsYXkgc2FtcGxlIHJlc3VsdCcsIHJlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSkoY3R4LCBMT09LVVBfVEFCTEUpO1xuXG59O1xuXG5cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWljcm9waG9uZSA9IHJlcXVpcmUoJy4uL01pY3JvcGhvbmUnKTtcbnZhciBoYW5kbGVNaWNyb3Bob25lID0gcmVxdWlyZSgnLi4vaGFuZGxlbWljcm9waG9uZScpLmhhbmRsZU1pY3JvcGhvbmU7XG52YXIgc2hvd0Vycm9yID0gcmVxdWlyZSgnLi9zaG93ZXJyb3InKS5zaG93RXJyb3I7XG52YXIgc2hvd05vdGljZSA9IHJlcXVpcmUoJy4vc2hvd2Vycm9yJykuc2hvd05vdGljZTtcblxuZXhwb3J0cy5pbml0UmVjb3JkQnV0dG9uID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgdmFyIHJlY29yZEJ1dHRvbiA9ICQoJyNyZWNvcmRCdXR0b24nKTtcblxuICByZWNvcmRCdXR0b24uY2xpY2soKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICB2YXIgdG9rZW4gPSBjdHgudG9rZW47XG4gICAgdmFyIG1pY09wdGlvbnMgPSB7XG4gICAgICBidWZmZXJTaXplOiBjdHguYnVmZmVyc2l6ZVxuICAgIH07XG4gICAgdmFyIG1pYyA9IG5ldyBNaWNyb3Bob25lKG1pY09wdGlvbnMpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGFuY2hvciBiZWhhdmlvclxuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHZhciBjdXJyZW50TW9kZWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudE1vZGVsJyk7XG4gICAgICB2YXIgY3VycmVudGx5RGlzcGxheWluZyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnKSk7XG5cbiAgICAgIGlmIChjdXJyZW50bHlEaXNwbGF5aW5nKSB7XG4gICAgICAgIHNob3dFcnJvcignQ3VycmVudGx5IGFub3RoZXIgZmlsZSBpcyBwbGF5aW5nLCBwbGVhc2Ugc3RvcCB0aGUgZmlsZSBvciB3YWl0IHVudGlsIGl0IGZpbmlzaGVzJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFydW5uaW5nKSB7XG4gICAgICAgICQoJyNyZXN1bHRzVGV4dCcpLnZhbCgnJyk7ICAgLy8gY2xlYXIgaHlwb3RoZXNlcyBmcm9tIHByZXZpb3VzIHJ1bnNcbiAgICAgICAgY29uc29sZS5sb2coJ05vdCBydW5uaW5nLCBoYW5kbGVNaWNyb3Bob25lKCknKTtcbiAgICAgICAgaGFuZGxlTWljcm9waG9uZSh0b2tlbiwgY3VycmVudE1vZGVsLCBtaWMsIGZ1bmN0aW9uKGVyciwgc29ja2V0KSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgdmFyIG1zZyA9ICdFcnJvcjogJyArIGVyci5tZXNzYWdlO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgICAgICAgIHNob3dFcnJvcihtc2cpO1xuICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWNvcmRCdXR0b24uY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJywgJyNkNzQxMDgnKTtcbiAgICAgICAgICAgIHJlY29yZEJ1dHRvbi5maW5kKCdpbWcnKS5hdHRyKCdzcmMnLCAnaW1hZ2VzL3N0b3Auc3ZnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc3RhcnRpbmcgbWljJyk7XG4gICAgICAgICAgICBtaWMucmVjb3JkKCk7XG4gICAgICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pOyAgICAgICAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnU3RvcHBpbmcgbWljcm9waG9uZSwgc2VuZGluZyBzdG9wIGFjdGlvbiBtZXNzYWdlJyk7XG4gICAgICAgIHJlY29yZEJ1dHRvbi5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICByZWNvcmRCdXR0b24uZmluZCgnaW1nJykuYXR0cignc3JjJywgJ2ltYWdlcy9taWNyb3Bob25lLnN2ZycpO1xuICAgICAgICAkLnB1Ymxpc2goJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgICAgIG1pYy5zdG9wKCk7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pKCkpO1xufSIsIlxudmFyIGluaXRQbGF5U2FtcGxlID0gcmVxdWlyZSgnLi9wbGF5c2FtcGxlJykuaW5pdFBsYXlTYW1wbGU7XG5cbmV4cG9ydHMuaW5pdFNlbGVjdE1vZGVsID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgZnVuY3Rpb24gaXNEZWZhdWx0KG1vZGVsKSB7XG4gICAgcmV0dXJuIG1vZGVsID09PSAnZW4tVVNfQnJvYWRiYW5kTW9kZWwnO1xuICB9XG5cbiAgY3R4Lm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgJChcIiNkcm9wZG93bk1lbnVMaXN0XCIpLmFwcGVuZChcbiAgICAgICQoXCI8bGk+XCIpXG4gICAgICAgIC5hdHRyKCdyb2xlJywgJ3ByZXNlbnRhdGlvbicpXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgJCgnPGE+JykuYXR0cigncm9sZScsICdtZW51LWl0ZW0nKVxuICAgICAgICAgICAgLmF0dHIoJ2hyZWYnLCAnLycpXG4gICAgICAgICAgICAuYXR0cignZGF0YS1tb2RlbCcsIG1vZGVsLm5hbWUpXG4gICAgICAgICAgICAuYXBwZW5kKG1vZGVsLmRlc2NyaXB0aW9uKVxuICAgICAgICAgIClcbiAgICAgIClcbiAgfSk7XG5cbiAgJChcIiNkcm9wZG93bk1lbnVMaXN0XCIpLmNsaWNrKGZ1bmN0aW9uKGV2dCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBjb25zb2xlLmxvZygnQ2hhbmdlIHZpZXcnLCAkKGV2dC50YXJnZXQpLnRleHQoKSk7XG4gICAgdmFyIG5ld01vZGVsRGVzY3JpcHRpb24gPSAkKGV2dC50YXJnZXQpLnRleHQoKTtcbiAgICB2YXIgbmV3TW9kZWwgPSAkKGV2dC50YXJnZXQpLmRhdGEoJ21vZGVsJyk7XG4gICAgJCgnI2Ryb3Bkb3duTWVudURlZmF1bHQnKS5lbXB0eSgpLnRleHQobmV3TW9kZWxEZXNjcmlwdGlvbik7XG4gICAgJCgnI2Ryb3Bkb3duTWVudTEnKS5kcm9wZG93bigndG9nZ2xlJyk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRNb2RlbCcsIG5ld01vZGVsKTtcbiAgICBjdHguY3VycmVudE1vZGVsID0gbmV3TW9kZWw7XG4gICAgaW5pdFBsYXlTYW1wbGUoY3R4KTtcbiAgICAkLnB1Ymxpc2goJ2NsZWFyc2NyZWVuJyk7XG4gIH0pO1xuXG59IiwiXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuaW5pdFNlc3Npb25QZXJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIHNlc3Npb24gcGVybWlzc2lvbnMgaGFuZGxlcicpO1xuICAvLyBSYWRpbyBidXR0b25zXG4gIHZhciBzZXNzaW9uUGVybWlzc2lvbnNSYWRpbyA9ICQoXCIjc2Vzc2lvblBlcm1pc3Npb25zUmFkaW9Hcm91cCBpbnB1dFt0eXBlPSdyYWRpbyddXCIpO1xuICBzZXNzaW9uUGVybWlzc2lvbnNSYWRpby5jbGljayhmdW5jdGlvbihldnQpIHtcbiAgICB2YXIgY2hlY2tlZFZhbHVlID0gc2Vzc2lvblBlcm1pc3Npb25zUmFkaW8uZmlsdGVyKCc6Y2hlY2tlZCcpLnZhbCgpO1xuICAgIGNvbnNvbGUubG9nKCdjaGVja2VkVmFsdWUnLCBjaGVja2VkVmFsdWUpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzZXNzaW9uUGVybWlzc2lvbnMnLCBjaGVja2VkVmFsdWUpO1xuICB9KTtcbn1cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLnNob3dFcnJvciA9IGZ1bmN0aW9uKG1zZykge1xuICBjb25zb2xlLmxvZygnRXJyb3I6ICcsIG1zZyk7XG4gIHZhciBlcnJvckFsZXJ0ID0gJCgnLmVycm9yLXJvdycpO1xuICBlcnJvckFsZXJ0LmhpZGUoKTtcbiAgZXJyb3JBbGVydC5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAnI2Q3NDEwOCcpO1xuICBlcnJvckFsZXJ0LmNzcygnY29sb3InLCAnd2hpdGUnKTtcbiAgdmFyIGVycm9yTWVzc2FnZSA9ICQoJyNlcnJvck1lc3NhZ2UnKTtcbiAgZXJyb3JNZXNzYWdlLnRleHQobXNnKTtcbiAgZXJyb3JBbGVydC5zaG93KCk7XG4gICQoJyNlcnJvckNsb3NlJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlcnJvckFsZXJ0LmhpZGUoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufVxuXG5leHBvcnRzLnNob3dOb3RpY2UgPSBmdW5jdGlvbihtc2cpIHtcbiAgY29uc29sZS5sb2coJ05vdGljZTogJywgbXNnKTtcbiAgdmFyIG5vdGljZUFsZXJ0ID0gJCgnLm5vdGlmaWNhdGlvbi1yb3cnKTtcbiAgbm90aWNlQWxlcnQuaGlkZSgpO1xuICBub3RpY2VBbGVydC5jc3MoJ2JvcmRlcicsICcycHggc29saWQgI2VjZWNlYycpO1xuICBub3RpY2VBbGVydC5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAnI2Y0ZjRmNCcpO1xuICBub3RpY2VBbGVydC5jc3MoJ2NvbG9yJywgJ2JsYWNrJyk7XG4gIHZhciBub3RpY2VNZXNzYWdlID0gJCgnI25vdGlmaWNhdGlvbk1lc3NhZ2UnKTtcbiAgbm90aWNlTWVzc2FnZS50ZXh0KG1zZyk7XG4gIG5vdGljZUFsZXJ0LnNob3coKTtcbiAgJCgnI25vdGlmaWNhdGlvbkNsb3NlJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBub3RpY2VBbGVydC5oaWRlKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn1cblxuZXhwb3J0cy5oaWRlRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGVycm9yQWxlcnQgPSAkKCcuZXJyb3Itcm93Jyk7XG4gIGVycm9yQWxlcnQuaGlkZSgpO1xufSIsIlxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmluaXRTaG93VGFiID0gZnVuY3Rpb24oKSB7XG5cbiAgJCgnLm5hdi10YWJzIGFbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKS5vbignc2hvd24uYnMudGFiJywgZnVuY3Rpb24gKGUpIHtcbiAgICAvL3Nob3cgc2VsZWN0ZWQgdGFiIC8gYWN0aXZlXG4gICAgdmFyIHRhcmdldCA9ICQoZS50YXJnZXQpLnRleHQoKTtcbiAgICBpZiAodGFyZ2V0ID09PSAnSlNPTicpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzaG93aW5nIGpzb24nKTtcbiAgICAgICQucHVibGlzaCgnc2hvd2pzb24nKTtcbiAgICB9XG4gIH0pO1xuXG59Il19
