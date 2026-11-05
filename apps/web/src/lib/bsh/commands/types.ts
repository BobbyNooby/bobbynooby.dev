import type { AchievementStore, AchKey } from '../achievements';
import type { resolve } from '../fs';
import type { Rng } from '../rng';
import type { BshData, FsNode, Line, ShellCtx, Win } from '../types';

/** A game that takes over the prompt. q, quit and exit leave it unless it handles them itself. */
export type Mode = {
	name: string;
	prompt: string;
	handle: (raw: string) => void;
	ownsQuit?: boolean;
};

export type ShellState = {
	cwd: string[];
	history: string[];
	user: string;
	mode: Mode | null;
	sudos: number;
	exits: number;
	pulls: number;
};

/** What every command gets: the shell's state plus the helpers that print, find and unlock. */
export type ShellEnv = {
	ctx: ShellCtx;
	data: BshData;
	store: AchievementStore;
	st: ShellState;
	rng: Rng;
	print(segs: string | Line, color?: string): void;
	printAll(lines: Line[]): void;
	enterMode(mode: Mode): void;
	endMode(): void;
	find(path: string): ReturnType<typeof resolve>;
	locked(node: FsNode | null): boolean;
	unlock(key: AchKey): void;
	focusFor(node: FsNode): void;
	openWindow(win: Win): void;
	honk(): void;
};

/** One typed line: `name` is the lower-cased command, `arg` is everything after it. */
export type Call = { name: string; args: string[]; arg: string; raw: string };

/** Returned by a command that turns out not to apply, so the shell says "command not found". */
export const PASS = Symbol('pass');

export type Command = (env: ShellEnv, call: Call) => void | typeof PASS;
export type CommandTable = Record<string, Command>;
