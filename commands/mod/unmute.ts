import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { CaseType } from '../../src/database/cases';
import { GET_GUILD_CONFIG, UNMUTE_USER } from '../../src/database/database';
import { getUserId } from '../../utilities/functions/getUserId';
import { Category } from '../../utilities/types/commands';

export const unmute = {
  desc: 'Unmute a user',
  name: 'unmute',
  args: '<user id or mention> <reason>',
  alias: ['um'],
  type: Category.mod,
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
        `I require a user mention or ID to unmute. Example: \`${prefix}unmute <user id> <reason>\``
      );
    }

    if (!config.muteRole) {
      return message.reply(
        `No mute role is configured. Try this \`${config.prefix}mute-role <role mention / role id>\``
      );
    }

    const userId = getUserId(message, args);

    if (!userId) {
      return message.reply(
        `You need to mention a user or pass their ID to unmute them.`
      );
    }

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    let member = guild.members.cache.get(userId || '');

    // Try a fetch incase the user isn't cached.
    if (!member) {
      await guild.members.fetch(userId || '');
      member = guild.members.cache.get(userId || '');
    }

    if (!member) {
      return message.reply(
        `I couldn't find that user, check that the user ID is correct.`
      );
    }

    const reason = args.join(' ').trim() === '' ? '' : args.join(' ').trim();

    client._warnService.logIssue(
      guild.id,
      CaseType.unmute,
      reason,
      message.author,
      member.user
    );

    UNMUTE_USER(guild.id, userId)
      .then(() => {
        if (!member) return;
        if (!config.muteRole) {
          return message.reply(
            `I couldn't find the servers set mute role. Check the mute role is setup and try again.`
          );
        }

        return member.roles
          .remove(config.muteRole)
          .catch(() =>
            message.reply(
              `I was unable to remove the mute role from the user. It's possible they left the server.`
            )
          );
      })
      .catch(() => {
        message.reply(
          `I had an issue trying to unmute that user. It's possible they aren't muted.`
        );
      });

    message.channel.send(`**Unmuted** ${member.user.tag} (<@${member.id}>)`);
    return;
  },
};
