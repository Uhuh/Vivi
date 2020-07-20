import { Message } from "discord.js";
import BowBot from "../../src/bot";

const say = {
	desc: ">:)",
	name: "say",
	args: "",
	type: "owner",
	run: (message: Message, args: string[], client: BowBot) => {
		if (args.length > 0 && message.member?.hasPermission(["MANAGE_MESSAGES"])) {
			message.delete();
			const toSay = args.join(' ');
			message.channel.send(toSay);
		}
	}
}

export default say