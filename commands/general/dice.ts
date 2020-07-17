import { Message } from "discord.js";

const dice = {
	desc: "Role a Die/Dice",
	name: "dice",
	args: "<Number of Dice>d<Die Number> ex 2d4",
	type: "",
	run: (message: Message, args: string[]) => {
		let [numRolls, diceSize] = [1, 6];

		if (args.length > 0) {
			if (args.length === 2) {
				[numRolls, diceSize] = [Number(args[0]), Number(args[1])]
			} else if (args.length === 1) {
				[numRolls, diceSize] = args[0].split('d').map(n => Number(n));
			}
		}

		let str = "";
		for (let i = 0; i < numRolls; i++) {
			str = str + (Math.floor(Math.random() * diceSize) + 1) + ' ';
		}
		message.channel.send(numRolls + "d" + diceSize + ": " + str);
	}
}

export default dice