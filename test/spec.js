describe.only("socket", () => {

  const
    ssock = require("../index"),
    assert = require("assert"),
    net = require("net");

  let
    server,
    client;

  server = ssock({ quiet: true });
  server.start();

  client = net.Socket();
  client.connect(3000);

  ////

  it("on connection, should say hello", done => {
    client.once("data", buff => {
      assert(buff.toString() === "hello");
      done();
    });
  });

  describe("with basic parser", () => {

    it("should act as echo server", done => {
      server.onMessage((data, conn) => {
        conn.send(data.type);
      });

      client.on("data", buff => {
        buff = buff.toString();

        if (["hello", "bye"].indexOf(buff)  > -1) return; // ack fin
        assert(buff === "ping")

        done();
      });
      client.write(JSON.stringify("ping"));
    });

    it("should handle json", done => {
      server.onMessage((data, conn) => {
        assert(data.type === "data");
        assert(data.data.json === "object");
        assert(data.data.fn === true);

        done();
      });

      const obj = ["data", { json: "object", fn: true }];
      client.write(JSON.stringify(obj));
    });

  });

  it("on close, should say bye", () => {
    client.once("data", buff => {
      assert(buff.toString() === "bye");
      done();
    });

    server.end();
  });

});
