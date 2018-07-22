'use strict';

const fetch = require('node-fetch'),
  _ = require('ramda'),
  querystring = require('querystring'),

  encodeParamsAsFormUrlAndPost = _.curryN(2, (url, params) => {

    return fetch(url, _.merge({
      credentials: 'same-origin',
      method: 'post',
      body: querystring.stringify(params),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }, params))
      .then(resp => {
        if (resp.status === 200) {
          return resp
        }
      })
  });

module.exports = {
  encodeParamsAsFormUrlAndPost
};
