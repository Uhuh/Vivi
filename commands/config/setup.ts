import { Message, MessageEmbed } from 'discord.js';
import { GENERATE_GUILD_CONFIG } from '../../src/database/database';
import { missingPerms } from '../../utilities/functions/missingPerm';

export const setup = {
  desc: 'If Vivi failed to setup the server config, run this to fix it.',
  name: 'setup',
  args: '',
  alias: [],
  type: 'setup',
  run: async (message: Message) => {
    const { guild } = message;
    if (!guild || !message.member?.hasPermission(['MANAGE_GUILD'])) return;

    const guildConfig = await GENERATE_GUILD_CONFIG(guild.id);

    if (!guildConfig) {
      return message.reply(`I'm already configured for the server!`);
    }

    const embed = new MessageEmbed();

    embed
      .setTitle(`Configuration setup for **${guild.name}**`)
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
        'Ban message:',
        guildConfig.banMessage || `You've been banned from ${guild.name}.`
      );

    return message.channel
      .send(embed)
      .catch(() => missingPerms(message, 'embed'));
  },
};

export default setup;
