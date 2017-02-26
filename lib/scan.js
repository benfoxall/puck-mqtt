const {noble, ready} = require('./ble.js')

const Bridge = require('./Bridge.js')

const chalk = require('chalk')

const scan = (puck, host) =>

  ready()
    .then(() => {

      noble.on('discover', (peripheral) => {

        const name = peripheral.advertisement.localName || "Unknown"

        // if it quacks like a puck, it's a puck
        const isPuck = name.indexOf('Puck.js') == 0

        // do we accept this based on the filter?
        const accept = puck.size ?
          puck.has(name) || puck.has(peripheral.id) :
          true

        const h = !isPuck ? chalk.dim :
                   accept ? chalk.green :
                   chalk.yellow

        console.log(
          `${h(peripheral.id)} ${chalk.underline(name)}`
        )

        if(isPuck && !accept) {
          console.log("⬆︎ puck was found, but didn't match filter")
        }

        if(isPuck && accept) {
          console.log(chalk.green(`⬆︎ connecing puck to ${host}`))
          const bridge = new Bridge(peripheral, host)
        }
      })

      noble.startScanning([], false)

    })


module.exports = scan
