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

// Describes the Node and the services which run on it

var Versionned = require('./Versionned.js');
var Capabilities = require('./Capabilities.js');
var Resource = require('./Resource.js');
var os = require('os')
let _ = require('lodash')

/**
 * Instantiate a Node object. All params are optional, as any required items are generated automatically and optional items, such as services or api_endpoints, can be added after the node is created.
 * @extends Resource
 */
class Node extends Resource {
  /**
   * @param {string} [id]         Inherited from {@link Resource}
   * @param {string} [version]         Inherited from {@link Resource}
   * @param {string} [label]         Inherited from {@link Resource}
   * @param {string} [description]         Inherited from {@link Resource}
   * @param {Object[]} [caps]         Inherited from {@link Resource}
   * @param {string[]} [tags]         Inherited from {@link Resource}
   * @param {string} [href]          HTTP access href for the Node's API (deprecated).
   * @param {Object[]} [services]      Array of objects containing a URN format type and href.
   * @param {Object[]} [clocks]        {@link Clocks} made available to Devices owned by this Node.
   * @param {(string | string[])} [interfaces]  Optional parameter to only include a specific interfaces or an array of interfaces. null returns all interfaces.
   */
  constructor(id, version, label, description, caps, tags, href, services, clocks, interfaces) {
    super(id, version, label, description, caps, tags)
    this.href = this.constructor.generateHref(href)
    this.api = this.constructor.generateAPI(this.constructor.generateInterfaces(interfaces))
    this.services = this.constructor.generateServices(services)
    this.clocks = this.constructor.generateClocks(clocks)
    this.interfaces = this.constructor.generateInterfaces(interfaces)
    this.hostname = ''
  }

  /**
   * generate Href for Node (deprecated in lieu of api, but still required as of dev v1.3). Auto updated when node server is spun up
   * @param  {string} href HTTP access href for the Node's API (deprecated).
   * @return {string}      HTTP access href for the Node's API (deprecated).
   */
  static generateHref(href) {
    if (arguments.length === 0 || href === null || href === undefined)
      return '';
    else return href;
  }

  /**
   * generate API object for Node. Auto updated when node server is spun up
   * @return {Object} Object with URL fragments required to connect to the Node API
   */
  static generateAPI(ifaces) {
    let endpoints = []
    _.each(ifaces, (iface) => {
      _.each(iface, (i) => {
        endpoints.push({
          host: i.address,
          protocol: "http"
        })
      })
    })
    return {
      versions: ["v1.1,v1.2"],
      endpoints: endpoints
    }
  }

  /**
   * generate services available on this Node
   * @param  {Object[]} [services] Array of objects containing a URN format type and href.
   * @return {Object[]}          Array of objects containing a URN format type and href.
   */
  static generateServices(services) {
    if (arguments.length === 0 || services === null || services === undefined)
      return [];
    else return services;
  }
  /**
   * genereate Clocks for this node
   * @param  {Object[]} [clocks] [Clocks]{@link clocks} Clocks made available to Devices owned by this Node.
   * @return {Object[]}        [Clocks]{@link clocks} Clocks made available to Devices owned by this Node.
   */
  static generateClocks(clocks) {
    if (arguments.length === 0 || clocks === null || clocks === undefined)
      return []
    else return clocks;
  }
  /**
   * [generateInterfaces description]
   * @param  {(string | string[])} [interfaces] Optional parameter to only include a specific interfaces or an array of interfaces. null returns all interfaces.
   * @return {object[]}            Network Interfaces made available to devices owned by this Node.
                                   Port Ids & Chassis Ids are used to inform topology discoery via IS-06 and require
                                   that interfaces implement ARP at a minimum, and ideally LLDP.
   */
  static generateInterfaces(interfaces) {
    let networkInterfaces = {}
    if (typeof interfaces == 'string') {
      networkInterfaces[interfaces] = os.networkInterfaces()[interfaces]
      return networkInterfaces
    } else if (typeof interfaces == 'object') {
      interfaces.forEach((int) => {
        networkInterfaces[int] = os.networkInterfaces()[int]
      })
      return networkInterfaces
    } else {
      return os.networkInterfaces()
    }
  }

  //TODO: Add validation against JSON Schema from NMOS
  valid() {

  }
}

module.exports = Node;
