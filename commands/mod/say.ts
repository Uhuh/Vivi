import { Message } from 'discord.js';
import { GET_GUILD_CONFIG } from '../../src/database/database';

const say = {
  desc:
    'Say something in chat. If you mention a channel the bot will speak there instead.',
  name: 'say',
  args: '',
  alias: [],
  type: 'mod',
  run: async (message: Message, args: string[]) => {
    if (!message.guild) return;
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild.id);

    if (!config) return;

    if (
      !message.member?.hasPermission('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    const channel = message.mentions.channels.first();
    if (channel) args.shift();

    let image = message.attachments.first();

    if (channel) {
      if (image) {
        return channel.send(image.proxyURL);
      }

      return channel.send(args.join(' '));
    }

    message.delete();
    return message.channel.send(message.content.slice(5) || 'Nothing to say!');
  },
};

export default say;
