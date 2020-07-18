import { Message } from "discord.js";
import { GET_COINS } from "../../src/setup_tables";

const bal = {
	desc: 'Check your Balance',
	name: 'bal',
	args: '[@user]',
	type: 'general',
	run: (message: Message) => {
		const userId = message.mentions.members?.last()?.id || message.author.id;
		const userCoins = GET_COINS(userId);

		message.delete();
		message.channel.send(`${message.author}, You have **${userCoins?.coins || 0}** Bow-Bucks!`)
			.then(msg => {
				msg.delete({ timeout: 5000 })
			});
	}
}

export default bal