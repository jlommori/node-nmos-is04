
const Resource = require('./Resource.js')
const _ = require('lodash')

class Sender extends Resource {
  constructor(params) {
    if (params == undefined) { throw("Sender requires parameters to be created") }

    super({
      id: params.id,
      version: params.version,
      label: params.label,
      description: params.description,
      caps: params.caps,
      tags: params.tags
    })

    this.flow_id = this.constructor.generateFlowID(params.flow_id)
    this.transport = this.constructor.generateTransport(params.transport)
    this.device_id = this.constructor.generateDeviceID(params.device_id)
    this.manfiest_href = this.constructor.generateManifest(params.manifest_href)
    this.interface_bindings = this.constructor.generateInterfaceBindings(params.interface_bindings)
    this.subscription = { receiver_id: null, active: false }
  }

  static generateFlowID(flow_id) {
    if (arguments == 0 || flow_id == null || flow_id == undefined) {
      return null
    } else {
      if (flow_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/g)) {
        return flow_id
      } else {
        throw("Invalid Flow ID provided")
      }
    }
  }

  static generateTransport(transport) {
    if (arguments == 0 || transport == null || transport == undefined) {
      throw("Transport type is required to create Sender")
    } else {
      let trans_enum = ["urn:x-nmos:transport:rtp", "urn:x-nmos:transport:rtp.ucast", "urn:x-nmos:transport:rtp.mcast", "urn:x-nmos:transport:dash"]

      if (_.indexOf(trans_enum, transport) != -1) {
        return transport
      } else {
        throw("Invalid Transport type provided")
      }
    }
  }

  static generateDeviceID(device_id) {
    if (arguments === 0 || device_id == null || device_id == undefined) {
      throw('Device ID required to create Sender')
    }

    if (device_id.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g)) {
      return device_id
    } else {
      throw("Invalid UUID provided for Device ID")
    }
  }

  //TODO: Dynamically generate appropriate manifest_href. Here or in store?
  static generateManifest(manifest_href) {
    if (arguments == 0 || manifest_href == null || manifest_href == undefined) {
      return null
    } else {
      return manifest_href
    }
  }

  static generateInterfaceBindings(interface_bindings) {
    if (arguments == 0 || interface_bindings == null || interface_bindings == undefined) {
      throw("Interface Binding is required to create Sender")
    } else {
      return interface_bindings
    }
  }

  //TODO: Add validation against JSON Schema from NMOS
  valid() {
    return true
  }
}

module.exports = Sender
