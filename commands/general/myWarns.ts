import { Message, MessageEmbed } from "discord.js";
import * as moment from 'moment';
import { GET_USER_WARN } from "../../src/setup_tables";

export default {
  desc: 'List your current warns in your DMs',
  name: 'mywarns',
  args: '',
  type: 'general',
  run: (message: Message) => {
    const userId = message.author.id

    if (!userId) {
      return message.reply(`please provide a user id or mention.`);
    } else if (Number.isNaN(Number(userId))) {
      return message.reply(`user ids are numbers. Please try again.`);
    }

    const userWarnings = GET_USER_WARN(userId);
    const embed = new MessageEmbed();
    const WEEK_OLD = moment().subtract(7, 'days').startOf('day');

    embed
      .setTitle(`**Your Warnings**`)
      .setDescription(`**Total:** \`${userWarnings.length}\`**IDs**: ${userWarnings.map(w => w.id).join(', ')}`);

    for (const warn of userWarnings) {
      const user = message.guild?.members.cache.get(warn.reporter);
      embed.addField(`#${warn.id}: ${moment.unix(warn.date).isBefore(WEEK_OLD) ? '❌' : '✅'} \`${moment.unix(warn.date).format('MMMM Do YYYY, h:mm:ss a')
        }\` - By: **${user?.user.tag || 'Unknown'}** (${warn.reporter})`, `**Reason:** ${warn.reason}`);
    }

    return message.author.send(embed)
      .catch(() => message.reply(`I couldn't DM you! Make sure to allow non friends to DM you.`));
  }
}
