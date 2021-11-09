import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import * as moment from 'moment';
import { GET_GUILD_CONFIG, GET_USER_WARNS } from '../../src/database/database';
import { getUserId } from '../../utilities/functions/getUserId';
import { CaseType } from '../../src/database/cases';
import { LogService } from '../../src/services/logService';

export const warn = {
  desc: 'warn a user',
  name: 'warn',
  args: '<user id> <reason>',
  alias: ['w'],
  type: 'mod',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild) return;
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild.id);

    if (!config) return;

    if (
      !message.member?.permissions.has('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }

    if (!args.length) {
      const prefix = client.guildPrefix.get(guild.id) || 'v.';
      return message.reply(
        `To warn a user please mention them or pass their ID. \`${prefix}warn <user id> <reason>\``
      );
    }

    const userId = getUserId(message, args);

    if (!userId) {
      return message.reply(
        `Please mention a user or pass their ID to warn them.`
      );
    }

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    await guild.members
      .fetch(userId)
      .catch(() =>
        LogService.logError(
          `Failed to get user to warn. Probably message ID. [${userId}]`
        )
      );

    // User to warns
    const user = guild.members.cache.get(userId);

    if (!user) {
      return message.reply(
        `Issue finding that user with that user id. Make sure you copied the ID correctly.`
      );
    } else if (user.user.bot) {
      return message.reply(`There's no point in warning a bot.`);
    }

    let userWarnings = await GET_USER_WARNS(guild.id, user.id);

    if (!userWarnings) userWarnings = [];

    const WEEK_OLD = moment()
      .subtract(config?.warnLifeSpan, 'days')
      .startOf('day');
    let activeWarns = 0;

    for (const warn of userWarnings) {
      if (moment(warn.creationDate).isBefore(WEEK_OLD)) continue;
      activeWarns++;
    }

    ++activeWarns;

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    if (!config.maxWarns) {
      message.reply(
        `Seems I couldn't determine the max warns for the server...`
      );
      return LogService.logError(`Missing maxWarns for guild[${guild.id}]`);
    }

    if (activeWarns > config.maxWarns) {
      // Tell everyone how bad this user is lol
      message.channel.send(
        `Banned ${user.displayName} for getting more than the max warns. (${activeWarns}/${config.maxWarns})`
      );

      const banMessage =
        config.banMessage || `You've been banned from ${guild.name}.`;

      // Send the user the servers ban message.
      await user
        .send(banMessage)
        .catch(() =>
          LogService.logError(
            'Issue sending ban appeal message to user. Oh well?'
          )
        );

      // After sending the ban message, ban the user.
      user.ban().catch(() => message.channel.send(`Issues banning user.`));

      client._warnService.logIssue(
        guild.id,
        CaseType.ban,
        reason === 'No reason provided. User surpassed max warns' ? '' : reason,
        message.author,
        user.user
      );
    } else {
      /**
       * This happens if the warns DON'T exceed the max warns, so normally warn the user.
       */
      const warnCount =
        activeWarns < config.maxWarns
          ? `You have ${activeWarns} out of ${config.maxWarns} warns now.`
          : `This is your final warning.`;

      message.channel.send(
        `<@${user.id}> You've been warned for \`${reason}\`. ${warnCount}`
      );

      client._warnService.logIssue(
        guild.id,
        CaseType.warn,
        reason === 'No reason provided.' ? '' : reason,
        message.author,
        user.user
      );

      user
        .send(
          `You have been warned in **${guild.name}**\n${warnCount}\n\n**Reason:** ${reason}`
        )
        .catch(() =>
          LogService.logError(`Can't DM user, probably has friends on.`)
        );
      message
        .delete()
        .catch(() => LogService.logError(`Issues deleting the warn message!`));
    }

    return;
  },
};
