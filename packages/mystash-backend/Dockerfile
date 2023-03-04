FROM node:18.14.2

ENV NODE_ENV=production

WORKDIR /mystash-platform

COPY package*.json ./

RUN npm install bcrypt
RUN npm install

COPY . .

EXPOSE 8080
CMD ["npm", "start"]
