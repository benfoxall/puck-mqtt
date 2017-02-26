const {noble, ready} = require('./ble.js')
const LineParser = require('line-parser')
const atob = require('atob')
const btoa = require('btoa')
const chalk = require('chalk')
const mqtt = require('mqtt')

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

const subRE = /<~([a-zA-Z0-9+]+={0,2})~>/

const setupConnection = (tx, rx) => {

  const client = mqtt.connect('mqtt://test.mosquitto.org')

  // proxy messsages
  client.on('message', (topic, message) => {
    const payload = `\n;((fn, a, b)=>{ if(fn) fn(atob(a), atob(b)) })(this.MQTT_handle, '${btoa(topic)}', '${btoa(message)}');\n`
    send(payload, tx)
  })

  const parser = new LineParser()
  parser.on('line', (line) => {
    // console.log("line: "+chalk.bgWhite(line))

    const match = line.match(subRE)
    if(match){
      try {
        const payload = atob(match[1])
        handlePayload(payload, client)

      } catch (e) {
        console.error("error parsing payload", line, e)
      }
    }
  })

  rx.on('data', data =>
    parser.chunk(data.toString())
  )
  rx.notify(true)

  // echo back the subscribed channels
  setTimeout(() => {
    send(";(this.MQTT_subs||[]).forEach(s => console.log('\n<~' + btoa(s) + '~>\n'));\n", tx)
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


const handlePayload = (payload, client) => {
  const gap = payload.indexOf(' ')
  if(gap > 0) {
    const topic = payload.substr(0,gap)
    const message = payload.substr(gap + 1)

    console.log("PUBLISH")
    console.log("TOPIC " + chalk.bgGreen(topic))
    console.log("DATA  " + chalk.bgGreen(message))

    client.publish(topic, message, err => console.log(err?"published":"error"))

  } else {
    console.log("SUBSCRIBE")
    console.log("TOPIC " + chalk.bgGreen(payload))

    client.subscribe(payload, err => console.log(err?"subscribed":"error"))
  }
}



module.exports = connect
