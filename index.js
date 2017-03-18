'use strict'

const queue = require('queue')
const stream = require('stream')
const got = require('got')
const parse = require('xml2js').parseString



const get = (type, id) =>
	got(`http://www.openstreetmap.org/api/0.6/${type}/${id}`)
	.catch((err) => err)
	.then((res) => new Promise((yay, nay) => {
		parse(res.body, (err, data) => {
			if (err) nay(err)
			else yay(data.osm)
		})
	}))



const getRelation = (id, onChild) => (next) =>
	get('relation', id).catch(next)
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
	}).catch(next)



const getWay = (id, onNode) => (next) =>
	get('way', id)
	.catch(next)
	.then((d) => {
		if (Array.isArray(d.way[0].$.nd)) {
			for (let node of d.way[0].$.nd) {
				onNode({id: parseInt(n.ref)})
			}
		}
		next()
	})
	.catch(next)



const getNode = (id, onNode) => (next) =>
	get('node', id)
	.catch(next)
	.then((d) => {
		onNode({
			id: parseInt(d.node[0].$.id),
			latitude: parseFloat(d.node[0].$.lat),
			longitude: parseFloat(d.node[0].$.lon)
		})
		next()
	})
	.catch(next)



const flatten = (id, concurrency) => {
	const out = new stream.PassThrough({objectMode: true})

	const tasks = queue()
	tasks.concurrency = +concurrency || 1
	tasks.on('error', (err) => out.emit('error', err))
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
