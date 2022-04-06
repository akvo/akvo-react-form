import React__default, { createContext, useContext, useEffect, forwardRef, createElement, useState, useRef, useMemo } from 'react';
import { Form, Cascader, Col, Select, Row, DatePicker, InputNumber, Input, Divider, Button, Radio, Space, TreeSelect, Card, Table, List } from 'antd';
import { getByTag } from 'locale-codes';
import { MdRepeat, MdDelete, MdCheckCircle, MdRadioButtonChecked } from 'react-icons/md';
import 'antd/dist/antd.min.css';
import range from 'lodash/range';
import intersection from 'lodash/intersection';
import axios from 'axios';
import take from 'lodash/take';
import L from 'leaflet';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import TextArea from 'antd/lib/input/TextArea';
import { cloneDeep } from 'lodash';

var IconContext = /*#__PURE__*/createContext({});

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var classnames = createCommonjsModule(function (module) {
/*!
  Copyright (c) 2018 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {

	var hasOwn = {}.hasOwnProperty;

	function classNames() {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				if (arg.length) {
					var inner = classNames.apply(null, arg);
					if (inner) {
						classes.push(inner);
					}
				}
			} else if (argType === 'object') {
				if (arg.toString === Object.prototype.toString) {
					for (var key in arg) {
						if (hasOwn.call(arg, key) && arg[key]) {
							classes.push(key);
						}
					}
				} else {
					classes.push(arg.toString());
				}
			}
		}

		return classes.join(' ');
	}

	if ( module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else {
		window.classNames = classNames;
	}
}());
});

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

/**
 * Take input from [0, n] and return it as [0, 1]
 * @hidden
 */
function bound01(n, max) {
    if (isOnePointZero(n)) {
        n = '100%';
    }
    var isPercent = isPercentage(n);
    n = max === 360 ? n : Math.min(max, Math.max(0, parseFloat(n)));
    // Automatically convert percentage into number
    if (isPercent) {
        n = parseInt(String(n * max), 10) / 100;
    }
    // Handle floating point rounding errors
    if (Math.abs(n - max) < 0.000001) {
        return 1;
    }
    // Convert into [0, 1] range if it isn't already
    if (max === 360) {
        // If n is a hue given in degrees,
        // wrap around out-of-range values into [0, 360] range
        // then convert into [0, 1].
        n = (n < 0 ? (n % max) + max : n % max) / parseFloat(String(max));
    }
    else {
        // If n not a hue given in degrees
        // Convert into [0, 1] range if it isn't already.
        n = (n % max) / parseFloat(String(max));
    }
    return n;
}
/**
 * Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
 * <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
 * @hidden
 */
function isOnePointZero(n) {
    return typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1;
}
/**
 * Check to see if string passed in is a percentage
 * @hidden
 */
function isPercentage(n) {
    return typeof n === 'string' && n.indexOf('%') !== -1;
}
/**
 * Return a valid alpha value [0,1] with all invalid values being set to 1
 * @hidden
 */
function boundAlpha(a) {
    a = parseFloat(a);
    if (isNaN(a) || a < 0 || a > 1) {
        a = 1;
    }
    return a;
}
/**
 * Replace a decimal with it's percentage value
 * @hidden
 */
function convertToPercentage(n) {
    if (n <= 1) {
        return Number(n) * 100 + "%";
    }
    return n;
}
/**
 * Force a hex value to have 2 characters
 * @hidden
 */
function pad2(c) {
    return c.length === 1 ? '0' + c : String(c);
}

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>
/**
 * Handle bounds / percentage checking to conform to CSS color spec
 * <http://www.w3.org/TR/css3-color/>
 * *Assumes:* r, g, b in [0, 255] or [0, 1]
 * *Returns:* { r, g, b } in [0, 255]
 */
function rgbToRgb(r, g, b) {
    return {
        r: bound01(r, 255) * 255,
        g: bound01(g, 255) * 255,
        b: bound01(b, 255) * 255,
    };
}
function hue2rgb(p, q, t) {
    if (t < 0) {
        t += 1;
    }
    if (t > 1) {
        t -= 1;
    }
    if (t < 1 / 6) {
        return p + (q - p) * (6 * t);
    }
    if (t < 1 / 2) {
        return q;
    }
    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
}
/**
 * Converts an HSL color value to RGB.
 *
 * *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
 * *Returns:* { r, g, b } in the set [0, 255]
 */
function hslToRgb(h, s, l) {
    var r;
    var g;
    var b;
    h = bound01(h, 360);
    s = bound01(s, 100);
    l = bound01(l, 100);
    if (s === 0) {
        // achromatic
        g = l;
        b = l;
        r = l;
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
}
/**
 * Converts an RGB color value to HSV
 *
 * *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
 * *Returns:* { h, s, v } in [0,1]
 */
function rgbToHsv(r, g, b) {
    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var v = max;
    var d = max - min;
    var s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0; // achromatic
    }
    else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return { h: h, s: s, v: v };
}
/**
 * Converts an HSV color value to RGB.
 *
 * *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
 * *Returns:* { r, g, b } in the set [0, 255]
 */
function hsvToRgb(h, s, v) {
    h = bound01(h, 360) * 6;
    s = bound01(s, 100);
    v = bound01(v, 100);
    var i = Math.floor(h);
    var f = h - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var mod = i % 6;
    var r = [v, q, p, p, t, v][mod];
    var g = [t, v, v, q, p, p][mod];
    var b = [p, p, t, v, v, q][mod];
    return { r: r * 255, g: g * 255, b: b * 255 };
}
/**
 * Converts an RGB color to hex
 *
 * Assumes r, g, and b are contained in the set [0, 255]
 * Returns a 3 or 6 character hex
 */
function rgbToHex(r, g, b, allow3Char) {
    var hex = [
        pad2(Math.round(r).toString(16)),
        pad2(Math.round(g).toString(16)),
        pad2(Math.round(b).toString(16)),
    ];
    // Return a 3 character hex if possible
    if (allow3Char &&
        hex[0].startsWith(hex[0].charAt(1)) &&
        hex[1].startsWith(hex[1].charAt(1)) &&
        hex[2].startsWith(hex[2].charAt(1))) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }
    return hex.join('');
}
/** Converts a hex value to a decimal */
function convertHexToDecimal(h) {
    return parseIntFromHex(h) / 255;
}
/** Parse a base-16 hex value into a base-10 integer */
function parseIntFromHex(val) {
    return parseInt(val, 16);
}

// https://github.com/bahamas10/css-color-names/blob/master/css-color-names.json
/**
 * @hidden
 */
var names = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkgrey: '#a9a9a9',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkslategrey: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    goldenrod: '#daa520',
    gold: '#ffd700',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    grey: '#808080',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavenderblush: '#fff0f5',
    lavender: '#e6e6fa',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgray: '#d3d3d3',
    lightgreen: '#90ee90',
    lightgrey: '#d3d3d3',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370db',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#db7093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    rebeccapurple: '#663399',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32',
};

/**
 * Given a string or object, convert that input to RGB
 *
 * Possible string inputs:
 * ```
 * "red"
 * "#f00" or "f00"
 * "#ff0000" or "ff0000"
 * "#ff000000" or "ff000000"
 * "rgb 255 0 0" or "rgb (255, 0, 0)"
 * "rgb 1.0 0 0" or "rgb (1, 0, 0)"
 * "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
 * "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
 * "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
 * "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
 * "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
 * ```
 */
