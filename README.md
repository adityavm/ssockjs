# simple sockets js
really simple sockets library. wrapper around `net` with some basic handling built in.

[![Build Status](https://img.shields.io/travis/adityavm/ssockjs/master.svg?style=flat-square)](https://travis-ci.org/adityavm/ssockjs)

## usage
```javascript
const ssock = require("ssocks");

const socket = ssock({
  port: 9999,     // port to listen on, default 3000
  parser: false,  // use inbuilt simple parser, default true
  quiet: true,    // don't be verbose, default true
});

socket.onMessage((data, conn) => {}); // successfully received message from client
socket.onError((data, conn) => {});   // encountered error
```

_note: all configuration parameters are optional._

## default parser
the default parser requires clients to message in the format:

```javascript
[eventType, eventData] // ["hello", { name: "John Doe" }]
```

it parses and passes the incoming data to the outgoing functions (`onMessage, onError`) as:

```javascript
{
  type: eventType,
  data: eventData,
}
```
