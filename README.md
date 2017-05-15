# Chicken Cam

All chickens, most of the time!

## What are this?

Chicken Cam is, under its shell, a system for broadcasting a live video stream from a source behind a firewall. It uses a lightweight daemon to push a VP8 encoded WebM video stream from a computer (or Raspberry Pi!) on your local network using a customizable GStreamer pipeline, to a broadcast server connected to the Internet. Viewers visit the broadcast server, which streams any video data it receives from the source down to each user over a WebSocket connection.

Eventually, once I figure out the proper stream encoding settings for the [Media Source Extensions API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API), the video data received via WebSocket on a user's browser will be pushed into a buffer and fed to a standard, HTML5 `<video>` tag. _It's a work in progress, and I haven't gotten there just yet._

## Why chickens?

Aside from giving me a chance to learn more about full-stack live video streaming, this project's real-life application is to enable my wife to keep an eye on her beloved flock of back yard chickens while she's away from home.

## Setup

```sh
# Run this on both the video source and the broadcast server:
git clone https://github.com/mikedamage/chicken-cam.git
cd chicken-cam
npm install

# on the video source machine
node ./bin/video-feed.js

# on the broadcast server
node ./bin/broadcast-server.js
```
