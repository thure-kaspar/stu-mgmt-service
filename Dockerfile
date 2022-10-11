# Base image
FROM node:16-alpine

# Required for Prisma Client to work in container
RUN apk add --no-cache openssl

# Required for entry-script
RUN apk add --no-cache bash
# pg_isready to test if DB is up, bevor application starts
RUN apk add --no-cache postgresql-libs postgresql-client

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY --chown=node:node package.json package-lock.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY --chown=node:node . ./

# Creates the "dist" folder with the production build
RUN npm run build

# Prepare startup script
COPY docker/entry.sh /entry.sh
RUN chmod +x /entry.sh

# Use the node user from the image (instead of the root user)
USER node

# Start the server using the production build
ENTRYPOINT ["/entry.sh"]
EXPOSE 3000
