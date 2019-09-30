# Model: Receiver

## Instantiation

```javascript
let device = new is04.Receiver({
  label: 'Receiver 1',
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  transport: 'urn:x-nmos:transport:rtp.mcast',
  interface_bindings: ["en0"],
  receiver_type: "video",
  caps: ["video/raw"]
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
  transport: string,
  interface_bindings: [string],
  subscription: object
}
```

Create new a new Receiver object.

### Parameters

`device_id`, `transport`, `interface_bindings`, `receiver_type` and `caps` are required, all other parameters are optional. Optional properties will be generated automatically if not provided.

Parameter | Type | Required | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Receiver
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Receiver.
desc | string | | Detailed description of the resource
caps | [object] | required | Array of Capabilities (not yet defined)
tags | [string] | | Array of tags
device_id | string | required | UUID of Device which this Receiver forms part of. This attribute is used to ensure referential integrity by registry implementations
receiver_type | string | required | Type of receiver
transport | string | required | Transport type used by the Receiver in URN Format
interface_bindings | [string] | required | Binding of Receiver ingress ports to interfaces on the parent Node. Should contain a single network interface unless a redundancy mechanism such as ST.2022-7 is in use, in which case each 'leg' should have its matching interface listed. Where the redundancy mechanism sends more than one copy of the stream via the same interface, that interface should be listed a corresponding number of times.
subscription | object | | Object containing the 'sender_id' currently subscribed to. Sender_id should be null on initialisation, or when connected to a non-NMOS Sender.

### Return

The resulting `Receiver` instance will have the following properties:

Parameter | Type | Default | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Receiver
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Receiver.
desc | string | | Detailed description of the resource
caps | [object] | | Array of Capabilities (not yet defined)
tags | [string] | | Array of tags
flow_id | string | | UUID of the Flow currently passing via this Sender
device_id | string |  | UUID of Device which this Sender forms part of. This attribute is used to ensure referential integrity by registry implementations
transport | string | | Transport type used by the Sender in URN Format
manifest_href | string | | HTTP URL to a file describing how to connect to the Sender (SDP for RTP). The Sender's 'version' attribute should be updated if the contents of this file are modified. This URL may return an HTTP 404 where the 'active' parameter in the 'subscription' object is present and set to false (v1.2+ only).
interface_bindings | [string] |  | Binding of Sender egress ports to interfaces on the parent Node. Should contain a single network interface unless a redundancy mechanism such as ST.2022-7 is in use, in which case each 'leg' should have its matching interface listed. Where the redundancy mechanism sends more than one copy of the stream via the same interface, that interface should be listed a corresponding number of times.
subscription | object | `{ sender_id: null, active: false }` | Object containing the 'sender_id' currently subscribed to. Sender_id should be null on initialisation, or when connected to a non-NMOS Sender.

## valid()

Returns `true` if current Receiver is validated against the JSON Schema provided by NMOS IS-04. Not yet implemented.
