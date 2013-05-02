var levelup = require('levelup')
  , db = levelup('./mydb')
  , net = require('net')
  , levnet = require('../.')

var PORT = 9988

  , server = net.createServer(handler).listen(PORT)

function handler(stream) {
    var levdb = levnet(db, stream)


  // levdb.on('error', function () {
  //   stream.destroy()
  // })
  // stream.on('error', function () {
  //   levdb.destroy()
  // })

}


