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
var NodeStore = require('./NodeStore.js');
var util = require('./Util.js');
var Node = require('../model/Node.js');
var Device = require('../model/Device.js');
var Source = require('../model/Source.js');
var Receiver = require('../model/Receiver.js');
var Sender = require('../model/Sender.js');
var Flow = require('../model/Flow.js');
const _ = require('lodash')
const EventEmitter = require('events');
/**
 * In RAM store representing the state of a [node]{@link Node} or regstry.
 * Immutable value.
 * @constructor
 * @implements {NodeStore}
 * @param {Node} self Node this store is to represent.
 * @return {(NodeRAMStore|Error)} New node RAM store or an error.
 */
class NodeRAMStore extends EventEmitter {
  constructor(params) {
    if (!params) params = {}
    super()
    
    /**
     * Details of this [node]{@link Node}. For use by the node API, not when in
     * use as a registry.
     * @type {Node}
     */
    // this.setSelf(node).then(() => {

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

    this.log = new util.Logger('NodeRAMStore', {txtColor: 'black', bgColor: 'green'}, params.log ? params.log.level ? params.log.level : 2 : 2, params.log ? params.log.verbose ? params.log.verbose : false : false)
    this.log.info('NodeRAMStore initialized', this)

  }


    //TODO JSDOC entries for methods


  getResources() {
    this.log.debug('getResources()')
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
    this.log.debug('getResourceIDs()')
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
    this.log.debug('getResourceCounts()')
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
    this.log.debug('getSelf()')
    return this.self
  }

  setSelf(node) {
    this.log.debug('setSelf(node)', {
      node: node
    })
    var current = this.self
    if (!util.isType(node, 'Node')) {
      this.log.error('Object is not of the Node type', node)
      throw util.statusError(400)
    }

    if (!node.valid()) {
      this.log.error("Node structure is not valid", node)
      throw util.statusError(400)
    }

    if (this.self && node.id !== this.self.id) {
      this.log.error("A replacement Node value must have the same identifier '" + this.self.id + "' as this Node this store represents.", {
        node: node,
        self: this.self
      })
      throw util.statusError(400)
    }

    if (this.self && node.version === this.self.version) {
      this.log.error("The replacement Node must have a different version number", {
        node: node,
        self: this.self
      })
      throw util.statusError(400)
    }

    if (this.self && util.compareVersions(node.version, this.self.version) !== -1) {
      this.log.error("The replacement Node must have a newer version number", {
        node: node,
        self: this.self
      })
      throw util.statusError(400)
    }

    this.self = node
    this.putNode(node)
    this.emit('modify', {
      topic: '/self',
      event: 'put',
      data: node
    })
    return node
  }

  // NODES
  putNode(node) {
    this.log.debug('putNode(node)', {
      node: node
    })
    if (!util.isType(node, 'Node')) { 
      this.log.error("Object is not of the Node type", node)
      throw util.statusError(400) 
    }
    if (!util.checkValidAndForward(node, this.nodes, 'node')) { 
      this.log.error("Object is not valid", node)
      throw util.statusError(400) 
    }

    if (!this.nodes[node.id]) {
      this.nodes[node.id] = node
      this.emit('create', {
        topic: '/nodes',
        data: node
      })
    } else {
      this.emit('modify', {
        topic: '/nodes',
        data: node
      })
      this.nodes[node.id] = node
    }

    return node
  }

  getNodes() {
    this.log.debug('getNodes()')
    return this.nodes
  }

  getNode(id) {
    this.log.debug('getNode(id)', {
      id: id
    })
    if (!id || !util.validUUID(id) || typeof id != "string") { 
      this.log.error('Query must be a valid UUID', id)
      throw util.statusError(400) }

    return _.find(this.nodes, (o) => { return o.id == id })
  }

  deleteNode(id) {
    this.log.debug('deleteNode(id)', {
      id: id
    })
    if (!id || typeof id != 'string' || !util.validUUID(id)) {
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400)
    }

