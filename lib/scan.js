const {noble, ready} = require('./ble.js')

const chalk = require('chalk')

const scan = () =>

  ready()
    .then(() => {

      noble.on('discover', (peripheral) => {

        const name = peripheral.advertisement.localName || "Unknown"

        // if it quacks like a puck, it's a puck
        const isPuck = name.indexOf('Puck.js') == 0

        const h = isPuck ? chalk.green : chalk.dim

        console.log(
          `${h(peripheral.id)} - ${name}`
        )

      })

      noble.startScanning([], false)

    })


module.exports = scan
