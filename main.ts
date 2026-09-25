import dotenv from "dotenv";
import express from "express";
import { consoleBob, convertReq } from "./utils";
import { WebSocket, WebSocketServer } from "ws";
import { DiscordBot } from "./modules/discord";
import { UserCount } from "./modules/userCount";
import { SpotifyClient } from "./modules/spotify";
import { MongoDBClient } from "./modules/mongodb";
import { SimpleChat } from "./modules/chat";
import { ExpressAuth, getSession } from "@auth/express";
import { authConfig } from "./auth";

dotenv.config();

const IS_PRODUCTION = process.env.IS_PRODUCTION === "true";

const app = express();
app.set("trust proxy", true);
app.use("/", ExpressAuth(authConfig));
const port = process.env.WSS_PORT || 3001;

const server = app.listen(port, () => {
  consoleBob("Server started");
  consoleBob(`Listening on port ${port}`);
});

// 16KB caps incoming frames (frontend already caps chat messages at 10KB).
const wss = new WebSocketServer({ server, maxPayload: 16 * 1024 });
const mongoDbClient = new MongoDBClient();
await mongoDbClient.initialize();

const discordBot = new DiscordBot();
await discordBot.initialize();

const userCount = new UserCount();

const spotifyClient = new SpotifyClient(mongoDbClient);
await spotifyClient.initialize();

const chat = new SimpleChat(mongoDbClient, discordBot);

// Every live socket, regardless of subroute. One interval pings them all:
// browsers answer pings automatically, and a socket that misses its pong is
// terminated so half-open connections (NAT/proxy timeouts) stop lingering
// in the per-module broadcast sets and inflating userCount.
const allSockets = new Set<WebSocket>();
const isAlive = new WeakMap<WebSocket, boolean>();

setInterval(() => {
  for (const ws of allSockets) {
    if (isAlive.get(ws) === false) {
      allSockets.delete(ws);
      ws.terminate();
      continue;
    }
    isAlive.set(ws, false);
    ws.ping();
  }
}, 30_000);

const allowedOrigins = ["https://bobbynooby.dev", "https://www.bobbynooby.dev"];
if (!IS_PRODUCTION) {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

wss.on("connection", async (ws, req) => {
  // Browsers always send Origin; absent means a non-browser client (curl,
  // health checks), which we let through.
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    consoleBob(`Websocket rejected: origin ${origin} not allowed`);
    ws.close(1008, "Origin not allowed");
    return;
  }

  allSockets.add(ws);
  isAlive.set(ws, true);
  ws.on("pong", () => isAlive.set(ws, true));
  ws.on("close", () => allSockets.delete(ws));

  const subroute = req.url;
  consoleBob(req.headers);
  const session = await getSession(convertReq(req, app), authConfig);

  consoleBob(
    `Websocket Connected. User : ${session?.user?.name}, ID : ${session?.user?.id}`,
  );

  const sessionId = session?.user?.id || "skibiditoiletmoment";

  if (subroute === "/discord") {
    await discordBot.addWebSocket(ws);

    ws.on("close", () => {
      discordBot.removeWebSocket(ws);
      consoleBob("WebSocket connection to /discord closed");
    });
  }

  if (subroute === "/userCount") {
    userCount.addWebSocket(ws);

    ws.on("close", () => {
      userCount.removeWebSocket(ws);
      consoleBob("WebSocket connection to /userCount closed");
    });
  }

  if (subroute === "/spotify") {
    await spotifyClient.addWebSocket(ws);

    ws.on("close", () => {
      spotifyClient.removeWebSocket(ws);
      consoleBob("WebSocket connection to /spotify closed");
    });
  }

  if (subroute === "/chat") {
    await chat.addWebSocket(ws);

    ws.on("message", async (message) => {
      try {
        await chat.onRecieve(String(message), sessionId);
      } catch (e) {
        consoleBob(`Chat error: ${e}`);
      }
    });

    ws.on("close", () => {
      chat.removeWebSocket(ws);
      consoleBob("WebSocket connection to /chat closed");
    });
  }
});

wss.on("close", () => {
  consoleBob("WebSocket server closed");
});
