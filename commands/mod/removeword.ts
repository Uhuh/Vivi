import { Message } from "discord.js";
import BowBot from "../../src/bot";
import { REMOVE_WORD } from "../../src/setup_tables";

const listWords = {
	desc: 'Remove word(s) from banned list (comma separate)',
	name: 'removeword',
	args: '',
	type: 'admin',
	run: (message: Message, args: string[], client: BowBot) => {
		if (!message.guild || !message.member?.hasPermission(["MANAGE_CHANNELS"])) return;
    const words = args.join('').split(',');

    for(const word of words) {
      REMOVE_WORD(word.toLowerCase());
      client.bannedWords.splice(client.bannedWords.indexOf(word.toLowerCase()), 1);
    }

    message.channel.send(`Successfully removed the words.`);
	}
}

export default listWords;