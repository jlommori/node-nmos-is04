
const Resource = require('./Resource.js')
const _ = require('lodash')

class Receiver extends Resource {
  constructor(params) {
    if (params == undefined) { throw("Receiver requires parameters to be created")}
    if (params.receiver_type == undefined && !params.format) { throw("Receiver requires receiver_type or format to be created")}

    if (!params.serial && !params.id) throw("Serial number required to generate resource")

    super({
      type: 'receiver',
      serial: params.serial,
      id: params.id,
      version: params.version,
      label: params.label,
      description: params.description,
      tags: params.tags,
      caps: []
    })
    this.device_id = this.constructor.generateDeviceID(params.device_id)
    this.transport = this.constructor.generateTransport(params.transport)
    this.interface_bindings = this.constructor.generateInterfaceBindings(params.interface_bindings)
    this.format = params.format ? params.format : this.constructor.generateFormat(params.receiver_type)
    this.caps = this.constructor.generateCaps(params.caps, params.receiver_type)
    this.subscription = { sender_id: null, active: false }


  }

  static generateDeviceID(device_id) {
    if (arguments === 0 || device_id == null || device_id == undefined) {
      throw('Device ID required to create Receiver')
    }

    if (device_id.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g)) {
      return device_id
    } else {
      throw("Invalid UUID provided for Device ID")
    }
  }

  static generateTransport(transport) {
    if (arguments == 0 || transport == null || transport == undefined) {
      throw("Transport type is required to create Receiver")
    } else {
      let trans_enum = ["urn:x-nmos:transport:rtp", "urn:x-nmos:transport:rtp.ucast", "urn:x-nmos:transport:rtp.mcast", "urn:x-nmos:transport:dash"]

      if (_.indexOf(trans_enum, transport) != -1) {
        return transport
      } else {
        throw("Invalid Transport type provided")
      }
    }
  }

  static generateInterfaceBindings(interface_bindings) {
    if (arguments == 0 || interface_bindings == null || interface_bindings == undefined) {
      throw("Interface Binding is required to create Receiver")
    } else {
      return interface_bindings
    }
  }

  static generateFormat(type) {
    return `urn:x-nmos:format:${type}`
  }

  static generateCaps(caps, type) {
    if (arguments == 0 || caps == null || caps == undefined || typeof caps != 'object') {
      throw("Capabilties are required to create Receiver")
    }

    let video_enum = ["video/raw", "video/H264", "video/vc2"]
    let audio_enum = ["audio/L24", "audio/L20", "audio/L16", "audio/L8"]
    let data_enum = ["video/smpte291"]
    let mux_enum = ["video/smpte2022-6"]

    let capabilities = []
    _.each(caps, (cap) => {
      if (type == "video") {
        if (_.indexOf(video_enum, cap) != -1) {
          capabilities.push(cap)
        } else {
          console.warn("Invalid video capability provided")
        }
      } else if (type == "audio") {
        if (_.indexOf(audio_enum, cap) != -1) {
          capabilities.push(cap)
        } else {
          console.warn("Invalid audio capability provided")
        }
      } else if (type == "data") {
        if (_.indexOf(data_enum, cap) != -1) {
          capabilities.push(cap)
        } else {
          console.warn("Invalid data capability provided")
        }
      } else if (type == "mux") {
        if (_.indexOf(mux_enum, cap) != -1) {
          capabilities.push(cap)
        } else {
          console.warn("Invalid mux capability provided")
        }
      }
    })

    return capabilities
  }


  //TODO: Add validation against JSON Schema from NMOS
  valid() {
    return true
  }

}

module.exports = Receiver