function inputToRGB(color) {
    var rgb = { r: 0, g: 0, b: 0 };
    var a = 1;
    var s = null;
    var v = null;
    var l = null;
    var ok = false;
    var format = false;
    if (typeof color === 'string') {
        color = stringInputToObject(color);
    }
    if (typeof color === 'object') {
        if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
            rgb = rgbToRgb(color.r, color.g, color.b);
            ok = true;
            format = String(color.r).substr(-1) === '%' ? 'prgb' : 'rgb';
        }
        else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
            s = convertToPercentage(color.s);
            v = convertToPercentage(color.v);
            rgb = hsvToRgb(color.h, s, v);
            ok = true;
            format = 'hsv';
        }
        else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
            s = convertToPercentage(color.s);
            l = convertToPercentage(color.l);
            rgb = hslToRgb(color.h, s, l);
            ok = true;
            format = 'hsl';
        }
        if (Object.prototype.hasOwnProperty.call(color, 'a')) {
            a = color.a;
        }
    }
    a = boundAlpha(a);
    return {
        ok: ok,
        format: color.format || format,
        r: Math.min(255, Math.max(rgb.r, 0)),
        g: Math.min(255, Math.max(rgb.g, 0)),
        b: Math.min(255, Math.max(rgb.b, 0)),
        a: a,
    };
}
// <http://www.w3.org/TR/css3-values/#integers>
var CSS_INTEGER = '[-\\+]?\\d+%?';
// <http://www.w3.org/TR/css3-values/#number-value>
var CSS_NUMBER = '[-\\+]?\\d*\\.\\d+%?';
// Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";
// Actual matching.
// Parentheses and commas are optional, but not required.
// Whitespace can take the place of commas or opening paren
var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
var matchers = {
    CSS_UNIT: new RegExp(CSS_UNIT),
    rgb: new RegExp('rgb' + PERMISSIVE_MATCH3),
    rgba: new RegExp('rgba' + PERMISSIVE_MATCH4),
    hsl: new RegExp('hsl' + PERMISSIVE_MATCH3),
    hsla: new RegExp('hsla' + PERMISSIVE_MATCH4),
    hsv: new RegExp('hsv' + PERMISSIVE_MATCH3),
    hsva: new RegExp('hsva' + PERMISSIVE_MATCH4),
    hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
};
/**
 * Permissive string parsing.  Take in a number of formats, and output an object
 * based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
 */
function stringInputToObject(color) {
    color = color.trim().toLowerCase();
    if (color.length === 0) {
        return false;
    }
    var named = false;
    if (names[color]) {
        color = names[color];
        named = true;
    }
    else if (color === 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0, format: 'name' };
    }
    // Try to match string input using regular expressions.
    // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
    // Just return an object and let the conversion functions handle that.
    // This way the result will be the same whether the tinycolor is initialized with string or object.
    var match = matchers.rgb.exec(color);
    if (match) {
        return { r: match[1], g: match[2], b: match[3] };
    }
    match = matchers.rgba.exec(color);
    if (match) {
        return { r: match[1], g: match[2], b: match[3], a: match[4] };
    }
    match = matchers.hsl.exec(color);
    if (match) {
        return { h: match[1], s: match[2], l: match[3] };
    }
    match = matchers.hsla.exec(color);
    if (match) {
        return { h: match[1], s: match[2], l: match[3], a: match[4] };
    }
    match = matchers.hsv.exec(color);
    if (match) {
        return { h: match[1], s: match[2], v: match[3] };
    }
    match = matchers.hsva.exec(color);
    if (match) {
        return { h: match[1], s: match[2], v: match[3], a: match[4] };
    }
    match = matchers.hex8.exec(color);
    if (match) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            a: convertHexToDecimal(match[4]),
            format: named ? 'name' : 'hex8',
        };
    }
    match = matchers.hex6.exec(color);
    if (match) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            format: named ? 'name' : 'hex',
        };
    }
    match = matchers.hex4.exec(color);
    if (match) {
        return {
            r: parseIntFromHex(match[1] + match[1]),
            g: parseIntFromHex(match[2] + match[2]),
            b: parseIntFromHex(match[3] + match[3]),
            a: convertHexToDecimal(match[4] + match[4]),
            format: named ? 'name' : 'hex8',
        };
    }
    match = matchers.hex3.exec(color);
    if (match) {
        return {
            r: parseIntFromHex(match[1] + match[1]),
            g: parseIntFromHex(match[2] + match[2]),
            b: parseIntFromHex(match[3] + match[3]),
            format: named ? 'name' : 'hex',
        };
    }
    return false;
}
/**
 * Check to see if it looks like a CSS unit
 * (see `matchers` above for definition).
 */
function isValidCSSUnit(color) {
    return Boolean(matchers.CSS_UNIT.exec(String(color)));
}

var hueStep = 2; // 色相阶梯

var saturationStep = 0.16; // 饱和度阶梯，浅色部分

var saturationStep2 = 0.05; // 饱和度阶梯，深色部分

var brightnessStep1 = 0.05; // 亮度阶梯，浅色部分

var brightnessStep2 = 0.15; // 亮度阶梯，深色部分

var lightColorCount = 5; // 浅色数量，主色上

var darkColorCount = 4; // 深色数量，主色下
// 暗色主题颜色映射关系表

var darkColorMap = [{
  index: 7,
  opacity: 0.15
}, {
  index: 6,
  opacity: 0.25
}, {
  index: 5,
  opacity: 0.3
}, {
  index: 5,
  opacity: 0.45
}, {
  index: 5,
  opacity: 0.65
}, {
  index: 5,
  opacity: 0.85
}, {
  index: 4,
  opacity: 0.9
}, {
  index: 3,
  opacity: 0.95
}, {
  index: 2,
  opacity: 0.97
}, {
  index: 1,
  opacity: 0.98
}]; // Wrapper function ported from TinyColor.prototype.toHsv
// Keep it here because of `hsv.h * 360`

function toHsv(_ref) {
  var r = _ref.r,
      g = _ref.g,
      b = _ref.b;
  var hsv = rgbToHsv(r, g, b);
  return {
    h: hsv.h * 360,
    s: hsv.s,
    v: hsv.v
  };
} // Wrapper function ported from TinyColor.prototype.toHexString
// Keep it here because of the prefix `#`


function toHex(_ref2) {
  var r = _ref2.r,
      g = _ref2.g,
      b = _ref2.b;
  return "#".concat(rgbToHex(r, g, b, false));
} // Wrapper function ported from TinyColor.prototype.mix, not treeshakable.
// Amount in range [0, 1]
// Assume color1 & color2 has no alpha, since the following src code did so.


function mix(rgb1, rgb2, amount) {
  var p = amount / 100;
  var rgb = {
    r: (rgb2.r - rgb1.r) * p + rgb1.r,
    g: (rgb2.g - rgb1.g) * p + rgb1.g,
    b: (rgb2.b - rgb1.b) * p + rgb1.b
  };
  return rgb;
}

function getHue(hsv, i, light) {
  var hue; // 根据色相不同，色相转向不同

  if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
    hue = light ? Math.round(hsv.h) - hueStep * i : Math.round(hsv.h) + hueStep * i;
  } else {
    hue = light ? Math.round(hsv.h) + hueStep * i : Math.round(hsv.h) - hueStep * i;
  }

  if (hue < 0) {
    hue += 360;
  } else if (hue >= 360) {
    hue -= 360;
  }

  return hue;
}

function getSaturation(hsv, i, light) {
  // grey color don't change saturation
  if (hsv.h === 0 && hsv.s === 0) {
    return hsv.s;
  }

  var saturation;

  if (light) {
    saturation = hsv.s - saturationStep * i;
  } else if (i === darkColorCount) {
    saturation = hsv.s + saturationStep;
  } else {
    saturation = hsv.s + saturationStep2 * i;
  } // 边界值修正


  if (saturation > 1) {
    saturation = 1;
  } // 第一格的 s 限制在 0.06-0.1 之间


  if (light && i === lightColorCount && saturation > 0.1) {
    saturation = 0.1;
  }

  if (saturation < 0.06) {
    saturation = 0.06;
  }

  return Number(saturation.toFixed(2));
}

function getValue(hsv, i, light) {
  var value;

  if (light) {
    value = hsv.v + brightnessStep1 * i;
  } else {
    value = hsv.v - brightnessStep2 * i;
  }

  if (value > 1) {
    value = 1;
  }

  return Number(value.toFixed(2));
}

function generate(color) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var patterns = [];
  var pColor = inputToRGB(color);

  for (var i = lightColorCount; i > 0; i -= 1) {
    var hsv = toHsv(pColor);
    var colorString = toHex(inputToRGB({
      h: getHue(hsv, i, true),
      s: getSaturation(hsv, i, true),
      v: getValue(hsv, i, true)
    }));
    patterns.push(colorString);
  }

  patterns.push(toHex(pColor));

  for (var _i = 1; _i <= darkColorCount; _i += 1) {
    var _hsv = toHsv(pColor);

    var _colorString = toHex(inputToRGB({
      h: getHue(_hsv, _i),
      s: getSaturation(_hsv, _i),
      v: getValue(_hsv, _i)
    }));

    patterns.push(_colorString);
  } // dark theme patterns


  if (opts.theme === 'dark') {
    return darkColorMap.map(function (_ref3) {
      var index = _ref3.index,
          opacity = _ref3.opacity;
      var darkColorString = toHex(mix(inputToRGB(opts.backgroundColor || '#141414'), inputToRGB(patterns[index]), opacity * 100));
      return darkColorString;
    });
  }

  return patterns;
}

