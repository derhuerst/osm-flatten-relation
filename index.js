'use strict'

const queue = require('queue')
const stream = require('stream')
const got = require('got')
const parse = require('xml2js').parseString



const get = (type, id) =>
	got(`http://www.openstreetmap.org/api/0.6/${type}/${id}`)
	.then((res) => new Promise((yay, nay) => {
		parse(res.body, (err, data) => {
			if (err) nay(err)
			else yay(data.osm)
		})
	}))



const getRelation = (id, onChild) => (next) =>
	get('relation', id)
	.then((d) => {
		if (Array.isArray(d.relation[0].member))
			d.relation[0].member
			.map((c) => ({
				  type: c.$.type
				, role: c.$.role
				, id: parseInt(c.$.ref)
			}))
			.forEach(onChild)
		next()
	})
	.catch(next)



const getWay = (id, onNode) => (next) =>
	get('way', id)
	.then((d) => {
		if (Array.isArray(d.way[0].nd)) {
			for (let node of d.way[0].nd) {
				onNode({id: parseInt(node.$.ref)})
			}
		}
		next()
	})
	.catch(next)



const getNode = (id, onNode) => (next) =>
	get('node', id)
	.then((d) => {
		onNode({
			id: parseInt(d.node[0].$.id),
			latitude: parseFloat(d.node[0].$.lat),
			longitude: parseFloat(d.node[0].$.lon)
		})
		next()
	})
	.catch(next)



const flatten = (id, concurrency = 4, retries = 3) => {
	const out = new stream.PassThrough({objectMode: true})

	const tasks = queue()
	tasks.concurrency = parseInt(concurrency)
	tasks.on('error', (err, task) => {
		if (!task.retries) task.retries = 1

		if (task.retries >= retries) out.emit('error', err)
		else tasks.push(task)
	})
	tasks.on('end', () => out.end())

	const onChildInRelation = (child) => {
		if (child.type === 'relation') {
			tasks.push(getRelation(child.id, onChildInRelation))
		} else if (child.type === 'way') {
			tasks.push(getWay(child.id, (node) => {
				tasks.push(getNode(node.id, onNode))
			}))
		} else if (child.type === 'node') {
			tasks.push(getNode(child.id, onNode))
		} else {
			out.emit('error', new Error(`unknown child type ${child.type}`))
		}
	}
	const onNode = (d) => out.write(d)

	tasks.push(getRelation(id, onChildInRelation))
	tasks.start()

	return out
}

module.exports = flatten
