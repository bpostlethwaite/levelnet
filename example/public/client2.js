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

