# LEVELNET

Remote API bindings for [LevelUP](https://github.com/rvagg/node-levelup)

A replication of the LevelDB API on the client. Full API coverage using battle hardened [mux-demux](https://github.com/dominictarr/mux-demux) and [dnode](https://github.com/substack/dnode) to provide the streaming RPC mechanism. Create a `LevelUP` instance, pass it to a `Levelnet` server function and get a duplex stream to pipe into. The `client()` function returns a stream which also has the full `levelUP` API integrated.

## EXAMPLES

### SIMPLE SERVER
```javascript
var levelup = require('levelup')
  , db = levelup('./testdb')
  , net = require('net')
  , levnet = require('../.')

var PORT = 9988
  , server = net.createServer(handler).listen(PORT)
  , levdb = levnet()

function handler(stream) {
  var lev = levdb.server(db)
  stream.pipe(lev).pipe(stream)
}
```

### SIMPLE CLIENT Callback API
```javascript
var levnet = require('../../.')
  , net = require('net')

var PORT = 9988
  , stream = net.connect(PORT)
  , levdb = levnet()

var lev = levdb.client()

lev.on('levelup', function () {
  lev.put('lando', 'calrissian', function(err) {
    if (err) console.log(err)

    lev.get('lando', function (err, value) {
      if (err) return console.log('No Lando!', err)
      console.log('lando', '=', value)

      lev.get('Cloud City', function (err, value) {
        if (err) return console.log('no Cloud City!', err)
        console.log('faruq', '=', value)
      })
    })
  })
})
```

### SIMPLE CLIENT Streaming API
```javascript
var levnet = require('../../.')
  , net = require('net')

var PORT = 9988
var stream = net.connect(PORT)
var levdb = levnet()
var lev = levdb.client()

lev.on('levelup', function () {
  lev.put('Yavin', 'Corsusca', function(err) {
    if (err) console.log(err)

    lev.put('Boba', 'Fett', function(err) {
      if (err) console.log(err)

      lev.createReadStream().on('data', function (data) {
        console.log(data.key, '=', data.value)
        lev.end()
      })
    })
  })
})

stream.pipe(lev).pipe(stream)

```


## INSTALL
```shell
npm install levelnet
```

## LICENSE
MIT
