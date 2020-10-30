import { Message, TextChannel } from 'discord.js';
import {
  SET_MOD_CHANNEL,
  SET_SERVER_CHANNEL,
} from '../../src/database/database';

const logs = {
  desc: 'Set Mod or Server logging channels',
  name: 'logs',
  args: '<mod | server> <#channel | id>',
  type: 'config',
  run: async (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_CHANNELS']))
      return;
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
      case 'mod':
        SET_MOD_CHANNEL(message.guild.id, id);
        channel.send(`I'm configured to send any mod actions here now! :tada:`);
        break;
      case 'server':
        SET_SERVER_CHANNEL(message.guild.id, id);
        channel.send(`I'm configured to send server updates here now! :tada:`);
        break;
      default:
        message.reply(
          'incorrect log type. There are only `mod` and `server` so try again.'
        );
    }

    return;
  },
};

export default logs;
