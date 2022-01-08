import { Message, MessageEmbed, Role } from 'discord.js';
import { LogService } from '../../src/services/logService';
import {
  ADD_JOIN_ROLE,
  GUILD_JOIN_ROLES,
  REMOVE_JOIN_ROLE,
} from '../../src/database/database';
import { CLIENT_ID } from '../../src/vars';
import { missingPerms } from '../../utilities/functions/missingPerm';
import { COLOR } from '../../utilities/types/global';
import { Category } from '../../utilities/types/commands';

export const joinRole = {
  desc: 'Add, remove or list the guilds join roles.',
  name: 'join',
  args: '<add | remove | list> <@Role | Role ID>',
  alias: ['j'],
  type: Category.config,
  run: async (message: Message, args: string[]) => {
    if (
      !message.guild ||
      !message.member?.permissions.has(['MANAGE_GUILD']) ||
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
          return message.reply(`I couldn't find a role with that name or ID`);
        }

        const clientMember = guild.members.cache.find(
          (m) => m.id === CLIENT_ID
        );

        if (!clientMember) {
          return LogService.logError(
            `[JoinRole] Could not find client guild member object.`
          );
        }

        if (
          role.position >
          Math.max(...clientMember.roles.cache.map((r) => r.position))
        ) {
          return message.reply(
            `The role you're trying to add is higher in the role hierarchy so I can't give it out. Put it below my role or give me a role that's above it.`
          );
        }
        if (command === 'add') {
          ADD_JOIN_ROLE(guild.id, role.id)
            .then(() =>
              message.reply(`Successfully added the role to the join list.`)
            )
            .catch(() => {
              message.reply(`Issue adding role to join roles list. :(`);
            });
        } else {
          REMOVE_JOIN_ROLE(guild.id, role.id)
            .then(() =>
              message.reply(`Successfully removed the role from the join list.`)
            )
            .catch(() => {
              message.reply(`Issue removing role from join roles list. :(`);
            });
        }
        break;
      case 'list':
        const roles = await GUILD_JOIN_ROLES(guild.id);
        if (!roles) {
          return message.reply(`There are no join roles set!`);
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

        message.channel
          .send({ embeds: [embed] })
          .catch(() => missingPerms(message, 'embed'));
        break;
    }

    return;
  },
};
