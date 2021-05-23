import { Message, Role } from 'discord.js';
import {
  GET_GUILD_CONFIG,
  REMOVE_MOD_ROLE,
  SET_MOD_ROLE,
} from '../../src/database/database';

export const modRole = {
  desc: 'Set the mod role, anyone with this role will be presumed as a mod and can use the mod commands.',
  name: 'mod',
  args: '<@role | id | remove>',
  alias: [''],
  type: 'config',
  run: async (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    if (!args.length) {
      return message.reply(
        `you need to send either a role mention, id or 'remove'.`
      );
    }

    const { guild } = message;

    if (args.length && args[0] === 'remove') {
      const config = await GET_GUILD_CONFIG(guild.id);
      if (!config?.modRole) {
        return message.reply(
          `the server doesn't have a mod role setup already!`
        );
      }

      REMOVE_MOD_ROLE(guild.id);

      return message.reply(`successfully removed mod role.`);
    }

    const roleId = message.mentions.roles.first() || args.shift();

    if (!roleId) {
      return message.reply(`did you not pass a role id or not mention a role?`);
    }

    let role: Role | undefined = undefined;

    if (roleId instanceof String) {
      role = guild.roles.cache.find(
        (r) => r.id === roleId || r.name.toLowerCase() === roleId
      );
    } else if (roleId instanceof Role) {
      role = roleId;
    }

    if (!role) {
      return message.reply(`couldn't find a role with that name or ID`);
    }

    SET_MOD_ROLE(guild.id, role.id);

    return message.reply(`successfully set mod role.`);
  },
};

export default modRole;
