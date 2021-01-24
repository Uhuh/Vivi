import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import {
  DELETE_WARN,
  GET_GUILD_CONFIG,
  GET_WARN,
} from '../../src/database/database';

const unwarn = {
  desc: 'Remove a warning from a user',
  name: 'unwarn',
  args: '<warn id> <reason>',
  alias: ['uw'],
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
      return message.reply(
        `please supply a warn id. They're shown in the \`checkwarns\` command`
      );
    } else if (Number.isNaN(Number(args[0]))) {
      return message.reply(
        `invalid warn id, make sure it's a number shown in the checkwarns command.`
      );
    }

    const warnId = Number(args.shift());
    const warn = await GET_WARN(guild.id, warnId);

    if (!warn) {
      return message.reply(`that warn does not exist for `);
    }

    let user = guild.members.cache.get(warn.userId) || warn.userId;

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    client.logIssue(
      guild.id,
      'unwarn',
      reason,
      message.author,
      typeof user === 'string' ? user : user.user
    );

    if (typeof user !== 'string') {
      user.send(
        `Your warn[ID: ${warn.warnId} | Reason: "${warn.reason}"] has been removed.`
      );
    }

    DELETE_WARN(message.guild?.id!, warnId)
      .then(() => message.reply('I removed that warn successfully.'))
      .catch(() =>
        message.reply('issue removing that warn. Is the ID correct?')
      );

    return;
  },
};

export default unwarn;
