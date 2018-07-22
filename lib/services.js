'use strict';

const _ = require('ramda'),
  Promise = require('bluebird'),
  moment = _.curryN(2, require('moment')),
  fetch = require('node-fetch'),
  {promisifyFunction} = require('./functions'),
  {encodeParamsAsFormUrlAndPost} = require('./http'),
  cheerio = require('cheerio'),
  streetsUrl = 'http://mpgk.com.pl/dla-mieszkancow/',
  numbersUrl = 'http://mpgk.com.pl/wp-content/plugins/harmonogram-odpadow/include/data.php?type=numbers',
  datesUrl = 'http://mpgk.com.pl/wp-content/plugins/harmonogram-odpadow/include/data.php?type=timetable',

  MongoClient = require('mongodb').MongoClient,
  {mongoUrl} = require('../config'),

  streets = _.pipeP(
    () => fetch(streetsUrl),
    resp => resp.text(),
    text => /\#ho\-street.*autocomplete.*[\n\r]*.*source: (\[.*\])/gi.exec(text),
    _.nth(1),
    JSON.parse,
    _.pluck('value'),
    _.tap((v) => console.log(`LOG, streets downloaded ${JSON.stringify(_.take(10)(v))} ...`))
  ),

  numbersForStreet = _.pipeP(
    promisifyFunction(_.objOf('street')),
    encodeParamsAsFormUrlAndPost(numbersUrl),
    p => p.json(),
    _.pluck('value'),
    _.tap((v) => console.log(`LOG, numbers downloaded ${JSON.stringify(_.take(10)(v))} ...`))
  ),

  someDelayedFunc = () => Promise.delay(2000).then(() => console.log('someDelayedFunc resolved')),

  datesForStreetAndNumber = _.pipeP(
    promisifyFunction(encodeParamsAsFormUrlAndPost(datesUrl)),
    p => p.text(),
    cheerio.load,
    $ => $('[item-type="Odpady wielkogabarytowe dla zabudowy wielorodzinnej"]')
      .parent()
      .find('.future').toArray(),
    _.map(_.pipe(
      _.path(['children', '0', 'data']),
      v => new Date(v)
    )),
    _.tap((v) => console.log(`LOG, dates downloaded ${JSON.stringify(_.take(10)(v))} ...`))
  ),

  collection = (dbName, collectionName) => MongoClient.connect(mongoUrl)
    .then(client => [client, client.db(dbName)])
    .then(([client, db]) => [client, db.collection(collectionName)])
    .then(([client, collection]) => ({
      insertMany: (list) => collection.insertMany(list).then(() => ({closeConnection: () => client.close()})),
      insert: (item) => collection.insert(item).then(() => ({closeConnection: () => client.close()})),
      insertAndIgnoreDuplicateHashError: (item) => collection
        .insert(item)
        .then(() => ({closeConnection: () => client.close()}))
        .catch(_.cond([
          [_.propEq('code', 11000), () => console.log('Log: duplicate hash ignored')],
          [_.T, Promise.reject],
        ])),
      find: (query) => collection.find(query)
    }));


module.exports = {
  streets,
  // numbersForStreet: someDelayedFunc ,
  numbersForStreet,
  datesForStreetAndNumber,
  collection
};
