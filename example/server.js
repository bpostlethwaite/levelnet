var levelup = require('levelup')
  , db = levelup('./testdb')
  , net = require('net')
  , levnet = require('../.')

var PORT = 9988
var levdb = levnet(db)
  , server = net.createServer(handler).listen(PORT)

function handler(stream) {

  stream.pipe(levdb).pipe(stream)

  // levdb.on('error', function () {
  //   stream.destroy()
  // })
  // stream.on('error', function () {
  //   levdb.destroy()
  // })

}


