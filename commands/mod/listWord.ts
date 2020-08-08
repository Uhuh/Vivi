import { Message } from "discord.js";
import SetsuBot from "../../src/bot";

const listWords = {
	desc: 'List of currently banned words. (Trigger warning)',
	name: 'listwords',
	args: '',
	type: 'admin',
	run: (message: Message, _args: string[], client: SetsuBot) => {
    if (!message.guild || !message.member?.hasPermission(["MANAGE_CHANNELS"])) return;
    const words = client.bannedStrings.map(w => `\`ID: ${w.id} --- Regex: ${w.word}\`\n`).join('');

		message.channel.send(
			`Remove by using the appropriate ID\n${words === '' ? 'No banned words.' : words}`
		);
	}
}

export default listWords;