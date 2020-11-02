import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import * as moment from 'moment';
import {
  CREATE_WARN,
  GET_GUILD_CONFIG,
  GET_USER_WARNS,
} from '../../src/database/database';

const warn = {
  desc: 'warn a user',
  name: 'warn',
  args: '<user id> <reason>',
  alias: ['w'],
  type: 'mod',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
      return message.react('❌');
    }
    if (!args.length) {
      const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';
      return message.reply(
        `you forgot some arguements. \`${prefix}warn <user id> <reason>\``
      );
    }

    const { guild } = message;
    if (!guild) return;
    const config = await GET_GUILD_CONFIG(guild.id);
    if (!config) return;

    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId = message.mentions.members?.first()?.id || args.shift();

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    await message.guild?.members.fetch(userId || '');
    let user = message.guild?.members.cache.get(userId || '');
    // Try a fetch incase the user isn't cached.
    if (!user) {
      await message.guild?.members.fetch(userId || '');
      user = message.guild?.members.cache.get(userId || '');
    }

    if (!user) {
      return message.reply(
        `Issue finding that user with that user id. Make sure you copied the ID correctly.`
      );
    } else if (user.user.bot) {
      return message.reply(`what use do you have warning a bot...?`);
    }

    let userWarnings = await GET_USER_WARNS(guild.id, user.id);

    if (!userWarnings) userWarnings = [];

    const WEEK_OLD = moment().subtract(8, 'days').startOf('day');
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

    if (activeWarns > config.maxWarns!) {
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

      CREATE_WARN(message.guild!.id, user.id, message.author.id, reason);

      client.logIssue(
        guild.id,
        'ban',
        reason === 'No reason provided.' ? '' : reason,
        message.author,
        user.user,
        config.nextWarnId!
      );
    } else {
      message.channel.send(
        `<@${
          user.id
        }> You've been warned for \`${reason}\`. You have ${activeWarns} strike${
          activeWarns > 1 ? 's' : ''
        } now.`
      );

      CREATE_WARN(message.guild!.id, user.id, message.author.id, reason);

      client.logIssue(
        guild.id,
        'warn',
        reason === 'No reason provided.' ? '' : reason,
        message.author,
        user.user,
        config.nextWarnId!
      );
      user
        .send(`You have been warned!\n**Reason:** ${reason}`)
        .catch(() => console.error(`Can't DM user, probably has friends on.`));
      message
        .delete()
        .catch(() => console.error(`Issues deleting the message!`));
    }

    return;
  },
};

export default warn;
