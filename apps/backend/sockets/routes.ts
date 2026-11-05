import type { WebSocket } from "ws";
import type { SimpleChat } from "../modules/chat";
import type { DiscordBot } from "../modules/discord";
import type { Presence } from "../modules/presence";
import type { SpotifyClient } from "../modules/spotify";
import { consoleBob } from "../utils";
import type { ChatLimits } from "./chatLimits";

// Bun's ws implementation does not enforce maxPayload, so the handlers that
// read messages repeat this check.
export const MAX_FRAME_LENGTH = 16 * 1024;

// One function per socket subroute: hand the socket to its module and clean
// up when it closes. Close is listened for before any await, so a socket that
// closes mid-setup is still removed.

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

// /discord and /spotify only broadcast and the site never sends on them, so any
// frame there (unchecked for size otherwise) ends the connection.
function refuseMessages(ws: WebSocket) {
  ws.on("message", () => ws.close(1003, "No messages accepted"));
}

export async function attachDiscord(ws: WebSocket, discordBot: DiscordBot) {
  refuseMessages(ws);
  ws.on("close", () => {
    discordBot.removeWebSocket(ws);
    consoleBob("WebSocket connection to /discord closed");
  });

  await discordBot.addWebSocket(ws);
}

export async function attachSpotify(
  ws: WebSocket,
  spotifyClient: SpotifyClient,
) {
  refuseMessages(ws);
  ws.on("close", () => {
    spotifyClient.removeWebSocket(ws);
    consoleBob("WebSocket connection to /spotify closed");
  });

  await spotifyClient.addWebSocket(ws);
}

export async function attachChat(
  ws: WebSocket,
  chat: SimpleChat,
  opts: {
    sessionId: string;
    name: string | undefined;
    chatLimits: ChatLimits;
    bucketKey: string;
  },
) {
  const { sessionId, chatLimits, bucketKey } = opts;
  ws.on("close", () => {
    chat.removeWebSocket(ws);
    consoleBob("WebSocket connection to /chat closed");
  });

  ws.on("message", async (message) => {
    try {
      if (chatLimits.entryFor(bucketKey).bucket.tryTake() == false) {
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

  await chat.addWebSocket(ws, { id: sessionId, name: opts.name });
}
