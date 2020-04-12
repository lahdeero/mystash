My-stash 
============

[![Build Status](https://travis-ci.com/lahdeero/mystash-backend.svg?branch=master)](https://travis-ci.com/lahdeero/mystash-backend)
[![GitHub license](	https://img.shields.io/github/license/lahdeero/mystash-backend.svg)](https://github.com/lahdeero/mystash-backend/blob/master/LICENSE)
[![Last version](https://img.shields.io/github/tag-date/lahdeero/mystash-backend.svg)](https://github.com/lahdeero/mystash-backend/blob/master/CHANGELOG.md)

[My-stash @ Heroku](https://my-stash.herokuapp.com/)

# environment variables
DATABASE_URL=postgres://username:password@host:port/database <br />
SECRET=salaisuus <br />

# docker

docker build -t mystash .
docker run --network="host" --name="mystash-backend" mystash

docker container exec -it mystash-backend bash
node --inspect=0.0.0.0:9229 src/index.js
