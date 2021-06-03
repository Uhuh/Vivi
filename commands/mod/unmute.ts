import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { GET_GUILD_CONFIG, UNMUTE_USER } from '../../src/database/database';
import { getUserId } from '../../utilities/functions/getUserId';

export const unmute = {
  desc: 'Unmute a user',
  name: 'unmute',
  args: '<user id or mention> <reason>',
  alias: ['um'],
  type: 'mod',
  run: async (message: Message, args: string[], client: ViviBot) => {
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
      const prefix = client.guildPrefix.get(guild.id) || 'v.';
      return message.reply(
        `you forgot some arguements. \`${prefix}unmute <user id> <reason>\``
      );
    }

    if (!config.muteRole) {
      return message.reply(
        `there is no mute role configured for this server. Try \`${config.prefix}setMute <mute roleId/mention>\``
      );
    }

    const userId = getUserId(message, args);

    if (!userId) {
      return message.reply(`missing the user id argument!`);
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
        `couldn't find that user, check that the ID is correct.`
      );
    }

    const reason = args.join(' ').trim() === '' ? '' : args.join(' ').trim();

    client.logIssue(guild.id, 'unmute', reason, message.author, member.user);

    UNMUTE_USER(guild.id, userId)
      .then(() => {
        if (!member) return;
        if (!config.muteRole) {
          return message.reply(
            `I wasn't able to find the mute role in the config.`
          );
        }

        return member.roles
          .remove(config.muteRole)
          .catch(() =>
            message.reply(
              `unable to remove mute role from user. Maybe they left?`
            )
          );
      })
      .catch(() => {
        message.reply(
          `unable to unmute, I don't think they were muted to begin with.`
        );
      });

    message.channel.send(`**Unmuted** ${member.user.tag} (<@${member.id}>)`);
    return;
  },
};
