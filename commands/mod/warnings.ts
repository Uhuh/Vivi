import { Message, MessageEmbed } from "discord.js";
import { GET_USER_WARN } from "../../src/setup_tables";
import * as moment from 'moment';

const warnings = {
	desc: 'List a users warnings',
	name: 'warnings',
	args: '<user id>',
	type: 'admin',
	run: (message: Message, args: string[]) => {
    if (!args.length) {
      return message.reply(`please supply a user id.`);
    }
    

    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId = message.mentions.members?.first()?.id || args.shift();

    if (message.mentions.members?.first()) args.shift();

    if (!userId) {
      return message.reply(`please provide a user id or mention.`);
    } else if (Number.isNaN(Number(userId))) {
      return message.reply(`user ids are numbers. Please try again.`);
    }

    const userWarnings = GET_USER_WARN(userId);
    const embed = new MessageEmbed();

    console.log(userWarnings);

    embed
      .setTitle(`**Warnings - User : ${args[0]}**`)
      .setDescription(`**Total:** \`${userWarnings.length}\``);

    for (const warn of userWarnings) {
      const user = message.guild?.members.cache.get(warn.reporter);
      embed.addField(`#${warn.id}: \`${
        moment.unix(warn.date).format('MMMM Do YYYY, h:mm:ss a')
      }\` - By: **${user?.user.tag || 'Unknown'}** (${warn.reporter})`, `**Reason:** ${warn.reason}`);
    }

    return message.channel.send(embed);
  }
}

export default warnings;