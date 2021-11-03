import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { CaseType } from '../../src/database/cases';
import { GET_GUILD_CONFIG } from '../../src/database/database';
import { getUserId } from '../../utilities/functions/getUserId';

export const unban = {
  desc: 'Unban a user',
  name: 'unban',
  args: '<user id> <reason>',
  alias: ['ub'],
  type: 'mod',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild) return;
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild.id);

    if (!config) return;

    if (
      !message.member?.permissions.has('BAN_MEMBERS') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    if (!args.length) {
      return message.reply(`you forgot some arguements.`);
    }

    const userId = getUserId(message, args);

    if (message.mentions.members?.first()) args.shift();

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    guild.members
      .unban(userId || '')
      .then(() => {
        client._warnService.logIssue(
          guild.id,
          CaseType.unban,
          reason,
          message.author,
          userId || 'User'
        );
        message.channel.send(`**Unbanned** User (<@${userId}>)`);
      })
      .catch(() => message.reply(`I had issues trying to unban them.`));
    return;
  },
};
