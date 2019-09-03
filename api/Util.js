/* Copyright 2016 Streampunk Media Ltd.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

var Node = require('../model/Node.js');
var Device = require('../model/Device.js')

function extractVersions(v) {
  var m = v.match(/^([0-9]+):([0-9]+)$/)
  return [+m[1], +m[2]];
}

function compareVersions(l, r) {
  var lm = extractVersions(l);
  var rm = extractVersions(r);
  if (lm[0] < rm[0]) return -1;
  if (lm[0] > rm[0]) return 1;
  if (lm[1] < rm[1]) return -1;
  if (lm[1] > rm[1]) return 1;
  return 0;
}

function getResourceName(r) {
  return /^function\s+([\w\$]+)\s*\(/.exec(
    r.constructor.toString())[1].toLowerCase();
  // TODO conside changing to ES6 <Function>.name
}

function getFirstExternalNetworkInterface() {
  var nis = require('os').networkInterfaces();
  var nias = [];
  Object.keys(nis).forEach(function (nik) {
    var ni = nis[nik];
    ni.forEach(function (n) {
      n.interface = nik;
      nias.push(n);
    });
  });
  return nias.find(function (x) { return x.internal === false && x.family === 'IPv4'; });
}

function isType(x, type) {
  if (x == null || typeof x !== 'object') {
    return false
  }

  switch(type) {
    case "Node":
      return x instanceof Node
      break;
    case "Device":
      return x instanceof Device
      break
    default:
      return false
      break;
  }
}


/**
 * Add a status code to an error object.
 * @param  {Number} status  Status code for the error.
 * @param  {string} message Error message describing the error.
 * @return {Error}          The newly created error with status set.
 */
function statusError(status, message) {
  var e = new Error(message);
  e.status = status;
  return e;
}

function checkValidAndForward(item, items, name, reject) {
  if (!item.valid()) {
    reject(statusError(400,
      "Given new or replacement " + name + " is not valid."));
  }
  if (items[item.id]) { // Already stored
  //  console.log('***', items[item.id].version, item.version);
    if (compareVersions(items[item.id].version, item.version) === 1) {
      reject(statusError(409,
        "Cannot replace a " + name + " device with one with " +
        "an earler version."));
    }
  }
  return true;
}

function validUUID(id) {
  return id.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g)
}

var util = {
  extractVersions : extractVersions,
  compareVersions : compareVersions,
  getResourceName : getResourceName,
  getFirstExternalNetworkInterface : getFirstExternalNetworkInterface,
  isType: isType,
  statusError: statusError,
  checkValidAndForward: checkValidAndForward,
  validUUID: validUUID
};

module.exports = util;
