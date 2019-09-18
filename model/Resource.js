
// Describes the resource_base on which all other resources are built

var uuid = require('uuid/v4');
// var immutable = require('seamless-immutable');
var Capabilities = require('./Capabilities.js')
// var Transports = require('./Transports.js');
// var Formats = require('./Formats.js');
// var DeviceTypes = require('./DeviceTypes.js');
// var os = require('os')

function nanoSeconds(hrtime) {
  return hrtime[0] * 1e9 + hrtime[1];
}

var loadHRTime = nanoSeconds(process.hrtime());
var loadDate = Date.now();

/**
 * Instantiate a resource. Resources are not generally created directly, but via child classes (Node, Device, etc)
 * @param {object} params       Object containing all Resource parameters
 * @param {string} [params.id]          Globally unique UUID identifier for the Node.
 * @param {string} [params.version]     String formatted PTP timestamp.
 *                          (&lt;<em>seconds</em>&gt;:&lt;<em>nanoseconds</em>&gt;)
 *                          indicating precisely when an attribute of the resource
 *                          last changed.
 * @param {string} [params.label]       Freeform string label for the Node.
 * @param {string} [params.desc] Detailed description of the resource
 * @param {Object} [params.caps]     [Capabilities]{@link capabilities} (not yet defined).
 * @param {string[]} [params.tags]        Key value set of freeform string tags to aid in filtering resources. Values should be represented as an array of strings. Can be empty.
 */
class Resource {
  constructor(params) {
    if (params == undefined) {
      params = {}
    }
    this.id = this.constructor.generateID(params.id),
    this.version = this.constructor.generateVersion(params.version)
    this.label = this.constructor.generateLabel(params.label)
    this.description = this.constructor.generateDescription(params.desc)
    this.caps = this.constructor.generateCaps(params.caps)
    this.tags = this.constructor.generateTags(params.tags)
  }

  static generateID(id) {
    if (arguments.length === 0 || id === null || id === undefined)
      return uuid();
    else return id;
  }

  static generateVersion(version) {
    if (arguments.length === 0 || version === null || version === undefined) {
      var currentNanos = nanoSeconds(process.hrtime());
      var difference = currentNanos - loadHRTime;
      var microDate = loadDate + Math.floor(difference / 1e6);
      let ver = Math.floor(microDate / 1e3) + ":" + (difference % 1e9)
      return ver;
    }
    else return version;
  }

  static generateLabel(label) {
    if (arguments.length === 0 || label === null || label === undefined)
      return '';
    else return label;
  }

  static generateDescription(desc) {
    if (arguments.length === 0 || desc === null || desc === undefined)
      return '';
    else return desc;
  }

  static generateCaps(caps) {
    if (arguments.length === 0 || caps === null || caps === undefined)
      return Capabilities;
    else return caps;
  }

  static generateTags(tags) {
    if (arguments.length === 0 || tags === null || tags === undefined)
      return {};
    else return tags;
  }

  //TODO: Add validation against JSON Schema from NMOS
  valid() {
    return true
  }
}

module.exports = Resource;
