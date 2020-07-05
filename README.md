mystash 
============

[![Build Status](https://travis-ci.com/lahdeero/mystash-backend.svg?branch=master)](https://travis-ci.com/lahdeero/mystash-backend)
[![GitHub license](	https://img.shields.io/github/license/lahdeero/mystash-backend.svg)](https://github.com/lahdeero/mystash-backend/blob/master/LICENSE)
[![Last version](https://img.shields.io/github/tag-date/lahdeero/mystash-backend.svg)](https://github.com/lahdeero/mystash-backend/blob/master/CHANGELOG.md)

[mystash @ GitHub pages](https://lahdeero.github.io/mystash-frontend/)


# docker

docker build -t mystash .
docker run --network="host" --name="mystash-backend" mystash

docker container exec -it mystash-backend bash
node --inspect=0.0.0.0:9229 src/index.js

# docker-compose .env for dev
```
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
CALLBACK_URL=http://localhost:8080/api/login/github/callback
DATABASE_URL=postgres://postgres:password@postgres:5432/postgres
SECRET=salaisuus
JWT_KEY=salaisuus

LOCATION=/c/Sites/mystash-backend/
NPMCOMMAND=run watchd
PORT=8080

GITHUB_CLIENT_ID=xxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxx
```
