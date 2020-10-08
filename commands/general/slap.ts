import { Message } from "discord.js";

const slap = {
  desc: "Slap a user.",
  name: "slap",
  args: "<user mention>",
  type: "general",
  run: (message: Message) => {
    const user = message.mentions.members?.first();
    message.delete();

    if (!user) {
      return message.reply(`With pleasure~ <:vivismug:757787912577482792>`);
    } else if (user === message.member) {
      return message.reply(`Ouch! That's gotta hurt. <:vivismol:757245413790056608> `);
    }
    return message.reply(`you slapped <@${user.id}>`);
  }
}

export default slap;