import { Message, MessageEmbed } from "discord.js";
import BowBot from "../../src/bot";

const ban = {
	desc: 'Ban a user',
	name: 'ban',
	args: '<user id> <reason>',
	type: 'admin',
	run: (message: Message, args: string[], client: BowBot) => {
    if (!message.member?.hasPermission('BAN_MEMBERS')) { return message.react('👎') }
    if (!args.length) {
      return message.reply(`you forgot some arguements.`)
    }
    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId = message.mentions.members?.first()?.id || args.shift();

    if(message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    const user = message.guild?.members.cache.get(userId || '');

    const reason = args.join(' ').trim() === '' ? 'No reason provided.' : args.join(' ').trim();

    if (user) {
      user.ban({ reason })
        .then(() => {
          const embed = new MessageEmbed();
          client.logIssue('Ban', reason, message.author, user?.user || userId || 'User');
          embed.setTitle(`**Banned** ${user?.user.tag || 'User'} (<@${userId}>)`);
          message.channel.send(embed);
        })
        .catch(() => message.reply(`I had issues trying to ban that user!`));
    } else {
      message.guild?.members.ban(userId || '')
      .then(() => {
        const embed = new MessageEmbed();
        client.logIssue('Ban', reason, message.author, userId || 'User');
        embed.setTitle(`**Banned** User (<@${userId}>)`);
        message.channel.send(embed);
      })
      .catch(() => message.reply(`I had issues trying to ban that user!`));
    }

    return;
	}
}

export default ban;