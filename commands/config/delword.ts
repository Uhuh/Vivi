import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import {
  GET_BANNED_WORDS,
  REMOVE_BANNED_WORD,
} from '../../src/database/database';

const deleteword = {
  desc: 'Delete banned word(s) from banned list.',
  name: 'delword',
  args: '<words separated by ,>',
  type: 'config',
  run: (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    REMOVE_BANNED_WORD(message.guild.id!, args.join('').split(',')).then(
      async () => {
        message.channel.send(`Successfully removed the words.`);
        client.bannedWords.set(
          message.guild!.id,
          await GET_BANNED_WORDS(message.guild!.id)
        );
      }
    );
  },
};

export default deleteword;
