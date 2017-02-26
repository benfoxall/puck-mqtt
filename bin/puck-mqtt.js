#!/usr/bin/env node

const program = require('commander')
const version = require('../package.json').version
const chalk   = require('chalk')

const pmqt = require('../')

const gather = (val, set) => set.add(val)

program
  .version(version)
  .option('-h, --host <hostname>', 'The MQTT host to connect to')
  .option('-p, --puck [puck]', 'A particular puck. eg f045', gather, new Set)
  .parse(process.argv)


const host = program.host || 'test.mosquitto.org'
const puck = program.puck

console.log(chalk.cyan(`
 Forwarding ${puck.size ? Array.from(puck) : 'any pucks'} to ${host}
`))

pmqt.scan2(puck, host)
