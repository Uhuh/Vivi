import { Message, MessageEmbed } from 'discord.js';
import ViviBot from '../../src/bot';
import { GET_GUILD_CONFIG } from '../../src/database/database';
import { missingPerms } from '../../utilities/functions/missingPerm';
import { Category, COLOR } from '../../utilities/types/commands';

export const config = {
  desc: 'Show the servers current config',
  name: 'config',
  args: '[help]',
  alias: [],
  type: 'config',
  run: async (message: Message, args: string[], client: ViviBot) => {
    const { guild } = message;
    if (!guild || !message.member?.hasPermission(['MANAGE_GUILD'])) return;

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
      const embed = new MessageEmbed();
      embed
        .setTitle(`Configuration for **${guild.name}**`)
        .setThumbnail(guild.iconURL() || '')
        .addField('Guild prefix:', `\`${guildConfig.prefix}\``, true)
        .addField(
          'Warns expire after:',
          `${guildConfig.warnLifeSpan} days`,
          true
        )
        .addField('Max warns before banning:', guildConfig.maxWarns, true)
        .addField(
          'Mod logging channel:',
          guildConfig.modLog ? `<#${guildConfig.modLog}>` : 'Not set!',
          true
        )
        .addField(
          'Server logging channel:',
          guildConfig.serverLog ? `<#${guildConfig.serverLog}>` : 'Not set!',
          true
        )
        .addField(
          'Mute role:',
          guildConfig.muteRole
            ? guild.roles.cache.get(guildConfig.muteRole) || 'Not set!'
            : 'Not set!',
          true
        )
        .addField(
          'Mod role:',
          guildConfig.modRole
            ? guild.roles.cache.get(guildConfig.modRole) || 'Not set!'
            : 'Not set!',
          true
        )
        .addField(
          'Current amount of mod cases:',
          guildConfig.nextCaseId! - 1,
          true
        )
        .addField(
          'Amount of warns handed out:',
          guildConfig.nextWarnId! - 1,
          true
        )
        .addField(
          'Whitelisted channels:',
          guildConfig.serverLogWhitelist?.length
            ? guildConfig.serverLogWhitelist?.map((c) => `<#${c}>`)
            : 'None!'
        )
        .addField(
          'Ban message:',
          guildConfig.banMessage || `You've been banned from ${guild.name}.`
        );

      return message.channel
        .send(embed)
        .catch(() => missingPerms(message, 'embed'));
    }

    const configType = args.shift()?.toLowerCase() || '';

    switch (configType) {
      case 'help':
        const embed = new MessageEmbed();
        embed
          .setTitle('**Config commands**')
          .setDescription(
            `All config commands require MANAGE_GUILD permissions.`
          )
          .setColor(COLOR.AQUA)
          .setAuthor(client.user?.username, client.user?.avatarURL() || '')
          .setThumbnail(client.user?.avatarURL() || '')
          .setFooter(`Replying to: ${message.author.tag}`)
          .setTimestamp(new Date());

        client.commands
          .filter((c) => c.type === Category.config)
          .forEach((func) =>
            embed.addField(
              `**${guildConfig.prefix}config ${func.name} ${func.args}**`,
              func.desc
            )
          );

        message.channel.send(embed).catch(() => missingPerms(message, 'embed'));
        break;
      default:
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
