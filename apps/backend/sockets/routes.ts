import type { WebSocket } from "ws";
import type { SimpleChat } from "../modules/chat";
import type { DiscordBot } from "../modules/discord";
import type { Presence } from "../modules/presence";
import type { SpotifyClient } from "../modules/spotify";
import { consoleBob } from "../utils";
import type { ChatEntry } from "./chatLimits";

// Bun's ws implementation does not enforce maxPayload, so the handlers that
// read messages repeat this check.
export const MAX_FRAME_LENGTH = 16 * 1024;

// One function per socket subroute: hand the socket to its module and clean
// up when it closes.

export function attachPresence(
  ws: WebSocket,
  clientIp: string,
  presence: Presence,
) {
  presence.addWebSocket(ws, clientIp);

  ws.on("message", (message) => {
    const text = String(message);
    if (text.length > MAX_FRAME_LENGTH) {
      ws.close(1009, "Message too large");
      return;
    }
    presence.onReceive(ws, text);
  });

  ws.on("error", () => presence.removeWebSocket(ws));
  ws.on("close", () => {
    presence.removeWebSocket(ws);
    consoleBob("WebSocket connection to /presence closed");
  });
}

export async function attachDiscord(ws: WebSocket, discordBot: DiscordBot) {
  await discordBot.addWebSocket(ws);

  ws.on("close", () => {
    discordBot.removeWebSocket(ws);
    consoleBob("WebSocket connection to /discord closed");
  });
}

export async function attachSpotify(
  ws: WebSocket,
  spotifyClient: SpotifyClient,
) {
  await spotifyClient.addWebSocket(ws);

  ws.on("close", () => {
    spotifyClient.removeWebSocket(ws);
    consoleBob("WebSocket connection to /spotify closed");
  });
}

export async function attachChat(
  ws: WebSocket,
  chat: SimpleChat,
  opts: {
    sessionId: string;
    name: string | undefined;
    chatEntry: ChatEntry;
    bucketKey: string;
  },
) {
  const { sessionId, chatEntry, bucketKey } = opts;
  await chat.addWebSocket(ws, { id: sessionId, name: opts.name });

  ws.on("message", async (message) => {
    try {
      if (chatEntry.bucket.tryTake() == false) {
        consoleBob(`Chat rate limited: ${bucketKey}`);
        return;
      }
      const text = String(message);
      if (text.length > MAX_FRAME_LENGTH) {
        ws.close(1009, "Message too large");
        return;
      }
      await chat.onRecieve(text, sessionId, ws);
    } catch (e) {
      consoleBob(`Chat error: ${e}`);
    }
  });

  ws.on("close", () => {
    chat.removeWebSocket(ws);
    consoleBob("WebSocket connection to /chat closed");
  });
}
