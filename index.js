'use strict'

const queue  = require('queue')
const stream = require('stream')
const got    = require('got')
const toJson = require('xml2json').toJson



const get = (type, id) =>
	got(`http://www.openstreetmap.org/api/0.6/${type}/${id}`)
	.catch((err) => err)
	.then((res) => JSON.parse(toJson(res.body)).osm)



const getRelation = (id, onChild) => (next) =>
	get('relation', id).catch(next)
	.then((d) => {
		if (Array.isArray(d.relation.member)) d.relation.member
			.map((c) => ({
				  type: c.type
				, role: c.role
				, id: parseInt(c.ref)
			})).forEach(onChild)
		next()
	}).catch(next)



const getWay = (id, onNode) => (next) =>
	get('way', id).catch(next)
	.then((d) => {
		if (Array.isArray(d.way.nd)) d.way.nd
			.map((n) => ({id: parseInt(n.ref)})).forEach(onNode)
		next()
	}).catch(next)



const getNode = (id, done) => (next) =>
	get('node', id).catch(next)
	.then((d) => {
		done({
			  id:        parseInt(d.node.id)
			, latitude:  parseFloat(d.node.lat)
			, longitude: parseFloat(d.node.lon)
		})
		next()
	}).catch(next)



const flatten = module.exports = (id, concurrency) => {
	const out = new stream.PassThrough({objectMode: true})
	const tasks = queue()
	tasks.concurrency = +concurrency || 1
	tasks.on('error', (err) => out.emit('error', err))
	tasks.on('end', () => out.end())

	const onChildInRelation = (child) => {
		if (child.type === 'relation')
			tasks.push(getRelation(child.id, onChildInRelation))
		else if (child.type === 'way')
			tasks.push(getWay(child.id, onNodeInWay))
		else if (child.type === 'node')
			tasks.push(getNode(child.id, onNode))
		else out.emit('error', new Error(`unknown child type ${child.type}`))
	}
	const onNodeInWay = (node) => tasks.push(getNode(node.id, onNodeInWay))
	const onNode = (d) => out.write(d)

	tasks.push(getRelation(id, onChildInRelation))
	tasks.start()
	return out
}
