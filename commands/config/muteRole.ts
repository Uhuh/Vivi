import { Message, Role } from 'discord.js';
import {
  GET_GUILD_CONFIG,
  REMOVE_MUTE_ROLE,
  SET_MUTE_ROLE,
} from '../../src/database/database';
import { Category } from '../../utilities/types/commands';

export const mute = {
  desc: 'Set the mute role for the server',
  name: 'mute-role',
  args: '<@role | id | remove>',
  alias: ['mr'],
  type: Category.config,
  run: async (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.permissions.has(['MANAGE_GUILD']))
      return;

    const { guild } = message;

    if (!args.length) {
      return message.reply(
        `You need to include a role mention, role id or 'remove'.`
      );
    }

    if (args.length && args[0] === 'remove') {
      const config = await GET_GUILD_CONFIG(guild.id);
      if (!config?.muteRole) {
        return message.reply(`The server doesn't have a mute role setup.`);
      }

      REMOVE_MUTE_ROLE(guild.id);

      return message.reply(`Successfully removed the mute role.`);
    }

    const roleId = message.mentions.roles.first() || args.shift();

    if (!roleId) {
      return message.reply(`Did you not pass a role id or not mention a role?`);
    }

    let role: Role | undefined = undefined;

    if (typeof roleId === 'string') {
      role = guild.roles.cache.find(
        (r) => r.id === roleId || r.name.toLowerCase() === roleId
      );
    } else if (roleId instanceof Role) {
      role = roleId;
    }

    if (!role) {
      return message.reply(`Couldn't find a role with that name or ID`);
    }

    SET_MUTE_ROLE(guild.id, role.id);

    return message.reply(`Successfully set the mute role.`);
  },
};
