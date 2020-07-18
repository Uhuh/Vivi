import { Message } from "discord.js";
import BowBot from "../../src/bot";
import { GET_USER_WARN, SET_WARN } from "../../src/setup_tables";

const warn = {
	desc: 'warn a user',
	name: 'warn',
	args: '<user id> <reason>',
	type: 'admin',
	run: (message: Message, args: string[], client: BowBot) => {
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
      return console.error(`Issue getting user on guild. User ID: ${userId}`);
    }

    let userWarnings = GET_USER_WARN(userId || '');

    if(!userWarnings) userWarnings = [];

    let numWarns = userWarnings.length

    const reason = args.join(' ').trim() === '' ? 'No reason provided.' : args.join(' ').trim();

    switch (numWarns) {
      case 3: // If they're at three strikes they get banned on the 4th :)
        message.channel.send(`Banned ${user.displayName} for getting more than 3 strikes.`);
        user.ban().catch(() => message.channel.send(`Issues banning user.`));
        client.logIssue('AutoMod: Ban', `Strike! You're out!`, client.user!, user.user)
        return;
      default:
        message.channel.send(`<@${user.id}> You've been warned for \`${reason}\`. You have ${++numWarns} strike${numWarns > 1 ? 's' : ''} now.`);
        SET_WARN(user.id, reason, message.author.id);
        client.logIssue('Warn', reason, message.author, user.user);
        user.send(`You have been warned!\n**Reason:** ${reason}`)
          .catch(() => console.error(`Can't DM user, probably has friends on.`));
        message.delete().catch(() => console.error(`Issues deleting the message!`));
    }
	}
}

export default warn;