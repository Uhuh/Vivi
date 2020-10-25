import { Message } from 'discord.js';
import { DELETE_WARN } from '../../src/database/database';

const removeWarn = {
  desc: 'Remove a warning from a user',
  name: 'removeWarn',
  args: '<warn id>',
  type: 'admin',
  run: (message: Message, args: string[]) => {
    if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
      return message.react('❌');
    }
    if (!args.length) {
      return message.reply(
        `please supply a warn id. They're shown in the \`warnings\` command`
      );
    } else if (Number.isNaN(Number(args[0]))) {
      return message.reply(
        `invalid warn id, make sure it's a number shown in the warnings command.`
      );
    }

    DELETE_WARN(message.guild?.id!, Number(args[0]))
      .then(() =>
        message.reply(
          `done! ...if that warn ID existed at least. (Make sure to check!)`
        )
      )
      .catch(() =>
        message.reply(`issue removing that warn. Is the ID correct?`)
      );

    return;
  },
};

export default removeWarn;
