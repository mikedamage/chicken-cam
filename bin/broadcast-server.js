#!/usr/bin/env node

/* eslint-disable no-console */

const path = require('path');
const httpPort = process.env.HTTP_PORT || 3000;
const feedPort = process.env.FEED_PORT || 9001;
const bunyan = require('bunyan');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const VideoFeed = require('../lib/video-feed');

const logger = bunyan.createLogger({ name: 'chickenCam' });

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

app.get('/js/socket.io.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'node_modules', 'socket.io-client', 'dist', 'socket.io.js'));
});


const videoFeed = new VideoFeed({ port: feedPort, durations: false });

videoFeed.on('connect', () => logger.info('Video input feed connected'));
videoFeed.on('initSegment', (data) => {
  logger.info({ segmentLength: data.length }, 'Receive initialization segment');

  io.on('connection', (sock) => {
    logger.info('User connected. Sending initialization segment.');
    sock.emit('initSegment', data);

    videoFeed.on('media', (media) => {
      logger.debug({ media }, 'Relaying media segment');
      sock.emit('media', media);
    });

    videoFeed.on('data', (data) => {
      sock.emit('data', data);
      logger.debug({ bytes: data.length }, 'Sending stream data');
    });
  });

  server.listen(httpPort, () => {
    logger.info({ httpPort }, 'HTTP server listening');
  });
});

videoFeed.start();
