## Create new unique mongodb index
db.createCollection('schedules');
db.schedules.createIndex( { "hash": 1 }, { unique: true } );

## Mongo grouping and sorting
db.schedules.aggregate([
{$group: {_id: "$street", total:{$sum: 1}}},
{$sort: {_id: 1}}
])

## how to update field without removing other
db.collection.update(  { _id:...} , { $set: {location: 'something'} }

