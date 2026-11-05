import { createHash, randomBytes } from "node:crypto";
import WebSocket from "ws";
import {
  createPresenceRegistry,
  createTokenBucket,
  presenceClientMessageSchema,
  type TokenBucket,
} from "@bobbynooby/shared";
import { consoleBob } from "../utils";

const BROADCAST_INTERVAL_MS = 100;

export class Presence {
  // Others see a salted hash, so nobody can read a visitor's id off the wire
  // and say hello with it to take over their cursor.
  salt = randomBytes(16);
  registry = createPresenceRegistry<WebSocket>({
    publicId: (id) =>
      createHash("sha256").update(this.salt).update(id).digest("base64url").slice(0, 16),
  });
  // Every open /presence socket, with the bucket that rate-limits its cursor.
  sockets = new Map<WebSocket, TokenBucket>();
  sentVersion = this.registry.version();
  // Sockets that have said hello, refused ones included. Until then we cannot
  // tell which cursor is the visitor's own (from another tab), so they get nothing.
  greeted = new WeakSet<WebSocket>();

  constructor() {
    setInterval(() => this.broadcast(), BROADCAST_INTERVAL_MS);
  }

  addWebSocket(ws: WebSocket, ip: string) {
    this.registry.connect(ws, ip);
    this.sockets.set(
      ws,
      createTokenBucket({ capacity: 20, refillPerSecond: 12 }),
    );
  }

  removeWebSocket(ws: WebSocket) {
    this.registry.disconnect(ws);
    this.sockets.delete(ws);
  }

  onReceive(ws: WebSocket, text: string) {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return;
    }
    const parsed = presenceClientMessageSchema.safeParse(data);
    if (!parsed.success) return;
    const message = parsed.data;

    if (message.t === "hello") {
      // A refused socket stays open as an uncounted viewer, so a busy shared
      // network still sees everyone instead of reconnecting in a loop.
      if (!this.registry.hello(ws, message.id, message.name)) {
        consoleBob("[Presence] hello refused: too many ids from one address");
      }
      this.greeted.add(ws);
      // Answer at once rather than on the next tick.
      this.send(ws);
    } else if (message.t === "cur") {
      if (this.sockets.get(ws)?.tryTake() !== true) return;
      this.registry.move(ws, message.pane, message.x, message.y, Date.now());
    } else {
      this.registry.hide(ws);
    }
  }

  broadcast() {
    this.registry.expire(Date.now());
    const version = this.registry.version();
    if (version === this.sentVersion) return;
    this.sentVersion = version;
    for (const ws of this.sockets.keys()) {
      this.send(ws);
    }
  }

  send(ws: WebSocket) {
    if (ws.readyState === WebSocket.OPEN && this.greeted.has(ws)) {
      ws.send(JSON.stringify(this.registry.stateFor(ws)));
    }
  }
}
