import test from 'tape'
import {flattenOsmRelation as flatten} from './index.js'

test('works', (t) => {
	flatten(2679163, 5, 5)
	.on('error', (err) => t.ifError(err))
	.on('data', (d) => {
		t.equal(typeof d.id,        'number', 'node id is not a number')
		t.equal(typeof d.latitude,  'number', 'node latitude is not a number')
		t.equal(typeof d.longitude, 'number', 'node longitude is not a number')
	})
	.on('end', () => t.end())
})

test('has no duplicates', (t) => {
	const hasNode = Object.create(null)

	flatten(6593456)
	.on('error', t.ifError)
	.on('data', (n) => {
		if (hasNode[n.id]) t.fail(`node ${n.id} emitted twice`)
		else {
			t.pass(`node ${n.id} emitted for the first time`)
			hasNode[n.id] = true
		}
	})
	.once('end', () => t.end())
})
