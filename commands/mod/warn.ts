import { Message } from "discord.js";
import BowBot from "../../src/bot";
import { GET_USER_WARN, SET_WARN } from "../../src/setup_tables";
import * as moment from 'moment';

const warn = {
	desc: 'warn a user',
	name: 'warn',
	args: '<user id> <reason>',
	type: 'admin',
	run: async (message: Message, args: string[], client: BowBot) => {
    if (!message.member?.hasPermission("MANAGE_MESSAGES")) { return message.react('❌') }
    if (!args.length) {
      return message.reply(`you forgot some arguements. \`${client.config.PREFIX}warn <user id> <reason>\``)
    }

    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId = message.mentions.members?.first()?.id || args.shift();

    if(message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    const user = message.guild?.members.cache.get(userId || '');

    if (!user) {
      return message.reply(`Issue finding that user with that user id. Make sure you copied the ID correctly.`);
    }

    let userWarnings = GET_USER_WARN(userId || '');

    if(!userWarnings) userWarnings = [];

    const WEEK_OLD = moment().subtract(8, 'days').startOf('day');
    let activeWarns = 0;

    for (const warn of userWarnings) {
      if (moment.unix(warn.date).isBefore(WEEK_OLD)) continue;
      activeWarns++;
    }

    ++activeWarns;

    const reason = args.join(' ').trim() === '' ? 'No reason provided.' : args.join(' ').trim();
    console.log()
    if (activeWarns > 3) {
      message.channel.send(`Banned ${user.displayName} for getting more than 3 strikes.`);
      await user.send(
`
Your account has been terminated from our server with reason: "${reason}".
If you would like to appeal your account's termination, you may do so at \`loveletterappeal@gmail.com\` with the following format:
Subject: "Ban appeal [User ID]"
Content: [Inquiry, apology or complaint]
Your message may contain attachments for evidence.

= = = Warn list = = =
${userWarnings.map(w => `  - ID: ${w.id} | Reason: ${w.reason}\n`).join('')}

Thank you for your understanding,
  -LLMTF Staff
`
        ).catch(() => console.error('Issue sending ban appeal message to user. Oh well?'));
      user.ban().catch(() => message.channel.send(`Issues banning user.`));
      SET_WARN(user.id, reason, message.author.id, WEEK_OLD.unix());
      client.logIssue('AutoMod: Ban', `Strike! You're out! **Reason:** ${reason}`, message.author, user.user)
    } else {
      message.channel.send(`<@${user.id}> You've been warned for \`${reason}\`. You have ${activeWarns} strike${activeWarns > 1 ? 's' : ''} now.`);
      SET_WARN(user.id, reason, message.author.id);
      client.logIssue('Warn', reason, message.author, user.user);
      user.send(`You have been warned!\n**Reason:** ${reason}`)
        .catch(() => console.error(`Can't DM user, probably has friends on.`));
      message.delete().catch(() => console.error(`Issues deleting the message!`));
    }

    return;
	}
}

export default warn;