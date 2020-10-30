import { Message, TextChannel } from 'discord.js';
import {
  ADD_CHANNEL_WHITELIST,
  REMOVE_CHANNEL_WHITELIST,
} from '../../src/database/database';

const whitelist = {
  desc: 'Whitelist a channel to ignore server logs for.',
  name: 'whitelist',
  args: '<add|remove> <#channel/channel ID>',
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_CHANNELS']))
      return;

    if (!args.length) {
      return message.reply(
        `please mention a channel or send its ID to whitelist it.`
      );
    }

    let [type, id] = args;

    if (message.mentions.channels) {
      id = message.mentions.channels.first()?.id || '';
    }

    const channel = message.guild.channels.cache.get(id) as TextChannel;

    if (!channel) {
      return message.channel.send(
        'I failed to find any channel with that id. Check the id, or mention the channel. Make sure I have access to see it and send messages to it too.'
      );
    }

    switch (type.toLowerCase()) {
      case 'add':
        ADD_CHANNEL_WHITELIST(message.guild.id, channel.id)
          .then(() => message.reply(`Successfully whitelisted channel.`))
          .catch(() =>
            message.reply(`I had issues whitelisting that channel.`)
          );
        break;
      case 'remove':
        REMOVE_CHANNEL_WHITELIST(message.guild.id, channel.id)
          .then(() =>
            message.reply(`Successfully removed the channel from whitelist.`)
          )
          .catch(() =>
            message.reply(`I had issues removing that channel from whitelist.`)
          );
        break;
      default:
        message.reply('you need to tell me if you want to `add` or `remove`.');
    }
    return;
  },
};

export default whitelist;