var presetPrimaryColors = {
  red: '#F5222D',
  volcano: '#FA541C',
  orange: '#FA8C16',
  gold: '#FAAD14',
  yellow: '#FADB14',
  lime: '#A0D911',
  green: '#52C41A',
  cyan: '#13C2C2',
  blue: '#1890FF',
  geekblue: '#2F54EB',
  purple: '#722ED1',
  magenta: '#EB2F96',
  grey: '#666666'
};
var presetPalettes = {};
var presetDarkPalettes = {};
Object.keys(presetPrimaryColors).forEach(function (key) {
  presetPalettes[key] = generate(presetPrimaryColors[key]);
  presetPalettes[key].primary = presetPalettes[key][5]; // dark presetPalettes

  presetDarkPalettes[key] = generate(presetPrimaryColors[key], {
    theme: 'dark',
    backgroundColor: '#141414'
  });
  presetDarkPalettes[key].primary = presetDarkPalettes[key][5];
});

/* eslint-disable no-console */
var warned = {};
function warning(valid, message) {
  // Support uglify
  if (process.env.NODE_ENV !== 'production' && !valid && console !== undefined) {
    console.error("Warning: ".concat(message));
  }
}
function call(method, valid, message) {
  if (!valid && !warned[message]) {
    method(false, message);
    warned[message] = true;
  }
}
function warningOnce(valid, message) {
  call(warning, valid, message);
}
/* eslint-enable */

function canUseDom() {
  return !!(typeof window !== 'undefined' && window.document && window.document.createElement);
}

var MARK_KEY = "rc-util-key";

function getContainer(option) {
  if (option.attachTo) {
    return option.attachTo;
  }

  var head = document.querySelector('head');
  return head || document.body;
}

function injectCSS(css) {
  var _option$csp;

  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!canUseDom()) {
    return null;
  }

  var styleNode = document.createElement('style');

  if ((_option$csp = option.csp) === null || _option$csp === void 0 ? void 0 : _option$csp.nonce) {
    var _option$csp2;

    styleNode.nonce = (_option$csp2 = option.csp) === null || _option$csp2 === void 0 ? void 0 : _option$csp2.nonce;
  }

  styleNode.innerHTML = css;
  var container = getContainer(option);
  var firstChild = container.firstChild;

  if (option.prepend && container.prepend) {
    // Use `prepend` first
    container.prepend(styleNode);
  } else if (option.prepend && firstChild) {
    // Fallback to `insertBefore` like IE not support `prepend`
    container.insertBefore(styleNode, firstChild);
  } else {
    container.appendChild(styleNode);
  }

  return styleNode;
}
var containerCache = new Map();
function updateCSS(css, key) {
  var option = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var container = getContainer(option); // Get real parent

  if (!containerCache.has(container)) {
    var placeholderStyle = injectCSS('', option);
    var parentNode = placeholderStyle.parentNode;
    containerCache.set(container, parentNode);
    parentNode.removeChild(placeholderStyle);
  }

  var existNode = Array.from(containerCache.get(container).children).find(function (node) {
    return node.tagName === 'STYLE' && node[MARK_KEY] === key;
  });

  if (existNode) {
    var _option$csp3, _option$csp4;

    if (((_option$csp3 = option.csp) === null || _option$csp3 === void 0 ? void 0 : _option$csp3.nonce) && existNode.nonce !== ((_option$csp4 = option.csp) === null || _option$csp4 === void 0 ? void 0 : _option$csp4.nonce)) {
      var _option$csp5;

      existNode.nonce = (_option$csp5 = option.csp) === null || _option$csp5 === void 0 ? void 0 : _option$csp5.nonce;
    }

    if (existNode.innerHTML !== css) {
      existNode.innerHTML = css;
    }

    return existNode;
  }

  var newNode = injectCSS(css, option);
  newNode[MARK_KEY] = key;
  return newNode;
}

function warning$1(valid, message) {
  warningOnce(valid, "[@ant-design/icons] ".concat(message));
}
function isIconDefinition(target) {
  return _typeof(target) === 'object' && typeof target.name === 'string' && typeof target.theme === 'string' && (_typeof(target.icon) === 'object' || typeof target.icon === 'function');
}
function normalizeAttrs() {
  var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Object.keys(attrs).reduce(function (acc, key) {
    var val = attrs[key];

    switch (key) {
      case 'class':
        acc.className = val;
        delete acc.class;
        break;

      default:
        acc[key] = val;
    }

    return acc;
  }, {});
}
function generate$1(node, key, rootProps) {
  if (!rootProps) {
    return /*#__PURE__*/React__default.createElement(node.tag, _objectSpread2({
      key: key
    }, normalizeAttrs(node.attrs)), (node.children || []).map(function (child, index) {
      return generate$1(child, "".concat(key, "-").concat(node.tag, "-").concat(index));
    }));
  }

  return /*#__PURE__*/React__default.createElement(node.tag, _objectSpread2(_objectSpread2({
    key: key
  }, normalizeAttrs(node.attrs)), rootProps), (node.children || []).map(function (child, index) {
    return generate$1(child, "".concat(key, "-").concat(node.tag, "-").concat(index));
  }));
}
function getSecondaryColor(primaryColor) {
  // choose the second color
  return generate(primaryColor)[0];
}
function normalizeTwoToneColors(twoToneColor) {
  if (!twoToneColor) {
    return [];
  }

  return Array.isArray(twoToneColor) ? twoToneColor : [twoToneColor];
} // These props make sure that the SVG behaviours like general text.
var iconStyles = "\n.anticon {\n  display: inline-block;\n  color: inherit;\n  font-style: normal;\n  line-height: 0;\n  text-align: center;\n  text-transform: none;\n  vertical-align: -0.125em;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n.anticon > * {\n  line-height: 1;\n}\n\n.anticon svg {\n  display: inline-block;\n}\n\n.anticon::before {\n  display: none;\n}\n\n.anticon .anticon-icon {\n  display: block;\n}\n\n.anticon[tabindex] {\n  cursor: pointer;\n}\n\n.anticon-spin::before,\n.anticon-spin {\n  display: inline-block;\n  -webkit-animation: loadingCircle 1s infinite linear;\n  animation: loadingCircle 1s infinite linear;\n}\n\n@-webkit-keyframes loadingCircle {\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes loadingCircle {\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n";
var useInsertStyles = function useInsertStyles() {
  var styleStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iconStyles;

  var _useContext = useContext(IconContext),
      csp = _useContext.csp;

  useEffect(function () {
    updateCSS(styleStr, '@ant-design-icons', {
      prepend: true,
      csp: csp
    });
  }, []);
};

var _excluded = ["icon", "className", "onClick", "style", "primaryColor", "secondaryColor"];
var twoToneColorPalette = {
  primaryColor: '#333',
  secondaryColor: '#E6E6E6',
  calculated: false
};

function setTwoToneColors(_ref) {
  var primaryColor = _ref.primaryColor,
      secondaryColor = _ref.secondaryColor;
  twoToneColorPalette.primaryColor = primaryColor;
  twoToneColorPalette.secondaryColor = secondaryColor || getSecondaryColor(primaryColor);
  twoToneColorPalette.calculated = !!secondaryColor;
}

function getTwoToneColors() {
  return _objectSpread2({}, twoToneColorPalette);
}

var IconBase = function IconBase(props) {
  var icon = props.icon,
      className = props.className,
      onClick = props.onClick,
      style = props.style,
      primaryColor = props.primaryColor,
      secondaryColor = props.secondaryColor,
      restProps = _objectWithoutProperties(props, _excluded);

  var colors = twoToneColorPalette;

  if (primaryColor) {
    colors = {
      primaryColor: primaryColor,
      secondaryColor: secondaryColor || getSecondaryColor(primaryColor)
    };
  }

  useInsertStyles();
  warning$1(isIconDefinition(icon), "icon should be icon definiton, but got ".concat(icon));

  if (!isIconDefinition(icon)) {
    return null;
  }

  var target = icon;

  if (target && typeof target.icon === 'function') {
    target = _objectSpread2(_objectSpread2({}, target), {}, {
      icon: target.icon(colors.primaryColor, colors.secondaryColor)
    });
  }

  return generate$1(target.icon, "svg-".concat(target.name), _objectSpread2({
    className: className,
    onClick: onClick,
    style: style,
    'data-icon': target.name,
    width: '1em',
    height: '1em',
    fill: 'currentColor',
    'aria-hidden': 'true'
  }, restProps));
};

IconBase.displayName = 'IconReact';
IconBase.getTwoToneColors = getTwoToneColors;
IconBase.setTwoToneColors = setTwoToneColors;

