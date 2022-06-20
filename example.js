import {flattenOsmRelation as flatten} from './index.js'

flatten(5885313, 5, 5)
.on('stats', (stats) => console.error(stats))
// .on('relation', (relation) => console.error('relation', relation.id))
// .on('way', (way) => console.error('way', way.id))
// .on('node', (node) => console.error('node', node.id))
.on('data', console.log)
.on('error', console.error)
