import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { GET_GUILD_CONFIG, UNMUTE_USER } from '../../src/database/database';

const unmute = {
  desc: 'Unmute a user',
  name: 'unmute',
  args: '<user id or mention> <reason>',
  type: 'mod',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
      return message.react('👎');
    }
    if (!args.length) {
      const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';
      return message.reply(
        `you forgot some arguements. \`${prefix}unmute <user id> <reason>\``
      );
    }
    const { guild } = message;
    if (!guild) return;
    const config = await GET_GUILD_CONFIG(guild.id);
    if (!config) return;

    if (!config.muteRole) {
      return message.reply(
        `there is no mute role configured for this server. Try \`${config.prefix}setMute <mute roleId/mention>\``
      );
    }

    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId = message.mentions.members?.first()?.id || args.shift();

    if (!userId) {
      return message.reply(`missing the user id argument!`);
    }

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    const user = message.guild?.members.cache.get(userId || '');

    if (!user) {
      return message.reply(
        `couldn't find that user, check that the ID is correct.`
      );
    }

    const reason = args.join(' ').trim() === '' ? '' : args.join(' ').trim();

    client.logIssue(guild.id, 'unmute', reason, message.author, user.user);

    UNMUTE_USER(guild.id, userId)
      .then(() => {
        user.roles
          .remove(config.muteRole!)
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

    message.channel.send(`**Unmuted** ${user.user.tag} (<@${user.id}>)`);
    return;
  },
};

export default unmute;
