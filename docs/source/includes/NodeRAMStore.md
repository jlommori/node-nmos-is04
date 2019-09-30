# NodeRAMStore

## Instantiation

```javascript
const is04 = require('node-nmos-is04');

let store = new is04.NodeRAMStore();

```

Create a RAM-based Store for a Node or Registration Server.

## getResources()

```javascript
store.getResources()
```

Get all Resources currently available in the store.

### Return

> Example return

```javascript
  {
    self: Node {
       id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
       version: '1567947806:124643978',
       label: 'Test Node',
       description: '',
       caps: {},
       tags: [ 'tesing', 'node' ],
       href: '',
       api: { versions: [Array], endpoints: [Array] },
       services: [],
       clocks: [],
       interfaces: { en0: [Array], en6: [Array] },
       hostname: '' },
    nodes:
      { '9cc73ed0-d601-4efe-b974-949de6ae584d':
         Node {
           id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
           version: '1567947806:124643978',
           label: 'Test Node',
           description: '',
           caps: {},
           tags: [Array],
           href: '',
           api: [Object],
           services: [],
           clocks: [],
           interfaces: [Object],
           hostname: '' } },
     devices:
      { 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77':
         Device {
           id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
           version: '1567947806:133492956',
           label: 'Device 1',
           description: '',
           caps: {},
           tags: [],
           type: 'urn:x-nmos:device:pipeline',
           node_id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
           senders: [],
           receivers: [],
           controls: [] } },
     sources:
      { 'ed5ef4b3-6740-4db3-95f5-c907dd84916d':
         Source {
           id: 'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
           version: '1567947806:134232449',
           label: 'Source 1',
           description: '',
           caps: {},
           tags: [],
           device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
           parents: [],
           clock_name: null,
           grain_rate: null,
           format: 'urn:x-nmos:format:video',
           channels: null }
      },
     flows:
      { '44d55a36-b553-42cc-bff1-e451df0e40c1':
         Flow {
           id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
           version: '1567947806:135367354',
           label: 'Video Flow',
           description: '',
           caps: {},
           tags: [],
           grain_rate: null,
           source_id: 'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
           device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
           parents: [],
           format: 'urn:x-nmos:format:video',
           frame_width: 1920,
           frame_height: 1080,
           interlace_mode: 'interlaced_tff',
           colorspace: 'BT709',
           transfer_characteristics: 'SDR',
           media_type: null,
           components: null }
        },
     senders:
      { '3620614c-929f-4fec-b59d-74763c397ece':
         Sender {
           id: '3620614c-929f-4fec-b59d-74763c397ece',
           version: '1567947806:136110405',
           label: 'Video Sender',
           description: '',
           caps: {},
           tags: [],
           flow_id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
           transport: 'urn:x-nmos:transport:rtp.mcast',
           device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
           manfiest_href: null,
           interface_bindings: [Array],
           subscription: [Object] }
        },
     receivers:
      { 'a8f61658-47ad-4212-ab5a-8a659e500ab9':
         Receiver {
           id: 'a8f61658-47ad-4212-ab5a-8a659e500ab9',
           version: '1567947806:136616679',
           label: 'Receiver 1',
           description: '',
           caps: [Array],
           tags: [],
           device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
           transport: 'urn:x-nmos:transport:rtp.mcast',
           interface_bindings: [Array],
           format: 'urn:x-nmos:format:video',
           subscription: [Object] }
         }
  }
```

Parameter | Type |  Description
--------- | ---- | -----------
self | object | Node information when store is used for a Node, not Registration Server
nodes | object | All Nodes in the store
devices | object | All Devices in the store
sources | object | All Sources in the store
flows | object | All Flows in the store
senders | object | All Senders in the store
receivers | object | All Receivers in the store

## getResourceIDs()

```javascript
store.getResourceIDs()
```

Get all IDs of all Resources currently available in the store.

### Return

> Example return

