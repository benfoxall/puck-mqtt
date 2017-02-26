#!/usr/bin/env node

const program = require('commander')
const version = require('../package.json').version

const pmqt = require('../')

program
  .command('scan')
  .action(() => pmqt.scan())

program
  .command('connect [Address...]')
  .action(pucks => {
    pucks.forEach(puck => {
      console.log('TODO: connect %s', puck);
    })
  })

program
  .version(version)
  .parse(process.argv)