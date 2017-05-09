#!/usr/bin/env node

/* eslint-disable no-console */

const path = require('path');
const httpPort = process.env.HTTP_PORT || 3000;
const feedPort = process.env.FEED_PORT || 9001;
const bunyan = require('bunyan');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { createServer } = require('net');

const logger = bunyan.createLogger({ name: 'chickenCam' });

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

app.get('/js/socket.io.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'node_modules', 'socket.io-client', 'dist', 'socket.io.js'));
});

io.on('connection', (socket) => {
  logger.info('User connected', { req: socket.request });
});

server.listen(httpPort, () => {
  logger.info({ httpPort }, 'HTTP server listening');
});

const videoFeed = createServer((conn) => {
  logger.info({ feedPort }, 'Video feed source connected');

  conn.on('data', (buf) => {
    io.emit('video', buf);
  });
});

videoFeed.listen(feedPort);
