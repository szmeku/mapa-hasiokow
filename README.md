## How to setup mapa hasiokow

1. Run mongo locally
docker run --name hasioki --rm -d -p 27017:27017 mongo
2. Copy config-example.json to config.json and put your google token

## useful docker commands
- execute command in docker container with interactive terminal
`docker exec -it hasioki /bin/bash`
- export mongo collection to csv
`mongoexport --host localhost --db harmonogram --collection schedules --csv --out text.csv --fields street,number,dates`

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