```javascript
{ self: '3377bbba-a2a8-4b8c-b428-6d45bb60aad7',
nodes: [ '3377bbba-a2a8-4b8c-b428-6d45bb60aad7' ],
devices: [ '4a776a15-93ec-4953-9f86-288929ff33f2' ],
sources:
 [ '080fe271-ecce-4bf4-a5ca-e25f1b3b3bcf',
   'b3506a57-e9c6-4d33-9f3d-74ea951d68e0' ],
flows:
 [ '626b631a-b7fb-4f03-bf20-97fb196eadb0',
   '6e0cfe6c-855a-4f97-aa0d-fc9ef5c0473a' ],
senders:
 [ '646f3a74-50da-4f87-85d0-19b380bba2b7',
   'a0ab0c81-f917-49ff-bd85-ad48489231e9' ],
receivers:
 [ '0c442fd0-f31d-4a0e-a495-a6ed0beb1c96',
   'c7909c21-bd7d-4318-9913-bba6c3cb9f66' ] }
```

Parameter | Type |  Description
--------- | ---- | -----------
self | object | Node information when store is used for a Node, not Registration Server
nodes | array | All Node IDs in the store
devices | array | All Device IDs in the store
sources | array | All Sources IDs in the store
flows | array | All Flow IDs in the store
senders | array | All Sender IDs in the store
receivers | array | All Receiver IDs in the store

## getResourceCounts()

```javascript
store.getResourceCounts()
```

Get counts of objects currently in the store

### Return

> Example return

```javascript
{ self: 1,
  nodes: 1,
  devices: 1,
  sources: 2,
  flows: 2,
  senders: 2,
  receivers: 2 }
```

Parameter | Type |  Description
--------- | ---- | -----------
self | number | 1 if store used as Node, 0 if Registration Server
nodes | number | Count of Nodes
devices | number | Count of Devices
sources | number | Count of Sources
flows | number | Count of Flows
senders | number | Count of Senders
receivers | number | Count of Receivers

## getSelf()

```javascript
store.getSelf()
```

Get the currently stored Node as Self, when store is used as Node, not Registration Server

### Return

> Example return

```javascript
Node {
   id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
   version: '1567947806:124643978',
   label: 'Test Node',
   description: '',
   caps: {},
   tags: [ 'tesing', 'node' ],
   href: '',
   api: { versions: [Array], endpoints: [Array] },
   services: [],
   clocks: [],
   interfaces: { en0: [Array], en6: [Array] },
   hostname: '' }
```

