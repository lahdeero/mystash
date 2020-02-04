FROM node:13

ENV NODE_ENV=production

WORKDIR /home/mystash/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001
CMD ["npm", "start"]
