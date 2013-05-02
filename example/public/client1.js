var levnet = require('../../.')
  , net = require('net')

var PORT = 9988
  , stream = net.connect(PORT)
  , levdb = levnet()

levdb.on('levelup', function () {
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


stream.pipe(levdb).pipe(stream)

