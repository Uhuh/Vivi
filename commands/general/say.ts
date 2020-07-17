import { Message } from "discord.js";

const say = {
	desc: ">:)",
	name: "say",
	args: "",
	type: "owner",
	run: (message: Message, args: string[]) => {
		if (args.length > 0 && message.author.id === '223194058288267264') {
			message.delete();
			const toSay = args.join(' ');
			message.channel.send(toSay);
		}
	}
}

export default say