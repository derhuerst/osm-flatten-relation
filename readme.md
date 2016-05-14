# osm-flatten-relation

**Resolve an [OpenStreetMap](http://www.openstreetmap.org) relation recursively.** Returns a [readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) of a [relation](http://wiki.openstreetmap.org/wiki/Elements#Relation)'s [ways](http://wiki.openstreetmap.org/wiki/Elements#Way) and [nodes](http://wiki.openstreetmap.org/wiki/Elements#Node).

[![npm version](https://img.shields.io/npm/v/osm-flatten-relation.svg)](https://www.npmjs.com/package/osm-flatten-relation)
[![build status](https://img.shields.io/travis/derhuerst/osm-flatten-relation.svg)](https://travis-ci.org/derhuerst/osm-flatten-relation)
[![dependency status](https://img.shields.io/david/derhuerst/osm-flatten-relation.svg)](https://david-dm.org/derhuerst/osm-flatten-relation)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/osm-flatten-relation.svg)](https://david-dm.org/derhuerst/osm-flatten-relation#info=devDependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/osm-flatten-relation.svg)


## Installing

```
npm install osm-flatten-relation
```


## Usage

```js
const flatten = require('osm-flatten-relation')

flatten(4639168).on('data', console.log)
// todo
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/osm-flatten-relation/issues).
