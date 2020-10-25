import { Message } from 'discord.js';
import { DELETE_WARN } from '../../src/setup_tables';

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

    DELETE_WARN(args[0]);

    return message.reply(
      `done! ...if that warn ID existed at least. (Make sure to check!)`
    );
  },
};

export default removeWarn;
