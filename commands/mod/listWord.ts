import { Message } from 'discord.js';
import { GET_BANNED_WORDS } from '../../src/database/database';

const listWords = {
  desc: 'List of currently banned words. (Trigger warning)',
  name: 'listwords',
  args: '',
  type: 'admin',
  run: async (message: Message) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_CHANNELS']))
      return;

    const words = await GET_BANNED_WORDS(message.guild.id);

    message.channel.send(
      !words.length ? `There are no banned words.` : words.join(', ')
    );
  },
};

export default listWords;
