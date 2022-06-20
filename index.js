import queue from 'queue'
import {Readable} from 'stream'
import createFetch from 'fetch-ponyfill'
import Promise from 'pinkie-promise'
import {parseString as parse} from 'xml2js'

const {fetch} = createFetch({Promise})

const get = (type, id) => {
	return fetch(`http://www.openstreetmap.org/api/0.6/${type}/${id}`, {
		redirect: 'follow',
		headers: {
			accept: 'text/xml',
			'user-agent': 'https://github.com/derhuerst/osm-flatten-relation'
		}
	})
	.then((res) => {
		if (!res.ok) {
			const err = new Error(res.statusText)
			err.statusCode = res.status
			throw err
		}
		return res.text()
	})
	.then((data) => new Promise((yay, nay) => {
		parse(data, (err, data) => {
			if (err) nay(err)
			else yay(data.osm)
		})
	}))
}

const getRelation = (id, onChild, count) => (next) =>
	get('relation', id)
	.then((d) => {
		count('relation')

		if (Array.isArray(d.relation[0].member))
			d.relation[0].member
			.map((c) => ({
				type: c.$.type,
				role: c.$.role,
				id: parseInt(c.$.ref),
			}))
			.forEach(onChild)
		next()
	})
	.catch(next)

const getWay = (id, onNode, count) => (next) =>
	get('way', id)
	.then((d) => {
		count('way')

		if (Array.isArray(d.way[0].nd)) {
			for (let node of d.way[0].nd) {
				onNode({id: parseInt(node.$.ref)})
			}
		}
		next()
	})
	.catch(next)

const getNode = (id, onNode, count) => (next) =>
	get('node', id)
	.then((d) => {
		count('node')

		onNode({
			id: parseInt(d.node[0].$.id),
			latitude: parseFloat(d.node[0].$.lat),
			longitude: parseFloat(d.node[0].$.lon)
		})
		next()
	})
	.catch(next)

const flattenOsmRelation = (id, concurrency = 4, retries = 3) => {
	const out = new Readable({
		objectMode: true,
		read: () => {}
	})

	const tasks = queue()
	tasks.concurrency = concurrency
	tasks.on('error', (err, task) => {
		if (!task.retries) task.retries = 1

		if (task.retries >= retries) out.destroy(err)
		else tasks.push(task)
	})
	tasks.on('end', () => out.push(null))

	const stats = {
		relation: 0,
		way: 0,
		node: 0
	}
	const count = (type) => {
		stats[type]++
		const data = Object.assign({queued: tasks.length - 1}, stats)
		out.emit('stats', data)
	}

	const onChildInRelation = (child) => {
		out.emit(child.type, child)

		if (child.type === 'relation') {
			tasks.push(getRelation(child.id, onChildInRelation, count))
		} else if (child.type === 'way') {
			const onNodeInWay = (node) => {
				tasks.push(getNode(node.id, onNode, count))
			}
			tasks.push(getWay(child.id, onNodeInWay, count))
		} else if (child.type === 'node') {
			tasks.push(getNode(child.id, onNode, count))
		} else {
			out.destroy(new Error(`unknown child type ${child.type}`))
		}
	}

	const hasNodes = Object.create(null)
	const onNode = (n) => {
		if (!hasNodes[n.id]) {
			hasNodes[n.id] = true
			out.push(n)
		}
	}

	tasks.push(getRelation(id, onChildInRelation, count))
	tasks.start()

	return out
}

export {
	flattenOsmRelation,
}
