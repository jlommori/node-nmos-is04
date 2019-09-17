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
const Resource = require('./Resource.js')
const _ = require('lodash')

/**
 * Instantiate a Device object, All params are optional, as any required items are generated
 * @extends Resource
 * @param {object} params         Object containing all Device parameters
 * @param {string} [params.id]            Inerited from {@link Resource}
 * @param {string} [params.version]       Inherited from {@link Resource}
 * @param {string} [params.label]         Inherited from {@link Resource}
 * @param {string} [params.description]   Inherited from {@link Resource}
 * @param {Object[]} [params.caps]        Inherited from {@link Resource}
 * @param {string[]} [params.tags]        Inherited from {@link Resource}
 * @param {string} [params.type]          Device Type URN
 * @param {string} params.node_id         Globally unique identifier for the Node which initially created the Device
 * @param {[string]} [params.controls]    Control endpoints exposed for the Device //TODO Research control endpoint options
 */
class Device extends Resource {
  constructor(params) {
    if (params == undefined) { throw("Device requires parameters to be created") }
    super({
      id: params.id,
      version: params.version,
      label: params.label,
      description: params.description,
      caps: params.caps,
      tags: params.tags
    })
    this.type = this.constructor. generateType(params.type)
    this.node_id = this.constructor.generateNodeID(params.node_id)
    this.senders = [] //deprecated but still required as of v1.2.1
    this.receivers = [] //deprecated but still required as of v1.2.1
    this.controls = this.constructor.generateControls(params.controls)
  }

  static generateType(type) {
    let type_enum = [
      "urn:x-nmos:device:pipeline",
      "urn:x-nmos:device:generic"
    ]
    if (arguments.length === 0 || type === null || type === undefined) {
      return "urn:x-nmos:device:generic"
    } else if (_.indexOf(type_enum, type) != -1) {
      return type
    } else {
      throw("Invalid device type provided")
    }
  }

  static generateNodeID(node_id) {
    if (arguments.length == 0 || node_id == null || node_id == undefined) {
      throw("params.node_id required to create Device")
    }

    if (node_id.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g)) {
      return node_id
    } else {
      throw("Invalid UUID provided for Node ID")
    }
  }

  static generateControls(controls) {
    if (arguments.length == 0 || controls == null || controls == undefined) {
      return []
    } else {
      return controls
    }
  }

  //TODO: Add validation against JSON Schema from NMOS
  valid() {
    return true
  }
}

module.exports = Device;
