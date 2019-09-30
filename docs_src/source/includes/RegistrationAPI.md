# RegistrationAPI

## Instantiation

```javascript
const is04 = require('node-nmos-is04');

let store = new is04.NodeRAMStore()
let RegistrationAPI = new is04.RegistrationAPI({
  store: store,
  address: '0.0.0.0:3001'
});

RegistrationAPI.on('heartbeat', (cb) => {
  console.log(`${cb.status}: ${cb.message} | Time since last: ${cb.data.timeSinceLast}` )
})
```

Start a NMOS IS-04 Registration Server. The Registration Server is compliant with the REST API as defined by [NMOS in their documentation](https://amwa-tv.github.io/nmos-discovery-registration/tags/v1.3/html-APIs/RegistrationAPI.html#) up to NMOS v1.3

### Parameters
Parameter | Required | Default | Description
--------- | ------- | ------- | -----------
store | required | | Node Store for access to Registry information
address | optional | 'localhost:3000' | Interface address and port
hostname | optional | 'nmos_reg' | Hostname of Registry instance
priority | optional | 100 | Registry Server Priority

### Event: 'heartbeat'

```javascript
{
  status: 'received',
  message: 'Heartbeat received from Node',
  data: {
    id: string,
    timeSeconds: number,
    timeSinceLast: number,
    time: number
  }
}
```

Fires `heartbeat` when a heartbeat is received from a Node. Each `heartbeat` records the Javascript time in Unix milliseconds so a "ping-pong" latency can be determined. Heartbeats SHOULD be received from the Node every 5 seconds.

Parameter | Type |  Description
--------- | ---- | -----------
status | string |`received` Registration Server has received a heartbeat response from the Node
message | string | Human-friend message for this event
data | object | Object with details about the heartbeat
data.id | string | ID of the reporting Node
data.timeSeconds | number | Time when heartbeat was received, in seconds
data.timeSinceLast | number | Amount of time since the last heartbeat
data.time | number | Javascript timestamp (Unix milliseconds) of when heartbeat was received

## RegistrationAPI.start()

```javascript
  RegistrationAPI.start()

  RegistrationAPI.on('started', (cb) => {
    console.log(cb.message)
  })
```

Start the Registration Server and mDNS services

### Event: 'started'

```javascript
{
  message: "NMOS IS-04 Registration Server Started"
}
```

Fires `started` upon start of the registry server

Parameter | Type |  Description
--------- | ---- | -----------
message | string | Human-friendly message for this event

## RegistrationAPI.stop()

```javascript
  RegistrationAPI.stop()

  RegistrationAPI.on('stopped', (cb) => {
    console.log(cb.message)
  })
```

Stop the Registration Server

### Event: 'stopped'

```javascript
{
  message: "NMOS IS-04 Registration Server stopped"
}
```

Fires `stopped` upon start of the registry server

Parameter | Type |  Description
--------- | ---- | -----------
message | string | Human-friendly message for this event

## RegistrationAPI.startMDNS()

```javascript

RegistrationAPI.startMDNS()

RegistrationAPI.on('mdns', (cb) => {
  console.log(cb.message, cb.data)
})
```

> `mdns` event may return several objects

Manually start the mDNS Services. This is automatically started with `start()`, but if the mDNS services were manually stopped, you can restart them here.

### Event: 'mdns'

```javascript
{
  status: 'advert_start',
  message: 'mDNS Advertisement has been started',
  data: {
    hostname: string,
    txtRecord: {
      pri: number
    }
  }
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
data.txtRecord.pri | number | Registration Server Priority Number


## RegistrationAPI.stopMDNS()

```javascript

RegistrationAPI.stopMDNS()

RegistrationAPI.on('mdns', (cb) => {
  console.log(cb.message)
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
```

Fires `mdns` on several different events. The specific event is listed as the `status` and the object may be different per each event

Parameter | Type |  Description
--------- | ---- | -----------
status | string |`advert_stop` Stop of the mDNS Advertisement
message | string | Human-friend message for this event
