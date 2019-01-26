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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/app.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar _transport_1 = __webpack_require__(/*! @transport */ \"./src/transport/index.ts\");\nvar server = new _transport_1.Server(null, null);\n\n\n//# sourceURL=webpack:///./src/app.ts?");

/***/ }),

/***/ "./src/handshake/HandshakeModule.ts":
/*!******************************************!*\
  !*** ./src/handshake/HandshakeModule.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (this && this.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar HandshakeModule = /** @class */ (function () {\n    function HandshakeModule(userManager, authModules) {\n        this.userManager = userManager;\n        this.authModules = authModules;\n    }\n    HandshakeModule.prototype.identifyUser = function (userTransportId) {\n        var user = this.userManager.getUser(userTransportId);\n        return user || new HandshakeInvite(this.authModules.map(function (m, i) { return ({\n            id: i.toString(),\n            description: m.getDescription()\n        }); }));\n    };\n    HandshakeModule.prototype.disconnectUser = function (userTransportId) {\n        this.userManager.disconnect(userTransportId);\n    };\n    HandshakeModule.prototype.authentificate = function (userTransportId, authData) {\n        return __awaiter(this, void 0, void 0, function () {\n            var selectedModule, user;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0:\n                        selectedModule = this.authModules[+authData.moduleId];\n                        if (!selectedModule) {\n                            throw new Error(\"Requested authentification module with id = \" + authData.moduleId + \" is not found!\");\n                        }\n                        return [4 /*yield*/, selectedModule.tryAuthentificate(authData)];\n                    case 1:\n                        user = _a.sent();\n                        if (user) {\n                            this.userManager.connect(userTransportId, user);\n                        }\n                        return [2 /*return*/, !!user];\n                }\n            });\n        });\n    };\n    return HandshakeModule;\n}());\nexports.HandshakeModule = HandshakeModule;\nvar HandshakeInvite = /** @class */ (function () {\n    function HandshakeInvite(availableAuthModules) {\n        this.availableAuthModules = availableAuthModules;\n    }\n    return HandshakeInvite;\n}());\nexports.HandshakeInvite = HandshakeInvite;\n\n\n//# sourceURL=webpack:///./src/handshake/HandshakeModule.ts?");

/***/ }),

/***/ "./src/handshake/index.ts":
/*!********************************!*\
  !*** ./src/handshake/index.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction __export(m) {\n    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];\n}\nObject.defineProperty(exports, \"__esModule\", { value: true });\n__export(__webpack_require__(/*! ./HandshakeModule */ \"./src/handshake/HandshakeModule.ts\"));\n\n\n//# sourceURL=webpack:///./src/handshake/index.ts?");

/***/ }),

/***/ "./src/transport/MessagePipeline.ts":
/*!******************************************!*\
  !*** ./src/transport/MessagePipeline.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar DefaulMessagePipeline = /** @class */ (function () {\n    function DefaulMessagePipeline() {\n    }\n    DefaulMessagePipeline.prototype.build = function () {\n        var result = function (_) { return Promise.resolve(); };\n        var _loop_1 = function (i) {\n            var nextCallback = this_1.callbacks[i];\n            result = function (message) { return nextCallback(message, result); };\n        };\n        var this_1 = this;\n        for (var i = this.callbacks.length - 1; i >= 0; i--) {\n            _loop_1(i);\n        }\n        return result;\n    };\n    DefaulMessagePipeline.prototype.chainInternal = function (handler) {\n        this.callbacks.push(handler);\n    };\n    DefaulMessagePipeline.prototype.chainTyped = function (handler) {\n        this.callbacks.push(function (message, next) {\n            if (handler.canHandle(message)) {\n                return handler.handle(message);\n            }\n            else {\n                return next(message);\n            }\n        });\n    };\n    DefaulMessagePipeline.prototype.chain = function (handler) {\n        if (\"handle\" in handler) {\n            this.chainTyped(handler);\n        }\n        else {\n            this.chainInternal(handler);\n        }\n        return this;\n    };\n    return DefaulMessagePipeline;\n}());\nexports.DefaulMessagePipeline = DefaulMessagePipeline;\n\n\n//# sourceURL=webpack:///./src/transport/MessagePipeline.ts?");

/***/ }),

/***/ "./src/transport/Server.ts":
/*!*********************************!*\
  !*** ./src/transport/Server.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __assign = (this && this.__assign) || function () {\n    __assign = Object.assign || function(t) {\n        for (var s, i = 1, n = arguments.length; i < n; i++) {\n            s = arguments[i];\n            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))\n                t[p] = s[p];\n        }\n        return t;\n    };\n    return __assign.apply(this, arguments);\n};\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (this && this.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar http_1 = __webpack_require__(/*! http */ \"http\");\nvar socketIO = __webpack_require__(/*! socket.io */ \"socket.io\");\nvar _handshake_1 = __webpack_require__(/*! @handshake */ \"./src/handshake/index.ts\");\nexports.messageHeader = 'seedMsg';\nvar Server = /** @class */ (function () {\n    function Server(pipeline, handshake) {\n        this.pipeline = pipeline;\n        this.handshake = handshake;\n    }\n    Server.prototype.listen = function (port) {\n        var _this = this;\n        this.ioServer = socketIO(http_1.createServer);\n        this.ioServer.on('connection', function (client) {\n            var userTransportId = client.id;\n            client.on(exports.messageHeader, function (data) { return __awaiter(_this, void 0, void 0, function () {\n                var handshakeResult, responce;\n                return __generator(this, function (_a) {\n                    switch (_a.label) {\n                        case 0:\n                            handshakeResult = this.handshake.identifyUser(userTransportId);\n                            if (!(handshakeResult instanceof _handshake_1.HandshakeInvite)) return [3 /*break*/, 1];\n                            client.emit('handshake', handshakeResult);\n                            return [3 /*break*/, 3];\n                        case 1: return [4 /*yield*/, this.pipeline(__assign({}, data, { user: handshakeResult }))];\n                        case 2:\n                            responce = _a.sent();\n                            client.emit('responce', responce);\n                            _a.label = 3;\n                        case 3: return [2 /*return*/];\n                    }\n                });\n            }); });\n            client.on('authentificate', function (data) { return __awaiter(_this, void 0, void 0, function () {\n                var authResult;\n                return __generator(this, function (_a) {\n                    switch (_a.label) {\n                        case 0: return [4 /*yield*/, this.handshake.authentificate(userTransportId, data)];\n                        case 1:\n                            authResult = _a.sent();\n                            client.emit('authentificate', authResult);\n                            return [2 /*return*/];\n                    }\n                });\n            }); });\n            client.on('disconnect', function () {\n                _this.handshake.disconnectUser(userTransportId);\n            });\n        });\n    };\n    return Server;\n}());\nexports.Server = Server;\n\n\n//# sourceURL=webpack:///./src/transport/Server.ts?");

/***/ }),

/***/ "./src/transport/index.ts":
/*!********************************!*\
  !*** ./src/transport/index.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction __export(m) {\n    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];\n}\nObject.defineProperty(exports, \"__esModule\", { value: true });\n__export(__webpack_require__(/*! ./MessagePipeline */ \"./src/transport/MessagePipeline.ts\"));\n__export(__webpack_require__(/*! ./Server */ \"./src/transport/Server.ts\"));\n\n\n//# sourceURL=webpack:///./src/transport/index.ts?");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"http\");\n\n//# sourceURL=webpack:///external_%22http%22?");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"socket.io\");\n\n//# sourceURL=webpack:///external_%22socket.io%22?");

/***/ })

/******/ });