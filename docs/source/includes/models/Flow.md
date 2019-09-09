# Model: Flow

## Instantiation

```javascript
let flow = new is04.Flow({
  label: 'Video Flow',
  description: "This is the first Video flow",
  source_id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  flow_type: "video",
  video: {
    frame_width: 1920,
    frame_height: 1080,
    interlace_mode: "interlaced_tff",
    colorspace: "BT709"
  }
})
```

> Returns the following object (some properties dependent on format)

```javascript
{
  id: string,
  version: string,
  label: string,
  description: string,
  caps: [object],
  tags: [string],
  device_id: string,
  source_id: string,
  parents: [string],
  grain_rate: object,
  format: string,
  sample_rate: object,
  media_type: string,
  bit_depth: number,
  frame_width: number,
  frame_height: number,
  interlace_mode: string,
  colorspace: string,
  transfer_characteristics: string,
  media_type: string,
  components: [object],
  did_sdid: [string]
}
```

Create new a new Flow object.

### Parameters

`device_id`, `source_id` and `flow_type` are required, all other parameters are optional. All properties will be generated automatically if not provided.

Parameter | Type | Required | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Flow
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Flow.
desc | string | | Detailed description of the resource
caps | [object] | | Array of Capabilities (not yet defined)
tags | [string] | | Array of tags
flow_type | string | required | Type of flow to create
device_id | string | required | UUID for the Device which initially created the Source. This attribute is used to ensure referential integrity by registry implementations (v1.1 onward).
source_id | string | required | UUID for the Source which initially created the Flow. This attribute is used to ensure referential integrity by registry implementations (v1.0 only).
parents | [string] | | Array of UUIDs representing the Flow IDs of Grains which came together to generate this Flow (may change over the lifetime of this Flow)
grain_rate | object | | Maximum number of Grains per second for Flows derived from this Source.Corresponding Flow Grain rates may override this attribute. Grain rate matches the frame rate for video (see NMOS Content Model). Specified for periodic Sources only
grain_rate.numerator | number | | Grain Rate Numerator
grain_rate.denominator | number | | Grain Rate Denominator
sample_rate | object | | Number of Audio Samples per second for this flow (required for audio flows)
sample_rate.numerator | number | | Sample Rate Numerator
sample_rate.denominator | number | | Sample Rate Denominator
media_type | string | | Subclassification of the format using IANA assigned media types
bit_depth | number | | Bit depth of the audio samples
frame_width | number | | Width of the picture in pixels
frame_height | number | | Height of the picture in pixels
interlace_mode | string | | Interlaced video mode for the frames in this flow
colorspace | string | | Colorspace used for the video
transfer_characteristics | string | | Transfer Characteristic
components | [object] | | Array of objects describing the components
components.name | string | | Name of this component
components.width | number | | Width of this component in pixels
components.height | number | |  Height of this component in pixels
components.bit_depth | number | | Number of bits used to describe each sample
did_sdid | object | | List of Data identification and secondary data identification words
did_sdid.DID | string | | Data Identification Word
did_sdid.SDID | string | | Secondary data identification word

### Return

The resulting `Flow` instance will have the following properties:

Parameter | Type | Default | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Flow
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Flow.
desc | string | | Detailed description of the resource
caps | [object] | | Array of Capabilities (not yet defined)
tags | [string] | | Array of tags
device_id | string | | UUID for the Device which initially created the Source. This attribute is used to ensure referential integrity by registry implementations (v1.1 onward).
source_id | string | | UUID for the Source which initially created the Flow. This attribute is used to ensure referential integrity by registry implementations (v1.0 only).
parents | [string] | [] | Array of UUIDs representing the Flow IDs of Grains which came together to generate this Flow (may change over the lifetime of this Flow)
format | string | | Source Format
grain_rate | object | | Maximum number of Grains per second for Flows derived from this Source.Corresponding Flow Grain rates may override this attribute. Grain rate matches the frame rate for video (see NMOS Content Model). Specified for periodic Sources only
grain_rate.numerator | number | | Grain Rate Numerator
grain_rate.denominator | number | | Grain Rate Denominator
sample_rate | object | | Number of Audio Samples per second for this flow (required for audio flows)
sample_rate.numerator | number | | Sample Rate Numerator
sample_rate.denominator | number | | Sample Rate Denominator
media_type | string | | Subclassification of the format using IANA assigned media types
bit_depth | number | | Bit depth of the audio samples
frame_width | number | | Width of the picture in pixels
frame_height | number | | Height of the picture in pixels
interlace_mode | string | | Interlaced video mode for the frames in this flow
colorspace | string | | Colorspace used for the video
transfer_characteristics | string | | Transfer Characteristic
components | [object] | | Array of objects describing the components
components.name | string | | Name of this component
components.width | number | | Width of this component in pixels
components.height | number | |  Height of this component in pixels
components.bit_depth | number | | Number of bits used to describe each sample
did_sdid | object | | List of Data identification and secondary data identification words
did_sdid.DID | string | | Data Identification Word
did_sdid.SDID | string | | Secondary data identification word

## valid()

Returns `true` if current Flow is validated against the JSON Schema provided by NMOS IS-04. Not yet implemented.
