# Model: Source

## Instantiation

```javascript
let source = new is04.Source({
  label: "Source 1",
  description: "This is the first source",
  device_id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
  format: "urn:x-nmos:format:video"
})
```

> Returns the following object

```javascript
{
  id: string,
  version: string,
  label: string,
  description: string,
  caps: [object],
  tags: [string],
  device_id: string,
  parents: [string],
  clock_name: object,
  grain_rate: object,
  format: string,
  channels: [object]
}
```

Create new a new Source object.

### Parameters

`device_id` and `format` are required, all other parameters are optional. All properties will be generated automatically if not provided.

Parameter | Type | Required | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Source
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Source.
desc | string | | Detailed description of the resource
caps | [object] | | Array of Capabilities (not yet defined)
tags | [string] | | Array of tags
device_id | string | required | UUID for the Device which initially created the Source. This attribute is used to ensure referential integrity by registry implementations.
format | string | required | Source Format
parents | [string] | | Array of UUIDs representing the Source IDs of Grains which came together at the input to this Source (may change over the lifetime of this Source)
clock_name | string | | Reference to clock in the originating Node
grain_rate | object | | Maximum number of Grains per second for Flows derived from this Source.Corresponding Flow Grain rates may override this attribute. Grain rate matches the frame rate for video (see NMOS Content Model). Specified for periodic Sources only
grain_rate.numerator | number | | Grain Rate Numerator
grain_rate.denominator | number | | Grain Rate Denominator
channels | [object] | | Array of audio channels objects
channels.label | string | | Label for an audio channel (free text)
channels.symbol | string | | Symbol for this channel (per VSF TR-03 Appendix A)

### Return

The resulting `Source` instance will have the following properties:

Parameter | Type | Default | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Source
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Source.
desc | string | | Detailed description of the resource
caps | [object] | [] | Array of Capabilities (not yet defined)
tags | [string] | [] | Array of tags
device_id | string | | UUID for the Device which initially created the Source. This attribute is used to ensure referential integrity by registry implementations.
format | string | | Source Format
parents | [string] | [] | Array of UUIDs representing the Source IDs of Grains which came together at the input to this Source (may change over the lifetime of this Source)
clock_name | string | null | Reference to clock in the originating Node
grain_rate | object | null | Maximum number of Grains per second for Flows derived from this Source.Corresponding Flow Grain rates may override this attribute. Grain rate matches the frame rate for video (see NMOS Content Model). Specified for periodic Sources only
grain_rate.numerator | number | | Grain Rate Numerator
grain_rate.denominator | number | | Grain Rate Denominator
channels | [object] | null | Array of audio channels objects
channels.label | string | | Label for an audio channel (free text)
channels.symbol | string | | Symbol for this channel (per VSF TR-03 Appendix A)

## valid()

Returns `true` if current Source is validated against the JSON Schema provided by NMOS IS-04. Not yet implemented.
