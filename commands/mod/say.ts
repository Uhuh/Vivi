import { Message } from "discord.js";

const say = {
	desc: ">:)",
	name: "say",
	args: "",
	type: "owner",
	run: (message: Message) => {
		if (message.member?.hasPermission(["MANAGE_MESSAGES"])) {
			message.delete();
			message.channel.send(message.content.slice(5) || 'Nothing to say!');
		}
	}
}

export default say