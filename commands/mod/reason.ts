import { Message, MessageEmbed, TextChannel, User } from 'discord.js';
import * as moment from 'moment';
import {
  GET_CASE,
  GET_GUILD_CONFIG,
  GET_USER_MUTE,
  UPDATE_CASE_REASON,
  UPDATE_USER_MUTE,
} from '../../src/database/database';
import { LogService } from '../../src/services/logService';
import { Category } from '../../utilities/types/commands';
import { COLOR } from '../../utilities/types/global';

export const reason = {
  desc: 'Change the reason for a mod case in #mod-logs',
  name: 'reason',
  args: '<case #> <reason>',
  alias: ['r'],
  type: Category.mod,
  run: async (message: Message, args: string[]) => {
    if (!message.guild) return;
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild.id);

    if (!config) return;

    if (
      !message.member?.permissions.has('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    )
      return;

    if (!config) {
      return message.reply(
        `Cannot find this servers config. Try again, and if it fails try running \`v.config setup\``
      );
    } else if (!config.modLog) {
      return message.reply(
        `I could not find a mod log channel setup for this server. Set up the mod/server log channel with the logs command.`
      );
    }

    const caseId = args.shift();

    if (!caseId) {
      return;
    }

    if (Number.isNaN(Number(caseId))) {
      return message.reply(
        `Make sure you entered a case ID. ${caseId} is not a proper number.`
      );
    }

    const reason = args.join(' ');
    const modCase = await GET_CASE(message.guild.id, Number(caseId));
    if (!modCase) {
      return message.reply(`Could not find a log with case ID ${caseId}.`);
    }

    const channel = message.guild.channels.cache.get(
      config?.modLog
    ) as TextChannel;

    const caseMessage = await channel.messages
      .fetch(modCase.messageId ?? '')
      .catch(() =>
        LogService.logError(
          `Failed to fetch mod log case message: Case ID: ${modCase.id}`
        )
      );

    // Just get that stuff, it probably isn't cached.
    await Promise.all([
      message.guild.members
        .fetch(modCase.userId)
        .catch(() => LogService.logError(`User is not in guild.`)),
      message.guild.members
        .fetch(modCase.modId)
        .catch(() => LogService.logError(`Mod not in guild ????`)),
    ]);

    const user: User | string =
      message.guild.members.cache.get(modCase.userId)?.user || modCase.userId;
    const mod: User | string =
      message.guild.members.cache.get(modCase.modId)?.user || modCase.modId;

    let color = COLOR.DEFAULT;

    switch (modCase.type.toLowerCase()) {
      case 'ban':
        color = COLOR.RED;
        break;
      case 'warn':
        UPDATE_CASE_REASON(
          message.guild.id,
          modCase.caseId,
          args.join(' ').trim()
        );
        if (user instanceof User) {
          user.send(
            `**Your warning (ID: ${modCase.caseId}) has changed reason**: ${args
              .join(' ')
              .trim()}`
          );
        }
        break;
      case 'mute':
        color = COLOR.YELLOW;
        muteDurationChange(modCase.userId, args.join(' '), message);
        break;
      case 'unmute':
      case 'unban':
      case 'unwarn':
        color = COLOR.GREEN;
        break;
    }

    if (caseMessage) {
      const embed = new MessageEmbed();

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
          reason === '' || !reason
            ? `Mod please do \`${config.prefix}reason ${modCase.caseId} <reason>\``
            : reason
        )
        .setColor(color)
        .setTimestamp(new Date());

      caseMessage.edit({ embeds: [embed] });
    } else {
      message.reply(`Hey! I updated the warn reason.`);
    }

    message
      .delete()
      .catch(() =>
        LogService.logError(
          `Failed to delete reason message for guild[${guild.id}]`
        )
      );

    return;
  },
};

const muteDurationChange = async (
  userId: string,
  words: string,
  message: Message
) => {
  let [, time] = words.split('|');
  const { guild } = message;
  if (!guild) return;

  // Default is infinite
  const mutedUser = await GET_USER_MUTE(guild.id, userId);

  if (!mutedUser) {
    return message.reply(`That user isn't currently muted.`);
  }

  let unmuteTime = moment().add(1, 'h').toDate();

  if (time && time !== '') {
    const timeFormat = time[time.length - 1];
    const num = time.slice(0, -1);

    if (Number.isNaN(Number(num))) {
      return message.reply(
        `Please send a number before the time format. Example \`@Vivi mute <@user> <reason> | 1h\` \`1h\` means 1 hour.\nIt's important to note you need to use | to separate the user mention and reason from the time.`
      );
    }

    switch (timeFormat) {
      case 'm':
      case 'h':
      case 'd':
      case 'w':
      case 'y':
        unmuteTime = moment(mutedUser.creationDate)
          .add(Number(num), timeFormat)
          .toDate();
    }
  } else time = '1h';

  UPDATE_USER_MUTE(guild.id, userId, unmuteTime);

  await guild.members.fetch(userId);
  const user = guild.members.cache.get(userId);
  await user
    ?.send(
      `Your mute duration has been changed. You will now be unmuted <t:${moment(
        unmuteTime
      ).unix()}:R>.`
    )
    .catch(() =>
      LogService.logError(`Issues updating user on their mute duration change.`)
    );

  return;
};
