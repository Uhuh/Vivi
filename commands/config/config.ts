import { Message } from 'discord.js';
import { EmbedService } from '../../src/services/embedService';
import ViviBot from '../../src/bot';
import { GET_GUILD_CONFIG } from '../../src/database/database';
import { missingPerms } from '../../utilities/functions/missingPerm';

export const config = {
  desc: 'Show the servers current config',
  name: 'config',
  args: '[help]',
  alias: [],
  type: 'config',
  run: async (message: Message, args: string[], client: ViviBot) => {
    const { guild } = message;
    if (!guild || !message.member?.permissions.has(['MANAGE_GUILD'])) return;

    if (args.length && args[0].toLowerCase() === 'setup') {
      return client.commands.get('setup')?.run(message, args, client);
    }

    const guildConfig = await GET_GUILD_CONFIG(guild.id);

    if (!guildConfig) {
      return message.reply(
        `I couldn't find a config for this guild. I might be broken, try running v.setup`
      );
    }

    if (args.length === 0) {
      return message.channel
        .send({ embeds: [EmbedService.guildConfigEmbed(guild, guildConfig)] })
        .catch(() => missingPerms(message, 'embed'));
    }

    const configType = args.shift()?.toLowerCase() || '';

    if (configType === 'help') {
      return message.channel
        .send({ embeds: [EmbedService.configHelpEmbed(client, guildConfig)] })
        .catch(() => missingPerms(message, 'embed'));
    }

    const command = client.commands.get(configType);

    if (!command) {
      return message.reply(
        `invalid config type! Run the config help command to see the list.`
      );
    }

    command.run(message, args, client);

    return;
  },
};
