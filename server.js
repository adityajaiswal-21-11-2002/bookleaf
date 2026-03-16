/**
 * Custom server for Socket.io + Next.js
 * Run with: node server.js
 * For Vercel deployment, use standard next start (Socket.io disabled)
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { setSocketIO } = require("./lib/socketEmitter");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  setSocketIO(io);

  io.on("connection", (socket) => {
    socket.on("join:tickets", (authorId) => {
      socket.join(`tickets:${authorId}`);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Socket.io enabled at /api/socketio`);
  });
});
