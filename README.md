mystash
============

[![Build Status](https://travis-ci.com/lahdeero/mystash-backend.svg?branch=master)](https://travis-ci.com/lahdeero/mystash-backend)
[![GitHub license](	https://img.shields.io/github/license/lahdeero/mystash-backend.svg)](https://github.com/lahdeero/mystash-backend/blob/master/LICENSE)
[![Last version](https://img.shields.io/github/tag-date/lahdeero/mystash-backend.svg)](https://github.com/lahdeero/mystash-backend/blob/master/CHANGELOG.md)

[mystash @ GitHub pages](https://lahdeero.github.io/mystash-frontend/)


## Install

1. Install Postgresql (if not yet installed), recommended version: 9.6

2. Create environment file
```
cp .env.example .env
```

3. Set your own environment secrets!
```
nano .env
```

4. Install packages
```
npm install
```

5. Execute migrations
```
./node_modules/.bin/knex migrate:latest
```

## Run

```
npm start
```


## docker (OUTDATED)

docker build -t mystash .
docker run --network="host" --name="mystash-backend" --restart="on-failure" mystash

docker container exec -it mystash-backend bash
node --inspect=0.0.0.0:9229 src/index.js

## docker-compose .env for dev
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

## Psql

```
psql "postgres://postgres:password@localhost:5432/postgres"
```

## Todo

1. BUG: docker-compose nodemon doesn't reload
