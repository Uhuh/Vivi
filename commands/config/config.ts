import { Message, MessageEmbed } from 'discord.js';
import { GET_GUILD_CONFIG } from '../../src/database/database';

const config = {
  desc: 'Show the servers current config',
  name: 'config',
  args: '',
  alias: [],
  type: 'config',
  run: async (message: Message) => {
    const { guild } = message;
    if (!guild || !message.member?.hasPermission(['MANAGE_GUILD'])) return;

    const guildConfig = await GET_GUILD_CONFIG(guild.id);

    if (!guildConfig) {
      return message.reply(
        `I couldn't find a config for this guild. I might be broken.`
      );
    }

    const embed = new MessageEmbed();

    embed
      .setTitle(`Configuration for **${guild.name}**`)
      .setThumbnail(guild.iconURL() || '')
      .addField('Guild prefix:', `\`${guildConfig.prefix}\``, true)
      .addField('Warns expire after:', `${guildConfig.warnLifeSpan} days`, true)
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
          ? guild.roles.cache.get(guildConfig.muteRole)
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

    return message.channel.send(embed);
  },
};

export default config;
