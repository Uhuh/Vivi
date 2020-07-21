import { Message, MessageEmbed } from "discord.js";
import BowBot from "../../src/bot";
import * as moment from 'moment';
import { MUTE_USER, REMOVE_MUTE } from "../../src/setup_tables";

const mute = {
	desc: 'Mute a user',
	name: 'mute',
	args: '<user id or mention> <reason> | [number {m,h,d,w,y}]',
	type: 'admin',
	run: (message: Message, args: string[], client: BowBot) => {
    if (!message.member?.hasPermission('BAN_MEMBERS')) { return message.react('👎') }
    if (!args.length) {
      return message.reply(`you forgot some arguements. Example usage: \`${client.config.PREFIX}mute <user id> Annoying! | 5m\``)
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
      return console.error(`Issue getting user on guild. User ID: ${userId}`);
    }

    const words = args.join(' ').trim() === '' ? 'No reason provided.' : args.join(' ').trim();

    const [reason, time] = words.split('|');

    // Default is infinite
    const now = moment().unix();
    let unmuteTime = moment().add(1, 'h').unix();
    
    if(time && time !== '') {
      const timeFormat = time[time.length-1];
      const num = time.slice(0, -1);

      if(Number.isNaN(Number(num))) {
        return message.reply(`oops! That's not a number for time.`);
      }

      switch(timeFormat) {
        case 'm': case 'h': case 'd': case 'w': case 'y':
          unmuteTime = moment().add(Number(num), timeFormat).unix();
      }
    }

    const embed = new MessageEmbed();
    MUTE_USER(userId, now, unmuteTime);
    client.logIssue('Mute', `${reason}\n\nMuted for ${time}`, message.author, user.user);
    embed.setTitle(`**Muted** ${user.user.tag} (<@${user.id}>)`);
    message.channel.send(embed);

    /**
     * Mute user and set up timer to unmute them when the time is right.
     */
    const muteId = '733341358693285979';
    user.roles.add(muteId)
      .then(() => {
        client.mutes.set(
          userId,
          setTimeout(() => {
            REMOVE_MUTE(user.id);
            client.logIssue('AutoMod: Unmute', `Time's up`, client.user!, user.user);
            user.roles.remove(muteId)
              .catch(() => console.error(`Unable to remove mute role from user. Maybe they left?`));
          }, (unmuteTime-now)*1000)
        );
      })
      .catch(() => message.reply(`I was unable to give that user the mute role!`));

    
    return;
	}
}

export default mute;