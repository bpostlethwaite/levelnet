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