function setTwoToneColor(twoToneColor) {
  var _normalizeTwoToneColo = normalizeTwoToneColors(twoToneColor),
      _normalizeTwoToneColo2 = _slicedToArray(_normalizeTwoToneColo, 2),
      primaryColor = _normalizeTwoToneColo2[0],
      secondaryColor = _normalizeTwoToneColo2[1];

  return IconBase.setTwoToneColors({
    primaryColor: primaryColor,
    secondaryColor: secondaryColor
  });
}
function getTwoToneColor() {
  var colors = IconBase.getTwoToneColors();

  if (!colors.calculated) {
    return colors.primaryColor;
  }

  return [colors.primaryColor, colors.secondaryColor];
}

var _excluded$1 = ["className", "icon", "spin", "rotate", "tabIndex", "onClick", "twoToneColor"];
// should move it to antd main repo?

setTwoToneColor('#1890ff');
var Icon = /*#__PURE__*/forwardRef(function (props, ref) {
  var _classNames;

  var className = props.className,
      icon = props.icon,
      spin = props.spin,
      rotate = props.rotate,
      tabIndex = props.tabIndex,
      onClick = props.onClick,
      twoToneColor = props.twoToneColor,
      restProps = _objectWithoutProperties(props, _excluded$1);

  var _React$useContext = useContext(IconContext),
      _React$useContext$pre = _React$useContext.prefixCls,
      prefixCls = _React$useContext$pre === void 0 ? 'anticon' : _React$useContext$pre;

  var classString = classnames(prefixCls, (_classNames = {}, _defineProperty(_classNames, "".concat(prefixCls, "-").concat(icon.name), !!icon.name), _defineProperty(_classNames, "".concat(prefixCls, "-spin"), !!spin || icon.name === 'loading'), _classNames), className);
  var iconTabIndex = tabIndex;

  if (iconTabIndex === undefined && onClick) {
    iconTabIndex = -1;
  }

  var svgStyle = rotate ? {
    msTransform: "rotate(".concat(rotate, "deg)"),
    transform: "rotate(".concat(rotate, "deg)")
  } : undefined;

  var _normalizeTwoToneColo = normalizeTwoToneColors(twoToneColor),
      _normalizeTwoToneColo2 = _slicedToArray(_normalizeTwoToneColo, 2),
      primaryColor = _normalizeTwoToneColo2[0],
      secondaryColor = _normalizeTwoToneColo2[1];

  return /*#__PURE__*/createElement("span", _objectSpread2(_objectSpread2({
    role: "img",
    "aria-label": icon.name
  }, restProps), {}, {
    ref: ref,
    tabIndex: iconTabIndex,
    onClick: onClick,
    className: classString
  }), /*#__PURE__*/createElement(IconBase, {
    icon: icon,
    primaryColor: primaryColor,
    secondaryColor: secondaryColor,
    style: svgStyle
  }));
});
Icon.displayName = 'AntdIcon';
Icon.getTwoToneColor = getTwoToneColor;
Icon.setTwoToneColor = setTwoToneColor;

// This icon file is generated automatically.
var MinusOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" } }] }, "name": "minus", "theme": "outlined" };

var MinusOutlined$1 = function MinusOutlined$1(props, ref) {
  return /*#__PURE__*/createElement(Icon, _objectSpread2(_objectSpread2({}, props), {}, {
    ref: ref,
    icon: MinusOutlined
  }));
};

MinusOutlined$1.displayName = 'MinusOutlined';
var MinusOutlined$2 = /*#__PURE__*/forwardRef(MinusOutlined$1);

// This icon file is generated automatically.
var PlusOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "defs", "attrs": {}, "children": [{ "tag": "style", "attrs": {} }] }, { "tag": "path", "attrs": { "d": "M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" } }, { "tag": "path", "attrs": { "d": "M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z" } }] }, "name": "plus", "theme": "outlined" };

var PlusOutlined$1 = function PlusOutlined$1(props, ref) {
  return /*#__PURE__*/createElement(Icon, _objectSpread2(_objectSpread2({}, props), {}, {
    ref: ref,
    icon: PlusOutlined
  }));
};

PlusOutlined$1.displayName = 'PlusOutlined';
var PlusOutlined$2 = /*#__PURE__*/forwardRef(PlusOutlined$1);

// This icon file is generated automatically.
var PlusSquareFilled = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zM704 536c0 4.4-3.6 8-8 8H544v152c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V544H328c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h152V328c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v152h152c4.4 0 8 3.6 8 8v48z" } }] }, "name": "plus-square", "theme": "filled" };

var PlusSquareFilled$1 = function PlusSquareFilled$1(props, ref) {
  return /*#__PURE__*/createElement(Icon, _objectSpread2(_objectSpread2({}, props), {}, {
    ref: ref,
    icon: PlusSquareFilled
  }));
};

PlusSquareFilled$1.displayName = 'PlusSquareFilled';
var PlusSquareFilled$2 = /*#__PURE__*/forwardRef(PlusSquareFilled$1);

const TypeCascadeApi = ({
  id,
  name,
  form,
  api,
  keyform,
  required,
  rules,
  tooltip
}) => {
  const [cascade, setCascade] = useState([]);
  const [selected, setSelected] = useState([]);
  const {
    endpoint,
    initial,
    list
  } = api;
  useEffect(() => {
    const ep = initial !== undefined ? `${endpoint}/${initial}` : `${endpoint}`;
    axios.get(ep).then(res => {
      var _res$data;

      const data = list ? (_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data[list] : res.data;
      setCascade([data]);
    }).catch(err => {
      console.error(err);
    });
  }, []);

  const handleChange = (value, index) => {
    if (!index) {
      setSelected([value]);
      form.setFieldsValue({
        [id]: [value]
      });
    } else {
      const prevValue = take(selected, index);
      const result = [...prevValue, value];
      setSelected(result);
      form.setFieldsValue({
        [id]: result
      });
    }

    axios.get(`${endpoint}/${value}`).then(res => {
      var _res$data2;

      const data = list ? (_res$data2 = res.data) === null || _res$data2 === void 0 ? void 0 : _res$data2[list] : res.data;

      if (data.length) {
        const prevCascade = take(cascade, index + 1);
        setCascade([...prevCascade, ...[data]]);
      }
    }).catch(err => {
      console.error(err);
    });
  };

  return /*#__PURE__*/React__default.createElement(Col, null, /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field",
    label: `${keyform + 1}. ${name}`,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field-cascade",
    key: keyform,
    name: id,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(Select, {
    mode: "multiple",
    options: [],
    hidden: true
  })), /*#__PURE__*/React__default.createElement("div", {
    className: "arf-field-cascade-api"
  }, cascade.map((c, ci) => /*#__PURE__*/React__default.createElement(Row, {
    key: `keyform-cascade-${ci}`,
    className: "arf-field-cascade-list"
  }, /*#__PURE__*/React__default.createElement(Select, {
    className: "arf-cascade-api-select",
    placeholder: `Select Level ${ci + 1}`,
    onChange: e => handleChange(e, ci),
    options: c.map(v => ({
      label: v.name,
      value: v.id
    })),
    value: (selected === null || selected === void 0 ? void 0 : selected[ci]) || null
  }))))));
};

const TypeCascade = ({
  cascade,
  id,
  name,
  form,
  api,
  keyform,
  required,
  rules,
  tooltip
}) => {
  if (!cascade && api) {
    return /*#__PURE__*/React__default.createElement(TypeCascadeApi, {
      id: id,
      name: name,
      form: form,
      keyform: keyform,
      required: required,
      api: api,
      rules: rules,
      tooltip: tooltip
    });
  }

  return /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field",
    key: keyform,
    name: id,
    label: `${keyform + 1}. ${name}`,
    rules: rules,
    required: required,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, /*#__PURE__*/React__default.createElement(Cascader, {
    options: cascade
  }));
};

const Extra = ({
  content,
  placement
}) => {
  return /*#__PURE__*/React__default.createElement(Col, {
    className: `arf-extra-${placement}`
  }, content);
};

const TypeDate = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra
}) => {
  return /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field",
    label: `${keyform + 1}. ${name}`,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, (extra === null || extra === void 0 ? void 0 : extra.placement) === 'before' && /*#__PURE__*/React__default.createElement(Extra, extra), /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field-child",
    key: keyform,
    name: id,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(DatePicker, {
    style: {
      width: '100%'
    }
  })), (extra === null || extra === void 0 ? void 0 : extra.placement) === 'after' && /*#__PURE__*/React__default.createElement(Extra, extra));
};

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;
const defaultCenter = {
  lat: 0,
  lng: 0
};

