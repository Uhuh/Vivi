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
    const userWarnings = GET_USER_WARN(args[0]);
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