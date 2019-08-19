
// Describes the resource_base on which all other resources are built

var uuid = require('uuid');
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
 */
class Resource {
  /**
   * @param {string} [id]          Globally unique UUID identifier for the Node.
   * @param {string} [version]     String formatted PTP timestamp.
   *                          (&lt;<em>seconds</em>&gt;:&lt;<em>nanoseconds</em>&gt;)
   *                          indicating precisely when an attribute of the resource
   *                          last changed.
   * @param {string} [label]       Freeform string label for the Node.
   * @param {string} [desc] Detailed description of the resource
   * @param {Object} [caps]     [Capabilities]{@link capabilities} (not yet defined).
   * @param {string[]} [tags]        Key value set of freeform string tags to aid in filtering resources. Values should be represented as an array of strings. Can be empty.
   */
  constructor(id, version, label, desc, caps, tags) {
    this.id = this.constructor.generateID(id),
    this.version = this.constructor.generateVersion(version)
    this.label = this.constructor.generateLabel(label)
    this.description = this.constructor.generateDescription(desc)
    this.caps = this.constructor.generateCaps(caps)
    this.tags = this.constructor.generateTags(tags)
  }

  /**
   * generate UUID id for the resource
   * @param  {string} [id]  Globally unique UUID identifier for the Node.
   * @return {string}       Globally unique UUID identifier for the Node.
   */
  static generateID(id) {
    if (arguments.length === 0 || id === null || id === undefined)
      return uuid.v4();
    else return id;
  }

  /**
   * generate Version for the resource
   * @param  {string} [version] String formatted PTP timestamp.
   *                          (&lt;<em>seconds</em>&gt;:&lt;<em>nanoseconds</em>&gt;)
   *                          indicating precisely when an attribute of the resource
   *                          last changed.
   * @return {string}         String formatted PTP timestamp.
   *                          (&lt;<em>seconds</em>&gt;:&lt;<em>nanoseconds</em>&gt;)
   *                          indicating precisely when an attribute of the resource
   *                          last changed.
   */
  static generateVersion(version) {
    if (arguments.length === 0 || version === null || version === undefined) {
      var currentNanos = nanoSeconds(process.hrtime());
      var difference = currentNanos - loadHRTime;
      var microDate = loadDate + Math.floor(difference / 1e6);
      return Math.floor(microDate / 1e3) + ":" + (difference % 1e9);
    }
    else return version;
  }

  /**
   * generate label for the resource
   * @param  {string} [label] Freeform string label for the Node.
   * @return {string}       Freeform string label for the Node.
   */
  static generateLabel(label) {
    if (arguments.length === 0 || label === null || label === undefined)
      return '';
    else return label;
  }

  /**
   * generate description for the resource
   * @param  {string} [desc] Detailed description of the resource
   * @return {string}      Detailed description of the resource
   */
  static generateDescription(desc) {
    if (arguments.length === 0 || desc === null || desc === undefined)
      return '';
    else return desc;
  }

  /**
   * generate Capabilities for the resource (not yet implemented)
   * @param  {Object} [caps] [Capabilities]{@link capabilities} (not yet defined).
   * @return {Object}      [Capabilities]{@link capabilities} (not yet defined).
   */
  static generateCaps(caps) {
    if (arguments.length === 0 || caps === null || caps === undefined)
      return Capabilities;
    else return caps;
  }

  /**
   * generate Tags for the resource
   * @param  {string[]} [tags] Key value set of freeform string tags to aid in filtering resources. Values should be represented as an array of strings. Can be empty.
   * @return {string[]}      Key value set of freeform string tags to aid in filtering resources. Values should be represented as an array of strings. Can be empty.
   */
  static generateTags(tags) {
    if (arguments.length === 0 || tags === null || tags === undefined)
      return [];
    else return tags;
  }

  //TODO: Add validation against JSON Schema from NMOS
  valid() {

  }
}

module.exports = Resource;
