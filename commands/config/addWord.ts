import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { SET_WORD, GET_NEW_WORD } from '../../src/setup_tables';

const addword = {
  desc:
    "Add a word or list of words to banned list. Make sure you understand what you're adding.",
  name: 'addWord',
  args: '<list of regex separated by a ->',
  type: 'config',
  run: (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_CHANNELS']))
      return;
    const words = args.join('').split('-');

    for (const word of words) {
      SET_WORD(word);
      const newWord = GET_NEW_WORD();
      client.bannedWords.push(new RegExp(`(${word})`, 'g'));
      client.bannedStrings.push(newWord);
    }

    message.reply(`successfully added the words to the banned list.`);
  },
};

export default addword;
