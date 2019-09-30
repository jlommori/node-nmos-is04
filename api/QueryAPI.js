
const express = require('express')
const bodyparser = require('body-parser')
const mdns = require('mdns')
const http = require('http')
const uuid = require('uuid/v4')
const WebSocket = require('ws')
const EventEmitter = require('events')
const _ = require('lodash')
const models = require('../model/')
let util = require('./Util.js')


class QueryAPI extends EventEmitter {
  constructor(params) {
    super()
    this.app = express()
    this.server = null
    this.id = uuid()

    this.ws = {
      server: null,
      webSockets: {},
      filter: {},
      queue: {
        lastSent: null,
        items: []
      }
    }

    this.address = params.address ? params.address.match(/(^.+)(?=:)/g) : '0.0.0.0'
    this.port = params.address ? params.address.match(/:(.+)/g)[0].slice(1) : '3002'

    if (!params.store) throw("Store is required to create this Registration API")
    this.store = params.store

    this.mdns = {
      server: null,
      hostname: params.hostname ? params.hostname : 'nmos_query'
    }

    this.app.use((req, res, next) => {
      // TODO enhance this to better supports CORS
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST, HEAD, OPTIONS, DELETE");
      res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
      res.header("Access-Control-Max-Age", "3600");

      if (req.method == 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    })

    this.app.use(bodyparser.json());

    this.app.get('/', function (req, res) {
      res.status(200).json(['x-nmos/']);
    });

    this.app.get('/x-nmos/', function (req, res) {
      res.status(200).json(['query/']);
    });

    this.app.get('/x-nmos/query/', function (req, res) {
      res.status(200).json([ "v1.0/", "v1.2" ]);
    });

    let base = '/x-nmos/query/:version'

    this.app.get(`${base}/`, (req, res) => {
      res.status(200).json([
        "subscriptions/",
        "flows/",
        "sources/",
        "nodes/",
        "devices/",
        "senders/",
        "receivers/"
      ])
    })

    this.app.post(`${base}/subscriptions`, (req, res) => {
      if (!req.body.resource_path || !req.body.params) {
        res.status(400).json({
          code: 400,
          error: "resource_path and params are required to establish a websocket subscription"
        })
      }

      if (!_.includes(types, req.body.resource_path.substring(1))) {
        res.status(400).json({
          code: 400,
          error: "Requested resource_path not valid"
        })
      }

      if (typeof req.body.params != 'object') {
        res.status(400).json({
          code: 400,
          error: "params must be an object"
        })
      }

      if (!req.body.max_update_rate_ms) {
        req.body.max_update_rate_ms = 100
      }

      if (!req.body.persist) {
        req.body.persist = false
      }

      let ws, code

      if (_.size(this.ws.webSockets) > 0) {
        _.each(this.ws.webSockets, (webSocket) => {
          if (webSocket.resource_path == req.body.resource_path && _.isEqual(webSocket.params, req.body.params)) {
            console.log('websocket request already exists')

            webSocket.max_update_rate_ms = req.body.max_update_rate_ms
            webSocket.persist = req.body.persist

            if (req.body.secure) webSocket.secure = req.body.secure
            if (req.body.authorization) webSocket.authorization = req.body.authorization

            ws = {
              id: webSocket.id,
              ws_href: `ws://${this.address}:${this.port}/ws/?uid=${webSocket.id}`,
              max_update_rate_ms: webSocket.max_update_rate_ms,
              persist: webSocket.persist,
              secure: webSocket.secure,
              resource_path: webSocket.resource_path,
              params: webSocket.params,
              authorization: webSocket.authorization,
              items: {}
            }

            this.ws.webSockets[ws.id] = ws
            code = 200

          } else {
            let id = uuid()

            let max_update_rate_ms = req.body.max_update_rate_ms
            let persist = req.body.persist

            let secure, authorization

            if (req.body.secure) secure = req.body.secure
            if (req.body.authorization) authorization = req.body.authorization

            ws = {
              id: id,
              ws_href: `ws://${this.address}:${this.port}/ws/?uid=${id}`,
              max_update_rate_ms: max_update_rate_ms,
              persist: persist,
              secure: secure,
              resource_path: req.body.resource_path,
              params: req.body.params,
              authorization: authorization,
              items: {}
            }

            this.ws.webSockets[ws.id] = ws
            this.ws.webSockets[ws.id].clients = []

            code = 201
          }
        })
      } else {
        let id = uuid()

        let max_update_rate_ms = req.body.max_update_rate_ms
        let persist = req.body.persist

        let secure, authorization

        if (req.body.secure) secure = req.body.secure
        if (req.body.authorization) authorization = req.body.authorization

        ws = {
          id: id,
          ws_href: `ws://${this.address}:${this.port}/ws/?uid=${id}`,
          max_update_rate_ms: max_update_rate_ms,
          persist: persist,
          secure: secure,
          resource_path: req.body.resource_path,
          params: req.body.params,
          authorization: authorization,
          items: {}
        }

        this.ws.webSockets[ws.id] = ws
        this.ws.webSockets[ws.id].clients = []

        code = 201
      }

      req.query = ws.params

      this.basicQuery(req, this.store[`get${_.upperFirst(req.body.resource_path.substring(1))}`]()).then((r) => {
        _.each(r.data, (data) => {
          this.ws.webSockets[ws.id].items[data.id] = data
        })

        let ret = {
          id: this.ws.webSockets[ws.id].id,
          ws_href: this.ws.webSockets[ws.id].ws_href,
          max_update_rate_ms: this.ws.webSockets[ws.id].max_update_rate_ms,
          persist: this.ws.webSockets[ws.id].persist,
          resource_path: this.ws.webSockets[ws.id].resource_path,
          params: this.ws.webSockets[ws.id].params
        }

        res.header("Location", `/x-nmos/query/${req.params.version}/subscriptions/${ws.id}`)
        res.status(code).json(ret)
      })
    })

    //Used for debug only
    this.app.get(`${base}/subscriptions`, (req, res, next) => {
      res.status(200).json(this.ws.webSockets)
    })

    this.app.get(`${base}/subscriptions/:id`, (req, res, next) => {
      if (!util.validUUID(req.params.id)) {
        res.status(400).json({
          code: 400,
          error: "Provided UUID is not a valid"
        })
      }

      if (!this.ws.webSockets[req.params.id]) {
        res.status(404).json({
          code: 404,
          error: "Provided UUID is not a current subscription"
        })
      }

      let r = _.cloneDeep(this.ws.webSockets[req.params.id])
      delete r.clients

      res.status(200).json(r)
    })

    this.app.delete(`${base}/subscriptions/:id`, (req, res, next) => {
      if (!util.validUUID(req.params.id)) {
        res.status(400).json({
          code: 400,
          error: "Provided UUID is not a valid"
        })
      }

      if (!this.ws.webSockets[req.params.id]) {
        res.status(404).json({
          code: 404,
          error: "Provided UUID is not a current subscription"
        })
      }

      if (!this.ws.webSockets[req.params.id].persist) {
        res.status(403).json({
          code: 403,
          error: "Provided Subscription is not persistent therefore lifecycle is managed by the QueryAPI"
        })
      }

      delete this.ws.webSockets[req.params.id]
      res.sendStatus(204)
    })

    let types = ["nodes", "devices", "flows", "sources", "senders", "receivers"]

    this.app.get(`${base}/:type`, (req, res, next) => {
      if (_.includes(types, req.params.type)) {
        this.basicQuery(req, this.store[`get${_.upperFirst(req.params.type)}`]()).then((r) => {
          res.header("Link", r.headers.link)
          res.header("X-Paging-Limit", r.headers.limit)
          res.header("X-Paging-Since", r.headers.since)
          res.header("X-Paging-Until", r.headers.until)
          res.status(r.code).json(r.data)
        }).catch((e) => {
          console.log(e)
          res.sendStatus(500)
          // res.status(e.code).json({
          //   code: e.code,
          //   message: e.message
          // })
        })
      } else {
        res.status(501).json({
          code: 501,
          message: `Provided object type (${req.params.type}) not valid`
        })
      }

    })

    this.app.get(`${base}/:type/:id`, (req, res, next) => {
      console.log('get :type/:id')
      if (_.includes(types, req.params.type)) {
        let type = req.params.type.slice(0, -1);
        this.singleQuery(req, this.store[`get${_.upperFirst(type)}`](req.params.id)).then((r) => {
          res.status(r.code).json(r.data)
        }).catch((e) => {
          res.status(e.code).json({
            code: e.code,
            message: e.message
          })
        })
      } else {
        res.status(501).json({
          code: 501,
          message: `Provided object type (${req.params.type}) not valid`
        })
      }
    })

    this.store.on("create", (e) => {
      console.log('ws store create event', e)
      if (_.size(this.ws.webSockets) > 0) {
        _.each(this.ws.webSockets, (ws) => {
          if (ws.resource_path == e.topic) {
            let req = {
              params: {},
              query: ws.params
            }

            this.basicQuery(req, this.store[`get${_.upperFirst(ws.resource_path.substring(1))}`]()).then((results) => {
              _.each(results.data, (r) => {
                if (!_.hasIn(ws.items, r.id)) {
                  this.ws.webSockets[ws.id].items[r.id] = r.id
                  this.emit("ws_update", {
                    id: ws.id,
                    item: {
                      post: r
                    },
                    ts: util.generateVersion()
                  })
                }
              })
            })
          }
        })
      }
    })

    this.store.on("modify", (e) => {
      console.log('ws store modify event')
      if (_.size(this.ws.webSockets > 0)) {
        _.each(this.ws.webSockets, (ws) => {
          if (ws.resource_path == e.topic) {
            let req = {
              params: {},
              query: ws.params
            }

            this.basicQuery(req, this.store[`get${_.upperFirst(ws.resource_path.substring(1))}`]()).then((results) => {
              let returnIds = []
              _.each(results.data, (r) => { return returnIds.push(r.id) })

              _.each(ws.items, (item) => {
                if (!_.includes(returnIds, item.id)) { //item was in ws.items but now is not in return, issue remove
                  this.emit('ws_update', {
                    id: item.id,
                    item: {
                      pre: item
                    }
                  })

                  delete this.ws.webSockets[ws.id].items[item.id]
                }
              })

              _.each(results.data, (r) => {
                if (!_.hasIn(ws.items, r.id)) { //item does not exist in current ws items, it is new
                  this.ws.webSockets[ws.id].items[r.id] = r
                  this.emit('ws_update', {
                    id: ws.id,
                    item: {
                      post: r
                    }
                  })
                } else { //item is in the current ws.items
                  if (e.data.id == r.id) { //check if triggering event is this id
                    this.emit('ws_update', {
                      id: ws.id,
                      item: {
                        pre: ws.items[r.id],
                        post: r
                      }
                    })

                    this.ws.webSockets[ws.id].items[r.id] = r
                  }
                }
              })
            })
          }
        })
      }
    })

    this.store.on('delete', (e) => {
      console.log('ws store delete event')
      if (_.size(this.ws.webSockets > 0)) {
        _.each(this.ws.webSockets, (ws) => {
          if (ws.resource_path == e.topic) {
            if (_.hasIn(ws.items, e.data.pre.id)) {
              delete this.ws.webSockets[ws.id].items[e.data.pre.id]
              this.emit('ws_update', {
                id: ws.id,
                item: {
                  pre: e.data
                },
                ts: util.generateVersion()
              })
            }
          }
        })
      }
    })

  }

  static downgradeCheck(ver, downgrade) {
    let majorVer = ver.match(/(\d)/g)[0]
    let majorDowngrade = downgrade.match(/(\d)/g)[0]
    if (majorDowngrade != majorVer) {
      return false
    } else {
      return true
    }
  }

  static getVersions(obj, store) {
    if (obj instanceof models.Node) {
      return obj.api.versions[0].match(/(v\d.\d)/g)
    } else if (obj instanceof models.Device) {
      let node = store.getNode(obj.node_id)
      return node.api.versions[0].match(/(v\d.\d)/g)
    } else {
      let device = store.getDevice(obj.device_id)
      let node = store.getNode(device.node_id)
      return node.api.versions[0].match(/(v\d.\d)/g)
    }
  }

  static timeCheck(a, b) {
    let aSec = a.match(/(\d+)/g)[0]
    let aNano = a.match(/(\d+)/g)[1]
    let bMin = b.match(/(\d+)/g)[0]
    let bNano = b.match(/(\d+)/g)[1]

    if (aSec > bSec) {
      return true
    } else if (aSec < bSec) {
      return false
    } else if (aSec == bSec) {
      if (a.Nano > b.Nano || a.Nano == b.Nano) {
        return true
      } else {
        return false
      }
    }
  }

  basicQuery(req, data) {
    return new Promise((res, rej) => {
      if (req.query['query.rql']) {
        rej({
          code: 501,
          message: "RQL Queries not currently supported"
        })
      }

      let downgrade
      let paging = {
        used: false
      }
      let headers = {}
      if (req.query.downgrade) {
        downgrade = req.query.downgrade
        if (!this.constructor.downgradeCheck(req.params.version, downgrade)) {
          rej({
            code: 400,
            message: "Downgrade may not be used between major versions"
          })
        }
        delete req.query.downgrade
      }

      if (req.query['paging.since']) {
        paging.since = req.query['paging.since']
        delete req.query['paging.since']
      }

      if (req.query['paging.until']) {
        paging.until = req.query['paging.until']
        delete req.query['paging.until']
      }

      if (req.query['paging.limit']) {
        if (parseInt(req.query['paging.limit']) < 101) {
          paging.limit = parseInt(req.query['paging.limit'])
        } else {
          paging.limit = 100
        }
        delete req.query['paging.limit']
      } else {
        paging.limit = 100
        delete req.query['paging.limit']
      }

      if (req.query['paging.order']) {
        paging.order = req.query['paging.order']
        delete req.query['paging.order']
      }

      let returnArray = []

      if (_.size(req.query) == 0) {
        _.each(data, (o) => {
          returnArray.push(o)
        })
      } else {
        _.each(req.query, (val, key) => {
          var filtered = _.filter(data, function(o) {
            return _.includes(_.get(o, key), val)
          });

          _.each(filtered, (obj) => {
            returnArray.push(obj)
          })
        })
      }

      if (paging.since) {
        _.each(returnArray, (obj, index) => {
          if (!this.constructor.timeCheck(obj.version, paging.since)) {
            returnArray.splice(index, 1)
          }
        })
      }

      if (paging.until) {
        _.each(returnArray, (obj, index) => {
          if (!this.constructor.timeCheck(paging.until, obj.version)) {
            returnArray.splice(index, 1)
          }
        })
      }

      if (paging.limit) {
        if (parseInt(paging.limit) < parseInt(_.size(returnArray))) {
          _.each(returnArray, (obj, index) => {
            if (index = paging.limit, index > paging.limit) {
              returnArray.splice(index, 1)
            }
          })
        }
      }

      _.each(returnArray, (obj, index) => {
        if (req.params.version && !downgrade) {
          if (!_.includes(this.constructor.getVersions(obj, this.store), req.params.version)) {
            returnArray.splice(index,1)
          }
        }
        //TODO: Add appropriate behavior for downgrade
      })

      headers.limit = paging.limit
      headers.since = returnArray[0].version
      headers.until = returnArray[(returnArray.length - 1)].version

      if (paging.used) {

      } else {
        headers.link = `<${req.protocol}://${this.address}:${this.port}${req.path}?paging.since=${headers.since}&paging.limit=${headers.limit}>; rel="first", <${req.protocol}://${this.address}:${this.port}${req.path}?paging.until=${headers.until}&paging.limit=${headers.limit}>; rel="last"`
      }

      res({
        code: 200,
        data: returnArray,
        headers: headers
      })
    })
  }

  singleQuery(req, data) {
    return new Promise((res, rej) => {
      let obj = data

      if (obj) {

        if (req.query.downgrade) {
          if (!this.constructor.downgradeCheck(req.params.version, req.query.downgrade)) {
            rej({
              code: 400,
              message: "Downgrade may not be used between major versions"
            })
          }
        }

        if (!_.includes(this.constructor.getVersions(obj, this.store), req.params.version)) {
          rej({
            code: 409,
            message: "Node does not support requested version"
          })
        }

        res({
          code: 200,
          data: obj
        })

      } else {
        rej({
          code: 404,
          message: "Resource does not exist"
        })
      }
    })
  }

  start() {
    this.server = this.app.listen(this.port, this.address, (e) => {
      var host = this.server.address().address;
      var port = this.server.address().port;
      if (e) {
        if (e.code == 'EADDRINUSE') {
          console.log(`Address http://${host}:${port} already in use.`);
          server.close();
        } else {
          util.statusError(400, 'start() error', err)
        }

      } else {
        console.log(`NMOS IS-04 Query Service running at http://${host}:${port}`);
        this.emit('started', {
          message: 'NMOS IS-04 Query Service started'
        })
      };

      this.startWebSockets();
    })
  }

  startWebSockets() {
    this.emit('ws', {
      event: 'start',
      message: 'webSocket server started'
    })
    this.ws.server = new WebSocket.Server({ port: this.port })

    this.ws.server.on('connection', (ws, req) => {
      let clientId = uuid()
      let verified = false
      console.log('new ws connection', clientId)

      let params = (req.url.match( new RegExp("([^?=&]+)(=([^&]*))?", 'g' )) || [])
        .reduce( function (result, each, n, every) {
          let [key, value] = each.split('=');
          result [key] = value;
          return (result);
        }, {})

      if (!params.uid) {
        console.log('ws close: no uid parameter provided')
        ws.close(1008, "uid parameter required for websocket connection")
      } else if (!_.hasIn(this.ws.webSockets, params.uid)) {
        console.log('ws close: uid not found in ws.webSockets')
        ws.close(1008, "requested websocket uid is not available on this Query instance")
      } else {
        verified = true
        this.ws.webSockets[params.uid].clients.push(clientId)

        let grainItems = []

        _.each(this.ws.webSockets[params.uid].items, (item) => {
          grainItems.push({
            path: item.id,
            post: item
          })
        })

        let grain = {
          grain_type: "event",
          source_id: this.id,
          flow_id: params.uid,
          origin_timestamp: util.generateVersion(),
          sync_timestamp: util.generateVersion(),
          creation_timestamp: util.generateVersion(),
          rate: {
            numerator: 0,
            denominator: 1,
          },
          duration: {
            numerator: 0,
            denominator: 1
          },
          grain: {
            type: "urn:x-nmos:format:data.event",
            topic: this.ws.webSockets[params.uid].resource_path,
            data: grainItems
          }
        }

        ws.send(JSON.stringify(grain))
        console.log('webSockets', this.ws.webSockets)
      }

      ws.on('message', (msg) => {
        console.log('WSS SERVER: received message', msg)
      })

      ws.on('close', (e) => {
        if (verified) {
          this.ws.webSockets[params.uid].clients.splice(this.ws.webSockets[params.uid].clients.indexOf(clientId), 1)
          if (!this.ws.webSockets[params.uid].persist && this.ws.webSockets[params.uid].clients.length == 0) {
            console.log('all clients disconnected and non-persistent, tearring down ws')
            delete this.ws.webSockets[params.uid]
          }
        }
        console.log('WS Close', clientId)
        console.log('webSockets', this.ws.webSockets)
      })

      this.on('ws_update', (update) => {
        console.log('ws_update', update)

        let grain = {
          grain_type: "event",
          source_id: this.id,
          flow_id: params.uid,
          origin_timestamp: util.generateVersion(),
          sync_timestamp: update.ts,
          creation_timestamp: update.ts,
          rate: {
            numerator: 0,
            denominator: 1,
          },
          duration: {
            numerator: 0,
            denominator: 1
          },
          grain: {
            type: "urn:x-nmos:format:data.event",
            topic: this.ws.webSockets[params.uid].resource_path,
            data: null
          }
        }

        if (!update.item.pre && update.item.post) { //item created
          grain.grain.data = [
            {
              path: update.item.post.id,
              post: update.item.post
            }
          ]
        } else if (update.item.pre && update.item.post) { //item modified
          grain.grain.data = [
            {
              path: update.item.pre.id,
              pre: update.item.pre.id,
              post: update.item.post,
            }
          ]
        } else if (update.item.pre && !update.item.post) { //item deleted
          grain.grain.data = [
            {
              path: update.item.pre.id,
              pre: update.item.pre.id
            }
          ]
        }

        ws.send(JSON.stringify(grain))

      })


    })
  }
}

module.exports = QueryAPI
