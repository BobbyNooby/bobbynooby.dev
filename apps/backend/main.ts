import "./env";
import { fileURLToPath } from "node:url";
import type { IncomingMessage } from "node:http";
import express from "express";
import { consoleBob, convertReq } from "./utils";
import { WebSocket, WebSocketServer } from "ws";
import { DiscordBot } from "./modules/discord";
import { Presence } from "./modules/presence";
import { SpotifyClient } from "./modules/spotify";
import { MongoDBClient } from "./modules/mongodb";
import { SimpleChat } from "./modules/chat";
import { ExpressAuth, getSession } from "@auth/express";
import { authConfig } from "./auth";
import { createChatLimits } from "./sockets/chatLimits";
import { createGate } from "./sockets/gate";
import {
  attachChat,
  attachDiscord,
  attachPresence,
  attachSpotify,
  MAX_FRAME_LENGTH,
} from "./sockets/routes";

const IS_PRODUCTION = process.env.IS_PRODUCTION === "true";

// Last line of defence: Bun exits on an unhandled rejection, and one failing
// widget (Spotify, Discord) must not take chat and presence down with it.
process.on("unhandledRejection", (reason) => {
  consoleBob(`Unhandled rejection: ${reason}`);
});

const app = express();
app.set("trust proxy", true);
app.use("/", ExpressAuth(authConfig));
const port = process.env.WSS_PORT || 3001;

const server = app.listen(port, () => {
  consoleBob("Server started");
  consoleBob(`Listening on port ${port}`);
});

// Bun's ws implementation does not enforce maxPayload; see sockets/routes.ts.
const wss = new WebSocketServer({ server, maxPayload: MAX_FRAME_LENGTH });
const mongoDbClient = new MongoDBClient();
await mongoDbClient.initialize();

const discordBot = new DiscordBot();
await discordBot.initialize();

const presence = new Presence();

const spotifyClient = new SpotifyClient(mongoDbClient);
await spotifyClient.initialize();

const chat = new SimpleChat(mongoDbClient, discordBot);

const gate = createGate(IS_PRODUCTION);
const chatLimits = createChatLimits();

async function handleConnection(ws: WebSocket, req: IncomingMessage) {
  const clientIp = gate.admit(ws, req);
  if (clientIp == null) return;

  const subroute = req.url;

  // Presence needs no session. Wiring it up before the await below means the
  // hello a client sends on open never arrives before there is a listener.
  if (subroute === "/presence") {
    attachPresence(ws, clientIp, presence);
    return;
  }

  const session = await getSession(convertReq(req, app), authConfig);

  consoleBob(
    `Websocket Connected. User : ${session?.user?.name}, ID : ${session?.user?.id}`,
  );

  const sessionId = session?.user?.id || "skibiditoiletmoment";
  // Every page connect refreshes the visitor's chat bucket, not only /chat.
  const bucketKey = session?.user?.id || clientIp;
  const chatEntry = chatLimits.entryFor(bucketKey);

  if (subroute === "/discord") await attachDiscord(ws, discordBot);
  if (subroute === "/spotify") await attachSpotify(ws, spotifyClient);
  if (subroute === "/chat") {
    await attachChat(ws, chat, {
      sessionId,
      name: session?.user?.name ?? undefined,
      chatEntry,
      bucketKey,
    });
  }
}

wss.on("connection", (ws, req) => {
  ws.on("error", (e) => consoleBob(`Websocket error: ${e}`));
  // An unhandled rejection here would take the whole server down.
  handleConnection(ws, req).catch((e) => {
    consoleBob(`Websocket connection failed: ${e}`);
    ws.close(1011, "Internal error");
  });
});

wss.on("close", () => {
  consoleBob("WebSocket server closed");
});
