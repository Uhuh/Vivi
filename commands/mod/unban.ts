import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { GET_GUILD_CONFIG } from '../../src/database/database';

const unban = {
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
      !message.member?.hasPermission('BAN_MEMBERS') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    if (!args.length) {
      return message.reply(`you forgot some arguements.`);
    }
    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId = message.mentions.members?.first()?.id || args.shift();

    if (message.mentions.members?.first()) args.shift();

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    message.guild?.members
      .unban(userId || '')
      .then(() => {
        client.logIssue(
          message.guild?.id!,
          'unban',
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

export default unban;
