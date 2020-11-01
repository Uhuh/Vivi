import { Message } from 'discord.js';
import { SET_BANNED_MSG } from '../../src/database/database';

const banMsg = {
  desc: `Set ban message. This will get DMd to a user right before they're banned.`,
  name: 'banmsg',
  args: '<words n stuff>',
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    SET_BANNED_MSG(message.guild.id, args.join(' '))
      .then(() =>
        message.channel.send('I changed the ban message successfully.')
      )
      .catch(() =>
        message.reply(
          `I failed to set that as the ban message.. it might be longer than 1020 characters.`
        )
      );
  },
};

export default banMsg;
