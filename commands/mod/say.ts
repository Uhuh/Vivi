import { Message, TextChannel } from 'discord.js';
import { GET_GUILD_CONFIG } from '../../src/database/database';
import { LogService } from '../../src/services/logService';

export const say = {
  desc: 'Say something in chat. If you mention a channel the bot will speak there instead.',
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
      !message.member?.permissions.has('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    const channel = message.mentions.channels.first();
    if (channel) args.shift();

    let image = message.attachments.first();

    if (channel && channel.type === 'GUILD_TEXT') {
      if (image) {
        return (channel as TextChannel).send(image.proxyURL);
      }

      return (channel as TextChannel).send(args.join(' '));
    }

    let content = '';

    if (args[0] === config.prefix) {
      content = message.content.slice(config.prefix?.length).trim().slice(3);
    } else {
      const preparse = message.content
        .substr(message.content.indexOf(' ') + 1)
        .trim();
      content = preparse.startsWith('say') ? preparse.slice(3) : preparse;
    }

    message
      .delete()
      .catch(() =>
        LogService.logError(
          `Failed to delete say message for guild[${
            message.guild?.id || 'could not load guild'
          }]`
        )
      );
    return message.channel.send(content || 'Nothing to say!');
  },
};
