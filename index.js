var MuxDemux = require('mux-demux')
  , dnode = require('dnode')
  , duplex = require('stream').Duplex

function levnet(levdb, stream) {

  if (levdb) {
    /*
     * SERVER CODE
     */

    if( !isLevelupInstance(levdb) )
      return new Error("levnet server stream must be called with an open levelUP instance!")

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
    console.log("IN SERVER")
    mx.on('connection', function (c) {
          console.log("IN SERVER CONNECTION")
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

  } else {
    /*
     * CLIENT CODE
     */
    var mx = MuxDemux()
    console.log("IN CLIENT")
    mx.on('connection', function (c) {
          console.log("IN CLIENT CONNECTION")
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

    mx.createReadStream = function (options) {
      return mx.createReadStream({type:'rs', options: options})
    }
    mx.createKeyStream = function (options) {
      return mx.createReadStream({type:'ks', options: options})
    }
    mx.createValueStream = function (options) {
      return mx.createReadStream({type:'vs', options: options})
    }
    mx.createWriteStream = function (options) {
      return mx.createWriteStream({type:'ws', options: options})
    }

    function control (remote) {
      console.log("IN CONTROL")
      var levapi = ['put', 'get', 'del',
                    'batch', 'approximateSize',
                    'isOpen', 'isClosed']
      levapi.forEach(function (key) {
        mx[key] = remote[key]
      })
      mx.emit('connection')
    }
    return mx
  }
}

function isLevelupInstance(db) {
  var api = ['put', 'get', 'del',
             'batch', 'approximateSize']

  return api.map(hasOwnProperty, db._db )
            .reduce( function(acc, val) {
           return acc && val
         })
}

module.exports = levnet
