import { Message, MessageEmbed } from "discord.js";
import SetsuBot from "../../src/bot";
import { REMOVE_MUTE } from "../../src/setup_tables";

const unmute = {
	desc: 'Unmute a user',
	name: 'unmute',
	args: '<user id or mention> <reason>',
	type: 'admin',
	run: (message: Message, args: string[], client: SetsuBot) => {
    if (!message.member?.hasPermission('BAN_MEMBERS')) { return message.react('👎') }
    if (!args.length) {
      return message.reply(`you forgot some arguements. \`${client.config.PREFIX}unmute <user id> <reason>\``)
    }

    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId = message.mentions.members?.first()?.id || args.shift();

    if(!userId) {
      return message.reply(`missing the user id argument!`);
    }

    if(message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    const user = message.guild?.members.cache.get(userId || '');

    if (!user) {
      return message.reply(`couldn't find that user, check that the ID is correct.`);
    }

    const reason = args.join(' ').trim() === '' ? '' : args.join(' ').trim();

    const embed = new MessageEmbed();
    const mute = client.mutes.get(userId);

    if (!mute) {
      return message.reply(`couldn't find a mute case for that user... are they muted? Check the ID.`);
    }

    client.mutes.delete(userId);
    clearTimeout(mute);
    client.logIssue('Unmuted', reason, message.author, user.user);
    embed.setTitle(`**Unmuted** ${user.user.tag} (<@${user.id}>)`);
    REMOVE_MUTE(user.id);
    user.roles.remove(client.muteRole)
      .catch(() => console.error(`Unable to remove mute role from user. Maybe they left?`));

  
    message.channel.send(embed);
    return;
	}
}

export default unmute;