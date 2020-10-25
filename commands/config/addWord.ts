import { Message } from 'discord.js';
import { NEW_BANNED_WORD } from '../../src/database/database';

const addword = {
  desc:
    "Add a word or list of words to banned list. Make sure you understand what you're adding.",
  name: 'addWord',
  args: '<list of words seperated by comma>',
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_CHANNELS']))
      return;
    const words = args.join('').split(',');

    for (const word of words) {
      NEW_BANNED_WORD(message.guild.id!, word);
    }

    message.reply(`successfully added the words to the banned list.`);
  },
};

export default addword;
