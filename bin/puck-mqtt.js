#!/usr/bin/env node

const program = require('commander')
const version = require('../package.json').version
const chalk   = require('chalk')

const gather = (val, set) => set.add(val)

program
  .version(version)
  .option('-h, --host <hostname>', 'The MQTT host to connect to')
  .option('-p, --puck [puck]', 'A particular puck. eg f045', gather, new Set)
  .option('-d, --debug')
  .parse(process.argv)

if(program.debug) {
  process.env.DEBUG = 'puck-mqtt:*'
}


const pmqt = require('../')

const host = program.host || 'mqtt://test.mosquitto.org'
const puck = program.puck

console.log(chalk.cyan(`
➥ Forwarding ${puck.size ? Array.from(puck) : 'any pucks'} to ${host}
`))

// add normalised puck names
Array.from(puck)
  .filter(n => n.match(/^[0-f]{4}$/))
  .forEach(n => puck.add(`Puck.js ${n.toLowerCase()}`))

pmqt(puck, host)
