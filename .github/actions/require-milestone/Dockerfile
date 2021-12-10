# Container image that runs your code
FROM node:14-alpine

COPY package*.json /home/action/
COPY entrypoint.js /home/action/entrypoint.js

WORKDIR /home/action
RUN npm ci

# Code file to execute when the docker container starts up (`entrypoint.js`)
ENTRYPOINT ["node", "/home/action/entrypoint.js"]
