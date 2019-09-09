# Model: Device

## Instantiation

```javascript
let device = new is04.Device({
  node_id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
  label: "Device 1",
  description: "A multifaceted device"
})
```

> Returns the following object

```javascript
{
  node_id: string,
  id: string,
  version: string,
  label: string,
  description: string,
  caps: [object],
  tags: [string],
  type: string,
  senders: [string],
  receivers: [string],
  controls: [string]
}
```

Create new a new Device object.

### Parameters

Only a `node_id` is required, all other parameters are optional. All properties will be generated automatically if not provided.

Parameter | Type | Required | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Device
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Device.
desc | string | | Detailed description of the resource
caps | [object] | | Array of Capabilities (not yet defined)
tags | [string] | | Array of tags
node_id | string | required | UUID for the Node that created this Device
type | string | | Device Type URN
controls | [string] | | Control endpoints exposed for the Device

### Return

The resulting `Device` instance will have the following properties:

Parameter | Type | Default | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Device
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Device.
desc | string | | Detailed description of the resource
caps | [object] | [] | Array of Capabilities (not yet defined)
tags | [string] | [] | Array of tags
node_id | string | | UUID for the Node that created this Device
type | string | "urn:x-nmos:device:pipeline" | Device Type URN
senders | [string] | [] | UUIDs of Senders attached to the Device (deprecated)
receivers | [string] | [] | UUIDs of Receivers attached to the Device (deprecated)
controls | [string] | [] | Control endpoints exposed for the Device

## valid()

Returns `true` if current Device is validated against the JSON Schema provided by NMOS IS-04. Not yet implemented.