    this.emit('delete', {
      topic: '/nodes',
      data: this.nodes[id]
    })
    delete this.nodes[id]
    return id
  }

  // DEVICES
  putDevice(device) {
    this.log.debug('putDevice(device)', {
      device: device
    })
    if (!util.isType(device, 'Device')) { 
      this.log.error("Object is not of the Device type", device)
      throw util.statusError(400) }
    if (!util.checkValidAndForward(device, this.devices, 'Device')) { 
      this.log.error("Object is not valid", device)
      throw util.statusError(400) }

    if (this.self) { //if self exists, this is a node, not registry
      if (device.node_id !== this.self.id) {
        this.log.error("Device node_id must reference this node", {
          device: device,
          self: this.self
        })
        throw util.statusError(400)
      }
    } else {
      if (Object.keys(this.nodes).indexOf(device.node_id) < 0) {
        this.log.error('Device node_id property must reference existing node', {
          device: device
        })
        throw util.statusError(400)
      }
    }

    if (!this.devices[device.id]) {
      this.devices[device.id] = device
      this.emit('create', {
        topic: '/devices',
        data: device
      })
    } else {
      this.emit('modify', {
        topic: '/devices',
        data: device
      })
      this.devices[device.id] = device
    }
    return device
  }

  getDevices(query) {
    this.log.debug('getDevices(query)', {
      query: query
    })
    if (typeof query == "object") {
      _.each(query, (q) => {
        if (!util.validUUID(q)) {
          this.log.error("Query array must contain only UUIDs", {
            query: q
          })
          throw util.statusError(400)
        }
      })
      return _.filter(this.devices, (o) => { return _.includes(query, o.id)})
    } else if (typeof query == "string") {
      return this.getDevice(query)
    } else {
      return this.devices
    }

    return this.devices
  }

  getDevice(id) {
    this.log.debug('getDevice(id)', {
      id: id
    })
    if (!id || !util.validUUID(id) || typeof id != "string") { 
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400) }

    return _.find(this.devices, (o) => { return o.id == id })
  }

  deleteDevice(id) {
    this.log.debug('deleteDevice(id)', {
      id: id
    })
    if (!id || typeof id != 'string' || !util.validUUID(id)) {
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400)
    }

    this.emit('delete', {
      topic: '/devices',
      data: this.devices[id]
    })
    delete this.devices[id]
    return id
  }

  //Sources
  putSource(source) {
    this.log.debug('putSource(source)', {
      source: source
    })
    if (!util.isType(source, 'Source')) { 
      this.log.error("Object is not of the Source type", source)
      throw util.statusError(400) }
    if (!util.checkValidAndForward(source, this.sources, 'Source')) { 
      this.log.error("Object is not valid", source)
      throw util.statusError(400) }
    if (!_.has(this.devices, source.device_id)) { 
      this.log.error("Source device_id must be a Device on this Node", source)
      throw util.statusError(400) }

    if (!this.sources[source.id]) {
      this.sources[source.id] = source
      this.emit('create', {
        topic: '/sources',
        data: source
      })
    } else {
      this.emit('modify', {
        topic: '/sources',
        data: source
      })
      this.sources[source.id] = source
    }
    return source
  }

  getSources(query) {
    this.log.debug('getSources(query)', {
      query: query
    })
    if (typeof query == "object") {
      _.each(query, (q) => { if (!util.validUUID(q)) { 
        this.log.error("Query array must contain only UUIDs", {
          query: q
        })
        throw util.statusError(400) } })

      return _.filter(this.sources, (o) => { return _.includes(query, o.id) })
    } else if (typeof query == "string") {
      return this.getSource(query)
    } else {
      return this.sources
    }
    return this.sources
  }

  getSource(id) {
    this.log.debug('getSource(id)', {
      id: id
    })
    if (!id || !util.validUUID(id) || typeof id != 'string') { 
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400) }

    return _.find(this.sources, (o) => { return o.id == id })
  }

  deleteSource(id) {
    this.log.debug('deleteSource(id)', {
      id: id
    })
    if (!id || !util.validUUID(id) || typeof id != 'string') { 
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400) }
    if (!_.has(this.sources, (o) => { o.id == id })) { 
      this.log.error("Source not present on this node", id)
      throw util.statusError(400) }


    this.emit('modify', {
      topic: '/delete',
      data: this.sources[id]
    })
    delete this.sources[id]
    return id
  }

  //Flows
  putFlow(flow) {
    this.log.debug('putFlow(flow)', {
      flow: flow
    })
    if (!util.isType(flow, 'Flow')) { 
      this.log.error("Object is not of the Flow type", flow)
      throw util.statusError(400) }
    if (!util.checkValidAndForward(flow, this.flows, 'Flow')) { 
      this.log.error("Object is not valid", flow)
      throw util.statusError(400) }
    if (!_.has(this.devices, flow.device_id)) { 
      this.log.error("Flow device_id must be a Device on this Node", flow)
      throw util.statusError(400) }
    if (!_.has(this.sources, flow.source_id)) { 
      this.log.error("Flow source_id must be a Source on this Node", flow)
      throw util.statusError(400) }

    if (!this.flows[flow.id]) {
      this.flows[flow.id] = flow
      this.emit('create', {
        topic: '/flows',
        data: flow
      })
    } else {
      this.emit('modify', {
        topic: '/flows',
        data: flow
      })
      this.flows[flow.id] = flow
    }
    return flow
  }

  getFlows(q) {
    this.log.debug('getFlows(q)', {
      q: q
    })
    if (q) {
      let arr = _.values(this.flows)
      return rql.executeQuery(q, {}, arr)
    } else {
      return this.flows
    }
    return this.flows
  }

  getFlow(id) {
    this.log.debug('getFlow(id)', {
      id: id
    })
    if (!id || !util.validUUID(id) || typeof id != 'string') { 
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400) }

    return _.find(this.flows, (o) => { return o.id == id })
  }

  deleteFlow(id) {
    this.log.debug('deleteFlow(id)', {
      id: id
    })
    if (!id || !util.validUUID(id) || typeof id != 'string') { 
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400) }
    if (!_.has(this.flows, (o) => { o.id == id })) { 
      this.log.error("Flow not present on this node", id)
      throw util.statusError(400) }


    this.emit('delete', {
      topic: '/flows',
      data: this.flows[id]
    })
    delete this.flows[id]
    return id
  }

  //Senders
  putSender(sender) {
    this.log.debug('putSender(sender)', {
      sender: sender
    })
    if (!util.isType(sender, 'Sender')) { 
      this.log.error("Object is not of the Sender type", sender)
      throw util.statusError(400)}
    if (!util.checkValidAndForward(sender, this.senders, 'Sender')) { 
      this.log.error("Object is not valid", sender)
      throw util.statusError(400)}
    if (!_.has(this.devices, sender.device_id)) { 
      this.log.error("Sender device_id must be a Device on this Node", sender)
      throw util.statusError(400)}
    if (sender.flow_id) {
      if (!_.has(this.flows, sender.flow_id)) { 
        this.log.error("Sender flow_id must be a Flow on this Node", sender)
        throw util.statusError(400)}
    }


    if (!this.senders[sender.id]) {
      this.senders[sender.id] = sender
      this.emit('create', {
        topic: '/senders',
        data: sender
      })
    } else {
      this.emit('modify', {
        topic: '/senders',
        data: sender
      })
      this.senders[sender.id] = sender
    }
    return sender
  }

  getSenders(query) {
    this.log.debug('getSenders(query)', {
      query: query
    })
    if (typeof query == "object") {
      _.each(query, (q) => { if (!util.validUUID(q)) { 
        this.log.error("Query array must contain only UUIDs", {
          query: q
        })
        throw util.statusError(400) } })
      return _.filter(this.senders, (o) => { return _.includes(query, o.id) })
    } else if (typeof query == "string") {
      return this.getSender(query)
    } else {
      return this.senders
    }
    return this.senders
  }

  getSender(id) {
    this.log.debug('getSender(id)', {
      id: id
    })
    if (!id || !util.validUUID(id) || typeof id != 'string') { 
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400) }

    return _.find(this.senders, (o) => { return o.id == id })
  }

  deleteSender(id) {
    this.log.debug('deleteSender(id)', {
      id: id
    })
    if (!id || !util.validUUID(id) || typeof id != 'string') { 
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400) }
    if (!_.has(this.senders, (o) => { o.id == id })) { 
      this.log.error("Sender not present on this node", id)
      throw util.statusError(400) }

    this.emit('delete', {
      topic: '/senders',
      data: this.senders[id]
    })
    delete this.senders[id]
    return id
  }

  //Receivers
  putReceiver(receiver) {
    this.log.debug('putReceiver(receiver)', {
      receiver: receiver
    })

    if (!util.isType(receiver, 'Receiver')) { 
      this.log.error("Object is not of the Receiver type", receiver)
      throw util.statusError(400)}
    if (!util.checkValidAndForward(receiver, this.receivers, 'Receiver')) { 
      this.log.error('Object is not valid', receiver)
      throw util.statusError(400)}
    if (!_.has(this.devices, receiver.device_id)) { 
      this.log.error("Receiver device_id must be a Device on this Node", receiver)
      throw util.statusError(400)}

    if (!this.receivers[receiver.id]) {
      this.receivers[receiver.id] = receiver
      this.emit('create', {
        topic: '/receivers',
        data: receiver
      })
    } else {
      this.receivers[receiver.id] = receiver
      this.emit('modify', {
        topic: '/receivers',
        data: receiver
      })
    }
    return receiver
  }

  getReceivers(query) {
    this.log.debug('getReceivers(query)', {
      query: query
    })
    if (typeof query == "object") {
      _.each(query, (q) => { if (!util.validUUID(q)) { 
        this.log.error("Query array must contain only UUIDs", {
          query: q
        })
        throw util.statusError(400) } })
      return _.filter(this.receivers, (o) => { return _.includes(query, o.id) })
    } else if (typeof query == "string") {
      return this.getReceiver(query)
    } else {
      return this.receivers
    }
    return this.receivers
  }

  getReceiver(id) {
    this.log.debug('getReceiver(id)', {
      id: id
    })
    if (!id || !util.validUUID(id) || typeof id != 'string') { 
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400) }

    return _.find(this.receivers, (o) => { return o.id == id })
  }

  deleteReceiver(id) {
    this.log.debug('deleteReceiver(id)', {
      id: id
    })
    if (!id || !util.validUUID(id) || typeof id != 'string') { 
      this.log.error("Query must be a valid UUID", id)
      throw util.statusError(400) }
    if (!_.has(this.receivers, (o) => { o.id == id })) { 
      this.log.error("Sender not present on this node", id)
      throw util.statusError(400) }

    this.emit('delete', {
      topic: '/receivers',
      data: this.receivers[id]
    })
    delete this.receivers[id]
    return id
  }
}

module.exports = NodeRAMStore;
