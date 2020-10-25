import { Message } from 'discord.js';
import { REMOVE_BANNED_WORD } from '../../src/database/database';

const listWords = {
  desc: 'Remove "word"(s) from banned list (, separate)',
  name: 'removeword',
  args: '<list of IDs found in the listwords command>',
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_CHANNELS']))
      return;

    for (const word of args.join('').split(',')) {
      REMOVE_BANNED_WORD(message.guild.id!, word);
    }

    message.channel.send(`Successfully removed the words.`);
  },
};

export default listWords;
