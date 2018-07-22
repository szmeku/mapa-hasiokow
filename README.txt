## Create new unique mongodb index
db.createCollection('schedules');
db.schedules.createIndex( { "hash": 1 }, { unique: true } );
