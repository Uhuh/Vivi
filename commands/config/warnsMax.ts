import { Message } from 'discord.js';
import { SET_WARN_LIMIT } from '../../src/database/database';
import { Category } from '../../utilities/types/commands';

export const warnsMax = {
  desc: 'Set the max warns a user can get before getting banned.',
  name: 'maxwarns',
  args: '<a number in the range [1, 10]>',
  alias: ['mw'],
  type: Category.config,
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.permissions.has(['MANAGE_GUILD']))
      return;

    const maxWarns = Number(args[0]);
    if (Number.isNaN(maxWarns)) {
      return message.reply(`You need to pass a number. The range is [1, 10].`);
    } else if (maxWarns > 30 || maxWarns < 1) {
      return message.reply(`That's not within the range [1, 10]`);
    }

    return SET_WARN_LIMIT(message.guild.id, maxWarns)
      .then(() =>
        message.reply(`Successfully set the max warns to ${maxWarns}.`)
      )
      .catch(() =>
        message.reply(`I encountered an issue setting the max warns.`)
      );
  },
};
