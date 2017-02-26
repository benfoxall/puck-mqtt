const LineParser = require('line-parser')
const atob = require('atob')
const btoa = require('btoa')
const chalk = require('chalk')
const mqtt = require('mqtt')


// create a bridge between a ble peripheral and mqtt
class Bridge {

  constructor(device, mqtt_host) {
    this.device = device

    const ble    = new BLE(device)
    const client = mqtt.connect(mqtt_host)

    ble.on('message', payload => {
      const gap = payload.indexOf(' ')
      if(gap > 0) {
        const topic = payload.substr(0, gap)
        const message = payload.substr(gap + 1)
        console.log("publish", topic, message)
        client.publish(topic, message)

      } else {
        console.log("subscribe", payload)
        client.subscribe(payload)
      }
    })


    client.on('message', (topic, message) => {
      const payload = `\n;((fn, a, b)=>{ if(fn) fn(atob(a), atob(b)) })(this.MQTT_handle, '${btoa(topic)}', '${btoa(message)}');\n`
      ble.send(payload)
    })


    // trigger ble to broadcast subscriptions
    ble.send(";(this.MQTT_subs||[]).forEach(s => console.log('<~'+btoa(s)+'~>'));\n")
  }

}


const to_noble = s => s.replace(/[^0-f]/g, '')

const UART = to_noble('6e400001-b5a3-f393-e0a9-e50e24dcca9e')
const TX   = to_noble('6e400002-b5a3-f393-e0a9-e50e24dcca9e')
const RX   = to_noble('6e400003-b5a3-f393-e0a9-e50e24dcca9e')

const messageRE = /<~([a-zA-Z0-9+]+={0,2})~>/


class BLE {
  constructor(device) {
    this.device = device
    this.sendQueue = []

    this.callbacks = []

    this.connect()
  }

  on(type, callback) {
    if(type=='message') this.callbacks.push(callback)
  }

  send(message) {
    // todo - sending multiple messages at same time
    // will break things

    if(!this.tx) {
      this.sendQueue.push(message)
      return Promise.resolve()
    }

    if(!message.length) return Promise.resolve()

    return new Promise((resolve, reject) => {

      const buffer = Buffer.from(
        message.slice(0,20), 'ascii'
      )

      this.tx.write(buffer, false, err => {
        if(err) reject(err)
        resolve()
      })
    })
    .then(() =>
      this.send(message.slice(20))
    )
  }

  connect() {

    // request BLE connection
    return new Promise((resolve, reject) => {
      this.device.connect()
      this.device.once('connect', () => {
        this.device.discoverAllServicesAndCharacteristics(
          (err, services, characteristics) => {
            if(err) return reject(err)

            const uart = services.find(item => item.uuid == UART)

            if(!uart) return reject("Couldn't find UART service")

            const tx = uart.characteristics.find(item => item.uuid == TX)
            const rx = uart.characteristics.find(item => item.uuid == RX)

            if(!(tx && rx)) return reject("Couldn't find TX/RX services")

            this.tx = tx
            this.rx = rx
            resolve()
        })
      })
    })

    .then(() => {

      // listen for events
      const parser = new LineParser()
      parser.on('line', (line) => {
        const match = line.match(messageRE)
        if(match){
          try {
            this.handleMessage(atob(match[1]))
          } catch (e) {
            console.error("error handling payload", line, e)
          }
        }
      })

      this.rx.on('data', data =>
        parser.chunk(data.toString())
      )
      this.rx.notify(true)

    })

    .then(() => {
      // send off any queued messages
      var allMessages = this.sendQueue.join('')
      this.sendQueue = []
      this.send(allMessages)
    })
  }

  handleMessage(message) {
    this.callbacks.forEach(cb => cb(message))
  }

}

module.exports = Bridge
