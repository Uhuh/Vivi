import { Message } from "discord.js";

const stalk = {
	desc: "stalk a user.",
	name: "stalk",
	args: "<user mention>",
	type: "general",
	run: (message: Message) => {
    const user = message.mentions.members?.first();
    
    if (!user) {
      return message.reply(`you can't stalk nothing.. <:SetsuConfused:739980857615319151>`);
    } else if (user === message.member) {
      return message.reply(`you can't stalk yourself. <:SetsuCry:740056013369245756>`);
    }

    return message.reply(`you stalked <@${user.id}> <:SetsuKnife:739600586995138604>`);
	}
}

export default stalk;