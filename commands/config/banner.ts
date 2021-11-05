import { Message } from 'discord.js';
import { SET_BANNER } from '../../src/database/database';

export const banner = {
  desc: 'Set your servers welcome banner type.',
  name: 'banner',
  args: '<left | center>',
  alias: [],
  type: 'config',
  run: async (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.permissions.has(['MANAGE_GUILD']))
      return;

    if (!args.length || (args[0] !== 'left' && args[0] !== 'center')) {
      return message.reply(
        'There are currently only two banner types. `left` and `center` so please try them out!'
      );
    }

    return SET_BANNER(message.guild.id, args[0])
      .then(() =>
        message.reply(`Successfully changed the banner type to \`${args[0]}\``)
      )
      .catch(() =>
        message.reply(`I encounted an issue setting the banner type.`)
      );
  },
};
