# QueryAPI

## Instantiation

```javascript
const is04 = require('node-nmos-is04');

let store = new is04.NodeRAMStore()
let QueryAPI = new is04.QueryAPI({
  store: store
});

```

Start a NMOS IS-04 Query Service. The Query Service is compliant with the REST API as defined by [NMOS in their documentation](https://amwa-tv.github.io/nmos-discovery-registration/branches/v1.3.x/html-APIs/QueryAPI.html) up to NMOS v1.3.

The Query Service also supports WebSocket connections as per [NMOS documentation on Querying Behavior](https://amwa-tv.github.io/nmos-discovery-registration/branches/v1.3.x/docs/4.2._Behaviour_-_Querying.html). In general, the API endpoint `POST /subscriptions` allows for a WebSocket host to be created on the Query server for clients to connect to and receive real-time updates of resource changes in the store.

The Query Services DOES NOT yet support RQL Queries, as they are specified as optional in the IS-04 v1.3 standard.

### Parameters
Parameter | Required | Default | Description
--------- | ------- | ------- | -----------
store | required | | Node Store for access to Registry information
address | optional | 'localhost:3002' | Interface address and port

## QueryAPI.start()

```javascript

QueryAPI.start()

QueryAPI.on('started', (cb) => {
  console.log(cb.message)
})
```

Start the Query API server to interact with a particular store

### Event: 'started'

> Event fires

```javascript
{
  message: "NMOS IS-04 Query Service Started"
}
```

Fires `started` upon start of the query service

Parameter | Type |  Description
--------- | ---- | -----------
message | string | Human-friendly message for this event

### Event: 'ws'

```javascript
QueryAPI.on('ws', (cb) => {
  console.log(cb.message)
})
```

> Event fires

```javascript
{
  event: 'start',
  message: "webSocket service started"
}
```

Fires when the websocket server is started

Parameter | Type |  Description
--------- | ---- | -----------
message | string | Human-friendly message for this event
