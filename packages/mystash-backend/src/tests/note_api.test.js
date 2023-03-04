var request = require('supertest')
var express = require('express')

var app = express()

app.get('', function (req, res, next) {
  res.statusCode = 200
  res.end()
})

describe('app js test', function () {
  describe('GET /', function () {
    it('should respond to GET with empty path', function (done) {
      request(app)
        .get('')
        .expect(200)
        .end(done)
    })
  })
})
