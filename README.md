# LEVELNET

TCP stream bindings for the LevelDB API

A replication of the LevelDB API on a client using calls over TCP sockets. Full API coverage using battle hardened mux-demux and dnode streams. Create a LevelDB instance, pass it to `Levelnet` and it returns a handler that can be used in a TCP server. Call `connect(stream)` on the client side and write your LevelDB logic in the `connection` listener and you are done!

## EXAMPLES

### SERVER
```javascript
var levelup = require('levelup')
  , db = levelup('./mydb')
  , net = require('net')
  , levnet = require('../.')

var PORT = 9988
var leveltcp = levnet(db)
var server = net.createServer(leveltcp).listen(PORT)
```

### CLIENT Callback API
```javascript
var levnet = require('../../.')
  , net = require('net')

var PORT = 9988
var stream = net.connect(PORT)
var levdb = levnet().connect(stream)

levdb.on('connection', function () {
  levdb.put('lando', 'calrissian', function(err) {
    if (err) console.log(err)

    levdb.get('lando', function (err, value) {
      if (err) return console.log('No Lando!', err)
      console.log('lando', '=', value)

      levdb.get('Cloud City', function (err, value) {
        if (err) return console.log('no Cloud City!', err)
        console.log('faruq', '=', value)
      })
    })
  })
})
```

### CLIENT Streaming API
```javascript
var levnet = require('../../.')
  , net = require('net')

var PORT = 9988
var stream = net.connect(PORT)
var levdb = levnet().connect(stream)

levdb.on('connection', function () {
  levdb.put('Yavin', 'Corsusca', function(err) {
    if (err) console.log(err)

    levdb.put('Boba', 'Fett', function(err) {
      if (err) console.log(err)

      levdb.createReadStream().on('data', function (data) {
        console.log(data.key, '=', data.value)
        levdb.end()
      })
    })
  })
})
```


## INSTALL
```shell
npm install levelnet
```

## LICENSE
MIT
