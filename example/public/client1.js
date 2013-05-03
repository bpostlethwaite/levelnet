var levnet = require('../../.')
  , net = require('net')

var PORT = 9988
  , stream = net.connect(PORT)

var lev = levnet.client()

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


stream.pipe(lev).pipe(stream)

