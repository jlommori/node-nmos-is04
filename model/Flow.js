// /* Copyright 2016 Streampunk Media Ltd.
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
// */
//
// var Versionned = require('./Versionned.js');
// var immutable = require('seamless-immutable');
//
const Resource = require('./Resource.js')
const _ = require('lodash')

class Flow extends Resource {
  constructor(params) {
    if (params == undefined) { throw("Flow requires parameters to be created ")}
    if (params.flow_type == undefined && !params.format) { throw("Flow requires a flow_type or format to be defined ")}

    super({
      id: params.id,
      version: params.version,
      label: params.label,
      description: params.description,
      caps: params.caps,
      tags: params.tags
    })

    this.grain_rate = this.constructor.generateGrainRate(params.grain_rate)
    this.source_id = this.constructor.generateSourceID(params.source_id)
    this.device_id = this.constructor.generateDeviceID(params.device_id)
    this.parents = this.constructor.generateParents(params.parents)

    if (params.flow_type == "audio" || params.flow_type == "audio_coded" || params.flow_type == "audio_raw" || params.format == "urn:x-nmos:format:audio") {
      this.format = "urn:x-nmos:format:audio"
      this.sample_rate = this.constructor.generateAudioSampleRate(params.sample_rate)
      this.media_type = this.constructor.generateAudioMediaType(params.media_type)
      this.bit_depth = this.constructor.generateAudioBitDepth(params.bit_depth)
    }

    if (params.flow_type == "video" || params.flow_type == "video_coded" || params.flow_type == "video_raw" || params.format == "urn:x-nmos:format:video") {
      this.format = "urn:x-nmos:format:video"
      this.frame_width = this.constructor.generateVideoFrameWidth(params.frame_width)
      this.frame_height = this.constructor.generateVideoFrameHeight(params.frame_height)
      this.interlace_mode = this.constructor.generateVideoInterlaceMode(params.interlace_mode)
      this.colorspace = this.constructor.generateVideoColorspace(params.colorspace)
      this.transfer_characteristics = this.constructor.generateVideoTransferCharacteristics(params.transfer_characteristics)
      this.media_type = this.constructor.generateVideoMediaType(params.media_type)
      this.components = this.constructor.generateVideoComponents(params.components)
    }

    if (params.flow_type == "data" || params.flow_type == "sdianc_data" || params.format == "urn:x-nmos:format:data") {
      this.format = "urn:x-nmos:format:data"
      this.media_type = this.constructor.generateDataMediaType(params.media_type)
      this.did_sdid = this.constructor.generateDataDID_SDID(params.did_sdid)
    }

    if (params.flow_type == "mux" || params.format == "urn:x-nmos:format:mux") {
      this.format = "urn:x-nmos:format:mux"
      this.media_type = this.constructor.generateMuxMediaType(params.media_type)
    }

  }

  static generateGrainRate(grain_rate) {
    if (arguments == 0 || grain_rate == null || grain_rate == undefined) {
      return null
    } else {
      return grain_rate
    }
  }

  static generateSourceID(source_id) {
    if (arguments === 0 || source_id == null || source_id == undefined) {
      throw('params.source_id required to create Flow')
    }

    if (source_id.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g)) {
      return source_id
    } else {
      throw("Invalid UUID provided for Source ID")
    }
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

  static generateAudioSampleRate(sample_rate) {
    var s = {}
    if (arguments == 0 || sample_rate == null || sample_rate == undefined) {
      throw("Audio sample rate (in samples per second) required to create audio flow")
    } else {
      if (typeof sample_rate == "object") {
        s.numerator = sample_rate.numerator
        if (sample_rate.denominator) { s.denominator = sample_rate.denominator }
        else { s.denominator = 1 }
        return s
      } else if (typeof sample_rate == "number") {
        s.numerator = sample_rate
        s.denominator = 1
        return s
      } else {
        throw('Provided sample_rate not valid')
      }
    }
  }

