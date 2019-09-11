//
// const express = require('express')
// const bodyparser = require('body-parser')
// const mdns = require('mdns')
// const http = require('http')
// const EventEmmitter = require('evernts')
// const _ = require('lodash')
// let util = require('./Util.js')
//
// class QueryAPI extends EventEmitter {
//   constructor(params) {
//     super()
//     this.app = express()
//     this.server = null
//
//     this.ws = {
//       server: null,
//       webSockets: {},
//       filter: {}
//     }
//
//     this.address = params.address ? params.address.match(/(^.+)(?=:)/g) : '0.0.0.0'
//     this.port = params.address ? params.address.match(/:(.+)/g)[0].slice(1) : '3002'
//
//     if (!params.store) throw("Store is required to create this Registration API")
//     this.store = params.store
//
//     this.mdns = {
//       server: null,
//       hostname: params.hostname ? params.hostname : 'nmos_reg',
//       priority: params.priority ? params.priority : 100
//     }
//
//     this.app.use((req, res, next) => {
//       // TODO enhance this to better supports CORS
//       res.header("Access-Control-Allow-Origin", "*");
//       res.header("Access-Control-Allow-Methods", "GET, PUT, POST, HEAD, OPTIONS, DELETE");
//       res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
//       res.header("Access-Control-Max-Age", "3600");
//
//       if (req.method == 'OPTIONS') {
//         res.sendStatus(200);
//       } else {
//         next();
//       }
//     })
//
//     this.app.use(bodyparser.json());
//
//     this.app.get('/', function (req, res) {
//       res.status(200).json(['x-nmos/']);
//     });
//
//     this.app.get('/x-nmos/', function (req, res) {
//       res.status(200).json(['query/']);
//     });
//
//     this.app.get('/x-nmos/query/', function (req, res) {
//       res.status(200).json([ "v1.0/", "v1.2" ]);
//     });
//
//     let base = '/x-nmos/query/:version'
//
//     this.app.get(`${base}/`, (req, res) => {
//       res.status(200).json([
//         "subscriptions/",
//         "flows/",
//         "sources/",
//         "nodes/",
//         "devices/",
//         "senders/",
//         "receivers/"
//       ])
//     })
//
//     this.app.get(`${base}/nodes`, (req, res, next) => {
//
//     })
//
//
//   }
//
//   static setPagingHeaders(res, total, pageOf, pages, size) {
//     if (pageOf) res.set('IS04-PageOf', pageOf.toString());
//     if (size) res.set('IS04-Size', size.toString());
//     if (pages) res.set('IS04-Pages', pages.toString());
//     if (total) res.set('IS04-Total', total.toString());
//     return res;
//   }
// } 
