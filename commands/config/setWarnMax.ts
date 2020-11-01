import { Message } from 'discord.js';
import { SET_MAX_WARNS } from '../../src/database/database';

const warnsMax = {
  desc: 'Set the max warns a user can get before getting banned.',
  name: 'maxWarns',
  args: '<a number in the range [1, 10]>',
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    const maxWarns = Number(args[0]);
    if (Number.isNaN(maxWarns)) {
      return message.reply(`you need to pass a number. The range is [1, 10].`);
    } else if (maxWarns > 30 || maxWarns < 1) {
      return message.reply(`That's not within the range [1, 10]`);
    }

    return SET_MAX_WARNS(message.guild.id!, maxWarns)
      .then(() => message.reply(`successfully set the max warns.`))
      .catch(() =>
        message.reply(`I failed to set the max warns for this guild.`)
      );
  },
};

export default warnsMax;