const DraggableMarker = ({
  changePos,
  position
}) => {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;

      if (marker != null) {
        const newPos = marker.getLatLng();
        changePos(newPos);
      }
    }

  }), []);
  useMapEvents({
    click(e) {
      const newPos = e.latlng;
      changePos(newPos);
    }

  });

  if (!(position !== null && position !== void 0 && position.lat) && !(position !== null && position !== void 0 && position.lng)) {
    return '';
  }

  return /*#__PURE__*/React__default.createElement(Marker, {
    eventHandlers: eventHandlers,
    position: position,
    ref: markerRef,
    draggable: true
  });
};

const MapRef = ({
  center
}) => {
  const map = useMap();
  map.panTo(center);
  return null;
};

const Maps = ({
  form,
  id,
  center
}) => {
  const [position, setPosition] = useState({
    lat: null,
    lng: null
  });

  const changePos = newPos => {
    setPosition(newPos);

    if (newPos !== null && newPos !== void 0 && newPos.lat && newPos !== null && newPos !== void 0 && newPos.lng) {
      form.setFieldsValue({
        [id]: newPos
      });
    }
  };

  const onChange = (cname, e) => {
    changePos({ ...position,
      [cname]: parseFloat(e)
    });
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: "arf-field arf-field-map"
  }, /*#__PURE__*/React__default.createElement(Row, {
    justify: "space-between",
    style: {
      marginBottom: '10px'
    }
  }, /*#__PURE__*/React__default.createElement(Col, {
    span: 12,
    style: {
      paddingRight: '10px'
    }
  }, /*#__PURE__*/React__default.createElement(InputNumber, {
    placeholder: "Latitude",
    style: {
      width: '100%'
    },
    value: (position === null || position === void 0 ? void 0 : position.lat) || null,
    min: "-90",
    max: "90",
    onChange: e => onChange('lat', e)
  })), /*#__PURE__*/React__default.createElement(Col, {
    span: 12,
    style: {
      paddingLeft: '10px'
    }
  }, /*#__PURE__*/React__default.createElement(InputNumber, {
    placeholder: "Longitude",
    className: "site-input-right",
    style: {
      width: '100%'
    },
    value: (position === null || position === void 0 ? void 0 : position.lng) || null,
    min: "-180",
    max: "180",
    onChange: e => onChange('lng', e)
  }))), /*#__PURE__*/React__default.createElement(Row, null, /*#__PURE__*/React__default.createElement(Col, {
    span: 24
  }, /*#__PURE__*/React__default.createElement(MapContainer, {
    zoom: 13,
    scrollWheelZoom: false,
    className: "arf-leaflet"
  }, /*#__PURE__*/React__default.createElement(MapRef, {
    center: position !== null && position !== void 0 && position.lat && position !== null && position !== void 0 && position.lng ? position : center || defaultCenter
  }), /*#__PURE__*/React__default.createElement(TileLayer, {
    attribution: "\xA9 <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  }), /*#__PURE__*/React__default.createElement(DraggableMarker, {
    form: form,
    id: id,
    changePos: changePos,
    position: position
  })))));
};

const TypeGeo = ({
  id,
  name,
  form,
  keyform,
  required,
  rules,
  tooltip,
  center
}) => {
  return /*#__PURE__*/React__default.createElement(Col, null, /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field",
    label: `${keyform + 1}. ${name}`,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field-geo",
    name: id,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(Input, {
    disabled: true,
    hidden: true
  })), /*#__PURE__*/React__default.createElement(Maps, {
    form: form,
    id: id,
    center: center
  })));
};

const TypeInput = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  addonAfter,
  addonBefore,
  extra
}) => {
  return /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field",
    label: `${keyform + 1}. ${name}`,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, (extra === null || extra === void 0 ? void 0 : extra.placement) === 'before' && /*#__PURE__*/React__default.createElement(Extra, extra), /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field-child",
    key: keyform,
    name: id,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(Input, {
    sytle: {
      width: '100%'
    },
    addonAfter: addonAfter,
    addonBefore: addonBefore
  })), (extra === null || extra === void 0 ? void 0 : extra.placement) === 'after' && /*#__PURE__*/React__default.createElement(Extra, extra));
};

const TypeMultipleOption = ({
  option,
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  allowOther,
  allowOtherText,
  extra
}) => {
  const [options, setOptions] = useState(option);
  const [newOption, setNewOption] = useState('');

  const addNewOption = e => {
    setOptions([...options, {
      name: newOption,
      label: newOption
    }]);
    e.preventDefault();
    setNewOption('');
  };

  const onNewOptionChange = event => {
    setNewOption(event.target.value);
  };

  return /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field",
    label: `${keyform + 1}. ${name}`,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, (extra === null || extra === void 0 ? void 0 : extra.placement) === 'before' && /*#__PURE__*/React__default.createElement(Extra, extra), /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field-child",
    key: keyform,
    name: id,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(Select, {
    style: {
      width: '100%'
    },
    mode: "multiple",
    getPopupContainer: trigger => trigger.parentNode,
    dropdownRender: menu => allowOther ? /*#__PURE__*/React__default.createElement("div", null, menu, /*#__PURE__*/React__default.createElement(Divider, {
      style: {
        margin: '8px 0'
      }
    }), /*#__PURE__*/React__default.createElement("div", {
      align: "center",
      style: {
        padding: '0 8px 4px',
        width: '100%'
      }
    }, /*#__PURE__*/React__default.createElement(Input.Group, {
      compact: true
    }, /*#__PURE__*/React__default.createElement(Button, {
      type: "primary",
      onClick: addNewOption,
      style: {
        whiteSpace: 'nowrap'
      },
      icon: /*#__PURE__*/React__default.createElement(PlusOutlined$2, null),
      disabled: !newOption.length
    }), /*#__PURE__*/React__default.createElement(Input, {
      style: {
        width: 'calc(100% - 40px)',
        textAlign: 'left'
      },
      placeholder: allowOtherText || 'Please enter item',
      value: newOption,
      onChange: onNewOptionChange
    })))) : menu,
    allowClear: true
  }, options.map((o, io) => /*#__PURE__*/React__default.createElement(Select.Option, {
    key: io,
    value: o.name
  }, o.label)))), (extra === null || extra === void 0 ? void 0 : extra.placement) === 'after' && /*#__PURE__*/React__default.createElement(Extra, extra));
};

const TypeNumber = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  addonAfter,
  addonBefore,
  extra
}) => {
  return /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field",
    label: `${keyform + 1}. ${name}`,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, (extra === null || extra === void 0 ? void 0 : extra.placement) === 'before' && /*#__PURE__*/React__default.createElement(Extra, extra), /*#__PURE__*/React__default.createElement(Form.Item, {
    key: keyform,
    name: id,
    rules: rules,
    className: "arf-field-child",
    required: required
  }, /*#__PURE__*/React__default.createElement(InputNumber, {
    style: {
      width: '100%'
    },
    addonAfter: addonAfter,
    addonBefore: addonBefore
  })), (extra === null || extra === void 0 ? void 0 : extra.placement) === 'after' && /*#__PURE__*/React__default.createElement(Extra, extra));
};

const TypeOption = ({
  option,
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  allowOther,
  allowOtherText,
  extra
}) => {
  const [options, setOptions] = useState(option);
  const [newOption, setNewOption] = useState('');

  const addNewOption = e => {
    setOptions([...options, {
      name: newOption,
      label: newOption
    }]);
    e.preventDefault();
    setNewOption('');
  };

  const onNewOptionChange = event => {
    setNewOption(event.target.value);
  };

  return /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field",
    label: `${keyform + 1}. ${name}`,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, (extra === null || extra === void 0 ? void 0 : extra.placement) === 'before' && /*#__PURE__*/React__default.createElement(Extra, extra), /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field-child",
    key: keyform,
    name: id,
    rules: rules,
    required: required
  }, option.length < 3 ? /*#__PURE__*/React__default.createElement(Radio.Group, null, /*#__PURE__*/React__default.createElement(Space, {
    direction: "vertical"
  }, option.map((o, io) => /*#__PURE__*/React__default.createElement(Radio, {
    key: io,
    value: o.name
  }, o.name)), allowOther ? /*#__PURE__*/React__default.createElement(Radio, {
    value: newOption
  }, /*#__PURE__*/React__default.createElement(Input, {
    placeholder: allowOtherText || 'Other',
    value: newOption,
    onChange: onNewOptionChange
  })) : '')) : /*#__PURE__*/React__default.createElement(Select, {
    style: {
      width: '100%'
    },
    getPopupContainer: trigger => trigger.parentNode,
    dropdownRender: menu => allowOther ? /*#__PURE__*/React__default.createElement("div", null, menu, /*#__PURE__*/React__default.createElement(Divider, {
      style: {
        margin: '8px 0'
      }
    }), /*#__PURE__*/React__default.createElement(Input.Group, {
      compact: true
    }, /*#__PURE__*/React__default.createElement(Button, {
      type: "primary",
      onClick: addNewOption,
      style: {
        whiteSpace: 'nowrap'
      },
      icon: /*#__PURE__*/React__default.createElement(PlusOutlined$2, null),
      disabled: !newOption.length
    }), /*#__PURE__*/React__default.createElement(Input, {
      style: {
        width: 'calc(100% - 40px)',
        textAlign: 'left'
      },
      placeholder: allowOtherText || 'Please enter item',
      value: newOption,
      onChange: onNewOptionChange
    }))) : menu,
    allowClear: true
  }, options.map((o, io) => /*#__PURE__*/React__default.createElement(Select.Option, {
    key: io,
    value: o.name
  }, o.label)))), (extra === null || extra === void 0 ? void 0 : extra.placement) === 'after' && /*#__PURE__*/React__default.createElement(Extra, extra));
};

