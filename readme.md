# osm-flatten-relation

**Resolve an [OpenStreetMap](http://www.openstreetmap.org) relation recursively.**

[![npm version](https://img.shields.io/npm/v/osm-flatten-relation.svg)](https://www.npmjs.com/package/osm-flatten-relation)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/osm-flatten-relation.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installing

```
npm install osm-flatten-relation
```


## Usage

From the command line:

```
osm-flatten-relation 2679163 >nodes.ndjson
```

As a JavaScript library:

```js
flatten(relation, concurrency = 4, retries = 3)
```

`flatten` returns a [readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) of a [relation](http://wiki.openstreetmap.org/wiki/Elements#Relation)'s [ways](http://wiki.openstreetmap.org/wiki/Elements#Way) and [nodes](http://wiki.openstreetmap.org/wiki/Elements#Node). It will also emit the events `relation`, `way` and `node` whenever it fetched data.

*Note*: With `concurrency > 1`, nodes will *not* be emitted in breadth-first order anymore.

### Example

To get all nodes of [*U-Bahnlinie U6: Alt-Mariendorf => Alt-Tegel*](http://www.openstreetmap.org/relation/2679163) with a `concurrency` of `5` requests:

```js
const flatten = require('osm-flatten-relation')

flatten(2679163, 5)
.on('data', console.log)
```

```js
{id: 3043920508, latitude: 52.439691,  longitude: 13.3877031}
{id: 31034998,   latitude: 52.4537104, longitude: 13.3843233}
// …
{id: 1688279730, latitude: 52.439011,  longitude: 13.3878563}
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/osm-flatten-relation/issues).
