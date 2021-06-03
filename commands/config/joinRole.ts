import { Message, MessageEmbed, Role } from 'discord.js';
import {
  ADD_JOIN_ROLE,
  GUILD_JOIN_ROLES,
  REMOVE_JOIN_ROLE,
} from '../../src/database/database';
import { CLIENT_ID } from '../../src/vars';
import { missingPerms } from '../../utilities/functions/missingPerm';
import { COLOR } from '../../utilities/types/global';

export const joinRole = {
  desc: 'Add, remove or list the guilds join roles.',
  name: 'join',
  args: '<add | remove | list> <@Role | Role ID>',
  alias: ['j'],
  type: 'config',
  run: async (message: Message, args: string[]) => {
    if (
      !message.guild ||
      !message.member?.hasPermission(['MANAGE_GUILD']) ||
      args.length === 0
    )
      return;

    const { guild } = message;

    const command = args.shift()?.toLowerCase();
    const roleId = message.mentions.roles.first() || args.shift();
    switch (command) {
      case 'add':
      case 'remove':
        if (!roleId) {
          return message.reply(`you need to include the role name or ID.`);
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
          return message.reply(`couldn't find a role with that name or ID`);
        }

        const clientMember = guild.members.cache.find(
          (m) => m.id === CLIENT_ID
        );

        if (!clientMember) {
          return console.error(
            `Join command - I don't know why the client member was unfindable.`
          );
        }

        if (
          role.position >
          Math.max(...clientMember.roles.cache.map((r) => r.position))
        ) {
          return message.reply(
            `the role you're trying to add is higher in the role hierarchy so I can't give it out. Put it below my role or give me a role that's above it.`
          );
        }
        if (command === 'add') {
          ADD_JOIN_ROLE(guild.id, role.id)
            .then(() =>
              message.reply(`successfully added the role to the join list.`)
            )
            .catch(() => {
              message.reply(`issue adding role. :(`);
            });
        } else {
          REMOVE_JOIN_ROLE(guild.id, role.id)
            .then(() =>
              message.reply(`successfully removed the role from the join list.`)
            )
            .catch(() => {
              message.reply(`issue removing role. :(`);
            });
        }
        break;
      case 'list':
        const roles = await GUILD_JOIN_ROLES(guild.id);
        if (!roles) {
          return message.reply(`no join roles!`);
        }
        const embed = new MessageEmbed();
        embed
          .setTitle(`Roles users get when joining`)
          .setColor(COLOR.AQUA)
          .setDescription(
            `${
              !roles.joinRoles?.length
                ? 'No join roles!'
                : roles.joinRoles.map((r) => `<@&${r}>`).join('\n')
            }`
          );

        message.channel.send(embed).catch(() => missingPerms(message, 'embed'));
        break;
    }

    return;
  },
};
