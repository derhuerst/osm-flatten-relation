'use strict'

const flatten = require('.')

flatten(2679163, 5, 5)
.on('relation', (relation) => console.error('relation', relation.id))
.on('way', (way) => console.error('way', way.id))
// .on('node', (node) => console.log('node', node.id))
.on('data', console.log)
.on('error', console.error)
