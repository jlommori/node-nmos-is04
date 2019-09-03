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

/*
 * Conflict resolution strategy is to check at the UI level if the most
 * recent changes goes backwards for the node involved. If yes, through a
 * conflict.
 */
var immutable = require('seamless-immutable');
var NodeStore = require('./NodeStore.js');
var util = require('./Util.js');
var Node = require('../model/Node.js');
var Device = require('../model/Device.js');
var Source = require('../model/Source.js');
var Receiver = require('../model/Receiver.js');
var Sender = require('../model/Sender.js');
var Flow = require('../model/Flow.js');
const _ = require('lodash')
/**
 * In RAM store representing the state of a [node]{@link Node} or regstry.
 * Immutable value.
 * @constructor
 * @implements {NodeStore}
 * @param {Node} self Node this store is to represent.
 * @return {(NodeRAMStore|Error)} New node RAM store or an error.
 */
class NodeRAMStore {
  constructor() {
    // console.log('NodeRAMStore init', self)
    /**
     * Details of this [node]{@link Node}. For use by the node API, not when in
     * use as a registry.
     * @type {Node}
     */
    // this.setSelf(node).then(() => {
    //   console.log('setSelf completed')
    // }).catch((e) => {
    //   console.error('setSelf Err', e)
    // })
    this.self = null
    /**
     * Map of nodes avaiable at this registry. Keys are UUIDs.
     * @type {Object.<string, Node>}
     */
    this.nodes = {};
    /**
     * Map of devices available at this [node]{@link Node} or registry. Keys are UUIDs.
     * @type {Object.<string, Device>}
     */
    this.devices = {};
    /**
     * Map of sources available at this [node]{@link Node} or registry. Keys are UUIDs.
     * @type {Object.<string, Source>}
     */
    this.sources = {};
    /**
     * Map of flows associated with this [node]{@link Node} or registry. Keys are UUIDs.
     * @type {Object.<string, Flow>
     */
    this.flows = {};
    /**
     * Map of senders associated with this [node]{@link Node} or registry. Keys are UUIDs.
     * @type {Object.<string, Sender>}
     */
    this.senders = {};
    /**
     * Map of receivers associated with this [node]{@link Node} or registry. Keys are UUIDs.
     * @type {Object.<string, Receiver>}
     */
    this.receivers = {};

  }


    //TODO JSDOC entries for methods


  // SELF
  getSelf() {
    return this.self
  }

  setSelf(node) {
    var current = this.self
    if (!util.isType(node, 'Node')) {
      throw util.statusError(400, "Object is not of the Node type")
    }

    if (!node.valid()) {
      throw util.statusError(400, "Node structure is not valid")
    }

    if (this.self && node.id !== this.self.id) {
      throw util.statusError(400, "A replacement Node value must have the same identifier '" + this.self.id + "' as this Node this store represents.")
    }

    if (this.self && node.version === this.self.version) {
      throw util.statusError(400, "The replacement Node must have a different version number")
    }

    if (this.self && util.compareVersions(node.version, this.self.version) !== -1) {
      throw util.statusError(400, "The replacement Node must have a newer version number")
    }

    this.self = node
    return {
      topic: "/self",
      path: '',
      previous: current,
      new: this.self
    }
  }

  // NODES
  getNodes(query) {
    console.log('getNodes', query)
    if (typeof query == "object") {
      _.each(query, (q) => {
        if (!util.validUUID(q)) {
          throw util.statusError(400, "Query array much contain only UUIDs")
        }
      })
      return _.filter(this.nodes, (o) => { return _.includes(query, o.id)})
    } else if (typeof query == "string") {
      return this.getNode(query)
    } else {
      return this.nodes
    }
  }

  getNode(id) {
    console.log('getNode', id)
    if (!id || !util.validUUID(id) || typeof id != "string") {
      throw util.statusError(400, "Query must be a valid UUID")
    }

    return _.find(this.nodes, (o) => { return o.id == id })
  }

  putNode(node) {
    if (!util.isType(node, 'Node')) {
      throw util.statusError(400, "Object is not of the Node type")
    }

    if (!util.checkValidAndForward(node, this.nodes, 'node')) throw "fail"

    this.nodes[node.id] = node
    return {
      topic: "/putNode",
      path: '',
      new: this.nodes
    }
  }

  deleteNode(id) {
    console.log('delete node', id)
    if (!id || typeof id != 'string' || !util.validUUID(id)) {
      throw util.statusError(400, "Query must be a valid UUID")
    }

    delete this.nodes[id]
    return {
      topic: "/deleteNode",
      path: '',
      new: this.nodes
    }
  }

  // DEVICES
  getDevices(query) {
    // console.log('getDevices', query)
    if (typeof query == "object") {
      _.each(query, (q) => {
        if (!util.validUUID(q)) {
          throw util.statusError(400, "Query array much contain only UUIDs")
        }
      })
      return _.filter(this.devices, (o) => { return _.includes(query, o.id)})
    } else if (typeof query == "string") {
      return this.getDevice(query)
    } else {
      return this.devices
    }
  }

  getDevice(id) {
    // console.log('getDevice', id)
    if (!id || !util.validUUID(id) || typeof id != "string") {
      throw util.statusError(400, "Query must be a valid UUID")
    }

    return _.find(this.devices, (o) => { return o.id == id })
  }

  putDevice(device) {
    // console.log('putDevice', device)
    if (!util.isType(device, 'Device')) {
      throw util.statusError(400, "Object is not of the Device type")
    }

    if (!util.checkValidAndForward(device, this.devices, 'device')) throw "fail"

    if (this.self) { //if self exists, this is a node, not registry
      if (device.node_id !== this.self.id) {
        throw util.statusError(400, "Device node_id must reference this node")
      }
    } else {
      if (Object.keys(this.nodes).indexOf(device.node_id) < 0) {
        throw util.statusError(400, "Device node_id property must reference existing node")
      }
    }

    this.devices[device.id] = device
    return {
      topic: "/putDevice",
      path: '',
      new: this.device
    }
  }

  deleteDevice(id) {
    console.log('delete device', id)
    if (!id || typeof id != 'string' || !util.validUUID(id)) {
      throw util.statusError(400, "Query must be a valid UUID")
    }

    delete this.devices[id]
    return {
      topic: "/deleteDevice",
      path: '',
      new: this.devices
    }
  }

}

module.exports = NodeRAMStore;
