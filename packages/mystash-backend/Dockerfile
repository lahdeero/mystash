FROM node:18.14.2

ENV NODE_ENV=production
ENV PG_PASSWORD=secret
ENV FRONTEND_URL=http://localhost:3000
ENV BACKEND_URL=http://localhost:8080
ENV CALLBACK_URL=http://localhost:8080/api/login/github/callback
ENV DATABASE_URL=postgres://mystashuser:salasana@host.docker.internal:5432/mystashdb
ENV PG_PASSWORD=salasana
ENV SECRET=salaisuus
ENV JWT_KEY=salaisuus
ENV SESSION_SECRET=foobarbaz
ENV FILE_UPLOAD_PATH=/mystash-platform/uploads
ENV LOCATION=/home/eero/sites/mystash-backend
ENV PORT=8080

WORKDIR /mystash-platform
COPY package*.json ./

RUN npm install bcrypt
RUN npm install

COPY . .

EXPOSE 8080
CMD ["npm", "start"]
