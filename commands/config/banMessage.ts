import { Message } from 'discord.js';
import { SET_BANNED_MSG } from '../../src/database/database';

export const banMsg = {
  desc: `Set ban message. This will get DMd to a user right before they're banned.`,
  name: 'banmsg',
  args: '<words n stuff>',
  alias: ['bm'],
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.permissions.has(['MANAGE_GUILD']))
      return;

    if (args.join(' ').length > 1020) {
      return message.reply(`Please limit the message to 1020 characters.`);
    }

    return SET_BANNED_MSG(message.guild.id, args.join(' '))
      .then(() =>
        message.channel.send('I changed the ban message successfully.')
      )
      .catch(() => message.reply(`I failed to set that as the ban message.`));
  },
};
