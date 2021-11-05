import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { CaseType } from '../../src/database/cases';
import {
  CLEAR_USER_WARNS,
  GET_GUILD_CONFIG,
} from '../../src/database/database';
import { getUserId } from '../../utilities/functions/getUserId';

export const clearwarns = {
  desc: 'Remove all warnings for a user.',
  name: 'clearwarns',
  args: '<user id> <reason>',
  alias: ['cw'],
  type: 'mod',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild) return;
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild.id);

    if (!config) return;

    if (
      !message.member?.permissions.has('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    if (!args.length) {
      const prefix = client.guildPrefix.get(guild.id) || 'v.';
      return message.reply(
        `This command requires a user ID at minimum. Example \`${prefix}clearwarns <user id> <reason>\``
      );
    }

    const userId = getUserId(message, args);

    if (!userId) {
      return message.reply(
        `Please mention a user or pass their ID to warn them.`
      );
    }

    if (message.mentions.members?.first()) args.shift();

    const user = await guild.members.fetch(userId);

    if (!user) {
      return message.reply(
        `Issue finding a user with that user id. Make sure you copied the ID correctly.`
      );
    } else if (user.user.bot) {
      return message.reply(`what use do you have warning a bot...?`);
    }

    const reason =
      args.join(' ').trim() === ''
        ? `<@${message.author.id}> has removed all warnings for user <@${userId}>`
        : args.join(' ').trim();

    client._warnService.logIssue(
      guild.id,
      CaseType.unwarn,
      reason,
      message.author,
      typeof user === 'string' ? user : user.user
    );

    CLEAR_USER_WARNS(guild.id, userId)
      .then(() => {
        if (typeof user !== 'string') {
          user.send(
            `All of your warnings for **${guild.name}** have been removed! :tada:`
          );
        }
        message.reply(
          `Successfully removed all warnings for that user. :tada:`
        );
      })
      .catch(() =>
        message.reply(
          `I encountered an error trying to remove all their warnings.`
        )
      );

    return;
  },
};
