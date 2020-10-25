import { Message, MessageEmbed } from 'discord.js';
import ViviBot from '../../src/bot';

const kick = {
  desc: 'Kick a user',
  name: 'kick',
  args: '<user id> <reason>',
  type: 'admin',
  run: (message: Message, args: string[], client: ViviBot) => {
    if (!message.member?.hasPermission('KICK_MEMBERS')) {
      return message.react('❌');
    }
    if (!args.length) {
      return message.reply(
        `you forgot some arguements. \`${client.config.PREFIX}kick <user id> <reason>\``
      );
    }
    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId = message.mentions.members?.first()?.id || args.shift();

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    const user = message.guild?.members.cache.get(userId || '');

    if (!user) {
      return console.error(`Issue getting user on guild. User ID: ${userId}`);
    }

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    user
      .kick()
      .then(() => {
        const embed = new MessageEmbed();
        client.logIssue(
          message.guild!.id,
          'kick',
          reason,
          message.author,
          user.user
        );
        embed.setTitle(`**Kicked** ${user.user.tag} (<@${user.id}>)`);
        message.channel.send(embed);
      })
      .catch(() => message.reply(`I had issue trying to kick that user!`));
  },
};

export default kick;
