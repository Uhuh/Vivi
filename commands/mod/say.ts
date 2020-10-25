import { Message } from 'discord.js';

const say = {
  desc: '>:)',
  name: 'say',
  args: '',
  type: 'owner',
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
