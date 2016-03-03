# omp-express-mongo-api

A NodeJS Express implementation of the [OpenMediaPortal API](https://github.com/OpenMediaPortal/OpenMediaPortal), backed by a MongoDB database.

---

## Installation and Running

Use [OpenMediaPortal](https://github.com/OpenMediaPortal/OpenMediaPortal) to get started.

## Hacking

   * [Javascript Code Standard](https://google.github.io/styleguide/javascriptguide.xml)

   * [Commit Message Format](http://chris.beams.io/posts/git-commit/)

## Testing

[![Build Status](https://travis-ci.org/OpenMediaPortal/omp-express-mongo-api.svg?branch=master)](https://travis-ci.org/OpenMediaPortal/omp-express-mongo-api)

Testing is done using `npm test` and requires `nodejs`, `npm` and server other `npm` packages.

   * `npm install --only=dev`
   * `docker-compose -f .travis-docker-compose.yml build`
   * `docker-compose -f .travis-docker-compose.yml up -d`
   * `npm test`
   * `docker-compose -f .travis-docker-compose.yml stop`
   * `docker-compose -f .travis-docker-compose.yml rm`

The server logs from the test can be viewed using [`docker logs`](https://docs.docker.com/engine/reference/commandline/logs/).
