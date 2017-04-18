#!/usr/bin/env node
'use strict'

const minimist = require('minimist')
const {isatty} = require('tty')
const differ = require('ansi-diff-stream')
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



const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const data = flatten(+argv._[0], 1, 1)

data
.on('error', showError)
.pipe(ndjson.stringify())
.pipe(process.stdout)



if (!argv.s && !argv.silent) {
	const clearReports = isatty(process.stderr.fd) && !isatty(process.stdout.fd)

	let reporter = process.stderr
	if (clearReports) {
		reporter = differ()
		reporter.pipe(process.stderr)
	}

	const report = (stats) => {
		reporter.write([
			stats.relation + (stats.relation === 1 ? ' relation' : ' relations'),
			stats.way + (stats.way === 1 ? ' way' : ' ways'),
			stats.node + (stats.node === 1 ? ' node' : ' nodes'),
			stats.queued + ' queued'
		].join(', ') + (clearReports ? '' : '\n'))
	}
	data.on('stats', report)
}
