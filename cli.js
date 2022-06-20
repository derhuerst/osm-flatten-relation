#!/usr/bin/env node

// todo: use import assertions once they're supported by Node.js & ESLint
// https://github.com/tc39/proposal-import-assertions
import {createRequire} from 'module'
const require = createRequire(import.meta.url)

import mri from 'mri'
import {isatty} from 'tty'
import differ from 'ansi-diff-stream'
import {stringify as asNdjson} from 'ndjson'
import {flattenOsmRelation as flatten} from './index.js'
const pkg = require('./package.json')

const argv = mri(process.argv.slice(2), {
	boolean: ['help', 'h', 'version', 'v', 'silent', 's']
})



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
.pipe(asNdjson())
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
