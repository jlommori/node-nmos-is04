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

// var Versionned = require('./Versionned.js');
// var Capabilities = require('./Capabilities.js');
var Resource = require('./Resource.js');
var os = require('os')
let _ = require('lodash')

/**
 * Instantiate a Node object. All params are optional, as any required items are generated automatically and optional items, such as services or api_endpoints, can be added after the node is created.
 * @extends Resource
 * @param {object} params       Object containing all Node parameters
 * @param {string} [params.id]         Inherited from {@link Resource}
 * @param {string} [params.version]         Inherited from {@link Resource}
 * @param {string} [params.label]         Inherited from {@link Resource}
 * @param {string} [params.description]         Inherited from {@link Resource}
 * @param {Object[]} [params.caps]         Inherited from {@link Resource}
 * @param {string[]} [params.tags]         Inherited from {@link Resource}
 * @param {string} [params.href]          HTTP access href for the Node's API (deprecated).
 * @param {Object[]} [params.services]      Array of objects containing a URN format type and href.
 * @param {Object[]} [params.clocks]        {@link Clocks} made available to Devices owned by this Node.
 * @param {(string | string[])} [params.interfaces]  Optional parameter to only include a specific interfaces or an array of interfaces. null returns all interfaces.
 */
class Node extends Resource {
  constructor(params) {
    if (params == undefined) {
      params = {}
    }
    super({
      id: params.id,
      version: params.version,
      label: params.label,
      description: params.description,
      caps: params.caps,
      tags: params.tags
    })
    this.href = this.constructor.generateHref(params.href)
    this.api = this.constructor.generateAPI(this.constructor.generateInterfaces(params.interfaces))
    this.services = this.constructor.generateServices(params.services)
    this.clocks = this.constructor.generateClocks(params.clocks)
    this.interfaces = this.constructor.generateInterfaces(params.interfaces)
    this.hostname = ''
  }

  static generateHref(href) {
    if (arguments.length === 0 || href === null || href === undefined)
      return '';
    else return href;
  }

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

  static generateServices(services) {
    if (arguments.length === 0 || services === null || services === undefined)
      return [];
    else return services;
  }

  static generateClocks(clocks) {
    if (arguments.length === 0 || clocks === null || clocks === undefined)
      return []
    else return clocks;
  }

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
    return true;
  }
}

module.exports = Node;
