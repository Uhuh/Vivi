import { Message, MessageEmbed, TextChannel, User } from "discord.js";
import SetsuBot from "../../src/bot";
import { GET_CASE, GET_USER_MUTE, REMOVE_MUTE, MUTE_USER, WARN_REASON } from '../../src/setup_tables';
import * as moment from 'moment';

const reason = {
	desc: 'Change the reason for a mod case in #mod-logs',
	name: 'reason',
	args: '<case #> <reason>',
	type: 'admin',
	run: async (message: Message, args: string[], client: SetsuBot) => {
    if (!message.guild || !message.member?.hasPermission(["MANAGE_MESSAGES"])) return;

    message.delete()
      .catch(console.error);

    const caseId = args.shift();

    if (!caseId) {
      return;
    }

    const reason = args.join(' ');
    const modCase = GET_CASE(caseId);
    if (!modCase) {
      return message.channel.send(`Could not find a log with that case ID. - ${caseId}`);
    }

    const channel = message.guild.channels.cache.get(client.config.MOD_LOGS) as TextChannel;
    
    let caseMessage = channel.messages.cache.get(modCase.message_id);

    if (!caseMessage) {
      await channel.messages.fetch(modCase.message_id)
        .catch(() => console.error(`Failed to fetch mod log case message: Caase ID: ${modCase.id}`));
      caseMessage = channel.messages.cache.get(modCase.message_id);
      
      if (!caseMessage) return;
    }

    const embed = new MessageEmbed();

    // Just get that stuff, it probably isn't cached.
    await message.guild.members.fetch(modCase.user_id).catch(() => console.error(`User is not in guild.`));
    await message.guild.members.fetch(modCase.mod_id).catch(() => console.error(`Mod not in guild ????`));

    const user: User | string = message.guild.members.cache.get(modCase.user_id)?.user || modCase.user_id;
    const mod: User | string = message.guild.members.cache.get(modCase.mod_id)?.user || modCase.mod_id;

    let color = 15158332;

    switch(modCase.type.toLowerCase()) {
      case 'ban': color = 15158332; break;
      case 'warn':
        WARN_REASON(modCase.warn_id, args.join(' ').trim());
        if (user instanceof User) {
          user.send(`Your warning (ID: ${modCase.warn_id}) has a new reason: ${args.join(' ').trim()}`);
        }
        break;
      case 'mute': 
        color = 15844367; 
        muteDurationChange(modCase.user_id, args.join(' '), message, client);
        break;
      case 'unmute': case 'unban': color = 3066993; break;
    }

    embed.setTitle(`${modCase.type} | Case #${modCase.id}`)
      .addField(`**User**`, `${(typeof user === 'string' ? user : user?.tag) } (<@${(typeof user === 'string' ? user : user.id)}>)`, true)
      .addField(`**Moderator**`, mod instanceof User ? mod.tag : `<@${mod}>`, true)
      .addField(`**Reason**`, reason === '' ? 'Mod please do `bbreason <case #> <reason>`' : reason)
      .setColor(color)
      .setTimestamp(new Date());

    caseMessage.edit(embed);

    return;
	}
}

const muteDurationChange = async (userId: string, words: string, message: Message, client: SetsuBot) => {
  let [, time] = words.split('|');

  // Default is infinite
  const muteRow = GET_USER_MUTE(userId);
  const timeMuted = moment.unix(muteRow.date_muted).unix();
  let unmuteTime = moment().add(1, 'h').unix();
  
  if (time && time !== '') {
    const timeFormat = time[time.length-1];
    const num = time.slice(0, -1);

    if(Number.isNaN(Number(num))) {
      return message.reply(`oops! That's not a number for time.`);
    }

    switch(timeFormat) {
      case 'm': case 'h': case 'd': case 'w': case 'y':
        unmuteTime = moment.unix(muteRow.date_muted).add(Number(num), timeFormat).unix();
    }
  } else time = '1h';

  const userMute = client.mutes.get(userId);
  if (!userMute) return;
  clearTimeout(userMute);
  client.mutes.delete(userId);
  REMOVE_MUTE(userId);

  MUTE_USER(userId, timeMuted, unmuteTime);

  await message.guild?.members.fetch(userId);
  const user = message.guild?.members.cache.get(userId);
  await user?.send(`Your mute duration has been changed to ${time.trim()}.`)
    .catch(() => console.error(`Issues updating user on their mute duration change.`));

  return client.mutes.set(
    userId,
    setTimeout(() => {
      const muteId = '733341358693285979';
      client.mutes.delete(userId);
        REMOVE_MUTE(userId);
        client.logIssue('AutoMod: Unmute', `Time's up`, client.user!, user?.user || userId);
        user?.roles.remove(muteId)
          .catch(() => console.error(`Unable to remove mute role from user. Maybe they left?`));
    }, (unmuteTime-timeMuted)*1000)
  );
}

export default reason;