var levnet = require('../.')

var PORT = 9988
var lv = levnet()

lv.connect(PORT)

function emitGets() {
  var key = 'hans'

  lv.put(key, 'fuckingSOLO', function(err) {
    if (err) return console.log(err)

    lv.get(key, function (err, value) {
      if (err) return console.log('Oh Shit!', err) // likely the key was not found
      return console.log(key, '=', value)
    })


  })

}

setTimeout(emitGets, 1000)
