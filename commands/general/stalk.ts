import { Message } from "discord.js";

const stalk = {
	desc: "stalk a user.",
	name: "stalk",
	args: "<user mention>",
	type: "general",
	run: (message: Message) => {
    const user = message.mentions.members?.first();
    
    if (!user) {
      return message.reply(`you can't stalk nothing.. :SetsuConfused:`);
    } else if (user === message.member) {
      return message.reply(`you can't stalk yourself. :SetsuCry:`);
    }

    return message.reply(`you stalked <@${user.id}> :SetsuKnife:`);
	}
}

export default stalk;