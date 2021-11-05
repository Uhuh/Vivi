import { Message, TextChannel } from 'discord.js';
import {
  REMOVE_MOD_CHANNEL,
  REMOVE_SERVER_CHANNEL,
  SET_MOD_CHANNEL,
  SET_SERVER_CHANNEL,
} from '../../src/database/database';

export const logs = {
  desc: 'Set Mod or Server logging channels',
  name: 'logs',
  args: '<mod | server> <#channel | id | remove>',
  alias: ['l'],
  type: 'config',
  run: async (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.permissions.has(['MANAGE_GUILD']))
      return;
    let [type, id] = args;

    const { guild } = message;

    if (message.mentions.channels.size) {
      id = message.mentions.channels.first()?.id || id;
    }

    //const channel = message.guild.channels.resolve(id) as TextChannel;
    const channel = guild.channels.cache.get(id) as TextChannel;

    if (!channel && id !== 'remove') {
      return message.channel.send(
        'I failed to find any channel with that id. Check the id, or mention the channel. Make sure I have access to see it and send messages to it too.'
      );
    }

    switch (type.toLowerCase()) {
      case 'mod':
        if (id === 'remove') {
          REMOVE_MOD_CHANNEL(guild.id);
          message.reply(`I will no longer send mog logs there!`);
        } else if (channel) {
          SET_MOD_CHANNEL(guild.id, id);
          message.react('✅');
          channel
            .send(`I'm configured to send any mod actions here now! :tada:`)
            .catch(() => {
              message.reply(
                `I don't seem to have send message perms for that channel! Please make sure I can send messages **and** embeds, as well as attachments.`
              );
            });
        }
        break;
      case 'server':
        if (id === 'remove') {
          REMOVE_SERVER_CHANNEL(guild.id);
          message.reply(`I will no longer send server logs there!`);
        } else if (channel) {
          SET_SERVER_CHANNEL(guild.id, id);
          message.react('✅');
          channel
            .send(`I'm configured to send server updates here now! :tada:`)
            .catch(() => {
              message.reply(
                `I don't seem to have send message perms for that channel! Please make sure I can send messages **and** embeds, as well as attachments.`
              );
            });
        }
        break;
      default:
        message.reply(
          'Incorrect channel log type. There are only `mod` and `server` so try again with one of those.'
        );
    }

    return;
  },
};
