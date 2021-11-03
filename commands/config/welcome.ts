import { GuildChannel, Message } from 'discord.js';
import { REMOVE_WELCOME, SET_WELCOME } from '../../src/database/database';

export const welcome = {
  desc: 'Set your servers welcome channel.',
  name: 'welcome',
  args: '<add | remove> <#channel | channel-id>',
  alias: [],
  type: 'config',
  run: async (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.permissions.has(['MANAGE_GUILD']))
      return;
    const { guild } = message;

    if (!args.length || (args[0] !== 'add' && args[0] !== 'remove')) {
      return message.reply(
        'you need to use `add` or `remove` for channels. Example `v.config welcome add #welcome`'
      );
    }

    if (args[0] === 'remove') {
      return REMOVE_WELCOME(guild.id)
        .then(() => message.reply(`successfully removed the welcome channel.`))
        .catch(() => message.reply(`I had an issue removing the channel.`));
    }

    const channelId = message.mentions.channels.first()?.id || args[0];
    let channel = guild.channels.cache.get(channelId) || null;

    if (!channel) {
      channel = guild.channels.resolve(channelId);
    }
    if (!channel) {
      return message.reply(
        `I'm having issues finding that channel. Did you pass the right ID? If you mentioned make sure you mentioned the correct one.`
      );
    }

    return SET_WELCOME(guild.id, channelId)
      .then(() => message.reply(`successfully set the welcome channel.`))
      .catch(() =>
        message.reply(`I had an issue trying to set the welcome channel.`)
      );
  },
};