const TypeText = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra
}) => {
  return /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field",
    label: `${keyform + 1}. ${name}`,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, (extra === null || extra === void 0 ? void 0 : extra.placement) === 'before' && /*#__PURE__*/React__default.createElement(Extra, extra), /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field-child",
    key: keyform,
    name: id,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(TextArea, {
    row: 4
  })), (extra === null || extra === void 0 ? void 0 : extra.placement) === 'after' && /*#__PURE__*/React__default.createElement(Extra, extra));
};

const {
  SHOW_PARENT
} = TreeSelect;

const TypeTree = ({
  tree,
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra
}) => {
  const treeData = cloneDeep(tree);
  const tProps = {
    treeData,
    treeCheckable: true,
    showCheckedStrategy: SHOW_PARENT,
    placeholder: 'Please select',
    style: {
      width: '100%'
    }
  };
  return /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field",
    label: `${keyform + 1}. ${name}`,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, (extra === null || extra === void 0 ? void 0 : extra.placement) === 'before' && /*#__PURE__*/React__default.createElement(Extra, extra), /*#__PURE__*/React__default.createElement(Form.Item, {
    className: "arf-field-child",
    key: keyform,
    name: id,
    rules: rules,
    required: required,
    tooltip: tooltip === null || tooltip === void 0 ? void 0 : tooltip.text
  }, /*#__PURE__*/React__default.createElement(TreeSelect, tProps)), (extra === null || extra === void 0 ? void 0 : extra.placement) === 'after' && /*#__PURE__*/React__default.createElement(Extra, extra));
};

const AkvoReactCard = Card;
const AkvoReactTable = Table;

const mapRules = ({
  rule,
  type
}) => {
  if (type === 'number') {
    return [{ ...rule,
      type: 'number'
    }];
  }

  return [{}];
};

const QuestionFields = ({
  rules,
  cascade,
  tree,
  form,
  index,
  field
}) => {
  switch (field.type) {
    case 'option':
      return /*#__PURE__*/React__default.createElement(TypeOption, Object.assign({
        keyform: index,
        rules: rules
      }, field));

    case 'multiple_option':
      return /*#__PURE__*/React__default.createElement(TypeMultipleOption, Object.assign({
        keyform: index,
        rules: rules
      }, field));

    case 'cascade':
      return /*#__PURE__*/React__default.createElement(TypeCascade, Object.assign({
        keyform: index,
        cascade: cascade === null || cascade === void 0 ? void 0 : cascade[field === null || field === void 0 ? void 0 : field.option],
        rules: rules,
        form: form
      }, field));

    case 'tree':
      return /*#__PURE__*/React__default.createElement(TypeTree, Object.assign({
        keyform: index,
        tree: tree === null || tree === void 0 ? void 0 : tree[field === null || field === void 0 ? void 0 : field.option],
        rules: rules,
        form: form
      }, field));

    case 'date':
      return /*#__PURE__*/React__default.createElement(TypeDate, Object.assign({
        keyform: index,
        rules: rules
      }, field));

    case 'number':
      return /*#__PURE__*/React__default.createElement(TypeNumber, Object.assign({
        keyform: index,
        rules: rules
      }, field));

    case 'geo':
      return /*#__PURE__*/React__default.createElement(TypeGeo, Object.assign({
        keyform: index,
        rules: rules,
        form: form
      }, field));

    case 'text':
      return /*#__PURE__*/React__default.createElement(TypeText, Object.assign({
        keyform: index,
        rules: rules
      }, field));

    default:
      return /*#__PURE__*/React__default.createElement(TypeInput, Object.assign({
        keyform: index,
        rules: rules
      }, field));
  }
};

const validateDependency = (dependency, value) => {
  if (dependency !== null && dependency !== void 0 && dependency.options) {
    var _intersection;

    if (typeof value === 'string') {
      value = [value];
    }

    return ((_intersection = intersection(dependency.options, value)) === null || _intersection === void 0 ? void 0 : _intersection.length) > 0;
  }

  let valid = false;

  if (dependency !== null && dependency !== void 0 && dependency.min) {
    valid = value >= dependency.min;
  }

  if (dependency !== null && dependency !== void 0 && dependency.max) {
    valid = value <= dependency.max;
  }

  return valid;
};

const modifyDependency = ({
  question
}, {
  dependency
}, repeat) => {
  const questions = question.map(q => q.id);
  return dependency.map(d => {
    if (questions.includes(d.id) && repeat) {
      return { ...d,
        id: `${d.id}-${repeat}`
      };
    }

    return d;
  });
};

