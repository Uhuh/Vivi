import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import { SET_GUILD_PREFIX } from '../../src/database/database';

const prefix = {
  desc: 'Set the guilds prefix.',
  name: 'prefix',
  args: '<any prefix you want>',
  alias: ['p'],
  type: 'config',
  run: (message: Message, args: string[], client: ViviBot) => {
    if (
      !message.guild ||
      !message.member?.hasPermission(['MANAGE_GUILD']) ||
      args.length === 0
    )
      return;

    SET_GUILD_PREFIX(message.guild.id, args[0])
      .then(() => {
        message.reply(`successfully changed the guilds' prefix.`);
        client.guildPrefix.set(message.guild!.id, args[0]);
      })
      .catch(() => message.reply(`I failed to set the prefix to that!`));
  },
};

export default prefix;
