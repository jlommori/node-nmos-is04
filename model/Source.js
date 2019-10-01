
const Resource = require('./Resource.js')
const _ = require('lodash')

/**
 * Instantiate a Source object. All params are optional, any required items are generated
 * @extends Resource
 * @param {object} params     Object containing all Source properties
 * @param {string} [params.id]            Inerited from {@link Resource}
 * @param {string} [params.version]       Inherited from {@link Resource}
 * @param {string} [params.label]         Inherited from {@link Resource}
 * @param {string} [params.description]   Inherited from {@link Resource}
 * @param {Object[]} [params.caps]        Inherited from {@link Resource}
 * @param {string[]} [params.tags]        Inherited from {@link Resource}
 * @param {string} params.device_id              UUID for the Device which initially created the Source. This attribute is used to ensure referential integrity by registry implementations.
 * @param {[string]} [params.parents]            Array of UUIDs representing the Source IDs of Grains which came together at the input to this Source (may change over the lifetime of this Source)
 * @param {string} [params.clock_name]           Reference to clock in the originating Node
 * @param {object} [params.grain_rate]           Maximum number of Grains per second for Flows derived from this Source.
                                          Corresponding Flow Grain rates may override this attribute.
                                          Grain rate matches the frame rate for video (see NMOS Content Model). Specified for periodic Sources only
 * @param {number} [params.grain_rate.numerator] Numerator
 * @param {number}  [params.grain_rate.denominator] Denominator
 * @param {string} params.format        Source Format
 * @param {[object]}  [params.channels]  Array of audio channels objects
 * @param {string}    [params.channels.label]   Label for an audio channel (free text)
 * @param {string}    [params.channels.symbol]  Symbol for this channel (per VSF TR-03 Appendix A)
 */
class Source extends Resource {
  constructor(params) {
    if (params == undefined) { throw("Source requires parameters to be created") }
    if (!params.id && !params.serial) throw("Serial number required to generate resource")

    super({
      type: 'source',
      serial: params.serial,
      id: params.id,
      version: params.version,
      label: params.label,
      description: params.description,
      caps: params.caps,
      tags: params.tags
    })

    this.device_id = this.constructor.generateDeviceID(params.device_id)
    this.parents = this.constructor.generateParents(params.parents)
    this.clock_name = this.constructor.generateClockName(params.clock_name)
    this.grain_rate = this.constructor.generateGrainRate(params.grain_rate)
    this.format = this.constructor.generateFormat(params.format)
    this.channels = this.constructor.generateAudioChannels(params.channels)
  }

  static generateDeviceID(device_id) {
    if (arguments === 0 || device_id == null || device_id == undefined) {
      throw('params.device_id required to create Source')
    }

    if (device_id.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g)) {
      return device_id
    } else {
      throw("Invalid UUID provided for Device ID")
    }
  }

  static generateParents(parents) {
    if (arguments === 0 || parents == null || parents == undefined) {
      return []
    } else {
      var a = []
      _.each(parents, (p, i) => {
        if (p.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g)) {
          a.push(p)
        } else {
          console.warn("Invalid UUID provided for parent at index " + i)
        }
      })

      return a
    }
  }

  static generateClockName(clock_name) {
    if (arguments == 0 || clock_name == null || clock_name == undefined) {
      return null
    } else {
      return clock_name
    }
  }

  static generateGrainRate(grain_rate) {
    if (arguments == 0 || grain_rate == null || grain_rate == undefined) {
      return null
    } else {
      return grain_rate
    }
  }

  static generateFormat(format) {
    let format_enum = [
      "urn:x-nmos:format:video",
      "urn:x-nmos:format:audio",
      "urn:x-nmos:format:data",
      "urn:x-nmos:format:mux"
    ]

    if (arguments == 0 || format == null || format == undefined) {
      throw("Format required to generate Source")
    } else if (_.indexOf(format_enum, format) != -1) {
      return format
    } else {
      throw(`Invalid format type provided: ${format}`)
    }
  }

  static generateAudioChannels(channels) {
    let symbol_enum = [ "L", "R", "C", "LFE", "Ls", "Rs", "Lss", "Rss", "Lrs", "Rrs", "Lc", "Rc", "Cs", "HI", "VIN", "M1", "M2", "Lt", "Rt", "Lst", "Rst", "S" ]

    if (arguments == 0 || channels == null || channels == undefined) {
      if (this.format == "urn:x-nmos:format:audio") {
        throw("params.channels required to generate Source of type urn:x-nmos:format:audio")
      } else {
        return null
      }
    } else {
      var a = []

      _.each(channels, (ch) => {
        var channel = {}
        if (typeof ch != 'object') {
          throw("Provided channel is not a valid object. Cannot create source")
        }

        channel.label = ch.label

        if (ch.symbol.slice(0,3) == "NSC") {
          if (ch.symbol.match(/NSC(0[0-9]{2}|1[0-1]{1}[0-9]{1}|12[0-7]{1})/g)) {
            channel.symbol = ch.symbol
          } else { throw("Channel symbol is not of approved type") }
        } else if (ch.symbol.slice(0,1) == "U") {
          if (ch.symbol.match(/U(0[1-9]{1}|[1-5]{1}[0-9]{1}|6[0-4]{1})/g)) {
            channel.symbol = ch.symbol
          } else { throw("Channel symbol is not of approved type") }
        } else if (_.indexOf(symbol_enum, ch.symbol) != -1) {
          return channel.symbol = ch.symbol
        } else {
          throw("Channel symbol is not of approved type")
        }

        a.push(channel)
      })

      return a
    }
  }

  //TODO: Add validation against JSON Schema from NMOS
  valid() {
    return true
  }
}

module.exports = Source;
