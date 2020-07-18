import { Message } from "discord.js";

const members = {
	desc: "Shows Current Member Count",
	name: "members",
	args: "",
	type: 'general',
	run: (message: Message) => {
		message.channel.send(`Total Members (Minus Bots): ${message.guild?.members.cache.filter(member => !member.user.bot).size}`);
	}
}

export default members