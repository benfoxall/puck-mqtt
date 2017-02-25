// const services = [
//   '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
//   '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
//   '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
//   // 6e400001b5a3f393e0a9e50e24dcca9e
// ]

const config = {
  UART: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  TX:   '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  RX:   '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
}

Object.keys(config).forEach(k => config[k] = config[k].replace(/-/g, ''))

console.log(">>>,", config)

// const services_n = services.map(s => s.replace('-',''))


var noble = require('noble')


const connections = []

setInterval(function(){

  console.log(`sending to ${connections.length}`)

  ;[
    'LED1.write(1)',
    'LED2.write(1)',
    'LED3.write(1)',
    'LED1.write(0)',
    'LED2.write(0)',
    'LED3.write(0)'
  ].forEach( (command, i) => {
    setTimeout(() => {

      // console.log("sending: ", command)
      connections.forEach(chrWrite => {
        chrWrite.write(toBuffer(command + ';\n'), false, () => {
          console.log("sent")
        })
      })

    }, 500 * i)

  })

}, 5000)


'stateChange scanStart scanStop data'.split(' ').forEach(m => {
  noble.on(m, console.log.bind(console, m + ':>>: '));
})

noble.on('discover', (peripheral) => {

  console.log(peripheral.advertisement.localName, peripheral.id)

  var name = peripheral.advertisement.localName || "Unknown"

  if(name.indexOf('Puck.js') === 0) {
    console.log("trying to connect to a puck")

    peripheral.connect()



    peripheral.once('connect', (per) => {
      console.log("CONNECTED", per)

      peripheral.discoverAllServicesAndCharacteristics((err, services, characteristics) => {
        if(err) throw err

        console.log("[---")
        console.log("Services: \n" + "["+services+"]")
        console.log("Characteristics: \n" + "[" + characteristics + "]")
        console.log("---]")

        var chrRead
        var chrWrite
        services.forEach(function(s, serviceId) {
          console.log("checjing:" + s.uuid)
          if (s.uuid == config.UART) {
            console.log("FOUND UART")
            s.characteristics.forEach(function(ch, charId) {

              if (ch.uuid === config.RX) {
                chrRead = ch
                console.log("FOUND READ")
              }
              if (ch.uuid === config.TX) {
                chrWrite = ch
                console.log("FOUND WRITE")
              }

              if(chrRead && chrWrite) {
                console.log("WRITING STUFF")

                chrRead.on('data', (d)=>{
                  console.log("recieved: ", d.toString())
                })
                chrRead.notify(true)

                connections.push(chrWrite)

                chrWrite.write(toBuffer('LED1.write(1)\n'), false, () => {})

                // ;[
                //   'LED1.write(1)',
                //   'LED2.write(1)',
                //   'LED3.write(1)',
                //   'LED1.write(0)',
                //   'LED2.write(0)',
                //   'LED3.write(0)'
                // ].forEach( (command, i) => {
                //   setTimeout(() => {
                //
                //     console.log("sending: ", command)
                //     chrWrite.write(toBuffer(command + ';\n'), false, () => {
                //       console.log("sent")
                //     })
                //
                //   }, 500 * i)
                //
                // })

                //
                //
                // chrWrite.write(toBuffer("LED1.write(0);\n"), false, () => {
                //
                //   console.log("Wrote");
                //
                //   chrWrite.write(toBuffer("LED2.write(0);\n"), false, () => {
                //     console.log("ang again")
                //
                //     chrWrite.write(toBuffer("console.log('h');\n"), false, () => {
                //         console.log("nd consoled")
                //     })
                //   })
                // })


              }
            })
          }
        })
      })

    })
  }
})

function toBuffer(string) {
  var buf = new Buffer(string.length)
  for (var i = 0; i < buf.length; i++) {
    buf.writeUInt8(string.charCodeAt(i), i)
  }
  return buf
}







noble.on('stateChange', (state) => {
  console.log(`STATE ${state}`)

  setTimeout(function() {
    console.log("Starting scanning...")
    // noble.startScanning([], true)
    // noble.startScanning(services, true)
    noble.startScanning([], false)

    // noble.startScanning(services, true, (err, data) => {
    //   console.log("Scan result:", err, data)
    // })
  }, 1000)


})
//
//
// noble.on('scanStart', (callback) => {
//   console.log("Started scanning", callback)
// })
//
// noble.on('warning', console.log.bind(console, 'warning: '));
// //
