import { Message } from 'discord.js';
import { GET_BANNED_WORDS } from '../../src/database/database';

export const listWords = {
  desc: 'List of currently banned words.',
  name: 'banwordlist',
  args: '',
  alias: ['bwl'],
  type: 'config',
  run: async (message: Message) => {
    if (!message.guild || !message.member?.permissions.has(['MANAGE_GUILD']))
      return;

    const words = await GET_BANNED_WORDS(message.guild.id);

    message.channel.send(
      !words.length
        ? `There are no banned words.`
        : `Banned words: ||${words.join(', ')}||`
    );
  },
};
