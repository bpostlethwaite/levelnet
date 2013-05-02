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

  lev.on('error', function () {
    stream.destroy()
  })
  stream.on('error', function () {
    lev.destroy()
  })
}


