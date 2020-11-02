import { Message } from 'discord.js';
import {
  REMOVE_MUTE_ROLE,
  GET_GUILD_CONFIG,
} from '../../src/database/database';

const removeMute = {
  desc: 'Remove the current setup mute role.',
  name: 'unbind',
  args: '',
  alias: [],
  type: 'config',
  run: async (message: Message) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;
    const config = await GET_GUILD_CONFIG(message.guild.id);
    if (!config?.muteRole) {
      return message.reply(
        `the server doesn't have a mute role setup already!`
      );
    }

    REMOVE_MUTE_ROLE(message.guild.id);

    return message.reply(`successfully remove mute role.`);
  },
};

export default removeMute;
