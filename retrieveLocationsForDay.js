const _ = require('ramda'),
    fetch = require('node-fetch'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    {promisifyFunction} = require('./lib/functions'),
    {locationByAddress} = require('./lib/locations'),
    {collection} = require('./lib/services'),
    Schedules = collection('harmonogram', 'schedules'),

    {map} = require('./lib/functional'),
    scheduleToAddressString = _.pipe(
        _.props(['street', 'number']),
        _.concat(['Katowice,']),
        _.join(' ')
    );


Schedules.then(Schedules => {

    Schedules
        .find({dates: {$elemMatch: {$gt: new Date('2019-04-07'), $lt: new Date('2019-04-09')}}})
        .toArray()
        .then(map({concurrency: 1}, _.pipe(
            scheduleToAddressString,
            locationByAddress
        )))
        .then(locations => {
            return fs.appendFile('locations_for_2019-04-08.json', JSON.stringify(locations), function () {
            });
        });

});
