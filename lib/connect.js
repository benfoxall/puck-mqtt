const {noble, ready} = require('./ble.js')

const chalk = require('chalk')
let started

const connect = (uuid) => {

  ready()
    .then(() => {

      noble.on('discover', (device) => {
        if(device.uuid == uuid) {
          console.log(`connecting to ${device.uuid}`)
          connectDevice(device)
            .then(({rx,tx}) => {
              console.log("connected")

              setupConnection(tx,rx)
            })
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


// noble doesn't use dashes
const to_noble = s => s.replace(/[^0-f]/g, '')

const UART = to_noble('6e400001-b5a3-f393-e0a9-e50e24dcca9e')
const TX   = to_noble('6e400002-b5a3-f393-e0a9-e50e24dcca9e')
const RX   = to_noble('6e400003-b5a3-f393-e0a9-e50e24dcca9e')

const connectDevice = device => new Promise((resolve, reject) => {
  device.connect()
  device.once('connect', () => {
    device.discoverAllServicesAndCharacteristics(
      (err, services, characteristics) => {
        if(err) return reject(err)

        const uart = services.find(item => item.uuid == UART)

        if(!uart) return reject("Couldn't find UART service")

        const tx = uart.characteristics.find(item => item.uuid == TX)
        const rx = uart.characteristics.find(item => item.uuid == RX)

        if(!(tx && rx)) return reject("Couldn't find TX/RX services")

        resolve({tx, rx})

    })
  })
})

const setupConnection = (tx, rx) => {

  rx.on('data', d => {
    console.log(chalk.cyan(d.toString()))
  })
  rx.notify(true)

  setTimeout(() => {
    send('console.log("Hello from puck.js");\n', tx)
  }, 500)

}

const send = (string, tx) => {
  if(!string.length) return Promise.resolve()

  return new Promise((resolve, reject) => {
    console.log(chalk.yellow(string.slice(0,20)))

    const buffer = Buffer.from(
      string.slice(0,20), 'ascii'
    )

    tx.write(buffer, false, err => {
      if(err) reject(err)
      resolve()
    })
  })
  .then(() =>
    send(string.slice(20), tx)
  )
}


module.exports = connect
