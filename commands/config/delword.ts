import { Message } from 'discord.js';
import { REMOVE_BANNED_WORD } from '../../src/database/database';

const deleteword = {
  desc: 'Delete banned word(s) from banned list.',
  name: 'delword',
  args: '<words separated by ,>',
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_CHANNELS']))
      return;

    REMOVE_BANNED_WORD(message.guild.id!, args.join('').split(','));

    message.channel.send(`Successfully removed the words.`);
  },
};

export default deleteword;
