import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { REMOVE_WORD } from '../../src/setup_tables';

const listWords = {
  desc: 'Remove "word"(s) from banned list (, separate)',
  name: 'removeword',
  args: '<list of IDs found in the listwords command>',
  type: 'config',
  run: (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_CHANNELS']))
      return;
    const IDs = args
      .join('')
      .split(',')
      .map((id) => Number(id));

    IDs.sort(function (a, b) {
      return b - a;
    });

    for (const ID of IDs) {
      const word = client.bannedStrings.find((w) => Number(w.id) === ID);
      if (!word) continue;
      const index = client.bannedStrings.indexOf(word);

      REMOVE_WORD(ID);
      client.bannedWords.splice(index, 1);
      client.bannedStrings.splice(index, 1);
    }

    message.channel.send(`Successfully removed the words.`);
  },
};

export default listWords;