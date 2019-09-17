
const express = require('express')
const bodyparser = require('body-parser')
const mdns = require('mdns')
const http = require('http')
const EventEmitter = require('events')
const _ = require('lodash')
const models = require('../model/')
let util = require('./Util.js')


class QueryAPI extends EventEmitter {
  constructor(params) {
    super()
    this.app = express()
    this.server = null

    this.ws = {
      server: null,
      webSockets: {},
      filter: {}
    }

    this.address = params.address ? params.address.match(/(^.+)(?=:)/g) : '0.0.0.0'
    this.port = params.address ? params.address.match(/:(.+)/g)[0].slice(1) : '3002'

    if (!params.store) throw("Store is required to create this Registration API")
    this.store = params.store

    this.mdns = {
      server: null,
      hostname: params.hostname ? params.hostname : 'nmos_reg',
      priority: params.priority ? params.priority : 100
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
          message: `Provided object type(${req.params.type}) not valid`
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

      console.log('_.size(req.query)', _.size(req.query))
      console.log('data', data)
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
    })
  }
}

module.exports = QueryAPI
