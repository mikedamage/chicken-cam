#!/usr/bin/env node

/* eslint-disable no-console */

const VideoStream = require('../lib/video-stream');
const argv        = require('yargs')
  .option('host', {
    alias: 'H',
    describe: 'Destination server address',
    type: 'string',
    default: '127.0.0.1',
  })
  .option('port', {
    alias: 'p',
    describe: 'Destination server port',
    type: 'number',
    default: 9001,
  })
  .option('device', {
    alias: 'd',
    describe: 'Video source device',
    type: 'string',
    default: '/dev/video0',
  })
  .option('frames', {
    alias: 'f',
    describe: 'Frames per second',
    type: 'number',
    default: 15,
  })
  .option('width', {
    alias: 'x',
    describe: 'Video width',
    type: 'number',
    default: 640,
  })
  .option('height', {
    alias: 'y',
    describe: 'Video height',
    type: 'number',
    default: 480,
  })
  .help('help')
  .alias('help', 'h')
  .argv;

const stream = new VideoStream({
  host: argv.host,
  port: argv.port,
  inputDevice: argv.device,
  caps: {
    width: argv.width,
    height: argv.height,
    framerate: argv.frames,
  },
});

stream.on('connect', () => console.log('Connected to server'));
stream.on('play', () => console.log('Pulling video from source device'));
stream.on('buffer', (buffer) => console.log(`Sending buffer to server (${buffer.length})`));
stream.on('error', (err) => console.error('Stream error: ', err));

process.on('SIGINT', () => {
  stream.on('disconnect', () => {
    console.log('Disconnected from server. Exiting...');
    process.exit(0);
  });
  stream.disconnect();
});

stream.connect().then(() => {
  stream.client.ref();
  stream.transmit();
});
