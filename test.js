'use strict'

const test    = require('tape')
const flatten = require('./index')

test('integration test', (t) => {
	flatten(2679163, 5)
	.on('error', (err) => t.fail(err.message))
	.on('data', (d) => {
		t.equal(typeof d.id,        'number', 'node id is not a number')
		t.equal(typeof d.latitude,  'number', 'node latitude is not a number')
		t.equal(typeof d.longitude, 'number', 'node longitude is not a number')
	})
	.on('end', () => t.end())
})
