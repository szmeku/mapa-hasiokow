'use strict';

const _ = require('ramda'),
  Promise = require('bluebird'),
  {promisifyFunction} = require('./lib/functions'),
  {map} = require('./lib/functional'),
  {streets, numbersForStreet, datesForStreetAndNumber, collection} = require('./lib/services'),
  Schedules = collection('harmonogram', 'schedules');

Promise.all([Schedules, streets()]).then(([Schedules, streets]) => {

  _.pipeP(
    map({concurrency: 1}, _.pipe(
      _.juxt([
        _.pipe(_.objOf('street'), _.merge),
        _.pipeP(numbersForStreet, _.map(_.objOf('number')))
      ]),
      Promise.all,
      promisifyFunction(_.apply(_.map)),
      promisifyFunction(map({concurrency: 3}, _.pipe(
        _.juxt([
          _.identity,
          _.pipe(_.values, _.join('|'), _.objOf('hash')),
          _.pipe(datesForStreetAndNumber, promisifyFunction(_.objOf('dates')))
        ]),
        Promise.all,
        promisifyFunction(_.mergeAll),
        promisifyFunction(Schedules.insertAndIgnoreDuplicateHashError)
        ))
      )
    ))
  )(streets);
});
