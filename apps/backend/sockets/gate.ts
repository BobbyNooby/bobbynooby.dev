import type { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";
import { createConnectionLimiter, pickForwardedIp } from "@bobbynooby/shared";
import { consoleBob } from "../utils";

// A page opens four sockets, so this allows about eight tabs per address.
const MAX_CONNECTIONS_PER_ADDRESS = 32;

// Who gets a socket at all: site origins only, a cap per address, and a
// heartbeat that drops connections that stopped answering.
export function createGate(isProduction: boolean) {
  const connectionLimiter = createConnectionLimiter(MAX_CONNECTIONS_PER_ADDRESS);

  const allowedOrigins = [
    "https://bobbynooby.dev",
    "https://www.bobbynooby.dev",
  ];
  if (!isProduction) {
    allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
  }

  // Every live socket, regardless of subroute. One interval pings them all:
  // browsers answer pings automatically, and a socket that misses its pong is
  // terminated so half-open connections (NAT/proxy timeouts) stop lingering
  // in the per-module broadcast sets and inflating the presence count.
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

  /** Lets the socket in and returns the client address, or closes it and returns null. */
  function admit(ws: WebSocket, req: IncomingMessage): string | null {
    // Browsers always send Origin; absent means a non-browser client (curl,
    // health checks), which we let through.
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
      consoleBob(`Websocket rejected: origin ${origin} not allowed`);
      ws.close(1008, "Origin not allowed");
      return null;
    }

    const clientIp = pickForwardedIp(
      req.headers["x-forwarded-for"]?.toString(),
      req.socket.remoteAddress || "unknown",
    );
    if (!connectionLimiter.tryAcquire(clientIp)) {
      consoleBob(`Websocket rejected: too many connections from ${clientIp}`);
      ws.close(1013, "Too many connections");
      return null;
    }

    allSockets.add(ws);
    isAlive.set(ws, true);
    ws.on("pong", () => isAlive.set(ws, true));
    ws.on("close", () => {
      allSockets.delete(ws);
      connectionLimiter.release(clientIp);
    });
    return clientIp;
  }

  return { admit };
}
