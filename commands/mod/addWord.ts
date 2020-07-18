import { Message } from "discord.js";
import BowBot from "../../src/bot";
import { SET_WORD } from "../../src/setup_tables";

const addword = {
	desc: 'Add a word or list of words to banned list',
	name: 'addWord',
	args: '<list of words separated by a comma>',
	type: 'admin',
	run: (message: Message, args: string[], client: BowBot) => {
		if (!message.guild || !message.member?.hasPermission(["MANAGE_GUILD"])) return;
    const words = args.join('').split(',');
    
    for(const word of words) {
      SET_WORD(word);
      client.bannedWords.push(word);
    }

    message.reply(`successfully added the words to the banned list.`);
	}
}

export default addword