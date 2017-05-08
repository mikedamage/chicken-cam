#!/usr/bin/env node

const gstreamer = require('gstreamer-superficial');
const argv = require('yargs')
  .option('address', {
    alias: 'a',
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
  .argv;

const pipelineItems = [
  'autovideosrc horizontal-speed=1 is-live=true',
  'videoconvert',
  'vp8enc cpu-used=5 deadline=1 keyframe-max-dist=10',
  'queue leaky=1',
  'm. webmmux name=m streamable=true',
  'queue leaky=1',
  `tcpserversink host=${argv.host} port=${argv.port} sync-method=2`,
];

const pipeline = new gstreamer.Pipeline(pipelineItems.join(' ! '));

process.on('SIGINT', () => {
  pipeline.stop();
  process.exit();
});

pipeline.play();
