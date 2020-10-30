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

    message.channel.send((await GET_BANNED_WORDS(message.guild.id)).join(', '));
  },
};

export default listWords;
