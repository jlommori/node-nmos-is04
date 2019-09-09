# Model: Sender

## Instantiation

```javascript
let device = new is04.Sender({
  label: 'Video Sender',
  flow_id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
  transport: 'urn:x-nmos:transport:rtp.mcast',
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  interface_bindings: ["en0"]
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
  flow_id: string,
  device_id: string,
  transport: string,
  manifest_href: string,
  interface_bindings: [string],
  subscription: object
}
```

Create new a new Sender object.

### Parameters

`flow_id`, `device_id` & `interface_bindings` are required, all other parameters are optional. Optional properties will be generated automatically if not provided.

Parameter | Type | Required | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Sender
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Sender.
desc | string | | Detailed description of the resource
caps | [object] | | Array of Capabilities (not yet defined)
tags | [string] | | Array of tags
flow_id | string | required | UUID of the Flow currently passing via this Sender
device_id | string | required | UUID of Device which this Sender forms part of. This attribute is used to ensure referential integrity by registry implementations
transport | string | required | Transport type used by the Sender in URN Format
manifest_href | string | | HTTP URL to a file describing how to connect to the Sender (SDP for RTP). The Sender's 'version' attribute should be updated if the contents of this file are modified. This URL may return an HTTP 404 where the 'active' parameter in the 'subscription' object is present and set to false (v1.2+ only).
interface_bindings | [string] | required | Binding of Sender egress ports to interfaces on the parent Node. Should contain a single network interface unless a redundancy mechanism such as ST.2022-7 is in use, in which case each 'leg' should have its matching interface listed. Where the redundancy mechanism sends more than one copy of the stream via the same interface, that interface should be listed a corresponding number of times.
subscription | object | | Object containing the 'receiver_id' currently subscribed to (unicast only). Receiver_id should be null on initialization, or when connected to a non-NMOS unicast Receiver.

### Return

The resulting `Sender` instance will have the following properties:

Parameter | Type | Default | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Sender
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Sender.
desc | string | | Detailed description of the resource
caps | [object] | | Array of Capabilities (not yet defined)
tags | [string] | | Array of tags
flow_id | string | | UUID of the Flow currently passing via this Sender
device_id | string |  | UUID of Device which this Sender forms part of. This attribute is used to ensure referential integrity by registry implementations
transport | string | | Transport type used by the Sender in URN Format
manifest_href | string | | HTTP URL to a file describing how to connect to the Sender (SDP for RTP). The Sender's 'version' attribute should be updated if the contents of this file are modified. This URL may return an HTTP 404 where the 'active' parameter in the 'subscription' object is present and set to false (v1.2+ only).
interface_bindings | [string] |  | Binding of Sender egress ports to interfaces on the parent Node. Should contain a single network interface unless a redundancy mechanism such as ST.2022-7 is in use, in which case each 'leg' should have its matching interface listed. Where the redundancy mechanism sends more than one copy of the stream via the same interface, that interface should be listed a corresponding number of times.
subscription | object | `{ receiver_id: null, active: false }` | Object containing the 'receiver_id' currently subscribed to (unicast only). Receiver_id should be null on initialization, or when connected to a non-NMOS unicast Receiver.

## valid()

Returns `true` if current Sender is validated against the JSON Schema provided by NMOS IS-04. Not yet implemented.
