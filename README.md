mystash
============

[Mystash @ duckdns](https://mystash.duckdns.org)

[Mystash @ AWS](https://d2i9hujvjf3jxs.cloudfront.net)

[Docker repository](https://hub.docker.com/repository/docker/lahdeero/mystash-backend/general)

## Install

1. Setup postgres
  - Install Postgresql (if not yet installed), recommended version: 9.6 or higher
  - Connect to your postgresql server

2. Setup database
```
create database mystashdb;
create user mystashuser with encrypted password 'changeme';
grant all privileges on database mystashdb to mystashuser;
```

3. Create environment file
```
cp .env.example .env
```

4. Set your own environment secrets!
```
nano .env
```

5. Install packages
```
npm run ci
```

6. Execute migrations
```
cd packages/mystash-backend
./node_modules/.bin/knex migrate:latest
cd ../..
```

## Run

```
npm run dev
```

## Development

Seeds creates user
``
testi/salasana
``
```
./node_modules/.bin/knex seed:run
```

## Deploy

### Frontend

frontend build/ equals backend public/

```bash
1. npm run build # in frontend
2. mv build public
3. mv public ../mystash-backend
```

## Production

```
./node_modules/.bin/pm2 start src/index.js
```

## Docker

### Build

```bash
docker build -t mystash-backend .
docker run -p 8080:8080 --name="mystash-backend" --restart="on-failure" mystash-backend
```

### Debug

```bash
docker container exec -it mystash-backend bash
node --inspect=0.0.0.0:9229 src/index.js
```

### Publish

```
docker push lahdeero/mystash-backend:tagname
```

## Psql

### Debug

```
psql -U mystashuser -d mystashdb
psql "postgres://mystashuser:changeme@localhost:5432/mystashdb"
```

## docker-compose .env for dev (OUTDATED)
```
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
CALLBACK_URL=http://localhost:8080/api/login/github/callback
DATABASE_URL=postgres://postgres:password@postgres:5432/postgres
DOCKER_DATABASE_URL=postgres://mystashuser:password@postgres:5432/mystashdb
SECRET=salaisuus
JWT_KEY=salaisuus

LOCATION=/home/lahdeero/sites/mystash-backend
NPMCOMMAND=run watchd
PORT=8080

GITHUB_CLIENT_ID=xxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxx
```

In WSL1 locations was:
```LOCATION=/c/Sites/mystash-backend/```

Build & run:
```bash
docker-compose build
docker-compose up
```

Connect to container:
```bash
docker container exec -it mystash-backend_backend_1 bash
```

## AWS CLI

Must install [aws cli](https://aws.amazon.com/cli/) and [cdk](https://github.com/aws/aws-cdk/tree/main) before. If cdk synth gives some docker error make sure esbuild is installed!

````bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
npm i -g aws-cdk
```

```bash
export AWS_PROFILE=mystashapp-prod
npm ci
aws s3 ls
aws sts get-caller-identity --profile mystashapp-prod
cdk bootstrap aws://AWS-ACCOUNT-ID-HERE/eu-north-1
```

```bash
cdk synth --profile mystashapp-prod # creates cdk.out
cdk diff --profile mystashapp-prod # compares difference between deployed stack
cdk deploy --profile mystashapp-prod # deploys stack
```