  static generateAudioMediaType(media_type) {
    if (arguments == 0 || media_type == null || media_type == undefined) {
      return null
    } else {
      return media_type
    }
  }

  static generateAudioBitDepth(bit_depth) {
    if (arguments == 0 || bit_depth == null || bit_depth == undefined) {
      return null
    } else {
      return bit_depth
    }
  }

  static generateVideoFrameWidth(frame_width) {
    if (arguments == 0 || frame_width == null || frame_width == undefined) {
      throw("Video Frame Width required to create video flow")
    } else {
      return frame_width
    }
  }

  static generateVideoFrameHeight(frame_height) {
    if (arguments == 0 || frame_height == null || frame_height == undefined) {
      throw("Video Frame Height required to create video flow")
    } else {
      return frame_height
    }
  }

  static generateVideoInterlaceMode(interlace_mode) {
    if (arguments == 0 || interlace_mode == null || interlace_mode == undefined) {
      return "progressive"
    } else {
      let mode_enum = ["progressive", "interlaced_tff", "interlaced_bff", "interlaced_psf"]

      if (_.indexOf(mode_enum, interlace_mode) != -1) {
        return interlace_mode
      } else {
        throw("Invalid Interlace Mode provided")
      }
    }
  }

  static generateVideoColorspace(colorspace) {
    if (arguments == 0 || colorspace == null || colorspace == undefined) {
      throw("Colorspace required to create video flow")
    } else {
      let color_enum = ["BT601", "BT709", "BT2020", "BT2100"]

      if (_.indexOf(color_enum, colorspace) != -1) {
        return colorspace
      } else {
        throw("Invalid Colorspace provided")
      }
    }
  }

  static generateVideoTransferCharacteristics(transfer_characteristics) {
    if (arguments == 0 || transfer_characteristics == null || transfer_characteristics == undefined) {
      return "SDR"
    } else {
      let trans_enum = ["SDR", "HLG", "PQ"]

      if (_.indexOf(trans_enum, transfer_characteristics) != -1) {
        return transfer_characteristics
      } else {
        throw("Invalid Transfer Characteristics provided")
      }
    }
  }

  static generateVideoMediaType(media_type) {
    if (arguments == 0 || media_type == null || media_type == undefined) {
      return null
    } else {
      let media_enum = [ "video/H264", "video/vc2", "video/raw" ]

      if (_.indexOf(media_enum, media_type) != -1) {
        return media_type
      } else {
        throw("Invalid Media Type provided")
      }
    }
  }

  static generateVideoComponents(components) {
    if (arguments == 0 || components == null || components == undefined) {
      return null
    } else {
      let comps = []
      _.each(components, (c) => {
        let component = {}
        if (typeof c != 'object') {
          throw("Invalid component provided")
        } else {
          let name_enum = ["Y", "Cb", "Cr", "I", "Ct", "Cp", "A", "R", "G", "B", "DepthMap"]

          if (_.indexOf(name_enum, c.name) != -1) {
            component.name = c.name
          } else {
            throw("Invalid Component Name provided")
          }

          component.width = c.width
          component.height = c.height
          component.bit_depth = c.bit_depth

          comps.push(component)
        }
      })

      return comps
    }
  }

  static generateDataMediaType(media_type) {
    if (arguments == 0 || media_type == null || media_type == undefined) {
      return null
    } else {
      return media_type
    }
  }

  static generateDataDID_SDID(did_sdid) {
    if (arguments == 0 || did_sdid == null || did_sdid == undefined) {
      return null
    } else {
      let ar = []
      _.each(did_sdid, (d) => {
        let s = {}

        if (d.did.match(/^0x[0-9a-fA-F]{2}$/g)) {
          s.did = d.did
        }

        if (d.sdid.match(/^0x[0-9a-fA-F]{2}$/g)) {
          s.sdid = d.sdid
        }

        ar.push(s)
      })
    return ar
    }
  }

  //TODO: Add validation against JSON Schema from NMOS
  valid() {
    return true
  }
}

module.exports = Flow;
