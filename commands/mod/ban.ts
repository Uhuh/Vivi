import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { CaseType } from '../../src/database/cases';
import { GET_GUILD_CONFIG } from '../../src/database/database';
import { getUserId } from '../../utilities/functions/getUserId';

export const ban = {
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

    // Ensure the user is in the guild
    const member = guild.members.cache.get(userId || '');

    if (member?.permissions.has('BAN_MEMBERS')) {
      return message.reply(`you can't ban them lol.`);
    }

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    if (member) {
      const banMessage =
        config.banMessage || `You've been banned from ${guild.name}.`;
      await member
        .send(banMessage)
        .catch(() =>
          console.error('Issue sending ban appeal message to member. Oh well?')
        );

      member
        .ban({ reason })
        .then(() => {
          client._warnService.logIssue(
            guild.id,
            CaseType.ban,
            reason,
            message.author,
            member.user || userId || 'User'
          );
          message.channel.send(
            `**Banned** ${member?.user.tag || 'User'} (<@${userId}>)`
          );
        })
        .catch(() => message.reply(`I had issues trying to ban that user!`));
    } else {
      guild.members
        .ban(userId || '')
        .then(() => {
          client._warnService.logIssue(
            guild.id,
            CaseType.ban,
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
