const noble = require('noble')

const poweredOn = () => {
  if(noble.state == 'poweredOn')
    return Promise.resolve()

  return new Promise(resolve => {
    noble.once('stateChange', state => {
      if(state == 'poweredOn') resolve()
    })
  })
}

const delay = millis => new Promise(
  resolve => setTimeout(resolve, millis)
)

const ready = () =>
  poweredOn().then(delay(100))

module.exports.noble = noble
module.exports.ready = ready
