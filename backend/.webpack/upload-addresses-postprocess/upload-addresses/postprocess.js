(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _defineProperty2 = __webpack_require__(1);

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AWS = __webpack_require__(2);
var CSV = __webpack_require__(3);
var sha256 = __webpack_require__(4).sha256;

module.exports.postprocess = function (event) {
    var bucketName = event.Records[0].s3.bucket.name;
    var objectKey = decodeURI(event.Records[0].s3.object.key);
    var awsRegion = event.Records[0].awsRegion;

    AWS.config.update({ region: awsRegion });
    var s3 = new AWS.S3();
    var dynamodb = new AWS.DynamoDB();
    var dynamoDBparams = {
        RequestItems: {
            "kanto-dev": []
        },
        ReturnConsumedCapacity: "TOTAL",
        ReturnItemCollectionMetrics: "SIZE"
    };

    console.log("awsRegion", event.Records[0].awsRegion);
    console.log("bucketName", bucketName);
    console.log("objectKey", objectKey);

    var attributesCSVtoDB = ['wardName', 'rollNumber', 'firstName', 'lastName', 'houseIdentifier', 'addressLine1', 'addressLine2', 'addressLine3'];

    s3.getObject({
        Bucket: bucketName,
        Key: objectKey
    }, function (err, data) {
        if (err) {
            console.log("error getting S3 Object", err, err.stack);
        } else {
            var dataFromFile = CSV.parse(data.Body.toString('ascii'));
            dataFromFile.filter(function (e) {
                return e[0].length > 0;
            }).forEach(function (row, rowIndex) {
                if (row && rowIndex > 0) {
                    var item = (0, _defineProperty3.default)({
                        id: { S: sha256(row.join(',')) }
                    }, attributesCSVtoDB[0], { S: row[0] });
                    for (var i = 1; i < row.length; i++) {
                        item[attributesCSVtoDB[i]] = { S: row[i] };
                    }
                    item.created = item.updated = { S: Math.round(+new Date() / 1000).toString() };
                    addItem(item);
                    if (rowIndex % 20 === 0) {
                        persist(dynamoDBparams);
                    }
                }
            });
            persist(dynamoDBparams);
        }
    });

    var addItem = function addItem(Item) {
        dynamoDBparams.RequestItems["kanto-dev"].push({
            PutRequest: {
                Item: Item
            }
        });
    };

    var persist = function persist(params) {
        dynamodb.batchWriteItem(params, function (err, data) {
            if (err) console.log("error adding to DynamoDB", err, err.stack); // an error occurred
            else console.log("succesfully added"); // successful response
        });
        params.RequestItems["kanto-dev"] = [];
    };
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/defineProperty");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("csv-string");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("js-sha256");

/***/ })
/******/ ])));