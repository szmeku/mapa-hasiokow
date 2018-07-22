const _ = require('ramda'),
  {collection} = require('./lib/services'),
  fs = require('fs'),
  Schedules = collection('harmonogram', 'schedules');


Schedules.then(Schedules => {
  Schedules
    .find({dates: {$elemMatch: {$gt: new Date('2018-07-22'), $lt: new Date('2018-07-24')}}})
    .forEach(_.pipe(
      _.props(['street', 'number']),
      _.concat(['Katowice,']),
      _.concat(['\n']),
      _.join(' '),
      address => fs.appendFile('2018-07-23', address)
    ))
});
