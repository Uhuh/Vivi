import { Message } from "discord.js";

const splash = {
	desc: "Splash a user with water.",
	name: "splash",
	args: "<user mention>",
	type: "general",
	run: (message: Message) => {
    const user = message.mentions.members?.first();
    message.delete();
    
    if (!user) {
      return message.channel.send(`But nothing happened!`); //yknow, like magikarp. haha funny
    } else if (user === message.member) {
      return message.channel.send(`<:vivismol:757245413790056608>`);
    }
    return message.reply(`you splash <@${user.id}> with water 💦`);
  }
}

export default splash;