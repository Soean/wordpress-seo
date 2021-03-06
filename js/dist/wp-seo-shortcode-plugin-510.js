/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1582);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1582:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* global tinyMCE */
/* global wpseoShortcodePluginL10n */
/* global ajaxurl */
/* global _ */
/* global JSON */
/* global console */
var shortcodeNameMatcher = "[^<>&/\\[\\]\x00-\x20=]+?";
var shortcodeAttributesMatcher = "( [^\\]]+?)?";

var shortcodeStartRegex = new RegExp("\\[" + shortcodeNameMatcher + shortcodeAttributesMatcher + "\\]", "g");
var shortcodeEndRegex = new RegExp("\\[/" + shortcodeNameMatcher + "\\]", "g");

(function () {
	"use strict";

	/**
  * The Yoast Shortcode plugin parses the shortcodes in a given piece of text. It analyzes multiple input fields for shortcodes which it will preload using AJAX.
  *
  * @constructor
  * @property {RegExp} keywordRegex Used to match a given string for valid shortcode keywords.
  * @property {RegExp} closingTagRegex Used to match a given string for shortcode closing tags.
  * @property {RegExp} nonCaptureRegex Used to match a given string for non capturing shortcodes.
  * @property {Array} parsedShortcodes Used to store parsed shortcodes.
  */

	var YoastShortcodePlugin = function YoastShortcodePlugin(app) {
		this._app = app;

		this._app.registerPlugin("YoastShortcodePlugin", { status: "loading" });
		this.bindElementEvents();

		var keywordRegexString = "(" + wpseoShortcodePluginL10n.wpseo_shortcode_tags.join("|") + ")";

		// The regex for matching shortcodes based on the available shortcode keywords.
		this.keywordRegex = new RegExp(keywordRegexString, "g");
		this.closingTagRegex = new RegExp("\\[\\/" + keywordRegexString + "\\]", "g");
		this.nonCaptureRegex = new RegExp("\\[" + keywordRegexString + "[^\\]]*?\\]", "g");

		this.parsedShortcodes = [];

		this.loadShortcodes(this.declareReady.bind(this));
	};

	/* YOAST SEO CLIENT */

	/**
  * Declares ready with YoastSEO.
  *
  * @returns {void}
  */
	YoastShortcodePlugin.prototype.declareReady = function () {
		this._app.pluginReady("YoastShortcodePlugin");
		this.registerModifications();
	};

	/**
  * Declares reloaded with YoastSEO.
  *
  * @returns {void}
  */
	YoastShortcodePlugin.prototype.declareReloaded = function () {
		this._app.pluginReloaded("YoastShortcodePlugin");
	};

	/**
  * Registers the modifications for the content in which we want to replace shortcodes.
  *
  * @returns {void}
  */
	YoastShortcodePlugin.prototype.registerModifications = function () {
		this._app.registerModification("content", this.replaceShortcodes.bind(this), "YoastShortcodePlugin");
	};

	/**
  * Removes all unknown shortcodes. Not all plugins properly registerd their shortcodes in the WordPress backend.
  * Since we cannot use the data from these shortcodes they must be removed.
  *
  * @param {string} data The text to remove unknown shortcodes.
  * @returns {string} The text with removed unknown shortcodes.
  */
	YoastShortcodePlugin.prototype.removeUnknownShortCodes = function (data) {
		data = data.replace(shortcodeStartRegex, "");
		data = data.replace(shortcodeEndRegex, "");

		return data;
	};

	/**
  * The callback used to replace the shortcodes.
  *
  * @param {string} data
  * @returns {string}
  */
	YoastShortcodePlugin.prototype.replaceShortcodes = function (data) {
		var parsedShortcodes = this.parsedShortcodes;

		if (typeof data === "string" && parsedShortcodes.length > 0) {
			for (var i = 0; i < parsedShortcodes.length; i++) {
				data = data.replace(parsedShortcodes[i].shortcode, parsedShortcodes[i].output);
			}
		}

		data = this.removeUnknownShortCodes(data);

		return data;
	};

	/* DATA SOURCING */

	/**
  * Get data from inputfields and store them in an analyzerData object. This object will be used to fill
  * the analyzer and the snippetpreview
  *
  * @param {function} callback To declare either ready or reloaded after parsing.
  *
  * @returns {void}
  */
	YoastShortcodePlugin.prototype.loadShortcodes = function (callback) {
		var unparsedShortcodes = this.getUnparsedShortcodes(this.getShortcodes(this.getContentTinyMCE()));
		if (unparsedShortcodes.length > 0) {
			this.parseShortcodes(unparsedShortcodes, callback);
		} else {
			return callback();
		}
	};

	/**
  * Bind elements to be able to reload the dataset if shortcodes get added.
  *
  * @returns {void}
  */
	YoastShortcodePlugin.prototype.bindElementEvents = function () {
		var contentElement = document.getElementById("content") || false;
		var callback = _.debounce(this.loadShortcodes.bind(this, this.declareReloaded.bind(this)), 500);

		if (contentElement) {
			contentElement.addEventListener("keyup", callback);
			contentElement.addEventListener("change", callback);
		}

		if (typeof tinyMCE !== "undefined" && typeof tinyMCE.on === "function") {
			tinyMCE.on("addEditor", function (e) {
				e.editor.on("change", callback);
				e.editor.on("keyup", callback);
			});
		}
	};

	/**
  * gets content from the content field, if tinyMCE is initialized, use the getContent function to get the data from tinyMCE
  * @returns {String}
  */
	YoastShortcodePlugin.prototype.getContentTinyMCE = function () {
		var val = document.getElementById("content") && document.getElementById("content").value || "";
		if (typeof tinyMCE !== "undefined" && typeof tinyMCE.editors !== "undefined" && tinyMCE.editors.length !== 0) {
			val = tinyMCE.get("content") && tinyMCE.get("content").getContent() || "";
		}

		return val;
	};

	/* SHORTCODE PARSING */

	/**
  * Returns the unparsed shortcodes out of a collection of shortcodes.
  *
  * @param {Array} shortcodes
  * @returns {Array}
  */
	YoastShortcodePlugin.prototype.getUnparsedShortcodes = function (shortcodes) {
		if ((typeof shortcodes === "undefined" ? "undefined" : _typeof(shortcodes)) !== "object") {
			console.error("Failed to get unparsed shortcodes. Expected parameter to be an array, instead received " + (typeof shortcodes === "undefined" ? "undefined" : _typeof(shortcodes)));
			return false;
		}

		var unparsedShortcodes = [];

		for (var i = 0; i < shortcodes.length; i++) {
			var shortcode = shortcodes[i];
			if (unparsedShortcodes.indexOf(shortcode) === -1 && this.isUnparsedShortcode(shortcode)) {
				unparsedShortcodes.push(shortcode);
			}
		}

		return unparsedShortcodes;
	};

	/**
  * Checks if a given shortcode was already parsed.
  *
  * @param {string} shortcode
  * @returns {boolean}
  */
	YoastShortcodePlugin.prototype.isUnparsedShortcode = function (shortcode) {
		var already_exists = false;

		for (var i = 0; i < this.parsedShortcodes.length; i++) {
			if (this.parsedShortcodes[i].shortcode === shortcode) {
				already_exists = true;
			}
		}

		return already_exists === false;
	};

	/**
  * Gets the shortcodes from a given piece of text.
  *
  * @param {string} text
  * @returns {array} The matched shortcodes
  */
	YoastShortcodePlugin.prototype.getShortcodes = function (text) {
		if (typeof text !== "string") {
			/* jshint ignore:start */
			console.error("Failed to get shortcodes. Expected parameter to be a string, instead received" + (typeof text === "undefined" ? "undefined" : _typeof(text)));
			/* jshint ignore:end*/
			return false;
		}

		var captures = this.matchCapturingShortcodes(text);

		// Remove the capturing shortcodes from the text before trying to match the capturing shortcodes.
		for (var i = 0; i < captures.length; i++) {
			text = text.replace(captures[i], "");
		}

		var nonCaptures = this.matchNonCapturingShortcodes(text);

		return captures.concat(nonCaptures);
	};

	/**
  * Matches the capturing shortcodes from a given piece of text.
  *
  * @param {string} text
  * @returns {Array}
  */
	YoastShortcodePlugin.prototype.matchCapturingShortcodes = function (text) {
		var captures = [];

		// First identify which tags are being used in a capturing shortcode by looking for closing tags.
		var captureKeywords = (text.match(this.closingTagRegex) || []).join(" ").match(this.keywordRegex) || [];

		// Fetch the capturing shortcodes and strip them from the text so we can easily match the non capturing shortcodes.
		for (var i = 0; i < captureKeywords.length; i++) {
			var captureKeyword = captureKeywords[i];
			var captureRegex = "\\[" + captureKeyword + "[^\\]]*?\\].*?\\[\\/" + captureKeyword + "\\]";
			var matches = text.match(new RegExp(captureRegex, "g")) || [];

			captures = captures.concat(matches);
		}

		return captures;
	};

	/**
  * Matches the non capturing shortcodes from a given piece of text.
  *
  * @param {string} text
  * @returns {Array}
  */
	YoastShortcodePlugin.prototype.matchNonCapturingShortcodes = function (text) {
		return text.match(this.nonCaptureRegex) || [];
	};

	/**
  * Parses the unparsed shortcodes through AJAX and clears them.
  *
  * @param {Array} shortcodes shortcodes to be parsed.
  * @param {function} callback function to be called in the context of the AJAX callback.
  *
  * @returns {void}
  */
	YoastShortcodePlugin.prototype.parseShortcodes = function (shortcodes, callback) {
		if (typeof callback !== "function") {
			/* jshint ignore:start */
			console.error("Failed to parse shortcodes. Expected parameter to be a function, instead received " + (typeof callback === "undefined" ? "undefined" : _typeof(callback)));
			/* jshint ignore:end */
			return false;
		}

		if ((typeof shortcodes === "undefined" ? "undefined" : _typeof(shortcodes)) === "object" && shortcodes.length > 0) {
			jQuery.post(ajaxurl, {
				action: "wpseo_filter_shortcodes",
				_wpnonce: wpseoShortcodePluginL10n.wpseo_filter_shortcodes_nonce,
				data: shortcodes
			}, function (shortcodeResults) {
				this.saveParsedShortcodes(shortcodeResults, callback);
			}.bind(this));
		} else {
			return callback();
		}
	};

	/**
  * Saves the shortcodes that were parsed with AJAX to `this.parsedShortcodes`
  *
  * @param {Array} shortcodeResults
  * @param {function} callback
  *
  * @returns {void}
  */
	YoastShortcodePlugin.prototype.saveParsedShortcodes = function (shortcodeResults, callback) {
		shortcodeResults = JSON.parse(shortcodeResults);
		for (var i = 0; i < shortcodeResults.length; i++) {
			this.parsedShortcodes.push(shortcodeResults[i]);
		}

		callback();
	};

	window.YoastShortcodePlugin = YoastShortcodePlugin;
})();

/***/ })

/******/ });