var MuxDemux = require('mux-demux')
  , dnode = require('dnode')


function levnet() {
  self = {}

  self.server = function (levdb) {
    if( !(levdb) )
      throw new Error("levnet server stream must be called with an open levelUP instance!")

    var mx = MuxDemux()

    console.log(levdb)

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
      console.log(c)
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
    return mx
  }


  self.client = function () {
    var mx = MuxDemux()
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

    mx.createKeyStream = wrapStream(mx.createReadStream, 'ks')
    mx.createValueStream = wrapStream(mx.createReadStream, 'vs')
    mx.createReadStream = wrapStream(mx.createReadStream, 'rs')
    mx.createWriteStream = wrapStream(mx.createWriteStream, 'ws')

    function control (remote) {
      var levapi = ['put', 'get', 'del',
                    'batch', 'approximateSize',
                    'isOpen', 'isClosed']
      levapi.forEach(function (key) {
        mx[key] = remote[key]
      })
      mx.emit('levelup')
    }
    return mx
  }

  return self

}

/*
 * This wraps regular mux-demux streams
 * so they take options like levelUP streams
 */
function wrapStream (fn, type) {
  return function () {
    var arg = {type: type, options: arguments[0]}
    return fn.apply(null, [arg])
  }
}

module.exports = levnet
