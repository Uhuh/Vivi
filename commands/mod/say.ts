import { Message } from 'discord.js';

const say = {
  desc:
    'Say something in chat. If you mention a channel the bot will speak there instead.',
  name: 'say',
  args: '',
  alias: [],
  type: 'mod',
  run: (message: Message, args: string[]) => {
    if (!message.member?.hasPermission(['MANAGE_MESSAGES'])) return;
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
