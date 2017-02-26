const {noble, ready} = require('./ble.js')

let started

const connect = (uuid) => {

  ready()
    .then(() => {

      noble.on('discover', (peripheral) => {
        if(peripheral.uuid == uuid) {
          console.log("START CONNECTING")
        } else {
          console.log(`skipping ${peripheral.uuid}`)
        }
      })

      if(!started) {
        noble.startScanning([], false)
        started = true
      }
    })
}

module.exports = connect
