import { Message } from "discord.js";

const kiss = {
	desc: "Kiss a user.",
	name: "kiss",
	args: "<user mention>",
	type: "general",
	run: (message: Message) => {
    const user = message.mentions.members?.first();
    message.delete();
    
    if (!user) {
      return message.reply(`I rather not kiss you... Cooties <:vivicringe:757245413072830486>`);
    } else if (user === message.member) {
      return message.reply(`You can't kiss yourself! That's weird... And sad... <:vividread:758005084255682570>`);
    }
    return message.reply(`you kissed <@${user.id}>`);
  }
}

export default kiss;