const {noble, ready} = require('./ble.js')
const chalk = require('chalk')

let started

const Bridge = require('./Bridge.js')

const connect = (uuid) => {

  ready()
    .then(() => {

      noble.on('discover', (device) => {
        if(device.uuid == uuid) {

          console.log(chalk.blue(`CONNECTING to ${device.uuid}`))

          const b = new Bridge(device, 'mqtt://test.mosquitto.org')

        } else {
          console.log(`skipping ${device.uuid}`)
        }
      })

      if(!started) {
        noble.startScanning([], false)
        started = true
      }
    })
}

module.exports = connect
