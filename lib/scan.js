const noble = require('noble')
const chalk = require('chalk')

const ready = () => {
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

const scan = () =>

  ready()
    .then(delay(100))
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
