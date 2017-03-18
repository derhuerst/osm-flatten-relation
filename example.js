'use strict'

const flatten = require('.')

flatten(2679163, 5, 5)
.on('data', console.log)
.on('error', console.error)
