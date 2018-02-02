FROM node:8.5

WORKDIR /usr/app

COPY volumes/console/package.json .
RUN npm install --quiet

COPY volumes/console .

EXPOSE 8080
