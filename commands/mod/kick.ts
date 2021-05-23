import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { GET_GUILD_CONFIG } from '../../src/database/database';
import { CLIENT_ID } from '../../src/vars';

export const kick = {
  desc: 'Kick a user',
  name: 'kick',
  args: '<user id> <reason>',
  alias: ['k'],
  type: 'mod',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild) return;
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild.id);

    if (!config) return;

    if (
      !message.member?.hasPermission('KICK_MEMBERS') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    if (!args.length) {
      const prefix = client.guildPrefix.get(guild.id) || 'v.';
      return message.reply(
        `you forgot some arguements. \`${prefix}kick <user id> <reason>\``
      );
    }
    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId =
      message.mentions.members?.filter((u) => u.id !== CLIENT_ID).first()?.id ||
      args.shift();

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    let member = guild.members.cache.get(userId || '');
    // Try a fetch incase the user isn't cached.
    if (!member) {
      await guild.members
        .fetch(userId || '')
        .catch(() =>
          console.error(
            `Failed to get user to kick. ID is probably a message ID. [${userId}]`
          )
        );
      member = guild.members.cache.get(userId || '');
    }

    if (!member) {
      return console.error(`Issue getting user on guild. User ID: ${userId}`);
    }

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    member
      .kick()
      .then(() => {
        client.logIssue(
          guild.id,
          'kick',
          reason,
          message.author,
          member?.user || 'Missing user ID'
        );
        message.channel.send(
          `**Kicked** ${member?.user.tag} (<@${member?.id}>)`
        );
      })
      .catch(() => message.reply(`I had issue trying to kick that user!`));
  },
};
