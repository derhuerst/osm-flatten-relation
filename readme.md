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

`flatten(relation, [concurrency])`

*Note*: With `concurrency > 1`, nodes will *not* be emitted in breadth-first order anymore.

### Example

To get all nodes of [*U-Bahnlinie U6: Alt-Mariendorf => Alt-Tegel*](http://www.openstreetmap.org/relation/2679163) with a `concurrency` of `5` requests.

```js
const flatten = require('osm-flatten-relation')

flatten(2679163, 5)
.on('data', (node) => console.log(node))
```

```js
{id: 3043920508, latitude: 52.439691,  longitude: 13.3877031}
{id: 31034998,   latitude: 52.4537104, longitude: 13.3843233}
// …
{id: 1688279730, latitude: 52.439011,  longitude: 13.3878563}
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/osm-flatten-relation/issues).
