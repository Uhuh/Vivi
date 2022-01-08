import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { SET_GUILD_PREFIX } from '../../src/database/database';
import { Category } from '../../utilities/types/commands';

export const prefix = {
  desc: 'Set the guilds prefix.',
  name: 'prefix',
  args: '<any prefix you want>',
  alias: ['p'],
  type: Category.config,
  run: (message: Message, args: string[], client: ViviBot) => {
    if (
      !message.guild ||
      !message.member?.permissions.has(['MANAGE_GUILD']) ||
      args.length === 0
    )
      return;

    SET_GUILD_PREFIX(message.guild.id, args[0])
      .then(() => {
        message.reply(`Successfully changed the prefix to \`${prefix}.\``);
        client.guildPrefix.set(message.guild!.id, args[0]);
      })
      .catch(() => message.reply(`I encoutnered an issue setting the prefix.`));
  },
};
