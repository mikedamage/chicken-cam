const _ = require('lodash');
const { createServer } = require('net');
const EventEmitter = require('events');
const WebMStream = require('webm-byte-stream');

const defaults = {
  durations: true,
  port: 9001,
};

class VideoFeed extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = _.merge({}, defaults, options);
    this.initSegment = null;
    this.webmStream = new WebMStream({ durations: this.options.durations });

    this.webmStream.on('Initialization Segment', (data) => {
      this.emit('initSegment', data);
      this.initSegment = data;
    });

    this.webmStream.on('Media Segment', (segment) => {
      this.emit('media', segment);
    });

    this.server = createServer((conn) => {
      this.emit('connect', conn);

      conn.on('data', (buf) => {
        this.emit('data', buf);
        this.webmStream.write(buf);
      });
    });
  }

  start() {
    this.server.listen(this.options.port);
    this.emit('start');
  }

  waitFor(evt) {
    return new Promise((resolve) => {
      this.once(evt, resolve);
    });
  }
}

module.exports = VideoFeed;
