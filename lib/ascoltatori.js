"use strict";

var SubsCounter = require("./subs_counter");
var util = require("./util");

/**
 * You can require any Ascolatore through this module.
 *
 * @api public
 */
module.exports = {
  get AbstractAscoltatore() { return require('./abstract_ascoltatore'); },
  get TrieAscoltatore() { return require('./trie_ascoltatore'); },
  get EventEmitter2Ascoltatore() { return require('./event_emitter2_ascoltatore'); },
  get RedisAscoltatore() { return require("./redis_ascoltatore"); },
  get ZeromqAscoltatore() { return require("./zeromq_ascoltatore"); },
  get AMQPAscoltatore() { return require("./amqp_ascoltatore"); },
  get MQTTAscoltatore() { return require("./mqtt_ascoltatore"); },
  get PrefixAscoltatore() { return require("./prefix_acoltatore"); },
  get MongoAscoltatore() { return require('./mongo_ascoltatore'); },
  get DecoratorAscoltatore() { return require("./decorator_ascoltatore"); },
  get JSONAscoltatore() { return require("./json_ascoltatore"); },
  get FileSystemAscoltatore() { return require("./filesystem_ascoltatore"); },
  get KafkaAscoltatore() { return require("./kafka_ascoltatore"); },
};

/**
 *
 * @api private
 */
var classes = {
  get amqp() { return module.exports.AMQPAscoltatore; },
  get trie() { return module.exports.TrieAscoltatore; },
  get eventemitter2() { return module.exports.EventEmitter2Ascoltatore; },
  get mqtt() { return module.exports.MQTTAscoltatore; },
  get redis() { return module.exports.RedisAscoltatore; },
  get zmq() { return module.exports.ZeromqAscoltatore; },
  get mongo() { return module.exports.MongoAscoltatore; },
  get kafka() { return module.exports.KafkaAscoltatore; },
  get filesystem() { return module.exports.FileSystemAscoltatore; },
};

/**
 * Builds an ascolatore based on the proper type.
 * It will encapsulate it in a PrefixAscolatore if a prefix key is
 * present.
 * The other options are passed through the constructor of the
 * Ascoltatore
 *
 * Options:
 *  - `type`, it can be "amqp", "trie", "eventemitter2", "redis", "zmq", or just a class
 *    that will be instantiated (i.e. with `new`).
 *  - `prefix`, will be passed to the PrefixAscoltatore.
 *  - `json`, it can be setted to false if you do not want your messages
 *    to be wrapped inside JSON.
 *  - any other option that the ascolatore constructor may need.
 *
 *  @api public
 *  @param {Object} opts The options
 *  @param {Function} done The callback that will be called when the
 *  ascoltatore will be ready
 */
module.exports.build = function build(opts, done) {
  opts = opts || {};

  if (typeof opts === "function") {
    done = opts;
    opts = {};
  }

  var Klass = null,
    result = null;

  Klass = (typeof opts.type === 'function') ? opts.type :
            (classes[opts.type] || module.exports.TrieAscoltatore);

  result = new Klass(opts, module.exports);

  if (opts.prefix) {
    result = new module.exports.PrefixAscoltatore(opts.prefix, result)
      .once("error", done);
  }

  if (opts.json !== false) {
    result = new module.exports.JSONAscoltatore(result)
      .once("error", done);
  }

  if (done) {
    module.exports.util.defer(function() {
      result.once("ready", function() {
        result.removeListener("error", done);
        done(null, result);
      });
    });
  }

  return result;
};

/**
 * These are just utilities
 *
 * @api private
 */
module.exports.SubsCounter = SubsCounter;
module.exports.util = util;

/**
 * You can require a shared mocha test to you if you want to develop
 * a custom Ascoltatore inside your app.
 *
 * @api public
 */
module.exports.behaveLikeAnAscoltatore = require("./behave_like_an_ascoltatore");