See [Node](#model-node) Model

## setSelf()

```javascript
store.setSelf(new is04.Node({
  label: "Test Node",
  description: "This is a test node",
  tags: ["tesing", "node"],
  interfaces: ["en0"]
}))
```

Set the Node for `self`, when used for a Node server, not Registration Server

### Parameters

See [Node](#model-node) model

### Return

> Example return

```javascript
Node {
   id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
   version: '1567947806:124643978',
   label: 'Test Node',
   description: '',
   caps: {},
   tags: [ 'tesing', 'node' ],
   href: '',
   api: { versions: [Array], endpoints: [Array] },
   services: [],
   clocks: [],
   interfaces: { en0: [Array], en6: [Array] },
   hostname: '' }
```

Returns same `node` that was set. See [Node](#model-node) Model.

## putNode()

```javascript
store.putNode(new is04.Node({
  label: "Test Node",
  description: "This is a test node",
  tags: ["tesing", "node"],
  interfaces: ["en0"]
}))
```

Put a `node` in the `nodes` store

### Parameters

See [Node](#model-node) model

### Return

> Example return

```javascript
Node {
   id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
   version: '1567947806:124643978',
   label: 'Test Node',
   description: '',
   caps: {},
   tags: [ 'tesing', 'node' ],
   href: '',
   api: { versions: [Array], endpoints: [Array] },
   services: [],
   clocks: [],
   interfaces: { en0: [Array], en6: [Array] },
   hostname: '' }
```

Returns same `node` that was put. See [Node](#model-node) Model.

## getNodes()

```javascript
store.getNodes()

store.getNodes([
  '9cc73ed0-d601-4efe-b974-949de6ae584d',
  'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
  'd00f73c6-7a27-4dc2-a4ad-1c375648bc77'
])

store.getNodes('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one or more Nodes from the store.

### Parameters

`getNodes()` accepts either a string or array of strings to return specific Nodes. If no parameter provided, returns all nodes on the store.

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Node to return
 | |
uuid | [string] | Array of UUIDs to return

### Return

>Example Return

```javascript
[
  {
     id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
     version: '1567947806:124643978',
     label: 'Test Node',
     description: '',
     caps: {},
     tags: [ 'tesing', 'node' ],
     href: '',
     api: { versions: [Array], endpoints: [Array] },
     services: [],
     clocks: [],
     interfaces: { en0: [Array], en6: [Array] },
     hostname: ''
   },
   { ... }
]
```

Returns an array of Nodes. See [Node](#model-node) model

## getNode()

```javascript
store.getNode('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one Node from the store.

### Parameters

Requires UUID to return

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Node to return

### Return

>Example Return

```javascript
{
   id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
   version: '1567947806:124643978',
   label: 'Test Node',
   description: '',
   caps: {},
   tags: [ 'tesing', 'node' ],
   href: '',
   api: { versions: [Array], endpoints: [Array] },
   services: [],
   clocks: [],
   interfaces: { en0: [Array], en6: [Array] },
   hostname: ''
 }
```

Returns a single Node. See [Node](#model-node) model

## deleteNode()

```javascript
store.deleteNode('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Delete a Node from the store

### Parameters

Requires UUID to delete

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Node to delete

### Return

>Example Return

```javascript
'9cc73ed0-d601-4efe-b974-949de6ae584d'
```

Returns ID of the deleted Node as a String

## putDevice()

```javascript
store.putDevice(new is04.Device({
  node_id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
  label: "Device 1",
  description: "A multifaceted device"
}))
```

Put a `device` in the `devices` store

### Parameters

See [Device](#model-device) model

### Return

> Example return

```javascript
Device {
  id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  version: '1567947806:133492956',
  label: 'Device 1',
  description: '',
  caps: {},
  tags: [],
  type: 'urn:x-nmos:device:pipeline',
  node_id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
  senders: [],
  receivers: [],
  controls: [] }
```

Returns same `device` that was put. See [Device](#model-device) Model.

## getDevices()

```javascript
store.getDevices()

store.getDevices([
  '9cc73ed0-d601-4efe-b974-949de6ae584d',
  'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
  'd00f73c6-7a27-4dc2-a4ad-1c375648bc77'
])

store.getDevices('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one or more Devices from the store.

### Parameters

`getDevices()` accepts either a string or array of strings to return specific Devices. If no parameter provided, returns all devices on the store.

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Device to return
 | |
uuid | [string] | Array of UUIDs to return

### Return

>Example Return

```javascript
[
  {
    id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
    version: '1567947806:133492956',
    label: 'Device 1',
    description: '',
    caps: {},
    tags: [],
    type: 'urn:x-nmos:device:pipeline',
    node_id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
    senders: [],
    receivers: [],
    controls: []
  },
  { ... }
]
```

Returns an array of Devices. See [Device](#model-device) model

## getDevice()

```javascript
store.getDevice('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one Device from the store.

### Parameters

Requires UUID to return

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Device to return

### Return

>Example Return

```javascript
{
  id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  version: '1567947806:133492956',
  label: 'Device 1',
  description: '',
  caps: {},
  tags: [],
  type: 'urn:x-nmos:device:pipeline',
  node_id: '9cc73ed0-d601-4efe-b974-949de6ae584d',
  senders: [],
  receivers: [],
  controls: []
}
```

Returns a single Device. See [Device](#model-device) model

## deleteDevice()

```javascript
store.deleteDevice('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Delete a Device from the store

### Parameters

Requires UUID to delete

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Device to delete

### Return

>Example Return

```javascript
'9cc73ed0-d601-4efe-b974-949de6ae584d'
```

Returns ID of the deleted Device as a String

## putSource()

```javascript
store.putSource(new is04.Source({
  label: "Source 1",
  description: "This is the first source",
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  format: "urn:x-nmos:format:video"
}))
```

Put a `source` in the `sources` store

### Parameters

See [Source](#model-source) model

### Return

> Example return

```javascript
Sender {
  id: '3620614c-929f-4fec-b59d-74763c397ece',
  version: '1567947806:136110405',
  label: 'Video Sender',
  description: '',
  caps: {},
  tags: [],
  flow_id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
  transport: 'urn:x-nmos:transport:rtp.mcast',
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  manfiest_href: null,
  interface_bindings: [Array],
  subscription: [Object] }
```

Returns same `source` that was put. See [Source](#model-source) Model.

## getSources()

```javascript
store.getSources()

store.getSources([
  '9cc73ed0-d601-4efe-b974-949de6ae584d',
  'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
  'd00f73c6-7a27-4dc2-a4ad-1c375648bc77'
])

store.getSources('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one or more Sources from the store.

### Parameters

`getSources()` accepts either a string or array of strings to return specific Sources. If no parameter provided, returns all sources on the store.

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Source to return
 | |
uuid | [string] | Array of UUIDs to return

### Return

>Example Return

```javascript
[
  {
    id: '3620614c-929f-4fec-b59d-74763c397ece',
    version: '1567947806:136110405',
    label: 'Video Sender',
    description: '',
    caps: {},
    tags: [],
    flow_id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
    transport: 'urn:x-nmos:transport:rtp.mcast',
    device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
    manfiest_href: null,
    interface_bindings: [Array],
    subscription: [Object]
  },
  { ... }
]
```

Returns an array of Sources. See [Source](#model-source) model

## getSource()

```javascript
store.getSource('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one Source from the store.

### Parameters

Requires UUID to return

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Source to return

### Return

>Example Return

```javascript
{
  id: '3620614c-929f-4fec-b59d-74763c397ece',
  version: '1567947806:136110405',
  label: 'Video Sender',
  description: '',
  caps: {},
  tags: [],
  flow_id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
  transport: 'urn:x-nmos:transport:rtp.mcast',
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  manfiest_href: null,
  interface_bindings: [Array],
  subscription: [Object]
}
```

Returns a single Source. See [Source](#model-source) model

## deleteSource()

```javascript
store.deleteSource('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Delete a Source from the store

### Parameters

Requires UUID to delete

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Source to delete

### Return

>Example Return

```javascript
'9cc73ed0-d601-4efe-b974-949de6ae584d'
```

Returns ID of the deleted Source as a String

## putFlow()

```javascript
store.putFlow(new is04.Flow({
  label: 'Video Flow',
  description: "This is the first Video flow",
  source_id: 'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
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

Put a `flow` in the `flows` store

### Parameters

See [Flow](#model-flow) model

### Return

> Example return

```javascript
Flow {
  id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
  version: '1567947806:135367354',
  label: 'Video Flow',
  description: '',
  caps: {},
  tags: [],
  grain_rate: null,
  source_id: 'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  parents: [],
  format: 'urn:x-nmos:format:video',
  frame_width: 1920,
  frame_height: 1080,
  interlace_mode: 'interlaced_tff',
  colorspace: 'BT709',
  transfer_characteristics: 'SDR',
  media_type: null,
  components: null }
```

Returns same `flow` that was put. See [Flow](#model-flow) Model.

## getFlows()

```javascript
store.getFlows()

store.getFlows([
  '9cc73ed0-d601-4efe-b974-949de6ae584d',
  'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
  'd00f73c6-7a27-4dc2-a4ad-1c375648bc77'
])

store.getFlows('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one or more Flows from the store.

### Parameters

`getFlows()` accepts either a string or array of strings to return specific Flows. If no parameter provided, returns all flows on the store.

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Flow to return
 | |
uuid | [string] | Array of UUIDs to return

### Return

>Example Return

```javascript
[
  {
    id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
    version: '1567947806:135367354',
    label: 'Video Flow',
    description: '',
    caps: {},
    tags: [],
    grain_rate: null,
    source_id: 'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
    device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
    parents: [],
    format: 'urn:x-nmos:format:video',
    frame_width: 1920,
    frame_height: 1080,
    interlace_mode: 'interlaced_tff',
    colorspace: 'BT709',
    transfer_characteristics: 'SDR',
    media_type: null,
    components: null
  },
  { ... }
]
```

Returns an array of Flows. See [Flow](#model-flow) model

## getFlow()

```javascript
store.getFlow('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one Flow from the store.

### Parameters

Requires UUID to return

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Flow to return

### Return

>Example Return

```javascript
{
  id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
  version: '1567947806:135367354',
  label: 'Video Flow',
  description: '',
  caps: {},
  tags: [],
  grain_rate: null,
  source_id: 'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  parents: [],
  format: 'urn:x-nmos:format:video',
  frame_width: 1920,
  frame_height: 1080,
  interlace_mode: 'interlaced_tff',
  colorspace: 'BT709',
  transfer_characteristics: 'SDR',
  media_type: null,
  components: null
}
```

Returns a single Flow. See [Flow](#model-flow) model

## deleteFlow()

```javascript
store.deleteFlow('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Delete a Flow from the store

### Parameters

Requires UUID to delete

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Flow to delete

### Return

>Example Return

```javascript
'9cc73ed0-d601-4efe-b974-949de6ae584d'
```

Returns ID of the deleted Flow as a String

## putSender()

```javascript
store.putFlow(new is04.Sender({
  label: 'Audio Sender',
  flow_id: "44d55a36-b553-42cc-bff1-e451df0e40c1",
  transport: 'urn:x-nmos:transport:rtp.mcast',
  device_id: "9cc73ed0-d601-4efe-b974-949de6ae584d",
  interface_bindings: ["en0"]
}))
```

Put a `sender` in the `senders` store

### Parameters

See [Sender](#model-sender) model

### Return

> Example return

```javascript
Sender {
  id: '3620614c-929f-4fec-b59d-74763c397ece',
  version: '1567947806:136110405',
  label: 'Video Sender',
  description: '',
  caps: {},
  tags: [],
  flow_id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
  transport: 'urn:x-nmos:transport:rtp.mcast',
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  manfiest_href: null,
  interface_bindings: [Array],
  subscription: [Object] }
```

Returns same `sender` that was put. See [Sender](#model-sender) Model.

## getSenders()

```javascript
store.getSenders()

store.getSenders([
  '9cc73ed0-d601-4efe-b974-949de6ae584d',
  'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
  'd00f73c6-7a27-4dc2-a4ad-1c375648bc77'
])

store.getSenders('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one or more Senders from the store.

### Parameters

`getSenders()` accepts either a string or array of strings to return specific Senders. If no parameter provided, returns all senders on the store.

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Sender to return
 | |
uuid | [string] | Array of UUIDs to return

### Return

>Example Return

```javascript
[
  {
    id: '3620614c-929f-4fec-b59d-74763c397ece',
    version: '1567947806:136110405',
    label: 'Video Sender',
    description: '',
    caps: {},
    tags: [],
    flow_id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
    transport: 'urn:x-nmos:transport:rtp.mcast',
    device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
    manfiest_href: null,
    interface_bindings: [Array],
    subscription: [Object]
  },
  { ... }
]
```

Returns an array of Senders. See [Sender](#model-sender) model

## getSender()

```javascript
store.getSender('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one Sender from the store.

### Parameters

Requires UUID to return

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Sender to return

### Return

>Example Return

```javascript
{
  id: '3620614c-929f-4fec-b59d-74763c397ece',
  version: '1567947806:136110405',
  label: 'Video Sender',
  description: '',
  caps: {},
  tags: [],
  flow_id: '44d55a36-b553-42cc-bff1-e451df0e40c1',
  transport: 'urn:x-nmos:transport:rtp.mcast',
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  manfiest_href: null,
  interface_bindings: [Array],
  subscription: [Object] }
```

Returns a single Sender. See [Sender](#model-sender) model

## deleteSender()

```javascript
store.deleteSender('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Delete a Sender from the store

### Parameters

Requires UUID to delete

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Sender to delete

### Return

>Example Return

```javascript
'9cc73ed0-d601-4efe-b974-949de6ae584d'
```

Returns ID of the deleted Sender as a String

## putReceiver()

```javascript
store.putReceiver(new is04.Receiver({
  label: 'Receiver 1',
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  transport: 'urn:x-nmos:transport:rtp.mcast',
  interface_bindings: ["en0"],
  receiver_type: "video",
  caps: ["video/raw"]
}))
```

Put a `receiver` in the `receivers` store

### Parameters

See [Receiver](#model-receiver) model

### Return

> Example return

```javascript
Receiver {
  id: 'a8f61658-47ad-4212-ab5a-8a659e500ab9',
  version: '1567947806:136616679',
  label: 'Receiver 1',
  description: '',
  caps: [Array],
  tags: [],
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  transport: 'urn:x-nmos:transport:rtp.mcast',
  interface_bindings: [Array],
  format: 'urn:x-nmos:format:video',
  subscription: [Object] }
}
```

Returns same `receiver` that was put. See [Receiver](#model-receiver) Model.

## getReceivers()

```javascript
store.getReceivers()

store.getReceivers([
  '9cc73ed0-d601-4efe-b974-949de6ae584d',
  'ed5ef4b3-6740-4db3-95f5-c907dd84916d',
  'd00f73c6-7a27-4dc2-a4ad-1c375648bc77'
])

store.getReceivers('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one or more Receivers from the store.

### Parameters

`getReceivers()` accepts either a string or array of strings to return specific Receivers. If no parameter provided, returns all receivers on the store.

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Receiver to return
 | |
uuid | [string] | Array of UUIDs to return

### Return

>Example Return

```javascript
[
  {
    id: 'a8f61658-47ad-4212-ab5a-8a659e500ab9',
    version: '1567947806:136616679',
    label: 'Receiver 1',
    description: '',
    caps: [Array],
    tags: [],
    device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
    transport: 'urn:x-nmos:transport:rtp.mcast',
    interface_bindings: [Array],
    format: 'urn:x-nmos:format:video',
    subscription: [Object]
  },
  { ... }
]
```

Returns an array of Receivers. See [Receiver](#model-receiver) model

## getReceiver()

```javascript
store.getReceiver('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Get one Receiver from the store.

### Parameters

Requires UUID to return

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Receiver to return

### Return

>Example Return

```javascript
{
  id: 'a8f61658-47ad-4212-ab5a-8a659e500ab9',
  version: '1567947806:136616679',
  label: 'Receiver 1',
  description: '',
  caps: [Array],
  tags: [],
  device_id: 'd00f73c6-7a27-4dc2-a4ad-1c375648bc77',
  transport: 'urn:x-nmos:transport:rtp.mcast',
  interface_bindings: [Array],
  format: 'urn:x-nmos:format:video',
  subscription: [Object]
}
```

Returns a single Receiver. See [Receiver](#model-receiver) model

## deleteReceiver()

```javascript
store.deleteReceiver('9cc73ed0-d601-4efe-b974-949de6ae584d')
```

Delete a Receiver from the store

### Parameters

Requires UUID to delete

Parameter | Type |  Description
--------- | ---- | -----------
uuid | string | UUID of a single Receiver to delete

### Return

>Example Return

```javascript
'9cc73ed0-d601-4efe-b974-949de6ae584d'
```

Returns ID of the deleted Receiver as a String
