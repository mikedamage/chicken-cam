const _            = require('lodash');
const EventEmitter = require('events');
const { Pipeline } = require('gstreamer-superficial');
const { connect }  = require('net');

const defaults = {
  retryTimeout: 500,
  host: '127.0.0.1',
  port: 9001,
  inputDevice: '/dev/video0',
  caps: {
    format: 'YUY2',
    width: 640,
    height: 480,
    framerate: 15,
  },
  encoder: {
    cpuUsed: 4,
    deadline: 1,
    keyframeMaxDist: 10
  },
  sink: {
    name: 'sink',
    maxBuffers: 100,
    drop: true,
  },
};

class VideoStream extends EventEmitter {
  constructor(options = {}) {
    super();
    this.connected    = false;
    this.transmitting = false;
    this.playing      = false;
    this.options      = _.merge({}, defaults, options);
    this.pipeline     = new Pipeline(this.pipelineString);
    this.sink         = this.pipeline.findChild(this.options.sink.name);
  }

  get capsString() {
    let caps = _.map(this.options.caps, (value, key) => {
      let param = `${key}=${value}`;
      if (key === 'framerate') param += '/1';
      return param;
    });
    return [ 'video/x-raw', ...caps ].join(',');
  }

  get pipelineString() {
    const { inputDevice, encoder, sink } = this.options;

    return [
      `v4l2src device=${inputDevice}`,
      this.capsString,
      'videoconvert',
      'video/x-raw,format=I420',
      `vp8enc cpu-used=${encoder.cpuUsed} deadline=${encoder.deadline} keyframe-max-dist=${encoder.keyframeMaxDist}`,
      'queue leaky=1',
      'm. webmmux name=m streamable=true',
      'queue leaky=1',
      `appsink max-buffers=${sink.maxBuffers} name=${sink.name} drop=${sink.drop}`,
    ].join(' ! ');
  }

  connect() {
    return new Promise((resolve) => {
      const { host, port } = this.options;
      this.client = connect({ host, port }, () => {
        this.connected = true;
        this.emit('connect');
        resolve();
      });
      this.client.on('end', () => this.emit('disconnect'));
      this.client.on('error', (err) => this.emit('error', err));
    });
  }

  disconnect() {
    this.stop();
    this.client.end();
  }

  play() {
    if (this.playing) return;
    this.pipeline.play();
    this.playing = true;
    this.emit('play');
  }

  pause() {
    if (!this.playing) return;
    this.pipeline.pause();
    this.playing = false;
    this.emit('pause');
  }

  stop() {
    this.pipeline.stop();
    this.playing = false;
    this.emit('stop');
  }

  transmit() {
    if (!this.connected) {
      throw new Error('not connected to server');
    }

    if (this.transmitting) {
      throw new Error('already transmitting');
    }

    if (!this.playing) {
      this.play();
    }

    this.transmitting = true;

    this._pull();
  }

  _pull() {
    if (!this.playing) return;

    this.sink.pull((buf, caps) => {
      if (caps) {
        this.emit('caps', caps);
      }

      if (buf) {
        this.emit('buffer', buf);
        this.client.write(buf);
        return this._pull();
      }

      setTimeout(this._pull.bind(this), this.options.retryTimeout);
    });
  }
}

module.exports = VideoStream;
