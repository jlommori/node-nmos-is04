/* Copyright 2016 Streampunk Media Ltd.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const express = require('express');
const bodyparser = require('body-parser');
const mdns = require('mdns');
const http = require('http');
const EventEmitter = require('events');
const _ = require('lodash');
const os = require('os')
let util = require('./Util.js')
const axios = require('axios')

/**
 * @typedef {Object} generic_ret
 * @property {string} message Event Message
 */

/**
 * Instantiate a new NMOS Node per IS-04
 * @extends EventEmitter
 * @param {object}  params              Paremeters object
 * @param {object} params.store         Store API, required to access node information
 * @param {string} [params.address]     IP Address or hostname for this Node, including port number
 * @param {string} [params.regAddress]  Optional, specific address of registration server instead of looking via mDNS
 */
class NodeAPI extends EventEmitter {
  constructor(params) {
    super()
    this.app = express()
    this.store = params.store

    this.iface = params.address ? params.address.match(/(^.+)(?=:)/g) : '0.0.0.0'
    this.port = params.address ? params.address.match(/:(.+)/g)[0].slice(1) : '3000'

    this.server = null;
    this.healthcheck = null;

    if (params.regAddress) this.regServer = {
      static: true,
      address: params.regAddress.match(/(^.+)(?=:)/g)[0],
      port: params.regAddress.match(/:(.+)/g)[0].slice(1),
      connected: false,
      registered: false,
      selectedIndex: null
    }
      else this.regServer = {
        static: false,
        address: null,
        port: null,
        connected: false,
        registered: false,
        selectedIndex: null
      }

    this.mdns = {
      browser: null,
      server: null,
      selectionTimer: null,
      candidates: [],
      hostname: null
    }

    this.log = new util.Logger("NodeAPI", {txtColor: 'black', bgColor: 'yellow'}, params.log ? params.log.level ? params.log.level : 2 : 2, params.log ? params.log.verbose ? params.log.verbose : false : false)
    this.log.info('NodeAPI initialized', this)

    this.app.use((req, res, next) => {
      //TODO: enhance this to better supports CORS
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST, HEAD, OPTIONS, DELETE");
      res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
      res.header("Access-Control-Max-Age", "3600");

      if (req.method == 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    this.app.use(bodyparser.json());

    this.app.get('/', (req, res) => {
      this.log.debug('ROUTE: GET /')
      res.status(200).json(['x-nmos/']);
    });

    this.app.get('/x-nmos/', (req, res) => {
      this.log.debug('ROUTE: GET /x-nmos/')
      res.status(200).json(['node/']);
    });

    this.app.get('/x-nmos/node/', (req, res) => {
      this.log.debug('ROUTE: GET /x-nmos/node/')
      res.status(200).json([ "v1.1/", "v1.2" ]);
    });

    let base = '/x-nmos/node/:version'

    this.app.get(`${base}/`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/`)
      res.status(200).json([
        "self/",
        "sources/",
        "flows/",
        "devices/",
        "senders/",
        "receivers/"
      ])
    })

    this.app.get(`${base}/self`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/self/`)
      res.status(200).json(this.store.getSelf())
    })

    this.app.get(`${base}/sources`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/sources`)
      res.status(200).json(this.store.getSources())
    })

    this.app.get(`${base}/sources/:id`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/sources/${req.params.id}`)
      if (!util.validUUID(req.params.id)) {
        res.status(400).json({
          code: 400,
          error: "Provided Source ID is not a valid UUID",
          debug: "Verify Source ID formatting"
        })
      } else {
        var source = this.store.getSource(req.params.id)

        if (!source) {
          res.status(404).json({
            code: 404,
            error: "Source ID not found on this Node",
            debug: null
          })
        } else {
          res.status(200).json(source)
        }
      }
    })

