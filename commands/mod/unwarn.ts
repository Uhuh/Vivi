import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { CaseType } from '../../src/database/cases';
import {
  DELETE_CASE,
  GET_GUILD_CONFIG,
  GET_WARN,
} from '../../src/database/database';

export const unwarn = {
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
      !message.member?.permissions.has('MANAGE_MESSAGES') &&
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
      return message.reply(
        `that warning does not exist, make sure the ID you gave me is a real warn ID.`
      );
    }

    let user = guild.members.cache.get(warn.userId) || warn.userId;

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    client._warnService.logIssue(
      guild.id,
      CaseType.unwarn,
      reason,
      message.author,
      typeof user === 'string' ? user : user.user
    );

    if (typeof user !== 'string') {
      user.send(`Your warn "**${warn.reason}**" has been removed.`);
    }

    DELETE_CASE(message.guild?.id!, warnId)
      .then(() => message.reply('I removed the warn successfully.'))
      .catch(() =>
        message.reply('issue removing that warn. Is the ID correct?')
      );

    return;
  },
};
