import { Message, MessageEmbed } from 'discord.js';
import * as moment from 'moment';
import { GET_GUILD_CONFIG, GET_USER_WARNS } from '../../src/database/database';
import { getUserId } from '../../utilities/functions/getUserId';
import { missingPerms } from '../../utilities/functions/missingPerm';

export const checkwarns = {
  desc:
    'List a users warnings, get their active warnings by using the active tag after the id\n' +
    'Active warns are warns that have not expired yet.',
  name: 'checkwarns',
  args: '<user id> [active]',
  alias: ['cw'],
  type: 'mod',
  run: async (message: Message, args: string[]) => {
    if (!message.guild) return;
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild.id);

    if (!config) return;

    if (
      !message.member?.hasPermission('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    if (!args.length) {
      return message.reply(`please supply a user id.`);
    }

    const userId = getUserId(message, args);

    if (message.mentions.members?.first()) args.shift();

    if (!userId) {
      return message.reply(`please provide a user id or mention.`);
    } else if (Number.isNaN(Number(userId))) {
      return message.reply(`user ids are numbers. Please try again.`);
    }

    const warns = await GET_USER_WARNS(guild.id, userId);

    const embed = new MessageEmbed();
    const active = args.shift() || 'not';
    const WARN_EXPIRE_DATE = moment()
      .subtract(config?.warnLifeSpan, 'days')
      .startOf('day');

    embed
      .setTitle(
        `**${
          active.includes('active') ? 'Active' : 'All'
        } Warnings - User : ${userId}**`
      )
      .setDescription(
        `**Total:** \`${warns.length}\`**IDs**: ${warns
          .map((w) => w.warnId)
          .join(', ')}`
      );

    for (const warn of warns) {
      if (
        active.includes('active') &&
        moment.unix(Number(warn.date)).isBefore(WARN_EXPIRE_DATE)
      )
        continue;
      const user = message.guild?.members.cache.get(warn.modId);
      embed.addField(
        `#${warn.warnId}: ${
          moment.unix(Number(warn.date)).isBefore(WARN_EXPIRE_DATE)
            ? '❌'
            : '✅'
        } \`${moment
          .unix(Number(warn.date))
          .format('MMMM Do YYYY, h:mm:ss a')}\` - By: **${
          user?.user.tag || 'Unknown'
        }** (${warn.modId})`,
        `**Reason:** ${warn.reason}`
      );
    }

    return message.channel
      .send(embed)
      .catch(() => missingPerms(message, 'embed'));
  },
};