const Question = ({
  group,
  fields,
  tree,
  cascade,
  form,
  current,
  repeat
}) => {
  fields = fields.map(field => {
    if (repeat) {
      return { ...field,
        id: `${field.id}-${repeat}`
      };
    }

    return field;
  });
  return fields.map((field, key) => {
    let rules = [];

    if (field !== null && field !== void 0 && field.required) {
      rules = [{
        validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error(`${field.name} is required`))
      }];
    }

    if (field !== null && field !== void 0 && field.rule) {
      rules = [...rules, ...mapRules(field)];
    }

    if (field !== null && field !== void 0 && field.dependency) {
      const modifiedDependency = modifyDependency(group, field, repeat);
      return /*#__PURE__*/React__default.createElement(Form.Item, {
        noStyle: true,
        key: key,
        shouldUpdate: current
      }, f => {
        const unmatches = modifiedDependency.map(x => {
          return validateDependency(x, f.getFieldValue(x.id));
        }).filter(x => x === false);
        return unmatches.length ? null : /*#__PURE__*/React__default.createElement(QuestionFields, {
          rules: rules,
          form: form,
          index: key,
          cascade: cascade,
          tree: tree,
          field: field
        });
      });
    }

    return /*#__PURE__*/React__default.createElement(QuestionFields, {
      rules: rules,
      form: form,
      key: key,
      index: key,
      tree: tree,
      cascade: cascade,
      field: field
    });
  });
};
const FieldGroupHeader = ({
  group,
  index,
  updateRepeat
}) => {
  const heading = group.name || `Section ${index + 1}`;
  const repeat = group === null || group === void 0 ? void 0 : group.repeat;
  const repeatText = (group === null || group === void 0 ? void 0 : group.repeatText) || `Number of ${heading}`;
  const repeatButtonPlacement = group === null || group === void 0 ? void 0 : group.repeatButtonPlacement;

  if (!(group !== null && group !== void 0 && group.repeatable)) {
    return /*#__PURE__*/React__default.createElement("div", {
      className: "arf-field-group-header"
    }, heading);
  }

  return /*#__PURE__*/React__default.createElement("div", {
    className: "arf-field-group-header"
  }, /*#__PURE__*/React__default.createElement(Space, null, heading, /*#__PURE__*/React__default.createElement(MdRepeat, null)), (!repeatButtonPlacement || repeatButtonPlacement === 'top') && /*#__PURE__*/React__default.createElement(Row, {
    align: "middle"
  }, /*#__PURE__*/React__default.createElement(Col, {
    span: 24,
    className: "arf-repeat-input"
  }, /*#__PURE__*/React__default.createElement("div", {
    className: "arf-field-title"
  }, repeatText), /*#__PURE__*/React__default.createElement(Input.Group, {
    compact: true,
    size: "small",
    className: "arf-field"
  }, /*#__PURE__*/React__default.createElement(Button, {
    size: "small",
    icon: /*#__PURE__*/React__default.createElement(MinusOutlined$2, null),
    onClick: () => updateRepeat(index, repeat - 1, 'delete'),
    disabled: repeat < 2,
    className: repeat < 2 ? 'arf-disabled' : ''
  }), /*#__PURE__*/React__default.createElement(Input, {
    style: {
      width: '40px',
      textAlign: 'center',
      backgroundColor: '#fff',
      border: 'none',
      color: '#6a6a6a',
      padding: '2.5px',
      fontWeight: 'bold'
    },
    value: repeat,
    disabled: true
  }), /*#__PURE__*/React__default.createElement(Button, {
    size: "small",
    icon: /*#__PURE__*/React__default.createElement(PlusOutlined$2, null),
    onClick: () => updateRepeat(index, repeat + 1, 'add')
  })))));
};
const BottomGroupButton = ({
  group,
  index,
  updateRepeat
}) => {
  const heading = group.name || 'Section';
  const repeat = group === null || group === void 0 ? void 0 : group.repeat;
  const repeatText = (group === null || group === void 0 ? void 0 : group.repeatText) || `Add another ${heading}`;
  const repeatButtonPlacement = group === null || group === void 0 ? void 0 : group.repeatButtonPlacement;

  if (!repeatButtonPlacement || repeatButtonPlacement === 'top') {
    return '';
  }

  return /*#__PURE__*/React__default.createElement("div", {
    className: "arf-repeat-title arf-field-group-bottom-button"
  }, /*#__PURE__*/React__default.createElement(Button, {
    block: true,
    type: "link",
    onClick: () => updateRepeat(index, repeat + 1, 'add')
  }, /*#__PURE__*/React__default.createElement(PlusSquareFilled$2, null), repeatText));
};
const DeleteSelectedRepeatButton = ({
  index,
  group,
  repeat,
  updateRepeat
}) => {
  if ((group === null || group === void 0 ? void 0 : group.repeat) <= 1) {
    return '';
  }

  return /*#__PURE__*/React__default.createElement(Button, {
    type: "link",
    className: "arf-repeat-delete-btn",
    icon: /*#__PURE__*/React__default.createElement(MdDelete, {
      className: "arf-icon"
    }),
    onClick: () => updateRepeat(index, (group === null || group === void 0 ? void 0 : group.repeat) - 1, 'delete-selected', repeat)
  });
};
const RepeatTitle = ({
  index,
  group,
  repeat,
  updateRepeat
}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: "arf-repeat-title"
  }, /*#__PURE__*/React__default.createElement(Row, {
    justify: "space-between",
    align: "middle"
  }, /*#__PURE__*/React__default.createElement(Col, {
    span: 20,
    align: "start"
  }, group === null || group === void 0 ? void 0 : group.name, "-", repeat + 1), /*#__PURE__*/React__default.createElement(Col, {
    span: 4,
    align: "end"
  }, /*#__PURE__*/React__default.createElement(DeleteSelectedRepeatButton, {
    index: index,
    group: group,
    repeat: repeat,
    updateRepeat: updateRepeat
  }))));
};
const QuestionGroup = ({
  index,
  group,
  forms,
  activeGroup,
  form,
  current,
  sidebar,
  updateRepeat,
  repeats,
  headStyle
}) => {
  return /*#__PURE__*/React__default.createElement(Card, {
    key: index,
    title: /*#__PURE__*/React__default.createElement(FieldGroupHeader, {
      group: group,
      index: index,
      updateRepeat: updateRepeat
    }),
    className: `arf-field-group ${activeGroup !== index && sidebar ? 'arf-hidden' : ''}`,
    headStyle: headStyle
  }, group !== null && group !== void 0 && group.description ? /*#__PURE__*/React__default.createElement("p", {
    className: "arf-description"
  }, group.description) : '', repeats.map(r => /*#__PURE__*/React__default.createElement("div", {
    key: r
  }, (group === null || group === void 0 ? void 0 : group.repeatable) && /*#__PURE__*/React__default.createElement(RepeatTitle, {
    index: index,
    group: group,
    repeat: r,
    updateRepeat: updateRepeat
  }), /*#__PURE__*/React__default.createElement(Question, {
    group: group,
    fields: group.question,
    cascade: forms.cascade,
    tree: forms.tree,
    form: form,
    current: current,
    repeat: r
  }))), /*#__PURE__*/React__default.createElement(BottomGroupButton, {
    group: group,
    index: index,
    updateRepeat: updateRepeat
  }));
};

const getDependencyAncestors = (questions, current, dependencies) => {
  const ids = dependencies.map(x => x.id);
  const ancestors = questions.filter(q => ids.includes(q.id)).filter(q => q === null || q === void 0 ? void 0 : q.dependency);

  if (ancestors.length) {
    dependencies = ancestors.map(x => x.dependency);
    current = [current, ...dependencies].flatMap(x => x);
    ancestors.forEach(a => {
      if (a !== null && a !== void 0 && a.dependency) {
        current = getDependencyAncestors(questions, current, a.dependency);
      }
    });
  }

  return current;
};

const transformForm = forms => {
  var _forms$languages;

  const questions = forms === null || forms === void 0 ? void 0 : forms.question_group.map(x => {
    return x.question;
  }).flatMap(x => x).map(x => {
    if (x.type === 'option' || x.type === 'multiple_option') {
      return { ...x,
        option: x.option.map(o => ({ ...o,
          label: o.name
        }))
      };
    }

    return x;
  });
  const transformed = questions.map(x => {
    if (x !== null && x !== void 0 && x.dependency) {
      return { ...x,
        dependency: getDependencyAncestors(questions, x.dependency, x.dependency)
      };
    }

    return x;
  });
  const languages = (forms === null || forms === void 0 ? void 0 : (_forms$languages = forms.languages) === null || _forms$languages === void 0 ? void 0 : _forms$languages.map(x => ({
    label: getByTag(x).name,
    value: x
  }))) || [{
    label: 'English',
    value: 'en'
  }];
  return { ...forms,
    languages: languages,
    question_group: forms.question_group.map(qg => {
      let repeat = {};
      let repeats = {};

      if (qg !== null && qg !== void 0 && qg.repeatable) {
        repeat = {
          repeat: 1
        };
        repeats = {
          repeats: [0]
        };
      }

      return { ...qg,
        ...repeat,
        ...repeats,
        question: qg.question.map(q => {
          return transformed.find(t => t.id === q.id);
        })
      };
    })
  };
};

const translateObject = (obj, name, lang) => {
  var _obj$translations, _obj$translations$fin;

  return (obj === null || obj === void 0 ? void 0 : (_obj$translations = obj.translations) === null || _obj$translations === void 0 ? void 0 : (_obj$translations$fin = _obj$translations.find(x => x.language === lang)) === null || _obj$translations$fin === void 0 ? void 0 : _obj$translations$fin[name]) || (obj === null || obj === void 0 ? void 0 : obj[name]) || '';
};

const translateForm = (forms, lang) => {
  forms = { ...forms,
    name: translateObject(forms, 'name', lang),
    description: translateObject(forms, 'description', lang),
    question_group: forms.question_group.map(qg => ({ ...qg,
      name: translateObject(qg, 'name', lang),
      description: translateObject(qg, 'description', lang),
      question: qg.question.map(q => {
        var _q, _q2;

        q = { ...q,
          name: translateObject(q, 'name', lang),
          tooltip: { ...q.tooltip,
            text: translateObject(q.tooltip, 'text', lang)
          }
        };

        if ((_q = q) !== null && _q !== void 0 && _q.extra) {
          q = { ...q,
            extra: { ...q.extra,
              content: translateObject(q.extra, 'content', lang)
            }
          };
        }

        if ((_q2 = q) !== null && _q2 !== void 0 && _q2.allowOtherText) {
          q = { ...q,
            allowOtherText: translateObject(q, 'allowOtherText', lang)
          };
        }

        if (q.type === 'option' || q.type === 'multiple_option') {
          return { ...q,
            option: q.option.map(o => ({ ...o,
              label: translateObject(o, 'name', lang)
            }))
          };
        }

        return q;
      })
    }))
  };
  return forms;
};

const ErrorComponent = () => {
  return /*#__PURE__*/React__default.createElement("div", null, "Error custom component not found!");
};

