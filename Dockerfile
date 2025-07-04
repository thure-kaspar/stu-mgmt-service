# Base image
FROM node:22-alpine

# Required for Prisma Client to work in container
RUN apk add --no-cache openssl

# Required for entry-script
RUN apk add --no-cache bash
# pg_isready to test if DB is up, bevor application starts
RUN apk add --no-cache postgresql-libs postgresql-client

# TOFIX: This breaks docker compose file...
# Entry script to switch between start:main and start:prod depending on environment variable
COPY docker/Backend/entry.sh /entry.sh
RUN chmod +x /entry.sh

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package*.json .
USER node
RUN npm install
COPY --chown=node:node . ./
RUN npm run build

EXPOSE 3000
ENTRYPOINT ["/entry.sh"]
#CMD ["npm", "run", "start:dev"]

