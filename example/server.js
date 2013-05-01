var levelup = require('levelup')
  , db = levelup('./mydb')
  , net = require('net')
  , levnet = require('../.')

var PORT = 9988
var leveltcp = levnet(db)
var server = net.createServer(leveltcp).listen(PORT)


