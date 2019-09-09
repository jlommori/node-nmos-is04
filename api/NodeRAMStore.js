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
    this.self = undefined
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


  getResources() {
    return {
      self: this.self,
      nodes: this.nodes,
      devices: this.devices,
      sources: this.sources,
      flows: this.flows,
      senders: this.senders,
      receivers: this.receivers
    }
  }

  getResourceIDs() {
    let nodeIds = []
    let deviceIds = []
    let sourceIds = []
    let flowIds = []
    let senderIds = []
    let receiverIds = []

    _.each(this.nodes, (o) => { nodeIds.push(o.id)})
    _.each(this.devices, (o) => { deviceIds.push(o.id)})
    _.each(this.sources, (o) => { sourceIds.push(o.id)})
    _.each(this.flows, (o) => { flowIds.push(o.id)})
    _.each(this.senders, (o) => { senderIds.push(o.id)})
    _.each(this.receivers, (o) => { receiverIds.push(o.id)})

    return {
      self: this.self.id,
      nodes: nodeIds,
      devices: deviceIds,
      sources: sourceIds,
      flows: flowIds,
      senders: senderIds,
      receivers: receiverIds
    }
  }

  getResourceCounts() {
    let s = 0
    if (this.self) s = 1
    return {
      self: s,
      nodes: _.size(this.nodes),
      devices: _.size(this.devices),
      sources: _.size(this.sources),
      flows: _.size(this.flows),
      senders: _.size(this.senders),
      receivers: _.size(this.receivers)
    }
  }

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
    this.putNode(node)
    return node
  }

  // NODES
  putNode(node) {
    if (!util.isType(node, 'Node')) { throw util.statusError(400, "Object is not of the Node type") }
    if (!util.checkValidAndForward(node, this.nodes, 'node')) { throw util.statusError(400, "Object is not valid") }

    this.nodes[node.id] = node
    return node
  }

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
    if (!id || !util.validUUID(id) || typeof id != "string") { throw util.statusError(400, "Query must be a valid UUID") }

    return _.find(this.nodes, (o) => { return o.id == id })
  }

  deleteNode(id) {
    console.log('delete node', id)
    if (!id || typeof id != 'string' || !util.validUUID(id)) {
      throw util.statusError(400, "Query must be a valid UUID")
    }

    delete this.nodes[id]
    return id
  }

  // DEVICES
  putDevice(device) {
    // console.log('putDevice', device)
    if (!util.isType(device, 'Device')) { throw util.statusError(400, "Object is not of the Device type") }
    if (!util.checkValidAndForward(device, this.devices, 'Device')) { throw util.statusError(400, "Object is not valid") }

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
    return device
  }

  getDevices(query) {
    // console.log('getDevices', query)
    if (typeof query == "object") {
      _.each(query, (q) => {
        if (!util.validUUID(q)) {
          throw util.statusError(400, "Query array must contain only UUIDs")
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
    if (!id || !util.validUUID(id) || typeof id != "string") { throw util.statusError(400, "Query must be a valid UUID") }

    return _.find(this.devices, (o) => { return o.id == id })
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

  //Sources
  putSource(source) {
    // console.log('putSource', source)
    if (!util.isType(source, 'Source')) { throw util.statusError(400, "Object is not of the Source type") }
    if (!util.checkValidAndForward(source, this.sources, 'Source')) { throw util.statusError(400, "Object is not valid") }
    if (!_.has(this.devices, source.device_id)) { throw util.statusError(400, "Source device_id must be a Device on this Node") }

    this.sources[source.id] = source
    return source
  }

  getSources(query) {
    if (typeof query == "object") {
      _.each(query, (q) => { if (!util.validUUID(q)) { throw util.statusError(400, "Query array must contain only UUIDs") } })

      return _.filter(this.sources, (o) => { return _.includes(query, o.id) })
    } else if (typeof query == "string") {
      return this.getSource(query)
    } else {
      return this.sources
    }
  }

  getSource(id) {
    if (!id || !util.validUUID(id) || typeof id != 'string') { throw util.statusError(400, "Query must be a valid UUID") }

    return _.find(this.sources, (o) => { return o.id == id })
  }

  deleteSource(id) {
    if (!id || !util.validUUID(id) || typeof id != 'string') { throw util.statusError(400, "Query must be a valid UUID") }
    if (!_.has(this.sources, (o) => { o.id == id })) { throw util.statusError(400, "Source not present on this node") }

    delete this.sources[id]
    return {
      topic: "/deleteSource",
      path: '',
      new: this.sources
    }
  }

  //Flows
  putFlow(flow) {
    // console.log('putFlow', flow)
    if (!util.isType(flow, 'Flow')) { throw util.statusError(400, "Object is not of the Flow type") }
    if (!util.checkValidAndForward(flow, this.flows, 'Flow')) { throw util.statusError(400, "Object is not valid") }
    if (!_.has(this.devices, flow.device_id)) { throw util.statusError(400, "Flow device_id must be a Device on this Node") }
    if (!_.has(this.sources, flow.source_id)) { throw util.statusError(400, "Flow source_id must be a Source on this Node") }

    this.flows[flow.id] = flow
    return flow
  }

  getFlows(query) {
    if (typeof query == "object") {
      _.each(query, (q) => { if (!util.validUUID(q)) { throw util.statusError(400, "Query array must contain only UUIDs") } })
      return _.filter(this.flows, (o) => { return _.includes(query, o.id) })
    } else if (typeof query == "string") {
      return this.getFlow(query)
    } else {
      return this.flows
    }
  }

  getFlow(id) {
    if (!id || !util.validUUID(id) || typeof id != 'string') { throw util.statusError(400, "Query must be a valid UUID") }

    return _.find(this.flows, (o) => { return o.id == id })
  }

  deleteFlow(id) {
    if (!id || !util.validUUID(id) || typeof id != 'string') { throw util.statusError(400, "Query must be a valid UUID") }
    if (!_.has(this.flows, (o) => { o.id == id })) { throw util.statusError(400, "Flow not present on this node") }

    delete this.flows[id]
    return {
      topic: "/deleteFlow",
      path: '',
      new: this.flows
    }
  }

  //Senders
  putSender(sender) {
    // console.log('putSender', sender)
    if (!util.isType(sender, 'Sender')) { throw util.statusError(400, "Object is not of the Sender type")}
    if (!util.checkValidAndForward(sender, this.senders, 'Sender')) { throw util.statusError(400, "Object is not valid")}
    if (!_.has(this.devices, sender.device_id)) { throw util.statusError(400, "Sender device_id must be a Device on this Node")}
    if (sender.flow_id) {
      if (!_.has(this.flows, sender.flow_id)) { throw util.statusError(400, "Sender flow_id must be a Flow on this Node")}
    }

    this.senders[sender.id] = sender
    return sender
  }

  getSenders(query) {
    if (typeof query == "object") {
      _.each(query, (q) => { if (!util.validUUID(q)) { throw util.statusError(400, "Query array must contain only UUIDs") } })
      return _.filter(this.senders, (o) => { return _.includes(query, o.id) })
    } else if (typeof query == "string") {
      return this.getSender(query)
    } else {
      return this.senders
    }
  }

  getSender(id) {
    if (!id || !util.validUUID(id) || typeof id != 'string') { throw util.statusError(400, "Query must be a valid UUID") }

    return _.find(this.senders, (o) => { return o.id == id })
  }

  deleteSender(id) {
    if (!id || !util.validUUID(id) || typeof id != 'string') { throw util.statusError(400, "Query must be a valid UUID") }
    if (!_.has(this.senders, (o) => { o.id == id })) { throw util.statusError(400, "Sender not present on this node") }

    delete this.senders[id]
    return {
      topic: "/deleteSender",
      path: '',
      new: this.senders
    }
  }

  //Receivers
  putReceiver(receiver) {
    // console.log('putReceiver', receiver)
    if (!util.isType(receiver, 'Receiver')) { throw util.statusError(400, "Object is not of the Receiver type")}
    if (!util.checkValidAndForward(receiver, this.receivers, 'Receiver')) { throw util.statusError(400, 'Object is not valid')}
    if (!_.has(this.devices, receiver.device_id)) { throw util.statusError(400, "Receiver device_id must be a Device on this Node")}

    this.receivers[receiver.id] = receiver
    return receiver
  }

  getReceivers(query) {
    if (typeof query == "object") {
      _.each(query, (q) => { if (!util.validUUID(q)) { throw util.statusError(400, "Query array must contain only UUIDs") } })
      return _.filter(this.receivers, (o) => { return _.includes(query, o.id) })
    } else if (typeof query == "string") {
      return this.getReceiver(query)
    } else {
      return this.receivers
    }
  }

  getReceiver(id) {
    if (!id || !util.validUUID(id) || typeof id != 'string') { throw util.statusError(400, "Query must be a valid UUID") }

    return _.find(this.receivers, (o) => { return o.id == id })
  }

  deleteReceiver(id) {
    if (!id || !util.validUUID(id) || typeof id != 'string') { throw util.statusError(400, "Query must be a valid UUID") }
    if (!_.has(this.receivers, (o) => { o.id == id })) { throw util.statusError(400, "Sender not present on this node") }

    delete this.receivers[id]
    return {
      topic: "/deleteReceiver",
      path: '',
      new: this.receivers
    }
  }
}

module.exports = NodeRAMStore;
