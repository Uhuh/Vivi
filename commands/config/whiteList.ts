import { Message, TextChannel } from 'discord.js';
import {
  ADD_CHANNEL_WHITELIST,
  REMOVE_CHANNEL_WHITELIST,
} from '../../src/database/database';
import { Category } from '../../utilities/types/commands';

export const whitelist = {
  desc: 'Whitelist a channel to ignore server logs for.',
  name: 'whitelist',
  args: '<add | remove> <#channel | ID>',
  alias: ['wl'],
  type: Category.config,
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.permissions.has(['MANAGE_GUILD']))
      return;

    if (!args.length) {
      return message.reply(
        `Please mention a channel or send its ID to whitelist it. Example \`v.config whitelist #mod-chat\``
      );
    }

    const { guild } = message;

    let [type, id] = args;

    if (message.mentions.channels.size) {
      id = message.mentions.channels.first()?.id || id;
    }

    const channel = guild.channels.cache.get(id) as TextChannel;

    if (!channel) {
      return message.channel.send(
        'I failed to find any channel with that id. Check the id, or mention the channel. Make sure I have access to see it and send messages to it too.'
      );
    }

    switch (type.toLowerCase()) {
      case 'add':
        ADD_CHANNEL_WHITELIST(guild.id, channel.id)
          .then(() =>
            message.reply(
              `I'll no longer monitor <#${channel.id}> for message deletions / updates.`
            )
          )
          .catch(() =>
            message.reply(`I had issues whitelisting that channel.`)
          );
        break;
      case 'remove':
        REMOVE_CHANNEL_WHITELIST(guild.id, channel.id)
          .then(() =>
            message.reply(
              `I'll start tracking message deletions / updates for <#${channel.id}>`
            )
          )
          .catch(() =>
            message.reply(`I had issues removing that channel from whitelist.`)
          );
        break;
      default:
        message.reply(
          'Make sure to use `add` or `remove` before mentioning a channel.'
        );
    }
    return;
  },
};
