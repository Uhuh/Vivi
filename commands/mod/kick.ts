import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { CaseType } from '../../src/database/cases';
import { GET_GUILD_CONFIG } from '../../src/database/database';
import { getUserId } from '../../utilities/functions/getUserId';

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
      !message.member?.permissions.has('KICK_MEMBERS') &&
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

    const userId = getUserId(message, args);

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    let member = await ViviBot.getGuildMember(guild, userId);

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
        client._warnService.logIssue(
          guild.id,
          CaseType.kick,
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
