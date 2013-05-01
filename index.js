var MuxDemux = require('mux-demux')
  , dnode = require('dnode')
  , duplex = require('stream').Duplex

function levnet(levdb) {

  var self = function (stream) {

    if (!levdb)
      return new Error("Must call main levnet function with leveldb instance!")

    var mx = MuxDemux()
    stream.pipe(mx).pipe(stream)

    var d = dnode({
      put: function (key, value, options, cb) {
        if (typeof options === 'function')
          cb = options
        levdb.put(key, value, options, cb) // some kind of I/O error
      }
    , get: function (key,  options, cb) {
        if (typeof options === 'function')
          cb = options
        levdb.get(key, options, cb)
      }
    , del: function (key, options, cb) {
        if (typeof options === 'function')
          cb = options
        levdb.del(key, options, cb)
      }
    , batch: function (array, options, cb) {
        if (typeof options === 'function')
          cb = options
        levdb.batch(array, options, cb)
      }
    , approximateSize: function (start, end, callback) {
        levdb.approximateSize(start, end, callback)
      }
    , isOpen: function (cb) {
        cb(levdb.isOpen())
      }
    , isClosed: function (cb) {
        cb(levdb.isClosed())
      }
    })

    d.pipe(mx.createStream({type: 'dnode'})).pipe(d)

    mx.on('connection', function (c) {
      switch (c.meta.type) {
        case 'rs':
        levdb.createReadStream(c.meta.options).pipe(c)
        break;
        case 'ks':
        levdb.createKeyStream(c.meta.options).pipe(c)
        break;
        case 'vs':
        levdb.createValueStream(c.meta.options).pipe(c)
        break;
        case 'ws':
        levdb.createWriteStream(c.meta.options).pipe(c)
        break;
        default:
        console.log("SOME ERROR HERE?")
        break;
      }
    })
    /*
     * What really should we be doing
     * about errors here ??
     */
    mx.on('error', function () {
      stream.destroy()
    })
    stream.on('error', function () {
      mx.destroy()
    })
  }


  self.connect = function (stream) {

    var api = stream
    var mx = MuxDemux()

    stream.pipe(mx).pipe(stream)

    mx.on('connection', function (c) {
      /*
       * Build client facing dnode API with access to mux-demux streams.
       * Need to call dnode function to setup the mux-demux stream
       */
      if (c.meta.type === 'dnode') {
        var d = dnode()
        d.on('remote', control)
        c.pipe(d).pipe(c)
      }
    })

    api.createReadStream = function (options) {
      return mx.createReadStream({type:'rs', options: options})
    }
    api.createKeyStream = function (options) {
      return mx.createReadStream({type:'ks', options: options})
    }
    api.createValueStream = function (options) {
      return mx.createReadStream({type:'vs', options: options})
    }
    api.createWriteStream = function (options) {
      return mx.createWriteStream({type:'ws', options: options})
    }

    function control (remote) {
      var levapi = ['put', 'get', 'del',
                    'batch', 'approximateSize',
                    'isOpen', 'isClosed']
      levapi.forEach(function (key) {
        api[key] = remote[key]
      })
      api.emit('connection')
    }
    return api

  }

  return self
}


module.exports = levnet
