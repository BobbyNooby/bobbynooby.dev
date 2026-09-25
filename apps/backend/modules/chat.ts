import { Db } from "mongodb";
import WebSocket from "ws";
import { chatIntakeSchema } from "@bobbynooby/shared";
import { MongoDBClient } from "./mongodb";
import { ChatMessage, RecievedChatMessage } from "../types";
import { DiscordBot } from "./discord";
import { consoleBob } from "../utils";

const IS_PRODUCTION = process.env.IS_PRODUCTION;
if (IS_PRODUCTION == undefined) {
  consoleBob("IS_PRODUCTION is not set");
  process.exit(1);
}

const PRODUCTION_CHAT_COLLECTION = process.env.PRODUCTION_CHAT_COLLECTION;
const DEV_CHAT_COLLECTION = process.env.DEV_CHAT_COLLECTION;

if (PRODUCTION_CHAT_COLLECTION == undefined) {
  consoleBob("PRODUCTION_CHAT_COLLECTION is not set");
  process.exit(1);
} else if (DEV_CHAT_COLLECTION == undefined) {
  consoleBob("DEVELOPMENT_CHAT_COLLECTION is not set");
  process.exit(1);
}

let CHAT_COLLECTION = "";

if (IS_PRODUCTION == "true") {
  consoleBob("Running in production mode");
  CHAT_COLLECTION = PRODUCTION_CHAT_COLLECTION!;
} else if (IS_PRODUCTION == "false") {
  consoleBob("Running in development mode");
  CHAT_COLLECTION = DEV_CHAT_COLLECTION!;
} else {
  consoleBob("IS_PRODUCTION is not set to true or false");
  process.exit(1);
}

export type ChatIdentity = { id: string; name?: string };

export class SimpleChat {
  users: Set<WebSocket>;
  identities: WeakMap<WebSocket, ChatIdentity>;
  mongoClient: MongoDBClient;
  discordBot: DiscordBot;
  db: Db;

  constructor(mongoDbClient: MongoDBClient, discordBot: DiscordBot) {
    {
      this.users = new Set<WebSocket>();
      this.identities = new WeakMap<WebSocket, ChatIdentity>();
      this.db = mongoDbClient.dbVPS;
      this.mongoClient = mongoDbClient;
      this.discordBot = discordBot;
    }
  }

  async onRecieve(message: string, sessionId: string, ws?: WebSocket) {
    // JSON.parse is guarded: an invalid frame must never throw out of the
    // message handler (an unhandled rejection takes the whole server down).
    let parsedMessage: RecievedChatMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch {
      this.consoleBob(`Invalid JSON : ${message.slice(0, 100)}`);
      return;
    }

    const parsed = chatIntakeSchema.safeParse(parsedMessage);
    if (parsed.success == false) {
      this.consoleBob(`Invalid Message : ${message.slice(0, 100)}`);
      return;
    }

    // Authed users speak under their Discord name; only guests may pick one.
    const identity = ws ? this.identities.get(ws) : undefined;
    const name = identity?.name ?? parsed.data.name;

    const messageObject: ChatMessage = {
      name: name.slice(0, 50),
      created_at: new Date().toISOString(),
      message: parsed.data.message.slice(0, 10_000),
      rank:
        (await this.mongoClient.isAdmin(sessionId)) == true ? "owner" : "guest",
    };

    await this.db
      .collection(CHAT_COLLECTION || "chat-prod")
      .insertOne(messageObject);
    await this.discordBot.sendDiscordMessage(
      messageObject.name,
      messageObject.message,
      messageObject.rank
    );
    this.broadcast({ message: messageObject });
  }

  async addWebSocket(ws: WebSocket, identity?: ChatIdentity) {
    this.users.add(ws);
    if (identity) {
      this.identities.set(ws, identity);
    }

    const pastMessages: ChatMessage[] = [...(await this.getLastMessages())];

    ws.send(JSON.stringify({ initialMessages: pastMessages }));
  }

  removeWebSocket(ws: WebSocket) {
    this.users.delete(ws);
  }

  broadcast(message: any) {
    for (const ws of this.users) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }

  async getLastMessages(count: number = 500): Promise<ChatMessage[]> {
    return await this.db
      .collection<ChatMessage>(CHAT_COLLECTION || "chat-prod")
      .find()
      .sort({ created_at: -1 })
      .limit(count)
      .toArray()
      .then((messages) => messages.reverse());
  }

  consoleBob(...args: any[]) {
    console.log(`[${new Date().toLocaleString()}] [Chat]`, ...args);
  }
}
