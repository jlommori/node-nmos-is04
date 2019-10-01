# Model: Node

## Instantiation

```javascript
let node = new is04.Node({
  label: 'Test Node',
  description: "This is a new test node"
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
  href: string,
  services: [object],
  clocks: [object],
  interfaces: [string],
  hostname: string
}
```

Create new a new Node object.

### Parameters

All parameters are optional and will take default values if not provided. Additional properties of the Node are generated automatically. If no ID is provided, Serial number is required to generated UUID.

Parameter | Type | Required | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Node
serial | string | | Serial number of this physical device
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Node.
desc | string | | Detailed description of the resource
caps | [object] | | Array of Capabilities (not yet defined)
tags | [string] | | Array of tags
href | string | | HTTP access href for Node's API (deprecated)
services | [object] | | Array of Services
clocks | [object] | | Array of Clocks
interfaces | [string] | | String or Array of strings to only include certain interfaces

### Return

The resulting `Node` instance will have the following properties:

Parameter | Type | Default | Description
--------- | ---- | -------- | -----------
id | string | | Globally unique UUID identifier for the Node
version | string | | String formatted PTP timestamp
label | string | | Freeform string label for the Node.
desc | string | | Detailed description of the resource
caps | [object] | [] | Array of Capabilities (not yet defined)
tags | [string] | [] | Array of tags
href | string | | HTTP access href for Node's API (deprecated)
hostname | string | | Hostname for Node's API (deprecated)
services | [object] | [] | Array of Services
clocks | [object] | [] | Array of Clocks
interfaces | [string] | [] | String or Array of strings to only include certain interfaces

## valid()

Returns `true` if current Device is validated against the JSON Schema provided by NMOS IS-04. Not yet implemented.
