import { Message } from 'discord.js';
import { SET_MUTE_ROLE } from '../../src/database/database';

const setMute = {
  desc: 'Set the mute role for the server',
  name: 'muteRole',
  args: '<@role | id>',
  alias: ['m'],
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;
    const roleId = message.mentions.roles.first()?.id || args.shift();

    if (!roleId) {
      return message.reply(`did you not pass a role id or not mention a role?`);
    }

    SET_MUTE_ROLE(message.guild.id, roleId);

    return message.reply(`successfully set mute role.`);
  },
};

export default setMute;
