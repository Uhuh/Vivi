import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { GET_GUILD_CONFIG } from '../../src/database/database';

const ban = {
  desc: 'Ban a user',
  name: 'ban',
  args: '<user id> <reason>',
  alias: ['b'],
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

    // Ensure the user is in the guild
    const user = message.guild?.members.cache.get(userId || '');

    if (user?.hasPermission('BAN_MEMBERS')) {
      return message.reply(`you can't ban them lol.`);
    }

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    if (user) {
      const banMessage =
        config.banMessage || `You've been banned from ${guild.name}.`;
      await user
        .send(banMessage)
        .catch(() =>
          console.error('Issue sending ban appeal message to user. Oh well?')
        );

      user
        .ban({ reason })
        .then(() => {
          client.logIssue(
            message.guild?.id!,
            'ban',
            reason,
            message.author,
            user?.user || userId || 'User'
          );
          message.channel.send(
            `**Banned** ${user?.user.tag || 'User'} (<@${userId}>)`
          );
        })
        .catch(() => message.reply(`I had issues trying to ban that user!`));
    } else {
      message.guild?.members
        .ban(userId || '')
        .then(() => {
          client.logIssue(
            guild.id,
            'ban',
            reason,
            message.author,
            userId || 'User'
          );
          message.channel.send(`**Banned** User (<@${userId}>)`);
        })
        .catch(() => message.reply(`I had issues trying to ban that user!`));
    }

    return;
  },
};

export default ban;
