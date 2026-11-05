import { catsay } from '../games/catsay';
import { fortune } from '../games/fortune';
import { gachaPull } from '../games/gacha';
import { huntTurn, startHunt } from '../games/hunt';
import { nmap } from '../games/nmap';
import { slFrames } from '../games/sl';
import { answerTrivia, startTrivia } from '../games/trivia';
import { vimInput, vimSplash } from '../games/vim';
import type { Command, CommandTable } from './types';

// The hidden games: not in help, listed in .secrets/games.txt.

const hunt: Command = (env) => {
	const start = startHunt();
	let g = start.state;
	env.printAll(start.lines);
	env.enterMode({
		name: 'hunt',
		prompt: 'hunt>',
		handle: (raw) => {
			const turn = huntTurn(g, raw, env.rng);
			g = turn.state;
			env.printAll(turn.lines);
			if (turn.end === 'won') env.unlock('hunter');
			if (turn.end) env.endMode();
		}
	});
};

const trivia: Command = (env) => {
	const start = startTrivia(env.data, env.rng);
	env.printAll(start.lines);
	if (!start.state) return;
	let t = start.state;
	env.enterMode({
		name: 'trivia',
		prompt: 'answer>',
		handle: (raw) => {
			const step = answerTrivia(t, raw);
			t = step.state;
			env.printAll(step.lines);
			if (!step.done) return;
			if (t.score === t.qs.length) env.unlock('trivia');
			env.endMode();
		}
	});
};

const gacha: Command = (env) => {
	const pull = gachaPull(env.data.threeByThree, env.rng);
	env.printAll(pull.lines);
	if (!pull.pulled) return;
	env.st.pulls++;
	if (env.st.pulls >= 5) env.unlock('gacha');
};

const vim: Command = (env) => {
	env.printAll(vimSplash());
	// Not being able to type exit out of vim is the joke; q is one of its own quits.
	env.enterMode({
		name: 'vim',
		prompt: ':',
		ownsQuit: true,
		handle: (raw) => {
			const r = vimInput(raw);
			env.printAll(r.lines);
			if (!r.quit) return;
			env.unlock('vim');
			env.endMode();
		}
	});
};

const catsayCmd: Command = (env, { arg }) => env.printAll(catsay(arg));
const nmapCmd: Command = (env, { arg }) => env.printAll(nmap(arg, env.data.projects));

export const gameCommands: CommandTable = {
	snake: (env) => env.ctx.startSnake(),
	hunt,
	trivia,
	gacha,
	pull: gacha,
	catsay: catsayCmd,
	cowsay: catsayCmd,
	fortune: (env) => env.printAll(fortune(env.data.threeByThree, env.rng)),
	nmap: nmapCmd,
	agamoto: nmapCmd,
	sl: (env) => {
		env.print('sl: did you mean ls? a cat runs past instead.', '#9ca3af');
		return env.ctx.animate(slFrames(), 60);
	},
	vim,
	vi: vim,
	nvim: vim
};
