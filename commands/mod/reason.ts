import { Message, MessageEmbed, TextChannel, User } from 'discord.js';
import * as moment from 'moment';
import {
  GET_CASE,
  GET_GUILD_CONFIG,
  GET_USER_MUTE,
  UPDATE_USER_MUTE,
  UPDATE_WARN_REASON,
} from '../../src/database/database';

const reason = {
  desc: 'Change the reason for a mod case in #mod-logs',
  name: 'reason',
  args: '<case #> <reason>',
  type: 'admin',
  run: async (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_MESSAGES']))
      return;

    const config = await GET_GUILD_CONFIG(message.guild.id);

    if (!config) {
      return message.reply(`I somehow cannot find the guilds config file.`);
    } else if (!config.modLog) {
      return message.reply(
        `I could not find a mod log channel setup for this server. Set up the mod/server log channel with the logs command.`
      );
    }

    message.delete().catch(console.error);

    const caseId = args.shift();

    if (!caseId) {
      return;
    }

    if (Number.isNaN(Number(caseId))) {
      return message.reply(
        `make sure you entered a case ID. ${caseId} is not a proper number.`
      );
    }

    const reason = args.join(' ');
    const modCase = await GET_CASE(message.guild.id, Number(caseId));
    if (!modCase) {
      return message.channel.send(
        `Could not find a log with that case ID. - ${caseId}`
      );
    }

    const channel = message.guild.channels.cache.get(
      config?.modLog
    ) as TextChannel;

    let caseMessage = channel.messages.cache.get(modCase.messageId);

    if (!caseMessage) {
      await channel.messages
        .fetch(modCase.messageId)
        .catch(() =>
          console.error(
            `Failed to fetch mod log case message: Caase ID: ${modCase.id}`
          )
        );
      caseMessage = channel.messages.cache.get(modCase.messageId);

      if (!caseMessage) return;
    }

    const embed = new MessageEmbed();

    // Just get that stuff, it probably isn't cached.
    await message.guild.members
      .fetch(modCase.userId)
      .catch(() => console.error(`User is not in guild.`));
    await message.guild.members
      .fetch(modCase.modId)
      .catch(() => console.error(`Mod not in guild ????`));

    const user: User | string =
      message.guild.members.cache.get(modCase.userId)?.user || modCase.userId;
    const mod: User | string =
      message.guild.members.cache.get(modCase.modId)?.user || modCase.modId;

    let color = 15158332;

    switch (modCase.type.toLowerCase()) {
      case 'ban':
        color = 15158332;
        break;
      case 'warn':
        UPDATE_WARN_REASON(
          message.guild.id,
          modCase.warnId!,
          args.join(' ').trim()
        );
        if (user instanceof User) {
          user.send(
            `Your warning (ID: ${modCase.warnId}) has a new reason: ${args
              .join(' ')
              .trim()}`
          );
        }
        break;
      case 'mute':
        color = 15844367;
        muteDurationChange(modCase.userId, args.join(' '), message);
        break;
      case 'unmute':
      case 'unban':
        color = 3066993;
        break;
    }

    embed
      .setTitle(`${modCase.type} | Case #${modCase.caseId}`)
      .addField(
        `**User**`,
        `${typeof user === 'string' ? user : user?.tag} (<@${
          typeof user === 'string' ? user : user.id
        }>)`,
        true
      )
      .addField(
        `**Moderator**`,
        mod instanceof User ? mod.tag : `<@${mod}>`,
        true
      )
      .addField(
        `**Reason**`,
        reason === '' ? 'Mod please do `bbreason <case #> <reason>`' : reason
      )
      .setColor(color)
      .setTimestamp(new Date());

    caseMessage.edit(embed);

    return;
  },
};

const muteDurationChange = async (
  userId: string,
  words: string,
  message: Message
) => {
  let [, time] = words.split('|');

  // Default is infinite
  const mutedUser = await GET_USER_MUTE(message.guild?.id!, userId);

  if (!mutedUser) {
    return message.reply(`that user is no longer muted. Remute them!`);
  }

  let unmuteTime = moment().add(1, 'h').unix();

  if (time && time !== '') {
    const timeFormat = time[time.length - 1];
    const num = time.slice(0, -1);

    if (Number.isNaN(Number(num))) {
      return message.reply(`oops! That's not a number for time.`);
    }

    switch (timeFormat) {
      case 'm':
      case 'h':
      case 'd':
      case 'w':
      case 'y':
        unmuteTime = moment
          .unix(mutedUser.dateMuted)
          .add(Number(num), timeFormat)
          .unix();
    }
  } else time = '1h';

  UPDATE_USER_MUTE(message.guild?.id!, userId, unmuteTime);

  await message.guild?.members.fetch(userId);
  const user = message.guild?.members.cache.get(userId);
  await user
    ?.send(`Your mute duration has been changed to ${time.trim()}.`)
    .catch(() =>
      console.error(`Issues updating user on their mute duration change.`)
    );

  return;
};

export default reason;