const Webform = ({
  forms,
  customComponent: _customComponent = {},
  onChange,
  onFinish,
  style,
  sidebar: _sidebar = true,
  sticky: _sticky = false
}) => {
  forms = transformForm(forms);
  const [form] = Form.useForm();
  const [current, setCurrent] = useState({});
  const [activeGroup, setActiveGroup] = useState(0);
  const [completeGroup, setCompleteGroup] = useState([]);
  const [updatedQuestionGroup, setUpdatedQuestionGroup] = useState([]);
  const [lang, setLang] = useState('en');
  const formsMemo = useMemo(() => {
    forms = translateForm(forms, lang);

    if (updatedQuestionGroup !== null && updatedQuestionGroup !== void 0 && updatedQuestionGroup.length) {
      return { ...forms,
        question_group: updatedQuestionGroup
      };
    }

    return forms;
  }, [lang, forms, updatedQuestionGroup]);

  if (!(formsMemo !== null && formsMemo !== void 0 && formsMemo.question_group)) {
    return 'Error Format';
  }

  const updateRepeat = (index, value, operation, repeatIndex = null) => {
    const updated = formsMemo.question_group.map((x, xi) => {
      var _x$repeats;

      const isRepeatsAvailable = (x === null || x === void 0 ? void 0 : x.repeats) && (x === null || x === void 0 ? void 0 : (_x$repeats = x.repeats) === null || _x$repeats === void 0 ? void 0 : _x$repeats.length);
      const repeatNumber = isRepeatsAvailable ? x.repeats[x.repeats.length - 1] + 1 : value - 1;
      let repeats = isRepeatsAvailable ? x.repeats : [0];

      if (xi === index) {
        if (operation === 'add') {
          repeats = [...repeats, repeatNumber];
        }

        if (operation === 'delete') {
          repeats.pop();
        }

        if (operation === 'delete-selected' && repeatIndex !== null) {
          repeats = repeats.filter(r => r !== repeatIndex);
        }

        return { ...x,
          repeat: value,
          repeats: repeats
        };
      }

      return x;
    });
    setCompleteGroup(completeGroup === null || completeGroup === void 0 ? void 0 : completeGroup.filter(c => c !== `${index}-${value + 1}`));
    setUpdatedQuestionGroup(updated);
  };

  const onComplete = values => {
    if (onFinish) {
      onFinish(values);
    }
  };

  const onCompleteFailed = (values, errorFields) => {
    console.log(values, errorFields);
  };

  const onValuesChange = (fr, qg, value, values) => {
    const errors = fr.getFieldsError();
    const filled = Object.keys(values).map(k => ({
      id: k.toString(),
      value: values[k]
    })).filter(x => x.value);
    const incomplete = errors.map(e => e.name[0]);
    const completeQg = qg.map((x, ix) => {
      var _intersection2;

      let ids = x.question.map(q => q.id);
      let ixs = [ix];

      if (x !== null && x !== void 0 && x.repeatable) {
        let iter = x === null || x === void 0 ? void 0 : x.repeat;
        const suffix = iter > 1 ? `-${iter - 1}` : '';

        do {
          const rids = x.question.map(q => `${q.id}${suffix}`);
          ids = [...ids, ...rids];
          ixs = [...ixs, `${ix}-${iter}`];
          iter--;
        } while (iter > 0);
      }

      const mandatory = (_intersection2 = intersection(incomplete, ids)) === null || _intersection2 === void 0 ? void 0 : _intersection2.map(id => id.toString());
      const filledMandatory = filled.filter(f => mandatory.includes(f.id));
      return {
        i: ixs,
        complete: filledMandatory.length === mandatory.length
      };
    }).filter(x => x.complete);
    setCompleteGroup(completeQg.flatMap(qg => qg.i));

    if (onChange) {
      setCurrent(values);
      onChange({
        current: value,
        values: values,
        progress: filled.length / errors.length * 100
      });
    }
  };

  const lastGroup = activeGroup + 1 === (formsMemo === null || formsMemo === void 0 ? void 0 : formsMemo.question_group.length);
  return /*#__PURE__*/React__default.createElement(Row, {
    className: "arf-container"
  }, /*#__PURE__*/React__default.createElement(Col, {
    span: 24,
    className: `arf-form-header ${_sticky ? 'arf-sticky' : ''}`
  }, /*#__PURE__*/React__default.createElement(Row, {
    align: "middle"
  }, /*#__PURE__*/React__default.createElement(Col, {
    span: 12
  }, /*#__PURE__*/React__default.createElement("h1", null, formsMemo === null || formsMemo === void 0 ? void 0 : formsMemo.name)), /*#__PURE__*/React__default.createElement(Col, {
    span: 12,
    align: "right"
  }, /*#__PURE__*/React__default.createElement(Space, null, /*#__PURE__*/React__default.createElement(Select, {
    options: formsMemo.languages,
    onChange: setLang,
    defaultValue: (formsMemo === null || formsMemo === void 0 ? void 0 : formsMemo.default_language) || 'en',
    style: {
      width: 150,
      textAlign: 'left'
    }
  }), /*#__PURE__*/React__default.createElement(Button, {
    type: "primary",
    htmlType: "submit",
    onClick: () => form.submit()
  }, "Submit"))))), _sidebar && /*#__PURE__*/React__default.createElement(Col, {
    span: 6,
    className: `arf-sidebar ${_sticky ? 'arf-sticky' : ''}`
  }, /*#__PURE__*/React__default.createElement(List, {
    bordered: false,
    header: /*#__PURE__*/React__default.createElement("div", {
      className: "arf-sidebar-header"
    }, "form overview"),
    dataSource: formsMemo === null || formsMemo === void 0 ? void 0 : formsMemo.question_group,
    renderItem: (item, key) => /*#__PURE__*/React__default.createElement(List.Item, {
      key: key,
      onClick: () => setActiveGroup(key),
      className: `arf-sidebar-list ${activeGroup === key ? 'arf-active' : ''} ${completeGroup.includes(item !== null && item !== void 0 && item.repeatable ? `${key}-${item === null || item === void 0 ? void 0 : item.repeat}` : key) ? 'arf-complete' : ''}`
    }, completeGroup.includes(item !== null && item !== void 0 && item.repeatable ? `${key}-${item === null || item === void 0 ? void 0 : item.repeat}` : key) ? /*#__PURE__*/React__default.createElement(MdCheckCircle, {
      className: "arf-icon"
    }) : /*#__PURE__*/React__default.createElement(MdRadioButtonChecked, {
      className: "arf-icon"
    }), (item === null || item === void 0 ? void 0 : item.name) || `Section ${key + 1}`)
  })), /*#__PURE__*/React__default.createElement(Col, {
    span: _sidebar ? 18 : 24
  }, /*#__PURE__*/React__default.createElement(Form, {
    form: form,
    layout: "vertical",
    name: formsMemo.name,
    scrollToFirstError: "true",
    onValuesChange: (value, values) => setTimeout(() => {
      onValuesChange(form, formsMemo.question_group, value, values);
    }, 100),
    onFinish: onComplete,
    onFinishFailed: onCompleteFailed,
    style: style
  }, formsMemo === null || formsMemo === void 0 ? void 0 : formsMemo.question_group.map((g, key) => {
    var _g$repeats;

    const isRepeatable = g === null || g === void 0 ? void 0 : g.repeatable;
    const repeats = g !== null && g !== void 0 && g.repeats && g !== null && g !== void 0 && (_g$repeats = g.repeats) !== null && _g$repeats !== void 0 && _g$repeats.length ? g.repeats : range(isRepeatable ? g.repeat : 1);
    const headStyle = _sidebar && _sticky && isRepeatable ? {
      backgroundColor: '#fff',
      position: 'sticky',
      top: _sticky ? '59px' : 0,
      zIndex: 9999
    } : {};
    let QuestionGroupComponent = QuestionGroup;

    if (g !== null && g !== void 0 && g.custom_component) {
      QuestionGroupComponent = (_customComponent === null || _customComponent === void 0 ? void 0 : _customComponent[g.custom_component]) || ErrorComponent;
    }

    return /*#__PURE__*/React__default.createElement(QuestionGroupComponent, {
      key: key,
      index: key,
      group: g,
      forms: formsMemo,
      activeGroup: activeGroup,
      form: form,
      current: current,
      sidebar: _sidebar,
      updateRepeat: updateRepeat,
      repeats: repeats,
      headStyle: headStyle
    });
  })), !lastGroup && _sidebar && /*#__PURE__*/React__default.createElement(Col, {
    span: 24,
    className: "arf-next"
  }, /*#__PURE__*/React__default.createElement(Button, {
    type: "default",
    onClick: () => {
      if (!lastGroup) {
        setActiveGroup(activeGroup + 1);
      }
    }
  }, "Next"))));
};

export { AkvoReactCard, AkvoReactTable, BottomGroupButton, DeleteSelectedRepeatButton, FieldGroupHeader, Question, QuestionFields, QuestionGroup, RepeatTitle, Webform };
//# sourceMappingURL=index.modern.js.map
