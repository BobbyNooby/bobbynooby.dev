import { describe, expect, it } from "vitest";
import { createPresenceRegistry } from "./presenceRegistry";

const IP = "203.0.113.7";
const OTHER_IP = "198.51.100.20";

function idFor(n: number) {
  return `visitor-${String(n).padStart(4, "0")}`;
}

describe("createPresenceRegistry", () => {
  it("counts two sockets with one id once", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("tab1", IP);
    reg.connect("tab2", IP);
    reg.hello("tab1", idFor(1), "bob");
    reg.hello("tab2", idFor(1), "bob");
    expect(reg.here()).toBe(1);
  });

  it("does not count a socket until it says hello", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("tab1", IP);
    expect(reg.here()).toBe(0);
    expect(reg.stateFor("tab1")).toEqual({ t: "state", here: 0, cursors: [] });
  });

  it("refuses a 9th distinct id from one address but not from another", () => {
    const reg = createPresenceRegistry<string>();
    for (let n = 1; n <= 8; n++) {
      reg.connect(`s${n}`, IP);
      expect(reg.hello(`s${n}`, idFor(n), "bob")).toBe(true);
    }
    reg.connect("s9", IP);
    expect(reg.hello("s9", idFor(9), "bob")).toBe(false);
    expect(reg.here()).toBe(8);

    reg.connect("elsewhere", OTHER_IP);
    expect(reg.hello("elsewhere", idFor(9), "bob")).toBe(true);
    expect(reg.here()).toBe(9);
  });

  it("still lets a capped address open more tabs for an id it already has", () => {
    const reg = createPresenceRegistry<string>();
    for (let n = 1; n <= 8; n++) {
      reg.connect(`s${n}`, IP);
      reg.hello(`s${n}`, idFor(n), "bob");
    }
    reg.connect("extra-tab", IP);
    expect(reg.hello("extra-tab", idFor(3), "bob")).toBe(true);
    expect(reg.here()).toBe(8);
  });

  it("frees an address slot once that id has no sockets left", () => {
    const reg = createPresenceRegistry<string>({ maxIdsPerIp: 1 });
    reg.connect("a", IP);
    reg.hello("a", idFor(1), "bob");
    reg.connect("b", IP);
    expect(reg.hello("b", idFor(2), "bob")).toBe(false);
    reg.disconnect("a");
    expect(reg.hello("b", idFor(2), "bob")).toBe(true);
  });

  it("updates the name when the same id says hello again", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("a", IP);
    reg.connect("viewer", OTHER_IP);
    reg.hello("a", idFor(1), "bob");
    reg.move("a", "chat", 0.5, 0.5, 0);
    expect(reg.hello("a", idFor(1), "bobby")).toBe(true);
    expect(reg.stateFor("viewer").cursors[0].name).toBe("bobby");
    expect(reg.here()).toBe(1);
  });

  it("moves a socket to a new id when it says hello with one", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("a", IP);
    reg.connect("viewer", OTHER_IP);
    reg.hello("a", idFor(1), "bob");
    reg.hello("a", idFor(2), "bob");
    reg.move("a", "chat", 0.5, 0.5, 0);
    expect(reg.here()).toBe(1);
    expect(reg.stateFor("viewer").cursors.map((c) => c.id)).toEqual([idFor(2)]);
  });

  it("drops a cursor after 10s idle but still counts the visitor", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("a", IP);
    reg.connect("viewer", OTHER_IP);
    reg.hello("a", idFor(1), "bob");
    reg.move("a", "games", 0.2, 0.3, 1_000);

    reg.expire(10_999);
    expect(reg.stateFor("viewer").cursors).toHaveLength(1);

    reg.expire(11_000);
    expect(reg.stateFor("viewer").cursors).toEqual([]);
    expect(reg.here()).toBe(1);
  });

  it("keeps a cursor alive while it keeps moving", () => {
    const reg = createPresenceRegistry<string>({ cursorTtlMs: 100 });
    reg.connect("a", IP);
    reg.connect("viewer", OTHER_IP);
    reg.hello("a", idFor(1), "bob");
    reg.move("a", "games", 0.2, 0.3, 0);
    reg.move("a", "games", 0.4, 0.3, 90);
    reg.expire(150);
    expect(reg.stateFor("viewer").cursors).toHaveLength(1);
  });

  it("excludes the viewer’s own cursor from their state", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("mine", IP);
    reg.connect("my-other-tab", IP);
    reg.connect("theirs", OTHER_IP);
    reg.hello("mine", idFor(1), "me");
    reg.hello("my-other-tab", idFor(1), "me");
    reg.hello("theirs", idFor(2), "them");
    reg.move("mine", "about", 0.1, 0.1, 0);
    reg.move("theirs", "links", 0.9, 0.9, 0);

    expect(reg.stateFor("mine")).toEqual({
      t: "state",
      here: 2,
      cursors: [{ id: idFor(2), name: "them", pane: "links", x: 0.9, y: 0.9 }],
    });
    expect(reg.stateFor("my-other-tab").cursors.map((c) => c.id)).toEqual([
      idFor(2),
    ]);
    expect(reg.stateFor("theirs").cursors).toEqual([
      { id: idFor(1), name: "me", pane: "about", x: 0.1, y: 0.1 },
    ]);
  });

  it("clamps x and y to 0-1", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("a", IP);
    reg.connect("viewer", OTHER_IP);
    reg.hello("a", idFor(1), "bob");

    reg.move("a", "music", -0.5, 7, 0);
    expect(reg.stateFor("viewer").cursors[0]).toMatchObject({ x: 0, y: 1 });

    reg.move("a", "music", 1.5, -2, 0);
    expect(reg.stateFor("viewer").cursors[0]).toMatchObject({ x: 1, y: 0 });
  });

  it("ignores non-finite coordinates", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("a", IP);
    reg.connect("viewer", OTHER_IP);
    reg.hello("a", idFor(1), "bob");
    reg.move("a", "music", NaN, 0.5, 0);
    reg.move("a", "music", 0.5, Infinity, 0);
    expect(reg.stateFor("viewer").cursors).toEqual([]);
  });

  it("ignores a move before hello", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("a", IP);
    reg.connect("viewer", OTHER_IP);
    const before = reg.version();
    reg.move("a", "chat", 0.5, 0.5, 0);
    expect(reg.stateFor("viewer").cursors).toEqual([]);
    expect(reg.version()).toBe(before);
  });

  it("ignores a move from a socket whose hello was refused", () => {
    const reg = createPresenceRegistry<string>({ maxIdsPerIp: 1 });
    reg.connect("a", IP);
    reg.connect("b", IP);
    reg.connect("viewer", OTHER_IP);
    reg.hello("a", idFor(1), "bob");
    reg.hello("b", idFor(2), "mallory");
    reg.move("b", "chat", 0.5, 0.5, 0);
    expect(reg.stateFor("viewer").cursors).toEqual([]);
  });

  it("hides a cursor on hide but keeps the visitor counted", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("a", IP);
    reg.connect("viewer", OTHER_IP);
    reg.hello("a", idFor(1), "bob");
    reg.move("a", "chat", 0.5, 0.5, 0);
    reg.hide("a");
    expect(reg.stateFor("viewer").cursors).toEqual([]);
    expect(reg.here()).toBe(1);
  });

  it("removes the id when its last socket disconnects", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("tab1", IP);
    reg.connect("tab2", IP);
    reg.connect("viewer", OTHER_IP);
    reg.hello("tab1", idFor(1), "bob");
    reg.hello("tab2", idFor(1), "bob");
    reg.move("tab1", "chat", 0.5, 0.5, 0);

    reg.disconnect("tab1");
    expect(reg.here()).toBe(1);
    expect(reg.stateFor("viewer").cursors).toHaveLength(1);

    reg.disconnect("tab2");
    expect(reg.here()).toBe(0);
    expect(reg.stateFor("viewer").cursors).toEqual([]);
  });

  it("ignores a disconnect for a socket it never saw, or saw twice", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("a", IP);
    reg.hello("a", idFor(1), "bob");
    reg.disconnect("a");
    reg.disconnect("a");
    reg.disconnect("ghost");
    expect(reg.here()).toBe(0);
  });

  it("never puts an address or anything but id/name/pane/x/y in a state", () => {
    const reg = createPresenceRegistry<string>();
    reg.connect("a", IP);
    reg.connect("b", OTHER_IP);
    reg.connect("viewer", "192.0.2.1");
    reg.hello("a", idFor(1), "bob");
    reg.hello("b", idFor(2), "alice");
    reg.move("a", "chat", 0.5, 0.5, 0);
    reg.move("b", "grid", 0.1, 0.2, 0);

    for (const sock of ["a", "b", "viewer"]) {
      const state = reg.stateFor(sock);
      const json = JSON.stringify(state);
      expect(json).not.toContain(IP);
      expect(json).not.toContain(OTHER_IP);
      expect(json).not.toContain("192.0.2.1");
      expect(Object.keys(state).sort()).toEqual(["cursors", "here", "t"]);
      for (const cursor of state.cursors) {
        expect(Object.keys(cursor).sort()).toEqual([
          "id",
          "name",
          "pane",
          "x",
          "y",
        ]);
      }
    }
  });

  describe("version", () => {
    it("changes when the state does", () => {
      const reg = createPresenceRegistry<string>();
      reg.connect("a", IP);
      let last = reg.version();
      const changed = () => {
        const v = reg.version();
        const didChange = v !== last;
        last = v;
        return didChange;
      };

      reg.hello("a", idFor(1), "bob");
      expect(changed()).toBe(true);
      reg.move("a", "chat", 0.5, 0.5, 0);
      expect(changed()).toBe(true);
      reg.hide("a");
      expect(changed()).toBe(true);
      reg.move("a", "chat", 0.5, 0.5, 0);
      reg.expire(0);
      changed();
      reg.expire(10_000);
      expect(changed()).toBe(true);
      reg.disconnect("a");
      expect(changed()).toBe(true);
    });

    it("stays put when nothing visible changed", () => {
      const reg = createPresenceRegistry<string>();
      reg.connect("a", IP);
      reg.connect("b", IP);
      reg.hello("a", idFor(1), "bob");
      reg.hello("b", idFor(1), "bob");
      const before = reg.version();

      reg.connect("c", IP);
      reg.hide("a");
      reg.expire(60_000);
      reg.disconnect("b");
      reg.disconnect("c");
      expect(reg.version()).toBe(before);
    });
  });

  it("broadcasts the public handle, never the id a client sent", () => {
    const reg = createPresenceRegistry<string>({
      publicId: (id) => "pub-" + id.slice(-4),
    });
    reg.connect("victim", IP);
    reg.connect("viewer", OTHER_IP);
    reg.hello("victim", idFor(7), "alice");
    reg.hello("viewer", idFor(8), "bob");
    reg.move("victim", "about", 0.5, 0.5, 1);
    const state = reg.stateFor("viewer");
    expect(state.cursors.map((c) => c.id)).toEqual(["pub-0007"]);
    expect(JSON.stringify(state)).not.toContain(idFor(7));
  });
});
