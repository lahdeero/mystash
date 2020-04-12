FROM node:13

ENV NODE_ENV=production

WORKDIR /data

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080
CMD ["npm", "start"]
