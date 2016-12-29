const
  colors = require("colors"),
  net = require("net"),
  q = require("q");

let done = [1,2,3,4,5].map(e => q.defer()); //

[1,2,3,4,5]
.map(e => net.Socket()) // make clients
.forEach((sock, i) => { // do stuff

  sock.connect(3000);
  console.log("connecting", i.toString().green);

  // handlers
  sock.on("connect", () => console.log("connected".green, i));
  sock.on("data", buffer => console.log(i, buffer.toString()));
  sock.on("close", () => {
    console.log(`closing ${i}`.yellow);
    done[i].resolve();
  });

  process.on("SIGINT", () => sock.end()); // fin on kill

  function randomPing() {
    setTimeout(() => {
      console.log(i.toString().magenta, "<--".magenta, "ping");
      sock.write(JSON.stringify("ping"));
      randomPing();
    }, Math.random() * 7000 + 3000);
  }

  randomPing(); // randomly ping

});

// quit when all closed
q.allSettled(done.map(d => d.promise)).then(() => {
  console.log("all done".red);
  process.exit();
});

process.on("SIGINT", () => setTimeout(() => console.log(`${"**".cyan} quitting`)), 1000);
