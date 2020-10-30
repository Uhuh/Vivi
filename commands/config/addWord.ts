import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { GET_BANNED_WORDS, NEW_BANNED_WORD } from '../../src/database/database';

const addword = {
  desc:
    "Add a word or list of words to banned list. Make sure you understand what you're adding.",
  name: 'addword',
  args: '<list of words seperated by comma>',
  type: 'config',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_CHANNELS']))
      return;

    NEW_BANNED_WORD(message.guild.id!, args.join('').split(',')).then(
      async () => {
        client.bannedWords.set(
          message.guild!.id,
          await GET_BANNED_WORDS(message.guild!.id)
        );
      }
    );

    message.reply(`successfully added the words to the banned list.`);
  },
};

export default addword;
