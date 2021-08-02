FROM node:14

WORKDIR /usr/src/app

COPY package*.json config ./

RUN npm install

COPY . .

EXPOSE 3000

ENV NODE_ENV=demo

# CMD ["npm", "run", "typeorm", "migrations:run"]
CMD ["node", "dist/src/main"]