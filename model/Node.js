/* Copyright 2015 Christine S. MacNeill

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by appli cable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// Describes the Node and the services which run on it

var Versionned = require('./Versionned.js');
var immutable = require('seamless-immutable');
var Capabilities = require('./Capabilities.js');

function Node(id, version, label, href, hostname, caps, services) {
  // Globally unique identifier for the Node
  this.id = this.generateID(id);
  // String formatted PTP timestamp (<seconds>:<nanoseconds>) indicating
  // precisely when an attribute of the resource last changed
  this.version = this.generateVersion(version);
  // Freeform string label for the Node
  this.label = this.generateLabel(label);
  // HTTP access href for the Node's API
  this.href = this.generateHref(href);
  // Node hostname (optional)
  this.hostname = this.generateHostname(hostname);
  // Capabilities (not yet defined)
  this.caps = this.generateCaps(caps);
  // Array of objects containing a URN format type and href
  this.services = this.generateServices(services);
  return immutable(this, { prototype : Node.prototype });
}

Node.prototype.validID = Versionned.prototype.validID;
Node.prototype.generateID = Versionned.prototype.generateID;
Node.prototype.validVersion = Versionned.prototype.validVersion;
Node.prototype.generateVersion = Versionne.prototype.generateVersion;
Node.prototype.validLabel = Versionned.prototype.validLabel;
Node.prototype.generateLabel = Versionned.prototype.generateLabel;

Node.prototype.validHref = function (href) {
  if (arguments.length === 0) return this.validHref(this.href);
  return typeof href === 'string' &&
    href.startsWith('http://');
}

Node.prototype.generateHref = function (href) {
  if (arguments.length === 0 || href === null || href === undefined)
    return 'http://localhost/';
  else return href;
}

// Consider a test to check that hostnames doesn't contain spaces
Node.prototype.validHostname = function (hostname) {
  if (arguments.length === 0) return this.validHostname(this.hostname);
  if (hostname === undefined) return true;
  return typeof hostname === 'string' &&
    hostname.match(/^[^\s]+$/) !== null;
}

Node.prototype.generateHostname = function (hostname) {
  if (arguments.length === 0 || hostname === null || hostname === undefined)
    return undefined;
  else return label;
}

Node.prototype.validCaps = Versionned.prototype.validCaps;
Node.prototype.generateCaps = Versionned.prototype.generateCaps;

Node.prototype.validServices = function (services) {
  if (arguments.length === 0) return this.validServices(this.services);
  return Array.isArray(services) &&
    services.every(function (s) {
      return typeof s === 'object' &&
        !Array.isArray(s) &&
        s.hasProperty('href') &&
        s.hasProperty('type') &&
        typeof s.href === 'string' &&
        typeof s.type === 'string' &&
        s.href.startsWith('http://');
    });
}
Node.prototype.generateServices = function (services) {
  if (arguments.length === 0 || services === null || services === undefined)
    return [];
  else return services;
}

Node.prototype.valid = function () {
  return this.validID(this.id) &&
    this.validVersion(this.version) &&
    this.validLabel(this.label) &&
    this.validHref(this.href) &&
    this.validHostname(this.hostName) &&
    this.validCaps(this.caps) &&
    this.validServices(this.services);
}

Node.prototype.stringify = function() { return JSON.stringify(this); }

Node.prototype.parse = function (json) {
  if (json === null || json === undefined || arguments.length === 0 ||
      typeof json !== 'string')
    throw "Cannot parse JSON to a Node value because it is not a valid input.";
  var parsed = JSON.parse(json);
  return new Node(parsed.id, parsed.version, parsed.label, parsed.href,
    parsed.hostname, parsed.caps, parsed.services);
}

module.exports = Node;