const auth = require("json-server-auth");
const jsonServer = require("json-server");
const express = require("express");
const http = require("http");
const cors = require("cors");

let corsOptions = {
  origin: "https://lwschatapi.herokuapp.com/",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

global.io = io;

const router = jsonServer.router("db.json");

// response middleware
router.render = (req, res) => {
  const path = req.path;
  const method = req.method;

  if (
    path.includes("/conversations") &&
    (method === "POST" || method === "PATCH")
  ) {
    // emit socket event
    io.emit("conversation", {
      data: res.locals.data,
    });
  }

  if (path.includes("/messages") && method === "POST") {
    // emit socket event
    io.emit("message", {
      data: res.locals.data,
    });
    console.log(res);
  }

  res.json(res.locals.data);
};

const middlewares = jsonServer.defaults();
const port = process.env.PORT || 9000;

// Bind the router db to the app
app.db = router.db;

app.use(middlewares);

const rules = auth.rewriter({
  users: 640,
  conversations: 660,
  messages: 660,
});

app.get("/inbox/:id", cors(corsOptions), function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for only example.com." });
});

app.listen(80, function () {
  console.log("CORS-enabled web server listening on port 80");
});

app.use(cors());
app.use(rules);
app.use(auth);
app.use(router);

server.listen(port);
