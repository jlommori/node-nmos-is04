# NodeAPI

## Instantiation

```javascript
const is04 = require('node-nmos-is04');

let store = new is04.NodeRAMStore();
await store.setSelf(new is04.Node({
  label: "Test Node",
  description: "This is a test node",
  tags: ["testing", "node"],
  interfaces: ["en0"]
}))

let NodeAPI = new is04.NodeAPI({
  store: store
})

NodeAPI.on('registry', (cb) => {
  console.log(`${cb.status}: ${cb.message}`, cb.data)
})

NodeAPI.on('heartbeat', (cb) => {
  console.log(`${cb.status}: ${cb.message}. ${cb.data.time}`)
})
```

A NMOS-IS04 Node is created and made available on the network.

### Parameters

Parameter | Required | Default | Description
--------- | ------- | ------- | -----------
store | required | | Node Store for access to Node information
address | optional | 'localhost:3000' | Interface address and port
regAddress | optional | null | Address of a pre-defined NMOS Registration Server

### Event: 'registry'

> `registry` event may return several objects

```javascript
{
  status: 'registered',
  message: 'Node registered with Registration Server at 0.0.0.0:3000',
  data: {
    static: boolean,
    address: string,
    port: number,
    connected: boolean,
    registered: boolean,
    selectedIndex: number
  }
}

{
  status: 'error',
  message: 'Error registering with Registration Server at 0.0.0.0:3000',
  data: {error object}
}

{
  status: 'unregistered',
  message: 'Node unregistered from Registration Server',
  data: {
    static: boolean,
    address: string,
    port: number,
    connected: boolean,
    registered: boolean,
    selectedIndex: number
  }
}
```

Fires `registry` on several different events. The specific event is listed as the `status` and the object may be different per each event

Parameter | Type |  Description
--------- | ---- | -----------
status | string |`registered` Node has registered itself with a Registration Server
message | string | Human-friend message for this event
data | object | Object with details about the registration server
data.static | boolean | Is the registration server provided (static) or found via mDNS
data.address | string | Registration server address
data.port | number | Registration server port
data.connected | boolean | Connection status
data.registered | boolean | Registration status
data.selectedIndex | number | Index of selected mDNS Registration Server advertisement
 | |
status | string |`error` Error registering with the Registration Server
message | string | Human-friend message for this event
data | object | Error object from HTTP request error
 | |
status | string |`unregistered` Node has been unregistered by the Registration Server
message | string | Human-friend message for this event
data | object | Object with details about the registration server
data.static | boolean | Is the registration server provided (static) or found via mDNS
data.address | string | Registration server address
data.port | number | Registration server port
data.connected | boolean | Connection status
data.registered | boolean | Registration status
data.selectedIndex | number | Index of selected mDNS Registration Server advertisement

### Event: 'heartbeat'

> `heartbeat` event will be fired on every heartbeat once connected to a Registration Server

```javascript
{
  status: 'sent',
  message: 'Heartbeat sent to Registration Server',
  data: {
    time: number,
    uri: string
  }
}

{
  status: 'received',
  message: 'Heartbeat received from Registration Server',
  data: {
    time: number
  }
}

{
  status: 'error',
  message: 'Heartbeat Error',
  data: {
    time: number,
    error: object
  }
}
```

Fires `heartbeat` on several different events. The specific event is listed as the `status` and the object may be different per each event. Each `heartbeat` records the Javascript time in Unix milliseconds so a "ping-pong" latency can be determined. Heartbeats are sent ever 5 seconds and timeout after 1000 ms. The Registration Server SHOULD remove this entry after 12 seconds of no heartbeat.

Parameter | Type |  Description
--------- | ---- | -----------
status | string |`sent` Node has sent a heartbeat to the Registration Server
message | string | Human-friend message for this event
data | object | Object with details about the heartbeat
data.time | number | Javascript timestamp (Unix milliseconds) of when heartbeat was sent
data.uri | string | Address heartbeat was sent to
 | |
status | string |`received` Node has received a heartbeat response from the Registration Server
message | string | Human-friend message for this event
data | object | Object with details about the heartbeat
data.time | number | Javascript timestamp (Unix milliseconds) of when heartbeat was received
 | |
status | string |`error` Error in sending or receiving heartbeat
message | string | Human-friend message for this event
data | object | Object with details about the heartbeat
data.time | boolean | Javascript timestamp (Unix milliseconds) of when error was received
data.error | object | Error object from HTTP Request



## start()

```javascript
NodeAPI.start();

NodeAPI.on('started', (cb) => {
  console.log(cb.message)
})
```

> `started` event returns the following:

```javascript
{
  message: "NMMOS IS-04 Node server has started"
}
```
Start the Node server and mDNS services.

### Event: 'started'

Fires `started` event once the Node server has been started with the following object:

Parameter | Type |  Description
--------- | ---- | -----------
message | string | Human-friendly message for this event

## stop()

```javascript

NodeAPI.stop()

NodeAPI.on('stopped', (cb) => {
  console.log(cb.message)
})
```
> `stopped` event returns the following:

```javascript
{
  message: "NMMOS IS-04 Node server has stopped"
}
```
Stop the Node server and mDNS services.

### Event: 'stopped'

Fires `stopped` event once the Node server has been shutdown, with the following object:

Parameter | Type |  Description
--------- | ---- | -----------
message | string | Human-friendly message for this event


## startMDNS()

```javascript

NodeAPI.startMDNS()

NodeAPI.on('mdns', {
  status: string,
  message: string,
  data: object
})
```

> `mdns` event may return several objects (see docs)

Manually start the mDNS Services. This is automatically started with `start()`, but if the mDNS services were manually stopped, you can restart them here.

### Event: 'mdns'

```javascript
{
  status: 'advert_start',
  message: 'mDNS Advertisement has been started',
  data: {
    hostname: string,
    txtRecord: object
  }
}

{
  status: 'browse_start',
  message: 'mDNS Browse for Registration Servers has been started'
}
```

Fires `mdns` on several different events. The specific event is listed as the `status` and the object may be different per each event

Parameter | Type |  Description
--------- | ---- | -----------
status | string |`advert_start` Start of the mDNS Advertisement
message | string | Human-friend message for this event
data | object | Additional data for this event
data.hostname | string | mDNS Advertisement hostname
data.txtRecord | object | txt_records included with mDNS Advertisement
 | |
status | string |`browse_start` Start of mDNS looking for Registration Servers
message | string | Human-friend message for this event


## stopMDNS()

```javascript

NodeAPI.stopMDNS()

NodeAPI.on('mdns', {
  status: string,
  message: string,
  data: object
})
```

> `mdns` event may return several objects (see docs)

Manually stop the mDNS Services. This is automatically stopped with `stop()` but can also stop mDNS services manually

### Event: 'mdns'

```javascript
{
  status: 'advert_stop',
  message: 'mDNS Advertisement has stopped'
}

{
  status: 'browse_stop',
  message: 'mDNS Browse for Registration Servers have stopped'
}
```

Fires `mdns` on several different events. The specific event is listed as the `status` and the object may be different per each event

Parameter | Type |  Description
--------- | ---- | -----------
status | string |`advert_stop` Stop of the mDNS Advertisement
message | string | Human-friend message for this event
 | |
status | string |`browse_stop` Stop of mDNS looking for Registration Servers
message | string | Human-friend message for this event
