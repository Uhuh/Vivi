import { Message, MessageEmbed } from 'discord.js';
import ViviBot from '../../src/bot';

const unban = {
  desc: 'Unban a user',
  name: 'unban',
  args: '<user id> <reason>',
  type: 'admin',
  run: (message: Message, args: string[], client: ViviBot) => {
    if (!message.member?.hasPermission('BAN_MEMBERS')) {
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
        const embed = new MessageEmbed();
        client.logIssue(
          message.guild?.id!,
          'unban',
          reason,
          message.author,
          userId || 'User'
        );
        embed.setTitle(`**Unbanned** User (<@${userId}>)`);
        message.channel.send(embed);
      })
      .catch(() => message.reply(`I had issues trying to unban them.`));
    return;
  },
};

export default unban;
