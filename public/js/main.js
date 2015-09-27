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


},{"./utils":102}],95:[function(require,module,exports){
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
var handler = require('./handler');

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
      handler.onOpen(socket);
    }

    function onListening(socket) {
      console.log('Socket listening');
      callback(socket);
    }

    function onMessage(msg) {
      handler.onMessage(msg);
    }

    function onError(evt) {
      localStorage.setItem('currentlyDisplaying', false);
      onend(evt);
      console.log('Socket err: ', evt.code);
    }

    function onClose(evt) {
      localStorage.setItem('currentlyDisplaying', false);
      onend(evt);
      handler.onClose(evt);
      console.log('Socket closing: ', evt);
    }

    initSocket(options, onOpen, onListening, onMessage, onError, onClose);
}


},{"./handler":98,"./socket":101,"./views/displaymetadata":104,"./views/effects":106,"./views/showerror":113}],97:[function(require,module,exports){

'use strict';

var initSocket = require('./socket').initSocket;
var display = require('./views/displaymetadata');
var handler = require('./handler');

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
    handler.onOpen(socket);
  }

  function onListening(socket) {

    mic.onAudio = function(blob) {
      if (socket.readyState < 2) {
        socket.send(blob);
      }
    };
  }

  function onMessage(msg, socket) {
    handler.onMessage(msg);
  }

  function onError(r, socket) {
    console.log('Mic socket err: ', err);
  }

  function onClose(evt) {
    handler.onClose(evt)
  }

  initSocket(options, onOpen, onListening, onMessage, onError, onClose);
}

},{"./handler":98,"./socket":101,"./views/displaymetadata":104}],98:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var keenClient = require('./keen').client;

var beganRecording;
var speech = {};
speech.transcript = '';
speech.words = [];
var hash = '' + new Date();

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

    $('#loading-bar').css('display', 'none');
  }, 1000);
}

exports.onClose = function(evt) {
  var stoppedRecording = new Date();
  speech.duration = stoppedRecording - beganRecording;
  $('#resultsText').html(speech.transcript);
  sendSpeechToKeen(speech);
}

exports.onOpen = function(socket) {
    beganRecording = new Date();
}


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./keen":100}],99:[function(require,module,exports){
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

},{"./Microphone":94,"./data/models.json":95,"./utils":102,"./views":108}],100:[function(require,module,exports){
var Keen = require('keen-js');

exports.client = new Keen({
  projectId: "5606f3f490e4bd7b0e0e1ddc", // String (required always)
  writeKey: "2fc76068ea39562a5e3c8f3ae5c10a0588bf074246861b36fa17150bd21dd01140ac051b2bae4ae1158e217857baf73112120d4f90a72b56e4c1c97d3f4b0e248b905427cfe8182552bac3b91ae72d7d062ab20412681ac39844918a4ca2d00c4075ae048030fe8fc95212774010db65",   // String (required for sending data)
  readKey: "b2e5446a0409b73d192cc7c6c3b39ad2fc5abea3876d1885eae25f250da383497a227cfd6f69d30246065a96e621a33a2b6d22feec80a7ee4d520775552a0f09bc378ee7ec8a53d7534c4163bc5b920d7eb698554ce5b0fd8bf00de399675d454146166d1f94da22160808ce27511064"      // String (required for querying data)

  // protocol: "https",         // String (optional: https | http | auto)
  // host: "api.keen.io/3.0",   // String (optional)
  // requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
});


},{"keen-js":93}],101:[function(require,module,exports){
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
},{"./Microphone":94,"./utils":102,"./views/showerror":113}],102:[function(require,module,exports){
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

},{}],103:[function(require,module,exports){


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


},{}],104:[function(require,module,exports){
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

},{}],105:[function(require,module,exports){

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

},{"./fileupload":107}],106:[function(require,module,exports){



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

},{}],107:[function(require,module,exports){

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
},{"../handlefileupload":96,"../utils":102,"./effects":106,"./showerror":113}],108:[function(require,module,exports){

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

},{"./animatepanel":103,"./displaymetadata":104,"./dragdrop":105,"./fileupload":107,"./playsample":109,"./recordbutton":110,"./selectmodel":111,"./sessionpermissions":112,"./showtab":114}],109:[function(require,module,exports){

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



},{"../handlefileupload":96,"../socket":101,"../utils":102,"./effects":106,"./showerror":113}],110:[function(require,module,exports){

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
},{"../Microphone":94,"../handlemicrophone":97,"./showerror":113}],111:[function(require,module,exports){

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
},{"./playsample":109}],112:[function(require,module,exports){

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

},{}],113:[function(require,module,exports){

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
},{}],114:[function(require,module,exports){

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
},{}]},{},[99])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL2RvbXJlYWR5L3JlYWR5LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL2pzb24zL2xpYi9qc29uMy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL25vZGVfbW9kdWxlcy9zcGluLmpzL3NwaW4uanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9ub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9hc3luYy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2hlbHBlcnMvZ2V0LWNvbnRleHQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL2dldC1xdWVyeS1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL2dldC10aW1lem9uZS1vZmZzZXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL2dldC11cmwtbWF4LWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2hlbHBlcnMvZ2V0LXhoci1vYmplY3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9oZWxwZXJzL3N1cGVyYWdlbnQtaGFuZGxlLXJlc3BvbnNlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2NvcmUvaGVscGVycy9zdXBlcmFnZW50LXJlcXVlc3QtdHlwZXMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2xpYi9hZGRFdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL2xpYi9hZGRFdmVudHMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9saWIvZ2V0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2NvcmUvbGliL3Bvc3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9saWIvcnVuLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2NvcmUvbGliL3NldEdsb2JhbFByb3BlcnRpZXMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9saWIvdHJhY2tFeHRlcm5hbExpbmsuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS9xdWVyeS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL3JlcXVlc3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9iYXNlNjQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9jbG9uZS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL3V0aWxzL2VhY2guanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9lbWl0dGVyLXNoaW0uanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9leHRlbmQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9qc29uLXNoaW0uanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvY29yZS91dGlscy9wYXJzZVBhcmFtcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9jb3JlL3V0aWxzL3NlbmRRdWVyeS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2RhdGFzZXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9hbmFseXNlcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9hcHBlbmQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9saWIvZGVsZXRlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGFzZXQvbGliL2ZpbHRlci5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9mb3JtYXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9saWIvaW5zZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGFzZXQvbGliL3NlbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi9zZXQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC9saWIvc29ydC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L2xpYi91cGRhdGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXNldC91dGlscy9jcmVhdGUtbnVsbC1saXN0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGFzZXQvdXRpbHMvZmxhdHRlbi5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhc2V0L3V0aWxzL3BhcnNlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovYWRhcHRlcnMvYzMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9hZGFwdGVycy9jaGFydGpzLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovYWRhcHRlcnMvZ29vZ2xlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovYWRhcHRlcnMva2Vlbi1pby5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2RhdGF2aXouanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9leHRlbnNpb25zL2RyYXcuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9oZWxwZXJzL2dldEFkYXB0ZXJBY3Rpb25zLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovaGVscGVycy9nZXREYXRhc2V0U2NoZW1hcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2hlbHBlcnMvZ2V0RGVmYXVsdFRpdGxlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovaGVscGVycy9nZXRRdWVyeURhdGFUeXBlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovaW5kZXguanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvYWN0aW9ucy9kZXN0cm95LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FjdGlvbnMvZXJyb3IuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvYWN0aW9ucy9pbml0aWFsaXplLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FjdGlvbnMvcmVuZGVyLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FjdGlvbnMvdXBkYXRlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2FkYXB0ZXIuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvYXR0cmlidXRlcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9jYWxsLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2NoYXJ0T3B0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9jaGFydFR5cGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvY29sb3JNYXBwaW5nLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2NvbG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9kYXRhLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2RhdGFUeXBlLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2RlZmF1bHRDaGFydFR5cGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvZWwuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvaGVpZ2h0LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2luZGV4QnkuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvbGFiZWxNYXBwaW5nLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL2xhYmVscy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9saWJyYXJ5LmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL3BhcnNlUmF3RGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9wYXJzZVJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvcHJlcGFyZS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi9zb3J0R3JvdXBzLmpzIiwibm9kZV9tb2R1bGVzL2tlZW4tanMvc3JjL2RhdGF2aXovbGliL3NvcnRJbnRlcnZhbHMuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei9saWIvc3RhY2tlZC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi90aXRsZS5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L2xpYi93aWR0aC5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L3V0aWxzL2FwcGx5VHJhbnNmb3Jtcy5qcyIsIm5vZGVfbW9kdWxlcy9rZWVuLWpzL3NyYy9kYXRhdml6L3V0aWxzL2xvYWRTY3JpcHQuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei91dGlscy9sb2FkU3R5bGUuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMvZGF0YXZpei91dGlscy9wcmV0dHlOdW1iZXIuanMiLCJub2RlX21vZHVsZXMva2Vlbi1qcy9zcmMva2Vlbi5qcyIsInNyYy9NaWNyb3Bob25lLmpzIiwic3JjL2RhdGEvbW9kZWxzLmpzb24iLCJzcmMvaGFuZGxlZmlsZXVwbG9hZC5qcyIsInNyYy9oYW5kbGVtaWNyb3Bob25lLmpzIiwic3JjL2hhbmRsZXIuanMiLCJzcmMvaW5kZXguanMiLCJzcmMva2Vlbi5qcyIsInNyYy9zb2NrZXQuanMiLCJzcmMvdXRpbHMuanMiLCJzcmMvdmlld3MvYW5pbWF0ZXBhbmVsLmpzIiwic3JjL3ZpZXdzL2Rpc3BsYXltZXRhZGF0YS5qcyIsInNyYy92aWV3cy9kcmFnZHJvcC5qcyIsInNyYy92aWV3cy9lZmZlY3RzLmpzIiwic3JjL3ZpZXdzL2ZpbGV1cGxvYWQuanMiLCJzcmMvdmlld3MvaW5kZXguanMiLCJzcmMvdmlld3MvcGxheXNhbXBsZS5qcyIsInNyYy92aWV3cy9yZWNvcmRidXR0b24uanMiLCJzcmMvdmlld3Mvc2VsZWN0bW9kZWwuanMiLCJzcmMvdmlld3Mvc2Vzc2lvbnBlcm1pc3Npb25zLmpzIiwic3JjL3ZpZXdzL3Nob3dlcnJvci5qcyIsInNyYy92aWV3cy9zaG93dGFiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdDRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDempDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICBmdW5jdGlvbiBvbigpIHtcbiAgICB0aGlzLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCIvKiFcbiAgKiBkb21yZWFkeSAoYykgRHVzdGluIERpYXogMjAxMiAtIExpY2Vuc2UgTUlUXG4gICovXG4hZnVuY3Rpb24gKG5hbWUsIGRlZmluaXRpb24pIHtcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcpIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpXG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JykgZGVmaW5lKGRlZmluaXRpb24pXG4gIGVsc2UgdGhpc1tuYW1lXSA9IGRlZmluaXRpb24oKVxufSgnZG9tcmVhZHknLCBmdW5jdGlvbiAocmVhZHkpIHtcblxuICB2YXIgZm5zID0gW10sIGZuLCBmID0gZmFsc2VcbiAgICAsIGRvYyA9IGRvY3VtZW50XG4gICAgLCB0ZXN0RWwgPSBkb2MuZG9jdW1lbnRFbGVtZW50XG4gICAgLCBoYWNrID0gdGVzdEVsLmRvU2Nyb2xsXG4gICAgLCBkb21Db250ZW50TG9hZGVkID0gJ0RPTUNvbnRlbnRMb2FkZWQnXG4gICAgLCBhZGRFdmVudExpc3RlbmVyID0gJ2FkZEV2ZW50TGlzdGVuZXInXG4gICAgLCBvbnJlYWR5c3RhdGVjaGFuZ2UgPSAnb25yZWFkeXN0YXRlY2hhbmdlJ1xuICAgICwgcmVhZHlTdGF0ZSA9ICdyZWFkeVN0YXRlJ1xuICAgICwgbG9hZGVkUmd4ID0gaGFjayA/IC9ebG9hZGVkfF5jLyA6IC9ebG9hZGVkfGMvXG4gICAgLCBsb2FkZWQgPSBsb2FkZWRSZ3gudGVzdChkb2NbcmVhZHlTdGF0ZV0pXG5cbiAgZnVuY3Rpb24gZmx1c2goZikge1xuICAgIGxvYWRlZCA9IDFcbiAgICB3aGlsZSAoZiA9IGZucy5zaGlmdCgpKSBmKClcbiAgfVxuXG4gIGRvY1thZGRFdmVudExpc3RlbmVyXSAmJiBkb2NbYWRkRXZlbnRMaXN0ZW5lcl0oZG9tQ29udGVudExvYWRlZCwgZm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoZG9tQ29udGVudExvYWRlZCwgZm4sIGYpXG4gICAgZmx1c2goKVxuICB9LCBmKVxuXG5cbiAgaGFjayAmJiBkb2MuYXR0YWNoRXZlbnQob25yZWFkeXN0YXRlY2hhbmdlLCBmbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoL15jLy50ZXN0KGRvY1tyZWFkeVN0YXRlXSkpIHtcbiAgICAgIGRvYy5kZXRhY2hFdmVudChvbnJlYWR5c3RhdGVjaGFuZ2UsIGZuKVxuICAgICAgZmx1c2goKVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gKHJlYWR5ID0gaGFjayA/XG4gICAgZnVuY3Rpb24gKGZuKSB7XG4gICAgICBzZWxmICE9IHRvcCA/XG4gICAgICAgIGxvYWRlZCA/IGZuKCkgOiBmbnMucHVzaChmbikgOlxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRlc3RFbC5kb1Njcm9sbCgnbGVmdCcpXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHJlYWR5KGZuKSB9LCA1MClcbiAgICAgICAgICB9XG4gICAgICAgICAgZm4oKVxuICAgICAgICB9KClcbiAgICB9IDpcbiAgICBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIGxvYWRlZCA/IGZuKCkgOiBmbnMucHVzaChmbilcbiAgICB9KVxufSlcbiIsIi8qISBKU09OIHYzLjMuMiB8IGh0dHA6Ly9iZXN0aWVqcy5naXRodWIuaW8vanNvbjMgfCBDb3B5cmlnaHQgMjAxMi0yMDE0LCBLaXQgQ2FtYnJpZGdlIHwgaHR0cDovL2tpdC5taXQtbGljZW5zZS5vcmcgKi9cbjsoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgdGhlIGBkZWZpbmVgIGZ1bmN0aW9uIGV4cG9zZWQgYnkgYXN5bmNocm9ub3VzIG1vZHVsZSBsb2FkZXJzLiBUaGVcbiAgLy8gc3RyaWN0IGBkZWZpbmVgIGNoZWNrIGlzIG5lY2Vzc2FyeSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIGByLmpzYC5cbiAgdmFyIGlzTG9hZGVyID0gdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQ7XG5cbiAgLy8gQSBzZXQgb2YgdHlwZXMgdXNlZCB0byBkaXN0aW5ndWlzaCBvYmplY3RzIGZyb20gcHJpbWl0aXZlcy5cbiAgdmFyIG9iamVjdFR5cGVzID0ge1xuICAgIFwiZnVuY3Rpb25cIjogdHJ1ZSxcbiAgICBcIm9iamVjdFwiOiB0cnVlXG4gIH07XG5cbiAgLy8gRGV0ZWN0IHRoZSBgZXhwb3J0c2Agb2JqZWN0IGV4cG9zZWQgYnkgQ29tbW9uSlMgaW1wbGVtZW50YXRpb25zLlxuICB2YXIgZnJlZUV4cG9ydHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgZXhwb3J0c10gJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4gIC8vIFVzZSB0aGUgYGdsb2JhbGAgb2JqZWN0IGV4cG9zZWQgYnkgTm9kZSAoaW5jbHVkaW5nIEJyb3dzZXJpZnkgdmlhXG4gIC8vIGBpbnNlcnQtbW9kdWxlLWdsb2JhbHNgKSwgTmFyd2hhbCwgYW5kIFJpbmdvIGFzIHRoZSBkZWZhdWx0IGNvbnRleHQsXG4gIC8vIGFuZCB0aGUgYHdpbmRvd2Agb2JqZWN0IGluIGJyb3dzZXJzLiBSaGlubyBleHBvcnRzIGEgYGdsb2JhbGAgZnVuY3Rpb25cbiAgLy8gaW5zdGVhZC5cbiAgdmFyIHJvb3QgPSBvYmplY3RUeXBlc1t0eXBlb2Ygd2luZG93XSAmJiB3aW5kb3cgfHwgdGhpcyxcbiAgICAgIGZyZWVHbG9iYWwgPSBmcmVlRXhwb3J0cyAmJiBvYmplY3RUeXBlc1t0eXBlb2YgbW9kdWxlXSAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiB0eXBlb2YgZ2xvYmFsID09IFwib2JqZWN0XCIgJiYgZ2xvYmFsO1xuXG4gIGlmIChmcmVlR2xvYmFsICYmIChmcmVlR2xvYmFsW1wiZ2xvYmFsXCJdID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWxbXCJ3aW5kb3dcIl0gPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbFtcInNlbGZcIl0gPT09IGZyZWVHbG9iYWwpKSB7XG4gICAgcm9vdCA9IGZyZWVHbG9iYWw7XG4gIH1cblxuICAvLyBQdWJsaWM6IEluaXRpYWxpemVzIEpTT04gMyB1c2luZyB0aGUgZ2l2ZW4gYGNvbnRleHRgIG9iamVjdCwgYXR0YWNoaW5nIHRoZVxuICAvLyBgc3RyaW5naWZ5YCBhbmQgYHBhcnNlYCBmdW5jdGlvbnMgdG8gdGhlIHNwZWNpZmllZCBgZXhwb3J0c2Agb2JqZWN0LlxuICBmdW5jdGlvbiBydW5JbkNvbnRleHQoY29udGV4dCwgZXhwb3J0cykge1xuICAgIGNvbnRleHQgfHwgKGNvbnRleHQgPSByb290W1wiT2JqZWN0XCJdKCkpO1xuICAgIGV4cG9ydHMgfHwgKGV4cG9ydHMgPSByb290W1wiT2JqZWN0XCJdKCkpO1xuXG4gICAgLy8gTmF0aXZlIGNvbnN0cnVjdG9yIGFsaWFzZXMuXG4gICAgdmFyIE51bWJlciA9IGNvbnRleHRbXCJOdW1iZXJcIl0gfHwgcm9vdFtcIk51bWJlclwiXSxcbiAgICAgICAgU3RyaW5nID0gY29udGV4dFtcIlN0cmluZ1wiXSB8fCByb290W1wiU3RyaW5nXCJdLFxuICAgICAgICBPYmplY3QgPSBjb250ZXh0W1wiT2JqZWN0XCJdIHx8IHJvb3RbXCJPYmplY3RcIl0sXG4gICAgICAgIERhdGUgPSBjb250ZXh0W1wiRGF0ZVwiXSB8fCByb290W1wiRGF0ZVwiXSxcbiAgICAgICAgU3ludGF4RXJyb3IgPSBjb250ZXh0W1wiU3ludGF4RXJyb3JcIl0gfHwgcm9vdFtcIlN5bnRheEVycm9yXCJdLFxuICAgICAgICBUeXBlRXJyb3IgPSBjb250ZXh0W1wiVHlwZUVycm9yXCJdIHx8IHJvb3RbXCJUeXBlRXJyb3JcIl0sXG4gICAgICAgIE1hdGggPSBjb250ZXh0W1wiTWF0aFwiXSB8fCByb290W1wiTWF0aFwiXSxcbiAgICAgICAgbmF0aXZlSlNPTiA9IGNvbnRleHRbXCJKU09OXCJdIHx8IHJvb3RbXCJKU09OXCJdO1xuXG4gICAgLy8gRGVsZWdhdGUgdG8gdGhlIG5hdGl2ZSBgc3RyaW5naWZ5YCBhbmQgYHBhcnNlYCBpbXBsZW1lbnRhdGlvbnMuXG4gICAgaWYgKHR5cGVvZiBuYXRpdmVKU09OID09IFwib2JqZWN0XCIgJiYgbmF0aXZlSlNPTikge1xuICAgICAgZXhwb3J0cy5zdHJpbmdpZnkgPSBuYXRpdmVKU09OLnN0cmluZ2lmeTtcbiAgICAgIGV4cG9ydHMucGFyc2UgPSBuYXRpdmVKU09OLnBhcnNlO1xuICAgIH1cblxuICAgIC8vIENvbnZlbmllbmNlIGFsaWFzZXMuXG4gICAgdmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZSxcbiAgICAgICAgZ2V0Q2xhc3MgPSBvYmplY3RQcm90by50b1N0cmluZyxcbiAgICAgICAgaXNQcm9wZXJ0eSwgZm9yRWFjaCwgdW5kZWY7XG5cbiAgICAvLyBUZXN0IHRoZSBgRGF0ZSNnZXRVVEMqYCBtZXRob2RzLiBCYXNlZCBvbiB3b3JrIGJ5IEBZYWZmbGUuXG4gICAgdmFyIGlzRXh0ZW5kZWQgPSBuZXcgRGF0ZSgtMzUwOTgyNzMzNDU3MzI5Mik7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFRoZSBgZ2V0VVRDRnVsbFllYXJgLCBgTW9udGhgLCBhbmQgYERhdGVgIG1ldGhvZHMgcmV0dXJuIG5vbnNlbnNpY2FsXG4gICAgICAvLyByZXN1bHRzIGZvciBjZXJ0YWluIGRhdGVzIGluIE9wZXJhID49IDEwLjUzLlxuICAgICAgaXNFeHRlbmRlZCA9IGlzRXh0ZW5kZWQuZ2V0VVRDRnVsbFllYXIoKSA9PSAtMTA5MjUyICYmIGlzRXh0ZW5kZWQuZ2V0VVRDTW9udGgoKSA9PT0gMCAmJiBpc0V4dGVuZGVkLmdldFVUQ0RhdGUoKSA9PT0gMSAmJlxuICAgICAgICAvLyBTYWZhcmkgPCAyLjAuMiBzdG9yZXMgdGhlIGludGVybmFsIG1pbGxpc2Vjb25kIHRpbWUgdmFsdWUgY29ycmVjdGx5LFxuICAgICAgICAvLyBidXQgY2xpcHMgdGhlIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgZGF0ZSBtZXRob2RzIHRvIHRoZSByYW5nZSBvZlxuICAgICAgICAvLyBzaWduZWQgMzItYml0IGludGVnZXJzIChbLTIgKiogMzEsIDIgKiogMzEgLSAxXSkuXG4gICAgICAgIGlzRXh0ZW5kZWQuZ2V0VVRDSG91cnMoKSA9PSAxMCAmJiBpc0V4dGVuZGVkLmdldFVUQ01pbnV0ZXMoKSA9PSAzNyAmJiBpc0V4dGVuZGVkLmdldFVUQ1NlY29uZHMoKSA9PSA2ICYmIGlzRXh0ZW5kZWQuZ2V0VVRDTWlsbGlzZWNvbmRzKCkgPT0gNzA4O1xuICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cblxuICAgIC8vIEludGVybmFsOiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIG5hdGl2ZSBgSlNPTi5zdHJpbmdpZnlgIGFuZCBgcGFyc2VgXG4gICAgLy8gaW1wbGVtZW50YXRpb25zIGFyZSBzcGVjLWNvbXBsaWFudC4gQmFzZWQgb24gd29yayBieSBLZW4gU255ZGVyLlxuICAgIGZ1bmN0aW9uIGhhcyhuYW1lKSB7XG4gICAgICBpZiAoaGFzW25hbWVdICE9PSB1bmRlZikge1xuICAgICAgICAvLyBSZXR1cm4gY2FjaGVkIGZlYXR1cmUgdGVzdCByZXN1bHQuXG4gICAgICAgIHJldHVybiBoYXNbbmFtZV07XG4gICAgICB9XG4gICAgICB2YXIgaXNTdXBwb3J0ZWQ7XG4gICAgICBpZiAobmFtZSA9PSBcImJ1Zy1zdHJpbmctY2hhci1pbmRleFwiKSB7XG4gICAgICAgIC8vIElFIDw9IDcgZG9lc24ndCBzdXBwb3J0IGFjY2Vzc2luZyBzdHJpbmcgY2hhcmFjdGVycyB1c2luZyBzcXVhcmVcbiAgICAgICAgLy8gYnJhY2tldCBub3RhdGlvbi4gSUUgOCBvbmx5IHN1cHBvcnRzIHRoaXMgZm9yIHByaW1pdGl2ZXMuXG4gICAgICAgIGlzU3VwcG9ydGVkID0gXCJhXCJbMF0gIT0gXCJhXCI7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUgPT0gXCJqc29uXCIpIHtcbiAgICAgICAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgYm90aCBgSlNPTi5zdHJpbmdpZnlgIGFuZCBgSlNPTi5wYXJzZWAgYXJlXG4gICAgICAgIC8vIHN1cHBvcnRlZC5cbiAgICAgICAgaXNTdXBwb3J0ZWQgPSBoYXMoXCJqc29uLXN0cmluZ2lmeVwiKSAmJiBoYXMoXCJqc29uLXBhcnNlXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHZhbHVlLCBzZXJpYWxpemVkID0gJ3tcImFcIjpbMSx0cnVlLGZhbHNlLG51bGwsXCJcXFxcdTAwMDBcXFxcYlxcXFxuXFxcXGZcXFxcclxcXFx0XCJdfSc7XG4gICAgICAgIC8vIFRlc3QgYEpTT04uc3RyaW5naWZ5YC5cbiAgICAgICAgaWYgKG5hbWUgPT0gXCJqc29uLXN0cmluZ2lmeVwiKSB7XG4gICAgICAgICAgdmFyIHN0cmluZ2lmeSA9IGV4cG9ydHMuc3RyaW5naWZ5LCBzdHJpbmdpZnlTdXBwb3J0ZWQgPSB0eXBlb2Ygc3RyaW5naWZ5ID09IFwiZnVuY3Rpb25cIiAmJiBpc0V4dGVuZGVkO1xuICAgICAgICAgIGlmIChzdHJpbmdpZnlTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgIC8vIEEgdGVzdCBmdW5jdGlvbiBvYmplY3Qgd2l0aCBhIGN1c3RvbSBgdG9KU09OYCBtZXRob2QuXG4gICAgICAgICAgICAodmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfSkudG9KU09OID0gdmFsdWU7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzdHJpbmdpZnlTdXBwb3J0ZWQgPVxuICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggMy4xYjEgYW5kIGIyIHNlcmlhbGl6ZSBzdHJpbmcsIG51bWJlciwgYW5kIGJvb2xlYW5cbiAgICAgICAgICAgICAgICAvLyBwcmltaXRpdmVzIGFzIG9iamVjdCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoMCkgPT09IFwiMFwiICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIGIyLCBhbmQgSlNPTiAyIHNlcmlhbGl6ZSB3cmFwcGVkIHByaW1pdGl2ZXMgYXMgb2JqZWN0XG4gICAgICAgICAgICAgICAgLy8gbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBOdW1iZXIoKSkgPT09IFwiMFwiICYmXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBTdHJpbmcoKSkgPT0gJ1wiXCInICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIDIgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIHZhbHVlIGlzIGBudWxsYCwgYHVuZGVmaW5lZGAsIG9yXG4gICAgICAgICAgICAgICAgLy8gZG9lcyBub3QgZGVmaW5lIGEgY2Fub25pY2FsIEpTT04gcmVwcmVzZW50YXRpb24gKHRoaXMgYXBwbGllcyB0b1xuICAgICAgICAgICAgICAgIC8vIG9iamVjdHMgd2l0aCBgdG9KU09OYCBwcm9wZXJ0aWVzIGFzIHdlbGwsICp1bmxlc3MqIHRoZXkgYXJlIG5lc3RlZFxuICAgICAgICAgICAgICAgIC8vIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkpLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShnZXRDbGFzcykgPT09IHVuZGVmICYmXG4gICAgICAgICAgICAgICAgLy8gSUUgOCBzZXJpYWxpemVzIGB1bmRlZmluZWRgIGFzIGBcInVuZGVmaW5lZFwiYC4gU2FmYXJpIDw9IDUuMS43IGFuZFxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIzIHBhc3MgdGhpcyB0ZXN0LlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeSh1bmRlZikgPT09IHVuZGVmICYmXG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIDw9IDUuMS43IGFuZCBGRiAzLjFiMyB0aHJvdyBgRXJyb3JgcyBhbmQgYFR5cGVFcnJvcmBzLFxuICAgICAgICAgICAgICAgIC8vIHJlc3BlY3RpdmVseSwgaWYgdGhlIHZhbHVlIGlzIG9taXR0ZWQgZW50aXJlbHkuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KCkgPT09IHVuZGVmICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIDIgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGdpdmVuIHZhbHVlIGlzIG5vdCBhIG51bWJlcixcbiAgICAgICAgICAgICAgICAvLyBzdHJpbmcsIGFycmF5LCBvYmplY3QsIEJvb2xlYW4sIG9yIGBudWxsYCBsaXRlcmFsLiBUaGlzIGFwcGxpZXMgdG9cbiAgICAgICAgICAgICAgICAvLyBvYmplY3RzIHdpdGggY3VzdG9tIGB0b0pTT05gIG1ldGhvZHMgYXMgd2VsbCwgdW5sZXNzIHRoZXkgYXJlIG5lc3RlZFxuICAgICAgICAgICAgICAgIC8vIGluc2lkZSBvYmplY3Qgb3IgYXJyYXkgbGl0ZXJhbHMuIFlVSSAzLjAuMGIxIGlnbm9yZXMgY3VzdG9tIGB0b0pTT05gXG4gICAgICAgICAgICAgICAgLy8gbWV0aG9kcyBlbnRpcmVseS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkodmFsdWUpID09PSBcIjFcIiAmJlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShbdmFsdWVdKSA9PSBcIlsxXVwiICYmXG4gICAgICAgICAgICAgICAgLy8gUHJvdG90eXBlIDw9IDEuNi4xIHNlcmlhbGl6ZXMgYFt1bmRlZmluZWRdYCBhcyBgXCJbXVwiYCBpbnN0ZWFkIG9mXG4gICAgICAgICAgICAgICAgLy8gYFwiW251bGxdXCJgLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShbdW5kZWZdKSA9PSBcIltudWxsXVwiICYmXG4gICAgICAgICAgICAgICAgLy8gWVVJIDMuMC4wYjEgZmFpbHMgdG8gc2VyaWFsaXplIGBudWxsYCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobnVsbCkgPT0gXCJudWxsXCIgJiZcbiAgICAgICAgICAgICAgICAvLyBGRiAzLjFiMSwgMiBoYWx0cyBzZXJpYWxpemF0aW9uIGlmIGFuIGFycmF5IGNvbnRhaW5zIGEgZnVuY3Rpb246XG4gICAgICAgICAgICAgICAgLy8gYFsxLCB0cnVlLCBnZXRDbGFzcywgMV1gIHNlcmlhbGl6ZXMgYXMgXCJbMSx0cnVlLF0sXCIuIEZGIDMuMWIzXG4gICAgICAgICAgICAgICAgLy8gZWxpZGVzIG5vbi1KU09OIHZhbHVlcyBmcm9tIG9iamVjdHMgYW5kIGFycmF5cywgdW5sZXNzIHRoZXlcbiAgICAgICAgICAgICAgICAvLyBkZWZpbmUgY3VzdG9tIGB0b0pTT05gIG1ldGhvZHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KFt1bmRlZiwgZ2V0Q2xhc3MsIG51bGxdKSA9PSBcIltudWxsLG51bGwsbnVsbF1cIiAmJlxuICAgICAgICAgICAgICAgIC8vIFNpbXBsZSBzZXJpYWxpemF0aW9uIHRlc3QuIEZGIDMuMWIxIHVzZXMgVW5pY29kZSBlc2NhcGUgc2VxdWVuY2VzXG4gICAgICAgICAgICAgICAgLy8gd2hlcmUgY2hhcmFjdGVyIGVzY2FwZSBjb2RlcyBhcmUgZXhwZWN0ZWQgKGUuZy4sIGBcXGJgID0+IGBcXHUwMDA4YCkuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KHsgXCJhXCI6IFt2YWx1ZSwgdHJ1ZSwgZmFsc2UsIG51bGwsIFwiXFx4MDBcXGJcXG5cXGZcXHJcXHRcIl0gfSkgPT0gc2VyaWFsaXplZCAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxIGFuZCBiMiBpZ25vcmUgdGhlIGBmaWx0ZXJgIGFuZCBgd2lkdGhgIGFyZ3VtZW50cy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobnVsbCwgdmFsdWUpID09PSBcIjFcIiAmJlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShbMSwgMl0sIG51bGwsIDEpID09IFwiW1xcbiAxLFxcbiAyXFxuXVwiICYmXG4gICAgICAgICAgICAgICAgLy8gSlNPTiAyLCBQcm90b3R5cGUgPD0gMS43LCBhbmQgb2xkZXIgV2ViS2l0IGJ1aWxkcyBpbmNvcnJlY3RseVxuICAgICAgICAgICAgICAgIC8vIHNlcmlhbGl6ZSBleHRlbmRlZCB5ZWFycy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoLTguNjRlMTUpKSA9PSAnXCItMjcxODIxLTA0LTIwVDAwOjAwOjAwLjAwMFpcIicgJiZcbiAgICAgICAgICAgICAgICAvLyBUaGUgbWlsbGlzZWNvbmRzIGFyZSBvcHRpb25hbCBpbiBFUyA1LCBidXQgcmVxdWlyZWQgaW4gNS4xLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgRGF0ZSg4LjY0ZTE1KSkgPT0gJ1wiKzI3NTc2MC0wOS0xM1QwMDowMDowMC4wMDBaXCInICYmXG4gICAgICAgICAgICAgICAgLy8gRmlyZWZveCA8PSAxMS4wIGluY29ycmVjdGx5IHNlcmlhbGl6ZXMgeWVhcnMgcHJpb3IgdG8gMCBhcyBuZWdhdGl2ZVxuICAgICAgICAgICAgICAgIC8vIGZvdXItZGlnaXQgeWVhcnMgaW5zdGVhZCBvZiBzaXgtZGlnaXQgeWVhcnMuIENyZWRpdHM6IEBZYWZmbGUuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBEYXRlKC02MjE5ODc1NTJlNSkpID09ICdcIi0wMDAwMDEtMDEtMDFUMDA6MDA6MDAuMDAwWlwiJyAmJlxuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSA8PSA1LjEuNSBhbmQgT3BlcmEgPj0gMTAuNTMgaW5jb3JyZWN0bHkgc2VyaWFsaXplIG1pbGxpc2Vjb25kXG4gICAgICAgICAgICAgICAgLy8gdmFsdWVzIGxlc3MgdGhhbiAxMDAwLiBDcmVkaXRzOiBAWWFmZmxlLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgRGF0ZSgtMSkpID09ICdcIjE5NjktMTItMzFUMjM6NTk6NTkuOTk5WlwiJztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICBzdHJpbmdpZnlTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaXNTdXBwb3J0ZWQgPSBzdHJpbmdpZnlTdXBwb3J0ZWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGVzdCBgSlNPTi5wYXJzZWAuXG4gICAgICAgIGlmIChuYW1lID09IFwianNvbi1wYXJzZVwiKSB7XG4gICAgICAgICAgdmFyIHBhcnNlID0gZXhwb3J0cy5wYXJzZTtcbiAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIGIyIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGEgYmFyZSBsaXRlcmFsIGlzIHByb3ZpZGVkLlxuICAgICAgICAgICAgICAvLyBDb25mb3JtaW5nIGltcGxlbWVudGF0aW9ucyBzaG91bGQgYWxzbyBjb2VyY2UgdGhlIGluaXRpYWwgYXJndW1lbnQgdG9cbiAgICAgICAgICAgICAgLy8gYSBzdHJpbmcgcHJpb3IgdG8gcGFyc2luZy5cbiAgICAgICAgICAgICAgaWYgKHBhcnNlKFwiMFwiKSA9PT0gMCAmJiAhcGFyc2UoZmFsc2UpKSB7XG4gICAgICAgICAgICAgICAgLy8gU2ltcGxlIHBhcnNpbmcgdGVzdC5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHBhcnNlKHNlcmlhbGl6ZWQpO1xuICAgICAgICAgICAgICAgIHZhciBwYXJzZVN1cHBvcnRlZCA9IHZhbHVlW1wiYVwiXS5sZW5ndGggPT0gNSAmJiB2YWx1ZVtcImFcIl1bMF0gPT09IDE7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTYWZhcmkgPD0gNS4xLjIgYW5kIEZGIDMuMWIxIGFsbG93IHVuZXNjYXBlZCB0YWJzIGluIHN0cmluZ3MuXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlU3VwcG9ydGVkID0gIXBhcnNlKCdcIlxcdFwiJyk7XG4gICAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG4gICAgICAgICAgICAgICAgICBpZiAocGFyc2VTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBGRiA0LjAgYW5kIDQuMC4xIGFsbG93IGxlYWRpbmcgYCtgIHNpZ25zIGFuZCBsZWFkaW5nXG4gICAgICAgICAgICAgICAgICAgICAgLy8gZGVjaW1hbCBwb2ludHMuIEZGIDQuMCwgNC4wLjEsIGFuZCBJRSA5LTEwIGFsc28gYWxsb3dcbiAgICAgICAgICAgICAgICAgICAgICAvLyBjZXJ0YWluIG9jdGFsIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlU3VwcG9ydGVkID0gcGFyc2UoXCIwMVwiKSAhPT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7fVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gRkYgNC4wLCA0LjAuMSwgYW5kIFJoaW5vIDEuN1IzLVI0IGFsbG93IHRyYWlsaW5nIGRlY2ltYWxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBwb2ludHMuIFRoZXNlIGVudmlyb25tZW50cywgYWxvbmcgd2l0aCBGRiAzLjFiMSBhbmQgMixcbiAgICAgICAgICAgICAgICAgICAgICAvLyBhbHNvIGFsbG93IHRyYWlsaW5nIGNvbW1hcyBpbiBKU09OIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9IHBhcnNlKFwiMS5cIikgIT09IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpc1N1cHBvcnRlZCA9IHBhcnNlU3VwcG9ydGVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzW25hbWVdID0gISFpc1N1cHBvcnRlZDtcbiAgICB9XG5cbiAgICBpZiAoIWhhcyhcImpzb25cIikpIHtcbiAgICAgIC8vIENvbW1vbiBgW1tDbGFzc11dYCBuYW1lIGFsaWFzZXMuXG4gICAgICB2YXIgZnVuY3Rpb25DbGFzcyA9IFwiW29iamVjdCBGdW5jdGlvbl1cIixcbiAgICAgICAgICBkYXRlQ2xhc3MgPSBcIltvYmplY3QgRGF0ZV1cIixcbiAgICAgICAgICBudW1iZXJDbGFzcyA9IFwiW29iamVjdCBOdW1iZXJdXCIsXG4gICAgICAgICAgc3RyaW5nQ2xhc3MgPSBcIltvYmplY3QgU3RyaW5nXVwiLFxuICAgICAgICAgIGFycmF5Q2xhc3MgPSBcIltvYmplY3QgQXJyYXldXCIsXG4gICAgICAgICAgYm9vbGVhbkNsYXNzID0gXCJbb2JqZWN0IEJvb2xlYW5dXCI7XG5cbiAgICAgIC8vIERldGVjdCBpbmNvbXBsZXRlIHN1cHBvcnQgZm9yIGFjY2Vzc2luZyBzdHJpbmcgY2hhcmFjdGVycyBieSBpbmRleC5cbiAgICAgIHZhciBjaGFySW5kZXhCdWdneSA9IGhhcyhcImJ1Zy1zdHJpbmctY2hhci1pbmRleFwiKTtcblxuICAgICAgLy8gRGVmaW5lIGFkZGl0aW9uYWwgdXRpbGl0eSBtZXRob2RzIGlmIHRoZSBgRGF0ZWAgbWV0aG9kcyBhcmUgYnVnZ3kuXG4gICAgICBpZiAoIWlzRXh0ZW5kZWQpIHtcbiAgICAgICAgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbiAgICAgICAgLy8gQSBtYXBwaW5nIGJldHdlZW4gdGhlIG1vbnRocyBvZiB0aGUgeWVhciBhbmQgdGhlIG51bWJlciBvZiBkYXlzIGJldHdlZW5cbiAgICAgICAgLy8gSmFudWFyeSAxc3QgYW5kIHRoZSBmaXJzdCBvZiB0aGUgcmVzcGVjdGl2ZSBtb250aC5cbiAgICAgICAgdmFyIE1vbnRocyA9IFswLCAzMSwgNTksIDkwLCAxMjAsIDE1MSwgMTgxLCAyMTIsIDI0MywgMjczLCAzMDQsIDMzNF07XG4gICAgICAgIC8vIEludGVybmFsOiBDYWxjdWxhdGVzIHRoZSBudW1iZXIgb2YgZGF5cyBiZXR3ZWVuIHRoZSBVbml4IGVwb2NoIGFuZCB0aGVcbiAgICAgICAgLy8gZmlyc3QgZGF5IG9mIHRoZSBnaXZlbiBtb250aC5cbiAgICAgICAgdmFyIGdldERheSA9IGZ1bmN0aW9uICh5ZWFyLCBtb250aCkge1xuICAgICAgICAgIHJldHVybiBNb250aHNbbW9udGhdICsgMzY1ICogKHllYXIgLSAxOTcwKSArIGZsb29yKCh5ZWFyIC0gMTk2OSArIChtb250aCA9ICsobW9udGggPiAxKSkpIC8gNCkgLSBmbG9vcigoeWVhciAtIDE5MDEgKyBtb250aCkgLyAxMDApICsgZmxvb3IoKHllYXIgLSAxNjAxICsgbW9udGgpIC8gNDAwKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gSW50ZXJuYWw6IERldGVybWluZXMgaWYgYSBwcm9wZXJ0eSBpcyBhIGRpcmVjdCBwcm9wZXJ0eSBvZiB0aGUgZ2l2ZW5cbiAgICAgIC8vIG9iamVjdC4gRGVsZWdhdGVzIHRvIHRoZSBuYXRpdmUgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAgbWV0aG9kLlxuICAgICAgaWYgKCEoaXNQcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5KSkge1xuICAgICAgICBpc1Byb3BlcnR5ID0gZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgdmFyIG1lbWJlcnMgPSB7fSwgY29uc3RydWN0b3I7XG4gICAgICAgICAgaWYgKChtZW1iZXJzLl9fcHJvdG9fXyA9IG51bGwsIG1lbWJlcnMuX19wcm90b19fID0ge1xuICAgICAgICAgICAgLy8gVGhlICpwcm90byogcHJvcGVydHkgY2Fubm90IGJlIHNldCBtdWx0aXBsZSB0aW1lcyBpbiByZWNlbnRcbiAgICAgICAgICAgIC8vIHZlcnNpb25zIG9mIEZpcmVmb3ggYW5kIFNlYU1vbmtleS5cbiAgICAgICAgICAgIFwidG9TdHJpbmdcIjogMVxuICAgICAgICAgIH0sIG1lbWJlcnMpLnRvU3RyaW5nICE9IGdldENsYXNzKSB7XG4gICAgICAgICAgICAvLyBTYWZhcmkgPD0gMi4wLjMgZG9lc24ndCBpbXBsZW1lbnQgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAsIGJ1dFxuICAgICAgICAgICAgLy8gc3VwcG9ydHMgdGhlIG11dGFibGUgKnByb3RvKiBwcm9wZXJ0eS5cbiAgICAgICAgICAgIGlzUHJvcGVydHkgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgLy8gQ2FwdHVyZSBhbmQgYnJlYWsgdGhlIG9iamVjdCdzIHByb3RvdHlwZSBjaGFpbiAoc2VlIHNlY3Rpb24gOC42LjJcbiAgICAgICAgICAgICAgLy8gb2YgdGhlIEVTIDUuMSBzcGVjKS4gVGhlIHBhcmVudGhlc2l6ZWQgZXhwcmVzc2lvbiBwcmV2ZW50cyBhblxuICAgICAgICAgICAgICAvLyB1bnNhZmUgdHJhbnNmb3JtYXRpb24gYnkgdGhlIENsb3N1cmUgQ29tcGlsZXIuXG4gICAgICAgICAgICAgIHZhciBvcmlnaW5hbCA9IHRoaXMuX19wcm90b19fLCByZXN1bHQgPSBwcm9wZXJ0eSBpbiAodGhpcy5fX3Byb3RvX18gPSBudWxsLCB0aGlzKTtcbiAgICAgICAgICAgICAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgcHJvdG90eXBlIGNoYWluLlxuICAgICAgICAgICAgICB0aGlzLl9fcHJvdG9fXyA9IG9yaWdpbmFsO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQ2FwdHVyZSBhIHJlZmVyZW5jZSB0byB0aGUgdG9wLWxldmVsIGBPYmplY3RgIGNvbnN0cnVjdG9yLlxuICAgICAgICAgICAgY29uc3RydWN0b3IgPSBtZW1iZXJzLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgLy8gVXNlIHRoZSBgY29uc3RydWN0b3JgIHByb3BlcnR5IHRvIHNpbXVsYXRlIGBPYmplY3QjaGFzT3duUHJvcGVydHlgIGluXG4gICAgICAgICAgICAvLyBvdGhlciBlbnZpcm9ubWVudHMuXG4gICAgICAgICAgICBpc1Byb3BlcnR5ID0gZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgIHZhciBwYXJlbnQgPSAodGhpcy5jb25zdHJ1Y3RvciB8fCBjb25zdHJ1Y3RvcikucHJvdG90eXBlO1xuICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydHkgaW4gdGhpcyAmJiAhKHByb3BlcnR5IGluIHBhcmVudCAmJiB0aGlzW3Byb3BlcnR5XSA9PT0gcGFyZW50W3Byb3BlcnR5XSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBtZW1iZXJzID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gaXNQcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gSW50ZXJuYWw6IE5vcm1hbGl6ZXMgdGhlIGBmb3IuLi5pbmAgaXRlcmF0aW9uIGFsZ29yaXRobSBhY3Jvc3NcbiAgICAgIC8vIGVudmlyb25tZW50cy4gRWFjaCBlbnVtZXJhdGVkIGtleSBpcyB5aWVsZGVkIHRvIGEgYGNhbGxiYWNrYCBmdW5jdGlvbi5cbiAgICAgIGZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2l6ZSA9IDAsIFByb3BlcnRpZXMsIG1lbWJlcnMsIHByb3BlcnR5O1xuXG4gICAgICAgIC8vIFRlc3RzIGZvciBidWdzIGluIHRoZSBjdXJyZW50IGVudmlyb25tZW50J3MgYGZvci4uLmluYCBhbGdvcml0aG0uIFRoZVxuICAgICAgICAvLyBgdmFsdWVPZmAgcHJvcGVydHkgaW5oZXJpdHMgdGhlIG5vbi1lbnVtZXJhYmxlIGZsYWcgZnJvbVxuICAgICAgICAvLyBgT2JqZWN0LnByb3RvdHlwZWAgaW4gb2xkZXIgdmVyc2lvbnMgb2YgSUUsIE5ldHNjYXBlLCBhbmQgTW96aWxsYS5cbiAgICAgICAgKFByb3BlcnRpZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy52YWx1ZU9mID0gMDtcbiAgICAgICAgfSkucHJvdG90eXBlLnZhbHVlT2YgPSAwO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgb3ZlciBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgYFByb3BlcnRpZXNgIGNsYXNzLlxuICAgICAgICBtZW1iZXJzID0gbmV3IFByb3BlcnRpZXMoKTtcbiAgICAgICAgZm9yIChwcm9wZXJ0eSBpbiBtZW1iZXJzKSB7XG4gICAgICAgICAgLy8gSWdub3JlIGFsbCBwcm9wZXJ0aWVzIGluaGVyaXRlZCBmcm9tIGBPYmplY3QucHJvdG90eXBlYC5cbiAgICAgICAgICBpZiAoaXNQcm9wZXJ0eS5jYWxsKG1lbWJlcnMsIHByb3BlcnR5KSkge1xuICAgICAgICAgICAgc2l6ZSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBQcm9wZXJ0aWVzID0gbWVtYmVycyA9IG51bGw7XG5cbiAgICAgICAgLy8gTm9ybWFsaXplIHRoZSBpdGVyYXRpb24gYWxnb3JpdGhtLlxuICAgICAgICBpZiAoIXNpemUpIHtcbiAgICAgICAgICAvLyBBIGxpc3Qgb2Ygbm9uLWVudW1lcmFibGUgcHJvcGVydGllcyBpbmhlcml0ZWQgZnJvbSBgT2JqZWN0LnByb3RvdHlwZWAuXG4gICAgICAgICAgbWVtYmVycyA9IFtcInZhbHVlT2ZcIiwgXCJ0b1N0cmluZ1wiLCBcInRvTG9jYWxlU3RyaW5nXCIsIFwicHJvcGVydHlJc0VudW1lcmFibGVcIiwgXCJpc1Byb3RvdHlwZU9mXCIsIFwiaGFzT3duUHJvcGVydHlcIiwgXCJjb25zdHJ1Y3RvclwiXTtcbiAgICAgICAgICAvLyBJRSA8PSA4LCBNb3ppbGxhIDEuMCwgYW5kIE5ldHNjYXBlIDYuMiBpZ25vcmUgc2hhZG93ZWQgbm9uLWVudW1lcmFibGVcbiAgICAgICAgICAvLyBwcm9wZXJ0aWVzLlxuICAgICAgICAgIGZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGlzRnVuY3Rpb24gPSBnZXRDbGFzcy5jYWxsKG9iamVjdCkgPT0gZnVuY3Rpb25DbGFzcywgcHJvcGVydHksIGxlbmd0aDtcbiAgICAgICAgICAgIHZhciBoYXNQcm9wZXJ0eSA9ICFpc0Z1bmN0aW9uICYmIHR5cGVvZiBvYmplY3QuY29uc3RydWN0b3IgIT0gXCJmdW5jdGlvblwiICYmIG9iamVjdFR5cGVzW3R5cGVvZiBvYmplY3QuaGFzT3duUHJvcGVydHldICYmIG9iamVjdC5oYXNPd25Qcm9wZXJ0eSB8fCBpc1Byb3BlcnR5O1xuICAgICAgICAgICAgZm9yIChwcm9wZXJ0eSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgLy8gR2Vja28gPD0gMS4wIGVudW1lcmF0ZXMgdGhlIGBwcm90b3R5cGVgIHByb3BlcnR5IG9mIGZ1bmN0aW9ucyB1bmRlclxuICAgICAgICAgICAgICAvLyBjZXJ0YWluIGNvbmRpdGlvbnM7IElFIGRvZXMgbm90LlxuICAgICAgICAgICAgICBpZiAoIShpc0Z1bmN0aW9uICYmIHByb3BlcnR5ID09IFwicHJvdG90eXBlXCIpICYmIGhhc1Byb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhwcm9wZXJ0eSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE1hbnVhbGx5IGludm9rZSB0aGUgY2FsbGJhY2sgZm9yIGVhY2ggbm9uLWVudW1lcmFibGUgcHJvcGVydHkuXG4gICAgICAgICAgICBmb3IgKGxlbmd0aCA9IG1lbWJlcnMubGVuZ3RoOyBwcm9wZXJ0eSA9IG1lbWJlcnNbLS1sZW5ndGhdOyBoYXNQcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpICYmIGNhbGxiYWNrKHByb3BlcnR5KSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChzaXplID09IDIpIHtcbiAgICAgICAgICAvLyBTYWZhcmkgPD0gMi4wLjQgZW51bWVyYXRlcyBzaGFkb3dlZCBwcm9wZXJ0aWVzIHR3aWNlLlxuICAgICAgICAgIGZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgc2V0IG9mIGl0ZXJhdGVkIHByb3BlcnRpZXMuXG4gICAgICAgICAgICB2YXIgbWVtYmVycyA9IHt9LCBpc0Z1bmN0aW9uID0gZ2V0Q2xhc3MuY2FsbChvYmplY3QpID09IGZ1bmN0aW9uQ2xhc3MsIHByb3BlcnR5O1xuICAgICAgICAgICAgZm9yIChwcm9wZXJ0eSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgLy8gU3RvcmUgZWFjaCBwcm9wZXJ0eSBuYW1lIHRvIHByZXZlbnQgZG91YmxlIGVudW1lcmF0aW9uLiBUaGVcbiAgICAgICAgICAgICAgLy8gYHByb3RvdHlwZWAgcHJvcGVydHkgb2YgZnVuY3Rpb25zIGlzIG5vdCBlbnVtZXJhdGVkIGR1ZSB0byBjcm9zcy1cbiAgICAgICAgICAgICAgLy8gZW52aXJvbm1lbnQgaW5jb25zaXN0ZW5jaWVzLlxuICAgICAgICAgICAgICBpZiAoIShpc0Z1bmN0aW9uICYmIHByb3BlcnR5ID09IFwicHJvdG90eXBlXCIpICYmICFpc1Byb3BlcnR5LmNhbGwobWVtYmVycywgcHJvcGVydHkpICYmIChtZW1iZXJzW3Byb3BlcnR5XSA9IDEpICYmIGlzUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHByb3BlcnR5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTm8gYnVncyBkZXRlY3RlZDsgdXNlIHRoZSBzdGFuZGFyZCBgZm9yLi4uaW5gIGFsZ29yaXRobS5cbiAgICAgICAgICBmb3JFYWNoID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBpc0Z1bmN0aW9uID0gZ2V0Q2xhc3MuY2FsbChvYmplY3QpID09IGZ1bmN0aW9uQ2xhc3MsIHByb3BlcnR5LCBpc0NvbnN0cnVjdG9yO1xuICAgICAgICAgICAgZm9yIChwcm9wZXJ0eSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgaWYgKCEoaXNGdW5jdGlvbiAmJiBwcm9wZXJ0eSA9PSBcInByb3RvdHlwZVwiKSAmJiBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkgJiYgIShpc0NvbnN0cnVjdG9yID0gcHJvcGVydHkgPT09IFwiY29uc3RydWN0b3JcIikpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhwcm9wZXJ0eSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE1hbnVhbGx5IGludm9rZSB0aGUgY2FsbGJhY2sgZm9yIHRoZSBgY29uc3RydWN0b3JgIHByb3BlcnR5IGR1ZSB0b1xuICAgICAgICAgICAgLy8gY3Jvc3MtZW52aXJvbm1lbnQgaW5jb25zaXN0ZW5jaWVzLlxuICAgICAgICAgICAgaWYgKGlzQ29uc3RydWN0b3IgfHwgaXNQcm9wZXJ0eS5jYWxsKG9iamVjdCwgKHByb3BlcnR5ID0gXCJjb25zdHJ1Y3RvclwiKSkpIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2socHJvcGVydHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvckVhY2gob2JqZWN0LCBjYWxsYmFjayk7XG4gICAgICB9O1xuXG4gICAgICAvLyBQdWJsaWM6IFNlcmlhbGl6ZXMgYSBKYXZhU2NyaXB0IGB2YWx1ZWAgYXMgYSBKU09OIHN0cmluZy4gVGhlIG9wdGlvbmFsXG4gICAgICAvLyBgZmlsdGVyYCBhcmd1bWVudCBtYXkgc3BlY2lmeSBlaXRoZXIgYSBmdW5jdGlvbiB0aGF0IGFsdGVycyBob3cgb2JqZWN0IGFuZFxuICAgICAgLy8gYXJyYXkgbWVtYmVycyBhcmUgc2VyaWFsaXplZCwgb3IgYW4gYXJyYXkgb2Ygc3RyaW5ncyBhbmQgbnVtYmVycyB0aGF0XG4gICAgICAvLyBpbmRpY2F0ZXMgd2hpY2ggcHJvcGVydGllcyBzaG91bGQgYmUgc2VyaWFsaXplZC4gVGhlIG9wdGlvbmFsIGB3aWR0aGBcbiAgICAgIC8vIGFyZ3VtZW50IG1heSBiZSBlaXRoZXIgYSBzdHJpbmcgb3IgbnVtYmVyIHRoYXQgc3BlY2lmaWVzIHRoZSBpbmRlbnRhdGlvblxuICAgICAgLy8gbGV2ZWwgb2YgdGhlIG91dHB1dC5cbiAgICAgIGlmICghaGFzKFwianNvbi1zdHJpbmdpZnlcIikpIHtcbiAgICAgICAgLy8gSW50ZXJuYWw6IEEgbWFwIG9mIGNvbnRyb2wgY2hhcmFjdGVycyBhbmQgdGhlaXIgZXNjYXBlZCBlcXVpdmFsZW50cy5cbiAgICAgICAgdmFyIEVzY2FwZXMgPSB7XG4gICAgICAgICAgOTI6IFwiXFxcXFxcXFxcIixcbiAgICAgICAgICAzNDogJ1xcXFxcIicsXG4gICAgICAgICAgODogXCJcXFxcYlwiLFxuICAgICAgICAgIDEyOiBcIlxcXFxmXCIsXG4gICAgICAgICAgMTA6IFwiXFxcXG5cIixcbiAgICAgICAgICAxMzogXCJcXFxcclwiLFxuICAgICAgICAgIDk6IFwiXFxcXHRcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBDb252ZXJ0cyBgdmFsdWVgIGludG8gYSB6ZXJvLXBhZGRlZCBzdHJpbmcgc3VjaCB0aGF0IGl0c1xuICAgICAgICAvLyBsZW5ndGggaXMgYXQgbGVhc3QgZXF1YWwgdG8gYHdpZHRoYC4gVGhlIGB3aWR0aGAgbXVzdCBiZSA8PSA2LlxuICAgICAgICB2YXIgbGVhZGluZ1plcm9lcyA9IFwiMDAwMDAwXCI7XG4gICAgICAgIHZhciB0b1BhZGRlZFN0cmluZyA9IGZ1bmN0aW9uICh3aWR0aCwgdmFsdWUpIHtcbiAgICAgICAgICAvLyBUaGUgYHx8IDBgIGV4cHJlc3Npb24gaXMgbmVjZXNzYXJ5IHRvIHdvcmsgYXJvdW5kIGEgYnVnIGluXG4gICAgICAgICAgLy8gT3BlcmEgPD0gNy41NHUyIHdoZXJlIGAwID09IC0wYCwgYnV0IGBTdHJpbmcoLTApICE9PSBcIjBcImAuXG4gICAgICAgICAgcmV0dXJuIChsZWFkaW5nWmVyb2VzICsgKHZhbHVlIHx8IDApKS5zbGljZSgtd2lkdGgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBEb3VibGUtcXVvdGVzIGEgc3RyaW5nIGB2YWx1ZWAsIHJlcGxhY2luZyBhbGwgQVNDSUkgY29udHJvbFxuICAgICAgICAvLyBjaGFyYWN0ZXJzIChjaGFyYWN0ZXJzIHdpdGggY29kZSB1bml0IHZhbHVlcyBiZXR3ZWVuIDAgYW5kIDMxKSB3aXRoXG4gICAgICAgIC8vIHRoZWlyIGVzY2FwZWQgZXF1aXZhbGVudHMuIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgdGhlXG4gICAgICAgIC8vIGBRdW90ZSh2YWx1ZSlgIG9wZXJhdGlvbiBkZWZpbmVkIGluIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMuXG4gICAgICAgIHZhciB1bmljb2RlUHJlZml4ID0gXCJcXFxcdTAwXCI7XG4gICAgICAgIHZhciBxdW90ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSAnXCInLCBpbmRleCA9IDAsIGxlbmd0aCA9IHZhbHVlLmxlbmd0aCwgdXNlQ2hhckluZGV4ID0gIWNoYXJJbmRleEJ1Z2d5IHx8IGxlbmd0aCA+IDEwO1xuICAgICAgICAgIHZhciBzeW1ib2xzID0gdXNlQ2hhckluZGV4ICYmIChjaGFySW5kZXhCdWdneSA/IHZhbHVlLnNwbGl0KFwiXCIpIDogdmFsdWUpO1xuICAgICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGNoYXJDb2RlID0gdmFsdWUuY2hhckNvZGVBdChpbmRleCk7XG4gICAgICAgICAgICAvLyBJZiB0aGUgY2hhcmFjdGVyIGlzIGEgY29udHJvbCBjaGFyYWN0ZXIsIGFwcGVuZCBpdHMgVW5pY29kZSBvclxuICAgICAgICAgICAgLy8gc2hvcnRoYW5kIGVzY2FwZSBzZXF1ZW5jZTsgb3RoZXJ3aXNlLCBhcHBlbmQgdGhlIGNoYXJhY3RlciBhcy1pcy5cbiAgICAgICAgICAgIHN3aXRjaCAoY2hhckNvZGUpIHtcbiAgICAgICAgICAgICAgY2FzZSA4OiBjYXNlIDk6IGNhc2UgMTA6IGNhc2UgMTI6IGNhc2UgMTM6IGNhc2UgMzQ6IGNhc2UgOTI6XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IEVzY2FwZXNbY2hhckNvZGVdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA8IDMyKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHQgKz0gdW5pY29kZVByZWZpeCArIHRvUGFkZGVkU3RyaW5nKDIsIGNoYXJDb2RlLnRvU3RyaW5nKDE2KSk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHVzZUNoYXJJbmRleCA/IHN5bWJvbHNbaW5kZXhdIDogdmFsdWUuY2hhckF0KGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdCArICdcIic7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZXMgYW4gb2JqZWN0LiBJbXBsZW1lbnRzIHRoZVxuICAgICAgICAvLyBgU3RyKGtleSwgaG9sZGVyKWAsIGBKTyh2YWx1ZSlgLCBhbmQgYEpBKHZhbHVlKWAgb3BlcmF0aW9ucy5cbiAgICAgICAgdmFyIHNlcmlhbGl6ZSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSwgb2JqZWN0LCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgaW5kZW50YXRpb24sIHN0YWNrKSB7XG4gICAgICAgICAgdmFyIHZhbHVlLCBjbGFzc05hbWUsIHllYXIsIG1vbnRoLCBkYXRlLCB0aW1lLCBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzZWNvbmRzLCByZXN1bHRzLCBlbGVtZW50LCBpbmRleCwgbGVuZ3RoLCBwcmVmaXgsIHJlc3VsdDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gTmVjZXNzYXJ5IGZvciBob3N0IG9iamVjdCBzdXBwb3J0LlxuICAgICAgICAgICAgdmFsdWUgPSBvYmplY3RbcHJvcGVydHldO1xuICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpO1xuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSA9PSBkYXRlQ2xhc3MgJiYgIWlzUHJvcGVydHkuY2FsbCh2YWx1ZSwgXCJ0b0pTT05cIikpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlID4gLTEgLyAwICYmIHZhbHVlIDwgMSAvIDApIHtcbiAgICAgICAgICAgICAgICAvLyBEYXRlcyBhcmUgc2VyaWFsaXplZCBhY2NvcmRpbmcgdG8gdGhlIGBEYXRlI3RvSlNPTmAgbWV0aG9kXG4gICAgICAgICAgICAgICAgLy8gc3BlY2lmaWVkIGluIEVTIDUuMSBzZWN0aW9uIDE1LjkuNS40NC4gU2VlIHNlY3Rpb24gMTUuOS4xLjE1XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoZSBJU08gODYwMSBkYXRlIHRpbWUgc3RyaW5nIGZvcm1hdC5cbiAgICAgICAgICAgICAgICBpZiAoZ2V0RGF5KSB7XG4gICAgICAgICAgICAgICAgICAvLyBNYW51YWxseSBjb21wdXRlIHRoZSB5ZWFyLCBtb250aCwgZGF0ZSwgaG91cnMsIG1pbnV0ZXMsXG4gICAgICAgICAgICAgICAgICAvLyBzZWNvbmRzLCBhbmQgbWlsbGlzZWNvbmRzIGlmIHRoZSBgZ2V0VVRDKmAgbWV0aG9kcyBhcmVcbiAgICAgICAgICAgICAgICAgIC8vIGJ1Z2d5LiBBZGFwdGVkIGZyb20gQFlhZmZsZSdzIGBkYXRlLXNoaW1gIHByb2plY3QuXG4gICAgICAgICAgICAgICAgICBkYXRlID0gZmxvb3IodmFsdWUgLyA4NjRlNSk7XG4gICAgICAgICAgICAgICAgICBmb3IgKHllYXIgPSBmbG9vcihkYXRlIC8gMzY1LjI0MjUpICsgMTk3MCAtIDE7IGdldERheSh5ZWFyICsgMSwgMCkgPD0gZGF0ZTsgeWVhcisrKTtcbiAgICAgICAgICAgICAgICAgIGZvciAobW9udGggPSBmbG9vcigoZGF0ZSAtIGdldERheSh5ZWFyLCAwKSkgLyAzMC40Mik7IGdldERheSh5ZWFyLCBtb250aCArIDEpIDw9IGRhdGU7IG1vbnRoKyspO1xuICAgICAgICAgICAgICAgICAgZGF0ZSA9IDEgKyBkYXRlIC0gZ2V0RGF5KHllYXIsIG1vbnRoKTtcbiAgICAgICAgICAgICAgICAgIC8vIFRoZSBgdGltZWAgdmFsdWUgc3BlY2lmaWVzIHRoZSB0aW1lIHdpdGhpbiB0aGUgZGF5IChzZWUgRVNcbiAgICAgICAgICAgICAgICAgIC8vIDUuMSBzZWN0aW9uIDE1LjkuMS4yKS4gVGhlIGZvcm11bGEgYChBICUgQiArIEIpICUgQmAgaXMgdXNlZFxuICAgICAgICAgICAgICAgICAgLy8gdG8gY29tcHV0ZSBgQSBtb2R1bG8gQmAsIGFzIHRoZSBgJWAgb3BlcmF0b3IgZG9lcyBub3RcbiAgICAgICAgICAgICAgICAgIC8vIGNvcnJlc3BvbmQgdG8gdGhlIGBtb2R1bG9gIG9wZXJhdGlvbiBmb3IgbmVnYXRpdmUgbnVtYmVycy5cbiAgICAgICAgICAgICAgICAgIHRpbWUgPSAodmFsdWUgJSA4NjRlNSArIDg2NGU1KSAlIDg2NGU1O1xuICAgICAgICAgICAgICAgICAgLy8gVGhlIGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBhbmQgbWlsbGlzZWNvbmRzIGFyZSBvYnRhaW5lZCBieVxuICAgICAgICAgICAgICAgICAgLy8gZGVjb21wb3NpbmcgdGhlIHRpbWUgd2l0aGluIHRoZSBkYXkuIFNlZSBzZWN0aW9uIDE1LjkuMS4xMC5cbiAgICAgICAgICAgICAgICAgIGhvdXJzID0gZmxvb3IodGltZSAvIDM2ZTUpICUgMjQ7XG4gICAgICAgICAgICAgICAgICBtaW51dGVzID0gZmxvb3IodGltZSAvIDZlNCkgJSA2MDtcbiAgICAgICAgICAgICAgICAgIHNlY29uZHMgPSBmbG9vcih0aW1lIC8gMWUzKSAlIDYwO1xuICAgICAgICAgICAgICAgICAgbWlsbGlzZWNvbmRzID0gdGltZSAlIDFlMztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgeWVhciA9IHZhbHVlLmdldFVUQ0Z1bGxZZWFyKCk7XG4gICAgICAgICAgICAgICAgICBtb250aCA9IHZhbHVlLmdldFVUQ01vbnRoKCk7XG4gICAgICAgICAgICAgICAgICBkYXRlID0gdmFsdWUuZ2V0VVRDRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgaG91cnMgPSB2YWx1ZS5nZXRVVENIb3VycygpO1xuICAgICAgICAgICAgICAgICAgbWludXRlcyA9IHZhbHVlLmdldFVUQ01pbnV0ZXMoKTtcbiAgICAgICAgICAgICAgICAgIHNlY29uZHMgPSB2YWx1ZS5nZXRVVENTZWNvbmRzKCk7XG4gICAgICAgICAgICAgICAgICBtaWxsaXNlY29uZHMgPSB2YWx1ZS5nZXRVVENNaWxsaXNlY29uZHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU2VyaWFsaXplIGV4dGVuZGVkIHllYXJzIGNvcnJlY3RseS5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9ICh5ZWFyIDw9IDAgfHwgeWVhciA+PSAxZTQgPyAoeWVhciA8IDAgPyBcIi1cIiA6IFwiK1wiKSArIHRvUGFkZGVkU3RyaW5nKDYsIHllYXIgPCAwID8gLXllYXIgOiB5ZWFyKSA6IHRvUGFkZGVkU3RyaW5nKDQsIHllYXIpKSArXG4gICAgICAgICAgICAgICAgICBcIi1cIiArIHRvUGFkZGVkU3RyaW5nKDIsIG1vbnRoICsgMSkgKyBcIi1cIiArIHRvUGFkZGVkU3RyaW5nKDIsIGRhdGUpICtcbiAgICAgICAgICAgICAgICAgIC8vIE1vbnRocywgZGF0ZXMsIGhvdXJzLCBtaW51dGVzLCBhbmQgc2Vjb25kcyBzaG91bGQgaGF2ZSB0d29cbiAgICAgICAgICAgICAgICAgIC8vIGRpZ2l0czsgbWlsbGlzZWNvbmRzIHNob3VsZCBoYXZlIHRocmVlLlxuICAgICAgICAgICAgICAgICAgXCJUXCIgKyB0b1BhZGRlZFN0cmluZygyLCBob3VycykgKyBcIjpcIiArIHRvUGFkZGVkU3RyaW5nKDIsIG1pbnV0ZXMpICsgXCI6XCIgKyB0b1BhZGRlZFN0cmluZygyLCBzZWNvbmRzKSArXG4gICAgICAgICAgICAgICAgICAvLyBNaWxsaXNlY29uZHMgYXJlIG9wdGlvbmFsIGluIEVTIDUuMCwgYnV0IHJlcXVpcmVkIGluIDUuMS5cbiAgICAgICAgICAgICAgICAgIFwiLlwiICsgdG9QYWRkZWRTdHJpbmcoMywgbWlsbGlzZWNvbmRzKSArIFwiWlwiO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUudG9KU09OID09IFwiZnVuY3Rpb25cIiAmJiAoKGNsYXNzTmFtZSAhPSBudW1iZXJDbGFzcyAmJiBjbGFzc05hbWUgIT0gc3RyaW5nQ2xhc3MgJiYgY2xhc3NOYW1lICE9IGFycmF5Q2xhc3MpIHx8IGlzUHJvcGVydHkuY2FsbCh2YWx1ZSwgXCJ0b0pTT05cIikpKSB7XG4gICAgICAgICAgICAgIC8vIFByb3RvdHlwZSA8PSAxLjYuMSBhZGRzIG5vbi1zdGFuZGFyZCBgdG9KU09OYCBtZXRob2RzIHRvIHRoZVxuICAgICAgICAgICAgICAvLyBgTnVtYmVyYCwgYFN0cmluZ2AsIGBEYXRlYCwgYW5kIGBBcnJheWAgcHJvdG90eXBlcy4gSlNPTiAzXG4gICAgICAgICAgICAgIC8vIGlnbm9yZXMgYWxsIGB0b0pTT05gIG1ldGhvZHMgb24gdGhlc2Ugb2JqZWN0cyB1bmxlc3MgdGhleSBhcmVcbiAgICAgICAgICAgICAgLy8gZGVmaW5lZCBkaXJlY3RseSBvbiBhbiBpbnN0YW5jZS5cbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0pTT04ocHJvcGVydHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIElmIGEgcmVwbGFjZW1lbnQgZnVuY3Rpb24gd2FzIHByb3ZpZGVkLCBjYWxsIGl0IHRvIG9idGFpbiB0aGUgdmFsdWVcbiAgICAgICAgICAgIC8vIGZvciBzZXJpYWxpemF0aW9uLlxuICAgICAgICAgICAgdmFsdWUgPSBjYWxsYmFjay5jYWxsKG9iamVjdCwgcHJvcGVydHksIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpO1xuICAgICAgICAgIGlmIChjbGFzc05hbWUgPT0gYm9vbGVhbkNsYXNzKSB7XG4gICAgICAgICAgICAvLyBCb29sZWFucyBhcmUgcmVwcmVzZW50ZWQgbGl0ZXJhbGx5LlxuICAgICAgICAgICAgcmV0dXJuIFwiXCIgKyB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNsYXNzTmFtZSA9PSBudW1iZXJDbGFzcykge1xuICAgICAgICAgICAgLy8gSlNPTiBudW1iZXJzIG11c3QgYmUgZmluaXRlLiBgSW5maW5pdHlgIGFuZCBgTmFOYCBhcmUgc2VyaWFsaXplZCBhc1xuICAgICAgICAgICAgLy8gYFwibnVsbFwiYC5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IC0xIC8gMCAmJiB2YWx1ZSA8IDEgLyAwID8gXCJcIiArIHZhbHVlIDogXCJudWxsXCI7XG4gICAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MpIHtcbiAgICAgICAgICAgIC8vIFN0cmluZ3MgYXJlIGRvdWJsZS1xdW90ZWQgYW5kIGVzY2FwZWQuXG4gICAgICAgICAgICByZXR1cm4gcXVvdGUoXCJcIiArIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmVjdXJzaXZlbHkgc2VyaWFsaXplIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhpcyBpcyBhIGxpbmVhciBzZWFyY2g7IHBlcmZvcm1hbmNlXG4gICAgICAgICAgICAvLyBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2YgdW5pcXVlIG5lc3RlZCBvYmplY3RzLlxuICAgICAgICAgICAgZm9yIChsZW5ndGggPSBzdGFjay5sZW5ndGg7IGxlbmd0aC0tOykge1xuICAgICAgICAgICAgICBpZiAoc3RhY2tbbGVuZ3RoXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBDeWNsaWMgc3RydWN0dXJlcyBjYW5ub3QgYmUgc2VyaWFsaXplZCBieSBgSlNPTi5zdHJpbmdpZnlgLlxuICAgICAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBZGQgdGhlIG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgICAgICAgICBzdGFjay5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIC8vIFNhdmUgdGhlIGN1cnJlbnQgaW5kZW50YXRpb24gbGV2ZWwgYW5kIGluZGVudCBvbmUgYWRkaXRpb25hbCBsZXZlbC5cbiAgICAgICAgICAgIHByZWZpeCA9IGluZGVudGF0aW9uO1xuICAgICAgICAgICAgaW5kZW50YXRpb24gKz0gd2hpdGVzcGFjZTtcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUgPT0gYXJyYXlDbGFzcykge1xuICAgICAgICAgICAgICAvLyBSZWN1cnNpdmVseSBzZXJpYWxpemUgYXJyYXkgZWxlbWVudHMuXG4gICAgICAgICAgICAgIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IHNlcmlhbGl6ZShpbmRleCwgdmFsdWUsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCB3aGl0ZXNwYWNlLCBpbmRlbnRhdGlvbiwgc3RhY2spO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChlbGVtZW50ID09PSB1bmRlZiA/IFwibnVsbFwiIDogZWxlbWVudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0cy5sZW5ndGggPyAod2hpdGVzcGFjZSA/IFwiW1xcblwiICsgaW5kZW50YXRpb24gKyByZXN1bHRzLmpvaW4oXCIsXFxuXCIgKyBpbmRlbnRhdGlvbikgKyBcIlxcblwiICsgcHJlZml4ICsgXCJdXCIgOiAoXCJbXCIgKyByZXN1bHRzLmpvaW4oXCIsXCIpICsgXCJdXCIpKSA6IFwiW11cIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBvYmplY3QgbWVtYmVycy4gTWVtYmVycyBhcmUgc2VsZWN0ZWQgZnJvbVxuICAgICAgICAgICAgICAvLyBlaXRoZXIgYSB1c2VyLXNwZWNpZmllZCBsaXN0IG9mIHByb3BlcnR5IG5hbWVzLCBvciB0aGUgb2JqZWN0XG4gICAgICAgICAgICAgIC8vIGl0c2VsZi5cbiAgICAgICAgICAgICAgZm9yRWFjaChwcm9wZXJ0aWVzIHx8IHZhbHVlLCBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IHNlcmlhbGl6ZShwcm9wZXJ0eSwgdmFsdWUsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCB3aGl0ZXNwYWNlLCBpbmRlbnRhdGlvbiwgc3RhY2spO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50ICE9PSB1bmRlZikge1xuICAgICAgICAgICAgICAgICAgLy8gQWNjb3JkaW5nIHRvIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjM6IFwiSWYgYGdhcGAge3doaXRlc3BhY2V9XG4gICAgICAgICAgICAgICAgICAvLyBpcyBub3QgdGhlIGVtcHR5IHN0cmluZywgbGV0IGBtZW1iZXJgIHtxdW90ZShwcm9wZXJ0eSkgKyBcIjpcIn1cbiAgICAgICAgICAgICAgICAgIC8vIGJlIHRoZSBjb25jYXRlbmF0aW9uIG9mIGBtZW1iZXJgIGFuZCB0aGUgYHNwYWNlYCBjaGFyYWN0ZXIuXCJcbiAgICAgICAgICAgICAgICAgIC8vIFRoZSBcImBzcGFjZWAgY2hhcmFjdGVyXCIgcmVmZXJzIHRvIHRoZSBsaXRlcmFsIHNwYWNlXG4gICAgICAgICAgICAgICAgICAvLyBjaGFyYWN0ZXIsIG5vdCB0aGUgYHNwYWNlYCB7d2lkdGh9IGFyZ3VtZW50IHByb3ZpZGVkIHRvXG4gICAgICAgICAgICAgICAgICAvLyBgSlNPTi5zdHJpbmdpZnlgLlxuICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHF1b3RlKHByb3BlcnR5KSArIFwiOlwiICsgKHdoaXRlc3BhY2UgPyBcIiBcIiA6IFwiXCIpICsgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0cy5sZW5ndGggPyAod2hpdGVzcGFjZSA/IFwie1xcblwiICsgaW5kZW50YXRpb24gKyByZXN1bHRzLmpvaW4oXCIsXFxuXCIgKyBpbmRlbnRhdGlvbikgKyBcIlxcblwiICsgcHJlZml4ICsgXCJ9XCIgOiAoXCJ7XCIgKyByZXN1bHRzLmpvaW4oXCIsXCIpICsgXCJ9XCIpKSA6IFwie31cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgb2JqZWN0IGZyb20gdGhlIHRyYXZlcnNlZCBvYmplY3Qgc3RhY2suXG4gICAgICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFB1YmxpYzogYEpTT04uc3RyaW5naWZ5YC4gU2VlIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMuXG4gICAgICAgIGV4cG9ydHMuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHNvdXJjZSwgZmlsdGVyLCB3aWR0aCkge1xuICAgICAgICAgIHZhciB3aGl0ZXNwYWNlLCBjYWxsYmFjaywgcHJvcGVydGllcywgY2xhc3NOYW1lO1xuICAgICAgICAgIGlmIChvYmplY3RUeXBlc1t0eXBlb2YgZmlsdGVyXSAmJiBmaWx0ZXIpIHtcbiAgICAgICAgICAgIGlmICgoY2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbChmaWx0ZXIpKSA9PSBmdW5jdGlvbkNsYXNzKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrID0gZmlsdGVyO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUgPT0gYXJyYXlDbGFzcykge1xuICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBwcm9wZXJ0eSBuYW1lcyBhcnJheSBpbnRvIGEgbWFrZXNoaWZ0IHNldC5cbiAgICAgICAgICAgICAgcHJvcGVydGllcyA9IHt9O1xuICAgICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDAsIGxlbmd0aCA9IGZpbHRlci5sZW5ndGgsIHZhbHVlOyBpbmRleCA8IGxlbmd0aDsgdmFsdWUgPSBmaWx0ZXJbaW5kZXgrK10sICgoY2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbCh2YWx1ZSkpLCBjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MgfHwgY2xhc3NOYW1lID09IG51bWJlckNsYXNzKSAmJiAocHJvcGVydGllc1t2YWx1ZV0gPSAxKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICAgICAgaWYgKChjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHdpZHRoKSkgPT0gbnVtYmVyQ2xhc3MpIHtcbiAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgYHdpZHRoYCB0byBhbiBpbnRlZ2VyIGFuZCBjcmVhdGUgYSBzdHJpbmcgY29udGFpbmluZ1xuICAgICAgICAgICAgICAvLyBgd2lkdGhgIG51bWJlciBvZiBzcGFjZSBjaGFyYWN0ZXJzLlxuICAgICAgICAgICAgICBpZiAoKHdpZHRoIC09IHdpZHRoICUgMSkgPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yICh3aGl0ZXNwYWNlID0gXCJcIiwgd2lkdGggPiAxMCAmJiAod2lkdGggPSAxMCk7IHdoaXRlc3BhY2UubGVuZ3RoIDwgd2lkdGg7IHdoaXRlc3BhY2UgKz0gXCIgXCIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNsYXNzTmFtZSA9PSBzdHJpbmdDbGFzcykge1xuICAgICAgICAgICAgICB3aGl0ZXNwYWNlID0gd2lkdGgubGVuZ3RoIDw9IDEwID8gd2lkdGggOiB3aWR0aC5zbGljZSgwLCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE9wZXJhIDw9IDcuNTR1MiBkaXNjYXJkcyB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBlbXB0eSBzdHJpbmcga2V5c1xuICAgICAgICAgIC8vIChgXCJcImApIG9ubHkgaWYgdGhleSBhcmUgdXNlZCBkaXJlY3RseSB3aXRoaW4gYW4gb2JqZWN0IG1lbWJlciBsaXN0XG4gICAgICAgICAgLy8gKGUuZy4sIGAhKFwiXCIgaW4geyBcIlwiOiAxfSlgKS5cbiAgICAgICAgICByZXR1cm4gc2VyaWFsaXplKFwiXCIsICh2YWx1ZSA9IHt9LCB2YWx1ZVtcIlwiXSA9IHNvdXJjZSwgdmFsdWUpLCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgXCJcIiwgW10pO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBQdWJsaWM6IFBhcnNlcyBhIEpTT04gc291cmNlIHN0cmluZy5cbiAgICAgIGlmICghaGFzKFwianNvbi1wYXJzZVwiKSkge1xuICAgICAgICB2YXIgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogQSBtYXAgb2YgZXNjYXBlZCBjb250cm9sIGNoYXJhY3RlcnMgYW5kIHRoZWlyIHVuZXNjYXBlZFxuICAgICAgICAvLyBlcXVpdmFsZW50cy5cbiAgICAgICAgdmFyIFVuZXNjYXBlcyA9IHtcbiAgICAgICAgICA5MjogXCJcXFxcXCIsXG4gICAgICAgICAgMzQ6ICdcIicsXG4gICAgICAgICAgNDc6IFwiL1wiLFxuICAgICAgICAgIDk4OiBcIlxcYlwiLFxuICAgICAgICAgIDExNjogXCJcXHRcIixcbiAgICAgICAgICAxMTA6IFwiXFxuXCIsXG4gICAgICAgICAgMTAyOiBcIlxcZlwiLFxuICAgICAgICAgIDExNDogXCJcXHJcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBTdG9yZXMgdGhlIHBhcnNlciBzdGF0ZS5cbiAgICAgICAgdmFyIEluZGV4LCBTb3VyY2U7XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFJlc2V0cyB0aGUgcGFyc2VyIHN0YXRlIGFuZCB0aHJvd3MgYSBgU3ludGF4RXJyb3JgLlxuICAgICAgICB2YXIgYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgSW5kZXggPSBTb3VyY2UgPSBudWxsO1xuICAgICAgICAgIHRocm93IFN5bnRheEVycm9yKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFJldHVybnMgdGhlIG5leHQgdG9rZW4sIG9yIGBcIiRcImAgaWYgdGhlIHBhcnNlciBoYXMgcmVhY2hlZFxuICAgICAgICAvLyB0aGUgZW5kIG9mIHRoZSBzb3VyY2Ugc3RyaW5nLiBBIHRva2VuIG1heSBiZSBhIHN0cmluZywgbnVtYmVyLCBgbnVsbGBcbiAgICAgICAgLy8gbGl0ZXJhbCwgb3IgQm9vbGVhbiBsaXRlcmFsLlxuICAgICAgICB2YXIgbGV4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBzb3VyY2UgPSBTb3VyY2UsIGxlbmd0aCA9IHNvdXJjZS5sZW5ndGgsIHZhbHVlLCBiZWdpbiwgcG9zaXRpb24sIGlzU2lnbmVkLCBjaGFyQ29kZTtcbiAgICAgICAgICB3aGlsZSAoSW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO1xuICAgICAgICAgICAgc3dpdGNoIChjaGFyQ29kZSkge1xuICAgICAgICAgICAgICBjYXNlIDk6IGNhc2UgMTA6IGNhc2UgMTM6IGNhc2UgMzI6XG4gICAgICAgICAgICAgICAgLy8gU2tpcCB3aGl0ZXNwYWNlIHRva2VucywgaW5jbHVkaW5nIHRhYnMsIGNhcnJpYWdlIHJldHVybnMsIGxpbmVcbiAgICAgICAgICAgICAgICAvLyBmZWVkcywgYW5kIHNwYWNlIGNoYXJhY3RlcnMuXG4gICAgICAgICAgICAgICAgSW5kZXgrKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAxMjM6IGNhc2UgMTI1OiBjYXNlIDkxOiBjYXNlIDkzOiBjYXNlIDU4OiBjYXNlIDQ0OlxuICAgICAgICAgICAgICAgIC8vIFBhcnNlIGEgcHVuY3R1YXRvciB0b2tlbiAoYHtgLCBgfWAsIGBbYCwgYF1gLCBgOmAsIG9yIGAsYCkgYXRcbiAgICAgICAgICAgICAgICAvLyB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGNoYXJJbmRleEJ1Z2d5ID8gc291cmNlLmNoYXJBdChJbmRleCkgOiBzb3VyY2VbSW5kZXhdO1xuICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICBjYXNlIDM0OlxuICAgICAgICAgICAgICAgIC8vIGBcImAgZGVsaW1pdHMgYSBKU09OIHN0cmluZzsgYWR2YW5jZSB0byB0aGUgbmV4dCBjaGFyYWN0ZXIgYW5kXG4gICAgICAgICAgICAgICAgLy8gYmVnaW4gcGFyc2luZyB0aGUgc3RyaW5nLiBTdHJpbmcgdG9rZW5zIGFyZSBwcmVmaXhlZCB3aXRoIHRoZVxuICAgICAgICAgICAgICAgIC8vIHNlbnRpbmVsIGBAYCBjaGFyYWN0ZXIgdG8gZGlzdGluZ3Vpc2ggdGhlbSBmcm9tIHB1bmN0dWF0b3JzIGFuZFxuICAgICAgICAgICAgICAgIC8vIGVuZC1vZi1zdHJpbmcgdG9rZW5zLlxuICAgICAgICAgICAgICAgIGZvciAodmFsdWUgPSBcIkBcIiwgSW5kZXgrKzsgSW5kZXggPCBsZW5ndGg7KSB7XG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA8IDMyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVuZXNjYXBlZCBBU0NJSSBjb250cm9sIGNoYXJhY3RlcnMgKHRob3NlIHdpdGggYSBjb2RlIHVuaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gbGVzcyB0aGFuIHRoZSBzcGFjZSBjaGFyYWN0ZXIpIGFyZSBub3QgcGVybWl0dGVkLlxuICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZSA9PSA5Mikge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIHJldmVyc2Ugc29saWR1cyAoYFxcYCkgbWFya3MgdGhlIGJlZ2lubmluZyBvZiBhbiBlc2NhcGVkXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnRyb2wgY2hhcmFjdGVyIChpbmNsdWRpbmcgYFwiYCwgYFxcYCwgYW5kIGAvYCkgb3IgVW5pY29kZVxuICAgICAgICAgICAgICAgICAgICAvLyBlc2NhcGUgc2VxdWVuY2UuXG4gICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoY2hhckNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIDkyOiBjYXNlIDM0OiBjYXNlIDQ3OiBjYXNlIDk4OiBjYXNlIDExNjogY2FzZSAxMTA6IGNhc2UgMTAyOiBjYXNlIDExNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJldml2ZSBlc2NhcGVkIGNvbnRyb2wgY2hhcmFjdGVycy5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlICs9IFVuZXNjYXBlc1tjaGFyQ29kZV07XG4gICAgICAgICAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMTc6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBgXFx1YCBtYXJrcyB0aGUgYmVnaW5uaW5nIG9mIGEgVW5pY29kZSBlc2NhcGUgc2VxdWVuY2UuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgYW5kIHZhbGlkYXRlIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm91ci1kaWdpdCBjb2RlIHBvaW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW4gPSArK0luZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChwb3NpdGlvbiA9IEluZGV4ICsgNDsgSW5kZXggPCBwb3NpdGlvbjsgSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQSB2YWxpZCBzZXF1ZW5jZSBjb21wcmlzZXMgZm91ciBoZXhkaWdpdHMgKGNhc2UtXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluc2Vuc2l0aXZlKSB0aGF0IGZvcm0gYSBzaW5nbGUgaGV4YWRlY2ltYWwgdmFsdWUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3IHx8IGNoYXJDb2RlID49IDk3ICYmIGNoYXJDb2RlIDw9IDEwMiB8fCBjaGFyQ29kZSA+PSA2NSAmJiBjaGFyQ29kZSA8PSA3MCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnZhbGlkIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJldml2ZSB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSBmcm9tQ2hhckNvZGUoXCIweFwiICsgc291cmNlLnNsaWNlKGJlZ2luLCBJbmRleCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEludmFsaWQgZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDM0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gdW5lc2NhcGVkIGRvdWJsZS1xdW90ZSBjaGFyYWN0ZXIgbWFya3MgdGhlIGVuZCBvZiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJpbmcuXG4gICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJlZ2luID0gSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9wdGltaXplIGZvciB0aGUgY29tbW9uIGNhc2Ugd2hlcmUgYSBzdHJpbmcgaXMgdmFsaWQuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjaGFyQ29kZSA+PSAzMiAmJiBjaGFyQ29kZSAhPSA5MiAmJiBjaGFyQ29kZSAhPSAzNCkge1xuICAgICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gQXBwZW5kIHRoZSBzdHJpbmcgYXMtaXMuXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlICs9IHNvdXJjZS5zbGljZShiZWdpbiwgSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpID09IDM0KSB7XG4gICAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHRvIHRoZSBuZXh0IGNoYXJhY3RlciBhbmQgcmV0dXJuIHRoZSByZXZpdmVkIHN0cmluZy5cbiAgICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFVudGVybWluYXRlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBudW1iZXJzIGFuZCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBiZWdpbiA9IEluZGV4O1xuICAgICAgICAgICAgICAgIC8vIEFkdmFuY2UgcGFzdCB0aGUgbmVnYXRpdmUgc2lnbiwgaWYgb25lIGlzIHNwZWNpZmllZC5cbiAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gNDUpIHtcbiAgICAgICAgICAgICAgICAgIGlzU2lnbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFBhcnNlIGFuIGludGVnZXIgb3IgZmxvYXRpbmctcG9pbnQgdmFsdWUuXG4gICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KSB7XG4gICAgICAgICAgICAgICAgICAvLyBMZWFkaW5nIHplcm9lcyBhcmUgaW50ZXJwcmV0ZWQgYXMgb2N0YWwgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gNDggJiYgKChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4ICsgMSkpLCBjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1NykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWxsZWdhbCBvY3RhbCBsaXRlcmFsLlxuICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaXNTaWduZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIC8vIFBhcnNlIHRoZSBpbnRlZ2VyIGNvbXBvbmVudC5cbiAgICAgICAgICAgICAgICAgIGZvciAoOyBJbmRleCA8IGxlbmd0aCAmJiAoKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpOyBJbmRleCsrKTtcbiAgICAgICAgICAgICAgICAgIC8vIEZsb2F0cyBjYW5ub3QgY29udGFpbiBhIGxlYWRpbmcgZGVjaW1hbCBwb2ludDsgaG93ZXZlciwgdGhpc1xuICAgICAgICAgICAgICAgICAgLy8gY2FzZSBpcyBhbHJlYWR5IGFjY291bnRlZCBmb3IgYnkgdGhlIHBhcnNlci5cbiAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuY2hhckNvZGVBdChJbmRleCkgPT0gNDYpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gPSArK0luZGV4O1xuICAgICAgICAgICAgICAgICAgICAvLyBQYXJzZSB0aGUgZGVjaW1hbCBjb21wb25lbnQuXG4gICAgICAgICAgICAgICAgICAgIGZvciAoOyBwb3NpdGlvbiA8IGxlbmd0aCAmJiAoKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQocG9zaXRpb24pKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpOyBwb3NpdGlvbisrKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uID09IEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gSWxsZWdhbCB0cmFpbGluZyBkZWNpbWFsLlxuICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgSW5kZXggPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8vIFBhcnNlIGV4cG9uZW50cy4gVGhlIGBlYCBkZW5vdGluZyB0aGUgZXhwb25lbnQgaXNcbiAgICAgICAgICAgICAgICAgIC8vIGNhc2UtaW5zZW5zaXRpdmUuXG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSAxMDEgfHwgY2hhckNvZGUgPT0gNjkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdCgrK0luZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2tpcCBwYXN0IHRoZSBzaWduIGZvbGxvd2luZyB0aGUgZXhwb25lbnQsIGlmIG9uZSBpc1xuICAgICAgICAgICAgICAgICAgICAvLyBzcGVjaWZpZWQuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSA0MyB8fCBjaGFyQ29kZSA9PSA0NSkge1xuICAgICAgICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhlIGV4cG9uZW50aWFsIGNvbXBvbmVudC5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChwb3NpdGlvbiA9IEluZGV4OyBwb3NpdGlvbiA8IGxlbmd0aCAmJiAoKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQocG9zaXRpb24pKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpOyBwb3NpdGlvbisrKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uID09IEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gSWxsZWdhbCBlbXB0eSBleHBvbmVudC5cbiAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIEluZGV4ID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAvLyBDb2VyY2UgdGhlIHBhcnNlZCB2YWx1ZSB0byBhIEphdmFTY3JpcHQgbnVtYmVyLlxuICAgICAgICAgICAgICAgICAgcmV0dXJuICtzb3VyY2Uuc2xpY2UoYmVnaW4sIEluZGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQSBuZWdhdGl2ZSBzaWduIG1heSBvbmx5IHByZWNlZGUgbnVtYmVycy5cbiAgICAgICAgICAgICAgICBpZiAoaXNTaWduZWQpIHtcbiAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGB0cnVlYCwgYGZhbHNlYCwgYW5kIGBudWxsYCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBpZiAoc291cmNlLnNsaWNlKEluZGV4LCBJbmRleCArIDQpID09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICAgICAgICBJbmRleCArPSA0O1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2Uuc2xpY2UoSW5kZXgsIEluZGV4ICsgNSkgPT0gXCJmYWxzZVwiKSB7XG4gICAgICAgICAgICAgICAgICBJbmRleCArPSA1O1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlLnNsaWNlKEluZGV4LCBJbmRleCArIDQpID09IFwibnVsbFwiKSB7XG4gICAgICAgICAgICAgICAgICBJbmRleCArPSA0O1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFVucmVjb2duaXplZCB0b2tlbi5cbiAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZXR1cm4gdGhlIHNlbnRpbmVsIGAkYCBjaGFyYWN0ZXIgaWYgdGhlIHBhcnNlciBoYXMgcmVhY2hlZCB0aGUgZW5kXG4gICAgICAgICAgLy8gb2YgdGhlIHNvdXJjZSBzdHJpbmcuXG4gICAgICAgICAgcmV0dXJuIFwiJFwiO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBQYXJzZXMgYSBKU09OIGB2YWx1ZWAgdG9rZW4uXG4gICAgICAgIHZhciBnZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0cywgaGFzTWVtYmVycztcbiAgICAgICAgICBpZiAodmFsdWUgPT0gXCIkXCIpIHtcbiAgICAgICAgICAgIC8vIFVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0LlxuICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZiAoKGNoYXJJbmRleEJ1Z2d5ID8gdmFsdWUuY2hhckF0KDApIDogdmFsdWVbMF0pID09IFwiQFwiKSB7XG4gICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgc2VudGluZWwgYEBgIGNoYXJhY3Rlci5cbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGFyc2Ugb2JqZWN0IGFuZCBhcnJheSBsaXRlcmFscy5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIltcIikge1xuICAgICAgICAgICAgICAvLyBQYXJzZXMgYSBKU09OIGFycmF5LCByZXR1cm5pbmcgYSBuZXcgSmF2YVNjcmlwdCBhcnJheS5cbiAgICAgICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICBmb3IgKDs7IGhhc01lbWJlcnMgfHwgKGhhc01lbWJlcnMgPSB0cnVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbGV4KCk7XG4gICAgICAgICAgICAgICAgLy8gQSBjbG9zaW5nIHNxdWFyZSBicmFja2V0IG1hcmtzIHRoZSBlbmQgb2YgdGhlIGFycmF5IGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiXVwiKSB7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGFycmF5IGxpdGVyYWwgY29udGFpbnMgZWxlbWVudHMsIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIGJlIGEgY29tbWEgc2VwYXJhdGluZyB0aGUgcHJldmlvdXMgZWxlbWVudCBmcm9tIHRoZVxuICAgICAgICAgICAgICAgIC8vIG5leHQuXG4gICAgICAgICAgICAgICAgaWYgKGhhc01lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIixcIikge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGxleCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJdXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBVbmV4cGVjdGVkIHRyYWlsaW5nIGAsYCBpbiBhcnJheSBsaXRlcmFsLlxuICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgYCxgIG11c3Qgc2VwYXJhdGUgZWFjaCBhcnJheSBlbGVtZW50LlxuICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBFbGlzaW9ucyBhbmQgbGVhZGluZyBjb21tYXMgYXJlIG5vdCBwZXJtaXR0ZWQuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiLFwiKSB7XG4gICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZ2V0KHZhbHVlKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09IFwie1wiKSB7XG4gICAgICAgICAgICAgIC8vIFBhcnNlcyBhIEpTT04gb2JqZWN0LCByZXR1cm5pbmcgYSBuZXcgSmF2YVNjcmlwdCBvYmplY3QuXG4gICAgICAgICAgICAgIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgICAgZm9yICg7OyBoYXNNZW1iZXJzIHx8IChoYXNNZW1iZXJzID0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGxleCgpO1xuICAgICAgICAgICAgICAgIC8vIEEgY2xvc2luZyBjdXJseSBicmFjZSBtYXJrcyB0aGUgZW5kIG9mIHRoZSBvYmplY3QgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJ9XCIpIHtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgb2JqZWN0IGxpdGVyYWwgY29udGFpbnMgbWVtYmVycywgdGhlIGN1cnJlbnQgdG9rZW5cbiAgICAgICAgICAgICAgICAvLyBzaG91bGQgYmUgYSBjb21tYSBzZXBhcmF0b3IuXG4gICAgICAgICAgICAgICAgaWYgKGhhc01lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIixcIikge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGxleCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJ9XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBVbmV4cGVjdGVkIHRyYWlsaW5nIGAsYCBpbiBvYmplY3QgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIGAsYCBtdXN0IHNlcGFyYXRlIGVhY2ggb2JqZWN0IG1lbWJlci5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gTGVhZGluZyBjb21tYXMgYXJlIG5vdCBwZXJtaXR0ZWQsIG9iamVjdCBwcm9wZXJ0eSBuYW1lcyBtdXN0IGJlXG4gICAgICAgICAgICAgICAgLy8gZG91YmxlLXF1b3RlZCBzdHJpbmdzLCBhbmQgYSBgOmAgbXVzdCBzZXBhcmF0ZSBlYWNoIHByb3BlcnR5XG4gICAgICAgICAgICAgICAgLy8gbmFtZSBhbmQgdmFsdWUuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiLFwiIHx8IHR5cGVvZiB2YWx1ZSAhPSBcInN0cmluZ1wiIHx8IChjaGFySW5kZXhCdWdneSA/IHZhbHVlLmNoYXJBdCgwKSA6IHZhbHVlWzBdKSAhPSBcIkBcIiB8fCBsZXgoKSAhPSBcIjpcIikge1xuICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0c1t2YWx1ZS5zbGljZSgxKV0gPSBnZXQobGV4KCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVW5leHBlY3RlZCB0b2tlbiBlbmNvdW50ZXJlZC5cbiAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogVXBkYXRlcyBhIHRyYXZlcnNlZCBvYmplY3QgbWVtYmVyLlxuICAgICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24gKHNvdXJjZSwgcHJvcGVydHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgdmFyIGVsZW1lbnQgPSB3YWxrKHNvdXJjZSwgcHJvcGVydHksIGNhbGxiYWNrKTtcbiAgICAgICAgICBpZiAoZWxlbWVudCA9PT0gdW5kZWYpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBzb3VyY2VbcHJvcGVydHldO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb3VyY2VbcHJvcGVydHldID0gZWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFJlY3Vyc2l2ZWx5IHRyYXZlcnNlcyBhIHBhcnNlZCBKU09OIG9iamVjdCwgaW52b2tpbmcgdGhlXG4gICAgICAgIC8vIGBjYWxsYmFja2AgZnVuY3Rpb24gZm9yIGVhY2ggdmFsdWUuIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgdGhlXG4gICAgICAgIC8vIGBXYWxrKGhvbGRlciwgbmFtZSlgIG9wZXJhdGlvbiBkZWZpbmVkIGluIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjIuXG4gICAgICAgIHZhciB3YWxrID0gZnVuY3Rpb24gKHNvdXJjZSwgcHJvcGVydHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gc291cmNlW3Byb3BlcnR5XSwgbGVuZ3RoO1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gYGZvckVhY2hgIGNhbid0IGJlIHVzZWQgdG8gdHJhdmVyc2UgYW4gYXJyYXkgaW4gT3BlcmEgPD0gOC41NFxuICAgICAgICAgICAgLy8gYmVjYXVzZSBpdHMgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAgaW1wbGVtZW50YXRpb24gcmV0dXJucyBgZmFsc2VgXG4gICAgICAgICAgICAvLyBmb3IgYXJyYXkgaW5kaWNlcyAoZS5nLiwgYCFbMSwgMiwgM10uaGFzT3duUHJvcGVydHkoXCIwXCIpYCkuXG4gICAgICAgICAgICBpZiAoZ2V0Q2xhc3MuY2FsbCh2YWx1ZSkgPT0gYXJyYXlDbGFzcykge1xuICAgICAgICAgICAgICBmb3IgKGxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgbGVuZ3RoLS07KSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlKHZhbHVlLCBsZW5ndGgsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZm9yRWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlKHZhbHVlLCBwcm9wZXJ0eSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoc291cmNlLCBwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFB1YmxpYzogYEpTT04ucGFyc2VgLiBTZWUgRVMgNS4xIHNlY3Rpb24gMTUuMTIuMi5cbiAgICAgICAgZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIChzb3VyY2UsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCwgdmFsdWU7XG4gICAgICAgICAgSW5kZXggPSAwO1xuICAgICAgICAgIFNvdXJjZSA9IFwiXCIgKyBzb3VyY2U7XG4gICAgICAgICAgcmVzdWx0ID0gZ2V0KGxleCgpKTtcbiAgICAgICAgICAvLyBJZiBhIEpTT04gc3RyaW5nIGNvbnRhaW5zIG11bHRpcGxlIHRva2VucywgaXQgaXMgaW52YWxpZC5cbiAgICAgICAgICBpZiAobGV4KCkgIT0gXCIkXCIpIHtcbiAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFJlc2V0IHRoZSBwYXJzZXIgc3RhdGUuXG4gICAgICAgICAgSW5kZXggPSBTb3VyY2UgPSBudWxsO1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayAmJiBnZXRDbGFzcy5jYWxsKGNhbGxiYWNrKSA9PSBmdW5jdGlvbkNsYXNzID8gd2FsaygodmFsdWUgPSB7fSwgdmFsdWVbXCJcIl0gPSByZXN1bHQsIHZhbHVlKSwgXCJcIiwgY2FsbGJhY2spIDogcmVzdWx0O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydHNbXCJydW5JbkNvbnRleHRcIl0gPSBydW5JbkNvbnRleHQ7XG4gICAgcmV0dXJuIGV4cG9ydHM7XG4gIH1cblxuICBpZiAoZnJlZUV4cG9ydHMgJiYgIWlzTG9hZGVyKSB7XG4gICAgLy8gRXhwb3J0IGZvciBDb21tb25KUyBlbnZpcm9ubWVudHMuXG4gICAgcnVuSW5Db250ZXh0KHJvb3QsIGZyZWVFeHBvcnRzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBFeHBvcnQgZm9yIHdlYiBicm93c2VycyBhbmQgSmF2YVNjcmlwdCBlbmdpbmVzLlxuICAgIHZhciBuYXRpdmVKU09OID0gcm9vdC5KU09OLFxuICAgICAgICBwcmV2aW91c0pTT04gPSByb290W1wiSlNPTjNcIl0sXG4gICAgICAgIGlzUmVzdG9yZWQgPSBmYWxzZTtcblxuICAgIHZhciBKU09OMyA9IHJ1bkluQ29udGV4dChyb290LCAocm9vdFtcIkpTT04zXCJdID0ge1xuICAgICAgLy8gUHVibGljOiBSZXN0b3JlcyB0aGUgb3JpZ2luYWwgdmFsdWUgb2YgdGhlIGdsb2JhbCBgSlNPTmAgb2JqZWN0IGFuZFxuICAgICAgLy8gcmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgYEpTT04zYCBvYmplY3QuXG4gICAgICBcIm5vQ29uZmxpY3RcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWlzUmVzdG9yZWQpIHtcbiAgICAgICAgICBpc1Jlc3RvcmVkID0gdHJ1ZTtcbiAgICAgICAgICByb290LkpTT04gPSBuYXRpdmVKU09OO1xuICAgICAgICAgIHJvb3RbXCJKU09OM1wiXSA9IHByZXZpb3VzSlNPTjtcbiAgICAgICAgICBuYXRpdmVKU09OID0gcHJldmlvdXNKU09OID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSlNPTjM7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgcm9vdC5KU09OID0ge1xuICAgICAgXCJwYXJzZVwiOiBKU09OMy5wYXJzZSxcbiAgICAgIFwic3RyaW5naWZ5XCI6IEpTT04zLnN0cmluZ2lmeVxuICAgIH07XG4gIH1cblxuICAvLyBFeHBvcnQgZm9yIGFzeW5jaHJvbm91cyBtb2R1bGUgbG9hZGVycy5cbiAgaWYgKGlzTG9hZGVyKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBKU09OMztcbiAgICB9KTtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQgRmVsaXggR25hc3NcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogaHR0cDovL3NwaW4uanMub3JnL1xuICpcbiAqIEV4YW1wbGU6XG4gICAgdmFyIG9wdHMgPSB7XG4gICAgICBsaW5lczogMTIgICAgICAgICAgICAgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgLCBsZW5ndGg6IDcgICAgICAgICAgICAgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICAsIHdpZHRoOiA1ICAgICAgICAgICAgICAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICAsIHJhZGl1czogMTAgICAgICAgICAgICAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICAsIHNjYWxlOiAxLjAgICAgICAgICAgICAvLyBTY2FsZXMgb3ZlcmFsbCBzaXplIG9mIHRoZSBzcGlubmVyXG4gICAgLCBjb3JuZXJzOiAxICAgICAgICAgICAgLy8gUm91bmRuZXNzICgwLi4xKVxuICAgICwgY29sb3I6ICcjMDAwJyAgICAgICAgIC8vICNyZ2Igb3IgI3JyZ2diYlxuICAgICwgb3BhY2l0eTogMS80ICAgICAgICAgIC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXG4gICAgLCByb3RhdGU6IDAgICAgICAgICAgICAgLy8gUm90YXRpb24gb2Zmc2V0XG4gICAgLCBkaXJlY3Rpb246IDEgICAgICAgICAgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAgICwgc3BlZWQ6IDEgICAgICAgICAgICAgIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gICAgLCB0cmFpbDogMTAwICAgICAgICAgICAgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcbiAgICAsIGZwczogMjAgICAgICAgICAgICAgICAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKVxuICAgICwgekluZGV4OiAyZTkgICAgICAgICAgIC8vIFVzZSBhIGhpZ2ggei1pbmRleCBieSBkZWZhdWx0XG4gICAgLCBjbGFzc05hbWU6ICdzcGlubmVyJyAgLy8gQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgZWxlbWVudFxuICAgICwgdG9wOiAnNTAlJyAgICAgICAgICAgIC8vIGNlbnRlciB2ZXJ0aWNhbGx5XG4gICAgLCBsZWZ0OiAnNTAlJyAgICAgICAgICAgLy8gY2VudGVyIGhvcml6b250YWxseVxuICAgICwgc2hhZG93OiBmYWxzZSAgICAgICAgIC8vIFdoZXRoZXIgdG8gcmVuZGVyIGEgc2hhZG93XG4gICAgLCBod2FjY2VsOiBmYWxzZSAgICAgICAgLy8gV2hldGhlciB0byB1c2UgaGFyZHdhcmUgYWNjZWxlcmF0aW9uIChtaWdodCBiZSBidWdneSlcbiAgICAsIHBvc2l0aW9uOiAnYWJzb2x1dGUnICAvLyBFbGVtZW50IHBvc2l0aW9uaW5nXG4gICAgfVxuICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9vJylcbiAgICB2YXIgc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4odGFyZ2V0KVxuICovXG47KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5cbiAgLyogQ29tbW9uSlMgKi9cbiAgaWYgKHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpXG5cbiAgLyogQU1EIG1vZHVsZSAqL1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZhY3RvcnkpXG5cbiAgLyogQnJvd3NlciBnbG9iYWwgKi9cbiAgZWxzZSByb290LlNwaW5uZXIgPSBmYWN0b3J5KClcbn0odGhpcywgZnVuY3Rpb24gKCkge1xuICBcInVzZSBzdHJpY3RcIlxuXG4gIHZhciBwcmVmaXhlcyA9IFsnd2Via2l0JywgJ01veicsICdtcycsICdPJ10gLyogVmVuZG9yIHByZWZpeGVzICovXG4gICAgLCBhbmltYXRpb25zID0ge30gLyogQW5pbWF0aW9uIHJ1bGVzIGtleWVkIGJ5IHRoZWlyIG5hbWUgKi9cbiAgICAsIHVzZUNzc0FuaW1hdGlvbnMgLyogV2hldGhlciB0byB1c2UgQ1NTIGFuaW1hdGlvbnMgb3Igc2V0VGltZW91dCAqL1xuICAgICwgc2hlZXQgLyogQSBzdHlsZXNoZWV0IHRvIGhvbGQgdGhlIEBrZXlmcmFtZSBvciBWTUwgcnVsZXMuICovXG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGVsZW1lbnRzLiBJZiBubyB0YWcgbmFtZSBpcyBnaXZlbixcbiAgICogYSBESVYgaXMgY3JlYXRlZC4gT3B0aW9uYWxseSBwcm9wZXJ0aWVzIGNhbiBiZSBwYXNzZWQuXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVFbCAodGFnLCBwcm9wKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcgfHwgJ2RpdicpXG4gICAgICAsIG5cblxuICAgIGZvciAobiBpbiBwcm9wKSBlbFtuXSA9IHByb3Bbbl1cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGNoaWxkcmVuIGFuZCByZXR1cm5zIHRoZSBwYXJlbnQuXG4gICAqL1xuICBmdW5jdGlvbiBpbnMgKHBhcmVudCAvKiBjaGlsZDEsIGNoaWxkMiwgLi4uKi8pIHtcbiAgICBmb3IgKHZhciBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChhcmd1bWVudHNbaV0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmVudFxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gb3BhY2l0eSBrZXlmcmFtZSBhbmltYXRpb24gcnVsZSBhbmQgcmV0dXJucyBpdHMgbmFtZS5cbiAgICogU2luY2UgbW9zdCBtb2JpbGUgV2Via2l0cyBoYXZlIHRpbWluZyBpc3N1ZXMgd2l0aCBhbmltYXRpb24tZGVsYXksXG4gICAqIHdlIGNyZWF0ZSBzZXBhcmF0ZSBydWxlcyBmb3IgZWFjaCBsaW5lL3NlZ21lbnQuXG4gICAqL1xuICBmdW5jdGlvbiBhZGRBbmltYXRpb24gKGFscGhhLCB0cmFpbCwgaSwgbGluZXMpIHtcbiAgICB2YXIgbmFtZSA9IFsnb3BhY2l0eScsIHRyYWlsLCB+fihhbHBoYSAqIDEwMCksIGksIGxpbmVzXS5qb2luKCctJylcbiAgICAgICwgc3RhcnQgPSAwLjAxICsgaS9saW5lcyAqIDEwMFxuICAgICAgLCB6ID0gTWF0aC5tYXgoMSAtICgxLWFscGhhKSAvIHRyYWlsICogKDEwMC1zdGFydCksIGFscGhhKVxuICAgICAgLCBwcmVmaXggPSB1c2VDc3NBbmltYXRpb25zLnN1YnN0cmluZygwLCB1c2VDc3NBbmltYXRpb25zLmluZGV4T2YoJ0FuaW1hdGlvbicpKS50b0xvd2VyQ2FzZSgpXG4gICAgICAsIHByZSA9IHByZWZpeCAmJiAnLScgKyBwcmVmaXggKyAnLScgfHwgJydcblxuICAgIGlmICghYW5pbWF0aW9uc1tuYW1lXSkge1xuICAgICAgc2hlZXQuaW5zZXJ0UnVsZShcbiAgICAgICAgJ0AnICsgcHJlICsgJ2tleWZyYW1lcyAnICsgbmFtZSArICd7JyArXG4gICAgICAgICcwJXtvcGFjaXR5OicgKyB6ICsgJ30nICtcbiAgICAgICAgc3RhcnQgKyAnJXtvcGFjaXR5OicgKyBhbHBoYSArICd9JyArXG4gICAgICAgIChzdGFydCswLjAxKSArICcle29wYWNpdHk6MX0nICtcbiAgICAgICAgKHN0YXJ0K3RyYWlsKSAlIDEwMCArICcle29wYWNpdHk6JyArIGFscGhhICsgJ30nICtcbiAgICAgICAgJzEwMCV7b3BhY2l0eTonICsgeiArICd9JyArXG4gICAgICAgICd9Jywgc2hlZXQuY3NzUnVsZXMubGVuZ3RoKVxuXG4gICAgICBhbmltYXRpb25zW25hbWVdID0gMVxuICAgIH1cblxuICAgIHJldHVybiBuYW1lXG4gIH1cblxuICAvKipcbiAgICogVHJpZXMgdmFyaW91cyB2ZW5kb3IgcHJlZml4ZXMgYW5kIHJldHVybnMgdGhlIGZpcnN0IHN1cHBvcnRlZCBwcm9wZXJ0eS5cbiAgICovXG4gIGZ1bmN0aW9uIHZlbmRvciAoZWwsIHByb3ApIHtcbiAgICB2YXIgcyA9IGVsLnN0eWxlXG4gICAgICAsIHBwXG4gICAgICAsIGlcblxuICAgIHByb3AgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKVxuICAgIGlmIChzW3Byb3BdICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wXG4gICAgZm9yIChpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwcCA9IHByZWZpeGVzW2ldK3Byb3BcbiAgICAgIGlmIChzW3BwXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHBcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBtdWx0aXBsZSBzdHlsZSBwcm9wZXJ0aWVzIGF0IG9uY2UuXG4gICAqL1xuICBmdW5jdGlvbiBjc3MgKGVsLCBwcm9wKSB7XG4gICAgZm9yICh2YXIgbiBpbiBwcm9wKSB7XG4gICAgICBlbC5zdHlsZVt2ZW5kb3IoZWwsIG4pIHx8IG5dID0gcHJvcFtuXVxuICAgIH1cblxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgLyoqXG4gICAqIEZpbGxzIGluIGRlZmF1bHQgdmFsdWVzLlxuICAgKi9cbiAgZnVuY3Rpb24gbWVyZ2UgKG9iaikge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVmID0gYXJndW1lbnRzW2ldXG4gICAgICBmb3IgKHZhciBuIGluIGRlZikge1xuICAgICAgICBpZiAob2JqW25dID09PSB1bmRlZmluZWQpIG9ialtuXSA9IGRlZltuXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGluZSBjb2xvciBmcm9tIHRoZSBnaXZlbiBzdHJpbmcgb3IgYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiBnZXRDb2xvciAoY29sb3IsIGlkeCkge1xuICAgIHJldHVybiB0eXBlb2YgY29sb3IgPT0gJ3N0cmluZycgPyBjb2xvciA6IGNvbG9yW2lkeCAlIGNvbG9yLmxlbmd0aF1cbiAgfVxuXG4gIC8vIEJ1aWx0LWluIGRlZmF1bHRzXG5cbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGxpbmVzOiAxMiAgICAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgLCBsZW5ndGg6IDcgICAgICAgICAgICAgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgLCB3aWR0aDogNSAgICAgICAgICAgICAgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICwgcmFkaXVzOiAxMCAgICAgICAgICAgIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAsIHNjYWxlOiAxLjAgICAgICAgICAgICAvLyBTY2FsZXMgb3ZlcmFsbCBzaXplIG9mIHRoZSBzcGlubmVyXG4gICwgY29ybmVyczogMSAgICAgICAgICAgIC8vIFJvdW5kbmVzcyAoMC4uMSlcbiAgLCBjb2xvcjogJyMwMDAnICAgICAgICAgLy8gI3JnYiBvciAjcnJnZ2JiXG4gICwgb3BhY2l0eTogMS80ICAgICAgICAgIC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXG4gICwgcm90YXRlOiAwICAgICAgICAgICAgIC8vIFJvdGF0aW9uIG9mZnNldFxuICAsIGRpcmVjdGlvbjogMSAgICAgICAgICAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXG4gICwgc3BlZWQ6IDEgICAgICAgICAgICAgIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gICwgdHJhaWw6IDEwMCAgICAgICAgICAgIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXG4gICwgZnBzOiAyMCAgICAgICAgICAgICAgIC8vIEZyYW1lcyBwZXIgc2Vjb25kIHdoZW4gdXNpbmcgc2V0VGltZW91dCgpXG4gICwgekluZGV4OiAyZTkgICAgICAgICAgIC8vIFVzZSBhIGhpZ2ggei1pbmRleCBieSBkZWZhdWx0XG4gICwgY2xhc3NOYW1lOiAnc3Bpbm5lcicgIC8vIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIGVsZW1lbnRcbiAgLCB0b3A6ICc1MCUnICAgICAgICAgICAgLy8gY2VudGVyIHZlcnRpY2FsbHlcbiAgLCBsZWZ0OiAnNTAlJyAgICAgICAgICAgLy8gY2VudGVyIGhvcml6b250YWxseVxuICAsIHNoYWRvdzogZmFsc2UgICAgICAgICAvLyBXaGV0aGVyIHRvIHJlbmRlciBhIHNoYWRvd1xuICAsIGh3YWNjZWw6IGZhbHNlICAgICAgICAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb24gKG1pZ2h0IGJlIGJ1Z2d5KVxuICAsIHBvc2l0aW9uOiAnYWJzb2x1dGUnICAvLyBFbGVtZW50IHBvc2l0aW9uaW5nXG4gIH1cblxuICAvKiogVGhlIGNvbnN0cnVjdG9yICovXG4gIGZ1bmN0aW9uIFNwaW5uZXIgKG8pIHtcbiAgICB0aGlzLm9wdHMgPSBtZXJnZShvIHx8IHt9LCBTcGlubmVyLmRlZmF1bHRzLCBkZWZhdWx0cylcbiAgfVxuXG4gIC8vIEdsb2JhbCBkZWZhdWx0cyB0aGF0IG92ZXJyaWRlIHRoZSBidWlsdC1pbnM6XG4gIFNwaW5uZXIuZGVmYXVsdHMgPSB7fVxuXG4gIG1lcmdlKFNwaW5uZXIucHJvdG90eXBlLCB7XG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgc3Bpbm5lciB0byB0aGUgZ2l2ZW4gdGFyZ2V0IGVsZW1lbnQuIElmIHRoaXMgaW5zdGFuY2UgaXMgYWxyZWFkeVxuICAgICAqIHNwaW5uaW5nLCBpdCBpcyBhdXRvbWF0aWNhbGx5IHJlbW92ZWQgZnJvbSBpdHMgcHJldmlvdXMgdGFyZ2V0IGIgY2FsbGluZ1xuICAgICAqIHN0b3AoKSBpbnRlcm5hbGx5LlxuICAgICAqL1xuICAgIHNwaW46IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIHRoaXMuc3RvcCgpXG5cbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAsIG8gPSBzZWxmLm9wdHNcbiAgICAgICAgLCBlbCA9IHNlbGYuZWwgPSBjcmVhdGVFbChudWxsLCB7Y2xhc3NOYW1lOiBvLmNsYXNzTmFtZX0pXG5cbiAgICAgIGNzcyhlbCwge1xuICAgICAgICBwb3NpdGlvbjogby5wb3NpdGlvblxuICAgICAgLCB3aWR0aDogMFxuICAgICAgLCB6SW5kZXg6IG8uekluZGV4XG4gICAgICAsIGxlZnQ6IG8ubGVmdFxuICAgICAgLCB0b3A6IG8udG9wXG4gICAgICB9KVxuXG4gICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5maXJzdENoaWxkIHx8IG51bGwpXG4gICAgICB9XG5cbiAgICAgIGVsLnNldEF0dHJpYnV0ZSgncm9sZScsICdwcm9ncmVzc2JhcicpXG4gICAgICBzZWxmLmxpbmVzKGVsLCBzZWxmLm9wdHMpXG5cbiAgICAgIGlmICghdXNlQ3NzQW5pbWF0aW9ucykge1xuICAgICAgICAvLyBObyBDU1MgYW5pbWF0aW9uIHN1cHBvcnQsIHVzZSBzZXRUaW1lb3V0KCkgaW5zdGVhZFxuICAgICAgICB2YXIgaSA9IDBcbiAgICAgICAgICAsIHN0YXJ0ID0gKG8ubGluZXMgLSAxKSAqICgxIC0gby5kaXJlY3Rpb24pIC8gMlxuICAgICAgICAgICwgYWxwaGFcbiAgICAgICAgICAsIGZwcyA9IG8uZnBzXG4gICAgICAgICAgLCBmID0gZnBzIC8gby5zcGVlZFxuICAgICAgICAgICwgb3N0ZXAgPSAoMSAtIG8ub3BhY2l0eSkgLyAoZiAqIG8udHJhaWwgLyAxMDApXG4gICAgICAgICAgLCBhc3RlcCA9IGYgLyBvLmxpbmVzXG5cbiAgICAgICAgOyhmdW5jdGlvbiBhbmltICgpIHtcbiAgICAgICAgICBpKytcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG8ubGluZXM7IGorKykge1xuICAgICAgICAgICAgYWxwaGEgPSBNYXRoLm1heCgxIC0gKGkgKyAoby5saW5lcyAtIGopICogYXN0ZXApICUgZiAqIG9zdGVwLCBvLm9wYWNpdHkpXG5cbiAgICAgICAgICAgIHNlbGYub3BhY2l0eShlbCwgaiAqIG8uZGlyZWN0aW9uICsgc3RhcnQsIGFscGhhLCBvKVxuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLnRpbWVvdXQgPSBzZWxmLmVsICYmIHNldFRpbWVvdXQoYW5pbSwgfn4oMTAwMCAvIGZwcykpXG4gICAgICAgIH0pKClcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxmXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgYW5kIHJlbW92ZXMgdGhlIFNwaW5uZXIuXG4gICAgICovXG4gICwgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVsID0gdGhpcy5lbFxuICAgICAgaWYgKGVsKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICAgIGlmIChlbC5wYXJlbnROb2RlKSBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxuICAgICAgICB0aGlzLmVsID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIG1ldGhvZCB0aGF0IGRyYXdzIHRoZSBpbmRpdmlkdWFsIGxpbmVzLiBXaWxsIGJlIG92ZXJ3cml0dGVuXG4gICAgICogaW4gVk1MIGZhbGxiYWNrIG1vZGUgYmVsb3cuXG4gICAgICovXG4gICwgbGluZXM6IGZ1bmN0aW9uIChlbCwgbykge1xuICAgICAgdmFyIGkgPSAwXG4gICAgICAgICwgc3RhcnQgPSAoby5saW5lcyAtIDEpICogKDEgLSBvLmRpcmVjdGlvbikgLyAyXG4gICAgICAgICwgc2VnXG5cbiAgICAgIGZ1bmN0aW9uIGZpbGwgKGNvbG9yLCBzaGFkb3cpIHtcbiAgICAgICAgcmV0dXJuIGNzcyhjcmVhdGVFbCgpLCB7XG4gICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZSdcbiAgICAgICAgLCB3aWR0aDogby5zY2FsZSAqIChvLmxlbmd0aCArIG8ud2lkdGgpICsgJ3B4J1xuICAgICAgICAsIGhlaWdodDogby5zY2FsZSAqIG8ud2lkdGggKyAncHgnXG4gICAgICAgICwgYmFja2dyb3VuZDogY29sb3JcbiAgICAgICAgLCBib3hTaGFkb3c6IHNoYWRvd1xuICAgICAgICAsIHRyYW5zZm9ybU9yaWdpbjogJ2xlZnQnXG4gICAgICAgICwgdHJhbnNmb3JtOiAncm90YXRlKCcgKyB+figzNjAvby5saW5lcyppICsgby5yb3RhdGUpICsgJ2RlZykgdHJhbnNsYXRlKCcgKyBvLnNjYWxlKm8ucmFkaXVzICsgJ3B4JyArICcsMCknXG4gICAgICAgICwgYm9yZGVyUmFkaXVzOiAoby5jb3JuZXJzICogby5zY2FsZSAqIG8ud2lkdGggPj4gMSkgKyAncHgnXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGZvciAoOyBpIDwgby5saW5lczsgaSsrKSB7XG4gICAgICAgIHNlZyA9IGNzcyhjcmVhdGVFbCgpLCB7XG4gICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZSdcbiAgICAgICAgLCB0b3A6IDEgKyB+KG8uc2NhbGUgKiBvLndpZHRoIC8gMikgKyAncHgnXG4gICAgICAgICwgdHJhbnNmb3JtOiBvLmh3YWNjZWwgPyAndHJhbnNsYXRlM2QoMCwwLDApJyA6ICcnXG4gICAgICAgICwgb3BhY2l0eTogby5vcGFjaXR5XG4gICAgICAgICwgYW5pbWF0aW9uOiB1c2VDc3NBbmltYXRpb25zICYmIGFkZEFuaW1hdGlvbihvLm9wYWNpdHksIG8udHJhaWwsIHN0YXJ0ICsgaSAqIG8uZGlyZWN0aW9uLCBvLmxpbmVzKSArICcgJyArIDEgLyBvLnNwZWVkICsgJ3MgbGluZWFyIGluZmluaXRlJ1xuICAgICAgICB9KVxuXG4gICAgICAgIGlmIChvLnNoYWRvdykgaW5zKHNlZywgY3NzKGZpbGwoJyMwMDAnLCAnMCAwIDRweCAjMDAwJyksIHt0b3A6ICcycHgnfSkpXG4gICAgICAgIGlucyhlbCwgaW5zKHNlZywgZmlsbChnZXRDb2xvcihvLmNvbG9yLCBpKSwgJzAgMCAxcHggcmdiYSgwLDAsMCwuMSknKSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gZWxcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbCBtZXRob2QgdGhhdCBhZGp1c3RzIHRoZSBvcGFjaXR5IG9mIGEgc2luZ2xlIGxpbmUuXG4gICAgICogV2lsbCBiZSBvdmVyd3JpdHRlbiBpbiBWTUwgZmFsbGJhY2sgbW9kZSBiZWxvdy5cbiAgICAgKi9cbiAgLCBvcGFjaXR5OiBmdW5jdGlvbiAoZWwsIGksIHZhbCkge1xuICAgICAgaWYgKGkgPCBlbC5jaGlsZE5vZGVzLmxlbmd0aCkgZWwuY2hpbGROb2Rlc1tpXS5zdHlsZS5vcGFjaXR5ID0gdmFsXG4gICAgfVxuXG4gIH0pXG5cblxuICBmdW5jdGlvbiBpbml0Vk1MICgpIHtcblxuICAgIC8qIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgVk1MIHRhZyAqL1xuICAgIGZ1bmN0aW9uIHZtbCAodGFnLCBhdHRyKSB7XG4gICAgICByZXR1cm4gY3JlYXRlRWwoJzwnICsgdGFnICsgJyB4bWxucz1cInVybjpzY2hlbWFzLW1pY3Jvc29mdC5jb206dm1sXCIgY2xhc3M9XCJzcGluLXZtbFwiPicsIGF0dHIpXG4gICAgfVxuXG4gICAgLy8gTm8gQ1NTIHRyYW5zZm9ybXMgYnV0IFZNTCBzdXBwb3J0LCBhZGQgYSBDU1MgcnVsZSBmb3IgVk1MIGVsZW1lbnRzOlxuICAgIHNoZWV0LmFkZFJ1bGUoJy5zcGluLXZtbCcsICdiZWhhdmlvcjp1cmwoI2RlZmF1bHQjVk1MKScpXG5cbiAgICBTcGlubmVyLnByb3RvdHlwZS5saW5lcyA9IGZ1bmN0aW9uIChlbCwgbykge1xuICAgICAgdmFyIHIgPSBvLnNjYWxlICogKG8ubGVuZ3RoICsgby53aWR0aClcbiAgICAgICAgLCBzID0gby5zY2FsZSAqIDIgKiByXG5cbiAgICAgIGZ1bmN0aW9uIGdycCAoKSB7XG4gICAgICAgIHJldHVybiBjc3MoXG4gICAgICAgICAgdm1sKCdncm91cCcsIHtcbiAgICAgICAgICAgIGNvb3Jkc2l6ZTogcyArICcgJyArIHNcbiAgICAgICAgICAsIGNvb3Jkb3JpZ2luOiAtciArICcgJyArIC1yXG4gICAgICAgICAgfSlcbiAgICAgICAgLCB7IHdpZHRoOiBzLCBoZWlnaHQ6IHMgfVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHZhciBtYXJnaW4gPSAtKG8ud2lkdGggKyBvLmxlbmd0aCkgKiBvLnNjYWxlICogMiArICdweCdcbiAgICAgICAgLCBnID0gY3NzKGdycCgpLCB7cG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogbWFyZ2luLCBsZWZ0OiBtYXJnaW59KVxuICAgICAgICAsIGlcblxuICAgICAgZnVuY3Rpb24gc2VnIChpLCBkeCwgZmlsdGVyKSB7XG4gICAgICAgIGlucyhcbiAgICAgICAgICBnXG4gICAgICAgICwgaW5zKFxuICAgICAgICAgICAgY3NzKGdycCgpLCB7cm90YXRpb246IDM2MCAvIG8ubGluZXMgKiBpICsgJ2RlZycsIGxlZnQ6IH5+ZHh9KVxuICAgICAgICAgICwgaW5zKFxuICAgICAgICAgICAgICBjc3MoXG4gICAgICAgICAgICAgICAgdm1sKCdyb3VuZHJlY3QnLCB7YXJjc2l6ZTogby5jb3JuZXJzfSlcbiAgICAgICAgICAgICAgLCB7IHdpZHRoOiByXG4gICAgICAgICAgICAgICAgLCBoZWlnaHQ6IG8uc2NhbGUgKiBvLndpZHRoXG4gICAgICAgICAgICAgICAgLCBsZWZ0OiBvLnNjYWxlICogby5yYWRpdXNcbiAgICAgICAgICAgICAgICAsIHRvcDogLW8uc2NhbGUgKiBvLndpZHRoID4+IDFcbiAgICAgICAgICAgICAgICAsIGZpbHRlcjogZmlsdGVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAsIHZtbCgnZmlsbCcsIHtjb2xvcjogZ2V0Q29sb3Ioby5jb2xvciwgaSksIG9wYWNpdHk6IG8ub3BhY2l0eX0pXG4gICAgICAgICAgICAsIHZtbCgnc3Ryb2tlJywge29wYWNpdHk6IDB9KSAvLyB0cmFuc3BhcmVudCBzdHJva2UgdG8gZml4IGNvbG9yIGJsZWVkaW5nIHVwb24gb3BhY2l0eSBjaGFuZ2VcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKG8uc2hhZG93KVxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IG8ubGluZXM7IGkrKykge1xuICAgICAgICAgIHNlZyhpLCAtMiwgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5CbHVyKHBpeGVscmFkaXVzPTIsbWFrZXNoYWRvdz0xLHNoYWRvd29wYWNpdHk9LjMpJylcbiAgICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAxOyBpIDw9IG8ubGluZXM7IGkrKykgc2VnKGkpXG4gICAgICByZXR1cm4gaW5zKGVsLCBnKVxuICAgIH1cblxuICAgIFNwaW5uZXIucHJvdG90eXBlLm9wYWNpdHkgPSBmdW5jdGlvbiAoZWwsIGksIHZhbCwgbykge1xuICAgICAgdmFyIGMgPSBlbC5maXJzdENoaWxkXG4gICAgICBvID0gby5zaGFkb3cgJiYgby5saW5lcyB8fCAwXG4gICAgICBpZiAoYyAmJiBpICsgbyA8IGMuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgYyA9IGMuY2hpbGROb2Rlc1tpICsgb107IGMgPSBjICYmIGMuZmlyc3RDaGlsZDsgYyA9IGMgJiYgYy5maXJzdENoaWxkXG4gICAgICAgIGlmIChjKSBjLm9wYWNpdHkgPSB2YWxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHNoZWV0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlbCA9IGNyZWF0ZUVsKCdzdHlsZScsIHt0eXBlIDogJ3RleHQvY3NzJ30pXG4gICAgICBpbnMoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSwgZWwpXG4gICAgICByZXR1cm4gZWwuc2hlZXQgfHwgZWwuc3R5bGVTaGVldFxuICAgIH0oKSlcblxuICAgIHZhciBwcm9iZSA9IGNzcyhjcmVhdGVFbCgnZ3JvdXAnKSwge2JlaGF2aW9yOiAndXJsKCNkZWZhdWx0I1ZNTCknfSlcblxuICAgIGlmICghdmVuZG9yKHByb2JlLCAndHJhbnNmb3JtJykgJiYgcHJvYmUuYWRqKSBpbml0Vk1MKClcbiAgICBlbHNlIHVzZUNzc0FuaW1hdGlvbnMgPSB2ZW5kb3IocHJvYmUsICdhbmltYXRpb24nKVxuICB9XG5cbiAgcmV0dXJuIFNwaW5uZXJcblxufSkpO1xuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ3JlZHVjZScpO1xuXG4vKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbnZhciByb290ID0gJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvd1xuICA/IHRoaXNcbiAgOiB3aW5kb3c7XG5cbi8qKlxuICogTm9vcC5cbiAqL1xuXG5mdW5jdGlvbiBub29wKCl7fTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGhvc3Qgb2JqZWN0LFxuICogd2UgZG9uJ3Qgd2FudCB0byBzZXJpYWxpemUgdGhlc2UgOilcbiAqXG4gKiBUT0RPOiBmdXR1cmUgcHJvb2YsIG1vdmUgdG8gY29tcG9lbnQgbGFuZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0hvc3Qob2JqKSB7XG4gIHZhciBzdHIgPSB7fS50b1N0cmluZy5jYWxsKG9iaik7XG5cbiAgc3dpdGNoIChzdHIpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZpbGVdJzpcbiAgICBjYXNlICdbb2JqZWN0IEJsb2JdJzpcbiAgICBjYXNlICdbb2JqZWN0IEZvcm1EYXRhXSc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIFhIUi5cbiAqL1xuXG5mdW5jdGlvbiBnZXRYSFIoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgJiYgKCdmaWxlOicgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbCB8fCAhcm9vdC5BY3RpdmVYT2JqZWN0KSkge1xuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC42LjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuMy4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAobnVsbCAhPSBvYmpba2V5XSkge1xuICAgICAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICAgICArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvYmpba2V5XSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFpcnMuam9pbignJicpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHBhaXI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBhcnRzID0gcGFpci5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBtaW1lIHR5cGUgZm9yIHRoZSBnaXZlbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0eXBlKHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoLyAqOyAqLykuc2hpZnQoKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGhlYWRlciBmaWVsZCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcmFtcyhzdHIpe1xuICByZXR1cm4gcmVkdWNlKHN0ci5zcGxpdCgvICo7ICovKSwgZnVuY3Rpb24ob2JqLCBzdHIpe1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICo9ICovKVxuICAgICAgLCBrZXkgPSBwYXJ0cy5zaGlmdCgpXG4gICAgICAsIHZhbCA9IHBhcnRzLnNoaWZ0KCk7XG5cbiAgICBpZiAoa2V5ICYmIHZhbCkgb2JqW2tleV0gPSB2YWw7XG4gICAgcmV0dXJuIG9iajtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZWAgd2l0aCB0aGUgZ2l2ZW4gYHhocmAuXG4gKlxuICogIC0gc2V0IGZsYWdzICgub2ssIC5lcnJvciwgZXRjKVxuICogIC0gcGFyc2UgaGVhZGVyXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogIEFsaWFzaW5nIGBzdXBlcmFnZW50YCBhcyBgcmVxdWVzdGAgaXMgbmljZTpcbiAqXG4gKiAgICAgIHJlcXVlc3QgPSBzdXBlcmFnZW50O1xuICpcbiAqICBXZSBjYW4gdXNlIHRoZSBwcm9taXNlLWxpa2UgQVBJLCBvciBwYXNzIGNhbGxiYWNrczpcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJykuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJywgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgU2VuZGluZyBkYXRhIGNhbiBiZSBjaGFpbmVkOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5zZW5kKClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnBvc3QoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIE9yIGZ1cnRoZXIgcmVkdWNlZCB0byBhIHNpbmdsZSBjYWxsIGZvciBzaW1wbGUgY2FzZXM6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogQHBhcmFtIHtYTUxIVFRQUmVxdWVzdH0geGhyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2UocmVxLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLnJlcSA9IHJlcTtcbiAgdGhpcy54aHIgPSB0aGlzLnJlcS54aHI7XG4gIHRoaXMudGV4dCA9IHRoaXMucmVxLm1ldGhvZCAhPSdIRUFEJyBcbiAgICAgPyB0aGlzLnhoci5yZXNwb25zZVRleHQgXG4gICAgIDogbnVsbDtcbiAgdGhpcy5zZXRTdGF0dXNQcm9wZXJ0aWVzKHRoaXMueGhyLnN0YXR1cyk7XG4gIHRoaXMuaGVhZGVyID0gdGhpcy5oZWFkZXJzID0gcGFyc2VIZWFkZXIodGhpcy54aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAvLyBnZXRBbGxSZXNwb25zZUhlYWRlcnMgc29tZXRpbWVzIGZhbHNlbHkgcmV0dXJucyBcIlwiIGZvciBDT1JTIHJlcXVlc3RzLCBidXRcbiAgLy8gZ2V0UmVzcG9uc2VIZWFkZXIgc3RpbGwgd29ya3MuIHNvIHdlIGdldCBjb250ZW50LXR5cGUgZXZlbiBpZiBnZXR0aW5nXG4gIC8vIG90aGVyIGhlYWRlcnMgZmFpbHMuXG4gIHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSA9IHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKTtcbiAgdGhpcy5zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcbiAgdGhpcy5ib2R5ID0gdGhpcy5yZXEubWV0aG9kICE9ICdIRUFEJ1xuICAgID8gdGhpcy5wYXJzZUJvZHkodGhpcy50ZXh0KVxuICAgIDogbnVsbDtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbihoZWFkZXIpe1xuICAvLyBjb250ZW50LXR5cGVcbiAgdmFyIGN0ID0gdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB0eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgdmFyIG9iaiA9IHBhcmFtcyhjdCk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHRoaXNba2V5XSA9IG9ialtrZXldO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIHJldHVybiBwYXJzZSAmJiBzdHIgJiYgc3RyLmxlbmd0aFxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbihzdGF0dXMpe1xuICB2YXIgdHlwZSA9IHN0YXR1cyAvIDEwMCB8IDA7XG5cbiAgLy8gc3RhdHVzIC8gY2xhc3NcbiAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IDEgPT0gdHlwZTtcbiAgdGhpcy5vayA9IDIgPT0gdHlwZTtcbiAgdGhpcy5jbGllbnRFcnJvciA9IDQgPT0gdHlwZTtcbiAgdGhpcy5zZXJ2ZXJFcnJvciA9IDUgPT0gdHlwZTtcbiAgdGhpcy5lcnJvciA9ICg0ID09IHR5cGUgfHwgNSA9PSB0eXBlKVxuICAgID8gdGhpcy50b0Vycm9yKClcbiAgICA6IGZhbHNlO1xuXG4gIC8vIHN1Z2FyXG4gIHRoaXMuYWNjZXB0ZWQgPSAyMDIgPT0gc3RhdHVzO1xuICB0aGlzLm5vQ29udGVudCA9IDIwNCA9PSBzdGF0dXMgfHwgMTIyMyA9PSBzdGF0dXM7XG4gIHRoaXMuYmFkUmVxdWVzdCA9IDQwMCA9PSBzdGF0dXM7XG4gIHRoaXMudW5hdXRob3JpemVkID0gNDAxID09IHN0YXR1cztcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gNDA2ID09IHN0YXR1cztcbiAgdGhpcy5ub3RGb3VuZCA9IDQwNCA9PSBzdGF0dXM7XG4gIHRoaXMuZm9yYmlkZGVuID0gNDAzID09IHN0YXR1cztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVxID0gdGhpcy5yZXE7XG4gIHZhciBtZXRob2QgPSByZXEubWV0aG9kO1xuICB2YXIgdXJsID0gcmVxLnVybDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgdXJsICsgJyAoJyArIHRoaXMuc3RhdHVzICsgJyknO1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZXJyID0gbnVsbDtcbiAgICB2YXIgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7IFxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGU7XG4gICAgfVxuXG4gICAgc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYC5cbiAqL1xuXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aW1lb3V0IHRvIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKG1zKXtcbiAgdGhpcy5fdGltZW91dCA9IG1zO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xlYXIgcHJldmlvdXMgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fdGltZW91dCA9IDA7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuYWJvcnRlZCkgcmV0dXJuO1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICB0aGlzLnhoci5hYm9ydCgpO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihmaWVsZCwgdmFsKXtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBmaWVsZCkge1xuICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgaGVhZGVyIGBmaWVsZGAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmdldEhlYWRlciA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdBY2NlcHQnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEF1dGhvcml6YXRpb24gZmllbGQgdmFsdWUgd2l0aCBgdXNlcmAgYW5kIGBwYXNzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IHBhc3NcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcyl7XG4gIHZhciBzdHIgPSBidG9hKHVzZXIgKyAnOicgKyBwYXNzKTtcbiAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIHN0cik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4qXG4qIEV4YW1wbGVzOlxuKlxuKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbipcbiogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4qIEBhcGkgcHVibGljXG4qL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB2YWwgPSBzZXJpYWxpemUodmFsKTtcbiAgaWYgKHZhbCkgdGhpcy5fcXVlcnkucHVzaCh2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAgZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiXG4gKiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZX0gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChmaWVsZCwgZmlsZSwgZmlsZW5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAsIGRlZmF1bHRpbmcgdGhlIGAudHlwZSgpYCB0byBcImpzb25cIiB3aGVuXG4gKiBhbiBvYmplY3QgaXMgZ2l2ZW4uXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICAgLy8gcXVlcnlzdHJpbmdcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtdWx0aXBsZSBkYXRhIFwid3JpdGVzXCJcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLnNlbmQoeyBzZWFyY2g6ICdxdWVyeScgfSlcbiAqICAgICAgICAgLnNlbmQoeyByYW5nZTogJzEuLjUnIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgb3JkZXI6ICdkZXNjJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoJ25hbWU9dGonKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBkZWZhdWx0cyB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgKiAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAgKiAgICAgICAgLnNlbmQoJ3NwZWNpZXM9ZmVycmV0JylcbiAgKiAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSl7XG4gIHZhciBvYmogPSBpc09iamVjdChkYXRhKTtcbiAgdmFyIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG5cbiAgLy8gbWVyZ2VcbiAgaWYgKG9iaiAmJiBpc09iamVjdCh0aGlzLl9kYXRhKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9IGVsc2UgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBkYXRhKSB7XG4gICAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2Zvcm0nKTtcbiAgICB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyA9PSB0eXBlKSB7XG4gICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGF0YVxuICAgICAgICA/IHRoaXMuX2RhdGEgKyAnJicgKyBkYXRhXG4gICAgICAgIDogZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGF0YSA9ICh0aGlzLl9kYXRhIHx8ICcnKSArIGRhdGE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgaWYgKCFvYmopIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICBpZiAoMiA9PSBmbi5sZW5ndGgpIHJldHVybiBmbihlcnIsIHJlcyk7XG4gIGlmIChlcnIpIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgZm4ocmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ09yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXRFcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcigndGltZW91dCBvZiAnICsgdGltZW91dCArICdtcyBleGNlZWRlZCcpO1xuICBlcnIudGltZW91dCA9IHRpbWVvdXQ7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogRW5hYmxlIHRyYW5zbWlzc2lvbiBvZiBjb29raWVzIHdpdGggeC1kb21haW4gcmVxdWVzdHMuXG4gKlxuICogTm90ZSB0aGF0IGZvciB0aGlzIHRvIHdvcmsgdGhlIG9yaWdpbiBtdXN0IG5vdCBiZVxuICogdXNpbmcgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiB3aXRoIGEgd2lsZGNhcmQsXG4gKiBhbmQgYWxzbyBtdXN0IHNldCBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCJcbiAqIHRvIFwidHJ1ZVwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUud2l0aENyZWRlbnRpYWxzID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fd2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihyZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHhociA9IHRoaXMueGhyID0gZ2V0WEhSKCk7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuICAgIGlmICgwID09IHhoci5zdGF0dXMpIHtcbiAgICAgIGlmIChzZWxmLmFib3J0ZWQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIGlmICh4aHIudXBsb2FkKSB7XG4gICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gZnVuY3Rpb24oZSl7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgJiYgIXRoaXMuX3RpbWVyKSB7XG4gICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBzZWxmLmFib3J0KCk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICAvLyBxdWVyeXN0cmluZ1xuICBpZiAocXVlcnkpIHtcbiAgICBxdWVyeSA9IHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0KHF1ZXJ5KTtcbiAgICB0aGlzLnVybCArPSB+dGhpcy51cmwuaW5kZXhPZignPycpXG4gICAgICA/ICcmJyArIHF1ZXJ5XG4gICAgICA6ICc/JyArIHF1ZXJ5O1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICFpc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpXTtcbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yICh2YXIgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAobnVsbCA9PSB0aGlzLmhlYWRlcltmaWVsZF0pIGNvbnRpbnVlO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcbiAgeGhyLnNlbmQoZGF0YSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlcXVlc3RgLlxuICovXG5cbnJlcXVlc3QuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogSXNzdWUgYSByZXF1ZXN0OlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgIHJlcXVlc3QoJ0dFVCcsICcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnLCBjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gdXJsIG9yIGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiByZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB1cmwpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVxdWVzdChtZXRob2QsIHVybCk7XG59XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEhFQUQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5kZWwgPSBmdW5jdGlvbih1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiXG4vKipcbiAqIFJlZHVjZSBgYXJyYCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFxuICpcbiAqIFRPRE86IGNvbWJhdGlibGUgZXJyb3IgaGFuZGxpbmc/XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuLCBpbml0aWFsKXsgIFxuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gIHZhciBjdXJyID0gYXJndW1lbnRzLmxlbmd0aCA9PSAzXG4gICAgPyBpbml0aWFsXG4gICAgOiBhcnJbaWR4KytdO1xuXG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICBjdXJyID0gZm4uY2FsbChudWxsLCBjdXJyLCBhcnJbaWR4XSwgKytpZHgsIGFycik7XG4gIH1cbiAgXG4gIHJldHVybiBjdXJyO1xufTsiLCJ2YXIgS2VlbiA9IHJlcXVpcmUoXCIuL2luZGV4XCIpLFxuICAgIGVhY2ggPSByZXF1aXJlKFwiLi91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBsb2FkZWQgPSB3aW5kb3dbJ0tlZW4nXSB8fCBudWxsLFxuICAgICAgY2FjaGVkID0gd2luZG93WydfJyArICdLZWVuJ10gfHwgbnVsbCxcbiAgICAgIGNsaWVudHMsXG4gICAgICByZWFkeTtcblxuICBpZiAobG9hZGVkICYmIGNhY2hlZCkge1xuICAgIGNsaWVudHMgPSBjYWNoZWRbJ2NsaWVudHMnXSB8fCB7fSxcbiAgICByZWFkeSA9IGNhY2hlZFsncmVhZHknXSB8fCBbXTtcblxuICAgIGVhY2goY2xpZW50cywgZnVuY3Rpb24oY2xpZW50LCBpZCl7XG5cbiAgICAgIGVhY2goS2Vlbi5wcm90b3R5cGUsIGZ1bmN0aW9uKG1ldGhvZCwga2V5KXtcbiAgICAgICAgbG9hZGVkLnByb3RvdHlwZVtrZXldID0gbWV0aG9kO1xuICAgICAgfSk7XG5cbiAgICAgIGVhY2goW1wiUXVlcnlcIiwgXCJSZXF1ZXN0XCIsIFwiRGF0YXNldFwiLCBcIkRhdGF2aXpcIl0sIGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICBsb2FkZWRbbmFtZV0gPSAoS2VlbltuYW1lXSkgPyBLZWVuW25hbWVdIDogZnVuY3Rpb24oKXt9O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFJ1biBjb25maWdcbiAgICAgIGlmIChjbGllbnQuX2NvbmZpZykge1xuICAgICAgICBjbGllbnQuY29uZmlndXJlLmNhbGwoY2xpZW50LCBjbGllbnQuX2NvbmZpZyk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBHbG9iYWwgUHJvcGVydGllc1xuICAgICAgaWYgKGNsaWVudC5fc2V0R2xvYmFsUHJvcGVydGllcykge1xuICAgICAgICBlYWNoKGNsaWVudC5fc2V0R2xvYmFsUHJvcGVydGllcywgZnVuY3Rpb24oZm4pe1xuICAgICAgICAgIGNsaWVudC5zZXRHbG9iYWxQcm9wZXJ0aWVzLmFwcGx5KGNsaWVudCwgZm4pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gU2VuZCBRdWV1ZWQgRXZlbnRzXG4gICAgICBpZiAoY2xpZW50Ll9hZGRFdmVudCkge1xuICAgICAgICBlYWNoKGNsaWVudC5fYWRkRXZlbnQsIGZ1bmN0aW9uKG9iail7XG4gICAgICAgICAgY2xpZW50LmFkZEV2ZW50LmFwcGx5KGNsaWVudCwgb2JqKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCBldmVudCBsaXN0ZW5lcnNcbiAgICAgIHZhciBjYWxsYmFjayA9IGNsaWVudC5fb24gfHwgW107XG4gICAgICBpZiAoY2xpZW50Ll9vbikge1xuICAgICAgICBlYWNoKGNsaWVudC5fb24sIGZ1bmN0aW9uKG9iail7XG4gICAgICAgICAgY2xpZW50Lm9uLmFwcGx5KGNsaWVudCwgb2JqKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNsaWVudC50cmlnZ2VyKCdyZWFkeScpO1xuICAgICAgfVxuXG4gICAgICAvLyB1bnNldCBjb25maWdcbiAgICAgIGVhY2goW1wiX2NvbmZpZ1wiLCBcIl9zZXRHbG9iYWxQcm9wZXJ0aWVzXCIsIFwiX2FkZEV2ZW50XCIsIFwiX29uXCJdLCBmdW5jdGlvbihuYW1lKXtcbiAgICAgICAgaWYgKGNsaWVudFtuYW1lXSkge1xuICAgICAgICAgIGNsaWVudFtuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB0cnl7XG4gICAgICAgICAgICBkZWxldGUgY2xpZW50W25hbWVdO1xuICAgICAgICAgIH0gY2F0Y2goZSl7fVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgZWFjaChyZWFkeSwgZnVuY3Rpb24oY2IsIGkpe1xuICAgICAgS2Vlbi5vbmNlKFwicmVhZHlcIiwgY2IpO1xuICAgIH0pO1xuICB9XG5cbiAgd2luZG93WydfJyArICdLZWVuJ10gPSB1bmRlZmluZWQ7XG4gIHRyeSB7XG4gICAgZGVsZXRlIHdpbmRvd1snXycgKyAnS2VlbiddXG4gIH0gY2F0Y2goZSkge31cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBcInVuZGVmaW5lZFwiID09IHR5cGVvZiB3aW5kb3cgPyBcInNlcnZlclwiIDogXCJicm93c2VyXCI7XG59O1xuIiwidmFyIGVhY2ggPSByZXF1aXJlKCcuLi91dGlscy9lYWNoJyksXG4gICAganNvbiA9IHJlcXVpcmUoJy4uL3V0aWxzL2pzb24tc2hpbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHBhcmFtcyl7XG4gIHZhciBxdWVyeSA9IFtdO1xuICBlYWNoKHBhcmFtcywgZnVuY3Rpb24odmFsdWUsIGtleSl7XG4gICAgLy8gaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgIT09ICdbb2JqZWN0IFN0cmluZ10nKSB7fVxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IGpzb24uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICB9XG4gICAgcXVlcnkucHVzaChrZXkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcbiAgfSk7XG4gIHJldHVybiAnPycgKyBxdWVyeS5qb2luKCcmJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lem9uZU9mZnNldCgpICogLTYwO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgaWYgKFwidW5kZWZpbmVkXCIgIT09IHR5cGVvZiB3aW5kb3cpIHtcbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdNU0lFJykgIT09IC0xIHx8IG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoJ1RyaWRlbnQvJykgPiAwKSB7XG4gICAgICByZXR1cm4gMjAwMDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIDE2MDAwO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIC8vIHlheSwgc3VwZXJhZ2VudCFcbiAgdmFyIHJvb3QgPSBcInVuZGVmaW5lZFwiID09IHR5cGVvZiB3aW5kb3cgPyB0aGlzIDogd2luZG93O1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdCAmJiAoXCJmaWxlOlwiICE9IHJvb3QubG9jYXRpb24ucHJvdG9jb2wgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFAuNi4wXCIpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFAuMy4wXCIpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFBcIik7IH0gY2F0Y2goZSkge31cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlcnIsIHJlcywgY2FsbGJhY2spIHtcbiAgdmFyIGNiID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKSB7fTtcbiAgaWYgKHJlcyAmJiAhcmVzLm9rKSB7XG4gICAgdmFyIGlzX2VyciA9IHJlcy5ib2R5ICYmIHJlcy5ib2R5LmVycm9yX2NvZGU7XG4gICAgZXJyID0gbmV3IEVycm9yKGlzX2VyciA/IHJlcy5ib2R5Lm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCcpO1xuICAgIGVyci5jb2RlID0gaXNfZXJyID8gcmVzLmJvZHkuZXJyb3JfY29kZSA6ICdVbmtub3duRXJyb3InO1xuICB9XG4gIGlmIChlcnIpIHtcbiAgICBjYihlcnIsIG51bGwpO1xuICB9XG4gIGVsc2Uge1xuICAgIGNiKG51bGwsIHJlcy5ib2R5KTtcbiAgfVxuICByZXR1cm47XG59O1xuIiwidmFyIHN1cGVyYWdlbnQgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG52YXIgZWFjaCA9IHJlcXVpcmUoJy4uL3V0aWxzL2VhY2gnKSxcbiAgICBnZXRYSFIgPSByZXF1aXJlKCcuL2dldC14aHItb2JqZWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odHlwZSwgb3B0cyl7XG4gIHJldHVybiBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgdmFyIF9fc3VwZXJfXyA9IHJlcXVlc3QuY29uc3RydWN0b3IucHJvdG90eXBlLmVuZDtcbiAgICBpZiAoICd1bmRlZmluZWQnID09PSB0eXBlb2Ygd2luZG93ICkgcmV0dXJuO1xuICAgIHJlcXVlc3QucmVxdWVzdFR5cGUgPSByZXF1ZXN0LnJlcXVlc3RUeXBlIHx8IHt9O1xuICAgIHJlcXVlc3QucmVxdWVzdFR5cGVbJ3R5cGUnXSA9IHR5cGU7XG4gICAgcmVxdWVzdC5yZXF1ZXN0VHlwZVsnb3B0aW9ucyddID0gcmVxdWVzdC5yZXF1ZXN0VHlwZVsnb3B0aW9ucyddIHx8IHtcbiAgICAgIC8vIFRPRE86IGZpbmQgYWNjZXB0YWJsZSBkZWZhdWx0IHZhbHVlc1xuICAgICAgYXN5bmM6IHRydWUsXG4gICAgICBzdWNjZXNzOiB7XG4gICAgICAgIHJlc3BvbnNlVGV4dDogJ3sgXCJjcmVhdGVkXCI6IHRydWUgfScsXG4gICAgICAgIHN0YXR1czogMjAxXG4gICAgICB9LFxuICAgICAgZXJyb3I6IHtcbiAgICAgICAgcmVzcG9uc2VUZXh0OiAneyBcImVycm9yX2NvZGVcIjogXCJFUlJPUlwiLCBcIm1lc3NhZ2VcIjogXCJSZXF1ZXN0IGZhaWxlZFwiIH0nLFxuICAgICAgICBzdGF0dXM6IDQwNFxuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBcHBseSBvcHRpb25zXG4gICAgaWYgKG9wdHMpIHtcbiAgICAgIGlmICggJ2Jvb2xlYW4nID09PSB0eXBlb2Ygb3B0cy5hc3luYyApIHtcbiAgICAgICAgcmVxdWVzdC5yZXF1ZXN0VHlwZVsnb3B0aW9ucyddLmFzeW5jID0gb3B0cy5hc3luYztcbiAgICAgIH1cbiAgICAgIGlmICggb3B0cy5zdWNjZXNzICkge1xuICAgICAgICBleHRlbmQocmVxdWVzdC5yZXF1ZXN0VHlwZVsnb3B0aW9ucyddLnN1Y2Nlc3MsIG9wdHMuc3VjY2Vzcyk7XG4gICAgICB9XG4gICAgICBpZiAoIG9wdHMuZXJyb3IgKSB7XG4gICAgICAgIGV4dGVuZChyZXF1ZXN0LnJlcXVlc3RUeXBlWydvcHRpb25zJ10uZXJyb3IsIG9wdHMuZXJyb3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlcXVlc3QuZW5kID0gZnVuY3Rpb24oZm4pe1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIHJlcVR5cGUgPSAodGhpcy5yZXF1ZXN0VHlwZSkgPyB0aGlzLnJlcXVlc3RUeXBlWyd0eXBlJ10gOiAneGhyJyxcbiAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICB0aW1lb3V0O1xuXG4gICAgICBpZiAoICgnR0VUJyAhPT0gc2VsZlsnbWV0aG9kJ10gfHwgJ3hocicgPT09IHJlcVR5cGUpICYmIHNlbGYucmVxdWVzdFR5cGVbJ29wdGlvbnMnXS5hc3luYyApIHtcbiAgICAgICAgX19zdXBlcl9fLmNhbGwoc2VsZiwgZm4pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHF1ZXJ5ID0gc2VsZi5fcXVlcnkuam9pbignJicpO1xuICAgICAgdGltZW91dCA9IHNlbGYuX3RpbWVvdXQ7XG4gICAgICAvLyBzdG9yZSBjYWxsYmFja1xuICAgICAgc2VsZi5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuICAgICAgLy8gdGltZW91dFxuICAgICAgaWYgKHRpbWVvdXQgJiYgIXNlbGYuX3RpbWVyKSB7XG4gICAgICAgIHNlbGYuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGFib3J0UmVxdWVzdC5jYWxsKHNlbGYpO1xuICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgIH1cbiAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICBxdWVyeSA9IHN1cGVyYWdlbnQuc2VyaWFsaXplT2JqZWN0KHF1ZXJ5KTtcbiAgICAgICAgc2VsZi51cmwgKz0gfnNlbGYudXJsLmluZGV4T2YoJz8nKSA/ICcmJyArIHF1ZXJ5IDogJz8nICsgcXVlcnk7XG4gICAgICB9XG4gICAgICAvLyBzZW5kIHN0dWZmXG4gICAgICBzZWxmLmVtaXQoJ3JlcXVlc3QnLCBzZWxmKTtcblxuICAgICAgaWYgKCAhc2VsZi5yZXF1ZXN0VHlwZVsnb3B0aW9ucyddLmFzeW5jICkge1xuICAgICAgICBzZW5kWGhyU3luYy5jYWxsKHNlbGYpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoICdqc29ucCcgPT09IHJlcVR5cGUgKSB7XG4gICAgICAgIHNlbmRKc29ucC5jYWxsKHNlbGYpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoICdiZWFjb24nID09PSByZXFUeXBlICkge1xuICAgICAgICBzZW5kQmVhY29uLmNhbGwoc2VsZik7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9O1xuICAgIHJldHVybiByZXF1ZXN0O1xuICB9O1xufTtcblxuZnVuY3Rpb24gc2VuZFhoclN5bmMoKXtcbiAgdmFyIHhociA9IGdldFhIUigpO1xuICBpZiAoeGhyKSB7XG4gICAgeGhyLm9wZW4oJ0dFVCcsIHRoaXMudXJsLCBmYWxzZSk7XG4gICAgeGhyLnNlbmQobnVsbCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbmZ1bmN0aW9uIHNlbmRKc29ucCgpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpLFxuICAgICAgcGFyZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgIGNhbGxiYWNrTmFtZSA9ICdrZWVuSlNPTlBDYWxsYmFjaycsXG4gICAgICBsb2FkZWQgPSBmYWxzZTtcbiAgY2FsbGJhY2tOYW1lICs9IHRpbWVzdGFtcDtcbiAgd2hpbGUgKGNhbGxiYWNrTmFtZSBpbiB3aW5kb3cpIHtcbiAgICBjYWxsYmFja05hbWUgKz0gJ2EnO1xuICB9XG4gIHdpbmRvd1tjYWxsYmFja05hbWVdID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICBpZiAobG9hZGVkID09PSB0cnVlKSByZXR1cm47XG4gICAgbG9hZGVkID0gdHJ1ZTtcbiAgICBoYW5kbGVTdWNjZXNzLmNhbGwoc2VsZiwgcmVzcG9uc2UpO1xuICAgIGNsZWFudXAoKTtcbiAgfTtcbiAgc2NyaXB0LnNyYyA9IHNlbGYudXJsICsgJyZqc29ucD0nICsgY2FsbGJhY2tOYW1lO1xuICBwYXJlbnQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgLy8gZm9yIGVhcmx5IElFIHcvIG5vIG9uZXJyb3IgZXZlbnRcbiAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChsb2FkZWQgPT09IGZhbHNlICYmIHNlbGYucmVhZHlTdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcbiAgICAgIGxvYWRlZCA9IHRydWU7XG4gICAgICBoYW5kbGVFcnJvci5jYWxsKHNlbGYpO1xuICAgICAgY2xlYW51cCgpO1xuICAgIH1cbiAgfTtcbiAgLy8gbm9uLWllLCBldGNcbiAgc2NyaXB0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBvbiBJRTkgYm90aCBvbmVycm9yIGFuZCBvbnJlYWR5c3RhdGVjaGFuZ2UgYXJlIGNhbGxlZFxuICAgIGlmIChsb2FkZWQgPT09IGZhbHNlKSB7XG4gICAgICBsb2FkZWQgPSB0cnVlO1xuICAgICAgaGFuZGxlRXJyb3IuY2FsbChzZWxmKTtcbiAgICAgIGNsZWFudXAoKTtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIGNsZWFudXAoKXtcbiAgICB3aW5kb3dbY2FsbGJhY2tOYW1lXSA9IHVuZGVmaW5lZDtcbiAgICB0cnkge1xuICAgICAgZGVsZXRlIHdpbmRvd1tjYWxsYmFja05hbWVdO1xuICAgIH0gY2F0Y2goZSl7fVxuICAgIHBhcmVudC5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNlbmRCZWFjb24oKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyksXG4gICAgICBsb2FkZWQgPSBmYWxzZTtcbiAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGxvYWRlZCA9IHRydWU7XG4gICAgaWYgKCduYXR1cmFsSGVpZ2h0JyBpbiB0aGlzKSB7XG4gICAgICBpZiAodGhpcy5uYXR1cmFsSGVpZ2h0ICsgdGhpcy5uYXR1cmFsV2lkdGggPT09IDApIHtcbiAgICAgICAgdGhpcy5vbmVycm9yKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMud2lkdGggKyB0aGlzLmhlaWdodCA9PT0gMCkge1xuICAgICAgdGhpcy5vbmVycm9yKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGhhbmRsZVN1Y2Nlc3MuY2FsbChzZWxmKTtcbiAgfTtcbiAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICBsb2FkZWQgPSB0cnVlO1xuICAgIGhhbmRsZUVycm9yLmNhbGwoc2VsZik7XG4gIH07XG4gIGltZy5zcmMgPSBzZWxmLnVybCArICcmYz1jbHYxJztcbn1cblxuZnVuY3Rpb24gaGFuZGxlU3VjY2VzcyhyZXMpe1xuICB2YXIgb3B0cyA9IHRoaXMucmVxdWVzdFR5cGVbJ29wdGlvbnMnXVsnc3VjY2VzcyddLFxuICAgICAgcmVzcG9uc2UgPSAnJztcbiAgeGhyU2hpbS5jYWxsKHRoaXMsIG9wdHMpO1xuICBpZiAocmVzKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3BvbnNlID0gSlNPTi5zdHJpbmdpZnkocmVzKTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgZWxzZSB7XG4gICAgcmVzcG9uc2UgPSBvcHRzWydyZXNwb25zZVRleHQnXTtcbiAgfVxuICB0aGlzLnhoci5yZXNwb25zZVRleHQgPSByZXNwb25zZTtcbiAgdGhpcy54aHIuc3RhdHVzID0gb3B0c1snc3RhdHVzJ107XG4gIHRoaXMuZW1pdCgnZW5kJyk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKCl7XG4gIHZhciBvcHRzID0gdGhpcy5yZXF1ZXN0VHlwZVsnb3B0aW9ucyddWydlcnJvciddO1xuICB4aHJTaGltLmNhbGwodGhpcywgb3B0cyk7XG4gIHRoaXMueGhyLnJlc3BvbnNlVGV4dCA9IG9wdHNbJ3Jlc3BvbnNlVGV4dCddO1xuICB0aGlzLnhoci5zdGF0dXMgPSBvcHRzWydzdGF0dXMnXTtcbiAgdGhpcy5lbWl0KCdlbmQnKTtcbn1cblxuLy8gY3VzdG9tIHNwaW4gb24gc2VsZi5hYm9ydCgpO1xuZnVuY3Rpb24gYWJvcnRSZXF1ZXN0KCl7XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbn1cblxuLy8gaGFja2V0eSBoYWNrIGhhY2sgOikga2VlcCBtb3ZpbmdcbmZ1bmN0aW9uIHhoclNoaW0ob3B0cyl7XG4gIHRoaXMueGhyID0ge1xuICAgIGdldEFsbFJlc3BvbnNlSGVhZGVyczogZnVuY3Rpb24oKXsgcmV0dXJuICcnOyB9LFxuICAgIGdldFJlc3BvbnNlSGVhZGVyOiBmdW5jdGlvbigpeyByZXR1cm4gJ2FwcGxpY2F0aW9uL2pzb24nOyB9LFxuICAgIHJlc3BvbnNlVGV4dDogb3B0c1sncmVzcG9uc2VUZXh0J10sXG4gICAgc3RhdHVzOiBvcHRzWydzdGF0dXMnXVxuICB9O1xuICByZXR1cm4gdGhpcztcbn1cbiIsInZhciByb290ID0gJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB3aW5kb3cgPyB3aW5kb3cgOiB0aGlzO1xudmFyIHByZXZpb3VzX0tlZW4gPSByb290LktlZW47XG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnLi91dGlscy9lbWl0dGVyLXNoaW0nKTtcblxuZnVuY3Rpb24gS2Vlbihjb25maWcpIHtcbiAgdGhpcy5jb25maWd1cmUoY29uZmlnIHx8IHt9KTtcbiAgS2Vlbi50cmlnZ2VyKCdjbGllbnQnLCB0aGlzKTtcbn1cblxuS2Vlbi5kZWJ1ZyA9IGZhbHNlO1xuS2Vlbi5lbmFibGVkID0gdHJ1ZTtcbktlZW4ubG9hZGVkID0gdHJ1ZTtcbktlZW4udmVyc2lvbiA9ICcwLjIuMSc7XG5cbkVtaXR0ZXIoS2Vlbik7XG5FbWl0dGVyKEtlZW4ucHJvdG90eXBlKTtcblxuS2Vlbi5wcm90b3R5cGUuY29uZmlndXJlID0gZnVuY3Rpb24oY2ZnKXtcbiAgdmFyIGNvbmZpZyA9IGNmZyB8fCB7fTtcbiAgaWYgKGNvbmZpZ1snaG9zdCddKSB7XG4gICAgY29uZmlnWydob3N0J10ucmVwbGFjZSgvLio/OlxcL1xcLy9nLCAnJyk7XG4gIH1cbiAgaWYgKGNvbmZpZy5wcm90b2NvbCAmJiBjb25maWcucHJvdG9jb2wgPT09ICdhdXRvJykge1xuICAgIGNvbmZpZ1sncHJvdG9jb2wnXSA9IGxvY2F0aW9uLnByb3RvY29sLnJlcGxhY2UoLzovZywgJycpO1xuICB9XG4gIHRoaXMuY29uZmlnID0ge1xuICAgIHByb2plY3RJZCAgIDogY29uZmlnLnByb2plY3RJZCxcbiAgICB3cml0ZUtleSAgICA6IGNvbmZpZy53cml0ZUtleSxcbiAgICByZWFkS2V5ICAgICA6IGNvbmZpZy5yZWFkS2V5LFxuICAgIG1hc3RlcktleSAgIDogY29uZmlnLm1hc3RlcktleSxcbiAgICByZXF1ZXN0VHlwZSA6IGNvbmZpZy5yZXF1ZXN0VHlwZSB8fCAnanNvbnAnLFxuICAgIGhvc3QgICAgICAgIDogY29uZmlnWydob3N0J10gICAgIHx8ICdhcGkua2Vlbi5pby8zLjAnLFxuICAgIHByb3RvY29sICAgIDogY29uZmlnWydwcm90b2NvbCddIHx8ICdodHRwcycsXG4gICAgZ2xvYmFsUHJvcGVydGllczogbnVsbFxuICB9O1xuICBpZiAoS2Vlbi5kZWJ1Zykge1xuICAgIHRoaXMub24oJ2Vycm9yJywgS2Vlbi5sb2cpO1xuICB9XG4gIHRoaXMudHJpZ2dlcigncmVhZHknKTtcbn07XG5cbktlZW4ucHJvdG90eXBlLnByb2plY3RJZCA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuY29uZmlnLnByb2plY3RJZDtcbiAgdGhpcy5jb25maWcucHJvamVjdElkID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuS2Vlbi5wcm90b3R5cGUubWFzdGVyS2V5ID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5jb25maWcubWFzdGVyS2V5O1xuICB0aGlzLmNvbmZpZy5tYXN0ZXJLZXkgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5LZWVuLnByb3RvdHlwZS5yZWFkS2V5ID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5jb25maWcucmVhZEtleTtcbiAgdGhpcy5jb25maWcucmVhZEtleSA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbktlZW4ucHJvdG90eXBlLndyaXRlS2V5ID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5jb25maWcud3JpdGVLZXk7XG4gIHRoaXMuY29uZmlnLndyaXRlS2V5ID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuS2Vlbi5wcm90b3R5cGUudXJsID0gZnVuY3Rpb24ocGF0aCl7XG4gIGlmICghdGhpcy5wcm9qZWN0SWQoKSkge1xuICAgIHRoaXMudHJpZ2dlcignZXJyb3InLCAnQ2xpZW50IGlzIG1pc3NpbmcgcHJvamVjdElkIHByb3BlcnR5Jyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJldHVybiB0aGlzLmNvbmZpZy5wcm90b2NvbCArICc6Ly8nICsgdGhpcy5jb25maWcuaG9zdCArICcvcHJvamVjdHMvJyArIHRoaXMucHJvamVjdElkKCkgKyBwYXRoO1xufTtcblxuS2Vlbi5sb2cgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIGlmIChLZWVuLmRlYnVnICYmIHR5cGVvZiBjb25zb2xlID09ICdvYmplY3QnKSB7XG4gICAgY29uc29sZS5sb2coJ1tLZWVuIElPXScsIG1lc3NhZ2UpO1xuICB9XG59O1xuXG5LZWVuLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xuICByb290LktlZW4gPSBwcmV2aW91c19LZWVuO1xuICByZXR1cm4gS2Vlbjtcbn07XG5cbktlZW4ucmVhZHkgPSBmdW5jdGlvbihmbil7XG4gIGlmIChLZWVuLmxvYWRlZCkge1xuICAgIGZuKCk7XG4gIH0gZWxzZSB7XG4gICAgS2Vlbi5vbmNlKCdyZWFkeScsIGZuKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZWVuO1xuIiwidmFyIGpzb24gPSByZXF1aXJlKCcuLi91dGlscy9qc29uLXNoaW0nKTtcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xuXG52YXIgS2VlbiA9IHJlcXVpcmUoJy4uL2luZGV4Jyk7XG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCcuLi91dGlscy9iYXNlNjQnKSxcbiAgICBlYWNoID0gcmVxdWlyZSgnLi4vdXRpbHMvZWFjaCcpLFxuICAgIGdldENvbnRleHQgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC1jb250ZXh0JyksXG4gICAgZ2V0UXVlcnlTdHJpbmcgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC1xdWVyeS1zdHJpbmcnKSxcbiAgICBnZXRVcmxNYXhMZW5ndGggPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC11cmwtbWF4LWxlbmd0aCcpLFxuICAgIGdldFhIUiA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LXhoci1vYmplY3QnKSxcbiAgICByZXF1ZXN0VHlwZXMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N1cGVyYWdlbnQtcmVxdWVzdC10eXBlcycpLFxuICAgIHJlc3BvbnNlSGFuZGxlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3VwZXJhZ2VudC1oYW5kbGUtcmVzcG9uc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBwYXlsb2FkLCBjYWxsYmFjaywgYXN5bmMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdXJsQmFzZSA9IHRoaXMudXJsKCcvZXZlbnRzLycgKyBlbmNvZGVVUklDb21wb25lbnQoY29sbGVjdGlvbikpLFxuICAgICAgcmVxVHlwZSA9IHRoaXMuY29uZmlnLnJlcXVlc3RUeXBlLFxuICAgICAgZGF0YSA9IHt9LFxuICAgICAgY2IgPSBjYWxsYmFjayxcbiAgICAgIGlzQXN5bmMsXG4gICAgICBnZXRVcmw7XG5cbiAgaXNBc3luYyA9ICgnYm9vbGVhbicgPT09IHR5cGVvZiBhc3luYykgPyBhc3luYyA6IHRydWU7XG5cbiAgaWYgKCFLZWVuLmVuYWJsZWQpIHtcbiAgICBoYW5kbGVWYWxpZGF0aW9uRXJyb3IuY2FsbChzZWxmLCAnS2Vlbi5lbmFibGVkID0gZmFsc2UnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIXNlbGYucHJvamVjdElkKCkpIHtcbiAgICBoYW5kbGVWYWxpZGF0aW9uRXJyb3IuY2FsbChzZWxmLCAnTWlzc2luZyBwcm9qZWN0SWQgcHJvcGVydHknKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIXNlbGYud3JpdGVLZXkoKSkge1xuICAgIGhhbmRsZVZhbGlkYXRpb25FcnJvci5jYWxsKHNlbGYsICdNaXNzaW5nIHdyaXRlS2V5IHByb3BlcnR5Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFjb2xsZWN0aW9uIHx8IHR5cGVvZiBjb2xsZWN0aW9uICE9PSAnc3RyaW5nJykge1xuICAgIGhhbmRsZVZhbGlkYXRpb25FcnJvci5jYWxsKHNlbGYsICdDb2xsZWN0aW9uIG5hbWUgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEF0dGFjaCBwcm9wZXJ0aWVzIGZyb20gY2xpZW50Lmdsb2JhbFByb3BlcnRpZXNcbiAgaWYgKHNlbGYuY29uZmlnLmdsb2JhbFByb3BlcnRpZXMpIHtcbiAgICBkYXRhID0gc2VsZi5jb25maWcuZ2xvYmFsUHJvcGVydGllcyhjb2xsZWN0aW9uKTtcbiAgfVxuICAvLyBBdHRhY2ggcHJvcGVydGllcyBmcm9tIHVzZXItZGVmaW5lZCBldmVudFxuICBlYWNoKHBheWxvYWQsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuICAgIGRhdGFba2V5XSA9IHZhbHVlO1xuICB9KTtcblxuICAvLyBPdmVycmlkZSByZXFUeXBlIGlmIFhIUiBub3Qgc3VwcG9ydGVkXG4gIGlmICggIWdldFhIUigpICYmICd4aHInID09PSByZXFUeXBlICkge1xuICAgIHJlcVR5cGUgPSAnanNvbnAnO1xuICB9XG5cbiAgLy8gUHJlLWZsaWdodCBmb3IgR0VUIHJlcXVlc3RzXG4gIGlmICggJ3hocicgIT09IHJlcVR5cGUgfHwgIWlzQXN5bmMgKSB7XG4gICAgZ2V0VXJsID0gcHJlcGFyZUdldFJlcXVlc3QuY2FsbChzZWxmLCB1cmxCYXNlLCBkYXRhKTtcbiAgfVxuXG4gIGlmICggZ2V0VXJsICYmIGdldENvbnRleHQoKSA9PT0gJ2Jyb3dzZXInICkge1xuICAgIHJlcXVlc3RcbiAgICAgIC5nZXQoZ2V0VXJsKVxuICAgICAgLnVzZShyZXF1ZXN0VHlwZXMocmVxVHlwZSwgeyBhc3luYzogaXNBc3luYyB9KSlcbiAgICAgIC5lbmQoaGFuZGxlUmVzcG9uc2UpO1xuICB9XG4gIGVsc2UgaWYgKCBnZXRYSFIoKSB8fCBnZXRDb250ZXh0KCkgPT09ICdzZXJ2ZXInICkge1xuICAgIHJlcXVlc3RcbiAgICAgIC5wb3N0KHVybEJhc2UpXG4gICAgICAuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgc2VsZi53cml0ZUtleSgpKVxuICAgICAgLnNlbmQoZGF0YSlcbiAgICAgIC5lbmQoaGFuZGxlUmVzcG9uc2UpO1xuICB9XG4gIGVsc2Uge1xuICAgIHNlbGYudHJpZ2dlcignZXJyb3InLCAnUmVxdWVzdCBub3Qgc2VudDogVVJMIGxlbmd0aCBleGNlZWRzIGN1cnJlbnQgYnJvd3NlciBsaW1pdCwgYW5kIFhIUiAoUE9TVCkgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKGVyciwgcmVzKXtcbiAgICByZXNwb25zZUhhbmRsZXIoZXJyLCByZXMsIGNiKTtcbiAgICBjYiA9IGNhbGxiYWNrID0gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVZhbGlkYXRpb25FcnJvcihtc2cpe1xuICAgIHZhciBlcnIgPSAnRXZlbnQgbm90IHJlY29yZGVkOiAnICsgbXNnO1xuICAgIHNlbGYudHJpZ2dlcignZXJyb3InLCBlcnIpO1xuICAgIGlmIChjYikge1xuICAgICAgY2IuY2FsbChzZWxmLCBlcnIsIG51bGwpO1xuICAgICAgY2IgPSBjYWxsYmFjayA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuO1xufTtcblxuZnVuY3Rpb24gcHJlcGFyZUdldFJlcXVlc3QodXJsLCBkYXRhKXtcbiAgLy8gU2V0IEFQSSBrZXlcbiAgdXJsICs9IGdldFF1ZXJ5U3RyaW5nKHtcbiAgICBhcGlfa2V5ICA6IHRoaXMud3JpdGVLZXkoKSxcbiAgICBkYXRhICAgICA6IGJhc2U2NC5lbmNvZGUoIGpzb24uc3RyaW5naWZ5KGRhdGEpICksXG4gICAgbW9kaWZpZWQgOiBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICB9KTtcbiAgcmV0dXJuICggdXJsLmxlbmd0aCA8IGdldFVybE1heExlbmd0aCgpICkgPyB1cmwgOiBmYWxzZTtcbn1cbiIsInZhciBLZWVuID0gcmVxdWlyZSgnLi4vaW5kZXgnKTtcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xuXG52YXIgZWFjaCA9IHJlcXVpcmUoJy4uL3V0aWxzL2VhY2gnKSxcbiAgICBnZXRDb250ZXh0ID0gcmVxdWlyZSgnLi4vaGVscGVycy9nZXQtY29udGV4dCcpLFxuICAgIGdldFhIUiA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LXhoci1vYmplY3QnKSxcbiAgICByZXF1ZXN0VHlwZXMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N1cGVyYWdlbnQtcmVxdWVzdC10eXBlcycpLFxuICAgIHJlc3BvbnNlSGFuZGxlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3VwZXJhZ2VudC1oYW5kbGUtcmVzcG9uc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwYXlsb2FkLCBjYWxsYmFjaykge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1cmxCYXNlID0gdGhpcy51cmwoJy9ldmVudHMnKSxcbiAgICAgIGRhdGEgPSB7fSxcbiAgICAgIGNiID0gY2FsbGJhY2s7XG5cbiAgaWYgKCFLZWVuLmVuYWJsZWQpIHtcbiAgICBoYW5kbGVWYWxpZGF0aW9uRXJyb3IuY2FsbChzZWxmLCAnS2Vlbi5lbmFibGVkID0gZmFsc2UnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIXNlbGYucHJvamVjdElkKCkpIHtcbiAgICBoYW5kbGVWYWxpZGF0aW9uRXJyb3IuY2FsbChzZWxmLCAnTWlzc2luZyBwcm9qZWN0SWQgcHJvcGVydHknKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIXNlbGYud3JpdGVLZXkoKSkge1xuICAgIGhhbmRsZVZhbGlkYXRpb25FcnJvci5jYWxsKHNlbGYsICdNaXNzaW5nIHdyaXRlS2V5IHByb3BlcnR5Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgaGFuZGxlVmFsaWRhdGlvbkVycm9yLmNhbGwoc2VsZiwgJ0luY29ycmVjdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gI2FkZEV2ZW50cyBtZXRob2QnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodHlwZW9mIHBheWxvYWQgIT09ICdvYmplY3QnIHx8IHBheWxvYWQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGhhbmRsZVZhbGlkYXRpb25FcnJvci5jYWxsKHNlbGYsICdSZXF1ZXN0IHBheWxvYWQgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBBdHRhY2ggcHJvcGVydGllcyBmcm9tIGNsaWVudC5nbG9iYWxQcm9wZXJ0aWVzXG4gIGlmIChzZWxmLmNvbmZpZy5nbG9iYWxQcm9wZXJ0aWVzKSB7XG4gICAgLy8gTG9vcCBvdmVyIGVhY2ggc2V0IG9mIGV2ZW50c1xuICAgIGVhY2gocGF5bG9hZCwgZnVuY3Rpb24oZXZlbnRzLCBjb2xsZWN0aW9uKXtcbiAgICAgIC8vIExvb3Agb3ZlciBlYWNoIGluZGl2aWR1YWwgZXZlbnRcbiAgICAgIGVhY2goZXZlbnRzLCBmdW5jdGlvbihib2R5LCBpbmRleCl7XG4gICAgICAgIC8vIFN0YXJ0IHdpdGggZ2xvYmFsIHByb3BlcnRpZXMgZm9yIHRoaXMgY29sbGVjdGlvblxuICAgICAgICB2YXIgYmFzZSA9IHNlbGYuY29uZmlnLmdsb2JhbFByb3BlcnRpZXMoY29sbGVjdGlvbik7XG4gICAgICAgIC8vIEFwcGx5IHByb3ZpZGVkIHByb3BlcnRpZXMgZm9yIHRoaXMgZXZlbnQgYm9keVxuICAgICAgICBlYWNoKGJvZHksIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuICAgICAgICAgIGJhc2Vba2V5XSA9IHZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IHBheWxvYWRcbiAgICAgICAgZGF0YVtjb2xsZWN0aW9uXS5wdXNoKGJhc2UpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gVXNlIGV4aXN0aW5nIHBheWxvYWRcbiAgICBkYXRhID0gcGF5bG9hZDtcbiAgfVxuXG4gIGlmICggZ2V0WEhSKCkgfHwgZ2V0Q29udGV4dCgpID09PSAnc2VydmVyJyApIHtcbiAgICByZXF1ZXN0XG4gICAgICAucG9zdCh1cmxCYXNlKVxuICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsIHNlbGYud3JpdGVLZXkoKSlcbiAgICAgIC5zZW5kKGRhdGEpXG4gICAgICAuZW5kKGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgICAgICAgcmVzcG9uc2VIYW5kbGVyKGVyciwgcmVzLCBjYik7XG4gICAgICAgIGNiID0gY2FsbGJhY2sgPSBudWxsO1xuICAgICAgfSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gVE9ETzogcXVldWUgYW5kIGZpcmUgaW4gc21hbGwsIGFzeW5jaHJvbm91cyBiYXRjaGVzXG4gICAgc2VsZi50cmlnZ2VyKCdlcnJvcicsICdFdmVudHMgbm90IHJlY29yZGVkOiBYSFIgc3VwcG9ydCBpcyByZXF1aXJlZCBmb3IgYmF0Y2ggdXBsb2FkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVWYWxpZGF0aW9uRXJyb3IobXNnKXtcbiAgICB2YXIgZXJyID0gJ0V2ZW50cyBub3QgcmVjb3JkZWQ6ICcgKyBtc2c7XG4gICAgc2VsZi50cmlnZ2VyKCdlcnJvcicsIGVycik7XG4gICAgaWYgKGNiKSB7XG4gICAgICBjYi5jYWxsKHNlbGYsIGVyciwgbnVsbCk7XG4gICAgICBjYiA9IGNhbGxiYWNrID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICByZXR1cm47XG59O1xuIiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG52YXIgZ2V0UXVlcnlTdHJpbmcgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC1xdWVyeS1zdHJpbmcnKSxcbiAgICBoYW5kbGVSZXNwb25zZSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3VwZXJhZ2VudC1oYW5kbGUtcmVzcG9uc2UnKSxcbiAgICByZXF1ZXN0VHlwZXMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N1cGVyYWdlbnQtcmVxdWVzdC10eXBlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVybCwgcGFyYW1zLCBhcGlfa2V5LCBjYWxsYmFjayl7XG4gIHZhciByZXFUeXBlID0gdGhpcy5jb25maWcucmVxdWVzdFR5cGUsXG4gICAgICBkYXRhID0gcGFyYW1zIHx8IHt9O1xuXG4gIGlmIChyZXFUeXBlID09PSAnYmVhY29uJykge1xuICAgIHJlcVR5cGUgPSAnanNvbnAnO1xuICB9XG5cbiAgLy8gRW5zdXJlIGFwaV9rZXkgaXMgcHJlc2VudCBmb3IgR0VUIHJlcXVlc3RzXG4gIGRhdGFbJ2FwaV9rZXknXSA9IGRhdGFbJ2FwaV9rZXknXSB8fCBhcGlfa2V5O1xuXG4gIHJlcXVlc3RcbiAgICAuZ2V0KHVybCtnZXRRdWVyeVN0cmluZyhkYXRhKSlcbiAgICAudXNlKHJlcXVlc3RUeXBlcyhyZXFUeXBlKSlcbiAgICAuZW5kKGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgICAgIGhhbmRsZVJlc3BvbnNlKGVyciwgcmVzLCBjYWxsYmFjayk7XG4gICAgICBjYWxsYmFjayA9IG51bGw7XG4gICAgfSk7XG59O1xuIiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG52YXIgaGFuZGxlUmVzcG9uc2UgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N1cGVyYWdlbnQtaGFuZGxlLXJlc3BvbnNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXJsLCBkYXRhLCBhcGlfa2V5LCBjYWxsYmFjayl7XG4gIHJlcXVlc3RcbiAgICAucG9zdCh1cmwpXG4gICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCBhcGlfa2V5KVxuICAgIC5zZW5kKGRhdGEgfHwge30pXG4gICAgLmVuZChmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgaGFuZGxlUmVzcG9uc2UoZXJyLCByZXMsIGNhbGxiYWNrKTtcbiAgICAgIGNhbGxiYWNrID0gbnVsbDtcbiAgICB9KTtcbn07XG4iLCJ2YXIgUmVxdWVzdCA9IHJlcXVpcmUoXCIuLi9yZXF1ZXN0XCIpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxdWVyeSwgY2FsbGJhY2spIHtcbiAgdmFyIHF1ZXJpZXMgPSBbXSxcbiAgICAgIGNiID0gY2FsbGJhY2ssXG4gICAgICByZXF1ZXN0O1xuXG4gIGlmIChxdWVyeSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcXVlcmllcyA9IHF1ZXJ5O1xuICB9IGVsc2Uge1xuICAgIHF1ZXJpZXMucHVzaChxdWVyeSk7XG4gIH1cbiAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KHRoaXMsIHF1ZXJpZXMsIGNiKS5yZWZyZXNoKCk7XG4gIGNiID0gY2FsbGJhY2sgPSBudWxsO1xuICByZXR1cm4gcmVxdWVzdDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5ld0dsb2JhbFByb3BlcnRpZXMpIHtcbiAgaWYgKG5ld0dsb2JhbFByb3BlcnRpZXMgJiYgdHlwZW9mKG5ld0dsb2JhbFByb3BlcnRpZXMpID09IFwiZnVuY3Rpb25cIikge1xuICAgIHRoaXMuY29uZmlnLmdsb2JhbFByb3BlcnRpZXMgPSBuZXdHbG9iYWxQcm9wZXJ0aWVzO1xuICB9IGVsc2Uge1xuICAgIHRoaXMudHJpZ2dlcihcImVycm9yXCIsIFwiSW52YWxpZCB2YWx1ZSBmb3IgZ2xvYmFsIHByb3BlcnRpZXM6IFwiICsgbmV3R2xvYmFsUHJvcGVydGllcyk7XG4gIH1cbn07XG4iLCIvLyB2YXIgc2VuZEV2ZW50ID0gcmVxdWlyZShcIi4uL3V0aWxzL3NlbmRFdmVudFwiKTtcbnZhciBhZGRFdmVudCA9IHJlcXVpcmUoXCIuL2FkZEV2ZW50XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGpzRXZlbnQsIGV2ZW50Q29sbGVjdGlvbiwgcGF5bG9hZCwgdGltZW91dCwgdGltZW91dENhbGxiYWNrKXtcbiAgdmFyIGV2dCA9IGpzRXZlbnQsXG4gICAgICB0YXJnZXQgPSAoZXZ0LmN1cnJlbnRUYXJnZXQpID8gZXZ0LmN1cnJlbnRUYXJnZXQgOiAoZXZ0LnNyY0VsZW1lbnQgfHwgZXZ0LnRhcmdldCksXG4gICAgICB0aW1lciA9IHRpbWVvdXQgfHwgNTAwLFxuICAgICAgdHJpZ2dlcmVkID0gZmFsc2UsXG4gICAgICB0YXJnZXRBdHRyID0gXCJcIixcbiAgICAgIGNhbGxiYWNrLFxuICAgICAgd2luO1xuXG4gIGlmICh0YXJnZXQuZ2V0QXR0cmlidXRlICE9PSB2b2lkIDApIHtcbiAgICB0YXJnZXRBdHRyID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShcInRhcmdldFwiKTtcbiAgfSBlbHNlIGlmICh0YXJnZXQudGFyZ2V0KSB7XG4gICAgdGFyZ2V0QXR0ciA9IHRhcmdldC50YXJnZXQ7XG4gIH1cblxuICBpZiAoKHRhcmdldEF0dHIgPT0gXCJfYmxhbmtcIiB8fCB0YXJnZXRBdHRyID09IFwiYmxhbmtcIikgJiYgIWV2dC5tZXRhS2V5KSB7XG4gICAgd2luID0gd2luZG93Lm9wZW4oXCJhYm91dDpibGFua1wiKTtcbiAgICB3aW4uZG9jdW1lbnQubG9jYXRpb24gPSB0YXJnZXQuaHJlZjtcbiAgfVxuXG4gIGlmICh0YXJnZXQubm9kZU5hbWUgPT09IFwiQVwiKSB7XG4gICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpe1xuICAgICAgaWYoIXRyaWdnZXJlZCAmJiAhZXZ0Lm1ldGFLZXkgJiYgKHRhcmdldEF0dHIgIT09IFwiX2JsYW5rXCIgJiYgdGFyZ2V0QXR0ciAhPT0gXCJibGFua1wiKSl7XG4gICAgICAgIHRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHRhcmdldC5ocmVmO1xuICAgICAgfVxuICAgIH07XG4gIH0gZWxzZSBpZiAodGFyZ2V0Lm5vZGVOYW1lID09PSBcIkZPUk1cIikge1xuICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKCF0cmlnZ2VyZWQpe1xuICAgICAgICB0cmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICB0YXJnZXQuc3VibWl0KCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnRyaWdnZXIoXCJlcnJvclwiLCBcIiN0cmFja0V4dGVybmFsTGluayBtZXRob2Qgbm90IGF0dGFjaGVkIHRvIGFuIDxhPiBvciA8Zm9ybT4gRE9NIGVsZW1lbnRcIik7XG4gIH1cblxuICBpZiAodGltZW91dENhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpe1xuICAgICAgaWYoIXRyaWdnZXJlZCl7XG4gICAgICAgIHRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgIHRpbWVvdXRDYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgYWRkRXZlbnQuY2FsbCh0aGlzLCBldmVudENvbGxlY3Rpb24sIHBheWxvYWQsIGNhbGxiYWNrKTtcblxuICBzZXRUaW1lb3V0KGNhbGxiYWNrLCB0aW1lcik7XG4gIGlmICghZXZ0Lm1ldGFLZXkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuL3V0aWxzL2VhY2hcIiksXG4gICAgZXh0ZW5kID0gcmVxdWlyZShcIi4vdXRpbHMvZXh0ZW5kXCIpLFxuICAgIGdldFRpbWV6b25lT2Zmc2V0ID0gcmVxdWlyZShcIi4vaGVscGVycy9nZXQtdGltZXpvbmUtb2Zmc2V0XCIpLFxuICAgIGdldFF1ZXJ5U3RyaW5nID0gcmVxdWlyZShcIi4vaGVscGVycy9nZXQtcXVlcnktc3RyaW5nXCIpO1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJy4vdXRpbHMvZW1pdHRlci1zaGltJyk7XG5cbmZ1bmN0aW9uIFF1ZXJ5KCl7XG4gIHRoaXMuY29uZmlndXJlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuRW1pdHRlcihRdWVyeS5wcm90b3R5cGUpO1xuXG5RdWVyeS5wcm90b3R5cGUuY29uZmlndXJlID0gZnVuY3Rpb24oYW5hbHlzaXNUeXBlLCBwYXJhbXMpIHtcbiAgdGhpcy5hbmFseXNpcyA9IGFuYWx5c2lzVHlwZTtcblxuICAvLyBBcHBseSBwYXJhbXMgdy8gI3NldCBtZXRob2RcbiAgdGhpcy5wYXJhbXMgPSB0aGlzLnBhcmFtcyB8fCB7fTtcbiAgdGhpcy5zZXQocGFyYW1zKTtcblxuICAvLyBMb2NhbGl6ZSB0aW1lem9uZSBpZiBub25lIGlzIHNldFxuICBpZiAodGhpcy5wYXJhbXMudGltZXpvbmUgPT09IHZvaWQgMCkge1xuICAgIHRoaXMucGFyYW1zLnRpbWV6b25lID0gZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cblF1ZXJ5LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihhdHRyaWJ1dGVzKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgZWFjaChhdHRyaWJ1dGVzLCBmdW5jdGlvbih2LCBrKXtcbiAgICB2YXIga2V5ID0gaywgdmFsdWUgPSB2O1xuICAgIGlmIChrLm1hdGNoKG5ldyBSZWdFeHAoXCJbQS1aXVwiKSkpIHtcbiAgICAgIGtleSA9IGsucmVwbGFjZSgvKFtBLVpdKS9nLCBmdW5jdGlvbigkMSkgeyByZXR1cm4gXCJfXCIrJDEudG9Mb3dlckNhc2UoKTsgfSk7XG4gICAgfVxuICAgIHNlbGYucGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZWFjaCh2YWx1ZSwgZnVuY3Rpb24oZHYsIGluZGV4KXtcbiAgICAgICAgaWYgKGR2IGluc3RhbmNlb2YgQXJyYXkgPT0gZmFsc2UgJiYgdHlwZW9mIGR2ID09PSBcIm9iamVjdFwiKSB7IC8vICBfdHlwZShkdik9PT1cIk9iamVjdFwiXG4gICAgICAgICAgZWFjaChkdiwgZnVuY3Rpb24oZGVlcFZhbHVlLCBkZWVwS2V5KXtcbiAgICAgICAgICAgIGlmIChkZWVwS2V5Lm1hdGNoKG5ldyBSZWdFeHAoXCJbQS1aXVwiKSkpIHtcbiAgICAgICAgICAgICAgdmFyIF9kZWVwS2V5ID0gZGVlcEtleS5yZXBsYWNlKC8oW0EtWl0pL2csIGZ1bmN0aW9uKCQxKSB7IHJldHVybiBcIl9cIiskMS50b0xvd2VyQ2FzZSgpOyB9KTtcbiAgICAgICAgICAgICAgZGVsZXRlIHNlbGYucGFyYW1zW2tleV1baW5kZXhdW2RlZXBLZXldO1xuICAgICAgICAgICAgICBzZWxmLnBhcmFtc1trZXldW2luZGV4XVtfZGVlcEtleV0gPSBkZWVwVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzZWxmO1xufTtcblxuUXVlcnkucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGF0dHJpYnV0ZSkge1xuICB2YXIga2V5ID0gYXR0cmlidXRlO1xuICBpZiAoa2V5Lm1hdGNoKG5ldyBSZWdFeHAoXCJbQS1aXVwiKSkpIHtcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvKFtBLVpdKS9nLCBmdW5jdGlvbigkMSkgeyByZXR1cm4gXCJfXCIrJDEudG9Mb3dlckNhc2UoKTsgfSk7XG4gIH1cbiAgaWYgKHRoaXMucGFyYW1zKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyYW1zW2tleV0gfHwgbnVsbDtcbiAgfVxufTtcblxuUXVlcnkucHJvdG90eXBlLmFkZEZpbHRlciA9IGZ1bmN0aW9uKHByb3BlcnR5LCBvcGVyYXRvciwgdmFsdWUpIHtcbiAgdGhpcy5wYXJhbXMuZmlsdGVycyA9IHRoaXMucGFyYW1zLmZpbHRlcnMgfHwgW107XG4gIHRoaXMucGFyYW1zLmZpbHRlcnMucHVzaCh7XG4gICAgXCJwcm9wZXJ0eV9uYW1lXCI6IHByb3BlcnR5LFxuICAgIFwib3BlcmF0b3JcIjogb3BlcmF0b3IsXG4gICAgXCJwcm9wZXJ0eV92YWx1ZVwiOiB2YWx1ZVxuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5O1xuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi91dGlscy9lYWNoXCIpLFxuICAgIGV4dGVuZCA9IHJlcXVpcmUoXCIuL3V0aWxzL2V4dGVuZFwiKSxcbiAgICBzZW5kUXVlcnkgPSByZXF1aXJlKFwiLi91dGlscy9zZW5kUXVlcnlcIik7XG5cbnZhciBLZWVuID0gcmVxdWlyZShcIi4vXCIpO1xudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCcuL3V0aWxzL2VtaXR0ZXItc2hpbScpO1xuXG5mdW5jdGlvbiBSZXF1ZXN0KGNsaWVudCwgcXVlcmllcywgY2FsbGJhY2spe1xuICB2YXIgY2IgPSBjYWxsYmFjaztcbiAgdGhpcy5jb25maWcgPSB7XG4gICAgdGltZW91dDogMzAwICogMTAwMFxuICB9O1xuICB0aGlzLmNvbmZpZ3VyZShjbGllbnQsIHF1ZXJpZXMsIGNiKTtcbiAgY2IgPSBjYWxsYmFjayA9IG51bGw7XG59O1xuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cblJlcXVlc3QucHJvdG90eXBlLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uKGNsaWVudCwgcXVlcmllcywgY2FsbGJhY2spe1xuICB2YXIgY2IgPSBjYWxsYmFjaztcbiAgZXh0ZW5kKHRoaXMsIHtcbiAgICBcImNsaWVudFwiICAgOiBjbGllbnQsXG4gICAgXCJxdWVyaWVzXCIgIDogcXVlcmllcyxcbiAgICBcImRhdGFcIiAgICAgOiB7fSxcbiAgICBcImNhbGxiYWNrXCIgOiBjYlxuICB9KTtcbiAgY2IgPSBjYWxsYmFjayA9IG51bGw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKG1zKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5jb25maWcudGltZW91dDtcbiAgdGhpcy5jb25maWcudGltZW91dCA9ICghaXNOYU4ocGFyc2VJbnQobXMpKSA/IHBhcnNlSW50KG1zKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBjb21wbGV0aW9ucyA9IDAsXG4gICAgICByZXNwb25zZSA9IFtdLFxuICAgICAgZXJyb3JlZCA9IGZhbHNlO1xuXG4gIHZhciBoYW5kbGVSZXNwb25zZSA9IGZ1bmN0aW9uKGVyciwgcmVzLCBpbmRleCl7XG4gICAgaWYgKGVycm9yZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGVycikge1xuICAgICAgc2VsZi50cmlnZ2VyKFwiZXJyb3JcIiwgZXJyKTtcbiAgICAgIGlmIChzZWxmLmNhbGxiYWNrKSB7XG4gICAgICAgIHNlbGYuY2FsbGJhY2soZXJyLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGVycm9yZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXNwb25zZVtpbmRleF0gPSByZXM7XG4gICAgY29tcGxldGlvbnMrKztcbiAgICBpZiAoY29tcGxldGlvbnMgPT0gc2VsZi5xdWVyaWVzLmxlbmd0aCAmJiAhZXJyb3JlZCkge1xuICAgICAgc2VsZi5kYXRhID0gKHNlbGYucXVlcmllcy5sZW5ndGggPT0gMSkgPyByZXNwb25zZVswXSA6IHJlc3BvbnNlO1xuICAgICAgc2VsZi50cmlnZ2VyKFwiY29tcGxldGVcIiwgbnVsbCwgc2VsZi5kYXRhKTtcbiAgICAgIGlmIChzZWxmLmNhbGxiYWNrKSB7XG4gICAgICAgIHNlbGYuY2FsbGJhY2sobnVsbCwgc2VsZi5kYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZWFjaChzZWxmLnF1ZXJpZXMsIGZ1bmN0aW9uKHF1ZXJ5LCBpbmRleCl7XG4gICAgdmFyIHBhdGg7XG4gICAgdmFyIGNiU2VxdWVuY2VyID0gZnVuY3Rpb24oZXJyLCByZXMpe1xuICAgICAgaGFuZGxlUmVzcG9uc2UoZXJyLCByZXMsIGluZGV4KTtcbiAgICB9O1xuXG4gICAgaWYgKHF1ZXJ5IGluc3RhbmNlb2YgS2Vlbi5RdWVyeSkge1xuICAgICAgcGF0aCA9IFwiL3F1ZXJpZXMvXCIgKyBxdWVyeS5hbmFseXNpcztcbiAgICAgIHNlbmRRdWVyeS5jYWxsKHNlbGYsIHBhdGgsIHF1ZXJ5LnBhcmFtcywgY2JTZXF1ZW5jZXIpO1xuICAgIH1cbiAgICBlbHNlIGlmICggT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHF1ZXJ5KSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIiApIHtcbiAgICAgIHBhdGggPSBcIi9zYXZlZF9xdWVyaWVzL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KSArIFwiL3Jlc3VsdFwiO1xuICAgICAgc2VuZFF1ZXJ5LmNhbGwoc2VsZiwgcGF0aCwgbnVsbCwgY2JTZXF1ZW5jZXIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciByZXMgPSB7XG4gICAgICAgIHN0YXR1c1RleHQ6IFwiQmFkIFJlcXVlc3RcIixcbiAgICAgICAgcmVzcG9uc2VUZXh0OiB7IG1lc3NhZ2U6IFwiRXJyb3I6IFF1ZXJ5IFwiICsgKCtpbmRleCsxKSArIFwiIG9mIFwiICsgc2VsZi5xdWVyaWVzLmxlbmd0aCArIFwiIGZvciBwcm9qZWN0IFwiICsgc2VsZi5jbGllbnQucHJvamVjdElkKCkgKyBcIiBpcyBub3QgYSB2YWxpZCByZXF1ZXN0XCIgfVxuICAgICAgfTtcbiAgICAgIHNlbGYudHJpZ2dlcihcImVycm9yXCIsIHJlcy5yZXNwb25zZVRleHQubWVzc2FnZSk7XG4gICAgICBpZiAoc2VsZi5jYWxsYmFjaykge1xuICAgICAgICBzZWxmLmNhbGxiYWNrKHJlcy5yZXNwb25zZVRleHQubWVzc2FnZSwgbnVsbCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcXVlc3Q7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWFwOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89XCIsXG4gIGVuY29kZTogZnVuY3Rpb24gKG4pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbyA9IFwiXCIsIGkgPSAwLCBtID0gdGhpcy5tYXAsIGkxLCBpMiwgaTMsIGUxLCBlMiwgZTMsIGU0O1xuICAgIG4gPSB0aGlzLnV0ZjguZW5jb2RlKG4pO1xuICAgIHdoaWxlIChpIDwgbi5sZW5ndGgpIHtcbiAgICAgIGkxID0gbi5jaGFyQ29kZUF0KGkrKyk7IGkyID0gbi5jaGFyQ29kZUF0KGkrKyk7IGkzID0gbi5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICBlMSA9IChpMSA+PiAyKTsgZTIgPSAoKChpMSAmIDMpIDw8IDQpIHwgKGkyID4+IDQpKTsgZTMgPSAoaXNOYU4oaTIpID8gNjQgOiAoKGkyICYgMTUpIDw8IDIpIHwgKGkzID4+IDYpKTtcbiAgICAgIGU0ID0gKGlzTmFOKGkyKSB8fCBpc05hTihpMykpID8gNjQgOiBpMyAmIDYzO1xuICAgICAgbyA9IG8gKyBtLmNoYXJBdChlMSkgKyBtLmNoYXJBdChlMikgKyBtLmNoYXJBdChlMykgKyBtLmNoYXJBdChlNCk7XG4gICAgfSByZXR1cm4gbztcbiAgfSxcbiAgZGVjb2RlOiBmdW5jdGlvbiAobikge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciBvID0gXCJcIiwgaSA9IDAsIG0gPSB0aGlzLm1hcCwgY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLCBlMSwgZTIsIGUzLCBlNCwgYzEsIGMyLCBjMztcbiAgICBuID0gbi5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgXCJcIik7XG4gICAgd2hpbGUgKGkgPCBuLmxlbmd0aCkge1xuICAgICAgZTEgPSBtLmluZGV4T2Yobi5jaGFyQXQoaSsrKSk7IGUyID0gbS5pbmRleE9mKG4uY2hhckF0KGkrKykpO1xuICAgICAgZTMgPSBtLmluZGV4T2Yobi5jaGFyQXQoaSsrKSk7IGU0ID0gbS5pbmRleE9mKG4uY2hhckF0KGkrKykpO1xuICAgICAgYzEgPSAoZTEgPDwgMikgfCAoZTIgPj4gNCk7IGMyID0gKChlMiAmIDE1KSA8PCA0KSB8IChlMyA+PiAyKTtcbiAgICAgIGMzID0gKChlMyAmIDMpIDw8IDYpIHwgZTQ7XG4gICAgICBvID0gbyArIChjYyhjMSkgKyAoKGUzICE9IDY0KSA/IGNjKGMyKSA6IFwiXCIpKSArICgoKGU0ICE9IDY0KSA/IGNjKGMzKSA6IFwiXCIpKTtcbiAgICB9IHJldHVybiB0aGlzLnV0ZjguZGVjb2RlKG8pO1xuICB9LFxuICB1dGY4OiB7XG4gICAgZW5jb2RlOiBmdW5jdGlvbiAobikge1xuICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgICB2YXIgbyA9IFwiXCIsIGkgPSAwLCBjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUsIGM7XG4gICAgICB3aGlsZSAoaSA8IG4ubGVuZ3RoKSB7XG4gICAgICAgIGMgPSBuLmNoYXJDb2RlQXQoaSsrKTsgbyA9IG8gKyAoKGMgPCAxMjgpID8gY2MoYykgOiAoKGMgPiAxMjcpICYmIChjIDwgMjA0OCkpID9cbiAgICAgICAgKGNjKChjID4+IDYpIHwgMTkyKSArIGNjKChjICYgNjMpIHwgMTI4KSkgOiAoY2MoKGMgPj4gMTIpIHwgMjI0KSArIGNjKCgoYyA+PiA2KSAmIDYzKSB8IDEyOCkgKyBjYygoYyAmIDYzKSB8IDEyOCkpKTtcbiAgICAgICAgfSByZXR1cm4gbztcbiAgICB9LFxuICAgIGRlY29kZTogZnVuY3Rpb24gKG4pIHtcbiAgICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgdmFyIG8gPSBcIlwiLCBpID0gMCwgY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLCBjMiwgYztcbiAgICAgIHdoaWxlIChpIDwgbi5sZW5ndGgpIHtcbiAgICAgICAgYyA9IG4uY2hhckNvZGVBdChpKTtcbiAgICAgICAgbyA9IG8gKyAoKGMgPCAxMjgpID8gW2NjKGMpLCBpKytdWzBdIDogKChjID4gMTkxKSAmJiAoYyA8IDIyNCkpID9cbiAgICAgICAgW2NjKCgoYyAmIDMxKSA8PCA2KSB8ICgoYzIgPSBuLmNoYXJDb2RlQXQoaSArIDEpKSAmIDYzKSksIChpICs9IDIpXVswXSA6XG4gICAgICAgIFtjYygoKGMgJiAxNSkgPDwgMTIpIHwgKCgoYzIgPSBuLmNoYXJDb2RlQXQoaSArIDEpKSAmIDYzKSA8PCA2KSB8ICgoYzMgPSBuLmNoYXJDb2RlQXQoaSArIDIpKSAmIDYzKSksIChpICs9IDMpXVswXSk7XG4gICAgICB9IHJldHVybiBvO1xuICAgIH1cbiAgfVxufTtcbiIsInZhciBqc29uID0gcmVxdWlyZSgnLi9qc29uLXNoaW0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgcmV0dXJuIGpzb24ucGFyc2UoIGpzb24uc3RyaW5naWZ5KCB0YXJnZXQgKSApO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obywgY2IsIHMpe1xuICB2YXIgbjtcbiAgaWYgKCFvKXtcbiAgICByZXR1cm4gMDtcbiAgfVxuICBzID0gIXMgPyBvIDogcztcbiAgaWYgKG8gaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgLy8gSW5kZXhlZCBhcnJheXMsIG5lZWRlZCBmb3IgU2FmYXJpXG4gICAgZm9yIChuPTA7IG48by5sZW5ndGg7IG4rKykge1xuICAgICAgaWYgKGNiLmNhbGwocywgb1tuXSwgbiwgbykgPT09IGZhbHNlKXtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEhhc2h0YWJsZXNcbiAgICBmb3IgKG4gaW4gbyl7XG4gICAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShuKSkge1xuICAgICAgICBpZiAoY2IuY2FsbChzLCBvW25dLCBuLCBvKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiAxO1xufTtcbiIsInZhciBFbWl0dGVyID0gcmVxdWlyZSgnY29tcG9uZW50LWVtaXR0ZXInKTtcbkVtaXR0ZXIucHJvdG90eXBlLnRyaWdnZXIgPSBFbWl0dGVyLnByb3RvdHlwZS5lbWl0O1xubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQpe1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIHByb3AgaW4gYXJndW1lbnRzW2ldKXtcbiAgICAgIHRhcmdldFtwcm9wXSA9IGFyZ3VtZW50c1tpXVtwcm9wXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9ICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHdpbmRvdyAmJiB3aW5kb3cuSlNPTikgPyB3aW5kb3cuSlNPTiA6IHJlcXVpcmUoXCJqc29uM1wiKTtcbiIsImZ1bmN0aW9uIHBhcnNlUGFyYW1zKHN0cil7XG4gIC8vIHZpYTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjg4MDkyOS8yNTExOTg1XG4gIHZhciB1cmxQYXJhbXMgPSB7fSxcbiAgICAgIG1hdGNoLFxuICAgICAgcGwgICAgID0gL1xcKy9nLCAgLy8gUmVnZXggZm9yIHJlcGxhY2luZyBhZGRpdGlvbiBzeW1ib2wgd2l0aCBhIHNwYWNlXG4gICAgICBzZWFyY2ggPSAvKFteJj1dKyk9PyhbXiZdKikvZyxcbiAgICAgIGRlY29kZSA9IGZ1bmN0aW9uIChzKSB7IHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocy5yZXBsYWNlKHBsLCBcIiBcIikpOyB9LFxuICAgICAgcXVlcnkgID0gc3RyLnNwbGl0KFwiP1wiKVsxXTtcblxuICB3aGlsZSAoISEobWF0Y2g9c2VhcmNoLmV4ZWMocXVlcnkpKSkge1xuICAgIHVybFBhcmFtc1tkZWNvZGUobWF0Y2hbMV0pXSA9IGRlY29kZShtYXRjaFsyXSk7XG4gIH1cbiAgcmV0dXJuIHVybFBhcmFtcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VQYXJhbXM7XG4iLCJ2YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcblxudmFyIGdldENvbnRleHQgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC1jb250ZXh0JyksXG4gICAgZ2V0UXVlcnlTdHJpbmcgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC1xdWVyeS1zdHJpbmcnKSxcbiAgICBnZXRVcmxNYXhMZW5ndGggPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dldC11cmwtbWF4LWxlbmd0aCcpLFxuICAgIGdldFhIUiA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZ2V0LXhoci1vYmplY3QnKSxcbiAgICByZXF1ZXN0VHlwZXMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3N1cGVyYWdlbnQtcmVxdWVzdC10eXBlcycpLFxuICAgIHJlc3BvbnNlSGFuZGxlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvc3VwZXJhZ2VudC1oYW5kbGUtcmVzcG9uc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwYXRoLCBwYXJhbXMsIGNhbGxiYWNrKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdXJsQmFzZSA9IHRoaXMuY2xpZW50LnVybChwYXRoKSxcbiAgICAgIHJlcVR5cGUgPSB0aGlzLmNsaWVudC5jb25maWcucmVxdWVzdFR5cGUsXG4gICAgICBjYiA9IGNhbGxiYWNrO1xuXG4gIGNhbGxiYWNrID0gbnVsbDtcblxuICBpZiAoIXNlbGYuY2xpZW50LnByb2plY3RJZCgpKSB7XG4gICAgc2VsZi5jbGllbnQudHJpZ2dlcignZXJyb3InLCAnUXVlcnkgbm90IHNlbnQ6IE1pc3NpbmcgcHJvamVjdElkIHByb3BlcnR5Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFzZWxmLmNsaWVudC5yZWFkS2V5KCkpIHtcbiAgICBzZWxmLmNsaWVudC50cmlnZ2VyKCdlcnJvcicsICdRdWVyeSBub3Qgc2VudDogTWlzc2luZyByZWFkS2V5IHByb3BlcnR5Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGdldFhIUigpIHx8IGdldENvbnRleHQoKSA9PT0gJ3NlcnZlcicgKSB7XG4gICAgcmVxdWVzdFxuICAgICAgLnBvc3QodXJsQmFzZSlcbiAgICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgc2VsZi5jbGllbnQucmVhZEtleSgpKVxuICAgICAgICAudGltZW91dChzZWxmLnRpbWVvdXQoKSlcbiAgICAgICAgLnNlbmQocGFyYW1zIHx8IHt9KVxuICAgICAgICAuZW5kKGhhbmRsZVJlc3BvbnNlKTtcbiAgfVxuICBlbHNlIHtcbiAgICBleHRlbmQocGFyYW1zLCB7IGFwaV9rZXk6IHNlbGYuY2xpZW50LnJlYWRLZXkoKSB9KTtcbiAgICB1cmxCYXNlICs9IGdldFF1ZXJ5U3RyaW5nKHBhcmFtcyk7XG4gICAgaWYgKHVybEJhc2UubGVuZ3RoIDwgZ2V0VXJsTWF4TGVuZ3RoKCkgKSB7XG4gICAgICByZXF1ZXN0XG4gICAgICAgIC5nZXQodXJsQmFzZSlcbiAgICAgICAgLnRpbWVvdXQoc2VsZi50aW1lb3V0KCkpXG4gICAgICAgIC51c2UocmVxdWVzdFR5cGVzKCdqc29ucCcpKVxuICAgICAgICAuZW5kKGhhbmRsZVJlc3BvbnNlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzZWxmLmNsaWVudC50cmlnZ2VyKCdlcnJvcicsICdRdWVyeSBub3Qgc2VudDogVVJMIGxlbmd0aCBleGNlZWRzIGN1cnJlbnQgYnJvd3NlciBsaW1pdCwgYW5kIFhIUiAoUE9TVCkgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShlcnIsIHJlcyl7XG4gICAgcmVzcG9uc2VIYW5kbGVyKGVyciwgcmVzLCBjYik7XG4gICAgY2IgPSBjYWxsYmFjayA9IG51bGw7XG4gIH1cblxuICByZXR1cm47XG59XG4iLCJ2YXIgY2xvbmUgPSByZXF1aXJlKFwiLi4vY29yZS91dGlscy9jbG9uZVwiKSxcbiAgICBlYWNoID0gcmVxdWlyZShcIi4uL2NvcmUvdXRpbHMvZWFjaFwiKSxcbiAgICBmbGF0dGVuID0gcmVxdWlyZShcIi4vdXRpbHMvZmxhdHRlblwiKSxcbiAgICBwYXJzZSA9IHJlcXVpcmUoXCIuL3V0aWxzL3BhcnNlXCIpO1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJy4uL2NvcmUvdXRpbHMvZW1pdHRlci1zaGltJyk7XG5cbmZ1bmN0aW9uIERhdGFzZXQoKXtcbiAgdGhpcy5kYXRhID0ge1xuICAgIGlucHV0OiB7fSxcbiAgICBvdXRwdXQ6IFtbJ2luZGV4J11dXG4gIH07XG4gIHRoaXMubWV0YSA9IHtcbiAgICBzY2hlbWE6IHt9LFxuICAgIG1ldGhvZDogdW5kZWZpbmVkXG4gIH07XG4gIC8vIHRlbXAgZndkXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgIHRoaXMucGFyc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxufVxuXG5EYXRhc2V0LmRlZmF1bHRzID0ge1xuICBkZWxpbWV0ZXI6IFwiIC0+IFwiXG59O1xuXG5FbWl0dGVyKERhdGFzZXQpO1xuRW1pdHRlcihEYXRhc2V0LnByb3RvdHlwZSk7XG5cbkRhdGFzZXQucHJvdG90eXBlLmlucHV0ID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpc1tcImRhdGFcIl1bXCJpbnB1dFwiXTtcbiAgdGhpc1tcImRhdGFcIl1bXCJpbnB1dFwiXSA9IChvYmogPyBjbG9uZShvYmopIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRGF0YXNldC5wcm90b3R5cGUub3V0cHV0ID0gZnVuY3Rpb24oYXJyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpc1tcImRhdGFcIl0ub3V0cHV0O1xuICB0aGlzW1wiZGF0YVwiXS5vdXRwdXQgPSAoYXJyIGluc3RhbmNlb2YgQXJyYXkgPyBhcnIgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbkRhdGFzZXQucHJvdG90eXBlLm1ldGhvZCA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMubWV0YVtcIm1ldGhvZFwiXTtcbiAgdGhpcy5tZXRhW1wibWV0aG9kXCJdID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRGF0YXNldC5wcm90b3R5cGUuc2NoZW1hID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5tZXRhLnNjaGVtYTtcbiAgdGhpcy5tZXRhLnNjaGVtYSA9IChvYmogPyBvYmogOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5EYXRhc2V0LnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHJhdywgc2NoZW1hKXtcbiAgdmFyIG9wdGlvbnM7XG4gIGlmIChyYXcpIHRoaXMuaW5wdXQocmF3KTtcbiAgaWYgKHNjaGVtYSkgdGhpcy5zY2hlbWEoc2NoZW1hKTtcblxuICAvLyBSZXNldCBvdXRwdXQgdmFsdWVcbiAgdGhpcy5vdXRwdXQoW1tdXSk7XG5cbiAgaWYgKHRoaXMubWV0YS5zY2hlbWEuc2VsZWN0KSB7XG4gICAgdGhpcy5tZXRob2QoXCJzZWxlY3RcIik7XG4gICAgb3B0aW9ucyA9IGV4dGVuZCh7XG4gICAgICByZWNvcmRzOiBcIlwiLFxuICAgICAgc2VsZWN0OiB0cnVlXG4gICAgfSwgdGhpcy5zY2hlbWEoKSk7XG4gICAgX3NlbGVjdC5jYWxsKHRoaXMsIF9vcHRIYXNoKG9wdGlvbnMpKTtcbiAgfVxuICBlbHNlIGlmICh0aGlzLm1ldGEuc2NoZW1hLnVucGFjaykge1xuICAgIHRoaXMubWV0aG9kKFwidW5wYWNrXCIpO1xuICAgIG9wdGlvbnMgPSBleHRlbmQoe1xuICAgICAgcmVjb3JkczogXCJcIixcbiAgICAgIHVucGFjazoge1xuICAgICAgICBpbmRleDogZmFsc2UsXG4gICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgbGFiZWw6IGZhbHNlXG4gICAgICB9XG4gICAgfSwgdGhpcy5zY2hlbWEoKSk7XG4gICAgX3VucGFjay5jYWxsKHRoaXMsIF9vcHRIYXNoKG9wdGlvbnMpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cblxuLy8gU2VsZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBfc2VsZWN0KGNmZyl7XG5cbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgb3B0aW9ucyA9IGNmZyB8fCB7fSxcbiAgICAgIHRhcmdldF9zZXQgPSBbXSxcbiAgICAgIHVuaXF1ZV9rZXlzID0gW107XG5cbiAgdmFyIHJvb3QsIHJlY29yZHNfdGFyZ2V0O1xuICBpZiAob3B0aW9ucy5yZWNvcmRzID09PSBcIlwiIHx8ICFvcHRpb25zLnJlY29yZHMpIHtcbiAgICByb290ID0gW3NlbGYuaW5wdXQoKV07XG4gIH0gZWxzZSB7XG4gICAgcmVjb3Jkc190YXJnZXQgPSBvcHRpb25zLnJlY29yZHMuc3BsaXQoRGF0YXNldC5kZWZhdWx0cy5kZWxpbWV0ZXIpO1xuICAgIHJvb3QgPSBwYXJzZS5hcHBseShzZWxmLCBbc2VsZi5pbnB1dCgpXS5jb25jYXQocmVjb3Jkc190YXJnZXQpKVswXTtcbiAgfVxuXG4gIGVhY2gob3B0aW9ucy5zZWxlY3QsIGZ1bmN0aW9uKHByb3Ape1xuICAgIHRhcmdldF9zZXQucHVzaChwcm9wLnBhdGguc3BsaXQoRGF0YXNldC5kZWZhdWx0cy5kZWxpbWV0ZXIpKTtcbiAgfSk7XG5cbiAgLy8gUmV0cmlldmUga2V5cyBmb3VuZCBpbiBhc3ltbWV0cmljYWwgY29sbGVjdGlvbnNcbiAgaWYgKHRhcmdldF9zZXQubGVuZ3RoID09IDApIHtcbiAgICBlYWNoKHJvb3QsIGZ1bmN0aW9uKHJlY29yZCwgaW50ZXJ2YWwpe1xuICAgICAgdmFyIGZsYXQgPSBmbGF0dGVuKHJlY29yZCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdmbGF0JywgZmxhdCk7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gZmxhdCkge1xuICAgICAgICBpZiAoZmxhdC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIHVuaXF1ZV9rZXlzLmluZGV4T2Yoa2V5KSA9PSAtMSkge1xuICAgICAgICAgIHVuaXF1ZV9rZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICB0YXJnZXRfc2V0LnB1c2goW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB2YXIgdGVzdCA9IFtbXV07XG5cbiAgLy8gQXBwZW5kIGhlYWRlciByb3dcbiAgZWFjaCh0YXJnZXRfc2V0LCBmdW5jdGlvbihwcm9wcywgaSl7XG4gICAgaWYgKHRhcmdldF9zZXQubGVuZ3RoID09IDEpIHtcbiAgICAgIC8vIFN0YXRpYyBoZWFkZXIgZm9yIHNpbmdsZSB2YWx1ZVxuICAgICAgdGVzdFswXS5wdXNoKCdsYWJlbCcsICd2YWx1ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEeW5hbWljIGhlYWRlciBmb3Igbi12YWx1ZXNcbiAgICAgIHRlc3RbMF0ucHVzaChwcm9wcy5qb2luKFwiLlwiKSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBBcHBlbmQgYWxsIHJvd3NcbiAgZWFjaChyb290LCBmdW5jdGlvbihyZWNvcmQsIGkpe1xuICAgIHZhciBmbGF0ID0gZmxhdHRlbihyZWNvcmQpO1xuICAgIGlmICh0YXJnZXRfc2V0Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAvLyBTdGF0aWMgcm93IGZvciBzaW5nbGUgdmFsdWVcbiAgICAgIHRlc3QucHVzaChbdGFyZ2V0X3NldC5qb2luKFwiLlwiKSwgZmxhdFt0YXJnZXRfc2V0LmpvaW4oXCIuXCIpXV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEeW5hbWljIHJvdyBmb3Igbi12YWx1ZXNcbiAgICAgIHRlc3QucHVzaChbXSk7XG4gICAgICBlYWNoKHRhcmdldF9zZXQsIGZ1bmN0aW9uKHQsIGope1xuICAgICAgICB2YXIgdGFyZ2V0ID0gdC5qb2luKFwiLlwiKTtcbiAgICAgICAgdGVzdFtpKzFdLnB1c2goZmxhdFt0YXJnZXRdKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgc2VsZi5vdXRwdXQodGVzdCk7XG4gIHNlbGYuZm9ybWF0KG9wdGlvbnMuc2VsZWN0KTtcbiAgcmV0dXJuIHNlbGY7XG59XG5cblxuLy8gVW5wYWNrXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBfdW5wYWNrKG9wdGlvbnMpe1xuICAvL2NvbnNvbGUubG9nKCdVbnBhY2tpbmcnLCBvcHRpb25zKTtcbiAgdmFyIHNlbGYgPSB0aGlzLCBkaXNjb3ZlcmVkX2xhYmVscyA9IFtdO1xuXG4gIHZhciB2YWx1ZV9zZXQgPSAob3B0aW9ucy51bnBhY2sudmFsdWUpID8gb3B0aW9ucy51bnBhY2sudmFsdWUucGF0aC5zcGxpdChEYXRhc2V0LmRlZmF1bHRzLmRlbGltZXRlcikgOiBmYWxzZSxcbiAgICAgIGxhYmVsX3NldCA9IChvcHRpb25zLnVucGFjay5sYWJlbCkgPyBvcHRpb25zLnVucGFjay5sYWJlbC5wYXRoLnNwbGl0KERhdGFzZXQuZGVmYXVsdHMuZGVsaW1ldGVyKSA6IGZhbHNlLFxuICAgICAgaW5kZXhfc2V0ID0gKG9wdGlvbnMudW5wYWNrLmluZGV4KSA/IG9wdGlvbnMudW5wYWNrLmluZGV4LnBhdGguc3BsaXQoRGF0YXNldC5kZWZhdWx0cy5kZWxpbWV0ZXIpIDogZmFsc2U7XG4gIC8vY29uc29sZS5sb2coaW5kZXhfc2V0LCBsYWJlbF9zZXQsIHZhbHVlX3NldCk7XG5cbiAgdmFyIHZhbHVlX2Rlc2MgPSAodmFsdWVfc2V0W3ZhbHVlX3NldC5sZW5ndGgtMV0gIT09IFwiXCIpID8gdmFsdWVfc2V0W3ZhbHVlX3NldC5sZW5ndGgtMV0gOiBcIlZhbHVlXCIsXG4gICAgICBsYWJlbF9kZXNjID0gKGxhYmVsX3NldFtsYWJlbF9zZXQubGVuZ3RoLTFdICE9PSBcIlwiKSA/IGxhYmVsX3NldFtsYWJlbF9zZXQubGVuZ3RoLTFdIDogXCJMYWJlbFwiLFxuICAgICAgaW5kZXhfZGVzYyA9IChpbmRleF9zZXRbaW5kZXhfc2V0Lmxlbmd0aC0xXSAhPT0gXCJcIikgPyBpbmRleF9zZXRbaW5kZXhfc2V0Lmxlbmd0aC0xXSA6IFwiSW5kZXhcIjtcblxuICAvLyBQcmVwYXJlIHJvb3QgZm9yIHBhcnNpbmdcbiAgdmFyIHJvb3QgPSAoZnVuY3Rpb24oKXtcbiAgICB2YXIgcm9vdDtcbiAgICBpZiAob3B0aW9ucy5yZWNvcmRzID09IFwiXCIpIHtcbiAgICAgIHJvb3QgPSBbc2VsZi5pbnB1dCgpXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcm9vdCA9IHBhcnNlLmFwcGx5KHNlbGYsIFtzZWxmLmlucHV0KCldLmNvbmNhdChvcHRpb25zLnJlY29yZHMuc3BsaXQoRGF0YXNldC5kZWZhdWx0cy5kZWxpbWV0ZXIpKSk7XG4gICAgfVxuICAgIHJldHVybiByb290WzBdO1xuICB9KSgpO1xuXG4gIGlmIChyb290IGluc3RhbmNlb2YgQXJyYXkgPT0gZmFsc2UpIHtcbiAgICByb290ID0gW3Jvb3RdO1xuICB9XG5cbiAgLy8gRmluZCBsYWJlbHNcbiAgZWFjaChyb290LCBmdW5jdGlvbihyZWNvcmQsIGludGVydmFsKXtcbiAgICB2YXIgbGFiZWxzID0gKGxhYmVsX3NldCkgPyBwYXJzZS5hcHBseShzZWxmLCBbcmVjb3JkXS5jb25jYXQobGFiZWxfc2V0KSkgOiBbXTtcbiAgICBpZiAobGFiZWxzKSB7XG4gICAgICBkaXNjb3ZlcmVkX2xhYmVscyA9IGxhYmVscztcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFBhcnNlIGVhY2ggcmVjb3JkXG4gIGVhY2gocm9vdCwgZnVuY3Rpb24ocmVjb3JkLCBpbnRlcnZhbCl7XG4gICAgLy9jb25zb2xlLmxvZygncmVjb3JkJywgcmVjb3JkKTtcblxuICAgIHZhciBwbHVja2VkX3ZhbHVlID0gKHZhbHVlX3NldCkgPyBwYXJzZS5hcHBseShzZWxmLCBbcmVjb3JkXS5jb25jYXQodmFsdWVfc2V0KSkgOiBmYWxzZSxcbiAgICAgICAgLy9wbHVja2VkX2xhYmVsID0gKGxhYmVsX3NldCkgPyBwYXJzZS5hcHBseShzZWxmLCBbcmVjb3JkXS5jb25jYXQobGFiZWxfc2V0KSkgOiBmYWxzZSxcbiAgICAgICAgcGx1Y2tlZF9pbmRleCA9IChpbmRleF9zZXQpID8gcGFyc2UuYXBwbHkoc2VsZiwgW3JlY29yZF0uY29uY2F0KGluZGV4X3NldCkpIDogZmFsc2U7XG4gICAgLy9jb25zb2xlLmxvZyhwbHVja2VkX2luZGV4LCBwbHVja2VkX2xhYmVsLCBwbHVja2VkX3ZhbHVlKTtcblxuICAgIC8vIEluamVjdCByb3cgZm9yIGVhY2ggaW5kZXhcbiAgICBpZiAocGx1Y2tlZF9pbmRleCkge1xuICAgICAgZWFjaChwbHVja2VkX2luZGV4LCBmdW5jdGlvbigpe1xuICAgICAgICBzZWxmLmRhdGEub3V0cHV0LnB1c2goW10pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuZGF0YS5vdXRwdXQucHVzaChbXSk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgaW5kZXggY29sdW1uXG4gICAgaWYgKHBsdWNrZWRfaW5kZXgpIHtcblxuICAgICAgLy8gQnVpbGQgaW5kZXgvbGFiZWwgb24gZmlyc3QgaW50ZXJ2YWxcbiAgICAgIGlmIChpbnRlcnZhbCA9PSAwKSB7XG5cbiAgICAgICAgLy8gUHVzaCBsYXN0IGluZGV4IHByb3BlcnR5IHRvIDAsMFxuICAgICAgICBzZWxmLmRhdGEub3V0cHV0WzBdLnB1c2goaW5kZXhfZGVzYyk7XG5cbiAgICAgICAgLy8gQnVpbGQgc3Vic2VxdWVudCBzZXJpZXMgaGVhZGVycyAoMTpOKVxuICAgICAgICBpZiAoZGlzY292ZXJlZF9sYWJlbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGVhY2goZGlzY292ZXJlZF9sYWJlbHMsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbMF0ucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0WzBdLnB1c2godmFsdWVfZGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQ29ycmVjdCBmb3Igb2RkIHJvb3QgY2FzZXNcbiAgICAgIGlmIChyb290Lmxlbmd0aCA8IHNlbGYuZGF0YS5vdXRwdXQubGVuZ3RoLTEpIHtcbiAgICAgICAgaWYgKGludGVydmFsID09IDApIHtcbiAgICAgICAgICBlYWNoKHNlbGYuZGF0YS5vdXRwdXQsIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXS5wdXNoKHBsdWNrZWRfaW5kZXhbaS0xXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaW50ZXJ2YWwrMV0ucHVzaChwbHVja2VkX2luZGV4WzBdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBCdWlsZCBsYWJlbCBjb2x1bW5cbiAgICBpZiAoIXBsdWNrZWRfaW5kZXggJiYgZGlzY292ZXJlZF9sYWJlbHMubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKGludGVydmFsID09IDApIHtcbiAgICAgICAgc2VsZi5kYXRhLm91dHB1dFswXS5wdXNoKGxhYmVsX2Rlc2MpO1xuICAgICAgICBzZWxmLmRhdGEub3V0cHV0WzBdLnB1c2godmFsdWVfZGVzYyk7XG4gICAgICB9XG4gICAgICBzZWxmLmRhdGEub3V0cHV0W2ludGVydmFsKzFdLnB1c2goZGlzY292ZXJlZF9sYWJlbHNbMF0pO1xuICAgIH1cblxuICAgIGlmICghcGx1Y2tlZF9pbmRleCAmJiBkaXNjb3ZlcmVkX2xhYmVscy5sZW5ndGggPT0gMCkge1xuICAgICAgLy8gW1JFVklTSVRdXG4gICAgICBzZWxmLmRhdGEub3V0cHV0WzBdLnB1c2goJycpO1xuICAgIH1cblxuICAgIC8vIEFwcGVuZCB2YWx1ZXNcbiAgICBpZiAocGx1Y2tlZF92YWx1ZSkge1xuICAgICAgLy8gQ29ycmVjdCBmb3Igb2RkIHJvb3QgY2FzZXNcbiAgICAgIGlmIChyb290Lmxlbmd0aCA8IHNlbGYuZGF0YS5vdXRwdXQubGVuZ3RoLTEpIHtcbiAgICAgICAgaWYgKGludGVydmFsID09IDApIHtcbiAgICAgICAgICBlYWNoKHNlbGYuZGF0YS5vdXRwdXQsIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXS5wdXNoKHBsdWNrZWRfdmFsdWVbaS0xXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVhY2gocGx1Y2tlZF92YWx1ZSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaW50ZXJ2YWwrMV0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhcHBlbmQgbnVsbCBhY3Jvc3MgdGhpcyByb3dcbiAgICAgIGVhY2goc2VsZi5kYXRhLm91dHB1dFswXSwgZnVuY3Rpb24oY2VsbCwgaSl7XG4gICAgICAgIHZhciBvZmZzZXQgPSAocGx1Y2tlZF9pbmRleCkgPyAwIDogLTE7XG4gICAgICAgIGlmIChpID4gb2Zmc2V0KSB7XG4gICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpbnRlcnZhbCsxXS5wdXNoKG51bGwpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICB9KTtcblxuICBzZWxmLmZvcm1hdChvcHRpb25zLnVucGFjayk7XG4gIC8vc2VsZi5zb3J0KG9wdGlvbnMuc29ydCk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5cblxuLy8gU3RyaW5nIGNvbmZpZ3MgdG8gaGFzaCBwYXRoc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gX29wdEhhc2gob3B0aW9ucyl7XG4gIGVhY2gob3B0aW9ucy51bnBhY2ssIGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iamVjdCl7XG4gICAgaWYgKHZhbHVlICYmIGlzKHZhbHVlLCAnc3RyaW5nJykpIHtcbiAgICAgIG9wdGlvbnMudW5wYWNrW2tleV0gPSB7IHBhdGg6IG9wdGlvbnMudW5wYWNrW2tleV0gfTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3B0aW9ucztcbn1cblxuXG4vLyB2aWE6IGh0dHBzOi8vZ2l0aHViLmNvbS9zcG9ja2UvcHVueW1jZVxuZnVuY3Rpb24gaXMobywgdCl7XG4gIG8gPSB0eXBlb2Yobyk7XG4gIGlmICghdCl7XG4gICAgcmV0dXJuIG8gIT0gJ3VuZGVmaW5lZCc7XG4gIH1cbiAgcmV0dXJuIG8gPT0gdDtcbn1cblxuLy8gQWRhcHRlZCB0byBleGNsdWRlIG51bGwgdmFsdWVzXG5mdW5jdGlvbiBleHRlbmQobywgZSl7XG4gIGVhY2goZSwgZnVuY3Rpb24odiwgbil7XG4gICAgaWYgKGlzKG9bbl0sICdvYmplY3QnKSAmJiBpcyh2LCAnb2JqZWN0Jykpe1xuICAgICAgb1tuXSA9IGV4dGVuZChvW25dLCB2KTtcbiAgICB9IGVsc2UgaWYgKHYgIT09IG51bGwpIHtcbiAgICAgIG9bbl0gPSB2O1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFzZXQ7XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZShcIi4uL2NvcmUvdXRpbHMvZXh0ZW5kXCIpLFxuICAgIERhdGFzZXQgPSByZXF1aXJlKFwiLi9kYXRhc2V0XCIpO1xuXG5leHRlbmQoRGF0YXNldC5wcm90b3R5cGUsIHJlcXVpcmUoXCIuL2xpYi9hcHBlbmRcIikpO1xuZXh0ZW5kKERhdGFzZXQucHJvdG90eXBlLCByZXF1aXJlKFwiLi9saWIvZGVsZXRlXCIpKTtcbmV4dGVuZChEYXRhc2V0LnByb3RvdHlwZSwgcmVxdWlyZShcIi4vbGliL2ZpbHRlclwiKSk7XG5leHRlbmQoRGF0YXNldC5wcm90b3R5cGUsIHJlcXVpcmUoXCIuL2xpYi9pbnNlcnRcIikpO1xuZXh0ZW5kKERhdGFzZXQucHJvdG90eXBlLCByZXF1aXJlKFwiLi9saWIvc2VsZWN0XCIpKTtcbmV4dGVuZChEYXRhc2V0LnByb3RvdHlwZSwgcmVxdWlyZShcIi4vbGliL3NldFwiKSk7XG5leHRlbmQoRGF0YXNldC5wcm90b3R5cGUsIHJlcXVpcmUoXCIuL2xpYi9zb3J0XCIpKTtcbmV4dGVuZChEYXRhc2V0LnByb3RvdHlwZSwgcmVxdWlyZShcIi4vbGliL3VwZGF0ZVwiKSk7XG5cbmV4dGVuZChEYXRhc2V0LnByb3RvdHlwZSwgcmVxdWlyZShcIi4vbGliL2FuYWx5c2VzXCIpKTtcbmV4dGVuZChEYXRhc2V0LnByb3RvdHlwZSwge1xuICBcImZvcm1hdFwiOiByZXF1aXJlKFwiLi9saWIvZm9ybWF0XCIpXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhc2V0O1xuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpLFxuICAgIGFyciA9IFtcIkF2ZXJhZ2VcIiwgXCJNYXhpbXVtXCIsIFwiTWluaW11bVwiLCBcIlN1bVwiXSxcbiAgICBvdXRwdXQgPSB7fTtcblxub3V0cHV0W1wiYXZlcmFnZVwiXSA9IGZ1bmN0aW9uKGFyciwgc3RhcnQsIGVuZCl7XG4gIHZhciBzZXQgPSBhcnIuc2xpY2Uoc3RhcnR8fDAsIChlbmQgPyBlbmQrMSA6IGFyci5sZW5ndGgpKSxcbiAgICAgIHN1bSA9IDAsXG4gICAgICBhdmcgPSBudWxsO1xuXG4gIC8vIEFkZCBudW1lcmljIHZhbHVlc1xuICBlYWNoKHNldCwgZnVuY3Rpb24odmFsLCBpKXtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIiAmJiAhaXNOYU4ocGFyc2VGbG9hdCh2YWwpKSkge1xuICAgICAgc3VtICs9IHBhcnNlRmxvYXQodmFsKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc3VtIC8gc2V0Lmxlbmd0aDtcbn07XG5cbm91dHB1dFtcIm1heGltdW1cIl0gPSBmdW5jdGlvbihhcnIsIHN0YXJ0LCBlbmQpe1xuICB2YXIgc2V0ID0gYXJyLnNsaWNlKHN0YXJ0fHwwLCAoZW5kID8gZW5kKzEgOiBhcnIubGVuZ3RoKSksXG4gICAgICBudW1zID0gW107XG5cbiAgLy8gUHVsbCBudW1lcmljIHZhbHVlc1xuICBlYWNoKHNldCwgZnVuY3Rpb24odmFsLCBpKXtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIiAmJiAhaXNOYU4ocGFyc2VGbG9hdCh2YWwpKSkge1xuICAgICAgbnVtcy5wdXNoKHBhcnNlRmxvYXQodmFsKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsIG51bXMpO1xufTtcblxub3V0cHV0W1wibWluaW11bVwiXSA9IGZ1bmN0aW9uKGFyciwgc3RhcnQsIGVuZCl7XG4gIHZhciBzZXQgPSBhcnIuc2xpY2Uoc3RhcnR8fDAsIChlbmQgPyBlbmQrMSA6IGFyci5sZW5ndGgpKSxcbiAgICAgIG51bXMgPSBbXTtcblxuICAvLyBQdWxsIG51bWVyaWMgdmFsdWVzXG4gIGVhY2goc2V0LCBmdW5jdGlvbih2YWwsIGkpe1xuICAgIGlmICh0eXBlb2YgdmFsID09PSBcIm51bWJlclwiICYmICFpc05hTihwYXJzZUZsb2F0KHZhbCkpKSB7XG4gICAgICBudW1zLnB1c2gocGFyc2VGbG9hdCh2YWwpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgbnVtcyk7XG59O1xuXG5vdXRwdXRbXCJzdW1cIl0gPSBmdW5jdGlvbihhcnIsIHN0YXJ0LCBlbmQpe1xuICAvLyBDb3B5IHNldCB3aXRoIGdpdmVuIHJhbmdlXG4gIHZhciBzZXQgPSBhcnIuc2xpY2Uoc3RhcnR8fDAsIChlbmQgPyBlbmQrMSA6IGFyci5sZW5ndGgpKSxcbiAgICAgIHN1bSA9IDA7XG5cbiAgLy8gQWRkIG51bWVyaWMgdmFsdWVzXG4gIGVhY2goc2V0LCBmdW5jdGlvbih2YWwsIGkpe1xuICAgIGlmICh0eXBlb2YgdmFsID09PSBcIm51bWJlclwiICYmICFpc05hTihwYXJzZUZsb2F0KHZhbCkpKSB7XG4gICAgICBzdW0gKz0gcGFyc2VGbG9hdCh2YWwpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzdW07XG59O1xuXG4vLyBDb252ZW5pZW5jZSBtZXRob2RzXG5cbmVhY2goYXJyLCBmdW5jdGlvbih2LGkpe1xuICBvdXRwdXRbXCJnZXRDb2x1bW5cIit2XSA9IG91dHB1dFtcImdldFJvd1wiK3ZdID0gZnVuY3Rpb24oYXJyKXtcbiAgICByZXR1cm4gdGhpc1t2LnRvTG93ZXJDYXNlKCldKGFyciwgMSk7XG4gIH07XG59KTtcblxub3V0cHV0W1wiZ2V0Q29sdW1uTGFiZWxcIl0gPSBvdXRwdXRbXCJnZXRSb3dJbmRleFwiXSA9IGZ1bmN0aW9uKGFycil7XG4gIHJldHVybiBhcnJbMF07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG91dHB1dDtcbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcbnZhciBjcmVhdGVOdWxsTGlzdCA9IHJlcXVpcmUoJy4uL3V0aWxzL2NyZWF0ZS1udWxsLWxpc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiYXBwZW5kQ29sdW1uXCI6IGFwcGVuZENvbHVtbixcbiAgXCJhcHBlbmRSb3dcIjogYXBwZW5kUm93XG59O1xuXG5mdW5jdGlvbiBhcHBlbmRDb2x1bW4oc3RyLCBpbnB1dCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpLFxuICAgICAgbGFiZWwgPSAoc3RyICE9PSB1bmRlZmluZWQpID8gc3RyIDogbnVsbDtcblxuICBpZiAodHlwZW9mIGlucHV0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBzZWxmLmRhdGEub3V0cHV0WzBdLnB1c2gobGFiZWwpO1xuICAgIGVhY2goc2VsZi5vdXRwdXQoKSwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgIHZhciBjZWxsO1xuICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgIGNlbGwgPSBpbnB1dC5jYWxsKHNlbGYsIHJvdywgaSk7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGNlbGwgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV0ucHVzaChjZWxsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGVsc2UgaWYgKCFpbnB1dCB8fCBpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgaW5wdXQgPSBpbnB1dCB8fCBbXTtcblxuICAgIGlmIChpbnB1dC5sZW5ndGggPD0gc2VsZi5vdXRwdXQoKS5sZW5ndGggLSAxKSB7XG4gICAgICBpbnB1dCA9IGlucHV0LmNvbmNhdCggY3JlYXRlTnVsbExpc3Qoc2VsZi5vdXRwdXQoKS5sZW5ndGggLSAxIC0gaW5wdXQubGVuZ3RoKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIElmIHRoaXMgbmV3IGNvbHVtbiBpcyBsb25nZXIgdGhhbiBleGlzdGluZyBjb2x1bW5zLFxuICAgICAgLy8gd2UgbmVlZCB0byB1cGRhdGUgdGhlIHJlc3QgdG8gbWF0Y2ggLi4uXG4gICAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICAgIGlmIChzZWxmLmRhdGEub3V0cHV0Lmxlbmd0aCAtMSA8IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgIGFwcGVuZFJvdy5jYWxsKHNlbGYsIFN0cmluZyggc2VsZi5kYXRhLm91dHB1dC5sZW5ndGggKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbGYuZGF0YS5vdXRwdXRbMF0ucHVzaChsYWJlbCk7XG4gICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgc2VsZi5kYXRhLm91dHB1dFtpKzFdW3NlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoLTFdID0gdmFsdWU7XG4gICAgfSk7XG5cbiAgfVxuXG4gIHJldHVybiBzZWxmO1xufVxuXG5cbmZ1bmN0aW9uIGFwcGVuZFJvdyhzdHIsIGlucHV0KXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMiksXG4gICAgICBsYWJlbCA9IChzdHIgIT09IHVuZGVmaW5lZCkgPyBzdHIgOiBudWxsLFxuICAgICAgbmV3Um93ID0gW107XG5cbiAgbmV3Um93LnB1c2gobGFiZWwpO1xuXG4gIGlmICh0eXBlb2YgaW5wdXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGVhY2goc2VsZi5kYXRhLm91dHB1dFswXSwgZnVuY3Rpb24obGFiZWwsIGkpe1xuICAgICAgdmFyIGNvbCwgY2VsbDtcbiAgICAgIGlmIChpID4gMCkge1xuICAgICAgICBjb2wgPSBzZWxmLnNlbGVjdENvbHVtbihpKTtcbiAgICAgICAgY2VsbCA9IGlucHV0LmNhbGwoc2VsZiwgY29sLCBpKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjZWxsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgY2VsbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbmV3Um93LnB1c2goY2VsbCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgc2VsZi5kYXRhLm91dHB1dC5wdXNoKG5ld1Jvdyk7XG4gIH1cblxuICBlbHNlIGlmICghaW5wdXQgfHwgaW5wdXQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGlucHV0ID0gaW5wdXQgfHwgW107XG5cbiAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoIC0gMSkge1xuICAgICAgaW5wdXQgPSBpbnB1dC5jb25jYXQoIGNyZWF0ZU51bGxMaXN0KCBzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCAtIDEgLSBpbnB1dC5sZW5ndGggKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgICAgaWYgKHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoIC0xIDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgYXBwZW5kQ29sdW1uLmNhbGwoc2VsZiwgU3RyaW5nKCBzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VsZi5kYXRhLm91dHB1dC5wdXNoKCBuZXdSb3cuY29uY2F0KGlucHV0KSApO1xuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcImRlbGV0ZUNvbHVtblwiOiBkZWxldGVDb2x1bW4sXG4gIFwiZGVsZXRlUm93XCI6IGRlbGV0ZVJvd1xufTtcblxuZnVuY3Rpb24gZGVsZXRlQ29sdW1uKHEpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBpbmRleCA9ICh0eXBlb2YgcSA9PT0gJ251bWJlcicpID8gcSA6IHRoaXMuZGF0YS5vdXRwdXRbMF0uaW5kZXhPZihxKTtcblxuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIGVhY2goc2VsZi5kYXRhLm91dHB1dCwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gc2VsZjtcbn1cblxuZnVuY3Rpb24gZGVsZXRlUm93KHEpe1xuICB2YXIgaW5kZXggPSAodHlwZW9mIHEgPT09ICdudW1iZXInKSA/IHEgOiB0aGlzLnNlbGVjdENvbHVtbigwKS5pbmRleE9mKHEpO1xuXG4gIGlmIChpbmRleCA+IC0xKSB7XG4gICAgdGhpcy5kYXRhLm91dHB1dC5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJmaWx0ZXJDb2x1bW5zXCI6IGZpbHRlckNvbHVtbnMsXG4gIFwiZmlsdGVyUm93c1wiOiBmaWx0ZXJSb3dzXG59O1xuXG5mdW5jdGlvbiBmaWx0ZXJDb2x1bW5zKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgY2xvbmUgPSBuZXcgQXJyYXkoKTtcblxuICBlYWNoKHNlbGYuZGF0YS5vdXRwdXQsIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgY2xvbmUucHVzaChbXSk7XG4gIH0pO1xuXG4gIGVhY2goc2VsZi5kYXRhLm91dHB1dFswXSwgZnVuY3Rpb24oY29sLCBpKXtcbiAgICB2YXIgc2VsZWN0ZWRDb2x1bW4gPSBzZWxmLnNlbGVjdENvbHVtbihpKTtcbiAgICBpZiAoaSA9PSAwIHx8IGZuLmNhbGwoc2VsZiwgc2VsZWN0ZWRDb2x1bW4sIGkpKSB7XG4gICAgICBlYWNoKHNlbGVjdGVkQ29sdW1uLCBmdW5jdGlvbihjZWxsLCByaSl7XG4gICAgICAgIGNsb25lW3JpXS5wdXNoKGNlbGwpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBzZWxmLm91dHB1dChjbG9uZSk7XG4gIHJldHVybiBzZWxmO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJSb3dzKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgY2xvbmUgPSBbXTtcblxuICBlYWNoKHNlbGYub3V0cHV0KCksIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgaWYgKGkgPT0gMCB8fCBmbi5jYWxsKHNlbGYsIHJvdywgaSkpIHtcbiAgICAgIGNsb25lLnB1c2gocm93KTtcbiAgICB9XG4gIH0pO1xuXG4gIHNlbGYub3V0cHV0KGNsb25lKTtcbiAgcmV0dXJuIHNlbGY7XG59XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLm1ldGhvZCgpID09PSAnc2VsZWN0Jykge1xuXG4gICAgICBlYWNoKHNlbGYub3V0cHV0KCksIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICAgIC8vIFJlcGxhY2UgbGFiZWxzXG4gICAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgICBlYWNoKHJvdywgZnVuY3Rpb24oY2VsbCwgail7XG4gICAgICAgICAgICBpZiAob3B0aW9uc1tqXSAmJiBvcHRpb25zW2pdLmxhYmVsKSB7XG4gICAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV1bal0gPSBvcHRpb25zW2pdLmxhYmVsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVhY2gocm93LCBmdW5jdGlvbihjZWxsLCBqKXtcbiAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV1bal0gPSBfYXBwbHlGb3JtYXQoc2VsZi5kYXRhLm91dHB1dFtpXVtqXSwgb3B0aW9uc1tqXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfVxuXG4gIGlmICh0aGlzLm1ldGhvZCgpID09PSAndW5wYWNrJykge1xuXG4gICAgaWYgKG9wdGlvbnMuaW5kZXgpIHtcbiAgICAgIGVhY2goc2VsZi5vdXRwdXQoKSwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgICAgaWYgKGkgPT0gMCkge1xuICAgICAgICAgIGlmIChvcHRpb25zLmluZGV4LmxhYmVsKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldWzBdID0gb3B0aW9ucy5pbmRleC5sYWJlbDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXVswXSA9IF9hcHBseUZvcm1hdChzZWxmLmRhdGEub3V0cHV0W2ldWzBdLCBvcHRpb25zLmluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMubGFiZWwpIHtcbiAgICAgIGlmIChvcHRpb25zLmluZGV4KSB7XG4gICAgICAgIGVhY2goc2VsZi5vdXRwdXQoKSwgZnVuY3Rpb24ocm93LCBpKXtcbiAgICAgICAgICBlYWNoKHJvdywgZnVuY3Rpb24oY2VsbCwgail7XG4gICAgICAgICAgICBpZiAoaSA9PSAwICYmIGogPiAwKSB7XG4gICAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV1bal0gPSBfYXBwbHlGb3JtYXQoc2VsZi5kYXRhLm91dHB1dFtpXVtqXSwgb3B0aW9ucy5sYWJlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWFjaChzZWxmLm91dHB1dCgpLCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgc2VsZi5kYXRhLm91dHB1dFtpXVswXSA9IF9hcHBseUZvcm1hdChzZWxmLmRhdGEub3V0cHV0W2ldWzBdLCBvcHRpb25zLmxhYmVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnZhbHVlKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbmRleCkge1xuICAgICAgICAvLyBzdGFydCA+IDBcbiAgICAgICAgZWFjaChzZWxmLm91dHB1dCgpLCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgICAgIGVhY2gocm93LCBmdW5jdGlvbihjZWxsLCBqKXtcbiAgICAgICAgICAgIGlmIChpID4gMCAmJiBqID4gMCkge1xuICAgICAgICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldW2pdID0gX2FwcGx5Rm9ybWF0KHNlbGYuZGF0YS5vdXRwdXRbaV1bal0sIG9wdGlvbnMudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHN0YXJ0IEAgMFxuICAgICAgICBlYWNoKHNlbGYub3V0cHV0KCksIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICAgICAgZWFjaChyb3csIGZ1bmN0aW9uKGNlbGwsIGope1xuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV1bal0gPSBfYXBwbHlGb3JtYXQoc2VsZi5kYXRhLm91dHB1dFtpXVtqXSwgb3B0aW9ucy52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5mdW5jdGlvbiBfYXBwbHlGb3JtYXQodmFsdWUsIG9wdHMpe1xuICB2YXIgb3V0cHV0ID0gdmFsdWUsXG4gICAgICBvcHRpb25zID0gb3B0cyB8fCB7fTtcblxuICBpZiAob3B0aW9ucy5yZXBsYWNlKSB7XG4gICAgZWFjaChvcHRpb25zLnJlcGxhY2UsIGZ1bmN0aW9uKHZhbCwga2V5KXtcbiAgICAgIGlmIChvdXRwdXQgPT0ga2V5IHx8IFN0cmluZyhvdXRwdXQpID09IFN0cmluZyhrZXkpIHx8IHBhcnNlRmxvYXQob3V0cHV0KSA9PSBwYXJzZUZsb2F0KGtleSkpIHtcbiAgICAgICAgb3V0cHV0ID0gdmFsO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMudHlwZSAmJiBvcHRpb25zLnR5cGUgPT0gJ2RhdGUnKSB7XG4gICAgaWYgKG9wdGlvbnMuZm9ybWF0ICYmIG1vbWVudCAmJiBtb21lbnQodmFsdWUpLmlzVmFsaWQoKSkge1xuICAgICAgb3V0cHV0ID0gbW9tZW50KG91dHB1dCkuZm9ybWF0KG9wdGlvbnMuZm9ybWF0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0ID0gbmV3IERhdGUob3V0cHV0KTsgLy8udG9JU09TdHJpbmcoKTtcbiAgICB9XG4gIH1cblxuICBpZiAob3B0aW9ucy50eXBlICYmIG9wdGlvbnMudHlwZSA9PSAnc3RyaW5nJykge1xuICAgIG91dHB1dCA9IFN0cmluZyhvdXRwdXQpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMudHlwZSAmJiBvcHRpb25zLnR5cGUgPT0gJ251bWJlcicgJiYgIWlzTmFOKHBhcnNlRmxvYXQob3V0cHV0KSkpIHtcbiAgICBvdXRwdXQgPSBwYXJzZUZsb2F0KG91dHB1dCk7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xudmFyIGNyZWF0ZU51bGxMaXN0ID0gcmVxdWlyZSgnLi4vdXRpbHMvY3JlYXRlLW51bGwtbGlzdCcpO1xudmFyIGFwcGVuZCA9IHJlcXVpcmUoJy4vYXBwZW5kJyk7XG5cbnZhciBhcHBlbmRSb3cgPSBhcHBlbmQuYXBwZW5kUm93LFxuICAgIGFwcGVuZENvbHVtbiA9IGFwcGVuZC5hcHBlbmRDb2x1bW47XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcImluc2VydENvbHVtblwiOiBpbnNlcnRDb2x1bW4sXG4gIFwiaW5zZXJ0Um93XCI6IGluc2VydFJvd1xufTtcblxuZnVuY3Rpb24gaW5zZXJ0Q29sdW1uKGluZGV4LCBzdHIsIGlucHV0KXtcbiAgdmFyIHNlbGYgPSB0aGlzLCBsYWJlbDtcblxuICBsYWJlbCA9IChzdHIgIT09IHVuZGVmaW5lZCkgPyBzdHIgOiBudWxsO1xuXG4gIGlmICh0eXBlb2YgaW5wdXQgPT09IFwiZnVuY3Rpb25cIikge1xuXG4gICAgc2VsZi5kYXRhLm91dHB1dFswXS5zcGxpY2UoaW5kZXgsIDAsIGxhYmVsKTtcbiAgICBlYWNoKHNlbGYub3V0cHV0KCksIGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICB2YXIgY2VsbDtcbiAgICAgIGlmIChpID4gMCkge1xuICAgICAgICBjZWxsID0gaW5wdXQuY2FsbChzZWxmLCByb3csIGkpO1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBjZWxsID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2ldLnNwbGljZShpbmRleCwgMCwgY2VsbCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgfVxuXG4gIGVsc2UgaWYgKCFpbnB1dCB8fCBpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgaW5wdXQgPSBpbnB1dCB8fCBbXTtcblxuICAgIGlmIChpbnB1dC5sZW5ndGggPD0gc2VsZi5vdXRwdXQoKS5sZW5ndGggLSAxKSB7XG4gICAgICBpbnB1dCA9IGlucHV0LmNvbmNhdCggY3JlYXRlTnVsbExpc3Qoc2VsZi5vdXRwdXQoKS5sZW5ndGggLSAxIC0gaW5wdXQubGVuZ3RoKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIElmIHRoaXMgbmV3IGNvbHVtbiBpcyBsb25nZXIgdGhhbiBleGlzdGluZyBjb2x1bW5zLFxuICAgICAgLy8gd2UgbmVlZCB0byB1cGRhdGUgdGhlIHJlc3QgdG8gbWF0Y2ggLi4uXG4gICAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICAgIGlmIChzZWxmLmRhdGEub3V0cHV0Lmxlbmd0aCAtMSA8IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgIGFwcGVuZFJvdy5jYWxsKHNlbGYsIFN0cmluZyggc2VsZi5kYXRhLm91dHB1dC5sZW5ndGggKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbGYuZGF0YS5vdXRwdXRbMF0uc3BsaWNlKGluZGV4LCAwLCBsYWJlbCk7XG4gICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgc2VsZi5kYXRhLm91dHB1dFtpKzFdLnNwbGljZShpbmRleCwgMCwgdmFsdWUpO1xuICAgIH0pO1xuXG4gIH1cbiAgcmV0dXJuIHNlbGY7XG59XG5cbmZ1bmN0aW9uIGluc2VydFJvdyhpbmRleCwgc3RyLCBpbnB1dCl7XG4gIHZhciBzZWxmID0gdGhpcywgbGFiZWwsIG5ld1JvdyA9IFtdO1xuXG4gIGxhYmVsID0gKHN0ciAhPT0gdW5kZWZpbmVkKSA/IHN0ciA6IG51bGw7XG4gIG5ld1Jvdy5wdXNoKGxhYmVsKTtcblxuICBpZiAodHlwZW9mIGlucHV0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBlYWNoKHNlbGYub3V0cHV0KClbMF0sIGZ1bmN0aW9uKGxhYmVsLCBpKXtcbiAgICAgIHZhciBjb2wsIGNlbGw7XG4gICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgY29sID0gc2VsZi5zZWxlY3RDb2x1bW4oaSk7XG4gICAgICAgIGNlbGwgPSBpbnB1dC5jYWxsKHNlbGYsIGNvbCwgaSk7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGNlbGwgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIG5ld1Jvdy5wdXNoKGNlbGwpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYuZGF0YS5vdXRwdXQuc3BsaWNlKGluZGV4LCAwLCBuZXdSb3cpO1xuICB9XG5cbiAgZWxzZSBpZiAoIWlucHV0IHx8IGlucHV0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBpbnB1dCA9IGlucHV0IHx8IFtdO1xuXG4gICAgaWYgKGlucHV0Lmxlbmd0aCA8PSBzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCAtIDEpIHtcbiAgICAgIGlucHV0ID0gaW5wdXQuY29uY2F0KCBjcmVhdGVOdWxsTGlzdCggc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggLSAxIC0gaW5wdXQubGVuZ3RoICkgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICAgIGlmIChzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCAtMSA8IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgIGFwcGVuZENvbHVtbi5jYWxsKHNlbGYsIFN0cmluZyggc2VsZi5kYXRhLm91dHB1dFswXS5sZW5ndGggKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbGYuZGF0YS5vdXRwdXQuc3BsaWNlKGluZGV4LCAwLCBuZXdSb3cuY29uY2F0KGlucHV0KSApO1xuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcInNlbGVjdENvbHVtblwiOiBzZWxlY3RDb2x1bW4sXG4gIFwic2VsZWN0Um93XCI6IHNlbGVjdFJvd1xufTtcblxuZnVuY3Rpb24gc2VsZWN0Q29sdW1uKHEpe1xuICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KCksXG4gICAgICBpbmRleCA9ICh0eXBlb2YgcSA9PT0gJ251bWJlcicpID8gcSA6IHRoaXMuZGF0YS5vdXRwdXRbMF0uaW5kZXhPZihxKTtcblxuICBpZiAoaW5kZXggPiAtMSAmJiAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHRoaXMuZGF0YS5vdXRwdXRbMF1baW5kZXhdKSB7XG4gICAgZWFjaCh0aGlzLmRhdGEub3V0cHV0LCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgcmVzdWx0LnB1c2gocm93W2luZGV4XSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gc2VsZWN0Um93KHEpe1xuICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KCksXG4gICAgICBpbmRleCA9ICh0eXBlb2YgcSA9PT0gJ251bWJlcicpID8gcSA6IHRoaXMuc2VsZWN0Q29sdW1uKDApLmluZGV4T2YocSk7XG5cbiAgaWYgKGluZGV4ID4gLTEgJiYgJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLmRhdGEub3V0cHV0W2luZGV4XSkge1xuICAgIHJlc3VsdCA9IHRoaXMuZGF0YS5vdXRwdXRbaW5kZXhdO1xuICB9XG4gIHJldHVybiAgcmVzdWx0O1xufVxuIiwidmFyIGVhY2ggPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9lYWNoXCIpO1xuXG52YXIgYXBwZW5kID0gcmVxdWlyZSgnLi9hcHBlbmQnKTtcbnZhciBzZWxlY3QgPSByZXF1aXJlKCcuL3NlbGVjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJzZXRcIjogc2V0XG59O1xuXG5mdW5jdGlvbiBzZXQoY29vcmRzLCB2YWx1ZSl7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMiB8fCBjb29yZHMubGVuZ3RoIDwgMikge1xuICAgIHRocm93IEVycm9yKCdJbmNvcnJlY3QgYXJndW1lbnRzIHByb3ZpZGVkIGZvciAjc2V0IG1ldGhvZCcpO1xuICB9XG5cbiAgdmFyIGNvbEluZGV4ID0gJ251bWJlcicgPT09IHR5cGVvZiBjb29yZHNbMF0gPyBjb29yZHNbMF0gOiB0aGlzLmRhdGEub3V0cHV0WzBdLmluZGV4T2YoY29vcmRzWzBdKSxcbiAgICAgIHJvd0luZGV4ID0gJ251bWJlcicgPT09IHR5cGVvZiBjb29yZHNbMV0gPyBjb29yZHNbMV0gOiBzZWxlY3Quc2VsZWN0Q29sdW1uLmNhbGwodGhpcywgMCkuaW5kZXhPZihjb29yZHNbMV0pO1xuXG4gIHZhciBjb2xSZXN1bHQgPSBzZWxlY3Quc2VsZWN0Q29sdW1uLmNhbGwodGhpcywgY29vcmRzWzBdKSwgLy8gdGhpcy5kYXRhLm91dHB1dFswXVtjb29yZHNbMF1dLFxuICAgICAgcm93UmVzdWx0ID0gc2VsZWN0LnNlbGVjdFJvdy5jYWxsKHRoaXMsIGNvb3Jkc1sxXSk7XG5cbiAgLy8gQ29sdW1uIGRvZXNuJ3QgZXhpc3QuLi5cbiAgLy8gIExldCdzIGNyZWF0ZSBpdCBhbmQgcmVzZXQgY29sSW5kZXhcbiAgaWYgKGNvbFJlc3VsdC5sZW5ndGggPCAxKSB7XG4gICAgYXBwZW5kLmFwcGVuZENvbHVtbi5jYWxsKHRoaXMsIGNvb3Jkc1swXSk7XG4gICAgY29sSW5kZXggPSB0aGlzLmRhdGEub3V0cHV0WzBdLmxlbmd0aC0xO1xuICB9XG5cbiAgLy8gUm93IGRvZXNuJ3QgZXhpc3QuLi5cbiAgLy8gIExldCdzIGNyZWF0ZSBpdCBhbmQgcmVzZXQgcm93SW5kZXhcbiAgaWYgKHJvd1Jlc3VsdC5sZW5ndGggPCAxKSB7XG4gICAgYXBwZW5kLmFwcGVuZFJvdy5jYWxsKHRoaXMsIGNvb3Jkc1sxXSk7XG4gICAgcm93SW5kZXggPSB0aGlzLmRhdGEub3V0cHV0Lmxlbmd0aC0xO1xuICB9XG5cbiAgLy8gU2V0IHByb3ZpZGVkIHZhbHVlXG4gIHRoaXMuZGF0YS5vdXRwdXRbIHJvd0luZGV4IF1bIGNvbEluZGV4IF0gPSB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcInNvcnRDb2x1bW5zXCI6IHNvcnRDb2x1bW5zLFxuICBcInNvcnRSb3dzXCI6IHNvcnRSb3dzXG59O1xuXG5mdW5jdGlvbiBzb3J0Q29sdW1ucyhzdHIsIGNvbXApe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBoZWFkID0gdGhpcy5vdXRwdXQoKVswXS5zbGljZSgxKSwgLy8gbWludXMgaW5kZXhcbiAgICAgIGNvbHMgPSBbXSxcbiAgICAgIGNsb25lID0gW10sXG4gICAgICBmbiA9IGNvbXAgfHwgdGhpcy5nZXRDb2x1bW5MYWJlbDtcblxuICAvLyBJc29sYXRlIGVhY2ggY29sdW1uIChleGNlcHQgdGhlIGluZGV4KVxuICBlYWNoKGhlYWQsIGZ1bmN0aW9uKGNlbGwsIGkpe1xuICAgIGNvbHMucHVzaChzZWxmLnNlbGVjdENvbHVtbihpKzEpLnNsaWNlKDApKTtcbiAgfSk7XG4gIGNvbHMuc29ydChmdW5jdGlvbihhLGIpe1xuICAgIC8vIElmIGZuKGEpID4gZm4oYilcbiAgICB2YXIgb3AgPSBmbi5jYWxsKHNlbGYsIGEpID4gZm4uY2FsbChzZWxmLCBiKTtcbiAgICBpZiAob3ApIHtcbiAgICAgIHJldHVybiAoc3RyID09PSBcImFzY1wiID8gMSA6IC0xKTtcbiAgICB9IGVsc2UgaWYgKCFvcCkge1xuICAgICAgcmV0dXJuIChzdHIgPT09IFwiYXNjXCIgPyAtMSA6IDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH0pO1xuICBlYWNoKGNvbHMsIGZ1bmN0aW9uKGNvbCwgaSl7XG4gICAgc2VsZlxuICAgICAgLmRlbGV0ZUNvbHVtbihpKzEpXG4gICAgICAuaW5zZXJ0Q29sdW1uKGkrMSwgY29sWzBdLCBjb2wuc2xpY2UoMSkpO1xuICB9KTtcbiAgcmV0dXJuIHNlbGY7XG59XG5cbmZ1bmN0aW9uIHNvcnRSb3dzKHN0ciwgY29tcCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGhlYWQgPSB0aGlzLm91dHB1dCgpLnNsaWNlKDAsMSksXG4gICAgICBib2R5ID0gdGhpcy5vdXRwdXQoKS5zbGljZSgxKSxcbiAgICAgIGZuID0gY29tcCB8fCB0aGlzLmdldFJvd0luZGV4O1xuXG4gIGJvZHkuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAvLyBJZiBmbihhKSA+IGZuKGIpXG4gICAgdmFyIG9wID0gZm4uY2FsbChzZWxmLCBhKSA+IGZuLmNhbGwoc2VsZiwgYik7XG4gICAgaWYgKG9wKSB7XG4gICAgICByZXR1cm4gKHN0ciA9PT0gXCJhc2NcIiA/IDEgOiAtMSk7XG4gICAgfSBlbHNlIGlmICghb3ApIHtcbiAgICAgIHJldHVybiAoc3RyID09PSBcImFzY1wiID8gLTEgOiAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICB9KTtcbiAgc2VsZi5vdXRwdXQoaGVhZC5jb25jYXQoYm9keSkpO1xuICByZXR1cm4gc2VsZjtcbn1cbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcbnZhciBjcmVhdGVOdWxsTGlzdCA9IHJlcXVpcmUoJy4uL3V0aWxzL2NyZWF0ZS1udWxsLWxpc3QnKTtcbnZhciBhcHBlbmQgPSByZXF1aXJlKCcuL2FwcGVuZCcpO1xuXG52YXIgYXBwZW5kUm93ID0gYXBwZW5kLmFwcGVuZFJvdyxcbiAgICBhcHBlbmRDb2x1bW4gPSBhcHBlbmQuYXBwZW5kQ29sdW1uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJ1cGRhdGVDb2x1bW5cIjogdXBkYXRlQ29sdW1uLFxuICBcInVwZGF0ZVJvd1wiOiB1cGRhdGVSb3dcbn07XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvbHVtbihxLCBpbnB1dCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGluZGV4ID0gKHR5cGVvZiBxID09PSAnbnVtYmVyJykgPyBxIDogdGhpcy5kYXRhLm91dHB1dFswXS5pbmRleE9mKHEpO1xuXG4gIGlmIChpbmRleCA+IC0xKSB7XG5cbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSBcImZ1bmN0aW9uXCIpIHtcblxuICAgICAgZWFjaChzZWxmLm91dHB1dCgpLCBmdW5jdGlvbihyb3csIGkpe1xuICAgICAgICB2YXIgY2VsbDtcbiAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgY2VsbCA9IGlucHV0LmNhbGwoc2VsZiwgcm93W2luZGV4XSwgaSwgcm93KTtcbiAgICAgICAgICBpZiAodHlwZW9mIGNlbGwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaV1baW5kZXhdID0gY2VsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfSBlbHNlIGlmICghaW5wdXQgfHwgaW5wdXQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgaW5wdXQgPSBpbnB1dCB8fCBbXTtcblxuICAgICAgaWYgKGlucHV0Lmxlbmd0aCA8PSBzZWxmLm91dHB1dCgpLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgaW5wdXQgPSBpbnB1dC5jb25jYXQoIGNyZWF0ZU51bGxMaXN0KHNlbGYub3V0cHV0KCkubGVuZ3RoIC0gMSAtIGlucHV0Lmxlbmd0aCkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBJZiB0aGlzIG5ldyBjb2x1bW4gaXMgbG9uZ2VyIHRoYW4gZXhpc3RpbmcgY29sdW1ucyxcbiAgICAgICAgLy8gd2UgbmVlZCB0byB1cGRhdGUgdGhlIHJlc3QgdG8gbWF0Y2ggLi4uXG4gICAgICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlLCBpKXtcbiAgICAgICAgICBpZiAoc2VsZi5kYXRhLm91dHB1dC5sZW5ndGggLTEgPCBpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFwcGVuZFJvdy5jYWxsKHNlbGYsIFN0cmluZyggc2VsZi5kYXRhLm91dHB1dC5sZW5ndGggKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgICBzZWxmLmRhdGEub3V0cHV0W2krMV1baW5kZXhdID0gdmFsdWU7XG4gICAgICB9KTtcblxuICAgIH1cblxuICB9XG4gIHJldHVybiBzZWxmO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVSb3cocSwgaW5wdXQpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBpbmRleCA9ICh0eXBlb2YgcSA9PT0gJ251bWJlcicpID8gcSA6IHRoaXMuc2VsZWN0Q29sdW1uKDApLmluZGV4T2YocSk7XG5cbiAgaWYgKGluZGV4ID4gLTEpIHtcblxuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwiZnVuY3Rpb25cIikge1xuXG4gICAgICBlYWNoKHNlbGYub3V0cHV0KClbaW5kZXhdLCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICAgIHZhciBjb2wgPSBzZWxmLnNlbGVjdENvbHVtbihpKSxcbiAgICAgICAgY2VsbCA9IGlucHV0LmNhbGwoc2VsZiwgdmFsdWUsIGksIGNvbCk7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaW5kZXhdW2ldID0gY2VsbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9IGVsc2UgaWYgKCFpbnB1dCB8fCBpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBpbnB1dCA9IGlucHV0IHx8IFtdO1xuXG4gICAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoIC0gMSkge1xuICAgICAgICBpbnB1dCA9IGlucHV0LmNvbmNhdCggY3JlYXRlTnVsbExpc3QoIHNlbGYuZGF0YS5vdXRwdXRbMF0ubGVuZ3RoIC0gMSAtIGlucHV0Lmxlbmd0aCApICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUsIGkpe1xuICAgICAgICAgIGlmIChzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCAtMSA8IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgICAgYXBwZW5kQ29sdW1uLmNhbGwoc2VsZiwgU3RyaW5nKCBzZWxmLmRhdGEub3V0cHV0WzBdLmxlbmd0aCApKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSwgaSl7XG4gICAgICAgIHNlbGYuZGF0YS5vdXRwdXRbaW5kZXhdW2krMV0gPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICB9XG4gIHJldHVybiBzZWxmO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsZW4pe1xuICB2YXIgbGlzdCA9IG5ldyBBcnJheSgpO1xuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBsaXN0LnB1c2gobnVsbCk7XG4gIH1cbiAgcmV0dXJuIGxpc3Q7XG59O1xuIiwiLy8gUHVyZSBhd2Vzb21lbmVzcyBieSBXaWxsIFJheW5lciAocGVuZ3VpbmJveSlcbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3Blbmd1aW5ib3kvNzYyMTk3XG5tb2R1bGUuZXhwb3J0cyA9IGZsYXR0ZW47XG5mdW5jdGlvbiBmbGF0dGVuKG9iKSB7XG4gIHZhciB0b1JldHVybiA9IHt9O1xuICBmb3IgKHZhciBpIGluIG9iKSB7XG4gICAgaWYgKCFvYi5oYXNPd25Qcm9wZXJ0eShpKSkgY29udGludWU7XG4gICAgaWYgKCh0eXBlb2Ygb2JbaV0pID09ICdvYmplY3QnICYmIG9iW2ldICE9PSBudWxsKSB7XG4gICAgICB2YXIgZmxhdE9iamVjdCA9IGZsYXR0ZW4ob2JbaV0pO1xuICAgICAgZm9yICh2YXIgeCBpbiBmbGF0T2JqZWN0KSB7XG4gICAgICAgIGlmICghZmxhdE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh4KSkgY29udGludWU7XG4gICAgICAgIHRvUmV0dXJuW2kgKyAnLicgKyB4XSA9IGZsYXRPYmplY3RbeF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvUmV0dXJuW2ldID0gb2JbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiB0b1JldHVybjtcbn1cbiIsIi8vIOKZq+KZqeKZrCBIb2x5IERpdmVyISDimazimanimatcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgbG9vcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByb290ID0gYXJndW1lbnRzWzBdO1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgdGFyZ2V0ID0gYXJncy5wb3AoKTtcblxuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKHJvb3QgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBhcmdzID0gcm9vdDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJvb3QgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGFyZ3MucHVzaChyb290KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlYWNoKGFyZ3MsIGZ1bmN0aW9uKGVsKXtcblxuICAgICAgLy8gR3JhYiB0aGUgbnVtYmVycyBhbmQgbnVsbHNcbiAgICAgIGlmICh0YXJnZXQgPT0gXCJcIikge1xuICAgICAgICBpZiAodHlwZW9mIGVsID09IFwibnVtYmVyXCIgfHwgZWwgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQucHVzaChlbCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVsW3RhcmdldF0gfHwgZWxbdGFyZ2V0XSA9PT0gMCB8fCBlbFt0YXJnZXRdICE9PSB2b2lkIDApIHtcbiAgICAgICAgLy8gRWFzeSBncmFiIVxuICAgICAgICBpZiAoZWxbdGFyZ2V0XSA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQucHVzaChudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnB1c2goZWxbdGFyZ2V0XSk7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmIChyb290W2VsXSl7XG4gICAgICAgIGlmIChyb290W2VsXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgLy8gZGl2ZSB0aHJvdWdoIGVhY2ggYXJyYXkgaXRlbVxuXG4gICAgICAgICAgZWFjaChyb290W2VsXSwgZnVuY3Rpb24obiwgaSkge1xuICAgICAgICAgICAgdmFyIHNwbGludGVyID0gW3Jvb3RbZWxdXS5jb25jYXQocm9vdFtlbF1baV0pLmNvbmNhdChhcmdzLnNsaWNlKDEpKS5jb25jYXQodGFyZ2V0KTtcbiAgICAgICAgICAgIHJldHVybiBsb29wLmFwcGx5KHRoaXMsIHNwbGludGVyKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChyb290W2VsXVt0YXJnZXRdKSB7XG4gICAgICAgICAgICAvLyBncmFiIGl0IVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5wdXNoKHJvb3RbZWxdW3RhcmdldF0pO1xuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGRpdmUgZG93biBhIGxldmVsIVxuICAgICAgICAgICAgcmV0dXJuIGxvb3AuYXBwbHkodGhpcywgW3Jvb3RbZWxdXS5jb25jYXQoYXJncy5zcGxpY2UoMSkpLmNvbmNhdCh0YXJnZXQpKTtcblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiByb290ID09PSAnb2JqZWN0JyAmJiByb290IGluc3RhbmNlb2YgQXJyYXkgPT09IGZhbHNlICYmICFyb290W3RhcmdldF0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGFyZ2V0IHByb3BlcnR5IGRvZXMgbm90IGV4aXN0XCIsIHRhcmdldCk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRpdmUgZG93biBhIGxldmVsIVxuICAgICAgICByZXR1cm4gbG9vcC5hcHBseSh0aGlzLCBbZWxdLmNvbmNhdChhcmdzLnNwbGljZSgxKSkuY29uY2F0KHRhcmdldCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm47XG5cbiAgICB9KTtcbiAgICBpZiAocmVzdWx0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9O1xuICByZXR1cm4gbG9vcC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiLyohXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBDMy5qcyBBZGFwdGVyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxudmFyIERhdGF2aXogPSByZXF1aXJlKCcuLi9kYXRhdml6JyksXG4gICAgZWFjaCA9IHJlcXVpcmUoJy4uLy4uL2NvcmUvdXRpbHMvZWFjaCcpLFxuICAgIGV4dGVuZCA9IHJlcXVpcmUoJy4uLy4uL2NvcmUvdXRpbHMvZXh0ZW5kJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcblxuICAvLyBjaGFydE9wdGlvbnM6XG4gIC8vIC0tLS0tLS0tLS0tLS1cbiAgLy8gYXhpczoge31cbiAgLy8gY29sb3I6IHt9ICAgIDwtLSBiZSBhd2FyZTogd2Ugc2V0IHZhbHVlcyBoZXJlXG4gIC8vIGdyaWQ6IHt9XG4gIC8vIGxlZ2VuZDoge31cbiAgLy8gcG9pbnQ6IHt9XG4gIC8vIHJlZ2lvbnM6IHt9XG4gIC8vIHNpemU6IHt9ICAgICA8LS0gYmUgYXdhcmU6IHdlIHNldCB2YWx1ZXMgaGVyZVxuICAvLyB0b29sdGlwOiB7fVxuICAvLyB6b29tOiB7fVxuXG4gIC8vIGxpbmUsIHBpZSwgZG9udXQgZXRjLi4uXG5cbiAgdmFyIGRhdGFUeXBlcyA9IHtcbiAgICAvLyBkYXRhVHlwZSAgICAgICAgICAgIDogLy8gY2hhcnRUeXBlc1xuICAgICdzaW5ndWxhcicgICAgICAgICAgICAgOiBbJ2dhdWdlJ10sXG4gICAgJ2NhdGVnb3JpY2FsJyAgICAgICAgICA6IFsnZG9udXQnLCAncGllJ10sXG4gICAgJ2NhdC1pbnRlcnZhbCcgICAgICAgICA6IFsnYXJlYS1zdGVwJywgJ3N0ZXAnLCAnYmFyJywgJ2FyZWEnLCAnYXJlYS1zcGxpbmUnLCAnc3BsaW5lJywgJ2xpbmUnXSxcbiAgICAnY2F0LW9yZGluYWwnICAgICAgICAgIDogWydiYXInLCAnYXJlYScsICdhcmVhLXNwbGluZScsICdzcGxpbmUnLCAnbGluZScsICdzdGVwJywgJ2FyZWEtc3RlcCddLFxuICAgICdjaHJvbm9sb2dpY2FsJyAgICAgICAgOiBbJ2FyZWEnLCAnYXJlYS1zcGxpbmUnLCAnc3BsaW5lJywgJ2xpbmUnLCAnYmFyJywgJ3N0ZXAnLCAnYXJlYS1zdGVwJ10sXG4gICAgJ2NhdC1jaHJvbm9sb2dpY2FsJyAgICA6IFsnbGluZScsICdzcGxpbmUnLCAnYXJlYScsICdhcmVhLXNwbGluZScsICdiYXInLCAnc3RlcCcsICdhcmVhLXN0ZXAnXVxuICAgIC8vICdub21pbmFsJyAgICAgICAgICAgOiBbXSxcbiAgICAvLyAnZXh0cmFjdGlvbicgICAgICAgIDogW11cbiAgfTtcblxuICB2YXIgY2hhcnRzID0ge307XG4gIGVhY2goWydnYXVnZScsICdkb251dCcsICdwaWUnLCAnYmFyJywgJ2FyZWEnLCAnYXJlYS1zcGxpbmUnLCAnc3BsaW5lJywgJ2xpbmUnLCAnc3RlcCcsICdhcmVhLXN0ZXAnXSwgZnVuY3Rpb24odHlwZSwgaW5kZXgpe1xuICAgIGNoYXJ0c1t0eXBlXSA9IHtcbiAgICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHNldHVwID0gZ2V0U2V0dXBUZW1wbGF0ZS5jYWxsKHRoaXMsIHR5cGUpO1xuICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1snYzMnXSA9IGMzLmdlbmVyYXRlKHNldHVwKTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcywgY29scyA9IFtdO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ2dhdWdlJykge1xuICAgICAgICAgIHNlbGYudmlldy5fYXJ0aWZhY3RzWydjMyddLmxvYWQoe1xuICAgICAgICAgICAgY29sdW1uczogWyBbc2VsZi50aXRsZSgpLCBzZWxmLmRhdGEoKVsxXVsxXV0gXVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ3BpZScgfHwgdHlwZSA9PT0gJ2RvbnV0Jykge1xuICAgICAgICAgIHNlbGYudmlldy5fYXJ0aWZhY3RzWydjMyddLmxvYWQoe1xuICAgICAgICAgICAgY29sdW1uczogc2VsZi5kYXRhc2V0LmRhdGEub3V0cHV0LnNsaWNlKDEpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuZGF0YVR5cGUoKS5pbmRleE9mKCdjaHJvbicpID4gLTEpIHtcbiAgICAgICAgICAgIGNvbHMucHVzaChzZWxmLmRhdGFzZXQuc2VsZWN0Q29sdW1uKDApKTtcbiAgICAgICAgICAgIGNvbHNbMF1bMF0gPSAneCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZWFjaChzZWxmLmRhdGEoKVswXSwgZnVuY3Rpb24oYywgaSl7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgY29scy5wdXNoKHNlbGYuZGF0YXNldC5zZWxlY3RDb2x1bW4oaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKHNlbGYuc3RhY2tlZCgpKSB7XG4gICAgICAgICAgICBzZWxmLnZpZXcuX2FydGlmYWN0c1snYzMnXS5ncm91cHMoW3NlbGYubGFiZWxzKCldKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLnZpZXcuX2FydGlmYWN0c1snYzMnXS5sb2FkKHtcbiAgICAgICAgICAgIGNvbHVtbnM6IGNvbHNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCl7XG4gICAgICAgIF9zZWxmRGVzdHJ1Y3QuY2FsbCh0aGlzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcblxuICBmdW5jdGlvbiBnZXRTZXR1cFRlbXBsYXRlKHR5cGUpe1xuICAgIHZhciBzZXR1cCA9IHtcbiAgICAgIGF4aXM6IHt9LFxuICAgICAgYmluZHRvOiB0aGlzLmVsKCksXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGNvbHVtbnM6IFtdXG4gICAgICB9LFxuICAgICAgY29sb3I6IHtcbiAgICAgICAgcGF0dGVybjogdGhpcy5jb2xvcnMoKVxuICAgICAgfSxcbiAgICAgIHNpemU6IHtcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCgpLFxuICAgICAgICB3aWR0aDogdGhpcy53aWR0aCgpXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEVuZm9yY2UgdHlwZSwgc29ycnkgbm8gb3ZlcnJpZGVzIGhlcmVcbiAgICBzZXR1cFsnZGF0YSddWyd0eXBlJ10gPSB0eXBlO1xuXG4gICAgaWYgKHR5cGUgPT09ICdnYXVnZScpIHt9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ3BpZScgfHwgdHlwZSA9PT0gJ2RvbnV0Jykge1xuICAgICAgc2V0dXBbdHlwZV0gPSB7IHRpdGxlOiB0aGlzLnRpdGxlKCkgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZiAodGhpcy5kYXRhVHlwZSgpLmluZGV4T2YoJ2Nocm9uJykgPiAtMSkge1xuICAgICAgICBzZXR1cFsnZGF0YSddWyd4J10gPSAneCc7XG4gICAgICAgIHNldHVwWydheGlzJ11bJ3gnXSA9IHtcbiAgICAgICAgICB0eXBlOiAndGltZXNlcmllcycsXG4gICAgICAgICAgdGljazoge1xuICAgICAgICAgICAgZm9ybWF0OiAnJVktJW0tJWQnXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFUeXBlKCkgPT09ICdjYXQtb3JkaW5hbCcpIHtcbiAgICAgICAgICBzZXR1cFsnYXhpcyddWyd4J10gPSB7XG4gICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcnknLFxuICAgICAgICAgICAgY2F0ZWdvcmllczogdGhpcy5sYWJlbHMoKVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnRpdGxlKCkpIHtcbiAgICAgICAgc2V0dXBbJ2F4aXMnXVsneSddID0geyBsYWJlbDogdGhpcy50aXRsZSgpIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZChzZXR1cCwgdGhpcy5jaGFydE9wdGlvbnMoKSk7XG4gIH1cblxuICBmdW5jdGlvbiBfc2VsZkRlc3RydWN0KCl7XG4gICAgaWYgKHRoaXMudmlldy5fYXJ0aWZhY3RzWydjMyddKSB7XG4gICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1snYzMnXS5kZXN0cm95KCk7XG4gICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1snYzMnXSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVnaXN0ZXIgbGlicmFyeSArIGFkZCBkZXBlbmRlbmNpZXMgKyB0eXBlc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIERhdGF2aXoucmVnaXN0ZXIoJ2MzJywgY2hhcnRzLCB7IGNhcGFiaWxpdGllczogZGF0YVR5cGVzIH0pO1xuXG59O1xuIiwiLyohXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBDaGFydC5qcyBBZGFwdGVyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxudmFyIERhdGF2aXogPSByZXF1aXJlKFwiLi4vZGF0YXZpelwiKSxcbiAgICBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9leHRlbmRcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcblxuICBpZiAodHlwZW9mIENoYXJ0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsLnJlc3BvbnNpdmUgPSB0cnVlO1xuICB9XG5cbiAgdmFyIGRhdGFUeXBlcyA9IHtcbiAgICAvLyBkYXRhVHlwZSAgICAgICAgICAgIDogLy8gY2hhcnRUeXBlc1xuICAgIC8vXCJzaW5ndWxhclwiICAgICAgICAgICAgIDogW10sXG4gICAgXCJjYXRlZ29yaWNhbFwiICAgICAgICAgIDogW1wiZG91Z2hudXRcIiwgXCJwaWVcIiwgXCJwb2xhci1hcmVhXCIsIFwicmFkYXJcIl0sXG4gICAgXCJjYXQtaW50ZXJ2YWxcIiAgICAgICAgIDogW1wiYmFyXCIsIFwibGluZVwiXSxcbiAgICBcImNhdC1vcmRpbmFsXCIgICAgICAgICAgOiBbXCJiYXJcIiwgXCJsaW5lXCJdLFxuICAgIFwiY2hyb25vbG9naWNhbFwiICAgICAgICA6IFtcImxpbmVcIiwgXCJiYXJcIl0sXG4gICAgXCJjYXQtY2hyb25vbG9naWNhbFwiICAgIDogW1wibGluZVwiLCBcImJhclwiXVxuICAgIC8vIFwibm9taW5hbFwiICAgICAgICAgICA6IFtdLFxuICAgIC8vIFwiZXh0cmFjdGlvblwiICAgICAgICA6IFtdXG4gIH07XG5cbiAgdmFyIENoYXJ0TmFtZU1hcCA9IHtcbiAgICBcInJhZGFyXCI6IFwiUmFkYXJcIixcbiAgICBcInBvbGFyLWFyZWFcIjogXCJQb2xhckFyZWFcIixcbiAgICBcInBpZVwiOiBcIlBpZVwiLFxuICAgIFwiZG91Z2hudXRcIjogXCJEb3VnaG51dFwiLFxuICAgIFwibGluZVwiOiBcIkxpbmVcIixcbiAgICBcImJhclwiOiBcIkJhclwiXG4gIH07XG4gIHZhciBkYXRhVHJhbnNmb3JtZXJzID0ge1xuICAgICdkb3VnaG51dCc6IGdldENhdGVnb3JpY2FsRGF0YSxcbiAgICAncGllJzogZ2V0Q2F0ZWdvcmljYWxEYXRhLFxuICAgICdwb2xhci1hcmVhJzogZ2V0Q2F0ZWdvcmljYWxEYXRhLFxuICAgICdyYWRhcic6IGdldFNlcmllc0RhdGEsXG4gICAgJ2xpbmUnOiBnZXRTZXJpZXNEYXRhLFxuICAgICdiYXInOiBnZXRTZXJpZXNEYXRhXG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0Q2F0ZWdvcmljYWxEYXRhKCl7XG4gICAgdmFyIHNlbGYgPSB0aGlzLCByZXN1bHQgPSBbXTtcbiAgICBlYWNoKHNlbGYuZGF0YXNldC5zZWxlY3RDb2x1bW4oMCkuc2xpY2UoMSksIGZ1bmN0aW9uKGxhYmVsLCBpKXtcbiAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgdmFsdWU6IHNlbGYuZGF0YXNldC5zZWxlY3RDb2x1bW4oMSkuc2xpY2UoMSlbaV0sXG4gICAgICAgIGNvbG9yOiBzZWxmLmNvbG9ycygpWytpXSxcbiAgICAgICAgaGlnaHRsaWdodDogc2VsZi5jb2xvcnMoKVsraSs5XSxcbiAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2VyaWVzRGF0YSgpe1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbGFiZWxzLFxuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgbGFiZWxzOiBbXSxcbiAgICAgICAgICBkYXRhc2V0czogW11cbiAgICAgICAgfTtcblxuICAgIGxhYmVscyA9IHRoaXMuZGF0YXNldC5zZWxlY3RDb2x1bW4oMCkuc2xpY2UoMSk7XG4gICAgZWFjaChsYWJlbHMsIGZ1bmN0aW9uKGwsaSl7XG4gICAgICBpZiAobCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgcmVzdWx0LmxhYmVscy5wdXNoKChsLmdldE1vbnRoKCkrMSkgKyBcIi1cIiArIGwuZ2V0RGF0ZSgpICsgXCItXCIgKyBsLmdldEZ1bGxZZWFyKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LmxhYmVscy5wdXNoKGwpO1xuICAgICAgfVxuICAgIH0pXG5cbiAgICBlYWNoKHNlbGYuZGF0YXNldC5zZWxlY3RSb3coMCkuc2xpY2UoMSksIGZ1bmN0aW9uKGxhYmVsLCBpKXtcbiAgICAgIHZhciBoZXggPSB7XG4gICAgICAgIHI6IGhleFRvUihzZWxmLmNvbG9ycygpW2ldKSxcbiAgICAgICAgZzogaGV4VG9HKHNlbGYuY29sb3JzKClbaV0pLFxuICAgICAgICBiOiBoZXhUb0Ioc2VsZi5jb2xvcnMoKVtpXSlcbiAgICAgIH07XG4gICAgICByZXN1bHQuZGF0YXNldHMucHVzaCh7XG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgZmlsbENvbG9yICAgIDogXCJyZ2JhKFwiICsgaGV4LnIgKyBcIixcIiArIGhleC5nICsgXCIsXCIgKyBoZXguYiArIFwiLDAuMilcIixcbiAgICAgICAgc3Ryb2tlQ29sb3IgIDogXCJyZ2JhKFwiICsgaGV4LnIgKyBcIixcIiArIGhleC5nICsgXCIsXCIgKyBoZXguYiArIFwiLDEpXCIsXG4gICAgICAgIHBvaW50Q29sb3IgICA6IFwicmdiYShcIiArIGhleC5yICsgXCIsXCIgKyBoZXguZyArIFwiLFwiICsgaGV4LmIgKyBcIiwxKVwiLFxuICAgICAgICBwb2ludFN0cm9rZUNvbG9yOiBcIiNmZmZcIixcbiAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiBcIiNmZmZcIixcbiAgICAgICAgcG9pbnRIaWdobGlnaHRTdHJva2U6IFwicmdiYShcIiArIGhleC5yICsgXCIsXCIgKyBoZXguZyArIFwiLFwiICsgaGV4LmIgKyBcIiwxKVwiLFxuICAgICAgICBkYXRhOiBzZWxmLmRhdGFzZXQuc2VsZWN0Q29sdW1uKCtpKzEpLnNsaWNlKDEpXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmFyIGNoYXJ0cyA9IHt9O1xuICBlYWNoKFtcImRvdWdobnV0XCIsIFwicGllXCIsIFwicG9sYXItYXJlYVwiLCBcInJhZGFyXCIsIFwiYmFyXCIsIFwibGluZVwiXSwgZnVuY3Rpb24odHlwZSwgaW5kZXgpe1xuICAgIGNoYXJ0c1t0eXBlXSA9IHtcbiAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICh0aGlzLmVsKCkubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPT0gXCJjYW52YXNcIikge1xuICAgICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICB0aGlzLmVsKCkuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICB0aGlzLmVsKCkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1tcImN0eFwiXSA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjdHhcIl0gPSB0aGlzLmVsKCkuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0KCkpIHtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1tcImN0eFwiXS5jYW52YXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQoKTtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1tcImN0eFwiXS5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gU3RyaW5nKHRoaXMuaGVpZ2h0KCkgKyBcInB4XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMud2lkdGgoKSkge1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY3R4XCJdLmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGgoKTtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1tcImN0eFwiXS5jYW52YXMuc3R5bGUud2lkdGggPSBTdHJpbmcodGhpcy53aWR0aCgpICsgXCJweFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIG1ldGhvZCA9IENoYXJ0TmFtZU1hcFt0eXBlXSxcbiAgICAgICAgICAgIG9wdHMgPSBleHRlbmQoe30sIHRoaXMuY2hhcnRPcHRpb25zKCkpLFxuICAgICAgICAgICAgZGF0YSA9IGRhdGFUcmFuc2Zvcm1lcnNbdHlwZV0uY2FsbCh0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjaGFydGpzXCJdKSB7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjaGFydGpzXCJdLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1tcImNoYXJ0anNcIl0gPSBuZXcgQ2hhcnQodGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjdHhcIl0pW21ldGhvZF0oZGF0YSwgb3B0cyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCl7XG4gICAgICAgIF9zZWxmRGVzdHJ1Y3QuY2FsbCh0aGlzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcblxuICBmdW5jdGlvbiBfc2VsZkRlc3RydWN0KCl7XG4gICAgaWYgKHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY2hhcnRqc1wiXSkge1xuICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbXCJjaGFydGpzXCJdLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzW1wiY2hhcnRqc1wiXSA9IG51bGw7XG4gICAgfVxuICB9XG5cblxuICAvLyBCYXNlZCBvbiB0aGlzIGF3ZXNvbWUgbGl0dGxlIGRlbW86XG4gIC8vIGh0dHA6Ly93d3cuamF2YXNjcmlwdGVyLm5ldC9mYXEvaGV4dG9yZ2IuaHRtXG4gIGZ1bmN0aW9uIGhleFRvUihoKSB7cmV0dXJuIHBhcnNlSW50KChjdXRIZXgoaCkpLnN1YnN0cmluZygwLDIpLDE2KX1cbiAgZnVuY3Rpb24gaGV4VG9HKGgpIHtyZXR1cm4gcGFyc2VJbnQoKGN1dEhleChoKSkuc3Vic3RyaW5nKDIsNCksMTYpfVxuICBmdW5jdGlvbiBoZXhUb0IoaCkge3JldHVybiBwYXJzZUludCgoY3V0SGV4KGgpKS5zdWJzdHJpbmcoNCw2KSwxNil9XG4gIGZ1bmN0aW9uIGN1dEhleChoKSB7cmV0dXJuIChoLmNoYXJBdCgwKT09XCIjXCIpID8gaC5zdWJzdHJpbmcoMSw3KTpofVxuXG4gIC8vIFJlZ2lzdGVyIGxpYnJhcnkgKyBhZGQgZGVwZW5kZW5jaWVzICsgdHlwZXNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBEYXRhdml6LnJlZ2lzdGVyKFwiY2hhcnRqc1wiLCBjaGFydHMsIHsgY2FwYWJpbGl0aWVzOiBkYXRhVHlwZXMgfSk7XG5cbn07XG4iLCIvKiFcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEdvb2dsZSBDaGFydHMgQWRhcHRlclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbi8qXG5cbiAgVE9ETzpcblxuICBbIF0gQnVpbGQgYSBtb3JlIHJvYnVzdCBEYXRhVGFibGUgdHJhbnNmb3JtZXJcbiAgWyBdIF5FeHBvc2UgZGF0ZSBwYXJzZXIgZm9yIGdvb2dsZSBjaGFydHMgdG9vbHRpcHMgKCM3MClcbiAgWyBdIF5BbGxvdyBjdXN0b20gdG9vbHRpcHMgKCMxNDcpXG5cbiovXG5cbnZhciBEYXRhdml6ID0gcmVxdWlyZShcIi4uL2RhdGF2aXpcIiksXG4gICAgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIiksXG4gICAgZXh0ZW5kID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZXh0ZW5kXCIpLFxuICAgIEtlZW4gPSByZXF1aXJlKFwiLi4vLi4vY29yZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG4gIEtlZW4ubG9hZGVkID0gZmFsc2U7XG5cbiAgdmFyIGVycm9yTWFwcGluZyA9IHtcbiAgICBcIkRhdGEgY29sdW1uKHMpIGZvciBheGlzICMwIGNhbm5vdCBiZSBvZiB0eXBlIHN0cmluZ1wiOiBcIk5vIHJlc3VsdHMgdG8gdmlzdWFsaXplXCJcbiAgfTtcblxuICB2YXIgY2hhcnRUeXBlcyA9IFsnQXJlYUNoYXJ0JywgJ0JhckNoYXJ0JywgJ0NvbHVtbkNoYXJ0JywgJ0xpbmVDaGFydCcsICdQaWVDaGFydCcsICdUYWJsZSddO1xuICB2YXIgY2hhcnRNYXAgPSB7fTtcblxuICB2YXIgZGF0YVR5cGVzID0ge1xuICAgIC8vIGRhdGFUeXBlICAgICAgICAgICAvLyBjaGFydFR5cGVzIChuYW1lc3BhY2UpXG4gICAgLy8gJ3Npbmd1bGFyJzogICAgICAgIG51bGwsXG4gICAgJ2NhdGVnb3JpY2FsJzogICAgICAgIFsncGllY2hhcnQnLCAnYmFyY2hhcnQnLCAnY29sdW1uY2hhcnQnLCAndGFibGUnXSxcbiAgICAnY2F0LWludGVydmFsJzogICAgICAgWydjb2x1bW5jaGFydCcsICdiYXJjaGFydCcsICd0YWJsZSddLFxuICAgICdjYXQtb3JkaW5hbCc6ICAgICAgICBbJ2JhcmNoYXJ0JywgJ2NvbHVtbmNoYXJ0JywgJ2FyZWFjaGFydCcsICdsaW5lY2hhcnQnLCAndGFibGUnXSxcbiAgICAnY2hyb25vbG9naWNhbCc6ICAgICAgWydhcmVhY2hhcnQnLCAnbGluZWNoYXJ0JywgJ3RhYmxlJ10sXG4gICAgJ2NhdC1jaHJvbm9sb2dpY2FsJzogIFsnbGluZWNoYXJ0JywgJ2NvbHVtbmNoYXJ0JywgJ2JhcmNoYXJ0JywgJ2FyZWFjaGFydCddLFxuICAgICdub21pbmFsJzogICAgICAgICAgICBbJ3RhYmxlJ10sXG4gICAgJ2V4dHJhY3Rpb24nOiAgICAgICAgIFsndGFibGUnXVxuICB9O1xuXG4gIC8vIENyZWF0ZSBjaGFydCB0eXBlc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGVhY2goY2hhcnRUeXBlcywgZnVuY3Rpb24gKHR5cGUpIHtcbiAgICB2YXIgbmFtZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICBjaGFydE1hcFtuYW1lXSA9IHtcbiAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vIE5vdGhpbmcgdG8gZG8gaGVyZVxuICAgICAgfSxcbiAgICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgaWYodHlwZW9mIGdvb2dsZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIHRoaXMuZXJyb3IoXCJUaGUgR29vZ2xlIENoYXJ0cyBsaWJyYXJ5IGNvdWxkIG5vdCBiZSBsb2FkZWQuXCIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLnZpZXcuX2FydGlmYWN0c1snZ29vZ2xlY2hhcnQnXSkge1xuICAgICAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYudmlldy5fYXJ0aWZhY3RzWydnb29nbGVjaGFydCddID0gc2VsZi52aWV3Ll9hcnRpZmFjdHNbJ2dvb2dsZWNoYXJ0J10gfHwgbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uW3R5cGVdKHNlbGYuZWwoKSk7XG4gICAgICAgIGdvb2dsZS52aXN1YWxpemF0aW9uLmV2ZW50cy5hZGRMaXN0ZW5lcihzZWxmLnZpZXcuX2FydGlmYWN0c1snZ29vZ2xlY2hhcnQnXSwgJ2Vycm9yJywgZnVuY3Rpb24oc3RhY2spe1xuICAgICAgICAgIF9oYW5kbGVFcnJvcnMuY2FsbChzZWxmLCBzdGFjayk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBfZ2V0RGVmYXVsdEF0dHJpYnV0ZXMuY2FsbCh0aGlzLCB0eXBlKTtcbiAgICAgICAgZXh0ZW5kKG9wdGlvbnMsIHRoaXMuY2hhcnRPcHRpb25zKCksIHRoaXMuYXR0cmlidXRlcygpKTtcblxuICAgICAgICAvLyBBcHBseSBzdGFja2luZyBpZiBzZXQgYnkgdG9wLWxldmVsIG9wdGlvblxuICAgICAgICBvcHRpb25zWydpc1N0YWNrZWQnXSA9ICh0aGlzLnN0YWNrZWQoKSB8fCBvcHRpb25zWydpc1N0YWNrZWQnXSk7XG5cbiAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2RhdGF0YWJsZSddID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZSh0aGlzLmRhdGEoKSk7XG4gICAgICAgIC8vIGlmICh0aGlzLnZpZXcuX2FydGlmYWN0c1snZGF0YXRhYmxlJ10pIHt9XG4gICAgICAgIGlmICh0aGlzLnZpZXcuX2FydGlmYWN0c1snZ29vZ2xlY2hhcnQnXSkge1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzWydnb29nbGVjaGFydCddLmRyYXcodGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2RhdGF0YWJsZSddLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICh0aGlzLnZpZXcuX2FydGlmYWN0c1snZ29vZ2xlY2hhcnQnXSkge1xuICAgICAgICAgIGdvb2dsZS52aXN1YWxpemF0aW9uLmV2ZW50cy5yZW1vdmVBbGxMaXN0ZW5lcnModGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2dvb2dsZWNoYXJ0J10pO1xuICAgICAgICAgIHRoaXMudmlldy5fYXJ0aWZhY3RzWydnb29nbGVjaGFydCddLmNsZWFyQ2hhcnQoKTtcbiAgICAgICAgICB0aGlzLnZpZXcuX2FydGlmYWN0c1snZ29vZ2xlY2hhcnQnXSA9IG51bGw7XG4gICAgICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHNbJ2RhdGF0YWJsZSddID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG5cbiAgLy8gUmVnaXN0ZXIgbGlicmFyeSArIHR5cGVzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBEYXRhdml6LnJlZ2lzdGVyKCdnb29nbGUnLCBjaGFydE1hcCwge1xuICAgIGNhcGFiaWxpdGllczogZGF0YVR5cGVzLFxuICAgIGRlcGVuZGVuY2llczogW3tcbiAgICAgIHR5cGU6ICdzY3JpcHQnLFxuICAgICAgdXJsOiAnaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9qc2FwaScsXG4gICAgICBjYjogZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBpZiAodHlwZW9mIGdvb2dsZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIHRoaXMudHJpZ2dlcihcImVycm9yXCIsIFwiUHJvYmxlbSBsb2FkaW5nIEdvb2dsZSBDaGFydHMgbGlicmFyeS4gUGxlYXNlIGNvbnRhY3QgdXMhXCIpO1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjEnLCB7XG4gICAgICAgICAgICAgIHBhY2thZ2VzOiBbJ2NvcmVjaGFydCcsICd0YWJsZSddLFxuICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1dXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIF9oYW5kbGVFcnJvcnMoc3RhY2spe1xuICAgIHZhciBtZXNzYWdlID0gZXJyb3JNYXBwaW5nW3N0YWNrWydtZXNzYWdlJ11dIHx8IHN0YWNrWydtZXNzYWdlJ10gfHwgJ0FuIGVycm9yIG9jY3VycmVkJztcbiAgICB0aGlzLmVycm9yKG1lc3NhZ2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gX2dldERlZmF1bHRBdHRyaWJ1dGVzKHR5cGUpe1xuICAgIHZhciBvdXRwdXQgPSB7fTtcbiAgICBzd2l0Y2ggKHR5cGUudG9Mb3dlckNhc2UoKSkge1xuXG4gICAgICBjYXNlIFwiYXJlYWNoYXJ0XCI6XG4gICAgICAgIG91dHB1dC5saW5lV2lkdGggPSAyO1xuICAgICAgICBvdXRwdXQuaEF4aXMgPSB7XG4gICAgICAgICAgYmFzZWxpbmVDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICBncmlkbGluZXM6IHsgY29sb3I6ICd0cmFuc3BhcmVudCcgfVxuICAgICAgICB9O1xuICAgICAgICBvdXRwdXQudkF4aXMgPSB7XG4gICAgICAgICAgdmlld1dpbmRvdzogeyBtaW46IDAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5kYXRhVHlwZSgpID09PSBcImNocm9ub2xvZ2ljYWxcIiB8fCB0aGlzLmRhdGFUeXBlKCkgPT09IFwiY2F0LW9yZGluYWxcIikge1xuICAgICAgICAgIG91dHB1dC5sZWdlbmQgPSBcIm5vbmVcIjtcbiAgICAgICAgICBvdXRwdXQuY2hhcnRBcmVhID0ge1xuICAgICAgICAgICAgd2lkdGg6IFwiODUlXCJcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiYmFyY2hhcnRcIjpcbiAgICAgICAgb3V0cHV0LmhBeGlzID0ge1xuICAgICAgICAgIHZpZXdXaW5kb3c6IHsgbWluOiAwIH1cbiAgICAgICAgfTtcbiAgICAgICAgb3V0cHV0LnZBeGlzID0ge1xuICAgICAgICAgIGJhc2VsaW5lQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgZ3JpZGxpbmVzOiB7IGNvbG9yOiAndHJhbnNwYXJlbnQnIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuZGF0YVR5cGUoKSA9PT0gXCJjaHJvbm9sb2dpY2FsXCIgfHwgdGhpcy5kYXRhVHlwZSgpID09PSBcImNhdC1vcmRpbmFsXCIpIHtcbiAgICAgICAgICBvdXRwdXQubGVnZW5kID0gXCJub25lXCI7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJjb2x1bW5jaGFydFwiOlxuICAgICAgICBvdXRwdXQuaEF4aXMgPSB7XG4gICAgICAgICAgYmFzZWxpbmVDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICBncmlkbGluZXM6IHsgY29sb3I6ICd0cmFuc3BhcmVudCcgfVxuICAgICAgICB9O1xuICAgICAgICBvdXRwdXQudkF4aXMgPSB7XG4gICAgICAgICAgdmlld1dpbmRvdzogeyBtaW46IDAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5kYXRhVHlwZSgpID09PSBcImNocm9ub2xvZ2ljYWxcIiB8fCB0aGlzLmRhdGFUeXBlKCkgPT09IFwiY2F0LW9yZGluYWxcIikge1xuICAgICAgICAgIG91dHB1dC5sZWdlbmQgPSBcIm5vbmVcIjtcbiAgICAgICAgICBvdXRwdXQuY2hhcnRBcmVhID0ge1xuICAgICAgICAgICAgd2lkdGg6IFwiODUlXCJcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwibGluZWNoYXJ0XCI6XG4gICAgICAgIG91dHB1dC5saW5lV2lkdGggPSAyO1xuICAgICAgICBvdXRwdXQuaEF4aXMgPSB7XG4gICAgICAgICAgYmFzZWxpbmVDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICBncmlkbGluZXM6IHsgY29sb3I6ICd0cmFuc3BhcmVudCcgfVxuICAgICAgICB9O1xuICAgICAgICBvdXRwdXQudkF4aXMgPSB7XG4gICAgICAgICAgdmlld1dpbmRvdzogeyBtaW46IDAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5kYXRhVHlwZSgpID09PSBcImNocm9ub2xvZ2ljYWxcIiB8fCB0aGlzLmRhdGFUeXBlKCkgPT09IFwiY2F0LW9yZGluYWxcIikge1xuICAgICAgICAgIG91dHB1dC5sZWdlbmQgPSBcIm5vbmVcIjtcbiAgICAgICAgICBvdXRwdXQuY2hhcnRBcmVhID0ge1xuICAgICAgICAgICAgd2lkdGg6IFwiODUlXCJcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwicGllY2hhcnRcIjpcbiAgICAgICAgb3V0cHV0LnNsaWNlVmlzaWJpbGl0eVRocmVzaG9sZCA9IDAuMDE7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwidGFibGVcIjpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxufTtcbiIsIi8qIVxuKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIEtlZW4gSU8gQWRhcHRlclxuKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qL1xuXG52YXIgS2VlbiA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlXCIpLFxuICAgIERhdGF2aXogPSByZXF1aXJlKFwiLi4vZGF0YXZpelwiKTtcblxudmFyIGNsb25lID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvY2xvbmVcIiksXG4gICAgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIiksXG4gICAgZXh0ZW5kID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZXh0ZW5kXCIpLFxuICAgIHByZXR0eU51bWJlciA9IHJlcXVpcmUoXCIuLi91dGlscy9wcmV0dHlOdW1iZXJcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgLy8gKGZ1bmN0aW9uKGxpYil7XG4gIC8vIHZhciBLZWVuID0gbGliIHx8IHt9LFxuICB2YXIgTWV0cmljLCBFcnJvciwgU3Bpbm5lcjtcblxuICBLZWVuLkVycm9yID0ge1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3IgOiBcIlwiLFxuICAgICAgYm9yZGVyUmFkaXVzICAgIDogXCI0cHhcIixcbiAgICAgIGNvbG9yICAgICAgICAgICA6IFwiI2NjY1wiLFxuICAgICAgZGlzcGxheSAgICAgICAgIDogXCJibG9ja1wiLFxuICAgICAgZm9udEZhbWlseSAgICAgIDogXCJIZWx2ZXRpY2EgTmV1ZSwgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZlwiLFxuICAgICAgZm9udFNpemUgICAgICAgIDogXCIyMXB4XCIsXG4gICAgICBmb250V2VpZ2h0ICAgICAgOiBcImxpZ2h0XCIsXG4gICAgICB0ZXh0QWxpZ24gICAgICAgOiBcImNlbnRlclwiXG4gICAgfVxuICB9O1xuXG4gIEtlZW4uU3Bpbm5lci5kZWZhdWx0cyA9IHtcbiAgICBoZWlnaHQ6IDEzOCwgICAgICAgICAgICAgICAgICAvLyBVc2VkIGlmIG5vIGhlaWdodCBpcyBwcm92aWRlZFxuICAgIGxpbmVzOiAxMCwgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xuICAgIGxlbmd0aDogOCwgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgd2lkdGg6IDMsICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgcmFkaXVzOiAxMCwgICAgICAgICAgICAgICAgICAgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgY29ybmVyczogMSwgICAgICAgICAgICAgICAgICAgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcbiAgICByb3RhdGU6IDAsICAgICAgICAgICAgICAgICAgICAvLyBUaGUgcm90YXRpb24gb2Zmc2V0XG4gICAgZGlyZWN0aW9uOiAxLCAgICAgICAgICAgICAgICAgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAgIGNvbG9yOiAnIzRkNGQ0ZCcsICAgICAgICAgICAgIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcbiAgICBzcGVlZDogMS42NywgICAgICAgICAgICAgICAgICAvLyBSb3VuZHMgcGVyIHNlY29uZFxuICAgIHRyYWlsOiA2MCwgICAgICAgICAgICAgICAgICAgIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXG4gICAgc2hhZG93OiBmYWxzZSwgICAgICAgICAgICAgICAgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcbiAgICBod2FjY2VsOiBmYWxzZSwgICAgICAgICAgICAgICAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb25cbiAgICBjbGFzc05hbWU6ICdrZWVuLXNwaW5uZXInLCAgICAvLyBUaGUgQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgc3Bpbm5lclxuICAgIHpJbmRleDogMmU5LCAgICAgICAgICAgICAgICAgIC8vIFRoZSB6LWluZGV4IChkZWZhdWx0cyB0byAyMDAwMDAwMDAwKVxuICAgIHRvcDogJzUwJScsICAgICAgICAgICAgICAgICAgIC8vIFRvcCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcbiAgICBsZWZ0OiAnNTAlJyAgICAgICAgICAgICAgICAgICAvLyBMZWZ0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxuICB9O1xuXG4gIHZhciBkYXRhVHlwZXMgPSB7XG4gICAgJ3Npbmd1bGFyJzogWydtZXRyaWMnXVxuICB9O1xuXG4gIE1ldHJpYyA9IHtcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGNzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKSxcbiAgICAgICAgICBiZ0RlZmF1bHQgPSBcIiM0OWM1YjFcIjtcblxuICAgICAgY3NzLmlkID0gXCJrZWVuLXdpZGdldHNcIjtcbiAgICAgIGNzcy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuICAgICAgY3NzLmlubmVySFRNTCA9IFwiXFxcbiAgLmtlZW4tbWV0cmljIHsgXFxuICBiYWNrZ3JvdW5kOiBcIiArIGJnRGVmYXVsdCArIFwiOyBcXG4gIGJvcmRlci1yYWRpdXM6IDRweDsgXFxuICBjb2xvcjogI2ZmZjsgXFxuICBmb250LWZhbWlseTogJ0hlbHZldGljYSBOZXVlJywgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjsgXFxuICBwYWRkaW5nOiAxMHB4IDA7IFxcbiAgdGV4dC1hbGlnbjogY2VudGVyOyBcXG59IFxcXG4gIC5rZWVuLW1ldHJpYy12YWx1ZSB7IFxcbiAgZGlzcGxheTogYmxvY2s7IFxcbiAgZm9udC1zaXplOiA4NHB4OyBcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7IFxcbiAgbGluZS1oZWlnaHQ6IDg0cHg7IFxcbn0gXFxcbiAgLmtlZW4tbWV0cmljLXRpdGxlIHsgXFxuICBkaXNwbGF5OiBibG9jazsgXFxuICBmb250LXNpemU6IDI0cHg7IFxcbiAgZm9udC13ZWlnaHQ6IDIwMDsgXFxufVwiO1xuICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjc3MuaWQpKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY3NzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGJnQ29sb3IgPSAodGhpcy5jb2xvcnMoKS5sZW5ndGggPT0gMSkgPyB0aGlzLmNvbG9ycygpWzBdIDogXCIjNDljNWIxXCIsXG4gICAgICAgICAgdGl0bGUgPSB0aGlzLnRpdGxlKCkgfHwgXCJSZXN1bHRcIixcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMuZGF0YSgpWzFdWzFdIHx8IDAsXG4gICAgICAgICAgd2lkdGggPSB0aGlzLndpZHRoKCksXG4gICAgICAgICAgb3B0cyA9IHRoaXMuY2hhcnRPcHRpb25zKCkgfHwge30sXG4gICAgICAgICAgcHJlZml4ID0gXCJcIixcbiAgICAgICAgICBzdWZmaXggPSBcIlwiO1xuXG4gICAgICB2YXIgc3R5bGVzID0ge1xuICAgICAgICAnd2lkdGgnOiAod2lkdGgpID8gd2lkdGggKyAncHgnIDogJ2F1dG8nXG4gICAgICB9O1xuXG4gICAgICB2YXIgZm9ybWF0dGVkTnVtID0gdmFsdWU7XG4gICAgICBpZiAoIHR5cGVvZiBvcHRzLnByZXR0eU51bWJlciA9PT0gJ3VuZGVmaW5lZCcgfHwgb3B0cy5wcmV0dHlOdW1iZXIgPT0gdHJ1ZSApIHtcbiAgICAgICAgaWYgKCAhaXNOYU4ocGFyc2VJbnQodmFsdWUpKSApIHtcbiAgICAgICAgICBmb3JtYXR0ZWROdW0gPSBwcmV0dHlOdW1iZXIodmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzWydwcmVmaXgnXSkge1xuICAgICAgICBwcmVmaXggPSAnPHNwYW4gY2xhc3M9XCJrZWVuLW1ldHJpYy1wcmVmaXhcIj4nICsgb3B0c1sncHJlZml4J10gKyAnPC9zcGFuPic7XG4gICAgICB9XG4gICAgICBpZiAob3B0c1snc3VmZml4J10pIHtcbiAgICAgICAgc3VmZml4ID0gJzxzcGFuIGNsYXNzPVwia2Vlbi1tZXRyaWMtc3VmZml4XCI+JyArIG9wdHNbJ3N1ZmZpeCddICsgJzwvc3Bhbj4nO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVsKCkuaW5uZXJIVE1MID0gJycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImtlZW4td2lkZ2V0IGtlZW4tbWV0cmljXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAnICsgYmdDb2xvciArICc7IHdpZHRoOicgKyBzdHlsZXMud2lkdGggKyAnO1wiIHRpdGxlPVwiJyArIHZhbHVlICsgJ1wiPicgK1xuICAgICAgICAgICc8c3BhbiBjbGFzcz1cImtlZW4tbWV0cmljLXZhbHVlXCI+JyArIHByZWZpeCArIGZvcm1hdHRlZE51bSArIHN1ZmZpeCArICc8L3NwYW4+JyArXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwia2Vlbi1tZXRyaWMtdGl0bGVcIj4nICsgdGl0bGUgKyAnPC9zcGFuPicgK1xuICAgICAgICAnPC9kaXY+JztcbiAgICB9XG4gIH07XG5cbiAgRXJyb3IgPSB7XG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24odGV4dCwgc3R5bGUpe1xuICAgICAgdmFyIGVyciwgbXNnO1xuXG4gICAgICB2YXIgZGVmYXVsdFN0eWxlID0gY2xvbmUoS2Vlbi5FcnJvci5kZWZhdWx0cyk7XG4gICAgICB2YXIgY3VycmVudFN0eWxlID0gZXh0ZW5kKGRlZmF1bHRTdHlsZSwgc3R5bGUpO1xuXG4gICAgICBlcnIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgZXJyLmNsYXNzTmFtZSA9IFwia2Vlbi1lcnJvclwiO1xuICAgICAgZWFjaChjdXJyZW50U3R5bGUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuICAgICAgICBlcnIuc3R5bGVba2V5XSA9IHZhbHVlO1xuICAgICAgfSk7XG4gICAgICBlcnIuc3R5bGUuaGVpZ2h0ID0gU3RyaW5nKHRoaXMuaGVpZ2h0KCkgKyBcInB4XCIpO1xuICAgICAgZXJyLnN0eWxlLnBhZGRpbmdUb3AgPSAodGhpcy5oZWlnaHQoKSAvIDIgLSAxNSkgKyBcInB4XCI7XG4gICAgICBlcnIuc3R5bGUud2lkdGggPSBTdHJpbmcodGhpcy53aWR0aCgpICsgXCJweFwiKTtcblxuICAgICAgbXNnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICBtc2cuaW5uZXJIVE1MID0gdGV4dCB8fCBcIllpa2VzISBBbiBlcnJvciBvY2N1cnJlZCFcIjtcblxuICAgICAgZXJyLmFwcGVuZENoaWxkKG1zZyk7XG5cbiAgICAgIHRoaXMuZWwoKS5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgdGhpcy5lbCgpLmFwcGVuZENoaWxkKGVycik7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5lbCgpLmlubmVySFRNTCA9IFwiXCI7XG4gICAgfVxuICB9O1xuXG4gIFNwaW5uZXIgPSB7XG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBzcGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHZhciBoZWlnaHQgPSB0aGlzLmhlaWdodCgpIHx8IEtlZW4uU3Bpbm5lci5kZWZhdWx0cy5oZWlnaHQ7XG4gICAgICBzcGlubmVyLmNsYXNzTmFtZSA9IFwia2Vlbi1sb2FkaW5nXCI7XG4gICAgICBzcGlubmVyLnN0eWxlLmhlaWdodCA9IFN0cmluZyhoZWlnaHQgKyBcInB4XCIpO1xuICAgICAgc3Bpbm5lci5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIjtcbiAgICAgIHNwaW5uZXIuc3R5bGUud2lkdGggPSBTdHJpbmcodGhpcy53aWR0aCgpICsgXCJweFwiKTtcblxuICAgICAgdGhpcy5lbCgpLmlubmVySFRNTCA9IFwiXCI7XG4gICAgICB0aGlzLmVsKCkuYXBwZW5kQ2hpbGQoc3Bpbm5lcik7XG4gICAgICB0aGlzLnZpZXcuX2FydGlmYWN0cy5zcGlubmVyID0gbmV3IEtlZW4uU3Bpbm5lcihLZWVuLlNwaW5uZXIuZGVmYXVsdHMpLnNwaW4oc3Bpbm5lcik7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy52aWV3Ll9hcnRpZmFjdHMuc3Bpbm5lci5zdG9wKCk7XG4gICAgICB0aGlzLnZpZXcuX2FydGlmYWN0cy5zcGlubmVyID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgS2Vlbi5EYXRhdml6LnJlZ2lzdGVyKCdrZWVuLWlvJywge1xuICAgICdtZXRyaWMnOiBNZXRyaWMsXG4gICAgJ2Vycm9yJzogRXJyb3IsXG4gICAgJ3NwaW5uZXInOiBTcGlubmVyXG4gIH0sIHtcbiAgICBjYXBhYmlsaXRpZXM6IGRhdGFUeXBlc1xuICB9KTtcblxufTsgLy8pKEtlZW4pO1xuIiwidmFyIGNsb25lID0gcmVxdWlyZSgnLi4vY29yZS91dGlscy9jbG9uZScpLFxuICAgIGVhY2ggPSByZXF1aXJlKCcuLi9jb3JlL3V0aWxzL2VhY2gnKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKCcuLi9jb3JlL3V0aWxzL2V4dGVuZCcpLFxuICAgIGxvYWRTY3JpcHQgPSByZXF1aXJlKCcuL3V0aWxzL2xvYWRTY3JpcHQnKSxcbiAgICBsb2FkU3R5bGUgPSByZXF1aXJlKCcuL3V0aWxzL2xvYWRTdHlsZScpO1xuXG52YXIgS2VlbiA9IHJlcXVpcmUoJy4uL2NvcmUnKTtcbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnLi4vY29yZS91dGlscy9lbWl0dGVyLXNoaW0nKTtcblxudmFyIERhdGFzZXQgPSByZXF1aXJlKCcuLi9kYXRhc2V0Jyk7XG5cbmZ1bmN0aW9uIERhdGF2aXooKXtcbiAgdGhpcy5kYXRhc2V0ID0gbmV3IERhdGFzZXQoKTtcbiAgdGhpcy52aWV3ID0ge1xuICAgIF9wcmVwYXJlZDogZmFsc2UsXG4gICAgX2luaXRpYWxpemVkOiBmYWxzZSxcbiAgICBfcmVuZGVyZWQ6IGZhbHNlLFxuICAgIF9hcnRpZmFjdHM6IHsgLyogc3RhdGUgYmluICovIH0sXG4gICAgYWRhcHRlcjoge1xuICAgICAgbGlicmFyeTogdW5kZWZpbmVkLFxuICAgICAgY2hhcnRPcHRpb25zOiB7fSxcbiAgICAgIGNoYXJ0VHlwZTogdW5kZWZpbmVkLFxuICAgICAgZGVmYXVsdENoYXJ0VHlwZTogdW5kZWZpbmVkLFxuICAgICAgZGF0YVR5cGU6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgYXR0cmlidXRlczogY2xvbmUoRGF0YXZpei5kZWZhdWx0cyksXG4gICAgZGVmYXVsdHM6IGNsb25lKERhdGF2aXouZGVmYXVsdHMpLFxuICAgIGVsOiB1bmRlZmluZWQsXG4gICAgbG9hZGVyOiB7IGxpYnJhcnk6ICdrZWVuLWlvJywgY2hhcnRUeXBlOiAnc3Bpbm5lcicgfVxuICB9O1xuICBEYXRhdml6LnZpc3VhbHMucHVzaCh0aGlzKTtcbn07XG5cbmV4dGVuZChEYXRhdml6LCB7XG4gIGRhdGFUeXBlTWFwOiB7XG4gICAgJ3Npbmd1bGFyJzogICAgICAgICAgeyBsaWJyYXJ5OiAna2Vlbi1pbycsIGNoYXJ0VHlwZTogJ21ldHJpYycgICAgICB9LFxuICAgICdjYXRlZ29yaWNhbCc6ICAgICAgIHsgbGlicmFyeTogJ2dvb2dsZScsICBjaGFydFR5cGU6ICdwaWVjaGFydCcgICAgfSxcbiAgICAnY2F0LWludGVydmFsJzogICAgICB7IGxpYnJhcnk6ICdnb29nbGUnLCAgY2hhcnRUeXBlOiAnY29sdW1uY2hhcnQnIH0sXG4gICAgJ2NhdC1vcmRpbmFsJzogICAgICAgeyBsaWJyYXJ5OiAnZ29vZ2xlJywgIGNoYXJ0VHlwZTogJ2JhcmNoYXJ0JyAgICB9LFxuICAgICdjaHJvbm9sb2dpY2FsJzogICAgIHsgbGlicmFyeTogJ2dvb2dsZScsICBjaGFydFR5cGU6ICdhcmVhY2hhcnQnICAgfSxcbiAgICAnY2F0LWNocm9ub2xvZ2ljYWwnOiB7IGxpYnJhcnk6ICdnb29nbGUnLCAgY2hhcnRUeXBlOiAnbGluZWNoYXJ0JyAgIH0sXG4gICAgJ2V4dHJhY3Rpb24nOiAgICAgICAgeyBsaWJyYXJ5OiAnZ29vZ2xlJywgIGNoYXJ0VHlwZTogJ3RhYmxlJyAgICAgICB9LFxuICAgICdub21pbmFsJzogICAgICAgICAgIHsgbGlicmFyeTogJ2dvb2dsZScsICBjaGFydFR5cGU6ICd0YWJsZScgICAgICAgfVxuICB9LFxuICBkZWZhdWx0czoge1xuICAgIGNvbG9yczogW1xuICAgIC8qIHRlYWwgICAgICByZWQgICAgICAgIHllbGxvdyAgICAgcHVycGxlICAgICBvcmFuZ2UgICAgIG1pbnQgICAgICAgYmx1ZSAgICAgICBncmVlbiAgICAgIGxhdmVuZGVyICovXG4gICAgJyMwMGJiZGUnLCAnI2ZlNjY3MicsICcjZWViMDU4JywgJyM4YThhZDYnLCAnI2ZmODU1YycsICcjMDBjZmJiJywgJyM1YTllZWQnLCAnIzczZDQ4MycsICcjYzg3OWJiJyxcbiAgICAnIzAwOTliNicsICcjZDc0ZDU4JywgJyNjYjkxNDEnLCAnIzZiNmJiNicsICcjZDg2OTQ1JywgJyMwMGFhOTknLCAnIzQyODFjOScsICcjNTdiNTY2JywgJyNhYzVjOWUnLFxuICAgICcjMjdjY2ViJywgJyNmZjgxOGInLCAnI2Y2YmY3MScsICcjOWI5YmUxJywgJyNmZjliNzknLCAnIzI2ZGZjZCcsICcjNzNhZmY0JywgJyM4N2UwOTYnLCAnI2Q4OGJjYidcbiAgICBdLFxuICAgIGluZGV4Qnk6ICd0aW1lZnJhbWUuc3RhcnQnLFxuICAgIHN0YWNrZWQ6IGZhbHNlXG4gIH0sXG4gIGRlcGVuZGVuY2llczoge1xuICAgIGxvYWRpbmc6IDAsXG4gICAgbG9hZGVkOiAwLFxuICAgIHVybHM6IHt9XG4gIH0sXG4gIGxpYnJhcmllczoge30sXG4gIHZpc3VhbHM6IFtdXG59KTtcblxuRW1pdHRlcihEYXRhdml6KTtcbkVtaXR0ZXIoRGF0YXZpei5wcm90b3R5cGUpO1xuXG5EYXRhdml6LnJlZ2lzdGVyID0gZnVuY3Rpb24obmFtZSwgbWV0aG9kcywgY29uZmlnKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgbG9hZEhhbmRsZXIgPSBmdW5jdGlvbihzdCkge1xuICAgIHN0LmxvYWRlZCsrO1xuICAgIGlmKHN0LmxvYWRlZCA9PT0gc3QubG9hZGluZykge1xuICAgICAgS2Vlbi5sb2FkZWQgPSB0cnVlO1xuICAgICAgS2Vlbi50cmlnZ2VyKCdyZWFkeScpO1xuICAgIH1cbiAgfTtcblxuICBEYXRhdml6LmxpYnJhcmllc1tuYW1lXSA9IERhdGF2aXoubGlicmFyaWVzW25hbWVdIHx8IHt9O1xuXG4gIC8vIEFkZCBtZXRob2QgdG8gbGlicmFyeSBoYXNoXG4gIGVhY2gobWV0aG9kcywgZnVuY3Rpb24obWV0aG9kLCBrZXkpe1xuICAgIERhdGF2aXoubGlicmFyaWVzW25hbWVdW2tleV0gPSBtZXRob2Q7XG4gIH0pO1xuXG4gIC8vIFNldCBkZWZhdWx0IGNhcGFiaWxpdGllcyBoYXNoXG4gIGlmIChjb25maWcgJiYgY29uZmlnLmNhcGFiaWxpdGllcykge1xuICAgIERhdGF2aXoubGlicmFyaWVzW25hbWVdLl9kZWZhdWx0cyA9IERhdGF2aXoubGlicmFyaWVzW25hbWVdLl9kZWZhdWx0cyB8fCB7fTtcbiAgICBlYWNoKGNvbmZpZy5jYXBhYmlsaXRpZXMsIGZ1bmN0aW9uKHR5cGVTZXQsIGtleSl7XG4gICAgICAvLyBzdG9yZSBzb21ld2hlcmUgaW4gbGlicmFyeVxuICAgICAgRGF0YXZpei5saWJyYXJpZXNbbmFtZV0uX2RlZmF1bHRzW2tleV0gPSB0eXBlU2V0O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gRm9yIGFsbCBkZXBlbmRlbmNpZXNcbiAgaWYgKGNvbmZpZyAmJiBjb25maWcuZGVwZW5kZW5jaWVzKSB7XG4gICAgZWFjaChjb25maWcuZGVwZW5kZW5jaWVzLCBmdW5jdGlvbiAoZGVwZW5kZW5jeSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgIHZhciBzdGF0dXMgPSBEYXRhdml6LmRlcGVuZGVuY2llcztcbiAgICAgIC8vIElmIGl0IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGN1cnJlbnQgZGVwZW5kZW5jaWVzIGJlaW5nIGxvYWRlZFxuICAgICAgaWYoIXN0YXR1cy51cmxzW2RlcGVuZGVuY3kudXJsXSkge1xuICAgICAgICBzdGF0dXMudXJsc1tkZXBlbmRlbmN5LnVybF0gPSB0cnVlO1xuICAgICAgICBzdGF0dXMubG9hZGluZysrO1xuICAgICAgICB2YXIgbWV0aG9kID0gZGVwZW5kZW5jeS50eXBlID09PSAnc2NyaXB0JyA/IGxvYWRTY3JpcHQgOiBsb2FkU3R5bGU7XG5cbiAgICAgICAgbWV0aG9kKGRlcGVuZGVuY3kudXJsLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZihkZXBlbmRlbmN5LmNiKSB7XG4gICAgICAgICAgICBkZXBlbmRlbmN5LmNiLmNhbGwoc2VsZiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGxvYWRIYW5kbGVyKHN0YXR1cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9hZEhhbmRsZXIoc3RhdHVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5EYXRhdml6LmZpbmQgPSBmdW5jdGlvbih0YXJnZXQpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBEYXRhdml6LnZpc3VhbHM7XG4gIHZhciBlbCA9IHRhcmdldC5ub2RlTmFtZSA/IHRhcmdldCA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSxcbiAgICAgIG1hdGNoO1xuXG4gIGVhY2goRGF0YXZpei52aXN1YWxzLCBmdW5jdGlvbih2aXN1YWwpe1xuICAgIGlmIChlbCA9PSB2aXN1YWwuZWwoKSl7XG4gICAgICBtYXRjaCA9IHZpc3VhbDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuICBpZiAobWF0Y2gpIHJldHVybiBtYXRjaDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YXZpejtcbiIsInZhciBjbG9uZSA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2Nsb25lXCIpLFxuICAgIGV4dGVuZCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2V4dGVuZFwiKSxcbiAgICBEYXRhdml6ID0gcmVxdWlyZShcIi4uL2RhdGF2aXpcIiksXG4gICAgUmVxdWVzdCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3JlcXVlc3RcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXVlcnksIGVsLCBjZmcpIHtcbiAgdmFyIERFRkFVTFRTID0gY2xvbmUoRGF0YXZpei5kZWZhdWx0cyksXG4gICAgICB2aXN1YWwgPSBuZXcgRGF0YXZpeigpLFxuICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KHRoaXMsIFtxdWVyeV0pLFxuICAgICAgY29uZmlnID0gY2ZnID8gY2xvbmUoY2ZnKSA6IHt9O1xuXG4gIGlmIChjb25maWcuY2hhcnRUeXBlKSB7XG4gICAgdmlzdWFsLmNoYXJ0VHlwZShjb25maWcuY2hhcnRUeXBlKTtcbiAgICBkZWxldGUgY29uZmlnLmNoYXJ0VHlwZTtcbiAgfVxuXG4gIGlmIChjb25maWcubGlicmFyeSkge1xuICAgIHZpc3VhbC5saWJyYXJ5KGNvbmZpZy5saWJyYXJ5KTtcbiAgICBkZWxldGUgY29uZmlnLmxpYnJhcnk7XG4gIH1cblxuICBpZiAoY29uZmlnLmNoYXJ0T3B0aW9ucykge1xuICAgIHZpc3VhbC5jaGFydE9wdGlvbnMoY29uZmlnLmNoYXJ0T3B0aW9ucyk7XG4gICAgZGVsZXRlIGNvbmZpZy5jaGFydE9wdGlvbnM7XG4gIH1cblxuICB2aXN1YWxcbiAgICAuYXR0cmlidXRlcyhleHRlbmQoREVGQVVMVFMsIGNvbmZpZykpXG4gICAgLmVsKGVsKVxuICAgIC5wcmVwYXJlKCk7XG5cbiAgcmVxdWVzdC5yZWZyZXNoKCk7XG4gIHJlcXVlc3Qub24oXCJjb21wbGV0ZVwiLCBmdW5jdGlvbigpe1xuICAgIHZpc3VhbFxuICAgICAgLnBhcnNlUmVxdWVzdCh0aGlzKVxuICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKGNvbmZpZy5sYWJlbHMpIHtcbiAgICAgICAgICB0aGlzLmxhYmVscyhjb25maWcubGFiZWxzKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5yZW5kZXIoKTtcbiAgfSk7XG4gIHJlcXVlc3Qub24oXCJlcnJvclwiLCBmdW5jdGlvbihyZXMpe1xuICAgIHZpc3VhbC5lcnJvcihyZXMubWVzc2FnZSk7XG4gIH0pO1xuXG4gIHJldHVybiB2aXN1YWw7XG59O1xuIiwidmFyIERhdGF2aXogPSByZXF1aXJlKFwiLi4vZGF0YXZpelwiKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKFwiLi4vLi4vY29yZS91dGlscy9leHRlbmRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgbWFwID0gZXh0ZW5kKHt9LCBEYXRhdml6LmRhdGFUeXBlTWFwKSxcbiAgICAgIGRhdGFUeXBlID0gdGhpcy5kYXRhVHlwZSgpLFxuICAgICAgbGlicmFyeSA9IHRoaXMubGlicmFyeSgpLFxuICAgICAgY2hhcnRUeXBlID0gdGhpcy5jaGFydFR5cGUoKSB8fCB0aGlzLmRlZmF1bHRDaGFydFR5cGUoKTtcblxuICAvLyBVc2UgdGhlIGRlZmF1bHQgbGlicmFyeSBhcyBhIGJhY2t1cFxuICBpZiAoIWxpYnJhcnkgJiYgbWFwW2RhdGFUeXBlXSkge1xuICAgIGxpYnJhcnkgPSBtYXBbZGF0YVR5cGVdLmxpYnJhcnk7XG4gIH1cblxuICAvLyBVc2UgdGhpcyBsaWJyYXJ5J3MgZGVmYXVsdCBjaGFydFR5cGUgZm9yIHRoaXMgZGF0YVR5cGVcbiAgaWYgKGxpYnJhcnkgJiYgIWNoYXJ0VHlwZSAmJiBkYXRhVHlwZSkge1xuICAgIGNoYXJ0VHlwZSA9IERhdGF2aXoubGlicmFyaWVzW2xpYnJhcnldLl9kZWZhdWx0c1tkYXRhVHlwZV1bMF07XG4gIH1cblxuICAvLyBTdGlsbCBubyBsdWNrP1xuICBpZiAobGlicmFyeSAmJiAhY2hhcnRUeXBlICYmIG1hcFtkYXRhVHlwZV0pIHtcbiAgICBjaGFydFR5cGUgPSBtYXBbZGF0YVR5cGVdLmNoYXJ0VHlwZTtcbiAgfVxuXG4gIC8vIFJldHVybiBpZiBmb3VuZFxuICByZXR1cm4gKGxpYnJhcnkgJiYgY2hhcnRUeXBlKSA/IERhdGF2aXoubGlicmFyaWVzW2xpYnJhcnldW2NoYXJ0VHlwZV0gOiB7fTtcbn07XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIiksXG4gICAgRGF0YXNldCA9IHJlcXVpcmUoXCIuLi8uLi9kYXRhc2V0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJleHRyYWN0aW9uXCI6IHBhcnNlRXh0cmFjdGlvblxufTtcblxuZnVuY3Rpb24gcGFyc2VFeHRyYWN0aW9uKHJlcSl7XG4gIHZhciBkYXRhID0gKHJlcS5kYXRhIGluc3RhbmNlb2YgQXJyYXkgPyByZXEuZGF0YVswXSA6IHJlcS5kYXRhKSxcbiAgbmFtZXMgPSByZXEucXVlcmllc1swXS5nZXQoXCJwcm9wZXJ0eV9uYW1lc1wiKSB8fCBbXSxcbiAgc2NoZW1hID0geyByZWNvcmRzOiBcInJlc3VsdFwiLCBzZWxlY3Q6IHRydWUgfTtcbiAgaWYgKG5hbWVzKSB7XG4gICAgc2NoZW1hLnNlbGVjdCA9IFtdO1xuICAgIGVhY2gobmFtZXMsIGZ1bmN0aW9uKHApe1xuICAgICAgc2NoZW1hLnNlbGVjdC5wdXNoKHsgcGF0aDogcCB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRGF0YXNldChkYXRhLCBzY2hlbWEpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihyZXEpe1xuICB2YXIgYW5hbHlzaXMgPSByZXEucXVlcmllc1swXS5hbmFseXNpcy5yZXBsYWNlKFwiX1wiLCBcIiBcIiksXG4gIGNvbGxlY3Rpb24gPSByZXEucXVlcmllc1swXS5nZXQoJ2V2ZW50X2NvbGxlY3Rpb24nKSxcbiAgb3V0cHV0O1xuICBvdXRwdXQgPSBhbmFseXNpcy5yZXBsYWNlKCAvXFxiLi9nLCBmdW5jdGlvbihhKXtcbiAgICByZXR1cm4gYS50b1VwcGVyQ2FzZSgpO1xuICB9KTtcbiAgaWYgKGNvbGxlY3Rpb24pIHtcbiAgICBvdXRwdXQgKz0gJyAtICcgKyBjb2xsZWN0aW9uO1xuICB9XG4gIHJldHVybiBvdXRwdXQ7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxdWVyeSl7XG4gIHZhciBpc0ludGVydmFsID0gdHlwZW9mIHF1ZXJ5LnBhcmFtcy5pbnRlcnZhbCA9PT0gXCJzdHJpbmdcIixcbiAgaXNHcm91cEJ5ID0gdHlwZW9mIHF1ZXJ5LnBhcmFtcy5ncm91cF9ieSA9PT0gXCJzdHJpbmdcIixcbiAgaXMyeEdyb3VwQnkgPSBxdWVyeS5wYXJhbXMuZ3JvdXBfYnkgaW5zdGFuY2VvZiBBcnJheSxcbiAgZGF0YVR5cGU7XG5cbiAgLy8gbWV0cmljXG4gIGlmICghaXNHcm91cEJ5ICYmICFpc0ludGVydmFsKSB7XG4gICAgZGF0YVR5cGUgPSAnc2luZ3VsYXInO1xuICB9XG5cbiAgLy8gZ3JvdXBfYnksIG5vIGludGVydmFsXG4gIGlmIChpc0dyb3VwQnkgJiYgIWlzSW50ZXJ2YWwpIHtcbiAgICBkYXRhVHlwZSA9ICdjYXRlZ29yaWNhbCc7XG4gIH1cblxuICAvLyBpbnRlcnZhbCwgbm8gZ3JvdXBfYnlcbiAgaWYgKGlzSW50ZXJ2YWwgJiYgIWlzR3JvdXBCeSkge1xuICAgIGRhdGFUeXBlID0gJ2Nocm9ub2xvZ2ljYWwnO1xuICB9XG5cbiAgLy8gaW50ZXJ2YWwsIGdyb3VwX2J5XG4gIGlmIChpc0ludGVydmFsICYmIGlzR3JvdXBCeSkge1xuICAgIGRhdGFUeXBlID0gJ2NhdC1jaHJvbm9sb2dpY2FsJztcbiAgfVxuXG4gIC8vIDJ4IGdyb3VwX2J5XG4gIC8vIFRPRE86IHJlc2VhcmNoIHBvc3NpYmxlIGRhdGFUeXBlIG9wdGlvbnNcbiAgaWYgKCFpc0ludGVydmFsICYmIGlzMnhHcm91cEJ5KSB7XG4gICAgZGF0YVR5cGUgPSAnY2F0ZWdvcmljYWwnO1xuICB9XG5cbiAgLy8gaW50ZXJ2YWwsIDJ4IGdyb3VwX2J5XG4gIC8vIFRPRE86IHJlc2VhcmNoIHBvc3NpYmxlIGRhdGFUeXBlIG9wdGlvbnNcbiAgaWYgKGlzSW50ZXJ2YWwgJiYgaXMyeEdyb3VwQnkpIHtcbiAgICBkYXRhVHlwZSA9ICdjYXQtY2hyb25vbG9naWNhbCc7XG4gIH1cblxuICBpZiAocXVlcnkuYW5hbHlzaXMgPT09IFwiZnVubmVsXCIpIHtcbiAgICBkYXRhVHlwZSA9ICdjYXQtb3JkaW5hbCc7XG4gIH1cblxuICBpZiAocXVlcnkuYW5hbHlzaXMgPT09IFwiZXh0cmFjdGlvblwiKSB7XG4gICAgZGF0YVR5cGUgPSAnZXh0cmFjdGlvbic7XG4gIH1cbiAgaWYgKHF1ZXJ5LmFuYWx5c2lzID09PSBcInNlbGVjdF91bmlxdWVcIikge1xuICAgIGRhdGFUeXBlID0gJ25vbWluYWwnO1xuICB9XG5cbiAgcmV0dXJuIGRhdGFUeXBlO1xufTtcbiIsInZhciBleHRlbmQgPSByZXF1aXJlKCcuLi9jb3JlL3V0aWxzL2V4dGVuZCcpLFxuICAgIERhdGF2aXogPSByZXF1aXJlKCcuL2RhdGF2aXonKTtcblxuZXh0ZW5kKERhdGF2aXoucHJvdG90eXBlLCB7XG4gICdhZGFwdGVyJyAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2FkYXB0ZXInKSxcbiAgJ2F0dHJpYnV0ZXMnICAgICAgIDogcmVxdWlyZSgnLi9saWIvYXR0cmlidXRlcycpLFxuICAnY2FsbCcgICAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9jYWxsJyksXG4gICdjaGFydE9wdGlvbnMnICAgICA6IHJlcXVpcmUoJy4vbGliL2NoYXJ0T3B0aW9ucycpLFxuICAnY2hhcnRUeXBlJyAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9jaGFydFR5cGUnKSxcbiAgJ2NvbG9yTWFwcGluZycgICAgIDogcmVxdWlyZSgnLi9saWIvY29sb3JNYXBwaW5nJyksXG4gICdjb2xvcnMnICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2NvbG9ycycpLFxuICAnZGF0YScgICAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9kYXRhJyksXG4gICdkYXRhVHlwZScgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2RhdGFUeXBlJyksXG4gICdkZWZhdWx0Q2hhcnRUeXBlJyA6IHJlcXVpcmUoJy4vbGliL2RlZmF1bHRDaGFydFR5cGUnKSxcbiAgJ2VsJyAgICAgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvZWwnKSxcbiAgJ2hlaWdodCcgICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvaGVpZ2h0JyksXG4gICdpbmRleEJ5JyAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2luZGV4QnknKSxcbiAgJ2xhYmVsTWFwcGluZycgICAgIDogcmVxdWlyZSgnLi9saWIvbGFiZWxNYXBwaW5nJyksXG4gICdsYWJlbHMnICAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2xhYmVscycpLFxuICAnbGlicmFyeScgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9saWJyYXJ5JyksXG4gICdwYXJzZVJhd0RhdGEnICAgICA6IHJlcXVpcmUoJy4vbGliL3BhcnNlUmF3RGF0YScpLFxuICAncGFyc2VSZXF1ZXN0JyAgICAgOiByZXF1aXJlKCcuL2xpYi9wYXJzZVJlcXVlc3QnKSxcbiAgJ3ByZXBhcmUnICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvcHJlcGFyZScpLFxuICAnc29ydEdyb3VwcycgICAgICAgOiByZXF1aXJlKCcuL2xpYi9zb3J0R3JvdXBzJyksXG4gICdzb3J0SW50ZXJ2YWxzJyAgICA6IHJlcXVpcmUoJy4vbGliL3NvcnRJbnRlcnZhbHMnKSxcbiAgJ3N0YWNrZWQnICAgICAgICAgIDogcmVxdWlyZSgnLi9saWIvc3RhY2tlZCcpLFxuICAndGl0bGUnICAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi90aXRsZScpLFxuICAnd2lkdGgnICAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi93aWR0aCcpXG59KTtcblxuZXh0ZW5kKERhdGF2aXoucHJvdG90eXBlLCB7XG4gICdkZXN0cm95JyAgICAgICAgICA6IHJlcXVpcmUoJy4vbGliL2FjdGlvbnMvZGVzdHJveScpLFxuICAnZXJyb3InICAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9hY3Rpb25zL2Vycm9yJyksXG4gICdpbml0aWFsaXplJyAgICAgICA6IHJlcXVpcmUoJy4vbGliL2FjdGlvbnMvaW5pdGlhbGl6ZScpLFxuICAncmVuZGVyJyAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9hY3Rpb25zL3JlbmRlcicpLFxuICAndXBkYXRlJyAgICAgICAgICAgOiByZXF1aXJlKCcuL2xpYi9hY3Rpb25zL3VwZGF0ZScpXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhdml6O1xuIiwidmFyIGdldEFkYXB0ZXJBY3Rpb25zID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvZ2V0QWRhcHRlckFjdGlvbnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIGFjdGlvbnMgPSBnZXRBZGFwdGVyQWN0aW9ucy5jYWxsKHRoaXMpO1xuICBpZiAoYWN0aW9ucy5kZXN0cm95KSB7XG4gICAgYWN0aW9ucy5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgLy8gY2xlYXIgcmVuZGVyZWQgYXJ0aWZhdHMsIHN0YXRlIGJpblxuICBpZiAodGhpcy5lbCgpKSB7XG4gICAgdGhpcy5lbCgpLmlubmVySFRNTCA9IFwiXCI7XG4gIH1cbiAgdGhpcy52aWV3Ll9wcmVwYXJlZCA9IGZhbHNlO1xuICB0aGlzLnZpZXcuX2luaXRpYWxpemVkID0gZmFsc2U7XG4gIHRoaXMudmlldy5fcmVuZGVyZWQgPSBmYWxzZTtcbiAgdGhpcy52aWV3Ll9hcnRpZmFjdHMgPSB7fTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIGdldEFkYXB0ZXJBY3Rpb25zID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvZ2V0QWRhcHRlckFjdGlvbnNcIiksXG4gICAgRGF0YXZpeiA9IHJlcXVpcmUoXCIuLi8uLi9kYXRhdml6XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBhY3Rpb25zID0gZ2V0QWRhcHRlckFjdGlvbnMuY2FsbCh0aGlzKTtcbiAgaWYgKGFjdGlvbnNbJ2Vycm9yJ10pIHtcbiAgICBhY3Rpb25zWydlcnJvciddLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0gZWxzZSB7XG4gICAgRGF0YXZpei5saWJyYXJpZXNbJ2tlZW4taW8nXVsnZXJyb3InXS5yZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgZ2V0QWRhcHRlckFjdGlvbnMgPSByZXF1aXJlKFwiLi4vLi4vaGVscGVycy9nZXRBZGFwdGVyQWN0aW9uc1wiKSxcbiAgICBEYXRhdml6ID0gcmVxdWlyZShcIi4uLy4uL2RhdGF2aXpcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIGFjdGlvbnMgPSBnZXRBZGFwdGVyQWN0aW9ucy5jYWxsKHRoaXMpO1xuICB2YXIgbG9hZGVyID0gRGF0YXZpei5saWJyYXJpZXNbdGhpcy52aWV3LmxvYWRlci5saWJyYXJ5XVt0aGlzLnZpZXcubG9hZGVyLmNoYXJ0VHlwZV07XG4gIGlmICh0aGlzLnZpZXcuX3ByZXBhcmVkKSB7XG4gICAgaWYgKGxvYWRlci5kZXN0cm95KSBsb2FkZXIuZGVzdHJveS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9IGVsc2Uge1xuICAgIGlmICh0aGlzLmVsKCkpIHRoaXMuZWwoKS5pbm5lckhUTUwgPSBcIlwiO1xuICB9XG4gIGlmIChhY3Rpb25zLmluaXRpYWxpemUpIGFjdGlvbnMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB0aGlzLnZpZXcuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIGdldEFkYXB0ZXJBY3Rpb25zID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvZ2V0QWRhcHRlckFjdGlvbnNcIiksXG4gICAgYXBwbHlUcmFuc2Zvcm1zID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL2FwcGx5VHJhbnNmb3Jtc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgYWN0aW9ucyA9IGdldEFkYXB0ZXJBY3Rpb25zLmNhbGwodGhpcyk7XG4gIGFwcGx5VHJhbnNmb3Jtcy5jYWxsKHRoaXMpO1xuICBpZiAoIXRoaXMudmlldy5faW5pdGlhbGl6ZWQpIHtcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuICBpZiAodGhpcy5lbCgpICYmIGFjdGlvbnMucmVuZGVyKSB7XG4gICAgYWN0aW9ucy5yZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnZpZXcuX3JlbmRlcmVkID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgZ2V0QWRhcHRlckFjdGlvbnMgPSByZXF1aXJlKFwiLi4vLi4vaGVscGVycy9nZXRBZGFwdGVyQWN0aW9uc1wiKSxcbiAgICBhcHBseVRyYW5zZm9ybXMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvYXBwbHlUcmFuc2Zvcm1zXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBhY3Rpb25zID0gZ2V0QWRhcHRlckFjdGlvbnMuY2FsbCh0aGlzKTtcbiAgYXBwbHlUcmFuc2Zvcm1zLmNhbGwodGhpcyk7XG4gIGlmIChhY3Rpb25zLnVwZGF0ZSkge1xuICAgIGFjdGlvbnMudXBkYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0gZWxzZSBpZiAoYWN0aW9ucy5yZW5kZXIpIHtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcbiIsInZhciBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXcuYWRhcHRlcjtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBlYWNoKG9iaiwgZnVuY3Rpb24ocHJvcCwga2V5KXtcbiAgICBzZWxmLnZpZXcuYWRhcHRlcltrZXldID0gKHByb3AgPyBwcm9wIDogbnVsbCk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG52YXIgY2hhcnRPcHRpb25zID0gcmVxdWlyZShcIi4vY2hhcnRPcHRpb25zXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl07XG4gIHZhciBzZWxmID0gdGhpcztcbiAgZWFjaChvYmosIGZ1bmN0aW9uKHByb3AsIGtleSl7XG4gICAgaWYgKGtleSA9PT0gXCJjaGFydE9wdGlvbnNcIikge1xuICAgICAgY2hhcnRPcHRpb25zLmNhbGwoc2VsZiwgcHJvcCk7XG4gICAgICAvLyBzZWxmLmNoYXJ0T3B0aW9ucyhwcm9wKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi52aWV3W1wiYXR0cmlidXRlc1wiXVtrZXldID0gcHJvcDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuKXtcbiAgZm4uY2FsbCh0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoJy4uLy4uL2NvcmUvdXRpbHMvZXh0ZW5kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlldy5hZGFwdGVyLmNoYXJ0T3B0aW9ucztcbiAgZXh0ZW5kKHRoaXMudmlldy5hZGFwdGVyLmNoYXJ0T3B0aW9ucywgb2JqKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXcuYWRhcHRlci5jaGFydFR5cGU7XG4gIHRoaXMudmlldy5hZGFwdGVyLmNoYXJ0VHlwZSA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5jb2xvck1hcHBpbmc7XG4gIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0uY29sb3JNYXBwaW5nID0gKG9iaiA/IG9iaiA6IG51bGwpO1xuICBjb2xvck1hcHBpbmcuY2FsbCh0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBjb2xvck1hcHBpbmcoKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgc2NoZW1hID0gdGhpcy5kYXRhc2V0LnNjaGVtYSxcbiAgICAgIGRhdGEgPSB0aGlzLmRhdGFzZXQub3V0cHV0KCksXG4gICAgICBjb2xvclNldCA9IHRoaXMudmlldy5kZWZhdWx0cy5jb2xvcnMuc2xpY2UoKSxcbiAgICAgIGNvbG9yTWFwID0gdGhpcy5jb2xvck1hcHBpbmcoKSxcbiAgICAgIGR0ID0gdGhpcy5kYXRhVHlwZSgpIHx8IFwiXCI7XG5cbiAgaWYgKGNvbG9yTWFwKSB7XG4gICAgaWYgKGR0LmluZGV4T2YoXCJjaHJvbm9sb2dpY2FsXCIpID4gLTEgfHwgKHNjaGVtYS51bnBhY2sgJiYgZGF0YVswXS5sZW5ndGggPiAyKSkge1xuICAgICAgZWFjaChkYXRhWzBdLnNsaWNlKDEpLCBmdW5jdGlvbihsYWJlbCwgaSl7XG4gICAgICAgIHZhciBjb2xvciA9IGNvbG9yTWFwW2xhYmVsXTtcbiAgICAgICAgaWYgKGNvbG9yICYmIGNvbG9yU2V0W2ldICE9PSBjb2xvcikge1xuICAgICAgICAgIGNvbG9yU2V0LnNwbGljZShpLCAwLCBjb2xvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVhY2goc2VsZi5kYXRhc2V0LnNlbGVjdENvbHVtbigwKS5zbGljZSgxKSwgZnVuY3Rpb24obGFiZWwsIGkpe1xuICAgICAgICB2YXIgY29sb3IgPSBjb2xvck1hcFtsYWJlbF07XG4gICAgICAgIGlmIChjb2xvciAmJiBjb2xvclNldFtpXSAhPT0gY29sb3IpIHtcbiAgICAgICAgICBjb2xvclNldC5zcGxpY2UoaSwgMCwgY29sb3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgc2VsZi52aWV3LmF0dHJpYnV0ZXMuY29sb3JzID0gY29sb3JTZXQ7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5jb2xvcnM7XG4gIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0uY29sb3JzID0gKGFyciBpbnN0YW5jZW9mIEFycmF5ID8gYXJyIDogbnVsbCk7XG4gIHRoaXMudmlldy5kZWZhdWx0cy5jb2xvcnMgPSAoYXJyIGluc3RhbmNlb2YgQXJyYXkgPyBhcnIgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIERhdGFzZXQgPSByZXF1aXJlKFwiLi4vLi4vZGF0YXNldFwiKSxcbiAgICBSZXF1ZXN0ID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvcmVxdWVzdFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5kYXRhc2V0Lm91dHB1dCgpO1xuICBpZiAoZGF0YSBpbnN0YW5jZW9mIERhdGFzZXQpIHtcbiAgICB0aGlzLmRhdGFzZXQgPSBkYXRhO1xuICB9IGVsc2UgaWYgKGRhdGEgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgdGhpcy5wYXJzZVJlcXVlc3QoZGF0YSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJzZVJhd0RhdGEoZGF0YSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXcuYWRhcHRlci5kYXRhVHlwZTtcbiAgdGhpcy52aWV3LmFkYXB0ZXIuZGF0YVR5cGUgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXcuYWRhcHRlci5kZWZhdWx0Q2hhcnRUeXBlO1xuICB0aGlzLnZpZXcuYWRhcHRlci5kZWZhdWx0Q2hhcnRUeXBlID0gKHN0ciA/IFN0cmluZyhzdHIpIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXcuZWw7XG4gIHRoaXMudmlldy5lbCA9IGVsO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG51bSl7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl1bXCJoZWlnaHRcIl07XG4gIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl1bXCJoZWlnaHRcIl0gPSAoIWlzTmFOKHBhcnNlSW50KG51bSkpID8gcGFyc2VJbnQobnVtKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgRGF0YXNldCA9IHJlcXVpcmUoXCIuLi8uLi9kYXRhc2V0XCIpLFxuICAgIERhdGF2aXogPSByZXF1aXJlKFwiLi4vZGF0YXZpelwiKSxcbiAgICBlYWNoID0gcmVxdWlyZShcIi4uLy4uL2NvcmUvdXRpbHMvZWFjaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLmluZGV4Qnk7XG4gIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0uaW5kZXhCeSA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IERhdGF2aXouZGVmYXVsdHMuaW5kZXhCeSk7XG4gIGluZGV4QnkuY2FsbCh0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBpbmRleEJ5KCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgcm9vdCA9IHRoaXMuZGF0YXNldC5tZXRhLnNjaGVtYSB8fCB0aGlzLmRhdGFzZXQubWV0YS51bnBhY2ssXG4gIG5ld09yZGVyID0gdGhpcy5pbmRleEJ5KCkuc3BsaXQoXCIuXCIpLmpvaW4oRGF0YXNldC5kZWZhdWx0cy5kZWxpbWV0ZXIpO1xuICAvLyBSZXBsYWNlIGluIHNjaGVtYSBhbmQgcmUtcnVuIGRhdGFzZXQucGFyc2UoKVxuICBlYWNoKHJvb3QsIGZ1bmN0aW9uKGRlZiwgaSl7XG4gICAgLy8gdXBkYXRlICdzZWxlY3QnIGNvbmZpZ3NcbiAgICBpZiAoaSA9PT0gXCJzZWxlY3RcIiAmJiBkZWYgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZWFjaChkZWYsIGZ1bmN0aW9uKGMsIGope1xuICAgICAgICBpZiAoYy5wYXRoLmluZGV4T2YoXCJ0aW1lZnJhbWUgLT4gXCIpID4gLTEpIHtcbiAgICAgICAgICBzZWxmLmRhdGFzZXQubWV0YS5zY2hlbWFbaV1bal0ucGF0aCA9IG5ld09yZGVyO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gdXBkYXRlICd1bnBhY2snIGNvbmZpZ3NcbiAgICBlbHNlIGlmIChpID09PSBcInVucGFja1wiICYmIHR5cGVvZiBkZWYgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHNlbGYuZGF0YXNldC5tZXRhLnNjaGVtYVtpXVsnaW5kZXgnXS5wYXRoID0gbmV3T3JkZXI7XG4gICAgfVxuICB9KTtcbiAgdGhpcy5kYXRhc2V0LnBhcnNlKCk7XG59XG4iLCJ2YXIgZWFjaCA9IHJlcXVpcmUoXCIuLi8uLi9jb3JlL3V0aWxzL2VhY2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5sYWJlbE1hcHBpbmc7XG4gIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl0ubGFiZWxNYXBwaW5nID0gKG9iaiA/IG9iaiA6IG51bGwpO1xuICBhcHBseUxhYmVsTWFwcGluZy5jYWxsKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGFwcGx5TGFiZWxNYXBwaW5nKCl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgbGFiZWxNYXAgPSB0aGlzLmxhYmVsTWFwcGluZygpLFxuICBzY2hlbWEgPSB0aGlzLmRhdGFzZXQuc2NoZW1hKCkgfHwge30sXG4gIGR0ID0gdGhpcy5kYXRhVHlwZSgpIHx8IFwiXCI7XG5cbiAgaWYgKGxhYmVsTWFwKSB7XG4gICAgaWYgKGR0LmluZGV4T2YoXCJjaHJvbm9sb2dpY2FsXCIpID4gLTEgfHwgKHNjaGVtYS51bnBhY2sgJiYgc2VsZi5kYXRhc2V0Lm91dHB1dCgpWzBdLmxlbmd0aCA+IDIpKSB7XG4gICAgICAvLyBsb29wIG92ZXIgaGVhZGVyIGNlbGxzXG4gICAgICBlYWNoKHNlbGYuZGF0YXNldC5vdXRwdXQoKVswXSwgZnVuY3Rpb24oYywgaSl7XG4gICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgIHNlbGYuZGF0YXNldC5kYXRhLm91dHB1dFswXVtpXSA9IGxhYmVsTWFwW2NdIHx8IGM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEuc2VsZWN0ICYmIHNlbGYuZGF0YXNldC5vdXRwdXQoKVswXS5sZW5ndGggPT09IDIpIHtcbiAgICAgIC8vIHVwZGF0ZSBjb2x1bW4gMFxuICAgICAgc2VsZi5kYXRhc2V0LnVwZGF0ZUNvbHVtbigwLCBmdW5jdGlvbihjLCBpKXtcbiAgICAgICAgcmV0dXJuIGxhYmVsTWFwW2NdIHx8IGM7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiIsInZhciBlYWNoID0gcmVxdWlyZSgnLi4vLi4vY29yZS91dGlscy9lYWNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgLy8gSWYgbGFiZWxzIGNvbmZpZyBpcyBlbXB0eSwgcmV0dXJuIHdoYXQncyBpbiB0aGUgZGF0YXNldFxuICAgIGlmICghdGhpcy52aWV3WydhdHRyaWJ1dGVzJ10ubGFiZWxzIHx8ICF0aGlzLnZpZXdbJ2F0dHJpYnV0ZXMnXS5sYWJlbHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZ2V0TGFiZWxzLmNhbGwodGhpcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudmlld1snYXR0cmlidXRlcyddLmxhYmVscztcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy52aWV3WydhdHRyaWJ1dGVzJ10ubGFiZWxzID0gKGFyciBpbnN0YW5jZW9mIEFycmF5ID8gYXJyIDogbnVsbCk7XG4gICAgc2V0TGFiZWxzLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNldExhYmVscygpe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBsYWJlbFNldCA9IHRoaXMubGFiZWxzKCkgfHwgbnVsbCxcbiAgICAgIHNjaGVtYSA9IHRoaXMuZGF0YXNldC5zY2hlbWEoKSB8fCB7fSxcbiAgICAgIGRhdGEgPSB0aGlzLmRhdGFzZXQub3V0cHV0KCksXG4gICAgICBkdCA9IHRoaXMuZGF0YVR5cGUoKSB8fCAnJztcblxuICBpZiAobGFiZWxTZXQpIHtcbiAgICBpZiAoZHQuaW5kZXhPZignY2hyb25vbG9naWNhbCcpID4gLTEgfHwgKHNjaGVtYS51bnBhY2sgJiYgZGF0YVswXS5sZW5ndGggPiAyKSkge1xuICAgICAgZWFjaChkYXRhWzBdLCBmdW5jdGlvbihjZWxsLGkpe1xuICAgICAgICBpZiAoaSA+IDAgJiYgbGFiZWxTZXRbaS0xXSkge1xuICAgICAgICAgIHNlbGYuZGF0YXNldC5kYXRhLm91dHB1dFswXVtpXSA9IGxhYmVsU2V0W2ktMV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVhY2goZGF0YSwgZnVuY3Rpb24ocm93LGkpe1xuICAgICAgICBpZiAoaSA+IDAgJiYgbGFiZWxTZXRbaS0xXSkge1xuICAgICAgICAgIHNlbGYuZGF0YXNldC5kYXRhLm91dHB1dFtpXVswXSA9IGxhYmVsU2V0W2ktMV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRMYWJlbHMoKXtcbiAgdmFyIHNjaGVtYSA9IHRoaXMuZGF0YXNldC5zY2hlbWEoKSB8fCB7fSxcbiAgICAgIGRhdGEgPSB0aGlzLmRhdGFzZXQub3V0cHV0KCksXG4gICAgICBkdCA9IHRoaXMuZGF0YVR5cGUoKSB8fCAnJyxcbiAgICAgIGxhYmVscztcblxuICBpZiAoZHQuaW5kZXhPZignY2hyb24nKSA+IC0xIHx8IChzY2hlbWEudW5wYWNrICYmIGRhdGFbMF0ubGVuZ3RoID4gMikpIHtcbiAgICBsYWJlbHMgPSB0aGlzLmRhdGFzZXQuc2VsZWN0Um93KDApLnNsaWNlKDEpO1xuICB9XG4gIGVsc2Uge1xuICAgIGxhYmVscyA9IHRoaXMuZGF0YXNldC5zZWxlY3RDb2x1bW4oMCkuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGxhYmVscztcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3LmFkYXB0ZXIubGlicmFyeTtcbiAgdGhpcy52aWV3LmFkYXB0ZXIubGlicmFyeSA9IChzdHIgPyBTdHJpbmcoc3RyKSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJ2YXIgRGF0YXZpeiA9IHJlcXVpcmUoJy4uL2RhdGF2aXonKSxcbiAgICBEYXRhc2V0ID0gcmVxdWlyZSgnLi4vLi4vZGF0YXNldCcpO1xuXG52YXIgZWFjaCA9IHJlcXVpcmUoJy4uLy4uL2NvcmUvdXRpbHMvZWFjaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHJhdyl7XG4gIHRoaXMuZGF0YXNldCA9IHBhcnNlUmF3RGF0YS5jYWxsKHRoaXMsIHJhdyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gcGFyc2VSYXdEYXRhKHJlc3BvbnNlKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgc2NoZW1hID0ge30sXG4gICAgICBpbmRleEJ5LFxuICAgICAgZGVsaW1ldGVyLFxuICAgICAgaW5kZXhUYXJnZXQsXG4gICAgICBsYWJlbFNldCxcbiAgICAgIGxhYmVsTWFwLFxuICAgICAgZGF0YVR5cGUsXG4gICAgICBkYXRhc2V0O1xuXG4gIGluZGV4QnkgPSBzZWxmLmluZGV4QnkoKSA/IHNlbGYuaW5kZXhCeSgpIDogRGF0YXZpei5kZWZhdWx0cy5pbmRleEJ5O1xuICBkZWxpbWV0ZXIgPSBEYXRhc2V0LmRlZmF1bHRzLmRlbGltZXRlcjtcbiAgaW5kZXhUYXJnZXQgPSBpbmRleEJ5LnNwbGl0KCcuJykuam9pbihkZWxpbWV0ZXIpO1xuXG4gIGxhYmVsU2V0ID0gc2VsZi5sYWJlbHMoKSB8fCBudWxsO1xuICBsYWJlbE1hcCA9IHNlbGYubGFiZWxNYXBwaW5nKCkgfHwgbnVsbDtcblxuICAvLyBNZXRyaWNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpZiAodHlwZW9mIHJlc3BvbnNlLnJlc3VsdCA9PSAnbnVtYmVyJyl7XG4gICAgLy9yZXR1cm4gbmV3IERhdGFzZXQocmVzcG9uc2UsIHtcbiAgICBkYXRhVHlwZSA9ICdzaW5ndWxhcic7XG4gICAgc2NoZW1hID0ge1xuICAgICAgcmVjb3JkczogJycsXG4gICAgICBzZWxlY3Q6IFt7XG4gICAgICAgIHBhdGg6ICdyZXN1bHQnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgbGFiZWw6ICdNZXRyaWMnXG4gICAgICB9XVxuICAgIH1cbiAgfVxuXG4gIC8vIEV2ZXJ5dGhpbmcgZWxzZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGlmIChyZXNwb25zZS5yZXN1bHQgaW5zdGFuY2VvZiBBcnJheSAmJiByZXNwb25zZS5yZXN1bHQubGVuZ3RoID4gMCl7XG5cbiAgICAvLyBJbnRlcnZhbCB3LyBzaW5nbGUgdmFsdWVcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKHJlc3BvbnNlLnJlc3VsdFswXS50aW1lZnJhbWUgJiYgKHR5cGVvZiByZXNwb25zZS5yZXN1bHRbMF0udmFsdWUgPT0gJ251bWJlcicgfHwgcmVzcG9uc2UucmVzdWx0WzBdLnZhbHVlID09IG51bGwpKSB7XG4gICAgICBkYXRhVHlwZSA9ICdjaHJvbm9sb2dpY2FsJztcbiAgICAgIHNjaGVtYSA9IHtcbiAgICAgICAgcmVjb3JkczogJ3Jlc3VsdCcsXG4gICAgICAgIHNlbGVjdDogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHBhdGg6IGluZGV4VGFyZ2V0LFxuICAgICAgICAgICAgdHlwZTogJ2RhdGUnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBwYXRoOiAndmFsdWUnLFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgICAgICAgIC8vIGZvcm1hdDogJzEwJ1xuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFN0YXRpYyBHcm91cEJ5XG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlmICh0eXBlb2YgcmVzcG9uc2UucmVzdWx0WzBdLnJlc3VsdCA9PSAnbnVtYmVyJyl7XG4gICAgICBkYXRhVHlwZSA9ICdjYXRlZ29yaWNhbCc7XG4gICAgICBzY2hlbWEgPSB7XG4gICAgICAgIHJlY29yZHM6ICdyZXN1bHQnLFxuICAgICAgICBzZWxlY3Q6IFtdXG4gICAgICB9O1xuICAgICAgZm9yICh2YXIga2V5IGluIHJlc3BvbnNlLnJlc3VsdFswXSl7XG4gICAgICAgIGlmIChyZXNwb25zZS5yZXN1bHRbMF0uaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkgIT09ICdyZXN1bHQnKXtcbiAgICAgICAgICBzY2hlbWEuc2VsZWN0LnB1c2goe1xuICAgICAgICAgICAgcGF0aDoga2V5LFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2NoZW1hLnNlbGVjdC5wdXNoKHtcbiAgICAgICAgcGF0aDogJ3Jlc3VsdCcsXG4gICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBHcm91cGVkIEludGVydmFsXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlmIChyZXNwb25zZS5yZXN1bHRbMF0udmFsdWUgaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICBkYXRhVHlwZSA9ICdjYXQtY2hyb25vbG9naWNhbCc7XG4gICAgICBzY2hlbWEgPSB7XG4gICAgICAgIHJlY29yZHM6ICdyZXN1bHQnLFxuICAgICAgICB1bnBhY2s6IHtcbiAgICAgICAgICBpbmRleDoge1xuICAgICAgICAgICAgcGF0aDogaW5kZXhUYXJnZXQsXG4gICAgICAgICAgICB0eXBlOiAnZGF0ZSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBwYXRoOiAndmFsdWUgLT4gcmVzdWx0JyxcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBrZXkgaW4gcmVzcG9uc2UucmVzdWx0WzBdLnZhbHVlWzBdKXtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnJlc3VsdFswXS52YWx1ZVswXS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleSAhPT0gJ3Jlc3VsdCcpe1xuICAgICAgICAgIHNjaGVtYS51bnBhY2subGFiZWwgPSB7XG4gICAgICAgICAgICBwYXRoOiAndmFsdWUgLT4gJyArIGtleSxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRnVubmVsXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlmICh0eXBlb2YgcmVzcG9uc2UucmVzdWx0WzBdID09ICdudW1iZXInICYmIHR5cGVvZiByZXNwb25zZS5yZXN1bHQuc3RlcHMgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgZGF0YVR5cGUgPSAnY2F0LW9yZGluYWwnO1xuICAgICAgc2NoZW1hID0ge1xuICAgICAgICByZWNvcmRzOiAnJyxcbiAgICAgICAgdW5wYWNrOiB7XG4gICAgICAgICAgaW5kZXg6IHtcbiAgICAgICAgICAgIHBhdGg6ICdzdGVwcyAtPiBldmVudF9jb2xsZWN0aW9uJyxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgcGF0aDogJ3Jlc3VsdCAtPiAnLFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZWxlY3QgVW5pcXVlXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlmICh0eXBlb2YgcmVzcG9uc2UucmVzdWx0WzBdID09ICdzdHJpbmcnIHx8IHR5cGVvZiByZXNwb25zZS5yZXN1bHRbMF0gPT0gJ251bWJlcicpe1xuICAgICAgZGF0YVR5cGUgPSAnbm9taW5hbCc7XG4gICAgICBkYXRhc2V0ID0gbmV3IERhdGFzZXQoKTtcbiAgICAgIGRhdGFzZXQuYXBwZW5kQ29sdW1uKCd1bmlxdWUgdmFsdWVzJywgW10pO1xuICAgICAgZWFjaChyZXNwb25zZS5yZXN1bHQsIGZ1bmN0aW9uKHJlc3VsdCwgaSl7XG4gICAgICAgIGRhdGFzZXQuYXBwZW5kUm93KHJlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBFeHRyYWN0aW9uXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlmIChkYXRhVHlwZSA9PT0gdm9pZCAwKSB7XG4gICAgICBkYXRhVHlwZSA9ICdleHRyYWN0aW9uJztcbiAgICAgIHNjaGVtYSA9IHsgcmVjb3JkczogJ3Jlc3VsdCcsIHNlbGVjdDogdHJ1ZSB9O1xuICAgIH1cblxuICB9XG5cbiAgZGF0YXNldCA9IGRhdGFzZXQgaW5zdGFuY2VvZiBEYXRhc2V0ID8gZGF0YXNldCA6IG5ldyBEYXRhc2V0KHJlc3BvbnNlLCBzY2hlbWEpO1xuXG4gIC8vIFNldCBkYXRhVHlwZVxuICBpZiAoZGF0YVR5cGUpIHtcbiAgICBzZWxmLmRhdGFUeXBlKGRhdGFUeXBlKTtcbiAgfVxuXG4gIHJldHVybiBkYXRhc2V0O1xufVxuIiwidmFyIGdldERhdGFzZXRTY2hlbWFzID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZ2V0RGF0YXNldFNjaGVtYXNcIiksXG4gICAgZ2V0RGVmYXVsdFRpdGxlID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZ2V0RGVmYXVsdFRpdGxlXCIpLFxuICAgIGdldFF1ZXJ5RGF0YVR5cGUgPSByZXF1aXJlKFwiLi4vaGVscGVycy9nZXRRdWVyeURhdGFUeXBlXCIpO1xuXG52YXIgRGF0YXNldCA9IHJlcXVpcmUoXCIuLi8uLi9kYXRhc2V0XCIpLFxuICAgIHBhcnNlUmF3RGF0YSA9IHJlcXVpcmUoXCIuL3BhcnNlUmF3RGF0YVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihyZXEpe1xuICB2YXIgZGF0YVR5cGUgPSBnZXRRdWVyeURhdGFUeXBlKHJlcS5xdWVyaWVzWzBdKTtcblxuICBpZiAoZGF0YVR5cGUgPT09IFwiZXh0cmFjdGlvblwiKSB7XG4gICAgdGhpcy5kYXRhc2V0ID0gZ2V0RGF0YXNldFNjaGVtYXMuZXh0cmFjdGlvbihyZXEpO1xuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMucGFyc2VSYXdEYXRhKHJlcS5kYXRhIGluc3RhbmNlb2YgQXJyYXkgPyByZXEuZGF0YVswXSA6IHJlcS5kYXRhKTtcbiAgfVxuXG4gIC8vIFNldCBkYXRhVHlwZVxuICB0aGlzLmRhdGFUeXBlKGRhdGFUeXBlKTtcblxuICAvLyBVcGRhdGUgdGhlIGRlZmF1bHQgdGl0bGUgZXZlcnkgdGltZVxuICB0aGlzLnZpZXcuZGVmYXVsdHMudGl0bGUgPSBnZXREZWZhdWx0VGl0bGUuY2FsbCh0aGlzLCByZXEpO1xuXG4gIC8vIFVwZGF0ZSB0aGUgYWN0aXZlIHRpdGxlIGlmIG5vdCBzZXRcbiAgaWYgKCF0aGlzLnRpdGxlKCkpIHtcbiAgICB0aGlzLnRpdGxlKHRoaXMudmlldy5kZWZhdWx0cy50aXRsZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwidmFyIERhdGF2aXogPSByZXF1aXJlKFwiLi4vZGF0YXZpelwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgbG9hZGVyO1xuICBpZiAodGhpcy52aWV3Ll9yZW5kZXJlZCkge1xuICAgIHRoaXMuZGVzdHJveSgpO1xuICB9XG4gIGlmICh0aGlzLmVsKCkpIHtcbiAgICB0aGlzLmVsKCkuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBsb2FkZXIgPSBEYXRhdml6LmxpYnJhcmllc1t0aGlzLnZpZXcubG9hZGVyLmxpYnJhcnldW3RoaXMudmlldy5sb2FkZXIuY2hhcnRUeXBlXTtcbiAgICBpZiAobG9hZGVyLmluaXRpYWxpemUpIHtcbiAgICAgIGxvYWRlci5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIGlmIChsb2FkZXIucmVuZGVyKSB7XG4gICAgICBsb2FkZXIucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIHRoaXMudmlldy5fcHJlcGFyZWQgPSB0cnVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5zb3J0R3JvdXBzO1xuICB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLnNvcnRHcm91cHMgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcnVuU29ydEdyb3Vwcy5jYWxsKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIHJ1blNvcnRHcm91cHMoKXtcbiAgdmFyIGR0ID0gdGhpcy5kYXRhVHlwZSgpO1xuICBpZiAoIXRoaXMuc29ydEdyb3VwcygpKSByZXR1cm47XG4gIGlmICgoZHQgJiYgZHQuaW5kZXhPZihcImNocm9ub2xvZ2ljYWxcIikgPiAtMSkgfHwgdGhpcy5kYXRhKClbMF0ubGVuZ3RoID4gMikge1xuICAgIC8vIFNvcnQgY29sdW1ucyBieSBTdW0gKG4gdmFsdWVzKVxuICAgIHRoaXMuZGF0YXNldC5zb3J0Q29sdW1ucyh0aGlzLnNvcnRHcm91cHMoKSwgdGhpcy5kYXRhc2V0LmdldENvbHVtblN1bSk7XG4gIH1cbiAgZWxzZSBpZiAoZHQgJiYgKGR0LmluZGV4T2YoXCJjYXQtXCIpID4gLTEgfHwgZHQuaW5kZXhPZihcImNhdGVnb3JpY2FsXCIpID4gLTEpKSB7XG4gICAgLy8gU29ydCByb3dzIGJ5IFN1bSAoMSB2YWx1ZSlcbiAgICB0aGlzLmRhdGFzZXQuc29ydFJvd3ModGhpcy5zb3J0R3JvdXBzKCksIHRoaXMuZGF0YXNldC5nZXRSb3dTdW0pO1xuICB9XG4gIHJldHVybjtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXS5zb3J0SW50ZXJ2YWxzO1xuICB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdLnNvcnRJbnRlcnZhbHMgPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcnVuU29ydEludGVydmFscy5jYWxsKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIHJ1blNvcnRJbnRlcnZhbHMoKXtcbiAgaWYgKCF0aGlzLnNvcnRJbnRlcnZhbHMoKSkgcmV0dXJuO1xuICAvLyBTb3J0IHJvd3MgYnkgaW5kZXhcbiAgdGhpcy5kYXRhc2V0LnNvcnRSb3dzKHRoaXMuc29ydEludGVydmFscygpKTtcbiAgcmV0dXJuO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihib29sKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3WydhdHRyaWJ1dGVzJ11bJ3N0YWNrZWQnXTtcbiAgdGhpcy52aWV3WydhdHRyaWJ1dGVzJ11bJ3N0YWNrZWQnXSA9IGJvb2wgPyB0cnVlIDogZmFsc2U7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy52aWV3W1wiYXR0cmlidXRlc1wiXVtcInRpdGxlXCJdO1xuICB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdW1widGl0bGVcIl0gPSAoc3RyID8gU3RyaW5nKHN0cikgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihudW0pe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnZpZXdbXCJhdHRyaWJ1dGVzXCJdW1wid2lkdGhcIl07XG4gIHRoaXMudmlld1tcImF0dHJpYnV0ZXNcIl1bXCJ3aWR0aFwiXSA9ICghaXNOYU4ocGFyc2VJbnQobnVtKSkgPyBwYXJzZUludChudW0pIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcblxuICBpZiAodGhpcy5sYWJlbE1hcHBpbmcoKSkge1xuICAgIHRoaXMubGFiZWxNYXBwaW5nKHRoaXMubGFiZWxNYXBwaW5nKCkpO1xuICB9XG5cbiAgaWYgKHRoaXMuY29sb3JNYXBwaW5nKCkpIHtcbiAgICB0aGlzLmNvbG9yTWFwcGluZyh0aGlzLmNvbG9yTWFwcGluZygpKTtcbiAgfVxuXG4gIGlmICh0aGlzLnNvcnRHcm91cHMoKSkge1xuICAgIHRoaXMuc29ydEdyb3Vwcyh0aGlzLnNvcnRHcm91cHMoKSk7XG4gIH1cblxuICBpZiAodGhpcy5zb3J0SW50ZXJ2YWxzKCkpIHtcbiAgICB0aGlzLnNvcnRJbnRlcnZhbHModGhpcy5zb3J0SW50ZXJ2YWxzKCkpO1xuICB9XG5cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVybCwgY2IpIHtcbiAgdmFyIGRvYyA9IGRvY3VtZW50O1xuICB2YXIgaGFuZGxlcjtcbiAgdmFyIGhlYWQgPSBkb2MuaGVhZCB8fCBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpO1xuXG4gIC8vIGxvYWRpbmcgY29kZSBib3Jyb3dlZCBkaXJlY3RseSBmcm9tIExBQmpzIGl0c2VsZlxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjaGVjayBpZiByZWYgaXMgc3RpbGwgYSBsaXZlIG5vZGUgbGlzdFxuICAgIGlmICgnaXRlbScgaW4gaGVhZCkge1xuICAgICAgLy8gYXBwZW5kX3RvIG5vZGUgbm90IHlldCByZWFkeVxuICAgICAgaWYgKCFoZWFkWzBdKSB7XG4gICAgICAgIHNldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwgMjUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyByZWFzc2lnbiBmcm9tIGxpdmUgbm9kZSBsaXN0IHJlZiB0byBwdXJlIG5vZGUgcmVmIC0tIGF2b2lkcyBuYXN0eSBJRSBidWcgd2hlcmUgY2hhbmdlcyB0byBET00gaW52YWxpZGF0ZSBsaXZlIG5vZGUgbGlzdHNcbiAgICAgIGhlYWQgPSBoZWFkWzBdO1xuICAgIH1cbiAgICB2YXIgc2NyaXB0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIiksXG4gICAgc2NyaXB0ZG9uZSA9IGZhbHNlO1xuICAgIHNjcmlwdC5vbmxvYWQgPSBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKChzY3JpcHQucmVhZHlTdGF0ZSAmJiBzY3JpcHQucmVhZHlTdGF0ZSAhPT0gXCJjb21wbGV0ZVwiICYmIHNjcmlwdC5yZWFkeVN0YXRlICE9PSBcImxvYWRlZFwiKSB8fCBzY3JpcHRkb25lKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHNjcmlwdC5vbmxvYWQgPSBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgIHNjcmlwdGRvbmUgPSB0cnVlO1xuICAgICAgY2IoKTtcbiAgICB9O1xuICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgaGVhZC5pbnNlcnRCZWZvcmUoc2NyaXB0LCBoZWFkLmZpcnN0Q2hpbGQpO1xuICB9LCAwKTtcblxuICAvLyByZXF1aXJlZDogc2hpbSBmb3IgRkYgPD0gMy41IG5vdCBoYXZpbmcgZG9jdW1lbnQucmVhZHlTdGF0ZVxuICBpZiAoZG9jLnJlYWR5U3RhdGUgPT09IG51bGwgJiYgZG9jLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBkb2MucmVhZHlTdGF0ZSA9IFwibG9hZGluZ1wiO1xuICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBoYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICAgIGRvYy5yZWFkeVN0YXRlID0gXCJjb21wbGV0ZVwiO1xuICAgIH0sIGZhbHNlKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXJsLCBjYikge1xuICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgbGluay5zZXRBdHRyaWJ1dGUoJ3JlbCcsICdzdHlsZXNoZWV0Jyk7XG4gIGxpbmsudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gIGxpbmsuaHJlZiA9IHVybDtcbiAgY2IoKTtcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF9pbnB1dCkge1xuICAvLyBJZiBpdCBoYXMgMyBvciBmZXdlciBzaWcgZmlncyBhbHJlYWR5LCBqdXN0IHJldHVybiB0aGUgbnVtYmVyLlxuICB2YXIgaW5wdXQgPSBOdW1iZXIoX2lucHV0KSxcbiAgICAgIHNjaU5vID0gaW5wdXQudG9QcmVjaXNpb24oMyksXG4gICAgICBwcmVmaXggPSBcIlwiLFxuICAgICAgc3VmZml4ZXMgPSBbXCJcIiwgXCJrXCIsIFwiTVwiLCBcIkJcIiwgXCJUXCJdO1xuXG4gIGlmIChOdW1iZXIoc2NpTm8pID09IGlucHV0ICYmIFN0cmluZyhpbnB1dCkubGVuZ3RoIDw9IDQpIHtcbiAgICByZXR1cm4gU3RyaW5nKGlucHV0KTtcbiAgfVxuXG4gIGlmKGlucHV0ID49IDEgfHwgaW5wdXQgPD0gLTEpIHtcbiAgICBpZihpbnB1dCA8IDApe1xuICAgICAgLy9QdWxsIG9mZiB0aGUgbmVnYXRpdmUgc2lkZSBhbmQgc3Rhc2ggdGhhdC5cbiAgICAgIGlucHV0ID0gLWlucHV0O1xuICAgICAgcHJlZml4ID0gXCItXCI7XG4gICAgfVxuICAgIHJldHVybiBwcmVmaXggKyByZWN1cnNlKGlucHV0LCAwKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gaW5wdXQudG9QcmVjaXNpb24oMyk7XG4gIH1cblxuICBmdW5jdGlvbiByZWN1cnNlKGlucHV0LCBpdGVyYXRpb24pIHtcbiAgICB2YXIgaW5wdXQgPSBTdHJpbmcoaW5wdXQpO1xuICAgIHZhciBzcGxpdCA9IGlucHV0LnNwbGl0KFwiLlwiKTtcbiAgICAvLyBJZiB0aGVyZSdzIGEgZG90XG4gICAgaWYoc3BsaXQubGVuZ3RoID4gMSkge1xuICAgICAgLy8gS2VlcCB0aGUgbGVmdCBoYW5kIHNpZGUgb25seVxuICAgICAgaW5wdXQgPSBzcGxpdFswXTtcbiAgICAgIHZhciByaHMgPSBzcGxpdFsxXTtcbiAgICAgIC8vIElmIHRoZSBsZWZ0LWhhbmQgc2lkZSBpcyB0b28gc2hvcnQsIHBhZCB1bnRpbCBpdCBoYXMgMyBkaWdpdHNcbiAgICAgIGlmIChpbnB1dC5sZW5ndGggPT0gMiAmJiByaHMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBQYWQgd2l0aCByaWdodC1oYW5kIHNpZGUgaWYgcG9zc2libGVcbiAgICAgICAgaWYgKHJocy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgaW5wdXQgPSBpbnB1dCArIFwiLlwiICsgcmhzLmNoYXJBdCgwKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBQYWQgd2l0aCB6ZXJvZXMgaWYgeW91IG11c3RcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaW5wdXQgKz0gXCIwXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGlucHV0Lmxlbmd0aCA9PSAxICYmIHJocy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlucHV0ID0gaW5wdXQgKyBcIi5cIiArIHJocy5jaGFyQXQoMCk7XG4gICAgICAgIC8vIFBhZCB3aXRoIHJpZ2h0LWhhbmQgc2lkZSBpZiBwb3NzaWJsZVxuICAgICAgICBpZihyaHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGlucHV0ICs9IHJocy5jaGFyQXQoMSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUGFkIHdpdGggemVyb2VzIGlmIHlvdSBtdXN0XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlucHV0ICs9IFwiMFwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBudW1OdW1lcmFscyA9IGlucHV0Lmxlbmd0aDtcbiAgICAvLyBpZiBpdCBoYXMgYSBwZXJpb2QsIHRoZW4gbnVtTnVtZXJhbHMgaXMgMSBzbWFsbGVyIHRoYW4gdGhlIHN0cmluZyBsZW5ndGg6XG4gICAgaWYgKGlucHV0LnNwbGl0KFwiLlwiKS5sZW5ndGggPiAxKSB7XG4gICAgICBudW1OdW1lcmFscy0tO1xuICAgIH1cbiAgICBpZihudW1OdW1lcmFscyA8PSAzKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKGlucHV0KSArIHN1ZmZpeGVzW2l0ZXJhdGlvbl07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHJlY3Vyc2UoTnVtYmVyKGlucHV0KSAvIDEwMDAsIGl0ZXJhdGlvbiArIDEpO1xuICAgIH1cbiAgfVxufTtcbiIsIjsoZnVuY3Rpb24gKGYpIHtcbiAgLy8gUmVxdWlyZUpTXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShcImtlZW5cIiwgW10sIGZ1bmN0aW9uKCl7IHJldHVybiBmKCk7IH0pO1xuICB9XG4gIC8vIENvbW1vbkpTXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmKCk7XG4gIH1cbiAgLy8gR2xvYmFsXG4gIHZhciBnID0gbnVsbDtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBnID0gd2luZG93O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBnID0gZ2xvYmFsO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgZyA9IHNlbGY7XG4gIH1cbiAgaWYgKGcpIHtcbiAgICBnLktlZW4gPSBmKCk7XG4gIH1cbn0pKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgS2VlbiA9IHJlcXVpcmUoXCIuL2NvcmVcIiksXG4gICAgICBleHRlbmQgPSByZXF1aXJlKFwiLi9jb3JlL3V0aWxzL2V4dGVuZFwiKTtcblxuICBleHRlbmQoS2Vlbi5wcm90b3R5cGUsIHtcbiAgICBcImFkZEV2ZW50XCIgICAgICAgICAgICA6IHJlcXVpcmUoXCIuL2NvcmUvbGliL2FkZEV2ZW50XCIpLFxuICAgIFwiYWRkRXZlbnRzXCIgICAgICAgICAgIDogcmVxdWlyZShcIi4vY29yZS9saWIvYWRkRXZlbnRzXCIpLFxuICAgIFwic2V0R2xvYmFsUHJvcGVydGllc1wiIDogcmVxdWlyZShcIi4vY29yZS9saWIvc2V0R2xvYmFsUHJvcGVydGllc1wiKSxcbiAgICBcInRyYWNrRXh0ZXJuYWxMaW5rXCIgICA6IHJlcXVpcmUoXCIuL2NvcmUvbGliL3RyYWNrRXh0ZXJuYWxMaW5rXCIpLFxuICAgIFwiZ2V0XCIgICAgICAgICAgICAgICAgIDogcmVxdWlyZShcIi4vY29yZS9saWIvZ2V0XCIpLFxuICAgIFwicG9zdFwiICAgICAgICAgICAgICAgIDogcmVxdWlyZShcIi4vY29yZS9saWIvcG9zdFwiKSxcbiAgICBcInB1dFwiICAgICAgICAgICAgICAgICA6IHJlcXVpcmUoXCIuL2NvcmUvbGliL3Bvc3RcIiksXG4gICAgXCJydW5cIiAgICAgICAgICAgICAgICAgOiByZXF1aXJlKFwiLi9jb3JlL2xpYi9ydW5cIiksXG4gICAgXCJkcmF3XCIgICAgICAgICAgICAgICAgOiByZXF1aXJlKFwiLi9kYXRhdml6L2V4dGVuc2lvbnMvZHJhd1wiKVxuICB9KTtcblxuICBLZWVuLlF1ZXJ5ID0gcmVxdWlyZShcIi4vY29yZS9xdWVyeVwiKTtcbiAgS2Vlbi5SZXF1ZXN0ID0gcmVxdWlyZShcIi4vY29yZS9yZXF1ZXN0XCIpO1xuICBLZWVuLkRhdGFzZXQgPSByZXF1aXJlKFwiLi9kYXRhc2V0XCIpO1xuICBLZWVuLkRhdGF2aXogPSByZXF1aXJlKFwiLi9kYXRhdml6XCIpO1xuXG4gIEtlZW4uQmFzZTY0ID0gcmVxdWlyZShcIi4vY29yZS91dGlscy9iYXNlNjRcIik7XG4gIEtlZW4uU3Bpbm5lciA9IHJlcXVpcmUoXCJzcGluLmpzXCIpO1xuXG4gIEtlZW4udXRpbHMgPSB7XG4gICAgXCJkb21yZWFkeVwiICAgICA6IHJlcXVpcmUoXCJkb21yZWFkeVwiKSxcbiAgICBcImVhY2hcIiAgICAgICAgIDogcmVxdWlyZShcIi4vY29yZS91dGlscy9lYWNoXCIpLFxuICAgIFwiZXh0ZW5kXCIgICAgICAgOiBleHRlbmQsXG4gICAgXCJwYXJzZVBhcmFtc1wiICA6IHJlcXVpcmUoXCIuL2NvcmUvdXRpbHMvcGFyc2VQYXJhbXNcIiksXG4gICAgXCJwcmV0dHlOdW1iZXJcIiA6IHJlcXVpcmUoXCIuL2RhdGF2aXovdXRpbHMvcHJldHR5TnVtYmVyXCIpXG4gICAgLy8gXCJsb2FkU2NyaXB0XCIgICA6IHJlcXVpcmUoXCIuL2RhdGF2aXovdXRpbHMvbG9hZFNjcmlwdFwiKSxcbiAgICAvLyBcImxvYWRTdHlsZVwiICAgIDogcmVxdWlyZShcIi4vZGF0YXZpei91dGlscy9sb2FkU3R5bGVcIilcbiAgfTtcblxuICByZXF1aXJlKFwiLi9kYXRhdml6L2FkYXB0ZXJzL2tlZW4taW9cIikoKTtcbiAgcmVxdWlyZShcIi4vZGF0YXZpei9hZGFwdGVycy9nb29nbGVcIikoKTtcbiAgcmVxdWlyZShcIi4vZGF0YXZpei9hZGFwdGVycy9jM1wiKSgpO1xuICByZXF1aXJlKFwiLi9kYXRhdml6L2FkYXB0ZXJzL2NoYXJ0anNcIikoKTtcblxuICBpZiAoS2Vlbi5sb2FkZWQpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBLZWVuLnV0aWxzLmRvbXJlYWR5KGZ1bmN0aW9uKCl7XG4gICAgICAgIEtlZW4uZW1pdChcInJlYWR5XCIpO1xuICAgICAgfSk7XG4gICAgfSwgMCk7XG4gIH1cbiAgcmVxdWlyZShcIi4vY29yZS9hc3luY1wiKSgpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gS2VlbjtcbiAgcmV0dXJuIEtlZW47XG59KTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTQgSUJNIENvcnAuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlICdMaWNlbnNlJyk7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuICdBUyBJUycgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuLyoqXG4gKiBDYXB0dXJlcyBtaWNyb3Bob25lIGlucHV0IGZyb20gdGhlIGJyb3dzZXIuXG4gKiBXb3JrcyBhdCBsZWFzdCBvbiBsYXRlc3QgdmVyc2lvbnMgb2YgRmlyZWZveCBhbmQgQ2hyb21lXG4gKi9cbmZ1bmN0aW9uIE1pY3JvcGhvbmUoX29wdGlvbnMpIHtcbiAgdmFyIG9wdGlvbnMgPSBfb3B0aW9ucyB8fCB7fTtcblxuICAvLyB3ZSByZWNvcmQgaW4gbW9ubyBiZWNhdXNlIHRoZSBzcGVlY2ggcmVjb2duaXRpb24gc2VydmljZVxuICAvLyBkb2VzIG5vdCBzdXBwb3J0IHN0ZXJlby5cbiAgdGhpcy5idWZmZXJTaXplID0gb3B0aW9ucy5idWZmZXJTaXplIHx8IDgxOTI7XG4gIHRoaXMuaW5wdXRDaGFubmVscyA9IG9wdGlvbnMuaW5wdXRDaGFubmVscyB8fCAxO1xuICB0aGlzLm91dHB1dENoYW5uZWxzID0gb3B0aW9ucy5vdXRwdXRDaGFubmVscyB8fCAxO1xuICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICB0aGlzLnJlcXVlc3RlZEFjY2VzcyA9IGZhbHNlO1xuICB0aGlzLnNhbXBsZVJhdGUgPSAxNjAwMDtcbiAgLy8gYXV4aWxpYXIgYnVmZmVyIHRvIGtlZXAgdW51c2VkIHNhbXBsZXMgKHVzZWQgd2hlbiBkb2luZyBkb3duc2FtcGxpbmcpXG4gIHRoaXMuYnVmZmVyVW51c2VkU2FtcGxlcyA9IG5ldyBGbG9hdDMyQXJyYXkoMCk7XG5cbiAgLy8gQ2hyb21lIG9yIEZpcmVmb3ggb3IgSUUgVXNlciBtZWRpYVxuICBpZiAoIW5hdmlnYXRvci5nZXRVc2VyTWVkaWEpIHtcbiAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhO1xuICB9XG5cbn1cblxuLyoqXG4gKiBDYWxsZWQgd2hlbiB0aGUgdXNlciByZWplY3QgdGhlIHVzZSBvZiB0aGUgbWljaHJvcGhvbmVcbiAqIEBwYXJhbSAgZXJyb3IgVGhlIGVycm9yXG4gKi9cbk1pY3JvcGhvbmUucHJvdG90eXBlLm9uUGVybWlzc2lvblJlamVjdGVkID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCdNaWNyb3Bob25lLm9uUGVybWlzc2lvblJlamVjdGVkKCknKTtcbiAgdGhpcy5yZXF1ZXN0ZWRBY2Nlc3MgPSBmYWxzZTtcbiAgdGhpcy5vbkVycm9yKCdQZXJtaXNzaW9uIHRvIGFjY2VzcyB0aGUgbWljcm9waG9uZSByZWpldGVkLicpO1xufTtcblxuTWljcm9waG9uZS5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uKGVycm9yKSB7XG4gIGNvbnNvbGUubG9nKCdNaWNyb3Bob25lLm9uRXJyb3IoKTonLCBlcnJvcik7XG59O1xuXG4vKipcbiAqIENhbGxlZCB3aGVuIHRoZSB1c2VyIGF1dGhvcml6ZXMgdGhlIHVzZSBvZiB0aGUgbWljcm9waG9uZS5cbiAqIEBwYXJhbSAge09iamVjdH0gc3RyZWFtIFRoZSBTdHJlYW0gdG8gY29ubmVjdCB0b1xuICpcbiAqL1xuTWljcm9waG9uZS5wcm90b3R5cGUub25NZWRpYVN0cmVhbSA9ICBmdW5jdGlvbihzdHJlYW0pIHtcbiAgdmFyIEF1ZGlvQ3R4ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuXG4gIGlmICghQXVkaW9DdHgpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdWRpb0NvbnRleHQgbm90IGF2YWlsYWJsZScpO1xuXG4gIGlmICghdGhpcy5hdWRpb0NvbnRleHQpXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9DdHgoKTtcblxuICB2YXIgZ2FpbiA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgdmFyIGF1ZGlvSW5wdXQgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZShzdHJlYW0pO1xuXG4gIGF1ZGlvSW5wdXQuY29ubmVjdChnYWluKTtcblxuICB0aGlzLm1pYyA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZVNjcmlwdFByb2Nlc3Nvcih0aGlzLmJ1ZmZlclNpemUsXG4gICAgdGhpcy5pbnB1dENoYW5uZWxzLCB0aGlzLm91dHB1dENoYW5uZWxzKTtcblxuICAvLyB1bmNvbW1lbnQgdGhlIGZvbGxvd2luZyBsaW5lIGlmIHlvdSB3YW50IHRvIHVzZSB5b3VyIG1pY3JvcGhvbmUgc2FtcGxlIHJhdGVcbiAgLy90aGlzLnNhbXBsZVJhdGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlO1xuICBjb25zb2xlLmxvZygnTWljcm9waG9uZS5vbk1lZGlhU3RyZWFtKCk6IHNhbXBsaW5nIHJhdGUgaXM6JywgdGhpcy5zYW1wbGVSYXRlKTtcblxuICB0aGlzLm1pYy5vbmF1ZGlvcHJvY2VzcyA9IHRoaXMuX29uYXVkaW9wcm9jZXNzLmJpbmQodGhpcyk7XG4gIHRoaXMuc3RyZWFtID0gc3RyZWFtO1xuXG4gIGdhaW4uY29ubmVjdCh0aGlzLm1pYyk7XG4gIHRoaXMubWljLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICB0aGlzLnJlY29yZGluZyA9IHRydWU7XG4gIHRoaXMucmVxdWVzdGVkQWNjZXNzID0gZmFsc2U7XG4gIHRoaXMub25TdGFydFJlY29yZGluZygpO1xufTtcblxuLyoqXG4gKiBjYWxsYmFjayB0aGF0IGlzIGJlaW5nIHVzZWQgYnkgdGhlIG1pY3JvcGhvbmVcbiAqIHRvIHNlbmQgYXVkaW8gY2h1bmtzLlxuICogQHBhcmFtICB7b2JqZWN0fSBkYXRhIGF1ZGlvXG4gKi9cbk1pY3JvcGhvbmUucHJvdG90eXBlLl9vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgaWYgKCF0aGlzLnJlY29yZGluZykge1xuICAgIC8vIFdlIHNwZWFrIGJ1dCB3ZSBhcmUgbm90IHJlY29yZGluZ1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFNpbmdsZSBjaGFubmVsXG4gIHZhciBjaGFuID0gZGF0YS5pbnB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTsgIFxuICBcbiAgLy9yZXNhbXBsZXIodGhpcy5hdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSxkYXRhLmlucHV0QnVmZmVyLHRoaXMub25BdWRpbyk7XG5cbiAgdGhpcy5vbkF1ZGlvKHRoaXMuX2V4cG9ydERhdGFCdWZmZXJUbzE2S2h6KG5ldyBGbG9hdDMyQXJyYXkoY2hhbikpKTtcblxuICAvL2V4cG9ydCB3aXRoIG1pY3JvcGhvbmUgbWh6LCByZW1lbWJlciB0byB1cGRhdGUgdGhlIHRoaXMuc2FtcGxlUmF0ZVxuICAvLyB3aXRoIHRoZSBzYW1wbGUgcmF0ZSBmcm9tIHlvdXIgbWljcm9waG9uZVxuICAvLyB0aGlzLm9uQXVkaW8odGhpcy5fZXhwb3J0RGF0YUJ1ZmZlcihuZXcgRmxvYXQzMkFycmF5KGNoYW4pKSk7XG5cbn07XG5cbi8qKlxuICogU3RhcnQgdGhlIGF1ZGlvIHJlY29yZGluZ1xuICovXG5NaWNyb3Bob25lLnByb3RvdHlwZS5yZWNvcmQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKXtcbiAgICB0aGlzLm9uRXJyb3IoJ0Jyb3dzZXIgZG9lc25cXCd0IHN1cHBvcnQgbWljcm9waG9uZSBpbnB1dCcpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGhpcy5yZXF1ZXN0ZWRBY2Nlc3MpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLnJlcXVlc3RlZEFjY2VzcyA9IHRydWU7XG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoeyBhdWRpbzogdHJ1ZSB9LFxuICAgIHRoaXMub25NZWRpYVN0cmVhbS5iaW5kKHRoaXMpLCAvLyBNaWNyb3Bob25lIHBlcm1pc3Npb24gZ3JhbnRlZFxuICAgIHRoaXMub25QZXJtaXNzaW9uUmVqZWN0ZWQuYmluZCh0aGlzKSk7IC8vIE1pY3JvcGhvbmUgcGVybWlzc2lvbiByZWplY3RlZFxufTtcblxuLyoqXG4gKiBTdG9wIHRoZSBhdWRpbyByZWNvcmRpbmdcbiAqL1xuTWljcm9waG9uZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMucmVjb3JkaW5nKVxuICAgIHJldHVybjtcbiAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZTtcbiAgdGhpcy5zdHJlYW0uc3RvcCgpO1xuICB0aGlzLnJlcXVlc3RlZEFjY2VzcyA9IGZhbHNlO1xuICB0aGlzLm1pYy5kaXNjb25uZWN0KDApO1xuICB0aGlzLm1pYyA9IG51bGw7XG4gIHRoaXMub25TdG9wUmVjb3JkaW5nKCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBCbG9iIHR5cGU6ICdhdWRpby9sMTYnIHdpdGggdGhlIGNodW5rIGFuZCBkb3duc2FtcGxpbmcgdG8gMTYga0h6XG4gKiBjb21pbmcgZnJvbSB0aGUgbWljcm9waG9uZS5cbiAqIEV4cGxhbmF0aW9uIGZvciB0aGUgbWF0aDogVGhlIHJhdyB2YWx1ZXMgY2FwdHVyZWQgZnJvbSB0aGUgV2ViIEF1ZGlvIEFQSSBhcmVcbiAqIGluIDMyLWJpdCBGbG9hdGluZyBQb2ludCwgYmV0d2VlbiAtMSBhbmQgMSAocGVyIHRoZSBzcGVjaWZpY2F0aW9uKS5cbiAqIFRoZSB2YWx1ZXMgZm9yIDE2LWJpdCBQQ00gcmFuZ2UgYmV0d2VlbiAtMzI3NjggYW5kICszMjc2NyAoMTYtYml0IHNpZ25lZCBpbnRlZ2VyKS5cbiAqIE11bHRpcGx5IHRvIGNvbnRyb2wgdGhlIHZvbHVtZSBvZiB0aGUgb3V0cHV0LiBXZSBzdG9yZSBpbiBsaXR0bGUgZW5kaWFuLlxuICogQHBhcmFtICB7T2JqZWN0fSBidWZmZXIgTWljcm9waG9uZSBhdWRpbyBjaHVua1xuICogQHJldHVybiB7QmxvYn0gJ2F1ZGlvL2wxNicgY2h1bmtcbiAqIEBkZXByZWNhdGVkIFRoaXMgbWV0aG9kIGlzIGRlcHJhY2F0ZWRcbiAqL1xuTWljcm9waG9uZS5wcm90b3R5cGUuX2V4cG9ydERhdGFCdWZmZXJUbzE2S2h6ID0gZnVuY3Rpb24oYnVmZmVyTmV3U2FtcGxlcykge1xuICB2YXIgYnVmZmVyID0gbnVsbCxcbiAgICBuZXdTYW1wbGVzID0gYnVmZmVyTmV3U2FtcGxlcy5sZW5ndGgsXG4gICAgdW51c2VkU2FtcGxlcyA9IHRoaXMuYnVmZmVyVW51c2VkU2FtcGxlcy5sZW5ndGg7ICAgXG4gICAgXG5cbiAgaWYgKHVudXNlZFNhbXBsZXMgPiAwKSB7XG4gICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSh1bnVzZWRTYW1wbGVzICsgbmV3U2FtcGxlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1bnVzZWRTYW1wbGVzOyArK2kpIHtcbiAgICAgIGJ1ZmZlcltpXSA9IHRoaXMuYnVmZmVyVW51c2VkU2FtcGxlc1tpXTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IG5ld1NhbXBsZXM7ICsraSkge1xuICAgICAgYnVmZmVyW3VudXNlZFNhbXBsZXMgKyBpXSA9IGJ1ZmZlck5ld1NhbXBsZXNbaV07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJ1ZmZlciA9IGJ1ZmZlck5ld1NhbXBsZXM7XG4gIH1cblxuICAvLyBkb3duc2FtcGxpbmcgdmFyaWFibGVzXG4gIHZhciBmaWx0ZXIgPSBbXG4gICAgICAtMC4wMzc5MzUsIC0wLjAwMDg5MDI0LCAwLjA0MDE3MywgMC4wMTk5ODksIDAuMDA0Nzc5MiwgLTAuMDU4Njc1LCAtMC4wNTY0ODcsXG4gICAgICAtMC4wMDQwNjUzLCAwLjE0NTI3LCAwLjI2OTI3LCAwLjMzOTEzLCAwLjI2OTI3LCAwLjE0NTI3LCAtMC4wMDQwNjUzLCAtMC4wNTY0ODcsXG4gICAgICAtMC4wNTg2NzUsIDAuMDA0Nzc5MiwgMC4wMTk5ODksIDAuMDQwMTczLCAtMC4wMDA4OTAyNCwgLTAuMDM3OTM1XG4gICAgXSxcbiAgICBzYW1wbGluZ1JhdGVSYXRpbyA9IHRoaXMuYXVkaW9Db250ZXh0LnNhbXBsZVJhdGUgLyAxNjAwMCxcbiAgICBuT3V0cHV0U2FtcGxlcyA9IE1hdGguZmxvb3IoKGJ1ZmZlci5sZW5ndGggLSBmaWx0ZXIubGVuZ3RoKSAvIChzYW1wbGluZ1JhdGVSYXRpbykpICsgMSxcbiAgICBwY21FbmNvZGVkQnVmZmVyMTZrID0gbmV3IEFycmF5QnVmZmVyKG5PdXRwdXRTYW1wbGVzICogMiksXG4gICAgZGF0YVZpZXcxNmsgPSBuZXcgRGF0YVZpZXcocGNtRW5jb2RlZEJ1ZmZlcjE2ayksXG4gICAgaW5kZXggPSAwLFxuICAgIHZvbHVtZSA9IDB4N0ZGRiwgLy9yYW5nZSBmcm9tIDAgdG8gMHg3RkZGIHRvIGNvbnRyb2wgdGhlIHZvbHVtZVxuICAgIG5PdXQgPSAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpICsgZmlsdGVyLmxlbmd0aCAtIDEgPCBidWZmZXIubGVuZ3RoOyBpID0gTWF0aC5yb3VuZChzYW1wbGluZ1JhdGVSYXRpbyAqIG5PdXQpKSB7XG4gICAgdmFyIHNhbXBsZSA9IDA7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBmaWx0ZXIubGVuZ3RoOyArK2opIHtcbiAgICAgIHNhbXBsZSArPSBidWZmZXJbaSArIGpdICogZmlsdGVyW2pdO1xuICAgIH1cbiAgICBzYW1wbGUgKj0gdm9sdW1lO1xuICAgIGRhdGFWaWV3MTZrLnNldEludDE2KGluZGV4LCBzYW1wbGUsIHRydWUpOyAvLyAndHJ1ZScgLT4gbWVhbnMgbGl0dGxlIGVuZGlhblxuICAgIGluZGV4ICs9IDI7XG4gICAgbk91dCsrO1xuICB9XG5cbiAgdmFyIGluZGV4U2FtcGxlQWZ0ZXJMYXN0VXNlZCA9IE1hdGgucm91bmQoc2FtcGxpbmdSYXRlUmF0aW8gKiBuT3V0KTtcbiAgdmFyIHJlbWFpbmluZyA9IGJ1ZmZlci5sZW5ndGggLSBpbmRleFNhbXBsZUFmdGVyTGFzdFVzZWQ7XG4gIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgdGhpcy5idWZmZXJVbnVzZWRTYW1wbGVzID0gbmV3IEZsb2F0MzJBcnJheShyZW1haW5pbmcpO1xuICAgIGZvciAoaSA9IDA7IGkgPCByZW1haW5pbmc7ICsraSkge1xuICAgICAgdGhpcy5idWZmZXJVbnVzZWRTYW1wbGVzW2ldID0gYnVmZmVyW2luZGV4U2FtcGxlQWZ0ZXJMYXN0VXNlZCArIGldO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLmJ1ZmZlclVudXNlZFNhbXBsZXMgPSBuZXcgRmxvYXQzMkFycmF5KDApO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBCbG9iKFtkYXRhVmlldzE2a10sIHtcbiAgICB0eXBlOiAnYXVkaW8vbDE2J1xuICB9KTtcbiAgfTtcblxuICBcbiAgXG4vLyBuYXRpdmUgd2F5IG9mIHJlc2FtcGxpbmcgY2FwdHVyZWQgYXVkaW9cbnZhciByZXNhbXBsZXIgPSBmdW5jdGlvbihzYW1wbGVSYXRlLCBhdWRpb0J1ZmZlciwgY2FsbGJhY2tQcm9jZXNzQXVkaW8pIHtcblx0XG5cdGNvbnNvbGUubG9nKFwibGVuZ3RoOiBcIiArIGF1ZGlvQnVmZmVyLmxlbmd0aCArIFwiIFwiICsgc2FtcGxlUmF0ZSk7XG5cdHZhciBjaGFubmVscyA9IDE7IFxuXHR2YXIgdGFyZ2V0U2FtcGxlUmF0ZSA9IDE2MDAwO1xuICAgdmFyIG51bVNhbXBsZXNUYXJnZXQgPSBhdWRpb0J1ZmZlci5sZW5ndGggKiB0YXJnZXRTYW1wbGVSYXRlIC8gc2FtcGxlUmF0ZTtcblxuICAgdmFyIG9mZmxpbmVDb250ZXh0ID0gbmV3IE9mZmxpbmVBdWRpb0NvbnRleHQoY2hhbm5lbHMsIG51bVNhbXBsZXNUYXJnZXQsIHRhcmdldFNhbXBsZVJhdGUpO1xuICAgdmFyIGJ1ZmZlclNvdXJjZSA9IG9mZmxpbmVDb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgYnVmZmVyU291cmNlLmJ1ZmZlciA9IGF1ZGlvQnVmZmVyO1xuXG5cdC8vIGNhbGxiYWNrIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIHJlc2FtcGxpbmcgZmluaXNoZXNcbiAgIG9mZmxpbmVDb250ZXh0Lm9uY29tcGxldGUgPSBmdW5jdGlvbihldmVudCkgeyAgIFx0XG4gICAgICB2YXIgc2FtcGxlc1RhcmdldCA9IGV2ZW50LnJlbmRlcmVkQnVmZmVyLmdldENoYW5uZWxEYXRhKDApOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ0RvbmUgcmVzYW1wbGluZzogJyArIHNhbXBsZXNUYXJnZXQubGVuZ3RoICsgXCIgc2FtcGxlcyBwcm9kdWNlZFwiKTsgIFxuXG5cdFx0Ly8gY29udmVydCBmcm9tIFstMSwxXSByYW5nZSBvZiBmbG9hdGluZyBwb2ludCBudW1iZXJzIHRvIFstMzI3NjcsMzI3NjddIHJhbmdlIG9mIGludGVnZXJzXG5cdFx0dmFyIGluZGV4ID0gMDtcblx0XHR2YXIgdm9sdW1lID0gMHg3RkZGO1xuICBcdFx0dmFyIHBjbUVuY29kZWRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc2FtcGxlc1RhcmdldC5sZW5ndGgqMik7ICAgIC8vIHNob3J0IGludGVnZXIgdG8gYnl0ZVxuICBcdFx0dmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KHBjbUVuY29kZWRCdWZmZXIpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzYW1wbGVzVGFyZ2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgXHRcdGRhdGFWaWV3LnNldEludDE2KGluZGV4LCBzYW1wbGVzVGFyZ2V0W2ldKnZvbHVtZSwgdHJ1ZSk7XG4gICAgXHRcdGluZGV4ICs9IDI7XG4gIFx0XHR9XG5cbiAgICAgIC8vIGwxNiBpcyB0aGUgTUlNRSB0eXBlIGZvciAxNi1iaXQgUENNXG4gICAgICBjYWxsYmFja1Byb2Nlc3NBdWRpbyhuZXcgQmxvYihbZGF0YVZpZXddLCB7IHR5cGU6ICdhdWRpby9sMTYnIH0pKTsgICAgICAgICBcbiAgIH07XG5cbiAgIGJ1ZmZlclNvdXJjZS5jb25uZWN0KG9mZmxpbmVDb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgIGJ1ZmZlclNvdXJjZS5zdGFydCgwKTtcbiAgIG9mZmxpbmVDb250ZXh0LnN0YXJ0UmVuZGVyaW5nKCk7ICAgXG59O1xuIFxuICBcblxuLyoqXG4gKiBDcmVhdGVzIGEgQmxvYiB0eXBlOiAnYXVkaW8vbDE2JyB3aXRoIHRoZVxuICogY2h1bmsgY29taW5nIGZyb20gdGhlIG1pY3JvcGhvbmUuXG4gKi9cbnZhciBleHBvcnREYXRhQnVmZmVyID0gZnVuY3Rpb24oYnVmZmVyLCBidWZmZXJTaXplKSB7XG4gIHZhciBwY21FbmNvZGVkQnVmZmVyID0gbnVsbCxcbiAgICBkYXRhVmlldyA9IG51bGwsXG4gICAgaW5kZXggPSAwLFxuICAgIHZvbHVtZSA9IDB4N0ZGRjsgLy9yYW5nZSBmcm9tIDAgdG8gMHg3RkZGIHRvIGNvbnRyb2wgdGhlIHZvbHVtZVxuXG4gIHBjbUVuY29kZWRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVyU2l6ZSAqIDIpO1xuICBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhwY21FbmNvZGVkQnVmZmVyKTtcblxuICAvKiBFeHBsYW5hdGlvbiBmb3IgdGhlIG1hdGg6IFRoZSByYXcgdmFsdWVzIGNhcHR1cmVkIGZyb20gdGhlIFdlYiBBdWRpbyBBUEkgYXJlXG4gICAqIGluIDMyLWJpdCBGbG9hdGluZyBQb2ludCwgYmV0d2VlbiAtMSBhbmQgMSAocGVyIHRoZSBzcGVjaWZpY2F0aW9uKS5cbiAgICogVGhlIHZhbHVlcyBmb3IgMTYtYml0IFBDTSByYW5nZSBiZXR3ZWVuIC0zMjc2OCBhbmQgKzMyNzY3ICgxNi1iaXQgc2lnbmVkIGludGVnZXIpLlxuICAgKiBNdWx0aXBseSB0byBjb250cm9sIHRoZSB2b2x1bWUgb2YgdGhlIG91dHB1dC4gV2Ugc3RvcmUgaW4gbGl0dGxlIGVuZGlhbi5cbiAgICovXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgZGF0YVZpZXcuc2V0SW50MTYoaW5kZXgsIGJ1ZmZlcltpXSAqIHZvbHVtZSwgdHJ1ZSk7XG4gICAgaW5kZXggKz0gMjtcbiAgfVxuXG4gIC8vIGwxNiBpcyB0aGUgTUlNRSB0eXBlIGZvciAxNi1iaXQgUENNXG4gIHJldHVybiBuZXcgQmxvYihbZGF0YVZpZXddLCB7IHR5cGU6ICdhdWRpby9sMTYnIH0pO1xufTtcblxuTWljcm9waG9uZS5wcm90b3R5cGUuX2V4cG9ydERhdGFCdWZmZXIgPSBmdW5jdGlvbihidWZmZXIpe1xuICB1dGlscy5leHBvcnREYXRhQnVmZmVyKGJ1ZmZlciwgdGhpcy5idWZmZXJTaXplKTtcbn07IFxuXG5cbi8vIEZ1bmN0aW9ucyB1c2VkIHRvIGNvbnRyb2wgTWljcm9waG9uZSBldmVudHMgbGlzdGVuZXJzLlxuTWljcm9waG9uZS5wcm90b3R5cGUub25TdGFydFJlY29yZGluZyA9ICBmdW5jdGlvbigpIHt9O1xuTWljcm9waG9uZS5wcm90b3R5cGUub25TdG9wUmVjb3JkaW5nID0gIGZ1bmN0aW9uKCkge307XG5NaWNyb3Bob25lLnByb3RvdHlwZS5vbkF1ZGlvID0gIGZ1bmN0aW9uKCkge307XG5cbm1vZHVsZS5leHBvcnRzID0gTWljcm9waG9uZTtcblxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICAgXCJtb2RlbHNcIjogW1xuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9lbi1VU19Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiAxNjAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJlbi1VU19Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJlbi1VU1wiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJVUyBFbmdsaXNoIGJyb2FkYmFuZCBtb2RlbCAoMTZLSHopXCJcbiAgICAgIH0sIFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9lbi1VU19OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogODAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJlbi1VU19OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiZW4tVVNcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVVMgRW5nbGlzaCBuYXJyb3diYW5kIG1vZGVsICg4S0h6KVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9lcy1FU19Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiAxNjAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJlcy1FU19Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJlcy1FU1wiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTcGFuaXNoIGJyb2FkYmFuZCBtb2RlbCAoMTZLSHopXCJcbiAgICAgIH0sIFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9lcy1FU19OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogODAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJlcy1FU19OYXJyb3diYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiZXMtRVNcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3BhbmlzaCBuYXJyb3diYW5kIG1vZGVsICg4S0h6KVwiXG4gICAgICB9LCBcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvamEtSlBfQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcInJhdGVcIjogMTYwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwiamEtSlBfQnJvYWRiYW5kTW9kZWxcIiwgXG4gICAgICAgICBcImxhbmd1YWdlXCI6IFwiamEtSlBcIiwgXG4gICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSmFwYW5lc2UgYnJvYWRiYW5kIG1vZGVsICgxNktIeilcIlxuICAgICAgfSwgXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL2phLUpQX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiA4MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcImphLUpQX05hcnJvd2JhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJqYS1KUFwiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJKYXBhbmVzZSBuYXJyb3diYW5kIG1vZGVsICg4S0h6KVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbS53YXRzb25wbGF0Zm9ybS5uZXQvc3BlZWNoLXRvLXRleHQvYXBpL3YxL21vZGVscy9wdC1CUl9Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwicmF0ZVwiOiAxNjAwMCwgXG4gICAgICAgICBcIm5hbWVcIjogXCJwdC1CUl9Ccm9hZGJhbmRNb2RlbFwiLCBcbiAgICAgICAgIFwibGFuZ3VhZ2VcIjogXCJwdC1CUlwiLCBcbiAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJCcmF6aWxpYW4gUG9ydHVndWVzZSBicm9hZGJhbmQgbW9kZWwgKDE2S0h6KVwiXG4gICAgICB9LCBcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvcHQtQlJfTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDgwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwicHQtQlJfTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcInB0LUJSXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkJyYXppbGlhbiBQb3J0dWd1ZXNlIG5hcnJvd2JhbmQgbW9kZWwgKDhLSHopXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtLndhdHNvbnBsYXRmb3JtLm5ldC9zcGVlY2gtdG8tdGV4dC9hcGkvdjEvbW9kZWxzL3poLUNOX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDE2MDAwLCBcbiAgICAgICAgIFwibmFtZVwiOiBcInpoLUNOX0Jyb2FkYmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcInpoLUNOXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1hbmRhcmluIGJyb2FkYmFuZCBtb2RlbCAoMTZLSHopXCJcbiAgICAgIH0sICAgICBcbiAgICAgIHtcbiAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9tb2RlbHMvemgtQ05fTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJyYXRlXCI6IDgwMDAsIFxuICAgICAgICAgXCJuYW1lXCI6IFwiemgtQ05fTmFycm93YmFuZE1vZGVsXCIsIFxuICAgICAgICAgXCJsYW5ndWFnZVwiOiBcInpoLUNOXCIsIFxuICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1hbmRhcmluIG5hcnJvd2JhbmQgbW9kZWwgKDhLSHopXCJcbiAgICAgIH0gICAgICBcbiAgIF1cbn1cbiIsIlxudmFyIGVmZmVjdHMgPSByZXF1aXJlKCcuL3ZpZXdzL2VmZmVjdHMnKTtcbnZhciBkaXNwbGF5ID0gcmVxdWlyZSgnLi92aWV3cy9kaXNwbGF5bWV0YWRhdGEnKTtcbnZhciBoaWRlRXJyb3IgPSByZXF1aXJlKCcuL3ZpZXdzL3Nob3dlcnJvcicpLmhpZGVFcnJvcjtcbnZhciBpbml0U29ja2V0ID0gcmVxdWlyZSgnLi9zb2NrZXQnKS5pbml0U29ja2V0O1xudmFyIGhhbmRsZXIgPSByZXF1aXJlKCcuL2hhbmRsZXInKTtcblxuZXhwb3J0cy5oYW5kbGVGaWxlVXBsb2FkID0gZnVuY3Rpb24odG9rZW4sIG1vZGVsLCBmaWxlLCBjb250ZW50VHlwZSwgY2FsbGJhY2ssIG9uZW5kKSB7XG5cbiAgICAvLyBTZXQgY3VycmVudGx5RGlzcGxheWluZyB0byBwcmV2ZW50IG90aGVyIHNvY2tldHMgZnJvbSBvcGVuaW5nXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCB0cnVlKTtcblxuICAgIC8vICQoJyNwcm9ncmVzc0luZGljYXRvcicpLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG5cbiAgICAkLnN1YnNjcmliZSgncHJvZ3Jlc3MnLCBmdW5jdGlvbihldnQsIGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwcm9ncmVzczogJywgZGF0YSk7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnY29udGVudFR5cGUnLCBjb250ZW50VHlwZSk7XG5cbiAgICB2YXIgYmFzZVN0cmluZyA9ICcnO1xuICAgIHZhciBiYXNlSlNPTiA9ICcnO1xuXG4gICAgJC5zdWJzY3JpYmUoJ3Nob3dqc29uJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyICRyZXN1bHRzSlNPTiA9ICQoJyNyZXN1bHRzSlNPTicpXG4gICAgICAkcmVzdWx0c0pTT04uZW1wdHkoKTtcbiAgICAgICRyZXN1bHRzSlNPTi5hcHBlbmQoYmFzZUpTT04pO1xuICAgIH0pO1xuXG4gICAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgICBvcHRpb25zLnRva2VuID0gdG9rZW47XG4gICAgb3B0aW9ucy5tZXNzYWdlID0ge1xuICAgICAgJ2FjdGlvbic6ICdzdGFydCcsXG4gICAgICAnY29udGVudC10eXBlJzogY29udGVudFR5cGUsXG4gICAgICAnaW50ZXJpbV9yZXN1bHRzJzogdHJ1ZSxcbiAgICAgICdjb250aW51b3VzJzogdHJ1ZSxcbiAgICAgICd3b3JkX2NvbmZpZGVuY2UnOiB0cnVlLFxuICAgICAgJ3RpbWVzdGFtcHMnOiB0cnVlLFxuICAgICAgJ21heF9hbHRlcm5hdGl2ZXMnOiAzLFxuICAgICAgJ2luYWN0aXZpdHlfdGltZW91dCc6IDYwMFxuICAgIH07XG4gICAgb3B0aW9ucy5tb2RlbCA9IG1vZGVsO1xuXG4gICAgZnVuY3Rpb24gb25PcGVuKHNvY2tldCkge1xuICAgICAgY29uc29sZS5sb2coJ1NvY2tldCBvcGVuZWQnKTtcbiAgICAgIGhhbmRsZXIub25PcGVuKHNvY2tldCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25MaXN0ZW5pbmcoc29ja2V0KSB7XG4gICAgICBjb25zb2xlLmxvZygnU29ja2V0IGxpc3RlbmluZycpO1xuICAgICAgY2FsbGJhY2soc29ja2V0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbk1lc3NhZ2UobXNnKSB7XG4gICAgICBoYW5kbGVyLm9uTWVzc2FnZShtc2cpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uRXJyb3IoZXZ0KSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcbiAgICAgIG9uZW5kKGV2dCk7XG4gICAgICBjb25zb2xlLmxvZygnU29ja2V0IGVycjogJywgZXZ0LmNvZGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uQ2xvc2UoZXZ0KSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcbiAgICAgIG9uZW5kKGV2dCk7XG4gICAgICBoYW5kbGVyLm9uQ2xvc2UoZXZ0KTtcbiAgICAgIGNvbnNvbGUubG9nKCdTb2NrZXQgY2xvc2luZzogJywgZXZ0KTtcbiAgICB9XG5cbiAgICBpbml0U29ja2V0KG9wdGlvbnMsIG9uT3Blbiwgb25MaXN0ZW5pbmcsIG9uTWVzc2FnZSwgb25FcnJvciwgb25DbG9zZSk7XG59XG5cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5pdFNvY2tldCA9IHJlcXVpcmUoJy4vc29ja2V0JykuaW5pdFNvY2tldDtcbnZhciBkaXNwbGF5ID0gcmVxdWlyZSgnLi92aWV3cy9kaXNwbGF5bWV0YWRhdGEnKTtcbnZhciBoYW5kbGVyID0gcmVxdWlyZSgnLi9oYW5kbGVyJyk7XG5cbmV4cG9ydHMuaGFuZGxlTWljcm9waG9uZSA9IGZ1bmN0aW9uKHRva2VuLCBtb2RlbCwgbWljLCBjYWxsYmFjaykge1xuXG4gIGlmIChtb2RlbC5pbmRleE9mKCdOYXJyb3diYW5kJykgPiAtMSkge1xuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ01pY3JvcGhvbmUgdHJhbnNjcmlwdGlvbiBjYW5ub3QgYWNjb21vZGF0ZSBuYXJyb3diYW5kIG1vZGVscywgcGxlYXNlIHNlbGVjdCBhbm90aGVyJyk7XG4gICAgY2FsbGJhY2soZXJyLCBudWxsKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgJC5wdWJsaXNoKCdjbGVhcnNjcmVlbicpO1xuXG4gIC8vIFRlc3Qgb3V0IHdlYnNvY2tldFxuICB2YXIgYmFzZVN0cmluZyA9ICcnO1xuICB2YXIgYmFzZUpTT04gPSAnJztcblxuICAkLnN1YnNjcmliZSgnc2hvd2pzb24nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyICRyZXN1bHRzSlNPTiA9ICQoJyNyZXN1bHRzSlNPTicpXG4gICAgJHJlc3VsdHNKU09OLmVtcHR5KCk7XG4gICAgJHJlc3VsdHNKU09OLmFwcGVuZChiYXNlSlNPTik7XG4gIH0pO1xuXG4gIHZhciBvcHRpb25zID0ge307XG4gIG9wdGlvbnMudG9rZW4gPSB0b2tlbjtcbiAgb3B0aW9ucy5tZXNzYWdlID0ge1xuICAgICdhY3Rpb24nOiAnc3RhcnQnLFxuICAgICdjb250ZW50LXR5cGUnOiAnYXVkaW8vbDE2O3JhdGU9MTYwMDAnLFxuICAgICdpbnRlcmltX3Jlc3VsdHMnOiB0cnVlLFxuICAgICdjb250aW51b3VzJzogdHJ1ZSxcbiAgICAnd29yZF9jb25maWRlbmNlJzogdHJ1ZSxcbiAgICAndGltZXN0YW1wcyc6IHRydWUsXG4gICAgJ21heF9hbHRlcm5hdGl2ZXMnOiAzLFxuICAgICdpbmFjdGl2aXR5X3RpbWVvdXQnOiA2MDBcbiAgfTtcbiAgb3B0aW9ucy5tb2RlbCA9IG1vZGVsO1xuXG4gIGZ1bmN0aW9uIG9uT3Blbihzb2NrZXQpIHtcbiAgICBjb25zb2xlLmxvZygnTWljIHNvY2tldDogb3BlbmVkJyk7XG4gICAgY2FsbGJhY2sobnVsbCwgc29ja2V0KTtcbiAgICBoYW5kbGVyLm9uT3Blbihzb2NrZXQpO1xuICB9XG5cbiAgZnVuY3Rpb24gb25MaXN0ZW5pbmcoc29ja2V0KSB7XG5cbiAgICBtaWMub25BdWRpbyA9IGZ1bmN0aW9uKGJsb2IpIHtcbiAgICAgIGlmIChzb2NrZXQucmVhZHlTdGF0ZSA8IDIpIHtcbiAgICAgICAgc29ja2V0LnNlbmQoYmxvYik7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uTWVzc2FnZShtc2csIHNvY2tldCkge1xuICAgIGhhbmRsZXIub25NZXNzYWdlKG1zZyk7XG4gIH1cblxuICBmdW5jdGlvbiBvbkVycm9yKHIsIHNvY2tldCkge1xuICAgIGNvbnNvbGUubG9nKCdNaWMgc29ja2V0IGVycjogJywgZXJyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQ2xvc2UoZXZ0KSB7XG4gICAgaGFuZGxlci5vbkNsb3NlKGV2dClcbiAgfVxuXG4gIGluaXRTb2NrZXQob3B0aW9ucywgb25PcGVuLCBvbkxpc3RlbmluZywgb25NZXNzYWdlLCBvbkVycm9yLCBvbkNsb3NlKTtcbn1cbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBrZWVuQ2xpZW50ID0gcmVxdWlyZSgnLi9rZWVuJykuY2xpZW50O1xuXG52YXIgYmVnYW5SZWNvcmRpbmc7XG52YXIgc3BlZWNoID0ge307XG5zcGVlY2gudHJhbnNjcmlwdCA9ICcnO1xuc3BlZWNoLndvcmRzID0gW107XG52YXIgaGFzaCA9ICcnICsgbmV3IERhdGUoKTtcblxuZXhwb3J0cy5vbk1lc3NhZ2UgPSBmdW5jdGlvbihtc2cpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnTWljIHNvY2tldCBtc2c6ICcsIG1zZyk7XG4gICAgJCgnI3NwZWVjaC1jb250YWluZXInKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICBpZiAobXNnLnJlc3VsdHMpIHtcbiAgICAgIGlmIChtc2cucmVzdWx0cyAmJiBtc2cucmVzdWx0c1swXSAmJiBtc2cucmVzdWx0c1swXS5maW5hbCkge1xuICAgICAgICB2YXIgZmluYWxfbWVzc2FnZSA9IG1zZy5yZXN1bHRzWzBdLmFsdGVybmF0aXZlc1swXTtcbiAgICAgICAgc3BlZWNoLnRyYW5zY3JpcHQgKz0gZmluYWxfbWVzc2FnZS50cmFuc2NyaXB0O1xuICAgICAgICAkKCcjcmVzdWx0c1RleHQnKS5odG1sKHNwZWVjaC50cmFuc2NyaXB0KTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGZpbmFsX21lc3NhZ2Uud29yZF9jb25maWRlbmNlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgdmFyIG5leHRfd29yZCA9IHt9O1xuICAgICAgICAgIG5leHRfd29yZC50ZXh0ID0gZmluYWxfbWVzc2FnZS53b3JkX2NvbmZpZGVuY2VbaV1bMF07XG4gICAgICAgICAgbmV4dF93b3JkLmNvbmZpZGVuY2UgPSBmaW5hbF9tZXNzYWdlLndvcmRfY29uZmlkZW5jZVtpXVsxXTtcbiAgICAgICAgICB2YXIgYmVnaW5fdGltZSA9IGZpbmFsX21lc3NhZ2UudGltZXN0YW1wc1tpXVsxXTtcbiAgICAgICAgICB2YXIgZW5kX3RpbWUgPSBmaW5hbF9tZXNzYWdlLnRpbWVzdGFtcHNbaV1bMl07XG4gICAgICAgICAgbmV4dF93b3JkLnRpbWUgPSBiZWdpbl90aW1lO1xuICAgICAgICAgIG5leHRfd29yZC5kdXJhdGlvbiA9IGVuZF90aW1lIC0gYmVnaW5fdGltZTtcbiAgICAgICAgICBuZXh0X3dvcmQuc3BlZWNoX2lkID0gaGFzaDtcbiAgICAgICAgICBrZWVuQ2xpZW50LmFkZEV2ZW50KFwid29yZHNcIiwgbmV4dF93b3JkKTtcbiAgICAgICAgICBzcGVlY2gud29yZHMucHVzaChuZXh0X3dvcmQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdGhpcyAtLSBpdCBqdXN0IHVwZGF0ZXMgdGhlIERPTSB3aXRoIHRoZSBpbmNvbWluZyBtZXNzYWdlXG4gICAgICAgIC8vIGJhc2VTdHJpbmcgPSBkaXNwbGF5LnNob3dSZXN1bHQobXNnLCBiYXNlU3RyaW5nLCBtb2RlbCk7XG4gICAgICAgIC8vIGJhc2VKU09OID0gZGlzcGxheS5zaG93SlNPTihtc2csIGJhc2VKU09OKTtcbiAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNlbmRTcGVlY2hUb0tlZW4oc3BlZWNoKSB7XG4gIHZhciB3b3JkcyA9IHNwZWVjaC53b3JkcztcbiAgdmFyIGR1cmF0aW9uID0gc3BlZWNoLmR1cmF0aW9uO1xuXG4gIGlmICghd29yZHMgfHwgd29yZHMubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3BlZWNoX2lkID0gd29yZHNbMF0uc3BlZWNoX2lkO1xuICB2YXIgbXVsdGlwbGVFdmVudHMgPSB7XG4gICAgXCJ3b3Jkc1wiOiB3b3Jkc1xuICB9O1xuXG5cbiAgLy8vLyBQYWNlIC8vLy9cbiAgdmFyIGF2Z1dwbSA9IDE1MDtcbiAgdmFyIHlvdXJXcG0gPSBNYXRoLnJvdW5kKHdvcmRzLmxlbmd0aCAvIChkdXJhdGlvbiAvIDYwIC8gMTAwMCkpO1xuICB2YXIgcGFjZU5vdGVzID0gJyc7XG4gIGlmICh5b3VyV3BtIDwgYXZnV3BtICYmIE1hdGguYWJzKHlvdXJXcG0gLSBhdmdXcG0pID4gMjApIHtcbiAgICBwYWNlTm90ZXMgPSAnU3BlZWQgdXAhJztcbiAgfSBlbHNlIGlmICh5b3VyV3BtID4gYXZnV3BtICYmIE1hdGguYWJzKHlvdXJXcG0gLSBhdmdXcG0pID4gMjApIHtcbiAgICBwYWNlTm90ZXMgPSAnU2xvdyBkb3duISc7XG4gIH0gZWxzZSB7XG4gICAgcGFjZU5vdGVzID0gJ0tlZXAgdXAgdGhlIHBhY2UhJztcbiAgfVxuICAkKCcjeW91ci1wYWNlLWNoYXJ0LW5vdGVzJykuaHRtbChwYWNlTm90ZXMpO1xuXG4gIG5ldyBLZWVuLkRhdGF2aXooKVxuICAgIC5lbChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInlvdXItcGFjZVwiKSlcbiAgICAucGFyc2VSYXdEYXRhKHtyZXN1bHQ6IHlvdXJXcG19KVxuICAgIC5jaGFydFR5cGUoJ21ldHJpYycpXG4gICAgLnRpdGxlKCd3b3JkcyBwZXIgbWludXRlJylcbiAgICAuY29sb3JzKFsnIzQzN2Y5NyddKVxuICAgIC5oZWlnaHQoMzAwKVxuICAgIC5yZW5kZXIoKTtcblxuXG4gICQoJyNsb2FkaW5nLWJhcicpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICQoJyNjaGFydC1jb250YWluZXInKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcblxuICBuZXcgS2Vlbi5EYXRhdml6KClcbiAgICAuZWwoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdmVyYWdlLXBhY2VcIikpXG4gICAgLnBhcnNlUmF3RGF0YSh7cmVzdWx0OiBhdmdXcG19KVxuICAgIC5jaGFydFR5cGUoJ21ldHJpYycpXG4gICAgLnRpdGxlKCd3b3JkcyBwZXIgbWludXRlJylcbiAgICAuY29sb3JzKFsnIzQzN2Y5NyddKVxuICAgIC5oZWlnaHQoMzAwKVxuICAgIC5yZW5kZXIoKTtcblxuICAkKCcjY2hhcnQtY29udGFpbmVyJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cbiAgJCgnI2xvYWRpbmctYmFyJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgLy8vLyBXb3JkIGZyZXF1ZW5jeSBncmFwaCAvLy8vXG4gICAgdmFyIHF1ZXJ5ID0gbmV3IEtlZW4uUXVlcnkoXCJjb3VudFwiLCB7XG4gICAgICBldmVudENvbGxlY3Rpb246IFwid29yZHNcIixcbiAgICAgIGZpbHRlcnM6IFt7XCJvcGVyYXRvclwiOlwiZXFcIixcInByb3BlcnR5X25hbWVcIjpcInNwZWVjaF9pZFwiLFwicHJvcGVydHlfdmFsdWVcIjpzcGVlY2hfaWR9XSxcbiAgICAgIGdyb3VwQnk6IFwidGV4dFwiLFxuICAgICAgdGltZWZyYW1lOiBcInRoaXNfMTRfZGF5c1wiLFxuICAgICAgdGltZXpvbmU6IFwiVVRDXCJcbiAgICB9KTtcblxuICAgIGtlZW5DbGllbnQuZHJhdyhxdWVyeSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dyaWQtMS0xJyksIHtcbiAgICAgIC8vIEN1c3RvbSBjb25maWd1cmF0aW9uIGhlcmVcbiAgICAgIGNoYXJ0VHlwZTogXCJjb2x1bW5jaGFydFwiLFxuICAgICAgaGVpZ2h0OiA1MDAsXG4gICAgICB3aWR0aDogJ2F1dG8nLFxuICAgICAgY2hhcnRPcHRpb25zOiB7XG4gICAgICAgIGlzU3RhY2tlZDogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnI2xvYWRpbmctYmFyJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgfSwgMTAwMCk7XG59XG5cbmV4cG9ydHMub25DbG9zZSA9IGZ1bmN0aW9uKGV2dCkge1xuICB2YXIgc3RvcHBlZFJlY29yZGluZyA9IG5ldyBEYXRlKCk7XG4gIHNwZWVjaC5kdXJhdGlvbiA9IHN0b3BwZWRSZWNvcmRpbmcgLSBiZWdhblJlY29yZGluZztcbiAgJCgnI3Jlc3VsdHNUZXh0JykuaHRtbChzcGVlY2gudHJhbnNjcmlwdCk7XG4gIHNlbmRTcGVlY2hUb0tlZW4oc3BlZWNoKTtcbn1cblxuZXhwb3J0cy5vbk9wZW4gPSBmdW5jdGlvbihzb2NrZXQpIHtcbiAgICBiZWdhblJlY29yZGluZyA9IG5ldyBEYXRlKCk7XG59XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTQgSUJNIENvcnAuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuLypnbG9iYWwgJDpmYWxzZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBNaWNyb3Bob25lID0gcmVxdWlyZSgnLi9NaWNyb3Bob25lJyk7XG52YXIgbW9kZWxzID0gcmVxdWlyZSgnLi9kYXRhL21vZGVscy5qc29uJykubW9kZWxzO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudXRpbHMuaW5pdFB1YlN1YigpO1xudmFyIGluaXRWaWV3cyA9IHJlcXVpcmUoJy4vdmlld3MnKS5pbml0Vmlld3M7XG5cbndpbmRvdy5CVUZGRVJTSVpFID0gODE5MjtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgLy8gTWFrZSBjYWxsIHRvIEFQSSB0byB0cnkgYW5kIGdldCB0b2tlblxuICB1dGlscy5nZXRUb2tlbihmdW5jdGlvbih0b2tlbikge1xuXG4gICAgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgfTtcblxuICAgIGlmICghdG9rZW4pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGF1dGhvcml6YXRpb24gdG9rZW4gYXZhaWxhYmxlJyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdBdHRlbXB0aW5nIHRvIHJlY29ubmVjdC4uLicpO1xuICAgIH1cblxuICAgIHZhciB2aWV3Q29udGV4dCA9IHtcbiAgICAgIGN1cnJlbnRNb2RlbDogJ2VuLVVTX0Jyb2FkYmFuZE1vZGVsJyxcbiAgICAgIG1vZGVsczogbW9kZWxzLFxuICAgICAgdG9rZW46IHRva2VuLFxuICAgICAgYnVmZmVyU2l6ZTogQlVGRkVSU0laRVxuICAgIH07XG5cbiAgICBpbml0Vmlld3Modmlld0NvbnRleHQpO1xuXG4gICAgLy8gU2F2ZSBtb2RlbHMgdG8gbG9jYWxzdG9yYWdlXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ21vZGVscycsIEpTT04uc3RyaW5naWZ5KG1vZGVscykpO1xuXG4gICAgLy8gU2V0IGRlZmF1bHQgY3VycmVudCBtb2RlbFxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50TW9kZWwnLCAnZW4tVVNfQnJvYWRiYW5kTW9kZWwnKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc2Vzc2lvblBlcm1pc3Npb25zJywgJ3RydWUnKTtcblxuXG4gICAgJC5zdWJzY3JpYmUoJ2NsZWFyc2NyZWVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAkKCcjcmVzdWx0c1RleHQnKS50ZXh0KCcnKTtcbiAgICAgICQoJyNyZXN1bHRzSlNPTicpLnRleHQoJycpO1xuICAgICAgJCgnLmVycm9yLXJvdycpLmhpZGUoKTtcbiAgICAgICQoJy5ub3RpZmljYXRpb24tcm93JykuaGlkZSgpO1xuICAgICAgJCgnLmh5cG90aGVzZXMgPiB1bCcpLmVtcHR5KCk7XG4gICAgICAkKCcjbWV0YWRhdGFUYWJsZUJvZHknKS5lbXB0eSgpO1xuICAgIH0pO1xuXG4gIH0pO1xuXG59KTtcbiIsInZhciBLZWVuID0gcmVxdWlyZSgna2Vlbi1qcycpO1xuXG5leHBvcnRzLmNsaWVudCA9IG5ldyBLZWVuKHtcbiAgcHJvamVjdElkOiBcIjU2MDZmM2Y0OTBlNGJkN2IwZTBlMWRkY1wiLCAvLyBTdHJpbmcgKHJlcXVpcmVkIGFsd2F5cylcbiAgd3JpdGVLZXk6IFwiMmZjNzYwNjhlYTM5NTYyYTVlM2M4ZjNhZTVjMTBhMDU4OGJmMDc0MjQ2ODYxYjM2ZmExNzE1MGJkMjFkZDAxMTQwYWMwNTFiMmJhZTRhZTExNThlMjE3ODU3YmFmNzMxMTIxMjBkNGY5MGE3MmI1NmU0YzFjOTdkM2Y0YjBlMjQ4YjkwNTQyN2NmZTgxODI1NTJiYWMzYjkxYWU3MmQ3ZDA2MmFiMjA0MTI2ODFhYzM5ODQ0OTE4YTRjYTJkMDBjNDA3NWFlMDQ4MDMwZmU4ZmM5NTIxMjc3NDAxMGRiNjVcIiwgICAvLyBTdHJpbmcgKHJlcXVpcmVkIGZvciBzZW5kaW5nIGRhdGEpXG4gIHJlYWRLZXk6IFwiYjJlNTQ0NmEwNDA5YjczZDE5MmNjN2M2YzNiMzlhZDJmYzVhYmVhMzg3NmQxODg1ZWFlMjVmMjUwZGEzODM0OTdhMjI3Y2ZkNmY2OWQzMDI0NjA2NWE5NmU2MjFhMzNhMmI2ZDIyZmVlYzgwYTdlZTRkNTIwNzc1NTUyYTBmMDliYzM3OGVlN2VjOGE1M2Q3NTM0YzQxNjNiYzViOTIwZDdlYjY5ODU1NGNlNWIwZmQ4YmYwMGRlMzk5Njc1ZDQ1NDE0NjE2NmQxZjk0ZGEyMjE2MDgwOGNlMjc1MTEwNjRcIiAgICAgIC8vIFN0cmluZyAocmVxdWlyZWQgZm9yIHF1ZXJ5aW5nIGRhdGEpXG5cbiAgLy8gcHJvdG9jb2w6IFwiaHR0cHNcIiwgICAgICAgICAvLyBTdHJpbmcgKG9wdGlvbmFsOiBodHRwcyB8IGh0dHAgfCBhdXRvKVxuICAvLyBob3N0OiBcImFwaS5rZWVuLmlvLzMuMFwiLCAgIC8vIFN0cmluZyAob3B0aW9uYWwpXG4gIC8vIHJlcXVlc3RUeXBlOiBcImpzb25wXCIgICAgICAgLy8gU3RyaW5nIChvcHRpb25hbDoganNvbnAsIHhociwgYmVhY29uKVxufSk7XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTQgSUJNIENvcnAuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuLypnbG9iYWwgJDpmYWxzZSAqL1xuXG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBNaWNyb3Bob25lID0gcmVxdWlyZSgnLi9NaWNyb3Bob25lJyk7XG52YXIgc2hvd2Vycm9yID0gcmVxdWlyZSgnLi92aWV3cy9zaG93ZXJyb3InKTtcbnZhciBzaG93RXJyb3IgPSBzaG93ZXJyb3Iuc2hvd0Vycm9yO1xudmFyIGhpZGVFcnJvciA9IHNob3dlcnJvci5oaWRlRXJyb3I7XG5cbi8vIE1pbmkgV1MgY2FsbGJhY2sgQVBJLCBzbyB3ZSBjYW4gaW5pdGlhbGl6ZVxuLy8gd2l0aCBtb2RlbCBhbmQgdG9rZW4gaW4gVVJJLCBwbHVzXG4vLyBzdGFydCBtZXNzYWdlXG5cbi8vIEluaXRpYWxpemUgY2xvc3VyZSwgd2hpY2ggaG9sZHMgbWF4aW11bSBnZXRUb2tlbiBjYWxsIGNvdW50XG52YXIgdG9rZW5HZW5lcmF0b3IgPSB1dGlscy5jcmVhdGVUb2tlbkdlbmVyYXRvcigpO1xuXG52YXIgaW5pdFNvY2tldCA9IGV4cG9ydHMuaW5pdFNvY2tldCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG9ub3Blbiwgb25saXN0ZW5pbmcsIG9ubWVzc2FnZSwgb25lcnJvciwgb25jbG9zZSkge1xuICB2YXIgbGlzdGVuaW5nO1xuICBmdW5jdGlvbiB3aXRoRGVmYXVsdCh2YWwsIGRlZmF1bHRWYWwpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcgPyBkZWZhdWx0VmFsIDogdmFsO1xuICB9XG4gIHZhciBzb2NrZXQ7XG4gIHZhciB0b2tlbiA9IG9wdGlvbnMudG9rZW47XG4gIHZhciBtb2RlbCA9IG9wdGlvbnMubW9kZWwgfHwgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRNb2RlbCcpO1xuICB2YXIgbWVzc2FnZSA9IG9wdGlvbnMubWVzc2FnZSB8fCB7J2FjdGlvbic6ICdzdGFydCd9O1xuICB2YXIgc2Vzc2lvblBlcm1pc3Npb25zID0gd2l0aERlZmF1bHQob3B0aW9ucy5zZXNzaW9uUGVybWlzc2lvbnMsIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Nlc3Npb25QZXJtaXNzaW9ucycpKSk7XG4gIHZhciBzZXNzaW9uUGVybWlzc2lvbnNRdWVyeVBhcmFtID0gc2Vzc2lvblBlcm1pc3Npb25zID8gJzAnIDogJzEnO1xuICB2YXIgdXJsID0gb3B0aW9ucy5zZXJ2aWNlVVJJIHx8ICd3c3M6Ly9zdHJlYW0ud2F0c29ucGxhdGZvcm0ubmV0L3NwZWVjaC10by10ZXh0L2FwaS92MS9yZWNvZ25pemU/d2F0c29uLXRva2VuPSdcbiAgICArIHRva2VuXG4gICAgKyAnJlgtV0RDLVBMLU9QVC1PVVQ9JyArIHNlc3Npb25QZXJtaXNzaW9uc1F1ZXJ5UGFyYW1cbiAgICArICcmbW9kZWw9JyArIG1vZGVsO1xuICBjb25zb2xlLmxvZygnVVJMIG1vZGVsJywgbW9kZWwpO1xuICB0cnkge1xuICAgIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgfSBjYXRjaChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKCdXUyBjb25uZWN0aW9uIGVycm9yOiAnLCBlcnIpO1xuICB9XG4gIHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbihldnQpIHtcbiAgICBsaXN0ZW5pbmcgPSBmYWxzZTtcbiAgICAkLnN1YnNjcmliZSgnaGFyZHNvY2tldHN0b3AnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBjb25zb2xlLmxvZygnTUlDUk9QSE9ORTogY2xvc2UuJyk7XG4gICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeSh7YWN0aW9uOidzdG9wJ30pKTtcbiAgICB9KTtcbiAgICAkLnN1YnNjcmliZSgnc29ja2V0c3RvcCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdNSUNST1BIT05FOiBjbG9zZS4nKTtcbiAgICAgIHNvY2tldC5jbG9zZSgpO1xuICAgIH0pO1xuICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICBvbm9wZW4oc29ja2V0KTtcbiAgfTtcbiAgc29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2dCkge1xuICAgIHZhciBtc2cgPSBKU09OLnBhcnNlKGV2dC5kYXRhKTtcbiAgICBpZiAobXNnLmVycm9yKSB7XG4gICAgICBzaG93RXJyb3IobXNnLmVycm9yKTtcbiAgICAgICQucHVibGlzaCgnaGFyZHNvY2tldHN0b3AnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKG1zZy5zdGF0ZSA9PT0gJ2xpc3RlbmluZycpIHtcbiAgICAgIC8vIEVhcmx5IGN1dCBvZmYsIHdpdGhvdXQgbm90aWZpY2F0aW9uXG4gICAgICBpZiAoIWxpc3RlbmluZykge1xuICAgICAgICBvbmxpc3RlbmluZyhzb2NrZXQpO1xuICAgICAgICBsaXN0ZW5pbmcgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01JQ1JPUEhPTkU6IENsb3Npbmcgc29ja2V0LicpO1xuICAgICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgb25tZXNzYWdlKG1zZywgc29ja2V0KTtcbiAgfTtcblxuICBzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uKGV2dCkge1xuICAgIGNvbnNvbGUubG9nKCdXUyBvbmVycm9yOiAnLCBldnQpO1xuICAgIHNob3dFcnJvcignQXBwbGljYXRpb24gZXJyb3IgJyArIGV2dC5jb2RlICsgJzogcGxlYXNlIHJlZnJlc2ggeW91ciBicm93c2VyIGFuZCB0cnkgYWdhaW4nKTtcbiAgICAkLnB1Ymxpc2goJ2NsZWFyc2NyZWVuJyk7XG4gICAgb25lcnJvcihldnQpO1xuICB9O1xuXG4gIHNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgY29uc29sZS5sb2coJ1dTIG9uY2xvc2U6ICcsIGV2dCk7XG4gICAgaWYgKGV2dC5jb2RlID09PSAxMDA2KSB7XG4gICAgICAvLyBBdXRoZW50aWNhdGlvbiBlcnJvciwgdHJ5IHRvIHJlY29ubmVjdFxuICAgICAgY29uc29sZS5sb2coJ2dlbmVyYXRvciBjb3VudCcsIHRva2VuR2VuZXJhdG9yLmdldENvdW50KCkpO1xuICAgICAgaWYgKHRva2VuR2VuZXJhdG9yLmdldENvdW50KCkgPiAxKSB7XG4gICAgICAgICQucHVibGlzaCgnaGFyZHNvY2tldHN0b3AnKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYXV0aG9yaXphdGlvbiB0b2tlbiBpcyBjdXJyZW50bHkgYXZhaWxhYmxlXCIpO1xuICAgICAgfVxuICAgICAgdG9rZW5HZW5lcmF0b3IuZ2V0VG9rZW4oZnVuY3Rpb24odG9rZW4sIGVycikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgJC5wdWJsaXNoKCdoYXJkc29ja2V0c3RvcCcpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnRmV0Y2hpbmcgYWRkaXRpb25hbCB0b2tlbi4uLicpO1xuICAgICAgICBvcHRpb25zLnRva2VuID0gdG9rZW47XG4gICAgICAgIGluaXRTb2NrZXQob3B0aW9ucywgb25vcGVuLCBvbmxpc3RlbmluZywgb25tZXNzYWdlLCBvbmVycm9yLCBvbmNsb3NlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoZXZ0LmNvZGUgPT09IDEwMTEpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1NlcnZlciBlcnJvciAnICsgZXZ0LmNvZGUgKyAnOiBwbGVhc2UgcmVmcmVzaCB5b3VyIGJyb3dzZXIgYW5kIHRyeSBhZ2FpbicpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoZXZ0LmNvZGUgPiAxMDAwKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdTZXJ2ZXIgZXJyb3IgJyArIGV2dC5jb2RlICsgJzogcGxlYXNlIHJlZnJlc2ggeW91ciBicm93c2VyIGFuZCB0cnkgYWdhaW4nKTtcbiAgICAgIC8vIHNob3dFcnJvcignU2VydmVyIGVycm9yICcgKyBldnQuY29kZSArICc6IHBsZWFzZSByZWZyZXNoIHlvdXIgYnJvd3NlciBhbmQgdHJ5IGFnYWluJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIE1hZGUgaXQgdGhyb3VnaCwgbm9ybWFsIGNsb3NlXG4gICAgJC51bnN1YnNjcmliZSgnaGFyZHNvY2tldHN0b3AnKTtcbiAgICAkLnVuc3Vic2NyaWJlKCdzb2NrZXRzdG9wJyk7XG4gICAgb25jbG9zZShldnQpO1xuICB9O1xuXG59IiwiXG4vLyBGb3Igbm9uLXZpZXcgbG9naWNcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIGZpbGVCbG9jayA9IGZ1bmN0aW9uKF9vZmZzZXQsIGxlbmd0aCwgX2ZpbGUsIHJlYWRDaHVuaykge1xuICB2YXIgciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gIHZhciBibG9iID0gX2ZpbGUuc2xpY2UoX29mZnNldCwgbGVuZ3RoICsgX29mZnNldCk7XG4gIHIub25sb2FkID0gcmVhZENodW5rO1xuICByLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpO1xufVxuXG4vLyBCYXNlZCBvbiBhbGVkaWFmZXJpYSdzIFNPIHJlc3BvbnNlXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE0NDM4MTg3L2phdmFzY3JpcHQtZmlsZXJlYWRlci1wYXJzaW5nLWxvbmctZmlsZS1pbi1jaHVua3NcbmV4cG9ydHMub25GaWxlUHJvZ3Jlc3MgPSBmdW5jdGlvbihvcHRpb25zLCBvbmRhdGEsIG9uZXJyb3IsIG9uZW5kLCBzYW1wbGluZ1JhdGUpIHtcbiAgdmFyIGZpbGUgICAgICAgPSBvcHRpb25zLmZpbGU7XG4gIHZhciBmaWxlU2l6ZSAgID0gZmlsZS5zaXplO1xuICB2YXIgY2h1bmtTaXplICA9IG9wdGlvbnMuYnVmZmVyU2l6ZSB8fCAxNjAwMDsgIC8vIGluIGJ5dGVzXG4gIHZhciBvZmZzZXQgICAgID0gMDtcbiAgdmFyIHJlYWRDaHVuayA9IGZ1bmN0aW9uKGV2dCkge1xuICAgIGlmIChvZmZzZXQgPj0gZmlsZVNpemUpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiRG9uZSByZWFkaW5nIGZpbGVcIik7XG4gICAgICBvbmVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXZ0LnRhcmdldC5lcnJvciA9PSBudWxsKSB7XG4gICAgICB2YXIgYnVmZmVyID0gZXZ0LnRhcmdldC5yZXN1bHQ7XG4gICAgICB2YXIgbGVuID0gYnVmZmVyLmJ5dGVMZW5ndGg7XG4gICAgICBvZmZzZXQgKz0gbGVuO1xuICAgICAgY29uc29sZS5sb2coXCJzZW5kaW5nOiBcIiArIGxlbilcbiAgICAgIG9uZGF0YShidWZmZXIpOyAvLyBjYWxsYmFjayBmb3IgaGFuZGxpbmcgcmVhZCBjaHVua1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZXJyb3JNZXNzYWdlID0gZXZ0LnRhcmdldC5lcnJvcjtcbiAgICAgIGNvbnNvbGUubG9nKFwiUmVhZCBlcnJvcjogXCIgKyBlcnJvck1lc3NhZ2UpO1xuICAgICAgb25lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyB1c2UgdGhpcyB0aW1lb3V0IHRvIHBhY2UgdGhlIGRhdGEgdXBsb2FkIGZvciB0aGUgcGxheVNhbXBsZSBjYXNlLCB0aGUgaWRlYSBpcyB0aGF0IHRoZSBoeXBzIGRvIG5vdCBhcnJpdmUgYmVmb3JlIHRoZSBhdWRpbyBpcyBwbGF5ZWQgYmFja1xuICAgIGlmIChzYW1wbGluZ1JhdGUpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwic2FtcGxpbmdSYXRlOiBcIiArICBzYW1wbGluZ1JhdGUgKyBcIiB0aW1lb3V0OiBcIiArIChjaHVua1NpemUqMTAwMCkvKHNhbXBsaW5nUmF0ZSoyKSlcbiAgICBcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGZpbGVCbG9jayhvZmZzZXQsIGNodW5rU2l6ZSwgZmlsZSwgcmVhZENodW5rKTsgfSwgKGNodW5rU2l6ZSoxMDAwKS8oc2FtcGxpbmdSYXRlKjIpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmlsZUJsb2NrKG9mZnNldCwgY2h1bmtTaXplLCBmaWxlLCByZWFkQ2h1bmspO1xuICAgIH1cbiAgfVxuICBmaWxlQmxvY2sob2Zmc2V0LCBjaHVua1NpemUsIGZpbGUsIHJlYWRDaHVuayk7XG59XG5cbmV4cG9ydHMuY3JlYXRlVG9rZW5HZW5lcmF0b3IgPSBmdW5jdGlvbigpIHtcbiAgLy8gTWFrZSBjYWxsIHRvIEFQSSB0byB0cnkgYW5kIGdldCB0b2tlblxuICB2YXIgaGFzQmVlblJ1blRpbWVzID0gMDtcbiAgcmV0dXJuIHtcbiAgICBnZXRUb2tlbjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICArK2hhc0JlZW5SdW5UaW1lcztcbiAgICBpZiAoaGFzQmVlblJ1blRpbWVzID4gNSkge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignQ2Fubm90IHJlYWNoIHNlcnZlcicpO1xuICAgICAgY2FsbGJhY2sobnVsbCwgZXJyKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHVybCA9ICcvdG9rZW4nO1xuICAgIHZhciB0b2tlblJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB0b2tlblJlcXVlc3Qub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgIHRva2VuUmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgIHZhciB0b2tlbiA9IHRva2VuUmVxdWVzdC5yZXNwb25zZVRleHQ7XG4gICAgICBjYWxsYmFjayh0b2tlbik7XG4gICAgfTtcbiAgICB0b2tlblJlcXVlc3Quc2VuZCgpO1xuICAgIH0sXG4gICAgZ2V0Q291bnQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaGFzQmVlblJ1blRpbWVzOyB9XG4gIH1cbn07XG5cbmV4cG9ydHMuZ2V0VG9rZW4gPSAoZnVuY3Rpb24oKSB7XG4gIC8vIE1ha2UgY2FsbCB0byBBUEkgdG8gdHJ5IGFuZCBnZXQgdG9rZW5cbiAgdmFyIGhhc0JlZW5SdW5UaW1lcyA9IDA7XG4gIHJldHVybiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGhhc0JlZW5SdW5UaW1lcysrXG4gICAgaWYgKGhhc0JlZW5SdW5UaW1lcyA+IDUpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0Nhbm5vdCByZWFjaCBzZXJ2ZXInKTtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB1cmwgPSAnL3Rva2VuJztcbiAgICB2YXIgdG9rZW5SZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgdG9rZW5SZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICB0b2tlblJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICB2YXIgdG9rZW4gPSB0b2tlblJlcXVlc3QucmVzcG9uc2VUZXh0O1xuICAgICAgY2FsbGJhY2sodG9rZW4pO1xuICAgIH07XG4gICAgdG9rZW5SZXF1ZXN0LnNlbmQoKTtcbiAgfVxufSkoKTtcblxuZXhwb3J0cy5pbml0UHViU3ViID0gZnVuY3Rpb24oKSB7XG4gIHZhciBvICAgICAgICAgPSAkKHt9KTtcbiAgJC5zdWJzY3JpYmUgICA9IG8ub24uYmluZChvKTtcbiAgJC51bnN1YnNjcmliZSA9IG8ub2ZmLmJpbmQobyk7XG4gICQucHVibGlzaCAgICAgPSBvLnRyaWdnZXIuYmluZChvKTtcbn0iLCJcblxuZXhwb3J0cy5pbml0QW5pbWF0ZVBhbmVsID0gZnVuY3Rpb24oKSB7XG4gICQoJy5wYW5lbC1oZWFkaW5nIHNwYW4uY2xpY2thYmxlJykub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKSkge1xuICAgICAgLy8gZXhwYW5kIHRoZSBwYW5lbFxuICAgICAgJCh0aGlzKS5wYXJlbnRzKCcucGFuZWwnKS5maW5kKCcucGFuZWwtYm9keScpLnNsaWRlRG93bigpO1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XG4gICAgICAkKHRoaXMpLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnY2FyZXQtZG93bicpLmFkZENsYXNzKCdjYXJldC11cCcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGNvbGxhcHNlIHRoZSBwYW5lbFxuICAgICAgJCh0aGlzKS5wYXJlbnRzKCcucGFuZWwnKS5maW5kKCcucGFuZWwtYm9keScpLnNsaWRlVXAoKTtcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xuICAgICAgJCh0aGlzKS5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2NhcmV0LXVwJykuYWRkQ2xhc3MoJ2NhcmV0LWRvd24nKTtcbiAgICB9XG4gIH0pO1xufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBzY3JvbGxlZCA9IGZhbHNlLFxuICAgIHRleHRTY3JvbGxlZCA9IGZhbHNlO1xuXG52YXIgc2hvd1RpbWVzdGFtcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcHMsIGNvbmZpZGVuY2VzKSB7XG4gIHZhciB3b3JkID0gdGltZXN0YW1wc1swXSxcbiAgICAgIHQwID0gdGltZXN0YW1wc1sxXSxcbiAgICAgIHQxID0gdGltZXN0YW1wc1syXTtcbiAgdmFyIHRpbWVsZW5ndGggPSB0MSAtIHQwO1xuICAvLyBTaG93IGNvbmZpZGVuY2UgaWYgZGVmaW5lZCwgZWxzZSAnbi9hJ1xuICB2YXIgZGlzcGxheUNvbmZpZGVuY2UgPSBjb25maWRlbmNlcyA/IGNvbmZpZGVuY2VzWzFdLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDMpIDogJ24vYSc7XG4gICQoJyNtZXRhZGF0YVRhYmxlID4gdGJvZHk6bGFzdC1jaGlsZCcpLmFwcGVuZChcbiAgICAgICc8dHI+J1xuICAgICAgKyAnPHRkPicgKyB3b3JkICsgJzwvdGQ+J1xuICAgICAgKyAnPHRkPicgKyB0MCArICc8L3RkPidcbiAgICAgICsgJzx0ZD4nICsgdDEgKyAnPC90ZD4nXG4gICAgICArICc8dGQ+JyArIGRpc3BsYXlDb25maWRlbmNlICsgJzwvdGQ+J1xuICAgICAgKyAnPC90cj4nXG4gICAgICApO1xufVxuXG5cbnZhciBzaG93TWV0YURhdGEgPSBmdW5jdGlvbihhbHRlcm5hdGl2ZSkge1xuICB2YXIgY29uZmlkZW5jZU5lc3RlZEFycmF5ID0gYWx0ZXJuYXRpdmUud29yZF9jb25maWRlbmNlOztcbiAgdmFyIHRpbWVzdGFtcE5lc3RlZEFycmF5ID0gYWx0ZXJuYXRpdmUudGltZXN0YW1wcztcbiAgaWYgKGNvbmZpZGVuY2VOZXN0ZWRBcnJheSAmJiBjb25maWRlbmNlTmVzdGVkQXJyYXkubGVuZ3RoID4gMCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uZmlkZW5jZU5lc3RlZEFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdGltZXN0YW1wcyA9IHRpbWVzdGFtcE5lc3RlZEFycmF5W2ldO1xuICAgICAgdmFyIGNvbmZpZGVuY2VzID0gY29uZmlkZW5jZU5lc3RlZEFycmF5W2ldO1xuICAgICAgc2hvd1RpbWVzdGFtcCh0aW1lc3RhbXBzLCBjb25maWRlbmNlcyk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfSBlbHNlIHtcbiAgICBpZiAodGltZXN0YW1wTmVzdGVkQXJyYXkgJiYgdGltZXN0YW1wTmVzdGVkQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgdGltZXN0YW1wTmVzdGVkQXJyYXkuZm9yRWFjaChmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgICAgICAgc2hvd1RpbWVzdGFtcCh0aW1lc3RhbXApO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbnZhciBBbHRlcm5hdGl2ZXMgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzdHJpbmdPbmUgPSAnJyxcbiAgICBzdHJpbmdUd28gPSAnJyxcbiAgICBzdHJpbmdUaHJlZSA9ICcnO1xuXG4gIHRoaXMuY2xlYXJTdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICBzdHJpbmdPbmUgPSAnJztcbiAgICBzdHJpbmdUd28gPSAnJztcbiAgICBzdHJpbmdUaHJlZSA9ICcnO1xuICB9O1xuXG4gIHRoaXMuc2hvd0FsdGVybmF0aXZlcyA9IGZ1bmN0aW9uKGFsdGVybmF0aXZlcywgaXNGaW5hbCwgdGVzdGluZykge1xuICAgIHZhciAkaHlwb3RoZXNlcyA9ICQoJy5oeXBvdGhlc2VzIG9sJyk7XG4gICAgJGh5cG90aGVzZXMuZW1wdHkoKTtcbiAgICAvLyAkaHlwb3RoZXNlcy5hcHBlbmQoJCgnPC9icj4nKSk7XG4gICAgYWx0ZXJuYXRpdmVzLmZvckVhY2goZnVuY3Rpb24oYWx0ZXJuYXRpdmUsIGlkeCkge1xuICAgICAgdmFyICRhbHRlcm5hdGl2ZTtcbiAgICAgIGlmIChhbHRlcm5hdGl2ZS50cmFuc2NyaXB0KSB7XG4gICAgICAgIHZhciB0cmFuc2NyaXB0ID0gYWx0ZXJuYXRpdmUudHJhbnNjcmlwdC5yZXBsYWNlKC8lSEVTSVRBVElPTlxccy9nLCAnJyk7XG4gICAgICAgIHRyYW5zY3JpcHQgPSB0cmFuc2NyaXB0LnJlcGxhY2UoLyguKVxcMXsyLH0vZywgJycpO1xuICAgICAgICBzd2l0Y2ggKGlkeCkge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHN0cmluZ09uZSA9IHN0cmluZ09uZSArIHRyYW5zY3JpcHQ7XG4gICAgICAgICAgICAkYWx0ZXJuYXRpdmUgPSAkKCc8bGkgZGF0YS1oeXBvdGhlc2lzLWluZGV4PScgKyBpZHggKyAnID4nICsgc3RyaW5nT25lICsgJzwvbGk+Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdHJpbmdUd28gPSBzdHJpbmdUd28gKyB0cmFuc2NyaXB0O1xuICAgICAgICAgICAgJGFsdGVybmF0aXZlID0gJCgnPGxpIGRhdGEtaHlwb3RoZXNpcy1pbmRleD0nICsgaWR4ICsgJyA+JyArIHN0cmluZ1R3byArICc8L2xpPicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgc3RyaW5nVGhyZWUgPSBzdHJpbmdUaHJlZSArIHRyYW5zY3JpcHQ7XG4gICAgICAgICAgICAkYWx0ZXJuYXRpdmUgPSAkKCc8bGkgZGF0YS1oeXBvdGhlc2lzLWluZGV4PScgKyBpZHggKyAnID4nICsgc3RyaW5nVGhyZWUgKyAnPC9saT4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgICRoeXBvdGhlc2VzLmFwcGVuZCgkYWx0ZXJuYXRpdmUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xufVxuXG52YXIgYWx0ZXJuYXRpdmVQcm90b3R5cGUgPSBuZXcgQWx0ZXJuYXRpdmVzKCk7XG5cblxuLy8gVE9ETzogQ29udmVydCB0byBjbG9zdXJlIGFwcHJvYWNoXG4vKnZhciBwcm9jZXNzU3RyaW5nID0gZnVuY3Rpb24oYmFzZVN0cmluZywgaXNGaW5pc2hlZCkge1xuXG4gIGlmIChpc0ZpbmlzaGVkKSB7XG4gICAgdmFyIGZvcm1hdHRlZFN0cmluZyA9IGJhc2VTdHJpbmcuc2xpY2UoMCwgLTEpO1xuICAgIGZvcm1hdHRlZFN0cmluZyA9IGZvcm1hdHRlZFN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZvcm1hdHRlZFN0cmluZy5zdWJzdHJpbmcoMSk7XG4gICAgZm9ybWF0dGVkU3RyaW5nID0gZm9ybWF0dGVkU3RyaW5nLnRyaW0oKSArICcuICc7XG4gICAgJCgnI3Jlc3VsdHNUZXh0JykudmFsKGZvcm1hdHRlZFN0cmluZyk7XG4gICAgcmV0dXJuIGZvcm1hdHRlZFN0cmluZztcbiAgfSBlbHNlIHtcbiAgICAkKCcjcmVzdWx0c1RleHQnKS52YWwoYmFzZVN0cmluZyk7XG4gICAgcmV0dXJuIGJhc2VTdHJpbmc7XG4gIH1cbn0qL1xuXG5leHBvcnRzLnNob3dKU09OID0gZnVuY3Rpb24obXNnLCBiYXNlSlNPTikge1xuICBcbiAgIHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkobXNnLCBudWxsLCAyKTtcbiAgICBiYXNlSlNPTiArPSBqc29uO1xuICAgIGJhc2VKU09OICs9ICdcXG4nOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblxuICBpZiAoJCgnLm5hdi10YWJzIC5hY3RpdmUnKS50ZXh0KCkgPT0gXCJKU09OXCIpIHtcbiAgICAgICQoJyNyZXN1bHRzSlNPTicpLmFwcGVuZChiYXNlSlNPTik7XG4gICAgICBiYXNlSlNPTiA9IFwiXCI7XG4gICAgICBjb25zb2xlLmxvZyhcInVwZGF0aW5nIGpzb25cIik7XG4gIH1cbiAgXG4gIHJldHVybiBiYXNlSlNPTjtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVGV4dFNjcm9sbCgpe1xuICBpZighc2Nyb2xsZWQpe1xuICAgIHZhciBlbGVtZW50ID0gJCgnI3Jlc3VsdHNUZXh0JykuZ2V0KDApO1xuICAgIGVsZW1lbnQuc2Nyb2xsVG9wID0gZWxlbWVudC5zY3JvbGxIZWlnaHQ7XG4gIH1cbn1cblxudmFyIGluaXRUZXh0U2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICQoJyNyZXN1bHRzVGV4dCcpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbigpe1xuICAgICAgdGV4dFNjcm9sbGVkID0gdHJ1ZTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNjcm9sbCgpe1xuICBpZighc2Nyb2xsZWQpe1xuICAgIHZhciBlbGVtZW50ID0gJCgnLnRhYmxlLXNjcm9sbCcpLmdldCgwKTtcbiAgICBlbGVtZW50LnNjcm9sbFRvcCA9IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0O1xuICB9XG59XG5cbnZhciBpbml0U2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICQoJy50YWJsZS1zY3JvbGwnKS5vbignc2Nyb2xsJywgZnVuY3Rpb24oKXtcbiAgICAgIHNjcm9sbGVkPXRydWU7XG4gIH0pO1xufVxuXG5leHBvcnRzLmluaXREaXNwbGF5TWV0YWRhdGEgPSBmdW5jdGlvbigpIHtcbiAgaW5pdFNjcm9sbCgpO1xuICBpbml0VGV4dFNjcm9sbCgpO1xufTtcblxuXG5leHBvcnRzLnNob3dSZXN1bHQgPSBmdW5jdGlvbihtc2csIGJhc2VTdHJpbmcsIG1vZGVsLCBjYWxsYmFjaykge1xuXG4gIHZhciBpZHggPSArbXNnLnJlc3VsdF9pbmRleDtcblxuICBpZiAobXNnLnJlc3VsdHMgJiYgbXNnLnJlc3VsdHMubGVuZ3RoID4gMCkge1xuXG4gICAgdmFyIGFsdGVybmF0aXZlcyA9IG1zZy5yZXN1bHRzWzBdLmFsdGVybmF0aXZlcztcbiAgICB2YXIgdGV4dCA9IG1zZy5yZXN1bHRzWzBdLmFsdGVybmF0aXZlc1swXS50cmFuc2NyaXB0IHx8ICcnO1xuICAgIFxuICAgIC8vIGFwcGx5IG1hcHBpbmdzIHRvIGJlYXV0aWZ5XG4gICAgdGV4dCA9IHRleHQucmVwbGFjZSgvJUhFU0lUQVRJT05cXHMvZywgJycpO1xuICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyguKVxcMXsyLH0vZywgJycpO1xuICAgIGlmIChtc2cucmVzdWx0c1swXS5maW5hbClcbiAgICAgICBjb25zb2xlLmxvZyhcIi0+IFwiICsgdGV4dCArIFwiXFxuXCIpO1xuICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL0RfW15cXHNdKy9nLCcnKTtcbiAgICBcbiAgICAvLyBpZiBhbGwgd29yZHMgYXJlIG1hcHBlZCB0byBub3RoaW5nIHRoZW4gdGhlcmUgaXMgbm90aGluZyBlbHNlIHRvIGRvXG4gICAgaWYgKCh0ZXh0Lmxlbmd0aCA9PSAwKSB8fCAoL15cXHMrJC8udGVzdCh0ZXh0KSkpIHtcbiAgICBcdCByZXR1cm4gYmFzZVN0cmluZztcbiAgICB9ICAgIFx0ICBcbiAgICBcbiAgICAvLyBjYXBpdGFsaXplIGZpcnN0IHdvcmRcbiAgICAvLyBpZiBmaW5hbCByZXN1bHRzLCBhcHBlbmQgYSBuZXcgcGFyYWdyYXBoXG4gICAgaWYgKG1zZy5yZXN1bHRzICYmIG1zZy5yZXN1bHRzWzBdICYmIG1zZy5yZXN1bHRzWzBdLmZpbmFsKSB7XG4gICAgICAgdGV4dCA9IHRleHQuc2xpY2UoMCwgLTEpO1xuICAgICAgIHRleHQgPSB0ZXh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGV4dC5zdWJzdHJpbmcoMSk7XG4gICAgICAgaWYgKChtb2RlbC5zdWJzdHJpbmcoMCw1KSA9PSBcImphLUpQXCIpIHx8IChtb2RlbC5zdWJzdHJpbmcoMCw1KSA9PSBcInpoLUNOXCIpKSB7ICAgICAgICBcbiAgICAgICAgICB0ZXh0ID0gdGV4dC50cmltKCkgKyAn44CCJztcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8gL2csJycpOyAgICAgIC8vIHJlbW92ZSB3aGl0ZXNwYWNlcyBcbiAgICAgICB9IGVsc2UgeyAgXG4gICAgICAgICAgdGV4dCA9IHRleHQudHJpbSgpICsgJy4gJztcbiAgICAgICB9ICAgICAgIFxuICAgICAgIGJhc2VTdHJpbmcgKz0gdGV4dDtcbiAgICAgICAkKCcjcmVzdWx0c1RleHQnKS52YWwoYmFzZVN0cmluZyk7XG4gICAgICAgc2hvd01ldGFEYXRhKGFsdGVybmF0aXZlc1swXSk7XG4gICAgICAgLy8gT25seSBzaG93IGFsdGVybmF0aXZlcyBpZiB3ZSdyZSBmaW5hbFxuICAgICAgIGFsdGVybmF0aXZlUHJvdG90eXBlLnNob3dBbHRlcm5hdGl2ZXMoYWx0ZXJuYXRpdmVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgIGlmICgobW9kZWwuc3Vic3RyaW5nKDAsNSkgPT0gXCJqYS1KUFwiKSB8fCAobW9kZWwuc3Vic3RyaW5nKDAsNSkgPT0gXCJ6aC1DTlwiKSkgeyAgICAgICAgXG4gICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvIC9nLCcnKTsgICAgICAvLyByZW1vdmUgd2hpdGVzcGFjZXMgICAgIFx0ICAgICAgICAgXG4gICAgICAgfSBlbHNlIHtcbiAgICAgICAgXHQgdGV4dCA9IHRleHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0ZXh0LnN1YnN0cmluZygxKTtcbiAgICAgICB9XG4gICAgXHQgJCgnI3Jlc3VsdHNUZXh0JykudmFsKGJhc2VTdHJpbmcgKyB0ZXh0KTsgICAgXHQgXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlU2Nyb2xsKCk7XG4gIHVwZGF0ZVRleHRTY3JvbGwoKTtcbiAgcmV0dXJuIGJhc2VTdHJpbmc7XG59O1xuXG4kLnN1YnNjcmliZSgnY2xlYXJzY3JlZW4nLCBmdW5jdGlvbigpIHtcbiAgdmFyICRoeXBvdGhlc2VzID0gJCgnLmh5cG90aGVzZXMgdWwnKTtcbiAgc2Nyb2xsZWQgPSBmYWxzZTtcbiAgJGh5cG90aGVzZXMuZW1wdHkoKTtcbiAgYWx0ZXJuYXRpdmVQcm90b3R5cGUuY2xlYXJTdHJpbmcoKTtcbn0pO1xuXG4iLCJcbid1c2Ugc3RyaWN0JztcblxudmFyIGhhbmRsZVNlbGVjdGVkRmlsZSA9IHJlcXVpcmUoJy4vZmlsZXVwbG9hZCcpLmhhbmRsZVNlbGVjdGVkRmlsZTtcblxuZXhwb3J0cy5pbml0RHJhZ0Ryb3AgPSBmdW5jdGlvbihjdHgpIHtcblxuICB2YXIgZHJhZ0FuZERyb3BUYXJnZXQgPSAkKGRvY3VtZW50KTtcblxuICBkcmFnQW5kRHJvcFRhcmdldC5vbignZHJhZ2VudGVyJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfSk7XG5cbiAgZHJhZ0FuZERyb3BUYXJnZXQub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfSk7XG5cbiAgZHJhZ0FuZERyb3BUYXJnZXQub24oJ2Ryb3AnLCBmdW5jdGlvbiAoZSkge1xuICAgIGNvbnNvbGUubG9nKCdGaWxlIGRyb3BwZWQnKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGV2dCA9IGUub3JpZ2luYWxFdmVudDtcbiAgICAvLyBIYW5kbGUgZHJhZ2dlZCBmaWxlIGV2ZW50XG4gICAgaGFuZGxlRmlsZVVwbG9hZEV2ZW50KGV2dCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZUZpbGVVcGxvYWRFdmVudChldnQpIHtcbiAgICAvLyBJbml0IGZpbGUgdXBsb2FkIHdpdGggZGVmYXVsdCBtb2RlbFxuICAgIHZhciBmaWxlID0gZXZ0LmRhdGFUcmFuc2Zlci5maWxlc1swXTtcbiAgICBoYW5kbGVTZWxlY3RlZEZpbGUoY3R4LnRva2VuLCBmaWxlKTtcbiAgfVxuXG59XG4iLCJcblxuXG5leHBvcnRzLmZsYXNoU1ZHID0gZnVuY3Rpb24oZWwpIHtcbiAgZWwuY3NzKHsgZmlsbDogJyNBNTM3MjUnIH0pO1xuICBmdW5jdGlvbiBsb29wKCkge1xuICAgIGVsLmFuaW1hdGUoeyBmaWxsOiAnI0E1MzcyNScgfSxcbiAgICAgICAgMTAwMCwgJ2xpbmVhcicpXG4gICAgICAuYW5pbWF0ZSh7IGZpbGw6ICd3aGl0ZScgfSxcbiAgICAgICAgICAxMDAwLCAnbGluZWFyJyk7XG4gIH1cbiAgLy8gcmV0dXJuIHRpbWVyXG4gIHZhciB0aW1lciA9IHNldFRpbWVvdXQobG9vcCwgMjAwMCk7XG4gIHJldHVybiB0aW1lcjtcbn07XG5cbmV4cG9ydHMuc3RvcEZsYXNoU1ZHID0gZnVuY3Rpb24odGltZXIpIHtcbiAgZWwuY3NzKHsgZmlsbDogJ3doaXRlJyB9ICk7XG4gIGNsZWFySW50ZXJ2YWwodGltZXIpO1xufVxuXG5leHBvcnRzLnRvZ2dsZUltYWdlID0gZnVuY3Rpb24oZWwsIG5hbWUpIHtcbiAgaWYoZWwuYXR0cignc3JjJykgPT09ICdpbWFnZXMvJyArIG5hbWUgKyAnLnN2ZycpIHtcbiAgICBlbC5hdHRyKFwic3JjXCIsICdpbWFnZXMvc3RvcC1yZWQuc3ZnJyk7XG4gIH0gZWxzZSB7XG4gICAgZWwuYXR0cignc3JjJywgJ2ltYWdlcy9zdG9wLnN2ZycpO1xuICB9XG59XG5cbnZhciByZXN0b3JlSW1hZ2UgPSBleHBvcnRzLnJlc3RvcmVJbWFnZSA9IGZ1bmN0aW9uKGVsLCBuYW1lKSB7XG4gIGVsLmF0dHIoJ3NyYycsICdpbWFnZXMvJyArIG5hbWUgKyAnLnN2ZycpO1xufVxuXG5leHBvcnRzLnN0b3BUb2dnbGVJbWFnZSA9IGZ1bmN0aW9uKHRpbWVyLCBlbCwgbmFtZSkge1xuICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgcmVzdG9yZUltYWdlKGVsLCBuYW1lKTtcbn1cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2hvd0Vycm9yID0gcmVxdWlyZSgnLi9zaG93ZXJyb3InKS5zaG93RXJyb3I7XG52YXIgc2hvd05vdGljZSA9IHJlcXVpcmUoJy4vc2hvd2Vycm9yJykuc2hvd05vdGljZTtcbnZhciBoYW5kbGVGaWxlVXBsb2FkID0gcmVxdWlyZSgnLi4vaGFuZGxlZmlsZXVwbG9hZCcpLmhhbmRsZUZpbGVVcGxvYWQ7XG52YXIgZWZmZWN0cyA9IHJlcXVpcmUoJy4vZWZmZWN0cycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLy8gTmVlZCB0byByZW1vdmUgdGhlIHZpZXcgbG9naWMgaGVyZSBhbmQgbW92ZSB0aGlzIG91dCB0byB0aGUgaGFuZGxlZmlsZXVwbG9hZCBjb250cm9sbGVyXG52YXIgaGFuZGxlU2VsZWN0ZWRGaWxlID0gZXhwb3J0cy5oYW5kbGVTZWxlY3RlZEZpbGUgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcnVubmluZyA9IGZhbHNlO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgZmFsc2UpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHRva2VuLCBmaWxlKSB7XG5cbiAgICB2YXIgY3VycmVudGx5RGlzcGxheWluZyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnKSk7XG5cbiAgICAvLyBpZiAoY3VycmVudGx5RGlzcGxheWluZykge1xuICAgIC8vICAgc2hvd0Vycm9yKCdDdXJyZW50bHkgYW5vdGhlciBmaWxlIGlzIHBsYXlpbmcsIHBsZWFzZSBzdG9wIHRoZSBmaWxlIG9yIHdhaXQgdW50aWwgaXQgZmluaXNoZXMnKTtcbiAgICAvLyAgIHJldHVybjtcbiAgICAvLyB9XG5cbiAgICAkLnB1Ymxpc2goJ2NsZWFyc2NyZWVuJyk7XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIHRydWUpO1xuICAgIHJ1bm5pbmcgPSB0cnVlO1xuXG4gICAgLy8gVmlzdWFsIGVmZmVjdHNcbiAgICB2YXIgdXBsb2FkSW1hZ2VUYWcgPSAkKCcjZmlsZVVwbG9hZFRhcmdldCA+IGltZycpO1xuICAgIHZhciB0aW1lciA9IHNldEludGVydmFsKGVmZmVjdHMudG9nZ2xlSW1hZ2UsIDc1MCwgdXBsb2FkSW1hZ2VUYWcsICdzdG9wJyk7XG4gICAgdmFyIHVwbG9hZFRleHQgPSAkKCcjZmlsZVVwbG9hZFRhcmdldCA+IHNwYW4nKTtcbiAgICB1cGxvYWRUZXh0LnRleHQoJ1N0b3AgVHJhbnNjcmliaW5nJyk7XG5cbiAgICBmdW5jdGlvbiByZXN0b3JlVXBsb2FkVGFiKCkge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gICAgICBlZmZlY3RzLnJlc3RvcmVJbWFnZSh1cGxvYWRJbWFnZVRhZywgJ3VwbG9hZCcpO1xuICAgICAgdXBsb2FkVGV4dC50ZXh0KCdTZWxlY3QgRmlsZScpO1xuICAgIH1cblxuICAgIC8vIENsZWFyIGZsYXNoaW5nIGlmIHNvY2tldCB1cGxvYWQgaXMgc3RvcHBlZFxuICAgICQuc3Vic2NyaWJlKCdoYXJkc29ja2V0c3RvcCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJlc3RvcmVVcGxvYWRUYWIoKTtcbiAgICB9KTtcblxuICAgIC8vIEdldCBjdXJyZW50IG1vZGVsXG4gICAgdmFyIGN1cnJlbnRNb2RlbCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50TW9kZWwnKTtcbiAgICBjb25zb2xlLmxvZygnY3VycmVudE1vZGVsJywgY3VycmVudE1vZGVsKTtcblxuICAgIC8vIFJlYWQgZmlyc3QgNCBieXRlcyB0byBkZXRlcm1pbmUgaGVhZGVyXG4gICAgdmFyIGJsb2JUb1RleHQgPSBuZXcgQmxvYihbZmlsZV0pLnNsaWNlKDAsIDQpO1xuICAgIHZhciByID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICByLnJlYWRBc1RleHQoYmxvYlRvVGV4dCk7XG4gICAgci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZW50VHlwZTtcbiAgICAgIGlmIChyLnJlc3VsdCA9PT0gJ2ZMYUMnKSB7XG4gICAgICAgIGNvbnRlbnRUeXBlID0gJ2F1ZGlvL2ZsYWMnO1xuICAgICAgICBzaG93Tm90aWNlKCdOb3RpY2U6IGJyb3dzZXJzIGRvIG5vdCBzdXBwb3J0IHBsYXlpbmcgRkxBQyBhdWRpbywgc28gbm8gYXVkaW8gd2lsbCBhY2NvbXBhbnkgdGhlIHRyYW5zY3JpcHRpb24nKTtcbiAgICAgIH0gZWxzZSBpZiAoci5yZXN1bHQgPT09ICdSSUZGJykge1xuICAgICAgICBjb250ZW50VHlwZSA9ICdhdWRpby93YXYnO1xuICAgICAgICB2YXIgYXVkaW8gPSBuZXcgQXVkaW8oKTtcbiAgICAgICAgdmFyIHdhdkJsb2IgPSBuZXcgQmxvYihbZmlsZV0sIHt0eXBlOiAnYXVkaW8vd2F2J30pO1xuICAgICAgICB2YXIgd2F2VVJMID0gVVJMLmNyZWF0ZU9iamVjdFVSTCh3YXZCbG9iKTtcbiAgICAgICAgYXVkaW8uc3JjID0gd2F2VVJMO1xuICAgICAgICBhdWRpby5wbGF5KCk7XG4gICAgICAgICQuc3Vic2NyaWJlKCdoYXJkc29ja2V0c3RvcCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XG4gICAgICAgICAgYXVkaW8uY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3RvcmVVcGxvYWRUYWIoKTtcbiAgICAgICAgc2hvd0Vycm9yKCdPbmx5IFdBViBvciBGTEFDIGZpbGVzIGNhbiBiZSB0cmFuc2NyaWJlZCwgcGxlYXNlIHRyeSBhbm90aGVyIGZpbGUgZm9ybWF0Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGhhbmRsZUZpbGVVcGxvYWQodG9rZW4sIGN1cnJlbnRNb2RlbCwgZmlsZSwgY29udGVudFR5cGUsIGZ1bmN0aW9uKHNvY2tldCkge1xuICAgICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtmaWxlXSk7XG4gICAgICAgIHZhciBwYXJzZU9wdGlvbnMgPSB7XG4gICAgICAgICAgZmlsZTogYmxvYlxuICAgICAgICB9O1xuICAgICAgICB1dGlscy5vbkZpbGVQcm9ncmVzcyhwYXJzZU9wdGlvbnMsXG4gICAgICAgICAgLy8gT24gZGF0YSBjaHVua1xuICAgICAgICAgIGZ1bmN0aW9uKGNodW5rKSB7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZChjaHVuayk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBPbiBmaWxlIHJlYWQgZXJyb3JcbiAgICAgICAgICBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciByZWFkaW5nIGZpbGU6ICcsIGV2dC5tZXNzYWdlKTtcbiAgICAgICAgICAgIHNob3dFcnJvcignRXJyb3I6ICcgKyBldnQubWVzc2FnZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBPbiBsb2FkIGVuZFxuICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoeydhY3Rpb24nOiAnc3RvcCd9KSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9LCBcbiAgICAgICAgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgZWZmZWN0cy5zdG9wVG9nZ2xlSW1hZ2UodGltZXIsIHVwbG9hZEltYWdlVGFnLCAndXBsb2FkJyk7XG4gICAgICAgICAgdXBsb2FkVGV4dC50ZXh0KCdTZWxlY3QgRmlsZScpO1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG4gIH1cbn0pKCk7XG5cblxuZXhwb3J0cy5pbml0RmlsZVVwbG9hZCA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gIHZhciBmaWxlVXBsb2FkRGlhbG9nID0gJChcIiNmaWxlVXBsb2FkRGlhbG9nXCIpO1xuXG4gIGZpbGVVcGxvYWREaWFsb2cuY2hhbmdlKGZ1bmN0aW9uKGV2dCkge1xuICAgIHZhciBmaWxlID0gZmlsZVVwbG9hZERpYWxvZy5nZXQoMCkuZmlsZXNbMF07XG4gICAgaGFuZGxlU2VsZWN0ZWRGaWxlKGN0eC50b2tlbiwgZmlsZSk7XG4gIH0pO1xuXG4gICQoXCIjZmlsZVVwbG9hZFRhcmdldFwiKS5jbGljayhmdW5jdGlvbihldnQpIHtcblxuICAgIHZhciBjdXJyZW50bHlEaXNwbGF5aW5nID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycpKTtcblxuICAgIGlmIChjdXJyZW50bHlEaXNwbGF5aW5nKSB7XG4gICAgICBjb25zb2xlLmxvZygnSEFSRCBTT0NLRVQgU1RPUCcpO1xuICAgICAgJC5wdWJsaXNoKCdoYXJkc29ja2V0c3RvcCcpO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCBmYWxzZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZmlsZVVwbG9hZERpYWxvZy52YWwobnVsbCk7XG5cbiAgICBmaWxlVXBsb2FkRGlhbG9nXG4gICAgLnRyaWdnZXIoJ2NsaWNrJyk7XG5cbiAgfSk7XG5cbn0iLCJcbnZhciBpbml0U2Vzc2lvblBlcm1pc3Npb25zID0gcmVxdWlyZSgnLi9zZXNzaW9ucGVybWlzc2lvbnMnKS5pbml0U2Vzc2lvblBlcm1pc3Npb25zO1xudmFyIGluaXRTZWxlY3RNb2RlbCA9IHJlcXVpcmUoJy4vc2VsZWN0bW9kZWwnKS5pbml0U2VsZWN0TW9kZWw7XG52YXIgaW5pdEFuaW1hdGVQYW5lbCA9IHJlcXVpcmUoJy4vYW5pbWF0ZXBhbmVsJykuaW5pdEFuaW1hdGVQYW5lbDtcbnZhciBpbml0U2hvd1RhYiA9IHJlcXVpcmUoJy4vc2hvd3RhYicpLmluaXRTaG93VGFiO1xudmFyIGluaXREcmFnRHJvcCA9IHJlcXVpcmUoJy4vZHJhZ2Ryb3AnKS5pbml0RHJhZ0Ryb3A7XG52YXIgaW5pdFBsYXlTYW1wbGUgPSByZXF1aXJlKCcuL3BsYXlzYW1wbGUnKS5pbml0UGxheVNhbXBsZTtcbnZhciBpbml0UmVjb3JkQnV0dG9uID0gcmVxdWlyZSgnLi9yZWNvcmRidXR0b24nKS5pbml0UmVjb3JkQnV0dG9uO1xudmFyIGluaXRGaWxlVXBsb2FkID0gcmVxdWlyZSgnLi9maWxldXBsb2FkJykuaW5pdEZpbGVVcGxvYWQ7XG52YXIgaW5pdERpc3BsYXlNZXRhZGF0YSA9IHJlcXVpcmUoJy4vZGlzcGxheW1ldGFkYXRhJykuaW5pdERpc3BsYXlNZXRhZGF0YTtcblxuXG5leHBvcnRzLmluaXRWaWV3cyA9IGZ1bmN0aW9uKGN0eCkge1xuICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIHZpZXdzLi4uJyk7XG4gIGluaXRTZWxlY3RNb2RlbChjdHgpO1xuICBpbml0UGxheVNhbXBsZShjdHgpO1xuICBpbml0RHJhZ0Ryb3AoY3R4KTtcbiAgaW5pdFJlY29yZEJ1dHRvbihjdHgpO1xuICBpbml0RmlsZVVwbG9hZChjdHgpO1xuICBpbml0U2Vzc2lvblBlcm1pc3Npb25zKCk7XG4gIGluaXRTaG93VGFiKCk7XG4gIGluaXRBbmltYXRlUGFuZWwoKTtcbiAgaW5pdFNob3dUYWIoKTtcbiAgaW5pdERpc3BsYXlNZXRhZGF0YSgpO1xufVxuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgb25GaWxlUHJvZ3Jlc3MgPSB1dGlscy5vbkZpbGVQcm9ncmVzcztcbnZhciBoYW5kbGVGaWxlVXBsb2FkID0gcmVxdWlyZSgnLi4vaGFuZGxlZmlsZXVwbG9hZCcpLmhhbmRsZUZpbGVVcGxvYWQ7XG52YXIgaW5pdFNvY2tldCA9IHJlcXVpcmUoJy4uL3NvY2tldCcpLmluaXRTb2NrZXQ7XG52YXIgc2hvd0Vycm9yID0gcmVxdWlyZSgnLi9zaG93ZXJyb3InKS5zaG93RXJyb3I7XG52YXIgZWZmZWN0cyA9IHJlcXVpcmUoJy4vZWZmZWN0cycpO1xuXG5cbnZhciBMT09LVVBfVEFCTEUgPSB7XG4gICdlbi1VU19Ccm9hZGJhbmRNb2RlbCc6IFsnVXNfRW5nbGlzaF9Ccm9hZGJhbmRfU2FtcGxlXzEud2F2JywgJ1VzX0VuZ2xpc2hfQnJvYWRiYW5kX1NhbXBsZV8yLndhdiddLFxuICAnZW4tVVNfTmFycm93YmFuZE1vZGVsJzogWydVc19FbmdsaXNoX05hcnJvd2JhbmRfU2FtcGxlXzEud2F2JywgJ1VzX0VuZ2xpc2hfTmFycm93YmFuZF9TYW1wbGVfMi53YXYnXSxcbiAgJ2VzLUVTX0Jyb2FkYmFuZE1vZGVsJzogWydFc19FU19zcGsyNF8xNmtoei53YXYnLCAnRXNfRVNfc3BrMTlfMTZraHoud2F2J10sXG4gICdlcy1FU19OYXJyb3diYW5kTW9kZWwnOiBbJ0VzX0VTX3NwazI0XzhraHoud2F2JywgJ0VzX0VTX3NwazE5XzhraHoud2F2J10sXG4gICdqYS1KUF9Ccm9hZGJhbmRNb2RlbCc6IFsnc2FtcGxlLUphX0pQLXdpZGUxLndhdicsICdzYW1wbGUtSmFfSlAtd2lkZTIud2F2J10sXG4gICdqYS1KUF9OYXJyb3diYW5kTW9kZWwnOiBbJ3NhbXBsZS1KYV9KUC1uYXJyb3czLndhdicsICdzYW1wbGUtSmFfSlAtbmFycm93NC53YXYnXSxcbiAgJ3B0LUJSX0Jyb2FkYmFuZE1vZGVsJzogWydwdC1CUl9TYW1wbGUxLTE2S0h6LndhdicsICdwdC1CUl9TYW1wbGUyLTE2S0h6LndhdiddLFxuICAncHQtQlJfTmFycm93YmFuZE1vZGVsJzogWydwdC1CUl9TYW1wbGUxLThLSHoud2F2JywgJ3B0LUJSX1NhbXBsZTItOEtIei53YXYnXSxcbiAgJ3poLUNOX0Jyb2FkYmFuZE1vZGVsJzogWyd6aC1DTl9zYW1wbGUxX2Zvcl8xNmsud2F2JywgJ3poLUNOX3NhbXBsZTJfZm9yXzE2ay53YXYnXSxcbiAgJ3poLUNOX05hcnJvd2JhbmRNb2RlbCc6IFsnemgtQ05fc2FtcGxlMV9mb3JfOGsud2F2JywgJ3poLUNOX3NhbXBsZTJfZm9yXzhrLndhdiddICBcbn07XG5cbnZhciBwbGF5U2FtcGxlID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBydW5uaW5nID0gZmFsc2U7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgZmFsc2UpO1xuXG4gIHJldHVybiBmdW5jdGlvbih0b2tlbiwgaW1hZ2VUYWcsIGljb25OYW1lLCB1cmwsIGNhbGxiYWNrKSB7XG5cbiAgICAkLnB1Ymxpc2goJ2NsZWFyc2NyZWVuJyk7XG5cbiAgICB2YXIgY3VycmVudGx5RGlzcGxheWluZyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnKSk7XG5cbiAgICBjb25zb2xlLmxvZygnQ1VSUkVOVExZIERJU1BMQVlJTkcnLCBjdXJyZW50bHlEaXNwbGF5aW5nKTtcblxuICAgIC8vIFRoaXMgZXJyb3IgaGFuZGxpbmcgbmVlZHMgdG8gYmUgZXhwYW5kZWQgdG8gYWNjb21vZGF0ZVxuICAgIC8vIHRoZSB0d28gZGlmZmVyZW50IHBsYXkgc2FtcGxlcyBmaWxlc1xuICAgIGlmIChjdXJyZW50bHlEaXNwbGF5aW5nKSB7XG4gICAgICBjb25zb2xlLmxvZygnSEFSRCBTT0NLRVQgU1RPUCcpO1xuICAgICAgJC5wdWJsaXNoKCdzb2NrZXRzdG9wJyk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycsIGZhbHNlKTtcbiAgICAgIGVmZmVjdHMuc3RvcFRvZ2dsZUltYWdlKHRpbWVyLCBpbWFnZVRhZywgaWNvbk5hbWUpO1xuICAgICAgZWZmZWN0cy5yZXN0b3JlSW1hZ2UoaW1hZ2VUYWcsIGljb25OYW1lKTtcbiAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudGx5RGlzcGxheWluZyAmJiBydW5uaW5nKSB7XG4gICAgICBzaG93RXJyb3IoJ0N1cnJlbnRseSBhbm90aGVyIGZpbGUgaXMgcGxheWluZywgcGxlYXNlIHN0b3AgdGhlIGZpbGUgb3Igd2FpdCB1bnRpbCBpdCBmaW5pc2hlcycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50bHlEaXNwbGF5aW5nJywgdHJ1ZSk7XG4gICAgcnVubmluZyA9IHRydWU7XG4gICAgXG4gICAgJCgnI3Jlc3VsdHNUZXh0JykudmFsKCcnKTsgICAvLyBjbGVhciBoeXBvdGhlc2VzIGZyb20gcHJldmlvdXMgcnVuc1xuXG4gICAgdmFyIHRpbWVyID0gc2V0SW50ZXJ2YWwoZWZmZWN0cy50b2dnbGVJbWFnZSwgNzUwLCBpbWFnZVRhZywgaWNvbk5hbWUpO1xuXG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYic7XG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBibG9iID0geGhyLnJlc3BvbnNlO1xuICAgICAgdmFyIGN1cnJlbnRNb2RlbCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50TW9kZWwnKSB8fCAnZW4tVVNfQnJvYWRiYW5kTW9kZWwnO1xuICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICB2YXIgYmxvYlRvVGV4dCA9IG5ldyBCbG9iKFtibG9iXSkuc2xpY2UoMCwgNCk7XG4gICAgICByZWFkZXIucmVhZEFzVGV4dChibG9iVG9UZXh0KTtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbnRlbnRUeXBlID0gcmVhZGVyLnJlc3VsdCA9PT0gJ2ZMYUMnID8gJ2F1ZGlvL2ZsYWMnIDogJ2F1ZGlvL3dhdic7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVcGxvYWRpbmcgZmlsZScsIHJlYWRlci5yZXN1bHQpO1xuICAgICAgICB2YXIgbWVkaWFTb3VyY2VVUkwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICB2YXIgYXVkaW8gPSBuZXcgQXVkaW8oKTtcbiAgICAgICAgYXVkaW8uc3JjID0gbWVkaWFTb3VyY2VVUkw7XG4gICAgICAgIGF1ZGlvLnBsYXkoKTtcbiAgICAgICAgJC5zdWJzY3JpYmUoJ2hhcmRzb2NrZXRzdG9wJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgYXVkaW8ucGF1c2UoKTtcbiAgICAgICAgICBhdWRpby5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgIH0pO1xuICAgICAgICAkLnN1YnNjcmliZSgnc29ja2V0c3RvcCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XG4gICAgICAgICAgYXVkaW8uY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB9KTtcbiAgICAgICAgaGFuZGxlRmlsZVVwbG9hZCh0b2tlbiwgY3VycmVudE1vZGVsLCBibG9iLCBjb250ZW50VHlwZSwgZnVuY3Rpb24oc29ja2V0KSB7XG4gICAgICAgICAgdmFyIHBhcnNlT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGZpbGU6IGJsb2JcbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciBzYW1wbGluZ1JhdGUgPSAoY3VycmVudE1vZGVsLmluZGV4T2YoXCJCcm9hZGJhbmRcIikgIT0gLTEpID8gMTYwMDAgOiA4MDAwO1xuICAgICAgICAgIG9uRmlsZVByb2dyZXNzKHBhcnNlT3B0aW9ucyxcbiAgICAgICAgICAgIC8vIE9uIGRhdGEgY2h1bmtcbiAgICAgICAgICAgIGZ1bmN0aW9uKGNodW5rKSB7XG4gICAgICAgICAgICAgIHNvY2tldC5zZW5kKGNodW5rKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBPbiBmaWxlIHJlYWQgZXJyb3JcbiAgICAgICAgICAgIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgcmVhZGluZyBmaWxlOiAnLCBldnQubWVzc2FnZSk7XG4gICAgICAgICAgICAgIC8vIHNob3dFcnJvcihldnQubWVzc2FnZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gT24gbG9hZCBlbmRcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeSh7J2FjdGlvbic6ICdzdG9wJ30pKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzYW1wbGluZ1JhdGVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sIFxuICAgICAgICAvLyBPbiBjb25uZWN0aW9uIGVuZFxuICAgICAgICAgIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgZWZmZWN0cy5zdG9wVG9nZ2xlSW1hZ2UodGltZXIsIGltYWdlVGFnLCBpY29uTmFtZSk7XG4gICAgICAgICAgICBlZmZlY3RzLnJlc3RvcmVJbWFnZShpbWFnZVRhZywgaWNvbk5hbWUpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRseURpc3BsYXlpbmcnLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfTtcbiAgICB9O1xuICAgIHhoci5zZW5kKCk7XG4gIH07XG59KSgpO1xuXG5cbmV4cG9ydHMuaW5pdFBsYXlTYW1wbGUgPSBmdW5jdGlvbihjdHgpIHtcblxuICAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZpbGVOYW1lID0gJ2F1ZGlvLycgKyBMT09LVVBfVEFCTEVbY3R4LmN1cnJlbnRNb2RlbF1bMF07XG4gICAgdmFyIGVsID0gJCgnLnBsYXktc2FtcGxlLTEnKTtcbiAgICBlbC5vZmYoJ2NsaWNrJyk7XG4gICAgdmFyIGljb25OYW1lID0gJ3BsYXknO1xuICAgIHZhciBpbWFnZVRhZyA9IGVsLmZpbmQoJ2ltZycpO1xuICAgIGVsLmNsaWNrKCBmdW5jdGlvbihldnQpIHtcbiAgICAgIHBsYXlTYW1wbGUoY3R4LnRva2VuLCBpbWFnZVRhZywgaWNvbk5hbWUsIGZpbGVOYW1lLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BsYXkgc2FtcGxlIHJlc3VsdCcsIHJlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSkoY3R4LCBMT09LVVBfVEFCTEUpO1xuXG4gIChmdW5jdGlvbigpIHtcbiAgICB2YXIgZmlsZU5hbWUgPSAnYXVkaW8vJyArIExPT0tVUF9UQUJMRVtjdHguY3VycmVudE1vZGVsXVsxXTtcbiAgICB2YXIgZWwgPSAkKCcucGxheS1zYW1wbGUtMicpO1xuICAgIGVsLm9mZignY2xpY2snKTtcbiAgICB2YXIgaWNvbk5hbWUgPSAncGxheSc7XG4gICAgdmFyIGltYWdlVGFnID0gZWwuZmluZCgnaW1nJyk7XG4gICAgZWwuY2xpY2soIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgcGxheVNhbXBsZShjdHgudG9rZW4sIGltYWdlVGFnLCBpY29uTmFtZSwgZmlsZU5hbWUsIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBjb25zb2xlLmxvZygnUGxheSBzYW1wbGUgcmVzdWx0JywgcmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KShjdHgsIExPT0tVUF9UQUJMRSk7XG5cbn07XG5cblxuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciBNaWNyb3Bob25lID0gcmVxdWlyZSgnLi4vTWljcm9waG9uZScpO1xudmFyIGhhbmRsZU1pY3JvcGhvbmUgPSByZXF1aXJlKCcuLi9oYW5kbGVtaWNyb3Bob25lJykuaGFuZGxlTWljcm9waG9uZTtcbnZhciBzaG93RXJyb3IgPSByZXF1aXJlKCcuL3Nob3dlcnJvcicpLnNob3dFcnJvcjtcbnZhciBzaG93Tm90aWNlID0gcmVxdWlyZSgnLi9zaG93ZXJyb3InKS5zaG93Tm90aWNlO1xuXG5leHBvcnRzLmluaXRSZWNvcmRCdXR0b24gPSBmdW5jdGlvbihjdHgpIHtcblxuICB2YXIgcmVjb3JkQnV0dG9uID0gJCgnI3JlY29yZEJ1dHRvbicpO1xuXG4gIHJlY29yZEJ1dHRvbi5jbGljaygoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcnVubmluZyA9IGZhbHNlO1xuICAgIHZhciB0b2tlbiA9IGN0eC50b2tlbjtcbiAgICB2YXIgbWljT3B0aW9ucyA9IHtcbiAgICAgIGJ1ZmZlclNpemU6IGN0eC5idWZmZXJzaXplXG4gICAgfTtcbiAgICB2YXIgbWljID0gbmV3IE1pY3JvcGhvbmUobWljT3B0aW9ucyk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgYW5jaG9yIGJlaGF2aW9yXG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdmFyIGN1cnJlbnRNb2RlbCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50TW9kZWwnKTtcbiAgICAgIHZhciBjdXJyZW50bHlEaXNwbGF5aW5nID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudGx5RGlzcGxheWluZycpKTtcblxuICAgICAgaWYgKGN1cnJlbnRseURpc3BsYXlpbmcpIHtcbiAgICAgICAgc2hvd0Vycm9yKCdDdXJyZW50bHkgYW5vdGhlciBmaWxlIGlzIHBsYXlpbmcsIHBsZWFzZSBzdG9wIHRoZSBmaWxlIG9yIHdhaXQgdW50aWwgaXQgZmluaXNoZXMnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXJ1bm5pbmcpIHtcbiAgICAgICAgJCgnI3Jlc3VsdHNUZXh0JykuaHRtbCgnJyk7ICAgLy8gY2xlYXIgaHlwb3RoZXNlcyBmcm9tIHByZXZpb3VzIHJ1bnNcbiAgICAgICAgY29uc29sZS5sb2coJ05vdCBydW5uaW5nLCBoYW5kbGVNaWNyb3Bob25lKCknKTtcbiAgICAgICAgaGFuZGxlTWljcm9waG9uZSh0b2tlbiwgY3VycmVudE1vZGVsLCBtaWMsIGZ1bmN0aW9uKGVyciwgc29ja2V0KSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgdmFyIG1zZyA9ICdFcnJvcjogJyArIGVyci5tZXNzYWdlO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgICAgICAgIHNob3dFcnJvcihtc2cpO1xuICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWNvcmRCdXR0b24uY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJywgJyNENjIwMzAnKTtcbiAgICAgICAgICAgIHJlY29yZEJ1dHRvbi5maW5kKCdpbWcnKS5hdHRyKCdzcmMnLCAnaW1hZ2VzL3N0b3Auc3ZnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc3RhcnRpbmcgbWljJyk7XG4gICAgICAgICAgICBtaWMucmVjb3JkKCk7XG4gICAgICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pOyAgICAgICAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnU3RvcHBpbmcgbWljcm9waG9uZSwgc2VuZGluZyBzdG9wIGFjdGlvbiBtZXNzYWdlJyk7XG4gICAgICAgIHJlY29yZEJ1dHRvbi5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICByZWNvcmRCdXR0b24uZmluZCgnaW1nJykuYXR0cignc3JjJywgJ2ltYWdlcy9taWNyb3Bob25lLnN2ZycpO1xuICAgICAgICAkLnB1Ymxpc2goJ2hhcmRzb2NrZXRzdG9wJyk7XG4gICAgICAgIG1pYy5zdG9wKCk7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pKCkpO1xufSIsIlxudmFyIGluaXRQbGF5U2FtcGxlID0gcmVxdWlyZSgnLi9wbGF5c2FtcGxlJykuaW5pdFBsYXlTYW1wbGU7XG5cbmV4cG9ydHMuaW5pdFNlbGVjdE1vZGVsID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgZnVuY3Rpb24gaXNEZWZhdWx0KG1vZGVsKSB7XG4gICAgcmV0dXJuIG1vZGVsID09PSAnZW4tVVNfQnJvYWRiYW5kTW9kZWwnO1xuICB9XG5cbiAgY3R4Lm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgJChcIiNkcm9wZG93bk1lbnVMaXN0XCIpLmFwcGVuZChcbiAgICAgICQoXCI8bGk+XCIpXG4gICAgICAgIC5hdHRyKCdyb2xlJywgJ3ByZXNlbnRhdGlvbicpXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgJCgnPGE+JykuYXR0cigncm9sZScsICdtZW51LWl0ZW0nKVxuICAgICAgICAgICAgLmF0dHIoJ2hyZWYnLCAnLycpXG4gICAgICAgICAgICAuYXR0cignZGF0YS1tb2RlbCcsIG1vZGVsLm5hbWUpXG4gICAgICAgICAgICAuYXBwZW5kKG1vZGVsLmRlc2NyaXB0aW9uKVxuICAgICAgICAgIClcbiAgICAgIClcbiAgfSk7XG5cbiAgJChcIiNkcm9wZG93bk1lbnVMaXN0XCIpLmNsaWNrKGZ1bmN0aW9uKGV2dCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBjb25zb2xlLmxvZygnQ2hhbmdlIHZpZXcnLCAkKGV2dC50YXJnZXQpLnRleHQoKSk7XG4gICAgdmFyIG5ld01vZGVsRGVzY3JpcHRpb24gPSAkKGV2dC50YXJnZXQpLnRleHQoKTtcbiAgICB2YXIgbmV3TW9kZWwgPSAkKGV2dC50YXJnZXQpLmRhdGEoJ21vZGVsJyk7XG4gICAgJCgnI2Ryb3Bkb3duTWVudURlZmF1bHQnKS5lbXB0eSgpLnRleHQobmV3TW9kZWxEZXNjcmlwdGlvbik7XG4gICAgJCgnI2Ryb3Bkb3duTWVudTEnKS5kcm9wZG93bigndG9nZ2xlJyk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRNb2RlbCcsIG5ld01vZGVsKTtcbiAgICBjdHguY3VycmVudE1vZGVsID0gbmV3TW9kZWw7XG4gICAgaW5pdFBsYXlTYW1wbGUoY3R4KTtcbiAgICAkLnB1Ymxpc2goJ2NsZWFyc2NyZWVuJyk7XG4gIH0pO1xuXG59IiwiXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuaW5pdFNlc3Npb25QZXJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIHNlc3Npb24gcGVybWlzc2lvbnMgaGFuZGxlcicpO1xuICAvLyBSYWRpbyBidXR0b25zXG4gIHZhciBzZXNzaW9uUGVybWlzc2lvbnNSYWRpbyA9ICQoXCIjc2Vzc2lvblBlcm1pc3Npb25zUmFkaW9Hcm91cCBpbnB1dFt0eXBlPSdyYWRpbyddXCIpO1xuICBzZXNzaW9uUGVybWlzc2lvbnNSYWRpby5jbGljayhmdW5jdGlvbihldnQpIHtcbiAgICB2YXIgY2hlY2tlZFZhbHVlID0gc2Vzc2lvblBlcm1pc3Npb25zUmFkaW8uZmlsdGVyKCc6Y2hlY2tlZCcpLnZhbCgpO1xuICAgIGNvbnNvbGUubG9nKCdjaGVja2VkVmFsdWUnLCBjaGVja2VkVmFsdWUpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzZXNzaW9uUGVybWlzc2lvbnMnLCBjaGVja2VkVmFsdWUpO1xuICB9KTtcbn1cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLnNob3dFcnJvciA9IGZ1bmN0aW9uKG1zZykge1xuICBjb25zb2xlLmxvZygnRXJyb3I6ICcsIG1zZyk7XG4gIHZhciBlcnJvckFsZXJ0ID0gJCgnLmVycm9yLXJvdycpO1xuICBlcnJvckFsZXJ0LmhpZGUoKTtcbiAgZXJyb3JBbGVydC5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAnI2Q3NDEwOCcpO1xuICBlcnJvckFsZXJ0LmNzcygnY29sb3InLCAnd2hpdGUnKTtcbiAgdmFyIGVycm9yTWVzc2FnZSA9ICQoJyNlcnJvck1lc3NhZ2UnKTtcbiAgZXJyb3JNZXNzYWdlLnRleHQobXNnKTtcbiAgZXJyb3JBbGVydC5zaG93KCk7XG4gICQoJyNlcnJvckNsb3NlJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlcnJvckFsZXJ0LmhpZGUoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufVxuXG5leHBvcnRzLnNob3dOb3RpY2UgPSBmdW5jdGlvbihtc2cpIHtcbiAgY29uc29sZS5sb2coJ05vdGljZTogJywgbXNnKTtcbiAgdmFyIG5vdGljZUFsZXJ0ID0gJCgnLm5vdGlmaWNhdGlvbi1yb3cnKTtcbiAgbm90aWNlQWxlcnQuaGlkZSgpO1xuICBub3RpY2VBbGVydC5jc3MoJ2JvcmRlcicsICcycHggc29saWQgI2VjZWNlYycpO1xuICBub3RpY2VBbGVydC5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAnI2Y0ZjRmNCcpO1xuICBub3RpY2VBbGVydC5jc3MoJ2NvbG9yJywgJ2JsYWNrJyk7XG4gIHZhciBub3RpY2VNZXNzYWdlID0gJCgnI25vdGlmaWNhdGlvbk1lc3NhZ2UnKTtcbiAgbm90aWNlTWVzc2FnZS50ZXh0KG1zZyk7XG4gIG5vdGljZUFsZXJ0LnNob3coKTtcbiAgJCgnI25vdGlmaWNhdGlvbkNsb3NlJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBub3RpY2VBbGVydC5oaWRlKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn1cblxuZXhwb3J0cy5oaWRlRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGVycm9yQWxlcnQgPSAkKCcuZXJyb3Itcm93Jyk7XG4gIGVycm9yQWxlcnQuaGlkZSgpO1xufSIsIlxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmluaXRTaG93VGFiID0gZnVuY3Rpb24oKSB7XG5cbiAgJCgnLm5hdi10YWJzIGFbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKS5vbignc2hvd24uYnMudGFiJywgZnVuY3Rpb24gKGUpIHtcbiAgICAvL3Nob3cgc2VsZWN0ZWQgdGFiIC8gYWN0aXZlXG4gICAgdmFyIHRhcmdldCA9ICQoZS50YXJnZXQpLnRleHQoKTtcbiAgICBpZiAodGFyZ2V0ID09PSAnSlNPTicpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzaG93aW5nIGpzb24nKTtcbiAgICAgICQucHVibGlzaCgnc2hvd2pzb24nKTtcbiAgICB9XG4gIH0pO1xuXG59Il19
