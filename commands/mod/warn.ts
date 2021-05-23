import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import * as moment from 'moment';
import {
  CREATE_WARN,
  GET_GUILD_CONFIG,
  GET_USER_WARNS,
} from '../../src/database/database';
import { getUserId } from '../../utilities/functions/getUserId';

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
      !message.member?.hasPermission('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }

    if (!args.length) {
      const prefix = client.guildPrefix.get(guild.id) || 'v.';
      return message.reply(
        `you forgot some arguements. \`${prefix}warn <user id> <reason>\``
      );
    }

    const userId = getUserId(message, args);

    if (!userId) {
      return message.reply(
        `please mention a user or pass their ID to warn them.`
      );
    }

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    await guild.members
      .fetch(userId)
      .catch(() =>
        console.error(
          `Failed to get user to warn. Probably message ID. [${userId}]`
        )
      );

    const user = guild.members.cache.get(userId);

    if (!user) {
      return message.reply(
        `Issue finding that user with that user id. Make sure you copied the ID correctly.`
      );
    } else if (user.user.bot) {
      return message.reply(`what use do you have warning a bot...?`);
    }

    let userWarnings = await GET_USER_WARNS(guild.id, user.id);

    if (!userWarnings) userWarnings = [];

    const WEEK_OLD = moment()
      .subtract(config?.warnLifeSpan, 'days')
      .startOf('day');
    let activeWarns = 0;

    for (const warn of userWarnings) {
      if (moment.unix(warn.date).isBefore(WEEK_OLD)) continue;
      activeWarns++;
    }

    ++activeWarns;

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    if (!config.maxWarns) {
      return console.error(`Missing maxWarns for guild[${guild.id}]`);
    }

    if (activeWarns > config.maxWarns) {
      message.channel.send(
        `Banned ${user.displayName} for getting more than ${config.maxWarns} warns.`
      );
      const banMessage =
        config.banMessage || `You've been banned from ${guild.name}.`;
      await user
        .send(banMessage)
        .catch(() =>
          console.error('Issue sending ban appeal message to user. Oh well?')
        );
      user.ban().catch(() => message.channel.send(`Issues banning user.`));

      CREATE_WARN(guild.id, user.id, message.author.id, reason);

      client.logIssue(
        guild.id,
        'ban',
        reason === 'No reason provided.' ? '' : reason,
        message.author,
        user.user,
        config.nextWarnId
      );
    } else {
      message.channel.send(
        `<@${user.id}> You've been warned for \`${reason}\`. You have ${activeWarns} out of ${config.maxWarns} warns now.`
      );

      CREATE_WARN(guild.id, user.id, message.author.id, reason);

      client.logIssue(
        guild.id,
        'warn',
        reason === 'No reason provided.' ? '' : reason,
        message.author,
        user.user,
        config.nextWarnId
      );
      user
        .send(
          `You have been warned in **${guild.name}**\n**Reason:** ${reason}`
        )
        .catch(() => console.error(`Can't DM user, probably has friends on.`));
      message
        .delete()
        .catch(() => console.error(`Issues deleting the warn message!`));
    }

    return;
  },
};