    this.app.get(`${base}/flows/`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/flows/`)
      res.status(200).json(this.store.getFlows())
    })

    this.app.get(`${base}/flows/:id`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/flows/${req.params.id}`)
      if (!util.validUUID(req.params.id)) {
        res.status(400).json({
          code: 400,
          error: "Provided Flow ID is not a valid UUID",
          debug: "Verify Flow ID formatting"
        })
      } else {
        var flow = this.store.getFlow(req.params.id)

        if (!flow) {
          res.status(404).json({
            code: 404,
            error: "Flow ID not found on this Node",
            debug: null
          })
        } else {
          res.status(200).json(flow)
        }
      }
    })

    this.app.get(`${base}/devices`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/devices/`)
      res.status(200).json(this.store.getDevices())
    })

    this.app.get(`${base}/devices/:id`, (req, res) => {
      if (!util.validUUID(req.params.id)) {
        res.status(400).json({
          code: 400,
          error: "Provided Device ID is not a valid UUID",
          debug: "Verify Device ID formatting"
        })
      } else {
        var device = this.store.getDevice(req.params.id)

        if (!device) {
          res.status(404).json({
            code: 404,
            error: "Device ID not found on this Node",
            debug: null
          })
        } else {
          res.status(200).json(device)
        }
      }
    })

    this.app.get(`${base}/senders/`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/devices/${req.params.id}/`)
      res.status(200).json(this.store.getSenders())
    })

    this.app.get(`${base}/senders/:id`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/senders/${req.params.id}/`)
      if (!util.validUUID(req.params.id)) {
        res.status(400).json({
          code: 400,
          error: "Provided Sender ID is not a valid UUID",
          debug: "Verify Sender ID formatting"
        })
      } else {
        var sender = this.store.getSender(req.params.id)

        if (!sender) {
          res.status(404).json({
            code: 404,
            error: "Sender ID not found on this Node",
            debug: null
          })
        } else {
          res.status(200).json(sender)
        }
      }
    })

    this.app.get(`${base}/receivers`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/receivers/`)
      res.status(200).json(this.store.getReceievers())
    })

    this.app.get(`${base}/receivers/:id`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/receivers/${req.params.id}/`)
      if (!util.validUUID(req.params.id)) {
        res.status(400).json({
          code: 400,
          error: "Provided Receiver ID is not a valid UUID",
          debug: "Verify Receiver ID formatting"
        })
      } else {
        var receiver = this.store.getReceiver(req.params.id)

        if (!receiver) {
          res.status(404).json({
            code: 404,
            error: "Receiver ID not found on this Node",
            debug: null
          })
        } else {
          res.status(200).json(receiver)
        }
      }
    })

    //TODO: route for PUT /${base}/receivers/:id/target (deprecated) ?
    this.app.put(`${base}/receivers/:id/target`, (req, res) => {
      this.log.debug(`ROUTE: GET /x-nmos/node/${req.params.version}/receivers/${req.params.id}/target/`)
      res.status(501).json({
        code: 501,
        error: "This resources is not available yet",
        debug: req.path
      })
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

  /**
   * Start Node Server
   * @description Start the IS-04 Node Server on supplied address and start mDNS automatically
   * @fires NodeAPI#start
   */
  start() {
    this.log.debug('start()')
    this.server = this.app.listen(this.port, this.iface, (e) => {
      if (e) {
        if (e.code == 'EADDRINUSE') {
          this.log.warn(`Address http://${this.iface}:${this.port} already in use.`)
          this.server.close();
        };
      } else {
        this.log.info(`Node NMOS-IS04 Node server running at http://${this.iface}:${this.port}`);
        this.startMDNS()
      };
    });

    if (this.regServer.static) {
      this.updateRegistry('connect', {
        connected: true,
        address: this.regServer.address,
        port: this.regServer.port
      })
    }

    /**
     * IS-04 Node has been started
     * @event NodeAPI#start
     * @return {generic_ret} Event return
     */
    this.emit('started', {
      message: "NMOS IS-04 Node server has started"
    })
  }
  /**
   * Stop Node Server
   * @description Stop the IS-04 Node Server
   * @fires NodeAPI#stopped
   */
  stop() {
    this.log.debug('stop()')

    this.server.close()
    if (this.mdns.server) this.mdns.server.stop()
    if (this.mdns.browser) this.mdns.browser.stop()
    this.updateRegistry('disconnect')

    this.log.info(`NMOS IS-04 Node server at http://${this.iface}:${this.port} has stopped`)

    /**
     * IS-04 Node has stopped
     * @event NodeAPI#stopped
     * @return {generic_ret} Event return
     */
    this.emit('stopped', {
      message: "NMOS IS-04 Node server has been stopped"
    })
  }

  /**
   * Start mDNS services
   * @description Start mDNS advertisment of this Node and look for registration servers (if not defined)
   * @fires NodeAPI#mdns_advert_start
   */
  startMDNS() {
    this.log.debug('startMDNS()')
    let node = this.store.getSelf()

    _.each(node.api.endpoints, (endpoint) => {
      endpoint.port = this.port
    })

    if (node.label) this.mdns.hostname = node.label.replace(/ /g,"_").toLowerCase();
      else this.mdns.hostname = "node_" + os.hostname().match(/([^\.]*)\.?.*/)[1] + '-' + process.pid;
    if (!this.mdns.server) {
      console.log(`Starting MDNS for ${this.mdns.hostname}`);

      let txt_records
      if (this.regServer.static) {
        txt_records = {
          api_proto: "http",
          api_ver: "v1.1,v1.2",
          api_auth: "false"
        }
      } else {
        txt_records = {
          api_proto: "http",
          api_ver: "v1.1,v1.2",
          api_auth: "false",
          ver_slf: 0,
          ver_src: 0,
          ver_flw: 0,
          ver_dvc: 0,
          ver_snd: 0,
          ver_rcv: 0
        }
      }

      this.mdns.server = mdns.createAdvertisement(mdns.tcp('nmos-node'), 3000, {
        name : this.mdns.hostname,
        txtRecord: txt_records
      });

      this.mdns.server.start();

      this.log.info('mDNS Advertisement has started.')

      /**
       * mDNS Advertisement has been started for this Node
       *
       * @typedef {object} advert_start_ret
       * @property {string} message Event Message
       * @property {object} data    Event Data
       * @property {string} data.hostname mDNS Advertisement Hostname
       * @property {object} data.txtRecord mDNS Advertisement txt_records
       *
       * @event NodeAPI#mdns_advert_start
       * @return {advert_start_ret} Event return
       */
      this.emit('mdns', {
        status: 'advert_start',
        message: 'mDNS Advertisment has been started',
        data: {
          hostname: this.mdns.hostname,
          txtRecord: txt_records
        }
      })

      process.on('SIGINT', () => {
        if (this.mdns.server) {
          this.stopMDNS()
        };

        setTimeout(function onTimeout() {
          process.exit();
        }, 100);
      });

      // console.log('mDNS: Looking for _nmos-register._tcp')
      this.mdns.browser = mdns.createBrowser(mdns.tcp('nmos-register'))
      if (!this.regServer.static) {
        this.mdns.browser.start()
        this.log.info('mDNS Browse for Registration Servers has been started')
        /**
         * mDNS Advertisement has been started for this Node
         * @event NodeAPI#mdns_browse_start
         * @return {generic_ret} Event return
         */
        this.emit('mdns', {
          status: 'browse_start',
          message: 'mDNS Browse for Registration Servers has been started'
        })
      }

      this.mdns.browser.on('serviceUp', (service) => {
        if (this.regServer.connected) return;
        if (service.fullname && service.fullname.indexOf('_nmos-register._tcp') >= 0) {
          // console.log("Found a registration service.", service.fullname, service.txtRecord.length > 0 ? service.txtRecord : "");
          this.mdns.candidates.push(service);
          if (!this.mdns.selectionTimer) this.mdns.selectionTimer = setTimeout(() => {
            this.selectCandidate(); }, 1000);
          }
      })

      this.mdns.browser.on('serviceDown', (service) => {
        // console.log('mdns service down', service)
        if (service.interfaceIndex == this.regServer.selectedIndex) {
          // console.log("Currently connected registration server no longer exists, tearing down existing regServer details")
          this.updateRegistry("disconnect")
          this.resetMDNSAd("disconnect")
        }
      })
    }
  }

  /**
   * Stop mDNS services
   * @description Stop mDNS advertisment of this Node and stop browsing for registration servers
   * @fires NodeAPI#mdns
   *
   * @typedef {object} mdns_generic_ret
   * @type {'advert_start' | 'advert_stop' | 'browse_start' | 'browse_stop'} status mDNS Update status
   * @property {string} message mDNS Event Message
   */
  stopMDNS() {
    this.log.debug('stopMDNS()')
    if (this.mdns.server) {
      this.mdns.server.stop()
      this.log.info("Node mDNS Advertisement has stopped")
      /**
       * mDNS Advertisement has been stopped for this Node
       * @event NodeAPI#mdns_advert_stop
       * @return {mdns_generic_ret} Event return
       */
      this.emit('mdns', {
        status: 'advert_stop',
        message: "Node mDNS Advertisement has stopped"
      })
    }

    if (this.mdns.browser) {
      this.mdns.browser.stop()
      this.log.info('Node mDNS browse for registration servers have stopped')
      /**
       * mDNS Browse has been stopped for this Node
       * @event NodeAPI#mdns_browse_stop
       * @return {generic_ret} Event return
       */
      this.emit('mdns', {
        status: 'browser_stop',
        message: "Node mDNS browse for registration servers have stopped"
      })
    }

  }

  selectCandidate() {
    this.log.debug('selectCandidate()')
    if (this.mdns.candidates.length > 0) {
      var selected = this.mdns.candidates.sort(function (x, y) {
        return parseInt(x.txtRecord.pri) > parseInt(y.txtRecord.pri);
      })[0];

      let selectedAddress

      _.each(selected.addresses, (address) => {
        if (address.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/g)) {
          selectedAddress = address
        }
      })

      // console.log('selected index', selected.interfaceIndex)

      // console.log(`Selected registration service at http://${selectedAddress}:${selected.port} ` +
      //   `with priority ${selected.txtRecord.pri}.`);
      this.updateRegistry('connect', {
        connected: true,
        address: selectedAddress,
        port: selected.port,
        selectedIndex: selected.interfaceIndex
      })
      this.resetMDNSAd("connected")
    }

    this.mdns.selectionTimer = null;
  }

  resetMDNSAd(status) {
    this.log.debug('resetMDNSAd()')
    if (status === "connected") {
      let txt_records = {
        api_proto: "http",
        api_ver: "v1.1,v1.2",
        api_auth: "false"
      }
      this.mdns.server.stop()
      this.mdns.server = mdns.createAdvertisement(mdns.tcp('nmos-node'), 3000, {
        name : this.mdns.hostname,
        txtRecord: txt_records
      });

      this.mdns.server.start()
    } else if (status === "disconnect") {
      let txt_records = {
        api_proto: "http",
        api_ver: "v1.1,v1.2",
        api_auth: "false",
        ver_slf: 0,
        ver_src: 0,
        ver_flw: 0,
        ver_dvc: 0,
        ver_snd: 0,
        ver_rcv: 0
      }
      this.mdns.server.stop()
      this.mdns.server = mdns.createAdvertisement(mdns.tcp('nmos-node'), 3000, {
        name : this.mdns.hostname,
        txtRecord: txt_records
      });

      this.mdns.server.start()
    }
  }

    async updateRegistry(status, params) {
      this.log.debug('updateRegistry(status, params)', {
        status: status,
        params: params
      })

    if (!params) params = {}

    this.regServer.connected = params.connected ? params.connected : false
    this.regServer.address = params.address ? params.address : null
    this.regServer.port = params.port ? params.port : null
    this.regServer.selectedIndex = params.selectedIndex ? params.selectedIndex : null

    if (status == "connect") {
      let requests = []
      let base = `http://${this.regServer.address}:${this.regServer.port}/x-nmos/registration/v1.2`
      requests.push(makeRequest("node", this.store.getSelf(), base))

      _.each(this.store.getDevices(), (device) => {
        requests.push(makeRequest("device", device, base))
      })

      _.each(this.store.getSources(), (source) => {
        requests.push(makeRequest("source", source, base))
      })

      _.each(this.store.getFlows(), (flow) => {
        requests.push(makeRequest("flow", flow, base))
      })

      _.each(this.store.getSenders(), (sender) => {
        requests.push(makeRequest('sender', sender, base))
      })

      _.each(this.store.getReceivers(), (receiver) => {
        requests.push(makeRequest('receiver', receiver, base))
      })


      Promise.all(requests).then((values) => {
        this.regServer.registered = true
        this.emit('registry', {
          status: 'registered',
          message: `Node registered with Registration Server at ${this.regServer.address}:${this.regServer.port}`,
          data: this.regServer
        })
        this.heartbeat(base, this.store.getSelf().id)
      }).catch((err) => {
        this.regServer.registered = false
        this.emit('registry', {
          status: 'error',
          message: `Error registering with Registration Server at ${this.regServer.address}:${this.regServer.port}`,
          error: err
        })
      })
    }

    if (status == "disconnect") {

      this.emit('registry', {
        status: 'unregistered',
        message: `Node unregistered from Registration Server`,
        data: this.regServer
      })
    }

    async function makeRequest(type, data, base) {
      this.log.debug('makeRequest(type, data, base)', {
        type: type,
        data: data,
        base: base
      })
      try {
        const res = await axios({
          method: 'POST',
          url: `${base}/resource`,
          data: {
            type: type,
            data: data
          }
        })

        return {
          type: type,
          data: res.data
        }
      } catch (err) {
        console.warn('err', err)
      }
    }
  }

  async heartbeat(base, id) {
    this.log.debug('heartbeat(base, id)', {
      base: base,
      id: id
    })
    this.emit("heartbeat", {
      status: "sent",
      message: "Heartbeat sent to Registration Server",
      data: {
        time: Date.now(),
        uri: `${base}/health/nodes/${id}`
      }
    })
     axios({
      method: 'POST',
      url: `${base}/health/nodes/${id}`,
      timeout: 1000,
    }).then((res) => {
      this.emit("heartbeat", {
        status: "received",
        message: "Hearbeat received from Registration Server",
        data: {
          time: Date.now()
        }
      })
      setTimeout(() => {
        this.heartbeat(base, id)
      }, 5000)
    }).catch((err) => {
      this.emit("heartbeat", {
        status: "error",
        message: "Heartbeat Error",
        data: {
          time: Date.now(),
          error: err
        }
      })
      this.updateRegistry('disconnect')
      this.resetMDNSAd("disconnect")
    })
  }
}

module.exports = NodeAPI
