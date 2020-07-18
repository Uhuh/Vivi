import { Message } from "discord.js";
import { DELETE_WARN } from "../../src/setup_tables";

const removeWarn = {
	desc: 'Remove a warning from a user',
	name: 'removeWarn',
	args: '<warn id>',
	type: 'admin',
	run: (message: Message, args: string[]) => {
    if (!args.length) {
      return message.reply(`please supply a user id.`);
    } else if (Number.isNaN(args[0])) {
      return message.reply(`invalid id, make sure it's a number shown in the warnings command.`)
    }
    
    DELETE_WARN(args[0]);

    return message.reply(`done! ...if that warn ID existed at least. (Make sure to check!)`);
  }
}

export default removeWarn;