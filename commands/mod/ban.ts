import { Message, MessageEmbed } from "discord.js";
import SetsuBot from "../../src/bot";

const ban = {
	desc: 'Ban a user',
	name: 'ban',
	args: '<user id> <reason>',
	type: 'admin',
	run: async (message: Message, args: string[], client: SetsuBot) => {
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

    const embed = new MessageEmbed();
    if (user) {
      await user.send(
`
Your account has been terminated from our server with reason: "${reason}".
If you would like to appeal your account's termination, you may do so at \`https://forms.gle/vUNc5jDAGRopchFf6\`.

Thank you for your understanding,
  -LLMTF Staff
`
      ).catch(() => console.error('Issue sending ban appeal message to user. Oh well?'));

      user.ban({ reason, days: 7 })
        .then(() => {
          client.logIssue('Ban', reason, message.author, user?.user || userId || 'User');
          embed.setTitle(`**Banned** ${user?.user.tag || 'User'} (<@${userId}>)`);
          message.channel.send(embed);
        })
        .catch(() => message.reply(`I had issues trying to ban that user!`));
    } else {
      message.guild?.members.ban(userId || '')
      .then(() => {
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