#!/usr/bin/env node
'use strict'

const minimist = require('minimist')
const esc = require('ansi-escapes')
const ndjson = require('ndjson')

const pkg = require('./package.json')
const flatten = require('.')

const argv = minimist(process.argv.slice(2))



if (argv.h || argv.help) {
	process.stdout.write(`\
${pkg.name} <id> >data.ndjson

${pkg.description}

Options:
	-s, --silent    Don't report stats on stderr.
`)
	process.exit(0)
}

if (argv.v || argv.version) {
	process.stdout.write(pkg.name + ' ' + pkg.version + '\n')
	process.exit(0)
}

if (!argv._[0]) {
	process.stdout.write('Missing OSM id.\n')
	process.exit(1)
}



const report = (stats) => process.stderr.write([
	esc.eraseLine,
	esc.cursorTo(0),
	[
		stats.relation + (stats.relation === 1 ? ' relation' : ' relations'),
		stats.way + (stats.way === 1 ? ' way' : ' ways'),
		stats.node + (stats.node === 1 ? ' node' : ' nodes'),
		stats.queued + ' queued'
	].join(', ')
].join(''))

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const data = flatten(+argv._[0], 1, 1)
if (!argv.s && !argv.silent) {
	data.on('stats', report)
	data.on('end', () => process.stderr.write('\n'))
}
data.on('error', showError)

data
.pipe(ndjson.stringify())
.pipe(process.stdout)
