export function argChecker(neededArgCount: number, args: string[]) {
	if (args.length < neededArgCount) {
		return {
			isValid: false,
			history: [`Too few arguments. Need ${neededArgCount} but got ${args.length}`]
		};
	} else if (args.length > neededArgCount) {
		return {
			isValid: false,
			history: [`Too many arguments. Need ${neededArgCount} but got ${args.length}`]
		};
	}

	return { isValid: true, history: [' Arguments met.'] };
}
