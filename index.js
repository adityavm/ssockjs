"use strict";

const
  net = require("net"),
  colors = require("colors");

module.exports = ({ port = "3000", parser = true, quiet = false } = {}) => {

  const
    connections = []; // pool

  let
    successFn = (buff, conn) => null,
    errorFn = (buff, conn) => null;

  log.quiet = quiet;

  const proxy = net.createServer(req => {
    log(`${"**".cyan} creating new connection ${connections.length}`);
    let wrappedConnection = connectionWrapper(req, connections.length);

    let msg = `hello`;
    wrappedConnection.send(msg);

    connections.push(wrappedConnection);

    req.on("data", buffer => {
      buffer = buffer.toString();
      log(`${wrappedConnection.getId().toString().blue}`, `${"-->".blue} ${buffer}`);

      wrappedConnection.setMsg(buffer);

      buffer = (parser === true) ? basicParser(buffer) : buffer;
      successFn(buffer, wrappedConnection);
    });

    req.on("close", () => {
      const idx = connections.findIndex(conns => conns === wrappedConnection);
      log(`${"**".cyan} got close from ${idx} ${wrappedConnection.getId()}`);
      log(wrappedConnection.getId());
      if (idx !== -1) connections.splice(idx, 1);
    });

  });

  return {
    onMessage: (fn = (buff, conn) => {}) => successFn = fn,
    onError: (fn = (buff, conn) => {}) => errorFn = fn,
    start: () => {
      log(`${"**".cyan} starting`);
      proxy.listen(port);
    },
    end: () => {
      connections.forEach(conn => conn.send("bye"));
      proxy.close();
    },
  }
};

////

function basicParser(inp) {
  inp = JSON.parse(inp);
  inp = Array.isArray(inp) ? inp : [inp];
  return {
    type: inp[0],
    data: inp[1],
  };
};

function connectionWrapper(con, id) {
  let lastMsg = null;

  return {
    send: data => {
      log(`${id.toString().yellow} ${"<--".yellow} ${data}`);
      con.write(data);
    },
    getId: () => id,
    setMsg: msg => lastMsg = msg,
    getLastMsg: () => lastMsg,
  };
};

function log(...args) {
  if (!log.quiet) console.log(...args);
}
