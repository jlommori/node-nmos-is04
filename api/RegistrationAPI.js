
const express = require('express')
const bodyparser = require('body-parser')
const mdns = require('mdns')
const http = require('http')
const EventEmitter = require('events')
const _ = require ('lodash')
const model = require('../model/')
let util = require('./Util.js')

class RegistrationAPI extends EventEmitter {
  constructor(params) {
    super()
    this.app = express()
    this.server = null

    this.address = params.address ? params.address.match(/(^.+)(?=:)/g) : '0.0.0.0'
    this.port = params.address ? params.address.match(/:(.+)/g)[0].slice(1) : '3000'

    if (!params.store) throw("Store is required to create this Registration API")
    this.store = params.store
    this.nodeHealth = {}
    this.healthCheckInterval = null

    this.mdns = {
      server: null,
      hostname: params.hostname ? params.hostname : 'nmos_reg',
      priority: params.priority ? params.priority : 100
    }

    this.log = new util.Logger('RegAPI', {txtColor: 'white', bgColor: 'blue'}, params.log ? params.log.level ? params.log.level : 2 : 2, params.log ? params.log.verbose ? params.log.verbose : false : false)
    this.log.info('RegistrationAPI initialized', this)

    this.app.use((req, res, next) => {
      // TODO enhance this to better supports CORS
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST, HEAD, OPTIONS, DELETE");
      res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
      res.header("Access-Control-Max-Age", "3600");

      if (req.method == 'OPTIONS') {
        res.send(200);
      } else {
        next();
      }
    });

    this.app.use(bodyparser.json());

    this.app.get('/', function (req, res) {
      this.log.debug('ROUTE: GET /')
      res.status(200).json(['x-nmos/']);
    });

    this.app.get('/x-nmos/', function (req, res) {
      this.log.debug('ROUTE: GET /x-nmos/')
      res.status(200).json(['registration/']);
    });

    this.app.get('/x-nmos/registration/', function (req, res) {
      this.log.debug('ROUTE: GET /x-nmos/registration/')
      res.status(200).json([ "v1.0/", "v1.2" ]);
    });

    let base = '/x-nmos/registration/:version'

    this.app.get(`${base}/`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/registration/${req.params.version}`)
      res.status(200).json([
        "resource/",
        "health/"
      ])
    })

    this.app.post(`${base}/resource`, async (req, res) => {
      this.log.debug(`ROUTE: POST /x-nmos/registration/${req.params.version}/resource`, {
        body: req.body
      })
      let type = req.body.type
      let resource = new model[_.startCase(type)](req.body.data)

      let exists = Object.keys(this.store[type+'s']).indexOf(resource.id) >= 0
      try {
        await this.putResource(type, resource)
      } catch (err) {
        this.log.error('POST /resource error', err)
        res.status(400)
        res.json({
          code: 400,
          error: err
        })
        throw(400)
      }
      if (type == "node") this.nodeHealth[resource.id] = Date.now() / 1000

      res.status(exists ? 200 : 201)
      res.set('Location', `/x-nmos/registration/${req.params.version}/resource/${type}s/${resource.id}`)
      this.log.debug('POST /resource return', req.body.data)
      res.json(req.body.data)
    })

    this.app.delete(`${base}/resource/:type/:id`, async (req, res) => {
      this.log.debug(`ROUTE: DELETE /x-nmos/registration/${req.params.version}/resource/${req.params.id}`)
      let exists = Object.keys(this.store[req.params.type]).indexOf(req.params.id) >= 0

      if (exists) {
        await this.deleteResource(req.params.type.slice(0,-1), req.params.id)
        delete this.nodeHealth[resource.id]

        res.send(204)
      } else {
        res.status(404).json({
          code: 404,
          error: "Requested resource does not exist on the store",
          debug: this.store[req.params.type]
        })
      }
    })

    //Used for debug only
    this.app.get(`${base}/resource/:type/:id`, async (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/registration/${req.params.version}/resource/${req.params.type}/${req.params.id}`)
      try {
        let resource = await this.store['get' + _.startCase(req.params.type.slice(0,-1))](id)
        res.status(200)
        res.json(resource)
      } catch (err) {
        res.status(404)
        res.json(err)
      }
    })


    //HEARTBEATS
    this.app.post(`${base}/health/nodes/:id`, async (req, res) => {
      this.log.debug(`ROUTE: POST /x-nmos/registration/${req.params.version}/health/nodes/${req.params.id}`)
      if (!util.validUUID(req.params.id)) {
        res.status(404)
        res.json({
          code: 404,
          error: "Give Node ID is not a valid UUID",
          debug: {
            uuid: id
          }
        })
      } else if (!this.nodeHealth[req.params.id]) {
        res.status(404)
        res.json({
          code: 404,
          error: "Node Health check received but node doesn't exist in the store",
          debug: this.nodeHealth
        })
      } else {
        let prevTime = this.nodeHealth[req.params.id]
        let diff = (Date.now() / 1000) - prevTime
        this.nodeHealth[req.params.id] = Date.now() / 1000
        this.emit("heartbeat", {
          status: "received",
          message: "Hearbeat received from Node",
          data: {
            id: req.params.id,
            timeSeconds: Date.now() / 1000,
            timeSinceLast: diff,
            time: Date.now()
          }
        })
        res.json({ health: Date.now() / 1000 })
      }
    })

    this.app.get(`${base}/health/nodes/:id`, async (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/registration/${req.params.version}/health/nodes/${paras.req.id}`)
      if (!util.validUUID(req.params.id)) {
        res.status(404)
        res.json({
          code: 404,
          error: "Given Node ID is not a valid UUID",
          debug: { uuid: id }
        })
      } else if (!this.nodeHealth[req.params.id]) {
        res.status(404)
        res.json({
          code: 404,
          error: "Node Health check recieved but node doesn't exist in the store",
          debug: this.nodeHealth
        })
      } else {
        res.json({ health: this.nodeHealth[req.params.id]})
      }
    })

    this.app.use(function (err, req, res, next) {
      if (err.status) {
        res.status(err.status).json({
          code: err.status,
          error: (err.message) ? err.message : 'Internal server error. No message available.',
          debug: (err.stack) ? err.stack : 'No stack available.'
        });
      } else {
        res.status(500).json({
          code: 500,
          error: (err.message) ? err.message : 'Internal server error. No message available.',
          debug: (err.stack) ? err.stack : 'No stack available.'
        })
      }
    });

    this.app.use(function (req, res, next) {
      res.status(404).json({
          code : 404,
          error : `Could not find the requested resource '${req.path}'.`,
          debug : req.path
        });
    });

  }

  getStore() {
    this.log.debug(`getStore()`)
    return this.store
  }

  async putResource(type, data) {
    this.log.debug('putResource(type, data)', {
      type: type,
      data: data
    })
    try {
      await this.store['put' + _.startCase(type)](data)
    } catch (err) {
      this.log.error('putResource Error', err)
    }
    this.log.info(`${type} ID ${data.id} has been updated in store.`)
    this.emit('modify', {
      type: type,
      message: `${type} ID ${data.id} has been modified`,
      data: data
    })
  }

  async deleteResource(type, id) {
    await this.store['delete' + _.startCase(type)](id)
    this.log.info(`${type} ID ${data.id} has been deleted from store.`)
    this.emit('modify', {
      type: type,
      message: `${type} ID ${id} has been deleted from the store`
    })
  }

  start() {
    this.server = this.app.listen(this.port, this.address, (e) => {

      if (e) {
        if (e.code == 'EADDRINUSE') {
          this.log.error(`Address http://${this.address}:${this.port} already in use`)
          server.close();
        };
      } else {
        this.log.info(`NMOS IS-04 Registration Server running at http://${this.address}:${this.port}`)
      };
    })

    this.startMDNS()
    this.startHealthCheck()

    this.emit('started', {
      message: 'NMOS IS-04 Registration Server Started'
    })
  }

  stop() {
    if (this.server) {
      this.server.close(() => {
        this.stopMDNS()
        this.server = null
        clearInterval(this.healthCheckInterval)
        this.log.info(`NMOS IS-04 Registration Server stopped`)
      })

      this.emit('stopped', {
        message: "NMOS IS-04 Registration Server has been stopped"
      })
    }
  }

  startHealthCheck() {
    this.healthCheckInterval = setInterval(() => {
      this.log.info('healthCheckInterval() current counts:', {
        nodes: _.size(this.getStore().getNodes()),
        devices: _.size(this.getStore().getDevices()),
        sources: _.size(this.getStore().getSources()),
        flows: _.size(this.getStore().getFlows()),
        senders: _.size(this.getStore().getSenders()),
        receivers: _.size(this.getStore().getReceivers())
      }, true)
      
      const curTime = Date.now() / 1000;
      Object.keys(this.nodeHealth).map(nodeID => {
        if (this.nodeHealth[nodeID] < curTime - 12) {
          this.log.error(`Node has failed health check - removing: ${nodeID} - node: ${this.nodeHealth[nodeID]}, now: ${curTime}`);
          this.getStore().getDevices({ node_id: nodeID }, (err, ds) => {
            if (err) console.log(err);
            ds.forEach(d => {
              this.getStore().getReceivers({ device_id: d.id }, (err, rs) => {
                if (err) console.log(err);
                rs.forEach(r => this.deleteResource(r.id, 'receiver', err => { if (err) console.log(err); }));
              });
              this.getStore().getSenders({ device_id: d.id }, (err, ss) => {
                if (err) console.log(err);
                ss.forEach(s => this.deleteResource(s.id, 'sender', err => { if (err) console.log(err); }));
              });
              this.getStore().getSources({ device_id: d.id }, (err, ss) => {
                if (err) console.log(err);
                ss.forEach(s => {
                  this.getStore().getFlows({ source_id: s.id }, (err, fs) => {
                    if (err) console.log(err);
                    fs.forEach(f => this.deleteResource(f.id, 'flow', err => { if (err) console.log(err); }));
                  });
                  this.deleteResource(s.id, 'source', err => { if (err) console.log(err); })
                });
              });
              this.deleteResource(d.id, 'device', err => { if (err) console.log(err); })
            });
          });
          this.deleteResource(nodeID, 'node', err => { if (err) console.log(err); });
          delete this.nodeHealth[nodeID];
        }
      });
    }, 12000);
  }

  startMDNS() {
    this.mdns.server = mdns.createAdvertisement(mdns.tcp('nmos-register'), parseInt(this.port), {
      name: this.mdns.hostname,
      txtRecord: {
        pri: this.mdns.priority
      }
    })
    this.log.info('mDNS Advertisement has been started', {
      hostname: this.mdns.hostname,
      txtRecord: {
        pri: this.mdns.priority
      }
    })
    this.mdns.server.start()

    this.emit('mdns', {
      status: 'advert_start',
      message: 'mDNS Advertisement has been started',
      data: {
        hostname: this.mdns.hostname,
        txtRecord: {
          pri: this.mdns.priority
        }
      }
    })

    process.on("SIGINT", () => {

      this.stop()

      clearInterval(this.healthCheckInterval)
      setTimeout(function onTimeout() {
        process.exit();
      }, 1000)
    })
  }

  stopMDNS() {
    if (this.mdns.server) {
      this.mdns.server.stop()
      this.mdns.server = null

      this.log.info('mDNS Advertisement stopped')

      this.emit('mdns', {
        status: 'advert_stop',
        message: 'mDNS Advertisement has been stopped',
      })
    } else {
      throw("mDNS Advertisment not set for this Registration API, so it cannot be stopped")
    }
  }

}

module.exports = RegistrationAPI;
